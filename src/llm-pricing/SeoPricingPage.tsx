// src/llm-pricing/SeoPricingPage.tsx
// Renders a single-model pricing detail page for SEO long-tail.

import { useMemo } from 'react'
import pricing from '../data/pricing.json'
import type { ModelPricing } from '../lib/types'
import { GlobalNav } from '../components/GlobalNav'
import { projectMonthlyCost, formatCost } from './calc'
import type { CostParams } from './calc'

const ALL_MODELS = pricing.models as ModelPricing[]

// Map model IDs to their SEO page slugs for internal linking
const MODEL_SLUGS: Record<string, string> = {
  'gpt-5.5': 'gpt-5-5-pricing',
  'gpt-5.4': 'gpt-5-4-pricing',
  'gpt-5.4-mini': 'gpt-5-4-mini-pricing',
  'gpt-4o': 'gpt-4o-pricing',
  'gpt-4o-mini': 'gpt-4o-mini-pricing',
  'o3': 'o3-pricing',
  'o4-mini': 'o4-mini-pricing',
  'claude-3.7-sonnet-20250219': 'claude-3-7-sonnet-pricing',
  'claude-3-5-haiku-20241022': 'claude-3-5-haiku-pricing',
  'claude-3-opus-20240229': 'claude-3-opus-pricing',
  'claude-3-haiku-20240307': 'claude-3-haiku-pricing',
  'gemini-2.0-flash': 'gemini-2-0-flash-pricing',
  'gemini-2.0-flash-lite': 'gemini-2-0-flash-lite-pricing',
  'gemini-1.5-pro': 'gemini-1-5-pro-pricing',
  'gemini-1.5-flash': 'gemini-1-5-flash-pricing',
  'deepseek-v4-flash': 'deepseek-v4-flash-pricing',
  'deepseek-v4-pro': 'deepseek-v4-pro-pricing',
  'llama-4-maverick': 'llama-4-maverick-pricing',
  'gemini-2-5-flash': 'gemini-2-5-flash-pricing',
  'gemini-2-5-flash-lite': 'gemini-2-5-flash-lite-pricing',
}
import { useState } from 'react'

interface SeoPageData {
  slug: string
  modelId: string
  title: string
  h1: string
  description: string
  keywords: string[]
}

function getModel(slug: string) {
  return ALL_MODELS.find(m => m.id === slug)
}

const DEFAULT_PARAMS: CostParams = {
  inputTokens: 100_000,
  outputTokens: 10_000,
  callsPerDay: 100,
  cacheHitRate: 0.5,
  daysPerMonth: 30,
}

