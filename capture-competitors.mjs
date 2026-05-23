import { chromium } from 'playwright';
import fs from 'fs';

const SITES = [
  {
    name: 'crontab-generator.org',
    url: 'https://crontab-generator.org/',
    desktopPath: '/tmp/competitor-crontab-gen.png',
    mobilePath: '/tmp/competitor-crontab-gen-mobile.png'
  },
  {
    name: 'freeformatter.com',
    url: 'https://www.freeformatter.com/cron-expression-generator-quartz.html',
    desktopPath: '/tmp/competitor-freeformatter.png',
    mobilePath: '/tmp/competitor-freeformatter-mobile.png'
  },
  {
    name: 'cronhub.io',
    url: 'https://cronhub.io/cron-expression-generator',
    desktopPath: '/tmp/competitor-cronhub.png',
    mobilePath: '/tmp/competitor-cronhub-mobile.png'
  },
  {
    name: 'cronmaker.com',
    url: 'https://www.cronmaker.com/',
    desktopPath: '/tmp/competitor-cronmaker.png',
    mobilePath: '/tmp/competitor-cronmaker-mobile.png'
  }
];

const browser = await chromium.launch({
  proxy: { server: 'http://127.0.0.1:7890' }
});

for (const site of SITES) {
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  try {
    console.log(`\n=== ${site.name} ===`);
    await page.goto(site.url, { timeout: 30000, waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);
    await page.screenshot({ path: site.desktopPath, fullPage: true });
    console.log('Desktop screenshot saved:', site.desktopPath);

    const title = await page.title();
    const metaDesc = await page.evaluate(() => {
      const el = document.querySelector('meta[name="description"]');
      return el ? el.content : 'none';
    });
    const canonicalUrl = await page.evaluate(() => {
      const el = document.querySelector('link[rel="canonical"]');
      return el ? el.href : 'none';
    });
    const h1 = await page.evaluate(() => {
      const el = document.querySelector('h1');
      return el ? el.textContent.trim() : 'none';
    });
    const ogTags = await page.evaluate(() => {
      const tags = {};
      ['og:title', 'og:description', 'og:image', 'og:url', 'og:type'].forEach(prop => {
        const el = document.querySelector(`meta[property="${prop}"]`);
        tags[prop] = el ? el.content : 'none';
      });
      return tags;
    });
    const hasSchema = await page.evaluate(() => {
      const scripts = document.querySelectorAll('script[type="application/ld+json"]');
      return scripts.length > 0 ? Array.from(scripts).map(s => {
        try { return JSON.parse(s.textContent); } catch { return s.textContent.substring(0, 200); }
      }) : [];
    });
    const formElements = await page.evaluate(() => ({
      selects: document.querySelectorAll('select').length,
      inputs: document.querySelectorAll('input').length,
      buttons: document.querySelectorAll('button').length,
      textareas: document.querySelectorAll('textarea').length
    }));
    const bodyText = await page.evaluate(() => document.body.innerText.substring(0, 5000));
    const features = {
      mentionsQuartz: bodyText.toLowerCase().includes('quartz'),
      mentionsNextRun: (bodyText.toLowerCase().includes('next') && bodyText.toLowerCase().includes('run')),
      mentionsCopy: bodyText.toLowerCase().includes('copy'),
      mentionsExplain: bodyText.toLowerCase().includes('explain'),
      mentionsNaturalLanguage: bodyText.toLowerCase().includes('natural language'),
      mentionsHuman: bodyText.toLowerCase().includes('human'),
      hasTable: (await page.evaluate(() => document.querySelectorAll('table').length)) > 0,
      bodySnippet: bodyText.substring(0, 500)
    };

    // Mobile screenshot
    await page.setViewportSize({ width: 375, height: 812 });
    await page.waitForTimeout(1000);
    await page.screenshot({ path: site.mobilePath, fullPage: true });
    console.log('Mobile screenshot saved:', site.mobilePath);

    console.log('Title:', title);
    console.log('Meta desc:', metaDesc);
    console.log('Canonical:', canonicalUrl);
    console.log('H1:', h1);
    console.log('OG tags:', JSON.stringify(ogTags));
    console.log('Schema:', JSON.stringify(hasSchema).substring(0, 500));
    console.log('Form elements:', JSON.stringify(formElements));
    console.log('Features:', JSON.stringify(features));

  } catch (e) {
    console.error(`Error on ${site.name}:`, e.message);
  }
  await page.close();
}

await browser.close();
console.log('\nDone!');
