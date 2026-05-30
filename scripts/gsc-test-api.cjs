#!/usr/bin/env node
/**
 * Test GSC Search Analytics API access for our service account
 */
const path = require('path')
const os = require('os')
const { google } = require('googleapis')

const KEY_FILE = process.env.GSC_KEY_FILE || path.join(os.homedir(), 'Downloads', 'gsc-indexing-497309-c9c682ceec78.json')
const SITE_URL = 'https://aicalc.cloud/'

async function main() {
  console.log('Testing GSC Search Analytics API...')
  console.log('Key file:', KEY_FILE)
  console.log('Site URL:', SITE_URL)
  console.log('')

  const auth = new google.auth.GoogleAuth({
    keyFile: KEY_FILE,
    scopes: ['https://www.googleapis.com/auth/webmasters.readonly'],
  })

  const webmasters = google.webmasters({ version: 'v3', auth })

  // Try to list properties first
  try {
    const sites = await webmasters.sites.list()
    console.log('Accessible sites:')
    ;(sites.data.siteEntry || []).forEach(s => {
      console.log(`  - ${s.siteUrl}  (${s.permissionLevel})`)
    })
  } catch (e) {
    console.error('sites.list failed:', e.message)
    return
  }

  // Try to query analytics for codehelper.xyz
  console.log('')
  console.log('Querying last 7 days...')
  const endDate = new Date().toISOString().slice(0, 10)
  const startDate = new Date(Date.now() - 7 * 86400 * 1000).toISOString().slice(0, 10)

  const candidates = ['https://aicalc.cloud/', 'sc-domain:codehelper.xyz']

  for (const site of candidates) {
    try {
      const res = await webmasters.searchanalytics.query({
        siteUrl: site,
        requestBody: {
          startDate,
          endDate,
          dimensions: ['query'],
          rowLimit: 5,
        },
      })
      console.log(`✓ ${site} works! Got ${(res.data.rows || []).length} rows`)
      ;(res.data.rows || []).forEach(r => console.log(`    ${r.keys[0]}  clicks=${r.clicks} impressions=${r.impressions}`))
      return site
    } catch (e) {
      console.error(`✗ ${site} failed: ${e.message.split('\n')[0]}`)
    }
  }
}

main().catch(e => console.error('FATAL:', e.message))
