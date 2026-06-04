interface RelatedTool {
  name: string
  path: string
  description: string
}

const TOOL_STACKS = [
  {
    title: 'Cost Control Stack',
    tools: [
      { name: 'Cost Calculator', path: '/' },
      { name: 'Token Counter', path: '/token-counter/' },
      { name: 'Cache Calculator', path: '/prompt-cache-calculator/' },
      { name: 'Token Tracker', path: '/token-tracker/' },
    ],
  },
  {
    title: 'AI Security Toolkit',
    tools: [
      { name: 'PII Redactor', path: '/pii-redactor/' },
      { name: 'CSP Generator', path: '/csp-generator/' },
      { name: 'Env Scanner', path: '/env-scanner/' },
      { name: 'Dep Shield', path: '/dep-shield/' },
      { name: 'Agent Security', path: '/ai-agent-security/' },
    ],
  },
  {
    title: 'DevOps Essentials',
    tools: [
      { name: 'Cron Generator', path: '/cron-generator/' },
      { name: 'Cron Validator', path: '/cron-validator/' },
      { name: 'MCP Servers', path: '/mcp-servers/' },
      { name: 'Self-Hosted Alt.', path: '/alternatives/' },
    ],
  },
]

const RELATED_MAP: Record<string, RelatedTool[]> = {
  '/': [
    { name: 'Cache Calculator', path: '/prompt-cache-calculator/', description: 'See how prompt caching cuts your API bill by 60%+' },
    { name: 'Token Counter', path: '/token-counter/', description: 'Count tokens before sending requests to avoid surprises' },
    { name: 'LLM Pricing', path: '/llm-pricing/', description: 'Side-by-side pricing for 19 models across 5 providers' },
  ],
  '/cron-generator/': [
    { name: 'Cron Validator', path: '/cron-validator/', description: 'Validate cron expressions and get fix suggestions' },
    { name: 'Cron Patterns', path: '/cron-generator/common-patterns/', description: '150+ ready-to-use cron expressions' },
    { name: 'Docker Deploy', path: '/deploy/', description: 'Deploy self-hosted tools with Docker Compose' },
  ],
  '/cron-generator/common-patterns/': [
    { name: 'Cron Generator', path: '/cron-generator/', description: 'Build cron schedules visually' },
    { name: 'Cron Validator', path: '/cron-validator/', description: 'Validate any cron expression instantly' },
  ],
  '/cron-validator/': [
    { name: 'Cron Generator', path: '/cron-generator/', description: 'Build cron schedules visually' },
    { name: 'Cron Patterns', path: '/cron-generator/common-patterns/', description: '150+ ready-to-use cron expressions' },
  ],
  '/alternatives/': [
    { name: 'Compare', path: '/compare/', description: 'Side-by-side tool comparisons with recommendations' },
    { name: 'Docker Deploy', path: '/deploy/', description: 'Deploy self-hosted tools with Docker Compose' },
    { name: 'Productivity Finder', path: '/finder/productivity/', description: 'Find the best self-hosted productivity tool' },
  ],
  '/finder/notes/': [
    { name: 'Chat Finder', path: '/finder/chat/', description: 'Find your self-hosted team chat platform' },
    { name: 'Productivity Finder', path: '/finder/productivity/', description: 'All self-hosted productivity tools in one quiz' },
    { name: 'Alternatives', path: '/alternatives/', description: '35+ self-hosted open source alternatives' },
  ],
  '/finder/chat/': [
    { name: 'Notes Finder', path: '/finder/notes/', description: 'Find your self-hosted note-taking app' },
    { name: 'Productivity Finder', path: '/finder/productivity/', description: 'All self-hosted productivity tools in one quiz' },
    { name: 'Alternatives', path: '/alternatives/', description: '35+ self-hosted open source alternatives' },
  ],
  '/finder/productivity/': [
    { name: 'Notes Finder', path: '/finder/notes/', description: 'Find your self-hosted note-taking app' },
    { name: 'Chat Finder', path: '/finder/chat/', description: 'Find your self-hosted team chat platform' },
    { name: 'Alternatives', path: '/alternatives/', description: '35+ self-hosted open source alternatives' },
  ],
  '/photos/': [
    { name: 'Alternatives', path: '/alternatives/', description: 'Self-hosted alternatives for 35+ SaaS tools' },
    { name: 'Compare', path: '/compare/', description: 'Side-by-side tool comparisons' },
  ],
  '/compare/': [
    { name: 'Alternatives', path: '/alternatives/', description: 'Browse all self-hosted alternatives' },
    { name: 'Docker Deploy', path: '/deploy/', description: 'Deploy your pick with Docker Compose' },
  ],
  '/deploy/': [
    { name: 'Alternatives', path: '/alternatives/', description: 'Find what to deploy' },
    { name: 'Cron Generator', path: '/cron-generator/', description: 'Set up cron jobs for your deployments' },
  ],
  '/voice-agent-pricing/': [
    { name: 'AI Cost Calculator', path: '/', description: 'Compare LLM API pricing per token' },
    { name: 'Cache Calculator', path: '/prompt-cache-calculator/', description: 'Save on prompt caching costs' },
    { name: 'Token Counter', path: '/token-counter/', description: 'Count tokens for any model' },
  ],
  '/token-tracker/': [
    { name: 'AI Cost Calculator', path: '/', description: 'Full cost breakdown per model' },
    { name: 'Token Counter', path: '/token-counter/', description: 'Count tokens before sending requests' },
    { name: 'LLM Pricing', path: '/llm-pricing/', description: '19 models across 5 providers' },
  ],
  '/token-counter/': [
    { name: 'AI Cost Calculator', path: '/', description: 'Calculate full API costs per model' },
    { name: 'Cache Calculator', path: '/prompt-cache-calculator/', description: 'See how caching reduces costs' },
  ],
  '/csp-generator/': [
    { name: 'PII Redactor', path: '/pii-redactor/', description: 'Strip PII from prompts' },
    { name: 'Env Scanner', path: '/env-scanner/', description: 'Scan .env files for leaked secrets' },
    { name: 'Agent Security', path: '/ai-agent-security/', description: 'Check AI agents for vulnerabilities' },
  ],
  '/prompt-cache-calculator/': [
    { name: 'AI Cost Calculator', path: '/', description: 'Full cost breakdown per model' },
    { name: 'Token Counter', path: '/token-counter/', description: 'Count tokens before sending' },
    { name: 'Voice Pricing', path: '/voice-agent-pricing/', description: 'TTS API cost comparison' },
  ],
  '/mcp-servers/': [
    { name: 'AI Code Review', path: '/ai-code-review/', description: 'Review AI-generated code before merge' },
    { name: 'Agent Security', path: '/ai-agent-security/', description: 'Scan agents for vulnerabilities' },
  ],
  '/pii-redactor/': [
    { name: 'CSP Generator', path: '/csp-generator/', description: 'Build CSP headers visually' },
    { name: 'Env Scanner', path: '/env-scanner/', description: 'Scan .env files for secrets' },
    { name: 'Dep Shield', path: '/dep-shield/', description: 'Scan npm dependencies for vulnerabilities' },
  ],
  '/env-scanner/': [
    { name: 'PII Redactor', path: '/pii-redactor/', description: 'Strip PII from prompts' },
    { name: 'CSP Generator', path: '/csp-generator/', description: 'Build CSP headers visually' },
    { name: 'Dep Shield', path: '/dep-shield/', description: 'Scan npm dependencies' },
  ],
  '/dep-shield/': [
    { name: 'Env Scanner', path: '/env-scanner/', description: 'Scan .env files for secrets' },
    { name: 'CSP Generator', path: '/csp-generator/', description: 'Build CSP headers' },
    { name: 'Agent Security', path: '/ai-agent-security/', description: 'Check AI agent security' },
  ],
  '/ai-agent-security/': [
    { name: 'Agent Safety', path: '/agent-safety/', description: '18-point safety checklist' },
    { name: 'Dep Shield', path: '/dep-shield/', description: 'Scan npm dependencies' },
    { name: 'PII Redactor', path: '/pii-redactor/', description: 'Strip PII from prompts' },
  ],
  '/ai-agent-data-access/': [
    { name: 'Agent Safety', path: '/agent-safety/', description: '18-point safety checklist' },
    { name: 'Voice Pricing', path: '/voice-agent-pricing/', description: 'TTS API cost comparison' },
  ],
  '/agent-safety/': [
    { name: 'Agent Security', path: '/ai-agent-security/', description: 'Scan for 17+ vulnerability types' },
    { name: 'AI Code Review', path: '/ai-code-review/', description: 'Review AI-generated code' },
    { name: 'PII Redactor', path: '/pii-redactor/', description: 'Strip PII from prompts' },
  ],
  '/ai-code-review/': [
    { name: 'Agent Security', path: '/ai-agent-security/', description: 'Scan AI agents for vulnerabilities' },
    { name: 'MCP Servers', path: '/mcp-servers/', description: 'Curated MCP server directory' },
    { name: 'PII Redactor', path: '/pii-redactor/', description: 'Strip PII from prompts' },
  ],
  '/llm-pricing/': [
    { name: 'AI Cost Calculator', path: '/', description: 'Full cost breakdown with token estimation' },
    { name: 'Cache Calculator', path: '/prompt-cache-calculator/', description: 'Save with prompt caching' },
    { name: 'Token Counter', path: '/token-counter/', description: 'Count tokens for any model' },
  ],
}

