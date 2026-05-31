// src/llm-pricing/LlmCostOptimizationPage.tsx
// SEO deep page: 7 strategies to cut LLM API costs.

import pricing from '../data/pricing.json'
import type { ModelPricing } from '../lib/types'
import { GlobalNav } from '../components/GlobalNav'

const ALL_MODELS = pricing.models as ModelPricing[]

const PROVIDER_COLORS: Record<string, string> = {
  OpenAI: '#10a37f',
  Anthropic: '#d97706',
  Google: '#4285f4',
  DeepSeek: '#6366f1',
  Groq: '#f55036',
}

const STRATEGIES = [
  {
    title: 'Enable Prompt Caching',
    saving: '50%',
    icon: '⚡',
    desc: 'OpenAI, Anthropic, and Google all offer 50% discounts on cached input tokens. If your app repeats system prompts or few-shot examples, enable prompt caching immediately.',
    example: `GPT-4o input: $2.50/1M → cached: $1.25/1M. At 70% cache hit rate on 10K input tokens × 1K calls/day, that's $131/month saved.`,
  },
  {
    title: 'Route Simple Queries to Cheap Models',
    saving: '80%',
    icon: '🔀',
    desc: 'Not every query needs GPT-5.5 or Claude Opus. Use a lightweight router to send classification, formatting, and simple Q&A to budget models. Save premium models for complex reasoning.',
    example: `Route 60% of traffic from GPT-4o ($2.50/1M input) to GPT-4o Mini ($0.15/1M input). Monthly savings: $1,410 on 1K calls/day with 10K input tokens.`,
  },
  {
    title: 'Reduce Output Token Length',
    saving: '40%',
    icon: '✂️',
    desc: 'Output tokens cost 4-6x more than input tokens across most providers. Add explicit length constraints: "Answer in 2 sentences" or "Return JSON only, no explanation."',
    example: `Claude 3.7 Sonnet output at $15.00/1M vs input at $3.00/1M. Cutting output from 1000 to 300 tokens saves $10.50/month per 100 daily calls.`,
  },
  {
    title: 'Batch Your API Requests',
    saving: '50%',
    icon: '📦',
    desc: 'OpenAI Batch API offers 50% discount for non-real-time workloads. Process logs, generate embeddings, or classify data in batches instead of real-time calls.',
    example: `GPT-4o Batch: $1.25/1M input vs standard $2.50/1M. A nightly batch job processing 100K requests saves $1,250/month.`,
  },
  {
    title: 'Compress Your Prompts',
    saving: '25%',
    icon: '🗜️',
    desc: 'Shorter prompts mean fewer input tokens. Remove redundant instructions, use abbreviations, and consolidate system messages. Every 100 tokens saved per call compounds daily.',
    example: `Trimming 500 tokens from a 3K input prompt saves $37.50/month on GPT-4o at 1K calls/day. Multiply across multiple models.`,
  },
  {
    title: 'Use Provider-Specific Pricing',
    saving: '30%',
    icon: '🏷️',
    desc: 'DeepSeek V4 Flash costs $0.14/1M input vs GPT-4o at $2.50/1M. For tasks that don\'t require OpenAI-specific capabilities, switching providers can cut costs 10-18x.',
    example: `DeepSeek V4 Flash ($0.14/1M input, $0.28/1M output) vs GPT-4o ($2.50, $10.00). Same 10K input + 2K output workload: $8.40/mo vs $150/mo.`,
  },
  {
    title: 'Monitor and Set Budget Alerts',
    saving: '15%',
    icon: '📊',
    desc: 'You can\'t optimize what you don\'t measure. Set up token tracking and budget alerts. Identify expensive endpoints, high-token users, and unnecessary retries.',
    example: `A team discovered 20% of API calls were retry loops adding $500/month in waste. Alert thresholds caught it within 48 hours.`,
  },
]

