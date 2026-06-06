// src/token-optimizer/TokenOptimizerApp.tsx — browser-only token optimizer
// Detects prompt bloat, compresses, shows savings across models

import { useState, useCallback, useMemo, useEffect } from 'react'
import { GlobalNav } from '../components/GlobalNav'
import { RelatedTools } from '../components/RelatedTools'
import { analyzePrompt, PLATFORM_PRESETS, getPlatformSavingsEstimate } from './optimizer'
import type { CompressionResult } from './optimizer'
import { BENCHMARK_DATA, formatMonthlyCost, formatTokens } from './benchmarks'
import type { BenchmarkEntry } from './benchmarks'
import pricingData from '../data/pricing.json'
import type { ModelPricing } from '../lib/types'

const models = pricingData.models as ModelPricing[]

const PROVIDER_COLORS: Record<string, string> = {
  'OpenAI': '#10a37f',
  'Anthropic': '#d97757',
  'Google': '#4285f4',
  'Groq': '#f97316',
  'DeepSeek': '#5b6ef7',
}

const COMPARE_MODEL_IDS = ['gpt-4o', 'claude-3-7-sonnet-20250219', 'gemini-2.0-flash', 'deepseek-v4-flash']
const COMPARE_MODELS = COMPARE_MODEL_IDS
  .map(id => models.find(m => m.id === id))
  .filter(Boolean) as ModelPricing[]

const SAMPLE_PROMPT = PLATFORM_PRESETS[0].samplePrompt

