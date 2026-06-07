/**
 * inject-static-content.cjs
 * Post-build: extract seo-data JSON from ALL dist pages and inject
 * semantic HTML into #root so crawlers see content without JS execution.
 * React replaces the content on hydration (visibility:hidden prevents flash).
 *
 * Replaces inject-static-h1.cjs — covers all pages instead of just 17.
 */
const fs = require('fs')
const path = require('path')

const DIST_DIR = path.join(__dirname, '..', 'dist')

// Pages to skip (already have content, or special cases)
const SKIP_PATTERNS = [/^admin\//]

function shouldSkip(relPath) {
  return SKIP_PATTERNS.some(p => p.test(relPath))
}

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

function buildContent(data) {
  const parts = []

  // H1 — always present, always first
  if (data.h1) {
    parts.push(`<h1>${escapeHtml(data.h1)}</h1>`)
  }

  // Description
  if (data.description) {
    parts.push(`<p>${escapeHtml(data.description)}</p>`)
  }

  // Explanation (cron, alternatives)
  if (data.explanation) {
    parts.push(`<p>${escapeHtml(data.explanation)}</p>`)
  }

  // Summary (compare pages)
  if (data.summary) {
    parts.push(`<p>${escapeHtml(data.summary)}</p>`)
  }

  // One-liner (mcp-servers)
  if (data.oneLiner) {
    parts.push(`<p>${escapeHtml(data.oneLiner)}</p>`)
  }

  // Use case (mcp-servers)
  if (data.useCase) {
    parts.push(`<section><h2>Use Case</h2><p>${escapeHtml(data.useCase)}</p></section>`)
  }

  // When not to use (mcp-servers)
  if (data.whenNot) {
    parts.push(`<section><h2>When Not to Use</h2><p>${escapeHtml(data.whenNot)}</p></section>`)
  }

  // Features (compare pages) — may be objects with .name or strings
  if (data.features && Array.isArray(data.features) && data.features.length > 0) {
    const items = data.features.map(f => {
      const feat = typeof f === 'object' ? (f.name || f.feature || '') : String(f)
      return `<li>${escapeHtml(feat)}</li>`
    }).join('')
    parts.push(`<section><h2>Features Compared</h2><ul>${items}</ul></section>`)
  }

  // Product names (compare pages) — may be objects with .name or strings
  const productAName = typeof data.productA === 'object' ? data.productA?.name || 'Product A' : (data.productA || 'Product A')
  const productBName = typeof data.productB === 'object' ? data.productB?.name || 'Product B' : (data.productB || 'Product B')

  // Pros/Cons (compare pages)
  if (data.prosA && Array.isArray(data.prosA) && data.prosA.length > 0) {
    const items = data.prosA.map(p => `<li>${escapeHtml(typeof p === 'object' ? (p.text || p.name || '') : p)}</li>`).join('')
    parts.push(`<section><h2>${escapeHtml(productAName)} Pros</h2><ul>${items}</ul></section>`)
  }
  if (data.consA && Array.isArray(data.consA) && data.consA.length > 0) {
    const items = data.consA.map(c => `<li>${escapeHtml(typeof c === 'object' ? (c.text || c.name || '') : c)}</li>`).join('')
    parts.push(`<section><h2>${escapeHtml(productAName)} Cons</h2><ul>${items}</ul></section>`)
  }
  if (data.prosB && Array.isArray(data.prosB) && data.prosB.length > 0) {
    const items = data.prosB.map(p => `<li>${escapeHtml(typeof p === 'object' ? (p.text || p.name || '') : p)}</li>`).join('')
    parts.push(`<section><h2>${escapeHtml(productBName)} Pros</h2><ul>${items}</ul></section>`)
  }
  if (data.consB && Array.isArray(data.consB) && data.consB.length > 0) {
    const items = data.consB.map(c => `<li>${escapeHtml(typeof c === 'object' ? (c.text || c.name || '') : c)}</li>`).join('')
    parts.push(`<section><h2>${escapeHtml(productBName)} Cons</h2><ul>${items}</ul></section>`)
  }

  // Winner (compare pages) — may be object with .name, string key (\"a\"/\"b\"), or direct name
  if (data.winner) {
    let winnerName = ''
    if (typeof data.winner === 'object') {
      winnerName = data.winner?.name || ''
    } else if (data.winner === 'a' || data.winner === 'productA') {
      winnerName = productAName
    } else if (data.winner === 'b' || data.winner === 'productB') {
      winnerName = productBName
    } else {
      winnerName = String(data.winner)
    }
    const reason = data.winnerReason ? ` — ${escapeHtml(data.winnerReason)}` : ''
    if (winnerName) {
      parts.push(`<p><strong>Winner: ${escapeHtml(winnerName)}${reason}</strong></p>`)
    }
  }

  // Alternatives list (alternatives pages)
  if (data.alternatives && Array.isArray(data.alternatives) && data.alternatives.length > 0) {
    const items = data.alternatives.map(a => {
      const name = typeof a === 'object' ? a.name : String(a)
      return `<li>${escapeHtml(name)}</li>`
    }).join('')
    parts.push(`<section><h2>Top Alternatives</h2><ul>${items}</ul></section>`)
  }

  // Deploys (deploy pages)
  if (data.deploys && Array.isArray(data.deploys) && data.deploys.length > 0) {
    const items = data.deploys.map(d => {
      const name = typeof d === 'object' ? d.name : String(d)
      return `<li>${escapeHtml(name)}</li>`
    }).join('')
    parts.push(`<section><h2>Self-Hosted Options</h2><ul>${items}</ul></section>`)
  }

  // Common pitfalls (mcp-servers)
  if (data.commonPitfalls && Array.isArray(data.commonPitfalls) && data.commonPitfalls.length > 0) {
    const items = data.commonPitfalls.map(p => `<li>${escapeHtml(p)}</li>`).join('')
    parts.push(`<section><h2>Common Pitfalls</h2><ul>${items}</ul></section>`)
  }

  // FAQ
  if (data.faq && Array.isArray(data.faq) && data.faq.length > 0) {
    const items = data.faq.map(f => {
      const q = typeof f === 'object' ? f.q || f.question || '' : String(f)
      const a = typeof f === 'object' ? f.a || f.answer || '' : ''
      return `<li><strong>${escapeHtml(q)}</strong><p>${escapeHtml(a)}</p></li>`
    }).join('')
    parts.push(`<section><h2>FAQ</h2><ul>${items}</ul></section>`)
  }

  return parts.join('\n')
}

function findAllHtmlFiles(dir, baseDir) {
  const results = []
  const entries = fs.readdirSync(dir, { withFileTypes: true })
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name)
    if (entry.isDirectory()) {
      results.push(...findAllHtmlFiles(fullPath, baseDir))
    } else if (entry.name === 'index.html') {
      const relPath = path.relative(baseDir, path.dirname(fullPath)) || '.'
      results.push({ filePath: fullPath, relPath })
    }
  }
  return results
}

