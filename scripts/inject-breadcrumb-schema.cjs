/**
 * inject-breadcrumb-schema.cjs
 * Post-build: inject BreadcrumbList JSON-LD into all dist HTML pages.
 * Skips homepage (single-item breadcrumb has no value).
 */
const fs = require('fs')
const path = require('path')

const BASE_URL = 'https://aicalc.cloud'
const DIST_DIR = path.join(__dirname, '..', 'dist')

const SKIP_PATTERNS = [/^admin\//]

const SEGMENT_NAMES = {
  'cron-generator': 'Cron Generator',
  'cron-validator': 'Cron Validator',
  'alternatives': 'Self-Hosted Alternatives',
  'compare': 'Compare Tools',
  'deploy': 'Docker Deploy',
  'llm-pricing': 'LLM Pricing',
  'mcp-servers': 'MCP Servers',
  'token-tracker': 'Token Tracker',
  'token-counter': 'Token Counter',
  'token-optimizer': 'Token Optimizer',
  'voice-agent-pricing': 'Voice Agent Pricing',
  'prompt-cache-calculator': 'Cache Calculator',
  'env-scanner': '.env Scanner',
  'pii-redactor': 'PII Redactor',
  'csp-generator': 'CSP Generator',
  'dep-shield': 'Dep Shield',
  'ai-agent-security': 'Agent Security',
  'ai-agent-data-access': 'Agent Data Access',
  'agent-safety': 'Agent Safety',
  'ai-code-review': 'AI Code Review',
  'local-llm-privacy': 'Local LLM Privacy',
  'photos': 'Free Photos',
  'aider-tutorial': 'Aider Tutorial',
  'microsoft-scout-agent': 'Microsoft Scout',
  'finder': 'Finder',
  'notes': 'Notes Finder',
  'chat': 'Chat Finder',
  'productivity': 'Productivity Finder',
  'about': 'About',
  'privacy-policy': 'Privacy Policy',
  'contact': 'Contact',
  'terms': 'Terms',
  'common-patterns': 'Common Patterns',
  'vercel-cron': 'Vercel Cron',
  'how-to-review-ai-generated-code': 'How to Review AI Code',
  'ai-pr-review-checklist': 'AI PR Review Checklist',
}

function extractTitle(html) {
  const match = html.match(/<title>([^<]+)<\/title>/)
  if (!match) return ''
  return match[1]
    // Decode HTML entities
    .replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"').replace(/&#39;/g, "'")
    // Strip suffixes: " — aicalc.cloud", " | Free Online", " - Schedule & Examples"
    .replace(/\s+[—–|\-]\s+.*$/, '')
    .replace(/\s*\(\d{4}\)\s*$/, '')
    .trim()
}

function buildBreadcrumb(segments, html) {
  const items = [{ '@type': 'ListItem', position: 1, name: 'Home', item: `${BASE_URL}/` }]

  let currentPath = ''
  for (let i = 0; i < segments.length; i++) {
    const seg = segments[i]
    currentPath += `/${seg}`
    const name = SEGMENT_NAMES[seg] || (i === segments.length - 1 ? extractTitle(html) : seg.replace(/-/g, ' '))
    const item = { '@type': 'ListItem', position: i + 2, name }
    if (i < segments.length - 1) {
      item.item = `${BASE_URL}${currentPath}/`
    }
    items.push(item)
  }

  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items,
  }
}

function shouldSkip(relPath) {
  if (relPath === '.' || relPath === '') return true // homepage
  return SKIP_PATTERNS.some(p => p.test(relPath))
}

function findAllHtmlFiles(dir, baseDir) {
  const results = []
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
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

  for (const { filePath, relPath } of allFiles) {
    if (shouldSkip(relPath)) {
      skipped++
      continue
    }

    const html = fs.readFileSync(filePath, 'utf-8')

    // Skip if already has BreadcrumbList
    if (html.includes('"@type": "BreadcrumbList"')) {
      skipped++
      continue
    }

    // Build segments from path: "cron-generator/every-5-minutes" → ["cron-generator", "every-5-minutes"]
    const segments = relPath.split('/').filter(Boolean)
    if (segments.length === 0) {
      skipped++
      continue
    }

    const schema = buildBreadcrumb(segments, html)
    const scriptTag = `<script type="application/ld+json">\n${JSON.stringify(schema, null, 2)}\n</script>`

    // Inject before </head>
    const newHtml = html.replace('</head>', `${scriptTag}\n  </head>`)
    if (newHtml === html) {
      console.log(`  ⚠ Skip ${relPath}/: no </head> found`)
      skipped++
      continue
    }

    fs.writeFileSync(filePath, newHtml)
    console.log(`  ✓ ${relPath}/ → ${schema.itemListElement.map(i => i.name).join(' > ')}`)
    injected++
  }

  console.log(`\nBreadcrumbList: ${injected} injected, ${skipped} skipped`)
  if (injected === 0) console.log('WARNING: No breadcrumbs injected')
}

main()
