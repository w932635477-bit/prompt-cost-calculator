import { test, expect } from '@playwright/test'

const BASE = 'https://aicalc.cloud'

// ─── Calculator Page ─────────────────────────────────────────────────────────

test.describe('LLM Cost Calculator', () => {
  const PAGE_URL = '/llm-pricing/llm-cost-calculator/'

  test('loads without JS errors', async ({ page }) => {
    const errors: string[] = []
    page.on('console', msg => { if (msg.type() === 'error') errors.push(msg.text()) })
    await page.goto(`${BASE}${PAGE_URL}`, { waitUntil: 'networkidle' })
    expect(errors.filter(e => !e.includes('favicon'))).toHaveLength(0)
  })

  test('has correct title and meta', async ({ page }) => {
    await page.goto(`${BASE}${PAGE_URL}`, { waitUntil: 'networkidle' })
    const title = await page.title()
    expect(title).toContain('LLM Cost Calculator')
    const desc = await page.getAttribute('meta[name="description"]', 'content')
    expect(desc!.length).toBeGreaterThan(50)
    const canonical = await page.getAttribute('link[rel="canonical"]', 'href')
    expect(canonical).toBe(`${BASE}${PAGE_URL}`)
    const ogTitle = await page.getAttribute('meta[property="og:title"]', 'content')
    expect(ogTitle).toContain('LLM Cost Calculator')
  })

  test('has correct H1', async ({ page }) => {
    await page.goto(`${BASE}${PAGE_URL}`, { waitUntil: 'networkidle' })
    const h1 = page.locator('h1').first()
    await expect(h1).toBeVisible()
    const text = await h1.textContent()
    expect(text).toContain('LLM Cost Calculator')
  })

  test('has JSON-LD FAQPage schema', async ({ page }) => {
    await page.goto(`${BASE}${PAGE_URL}`, { waitUntil: 'networkidle' })
    const schemas = page.locator('script[type="application/ld+json"]')
    const count = await schemas.count()
    expect(count).toBeGreaterThanOrEqual(1)
    const texts = await schemas.allTextContents()
    const joined = texts.join(' ')
    expect(joined).toContain('FAQPage')
  })

  test('shows 19 models in cost ranking', async ({ page }) => {
    await page.goto(`${BASE}${PAGE_URL}`, { waitUntil: 'networkidle' })
    // Each ranking row has provider badge (w-9 h-9 rounded-lg)
    const badges = page.locator('div.w-9.h-9.rounded-lg')
    await expect(badges).toHaveCount(19)
  })

  test('cheapest model has green highlight', async ({ page }) => {
    await page.goto(`${BASE}${PAGE_URL}`, { waitUntil: 'networkidle' })
    const firstRow = page.locator('div.space-y-3 > div.flex.items-center').first()
    // Should have green background and ring
    const classes = await firstRow.getAttribute('class')
    expect(classes).toContain('f0fdf4')
    // Should have "Cheapest" badge
    await expect(firstRow.locator('text=Cheapest')).toBeVisible()
  })

  test('fill form: change input tokens and costs update', async ({ page }) => {
    await page.goto(`${BASE}${PAGE_URL}`, { waitUntil: 'networkidle' })

    const firstCostEl = page.locator('div.space-y-3 > div.flex.items-center').first()
    const initialCost = await firstCostEl.locator('div.font-mono.font-semibold').first().textContent()

    // Change input tokens to 100000
    const inputTokensField = page.locator('input[type="number"]').first()
    await inputTokensField.clear()
    await inputTokensField.fill('100000')
    await inputTokensField.blur()
    await page.waitForTimeout(500)

    const newCost = await firstCostEl.locator('div.font-mono.font-semibold').first().textContent()
    expect(newCost).not.toBe(initialCost)
  })

  test('fill form: change calls per day', async ({ page }) => {
    await page.goto(`${BASE}${PAGE_URL}`, { waitUntil: 'networkidle' })

    const firstCostEl = page.locator('div.space-y-3 > div.flex.items-center').first()
    const initialCost = await firstCostEl.locator('div.font-mono.font-semibold').first().textContent()

    const callsField = page.locator('input[type="number"]').nth(2)
    await callsField.clear()
    await callsField.fill('5000')
    await callsField.blur()
    await page.waitForTimeout(500)

    const newCost = await firstCostEl.locator('div.font-mono.font-semibold').first().textContent()
    expect(newCost).not.toBe(initialCost)
  })

  test('cache hit rate slider updates savings display', async ({ page }) => {
    await page.goto(`${BASE}${PAGE_URL}`, { waitUntil: 'networkidle' })

    const slider = page.locator('input[type="range"]')
    // Move to 0%
    await slider.fill('0')
    await slider.blur()
    await page.waitForTimeout(500)

    const saveTexts0 = await page.locator('text=↓ save').count()

    // Move to 90%
    await slider.fill('90')
    await slider.blur()
    await page.waitForTimeout(500)

    const saveTexts90 = await page.locator('text=↓ save').count()
    expect(saveTexts90).toBeGreaterThan(saveTexts0)
  })

  test('FAQ accordions expand and collapse', async ({ page }) => {
    await page.goto(`${BASE}${PAGE_URL}`, { waitUntil: 'networkidle' })

    const firstFaq = page.locator('details').first()
    expect(await firstFaq.getAttribute('open')).toBeNull()

    await firstFaq.locator('summary').click()
    await expect(firstFaq.locator('p')).toBeVisible()

    await firstFaq.locator('summary').click()
    await expect(firstFaq.locator('p')).not.toBeVisible()
  })

  test('How it works section visible', async ({ page }) => {
    await page.goto(`${BASE}${PAGE_URL}`, { waitUntil: 'networkidle' })
    await expect(page.locator('text=How the LLM Cost Calculator Works')).toBeVisible()
    const steps = page.locator('div.w-10.h-10.rounded-full')
    await expect(steps).toHaveCount(3)
  })

  test('no horizontal overflow on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 })
    await page.goto(`${BASE}${PAGE_URL}`, { waitUntil: 'networkidle' })
    const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth)
    expect(scrollWidth).toBeLessThanOrEqual(400)
  })
})

