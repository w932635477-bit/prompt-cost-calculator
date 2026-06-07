import { useState, useMemo } from 'react'
import { COMPARE_PAGES, type ComparePage } from './seo/compare-data'
import { GlobalNav } from '../components/GlobalNav'
import { RelatedTools } from '../components/RelatedTools'

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

  return (
    <div className="min-h-screen bg-[#f5f5f7]">
      <GlobalNav current="/compare/" />

      <main className="max-w-[780px] mx-auto px-6 py-10">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-semibold text-[#1d1d1f] tracking-tight mb-3">
            Self-Hosted Tool vs Comparisons
          </h1>
          <p className="text-[#86868b] text-lg leading-relaxed mb-3">
            {COMPARE_PAGES.length} in-depth tool comparisons — Jellyfin vs Plex, Nextcloud vs ownCloud, Obsidian vs Notion, and more.
            Every comparison includes Docker quick-start commands, side-by-side feature tables, pros/cons, and a clear winner recommendation.
          </p>
          <p className="text-sm text-[#86868b]/70">
            Popular comparisons:{' '}
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

        {/* Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-10">
          {filtered.map(page => (
            <a
              key={page.slug}
              href={`/compare/${page.slug}/`}
              className="bg-white rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow group"
            >
              <div className="flex items-center gap-2 mb-3">
                <span className="text-2xl">{page.productA.logo}</span>
                <span className="text-[#86868b] text-sm font-medium">vs</span>
                <span className="text-2xl">{page.productB.logo}</span>
              </div>
              <h2 className="text-base font-semibold text-[#1d1d1f] group-hover:text-[#0071E3] transition-colors mb-1.5">
                {page.productA.name} vs {page.productB.name}
              </h2>
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
          ))}
        </div>

        {filtered.length === 0 && (
          <div className="text-center py-10 text-[#86868b]">
            No comparisons found for "{search}"
          </div>
        )}

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
