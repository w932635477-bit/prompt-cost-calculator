// src/finder/notes/finder-data.ts
// Self-Hosted Note-Taking Finder — tool data + scenario weights

export type WizardOption = {
  team: 'solo' | 'small_team' | 'enterprise'
  tech: 'beginner' | 'intermediate' | 'advanced'
  host: 'docker' | 'lightweight' | 'native_app'
  need: 'collaboration' | 'privacy' | 'offline_first' | 'database'
}

export type Tag =
  | 'solo' | 'small_team' | 'enterprise'
  | 'beginner' | 'intermediate' | 'advanced'
  | 'docker' | 'lightweight' | 'native_app' | 'raspberry_pi'
  | 'collaboration' | 'sharing' | 'wiki' | 'kanban' | 'database' | 'graph'
  | 'e2e_encryption' | 'local_first' | 'offline'
  | 'rbac' | 'sso' | 'ldap' | 'audit_log'
  | 'mobile' | 'desktop' | 'web_only'
  | 'plugin_ecosystem' | 'markdown_native'

export interface NoteTool {
  name: string
  tagline: string
  logo: string                   // emoji or unicode glyph
  url: string
  github: string
  license: string
  pricing: string                 // "Free" | "Free + Sync $4/mo"
  difficulty: 'Easy' | 'Medium' | 'Hard'
  tags: Tag[]
  pros: string[]
  cons: string[]
  dockerCompose?: string          // multi-line YAML, undef = no native docker
  githubStars?: number            // optional, populated by build script later
  notion_alt: boolean             // whether it shows up as Notion alternative
}

