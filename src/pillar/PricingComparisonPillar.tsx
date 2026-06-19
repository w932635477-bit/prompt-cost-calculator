// Pillar Page: AI Model Pricing Comparison 2026
// Hub page linking to all 25 model pricing pages.

import pricing from '../data/pricing.json'
import type { ModelPricing } from '../lib/types'
import { GlobalNav } from '../components/GlobalNav'
import { RelatedTools } from '../components/RelatedTools'

const ALL_MODELS = pricing.models as ModelPricing[]

const PROVIDER_COLORS: Record<string, string> = {
  OpenAI: '#10a37f',
  Anthropic: '#d97706',
  Google: '#4285f4',
  DeepSeek: '#6366f1',
  Groq: '#f55036',
  xAI: '#111827',
  Zhipu: '#7c3aed',
  Moonshot: '#db2777',
}

const PROVIDER_ORDER = ['OpenAI', 'Anthropic', 'Google', 'DeepSeek', 'Groq', 'xAI', 'Zhipu', 'Moonshot'] as const

// SEO slug mapping (from pricing-seo-data.ts)
const MODEL_SLUGS: Record<string, string> = {
  'gpt-5.5': 'gpt-5-5-pricing',
  'gpt-5.4': 'gpt-5-4-pricing',
  'gpt-5.4-mini': 'gpt-5-4-mini-pricing',
  'gpt-4o': 'gpt-4o-pricing',
  'gpt-4o-mini': 'gpt-4o-mini-pricing',
  'o3': 'o3-pricing',
  'o4-mini': 'o4-mini-pricing',
  'claude-3.7-sonnet-20250219': 'claude-3-7-sonnet-pricing',
  'claude-3.5-haiku-20241022': 'claude-3-5-haiku-pricing',
  'claude-3-opus-20240229': 'claude-3-opus-pricing',
  'claude-3-haiku-20240307': 'claude-3-haiku-pricing',
  'gemini-2.0-flash': 'gemini-2-0-flash-pricing',
  'gemini-2.0-flash-lite': 'gemini-2-0-flash-lite-pricing',
  'gemini-1.5-pro': 'gemini-1-5-pro-pricing',
  'gemini-1.5-flash': 'gemini-1-5-flash-pricing',
  'gemini-1.5-flash-8b': 'gemini-1-5-flash-8b-pricing',
  'deepseek-v4-flash': 'deepseek-v4-flash-pricing',
  'deepseek-v4-pro': 'deepseek-v4-pro-pricing',
  'claude-opus-4-8': 'claude-opus-4-8-pricing',
  'claude-sonnet-4-6': 'claude-sonnet-4-6-pricing',
  'claude-haiku-4-5': 'claude-haiku-4-5-pricing',
  'gemini-3-5-flash': 'gemini-3-5-flash-pricing',
  'gemini-2-5-flash': 'gemini-2-5-flash-pricing',
  'gemini-2-5-flash-lite': 'gemini-2-5-flash-lite-pricing',
  'llama-4-maverick': 'llama-4-maverick-pricing',
}

function formatCtx(ctx: number): string {
  if (ctx >= 1_000_000) return `${ctx / 1_000_000}M`
  if (ctx >= 1_000) return `${ctx / 1_000}K`
  return String(ctx)
}

function formatPrice(price: number | undefined): string {
  if (price === undefined) return '—'
  if (price < 0.01) return `$${price.toFixed(4)}`
  if (price < 1) return `$${price.toFixed(3)}`
  return `$${price.toFixed(2)}`
}

