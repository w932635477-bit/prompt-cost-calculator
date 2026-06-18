#!/usr/bin/env node
/**
 * Inject a runtime robots-noindex guard into every dist HTML page.
 * Activates only when the page is served from a non-production host — i.e. any
 * vercel.app preview/deployment URL. aicalc.cloud is never affected.
 *
 * Why runtime: static HTML is built once and served identically across hosts,
 * so host detection must happen in the browser. The inline script runs at head
 * parse time; Googlebot executes it and respects the resulting meta. Combined
 * with the hardcoded aicalc.cloud canonical already in every page, this stops
 * vercel preview hosts from ever being indexed or stealing canonical.
 *
 * Runs post-build, after inject-static-content.cjs. Idempotent (guarded).
 */
const fs = require('fs')
const path = require('path')

const DIST_DIR = path.join(__dirname, '..', 'dist')
const GUARD = 'data-noindex-guard'
const PROD_HOST = 'aicalc.cloud'

// Inline IIFE: append <meta name="robots" content="noindex,nofollow"> only on
// non-production hosts.
const SCRIPT = `<script ${GUARD}>(function(){if(location.hostname!=='${PROD_HOST}'){var m=document.createElement('meta');m.setAttribute('name','robots');m.setAttribute('content','noindex,nofollow');document.head.appendChild(m)}})();</script>`

function findAllHtmlFiles(dir, out = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name)
    if (entry.isDirectory()) findAllHtmlFiles(full, out)
    else if (entry.name === 'index.html') out.push(full)
  }
  return out
}

function main() {
  if (!fs.existsSync(DIST_DIR)) {
    console.error('noindex-nonprod: dist/ not found — run after vite build')
    process.exit(0) // never break the build chain
  }
  const files = findAllHtmlFiles(DIST_DIR)
  let injected = 0
  let skipped = 0
  for (const f of files) {
    const html = fs.readFileSync(f, 'utf-8')
    if (html.includes(GUARD)) { skipped++; continue }
    const next = html.replace(/<head([^>]*)>/i, `<head$1>\n  ${SCRIPT}`)
    if (next === html) { skipped++; continue }
    fs.writeFileSync(f, next)
    injected++
  }
  console.log(`noindex-nonprod: injected ${injected}, skipped ${skipped} (of ${files.length} pages)`)
}

main()
