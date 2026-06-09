#!/usr/bin/env node
// Unified GSC Indexing API submitter — two-account rotation, domain-validated.
//
// 一条命令把 dist/sitemap.xml 全部 URL 提交到 GSC，自动轮换两个账号(共400/天)。
//
// 用法:
//   node scripts/gsc-submit-all.cjs              # 提交所有未提交的 URL
//   node scripts/gsc-submit-all.cjs --dry-run    # 只打印计划，不提交
//   node scripts/gsc-submit-all.cjs --force      # 忽略进度，重新提交全部(内容更新后用)
//   node scripts/gsc-submit-all.cjs --account 1  # 只用账号1 / 2
//
// 防错设计:
//   1. 域名硬校验 — sitemap 里有任何非 EXPECTED_DOMAIN 的 URL 立即中止
//   2. 两账号轮换 — 账号1(Service Account)灌满配额自动转账号2(OAuth)
//   3. 单一进度文件 .gsc-aicalc-progress.json — 杜绝多来源打架

const fs = require('fs');
const path = require('path');
const os = require('os');
const { fetch, ProxyAgent } = require('undici');
const jwt = require('jsonwebtoken');

// ── 配置 ──────────────────────────────────────────────────────────
const EXPECTED_DOMAIN = 'aicalc.cloud';        // 域名守卫：只允许这个域名
const PROXY = new ProxyAgent('http://127.0.0.1:7890');
const ROOT = path.join(__dirname, '..');
const SITEMAP_PATH = path.join(ROOT, 'dist', 'sitemap.xml');
const PROGRESS_PATH = path.join(ROOT, '.gsc-aicalc-progress.json');
const QUOTA_PER_ACCOUNT = 200;
const DELAY_MS = 300;
const INDEX_ENDPOINT = 'https://indexing.googleapis.com/v3/urlNotifications:publish';

// 账号清单：type 决定取 token 的方式。新增账号只需在这里加一行。
const ACCOUNTS = [
  {
    name: 'acct1-service-account',
    type: 'sa',
    credsPath: path.join(os.homedir(), '.gsc', 'service-account.json'),
  },
  {
    name: 'acct2-oauth',
    type: 'oauth',
    credsPath: path.join(ROOT, 'gsc-oauth-credentials-2.json'),
    tokenPath: path.join(ROOT, '.gsc-indexing-token-2.json'),
  },
];

// ── 取 access_token：Service Account 走 JWT 自签，OAuth 走 refresh ──
async function getAccessToken(acct) {
  if (acct.type === 'sa') {
    const key = JSON.parse(fs.readFileSync(acct.credsPath, 'utf-8'));
    const now = Math.floor(Date.now() / 1000);
    const assertion = jwt.sign({
      iss: key.client_email,
      scope: 'https://www.googleapis.com/auth/indexing',
      aud: 'https://oauth2.googleapis.com/token',
      iat: now, exp: now + 3600,
    }, key.private_key, { algorithm: 'RS256' });

    const r = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST', dispatcher: PROXY,
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: 'grant_type=urn:ietf:params:oauth:grant-type:jwt-bearer&assertion=' + assertion,
    });
    const d = await r.json();
    if (!d.access_token) throw new Error(`SA token failed: ${JSON.stringify(d)}`);
    return d.access_token;
  }

  // oauth
  const creds = (JSON.parse(fs.readFileSync(acct.credsPath, 'utf-8'))).installed;
  const token = JSON.parse(fs.readFileSync(acct.tokenPath, 'utf-8'));
  const r = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST', dispatcher: PROXY,
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: creds.client_id, client_secret: creds.client_secret,
      refresh_token: token.refresh_token, grant_type: 'refresh_token',
    }).toString(),
  });
  const d = await r.json();
  if (!d.access_token) throw new Error(`OAuth refresh failed: ${JSON.stringify(d)}`);
  return d.access_token;
}

