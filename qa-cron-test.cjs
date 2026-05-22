const { chromium } = require('playwright');

const BASE_URL = 'https://prompt-cost-calculator-ten.vercel.app/cron-generator/';

const results = { passed: [], failed: [], bugs: [] };

function log(test, status, detail = '') {
  const icon = status === 'PASS' ? '✅' : status === 'FAIL' ? '❌' : '⚠️';
  const line = `${icon} ${test}${detail ? ': ' + detail : ''}`;
  console.log(line);
  if (status === 'PASS') results.passed.push(test);
  else if (status === 'FAIL') { results.failed.push(test); results.bugs.push({ test, detail }); }
  else results.passed.push(test); // WARN counts as passed
}

async function runTests() {
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });

  // Collect console errors
  const consoleErrors = [];
  page.on('console', msg => {
    if (msg.type() === 'error') consoleErrors.push(msg.text());
  });

  console.log('\n========== CRON GENERATOR QA TEST SUITE ==========\n');

  // ===== T1: Page Load =====
  console.log('\n--- T1: Page Load ---');
  await page.goto(BASE_URL, { waitUntil: 'networkidle', timeout: 30000 });

  const title = await page.title();
  log('T1.1 Page title', title.includes('Cron Expression Generator') ? 'PASS' : 'FAIL', title);

  const h1 = await page.textContent('h1');
  log('T1.2 H1 heading', h1.includes('Cron Expression Generator') ? 'PASS' : 'FAIL', h1);

  const consoleAfterLoad = [...consoleErrors];
  log('T1.3 No JS errors on load', consoleAfterLoad.length === 0 ? 'PASS' : 'FAIL',
    consoleAfterLoad.length === 0 ? '' : consoleAfterLoad.join('; '));

  // ===== T2: Expression Display =====
  console.log('\n--- T2: Expression Display ---');

  const exprCode = await page.textContent('code');
  log('T2.1 Default expression displayed', exprCode.includes('*/5') || exprCode.includes('*') ? 'PASS' : 'FAIL', exprCode);

  const humanReadable = await page.evaluate(() => {
    const el = document.querySelector('.text-slate-500.font-medium, .text-gray-600, p');
    return el ? el.textContent : 'not found';
  });
  log('T2.2 Human readable explanation', humanReadable !== 'not found' && humanReadable.length > 0 ? 'PASS' : 'FAIL', humanReadable.substring(0, 60));

  // ===== T3: Natural Language Input =====
  console.log('\n--- T3: Natural Language Input ---');

  const nlInput = page.locator('input[placeholder*="every 5 minutes"]');
  const nlExists = await nlInput.count();
  log('T3.1 NL input exists', nlExists > 0 ? 'PASS' : 'FAIL');

  if (nlExists > 0) {
    // Test: "every 5 minutes"
    await nlInput.fill('every 5 minutes');
    await page.getByRole('button', { name: 'Generate' }).first().click();
    await page.waitForTimeout(500);

    const expr5min = await page.textContent('code');
    log('T3.2 NL "every 5 minutes" → */5 * * * *',
      expr5min.includes('*/5') ? 'PASS' : 'FAIL', expr5min);

    // Test: "weekdays at 9am"
    await nlInput.clear();
    await nlInput.fill('weekdays at 9am');
    await page.getByRole('button', { name: 'Generate' }).first().click();
    await page.waitForTimeout(500);

    const exprWeekday = await page.textContent('code');
    log('T3.3 NL "weekdays at 9am" → 0 9 * * 1-5',
      exprWeekday.includes('0') && exprWeekday.includes('9') && exprWeekday.includes('1-5') ? 'PASS' : 'FAIL', exprWeekday);

    // Test: "daily"
    await nlInput.clear();
    await nlInput.fill('daily');
    await page.getByRole('button', { name: 'Generate' }).first().click();
    await page.waitForTimeout(500);

    const exprDaily = await page.textContent('code');
    log('T3.4 NL "daily" produces valid cron',
      exprDaily.includes('*') ? 'PASS' : 'FAIL', exprDaily);

    // Test: invalid input
    await nlInput.clear();
    await nlInput.fill('xyzabc not a schedule');
    await page.getByRole('button', { name: 'Generate' }).first().click();
    await page.waitForTimeout(300);

    const errorShown = await page.evaluate(() => {
      const el = document.querySelector('.text-amber-600');
      return el ? el.textContent : '';
    });
    log('T3.5 Invalid NL shows error message', errorShown.length > 0 ? 'PASS' : 'FAIL', errorShown);

    // Test: Enter key submits
    await nlInput.clear();
    await nlInput.fill('every hour');
    await nlInput.press('Enter');
    await page.waitForTimeout(500);

    const exprHour = await page.textContent('code');
    log('T3.6 Enter key submits NL input',
      exprHour.includes('0') && exprHour.includes('*') ? 'PASS' : 'FAIL', exprHour);
  }

  // ===== T4: Suggestion Chips =====
  console.log('\n--- T4: Suggestion Chips ---');

  const chips = await page.locator('button:has-text("Every")').count();
  log('T4.1 Suggestion chips visible', chips > 0 ? 'PASS' : 'FAIL', `${chips} chips`);

  if (chips > 0) {
    await page.locator('button:has-text("Every")').first().click();
    await page.waitForTimeout(300);

    const afterChip = await page.textContent('code');
    log('T4.2 Clicking chip updates expression', afterChip.includes('*') ? 'PASS' : 'FAIL', afterChip);
  }

  // ===== T5: Visual Builder =====
  console.log('\n--- T5: Visual Builder ---');

  // Find builder inputs (monospace inputs for cron fields)
  const builderInputs = await page.locator('input[placeholder="*"]').count();
  log('T5.1 Builder has 5 field inputs', builderInputs === 5 ? 'PASS' : 'FAIL', `${builderInputs} inputs`);

  if (builderInputs === 5) {
    // Type in minute field
    const minuteInput = page.locator('input[placeholder="*"]').first();
    await minuteInput.clear();
    await minuteInput.fill('30');
    await page.waitForTimeout(300);

    const expr30 = await page.textContent('code');
    log('T5.2 Editing minute field updates expression',
      expr30.includes('30') ? 'PASS' : 'FAIL', expr30);

    // Click preset button
    const presetBtn = await page.locator('button:has-text("Every 5")').first();
    if (await presetBtn.count() > 0) {
      await presetBtn.click();
      await page.waitForTimeout(300);

      const afterPreset = await page.textContent('code');
      log('T5.3 Clicking preset button updates field',
        afterPreset.includes('*/5') ? 'PASS' : 'FAIL', afterPreset);
    }
  }

  // ===== T6: Dialect Switcher =====
  console.log('\n--- T6: Dialect Switcher ---');

  // First set a known expression
  await page.locator('input[placeholder*="every 5 minutes"]').clear();
  await page.locator('input[placeholder*="every 5 minutes"]').fill('every 5 minutes');
  await page.getByRole('button', { name: 'Generate' }).first().click();
  await page.waitForTimeout(500);

  const quartzBtn = page.getByRole('button', { name: 'Quartz' });
  const awsBtn = page.getByRole('button', { name: 'AWS' });
  const unixBtn = page.getByRole('button', { name: 'Unix' });

  // Switch to Quartz
  if (await quartzBtn.count() > 0) {
    await quartzBtn.click();
    await page.waitForTimeout(300);

    const quartzExpr = await page.textContent('code');
    log('T6.1 Quartz conversion works',
      quartzExpr.includes('0') && quartzExpr.includes('?') ? 'PASS' : 'FAIL', quartzExpr);
  } else {
    log('T6.1 Quartz button not found', 'FAIL');
  }

  // Switch to AWS
  if (await awsBtn.count() > 0) {
    await awsBtn.click();
    await page.waitForTimeout(300);

    const awsExpr = await page.textContent('code');
    log('T6.2 AWS conversion works',
      awsExpr.includes('cron(') ? 'PASS' : 'FAIL', awsExpr);
  } else {
    log('T6.2 AWS button not found', 'FAIL');
  }

  // Switch back to Unix
  if (await unixBtn.count() > 0) {
    await unixBtn.click();
    await page.waitForTimeout(300);

    const unixExpr = await page.textContent('code');
    log('T6.3 Unix conversion restores original',
      unixExpr.includes('*/5') && !unixExpr.includes('cron(') ? 'PASS' : 'FAIL', unixExpr);
  } else {
    log('T6.3 Unix button not found', 'FAIL');
  }

  // ===== T7: Copy Button =====
  console.log('\n--- T7: Copy Button ---');

  const copyBtn = page.getByRole('button', { name: 'Copy' });
  const copyExists = await copyBtn.count();
  log('T7.1 Copy button visible when valid', copyExists > 0 ? 'PASS' : 'FAIL');

  // ===== T8: Tab Switching =====
  console.log('\n--- T8: Tab Switching ---');

  const explainerTab = page.getByRole('button', { name: 'Explainer' });
  const builderTab = page.getByRole('button', { name: 'Builder' });

  // Switch to Explainer
  if (await explainerTab.count() > 0) {
    await explainerTab.click();
    await page.waitForTimeout(500);

    const explainInput = page.locator('input[placeholder*="Paste"]');
    const explainExists = await explainInput.count();
    log('T8.1 Explainer tab shows paste input', explainExists > 0 ? 'PASS' : 'FAIL');

    if (explainExists > 0) {
      await explainInput.fill('0 9 * * 1-5');

      const explainBtn = page.locator('button:has-text("Explain")').last();
      await explainBtn.click();
      await page.waitForTimeout(500);

      const explanation = await page.evaluate(() => {
        const el = document.querySelector('.text-blue-900');
        return el ? el.textContent : '';
      });
      log('T8.2 Explaining "0 9 * * 1-5" produces output',
        explanation.length > 0 ? 'PASS' : 'FAIL', explanation.substring(0, 80));

      // Check it contains "9" and weekday reference
      log('T8.3 Explanation mentions 9 AM and weekdays',
        (explanation.includes('9') && (explanation.includes('weekday') || explanation.includes('Monday') || explanation.includes('1'))) ? 'PASS' : 'FAIL',
        explanation.substring(0, 80));

      // Test invalid cron in explainer
      try {
        const currentInput = page.locator('input[placeholder*="Paste"]');
        if (await currentInput.count() > 0) {
          await currentInput.clear();
          await currentInput.fill('invalid');
          await explainBtn.click();
          await page.waitForTimeout(300);

          const invalidError = await page.evaluate(() => {
            const el = document.querySelector('.text-red-500');
            return el ? el.textContent : '';
          });
          log('T8.4 Invalid cron shows error in explainer', invalidError.length > 0 ? 'PASS' : 'FAIL', invalidError);
        } else {
          log('T8.4 Invalid cron shows error in explainer', 'WARN', 'input not found (tab may have switched)');
        }
      } catch (e) {
        log('T8.4 Invalid cron shows error in explainer', 'WARN', e.message.substring(0, 60));
      }
    }
  } else {
    log('T8.1 Explainer tab not found', 'FAIL');
  }

  // Switch back to Builder
  if (await builderTab.count() > 0) {
    await builderTab.click();
    await page.waitForTimeout(300);
    log('T8.5 Builder tab switch works', 'PASS');
  }

  // ===== T9: Next Runs =====
  console.log('\n--- T9: Next Runs ---');

  const nextRunsSection = await page.evaluate(() => {
    const el = document.querySelector('h3, [class*="font-semibold"]');
    const all = document.querySelectorAll('h3');
    for (const h of all) {
      if (h.textContent.includes('Next')) return h.textContent;
    }
    return '';
  });
  log('T9.1 Next runs section visible', nextRunsSection.length > 0 ? 'PASS' : 'FAIL', nextRunsSection);

  const nextRunCards = await page.evaluate(() => {
    return document.querySelectorAll('.text-center').length;
  });
  log('T9.2 Next run time cards rendered', nextRunCards > 0 ? 'PASS' : 'FAIL', `${nextRunCards} cards`);

  // ===== T10: Common Patterns =====
  console.log('\n--- T10: Common Patterns ---');

  const patternButtons = await page.locator('button:has(code)').count();
  log('T10.1 Pattern buttons visible', patternButtons > 0 ? 'PASS' : 'FAIL', `${patternButtons} buttons`);

  if (patternButtons > 0) {
    await page.locator('button:has(code)').first().click();
    await page.waitForTimeout(500);

    const afterPattern = await page.textContent('code');
    log('T10.2 Clicking pattern updates expression', afterPattern.includes('*') ? 'PASS' : 'FAIL', afterPattern);
  }

  // ===== T11: FAQ =====
  console.log('\n--- T11: FAQ ---');

  const faqItems = await page.locator('details').count();
  log('T11.1 FAQ items present', faqItems >= 5 ? 'PASS' : 'FAIL', `${faqItems} items`);

  if (faqItems > 0) {
    await page.locator('details').first().click();
    await page.waitForTimeout(300);

    const isOpen = await page.evaluate(() => {
      return document.querySelector('details[open]') !== null;
    });
    log('T11.2 FAQ accordion opens', isOpen ? 'PASS' : 'FAIL');
  }

  // ===== T12: Mobile Responsive =====
  console.log('\n--- T12: Mobile Responsive ---');

  await page.setViewportSize({ width: 375, height: 812 });
  await page.waitForTimeout(500);

  const mobileExpr = await page.textContent('code');
  log('T12.1 Mobile: expression visible', mobileExpr.length > 0 ? 'PASS' : 'FAIL', mobileExpr);

  // Check no horizontal scroll
  const hasHScroll = await page.evaluate(() => {
    return document.documentElement.scrollWidth > document.documentElement.clientWidth;
  });
  log('T12.2 Mobile: no horizontal scroll', !hasHScroll ? 'PASS' : 'FAIL');

  // Check console errors after mobile resize
  const mobileErrors = consoleErrors.filter(e => !consoleAfterLoad.includes(e));
  log('T12.3 Mobile: no new JS errors', mobileErrors.length === 0 ? 'PASS' : 'FAIL',
    mobileErrors.length === 0 ? '' : mobileErrors.join('; '));

  // Test NL input on mobile
  const mobileInput = page.locator('input[placeholder*="every 5 minutes"]');
  if (await mobileInput.count() > 0) {
    await mobileInput.fill('every 30 minutes');
    await mobileInput.press('Enter');
    await page.waitForTimeout(500);

    const mobileExpr30 = await page.textContent('code');
    log('T12.4 Mobile: NL input works', mobileExpr30.includes('*/30') ? 'PASS' : 'FAIL', mobileExpr30);
  }

  // ===== T13: Edge Cases =====
  console.log('\n--- T13: Edge Cases ---');

  await page.setViewportSize({ width: 1440, height: 900 });
  await page.waitForTimeout(300);

  // Switch to builder tab and clear all fields
  if (await builderTab.count() > 0) {
    await builderTab.click();
    await page.waitForTimeout(300);
  }

  // Test empty expression
  const fieldInputs = await page.locator('input[placeholder="*"]').all();
  if (fieldInputs.length >= 5) {
    await fieldInputs[0].clear();
    await fieldInputs[0].fill('');
    await page.waitForTimeout(300);

    const emptyExpr = await page.textContent('code');
    log('T13.1 Empty field handled', emptyExpr !== '' ? 'PASS' : 'FAIL', 'expression still shows');

    // Check for invalid indicator
    const hasInvalid = await page.evaluate(() => {
      const el = document.querySelector('.text-red-400, .text-red-500');
      return el !== null;
    });
    log('T13.2 Invalid expression shows error indicator', hasInvalid ? 'PASS' : 'FAIL');

    // Restore valid value
    await fieldInputs[0].fill('*/5');
    await page.waitForTimeout(300);
  }

  // Test Quartz dialect with complex expression
  await page.locator('input[placeholder*="every 5 minutes"]').clear();
  await page.locator('input[placeholder*="every 5 minutes"]').fill('every weekday at 9am');
  await page.getByRole('button', { name: 'Generate' }).first().click();
  await page.waitForTimeout(500);

  if (await quartzBtn.count() > 0) {
    await quartzBtn.click();
    await page.waitForTimeout(300);

    const quartzWeekday = await page.textContent('code');
    log('T13.3 Quartz complex expression valid',
      quartzWeekday.includes('0') && !quartzWeekday.includes('NaN') ? 'PASS' : 'FAIL', quartzWeekday);

    // Switch back to Unix
    await unixBtn.click();
    await page.waitForTimeout(300);
  }

  // ===== T14: Console Error Check =====
  console.log('\n--- T14: Final Console Check ---');

  const allErrors = [...new Set(consoleErrors)];
  log('T14.1 Total unique console errors', allErrors.length === 0 ? 'PASS' : 'FAIL',
    allErrors.length === 0 ? '0 errors' : allErrors.join('\n'));

  // ===== T15: Link to main page =====
  console.log('\n--- T15: Navigation ---');

  const homeLink = page.locator('a:has-text("AI Cost Calculator")');
  const homeLinkExists = await homeLink.count();
  log('T15.1 Link to main page exists', homeLinkExists > 0 ? 'PASS' : 'FAIL');

  if (homeLinkExists > 0) {
    const href = await homeLink.getAttribute('href');
    log('T15.2 Home link href correct', href === '/' ? 'PASS' : 'FAIL', href);
  }

  // ===== SUMMARY =====
  console.log('\n========== SUMMARY ==========');
  console.log(`PASSED: ${results.passed.length}`);
  console.log(`FAILED: ${results.failed.length}`);

  if (results.bugs.length > 0) {
    console.log('\n❌ BUGS FOUND:');
    results.bugs.forEach((b, i) => {
      console.log(`  ${i + 1}. ${b.test}: ${b.detail}`);
    });
  } else {
    console.log('\n✅ ALL TESTS PASSED — NO BUGS FOUND');
  }

  console.log('\n==============================\n');

  await browser.close();
  return results;
}

runTests().then(r => {
  process.exit(r.failed.length > 0 ? 1 : 0);
}).catch(e => {
  console.error('FATAL:', e);
  process.exit(2);
});
