import { test, expect } from '@playwright/test'

const BASE = 'http://localhost:4173'
const PAGE_URL = '/local-llm-privacy/'

test.describe('Local LLM Privacy Probe', () => {
  test('loads without JS errors', async ({ page }) => {
    const errors: string[] = []
    page.on('console', msg => { if (msg.type() === 'error') errors.push(msg.text()) })
    await page.goto(`${BASE}${PAGE_URL}`)
    await page.waitForLoadState('networkidle')
    expect(errors.filter(e => !e.includes('favicon'))).toHaveLength(0)
  })

  test('has correct title and meta', async ({ page }) => {
    await page.goto(`${BASE}${PAGE_URL}`)
    const title = await page.title()
    expect(title).toContain('Local LLM Privacy Probe')
    expect(title).toContain('Ollama')
    const desc = await page.getAttribute('meta[name="description"]', 'content')
    expect(desc).toBeTruthy()
    expect(desc!.length).toBeGreaterThan(50)
    expect(desc).toContain('telemetry')
  })

  test('has correct H1', async ({ page }) => {
    await page.goto(`${BASE}${PAGE_URL}`)
    const h1 = page.locator('h1').first()
    await expect(h1).toBeVisible()
    const text = await h1.textContent()
    expect(text).toContain('Local LLM Privacy Probe')
  })

  test('has JSON-LD schemas', async ({ page }) => {
    await page.goto(`${BASE}${PAGE_URL}`)
    const schemas = page.locator('script[type="application/ld+json"]')
    const count = await schemas.count()
    expect(count).toBeGreaterThanOrEqual(2)
    const texts = await schemas.allTextContents()
    const joined = texts.join(' ')
    expect(joined).toContain('WebApplication')
    expect(joined).toContain('FAQPage')
  })

  test('detects risks in sample Ollama config', async ({ page }) => {
    await page.goto(`${BASE}${PAGE_URL}`)
    await page.waitForLoadState('networkidle')
    // Sample is pre-loaded — should show findings
    const findings = page.locator('h2:has-text("Findings")')
    await expect(findings).toBeVisible()
    // Should have findings count > 0
    const text = await findings.textContent()
    const match = text?.match(/\((\d+)\)/)
    expect(match).toBeTruthy()
    expect(parseInt(match![1], 10)).toBeGreaterThan(0)
  })

  test('shows privacy score', async ({ page }) => {
    await page.goto(`${BASE}${PAGE_URL}`)
    await page.waitForLoadState('networkidle')
    const score = page.locator('text=Privacy Score').locator('..').locator('div').first()
    await expect(score).toBeVisible()
  })

  test('switches to LM Studio sample', async ({ page }) => {
    await page.goto(`${BASE}${PAGE_URL}`)
    await page.waitForLoadState('networkidle')
    await page.click('text=LM Studio')
    // Should detect LM Studio format
    const badge = page.locator('text=LM Studio Config')
    await expect(badge).toBeVisible()
  })

  test('clear input shows empty state', async ({ page }) => {
    await page.goto(`${BASE}${PAGE_URL}`)
    await page.waitForLoadState('networkidle')
    await page.click('text=Clear')
    const empty = page.locator('text=Paste your config to scan')
    await expect(empty).toBeVisible()
  })

  test('6 risk categories displayed', async ({ page }) => {
    await page.goto(`${BASE}${PAGE_URL}`)
    await page.waitForLoadState('networkidle')
    const categories = page.locator('h2:has-text("What We Detect")')
    await expect(categories).toBeVisible()
    // Should list all 6
    for (const cat of ['Outbound Endpoint', 'Telemetry', 'Hardcoded API Key', 'Auto-Update', 'Data Leakage', 'Insecure Setting']) {
      await expect(page.locator(`text=${cat}`).first()).toBeVisible()
    }
  })

  test('trust bar shows 0 network requests', async ({ page }) => {
    await page.goto(`${BASE}${PAGE_URL}`)
    await page.waitForLoadState('networkidle')
    const trust = page.locator('text=0 network requests')
    await expect(trust).toBeVisible()
  })

  test('FAQ section exists', async ({ page }) => {
    await page.goto(`${BASE}${PAGE_URL}`)
    await page.waitForLoadState('networkidle')
    await expect(page.locator('text=Why scan local LLM configs?')).toBeVisible()
    await expect(page.locator('text=How is the privacy score calculated?')).toBeVisible()
  })

  test('related tools link to env-scanner', async ({ page }) => {
    await page.goto(`${BASE}${PAGE_URL}`)
    await page.waitForLoadState('networkidle')
    const link = page.locator('a[href="/env-scanner/"]').last()
    await expect(link).toBeVisible()
  })
})