// 7 candidates — sourced from alternatives-data + compare-data
export const NOTE_TOOLS: NoteTool[] = [
  {
    name: 'Obsidian',
    tagline: 'Local-first markdown knowledge base with plugin ecosystem',
    logo: '💎',
    url: 'https://obsidian.md',
    github: 'https://github.com/obsidianmd/obsidian-api',
    license: 'Proprietary (free for personal)',
    pricing: 'Free / Sync $4/mo / Publish $8/mo',
    difficulty: 'Easy',
    tags: ['solo', 'small_team', 'beginner', 'lightweight', 'native_app', 'raspberry_pi',
           'local_first', 'offline', 'graph', 'plugin_ecosystem', 'markdown_native',
           'e2e_encryption', 'mobile', 'desktop'],
    pros: [
      'Notes stored as plain markdown files on your device',
      'Massive plugin ecosystem (1,000+ community plugins)',
      'Excellent graph view for visualizing note connections',
      'Works completely offline by default',
      'No vendor lock-in — files are standard markdown',
    ],
    cons: [
      'Sync requires paid plan ($4/month) or self-hosting via Syncthing/Git',
      'No built-in database/relations features (plugins fill gap)',
      'Limited real-time collaboration',
    ],
    notion_alt: true,
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
    tags: ['solo', 'small_team', 'beginner', 'native_app',
           'database', 'kanban', 'wiki', 'collaboration', 'markdown_native',
           'mobile', 'desktop'],
    pros: [
      'Closest open-source clone of Notion experience',
      'Built-in databases, kanban boards, rich text',
      'Can import directly from Notion export',
      'Native desktop + mobile apps (no web-only limitation)',
    ],
    cons: [
      'Self-hosting requires manual build (no first-party docker)',
      'Smaller plugin ecosystem than Obsidian',
      'Newer project, fewer integrations',
    ],
    notion_alt: true,
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
    tags: ['small_team', 'enterprise', 'intermediate', 'docker',
           'wiki', 'collaboration', 'sharing', 'sso', 'rbac', 'audit_log',
           'plugin_ecosystem', 'mobile', 'desktop'],
    pros: [
      'Real-time collaborative editing for teams',
      'Excellent search and SSO/SAML for enterprise',
      'Slack and Microsoft Teams integrations built in',
      'Clean modern interface, fast UI',
      'Granular permissions and audit logs',
    ],
    cons: [
      'BSL-1.1 license (not pure open source)',
      'Requires PostgreSQL + Redis (not single-binary)',
      'Less suitable for personal note-taking',
    ],
    dockerCompose: `services:
  outline:
    image: outlinewiki/outline:latest
    ports: ["3000:3000"]
    environment:
      SECRET_KEY: \${OUTLINE_SECRET_KEY}
      DATABASE_URL: postgres://outline:outline@postgres/outline
      REDIS_URL: redis://redis:6379
      URL: https://wiki.example.com
    depends_on: [postgres, redis]
  postgres:
    image: postgres:14
    environment:
      POSTGRES_DB: outline
      POSTGRES_USER: outline
      POSTGRES_PASSWORD: outline
  redis:
    image: redis:7-alpine`,
    notion_alt: true,
  },
  {
    name: 'Logseq',
    tagline: 'Privacy-first outliner with graph view and PDF annotations',
    logo: '🔗',
    url: 'https://logseq.com',
    github: 'https://github.com/logseq/logseq',
    license: 'AGPL-3.0',
    pricing: 'Free',
    difficulty: 'Easy',
    tags: ['solo', 'beginner', 'lightweight', 'native_app', 'raspberry_pi',
           'local_first', 'offline', 'graph', 'wiki', 'markdown_native',
           'desktop'],
    pros: [
      'Outliner-first paradigm (every line is a block)',
      'Powerful graph view rivaling Obsidian',
      'Markdown + Org-mode dual support',
      'Built-in flashcards (spaced repetition)',
      'PDF annotations export to notes',
      'Fully local-first, end-to-end encrypted sync (paid)',
    ],
    cons: [
      'No first-party mobile app for self-hosted users',
      'Outliner can feel restrictive vs free-form pages',
      'Performance issues with very large graphs (10k+ pages)',
    ],
    notion_alt: true,
  },
  {
    name: 'Joplin',
    tagline: 'Markdown notes with E2E encryption and web clipper',
    logo: '📓',
    url: 'https://joplinapp.org',
    github: 'https://github.com/laurent22/joplin',
    license: 'MIT',
    pricing: 'Free / Joplin Cloud $2.40/mo',
    difficulty: 'Easy',
    tags: ['solo', 'small_team', 'beginner', 'docker', 'lightweight', 'raspberry_pi',
           'e2e_encryption', 'local_first', 'offline', 'markdown_native',
           'mobile', 'desktop'],
    pros: [
      'True end-to-end encryption (zero-knowledge)',
      'Notebooks, tags, todo lists in one app',
      'Web clipper extension for Chrome/Firefox',
      'Sync via WebDAV / S3 / Dropbox / OneDrive — your choice',
      'MIT license — most permissive of any candidate',
    ],
    cons: [
      'UI feels dated compared to Obsidian/AppFlowy',
      'No graph view',
      'Plugin ecosystem smaller than Obsidian',
    ],
    dockerCompose: `services:
  joplin-server:
    image: joplin/server:latest
    ports: ["22300:22300"]
    environment:
      APP_PORT: 22300
      APP_BASE_URL: https://joplin.example.com
      DB_CLIENT: pg
      POSTGRES_USER: joplin
      POSTGRES_PASSWORD: joplin
      POSTGRES_DATABASE: joplin
      POSTGRES_HOST: postgres
    depends_on: [postgres]
  postgres:
    image: postgres:14
    environment:
      POSTGRES_USER: joplin
      POSTGRES_PASSWORD: joplin
      POSTGRES_DB: joplin`,
    notion_alt: false,
  },
  {
    name: 'Trilium Notes',
    tagline: 'Hierarchical notes with scripting and relation maps',
    logo: '🌳',
    url: 'https://github.com/zadam/trilium',
    github: 'https://github.com/zadam/trilium',
    license: 'AGPL-3.0',
    pricing: 'Free',
    difficulty: 'Easy',
    tags: ['solo', 'beginner', 'docker', 'lightweight', 'raspberry_pi',
           'wiki', 'web_only', 'desktop'],
    pros: [
      'Powerful tree structure for nested knowledge',
      'Built-in scripting (JavaScript) for automation',
      'Relation maps show connections between notes',
      'Single Docker container — no DB to manage',
      'Strong export formats (HTML, OPML, Markdown)',
    ],
    cons: [
      'No native mobile app (web only)',
      'UI is functional, not pretty',
      'No real-time collaboration',
    ],
    dockerCompose: `services:
  trilium:
    image: zadam/trilium:latest
    ports: ["8080:8080"]
    volumes:
      - trilium-data:/home/node/trilium-data
    environment:
      TRILIUM_DATA_DIR: /home/node/trilium-data
volumes:
  trilium-data:`,
    notion_alt: false,
  },
  {
    name: 'Memos',
    tagline: 'Lightweight memo hub for quick thoughts',
    logo: '💭',
    url: 'https://usememos.com',
    github: 'https://github.com/usememos/memos',
    license: 'MIT',
    pricing: 'Free',
    difficulty: 'Easy',
    tags: ['solo', 'small_team', 'beginner', 'docker', 'lightweight', 'raspberry_pi',
           'sharing', 'markdown_native', 'mobile'],
    pros: [
      'Twitter-like UX for quick captures',
      'Single binary, runs anywhere (50MB RAM)',
      'Public memo sharing built in',
      'REST API + RSS feeds',
      'MIT license, very active maintenance',
    ],
    cons: [
      'Not designed for long-form notes (memo paradigm)',
      'No hierarchical structure (only tags)',
      'Smaller feature set than full note apps',
    ],
    dockerCompose: `services:
  memos:
    image: neosmemo/memos:stable
    ports: ["5230:5230"]
    volumes:
      - memos-data:/var/opt/memos
volumes:
  memos-data:`,
    notion_alt: false,
  },
]

// 4-dimension weight map: each option contributes weights to specific tags
// Higher weight = stronger pull toward tools with that tag
type WeightMap = Partial<Record<Tag, number>>

export const SCENARIO_WEIGHTS: Record<keyof WizardOption, Record<string, WeightMap>> = {
  team: {
    solo: { solo: 3, lightweight: 2, raspberry_pi: 1, local_first: 2 },
    small_team: { small_team: 3, collaboration: 3, sharing: 2, wiki: 1 },
    enterprise: { enterprise: 3, sso: 3, rbac: 3, ldap: 2, audit_log: 2, collaboration: 2 },
  },
  tech: {
    beginner: { beginner: 3, lightweight: 2, native_app: 1 },
    intermediate: { intermediate: 1, docker: 2 },
    advanced: { advanced: 1, plugin_ecosystem: 2 },
  },
  host: {
    docker: { docker: 3 },
    lightweight: { lightweight: 3, raspberry_pi: 2, native_app: 1 },
    native_app: { native_app: 3, desktop: 2, mobile: 1 },
  },
  need: {
    collaboration: { collaboration: 3, sharing: 2, wiki: 2, sso: 1 },
    privacy: { e2e_encryption: 3, local_first: 3, offline: 2 },
    offline_first: { local_first: 3, offline: 3, lightweight: 1, native_app: 1 },
    database: { database: 3, kanban: 2, wiki: 1 },
  },
}
