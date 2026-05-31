import { useState, useMemo, useCallback } from 'react'
import { GlobalNav } from '../components/GlobalNav'
import { CopyButton } from '../cron/components/CopyButton'
import { validateExpression } from './lib/validate'
import { VALIDATOR_DIALECTS } from './lib/types'
import type { ValidatorDialect, ValidationResult, ValidatorSubPage } from './lib/types'

export default function ValidatorPage({ page }: { page: ValidatorSubPage }) {
  const [expression, setExpression] = useState('')
  const [dialect, setDialect] = useState<ValidatorDialect>(page.dialect)
  const [showFaq, setShowFaq] = useState<number | null>(null)

  const result = useMemo(() => {
    if (!expression.trim()) return null
    return validateExpression(expression, dialect)
  }, [expression, dialect])

  const handleClear = useCallback(() => setExpression(''), [])

  const handleTryExample = useCallback((example: string) => {
    setExpression(example)
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
            <a href="/cron-validator/" className="hover:text-slate-700">Cron Validator</a>
            <span className="mx-1.5">›</span>
            <span className="text-slate-900 font-medium">{page.h1}</span>
          </nav>
          <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 tracking-tight mb-2">
            {page.h1}
          </h1>
          <p className="text-lg text-slate-600">
            {page.description.slice(0, 120)}...
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
              placeholder={page.exampleExpressions[0]}
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
          <h2 className="text-lg font-semibold text-slate-900 mb-3">Try These Examples</h2>
          <div className="flex flex-wrap gap-2">
            {page.exampleExpressions.map((expr, i) => (
              <button
                key={i}
                onClick={() => handleTryExample(expr)}
                className="px-3 py-1.5 rounded-lg text-sm font-mono bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors"
              >
                {expr}
              </button>
            ))}
          </div>
        </div>

        {/* Explanation */}
        <div className="mb-8">
          <h2 className="text-lg font-semibold text-slate-900 mb-3">About {page.h1}</h2>
          <p className="text-slate-700 leading-relaxed">{page.explanation}</p>
        </div>

        {/* FAQ */}
        <div className="mb-8">
          <h2 className="text-lg font-semibold text-slate-900 mb-3">FAQ</h2>
          <div className="space-y-2">
            {page.faq.map((faq, i) => (
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
          <a href="/cron-validator/" className="text-blue-600 hover:text-blue-800 font-medium">All Cron Validators →</a>
          <a href="/cron-generator/" className="text-blue-600 hover:text-blue-800 font-medium">Build a cron → Cron Generator</a>
        </div>
      </div>
    </div>
  )
}

function ResultDisplay({ result }: { result: ValidationResult }) {
  if (result.errors.length > 0 && !result.valid) {
    return (
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
    )
  }

  const hasWarnings = result.warnings.length > 0

  return (
    <div className="space-y-4">
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

      {result.warnings.map((w, i) => (
        <div key={i} className="flex items-start gap-2 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
          <span className="text-yellow-500 text-sm">⚠</span>
          <p className="text-sm text-yellow-800">{w.message}</p>
        </div>
      ))}

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
    </div>
  )
}
