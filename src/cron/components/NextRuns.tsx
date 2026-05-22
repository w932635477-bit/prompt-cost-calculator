import { useT } from '../i18n'

interface NextRunsProps {
  runs: Date[]
}

export function NextRuns({ runs }: NextRunsProps) {
  const t = useT()
  if (runs.length === 0) return null

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    })
  }

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    })
  }

  return (
    <div className="space-y-3">
      <h3 className="text-[12px] font-semibold text-slate-400 uppercase tracking-wider">{t.nextRuns.title}</h3>
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
        {runs.map((run, i) => (
          <div
            key={i}
            className="px-3 py-2.5 bg-white border border-slate-100 rounded-lg text-center shadow-[0_1px_2px_rgba(0,0,0,0.03)]"
          >
            <div className="text-[11px] font-medium text-slate-400">{formatDate(run)}</div>
            <div className="text-[14px] font-semibold text-slate-800 mt-0.5" style={{ fontVariantNumeric: 'tabular-nums' }}>{formatTime(run)}</div>
          </div>
        ))}
      </div>
    </div>
  )
}