export default function SeoPricingPage() {
  const pageData = useMemo<SeoPageData | null>(() => {
    const el = document.getElementById('seo-data')
    if (!el) return null
    try { return JSON.parse(el.textContent || '{}') } catch { return null }
  }, [])

  const model = useMemo(() => pageData ? getModel(pageData.modelId) : null, [pageData])

  if (!pageData || !model) {
    return (
      <div className="min-h-screen bg-[#f5f5f7]">
        <GlobalNav current="/llm-pricing/" />
        <div className="max-w-[980px] mx-auto px-4 py-20 text-center">
          <h1 className="text-2xl font-semibold">Model not found</h1>
          <a href="/llm-pricing/" className="text-[#0071e3] mt-4 inline-block">← Back to pricing comparison</a>
        </div>
      </div>
    )
  }

  const competitors = ALL_MODELS
    .filter(m => m.id !== model.id)
    .sort((a, b) => a.inputPricePer1M - b.inputPricePer1M)
    .slice(0, 6)

  return (
    <div className="min-h-screen bg-[#f5f5f7] text-[#1d1d1f]">
      <GlobalNav current="/llm-pricing/" />

      <header className="max-w-[980px] mx-auto px-4 pt-12 pb-6">
        {/* Breadcrumb */}
        <nav className="text-[12px] text-[#86868b] mb-2" aria-label="Breadcrumb">
          <a href="/" className="hover:text-[#0071E3]">Home</a>
          <span className="mx-1.5">/</span>
          <a href="/llm-pricing/" className="hover:text-[#0071E3]">LLM Pricing</a>
          <span className="mx-1.5">/</span>
          <span className="text-[#1d1d1f]">{pageData.h1.replace(' API Pricing', '')}</span>
        </nav>
        <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight mt-4">{pageData.h1}</h1>
        <p className="text-lg text-[#86868b] mt-2">{model.provider} · {model.name}</p>
        {model.bestFor && (
          <p className="text-sm text-[#86868b] mt-1">Best for: {model.bestFor}</p>
        )}
      </header>

      <main className="max-w-[980px] mx-auto px-4 pb-16 space-y-8">
        {/* Price card */}
        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <h2 className="text-xl font-semibold mb-4">Pricing Breakdown (per 1M tokens)</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <PriceCard label="Input" value={`$${model.inputPricePer1M.toFixed(4)}`} />
            <PriceCard label="Output" value={`$${model.outputPricePer1M.toFixed(4)}`} />
            {model.cachedInputPricePer1M != null && (
              <PriceCard label="Cached Input" value={`$${model.cachedInputPricePer1M.toFixed(4)}`} highlight />
            )}
            <PriceCard label="Context Window" value={`${(model.contextWindow / 1000).toFixed(0)}K`} />
          </div>
          <div className="mt-4 text-xs text-[#86868b]">
            Source: <a href={model.sourceUrl} target="_blank" rel="noopener noreferrer" className="underline">Official pricing page</a>
            · Last verified: {model.priceUpdatedAt}
          </div>
        </div>

        {/* DeepSeek API Quick Start — only for deepseek models */}
        {model.id.startsWith('deepseek') && (
          <DeepSeekQuickStart modelId={model.id} />
        )}

        {/* Cost calculator */}
        <ModelCostCalculator model={model} />

        {/* Competitor comparison */}
        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <h2 className="text-xl font-semibold mb-4">Compare with Other Models</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[#e8e8ed]">
                  <th className="text-left py-2 pr-4 font-medium text-[#86868b]">Model</th>
                  <th className="text-right py-2 px-4 font-medium text-[#86868b]">Input $/1M</th>
                  <th className="text-right py-2 px-4 font-medium text-[#86868b]">Output $/1M</th>
                  <th className="text-right py-2 px-4 font-medium text-[#86868b]">Cache $/1M</th>
                  <th className="text-right py-2 pl-4 font-medium text-[#86868b]">Context</th>
                </tr>
              </thead>
              <tbody>
                <tr className="bg-[#0071e3]/5 border-b border-[#e8e8ed] font-medium">
                  <td className="py-2.5 pr-4">{model.provider} {model.name}</td>
                  <td className="text-right py-2.5 px-4">${model.inputPricePer1M.toFixed(4)}</td>
                  <td className="text-right py-2.5 px-4">${model.outputPricePer1M.toFixed(4)}</td>
                  <td className="text-right py-2.5 px-4">{model.cachedInputPricePer1M != null ? `$${model.cachedInputPricePer1M.toFixed(4)}` : '—'}</td>
                  <td className="text-right py-2.5 pl-4">{(model.contextWindow / 1000).toFixed(0)}K</td>
                </tr>
                {competitors.map(c => {
                  const slug = MODEL_SLUGS[c.id]
                  const href = slug ? `/llm-pricing/${slug}/` : '/llm-pricing/'
                  return (
                  <tr key={c.id} className="border-b border-[#e8e8ed] hover:bg-[#f5f5f7] transition-colors">
                    <td className="py-2.5 pr-4">
                      <a href={href} className="text-[#1d1d1f] hover:text-[#0071e3] transition-colors">
                        {c.provider} {c.name}
                      </a>
                    </td>
                    <td className="text-right py-2.5 px-4">${c.inputPricePer1M.toFixed(4)}</td>
                    <td className="text-right py-2.5 px-4">${c.outputPricePer1M.toFixed(4)}</td>
                    <td className="text-right py-2.5 px-4">{c.cachedInputPricePer1M != null ? `$${c.cachedInputPricePer1M.toFixed(4)}` : '—'}</td>
                    <td className="text-right py-2.5 pl-4">{(c.contextWindow / 1000).toFixed(0)}K</td>
                  </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* DeepSeek V4 Flash vs Pro comparison — only for deepseek models */}
        {model.id === 'deepseek-v4-flash' && <DeepSeekVsSection />}

        {/* FAQ */}
        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <h2 className="text-xl font-semibold mb-4">{model.name} FAQ</h2>
          <div className="space-y-3">
            {generateFAQ(model).map(({ q, a }) => (
              <details key={q} className="group">
                <summary className="cursor-pointer font-medium py-2 list-none flex items-center gap-2">
                  <span className="text-[#0071e3] group-open:rotate-90 transition-transform text-lg">›</span>
                  {q}
                </summary>
                <p className="text-sm text-[#86868b] pl-6 pb-2">{a}</p>
              </details>
            ))}
          </div>
          <p className="text-xs text-[#86868b]/60 mt-4">Last updated: June 2026</p>
        </div>

        {/* Related Model Pricing Pages */}
        <RelatedModelLinks currentModelId={model.id} />

        {/* CTA */}
        <div className="text-center py-4">
          <a
            href="/llm-pricing/"
            className="inline-block bg-[#0071e3] text-white px-6 py-3 rounded-xl font-medium hover:bg-[#0077ED] transition-colors"
          >
            Compare All LLM Prices →
          </a>
        </div>
      </main>
    </div>
  )
}

function PriceCard({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className={`rounded-xl p-4 ${highlight ? 'bg-[#30d158]/10 border border-[#30d158]/20' : 'bg-[#f5f5f7]'}`}>
      <div className="text-xs text-[#86868b] mb-1">{label}</div>
      <div className="text-xl font-semibold">{value}</div>
    </div>
  )
}

function ModelCostCalculator({ model }: { model: ModelPricing }) {
  const [params, setParams] = useState(DEFAULT_PARAMS)

  const cost = useMemo(
    () => projectMonthlyCost(model, params),
    [model, params]
  )

  const update = <K extends keyof CostParams>(k: K, v: CostParams[K]) =>
    setParams(p => ({ ...p, [k]: v }))

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm">
      <h2 className="text-xl font-semibold mb-4">Monthly Cost Calculator</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        <div>
          <label className="text-xs text-[#86868b] block mb-1">Input tokens per call</label>
          <input
            type="number" value={params.inputTokens}
            onChange={e => update('inputTokens', Number(e.target.value))}
            className="w-full border border-[#e8e8ed] rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#0071e3]/40 focus:border-[#0071e3]"
          />
        </div>
        <div>
          <label className="text-xs text-[#86868b] block mb-1">Output tokens per call</label>
          <input
            type="number" value={params.outputTokens}
            onChange={e => update('outputTokens', Number(e.target.value))}
            className="w-full border border-[#e8e8ed] rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#0071e3]/40 focus:border-[#0071e3]"
          />
        </div>
        <div>
          <label className="text-xs text-[#86868b] block mb-1">Calls per day</label>
          <input
            type="number" value={params.callsPerDay}
            onChange={e => update('callsPerDay', Number(e.target.value))}
            className="w-full border border-[#e8e8ed] rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#0071e3]/40 focus:border-[#0071e3]"
          />
        </div>
        <div>
          <label className="text-xs text-[#86868b] block mb-1">Cache hit rate: {Math.round(params.cacheHitRate * 100)}%</label>
          <input
            type="range" min={0} max={100} value={params.cacheHitRate * 100}
            onChange={e => update('cacheHitRate', Number(e.target.value) / 100)}
            className="w-full accent-[#0071e3]"
          />
        </div>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Result label="Per call" value={formatCost(cost.totalCostPerCall)} />
        <Result label="Daily" value={formatCost(cost.monthlyCost / 30)} />
        <Result label="Monthly" value={formatCost(cost.monthlyCost)} bold />
        <Result label="Cache savings" value={formatCost(cost.cacheSavings)} green />
      </div>
    </div>
  )
}

function Result({ label, value, bold, green }: { label: string; value: string; bold?: boolean; green?: boolean }) {
  return (
    <div className="text-center">
      <div className="text-xs text-[#86868b] mb-1">{label}</div>
      <div className={`text-lg ${bold ? 'font-semibold' : ''} ${green ? 'text-[#30d158]' : ''}`}>{value}</div>
    </div>
  )
}

function generateFAQ(m: ModelPricing) {
  const faq = [
    {
      q: `How much does ${m.name} cost per 1M tokens?`,
      a: `${m.name} costs $${m.inputPricePer1M} per 1M input tokens and $${m.outputPricePer1M} per 1M output tokens.${m.cachedInputPricePer1M != null ? ` Cached input tokens cost $${m.cachedInputPricePer1M} per 1M.` : ''}`,
    },
    {
      q: `Is ${m.name} cheap or expensive?`,
      a: m.inputPricePer1M <= 0.5
        ? `${m.name} is one of the more affordable LLM APIs at $${m.inputPricePer1M}/1M input tokens. It competes with other budget models.`
        : m.inputPricePer1M <= 3
        ? `${m.name} is mid-range at $${m.inputPricePer1M}/1M input tokens. It balances cost and capability.`
        : `${m.name} is a premium model at $${m.inputPricePer1M}/1M input tokens. Use it for tasks where quality justifies the cost.`,
    },
    {
      q: `What is the context window of ${m.name}?`,
      a: `${m.name} supports a context window of ${(m.contextWindow / 1000).toFixed(0)}K tokens (${(m.contextWindow / 1_000_000).toFixed(m.contextWindow >= 1_000_000 ? 0 : 1)}M tokens).`,
    },
  ]
  if (m.cachedInputPricePer1M != null) {
    const savings = ((1 - m.cachedInputPricePer1M / m.inputPricePer1M) * 100).toFixed(0)
    faq.push({
      q: `Does ${m.name} support prompt caching?`,
      a: `Yes. ${m.provider} offers cached input at $${m.cachedInputPricePer1M}/1M tokens — a ${savings}% discount over the base input price. This helps with repeated system prompts and few-shot examples.`,
    })
  }
  return faq
}

const DEEPSEEK_VS_DATA = [
  { metric: 'Input Price', flash: '$0.14/1M', pro: '$0.435/1M', note: 'Flash is 3.1× cheaper' },
  { metric: 'Output Price', flash: '$0.28/1M', pro: '$0.87/1M', note: 'Flash is 3.1× cheaper' },
  { metric: 'Cached Input', flash: '$0.0197/1M', pro: '$0.0036/1M', note: 'Pro cache is 82% cheaper' },
  { metric: 'Context Window', flash: '1M tokens', pro: '1M tokens', note: 'Same' },
  { metric: 'Best For', flash: 'Chatbots, classification, summarization', pro: 'Complex reasoning, coding, analysis' },
  { metric: 'Use When', flash: 'Cost matters more than peak quality', pro: 'Quality matters more than cost' },
]

function DeepSeekVsSection() {
  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm">
      <h2 className="text-xl font-semibold mb-4">DeepSeek V4 Flash vs V4 Pro — Which to Choose?</h2>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[#e8e8ed]">
              <th className="text-left py-2 pr-4 font-medium text-[#86868b]">Metric</th>
              <th className="text-center py-2 px-4 font-medium text-[#30d158]">V4 Flash</th>
              <th className="text-center py-2 px-4 font-medium text-[#0071e3]">V4 Pro</th>
              <th className="text-left py-2 pl-4 font-medium text-[#86868b]">Notes</th>
            </tr>
          </thead>
          <tbody>
            {DEEPSEEK_VS_DATA.map(row => (
              <tr key={row.metric} className="border-b border-[#e8e8ed]">
                <td className="py-2.5 pr-4 font-medium">{row.metric}</td>
                <td className="text-center py-2.5 px-4">{row.flash}</td>
                <td className="text-center py-2.5 px-4">{row.pro}</td>
                <td className="text-xs text-[#86868b] py-2.5 pl-4">{row.note}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="text-xs text-[#86868b] mt-3">
        V4 Flash is 97% cheaper than GPT-5.5 on input tokens. For most production workloads, Flash delivers the best price-performance ratio.
        Compare <a href="/llm-pricing/deepseek-v4-pro-pricing/" className="text-[#0071e3] hover:underline">DeepSeek V4 Pro pricing</a> for the full breakdown.
      </p>
    </div>
  )
}

const RELATED_MODELS: Record<string, { label: string; slug: string }[]> = {
  'deepseek-v4-flash': [
    { label: 'DeepSeek V4 Pro', slug: 'deepseek-v4-pro-pricing' },
    { label: 'GPT-4o Mini', slug: 'gpt-4o-mini-pricing' },
    { label: 'Gemini 2.0 Flash', slug: 'gemini-2-0-flash-pricing' },
    { label: 'Claude 3.5 Haiku', slug: 'claude-3-5-haiku-pricing' },
    { label: 'Gemini 1.5 Flash', slug: 'gemini-1-5-flash-pricing' },
    { label: 'O4 Mini', slug: 'o4-mini-pricing' },
  ],
  'deepseek-v4-pro': [
    { label: 'DeepSeek V4 Flash', slug: 'deepseek-v4-flash-pricing' },
    { label: 'GPT-5.4', slug: 'gpt-5-4-pricing' },
    { label: 'Claude 3.7 Sonnet', slug: 'claude-3-7-sonnet-pricing' },
    { label: 'Gemini 2.0 Flash', slug: 'gemini-2-0-flash-pricing' },
    { label: 'GPT-4o', slug: 'gpt-4o-pricing' },
    { label: 'O3', slug: 'o3-pricing' },
  ],
}

function RelatedModelLinks({ currentModelId }: { currentModelId: string }) {
  const related = RELATED_MODELS[currentModelId]
  if (!related || related.length === 0) return null
  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm">
      <h2 className="text-lg font-semibold mb-3">Related Model Pricing</h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
        {related.map(m => (
          <a key={m.slug} href={`/llm-pricing/${m.slug}/`}
            className="text-sm text-[#0071e3] hover:underline py-1.5 px-3 rounded-lg hover:bg-[#f5f5f7] transition-colors"
          >{m.label}</a>
        ))}
      </div>
    </div>
  )
}

function DeepSeekQuickStart({ modelId }: { modelId: string }) {
  const isFlash = modelId === 'deepseek-v4-flash'
  const modelName = isFlash ? 'DeepSeek V4 Flash' : 'DeepSeek V4 Pro'

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm">
      <h2 className="text-xl font-semibold mb-4">DeepSeek API Quick Start</h2>

      <p className="text-sm text-[#86868b] mb-4">
        {modelName} uses the OpenAI-compatible API format. Switch your base URL and keep your existing SDK code.
      </p>

      <div className="bg-gray-900 rounded-lg p-4 mb-6 overflow-x-auto">
        <pre className="text-sm text-green-400 font-mono whitespace-pre"><code>{`import OpenAI from 'openai'

const client = new OpenAI({
  baseURL: 'https://api.deepseek.com',
  apiKey: process.env.DEEPSEEK_API_KEY,
})

const response = await client.chat.completions.create({
  model: '${isFlash ? 'deepseek-chat' : 'deepseek-reasoner'}',
  messages: [{ role: 'user', content: 'Hello' }],
})`}</code></pre>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
        <div className="bg-[#f5f5f7] rounded-xl p-4">
          <h3 className="font-semibold text-sm mb-2">When to use V4 Flash</h3>
          <ul className="text-sm text-[#86868b] space-y-1">
            <li>• Chatbots and Q&A at scale</li>
            <li>• Document classification</li>
            <li>• Summarization pipelines</li>
            <li>• Translation and extraction</li>
            <li>• Budget-conscious production apps</li>
          </ul>
        </div>
        <div className="bg-[#f5f5f7] rounded-xl p-4">
          <h3 className="font-semibold text-sm mb-2">When to use V4 Pro</h3>
          <ul className="text-sm text-[#86868b] space-y-1">
            <li>• Complex reasoning tasks</li>
            <li>• Code generation and debugging</li>
            <li>• Multi-step analysis</li>
            <li>• Math and science problems</li>
            <li>• When quality matters more than cost</li>
          </ul>
        </div>
      </div>

      <div className="text-xs text-[#86868b] border-t border-[#e8e8ed] pt-3">
        DeepSeek API is compatible with the <code className="bg-[#f5f5f7] px-1 rounded">openai</code> npm package.
        Set <code className="bg-[#f5f5f7] px-1 rounded">baseURL: &apos;https://api.deepseek.com&apos;</code> and use your DeepSeek API key.
        Get a key at{' '}
        <a href="https://platform.deepseek.com" target="_blank" rel="noopener noreferrer" className="text-[#0071e3] underline">
          platform.deepseek.com
        </a>.
      </div>
    </div>
  )
}
