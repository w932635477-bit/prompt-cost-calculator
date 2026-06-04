// src/cache-calculator/CacheCalculatorApp.tsx — Apple-style cache cost calculator

import { useState, useMemo } from 'react'
import { GlobalNav } from '../components/GlobalNav'
import { RelatedTools } from '../components/RelatedTools'
import { compute, rankAll, estimateTokens } from './calc'
import { MODELS, LAST_UPDATED } from './pricing'
import type { ModelId } from './pricing'

type InputMode = 'chars' | 'tokens'

export default function CacheCalculatorApp() {
  const [mode, setMode] = useState<InputMode>('chars')
  const [baseValue, setBaseValue] = useState(8000)
  const [variableValue, setVariableValue] = useState(400)
  const [outputValue, setOutputValue] = useState(800)
  const [callsPerMonth, setCallsPerMonth] = useState(10000)
  const [modelId, setModelId] = useState<ModelId>('claude-sonnet-4-6')

  const baseTokens = mode === 'chars' ? estimateTokens(baseValue) : baseValue
  const variableTokens = mode === 'chars' ? estimateTokens(variableValue) : variableValue
  const outputTokens = mode === 'chars' ? estimateTokens(outputValue) : outputValue

  const result = useMemo(
    () =>
      compute({
        baseTokens,
        variableTokens,
        outputTokens,
        callsPerMonth,
        modelId,
      }),
    [baseTokens, variableTokens, outputTokens, callsPerMonth, modelId]
  )

  const ranking = useMemo(
    () => rankAll({ baseTokens, variableTokens, outputTokens, callsPerMonth }),
    [baseTokens, variableTokens, outputTokens, callsPerMonth]
  )

  const cheapest = ranking[0]
  const selectedModel = MODELS.find(m => m.id === modelId)!

  const fmtUsd = (n: number) => `$${n.toFixed(2)}`
  const fmtCallCost = (n: number) =>
    n < 0.01 ? `$${n.toFixed(5)}` : n < 1 ? `$${n.toFixed(4)}` : `$${n.toFixed(3)}`

  return (
    <div className="min-h-screen bg-[#f5f5f7] text-[#1d1d1f]">
      <GlobalNav current="/prompt-cache-calculator/" />

      {/* Hero */}
      <header className="max-w-[980px] mx-auto px-4 pt-12 pb-6 text-center">
        <h1 className="text-4xl sm:text-5xl font-semibold tracking-tight mb-3">
          Prompt Caching Calculator
        </h1>
        <p className="text-lg text-[#86868b] max-w-2xl mx-auto">
          Compare LLM costs with and without prompt caching across Anthropic, OpenAI, DeepSeek, and Gemini.
          See your break-even point and cheapest vendor.
        </p>
      </header>

      {/* Calc shell */}
      <main className="max-w-[980px] mx-auto px-4 pb-16">
        <div className="grid lg:grid-cols-[1fr_1fr] gap-6">
          {/* Inputs */}
          <section
            className="bg-white rounded-2xl p-6 shadow-sm"
            data-testid="inputs-card"
          >
            <h2 className="text-lg font-semibold mb-4">Your usage</h2>

            {/* Mode toggle */}
            <div className="flex items-center gap-2 mb-5 text-sm">
              <span className="text-[#86868b]">Input as:</span>
              <button
                type="button"
                onClick={() => setMode('chars')}
                className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
                  mode === 'chars'
                    ? 'bg-[#0071E3] text-white'
                    : 'bg-[#f5f5f7] text-[#1d1d1f] hover:bg-[#e8e8ed]'
                }`}
                data-testid="mode-chars"
              >
                Characters
              </button>
              <button
                type="button"
                onClick={() => setMode('tokens')}
                className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
                  mode === 'tokens'
                    ? 'bg-[#0071E3] text-white'
                    : 'bg-[#f5f5f7] text-[#1d1d1f] hover:bg-[#e8e8ed]'
                }`}
                data-testid="mode-tokens"
              >
                Tokens
              </button>
            </div>

            <Field
              label={`Cacheable prefix (${mode})`}
              hint="System prompt + long context that stays the same across calls"
              value={baseValue}
              onChange={setBaseValue}
              testid="input-base"
            />
            <Field
              label={`Variable part per call (${mode})`}
              hint="The bit that changes each request (e.g. user message)"
              value={variableValue}
              onChange={setVariableValue}
              testid="input-variable"
            />
            <Field
              label={`Output per call (${mode})`}
              hint="Expected response length"
              value={outputValue}
              onChange={setOutputValue}
              testid="input-output"
            />
            <Field
              label="Calls per month"
              hint="Total API calls per month"
              value={callsPerMonth}
              onChange={setCallsPerMonth}
              testid="input-calls"
            />

            {/* Model select */}
            <label className="block mt-4">
              <span className="block text-sm font-medium mb-1.5">Model</span>
              <select
                value={modelId}
                onChange={e => setModelId(e.target.value as ModelId)}
                className="w-full px-3 py-2.5 rounded-lg border border-[#d2d2d7] bg-white text-[#1d1d1f] focus:border-[#0071E3] focus:outline-none focus:ring-2 focus:ring-[#0071E3]/20 transition-colors"
                data-testid="model-select"
              >
                {MODELS.map(m => (
                  <option key={m.id} value={m.id}>
                    {m.label}
                  </option>
                ))}
              </select>
              <p className="text-xs text-[#86868b] mt-1.5 leading-relaxed">
                {selectedModel.cacheNotes}
              </p>
              <p className="text-xs text-[#86868b] mt-0.5">
                Cache TTL: {selectedModel.cacheTtlDescription}
              </p>
            </label>

            {/* Token estimate readout */}
            {mode === 'chars' && (
              <div className="mt-4 p-3 bg-[#f5f5f7] rounded-lg text-xs text-[#86868b]" data-testid="token-estimate">
                Estimated tokens: {baseTokens.toLocaleString()} cached + {variableTokens.toLocaleString()} variable + {outputTokens.toLocaleString()} output (chars / 4 heuristic).
              </div>
            )}
          </section>

          {/* Results */}
          <section
            className="bg-white rounded-2xl p-6 shadow-sm"
            data-testid="results-card"
          >
            <h2 className="text-lg font-semibold mb-4">{selectedModel.label} — Monthly cost</h2>

            <div className="grid grid-cols-2 gap-4 mb-5">
              <Stat
                label="Without caching"
                value={fmtUsd(result.noCacheTotal)}
                tone="muted"
                testid="cost-no-cache"
              />
              <Stat
                label="With caching"
                value={fmtUsd(result.cacheTotal)}
                tone="primary"
                testid="cost-with-cache"
              />
            </div>

            <div className="bg-[#f5f5f7] rounded-xl p-4 mb-4">
              <div className="flex justify-between items-baseline mb-1">
                <span className="text-sm text-[#86868b]">Saved</span>
                <span
                  className={`text-2xl font-semibold ${
                    result.saved > 0 ? 'text-[#30d158]' : 'text-[#ff3b30]'
                  }`}
                  data-testid="saved-amount"
                >
                  {fmtUsd(Math.max(0, result.saved))}
                </span>
              </div>
              <div className="flex justify-between items-baseline">
                <span className="text-sm text-[#86868b]">Saved %</span>
                <span className="text-sm font-medium" data-testid="saved-pct">
                  {result.savedPct.toFixed(1)}%
                </span>
              </div>
              <div className="flex justify-between items-baseline mt-1">
                <span className="text-sm text-[#86868b]">Break-even</span>
                <span className="text-sm font-medium" data-testid="break-even">
                  {result.breakEvenCalls === Infinity
                    ? 'Never'
                    : `${result.breakEvenCalls.toLocaleString()} calls`}
                </span>
              </div>
            </div>

            {/* Per-call cost */}
            <div className="grid grid-cols-2 gap-3 text-sm mb-5">
              <div className="flex flex-col">
                <span className="text-[#86868b] text-xs">No cache / call</span>
                <span className="font-medium font-mono">{fmtCallCost(result.perCallNoCache)}</span>
              </div>
              <div className="flex flex-col">
                <span className="text-[#86868b] text-xs">With cache / call</span>
                <span className="font-medium font-mono text-[#0071E3]">{fmtCallCost(result.perCallCache)}</span>
              </div>
            </div>

            {/* Disclaimer (Codex requirement) */}
            <div className="text-xs text-[#86868b] leading-relaxed border-t border-[#e8e8ed] pt-4">
              <p className="mb-1">
                <strong>Estimate, not a bill.</strong> Token counts are approximated from characters (×0.25); use
                Tokens mode for exact values. Cache hit assumed 100% after first warm-up.
              </p>
              <p>
                Pricing as of {LAST_UPDATED}.{' '}
                <a
                  href={selectedModel.sourceUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#0071E3] hover:underline"
                >
                  Verify on vendor docs ↗
                </a>
              </p>
            </div>
          </section>
        </div>

        {/* Cheapest vendor recommendation */}
        <section
          className="mt-6 bg-white rounded-2xl p-6 shadow-sm"
          data-testid="ranking-card"
        >
          <div className="flex items-baseline justify-between mb-4">
            <h2 className="text-lg font-semibold">All 6 models, ranked</h2>
            <span className="text-sm text-[#86868b]">
              Cheapest: <strong className="text-[#1d1d1f]">{cheapest.label}</strong>
            </span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-xs text-[#86868b] border-b border-[#e8e8ed]">
                <tr>
                  <th className="text-left py-2 px-2 font-medium">Rank</th>
                  <th className="text-left py-2 px-2 font-medium">Model</th>
                  <th className="text-right py-2 px-2 font-medium">No cache</th>
                  <th className="text-right py-2 px-2 font-medium">With cache</th>
                  <th className="text-right py-2 px-2 font-medium">Saved</th>
                </tr>
              </thead>
              <tbody>
                {ranking.map((r, i) => (
                  <tr
                    key={r.modelId}
                    className={`border-b border-[#e8e8ed] last:border-0 ${
                      r.modelId === modelId ? 'bg-[#0071E3]/5' : ''
                    }`}
                    data-testid={`rank-row-${i + 1}`}
                  >
                    <td className="py-2.5 px-2">
                      <span
                        className={`inline-flex w-6 h-6 items-center justify-center rounded-full text-xs font-semibold ${
                          i === 0
                            ? 'bg-[#30d158] text-white'
                            : 'bg-[#f5f5f7] text-[#86868b]'
                        }`}
                      >
                        {i + 1}
                      </span>
                    </td>
                    <td className="py-2.5 px-2 font-medium">
                      <button
                        type="button"
                        onClick={() => setModelId(r.modelId)}
                        className="hover:text-[#0071E3] transition-colors text-left"
                      >
                        {r.label}
                      </button>
                    </td>
                    <td className="py-2.5 px-2 text-right font-mono text-[#86868b]">
                      {fmtUsd(r.noCacheTotal)}
                    </td>
                    <td className="py-2.5 px-2 text-right font-mono">{fmtUsd(r.cacheTotal)}</td>
                    <td className="py-2.5 px-2 text-right font-mono text-[#30d158]">
                      {r.saved > 0 ? fmtUsd(r.saved) : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* Cross-link to sister tools */}
        <section className="mt-6 bg-white rounded-2xl p-6 shadow-sm" data-testid="cross-links">
          <h2 className="text-lg font-semibold mb-3">More AI cost tools</h2>
          <div className="grid sm:grid-cols-2 gap-3">
            <a
              href="/token-tracker/"
              className="block p-4 rounded-xl border border-[#e8e8ed] hover:border-[#0071E3] hover:bg-[#0071E3]/5 transition-colors"
            >
              <div className="font-medium mb-0.5">Token Tracker →</div>
              <div className="text-xs text-[#86868b]">Plain monthly cost calc by tokens, no caching</div>
            </a>
            <a
              href="/voice-agent-pricing/"
              className="block p-4 rounded-xl border border-[#e8e8ed] hover:border-[#0071E3] hover:bg-[#0071E3]/5 transition-colors"
            >
              <div className="font-medium mb-0.5">Voice Agent Pricing →</div>
              <div className="text-xs text-[#86868b]">STT + TTS + LLM cost per voice call</div>
            </a>
          </div>
        </section>

        {/* FAQ */}
        <section className="mt-6 bg-white rounded-2xl p-6 shadow-sm">
          <h2 className="text-lg font-semibold mb-4">FAQ</h2>
          <Faq q="How accurate is this calculator?">
            Token counts in Characters mode use a chars/4 heuristic — fine for ballpark, off by 5-15% for real text.
            Switch to Tokens mode for exact values from your tokenizer (tiktoken / Anthropic count_tokens API).
          </Faq>
          <Faq q="Why do Anthropic and Gemini show a write cost?">
            Their caching is explicit: you mark a prefix and they store it. Anthropic charges 1.25× the input rate
            for the write (5-min TTL) or 2× for 1-hour. OpenAI and DeepSeek auto-cache without a separate write fee.
          </Faq>
          <Faq q="What does break-even mean?">
            For vendors with a write cost (Anthropic), break-even is the call count at which the write cost is
            paid back by per-call savings. Below break-even, caching costs more.
          </Faq>
          <Faq q="Cache hit rate assumed?">
            100% after the warm-up call. Real-world hit rates vary by your traffic pattern. For sparse traffic
            with TTL expiration, multiply break-even by your expected hit rate.
          </Faq>
          <Faq q="Pricing source?">
            All prices verified against vendor docs as of {LAST_UPDATED}. Click "Verify on vendor docs" above to
            check current rates. Prices change — file an issue if you spot drift.
          </Faq>
        </section>
      </main>

      <footer className="border-t border-[#e8e8ed] py-8 mt-8">
        <div className="max-w-[980px] mx-auto px-4 text-center text-xs text-[#86868b]">
          <p>
            Free, ad-free, no signup. Open methodology. Pricing data updated {LAST_UPDATED}.
          </p>
        </div>
      </footer>
      <RelatedTools currentPath="/prompt-cache-calculator/" />
    </div>
  )
}

function Field({
  label,
  hint,
  value,
  onChange,
  testid,
}: {
  label: string
  hint?: string
  value: number
  onChange: (n: number) => void
  testid?: string
}) {
  return (
    <label className="block mb-3">
      <span className="block text-sm font-medium mb-1.5">{label}</span>
      <input
        type="number"
        min={0}
        value={value}
        onChange={e => onChange(Math.max(0, parseInt(e.target.value, 10) || 0))}
        className="w-full px-3 py-2.5 rounded-lg border border-[#d2d2d7] bg-white text-[#1d1d1f] font-mono focus:border-[#0071E3] focus:outline-none focus:ring-2 focus:ring-[#0071E3]/20 transition-colors"
        data-testid={testid}
      />
      {hint && <p className="text-xs text-[#86868b] mt-1">{hint}</p>}
    </label>
  )
}

function Stat({
  label,
  value,
  tone,
  testid,
}: {
  label: string
  value: string
  tone: 'primary' | 'muted'
  testid?: string
}) {
  return (
    <div
      className={`p-4 rounded-xl ${
        tone === 'primary' ? 'bg-[#0071E3]/10' : 'bg-[#f5f5f7]'
      }`}
      data-testid={testid}
    >
      <div className="text-xs text-[#86868b] mb-1">{label}</div>
      <div
        className={`text-2xl font-semibold tabular-nums ${
          tone === 'primary' ? 'text-[#0071E3]' : 'text-[#1d1d1f]'
        }`}
      >
        {value}
      </div>
    </div>
  )
}

function Faq({ q, children }: { q: string; children: React.ReactNode }) {
  return (
    <details className="border-b border-[#e8e8ed] last:border-0 py-3">
      <summary className="font-medium cursor-pointer text-[#1d1d1f] hover:text-[#0071E3] transition-colors">
        {q}
      </summary>
      <p className="mt-2 text-sm text-[#424245] leading-relaxed">{children}</p>
    </details>
  )
}
