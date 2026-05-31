// src/llm-pricing/components/CostCalculator.tsx

import { useState, useMemo } from 'react'
import type { ModelPricing } from '../../lib/types'
import { projectMonthlyCost, formatCost } from '../calc'

interface Props {
  models: ModelPricing[]
}

export default function CostCalculator({ models }: Props) {
  const [inputTokens, setInputTokens] = useState(1000)
  const [outputTokens, setOutputTokens] = useState(500)
  const [callsPerDay, setCallsPerDay] = useState(3333)
  const [cacheHitRate, setCacheHitRate] = useState(0.5)

  const params = { inputTokens, outputTokens, callsPerDay, cacheHitRate, daysPerMonth: 30 }

  const results = useMemo(
    () =>
      models.map(m => ({ model: m, cost: projectMonthlyCost(m, params) })),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [models, inputTokens, outputTokens, callsPerDay, cacheHitRate]
  )

  const sorted = useMemo(
    () => [...results].sort((a, b) => a.cost.monthlyCost - b.cost.monthlyCost),
    [results]
  )

  const maxCost = useMemo(
    () => Math.max(...sorted.map(r => r.cost.monthlyCost), 0.01),
    [sorted]
  )

  return (
    <div className="grid lg:grid-cols-[1fr_1fr] gap-6" data-testid="cost-calculator">
      {/* Inputs */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-[#1d1d1f]">Monthly Cost Projection</h3>
        <div>
          <label className="block text-sm text-[#86868b] mb-1">Input tokens per call</label>
          <input
            type="number" value={inputTokens}
            onChange={e => setInputTokens(Math.max(1, Number(e.target.value)))}
            className="w-full px-3 py-2 rounded-lg border border-[#e8e8ed] bg-white text-[#1d1d1f] focus:outline-none focus:ring-2 focus:ring-[#0071e3]"
            min={1}
          />
        </div>
        <div>
          <label className="block text-sm text-[#86868b] mb-1">Output tokens per call</label>
          <input
            type="number" value={outputTokens}
            onChange={e => setOutputTokens(Math.max(1, Number(e.target.value)))}
            className="w-full px-3 py-2 rounded-lg border border-[#e8e8ed] bg-white text-[#1d1d1f] focus:outline-none focus:ring-2 focus:ring-[#0071e3]"
            min={1}
          />
        </div>
        <div>
          <label className="block text-sm text-[#86868b] mb-1">Calls per day</label>
          <input
            type="number" value={callsPerDay}
            onChange={e => setCallsPerDay(Math.max(1, Number(e.target.value)))}
            className="w-full px-3 py-2 rounded-lg border border-[#e8e8ed] bg-white text-[#1d1d1f] focus:outline-none focus:ring-2 focus:ring-[#0071e3]"
            min={1}
          />
        </div>
        <div>
          <label className="block text-sm text-[#86868b] mb-1">
            Cache hit rate: {Math.round(cacheHitRate * 100)}%
          </label>
          <input
            type="range" min={0} max={100} value={cacheHitRate * 100}
            onChange={e => setCacheHitRate(Number(e.target.value) / 100)}
            className="w-full accent-[#0071e3]"
          />
        </div>
      </div>

      {/* Results */}
      <div className="space-y-2">
        <h3 className="text-lg font-semibold text-[#1d1d1f]">Estimated Monthly Cost</h3>
        <div className="space-y-2 max-h-[400px] overflow-y-auto pr-1">
          {sorted.map((r, i) => (
            <div
              key={r.model.id}
              className={`flex items-center gap-3 p-2 rounded-lg ${
                i === 0 ? 'bg-[#f0fdf4] ring-1 ring-[#10a37f]' : 'bg-white'
              }`}
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  {i === 0 && <span className="text-[10px] font-bold text-[#10a37f]">★</span>}
                  <span className="text-sm font-medium text-[#1d1d1f] truncate">{r.model.name}</span>
                </div>
                <div className="mt-1 h-2 bg-[#f5f5f7] rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full bg-[#0071e3] transition-all"
                    style={{ width: `${Math.max((r.cost.monthlyCost / maxCost) * 100, 2)}%` }}
                  />
                </div>
              </div>
              <div className="text-right shrink-0">
                <span className="text-sm font-mono font-medium text-[#1d1d1f]">
                  {formatCost(r.cost.monthlyCost)}<span className="text-[#86868b] text-xs">/mo</span>
                </span>
                {r.cost.cacheSavings > 0 && (
                  <div className="text-[10px] text-[#30d158]">save {formatCost(r.cost.cacheSavings)}</div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
