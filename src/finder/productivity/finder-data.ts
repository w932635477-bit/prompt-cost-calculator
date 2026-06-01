// src/finder/productivity/finder-data.ts
// Self-Hosted Productivity Tool Finder — 15 tools across 5 categories + scenario weights

export type ToolCategory = 'wiki' | 'project_management' | 'notes' | 'chat' | 'automation'

export type WizardOption = {
  need: ToolCategory
  team: 'solo' | 'small_team' | 'enterprise'
  tech: 'beginner' | 'intermediate' | 'advanced'
  host: 'docker' | 'lightweight' | 'managed' | 'full_control'
}

export type Tag =
  // Category
  | 'wiki' | 'project_management' | 'notes' | 'chat' | 'automation'
  // Team size
  | 'solo' | 'small_team' | 'enterprise'
  // Tech level
  | 'beginner' | 'intermediate' | 'advanced'
  // Deployment
  | 'docker' | 'lightweight' | 'managed' | 'full_control' | 'raspberry_pi'
  // Features
  | 'collaboration' | 'kanban' | 'gantt' | 'realtime_edit'
  | 'e2e_encryption' | 'sso' | 'ldap' | 'rbac' | 'audit_log'
  | 'webhook' | 'api_access' | 'search' | 'markdown_native'
  | 'mobile' | 'desktop' | 'web_only'
  | 'scalable' | 'plugin_ecosystem'

export interface ProductivityTool {
  name: string
  tagline: string
  logo: string
  url: string
  github: string
  license: string
  pricing: string
  difficulty: 'Easy' | 'Medium' | 'Hard'
  tags: Tag[]
  pros: string[]
  cons: string[]
  dockerCompose?: string
  category: ToolCategory
  existingAltSlug?: string
  existingCompareSlug?: string
}

