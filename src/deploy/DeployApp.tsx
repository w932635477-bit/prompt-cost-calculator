import { useState, useMemo } from 'react'
import { DEPLOY_PAGES } from './seo/deploy-data'
import { GlobalNav } from '../components/GlobalNav'

export default function DeployApp() {
  const [search, setSearch] = useState('')

  const filtered = useMemo(() => {
    if (!search.trim()) return DEPLOY_PAGES
    const q = search.toLowerCase()
    return DEPLOY_PAGES.filter(p =>
      p.saasName.toLowerCase().includes(q) ||
      p.deploys.some(d => d.name.toLowerCase().includes(q) || d.image.toLowerCase().includes(q))
    )
  }, [search])

  return (
    <div className="min-h-screen bg-gray-50">
      <GlobalNav current="/deploy/" />
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-4 py-6 sm:py-8">
          <a href="/" className="text-sm text-gray-500 hover:text-gray-700">&larr; AI Cost Calculator</a>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mt-2">Docker Deploy Guides</h1>
          <p className="text-gray-600 mt-1 leading-relaxed">One-command Docker Compose deployments for {DEPLOY_PAGES.length} popular self-hosted tools</p>
          <div className="relative mt-4">
            <input
              type="text"
              placeholder="Search deploy guides..."
              aria-label="Search deploy guides"
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
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filtered.map(page => {
            const primary = page.deploys[0]
            return (
              <a
                key={page.slug}
                href={`/deploy/${page.slug}/`}
                className="flex flex-col bg-white rounded-xl border border-gray-200 p-5 hover:border-blue-400 hover:shadow-lg transition-[border-color,box-shadow] group focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
              >
                <h2 className="text-lg font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">{page.saasName}</h2>
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {page.deploys.slice(0, 2).map(d => (
                    <span key={d.name} className="text-xs bg-blue-50 text-blue-700 border border-blue-200 px-2 py-0.5 rounded-full">{d.name}</span>
                  ))}
                  {page.deploys.length > 2 && (
                    <span className="text-xs bg-gray-50 text-gray-500 border border-gray-200 px-2 py-0.5 rounded-full">+{page.deploys.length - 2}</span>
                  )}
                </div>
                {primary && (
                  <div className="mt-3 text-sm text-gray-500 space-y-1 flex-1">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Image</span>
                      <code className="text-xs text-gray-700 font-mono truncate ml-2 max-w-[180px]">{primary.image.split(':')[0].split('/').pop()}</code>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">RAM</span>
                      <span className="text-gray-700">{primary.minRam}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Port</span>
                      <code className="text-gray-700 font-mono">{primary.port}</code>
                    </div>
                  </div>
                )}
                <div className="mt-3 flex items-center text-sm text-gray-400 group-hover:text-blue-500 transition-colors">
                  <span>View deploy guide</span>
                  <span className="ml-auto" aria-hidden="true">&rarr;</span>
                </div>
              </a>
            )
          })}
        </div>

        {filtered.length === 0 && (
          <div className="text-center py-16 text-gray-500">
            <p className="text-lg">No deploy guides found matching "{search}"</p>
            <p className="mt-2">Try a different search term</p>
          </div>
        )}

        <div className="mt-12 grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="text-2xl font-semibold text-gray-700">{DEPLOY_PAGES.length}</div>
            <div className="text-sm text-gray-500 mt-1">Services</div>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="text-2xl font-semibold text-gray-700">{DEPLOY_PAGES.reduce((s, p) => s + p.deploys.length, 0)}</div>
            <div className="text-sm text-gray-500 mt-1">Docker Configs</div>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="text-2xl font-semibold text-gray-700">Free</div>
            <div className="text-sm text-gray-500 mt-1">Cost</div>
          </div>
        </div>
      </main>

      <footer className="border-t border-gray-200 bg-white">
        <div className="max-w-6xl mx-auto px-4 py-6 text-center text-sm text-gray-500">
          <p>One-command Docker deployments for self-hosted tools.</p>
        </div>
      </footer>
    </div>
  )
}
