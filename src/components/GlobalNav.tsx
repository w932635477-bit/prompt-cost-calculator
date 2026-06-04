import { useState, useRef, useEffect } from 'react'

const TOOLS = [
  { name: 'AI Cost Calculator', path: '/' },
  { name: 'Cron Generator', path: '/cron-generator/' },
  { name: 'Cron Patterns', path: '/cron-generator/common-patterns/' },
  { name: 'Cron Validator', path: '/cron-validator/' },
  { name: 'Self-Hosted Alternatives', path: '/alternatives/' },
  { name: 'Notes Finder', path: '/finder/notes/' },
  { name: 'Chat Finder', path: '/finder/chat/' },
  { name: 'Productivity Finder', path: '/finder/productivity/' },
  { name: 'Free Photos', path: '/photos/' },
  { name: 'Compare', path: '/compare/' },
  { name: 'Docker Deploy', path: '/deploy/' },
  { name: 'Voice Pricing', path: '/voice-agent-pricing/' },
  { name: 'Token Tracker', path: '/token-tracker/' },
  { name: 'Token Counter', path: '/token-counter/' },
  { name: 'CSP Generator', path: '/csp-generator/' },
  { name: 'Cache Calculator', path: '/prompt-cache-calculator/' },
  { name: 'MCP Servers', path: '/mcp-servers/' },
  { name: 'PII Redactor', path: '/pii-redactor/' },
  { name: 'Env Scanner', path: '/env-scanner/' },
  { name: 'Dep Shield', path: '/dep-shield/' },
  { name: 'Agent Security', path: '/ai-agent-security/' },
  { name: 'Agent Data Access', path: '/ai-agent-data-access/' },
  { name: 'Agent Safety', path: '/agent-safety/' },
  { name: 'AI Code Review', path: '/ai-code-review/' },
  { name: 'LLM Pricing', path: '/llm-pricing/' },
]

const NAV_CATEGORIES = [
  {
    title: 'Cost & Pricing',
    tools: [
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
    tools: [
      { name: 'Cron Generator', path: '/cron-generator/' },
      { name: 'Cron Patterns', path: '/cron-generator/common-patterns/' },
      { name: 'Cron Validator', path: '/cron-validator/' },
      { name: 'Docker Deploy', path: '/deploy/' },
      { name: 'MCP Servers', path: '/mcp-servers/' },
    ],
  },
  {
    title: 'Self-Hosted',
    tools: [
      { name: 'Alternatives', path: '/alternatives/' },
      { name: 'Compare', path: '/compare/' },
      { name: 'Notes Finder', path: '/finder/notes/' },
      { name: 'Chat Finder', path: '/finder/chat/' },
      { name: 'Productivity Finder', path: '/finder/productivity/' },
      { name: 'Free Photos', path: '/photos/' },
    ],
  },
  {
    title: 'Security',
    tools: [
      { name: 'PII Redactor', path: '/pii-redactor/' },
      { name: 'CSP Generator', path: '/csp-generator/' },
      { name: 'Env Scanner', path: '/env-scanner/' },
      { name: 'Dep Shield', path: '/dep-shield/' },
      { name: 'Agent Security', path: '/ai-agent-security/' },
      { name: 'Agent Data Access', path: '/ai-agent-data-access/' },
      { name: 'Agent Safety', path: '/agent-safety/' },
      { name: 'AI Code Review', path: '/ai-code-review/' },
    ],
  },
]

function HamburgerIcon({ open }: { open: boolean }) {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
      {open ? (
        <>
          <line x1="4" y1="4" x2="14" y2="14" />
          <line x1="14" y1="4" x2="4" y2="14" />
        </>
      ) : (
        <>
          <line x1="3" y1="5" x2="15" y2="5" />
          <line x1="3" y1="9" x2="15" y2="9" />
          <line x1="3" y1="13" x2="15" y2="13" />
        </>
      )}
    </svg>
  )
}

function ChevronIcon({ open }: { open: boolean }) {
  return (
    <svg
      width="12"
      height="12"
      viewBox="0 0 12 12"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={`transition-transform duration-300 ${open ? 'rotate-90' : ''}`}
    >
      <polyline points="4.5,2 8.5,6 4.5,10" />
    </svg>
  )
}

