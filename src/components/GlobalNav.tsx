const TOOLS = [
  { name: 'AI Cost Calculator', path: '/' },
  { name: 'Cron Generator', path: '/cron-generator/' },
  { name: 'Self-Hosted Alternatives', path: '/alternatives/' },
  { name: 'Notes Finder', path: '/finder/notes/' },
  { name: 'Compare', path: '/compare/' },
  { name: 'Docker Deploy', path: '/deploy/' },
  { name: 'Voice Pricing', path: '/voice-agent-pricing/' },
  { name: 'Token Tracker', path: '/token-tracker/' },
  { name: 'Agent Safety', path: '/agent-safety/' },
]

export function GlobalNav({ current }: { current: string }) {
  return (
    <nav className="border-b border-[#e8e8ed] bg-white/80 backdrop-blur-sm sticky top-0 z-50">
      <div className="max-w-[980px] mx-auto px-4 overflow-x-auto">
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
