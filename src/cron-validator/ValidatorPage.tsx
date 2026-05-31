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
  const handleTryExample = useCallback((example: string) => setExpression(example), [])

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white" style={{ fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif" }}>
      <GlobalNav current="/cron-validator/" />
      <div className="max-w-[800px] mx-auto px-5 sm:px-6 py-10 sm:py-16">
        {/* Header */}
        <header className="text-center mb-10">
          <nav className="text-[13px] text-slate-400 mb-4">
            <a href="/" className="hover:text-slate-600 transition-colors">Home</a>
            <span className="mx-1.5 text-slate-300">/</span>
            <a href="/cron-validator/" className="hover:text-slate-600 transition-colors">Cron Validator</a>
            <span className="mx-1.5 text-slate-300">/</span>
            <span className="text-slate-600">{page.h1}</span>
          </nav>
          <h1 className="text-[28px] sm:text-[34px] font-bold text-slate-900 tracking-tight leading-tight">
            {page.h1}
          </h1>
          <p className="mt-2.5 text-[15px] text-slate-500 max-w-lg mx-auto leading-relaxed">
            {page.description.slice(0, 120)}...
          </p>
        </header>

        {/* Main Tool Card */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-[0_1px_3px_rgba(0,0,0,0.04),0_4px_12px_rgba(0,0,0,0.03)] overflow-hidden mb-8">
          {/* Dialect selector */}
          <div className="px-6 sm:px-8 py-4 border-b border-slate-100 bg-gradient-to-b from-slate-50/60 to-white">
            <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2.5">Dialect</div>
            <div className="flex flex-wrap gap-1.5">
              {VALIDATOR_DIALECTS.map(d => (
                <button
                  key={d.value}
                  onClick={() => setDialect(d.value)}
                  className={`px-3.5 py-1.5 rounded-lg text-[13px] font-medium transition-all duration-150 ${
                    dialect === d.value
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200/60'
                  }`}
                >
                  {d.label}
                </button>
              ))}
            </div>
          </div>

          {/* Input */}
          <div className="px-6 sm:px-8 py-5 sm:py-6">
            <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2.5">Expression</div>
            <div className="flex gap-2.5">
              <input
                type="text"
                value={expression}
                onChange={e => setExpression(e.target.value)}
                placeholder={page.exampleExpressions[0]}
                className="flex-1 px-4 py-3 border border-slate-200 rounded-xl text-[18px] sm:text-[20px] font-medium text-slate-900 placeholder:text-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 transition-all"
                style={{ fontFamily: "'JetBrains Mono', 'SF Mono', ui-monospace, monospace" }}
                spellCheck={false}
                autoComplete="off"
              />
              <button
                onClick={handleClear}
                className="px-4 py-3 text-[13px] font-medium text-slate-500 bg-slate-50 border border-slate-200 rounded-xl hover:bg-slate-100 hover:text-slate-700 transition-all"
              >
                Clear
              </button>
            </div>
          </div>

          {/* Result */}
          {result && (
            <div className="border-t border-slate-100">
              <ResultDisplay result={result} />
            </div>
          )}
        </div>

        {/* Examples */}
        <div className="mb-10">
          <h2 className="text-[13px] font-semibold text-slate-400 uppercase tracking-wider mb-3 px-1">Try These</h2>
          <div className="flex flex-wrap gap-2">
            {page.exampleExpressions.map((expr, i) => (
              <button
                key={i}
                onClick={() => handleTryExample(expr)}
                className="px-3.5 py-1.5 rounded-lg text-[13px] font-mono font-medium bg-white text-slate-600 border border-slate-200/80 hover:bg-slate-50 hover:border-slate-300 transition-all"
                style={{ fontFamily: "'JetBrains Mono', 'SF Mono', ui-monospace, monospace" }}
              >
                {expr}
              </button>
            ))}
          </div>
        </div>

        {/* Explanation */}
        <div className="mb-10">
          <h2 className="text-[13px] font-semibold text-slate-400 uppercase tracking-wider mb-3 px-1">About</h2>
          <p className="text-[14px] text-slate-600 leading-relaxed px-1">{page.explanation}</p>
        </div>

        {/* FAQ */}
        <div className="mb-10">
          <h2 className="text-[13px] font-semibold text-slate-400 uppercase tracking-wider mb-3 px-1">FAQ</h2>
          <div className="space-y-2">
            {page.faq.map((faq, i) => (
              <div key={i} className="bg-white rounded-xl border border-slate-200/80 overflow-hidden">
                <button
                  onClick={() => setShowFaq(showFaq === i ? null : i)}
                  className="w-full text-left px-5 py-3.5 text-[14px] font-medium text-slate-800 hover:bg-slate-50/50 flex justify-between items-center transition-colors"
                >
                  {faq.q}
                  <span className={`text-slate-400 text-[16px] transition-transform duration-200 ${showFaq === i ? 'rotate-45' : ''}`}>+</span>
                </button>
                {showFaq === i && (
                  <div className="px-5 py-3.5 text-[14px] text-slate-600 leading-relaxed bg-slate-50/40 border-t border-slate-100">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Links */}
        <div className="text-center space-x-4 text-[13px]">
          <a href="/cron-validator/" className="text-blue-600 hover:text-blue-700 font-medium transition-colors">All Validators →</a>
          <a href="/cron-generator/" className="text-blue-600 hover:text-blue-700 font-medium transition-colors">Build a cron →</a>
        </div>
      </div>
    </div>
  )
}

function ResultDisplay({ result }: { result: ValidationResult }) {
  if (result.errors.length > 0 && !result.valid) {
    return (
      <div className="px-6 sm:px-8 py-5 bg-red-50/60">
        <div className="flex items-start gap-3">
          <div className="w-6 h-6 rounded-full bg-red-100 flex items-center justify-center shrink-0 mt-0.5">
            <span className="text-red-500 text-[13px] font-bold">✕</span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[14px] font-semibold text-red-800">Invalid cron expression</p>
            {result.errors.map((err, i) => (
              <div key={i} className="mt-2">
                <p className="text-[13px] text-red-700 leading-relaxed">{err.message}</p>
                {err.fix && <p className="text-[13px] text-red-600/80 mt-1">Fix: {err.fix}</p>}
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  const hasWarnings = result.warnings.length > 0

  return (
    <div className="px-6 sm:px-8 py-5 space-y-4">
      <div className={`flex items-start gap-3 p-4 rounded-xl ${
        hasWarnings ? 'bg-amber-50/60 border border-amber-200/60' : 'bg-emerald-50/60 border border-emerald-200/60'
      }`}>
        <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${
          hasWarnings ? 'bg-amber-100' : 'bg-emerald-100'
        }`}>
          <span className={`text-[13px] ${hasWarnings ? 'text-amber-600' : 'text-emerald-600'}`}>
            {hasWarnings ? '!' : '✓'}
          </span>
        </div>
        <div className="flex-1 min-w-0">
          <p className={`text-[14px] font-semibold ${hasWarnings ? 'text-amber-800' : 'text-emerald-800'}`}>
            {hasWarnings ? 'Valid with warnings' : 'Valid cron expression'}
          </p>
          {result.humanReadable && (
            <p className="text-[14px] text-slate-600 mt-0.5">&ldquo;{result.humanReadable}&rdquo;</p>
          )}
        </div>
        <CopyButton text={result.expression} />
      </div>

      {result.warnings.map((w, i) => (
        <div key={i} className="flex items-start gap-2.5 p-3 rounded-lg bg-amber-50/40">
          <span className="text-amber-500 text-[13px] mt-0.5">⚠</span>
          <p className="text-[13px] text-amber-800 leading-relaxed">{w.message}</p>
        </div>
      ))}

      {result.nextRuns && result.nextRuns.length > 0 && (
        <div>
          <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2">Next 5 runs</div>
          <div className="bg-slate-50/60 rounded-xl p-3.5 space-y-1 border border-slate-100">
            {result.nextRuns.map((run, i) => (
              <p key={i} className="text-[13px] font-mono text-slate-700" style={{ fontFamily: "'JetBrains Mono', 'SF Mono', ui-monospace, monospace" }}>
                {run.toISOString().replace('T', ' ').slice(0, 19)} UTC
              </p>
            ))}
          </div>
        </div>
      )}

      {result.fieldBreakdown && (
        <div>
          <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2">Field breakdown</div>
          <div className="grid grid-cols-5 gap-1.5">
            {result.fieldBreakdown.map((field, i) => (
              <div key={i} className="bg-slate-50/60 rounded-xl p-2.5 text-center border border-slate-100">
                <p className="font-mono font-semibold text-slate-900 text-[15px]" style={{ fontFamily: "'JetBrains Mono', 'SF Mono', ui-monospace, monospace" }}>{field.value}</p>
                <p className="text-[10px] text-slate-400 mt-0.5 uppercase tracking-wider">{field.label}</p>
                <p className="text-[12px] text-slate-600 mt-0.5">{field.meaning}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
