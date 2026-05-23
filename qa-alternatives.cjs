const { chromium } = require('playwright')
const assert = require('assert')

const BASE = 'https://prompt-cost-calculator-ten.vercel.app'

const TESTS = [
  // Main page
  { path: '/alternatives/', check: 'main-page' },
  // High-traffic detail pages
  { path: '/alternatives/slack/', check: 'detail', h1: 'Self-Hosted Slack Alternatives', altNames: ['Mattermost', 'Rocket.Chat', 'Element'] },
  { path: '/alternatives/notion/', check: 'detail', h1: 'Self-Hosted Notion Alternatives', altNames: ['AppFlowy', 'Outline', 'Logseq'] },
  { path: '/alternatives/google-drive/', check: 'detail', h1: 'Self-Hosted Google Drive Alternatives', altNames: ['Nextcloud', 'ownCloud', 'Seafile'] },
  { path: '/alternatives/github/', check: 'detail', h1: 'Self-Hosted GitHub Alternatives', altNames: ['Gitea', 'GitLab CE', 'Forgejo'] },
  { path: '/alternatives/spotify/', check: 'detail', h1: 'Self-Hosted Spotify Alternatives', altNames: ['Navidrome', 'Jellyfin', 'Ampache'] },
  { path: '/alternatives/netflix/', check: 'detail', h1: 'Self-Hosted Netflix Alternatives', altNames: ['Jellyfin', 'Plex', 'Emby'] },
  // Lower traffic but important categories
  { path: '/alternatives/lastpass/', check: 'detail', h1: 'Self-Hosted LastPass Alternatives' },
  { path: '/alternatives/jira/', check: 'detail', h1: 'Self-Hosted Jira Alternatives' },
  { path: '/alternatives/google-analytics/', check: 'detail', h1: 'Self-Hosted Google Analytics Alternatives' },
  { path: '/alternatives/zoom/', check: 'detail', h1: 'Self-Hosted Zoom Alternatives' },
  { path: '/alternatives/zapier/', check: 'detail', h1: 'Self-Hosted Zapier Alternatives' },
]

async function run() {
  const browser = await chromium.launch({ headless: true })
  const page = await browser.newPage({ viewport: { width: 1280, height: 900 } })
  let pass = 0
  let fail = 0

  console.log(`Testing ${TESTS.length} pages against ${BASE}\n`)

  for (const t of TESTS) {
    try {
      const res = await page.goto(BASE + t.path, { waitUntil: 'networkidle', timeout: 15000 })

      // 1. HTTP status
      assert.ok(res.status() === 200, `HTTP ${res.status()}`)

      // 2. No console errors
      const errors = []
      page.on('console', msg => { if (msg.type() === 'error') errors.push(msg.text()) })
      await page.waitForTimeout(500)
      assert.ok(errors.length === 0, `Console errors: ${errors.join('; ')}`)

      // 3. Tailwind CSS loaded (check for computed styles)
      const bgColor = await page.evaluate(() => {
        return window.getComputedStyle(document.body).backgroundColor
      })
      assert.ok(bgColor !== 'rgba(0, 0, 0, 0)' && bgColor !== 'transparent',
        `CSS not loaded — body background is ${bgColor}`)

      if (t.check === 'main-page') {
        // Main page checks
        const h1 = await page.locator('h1').first().textContent()
        assert.ok(h1.includes('Self-Hosted Alternatives'), `H1: "${h1}"`)

        // Cards visible
        const cards = await page.locator('a[href*="/alternatives/"]').count()
        assert.ok(cards >= 30, `Expected 30+ cards, got ${cards}`)

        // Search input functional
        const searchInput = page.locator('input[type="text"]')
        await searchInput.fill('Slack')
        await page.waitForTimeout(300)
        const visibleCards = await page.locator('a[href*="/alternatives/"]').count()
        assert.ok(visibleCards >= 1 && visibleCards < 5, `Search "Slack" should show 1-4 results, got ${visibleCards}`)

        // Clear search
        await searchInput.fill('')
        const allCards = await page.locator('a[href*="/alternatives/"]').count()
        assert.ok(allCards >= 30, `After clear: expected 30+ cards, got ${allCards}`)

        console.log(`  ✓ ${t.path} — main page (HTTP 200, CSS, ${cards} cards, search works)`)
      } else {
        // Detail page checks
        const h1 = await page.locator('h1').first().textContent()
        assert.ok(h1.includes(t.h1.split(' ').slice(0, 3).join(' ')), `H1 mismatch: "${h1}"`)

        // Breadcrumb
        const breadcrumb = await page.locator('nav[aria-label="Breadcrumb"]').count()
        assert.ok(breadcrumb === 1, 'Missing breadcrumb nav')

        // FAQ section
        const faq = await page.locator('h2').filter({ hasText: 'Frequently Asked' }).count()
        assert.ok(faq === 1, 'Missing FAQ section')

        // Comparison table
        const table = await page.locator('table').count()
        assert.ok(table === 1, 'Missing comparison table')

        // Alternative names present
        if (t.altNames) {
          const bodyText = await page.locator('body').textContent()
          for (const name of t.altNames) {
            assert.ok(bodyText.includes(name), `Missing alternative: ${name}`)
          }
        }

        // Related alternatives section (if applicable)
        const related = await page.locator('h2').filter({ hasText: 'Related' }).count()

        // Copy button for Docker commands
        const dockerCmd = await page.locator('code').filter({ hasText: 'docker run' }).count()
        if (dockerCmd > 0) {
          const copyBtn = await page.locator('button').filter({ hasText: 'Copy' }).count()
          assert.ok(copyBtn >= 1, 'Docker command present but no Copy button')
        }

        console.log(`  ✓ ${t.path} — detail (${t.h1.split(' ').slice(0, 3).join(' ')}${related ? ', related links' : ''}${dockerCmd ? ', Docker copy' : ''})`)
      }

      pass++
    } catch (e) {
      console.log(`  ✗ ${t.path} — ${e.message}`)
      fail++
    }
  }

  // Mobile responsive check on main page
  try {
    await page.setViewportSize({ width: 375, height: 812 })
    await page.goto(BASE + '/alternatives/', { waitUntil: 'networkidle', timeout: 10000 })
    const cards = await page.locator('a[href*="/alternatives/"]').count()
    assert.ok(cards >= 30, `Mobile: expected 30+ cards, got ${cards}`)
    console.log(`  ✓ Mobile (375px) — ${cards} cards visible`)
    pass++
  } catch (e) {
    console.log(`  ✗ Mobile responsive — ${e.message}`)
    fail++
  }

  await browser.close()
  console.log(`\n${'='.repeat(40)}`)
  console.log(`Results: ${pass} passed, ${fail} failed`)
  console.log(`${'='.repeat(40)}`)
  process.exit(fail > 0 ? 1 : 0)
}

run().catch(e => { console.error(e); process.exit(1) })
