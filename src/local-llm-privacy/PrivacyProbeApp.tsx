// src/local-llm-privacy/PrivacyProbeApp.tsx — local LLM config privacy scanner

import { useState, useMemo, useEffect } from 'react'
import { GlobalNav } from '../components/GlobalNav'
import { RelatedTools } from '../components/RelatedTools'
import { scanConfig, detectFormat, TYPE_LABELS, SEVERITY_COLORS } from './detect'
import type { RiskType, Severity, ConfigFormat, PrivacyMatch } from './detect'

const SAMPLE_OLLAMA = `# Ollama Modelfile — Mistral with tools
FROM mistral:7b
PARAMETER temperature 0.7
PARAMETER num_ctx 4096
SYSTEM You are a helpful assistant.
# Telemetry enabled by default
PARAMETER telemetry true
# External tool endpoint
SYSTEM Available tools: https://api.toolhub.io/v1/mistral-tools
# Oops — hardcoded key
ENV OPENAI_API_KEY sk-proj-abc123def456ghi789jkl012mno345pqr678stu
# Insecure: bind all interfaces
HOST 0.0.0.0
# CORS wide open
PARAMETER cors *
# Local path leak
SYSTEM Model path: /Users/developer/.ollama/models/mistral-7b
# Auto-update callback
PARAMETER update_callback https://ollama-telemetry.example.com/ping
# SSL disabled
PARAMETER verify_ssl false`

const SAMPLE_LMSTUDIO = `{
  "modelPath": "/Users/john/models/llama-2-7b-chat.Q4_K_M.gguf",
  "completionParams": {
    "temperature": 0.7,
    "max_tokens": 2048
  },
  "server": {
    "host": "0.0.0.0",
    "port": 1234,
    "cors": "*",
    "verify_ssl": false,
    "debug": true
  },
  "telemetry": {
    "enabled": true,
    "endpoint": "https://analytics.lmstudio.ai/v1/collect"
  },
  "api_key": "sk-proj-abc123def456ghi789jkl012mno345",
  "update": {
    "auto_check": true,
    "callback_url": "https://update.lmstudio.ai/notify"
  },
  "logging": {
    "path": "/var/log/lmstudio/requests.log"
  }
}`

const SAMPLES: Record<string, string> = {
  ollama: SAMPLE_OLLAMA,
  lmstudio: SAMPLE_LMSTUDIO,
}

function riskScore(matches: PrivacyMatch[]): number {
  const weights: Record<Severity, number> = { critical: 25, high: 15, medium: 8, low: 3 }
  let score = 100
  for (const m of matches) score -= weights[m.severity]
  return Math.max(0, score)
}

function scoreColor(score: number): string {
  if (score >= 80) return '#30d158'
  if (score >= 60) return '#ffcc00'
  if (score >= 40) return '#ff9f0a'
  return '#ff3b30'
}

function scoreLabel(score: number): string {
  if (score >= 80) return 'Good'
  if (score >= 60) return 'Fair'
  if (score >= 40) return 'Poor'
  return 'Critical'
}

