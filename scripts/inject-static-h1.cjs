/**
 * inject-static-h1.cjs
 * Post-build: inject static H1 + description into SPA tool pages
 * so Googlebot sees semantic content without JS execution.
 * React replaces the content on hydration.
 */
const fs = require('fs')
const path = require('path')

const DIST_DIR = path.join(__dirname, '..', 'dist')

const PAGES = [
  { file: 'token-tracker/index.html', h1: 'AI Token Cost Tracker', desc: 'Estimate API costs for chatbots, RAG pipelines, and AI agents across GPT, Claude, Gemini & more.' },
  { file: 'env-scanner/index.html', h1: '.env Security Scanner', desc: 'Scan .env files for leaked secrets, API keys, and sensitive data. Free browser-based tool.' },
  { file: 'token-counter/index.html', h1: 'Token Counter', desc: 'Count tokens for GPT, Claude, Gemini & more. Free browser-based token counter.' },
  { file: 'csp-generator/index.html', h1: 'CSP Header Generator', desc: 'Generate Content-Security-Policy headers with a visual editor. Includes presets and Report-Only mode.' },
  { file: 'dep-shield/index.html', h1: 'Dep Shield', desc: 'Scan npm dependencies for vulnerabilities using the OSV database. Get fix commands instantly.' },
  { file: 'pii-redactor/index.html', h1: 'Prompt PII Redactor', desc: 'Redact personally identifiable information from prompts before sending to AI APIs. 100% client-side.' },
  { file: 'ai-agent-security/index.html', h1: 'AI Agent Security Checker', desc: 'Audit AI agent configurations for security risks. 17 rules mapped to OWASP guidelines.' },
  { file: 'agent-safety/index.html', h1: 'AI Agent Safety Audit', desc: 'Assess AI agent safety risks with automated checks and recommendations.' },
  { file: 'ai-agent-data-access/index.html', h1: 'AI Agent Data Access Control', desc: 'Review AI agent data access patterns and identify over-privileged configurations.' },
  { file: 'prompt-cache-calculator/index.html', h1: 'Prompt Caching Calculator', desc: 'Calculate savings from prompt caching across GPT, Claude, and Gemini APIs.' },
  { file: 'voice-agent-pricing/index.html', h1: 'Voice Agent Pricing Calculator', desc: 'Compare voice AI pricing across providers. Estimate costs for phone agents and speech apps.' },
  { file: 'photos/index.html', h1: 'Free Stock Photo Finder', desc: 'Search free stock photos from Unsplash. No attribution required for most uses.' },
  { file: 'finder/chat/index.html', h1: 'AI Chat Finder', desc: 'Find the best AI chat platform for your needs. Compare features across 6 major platforms.' },
  { file: 'finder/notes/index.html', h1: 'Notes App Finder', desc: 'Find the best notes app for your workflow. Compare self-hosted and cloud options.' },
  { file: 'finder/productivity/index.html', h1: 'Productivity Tool Finder', desc: 'Find the best productivity tools for developers. 15 recommendations across 5 categories.' },
  { file: 'ai-code-review/index.html', h1: 'AI Code Review Checklist', desc: 'Review AI-generated code for security, correctness, and maintainability with this interactive checklist.' },
  { file: 'admin/dashboard/index.html', h1: 'Site Dashboard', desc: 'View site analytics, tool usage, and performance metrics for aicalc.cloud.' },
]

let injected = 0
let skipped = 0

for (const page of PAGES) {
  const filePath = path.join(DIST_DIR, page.file)

  if (!fs.existsSync(filePath)) {
    console.log(`  ⚠ Skip ${page.file}: file not found`)
    skipped++
    continue
  }

  const html = fs.readFileSync(filePath, 'utf-8')

  // Already has meaningful content inside #root (not just </div>)
  const rootMatch = html.match(/<div id="root"[^>]*>([\s\S]*?)<\/div>/)
  if (rootMatch && rootMatch[1].trim().length > 0 && rootMatch[1].trim() !== '') {
    // Check for actual content (not whitespace only)
    if (/<[a-zA-Z]/.test(rootMatch[1])) {
      console.log(`  ⚠ Skip ${page.file}: already has content in #root`)
      skipped++
      continue
    }
  }

  const staticContent = `<h1>${page.h1}</h1><p>${page.desc}</p>`
  const newHtml = html.replace(
    '<div id="root"></div>',
    `<div id="root">${staticContent}</div>`
  )

  if (newHtml === html) {
    console.log(`  ⚠ Skip ${page.file}: no <div id="root"></div> found`)
    skipped++
    continue
  }

  // Add display:none style so flash of static content is hidden
  // React replaces the content on mount
  const hiddenHtml = newHtml.replace(
    `<div id="root">${staticContent}</div>`,
    `<div id="root" style="visibility:hidden">${staticContent}</div>`
  )

  fs.writeFileSync(filePath, hiddenHtml)
  console.log(`  ✓ ${page.file} → h1="${page.h1}"`)
  injected++
}

console.log(`\nInjected: ${injected}, Skipped: ${skipped}`)
process.exit(injected === 0 && skipped > 0 ? 1 : 0)
