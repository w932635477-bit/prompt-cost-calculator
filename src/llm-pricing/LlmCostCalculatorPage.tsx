// src/llm-pricing/LlmCostCalculatorPage.tsx
// SEO deep page: standalone LLM cost calculator with all 19 models.
// Full-width responsive layout — no max-width constraint.

import { useState, useMemo, useEffect } from 'react'
import pricing from '../data/pricing.json'
import type { ModelPricing } from '../lib/types'
import { GlobalNav } from '../components/GlobalNav'
import { projectMonthlyCost, formatCost } from './calc'
import type { CostParams } from './calc'

const ALL_MODELS = pricing.models as ModelPricing[]
const XL = 1280
const LG = 1024

function useBreakpoint(px: number) {
  const [ok, setOk] = useState(false)
  useEffect(() => {
    const mq = window.matchMedia(`(min-width: ${px}px)`)
    setOk(mq.matches)
    const h = (e: MediaQueryListEvent) => setOk(e.matches)
    mq.addEventListener('change', h)
    return () => mq.removeEventListener('change', h)
  }, [px])
  return ok
}

const DEFAULT_PARAMS: CostParams = {
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

export default function LlmCostCalculatorPage() {
  const [params, setParams] = useState(DEFAULT_PARAMS)
  const isXl = useBreakpoint(XL)
  const isLg = useBreakpoint(LG)

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

      {/* Hero — full bleed */}
      <section className="bg-white border-b border-[#e8e8ed]">
        <div className="px-6 lg:px-12 pt-14 pb-10">
          <a href="/llm-pricing/" className="text-[#0071e3] text-sm hover:underline">← All Models</a>
          <h1 className="text-4xl lg:text-5xl font-semibold tracking-tight mt-4">LLM Cost Calculator</h1>
          <p className="text-lg text-[#86868b] mt-3 max-w-2xl">Estimate your monthly API spending across 19 models from 5 providers. Adjust tokens, calls, and cache rate below.</p>
        </div>
      </section>

      {/* Main grid: form left, results right on wide screens */}
      <div className="px-6 lg:px-12 py-8" style={{ display: 'grid', gridTemplateColumns: isXl ? '420px 1fr' : '1fr', gap: '2rem' }}>

        {/* Form — fixed width column on xl+ */}
        <div className="space-y-6">
          <div className="bg-white rounded-2xl p-6 shadow-sm">
            <h2 className="text-lg font-semibold mb-5">Your Workload</h2>
            <div className="space-y-5">
              <NumberField label="Input tokens / call" value={params.inputTokens} onChange={v => update('inputTokens', v)} />
              <NumberField label="Output tokens / call" value={params.outputTokens} onChange={v => update('outputTokens', v)} />
              <NumberField label="Calls per day" value={params.callsPerDay} onChange={v => update('callsPerDay', v)} />
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-[#86868b]">Cache hit rate</span>
                  <span className="font-semibold">{Math.round(params.cacheHitRate * 100)}%</span>
                </div>
                <input
                  type="range" min={0} max={100} value={params.cacheHitRate * 100}
                  onChange={e => update('cacheHitRate', Number(e.target.value) / 100)}
                  className="w-full accent-[#0071e3]"
                />
                <div className="flex justify-between text-[10px] text-[#86868b] mt-1">
                  <span>0%</span><span>50%</span><span>100%</span>
                </div>
              </div>
            </div>
          </div>

          {/* How it works */}
          <div className="bg-white rounded-2xl p-6 shadow-sm">
            <h2 className="text-lg font-semibold mb-4">How It Works</h2>
            <div className="space-y-3">
              {[
                { n: 1, t: 'Enter your usage', d: 'Tokens per call, daily volume, cache rate' },
                { n: 2, t: 'Compare models', d: '19 models sorted by monthly cost' },
                { n: 3, t: 'Optimize', d: 'Adjust cache rate to see savings' },
              ].map(s => (
                <div key={s.n} className="flex items-start gap-3">
                  <div className="w-7 h-7 rounded-full bg-[#0071e3] text-white text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">{s.n}</div>
                  <div>
                    <div className="text-sm font-medium">{s.t}</div>
                    <div className="text-xs text-[#86868b]">{s.d}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Results — fills remaining width */}
        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-lg font-semibold">Monthly Cost</h2>
            <span className="text-xs text-[#86868b] bg-[#f5f5f7] px-3 py-1 rounded-full">19 models · cheapest first</span>
          </div>
          <div className="space-y-2.5">
            {sorted.map((r, i) => {
              const pct = Math.max((r.cost.monthlyCost / maxCost) * 100, 4)
              const prov = PROVIDERS[r.model.provider]
              const isCheapest = i === 0
              return (
                <div
                  key={r.model.id}
                  className={`flex items-center gap-3 p-3 rounded-xl transition-colors ${
                    isCheapest ? 'bg-[#f0fdf4] ring-1.5 ring-[#10a37f]/30' : 'hover:bg-[#fafafa]'
                  }`}
                >
                  <div
                    className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-[10px] font-bold shrink-0"
                    style={{ backgroundColor: prov?.color || '#86868b' }}
                  >
                    {prov?.abbr || '??'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      {isCheapest && <span className="text-[10px] font-bold text-[#10a37f] bg-[#10a37f]/10 px-1.5 py-0.5 rounded">Cheapest</span>}
                      <span className="text-sm font-medium truncate">{r.model.name}</span>
                      <span className="text-[10px] text-[#86868b] shrink-0">{r.model.provider}</span>
                    </div>
                    <div className="h-2.5 bg-[#e8e8ed] rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-300"
                        style={{
                          width: `${pct}%`,
                          backgroundColor: isCheapest ? '#10a37f' : (prov?.color || '#0071e3'),
                        }}
                      />
                    </div>
                  </div>
                  <div className="text-right shrink-0 min-w-[80px]">
                    <div className="text-sm font-mono font-semibold">{formatCost(r.cost.monthlyCost)}</div>
                    <div className="text-[10px] text-[#86868b]">/month</div>
                    {r.cost.cacheSavings > 0 && (
                      <div className="text-[10px] text-[#30d158] font-medium">↓ {formatCost(r.cost.cacheSavings)}</div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* FAQ — full width */}
      <section className="px-6 lg:px-12 pb-6">
        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <h2 className="text-lg font-semibold mb-4">FAQ</h2>
          <div style={{ display: 'grid', gridTemplateColumns: isLg ? '1fr 1fr' : '1fr', gap: '0.75rem' }}>
            <Faq q="How accurate is this LLM cost calculator?" a="This calculator uses official API pricing from OpenAI, Anthropic, Google, DeepSeek, and Groq. Results reflect per-token billing. Actual costs may vary due to tokenizer differences and network overhead." />
            <Faq q="What is a cache hit rate?" a="Cache hit rate is the percentage of input tokens that match a previously cached prompt. OpenAI, Anthropic, and Google offer 90% discounts on cached input tokens (10% of base price). DeepSeek offers 98% off (2% of base). For apps with repeated system prompts, cache hit rates of 50-90% are common." />
            <Faq q="How do I reduce my LLM API costs?" a="Top strategies: (1) Use prompt caching for repeated contexts, (2) Route simple queries to cheaper models like GPT-4o Mini or Gemini Flash, (3) Reduce output tokens with concise instructions, (4) Batch multiple requests." />
            <Faq q="Which LLM API is the cheapest?" a="Gemini 2.0 Flash-Lite at $0.075/1M input is cheapest. For production quality at low cost, GPT-4o Mini ($0.15/1M) and DeepSeek V4 Flash ($0.14/1M) offer the best balance." />
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="px-6 lg:px-12 pb-12 text-center">
        <a href="/llm-pricing/" className="inline-block bg-[#0071e3] text-white px-8 py-3.5 rounded-2xl font-medium hover:bg-[#0077ED] transition-colors shadow-sm">
          Compare All LLM Prices →
        </a>
      </section>
    </div>
  )
}

function NumberField({ label, value, onChange }: { label: string; value: number; onChange: (v: number) => void }) {
  return (
    <div>
      <label className="text-sm text-[#86868b] block mb-1.5">{label}</label>
      <input
        type="number" value={value}
        onChange={e => onChange(Math.max(1, Number(e.target.value)))}
        className="w-full border border-[#d2d2d7] rounded-xl px-4 py-2.5 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-[#0071e3]/40 focus:border-[#0071e3] transition-shadow"
        min={1}
      />
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
