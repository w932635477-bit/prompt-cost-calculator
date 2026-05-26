#!/usr/bin/env node
/**
 * GSC Quota Tracker — 防重复提交，每天 ≤10 条 Indexing API 配额
 *
 * 用法：
 *   node scripts/gsc-quota-tracker.cjs --status         # 查今天还能提多少
 *   node scripts/gsc-quota-tracker.cjs --add <url>      # 标记一条已提交
 *   node scripts/gsc-quota-tracker.cjs --batch          # 自动跑 Search Analytics 找应提交 URL
 *   node scripts/gsc-quota-tracker.cjs --history        # 查看 30 天历史
 *
 * 数据存储：~/.gstack/projects/codehelper/gsc-quota.json
 *
 * 防重复策略：
 *   1. 同一 URL 30 天内只提交一次
 *   2. 每天提交记录追加到 JSON
 *   3. 配额日重置（北京时间 0:00 = UTC 16:00）
 */

const fs = require('fs')
const path = require('path')
const os = require('os')

const STORE_DIR = path.join(os.homedir(), '.gstack', 'projects', 'codehelper')
const STORE_FILE = path.join(STORE_DIR, 'gsc-quota.json')
const DAILY_QUOTA = 10
const COOLDOWN_DAYS = 30

function loadStore() {
  fs.mkdirSync(STORE_DIR, { recursive: true })
  if (!fs.existsSync(STORE_FILE)) {
    return { submissions: [] }
  }
  return JSON.parse(fs.readFileSync(STORE_FILE, 'utf-8'))
}

function saveStore(store) {
  fs.writeFileSync(STORE_FILE, JSON.stringify(store, null, 2))
}

function todayKey() {
  // Beijing time YYYY-MM-DD (UTC+8)
  const now = new Date(Date.now() + 8 * 3600 * 1000)
  return now.toISOString().slice(0, 10)
}

function todaySubmissions(store) {
  const today = todayKey()
  return store.submissions.filter(s => s.day === today)
}

function isOnCooldown(store, url) {
  const cutoff = Date.now() - COOLDOWN_DAYS * 86400 * 1000
  return store.submissions.some(s => s.url === url && new Date(s.ts).getTime() > cutoff)
}

function showStatus() {
  const store = loadStore()
  const todays = todaySubmissions(store)
  const remaining = Math.max(0, DAILY_QUOTA - todays.length)
  const total = store.submissions.length

  console.log('GSC Quota Status')
  console.log('================')
  console.log(`Today (${todayKey()}): ${todays.length}/${DAILY_QUOTA}`)
  console.log(`Remaining today:       ${remaining}`)
  console.log(`Cooldown window:       ${COOLDOWN_DAYS} days`)
  console.log(`Total submissions:     ${total}`)
  console.log('')

  if (todays.length > 0) {
    console.log("Today's submissions:")
    todays.forEach((s, i) => console.log(`  ${i + 1}. ${s.url}`))
  } else {
    console.log('No submissions today yet.')
  }
}

function addSubmission(url) {
  if (!url) {
    console.error('ERROR: missing URL')
    process.exit(1)
  }
  const store = loadStore()

  if (isOnCooldown(store, url)) {
    const last = store.submissions
      .filter(s => s.url === url)
      .sort((a, b) => new Date(b.ts) - new Date(a.ts))[0]
    console.error(`SKIPPED: ${url} already submitted on ${last.day} (within ${COOLDOWN_DAYS}-day cooldown)`)
    process.exit(2)
  }

  const todays = todaySubmissions(store)
  if (todays.length >= DAILY_QUOTA) {
    console.error(`QUOTA EXCEEDED: ${todays.length}/${DAILY_QUOTA} for ${todayKey()}`)
    process.exit(3)
  }

  store.submissions.push({
    url,
    day: todayKey(),
    ts: new Date().toISOString(),
  })
  saveStore(store)

  const remaining = DAILY_QUOTA - (todays.length + 1)
  console.log(`✓ Added: ${url}`)
  console.log(`  Quota: ${todays.length + 1}/${DAILY_QUOTA} (${remaining} remaining today)`)
}

function showHistory() {
  const store = loadStore()
  const recent = store.submissions
    .filter(s => new Date(s.ts).getTime() > Date.now() - 30 * 86400 * 1000)
    .sort((a, b) => new Date(b.ts) - new Date(a.ts))

  console.log(`Last 30 days: ${recent.length} submissions`)
  console.log('================')

  const byDay = {}
  recent.forEach(s => {
    byDay[s.day] = (byDay[s.day] || 0) + 1
  })

  Object.keys(byDay)
    .sort()
    .reverse()
    .slice(0, 30)
    .forEach(day => {
      const bar = '█'.repeat(byDay[day])
      console.log(`  ${day}  ${bar} ${byDay[day]}`)
    })
}

function suggestBatch() {
  const store = loadStore()
  const cutoff = Date.now() - COOLDOWN_DAYS * 86400 * 1000
  const submitted = new Set(
    store.submissions
      .filter(s => new Date(s.ts).getTime() > cutoff)
      .map(s => s.url)
  )

  // Read sitemap to get all URLs
  const sitemapPath = path.join(__dirname, '..', 'public', 'sitemap.xml')
  if (!fs.existsSync(sitemapPath)) {
    console.error('Sitemap not found:', sitemapPath)
    process.exit(1)
  }

  const sitemap = fs.readFileSync(sitemapPath, 'utf-8')
  const urls = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map(m => m[1])

  const eligible = urls.filter(u => !submitted.has(u))

  // Priority: hubs first, then long-tail
  const priority = (u) => {
    if (/\/$/.test(u) && u.split('/').length <= 5) return 0  // hub pages
    if (u.includes('/cron-generator/every-')) return 1
    if (u.includes('/compare/')) return 1
    if (u.includes('/alternatives/')) return 2
    return 3
  }

  eligible.sort((a, b) => priority(a) - priority(b))

  const todays = todaySubmissions(store)
  const remaining = Math.max(0, DAILY_QUOTA - todays.length)
  const batch = eligible.slice(0, remaining)

  console.log(`Suggested batch for today (${remaining} slots):`)
  console.log('================')
  if (batch.length === 0) {
    console.log('All eligible URLs already submitted in last 30 days.')
    return
  }
  batch.forEach((u, i) => console.log(`  ${i + 1}. ${u}`))
  console.log('')
  console.log('To mark as submitted, run:')
  batch.forEach(u => console.log(`  node scripts/gsc-quota-tracker.cjs --add "${u}"`))
}

const arg = process.argv[2]
const param = process.argv[3]

if (arg === '--status' || !arg) showStatus()
else if (arg === '--add') addSubmission(param)
else if (arg === '--history') showHistory()
else if (arg === '--batch') suggestBatch()
else {
  console.error('Usage: gsc-quota-tracker.cjs [--status|--add <url>|--history|--batch]')
  process.exit(1)
}
