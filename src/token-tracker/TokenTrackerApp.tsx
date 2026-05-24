import { useState, useEffect, useMemo, useCallback } from 'react'
import { GlobalNav } from '../components/GlobalNav'
import { calculateCosts, formatCost, calculateSavings } from '../lib/calculator'
import { countTokens } from '../lib/tokenizer'
import type { ModelCostResult, ModelPricing } from '../lib/types'
import pricingData from '../data/pricing.json'

const models = pricingData.models as ModelPricing[]

const SCENES = [
  { id: 'chatbot', label: 'Chatbot', prompt: 'You are a helpful customer support assistant. Answer the user question clearly and concisely.', outputTokens: 500, callsPerMonth: 10000 },
  { id: 'rag', label: 'RAG Pipeline', prompt: 'Based on the following retrieved documents, answer the user question. Cite sources where appropriate.\n\n[Retrieved documents will be inserted here as context]', outputTokens: 800, callsPerMonth: 5000 },
  { id: 'agent', label: 'AI Agent', prompt: 'You are an autonomous agent. Break down the user task into steps and execute them. Use tools when needed.', outputTokens: 2000, callsPerMonth: 1000 },
  { id: 'coding', label: 'Coding Assistant', prompt: 'Review the following code and suggest improvements. Focus on performance, readability, and security.', outputTokens: 1500, callsPerMonth: 2000 },
  { id: 'custom', label: 'Custom', prompt: '', outputTokens: 1000, callsPerMonth: 1000 },
]

const CALL_PRESETS = [
  { label: '100/mo', value: 100 },
  { label: '1K/mo', value: 1000 },
  { label: '10K/mo', value: 10000 },
  { label: '100K/mo', value: 100000 },
  { label: '1M/mo', value: 1000000 },
]

const FAQ_DATA = [
  { q: 'How accurate are the cost estimates?', a: 'Costs use real token counting (tiktoken) for OpenAI models and character-based estimation for others. Monthly costs are projections based on your usage — actual costs depend on real prompt lengths and output.' },
  { q: 'Which model should I choose?', a: 'For simple tasks, start with the cheapest model that meets quality needs (GPT-4o Mini, Gemini Flash). Reserve expensive models (GPT-4o, Claude Sonnet) for complex reasoning. The "Best Value" tag highlights the cheapest option.' },
  { q: 'How do I reduce AI costs?', a: 'Three strategies: (1) Use cheaper models for routine tasks. (2) Shorten system prompts to reduce input tokens. (3) Cache frequently used prompts on the client side to avoid redundant API calls.' },
  { q: 'Does this include batch API pricing?', a: 'We show standard API pricing. Most providers offer 50% discounts for batch processing. For high-volume workloads, check batch pricing on provider websites.' },
  { q: 'What counts as a "call"?', a: 'One call = one API request to the model. Each call includes input tokens (your prompt) and output tokens (the model response). Both are billed separately.' },
]

function getSeoData(): { scene: string; h1: string; defaultPrompt: string; defaultOutputTokens: number; defaultCallsPerMonth: number } | null {
  const el = document.getElementById('seo-data')
  if (!el) return null
  try { return JSON.parse(el.textContent || 'null') } catch { return null }
}

