import { useState, useMemo, useCallback } from 'react'
import { GlobalNav } from '../components/GlobalNav'
import { RelatedTools } from '../components/RelatedTools'
import { FaqSchema } from '../components/FaqSchema'
import {
  type CSPDirective, type CSPPolicy, type DirectiveConfig,
  CSP_DIRECTIVES, DIRECTIVE_SOURCES, DIRECTIVE_ALLOWS_HOSTS,
  buildCSPHeader, buildCSPValue, createDefaultPolicy, PRESETS, cleanDomains,
} from './csp-builder'

const FAQ_DATA = [
  {
    q: 'What is a Content Security Policy (CSP)?',
    a: 'A CSP is an HTTP response header that tells browsers which sources of content are allowed to load on your page. It prevents XSS, clickjacking, and other injection attacks by restricting scripts, styles, images, and other resources.',
  },
  {
    q: 'Content-Security-Policy vs Content-Security-Policy-Report-Only?',
    a: 'Content-Security-Policy enforces the policy and blocks violations. Content-Security-Policy-Report-Only logs violations to a report endpoint without blocking anything. Use Report-Only mode to test your policy before enforcement.',
  },
  {
    q: "Should I use 'unsafe-inline' and 'unsafe-eval'?",
    a: "Avoid them in production. 'unsafe-inline' allows inline scripts and event handlers, defeating XSS protection. 'unsafe-eval' allows eval() and similar APIs. Use nonces or hashes instead. During development, they are useful for quick testing.",
  },
  {
    q: "What does 'strict-dynamic' do?",
    a: "'strict-dynamic' allows scripts loaded by trusted scripts (via nonces or hashes) to load additional scripts. It is part of CSP Level 3 and works with nonce-based policies. It is ignored by browsers that only support CSP Level 2.",
  },
  {
    q: 'How do I test my CSP header before deploying?',
    a: "Use Report-Only mode first. Set Content-Security-Policy-Report-Only with your policy and a report-uri endpoint. Monitor violation reports for a few days, then switch to enforcement mode. You can also check browser DevTools console for blocked resources.",
  },
]

function toggleSource(config: DirectiveConfig, source: string): DirectiveConfig {
  const sources = config.sources.includes(source)
    ? config.sources.filter(s => s !== source)
    : [...config.sources, source]
  return { ...config, sources }
}

function updateDirective(policy: CSPPolicy, key: CSPDirective, updater: (c: DirectiveConfig) => DirectiveConfig): CSPPolicy {
  const existing = policy.directives[key] || { enabled: false, sources: [], customDomains: [] }
  return {
    ...policy,
    directives: { ...policy.directives, [key]: updater(existing) },
  }
}

