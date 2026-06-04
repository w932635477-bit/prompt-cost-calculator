import { useState, useCallback, useRef } from 'react'
import {
  scan,
  detectInputType,
  GRADE_COLORS,
  INPUT_TYPE_LABELS,
  SAMPLE_PROMPT,
  SAMPLE_CODE,
  type ScanResult,
  type Severity,
} from './rules'
import { GlobalNav } from '../components/GlobalNav'
import { RelatedTools } from '../components/RelatedTools'
import { FaqSchema } from '../components/FaqSchema'

const SEVERITY_BG: Record<Severity, string> = {
  critical: 'bg-[#ff3b30]',
  high: 'bg-[#ff9f0a]',
  medium: 'bg-[#ffcc00]',
  low: 'bg-[#30d158]',
}

type SampleType = 'prompt' | 'code'

export default function AgentSecurityApp() {
  const [input, setInput] = useState('')
  const [result, setResult] = useState<ScanResult | null>(null)
  const [filter, setFilter] = useState<'all' | Severity>('all')
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const handleScan = useCallback(() => {
    if (!input.trim()) return
    const r = scan(input)
    setResult(r)
    setFilter('all')
  }, [input])

  const loadSample = (type: SampleType) => {
    const text = type === 'prompt' ? SAMPLE_PROMPT : SAMPLE_CODE
    setInput(text)
    setResult(null)
    textareaRef.current?.focus()
  }

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    const file = e.dataTransfer.files[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = () => {
        const text = reader.result as string
        setInput(text)
        setResult(null)
      }
      reader.readAsText(file)
    }
  }, [])

  const filtered = result
    ? filter === 'all'
      ? result.findings
      : result.findings.filter(f => f.severity === filter)
    : []

  const inputType = input.trim() ? detectInputType(input) : null

  return (
    <div className="min-h-screen bg-[#f5f5f7]">
      <GlobalNav current="/ai-agent-security/" />

      <main className="max-w-[780px] mx-auto px-6 py-10">
        {/* Header */}
        <div className="mb-10">
          <h1 className="text-3xl md:text-4xl font-semibold text-[#1d1d1f] tracking-tight mb-3">
            AI Agent Security Checker
          </h1>
          <p className="text-[#86868b] text-lg leading-relaxed">
            Paste your system prompt, agent code, or tool config to find security vulnerabilities. Free, client-side analysis.
          </p>
        </div>

        {/* Input Area */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-[#1d1d1f]">Input</span>
              {inputType && (
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-[#0071E3]/10 text-[#0071E3] font-medium">
                  {INPUT_TYPE_LABELS[inputType]}
                </span>
              )}
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => loadSample('prompt')}
                className="text-xs px-3 py-1.5 rounded-lg bg-white text-[#0071E3] hover:bg-[#0071E3]/5 transition-colors shadow-sm"
              >
                Sample Prompt
              </button>
              <button
                onClick={() => loadSample('code')}
                className="text-xs px-3 py-1.5 rounded-lg bg-white text-[#0071E3] hover:bg-[#0071E3]/5 transition-colors shadow-sm"
              >
                Sample Code
              </button>
            </div>
          </div>

          <div
            onDrop={handleDrop}
            onDragOver={e => e.preventDefault()}
            className="relative"
          >
            <textarea
              ref={textareaRef}
              value={input}
              onChange={e => { setInput(e.target.value); setResult(null) }}
              placeholder="Paste your system prompt, agent code (.py/.js/.ts), or tool config (JSON)..."
              className="w-full h-56 p-4 rounded-2xl bg-white shadow-sm text-[#1d1d1f] text-sm font-mono leading-relaxed resize-y focus:outline-none focus:ring-2 focus:ring-[#0071E3]/30 placeholder:text-[#86868b]"
              spellCheck={false}
            />
            {!input && (
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="text-center">
                  <div className="text-4xl mb-2">🛡️</div>
                  <p className="text-sm text-[#86868b]">Drag &amp; drop a file or paste text above</p>
                  <p className="text-xs text-[#86868b] mt-1">Supports .txt, .py, .js, .ts, .json</p>
                </div>
              </div>
            )}
          </div>

          <button
            onClick={handleScan}
            disabled={!input.trim()}
            className="mt-4 w-full py-3.5 rounded-2xl bg-[#0071E3] text-white font-medium text-base hover:bg-[#0077ED] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Scan for Vulnerabilities
          </button>
        </div>

        {/* Results */}
        {result && (
          <div className="space-y-8">
            {/* Score + Stats */}
            <div className="grid grid-cols-1 md:grid-cols-[200px_1fr] gap-6">
              {/* Score Circle */}
              <div className="bg-white rounded-2xl p-6 shadow-sm flex flex-col items-center justify-center">
                <div className="relative w-32 h-32">
                  <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                    <circle cx="50" cy="50" r="42" fill="none" stroke="#e8e8ed" strokeWidth="8" />
                    <circle
                      cx="50" cy="50" r="42" fill="none"
                      stroke={GRADE_COLORS[result.grade]}
                      strokeWidth="8"
                      strokeDasharray={`${result.score * 2.64} 264`}
                      strokeLinecap="round"
                      className="transition-all duration-700"
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-4xl font-bold" style={{ color: GRADE_COLORS[result.grade] }}>
                      {result.grade}
                    </span>
                    <span className="text-xs text-[#86868b] mt-0.5">{result.score}/100</span>
                  </div>
                </div>
                <p className="text-sm text-[#86868b] mt-3">{INPUT_TYPE_LABELS[result.inputType]}</p>
              </div>

              {/* Stats Grid */}
              <div className="bg-white rounded-2xl p-5 shadow-sm">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <StatCard label="Findings" value={result.stats.total} color="#1d1d1f" />
                  <StatCard label="Critical" value={result.stats.critical} color="#ff3b30" />
                  <StatCard label="High" value={result.stats.high} color="#ff9f0a" />
                  <StatCard label="Medium" value={result.stats.medium} color="#ffcc00" />
                </div>
                {result.findings.length === 0 && (
                  <div className="mt-4 p-4 rounded-xl bg-[#30d158]/10 text-center">
                    <p className="text-[#30d158] font-medium">No vulnerabilities detected</p>
                    <p className="text-sm text-[#86868b] mt-1">
                      Your {INPUT_TYPE_LABELS[result.inputType].toLowerCase()} looks good from a security perspective.
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Findings List */}
            {result.findings.length > 0 && (
              <div>
                {/* Filter */}
                <div className="flex flex-wrap gap-2 mb-4">
                  <FilterBtn label="All" count={result.stats.total} active={filter === 'all'} onClick={() => setFilter('all')} />
                  <FilterBtn label="Critical" count={result.stats.critical} active={filter === 'critical'} onClick={() => setFilter('critical')} color="#ff3b30" />
                  <FilterBtn label="High" count={result.stats.high} active={filter === 'high'} onClick={() => setFilter('high')} color="#ff9f0a" />
                  <FilterBtn label="Medium" count={result.stats.medium} active={filter === 'medium'} onClick={() => setFilter('medium')} color="#ffcc00" />
                </div>

                {/* Finding Cards */}
                <div className="space-y-3">
                  {filtered.map((f, i) => (
                    <FindingCard key={`${f.ruleId}-${i}`} finding={f} />
                  ))}
                  {filtered.length === 0 && (
                    <p className="text-center text-sm text-[#86868b] py-8">
                      No {filter} severity findings.
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* How It Works */}
        <section className="mt-16">
          <h2 className="text-2xl font-semibold text-[#1d1d1f] tracking-tight mb-6">
            How It Works
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <StepCard step={1} title="Paste your config" desc="System prompt, agent code, or tool config JSON" />
            <StepCard step={2} title="Auto-detect & scan" desc="Identifies input type and runs 17+ security rules" />
            <StepCard step={3} title="Get actionable fixes" desc="Score (A-F) with specific code-level recommendations" />
          </div>
        </section>

        {/* Privacy */}
        <section className="mt-12 bg-white rounded-2xl p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-[#1d1d1f] mb-2">🔒 Privacy & Security</h3>
          <p className="text-[#86868b] text-sm leading-relaxed">
            All analysis runs in your browser. Your code and prompts are never sent to any server.
            No data is collected, stored, or logged.
          </p>
        </section>

        {/* What We Check */}
        <section className="mt-12">
          <h2 className="text-2xl font-semibold text-[#1d1d1f] tracking-tight mb-6">
            What We Check
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <CheckCategory icon="💉" title="Prompt Injection Defense" desc="Injection awareness, eval/exec usage" />
            <CheckCategory icon="🔑" title="Access Control" desc="Tool restrictions, action limits, shell injection" />
            <CheckCategory icon="🔒" title="Data Protection" desc="Hardcoded secrets, PII handling, data exposure" />
            <CheckCategory icon="🛡️" title="Input/Output Safety" desc="Output constraints, SQL injection, SSRF" />
            <CheckCategory icon="⚠️" title="Error Handling" desc="Error guidance, silent swallowing, role boundaries" />
            <CheckCategory icon="💰" title="Resource Management" desc="Cost controls, rate limits, budget constraints" />
          </div>
        </section>

        {/* FAQ */}
        <section className="mt-16">
          <h2 className="text-2xl font-semibold text-[#1d1d1f] tracking-tight mb-6">
            Frequently Asked Questions
          </h2>
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
        </section>

        {/* Related Tools */}
        <section className="mt-16">
          <h2 className="text-2xl font-semibold text-[#1d1d1f] tracking-tight mb-6">
            Related Tools
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <RelatedToolLink href="/dep-shield/" title="Dep Shield" desc="npm dependency vulnerability scanner" />
            <RelatedToolLink href="/env-scanner/" title="Env Scanner" desc=".env file security scanner" />
            <RelatedToolLink href="/pii-redactor/" title="PII Redactor" desc="Remove personal data from text" />
            <RelatedToolLink href="/agent-safety/" title="Agent Safety Checklist" desc="18-point security checklist" />
          </div>
        </section>

        {/* Footer */}
        <footer className="mt-12 border-t border-[#e8e8ed] pt-6 text-center text-sm text-[#86868b]">
          <p>Free AI Agent Security Checker. No login required.</p>
          <p className="mt-2">
            <a href="/" className="text-[#0071E3] hover:underline">AI Cost Calculator</a>
            <span className="mx-1.5">&middot;</span>
            <a href="/dep-shield/" className="text-[#0071E3] hover:underline">Dep Shield</a>
            <span className="mx-1.5">&middot;</span>
            <a href="/agent-safety/" className="text-[#0071E3] hover:underline">Safety Checklist</a>
          </p>
        </footer>
        <RelatedTools currentPath="/ai-agent-security/" />
        <FaqSchema items={FAQ_DATA.map((f: { q: string; a: string }) => ({ question: f.q, answer: f.a }))} />
      </main>
    </div>
  )
}

// ─── Sub-Components ──────────────────────────────────────────────────────

function StatCard({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className="text-center p-3 rounded-xl bg-[#f5f5f7]">
      <div className="text-2xl font-semibold" style={{ color }}>{value}</div>
      <div className="text-xs text-[#86868b] mt-1">{label}</div>
    </div>
  )
}

function FilterBtn({ label, count, active, onClick, color }: {
  label: string; count: number; active: boolean; onClick: () => void; color?: string
}) {
  return (
    <button
      onClick={onClick}
      className={`text-sm px-4 py-2 rounded-full transition-all ${
        active
          ? 'bg-[#1d1d1f] text-white shadow-sm'
          : 'bg-white text-[#86868b] hover:bg-[#e8e8ed] shadow-sm'
      }`}
    >
      <span style={active && color ? { color } : undefined}>{label}</span> ({count})
    </button>
  )
}

function FindingCard({ finding }: { finding: ScanResult['findings'][0] }) {
  const [expanded, setExpanded] = useState(false)

  return (
    <div className="bg-white rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-start gap-3">
        <span className={`flex-shrink-0 text-xs px-2.5 py-1 rounded-full text-white font-medium ${SEVERITY_BG[finding.severity]}`}>
          {finding.severity.toUpperCase()}
        </span>
        <div className="flex-1 min-w-0">
          <h3 className="font-medium text-[#1d1d1f] text-base">{finding.title}</h3>
          {finding.line > 0 && (
            <span className="text-xs text-[#86868b] mt-1">Line {finding.line}</span>
          )}
          <button
            onClick={() => setExpanded(!expanded)}
            className="text-sm text-[#0071E3] hover:underline mt-1.5 block"
          >
            {expanded ? 'Hide details' : 'Show details'}
          </button>
          {expanded && (
            <div className="mt-4 space-y-3">
              <p className="text-sm text-[#86868b] leading-relaxed">{finding.detail}</p>
              {finding.snippet && (
                <div>
                  <span className="text-xs text-[#86868b] font-medium">Matched:</span>
                  <pre className="mt-1 text-sm bg-[#1d1d1f] text-[#ff9f0a] p-3 rounded-xl overflow-x-auto font-mono">
                    {finding.snippet}
                  </pre>
                </div>
              )}
              <div>
                <span className="text-xs text-[#30d158] font-medium">Fix:</span>
                <p className="mt-1 text-sm text-[#1d1d1f] leading-relaxed">{finding.fix}</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function StepCard({ step, title, desc }: { step: number; title: string; desc: string }) {
  return (
    <div className="bg-white rounded-2xl p-5 shadow-sm">
      <div className="w-8 h-8 rounded-full bg-[#0071E3]/10 text-[#0071E3] flex items-center justify-center text-sm font-semibold mb-3">
        {step}
      </div>
      <h3 className="font-medium text-[#1d1d1f] mb-1">{title}</h3>
      <p className="text-sm text-[#86868b]">{desc}</p>
    </div>
  )
}

function CheckCategory({ icon, title, desc }: { icon: string; title: string; desc: string }) {
  return (
    <div className="bg-white rounded-2xl p-4 shadow-sm flex items-center gap-3">
      <span className="text-2xl">{icon}</span>
      <div>
        <h3 className="font-medium text-[#1d1d1f] text-sm">{title}</h3>
        <p className="text-xs text-[#86868b]">{desc}</p>
      </div>
    </div>
  )
}

function RelatedToolLink({ href, title, desc }: { href: string; title: string; desc: string }) {
  return (
    <a href={href} className="bg-white rounded-2xl p-4 shadow-sm hover:shadow-md transition-shadow block">
      <h3 className="font-medium text-[#1d1d1f] text-sm">{title}</h3>
      <p className="text-xs text-[#86868b] mt-0.5">{desc}</p>
    </a>
  )
}

const FAQ_DATA = [
  {
    q: 'What types of input does this tool accept?',
    a: 'The tool auto-detects three input types: system prompts (plain text), agent code (Python, JavaScript, TypeScript), and tool configurations (JSON). Each type runs a different set of security rules optimized for that format.',
  },
  {
    q: 'How is the security score calculated?',
    a: 'The score starts at 100 and is reduced by finding severity: -25 for Critical, -15 for High, -8 for Medium, and -3 for Low. Grades: A (90-100), B (75-89), C (60-74), D (40-59), F (0-39).',
  },
  {
    q: 'What is prompt injection and why is it dangerous?',
    a: 'Prompt injection is when malicious instructions hidden in user input trick an AI agent into ignoring its system prompt. For agents with tool access (APIs, databases, file systems), this can lead to data theft, unauthorized actions, or system compromise.',
  },
  {
    q: 'Is this a replacement for professional security audits?',
    a: 'No. This is a quick automated check for common vulnerabilities. It catches the most frequent issues (hardcoded secrets, eval usage, missing guardrails) but cannot replace a thorough security review by experienced professionals.',
  },
  {
    q: 'How does the tool detect input type?',
    a: 'The tool checks if the input is valid JSON (config mode), contains code patterns like import statements or function definitions (code mode), or is plain text (prompt mode). Detection happens entirely in your browser.',
  },
]
