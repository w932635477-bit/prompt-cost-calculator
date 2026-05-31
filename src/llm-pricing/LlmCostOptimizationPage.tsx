// src/llm-pricing/LlmCostOptimizationPage.tsx
// SEO deep page: 7 strategies to cut LLM API costs.

import pricing from '../data/pricing.json'
import type { ModelPricing } from '../lib/types'
import { GlobalNav } from '../components/GlobalNav'

const ALL_MODELS = pricing.models as ModelPricing[]

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

      <header className="max-w-[980px] mx-auto px-4 pt-12 pb-6">
        <a href="/llm-pricing/" className="text-[#0071e3] text-sm hover:underline">← All Models</a>
        <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight mt-4">LLM Cost Optimization</h1>
        <p className="text-lg text-[#86868b] mt-2">7 strategies to cut your AI API spending by up to 60%.</p>
      </header>

      <main className="max-w-[980px] mx-auto px-4 pb-16 space-y-8">
        {/* Quick reference */}
        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <h2 className="text-xl font-semibold mb-4">Cheapest Models by Provider</h2>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
            {['OpenAI', 'Anthropic', 'Google', 'DeepSeek', 'Groq'].map(provider => {
              const models = ALL_MODELS.filter(m => m.provider === provider).sort((a, b) => a.inputPricePer1M - b.inputPricePer1M)
              const cheapest = models[0]
              if (!cheapest) return null
              return (
                <div key={provider} className="text-center p-3 rounded-xl bg-[#f5f5f7]">
                  <div className="text-xs text-[#86868b] mb-1">{provider}</div>
                  <div className="text-sm font-semibold">{cheapest.name}</div>
                  <div className="text-xs font-mono text-[#0071e3]">${cheapest.inputPricePer1M}/1M</div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Strategies */}
        <div className="space-y-4">
          {STRATEGIES.map((s, i) => (
            <details key={i} className="bg-white rounded-2xl shadow-sm group" open={i < 2}>
              <summary className="cursor-pointer p-6 list-none flex items-start gap-4">
                <span className="text-2xl shrink-0">{s.icon}</span>
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <h3 className="text-lg font-semibold">{s.title}</h3>
                    <span className="text-xs font-medium text-[#30d158] bg-[#30d158]/10 px-2 py-0.5 rounded-full">Save up to {s.saving}</span>
                  </div>
                  <p className="text-sm text-[#86868b] mt-1">{s.desc}</p>
                </div>
                <span className="text-[#0071e3] group-open:rotate-90 transition-transform text-lg mt-1 shrink-0">›</span>
              </summary>
              <div className="px-6 pb-6 pl-16">
                <div className="bg-[#f5f5f7] rounded-xl p-4">
                  <div className="text-xs text-[#86868b] mb-1 font-medium">Real example</div>
                  <p className="text-sm font-mono text-[#1d1d1f]">{s.example}</p>
                </div>
              </div>
            </details>
          ))}
        </div>

        {/* Before/After */}
        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <h2 className="text-xl font-semibold mb-4">Before vs After Optimization</h2>
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="p-4 rounded-xl bg-[#fef2f2]">
              <div className="text-xs text-[#ef4444] font-medium mb-2">Before</div>
              <ul className="text-sm space-y-1.5 text-[#1d1d1f]">
                <li>• GPT-4o for all queries</li>
                <li>• No prompt caching</li>
                <li>• Verbose 1000-token outputs</li>
                <li>• Real-time calls only</li>
                <li className="font-semibold pt-1">= ~$4,500/month</li>
              </ul>
            </div>
            <div className="p-4 rounded-xl bg-[#f0fdf4]">
              <div className="text-xs text-[#10a37f] font-medium mb-2">After</div>
              <ul className="text-sm space-y-1.5 text-[#1d1d1f]">
                <li>• 60% routed to GPT-4o Mini</li>
                <li>• Prompt caching enabled (70% hit)</li>
                <li>• Constrained to 300-token outputs</li>
                <li>• Batch API for non-real-time</li>
                <li className="font-semibold pt-1">= ~$1,800/month</li>
              </ul>
            </div>
          </div>
          <div className="text-center mt-4">
            <span className="text-2xl font-bold text-[#10a37f]">60% cost reduction</span>
          </div>
        </div>

        {/* FAQ */}
        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <h2 className="text-xl font-semibold mb-4">FAQ</h2>
          <div className="space-y-3">
            <Faq q="How much can I save with prompt caching?" a="Prompt caching gives 50% off input tokens. If 70% of your input tokens are cached (common for apps with fixed system prompts), you save ~35% on total input costs. For GPT-4o at 10K input × 1K calls/day, that's $131/month saved." />
            <Faq q="Is it worth switching from OpenAI to DeepSeek?" a="For cost-sensitive workloads, yes. DeepSeek V4 Flash costs $0.14/1M input vs GPT-4o's $2.50/1M — an 18x reduction. However, test quality first: DeepSeek may lag on nuanced English, code generation, or complex reasoning compared to GPT-4o." />
            <Faq q="What is OpenAI Batch API?" a="OpenAI Batch API lets you submit requests to be processed within 24 hours at 50% discount. Perfect for classification, embedding generation, data extraction, and any non-real-time workload. Submit up to 100K requests per batch file." />
          </div>
        </div>

        {/* CTA */}
        <div className="text-center py-4 flex flex-wrap justify-center gap-3">
          <a href="/llm-pricing/llm-cost-calculator/" className="inline-block bg-[#0071e3] text-white px-6 py-3 rounded-xl font-medium hover:bg-[#0077ED] transition-colors">
            Calculate Your Savings →
          </a>
          <a href="/llm-pricing/llm-cost-comparison/" className="inline-block border border-[#0071e3] text-[#0071e3] px-6 py-3 rounded-xl font-medium hover:bg-[#0071e3]/5 transition-colors">
            Compare All Models
          </a>
        </div>
      </main>
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
