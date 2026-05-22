import type { Dialect } from '../lib/types'
import { useT } from '../i18n'

interface DialectSwitcherProps {
  value: Dialect
  onChange: (dialect: Dialect) => void
}

export function DialectSwitcher({ value, onChange }: DialectSwitcherProps) {
  const t = useT()

  const dialects: { value: Dialect; label: string; description: string }[] = [
    { value: 'unix', label: t.dialect.unix, description: t.dialect.unixDesc },
    { value: 'quartz', label: t.dialect.quartz, description: t.dialect.quartzDesc },
    { value: 'aws', label: t.dialect.aws, description: t.dialect.awsDesc },
  ]

  return (
    <div className="flex gap-0.5 p-1 bg-slate-100 rounded-lg">
      {dialects.map(d => (
        <button
          key={d.value}
          onClick={() => onChange(d.value)}
          className={`px-3.5 py-[7px] text-[12px] font-semibold rounded-md transition-all min-h-[32px] ${
            value === d.value
              ? 'bg-white text-slate-900 shadow-[0_1px_3px_rgba(0,0,0,0.08)]'
              : 'text-slate-500 hover:text-slate-700'
          }`}
          title={d.description}
        >
          {d.label}
        </button>
      ))}
    </div>
  )
}
