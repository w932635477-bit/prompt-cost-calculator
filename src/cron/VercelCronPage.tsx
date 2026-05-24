import { useMemo, useState } from 'react'
import { parseCron, fromUnix, isValidCron } from './lib/cron-adapter'
import { CronBuilder } from './components/CronBuilder'
import { NextRuns } from './components/NextRuns'
import { DialectSwitcher } from './components/DialectSwitcher'
import { CopyButton } from './components/CopyButton'
import type { Dialect } from './lib/types'

const EXAMPLES = [
  { label: 'Every hour', schedule: '0 * * * *', path: '/api/cleanup', desc: 'Run a cleanup task at the top of every hour.' },
  { label: 'Every day at midnight', schedule: '0 0 * * *', path: '/api/daily-report', desc: 'Generate and send a daily report at midnight UTC.' },
  { label: 'Every 5 minutes', schedule: '*/5 * * * *', path: '/api/health-check', desc: 'Poll a health endpoint every 5 minutes.' },
  { label: 'Weekdays 9 AM', schedule: '0 9 * * 1-5', path: '/api/morning-brief', desc: 'Send a morning brief on Monday through Friday at 9 AM UTC.' },
  { label: 'Twice daily', schedule: '0 0,12 * * *', path: '/api/sync', desc: 'Sync data at midnight and noon UTC every day.' },
  { label: 'Every Monday 3 AM', schedule: '0 3 * * 1', path: '/api/weekly-backup', desc: 'Run a weekly backup every Monday at 3 AM UTC.' },
]

const TIPS = [
  { title: 'Timezone is always UTC', body: 'Vercel cron jobs run in UTC. There is no timezone field. If you need 9 AM EST, use 0 14 * * * (14:00 UTC).' },
  { title: 'Free plan: 1 cron job', body: 'The Vercel Hobby plan allows 1 cron job per deployment. Pro allows 2, Enterprise allows unlimited. You can work around this by routing multiple tasks through a single cron endpoint.' },
  { title: 'Minimum interval: 1 minute', body: 'You cannot schedule a cron job more frequently than once per minute. Use */1 * * * * or * * * * * for per-minute execution.' },
  { title: 'Function timeout: 60s (Hobby), 300s (Pro)', body: 'Your cron endpoint must respond within the function timeout. For long-running tasks, split the work across multiple runs or use a queue.' },
  { title: 'Cron path must be a valid route', body: 'The path in your vercel.json must match an actual API route in your project. For Next.js App Router, this is an app/api/.../route.ts file.' },
  { title: 'Check logs for debugging', body: 'Use `vercel logs --follow` or the Vercel dashboard to see cron execution logs. Failed executions show the HTTP status code and error message.' },
]

const FAQ = [
  {
    q: 'How do I set up a cron job on Vercel?',
    a: 'Add a "crons" array to your vercel.json (or vercel.ts config). Each entry needs a "path" (your API route) and a "schedule" (standard 5-field cron expression). Deploy and Vercel handles the rest. No server to manage.',
  },
  {
    q: 'What is the cron syntax for vercel.json?',
    a: 'Vercel uses standard Unix 5-field cron: minute hour day-of-month month day-of-week. For example, "0 */6 * * *" runs every 6 hours. The path field is the API route to call, e.g. "/api/cleanup".',
  },
  {
    q: 'Does Vercel support 6-field cron expressions with seconds?',
    a: 'No. Vercel cron uses the standard 5-field Unix cron format (minute, hour, day of month, month, day of week). The minimum interval is 1 minute. You cannot specify seconds.',
  },
  {
    q: 'What are Vercel cron job limits?',
    a: 'Hobby (free): 1 cron job, 60s timeout. Pro: 2 cron jobs, 300s timeout. Enterprise: unlimited cron jobs, configurable timeout. All plans: minimum 1-minute interval, UTC timezone only.',
  },
  {
    q: 'How do I debug a Vercel cron job?',
    a: 'Use `vercel logs --follow` to stream real-time logs, or check the Functions tab in the Vercel dashboard. Look for the cron trigger in the log entries. Common issues: wrong path, function timeout, route returning non-200 status.',
  },
  {
    q: 'Can I use Vercel cron jobs on the free plan?',
    a: 'Yes. The Hobby (free) plan supports 1 cron job with a 60-second function timeout. For multiple cron jobs or longer timeouts, upgrade to Pro ($20/month).',
  },
]

