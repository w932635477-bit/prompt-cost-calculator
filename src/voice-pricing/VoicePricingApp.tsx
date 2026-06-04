import { useState, useMemo } from 'react'
import { VOICE_PROVIDERS, FAQ_DATA } from './voice-data'
import { GlobalNav } from '../components/GlobalNav'
import { RelatedTools } from '../components/RelatedTools'
import { FaqSchema } from '../components/FaqSchema'
import { SiteFooter } from '../components/SiteFooter'

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
    <div className="min-h-screen bg-[#f5f5f7]">
      <GlobalNav current="/voice-agent-pricing/" />

      <main className="max-w-[980px] mx-auto px-6 py-10">
        <div className="mb-10">
          <h1 className="text-3xl md:text-4xl font-semibold text-[#1d1d1f] tracking-tight mb-3">
            Voice AI Pricing Comparison
          </h1>
          <p className="text-[#86868b] text-lg leading-relaxed">
            Compare TTS (text-to-speech) API pricing across 6 providers. Calculate monthly costs for your voice agent based on character volume.
          </p>
        </div>

        {/* Calculator input */}
        <div className="mb-10 bg-white rounded-2xl p-6 shadow-sm">
          <label className="block text-sm font-medium text-[#1d1d1f] mb-3">
            Characters per month
          </label>
          <div className="flex items-center gap-4 flex-wrap">
            <input
              type="number"
              value={charsPerMonth}
              onChange={e => setCharsPerMonth(Math.max(0, parseInt(e.target.value) || 0))}
              className="w-48 px-4 py-2.5 bg-[#f5f5f7] rounded-lg text-base text-[#1d1d1f] outline-none focus:ring-2 focus:ring-[#0071E3]/30 transition-shadow font-mono"
            />
            <span className="text-sm text-[#86868b]">
              {charsPerMonth.toLocaleString()} chars &asymp; {Math.round(charsPerMonth / 800)} min of speech &asymp; {Math.round(charsPerMonth / 5000)} conversations
            </span>
          </div>
          <div className="flex gap-2 mt-4 flex-wrap">
            {[100000, 500000, 1000000, 5000000, 10000000].map(v => (
              <button
                key={v}
                onClick={() => setCharsPerMonth(v)}
                className={`text-sm px-4 py-2 rounded-full transition-all ${
                  charsPerMonth === v
                    ? 'bg-[#1d1d1f] text-white shadow-sm'
                    : 'bg-[#f5f5f7] text-[#86868b] hover:bg-[#e8e8ed]'
                }`}
              >
                {(v / 1000000).toFixed(v % 1000000 === 0 ? 0 : 1)}M
              </button>
            ))}
          </div>
        </div>

        {/* Comparison table */}
        <div className="mb-16 bg-white rounded-2xl shadow-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[#e8e8ed]">
                <th className="text-left py-4 px-6 font-medium text-[#86868b]">Provider</th>
                <th className="text-left py-4 px-6 font-medium text-[#86868b]">Price / 1M chars</th>
                <th className="text-left py-4 px-6 font-medium text-[#86868b]">Est. Monthly Cost</th>
                <th className="text-left py-4 px-6 font-medium text-[#86868b]">Free Tier</th>
                <th className="text-left py-4 px-6 font-medium text-[#86868b] hidden md:table-cell">Voices</th>
              </tr>
            </thead>
            <tbody>
              {sorted.map((p) => {
                const monthlyCost = (charsPerMonth / 1000000) * p.pricePerUnit
                const isCheapest = p === cheapest
                return (
                  <tr key={p.name} className={`border-b border-[#f5f5f7] last:border-0 transition-colors ${isCheapest ? 'bg-[#0071E3]/[0.04]' : 'hover:bg-[#f5f5f7]'}`}>
                    <td className="py-4 px-6">
                      <div className="font-medium text-[#1d1d1f]">
                        {p.name}
                        {isCheapest && <span className="ml-2 text-xs bg-[#0071E3]/10 text-[#0071E3] px-2.5 py-0.5 rounded-full font-medium">Best Value</span>}
                      </div>
                      <div className="text-sm text-[#86868b] mt-0.5">{p.provider}</div>
                    </td>
                    <td className="py-4 px-6">
                      <span className="font-mono text-[#1d1d1f]">
                        {p.pricePerUnit === 0 ? 'Free (preview)' : `$${p.pricePerUnit.toFixed(2)}`}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <span className={`font-mono font-medium ${isCheapest ? 'text-[#0071E3]' : 'text-[#1d1d1f]'}`}>
                        {monthlyCost === 0 ? 'Free' : `$${monthlyCost.toFixed(2)}`}
                      </span>
                      {charsPerMonth > 1000000 && monthlyCost > 0 && (
                        <div className="text-sm text-[#86868b] mt-0.5">${(monthlyCost / 12).toFixed(2)}/avg mo yearly</div>
                      )}
                    </td>
                    <td className="py-4 px-6 text-sm text-[#86868b]">
                      {p.freeTier}
                    </td>
                    <td className="py-4 px-6 text-sm text-[#86868b] hidden md:table-cell">
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
          <h2 className="text-2xl font-semibold text-[#1d1d1f] tracking-tight mb-6">Feature Comparison</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {VOICE_PROVIDERS.map(p => (
              <div key={p.name} className="bg-white rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow">
                <h3 className="font-semibold text-[#1d1d1f] mb-3">{p.name}</h3>
                <div className="flex flex-wrap gap-1.5">
                  {p.features.map(f => (
                    <span key={f} className="text-xs bg-[#f5f5f7] text-[#86868b] px-2.5 py-1 rounded-lg">
                      {f}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* FAQ */}
        <div className="mb-10">
          <h2 className="text-2xl font-semibold text-[#1d1d1f] tracking-tight mb-6">FAQ</h2>
          <div className="space-y-3">
            {FAQ_DATA.map((faq, i) => (
              <details key={i} className="group bg-white rounded-2xl shadow-sm overflow-hidden">
                <summary className="cursor-pointer p-5 text-base font-medium text-[#1d1d1f] group-open:text-[#0071E3] transition-colors">
                  {faq.q}
                </summary>
                <div className="px-5 pb-5 text-base text-[#86868b] leading-relaxed">{faq.a}</div>
              </details>
            ))}
          </div>
        </div>

        <RelatedTools currentPath="/voice-agent-pricing/" />
        <FaqSchema items={FAQ_DATA.map((f: { q: string; a: string }) => ({ question: f.q, answer: f.a }))} />
      </main>
      <SiteFooter />
    </div>
  )
}