export default function TokenOptimizerApp() {
  const [prompt, setPrompt] = useState(SAMPLE_PROMPT)
  const [result, setResult] = useState<CompressionResult | null>(null)
  const [analyzing, setAnalyzing] = useState(false)
  const [activePreset, setActivePreset] = useState('claude-code')
  const [showCompressed, setShowCompressed] = useState(false)
  const [copied, setCopied] = useState<'original' | 'compressed' | null>(null)

  // Quick estimate (no async tiktoken — instant character-based)
  const quickEstimate = useMemo(() => {
    if (!prompt.trim()) return null
    return getPlatformSavingsEstimate(prompt)
  }, [prompt])

  const charCount = prompt.length
  const wordCount = prompt.trim() ? prompt.trim().split(/\s+/).length : 0

  const handleAnalyze = useCallback(async () => {
    if (!prompt.trim()) return
    setAnalyzing(true)
    try {
      const r = await analyzePrompt(prompt)
      setResult(r)
    } catch {
      // fallback to quick estimate
    } finally {
      setAnalyzing(false)
    }
  }, [prompt])

  // Auto-analyze on debounced input
  useEffect(() => {
    if (!prompt.trim()) {
      setResult(null)
      return
    }
    const timer = setTimeout(() => {
      handleAnalyze()
    }, 500)
    return () => clearTimeout(timer)
  }, [prompt, handleAnalyze])

  const handlePreset = useCallback((presetId: string) => {
    setActivePreset(presetId)
    const preset = PLATFORM_PRESETS.find(p => p.id === presetId)
    if (preset) {
      setPrompt(preset.samplePrompt)
      setShowCompressed(false)
    }
  }, [])

  const handleCopy = useCallback(async (text: string, type: 'original' | 'compressed') => {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(type)
      setTimeout(() => setCopied(null), 2000)
    } catch { /* clipboard denied */ }
  }, [])

  const activeRedundancies = result?.redundancies.filter((r: { estimatedTokenWaste: number }) => r.estimatedTokenWaste > 0) || []
  const totalWasteEstimate = activeRedundancies.reduce((sum: number, r: { estimatedTokenWaste: number }) => sum + r.estimatedTokenWaste, 0)

  return (
    <div className="min-h-screen bg-[#f5f5f7] text-[#1d1d1f]">
      <GlobalNav current="/token-optimizer/" />

      <div className="max-w-[980px] mx-auto px-6">
        {/* Hero */}
        <header className="pt-20 pb-12 text-center">
          <h1 className="text-5xl md:text-6xl font-bold tracking-tight text-[#1d1d1f] mb-4">
            Token Optimizer
            <br />
            <span className="bg-gradient-to-r from-[#0071E3] to-[#40A0FF] bg-clip-text text-transparent">
              Reduce Your Prompt Costs
            </span>
          </h1>
          <p className="text-lg md:text-xl text-[#86868b] max-w-xl mx-auto leading-relaxed">
            Detect prompt bloat, compress verbose instructions, and save on API costs.
            Works for Claude Code, Cursor, GitHub Copilot &amp; more. Free, no login.
          </p>
        </header>

        {/* Platform Presets */}
        <div className="flex flex-wrap gap-2 mb-6 justify-center">
          {PLATFORM_PRESETS.map(p => (
            <button
              key={p.id}
              onClick={() => handlePreset(p.id)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 cursor-pointer ${
                activePreset === p.id
                  ? 'bg-[#0071E3] text-white shadow-sm'
                  : 'bg-white text-[#86868b] border border-[#e8e8ed] hover:bg-[#f5f5f7]'
              }`}
              title={p.description}
            >
              {p.name}
            </button>
          ))}
        </div>

        {/* Main Card */}
        <div className="bg-white rounded-3xl shadow-[0_2px_20px_rgba(0,0,0,0.06)] border border-[#e8e8ed] overflow-hidden mb-6">
          {/* Text area */}
          <div className="p-8 pb-4">
            <div className="flex items-center justify-between mb-3">
              <label className="text-sm font-medium text-[#86868b] uppercase tracking-wide">
                Your Prompt
              </label>
              <button
                onClick={() => handleCopy(prompt, 'original')}
                className="text-xs text-[#0071E3] hover:text-[#0077ED] transition-colors cursor-pointer"
              >
                {copied === 'original' ? 'Copied!' : 'Copy'}
              </button>
            </div>
            <textarea
              value={prompt}
              onChange={e => setPrompt(e.target.value)}
              placeholder="Paste your prompt, system instructions, or AI coding rules here..."
              rows={12}
              className="w-full text-sm font-mono text-[#1d1d1f] resize-y border border-[#d2d2d7] rounded-xl p-4 min-h-[240px] bg-white focus:outline-none focus:ring-2 focus:ring-[#0071E3]/20 focus:border-[#0071E3] transition-shadow"
            />
          </div>

          {/* Stats Bar */}
          <div className="border-t border-[#e8e8ed] px-8 py-5 flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-6">
              <div className="text-center">
                <div className="text-xs text-[#86868b] uppercase tracking-wide mb-0.5">Est. Tokens</div>
                <div className="text-2xl font-bold text-[#1d1d1f] tabular-nums">
                  {analyzing ? (
                    <span className="inline-block w-5 h-5 border-2 border-[#0071E3] border-t-transparent rounded-full animate-spin" />
                  ) : (
                    quickEstimate?.originalEstimate.toLocaleString() || '0'
                  )}
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

              {quickEstimate && quickEstimate.percentSaved > 0 && (
                <>
                  <div className="h-10 w-px bg-[#e8e8ed]" />
                  <div>
                    <div className="text-xs text-[#86868b] uppercase tracking-wide mb-0.5">Potential Savings</div>
                    <div className="text-2xl font-bold text-[#34c759] tabular-nums">
                      ~{quickEstimate.percentSaved}%
                    </div>
                  </div>
                </>
              )}
            </div>

            <button
              onClick={handleAnalyze}
              disabled={!prompt.trim() || analyzing}
              className="px-5 py-2.5 bg-[#0071E3] hover:bg-[#0077ED] disabled:bg-[#d2d2d7] disabled:cursor-not-allowed text-white text-sm font-medium rounded-full transition-all duration-200 cursor-pointer"
            >
              {analyzing ? 'Analyzing...' : 'Analyze Prompt'}
            </button>
          </div>
        </div>

        {/* Results */}
        {result && (
          <div className="space-y-6 mb-24">
            {/* Savings Summary */}
            <div className="bg-white rounded-3xl shadow-[0_2px_20px_rgba(0,0,0,0.06)] border border-[#e8e8ed] p-8">
              <h2 className="text-2xl font-semibold tracking-tight mb-1">Token Savings by Model</h2>
              <p className="text-sm text-[#86868b] mb-6">
                Original vs compressed token count across major AI providers
              </p>

              <div className="space-y-4">
                {COMPARE_MODELS.map(model => {
                  const orig = result.originalTokens[model.id] || 0
                  const comp = result.compressedTokens[model.id] || 0
                  const saved = result.savings[model.id]?.tokens || 0
                  const pct = orig > 0 ? Math.round((saved / orig) * 100) : 0
                  const maxTokens = Math.max(...Object.values(result.originalTokens), 1)
                  const origWidth = (orig / maxTokens) * 100
                  const compWidth = (comp / maxTokens) * 100
                  const color = PROVIDER_COLORS[model.provider] || '#0071E3'
                  const costSaved = result.savings[model.id]?.costPer1k || 0

                  return (
                    <div key={model.id} className="flex items-center gap-4">
                      <div className="w-36 shrink-0">
                        <div className="text-sm font-medium text-[#1d1d1f]">{model.name}</div>
                        <div className="text-xs text-[#86868b]">{model.provider}</div>
                      </div>
                      <div className="flex-1">
                        {/* Original bar */}
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xs text-[#86868b] w-10 text-right tabular-nums">{orig}</span>
                          <div className="flex-1 bg-[#f5f5f7] rounded-full h-3 overflow-hidden">
                            <div
                              className="h-full rounded-full opacity-40 transition-all duration-500"
                              style={{ width: `${origWidth}%`, backgroundColor: color }}
                            />
                          </div>
                        </div>
                        {/* Compressed bar */}
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-[#34c759] w-10 text-right tabular-nums font-medium">{comp}</span>
                          <div className="flex-1 bg-[#f5f5f7] rounded-full h-3 overflow-hidden">
                            <div
                              className="h-full rounded-full transition-all duration-500"
                              style={{ width: `${compWidth}%`, backgroundColor: color }}
                            />
                          </div>
                        </div>
                      </div>
                      <div className="w-32 shrink-0 text-right">
                        <div className="text-sm font-semibold text-[#34c759] tabular-nums">
                          -{saved} tokens
                        </div>
                        <div className="text-xs text-[#86868b]">
                          {pct}% · ${costSaved.toFixed(4)}/1k calls
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>

              {/* Big number summary */}
              {result.totalSavingsPercent > 0 && (
                <div className="mt-6 pt-6 border-t border-[#e8e8ed] flex items-center gap-8">
                  <div className="text-center">
                    <div className="text-4xl font-bold text-[#34c759]">{result.totalSavingsPercent}%</div>
                    <div className="text-xs text-[#86868b] mt-1">average token reduction</div>
                  </div>
                  <div className="text-sm text-[#86868b] leading-relaxed max-w-md">
                    This translates to <strong className="text-[#1d1d1f]">~{result.totalSavingsPercent}% lower API costs</strong> for
                    input tokens. At 1,000 calls/month with a 500-token prompt on Claude Sonnet,
                    that's roughly <strong className="text-[#1d1d1f]">${((result.totalSavingsPercent / 100) * 1.5).toFixed(2)}/month</strong> saved.
                  </div>
                </div>
              )}
            </div>

            {/* Redundancy Report */}
            {activeRedundancies.length > 0 && (
              <div className="bg-white rounded-3xl shadow-[0_2px_20px_rgba(0,0,0,0.06)] border border-[#e8e8ed] p-8">
                <h2 className="text-2xl font-semibold tracking-tight mb-1">Bloat Report</h2>
                <p className="text-sm text-[#86868b] mb-6">
                  Found {activeRedundancies.length} issue{activeRedundancies.length > 1 ? 's' : ''} wasting ~{totalWasteEstimate} tokens
                </p>

                <div className="space-y-3">
                  {activeRedundancies.map((r, i) => (
                    <div key={i} className="flex items-start gap-3 p-4 bg-[#fff9e6] rounded-xl border border-[#f0d56c]">
                      <span className="text-amber-500 mt-0.5 shrink-0 text-sm">
                        {r.type === 'duplicate_line' ? '🔁' :
                         r.type === 'empty_line' ? '📏' :
                         r.type === 'overly_polite' ? '🙏' :
                         r.type === 'long_system_prompt' ? '📜' :
                         '✂️'}
                      </span>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium text-[#1d1d1f]">{r.label}</div>
                        {r.matches.length > 0 && (
                          <div className="text-xs text-[#86868b] mt-1 truncate">
                            Found: {r.matches.slice(0, 3).map((m, j) => (
                              <code key={j} className="bg-[#fef3c7] px-1 rounded text-[#92400e] text-xs mr-1">
                                {m.length > 50 ? m.slice(0, 50) + '…' : m}
                              </code>
                            ))}
                            {r.matches.length > 3 && <span>+{r.matches.length - 3} more</span>}
                          </div>
                        )}
                      </div>
                      <span className="text-xs font-medium text-[#92400e] bg-[#fef3c7] px-2 py-0.5 rounded-full shrink-0">
                        ~{r.estimatedTokenWaste} tokens
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Compressed Output */}
            {result.compressedText && result.compressedText !== prompt && (
              <div className="bg-white rounded-3xl shadow-[0_2px_20px_rgba(0,0,0,0.06)] border border-[#e8e8ed] overflow-hidden">
                <div className="px-8 py-4 border-b border-[#e8e8ed] flex items-center justify-between">
                  <div>
                    <h2 className="text-lg font-semibold text-[#1d1d1f]">Compressed Prompt</h2>
                    <p className="text-xs text-[#86868b]">
                      {result.totalSavingsPercent}% shorter — same meaning, fewer tokens
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setShowCompressed(!showCompressed)}
                      className="text-xs text-[#0071E3] hover:text-[#0077ED] px-3 py-1.5 rounded-full border border-[#e8e8ed] hover:border-[#0071E3]/30 cursor-pointer transition-colors"
                    >
                      {showCompressed ? 'Show Original' : 'Show Diff'}
                    </button>
                    <button
                      onClick={() => handleCopy(result.compressedText, 'compressed')}
                      className="text-xs bg-[#0071E3] hover:bg-[#0077ED] text-white px-3 py-1.5 rounded-full cursor-pointer transition-colors"
                    >
                      {copied === 'compressed' ? 'Copied!' : 'Copy Optimized'}
                    </button>
                  </div>
                </div>
                <div className="p-8">
                  {showCompressed ? (
                    <DiffView original={prompt} compressed={result.compressedText} />
                  ) : (
                    <pre className="text-sm font-mono text-[#1d1d1f] whitespace-pre-wrap leading-relaxed">
                      {result.compressedText}
                    </pre>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Real-World Benchmarks */}
        <BenchmarkSection />

        {/* SEO Content Sections */}
        <div className="max-w-[780px] mx-auto pb-16 space-y-12">
          {/* Reduce Token Usage Claude Code */}
          <section>
            <h2 className="text-2xl font-semibold tracking-tight mb-3">
              Reduce Token Usage in Claude Code
            </h2>
            <div className="text-[#86868b] leading-relaxed space-y-3">
              <p>
                Claude Code users can cut token usage by 20-40% through prompt optimization.
                The most common waste comes from verbose system prompts, overly polite language
                ("please", "I would appreciate"), and redundant instructions that repeat what
                the model already knows.
              </p>
              <p>
                Key strategies: keep CLAUDE.md under 200 words, use imperative commands instead
                of polite requests, remove "you are a helpful AI assistant" boilerplate,
                and deduplicate repeated instructions across files.
              </p>
            </div>
          </section>

          {/* Token Optimizer Online */}
          <section>
            <h2 className="text-2xl font-semibold tracking-tight mb-3">
              Token Optimizer Online — Free, No CLI Required
            </h2>
            <div className="text-[#86868b] leading-relaxed space-y-3">
              <p>
                Most token optimization tools (headroom, Lowfat) require CLI installation.
                This tool runs entirely in your browser — paste any prompt and get instant
                compression suggestions. No npm install, no GitHub clone, no API keys.
              </p>
              <p>
                The optimizer detects: verbose phrases ("in order to" → "to"), filler words,
                duplicate lines, overly polite language, excessively long system prompts,
                and unnecessary blank lines. Each issue is flagged with estimated token waste.
              </p>
            </div>
          </section>

          {/* Token Optimizer MCP */}
          <section>
            <h2 className="text-2xl font-semibold tracking-tight mb-3">
              Token Optimizer for MCP and AI Tools
            </h2>
            <div className="text-[#86868b] leading-relaxed space-y-3">
              <p>
                MCP servers, Cursor rules, GitHub Copilot instructions, and Codex configurations
                all consume tokens on every request. A 500-word .cursorrules file sent with
                every prompt costs $0.50-1.50/month at typical usage levels. Trimming it to
                200 words saves 60% without losing functionality.
              </p>
              <p>
                Use the platform presets above to test your Claude Code, Cursor, or Copilot
                prompts and see exactly how many tokens you could save per call.
              </p>
            </div>
          </section>

          {/* How It Works */}
          <section>
            <h2 className="text-2xl font-semibold tracking-tight mb-3">
              How the Token Optimizer Works
            </h2>
            <div className="text-[#86868b] leading-relaxed">
              <ol className="list-decimal list-inside space-y-2 ml-1">
                <li><strong className="text-[#1d1d1f]">Paste your prompt</strong> — system instructions, CLAUDE.md, .cursorrules, or any AI prompt.</li>
                <li><strong className="text-[#1d1d1f]">Auto-analysis</strong> — the optimizer scans for 6 types of bloat: verbose phrases, filler words, duplicate lines, politeness overhead, long system prompts, and formatting waste.</li>
                <li><strong className="text-[#1d1d1f]">See savings by model</strong> — token counts compared across GPT-4o, Claude Sonnet, Gemini Flash, and DeepSeek V4 with estimated cost savings.</li>
                <li><strong className="text-[#1d1d1f]">Copy the compressed version</strong> — use the optimized prompt directly in your AI tool.</li>
              </ol>
            </div>
          </section>

          <RelatedTools currentPath="/token-optimizer/" />
        </div>
      </div>
    </div>
  )
}

// Real-World Benchmarks Section
function BenchmarkSection() {
  const mediumTier = BENCHMARK_DATA[0]?.tiers.medium
  const callsPerDay = mediumTier?.callsPerDay || 200

  return (
    <div className="bg-white rounded-3xl shadow-[0_2px_20px_rgba(0,0,0,0.06)] border border-[#e8e8ed] p-8 mb-6">
      <h2 className="text-2xl font-semibold tracking-tight mb-1">Real-World Benchmarks</h2>
      <p className="text-sm text-[#86868b] mb-6">
        Measured compression rates across popular AI coding tools.
        Based on typical system prompts, configuration files, and usage patterns at {callsPerDay} calls/day.
      </p>

      {/* Platform Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
        {BENCHMARK_DATA.map((b: BenchmarkEntry) => (
          <div
            key={b.platform}
            className="p-5 rounded-2xl border border-[#e8e8ed] bg-[#f5f5f7]/50 hover:shadow-sm transition-shadow"
          >
            <div className="flex items-center gap-2 mb-3">
              <span className="text-xl">{b.icon}</span>
              <span className="text-sm font-semibold text-[#1d1d1f]">{b.platform}</span>
            </div>

            <div className="flex items-baseline gap-2 mb-2">
              <span className="text-3xl font-bold text-[#34c759] tabular-nums">{b.compressionRate}%</span>
              <span className="text-xs text-[#86868b]">compression</span>
            </div>

            <div className="text-xs text-[#86868b] leading-relaxed mb-3">
              {b.typicalPromptTokens} → {b.avgCompressedTokens} tokens per call
              · saves {b.tokensSavedPerCall} tokens/call
            </div>

            <div className="space-y-1 text-xs">
              <div className="flex justify-between">
                <span className="text-[#86868b]">Monthly savings ({callsPerDay}/day):</span>
                <span className="font-medium tabular-nums text-[#1d1d1f]">
                  {formatTokens(b.tiers.medium.tokensSavedPerMonth)} tokens
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#86868b]">Cost saved (GPT-4o):</span>
                <span className="font-medium tabular-nums text-[#34c759]">
                  {formatMonthlyCost(b.tiers.medium.costSavedGPT4o)}/mo
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#86868b]">Cost saved (Claude Sonnet):</span>
                <span className="font-medium tabular-nums text-[#34c759]">
                  {formatMonthlyCost(b.tiers.medium.costSavedClaude)}/mo
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Usage Tier Comparison Table */}
      <div className="border-t border-[#e8e8ed] pt-6">
        <h3 className="text-sm font-semibold text-[#1d1d1f] mb-4">
          Savings at Different Usage Levels
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-[#e8e8ed]">
                <th className="text-left px-3 py-2 font-medium text-[#86868b]">Platform</th>
                <th className="text-right px-3 py-2 font-medium text-[#86868b]">Rate</th>
                <th className="text-right px-3 py-2 font-medium text-[#86868b]">
                  50 calls/day
                </th>
                <th className="text-right px-3 py-2 font-medium text-[#86868b]">
                  200 calls/day
                </th>
                <th className="text-right px-3 py-2 font-medium text-[#86868b]">
                  500 calls/day
                </th>
              </tr>
            </thead>
            <tbody>
              {BENCHMARK_DATA.map((b: BenchmarkEntry) => (
                <tr key={b.platform} className="border-b border-[#f0f0f5] hover:bg-[#f5f5f7] transition-colors">
                  <td className="px-3 py-3">
                    <span className="font-medium text-[#1d1d1f]">{b.platform}</span>
                  </td>
                  <td className="px-3 py-3 text-right">
                    <span className="text-[#34c759] font-semibold">{b.compressionRate}%</span>
                  </td>
                  <td className="px-3 py-3 text-right tabular-nums text-[#86868b]">
                    {formatMonthlyCost(b.tiers.low.costSavedGPT4o)}
                  </td>
                  <td className="px-3 py-3 text-right tabular-nums">
                    <span className="text-[#34c759] font-semibold">
                      {formatMonthlyCost(b.tiers.medium.costSavedGPT4o)}
                    </span>
                  </td>
                  <td className="px-3 py-3 text-right tabular-nums text-[#86868b]">
                    {formatMonthlyCost(b.tiers.high.costSavedGPT4o)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="text-[11px] text-[#86868b] mt-3">
          Cost savings shown for GPT-4o input pricing ($2.50/1M tokens).
          Claude Sonnet savings are ~20% higher due to its $3/1M input rate.
        </p>
      </div>
    </div>
  )
}

// Inline diff view — clean Apple-style with subtle indicators
function DiffView({ original, compressed }: { original: string; compressed: string }) {
  const origLines = original.split('\n')
  const compLines = compressed.split('\n')
  const maxLen = Math.max(origLines.length, compLines.length)
  const rows: { orig: string; comp: string; changed: boolean }[] = []

  for (let i = 0; i < maxLen; i++) {
    const o = origLines[i] || ''
    const c = compLines[i] || ''
    rows.push({ orig: o, comp: c, changed: o !== c })
  }

  return (
    <div className="text-xs font-mono leading-relaxed">
      <div className="grid grid-cols-[1fr,1fr] gap-x-6">
        <div className="text-[#86868b] text-[11px] font-medium uppercase tracking-wide mb-2">Original</div>
        <div className="text-[#34c759] text-[11px] font-medium uppercase tracking-wide mb-2">Compressed</div>
      </div>
      <div className="max-h-[500px] overflow-y-auto">
        {rows.map((row, i) => (
          <div
            key={i}
            className={`grid grid-cols-[1fr,1fr] gap-x-6 py-0.5 ${
              row.changed ? 'bg-[#fff9e6]' : ''
            }`}
          >
            <div className={`px-1 ${row.changed ? 'text-[#86868b]' : 'text-[#d2d2d7]'}`}>
              {row.orig || ' '}
            </div>
            <div className={`px-1 ${row.changed ? 'text-[#1d1d1f]' : 'text-[#d2d2d7]'}`}>
              {row.comp || ' '}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