async function submitUrl(accessToken, url) {
  const res = await fetch(INDEX_ENDPOINT, {
    method: 'POST', dispatcher: PROXY,
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${accessToken}` },
    body: JSON.stringify({ url, type: 'URL_UPDATED' }),
  });
  const data = await res.json().catch(() => ({}));
  const quotaHit = res.status === 429 || /quota/i.test(data.error?.message || '');
  return { ok: res.ok, status: res.status, error: data.error?.message, quotaHit };
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// ── 域名守卫 ──────────────────────────────────────────────────────
function loadAndValidateUrls() {
  if (!fs.existsSync(SITEMAP_PATH)) {
    throw new Error(`sitemap 不存在: ${SITEMAP_PATH}\n先跑 npm run build`);
  }
  const xml = fs.readFileSync(SITEMAP_PATH, 'utf-8');
  const urls = [...xml.matchAll(/<loc>(.*?)<\/loc>/g)].map((m) => m[1].trim());

  const bad = urls.filter((u) => {
    try { return new URL(u).hostname !== EXPECTED_DOMAIN; }
    catch { return true; }
  });
  if (bad.length > 0) {
    throw new Error(
      `域名守卫中止：${bad.length} 条 URL 不是 ${EXPECTED_DOMAIN}\n` +
      bad.slice(0, 5).map((u) => '  ✗ ' + u).join('\n') +
      (bad.length > 5 ? `\n  ...还有 ${bad.length - 5} 条` : '')
    );
  }
  return urls;
}

function loadProgress() {
  if (!fs.existsSync(PROGRESS_PATH)) return { submitted: [], lastRun: null };
  return JSON.parse(fs.readFileSync(PROGRESS_PATH, 'utf-8'));
}
function saveProgress(p) {
  p.lastRun = new Date().toISOString();
  fs.writeFileSync(PROGRESS_PATH, JSON.stringify(p, null, 2));
}

// ── 主流程 ────────────────────────────────────────────────────────
async function main() {
  const args = process.argv.slice(2);
  const dryRun = args.includes('--dry-run');
  const force = args.includes('--force');
  const acctIdx = args.indexOf('--account');
  const onlyAccount = acctIdx >= 0 ? args[acctIdx + 1] : null;

  const allUrls = loadAndValidateUrls();
  console.log(`域名守卫通过：${allUrls.length} 条 URL 全部为 ${EXPECTED_DOMAIN}`);

  const progress = loadProgress();
  const done = new Set(force ? [] : progress.submitted);
  const pending = allUrls.filter((u) => !done.has(u));

  // 选择参与的账号
  let accounts = ACCOUNTS;
  if (onlyAccount === '1') accounts = [ACCOUNTS[0]];
  if (onlyAccount === '2') accounts = [ACCOUNTS[1]];

  // 凭证存在性预检
  for (const a of accounts) {
    if (!fs.existsSync(a.credsPath)) throw new Error(`${a.name} 凭证缺失: ${a.credsPath}`);
    if (a.type === 'oauth' && !fs.existsSync(a.tokenPath)) {
      throw new Error(`${a.name} token 缺失: ${a.tokenPath}\n先跑: node scripts/gsc-oauth-auth.cjs --creds ${path.basename(a.credsPath)}`);
    }
  }

  const capacity = accounts.length * QUOTA_PER_ACCOUNT;
  console.log(`已提交: ${progress.submitted.length} | 待提交: ${pending.length} | 本次账号: ${accounts.length} (容量 ${capacity}/天)${force ? ' | FORCE' : ''}`);

  if (pending.length === 0) {
    console.log('没有待提交的 URL。用 --force 可重新提交全部。');
    return;
  }
  if (dryRun) {
    console.log('\n[DRY RUN] 将提交:');
    pending.slice(0, capacity).forEach((u, i) => console.log(`  ${i + 1}. ${u}`));
    if (pending.length > capacity) console.log(`  ...超出今日容量 ${pending.length - capacity} 条，明天继续`);
    return;
  }

  let remaining = [...pending];
  let totalOk = 0, totalFail = 0;

  for (const acct of accounts) {
    if (remaining.length === 0) break;
    console.log(`\n── ${acct.name} (${acct.type}) ──`);
    let token;
    try {
      token = await getAccessToken(acct);
      console.log('  token OK');
    } catch (e) {
      console.log(`  跳过(认证失败): ${e.message}`);
      continue;
    }

    const slice = remaining.slice(0, QUOTA_PER_ACCOUNT);
    let acctOk = 0, quotaHit = false;

    for (let i = 0; i < slice.length; i++) {
      const url = slice[i];
      const r = await submitUrl(token, url);
      if (r.quotaHit) { console.log(`  配额用尽 @ ${i + 1}，转下一账号`); quotaHit = true; break; }
      if (r.ok) {
        acctOk++; totalOk++;
        progress.submitted.push(url);
        if (acctOk % 20 === 0) { console.log(`  [${acctOk}/${slice.length}]`); saveProgress(progress); }
      } else {
        totalFail++;
        console.log(`  FAIL ${r.status} ${url} ${r.error || ''}`);
      }
      if (i < slice.length - 1) await sleep(DELAY_MS);
    }
    saveProgress(progress);
    console.log(`  本账号提交 ${acctOk} 条${quotaHit ? '(配额用尽)' : ''}`);
    remaining = remaining.slice(acctOk + (quotaHit ? 0 : 0)); // 已成功的从队列移除
    remaining = allUrls.filter((u) => !new Set(progress.submitted).has(u));
  }

  // 去重(防 --force 重复 push)
  progress.submitted = [...new Set(progress.submitted)];
  saveProgress(progress);

  console.log('\n=== 完成 ===');
  console.log(`本次成功: ${totalOk} | 失败: ${totalFail}`);
  console.log(`累计已提交: ${progress.submitted.length}/${allUrls.length}`);
  const left = allUrls.length - progress.submitted.length;
  if (left > 0) console.log(`剩余 ${left} 条，明天配额重置后再跑一次本命令`);
  else console.log('全部已提交 ✅');
}

main().catch((e) => { console.error('\n中止:', e.message); process.exit(1); });
