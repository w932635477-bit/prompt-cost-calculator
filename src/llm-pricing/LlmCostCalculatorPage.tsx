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

      <header className="max-w-[980px] mx-auto px-4 pt-12 pb-6">
        <a href="/llm-pricing/" className="text-[#0071e3] text-sm hover:underline">← All Models</a>
        <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight mt-4">LLM Cost Calculator</h1>
        <p className="text-lg text-[#86868b] mt-2">Estimate your monthly API spending across 19 models from 5 providers.</p>
      </header>

      <main className="max-w-[980px] mx-auto px-4 pb-16 space-y-8">
        {/* Calculator inputs */}
        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <h2 className="text-xl font-semibold mb-4">Configure Your Workload</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Field label="Input tokens per call" value={params.inputTokens} onChange={v => update('inputTokens', v)} />
            <Field label="Output tokens per call" value={params.outputTokens} onChange={v => update('outputTokens', v)} />
            <Field label="Calls per day" value={params.callsPerDay} onChange={v => update('callsPerDay', v)} />
            <div>
              <label className="text-xs text-[#86868b] block mb-1">Cache hit rate: {Math.round(params.cacheHitRate * 100)}%</label>
              <input
                type="range" min={0} max={100} value={params.cacheHitRate * 100}
                onChange={e => update('cacheHitRate', Number(e.target.value) / 100)}
                className="w-full accent-[#0071e3] mt-2"
              />
            </div>
          </div>
        </div>

        {/* Results */}
        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <h2 className="text-xl font-semibold mb-4">Monthly Cost Projection</h2>
          <p className="text-sm text-[#86868b] mb-4">Sorted cheapest first. Green bar = cheapest model.</p>
          <div className="space-y-2">
            {sorted.map((r, i) => (
              <div
                key={r.model.id}
                className={`flex items-center gap-3 p-3 rounded-xl transition-colors ${
                  i === 0 ? 'bg-[#f0fdf4] ring-1 ring-[#10a37f]' : 'bg-[#f5f5f7]'
                }`}
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    {i === 0 && <span className="text-[10px] font-bold text-[#10a37f]">★</span>}
                    <span className="text-sm font-medium truncate">{r.model.provider} {r.model.name}</span>
                  </div>
                  <div className="mt-1.5 h-2 bg-[#e8e8ed] rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${i === 0 ? 'bg-[#10a37f]' : 'bg-[#0071e3]'}`}
                      style={{ width: `${Math.max((r.cost.monthlyCost / maxCost) * 100, 2)}%` }}
                    />
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <span className="text-sm font-mono font-medium">
                    {formatCost(r.cost.monthlyCost)}<span className="text-[#86868b] text-xs">/mo</span>
                  </span>
                  {r.cost.cacheSavings > 0 && (
                    <div className="text-[10px] text-[#30d158]">save {formatCost(r.cost.cacheSavings)}</div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* How it works */}
        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <h2 className="text-xl font-semibold mb-4">How the LLM Cost Calculator Works</h2>
          <div className="grid sm:grid-cols-3 gap-6">
            <Step n={1} title="Enter your usage" desc="Input/output tokens per call, daily call volume, and cache hit rate." />
            <Step n={2} title="Compare models" desc="See monthly costs for all 19 models sorted cheapest first." />
            <Step n={3} title="Optimize" desc="Adjust cache hit rate to see potential savings from prompt caching." />
          </div>
        </div>

        {/* FAQ */}
        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <h2 className="text-xl font-semibold mb-4">FAQ</h2>
          <div className="space-y-3">
            <Faq q="How accurate is this LLM cost calculator?" a="This calculator uses official API pricing from OpenAI, Anthropic, Google, DeepSeek, and Groq. Results reflect per-token billing. Actual costs may vary due to tokenizer differences (tiktoken vs estimate) and network overhead." />
            <Faq q="What is a cache hit rate?" a="Cache hit rate is the percentage of input tokens that match a previously cached prompt. OpenAI, Anthropic, and Google offer 50% discounts on cached input tokens. For apps with repeated system prompts, cache hit rates of 50-90% are common." />
            <Faq q="How do I reduce my LLM API costs?" a="Top strategies: (1) Use prompt caching for repeated contexts, (2) Route simple queries to cheaper models like GPT-4o Mini or Gemini Flash, (3) Reduce output tokens with concise instructions, (4) Batch multiple requests. See our LLM cost optimization guide for details." />
            <Faq q="Which LLM API is the cheapest?" a="For basic tasks, Gemini 2.0 Flash-Lite at $0.075/1M input is the cheapest. For production quality at low cost, GPT-4o Mini ($0.15/1M input) and DeepSeek V4 Flash ($0.14/1M input) offer the best balance of capability and price." />
          </div>
        </div>

        {/* CTA */}
        <div className="text-center py-4">
          <a href="/llm-pricing/" className="inline-block bg-[#0071e3] text-white px-6 py-3 rounded-xl font-medium hover:bg-[#0077ED] transition-colors">
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
      <label className="text-xs text-[#86868b] block mb-1">{label}</label>
      <input
        type="number" value={value}
        onChange={e => onChange(Math.max(1, Number(e.target.value)))}
        className="w-full border border-[#e8e8ed] rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#0071e3]/40 focus:border-[#0071e3]"
        min={1}
      />
    </div>
  )
}

function Step({ n, title, desc }: { n: number; title: string; desc: string }) {
  return (
    <div className="text-center">
      <div className="w-8 h-8 rounded-full bg-[#0071e3] text-white text-sm font-semibold flex items-center justify-center mx-auto mb-2">{n}</div>
      <h3 className="font-semibold text-sm mb-1">{title}</h3>
      <p className="text-xs text-[#86868b]">{desc}</p>
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
