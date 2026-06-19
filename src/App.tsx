import { useState, useCallback } from 'react'
import { PromptInput } from './components/PromptInput'
import { UsageSlider } from './components/UsageSlider'
import { ComparisonTable } from './components/ComparisonTable'
import { StaticPricingTable } from './components/StaticPricingTable'
import { GlobalNav } from './components/GlobalNav'
import { RelatedTools } from './components/RelatedTools'
import { FaqSchema } from './components/FaqSchema'
import { SiteFooter } from './components/SiteFooter'
import { PriceChurn } from './components/PriceChurn'
import { calculateCosts } from './lib/calculator'
import type { ModelCostResult, ModelPricing } from './lib/types'
import pricingData from './data/pricing.json'

const models = pricingData.models as ModelPricing[]

const FAQ_ITEMS = [
  { q: 'How accurate is the token count?', a: 'For OpenAI models (GPT-5.5, GPT-5.4, o3, o4-mini), we use tiktoken for exact counts. For Claude, Gemini, and other models, we estimate based on ~4 characters per token for English text and ~1.5 characters for Chinese text. The cost estimates are accurate enough for budgeting purposes.' },
  { q: 'Which AI models are supported?', a: 'We support models across 8 providers: OpenAI (GPT-5.5, GPT-5.4, GPT-5.4 Mini, GPT-4o, GPT-4o Mini, o3, o4-mini), Anthropic (Fable 5, Claude Opus 4.8, Sonnet 4.6, Haiku 4.5, 3.7 Sonnet, 3.5 Haiku, 3 Opus, 3 Haiku), Google (Gemini 3.1 Pro, 3.5 Flash, 2.5 Pro, 2.5 Flash, 2.5 Flash-Lite, 2.0 Flash, 2.0 Flash-Lite, 1.5 Pro, 1.5 Flash, 1.5 Flash-8B), DeepSeek (V4 Flash, V4 Pro), Groq (Llama 4 Maverick), xAI (Grok 4.20), Zhipu (GLM-5.2), and Moonshot (Kimi K2.7).' },
  { q: 'How often is pricing updated?', a: 'Pricing data is updated weekly from official provider pricing pages. AI providers change their pricing frequently, so we strive to keep the data current.' },
  { q: 'Is this tool free?', a: 'Yes, completely free. No login required. No API keys needed. All calculations happen in your browser.' },
  { q: 'What is a token?', a: 'A token is the basic unit that AI models use to process text. Roughly, 1 token equals 4 characters in English or about 0.75 words. A typical sentence is 10–20 tokens. AI providers charge based on the number of tokens processed.' },
  { q: 'How do I reduce my AI costs?', a: 'Three strategies: (1) Use cheaper models for simple tasks (e.g., GPT-5.4 Mini instead of GPT-5.5). (2) Shorten your prompts to reduce input tokens. (3) Use models with free tiers for testing (Gemini Flash, Groq).' },
  { q: 'Can I use this for batch calculations?', a: 'Not yet. Batch calculation (uploading a CSV of prompts) is planned for a future version.' },
  { q: 'Does this include batch API pricing?', a: 'Currently we show standard API pricing. Batch API pricing (typically 50% cheaper) is not yet included but is coming soon.' },
]