function main() {
  const allFiles = findAllHtmlFiles(DIST_DIR, DIST_DIR)
  let injected = 0
  let skipped = 0
  let fallbackInjected = 0
  let empty = 0

  for (const { filePath, relPath } of allFiles) {
    if (shouldSkip(relPath)) {
      skipped++
      continue
    }

    const html = fs.readFileSync(filePath, 'utf-8')

    // Skip if #root already has content
    const rootPattern = /<div id="root"[^>]*><\/div>/
    if (!rootPattern.test(html)) {
      // Already has content — leave as-is
      continue
    }

    let content = ''

    // Primary: extract seo-data JSON
    const seoMatch = html.match(/<script type="application\/json" id="seo-data">([\s\S]*?)<\/script>/)
    if (seoMatch) {
      try {
        const data = JSON.parse(seoMatch[1].trim())
        content = buildContent(data)
      } catch (e) {
        console.log(`  ⚠ Skip ${relPath}/: invalid JSON in seo-data`)
        skipped++
        continue
      }
    }

    // Fallback: no seo-data — extract from meta tags
    if (!content.trim()) {
      const titleMatch = html.match(/<title>([^<]+)<\/title>/)
      const descMatch = html.match(/<meta name="description" content="([^"]+)"/)
      const h1 = titleMatch ? titleMatch[1].replace(/ [-–—|] .*/, '').trim() : ''
      const desc = descMatch ? descMatch[1] : ''

      if (h1 || desc) {
        const parts = []
        if (h1) parts.push(`<h1>${escapeHtml(h1)}</h1>`)
        if (desc) parts.push(`<p>${escapeHtml(desc)}</p>`)
        content = parts.join('\n')
        if (content.trim()) {
          fallbackInjected++
        }
      }
    }

    if (!content.trim()) {
      empty++
      continue
    }

    // Inject static content with visibility:hidden to prevent FOUC.
    // Inline script removes visibility:hidden after React hydrates
    // (module scripts are deferred; DOMContentLoaded fires after them).
    const revealScript = `<script>(function(){var r=document.getElementById('root');r&&(document.addEventListener('DOMContentLoaded',function(){r.style.visibility='visible'}),setTimeout(function(){r.style.visibility='visible'},3000))})()</script>`
    const newHtml = html.replace(
      '<div id="root"></div>',
      `<div id="root" style="visibility:hidden">\n${content}\n</div>\n${revealScript}`
    )

    fs.writeFileSync(filePath, newHtml)
    const h1Text = content.match(/<h1>([^<]+)<\/h1>/)
    const label = h1Text ? ` h1="${h1Text[1]}"` : ''
    console.log(`  ✓ ${relPath}/${label}`)
    injected++
  }

  console.log(`\nInjected: ${injected} (${fallbackInjected} fallback), Skipped: ${skipped}, Empty: ${empty}`)

  if (injected === 0) {
    console.log('WARNING: No pages were injected — check seo-data format')
  }
}

main()
