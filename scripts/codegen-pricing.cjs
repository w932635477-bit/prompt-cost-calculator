// scripts/codegen-pricing.cjs
// Generates downstream files from src/data/pricing.json (single source of truth).
// DRY fix: eliminates 3-way manual sync between pricing.json, pricing.ts, SEO data.
//
// Generated files:
//   1. src/cache-calculator/pricing.ts  — cache calculator pricing data
//   2. src/llm-pricing/seo/pricing-seo-data.ts  — SEO description price strings
//
// Usage:
//   node scripts/codegen-pricing.cjs              # dry run
//   node scripts/codegen-pricing.cjs --write      # write files

const fs = require('fs');
const path = require('path');

const PROJECT_ROOT = path.resolve(__dirname, '..');
const PRICING_PATH = path.join(PROJECT_ROOT, 'src/data/pricing.json');
const CACHE_PRICING_PATH = path.join(PROJECT_ROOT, 'src/cache-calculator/pricing.ts');
const SEO_PRICING_PATH = path.join(PROJECT_ROOT, 'src/llm-pricing/seo/pricing-seo-data.ts');

// ── Cache vendor metadata ─────────────────────────────────────────────
// These are NOT in pricing.json because they're code-level cache semantics.

const VENDOR_CACHE_META = {
  anthropic: {
    vendorKey: 'anthropic',
    cacheWriteMultiplier: 1.25,
    cacheReadMultiplier: 0.10,
    cacheNotes: 'Explicit cache_control. Min 1024 tokens. 5-min TTL by default.',
    cacheTtl: '5 min default / 1 hr opt-in',
  },
  anthropic_haiku: {
    vendorKey: 'anthropic',
    cacheWriteMultiplier: 1.25,
    cacheReadMultiplier: 0.10,
    cacheNotes: 'Explicit cache_control. Min 2048 tokens (Haiku).',
    cacheTtl: '5 min default / 1 hr opt-in',
  },
  openai: {
    vendorKey: 'openai',
    cacheWriteMultiplier: 1.0,
    cacheReadMultiplier: 0.10,
    cacheNotes: 'Automatic for prompts >= 1024 tokens. No write cost. Cache eviction is LRU.',
    cacheTtl: 'Auto, minutes-hours (LRU)',
  },
  openai_mini: {
    vendorKey: 'openai',
    cacheWriteMultiplier: 1.0,
    cacheReadMultiplier: 0.10,
    cacheNotes: 'Automatic for prompts >= 1024 tokens. No write cost.',
    cacheTtl: 'Auto, minutes-hours (LRU)',
  },
  deepseek: {
    vendorKey: 'deepseek',
    cacheWriteMultiplier: 1.0,
    cacheReadMultiplier: 0.00833,
    cacheNotes: 'Automatic prefix cache. Cache hit ≈ 0.83% of input price.',
    cacheTtl: 'Auto (prefix-based)',
  },
  deepseek_flash: {
    vendorKey: 'deepseek',
    cacheWriteMultiplier: 1.0,
    cacheReadMultiplier: 0.02,
    cacheNotes: 'Automatic prefix cache. Cache hit = 2% of input price.',
    cacheTtl: 'Auto (prefix-based)',
  },
  google: {
    vendorKey: 'google',
    cacheWriteMultiplier: 1.0,
    cacheReadMultiplier: 0.10,
    cacheNotes: 'Explicit context cache. Storage charged separately ($1/M/hr, not included).',
    cacheTtl: 'Configurable (default 1 hr)',
  },
};

