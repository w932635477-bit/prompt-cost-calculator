import { useCallback } from 'react'
import { useT } from '../i18n'

interface CronBuilderProps {
  fields: string[]
  onChange: (fields: string[]) => void
}

export function CronBuilder({ fields, onChange }: CronBuilderProps) {
  const t = useT()

  const updateField = useCallback((index: number, value: string) => {
    const newFields = [...fields]
    newFields[index] = value
    onChange(newFields)
  }, [fields, onChange])

  const presetGroups = [
    t.builder.presets.minute,
    t.builder.presets.hour,
    t.builder.presets.dayOfMonth,
    t.builder.presets.month,
    t.builder.presets.dayOfWeek,
  ]

  return (
    <div className="space-y-5">
      <h2 className="text-[13px] font-semibold text-slate-500 uppercase tracking-wider mb-4">Visual Builder</h2>
      <div className="grid grid-cols-5 gap-2.5">
        {t.builder.fields.map((name, i) => (
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
        {t.builder.fields.map((name, i) => (
          <div key={name} className="flex items-start gap-3">
            <span className="text-[12px] font-medium text-slate-400 w-24 shrink-0 pt-1.5">{name}</span>
            <div className="flex flex-wrap gap-1.5">
              {presetGroups[i].map(opt => (
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
