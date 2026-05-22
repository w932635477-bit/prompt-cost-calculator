import { useState, useMemo } from 'react'
import type { LongTailPage as LongTailPageData } from './seo/long-tail-data'
import '../index.css'

const CATEGORIES: Record<string, { label: string; prefix?: string }> = {
  minutes: { label: 'Every N Minutes' },
  hours: { label: 'Every N Hours' },
  daily: { label: 'Daily Schedules' },
  weekdays: { label: 'Weekday Schedules' },
  weekly: { label: 'Specific Days' },
  monthly: { label: 'Monthly & Yearly' },
  offset: { label: 'Minute Offsets' },
  multiple: { label: 'Multiple Times Daily' },
  syntax: { label: 'Cron Syntax Guides' },
  usecase: { label: 'Use Case Pages' },
  platform: { label: 'Platform-Specific' },
  business: { label: 'Business Patterns' },
  howto: { label: 'How-To Guides' },
}

function categorize(pages: LongTailPageData[]): Map<string, LongTailPageData[]> {
  const map = new Map<string, LongTailPageData[]>()
  for (const page of pages) {
    const cat = inferCategory(page)
    if (!map.has(cat)) map.set(cat, [])
    map.get(cat)!.push(page)
  }
  return map
}

function inferCategory(page: LongTailPageData): string {
  const s = page.slug
  if (s.startsWith('every-') && s.includes('minute')) return 'minutes'
  if (s.startsWith('every-') && s.includes('hour') && !s.includes('business')) return 'hours'
  if (s.startsWith('every-day')) return 'daily'
  if (s.startsWith('weekday')) return 'weekdays'
  if (s.includes('sunday') || s.includes('monday') || s.includes('tuesday') || s.includes('wednesday') || s.includes('thursday') || s.includes('friday') || s.includes('saturday')) return 'weekly'
  if (s.includes('month') || s.includes('year') || s.includes('quarter') || s.startsWith('15th') || s.startsWith('first-') || s.startsWith('last-')) return 'monthly'
  if (s.includes('at-') && (s.includes('minutes') || s.includes('-past'))) return 'offset'
  if (s.includes('multiple') || s.includes('twice')) return 'multiple'
  if (s.startsWith('cron-') && (s.includes('operator') || s.includes('asterisk') || s.includes('field') || s.includes('range') || s.includes('list') || s.includes('step') || s.includes('min-max') || s.includes('environment') || s.includes('troubleshoot'))) return 'syntax'
  if (s.startsWith('cron-') && (s.includes('backup') || s.includes('health') || s.includes('log') || s.includes('email') || s.includes('cache') || s.includes('data-sync') || s.includes('report'))) return 'usecase'
  if (s.includes('aws') || s.includes('eventbridge') || s.includes('quartz') || s.includes('kubernetes') || s.includes('github')) return 'platform'
  if (s.includes('business') || s.includes('off-peak') || s.includes('lunch') || s.includes('midnight-weekdays') || s.includes('every-5-minutes-weekdays') || s.includes('every-30-minutes') || s.includes('every-15-minutes-business') || s.includes('every-30-minutes-8am')) return 'business'
  return 'howto'
}

export function CommonPatternsPage({ pages }: { pages: LongTailPageData[] }) {
  const [search, setSearch] = useState('')
  const grouped = useMemo(() => categorize(pages), [pages])

  const filtered = useMemo(() => {
    if (!search.trim()) return grouped
    const q = search.toLowerCase()
    const result = new Map<string, LongTailPageData[]>()
    for (const [cat, items] of grouped) {
      const matched = items.filter(p =>
        p.h1.toLowerCase().includes(q) ||
        p.cron.includes(q) ||
        p.description.toLowerCase().includes(q) ||
        p.keywords.some(k => k.toLowerCase().includes(q))
      )
      if (matched.length > 0) result.set(cat, matched)
    }
    return result
  }, [grouped, search])

  return (
    <div className="min-h-screen bg-[#fbfbfd]">
      <div className="max-w-4xl mx-auto px-4 py-8 sm:py-12">
        <nav className="text-sm text-gray-500 mb-6">
          <a href="/cron-generator/" className="hover:text-blue-600">Cron Generator</a>
          <span className="mx-2">/</span>
          <span className="text-gray-900">Common Patterns</span>
        </nav>

        <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">Common Cron Patterns</h1>
        <p className="text-gray-600 mb-8 max-w-2xl">
          Browse {pages.length} ready-to-use cron expressions. Click any pattern to see detailed explanations,
          platform-specific examples, and next run times.
        </p>

        <div className="mb-8">
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search patterns (e.g. 'every 5 minutes', '0 9', 'backup')..."
            className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        <div className="space-y-10">
          {Array.from(filtered.entries()).map(([cat, items]) => (
            <section key={cat}>
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                {CATEGORIES[cat]?.label || cat}
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {items.map(page => (
                  <a
                    key={page.slug}
                    href={`/cron-generator/${page.slug}/`}
                    className="block p-4 rounded-xl bg-white border border-gray-100 hover:border-blue-200 hover:shadow-sm transition-all group"
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium text-gray-900 group-hover:text-blue-600">
                        {page.h1}
                      </span>
                    </div>
                    <code className="text-xs font-mono text-blue-600 bg-blue-50 px-2 py-0.5 rounded">
                      {page.cron}
                    </code>
                  </a>
                ))}
              </div>
            </section>
          ))}
        </div>

        {filtered.size === 0 && (
          <p className="text-center text-gray-500 py-12">No patterns match "{search}"</p>
        )}

        <div className="mt-12 pt-8 border-t border-gray-200 text-center">
          <a href="/cron-generator/" className="text-blue-600 hover:underline">
            &larr; Back to Cron Generator
          </a>
        </div>
      </div>
    </div>
  )
}