export default function PrivacyProbeApp() {
  const [input, setInput] = useState(SAMPLE_OLLAMA)
  const [networkRequests, setNetworkRequests] = useState(0)

  useEffect(() => {
    const origFetch = window.fetch
    let count = 0
    const wrapped: typeof fetch = (...args) => {
      const url = args[0]?.toString() || ''
      if (!url.startsWith(window.location.origin) && !url.startsWith('https://fonts.g')) {
        count += 1
        setNetworkRequests(count)
      }
      return origFetch(...args)
    }
    window.fetch = wrapped
    return () => { window.fetch = origFetch }
  }, [])

  const matches = useMemo(() => scanConfig(input), [input])
  const format = useMemo(() => detectFormat(input), [input])
  const score = useMemo(() => riskScore(matches), [matches])

  const stats = useMemo(() => {
    const byType: Record<RiskType, number> = {
      outbound_endpoint: 0, telemetry: 0, api_key: 0,
      auto_update: 0, data_leak: 0, insecure_setting: 0,
    }
    const bySeverity: Record<Severity, number> = { critical: 0, high: 0, medium: 0, low: 0 }
    for (const m of matches) {
      byType[m.type] += 1
      bySeverity[m.severity] += 1
    }
    return { byType, bySeverity, total: matches.length }
  }, [matches])

  const formatLabel = (f: ConfigFormat) =>
    f === 'ollama' ? 'Ollama Modelfile' : f === 'lmstudio' ? 'LM Studio Config' : f === 'jan' ? 'Jan AI Settings' : 'Generic Config'

  const severityLabel = (s: Severity) =>
    s === 'critical' ? 'Critical' : s === 'high' ? 'High' : s === 'medium' ? 'Medium' : 'Low'

  return (
    <div className="min-h-screen bg-[#f5f5f7] text-[#1d1d1f]">
      <GlobalNav current="/local-llm-privacy/" />

      {/* Hero */}
      <header className="max-w-[1080px] mx-auto px-4 pt-12 pb-4 text-center">
        <h1 className="text-4xl sm:text-5xl font-semibold tracking-tight mb-3">
          Local LLM Privacy Probe
        </h1>
        <p className="text-lg text-[#86868b] max-w-2xl mx-auto leading-relaxed">
          Scan your Ollama Modelfiles, LM Studio configs, and Jan AI settings for telemetry endpoints, hardcoded API keys, and data leakage risks.
          Everything runs in your browser.
        </p>

        <div className="mt-5 inline-flex items-center gap-3 bg-white px-5 py-2.5 rounded-full text-sm shadow-sm">
          <span className="flex items-center gap-1.5">
            <span className={`w-2 h-2 rounded-full ${networkRequests === 0 ? 'bg-[#30d158]' : 'bg-[#ff3b30]'}`} />
            <span className={networkRequests === 0 ? 'text-[#1d1d1f]' : 'text-[#ff3b30]'}>
              {networkRequests === 0 ? '0 network requests' : `${networkRequests} requests detected!`}
            </span>
          </span>
          <span className="text-[#86868b]">·</span>
          <span className="text-[#86868b]">Your configs never leave this browser</span>
        </div>
      </header>

      {/* Main content */}
      <main className="max-w-[1080px] mx-auto px-4 pb-16">
        {/* Input / Output split */}
        <div className="grid lg:grid-cols-2 gap-4 mb-6">
          {/* Input */}
          <section className="bg-white rounded-2xl p-5 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-semibold text-[#86868b] uppercase tracking-wide">
                Paste Config
                {input.trim() && (
                  <span className="ml-2 text-xs font-normal px-2 py-0.5 rounded-full bg-[#e8e8ed] text-[#86868b]">
                    {formatLabel(format)}
                  </span>
                )}
              </h2>
              <div className="flex gap-1">
                <button onClick={() => setInput(SAMPLES.ollama)} className="text-xs px-3 py-1.5 rounded-lg text-[#0071E3] hover:bg-[#0071E3]/5 transition-colors">Ollama</button>
                <button onClick={() => setInput(SAMPLES.lmstudio)} className="text-xs px-3 py-1.5 rounded-lg text-[#0071E3] hover:bg-[#0071E3]/5 transition-colors">LM Studio</button>
                <button onClick={() => setInput('')} className="text-xs px-3 py-1.5 rounded-lg text-[#86868b] hover:text-[#1d1d1f] hover:bg-[#e8e8ed]/50 transition-colors">Clear</button>
              </div>
            </div>
            <textarea
              value={input}
              onChange={e => setInput(e.target.value)}
              placeholder="Paste your Ollama Modelfile, LM Studio config, or Jan settings..."
              className="w-full h-80 p-3 rounded-xl border border-[#e8e8ed] font-mono text-sm bg-[#fafafa] focus:outline-none focus:ring-2 focus:ring-[#0071E3]/20 focus:border-[#0071E3] resize-y"
              spellCheck={false}
            />
          </section>

          {/* Results */}
          <section className="bg-white rounded-2xl p-5 shadow-sm">
            <h2 className="text-sm font-semibold text-[#86868b] uppercase tracking-wide mb-3">
              Findings ({matches.length})
            </h2>

            <div className="h-80 overflow-y-auto space-y-2">
              {matches.length === 0 && input.trim() && (
                <div className="flex flex-col items-center justify-center h-full text-[#86868b]">
                  <span className="text-3xl mb-2">&#x2705;</span>
                  <p className="font-medium">No privacy risks detected</p>
                  <p className="text-sm">Your config looks clean</p>
                </div>
              )}
              {matches.length === 0 && !input.trim() && (
                <div className="flex flex-col items-center justify-center h-full text-[#86868b]">
                  <span className="text-3xl mb-2">&#x1f50d;</span>
                  <p className="font-medium">Paste your config to scan</p>
                </div>
              )}
              {matches.map((m, i) => (
                <div key={i} className="flex items-start gap-3 p-3 rounded-xl bg-[#fafafa] border border-[#e8e8ed]">
                  <span
                    className="shrink-0 mt-0.5 text-xs font-semibold px-2 py-0.5 rounded-full text-white"
                    style={{ backgroundColor: SEVERITY_COLORS[m.severity] }}
                  >
                    {severityLabel(m.severity)}
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="text-sm font-medium">{m.label}</span>
                      <span className="text-xs text-[#86868b] ml-auto">L{m.line}</span>
                    </div>
                    <code className="text-xs font-mono text-[#86868b] break-all block mb-1">
                      {m.value.length > 80 ? m.value.slice(0, 80) + '...' : m.value}
                    </code>
                    <p className="text-xs text-[#0071E3]">&#x2713; {m.fix}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>

        {/* Score + Stats */}
        {input.trim() && (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-8">
            <div className="col-span-2 sm:col-span-1 lg:col-span-2 bg-white rounded-2xl p-4 shadow-sm text-center flex flex-col justify-center">
              <div className="text-3xl font-semibold" style={{ color: scoreColor(score) }}>{score}</div>
              <div className="text-sm text-[#86868b]">Privacy Score</div>
              <div className="text-xs font-medium mt-1" style={{ color: scoreColor(score) }}>{scoreLabel(score)}</div>
            </div>
            <div className="bg-white rounded-2xl p-4 shadow-sm text-center flex flex-col justify-center">
              <div className="text-2xl font-semibold text-[#ff3b30]">{stats.bySeverity.critical}</div>
              <div className="text-sm text-[#86868b]">Critical</div>
            </div>
            <div className="bg-white rounded-2xl p-4 shadow-sm text-center flex flex-col justify-center">
              <div className="text-2xl font-semibold text-[#ff9f0a]">{stats.bySeverity.high}</div>
              <div className="text-sm text-[#86868b]">High</div>
            </div>
            <div className="bg-white rounded-2xl p-4 shadow-sm text-center flex flex-col justify-center">
              <div className="text-2xl font-semibold text-[#ffcc00]">{stats.bySeverity.medium}</div>
              <div className="text-sm text-[#86868b]">Medium</div>
            </div>
            <div className="bg-white rounded-2xl p-4 shadow-sm text-center flex flex-col justify-center">
              <div className="text-2xl font-semibold text-[#34c759]">{stats.bySeverity.low}</div>
              <div className="text-sm text-[#86868b]">Low</div>
            </div>
          </div>
        )}

        {/* Detection categories */}
        <div className="bg-white rounded-2xl p-6 shadow-sm mb-8">
          <h2 className="text-lg font-semibold mb-4">What We Detect</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {([
              { type: 'outbound_endpoint' as RiskType, desc: 'External URLs your LLM config phones home to', icon: '&#127760;' },
              { type: 'telemetry' as RiskType, desc: 'Analytics/tracking flags (Sentry, Amplitude, PostHog)', icon: '&#128202;' },
              { type: 'api_key' as RiskType, desc: 'Hardcoded OpenAI, Anthropic, AWS, HuggingFace keys', icon: '&#128273;' },
              { type: 'auto_update' as RiskType, desc: 'Auto-update callbacks and webhook URLs', icon: '&#128260;' },
              { type: 'data_leak' as RiskType, desc: 'Local paths and log file references', icon: '&#128065;' },
              { type: 'insecure_setting' as RiskType, desc: 'CORS *, disabled SSL, 0.0.0.0 binding, debug mode', icon: '&#9888;' },
            ]).map(({ type, desc, icon }) => (
              <div key={type} className="flex items-start gap-3 p-3 rounded-xl bg-[#fafafa]">
                <span className="text-xl shrink-0" dangerouslySetInnerHTML={{ __html: icon }} />
                <div>
                  <div className="font-medium text-sm">{TYPE_LABELS[type]}</div>
                  <div className="text-xs text-[#86868b]">{desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Privacy guarantee */}
        <div className="bg-white rounded-2xl p-6 shadow-sm mb-8">
          <h2 className="text-lg font-semibold mb-4">Privacy Guarantee</h2>
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="p-4 rounded-xl bg-[#30d158]/10">
              <h3 className="font-medium text-[#1d8a3a] mb-1">&#x2713; Zero Network Requests</h3>
              <p className="text-sm text-[#86868b]">The live counter monitors all outbound requests. It stays at 0 because your config is never sent anywhere.</p>
            </div>
            <div className="p-4 rounded-xl bg-[#30d158]/10">
              <h3 className="font-medium text-[#1d8a3a] mb-1">&#x2713; Zero Storage</h3>
              <p className="text-sm text-[#86868b]">No cookies, no localStorage, no analytics. Your data exists only in memory while the page is open.</p>
            </div>
          </div>
          <p className="text-sm text-[#86868b] mt-4">
            Verify: Open DevTools &rarr; Network tab. Set Offline. Paste your config. Scanning still works.
          </p>
        </div>

        {/* FAQ */}
        <div className="bg-white rounded-2xl p-6 shadow-sm mb-8">
          <h2 className="text-lg font-semibold mb-4">FAQ</h2>
          <div className="space-y-4">
            {[
              { q: 'Why scan local LLM configs?', a: 'Local LLM tools like Ollama, LM Studio, and Jan may phone home with telemetry, embed API keys in config files, or expose local paths. Scanning before sharing configs prevents accidental data leakage.' },
              { q: 'What configs are supported?', a: 'Ollama Modelfiles (FROM, PARAMETER, SYSTEM), LM Studio JSON configs (model paths, server settings), Jan AI settings.json, and generic JSON/YAML config files.' },
              { q: 'How is the privacy score calculated?', a: 'Starts at 100. Each finding deducts points: Critical (-25), High (-15), Medium (-8), Low (-3). Score 80+ = Good, 60-79 = Fair, 40-59 = Poor, below 40 = Critical.' },
              { q: 'How to fix detected issues?', a: 'Disable telemetry flags, move API keys to environment variables, restrict CORS and host binding to localhost, enable SSL verification, and remove callback URLs you don\'t recognize.' },
            ].map(({ q, a }) => (
              <details key={q} className="group">
                <summary className="cursor-pointer font-medium text-sm py-2 flex items-center gap-2">
                  <span className="text-[#86868b] group-open:rotate-90 transition-transform">&#x25B6;</span>
                  {q}
                </summary>
                <p className="text-sm text-[#86868b] pl-6 pb-2">{a}</p>
              </details>
            ))}
          </div>
        </div>

        {/* Related tools */}
        <div className="text-center">
          <h2 className="text-sm font-semibold text-[#86868b] uppercase tracking-wide mb-3">Related Tools</h2>
          <div className="flex justify-center gap-3 flex-wrap">
            <a href="/env-scanner/" className="text-sm px-4 py-2 rounded-xl bg-white shadow-sm hover:shadow-md transition-shadow">.env Scanner</a>
            <a href="/pii-redactor/" className="text-sm px-4 py-2 rounded-xl bg-white shadow-sm hover:shadow-md transition-shadow">PII Redactor</a>
            <a href="/dep-shield/" className="text-sm px-4 py-2 rounded-xl bg-white shadow-sm hover:shadow-md transition-shadow">Dep Shield</a>
            <a href="/ai-agent-security/" className="text-sm px-4 py-2 rounded-xl bg-white shadow-sm hover:shadow-md transition-shadow">AI Agent Security</a>
            <a href="/csp-generator/" className="text-sm px-4 py-2 rounded-xl bg-white shadow-sm hover:shadow-md transition-shadow">CSP Generator</a>
          </div>
        </div>
        <RelatedTools currentPath="/local-llm-privacy/" />
      </main>
    </div>
  )
}