export function VercelCronPage() {
  const [dialect, setDialect] = useState<Dialect>('unix')
  const [expression, setExpression] = useState('0 * * * *')

  const fields = expression.split(/\s+/)

  const isValid = useMemo(() => {
    if (fields.length !== 5 || fields.some(f => f.trim() === '')) return false
    try { return isValidCron(expression) } catch { return false }
  }, [expression, fields])

  const parsed = useMemo(() => {
    if (!isValid) return null
    try { return parseCron(expression, 'unix') } catch { return null }
  }, [expression, isValid])

  const displayExpression = useMemo(() => {
    if (!isValid) return expression
    return fromUnix(expression, dialect)
  }, [expression, dialect, isValid])

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white" style={{ fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif" }}>
      <div className="max-w-[920px] mx-auto px-5 sm:px-6 py-10 sm:py-16">

        {/* Breadcrumb */}
        <nav className="text-[12px] text-slate-400 mb-3">
          <a href="/" className="hover:text-blue-600 transition-colors">Home</a>
          <span className="mx-1.5">/</span>
          <a href="/cron-generator/" className="hover:text-blue-600 transition-colors">Cron Generator</a>
          <span className="mx-1.5">/</span>
          <span className="text-slate-600">Vercel Cron Jobs</span>
        </nav>

        {/* H1 */}
        <h1 className="text-[26px] sm:text-[32px] font-bold text-slate-900 tracking-tight leading-tight mb-2">
          Vercel Cron Job Syntax Guide &amp; Generator
        </h1>
        <p className="text-[14px] text-slate-500 mb-8">
          Generate and understand cron expressions for Vercel scheduled functions.
          Copy the vercel.json config, preview next run times, and learn the syntax.
        </p>

        {/* === Interactive Cron Tool === */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-[0_1px_3px_rgba(0,0,0,0.04),0_4px_12px_rgba(0,0,0,0.03)] overflow-hidden mb-8">
          {/* Expression Display */}
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
            <CronBuilder fields={fields} onChange={(newFields) => setExpression(newFields.join(' '))} />
          </div>

          {/* Next Runs */}
          {parsed && (
            <div className="px-6 sm:px-8 py-5 border-t border-slate-100 bg-slate-50/40">
              <NextRuns runs={parsed.nextRuns} />
            </div>
          )}
        </div>

        {/* === vercel.json Config Output === */}
        <section className="mb-10">
          <h2 className="text-[17px] font-semibold text-slate-900 mb-4">Your vercel.json Config</h2>
          <div className="relative bg-slate-900 rounded-xl overflow-hidden">
            <div className="absolute top-3 right-3 z-10">
              <CopyButton text={`{\n  "crons": [{\n    "path": "/api/cron",\n    "schedule": "${expression}"\n  }]\n}`} />
            </div>
            <pre className="p-5 sm:p-6 text-[13px] leading-relaxed overflow-x-auto text-emerald-300" style={{ fontFamily: "'JetBrains Mono', 'SF Mono', ui-monospace, monospace" }}>
{`{
  "crons": [{
    "path": "/api/cron",
    "schedule": "${expression}"
  }]
}`}
            </pre>
          </div>
          <p className="mt-3 text-[12px] text-slate-400">
            Place this in your project root as vercel.json. The path must match an API route in your project.
          </p>
        </section>

        {/* === Syntax Reference === */}
        <section className="mb-10">
          <h2 className="text-[17px] font-semibold text-slate-900 mb-4">vercel.json Cron Syntax</h2>
          <div className="text-[14px] text-slate-600 leading-relaxed bg-white rounded-xl border border-slate-200/80 p-5 sm:p-6 space-y-4">
            <p>
              Vercel cron jobs are defined in <code className="bg-slate-100 px-1.5 py-0.5 rounded text-[13px] font-mono text-slate-800">vercel.json</code> using
              a <code className="bg-slate-100 px-1.5 py-0.5 rounded text-[13px] font-mono text-slate-800">"crons"</code> array. Each entry has two fields:
            </p>
            <ul className="list-disc list-inside space-y-1.5 ml-2">
              <li><strong>path</strong> — The API route to invoke (e.g. <code className="bg-slate-100 px-1 py-0.5 rounded text-[12px] font-mono">"/api/cleanup"</code>)</li>
              <li><strong>schedule</strong> — A standard 5-field Unix cron expression (e.g. <code className="bg-slate-100 px-1 py-0.5 rounded text-[12px] font-mono">"0 * * * *"</code>)</li>
            </ul>

            <div className="bg-slate-50 rounded-lg p-4 mt-4">
              <div className="text-[12px] font-semibold text-slate-500 uppercase tracking-wider mb-2">5-Field Format</div>
              <code className="text-[15px] font-bold text-slate-800" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
                ┌───────── minute (0-59)
              </code>
              <br />
              <code className="text-[15px] font-bold text-slate-800" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
                │ ┌─────── hour (0-23)
              </code>
              <br />
              <code className="text-[15px] font-bold text-slate-800" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
                │ │ ┌───── day of month (1-31)
              </code>
              <br />
              <code className="text-[15px] font-bold text-slate-800" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
                │ │ │ ┌─── month (1-12)
              </code>
              <br />
              <code className="text-[15px] font-bold text-slate-800" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
                │ │ │ │ ┌─ day of week (0-6, 0=Sunday)
              </code>
              <br />
              <code className="text-[15px] font-bold text-slate-800" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
                * * * * *
              </code>
            </div>

            <p>
              Special characters: <code className="bg-slate-100 px-1 py-0.5 rounded text-[12px] font-mono">*</code> (any), <code className="bg-slate-100 px-1 py-0.5 rounded text-[12px] font-mono">,</code> (list), <code className="bg-slate-100 px-1 py-0.5 rounded text-[12px] font-mono">-</code> (range), <code className="bg-slate-100 px-1 py-0.5 rounded text-[12px] font-mono">/</code> (step).
              Vercel does <strong>not</strong> support 6-field cron with seconds.
            </p>
          </div>
        </section>

        {/* === Code Examples === */}
        <section className="mb-10">
          <h2 className="text-[17px] font-semibold text-slate-900 mb-4">vercel.json Examples</h2>
          <div className="space-y-4">
            {EXAMPLES.map((ex, i) => (
              <div key={i} className="bg-white rounded-xl border border-slate-200/80 overflow-hidden">
                <div className="flex items-center justify-between px-5 py-3 border-b border-slate-100 bg-slate-50/50">
                  <span className="text-[13px] font-semibold text-slate-700">{ex.label}</span>
                  <span className="text-[11px] font-mono text-slate-400">{ex.schedule}</span>
                </div>
                <pre className="px-5 py-4 text-[13px] leading-relaxed overflow-x-auto text-slate-700" style={{ fontFamily: "'JetBrains Mono', 'SF Mono', monospace" }}>
{`{
  "crons": [{
    "path": "${ex.path}",
    "schedule": "${ex.schedule}"
  }]
}`}
                </pre>
                <div className="px-5 pb-4 text-[12px] text-slate-500">{ex.desc}</div>
              </div>
            ))}
          </div>
        </section>

        {/* === Next.js Route Example === */}
        <section className="mb-10">
          <h2 className="text-[17px] font-semibold text-slate-900 mb-4">Next.js Route Handler Example</h2>
          <div className="relative bg-slate-900 rounded-xl overflow-hidden">
            <div className="absolute top-3 right-3 z-10">
              <CopyButton text={`import { NextResponse } from 'next/server'

export async function GET() {
  try {
    // Your cron logic here
    await runCleanup()
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Cron failed:', error)
    return NextResponse.json({ success: false }, { status: 500 })
  }
}`} />
            </div>
            <pre className="p-5 sm:p-6 text-[13px] leading-relaxed overflow-x-auto text-emerald-300" style={{ fontFamily: "'JetBrains Mono', 'SF Mono', ui-monospace, monospace" }}>
{`// app/api/cleanup/route.ts
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    // Your cron logic here
    await runCleanup()
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Cron failed:', error)
    return NextResponse.json(
      { success: false },
      { status: 500 }
    )
  }
}`}
            </pre>
          </div>
          <p className="mt-3 text-[12px] text-slate-400">
            Vercel cron jobs call your API route via GET. Return 200 for success. Non-200 responses are logged as failures.
          </p>
        </section>

        {/* === Tips === */}
        <section className="mb-10">
          <h2 className="text-[17px] font-semibold text-slate-900 mb-4">Vercel Cron Tips &amp; Gotchas</h2>
          <div className="space-y-3">
            {TIPS.map((tip, i) => (
              <div key={i} className="bg-white rounded-xl border border-slate-200/80 p-5">
                <div className="text-[14px] font-semibold text-slate-800 mb-1.5">{tip.title}</div>
                <div className="text-[13px] text-slate-600 leading-relaxed">{tip.body}</div>
              </div>
            ))}
          </div>
        </section>

        {/* === FAQ === */}
        <section className="mb-10">
          <h2 className="text-[17px] font-semibold text-slate-900 mb-4">Frequently Asked Questions</h2>
          <div className="space-y-2.5">
            {FAQ.map((item, i) => (
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

        {/* === Internal Links === */}
        <section className="mb-10">
          <h2 className="text-[17px] font-semibold text-slate-900 mb-4">Related Tools</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <a href="/cron-generator/" className="block bg-white rounded-xl border border-slate-200/80 p-4 hover:border-blue-300 hover:shadow-sm transition-all">
              <div className="text-[14px] font-semibold text-slate-800">Cron Expression Generator</div>
              <div className="text-[12px] text-slate-500 mt-1">Build and explain any cron expression visually.</div>
            </a>
            <a href="/cron-generator/common-patterns/" className="block bg-white rounded-xl border border-slate-200/80 p-4 hover:border-blue-300 hover:shadow-sm transition-all">
              <div className="text-[14px] font-semibold text-slate-800">Common Cron Patterns</div>
              <div className="text-[12px] text-slate-500 mt-1">Ready-to-use cron expressions for popular schedules.</div>
            </a>
            <a href="/alternatives/" className="block bg-white rounded-xl border border-slate-200/80 p-4 hover:border-blue-300 hover:shadow-sm transition-all">
              <div className="text-[14px] font-semibold text-slate-800">Self-Hosted Alternatives</div>
              <div className="text-[12px] text-slate-500 mt-1">Replace SaaS tools with open-source self-hosted options.</div>
            </a>
            <a href="/compare/" className="block bg-white rounded-xl border border-slate-200/80 p-4 hover:border-blue-300 hover:shadow-sm transition-all">
              <div className="text-[14px] font-semibold text-slate-800">AI Model Comparison</div>
              <div className="text-[12px] text-slate-500 mt-1">Compare LLM API pricing, speed, and capabilities.</div>
            </a>
          </div>
        </section>

        {/* Footer */}
        <footer className="mt-10 text-center text-[12px] text-slate-400 pb-8">
          <p>
            <a href="/cron-generator/" className="text-blue-500 hover:text-blue-600 font-medium transition-colors">Cron Generator</a>
            {' · '}
            <a href="/" className="text-blue-500 hover:text-blue-600 font-medium transition-colors">AI Token Cost Calculator</a>
            {' · '}
            <a href="/alternatives/" className="text-blue-500 hover:text-blue-600 font-medium transition-colors">Self-Hosted Alternatives</a>
          </p>
        </footer>
      </div>
    </div>
  )
}
