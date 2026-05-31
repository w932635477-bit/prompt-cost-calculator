const { chromium } = require('playwright');

const HUB = 'https://aicalc.cloud/llm-pricing/';
const SEO = 'https://aicalc.cloud/llm-pricing/gpt-4o-pricing/';
let passed = 0;
let failed = 0;

function assert(cond, msg) {
  if (cond) { passed++; console.log(`  ✅ ${msg}`); }
  else { failed++; console.log(`  ❌ ${msg}`); }
}

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });

  // ========== HUB PAGE TESTS ==========
  console.log('\n=== Hub Page Tests ===');

  // 1. Page loads
  await page.goto(HUB, { waitUntil: 'networkidle' });
  const title = await page.title();
  assert(title.includes('LLM API Pricing'), `Title: "${title}"`);

  // 2. No console errors
  const errors = [];
  page.on('console', msg => { if (msg.type() === 'error') errors.push(msg.text()); });
  await page.reload({ waitUntil: 'networkidle' });
  await page.waitForTimeout(1000);
  assert(errors.length === 0, `No console errors (found ${errors.length})`);

  // 3. Pricing table visible
  const table = page.locator('[data-testid="pricing-table"]');
  const tableVisible = await table.isVisible();
  assert(tableVisible, 'Pricing table visible');

  // 4. Table has rows
  const rows = await table.locator('tbody tr').count();
  assert(rows === 19, `Table has 19 model rows (found ${rows})`);

  // 5. Table headers are sortable
  const headers = table.locator('thead th');
  const headerCount = await headers.count();
  assert(headerCount >= 5, `Table has 5+ columns (found ${headerCount})`);

  // 6. Sort by clicking "Model" name column (different order than default price sort)
  const defaultFirstModel = await table.locator('tbody tr:first-child td:first-child').textContent();
  await headers.nth(0).click(); // Model name column
  await page.waitForTimeout(300);
  const nameSortedFirst = await table.locator('tbody tr:first-child td:first-child').textContent();
  assert(defaultFirstModel !== nameSortedFirst, 'Sorting by name changes row order');

  // 7. Toggle sort direction on name column
  await headers.nth(0).click();
  await page.waitForTimeout(300);
  const nameDescFirst = await table.locator('tbody tr:first-child td:first-child').textContent();
  assert(nameDescFirst !== nameSortedFirst, 'Toggle sort reverses order');

  // 8. Provider filter visible
  const filter = page.locator('[data-testid="provider-filter"]');
  const filterVisible = await filter.isVisible();
  assert(filterVisible, 'Provider filter visible');

  // 9. Provider buttons count
  const providerBtns = filter.locator('button');
  const providerCount = await providerBtns.count();
  assert(providerCount === 5, `5 provider buttons (found ${providerCount})`);

  // 10. Toggle a provider off
  await providerBtns.nth(2).click(); // Google
  await page.waitForTimeout(300);
  const visibleRows = await table.locator('tbody tr').count();
  assert(visibleRows < rows, `Filtering reduces rows (${rows} → ${visibleRows})`);

  // 11. Toggle back on
  await providerBtns.nth(2).click();
  await page.waitForTimeout(300);
  const restoredRows = await table.locator('tbody tr').count();
  assert(restoredRows === rows, `Restoring shows all rows again (${restoredRows})`);

  // 12. Can't deselect all providers (min 1)
  for (let i = 0; i < 5; i++) {
    await providerBtns.nth(i).click();
    await page.waitForTimeout(100);
  }
  const remainingRows = await table.locator('tbody tr').count();
  assert(remainingRows > 0, `Can't deselect all providers (${remainingRows} rows remain)`);

  // 13. Cost calculator visible
  const calc = page.locator('[data-testid="cost-calculator"]');
  const calcVisible = await calc.isVisible();
  assert(calcVisible, 'Cost calculator visible');

  // 14. Calculator inputs work
  const inputField = calc.locator('input[type="number"]').first();
  await inputField.fill('5000');
  await page.waitForTimeout(300);

  // 15. Calculator results update
  const monthlyCostText = await page.locator('[data-testid="cost-calculator"]').textContent();
  assert(monthlyCostText.includes('$'), 'Calculator shows dollar amounts');

  // 16. FAQ accordion works
  const firstFaq = page.locator('details').first();
  const isOpenBefore = await firstFaq.evaluate(el => el.open);
  assert(!isOpenBefore, 'FAQ starts closed');
  await firstFaq.locator('summary').click();
  const isOpenAfter = await firstFaq.evaluate(el => el.open);
  assert(isOpenAfter, 'FAQ opens on click');

  // 17. Global nav has LLM Pricing link
  const navLinks = page.locator('nav a');
  const llmLinkExists = await navLinks.evaluateAll(links =>
    links.some(l => l.textContent.includes('LLM Pricing'))
  );
  assert(llmLinkExists, 'GlobalNav has LLM Pricing link');

  // 18. Take screenshot
  await page.screenshot({ path: '/tmp/test-hub-final.png', fullPage: true });
  assert(true, 'Hub page screenshot saved');

  // ========== SEO PAGE TESTS ==========
  console.log('\n=== SEO Page Tests ===');

  // Clear console errors
  errors.length = 0;

  // 19. SEO page loads
  await page.goto(SEO, { waitUntil: 'networkidle' });
  const seoTitle = await page.title();
  assert(seoTitle.includes('GPT-4o'), `SEO title: "${seoTitle}"`);

  // 20. No console errors on SEO page
  await page.waitForTimeout(1000);
  assert(errors.length === 0, `SEO page: no console errors (${errors.length})`);

  // 21. Price cards visible
  const priceCards = page.locator('.rounded-xl');
  const cardCount = await priceCards.count();
  assert(cardCount >= 3, `Price cards visible (found ${cardCount})`);

  // 22. Input price card shows correct value
  const pageText = await page.locator('body').textContent();
  assert(pageText.includes('$2.50'), 'GPT-4o input price shown: $2.50');

  // 23. Cost calculator on SEO page works
  const seoCalcInputs = page.locator('input[type="number"]');
  const seoCalcCount = await seoCalcInputs.count();
  assert(seoCalcCount === 3, `SEO calculator has 3 inputs (found ${seoCalcCount})`);

  // 24. Change input tokens
  await seoCalcInputs.first().fill('50000');
  await page.waitForTimeout(300);
  const seoResult = await page.locator('body').textContent();
  assert(seoResult.includes('$'), 'SEO calculator shows cost after input change');

  // 25. Competitor table visible
  const compTable = page.locator('table').last();
  const compRows = await compTable.locator('tbody tr').count();
  assert(compRows >= 2, `Competitor table has rows (${compRows})`);

  // 26. FAQ accordion on SEO page
  const seoFaqs = page.locator('details');
  const seoFaqCount = await seoFaqs.count();
  assert(seoFaqCount >= 3, `SEO FAQ has 3+ items (found ${seoFaqCount})`);

  // 27. Open/close FAQ
  await seoFaqs.first().locator('summary').click();
  const seoFaqOpen = await seoFaqs.first().evaluate(el => el.open);
  assert(seoFaqOpen, 'SEO FAQ opens on click');

  // 28. CTA button links to hub
  const ctaLink = page.locator('a[href="/llm-pricing/"]').last();
  const ctaExists = await ctaLink.isVisible();
  assert(ctaExists, 'CTA button visible');

  // 29. Back link exists
  const backLink = page.locator('a[href="/llm-pricing/"]').first();
  const backExists = await backLink.isVisible();
  assert(backExists, 'Back to all models link visible');

  // 30. Screenshot
  await page.screenshot({ path: '/tmp/test-seo-final.png', fullPage: true });
  assert(true, 'SEO page screenshot saved');

  // ========== SUMMARY ==========
  console.log(`\n${'='.repeat(40)}`);
  console.log(`Total: ${passed + failed} | Passed: ${passed} | Failed: ${failed}`);
  console.log('='.repeat(40));

  await browser.close();
  process.exit(failed > 0 ? 1 : 0);
})();