// Models to include in cache calculator + their vendor meta key
const CACHE_MODELS = {
  'claude-opus-4-8': { idOverride: 'claude-opus-4-8', meta: 'anthropic', label: 'Claude Opus 4.8' },
  'claude-sonnet-4-6': { idOverride: 'claude-sonnet-4-6', meta: 'anthropic', label: 'Claude Sonnet 4.6' },
  'claude-haiku-4-5': { idOverride: 'claude-haiku-4-5', meta: 'anthropic_haiku', label: 'Claude Haiku 4.5' },
  'gpt-5.5': { idOverride: 'gpt-5-5', meta: 'openai', label: 'GPT-5.5' },
  'gpt-5.4': { idOverride: 'gpt-5-4', meta: 'openai', label: 'GPT-5.4' },
  'gpt-5.4-mini': { idOverride: 'gpt-5-4-mini', meta: 'openai_mini', label: 'GPT-5.4 mini' },
  'deepseek-v4-pro': { idOverride: 'deepseek-v4-pro', meta: 'deepseek', label: 'DeepSeek V4 Pro' },
  'deepseek-v4-flash': { idOverride: 'deepseek-v4-flash', meta: 'deepseek_flash', label: 'DeepSeek V4 Flash' },
  'gemini-3-5-flash': { idOverride: 'gemini-3-5-flash', meta: 'google', label: 'Gemini 3.5 Flash' },
  'gemini-2-5-flash': { idOverride: 'gemini-2-5-flash', meta: 'google', label: 'Gemini 2.5 Flash' },
  'gemini-2-5-flash-lite': { idOverride: 'gemini-2-5-flash-lite', meta: 'google', label: 'Gemini 2.5 Flash-Lite' },
};

// ── SEO slug generation ───────────────────────────────────────────────

const SEO_SLUG_MAP = {
  'gpt-5.5': 'gpt-5-5-pricing',
  'gpt-5.4': 'gpt-5-4-pricing',
  'gpt-5.4-mini': 'gpt-5-4-mini-pricing',
  'gpt-4o': 'gpt-4o-pricing',
  'gpt-4o-mini': 'gpt-4o-mini-pricing',
  'o3': 'o3-pricing',
  'o4-mini': 'o4-mini-pricing',
  'claude-3-7-sonnet-20250219': 'claude-3-7-sonnet-pricing',
  'claude-3-5-haiku-20241022': 'claude-3-5-haiku-pricing',
  'claude-3-opus-20240229': 'claude-3-opus-pricing',
  'claude-3-haiku-20240307': 'claude-3-haiku-pricing',
  'gemini-2.0-flash': 'gemini-2-0-flash-pricing',
  'gemini-2.0-flash-lite': 'gemini-2-0-flash-lite-pricing',
  'gemini-1.5-pro': 'gemini-1-5-pro-pricing',
  'gemini-1.5-flash': 'gemini-1-5-flash-pricing',
  'deepseek-v4-flash': 'deepseek-v4-flash-pricing',
  'deepseek-v4-pro': 'deepseek-v4-pro-pricing',
  'llama-4-maverick': 'llama-4-maverick-pricing',
};

