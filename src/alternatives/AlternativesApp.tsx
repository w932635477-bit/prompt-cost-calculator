import { useState, useMemo } from 'react'
import { ALTERNATIVE_PAGES, CATEGORIES } from './seo/alternatives-data'

export default function AlternativesApp() {
  const [search, setSearch] = useState('')
  const [activeCategory, setActiveCategory] = useState<string | null>(null)

  const filtered = useMemo(() => {
    let pages = ALTERNATIVE_PAGES
    if (activeCategory) {
      pages = pages.filter(p => p.category === activeCategory)
    }
    if (search.trim()) {
      const q = search.toLowerCase()
      pages = pages.filter(p =>
        p.saasName.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q) ||
        p.alternatives.some(a => a.name.toLowerCase().includes(q))
      )
    }
    return pages
  }, [search, activeCategory])

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <a href="/" className="text-sm text-gray-500 hover:text-gray-700">&larr; AI Cost Calculator</a>
              <h1 className="text-3xl font-bold text-gray-900 mt-1">Self-Hosted Alternatives</h1>
              <p className="text-gray-600 mt-1">Find open source replacements for {ALTERNATIVE_PAGES.length} popular SaaS tools</p>
            </div>
          </div>
          <div className="relative">
            <input
              type="text"
              placeholder="Search SaaS tools... (e.g., Slack, Notion, Google Drive)"
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full px-4 py-3 pl-10 border border-gray-300 rounded-lg text-base focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
            />
            <svg className="absolute left-3 top-3.5 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8">
        {/* Category filter */}
        <div className="flex flex-wrap gap-2 mb-6">
          <button
            onClick={() => setActiveCategory(null)}
            className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
              activeCategory === null ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
            }`}
          >
            All ({ALTERNATIVE_PAGES.length})
          </button>
          {CATEGORIES.map(cat => {
            const count = ALTERNATIVE_PAGES.filter(p => p.category === cat.name).length
            return (
              <button
                key={cat.name}
                onClick={() => setActiveCategory(activeCategory === cat.name ? null : cat.name)}
                className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                  activeCategory === cat.name ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                }`}
              >
                {cat.icon} {cat.name} ({count})
              </button>
            )
          })}
        </div>

        {/* Results */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filtered.map(page => (
            <a
              key={page.slug}
              href={`/alternatives/${page.slug}/`}
              className="block bg-white rounded-xl border border-gray-200 p-5 hover:border-blue-400 hover:shadow-md transition-all group"
            >
              <div className="flex items-center gap-3 mb-2">
                <span className="text-2xl">{page.icon}</span>
                <div>
                  <h2 className="text-lg font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">{page.saasName}</h2>
                  <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">{page.category}</span>
                </div>
              </div>
              <div className="flex flex-wrap gap-1.5 mt-3">
                {page.alternatives.map(alt => (
                  <span key={alt.name} className="text-xs bg-green-50 text-green-700 border border-green-200 px-2 py-0.5 rounded-full">
                    {alt.name}
                  </span>
                ))}
              </div>
              <div className="mt-3 flex items-center gap-2 text-sm text-gray-500">
                <span>{page.alternatives.length} alternative{page.alternatives.length > 1 ? 's' : ''}</span>
                <span>&middot;</span>
                <span className="flex items-center gap-1">
                  {page.alternatives.filter(a => a.docker).length > 0 && (
                    <span className="text-blue-600">🐳 Docker</span>
                  )}
                </span>
              </div>
            </a>
          ))}
        </div>

        {filtered.length === 0 && (
          <div className="text-center py-16 text-gray-500">
            <p className="text-lg">No tools found matching "{search}"</p>
            <p className="mt-2">Try a different search term or browse by category</p>
          </div>
        )}

        {/* Stats */}
        <div className="mt-12 grid grid-cols-3 gap-4 text-center">
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="text-3xl font-bold text-blue-600">{ALTERNATIVE_PAGES.length}</div>
            <div className="text-sm text-gray-600 mt-1">SaaS Tools Covered</div>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="text-3xl font-bold text-green-600">
              {ALTERNATIVE_PAGES.reduce((sum, p) => sum + p.alternatives.length, 0)}
            </div>
            <div className="text-sm text-gray-600 mt-1">Self-Hosted Alternatives</div>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="text-3xl font-bold text-purple-600">
              {ALTERNATIVE_PAGES.reduce((sum, p) => sum + p.alternatives.filter(a => a.docker).length, 0)}
            </div>
            <div className="text-sm text-gray-600 mt-1">Docker-Ready</div>
          </div>
        </div>
      </main>

      <footer className="border-t border-gray-200 bg-white mt-12">
        <div className="max-w-6xl mx-auto px-4 py-6 text-center text-sm text-gray-500">
          <p>Open source self-hosted alternatives for popular SaaS tools. All data is community-maintained.</p>
        </div>
      </footer>
    </div>
  )
}
