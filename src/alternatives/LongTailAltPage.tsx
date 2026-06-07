import { useState, useCallback } from 'react'
import type { AlternativePage } from './seo/alternatives-data'
import { ALTERNATIVE_PAGES } from './seo/alternatives-data'
import { COMPARE_PAGES } from '../compare/seo/compare-data'

function getSeoData(): AlternativePage | null {
  const el = document.getElementById('seo-data')
  if (!el) return null
  try { return JSON.parse(el.textContent || '{}') } catch { return null }
}

const DIFFICULTY_STYLES: Record<string, { badge: string; icon: string }> = {
  Easy: { badge: 'bg-green-100 text-green-700 border-green-200', icon: '✓' },
  Medium: { badge: 'bg-yellow-100 text-yellow-700 border-yellow-200', icon: '▲' },
  Hard: { badge: 'bg-red-100 text-red-700 border-red-200', icon: '⚠' },
}

const RELATED: Record<string, string[]> = {
  'google-drive': ['dropbox', 'onedrive'],
  'dropbox': ['google-drive', 'onedrive'],
  'onedrive': ['google-drive', 'dropbox'],
  'notion': ['evernote', 'confluence'],
  'evernote': ['notion', 'confluence'],
  'slack': ['discord', 'zoom'],
  'discord': ['slack', 'zoom'],
  'zoom': ['slack', 'discord'],
  'lastpass': ['1password', 'bitwarden-cloud'],
  '1password': ['lastpass', 'bitwarden-cloud'],
  'jira': ['trello', 'todoist'],
  'trello': ['jira', 'todoist'],
  'spotify': ['netflix', 'google-photos'],
  'netflix': ['spotify'],
  'github': ['circleci'],
  'gmail': ['mailchimp'],
  'confluence': ['notion', 'wordpress-com'],
  'docmost': ['notion', 'confluence', 'obsidian'],
  'airtable': ['notion'],
  'google-analytics': ['datadog'],
  'salesforce': ['zendesk', 'mailchimp'],
  'datadog': ['google-analytics'],
  'zendesk': ['salesforce', 'slack'],
  'google-photos': ['spotify'],
  'zapier': ['slack', 'mailchimp'],
}

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false)
  const copy = useCallback(() => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }, [text])
  return (
    <button
      onClick={copy}
      className="text-xs text-gray-400 hover:text-white transition-colors focus:outline-none focus-visible:text-white"
      aria-label={copied ? 'Copied' : 'Copy command'}
    >
      {copied ? 'Copied!' : 'Copy'}
    </button>
  )
}

