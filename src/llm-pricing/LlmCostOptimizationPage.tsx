// src/llm-pricing/LlmCostOptimizationPage.tsx
// SEO deep page: 7 strategies to cut LLM API costs.
// Full-width responsive layout — no max-width constraint.

import { useState, useEffect } from 'react'
import pricing from '../data/pricing.json'
import type { ModelPricing } from '../lib/types'
import { GlobalNav } from '../components/GlobalNav'

const LG = 1024
const SM = 640

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

const ALL_MODELS = pricing.models as ModelPricing[]

const PROVIDERS: Record<string, { color: string; abbr: string }> = {
  OpenAI: { color: '#10a37f', abbr: 'OA' },
  Anthropic: { color: '#d97706', abbr: 'AN' },
  Google: { color: '#4285f4', abbr: 'GO' },
  DeepSeek: { color: '#6366f1', abbr: 'DS' },
  Groq: { color: '#f55036', abbr: 'GQ' },
}

const STRATEGIES = [
  {
    title: 'Enable Prompt Caching',
    saving: '50%',
    icon: '⚡',
    desc: 'OpenAI, Anthropic, and Google offer 90% discounts on cached input tokens (10% of base price). DeepSeek offers 98% off (2% of base). If your app repeats system prompts or few-shot examples, enable prompt caching immediately.',
    example: 'GPT-5.4 input: $2.50/1M → cached: $0.25/1M. At 70% cache hit rate on 10K input × 1K calls/day, that\'s ~$473/month saved.',
  },
  {
    title: 'Route Simple Queries to Cheap Models',
    saving: '80%',
    icon: '🔀',
    desc: 'Not every query needs GPT-5.5 or Claude Opus. Use a lightweight router to send classification, formatting, and simple Q&A to budget models.',
    example: 'Route 60% of traffic from GPT-4o ($2.50/1M input) to GPT-4o Mini ($0.15/1M input). Monthly savings: $1,410 on 1K calls/day.',
  },
  {
    title: 'Reduce Output Token Length',
    saving: '40%',
    icon: '✂️',
    desc: 'Output tokens cost 4-6x more than input tokens. Add explicit length constraints: "Answer in 2 sentences" or "Return JSON only."',
    example: 'Claude 3.7 Sonnet output at $15.00/1M vs input at $3.00/1M. Cutting output from 1000 to 300 tokens saves $10.50/month per 100 daily calls.',
  },
  {
    title: 'Batch Your API Requests',
    saving: '50%',
    icon: '📦',
    desc: 'OpenAI Batch API offers 50% discount for non-real-time workloads. Process logs, generate embeddings, or classify data in batches.',
    example: 'GPT-4o Batch: $1.25/1M input vs standard $2.50/1M. A nightly batch job processing 100K requests saves $1,250/month.',
  },
  {
    title: 'Compress Your Prompts',
    saving: '25%',
    icon: '🗜️',
    desc: 'Shorter prompts mean fewer input tokens. Remove redundant instructions, use abbreviations, and consolidate system messages.',
    example: 'Trimming 500 tokens from a 3K input prompt saves $37.50/month on GPT-4o at 1K calls/day.',
  },
  {
    title: 'Use Provider-Specific Pricing',
    saving: '30%',
    icon: '🏷️',
    desc: 'DeepSeek V4 Flash costs $0.14/1M input vs GPT-4o at $2.50/1M. For tasks that don\'t require OpenAI-specific capabilities, switching providers can cut costs 10-18x.',
    example: 'DeepSeek V4 Flash ($0.14/1M input, $0.28/1M output) vs GPT-4o ($2.50, $10.00). Same workload: $8.40/mo vs $150/mo.',
  },
  {
    title: 'Monitor and Set Budget Alerts',
    saving: '15%',
    icon: '📊',
    desc: 'You can\'t optimize what you don\'t measure. Set up token tracking and budget alerts. Identify expensive endpoints and unnecessary retries.',
    example: 'A team discovered 20% of API calls were retry loops adding $500/month in waste. Alerts caught it within 48 hours.',
  },
]