export default function CSPGeneratorApp() {
  const [policy, setPolicy] = useState<CSPPolicy>(createDefaultPolicy())
  const [copied, setCopied] = useState(false)
  const [expandedDir, setExpandedDir] = useState<CSPDirective | null>('default-src')
  const [showAdvanced, setShowAdvanced] = useState(false)
  const [domainInputs, setDomainInputs] = useState<Record<string, string>>({})

  const header = useMemo(() => buildCSPHeader(policy), [policy])
  const headerValue = useMemo(() => buildCSPValue(policy), [policy])
  const headerLength = headerValue.length

  const copy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(header)
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    } catch { /* noop */ }
  }, [header])

  const applyPreset = useCallback((preset: CSPPolicy) => {
    setPolicy(preset)
    setExpandedDir('default-src')
  }, [])

  const toggleDirective = useCallback((key: CSPDirective) => {
    setPolicy(p => {
      const config = p.directives[key] || { enabled: false, sources: [], customDomains: [] }
      if (!config.enabled) {
        return updateDirective(p, key, () => ({
          enabled: true,
          sources: ["'self'"],
          customDomains: [],
        }))
      }
      return updateDirective(p, key, c => ({ ...c, enabled: false }))
    })
  }, [])

  const toggleSourceFor = useCallback((key: CSPDirective, source: string) => {
    setPolicy(p => updateDirective(p, key, c => toggleSource(c, source)))
  }, [])

  const addDomain = useCallback((key: CSPDirective) => {
    const input = (domainInputs[key] || '').trim()
    if (!input) return
    const cleaned = cleanDomains([input])
    if (cleaned.length === 0) return
    setPolicy(p => updateDirective(p, key, c => ({
      ...c,
      customDomains: cleanDomains([...c.customDomains, ...cleaned]),
    })))
    setDomainInputs(prev => ({ ...prev, [key]: '' }))
  }, [domainInputs])

  const removeDomain = useCallback((key: CSPDirective, domain: string) => {
    setPolicy(p => updateDirective(p, key, c => ({
      ...c,
      customDomains: c.customDomains.filter(d => d !== domain),
    })))
  }, [])

  const commonDirectives = CSP_DIRECTIVES.filter(d => d.group === 'common')
  const advancedDirectives = CSP_DIRECTIVES.filter(d => d.group === 'advanced')

  return (
    <div className="min-h-screen bg-[#f5f5f7] text-[#1d1d1f]">
      <GlobalNav current="/csp-generator/" />

      {/* Hero */}
      <header className="max-w-[1080px] mx-auto px-4 pt-12 pb-4 text-center">
        <h1 className="text-4xl sm:text-5xl font-semibold tracking-tight mb-3">
          CSP Header Generator
        </h1>
        <p className="text-lg text-[#86868b] max-w-2xl mx-auto">
          Build Content-Security-Policy headers visually. Toggle directives, add domains,
          preview live, and copy the header. 100% browser-only.
        </p>
      </header>

      <main className="max-w-[1080px] mx-auto px-4 pb-16">
        {/* Presets */}
        <div className="flex flex-wrap gap-2 justify-center mb-6" data-testid="presets">
          {PRESETS.map(preset => (
            <button
              key={preset.name}
              type="button"
              onClick={() => applyPreset(preset.policy)}
              className="px-4 py-2 rounded-full text-sm font-medium bg-white shadow-sm border border-[#d2d2d7] hover:border-[#0071E3] hover:text-[#0071E3] transition-colors"
            >
              {preset.name}
              <span className="text-[#86868b] ml-1.5 text-xs">{preset.description}</span>
            </button>
          ))}
        </div>

        {/* Two-column layout */}
        <div className="grid lg:grid-cols-2 gap-4">
          {/* Left: Directive builder */}
          <div className="space-y-2">
            {commonDirectives.map(dir => (
              <DirectiveCard
                key={dir.key}
                directive={dir}
                config={policy.directives[dir.key]}
                expanded={expandedDir === dir.key}
                domainInput={domainInputs[dir.key] || ''}
                onToggleDirective={() => toggleDirective(dir.key)}
                onToggleSource={s => toggleSourceFor(dir.key, s)}
                onExpand={() => setExpandedDir(expandedDir === dir.key ? null : dir.key)}
                onDomainChange={v => setDomainInputs(prev => ({ ...prev, [dir.key]: v }))}
                onAddDomain={() => addDomain(dir.key)}
                onRemoveDomain={d => removeDomain(dir.key, d)}
              />
            ))}

            {/* Advanced toggle */}
            <button
              type="button"
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="w-full text-left px-4 py-3 bg-white rounded-2xl shadow-sm text-sm text-[#86868b] hover:text-[#0071E3] transition-colors"
            >
              {showAdvanced ? 'Hide' : 'Show'} advanced directives
              <span className="ml-1 text-xs">({advancedDirectives.length})</span>
            </button>

            {showAdvanced && advancedDirectives.map(dir => (
              <DirectiveCard
                key={dir.key}
                directive={dir}
                config={policy.directives[dir.key]}
                expanded={expandedDir === dir.key}
                domainInput={domainInputs[dir.key] || ''}
                onToggleDirective={() => toggleDirective(dir.key)}
                onToggleSource={s => toggleSourceFor(dir.key, s)}
                onExpand={() => setExpandedDir(expandedDir === dir.key ? null : dir.key)}
                onDomainChange={v => setDomainInputs(prev => ({ ...prev, [dir.key]: v }))}
                onAddDomain={() => addDomain(dir.key)}
                onRemoveDomain={d => removeDomain(dir.key, d)}
              />
            ))}

            {/* Boolean toggles */}
            <div className="bg-white rounded-2xl p-4 shadow-sm space-y-3">
              <ToggleRow
                label="upgrade-insecure-requests"
                hint="Upgrade HTTP requests to HTTPS"
                checked={policy.upgradeInsecure}
                onChange={v => setPolicy(p => ({ ...p, upgradeInsecure: v }))}
              />
              <ToggleRow
                label="block-all-mixed-content"
                hint="Block HTTP resources on HTTPS pages"
                checked={policy.blockMixed}
                onChange={v => setPolicy(p => ({ ...p, blockMixed: v }))}
              />
            </div>
          </div>

          {/* Right: Preview */}
          <div className="space-y-4 lg:sticky lg:top-16 lg:self-start">
            {/* Report-Only toggle */}
            <div className="bg-white rounded-2xl p-4 shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-medium">Report-Only mode</span>
                <button
                  type="button"
                  role="switch"
                  aria-checked={policy.reportOnly}
                  onClick={() => setPolicy(p => ({ ...p, reportOnly: !p.reportOnly }))}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${policy.reportOnly ? 'bg-[#0071E3]' : 'bg-[#d2d2d7]'}`}
                >
                  <span className={`inline-block h-4 w-4 rounded-full bg-white transition-transform ${policy.reportOnly ? 'translate-x-6' : 'translate-x-1'}`} />
                </button>
              </div>
              {policy.reportOnly && (
                <input
                  type="text"
                  placeholder="report-uri endpoint (e.g. https://example.com/csp-report)"
                  value={policy.reportUri}
                  onChange={e => setPolicy(p => ({ ...p, reportUri: e.target.value }))}
                  className="w-full px-3 py-2 rounded-lg border border-[#d2d2d7] text-sm focus:outline-none focus:border-[#0071E3]"
                />
              )}
            </div>

            {/* Header preview */}
            <div className="bg-white rounded-2xl p-5 shadow-sm" data-testid="preview-card">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-base font-semibold">Header Preview</h2>
                <button
                  type="button"
                  onClick={copy}
                  data-testid="copy-btn"
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${copied ? 'bg-[#30d158]/10 text-[#1d8a3a]' : 'bg-[#0071E3] text-white hover:bg-[#0077ED]'}`}
                >
                  {copied ? 'Copied!' : 'Copy'}
                </button>
              </div>
              <pre className="bg-[#f5f5f7] rounded-xl p-4 text-sm overflow-x-auto whitespace-pre-wrap break-all font-mono leading-relaxed">
                <span className="text-[#0071E3] font-semibold">
                  {policy.reportOnly ? 'Content-Security-Policy-Report-Only' : 'Content-Security-Policy'}
                </span>
                {': '}
                <HighlightValue value={headerValue} />
              </pre>
              <div className="flex items-center justify-between mt-2 text-xs text-[#86868b]">
                <span>{headerLength} characters</span>
                {headerLength > 2048 && (
                  <span className="text-[#ff9f0a]">Warning: some servers may truncate headers over 2048 chars</span>
                )}
              </div>
            </div>

            {/* FAQ */}
            <div className="bg-white rounded-2xl p-5 shadow-sm">
              <h2 className="text-base font-semibold mb-3">FAQ</h2>
              <div className="space-y-2">
                {FAQ_DATA.map((faq, i) => (
                  <details key={i} className="group">
                    <summary className="text-sm cursor-pointer text-[#1d1d1f] hover:text-[#0071E3] py-2">
                      {faq.q}
                    </summary>
                    <p className="text-sm text-[#86868b] pb-2 pl-1">{faq.a}</p>
                  </details>
                ))}
              </div>
            </div>

            {/* Cross-links */}
            <div className="bg-white rounded-2xl p-5 shadow-sm">
              <h2 className="text-base font-semibold mb-3">Related tools</h2>
              <div className="flex flex-wrap gap-2">
                <a href="/pii-redactor/" className="px-3 py-1.5 rounded-lg text-sm bg-[#f5f5f7] hover:bg-[#0071E3]/10 hover:text-[#0071E3] transition-colors">PII Redactor</a>
                <a href="/agent-safety/" className="px-3 py-1.5 rounded-lg text-sm bg-[#f5f5f7] hover:bg-[#0071E3]/10 hover:text-[#0071E3] transition-colors">Agent Safety</a>
                <a href="/prompt-cache-calculator/" className="px-3 py-1.5 rounded-lg text-sm bg-[#f5f5f7] hover:bg-[#0071E3]/10 hover:text-[#0071E3] transition-colors">Cache Calculator</a>
              </div>
            </div>
          </div>
        </div>

        {/* Mobile sticky copy */}
        <div className="fixed bottom-0 left-0 right-0 p-3 bg-white/80 backdrop-blur-sm border-t border-[#e8e8ed] lg:hidden">
          <button
            type="button"
            onClick={copy}
            className={`w-full py-3 rounded-full text-sm font-semibold transition-colors ${copied ? 'bg-[#30d158]/10 text-[#1d8a3a]' : 'bg-[#0071E3] text-white'}`}
          >
            {copied ? 'Copied!' : 'Copy CSP Header'}
          </button>
        </div>
        <RelatedTools currentPath="/csp-generator/" />
        <FaqSchema items={FAQ_DATA.map((f: { q: string; a: string }) => ({ question: f.q, answer: f.a }))} />
      </main>
    </div>
  )
}

