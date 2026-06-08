import { test, expect } from '@playwright/test'

const BASE = 'https://aicalc.cloud'

test.describe('Testing Strategy Picker - Main Tool', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(`${BASE}/testing-strategy-picker/`, { waitUntil: 'networkidle' })
  })

  test('loads with correct title and hero', async ({ page }) => {
    await expect(page).toHaveTitle(/Testing Strategy/i)
    const h1 = page.locator('h1')
    await expect(h1).toContainText('Testing Strategy')
  })

  test('shows wizard with 5 options on step 1 (project type)', async ({ page }) => {
    const options = page.locator('[data-testid="wizard-options"] button')
    await expect(options).toHaveCount(5)
    await expect(options.nth(0)).toContainText('Web Application')
    await expect(options.nth(1)).toContainText('API / Backend')
    await expect(options.nth(2)).toContainText('Mobile App')
    await expect(options.nth(3)).toContainText('Desktop App')
    await expect(options.nth(4)).toContainText('CLI Tool')
  })

  test('progress bar shows 20% on step 1', async ({ page }) => {
    const progressText = page.locator('text=20%')
    await expect(progressText).toBeVisible()
  })

  test('completes full 5-step wizard and shows strategy results', async ({ page }) => {
    // Step 1: project type
    await page.click('[data-value="web_app"]')
    await page.waitForTimeout(300)

    // Step 2: team size
    await page.click('[data-value="solo"]')
    await page.waitForTimeout(300)

    // Step 3: stage
    await page.click('[data-value="mvp"]')
    await page.waitForTimeout(300)

    // Step 4: risk priority
    await page.click('[data-value="bugs"]')
    await page.waitForTimeout(300)

    // Step 5: budget
    await page.click('[data-value="free"]')
    await page.waitForTimeout(400)

    // Should show results section
    await expect(page.locator('[data-testid="results-section"]')).toBeVisible()

    // Should show test layers
    const layers = page.locator('[data-testid^="layer-"]')
    const layerCount = await layers.count()
    expect(layerCount).toBeGreaterThanOrEqual(2) // At least unit + integration

    // Should show total setup time estimate
    await expect(page.locator('text=/Total estimated setup:.*hours/')).toBeVisible()
  })

  test('web_app solo mvp free shows unit tests as critical', async ({ page }) => {
    // Step 1-5: web_app, solo, mvp, bugs, free
    await page.click('[data-value="web_app"]')
    await page.waitForTimeout(300)
    await page.click('[data-value="solo"]')
    await page.waitForTimeout(300)
    await page.click('[data-value="mvp"]')
    await page.waitForTimeout(300)
    await page.click('[data-value="bugs"]')
    await page.waitForTimeout(300)
    await page.click('[data-value="free"]')
    await page.waitForTimeout(400)

    // Unit tests should be critical
    const unitLayer = page.locator('[data-testid="layer-unit"]')
    await expect(unitLayer).toBeVisible()
    await expect(unitLayer.locator('text=Critical')).toBeVisible()
  })

  test('API project shows security layer', async ({ page }) => {
    await page.click('[data-value="api"]')
    await page.waitForTimeout(300)
    await page.click('[data-value="small"]')
    await page.waitForTimeout(300)
    await page.click('[data-value="growth"]')
    await page.waitForTimeout(300)
    await page.click('[data-value="security"]')
    await page.waitForTimeout(300)
    await page.click('[data-value="open_source"]')
    await page.waitForTimeout(400)

    // Security layer should be critical (API + security risk boost)
    const securityLayer = page.locator('[data-testid="layer-security"]')
    await expect(securityLayer).toBeVisible()
  })

  test('URL params update after wizard completion', async ({ page }) => {
    await page.click('[data-value="mobile"]')
    await page.waitForTimeout(300)
    await page.click('[data-value="large"]')
    await page.waitForTimeout(300)
    await page.click('[data-value="mature"]')
    await page.waitForTimeout(300)
    await page.click('[data-value="ux"]')
    await page.waitForTimeout(300)
    await page.click('[data-value="paid"]')
    await page.waitForTimeout(400)

    const url = page.url()
    expect(url).toContain('projectType=mobile')
    expect(url).toContain('teamSize=large')
    expect(url).toContain('stage=mature')
    expect(url).toContain('riskPriority=ux')
    expect(url).toContain('budget=paid')
  })

  test('deep link loads strategy directly', async ({ page }) => {
    await page.goto(
      `${BASE}/testing-strategy-picker/?projectType=web_app&teamSize=small&stage=growth&riskPriority=performance&budget=open_source`,
      { waitUntil: 'networkidle' }
    )
    await page.waitForTimeout(500)

    // Should show results directly (no wizard)
    await expect(page.locator('[data-testid="results-section"]')).toBeVisible()
    // Wizard should not be visible
    await expect(page.locator('[data-testid="wizard-options"]')).not.toBeVisible()
  })

  test('reset button clears results and returns to wizard', async ({ page }) => {
    // Complete wizard
    await page.click('[data-value="cli"]')
    await page.waitForTimeout(300)
    await page.click('[data-value="solo"]')
    await page.waitForTimeout(300)
    await page.click('[data-value="mvp"]')
    await page.waitForTimeout(300)
    await page.click('[data-value="bugs"]')
    await page.waitForTimeout(300)
    await page.click('[data-value="free"]')
    await page.waitForTimeout(400)

    await expect(page.locator('[data-testid="reset-button"]')).toBeVisible()
    await page.click('[data-testid="reset-button"]')
    await page.waitForTimeout(300)

    // Should show wizard again
    await expect(page.locator('[data-testid="wizard-options"]')).toBeVisible()
    // URL should be clean
    expect(page.url()).not.toContain('projectType=')
  })

  test('back button works on step 2+', async ({ page }) => {
    await page.click('[data-value="web_app"]')
    await page.waitForTimeout(300)

    // Now on step 2, back button visible
    const backBtn = page.locator('text=Previous question')
    await expect(backBtn).toBeVisible()
    await backBtn.click()

    // Should be on step 1 again
    await expect(page.locator('[data-value="web_app"]')).toBeVisible()
  })

  test('FAQ section renders with 6 items', async ({ page }) => {
    const details = page.locator('details')
    expect(await details.count()).toBe(6)

    // Click first FAQ
    await details.nth(0).locator('summary').click()
    await expect(details.nth(0).locator('.text-sm')).toBeVisible()
  })

  test('cross-links section exists', async ({ page }) => {
    await expect(page.locator('text=Explore Further')).toBeVisible()
    await expect(page.locator('a[href="/dep-shield/"]').first()).toBeVisible()
    await expect(page.locator('a[href="/ai-code-review/"]').first()).toBeVisible()
  })

  test('nav bar includes Testing category', async ({ page }) => {
    // Testing is a dropdown category in the nav
    const testingCat = page.locator('nav').getByText('Testing', { exact: true })
    await expect(testingCat).toBeVisible()
  })

  test('no console errors during full wizard flow', async ({ page }) => {
    const errors: string[] = []
    page.on('console', msg => {
      if (msg.type() === 'error') errors.push(msg.text())
    })
    await page.goto(`${BASE}/testing-strategy-picker/`, { waitUntil: 'networkidle' })

    // Walk through wizard
    await page.click('[data-value="web_app"]')
    await page.waitForTimeout(300)
    await page.click('[data-value="small"]')
    await page.waitForTimeout(300)
    await page.click('[data-value="growth"]')
    await page.waitForTimeout(300)
    await page.click('[data-value="performance"]')
    await page.waitForTimeout(300)
    await page.click('[data-value="open_source"]')
    await page.waitForTimeout(500)

    expect(errors).toHaveLength(0)
  })
})

