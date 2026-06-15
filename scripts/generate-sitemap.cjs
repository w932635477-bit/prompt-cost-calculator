const fs = require('fs')
const path = require('path')
const { execSync } = require('child_process')

const BASE_URL = 'https://aicalc.cloud'
const LOCALES = ['zh', 'ja', 'es', 'pt', 'fr', 'de', 'ko']
const DIST_DIR = path.join(__dirname, '..', 'dist')

// Read slugs from long-tail data
const dataFile = path.join(__dirname, '..', 'src', 'cron', 'seo', 'long-tail-data.ts')
const dataContent = fs.readFileSync(dataFile, 'utf-8')
const slugMatches = [...dataContent.matchAll(/slug: '([^']+)'/g)]

// Read slugs from alternatives data
const altDataFile = path.join(__dirname, '..', 'src', 'alternatives', 'seo', 'alternatives-data.ts')
const altDataContent = fs.readFileSync(altDataFile, 'utf-8')
const altSlugMatches = [...altDataContent.matchAll(/slug: '([^']+)'/g)]

// Read slugs from deploy data
const deployDataFile = path.join(__dirname, '..', 'src', 'deploy', 'seo', 'deploy-data.ts')
const deployDataContent = fs.readFileSync(deployDataFile, 'utf-8')
const deploySlugMatches = [...deployDataContent.matchAll(/slug: '([^']+)'/g)]

// Read slugs from compare data
const compareDataFile = path.join(__dirname, '..', 'src', 'compare', 'seo', 'compare-data.ts')
const compareDataContent = fs.readFileSync(compareDataFile, 'utf-8')
const compareSlugMatches = [...compareDataContent.matchAll(/slug: '([^']+)'/g)]

// Read slugs from token tracker data
const trackerDataFile = path.join(__dirname, '..', 'src', 'token-tracker', 'seo', 'scene-data.ts')
const trackerDataContent = fs.readFileSync(trackerDataFile, 'utf-8')
const trackerSlugMatches = [...trackerDataContent.matchAll(/slug: '([^']+)'/g)]

// Read slugs from MCP server data
const mcpDataFile = path.join(__dirname, '..', 'src', 'mcp', 'seo', 'mcp-data.ts')
const mcpDataContent = fs.readFileSync(mcpDataFile, 'utf-8')
const mcpSlugMatches = [...mcpDataContent.matchAll(/slug: '([^']+)'/g)]

// Read slugs from llm-pricing SEO data
const pricingSeoDataFile = path.join(__dirname, '..', 'src', 'llm-pricing', 'seo', 'pricing-seo-data.ts')
const pricingSeoDataContent = fs.readFileSync(pricingSeoDataFile, 'utf-8')
const pricingSeoSlugMatches = [...pricingSeoDataContent.matchAll(/slug: '([^']+)'/g)]

// Read slugs from llm-cost SEO data
const costSeoDataFile = path.join(__dirname, '..', 'src', 'llm-pricing', 'seo', 'cost-seo-data.ts')
const costSeoDataContent = fs.readFileSync(costSeoDataFile, 'utf-8')
const costSeoSlugMatches = [...costSeoDataContent.matchAll(/slug: '([^']+)'/g)]

// Read slugs from cron-validator data
const validatorDataFile = path.join(__dirname, '..', 'src', 'cron-validator', 'seo', 'validator-data.ts')
const validatorDataContent = fs.readFileSync(validatorDataFile, 'utf-8')
const validatorSlugMatches = [...validatorDataContent.matchAll(/slug: '([^']+)'/g)]

