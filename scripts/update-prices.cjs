// scripts/update-prices.cjs
// Fetches LLM pricing from OpenRouter API and updates src/data/pricing.json.
// Single writable file constraint: ONLY writes pricing.json + changelog.
//
// Usage:
//   node scripts/update-prices.cjs              # dry run (default)
//   node scripts/update-prices.cjs --write      # actually update pricing.json

const fs = require('fs');
const path = require('path');
const https = require('https');

const PROJECT_ROOT = path.resolve(__dirname, '..');
const PRICING_PATH = path.join(PROJECT_ROOT, 'src/data/pricing.json');
const CHANGELOG_PATH = path.join(PROJECT_ROOT, 'PRICING_CHANGELOG.md');

const OPENROUTER_API = 'https://openrouter.ai/api/v1/models';

// trustLevel: 'full' = trust OR for all prices, 'cache_only' = only update cache from OR
const OPENROUTER_MAP = {
  'gpt-5.5':              { orId: 'openai/gpt-5.5', trust: 'full' },
  'gpt-5.4':              { orId: 'openai/gpt-5.4', trust: 'full' },
  'gpt-5.4-mini':         { orId: 'openai/gpt-5.4-mini', trust: 'full' },
  'gpt-4o':               { orId: 'openai/gpt-4o-2024-11-20', trust: 'full' },
  'gpt-4o-mini':          { orId: 'openai/gpt-4o-mini', trust: 'full' },
  'o3':                   { orId: 'openai/o3', trust: 'full' },
  'o4-mini':              { orId: 'openai/o4-mini', trust: 'full' },
  'claude-opus-4-8':      { orId: 'anthropic/claude-opus-4.8', trust: 'full' },
  'claude-sonnet-4-6':    { orId: 'anthropic/claude-sonnet-4.6', trust: 'full' },
  'claude-haiku-4-5':     { orId: 'anthropic/claude-haiku-4.5', trust: 'full' },
  'claude-3-7-sonnet-20250219': { orId: null, trust: 'full' }, // not on OpenRouter
  'claude-3-5-haiku-20241022': { orId: 'anthropic/claude-3.5-haiku', trust: 'full' },
  'claude-3-opus-20240229':    { orId: null, trust: 'full' }, // not on OpenRouter
  'claude-3-haiku-20240307':   { orId: 'anthropic/claude-3-haiku', trust: 'full' },
  // DeepSeek V4 Flash: official-only — OpenRouter's cache price (~$0.02) is wrong;
  // official cache hit is $0.0028 (api-docs.deepseek.com). Bot must not overwrite it.
  'deepseek-v4-flash':    { orId: null, trust: 'full' },
  'deepseek-v4-pro':      { orId: 'deepseek/deepseek-v4-pro', trust: 'full' },
  'gemini-2.0-flash':     { orId: null, trust: 'full' }, // removed from OpenRouter
  'gemini-2.0-flash-lite': { orId: null, trust: 'full' }, // removed from OpenRouter
  'gemini-3-5-flash':     { orId: 'google/gemini-3.5-flash', trust: 'full' },
  'gemini-2-5-flash':     { orId: 'google/gemini-2.5-flash', trust: 'full' },
  'gemini-2-5-flash-lite': { orId: 'google/gemini-2.5-flash-lite', trust: 'full' },
  'gemini-1.5-pro':       { orId: null, trust: 'full' }, // deprecated
  'gemini-1.5-flash':     { orId: null, trust: 'full' }, // deprecated
  'gemini-1.5-flash-8b':  { orId: null, trust: 'full' }, // deprecated
  // Llama via Groq: OR prices differ from Groq official — keep Groq for input/output
  'llama-4-maverick':     { orId: 'meta-llama/llama-4-maverick', trust: 'cache_only' },
  // Added 2026-06-19: new flagship models (trust OR for input/output/cache)
  'claude-fable-5':       { orId: 'anthropic/claude-fable-5', trust: 'full' },
  'gemini-2-5-pro':       { orId: 'google/gemini-2.5-pro', trust: 'full' },
  'gemini-3-1-pro':       { orId: 'google/gemini-3.1-pro-preview', trust: 'full' },
  'grok-4-20':            { orId: 'x-ai/grok-4.20', trust: 'full' },
  'glm-5.2':              { orId: 'z-ai/glm-5.2', trust: 'full' },
  'kimi-k2.7':            { orId: 'moonshotai/kimi-k2.7-code', trust: 'full' },
};