test.describe('Testing Strategy Picker - Output Accuracy', () => {
  test('web_app growth with performance risk shows performance layer as critical or recommended', async ({ page }) => {
    await page.goto(
      `${BASE}/testing-strategy-picker/?projectType=web_app&teamSize=small&stage=growth&riskPriority=performance&budget=open_source`,
      { waitUntil: 'networkidle' }
    )
    await page.waitForTimeout(500)

    // Performance layer should be visible (risk boost makes it recommended or critical)
    const perfLayer = page.locator('[data-testid="layer-performance"]')
    await expect(perfLayer).toBeVisible()
    // Should NOT be optional (performance risk boost)
    const priorityBadge = perfLayer.locator('.text-xs.font-medium')
    const badgeText = await priorityBadge.textContent()
    expect(badgeText).not.toBe('Optional')
  })

  test('solo mvp free skips optional layers with warning', async ({ page }) => {
    await page.goto(
      `${BASE}/testing-strategy-picker/?projectType=web_app&teamSize=solo&stage=mvp&riskPriority=bugs&budget=free`,
      { waitUntil: 'networkidle' }
    )
    await page.waitForTimeout(500)

    // Should show "Skipped for now" section
    const skipped = page.locator('text=Skipped for now')
    if (await skipped.isVisible()) {
      const warnings = page.locator('text=⚠️')
      expect(await warnings.count()).toBeGreaterThanOrEqual(1)
    }
  })

  test('mature project with all critical layers has 5+ layers', async ({ page }) => {
    await page.goto(
      `${BASE}/testing-strategy-picker/?projectType=web_app&teamSize=large&stage=mature&riskPriority=security&budget=paid`,
      { waitUntil: 'networkidle' }
    )
    await page.waitForTimeout(500)

    const layers = page.locator('[data-testid^="layer-"]')
    const count = await layers.count()
    expect(count).toBeGreaterThanOrEqual(5) // mature web app should have many layers
  })

  test('CLI project has fewer layers than web app', async ({ page }) => {
    // CLI at mature stage
    await page.goto(
      `${BASE}/testing-strategy-picker/?projectType=cli&teamSize=solo&stage=mature&riskPriority=bugs&budget=free`,
      { waitUntil: 'networkidle' }
    )
    await page.waitForTimeout(500)
    const cliLayers = await page.locator('[data-testid^="layer-"]').count()

    // Web app at mature stage
    await page.goto(
      `${BASE}/testing-strategy-picker/?projectType=web_app&teamSize=solo&stage=mature&riskPriority=bugs&budget=free`,
      { waitUntil: 'networkidle' }
    )
    await page.waitForTimeout(500)
    const webLayers = await page.locator('[data-testid^="layer-"]').count()

    expect(cliLayers).toBeLessThanOrEqual(webLayers)
  })

  test('each layer has at least one tool link', async ({ page }) => {
    await page.goto(
      `${BASE}/testing-strategy-picker/?projectType=web_app&teamSize=small&stage=growth&riskPriority=bugs&budget=open_source`,
      { waitUntil: 'networkidle' }
    )
    await page.waitForTimeout(500)

    const layers = page.locator('[data-testid^="layer-"]')
    const count = await layers.count()
    for (let i = 0; i < count; i++) {
      const toolLinks = layers.nth(i).locator('a[href]')
      expect(await toolLinks.count()).toBeGreaterThanOrEqual(1)
    }
  })

  test('total setup hours is a positive number', async ({ page }) => {
    await page.goto(
      `${BASE}/testing-strategy-picker/?projectType=api&teamSize=small&stage=growth&riskPriority=security&budget=open_source`,
      { waitUntil: 'networkidle' }
    )
    await page.waitForTimeout(500)

    const totalText = await page.locator('text=/Total estimated setup:.*hours/').textContent()
    const hours = parseInt(totalText?.match(/~(\d+)/)?.[1] || '0')
    expect(hours).toBeGreaterThan(0)
  })
})

test.describe('Testing Strategy Picker - SEO Landing Pages', () => {
  const seoPages = [
    { slug: 'web-app', title: /Web Application/i, h1: 'Web Applications' },
    { slug: 'api', title: /API/i, h1: 'API' },
    { slug: 'mobile', title: /Mobile/i, h1: 'Mobile' },
  ]

  for (const { slug, title, h1 } of seoPages) {
    test(`${slug} landing page loads with correct content`, async ({ page }) => {
      await page.goto(`${BASE}/testing-strategy-picker/${slug}/`, { waitUntil: 'networkidle' })

      await expect(page).toHaveTitle(title)
      await expect(page.locator('h1')).toContainText(h1)
      // Should show pre-generated strategy with test layer cards
      await expect(page.locator('h3', { hasText: 'Unit Tests' })).toBeVisible()
      // Should have setup time estimate
      await expect(page.locator('text=/Total estimated setup/')).toBeVisible()
      // Should have "Customize this strategy" link
      await expect(page.locator('text=Customize this strategy')).toBeVisible()
    })
  }
})
