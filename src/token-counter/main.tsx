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

const PROVIDER_COLORS: Record<string, string> = {
  'gpt-4o': '#10a37f',
  'claude-3-7-sonnet-20250219': '#d97757',
  'gemini-2.0-flash': '#4285f4',
  'llama-4-maverick': '#f97316',
  'deepseek-v4-flash': '#5b6ef7',
}

const COMPARE_MODELS = [
  { id: 'gpt-4o', name: 'GPT-4o', provider: 'OpenAI' },
  { id: 'claude-3-7-sonnet-20250219', name: 'Claude 3.7 Sonnet', provider: 'Anthropic' },
  { id: 'gemini-2.0-flash', name: 'Gemini 2.0 Flash', provider: 'Google' },
  { id: 'llama-4-maverick', name: 'Llama 4 Maverick', provider: 'Groq' },
  { id: 'deepseek-v4-flash', name: 'DeepSeek V4 Flash', provider: 'DeepSeek' },
]

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

  const charCount = text.length
  const wordCount = text.trim() ? text.trim().split(/\s+/).length : 0

  return (
    <div className="min-h-screen bg-[#fbfbfd] text-[#1d1d1f]">
      <GlobalNav current="/token-counter/" />

      <div className="max-w-[980px] mx-auto px-6">
        {/* Hero */}
        <header className="pt-20 pb-12 text-center">
          <h1 className="text-5xl md:text-6xl font-bold tracking-tight text-[#1d1d1f] mb-4">
            Token Counter
            <br />
            <span className="bg-gradient-to-r from-[#0071E3] to-[#40A0FF] bg-clip-text text-transparent">
              Online
            </span>
          </h1>
          <p className="text-lg md:text-xl text-[#86868b] max-w-xl mx-auto leading-relaxed">
            Count tokens for GPT-4o, Claude, Gemini, Llama &amp; DeepSeek.
            Exact counts with tiktoken. Free, no login.
          </p>
        </header>

        {/* Calculator Card */}
        <div className="bg-white rounded-3xl shadow-[0_2px_20px_rgba(0,0,0,0.06)] border border-[#e8e8ed] overflow-hidden mb-6">
          {/* Model Tabs */}
          <div className="border-b border-[#e8e8ed] px-8 pt-6 flex flex-wrap gap-2">
            {MODEL_GROUPS.flatMap(g => g.models.map(m => (
              <button
                key={m.id}
                onClick={() => setModelId(m.id)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 cursor-pointer ${
                  modelId === m.id
                    ? 'bg-[#0071E3] text-white shadow-sm'
                    : 'bg-[#f5f5f7] text-[#86868b] hover:bg-[#e8e8ed]'
                }`}
              >
                {m.name}
              </button>
            )))}
          </div>

          {/* Text area */}
          <textarea
            value={text}
            onChange={e => setText(e.target.value)}
            placeholder="Paste your prompt or text here..."
            rows={8}
            className="w-full px-8 py-6 text-sm font-mono text-[#1d1d1f] resize-y focus:outline-none border-none min-h-[160px]"
          />

          {/* Stats Bar */}
          <div className="border-t border-[#e8e8ed] px-8 py-5 flex items-center justify-between">
            <div className="flex items-center gap-8">
              <div>
                <div className="text-xs text-[#86868b] uppercase tracking-wide mb-0.5">Tokens</div>
                <div className="text-3xl font-bold text-[#0071E3] tabular-nums">
                  {counting ? '...' : tokens.toLocaleString()}
                </div>
              </div>
              <div className="h-10 w-px bg-[#e8e8ed]" />
              <div className="space-y-1">
                <div className="text-sm text-[#86868b]">
                  {charCount.toLocaleString()} <span className="text-xs">characters</span>
                </div>
                <div className="text-sm text-[#86868b]">
                  {wordCount.toLocaleString()} <span className="text-xs">words</span>
                </div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-xs text-[#86868b]">
                {(() => {
                  const m = pricing.models.find(x => x.id === modelId)
                  return m ? `${m.provider} · $${m.inputPricePer1M}/1M tokens` : ''
                })()}
              </div>
              <div className="text-xs text-[#86868b] mt-0.5">
                ~{tokens > 0 ? (tokens / 750).toFixed(1) : 0} pages
              </div>
            </div>
          </div>
        </div>

        {/* Cross-Model Comparison */}
        <div className="bg-white rounded-3xl shadow-[0_2px_20px_rgba(0,0,0,0.06)] border border-[#e8e8ed] p-8 mb-24">
          <h2 className="text-2xl font-semibold tracking-tight mb-2">
            Compare Across Models
          </h2>
          <p className="text-sm text-[#86868b] mb-6">
            Same text, different tokenizers. OpenAI uses tiktoken for exact counts.
          </p>
          <TokenCompareTable text={text} />
        </div>

        {/* Info Sections */}
        <div className="max-w-[780px] mx-auto pb-16 space-y-12">
          {/* Claude */}
          <section>
            <h2 className="text-2xl font-semibold tracking-tight mb-3">
              Token Counter for Claude
            </h2>
            <p className="text-[#86868b] leading-relaxed">
              Count tokens for Anthropic Claude Sonnet 4 and Claude Haiku 4.
              Anthropic does not publish their tokenizer, so we estimate based on character analysis:
              roughly 4 characters per token for English, 1.5 characters for CJK text.
              The estimate is typically within 5-10% of actual token usage.
              Claude models have a 200K context window, so knowing your token count helps
              you stay within limits and estimate API costs.
            </p>
          </section>

          {/* Gemini */}
          <section>
            <h2 className="text-2xl font-semibold tracking-tight mb-3">
              Token Counter for Gemini
            </h2>
            <p className="text-[#86868b] leading-relaxed">
              Count tokens for Google Gemini 2.5 Pro and Gemini 2.5 Flash.
              Google uses a different tokenizer than OpenAI, so token counts will differ.
              Gemini 2.5 Pro supports up to 1M input tokens with a 64K output window,
              making token counting essential for large document processing.
            </p>
          </section>

          {/* OpenAI */}
          <section>
            <h2 className="text-2xl font-semibold tracking-tight mb-3">
              Token Counter for OpenAI
            </h2>
            <p className="text-[#86868b] leading-relaxed">
              Count tokens for GPT-4o, GPT-4o Mini, o3, and o4-mini using tiktoken.
              This gives you the exact token count that OpenAI's API will charge you for.
              GPT-4o has a 128K context window, GPT-4o Mini has 128K, and o3/o4-mini support 200K.
            </p>
          </section>

          {/* Python */}
          <section>
            <h2 className="text-2xl font-semibold tracking-tight mb-3">
              Token Counter for Python
            </h2>
            <div className="text-[#86868b] leading-relaxed space-y-3">
              <p>
                To count tokens in Python for OpenAI models, use the tiktoken library:
              </p>
              <pre className="bg-[#1d1d1f] text-[#f5f5f7] rounded-2xl p-6 text-sm overflow-x-auto font-mono leading-relaxed">
{`pip install tiktoken

import tiktoken
enc = tiktoken.encoding_for_model("gpt-4o")
tokens = enc.encode("Your text here")
print(len(tokens))  # token count`}
              </pre>
              <p>
                For Claude and Gemini, use the token counting endpoints in their respective APIs.
                This website gives you instant counts without installing any libraries.
              </p>
            </div>
          </section>

          {/* How to */}
          <section>
            <h2 className="text-2xl font-semibold tracking-tight mb-3">
              How to Count Tokens Online
            </h2>
            <div className="text-[#86868b] leading-relaxed space-y-3">
              <ol className="list-decimal list-inside space-y-1 ml-1">
                <li><strong className="text-[#1d1d1f]">Paste your text</strong> — prompts, documents, or any text you plan to send to an AI API.</li>
                <li><strong className="text-[#1d1d1f]">Select your model</strong> — different models use different tokenizers, so counts vary.</li>
                <li><strong className="text-[#1d1d1f]">Get instant count</strong> — exact tokens (OpenAI) or estimated tokens (Claude, Gemini).</li>
              </ol>
              <p>
                AI providers charge by the token. Knowing your token count before making API calls
                helps you compare costs and optimize your prompts.
              </p>
            </div>
          </section>

          {/* Footer */}
          <footer className="border-t border-[#e8e8ed] pt-8 text-center text-sm text-[#86868b]">
            <p>Free online token counter. No login required. All calculations in your browser.</p>
            <p className="mt-2">
              <a href="/" className="text-[#0071E3] hover:underline">AI Cost Calculator</a>
              <span className="mx-1.5">&middot;</span>
              <a href="/token-tracker/" className="text-[#0071E3] hover:underline">Token Tracker</a>
              <span className="mx-1.5">&middot;</span>
              <a href="/prompt-cache-calculator/" className="text-[#0071E3] hover:underline">Cache Calculator</a>
            </p>
          </footer>
        </div>
      </div>
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
      for (const m of COMPARE_MODELS) {
        results[m.id] = await countTokens(text, m.id)
      }
      if (!cancelled) { setCounts(results); setLoading(false) }
    }
    countAll()
    return () => { cancelled = true }
  }, [text])

  if (loading) {
    return (
      <div className="flex items-center gap-2 text-sm text-[#86868b]">
        <div className="w-4 h-4 border-2 border-[#0071E3] border-t-transparent rounded-full animate-spin" />
        Counting across models...
      </div>
    )
  }

  const maxCount = Math.max(...Object.values(counts), 1)

  return (
    <div className="space-y-3">
      {COMPARE_MODELS.map(m => {
        const count = counts[m.id] || 0
        const pct = (count / maxCount) * 100
        const color = PROVIDER_COLORS[m.id] || '#0071E3'
        return (
          <div key={m.id} className="flex items-center gap-4">
            <div className="w-32 shrink-0">
              <div className="text-sm font-medium text-[#1d1d1f]">{m.name}</div>
              <div className="text-xs text-[#86868b]">{m.provider}</div>
            </div>
            <div className="flex-1 bg-[#f5f5f7] rounded-full h-3 overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-500 ease-out"
                style={{ width: `${pct}%`, backgroundColor: color }}
              />
            </div>
            <span className="text-sm font-semibold tabular-nums text-[#1d1d1f] w-12 text-right">
              {count}
            </span>
          </div>
        )
      })}
    </div>
  )
}

createRoot(document.getElementById('root')!).render(
  <>
    <TokenCounterApp />
    <EmailCapture source="token-counter" />
  </>,
)