const PRICE_TOLERANCE = 0.001; // $0.001/1M tolerance for float comparison

// ── HTTP helpers ──────────────────────────────────────────────────────

function fetchJSON(url) {
  return new Promise((resolve, reject) => {
    const req = https.get(url, { timeout: 30000 }, (res) => {
      const chunks = [];
      res.on('data', (c) => chunks.push(c));
      res.on('end', () => {
        try {
          resolve(JSON.parse(Buffer.concat(chunks).toString()));
        } catch (e) {
          reject(new Error(`Parse error from ${url}: ${e.message}`));
        }
      });
    });
    req.on('error', reject);
    req.on('timeout', () => { req.destroy(); reject(new Error(`Timeout: ${url}`)); });
  });
}

// ── Price conversion ──────────────────────────────────────────────────

// OpenRouter prices are per-token. Convert to per-1M tokens.
function perTokenToPer1M(perTokenStr) {
  if (!perTokenStr || perTokenStr === '0') return undefined;
  return parseFloat(perTokenStr) * 1_000_000;
}

function pricesEqual(a, b) {
  if (a === undefined && b === undefined) return true;
  if (a === undefined || b === undefined) return false;
  return Math.abs(a - b) < PRICE_TOLERANCE;
}

// ── Schema validation ─────────────────────────────────────────────────

const REQUIRED_FIELDS = ['id', 'provider', 'name', 'inputPricePer1M', 'outputPricePer1M', 'contextWindow', 'sourceUrl', 'priceUpdatedAt'];

function validateModel(model) {
  for (const field of REQUIRED_FIELDS) {
    if (model[field] === undefined || model[field] === null) {
      throw new Error(`Schema validation failed: model ${model.id} missing field "${field}"`);
    }
  }
  if (typeof model.inputPricePer1M !== 'number' || model.inputPricePer1M < 0) {
    throw new Error(`Schema validation failed: model ${model.id} invalid inputPricePer1M`);
  }
  if (typeof model.outputPricePer1M !== 'number' || model.outputPricePer1M < 0) {
    throw new Error(`Schema validation failed: model ${model.id} invalid outputPricePer1M`);
  }
}

// ── Main ──────────────────────────────────────────────────────────────

