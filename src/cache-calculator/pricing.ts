// src/cache-calculator/pricing.ts
// Per-vendor pricing data for prompt caching cost calculator.
// IMPORTANT: prices change. Update LAST_UPDATED and source URLs when changing.
//
// Codex review: each vendor has fundamentally different caching semantics.
// Don't fold them into a single formula — give each vendor an isolated calc fn.
//
// 2026-06-01: major model refresh — GPT-5.x, Claude 4.x, DeepSeek V4, Gemini 3.x

export const LAST_UPDATED = '2026-06-01'

export type ModelId =
  // Anthropic (3 tiers)
  | 'claude-opus-4-8'
  | 'claude-sonnet-4-6'
  | 'claude-haiku-4-5'
  // OpenAI (3 tiers)
  | 'gpt-5-5'
  | 'gpt-5-4'
  | 'gpt-5-4-mini'
  // DeepSeek (2 tiers)
  | 'deepseek-v4-pro'
  | 'deepseek-v4-flash'
  // Google (3 tiers)
  | 'gemini-3-5-flash'
  | 'gemini-2-5-flash'
  | 'gemini-2-5-flash-lite'

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
//   write = 1.25x base input price (5min) or 2.0x (1hr)
//   read  = 0.10x base input price
//   Min cache size: 1024 tokens (Sonnet/Opus), 2048 (Haiku)
//
// OpenAI — automatic prompt caching for prompts >=1024 tokens
//   no separate write cost; cached read = 0.10x base (GPT-5.x)
//   No user-visible TTL; eviction by LRU within minutes-hours
//
// DeepSeek V4 — automatic context cache, prefix-based
//   cache hit ≈ 0.02x base; cache miss = 1.0x (same as no cache)
//   No write cost shown to user
//
// Google Gemini — explicit context caching API
//   storage cost: $1/M tokens/hour (charged separately, ignored in MVP)
//   read = 0.10x base

