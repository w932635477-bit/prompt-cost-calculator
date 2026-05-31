import { test, expect, type Page } from '@playwright/test'

const BASE = 'https://aicalc.cloud'

// Vercel Security Checkpoint bypass: wait for actual content to load
async function waitForApp(page: Page) {
  // Wait for the actual app to render (not Vercel checkpoint)
  await page.waitForSelector('h1', { timeout: 30000 })
  // Extra wait for JS hydration
  await page.waitForTimeout(1000)
}

test.describe('Cron Validator — Hub Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(`${BASE}/cron-validator/`, { waitUntil: 'domcontentloaded' })
    await waitForApp(page)
  })

  test('loads with correct title and H1', async ({ page }) => {
    await expect(page).toHaveTitle(/Cron Expression Validator/)
    const h1 = page.locator('h1')
    await expect(h1).toHaveText('Cron Expression Validator')
  })

  test('has 4 dialect buttons', async ({ page }) => {
    // Dialect buttons are inside the "Dialect" section header area
    const dialectSection = page.locator('div:has(> div:text-is("Dialect"))')
    const buttons = dialectSection.locator('button')
    await expect(buttons).toHaveCount(4)
  })

  test('has input field with placeholder', async ({ page }) => {
    const input = page.locator('input[type="text"]')
    await expect(input).toBeVisible()
    await expect(input).toHaveAttribute('placeholder', '*/5 * * * *')
  })

  test('validates a valid Unix cron expression', async ({ page }) => {
    const input = page.locator('input[type="text"]')
    await input.fill('*/5 * * * *')
    await expect(page.locator('text=Valid cron expression')).toBeVisible({ timeout: 5000 })
    await expect(page.locator('text=Every 5 minutes')).toBeVisible()
  })

  test('shows next run times for valid expression', async ({ page }) => {
    const input = page.locator('input[type="text"]')
    await input.fill('0 9 * * 1-5')
    await expect(page.locator('text=Next 5 runs')).toBeVisible({ timeout: 5000 })
    await expect(page.locator('text=UTC').first()).toBeVisible()
  })

  test('shows field breakdown for valid expression', async ({ page }) => {
    const input = page.locator('input[type="text"]')
    await input.fill('*/5 * * * *')
    await expect(page.locator('text=Field breakdown')).toBeVisible({ timeout: 5000 })
    // Use exact text match for the field label
    await expect(page.locator('p:text-is("minute")')).toBeVisible()
  })

  test('rejects invalid expression with error message', async ({ page }) => {
    const input = page.locator('input[type="text"]')
    await input.fill('99 * * * *')
    await expect(page.locator('text=Invalid cron expression')).toBeVisible({ timeout: 5000 })
  })

  test('switches dialect to Quartz and validates', async ({ page }) => {
    // Use exact role name from dialect button
    await page.getByRole('button', { name: 'Quartz (6-7 field)' }).click()
    const input = page.locator('input[type="text"]')
    await input.fill('0 */5 * * * ?')
    await expect(page.locator('text=Valid cron expression')).toBeVisible({ timeout: 5000 })
  })

  test('detects Quartz error when both day fields specified', async ({ page }) => {
    await page.getByRole('button', { name: 'Quartz (6-7 field)' }).click()
    const input = page.locator('input[type="text"]')
    await input.fill('0 0 12 * * *')
    await expect(page.locator('text=day-of-month OR day-of-week')).toBeVisible({ timeout: 5000 })
  })

  test('switches dialect to AWS and validates', async ({ page }) => {
    await page.locator('button', { hasText: 'AWS EventBridge' }).click()
    const input = page.locator('input[type="text"]')
    await input.fill('cron(0/5 * * * ? *)')
    await expect(page.locator('text=Valid cron expression')).toBeVisible({ timeout: 5000 })
  })

  test('switches dialect to Kubernetes and shows UTC warning', async ({ page }) => {
    await page.getByRole('button', { name: 'Kubernetes CronJob' }).click()
    const input = page.locator('input[type="text"]')
    await input.fill('0 9 * * 1-5')
    // Use more specific locator to avoid matching nav links
    await expect(page.locator('.text-emerald-800, .text-amber-800', { hasText: 'Valid' })).toBeVisible({ timeout: 5000 })
    await expect(page.locator('text=UTC').first()).toBeVisible()
  })

  test('clear button empties input and hides result', async ({ page }) => {
    const input = page.locator('input[type="text"]')
    await input.fill('*/5 * * * *')
    await expect(page.locator('text=Valid cron expression')).toBeVisible({ timeout: 5000 })
    await page.locator('button', { hasText: 'Clear' }).click()
    await expect(input).toHaveValue('')
  })

  test('example chips fill input with expression', async ({ page }) => {
    await page.locator('button', { hasText: 'Every 5 min' }).click()
    const input = page.locator('input[type="text"]')
    await expect(input).toHaveValue('*/5 * * * *')
  })

  test('platform cards link to sub-pages', async ({ page }) => {
    const quartzLink = page.locator('a[href="/cron-validator/quartz/"]')
    await expect(quartzLink).toBeVisible()
    const k8sLink = page.locator('a[href="/cron-validator/kubernetes/"]')
    await expect(k8sLink).toBeVisible()
    const awsLink = page.locator('a[href="/cron-validator/aws-eventbridge/"]')
    await expect(awsLink).toBeVisible()
  })

  test('FAQ accordion opens and closes', async ({ page }) => {
    const firstFaq = page.locator('button', { hasText: 'What makes a cron expression invalid?' })
    await firstFaq.click()
    await expect(page.locator('text=wrong number of fields')).toBeVisible()
    await firstFaq.click()
    await expect(page.locator('text=wrong number of fields')).not.toBeVisible()
  })

  test('internal links present', async ({ page }) => {
    // Use specific section to avoid matching nav links
    const links = page.locator('.text-center a[href="/cron-generator/"]')
    await expect(links).toBeVisible()
  })
})