export default function PricingComparisonPillar() {
  const byProvider = PROVIDER_ORDER.map(p => ({
    provider: p,
    models: ALL_MODELS.filter(m => m.provider === p),
    color: PROVIDER_COLORS[p] || '#666',
  })).filter(g => g.models.length > 0)

  const allSorted = [...ALL_MODELS].sort((a, b) => a.inputPricePer1M - b.inputPricePer1M)
  const cheapest = allSorted[0]
  const mostExpensive = allSorted[allSorted.length - 1]
  const avgInput = ALL_MODELS.reduce((s, m) => s + m.inputPricePer1M, 0) / ALL_MODELS.length

  return (
    <div className="min-h-screen bg-[#f5f5f7] text-[#1d1d1f]">
      <GlobalNav current="/llm-pricing/" />

      {/* Hero */}
      <section className="bg-white border-b border-[#e8e8ed]">
        <div className="px-6 lg:px-12 pt-14 pb-10">
          <nav className="text-sm text-[#86868b] mb-3">
            <a href="/" className="hover:text-[#0071e3]">Home</a>
            <span className="mx-2">/</span>
            <a href="/llm-pricing/" className="hover:text-[#0071e3]">LLM Pricing</a>
            <span className="mx-2">/</span>
            <span className="text-[#1d1d1f]">Compare All Models</span>
          </nav>
          <h1 className="text-3xl lg:text-5xl font-semibold tracking-tight">
            AI Model Pricing Comparison 2026
          </h1>
          <p className="text-lg text-[#86868b] mt-3 max-w-3xl">
            Complete pricing for {ALL_MODELS.length} AI models across {PROVIDER_ORDER.length} providers.
            Input, output, cached token pricing, and context windows — all in one place.
          </p>
        </div>
      </section>

      <div className="px-6 lg:px-12 py-8 space-y-8 max-w-[1400px] mx-auto">

        {/* Quick stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white rounded-2xl border border-[#e8e8ed] p-6">
            <div className="text-sm text-[#86868b] mb-1">Cheapest Model</div>
            <div className="text-2xl font-semibold">{cheapest.name}</div>
            <div className="text-[#10a37f] font-medium mt-1">{formatPrice(cheapest.inputPricePer1M)}/1M input</div>
          </div>
          <div className="bg-white rounded-2xl border border-[#e8e8ed] p-6">
            <div className="text-sm text-[#86868b] mb-1">Average Input Price</div>
            <div className="text-2xl font-semibold">{formatPrice(avgInput)}</div>
            <div className="text-[#86868b] text-sm mt-1">per 1M tokens across {ALL_MODELS.length} models</div>
          </div>
          <div className="bg-white rounded-2xl border border-[#e8e8ed] p-6">
            <div className="text-sm text-[#86868b] mb-1">Price Range</div>
            <div className="text-2xl font-semibold">{Math.round(mostExpensive.inputPricePer1M / cheapest.inputPricePer1M)}×</div>
            <div className="text-[#86868b] text-sm mt-1">from cheapest to most expensive</div>
          </div>
        </div>

        {/* Provider sections */}
        {byProvider.map(group => (
          <section key={group.provider} className="bg-white rounded-2xl border border-[#e8e8ed] overflow-hidden">
            <div className="px-6 py-4 border-b border-[#e8e8ed] flex items-center gap-3">
              <span
                className="w-3 h-3 rounded-full shrink-0"
                style={{ backgroundColor: group.color }}
              />
              <h2 className="text-xl font-semibold">{group.provider}</h2>
              <span className="text-sm text-[#86868b]">{group.models.length} models</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-[#e8e8ed] bg-[#f5f5f7]/50">
                    <th className="text-left py-3 px-4 font-medium text-[#86868b]">Model</th>
                    <th className="text-right py-3 px-4 font-medium text-[#86868b]">Input /1M</th>
                    <th className="text-right py-3 px-4 font-medium text-[#86868b]">Output /1M</th>
                    <th className="text-right py-3 px-4 font-medium text-[#86868b]">Cached /1M</th>
                    <th className="text-right py-3 px-4 font-medium text-[#86868b]">Context</th>
                    <th className="text-right py-3 px-4 font-medium text-[#86868b]">Detail</th>
                  </tr>
                </thead>
                <tbody>
                  {group.models.map(m => {
                    const slug = MODEL_SLUGS[m.id]
                    return (
                      <tr key={m.id} className="border-b border-[#e8e8ed] last:border-0 hover:bg-[#f5f5f7]/30">
                        <td className="py-3 px-4">
                          <div className="font-medium text-[#1d1d1f]">{m.name}</div>
                          <div className="text-xs text-[#86868b]">{m.bestFor}</div>
                        </td>
                        <td className="py-3 px-4 text-right font-mono font-medium">${m.inputPricePer1M}</td>
                        <td className="py-3 px-4 text-right font-mono">${m.outputPricePer1M}</td>
                        <td className="py-3 px-4 text-right font-mono text-[#10a37f]">
                          {m.cachedInputPricePer1M ? `$${m.cachedInputPricePer1M}` : '—'}
                        </td>
                        <td className="py-3 px-4 text-right text-[#86868b]">{formatCtx(m.contextWindow)}</td>
                        <td className="py-3 px-4 text-right">
                          {slug ? (
                            <a href={`/llm-pricing/${slug}/`} className="text-[#0071e3] hover:underline text-xs">
                              Pricing →
                            </a>
                          ) : (
                            <a href="/llm-pricing/" className="text-[#0071e3] hover:underline text-xs">
                              Compare →
                            </a>
                          )}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </section>
        ))}

        {/* Cost guides */}
        <section className="bg-white rounded-2xl border border-[#e8e8ed] p-6">
          <h2 className="text-xl font-semibold mb-4">Cost Guides</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              { slug: 'llm-cost-calculator', title: 'LLM Cost Calculator', desc: 'Estimate monthly spending for any model with your actual usage' },
              { slug: 'llm-cost-comparison', title: 'Cost Comparison', desc: 'Side-by-side cost analysis with real numbers at 1K calls/day' },
              { slug: 'llm-cost-optimization', title: 'Cost Optimization', desc: '7 strategies to cut your API spending by 60%' },
            ].map(g => (
              <a
                key={g.slug}
                href={`/llm-pricing/${g.slug}/`}
                className="block p-4 rounded-xl border border-[#e8e8ed] hover:border-[#0071e3]/30 hover:bg-[#0071e3]/5 transition-colors"
              >
                <div className="font-medium text-[#0071e3] mb-1">{g.title}</div>
                <div className="text-sm text-[#86868b]">{g.desc}</div>
              </a>
            ))}
          </div>
        </section>

        {/* Key findings */}
        <section className="bg-white rounded-2xl border border-[#e8e8ed] p-6">
          <h2 className="text-xl font-semibold mb-4">Key Findings (June 2026)</h2>
          <div className="space-y-4">
            <div className="flex gap-3">
              <span className="text-lg">💰</span>
              <div>
                <div className="font-medium">Gemini 1.5 Flash-8B at ${cheapest ? '' : ''}$0.0375/1M is the cheapest model</div>
                <div className="text-sm text-[#86868b]">Google's smallest model costs less than 1 cent per million input tokens</div>
              </div>
            </div>
            <div className="flex gap-3">
              <span className="text-lg">⚡</span>
              <div>
                <div className="font-medium">Prompt caching saves 75-98% on input</div>
                <div className="text-sm text-[#86868b]">All major providers offer steep discounts for cached input tokens</div>
              </div>
            </div>
            <div className="flex gap-3">
              <span className="text-lg">📊</span>
              <div>
                <div className="font-medium">Output tokens cost 3-6× more than input</div>
                <div className="text-sm text-[#86868b]">Reducing output length is the fastest way to cut costs</div>
              </div>
            </div>
            <div className="flex gap-3">
              <span className="text-lg">🔄</span>
              <div>
                <div className="font-medium">Prices dropped 30-67% since 2024</div>
                <div className="text-sm text-[#86868b]">Competition between providers drives aggressive price cuts every quarter</div>
              </div>
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section className="bg-white rounded-2xl border border-[#e8e8ed] p-6">
          <h2 className="text-xl font-semibold mb-4">Frequently Asked Questions</h2>
          <div className="space-y-5">
            {[
              { q: 'Which AI model is cheapest per token?', a: 'Google Gemini 1.5 Flash-8B at $0.0375/1M input is cheapest. For production quality at low cost, DeepSeek V4 Flash ($0.14/1M) and GPT-4o Mini ($0.15/1M) offer the best balance.' },
              { q: 'How often do LLM API prices change?', a: 'Major providers update pricing every 3-6 months. In 2025-2026, prices dropped 30-67% as competition intensified. We verify pricing weekly from official provider pages.' },
              { q: 'What is prompt caching?', a: 'Prompt caching stores repeated input (system prompts, few-shot examples) so you only pay full price for new tokens. Providers offer 75-98% discounts on cached input. If your app sends the same system prompt with every request, caching can cut input costs by 80-90%.' },
              { q: 'Should I always use the cheapest model?', a: 'No. The cheapest model may require more retries or longer prompts to achieve the same result. A model that costs 3× more but works on the first try is cheaper than a budget model that needs 3 retries. Route complex queries to premium models and simple queries to budget ones.' },
              { q: 'How do I estimate my monthly LLM costs?', a: 'Use our cost calculator at /llm-pricing/llm-cost-calculator/. Enter your average prompt length, response length, calls per day, and cache hit rate to get a monthly estimate for all models.' },
              { q: 'Which provider has the best free tier?', a: 'Google offers the most generous free tier with Gemini models (up to 15 RPM free). OpenAI offers $5 in free credits for new accounts. Anthropic doesn\'t have a free tier but offers $5 in credits for new API keys.' },
            ].map((faq, i) => (
              <div key={i}>
                <h3 className="font-semibold text-[#1d1d1f]">{faq.q}</h3>
                <p className="text-[#86868b] mt-1.5 leading-relaxed">{faq.a}</p>
              </div>
            ))}
          </div>
        </section>

        <RelatedTools currentPath="/llm-pricing/" />

        <div className="text-center py-6 text-sm text-[#86868b]">
          <p>Pricing verified weekly from official provider pages. Last update: June 2026.</p>
        </div>
      </div>
    </div>
  )
}
