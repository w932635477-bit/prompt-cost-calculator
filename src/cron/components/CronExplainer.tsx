import { useState, useCallback } from 'react'
import { explainCron, isValidCron } from '../lib/cron-adapter'
import { useT } from '../i18n'

interface CronExplainerProps {
  onExpressionParsed: (expression: string) => void
}

export function CronExplainer({ onExpressionParsed }: CronExplainerProps) {
  const t = useT()
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
      setError(t.explainer.error)
      setExplanation(null)
    }
  }, [input, onExpressionParsed, t])

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      handleExplain()
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex gap-2.5">
        <input
          type="text"
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={t.explainer.placeholder}
          className="flex-1 px-4 py-3 bg-white border border-slate-200 rounded-xl text-[14px] text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all"
          style={{ fontFamily: "'JetBrains Mono', monospace" }}
        />
        <button
          onClick={handleExplain}
          className="px-5 py-3 bg-slate-900 text-white text-[13px] font-semibold rounded-xl hover:bg-slate-800 active:scale-[0.97] transition-all shadow-[0_1px_2px_rgba(0,0,0,0.15)]"
        >
          {t.explainer.button}
        </button>
      </div>
      {explanation && (
        <div className="px-4 py-3.5 bg-blue-50 border border-blue-100 rounded-xl">
          <p className="text-[14px] text-blue-900 font-medium">{explanation}</p>
        </div>
      )}
      {error && (
        <p className="text-[12px] text-red-500 font-medium">{error}</p>
      )}
    </div>
  )
}