export default function LlmCostOptimizationPage() {
  const isLg = useBreakpoint(LG)
  const isSm = useBreakpoint(SM)
  return (
    <div className="min-h-screen bg-[#f5f5f7] text-[#1d1d1f]">
      <GlobalNav current="/llm-pricing/" />

      {/* Hero */}
      <section className="bg-white border-b border-[#e8e8ed]">
        <div className="px-6 lg:px-12 pt-14 pb-10">
          <a href="/llm-pricing/" className="text-[#0071e3] text-sm hover:underline">← All Models</a>
          <h1 className="text-4xl lg:text-5xl font-semibold tracking-tight mt-4">LLM Cost Optimization</h1>
          <p className="text-lg text-[#86868b] mt-3 max-w-2xl">7 strategies to cut your AI API spending by up to 60%.</p>
        </div>
      </section>

      <div className="px-6 lg:px-12 py-8 space-y-8">

        {/* Cheapest by provider — 5 columns on wide screens */}
        <div style={{ display: 'grid', gridTemplateColumns: isLg ? 'repeat(5, 1fr)' : isSm ? 'repeat(3, 1fr)' : 'repeat(2, 1fr)', gap: '1rem' }}>
          {PROVIDER_LIST.map(provider => {
            const models = ALL_MODELS.filter(m => m.provider === provider).sort((a, b) => a.inputPricePer1M - b.inputPricePer1M)
            const cheapest = models[0]
            if (!cheapest) return null
            const prov = PROVIDERS[provider]
            return (
              <div key={provider} className="bg-white rounded-2xl p-5 shadow-sm text-center">
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-[10px] font-bold mx-auto mb-2"
                  style={{ backgroundColor: prov?.color }}
                >
                  {prov?.abbr}
                </div>
                <div className="text-[10px] text-[#86868b] uppercase tracking-wide mb-1">{provider}</div>
                <div className="text-sm font-semibold">{cheapest.name}</div>
                <div className="text-sm font-mono text-[#0071e3] font-medium mt-1">${cheapest.inputPricePer1M}/1M</div>
              </div>
            )
          })}
        </div>

        {/* Strategies — 2 columns on wide screens */}
        <div style={{ display: 'grid', gridTemplateColumns: isLg ? '1fr 1fr' : '1fr', gap: '1rem' }}>
          {STRATEGIES.map((s, i) => (
            <details key={i} className="bg-white rounded-2xl shadow-sm group" open={i < 2}>
              <summary className="cursor-pointer p-5 list-none flex items-start gap-4">
                <span className="text-2xl shrink-0 mt-0.5">{s.icon}</span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="text-base font-semibold">{s.title}</h3>
                    <span className="text-[10px] font-semibold text-[#30d158] bg-[#30d158]/10 px-2 py-0.5 rounded-full">Save {s.saving}</span>
                  </div>
                  <p className="text-xs text-[#86868b] mt-1.5 leading-relaxed">{s.desc}</p>
                </div>
                <span className="text-[#0071e3] group-open:rotate-90 transition-transform text-sm mt-1 shrink-0">›</span>
              </summary>
              <div className="px-5 pb-5 pl-14">
                <div className="bg-[#f5f5f7] rounded-xl p-4 border border-[#e8e8ed]">
                  <div className="text-[10px] text-[#86868b] mb-1.5 font-semibold uppercase tracking-wide">Real example</div>
                  <p className="text-xs font-mono text-[#1d1d1f] leading-relaxed">{s.example}</p>
                </div>
              </div>
            </details>
          ))}
        </div>

        {/* Before / After — 2 columns */}
        <div style={{ display: 'grid', gridTemplateColumns: isSm ? '1fr 1fr' : '1fr', gap: '1.5rem' }}>
          <div className="bg-white rounded-2xl p-6 shadow-sm border-l-4 border-l-red-400">
            <div className="text-xs text-[#ef4444] font-semibold uppercase tracking-wide mb-3">❌ Before</div>
            <ul className="text-sm space-y-2">
              {['GPT-4o for all queries', 'No prompt caching', 'Verbose 1000-token outputs', 'Real-time calls only'].map(t => (
                <li key={t} className="flex items-start gap-2"><span className="text-[#ef4444] mt-0.5">•</span>{t}</li>
              ))}
            </ul>
            <div className="mt-4 pt-3 border-t border-[#f0f0f5]">
              <span className="text-2xl font-bold text-[#ef4444] font-mono">~$4,500</span>
              <span className="text-sm text-[#ef4444]/70 ml-1">/month</span>
            </div>
          </div>
          <div className="bg-white rounded-2xl p-6 shadow-sm border-l-4 border-l-green-500">
            <div className="text-xs text-[#10a37f] font-semibold uppercase tracking-wide mb-3">✅ After</div>
            <ul className="text-sm space-y-2">
              {['60% routed to GPT-4o Mini', 'Prompt caching enabled (70%)', 'Constrained 300-token outputs', 'Batch API for non-real-time'].map(t => (
                <li key={t} className="flex items-start gap-2"><span className="text-[#10a37f] mt-0.5">•</span>{t}</li>
              ))}
            </ul>
            <div className="mt-4 pt-3 border-t border-[#f0f0f5]">
              <span className="text-2xl font-bold text-[#10a37f] font-mono">~$1,800</span>
              <span className="text-sm text-[#10a37f]/70 ml-1">/month</span>
            </div>
          </div>
        </div>

        {/* Savings badge */}
        <div className="text-center">
          <span className="inline-block text-2xl font-bold text-[#10a37f] bg-[#10a37f]/10 px-6 py-3 rounded-2xl">
            ↓ 60% cost reduction
          </span>
        </div>

        {/* FAQ — 2 columns */}
        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <h2 className="text-lg font-semibold mb-4">FAQ</h2>
          <div style={{ display: 'grid', gridTemplateColumns: isLg ? '1fr 1fr' : '1fr', gap: '0.75rem' }}>
            <Faq q="How much can I save with prompt caching?" a="50% off input tokens. If 70% of your input tokens are cached, you save ~35% on total input costs. For GPT-5.4 at 10K input × 1K calls/day, that's ~$473/month saved." />
            <Faq q="Is it worth switching from OpenAI to DeepSeek?" a="For cost-sensitive workloads, yes. DeepSeek V4 Flash costs $0.14/1M input vs GPT-4o's $2.50/1M — 18x reduction. Test quality first for nuanced tasks." />
            <Faq q="What is OpenAI Batch API?" a="Submit requests processed within 24 hours at 50% discount. Perfect for classification, embedding generation, data extraction. Up to 100K requests per batch file." />
          </div>
        </div>

        {/* CTA */}
        <div className="text-center flex flex-wrap justify-center gap-4">
          <a href="/llm-pricing/llm-cost-calculator/" className="inline-block bg-[#0071e3] text-white px-8 py-3.5 rounded-2xl font-medium hover:bg-[#0077ED] transition-colors shadow-sm">
            Calculate Your Savings →
          </a>
          <a href="/llm-pricing/llm-cost-comparison/" className="inline-block border-2 border-[#0071e3] text-[#0071e3] px-8 py-3.5 rounded-2xl font-medium hover:bg-[#0071e3]/5 transition-colors">
            Compare All Models
          </a>
        </div>
      </div>
    </div>
  )
}

const PROVIDER_LIST = ['OpenAI', 'Anthropic', 'Google', 'DeepSeek', 'Groq'] as const

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