const allUrls = [
  { loc: BASE_URL + '/', priority: '1.0', changefreq: 'weekly' },
  { loc: BASE_URL + '/cron-generator/', priority: '0.9', changefreq: 'weekly' },
  { loc: BASE_URL + '/cron-generator/common-patterns/', priority: '0.85', changefreq: 'weekly' },
  { loc: BASE_URL + '/cron-generator/vercel-cron/', priority: '0.85', changefreq: 'weekly' },
  { loc: BASE_URL + '/alternatives/', priority: '0.9', changefreq: 'weekly' },
  { loc: BASE_URL + '/agent-safety/', priority: '0.9', changefreq: 'weekly' },
  { loc: BASE_URL + '/voice-agent-pricing/', priority: '0.9', changefreq: 'weekly' },
  { loc: BASE_URL + '/compare/', priority: '0.9', changefreq: 'weekly' },
  { loc: BASE_URL + '/deploy/', priority: '0.9', changefreq: 'weekly' },
  { loc: BASE_URL + '/token-tracker/', priority: '0.9', changefreq: 'weekly' },
  { loc: BASE_URL + '/token-counter/', priority: '0.9', changefreq: 'weekly' },
  { loc: BASE_URL + '/finder/notes/', priority: '0.9', changefreq: 'weekly' },
  { loc: BASE_URL + '/finder/chat/', priority: '0.9', changefreq: 'weekly' },
  { loc: BASE_URL + '/finder/productivity/', priority: '0.9', changefreq: 'weekly' },
  { loc: BASE_URL + '/photos/', priority: '0.9', changefreq: 'weekly' },
  { loc: BASE_URL + '/prompt-cache-calculator/', priority: '0.9', changefreq: 'weekly' },
  { loc: BASE_URL + '/mcp-servers/', priority: '0.9', changefreq: 'weekly' },
  { loc: BASE_URL + '/csp-generator/', priority: '0.9', changefreq: 'weekly' },
  { loc: BASE_URL + '/pii-redactor/', priority: '0.9', changefreq: 'weekly' },
  { loc: BASE_URL + '/env-scanner/', priority: '0.9', changefreq: 'weekly' },
  { loc: BASE_URL + '/ai-code-review/', priority: '0.9', changefreq: 'weekly' },
  { loc: BASE_URL + '/ai-code-review/how-to-review-ai-generated-code/', priority: '0.85', changefreq: 'weekly' },
  { loc: BASE_URL + '/ai-code-review/ai-pr-review-checklist/', priority: '0.85', changefreq: 'weekly' },
  { loc: BASE_URL + '/ai-agent-data-access/', priority: '0.9', changefreq: 'weekly' },
  { loc: BASE_URL + '/llm-pricing/', priority: '0.9', changefreq: 'weekly' },
  { loc: BASE_URL + '/cron-validator/', priority: '0.9', changefreq: 'weekly' },
  { loc: BASE_URL + '/dep-shield/', priority: '0.9', changefreq: 'weekly' },
  { loc: BASE_URL + '/ai-agent-security/', priority: '0.9', changefreq: 'weekly' },
  { loc: BASE_URL + '/local-llm-privacy/', priority: '0.9', changefreq: 'weekly' },
  { loc: BASE_URL + '/token-optimizer/', priority: '0.9', changefreq: 'weekly' },
  { loc: BASE_URL + '/testing-strategy-picker/', priority: '0.9', changefreq: 'weekly' },
  { loc: BASE_URL + '/testing-strategy-picker/web-app/', priority: '0.85', changefreq: 'monthly' },
  { loc: BASE_URL + '/testing-strategy-picker/api/', priority: '0.85', changefreq: 'monthly' },
  { loc: BASE_URL + '/testing-strategy-picker/mobile/', priority: '0.85', changefreq: 'monthly' },
  { loc: BASE_URL + '/aider-tutorial/', priority: '0.85', changefreq: 'monthly' },
  { loc: BASE_URL + '/microsoft-scout-agent/', priority: '0.85', changefreq: 'monthly' },
  { loc: BASE_URL + '/llm-pricing/compare-all/', priority: '0.9', changefreq: 'weekly' },
  { loc: BASE_URL + '/alternatives-guide/', priority: '0.9', changefreq: 'weekly' },
  { loc: BASE_URL + '/guides/ai-api-costs/', priority: '0.9', changefreq: 'weekly' },
  { loc: BASE_URL + '/sitemap/', priority: '0.6', changefreq: 'weekly' },
  { loc: BASE_URL + '/about/', priority: '0.5', changefreq: 'monthly' },
  { loc: BASE_URL + '/privacy-policy/', priority: '0.5', changefreq: 'monthly' },
  { loc: BASE_URL + '/contact/', priority: '0.5', changefreq: 'monthly' },
  { loc: BASE_URL + '/terms/', priority: '0.5', changefreq: 'monthly' },
]

