import { useCallback } from 'react'
import { FIELD_NAMES } from '../lib/cron-adapter'

interface CronBuilderProps {
  fields: string[]
  onChange: (fields: string[]) => void
}

const PRESET_OPTIONS: Record<number, { label: string; value: string }[]> = {
  0: [
    { label: 'Every minute', value: '*' },
    { label: 'Every 5', value: '*/5' },
    { label: 'Every 10', value: '*/10' },
    { label: 'Every 15', value: '*/15' },
    { label: 'Every 30', value: '*/30' },
    { label: '0 (top)', value: '0' },
    { label: '30', value: '30' },
  ],
  1: [
    { label: 'Every hour', value: '*' },
    { label: 'Every 2', value: '*/2' },
    { label: 'Every 3', value: '*/3' },
    { label: 'Every 6', value: '*/6' },
    { label: 'Every 12', value: '*/12' },
    { label: '0 (midnight)', value: '0' },
    { label: '6 AM', value: '6' },
    { label: '9 AM', value: '9' },
    { label: '12 PM', value: '12' },
    { label: '6 PM', value: '18' },
    { label: '9 PM', value: '21' },
  ],
  2: [
    { label: 'Every day', value: '*' },
    { label: '1st', value: '1' },
    { label: '15th', value: '15' },
    { label: 'Last day (28)', value: '28' },
  ],
  3: [
    { label: 'Every month', value: '*' },
    { label: 'Jan', value: '1' },
    { label: 'Jul', value: '7' },
  ],
  4: [
    { label: 'Every day', value: '*' },
    { label: 'Mon-Fri', value: '1-5' },
    { label: 'Sat-Sun', value: '0,6' },
    { label: 'Mon', value: '1' },
    { label: 'Tue', value: '2' },
    { label: 'Wed', value: '3' },
    { label: 'Thu', value: '4' },
    { label: 'Fri', value: '5' },
    { label: 'Sat', value: '6' },
    { label: 'Sun', value: '0' },
  ],
}

export function CronBuilder({ fields, onChange }: CronBuilderProps) {
  const updateField = useCallback((index: number, value: string) => {
    const newFields = [...fields]
    newFields[index] = value
    onChange(newFields)
  }, [fields, onChange])

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-5 gap-2.5">
        {FIELD_NAMES.map((name, i) => (
          <div key={name} className="space-y-2">
            <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider text-center">
              {name}
            </label>
            <input
              type="text"
              value={fields[i]}
              onChange={e => updateField(i, e.target.value)}
              className="w-full px-2.5 py-2.5 bg-white border border-slate-200 rounded-lg text-center text-[13px] font-medium text-slate-900 focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all"
              style={{ fontFamily: "'JetBrains Mono', monospace" }}
              placeholder="*"
            />
          </div>
        ))}
      </div>
      <div className="space-y-3">
        {FIELD_NAMES.map((name, i) => (
          <div key={name} className="flex items-start gap-3">
            <span className="text-[12px] font-medium text-slate-400 w-24 shrink-0 pt-1.5">{name}</span>
            <div className="flex flex-wrap gap-1.5">
              {PRESET_OPTIONS[i].map(opt => (
                <button
                  key={opt.value}
                  onClick={() => updateField(i, opt.value)}
                  className={`px-2.5 py-[5px] text-[12px] font-medium rounded-md transition-all min-h-[32px] ${
                    fields[i] === opt.value
                      ? 'bg-blue-50 text-blue-700 border border-blue-200 shadow-[0_1px_2px_rgba(59,130,246,0.1)]'
                      : 'bg-slate-50 text-slate-500 border border-slate-150 hover:bg-slate-100 hover:border-slate-200'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
