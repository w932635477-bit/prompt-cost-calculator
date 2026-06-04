const fs = require('fs')
const path = require('path')

const DIST_DIR = path.join(__dirname, '..', 'dist')
const PRERENDER_DIR = '/tmp/claude-501'

const PAGES = [
  { slug: 'home', distFile: 'index.html', route: '/' },
  { slug: 'cron-generator', distFile: 'cron-generator/index.html', route: '/cron-generator/' },
  { slug: 'alternatives', distFile: 'alternatives/index.html', route: '/alternatives/' },
  { slug: 'compare', distFile: 'compare/index.html', route: '/compare/' },
  { slug: 'deploy', distFile: 'deploy/index.html', route: '/deploy/' },
  { slug: 'llm-pricing', distFile: 'llm-pricing/index.html', route: '/llm-pricing/' },
  { slug: 'mcp-servers', distFile: 'mcp-servers/index.html', route: '/mcp-servers/' },
]

let injected = 0
let skipped = 0

for (const page of PAGES) {
  const prerenderFile = path.join(PRERENDER_DIR, `prerender-${page.slug}.html`)
  const distFile = path.join(DIST_DIR, page.distFile)

  if (!fs.existsSync(prerenderFile)) {
    console.log(`  ⚠ Skip ${page.route}: no prerender file`)
    skipped++
    continue
  }

  if (!fs.existsSync(distFile)) {
    console.log(`  ⚠ Skip ${page.route}: no dist file`)
    skipped++
    continue
  }

  const prerenderContent = fs.readFileSync(prerenderFile, 'utf-8')
  const distHtml = fs.readFileSync(distFile, 'utf-8')

  if (!prerenderContent.trim()) {
    console.log(`  ⚠ Skip ${page.route}: empty prerender content`)
    skipped++
    continue
  }

  // Replace <div id="root"></div> with <div id="root">PRERENDERED_CONTENT</div>
  const injectedHtml = distHtml.replace(
    '<div id="root"></div>',
    `<div id="root">${prerenderContent}</div>`
  )

  if (injectedHtml === distHtml) {
    console.log(`  ⚠ Skip ${page.route}: no <div id="root"></div> found`)
    skipped++
    continue
  }

  fs.writeFileSync(distFile, injectedHtml)
  const sizeKb = (Buffer.byteLength(injectedHtml) / 1024).toFixed(1)
  console.log(`  ✓ ${page.route} → ${sizeKb} KB (prerendered)`)
  injected++
}

console.log(`\nPrerendered: ${injected}, Skipped: ${skipped}`)
process.exit(injected === 0 ? 1 : 0)
