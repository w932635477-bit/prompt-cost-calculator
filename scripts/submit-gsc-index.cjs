#!/usr/bin/env node
// submit-gsc-index.cjs — 提交 URL 到 Google Indexing API 请求索引
//
// 用法: node scripts/submit-gsc-index.cjs [URL]
// 默认提交: https://aicalc.cloud/token-counter/

const { google } = require('googleapis')
const fs = require('fs')
const path = require('path')
const readline = require('readline')

const CLIENT_SECRET_PATH = path.resolve(__dirname, '..', 'gsc-oauth-credentials.json')
const TOKEN_PATH = path.resolve(__dirname, '..', '.gsc-indexing-token.json')
const INDEXING_SCOPE = 'https://www.googleapis.com/auth/indexing'

const TARGET_URL = process.argv[2] || 'https://aicalc.cloud/token-counter/'

function loadOAuthClient() {
  if (!fs.existsSync(CLIENT_SECRET_PATH)) {
    console.error('缺少 OAuth 凭证:', CLIENT_SECRET_PATH)
    process.exit(1)
  }
  const cred = JSON.parse(fs.readFileSync(CLIENT_SECRET_PATH, 'utf8'))
  const installed = cred.installed || cred.web
  const { client_id, client_secret, redirect_uris } = installed
  return new google.auth.OAuth2(client_id, client_secret, redirect_uris[0] || 'http://localhost:3000')
}

async function getAuthenticatedClient() {
  const oAuth2Client = loadOAuthClient()

  if (fs.existsSync(TOKEN_PATH)) {
    const token = JSON.parse(fs.readFileSync(TOKEN_PATH, 'utf8'))
    oAuth2Client.setCredentials(token)
    if (token.expiry_date && Date.now() > token.expiry_date) {
      console.log('Token 过期，刷新中...')
      const { credentials } = await oAuth2Client.refreshAccessToken()
      fs.writeFileSync(TOKEN_PATH, JSON.stringify(credentials, null, 2))
      oAuth2Client.setCredentials(credentials)
    }
    return oAuth2Client
  }

  const authUrl = oAuth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: [INDEXING_SCOPE],
    prompt: 'consent'
  })
  console.log('\n请在浏览器中授权（需要 Indexing API 权限）：')
  console.log(authUrl)

  try {
    const { execSync } = require('child_process')
    process.platform === 'darwin'
      ? execSync(`open "${authUrl}"`)
      : execSync(`xdg-open "${authUrl}" 2>/dev/null || true`)
  } catch {}

  const rl = readline.createInterface({ input: process.stdin, output: process.stdout })
  const code = await new Promise(resolve => {
    rl.question('Authorization code: ', c => { rl.close(); resolve(c.trim()) })
  })

  const { tokens } = await oAuth2Client.getToken(code)
  oAuth2Client.setCredentials(tokens)
  fs.writeFileSync(TOKEN_PATH, JSON.stringify(tokens, null, 2))
  console.log('Token 已保存到', TOKEN_PATH)
  return oAuth2Client
}

async function submitIndex(auth) {
  const res = await fetch('https://indexing.googleapis.com/v3/urlNotifications:publish', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${(await auth.getAccessToken()).token}`
    },
    body: JSON.stringify({ url: TARGET_URL, type: 'URL_UPDATED' })
  })

  const body = await res.json()
  if (res.ok) {
    console.log(`\n✅ 已提交索引请求: ${TARGET_URL}`)
    console.log('响应:', JSON.stringify(body, null, 2))
    console.log('\nGoogle 通常在几小时到几天内处理索引请求。')
  } else {
    console.error(`\n❌ 提交失败 (HTTP ${res.status})`)
    console.error('错误:', JSON.stringify(body, null, 2))
    if (body.error?.message?.includes('Permission')) {
      console.error('\n可能需要在 GCP Console 启用 Indexing API:')
      console.error('https://console.cloud.google.com/apis/library/indexing.googleapis.com')
    }
  }
}

async function main() {
  console.log(`提交 URL 到 Google Indexing API: ${TARGET_URL}`)
  const auth = await getAuthenticatedClient()
  await submitIndex(auth)
}

main().catch(err => {
  console.error('错误:', err.message || err)
  process.exit(1)
})
