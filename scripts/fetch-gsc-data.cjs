#!/usr/bin/env node
// fetch-gsc-data.cjs — 拉取 Google Search Console 搜索分析数据
//
// 产出: ../docs/daily-scout/raw/gsc-YYYY-MM-DD.json
// 用法: node scripts/fetch-gsc-data.cjs
//
// OAuth2 桌面流程：首次运行会打开浏览器授权，token 存本地复用。

const { google } = require('googleapis')
const fs = require('fs')
const path = require('path')
const http = require('http')

// ── 配置 ──────────────────────────────────────────────
const CLIENT_SECRET_PATH = path.resolve(__dirname, '..', 'gsc-oauth-credentials.json')
const TOKEN_PATH = path.resolve(__dirname, '..', '.gsc-oauth-token.json')
const OUTPUT_DIR = path.resolve(__dirname, '..', '..', 'docs', 'daily-scout', 'raw')
const SITE_URL = 'sc-domain:aicalc.cloud'
const DAYS_BACK = 90
const ROW_LIMIT = 25000

// ── OAuth2 客户端 ─────────────────────────────────────
function loadOAuthClient () {
  if (!fs.existsSync(CLIENT_SECRET_PATH)) {
    console.error('缺少 OAuth 凭证文件:', CLIENT_SECRET_PATH)
    console.error('请把 Downloads 里的 client_secret_*.json 复制为 gsc-oauth-credentials.json')
    process.exit(1)
  }
  const cred = JSON.parse(fs.readFileSync(CLIENT_SECRET_PATH, 'utf8'))
  const installed = cred.installed || cred.web
  if (!installed) {
    console.error('凭证文件格式不对，需要 installed 或 web 类型')
    process.exit(1)
  }
  const { client_id, client_secret, redirect_uris } = installed
  return new google.auth.OAuth2(client_id, client_secret, redirect_uris[0] || 'http://localhost:3000')
}

// ── 手动授权码流程 ──────────────────────────────────
async function waitForCode (oAuth2Client) {
  const authUrl = oAuth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: ['https://www.googleapis.com/auth/webmasters.readonly'],
    prompt: 'consent'
  })
  console.log('\n请在浏览器中打开这个链接并授权：')
  console.log(authUrl)
  console.log('\n授权后，把浏览器地址栏里的 code=xxx 参数值粘贴到这里：')

  // 尝试自动打开浏览器
  try {
    const { execSync } = require('child_process')
    process.platform === 'darwin'
      ? execSync(`open "${authUrl}"`)
      : execSync(`xdg-open "${authUrl}" 2>/dev/null || true`)
  } catch {}

  // 从 stdin 读取授权码
  const readline = require('readline')
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout })
  return new Promise(resolve => {
    rl.question('Authorization code: ', code => {
      rl.close()
      resolve(code.trim())
    })
  })
}

async function getAuthenticatedClient () {
  const oAuth2Client = loadOAuthClient()

  // 已有 token → 直接用
  if (fs.existsSync(TOKEN_PATH)) {
    const token = JSON.parse(fs.readFileSync(TOKEN_PATH, 'utf8'))
    oAuth2Client.setCredentials(token)

    // 如果 token 过期且有 refresh_token → 自动刷新
    if (token.expiry_date && Date.now() > token.expiry_date) {
      console.log('Token 过期，刷新中...')
      const { credentials } = await oAuth2Client.refreshAccessToken()
      fs.writeFileSync(TOKEN_PATH, JSON.stringify(credentials, null, 2))
      oAuth2Client.setCredentials(credentials)
    }
    return oAuth2Client
  }

  // 首次授权
  const code = await waitForCode(oAuth2Client)
  const { tokens } = await oAuth2Client.getToken(code)
  oAuth2Client.setCredentials(tokens)
  fs.writeFileSync(TOKEN_PATH, JSON.stringify(tokens, null, 2))
  console.log('Token 已保存到', TOKEN_PATH)
  return oAuth2Client
}

