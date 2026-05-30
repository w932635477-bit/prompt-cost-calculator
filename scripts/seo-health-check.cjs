const fs = require('fs')
const path = require('path')
const { execSync } = require('child_process')

const BASE = 'https://aicalc.cloud'

// All 9 project hubs + key sub-pages
const PAGES = [
  // 1. AI Cost Calculator (homepage)
  { url: '/', name: 'AI Cost Calculator (Home)', check: { h1: 'AI', hasNav: true } },
  // 2. Cron Generator
  { url: '/cron-generator/', name: 'Cron Generator', check: { h1: 'Cron', hasNav: true } },
  { url: '/cron-generator/common-patterns/', name: 'Cron Common Patterns', check: { hasTitle: true } },
  { url: '/cron-generator/zh/', name: 'Cron (Chinese)', check: { hasTitle: true } },
  // 3. Self-Hosted Alternatives
  { url: '/alternatives/', name: 'Self-Hosted Alternatives', check: { h1: 'Alternative', hasNav: true } },
  // 4. VS Compare
  { url: '/compare/', name: 'Compare Hub', check: { h1: 'Compar', hasNav: true } },
  { url: '/compare/jellyfin-vs-plex/', name: 'Compare: Jellyfin vs Plex', check: { hasTitle: true } },
  { url: '/compare/obsidian-vs-notion/', name: 'Compare: Obsidian vs Notion', check: { hasTitle: true } },
  // 5. Docker Deploy
  { url: '/deploy/', name: 'Docker Deploy Hub', check: { hasTitle: true, hasNav: true } },
  // 6. Token Tracker
  { url: '/token-tracker/', name: 'Token Tracker Hub', check: { h1: 'Token', hasNav: true } },
  { url: '/token-tracker/chatbot-cost/', name: 'Token Tracker: Chatbot', check: { hasTitle: true } },
  { url: '/token-tracker/rag-cost/', name: 'Token Tracker: RAG', check: { hasTitle: true } },
  // 7. Voice Agent Pricing
  { url: '/voice-agent-pricing/', name: 'Voice Agent Pricing', check: { hasTitle: true, hasNav: true } },
  // 8. Agent Safety
  { url: '/agent-safety/', name: 'Agent Safety', check: { hasTitle: true, hasNav: true } },
]

// Sitemap check
const SITEMAP_URL = `${BASE}/sitemap.xml`

let pass = 0, fail = 0, warn = 0
const bugs = []

function check(ok, msg) {
  if (ok) { pass++; console.log(`  ✓ ${msg}`) }
  else { fail++; bugs.push(msg); console.log(`  ✗ ${msg}`) }
}

function warnMsg(msg) {
  warn++; console.log(`  ⚠ ${msg}`)
}

function fetchPage(url) {
  try {
    const result = execSync(`curl -s -o /tmp/seo-check-body.txt -w "%{http_code}|%{size_download}|%{time_total}" --connect-timeout 10 --max-time 15 "${url}"`, { encoding: 'utf-8' })
    const [code, size, time] = result.trim().split('|')
    const body = fs.readFileSync('/tmp/seo-check-body.txt', 'utf-8')
    return { code: parseInt(code), size: parseInt(size), time: parseFloat(time), body }
  } catch (e) {
    return { code: 0, size: 0, time: 0, body: '', error: e.message }
  }
}

function checkSeoMeta(body, url) {
  const titleMatch = body.match(/<title>([^<]+)<\/title>/)
  const descMatch = body.match(/<meta\s+name="description"\s+content="([^"]+)"/)
  const canonicalMatch = body.match(/<link\s+rel="canonical"\s+href="([^"]+)"/)
  const ogTitleMatch = body.match(/<meta\s+property="og:title"\s+content="([^"]+)"/)

  const issues = []
  if (!titleMatch) issues.push('missing <title>')
  else if (titleMatch[1].trim().length < 10) issues.push(`short title: "${titleMatch[1].trim()}"`)

  if (!descMatch) issues.push('missing meta description')

  if (!canonicalMatch) issues.push('missing canonical')
  else if (canonicalMatch[1] !== `${BASE}${url}` && canonicalMatch[1] !== url) {
    issues.push(`canonical mismatch: ${canonicalMatch[1]}`)
  }

  if (!ogTitleMatch) issues.push('missing og:title')

  return issues
}

