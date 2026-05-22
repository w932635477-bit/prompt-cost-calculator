import { useState, useCallback } from 'react'
import { PromptInput } from './components/PromptInput'
import { UsageSlider } from './components/UsageSlider'
import { ComparisonTable } from './components/ComparisonTable'
import { calculateCosts } from './lib/calculator'
import type { ModelCostResult, ModelPricing } from './lib/types'
import pricingData from './data/pricing.json'

const models = pricingData.models as ModelPricing[]

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
    <div className="min-h-screen bg-[#fbfbfd] text-[#1d1d1f]" onKeyDown={handleKeyDown}>
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
            Compare API pricing across GPT‑4o, Claude Sonnet 4, Gemini 2.5, Llama 4 &amp; DeepSeek R1.
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
            className="w-full py-3.5 px-6 bg-[#0071E3] hover:bg-[#0077ED] disabled:bg-[#d2d2d7] disabled:cursor-not-allowed text-white font-medium rounded-xl transition-all duration-200 cursor-pointer active:scale-[0.98]"
          >
            Calculate Costs
            <span className="text-white/60 ml-2 text-sm">⌘↵</span>
          </button>

          {results.length > 0 && (
            <ComparisonTable results={results} />
          )}
        </div>

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
            {[
              {
                q: 'How accurate is the token count?',
                a: 'For OpenAI models (GPT-4o, o3, o4-mini), we use tiktoken for exact counts. For Claude, Gemini, and other models, we estimate based on ~4 characters per token for English text and ~1.5 characters for Chinese text. The cost estimates are accurate enough for budgeting purposes.',
              },
              {
                q: 'Which AI models are supported?',
                a: 'We support 10 models: GPT-4o, GPT-4o Mini, o3, o4-mini (OpenAI), Claude Sonnet 4, Claude Haiku 4 (Anthropic), Gemini 2.5 Pro, Gemini 2.5 Flash (Google), Llama 4 Maverick (Groq), and DeepSeek R1.',
              },
              {
                q: 'How often is pricing updated?',
                a: 'Pricing data is updated weekly from official provider pricing pages. AI providers change their pricing frequently, so we strive to keep the data current.',
              },
              {
                q: 'Is this tool free?',
                a: 'Yes, completely free. No login required. No API keys needed. All calculations happen in your browser.',
              },
              {
                q: 'What is a token?',
                a: 'A token is the basic unit that AI models use to process text. Roughly, 1 token equals 4 characters in English or about 0.75 words. A typical sentence is 10–20 tokens. AI providers charge based on the number of tokens processed.',
              },
              {
                q: 'How do I reduce my AI costs?',
                a: 'Three strategies: (1) Use cheaper models for simple tasks (e.g., GPT-4o Mini instead of GPT-4o). (2) Shorten your prompts to reduce input tokens. (3) Use models with free tiers for testing (Gemini Flash, Groq).',
              },
              {
                q: 'Can I use this for batch calculations?',
                a: 'Not yet. Batch calculation (uploading a CSV of prompts) is planned for a future version.',
              },
              {
                q: 'Does this include batch API pricing?',
                a: 'Currently we show standard API pricing. Batch API pricing (typically 50% cheaper) is not yet included but is coming soon.',
              },
            ].map((item, i) => (
              <details
                key={i}
                className={`border-t border-[#e8e8ed] ${i === 7 ? 'border-b' : ''}`}
              >
                <summary className="py-5 text-[15px] font-medium text-[#1d1d1f] cursor-pointer hover:text-[#0071E3] transition-colors flex items-center justify-between">
                  {item.q}
                  <span className="text-[#86868b] text-xs group-open:rotate-180 transition-transform duration-200">▼</span>
                </summary>
                <div className="pb-5 text-[15px] text-[#86868b] leading-relaxed pr-8">
                  {item.a}
                </div>
              </details>
            ))}
          </div>
        </section>

        {/* Footer */}
        <footer className="py-8 border-t border-[#e8e8ed] text-center">
          <p className="text-sm text-[#86868b]">
            AI Prompt Cost Calculator · Free &amp; open source
          </p>
          <p className="mt-2 text-xs text-[#86868b]">
            Pricing data sourced from{' '}
            <a href="https://openai.com/pricing" className="underline hover:text-[#1d1d1f] transition-colors" target="_blank" rel="noopener noreferrer">OpenAI</a>,{' '}
            <a href="https://www.anthropic.com/pricing" className="underline hover:text-[#1d1d1f] transition-colors" target="_blank" rel="noopener noreferrer">Anthropic</a>,{' '}
            <a href="https://ai.google/pricing" className="underline hover:text-[#1d1d1f] transition-colors" target="_blank" rel="noopener noreferrer">Google</a>,{' '}
            <a href="https://groq.com/pricing" className="underline hover:text-[#1d1d1f] transition-colors" target="_blank" rel="noopener noreferrer">Groq</a>, and{' '}
            <a href="https://deepseek.com/pricing" className="underline hover:text-[#1d1d1f] transition-colors" target="_blank" rel="noopener noreferrer">DeepSeek</a>.
          </p>
        </footer>
      </div>
    </div>
  )
}

export default App
