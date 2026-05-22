import { useState } from 'react'
import type { ModelCostResult, SortField, SortDirection } from '../lib/types'
import { formatCost } from '../lib/calculator'

interface Props {
  results: ModelCostResult[]
}

const PROVIDER_COLORS: Record<string, string> = {
  'OpenAI': 'bg-emerald-50 text-emerald-700',
  'Anthropic': 'bg-orange-50 text-orange-700',
  'Google': 'bg-blue-50 text-blue-700',
  'Groq': 'bg-purple-50 text-purple-700',
  'DeepSeek': 'bg-cyan-50 text-cyan-700',
}

export function ComparisonTable({ results }: Props) {
  const [sortField, setSortField] = useState<SortField>('totalCostPerCall')
  const [sortDir, setSortDir] = useState<SortDirection>('asc')

  if (results.length === 0) return null

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDir(sortDir === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortDir('asc')
    }
  }

  const sorted = [...results].sort((a, b) => {
    let aVal: string | number
    let bVal: string | number
    if (sortField === 'name') {
      aVal = a.model.name
      bVal = b.model.name
    } else {
      aVal = a[sortField]
      bVal = b[sortField]
    }
    if (typeof aVal === 'string' && typeof bVal === 'string') {
      return sortDir === 'asc' ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal)
    }
    return sortDir === 'asc' ? (aVal as number) - (bVal as number) : (bVal as number) - (aVal as number)
  })

  const cheapest = results.reduce((a, b) => a.totalCostPerCall < b.totalCostPerCall ? a : b)
  const mostExpensive = results.reduce((a, b) => a.totalCostPerCall > b.totalCostPerCall ? a : b)

  const SortableHeader = ({ field, label, align = 'right' }: { field: SortField; label: string; align?: 'left' | 'right' }) => (
    <th
      className={`px-5 py-4 ${align === 'left' ? 'text-left' : 'text-right'} text-xs font-semibold text-[#86868b] uppercase tracking-wider cursor-pointer hover:text-[#1d1d1f] transition-colors`}
      onClick={() => handleSort(field)}
    >
      <span className="inline-flex items-center gap-1">
        {label}
        {sortField === field && (
          <span className="text-[#0071E3]">{sortDir === 'asc' ? '↑' : '↓'}</span>
        )}
      </span>
    </th>
  )

  return (
    <div className="w-full space-y-4">
      {mostExpensive.totalCostPerCall > 0 && cheapest.model.id !== mostExpensive.model.id && (
        <div className="flex items-center gap-3 p-4 bg-gradient-to-r from-emerald-50 to-teal-50 rounded-2xl border border-emerald-100">
          <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 flex-shrink-0">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M8 1L2 5V11L8 15L14 11V5L8 1Z" stroke="currentColor" strokeWidth="1.5" fill="none"/>
            </svg>
          </div>
          <p className="text-sm text-emerald-800">
            Switch from <strong>{mostExpensive.model.name}</strong> to <strong>{cheapest.model.name}</strong> and save{' '}
            <strong>{Math.round(((mostExpensive.totalCostPerCall - cheapest.totalCostPerCall) / mostExpensive.totalCostPerCall) * 100)}%</strong>
          </p>
        </div>
      )}

      <div className="overflow-x-auto rounded-2xl border border-[#e8e8ed]">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-[#fbfbfd]">
              <SortableHeader field="name" label="Model" align="left" />
              <SortableHeader field="tokenCount" label="Tokens" />
              <SortableHeader field="inputCost" label="Input" />
              <SortableHeader field="outputCost" label="Output" />
              <SortableHeader field="totalCostPerCall" label="Per Call" />
              <SortableHeader field="monthlyCost" label="Monthly" />
            </tr>
          </thead>
          <tbody>
            {sorted.map((result) => (
              <tr
                key={result.model.id}
                className={`border-t border-[#e8e8ed] transition-colors ${
                  result.isBestValue
                    ? 'bg-emerald-50/40'
                    : 'hover:bg-[#fbfbfd]'
                }`}
              >
                <td className="px-5 py-4">
                  <div className="flex items-center gap-2.5">
                    <span className={`text-[11px] font-medium px-2 py-0.5 rounded-md ${PROVIDER_COLORS[result.model.provider] || 'bg-gray-100 text-gray-600'}`}>
                      {result.model.provider}
                    </span>
                    <span className="font-medium text-[#1d1d1f]">{result.model.name}</span>
                    {result.isBestValue && (
                      <span className="text-[11px] bg-emerald-500 text-white px-2 py-0.5 rounded-md font-semibold">
                        Best Value
                      </span>
                    )}
                  </div>
                </td>
                <td className="px-5 py-4 text-right text-[#86868b] tabular-nums">
                  {result.tokenCount.toLocaleString()}
                </td>
                <td className="px-5 py-4 text-right text-[#86868b] tabular-nums">
                  {formatCost(result.inputCost)}
                </td>
                <td className="px-5 py-4 text-right text-[#86868b] tabular-nums">
                  {formatCost(result.outputCost)}
                </td>
                <td className="px-5 py-4 text-right font-medium text-[#1d1d1f] tabular-nums">
                  {formatCost(result.totalCostPerCall)}
                </td>
                <td className="px-5 py-4 text-right font-semibold text-[#1d1d1f] tabular-nums">
                  {formatCost(result.monthlyCost)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p className="text-xs text-[#86868b] text-center">
        Pricing data updated {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}.
        Token counts for OpenAI models are exact (tiktoken). Others are estimates (~4 chars/token).
      </p>
    </div>
  )
}