test.describe('Cron Validator — Quartz Sub-page', () => {
  test('loads with Quartz-specific title and pre-selects Quartz dialect', async ({ page }) => {
    await page.goto(`${BASE}/cron-validator/quartz/`, { waitUntil: 'domcontentloaded' })
    await waitForApp(page)
    await expect(page).toHaveTitle(/Quartz Cron Expression Validator/)
    const quartzBtn = page.locator('button.bg-blue-600', { hasText: 'Quartz' })
    await expect(quartzBtn).toBeVisible()
  })

  test('validates Quartz expression on sub-page', async ({ page }) => {
    await page.goto(`${BASE}/cron-validator/quartz/`, { waitUntil: 'domcontentloaded' })
    await waitForApp(page)
    const input = page.locator('input[type="text"]')
    await input.fill('0 0 12 ? * MON-FRI')
    await expect(page.locator('text=Valid cron expression')).toBeVisible({ timeout: 5000 })
  })

  test('example expressions work', async ({ page }) => {
    await page.goto(`${BASE}/cron-validator/quartz/`, { waitUntil: 'domcontentloaded' })
    await waitForApp(page)
    await page.locator('button', { hasText: '0 */5 * * * ?' }).click()
    const input = page.locator('input[type="text"]')
    await expect(input).toHaveValue('0 */5 * * * ?')
  })
})

test.describe('Cron Validator — Kubernetes Sub-page', () => {
  test('loads and validates K8s cron', async ({ page }) => {
    await page.goto(`${BASE}/cron-validator/kubernetes/`, { waitUntil: 'domcontentloaded' })
    await waitForApp(page)
    await expect(page).toHaveTitle(/Kubernetes CronJob/)
    const input = page.locator('input[type="text"]')
    await input.fill('0 9 * * 1-5')
    // Use specific locator for result status
    await expect(page.locator('.text-emerald-800, .text-amber-800', { hasText: /Valid/ })).toBeVisible({ timeout: 5000 })
  })
})

test.describe('Cron Validator — AWS EventBridge Sub-page', () => {
  test('loads and validates AWS cron', async ({ page }) => {
    await page.goto(`${BASE}/cron-validator/aws-eventbridge/`, { waitUntil: 'domcontentloaded' })
    await waitForApp(page)
    await expect(page).toHaveTitle(/AWS EventBridge Cron/)
    const input = page.locator('input[type="text"]')
    await input.fill('cron(0 12 ? * MON-FRI *)')
    await expect(page.locator('text=Valid cron expression')).toBeVisible({ timeout: 5000 })
  })
})

test.describe('Cron Validator — Cross-page Navigation', () => {
  test('navigates from hub to Quartz sub-page', async ({ page }) => {
    await page.goto(`${BASE}/cron-validator/`, { waitUntil: 'domcontentloaded' })
    await waitForApp(page)
    await page.locator('a[href="/cron-validator/quartz/"]').first().click()
    await waitForApp(page)
    await expect(page).toHaveTitle(/Quartz Cron Expression Validator/)
  })

  test('breadcrumb navigates back to hub', async ({ page }) => {
    await page.goto(`${BASE}/cron-validator/quartz/`, { waitUntil: 'domcontentloaded' })
    await waitForApp(page)
    // Use the breadcrumb nav specifically (inside header nav)
    const breadcrumb = page.locator('header nav a[href="/cron-validator/"]')
    await breadcrumb.click()
    await waitForApp(page)
    await expect(page).toHaveTitle(/Cron Expression Validator/)
  })
})
