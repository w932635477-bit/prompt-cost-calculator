const TOOLS = [
  { name: 'AI Cost Calculator', path: '/' },
  { name: 'Cron Generator', path: '/cron-generator/' },
  { name: 'Cron Validator', path: '/cron-validator/' },
  { name: 'Self-Hosted Alternatives', path: '/alternatives/' },
  { name: 'Notes Finder', path: '/finder/notes/' },
  { name: 'Chat Finder', path: '/finder/chat/' },
  { name: 'Free Photos', path: '/photos/' },
  { name: 'Compare', path: '/compare/' },
  { name: 'Docker Deploy', path: '/deploy/' },
  { name: 'Voice Pricing', path: '/voice-agent-pricing/' },
  { name: 'Token Tracker', path: '/token-tracker/' },
  { name: 'CSP Generator', path: '/csp-generator/' },
  { name: 'Cache Calculator', path: '/prompt-cache-calculator/' },
  { name: 'MCP Servers', path: '/mcp-servers/' },
  { name: 'PII Redactor', path: '/pii-redactor/' },
  { name: 'Env Scanner', path: '/env-scanner/' },
  { name: 'Dep Shield', path: '/dep-shield/' },
  { name: 'Agent Security', path: '/ai-agent-security/' },
  { name: 'Agent Safety', path: '/agent-safety/' },
  { name: 'AI Code Review', path: '/ai-code-review/' },
  { name: 'LLM Pricing', path: '/llm-pricing/' },
]

export function GlobalNav({ current }: { current: string }) {
  return (
    <nav className="border-b border-[#e8e8ed] bg-white/80 backdrop-blur-sm sticky top-0 z-50">
      <div className="w-full px-6 overflow-x-auto">
        <ul className="flex items-center gap-1 py-2 text-sm whitespace-nowrap">
          {TOOLS.map(tool => (
            <li key={tool.path}>
              <a
                href={tool.path}
                className={`px-3 py-2.5 rounded-lg transition-colors ${
                  tool.path === current
                    ? 'bg-[#0071E3]/10 text-[#0071E3] font-medium'
                    : 'text-[#86868b] hover:text-[#1d1d1f] hover:bg-gray-100'
                }`}
              >
                {tool.name}
              </a>
            </li>
          ))}
        </ul>
      </div>
    </nav>
  )
}