async function main() {
  const shouldWrite = process.argv.includes('--write');
  console.log(shouldWrite ? 'MODE: WRITE' : 'MODE: DRY RUN');

  // 1. Load current pricing.json
  const current = JSON.parse(fs.readFileSync(PRICING_PATH, 'utf8'));
  console.log(`Loaded ${current.models.length} models from pricing.json`);

  // Build lookup: id → model
  const currentById = new Map();
  for (const m of current.models) {
    currentById.set(m.id, m);
  }

  // 2. Fetch OpenRouter data
  console.log('Fetching OpenRouter API...');
  const orData = await fetchJSON(OPENROUTER_API);
  if (!orData.data || !Array.isArray(orData.data)) {
    throw new Error('Invalid OpenRouter response: missing data array');
  }
  const orById = new Map();
  for (const m of orData.data) {
    orById.set(m.id, m);
  }
  console.log(`OpenRouter returned ${orData.data.length} models`);

  // 3. Build updated models
  const today = new Date().toISOString().slice(0, 10);
  const changes = [];
  const updatedModels = current.models.map((existing) => {
    const mapping = OPENROUTER_MAP[existing.id];
    if (!mapping || !mapping.orId) {
      // Not on OpenRouter — keep existing prices
      changes.push({ id: existing.id, type: 'skipped', reason: 'not on OpenRouter' });
      return { ...existing };
    }

    const orModel = orById.get(mapping.orId);
    if (!orModel) {
      changes.push({ id: existing.id, type: 'skipped', reason: `OpenRouter ID "${mapping.orId}" not found` });
      return { ...existing };
    }

    const orInput = perTokenToPer1M(orModel.pricing?.prompt);
    const orOutput = perTokenToPer1M(orModel.pricing?.completion);
    const orCache = perTokenToPer1M(orModel.pricing?.input_cache_read);
    const isFull = mapping.trust === 'full';

    // For 'cache_only' trust: only update cache, keep official input/output
    const newInput = isFull ? orInput : undefined;
    const newOutput = isFull ? orOutput : undefined;
    const newCache = orCache;

    const inputChanged = isFull && newInput !== undefined && !pricesEqual(existing.inputPricePer1M, newInput);
    const outputChanged = isFull && newOutput !== undefined && !pricesEqual(existing.outputPricePer1M, newOutput);
    const cacheChanged = newCache !== undefined && !pricesEqual(existing.cachedInputPricePer1M, newCache);

    // Log OR vs official discrepancy for cache_only models
    if (!isFull && orInput !== undefined && !pricesEqual(existing.inputPricePer1M, orInput)) {
      changes.push({
        id: existing.id,
        type: 'noted',
        detail: `OR input $${orInput.toFixed(4)} differs from official $${existing.inputPricePer1M} (kept official)`,
      });
    }

    if (!inputChanged && !outputChanged && !cacheChanged) {
      return { ...existing };
    }

    const updated = { ...existing, priceUpdatedAt: today };
    const detail = [];

    if (inputChanged) {
      detail.push(`input: $${existing.inputPricePer1M} → $${newInput.toFixed(4)}`);
      updated.inputPricePer1M = parseFloat(newInput.toFixed(6));
    }
    if (outputChanged) {
      detail.push(`output: $${existing.outputPricePer1M} → $${newOutput.toFixed(4)}`);
      updated.outputPricePer1M = parseFloat(newOutput.toFixed(6));
    }
    if (cacheChanged) {
      detail.push(`cache: $${existing.cachedInputPricePer1M ?? 'N/A'} → $${newCache.toFixed(4)}`);
      updated.cachedInputPricePer1M = parseFloat(newCache.toFixed(6));
    }

    if (detail.length > 0) {
      changes.push({ id: existing.id, type: 'updated', detail: detail.join(', ') });
    }

    return updated;
  });

  // 4. Validate all models
  for (const m of updatedModels) {
    validateModel(m);
  }

  // 5. Report changes
  const updated = changes.filter(c => c.type === 'updated');
  const skipped = changes.filter(c => c.type === 'skipped');
  const noted = changes.filter(c => c.type === 'noted');

  console.log(`\n=== Results ===`);
  console.log(`Updated: ${updated.length}`);
  console.log(`Unchanged: ${current.models.length - updated.length - skipped.length}`);
  console.log(`Skipped (not on OpenRouter): ${skipped.length}`);

  if (updated.length > 0) {
    console.log('\nPrice changes:');
    for (const c of updated) {
      console.log(`  ${c.id}: ${c.detail}`);
    }
  }

  if (noted.length > 0) {
    console.log('\nNoted discrepancies (kept official prices):');
    for (const c of noted) {
      console.log(`  ${c.id}: ${c.detail}`);
    }
  }

  if (skipped.length > 0) {
    console.log('\nSkipped models (kept existing prices):');
    for (const c of skipped) {
      console.log(`  ${c.id}: ${c.reason}`);
    }
  }

  // 6. Write or dry-run
  if (updated.length === 0) {
    console.log('\nNo price changes detected. Nothing to write.');
    return;
  }

  const newPricing = {
    ...current,
    lastUpdated: today,
    models: updatedModels,
  };

  if (shouldWrite) {
    // Validate one more time before writing
    for (const m of newPricing.models) validateModel(m);

    fs.writeFileSync(PRICING_PATH, JSON.stringify(newPricing, null, 2) + '\n');
    console.log(`\n✓ Updated ${PRICING_PATH}`);

    // Write changelog entry
    const entry = [
      `## ${today}`,
      '',
      ...updated.map(c => `- **${c.id}**: ${c.detail}`),
      ...(skipped.length > 0 ? ['', '_Skipped (not on OpenRouter): ' + skipped.map(c => c.id).join(', ') + '_'] : []),
      '',
    ].join('\n');

    let changelog = '';
    if (fs.existsSync(CHANGELOG_PATH)) {
      changelog = fs.readFileSync(CHANGELOG_PATH, 'utf8');
    }
    const header = '# Pricing Changelog\n\nAuto-generated by `scripts/update-prices.cjs`.\n\n';
    const existingBody = changelog.replace(header, '');
    fs.writeFileSync(CHANGELOG_PATH, header + entry + existingBody);
    console.log(`✓ Updated ${CHANGELOG_PATH}`);
  } else {
    console.log('\nDry run — use --write to apply changes.');
  }
}

main().catch((e) => {
  console.error('FATAL:', e.message);
  process.exit(1);
});
