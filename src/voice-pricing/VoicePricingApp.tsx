import { useState, useMemo } from 'react'
import { VOICE_PROVIDERS, FAQ_DATA } from './voice-data'
import { GlobalNav } from '../components/GlobalNav'

export default function VoicePricingApp() {
  const [charsPerMonth, setCharsPerMonth] = useState(1000000)

  const sorted = useMemo(() => {
    return [...VOICE_PROVIDERS].sort((a, b) => {
      const costA = (charsPerMonth / 1000000) * a.pricePerUnit
      const costB = (charsPerMonth / 1000000) * b.pricePerUnit
      return costA - costB
    })
  }, [charsPerMonth])

  const cheapest = sorted[0]

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      <GlobalNav current="/voice-agent-pricing/" />
      <nav className="border-b border-gray-200 dark:border-gray-800 px-4 py-3">
        <div className="max-w-5xl mx-auto flex items-center gap-3">
          <a href="/" className="text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">AI Dev Tools</a>
          <span className="text-gray-300 dark:text-gray-600">/</span>
          <span className="text-sm font-medium text-gray-900 dark:text-gray-100">Voice Agent Pricing</span>
        </div>
      </nav>

      <main className="max-w-5xl mx-auto px-4 py-8">
        <div className="mb-10">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-gray-100 mb-4">
            Voice AI Pricing Comparison
          </h1>
          <p className="text-gray-600 dark:text-gray-400 text-base md:text-lg leading-relaxed">
            Compare TTS (text-to-speech) API pricing across 6 providers. Calculate monthly costs for your voice agent based on character volume.
          </p>
        </div>

        {/* Calculator input */}
        <div className="mb-10 bg-gray-50 dark:bg-gray-800 rounded-xl p-6">
          <label className="block text-base font-medium text-gray-700 dark:text-gray-300 mb-3">
            Characters per month
          </label>
          <div className="flex items-center gap-4">
            <input
              type="number"
              value={charsPerMonth}
              onChange={e => setCharsPerMonth(Math.max(0, parseInt(e.target.value) || 0))}
              className="w-48 px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg text-base bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
            />
            <span className="text-sm text-gray-500 dark:text-gray-400">
              {charsPerMonth.toLocaleString()} chars ≈ {Math.round(charsPerMonth / 800)} min of speech ≈ {Math.round(charsPerMonth / 5000)} conversations
            </span>
          </div>
          <div className="flex gap-2 mt-4 flex-wrap">
            {[100000, 500000, 1000000, 5000000, 10000000].map(v => (
              <button
                key={v}
                onClick={() => setCharsPerMonth(v)}
                className={`text-sm px-4 py-2 rounded-full border transition-colors ${
                  charsPerMonth === v
                    ? 'bg-gray-900 text-white border-gray-900 dark:bg-gray-100 dark:text-gray-900'
                    : 'bg-white text-gray-600 border-gray-200 hover:border-gray-400 dark:bg-gray-700 dark:text-gray-400 dark:border-gray-600'
                }`}
              >
                {(v / 1000000).toFixed(v % 1000000 === 0 ? 0 : 1)}M
              </button>
            ))}
          </div>
        </div>

        {/* Comparison table */}
        <div className="overflow-x-auto mb-16">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-700">
                <th className="text-left py-3 px-5 font-medium text-gray-500 dark:text-gray-400">Provider</th>
                <th className="text-left py-3 px-5 font-medium text-gray-500 dark:text-gray-400">Price / 1M chars</th>
                <th className="text-left py-3 px-5 font-medium text-gray-500 dark:text-gray-400">Est. Monthly Cost</th>
                <th className="text-left py-3 px-5 font-medium text-gray-500 dark:text-gray-400">Free Tier</th>
                <th className="text-left py-3 px-5 font-medium text-gray-500 dark:text-gray-400 hidden md:table-cell">Voices</th>
              </tr>
            </thead>
            <tbody>
              {sorted.map((p) => {
                const monthlyCost = (charsPerMonth / 1000000) * p.pricePerUnit
                const isCheapest = p === cheapest
                return (
                  <tr key={p.name} className={`border-b border-gray-100 dark:border-gray-800 transition-colors ${isCheapest ? 'bg-green-50/80 dark:bg-green-900/20' : 'hover:bg-gray-50 dark:hover:bg-gray-800/50'}`}>
                    <td className="py-4 px-5">
                      <div className="font-medium text-gray-900 dark:text-gray-100">
                        {p.name}
                        {isCheapest && <span className="ml-2 text-xs bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 px-2.5 py-0.5 rounded-full font-medium">Best Value</span>}
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">{p.provider}</div>
                    </td>
                    <td className="py-4 px-5">
                      <span className="font-mono text-gray-900 dark:text-gray-100">
                        {p.pricePerUnit === 0 ? 'Free (preview)' : `$${p.pricePerUnit.toFixed(2)}`}
                      </span>
                    </td>
                    <td className="py-4 px-5">
                      <span className={`font-mono font-medium ${isCheapest ? 'text-green-700 dark:text-green-300' : 'text-gray-900 dark:text-gray-100'}`}>
                        {monthlyCost === 0 ? 'Free' : `$${monthlyCost.toFixed(2)}`}
                      </span>
                      {charsPerMonth > 1000000 && monthlyCost > 0 && (
                        <div className="text-sm text-gray-400 mt-0.5">${(monthlyCost / 12).toFixed(2)}/avg mo yearly</div>
                      )}
                    </td>
                    <td className="py-4 px-5 text-sm text-gray-600 dark:text-gray-400">
                      {p.freeTier}
                    </td>
                    <td className="py-4 px-5 text-sm text-gray-600 dark:text-gray-400 hidden md:table-cell">
                      {p.voices}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>

        {/* Feature comparison */}
        <div className="mb-16">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-8">Feature Comparison</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
            {VOICE_PROVIDERS.map(p => (
              <div key={p.name} className="border border-gray-200 dark:border-gray-700 rounded-xl p-5 hover:border-gray-300 dark:hover:border-gray-600 transition-colors">
                <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-3">{p.name}</h3>
                <div className="flex flex-wrap gap-1.5">
                  {p.features.map(f => (
                    <span key={f} className="text-xs bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 px-2.5 py-1 rounded-md">
                      {f}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* FAQ */}
        <div className="border-t border-gray-200 dark:border-gray-700 pt-10">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-8">FAQ</h2>
          <div className="space-y-4">
            {FAQ_DATA.map((faq, i) => (
              <details key={i} className="group border border-gray-200 dark:border-gray-700 rounded-xl">
                <summary className="cursor-pointer p-5 text-base font-medium text-gray-900 dark:text-gray-100">
                  {faq.q}
                </summary>
                <div className="px-5 pb-5 text-base text-gray-600 dark:text-gray-400 leading-relaxed">{faq.a}</div>
              </details>
            ))}
          </div>
        </div>

        <footer className="mt-16 border-t border-gray-200 dark:border-gray-700 pt-8 text-center text-sm text-gray-400">
          <p>Free Voice AI Pricing Comparison. No login required.</p>
          <p className="mt-2">
            <a href="/" className="text-blue-500 hover:underline">AI Cost Calculator</a>
            {' · '}
            <a href="/cron-generator/" className="text-blue-500 hover:underline">Cron Generator</a>
            {' · '}
            <a href="/alternatives/" className="text-blue-500 hover:underline">Self-Hosted Alternatives</a>
            {' · '}
            <a href="/agent-safety/" className="text-blue-500 hover:underline">Agent Safety Checklist</a>
          </p>
        </footer>
      </main>
    </div>
  )
}
