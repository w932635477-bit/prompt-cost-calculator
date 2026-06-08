/**
 * generate-sitemap-page.cjs
 * Post-build: generates a /sitemap/ HTML page from dist/sitemap.xml.
 * Lists all 342 URLs grouped by category with links.
 * Runs after generate-sitemap.cjs in the build pipeline.
 */
const fs = require('fs')
const path = require('path')

const DIST_DIR = path.join(__dirname, '..', 'dist')
const SITEMAP_XML = path.join(DIST_DIR, 'sitemap.xml')
const BASE_URL = 'https://aicalc.cloud'

// Category definitions: path prefix → display name + icon
const CATEGORIES = [
  { prefix: '', name: 'Homepage', icon: '🏠' },
  { prefix: 'cron-generator', name: 'Cron Generator & Schedules', icon: '⏰' },
  { prefix: 'alternatives', name: 'Self-Hosted Alternatives', icon: '🔓' },
  { prefix: 'deploy', name: 'Docker Deploy Guides', icon: '🐳' },
  { prefix: 'compare', name: 'Tool Comparisons', icon: '⚖️' },
  { prefix: 'llm-pricing', name: 'LLM Pricing', icon: '💰' },
  { prefix: 'mcp-servers', name: 'MCP Server Directory', icon: '🔌' },
  { prefix: 'token-tracker', name: 'Token Cost Tracker', icon: '📊' },
  { prefix: 'cron-validator', name: 'Cron Validator', icon: '✅' },
  { prefix: 'ai-code-review', name: 'AI Code Review', icon: '🔍' },
  { prefix: 'voice-agent-pricing', name: 'Voice Agent Pricing', icon: '🎙️' },
  { prefix: 'prompt-cache-calculator', name: 'Prompt Cache Calculator', icon: '⚡' },
  { prefix: 'env-scanner', name: '.env Scanner', icon: '🛡️' },
  { prefix: 'pii-redactor', name: 'PII Redactor', icon: '🔒' },
  { prefix: 'csp-generator', name: 'CSP Generator', icon: '🔐' },
  { prefix: 'dep-shield', name: 'Dep Shield', icon: '📦' },
  { prefix: 'ai-agent-security', name: 'AI Agent Security', icon: '🤖' },
  { prefix: 'ai-agent-data-access', name: 'Agent Data Access', icon: '📋' },
  { prefix: 'local-llm-privacy', name: 'Local LLM Privacy', icon: '🖥️' },
  { prefix: 'token-counter', name: 'Token Counter', icon: '🔢' },
  { prefix: 'token-optimizer', name: 'Token Optimizer', icon: '✂️' },
  { prefix: 'agent-safety', name: 'Agent Safety', icon: '🦺' },
  { prefix: 'photos', name: 'Free Photos', icon: '📸' },
  { prefix: 'finder', name: 'Finders', icon: '🔎' },
  { prefix: 'aider-tutorial', name: 'Aider Tutorial', icon: '📖' },
  { prefix: 'microsoft-scout-agent', name: 'Microsoft Scout', icon: '🪟' },
  { prefix: 'about', name: 'About', icon: 'ℹ️' },
  { prefix: 'privacy-policy', name: 'Privacy Policy', icon: '📜' },
  { prefix: 'contact', name: 'Contact', icon: '📧' },
  { prefix: 'terms', name: 'Terms', icon: '📝' },
]

