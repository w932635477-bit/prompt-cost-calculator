import type { AlternativePage } from './seo/alternatives-data'

function getSeoData(): AlternativePage | null {
  const el = document.getElementById('seo-data')
  if (!el) return null
  try { return JSON.parse(el.textContent || '{}') } catch { return null }
}

const DIFFICULTY_COLORS: Record<string, string> = {
  Easy: 'bg-green-100 text-green-700 border-green-200',
  Medium: 'bg-yellow-100 text-yellow-700 border-yellow-200',
  Hard: 'bg-red-100 text-red-700 border-red-200',
}

export default function LongTailAltPage() {
  const data = getSeoData()
  if (!data) return <div className="p-8 text-center text-gray-500">Loading...</div>

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <nav className="text-sm text-gray-500 mb-2">
            <a href="/alternatives/" className="hover:text-blue-600">Self-Hosted Alternatives</a>
            <span className="mx-2">/</span>
            <span className="text-gray-700">{data.saasName}</span>
          </nav>
          <h1 className="text-3xl font-bold text-gray-900">{data.h1}</h1>
          <p className="text-gray-600 mt-2 text-lg">{data.description}</p>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8">
        {/* Introduction */}
        <section className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-3">Why Switch from {data.saasName}?</h2>
          <p className="text-gray-700 leading-relaxed">{data.explanation}</p>
        </section>

        {/* Comparison cards */}
        <section className="space-y-4 mb-8">
          <h2 className="text-2xl font-bold text-gray-900">Top {data.saasName} Alternatives</h2>
          {data.alternatives.map(alt => (
            <div key={alt.name} className="bg-white rounded-xl border border-gray-200 p-6">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="text-xl font-semibold text-gray-900">{alt.name}</h3>
                  <p className="text-gray-600 mt-1">{alt.description}</p>
                </div>
                <span className={`px-2.5 py-1 rounded-full text-xs font-medium border ${DIFFICULTY_COLORS[alt.difficulty]}`}>
                  {alt.difficulty}
                </span>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4 text-sm">
                <div className="bg-gray-50 rounded-lg p-3">
                  <div className="text-gray-500">License</div>
                  <div className="font-medium text-gray-900">{alt.license}</div>
                </div>
                <div className="bg-gray-50 rounded-lg p-3">
                  <div className="text-gray-500">Docker</div>
                  <div className="font-medium text-gray-900">{alt.docker ? '✅ Yes' : '❌ No'}</div>
                </div>
                <div className="bg-gray-50 rounded-lg p-3">
                  <div className="text-gray-500">Source Code</div>
                  <div className="font-medium">
                    {alt.github ? (
                      <a href={alt.github} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">GitHub</a>
                    ) : (
                      <span className="text-gray-400">Proprietary</span>
                    )}
                  </div>
                </div>
                <div className="bg-gray-50 rounded-lg p-3">
                  <div className="text-gray-500">Website</div>
                  <div className="font-medium">
                    <a href={alt.url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                      {new URL(alt.url).hostname}
                    </a>
                  </div>
                </div>
              </div>

              {/* Features */}
              <div className="mb-4">
                <div className="text-sm text-gray-500 mb-2">Key Features</div>
                <div className="flex flex-wrap gap-1.5">
                  {alt.features.map(f => (
                    <span key={f} className="text-xs bg-blue-50 text-blue-700 border border-blue-200 px-2 py-1 rounded-full">{f}</span>
                  ))}
                </div>
              </div>

              {/* Docker quick start */}
              {alt.dockerCommand && (
                <div className="bg-gray-900 rounded-lg p-4">
                  <div className="text-xs text-gray-400 mb-2">Quick Start (Docker)</div>
                  <code className="text-sm text-green-400 font-mono break-all">{alt.dockerCommand}</code>
                </div>
              )}
            </div>
          ))}
        </section>

        {/* Comparison table */}
        <section className="bg-white rounded-xl border border-gray-200 p-6 mb-8 overflow-x-auto">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Feature Comparison</h2>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-2 px-3 text-gray-600 font-medium">Feature</th>
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
                {data.alternatives.map(alt => (
                  <td key={alt.name} className="text-center py-2 px-3">
                    <span className={`px-2 py-0.5 rounded-full text-xs ${DIFFICULTY_COLORS[alt.difficulty]}`}>{alt.difficulty}</span>
                  </td>
                ))}
              </tr>
              <tr className="border-b border-gray-100">
                <td className="py-2 px-3 text-gray-600">Docker Support</td>
                {data.alternatives.map(alt => (
                  <td key={alt.name} className="text-center py-2 px-3">{alt.docker ? '✅' : '❌'}</td>
                ))}
              </tr>
              {data.alternatives[0]?.features.slice(0, 5).map(feature => (
                <tr key={feature} className="border-b border-gray-100">
                  <td className="py-2 px-3 text-gray-600">{feature}</td>
                  {data.alternatives.map(alt => (
                    <td key={alt.name} className="text-center py-2 px-3">
                      {alt.features.includes(feature) ? '✅' : '—'}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </section>

        {/* FAQ */}
        <section className="bg-white rounded-xl border border-gray-200 p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Frequently Asked Questions</h2>
          <div className="space-y-4">
            {data.faq.map((item, i) => (
              <div key={i}>
                <h3 className="font-medium text-gray-900">{item.q}</h3>
                <p className="text-gray-600 mt-1">{item.a}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Back links */}
        <div className="text-center">
          <a href="/alternatives/" className="text-blue-600 hover:underline">&larr; Browse all self-hosted alternatives</a>
          <span className="mx-4 text-gray-300">|</span>
          <a href="/" className="text-blue-600 hover:underline">AI Cost Calculator</a>
        </div>
      </main>
    </div>
  )
}