export default function LlmCostOptimizationPage() {
  return (
    <div className="min-h-screen bg-[#f5f5f7] text-[#1d1d1f]">
      <GlobalNav current="/llm-pricing/" />

      <header className="max-w-[1800px] mx-auto px-6 pt-16 pb-8">
        <a href="/llm-pricing/" className="text-[#0071e3] text-sm hover:underline">← All Models</a>
        <h1 className="text-4xl sm:text-5xl font-semibold tracking-tight mt-5">LLM Cost Optimization</h1>
        <p className="text-xl text-[#86868b] mt-3">7 strategies to cut your AI API spending by up to 60%.</p>
      </header>

      <main className="max-w-[1800px] mx-auto px-6 pb-20 space-y-10">
        {/* Quick reference */}
        <div className="bg-white rounded-2xl p-8 shadow-sm">
          <h2 className="text-xl font-semibold mb-6">Cheapest Models by Provider</h2>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
            {['OpenAI', 'Anthropic', 'Google', 'DeepSeek', 'Groq'].map(provider => {
              const models = ALL_MODELS.filter(m => m.provider === provider).sort((a, b) => a.inputPricePer1M - b.inputPricePer1M)
              const cheapest = models[0]
              if (!cheapest) return null
              return (
                <div key={provider} className="text-center p-5 rounded-2xl bg-[#f5f5f7] border border-[#e8e8ed] hover:shadow-sm transition-shadow">
                  <div
                    className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-[10px] font-bold mx-auto mb-2"
                    style={{ backgroundColor: PROVIDER_COLORS[provider] }}
                  >
                    {provider.slice(0, 2).toUpperCase()}
                  </div>
                  <div className="text-xs text-[#86868b] mb-1 uppercase tracking-wide">{provider}</div>
                  <div className="text-sm font-semibold">{cheapest.name}</div>
                  <div className="text-sm font-mono text-[#0071e3] font-medium mt-1">${cheapest.inputPricePer1M}/1M</div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Strategies */}
        <div className="space-y-4">
          {STRATEGIES.map((s, i) => (
            <details key={i} className="bg-white rounded-2xl shadow-sm group" open={i < 2}>
              <summary className="cursor-pointer p-7 list-none flex items-start gap-5">
                <span className="text-3xl shrink-0 mt-0.5">{s.icon}</span>
                <div className="flex-1">
                  <div className="flex items-center gap-3 flex-wrap">
                    <h3 className="text-lg font-semibold">{s.title}</h3>
                    <span className="text-xs font-semibold text-[#30d158] bg-[#30d158]/10 px-3 py-1 rounded-full">Save up to {s.saving}</span>
                  </div>
                  <p className="text-sm text-[#86868b] mt-2 leading-relaxed">{s.desc}</p>
                </div>
                <span className="text-[#0071e3] group-open:rotate-90 transition-transform text-lg mt-2 shrink-0">›</span>
              </summary>
              <div className="px-7 pb-7 pl-[4.5rem]">
                <div className="bg-[#f5f5f7] rounded-xl p-5 border border-[#e8e8ed]">
                  <div className="text-xs text-[#86868b] mb-2 font-semibold uppercase tracking-wide">Real example</div>
                  <p className="text-sm font-mono text-[#1d1d1f] leading-relaxed">{s.example}</p>
                </div>
              </div>
            </details>
          ))}
        </div>

        {/* Before/After */}
        <div className="bg-white rounded-2xl p-8 shadow-sm">
          <h2 className="text-xl font-semibold mb-6">Before vs After Optimization</h2>
          <div className="grid sm:grid-cols-2 gap-6">
            <div className="p-6 rounded-2xl bg-[#fef2f2] border border-red-200">
              <div className="text-xs text-[#ef4444] font-semibold uppercase tracking-wide mb-3">❌ Before</div>
              <ul className="text-sm space-y-2 text-[#1d1d1f]">
                <li className="flex items-start gap-2"><span className="text-[#ef4444] mt-0.5">•</span> GPT-4o for all queries</li>
                <li className="flex items-start gap-2"><span className="text-[#ef4444] mt-0.5">•</span> No prompt caching</li>
                <li className="flex items-start gap-2"><span className="text-[#ef4444] mt-0.5">•</span> Verbose 1000-token outputs</li>
                <li className="flex items-start gap-2"><span className="text-[#ef4444] mt-0.5">•</span> Real-time calls only</li>
              </ul>
              <div className="mt-4 pt-3 border-t border-red-200/60">
                <span className="text-2xl font-bold text-[#ef4444] font-mono">~$4,500</span>
                <span className="text-sm text-[#ef4444]/70 ml-1">/month</span>
              </div>
            </div>
            <div className="p-6 rounded-2xl bg-[#f0fdf4] border border-green-200">
              <div className="text-xs text-[#10a37f] font-semibold uppercase tracking-wide mb-3">✅ After</div>
              <ul className="text-sm space-y-2 text-[#1d1d1f]">
                <li className="flex items-start gap-2"><span className="text-[#10a37f] mt-0.5">•</span> 60% routed to GPT-4o Mini</li>
                <li className="flex items-start gap-2"><span className="text-[#10a37f] mt-0.5">•</span> Prompt caching enabled (70% hit)</li>
                <li className="flex items-start gap-2"><span className="text-[#10a37f] mt-0.5">•</span> Constrained to 300-token outputs</li>
                <li className="flex items-start gap-2"><span className="text-[#10a37f] mt-0.5">•</span> Batch API for non-real-time</li>
              </ul>
              <div className="mt-4 pt-3 border-t border-green-200/60">
                <span className="text-2xl font-bold text-[#10a37f] font-mono">~$1,800</span>
                <span className="text-sm text-[#10a37f]/70 ml-1">/month</span>
              </div>
            </div>
          </div>
          <div className="text-center mt-6">
            <span className="inline-block text-3xl font-bold text-[#10a37f] bg-[#10a37f]/10 px-6 py-3 rounded-2xl">
              ↓ 60% cost reduction
            </span>
          </div>
        </div>

        {/* FAQ */}
        <div className="bg-white rounded-2xl p-8 shadow-sm">
          <h2 className="text-xl font-semibold mb-6">FAQ</h2>
          <div className="space-y-4">
            <Faq q="How much can I save with prompt caching?" a="Prompt caching gives 50% off input tokens. If 70% of your input tokens are cached (common for apps with fixed system prompts), you save ~35% on total input costs. For GPT-4o at 10K input × 1K calls/day, that's $131/month saved." />
            <Faq q="Is it worth switching from OpenAI to DeepSeek?" a="For cost-sensitive workloads, yes. DeepSeek V4 Flash costs $0.14/1M input vs GPT-4o's $2.50/1M — an 18x reduction. However, test quality first: DeepSeek may lag on nuanced English, code generation, or complex reasoning compared to GPT-4o." />
            <Faq q="What is OpenAI Batch API?" a="OpenAI Batch API lets you submit requests to be processed within 24 hours at 50% discount. Perfect for classification, embedding generation, data extraction, and any non-real-time workload. Submit up to 100K requests per batch file." />
          </div>
        </div>

        {/* CTA */}
        <div className="text-center py-6 flex flex-wrap justify-center gap-4">
          <a href="/llm-pricing/llm-cost-calculator/" className="inline-block bg-[#0071e3] text-white px-8 py-3.5 rounded-2xl font-medium text-base hover:bg-[#0077ED] transition-colors shadow-sm hover:shadow-md">
            Calculate Your Savings →
          </a>
          <a href="/llm-pricing/llm-cost-comparison/" className="inline-block border-2 border-[#0071e3] text-[#0071e3] px-8 py-3.5 rounded-2xl font-medium text-base hover:bg-[#0071e3]/5 transition-colors">
            Compare All Models
          </a>
        </div>
      </main>
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
