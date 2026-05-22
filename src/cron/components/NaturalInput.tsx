import { useState } from 'react'
import { parseNaturalLanguage, getSuggestions } from '../lib/nl-parser'

interface NaturalInputProps {
  onCronGenerated: (cron: string) => void
}

export function NaturalInput({ onCronGenerated }: NaturalInputProps) {
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
      <div className="flex gap-2">
        <div className="flex-1 relative">
          <input
            type="text"
            value={input}
            onChange={e => handleInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder='Try: "every 5 minutes", "weekdays at 9am", "daily"...'
            className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all"
          />
        </div>
        <button
          onClick={handleSubmit}
          className="px-4 py-2.5 bg-blue-600 text-white text-sm font-medium rounded-xl hover:bg-blue-700 transition-colors"
        >
          Generate
        </button>
      </div>
      {input.trim() && !parseNaturalLanguage(input) && (
        <p className="text-xs text-amber-600">Pattern not recognized. Try one of the suggestions below, or use the builder.</p>
      )}
      <div className="flex flex-wrap gap-1.5">
        {suggestions.map((s, i) => (
          <button
            key={i}
            onClick={() => handleSuggestionClick(s)}
            className="px-2.5 py-1 text-xs bg-gray-50 border border-gray-200 rounded-lg text-gray-600 hover:bg-blue-50 hover:border-blue-200 hover:text-blue-700 transition-all"
          >
            {s.description}
          </button>
        ))}
      </div>
    </div>
  )
}
