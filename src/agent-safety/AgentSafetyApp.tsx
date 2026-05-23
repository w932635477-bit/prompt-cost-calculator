import { useState, useMemo } from 'react'
import { CHECKLIST_ITEMS, CHECKLIST_CATEGORIES, FAQ_DATA, type CheckItem } from './checklist-data'
import { GlobalNav } from '../components/GlobalNav'

const SEVERITY_CONFIG = {
  critical: { label: 'Critical', bg: 'bg-red-100 dark:bg-red-900/30', text: 'text-red-700 dark:text-red-300', border: 'border-red-300 dark:border-red-700' },
  warning: { label: 'Warning', bg: 'bg-yellow-100 dark:bg-yellow-900/30', text: 'text-yellow-700 dark:text-yellow-300', border: 'border-yellow-300 dark:border-yellow-700' },
  info: { label: 'Info', bg: 'bg-blue-100 dark:bg-blue-900/30', text: 'text-blue-700 dark:text-blue-300', border: 'border-blue-300 dark:border-blue-700' },
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
    <div className={`border rounded-xl p-5 transition-all ${checked ? 'border-green-300 dark:border-green-700 bg-green-50/80 dark:bg-green-900/20' : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'}`}>
      <div className="flex items-start gap-4">
        <button
          onClick={onToggle}
          className={`mt-0.5 flex-shrink-0 w-6 h-6 rounded-md border-2 flex items-center justify-center transition-colors ${
            checked
              ? 'bg-green-500 border-green-500 text-white'
              : 'border-gray-300 dark:border-gray-600 hover:border-green-400 dark:hover:border-green-500'
          }`}
          aria-label={checked ? 'Uncheck' : 'Check'}
        >
          {checked && <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>}
        </button>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className={`font-medium text-base ${checked ? 'line-through text-gray-400 dark:text-gray-500' : 'text-gray-900 dark:text-gray-100'}`}>
              {item.title}
            </h3>
            <span className={`text-xs px-2.5 py-0.5 rounded-full font-medium ${sev.bg} ${sev.text}`}>
              {sev.label}
            </span>
          </div>
          <button
            onClick={() => setExpanded(!expanded)}
            className="text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 mt-1.5"
          >
            {expanded ? 'Hide details ▲' : 'Show details ▼'}
          </button>
          {expanded && (
            <div className="mt-4 space-y-3">
              <p className="text-base text-gray-600 dark:text-gray-300 leading-relaxed">{item.description}</p>
              {item.codeExample && (
                <pre className="text-sm bg-gray-900 text-green-400 p-4 rounded-lg overflow-x-auto font-mono leading-relaxed">
                  {item.codeExample}
                </pre>
              )}
              {item.references && (
                <div className="text-sm text-gray-500">
                  References: {item.references.map((r, i) => <a key={i} href={r} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">{r}</a>)}
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
    <div className="min-h-screen bg-white dark:bg-gray-900">
      <GlobalNav current="/agent-safety/" />
      <nav className="border-b border-gray-200 dark:border-gray-800 px-4 py-3">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <a href="/" className="text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">AI Dev Tools</a>
            <span className="text-gray-300 dark:text-gray-600">/</span>
            <span className="text-sm font-medium text-gray-900 dark:text-gray-100">Agent Safety Checklist</span>
          </div>
        </div>
      </nav>

      <main className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-10">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-gray-100 mb-4">
            AI Agent Safety Checklist
          </h1>
          <p className="text-gray-600 dark:text-gray-400 text-base md:text-lg leading-relaxed">
            18 security checks for building safe AI agents. Covers prompt injection defense, tool access control, data privacy, and supply chain security. Based on real incidents including the May 2025 npm supply chain attack.
          </p>
        </div>

        {/* Progress */}
        <div className="mb-8 bg-gray-50 dark:bg-gray-800 rounded-xl p-5">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              {totalChecked}/{totalItems} checks completed
            </span>
            <span className={`text-sm font-medium ${progressPct === 100 ? 'text-green-600' : criticalChecked === criticalTotal ? 'text-yellow-600' : 'text-red-600'}`}>
              {progressPct === 100 ? 'All checks passed' : criticalChecked === criticalTotal ? `Critical done (${criticalChecked}/${criticalTotal})` : `Critical: ${criticalChecked}/${criticalTotal}`}
            </span>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
            <div
              className={`h-2.5 rounded-full transition-all ${progressPct === 100 ? 'bg-green-500' : criticalChecked === criticalTotal ? 'bg-yellow-500' : 'bg-blue-500'}`}
              style={{ width: `${progressPct}%` }}
            />
          </div>
        </div>

        {/* Category filter */}
        <div className="mb-8 flex flex-wrap gap-2">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`text-sm px-4 py-2 rounded-full border transition-colors ${
              selectedCategory === 'all'
                ? 'bg-gray-900 text-white border-gray-900 dark:bg-gray-100 dark:text-gray-900 dark:border-gray-100'
                : 'bg-white text-gray-600 border-gray-200 hover:border-gray-400 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-700'
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
                className={`text-sm px-4 py-2 rounded-full border transition-colors ${
                  selectedCategory === cat
                    ? 'bg-gray-900 text-white border-gray-900 dark:bg-gray-100 dark:text-gray-900 dark:border-gray-100'
                    : 'bg-white text-gray-600 border-gray-200 hover:border-gray-400 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-700'
                }`}
              >
                {CATEGORY_ICONS[cat]} {cat} ({count})
              </button>
            )
          })}
        </div>

        {/* Checklist */}
        <div className="space-y-4">
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
        <div className="mt-16 border-t border-gray-200 dark:border-gray-700 pt-10">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-8">
            Frequently Asked Questions
          </h2>
          <div className="space-y-4">
            {FAQ_DATA.map((faq, i) => (
              <details key={i} className="group border border-gray-200 dark:border-gray-700 rounded-xl">
                <summary className="cursor-pointer p-5 text-base font-medium text-gray-900 dark:text-gray-100 group-open:text-blue-600 dark:group-open:text-blue-400">
                  {faq.q}
                </summary>
                <div className="px-5 pb-5 text-base text-gray-600 dark:text-gray-400 leading-relaxed">
                  {faq.a}
                </div>
              </details>
            ))}
          </div>
        </div>

        {/* Footer */}
        <footer className="mt-12 border-t border-gray-200 dark:border-gray-700 pt-6 text-center text-xs text-gray-400">
          <p>Free AI Agent Safety Checklist. No login required.</p>
          <p className="mt-1">
            <a href="/" className="text-blue-500 hover:underline">AI Cost Calculator</a>
            {' · '}
            <a href="/cron-generator/" className="text-blue-500 hover:underline">Cron Generator</a>
            {' · '}
            <a href="/alternatives/" className="text-blue-500 hover:underline">Self-Hosted Alternatives</a>
            {' · '}
            <a href="/deploy/" className="text-blue-500 hover:underline">Docker Deploy</a>
          </p>
        </footer>
      </main>
    </div>
  )
}
