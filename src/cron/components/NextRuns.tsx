interface NextRunsProps {
  runs: Date[]
}

export function NextRuns({ runs }: NextRunsProps) {
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
    <div className="space-y-2">
      <h3 className="text-sm font-medium text-gray-700">Next 10 executions (UTC)</h3>
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
        {runs.map((run, i) => (
          <div
            key={i}
            className="px-3 py-2 bg-gray-50 border border-gray-100 rounded-lg text-center"
          >
            <div className="text-xs text-gray-500">{formatDate(run)}</div>
            <div className="text-sm font-medium text-gray-900">{formatTime(run)}</div>
          </div>
        ))}
      </div>
    </div>
  )
}
