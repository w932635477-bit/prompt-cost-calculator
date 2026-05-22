import { useState } from 'react'
import { parseNaturalLanguage, getSuggestions } from '../lib/nl-parser'
import { useT } from '../i18n'

interface NaturalInputProps {
  onCronGenerated: (cron: string) => void
}

export function NaturalInput({ onCronGenerated }: NaturalInputProps) {
  const t = useT()
  const [input, setInput] = useState('')
  const [suggestions, setSuggestions] = useState(getSuggestions('', 5))

  const handleInput = (value: string) => {
    setInput(value)
    if (value.trim()) {
      setSuggestions(getSuggestions(value, 5))
    } else {
      setSuggestions(getSuggestions('', 5))
    }
  }

  const handleSubmit = () => {
    const result = parseNaturalLanguage(input)
    if (result) {
      onCronGenerated(result.cron)
      setInput(result.description)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      handleSubmit()
    }
  }

  const handleSuggestionClick = (pattern: ReturnType<typeof getSuggestions>[0]) => {
    onCronGenerated(pattern.cron)
    setInput(pattern.description)
  }

  return (
    <div className="space-y-3">
      <h2 className="text-[13px] font-semibold text-slate-500 uppercase tracking-wider mb-3">Natural Language</h2>
      <div className="flex gap-2.5">
        <div className="flex-1 relative">
          <input
            type="text"
            value={input}
            onChange={e => handleInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={t.nl.placeholder}
            className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-[14px] text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all"
          />
        </div>
        <button
          onClick={handleSubmit}
          className="px-5 py-3 bg-blue-600 text-white text-[13px] font-semibold rounded-xl hover:bg-blue-700 active:scale-[0.97] transition-all shadow-[0_1px_2px_rgba(37,99,235,0.2)]"
        >
          {t.nl.button}
        </button>
      </div>
      {input.trim() && !parseNaturalLanguage(input) && (
        <p className="text-[12px] text-amber-600 font-medium">{t.nl.error}</p>
      )}
      <div className="flex flex-wrap gap-2">
        {suggestions.map((s, i) => (
          <button
            key={i}
            onClick={() => handleSuggestionClick(s)}
            className="px-3 py-1.5 text-[12px] font-medium bg-slate-50 border border-slate-200 rounded-lg text-slate-600 hover:bg-blue-50 hover:border-blue-200 hover:text-blue-700 active:scale-[0.97] transition-all min-h-[32px]"
          >
            {s.description}
          </button>
        ))}
      </div>
    </div>
  )
}
