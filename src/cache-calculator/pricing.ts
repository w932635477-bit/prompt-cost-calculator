// src/cache-calculator/pricing.ts
// Per-vendor pricing data for prompt caching cost calculator.
// IMPORTANT: prices change. Update LAST_UPDATED and source URLs when changing.
//
// Codex review: each vendor has fundamentally different caching semantics.
// Don't fold them into a single formula — give each vendor an isolated calc fn.

export const LAST_UPDATED = '2026-05-26'

export type ModelId =
  | 'claude-sonnet-4-6'
  | 'claude-haiku-4-5'
  | 'gpt-4o'
  | 'gpt-4o-mini'
  | 'deepseek-chat'
  | 'gemini-2-flash'

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
//   no separate write cost; cached read = 0.50x base
//   No user-visible TTL; eviction by LRU within minutes-hours
//
// DeepSeek — automatic context cache, prefix-based
//   cache hit = 0.10x base; cache miss = 1.0x (same as no cache)
//   No write cost shown to user
//
// Google Gemini — explicit context caching API
//   storage cost: $1/M tokens/hour (charged separately, ignored in MVP)
//   read = 0.25x base (estimated; varies by model)

export const MODELS: ModelPricing[] = [
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
    sourceUrl: 'https://docs.anthropic.com/en/docs/build-with-claude/prompt-caching',
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
    sourceUrl: 'https://docs.anthropic.com/en/docs/build-with-claude/prompt-caching',
  },
  {
    id: 'gpt-4o',
    vendor: 'openai',
    label: 'GPT-4o',
    inputPerMillion: 2.50,
    outputPerMillion: 10.00,
    cacheWriteMultiplier: 1.0, // no separate write
    cacheReadMultiplier: 0.50,
    cacheNotes: 'Automatic for prompts >= 1024 tokens. No write cost. Cache eviction is LRU.',
    cacheTtlDescription: 'Auto, minutes-hours (LRU)',
    sourceUrl: 'https://platform.openai.com/docs/guides/prompt-caching',
  },
  {
    id: 'gpt-4o-mini',
    vendor: 'openai',
    label: 'GPT-4o mini',
    inputPerMillion: 0.15,
    outputPerMillion: 0.60,
    cacheWriteMultiplier: 1.0,
    cacheReadMultiplier: 0.50,
    cacheNotes: 'Automatic for prompts >= 1024 tokens. No write cost.',
    cacheTtlDescription: 'Auto, minutes-hours (LRU)',
    sourceUrl: 'https://platform.openai.com/docs/guides/prompt-caching',
  },
  {
    id: 'deepseek-chat',
    vendor: 'deepseek',
    label: 'DeepSeek V3',
    inputPerMillion: 0.27,
    outputPerMillion: 1.10,
    cacheWriteMultiplier: 1.0, // no write cost; miss = full input
    cacheReadMultiplier: 0.10,
    cacheNotes: 'Automatic prefix cache. Cache hit = 10% of input price.',
    cacheTtlDescription: 'Auto (prefix-based)',
    sourceUrl: 'https://api-docs.deepseek.com/news/news0802',
  },
  {
    id: 'gemini-2-flash',
    vendor: 'google',
    label: 'Gemini 2.0 Flash',
    inputPerMillion: 0.10,
    outputPerMillion: 0.40,
    cacheWriteMultiplier: 1.0,
    cacheReadMultiplier: 0.25,
    cacheNotes: 'Explicit context cache. Storage charged separately ($1/M/hr, not included).',
    cacheTtlDescription: 'Configurable (default 1 hr)',
    sourceUrl: 'https://ai.google.dev/gemini-api/docs/caching',
  },
]
