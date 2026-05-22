import type { Dialect } from '../lib/types'

interface DialectSwitcherProps {
  value: Dialect
  onChange: (dialect: Dialect) => void
}

const DIALECTS: { value: Dialect; label: string; description: string }[] = [
  { value: 'unix', label: 'Unix', description: '5 fields (crontab)' },
  { value: 'quartz', label: 'Quartz', description: '6-7 fields (Java)' },
  { value: 'aws', label: 'AWS', description: 'EventBridge' },
]

export function DialectSwitcher({ value, onChange }: DialectSwitcherProps) {
  return (
    <div className="flex gap-1 p-1 bg-gray-100 rounded-xl">
      {DIALECTS.map(d => (
        <button
          key={d.value}
          onClick={() => onChange(d.value)}
          className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-all ${
            value === d.value
              ? 'bg-white text-gray-900 shadow-sm'
              : 'text-gray-500 hover:text-gray-700'
          }`}
          title={d.description}
        >
          {d.label}
        </button>
      ))}
    </div>
  )
}