// ── 拉取 GSC 数据 ────────────────────────────────────
async function fetchGscData (auth) {
  const searchconsole = google.searchconsole({ version: 'v1', auth })

  const endDate = new Date()
  const startDate = new Date()
  startDate.setDate(startDate.getDate() - DAYS_BACK)

  const fmt = d => d.toISOString().slice(0, 10)

  console.log(`\n拉取 ${SITE_URL} 搜索分析数据...`)
  console.log(`  日期范围: ${fmt(startDate)} ~ ${fmt(endDate)}`)
  console.log(`  按 query 分组，最多 ${ROW_LIMIT} 行`)

  // GSC API 最多返回 25000 行，按 query 分组
  const allRows = []
  let startRow = 0

  while (true) {
    const res = await searchconsole.searchanalytics.query({
      siteUrl: SITE_URL,
      requestBody: {
        startDate: fmt(startDate),
        endDate: fmt(endDate),
        dimensions: ['query'],
        rowLimit: Math.min(ROW_LIMIT, 25000),
        startRow
      }
    })

    const rows = res.data.rows || []
    if (rows.length === 0) break

    allRows.push(...rows.map(r => ({
      query: r.keys[0],
      clicks: r.clicks,
      impressions: r.impressions,
      ctr: +r.ctr.toFixed(4),
      position: +r.position.toFixed(1)
    })))

    console.log(`  已拉取 ${allRows.length} 条 (startRow=${startRow})`)

    if (rows.length < 25000) break
    startRow += 25000
  }

  return allRows
}

// ── 同时拉取按 page 分组的数据 ──────────────────────
async function fetchGscByPage (auth) {
  const searchconsole = google.searchconsole({ version: 'v1', auth })

  const endDate = new Date()
  const startDate = new Date()
  startDate.setDate(startDate.getDate() - DAYS_BACK)
  const fmt = d => d.toISOString().slice(0, 10)

  console.log(`\n拉取按 page 分组的数据...`)

  const res = await searchconsole.searchanalytics.query({
    siteUrl: SITE_URL,
    requestBody: {
      startDate: fmt(startDate),
      endDate: fmt(endDate),
      dimensions: ['page'],
      rowLimit: 5000
    }
  })

  return (res.data.rows || []).map(r => ({
    page: r.keys[0],
    clicks: r.clicks,
    impressions: r.impressions,
    ctr: +r.ctr.toFixed(4),
    position: +r.position.toFixed(1)
  }))
}

// ── 主流程 ────────────────────────────────────────────
async function main () {
  const auth = await getAuthenticatedClient()

  const byQuery = await fetchGscData(auth)
  const byPage = await fetchGscByPage(auth)

  // 按 impressions 降序
  byQuery.sort((a, b) => b.impressions - a.impressions)
  byPage.sort((a, b) => b.impressions - a.impressions)

  const date = new Date().toISOString().slice(0, 10)
  const output = {
    date,
    siteUrl: SITE_URL,
    dateRange: `${new Date(Date.now() - DAYS_BACK * 86400000).toISOString().slice(0, 10)} ~ ${date}`,
    summary: {
      totalQueries: byQuery.length,
      totalClicks: byQuery.reduce((s, r) => s + r.clicks, 0),
      totalImpressions: byQuery.reduce((s, r) => s + r.impressions, 0),
      totalPages: byPage.length
    },
    byQuery,
    byPage
  }

  fs.mkdirSync(OUTPUT_DIR, { recursive: true })
  const outPath = path.join(OUTPUT_DIR, `gsc-${date}.json`)
  fs.writeFileSync(outPath, JSON.stringify(output, null, 2))

  console.log(`\n${'='.repeat(50)}`)
  console.log(`总查询词: ${output.summary.totalQueries}`)
  console.log(`总点击: ${output.summary.totalClicks}`)
  console.log(`总展现: ${output.summary.totalImpressions}`)
  console.log(`总页面: ${output.summary.totalPages}`)
  console.log(`\nTop 10 展现词:`)
  byQuery.slice(0, 10).forEach((r, i) => {
    console.log(`  ${i + 1}. "${r.query}" — ${r.impressions} 展现, ${r.clicks} 点击, pos ${r.position}`)
  })
  console.log(`\n→ ${outPath}`)
}

main().catch(err => {
  console.error('错误:', err.message || err)
  if (err.response?.data) console.error('API 错误:', JSON.stringify(err.response.data))
  process.exit(1)
})
