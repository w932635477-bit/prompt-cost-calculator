import { useMemo } from 'react'
import { parseCron, fromUnix, isValidCron } from './lib/cron-adapter'
import type { LongTailPage as LongTailPageData } from './seo/long-tail-data'
import { CronBuilder } from './components/CronBuilder'
import { NextRuns } from './components/NextRuns'
import { DialectSwitcher } from './components/DialectSwitcher'
import { CopyButton } from './components/CopyButton'
import { useState } from 'react'
import type { Dialect } from './lib/types'

const FIELD_LABELS: Record<string, string> = {
  '0': 'At minute 0 (top of the hour)',
  '5': 'Friday',
  '6': 'Saturday',
  '0,6': 'Sunday and Saturday',
  '1-5': 'Monday through Friday',
}

function getFieldMeaning(fieldName: string, value: string): string {
  if (value === '*') {
    const labels: Record<string, string> = { 'Minute': 'Every minute', 'Hour': 'Every hour', 'Day of Month': 'Every day', 'Month': 'Every month', 'Day of Week': 'Every day' }
    return labels[fieldName] || 'Every'
  }
  if (fieldName === 'Minute') return `At minute ${value}`
  if (fieldName === 'Hour') {
    const h = parseInt(value, 10)
    if (isNaN(h)) return value
    if (h === 0) return 'At midnight (00:00)'
    if (h === 12) return 'At noon (12:00)'
    if (h < 12) return `At ${h}:00 AM`
    return `At ${h - 12}:00 PM`
  }
  if (fieldName === 'Day of Week') return FIELD_LABELS[value] || `Day ${value}`
  if (fieldName === 'Day of Month') return `On day ${value}`
  if (fieldName === 'Month') return `In month ${value}`
  return value
}