const SEO_KEYWORDS = {
  'gpt-5.5': ['gpt-5.5 pricing', 'gpt-5.5 cost', 'gpt-5.5 api price', 'gpt-5.5 per million tokens', 'gpt-5.5 vs gpt-5.4 pricing', 'gpt-5.5 api cost comparison'],
  'gpt-5.4': ['gpt-5.4 pricing', 'gpt-5.4 cost', 'gpt-5.4 api price', 'gpt-5.4 per million tokens', 'gpt-5.4 vs gpt-5.5 cost', 'gpt-5.4 token price'],
  'gpt-5.4-mini': ['gpt-5.4 mini pricing', 'gpt-5.4 mini cost', 'gpt-5.4 mini api price', 'gpt-5.4 mini cheapest', 'gpt-5.4 mini vs gpt-4o-mini'],
  'gpt-4o': ['gpt-4o pricing', 'gpt-4o cost', 'gpt-4o api price', 'gpt-4o per million tokens', 'gpt-4o vs gpt-4o-mini', 'gpt-4o token cost'],
  'gpt-4o-mini': ['gpt-4o mini pricing', 'gpt-4o mini cost', 'gpt-4o mini api price', 'gpt-4o mini cheapest openai', 'gpt-4o mini vs deepseek cost'],
  'o3': ['o3 pricing', 'openai o3 cost', 'o3 api price', 'openai reasoning model pricing', 'o3 vs o4-mini cost', 'openai o3 token price'],
  'o4-mini': ['o4-mini pricing', 'openai o4-mini cost', 'o4-mini api price', 'o4-mini reasoning pricing', 'o4-mini vs o3', 'o4-mini token cost'],
  'claude-3-7-sonnet-20250219': ['claude 3.7 sonnet pricing', 'claude 3.7 sonnet cost', 'anthropic claude pricing', 'claude sonnet api price', 'claude vs gpt pricing 2026'],
  'claude-3-5-haiku-20241022': ['claude 3.5 haiku pricing', 'claude haiku cost', 'claude cheap model pricing', 'claude 3.5 haiku api price', 'cheapest claude api'],
  'claude-3-opus-20240229': ['claude 3 opus pricing', 'claude opus cost', 'claude expensive model pricing', 'claude opus api price', 'claude opus per million tokens'],
  'claude-3-haiku-20240307': ['claude 3 haiku pricing', 'claude haiku cost', 'claude cheapest model', 'claude haiku api price', 'claude haiku per token'],
  'gemini-2.0-flash': [
    'gemini 2.0 flash pricing', 'gemini 2.0 flash price', 'gemini 2.0 flash api price',
    'gemini 2 flash pricing', 'gemini flash cost', 'google gemini 2.0 pricing',
    'gemini 2.0 flash api cost', 'gemini 2.0 flash cheapest', 'gemini flash 2.0 price',
    'google gemini flash api pricing',
  ],
  'gemini-2.0-flash-lite': ['gemini flash lite pricing', 'gemini 2.0 flash lite cost', 'google ai pricing', 'gemini flash lite api', 'cheapest google llm'],
  'gemini-1.5-pro': ['gemini 1.5 pro pricing', 'gemini pro cost', 'google gemini 1.5 pricing', 'gemini 1.5 pro api price', 'gemini pro vs flash', 'gemini pro 2m context pricing', 'google gemini pro api cost', 'gemini 1.5 pro per million tokens'],
  'gemini-1.5-flash': ['gemini 1.5 flash pricing', 'gemini flash cost', 'google gemini flash pricing', 'gemini 1.5 flash api', 'gemini flash api cost', 'gemini 1.5 flash per million tokens'],
  'deepseek-v4-flash': [
    'deepseek v4 flash pricing', 'deepseek pricing', 'deepseek cost per token',
    'deepseek flash api cost', 'cheapest llm api 2026', 'deepseek flash cheapest model',
    'deepseek v4 flash vs gpt pricing', 'deepseek flash token price',
    'deepseek api pricing 2026', 'deepseek v4 flash per million tokens',
  ],
  'deepseek-v4-pro': ['deepseek v4 pro pricing', 'deepseek pro cost', 'deepseek api pricing', 'deepseek v4 pro vs flash', 'deepseek pro api price', 'deepseek pro per million tokens'],
  'llama-4-maverick': ['llama 4 maverick pricing', 'groq pricing', 'groq api cost', 'llama 4 groq pricing', 'llama 4 maverick api price', 'groq llama cost'],
};

// Per-model SEO overrides for richer titles and descriptions.
// Use these when the auto-generated formula doesn't capture the model's
// unique selling point well enough. Keyed by pricing.json model id.
const SEO_OVERRIDES = {
  'deepseek-v4-flash': {
    title: 'DeepSeek V4 Flash Pricing (2026) — Cheapest LLM API at $0.14/1M Input',
    description: 'DeepSeek V4 Flash costs $0.14/1M input and $0.28/1M output — one of the cheapest LLM APIs in 2026. Cached input is just $0.0197/1M (86% discount). Full pricing breakdown, cost calculator, and comparison vs GPT-4o, Claude, and Gemini.',
  },
  'deepseek-v4-pro': {
    title: 'DeepSeek V4 Pro Pricing (2026) — $0.435/1M Input, Premium Reasoning',
    description: 'DeepSeek V4 Pro costs $0.435/1M input and $0.87/1M output with 1M context window. Compare DeepSeek V4 Pro vs Flash pricing, use the cost calculator, and see how it stacks up against GPT-5.5 and Claude.',
  },
  'gemini-1.5-pro': {
    title: 'Gemini 1.5 Pro Pricing (2026) — 2M Context Window at $1.25/1M Input',
    description: 'Gemini 1.5 Pro costs $1.25/1M input and $5/1M output with a 2 million token context window. Cached input is $0.125/1M (90% discount). Best for complex multimodal tasks, long document analysis, and code generation. Compare vs Gemini 1.5 Flash, GPT-4o, and Claude pricing with our cost calculator.',
  },
  'gemini-2.0-flash': {
    title: 'Gemini 2.0 Flash Pricing (2026) — $0.10/1M Input, Google Fastest API',
    description: 'Gemini 2.0 Flash costs $0.10/1M input and $0.40/1M output with a 1 million token context window. Cached input is $0.025/1M (75% discount). The latest Google Flash model with production-grade rate limits. Compare vs Gemini 1.5 Flash, GPT-4o, Claude, and DeepSeek pricing with our cost calculator.',
  },
};

