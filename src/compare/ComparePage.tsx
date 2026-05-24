import { useState, useCallback } from 'react'
import type { ComparePage } from './seo/compare-data'
import { COMPARE_PAGES } from './seo/compare-data'

function getData(): ComparePage | null {
  const el = document.getElementById('seo-data')
  if (!el) return null
  try { return JSON.parse(el.textContent || '{}') } catch { return null }
}

const DIFFICULTY_STYLES: Record<string, { badge: string; icon: string }> = {
  Easy: { badge: 'bg-green-100 text-green-700 border-green-200', icon: '✓' },
  Medium: { badge: 'bg-yellow-100 text-yellow-700 border-yellow-200', icon: '▲' },
  Hard: { badge: 'bg-red-100 text-red-700 border-red-200', icon: '⚠' },
}

const WINNER_STYLES = {
  a: { bg: 'bg-blue-50 border-blue-300', text: 'text-blue-700', label: '🏆 Winner' },
  b: { bg: 'bg-purple-50 border-purple-300', text: 'text-purple-700', label: '🏆 Winner' },
  tie: { bg: 'bg-gray-50 border-gray-300', text: 'text-gray-700', label: '🤝 Tie' },
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
    <button onClick={copy} className="text-xs text-gray-400 hover:text-white transition-colors focus:outline-none focus-visible:text-white" aria-label={copied ? 'Copied' : 'Copy command'}>
      {copied ? 'Copied!' : 'Copy'}
    </button>
  )
}

function formatFeature(v: string | boolean) {
  if (v === true) return <span className="text-green-600 font-medium">Yes</span>
  if (v === false) return <span className="text-gray-400">—</span>
  return <span className="text-gray-700">{v}</span>
}

