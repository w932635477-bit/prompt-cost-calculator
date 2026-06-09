import { useState, useMemo } from 'react'
import { COMPARE_PAGES, type ComparePage, type CompareCategory } from './seo/compare-data'
import { GlobalNav } from '../components/GlobalNav'
import { RelatedTools } from '../components/RelatedTools'

const CATEGORY_ORDER: CompareCategory[] = [
  'Notes & Knowledge', 'Communication', 'Media', 'Storage & Files',
  'Security & Privacy', 'DevOps & Infrastructure', 'Productivity', 'Smart Home',
]

const FAQ_DATA = [
  { q: 'How do I choose between self-hosted tools?', a: 'Consider three factors: (1) Your team size — single users need simpler tools than teams of 20. (2) Your server resources — some tools need 2GB+ RAM. (3) Your maintenance budget — self-hosted means you handle updates, backups, and security patches. Use our comparisons above to find the right fit for each category.' },
  { q: 'Are self-hosted tools really free?', a: 'The software is free, but running it costs money. A VPS for small tools runs $5-10/month. Factor in your time for setup (1-4 hours per tool) and ongoing maintenance (30 min/month). Most teams break even vs SaaS at 5-10 users.' },
  { q: 'What does each comparison include?', a: 'Every comparison has: feature-by-feature table, Docker quick-start commands, pros and cons for both tools, and a clear winner recommendation based on common use cases. No signup required.' },
]

function ComparisonCard({ page }: { page: ComparePage }) {
  return (
    <a
      href={`/compare/${page.slug}/`}
      className="bg-white rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow group"
    >
      <div className="flex items-center gap-2 mb-3">
        <span className="text-2xl">{page.productA.logo}</span>
        <span className="text-[#86868b] text-sm font-medium">vs</span>
        <span className="text-2xl">{page.productB.logo}</span>
      </div>
      <h3 className="text-base font-semibold text-[#1d1d1f] group-hover:text-[#0071E3] transition-colors mb-1.5">
        {page.productA.name} vs {page.productB.name}
      </h3>
      <p className="text-sm text-[#86868b] leading-relaxed line-clamp-2 mb-3">{page.summary}</p>
      <div className="flex flex-wrap gap-1.5">
        {page.productA.selfHosted && (
          <span className="text-xs bg-[#30d158]/10 text-[#30d158] px-2 py-0.5 rounded-full font-medium">{page.productA.name} is self-hosted</span>
        )}
        {page.productB.selfHosted && (
          <span className="text-xs bg-[#30d158]/10 text-[#30d158] px-2 py-0.5 rounded-full font-medium">{page.productB.name} is self-hosted</span>
        )}
        {page.productA.docker && (
          <span className="text-xs bg-[#f5f5f7] text-[#86868b] px-2 py-0.5 rounded-full">Docker</span>
        )}
      </div>
    </a>
  )
}

