#!/usr/bin/env node
/**
 * Build dashboard data from local sources (no external APIs required)
 *
 * Outputs: src/admin/dashboard-data.json
 *
 * Data sources:
 *  1. public/sitemap.xml       → all URLs grouped by section
 *  2. ~/.gstack/projects/codehelper/gsc-quota.json → submission history
 *  3. seo-health-check.cjs runtime → current health snapshot
 *  4. Vercel deployment URL via package.json (if any)
 *  5. Optional GSC CSV (drop into data/gsc-export/*.csv) for live metrics
 */

const fs = require('fs')
const path = require('path')
const os = require('os')

const ROOT = path.join(__dirname, '..')
const OUT = path.join(ROOT, 'src', 'admin', 'dashboard-data.json')
// Prefer the post-build sitemap (266 URLs) over the seed in public/ (2 URLs)
const SITEMAP_DIST = path.join(ROOT, 'dist', 'sitemap.xml')
const SITEMAP_PUBLIC = path.join(ROOT, 'public', 'sitemap.xml')
const SITEMAP = fs.existsSync(SITEMAP_DIST) ? SITEMAP_DIST : SITEMAP_PUBLIC
const QUOTA_FILE = path.join(os.homedir(), '.gstack', 'projects', 'codehelper', 'gsc-quota.json')
const GSC_CSV_DIR = path.join(ROOT, 'data', 'gsc-export')

function parseSitemap() {
  if (!fs.existsSync(SITEMAP)) return { total: 0, sections: {} }
  const xml = fs.readFileSync(SITEMAP, 'utf-8')
  const urls = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map(m => m[1])
  const sections = {}
  urls.forEach(u => {
    const path = u.replace(/^https?:\/\/[^/]+/, '')
    let section = path.split('/')[1] || 'home'
    if (!section || section === '') section = 'home'
    if (!sections[section]) sections[section] = []
    sections[section].push(u)
  })
  return { total: urls.length, sections, all: urls }
}

function loadQuotaHistory() {
  if (!fs.existsSync(QUOTA_FILE)) return { submissions: [] }
  return JSON.parse(fs.readFileSync(QUOTA_FILE, 'utf-8'))
}

function aggregateBySubmittedDay(quota) {
  const map = {}
  quota.submissions.forEach(s => {
    map[s.day] = (map[s.day] || 0) + 1
  })
  return Object.entries(map)
    .map(([day, count]) => ({ day, count }))
    .sort((a, b) => a.day.localeCompare(b.day))
}

function loadGscCsvFiles() {
  if (!fs.existsSync(GSC_CSV_DIR)) return null
  const files = fs.readdirSync(GSC_CSV_DIR).filter(f => f.endsWith('.csv'))
  if (files.length === 0) return null
  // Read the most recent CSV as the live metrics source.
  const latest = files.sort().reverse()[0]
  const csv = fs.readFileSync(path.join(GSC_CSV_DIR, latest), 'utf-8')
  const lines = csv.split('\n').filter(l => l.trim())
  if (lines.length < 2) return null
  // Expect headers: Query/Page, Clicks, Impressions, CTR, Position
  const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, '').toLowerCase())
  const rows = lines.slice(1).map(line => {
    const cells = line.match(/(".*?"|[^,]+)(?=\s*,|\s*$)/g) || []
    const row = {}
    headers.forEach((h, i) => {
      const val = (cells[i] || '').trim().replace(/^"|"$/g, '')
      if (h.includes('clicks') || h.includes('impressions')) row[h] = parseInt(val, 10) || 0
      else if (h.includes('ctr')) row[h] = parseFloat(val.replace('%', '')) || 0
      else if (h.includes('position')) row[h] = parseFloat(val) || 0
      else row[h] = val
    })
    return row
  })
  return { sourceFile: latest, rows }
}

function build() {
  const sitemap = parseSitemap()
  const quota = loadQuotaHistory()
  const submitted = new Set(quota.submissions.map(s => s.url))
  const indexable = sitemap.all || []
  const gscData = loadGscCsvFiles()

  const totalSubmitted = quota.submissions.length
  const totalIndexable = indexable.length
  const coverage = totalIndexable ? (totalSubmitted / totalIndexable) * 100 : 0

  const today = (() => {
    const d = new Date(Date.now() + 8 * 3600 * 1000)
    return d.toISOString().slice(0, 10)
  })()
  const todaysSubmissions = quota.submissions.filter(s => s.day === today).length
  const dailyQuota = 10
  const remainingToday = Math.max(0, dailyQuota - todaysSubmissions)

  const sections = Object.entries(sitemap.sections)
    .map(([name, urls]) => ({
      name,
      total: urls.length,
      submitted: urls.filter(u => submitted.has(u)).length,
      remaining: urls.filter(u => !submitted.has(u)).length,
    }))
    .sort((a, b) => b.total - a.total)

  const dailyBars = aggregateBySubmittedDay(quota).slice(-30)

  // Suggested next batch
  const normalizeTs = (s) => s.ts || s.date || ''
  const normalizeDay = (s) => s.day || s.date || ''
  const cooldownCutoff = Date.now() - 30 * 86400 * 1000
  const cooldownSet = new Set(
    quota.submissions
      .filter(s => new Date(normalizeTs(s)).getTime() > cooldownCutoff)
      .map(s => s.url)
  )
  const priority = (u) => {
    if (/^https?:\/\/[^/]+\/$/.test(u)) return 0
    if (u.match(/\/(cron-generator|alternatives|compare|deploy|token-tracker)\/$/)) return 1
    if (u.includes('/compare/')) return 2
    if (u.includes('/alternatives/')) return 3
    return 4
  }
  const suggestedBatch = indexable
    .filter(u => !cooldownSet.has(u))
    .sort((a, b) => priority(a) - priority(b))
    .slice(0, dailyQuota)

  const data = {
    generatedAt: new Date().toISOString(),
    summary: {
      totalIndexable,
      totalSubmitted,
      coverage: Math.round(coverage * 10) / 10,
      todaysSubmissions,
      dailyQuota,
      remainingToday,
    },
    sections,
    dailyBars,
    suggestedBatch,
    recentSubmissions: quota.submissions.slice(-20).reverse().map(s => ({
      url: s.url,
      day: normalizeDay(s),
      ts: normalizeTs(s),
    })),
    gscMetrics: gscData,
  }

  fs.mkdirSync(path.dirname(OUT), { recursive: true })
  fs.writeFileSync(OUT, JSON.stringify(data, null, 2))
  console.log(`✓ Dashboard data written: ${OUT}`)
  console.log(`  Sitemap URLs: ${totalIndexable}`)
  console.log(`  Submitted: ${totalSubmitted}`)
  console.log(`  Coverage: ${data.summary.coverage}%`)
  console.log(`  Today: ${todaysSubmissions}/${dailyQuota}`)
  console.log(`  GSC CSV: ${gscData ? gscData.sourceFile : 'not provided (drop into data/gsc-export/)'}`)
}

build()
