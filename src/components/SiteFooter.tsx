const FOOTER_SECTIONS = [
  {
    title: 'Cost & Pricing',
    links: [
      { name: 'Cost Calculator', path: '/' },
      { name: 'LLM Pricing', path: '/llm-pricing/' },
      { name: 'Voice Pricing', path: '/voice-agent-pricing/' },
      { name: 'Token Tracker', path: '/token-tracker/' },
      { name: 'Token Counter', path: '/token-counter/' },
      { name: 'Cache Calculator', path: '/prompt-cache-calculator/' },
    ],
  },
  {
    title: 'DevOps',
    links: [
      { name: 'Cron Generator', path: '/cron-generator/' },
      { name: 'Cron Validator', path: '/cron-validator/' },
      { name: 'Docker Deploy', path: '/deploy/' },
      { name: 'MCP Servers', path: '/mcp-servers/' },
    ],
  },
  {
    title: 'Self-Hosted',
    links: [
      { name: 'Alternatives', path: '/alternatives/' },
      { name: 'Compare', path: '/compare/' },
      { name: 'Notes Finder', path: '/finder/notes/' },
      { name: 'Chat Finder', path: '/finder/chat/' },
      { name: 'Productivity', path: '/finder/productivity/' },
      { name: 'Free Photos', path: '/photos/' },
    ],
  },
  {
    title: 'Security',
    links: [
      { name: 'PII Redactor', path: '/pii-redactor/' },
      { name: 'CSP Generator', path: '/csp-generator/' },
      { name: 'Env Scanner', path: '/env-scanner/' },
      { name: 'Dep Shield', path: '/dep-shield/' },
      { name: 'Agent Security', path: '/ai-agent-security/' },
      { name: 'Agent Safety', path: '/agent-safety/' },
      { name: 'Code Review', path: '/ai-code-review/' },
    ],
  },
]

export function SiteFooter() {
  return (
    <footer className="border-t border-[#e8e8ed] bg-[#f5f5f7]">
      <div className="max-w-[980px] mx-auto px-6">
        {/* Link columns */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 py-8">
          {FOOTER_SECTIONS.map(section => (
            <div key={section.title}>
              <h3 className="text-xs font-semibold text-[#1d1d1f] uppercase tracking-wider mb-3">
                {section.title}
              </h3>
              <ul className="space-y-2">
                {section.links.map(link => (
                  <li key={link.path}>
                    <a
                      href={link.path}
                      className="text-xs text-[#86868b] hover:text-[#1d1d1f] transition-colors"
                    >
                      {link.name}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div className="border-t border-[#e8e8ed] py-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-3 text-xs text-[#86868b]">
            <span>AI Cost Calculator · Free &amp; open source</span>
            <span className="hidden sm:inline">·</span>
            <a href="/about/" className="hover:text-[#1d1d1f] transition-colors">About</a>
            <a href="/privacy-policy/" className="hover:text-[#1d1d1f] transition-colors">Privacy</a>
            <a href="/terms/" className="hover:text-[#1d1d1f] transition-colors">Terms</a>
            <a href="/contact/" className="hover:text-[#1d1d1f] transition-colors">Contact</a>
          </div>
          <p className="text-xs text-[#86868b]">
            Pricing from{' '}
            <a href="https://openai.com/pricing" className="underline hover:text-[#1d1d1f] transition-colors" target="_blank" rel="noopener noreferrer">OpenAI</a>,{' '}
            <a href="https://www.anthropic.com/pricing" className="underline hover:text-[#1d1d1f] transition-colors" target="_blank" rel="noopener noreferrer">Anthropic</a>,{' '}
            <a href="https://ai.google/pricing" className="underline hover:text-[#1d1d1f] transition-colors" target="_blank" rel="noopener noreferrer">Google</a>,{' '}
            <a href="https://groq.com/pricing" className="underline hover:text-[#1d1d1f] transition-colors" target="_blank" rel="noopener noreferrer">Groq</a>,{' '}
            <a href="https://deepseek.com/pricing" className="underline hover:text-[#1d1d1f] transition-colors" target="_blank" rel="noopener noreferrer">DeepSeek</a>
          </p>
        </div>
      </div>
    </footer>
  )
}