export function RelatedTools({ currentPath }: { currentPath: string }) {
  const tools = RELATED_MAP[currentPath]

  return (
    <section className="py-12 border-t border-[#e8e8ed] mt-16">
      {/* Scenario-based tool stacks — shown on homepage */}
      {currentPath === '/' && (
        <div className="mb-10">
          <h2 className="text-xl font-semibold text-[#1d1d1f] mb-6">Tool Stacks</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {TOOL_STACKS.map(stack => (
              <div key={stack.title} className="p-5 rounded-xl bg-[#f5f5f7] border border-[#e8e8ed]">
                <h3 className="font-semibold text-[#1d1d1f] mb-3 text-[15px]">{stack.title}</h3>
                <div className="space-y-1.5">
                  {stack.tools.map(tool => (
                    <a
                      key={tool.path}
                      href={tool.path}
                      className="block text-[14px] text-[#0071E3] hover:text-[#0077ED] transition-colors"
                    >
                      {tool.name}
                    </a>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Per-page related tools */}
      {tools && tools.length > 0 && (
        <>
          <h2 className="text-xl font-semibold text-[#1d1d1f] mb-6">Related Tools</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {tools.map(tool => (
              <a
                key={tool.path}
                href={tool.path}
                className="block p-4 rounded-xl border border-[#e8e8ed] hover:border-[#0071E3]/30 hover:bg-[#0071E3]/5 transition-colors"
              >
                <div className="font-medium text-[#0071E3] mb-1">{tool.name}</div>
                <div className="text-sm text-[#86868b]">{tool.description}</div>
              </a>
            ))}
          </div>
        </>
      )}
    </section>
  )
}
