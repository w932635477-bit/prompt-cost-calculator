// PriceChurn.tsx — Provider price volatility and historical trends
import { useMemo } from 'react'
import pricingData from '../data/pricing.json'
import priceHistory from '../data/price-history.json'
import type { ModelPricing } from '../lib/types'

interface HistoryEntry {
  date: string
  inputPricePer1M: number
  outputPricePer1M: number
  note: string
}

interface ModelHistory {
  modelId: string
  modelName: string
  provider: string
  history: HistoryEntry[]
}

const models = pricingData.models as ModelPricing[]
const entries = priceHistory.entries as ModelHistory[]

const PROVIDER_COLORS: Record<string, string> = {
  'OpenAI': '#10a37f',
  'Anthropic': '#d97757',
  'Google': '#4285f4',
  'DeepSeek': '#5b6ef7',
  'Groq': '#f97316',
}

interface ModelChange {
  modelName: string
  provider: string
  launchInput: number
  launchOutput: number
  currentInput: number
  currentOutput: number
  inputChangePct: number
  outputChangePct: number
  trend: 'down' | 'stable' | 'up' | 'replaced'
  note: string
}

interface ProviderVolatility {
  provider: string
  avgInputChange: number
  avgOutputChange: number
  trend: string
  modelCount: number
  notableChange: string
}

function computeModelChanges(): ModelChange[] {
  return entries.map(entry => {
    const first = entry.history[0]
    const last = entry.history[entry.history.length - 1]
    const currentModel = models.find(m => m.id === entry.modelId)
    const currentInput = currentModel?.inputPricePer1M ?? last.inputPricePer1M
    const currentOutput = currentModel?.outputPricePer1M ?? last.outputPricePer1M

    const inputChangePct = first.inputPricePer1M > 0
      ? Math.round(((currentInput - first.inputPricePer1M) / first.inputPricePer1M) * 100)
      : 0
    const outputChangePct = first.outputPricePer1M > 0
      ? Math.round(((currentOutput - first.outputPricePer1M) / first.outputPricePer1M) * 100)
      : 0

    let trend: ModelChange['trend']
    if (inputChangePct < -15) trend = 'down'
    else if (inputChangePct > 5) trend = 'up'
    else if (entry.modelId === 'claude-3-opus-20240229') trend = 'replaced'
    else trend = 'stable'

    return {
      modelName: entry.modelName,
      provider: entry.provider,
      launchInput: first.inputPricePer1M,
      launchOutput: first.outputPricePer1M,
      currentInput,
      currentOutput,
      inputChangePct,
      outputChangePct,
      trend,
      note: entry.history[entry.history.length - 1].note,
    }
  })
}

function computeProviderVolatility(changes: ModelChange[]): ProviderVolatility[] {
  const providers = [...new Set(changes.map(c => c.provider))]
  return providers.map(provider => {
    const providerChanges = changes.filter(c => c.provider === provider)
    const avgInputChange = Math.round(
      providerChanges.reduce((sum, c) => sum + c.inputChangePct, 0) / providerChanges.length
    )
    const avgOutputChange = Math.round(
      providerChanges.reduce((sum, c) => sum + c.outputChangePct, 0) / providerChanges.length
    )

    const trend = avgInputChange < -10 ? 'Prices falling ↓'
      : avgInputChange > 10 ? 'Prices rising ↑'
      : 'Stable →'

    const notable = providerChanges
      .filter(c => c.trend === 'down' || c.trend === 'replaced')
      .map(c => `${c.modelName} ${c.inputChangePct}%`)
      .join(', ') || 'No major changes'

    return {
      provider,
      avgInputChange,
      avgOutputChange,
      trend,
      modelCount: providerChanges.length,
      notableChange: notable,
    }
  })
}

function TrendBadge({ trend }: { trend: ModelChange['trend'] }) {
  const styles: Record<string, string> = {
    down: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    stable: 'bg-gray-50 text-gray-600 border-gray-200',
    up: 'bg-amber-50 text-amber-700 border-amber-200',
    replaced: 'bg-blue-50 text-blue-700 border-blue-200',
  }
  const labels: Record<string, string> = {
    down: '↓ Cheaper',
    stable: '→ Stable',
    up: '↑ Pricier',
    replaced: '🔄 Replaced',
  }
  return (
    <span className={`text-[11px] font-medium px-2 py-0.5 rounded-full border ${styles[trend]}`}>
      {labels[trend]}
    </span>
  )
}

function formatPct(pct: number): string {
  if (pct === 0) return '0%'
  const sign = pct > 0 ? '+' : ''
  return `${sign}${pct}%`
}