export function LongTailPage({ page }: { page: LongTailPageData }) {
  const [dialect, setDialect] = useState<Dialect>('unix')
  const fields = page.cron.split(/\s+/)

  const unixExpression = page.cron
  const isValid = useMemo(() => {
    if (fields.length !== 5 || fields.some(f => f.trim() === '')) return false
    try { return isValidCron(unixExpression) } catch { return false }
  }, [unixExpression, fields])

  const parsed = useMemo(() => {
    if (!isValid) return null
    try { return parseCron(unixExpression, 'unix') } catch { return null }
  }, [unixExpression, isValid])

  const displayExpression = useMemo(() => {
    if (!isValid) return unixExpression
    return fromUnix(unixExpression, dialect)
  }, [unixExpression, dialect, isValid])

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white" style={{ fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif" }}>
      <div className="max-w-[920px] mx-auto px-5 sm:px-6 py-10 sm:py-16">

        {/* Breadcrumb + H1 */}
        <nav className="text-[12px] text-slate-400 mb-3">
          <a href="/cron-generator/" className="hover:text-blue-600 transition-colors">Cron Generator</a>
          <span className="mx-1.5">/</span>
          <span className="text-slate-600">{page.title}</span>
        </nav>
        <h1 className="text-[26px] sm:text-[32px] font-bold text-slate-900 tracking-tight leading-tight mb-2">{page.h1}</h1>
        <p className="text-[14px] text-slate-500 mb-8">{page.description}</p>

        {/* Expression Display */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-[0_1px_3px_rgba(0,0,0,0.04),0_4px_12px_rgba(0,0,0,0.03)] overflow-hidden mb-8">
          <div className="px-6 sm:px-8 py-6 sm:py-7 border-b border-slate-100 bg-gradient-to-b from-slate-50/80 to-white">
            <div className="flex items-center justify-between gap-4 flex-wrap">
              <div className="flex-1 min-w-0">
                <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2">Cron Expression</div>
                <code className="text-[28px] sm:text-[36px] font-bold tracking-[0.04em] leading-none text-slate-900" style={{ fontFamily: "'JetBrains Mono', 'SF Mono', ui-monospace, monospace" }}>
                  {displayExpression}
                </code>
              </div>
              <div className="flex items-center gap-2.5 shrink-0">
                <DialectSwitcher value={dialect} onChange={setDialect} />
                {isValid && <CopyButton text={displayExpression} />}
              </div>
            </div>
            {parsed && (
              <p className="mt-3 text-[13px] text-slate-500 font-medium">{parsed.humanReadable}</p>
            )}
          </div>

          {/* Builder */}
          <div className="p-6 sm:p-8">
            <CronBuilder fields={fields} onChange={() => {}} />
          </div>

          {/* Next Runs */}
          {parsed && (
            <div className="px-6 sm:px-8 py-5 border-t border-slate-100 bg-slate-50/40">
              <NextRuns runs={parsed.nextRuns} />
            </div>
          )}
        </div>

        {/* Field Breakdown Table */}
        {isValid && fields.length === 5 && (
          <section className="mb-8">
            <h2 className="text-[17px] font-semibold text-slate-900 mb-4">Field Breakdown</h2>
            <div className="bg-white rounded-xl border border-slate-200/80 overflow-hidden">
              <table className="w-full text-[13px]">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50/60">
                    <th className="text-left py-2.5 px-5 font-medium text-slate-500">Field</th>
                    <th className="text-center py-2.5 px-4 font-medium text-slate-500">Value</th>
                    <th className="text-left py-2.5 px-5 font-medium text-slate-500">Meaning</th>
                  </tr>
                </thead>
                <tbody>
                  {['Minute', 'Hour', 'Day of Month', 'Month', 'Day of Week'].map((name, i) => (
                    <tr key={name} className={i < 4 ? 'border-b border-slate-100' : ''}>
                      <td className="py-2.5 px-5 text-slate-700">{name}</td>
                      <td className="py-2.5 px-4 text-center"><code className="text-[13px] font-semibold text-slate-900 bg-slate-100 px-2 py-0.5 rounded" style={{ fontFamily: "'JetBrains Mono', monospace" }}>{fields[i]}</code></td>
                      <td className="py-2.5 px-5 text-slate-600">{getFieldMeaning(name, fields[i])}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        )}

        {/* Code Examples */}
        {page.codeExamples && page.codeExamples.length > 0 && (
          <section className="mb-8">
            <h2 className="text-[17px] font-semibold text-slate-900 mb-4">Copy-Paste Examples</h2>
            <div className="space-y-2.5">
              {page.codeExamples.map(ex => (
                <div key={ex.label} className="bg-slate-900 rounded-xl p-4 flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <div className="text-[11px] text-slate-400 mb-1.5 font-medium">{ex.label}</div>
                    <code className="text-[13px] text-green-400 font-mono break-all" style={{ fontFamily: "'JetBrains Mono', monospace" }}>{ex.code}</code>
                  </div>
                  <CopyButton text={ex.code} />
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Common Use Cases */}
        {page.useCases && page.useCases.length > 0 && (
          <section className="mb-8">
            <h2 className="text-[17px] font-semibold text-slate-900 mb-4">Common Use Cases</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {page.useCases.map(uc => (
                <div key={uc.title} className="bg-white rounded-xl border border-slate-200/80 p-4">
                  <div className="text-[14px] font-medium text-slate-800 mb-1">{uc.title}</div>
                  <div className="text-[13px] text-slate-500">{uc.description}</div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* SEO Explanation */}
        <section className="mb-8">
          <h2 className="text-[17px] font-semibold text-slate-900 mb-4">Explanation</h2>
          <div className="text-[14px] text-slate-600 leading-relaxed bg-white rounded-xl border border-slate-200/80 p-5 sm:p-6">
            {page.explanation}
          </div>
        </section>

        {/* Related Schedules */}
        {page.relatedPages && page.relatedPages.length > 0 && (
          <section className="mb-8">
            <h2 className="text-[17px] font-semibold text-slate-900 mb-4">Related Schedules</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {page.relatedPages.map(rp => (
                <a
                  key={rp.url}
                  href={rp.url}
                  className="flex items-center gap-3 bg-white rounded-xl border border-slate-200/80 p-4 hover:border-blue-300 hover:shadow-sm transition-[border-color,box-shadow] group"
                >
                  <code className="text-[12px] font-semibold text-slate-700 bg-slate-100 px-2 py-0.5 rounded shrink-0" style={{ fontFamily: "'JetBrains Mono', monospace" }}>{rp.cron}</code>
                  <span className="text-[13px] font-medium text-slate-700 group-hover:text-blue-600 transition-colors">{rp.label}</span>
                  <span className="ml-auto text-slate-300 group-hover:text-blue-400 shrink-0" aria-hidden="true">→</span>
                </a>
              ))}
            </div>
          </section>
        )}

        {/* SEO FAQ */}
        {page.faq.length > 0 && (
          <section className="mb-10">
            <h2 className="text-[17px] font-semibold text-slate-900 mb-4">Frequently Asked Questions</h2>
            <div className="space-y-2.5">
              {page.faq.map((item, i) => (
                <details key={i} className="group bg-white border border-slate-200/80 rounded-xl overflow-hidden hover:border-slate-300 transition-colors">
                  <summary className="flex items-center justify-between px-5 py-4 cursor-pointer select-none hover:bg-slate-50/50 transition-colors">
                    <span className="text-[14px] font-medium text-slate-800">{item.q}</span>
                    <svg className="w-4 h-4 text-slate-400 group-open:rotate-180 transition-transform duration-200 shrink-0 ml-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </summary>
                  <div className="px-5 pb-4 text-[13px] text-slate-600 leading-relaxed">{item.a}</div>
                </details>
              ))}
            </div>
          </section>
        )}

        {/* Back link */}
        <footer className="mt-10 text-center text-[12px] text-slate-400 pb-8">
          <p>
            <a href="/cron-generator/" className="text-blue-500 hover:text-blue-600 font-medium transition-colors">Back to Cron Generator</a>
            {' · '}
            <a href="/" className="text-blue-500 hover:text-blue-600 font-medium transition-colors">AI Token Cost Calculator</a>
          </p>
        </footer>
      </div>
    </div>
  )
}
