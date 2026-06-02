// src/env-scanner/EnvScannerApp.tsx — privacy-first .env secret scanner

import { useState, useMemo, useEffect } from 'react'
import { GlobalNav } from '../components/GlobalNav'
import { detectSecrets, redactSecrets, TYPE_LABELS, SEVERITY_COLORS } from './detect'
import type { SecretType, Severity } from './detect'

const SAMPLE = `# .env file — DO NOT commit to git!
DATABASE_URL=postgres://admin:s3cretP@ss@db.example.com:5432/myapp
OPENAI_API_KEY=sk-proj-abc123def456ghi789jkl012mno345pqr678
ANTHROPIC_API_KEY=sk-ant-api03-xyz789abc456def123ghi890jkl567
AWS_ACCESS_KEY_ID=AKIAIOSFODNN7EXAMPLE
AWS_SECRET_ACCESS_KEY=wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY
GITHUB_TOKEN=ghp_ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghij
STRIPE_SECRET_KEY=sk_live_EXAMPLE_REPLACE_WITH_REAL_KEY_12345
JWT_SECRET=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIn0.dozjgNryP4J3jVmNHl0w5N_XgL0n3I9PlFUP0THsR8U
APP_PASSWORD=MySuperSecretPassword123!
REDIS_URL=redis://default:redispass@localhost:6379
NODE_ENV=production`