export const MODELS: ModelPricing[] = [
  // ── Anthropic (Claude 4.x) ──────────────────────────────────────
  {
    id: 'claude-opus-4-8',
    vendor: 'anthropic',
    label: 'Claude Opus 4.8',
    inputPerMillion: 5.0,
    outputPerMillion: 25.0,
    cacheWriteMultiplier: 1.25,
    cacheReadMultiplier: 0.10,
    cacheNotes: 'Explicit cache_control. Min 1024 tokens. 5-min TTL by default.',
    cacheTtlDescription: '5 min default / 1 hr opt-in',
    sourceUrl: 'https://platform.claude.com/docs/en/about-claude/pricing',
  },
  {
    id: 'claude-sonnet-4-6',
    vendor: 'anthropic',
    label: 'Claude Sonnet 4.6',
    inputPerMillion: 3.0,
    outputPerMillion: 15.0,
    cacheWriteMultiplier: 1.25,
    cacheReadMultiplier: 0.10,
    cacheNotes: 'Explicit cache_control. Min 1024 tokens. 5-min TTL by default.',
    cacheTtlDescription: '5 min default / 1 hr opt-in',
    sourceUrl: 'https://platform.claude.com/docs/en/about-claude/pricing',
  },
  {
    id: 'claude-haiku-4-5',
    vendor: 'anthropic',
    label: 'Claude Haiku 4.5',
    inputPerMillion: 1.0,
    outputPerMillion: 5.0,
    cacheWriteMultiplier: 1.25,
    cacheReadMultiplier: 0.10,
    cacheNotes: 'Explicit cache_control. Min 2048 tokens (Haiku).',
    cacheTtlDescription: '5 min default / 1 hr opt-in',
    sourceUrl: 'https://platform.claude.com/docs/en/about-claude/pricing',
  },

  // ── OpenAI (GPT-5.x) ───────────────────────────────────────────
  {
    id: 'gpt-5-5',
    vendor: 'openai',
    label: 'GPT-5.5',
    inputPerMillion: 5.0,
    outputPerMillion: 30.0,
    cacheWriteMultiplier: 1.0, // no separate write
    cacheReadMultiplier: 0.10,
    cacheNotes: 'Automatic for prompts >= 1024 tokens. No write cost. Cache eviction is LRU.',
    cacheTtlDescription: 'Auto, minutes-hours (LRU)',
    sourceUrl: 'https://openai.com/api/pricing/',
  },
  {
    id: 'gpt-5-4',
    vendor: 'openai',
    label: 'GPT-5.4',
    inputPerMillion: 2.50,
    outputPerMillion: 15.0,
    cacheWriteMultiplier: 1.0,
    cacheReadMultiplier: 0.10,
    cacheNotes: 'Automatic for prompts >= 1024 tokens. No write cost. Cache eviction is LRU.',
    cacheTtlDescription: 'Auto, minutes-hours (LRU)',
    sourceUrl: 'https://openai.com/api/pricing/',
  },
  {
    id: 'gpt-5-4-mini',
    vendor: 'openai',
    label: 'GPT-5.4 mini',
    inputPerMillion: 0.75,
    outputPerMillion: 4.50,
    cacheWriteMultiplier: 1.0,
    cacheReadMultiplier: 0.10,
    cacheNotes: 'Automatic for prompts >= 1024 tokens. No write cost.',
    cacheTtlDescription: 'Auto, minutes-hours (LRU)',
    sourceUrl: 'https://openai.com/api/pricing/',
  },

  // ── DeepSeek (V4) ───────────────────────────────────────────────
  {
    id: 'deepseek-v4-pro',
    vendor: 'deepseek',
    label: 'DeepSeek V4 Pro',
    inputPerMillion: 0.435,
    outputPerMillion: 0.87,
    cacheWriteMultiplier: 1.0, // no write cost; miss = full input
    cacheReadMultiplier: 0.00833,
    cacheNotes: 'Automatic prefix cache. Cache hit ≈ 0.83% of input price.',
    cacheTtlDescription: 'Auto (prefix-based)',
    sourceUrl: 'https://api-docs.deepseek.com/quick_start/pricing',
  },
  {
    id: 'deepseek-v4-flash',
    vendor: 'deepseek',
    label: 'DeepSeek V4 Flash',
    inputPerMillion: 0.14,
    outputPerMillion: 0.28,
    cacheWriteMultiplier: 1.0,
    cacheReadMultiplier: 0.02,
    cacheNotes: 'Automatic prefix cache. Cache hit = 2% of input price.',
    cacheTtlDescription: 'Auto (prefix-based)',
    sourceUrl: 'https://api-docs.deepseek.com/quick_start/pricing',
  },

  // ── Google (Gemini) ─────────────────────────────────────────────
  {
    id: 'gemini-3-5-flash',
    vendor: 'google',
    label: 'Gemini 3.5 Flash',
    inputPerMillion: 1.50,
    outputPerMillion: 9.0,
    cacheWriteMultiplier: 1.0,
    cacheReadMultiplier: 0.10,
    cacheNotes: 'Explicit context cache. Storage charged separately ($1/M/hr, not included).',
    cacheTtlDescription: 'Configurable (default 1 hr)',
    sourceUrl: 'https://ai.google.dev/gemini-api/docs/pricing',
  },
  {
    id: 'gemini-2-5-flash',
    vendor: 'google',
    label: 'Gemini 2.5 Flash',
    inputPerMillion: 0.30,
    outputPerMillion: 2.50,
    cacheWriteMultiplier: 1.0,
    cacheReadMultiplier: 0.10,
    cacheNotes: 'Explicit context cache. Storage charged separately ($1/M/hr, not included).',
    cacheTtlDescription: 'Configurable (default 1 hr)',
    sourceUrl: 'https://ai.google.dev/gemini-api/docs/pricing',
  },
  {
    id: 'gemini-2-5-flash-lite',
    vendor: 'google',
    label: 'Gemini 2.5 Flash-Lite',
    inputPerMillion: 0.10,
    outputPerMillion: 0.40,
    cacheWriteMultiplier: 1.0,
    cacheReadMultiplier: 0.10,
    cacheNotes: 'Explicit context cache. Storage charged separately ($1/M/hr, not included).',
    cacheTtlDescription: 'Configurable (default 1 hr)',
    sourceUrl: 'https://ai.google.dev/gemini-api/docs/pricing',
  },
]
