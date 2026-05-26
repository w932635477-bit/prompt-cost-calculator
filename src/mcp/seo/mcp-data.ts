// src/mcp/seo/mcp-data.ts
// Curated MCP server data — 10 deep entries for SEO-driven decision pages.
// All descriptions, use-cases, and pitfalls are written from scratch (not scraped).
//
// Source URLs link to official repos as references only. We do NOT mirror their content.

export type MCPCategory =
  | 'browser'
  | 'code'
  | 'data'
  | 'search'
  | 'files'
  | 'devops'
  | 'api'
  | 'productivity'
  | 'other'

export const CATEGORY_LABELS: Record<MCPCategory, string> = {
  browser: 'Browser',
  code: 'Code',
  data: 'Data',
  search: 'Search',
  files: 'Files & Docs',
  devops: 'DevOps',
  api: 'API',
  productivity: 'Productivity',
  other: 'Other',
}

export const CATEGORY_DESCRIPTIONS: Record<MCPCategory, string> = {
  browser: 'Let your AI inspect, navigate, or scrape live web pages.',
  code: 'Read, search, refactor, or run code in repositories and dev sandboxes.',
  data: 'Query SQL, NoSQL, vector, or analytics databases without writing wrappers.',
  search: 'Web, semantic, and knowledge-graph search piped into the model.',
  files: 'Read, write, and search files, PDFs, and documents on disk or in cloud storage.',
  devops: 'Deploy, monitor, and operate infrastructure and CI/CD via natural language.',
  api: 'Talk to third-party APIs (Slack, GitHub, Linear, Stripe...) from one client.',
  productivity: 'Calendars, notes, tasks, and personal data automation.',
  other: 'Specialty or experimental servers worth knowing about.',
}

export interface MCPServer {
  slug: string
  name: string
  category: MCPCategory
  oneLiner: string                 // one-sentence description (≤ 100 chars)
  description: string              // 2-3 sentence overview
  useCase: string[]                // 3-5 concrete "use this when..." scenarios
  whenNot: string[]                // 2-3 "don't use this if..." anti-patterns
  installCommand: string           // npx / pip / docker
  claudeDesktopConfig: object      // JSON snippet for claude_desktop_config.json
  cursorConfig?: object            // JSON snippet for cursor mcp.json (if differs)
  envVars: { key: string; required: boolean; note: string }[]
  commonPitfalls: string[]         // 2-4 install/use gotchas we've seen
  vsAlternative?: { name: string; pickThis: string; pickOther: string }
  sourceUrl: string                // official repo
  officialBy: 'anthropic' | 'community'
  popularity: 'high' | 'medium' | 'emerging'
}

