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

      <header className="max-w-[1200px] mx-auto px-6 pt-16 pb-8">
        <a href="/llm-pricing/" className="text-[#0071e3] text-sm hover:underline">← All Models</a>
        <h1 className="text-4xl sm:text-5xl font-semibold tracking-tight mt-5">LLM Cost Comparison</h1>
        <p className="text-xl text-[#86868b] mt-3">Side-by-side pricing for 19 models across 5 providers.</p>
      </header>

      <main className="max-w-[1200px] mx-auto px-6 pb-20 space-y-10">
        {/* Key insight */}
        <div className="bg-white rounded-2xl p-8 shadow-sm">
          <h2 className="text-xl font-semibold mb-6">Key Takeaway</h2>
          <div className="grid sm:grid-cols-3 gap-5">
            <Stat
              icon="💰"
              label="Cheapest model"
              value={cheapest.model.name}
              sub={formatCost(cheapest.cost.monthlyCost) + '/mo'}
              color="#10a37f"
            />
            <Stat
              icon="🔥"
              label="Most expensive"
              value={mostExpensive.model.name}
              sub={formatCost(mostExpensive.cost.monthlyCost) + '/mo'}
              color="#ef4444"
            />
            <Stat
              icon="📊"
              label="Price ratio"
              value={`${(mostExpensive.cost.monthlyCost / cheapest.cost.monthlyCost).toFixed(0)}x`}
              sub="most expensive vs cheapest"
              color="#0071e3"
            />
          </div>
          <p className="text-xs text-[#86868b] mt-5 bg-[#f5f5f7] rounded-lg px-4 py-2.5">
            Based on {SCENARIO.inputTokens.toLocaleString()} input + {SCENARIO.outputTokens.toLocaleString()} output tokens, {SCENARIO.callsPerDay.toLocaleString()} calls/day, {Math.round(SCENARIO.cacheHitRate * 100)}% cache hit rate.
          </p>
        </div>

        {/* Visual comparison */}
        <div className="bg-white rounded-2xl p-8 shadow-sm">
          <h2 className="text-xl font-semibold mb-6">Monthly Cost Ranking</h2>
          <div className="space-y-3">
            {scenarioResults.map((r) => {
              const barWidth = Math.max((r.cost.monthlyCost / maxCost) * 100, 5)
              return (
                <div key={r.model.id} className="flex items-center gap-4 p-4 rounded-xl bg-[#fafafa] hover:bg-[#f5f5f7] transition-colors">
                  {/* Provider badge */}
                  <div
                    className="w-9 h-9 rounded-lg flex items-center justify-center text-white text-[10px] font-bold shrink-0"
                    style={{ backgroundColor: PROVIDER_COLORS[r.model.provider] || '#86868b' }}
                  >
                    {r.model.provider.slice(0, 2).toUpperCase()}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1.5">
                      <span className="text-sm font-medium truncate">{r.model.name}</span>
                      <span className="text-[11px] text-[#86868b] shrink-0">{r.model.provider}</span>
                    </div>
                    <div className="h-3 bg-[#e8e8ed] rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-300"
                        style={{
                          width: `${barWidth}%`,
                          backgroundColor: PROVIDER_COLORS[r.model.provider] || '#0071e3',
                        }}
                      />
                    </div>
                  </div>
                  <span className="text-sm font-mono font-semibold shrink-0 min-w-[90px] text-right">{formatCost(r.cost.monthlyCost)}/mo</span>
                </div>
              )
            })}
          </div>
        </div>

        {/* Per-provider breakdown */}
        {PROVIDERS.map(provider => {
          const models = byProvider.get(provider) || []
          if (models.length === 0) return null
          return (
            <div key={provider} className="bg-white rounded-2xl p-8 shadow-sm">
              <h2 className="text-xl font-semibold mb-6 flex items-center gap-3">
                <div
                  className="w-4 h-4 rounded-md"
                  style={{ backgroundColor: PROVIDER_COLORS[provider] }}
                />
                {provider} Models
                <span className="text-xs text-[#86868b] font-normal bg-[#f5f5f7] px-2.5 py-1 rounded-full">{models.length} models</span>
              </h2>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b-2 border-[#e8e8ed]">
                      <th className="text-left py-3 pr-4 font-semibold text-[#1d1d1f]">Model</th>
                      <th className="text-right py-3 px-4 font-semibold text-[#1d1d1f]">Input $/1M</th>
                      <th className="text-right py-3 px-4 font-semibold text-[#1d1d1f]">Output $/1M</th>
                      <th className="text-right py-3 px-4 font-semibold text-[#1d1d1f]">Cache $/1M</th>
                      <th className="text-right py-3 pl-4 font-semibold text-[#1d1d1f]">Est. Monthly</th>
                    </tr>
                  </thead>
                  <tbody>
                    {models.map(m => {
                      const cost = projectMonthlyCost(m, SCENARIO)
                      return (
                        <tr key={m.id} className="border-b border-[#f0f0f5] hover:bg-[#fafafa] transition-colors">
                          <td className="py-3.5 pr-4 font-medium">{m.name}</td>
                          <td className="text-right py-3.5 px-4 font-mono">${m.inputPricePer1M.toFixed(4)}</td>
                          <td className="text-right py-3.5 px-4 font-mono">${m.outputPricePer1M.toFixed(4)}</td>
                          <td className="text-right py-3.5 px-4 font-mono text-[#86868b]">{m.cachedInputPricePer1M != null ? `$${m.cachedInputPricePer1M.toFixed(4)}` : '—'}</td>
                          <td className="text-right py-3.5 pl-4 font-mono font-semibold">{formatCost(cost.monthlyCost)}</td>
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
        <div className="bg-white rounded-2xl p-8 shadow-sm">
          <h2 className="text-xl font-semibold mb-6">FAQ</h2>
          <div className="space-y-4">
            <Faq q="Which LLM provider is cheapest?" a="Google Gemini 2.0 Flash-Lite at $0.075/1M input is the cheapest per-token option. DeepSeek V4 Flash ($0.14/1M input) offers better quality at still-low pricing. For most production workloads, GPT-4o Mini ($0.15/1M input) provides the best price-to-quality ratio." />
            <Faq q="Is Claude cheaper than GPT?" a="It depends on the model tier. Claude 3 Haiku ($0.25/1M input) is cheaper than GPT-4o ($2.50/1M input), but GPT-4o Mini ($0.15/1M input) is cheaper than Claude 3.5 Haiku ($0.80/1M input). At the high end, Claude 3 Opus ($15/1M input) costs 3x more than GPT-4o." />
            <Faq q="How do LLM prices compare across providers?" a="Prices vary up to 200x between cheapest and most expensive models. Budget models (Gemini Flash-Lite, DeepSeek V4 Flash) cost under $0.15/1M input. Premium models (Claude 3 Opus, GPT-5.5) cost $5-15/1M input. Most providers offer 50% discounts on cached input tokens." />
          </div>
        </div>

        {/* CTA */}
        <div className="text-center py-6 flex flex-wrap justify-center gap-4">
          <a href="/llm-pricing/llm-cost-calculator/" className="inline-block bg-[#0071e3] text-white px-8 py-3.5 rounded-2xl font-medium text-base hover:bg-[#0077ED] transition-colors shadow-sm hover:shadow-md">
            Try the Cost Calculator →
          </a>
          <a href="/llm-pricing/" className="inline-block border-2 border-[#0071e3] text-[#0071e3] px-8 py-3.5 rounded-2xl font-medium text-base hover:bg-[#0071e3]/5 transition-colors">
            View All Model Prices
          </a>
        </div>
      </main>
    </div>
  )
}

function Stat({ icon, label, value, sub, color }: { icon: string; label: string; value: string; sub: string; color: string }) {
  return (
    <div className="text-center p-6 rounded-2xl bg-[#f5f5f7] border border-[#e8e8ed]">
      <div className="text-2xl mb-2">{icon}</div>
      <div className="text-xs text-[#86868b] mb-1.5 uppercase tracking-wide">{label}</div>
      <div className="text-lg font-bold" style={{ color }}>{value}</div>
      <div className="text-sm text-[#86868b] mt-1 font-mono">{sub}</div>
    </div>
  )
}

function Faq({ q, a }: { q: string; a: string }) {
  return (
    <details className="group rounded-xl bg-[#fafafa] hover:bg-[#f5f5f7] transition-colors">
      <summary className="cursor-pointer font-medium py-4 px-5 list-none flex items-center gap-3">
        <span className="text-[#0071e3] group-open:rotate-90 transition-transform text-base shrink-0">›</span>
        <span className="text-[15px]">{q}</span>
      </summary>
      <p className="text-sm text-[#86868b] pl-11 pr-5 pb-4 leading-relaxed">{a}</p>
    </details>
  )
}