export function GlobalNav({ current }: { current: string }) {
  const [mobileOpen, setMobileOpen] = useState(false)
  const [openCategory, setOpenCategory] = useState<string | null>(null)
  const scrollRef = useRef<HTMLDivElement>(null)
  const [canScrollLeft, setCanScrollLeft] = useState(false)
  const [canScrollRight, setCanScrollRight] = useState(false)

  const checkScroll = () => {
    const el = scrollRef.current
    if (!el) return
    setCanScrollLeft(el.scrollLeft > 4)
    setCanScrollRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 4)
  }

  useEffect(() => {
    checkScroll()
    const el = scrollRef.current
    if (!el) return
    el.addEventListener('scroll', checkScroll, { passive: true })
    window.addEventListener('resize', checkScroll)
    return () => {
      el.removeEventListener('scroll', checkScroll)
      window.removeEventListener('resize', checkScroll)
    }
  }, [])

  // Scroll active item into view on mount
  useEffect(() => {
    const el = scrollRef.current
    if (!el) return
    const activeLink = el.querySelector<HTMLAnchorElement>('a[data-active="true"]')
    if (activeLink) {
      activeLink.scrollIntoView({ inline: 'center', behavior: 'instant' })
    }
  }, [])

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => { document.body.style.overflow = '' }
  }, [mobileOpen])

  const toggleCategory = (title: string) => {
    setOpenCategory(prev => prev === title ? null : title)
  }

  return (
    <>
      <nav className="border-b border-[#e8e8ed] bg-white/80 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-[980px] mx-auto px-4 sm:px-6 flex items-center h-11">
          {/* Mobile hamburger */}
          <button
            className="md:hidden flex items-center justify-center w-11 h-11 -ml-2 text-[#1d1d1f]"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
          >
            <HamburgerIcon open={mobileOpen} />
          </button>

          {/* Desktop nav with scroll fade */}
          <div className="hidden md:flex items-center flex-1 min-w-0 relative">
            {/* Left fade */}
            {canScrollLeft && (
              <div className="absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-white/80 to-transparent z-10 pointer-events-none" />
            )}
            <div
              ref={scrollRef}
              className="flex items-center gap-0.5 overflow-x-auto scrollbar-hide"
              style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            >
              {TOOLS.map(tool => (
                <a
                  key={tool.path}
                  href={tool.path}
                  data-active={tool.path === current}
                  className={`px-2.5 py-1.5 rounded-md text-xs whitespace-nowrap transition-colors ${
                    tool.path === current
                      ? 'text-[#1d1d1f] font-semibold'
                      : 'text-[#86868b] hover:text-[#1d1d1f]'
                  }`}
                >
                  {tool.name}
                </a>
              ))}
            </div>
            {/* Right fade */}
            {canScrollRight && (
              <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-white/80 to-transparent z-10 pointer-events-none" />
            )}
          </div>

          {/* Mobile: current page label */}
          <span className="md:hidden text-sm font-medium text-[#1d1d1f] truncate flex-1 text-center">
            {TOOLS.find(t => t.path === current)?.name || 'AI Cost Calculator'}
          </span>

          {/* Spacer for mobile to balance hamburger */}
          <div className="md:hidden w-11" />
        </div>
      </nav>

      {/* Mobile overlay menu */}
      {mobileOpen && (
        <div className="fixed inset-0 top-11 z-40 bg-white overflow-y-auto md:hidden">
          <div className="px-6 py-4">
            {NAV_CATEGORIES.map(cat => (
              <div key={cat.title} className="border-b border-[#e8e8ed] last:border-0">
                <button
                  onClick={() => toggleCategory(cat.title)}
                  className="w-full flex items-center justify-between py-3.5 text-[#1d1d1f] font-semibold text-sm"
                >
                  {cat.title}
                  <ChevronIcon open={openCategory === cat.title} />
                </button>
                {openCategory === cat.title && (
                  <div className="pb-3 space-y-0.5">
                    {cat.tools.map(tool => (
                      <a
                        key={tool.path}
                        href={tool.path}
                        className={`block py-2 pl-4 text-sm rounded-lg transition-colors ${
                          tool.path === current
                            ? 'text-[#0071E3] font-medium bg-[#0071E3]/5'
                            : 'text-[#86868b] hover:text-[#1d1d1f]'
                        }`}
                        onClick={() => setMobileOpen(false)}
                      >
                        {tool.name}
                      </a>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </>
  )
}
