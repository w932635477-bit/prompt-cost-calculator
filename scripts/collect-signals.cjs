#!/usr/bin/env node
// collect-signals.cjs — 多源信号采集器，替代已停更的 BuilderPulse Daily。
//
// 复刻 BuilderPulse 方法论的「多源采集」段：直接打原始数据源，归一化成统一信号，
// 套用「金钱优先」编辑取向打分，产出 daily-scout 可消费的信号摘要。
//
// 运行:  node scripts/collect-signals.cjs
// 读:    .env.local 里的 GITHUB_TOKEN（可选，无则跳过 GitHub 源）
// 写:    ../docs/daily-scout/raw/YYYY-MM-DD.json     全量归一化信号（审计留底）
//        ../docs/daily-scout/signals/YYYY-MM-DD.md   信号摘要（daily-scout Step1 读它）
//
// 容错: 单源失败只记 error 不中断；全部源失败才 exit 1（照 fetch-github-stats.cjs）。

const fs = require('fs')
const path = require('path')
const net = require('net')
const { ProxyAgent, setGlobalDispatcher } = require('undici')

const ROOT = path.resolve(__dirname, '..')                       // prompt-cost-calculator/
const OUT_DIR = path.resolve(ROOT, '../docs/daily-scout')        // part-time job/docs/daily-scout
const RAW_DIR = path.join(OUT_DIR, 'raw')
const SIGNALS_DIR = path.join(OUT_DIR, 'signals')
const ENV_FILE = path.join(ROOT, '.env.local')

const DAY_SECONDS = 86400
const TIMEOUT_MS = 15000
const UA = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 daily-scout/1.0'

// 「金钱优先」偏置：命中即提分，复刻 BuilderPulse「安静丢钱的人 > 情绪化最响的人」。
const MONEY_RE = /\$\d|\bpricing\b|\bexpensive\b|\bcost(s|ly)?\b|\bMRR\b|\bARR\b|alternative to|switch(ed|ing)? from|\bquota\b|rate.?limit|\bbilling\b|\bsubscription\b|paywall|too pricey/i
const COMPLAINT_RE = /\b(hate|annoying|frustrat|broken|sucks|terrible|worst|painful?|struggl|can'?t|doesn'?t work|stop(ped)? using|alternative to|switch(ed|ing)? from)\b/i
const LAUNCH_RE = /\b(built|launch(ed|ing)?|i made|show hn|introduc|releas(ed|ing)?|just shipped|my (new )?(app|tool|side ?project|saas))\b/i

const MONEY_BOOST = 1.0  // 加在归一化 engagement(0..1) 之上，足以把金钱信号顶到前面

// 国内 DNS 污染会让 node 直连 huggingface/google/reddit 解析到错误 IP（curl 走 Clash 才通）。
// 这些是 Clash Verge 常用混合端口，env 代理变量没有时按序探测。
const CLASH_PORTS = [7890, 7897, 7891, 1087]

// ---------- 工具 ----------

function probePort(host, port, timeout = 400) {
  return new Promise(res => {
    const sock = net.connect({ host, port })
    const done = ok => { sock.destroy(); res(ok) }
    sock.setTimeout(timeout)
    sock.once('connect', () => done(true))
    sock.once('timeout', () => done(false))
    sock.once('error', () => done(false))
  })
}

// 环境变量代理优先 → 自动探测 Clash 端口 → 都没有则直连（domestic-OK 源仍可用）。
async function setupProxy() {
  const envProxy = process.env.HTTPS_PROXY || process.env.https_proxy ||
    process.env.ALL_PROXY || process.env.all_proxy
  if (envProxy) { setGlobalDispatcher(new ProxyAgent(envProxy)); return envProxy }
  for (const port of CLASH_PORTS) {
    if (await probePort('127.0.0.1', port)) {
      const url = `http://127.0.0.1:${port}`
      setGlobalDispatcher(new ProxyAgent(url))
      return url
    }
  }
  return null
}

