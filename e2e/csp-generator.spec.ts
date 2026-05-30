import { test, expect } from '@playwright/test'

const BASE = 'http://localhost:4173'
const PAGE_URL = '/csp-generator/'

test.describe('CSP Generator — SEO', () => {
  test('loads without JS errors', async ({ page }) => {
    const errors: string[] = []
    page.on('console', msg => { if (msg.type() === 'error') errors.push(msg.text()) })
    await page.goto(`${BASE}${PAGE_URL}`)
    await page.waitForLoadState('networkidle')
    expect(errors.filter(e => !e.includes('favicon'))).toHaveLength(0)
  })

  test('has correct title and meta description', async ({ page }) => {
    await page.goto(`${BASE}${PAGE_URL}`)
    const title = await page.title()
    expect(title).toContain('Content Security Policy')
    expect(title).toContain('CSP')
    const desc = await page.getAttribute('meta[name="description"]', 'content')
    expect(desc).toBeTruthy()
    expect(desc!.length).toBeGreaterThan(50)
    expect(desc).toContain('Content-Security-Policy')
  })

  test('has correct H1', async ({ page }) => {
    await page.goto(`${BASE}${PAGE_URL}`)
    const h1 = page.locator('h1').first()
    await expect(h1).toBeVisible()
    const text = await h1.textContent()
    expect(text).toContain('CSP Header Generator')
  })

  test('has JSON-LD schemas (WebApplication + FAQPage)', async ({ page }) => {
    await page.goto(`${BASE}${PAGE_URL}`)
    const schemas = page.locator('script[type="application/ld+json"]')
    const count = await schemas.count()
    expect(count).toBeGreaterThanOrEqual(2)
    const texts = await schemas.allTextContents()
    const joined = texts.join(' ')
    expect(joined).toContain('WebApplication')
    expect(joined).toContain('FAQPage')
    expect(joined).toContain('CSP Header Generator')
  })

  test('has OG tags and canonical URL', async ({ page }) => {
    await page.goto(`${BASE}${PAGE_URL}`)
    const ogTitle = await page.getAttribute('meta[property="og:title"]', 'content')
    expect(ogTitle).toContain('CSP')
    const ogDesc = await page.getAttribute('meta[property="og:description"]', 'content')
    expect(ogDesc).toBeTruthy()
    const canonical = await page.getAttribute('link[rel="canonical"]', 'href')
    expect(canonical).toBe('https://aicalc.cloud/csp-generator/')
  })

  test('has trailing slash URL', async ({ page }) => {
    await page.goto(`${BASE}${PAGE_URL}`)
    const url = page.url()
    expect(url.endsWith('/')).toBe(true)
  })

  test('no horizontal overflow on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 })
    await page.goto(`${BASE}${PAGE_URL}`)
    const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth)
    expect(scrollWidth).toBeLessThanOrEqual(400)
  })
})

test.describe('CSP Generator — Functional', () => {
  test('shows default header with default-src', async ({ page }) => {
    await page.goto(`${BASE}${PAGE_URL}`)
    const preview = page.locator('[data-testid="preview-card"]')
    await expect(preview).toBeVisible()
    const text = await preview.textContent()
    expect(text).toContain('default-src')
    expect(text).toContain("'self'")
  })

  test('preset buttons update the preview', async ({ page }) => {
    await page.goto(`${BASE}${PAGE_URL}`)
    await page.locator('[data-testid="presets"] >> text=Strict').first().click()
    const preview = page.locator('[data-testid="preview-card"]')
    const text = await preview.textContent()
    expect(text).toContain("'none'")
  })

  test('copy button changes to Copied state', async ({ page, context }) => {
    await context.grantPermissions(['clipboard-read', 'clipboard-write'])
    await page.goto(`${BASE}${PAGE_URL}`)
    const btn = page.locator('[data-testid="copy-btn"]')
    await expect(btn).toBeVisible()
    await btn.click()
    await expect(btn).toContainText('Copied!')
  })

  test('Report-Only toggle changes header name', async ({ page }) => {
    await page.goto(`${BASE}${PAGE_URL}`)
    const toggles = page.locator('button[role="switch"]')
    const count = await toggles.count()
    for (let i = 0; i < count; i++) {
      const parent = toggles.nth(i).locator('..')
      const text = await parent.textContent()
      if (text?.includes('Report-Only')) {
        await toggles.nth(i).click()
        break
      }
    }
    const preview = page.locator('[data-testid="preview-card"]')
    const text = await preview.textContent()
    expect(text).toContain('Content-Security-Policy-Report-Only')
  })

  test('enabling script-src directive adds it to preview', async ({ page }) => {
    await page.goto(`${BASE}${PAGE_URL}`)
    const scriptCheckbox = page.locator('input[type="checkbox"]').nth(1)
    await scriptCheckbox.check()
    const preview = page.locator('[data-testid="preview-card"]')
    const text = await preview.textContent()
    expect(text).toContain('script-src')
  })

  test('FAQ section expands', async ({ page }) => {
    await page.goto(`${BASE}${PAGE_URL}`)
    const firstFaq = page.locator('details').first()
    await firstFaq.locator('summary').click()
    const answer = firstFaq.locator('p')
    await expect(answer).toBeVisible()
  })
})
