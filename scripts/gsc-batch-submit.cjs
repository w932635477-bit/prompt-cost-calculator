const { google } = require('googleapis');
const fs = require('fs');
const path = require('path');
const https = require('https');

const BASE_URL = 'https://aicalc.cloud';

function addSlugs(file, prefix) {
  const content = fs.readFileSync(file, 'utf-8');
  return [...content.matchAll(/slug: '([^']+)'/g)].map(m => BASE_URL + prefix + m[1] + '/');
}

const urls = [
  ...addSlugs('src/cron/seo/long-tail-data.ts', '/cron-generator/'),
  ...addSlugs('src/alternatives/seo/alternatives-data.ts', '/alternatives/'),
  ...addSlugs('src/deploy/seo/deploy-data.ts', '/deploy/'),
  ...addSlugs('src/compare/seo/compare-data.ts', '/compare/'),
  ...addSlugs('src/token-tracker/seo/scene-data.ts', '/token-tracker/'),
  ...addSlugs('src/mcp/seo/mcp-data.ts', '/mcp-servers/'),
  ...['zh','ja','es','pt','fr','de','ko'].map(l => BASE_URL + '/cron-generator/' + l + '/'),
];

console.log(`Total URLs: ${urls.length}`);

async function submitUrl(accessToken, url) {
  return new Promise((resolve) => {
    const data = JSON.stringify({ url, type: 'URL_UPDATED' });
    const req = https.request({
      hostname: 'indexing.googleapis.com',
      path: '/v3/urlNotifications:publish',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + accessToken,
        'Content-Length': Buffer.byteLength(data)
      }
    }, (res) => {
      let body = '';
      res.on('data', c => body += c);
      res.on('end', () => resolve({ status: res.statusCode, body }));
    });
    req.on('error', e => resolve({ status: 0, body: e.message }));
    req.write(data);
    req.end();
  });
}

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

async function main() {
  const cred = JSON.parse(fs.readFileSync('gsc-oauth-credentials.json', 'utf8'));
  const installed = cred.installed || cred.web;
  const oAuth2Client = new google.auth.OAuth2(installed.client_id, installed.client_secret, installed.redirect_uris[0]);
  const token = JSON.parse(fs.readFileSync('.gsc-indexing-token.json', 'utf8'));
  oAuth2Client.setCredentials(token);
  const { token: accessToken } = await oAuth2Client.getAccessToken();

  let ok = 0, fail = 0;
  // Batch in chunks of 10, parallel within chunk
  const CHUNK = 10;
  for (let i = 0; i < urls.length; i += CHUNK) {
    const chunk = urls.slice(i, i + CHUNK);
    const results = await Promise.all(chunk.map(url => submitUrl(accessToken, url)));
    for (let j = 0; j < results.length; j++) {
      const r = results[j];
      if (r.body.includes('urlNotificationMetadata')) {
        ok++;
      } else {
        fail++;
        console.log(`❌ [${i+j+1}/${urls.length}] ${chunk[j]} — ${r.body.substring(0, 100)}`);
      }
    }
    if ((i + CHUNK) % 50 === 0 || i + CHUNK >= urls.length) {
      console.log(`进度: ${Math.min(i + CHUNK, urls.length)}/${urls.length} (✅${ok} ❌${fail})`);
    }
    await sleep(600); // rate limit between chunks
  }
  console.log(`\n完成: ✅ ${ok} 成功, ❌ ${fail} 失败, 共 ${urls.length}`);
}

main().catch(e => { console.error(e); process.exit(1); });
