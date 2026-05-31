// src/llm-pricing/LlmCostComparisonPage.tsx
// SEO deep page: cross-provider cost comparison.
// Full-width responsive layout — no max-width constraint.

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

const PROVIDERS: Record<string, { color: string; abbr: string }> = {
  OpenAI: { color: '#10a37f', abbr: 'OA' },
  Anthropic: { color: '#d97706', abbr: 'AN' },
  Google: { color: '#4285f4', abbr: 'GO' },
  DeepSeek: { color: '#6366f1', abbr: 'DS' },
  Groq: { color: '#f55036', abbr: 'GQ' },
}

const PROVIDER_LIST = ['OpenAI', 'Anthropic', 'Google', 'DeepSeek', 'Groq'] as const

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

      {/* Hero */}
      <section className="bg-white border-b border-[#e8e8ed]">
        <div className="px-6 lg:px-12 pt-14 pb-10">
          <a href="/llm-pricing/" className="text-[#0071e3] text-sm hover:underline">← All Models</a>
          <h1 className="text-4xl lg:text-5xl font-semibold tracking-tight mt-4">LLM Cost Comparison</h1>
          <p className="text-lg text-[#86868b] mt-3 max-w-2xl">Side-by-side pricing for 19 models across 5 providers.</p>
        </div>
      </section>

      <div className="px-6 lg:px-12 py-8 space-y-8">

        {/* Key stats — 3 columns */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <StatCard
            icon="💰"
            label="Cheapest"
            value={cheapest.model.name}
            sub={formatCost(cheapest.cost.monthlyCost) + '/mo'}
            color="#10a37f"
          />
          <StatCard
            icon="🔥"
            label="Most expensive"
            value={mostExpensive.model.name}
            sub={formatCost(mostExpensive.cost.monthlyCost) + '/mo'}
            color="#ef4444"
          />
          <StatCard
            icon="📊"
            label="Price ratio"
            value={`${(mostExpensive.cost.monthlyCost / cheapest.cost.monthlyCost).toFixed(0)}x`}
            sub="most expensive vs cheapest"
            color="#0071e3"
          />
        </div>

        {/* Visual ranking — full width */}
        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-lg font-semibold">Monthly Cost Ranking</h2>
            <span className="text-xs text-[#86868b] bg-[#f5f5f7] px-3 py-1 rounded-full">
              {SCENARIO.inputTokens.toLocaleString()} in + {SCENARIO.outputTokens.toLocaleString()} out · {SCENARIO.callsPerDay.toLocaleString()}/day · {Math.round(SCENARIO.cacheHitRate * 100)}% cache
            </span>
          </div>
          {/* On wide screens: 2-column grid for the bars */}
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-x-8 gap-y-2">
            {scenarioResults.map((r) => {
              const pct = Math.max((r.cost.monthlyCost / maxCost) * 100, 4)
              const prov = PROVIDERS[r.model.provider]
              return (
                <div key={r.model.id} className="flex items-center gap-3 p-3 rounded-xl hover:bg-[#fafafa] transition-colors">
                  <div
                    className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-[10px] font-bold shrink-0"
                    style={{ backgroundColor: prov?.color || '#86868b' }}
                  >
                    {prov?.abbr || '??'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm font-medium truncate">{r.model.name}</span>
                      <span className="text-[10px] text-[#86868b] shrink-0">{r.model.provider}</span>
                    </div>
                    <div className="h-2.5 bg-[#e8e8ed] rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full"
                        style={{ width: `${pct}%`, backgroundColor: prov?.color || '#0071e3' }}
                      />
                    </div>
                  </div>
                  <span className="text-sm font-mono font-semibold shrink-0 min-w-[80px] text-right">{formatCost(r.cost.monthlyCost)}/mo</span>
                </div>
              )
            })}
          </div>
        </div>

        {/* Per-provider tables — 2 columns on wide screens */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {PROVIDER_LIST.map(provider => {
            const models = byProvider.get(provider) || []
            if (models.length === 0) return null
            const prov = PROVIDERS[provider]
            return (
              <div key={provider} className="bg-white rounded-2xl p-6 shadow-sm">
                <div className="flex items-center gap-2.5 mb-5">
                  <div className="w-5 h-5 rounded-md" style={{ backgroundColor: prov?.color }} />
                  <h2 className="text-lg font-semibold">{provider}</h2>
                  <span className="text-xs text-[#86868b] bg-[#f5f5f7] px-2 py-0.5 rounded-full">{models.length}</span>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b-2 border-[#e8e8ed]">
                        <th className="text-left py-2.5 pr-3 font-semibold">Model</th>
                        <th className="text-right py-2.5 px-3 font-semibold">In $/1M</th>
                        <th className="text-right py-2.5 px-3 font-semibold">Out $/1M</th>
                        <th className="text-right py-2.5 pl-3 font-semibold">Est. Mo.</th>
                      </tr>
                    </thead>
                    <tbody>
                      {models.map(m => {
                        const cost = projectMonthlyCost(m, SCENARIO)
                        return (
                          <tr key={m.id} className="border-b border-[#f0f0f5] hover:bg-[#fafafa]">
                            <td className="py-2.5 pr-3 font-medium">{m.name}</td>
                            <td className="text-right py-2.5 px-3 font-mono">${m.inputPricePer1M.toFixed(4)}</td>
                            <td className="text-right py-2.5 px-3 font-mono">${m.outputPricePer1M.toFixed(4)}</td>
                            <td className="text-right py-2.5 pl-3 font-mono font-semibold">{formatCost(cost.monthlyCost)}</td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )
          })}
        </div>

        {/* FAQ — 2 columns */}
        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <h2 className="text-lg font-semibold mb-4">FAQ</h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
            <Faq q="Which LLM provider is cheapest?" a="Google Gemini 2.0 Flash-Lite at $0.075/1M input is cheapest per-token. DeepSeek V4 Flash ($0.14/1M) offers better quality. For production, GPT-4o Mini ($0.15/1M) provides the best price-to-quality ratio." />
            <Faq q="Is Claude cheaper than GPT?" a="It depends on the model tier. Claude 3 Haiku ($0.25/1M input) is cheaper than GPT-4o ($2.50/1M), but GPT-4o Mini ($0.15/1M) is cheaper than Claude 3.5 Haiku ($0.80/1M)." />
            <Faq q="How do LLM prices compare across providers?" a="Prices vary up to 200x between cheapest and most expensive models. Budget models cost under $0.15/1M input. Premium models cost $5-15/1M input. Most providers offer 50% discounts on cached input tokens." />
          </div>
        </div>

        {/* CTA */}
        <div className="text-center flex flex-wrap justify-center gap-4">
          <a href="/llm-pricing/llm-cost-calculator/" className="inline-block bg-[#0071e3] text-white px-8 py-3.5 rounded-2xl font-medium hover:bg-[#0077ED] transition-colors shadow-sm">
            Try the Cost Calculator →
          </a>
          <a href="/llm-pricing/" className="inline-block border-2 border-[#0071e3] text-[#0071e3] px-8 py-3.5 rounded-2xl font-medium hover:bg-[#0071e3]/5 transition-colors">
            View All Model Prices
          </a>
        </div>
      </div>
    </div>
  )
}

function StatCard({ icon, label, value, sub, color }: { icon: string; label: string; value: string; sub: string; color: string }) {
  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm text-center">
      <div className="text-2xl mb-2">{icon}</div>
      <div className="text-xs text-[#86868b] uppercase tracking-wide mb-1">{label}</div>
      <div className="text-lg font-bold" style={{ color }}>{value}</div>
      <div className="text-sm text-[#86868b] mt-1 font-mono">{sub}</div>
    </div>
  )
}

function Faq({ q, a }: { q: string; a: string }) {
  return (
    <details className="group rounded-xl bg-[#fafafa] hover:bg-[#f5f5f7] transition-colors">
      <summary className="cursor-pointer font-medium py-3.5 px-4 list-none flex items-center gap-2.5 text-sm">
        <span className="text-[#0071e3] group-open:rotate-90 transition-transform shrink-0">›</span>
        <span>{q}</span>
      </summary>
      <p className="text-xs text-[#86868b] pl-8 pr-4 pb-3.5 leading-relaxed">{a}</p>
    </details>
  )
}