export default function LongTailAltPage() {
  const data = getSeoData()
  if (!data) return <div className="p-8 text-center text-gray-500">Loading...</div>

  const relatedSlugs = RELATED[data.slug] || []
  const relatedPages = relatedSlugs.map(s => ALTERNATIVE_PAGES.find(p => p.slug === s)).filter(Boolean) as AlternativePage[]

  const altNames = new Set([data.saasName.toLowerCase(), ...data.alternatives.map(a => a.name.toLowerCase())])
  const relatedComparisons = COMPARE_PAGES.filter(cp => {
    const a = cp.productA.name.toLowerCase()
    const b = cp.productB.name.toLowerCase()
    return altNames.has(a) || altNames.has(b)
  }).slice(0, 4)

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-5xl mx-auto px-4 py-6">
          <nav className="text-sm text-gray-500 mb-2" aria-label="Breadcrumb">
            <a href="/" className="hover:text-blue-600">Home</a>
            <span className="mx-2" aria-hidden="true">/</span>
            <a href="/alternatives/" className="hover:text-blue-600">Alternatives</a>
            <span className="mx-2" aria-hidden="true">/</span>
            <span className="text-gray-700">{data.saasName}</span>
          </nav>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">{data.h1}</h1>
          <p className="text-gray-600 mt-2 text-lg leading-relaxed">{data.description}</p>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-8">
        <section className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-3">Why Switch from {data.saasName}?</h2>
          <p className="text-gray-700 leading-relaxed">{data.explanation}</p>
        </section>

        <section className="space-y-4 mb-8">
          <h2 className="text-2xl font-bold text-gray-900">Top {data.saasName} Alternatives</h2>
          {data.alternatives.map(alt => {
            const diff = DIFFICULTY_STYLES[alt.difficulty] || DIFFICULTY_STYLES.Medium
            return (
              <div key={alt.name} className="bg-white rounded-xl border border-gray-200 p-6">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900">{alt.name}</h3>
                    <p className="text-gray-600 mt-1 leading-relaxed">{alt.description}</p>
                  </div>
                  <span className={`px-2.5 py-1 rounded-full text-xs font-medium border shrink-0 ${diff.badge}`}>
                    <span aria-hidden="true">{diff.icon} </span>{alt.difficulty}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 mb-4 text-sm">
                  <div className="bg-gray-50 rounded-lg p-3">
                    <div className="text-gray-500">License</div>
                    <div className="font-medium text-gray-900">{alt.license}</div>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-3">
                    <div className="text-gray-500">Docker</div>
                    <div className="font-medium text-gray-900">{alt.docker ? 'Yes' : 'No'}</div>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-3">
                    <div className="text-gray-500">Source</div>
                    <div className="font-medium">
                      {alt.github ? (
                        <a href={alt.github} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">GitHub<span className="sr-only"> (opens in new tab)</span></a>
                      ) : (
                        <span className="text-gray-400">Proprietary</span>
                      )}
                    </div>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-3">
                    <div className="text-gray-500">Website</div>
                    <div className="font-medium">
                      <a href={alt.url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                        {new URL(alt.url).hostname}<span className="sr-only"> (opens in new tab)</span>
                      </a>
                    </div>
                  </div>
                </div>

                <div className="mb-4">
                  <div className="text-sm text-gray-500 mb-2">Key Features</div>
                  <div className="flex flex-wrap gap-1.5">
                    {alt.features.map(f => (
                      <span key={f} className="text-xs bg-blue-50 text-blue-700 border border-blue-200 px-2 py-1 rounded-full">{f}</span>
                    ))}
                  </div>
                </div>

                {alt.dockerCommand && (
                  <div className="bg-gray-900 rounded-lg p-4 flex items-start justify-between gap-4">
                    <div className="min-w-0">
                      <div className="text-xs text-gray-400 mb-2">Quick Start (Docker)</div>
                      <code className="text-sm text-green-400 font-mono break-all">{alt.dockerCommand}</code>
                    </div>
                    <CopyButton text={alt.dockerCommand} />
                  </div>
                )}
              </div>
            )
          })}
        </section>

        <section className="bg-white rounded-xl border border-gray-200 p-6 mb-8 overflow-x-auto">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Feature Comparison</h2>
          <table className="w-full text-sm" aria-labelledby="comparison-heading">
            <thead>
              <tr className="border-b border-gray-200">
                <th id="comparison-heading" className="text-left py-2 px-3 text-gray-600 font-medium">Feature</th>
                {data.alternatives.map(alt => (
                  <th key={alt.name} className="text-center py-2 px-3 text-gray-900 font-semibold">{alt.name}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-gray-100">
                <td className="py-2 px-3 text-gray-600">License</td>
                {data.alternatives.map(alt => (
                  <td key={alt.name} className="text-center py-2 px-3">{alt.license}</td>
                ))}
              </tr>
              <tr className="border-b border-gray-100">
                <td className="py-2 px-3 text-gray-600">Difficulty</td>
                {data.alternatives.map(alt => {
                  const d = DIFFICULTY_STYLES[alt.difficulty] || DIFFICULTY_STYLES.Medium
                  return (
                    <td key={alt.name} className="text-center py-2 px-3">
                      <span className={`px-2 py-0.5 rounded-full text-xs ${d.badge}`}>{alt.difficulty}</span>
                    </td>
                  )
                })}
              </tr>
              <tr className="border-b border-gray-100">
                <td className="py-2 px-3 text-gray-600">Docker</td>
                {data.alternatives.map(alt => (
                  <td key={alt.name} className="text-center py-2 px-3">{alt.docker ? 'Yes' : 'No'}</td>
                ))}
              </tr>
              {data.alternatives[0]?.features.slice(0, 5).map(feature => (
                <tr key={feature} className="border-b border-gray-100">
                  <td className="py-2 px-3 text-gray-600">{feature}</td>
                  {data.alternatives.map(alt => (
                    <td key={alt.name} className="text-center py-2 px-3">
                      {alt.features.includes(feature) ? 'Yes' : '—'}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </section>

        <section className="bg-white rounded-xl border border-gray-200 p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-5">Frequently Asked Questions</h2>
          <div className="space-y-6">
            {data.faq.map((item, i) => (
              <div key={i}>
                <h3 className="font-semibold text-gray-900 leading-relaxed">{item.q}</h3>
                <p className="text-gray-600 mt-1.5 leading-relaxed">{item.a}</p>
              </div>
            ))}
          </div>
        </section>

        {relatedComparisons.length > 0 && (
          <section className="bg-white rounded-xl border border-gray-200 p-6 mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Compare Side-by-Side</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {relatedComparisons.map(cp => (
                <a
                  key={cp.slug}
                  href={`/compare/${cp.slug}/`}
                  className="flex items-center gap-3 p-3 rounded-lg border border-gray-200 hover:border-blue-400 hover:shadow-md transition-[border-color,box-shadow] group focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
                >
                  <span className="text-lg" aria-hidden="true">{cp.productA.logo}</span>
                  <span className="text-gray-400 text-sm">vs</span>
                  <span className="text-lg" aria-hidden="true">{cp.productB.logo}</span>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-gray-900 group-hover:text-blue-600 transition-colors text-sm truncate">
                      {cp.productA.name} vs {cp.productB.name}
                    </div>
                  </div>
                  <span className="text-gray-400 group-hover:text-blue-500" aria-hidden="true">&rarr;</span>
                </a>
              ))}
            </div>
          </section>
        )}

        {relatedPages.length > 0 && (
          <section className="bg-white rounded-xl border border-gray-200 p-6 mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Related Alternatives</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {relatedPages.map(rp => (
                <a
                  key={rp.slug}
                  href={`/alternatives/${rp.slug}/`}
                  className="flex items-center gap-3 p-3 rounded-lg border border-gray-200 hover:border-blue-400 hover:shadow-md transition-[border-color,box-shadow] group focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
                >
                  <span className="text-xl" aria-hidden="true">{rp.icon}</span>
                  <div>
                    <div className="font-medium text-gray-900 group-hover:text-blue-600 transition-colors">{rp.saasName}</div>
                    <div className="text-xs text-gray-500">{rp.alternatives.length} alternative{rp.alternatives.length > 1 ? 's' : ''}</div>
                  </div>
                  <span className="ml-auto text-gray-400 group-hover:text-blue-500" aria-hidden="true">&rarr;</span>
                </a>
              ))}
            </div>
          </section>
        )}

        <div className="text-center py-4">
          <a href="/alternatives/" className="text-blue-600 hover:underline">&larr; Browse all self-hosted alternatives</a>
          <span className="mx-4 text-gray-300" aria-hidden="true">|</span>
          <a href="/" className="text-blue-600 hover:underline">AI Cost Calculator</a>
        </div>
      </main>

      <footer className="border-t border-gray-200 bg-white">
        <div className="max-w-5xl mx-auto px-4 py-6 text-center text-sm text-gray-500">
          <p>Open source self-hosted alternatives for popular SaaS tools.</p>
        </div>
      </footer>
    </div>
  )
}
