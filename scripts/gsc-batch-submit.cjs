#!/usr/bin/env node
// Google Indexing API batch submitter
// Usage: node scripts/gsc-batch-submit.cjs [--dry-run] [--count N]
// Submits URLs from sitemap to Google Indexing API, respecting daily quota.
// Run daily via cron until all URLs are submitted.

const fs = require('fs');
const path = require('path');
const { fetch, ProxyAgent } = require('undici');

const PROXY = new ProxyAgent('http://127.0.0.1:7890');
const CREDS_PATH = path.join(__dirname, '..', 'gsc-oauth-credentials.json');
const TOKEN_PATH = path.join(__dirname, '..', '.gsc-indexing-token.json');
const PROGRESS_PATH = path.join(__dirname, '..', '.gsc-submit-progress.json');
const SITEMAP_PATH = path.join(__dirname, '..', 'dist', 'sitemap.xml');

const BATCH_SIZE = 50;
const DELAY_MS = 1000;
const DEFAULT_COUNT = 200;

async function refreshToken() {
  const creds = JSON.parse(fs.readFileSync(CREDS_PATH, 'utf-8'));
  const token = JSON.parse(fs.readFileSync(TOKEN_PATH, 'utf-8'));

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
  fs.writeFileSync(TOKEN_PATH, JSON.stringify(newToken, null, 2));
  return newToken.access_token;
}

async function submitUrl(accessToken, url) {
  const res = await fetch('https://indexing.googleapis.com/v3/urlNotifications:publish', {
    method: 'POST',
    dispatcher: PROXY,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${accessToken}`
    },
    body: JSON.stringify({ url, type: 'URL_UPDATED' })
  });
  const data = await res.json();
  return { ok: res.ok, url, status: res.status, error: data.error?.message };
}

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

async function main() {
  const args = process.argv.slice(2);
  const dryRun = args.includes('--dry-run');
  const countIdx = args.indexOf('--count');
  const maxCount = countIdx >= 0 ? parseInt(args[countIdx + 1]) : DEFAULT_COUNT;

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
  const pending = allUrls.filter(u => !progress.submitted.includes(u));
  const toSubmit = pending.slice(0, maxCount);

  console.log(`Sitemap: ${allUrls.length} URLs`);
  console.log(`Already submitted: ${progress.submitted.length}`);
  console.log(`Pending: ${pending.length}`);
  console.log(`This batch: ${toSubmit.length}${dryRun ? ' (DRY RUN)' : ''}`);

  if (toSubmit.length === 0) {
    console.log('All URLs submitted!');
    return;
  }

  if (dryRun) {
    toSubmit.forEach((u, i) => console.log(`  ${i + 1}. ${u}`));
    return;
  }

  // Refresh token
  const accessToken = await refreshToken();
  console.log('Token refreshed');

  // Submit in batches
  let submitted = 0;
  let failed = 0;
  const newSubmitted = [];

  for (let i = 0; i < toSubmit.length; i += BATCH_SIZE) {
    const batch = toSubmit.slice(i, i + BATCH_SIZE);
    console.log(`Batch ${Math.floor(i / BATCH_SIZE) + 1} (${batch.length} URLs)...`);

    const results = await Promise.all(batch.map(u => submitUrl(accessToken, u)));
    for (const r of results) {
      if (r.ok) {
        submitted++;
        newSubmitted.push(r.url);
      } else {
        failed++;
        if (r.error?.includes('Quota exceeded')) {
          console.log('  QUOTA EXCEEDED. Stopping.');
          // Save what we got so far
          progress.submitted.push(...newSubmitted);
          progress.lastRun = new Date().toISOString();
          fs.writeFileSync(PROGRESS_PATH, JSON.stringify(progress, null, 2));
          console.log(`\nSubmitted this run: ${submitted}`);
          console.log(`Total submitted: ${progress.submitted.length}/${allUrls.length}`);
          console.log('Run again tomorrow to continue.');
          process.exit(0);
        }
        console.log(`  FAIL: ${r.url} - ${r.error}`);
      }
    }

    if (i + BATCH_SIZE < toSubmit.length) {
      await sleep(DELAY_MS);
    }
  }

  // Save progress
  progress.submitted.push(...newSubmitted);
  progress.lastRun = new Date().toISOString();
  fs.writeFileSync(PROGRESS_PATH, JSON.stringify(progress, null, 2));

  console.log(`\n=== DONE ===`);
  console.log(`Submitted this run: ${submitted}`);
  console.log(`Failed: ${failed}`);
  console.log(`Total submitted: ${progress.submitted.length}/${allUrls.length}`);
  console.log(`Remaining: ${allUrls.length - progress.submitted.length}`);
}

main().catch(e => { console.error('Fatal:', e); process.exit(1); });
