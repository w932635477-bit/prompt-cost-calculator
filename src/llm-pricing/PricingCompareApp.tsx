// src/llm-pricing/PricingCompareApp.tsx

import { useState, useMemo } from 'react'
import pricing from '../data/pricing.json'
import type { ModelPricing } from '../lib/types'
import { GlobalNav } from '../components/GlobalNav'
import { RelatedTools } from '../components/RelatedTools'
import SortablePricingTable from './components/SortablePricingTable'
import CostCalculator from './components/CostCalculator'
import ProviderFilter from './components/ProviderFilter'
import type { Provider } from './components/ProviderFilter'

const LAST_UPDATED = pricing.lastUpdated
const MODELS = pricing.models as ModelPricing[]

export default function PricingCompareApp() {
  const providers = useMemo(
    () => [...new Set(MODELS.map(m => m.provider))] as Provider[],
    []
  )

  const [selectedProviders, setSelectedProviders] = useState<Set<Provider>>(
    () => new Set(providers)
  )

  const toggleProvider = (p: Provider) => {
    setSelectedProviders(prev => {
      const next = new Set(prev)
      if (next.has(p)) {
        if (next.size > 1) next.delete(p)
      } else {
        next.add(p)
      }
      return next
    })
  }

  const filteredModels = useMemo(
    () => MODELS.filter(m => selectedProviders.has(m.provider as Provider)),
    [selectedProviders]
  )

  return (
    <div className="min-h-screen bg-[#f5f5f7] text-[#1d1d1f]">
      <GlobalNav current="/llm-pricing/" />

      <header className="max-w-[980px] mx-auto px-4 pt-12 pb-6 text-center">
        <h1 className="text-4xl sm:text-5xl font-semibold tracking-tight mb-3">
          LLM API Pricing Compare
        </h1>
        <p className="text-lg text-[#86868b] max-w-2xl mx-auto">
          Side-by-side pricing for {MODELS.length} models across {providers.length} providers.
          All prices per 1M tokens.
        </p>
        <p className="text-sm text-[#86868b] mt-2">
          Updated {LAST_UPDATED} · Source: official provider pricing pages
        </p>
      </header>

      <main className="max-w-[980px] mx-auto px-4 pb-16 space-y-8">
        {/* Provider filter */}
        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <h2 className="text-sm font-medium text-[#86868b] mb-3">Filter by provider</h2>
          <ProviderFilter
            selected={selectedProviders}
            onToggle={toggleProvider}
            availableProviders={providers}
          />
        </div>

        {/* Pricing table */}
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          <div className="px-6 pt-6 pb-2">
            <h2 className="text-2xl font-semibold tracking-tight">
              Pricing Table
            </h2>
            <p className="text-sm text-[#86868b] mt-1">
              Click column headers to sort. All prices in USD per 1M tokens.
            </p>
          </div>
          <SortablePricingTable models={filteredModels} />
          <div className="px-6 py-3 border-t border-[#e8e8ed]">
            <p className="text-xs text-[#86868b]">
              Prices sourced from official provider pages. Cache pricing from{' '}
              <a
                href="https://docs.anthropic.com/en/docs/about-claude/models"
                className="underline"
                target="_blank"
                rel="noopener noreferrer"
              >
                Anthropic
              </a>
              ,{' '}
              <a
                href="https://platform.openai.com/docs/guides/prompt-caching"
                className="underline"
                target="_blank"
                rel="noopener noreferrer"
              >
                OpenAI
              </a>
              ,{' '}
              <a
                href="https://ai.google.dev/gemini-api/docs/caching"
                className="underline"
                target="_blank"
                rel="noopener noreferrer"
              >
                Google
              </a>
              ,{' '}
              <a
                href="https://api-docs.deepseek.com/quick_start/pricing"
                className="underline"
                target="_blank"
                rel="noopener noreferrer"
              >
                DeepSeek
              </a>
              . Groq does not offer cached token pricing.
            </p>
          </div>
        </div>

        {/* Cost calculator */}
        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <CostCalculator models={filteredModels} />
        </div>

        {/* FAQ */}
        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <h2 className="text-2xl font-semibold tracking-tight mb-4">
            Frequently Asked Questions
          </h2>
          <div className="space-y-3">
            {[
              {
                q: 'How often is the pricing data updated?',
                a: 'We verify pricing from official provider pages regularly. Each model shows its last-verified date. LLM pricing changes frequently — always double-check the provider\'s official page before making purchase decisions.',
              },
              {
                q: 'What does "Cached $/1M" mean?',
                a: 'Some providers offer discounted pricing when input tokens are served from a cache. Anthropic, OpenAI, and Google all charge 10% of base input for cached reads. DeepSeek charges just 2%. This can dramatically reduce costs for repeated prompts.',
              },
              {
                q: 'Why is Groq missing cached pricing?',
                a: 'Groq (Llama 4 Maverick) uses a high-throughput inference architecture that does not currently offer separate cached token pricing. All requests are charged at the standard input rate.',
              },
              {
                q: 'Which model is cheapest for production use?',
                a: 'For high-volume tasks, DeepSeek V4 Flash ($0.14/1M input) and Gemini 2.5 Flash-Lite ($0.10/1M input) are the most affordable. For quality-sensitive work, Claude 3.5 Haiku ($0.80/1M) or GPT-5.4 Mini ($0.75/1M) offer a good balance.',
              },
            ].map(({ q, a }) => (
              <details key={q} className="group">
                <summary className="cursor-pointer text-[#1d1d1f] font-medium py-2 list-none flex items-center gap-2">
                  <span className="text-[#0071e3] group-open:rotate-90 transition-transform text-lg">›</span>
                  {q}
                </summary>
                <p className="text-sm text-[#86868b] pl-6 pb-2">{a}</p>
              </details>
            ))}
          </div>
        </div>
        <RelatedTools currentPath="/llm-pricing/" />
      </main>
    </div>
  )
}
