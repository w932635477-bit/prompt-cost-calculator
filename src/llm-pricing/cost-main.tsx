// src/llm-pricing/cost-main.tsx
// Entry point for LLM cost deep pages. Reads page type from #seo-data.

import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import '../index.css'
import type { CostSeoPage } from './seo/cost-seo-data'
import LlmCostCalculatorPage from './LlmCostCalculatorPage'
import LlmCostComparisonPage from './LlmCostComparisonPage'
import LlmCostOptimizationPage from './LlmCostOptimizationPage'

const el = document.getElementById('seo-data')
const pageData: CostSeoPage | null = el ? JSON.parse(el.textContent || '{}') : null

const COMPONENT_MAP: Record<string, React.ComponentType> = {
  calculator: LlmCostCalculatorPage,
  comparison: LlmCostComparisonPage,
  optimization: LlmCostOptimizationPage,
}

const Component = pageData ? COMPONENT_MAP[pageData.pageType] : null

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    {Component ? <Component /> : <div className="p-8 text-center">Page not found</div>}
  </StrictMode>
)