function HighlightValue({ value }: { value: string }) {
  if (!value) return <span className="text-[#86868b]">(empty)</span>
  return <>{value}</>
}

function DirectiveCard({ directive, config, expanded, domainInput, onToggleDirective, onToggleSource, onExpand, onDomainChange, onAddDomain, onRemoveDomain }: {
  directive: { key: CSPDirective; label: string; hint: string }
  config?: DirectiveConfig
  expanded: boolean
  domainInput: string
  onToggleDirective: () => void
  onToggleSource: (source: string) => void
  onExpand: () => void
  onDomainChange: (value: string) => void
  onAddDomain: () => void
  onRemoveDomain: (domain: string) => void
}) {
  const enabled = config?.enabled ?? false
  const sources = config?.sources ?? []
  const customDomains = config?.customDomains ?? []
  const availableSources = DIRECTIVE_SOURCES[directive.key] || []
  const allowsHosts = DIRECTIVE_ALLOWS_HOSTS[directive.key]

  return (
    <div className={`bg-white rounded-2xl shadow-sm transition-colors ${enabled ? 'ring-1 ring-[#0071E3]/20' : ''}`}>
      <div className="flex items-center gap-3 px-4 py-3">
        <input
          type="checkbox"
          checked={enabled}
          onChange={onToggleDirective}
          className="w-4 h-4 rounded border-[#d2d2d7] text-[#0071E3] focus:ring-[#0071E3]"
        />
        <button type="button" onClick={onExpand} className="flex-1 text-left">
          <span className={`text-sm font-medium ${enabled ? 'text-[#1d1d1f]' : 'text-[#86868b]'}`}>
            {directive.label}
          </span>
          <span className="block text-xs text-[#86868b]">{directive.hint}</span>
        </button>
        {enabled && sources.length > 0 && (
          <span className="text-xs text-[#86868b]">{sources.length} source{sources.length !== 1 ? 's' : ''}</span>
        )}
      </div>

      {enabled && expanded && (
        <div className="px-4 pb-4 border-t border-[#e8e8ed] pt-3 space-y-3">
          {/* Source toggles */}
          <div className="flex flex-wrap gap-1.5">
            {availableSources.map(source => {
              const active = sources.includes(source)
              const isNone = source === "'none'"
              const isWarning = source === "'unsafe-inline'" || source === "'unsafe-eval'"
              return (
                <button
                  key={source}
                  type="button"
                  onClick={() => onToggleSource(source)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors ${
                    active
                      ? isWarning ? 'bg-[#ff9f0a]/10 text-[#a55a00] ring-1 ring-[#ff9f0a]/30'
                        : isNone ? 'bg-[#ff3b30]/10 text-[#ff3b30] ring-1 ring-[#ff3b30]/30'
                        : 'bg-[#0071E3]/10 text-[#0071E3] ring-1 ring-[#0071E3]/20'
                      : 'bg-[#f5f5f7] text-[#86868b] hover:bg-[#e8e8ed]'
                  }`}
                >
                  {source}
                </button>
              )
            })}
          </div>

          {/* Custom domains */}
          {allowsHosts && (
            <div>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Add domain (e.g. cdn.example.com)"
                  value={domainInput}
                  onChange={e => onDomainChange(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && onAddDomain()}
                  className="flex-1 px-3 py-1.5 rounded-lg border border-[#d2d2d7] text-sm focus:outline-none focus:border-[#0071E3]"
                />
                <button
                  type="button"
                  onClick={onAddDomain}
                  className="px-3 py-1.5 rounded-lg text-sm bg-[#f5f5f7] hover:bg-[#0071E3]/10 hover:text-[#0071E3] transition-colors"
                >
                  Add
                </button>
              </div>
              {customDomains.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {customDomains.map(domain => (
                    <span key={domain} className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-xs bg-[#f5f5f7]">
                      {domain}
                      <button type="button" onClick={() => onRemoveDomain(domain)} className="text-[#86868b] hover:text-[#ff3b30]">&times;</button>
                    </span>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

function ToggleRow({ label, hint, checked, onChange }: {
  label: string
  hint: string
  checked: boolean
  onChange: (v: boolean) => void
}) {
  return (
    <div className="flex items-center justify-between">
      <div>
        <span className="text-sm font-medium font-mono">{label}</span>
        <span className="block text-xs text-[#86868b]">{hint}</span>
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${checked ? 'bg-[#0071E3]' : 'bg-[#d2d2d7]'}`}
      >
        <span className={`inline-block h-4 w-4 rounded-full bg-white transition-transform ${checked ? 'translate-x-6' : 'translate-x-1'}`} />
      </button>
    </div>
  )
}