export default function TokenTrackerApp() {
  const seoData = useMemo(() => getSeoData(), [])
  const pageTitle = seoData?.h1 || 'AI Token Cost Tracker'
  const defaultScene = seoData?.scene || 'chatbot'
  const defaultSceneData = SCENES.find(s => s.id === defaultScene) || SCENES[0]

  const [scene, setScene] = useState(defaultScene)
  const [prompt, setPrompt] = useState(seoData?.defaultPrompt || defaultSceneData.prompt)
  const [outputTokens, setOutputTokens] = useState(seoData?.defaultOutputTokens || defaultSceneData.outputTokens)
  const [callsPerMonth, setCallsPerMonth] = useState(seoData?.defaultCallsPerMonth || defaultSceneData.callsPerMonth)
  const [tokenCount, setTokenCount] = useState(0)
  const [results, setResults] = useState<ModelCostResult[]>([])

  const handleSceneChange = useCallback((id: string) => {
    setScene(id)
    const s = SCENES.find(s => s.id === id)
    if (s && id === 'custom') {
      setPrompt('')
      setOutputTokens(1000)
      setCallsPerMonth(1000)
    } else if (s) {
      setPrompt(s.prompt)
      setOutputTokens(s.outputTokens)
      setCallsPerMonth(s.callsPerMonth)
    }
  }, [])

  // Count tokens
  useEffect(() => {
    if (!prompt.trim()) { setTokenCount(0); return }
    let cancelled = false
    Promise.all(models.map(m => countTokens(prompt, m.id)))
      .then(counts => {
        if (cancelled) return
        const avg = counts.reduce((a, b) => a + b, 0) / counts.length
        setTokenCount(Math.round(avg))
      })
    return () => { cancelled = true }
  }, [prompt])

  // Calculate costs
  useEffect(() => {
    if (!prompt.trim()) { setResults([]); return }
    let cancelled = false
    calculateCosts(prompt, outputTokens, callsPerMonth, models).then(r => {
      if (!cancelled) setResults(r)
    })
    return () => { cancelled = true }
  }, [prompt, outputTokens, callsPerMonth])

  const cheapest = useMemo(() => {
    if (results.length === 0) return null
    return results.reduce((a, b) => a.monthlyCost < b.monthlyCost ? a : b)
  }, [results])

  return (
    <div className="min-h-screen bg-[#f5f5f7]">
      <GlobalNav current="/token-tracker/" />

      <main className="max-w-[980px] mx-auto px-6 py-10">
        {/* Hero */}
        <div className="mb-10">
          <h1 className="text-3xl md:text-4xl font-semibold text-[#1d1d1f] tracking-tight mb-3">
            {pageTitle}
          </h1>
          <p className="text-[#86868b] text-lg leading-relaxed">
            Estimate monthly AI costs across 10 models. Pick a use case or enter your own prompt to see real-time cost projections.
          </p>
        </div>

        {/* Scene selector */}
        <div className="mb-6 flex flex-wrap gap-2">
          {SCENES.map(s => (
            <button
              key={s.id}
              onClick={() => handleSceneChange(s.id)}
              className={`text-sm px-4 py-2 rounded-full transition-all ${
                scene === s.id
                  ? 'bg-[#1d1d1f] text-white shadow-sm'
                  : 'bg-white text-[#86868b] hover:bg-[#e8e8ed] shadow-sm'
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>

        {/* Input panel */}
        <div className="mb-8 bg-white rounded-2xl p-6 shadow-sm space-y-5">
          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="text-sm font-medium text-[#1d1d1f]">Prompt template</label>
              <span className="text-xs text-[#86868b]">
                {tokenCount.toLocaleString()} tokens (avg)
              </span>
            </div>
            <textarea
              value={prompt}
              onChange={e => setPrompt(e.target.value)}
              rows={4}
              placeholder="Enter your prompt text..."
              className="w-full px-4 py-3 bg-[#f5f5f7] rounded-xl text-sm text-[#1d1d1f] placeholder:text-[#86868b] outline-none focus:ring-2 focus:ring-[#0071E3]/30 transition-shadow resize-y font-mono leading-relaxed"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label className="text-sm font-medium text-[#1d1d1f] mb-3 block">
                Expected output tokens
              </label>
              <input
                type="number"
                value={outputTokens}
                onChange={e => setOutputTokens(Math.max(0, parseInt(e.target.value) || 0))}
                className="w-full px-4 py-2.5 bg-[#f5f5f7] rounded-xl text-sm text-[#1d1d1f] outline-none focus:ring-2 focus:ring-[#0071E3]/30 transition-shadow font-mono"
              />
              <div className="flex gap-1.5 mt-2 flex-wrap">
                {[256, 512, 1024, 2048, 4096].map(v => (
                  <button key={v} onClick={() => setOutputTokens(v)} className={`text-xs px-2.5 py-1 rounded-lg transition-all ${outputTokens === v ? 'bg-[#0071E3]/10 text-[#0071E3] font-medium' : 'bg-[#f5f5f7] text-[#86868b] hover:bg-[#e8e8ed]'}`}>
                    {v >= 1024 ? `${v / 1024}K` : v}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-[#1d1d1f] mb-3 block">
                Calls per month
              </label>
              <input
                type="number"
                value={callsPerMonth}
                onChange={e => setCallsPerMonth(Math.max(0, parseInt(e.target.value) || 0))}
                className="w-full px-4 py-2.5 bg-[#f5f5f7] rounded-xl text-sm text-[#1d1d1f] outline-none focus:ring-2 focus:ring-[#0071E3]/30 transition-shadow font-mono"
              />
              <div className="flex gap-1.5 mt-2 flex-wrap">
                {CALL_PRESETS.map(p => (
                  <button key={p.value} onClick={() => setCallsPerMonth(p.value)} className={`text-xs px-2.5 py-1 rounded-lg transition-all ${callsPerMonth === p.value ? 'bg-[#0071E3]/10 text-[#0071E3] font-medium' : 'bg-[#f5f5f7] text-[#86868b] hover:bg-[#e8e8ed]'}`}>
                    {p.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Results table */}
        {results.length > 0 && cheapest && (
          <div className="mb-10 bg-white rounded-2xl shadow-sm overflow-hidden">
            <div className="p-5 border-b border-[#e8e8ed] flex items-center justify-between">
              <h2 className="text-xl font-semibold text-[#1d1d1f] tracking-tight">Cost Comparison</h2>
              <span className="text-sm text-[#86868b]">
                {results.length} models · cheapest is <span className="text-[#0071E3] font-medium">{formatCost(cheapest.monthlyCost)}/mo</span>
              </span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-[#e8e8ed]">
                    <th className="text-left py-3.5 px-5 font-medium text-[#86868b]">Model</th>
                    <th className="text-right py-3.5 px-5 font-medium text-[#86868b]">Input Tokens</th>
                    <th className="text-right py-3.5 px-5 font-medium text-[#86868b]">Cost / Call</th>
                    <th className="text-right py-3.5 px-5 font-medium text-[#86868b]">Monthly Cost</th>
                    <th className="text-right py-3.5 px-5 font-medium text-[#86868b] hidden sm:table-cell">Savings</th>
                  </tr>
                </thead>
                <tbody>
                  {results.map(r => {
                    const isCheapest = r === cheapest
                    const savings = calculateSavings(r, cheapest)
                    return (
                      <tr key={r.model.id} className={`border-b border-[#f5f5f7] last:border-0 transition-colors ${isCheapest ? 'bg-[#0071E3]/[0.04]' : 'hover:bg-[#f5f5f7]'}`}>
                        <td className="py-3.5 px-5">
                          <div className="font-medium text-[#1d1d1f]">
                            {r.model.name}
                            {isCheapest && <span className="ml-2 text-xs bg-[#0071E3]/10 text-[#0071E3] px-2.5 py-0.5 rounded-full font-medium">Best Value</span>}
                          </div>
                          <div className="text-xs text-[#86868b] mt-0.5">{r.model.provider}</div>
                        </td>
                        <td className="text-right py-3.5 px-5 font-mono text-[#1d1d1f]">
                          {r.tokenCount.toLocaleString()}
                        </td>
                        <td className="text-right py-3.5 px-5 font-mono text-[#1d1d1f]">
                          {formatCost(r.totalCostPerCall)}
                        </td>
                        <td className="text-right py-3.5 px-5">
                          <span className={`font-mono font-medium ${isCheapest ? 'text-[#0071E3]' : 'text-[#1d1d1f]'}`}>
                            {formatCost(r.monthlyCost)}
                          </span>
                        </td>
                        <td className="text-right py-3.5 px-5 text-sm text-[#86868b] hidden sm:table-cell">
                          {savings > 0 ? `${savings}% more` : '—'}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Cost tip */}
        {results.length > 0 && cheapest && (
          <div className="mb-10 bg-white rounded-2xl p-5 shadow-sm">
            <div className="flex items-start gap-3">
              <span className="text-lg">💡</span>
              <div>
                <div className="font-medium text-[#1d1d1f] mb-1">Cost saving tip</div>
                <p className="text-sm text-[#86868b] leading-relaxed">
                  {scene === 'rag'
                    ? 'Cache your document embeddings to avoid re-processing the same context. This can reduce RAG input costs by 60-80%.'
                    : scene === 'agent'
                    ? 'Use cheaper models (GPT-4o Mini, Gemini Flash) for planning steps and reserve expensive models for final execution. This cuts agent costs by 50%+.'
                    : scene === 'coding'
                    ? 'Use code-specific models for syntax tasks and general models for architecture review. Batch similar code reviews to reduce per-call overhead.'
                    : 'Switch to cheaper models for simple tasks. GPT-4o Mini handles most routine queries at 1/10th the cost of GPT-4o.'}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* FAQ */}
        <div className="mb-10">
          <h2 className="text-2xl font-semibold text-[#1d1d1f] tracking-tight mb-6">FAQ</h2>
          <div className="space-y-3">
            {FAQ_DATA.map((faq, i) => (
              <details key={i} className="group bg-white rounded-2xl shadow-sm overflow-hidden">
                <summary className="cursor-pointer p-5 text-base font-medium text-[#1d1d1f] group-open:text-[#0071E3] transition-colors">
                  {faq.q}
                </summary>
                <div className="px-5 pb-5 text-base text-[#86868b] leading-relaxed">
                  {faq.a}
                </div>
              </details>
            ))}
          </div>
        </div>

        {/* Footer */}
        <footer className="border-t border-[#e8e8ed] pt-6 text-center text-sm text-[#86868b]">
          <p>Free AI Token Cost Tracker. No login required.</p>
          <p className="mt-2">
            <a href="/" className="text-[#0071E3] hover:underline">AI Cost Calculator</a>
            <span className="mx-1.5">&middot;</span>
            <a href="/cron-generator/" className="text-[#0071E3] hover:underline">Cron Generator</a>
            <span className="mx-1.5">&middot;</span>
            <a href="/alternatives/" className="text-[#0071E3] hover:underline">Self-Hosted Alternatives</a>
            <span className="mx-1.5">&middot;</span>
            <a href="/compare/" className="text-[#0071E3] hover:underline">Compare</a>
          </p>
        </footer>
      </main>
    </div>
  )
}
