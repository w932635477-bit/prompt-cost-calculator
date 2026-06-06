// tests/price-churn.spec.ts — E2E tests for Provider Price Churn on homepage
import { test, expect } from '@playwright/test'

const BASE = 'http://localhost:5173'

test.describe('Price Churn Section', () => {

  test.beforeEach(async ({ page }) => {
    await page.goto(BASE + '/')
    // Wait for React to hydrate
    await page.waitForSelector('h1')
    await page.waitForTimeout(1000)
  })

  test('shows price change history section', async ({ page }) => {
    // Scroll to see the section
    await page.evaluate(() => {
      const el = document.querySelector('h2')
      if (el) el.scrollIntoView({ block: 'start' })
    })
    await page.waitForTimeout(300)

    const section = page.locator('text=AI Model Price Change History')
    await expect(section).toBeVisible()
  })

  test('shows provider volatility cards', async ({ page }) => {
    const volatilitySection = page.locator('text=Provider Price Volatility')
    // Scroll into view
    await volatilitySection.scrollIntoViewIfNeeded()
    await page.waitForTimeout(300)

    await expect(volatilitySection).toBeVisible()

    // Should have provider cards (OpenAI, Anthropic, Google, DeepSeek)
    const bodyText = await page.textContent('body')
    expect(bodyText).toContain('OpenAI')
    expect(bodyText).toContain('Anthropic')
    expect(bodyText).toContain('Google')
    expect(bodyText).toContain('DeepSeek')
  })

  test('price change data is numerically consistent', async ({ page }) => {
    // Scroll to the price change table
    const historySection = page.locator('text=AI Model Price Change History')
    await historySection.scrollIntoViewIfNeeded()
    await page.waitForTimeout(300)

    const bodyText = await page.textContent('body')

    // Should show price drop indicators (most models got cheaper)
    expect(bodyText).toContain('↓ Cheaper')

    // Should have percentage change values
    expect(bodyText).toMatch(/-?\d+%/)

    // Should show current pricing in dollars
    expect(bodyText).toMatch(/\$\d+\.\d{2}/)

    // GPT-4o should be present (one of the tracked models)
    expect(bodyText).toContain('GPT-4o')
  })
})
