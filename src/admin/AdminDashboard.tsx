import { useState, useEffect, useMemo } from 'react'
import data from './dashboard-data.json'

const SESSION_KEY = 'admin_dash_session'

type GscMetricsData = {
  sourceFile: string
  rows: { [k: string]: string | number }[]
} | null

function PasswordGate({ children }: { children: React.ReactNode }) {
  const [authed, setAuthed] = useState(false)
  const [input, setInput] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    const stored = sessionStorage.getItem(SESSION_KEY)
    if (stored === 'ok') setAuthed(true)
  }, [])

  if (authed) return <>{children}</>

  const correctHash = '95ce824e48' // SHA-256 prefix of password "codehelper2026"

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    const enc = new TextEncoder().encode(input)
    const buf = await crypto.subtle.digest('SHA-256', enc)
    const hex = Array.from(new Uint8Array(buf))
      .slice(0, 5)
      .map(b => b.toString(16).padStart(2, '0'))
      .join('')
    if (hex === correctHash) {
      sessionStorage.setItem(SESSION_KEY, 'ok')
      setAuthed(true)
    } else {
      setError('Incorrect password')
      setInput('')
    }
  }

  return (
    <div className="min-h-screen bg-[#f5f5f7] flex items-center justify-center px-6">
      <form onSubmit={submit} className="bg-white rounded-2xl shadow-sm p-8 w-full max-w-sm">
        <h1 className="text-xl font-semibold text-[#1d1d1f] tracking-tight mb-2">Admin Dashboard</h1>
        <p className="text-sm text-[#86868b] mb-5">Enter password to continue.</p>
        <input
          type="password"
          value={input}
          onChange={e => { setInput(e.target.value); setError('') }}
          placeholder="Password"
          autoFocus
          className="w-full px-4 py-2.5 bg-[#f5f5f7] rounded-xl text-sm text-[#1d1d1f] outline-none focus:ring-2 focus:ring-[#0071E3]/30 mb-3"
        />
        {error && <p className="text-sm text-red-500 mb-3">{error}</p>}
        <button type="submit" className="w-full bg-[#0071E3] text-white py-2.5 rounded-full text-sm font-medium hover:bg-[#0077ED] transition-colors">
          Sign In
        </button>
        <p className="text-xs text-[#86868b] mt-4 text-center">aicalc.cloud · Private</p>
      </form>
    </div>
  )
}

function StatCard({ label, value, sub, accent }: { label: string; value: string; sub?: string; accent?: 'green' | 'amber' | 'red' | 'blue' }) {
  const accentColor = accent === 'green' ? '#30d158' : accent === 'amber' ? '#f59e0b' : accent === 'red' ? '#ef4444' : '#0071E3'
  return (
    <div className="bg-white rounded-2xl shadow-sm p-5">
      <div className="text-xs text-[#86868b] mb-1.5 uppercase tracking-wide">{label}</div>
      <div className="text-3xl font-semibold tracking-tight" style={{ color: accent ? accentColor : '#1d1d1f' }}>{value}</div>
      {sub && <div className="text-sm text-[#86868b] mt-1">{sub}</div>}
    </div>
  )
}

function ProgressBar({ value, max, color = '#0071E3' }: { value: number; max: number; color?: string }) {
  const pct = max ? Math.min(100, (value / max) * 100) : 0
  return (
    <div className="w-full bg-[#f5f5f7] rounded-full h-1.5 overflow-hidden">
      <div
        className="h-full rounded-full transition-all"
        style={{ width: `${pct}%`, backgroundColor: color }}
      />
    </div>
  )
}

