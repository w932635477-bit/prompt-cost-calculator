// src/llm-pricing/components/ProviderFilter.tsx

const PROVIDER_ORDER = ['OpenAI', 'Anthropic', 'Google', 'DeepSeek', 'Groq', 'xAI', 'Zhipu', 'Moonshot'] as const

export type Provider = (typeof PROVIDER_ORDER)[number]

interface Props {
  selected: Set<Provider>
  onToggle: (provider: Provider) => void
  availableProviders: Provider[]
}

const PROVIDER_COLORS: Record<string, string> = {
  OpenAI: 'bg-[#10a37f] text-white',
  Anthropic: 'bg-[#d4a574] text-white',
  Google: 'bg-[#4285f4] text-white',
  DeepSeek: 'bg-[#4a90d9] text-white',
  Groq: 'bg-[#f55036] text-white',
  xAI: 'bg-[#111827] text-white',
  Zhipu: 'bg-[#7c3aed] text-white',
  Moonshot: 'bg-[#db2777] text-white',
}

const PROVIDER_COLORS_OFF: Record<string, string> = {
  OpenAI: 'bg-[#f0fdf4] text-[#10a37f] border-[#10a37f]',
  Anthropic: 'bg-[#fef7f0] text-[#d4a574] border-[#d4a574]',
  Google: 'bg-[#eff6ff] text-[#4285f4] border-[#4285f4]',
  DeepSeek: 'bg-[#eff6ff] text-[#4a90d9] border-[#4a90d9]',
  Groq: 'bg-[#fef2f2] text-[#f55036] border-[#f55036]',
  xAI: 'bg-[#f5f5f5] text-[#111827] border-[#111827]',
  Zhipu: 'bg-[#f5f3ff] text-[#7c3aed] border-[#7c3aed]',
  Moonshot: 'bg-[#fdf2f8] text-[#db2777] border-[#db2777]',
}

export default function ProviderFilter({ selected, onToggle, availableProviders }: Props) {
  return (
    <div className="flex flex-wrap gap-2" data-testid="provider-filter">
      {availableProviders.map(provider => {
        const isActive = selected.has(provider)
        return (
          <button
            key={provider}
            type="button"
            onClick={() => onToggle(provider)}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
              isActive
                ? PROVIDER_COLORS[provider] ?? 'bg-[#1d1d1f] text-white'
                : `border ${PROVIDER_COLORS_OFF[provider] ?? 'bg-[#f5f5f7] text-[#86868b] border-[#e8e8ed]'}`
            }`}
          >
            {provider}
          </button>
        )
      })}
    </div>
  )
}
