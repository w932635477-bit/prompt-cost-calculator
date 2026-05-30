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
const cheerio = require('cheerio')

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

const MONEY_BOOST = 0.3  // 金钱信号加成，不覆盖 metric 主权重
const METRIC_WEIGHT = 5.0  // metric log-scale 权重，让高互动信号远超无 metric 信号

// 源重要性权重：讨论型源 > 趋势型源 > 搜索型源
const SOURCE_WEIGHT = {
  HackerNews: 1.0, r_SaaS: 1.0, r_SideProject: 1.0, r_indiehackers: 1.0,
  r_selfhosted: 0.9, r_webdev: 0.9,
  Lobsters: 0.8, DEV: 0.8, ProductHunt: 0.8, IndieHackers: 0.8,
  GitHub: 0.5, HuggingFace: 0.5,
  GoogleTrends: 0.2, GoogleSuggest: 0.15, Browse: 0.3,
}
function getSourceWeight(source) {
  // r/SaaS → r_SaaS for lookup
  const key = source.replace(/^r\//, 'r_')
  return SOURCE_WEIGHT[key] ?? 0.5
}

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
    .replace(/&#(\d+);/g, (_, n) => String.fromCharCode(Number(n)))
    .replace(/&#x([0-9a-f]+);/gi, (_, h) => String.fromCharCode(parseInt(h, 16)))
}

function categorize(text) {
  if (COMPLAINT_RE.test(text)) return 'complaint'
  if (LAUNCH_RE.test(text)) return 'launch'
  return 'trend'
}

function signal({ source, category, title, url, metric, metricLabel, snippet = '', sourceId = '' }) {
  const money = MONEY_RE.test(`${title} ${snippet}`)
  return { source, category, title: title.trim(), url, metric, metricLabel, snippet: snippet.trim(), money, sourceId }
}

// ---------- 各数据源（免费核心，无需 token） ----------

// ---------- 深度抓取（文章正文 + 评论线程） ----------

const DEEP_FETCH_TOP = 20
const DEEP_FETCH_DELAY = 500
const BODY_MAX_CHARS = 3000
const COMMENT_MAX_CHARS = 500
const TOP_COMMENTS_COUNT = 5

function sleep(ms) { return new Promise(r => setTimeout(r, ms)) }

function stripHtml(html) {
  if (!html) return ''
  return html.replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim()
}

function truncate(text, max) {
  if (!text || text.length <= max) return text || ''
  return text.slice(0, max) + '…'
}

async function fetchHNDeep(s) {
  const out = { body: '', topComments: [] }
  let itemId = null

  // 情况 1: URL 是 HN 讨论页 (news.ycombinator.com/item?id=XXX)
  const idM = s.url.match(/id=(\d+)/)
  if (idM) {
    itemId = idM[1]
  } else {
    // 情况 2: URL 是外部链接，通过 Algolia 搜索找 HN item
    try {
      const search = await getJSON(`https://hn.algolia.com/api/v1/search?query=${encodeURIComponent(s.title)}&tags=story&hitsPerPage=1`)
      if (search.hits?.[0]) {
        itemId = search.hits[0].objectID
      }
    } catch (_) { return null }
  }
  if (!itemId) return null

  const data = await getJSON(`https://hn.algolia.com/api/v1/items/${itemId}`)
  if (!data) return null

  // 正文：self post 有 text 字段（HTML），link post 需要抓目标页面
  if (data.text) {
    out.body = truncate(stripHtml(data.text), BODY_MAX_CHARS)
  } else if (data.url && !data.url.includes('news.ycombinator.com')) {
    try {
      out.body = await fetchGenericBody(data.url)
    } catch (_) { /* 目标页面抓取失败不中断 */ }
  }

  // 评论：取前 N 条顶级评论
  const kids = data.children || []
  for (let i = 0; i < Math.min(TOP_COMMENTS_COUNT, kids.length); i++) {
    const c = kids[i]
    if (c && c.text) {
      out.topComments.push({
        author: c.author || '',
        text: truncate(stripHtml(c.text), COMMENT_MAX_CHARS),
      })
    }
  }
  return out.body || out.topComments.length ? out : null
}

async function fetchRedditDeep(s) {
  const out = { body: '', topComments: [] }
  const m = s.url.match(/\/r\/([^/]+)\/comments\/([^/]+)/)
  if (!m) return null
  const [, sub, postId] = m

  // Reddit JSON API 封数据中心 IP (403)。用 old.reddit.com + HTML 解析兜底。
  // 先试 JSON，失败则降级 HTML。
  let usedJson = false
  try {
    const raw = await getText(`https://old.reddit.com/r/${sub}/comments/${postId}/.json`)
    const json = JSON.parse(raw)
    if (Array.isArray(json) && json[0]) {
      usedJson = true
      const postData = json[0].data?.children?.[0]?.data
      if (postData?.selftext) {
        out.body = truncate(stripHtml(postData.selftext), BODY_MAX_CHARS)
      }
      const commentChildren = json[1]?.data?.children || []
      let count = 0
      for (const c of commentChildren) {
        if (count >= TOP_COMMENTS_COUNT) break
        if (c.kind !== 't1' || !c.data?.body) continue
        out.topComments.push({
          author: c.data.author || '',
          text: truncate(stripHtml(c.data.body), COMMENT_MAX_CHARS),
        })
        count++
      }
    }
  } catch (_) { /* JSON 失败，降级 HTML */ }

  if (!usedJson) {
    try {
      const html = await getText(`https://old.reddit.com/r/${sub}/comments/${postId}/`)
      const $ = cheerio.load(html)
      // 正文
      const selftext = $('.expando .usertext-body').first().text().trim()
      if (selftext) out.body = truncate(selftext, BODY_MAX_CHARS)
      // 评论
      let count = 0
      $('.comment .usertext-body').each(function () {
        if (count >= TOP_COMMENTS_COUNT) return false
        const text = $(this).text().trim()
        if (text.length > 10) {
          const author = $(this).closest('.comment').find('.author').first().text() || ''
          out.topComments.push({ author, text: truncate(text, COMMENT_MAX_CHARS) })
          count++
        }
      })
    } catch (_) { return null }
  }
  return out.body || out.topComments.length ? out : null
}

async function fetchLobstersDeep(s) {
  const out = { body: '', topComments: [] }
  // 优先用 sourceId（采集时存的 short_id），降级从 URL 提取
  let shortId = s.sourceId || ''
  if (!shortId) {
    const m = s.url.match(/\/s\/([a-zA-Z0-9]+)/)
    if (!m) return null
    shortId = m[1]
  }

  let data
  try {
    data = await getJSON(`https://lobste.rs/s/${shortId}.json`)
  } catch (_) { return null }
  if (!data) return null

  // 正文（Lobsters 故事通常没有正文，评论才有）
  if (data.description) {
    out.body = truncate(stripHtml(data.description), BODY_MAX_CHARS)
  }

  // 评论
  const comments = data.comments || []
  for (let i = 0; i < Math.min(TOP_COMMENTS_COUNT, comments.length); i++) {
    const c = comments[i]
    if (c?.comment) {
      out.topComments.push({
        author: c.user?.username || '',
        text: truncate(stripHtml(c.comment), COMMENT_MAX_CHARS),
      })
    }
  }
  return out.body || out.topComments.length ? out : null
}

async function fetchDEVDeep(s) {
  const out = { body: '', topComments: [] }
  // 优先用 sourceId（采集时存的 DEV article id），降级从 URL 提取
  let articleId = s.sourceId || ''
  if (!articleId) {
    const m = s.url.match(/-(\d+)$/)
    if (!m) return null
    articleId = m[1]
  }

  let data
  try {
    data = await getJSON(`https://dev.to/api/articles/${articleId}`)
  } catch (_) { return null }
  if (!data) return null

  // 正文（Markdown）
  if (data.body_markdown) {
    out.body = truncate(data.body_markdown.replace(/\n{2,}/g, '\n').trim(), BODY_MAX_CHARS)
  }

  // 评论（需要额外请求）
  try {
    const comments = await getJSON(`https://dev.to/api/comments?a_id=${articleId}`)
    for (let i = 0; i < Math.min(TOP_COMMENTS_COUNT, comments.length); i++) {
      const c = comments[i]
      if (c?.body_html) {
        out.topComments.push({
          author: c.user?.username || '',
          text: truncate(stripHtml(c.body_html), COMMENT_MAX_CHARS),
        })
      }
    }
  } catch (_) { /* 评论抓取失败不中断 */ }

  return out.body || out.topComments.length ? out : null
}

async function fetchGenericBody(url) {
  if (!url || url.startsWith('data:') || url.startsWith('javascript:')) return ''
  const html = await getText(url)
  const $ = cheerio.load(html)
  const sel = $('article').first()
  const main = $('main').first()
  const el = sel.length ? sel : main.length ? main : $('body')
  const text = el.text().replace(/\s+/g, ' ').trim()
  return truncate(text, BODY_MAX_CHARS)
}

async function fetchDeepContent(s) {
  // 跳过无法/无需深度抓取的源
  if (s.source === 'GoogleSuggest' || s.source === 'GoogleTrends' ||
      s.source === 'IndieHackers' || s.source === 'ProductHunt' ||
      s.source === 'GitHub' || s.category === 'keyword') return null

  if (s.source === 'HackerNews' || s.source.startsWith('Show HN')) return fetchHNDeep(s)
  if (s.source.startsWith('r/')) return fetchRedditDeep(s)
  if (s.source === 'Lobsters') return fetchLobstersDeep(s)
  if (s.source === 'DEV') return fetchDEVDeep(s)
  // HuggingFace 等有 URL 的源：抓通用正文
  if (s.url && s.url.startsWith('http')) {
    try {
      const body = await fetchGenericBody(s.url)
      return body ? { body, topComments: [] } : null
    } catch (_) { return null }
  }
  return null
}

async function deepFetchSignals(topSignals) {
  let fetched = 0
  for (let i = 0; i < topSignals.length; i++) {
    const s = topSignals[i]
    try {
      const deep = await fetchDeepContent(s)
      if (deep) {
        s.body = deep.body
        s.topComments = deep.topComments
        s.contentLength = (deep.body || '').length
        fetched++
      }
    } catch (e) {
      console.warn(`  ✗ deep ${s.source}: ${s.title.slice(0, 40)}: ${e.message}`)
    }
    if (i < topSignals.length - 1) await sleep(DEEP_FETCH_DELAY)
  }
  return fetched
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

// Product Hunt — Atom RSS feed（Cloudflare 封了所有 API/页面，只有 /feed 可用）。
// 返回产品名、tagline、作者、链接。无 upvotes/comments（需要 PH API v2 token）。
// 采集 all + developer_tools 两个分类，去重后约 60-80 条/天。
const PH_FEEDS = [
  'https://www.producthunt.com/feed?category=all',
  'https://www.producthunt.com/feed?category=developer_tools',
]

async function fetchProductHunt() {
  const out = []
  const seenIds = new Set()

  for (const feedUrl of PH_FEEDS) {
    let xml
    try {
      xml = await getText(feedUrl)
    } catch (e) {
      continue // 单个 feed 失败不丢弃其他 feed 的结果
    }
    // Atom <entry> 解析（与 fetchReddit 同模式，不引入 XML 依赖）
    for (const m of xml.matchAll(/<entry>([\s\S]*?)<\/entry>/g)) {
      const entry = m[1]
      const idM = entry.match(/<id>([^<]+)<\/id>/)
      const titleM = entry.match(/<title>([\s\S]*?)<\/title>/)
      const linkM = entry.match(/<link[^>]*href="([^"]+)"/)
      const contentM = entry.match(/<content[^>]*>([\s\S]*?)<\/content>/)
      const publishedM = entry.match(/<published>([^<]+)<\/published>/)
      if (!titleM || !linkM) continue

      // 去重（同一产品出现在多个分类 feed 中）
      const entryId = idM ? idM[1] : linkM[1]
      if (seenIds.has(entryId)) continue
      seenIds.add(entryId)

      // 保留最近 3 天的产品（PH 用太平洋时间，RSS 可能滞后 1 天；周末更新更少）
      if (publishedM) {
        const pubMs = new Date(publishedM[1]).getTime()
        if (!isNaN(pubMs) && Date.now() - pubMs > 3 * DAY_SECONDS * 1000) continue
      }

      // 从 HTML content 提取 tagline（先解码 HTML entity，再剥 CDATA，再取第一个 <p>）
      let tagline = ''
      if (contentM) {
        let decoded = decodeEntities(contentM[1])
        decoded = decoded.replace(/^<!\[CDATA\[([\s\S]*?)\]\]>$/, '$1')
        const tagM = decoded.match(/<p>\s*(.*?)\s*<\/p>/s)
        if (tagM) {
          tagline = tagM[1].replace(/<[^>]+>/g, '').trim()
        } else {
          tagline = decoded.replace(/<[^>]+>/g, '').trim().slice(0, 200)
        }
      }

      out.push(signal({
        source: 'ProductHunt', category: 'launch',
        title: decodeEntities(titleM[1].trim()),
        url: linkM[1], metric: null, metricLabel: 'PH launch',
        snippet: tagline,
      }))
    }
  }
  if (out.length === 0) throw new Error('PH RSS returned no entries for today')
  return out
}

async function fetchLobsters() {
  const data = await getJSON('https://lobste.rs/hottest.json')
  return (data || []).map(p => signal({
    source: 'Lobsters', category: 'tool', title: p.title,
    url: p.url || p.short_id_url, metric: p.comment_count ?? 0, metricLabel: 'Lobsters comments',
    sourceId: p.short_id || '',
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
    sourceId: String(a.id || ''),
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
  // 每个源内部 log-scale 归一化，再乘以源重要性权重。
  // null-metric 的源（Reddit RSS 无点赞数）按源权重给 baseline 分。
  const maxBySource = {}
  for (const s of signals) {
    if (typeof s.metric === 'number') {
      maxBySource[s.source] = Math.max(maxBySource[s.source] || 0, s.metric)
    }
  }
  for (const s of signals) {
    const max = maxBySource[s.source] || 0
    const weight = getSourceWeight(s.source)
    let metricScore
    if (typeof s.metric === 'number' && max > 0) {
      metricScore = METRIC_WEIGHT * Math.log(s.metric + 1) / Math.log(max + 1) * weight
    } else {
      // null metric：按源重要性给 baseline（Reddit > PH > GoogleSuggest）
      metricScore = weight * 2.0
    }
    s.score = +(metricScore + (s.money ? MONEY_BOOST : 0)).toFixed(3)
  }
  return signals
}

function fmtLine(s) {
  const metricStr = typeof s.metric === 'number' ? ` — ${s.metricLabel}: ${s.metric}` : ` — ${s.metricLabel}`
  const money = s.money ? ' 💰' : ''
  const snippet = s.snippet ? ` — ${s.snippet.slice(0, 80)}` : ''
  return `- [${s.title}](${s.url})${metricStr}${money}${snippet}`
}

function renderMarkdown(signals, meta) {
  const byCat = c => signals.filter(s => s.category === c)
  const top = [...signals].sort((a, b) => b.score - a.score).slice(0, 8)

  const launches = byCat('launch').sort((a, b) => b.score - a.score).slice(0, 20)
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
  ['ProductHunt', fetchProductHunt],
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

  // Browse 采集源（IH + Google Trends，由 scrape-browse-sources.sh 产出）
  const browseFile = path.join(RAW_DIR, `browse-${date}.json`)
  try {
    const browseData = JSON.parse(fs.readFileSync(browseFile, 'utf8'))
    const browseSignals = browseData.signals || []
    if (browseSignals.length > 0) {
      signals.push(...browseSignals)
      perSourceCount.Browse = browseSignals.length
      sourcesOk.push(`Browse(IH:${browseData.IndieHackers||0},GT:${browseData.GoogleTrends||0})`)
      console.log(`  ✓ Browse: ${browseSignals.length} signals (IH:${browseData.IndieHackers||0}, GT:${browseData.GoogleTrends||0})`)
    }
  } catch (e) {
    // browse 文件不存在是正常的（browse daemon 可能没运行）
    console.log(`  - Browse: no browse data for today (run scrape-browse-sources.sh first)`)
  }

  if (signals.length === 0) {
    console.error('所有数据源均失败，无信号产出。')
    process.exit(1)
  }

  signals = dedupeByUrl(signals)
  applyScores(signals)

  // 深度抓取 Top N 信号的文章正文和评论
  const topForDeep = [...signals].sort((a, b) => b.score - a.score).slice(0, DEEP_FETCH_TOP)
  const deepCount = await deepFetchSignals(topForDeep)
  console.log(`  📥 deep fetch: ${deepCount}/${topForDeep.length} enriched with body/comments`)

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
