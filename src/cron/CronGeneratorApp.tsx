import { useState, useMemo, useCallback } from 'react'
import { parseCron, fromUnix, isValidCron } from './lib/cron-adapter'
import { getAllPatterns } from './lib/nl-parser'
import type { Dialect } from './lib/types'
import { CronBuilder } from './components/CronBuilder'
import { NaturalInput } from './components/NaturalInput'
import { CronExplainer } from './components/CronExplainer'
import { NextRuns } from './components/NextRuns'
import { DialectSwitcher } from './components/DialectSwitcher'
import { CopyButton } from './components/CopyButton'

const ALL_PATTERNS = getAllPatterns()

type Tab = 'builder' | 'explainer'

export default function CronGeneratorApp() {
  const [tab, setTab] = useState<Tab>('builder')
  const [dialect, setDialect] = useState<Dialect>('unix')
  const [fields, setFields] = useState<string[]>(['*/5', '*', '*', '*', '*'])

  const unixExpression = fields.join(' ')
  const isValid = useMemo(() => {
    try {
      return isValidCron(unixExpression)
    } catch {
      return false
    }
  }, [unixExpression])

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
    setTab('builder')
  }, [])

  return (
    <div className="min-h-screen bg-[#fbfbfd]">
      <div className="max-w-[980px] mx-auto px-4 py-8 sm:py-12">
        {/* Header */}
        <header className="text-center mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2">
            Cron Expression Generator
          </h1>
          <p className="text-base text-gray-500 max-w-xl mx-auto">
            Build, explain, and convert cron expressions. Supports Unix, Quartz, and AWS EventBridge.
          </p>
          <a
            href="/"
            className="inline-block mt-3 text-sm text-blue-600 hover:text-blue-700 transition-colors"
          >
            AI Cost Calculator
          </a>
        </header>

        {/* Main Tool Card */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
          {/* Expression Display */}
          <div className="px-6 py-5 border-b border-gray-100 bg-gray-50/50">
            <div className="flex items-center justify-between gap-4 flex-wrap">
              <div className="flex-1 min-w-0">
                <div className="text-xs text-gray-400 mb-1">Generated Expression</div>
                <div className="flex items-center gap-3">
                  <code className={`text-2xl sm:text-3xl font-mono font-bold tracking-wider ${
                    isValid ? 'text-gray-900' : 'text-red-400'
                  }`}>
                    {displayExpression}
                  </code>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <DialectSwitcher value={dialect} onChange={setDialect} />
                {isValid && <CopyButton text={displayExpression} />}
              </div>
            </div>
            {parsed && (
              <p className="mt-2 text-sm text-gray-600">{parsed.humanReadable}</p>
            )}
            {!isValid && unixExpression && (
              <p className="mt-2 text-sm text-red-500">Invalid cron expression</p>
            )}
          </div>

          {/* Tab Navigation */}
          <div className="flex border-b border-gray-100">
            <button
              onClick={() => setTab('builder')}
              className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
                tab === 'builder'
                  ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50/30'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Builder
            </button>
            <button
              onClick={() => setTab('explainer')}
              className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
                tab === 'explainer'
                  ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50/30'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Explainer
            </button>
          </div>

          {/* Tab Content */}
          <div className="p-6">
            {tab === 'builder' && (
              <div className="space-y-6">
                {/* Natural Language Input */}
                <div>
                  <h2 className="text-sm font-medium text-gray-700 mb-2">Natural Language</h2>
                  <NaturalInput onCronGenerated={handleCronGenerated} />
                </div>

                <hr className="border-gray-100" />

                {/* Visual Builder */}
                <div>
                  <h2 className="text-sm font-medium text-gray-700 mb-3">Visual Builder</h2>
                  <CronBuilder fields={fields} onChange={setFields} />
                </div>
              </div>
            )}

            {tab === 'explainer' && (
              <CronExplainer onExpressionParsed={handleExpressionParsed} />
            )}
          </div>

          {/* Next Runs */}
          {parsed && (
            <div className="px-6 py-5 border-t border-gray-100 bg-gray-50/30">
              <NextRuns runs={parsed.nextRuns} />
            </div>
          )}
        </div>

        {/* Common Patterns Reference */}
        <div className="mt-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Common Cron Patterns</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {ALL_PATTERNS.slice(0, 18).map((p, i) => (
              <button
                key={i}
                onClick={() => handleCronGenerated(p.cron)}
                className="flex items-center justify-between px-4 py-3 bg-white border border-gray-200 rounded-xl hover:border-blue-300 hover:shadow-sm transition-all text-left group"
              >
                <div className="min-w-0">
                  <div className="text-sm text-gray-900 group-hover:text-blue-700 transition-colors truncate">{p.description}</div>
                  <code className="text-xs font-mono text-gray-400">{p.cron}</code>
                </div>
                <svg className="w-4 h-4 text-gray-300 group-hover:text-blue-400 shrink-0 ml-2 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            ))}
          </div>
        </div>

        {/* FAQ */}
        <div className="mt-12">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Frequently Asked Questions</h2>
          <div className="space-y-3">
            {[
              {
                q: 'What is a cron expression?',
                a: 'A cron expression is a string of 5 fields that defines a schedule: minute (0-59), hour (0-23), day of month (1-31), month (1-12), and day of week (0-6, where 0 is Sunday). Special characters: * (any), , (list), - (range), / (step).',
              },
              {
                q: 'What is the difference between Unix, Quartz, and AWS cron?',
                a: 'Unix cron has 5 fields. Quartz (used in Java) adds a seconds field and optional year field (6-7 fields total), and uses ? instead of * for day fields. AWS EventBridge uses cron() or rate() expressions with a year field.',
              },
              {
                q: 'How do I run a cron job every 5 minutes?',
                a: 'Use */5 * * * * (Unix), 0 */5 * ? * * * (Quartz), or rate(5 minutes) (AWS). The */5 means "every 5th value" in the minute field.',
              },
              {
                q: 'How do I run a cron job on weekdays only?',
                a: 'Use 0 9 * * 1-5 to run at 9:00 AM Monday through Friday. The 1-5 in the day-of-week field means Monday(1) to Friday(5).',
              },
              {
                q: 'Is this tool free?',
                a: 'Yes, completely free. No login required. All processing happens in your browser. No data is sent to any server.',
              },
            ].map((faq, i) => (
              <details key={i} className="group bg-white border border-gray-200 rounded-xl overflow-hidden">
                <summary className="flex items-center justify-between px-5 py-4 cursor-pointer select-none hover:bg-gray-50 transition-colors">
                  <span className="text-sm font-medium text-gray-900">{faq.q}</span>
                  <svg className="w-5 h-5 text-gray-400 group-open:rotate-180 transition-transform shrink-0 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </summary>
                <div className="px-5 pb-4 text-sm text-gray-600 leading-relaxed">
                  {faq.a}
                </div>
              </details>
            ))}
          </div>
        </div>

        {/* Footer */}
        <footer className="mt-12 text-center text-xs text-gray-400">
          <p>Free cron expression generator. No login, no data collection.</p>
          <p className="mt-1">
            <a href="/" className="text-blue-500 hover:text-blue-600 transition-colors">AI Prompt Cost Calculator</a>
          </p>
        </footer>
      </div>
    </div>
  )
}