// ─── Comparison Page ─────────────────────────────────────────────────────────

test.describe('LLM Cost Comparison', () => {
  const PAGE_URL = '/llm-pricing/llm-cost-comparison/'

  test('loads without JS errors', async ({ page }) => {
    const errors: string[] = []
    page.on('console', msg => { if (msg.type() === 'error') errors.push(msg.text()) })
    await page.goto(`${BASE}${PAGE_URL}`, { waitUntil: 'networkidle' })
    expect(errors.filter(e => !e.includes('favicon'))).toHaveLength(0)
  })

  test('has correct title and meta', async ({ page }) => {
    await page.goto(`${BASE}${PAGE_URL}`, { waitUntil: 'networkidle' })
    const title = await page.title()
    expect(title).toContain('LLM Cost Comparison')
    const canonical = await page.getAttribute('link[rel="canonical"]', 'href')
    expect(canonical).toBe(`${BASE}${PAGE_URL}`)
  })

  test('has correct H1', async ({ page }) => {
    await page.goto(`${BASE}${PAGE_URL}`, { waitUntil: 'networkidle' })
    const h1 = page.locator('h1').first()
    await expect(h1).toBeVisible()
    const text = await h1.textContent()
    expect(text).toContain('LLM Cost Comparison')
  })

  test('shows 3 key stat cards with icons', async ({ page }) => {
    await page.goto(`${BASE}${PAGE_URL}`, { waitUntil: 'networkidle' })
    await expect(page.locator('text=Cheapest model').first()).toBeVisible()
    await expect(page.locator('text=Most expensive').first()).toBeVisible()
    await expect(page.locator('text=Price ratio').first()).toBeVisible()
    // Icons present
    await expect(page.locator('text=💰').first()).toBeVisible()
    await expect(page.locator('text=🔥').first()).toBeVisible()
    await expect(page.locator('text=📊').first()).toBeVisible()
  })

  test('shows visual ranking with 19 provider badges', async ({ page }) => {
    await page.goto(`${BASE}${PAGE_URL}`, { waitUntil: 'networkidle' })
    await expect(page.locator('text=Monthly Cost Ranking')).toBeVisible()
    const badges = page.locator('div.w-9.h-9.rounded-lg')
    await expect(badges).toHaveCount(19)
  })

  test('has 5 provider breakdown tables', async ({ page }) => {
    await page.goto(`${BASE}${PAGE_URL}`, { waitUntil: 'networkidle' })
    await expect(page.locator('text=OpenAI Models')).toBeVisible()
    await expect(page.locator('text=Anthropic Models')).toBeVisible()
    await expect(page.locator('text=Google Models')).toBeVisible()
    await expect(page.locator('text=DeepSeek Models')).toBeVisible()
    await expect(page.locator('text=Groq Models')).toBeVisible()

    const tables = page.locator('table')
    const tableCount = await tables.count()
    expect(tableCount).toBeGreaterThanOrEqual(5)
  })

  test('table contains pricing columns', async ({ page }) => {
    await page.goto(`${BASE}${PAGE_URL}`, { waitUntil: 'networkidle' })
    await expect(page.locator('th:has-text("Input $/1M")').first()).toBeVisible()
    await expect(page.locator('th:has-text("Output $/1M")').first()).toBeVisible()
    await expect(page.locator('th:has-text("Cache $/1M")').first()).toBeVisible()
    await expect(page.locator('th:has-text("Est. Monthly")').first()).toBeVisible()
  })

  test('FAQ section works', async ({ page }) => {
    await page.goto(`${BASE}${PAGE_URL}`, { waitUntil: 'networkidle' })
    const firstFaq = page.locator('details').first()
    await firstFaq.locator('summary').click()
    await expect(firstFaq.locator('p')).toBeVisible()
  })

  test('CTA links point to correct pages', async ({ page }) => {
    await page.goto(`${BASE}${PAGE_URL}`, { waitUntil: 'networkidle' })
    const calcLink = page.locator('a:has-text("Try the Cost Calculator")')
    await expect(calcLink).toHaveAttribute('href', '/llm-pricing/llm-cost-calculator/')
    const allModelsLink = page.locator('a:has-text("View All Model Prices")')
    await expect(allModelsLink).toHaveAttribute('href', '/llm-pricing/')
  })

  test('no horizontal overflow on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 })
    await page.goto(`${BASE}${PAGE_URL}`, { waitUntil: 'networkidle' })
    const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth)
    expect(scrollWidth).toBeLessThanOrEqual(400)
  })
})

