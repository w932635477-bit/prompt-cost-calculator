#!/usr/bin/env node
// Google OAuth2 authorization flow for Indexing API
// Usage: node scripts/gsc-oauth-auth.cjs [--creds <path>]
// Opens browser for authorization, saves refresh token.

const fs = require('fs');
const path = require('path');
const http = require('http');
const { fetch, ProxyAgent } = require('undici');

const PROXY = new ProxyAgent('http://127.0.0.1:7890');
const PROJECT_ROOT = path.join(__dirname, '..');

const SCOPES = ['https://www.googleapis.com/auth/indexing'];
const REDIRECT_PORT = 9876;
const REDIRECT_URI = `http://localhost:${REDIRECT_PORT}`;

async function main() {
  const args = process.argv.slice(2);
  const credsIdx = args.indexOf('--creds');
  const credsFile = credsIdx >= 0
    ? path.resolve(args[credsIdx + 1])
    : path.join(PROJECT_ROOT, 'gsc-oauth-credentials.json');

  if (!fs.existsSync(credsFile)) {
    console.error(`Credentials not found: ${credsFile}`);
    console.error('Usage: node gsc-oauth-auth.cjs [--creds <path>]');
    process.exit(1);
  }

  const creds = JSON.parse(fs.readFileSync(credsFile, 'utf-8'));
  const clientId = creds.installed.client_id;
  const clientSecret = creds.installed.client_secret;

  // Derive token output path from creds file name
  const credsBasename = path.basename(credsFile);
  const suffix = credsBasename
    .replace('gsc-oauth-credentials', '')
    .replace('.json', '');
  const tokenPath = path.join(PROJECT_ROOT, `.gsc-indexing-token${suffix}.json`);

  console.log(`Credentials: ${credsBasename}`);
  console.log(`Token output: ${path.basename(tokenPath)}`);
  console.log('');

  // Build auth URL
  const authUrl = new URL('https://accounts.google.com/o/oauth2/v2/auth');
  authUrl.searchParams.set('client_id', clientId);
  authUrl.searchParams.set('redirect_uri', REDIRECT_URI);
  authUrl.searchParams.set('response_type', 'code');
  authUrl.searchParams.set('scope', SCOPES.join(' '));
  authUrl.searchParams.set('access_type', 'offline');
  authUrl.searchParams.set('prompt', 'consent');

  console.log('Opening browser for authorization...');
  console.log('');
  console.log(authUrl.toString());
  console.log('');

  // Try to open browser
  const { exec } = require('child_process');
  exec(`open "${authUrl.toString()}"`);

  // Start local server to catch redirect
  const code = await new Promise((resolve, reject) => {
    const server = http.createServer((req, res) => {
      const url = new URL(req.url, `http://localhost:${REDIRECT_PORT}`);
      const code = url.searchParams.get('code');
      const error = url.searchParams.get('error');

      if (code) {
        res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
        res.end('<h1>授权成功！</h1><p>可以关闭这个页面了。</p>');
        server.close();
        resolve(code);
      } else {
        res.writeHead(400, { 'Content-Type': 'text/html; charset=utf-8' });
        res.end(`<h1>授权失败</h1><p>${error || 'unknown error'}</p>`);
        server.close();
        reject(new Error('Authorization denied: ' + error));
      }
    });

    server.listen(REDIRECT_PORT, () => {
      console.log(`Waiting for callback on http://localhost:${REDIRECT_PORT} ...`);
    });

    setTimeout(() => {
      server.close();
      reject(new Error('Timeout: no callback received in 5 minutes'));
    }, 300000);
  });

  console.log('Got authorization code, exchanging for token...');

  // Exchange code for token
  const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    dispatcher: PROXY,
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      code,
      client_id: clientId,
      client_secret: clientSecret,
      redirect_uri: REDIRECT_URI,
      grant_type: 'authorization_code',
    }).toString(),
  });

  const tokenData = await tokenRes.json();
  if (!tokenData.refresh_token) {
    console.error('Token exchange failed:', JSON.stringify(tokenData, null, 2));
    console.error('');
    console.error('If error is "invalid_grant", the code may have expired. Try again.');
    process.exit(1);
  }

  const token = {
    access_token: tokenData.access_token,
    refresh_token: tokenData.refresh_token,
    scope: tokenData.scope,
    token_type: tokenData.token_type,
    expiry_date: Date.now() + (tokenData.expires_in * 1000),
  };

  fs.writeFileSync(tokenPath, JSON.stringify(token, null, 2));
  console.log('');
  console.log(`Token saved to: ${tokenPath}`);
  console.log('Refresh token:', token.refresh_token.slice(0, 20) + '...');
  console.log('');
  console.log('Done! You can now run gsc-batch-submit.cjs');
}

main().catch(e => { console.error('Fatal:', e.message); process.exit(1); });