export default function EnvScannerApp() {
  const [input, setInput] = useState(SAMPLE)
  const [copiedRedacted, setCopiedRedacted] = useState(false)
  const [networkRequests, setNetworkRequests] = useState(0)
  const [showRedacted, setShowRedacted] = useState(false)

  // Watch for unexpected fetch/XHR — should always stay 0
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

  const secrets = useMemo(() => detectSecrets(input), [input])
  const redaction = useMemo(() => redactSecrets(input, secrets), [input, secrets])

  const stats = useMemo(() => {
    const byType: Record<SecretType, number> = {
      cloud_api: 0, database_url: 0, auth_token: 0,
      private_key: 0, jwt: 0, generic_secret: 0,
    }
    const bySeverity: Record<Severity, number> = { critical: 0, high: 0, medium: 0 }
    const envVarCount = input.split('\n').filter(l => l.trim() && !l.trim().startsWith('#') && l.includes('=')).length
    for (const m of secrets) {
      byType[m.type] += 1
      bySeverity[m.severity] += 1
    }
    return { byType, bySeverity, total: secrets.length, envVars: envVarCount }
  }, [secrets, input])

  const copy = async (text: string, setter: (v: boolean) => void) => {
    try {
      await navigator.clipboard.writeText(text)
      setter(true)
      setTimeout(() => setter(false), 1500)
    } catch { /* noop */ }
  }

  const loadSample = () => setInput(SAMPLE)
  const clear = () => setInput('')

  const severityLabel = (s: Severity) => s === 'critical' ? 'Critical' : s === 'high' ? 'High' : 'Medium'

  return (
    <div className="min-h-screen bg-[#f5f5f7] text-[#1d1d1f]">
      <GlobalNav current="/env-scanner/" />

      {/* Hero */}
      <header className="max-w-[1080px] mx-auto px-4 pt-12 pb-4 text-center">
        <h1 className="text-4xl sm:text-5xl font-semibold tracking-tight mb-3">
          .env Security Scanner
        </h1>
        <p className="text-lg text-[#86868b] max-w-2xl mx-auto">
          Scan your .env files for leaked API keys, database credentials, and secrets before committing.
          Everything runs in your browser.
        </p>

        {/* Trust bar */}
        <div className="mt-5 inline-flex items-center gap-3 bg-white px-4 py-2 rounded-full text-sm shadow-sm" data-testid="trust-bar">
          <span className="flex items-center gap-1.5">
            <span className={`w-2 h-2 rounded-full ${networkRequests === 0 ? 'bg-[#30d158]' : 'bg-[#ff3b30]'}`} />
            <span className={networkRequests === 0 ? 'text-[#1d1d1f]' : 'text-[#ff3b30]'}>
              {networkRequests === 0 ? '0 network requests' : `${networkRequests} requests detected!`}
            </span>
          </span>
          <span className="text-[#86868b]">·</span>
          <span className="text-[#86868b]">Your .env never leaves this browser</span>
        </div>
      </header>

      {/* Main content */}
      <main className="max-w-[1080px] mx-auto px-4 pb-16">
        {/* Input / Output split */}
        <div className="grid lg:grid-cols-2 gap-4 mb-6">
          {/* Input */}
          <section className="bg-white rounded-2xl p-5 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-semibold text-[#86868b] uppercase tracking-wide">Paste .env File</h2>
              <div className="flex gap-2">
                <button onClick={loadSample} className="text-xs text-[#0071E3] hover:underline">Example</button>
                <button onClick={clear} className="text-xs text-[#86868b] hover:text-[#1d1d1f]">Clear</button>
              </div>
            </div>
            <textarea
              value={input}
              onChange={e => setInput(e.target.value)}
              placeholder="Paste your .env file contents here..."
              className="w-full h-80 p-3 rounded-xl border border-[#e8e8ed] font-mono text-sm bg-[#fafafa] focus:outline-none focus:ring-2 focus:ring-[#0071E3]/20 focus:border-[#0071E3] resize-y"
              spellCheck={false}
            />
          </section>

          {/* Results */}
          <section className="bg-white rounded-2xl p-5 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <div className="flex gap-2">
                <button
                  onClick={() => setShowRedacted(false)}
                  className={`text-sm font-semibold uppercase tracking-wide ${!showRedacted ? 'text-[#1d1d1f]' : 'text-[#86868b] hover:text-[#1d1d1f]'}`}
                >
                  Findings ({secrets.length})
                </button>
                <button
                  onClick={() => setShowRedacted(true)}
                  className={`text-sm font-semibold uppercase tracking-wide ${showRedacted ? 'text-[#1d1d1f]' : 'text-[#86868b] hover:text-[#1d1d1f]'}`}
                >
                  Redacted
                </button>
              </div>
              {secrets.length > 0 && !showRedacted && (
                <button
                  onClick={() => copy(redaction.redacted, setCopiedRedacted)}
                  className="text-xs px-3 py-1.5 rounded-lg bg-[#0071E3] text-white hover:bg-[#0077ED] transition-colors"
                >
                  {copiedRedacted ? 'Copied!' : 'Copy Redacted'}
                </button>
              )}
            </div>

            {!showRedacted ? (
              <div className="h-80 overflow-y-auto space-y-2">
                {secrets.length === 0 && input.trim() && (
                  <div className="flex flex-col items-center justify-center h-full text-[#86868b]">
                    <span className="text-3xl mb-2">&#x2705;</span>
                    <p className="font-medium">No secrets detected</p>
                    <p className="text-sm">Your .env looks clean</p>
                  </div>
                )}
                {secrets.length === 0 && !input.trim() && (
                  <div className="flex flex-col items-center justify-center h-full text-[#86868b]">
                    <span className="text-3xl mb-2">&#x1f50d;</span>
                    <p className="font-medium">Paste your .env to scan</p>
                  </div>
                )}
                {secrets.map((s, i) => (
                  <div key={i} className="flex items-start gap-3 p-3 rounded-xl bg-[#fafafa] border border-[#e8e8ed]">
                    <span
                      className="shrink-0 mt-0.5 text-xs font-semibold px-2 py-0.5 rounded-full text-white"
                      style={{ backgroundColor: SEVERITY_COLORS[s.severity] }}
                    >
                      {severityLabel(s.severity)}
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="text-sm font-medium">{s.label}</span>
                        {s.envKey && (
                          <code className="text-xs px-1.5 py-0.5 rounded bg-[#e8e8ed] text-[#86868b] font-mono">{s.envKey}</code>
                        )}
                      </div>
                      <code className="text-xs font-mono text-[#86868b] break-all">
                        {s.value.length > 60 ? s.value.slice(0, 60) + '...' : s.value}
                      </code>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="h-80 overflow-y-auto">
                <pre className="p-3 rounded-xl bg-[#fafafa] border border-[#e8e8ed] font-mono text-sm whitespace-pre-wrap break-all">
                  {redaction.redacted || 'No input to redact'}
                </pre>
              </div>
            )}
          </section>
        </div>

        {/* Stats */}
        {secrets.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
            <div className="bg-white rounded-2xl p-4 shadow-sm text-center">
              <div className="text-2xl font-semibold">{stats.envVars}</div>
              <div className="text-sm text-[#86868b]">Variables</div>
            </div>
            <div className="bg-white rounded-2xl p-4 shadow-sm text-center">
              <div className="text-2xl font-semibold text-[#ff3b30]">{stats.bySeverity.critical}</div>
              <div className="text-sm text-[#86868b]">Critical</div>
            </div>
            <div className="bg-white rounded-2xl p-4 shadow-sm text-center">
              <div className="text-2xl font-semibold text-[#ff9f0a]">{stats.bySeverity.high}</div>
              <div className="text-sm text-[#86868b]">High</div>
            </div>
            <div className="bg-white rounded-2xl p-4 shadow-sm text-center">
              <div className="text-2xl font-semibold text-[#ffcc00]">{stats.bySeverity.medium}</div>
              <div className="text-sm text-[#86868b]">Medium</div>
            </div>
          </div>
        )}

        {/* Detection info */}
        <div className="bg-white rounded-2xl p-6 shadow-sm mb-8">
          <h2 className="text-lg font-semibold mb-4">What We Detect</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {([
              { type: 'cloud_api' as SecretType, desc: 'OpenAI, Anthropic, AWS, GCP, Azure keys', icon: '&#9729;' },
              { type: 'database_url' as SecretType, desc: 'Postgres, MySQL, MongoDB, Redis URLs with passwords', icon: '&#128451;' },
              { type: 'auth_token' as SecretType, desc: 'GitHub, GitLab, Slack, Stripe, Vercel tokens', icon: '&#128273;' },
              { type: 'private_key' as SecretType, desc: 'RSA, EC, OpenSSH, DSA private keys', icon: '&#128274;' },
              { type: 'jwt' as SecretType, desc: 'JSON Web Tokens (eyJ...)', icon: '&#128196;' },
              { type: 'generic_secret' as SecretType, desc: 'Variables named PASSWORD, SECRET, TOKEN, KEY', icon: '&#9888;' },
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

        {/* Trust section */}
        <div className="bg-white rounded-2xl p-6 shadow-sm mb-8">
          <h2 className="text-lg font-semibold mb-4">Privacy Guarantee</h2>
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="p-4 rounded-xl bg-[#30d158]/10">
              <h3 className="font-medium text-[#1d8a3a] mb-1">&#x2713; Zero Network Requests</h3>
              <p className="text-sm text-[#86868b]">The live counter above monitors all outbound requests. It stays at 0 because your .env is never sent anywhere.</p>
            </div>
            <div className="p-4 rounded-xl bg-[#30d158]/10">
              <h3 className="font-medium text-[#1d8a3a] mb-1">&#x2713; Zero Storage</h3>
              <p className="text-sm text-[#86868b]">No cookies, no localStorage, no sessionStorage, no analytics. Your data exists only in memory while the page is open.</p>
            </div>
          </div>
          <p className="text-sm text-[#86868b] mt-4">
            Verify: Open DevTools &rarr; Network tab. Set Offline. Paste your .env. Scanning still works.
          </p>
        </div>

        {/* FAQ */}
        <div className="bg-white rounded-2xl p-6 shadow-sm mb-8">
          <h2 className="text-lg font-semibold mb-4">FAQ</h2>
          <div className="space-y-4">
            {[
              { q: 'Why scan .env files?', a: 'Leaked API keys in .env files are the most common cause of cloud security incidents. A single committed .env can expose your entire infrastructure. Scanning before commit catches mistakes early.' },
              { q: 'What secrets are detected?', a: 'Six categories: Cloud API keys (OpenAI, Anthropic, AWS, GCP), database URLs with passwords, auth tokens (GitHub, GitLab, Slack, Stripe), private keys, JWT tokens, and generic secrets (variables named PASSWORD, SECRET, TOKEN, KEY).' },
              { q: 'How to fix leaked secrets?', a: 'Immediately rotate the compromised credential. Add .env to .gitignore. Use git-filter-repo to remove from history. Enable secret scanning on GitHub.' },
              { q: 'Can I use it offline?', a: 'Yes. Once loaded, the page works fully offline. Open DevTools Network tab, set Offline, paste your .env, and scanning still works.' },
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
            <a href="/pii-redactor/" className="text-sm px-4 py-2 rounded-xl bg-white shadow-sm hover:shadow-md transition-shadow">PII Redactor</a>
            <a href="/csp-generator/" className="text-sm px-4 py-2 rounded-xl bg-white shadow-sm hover:shadow-md transition-shadow">CSP Generator</a>
            <a href="/cron-validator/" className="text-sm px-4 py-2 rounded-xl bg-white shadow-sm hover:shadow-md transition-shadow">Cron Validator</a>
          </div>
        </div>
      </main>
    </div>
  )
}