// Friendly names for common URL slugs
const SLUG_LABELS = {
  // Homepage
  '': 'Home',

  // Cron main pages
  'cron-generator': 'Cron Generator',
  'common-patterns': 'Common Cron Patterns',
  'vercel-cron': 'Vercel Cron Jobs Guide',

  // Alternatives main
  'alternatives': 'Self-Hosted Alternatives Finder',

  // Deploy main
  'deploy': 'Docker Deploy Guides',

  // Compare main
  'compare': 'Tool Comparison Directory',

  // LLM Pricing main
  'llm-pricing': 'LLM API Pricing Calculator',

  // MCP main
  'mcp-servers': 'MCP Server Directory',

  // Token tracker
  'token-tracker': 'AI API Cost Tracker',

  // Validator
  'cron-validator': 'Cron Expression Validator',

  // Standalone tools
  'voice-agent-pricing': 'Voice AI Pricing Comparison',
  'prompt-cache-calculator': 'Prompt Cache Calculator',
  'env-scanner': '.env File Security Scanner',
  'pii-redactor': 'PII Redactor Tool',
  'csp-generator': 'CSP Header Generator',
  'dep-shield': 'npm Dependency Vulnerability Scanner',
  'ai-agent-security': 'AI Agent Security Checker',
  'ai-agent-data-access': 'AI Agent Data Access Patterns',
  'local-llm-privacy': 'Local LLM Privacy Probe',
  'token-counter': 'LLM Token Counter',
  'token-optimizer': 'Token Usage Optimizer',
  'agent-safety': 'AI Agent Safety Guidelines',
  'photos': 'Free Stock Photos Finder',
  'aider-tutorial': 'Aider AI Coding Tutorial',
  'microsoft-scout-agent': 'Microsoft Scout Agent',

  // Finder sub-pages
  'notes': 'Notes App Finder',
  'chat': 'Chat App Finder',
  'productivity': 'Productivity App Finder',

  // AI Code Review
  'ai-code-review': 'AI Code Review Checklist',
  'how-to-review-ai-generated-code': 'How to Review AI-Generated Code',
  'ai-pr-review-checklist': 'AI PR Review Checklist',

  // Trust pages
  'about': 'About aicalc.cloud',
  'privacy-policy': 'Privacy Policy',
  'contact': 'Contact',
  'terms': 'Terms of Service',
}

function slugToLabel(slug) {
  if (SLUG_LABELS[slug]) return SLUG_LABELS[slug]
  // Fallback: convert slug to title case
  return slug
    .replace(/[-_]/g, ' ')
    .replace(/\b\w/g, c => c.toUpperCase())
}

function parseSitemapXml(xmlPath) {
  const xml = fs.readFileSync(xmlPath, 'utf-8')
  const urlMatches = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)]
  return urlMatches.map(m => m[1]).filter(u => u.startsWith(BASE_URL))
}

