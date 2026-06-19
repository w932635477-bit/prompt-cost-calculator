import pricing from '../data/pricing.json'

const PROVIDER_ORDER = ['OpenAI', 'Anthropic', 'Google', 'DeepSeek', 'Groq', 'xAI', 'Zhipu', 'Moonshot']

function formatPrice(price: number): string {
  if (price < 0.01) return `$${price.toFixed(4)}`
  if (price < 1) return `$${price.toFixed(3)}`
  return `$${price.toFixed(2)}`
}

function formatContext(tokens: number): string {
  if (tokens >= 2000000) return `${(tokens / 1000000).toFixed(0)}M`
  if (tokens >= 1000000) return `${(tokens / 1000000).toFixed(1)}M`.replace('.0M', 'M')
  if (tokens >= 1000) return `${(tokens / 1000).toFixed(0)}K`
  return `${tokens}`
}

const providerModels = PROVIDER_ORDER.map(provider => {
  const models = pricing.models.filter(m => m.provider === provider)
  return { provider, models }
}).filter(g => g.models.length > 0)

export function StaticPricingTable() {
  return (
    <div className="bg-white rounded-3xl shadow-[0_2px_20px_rgba(0,0,0,0.06)] border border-[#e8e8ed] overflow-hidden">
      <div className="px-8 pt-8 pb-4">
        <h2 className="text-2xl font-semibold tracking-tight">
          LLM API Pricing Comparison
        </h2>
        <p className="text-sm text-[#86868b] mt-1">
          Current pricing from official API providers. All prices per 1M tokens.
        </p>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-t border-b border-[#e8e8ed] bg-[#f5f5f7]">
              <th className="text-left px-8 py-3 font-medium text-[#86868b]">Model</th>
              <th className="text-right px-4 py-3 font-medium text-[#86868b]">Input $/1M</th>
              <th className="text-right px-4 py-3 font-medium text-[#86868b]">Output $/1M</th>
              <th className="text-right px-4 py-3 font-medium text-[#86868b]">Context</th>
              <th className="text-left px-4 py-3 font-medium text-[#86868b] hidden md:table-cell">Best For</th>
            </tr>
          </thead>
          <tbody>
            {providerModels.map(({ provider, models }) => {
              const cheapestInput = Math.min(...models.map(m => m.inputPricePer1M))
              return models.map((m, i) => (
                <tr
                  key={m.id}
                  className={`border-b border-[#f0f0f5] hover:bg-[#f5f5f7] transition-colors ${
                    i === 0 ? 'border-t-2 border-t-[#e8e8ed]' : ''
                  }`}
                >
                  <td className="px-8 py-3">
                    <div className="flex items-center gap-2">
                      {i === 0 && (
                        <span className="text-xs font-medium text-[#86868b] bg-[#f5f5f7] rounded px-2 py-0.5 shrink-0">
                          {provider}
                        </span>
                      )}
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
                  <td className="text-right px-4 py-3 text-[#86868b]">
                    {formatContext(m.contextWindow)}
                  </td>
                  <td className="px-4 py-3 text-[#86868b] hidden md:table-cell">
                    {m.bestFor || '—'}
                  </td>
                </tr>
              ))
            })}
          </tbody>
        </table>
      </div>

      <div className="px-8 py-4 border-t border-[#e8e8ed] flex items-center justify-between">
        <p className="text-xs text-[#86868b]">
          Prices last verified: May 30, 2026. Source: official provider pricing pages.
        </p>
        <p className="text-xs text-[#86868b]">
          {pricing.models.length} models across {providerModels.length} providers
        </p>
      </div>
    </div>
  )
}
