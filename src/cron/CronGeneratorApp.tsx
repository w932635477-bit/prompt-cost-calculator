import { useState, useMemo, useCallback } from 'react'
import { parseCron, fromUnix, isValidCron } from './lib/cron-adapter'
import type { Dialect } from './lib/types'
import { CronBuilder } from './components/CronBuilder'
import { NaturalInput } from './components/NaturalInput'
import { CronExplainer } from './components/CronExplainer'
import { NextRuns } from './components/NextRuns'
import { DialectSwitcher } from './components/DialectSwitcher'
import { CopyButton } from './components/CopyButton'
import { LanguageSwitcher } from './components/LanguageSwitcher'
import { GlobalNav } from '../components/GlobalNav'
import { RelatedTools } from '../components/RelatedTools'
import { FaqSchema } from '../components/FaqSchema'
import { useT, useLocale } from './i18n'

type Tab = 'builder' | 'explainer'

export default function CronGeneratorApp() {
  const t = useT()
  const locale = useLocale()
  const [tab, setTab] = useState<Tab>('builder')
  const [dialect, setDialect] = useState<Dialect>('unix')
  const [fields, setFields] = useState<string[]>(['*/5', '*', '*', '*', '*'])

  const unixExpression = fields.join(' ')
  const isValid = useMemo(() => {
    if (fields.length !== 5 || fields.some(f => f.trim() === '')) return false
    try {
      return isValidCron(unixExpression)
    } catch {
      return false
    }
  }, [unixExpression, fields])

  const parsed = useMemo(() => {
    if (!isValid) return null
    try {
      return parseCron(unixExpression, 'unix')
    } catch {
      return null
    }
  }, [unixExpression, isValid])

  const displayExpression = useMemo(() => {
    if (!isValid) return unixExpression
    return fromUnix(unixExpression, dialect)
  }, [unixExpression, dialect, isValid])

  const handleCronGenerated = useCallback((cron: string) => {
    setFields(cron.split(/\s+/))
    setTab('builder')
  }, [])

  const handleExpressionParsed = useCallback((expression: string) => {
    setFields(expression.split(/\s+/))
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white" style={{ fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif" }}>
      <GlobalNav current="/cron-generator/" />
      <div className="max-w-[920px] mx-auto px-5 sm:px-6 py-10 sm:py-16">
        {/* Header */}
        <header className="text-center mb-10">
          <h1 className="text-[28px] sm:text-[34px] font-bold text-slate-900 tracking-tight leading-tight">
            {t.header.title}
          </h1>
          <p className="mt-2.5 text-[15px] text-slate-500 max-w-lg mx-auto leading-relaxed">
            {t.header.subtitle}
          </p>
          <a
            href="/"
            className="inline-block mt-3 text-[13px] text-blue-600 hover:text-blue-700 font-medium transition-colors"
          >
            {t.header.homeLink}
          </a>
          <div className="mt-3">
            <LanguageSwitcher currentLocale={locale} />
          </div>
        </header>

        {/* Main Tool Card */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-[0_1px_3px_rgba(0,0,0,0.04),0_4px_12px_rgba(0,0,0,0.03)] overflow-hidden">
          {/* Expression Display */}
          <div className="px-6 sm:px-8 py-6 sm:py-7 border-b border-slate-100 bg-gradient-to-b from-slate-50/80 to-white">
            <div className="flex items-center justify-between gap-4 flex-wrap">
              <div className="flex-1 min-w-0">
                <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2">{t.expression.label}</div>
                <div className="flex items-center gap-3">
                  <code className={`text-[28px] sm:text-[36px] font-bold tracking-[0.04em] leading-none ${
                    isValid ? 'text-slate-900' : 'text-red-400'
                  }`} style={{ fontFamily: "'JetBrains Mono', 'SF Mono', ui-monospace, monospace" }}>
                    {displayExpression}
                  </code>
                </div>
              </div>
              <div className="flex items-center gap-2.5 shrink-0">
                <DialectSwitcher value={dialect} onChange={setDialect} />
                {isValid && <CopyButton text={displayExpression} />}
              </div>
            </div>
            {parsed && (
              <p className="mt-3 text-[13px] text-slate-500 font-medium">{parsed.humanReadable}</p>
            )}
            {!isValid && unixExpression && (
              <p className="mt-3 text-[13px] text-red-500 font-medium">{t.expression.invalid}</p>
            )}
          </div>

          {/* Tab Navigation */}
          <div className="flex border-b border-slate-100 bg-white">
            <button
              onClick={() => setTab('builder')}
              className={`flex-1 px-4 py-3.5 text-[13px] font-semibold tracking-wide transition-colors relative ${
                tab === 'builder'
                  ? 'text-blue-600'
                  : 'text-slate-400 hover:text-slate-600'
              }`}
            >
              {t.tabs.builder}
              {tab === 'builder' && (
                <span className="absolute bottom-0 left-1/4 right-1/4 h-[2px] bg-blue-600 rounded-full" />
              )}
            </button>
            <button
              onClick={() => setTab('explainer')}
              className={`flex-1 px-4 py-3.5 text-[13px] font-semibold tracking-wide transition-colors relative ${
                tab === 'explainer'
                  ? 'text-blue-600'
                  : 'text-slate-400 hover:text-slate-600'
              }`}
            >
              {t.tabs.explainer}
              {tab === 'explainer' && (
                <span className="absolute bottom-0 left-1/4 right-1/4 h-[2px] bg-blue-600 rounded-full" />
              )}
            </button>
          </div>

          {/* Tab Content */}
          <div className="p-6 sm:p-8">
            {tab === 'builder' && (
              <div className="space-y-7">
                <NaturalInput onCronGenerated={handleCronGenerated} />
                <div className="border-t border-slate-100" />
                <CronBuilder fields={fields} onChange={setFields} />
              </div>
            )}

            {tab === 'explainer' && (
              <CronExplainer onExpressionParsed={handleExpressionParsed} />
            )}
          </div>

          {/* Next Runs */}
          {parsed && (
            <div className="px-6 sm:px-8 py-5 border-t border-slate-100 bg-slate-50/40">
              <NextRuns runs={parsed.nextRuns} />
            </div>
          )}
        </div>

        {/* Common Patterns Reference */}
        <div className="mt-12">
          <h2 className="text-[17px] font-semibold text-slate-900 mb-5">{t.patterns.title}</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
            {t.patterns.items.map((p, i) => (
              <button
                key={i}
                onClick={() => handleCronGenerated(p.cron)}
                className="flex items-center justify-between px-4 py-3 bg-white border border-slate-200/80 rounded-xl hover:border-blue-300 hover:shadow-[0_2px_8px_rgba(59,130,246,0.08)] transition-all text-left group"
              >
                <div className="min-w-0">
                  <div className="text-[13px] font-medium text-slate-700 group-hover:text-blue-700 transition-colors truncate">{p.description}</div>
                  <code className="text-[11px] text-slate-400" style={{ fontFamily: "'JetBrains Mono', monospace" }}>{p.cron}</code>
                </div>
                <svg className="w-3.5 h-3.5 text-slate-300 group-hover:text-blue-400 shrink-0 ml-2 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            ))}
          </div>
        </div>

        {/* Popular Cron Schedules — internal links for SEO */}
        <div className="mt-12">
          <h2 className="text-[17px] font-semibold text-slate-900 mb-4">Popular Cron Schedules</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-x-4 gap-y-2">
            {[
              { label: 'Every Minute', href: '/cron-generator/every-minute/' },
              { label: 'Every 5 Minutes', href: '/cron-generator/every-5-minutes/' },
              { label: 'Every 10 Minutes', href: '/cron-generator/every-10-minutes/' },
              { label: 'Every 15 Minutes', href: '/cron-generator/every-15-minutes/' },
              { label: 'Every 30 Minutes', href: '/cron-generator/every-30-minutes/' },
              { label: 'Every Hour', href: '/cron-generator/every-hour/' },
              { label: 'Every 6 Hours', href: '/cron-generator/every-6-hours/' },
              { label: 'Every 12 Hours', href: '/cron-generator/every-12-hours/' },
              { label: 'Daily at Midnight', href: '/cron-generator/every-day-midnight/' },
              { label: 'Daily at Noon', href: '/cron-generator/every-day-noon/' },
              { label: 'Daily at 9 AM', href: '/cron-generator/every-day-9am/' },
              { label: 'Weekdays 9 AM', href: '/cron-generator/weekdays-9am/' },
              { label: 'Every Monday', href: '/cron-generator/every-monday/' },
              { label: 'Every Friday', href: '/cron-generator/every-friday/' },
              { label: 'Weekends', href: '/cron-generator/weekends/' },
              { label: 'First of Month', href: '/cron-generator/first-of-month/' },
            ].map(link => (
              <a
                key={link.href}
                href={link.href}
                className="text-[13px] text-blue-600 hover:text-blue-800 hover:underline py-1 transition-colors"
              >
                {link.label}
              </a>
            ))}
          </div>
          <a
            href="/cron-generator/common-patterns/"
            className="inline-block mt-3 text-[12px] text-slate-500 hover:text-blue-600 transition-colors"
          >
            View all 100+ cron examples →
          </a>
        </div>

        {/* FAQ */}
        <div className="mt-14">
          <h2 className="text-[17px] font-semibold text-slate-900 mb-5">{t.faq.title}</h2>
          <div className="space-y-2.5">
            {t.faq.items.map((faq, i) => (
              <details key={i} className="group bg-white border border-slate-200/80 rounded-xl overflow-hidden hover:border-slate-300 transition-colors">
                <summary className="flex items-center justify-between px-5 py-4 cursor-pointer select-none hover:bg-slate-50/50 transition-colors">
                  <span className="text-[14px] font-medium text-slate-800">{faq.q}</span>
                  <svg className="w-4 h-4 text-slate-400 group-open:rotate-180 transition-transform duration-200 shrink-0 ml-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </summary>
                <div className="px-5 pb-4 text-[13px] text-slate-600 leading-relaxed">
                  {faq.a}
                </div>
              </details>
            ))}
          </div>
        </div>

        {/* Footer */}
        <footer className="mt-16 text-center text-[12px] text-slate-400 pb-8">
          <p>{t.footer.text}</p>
          <p className="mt-1.5">
            <a href="/" className="text-blue-500 hover:text-blue-600 font-medium transition-colors">{t.footer.link}</a>
          </p>
        </footer>
        <RelatedTools currentPath="/cron-generator/" />
        <FaqSchema items={t.faq.items.map((f: { q: string; a: string }) => ({ question: f.q, answer: f.a }))} />
      </div>
    </div>
  )
}