function SectionsTable({ sections }: { sections: { name: string; total: number; submitted: number; remaining: number }[] }) {
  return (
    <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
      <div className="px-5 py-4 border-b border-[#e8e8ed] flex items-center justify-between">
        <h2 className="text-base font-semibold text-[#1d1d1f] tracking-tight">Indexing by Section</h2>
        <span className="text-xs text-[#86868b]">{sections.length} sections</span>
      </div>
      <div className="divide-y divide-[#e8e8ed]">
        {sections.map(s => (
          <div key={s.name} className="px-5 py-3.5 flex items-center gap-4">
            <div className="flex-1 min-w-0">
              <div className="font-medium text-sm text-[#1d1d1f]">{s.name}</div>
              <div className="text-xs text-[#86868b]">{s.submitted} of {s.total} submitted</div>
            </div>
            <div className="w-32">
              <ProgressBar value={s.submitted} max={s.total} color={s.submitted === s.total ? '#30d158' : '#0071E3'} />
            </div>
            <div className="text-sm font-medium text-[#1d1d1f] tabular-nums w-16 text-right">
              {s.total ? Math.round((s.submitted / s.total) * 100) : 0}%
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function DailyChart({ bars }: { bars: { day: string; count: number }[] }) {
  const max = Math.max(10, ...bars.map(b => b.count))
  const last30Days = useMemo(() => {
    const result = []
    for (let i = 29; i >= 0; i--) {
      const d = new Date(Date.now() - i * 86400 * 1000 + 8 * 3600 * 1000)
      const day = d.toISOString().slice(0, 10)
      const found = bars.find(b => b.day === day)
      result.push({ day, count: found?.count || 0 })
    }
    return result
  }, [bars])

  return (
    <div className="bg-white rounded-2xl shadow-sm p-5">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-base font-semibold text-[#1d1d1f] tracking-tight">Daily Submissions (30 days)</h2>
        <span className="text-xs text-[#86868b]">Quota: 10/day</span>
      </div>
      <div className="flex items-end gap-1 h-24">
        {last30Days.map(b => (
          <div
            key={b.day}
            className="flex-1 bg-[#0071E3]/15 hover:bg-[#0071E3]/30 rounded-t transition-colors relative group"
            style={{ height: b.count ? `${(b.count / max) * 100}%` : '2px' }}
          >
            {b.count > 0 && (
              <div className="absolute top-0 left-0 right-0 h-full bg-[#0071E3] rounded-t" />
            )}
            <div className="absolute -top-8 left-1/2 -translate-x-1/2 hidden group-hover:block bg-[#1d1d1f] text-white text-xs rounded px-2 py-1 whitespace-nowrap z-10">
              {b.day}: {b.count}
            </div>
          </div>
        ))}
      </div>
      <div className="flex justify-between text-xs text-[#86868b] mt-2">
        <span>{last30Days[0]?.day}</span>
        <span>Today</span>
      </div>
    </div>
  )
}

function SuggestedBatch({ batch }: { batch: string[] }) {
  const [copied, setCopied] = useState<number | null>(null)
  return (
    <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
      <div className="px-5 py-4 border-b border-[#e8e8ed]">
        <h2 className="text-base font-semibold text-[#1d1d1f] tracking-tight">Suggested Submissions</h2>
        <p className="text-xs text-[#86868b] mt-0.5">Top {batch.length} priority URLs to submit next</p>
      </div>
      <div className="divide-y divide-[#e8e8ed]">
        {batch.length === 0 ? (
          <div className="px-5 py-6 text-sm text-[#86868b] text-center">All eligible URLs submitted in last 30 days.</div>
        ) : (
          batch.map((url, i) => (
            <div key={url} className="px-5 py-3 flex items-center gap-3">
              <span className="text-xs text-[#86868b] tabular-nums w-6">{i + 1}.</span>
              <a href={url} target="_blank" rel="noopener noreferrer" className="flex-1 min-w-0 truncate text-sm text-[#0071E3] hover:underline">
                {url.replace(/^https?:\/\//, '')}
              </a>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(url)
                  setCopied(i)
                  setTimeout(() => setCopied(null), 1500)
                }}
                className="text-xs px-2.5 py-1 rounded-lg text-[#86868b] hover:text-[#1d1d1f] hover:bg-[#f5f5f7] transition-colors"
              >
                {copied === i ? 'Copied' : 'Copy'}
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  )
}

function RecentSubmissions({ recent }: { recent: { url: string; day: string; ts: string }[] }) {
  return (
    <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
      <div className="px-5 py-4 border-b border-[#e8e8ed]">
        <h2 className="text-base font-semibold text-[#1d1d1f] tracking-tight">Recent Submissions</h2>
        <p className="text-xs text-[#86868b] mt-0.5">Last {recent.length}</p>
      </div>
      <div className="divide-y divide-[#e8e8ed] max-h-80 overflow-y-auto">
        {recent.length === 0 ? (
          <div className="px-5 py-6 text-sm text-[#86868b] text-center">No submissions yet.</div>
        ) : (
          recent.map((s, i) => (
            <div key={i} className="px-5 py-2.5 flex items-center gap-3 text-sm">
              <span className="text-xs text-[#86868b] tabular-nums w-20">{s.day}</span>
              <span className="flex-1 min-w-0 truncate text-[#1d1d1f]">{s.url.replace(/^https?:\/\/codehelper\.xyz/, '')}</span>
            </div>
          ))
        )}
      </div>
    </div>
  )
}

function GscMetrics({ metrics }: { metrics: GscMetricsData }) {
  if (!metrics) {
    return (
      <div className="bg-white rounded-2xl shadow-sm p-5">
        <h2 className="text-base font-semibold text-[#1d1d1f] tracking-tight mb-2">GSC Metrics</h2>
        <p className="text-sm text-[#86868b] mb-3">No GSC data imported yet.</p>
        <ol className="text-xs text-[#86868b] space-y-1.5 leading-relaxed">
          <li>1. Open Google Search Console → Performance</li>
          <li>2. Click "Export" → CSV</li>
          <li>3. Drop the file into <code className="bg-[#f5f5f7] px-1.5 py-0.5 rounded text-[#1d1d1f]">data/gsc-export/</code></li>
          <li>4. Run <code className="bg-[#f5f5f7] px-1.5 py-0.5 rounded text-[#1d1d1f]">npm run dashboard</code></li>
        </ol>
      </div>
    )
  }

  const queryRows = (metrics.rows || []).filter((r: { [k: string]: unknown }) => r.query || r['top queries'])
  const topQueries = queryRows
    .sort((a: { [k: string]: unknown }, b: { [k: string]: unknown }) => Number(b.clicks || 0) - Number(a.clicks || 0))
    .slice(0, 10)

  return (
    <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
      <div className="px-5 py-4 border-b border-[#e8e8ed]">
        <h2 className="text-base font-semibold text-[#1d1d1f] tracking-tight">GSC Top Queries</h2>
        <p className="text-xs text-[#86868b] mt-0.5">From {metrics.sourceFile}</p>
      </div>
      <div className="divide-y divide-[#e8e8ed]">
        {topQueries.length === 0 ? (
          <div className="px-5 py-6 text-sm text-[#86868b] text-center">No query rows in this CSV.</div>
        ) : (
          topQueries.map((r: { [k: string]: unknown }, i: number) => {
            const q = String(r.query || r['top queries'] || '')
            const clicks = Number(r.clicks || 0)
            const impressions = Number(r.impressions || 0)
            return (
              <div key={i} className="px-5 py-2.5 flex items-center gap-3 text-sm">
                <span className="text-xs text-[#86868b] tabular-nums w-6">{i + 1}.</span>
                <span className="flex-1 min-w-0 truncate text-[#1d1d1f]">{q}</span>
                <span className="text-xs text-[#86868b] tabular-nums w-20 text-right">{clicks} / {impressions}</span>
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}

export default function AdminDashboard() {
  const summary = data.summary
  const generated = new Date(data.generatedAt)
  const fmtAge = () => {
    const mins = Math.floor((Date.now() - generated.getTime()) / 60000)
    if (mins < 1) return 'just now'
    if (mins < 60) return `${mins} min ago`
    const hours = Math.floor(mins / 60)
    if (hours < 24) return `${hours} hr ago`
    return `${Math.floor(hours / 24)} d ago`
  }

  return (
    <PasswordGate>
      <div className="min-h-screen bg-[#f5f5f7]">
        <header className="bg-white border-b border-[#e8e8ed]">
          <div className="max-w-[1200px] mx-auto px-6 py-5 flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-semibold text-[#1d1d1f] tracking-tight">Admin Dashboard</h1>
              <p className="text-sm text-[#86868b] mt-0.5">aicalc.cloud · SEO & Indexing</p>
            </div>
            <div className="text-xs text-[#86868b]">
              Generated {fmtAge()}
              <div className="text-[10px]">{generated.toLocaleString()}</div>
            </div>
          </div>
        </header>

        <main className="max-w-[1200px] mx-auto px-6 py-8 space-y-6">
          {/* Summary cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <StatCard
              label="Sitemap URLs"
              value={summary.totalIndexable.toString()}
              sub="Total indexable pages"
            />
            <StatCard
              label="Submitted"
              value={summary.totalSubmitted.toString()}
              sub={`Coverage ${summary.coverage}%`}
              accent={summary.coverage > 50 ? 'green' : summary.coverage > 20 ? 'blue' : 'amber'}
            />
            <StatCard
              label="Today"
              value={`${summary.todaysSubmissions}/${summary.dailyQuota}`}
              sub="GSC daily quota"
              accent={summary.todaysSubmissions >= summary.dailyQuota ? 'green' : 'blue'}
            />
            <StatCard
              label="Remaining"
              value={summary.remainingToday.toString()}
              sub="Slots open today"
              accent={summary.remainingToday === 0 ? 'amber' : 'green'}
            />
          </div>

          {/* Daily chart full width */}
          <DailyChart bars={data.dailyBars} />

          {/* Two-column row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <SectionsTable sections={data.sections} />
            <SuggestedBatch batch={data.suggestedBatch} />
          </div>

          {/* Two-column row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <RecentSubmissions recent={data.recentSubmissions} />
            <GscMetrics metrics={data.gscMetrics as GscMetricsData} />
          </div>

          {/* Footer / How to */}
          <div className="bg-white rounded-2xl shadow-sm p-5">
            <h2 className="text-base font-semibold text-[#1d1d1f] tracking-tight mb-3">Quick Commands</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
              <div>
                <div className="font-medium text-[#1d1d1f] mb-1">Mark URL submitted</div>
                <code className="block bg-[#f5f5f7] rounded px-2.5 py-1.5 text-[#1d1d1f]">node scripts/gsc-quota-tracker.cjs --add {'<url>'}</code>
              </div>
              <div>
                <div className="font-medium text-[#1d1d1f] mb-1">Refresh dashboard</div>
                <code className="block bg-[#f5f5f7] rounded px-2.5 py-1.5 text-[#1d1d1f]">node scripts/build-dashboard-data.cjs</code>
              </div>
              <div>
                <div className="font-medium text-[#1d1d1f] mb-1">Daily status</div>
                <code className="block bg-[#f5f5f7] rounded px-2.5 py-1.5 text-[#1d1d1f]">node scripts/gsc-quota-tracker.cjs --status</code>
              </div>
              <div>
                <div className="font-medium text-[#1d1d1f] mb-1">Auto-suggest batch</div>
                <code className="block bg-[#f5f5f7] rounded px-2.5 py-1.5 text-[#1d1d1f]">node scripts/gsc-quota-tracker.cjs --batch</code>
              </div>
            </div>
          </div>

          <footer className="text-center text-xs text-[#86868b] py-6">
            Private dashboard · noindex · session expires on browser close
          </footer>
        </main>
      </div>
    </PasswordGate>
  )
}