// 15 tools — 3 per category
export const PRODUCTIVITY_TOOLS: ProductivityTool[] = [
  // ── Wiki (3) ──
  {
    name: 'Docmost',
    tagline: 'Modern collaborative wiki and knowledge base',
    logo: '📖',
    url: 'https://docmost.com',
    github: 'https://github.com/docmost/docmost',
    license: 'AGPL-3.0',
    pricing: 'Free (self-hosted) / Cloud $8/user/mo',
    difficulty: 'Easy',
    category: 'wiki',
    tags: ['wiki', 'solo', 'small_team', 'enterprise', 'beginner', 'docker',
           'collaboration', 'realtime_edit', 'search', 'markdown_native',
           'web_only', 'scalable', 'rbac', 'sso'],
    pros: [
      'Real-time collaborative editing (like Notion)',
      'Clean, modern UI with page tree navigation',
      'Single Docker container — easy to deploy',
      'Spaces for organizing team knowledge',
    ],
    cons: [
      'Young project — still adding features',
      'No offline mode or mobile app',
      'Limited integrations compared to BookStack',
    ],
    dockerCompose: `services:
  docmost:
    image: docmost/docmost:latest
    ports: ["3000:3000"]
    volumes:
      - docmost_data:/app/data
    depends_on: [postgres, redis]
  postgres:
    image: postgres:16-alpine
    environment:
      POSTGRES_DB: docmost
      POSTGRES_USER: docmost
      POSTGRES_PASSWORD: docmost
  redis:
    image: redis:7-alpine
volumes:
  docmost_data:`,
    existingAltSlug: 'docmost',
  },
  {
    name: 'BookStack',
    tagline: 'Documentation platform organized by Books, Chapters, and Pages',
    logo: '📚',
    url: 'https://www.bookstackapp.com',
    github: 'https://github.com/BookStackApp/BookStack',
    license: 'MIT',
    pricing: 'Free',
    difficulty: 'Easy',
    category: 'wiki',
    tags: ['wiki', 'solo', 'small_team', 'beginner', 'docker', 'lightweight',
           'collaboration', 'search', 'markdown_native', 'web_only',
           'rbac', 'ldap', 'sso', 'api_access'],
    pros: [
      'MIT license — most permissive wiki option',
      'Intuitive Book → Chapter → Page hierarchy',
      'Built-in WYSIWYG and Markdown editors',
      'LDAP, SAML, OIDC authentication support',
      'Strong API for automation',
    ],
    cons: [
      'Not a real-time collaborative editor',
      'PHP-based (some teams prefer Node/Go)',
      'Limited page templates compared to Confluence',
    ],
    dockerCompose: `services:
  bookstack:
    image: lscr.io/linuxserver/bookstack:latest
    ports: ["6875:80"]
    volumes:
      - bookstack_data:/config
    depends_on: [mariadb]
  mariadb:
    image: mariadb:11
    environment:
      MYSQL_ROOT_PASSWORD: root
      MYSQL_DATABASE: bookstack
      MYSQL_USER: bookstack
      MYSQL_PASSWORD: bookstack
volumes:
  bookstack_data:`,
    existingAltSlug: 'confluence',
  },
  {
    name: 'Wiki.js',
    tagline: 'Powerful wiki engine with multiple storage backends',
    logo: '📝',
    url: 'https://js.wiki',
    github: 'https://github.com/requarks/wiki',
    license: 'AGPL-3.0',
    pricing: 'Free',
    difficulty: 'Medium',
    category: 'wiki',
    tags: ['wiki', 'small_team', 'enterprise', 'intermediate', 'docker',
           'collaboration', 'search', 'markdown_native', 'web_only',
           'rbac', 'sso', 'ldap', 'api_access', 'scalable'],
    pros: [
      'Multiple storage backends (Git, S3, Azure, local)',
      'Built-in authentication with 20+ providers',
      'GraphQL API for deep integrations',
      'Supports Markdown, WYSIWYG, HTML, and raw code blocks',
    ],
    cons: [
      'Node.js + PostgreSQL required',
      'UI can feel complex for simple use cases',
      'Not as lightweight as BookStack',
    ],
    dockerCompose: `services:
  wiki:
    image: requarks/wiki:2
    ports: ["3000:3000"]
    volumes:
      - wiki_data:/wiki/data
    depends_on: [postgres]
  postgres:
    image: postgres:16-alpine
    environment:
      POSTGRES_DB: wiki
      POSTGRES_USER: wiki
      POSTGRES_PASSWORD: wiki
volumes:
  wiki_data:`,
    existingAltSlug: 'confluence',
  },

  // ── Project Management (3) ──
  {
    name: 'OpenProject',
    tagline: 'Full-featured project management with Gantt, Agile, and BIM',
    logo: '📋',
    url: 'https://openproject.org',
    github: 'https://github.com/opf/openproject',
    license: 'GPL-3.0 (community)',
    pricing: 'Free (community) / Enterprise $7.25/user/mo',
    difficulty: 'Hard',
    category: 'project_management',
    tags: ['project_management', 'small_team', 'enterprise', 'advanced', 'docker', 'full_control',
           'collaboration', 'kanban', 'gantt', 'realtime_edit', 'search',
           'rbac', 'sso', 'ldap', 'api_access', 'scalable', 'web_only'],
    pros: [
      'Gantt charts with dependencies and milestones',
      'Built-in time tracking and cost reporting',
      'BIM support for construction teams',
      'Enterprise-grade with SSO/SAML/LDAP',
    ],
    cons: [
      'Complex setup — steep learning curve',
      'Resource-heavy (needs 4GB+ RAM)',
      'UI feels dated compared to modern tools',
    ],
    dockerCompose: `services:
  openproject:
    image: openproject/community:latest
    ports: ["8080:80"]
    volumes:
      - op_data:/var/openproject
    restart: unless-stopped
volumes:
  op_data:`,
    existingCompareSlug: 'openproject-vs-plane',
  },
  {
    name: 'Taiga',
    tagline: 'Agile project management for cross-functional teams',
    logo: '🎯',
    url: 'https://taiga.io',
    github: 'https://github.com/kaleidos-ventures/taiga',
    license: 'MPL-2.0',
    pricing: 'Free (self-hosted) / Cloud $5/user/mo',
    difficulty: 'Medium',
    category: 'project_management',
    tags: ['project_management', 'small_team', 'intermediate', 'docker', 'full_control',
           'collaboration', 'kanban', 'search', 'webhook',
           'rbac', 'api_access', 'web_only'],
    pros: [
      'Clean UI designed for Agile/Scrum workflows',
      'Built-in sprint planning, backlog, and epics',
      'Kanban and Scrum boards in one project',
      'Good import from Jira, Trello, Asana, and GitHub',
    ],
    cons: [
      'No Gantt charts or timeline view',
      'Docker setup requires multiple containers',
      'Community version lacks some enterprise features',
    ],
    dockerCompose: `services:
  taiga:
    image: taiga/taiga:latest
    ports: ["9000:80"]
    volumes:
      - taiga_data:/taiga-back/media
    depends_on: [postgres, rabbitmq, redis]
  postgres:
    image: postgres:14
    environment:
      POSTGRES_DB: taiga
      POSTGRES_USER: taiga
      POSTGRES_PASSWORD: taiga
  rabbitmq:
    image: rabbitmq:3-management
  redis:
    image: redis:7-alpine
volumes:
  taiga_data:`,
    existingAltSlug: 'jira',
  },
  {
    name: 'Plane',
    tagline: 'Modern issue tracker and project planner inspired by Linear',
    logo: '✈️',
    url: 'https://plane.so',
    github: 'https://github.com/makeplane/plane',
    license: 'AGPL-3.0',
    pricing: 'Free (self-hosted) / Cloud $7/user/mo',
    difficulty: 'Medium',
    category: 'project_management',
    tags: ['project_management', 'solo', 'small_team', 'intermediate', 'docker',
           'collaboration', 'kanban', 'search', 'webhook',
           'api_access', 'web_only', 'scalable'],
    pros: [
      'Fast, modern UI inspired by Linear and Jira',
      'Cycles, modules, and views for flexible organization',
      'GitHub, GitLab, and Slack integrations',
      'Active development with frequent releases',
    ],
    cons: [
      'No Gantt charts or time tracking',
      'Still maturing — some features in progress',
      'SSO only in enterprise tier',
    ],
    dockerCompose: `services:
  plane:
    image: makeplane/plane:latest
    ports: ["3000:3000"]
    volumes:
      - plane_data:/app/data
    depends_on: [postgres, redis]
  postgres:
    image: postgres:16-alpine
    environment:
      POSTGRES_DB: plane
      POSTGRES_USER: plane
      POSTGRES_PASSWORD: plane
  redis:
    image: redis:7-alpine
volumes:
  plane_data:`,
    existingCompareSlug: 'openproject-vs-plane',
  },

  // ── Notes (3) ──
  {
    name: 'Logseq',
    tagline: 'Privacy-first outliner with graph view and PDF annotations',
    logo: '🔗',
    url: 'https://logseq.com',
    github: 'https://github.com/logseq/logseq',
    license: 'AGPL-3.0',
    pricing: 'Free',
    difficulty: 'Easy',
    category: 'notes',
    tags: ['notes', 'solo', 'beginner', 'lightweight', 'full_control',
           'search', 'markdown_native', 'desktop', 'raspberry_pi'],
    pros: [
      'Outliner paradigm with powerful graph view',
      'Markdown + Org-mode dual support',
      'Built-in flashcards (spaced repetition)',
      'Fully local-first, your data never leaves your device',
    ],
    cons: [
      'No first-party mobile app for self-hosted',
      'Performance issues with very large graphs',
      'No real-time collaboration',
    ],
    existingAltSlug: 'obsidian',
  },
  {
    name: 'AppFlowy',
    tagline: 'Open-source workspace with rich text + databases (Notion-like)',
    logo: '📝',
    url: 'https://appflowy.com',
    github: 'https://github.com/AppFlowy-IO/AppFlowy',
    license: 'AGPL-3.0',
    pricing: 'Free (self-hosted) / Cloud $10/mo',
    difficulty: 'Easy',
    category: 'notes',
    tags: ['notes', 'solo', 'small_team', 'beginner', 'lightweight',
           'collaboration', 'kanban', 'search', 'markdown_native',
           'desktop', 'mobile'],
    pros: [
      'Closest open-source clone of Notion',
      'Built-in databases, kanban boards, rich text',
      'Native desktop + mobile apps',
      'Can import directly from Notion',
    ],
    cons: [
      'Self-hosting requires manual build',
      'Smaller plugin ecosystem than Obsidian',
      'Still maturing for enterprise use',
    ],
    existingAltSlug: 'notion',
  },
  {
    name: 'Outline',
    tagline: 'Fast collaborative team wiki with real-time editing',
    logo: '📄',
    url: 'https://getoutline.com',
    github: 'https://github.com/outline/outline',
    license: 'BSL-1.1',
    pricing: 'Free (self-hosted) / Cloud $10/user/mo',
    difficulty: 'Medium',
    category: 'notes',
    tags: ['notes', 'small_team', 'enterprise', 'intermediate', 'docker',
           'collaboration', 'realtime_edit', 'search', 'markdown_native',
           'rbac', 'sso', 'web_only', 'scalable', 'api_access'],
    pros: [
      'Real-time collaborative editing',
      'Excellent search and SSO for enterprise',
      'Slack and Teams integrations',
      'Clean modern interface',
    ],
    cons: [
      'BSL-1.1 license (not pure open source)',
      'Requires PostgreSQL + Redis',
      'Less suitable for personal note-taking',
    ],
    existingAltSlug: 'notion',
  },

  // ── Chat (3) ──
  {
    name: 'Zulip',
    tagline: 'Threaded team chat combining email-style topics with real-time',
    logo: '💬',
    url: 'https://zulip.com',
    github: 'https://github.com/zulip/zulip',
    license: 'Apache-2.0',
    pricing: 'Free (self-hosted) / Cloud $6.67/user/mo',
    difficulty: 'Hard',
    category: 'chat',
    tags: ['chat', 'small_team', 'enterprise', 'advanced', 'docker', 'full_control',
           'collaboration', 'search', 'webhook', 'api_access',
           'rbac', 'sso', 'ldap', 'scalable', 'web_only', 'desktop', 'mobile'],
    pros: [
      'Threaded topics keep conversations organized',
      'Powerful search across all messages and files',
      'Enterprise-grade with SSO, LDAP, and audit logs',
      '100+ integrations (GitHub, Jira, Sentry, etc.)',
    ],
    cons: [
      'Threaded UI has a learning curve',
      'Resource-heavy (needs 2GB+ RAM)',
      'Docker setup is complex',
    ],
    existingAltSlug: 'slack',
    existingCompareSlug: 'mattermost-vs-zulip',
  },
  {
    name: 'Mattermost',
    tagline: 'Slack-compatible team chat for security-conscious organizations',
    logo: '🔵',
    url: 'https://mattermost.com',
    github: 'https://github.com/mattermost/mattermost',
    license: 'AGPL-3.0 (team edition)',
    pricing: 'Free (team) / Enterprise $10/user/mo',
    difficulty: 'Medium',
    category: 'chat',
    tags: ['chat', 'small_team', 'enterprise', 'intermediate', 'docker',
           'collaboration', 'search', 'webhook', 'api_access',
           'rbac', 'sso', 'ldap', 'scalable', 'web_only', 'desktop', 'mobile'],
    pros: [
      'Familiar Slack-like interface — easy to adopt',
      'Built-in playbook for incident management',
      'Strong compliance features (HIPAA, FedRAMP)',
      'Native desktop and mobile apps',
    ],
    cons: [
      'Enterprise features require paid license',
      'Resource usage higher than Rocket.Chat',
      'Plugin ecosystem smaller than Slack',
    ],
    dockerCompose: `services:
  mattermost:
    image: mattermost/mattermost-preview:latest
    ports: ["8065:8065"]
    volumes:
      - mm_data:/mattermost/data
volumes:
  mm_data:`,
    existingAltSlug: 'slack',
    existingCompareSlug: 'mattermost-vs-zulip',
  },
  {
    name: 'Element',
    tagline: 'Decentralized chat powered by Matrix protocol',
    logo: '🟢',
    url: 'https://element.io',
    github: 'https://github.com/element-hq/element-web',
    license: 'Apache-2.0',
    pricing: 'Free (self-hosted) / Cloud $5/user/mo',
    difficulty: 'Medium',
    category: 'chat',
    tags: ['chat', 'solo', 'small_team', 'intermediate', 'docker',
           'collaboration', 'e2e_encryption', 'search', 'webhook', 'api_access',
           'scalable', 'web_only', 'desktop', 'mobile'],
    pros: [
      'End-to-end encrypted by default',
      'Federated — chat across organizations',
      'Bridges to Slack, Discord, Telegram, IRC',
      'Runs on Matrix, an open standard protocol',
    ],
    cons: [
      'Setting up Synapse (homeserver) is complex',
      'E2E encryption can be confusing for non-technical users',
      'Key management is a common pain point',
    ],
    existingAltSlug: 'slack',
  },

  // ── Automation (3) ──
  {
    name: 'n8n',
    tagline: 'Fair-code workflow automation with 400+ integrations',
    logo: '⚡',
    url: 'https://n8n.io',
    github: 'https://github.com/n8n-io/n8n',
    license: 'Sustainable Use (fair-code)',
    pricing: 'Free (self-hosted) / Starter $20/mo',
    difficulty: 'Medium',
    category: 'automation',
    tags: ['automation', 'solo', 'small_team', 'enterprise', 'intermediate', 'docker',
           'webhook', 'api_access', 'scalable', 'plugin_ecosystem', 'web_only'],
    pros: [
      '400+ integrations for nearly every SaaS tool',
      'Code nodes for JavaScript/Python logic',
      'Advanced branching with IF/Switch/Loop',
      'AI and LLM nodes for AI-powered workflows',
    ],
    cons: [
      'Fair-code license restricts some commercial use',
      'UI can feel overwhelming for beginners',
      'Resource-heavy for large workflow counts',
    ],
    dockerCompose: `services:
  n8n:
    image: n8nio/n8n
    ports: ["5678:5678"]
    volumes:
      - n8n_data:/home/node/.n8n
    restart: unless-stopped
volumes:
  n8n_data:`,
    existingAltSlug: 'zapier',
    existingCompareSlug: 'n8n-vs-activepieces',
  },
  {
    name: 'Activepieces',
    tagline: 'Open-source no-code automation platform',
    logo: '🧩',
    url: 'https://activepieces.com',
    github: 'https://github.com/activepieces/activepieces',
    license: 'MIT (community edition)',
    pricing: 'Free (self-hosted) / Cloud $25/mo',
    difficulty: 'Easy',
    category: 'automation',
    tags: ['automation', 'solo', 'small_team', 'beginner', 'docker',
           'webhook', 'api_access', 'web_only'],
    pros: [
      'MIT license — truly open source for any use',
      'Clean drag-and-drop builder',
      'Fast setup — productive in 10 minutes',
      'Lighter resource usage than n8n',
    ],
    cons: [
      'Fewer integrations (200+ vs 400+)',
      'Limited branching and error handling',
      'No AI/LLM nodes in community edition',
    ],
    dockerCompose: `services:
  activepieces:
    image: activepieces/activepieces
    ports: ["8080:8080"]
    volumes:
      - ap_data:/app/data
    restart: unless-stopped
volumes:
  ap_data:`,
    existingAltSlug: 'zapier',
    existingCompareSlug: 'n8n-vs-activepieces',
  },
  {
    name: 'Automatisch',
    tagline: 'Open-source Zapier alternative with focus on simplicity',
    logo: '🔄',
    url: 'https://automatisch.io',
    github: 'https://github.com/automatisch/automatisch',
    license: 'AGPL-3.0',
    pricing: 'Free (self-hosted)',
    difficulty: 'Medium',
    category: 'automation',
    tags: ['automation', 'solo', 'small_team', 'intermediate', 'docker',
           'webhook', 'api_access', 'web_only'],
    pros: [
      'Clean, focused on simplicity',
      'AGPL-3.0 license',
      'Growing integration library',
      'Good for basic automation flows',
    ],
    cons: [
      'Smallest integration library of the three',
      'Less mature than n8n and Activepieces',
      'Limited community and documentation',
      'No advanced features like AI nodes',
    ],
    dockerCompose: `services:
  automatisch:
    image: automatisch/automatisch
    ports: ["3000:3000"]
    volumes:
      - auto_data:/automatisch/storage
    depends_on: [postgres, redis]
  postgres:
    image: postgres:14
    environment:
      POSTGRES_DB: automatisch
      POSTGRES_USER: automatisch
      POSTGRES_PASSWORD: automatisch
  redis:
    image: redis:7-alpine
volumes:
  auto_data:`,
    existingAltSlug: 'zapier',
  },
]