// ── Formatters ────────────────────────────────────────────────────────

function fmt(n) {
  return n.toFixed(2).replace(/\.?0+$/, '') || '0';
}

function fmtPrice(n) {
  if (n === undefined || n === null) return 'N/A';
  const s = n.toFixed(4).replace(/0+$/, '').replace(/\.$/, '');
  return '$' + s;
}

function titleCase(name) {
  return name.replace(/\b\w/g, c => c.toUpperCase());
}

// ── Generate cache-calculator/pricing.ts ───────────────────────────────

function generateCachePricing(models) {
  const today = new Date().toISOString().slice(0, 10);
  const typeIds = [];
  const modelEntries = [];

  for (const [pricingId, config] of Object.entries(CACHE_MODELS)) {
    const model = models.find(m => m.id === pricingId);
    if (!model) {
      console.warn(`  WARN: ${pricingId} not found in pricing.json, skipping`);
      continue;
    }

    const meta = VENDOR_CACHE_META[config.meta];
    typeIds.push(`  | '${config.idOverride}'`);
    modelEntries.push(`  {
    id: '${config.idOverride}',
    vendor: '${meta.vendorKey}',
    label: '${config.label}',
    inputPerMillion: ${model.inputPricePer1M},
    outputPerMillion: ${model.outputPricePer1M},
    cacheWriteMultiplier: ${meta.cacheWriteMultiplier},
    cacheReadMultiplier: ${meta.cacheReadMultiplier},
    cacheNotes: '${meta.cacheNotes}',
    cacheTtlDescription: '${meta.cacheTtl}',
    sourceUrl: '${model.sourceUrl}',
  }`);
  }

  return `// src/cache-calculator/pricing.ts
// ⚠️ AUTO-GENERATED by scripts/codegen-pricing.cjs — DO NOT EDIT MANUALLY.
// Source of truth: src/data/pricing.json. Run \`node scripts/codegen-pricing.cjs --write\` to regenerate.
//
// Per-vendor pricing data for prompt caching cost calculator.
// Each vendor has fundamentally different caching semantics — do not fold into a single formula.

export const LAST_UPDATED = '${today}'

export type ModelId =
${typeIds.join('\n')}

export interface ModelPricing {
  id: ModelId
  vendor: 'anthropic' | 'openai' | 'deepseek' | 'google'
  label: string
  inputPerMillion: number   // USD per 1M input tokens (no cache)
  outputPerMillion: number  // USD per 1M output tokens
  cacheWriteMultiplier: number   // input * this = cache write cost
  cacheReadMultiplier: number    // input * this = cache read cost
  cacheNotes: string             // shown to user under model select
  cacheTtlDescription: string
  sourceUrl: string
}

// Anthropic Claude — explicit cache_control breakpoint, 5min default / 1hr opt-in
// OpenAI — automatic prompt caching for prompts >=1024 tokens, LRU eviction
// DeepSeek V4 — automatic context cache, prefix-based
// Google Gemini — explicit context caching API, storage charged separately

export const MODELS: ModelPricing[] = [
${modelEntries.join(',\n\n')},
]
`;
}

