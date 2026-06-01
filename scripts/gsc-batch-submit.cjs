#!/usr/bin/env node
// Google Indexing API batch submitter with multi-account rotation
// Usage: node scripts/gsc-batch-submit.cjs [--dry-run] [--count N]
//
// Auto-discovers gsc-oauth-credentials*.json in project root.
// Each credential file = 1 GCP project = 200/day quota.
// Rotates to next account when quota exceeded.
// Shared progress tracking across all accounts.

const fs = require('fs');
const path = require('path');
const { fetch, ProxyAgent } = require('undici');

const PROXY = new ProxyAgent('http://127.0.0.1:7890');
const PROJECT_ROOT = path.join(__dirname, '..');
const PROGRESS_PATH = path.join(PROJECT_ROOT, '.gsc-submit-progress.json');
const SITEMAP_PATH = path.join(PROJECT_ROOT, 'dist', 'sitemap.xml');

const BATCH_SIZE = 50;
const DELAY_MS = 1000;
const DEFAULT_COUNT = 200;
const QUOTA_PER_ACCOUNT = 200;

// ── Credential discovery ──────────────────────────────────────────

function discoverCredentials() {
  const files = fs.readdirSync(PROJECT_ROOT)
    .filter(f => f.startsWith('gsc-oauth-credentials') && f.endsWith('.json'))
    .sort();

  return files.map(file => {
    const fullPath = path.join(PROJECT_ROOT, file);
    // Derive token file: gsc-oauth-credentials.json → .gsc-indexing-token.json
    //                    gsc-oauth-credentials-2.json → .gsc-indexing-token-2.json
    const suffix = file.replace('gsc-oauth-credentials', '').replace('.json', '');
    const tokenFile = path.join(PROJECT_ROOT, `.gsc-indexing-token${suffix}.json`);
    return { credsPath: fullPath, tokenPath: tokenFile, name: file };
  });
}

// ── Token refresh ─────────────────────────────────────────────────

async function refreshToken(credsPath, tokenPath) {
  if (!fs.existsSync(tokenPath)) {
    throw new Error(`Token file not found: ${path.basename(tokenPath)}. Run OAuth flow first.`);
  }

  const creds = JSON.parse(fs.readFileSync(credsPath, 'utf-8'));
  const token = JSON.parse(fs.readFileSync(tokenPath, 'utf-8'));

  const postData = new URLSearchParams({
    client_id: creds.installed.client_id,
    client_secret: creds.installed.client_secret,
    refresh_token: token.refresh_token,
    grant_type: 'refresh_token'
  }).toString();

  const result = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    dispatcher: PROXY,
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: postData
  }).then(r => r.json());

  if (!result.access_token) throw new Error('Token refresh failed: ' + JSON.stringify(result));

  const newToken = { ...token, access_token: result.access_token, expiry_date: Date.now() + (result.expires_in * 1000) };
  fs.writeFileSync(tokenPath, JSON.stringify(newToken, null, 2));
  return newToken.access_token;
}

// ── URL submission ────────────────────────────────────────────────

