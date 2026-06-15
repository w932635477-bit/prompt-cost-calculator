#!/usr/bin/env node
/**
 * URL Inspection API — bucket every submitted URL by coverageState.
 * Maps directly to GSC's "Why pages aren't indexed" report.
 * Read-only. Uses the verified service account.
 *
 * Usage:
 *   node scripts/gsc-inspect-all.cjs            # inspect all submitted URLs
 *   node scripts/gsc-inspect-all.cjs --probe 3  # probe first N only
 *   node scripts/gsc-inspect-all.cjs --only https://aicalc.cloud/foo/
 */
const path = require('path')
const os = require('os')
const fs = require('fs')
const { google } = require('googleapis')

const KEY_FILE = process.env.GSC_KEY_FILE || path.join(os.homedir(), '.gsc', 'service-account.json')
const SITE_URL = 'https://aicalc.cloud/'
const PROGRESS = path.join(__dirname, '..', '.gsc-aicalc-progress.json')
const OUT = path.join(__dirname, '..', '.gsc-inspect-results.json')

const args = process.argv.slice(2)
let probeN = 0
let only = null
for (let i = 0; i < args.length; i++) {
  if (args[i] === '--probe') probeN = parseInt(args[++i], 10) || 3
  if (args[i] === '--only') only = args[++i]
}

const sleep = ms => new Promise(r => setTimeout(r, ms))

async function inspect(searchconsole, auth, url, retries = 3) {
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const res = await searchconsole.urlInspection.index.inspect({
        requestBody: { inspectionUrl: url, siteUrl: SITE_URL, languageCode: 'en-US' },
      })
      const isr = (res.data && res.data.inspectionResult && res.data.inspectionResult.indexStatusResult) || {}
      return {
        url,
        coverageState: isr.coverageState || 'UNKNOWN',
        indexingState: isr.indexingState,
        verdict: isr.verdict,
        lastCrawlTime: isr.lastCrawlTime,
        googleCanonical: isr.googleCanonical,
        userCanonical: isr.userCanonical,
        reasons: (isr.reasons || []).map(r => r.message),
        robotsTxtState: isr.robotsTxtState,
        pageFetchState: isr.pageFetchState,
      }
    } catch (e) {
      const code = e.code || (e.response && e.response.status)
      if (code === 429 || code === 503 || code === 500) {
        await sleep(1500 * (attempt + 1))
        continue
      }
      return { url, coverageState: 'ERROR', error: (e.message || String(e)).split('\n')[0] }
    }
  }
  return { url, coverageState: 'ERROR', error: 'exhausted retries' }
}

function loadExisting() {
  try {
    const d = JSON.parse(fs.readFileSync(OUT, 'utf8'))
    const map = new Map()
    for (const r of (d.results || [])) if (r && r.url) map.set(r.url, r)
    return map
  } catch { return new Map() }
}

function persist(results, buckets) {
  fs.writeFileSync(OUT, JSON.stringify({ generatedAt: new Date().toISOString(), buckets, results }, null, 2))
}

async function main() {
  const { submitted } = JSON.parse(fs.readFileSync(PROGRESS, 'utf8'))
  let urls = only ? [only] : submitted.slice()
  if (probeN) urls = urls.slice(0, probeN)

  const existing = loadExisting()
  const results = []
  const buckets = {}

  const pending = urls.filter(u => !existing.has(u))
  console.log(`URLs total=${urls.length} cached=${urls.length - pending.length} pending=${pending.length}`)
  if (pending.length === 0) {
    for (const u of urls) results.push(existing.get(u))
  }

  // seed results+buckets from cache
  for (const u of urls) {
    if (existing.has(u)) {
      const r = existing.get(u)
      results.push(r)
      ;(buckets[r.coverageState] = buckets[r.coverageState] || []).push(r)
    }
  }

  if (pending.length === 0) { report(); return }

  console.log(`Inspecting ${pending.length} pending URL(s) as ${SITE_URL}`)
  const auth = new google.auth.GoogleAuth({ keyFile: KEY_FILE, scopes: ['https://www.googleapis.com/auth/webmasters.readonly'] })
  const searchconsole = google.searchconsole({ version: 'v1', auth })

  // bounded concurrency, incremental persist
  const CONC = 4
  let i = 0
  let done = 0
  async function worker() {
    while (i < pending.length) {
      const url = pending[i++]
      const r = await inspect(searchconsole, auth, url)
      results.push(r)
      ;(buckets[r.coverageState] = buckets[r.coverageState] || []).push(r)
      done++
      if (done % 20 === 0 || done === pending.length) {
        persist(results, buckets)
        console.log(`  ...${done}/${pending.length}`)
      }
      // surface problems immediately
      if (r.coverageState !== 'Submitted and indexed' && r.coverageState !== 'Indexed' && r.coverageState !== 'ERROR') {
        console.log(`  [${r.coverageState}] ${r.url}`)
      }
    }
  }
  await Promise.all(Array.from({ length: CONC }, worker))
  persist(results, buckets)
  report()
}

function report() {
  const d = JSON.parse(fs.readFileSync(OUT, 'utf8'))
  const buckets = d.buckets || {}
  const total = (d.results || []).length
  console.log(`\nWrote ${OUT}  (${total} URLs)\n`)
  console.log('=== SUMMARY ===')
  for (const [k, v] of Object.entries(buckets).sort((a, b) => b[1].length - a[1].length)) {
    console.log(`${String(v.length).padStart(3)}  ${k}`)
  }
  const OK = new Set(['Submitted and indexed', 'Indexed'])
  const problemKeys = Object.keys(buckets).filter(k => !OK.has(k) && k !== 'ERROR')
  if (problemKeys.length) {
    console.log('\n=== PROBLEM URLS ===')
    for (const k of problemKeys) {
      console.log(`\n[${k}]  (${buckets[k].length})`)
      for (const r of buckets[k]) {
        console.log(`  ${r.url}`)
        if (r.reasons && r.reasons.length) console.log(`      reasons: ${r.reasons.join('; ')}`)
        if (r.googleCanonical && r.googleCanonical !== r.url) console.log(`      googleCanonical: ${r.googleCanonical}`)
        if (r.userCanonical && r.userCanonical !== r.url) console.log(`      userCanonical:   ${r.userCanonical}`)
        if (r.pageFetchState && r.pageFetchState !== 'Successful' && r.pageFetchState !== 'SUCCESSFUL') console.log(`      pageFetchState:  ${r.pageFetchState}`)
        if (r.error) console.log(`      error: ${r.error}`)
      }
    }
  }
}

main().catch(e => { console.error('FATAL:', e.message); process.exit(1) })