export const MCP_SERVERS: MCPServer[] = [
  {
    slug: 'filesystem',
    name: 'Filesystem',
    category: 'files',
    oneLiner: 'Read and write files in directories you allow-list.',
    description:
      'Anthropic\'s reference filesystem server gives Claude scoped access to local directories. You allow-list specific folders; the model can list, read, write, search, and move files within those bounds. The de-facto starting point for any local file workflow.',
    useCase: [
      'Reviewing a project directory before answering questions about it',
      'Generating new files (code, docs, configs) directly into a workspace',
      'Renaming or reorganizing many files based on natural-language rules',
      'Searching across large doc collections without uploading them',
    ],
    whenNot: [
      'Reading from S3, Google Drive, or other cloud storage (use a cloud-specific server)',
      'When you need transactional writes or file locking (no atomic guarantees)',
      'For untrusted directories with secrets — the model sees everything in scope',
    ],
    installCommand: 'npx -y @modelcontextprotocol/server-filesystem /Users/you/projects',
    claudeDesktopConfig: {
      mcpServers: {
        filesystem: {
          command: 'npx',
          args: ['-y', '@modelcontextprotocol/server-filesystem', '/Users/you/projects'],
        },
      },
    },
    envVars: [],
    commonPitfalls: [
      'Forgetting to restart Claude Desktop after editing the JSON — config is read once at startup',
      'Pointing it at your home directory by mistake — the model can read everything in scope',
      'Path arguments are positional, not flags — multiple paths work but absolute paths only',
    ],
    vsAlternative: {
      name: 'Google Drive MCP',
      pickThis: 'when files live on the same machine as Claude Desktop',
      pickOther: 'when files are in Google Drive and shared across teammates',
    },
    sourceUrl: 'https://github.com/modelcontextprotocol/servers/tree/main/src/filesystem',
    officialBy: 'anthropic',
    popularity: 'high',
  },

  {
    slug: 'github',
    name: 'GitHub',
    category: 'code',
    oneLiner: 'Read repos, manage issues, open PRs from inside Claude or Cursor.',
    description:
      'GitHub MCP exposes the GitHub REST and GraphQL APIs as tools the model can call. It can read code, search across repos, create branches, push commits, manage issues, and open pull requests. Requires a personal access token with the right scopes.',
    useCase: [
      'Asking Claude to find every TODO across all your repos',
      'Generating a PR that fixes a bug, with a descriptive title and body, in one step',
      'Triaging issues into labels based on natural-language categories',
      'Cross-repo refactors that touch a private monorepo and a public SDK',
    ],
    whenNot: [
      'Self-hosted Gitea or GitLab (use the dedicated server for those)',
      'When you only need read access — the filesystem server + git CLI is faster locally',
      'CI/CD operations — use a workflow runner directly, not the model',
    ],
    installCommand: 'npx -y @modelcontextprotocol/server-github',
    claudeDesktopConfig: {
      mcpServers: {
        github: {
          command: 'npx',
          args: ['-y', '@modelcontextprotocol/server-github'],
          env: { GITHUB_PERSONAL_ACCESS_TOKEN: 'ghp_xxx' },
        },
      },
    },
    envVars: [
      { key: 'GITHUB_PERSONAL_ACCESS_TOKEN', required: true, note: 'Fine-grained token recommended; minimum scopes: repo, read:org' },
    ],
    commonPitfalls: [
      'Token with too-wide scopes — fine-grained PAT scoped to specific repos is safer',
      'Rate limits hit fast on big monorepos; cache or narrow your queries',
      'GraphQL pagination errors silently — verify expected counts on big result sets',
      'Don\'t commit the token to claude_desktop_config.json if you sync the file',
    ],
    sourceUrl: 'https://github.com/modelcontextprotocol/servers/tree/main/src/github',
    officialBy: 'anthropic',
    popularity: 'high',
  },

  {
    slug: 'puppeteer',
    name: 'Puppeteer',
    category: 'browser',
    oneLiner: 'Navigate, click, screenshot, and scrape live web pages.',
    description:
      'Puppeteer MCP runs a headless Chromium that the model controls. Useful for scraping JS-rendered pages, testing flows, taking screenshots of staging deploys, and verifying that "did the deploy actually update the homepage" without leaving Claude.',
    useCase: [
      'Verifying a Vercel preview deploy actually shows the new content',
      'Scraping a JS-heavy page that fetch + readability cannot parse',
      'Testing a login flow end-to-end with screenshot evidence',
      'Capturing competitor pages for design or pricing comparison',
    ],
    whenNot: [
      'Anti-bot protected sites (Cloudflare Turnstile, hCaptcha) — will fail',
      'When you only need page text — use a Fetch MCP, much lighter',
      'Long-running monitoring — Puppeteer is per-call, not persistent',
    ],
    installCommand: 'npx -y @modelcontextprotocol/server-puppeteer',
    claudeDesktopConfig: {
      mcpServers: {
        puppeteer: {
          command: 'npx',
          args: ['-y', '@modelcontextprotocol/server-puppeteer'],
        },
      },
    },
    envVars: [],
    commonPitfalls: [
      'First call downloads ~150MB Chromium — patience on initial install',
      'Headless detection on some sites — set userAgent or use Playwright instead',
      'Screenshots over 1MB get truncated in some clients — scope to viewport',
    ],
    vsAlternative: {
      name: 'Chrome DevTools MCP',
      pickThis: 'for headless server-side automation, no UI needed',
      pickOther: 'when you want Claude to inspect your already-open Chrome tabs',
    },
    sourceUrl: 'https://github.com/modelcontextprotocol/servers/tree/main/src/puppeteer',
    officialBy: 'anthropic',
    popularity: 'high',
  },

  {
    slug: 'postgres',
    name: 'Postgres',
    category: 'data',
    oneLiner: 'Query Postgres databases with SQL the model writes for you.',
    description:
      'Connects to any Postgres instance via connection string. The model can list schemas, inspect tables, run SELECT queries, and (with explicit permission) execute writes. Ships with a read-only mode that prevents accidental UPDATE/DELETE.',
    useCase: [
      '"How many active users signed up last week" — model writes the SQL',
      'Schema migrations review: ask Claude to inspect current shape vs target',
      'Debugging slow queries with EXPLAIN ANALYZE without leaving the chat',
      'Generating sample data for tests based on real distributions',
    ],
    whenNot: [
      'Production databases without read-only mode + connection allow-listing',
      'Very large result sets — output is token-bounded; aggregate first',
      'Non-Postgres SQL dialects (MSSQL, Oracle) — use a different server',
    ],
    installCommand: 'npx -y @modelcontextprotocol/server-postgres postgresql://user:pass@host:5432/db',
    claudeDesktopConfig: {
      mcpServers: {
        postgres: {
          command: 'npx',
          args: ['-y', '@modelcontextprotocol/server-postgres', 'postgresql://user:pass@host:5432/db'],
        },
      },
    },
    envVars: [],
    commonPitfalls: [
      'Connection string in plain JSON — use a separate read-only role, not your superuser',
      'Always start in read-only mode for prod; promote to writes only for dev',
      'pg_hba.conf on managed PG (Supabase, RDS) often blocks new IPs — allow-list first',
    ],
    sourceUrl: 'https://github.com/modelcontextprotocol/servers/tree/main/src/postgres',
    officialBy: 'anthropic',
    popularity: 'high',
  },

  {
    slug: 'sqlite',
    name: 'SQLite',
    category: 'data',
    oneLiner: 'Query and modify SQLite databases on disk.',
    description:
      'Lightweight server pointing at a single SQLite file. Read-only by default unless you flip a flag. Perfect for ad-hoc analysis of app databases (Apple Photos, Things, browser history) or for prototype data that doesn\'t need a real DB.',
    useCase: [
      'Analyzing your iMessage chat.db for word frequencies',
      'Querying browser history.db for time-tracking insights',
      'Local prototyping where Postgres is overkill',
      'Reading a SQLite file an app exported as a backup',
    ],
    whenNot: [
      'Multi-user databases — SQLite locks aggressively under concurrent writes',
      'When the data is in Postgres or MySQL — use those servers directly',
      'Very large databases (10GB+) — query times balloon',
    ],
    installCommand: 'npx -y @modelcontextprotocol/server-sqlite /path/to/db.sqlite',
    claudeDesktopConfig: {
      mcpServers: {
        sqlite: {
          command: 'npx',
          args: ['-y', '@modelcontextprotocol/server-sqlite', '/Users/you/Library/Messages/chat.db'],
        },
      },
    },
    envVars: [],
    commonPitfalls: [
      'macOS protected paths (Messages, Mail) require Full Disk Access for the terminal Claude Desktop launches with',
      'Don\'t point at write-locked files an app is using — copy first',
      'WAL files (.db-wal, .db-shm) need to be in the same dir; copy all three',
    ],
    sourceUrl: 'https://github.com/modelcontextprotocol/servers/tree/main/src/sqlite',
    officialBy: 'anthropic',
    popularity: 'high',
  },

  {
    slug: 'brave-search',
    name: 'Brave Search',
    category: 'search',
    oneLiner: 'Web search results piped into the model, free tier 2k/month.',
    description:
      'Brave\'s independent search API as an MCP server. Returns snippets and URLs the model can then fetch. The free tier is generous enough for personal research; paid tiers scale to millions of queries.',
    useCase: [
      'Asking "what changed in TypeScript 5.7" and getting current results',
      'Research on niche topics where Wikipedia or training data are stale',
      'Citation hunting — get URLs to ground a claim',
      'Competitive analysis: "compare pricing across X, Y, Z"',
    ],
    whenNot: [
      'When you need Google ranking specifically (Brave\'s index differs)',
      'For semantic search over your own docs (use Exa or a vector DB)',
      'High-volume scraping — they\'ll rate-limit you fast',
    ],
    installCommand: 'npx -y @modelcontextprotocol/server-brave-search',
    claudeDesktopConfig: {
      mcpServers: {
        'brave-search': {
          command: 'npx',
          args: ['-y', '@modelcontextprotocol/server-brave-search'],
          env: { BRAVE_API_KEY: 'BSAxxx' },
        },
      },
    },
    envVars: [
      { key: 'BRAVE_API_KEY', required: true, note: 'Free tier at search.brave.com/api, 2000 queries/month' },
    ],
    commonPitfalls: [
      'Free tier rate-limits at ~1 query/second; bursty workloads get 429',
      'Image and news search are separate endpoints — default is web only',
      'Some regional results differ from Google — verify if you need parity',
    ],
    sourceUrl: 'https://github.com/modelcontextprotocol/servers/tree/main/src/brave-search',
    officialBy: 'anthropic',
    popularity: 'high',
  },

  {
    slug: 'slack',
    name: 'Slack',
    category: 'api',
    oneLiner: 'Read channels, post messages, manage threads from Claude.',
    description:
      'Talk to your Slack workspace as tools. Read channel history, post messages, react with emojis, manage threads, look up users. Requires a Slack bot token. Useful for summarizing standups, drafting announcements, or triaging DMs.',
    useCase: [
      'Daily standup summary across 5 channels in one prompt',
      'Drafting a launch announcement, then posting to #general after review',
      'Finding the message where someone mentioned a specific bug',
      'Bulk-reacting to messages in a moderation backlog',
    ],
    whenNot: [
      'Discord — use the Discord MCP instead',
      'When you need real-time webhooks (MCP is request-driven)',
      'Cross-workspace operations — bot tokens are per-workspace',
    ],
    installCommand: 'npx -y @modelcontextprotocol/server-slack',
    claudeDesktopConfig: {
      mcpServers: {
        slack: {
          command: 'npx',
          args: ['-y', '@modelcontextprotocol/server-slack'],
          env: { SLACK_BOT_TOKEN: 'xoxb-xxx', SLACK_TEAM_ID: 'T0xxxx' },
        },
      },
    },
    envVars: [
      { key: 'SLACK_BOT_TOKEN', required: true, note: 'Bot User OAuth Token, starts with xoxb-' },
      { key: 'SLACK_TEAM_ID', required: true, note: 'Workspace ID, looks like T0XXXXXXX' },
    ],
    commonPitfalls: [
      'Bot needs to be invited to private channels first; it sees nothing in channels it isn\'t in',
      'Posting tokens in JSON config = audit risk; use env vars from a secret manager',
      'OAuth scopes matter: need channels:history, chat:write, users:read minimum',
    ],
    sourceUrl: 'https://github.com/modelcontextprotocol/servers/tree/main/src/slack',
    officialBy: 'anthropic',
    popularity: 'high',
  },

  {
    slug: 'fetch',
    name: 'Fetch',
    category: 'browser',
    oneLiner: 'Fetch a URL and return clean text, the lightweight Puppeteer.',
    description:
      'Simple HTTP fetcher that converts pages to readable markdown. No browser, no JS execution — just requests + readability. Fast, cheap, and good enough for static sites, blog posts, RSS feeds, and well-marked-up content.',
    useCase: [
      'Reading a blog post the model hasn\'t seen before',
      'Pulling docs pages into context',
      'Summarizing news articles from a feed',
      'Quick research without firing up a full browser',
    ],
    whenNot: [
      'Pages that require JS to render content (use Puppeteer)',
      'Pages behind auth (no cookie support; use a domain-specific server)',
      'Multi-page flows or interactions (clicking, filling forms)',
    ],
    installCommand: 'npx -y @modelcontextprotocol/server-fetch',
    claudeDesktopConfig: {
      mcpServers: {
        fetch: {
          command: 'npx',
          args: ['-y', '@modelcontextprotocol/server-fetch'],
        },
      },
    },
    envVars: [],
    commonPitfalls: [
      'No JS — SPAs return empty content; check by curling first',
      'Robots.txt is respected; some sites block all bots',
      'Content > 100KB gets truncated; ask the model to chunk and re-fetch',
    ],
    vsAlternative: {
      name: 'Puppeteer MCP',
      pickThis: 'for static, server-rendered pages — 10x faster',
      pickOther: 'when JS execution is required',
    },
    sourceUrl: 'https://github.com/modelcontextprotocol/servers/tree/main/src/fetch',
    officialBy: 'anthropic',
    popularity: 'high',
  },

  {
    slug: 'memory',
    name: 'Memory',
    category: 'productivity',
    oneLiner: 'Persistent knowledge graph the model can recall across sessions.',
    description:
      'A simple graph database the model writes facts into and queries later. Survives across Claude Desktop sessions. Useful for "remember that I prefer X" or for building up project context over weeks. The poor-person\'s long-term memory.',
    useCase: [
      'Remembering project conventions across multiple chats',
      'Tracking people: "Sarah is the eng lead on auth, Bob does infra"',
      'Building a personal knowledge base of decisions over time',
      'Cross-session continuity for ongoing research',
    ],
    whenNot: [
      'Short-term reminders within one chat (just paste them)',
      'Sensitive data (it\'s a local SQLite, but no encryption at rest)',
      'When you have CRMs or note apps — use those servers directly',
    ],
    installCommand: 'npx -y @modelcontextprotocol/server-memory',
    claudeDesktopConfig: {
      mcpServers: {
        memory: {
          command: 'npx',
          args: ['-y', '@modelcontextprotocol/server-memory'],
        },
      },
    },
    envVars: [
      { key: 'MEMORY_FILE_PATH', required: false, note: 'Override default ~/.local/share/mcp-memory location' },
    ],
    commonPitfalls: [
      'Model has to be told "remember this" or "check what you know about X" — not automatic',
      'Knowledge graph queries can return stale facts; explicit overwrite needed',
      'No multi-user mode — this is per-machine, not shared',
    ],
    sourceUrl: 'https://github.com/modelcontextprotocol/servers/tree/main/src/memory',
    officialBy: 'anthropic',
    popularity: 'medium',
  },

  {
    slug: 'sentry',
    name: 'Sentry',
    category: 'devops',
    oneLiner: 'Pull error events and issue context into Claude for triage.',
    description:
      'Connects to your Sentry org and lets the model query issues, list events, fetch stack traces, and update issue status. Pairs naturally with the GitHub MCP for "find the regression, write the fix, open a PR" flows.',
    useCase: [
      '"What\'s the most-impacting error this week" with full stack trace',
      'Triaging unowned issues by inferring component from stack',
      'Generating fix PRs from a Sentry event with full context',
      'Periodic error report drafted into a Slack message',
    ],
    whenNot: [
      'Bugsnag, Rollbar, or other APMs — different servers',
      'Real-time alerting (use Sentry\'s native alert rules, not the MCP)',
      'Read-only org access — write ops need user-level token',
    ],
    installCommand: 'npx -y @sentry/mcp-server',
    claudeDesktopConfig: {
      mcpServers: {
        sentry: {
          command: 'npx',
          args: ['-y', '@sentry/mcp-server'],
          env: { SENTRY_AUTH_TOKEN: 'sntrys_xxx' },
        },
      },
    },
    envVars: [
      { key: 'SENTRY_AUTH_TOKEN', required: true, note: 'User token from settings/account/api/auth-tokens' },
      { key: 'SENTRY_ORG', required: true, note: 'Org slug from Sentry URL' },
    ],
    commonPitfalls: [
      'Auth token must have project:read minimum; defaults are too narrow',
      'Self-hosted Sentry needs SENTRY_HOST env var pointing at your URL',
      'Issue list paginates at 25; ask for specific issue IDs for deep dives',
    ],
    sourceUrl: 'https://github.com/getsentry/sentry-mcp',
    officialBy: 'community',
    popularity: 'medium',
  },
]

export const LAST_UPDATED = '2026-05-26'
