import { useState } from 'react'
import { GlobalNav } from '../components/GlobalNav'

interface PlatformRow {
  name: string
  logo: string
  retention: string
  trainingUse: string
  userControls: string
  enterpriseOptOut: string
  soc2: string
}

const PLATFORMS: PlatformRow[] = [
  { name: 'Claude (Anthropic)', logo: '🟣', retention: '30 days', trainingUse: 'Never (all plans)', userControls: 'Delete anytime', enterpriseOptOut: 'N/A (not used)', soc2: 'Type 2' },
  { name: 'ChatGPT (OpenAI)', logo: '🟢', retention: '30 days', trainingUse: 'Free plan: Yes\nPaid: No', userControls: 'Opt-out setting', enterpriseOptOut: 'Yes', soc2: 'Type 2' },
  { name: 'Gemini (Google)', logo: '🔵', retention: '18 months', trainingUse: 'Free: Yes\nAdvanced: No', userControls: 'Activity controls', enterpriseOptOut: 'Yes', soc2: 'Type 2' },
  { name: 'DeepSeek', logo: '🔴', retention: 'Unclear', trainingUse: 'Yes (default)', userControls: 'Delete only', enterpriseOptOut: 'Unclear', soc2: 'No' },
  { name: 'Llama/Ollama', logo: '🦙', retention: 'None (local)', trainingUse: 'Never (local)', userControls: 'Full control', enterpriseOptOut: 'N/A (local)', soc2: 'N/A (self-hosted)' },
]

interface TimelineEvent {
  date: string
  title: string
  description: string
}

const TIMELINE: TimelineEvent[] = [
  { date: 'Jan 2025', title: 'DeepSeek data sovereignty concerns', description: 'DeepSeek\'s Chinese-hosted infrastructure raises questions about data sovereignty. Companies restrict usage over data flow to servers in China.' },
  { date: 'Mar 2025', title: 'OpenAI adds enterprise data controls', description: 'OpenAI introduces data retention controls for enterprise customers, allowing zero data retention for API usage.' },
  { date: 'Jun 2025', title: 'Anthropic publishes data usage audit', description: 'Anthropic releases a public transparency report showing zero customer data used for training across all plan tiers.' },
  { date: 'Sep 2025', title: 'EU AI Act data requirements take effect', description: 'EU AI Act provisions require AI providers to disclose data retention periods, training data usage, and provide opt-out mechanisms.' },
  { date: 'Feb 2026', title: 'AI agent data access debate intensifies', description: 'As AI agents gain tool access (email, files, APIs), the debate over what data agents can see and retain becomes a top developer concern.' },
]

interface BestPractice {
  id: string
  title: string
  description: string
  severity: 'critical' | 'warning' | 'info'
}

const BEST_PRACTICES: BestPractice[] = [
  { id: 'redact', title: 'Redact PII before sending to AI', description: 'Use PII redaction tools to strip names, emails, phone numbers, and account numbers from prompts before sending to any AI service. This is your first line of defense.', severity: 'critical' },
  { id: 'no-secrets', title: 'Never share secrets or API keys', description: 'Never paste passwords, API keys, database connection strings, or private keys into AI chat interfaces. Use environment variables and secret managers instead.', severity: 'critical' },
  { id: 'local-models', title: 'Use local models for sensitive data', description: 'For code containing proprietary logic or sensitive business data, use local models (Ollama, llama.cpp) that process everything on your machine with zero data egress.', severity: 'warning' },
  { id: 'enterprise', title: 'Use enterprise plans for team data', description: 'Enterprise plans from Claude, ChatGPT, and Gemini offer zero data retention for training, SOC 2 compliance, and admin controls. Worth it for teams of 5+.', severity: 'warning' },
  { id: 'audit', title: 'Review and delete conversation history', description: 'Regularly review your AI conversation history and delete sensitive threads. Most platforms retain data for 30 days by default.', severity: 'info' },
  { id: 'agent-sandbox', title: 'Sandbox AI agent tool access', description: 'When using AI agents with tool access (file system, APIs, email), run them in sandboxed environments. Never grant agents direct access to production systems.', severity: 'critical' },
]

