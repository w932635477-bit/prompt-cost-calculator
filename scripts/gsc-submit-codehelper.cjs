const fs = require('fs')
const path = require('path')
const crypto = require('crypto')
const { execSync } = require('child_process')

function curlPost(url, body, headers = {}) {
  const headerArgs = Object.entries(headers).map(([k, v]) => `-H '${k}: ${v}'`).join(' ')
  const escapedBody = body.replace(/'/g, "'\\''")
  const cmd = `curl -s -X POST ${headerArgs} -d '${escapedBody}' '${url}'`
  return execSync(cmd, { encoding: 'utf-8', timeout: 15000 })
}

const KEY_FILE = path.join(process.env.HOME, 'Downloads', 'gsc-indexing-497309-c9c682ceec78.json')
const BASE = 'https://codehelper.xyz'

// Priority order: hubs first (most SEO weight), then yesterday's leftovers,
// then the tools that just shipped (Tool Finder etc).
const URLS = [
  // Hubs — must re-crawl after domain migration so Google sees new canonicals
  `${BASE}/`,
  `${BASE}/cron-generator/`,
  `${BASE}/alternatives/`,
  `${BASE}/deploy/`,
  `${BASE}/compare/`,
  `${BASE}/token-tracker/`,
  `${BASE}/agent-safety/`,
  `${BASE}/voice-agent-pricing/`,
  // Yesterday's leftover (gsc-indexing-todo-20260522.md, now on codehelper.xyz)
  `${BASE}/alternatives/google-drive/`,
  `${BASE}/deploy/slack/`,
  `${BASE}/deploy/github/`,
  `${BASE}/deploy/notion/`,
  `${BASE}/deploy/google-drive/`,
  `${BASE}/deploy/spotify/`,
  `${BASE}/deploy/netflix/`,
  `${BASE}/deploy/lastpass/`,
  `${BASE}/deploy/zapier/`,
  `${BASE}/cron-generator/every-hour/`,
  `${BASE}/cron-generator/every-monday/`,
]

function base64url(buf) {
  return buf.toString('base64').replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_')
}

function getAccessToken(key) {
  const now = Math.floor(Date.now() / 1000)
  const header = { alg: 'RS256', typ: 'JWT' }
  const payload = {
    iss: key.client_email,
    scope: 'https://www.googleapis.com/auth/indexing',
    aud: 'https://oauth2.googleapis.com/token',
    iat: now,
    exp: now + 3600,
  }
  const headerB64 = base64url(Buffer.from(JSON.stringify(header)))
  const payloadB64 = base64url(Buffer.from(JSON.stringify(payload)))
  const signInput = `${headerB64}.${payloadB64}`
  const sign = crypto.createSign('RSA-SHA256')
  sign.update(signInput)
  const signature = base64url(sign.sign(key.private_key))
  const jwt = `${signInput}.${signature}`
  const body = `grant_type=urn:ietf:params:oauth:grant-type:jwt-bearer&assertion=${jwt}`
  const result = curlPost('https://oauth2.googleapis.com/token', body, {
    'Content-Type': 'application/x-www-form-urlencoded',
  })
  const data = JSON.parse(result)
  if (!data.access_token) throw new Error(`Token error: ${JSON.stringify(data)}`)
  return data.access_token
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

function run() {
  const key = JSON.parse(fs.readFileSync(KEY_FILE, 'utf-8'))
  console.log(`Service account: ${key.client_email}`)
  console.log(`URLs to submit: ${URLS.length}\n`)

  const token = getAccessToken(key)
  console.log('Access token obtained\n')

  let ok = 0, fail = 0
  const failures = []
  for (const url of URLS) {
    try {
      const result = submitUrl(url, token)
      if (result.status === 'ok') {
        ok++
        console.log(`  ✓ ${url}`)
      } else {
        fail++
        failures.push(result)
        console.log(`  ✗ ${url} — ${result.code}: ${result.message}`)
      }
    } catch (e) {
      fail++
      failures.push({ url, error: e.message })
      console.log(`  ✗ ${url} — ${e.message}`)
    }
  }
  console.log(`\n${'═'.repeat(50)}`)
  console.log(`SUCCESS: ${ok}  FAILED: ${fail}  TOTAL: ${URLS.length}`)
  console.log(`${'═'.repeat(50)}`)
  if (failures.length) console.log('\nFailures:', JSON.stringify(failures, null, 2))
}

run()