for (const locale of LOCALES) {
  allUrls.push({ loc: `${BASE_URL}/cron-generator/${locale}/`, priority: '0.7', changefreq: 'monthly' })
}

for (const m of slugMatches) {
  allUrls.push({ loc: `${BASE_URL}/cron-generator/${m[1]}/`, priority: '0.8', changefreq: 'monthly' })
}

for (const m of altSlugMatches) {
  allUrls.push({ loc: `${BASE_URL}/alternatives/${m[1]}/`, priority: '0.8', changefreq: 'monthly' })
}

for (const m of deploySlugMatches) {
  allUrls.push({ loc: `${BASE_URL}/deploy/${m[1]}/`, priority: '0.8', changefreq: 'monthly' })
}

for (const m of compareSlugMatches) {
  allUrls.push({ loc: `${BASE_URL}/compare/${m[1]}/`, priority: '0.85', changefreq: 'monthly' })
}

for (const m of trackerSlugMatches) {
  allUrls.push({ loc: `${BASE_URL}/token-tracker/${m[1]}/`, priority: '0.85', changefreq: 'monthly' })
}

for (const m of mcpSlugMatches) {
  allUrls.push({ loc: `${BASE_URL}/mcp-servers/${m[1]}/`, priority: '0.85', changefreq: 'monthly' })
}

for (const m of pricingSeoSlugMatches) {
  allUrls.push({ loc: `${BASE_URL}/llm-pricing/${m[1]}/`, priority: '0.85', changefreq: 'monthly' })
}

for (const m of costSeoSlugMatches) {
  allUrls.push({ loc: `${BASE_URL}/llm-pricing/${m[1]}/`, priority: '0.85', changefreq: 'monthly' })
}

for (const m of validatorSlugMatches) {
  allUrls.push({ loc: `${BASE_URL}/cron-validator/${m[1]}/`, priority: '0.85', changefreq: 'monthly' })
}

// lastmod = last git commit date per source HTML file. This is the ONE sitemap
// tag Google actually uses for recrawl prioritization (changefreq/priority are
// largely ignored). git log is newest-first, so the first date seen per file wins.
const REPO = path.join(__dirname, '..')
const lastMod = {}
try {
  const gitOut = execSync('git log --pretty=format:%cd --date=short --name-only', {
    cwd: REPO, encoding: 'utf-8', maxBuffer: 64 * 1024 * 1024,
  })
  let cur = null
  for (const raw of gitOut.split('\n')) {
    const line = raw.trim()
    if (/^\d{4}-\d{2}-\d{2}$/.test(line)) cur = line
    else if (line && cur && !lastMod[line]) lastMod[line] = cur
  }
} catch (e) {
  console.warn('git log failed (lastmod will be omitted):', e.message)
}
function lastmodFor(loc) {
  const p = loc.replace(BASE_URL + '/', '').replace(BASE_URL, '')
  const file = p === '' ? 'index.html' : p.replace(/\/$/, '') + '/index.html'
  return lastMod[file] || null
}

const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${allUrls.map(u => {
  const lm = lastmodFor(u.loc)
  return `  <url>
    <loc>${u.loc}</loc>${lm ? `\n    <lastmod>${lm}</lastmod>` : ''}
    <changefreq>${u.changefreq}</changefreq>
    <priority>${u.priority}</priority>
  </url>`
}).join('\n')}
</urlset>
`

fs.writeFileSync(path.join(DIST_DIR, 'sitemap.xml'), sitemap)
const withLastmod = allUrls.filter(u => lastmodFor(u.loc)).length
console.log(`Generated sitemap.xml with ${allUrls.length} URLs (${withLastmod} with lastmod)`)
