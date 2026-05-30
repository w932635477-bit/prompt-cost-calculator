import { test, expect } from '@playwright/test'

const BASE = 'https://aicalc.cloud'

const PAGES = [
  '/compare/logseq-vs-obsidian/',
  '/compare/outline-vs-notion/',
  '/agent-data-access/',
]

test.describe('Production: 3 New SEO Pages', () => {
  for (const path of PAGES) {
    test(`${path} loads and works`, async ({ page }) => {
      const errors: string[] = []
      page.on('console', msg => { if (msg.type() === 'error') errors.push(msg.text()) })

      // Load page
      await page.goto(`${BASE}${path}`, { waitUntil: 'networkidle' })

      // No JS errors
      expect(errors.filter(e => !e.includes('favicon'))).toHaveLength(0)

      // H1 visible
      const h1 = page.locator('h1').first()
      await expect(h1).toBeVisible()

      // Meta tags
      const title = await page.title()
      expect(title.length).toBeGreaterThan(20)
      const desc = await page.getAttribute('meta[name="description"]', 'content')
      expect(desc!.length).toBeGreaterThan(50)

      // JSON-LD schema
      const schemas = page.locator('script[type="application/ld+json"]')
      const count = await schemas.count()
      expect(count).toBeGreaterThanOrEqual(1)

      // Canonical + OG
      const canonical = await page.getAttribute('link[rel="canonical"]', 'href')
      expect(canonical).toContain('aicalc.cloud')
      const ogTitle = await page.getAttribute('meta[property="og:title"]', 'content')
      expect(ogTitle).toBeTruthy()

      // Mobile: no overflow
      await page.setViewportSize({ width: 375, height: 812 })
      const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth)
      expect(scrollWidth).toBeLessThanOrEqual(400)
    })
  }

  test('logseq-vs-obsidian: compare table + FAQ', async ({ page }) => {
    await page.goto(`${BASE}/compare/logseq-vs-obsidian/`, { waitUntil: 'networkidle' })
    await expect(page.locator('table').first()).toBeVisible()
    await expect(page.locator('text=Logseq').first()).toBeVisible()
    await expect(page.locator('text=Obsidian').first()).toBeVisible()
    await expect(page.locator('text=Frequently Asked').first()).toBeVisible()
  })

  test('outline-vs-notion: compare table + FAQ', async ({ page }) => {
    await page.goto(`${BASE}/compare/outline-vs-notion/`, { waitUntil: 'networkidle' })
    await expect(page.locator('table').first()).toBeVisible()
    await expect(page.locator('text=Outline').first()).toBeVisible()
    await expect(page.locator('text=Notion').first()).toBeVisible()
    await expect(page.locator('text=Frequently Asked').first()).toBeVisible()
  })

  test('agent-data-access: table + checklist + timeline + FAQ', async ({ page }) => {
    await page.goto(`${BASE}/agent-data-access/`, { waitUntil: 'networkidle' })

    // Table with 5 platforms
    const rows = page.locator('table tbody tr')
    await expect(rows).toHaveCount(5)

    // Checklist toggle
    const checkBtn = page.locator('button[aria-label="Check"]').first()
    await checkBtn.click()
    await expect(page.locator('text=1/6 checked')).toBeVisible()

    // Timeline
    await expect(page.locator('text=DeepSeek data sovereignty')).toBeVisible()

    // FAQ expand
    const faqBtn = page.locator('text=Does ChatGPT use my data').first()
    await faqBtn.click()
    await expect(page.locator('text=Free ChatGPT users: yes').first()).toBeVisible()

    // Related tools
    await expect(page.locator('text=AI Agent Safety Checklist')).toBeVisible()
  })
})
