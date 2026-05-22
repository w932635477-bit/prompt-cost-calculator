import type { ModelPricing, ModelCostResult } from './types'
import { countTokens } from './tokenizer'

export async function calculateCosts(
  prompt: string,
  expectedOutputTokens: number,
  callsPerMonth: number,
  models: ModelPricing[]
): Promise<ModelCostResult[]> {
  if (!prompt.trim()) return []

  const results = await Promise.all(models.map(async (model) => {
    const inputTokens = await countTokens(prompt, model.id)
    const totalTokens = inputTokens + expectedOutputTokens

    const inputCost = (inputTokens / 1_000_000) * model.inputPricePer1M
    const outputCost = (expectedOutputTokens / 1_000_000) * model.outputPricePer1M
    const totalCostPerCall = inputCost + outputCost
    const monthlyCost = totalCostPerCall * callsPerMonth

    return {
      model,
      tokenCount: totalTokens,
      inputCost,
      outputCost,
      totalCostPerCall,
      monthlyCost,
      isBestValue: false,
    }
  }))

  if (results.length > 0) {
    const cheapest = results.reduce((a, b) =>
      a.totalCostPerCall < b.totalCostPerCall ? a : b
    )
    cheapest.isBestValue = true
  }

  return results
}

export function formatCost(cost: number): string {
  if (cost === 0) return '$0.00'
  if (cost < 0.001) return `$${cost.toFixed(6)}`
  if (cost < 0.01) return `$${cost.toFixed(4)}`
  if (cost < 1) return `$${cost.toFixed(3)}`
  if (cost < 1000) return `$${cost.toFixed(2)}`
  return `$${cost.toLocaleString('en-US', { maximumFractionDigits: 0 })}`
}

export function calculateSavings(
  current: ModelCostResult,
  cheapest: ModelCostResult
): number {
  if (current.totalCostPerCall === 0) return 0
  return Math.round(
    ((current.totalCostPerCall - cheapest.totalCostPerCall) /
      current.totalCostPerCall) *
      100
  )
}