// ── Generate SEO pricing data ─────────────────────────────────────────

function generateSeoPricing(models) {
  const seoPages = [];

  for (const model of models) {
    const slug = SEO_SLUG_MAP[model.id];
    if (!slug) continue; // model has no SEO page

    const override = SEO_OVERRIDES[model.id] || {};
    const keywords = SEO_KEYWORDS[model.id] || [];
    const cachePrice = model.cachedInputPricePer1M;
    const name = model.name;
    const h1Name = `${name} API Pricing`;
    const title = override.title || `${name} API Pricing (2026) — Cost Per 1M Tokens`;

    let description;
    if (override.description) {
      description = override.description;
    } else {
      const descParts = [
        `${name} pricing:`,
        `${fmtPrice(model.inputPricePer1M)}/1M input tokens,`,
        `${fmtPrice(model.outputPricePer1M)}/1M output tokens,`,
      ];
      if (cachePrice !== undefined) {
        descParts.push(`${fmtPrice(cachePrice)}/1M cached tokens.`);
      } else {
        descParts.push('no cached token discount.');
      }

      const suffixParts = [];
      if (model.provider === 'OpenAI') suffixParts.push(model.id.includes('mini') ? 'Budget-friendly' : 'Compare costs for your workload');
      if (model.provider === 'Anthropic') suffixParts.push(model.id.includes('haiku') ? 'Cheapest Claude' : 'Anthropic model cost analysis');
      if (model.provider === 'Google') suffixParts.push('Google model cost breakdown');
      if (model.provider === 'DeepSeek') suffixParts.push(model.id.includes('flash') ? 'One of the cheapest LLM APIs' : 'Premium DeepSeek model');
      if (model.provider === 'Groq') suffixParts.push('Fastest inference with no cached token discount');

      const suffix = suffixParts[0] ? ` ${suffixParts[0]}.` : '';
      description = descParts.join(' ') + suffix;
    }

    seoPages.push(`  {
    slug: '${slug}',
    modelId: '${model.id}',
    title: '${title}',
    h1: '${h1Name}',
    description: '${description}',
    keywords: ${JSON.stringify(keywords)},
  }`);
  }

  return `// src/llm-pricing/seo/pricing-seo-data.ts
// ⚠️ AUTO-GENERATED by scripts/codegen-pricing.cjs — DO NOT EDIT MANUALLY.
// Source of truth: src/data/pricing.json. Run \`node scripts/codegen-pricing.cjs --write\` to regenerate.
//
// Long-tail SEO pages for individual model pricing lookups.

export interface PricingSeoPage {
  slug: string
  modelId: string
  title: string
  h1: string
  description: string
  keywords: string[]
}

export const PRICING_SEO_PAGES: PricingSeoPage[] = [
${seoPages.join(',\n')},
]
`;
}

// ── Main ──────────────────────────────────────────────────────────────

function main() {
  const shouldWrite = process.argv.includes('--write');
  console.log(shouldWrite ? 'MODE: WRITE' : 'MODE: DRY RUN');

  const pricing = JSON.parse(fs.readFileSync(PRICING_PATH, 'utf8'));
  const models = pricing.models;
  console.log(`Loaded ${models.length} models from pricing.json`);

  // Generate files
  const cacheTs = generateCachePricing(models);
  const seoTs = generateSeoPricing(models);

  if (shouldWrite) {
    fs.writeFileSync(CACHE_PRICING_PATH, cacheTs);
    console.log(`✓ Generated ${CACHE_PRICING_PATH}`);

    fs.writeFileSync(SEO_PRICING_PATH, seoTs);
    console.log(`✓ Generated ${SEO_PRICING_PATH}`);
  } else {
    console.log('\n--- cache-calculator/pricing.ts (preview, first 20 lines) ---');
    console.log(cacheTs.split('\n').slice(0, 20).join('\n'));
    console.log('\n--- seo/pricing-seo-data.ts (preview, first 15 lines) ---');
    console.log(seoTs.split('\n').slice(0, 15).join('\n'));
    console.log('\nDry run — use --write to generate files.');
  }
}

main();
