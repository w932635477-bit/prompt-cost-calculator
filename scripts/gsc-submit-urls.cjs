const fs = require('fs')
const path = require('path')
const crypto = require('crypto')
const { execSync } = require('child_process')

function curlPost(url, body, headers = {}) {
  const headerArgs = Object.entries(headers).map(([k, v]) => `-H '${k}: ${v}'`).join(' ')
  const escapedBody = body.replace(/'/g, "'\\''")
  const cmd = `curl -s -X POST ${headerArgs} -d '${escapedBody}' '${url}'`
  const result = execSync(cmd, { encoding: 'utf-8', timeout: 15000 })
  return result
}

const KEY_FILE = path.join(process.env.HOME, 'Downloads', 'gsc-indexing-497309-c9c682ceec78.json')
const BASE = 'https://codehelper.xyz'

const NEW_URLS = [
  // Compare hub
  `${BASE}/compare/`,
  // 12 new compare pages
  `${BASE}/compare/jellyfin-vs-plex/`,
  `${BASE}/compare/wordpress-vs-ghost/`,
  `${BASE}/compare/pi-hole-vs-adguard-home/`,
  `${BASE}/compare/home-assistant-vs-openhab/`,
  `${BASE}/compare/traefik-vs-nginx-proxy-manager/`,
  `${BASE}/compare/portainer-vs-yacht/`,
  `${BASE}/compare/prometheus-vs-grafana/`,
  `${BASE}/compare/authentik-vs-authelia/`,
  `${BASE}/compare/minio-vs-ceph/`,
  `${BASE}/compare/pleroma-vs-mastodon/`,
  `${BASE}/compare/mealie-vs-tandoor/`,
  `${BASE}/compare/stirling-pdf-vs-pdfding/`,
  // Token tracker
  `${BASE}/token-tracker/`,
  `${BASE}/token-tracker/chatbot-cost/`,
  `${BASE}/token-tracker/rag-cost/`,
  `${BASE}/token-tracker/ai-agent-cost/`,
  `${BASE}/token-tracker/coding-assistant-cost/`,
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
  if (!data.access_token) {
    throw new Error(`Token error: ${JSON.stringify(data)}`)
  }
  return data.access_token
}

function submitUrl(url, token) {
  const body = JSON.stringify({ url, type: 'URL_UPDATED' })
  const result = curlPost('https://indexing.googleapis.com/v3/urlNotifications:publish', body, {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
  })
  const data = JSON.parse(result)
  if (data.urlNotificationMetadata) {
    return { url, status: 'ok' }
  }
  return { url, status: 'error', code: data.error?.code || '?', message: JSON.stringify(data).substring(0, 200) }
}

function run() {
  const key = JSON.parse(fs.readFileSync(KEY_FILE, 'utf-8'))
  console.log(`Service account: ${key.client_email}`)
  console.log(`URLs to submit: ${NEW_URLS.length}\n`)

  let token
  try {
    token = getAccessToken(key)
    console.log('Access token obtained\n')
  } catch (e) {
    console.error('Failed to get token:', e.message)
    process.exit(1)
  }

  let ok = 0, fail = 0

  for (const url of NEW_URLS) {
    try {
      const result = submitUrl(url, token)
      if (result.status === 'ok') {
        ok++
        console.log(`  ✓ ${url}`)
      } else {
        fail++
        console.log(`  ✗ ${url} — ${result.code}: ${result.message}`)
      }
    } catch (e) {
      fail++
      console.log(`  ✗ ${url} — ${e.message}`)
    }
  }

  console.log(`\n${'═'.repeat(50)}`)
  console.log(`SUCCESS: ${ok}  FAILED: ${fail}  TOTAL: ${NEW_URLS.length}`)
  console.log(`${'═'.repeat(50)}`)
}

run()