// 4-dimension weight map
type WeightMap = Partial<Record<Tag, number>>

export const SCENARIO_WEIGHTS: Record<keyof WizardOption, Record<string, WeightMap>> = {
  need: {
    wiki:               { wiki: 5, collaboration: 3, search: 3, markdown_native: 2 },
    project_management: { project_management: 5, kanban: 3, gantt: 3, collaboration: 2, webhook: 1 },
    notes:              { notes: 5, search: 3, collaboration: 2, markdown_native: 2, desktop: 1 },
    chat:               { chat: 5, collaboration: 4, search: 2, api_access: 1, webhook: 1 },
    automation:         { automation: 5, webhook: 3, api_access: 3, plugin_ecosystem: 2 },
  },
  team: {
    solo:          { solo: 4, lightweight: 2, raspberry_pi: 1 },
    small_team:    { small_team: 4, collaboration: 3, rbac: 1, api_access: 1 },
    enterprise:    { enterprise: 4, sso: 3, ldap: 3, audit_log: 2, rbac: 2, scalable: 2 },
  },
  tech: {
    beginner:      { beginner: 4, docker: 2, lightweight: 2 },
    intermediate:  { intermediate: 2, docker: 2, api_access: 1 },
    advanced:      { advanced: 2, full_control: 3, scalable: 2 },
  },
  host: {
    docker:        { docker: 4, scalable: 1 },
    lightweight:   { lightweight: 4, raspberry_pi: 2 },
    managed:       { managed: 3, sso: 1, scalable: 1 },
    full_control:  { full_control: 4, api_access: 2 },
  },
}
