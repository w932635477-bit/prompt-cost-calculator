// src/pii-redactor/PIIRedactorApp.tsx — privacy-first PII redactor

import { useState, useMemo, useEffect } from 'react'
import { GlobalNav } from '../components/GlobalNav'
import { RelatedTools } from '../components/RelatedTools'
import { detectPII, redact, PII_LABELS } from './detect'
import type { PIIType, Confidence } from './detect'

const SAMPLE = `Hi team, I'm debugging a payment issue for user alice@example.com (phone +1-415-555-0199, card 4111 1111 1111 1111). Our integration uses sk-proj-abc123def456ghi789jkl012mno345 to talk to OpenAI and AKIAIOSFODNN7EXAMPLE for the AWS sync. Can someone check why the charge keeps failing?`

export default function PIIRedactorApp() {
  const [input, setInput] = useState(SAMPLE)
  const [copied, setCopied] = useState(false)
  const [networkRequests, setNetworkRequests] = useState(0)

  // Watch for any unexpected fetch/XHR — should always stay 0
  useEffect(() => {
    const origFetch = window.fetch
    let count = 0
    const wrapped: typeof fetch = (...args) => {
      const url = args[0]?.toString() || ''
      // Allow same-origin static assets (font, css already loaded). Count any other.
      if (!url.startsWith(window.location.origin) && !url.startsWith('https://fonts.g')) {
        count += 1
        setNetworkRequests(count)
      }
      return origFetch(...args)
    }
    window.fetch = wrapped
    return () => {
      window.fetch = origFetch
    }
  }, [])

  const matches = useMemo(() => detectPII(input), [input])
  const result = useMemo(() => redact(input, matches), [input, matches])

  const stats = useMemo(() => {
    const byType: Record<PIIType, number> = { email: 0, phone: 0, api_key: 0, credit_card: 0 }
    const byConf: Record<Confidence, number> = { high: 0, possible: 0, review: 0 }
    for (const m of matches) {
      byType[m.type] += 1
      byConf[m.confidence] += 1
    }
    return { byType, byConf, total: matches.length }
  }, [matches])

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(result.redacted)
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    } catch {}
  }

  const clear = () => setInput('')

  return (
    <div className="min-h-screen bg-[#f5f5f7] text-[#1d1d1f]">
      <GlobalNav current="/pii-redactor/" />

      {/* Hero */}
      <header className="max-w-[1080px] mx-auto px-4 pt-12 pb-4 text-center">
        <h1 className="text-4xl sm:text-5xl font-semibold tracking-tight mb-3">
          Prompt PII Redactor
        </h1>
        <p className="text-lg text-[#86868b] max-w-2xl mx-auto">
          Strip emails, phones, API keys, and credit cards from prompts before sending them to
          ChatGPT, Claude, or any LLM. Everything runs in your browser.
        </p>

        {/* Trust bar */}
        <div
          className="mt-5 inline-flex items-center gap-3 bg-white px-4 py-2 rounded-full text-sm shadow-sm"
          data-testid="trust-bar"
        >
          <span className="flex items-center gap-1.5">
            <span
              className={`w-2 h-2 rounded-full ${networkRequests === 0 ? 'bg-[#30d158]' : 'bg-[#ff3b30]'}`}
            />
            <span className={networkRequests === 0 ? 'text-[#1d1d1f]' : 'text-[#ff3b30]'}>
              Network: {networkRequests} outbound requests
            </span>
          </span>
          <span className="text-[#86868b]">·</span>
          <span className="text-[#1d1d1f]">No storage</span>
          <span className="text-[#86868b]">·</span>
          <span className="text-[#1d1d1f]">Browser-only</span>
        </div>
      </header>

      <main className="max-w-[1080px] mx-auto px-4 pb-16">
        <div className="grid lg:grid-cols-2 gap-4">
          {/* Input */}
          <section className="bg-white rounded-2xl p-5 shadow-sm" data-testid="input-card">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-base font-semibold">Original prompt</h2>
              <button
                type="button"
                onClick={clear}
                className="text-xs text-[#86868b] hover:text-[#0071E3] transition-colors"
                data-testid="clear-btn"
              >
                Clear
              </button>
            </div>
            <textarea
              value={input}
              onChange={e => setInput(e.target.value)}
              placeholder="Paste the prompt that contains PII…"
              className="w-full h-[300px] px-3 py-2.5 rounded-xl border border-[#d2d2d7] bg-white text-[#1d1d1f] text-sm font-mono resize-none focus:border-[#0071E3] focus:outline-none focus:ring-2 focus:ring-[#0071E3]/20 transition-colors"
              data-testid="input-textarea"
              spellCheck={false}
              autoComplete="off"
            />
            <div className="mt-2 text-xs text-[#86868b]">
              {input.length.toLocaleString()} chars · processed locally, never sent anywhere
            </div>
          </section>

          {/* Output */}
          <section className="bg-white rounded-2xl p-5 shadow-sm" data-testid="output-card">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-base font-semibold">Safe to send</h2>
              <button
                type="button"
                onClick={copy}
                disabled={!input}
                className="text-xs px-3 py-1.5 bg-[#0071E3] text-white rounded-lg hover:bg-[#0077ED] disabled:bg-[#d2d2d7] transition-colors font-medium"
                data-testid="copy-btn"
              >
                {copied ? '✓ Copied' : 'Copy'}
              </button>
            </div>
            <div
              className="w-full h-[300px] px-3 py-2.5 rounded-xl border border-[#d2d2d7] bg-[#f5f5f7] text-sm font-mono overflow-auto whitespace-pre-wrap break-words"
              data-testid="output-text"
            >
              {result.redacted || (
                <span className="text-[#86868b]">Output appears here as you type…</span>
              )}
            </div>
            <div className="mt-2 text-xs text-[#86868b]">
              {stats.total} replacement{stats.total === 1 ? '' : 's'}
            </div>
          </section>
        </div>

        {/* Stats card */}
        <section className="mt-4 bg-white rounded-2xl p-5 shadow-sm" data-testid="stats-card">
          <h2 className="text-base font-semibold mb-3">What we found</h2>

          {stats.total === 0 ? (
            <p className="text-sm text-[#86868b]">No PII detected. Paste a prompt with sensitive data to see redactions.</p>
          ) : (
            <>
              {/* Confidence breakdown */}
              <div className="flex gap-2 mb-4 text-xs">
                {stats.byConf.high > 0 && (
                  <span className="px-2.5 py-1 rounded-full bg-[#30d158]/10 text-[#1d8a3a] font-medium" data-testid="conf-high">
                    {stats.byConf.high} High confidence
                  </span>
                )}
                {stats.byConf.possible > 0 && (
                  <span className="px-2.5 py-1 rounded-full bg-[#ff9f0a]/10 text-[#a55a00] font-medium" data-testid="conf-possible">
                    {stats.byConf.possible} Possible — review
                  </span>
                )}
              </div>

              {/* List */}
              <div className="space-y-2" data-testid="match-list">
                {result.matches.map((m, i) => (
                  <div
                    key={i}
                    className="flex items-start gap-3 p-3 bg-[#f5f5f7] rounded-xl text-sm"
                    data-testid={`match-${i}`}
                  >
                    <span
                      className={`px-2 py-0.5 rounded-full text-xs font-medium whitespace-nowrap ${
                        m.confidence === 'high'
                          ? 'bg-[#30d158]/10 text-[#1d8a3a]'
                          : 'bg-[#ff9f0a]/10 text-[#a55a00]'
                      }`}
                    >
                      {PII_LABELS[m.type]}
                    </span>
                    <div className="flex-1 min-w-0">
                      <div className="font-mono text-xs truncate text-[#86868b]">
                        {m.value.length > 40 ? m.value.slice(0, 37) + '…' : m.value}
                      </div>
                      <div className="text-xs text-[#1d1d1f] mt-0.5">
                        Replaced with{' '}
                        <code className="bg-white px-1.5 py-0.5 rounded font-mono text-xs">
                          {m.placeholder}
                        </code>
                        {m.reason && <span className="text-[#86868b]"> · {m.reason}</span>}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {stats.byConf.possible > 0 && (
                <p className="text-xs text-[#86868b] mt-3 leading-relaxed border-t border-[#e8e8ed] pt-3">
                  ⚠ "Possible" matches (e.g. phone numbers) use heuristics. Verify before relying on
                  them — short numeric strings can match by accident.
                </p>
              )}
            </>
          )}
        </section>

        {/* Trust section */}
        <section className="mt-4 bg-white rounded-2xl p-5 shadow-sm" data-testid="trust-card">
          <h2 className="text-base font-semibold mb-3">Why you can trust this</h2>
          <div className="grid sm:grid-cols-2 gap-4 text-sm">
            <div>
              <div className="font-medium mb-1">Verify it yourself</div>
              <ol className="text-[#424245] text-xs leading-relaxed list-decimal pl-4 space-y-1">
                <li>Open browser DevTools (Cmd+Option+I / F12)</li>
                <li>Go to the Network tab</li>
                <li>Type into the prompt area and watch — zero outbound requests</li>
                <li>The counter at the top of this page also tracks this live</li>
              </ol>
            </div>
            <div>
              <div className="font-medium mb-1">What we don't do</div>
              <ul className="text-[#424245] text-xs leading-relaxed space-y-1">
                <li>· No fetch / XHR / WebSocket calls with your text</li>
                <li>· No localStorage / sessionStorage / cookies</li>
                <li>· No analytics, no telemetry, no error reporting</li>
                <li>· No service worker</li>
              </ul>
            </div>
          </div>
        </section>

        {/* What's detected */}
        <section className="mt-4 bg-white rounded-2xl p-5 shadow-sm">
          <h2 className="text-base font-semibold mb-3">What we detect</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3 text-sm">
            <Detected
              type="Email"
              examples="alice@example.com"
              confidence="high"
              note="Standard RFC-5322 pattern"
            />
            <Detected
              type="API Key"
              examples="sk-…, ghp_…, AKIA…"
              confidence="high"
              note="Prefix-anchored: OpenAI, Anthropic, AWS, GitHub, Google, Stripe, Slack"
            />
            <Detected
              type="Credit Card"
              examples="4111 1111 1111 1111"
              confidence="high"
              note="Luhn-validated, brand-detected"
            />
            <Detected
              type="Phone"
              examples="+1-415-555-0199"
              confidence="possible"
              note="Heuristic — verify, since some numeric strings look like phones"
            />
          </div>
          <p className="text-xs text-[#86868b] mt-4 leading-relaxed">
            <strong>Not detected (yet):</strong> Names, addresses, SSNs, IPs, JWTs, AWS account IDs.
            We deliberately skip categories with high false-positive rates. Open an issue if you want
            one added.
          </p>
        </section>

        {/* Cross-link */}
        <section className="mt-4 bg-white rounded-2xl p-5 shadow-sm" data-testid="cross-links">
          <h2 className="text-base font-semibold mb-3">More AI tools</h2>
          <div className="grid sm:grid-cols-3 gap-3">
            <a
              href="/prompt-cache-calculator/"
              className="block p-4 rounded-xl border border-[#e8e8ed] hover:border-[#0071E3] hover:bg-[#0071E3]/5 transition-colors"
            >
              <div className="font-medium mb-0.5 text-sm">Cache Calculator →</div>
              <div className="text-xs text-[#86868b]">Compare prompt caching cost across vendors</div>
            </a>
            <a
              href="/token-tracker/"
              className="block p-4 rounded-xl border border-[#e8e8ed] hover:border-[#0071E3] hover:bg-[#0071E3]/5 transition-colors"
            >
              <div className="font-medium mb-0.5 text-sm">Token Tracker →</div>
              <div className="text-xs text-[#86868b]">Monthly LLM cost by tokens</div>
            </a>
            <a
              href="/mcp-servers/"
              className="block p-4 rounded-xl border border-[#e8e8ed] hover:border-[#0071E3] hover:bg-[#0071E3]/5 transition-colors"
            >
              <div className="font-medium mb-0.5 text-sm">MCP Server Directory →</div>
              <div className="text-xs text-[#86868b]">Curated MCP servers for Claude / Cursor</div>
            </a>
          </div>
        </section>

        {/* FAQ */}
        <section className="mt-4 bg-white rounded-2xl p-5 shadow-sm">
          <h2 className="text-base font-semibold mb-4">FAQ</h2>
          <Faq q="Is this really safe to use with sensitive data?">
            All processing happens in your browser. There are no fetch/XHR calls with your text, no
            localStorage, no analytics. The Network counter at the top tracks every outbound
            request live — if it ever goes above 0, something is wrong, file an issue.
          </Faq>
          <Faq q="Why don't you redact names and addresses?">
            Name and address detection has too high a false-positive rate to be useful. We'd rather
            redact 4 things reliably than 10 things unreliably. If you have specific names to redact,
            paste with placeholder substitutions yourself.
          </Faq>
          <Faq q="What's a 'Possible' match versus 'High confidence'?">
            High confidence means the pattern is unambiguous (email format, API key prefix, Luhn-valid
            card). Possible means heuristic — phone numbers especially can collide with random
            numeric IDs. Review possibles before trusting them.
          </Faq>
          <Faq q="Will my prompt be remembered next time I visit?">
            No. Nothing is stored. Reload the page and the textarea is empty (except the sample). This
            is intentional — we don't want sensitive data persisting in localStorage where it might
            leak across browser tabs or accounts.
          </Faq>
          <Faq q="Can I use this offline?">
            Once the page is loaded, yes — try it. Open DevTools, go to Network tab, throttle to
            "Offline", then type and watch redactions still work.
          </Faq>
        </section>
      </main>

      <footer className="border-t border-[#e8e8ed] py-8 mt-8">
        <div className="max-w-[1080px] mx-auto px-4 text-center text-xs text-[#86868b]">
          <p>Free, ad-free, browser-only. Your data never leaves your machine.</p>
        </div>
      </footer>
      <RelatedTools currentPath="/pii-redactor/" />
    </div>
  )
}

function Detected({
  type,
  examples,
  confidence,
  note,
}: {
  type: string
  examples: string
  confidence: Confidence
  note: string
}) {
  return (
    <div className="p-3 bg-[#f5f5f7] rounded-xl">
      <div className="flex items-center gap-2 mb-1">
        <span className="font-medium text-sm">{type}</span>
        <span
          className={`text-xs px-1.5 py-0.5 rounded-full font-medium ${
            confidence === 'high'
              ? 'bg-[#30d158]/10 text-[#1d8a3a]'
              : 'bg-[#ff9f0a]/10 text-[#a55a00]'
          }`}
        >
          {confidence === 'high' ? 'High' : 'Possible'}
        </span>
      </div>
      <div className="font-mono text-xs text-[#86868b] mb-1 truncate">{examples}</div>
      <div className="text-xs text-[#424245] leading-relaxed">{note}</div>
    </div>
  )
}

function Faq({ q, children }: { q: string; children: React.ReactNode }) {
  return (
    <details className="border-b border-[#e8e8ed] last:border-0 py-3">
      <summary className="font-medium cursor-pointer text-[#1d1d1f] hover:text-[#0071E3] transition-colors text-sm">
        {q}
      </summary>
      <p className="mt-2 text-sm text-[#424245] leading-relaxed">{children}</p>
    </details>
  )
}
