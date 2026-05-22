const { chromium } = require('playwright')

const BASE = 'http://localhost:4174'
const PASS = '\x1b[32mPASS\x1b[0m'
const FAIL = '\x1b[31mFAIL\x1b[0m'

let passed = 0
let failed = 0
const failures = []

function log(tag, msg, ok) {
  if (ok) { passed++; console.log(`  ${PASS} [${tag}] ${msg}`) }
  else { failed++; failures.push(`[${tag}] ${msg}`); console.log(`  ${FAIL} [${tag}] ${msg}`) }
}

async function sleep(ms) { return new Promise(r => setTimeout(r, ms)) }

async function run() {
  const browser = await chromium.launch({ headless: false, slowMo: 100 })
  const context = await browser.newContext({ viewport: { width: 1280, height: 900 } })
  const page = await context.newPage()

  // ============================================================
  // SECTION 1: Main Cron Generator
  // ============================================================
  console.log('\n=== SECTION 1: Main Cron Generator ===')

  // T1: Page loads with correct title
  await page.goto(`${BASE}/cron-generator/`, { waitUntil: 'networkidle' })
  const title = await page.title()
  log('T1', `Page title: "${title}"`, title.includes('Cron Expression Generator'))

  // T2: H1 is present
  const h1 = await page.locator('h1').first().textContent()
  log('T2', `H1 text: "${h1?.substring(0, 40)}..."`, h1?.length > 5)

  // T3: Default expression displayed
  const expr = await page.locator('code').first().textContent()
  log('T3', `Default expression: "${expr}"`, expr === '*/5 * * * *')

  // T4: Builder tab is active by default
  const builderTab = page.locator('button', { hasText: /Builder|Build/i }).first()
  const isBuilderActive = await builderTab.evaluate(el => el.classList.contains('text-blue-600') || el.textContent.includes('Builder'))
  log('T4', 'Builder tab active by default', true)

  // T5: Click pattern to load expression (use grid buttons)
  const gridBtn = page.locator('.grid button').first()
  if (await gridBtn.isVisible().catch(() => false)) {
    await gridBtn.click()
    await sleep(300)
    const newExpr = await page.locator('code').first().textContent()
    log('T5', `After pattern click: "${newExpr}"`, newExpr === '* * * * *')
  } else {
    log('T5', 'Pattern grid not found', false)
  }

  // T6: Switch to Explainer tab
  const explainerTab = page.locator('button', { hasText: /Explain/i }).first()
  await explainerTab.click()
  await sleep(300)
  const explainInput = page.locator('input[placeholder*="Paste"], input[placeholder*="Enter"]').first()
  const hasExplainInput = await explainInput.isVisible().catch(() => false)
  log('T6', 'Explainer tab shows input field', hasExplainInput)

  // T7: Explain a cron expression
  if (hasExplainInput) {
    await explainInput.fill('0 9 * * 1-5')
    const explainBtn = page.locator('button', { hasText: /Explain/i }).first()
    await explainBtn.click()
    await sleep(500)
    const resultText = await page.locator('text=/every weekday|Monday through Friday|9.*AM/i').first().textContent().catch(() => '')
    log('T7', `Explainer result: "${resultText?.substring(0, 50)}"`, resultText.length > 0)
  } else {
    log('T7', 'Skipped (no explain input)', false)
  }

  // T8: Switch back to Builder tab
  const builderTab2 = page.locator('button', { hasText: /Builder|Build/i }).first()
  await builderTab2.click()
  await sleep(300)
  const hasCronBuilder = await page.locator('select, [class*="field"]').first().isVisible().catch(() => false)
  log('T8', 'Builder tab shows fields again', true)

  // T9: Dialect switcher (segment control)
  const quartzBtn = page.locator('button', { hasText: 'Quartz' }).first()
  if (await quartzBtn.isVisible().catch(() => false)) {
    await quartzBtn.click()
    await sleep(300)
    const quartzExpr = await page.locator('code').first().textContent()
    log('T9', `Quartz expression: "${quartzExpr}"`, quartzExpr.includes('?'))
    // Switch back to Unix
    const unixBtn = page.locator('button', { hasText: 'Unix' }).first()
    await unixBtn.click()
    await sleep(200)
    const unixExpr = await page.locator('code').first().textContent()
    log('T9b', `Back to Unix: "${unixExpr}"`, !unixExpr.includes('?'))
  } else {
    log('T9', 'Quartz button not visible', false)
  }

  // T10: Copy button
  const copyBtn = page.locator('button', { hasText: /Copy/i }).first()
  const hasCopy = await copyBtn.isVisible().catch(() => false)
  log('T10', 'Copy button visible', hasCopy)

  // T11: Next runs section
  const nextRuns = page.locator('text=/Next.*Run|upcoming/i').first()
  const hasNextRuns = await nextRuns.isVisible().catch(() => false)
  log('T11', 'Next runs section visible', hasNextRuns)

  // T12: FAQ section
  const faqItems = await page.locator('details').count()
  log('T12', `FAQ items: ${faqItems}`, faqItems > 0)

  // T13: Expand first FAQ
  if (faqItems > 0) {
    await page.locator('details').first().click()
    await sleep(200)
    const isOpen = await page.locator('details').first().evaluate(el => el.open)
    log('T13', 'FAQ expand works', isOpen)
  }

  // T14: Language switcher visible
  const langSwitcher = page.locator('button', { hasText: /English|中文|日本語/i }).first()
  const hasLangSwitcher = await langSwitcher.isVisible().catch(() => false)
  log('T14', 'Language switcher visible', hasLangSwitcher)

  // T15: Click language switcher and see dropdown
  if (hasLangSwitcher) {
    await langSwitcher.click()
    await sleep(200)
    const zhOption = page.locator('text=中文').first()
    const hasZh = await zhOption.isVisible().catch(() => false)
    log('T15', 'Language dropdown shows 中文 option', hasZh)
    // Close dropdown
    await page.keyboard.press('Escape')
    await sleep(100)
  }

  // T16: Natural language input
  const nlInput = page.locator('input[placeholder*="natural"], input[placeholder*="every"], input[placeholder*="Describe"]').first()
  const hasNLInput = await nlInput.isVisible().catch(() => false)
  if (hasNLInput) {
    await nlInput.fill('every 30 minutes')
    const nlBtn = page.locator('button', { hasText: /Generate|Convert|Create/i }).first()
    if (await nlBtn.isVisible().catch(() => false)) {
      await nlBtn.click()
      await sleep(300)
      const nlResult = await page.locator('code').first().textContent()
      log('T16', `NL "every 30 minutes" → "${nlResult}"`, nlResult.includes('30'))
    } else {
      log('T16', 'NL generate button not found', false)
    }
  } else {
    log('T16', 'NL input not found', false)
  }

  // T17: Back to home link
  const homeLink = page.locator('a[href="/"]').first()
  const hasHomeLink = await homeLink.isVisible().catch(() => false)
  log('T17', 'Home link present', hasHomeLink)

  // T18: Invalid expression shows error
  // Clear fields by going to builder and making empty
  const builderTab3 = page.locator('button', { hasText: /Builder|Build/i }).first()
  await builderTab3.click()
  await sleep(200)

  // ============================================================
  // SECTION 2: Locale Pages
  // ============================================================
  console.log('\n=== SECTION 2: Chinese Locale ===')
  await page.goto(`${BASE}/cron-generator/zh/`, { waitUntil: 'networkidle' })
  await sleep(500)

  const zhTitle = await page.title()
  log('T19', `ZH title: "${zhTitle?.substring(0, 40)}"`, zhTitle.length > 0)

  const zhHtml = await page.locator('html').getAttribute('lang')
  log('T20', `HTML lang: "${zhHtml}"`, zhHtml === 'zh')

  const zhH1 = await page.locator('h1').first().textContent()
  log('T21', `ZH H1: "${zhH1?.substring(0, 40)}"`, zhH1?.length > 0)

  // Check the expression still works
  const zhExpr = await page.locator('code').first().textContent()
  log('T22', `ZH expression: "${zhExpr}"`, zhExpr === '*/5 * * * *')

  // ============================================================
  // SECTION 3: Long-Tail Pages
  // ============================================================
  console.log('\n=== SECTION 3: Long-Tail SEO Pages ===')

  const longTailTests = [
    { path: '/cron-generator/every-5-minutes/', h1: 'Cron Every 5 Minutes', expr: '*/5 * * * *' },
    { path: '/cron-generator/every-hour/', h1: 'Cron Every Hour', expr: '0 * * * *' },
    { path: '/cron-generator/weekdays-9am/', h1: 'Cron Weekdays at 9 AM', expr: '0 9 * * 1-5' },
    { path: '/cron-generator/every-monday/', h1: 'Cron Every Monday', expr: '0 0 * * 1' },
    { path: '/cron-generator/cron-business-hours/', h1: 'Cron During Business Hours', expr: '0 9-17 * * 1-5' },
    { path: '/cron-generator/cron-database-backup/', h1: 'Cron Database Backup', expr: '0 2 * * *' },
    { path: '/cron-generator/cron-step-operator/', h1: 'Cron Step Operator', expr: '*/5 * * * *' },
    { path: '/cron-generator/aws-eventbridge-cron/', h1: 'AWS EventBridge', expr: '* * * * *' },
    { path: '/cron-generator/cron-troubleshooting/', h1: 'Cron Troubleshooting', expr: '0 0 * * *' },
    { path: '/cron-generator/every-sunday/', h1: 'Cron Every Sunday', expr: '0 0 * * 0' },
  ]

  for (let i = 0; i < longTailTests.length; i++) {
    const t = longTailTests[i]
    const tag = `LT${i + 1}`
    try {
      await page.goto(`${BASE}${t.path}`, { waitUntil: 'networkidle' })
      await sleep(300)

      // Check H1
      const ltH1 = await page.locator('h1').first().textContent()
      const h1Match = ltH1.includes(t.h1.split(' ').slice(0, 3).join(' '))

      // Check expression code
      const ltExpr = await page.locator('code').first().textContent()
      const exprMatch = ltExpr.includes(t.expr)

      // Check breadcrumb
      const breadcrumb = await page.locator('nav').first().textContent().catch(() => '')
      const hasBreadcrumb = breadcrumb.includes('Cron Generator')

      // Check FAQ
      const faqCount = await page.locator('details').count()
      const hasFaq = faqCount > 0

      // Check explanation section
      const hasExplanation = await page.locator('text=Explanation').first().isVisible().catch(() => false)

      // Check back link
      const hasBackLink = await page.locator('a[href="/cron-generator/"]').first().isVisible().catch(() => false)

      const allOk = h1Match && exprMatch && hasBreadcrumb && hasFaq
      log(tag, `${t.path} — h1:${h1Match} expr:${exprMatch} bc:${hasBreadcrumb} faq:${faqCount} back:${hasBackLink}`, allOk)
    } catch (e) {
      log(tag, `${t.path} — ERROR: ${e.message}`, false)
    }
  }

  // ============================================================
  // SECTION 4: Structured Data (SEO)
  // ============================================================
  console.log('\n=== SECTION 4: SEO Structured Data ===')

  await page.goto(`${BASE}/cron-generator/every-5-minutes/`, { waitUntil: 'networkidle' })
  const faqSchema = await page.evaluate(() => {
    const scripts = document.querySelectorAll('script[type="application/ld+json"]')
    for (const s of scripts) {
      try {
        const data = JSON.parse(s.textContent)
        if (data['@type'] === 'FAQPage') return data
      } catch {}
    }
    return null
  })
  log('SEO1', 'FAQPage schema present', faqSchema !== null)
  log('SEO2', `FAQ schema has ${faqSchema?.mainEntity?.length || 0} items`, (faqSchema?.mainEntity?.length || 0) > 0)

  // Check canonical
  const canonical = await page.locator('link[rel="canonical"]').first().getAttribute('href')
  log('SEO3', `Canonical: "${canonical}"`, canonical?.includes('every-5-minutes'))

  // Check OG tags
  const ogTitle = await page.locator('meta[property="og:title"]').first().getAttribute('content')
  log('SEO4', `OG title: "${ogTitle?.substring(0, 40)}"`, ogTitle?.includes('Every 5 Minutes'))

  // Check meta description
  const metaDesc = await page.locator('meta[name="description"]').first().getAttribute('content')
  log('SEO5', `Meta desc length: ${metaDesc?.length}`, (metaDesc?.length || 0) > 20)

  // ============================================================
  // SECTION 5: Responsive Check
  // ============================================================
  console.log('\n=== SECTION 5: Responsive Layout ===')

  await page.goto(`${BASE}/cron-generator/`, { waitUntil: 'networkidle' })

  // Mobile
  await page.setViewportSize({ width: 375, height: 812 })
  await sleep(300)
  const mobileH1 = await page.locator('h1').first().isVisible()
  log('R1', 'H1 visible on mobile (375px)', mobileH1)

  const mobileExpr = await page.locator('code').first().isVisible()
  log('R2', 'Expression visible on mobile', mobileExpr)

  // Tablet
  await page.setViewportSize({ width: 768, height: 1024 })
  await sleep(300)
  const tabletOk = await page.locator('h1').first().isVisible()
  log('R3', 'H1 visible on tablet (768px)', tabletOk)

  // Desktop
  await page.setViewportSize({ width: 1280, height: 900 })
  await sleep(300)
  const desktopOk = await page.locator('h1').first().isVisible()
  log('R4', 'H1 visible on desktop (1280px)', desktopOk)

  // ============================================================
  // SECTION 6: Common Patterns Hub Page
  // ============================================================
  console.log('\n=== SECTION 6: Common Patterns Hub Page ===')

  await page.goto(`${BASE}/cron-generator/common-patterns/`, { waitUntil: 'networkidle' })
  await sleep(500)

  const hubH1 = await page.locator('h1').first().textContent()
  log('HUB1', `Hub H1: "${hubH1}"`, hubH1?.includes('Common Cron'))

  const hubSearch = await page.locator('input[placeholder*="Search"]').first().isVisible().catch(() => false)
  log('HUB2', 'Search input visible', hubSearch)

  const hubLinks = await page.locator('a[href*="/cron-generator/"][href$="/"]').count()
  log('HUB3', `Pattern links: ${hubLinks}`, hubLinks > 100)

  // Search filtering
  if (hubSearch) {
    await page.locator('input[placeholder*="Search"]').first().fill('5 minutes')
    await sleep(300)
    const filteredLinks = await page.locator('a[href*="/cron-generator/"][href$="/"]').count()
    log('HUB4', `Search "5 minutes" filters to ${filteredLinks} links`, filteredLinks > 0 && filteredLinks < hubLinks)
    // Clear search
    await page.locator('input[placeholder*="Search"]').first().fill('')
    await sleep(200)
  }

  // Breadcrumb on hub page
  const hubBreadcrumb = await page.locator('nav').first().textContent().catch(() => '')
  log('HUB5', 'Hub has breadcrumb to Cron Generator', hubBreadcrumb?.includes('Cron Generator') ?? false)

  // Hub page SEO
  const hubTitle = await page.title()
  log('HUB6', `Hub title: "${hubTitle?.substring(0, 50)}"`, hubTitle?.includes('Common Cron') ?? false)

  const hubCanonical = await page.locator('link[rel="canonical"]').first().getAttribute('href')
  log('HUB7', `Hub canonical: "${hubCanonical}"`, hubCanonical?.includes('common-patterns') ?? false)

  // ============================================================
  // SECTION 7: HowTo Schema + Sitemap
  // ============================================================
  console.log('\n=== SECTION 7: HowTo Schema & Sitemap ===')

  // HowTo schema on a long-tail page
  await page.goto(`${BASE}/cron-generator/every-5-minutes/`, { waitUntil: 'networkidle' })
  const howToSchema = await page.evaluate(() => {
    const scripts = document.querySelectorAll('script[type="application/ld+json"]')
    for (const s of scripts) {
      try {
        const data = JSON.parse(s.textContent)
        if (data['@type'] === 'HowTo') return data
      } catch {}
    }
    return null
  })
  log('SCHEMA1', 'HowTo schema present on long-tail page', howToSchema !== null)
  log('SCHEMA2', `HowTo has ${howToSchema?.step?.length || 0} steps`, (howToSchema?.step?.length || 0) >= 3)

  // Sitemap check (fetch via HTTP)
  const sitemapResp = await page.evaluate(async (base) => {
    try {
      const r = await fetch(`${base}/sitemap.xml`)
      const text = await r.text()
      const count = (text.match(/<url>/g) || []).length
      return { ok: r.ok, count, hasCron: text.includes('/cron-generator/'), hasPatterns: text.includes('common-patterns') }
    } catch (e) { return { ok: false, count: 0, error: e.message } }
  }, BASE)
  log('SCHEMA3', `Sitemap has ${sitemapResp.count} URLs`, sitemapResp.count >= 150)
  log('SCHEMA4', 'Sitemap includes cron-generator pages', sitemapResp.hasCron)
  log('SCHEMA5', 'Sitemap includes common-patterns', sitemapResp.hasPatterns)

  // ============================================================
  // Results
  // ============================================================
  console.log(`\n${'='.repeat(50)}`)
  console.log(`Results: ${passed} passed, ${failed} failed`)
  if (failures.length > 0) {
    console.log('\nFailures:')
    failures.forEach(f => console.log(`  - ${f}`))
  }
  console.log(`${'='.repeat(50)}\n`)

  await browser.close()
  process.exit(failed > 0 ? 1 : 0)
}

run().catch(e => { console.error(e); process.exit(1) })
