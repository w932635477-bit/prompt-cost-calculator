import { useState, useMemo } from 'react'
import { CHECKLIST_ITEMS, CHECKLIST_CATEGORIES, FAQ_DATA, type CheckItem } from './checklist-data'
import { GlobalNav } from '../components/GlobalNav'

const SEVERITY_CONFIG = {
  critical: { label: 'Critical', bg: 'bg-red-500/10', text: 'text-red-600' },
  warning: { label: 'Warning', bg: 'bg-amber-500/10', text: 'text-amber-600' },
  info: { label: 'Info', bg: 'bg-[#0071E3]/10', text: 'text-[#0071E3]' },
}

const CATEGORY_ICONS: Record<string, string> = {
  'Input Validation': '🛡️',
  'Tool & API Security': '🔧',
  'Prompt Injection Defense': '💉',
  'Data Privacy': '🔒',
  'Access Control': '🔑',
  'Monitoring & Logging': '📊',
  'Error Handling': '⚠️',
  'Supply Chain': '📦',
}

function CheckCard({ item, checked, onToggle }: { item: CheckItem; checked: boolean; onToggle: () => void }) {
  const [expanded, setExpanded] = useState(false)
  const sev = SEVERITY_CONFIG[item.severity]

  return (
    <div className={`rounded-2xl p-5 transition-all shadow-sm ${checked ? 'bg-[#0071E3]/[0.04] shadow-none' : 'bg-white hover:shadow-md'}`}>
      <div className="flex items-start gap-4">
        <button
          onClick={onToggle}
          className={`mt-0.5 flex-shrink-0 w-6 h-6 rounded-lg flex items-center justify-center transition-all ${
            checked
              ? 'bg-[#0071E3] text-white shadow-sm'
              : 'bg-[#f5f5f7] hover:bg-[#e8e8ed]'
          }`}
          aria-label={checked ? 'Uncheck' : 'Check'}
        >
          {checked && <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>}
        </button>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className={`font-medium text-base ${checked ? 'line-through text-[#86868b]' : 'text-[#1d1d1f]'}`}>
              {item.title}
            </h3>
            <span className={`text-xs px-2.5 py-0.5 rounded-full font-medium ${sev.bg} ${sev.text}`}>
              {sev.label}
            </span>
          </div>
          <button
            onClick={() => setExpanded(!expanded)}
            className="text-sm text-[#86868b] hover:text-[#1d1d1f] mt-1.5 transition-colors"
          >
            {expanded ? 'Hide details' : 'Show details'}
          </button>
          {expanded && (
            <div className="mt-4 space-y-3">
              <p className="text-base text-[#86868b] leading-relaxed">{item.description}</p>
              {item.codeExample && (
                <pre className="text-sm bg-[#1d1d1f] text-[#30d158] p-4 rounded-xl overflow-x-auto font-mono leading-relaxed">
                  {item.codeExample}
                </pre>
              )}
              {item.references && (
                <div className="text-sm text-[#86868b]">
                  References: {item.references.map((r, i) => <a key={i} href={r} target="_blank" rel="noopener noreferrer" className="text-[#0071E3] hover:underline">{r}</a>)}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default function AgentSafetyApp() {
  const [checkedItems, setCheckedItems] = useState<Set<string>>(new Set())
  const [selectedCategory, setSelectedCategory] = useState<string>('all')

  const toggle = (id: string) => {
    setCheckedItems(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const filteredItems = useMemo(() => {
    if (selectedCategory === 'all') return CHECKLIST_ITEMS
    return CHECKLIST_ITEMS.filter(item => item.category === selectedCategory)
  }, [selectedCategory])

  const criticalChecked = CHECKLIST_ITEMS.filter(i => i.severity === 'critical' && checkedItems.has(i.id)).length
  const criticalTotal = CHECKLIST_ITEMS.filter(i => i.severity === 'critical').length
  const totalChecked = checkedItems.size
  const totalItems = CHECKLIST_ITEMS.length
  const progressPct = Math.round((totalChecked / totalItems) * 100)

  return (
    <div className="min-h-screen bg-[#f5f5f7]">
      <GlobalNav current="/agent-safety/" />

      <main className="max-w-[780px] mx-auto px-6 py-10">
        {/* Header */}
        <div className="mb-10">
          <h1 className="text-3xl md:text-4xl font-semibold text-[#1d1d1f] tracking-tight mb-3">
            AI Agent Safety Checklist
          </h1>
          <p className="text-[#86868b] text-lg leading-relaxed">
            18 security checks for building safe AI agents. Covers prompt injection defense, tool access control, data privacy, and supply chain security.
          </p>
        </div>

        {/* Progress */}
        <div className="mb-8 bg-white rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-medium text-[#1d1d1f]">
              {totalChecked}/{totalItems} checks completed
            </span>
            <span className={`text-sm font-medium ${progressPct === 100 ? 'text-[#30d158]' : criticalChecked === criticalTotal ? 'text-amber-500' : 'text-red-500'}`}>
              {progressPct === 100 ? 'All checks passed' : criticalChecked === criticalTotal ? `Critical done (${criticalChecked}/${criticalTotal})` : `Critical: ${criticalChecked}/${criticalTotal}`}
            </span>
          </div>
          <div className="w-full bg-[#f5f5f7] rounded-full h-2">
            <div
              className={`h-2 rounded-full transition-all ${progressPct === 100 ? 'bg-[#30d158]' : criticalChecked === criticalTotal ? 'bg-amber-400' : 'bg-[#0071E3]'}`}
              style={{ width: `${progressPct}%` }}
            />
          </div>
        </div>

        {/* Category filter */}
        <div className="mb-8 flex flex-wrap gap-2">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`text-sm px-4 py-2 rounded-full transition-all ${
              selectedCategory === 'all'
                ? 'bg-[#1d1d1f] text-white shadow-sm'
                : 'bg-white text-[#86868b] hover:bg-[#e8e8ed] shadow-sm'
            }`}
          >
            All ({totalItems})
          </button>
          {CHECKLIST_CATEGORIES.map(cat => {
            const count = CHECKLIST_ITEMS.filter(i => i.category === cat).length
            return (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`text-sm px-4 py-2 rounded-full transition-all ${
                  selectedCategory === cat
                    ? 'bg-[#1d1d1f] text-white shadow-sm'
                    : 'bg-white text-[#86868b] hover:bg-[#e8e8ed] shadow-sm'
                }`}
              >
                {CATEGORY_ICONS[cat]} {cat} ({count})
              </button>
            )
          })}
        </div>

        {/* Checklist */}
        <div className="space-y-3">
          {filteredItems.map(item => (
            <CheckCard
              key={item.id}
              item={item}
              checked={checkedItems.has(item.id)}
              onToggle={() => toggle(item.id)}
            />
          ))}
        </div>

        {/* FAQ */}
        <div className="mt-16">
          <h2 className="text-2xl font-semibold text-[#1d1d1f] tracking-tight mb-6">
            Frequently Asked Questions
          </h2>
          <div className="space-y-3">
            {FAQ_DATA.map((faq, i) => (
              <details key={i} className="group bg-white rounded-2xl shadow-sm overflow-hidden">
                <summary className="cursor-pointer p-5 text-base font-medium text-[#1d1d1f] group-open:text-[#0071E3] transition-colors">
                  {faq.q}
                </summary>
                <div className="px-5 pb-5 text-base text-[#86868b] leading-relaxed">
                  {faq.a}
                </div>
              </details>
            ))}
          </div>
        </div>

        {/* Footer */}
        <footer className="mt-12 border-t border-[#e8e8ed] pt-6 text-center text-sm text-[#86868b]">
          <p>Free AI Agent Safety Checklist. No login required.</p>
          <p className="mt-2">
            <a href="/" className="text-[#0071E3] hover:underline">AI Cost Calculator</a>
            <span className="mx-1.5">&middot;</span>
            <a href="/cron-generator/" className="text-[#0071E3] hover:underline">Cron Generator</a>
            <span className="mx-1.5">&middot;</span>
            <a href="/alternatives/" className="text-[#0071E3] hover:underline">Self-Hosted Alternatives</a>
            <span className="mx-1.5">&middot;</span>
            <a href="/deploy/" className="text-[#0071E3] hover:underline">Docker Deploy</a>
          </p>
        </footer>
      </main>
    </div>
  )
}