// ─── Optimization Page ───────────────────────────────────────────────────────

test.describe('LLM Cost Optimization', () => {
  const PAGE_URL = '/llm-pricing/llm-cost-optimization/'

  test('loads without JS errors', async ({ page }) => {
    const errors: string[] = []
    page.on('console', msg => { if (msg.type() === 'error') errors.push(msg.text()) })
    await page.goto(`${BASE}${PAGE_URL}`, { waitUntil: 'networkidle' })
    expect(errors.filter(e => !e.includes('favicon'))).toHaveLength(0)
  })

  test('has correct title and meta', async ({ page }) => {
    await page.goto(`${BASE}${PAGE_URL}`, { waitUntil: 'networkidle' })
    const title = await page.title()
    expect(title).toContain('LLM Cost Optimization')
    const canonical = await page.getAttribute('link[rel="canonical"]', 'href')
    expect(canonical).toBe(`${BASE}${PAGE_URL}`)
  })

  test('has correct H1', async ({ page }) => {
    await page.goto(`${BASE}${PAGE_URL}`, { waitUntil: 'networkidle' })
    const h1 = page.locator('h1').first()
    await expect(h1).toBeVisible()
    const text = await h1.textContent()
    expect(text).toContain('LLM Cost Optimization')
  })

  test('shows cheapest model grid with provider badges', async ({ page }) => {
    await page.goto(`${BASE}${PAGE_URL}`, { waitUntil: 'networkidle' })
    await expect(page.locator('text=Cheapest Models by Provider')).toBeVisible()
    // 5 provider cards in the grid
    const cards = page.locator('div.grid-cols-2 > div')
    await expect(cards).toHaveCount(5)
  })

  test('shows all 7 strategies', async ({ page }) => {
    await page.goto(`${BASE}${PAGE_URL}`, { waitUntil: 'networkidle' })
    await expect(page.locator('h3:has-text("Enable Prompt Caching")')).toBeVisible()
    await expect(page.locator('h3:has-text("Route Simple Queries")')).toBeVisible()
    await expect(page.locator('h3:has-text("Reduce Output Token")')).toBeVisible()
    await expect(page.locator('h3:has-text("Batch Your API")')).toBeVisible()
    await expect(page.locator('h3:has-text("Compress Your Prompts")')).toBeVisible()
    await expect(page.locator('h3:has-text("Provider-Specific Pricing")')).toBeVisible()
    await expect(page.locator('h3:has-text("Monitor and Set Budget")')).toBeVisible()
  })

  test('first 2 strategies are expanded by default', async ({ page }) => {
    await page.goto(`${BASE}${PAGE_URL}`, { waitUntil: 'networkidle' })
    const details = page.locator('details')
    const open0 = await details.nth(0).getAttribute('open')
    const open1 = await details.nth(1).getAttribute('open')
    const open2 = await details.nth(2).getAttribute('open')
    expect(open0).not.toBeNull()
    expect(open1).not.toBeNull()
    expect(open2).toBeNull()
  })

  test('strategies expand to show real examples', async ({ page }) => {
    await page.goto(`${BASE}${PAGE_URL}`, { waitUntil: 'networkidle' })
    const thirdStrategy = page.locator('details').nth(2)
    await thirdStrategy.locator('summary').click()
    await expect(thirdStrategy.locator('text=Real example')).toBeVisible()
  })

  test('before vs after card visible with stronger styling', async ({ page }) => {
    await page.goto(`${BASE}${PAGE_URL}`, { waitUntil: 'networkidle' })
    await expect(page.locator('text=Before vs After Optimization')).toBeVisible()
    // Red before section
    await expect(page.locator('text=~$4,500')).toBeVisible()
    // Green after section
    await expect(page.locator('text=~$1,800')).toBeVisible()
    // Prominent 60% badge
    await expect(page.locator('text=60% cost reduction')).toBeVisible()
  })

  test('FAQ section works', async ({ page }) => {
    await page.goto(`${BASE}${PAGE_URL}`, { waitUntil: 'networkidle' })
    const faqSection = page.locator('h2:has-text("FAQ")').locator('..')
    const firstFaq = faqSection.locator('details').first()
    await firstFaq.locator('summary').click()
    await expect(firstFaq.locator('p')).toBeVisible()
  })

  test('CTA links correct', async ({ page }) => {
    await page.goto(`${BASE}${PAGE_URL}`, { waitUntil: 'networkidle' })
    const calcLink = page.locator('a:has-text("Calculate Your Savings")')
    await expect(calcLink).toHaveAttribute('href', '/llm-pricing/llm-cost-calculator/')
    const compareLink = page.locator('a:has-text("Compare All Models")')
    await expect(compareLink).toHaveAttribute('href', '/llm-pricing/llm-cost-comparison/')
  })

  test('no horizontal overflow on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 })
    await page.goto(`${BASE}${PAGE_URL}`, { waitUntil: 'networkidle' })
    const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth)
    expect(scrollWidth).toBeLessThanOrEqual(400)
  })
})

