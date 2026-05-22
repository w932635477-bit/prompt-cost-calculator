import { useState, useCallback } from 'react'
import { explainCron, isValidCron } from '../lib/cron-adapter'

interface CronExplainerProps {
  onExpressionParsed: (expression: string) => void
}

export function CronExplainer({ onExpressionParsed }: CronExplainerProps) {
  const [input, setInput] = useState('')
  const [explanation, setExplanation] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleExplain = useCallback(() => {
    const expr = input.trim()
    if (!expr) return

    if (isValidCron(expr)) {
      setExplanation(explainCron(expr))
      setError(null)
      onExpressionParsed(expr)
    } else {
      setError('Invalid cron expression. Use 5 fields: minute hour day month weekday')
      setExplanation(null)
    }
  }, [input, onExpressionParsed])

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      handleExplain()
    }
  }

  return (
    <div className="space-y-3">
      <div className="flex gap-2">
        <input
          type="text"
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Paste any cron expression (e.g., 0 9 * * 1-5)"
          className="flex-1 px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm font-mono text-gray-900 placeholder-gray-400 placeholder:font-sans focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all"
        />
        <button
          onClick={handleExplain}
          className="px-4 py-2.5 bg-gray-900 text-white text-sm font-medium rounded-xl hover:bg-gray-800 transition-colors"
        >
          Explain
        </button>
      </div>
      {explanation && (
        <div className="px-4 py-3 bg-blue-50 border border-blue-100 rounded-xl">
          <p className="text-sm text-blue-900">{explanation}</p>
        </div>
      )}
      {error && (
        <p className="text-xs text-red-500">{error}</p>
      )}
    </div>
  )
}
