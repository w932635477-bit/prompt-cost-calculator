#!/usr/bin/env node
/**
 * GSC URL Indexing — OAuth 2.0 local server flow
 *
 * Starts a local HTTP server to receive the OAuth callback.
 * First run opens a browser for you to authorize with your Google account.
 * Token is cached for future runs.
 *
 * Usage:
 *   node scripts/gsc-submit-codehelper.cjs
 *   node scripts/gsc-submit-codehelper.cjs https://aicalc.cloud/some/page/
 */

const fs = require('fs')
const path = require('path')
const { execSync } = require('child_process')
const http = require('http')
const { URL } = require('url')

const TOKEN_CACHE = path.join(__dirname, '_gsc_oauth_token.json')
const BASE = 'https://aicalc.cloud'
const REDIRECT_PORT = 8089
const REDIRECT_URI = `http://localhost:${REDIRECT_PORT}`

const CLIENT_ID = process.env.GSC_CLIENT_ID || ''
const CLIENT_SECRET = process.env.GSC_CLIENT_SECRET || ''

const URLS = [
  `${BASE}/compare/logseq-vs-obsidian/`,
  `${BASE}/compare/outline-vs-notion/`,
  `${BASE}/ai-agent-data-access/`,
]

function curlPost(url, body, headers = {}) {
  const headerArgs = Object.entries(headers).map(([k, v]) => `-H '${k}: ${v}'`).join(' ')
  const escapedBody = body.replace(/'/g, "'\\''")
  const cmd = `curl -s -X POST ${headerArgs} -d '${escapedBody}' '${url}'`
  return execSync(cmd, { encoding: 'utf-8', timeout: 15000 })
}

function loadCachedToken() {
  if (!fs.existsSync(TOKEN_CACHE)) return null
  try {
    const data = JSON.parse(fs.readFileSync(TOKEN_CACHE, 'utf-8'))
    if (data.expiry_date && Date.now() < data.expiry_date) return data.access_token
    if (data.refresh_token) return refreshAccessToken(data.refresh_token)
  } catch {}
  return null
}

function refreshAccessToken(refreshToken) {
  if (!CLIENT_ID || !CLIENT_SECRET) {
    console.log('No CLIENT_ID/SECRET set, cannot refresh token')
    return null
  }
  const body = `client_id=${CLIENT_ID}&client_secret=${CLIENT_SECRET}&refresh_token=${refreshToken}&grant_type=refresh_token`
  const result = JSON.parse(curlPost('https://oauth2.googleapis.com/token', body, {
    'Content-Type': 'application/x-www-form-urlencoded',
  }))
  if (!result.access_token) {
    console.log('Refresh failed:', JSON.stringify(result))
    return null
  }
  const token = {
    access_token: result.access_token,
    refresh_token: refreshToken,
    expiry_date: Date.now() + (result.expires_in || 3600) * 1000,
  }
  fs.writeFileSync(TOKEN_CACHE, JSON.stringify(token, null, 2))
  return token.access_token
}

function oauthLocalServerFlow() {
  if (!CLIENT_ID || !CLIENT_SECRET) {
    console.log('GSC_CLIENT_ID or GSC_CLIENT_SECRET env var not set.')
    console.log('')
    console.log('Setup:')
    console.log('  1. Go to https://console.cloud.google.com/apis/credentials')
    console.log('  2. Create Credentials > OAuth client ID > Web application')
    console.log('  3. Add http://localhost:8089 to Authorized redirect URIs')
    console.log('  4. Run:')
    console.log('     export GSC_CLIENT_ID="your-client-id.apps.googleusercontent.com"')
    console.log('     export GSC_CLIENT_SECRET="your-client-secret"')
    process.exit(1)
  }

  const scope = encodeURIComponent('https://www.googleapis.com/auth/indexing')
  const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${CLIENT_ID}&redirect_uri=${encodeURIComponent(REDIRECT_URI)}&response_type=code&scope=${scope}&access_type=offline&prompt=consent`

  return new Promise((resolve, reject) => {
    const server = http.createServer(async (req, res) => {
      try {
        const reqUrl = new URL(req.url, REDIRECT_URI)
        const code = reqUrl.searchParams.get('code')
        const error = reqUrl.searchParams.get('error')

        if (error) {
          res.end('<h1>Authorization denied</h1><p>You can close this tab.</p>')
          server.close()
          reject(new Error(`OAuth error: ${error}`))
          return
        }

        if (!code) {
          res.end('<h1>Invalid response</h1>')
          server.close()
          reject(new Error('No auth code received'))
          return
        }

        // Exchange code for token
        const tokenBody = `code=${code}&client_id=${CLIENT_ID}&client_secret=${CLIENT_SECRET}&redirect_uri=${encodeURIComponent(REDIRECT_URI)}&grant_type=authorization_code`
        const tokenResult = JSON.parse(curlPost('https://oauth2.googleapis.com/token', tokenBody, {
          'Content-Type': 'application/x-www-form-urlencoded',
        }))

        if (!tokenResult.access_token) {
          res.end(`<h1>Token error</h1><pre>${JSON.stringify(tokenResult, null, 2)}</pre>`)
          server.close()
          reject(new Error('Failed to get access token'))
          return
        }

        const token = {
          access_token: tokenResult.access_token,
          refresh_token: tokenResult.refresh_token || '',
          expiry_date: Date.now() + (tokenResult.expires_in || 3600) * 1000,
        }
        fs.writeFileSync(TOKEN_CACHE, JSON.stringify(token, null, 2))

        res.end('<h1>Authorization successful!</h1><p>You can close this tab and go back to the terminal.</p>')
        server.close()
        resolve(token.access_token)
      } catch (e) {
        res.end(`<h1>Error</h1><pre>${e.message}</pre>`)
        server.close()
        reject(e)
      }
    })

    server.listen(REDIRECT_PORT, () => {
      console.log(`\nAuthorize this app:`)
      console.log(`  Open: ${authUrl}`)
      console.log(`\nWaiting for authorization...`)
      try { execSync(`open "${authUrl}"`, { stdio: 'ignore' }) } catch {}
    })

    // Timeout after 5 minutes
    setTimeout(() => {
      server.close()
      reject(new Error('Authorization timed out'))
    }, 300000)
  })
}

function submitUrl(url, token) {
  const body = JSON.stringify({ url, type: 'URL_UPDATED' })
  const result = curlPost('https://indexing.googleapis.com/v3/urlNotifications:publish', body, {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
  })
  const data = JSON.parse(result)
  if (data.urlNotificationMetadata) return { url, status: 'ok' }
  return {
    url,
    status: 'error',
    code: data.error?.code || '?',
    message: JSON.stringify(data).substring(0, 250),
  }
}

async function run() {
  const urls = process.argv.slice(2)
  const targetUrls = urls.length > 0 ? urls : URLS

  console.log(`URLs to submit: ${targetUrls.length}`)

  let token = loadCachedToken()

  if (!token) {
    token = await oauthLocalServerFlow()
    console.log('Authorization successful!\n')
  }

  console.log('')
  let ok = 0, fail = 0
  const failures = []
  for (const url of targetUrls) {
    try {
      const result = submitUrl(url, token)
      if (result.status === 'ok') {
        ok++
        console.log(`  OK ${url}`)
      } else {
        fail++
        failures.push(result)
        console.log(`  FAIL ${url} - ${result.code}: ${result.message}`)
      }
    } catch (e) {
      fail++
      failures.push({ url, error: e.message })
      console.log(`  FAIL ${url} - ${e.message}`)
    }
  }
  console.log(`\n${'='.repeat(50)}`)
  console.log(`SUCCESS: ${ok}  FAILED: ${fail}  TOTAL: ${targetUrls.length}`)
  console.log(`${'='.repeat(50)}`)
  if (failures.length) console.log('\nFailures:', JSON.stringify(failures, null, 2))
}

run().catch(e => {
  console.error(e.message)
  process.exit(1)
})