export default function CompareHub() {
  const [search, setSearch] = useState('')

  const POPULAR_SLUGS = ['jellyfin-vs-plex', 'nextcloud-vs-owncloud', 'vaultwarden-vs-bitwarden', 'obsidian-vs-notion', 'gitea-vs-github', 'docmost-vs-bookstack']

  const popularComparisons = useMemo(() =>
    POPULAR_SLUGS.map(s => COMPARE_PAGES.find(p => p.slug === s)).filter(Boolean) as ComparePage[]
  , [])

  const filtered = useMemo(() => {
    if (!search.trim()) return COMPARE_PAGES
    const q = search.toLowerCase()
    return COMPARE_PAGES.filter(p =>
      p.productA.name.toLowerCase().includes(q) ||
      p.productB.name.toLowerCase().includes(q) ||
      p.productA.tagline.toLowerCase().includes(q) ||
      p.productB.tagline.toLowerCase().includes(q)
    )
  }, [search])

  const grouped = useMemo(() => {
    const map = new Map<CompareCategory, ComparePage[]>()
    for (const cat of CATEGORY_ORDER) {
      const pages = filtered.filter(p => p.category === cat)
      if (pages.length > 0) map.set(cat, pages)
    }
    return map
  }, [filtered])

  return (
    <div className="min-h-screen bg-[#f5f5f7]">
      <GlobalNav current="/compare/" />

      <main className="max-w-[780px] mx-auto px-6 py-10">
        {/* Breadcrumb */}
        <nav className="text-[12px] text-[#86868b] mb-3" aria-label="Breadcrumb">
          <a href="/" className="hover:text-[#0071E3]">Home</a>
          <span className="mx-1.5">/</span>
          <span className="text-[#1d1d1f]">Compare</span>
        </nav>

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-semibold text-[#1d1d1f] tracking-tight mb-3">
            Self-Hosted Tool Comparisons (2026)
          </h1>
          <p className="text-[#86868b] text-lg leading-relaxed mb-3">
            {COMPARE_PAGES.length} in-depth tool comparisons — Jellyfin vs Plex, Nextcloud vs ownCloud, Obsidian vs Notion, and more.
            Every comparison includes Docker quick-start commands, side-by-side feature tables, pros/cons, and a clear winner recommendation.
          </p>
          <p className="text-sm text-[#86868b]/70">
            Popular:{' '}
            {popularComparisons.map((p, i) => (
              <span key={p.slug}>
                <a href={`/compare/${p.slug}/`} className="text-[#0071E3] hover:underline">{p.productA.name} vs {p.productB.name}</a>
                {i < popularComparisons.length - 1 && ' · '}
              </span>
            ))}
          </p>
        </div>

        {/* Search + Stats */}
        <div className="mb-6 flex flex-col sm:flex-row sm:items-center gap-3">
          <div className="flex-1 relative">
            <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#86868b]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search comparisons..."
              className="w-full pl-10 pr-4 py-2.5 bg-white rounded-xl text-sm text-[#1d1d1f] placeholder:text-[#86868b] outline-none focus:ring-2 focus:ring-[#0071E3]/30 shadow-sm transition-shadow"
            />
          </div>
          <span className="text-sm text-[#86868b] whitespace-nowrap">
            {filtered.length} comparison{filtered.length !== 1 ? 's' : ''}
          </span>
        </div>

        {/* Cards by Category */}
        {search.trim() ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-10">
            {filtered.map(page => <ComparisonCard key={page.slug} page={page} />)}
          </div>
        ) : (
          <div className="space-y-8 mb-10">
            {Array.from(grouped.entries()).map(([cat, pages]) => (
              <section key={cat}>
                <h2 className="text-lg font-semibold text-[#1d1d1f] mb-3">{cat}</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {pages.map(page => <ComparisonCard key={page.slug} page={page} />)}
                </div>
              </section>
            ))}
          </div>
        )}

        {filtered.length === 0 && (
          <div className="text-center py-10 text-[#86868b]">
            No comparisons found for &ldquo;{search}&rdquo;
          </div>
        )}

        {/* FAQ */}
        <section className="mb-10">
          <h2 className="text-lg font-semibold text-[#1d1d1f] mb-4">Frequently Asked Questions</h2>
          <div className="space-y-2.5">
            {FAQ_DATA.map((item, i) => (
              <details key={i} className="group bg-white border border-[#e8e8ed] rounded-xl overflow-hidden">
                <summary className="flex items-center justify-between px-5 py-4 cursor-pointer select-none hover:bg-gray-50/50">
                  <span className="text-sm font-medium text-[#1d1d1f]">{item.q}</span>
                  <svg className="w-4 h-4 text-[#86868b] group-open:rotate-180 transition-transform duration-200 shrink-0 ml-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </summary>
                <div className="px-5 pb-4 text-sm text-[#86868b] leading-relaxed">{item.a}</div>
              </details>
            ))}
          </div>
          <p className="text-xs text-[#86868b]/60 mt-3">Last updated: June 2026</p>
        </section>

        {/* Footer */}
        <footer className="border-t border-[#e8e8ed] pt-6 text-center text-sm text-[#86868b]">
          <p>Free tool comparisons. No login required.</p>
          <p className="mt-2">
            <a href="/" className="text-[#0071E3] hover:underline">AI Cost Calculator</a>
            <span className="mx-1.5">&middot;</span>
            <a href="/alternatives/" className="text-[#0071E3] hover:underline">Self-Hosted Alternatives</a>
            <span className="mx-1.5">&middot;</span>
            <a href="/cron-generator/" className="text-[#0071E3] hover:underline">Cron Generator</a>
          </p>
        </footer>
        <RelatedTools currentPath="/compare/" />
      </main>
    </div>
  )
}
