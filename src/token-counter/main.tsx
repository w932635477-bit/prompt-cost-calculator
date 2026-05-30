import { createRoot } from 'react-dom/client'
import { useState, useEffect, useCallback } from 'react'
import '../index.css'
import { countTokens } from '../lib/tokenizer'
import { GlobalNav } from '../components/GlobalNav'
import { EmailCapture } from '../components/EmailCapture'
import pricing from '../data/pricing.json'

const MODEL_GROUPS = [
  { label: 'OpenAI', models: pricing.models.filter(m => m.provider === 'OpenAI') },
  { label: 'Anthropic', models: pricing.models.filter(m => m.provider === 'Anthropic') },
  { label: 'Google', models: pricing.models.filter(m => m.provider === 'Google') },
  { label: 'Groq', models: pricing.models.filter(m => m.provider === 'Groq') },
  { label: 'DeepSeek', models: pricing.models.filter(m => m.provider === 'DeepSeek') },
].filter(g => g.models.length > 0)

const SAMPLE_TEXT = `You are a helpful assistant. Answer the user's question clearly and concisely.

User: What is the capital of France?
Assistant: The capital of France is Paris.`

function TokenCounterApp() {
  const [text, setText] = useState(SAMPLE_TEXT)
  const [modelId, setModelId] = useState('gpt-4o')
  const [tokens, setTokens] = useState(0)
  const [counting, setCounting] = useState(false)

  const count = useCallback(async (inputText: string, inputModel: string) => {
    if (!inputText.trim()) { setTokens(0); return }
    setCounting(true)
    try {
      const n = await countTokens(inputText, inputModel)
      setTokens(n)
    } catch {
      setTokens(0)
    } finally {
      setCounting(false)
    }
  }, [])

  useEffect(() => { count(text, modelId) }, [text, modelId, count])

  const selectedModel = pricing.models.find(m => m.id === modelId)
  const charCount = text.length
  const wordCount = text.trim() ? text.trim().split(/\s+/).length : 0
  const selectedGroup = MODEL_GROUPS.find(g => g.models.some(m => m.id === modelId))

  return (
    <div className="min-h-screen bg-[#f5f5f7]">
      <GlobalNav current="/token-counter/" />

      <main className="max-w-[780px] mx-auto px-6 py-10">
        {/* Hero */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-semibold text-[#1d1d1f] tracking-tight mb-3">
            Token Counter Online
          </h1>
          <p className="text-[#86868b] text-lg leading-relaxed">
            Count tokens for GPT-4o, Claude, Gemini, Llama &amp; DeepSeek before your API calls.
            Free, accurate, no login required.
          </p>
        </div>

        {/* Model selector */}
        <div className="mb-3 flex items-center gap-3">
          <label htmlFor="model-select" className="text-sm font-medium text-[#1d1d1f]">Model:</label>
          <select
            id="model-select"
            value={modelId}
            onChange={e => setModelId(e.target.value)}
            className="bg-white border border-[#e8e8ed] rounded-lg px-3 py-2 text-sm text-[#1d1d1f] focus:outline-none focus:ring-2 focus:ring-[#0071E3]"
          >
            {MODEL_GROUPS.map(g => (
              <optgroup key={g.label} label={g.label}>
                {g.models.map(m => (
                  <option key={m.id} value={m.id}>{m.name}</option>
                ))}
              </optgroup>
            ))}
          </select>
          {selectedGroup && (
            <span className="text-xs text-[#86868b]">
              {selectedGroup.label} {selectedModel ? `· $${selectedModel.inputPricePer1M}/1M tokens` : ''}
            </span>
          )}
        </div>

        {/* Text area + stats */}
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden mb-6">
          <textarea
            value={text}
            onChange={e => setText(e.target.value)}
            placeholder="Paste your prompt or text here to count tokens..."
            rows={10}
            className="w-full p-5 text-sm font-mono text-[#1d1d1f] resize-y focus:outline-none border-none"
          />
          <div className="border-t border-[#e8e8ed] px-5 py-3 flex items-center gap-6 text-sm">
            <div className="flex items-center gap-1.5">
              <span className="text-[#86868b]">Tokens:</span>
              <span className="font-semibold text-[#0071E3] text-lg">
                {counting ? '...' : tokens.toLocaleString()}
              </span>
            </div>
            <div className="text-[#86868b]">
              {charCount.toLocaleString()} chars
            </div>
            <div className="text-[#86868b]">
              {wordCount.toLocaleString()} words
            </div>
            <div className="text-[#86868b]">
              ~{Math.ceil(tokens / 750)} pages
            </div>
          </div>
        </div>

        {/* Quick estimate table */}
        <div className="bg-white rounded-2xl shadow-sm p-5 mb-10">
          <h2 className="text-base font-semibold text-[#1d1d1f] mb-3">
            Token Count Across Models
          </h2>
          <p className="text-sm text-[#86868b] mb-4">
            Same text, different tokenizers. OpenAI models use tiktoken (exact), others are estimated.
          </p>
          <TokenCompareTable text={text} />
        </div>

        {/* SEO: Token Counter for Claude */}
        <section className="mb-8">
          <h2 className="text-xl font-semibold text-[#1d1d1f] mb-3">
            Token Counter for Claude
          </h2>
          <p className="text-sm text-[#86868b] leading-relaxed">
            Count tokens for Anthropic Claude Sonnet 4 and Claude Haiku 4.
            Anthropic does not publish their tokenizer, so we estimate based on character analysis:
            roughly 4 characters per token for English, 1.5 characters for CJK text.
            The estimate is typically within 5-10% of actual token usage.
            Claude models have a 200K context window, so knowing your token count helps
            you stay within limits and estimate API costs.
          </p>
        </section>

        {/* SEO: Token Counter for Gemini */}
        <section className="mb-8">
          <h2 className="text-xl font-semibold text-[#1d1d1f] mb-3">
            Token Counter for Gemini
          </h2>
          <p className="text-sm text-[#86868b] leading-relaxed">
            Count tokens for Google Gemini 2.5 Pro and Gemini 2.5 Flash.
            Google uses a different tokenizer than OpenAI, so token counts will differ.
            Gemini 2.5 Pro supports up to 1M input tokens with a 64K output window,
            making token counting essential for large document processing.
            Use this counter before sending prompts to estimate your Gemini API costs.
          </p>
        </section>

        {/* SEO: Token Counter for OpenAI */}
        <section className="mb-8">
          <h2 className="text-xl font-semibold text-[#1d1d1f] mb-3">
            Token Counter for OpenAI
          </h2>
          <p className="text-sm text-[#86868b] leading-relaxed">
            Count tokens for GPT-4o, GPT-4o Mini, o3, and o4-mini using tiktoken.
            This gives you the exact token count that OpenAI's API will charge you for.
            OpenAI charges per token for both input and output, so knowing your prompt
            token count helps you estimate costs before making API calls.
            GPT-4o has a 128K context window, GPT-4o Mini has 128K, and o3/o4-mini support 200K.
          </p>
        </section>

        {/* SEO: Token Counter for Python */}
        <section className="mb-8">
          <h2 className="text-xl font-semibold text-[#1d1d1f] mb-3">
            Token Counter for Python
          </h2>
          <div className="text-sm text-[#86868b] leading-relaxed space-y-2">
            <p>
              To count tokens in Python for OpenAI models, use the tiktoken library:
            </p>
            <pre className="bg-[#1d1d1f] text-[#f5f5f7] rounded-lg p-4 text-xs overflow-x-auto font-mono">
{`pip install tiktoken

import tiktoken
enc = tiktoken.encoding_for_model("gpt-4o")
tokens = enc.encode("Your text here")
print(len(tokens))  # token count`}
            </pre>
            <p>
              For Claude and Gemini, use the token counting endpoints in their respective APIs.
              This website gives you instant token counts without installing any libraries.
            </p>
          </div>
        </section>

        {/* SEO: How to Count Tokens Online */}
        <section className="mb-10">
          <h2 className="text-xl font-semibold text-[#1d1d1f] mb-3">
            How to Count Tokens Online
          </h2>
          <div className="text-sm text-[#86868b] leading-relaxed space-y-2">
            <p>Three steps to count tokens for your LLM prompts:</p>
            <ol className="list-decimal list-inside space-y-1 ml-2">
              <li><strong className="text-[#1d1d1f]">Paste your text</strong> — prompts, documents, or any text you plan to send to an AI API.</li>
              <li><strong className="text-[#1d1d1f]">Select your model</strong> — different models use different tokenizers, so token counts vary.</li>
              <li><strong className="text-[#1d1d1f]">Get instant count</strong> — see exact tokens (OpenAI) or estimated tokens (Claude, Gemini).</li>
            </ol>
            <p>
              Why count tokens? AI providers charge by the token. A prompt with 1,000 tokens costs
              different amounts depending on the model. Knowing your token count before making API calls
              helps you compare costs and optimize your prompts.
            </p>
          </div>
        </section>

        {/* Footer */}
        <footer className="border-t border-[#e8e8ed] pt-6 text-center text-sm text-[#86868b]">
          <p>Free online token counter. No login required. All calculations happen in your browser.</p>
          <p className="mt-2">
            <a href="/" className="text-[#0071E3] hover:underline">AI Cost Calculator</a>
            <span className="mx-1.5">&middot;</span>
            <a href="/token-tracker/" className="text-[#0071E3] hover:underline">Token Tracker</a>
            <span className="mx-1.5">&middot;</span>
            <a href="/prompt-cache-calculator/" className="text-[#0071E3] hover:underline">Cache Calculator</a>
          </p>
        </footer>
      </main>
    </div>
  )
}

function TokenCompareTable({ text }: { text: string }) {
  const [counts, setCounts] = useState<Record<string, number>>({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    async function countAll() {
      setLoading(true)
      const results: Record<string, number> = {}
      // One model per provider is enough for comparison
      const repModels = [
        { id: 'gpt-4o', name: 'GPT-4o' },
        { id: 'claude-sonnet-4-20250514', name: 'Claude Sonnet 4' },
        { id: 'gemini-2.5-pro', name: 'Gemini 2.5 Pro' },
        { id: 'llama-4-maverick', name: 'Llama 4 Maverick' },
        { id: 'deepseek-r1', name: 'DeepSeek R1' },
      ]
      for (const m of repModels) {
        results[m.id] = await countTokens(text, m.id)
      }
      if (!cancelled) { setCounts(results); setLoading(false) }
    }
    countAll()
    return () => { cancelled = true }
  }, [text])

  if (loading) return <div className="text-sm text-[#86868b]">Counting across models...</div>

  const maxCount = Math.max(...Object.values(counts), 1)

  return (
    <div className="space-y-2">
      {[
        { id: 'gpt-4o', name: 'GPT-4o' },
        { id: 'claude-sonnet-4-20250514', name: 'Claude Sonnet 4' },
        { id: 'gemini-2.5-pro', name: 'Gemini 2.5 Pro' },
        { id: 'llama-4-maverick', name: 'Llama 4 Maverick' },
        { id: 'deepseek-r1', name: 'DeepSeek R1' },
      ].map(m => (
        <div key={m.id} className="flex items-center gap-3">
          <span className="text-sm text-[#1d1d1f] w-36 shrink-0">{m.name}</span>
          <div className="flex-1 bg-[#f5f5f7] rounded-full h-6 overflow-hidden">
            <div
              className="bg-[#0071E3] h-full rounded-full transition-all duration-300"
              style={{ width: `${((counts[m.id] || 0) / maxCount) * 100}%` }}
            />
          </div>
          <span className="text-sm font-mono text-[#1d1d1f] w-16 text-right">
            {counts[m.id] || 0}
          </span>
        </div>
      ))}
    </div>
  )
}

createRoot(document.getElementById('root')!).render(
  <>
    <TokenCounterApp />
    <EmailCapture source="token-counter" />
  </>,
)
