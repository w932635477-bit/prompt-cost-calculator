// src/llm-pricing/LlmCostCalculatorPage.tsx
// SEO deep page: standalone LLM cost calculator with all 19 models.

import { useState, useMemo } from 'react'
import pricing from '../data/pricing.json'
import type { ModelPricing } from '../lib/types'
import { GlobalNav } from '../components/GlobalNav'
import { projectMonthlyCost, formatCost } from './calc'
import type { CostParams } from './calc'

const ALL_MODELS = pricing.models as ModelPricing[]

const DEFAULT_PARAMS: CostParams = {
  inputTokens: 10_000,
  outputTokens: 2_000,
  callsPerDay: 1_000,
  cacheHitRate: 0.5,
  daysPerMonth: 30,
}

const PROVIDER_COLORS: Record<string, string> = {
  OpenAI: '#10a37f',
  Anthropic: '#d97706',
  Google: '#4285f4',
  DeepSeek: '#6366f1',
  Groq: '#f55036',
}

export default function LlmCostCalculatorPage() {
  const [params, setParams] = useState(DEFAULT_PARAMS)

  const update = <K extends keyof CostParams>(k: K, v: CostParams[K]) =>
    setParams(p => ({ ...p, [k]: v }))

  const results = useMemo(
    () => ALL_MODELS.map(m => ({ model: m, cost: projectMonthlyCost(m, params) })),
    [params]
  )

  const sorted = useMemo(
    () => [...results].sort((a, b) => a.cost.monthlyCost - b.cost.monthlyCost),
    [results]
  )

  const maxCost = useMemo(
    () => Math.max(...sorted.map(r => r.cost.monthlyCost), 0.01),
    [sorted]
  )

  return (
    <div className="min-h-screen bg-[#f5f5f7] text-[#1d1d1f]">
      <GlobalNav current="/llm-pricing/" />

      <header className="max-w-[1200px] mx-auto px-6 pt-16 pb-8">
        <a href="/llm-pricing/" className="text-[#0071e3] text-sm hover:underline">← All Models</a>
        <h1 className="text-4xl sm:text-5xl font-semibold tracking-tight mt-5">LLM Cost Calculator</h1>
        <p className="text-xl text-[#86868b] mt-3">Estimate your monthly API spending across 19 models from 5 providers.</p>
      </header>

      <main className="max-w-[1200px] mx-auto px-6 pb-20 space-y-10">
        {/* Calculator inputs */}
        <div className="bg-white rounded-2xl p-8 shadow-sm">
          <h2 className="text-xl font-semibold mb-6">Configure Your Workload</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <Field label="Input tokens per call" value={params.inputTokens} onChange={v => update('inputTokens', v)} />
            <Field label="Output tokens per call" value={params.outputTokens} onChange={v => update('outputTokens', v)} />
            <Field label="Calls per day" value={params.callsPerDay} onChange={v => update('callsPerDay', v)} />
            <div>
              <label className="text-sm text-[#86868b] block mb-2">Cache hit rate: <span className="font-semibold text-[#1d1d1f]">{Math.round(params.cacheHitRate * 100)}%</span></label>
              <input
                type="range" min={0} max={100} value={params.cacheHitRate * 100}
                onChange={e => update('cacheHitRate', Number(e.target.value) / 100)}
                className="w-full accent-[#0071e3] mt-1"
              />
              <div className="flex justify-between text-[10px] text-[#86868b] mt-1">
                <span>0%</span>
                <span>50%</span>
                <span>100%</span>
              </div>
            </div>
          </div>
        </div>

        {/* Results */}
        <div className="bg-white rounded-2xl p-8 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold">Monthly Cost Projection</h2>
            <span className="text-xs text-[#86868b] bg-[#f5f5f7] px-3 py-1.5 rounded-full">19 models · sorted cheapest first</span>
          </div>
          <div className="space-y-3">
            {sorted.map((r, i) => {
              const barWidth = Math.max((r.cost.monthlyCost / maxCost) * 100, 5)
              return (
                <div
                  key={r.model.id}
                  className={`flex items-center gap-4 p-4 rounded-xl transition-colors ${
                    i === 0
                      ? 'bg-[#f0fdf4] ring-2 ring-[#10a37f]/30'
                      : 'bg-[#fafafa] hover:bg-[#f5f5f7]'
                  }`}
                >
                  {/* Provider badge */}
                  <div
                    className="w-9 h-9 rounded-lg flex items-center justify-center text-white text-[10px] font-bold shrink-0"
                    style={{ backgroundColor: PROVIDER_COLORS[r.model.provider] || '#86868b' }}
                  >
                    {r.model.provider.slice(0, 2).toUpperCase()}
                  </div>

                  {/* Bar + name */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1.5">
                      {i === 0 && <span className="text-xs font-bold text-[#10a37f] bg-[#10a37f]/10 px-2 py-0.5 rounded-full">Cheapest</span>}
                      <span className="text-sm font-medium truncate">{r.model.name}</span>
                      <span className="text-[11px] text-[#86868b] shrink-0">{r.model.provider}</span>
                    </div>
                    <div className="h-3 bg-[#e8e8ed] rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-300 ${
                          i === 0 ? 'bg-[#10a37f]' : ''
                        }`}
                        style={{
                          width: `${barWidth}%`,
                          backgroundColor: i === 0 ? undefined : (PROVIDER_COLORS[r.model.provider] || '#0071e3'),
                        }}
                      />
                    </div>
                  </div>

                  {/* Cost */}
                  <div className="text-right shrink-0 min-w-[90px]">
                    <div className="text-sm font-mono font-semibold">
                      {formatCost(r.cost.monthlyCost)}
                    </div>
                    <div className="text-[10px] text-[#86868b]">/month</div>
                    {r.cost.cacheSavings > 0 && (
                      <div className="text-[11px] text-[#30d158] font-medium mt-0.5">↓ save {formatCost(r.cost.cacheSavings)}</div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* How it works */}
        <div className="bg-white rounded-2xl p-8 shadow-sm">
          <h2 className="text-xl font-semibold mb-6">How the LLM Cost Calculator Works</h2>
          <div className="grid sm:grid-cols-3 gap-8">
            <Step n={1} title="Enter your usage" desc="Input/output tokens per call, daily call volume, and cache hit rate." />
            <Step n={2} title="Compare models" desc="See monthly costs for all 19 models sorted cheapest first." />
            <Step n={3} title="Optimize" desc="Adjust cache hit rate to see potential savings from prompt caching." />
          </div>
        </div>

        {/* FAQ */}
        <div className="bg-white rounded-2xl p-8 shadow-sm">
          <h2 className="text-xl font-semibold mb-6">FAQ</h2>
          <div className="space-y-4">
            <Faq q="How accurate is this LLM cost calculator?" a="This calculator uses official API pricing from OpenAI, Anthropic, Google, DeepSeek, and Groq. Results reflect per-token billing. Actual costs may vary due to tokenizer differences (tiktoken vs estimate) and network overhead." />
            <Faq q="What is a cache hit rate?" a="Cache hit rate is the percentage of input tokens that match a previously cached prompt. OpenAI, Anthropic, and Google offer 50% discounts on cached input tokens. For apps with repeated system prompts, cache hit rates of 50-90% are common." />
            <Faq q="How do I reduce my LLM API costs?" a="Top strategies: (1) Use prompt caching for repeated contexts, (2) Route simple queries to cheaper models like GPT-4o Mini or Gemini Flash, (3) Reduce output tokens with concise instructions, (4) Batch multiple requests. See our LLM cost optimization guide for details." />
            <Faq q="Which LLM API is the cheapest?" a="For basic tasks, Gemini 2.0 Flash-Lite at $0.075/1M input is the cheapest. For production quality at low cost, GPT-4o Mini ($0.15/1M input) and DeepSeek V4 Flash ($0.14/1M input) offer the best balance of capability and price." />
          </div>
        </div>

        {/* CTA */}
        <div className="text-center py-6">
          <a href="/llm-pricing/" className="inline-block bg-[#0071e3] text-white px-8 py-3.5 rounded-2xl font-medium text-base hover:bg-[#0077ED] transition-colors shadow-sm hover:shadow-md">
            Compare All LLM Prices →
          </a>
        </div>
      </main>
    </div>
  )
}

function Field({ label, value, onChange }: { label: string; value: number; onChange: (v: number) => void }) {
  return (
    <div>
      <label className="text-sm text-[#86868b] block mb-2">{label}</label>
      <input
        type="number" value={value}
        onChange={e => onChange(Math.max(1, Number(e.target.value)))}
        className="w-full border border-[#d2d2d7] rounded-xl px-4 py-3 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-[#0071e3]/40 focus:border-[#0071e3] transition-shadow"
        min={1}
      />
    </div>
  )
}

function Step({ n, title, desc }: { n: number; title: string; desc: string }) {
  return (
    <div className="text-center">
      <div className="w-10 h-10 rounded-full bg-[#0071e3] text-white text-sm font-semibold flex items-center justify-center mx-auto mb-3">{n}</div>
      <h3 className="font-semibold mb-1">{title}</h3>
      <p className="text-sm text-[#86868b]">{desc}</p>
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