function App() {
  const [prompt, setPrompt] = useState('')
  const [callsPerMonth, setCallsPerMonth] = useState(1000)
  const [expectedOutputTokens, setExpectedOutputTokens] = useState(1024)
  const [results, setResults] = useState<ModelCostResult[]>([])
  const [isLoading, setIsLoading] = useState(false)

  const handleCalculate = useCallback(async () => {
    if (!prompt.trim()) {
      setResults([])
      return
    }
    setIsLoading(true)
    try {
      const costs = await calculateCosts(prompt, expectedOutputTokens, callsPerMonth, models)
      setResults(costs)
    } finally {
      setIsLoading(false)
    }
  }, [prompt, expectedOutputTokens, callsPerMonth])

  const handlePromptChange = useCallback((value: string) => {
    setPrompt(value)
  }, [])

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      handleCalculate()
    }
  }, [handleCalculate])

  return (
    <div className="min-h-screen bg-[#f5f5f7] text-[#1d1d1f]" onKeyDown={handleKeyDown}>
      <GlobalNav current="/" />
      <div className="max-w-[980px] mx-auto px-6">
        {/* Hero */}
        <header className="pt-20 pb-16 text-center">
          <h1 className="text-5xl md:text-6xl font-bold tracking-tight text-[#1d1d1f] mb-4">
            AI Prompt Cost
            <br />
            <span className="bg-gradient-to-r from-[#0071E3] to-[#40A0FF] bg-clip-text text-transparent">
              Calculator
            </span>
          </h1>
          <p className="text-lg md:text-xl text-[#86868b] max-w-xl mx-auto leading-relaxed">
            Compare LLM API pricing across {models.length} models: GPT‑5.5, Claude 3.7, Gemini 2.0, DeepSeek V4 &amp; more.
            Know your AI costs before you send.
          </p>
        </header>

        {/* Calculator Card */}
        <div className="bg-white rounded-3xl shadow-[0_2px_20px_rgba(0,0,0,0.06)] border border-[#e8e8ed] p-8 md:p-10 space-y-8 mb-24">
          <PromptInput
            prompt={prompt}
            onPromptChange={handlePromptChange}
            isLoading={isLoading}
          />

          <UsageSlider
            callsPerMonth={callsPerMonth}
            onCallsChange={setCallsPerMonth}
            expectedOutputTokens={expectedOutputTokens}
            onOutputTokensChange={setExpectedOutputTokens}
          />

          <button
            onClick={handleCalculate}
            disabled={!prompt.trim() || isLoading}
            className="w-full py-3.5 px-6 bg-[#0071E3] hover:bg-[#0077ED] disabled:bg-[#d2d2d7] disabled:cursor-not-allowed text-white font-medium rounded-full transition-all duration-200 cursor-pointer active:scale-[0.98]"
          >
            Calculate Costs
            <span className="text-white/60 ml-2 text-sm">⌘↵</span>
          </button>

          {results.length > 0 && (
            <ComparisonTable results={results} />
          )}
        </div>

        {/* Static Pricing Table */}
        <section className="mb-16">
          <StaticPricingTable />
        </section>

        {/* Provider Price Churn */}
        <PriceChurn />

        {/* SEO: LLM API Pricing */}
        <section className="max-w-[780px] mx-auto mb-16 space-y-12">
          <div>
            <h2 className="text-2xl font-semibold tracking-tight mb-3">
              LLM API Pricing Comparison (2026)
            </h2>
            <div className="text-[#86868b] leading-relaxed space-y-3">
              <p>
                LLM API pricing varies dramatically across providers. As of June 2026, the cheapest text model
                (Gemini 2.5 Flash-Lite) costs $0.10 per 1M input tokens, while the most expensive
                (Claude 3 Opus) costs $15.00 — a 150× difference for the same text.
              </p>
              <p>
                OpenAI's GPT-5.5 leads at $5/$30 per 1M tokens for complex reasoning tasks.
                For budget-conscious developers, DeepSeek V4 Flash offers strong performance at $0.14/$0.28,
                and Google's Gemini 2.5 Flash provides production-ready quality at $0.30/$2.50.
                The table above shows current pricing for all major providers.
              </p>
            </div>
          </div>

          <div>
            <h2 className="text-2xl font-semibold tracking-tight mb-3">
              LLM Cost per Token Explained
            </h2>
            <div className="text-[#86868b] leading-relaxed space-y-3">
              <p>
                LLM providers charge per token, not per word or character. One token is roughly 4 characters
                of English text, or about ¾ of a word. A typical 1,000-word article uses about 1,300 tokens.
                Most providers charge separately for input tokens (your prompt) and output tokens (the model's response),
                with output tokens typically costing 3–6× more than input.
              </p>
              <p>
                For example, sending a 500-token prompt to GPT-5.4 costs $0.00125 in input fees.
                If the model generates 1,000 tokens in response, that adds $0.015 in output fees.
                At 1,000 calls per month, this works out to roughly $16.25/month. Use the calculator above
                to estimate costs for your actual usage patterns.
              </p>
            </div>
          </div>

          <div>
            <h2 className="text-2xl font-semibold tracking-tight mb-3">
              How to Choose the Right LLM API
            </h2>
            <div className="text-[#86868b] leading-relaxed space-y-3">
              <p>
                Pick your model based on task complexity and budget. For simple tasks (classification, extraction,
                short answers), start with GPT-5.4 Mini ($0.75/$4.50) or Gemini 2.5 Flash-Lite ($0.10/$0.40).
                These models handle 90% of production workloads at a fraction of the cost.
              </p>
              <p>
                For complex reasoning, coding, or professional work, step up to GPT-5.4 ($2.50/$15) or
                Claude 3.7 Sonnet ($3/$15). Reserve the most expensive models — GPT-5.5 ($5/$30) and
                Claude Opus 4.8 ($5/$25) — for tasks that genuinely need frontier intelligence.
                A practical approach: prototype with cheap models, then upgrade only where quality demands it.
              </p>
            </div>
          </div>

          <div>
            <h2 className="text-2xl font-semibold tracking-tight mb-3">
              Pricing Guides & Deep Dives
            </h2>
            <div className="text-[#86868b] leading-relaxed space-y-3">
              <p>
                Go deeper on cost and tooling. See every model in our{' '}
                <a href="/llm-pricing/compare-all/" className="text-[#0071E3] hover:text-[#0077ED] underline">complete pricing comparison of all 31 models</a>,
                browse the{' '}
                <a href="/alternatives-guide/" className="text-[#0071E3] hover:text-[#0077ED] underline">self-hosted alternatives guide covering 46 tools</a>,
                or follow the{' '}
                <a href="/guides/ai-api-costs/" className="text-[#0071E3] hover:text-[#0077ED] underline">5-step guide to estimating AI API costs</a>.
              </p>
            </div>
          </div>
        </section>

        {/* How It Works */}
        <section className="mb-24">
          <h2 className="text-3xl md:text-4xl font-bold text-center tracking-tight mb-12">
            How the AI cost calculator works.
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                step: '01',
                title: 'Paste your prompt',
                desc: 'Drop in the prompt you plan to send. Any length works.',
              },
              {
                step: '02',
                title: 'Set your usage',
                desc: 'Adjust monthly call volume and expected output length.',
              },
              {
                step: '03',
                title: 'Compare & save',
                desc: 'See costs for all major AI models. Pick the cheapest.',
              },
            ].map((item) => (
              <div key={item.step} className="text-center">
                <div className="text-5xl font-bold bg-gradient-to-b from-[#0071E3] to-[#40A0FF] bg-clip-text text-transparent mb-4">
                  {item.step}
                </div>
                <h3 className="text-lg font-semibold text-[#1d1d1f] mb-2">{item.title}</h3>
                <p className="text-[#86868b] text-[15px] leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* FAQ */}
        <section className="mb-24">
          <h2 className="text-3xl md:text-4xl font-bold text-center tracking-tight mb-12">
            Frequently asked questions.
          </h2>
          <div className="max-w-2xl mx-auto">
            {FAQ_ITEMS.map((item, i) => (
              <details
                key={i}
                className={`border-t border-[#e8e8ed] ${i === 7 ? 'border-b' : ''}`}
              >
                <summary className="py-5 text-[15px] font-medium text-[#1d1d1f] cursor-pointer hover:text-[#0071E3] transition-colors">
                  {item.q}
                </summary>
                <div className="pb-5 text-[15px] text-[#86868b] leading-relaxed pr-8">
                  {item.a}
                </div>
              </details>
            ))}
          </div>
        </section>

        <RelatedTools currentPath="/" />
        <FaqSchema items={FAQ_ITEMS.map(f => ({ question: f.q, answer: f.a }))} />
      </div>
      <SiteFooter />
    </div>
  )
}

export default App