const FAQ = [
  { q: 'Does ChatGPT use my data for training?', a: 'Free ChatGPT users: yes, conversations may be used for training. ChatGPT Plus/Team/Enterprise users: data is not used for training. You can also opt out in settings for free accounts.' },
  { q: 'Is Claude more private than ChatGPT?', a: 'Claude does not use your conversations for training on any plan, including free. ChatGPT may use free-tier conversations for training. For privacy, Claude has the stronger default policy.' },
  { q: 'Can I run an AI model without sending data anywhere?', a: 'Yes. Open-source models like Llama, Mistral, and Qwen can run locally via Ollama or llama.cpp. All processing happens on your machine with zero data leaving your network.' },
  { q: 'What should I never share with AI assistants?', a: 'Never share passwords, API keys, social security numbers, medical records, financial account numbers, or any PII you would not share with a stranger. Use PII redaction tools before sending data to AI models.' },
]

const SEVERITY_STYLES = {
  critical: { label: 'Critical', bg: 'bg-red-500/10', text: 'text-red-600' },
  warning: { label: 'Warning', bg: 'bg-amber-500/10', text: 'text-amber-600' },
  info: { label: 'Info', bg: 'bg-[#0071E3]/10', text: 'text-[#0071E3]' },
}

function CellValue({ value }: { value: string }) {
  const isPositive = value.toLowerCase().includes('never') || value.includes('None') || value.includes('Full control') || value.includes('N/A')
  const isNegative = value.toLowerCase().includes('unclear') || value === 'No'
  if (value.includes('\n')) {
    return (
      <div className="text-sm">
        {value.split('\n').map((line, i) => (
          <div key={i} className={i === 0 ? 'font-medium text-[#1d1d1f]' : 'text-[#86868b]'}>{line}</div>
        ))}
      </div>
    )
  }
  return (
    <span className={`text-sm ${isPositive ? 'text-[#30d158] font-medium' : isNegative ? 'text-red-500' : 'text-[#1d1d1f]'}`}>
      {value}
    </span>
  )
}

