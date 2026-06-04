// src/dep-shield/DepShieldApp.tsx — npm dependency vulnerability scanner, Apple design style

import { useState, useCallback, useRef, useMemo } from 'react'
import { GlobalNav } from '../components/GlobalNav'
import { RelatedTools } from '../components/RelatedTools'
import {
  parsePackageJson,
  scanVulnerabilities,
  computeStats,
  generateFixCommands,
  isValidPackageJson,
  SEVERITY_BG,
  type VulnResult,
  type ScanResult,
  type ApiCallLog,
} from './scanner'

const SAMPLE_PKG = `{
  "name": "my-app",
  "version": "1.0.0",
  "dependencies": {
    "express": "^4.17.1",
    "lodash": "^4.17.15",
    "axios": "^0.21.1",
    "jsonwebtoken": "^8.5.1",
    "bcrypt": "^5.0.0"
  },
  "devDependencies": {
    "jest": "^26.0.0",
    "eslint": "^7.0.0"
  }
}`

type ScanState = 'idle' | 'parsing' | 'scanning' | 'done' | 'error'

export default function DepShieldApp() {
  const [input, setInput] = useState('')
  const [state, setState] = useState<ScanState>('idle')
  const [result, setResult] = useState<ScanResult | null>(null)
  const [error, setError] = useState('')
  const [apiLogs, setApiLogs] = useState<ApiCallLog[]>([])
  const [copiedFix, setCopiedFix] = useState(false)
  const [filterSev, setFilterSev] = useState<string>('all')
  const [isDragging, setIsDragging] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const parsedDeps = useMemo(() => {
    if (!input.trim()) return []
    return parsePackageJson(input)
  }, [input])

  const filteredVulns = useMemo(() => {
    if (!result) return []
    if (filterSev === 'all') return result.vulns
    return result.vulns.filter(v => v.severity === filterSev)
  }, [result, filterSev])

  const fixCommands = useMemo(() => {
    if (!result) return []
    return generateFixCommands(result.vulns)
  }, [result])

  const handleScan = useCallback(async () => {
    if (!input.trim()) return

    const deps = parsePackageJson(input)
    if (deps.length === 0) {
      setError('No dependencies found. Paste a valid package.json with dependencies or devDependencies.')
      setState('error')
      return
    }

    setState('scanning')
    setError('')
    setApiLogs([])

    try {
      const vulns = await scanVulnerabilities(deps, log => {
        setApiLogs(prev => [...prev, log])
      })
      setResult({ deps, vulns, stats: computeStats(vulns) })
      setState('done')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Scan failed')
      setState('error')
    }
  }, [input])

  const handleFileDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    const file = e.dataTransfer.files[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (ev) => {
        const text = ev.target?.result as string
        setInput(text)
      }
      reader.readAsText(file)
    }
  }, [])

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (ev) => {
        const text = ev.target?.result as string
        setInput(text)
      }
      reader.readAsText(file)
    }
  }, [])

  const copyFix = async () => {
    if (fixCommands.length === 0) return
    const text = fixCommands.join('\n')
    try {
      await navigator.clipboard.writeText(text)
      setCopiedFix(true)
      setTimeout(() => setCopiedFix(false), 1500)
    } catch { /* noop */ }
  }

  const reset = () => {
    setInput('')
    setResult(null)
    setState('idle')
    setError('')
    setApiLogs([])
    setFilterSev('all')
  }

  const isScanning = state === 'scanning'

  return (
    <div className="min-h-screen bg-[#f5f5f7] text-[#1d1d1f]">
      <GlobalNav current="/dep-shield/" />

      {/* Hero */}
      <header className="max-w-[1080px] mx-auto px-4 pt-12 pb-4 text-center">
        <h1 className="text-4xl sm:text-5xl font-semibold tracking-tight mb-3">
          Dep Shield
        </h1>
        <p className="text-lg text-[#86868b] max-w-2xl mx-auto">
          Scan your package.json for known vulnerabilities.
          Get exact fix commands. Powered by Google OSV database.
        </p>

        {/* Trust bar */}
        <div className="mt-5 inline-flex items-center gap-3 bg-white px-4 py-2 rounded-full text-sm shadow-sm">
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-[#30d158]" />
            <span className="text-[#1d1d1f]">{apiLogs.length} OSV API call{apiLogs.length !== 1 ? 's' : ''} ({apiLogs.filter(l => l.status === 200).length} ok)</span>
          </span>
          <span className="text-[#86868b]">&middot;</span>
          <span className="text-[#86868b]">Only package names sent to osv.dev</span>
        </div>
      </header>

      {/* Main */}
      <main className="max-w-[1080px] mx-auto px-4 pb-16">

        {/* Input area */}
        <div className="bg-white rounded-2xl p-5 shadow-sm mb-6">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold text-[#86868b] uppercase tracking-wide">
              package.json
            </h2>
            <div className="flex gap-2">
              <button onClick={() => setInput(SAMPLE_PKG)} className="text-xs text-[#0071E3] hover:underline">
                Example
              </button>
              <button onClick={reset} className="text-xs text-[#86868b] hover:text-[#1d1d1f]">
                Clear
              </button>
            </div>
          </div>

          {/* Drop zone */}
          <div
            onDragOver={e => { e.preventDefault(); setIsDragging(true) }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleFileDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`
              relative rounded-xl border-2 border-dashed transition-all cursor-pointer
              ${isDragging
                ? 'border-[#0071E3] bg-[#0071E3]/5'
                : input ? 'border-transparent' : 'border-[#e8e8ed] hover:border-[#0071E3]/40'
              }
            `}
          >
            {input ? (
              <textarea
                value={input}
                onChange={e => { setInput(e.target.value); if (state === 'done' || state === 'error') setState('idle') }}
                onClick={e => e.stopPropagation()}
                placeholder="Paste your package.json here..."
                className="w-full h-56 p-3 rounded-xl font-mono text-sm bg-[#fafafa] focus:outline-none focus:ring-2 focus:ring-[#0071E3]/20 resize-y border border-[#e8e8ed]"
                spellCheck={false}
              />
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-[#86868b]">
                <svg className="w-10 h-10 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
                </svg>
                <p className="font-medium">Drop package.json here or click to browse</p>
                <p className="text-sm mt-1">Or paste content directly</p>
              </div>
            )}
            <input
              ref={fileInputRef}
              type="file"
              accept=".json"
              onChange={handleFileSelect}
              className="hidden"
            />
          </div>

          {/* Scan button */}
          <div className="flex items-center justify-between mt-4">
            <span className="text-sm text-[#86868b]">
              {parsedDeps.length > 0
                ? `${parsedDeps.length} dependenc${parsedDeps.length !== 1 ? 'ies' : 'y'} found`
                : 'Paste a package.json to scan'
              }
            </span>
            <button
              onClick={handleScan}
              disabled={!input.trim() || isScanning}
              className={`
                px-6 py-2.5 rounded-xl text-sm font-medium transition-all
                ${!input.trim() || isScanning
                  ? 'bg-[#e8e8ed] text-[#86868b] cursor-not-allowed'
                  : 'bg-[#0071E3] text-white hover:bg-[#0077ED] active:scale-[0.98]'
                }
              `}
            >
              {isScanning ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Scanning...
                </span>
              ) : 'Scan Dependencies'}
            </button>
          </div>

          {/* Validation error */}
          {input.trim() && !isValidPackageJson(input) && state !== 'scanning' && (
            <p className="text-sm text-[#ff3b30] mt-2">Not a valid package.json format</p>
          )}
        </div>

        {/* Error */}
        {state === 'error' && error && (
          <div className="bg-[#ff3b30]/10 rounded-2xl p-4 mb-6 text-[#ff3b30] text-sm">
            {error}
          </div>
        )}

        {/* Results */}
        {result && state === 'done' && (
          <>
            {/* Stats cards */}
            <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-7 gap-3 mb-6">
              <StatCard label="Dependencies" value={result.deps.length} />
              <StatCard label="Vulnerabilities" value={result.stats.total} accent />
              <StatCard label="Critical" value={result.stats.critical} color="#ff3b30" />
              <StatCard label="High" value={result.stats.high} color="#ff9f0a" />
              <StatCard label="Medium" value={result.stats.medium} color="#ffcc00" />
              <StatCard label="Low" value={result.stats.low} color="#30d158" />
              <StatCard label="Fixable" value={result.stats.fixable} color="#0071E3" />
            </div>

            {/* All clear */}
            {result.stats.total === 0 && (
              <div className="bg-white rounded-2xl p-8 shadow-sm text-center mb-6">
                <span className="text-4xl mb-3 block">&#x2705;</span>
                <h3 className="text-xl font-semibold mb-1">All Clear</h3>
                <p className="text-[#86868b]">
                  No known vulnerabilities found in {result.deps.length} dependenc{result.deps.length !== 1 ? 'ies' : 'y'}.
                </p>
              </div>
            )}

            {/* Fix commands */}
            {fixCommands.length > 0 && (
              <div className="bg-white rounded-2xl p-5 shadow-sm mb-6">
                <div className="flex items-center justify-between mb-3">
                  <h2 className="text-sm font-semibold text-[#86868b] uppercase tracking-wide">
                    Fix Commands
                  </h2>
                  <button
                    onClick={copyFix}
                    className="text-xs px-3 py-1.5 rounded-lg bg-[#0071E3] text-white hover:bg-[#0077ED] transition-colors"
                  >
                    {copiedFix ? 'Copied!' : 'Copy All'}
                  </button>
                </div>
                <div className="bg-[#1d1d1f] rounded-xl p-4 font-mono text-sm text-[#30d158] space-y-1 overflow-x-auto">
                  {fixCommands.map((cmd, i) => (
                    <div key={i}>{cmd}</div>
                  ))}
                </div>
              </div>
            )}

            {/* Filter + Vulnerability list */}
            {result.vulns.length > 0 && (
              <div className="bg-white rounded-2xl p-5 shadow-sm mb-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-sm font-semibold text-[#86868b] uppercase tracking-wide">
                    Vulnerabilities
                  </h2>
                  <div className="flex gap-1">
                    {['all', 'CRITICAL', 'HIGH', 'MEDIUM', 'LOW'].map(s => (
                      <button
                        key={s}
                        onClick={() => setFilterSev(s)}
                        className={`text-xs px-2.5 py-1 rounded-lg transition-colors ${
                          filterSev === s
                            ? 'bg-[#0071E3] text-white'
                            : 'bg-[#f5f5f7] text-[#86868b] hover:bg-[#e8e8ed]'
                        }`}
                      >
                        {s === 'all' ? 'All' : s.charAt(0) + s.slice(1).toLowerCase()}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-2 max-h-[600px] overflow-y-auto">
                  {filteredVulns.map(v => (
                    <VulnCard key={v.id + v.packageName} vuln={v} />
                  ))}
                  {filteredVulns.length === 0 && (
                    <div className="text-center py-8 text-[#86868b]">
                      No {filterSev.toLowerCase() !== 'all' ? filterSev.toLowerCase() : ''} vulnerabilities
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Dependency list */}
            <div className="bg-white rounded-2xl p-5 shadow-sm mb-6">
              <h2 className="text-sm font-semibold text-[#86868b] uppercase tracking-wide mb-3">
                Scanned Dependencies
              </h2>
              <div className="flex flex-wrap gap-2">
                {result.deps.map(dep => (
                  <span
                    key={dep.name}
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm ${
                      dep.isDev ? 'bg-[#f5f5f7] text-[#86868b]' : 'bg-white border border-[#e8e8ed]'
                    }`}
                  >
                    <span className="font-medium">{dep.name}</span>
                    <span className="font-mono text-xs text-[#86868b]">{dep.version}</span>
                    {dep.isDev && <span className="text-[10px] px-1 py-0.5 rounded bg-[#e8e8ed]">dev</span>}
                  </span>
                ))}
              </div>
            </div>
          </>
        )}

        {/* How it works */}
        <div className="bg-white rounded-2xl p-6 shadow-sm mb-8">
          <h2 className="text-lg font-semibold mb-4">How It Works</h2>
          <div className="grid sm:grid-cols-3 gap-4">
            {([
              { step: '1', title: 'Paste package.json', desc: 'Drop your file or paste the JSON. No login needed.' },
              { step: '2', title: 'OSV Database Lookup', desc: 'Package names are queried against Google\'s open source vulnerability database.' },
              { step: '3', title: 'Get Fix Commands', desc: 'See CVEs ranked by severity with exact npm install commands to fix them.' },
            ]).map(({ step, title, desc }) => (
              <div key={step} className="p-4 rounded-xl bg-[#fafafa]">
                <div className="w-8 h-8 rounded-full bg-[#0071E3] text-white flex items-center justify-center text-sm font-semibold mb-2">
                  {step}
                </div>
                <h3 className="font-medium text-sm mb-1">{title}</h3>
                <p className="text-xs text-[#86868b]">{desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Privacy */}
        <div className="bg-white rounded-2xl p-6 shadow-sm mb-8">
          <h2 className="text-lg font-semibold mb-4">Privacy & Security</h2>
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="p-4 rounded-xl bg-[#30d158]/10">
              <h3 className="font-medium text-[#1d8a3a] mb-1">&#x2713; Minimal Data Sent</h3>
              <p className="text-sm text-[#86868b]">Only package names and version ranges go to the public OSV API. No code, no scripts, no file contents.</p>
            </div>
            <div className="p-4 rounded-xl bg-[#30d158]/10">
              <h3 className="font-medium text-[#1d8a3a] mb-1">&#x2713; Open Source Database</h3>
              <p className="text-sm text-[#86868b]">Vulnerability data comes from osv.dev, Google\'s open aggregator of npm audit, GitHub Advisories, and more.</p>
            </div>
          </div>
        </div>

        {/* FAQ */}
        <div className="bg-white rounded-2xl p-6 shadow-sm mb-8">
          <h2 className="text-lg font-semibold mb-4">FAQ</h2>
          <div className="space-y-4">
            {[
              { q: 'How do I check my npm dependencies for vulnerabilities?', a: 'Paste your package.json into Dep Shield. It queries the Google OSV database for every dependency and shows known CVEs with severity, affected versions, and exact npm install commands to fix them.' },
              { q: 'What is the OSV database?', a: 'OSV (Open Source Vulnerabilities) is Google\'s free vulnerability database. It aggregates data from npm audit, GitHub Security Advisories, and other sources into a single queryable API.' },
              { q: 'How is this different from npm audit?', a: 'npm audit requires Node.js installed locally. Dep Shield works in any browser with zero setup. It shows fix commands and severity in a visual interface.' },
              { q: 'Does it support Python, Go, or other ecosystems?', a: 'Currently Dep Shield supports npm (Node.js) packages. The OSV database also covers PyPI, Go, Maven, and others.' },
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
            <a href="/env-scanner/" className="text-sm px-4 py-2 rounded-xl bg-white shadow-sm hover:shadow-md transition-shadow">Env Scanner</a>
            <a href="/pii-redactor/" className="text-sm px-4 py-2 rounded-xl bg-white shadow-sm hover:shadow-md transition-shadow">PII Redactor</a>
            <a href="/csp-generator/" className="text-sm px-4 py-2 rounded-xl bg-white shadow-sm hover:shadow-md transition-shadow">CSP Generator</a>
            <a href="/agent-safety/" className="text-sm px-4 py-2 rounded-xl bg-white shadow-sm hover:shadow-md transition-shadow">Agent Safety</a>
          </div>
        </div>
        <RelatedTools currentPath="/dep-shield/" />
      </main>
    </div>
  )
}

function StatCard({ label, value, accent, color }: {
  label: string
  value: number
  accent?: boolean
  color?: string
}) {
  return (
    <div className="bg-white rounded-2xl p-4 shadow-sm text-center">
      <div className="text-2xl font-semibold" style={color ? { color } : accent ? { color: '#0071E3' } : undefined}>
        {value}
      </div>
      <div className="text-sm text-[#86868b]">{label}</div>
    </div>
  )
}

function VulnCard({ vuln }: { vuln: VulnResult }) {
  const [expanded, setExpanded] = useState(false)

  const bgClass = SEVERITY_BG[vuln.severity] || 'bg-[#86868b]'

  return (
    <div className="rounded-xl bg-[#fafafa] border border-[#e8e8ed] overflow-hidden">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-start gap-3 p-3 text-left hover:bg-[#f0f0f2] transition-colors"
      >
        <span className={`shrink-0 mt-0.5 text-xs font-semibold px-2 py-0.5 rounded-full text-white ${bgClass}`}>
          {vuln.severity}
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 mb-0.5">
            <span className="text-sm font-medium">{vuln.packageName}</span>
            <code className="text-xs px-1.5 py-0.5 rounded bg-[#e8e8ed] text-[#86868b] font-mono">
              {vuln.installedVersion}
            </code>
          </div>
          <p className="text-xs text-[#86868b] line-clamp-1">{vuln.summary}</p>
        </div>
        <svg
          className={`shrink-0 w-4 h-4 text-[#86868b] transition-transform mt-1 ${expanded ? 'rotate-180' : ''}`}
          fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {expanded && (
        <div className="px-4 pb-3 border-t border-[#e8e8ed]">
          <div className="space-y-2 pt-2">
            <div>
              <span className="text-xs text-[#86868b]">ID: </span>
              <a
                href={vuln.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-[#0071E3] hover:underline"
              >
                {vuln.id}
              </a>
            </div>
            {vuln.aliases.length > 0 && (
              <div>
                <span className="text-xs text-[#86868b]">Aliases: </span>
                <span className="text-xs font-mono text-[#86868b]">{vuln.aliases.join(', ')}</span>
              </div>
            )}
            {vuln.fixedIn.length > 0 && (
              <div>
                <span className="text-xs text-[#86868b]">Fixed in: </span>
                <code className="text-xs font-mono text-[#30d158]">{vuln.fixedIn.join(', ')}</code>
              </div>
            )}
            {vuln.fixedIn.length > 0 && (
              <div className="bg-[#1d1d1f] rounded-lg px-3 py-1.5 font-mono text-xs text-[#30d158]">
                npm install {vuln.packageName}@{vuln.fixedIn[vuln.fixedIn.length - 1]}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
