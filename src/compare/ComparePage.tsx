import { useState, useCallback } from 'react'
import type { ComparePage } from './seo/compare-data'
import { COMPARE_PAGES } from './seo/compare-data'
import { ALTERNATIVE_PAGES } from '../alternatives/seo/alternatives-data'
import { GlobalNav } from '../components/GlobalNav'

function getData(): ComparePage | null {
  const el = document.getElementById('seo-data')
  if (!el) return null
  try { return JSON.parse(el.textContent || '{}') } catch { return null }
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
    <button onClick={copy} className="text-xs text-[#86868b] hover:text-[#1d1d1f] transition-colors" aria-label={copied ? 'Copied' : 'Copy'}>
      {copied ? 'Copied!' : 'Copy'}
    </button>
  )
}

function FeatureValue({ v }: { v: string | boolean }) {
  if (v === true) return <span className="text-[#30d158] font-medium">Yes</span>
  if (v === false) return <span className="text-[#86868b]">—</span>
  return <span className="text-[#1d1d1f]">{v}</span>
}

const DIFFICULTY_STYLES: Record<string, string> = {
  Easy: 'bg-[#30d158]/10 text-[#30d158]',
  Medium: 'bg-amber-500/10 text-amber-600',
  Hard: 'bg-red-500/10 text-red-600',
}