// ===== RUN =====
console.log(`\n${'═'.repeat(60)}`)
console.log(`SEO Health Check — ${BASE}`)
console.log(`${'═'.repeat(60)}\n`)

// 1. Sitemap check
console.log('=== SITEMAP ===')
const sitemap = fetchPage(SITEMAP_URL)
check(sitemap.code === 200, `Sitemap HTTP ${sitemap.code} (${(sitemap.size / 1024).toFixed(1)} KB)`)
const urlCount = (sitemap.body.match(/<loc>/g) || []).length
check(urlCount >= 200, `Sitemap has ${urlCount} URLs (expect 200+)`)

// Check all 9 project hubs are in sitemap
const HUBS = ['/', '/cron-generator/', '/alternatives/', '/compare/', '/deploy/', '/token-tracker/', '/voice-agent-pricing/', '/agent-safety/', '/cron-generator/common-patterns/']
console.log('\n=== ALL 9 PROJECTS IN SITEMAP ===')
for (const hub of HUBS) {
  const fullUrl = `${BASE}${hub}`
  check(sitemap.body.includes(fullUrl), `Sitemap contains: ${hub}`)
}

// 2. Page checks
console.log('\n=== PAGE HEALTH CHECKS ===')
for (const page of PAGES) {
  console.log(`\n--- ${page.name} (${page.url}) ---`)
  const res = fetchPage(`${BASE}${page.url}`)

  check(res.code === 200, `HTTP ${res.code} (${res.time.toFixed(1)}s, ${(res.size / 1024).toFixed(1)} KB)`)

  if (res.code !== 200) continue

  // Title check
  if (page.check.hasTitle) {
    check(res.body.includes('<title>'), 'Has <title> tag')
  }

  // H1 check
  if (page.check.h1) {
    const h1Match = res.body.match(/<h1[^>]*>([^<]+)</)
    check(h1Match && h1Match[1].includes(page.check.h1), `H1 contains "${page.check.h1}": ${h1Match ? h1Match[1].trim().substring(0, 50) : 'MISSING'}`)
  }

  // Nav check
  if (page.check.hasNav) {
    check(res.body.includes('nav') || res.body.includes('GlobalNav'), 'Navigation present')
  }

  // SEO meta check
  const seoIssues = checkSeoMeta(res.body, page.url)
  if (seoIssues.length > 0) {
    for (const issue of seoIssues) {
      warnMsg(`SEO: ${issue}`)
    }
  } else {
    pass++
    console.log(`  ✓ SEO meta complete (title, desc, canonical, og)`)
  }

  // Robots meta check
  if (res.body.includes('name="robots" content="noindex')) {
    fail++
    bugs.push(`${page.url}: has noindex meta tag!`)
    console.log(`  ✗ Has noindex — Google won't index this page!`)
  }
}

// 3. robots.txt check
console.log('\n=== ROBOTS.TXT ===')
const robots = fetchPage(`${BASE}/robots.txt`)
check(robots.code === 200, `robots.txt HTTP ${robots.code}`)
if (robots.code === 200) {
  check(robots.body.includes('Sitemap'), `robots.txt references sitemap`)
  check(!robots.body.includes('Disallow: /'), `No site-wide disallow`)
}

// ===== SUMMARY =====
console.log(`\n${'═'.repeat(60)}`)
console.log(`PASS: ${pass}  FAIL: ${fail}  WARN: ${warn}`)
if (bugs.length > 0) {
  console.log('\nIssues:')
  bugs.forEach(b => console.log(`  - ${b}`))
}
console.log(`\nSitemap: ${urlCount} URLs across 9 projects`)
console.log(`${'═'.repeat(60)}`)

process.exit(fail > 0 ? 1 : 0)
