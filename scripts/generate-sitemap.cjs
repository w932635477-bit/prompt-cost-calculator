const fs = require('fs')
const path = require('path')
const { execSync } = require('child_process')

const BASE_URL = 'https://prompt-cost-calculator-ten.vercel.app'
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

const allUrls = [
  { loc: BASE_URL + '/', priority: '1.0', changefreq: 'weekly' },
  { loc: BASE_URL + '/cron-generator/', priority: '0.9', changefreq: 'weekly' },
  { loc: BASE_URL + '/cron-generator/common-patterns/', priority: '0.85', changefreq: 'weekly' },
  { loc: BASE_URL + '/alternatives/', priority: '0.9', changefreq: 'weekly' },
  { loc: BASE_URL + '/agent-safety/', priority: '0.9', changefreq: 'weekly' },
  { loc: BASE_URL + '/voice-agent-pricing/', priority: '0.9', changefreq: 'weekly' },
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

const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${allUrls.map(u => `  <url>
    <loc>${u.loc}</loc>
    <changefreq>${u.changefreq}</changefreq>
    <priority>${u.priority}</priority>
  </url>`).join('\n')}
</urlset>
`

fs.writeFileSync(path.join(DIST_DIR, 'sitemap.xml'), sitemap)
console.log(`Generated sitemap.xml with ${allUrls.length} URLs`)