export default function AgentDataAccessApp() {
  const [checkedItems, setCheckedItems] = useState<Set<string>>(new Set())
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null)
  const checkedCount = checkedItems.size
  const totalCount = BEST_PRACTICES.length

  const toggleItem = (id: string) => {
    setCheckedItems(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  return (
    <div className="min-h-screen bg-[#f5f5f7]">
      <GlobalNav current="/ai-agent-data-access/" />

      <main className="max-w-[780px] mx-auto px-6 py-10">
        {/* Hero */}
        <div className="mb-10">
          <h1 className="text-3xl md:text-4xl font-semibold text-[#1d1d1f] tracking-tight mb-3">
            AI Agent Data Access
          </h1>
          <p className="text-[#86868b] text-lg leading-relaxed">
            What your AI assistant can see, store, and use for training. A clear comparison of data policies across major AI platforms, with best practices for protecting your data.
          </p>
        </div>

        {/* Platform Comparison Table */}
        <section className="mb-12">
          <h2 className="text-xl font-semibold text-[#1d1d1f] mb-4">Platform Data Access Comparison</h2>
          <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-[#f5f5f7]">
                    <th className="text-left text-xs font-medium text-[#86868b] uppercase tracking-wider px-5 py-4">Platform</th>
                    <th className="text-left text-xs font-medium text-[#86868b] uppercase tracking-wider px-5 py-4">Retention</th>
                    <th className="text-left text-xs font-medium text-[#86868b] uppercase tracking-wider px-5 py-4">Training Use</th>
                    <th className="text-left text-xs font-medium text-[#86868b] uppercase tracking-wider px-5 py-4">User Controls</th>
                    <th className="text-left text-xs font-medium text-[#86868b] uppercase tracking-wider px-5 py-4">Enterprise</th>
                    <th className="text-left text-xs font-medium text-[#86868b] uppercase tracking-wider px-5 py-4">SOC 2</th>
                  </tr>
                </thead>
                <tbody>
                  {PLATFORMS.map((p, i) => (
                    <tr key={p.name} className={i < PLATFORMS.length - 1 ? 'border-b border-[#f5f5f7]' : ''}>
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-2">
                          <span className="text-lg">{p.logo}</span>
                          <span className="text-sm font-medium text-[#1d1d1f]">{p.name}</span>
                        </div>
                      </td>
                      <td className="px-5 py-4"><CellValue value={p.retention} /></td>
                      <td className="px-5 py-4"><CellValue value={p.trainingUse} /></td>
                      <td className="px-5 py-4"><CellValue value={p.userControls} /></td>
                      <td className="px-5 py-4"><CellValue value={p.enterpriseOptOut} /></td>
                      <td className="px-5 py-4"><CellValue value={p.soc2} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* Timeline */}
        <section className="mb-12">
          <h2 className="text-xl font-semibold text-[#1d1d1f] mb-4">Key Events in AI Data Access</h2>
          <div className="space-y-0">
            {TIMELINE.map((event, i) => (
              <div key={i} className="flex gap-4">
                <div className="flex flex-col items-center">
                  <div className="w-3 h-3 rounded-full bg-[#0071E3] mt-1.5 flex-shrink-0" />
                  {i < TIMELINE.length - 1 && <div className="w-px flex-1 bg-[#d2d2d7] mt-1" />}
                </div>
                <div className={`pb-6 ${i === TIMELINE.length - 1 ? '' : ''}`}>
                  <div className="text-xs font-medium text-[#0071E3] mb-1">{event.date}</div>
                  <h3 className="text-base font-medium text-[#1d1d1f] mb-1">{event.title}</h3>
                  <p className="text-sm text-[#86868b] leading-relaxed">{event.description}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Best Practices Checklist */}
        <section className="mb-12">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-[#1d1d1f]">Best Practices Checklist</h2>
            <span className="text-sm text-[#86868b]">{checkedCount}/{totalCount} checked</span>
          </div>
          <div className="space-y-3">
            {BEST_PRACTICES.map(item => {
              const checked = checkedItems.has(item.id)
              const sev = SEVERITY_STYLES[item.severity]
              return (
                <div key={item.id} className={`rounded-2xl p-5 transition-all shadow-sm ${checked ? 'bg-[#0071E3]/[0.04] shadow-none' : 'bg-white hover:shadow-md'}`}>
                  <div className="flex items-start gap-4">
                    <button
                      onClick={() => toggleItem(item.id)}
                      className={`mt-0.5 flex-shrink-0 w-6 h-6 rounded-lg flex items-center justify-center transition-all ${
                        checked ? 'bg-[#0071E3] text-white shadow-sm' : 'bg-[#f5f5f7] hover:bg-[#e8e8ed]'
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
                      <p className="text-sm text-[#86868b] mt-2 leading-relaxed">{item.description}</p>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </section>

        {/* FAQ */}
        <section className="mb-12">
          <h2 className="text-xl font-semibold text-[#1d1d1f] mb-4">Frequently Asked Questions</h2>
          <div className="space-y-3">
            {FAQ.map((item, i) => (
              <div key={i} className="bg-white rounded-2xl shadow-sm">
                <button
                  onClick={() => setExpandedFaq(expandedFaq === i ? null : i)}
                  className="w-full px-5 py-4 flex items-center justify-between text-left"
                >
                  <span className="text-base font-medium text-[#1d1d1f]">{item.q}</span>
                  <svg className={`w-4 h-4 text-[#86868b] transition-transform flex-shrink-0 ${expandedFaq === i ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                </button>
                {expandedFaq === i && (
                  <div className="px-5 pb-4 text-sm text-[#86868b] leading-relaxed">{item.a}</div>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* Related Tools */}
        <section className="mb-12">
          <h2 className="text-xl font-semibold text-[#1d1d1f] mb-4">Related Tools</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <a href="/agent-safety/" className="bg-white rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow group">
              <h3 className="text-base font-semibold text-[#1d1d1f] group-hover:text-[#0071E3] transition-colors mb-1">AI Agent Safety Checklist</h3>
              <p className="text-sm text-[#86868b]">18 security checks for building safe AI agents. Prompt injection, tool access, and supply chain security.</p>
            </a>
            <a href="/voice-agent-pricing/" className="bg-white rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow group">
              <h3 className="text-base font-semibold text-[#1d1d1f] group-hover:text-[#0071E3] transition-colors mb-1">Voice Agent Pricing</h3>
              <p className="text-sm text-[#86868b]">Compare pricing for voice AI platforms. Latency, quality, and cost per minute across providers.</p>
            </a>
          </div>
        </section>
      </main>
    </div>
  )
}