export function PriceChurn() {
  const modelChanges = useMemo(() => computeModelChanges(), [])
  const providerVolatility = useMemo(() => computeProviderVolatility(modelChanges), [modelChanges])

  const sortedByChange = [...modelChanges].sort((a, b) => a.inputChangePct - b.inputChangePct)

  return (
    <section className="mb-16 space-y-6">
      {/* Price Change Timeline */}
      <div className="bg-white rounded-3xl shadow-[0_2px_20px_rgba(0,0,0,0.06)] border border-[#e8e8ed] overflow-hidden">
        <div className="px-8 pt-8 pb-4">
          <h2 className="text-2xl font-semibold tracking-tight">
            AI Model Price Change History
          </h2>
          <p className="text-sm text-[#86868b] mt-1">
            How major model prices have evolved since launch. Data from official provider pricing pages.
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-t border-b border-[#e8e8ed] bg-[#f5f5f7]">
                <th className="text-left px-8 py-3 font-medium text-[#86868b]">Model</th>
                <th className="text-right px-4 py-3 font-medium text-[#86868b]">Launch Input $/1M</th>
                <th className="text-right px-4 py-3 font-medium text-[#86868b]">Current Input $/1M</th>
                <th className="text-right px-4 py-3 font-medium text-[#86868b]">Change</th>
                <th className="text-left px-4 py-3 font-medium text-[#86868b] hidden md:table-cell">Trend</th>
                <th className="text-left px-4 py-3 font-medium text-[#86868b] hidden lg:table-cell">Notes</th>
              </tr>
            </thead>
            <tbody>
              {sortedByChange.map((change) => (
                <tr
                  key={change.modelName}
                  className="border-b border-[#f0f0f5] hover:bg-[#f5f5f7] transition-colors"
                >
                  <td className="px-8 py-3.5">
                    <div className="flex items-center gap-2">
                      <span
                        className="w-2 h-2 rounded-full shrink-0"
                        style={{ backgroundColor: PROVIDER_COLORS[change.provider] || '#86868b' }}
                      />
                      <span className="font-medium text-[#1d1d1f]">{change.modelName}</span>
                      <span className="text-xs text-[#86868b]">{change.provider}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3.5 text-right tabular-nums text-[#86868b]">
                    ${change.launchInput.toFixed(2)}
                  </td>
                  <td className="px-4 py-3.5 text-right tabular-nums font-medium text-[#1d1d1f]">
                    ${change.currentInput.toFixed(2)}
                  </td>
                  <td className={`px-4 py-3.5 text-right tabular-nums font-semibold ${
                    change.inputChangePct < 0 ? 'text-[#34c759]' :
                    change.inputChangePct > 0 ? 'text-[#92400e]' :
                    'text-[#86868b]'
                  }`}>
                    {formatPct(change.inputChangePct)}
                  </td>
                  <td className="px-4 py-3.5 hidden md:table-cell">
                    <TrendBadge trend={change.trend} />
                  </td>
                  <td className="px-4 py-3.5 text-xs text-[#86868b] hidden lg:table-cell max-w-[200px] truncate">
                    {change.note}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="px-8 py-4 border-t border-[#e8e8ed]">
          <p className="text-xs text-[#86868b]">
            Key takeaway: AI model prices have dropped 30-67% since 2024 for most models.
            OpenAI and Google compete aggressively on price; Anthropic maintains premium positioning
            while introducing cheaper tiers (Opus 4.8 at 67% less than Opus 3).
            DeepSeek's entry at $0.14/1M input reset the floor for budget-conscious developers.
          </p>
        </div>
      </div>

      {/* Provider Volatility Cards */}
      <div className="bg-white rounded-3xl shadow-[0_2px_20px_rgba(0,0,0,0.06)] border border-[#e8e8ed] p-8">
        <h2 className="text-2xl font-semibold tracking-tight mb-1">
          Provider Price Volatility
        </h2>
        <p className="text-sm text-[#86868b] mb-6">
          Which providers change prices most often? A quick volatility snapshot.
        </p>

        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {providerVolatility.map((pv) => (
            <div
              key={pv.provider}
              className="p-4 rounded-2xl border border-[#e8e8ed] hover:shadow-sm transition-shadow"
            >
              <div className="flex items-center gap-2 mb-3">
                <span
                  className="w-2.5 h-2.5 rounded-full shrink-0"
                  style={{ backgroundColor: PROVIDER_COLORS[pv.provider] || '#86868b' }}
                />
                <span className="text-sm font-semibold text-[#1d1d1f]">{pv.provider}</span>
              </div>
              <div className="space-y-1.5">
                <div>
                  <span className="text-xs text-[#86868b]">Avg Input Change</span>
                  <div className={`text-lg font-bold tabular-nums ${
                    pv.avgInputChange < 0 ? 'text-[#34c759]' :
                    pv.avgInputChange > 0 ? 'text-[#92400e]' :
                    'text-[#86868b]'
                  }`}>
                    {formatPct(pv.avgInputChange)}
                  </div>
                </div>
                <div className="text-xs text-[#86868b]">{pv.trend}</div>
                <div className="text-[11px] text-[#86868b] leading-snug mt-2">
                  {pv.notableChange}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
