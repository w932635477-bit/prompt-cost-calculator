import { useState, useMemo, useCallback } from 'react'
import { GlobalNav } from '../components/GlobalNav'
import { CopyButton } from '../cron/components/CopyButton'
import { validateExpression } from './lib/validate'
import { VALIDATOR_DIALECTS } from './lib/types'
import type { ValidatorDialect, ValidationResult } from './lib/types'

const FAQ_ITEMS = [
  { q: 'What makes a cron expression invalid?', a: 'Common causes: wrong number of fields, out-of-range values (e.g., minute 99), unsupported tokens for the dialect, or both day-of-month and day-of-week specified when one must be "?".' },
  { q: 'How to fix "bad minute" or "bad hour" errors?', a: 'Check that each field value is within its valid range: minute 0-59, hour 0-23, day-of-month 1-31, month 1-12, day-of-week 0-6.' },
  { q: 'What is the difference between Unix and Quartz cron?', a: 'Unix cron has 5 fields. Quartz has 6-7 fields (adds seconds, optionally year) and requires one of day-of-month or day-of-week to be "?".' },
  { q: 'How to test cron without waiting?', a: 'Paste your expression above, select the dialect, and see the next 5 scheduled run times instantly.' },
  { q: 'Why does my cron work locally but fails in Kubernetes?', a: 'Kubernetes uses UTC by default. Your local cron may use a different timezone. Also, K8s does not support @shorthand notation — use full 5-field expressions.' },
]

