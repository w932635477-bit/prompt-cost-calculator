// qa-pricing-accuracy.cjs
// HEADED Playwright test: fills the LLM Cost Calculator form, then verifies the
// displayed monthly cost for several models EXACTLY matches the billing formula
// in src/llm-pricing/calc.ts (projectMonthlyCost). Run: node qa-pricing-accuracy.cjs
//
// Covers: new models (GLM-5.2, Kimi K2.7, Claude Fable 5), the DeepSeek V4 Flash
// cache-price fix ($0.0028), and a known anchor (GPT-5.5).

const { chromium } = require('playwright');

const URL = 'https://aicalc.cloud/llm-pricing/llm-cost-calculator/';

// --- workload we will TYPE into the form (not the defaults) ---
const P = { inputTokens: 5000, outputTokens: 1000, callsPerDay: 2000, cachePct: 60 };
P.cacheRate = P.cachePct / 100;
P.daysPerMonth = 30; // fixed in the page (no field)
P.callsPerMonth = P.callsPerDay * P.daysPerMonth;

// --- model prices (must match src/data/pricing.json) ---
const MODELS = [
  { name: 'GPT-5.5',            I: 5,     O: 30,  C: 0.5    },
  { name: 'GLM-5.2',            I: 1.2,   O: 4.1, C: 0.2    },
  { name: 'DeepSeek V4 Flash',  I: 0.14,  O: 0.28, C: 0.0028 }, // cache-fix canary
  { name: 'Claude Fable 5',     I: 10,    O: 50,  C: 1      },
  { name: 'Kimi K2.7',          I: 0.74,  O: 3.5, C: 0.15   },
];

// --- replicate projectMonthlyCost + formatCost from src/llm-pricing/calc.ts ---
function expectedMonthly(m) {
  const cached   = (P.inputTokens * P.cacheRate       * m.C) / 1e6;
  const uncached = (P.inputTokens * (1 - P.cacheRate) * m.I) / 1e6;
  const output   = (P.outputTokens * m.O) / 1e6;
  return (cached + uncached + output) * P.callsPerMonth;
}
function formatCost(n) {
  if (n < 0.01) return `$${n.toFixed(4)}`;
  if (n < 1)    return `$${n.toFixed(3)}`;
  if (n < 100)  return `$${n.toFixed(2)}`;
  return `$${n.toLocaleString('en-US', { maximumFractionDigits: 0 })}`;
}

let pass = 0, fail = 0;
const ok = (c, m) => { c ? (pass++, console.log(`  ✅ ${m}`)) : (fail++, console.log(`  ❌ ${m}`)); };

(async () => {
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });

  const errors = [];
  page.on('console', msg => { if (msg.type() === 'error') errors.push(msg.text()); });
  page.on('pageerror', e => errors.push(String(e)));

  console.log('\n=== LLM Cost Calculator accuracy test (headed) ===');
  await page.goto(URL, { waitUntil: 'networkidle' });

  // 1. Page loaded
  const title = await page.title();
  ok(title.length > 0, `Page loaded (title: "${title.slice(0,40)}...")`);

  // 2. Fill the form (clear + type each field; set cache slider)
  console.log('\n--- Filling form ---');
  await page.locator('label:has-text("Input tokens / call") + input').fill(String(P.inputTokens));
  await page.locator('label:has-text("Output tokens / call") + input').fill(String(P.outputTokens));
  await page.locator('label:has-text("Calls per day") + input').fill(String(P.callsPerDay));
  await page.locator('input[type="range"]').fill(String(P.cachePct));
  await page.waitForTimeout(400);

  // verify the form actually accepted our values
  const inVal = await page.locator('label:has-text("Input tokens / call") + input').inputValue();
  const cacheVal = await page.locator('input[type="range"]').inputValue();
  ok(Number(inVal) === P.inputTokens, `Form accepted input tokens = ${inVal}`);
  ok(Number(cacheVal) === P.cachePct, `Cache slider set to ${cacheVal}%`);

  // 3. For each model: read displayed cost, compare to formula
  console.log('\n--- Monthly cost vs formula (100% accuracy) ---');
  for (const m of MODELS) {
    const want = formatCost(expectedMonthly(m));
    // locate the result row by exact model name, then the font-mono cost cell
    const nameSpan = page.getByText(m.name, { exact: true });
    const row = nameSpan.locator('xpath=ancestor::div[contains(@class,"items-center") and contains(@class,"gap-3")][1]');
    const costEl = row.locator('div.font-mono').first();
    let got;
    try {
      await costEl.waitFor({ timeout: 5000 });
      got = (await costEl.textContent()).trim();
    } catch (e) {
      got = `<not found: ${e.message.slice(0,60)}>`;
    }
    ok(got === want, `${m.name.padEnd(20)} displayed ${got.padEnd(9)} == formula ${want}  (raw ${expectedMonthly(m).toFixed(4)})`);
  }

  // 4. No console/page errors
  ok(errors.length === 0, `No console/page errors (found ${errors.length})${errors.length ? ': ' + errors.slice(0,3).join(' | ') : ''}`);

  console.log(`\n=== RESULT: ${pass} passed, ${fail} failed ===`);

  // keep browser open briefly so the headed run is observable, then close
  await page.waitForTimeout(fail ? 5000 : 1500);
  await browser.close();
  process.exit(fail ? 1 : 0);
})();
