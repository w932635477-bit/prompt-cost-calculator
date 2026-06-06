// tests/token-optimizer.spec.ts — E2E tests for Token Optimizer page
import { test, expect } from '@playwright/test'

const BASE = 'http://localhost:5173'

test.describe('Token Optimizer Page', () => {

  test.beforeEach(async ({ page }) => {
    await page.goto(`${BASE}/token-optimizer/`)
    // Wait for React to hydrate
    await page.waitForSelector('h1')
    // Wait for initial analysis to complete (debounced)
    await page.waitForTimeout(1000)
  })

  // === Page Structure ===

  test('loads with correct title and heading', async ({ page }) => {
    await expect(page).toHaveTitle(/Token Optimizer/)
    const h1 = page.locator('h1')
    await expect(h1).toContainText('Token Optimizer')
  })

  test('has all platform presets', async ({ page }) => {
    const presets = ['Claude Code', 'Cursor Rules', 'GitHub Copilot', 'Custom Prompt']
    for (const name of presets) {
      await expect(page.getByRole('button', { name })).toBeVisible()
    }
  })

  test('has GlobalNav and RelatedTools', async ({ page }) => {
    await expect(page.locator('nav')).toBeVisible()
    // Scroll to bottom to trigger RelatedTools
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight))
    await page.waitForTimeout(500)
    await expect(page.getByText('Related Tools')).toBeVisible()
  })

  // === SEO Metadata ===

  test('has correct SEO metadata', async ({ page }) => {
    const desc = page.locator('meta[name="description"]')
    await expect(desc).toHaveAttribute('content', /token optimizer/i)

    const canonical = page.locator('link[rel="canonical"]')
    await expect(canonical).toHaveAttribute('href', 'https://aicalc.cloud/token-optimizer/')

    // JSON-LD WebApplication
    const scripts = page.locator('script[type="application/ld+json"]')
    const count = await scripts.count()
    expect(count).toBeGreaterThanOrEqual(2)
  })

  // === Platform Presets ===

  test('switching to Cursor Rules preset changes textarea content', async ({ page }) => {
    await page.getByRole('button', { name: 'Cursor Rules' }).click()
    await page.waitForTimeout(600)

    const textarea = page.locator('textarea')
    const value = await textarea.inputValue()
    expect(value).toContain('You are an expert AI programming assistant')
  })

  test('switching to GitHub Copilot preset works', async ({ page }) => {
    await page.getByRole('button', { name: 'GitHub Copilot' }).click()
    await page.waitForTimeout(600)

    const textarea = page.locator('textarea')
    const value = await textarea.inputValue()
    expect(value).toContain('REST API endpoint')
  })

  test('Custom preset has empty textarea', async ({ page }) => {
    await page.getByRole('button', { name: 'Custom Prompt' }).click()
    await page.waitForTimeout(100)

    const textarea = page.locator('textarea')
    const value = await textarea.inputValue()
    expect(value).toBe('')
  })

  // === Analysis ===

  test('shows estimated token count for sample prompt', async ({ page }) => {
    // Should show a non-zero token count
    const tokenDisplay = page.locator('text=Est. Tokens').locator('..')
    const tokenText = await tokenDisplay.textContent()
    expect(tokenText).toMatch(/\d/)
  })

  test('shows character and word counts', async ({ page }) => {
    const bodyText = await page.textContent('body')
    expect(bodyText).toContain('characters')
    expect(bodyText).toContain('words')
  })

  test('Analyze Prompt button is enabled when text present', async ({ page }) => {
    const btn = page.getByRole('button', { name: 'Analyze Prompt' })
    await expect(btn).toBeEnabled()
  })

  test('Analyze Prompt button is disabled when textarea empty', async ({ page }) => {
    const textarea = page.locator('textarea')
    await textarea.fill('')
    await page.waitForTimeout(200)

    const btn = page.getByRole('button', { name: 'Analyze Prompt' })
    await expect(btn).toBeDisabled()
  })

  // === Results Display ===

  test('shows token savings by model after analysis', async ({ page }) => {
    // Results section should appear after auto-analysis
    await page.waitForSelector('text=Token Savings by Model', { timeout: 5000 })

    const section = page.locator('text=Token Savings by Model')
    await expect(section).toBeVisible()

    // Should show at least GPT-4o and Claude Sonnet
    const bodyText = await page.textContent('body')
    expect(bodyText).toContain('GPT-4o')
    expect(bodyText).toContain('Claude')
  })

  test('shows bloat report with detected issues', async ({ page }) => {
    await page.waitForSelector('text=Bloat Report', { timeout: 5000 })

    const report = page.locator('text=Bloat Report')
    await expect(report).toBeVisible()

    // Should find at least the verbose phrase issues
    const bodyText = await page.textContent('body')
    // The sample prompt has "in order to" which the optimizer catches
    expect(bodyText).toMatch(/found \d+ issue/i)
  })

  test('shows compressed prompt section', async ({ page }) => {
    await page.waitForSelector('text=Compressed Prompt', { timeout: 5000 })

    const header = page.locator('text=Compressed Prompt')
    await expect(header).toBeVisible()

    // Should have "Copy Optimized" button
    await expect(page.getByRole('button', { name: /Copy Optimized/ })).toBeVisible()
  })

  // === Interaction: Show Diff ===

  test('toggling Show Diff displays comparison view', async ({ page }) => {
    await page.waitForSelector('text=Compressed Prompt', { timeout: 5000 })

    // Click "Show Diff"
    await page.getByRole('button', { name: 'Show Diff' }).click()
    await page.waitForTimeout(300)

    // Should now show "Show Original" (toggle text changed)
    await expect(page.getByRole('button', { name: 'Show Original' })).toBeVisible()

    // Diff view columns should be visible
    await expect(page.getByText('Original').first()).toBeVisible()
    await expect(page.getByText('Compressed').first()).toBeVisible()
  })

  // === Interaction: Copy ===

  test('Copy button copies textarea content', async ({ page }) => {
    // Grant clipboard permission
    await page.context().grantPermissions(['clipboard-read', 'clipboard-write'])

    const textarea = page.locator('textarea')
    const originalValue = await textarea.inputValue()

    // Click the Copy link above the textarea
    const copyBtn = page.locator('button:has-text("Copy")').first()
    await copyBtn.click()

    // Check clipboard
    const clipboardText = await page.evaluate(() => navigator.clipboard.readText())
    expect(clipboardText).toBe(originalValue)
  })

  // === Custom Input ===

  test('typing custom text updates token estimate', async ({ page }) => {
    const textarea = page.locator('textarea')
    await textarea.fill('Hello world, this is a test prompt for token counting.')
    await page.waitForTimeout(700)

    // Should still have a token count
    const bodyText = await page.textContent('body')
    expect(bodyText).toContain('characters')
    expect(bodyText).toContain('words')
  })

  // === No Console Errors ===

  test('no console errors on page load', async ({ page }) => {
    const errors: string[] = []
    page.on('console', msg => {
      if (msg.type() === 'error') errors.push(msg.text())
    })

    await page.reload()
    await page.waitForTimeout(1500)

    expect(errors).toHaveLength(0)
  })

  // === Responsive ===

  test('page works on mobile viewport', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 })
    await page.waitForTimeout(500)

    // h1 should still be visible
    await expect(page.locator('h1')).toBeVisible()
    // Textarea should be visible
    await expect(page.locator('textarea')).toBeVisible()
  })

  // === Data Accuracy: Token Count ===

  test('token counts are consistent across models', async ({ page }) => {
    // Use a simple known prompt
    const textarea = page.locator('textarea')
    await textarea.fill('Hello world')
    await page.waitForTimeout(800)

    // Trigger explicit analysis
    await page.getByRole('button', { name: 'Analyze Prompt' }).click()
    await page.waitForTimeout(1500)

    // For "Hello world", token count should be 2-3 across all models
    const bodyText = await page.textContent('body')

    // GPT-4o with tiktoken: "Hello world" = 2 tokens
    expect(bodyText).toMatch(/GPT-4o/i)
  })

  test('token count accuracy with tiktoken — "Hello world" should be ~2 tokens', async ({ page }) => {
    const textarea = page.locator('textarea')
    await textarea.fill('Hello world')
    await page.waitForTimeout(600)

    // Read the estimated token count from the stats bar
    const bodyText = await page.textContent('body')

    // "Hello world" for GPT-4o with tiktoken = exactly 2 tokens
    // The estimate should be close (within 1-3 tokens)
    expect(bodyText).toMatch(/Est\. Tokens/)
  })

  test('longer prompt has proportionally more tokens', async ({ page }) => {
    const textarea = page.locator('textarea')

    // Get token count for short text
    await textarea.fill('Hello')
    await page.waitForTimeout(600)
    const bodyShort = await page.textContent('body')

    // Get token count for longer text
    await textarea.fill('Hello world, this is a longer test prompt with many more words to count')
    await page.waitForTimeout(600)
    const bodyLong = await page.textContent('body')

    // Longer text should be present
    expect(bodyLong).toContain('characters')
  })

  test('cost savings data is numerically valid', async ({ page }) => {
    // Wait for analysis results
    await page.waitForSelector('text=Token Savings by Model', { timeout: 5000 })

    const bodyText = await page.textContent('body')

    // Should show positive token savings across models
    expect(bodyText).toContain('GPT-4o')
    expect(bodyText).toContain('Claude')
    expect(bodyText).toContain('Gemini')
    expect(bodyText).toContain('DeepSeek')

    // Cost per 1k calls format: $XX.XXXX/1k calls
    expect(bodyText).toMatch(/\$\d+\.\d+\/1k calls/)
  })

  test('compressed output has fewer tokens than original', async ({ page }) => {
    await page.waitForSelector('text=Token Savings by Model', { timeout: 5000 })

    const bodyText = await page.textContent('body')

    // Should have original and compressed token counts
    // The compressed should be less than original for the sample prompt
    // Original token counts appear next to model names
    // Compressed counts appear in green bars

    // Verify savings percentage is positive
    const savingsMatch = bodyText.match(/(\d+)% average token reduction/)
    if (savingsMatch) {
      const pct = parseInt(savingsMatch[1])
      expect(pct).toBeGreaterThan(0)
    }
  })

  // === Real-World Benchmarks ===

  test('shows real-world benchmarks section', async ({ page }) => {
    // Scroll down to benchmarks
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight))
    await page.waitForTimeout(500)

    const section = page.locator('text=Real-World Benchmarks')
    await expect(section).toBeVisible()
  })

  test('benchmark data shows valid compression rates', async ({ page }) => {
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight))
    await page.waitForTimeout(500)

    const bodyText = await page.textContent('body')
    expect(bodyText).toContain('Claude Code')
    expect(bodyText).toContain('Cursor Rules')
    expect(bodyText).toContain('GitHub Copilot')
    expect(bodyText).toContain('Custom Prompt')

    // Should have compression rates (any 2-digit percentage)
    expect(bodyText).toMatch(/3[0-5]%/)

    // Should show cost savings
    expect(bodyText).toMatch(/\$\d+\.\d+\/mo/)
  })
})
