export interface ModelPricing {
  id: string
  provider: string
  name: string
  inputPricePer1M: number
  outputPricePer1M: number
  contextWindow: number
  tokenizerType: 'tiktoken' | 'estimate'
  tokenizerModel: string | null
  bestFor?: string
  cachedInputPricePer1M?: number
  sourceUrl: string
  priceUpdatedAt: string
}

export interface PricingData {
  lastUpdated: string
  models: ModelPricing[]
}

export interface ModelCostResult {
  model: ModelPricing
  tokenCount: number
  inputCost: number
  outputCost: number
  totalCostPerCall: number
  monthlyCost: number
  isBestValue: boolean
}

export type SortField = 'name' | 'tokenCount' | 'inputCost' | 'outputCost' | 'totalCostPerCall' | 'monthlyCost'
export type SortDirection = 'asc' | 'desc'