async function submitUrl(accessToken, url) {
  const res = await fetch('https://indexing.googleapis.com/v3/urlNotifications:publish', {
    method: 'POST',
    dispatcher: PROXY,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${accessToken}`
    },
    body: JSON.stringify({ url, type: 'URL_UPDATED' })
  });
  const data = await res.json();
  return { ok: res.ok, url, status: res.status, error: data.error?.message };
}

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

// ── Submit URLs with one account until quota or done ──────────────

async function submitWithAccount(account, urls, maxForThisAccount) {
  if (urls.length === 0) return { submitted: [], quotaHit: false };

  console.log(`\n  Using account: ${account.name}`);
  const accessToken = await refreshToken(account.credsPath, account.tokenPath);
  console.log('  Token refreshed');

  const submitted = [];
  let quotaHit = false;

  for (let i = 0; i < urls.length && i < maxForThisAccount; i += BATCH_SIZE) {
    const batch = urls.slice(i, Math.min(i + BATCH_SIZE, urls.length, maxForThisAccount));
    console.log(`  Batch ${Math.floor(i / BATCH_SIZE) + 1} (${batch.length} URLs)...`);

    const results = await Promise.all(batch.map(u => submitUrl(accessToken, u)));
    for (const r of results) {
      if (r.ok) {
        submitted.push(r.url);
      } else {
        if (r.error?.includes('Quota exceeded') || r.status === 429) {
          console.log('  QUOTA EXCEEDED for this account.');
          quotaHit = true;
          break;
        }
        console.log(`  FAIL: ${r.url} - ${r.error}`);
      }
    }

    if (quotaHit) break;
    if (i + BATCH_SIZE < urls.length && i + BATCH_SIZE < maxForThisAccount) {
      await sleep(DELAY_MS);
    }
  }

  return { submitted, quotaHit };
}

// ── Main ──────────────────────────────────────────────────────────

async function main() {
  const args = process.argv.slice(2);
  const dryRun = args.includes('--dry-run');
  const countIdx = args.indexOf('--count');
  const maxTotal = countIdx >= 0 ? parseInt(args[countIdx + 1]) : DEFAULT_COUNT * 10; // allow more with multi-account

  // Discover credentials
  const accounts = discoverCredentials();
  if (accounts.length === 0) {
    console.error('No credential files found. Expected gsc-oauth-credentials*.json in project root.');
    process.exit(1);
  }
  console.log(`Found ${accounts.length} credential file(s):`);
  accounts.forEach(a => console.log(`  - ${a.name}`));

  // Parse sitemap
  if (!fs.existsSync(SITEMAP_PATH)) {
    console.error('Run `npm run build` first to generate dist/sitemap.xml');
    process.exit(1);
  }
  const sitemap = fs.readFileSync(SITEMAP_PATH, 'utf-8');
  const allUrls = [...sitemap.matchAll(/<loc>(.*?)<\/loc>/g)].map(m => m[1]);

  // Load progress
  let progress = { submitted: [], lastRun: null };
  if (fs.existsSync(PROGRESS_PATH)) {
    progress = JSON.parse(fs.readFileSync(PROGRESS_PATH, 'utf-8'));
  }

  // Find pending URLs
  const submittedSet = new Set(progress.submitted);
  const pending = allUrls.filter(u => !submittedSet.has(u));
  const toSubmit = pending.slice(0, maxTotal);

  console.log(`\nSitemap: ${allUrls.length} URLs`);
  console.log(`Already submitted: ${progress.submitted.length}`);
  console.log(`Pending: ${pending.length}`);
  console.log(`This run (max): ${toSubmit.length}${dryRun ? ' (DRY RUN)' : ''}`);

  if (toSubmit.length === 0) {
    console.log('All URLs submitted!');
    return;
  }

  if (dryRun) {
    toSubmit.forEach((u, i) => console.log(`  ${i + 1}. ${u}`));
    return;
  }

  // Rotate through accounts
  let remaining = [...toSubmit];
  const newSubmitted = [];

  for (const account of accounts) {
    if (remaining.length === 0) break;

    const perAccount = Math.min(remaining.length, QUOTA_PER_ACCOUNT);
    console.log(`\n── Account ${account.name}: submitting up to ${perAccount} URLs ──`);

    try {
      const result = await submitWithAccount(account, remaining, perAccount);
      newSubmitted.push(...result.submitted);
      remaining = remaining.slice(result.submitted.length);

      console.log(`  Account result: ${result.submitted.length} submitted, quota hit: ${result.quotaHit}`);

      // Save progress incrementally
      progress.submitted.push(...result.submitted);
      progress.lastRun = new Date().toISOString();
      fs.writeFileSync(PROGRESS_PATH, JSON.stringify(progress, null, 2));
    } catch (err) {
      console.log(`  Account error: ${err.message}`);
      console.log('  Skipping to next account...');
    }
  }

  console.log(`\n=== DONE ===`);
  console.log(`Submitted this run: ${newSubmitted.length}`);
  console.log(`Total submitted: ${progress.submitted.length}/${allUrls.length}`);
  console.log(`Remaining: ${allUrls.length - progress.submitted.length}`);
  if (remaining.length > 0) {
    console.log(`\n${remaining.length} URLs still pending. Run again tomorrow (quota resets daily).`);
  }
}

main().catch(e => { console.error('Fatal:', e); process.exit(1); });
