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
      { name: 'Token Optimizer', path: '/token-optimizer/' },
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
    { name: 'Token Optimizer', path: '/token-optimizer/', description: 'Reduce token usage 20-40% by detecting prompt bloat' },
    { name: 'Cache Calculator', path: '/prompt-cache-calculator/', description: 'See how prompt caching cuts your API bill by 60%+' },
    { name: 'Token Counter', path: '/token-counter/', description: 'Count tokens before sending requests to avoid surprises' },
    { name: 'LLM Pricing', path: '/llm-pricing/', description: 'Side-by-side pricing for 31 models across 8 providers' },
    { name: 'Voice Pricing', path: '/voice-agent-pricing/', description: 'Compare TTS API costs across providers' },
    { name: 'Cron Generator', path: '/cron-generator/', description: 'Build cron schedules visually with 150+ patterns' },
    { name: 'Self-Hosted Alternatives', path: '/alternatives/', description: '45+ open source alternatives to SaaS tools' },
    { name: 'PII Redactor', path: '/pii-redactor/', description: 'Strip personal data from prompts client-side' },
    { name: 'API Costs Guide', path: '/guides/ai-api-costs/', description: '5-step guide to estimating and optimizing AI API costs' },
  ],
  '/cron-generator/': [
    { name: 'Cron Validator', path: '/cron-validator/', description: 'Validate cron expressions and get fix suggestions' },
    { name: 'Cron Patterns', path: '/cron-generator/common-patterns/', description: '150+ ready-to-use cron expressions' },
    { name: 'Docker Deploy', path: '/deploy/', description: 'Deploy self-hosted tools with Docker Compose' },
    { name: 'MCP Servers', path: '/mcp-servers/', description: 'Curated MCP server directory' },
    { name: 'Alternatives', path: '/alternatives/', description: 'Self-hosted alternatives for 45+ tools' },
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
    { name: 'Notes Finder', path: '/finder/notes/', description: 'Find your self-hosted note-taking app' },
    { name: 'Chat Finder', path: '/finder/chat/', description: 'Find your self-hosted team chat platform' },
    { name: 'AI Cost Calculator', path: '/', description: 'Compare API costs across all models' },
    { name: 'Free Photos', path: '/photos/', description: 'Free stock photos from Unsplash' },
    { name: 'Alternatives Guide', path: '/alternatives-guide/', description: 'Complete self-hosted guide with all 46 tools' },
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
    { name: 'Productivity Finder', path: '/finder/productivity/', description: 'Find the right tool with a guided quiz' },
    { name: 'Cron Generator', path: '/cron-generator/', description: 'Schedule deployments with cron' },
  ],
  '/deploy/': [
    { name: 'Alternatives', path: '/alternatives/', description: 'Find what to deploy' },
    { name: 'Cron Generator', path: '/cron-generator/', description: 'Set up cron jobs for your deployments' },
    { name: 'Compare', path: '/compare/', description: 'Compare tools before deploying' },
    { name: 'MCP Servers', path: '/mcp-servers/', description: 'Curated MCP server directory' },
    { name: 'Uptime Monitor Alt.', path: '/alternatives/uptime-kuma/', description: 'Monitor your deployments' },
  ],
  '/voice-agent-pricing/': [
    { name: 'AI Cost Calculator', path: '/', description: 'Compare LLM API pricing per token' },
    { name: 'Cache Calculator', path: '/prompt-cache-calculator/', description: 'Save on prompt caching costs' },
    { name: 'Token Counter', path: '/token-counter/', description: 'Count tokens for any model' },
  ],
  '/token-tracker/': [
    { name: 'AI Cost Calculator', path: '/', description: 'Full cost breakdown per model' },
    { name: 'Token Counter', path: '/token-counter/', description: 'Count tokens before sending requests' },
    { name: 'LLM Pricing', path: '/llm-pricing/', description: '31 models across 8 providers' },
  ],
  '/token-optimizer/': [
    { name: 'AI Cost Calculator', path: '/', description: 'Compare API costs across all models' },
    { name: 'Token Counter', path: '/token-counter/', description: 'Count tokens before sending requests' },
    { name: 'Cache Calculator', path: '/prompt-cache-calculator/', description: 'Save with prompt caching' },
  ],
  '/token-counter/': [
    { name: 'AI Cost Calculator', path: '/', description: 'Calculate full API costs per model' },
    { name: 'Token Optimizer', path: '/token-optimizer/', description: 'Reduce token usage by 20-40%' },
    { name: 'Cache Calculator', path: '/prompt-cache-calculator/', description: 'See how caching reduces costs' },
    { name: 'LLM Pricing', path: '/llm-pricing/', description: '31 models across 8 providers' },
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
    { name: 'LLM Pricing', path: '/llm-pricing/', description: '31 models across 8 providers' },
    { name: 'Token Optimizer', path: '/token-optimizer/', description: 'Reduce token usage 20-40%' },
  ],
  '/mcp-servers/': [
    { name: 'AI Code Review', path: '/ai-code-review/', description: 'Review AI-generated code before merge' },
    { name: 'Agent Security', path: '/ai-agent-security/', description: 'Scan agents for vulnerabilities' },
    { name: 'AI Cost Calculator', path: '/', description: 'Compare API costs' },
    { name: 'Docker Deploy', path: '/deploy/', description: 'Deploy MCP servers with Docker' },
    { name: 'Alternatives', path: '/alternatives/', description: 'Self-hosted tool alternatives' },
  ],
  '/pii-redactor/': [
    { name: 'CSP Generator', path: '/csp-generator/', description: 'Build CSP headers visually' },
    { name: 'Env Scanner', path: '/env-scanner/', description: 'Scan .env files for secrets' },
    { name: 'Dep Shield', path: '/dep-shield/', description: 'Scan npm dependencies for vulnerabilities' },
    { name: 'Agent Security', path: '/ai-agent-security/', description: 'Scan AI agents for vulnerabilities' },
    { name: 'Local LLM Privacy', path: '/local-llm-privacy/', description: 'Check local model privacy risks' },
  ],
  '/env-scanner/': [
    { name: 'PII Redactor', path: '/pii-redactor/', description: 'Strip PII from prompts' },
    { name: 'CSP Generator', path: '/csp-generator/', description: 'Build CSP headers visually' },
    { name: 'Dep Shield', path: '/dep-shield/', description: 'Scan npm dependencies' },
    { name: 'Agent Security', path: '/ai-agent-security/', description: 'Scan AI agents for vulnerabilities' },
    { name: 'Local LLM Privacy', path: '/local-llm-privacy/', description: 'Check local model privacy risks' },
  ],
  '/dep-shield/': [
    { name: 'Env Scanner', path: '/env-scanner/', description: 'Scan .env files for secrets' },
    { name: 'CSP Generator', path: '/csp-generator/', description: 'Build CSP headers' },
    { name: 'Agent Security', path: '/ai-agent-security/', description: 'Check AI agent security' },
    { name: 'PII Redactor', path: '/pii-redactor/', description: 'Strip PII from prompts' },
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
    { name: 'Token Optimizer', path: '/token-optimizer/', description: 'Reduce token usage 20-40%' },
    { name: 'Voice Pricing', path: '/voice-agent-pricing/', description: 'TTS API cost comparison' },
    { name: 'Alternatives', path: '/alternatives/', description: 'Self-hosted alternatives for 45+ SaaS tools' },
    { name: 'Self-Hosted Compare', path: '/compare/', description: 'Side-by-side tool comparisons' },
    { name: 'Testing Strategy', path: '/testing-strategy-picker/', description: 'Pick the right testing approach' },
    { name: 'All Models Comparison', path: '/llm-pricing/compare-all/', description: 'Complete pricing table for all 31 models' },
    { name: 'API Costs Guide', path: '/guides/ai-api-costs/', description: '5-step guide to calculating AI costs' },
  ],
  '/testing-strategy-picker/': [
    { name: 'AI Cost Calculator', path: '/', description: 'Compare LLM API pricing per token' },
    { name: 'AI Code Review', path: '/ai-code-review/', description: 'Review AI-generated code' },
    { name: 'Agent Security', path: '/ai-agent-security/', description: 'Check AI agents for vulnerabilities' },
    { name: 'Cron Generator', path: '/cron-generator/', description: 'Build cron schedules visually' },
    { name: 'MCP Servers', path: '/mcp-servers/', description: 'Curated MCP server directory' },
    { name: 'Alternatives', path: '/alternatives/', description: 'Self-hosted alternatives' },
  ],
  '/local-llm-privacy/': [
    { name: 'PII Redactor', path: '/pii-redactor/', description: 'Strip PII from prompts' },
    { name: 'Env Scanner', path: '/env-scanner/', description: 'Scan .env files for secrets' },
    { name: 'Agent Security', path: '/ai-agent-security/', description: 'Check AI agents for vulnerabilities' },
    { name: 'CSP Generator', path: '/csp-generator/', description: 'Build CSP headers visually' },
    { name: 'Dep Shield', path: '/dep-shield/', description: 'Scan npm dependencies' },
    { name: 'AI Cost Calculator', path: '/', description: 'Compare API vs self-hosted costs' },
  ],
  '/llm-pricing/compare-all/': [
    { name: 'LLM Pricing', path: '/llm-pricing/', description: 'Interactive pricing comparison table' },
    { name: 'Cost Calculator', path: '/llm-pricing/llm-cost-calculator/', description: 'Estimate monthly spending' },
    { name: 'Cost Comparison', path: '/llm-pricing/llm-cost-comparison/', description: 'Provider-by-provider analysis' },
    { name: 'Cost Optimization', path: '/llm-pricing/llm-cost-optimization/', description: '7 ways to cut spending by 60%' },
    { name: 'API Costs Guide', path: '/guides/ai-api-costs/', description: '5-step guide to calculating AI costs' },
    { name: 'Token Counter', path: '/token-counter/', description: 'Count tokens before sending' },
  ],
  '/alternatives-guide/': [
    { name: 'Browse Alternatives', path: '/alternatives/', description: 'Full directory of self-hosted tools' },
    { name: 'Docker Deploy', path: '/deploy/', description: 'Deploy with Docker Compose' },
    { name: 'Compare Tools', path: '/compare/', description: 'Side-by-side comparisons' },
    { name: 'Productivity Finder', path: '/finder/productivity/', description: 'Find the right tool with a quiz' },
    { name: 'Notes Finder', path: '/finder/notes/', description: 'Self-hosted note-taking apps' },
    { name: 'Chat Finder', path: '/finder/chat/', description: 'Self-hosted team chat platforms' },
  ],
  '/guides/ai-api-costs/': [
    { name: 'AI Cost Calculator', path: '/', description: 'Full cost breakdown per model' },
    { name: 'LLM Pricing', path: '/llm-pricing/', description: 'Side-by-side pricing for 31 models' },
    { name: 'Token Counter', path: '/token-counter/', description: 'Count tokens for any model' },
    { name: 'Token Optimizer', path: '/token-optimizer/', description: 'Reduce token usage 20-40%' },
    { name: 'Cache Calculator', path: '/prompt-cache-calculator/', description: 'Save 60-90% with prompt caching' },
    { name: 'Pricing Comparison', path: '/llm-pricing/compare-all/', description: 'All 31 models in one table' },
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
