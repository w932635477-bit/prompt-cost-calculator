// src/llm-pricing/components/SortablePricingTable.tsx

import { useState, useMemo } from 'react'
import type { ModelPricing } from '../../lib/types'

type SortField = 'name' | 'inputPrice' | 'outputPrice' | 'cachedPrice' | 'context'
type SortDir = 'asc' | 'desc'

interface Props {
  models: ModelPricing[]
}

function formatPrice(price: number | undefined): string {
  if (price === undefined) return '—'
  if (price < 0.01) return `$${price.toFixed(4)}`
  if (price < 1) return `$${price.toFixed(3)}`
  return `$${price.toFixed(2)}`
}

function formatContext(tokens: number): string {
  if (tokens >= 1_000_000) return `${(tokens / 1_000_000).toFixed(0)}M`
  if (tokens >= 1000) return `${(tokens / 1000).toFixed(0)}K`
  return `${tokens}`
}

const HEADER_LABELS: Record<SortField, string> = {
  name: 'Model',
  inputPrice: 'Input $/1M',
  outputPrice: 'Output $/1M',
  cachedPrice: 'Cached $/1M',
  context: 'Context',
}

export default function SortablePricingTable({ models }: Props) {
  const [sortField, setSortField] = useState<SortField>('inputPrice')
  const [sortDir, setSortDir] = useState<SortDir>('asc')

  const toggleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDir(d => (d === 'asc' ? 'desc' : 'asc'))
    } else {
      setSortField(field)
      setSortDir('asc')
    }
  }

  const sorted = useMemo(() => {
    const copy = [...models]
    copy.sort((a, b) => {
      let va: number | string = 0
      let vb: number | string = 0
      switch (sortField) {
        case 'name':
          va = a.name
          vb = b.name
          break
        case 'inputPrice':
          va = a.inputPricePer1M
          vb = b.inputPricePer1M
          break
        case 'outputPrice':
          va = a.outputPricePer1M
          vb = b.outputPricePer1M
          break
        case 'cachedPrice':
          va = a.cachedInputPricePer1M ?? Infinity
          vb = b.cachedInputPricePer1M ?? Infinity
          break
        case 'context':
          va = a.contextWindow
          vb = b.contextWindow
          break
      }
      if (typeof va === 'string' && typeof vb === 'string') {
        return sortDir === 'asc' ? va.localeCompare(vb) : vb.localeCompare(va)
      }
      return sortDir === 'asc' ? (va as number) - (vb as number) : (vb as number) - (va as number)
    })
    return copy
  }, [models, sortField, sortDir])

  // Find cheapest input for highlighting
  const cheapestInput = useMemo(
    () => Math.min(...models.map(m => m.inputPricePer1M)),
    [models]
  )

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm" data-testid="pricing-table">
        <thead>
          <tr className="border-b border-[#e8e8ed] bg-[#fbfbfd]">
            {(Object.keys(HEADER_LABELS) as SortField[]).map(field => (
              <th
                key={field}
                className={`px-4 py-3 font-medium text-[#86868b] cursor-pointer select-none hover:text-[#1d1d1f] transition-colors ${
                  field === 'name' ? 'text-left' : 'text-right'
                }`}
                onClick={() => toggleSort(field)}
              >
                <span className="inline-flex items-center gap-1">
                  {HEADER_LABELS[field]}
                  {sortField === field && (
                    <span className="text-[10px]">{sortDir === 'asc' ? '▲' : '▼'}</span>
                  )}
                </span>
              </th>
            ))}
            <th className="text-left px-4 py-3 font-medium text-[#86868b] hidden md:table-cell">
              Best For
            </th>
          </tr>
        </thead>
        <tbody>
          {sorted.map(m => (
            <tr
              key={m.id}
              className="border-b border-[#f0f0f5] hover:bg-[#fbfbfd] transition-colors"
            >
              <td className="px-4 py-3">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-medium text-[#86868b] bg-[#f5f5f7] rounded px-2 py-0.5 shrink-0">
                    {m.provider}
                  </span>
                  <span className="font-medium text-[#1d1d1f]">{m.name}</span>
                  {m.inputPricePer1M === cheapestInput && (
                    <span className="text-xs font-medium text-[#10a37f] bg-[#f0fdf4] rounded-full px-2 py-0.5">
                      Cheapest
                    </span>
                  )}
                </div>
              </td>
              <td className="text-right px-4 py-3 font-mono text-[#1d1d1f]">
                {formatPrice(m.inputPricePer1M)}
              </td>
              <td className="text-right px-4 py-3 font-mono text-[#1d1d1f]">
                {formatPrice(m.outputPricePer1M)}
              </td>
              <td className="text-right px-4 py-3 font-mono text-[#1d1d1f]">
                {formatPrice(m.cachedInputPricePer1M)}
              </td>
              <td className="text-right px-4 py-3 text-[#86868b]">
                {formatContext(m.contextWindow)}
              </td>
              <td className="px-4 py-3 text-[#86868b] hidden md:table-cell">
                {m.bestFor || '—'}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