function loadEnvFile() {
  if (!fs.existsSync(ENV_FILE)) return
  for (const line of fs.readFileSync(ENV_FILE, 'utf8').split(/\r?\n/)) {
    const m = line.match(/^([A-Z_][A-Z0-9_]*)=(.*)$/)
    if (m && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/^["']|["']$/g, '')
  }
}

async function getJSON(url, extraHeaders = {}) {
  const res = await fetch(url, {
    headers: { 'User-Agent': UA, Accept: 'application/json', ...extraHeaders },
    signal: AbortSignal.timeout(TIMEOUT_MS),
  })
  if (!res.ok) throw new Error(`HTTP ${res.status} for ${url}`)
  return res.json()
}

async function getText(url, extraHeaders = {}) {
  const res = await fetch(url, {
    headers: { 'User-Agent': UA, ...extraHeaders },
    signal: AbortSignal.timeout(TIMEOUT_MS),
  })
  if (!res.ok) throw new Error(`HTTP ${res.status} for ${url}`)
  return res.text()
}

function decodeEntities(s) {
  return s
    .replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"').replace(/&#0?39;/g, "'").replace(/&#x27;/gi, "'")
}

function categorize(text) {
  if (COMPLAINT_RE.test(text)) return 'complaint'
  if (LAUNCH_RE.test(text)) return 'launch'
  return 'trend'
}

function signal({ source, category, title, url, metric, metricLabel, snippet = '' }) {
  const money = MONEY_RE.test(`${title} ${snippet}`)
  return { source, category, title: title.trim(), url, metric, metricLabel, snippet: snippet.trim(), money }
}

// ---------- 各数据源（免费核心，无需 token） ----------

async function fetchHackerNews() {
  const since = Math.floor(Date.now() / 1000) - DAY_SECONDS
  const out = []
  // Show HN = solo 产品发布
  const show = await getJSON(`https://hn.algolia.com/api/v1/search_by_date?tags=show_hn&numericFilters=created_at_i>${since}&hitsPerPage=30`)
  for (const h of show.hits || []) {
    if (!h.title) continue
    out.push(signal({
      source: 'HackerNews', category: 'launch', title: h.title,
      url: h.url || `https://news.ycombinator.com/item?id=${h.objectID}`,
      metric: h.num_comments ?? 0, metricLabel: 'HN comments',
    }))
  }
  // 高热故事 = 趋势 / 抱怨
  const stories = await getJSON(`https://hn.algolia.com/api/v1/search?tags=story&numericFilters=created_at_i>${since}&hitsPerPage=40`)
  for (const h of stories.hits || []) {
    if (!h.title) continue
    out.push(signal({
      source: 'HackerNews', category: categorize(h.title), title: h.title,
      url: h.url || `https://news.ycombinator.com/item?id=${h.objectID}`,
      metric: h.num_comments ?? 0, metricLabel: 'HN comments',
    }))
  }
  return out
}

const SUBREDDITS = ['SideProject', 'SaaS', 'selfhosted', 'webdev', 'indiehackers']

async function fetchReddit() {
  // .json 端点常被数据中心 IP 封（403），降级用 .rss（拿标题+链接，无点赞数）。
  const out = []
  for (const sub of SUBREDDITS) {
    let xml
    try {
      xml = await getText(`https://www.reddit.com/r/${sub}/top/.rss?t=day`)
    } catch (e) {
      continue // 单个 sub 失败跳过
    }
    for (const m of xml.matchAll(/<entry>([\s\S]*?)<\/entry>/g)) {
      const entry = m[1]
      const titleM = entry.match(/<title>([\s\S]*?)<\/title>/)
      const linkM = entry.match(/<link[^>]*href="([^"]+)"/)
      if (!titleM || !linkM) continue
      const title = decodeEntities(titleM[1])
      out.push(signal({
        source: `r/${sub}`, category: categorize(title), title,
        url: linkM[1], metric: null, metricLabel: 'reddit',
      }))
    }
  }
  if (out.length === 0) throw new Error('Reddit RSS returned no entries (likely IP-blocked)')
  return out
}

async function fetchLobsters() {
  const data = await getJSON('https://lobste.rs/hottest.json')
  return (data || []).map(p => signal({
    source: 'Lobsters', category: 'tool', title: p.title,
    url: p.url || p.short_id_url, metric: p.comment_count ?? 0, metricLabel: 'Lobsters comments',
  }))
}

async function fetchHuggingFace() {
  const data = await getJSON('https://huggingface.co/api/models?sort=trendingScore&limit=25')
  return (data || []).map(m => signal({
    source: 'HuggingFace', category: 'model', title: m.id,
    url: `https://huggingface.co/${m.id}`, metric: m.likes ?? 0, metricLabel: 'HF likes',
    snippet: m.pipeline_tag || '',
  }))
}

async function fetchDevTo() {
  const data = await getJSON('https://dev.to/api/articles?top=1&per_page=25')
  return (data || []).map(a => signal({
    source: 'DEV', category: categorize(`${a.title} ${a.description || ''}`), title: a.title,
    url: a.url, metric: a.positive_reactions_count ?? 0, metricLabel: 'DEV reactions',
    snippet: a.description || '',
  }))
}

// 种子词贴合现有工具线（cost calc / cron / self-hosted / docker / token / mcp / cache / csp），
// 提高长尾词的 SEO 选题价值，避开 ai/token 这类纯噪音词。
const SEED_KEYWORDS = ['llm api pricing', 'llm cost', 'self-hosted', 'mcp server', 'cron job', 'docker compose', 'token counter', 'prompt caching']

async function fetchGoogleSuggest() {
  // Google 联想词作趋势代理：展开长尾关键词喂给 SEO 选题。
  const out = []
  const seen = new Set()
  for (const seed of SEED_KEYWORDS) {
    let data
    try {
      data = await getJSON(`https://suggestqueries.google.com/complete/search?client=firefox&q=${encodeURIComponent(seed)}`)
    } catch (e) {
      continue
    }
    for (const sug of data[1] || []) {
      if (seen.has(sug)) continue
      seen.add(sug)
      out.push(signal({
        source: 'GoogleSuggest', category: 'keyword', title: sug,
        url: `https://www.google.com/search?q=${encodeURIComponent(sug)}`,
        metric: null, metricLabel: `seed:${seed}`,
      }))
    }
  }
  return out
}

// ---------- token 可选源（无 token 跳过，graceful degrade） ----------

async function fetchGitHub(token) {
  if (!token) return { skipped: 'no GITHUB_TOKEN' }
  const since = new Date(Date.now() - 7 * DAY_SECONDS * 1000).toISOString().slice(0, 10)
  const q = encodeURIComponent(`created:>${since} stars:>50`)
  const url = `https://api.github.com/search/repositories?q=${q}&sort=stars&order=desc&per_page=20`
  const res = await fetch(url, {
    headers: { 'User-Agent': UA, Accept: 'application/vnd.github+json', Authorization: `Bearer ${token}`, 'X-GitHub-Api-Version': '2022-11-28' },
    signal: AbortSignal.timeout(TIMEOUT_MS),
  })
  if (res.status === 401 || res.status === 403) return { skipped: `token invalid (HTTP ${res.status})` }
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
  const data = await res.json()
  return (data.items || []).map(r => signal({
    source: 'GitHub', category: 'tool', title: r.full_name,
    url: r.html_url, metric: r.stargazers_count ?? 0, metricLabel: 'GitHub stars',
    snippet: r.description || '',
  }))
}

// ---------- 打分 / 渲染 ----------

function dedupeByUrl(signals) {
  // 同一 URL 可能被多源/多查询命中（如 HN search 与 search_by_date），保留 metric 更高的一条。
  const byUrl = new Map()
  for (const s of signals) {
    const prev = byUrl.get(s.url)
    if (!prev || (s.metric ?? -1) > (prev.metric ?? -1)) byUrl.set(s.url, s)
  }
  return [...byUrl.values()]
}

function applyScores(signals) {
  // 每个源内部归一化 metric 到 0..1，再叠加金钱加权；保留原始 metric 供展示。
  const maxBySource = {}
  for (const s of signals) {
    if (typeof s.metric === 'number') {
      maxBySource[s.source] = Math.max(maxBySource[s.source] || 0, s.metric)
    }
  }
  for (const s of signals) {
    const max = maxBySource[s.source] || 0
    const norm = typeof s.metric === 'number' && max > 0 ? s.metric / max : 0
    s.score = +(norm + (s.money ? MONEY_BOOST : 0)).toFixed(3)
  }
  return signals
}

function fmtLine(s) {
  const metricStr = typeof s.metric === 'number' ? ` — ${s.metricLabel}: ${s.metric}` : ` — ${s.metricLabel}`
  const money = s.money ? ' 💰' : ''
  return `- [${s.title}](${s.url})${metricStr}${money}`
}

function renderMarkdown(signals, meta) {
  const byCat = c => signals.filter(s => s.category === c)
  const top = [...signals].sort((a, b) => b.score - a.score).slice(0, 8)

  const launches = byCat('launch').sort((a, b) => b.score - a.score).slice(0, 12)
  const complaints = byCat('complaint').sort((a, b) => b.score - a.score).slice(0, 12)
  const keywords = byCat('keyword')
  const techRadar = signals.filter(s => s.category === 'model' || s.category === 'tool')
    .sort((a, b) => b.score - a.score).slice(0, 15)

  // 关键词按种子分组
  const kwBySeed = {}
  for (const k of keywords) {
    const seed = k.metricLabel.replace('seed:', '')
    ;(kwBySeed[seed] ||= []).push(k.title)
  }

  const L = []
  L.push(`# 信号摘要 — ${meta.date}`)
  L.push('')
  L.push(`> 自建采集器替代 BuilderPulse Daily｜采集时间 ${meta.fetchedAt}`)
  L.push(`> 数据源：${meta.sourcesOk.join(', ')}` + (meta.sourcesSkipped.length ? `｜跳过：${meta.sourcesSkipped.join(', ')}` : ''))
  L.push(`> 💰 = 命中金钱信号词（pricing/cost/$/MRR/alternative to…），编辑取向已优先排序`)
  L.push('')

  L.push('## Top 信号（跨源按分排序）')
  top.forEach(s => L.push(fmtLine(s)))
  L.push('')

  L.push('## Solo 产品发布')
  if (launches.length) launches.forEach(s => L.push(fmtLine(s)))
  else L.push('_（今日无）_')
  L.push('')

  L.push('## 开发者抱怨 / 痛点')
  if (complaints.length) complaints.forEach(s => L.push(fmtLine(s)))
  else L.push('_（今日无）_')
  L.push('')

  L.push('## 暴涨 / 长尾搜索词（Google 联想词）')
  const seeds = Object.keys(kwBySeed)
  if (seeds.length) {
    for (const seed of seeds) {
      L.push(`- **${seed}**: ${kwBySeed[seed].slice(0, 8).join(' · ')}`)
    }
  } else L.push('_（今日无）_')
  L.push('')

  L.push('## AI 模型 / 技术雷达')
  if (techRadar.length) techRadar.forEach(s => L.push(fmtLine(s)))
  else L.push('_（今日无）_')
  L.push('')

  return L.join('\n')
}

// ---------- 主流程 ----------

const SOURCES = [
  ['HackerNews', fetchHackerNews],
  ['Reddit', fetchReddit],
  ['Lobsters', fetchLobsters],
  ['HuggingFace', fetchHuggingFace],
  ['DEV', fetchDevTo],
  ['GoogleSuggest', fetchGoogleSuggest],
]

async function main() {
  loadEnvFile()
  const proxy = await setupProxy()
  console.log(proxy ? `  代理: ${proxy}` : '  代理: 无（直连，被污染的源可能失败）')
  const token = process.env.GITHUB_TOKEN || process.env.GH_TOKEN

  const date = new Date().toISOString().slice(0, 10)
  const fetchedAt = new Date().toISOString()

  let signals = []
  const errors = {}
  const perSourceCount = {}
  const sourcesOk = []
  const sourcesSkipped = []

  for (const [name, fn] of SOURCES) {
    try {
      const res = await fn()
      signals.push(...res)
      perSourceCount[name] = res.length
      sourcesOk.push(name)
      console.log(`  ✓ ${name}: ${res.length} signals`)
    } catch (e) {
      errors[name] = e.message
      perSourceCount[name] = 0
      sourcesSkipped.push(name)
      console.warn(`  ✗ ${name}: ${e.message}`)
    }
  }

  // GitHub 可选源
  try {
    const gh = await fetchGitHub(token)
    if (Array.isArray(gh)) {
      signals.push(...gh)
      perSourceCount.GitHub = gh.length
      sourcesOk.push('GitHub')
      console.log(`  ✓ GitHub: ${gh.length} signals`)
    } else {
      sourcesSkipped.push(`GitHub(${gh.skipped})`)
      console.log(`  - GitHub skipped: ${gh.skipped}`)
    }
  } catch (e) {
    errors.GitHub = e.message
    sourcesSkipped.push('GitHub')
    console.warn(`  ✗ GitHub: ${e.message}`)
  }

  if (signals.length === 0) {
    console.error('所有数据源均失败，无信号产出。')
    process.exit(1)
  }

  signals = dedupeByUrl(signals)
  applyScores(signals)

  fs.mkdirSync(RAW_DIR, { recursive: true })
  fs.mkdirSync(SIGNALS_DIR, { recursive: true })

  const rawPath = path.join(RAW_DIR, `${date}.json`)
  fs.writeFileSync(rawPath, JSON.stringify({
    fetchedAt, date, perSourceCount, errors, signalCount: signals.length, signals,
  }, null, 2))

  const md = renderMarkdown(signals, { date, fetchedAt, sourcesOk, sourcesSkipped })
  const mdPath = path.join(SIGNALS_DIR, `${date}.md`)
  fs.writeFileSync(mdPath, md)

  console.log(`\n采集完成：${signals.length} 条信号，来自 ${sourcesOk.length} 个源`)
  console.log(`  raw:     ${rawPath}`)
  console.log(`  signals: ${mdPath}`)
}

main().catch(e => {
  console.error(e)
  process.exit(1)
})
