// src/mcp/MCPDetailApp.tsx — per-server decision page

import { useEffect, useState } from 'react'
import { GlobalNav } from '../components/GlobalNav'
import { MCP_SERVERS, CATEGORY_LABELS, LAST_UPDATED } from './seo/mcp-data'
import type { MCPServer } from './seo/mcp-data'

function getServerFromPath(): MCPServer | null {
  const m = window.location.pathname.match(/\/mcp-servers\/([^/]+)\/?$/)
  if (!m) return null
  return MCP_SERVERS.find(s => s.slug === m[1]) || null
}

export default function MCPDetailApp() {
  const [server, setServer] = useState<MCPServer | null>(() => getServerFromPath())
  const [tab, setTab] = useState<'claude' | 'cursor'>('claude')
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    if (!server) {
      const fromSeoTag = document.getElementById('seo-data')
      if (fromSeoTag?.textContent) {
        try {
          setServer(JSON.parse(fromSeoTag.textContent))
        } catch {}
      }
    }
  }, [server])

  if (!server) {
    return (
      <div className="min-h-screen bg-[#f5f5f7] flex items-center justify-center">
        <a href="/mcp-servers/" className="text-[#0071E3] hover:underline">
          Server not found — back to directory →
        </a>
      </div>
    )
  }

  const config = tab === 'cursor' && server.cursorConfig ? server.cursorConfig : server.claudeDesktopConfig
  const configJson = JSON.stringify(config, null, 2)

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(configJson)
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    } catch {}
  }

  const sameCategory = MCP_SERVERS.filter(
    s => s.category === server.category && s.slug !== server.slug
  ).slice(0, 3)

  return (
    <div className="min-h-screen bg-[#f5f5f7] text-[#1d1d1f]">
      <GlobalNav current="/mcp-servers/" />

      {/* Breadcrumb */}
      <div className="max-w-[860px] mx-auto px-4 pt-6 text-sm text-[#86868b]">
        <a href="/mcp-servers/" className="hover:text-[#0071E3]">
          MCP Server Directory
        </a>{' '}
        / {CATEGORY_LABELS[server.category]} / {server.name}
      </div>

      {/* Hero */}
      <header className="max-w-[860px] mx-auto px-4 pt-6 pb-6">
        <div className="flex items-baseline gap-3 flex-wrap mb-2">
          <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight">
            {server.name} MCP Server
          </h1>
          <span
            className={`px-2 py-0.5 rounded-full text-xs font-medium ${
              server.officialBy === 'anthropic'
                ? 'bg-[#1d1d1f] text-white'
                : 'bg-[#f5f5f7] text-[#86868b] border border-[#e8e8ed]'
            }`}
          >
            {server.officialBy === 'anthropic' ? '✓ Anthropic Official' : 'Community'}
          </span>
        </div>
        <p className="text-lg text-[#424245] leading-relaxed">{server.description}</p>
      </header>

      <main className="max-w-[860px] mx-auto px-4 pb-16">
        {/* Install / Config */}
        <section className="bg-white rounded-2xl p-6 shadow-sm mb-6" data-testid="install-section">
          <h2 className="text-xl font-semibold mb-4">Install</h2>
          <p className="text-sm text-[#86868b] mb-2">Quick command:</p>
          <pre className="bg-[#1d1d1f] text-[#f5f5f7] px-4 py-3 rounded-xl font-mono text-xs overflow-x-auto mb-4">
            {server.installCommand}
          </pre>

          <h3 className="font-medium text-base mb-2 mt-6">Config</h3>
          <div className="flex gap-2 mb-3">
            <button
              type="button"
              onClick={() => setTab('claude')}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                tab === 'claude'
                  ? 'bg-[#0071E3] text-white'
                  : 'bg-[#f5f5f7] text-[#1d1d1f] hover:bg-[#e8e8ed]'
              }`}
              data-testid="tab-claude"
            >
              Claude Desktop
            </button>
            <button
              type="button"
              onClick={() => setTab('cursor')}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                tab === 'cursor'
                  ? 'bg-[#0071E3] text-white'
                  : 'bg-[#f5f5f7] text-[#1d1d1f] hover:bg-[#e8e8ed]'
              }`}
              data-testid="tab-cursor"
            >
              Cursor
            </button>
          </div>

          <p className="text-xs text-[#86868b] mb-2">
            {tab === 'claude' ? (
              <>
                Add to{' '}
                <code className="bg-[#f5f5f7] px-1 py-0.5 rounded">
                  ~/Library/Application Support/Claude/claude_desktop_config.json
                </code>
                . Restart Claude Desktop after editing.
              </>
            ) : (
              <>
                Add to{' '}
                <code className="bg-[#f5f5f7] px-1 py-0.5 rounded">~/.cursor/mcp.json</code>.
                Restart Cursor after editing.
              </>
            )}
          </p>

          <div className="relative" data-testid="config-block">
            <pre className="bg-[#1d1d1f] text-[#f5f5f7] px-4 py-3 rounded-xl font-mono text-xs overflow-x-auto leading-relaxed">
              {configJson}
            </pre>
            <button
              type="button"
              onClick={copy}
              className="absolute top-2 right-2 px-3 py-1 text-xs bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors"
              data-testid="copy-config"
            >
              {copied ? '✓ Copied' : 'Copy'}
            </button>
          </div>

          {/* Env vars */}
          {server.envVars.length > 0 && (
            <div className="mt-5">
              <h3 className="font-medium text-base mb-2">Environment variables</h3>
              <table className="w-full text-sm" data-testid="env-table">
                <thead className="text-xs text-[#86868b] border-b border-[#e8e8ed]">
                  <tr>
                    <th className="text-left py-2 font-medium">Variable</th>
                    <th className="text-left py-2 font-medium">Required</th>
                    <th className="text-left py-2 font-medium">Note</th>
                  </tr>
                </thead>
                <tbody>
                  {server.envVars.map(v => (
                    <tr key={v.key} className="border-b border-[#e8e8ed] last:border-0">
                      <td className="py-2.5 font-mono text-xs">{v.key}</td>
                      <td className="py-2.5">
                        {v.required ? (
                          <span className="text-[#ff3b30] text-xs font-medium">Required</span>
                        ) : (
                          <span className="text-[#86868b] text-xs">Optional</span>
                        )}
                      </td>
                      <td className="py-2.5 text-[#424245] text-xs">{v.note}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        {/* Use cases / when not */}
        <section className="grid sm:grid-cols-2 gap-4 mb-6">
          <div className="bg-white rounded-2xl p-6 shadow-sm" data-testid="use-cases">
            <h2 className="text-base font-semibold mb-3 flex items-center gap-2">
              <span className="text-[#30d158]">✓</span> Use this when
            </h2>
            <ul className="space-y-2">
              {server.useCase.map((u, i) => (
                <li key={i} className="text-sm text-[#424245] leading-relaxed flex gap-2">
                  <span className="text-[#86868b] mt-0.5">·</span>
                  <span>{u}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-sm" data-testid="when-not">
            <h2 className="text-base font-semibold mb-3 flex items-center gap-2">
              <span className="text-[#ff3b30]">✗</span> Don't use this if
            </h2>
            <ul className="space-y-2">
              {server.whenNot.map((u, i) => (
                <li key={i} className="text-sm text-[#424245] leading-relaxed flex gap-2">
                  <span className="text-[#86868b] mt-0.5">·</span>
                  <span>{u}</span>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* Common pitfalls */}
        <section
          className="bg-white rounded-2xl p-6 shadow-sm mb-6"
          data-testid="pitfalls-section"
        >
          <h2 className="text-lg font-semibold mb-3">Common pitfalls</h2>
          <ul className="space-y-2">
            {server.commonPitfalls.map((p, i) => (
              <li key={i} className="text-sm text-[#424245] leading-relaxed flex gap-2">
                <span className="text-[#ff9f0a]">⚠</span>
                <span>{p}</span>
              </li>
            ))}
          </ul>
        </section>

        {/* vs alternative */}
        {server.vsAlternative && (
          <section className="bg-white rounded-2xl p-6 shadow-sm mb-6" data-testid="vs-alternative">
            <h2 className="text-lg font-semibold mb-3">
              {server.name} vs {server.vsAlternative.name}
            </h2>
            <div className="grid sm:grid-cols-2 gap-4 text-sm">
              <div className="p-4 bg-[#0071E3]/5 rounded-xl">
                <div className="font-medium mb-1">Pick {server.name}</div>
                <div className="text-[#424245]">{server.vsAlternative.pickThis}</div>
              </div>
              <div className="p-4 bg-[#f5f5f7] rounded-xl">
                <div className="font-medium mb-1">Pick {server.vsAlternative.name}</div>
                <div className="text-[#424245]">{server.vsAlternative.pickOther}</div>
              </div>
            </div>
          </section>
        )}

        {/* Source link */}
        <section className="bg-white rounded-2xl p-6 shadow-sm mb-6">
          <h2 className="text-base font-semibold mb-2">Source</h2>
          <p className="text-sm text-[#424245]">
            Official repo:{' '}
            <a
              href={server.sourceUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#0071E3] hover:underline"
            >
              {server.sourceUrl}
            </a>
          </p>
          <p className="text-xs text-[#86868b] mt-1">
            Description and examples on this page are written from our own testing — see source for
            authoritative reference. Last reviewed {LAST_UPDATED}.
          </p>
        </section>

        {/* Same category */}
        {sameCategory.length > 0 && (
          <section className="bg-white rounded-2xl p-6 shadow-sm" data-testid="related">
            <h2 className="text-base font-semibold mb-3">
              Other {CATEGORY_LABELS[server.category]} servers
            </h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {sameCategory.map(s => (
                <a
                  key={s.slug}
                  href={`/mcp-servers/${s.slug}/`}
                  className="block p-4 rounded-xl border border-[#e8e8ed] hover:border-[#0071E3] hover:bg-[#0071E3]/5 transition-colors"
                >
                  <div className="font-medium mb-0.5 text-sm">{s.name} →</div>
                  <div className="text-xs text-[#86868b] line-clamp-2">{s.oneLiner}</div>
                </a>
              ))}
            </div>
          </section>
        )}
      </main>

      <footer className="border-t border-[#e8e8ed] py-8 mt-8">
        <div className="max-w-[860px] mx-auto px-4 text-center text-xs text-[#86868b]">
          <a href="/mcp-servers/" className="hover:text-[#0071E3]">
            ← Back to MCP Server Directory
          </a>
        </div>
      </footer>
    </div>
  )
}
