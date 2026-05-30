#!/usr/bin/env node
/**
 * GSC Performance Analysis for codehelper.xyz
 * 多维度拉取最近 28 天数据：总览 / 查询词 / 落地页 / 国家 / 设备 / 每日趋势
 * 复用 gsc-test-api.cjs 的 service account 鉴权
 */
const path = require('path')
const os = require('os')
const { google } = require('googleapis')

const KEY_FILE = process.env.GSC_KEY_FILE || path.join(os.homedir(), 'Downloads', 'gsc-indexing-497309-c9c682ceec78.json')

const DAYS = parseInt(process.env.DAYS || '28', 10)
const endDate = new Date(Date.now() - 2 * 86400 * 1000).toISOString().slice(0, 10) // GSC 数据延迟约 2 天
const startDate = new Date(Date.now() - (DAYS + 2) * 86400 * 1000).toISOString().slice(0, 10)

async function resolveSite(webmasters) {
  const sites = await webmasters.sites.list()
  const entries = (sites.data.siteEntry || []).map(s => s.siteUrl)
  for (const c of ['sc-domain:codehelper.xyz', 'https://aicalc.cloud/']) {
    if (entries.includes(c)) return c
  }
  return entries[0]
}

async function q(webmasters, siteUrl, dimensions, rowLimit = 25) {
  const res = await webmasters.searchanalytics.query({
    siteUrl,
    requestBody: { startDate, endDate, dimensions, rowLimit },
  })
  return res.data.rows || []
}

function fmt(r) {
  const ctr = (r.ctr * 100).toFixed(1)
  const pos = r.position.toFixed(1)
  return `clicks=${r.clicks}  impr=${r.impressions}  ctr=${ctr}%  pos=${pos}`
}

async function main() {
  const auth = new google.auth.GoogleAuth({
    keyFile: KEY_FILE,
    scopes: ['https://www.googleapis.com/auth/webmasters.readonly'],
  })
  const webmasters = google.webmasters({ version: 'v3', auth })
  const site = await resolveSite(webmasters)

  console.log('='.repeat(60))
  console.log(`GSC 数据分析  ${site}`)
  console.log(`区间: ${startDate} ~ ${endDate}  (${DAYS}天, 数据延迟2天)`)
  console.log('='.repeat(60))

  // 总览
  const total = await q(webmasters, site, [], 1)
  if (total.length) {
    console.log('\n【总览】')
    console.log('  ' + fmt(total[0]))
  } else {
    console.log('\n【总览】 0 数据（区间内没有任何曝光）')
  }

  // 查询词 Top 25
  const queries = await q(webmasters, site, ['query'], 25)
  console.log(`\n【搜索词 Top ${queries.length}】`)
  queries.forEach((r, i) => console.log(`  ${String(i + 1).padStart(2)}. "${r.keys[0]}"  ${fmt(r)}`))

  // 落地页 Top 25
  const pages = await q(webmasters, site, ['page'], 25)
  console.log(`\n【落地页 Top ${pages.length}】`)
  pages.forEach((r, i) => console.log(`  ${String(i + 1).padStart(2)}. ${r.keys[0].replace('https://aicalc.cloud', '')}  ${fmt(r)}`))

  // 国家 Top 15
  const countries = await q(webmasters, site, ['country'], 15)
  console.log(`\n【国家 Top ${countries.length}】`)
  countries.forEach((r, i) => console.log(`  ${String(i + 1).padStart(2)}. ${r.keys[0]}  ${fmt(r)}`))

  // 设备
  const devices = await q(webmasters, site, ['device'], 5)
  console.log('\n【设备】')
  devices.forEach(r => console.log(`  ${r.keys[0]}  ${fmt(r)}`))

  // 每日趋势
  const daily = await q(webmasters, site, ['date'], DAYS + 5)
  console.log('\n【每日趋势】(date  clicks  impr)')
  daily.forEach(r => console.log(`  ${r.keys[0]}  ${r.clicks}  ${r.impressions}`))

  console.log('\n' + '='.repeat(60))
}

main().catch(e => console.error('FATAL:', e.message))
