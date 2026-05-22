import { chromium } from 'playwright';

const URL = 'https://prompt-cost-calculator-ten.vercel.app/';
const results = [];
function check(name, passed, detail = '') {
  results.push({ name, passed, detail });
  const icon = passed ? 'PASS' : 'FAIL';
  console.log(`${icon}: ${name}${detail ? ' — ' + detail : ''}`);
}

(async () => {
  const browser = await chromium.launch({
    headless: true,
    executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    args: ['--no-sandbox']
  });
  const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });

  // Collect console errors
  const consoleErrors = [];
  page.on('console', msg => {
    if (msg.type() === 'error') consoleErrors.push(msg.text());
  });

  // 1. Page load
  console.log('\n=== 1. Page Load ===');
  try {
    await page.goto(URL, { waitUntil: 'networkidle', timeout: 30000 });
    check('Page loads', true);
  } catch (e) {
    check('Page loads', false, e.message);
    await browser.close();
    process.exit(1);
  }

  // 2. Title
  const title = await page.title();
  check('SEO title correct', title.includes('AI Prompt Cost Calculator'), title);

  // 3. Hero heading
  const h1 = await page.locator('h1').first().textContent();
  check('Hero heading visible', h1 && h1.includes('AI Prompt Cost'), h1);

  // 4. Textarea present
  const textarea = page.locator('#prompt-input');
  check('Textarea present', await textarea.isVisible());

  // 5. Button disabled when empty
  const calcBtn = page.locator('button', { hasText: 'Calculate Costs' });
  check('Calculate button disabled when empty', await calcBtn.isDisabled());

  // 6. Fill prompt and check button enabled
  console.log('\n=== 2. Prompt Input ===');
  await textarea.fill('Write a Python function to calculate fibonacci numbers. Include error handling and type hints. Make it efficient using memoization.');
  check('Button enabled after typing', await calcBtn.isEnabled());

  // 7. Character count
  const charText = await page.locator('text=/characters/').first().textContent();
  check('Character count shown', charText && charText.includes('characters'), charText);

  // 8. Click Calculate
  console.log('\n=== 3. Calculate Costs ===');
  await calcBtn.click();
  await page.waitForSelector('table tbody tr', { timeout: 30000 });

  // 9. Table appears
  const table = page.locator('table');
  check('Results table appears', await table.isVisible());

  // 10. 10 models in table
  const rows = await page.locator('tbody tr').count();
  check('All 10 models shown', rows === 10, `${rows} rows`);

  // 11. Provider badges
  const providers = ['OpenAI', 'Anthropic', 'Google', 'Groq', 'DeepSeek'];
  for (const p of providers) {
    const found = await page.locator(`text=${p}`).first().isVisible();
    check(`Provider badge: ${p}`, found);
  }

  // 12. Best Value badge
  check('Best Value badge', await page.locator('text=Best Value').isVisible());

  // 13. Savings banner
  const savingsBanner = page.locator('text=/Switch from.*and save/');
  check('Savings banner', await savingsBanner.isVisible());

  // 14. Sort by clicking headers
  console.log('\n=== 4. Sort Functionality ===');
  const beforeSort = await page.locator('tbody tr').first().textContent();
  await page.locator('th', { hasText: 'Tokens' }).click();
  await page.waitForTimeout(500);
  const afterSortTokens = await page.locator('tbody tr').first().textContent();
  check('Sort by Tokens changes order', beforeSort !== afterSortTokens);

  await page.locator('th', { hasText: 'Monthly' }).click();
  await page.waitForTimeout(500);
  const afterSortMonthly = await page.locator('tbody tr').first().textContent();
  check('Sort by Monthly changes order', afterSortTokens !== afterSortMonthly);

  // 15. Apple design markers
  console.log('\n=== 5. Apple Design ===');
  const bodyBg = await page.evaluate(() => getComputedStyle(document.body).backgroundColor);
  check('Body background (#fbfbfd)', bodyBg === 'rgb(251, 251, 253)', bodyBg);

  const cardBorder = await page.evaluate(() => {
    const card = document.querySelector('.rounded-3xl');
    return card ? getComputedStyle(card).borderRadius : 'none';
  });
  check('Calculator card rounded-3xl', cardBorder !== 'none', cardBorder);

  // 16. Slider interaction
  console.log('\n=== 6. Slider Interaction ===');
  const slider1 = page.locator('input[type="range"]').first();
  check('API calls slider present', await slider1.isVisible());

  const slider2 = page.locator('input[type="range"]').nth(1);
  check('Output tokens slider present', await slider2.isVisible());

  // Move slider and recalculate
  await slider1.fill('3');
  await calcBtn.click();
  await page.waitForSelector('table tbody tr', { timeout: 30000 });
  const monthlyAfterSlider = await page.locator('tbody tr td').last().textContent();
  check('Recalculate after slider change', monthlyAfterSlider && monthlyAfterSlider.startsWith('$'), monthlyAfterSlider);

  // 17. FAQ section
  console.log('\n=== 7. FAQ Section ===');
  await page.locator('text=How it works').scrollIntoViewIfNeeded();
  const howItWorks = page.locator('h2', { hasText: 'How it works.' });
  check('How it Works section', await howItWorks.isVisible());

  await page.locator('h2', { hasText: 'Frequently asked' }).scrollIntoViewIfNeeded();
  const faqHeading = page.locator('h2', { hasText: 'Frequently asked questions.' });
  check('FAQ heading', await faqHeading.isVisible());

  // Click FAQ item
  const faqItem = page.locator('details', { hasText: 'How accurate is the token count' });
  await faqItem.locator('summary').click();
  await page.waitForTimeout(300);
  const faqOpen = await faqItem.locator('div').isVisible();
  check('FAQ item expands on click', faqOpen);

  // 18. Footer
  console.log('\n=== 8. Footer ===');
  const footer = page.locator('footer');
  check('Footer present', await footer.isVisible());
  const footerLinks = await footer.locator('a').count();
  check('Footer has 5 provider links', footerLinks === 5, `${footerLinks} links`);

  // 19. Console errors
  console.log('\n=== 9. Console Errors ===');
  check('No console errors', consoleErrors.length === 0, consoleErrors.length > 0 ? consoleErrors.join('; ') : 'clean');

  // 20. Screenshot
  console.log('\n=== 10. Screenshot ===');
  await page.screenshot({ path: '/tmp/qa-full.png', fullPage: true });
  check('Full page screenshot saved', true, '/tmp/qa-full.png');

  // Mobile responsive
  await page.setViewportSize({ width: 375, height: 812 });
  await page.goto(URL, { waitUntil: 'networkidle', timeout: 30000 });
  await textarea.fill('Test prompt for mobile view');
  await calcBtn.click();
  await page.waitForTimeout(2000);
  await page.screenshot({ path: '/tmp/qa-mobile.png', fullPage: true });
  check('Mobile screenshot saved', true, '/tmp/qa-mobile.png');

  // Summary
  console.log('\n========== SUMMARY ==========');
  const passed = results.filter(r => r.passed).length;
  const failed = results.filter(r => !r.passed).length;
  console.log(`PASS: ${passed} / FAIL: ${failed} / TOTAL: ${results.length}`);
  if (failed > 0) {
    console.log('\nFailed checks:');
    results.filter(r => !r.passed).forEach(r => console.log(`  FAIL: ${r.name} — ${r.detail}`));
  }

  await browser.close();
  process.exit(failed > 0 ? 1 : 0);
})();