export default function ValidatorApp() {
  const [expression, setExpression] = useState('')
  const [dialect, setDialect] = useState<ValidatorDialect>('unix')
  const [showFaq, setShowFaq] = useState<number | null>(null)

  const result = useMemo(() => {
    if (!expression.trim()) return null
    return validateExpression(expression, dialect)
  }, [expression, dialect])

  const handleClear = useCallback(() => setExpression(''), [])

  const handleTryExample = useCallback((example: string, d: ValidatorDialect) => {
    setExpression(example)
    setDialect(d)
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white" style={{ fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif" }}>
      <GlobalNav current="/cron-validator/" />
      <div className="max-w-[920px] mx-auto px-5 sm:px-6 py-10 sm:py-16">
        {/* Header */}
        <div className="mb-8">
          <nav className="text-sm text-slate-500 mb-3">
            <a href="/" className="hover:text-slate-700">Home</a>
            <span className="mx-1.5">›</span>
            <span className="text-slate-900 font-medium">Cron Validator</span>
          </nav>
          <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 tracking-tight mb-2">
            Cron Expression Validator
          </h1>
          <p className="text-lg text-slate-600">
            Paste any cron expression. Get instant validation, explanation, and next runs.
          </p>
        </div>

        {/* Validator Card */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 sm:p-7 mb-8">
          {/* Dialect selector */}
          <div className="flex flex-wrap gap-2 mb-4">
            {VALIDATOR_DIALECTS.map(d => (
              <button
                key={d.value}
                onClick={() => setDialect(d.value)}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  dialect === d.value
                    ? 'bg-blue-600 text-white'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                {d.label}
              </button>
            ))}
          </div>

          {/* Input */}
          <div className="flex gap-2 mb-4">
            <input
              type="text"
              value={expression}
              onChange={e => setExpression(e.target.value)}
              placeholder={dialect === 'quartz' ? '0 */5 * * * ?' : '*/5 * * * *'}
              className="flex-1 px-4 py-3 border border-slate-300 rounded-lg text-lg font-mono focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              spellCheck={false}
              autoComplete="off"
            />
            <button
              onClick={handleClear}
              className="px-4 py-3 text-sm font-medium text-slate-600 bg-slate-100 rounded-lg hover:bg-slate-200 transition-colors"
            >
              Clear
            </button>
          </div>

          {/* Result */}
          {result && <ResultDisplay result={result} />}
        </div>

        {/* Example expressions */}
        <div className="mb-8">
          <h2 className="text-lg font-semibold text-slate-900 mb-3">Quick Examples</h2>
          <div className="flex flex-wrap gap-2">
            <ExampleChip label="Every 5 min (Unix)" expr="*/5 * * * *" dialect="unix" onClick={handleTryExample} />
            <ExampleChip label="Every 5 min (Quartz)" expr="0 */5 * * * ?" dialect="quartz" onClick={handleTryExample} />
            <ExampleChip label="AWS every 5 min" expr="cron(0/5 * * * ? *)" dialect="aws" onClick={handleTryExample} />
            <ExampleChip label="K8s weekdays 9am" expr="0 9 * * 1-5" dialect="kubernetes" onClick={handleTryExample} />
            <ExampleChip label="Invalid minute" expr="99 * * * *" dialect="unix" onClick={handleTryExample} />
            <ExampleChip label="Quartz both days" expr="0 0 12 * * *" dialect="quartz" onClick={handleTryExample} />
          </div>
        </div>

        {/* Platform-specific validators */}
        <div className="mb-8">
          <h2 className="text-lg font-semibold text-slate-900 mb-3">Platform-specific Validators</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <PlatformCard href="/cron-validator/quartz/" title="Quartz Cron Validator" desc="6-7 field Quartz Scheduler syntax with ? L W #" />
            <PlatformCard href="/cron-validator/kubernetes/" title="Kubernetes CronJob Validator" desc="Standard 5-field cron for K8s, UTC default" />
            <PlatformCard href="/cron-validator/aws-eventbridge/" title="AWS EventBridge Validator" desc="6-field AWS cron with year, one ? required" />
          </div>
        </div>

        {/* FAQ */}
        <div className="mb-8">
          <h2 className="text-lg font-semibold text-slate-900 mb-3">Frequently Asked Questions</h2>
          <div className="space-y-2">
            {FAQ_ITEMS.map((faq, i) => (
              <div key={i} className="border border-slate-200 rounded-lg overflow-hidden">
                <button
                  onClick={() => setShowFaq(showFaq === i ? null : i)}
                  className="w-full text-left px-4 py-3 text-sm font-medium text-slate-900 hover:bg-slate-50 flex justify-between items-center"
                >
                  {faq.q}
                  <span className="text-slate-400">{showFaq === i ? '−' : '+'}</span>
                </button>
                {showFaq === i && (
                  <div className="px-4 py-3 text-sm text-slate-600 bg-slate-50 border-t border-slate-200">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Internal links */}
        <div className="flex flex-wrap gap-4 text-sm">
          <a href="/cron-generator/" className="text-blue-600 hover:text-blue-800 font-medium">Need to build a cron? → Cron Generator</a>
          <a href="/cron-generator/common-patterns/" className="text-blue-600 hover:text-blue-800 font-medium">See common patterns →</a>
        </div>
      </div>
    </div>
  )
}

function ResultDisplay({ result }: { result: ValidationResult }) {
  if (result.errors.length > 0 && !result.valid) {
    return (
      <div className="space-y-3">
        <div className="flex items-start gap-2 p-4 bg-red-50 border border-red-200 rounded-lg">
          <span className="text-red-500 text-xl leading-none mt-0.5">✕</span>
          <div>
            <p className="font-semibold text-red-800">Invalid cron expression</p>
            {result.errors.map((err, i) => (
              <div key={i} className="mt-1">
                <p className="text-sm text-red-700">{err.message}</p>
                {err.fix && <p className="text-sm text-red-600 mt-0.5">Fix: {err.fix}</p>}
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  // Warnings but valid
  const hasWarnings = result.warnings.length > 0

  return (
    <div className="space-y-4">
      {/* Valid badge */}
      <div className={`flex items-start gap-2 p-4 rounded-lg border ${
        hasWarnings ? 'bg-yellow-50 border-yellow-200' : 'bg-green-50 border-green-200'
      }`}>
        <span className={`text-xl leading-none mt-0.5 ${hasWarnings ? 'text-yellow-500' : 'text-green-500'}`}>
          {hasWarnings ? '⚠' : '✓'}
        </span>
        <div className="flex-1">
          <p className={`font-semibold ${hasWarnings ? 'text-yellow-800' : 'text-green-800'}`}>
            {hasWarnings ? 'Valid with warnings' : 'Valid cron expression'}
          </p>
          {result.humanReadable && (
            <p className="text-sm mt-0.5 text-slate-700">"{result.humanReadable}"</p>
          )}
        </div>
        <CopyButton text={result.expression} />
      </div>

      {/* Warnings */}
      {result.warnings.map((w, i) => (
        <div key={i} className="flex items-start gap-2 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
          <span className="text-yellow-500 text-sm">⚠</span>
          <p className="text-sm text-yellow-800">{w.message}</p>
        </div>
      ))}

      {/* Dialect errors (valid parser but constraint failed) */}
      {result.errors.map((err, i) => (
        <div key={i} className="flex items-start gap-2 p-3 bg-orange-50 border border-orange-200 rounded-lg">
          <span className="text-orange-500 text-sm">!</span>
          <div>
            <p className="text-sm text-orange-800">{err.message}</p>
            {err.fix && <p className="text-sm text-orange-700 mt-0.5">Fix: {err.fix}</p>}
          </div>
        </div>
      ))}

      {/* Next runs */}
      {result.nextRuns && result.nextRuns.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold text-slate-700 mb-2">Next 5 runs:</h3>
          <div className="bg-slate-50 rounded-lg p-3 space-y-1">
            {result.nextRuns.map((run, i) => (
              <p key={i} className="text-sm font-mono text-slate-700">
                {run.toISOString().replace('T', ' ').slice(0, 19)} UTC
              </p>
            ))}
          </div>
        </div>
      )}

      {/* Field breakdown */}
      {result.fieldBreakdown && (
        <div>
          <h3 className="text-sm font-semibold text-slate-700 mb-2">Field breakdown:</h3>
          <div className="grid grid-cols-5 gap-1">
            {result.fieldBreakdown.map((field, i) => (
              <div key={i} className="bg-slate-100 rounded-lg p-2 text-center">
                <p className="font-mono font-semibold text-slate-900 text-sm">{field.value}</p>
                <p className="text-xs text-slate-500 mt-0.5">{field.label}</p>
                <p className="text-xs text-slate-600">{field.meaning}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Open in Generator */}
      {result.valid && (
        <a
          href={`/cron-generator/?cron=${encodeURIComponent(result.expression)}`}
          className="inline-flex items-center gap-1 text-sm text-blue-600 hover:text-blue-800 font-medium"
        >
          Open in Generator →
        </a>
      )}
    </div>
  )
}

function ExampleChip({ label, expr, dialect, onClick }: {
  label: string; expr: string; dialect: ValidatorDialect
  onClick: (expr: string, dialect: ValidatorDialect) => void
}) {
  return (
    <button
      onClick={() => onClick(expr, dialect)}
      className="px-3 py-1.5 rounded-lg text-sm bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors"
    >
      {label}
    </button>
  )
}

function PlatformCard({ href, title, desc }: { href: string; title: string; desc: string }) {
  return (
    <a href={href} className="block p-4 border border-slate-200 rounded-lg hover:border-blue-300 hover:shadow-sm transition-all">
      <h3 className="font-semibold text-slate-900 text-sm mb-1">{title}</h3>
      <p className="text-xs text-slate-600">{desc}</p>
    </a>
  )
}
