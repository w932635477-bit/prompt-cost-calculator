// src/cache-calculator/calc.ts
// Per-vendor cost calculation. Each vendor has independent semantics — no shared formula.

import { MODELS } from './pricing'
import type { ModelPricing } from './pricing'

export interface Inputs {
  baseTokens: number      // tokens in cacheable prefix (system prompt + long context)
  variableTokens: number  // tokens in the variable suffix per call
  outputTokens: number    // expected output tokens per call
  callsPerMonth: number
  modelId: ModelPricing['id']
}

export interface CostBreakdown {
  noCacheTotal: number
  cacheTotal: number
  saved: number
  savedPct: number
  breakEvenCalls: number   // # calls before caching pays off (write cost / per-call savings)
  perCallNoCache: number
  perCallCache: number
  detail: {
    noCacheInput: number
    noCacheOutput: number
    cacheWriteOnce: number
    cacheReadPerCall: number
    cacheVariablePerCall: number
    cacheOutputPerCall: number
  }
}

const PER_M = 1_000_000

export function compute(inputs: Inputs): CostBreakdown {
  const m = MODELS.find(x => x.id === inputs.modelId)
  if (!m) throw new Error(`Unknown model: ${inputs.modelId}`)

  const { baseTokens, variableTokens, outputTokens, callsPerMonth } = inputs
  const totalInputPerCall = baseTokens + variableTokens

  // Without caching: every call charges full input
  const noCacheInputCost = (totalInputPerCall * m.inputPerMillion) / PER_M
  const noCacheOutputCost = (outputTokens * m.outputPerMillion) / PER_M
  const perCallNoCache = noCacheInputCost + noCacheOutputCost
  const noCacheTotal = perCallNoCache * callsPerMonth

  // With caching:
  //   Anthropic / Gemini: explicit. baseTokens written once at write rate (per cache lifetime)
  //   OpenAI / DeepSeek: automatic, no separate write cost (multiplier = 1.0)
  // For MVP we assume cache stays warm across the month (1 write event amortized).
  // This is the simplest credible model — UI clearly labels it.

  const cacheWriteOnce = (baseTokens * m.inputPerMillion * m.cacheWriteMultiplier) / PER_M
  const cacheReadPerCall = (baseTokens * m.inputPerMillion * m.cacheReadMultiplier) / PER_M
  const cacheVariablePerCall = (variableTokens * m.inputPerMillion) / PER_M
  const cacheOutputPerCall = (outputTokens * m.outputPerMillion) / PER_M
  const perCallCache = cacheReadPerCall + cacheVariablePerCall + cacheOutputPerCall

  // For OpenAI/DeepSeek, the cache write cost equals base input (multiplier 1.0),
  // so we don't add a separate "first call premium" — it's already in perCallNoCache logic
  // when the first call is also a cache miss. Keep cacheWriteOnce only for vendors with
  // explicit write multiplier > 1.0 (Anthropic).
  const writeAddedCost = m.cacheWriteMultiplier > 1.0 ? cacheWriteOnce : 0

  const cacheTotal = writeAddedCost + perCallCache * callsPerMonth
  const saved = noCacheTotal - cacheTotal
  const savedPct = noCacheTotal > 0 ? (saved / noCacheTotal) * 100 : 0

  // Break-even: how many calls until amortized write cost is paid off by per-call savings
  const perCallSavings = perCallNoCache - perCallCache
  const breakEvenCalls =
    perCallSavings > 0 && writeAddedCost > 0
      ? Math.ceil(writeAddedCost / perCallSavings)
      : writeAddedCost === 0 && perCallSavings > 0
        ? 1
        : Infinity

  return {
    noCacheTotal,
    cacheTotal,
    saved,
    savedPct,
    breakEvenCalls,
    perCallNoCache,
    perCallCache,
    detail: {
      noCacheInput: noCacheInputCost * callsPerMonth,
      noCacheOutput: noCacheOutputCost * callsPerMonth,
      cacheWriteOnce: writeAddedCost,
      cacheReadPerCall,
      cacheVariablePerCall,
      cacheOutputPerCall,
    },
  }
}

// Cheapest-vendor recommendation: compute all 6 models, sort by cacheTotal asc
export interface Recommendation {
  modelId: ModelPricing['id']
  label: string
  cacheTotal: number
  noCacheTotal: number
  saved: number
}

export function rankAll(input: Omit<Inputs, 'modelId'>): Recommendation[] {
  return MODELS.map(m => {
    const r = compute({ ...input, modelId: m.id })
    return {
      modelId: m.id,
      label: m.label,
      cacheTotal: r.cacheTotal,
      noCacheTotal: r.noCacheTotal,
      saved: r.saved,
    }
  }).sort((a, b) => a.cacheTotal - b.cacheTotal)
}

// chars/4 heuristic — clearly labeled as estimate in UI
export function estimateTokens(chars: number): number {
  return Math.ceil(chars / 4)
}