export default function ComparePageComponent() {
  const data = getData()
  if (!data) return <div className="p-8 text-center text-[#86868b]">Loading...</div>

  const relatedSlugs = COMPARE_PAGES.filter(p => p.slug !== data.slug).slice(0, 4)
  const winnerName = data.winner === 'a' ? data.productA.name : data.winner === 'b' ? data.productB.name : 'Both'
  const winnerProd = data.winner === 'b' ? data.productB : data.productA

  // Find alternatives hub pages featuring either product (A or B)
  const altLinks = [data.productA, data.productB].map(prod => {
    const hit = ALTERNATIVE_PAGES.find(ap =>
      ap.saasName.toLowerCase() === prod.name.toLowerCase() ||
      ap.alternatives.some(a => a.name.toLowerCase() === prod.name.toLowerCase())
    )
    return hit ? { product: prod.name, slug: hit.slug, saasName: hit.saasName } : null
  }).filter(Boolean) as { product: string; slug: string; saasName: string }[]
  // Dedupe by slug
  const seenSlugs = new Set<string>()
  const uniqueAltLinks = altLinks.filter(l => {
    if (seenSlugs.has(l.slug)) return false
    seenSlugs.add(l.slug)
    return true
  })

  return (
    <div className="min-h-screen bg-[#f5f5f7]">
      <GlobalNav current="/compare/" />

      <main className="max-w-[780px] mx-auto px-6 py-10">
        {/* Hero */}
        <div className="mb-8">
          <nav className="text-sm text-[#86868b] mb-4" aria-label="Breadcrumb">
            <a href="/" className="hover:text-[#0071E3] transition-colors">Home</a>
            <span className="mx-1.5">/</span>
            <a href="/compare/" className="hover:text-[#0071E3] transition-colors">Compare</a>
            <span className="mx-1.5">/</span>
            <span className="text-[#1d1d1f]">{data.productA.name} vs {data.productB.name}</span>
          </nav>
          <h1 className="text-3xl md:text-4xl font-semibold text-[#1d1d1f] tracking-tight mb-3">{data.h1}</h1>
          <p className="text-[#86868b] text-lg leading-relaxed">{data.description}</p>
        </div>

        {/* Quick Verdict */}
        <div className="mb-6 bg-white rounded-2xl p-5 shadow-sm">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xs bg-[#0071E3]/10 text-[#0071E3] px-2.5 py-0.5 rounded-full font-medium">
              Quick Verdict
            </span>
            <span className="text-sm font-medium text-[#1d1d1f]">{winnerName} wins</span>
          </div>
          <p className="text-[#86868b] leading-relaxed">{data.summary}</p>
        </div>

        {/* Side-by-side product cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          {([data.productA, data.productB] as const).map((prod, i) => {
            const isWinner = (data.winner === 'a' && i === 0) || (data.winner === 'b' && i === 1)
            const diffClass = DIFFICULTY_STYLES[prod.difficulty] || DIFFICULTY_STYLES.Medium
            return (
              <div key={prod.name} className={`bg-white rounded-2xl p-5 shadow-sm transition-all ${isWinner ? 'ring-2 ring-[#0071E3]/20 border border-[#0071E3]/30' : 'border border-[#e8e8ed]'}`}>
                <div className="flex items-center gap-3 mb-4">
                  <span className="text-3xl" aria-hidden="true">{prod.logo}</span>
                  <div className="flex-1 min-w-0">
                    <h2 className="font-semibold text-lg text-[#1d1d1f]">{prod.name}</h2>
                    <p className="text-sm text-[#86868b] truncate">{prod.tagline}</p>
                  </div>
                  {isWinner && (
                    <span className="text-xs bg-[#0071E3] text-white px-2.5 py-1 rounded-full font-medium">Winner</span>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-2 text-sm mb-4">
                  <div className="bg-[#f5f5f7] rounded-xl p-2.5">
                    <div className="text-[#86868b] text-xs mb-0.5">License</div>
                    <div className="font-medium text-[#1d1d1f]">{prod.license}</div>
                  </div>
                  <div className="bg-[#f5f5f7] rounded-xl p-2.5">
                    <div className="text-[#86868b] text-xs mb-0.5">Difficulty</div>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${diffClass}`}>{prod.difficulty}</span>
                  </div>
                  <div className="bg-[#f5f5f7] rounded-xl p-2.5">
                    <div className="text-[#86868b] text-xs mb-0.5">Self-Hosted</div>
                    <div className="font-medium text-[#1d1d1f]">{prod.selfHosted ? 'Yes' : 'No'}</div>
                  </div>
                  <div className="bg-[#f5f5f7] rounded-xl p-2.5">
                    <div className="text-[#86868b] text-xs mb-0.5">Pricing</div>
                    <div className="font-medium text-[#1d1d1f]">{prod.pricing}</div>
                  </div>
                </div>

                <div className="flex gap-3 text-sm">
                  {prod.github && (
                    <a href={prod.github} target="_blank" rel="noopener noreferrer" className="text-[#0071E3] hover:underline">GitHub</a>
                  )}
                  <a href={prod.url} target="_blank" rel="noopener noreferrer" className="text-[#0071E3] hover:underline">Website</a>
                </div>
              </div>
            )
          })}
        </div>

        {/* Feature comparison table */}
        <div className="mb-8 bg-white rounded-2xl shadow-sm overflow-hidden">
          <div className="p-5 border-b border-[#e8e8ed]">
            <h2 className="text-xl font-semibold text-[#1d1d1f] tracking-tight">Feature Comparison</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm" aria-label={`Comparing ${data.productA.name} and ${data.productB.name}`}>
              <thead>
                <tr className="border-b border-[#e8e8ed]">
                  <th className="text-left py-3 px-5 font-medium text-[#86868b]">Feature</th>
                  <th className="text-center py-3 px-5 font-medium text-[#1d1d1f]">{data.productA.logo} {data.productA.name}</th>
                  <th className="text-center py-3 px-5 font-medium text-[#1d1d1f]">{data.productB.logo} {data.productB.name}</th>
                </tr>
              </thead>
              <tbody>
                {data.features.map((f, i) => (
                  <tr key={i} className={i % 2 === 0 ? 'bg-[#f5f5f7]/50' : ''}>
                    <td className="py-3 px-5 font-medium text-[#1d1d1f]">{f.name}</td>
                    <td className="text-center py-3 px-5"><FeatureValue v={f.a} /></td>
                    <td className="text-center py-3 px-5"><FeatureValue v={f.b} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Pros & Cons */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          {[
            { name: data.productA.name, logo: data.productA.logo, pros: data.prosA, cons: data.consA },
            { name: data.productB.name, logo: data.productB.logo, pros: data.prosB, cons: data.consB },
          ].map(({ name, logo, pros, cons }) => (
            <div key={name} className="bg-white rounded-2xl p-5 shadow-sm">
              <h2 className="text-base font-semibold text-[#1d1d1f] mb-4">{logo} {name}</h2>
              <div className="space-y-2.5 mb-4">
                {pros.map((p, i) => (
                  <div key={i} className="flex gap-2.5 text-sm">
                    <span className="text-[#30d158] shrink-0 mt-0.5">+</span>
                    <span className="text-[#1d1d1f]">{p}</span>
                  </div>
                ))}
              </div>
              <div className="space-y-2.5">
                {cons.map((c, i) => (
                  <div key={i} className="flex gap-2.5 text-sm">
                    <span className="text-red-500 shrink-0 mt-0.5">−</span>
                    <span className="text-[#86868b]">{c}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Winner + Docker Compose */}
        <div className="mb-8 bg-white rounded-2xl p-5 shadow-sm">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-xs bg-[#0071E3]/10 text-[#0071E3] px-2.5 py-0.5 rounded-full font-medium">
              Our Pick
            </span>
            <h2 className="text-xl font-semibold text-[#1d1d1f] tracking-tight">{winnerName}</h2>
          </div>
          <p className="text-[#86868b] leading-relaxed mb-4">{data.winnerReason}</p>

          {winnerProd.dockerCompose && (
            <div className="bg-[#1d1d1f] rounded-xl p-4">
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <div className="text-xs text-[#86868b] mb-2">Deploy {winnerProd.name} with Docker Compose</div>
                  <pre className="text-sm text-[#30d158] font-mono whitespace-pre-wrap break-all leading-relaxed">{winnerProd.dockerCompose}</pre>
                </div>
                <CopyButton text={winnerProd.dockerCompose} />
              </div>
            </div>
          )}
        </div>

        {/* FAQ */}
        <div className="mb-10">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-semibold text-[#1d1d1f] tracking-tight">Frequently Asked Questions</h2>
            <span className="text-xs text-[#86868b]">Last updated: June 2026</span>
          </div>
          <div className="space-y-3">
            {data.faq.map((item, i) => (
              <details key={i} className="group bg-white rounded-2xl shadow-sm overflow-hidden">
                <summary className="cursor-pointer p-5 text-base font-medium text-[#1d1d1f] group-open:text-[#0071E3] transition-colors">
                  {item.q}
                </summary>
                <div className="px-5 pb-5 text-base text-[#86868b] leading-relaxed">
                  {item.a}
                </div>
              </details>
            ))}
          </div>
        </div>

        {/* Related comparisons */}
        {relatedSlugs.length > 0 && (
          <div className="mb-10">
            <h2 className="text-xl font-semibold text-[#1d1d1f] tracking-tight mb-4">More Comparisons</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {relatedSlugs.map(rp => (
                <a
                  key={rp.slug}
                  href={`/compare/${rp.slug}/`}
                  className="bg-white rounded-2xl p-4 shadow-sm hover:shadow-md transition-shadow group"
                >
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-lg">{rp.productA.logo}</span>
                    <span className="text-[#86868b] text-sm">vs</span>
                    <span className="text-lg">{rp.productB.logo}</span>
                  </div>
                  <div className="font-medium text-[#1d1d1f] group-hover:text-[#0071E3] transition-colors text-sm">
                    {rp.productA.name} vs {rp.productB.name}
                  </div>
                </a>
              ))}
            </div>
          </div>
        )}

        {/* Cross-link to Alternatives hub pages featuring these products */}
        {uniqueAltLinks.length > 0 && (
          <div className="mb-10">
            <h2 className="text-xl font-semibold text-[#1d1d1f] tracking-tight mb-4">See All Self-Hosted Alternatives</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {uniqueAltLinks.map(link => (
                <a
                  key={link.slug}
                  href={`/alternatives/${link.slug}/`}
                  className="bg-white rounded-2xl p-4 shadow-sm hover:shadow-md transition-shadow group flex items-center justify-between"
                >
                  <div>
                    <div className="text-xs text-[#86868b]">All alternatives to</div>
                    <div className="font-medium text-[#1d1d1f] group-hover:text-[#0071E3] transition-colors">
                      {link.saasName}
                    </div>
                  </div>
                  <span className="text-[#86868b] group-hover:text-[#0071E3]">&rarr;</span>
                </a>
              ))}
            </div>
          </div>
        )}

        {/* Footer */}
        <footer className="border-t border-[#e8e8ed] pt-6 text-center text-sm text-[#86868b]">
          <p>Free side-by-side tool comparisons. No login required.</p>
          <p className="mt-2">
            <a href="/" className="text-[#0071E3] hover:underline">AI Cost Calculator</a>
            <span className="mx-1.5">&middot;</span>
            <a href="/cron-generator/" className="text-[#0071E3] hover:underline">Cron Generator</a>
            <span className="mx-1.5">&middot;</span>
            <a href="/alternatives/" className="text-[#0071E3] hover:underline">Self-Hosted Alternatives</a>
          </p>
        </footer>
      </main>
    </div>
  )
}
