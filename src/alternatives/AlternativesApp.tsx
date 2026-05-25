import { useState, useMemo } from 'react'
import { ALTERNATIVE_PAGES, CATEGORIES } from './seo/alternatives-data'
import { GlobalNav } from '../components/GlobalNav'
import ToolFinderCard from './finder/ToolFinderCard'

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

  const totalAlternatives = ALTERNATIVE_PAGES.reduce((s, p) => s + p.alternatives.length, 0)
  const dockerReady = ALTERNATIVE_PAGES.reduce((s, p) => s + p.alternatives.filter(a => a.docker).length, 0)

  return (
    <div className="min-h-screen bg-gray-50">
      <GlobalNav current="/alternatives/" />
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-4 py-6 sm:py-8">
          <a href="/" className="text-sm text-gray-500 hover:text-gray-700">&larr; AI Cost Calculator</a>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mt-2">Self-Hosted Alternatives</h1>
          <p className="text-gray-600 mt-1 leading-relaxed">Find open source replacements for {ALTERNATIVE_PAGES.length} popular SaaS tools</p>
          <div className="relative mt-4">
            <input
              type="text"
              placeholder="Search tools..."
              aria-label="Search SaaS tools"
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full px-4 py-3 pl-10 pr-10 border border-gray-300 rounded-xl text-base focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
            />
            <svg className="absolute left-3 top-3.5 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            {search && (
              <button
                onClick={() => setSearch('')}
                aria-label="Clear search"
                className="absolute right-3 top-3 w-6 h-6 flex items-center justify-center text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8">
        <div className="max-w-xl mx-auto mb-8">
          <ToolFinderCard />
        </div>

        <div className="flex flex-wrap gap-2 mb-6">
          <button
            onClick={() => setActiveCategory(null)}
            className={`px-3 py-1.5 rounded-full text-sm font-medium transition-[background-color,color] focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 active:scale-[0.97] ${
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
                className={`px-3 py-1.5 rounded-full text-sm font-medium transition-[background-color,color] focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 active:scale-[0.97] ${
                  activeCategory === cat.name ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                }`}
              >
                <span aria-hidden="true">{cat.icon}</span> {cat.name} ({count})
              </button>
            )
          })}
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          {filtered.map(page => (
            <a
              key={page.slug}
              href={`/alternatives/${page.slug}/`}
              className="flex items-start gap-4 bg-white rounded-xl border border-gray-200 p-5 hover:border-blue-400 hover:shadow-lg transition-[border-color,box-shadow] group focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
            >
              <span className="text-2xl shrink-0 mt-0.5" aria-hidden="true">{page.icon}</span>
              <div className="min-w-0 flex-1">
                <h2 className="text-lg font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">{page.saasName}</h2>
                <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">{page.category}</span>
                <div className="flex flex-wrap gap-1.5 mt-2.5">
                  {page.alternatives.slice(0, 3).map(alt => (
                    <span key={alt.name} className="text-xs bg-green-50 text-green-700 border border-green-200 px-2 py-0.5 rounded-full">{alt.name}</span>
                  ))}
                  {page.alternatives.length > 3 && (
                    <span className="text-xs bg-gray-50 text-gray-500 border border-gray-200 px-2 py-0.5 rounded-full">+{page.alternatives.length - 3} more</span>
                  )}
                </div>
                <div className="mt-2 flex items-center gap-2 text-sm text-gray-500">
                  <span>{page.alternatives.length} alternative{page.alternatives.length > 1 ? 's' : ''}</span>
                  {page.alternatives.some(a => a.docker) && (
                    <>
                      <span className="text-gray-300" aria-hidden="true">&middot;</span>
                      <span className="text-blue-600">Docker ready</span>
                    </>
                  )}
                  <span className="ml-auto text-gray-400 group-hover:text-blue-500 transition-colors" aria-hidden="true">&rarr;</span>
                </div>
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

        <div className="mt-12 grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="text-2xl font-semibold text-gray-700">{ALTERNATIVE_PAGES.length}</div>
            <div className="text-sm text-gray-500 mt-1">SaaS Tools</div>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="text-2xl font-semibold text-gray-700">{totalAlternatives}</div>
            <div className="text-sm text-gray-500 mt-1">Alternatives</div>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="text-2xl font-semibold text-gray-700">{dockerReady}</div>
            <div className="text-sm text-gray-500 mt-1">Docker-Ready</div>
          </div>
        </div>
      </main>

      <footer className="border-t border-gray-200 bg-white">
        <div className="max-w-6xl mx-auto px-4 py-6 text-center text-sm text-gray-500">
          <p>Open source self-hosted alternatives for popular SaaS tools.</p>
        </div>
      </footer>
    </div>
  )
}
