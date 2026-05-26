// src/mcp/MCPHubApp.tsx — main directory page

import { useState, useMemo } from 'react'
import { GlobalNav } from '../components/GlobalNav'
import { MCP_SERVERS, CATEGORY_LABELS, CATEGORY_DESCRIPTIONS, LAST_UPDATED } from './seo/mcp-data'
import type { MCPCategory } from './seo/mcp-data'

const CATEGORY_ORDER: MCPCategory[] = [
  'browser',
  'code',
  'data',
  'search',
  'files',
  'devops',
  'api',
  'productivity',
  'other',
]

export default function MCPHubApp() {
  const [search, setSearch] = useState('')
  const [activeCat, setActiveCat] = useState<MCPCategory | 'all'>('all')

  const filtered = useMemo(() => {
    let list = MCP_SERVERS
    if (activeCat !== 'all') list = list.filter(s => s.category === activeCat)
    if (search.trim()) {
      const q = search.toLowerCase()
      list = list.filter(
        s =>
          s.name.toLowerCase().includes(q) ||
          s.oneLiner.toLowerCase().includes(q) ||
          s.useCase.some(u => u.toLowerCase().includes(q))
      )
    }
    return list
  }, [search, activeCat])

  const countByCat = useMemo(() => {
    const counts: Record<string, number> = { all: MCP_SERVERS.length }
    for (const cat of CATEGORY_ORDER) {
      counts[cat] = MCP_SERVERS.filter(s => s.category === cat).length
    }
    return counts
  }, [])

  return (
    <div className="min-h-screen bg-[#f5f5f7] text-[#1d1d1f]">
      <GlobalNav current="/mcp-servers/" />

      {/* Hero */}
      <header className="max-w-[1080px] mx-auto px-4 pt-12 pb-6 text-center">
        <h1 className="text-4xl sm:text-5xl font-semibold tracking-tight mb-3">
          MCP Server Directory
        </h1>
        <p className="text-lg text-[#86868b] max-w-2xl mx-auto">
          Curated Model Context Protocol servers for Claude Desktop and Cursor. Each entry includes
          install commands, config JSON, use cases, and common pitfalls.
        </p>
        <p className="text-sm text-[#86868b] mt-2">
          {MCP_SERVERS.length} servers · last reviewed {LAST_UPDATED}
        </p>
      </header>

      {/* Search */}
      <div className="max-w-[1080px] mx-auto px-4 mb-4">
        <input
          type="search"
          placeholder="Search MCP servers (e.g. database, browser, github...)"
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full px-4 py-3 rounded-2xl border border-[#d2d2d7] bg-white text-[#1d1d1f] focus:border-[#0071E3] focus:outline-none focus:ring-2 focus:ring-[#0071E3]/20 transition-colors"
          data-testid="search-input"
        />
      </div>

      {/* Category pills */}
      <div className="max-w-[1080px] mx-auto px-4 mb-6 overflow-x-auto">
        <div className="flex gap-2 whitespace-nowrap" data-testid="category-pills">
          <CatPill
            active={activeCat === 'all'}
            label="All"
            count={countByCat.all}
            onClick={() => setActiveCat('all')}
          />
          {CATEGORY_ORDER.map(cat => (
            <CatPill
              key={cat}
              active={activeCat === cat}
              label={CATEGORY_LABELS[cat]}
              count={countByCat[cat]}
              onClick={() => setActiveCat(cat)}
            />
          ))}
        </div>
      </div>

      {/* Results grid */}
      <main className="max-w-[1080px] mx-auto px-4 pb-16">
        {filtered.length === 0 ? (
          <div className="bg-white rounded-2xl p-8 text-center text-[#86868b]" data-testid="empty-state">
            No servers match. Try a broader query.
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4" data-testid="server-grid">
            {filtered.map(s => (
              <a
                key={s.slug}
                href={`/mcp-servers/${s.slug}/`}
                className="bg-white rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow group"
                data-testid={`server-card-${s.slug}`}
              >
                <div className="flex items-baseline justify-between mb-2">
                  <h3 className="text-lg font-semibold group-hover:text-[#0071E3] transition-colors">
                    {s.name}
                  </h3>
                  <span className="text-xs text-[#86868b] uppercase tracking-wide">
                    {CATEGORY_LABELS[s.category]}
                  </span>
                </div>
                <p className="text-sm text-[#424245] mb-3 leading-relaxed">{s.oneLiner}</p>
                <div className="flex items-center gap-2 text-xs">
                  <span
                    className={`px-2 py-0.5 rounded-full font-medium ${
                      s.officialBy === 'anthropic'
                        ? 'bg-[#1d1d1f] text-white'
                        : 'bg-[#f5f5f7] text-[#86868b]'
                    }`}
                  >
                    {s.officialBy === 'anthropic' ? '✓ Official' : 'Community'}
                  </span>
                  {s.popularity === 'high' && (
                    <span className="px-2 py-0.5 rounded-full bg-[#30d158]/10 text-[#1d8a3a] font-medium">
                      Popular
                    </span>
                  )}
                  {s.popularity === 'emerging' && (
                    <span className="px-2 py-0.5 rounded-full bg-[#ff9f0a]/10 text-[#a55a00] font-medium">
                      Emerging
                    </span>
                  )}
                </div>
              </a>
            ))}
          </div>
        )}

        {/* Category descriptions */}
        <section className="mt-12 bg-white rounded-2xl p-6 shadow-sm">
          <h2 className="text-lg font-semibold mb-4">Categories explained</h2>
          <div className="grid sm:grid-cols-2 gap-4 text-sm">
            {CATEGORY_ORDER.map(cat => (
              <div key={cat}>
                <div className="font-medium text-[#1d1d1f] mb-0.5">
                  {CATEGORY_LABELS[cat]}{' '}
                  <span className="text-[#86868b] font-normal">({countByCat[cat]})</span>
                </div>
                <div className="text-[#86868b] text-xs leading-relaxed">
                  {CATEGORY_DESCRIPTIONS[cat]}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* FAQ */}
        <section className="mt-6 bg-white rounded-2xl p-6 shadow-sm">
          <h2 className="text-lg font-semibold mb-4">FAQ</h2>
          <Faq q="What is MCP?">
            Model Context Protocol is Anthropic's open standard for letting AI clients (Claude
            Desktop, Cursor, etc.) talk to external systems. Each server exposes tools the model can
            call.
          </Faq>
          <Faq q="How do I install one of these in Claude Desktop?">
            Edit{' '}
            <code className="text-xs bg-[#f5f5f7] px-1 py-0.5 rounded">
              ~/Library/Application Support/Claude/claude_desktop_config.json
            </code>{' '}
            (Mac) or the Windows equivalent, paste the config JSON shown on the server's detail
            page, then quit and relaunch Claude Desktop. The config is read once at startup.
          </Faq>
          <Faq q="Will Cursor configs be different?">
            Mostly the same shape. Cursor uses{' '}
            <code className="text-xs bg-[#f5f5f7] px-1 py-0.5 rounded">~/.cursor/mcp.json</code> and
            supports the same protocol. Detail pages note when the config differs.
          </Faq>
          <Faq q="What if a server isn't here?">
            We start with 10 servers we can describe in depth and verify in real workflows. We
            expand the list every two weeks based on traction. The official Anthropic monorepo at
            github.com/modelcontextprotocol/servers has the full upstream list.
          </Faq>
          <Faq q="Are these safe to install?">
            All Anthropic-published servers are sandboxed by client permission scopes. Community
            servers vary — read the source repo before installing one with elevated permissions
            (writes, secrets, etc.).
          </Faq>
        </section>
      </main>

      <footer className="border-t border-[#e8e8ed] py-8 mt-8">
        <div className="max-w-[1080px] mx-auto px-4 text-center text-xs text-[#86868b]">
          <p>
            Free, ad-free. Each entry researched and rewritten from first-hand testing. Last
            reviewed {LAST_UPDATED}.
          </p>
        </div>
      </footer>
    </div>
  )
}

function CatPill({
  active,
  label,
  count,
  onClick,
}: {
  active: boolean
  label: string
  count: number
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
        active
          ? 'bg-[#0071E3] text-white'
          : 'bg-white text-[#1d1d1f] hover:bg-[#f5f5f7] border border-[#e8e8ed]'
      }`}
      data-testid={`cat-pill-${label.toLowerCase().replace(/\s+/g, '-').replace('&', 'and')}`}
    >
      {label} <span className="opacity-60">{count}</span>
    </button>
  )
}

function Faq({ q, children }: { q: string; children: React.ReactNode }) {
  return (
    <details className="border-b border-[#e8e8ed] last:border-0 py-3">
      <summary className="font-medium cursor-pointer text-[#1d1d1f] hover:text-[#0071E3] transition-colors">
        {q}
      </summary>
      <p className="mt-2 text-sm text-[#424245] leading-relaxed">{children}</p>
    </details>
  )
}