export default function ComparePageComponent() {
  const data = getData()
  if (!data) return <div className="p-8 text-center text-gray-500">Loading...</div>

  const relatedSlugs = COMPARE_PAGES.filter(p => p.slug !== data.slug).slice(0, 4)
  const wStyle = WINNER_STYLES[data.winner]

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-5xl mx-auto px-4 py-6">
          <nav className="text-sm text-gray-500 mb-2" aria-label="Breadcrumb">
            <a href="/" className="hover:text-blue-600">Home</a>
            <span className="mx-2" aria-hidden="true">/</span>
            <a href="/compare/" className="hover:text-blue-600">Compare</a>
            <span className="mx-2" aria-hidden="true">/</span>
            <span className="text-gray-700">{data.productA.name} vs {data.productB.name}</span>
          </nav>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">{data.h1}</h1>
          <p className="text-gray-600 mt-2 text-lg leading-relaxed">{data.description}</p>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-8">
        {/* Summary */}
        <section className={`${wStyle.bg} border rounded-xl p-6 mb-6`}>
          <div className={`text-sm font-medium ${wStyle.text} mb-2`}>Quick Verdict</div>
          <p className="text-gray-800 leading-relaxed">{data.summary}</p>
        </section>

        {/* Side-by-side cards */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          {([data.productA, data.productB] as const).map((prod, i) => {
            const diff = DIFFICULTY_STYLES[prod.difficulty] || DIFFICULTY_STYLES.Medium
            const isWinner = (data.winner === 'a' && i === 0) || (data.winner === 'b' && i === 1)
            return (
              <div key={prod.name} className={`bg-white rounded-xl border-2 p-6 ${isWinner ? 'border-blue-400 shadow-md' : 'border-gray-200'}`}>
                <div className="flex items-center gap-3 mb-3">
                  <span className="text-3xl" aria-hidden="true">{prod.logo}</span>
                  <div>
                    <h2 className="text-xl font-bold text-gray-900">{prod.name}</h2>
                    <p className="text-sm text-gray-500">{prod.tagline}</p>
                  </div>
                  {isWinner && <span className="ml-auto text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full font-medium">{wStyle.label}</span>}
                </div>

                <div className="grid grid-cols-2 gap-2 text-sm mb-4">
                  <div className="bg-gray-50 rounded-lg p-2.5">
                    <div className="text-gray-500 text-xs">License</div>
                    <div className="font-medium text-gray-900">{prod.license}</div>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-2.5">
                    <div className="text-gray-500 text-xs">Difficulty</div>
                    <span className={`px-2 py-0.5 rounded-full text-xs ${diff.badge}`}>{prod.difficulty}</span>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-2.5">
                    <div className="text-gray-500 text-xs">Self-Hosted</div>
                    <div className="font-medium">{prod.selfHosted ? '✅ Yes' : '❌ No'}</div>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-2.5">
                    <div className="text-gray-500 text-xs">Pricing</div>
                    <div className="font-medium text-gray-900">{prod.pricing}</div>
                  </div>
                </div>

                <div className="flex gap-2 text-sm">
                  {prod.github && <a href={prod.github} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">GitHub</a>}
                  <a href={prod.url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Website</a>
                </div>
              </div>
            )
          })}
        </section>

        {/* Feature comparison table */}
        <section className="bg-white rounded-xl border border-gray-200 p-6 mb-8 overflow-x-auto">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Feature Comparison</h2>
          <table className="w-full text-sm" aria-label={`Comparing ${data.productA.name} and ${data.productB.name}`}>
            <thead>
              <tr className="border-b-2 border-gray-200">
                <th className="text-left py-3 px-3 text-gray-600 font-medium">Feature</th>
                <th className="text-center py-3 px-3 text-gray-900 font-semibold">{data.productA.logo} {data.productA.name}</th>
                <th className="text-center py-3 px-3 text-gray-900 font-semibold">{data.productB.logo} {data.productB.name}</th>
              </tr>
            </thead>
            <tbody>
              {data.features.map((f, i) => (
                <tr key={i} className={i % 2 === 0 ? 'bg-gray-50' : ''}>
                  <td className="py-2.5 px-3 text-gray-700 font-medium">{f.name}</td>
                  <td className="text-center py-2.5 px-3">{formatFeature(f.a)}</td>
                  <td className="text-center py-2.5 px-3">{formatFeature(f.b)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>

        {/* Pros & Cons */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">{data.productA.logo} {data.productA.name} Pros & Cons</h2>
            <div className="space-y-2 mb-4">
              {data.prosA.map((p, i) => (
                <div key={i} className="flex gap-2 text-sm">
                  <span className="text-green-500 shrink-0">+</span>
                  <span className="text-gray-700">{p}</span>
                </div>
              ))}
            </div>
            <div className="space-y-2">
              {data.consA.map((c, i) => (
                <div key={i} className="flex gap-2 text-sm">
                  <span className="text-red-500 shrink-0">−</span>
                  <span className="text-gray-600">{c}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">{data.productB.logo} {data.productB.name} Pros & Cons</h2>
            <div className="space-y-2 mb-4">
              {data.prosB.map((p, i) => (
                <div key={i} className="flex gap-2 text-sm">
                  <span className="text-green-500 shrink-0">+</span>
                  <span className="text-gray-700">{p}</span>
                </div>
              ))}
            </div>
            <div className="space-y-2">
              {data.consB.map((c, i) => (
                <div key={i} className="flex gap-2 text-sm">
                  <span className="text-red-500 shrink-0">−</span>
                  <span className="text-gray-600">{c}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Winner + Docker Compose */}
        <section className={`${wStyle.bg} border rounded-xl p-6 mb-8`}>
          <h2 className="text-xl font-semibold text-gray-900 mb-3">
            Our Pick: {data.winner === 'a' ? data.productA.name : data.winner === 'b' ? data.productB.name : 'Both'}
          </h2>
          <p className="text-gray-800 leading-relaxed mb-4">{data.winnerReason}</p>

          {(() => {
            const winnerProd = data.winner === 'a' ? data.productA : data.productB
            if (winnerProd.dockerCompose) {
              return (
                <div className="bg-gray-900 rounded-lg p-4 mt-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0">
                      <div className="text-xs text-gray-400 mb-2">Deploy {winnerProd.name} with Docker Compose</div>
                      <pre className="text-sm text-green-400 font-mono whitespace-pre-wrap break-all">{winnerProd.dockerCompose}</pre>
                    </div>
                    <CopyButton text={winnerProd.dockerCompose} />
                  </div>
                </div>
              )
            }
            return null
          })()}
        </section>

        {/* FAQ */}
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

        {/* Related comparisons */}
        {relatedSlugs.length > 0 && (
          <section className="bg-white rounded-xl border border-gray-200 p-6 mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">More Comparisons</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {relatedSlugs.map(rp => (
                <a
                  key={rp.slug}
                  href={`/compare/${rp.slug}/`}
                  className="flex items-center gap-3 p-3 rounded-lg border border-gray-200 hover:border-blue-400 hover:shadow-md transition-[border-color,box-shadow] group focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
                >
                  <span className="text-xl" aria-hidden="true">{rp.productA.logo} ⚡ {rp.productB.logo}</span>
                  <div>
                    <div className="font-medium text-gray-900 group-hover:text-blue-600 transition-colors">{rp.productA.name} vs {rp.productB.name}</div>
                    <div className="text-xs text-gray-500">{rp.productA.tagline}</div>
                  </div>
                  <span className="ml-auto text-gray-400 group-hover:text-blue-500" aria-hidden="true">&rarr;</span>
                </a>
              ))}
            </div>
          </section>
        )}

        <div className="text-center py-4">
          <a href="/compare/" className="text-blue-600 hover:underline">&larr; All comparisons</a>
          <span className="mx-4 text-gray-300" aria-hidden="true">|</span>
          <a href="/alternatives/" className="text-blue-600 hover:underline">Self-Hosted Alternatives</a>
          <span className="mx-4 text-gray-300" aria-hidden="true">|</span>
          <a href="/" className="text-blue-600 hover:underline">AI Cost Calculator</a>
        </div>
      </main>

      <footer className="border-t border-gray-200 bg-white">
        <div className="max-w-5xl mx-auto px-4 py-6 text-center text-sm text-gray-500">
          <p>Side-by-side comparisons of self-hosted and SaaS tools.</p>
        </div>
      </footer>
    </div>
  )
}
