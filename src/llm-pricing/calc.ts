// src/llm-pricing/calc.ts
// Monthly cost projection for LLM pricing comparison.

import type { ModelPricing } from '../lib/types'

const PER_M = 1_000_000

export interface CostParams {
  inputTokens: number
  outputTokens: number
  callsPerDay: number
  cacheHitRate: number
  daysPerMonth: number
}

export interface CostResult {
  totalCostPerCall: number
  monthlyCost: number
  cacheSavings: number
  inputCostPerCall: number
  outputCostPerCall: number
}

/** Calculate cost for a single model given usage params. */
export function projectMonthlyCost(model: ModelPricing, params: CostParams): CostResult {
  const { inputTokens, outputTokens, callsPerDay, cacheHitRate, daysPerMonth } = params
  const callsPerMonth = callsPerDay * daysPerMonth

  const inputCostPerCall = (inputTokens * model.inputPricePer1M) / PER_M
  const outputCostPerCall = (outputTokens * model.outputPricePer1M) / PER_M

  const cachedPrice = model.cachedInputPricePer1M ?? model.inputPricePer1M
  const cachedInputCostPerCall = (inputTokens * cacheHitRate * cachedPrice) / PER_M
  const uncachedInputCostPerCall = (inputTokens * (1 - cacheHitRate) * model.inputPricePer1M) / PER_M

  const baseInputPerCall = inputCostPerCall
  const actualInputPerCall = cachedInputCostPerCall + uncachedInputCostPerCall
  const savingsPerCall = baseInputPerCall - actualInputPerCall

  const totalCostPerCall = actualInputPerCall + outputCostPerCall
  const monthlyCost = totalCostPerCall * callsPerMonth
  const cacheSavings = savingsPerCall * callsPerMonth

  return { totalCostPerCall, monthlyCost, cacheSavings, inputCostPerCall, outputCostPerCall }
}

export function formatCost(n: number): string {
  if (n < 0.01) return `$${n.toFixed(4)}`
  if (n < 1) return `$${n.toFixed(3)}`
  if (n < 100) return `$${n.toFixed(2)}`
  return `$${n.toLocaleString('en-US', { maximumFractionDigits: 0 })}`
}
