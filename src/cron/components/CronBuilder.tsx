import { useCallback } from 'react'
import { FIELD_NAMES } from '../lib/cron-adapter'

interface CronBuilderProps {
  fields: string[]
  onChange: (fields: string[]) => void
}

const PRESET_OPTIONS: Record<number, { label: string; value: string }[]> = {
  0: [ // minute
    { label: 'Every minute', value: '*' },
    { label: 'Every 5', value: '*/5' },
    { label: 'Every 10', value: '*/10' },
    { label: 'Every 15', value: '*/15' },
    { label: 'Every 30', value: '*/30' },
    { label: '0 (top)', value: '0' },
    { label: '30', value: '30' },
  ],
  1: [ // hour
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
  2: [ // day of month
    { label: 'Every day', value: '*' },
    { label: '1st', value: '1' },
    { label: '15th', value: '15' },
    { label: 'Last day (28)', value: '28' },
  ],
  3: [ // month
    { label: 'Every month', value: '*' },
    { label: 'Jan', value: '1' },
    { label: 'Jul', value: '7' },
  ],
  4: [ // day of week
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
    <div className="space-y-3">
      <div className="grid grid-cols-5 gap-2">
        {FIELD_NAMES.map((name, i) => (
          <div key={name} className="space-y-1.5">
            <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide text-center">
              {name}
            </label>
            <input
              type="text"
              value={fields[i]}
              onChange={e => updateField(i, e.target.value)}
              className="w-full px-2 py-2 bg-white border border-gray-200 rounded-lg text-center text-sm font-mono font-medium text-gray-900 focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all"
              placeholder="*"
            />
          </div>
        ))}
      </div>
      <div className="space-y-2">
        {FIELD_NAMES.map((name, i) => (
          <div key={name} className="flex items-center gap-2">
            <span className="text-xs text-gray-400 w-24 shrink-0">{name}</span>
            <div className="flex flex-wrap gap-1">
              {PRESET_OPTIONS[i].map(opt => (
                <button
                  key={opt.value}
                  onClick={() => updateField(i, opt.value)}
                  className={`px-2 py-0.5 text-xs rounded-md transition-all ${
                    fields[i] === opt.value
                      ? 'bg-blue-100 text-blue-700 border border-blue-200'
                      : 'bg-gray-50 text-gray-500 border border-gray-100 hover:bg-gray-100'
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