// ─── Cross-page navigation ───────────────────────────────────────────────────

test.describe('Cross-page navigation', () => {
  test('calculator page links to hub via CTA', async ({ page }) => {
    await page.goto(`${BASE}/llm-pricing/llm-cost-calculator/`, { waitUntil: 'networkidle' })
    await page.locator('a:has-text("Compare All LLM Prices")').click()
    await page.waitForLoadState('networkidle')
    expect(page.url()).toContain('/llm-pricing/')
  })

  test('breadcrumb "All Models" links back to hub', async ({ page }) => {
    await page.goto(`${BASE}/llm-pricing/llm-cost-calculator/`, { waitUntil: 'networkidle' })
    const link = page.locator('a:has-text("All Models")')
    await expect(link).toHaveAttribute('href', '/llm-pricing/')
  })

  test('optimization → calculator → comparison flow works', async ({ page }) => {
    await page.goto(`${BASE}/llm-pricing/llm-cost-optimization/`, { waitUntil: 'networkidle' })
    await page.locator('a:has-text("Calculate Your Savings")').click()
    await page.waitForLoadState('networkidle')
    expect(page.url()).toContain('/llm-cost-calculator/')

    await page.goto(`${BASE}/llm-pricing/llm-cost-comparison/`, { waitUntil: 'networkidle' })
    const title = await page.title()
    expect(title).toContain('LLM Cost Comparison')
  })
})
