import { useState, useMemo } from 'react'
import { DEPLOY_PAGES } from './seo/deploy-data'
import { GlobalNav } from '../components/GlobalNav'
import { RelatedTools } from '../components/RelatedTools'

const SERVICE_ICONS: Record<string, string> = {
  slack: '💬', notion: '📝', 'google-drive': '📁', github: '🐙', spotify: '🎵',
  netflix: '🎬', lastpass: '🔑', '1password': '🔐', jira: '📋', 'google-analytics': '📊',
  zoom: '📹', zapier: '⚡', trello: '📌', discord: '🎮', dropbox: '📦',
  evernote: '🐘', 'wordpress.com': '🌐', figma: '🎨', salesforce: '💼', zendesk: '🎧',
  gmail: '📧', airtable: '🗃️', datadog: '📈', todoist: '✅', confluence: '📚',
  'google-photos': '📷', circleci: '🔄', mailchimp: '✉️', asana: '📋',
  onedrive: '☁️', navidrome: '🎶', syncthing: '🔄', vaultwarden: '🛡️',
  docmost: '📄', obsidian: '🔮',
}

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

  const totalConfigs = DEPLOY_PAGES.reduce((s, p) => s + p.deploys.length, 0)

  return (
    <div className="min-h-screen bg-[#f5f5f7]">
      <GlobalNav current="/deploy/" />
      <header className="bg-white/80 backdrop-blur-sm border-b border-[#e8e8ed]">
        <div className="max-w-[980px] mx-auto px-6 py-8">
          <a href="/" className="text-sm text-[#86868b] hover:text-[#1d1d1f] transition-colors">&larr; AI Cost Calculator</a>
          <h1 className="text-3xl sm:text-4xl font-semibold text-[#1d1d1f] tracking-tight mt-3">Docker Deploy Guides</h1>
          <p className="text-[#86868b] mt-2 text-lg leading-relaxed">One-command Docker Compose deployments for {DEPLOY_PAGES.length} popular self-hosted tools</p>
          <div className="relative mt-6">
            <input
              type="text"
              placeholder="Search deploy guides..."
              aria-label="Search deploy guides"
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full px-5 py-3.5 pl-12 pr-12 bg-[#f5f5f7] rounded-xl text-base text-[#1d1d1f] placeholder-[#86868b] outline-none focus:ring-2 focus:ring-[#0071E3]/30 transition-shadow"
            />
            <svg className="absolute left-4 top-4 w-5 h-5 text-[#86868b]" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            {search && (
              <button
                onClick={() => setSearch('')}
                aria-label="Clear search"
                className="absolute right-4 top-3.5 w-6 h-6 flex items-center justify-center text-[#86868b] hover:text-[#1d1d1f] rounded-full hover:bg-[#e8e8ed] transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-[980px] mx-auto px-6 py-8">
        <div className="grid gap-4 md:grid-cols-2">
          {filtered.map(page => {
            const primary = page.deploys[0]
            const icon = SERVICE_ICONS[page.slug] || '🐳'
            return (
              <a
                key={page.slug}
                href={`/deploy/${page.slug}/`}
                className="flex items-start gap-4 bg-white rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow group focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0071E3] focus-visible:ring-offset-2"
              >
                <span className="text-2xl shrink-0 mt-0.5" aria-hidden="true">{icon}</span>
                <div className="min-w-0 flex-1">
                  <h2 className="text-base font-semibold text-[#1d1d1f] group-hover:text-[#0071E3] transition-colors">{page.saasName}</h2>
                  <div className="flex flex-wrap gap-1.5 mt-2.5">
                    {page.deploys.slice(0, 3).map(d => (
                      <span key={d.name} className="text-xs bg-[#0071E3]/8 text-[#0071E3] px-2.5 py-0.5 rounded-full font-medium">{d.name}</span>
                    ))}
                    {page.deploys.length > 3 && (
                      <span className="text-xs bg-[#f5f5f7] text-[#86868b] px-2.5 py-0.5 rounded-full">+{page.deploys.length - 3} more</span>
                    )}
                  </div>
                  {primary && (
                    <div className="mt-2.5 flex items-center gap-2 text-sm text-[#86868b]">
                      <span className="text-[#0071E3] font-medium">Docker ready</span>
                      <span aria-hidden="true">&middot;</span>
                      <span>{primary.minRam} RAM</span>
                      <span className="ml-auto text-[#86868b] group-hover:text-[#0071E3] transition-colors" aria-hidden="true">&rarr;</span>
                    </div>
                  )}
                </div>
              </a>
            )
          })}
        </div>

        {filtered.length === 0 && (
          <div className="text-center py-20 text-[#86868b]">
            <p className="text-lg">No deploy guides found matching "{search}"</p>
            <p className="mt-2">Try a different search term</p>
          </div>
        )}

        <div className="mt-12 grid grid-cols-1 sm:grid-cols-3 gap-5 text-center">
          <div className="bg-white rounded-2xl p-6 shadow-sm">
            <div className="text-2xl font-semibold text-[#1d1d1f]">{DEPLOY_PAGES.length}</div>
            <div className="text-sm text-[#86868b] mt-1">Services</div>
          </div>
          <div className="bg-white rounded-2xl p-6 shadow-sm">
            <div className="text-2xl font-semibold text-[#1d1d1f]">{totalConfigs}</div>
            <div className="text-sm text-[#86868b] mt-1">Docker Configs</div>
          </div>
          <div className="bg-white rounded-2xl p-6 shadow-sm">
            <div className="text-2xl font-semibold text-[#1d1d1f]">100%</div>
            <div className="text-sm text-[#86868b] mt-1">Free & Open Source</div>
          </div>
        </div>
      </main>

      <footer className="border-t border-[#e8e8ed] bg-white/80 backdrop-blur-sm">
        <div className="max-w-[980px] mx-auto px-6 py-6 text-center text-sm text-[#86868b]">
          <p>One-command Docker deployments for self-hosted tools.</p>
        </div>
      </footer>
      <RelatedTools currentPath="/deploy/" />
    </div>
  )
}