function categorizeUrls(urls) {
  const groups = new Map()

  for (const url of urls) {
    const path = new URL(url).pathname.replace(/\/$/, '').replace(/^\//, '')
    const firstSegment = path.split('/')[0] || ''

    let matched = false
    for (const cat of CATEGORIES) {
      if (cat.prefix === firstSegment) {
        if (!groups.has(cat.prefix)) groups.set(cat.prefix, [])
        groups.get(cat.prefix).push({ url, path, segments: path.split('/') })
        matched = true
        break
      }
    }
    if (!matched) {
      if (!groups.has('_other')) groups.set('_other', [])
      groups.get('_other').push({ url, path, segments: path.split('/') })
    }
  }

  return groups
}

function buildLinkHtml(entry) {
  const parts = entry.segments
  let label

  if (parts.length <= 1) {
    // Top-level page
    label = slugToLabel(parts[0] || '')
  } else if (parts.length === 2) {
    // Deep page — use the slug
    label = slugToLabel(parts[1])
  } else {
    // Deeper — use last segment
    label = slugToLabel(parts[parts.length - 1])
  }

  const href = '/' + entry.path + '/'
  return `<li><a href="${href}">${label}</a></li>`
}

function buildSectionHtml(cat, entries) {
  // Skip sitemap page itself
  const filtered = entries.filter(e => !e.path.startsWith('sitemap'))
  if (filtered.length === 0) return ''

  const links = filtered.map(buildLinkHtml).join('\n')
  const count = filtered.length

  return `<section class="sitemap-category">
<h2>${cat.icon} ${cat.name}</h2>
<p class="sitemap-count">${count} page${count > 1 ? 's' : ''}</p>
<ul class="sitemap-links">${links}</ul>
</section>`
}

function main() {
  if (!fs.existsSync(SITEMAP_XML)) {
    console.error('ERROR: dist/sitemap.xml not found. Run generate-sitemap.cjs first.')
    process.exit(1)
  }

  const urls = parseSitemapXml(SITEMAP_XML)
  console.log(`Found ${urls.length} URLs in sitemap.xml`)

  const groups = categorizeUrls(urls)

  // Build sections HTML
  let sectionsHtml = ''
  let totalListed = 0
  for (const cat of CATEGORIES) {
    const entries = groups.get(cat.prefix)
    if (!entries) continue
    const section = buildSectionHtml(cat, entries)
    if (section) {
      sectionsHtml += section + '\n'
      totalListed += entries.length
    }
  }

  // Add any uncategorized
  const otherEntries = groups.get('_other')
  if (otherEntries && otherEntries.length > 0) {
    const otherCat = { prefix: '_other', name: 'Other Pages', icon: '📄' }
    sectionsHtml += buildSectionHtml(otherCat, otherEntries)
    totalListed += otherEntries.length
  }

  // Create the full HTML page
  const html = `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Sitemap — All Pages on aicalc.cloud (${totalListed} Pages)</title>
    <meta name="description" content="Complete sitemap of aicalc.cloud — ${totalListed} free developer tools and guides for AI costs, cron scheduling, security scanning, and self-hosted software." />
    <meta name="keywords" content="sitemap, aicalc.cloud, developer tools directory, free AI tools" />
    <link rel="canonical" href="${BASE_URL}/sitemap/" />
    <meta property="og:title" content="Sitemap — aicalc.cloud" />
    <meta property="og:description" content="Browse all ${totalListed} pages on aicalc.cloud — free developer tools for AI costs, security, cron, and self-hosted software." />
    <meta property="og:type" content="website" />
    <meta property="og:url" content="${BASE_URL}/sitemap/" />
    <meta property="og:image" content="${BASE_URL}/og-image.png" />
    <meta name="twitter:card" content="summary" />
    <meta name="twitter:image" content="${BASE_URL}/og-image.png" />
    <meta name="twitter:title" content="Sitemap — aicalc.cloud" />
    <meta name="twitter:description" content="Browse all ${totalListed} pages on aicalc.cloud." />
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500;600;700&display=swap" rel="stylesheet" />
    <style>
      *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
      body {
        font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
        background: #0a0a0a; color: #e5e5e5;
        line-height: 1.6; min-height: 100vh;
      }
      .container { max-width: 960px; margin: 0 auto; padding: 2rem 1.5rem; }
      h1 {
        font-size: 2rem; font-weight: 700; margin-bottom: 0.5rem;
        background: linear-gradient(135deg, #60a5fa, #a78bfa);
        -webkit-background-clip: text; -webkit-text-fill-color: transparent;
      }
      .subtitle { color: #a3a3a3; margin-bottom: 2rem; font-size: 1.1rem; }
      .sitemap-category {
        margin-bottom: 2rem; padding: 1.5rem;
        background: #171717; border-radius: 12px;
        border: 1px solid #262626;
      }
      .sitemap-category h2 {
        font-size: 1.25rem; font-weight: 600; margin-bottom: 0.25rem; color: #fafafa;
      }
      .sitemap-count { color: #737373; font-size: 0.875rem; margin-bottom: 0.75rem; }
      .sitemap-links {
        columns: 2; column-gap: 1.5rem; list-style: none;
      }
      @media (max-width: 640px) { .sitemap-links { columns: 1; } }
      .sitemap-links li { break-inside: avoid; margin-bottom: 0.35rem; }
      .sitemap-links a {
        color: #60a5fa; text-decoration: none; font-size: 0.9rem;
        transition: color 0.15s;
      }
      .sitemap-links a:hover { color: #93c5fd; text-decoration: underline; }
      .back-home {
        display: inline-block; margin-top: 2rem; color: #737373;
        text-decoration: none; font-size: 0.9rem;
      }
      .back-home:hover { color: #a3a3a3; }
      .total-badge {
        display: inline-block; padding: 0.25rem 0.75rem;
        background: #1e3a5f; color: #60a5fa; border-radius: 999px;
        font-size: 0.85rem; font-weight: 500; margin-left: 0.5rem;
      }
    </style>
  </head>
  <body>
    <div class="container">
      <h1>Sitemap <span class="total-badge">${totalListed} pages</span></h1>
      <p class="subtitle">Browse all pages on aicalc.cloud — free developer tools for AI costs, cron scheduling, security, and self-hosted software.</p>
${sectionsHtml}
      <a href="/" class="back-home">← Back to Home</a>
    </div>
  </body>
</html>`

  // Write to dist/sitemap/index.html
  const outDir = path.join(DIST_DIR, 'sitemap')
  fs.mkdirSync(outDir, { recursive: true })
  fs.writeFileSync(path.join(outDir, 'index.html'), html)

  console.log(`Generated /sitemap/ page with ${totalListed} links in ${CATEGORIES.filter(c => groups.has(c.prefix)).length} categories`)
}

main()
