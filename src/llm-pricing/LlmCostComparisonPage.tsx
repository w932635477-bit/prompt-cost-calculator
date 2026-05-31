// src/llm-pricing/LlmCostComparisonPage.tsx
// SEO deep page: cross-provider cost comparison with tables and charts.

import { useMemo } from 'react'
import pricing from '../data/pricing.json'
import type { ModelPricing } from '../lib/types'
import { GlobalNav } from '../components/GlobalNav'
import { projectMonthlyCost, formatCost } from './calc'
import type { CostParams } from './calc'

const ALL_MODELS = pricing.models as ModelPricing[]

const SCENARIO: CostParams = {
  inputTokens: 10_000,
  outputTokens: 2_000,
  callsPerDay: 1_000,
  cacheHitRate: 0.5,
  daysPerMonth: 30,
}

const PROVIDERS = ['OpenAI', 'Anthropic', 'Google', 'DeepSeek', 'Groq'] as const
const PROVIDER_COLORS: Record<string, string> = {
  OpenAI: '#10a37f',
  Anthropic: '#d97706',
  Google: '#4285f4',
  DeepSeek: '#6366f1',
  Groq: '#f55036',
}

export default function LlmCostComparisonPage() {
  const byProvider = useMemo(() => {
    const map = new Map<string, ModelPricing[]>()
    for (const m of ALL_MODELS) {
      const list = map.get(m.provider) || []
      list.push(m)
      map.set(m.provider, list)
    }
    return map
  }, [])

  const scenarioResults = useMemo(
    () => ALL_MODELS
      .map(m => ({ model: m, cost: projectMonthlyCost(m, SCENARIO) }))
      .sort((a, b) => a.cost.monthlyCost - b.cost.monthlyCost),
    []
  )

  const maxCost = useMemo(
    () => Math.max(...scenarioResults.map(r => r.cost.monthlyCost), 0.01),
    []
  )

  const cheapest = scenarioResults[0]
  const mostExpensive = scenarioResults[scenarioResults.length - 1]

  return (
    <div className="min-h-screen bg-[#f5f5f7] text-[#1d1d1f]">
      <GlobalNav current="/llm-pricing/" />

      <header className="max-w-[980px] mx-auto px-4 pt-12 pb-6">
        <a href="/llm-pricing/" className="text-[#0071e3] text-sm hover:underline">← All Models</a>
        <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight mt-4">LLM Cost Comparison</h1>
        <p className="text-lg text-[#86868b] mt-2">Side-by-side pricing for 19 models across 5 providers.</p>
      </header>

      <main className="max-w-[980px] mx-auto px-4 pb-16 space-y-8">
        {/* Key insight */}
        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <h2 className="text-xl font-semibold mb-4">Key Takeaway</h2>
          <div className="grid sm:grid-cols-3 gap-4">
            <Stat label="Cheapest model" value={cheapest.model.name} sub={formatCost(cheapest.cost.monthlyCost) + '/mo'} color="#10a37f" />
            <Stat label="Most expensive" value={mostExpensive.model.name} sub={formatCost(mostExpensive.cost.monthlyCost) + '/mo'} color="#ef4444" />
            <Stat label="Price ratio" value={`${(mostExpensive.cost.monthlyCost / cheapest.cost.monthlyCost).toFixed(0)}x`} sub="most expensive vs cheapest" color="#0071e3" />
          </div>
          <p className="text-xs text-[#86868b] mt-4">
            Based on {SCENARIO.inputTokens.toLocaleString()} input + {SCENARIO.outputTokens.toLocaleString()} output tokens, {SCENARIO.callsPerDay.toLocaleString()} calls/day, {Math.round(SCENARIO.cacheHitRate * 100)}% cache hit rate.
          </p>
        </div>

        {/* Visual comparison */}
        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <h2 className="text-xl font-semibold mb-4">Monthly Cost Ranking</h2>
          <div className="space-y-2">
            {scenarioResults.map((r) => (
              <div key={r.model.id} className="flex items-center gap-3 p-2 rounded-lg bg-[#f5f5f7]">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: PROVIDER_COLORS[r.model.provider] || '#86868b' }} />
                    <span className="text-sm font-medium truncate">{r.model.name}</span>
                    <span className="text-[10px] text-[#86868b] shrink-0">{r.model.provider}</span>
                  </div>
                  <div className="mt-1 h-2 bg-[#e8e8ed] rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all"
                      style={{
                        width: `${Math.max((r.cost.monthlyCost / maxCost) * 100, 2)}%`,
                        backgroundColor: PROVIDER_COLORS[r.model.provider] || '#0071e3',
                      }}
                    />
                  </div>
                </div>
                <span className="text-sm font-mono font-medium shrink-0">{formatCost(r.cost.monthlyCost)}/mo</span>
              </div>
            ))}
          </div>
        </div>

        {/* Per-provider breakdown */}
        {PROVIDERS.map(provider => {
          const models = byProvider.get(provider) || []
          if (models.length === 0) return null
          return (
            <div key={provider} className="bg-white rounded-2xl p-6 shadow-sm">
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <span className="w-3 h-3 rounded-full" style={{ backgroundColor: PROVIDER_COLORS[provider] }} />
                {provider} Models
              </h2>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-[#e8e8ed]">
                      <th className="text-left py-2 pr-4 font-medium text-[#86868b]">Model</th>
                      <th className="text-right py-2 px-4 font-medium text-[#86868b]">Input $/1M</th>
                      <th className="text-right py-2 px-4 font-medium text-[#86868b]">Output $/1M</th>
                      <th className="text-right py-2 px-4 font-medium text-[#86868b]">Cache $/1M</th>
                      <th className="text-right py-2 pl-4 font-medium text-[#86868b]">Est. Monthly</th>
                    </tr>
                  </thead>
                  <tbody>
                    {models.map(m => {
                      const cost = projectMonthlyCost(m, SCENARIO)
                      return (
                        <tr key={m.id} className="border-b border-[#e8e8ed] hover:bg-[#fbfbfd] transition-colors">
                          <td className="py-2.5 pr-4 font-medium">{m.name}</td>
                          <td className="text-right py-2.5 px-4">${m.inputPricePer1M.toFixed(4)}</td>
                          <td className="text-right py-2.5 px-4">${m.outputPricePer1M.toFixed(4)}</td>
                          <td className="text-right py-2.5 px-4">{m.cachedInputPricePer1M != null ? `$${m.cachedInputPricePer1M.toFixed(4)}` : '—'}</td>
                          <td className="text-right py-2.5 pl-4 font-mono">{formatCost(cost.monthlyCost)}</td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )
        })}

        {/* FAQ */}
        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <h2 className="text-xl font-semibold mb-4">FAQ</h2>
          <div className="space-y-3">
            <Faq q="Which LLM provider is cheapest?" a="Google Gemini 2.0 Flash-Lite at $0.075/1M input is the cheapest per-token option. DeepSeek V4 Flash ($0.14/1M input) offers better quality at still-low pricing. For most production workloads, GPT-4o Mini ($0.15/1M input) provides the best price-to-quality ratio." />
            <Faq q="Is Claude cheaper than GPT?" a="It depends on the model tier. Claude 3 Haiku ($0.25/1M input) is cheaper than GPT-4o ($2.50/1M input), but GPT-4o Mini ($0.15/1M input) is cheaper than Claude 3.5 Haiku ($0.80/1M input). At the high end, Claude 3 Opus ($15/1M input) costs 3x more than GPT-4o." />
            <Faq q="How do LLM prices compare across providers?" a="Prices vary up to 200x between cheapest and most expensive models. Budget models (Gemini Flash-Lite, DeepSeek V4 Flash) cost under $0.15/1M input. Premium models (Claude 3 Opus, GPT-5.5) cost $5-15/1M input. Most providers offer 50% discounts on cached input tokens." />
          </div>
        </div>

        {/* CTA */}
        <div className="text-center py-4">
          <a href="/llm-pricing/llm-cost-calculator/" className="inline-block bg-[#0071e3] text-white px-6 py-3 rounded-xl font-medium hover:bg-[#0077ED] transition-colors mr-3">
            Try the Cost Calculator →
          </a>
          <a href="/llm-pricing/" className="inline-block border border-[#0071e3] text-[#0071e3] px-6 py-3 rounded-xl font-medium hover:bg-[#0071e3]/5 transition-colors">
            View All Model Prices
          </a>
        </div>
      </main>
    </div>
  )
}

function Stat({ label, value, sub, color }: { label: string; value: string; sub: string; color: string }) {
  return (
    <div className="text-center p-4 rounded-xl bg-[#f5f5f7]">
      <div className="text-xs text-[#86868b] mb-1">{label}</div>
      <div className="text-lg font-semibold" style={{ color }}>{value}</div>
      <div className="text-xs text-[#86868b]">{sub}</div>
    </div>
  )
}

function Faq({ q, a }: { q: string; a: string }) {
  return (
    <details className="group">
      <summary className="cursor-pointer font-medium py-2 list-none flex items-center gap-2">
        <span className="text-[#0071e3] group-open:rotate-90 transition-transform text-lg">›</span>
        {q}
      </summary>
      <p className="text-sm text-[#86868b] pl-6 pb-2">{a}</p>
    </details>
  )
}
