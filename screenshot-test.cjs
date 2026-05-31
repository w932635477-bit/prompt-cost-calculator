const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });

  await page.goto('https://aicalc.cloud/llm-pricing/', { waitUntil: 'networkidle' });
  await page.screenshot({ path: '/tmp/llm-pricing-hub.png', fullPage: true });
  console.log('Hub screenshot saved');

  await page.goto('https://aicalc.cloud/llm-pricing/gpt-4o-pricing/', { waitUntil: 'networkidle' });
  await page.screenshot({ path: '/tmp/llm-pricing-seo.png', fullPage: true });
  console.log('SEO screenshot saved');

  await page.setViewportSize({ width: 375, height: 812 });
  await page.goto('https://aicalc.cloud/llm-pricing/', { waitUntil: 'networkidle' });
  await page.screenshot({ path: '/tmp/llm-pricing-mobile.png', fullPage: true });
  console.log('Mobile screenshot saved');

  await browser.close();
})();
