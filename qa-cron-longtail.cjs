const { chromium } = require('playwright')
const assert = require('assert')

const BASE = 'http://localhost:4174'

const TESTS = [
  { path: '/cron-generator/every-5-minutes/', h1: 'Cron Every 5 Minutes', expression: '*/5 * * * *' },
  { path: '/cron-generator/every-hour/', h1: 'Cron Every Hour', expression: '0 * * * *' },
  { path: '/cron-generator/weekdays-9am/', h1: 'Cron Weekdays at 9 AM', expression: '0 9 * * 1-5' },
  { path: '/cron-generator/cron-step-operator/', h1: 'Cron Step Operator (*/N)', expression: '*/5 * * * *' },
  { path: '/cron-generator/cron-database-backup/', h1: 'Cron Database Backup Schedule', expression: '0 2 * * *' },
  { path: '/cron-generator/every-monday/', h1: 'Cron Every Monday', expression: '0 0 * * 1' },
  { path: '/cron-generator/first-of-month/', h1: 'Cron First Day of Every Months', expression: '0 0 1 * *' },
  { path: '/cron-generator/cron-business-hours/', h1: 'Cron During Business Hours', expression: '0 9-17 * * 1-5' },
]

async function run() {
  const browser = await chromium.launch()
  const page = await browser.newPage()
  let pass = 0
  let fail = 0

  for (const t of TESTS) {
    try {
      await page.goto(BASE + t.path, { waitUntil: 'networkidle', timeout: 10000 })

      const h1 = await page.locator('h1').first().textContent()
      assert.ok(h1.includes(t.h1.split(' ').slice(0, 3).join(' ')), `H1 mismatch: got "${h1}"`)

      const cronCode = await page.locator('code').first().textContent()
      assert.ok(cronCode.includes(t.expression), `Expression mismatch: got "${cronCode}"`)

      // Check FAQ section exists
      const faqCount = await page.locator('details').count()
      assert.ok(faqCount >= 1, 'No FAQ items found')

      // Check breadcrumb
      const breadcrumb = await page.locator('nav').first().textContent()
      assert.ok(breadcrumb.includes('Cron Generator'), 'Missing breadcrumb')

      console.log(`  PASS: ${t.path}`)
      pass++
    } catch (e) {
      console.log(`  FAIL: ${t.path} — ${e.message}`)
      fail++
    }
  }

  await browser.close()
  console.log(`\n${pass}/${pass + fail} tests passed`)
  if (fail > 0) process.exit(1)
}

run().catch(e => { console.error(e); process.exit(1) })
