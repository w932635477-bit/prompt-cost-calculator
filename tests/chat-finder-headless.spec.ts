import { test, expect } from '@playwright/test'

const BASE = 'https://aicalc.cloud'

test.describe('Chat Finder - Wizard Flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(`${BASE}/finder/chat/`, { waitUntil: 'networkidle' })
  })

  test('loads with correct title and hero', async ({ page }) => {
    await expect(page).toHaveTitle(/Self-Hosted.*Chat|Team Chat/i)
    const h1 = page.locator('h1')
    await expect(h1).toContainText('Self-Hosted Team Chat')
  })

  test('shows wizard with 4 options on step 1', async ({ page }) => {
    const options = page.locator('[data-testid="wizard-options"] button')
    await expect(options).toHaveCount(4)
    await expect(options.nth(0)).toContainText('Solo or duo')
    await expect(options.nth(1)).toContainText('Small team')
    await expect(options.nth(2)).toContainText('Large team')
    await expect(options.nth(3)).toContainText('Enterprise')
  })

  test('completes full 4-step wizard and shows 3 recommendations', async ({ page }) => {
    // Step 1: team
    await page.click('[data-value="small_team"]')
    await page.waitForTimeout(300)

    // Step 2: style
    await page.click('[data-value="threaded"]')
    await page.waitForTimeout(300)

    // Step 3: priority
    await page.click('[data-value="privacy"]')
    await page.waitForTimeout(300)

    // Step 4: deploy
    await page.click('[data-value="docker"]')
    await page.waitForTimeout(400)

    // Should show 3 recommendation cards
    const cards = page.locator('[data-testid^="rec-card-"]')
    await expect(cards).toHaveCount(3)
    // Rank badge contains the number
    await expect(cards.nth(0).locator('span[aria-label^="Rank"]')).toHaveText('1')
    await expect(cards.nth(1).locator('span[aria-label^="Rank"]')).toHaveText('2')
    await expect(cards.nth(2).locator('span[aria-label^="Rank"]')).toHaveText('3')

    // Each card should have dimension scores
    const bars = page.locator('.bg-\\[\\#f5f5f7\\].rounded-full.h-1\\.5')
    expect(await bars.count()).toBeGreaterThanOrEqual(12) // 3 cards × 4 dimensions
  })

  test('URL params update after wizard completion', async ({ page }) => {
    await page.click('[data-value="enterprise"]')
    await page.waitForTimeout(300)
    await page.click('[data-value="real_time"]')
    await page.waitForTimeout(300)
    await page.click('[data-value="features"]')
    await page.waitForTimeout(300)
    await page.click('[data-value="kubernetes"]')
    await page.waitForTimeout(400)

    const url = page.url()
    expect(url).toContain('team=enterprise')
    expect(url).toContain('style=real_time')
    expect(url).toContain('priority=features')
    expect(url).toContain('deploy=kubernetes')
  })

  test('deep link loads recommendations directly', async ({ page }) => {
    await page.goto(`${BASE}/finder/chat/?team=solo&style=real_time&priority=simplicity&deploy=docker`, { waitUntil: 'networkidle' })
    await page.waitForTimeout(500)

    const cards = page.locator('[data-testid^="rec-card-"]')
    await expect(cards).toHaveCount(3)
  })

  test('reset button clears results and returns to wizard', async ({ page }) => {
    await page.click('[data-value="solo"]')
    await page.waitForTimeout(300)
    await page.click('[data-value="real_time"]')
    await page.waitForTimeout(300)
    await page.click('[data-value="simplicity"]')
    await page.waitForTimeout(300)
    await page.click('[data-value="docker"]')
    await page.waitForTimeout(400)

    await expect(page.locator('[data-testid="reset-button"]')).toBeVisible()
    await page.click('[data-testid="reset-button"]')
    await page.waitForTimeout(300)

    // Should show wizard again
    await expect(page.locator('[data-testid="wizard-options"]')).toBeVisible()
    // URL should be clean
    expect(page.url()).not.toContain('team=')
  })

  test('back button works on step 2+', async ({ page }) => {
    await page.click('[data-value="solo"]')
    await page.waitForTimeout(300)

    // Now on step 2, back button visible
    const backBtn = page.locator('text=Previous question')
    await expect(backBtn).toBeVisible()
    await backBtn.click()

    // Should be on step 1 again
    await expect(page.locator('[data-value="solo"]')).toBeVisible()
  })

  test('Docker compose copy button exists', async ({ page }) => {
    await page.click('[data-value="solo"]')
    await page.waitForTimeout(300)
    await page.click('[data-value="real_time"]')
    await page.waitForTimeout(300)
    await page.click('[data-value="simplicity"]')
    await page.waitForTimeout(300)
    await page.click('[data-value="docker"]')
    await page.waitForTimeout(400)

    // At least one "Copy" button for docker compose
    const copyButtons = page.locator('text=Copy')
    expect(await copyButtons.count()).toBeGreaterThanOrEqual(1)
  })

  test('FAQ section renders', async ({ page }) => {
    const details = page.locator('details')
    expect(await details.count()).toBeGreaterThanOrEqual(5)

    // Click first FAQ
    await details.nth(0).locator('summary').click()
    await expect(details.nth(0).locator('.text-sm')).toBeVisible()
  })

  test('cross-links section exists', async ({ page }) => {
    await expect(page.locator('text=Explore Further')).toBeVisible()
    await expect(page.locator('a[href="/alternatives/slack/"]')).toBeVisible()
    await expect(page.locator('a[href="/alternatives/discord/"]')).toBeVisible()
    await expect(page.locator('a[href="/compare/zulip-vs-mattermost/"]')).toBeVisible()
  })

  test('no console errors on page', async ({ page }) => {
    const errors: string[] = []
    page.on('console', msg => {
      if (msg.type() === 'error') errors.push(msg.text())
    })
    await page.goto(`${BASE}/finder/chat/`, { waitUntil: 'networkidle' })
    await page.waitForTimeout(1000)

    // Walk through wizard
    await page.click('[data-value="large_team"]')
    await page.waitForTimeout(300)
    await page.click('[data-value="voice_first"]')
    await page.waitForTimeout(300)
    await page.click('[data-value="features"]')
    await page.waitForTimeout(300)
    await page.click('[data-value="managed"]')
    await page.waitForTimeout(500)

    expect(errors).toHaveLength(0)
  })
})

test.describe('Chat Finder - Compare Pages', () => {
  const comparePages = [
    'zulip-vs-mattermost',
    'zulip-vs-rocketchat',
    'mattermost-vs-rocketchat',
    'element-vs-zulip',
    'revolt-vs-element',
  ]

  for (const slug of comparePages) {
    test(`${slug} loads correctly`, async ({ page }) => {
      await page.goto(`${BASE}/compare/${slug}/`, { waitUntil: 'networkidle' })

      // Title should contain "vs"
      const title = await page.title()
      expect(title.toLowerCase()).toContain('vs')

      // Should have feature comparison table
      const body = page.locator('body')
      await expect(body).toBeVisible()
    })
  }
})
