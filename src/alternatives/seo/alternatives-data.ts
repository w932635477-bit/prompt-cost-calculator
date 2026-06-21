import githubStats from './github-stats.json'

export type ScenarioTag =
  // Team size
  | 'solo_dev' | 'small_team' | 'enterprise'
  // Tech level
  | 'beginner_friendly' | 'intermediate' | 'advanced_setup'
  // Deployment
  | 'docker_ready' | 'lightweight' | 'low_resource' | 'raspberry_pi'
  // Auth & access control
  | 'rbac' | 'ldap' | 'sso' | 'mfa' | 'oauth' | 'saml'
  // Security
  | 'e2e_encryption' | 'zero_knowledge' | 'audit_log'
  // Core functions
  | 'file_sync' | 'sharing' | 'collaboration' | 'backup' | 'streaming'
  | 'search' | 'automation' | 'wiki' | 'kanban' | 'gantt' | 'cicd'
  | 'newsletter' | 'monitoring' | 'crm' | 'livechat' | 'forms'
  // API & integrations
  | 'api_access' | 'webhook' | 'cli' | 'rest_api' | 'graphql'
  // Platform
  | 'mobile_app' | 'desktop_app' | 'web_only'
  // Scale
  | 'scalable' | 'high_availability' | 'federation'

export interface SelfHostedAlt {
  name: string
  description: string
  url: string
  github: string
  license: string
  difficulty: 'Easy' | 'Medium' | 'Hard'
  docker: boolean
  dockerCommand?: string
  features: string[]
  scenarioTags?: ScenarioTag[]
  githubStars?: number
  lastCommitDate?: string
  maintenanceStatus?: 'active' | 'maintenance' | 'declining' | 'archived'
}

export interface AlternativePage {
  slug: string
  saasName: string
  category: string
  icon: string
  alternatives: SelfHostedAlt[]
  title: string
  h1: string
  description: string
  explanation: string
  faq: { q: string; a: string }[]
  keywords: string[]
  quickDecision?: { choose: string; reason: string }[]
}

const _RAW_PAGES: AlternativePage[] = [
  // === Cloud Storage ===
  {
    slug: 'google-drive',
    saasName: 'Google Drive',
    category: 'Cloud Storage',
    icon: '📁',
    alternatives: [
      { name: 'Nextcloud', description: 'Full-featured self-hosted cloud platform with file sync, calendar, contacts, and office suite.', url: 'https://nextcloud.com', github: 'https://github.com/nextcloud/server', license: 'AGPL-3.0', difficulty: 'Medium', docker: true, dockerCommand: 'docker run -d -p 8080:80 nextcloud', features: ['File sync', 'WebDAV', 'Calendar', 'Contacts', 'Office suite', 'End-to-end encryption'], scenarioTags: ['solo_dev', 'small_team', 'enterprise', 'intermediate', 'docker_ready', 'file_sync', 'sharing', 'collaboration', 'ldap', 'sso', 'mfa', 'mobile_app', 'desktop_app', 'scalable', 'audit_log'] },
      { name: 'ownCloud', description: 'Enterprise-grade file sync and share platform with granular access controls.', url: 'https://owncloud.com', github: 'https://github.com/owncloud/core', license: 'AGPL-3.0', difficulty: 'Medium', docker: true, dockerCommand: 'docker run -d -p 8080:8080 owncloud/server', features: ['File sync', 'Sharing', 'Versioning', 'Encryption', 'LDAP integration'], scenarioTags: ['small_team', 'enterprise', 'intermediate', 'docker_ready', 'file_sync', 'sharing', 'ldap', 'audit_log', 'mobile_app', 'desktop_app', 'scalable'] },
      { name: 'Seafile', description: 'High-performance file sync with emphasis on reliability and speed.', url: 'https://www.seafile.com', github: 'https://github.com/haiwen/seafile', license: 'AGPL-3.0', difficulty: 'Easy', docker: true, dockerCommand: 'docker run -d -p 8082:8082 seafileltd/seafile-mc', features: ['File sync', 'Block-level dedup', 'Wiki', 'Online preview'], scenarioTags: ['solo_dev', 'small_team', 'beginner_friendly', 'docker_ready', 'lightweight', 'file_sync', 'mobile_app', 'desktop_app'] },
    ],
    title: 'Self-Hosted Google Drive Alternative - Open Source Cloud Storage',
    h1: 'Self-Hosted Google Drive Alternatives',
    description: 'Replace Google Drive with open source self-hosted cloud storage. Compare Nextcloud, ownCloud, and Seafile with features, difficulty ratings, and Docker quick-start commands.',
    explanation: 'Google Drive stores your files on Google servers, meaning Google can access your data and may comply with government data requests. Self-hosted alternatives give you full control over your files with end-to-end encryption, no storage limits (limited only by your hardware), and no monthly subscription fees.',
    faq: [
      { q: 'What is the best self-hosted Google Drive alternative?', a: 'Nextcloud is the most popular and feature-rich option. It includes file sync, calendar, contacts, and an office suite. For simpler file-only needs, Seafile offers better sync performance.' },
      { q: 'Can I access my self-hosted cloud storage from mobile?', a: 'Yes. Nextcloud, ownCloud, and Seafile all have official iOS and Android apps that connect to your self-hosted server.' },
      { q: 'How much does it cost to self-host cloud storage?', a: 'The software is free. You need a server — a $5/month VPS can handle personal use, or use an old PC/NAS at home for zero monthly cost.' },
    ],
    keywords: ['self-hosted google drive', 'google drive alternative open source', 'nextcloud vs owncloud', 'self-hosted cloud storage', 'self-hosted Google Drive alternative', 'best open source Google Drive alternative', 'free Google Drive replacement'],
  },
  {
    slug: 'dropbox',
    saasName: 'Dropbox',
    category: 'Cloud Storage',
    icon: '📦',
    alternatives: [
      { name: 'Nextcloud', description: 'Full cloud platform with file sync that matches and exceeds Dropbox features.', url: 'https://nextcloud.com', github: 'https://github.com/nextcloud/server', license: 'AGPL-3.0', difficulty: 'Medium', docker: true, features: ['File sync', 'Selective sync', 'Sharing links', 'Version history'], scenarioTags: ['solo_dev', 'small_team', 'intermediate', 'docker_ready', 'file_sync', 'sharing', 'ldap', 'sso', 'mobile_app', 'desktop_app', 'scalable'] },
      { name: 'Syncthing', description: 'Peer-to-peer continuous file synchronization with no central server required.', url: 'https://syncthing.net', github: 'https://github.com/syncthing/syncthing', license: 'MPL-2.0', difficulty: 'Easy', docker: true, dockerCommand: 'docker run -d -p 8384:8384 syncthing/syncthing', features: ['P2P sync', 'No central server', 'End-to-end encryption', 'Cross-platform', 'Conflict resolution'], scenarioTags: ['solo_dev', 'small_team', 'beginner_friendly', 'docker_ready', 'lightweight', 'file_sync', 'e2e_encryption', 'mobile_app', 'desktop_app', 'raspberry_pi'] },
      { name: 'FileRun', description: 'Lightweight file manager with a clean interface similar to Dropbox.', url: 'https://filerun.com', github: '', license: 'Proprietary (free)', difficulty: 'Easy', docker: true, dockerCommand: 'docker run -d -p 8080:80 filerun/filerun', features: ['File preview', 'Google Drive integration', 'Sharing', 'WebDAV'], scenarioTags: ['solo_dev', 'beginner_friendly', 'docker_ready', 'lightweight', 'file_sync', 'sharing'] },
    ],
    title: 'Self-Hosted Dropbox Alternative - Open Source File Sync',
    h1: 'Self-Hosted Dropbox Alternatives',
    description: 'Replace Dropbox with self-hosted file sync tools. Compare Nextcloud, Syncthing, and FileRun — no subscription fees, unlimited storage.',
    explanation: 'Dropbox charges $9.99/month for 2TB. Self-hosted alternatives use your own storage, so you pay no monthly fees and have no storage limits. Syncthing is unique because it works peer-to-peer without needing a server.',
    faq: [
      { q: 'Is Syncthing a good Dropbox replacement?', a: 'Yes for sync, no for sharing. Syncthing excels at keeping folders in sync across devices but lacks Dropbox-style sharing links. Use Nextcloud if you need both.' },
      { q: 'Can I self-host Dropbox without Docker?', a: 'Yes. Nextcloud and Syncthing both support native installation on Linux, Windows, and macOS.' },
    ],
    keywords: ['self-hosted dropbox', 'dropbox alternative open source', 'syncthing vs nextcloud', 'self-hosted file sync', 'self-hosted Dropbox alternative', 'best open source Dropbox alternative', 'free Dropbox replacement'],
  },
  {
    slug: 'onedrive',
    saasName: 'OneDrive',
    category: 'Cloud Storage',
    icon: '☁️',
    alternatives: [
      { name: 'Nextcloud', description: 'Full self-hosted cloud platform replacing OneDrive and Office 365 integration.', url: 'https://nextcloud.com', github: 'https://github.com/nextcloud/server', license: 'AGPL-3.0', difficulty: 'Medium', docker: true, features: ['File sync', 'Office suite', 'Calendar', 'Contacts', 'Email integration'], scenarioTags: ['solo_dev', 'small_team', 'enterprise', 'intermediate', 'docker_ready', 'file_sync', 'collaboration', 'ldap', 'sso', 'mobile_app', 'desktop_app', 'scalable'] },
      { name: 'Seafile', description: 'High-performance file sync with reliable data integrity.', url: 'https://www.seafile.com', github: 'https://github.com/haiwen/seafile', license: 'AGPL-3.0', difficulty: 'Easy', docker: true, features: ['File sync', 'Block-level dedup', 'Online editing'], scenarioTags: ['solo_dev', 'small_team', 'beginner_friendly', 'docker_ready', 'lightweight', 'file_sync', 'mobile_app', 'desktop_app'] },
    ],
    title: 'Self-Hosted OneDrive Alternative - Open Source Cloud Storage',
    h1: 'Self-Hosted OneDrive Alternatives',
    description: 'Replace Microsoft OneDrive with self-hosted cloud storage. Compare Nextcloud and Seafile for file sync, sharing, and collaboration.',
    explanation: 'OneDrive is tied to the Microsoft ecosystem and stores your files on Microsoft servers. Self-hosted alternatives give you independence from vendor lock-in, no subscription costs, and full data ownership.',
    faq: [
      { q: 'Can I replace OneDrive and Office 365 together?', a: 'Yes. Nextcloud includes Collabora (LibreOffice-based) or OnlyOffice for document editing, replacing both OneDrive and Word/Excel/PowerPoint online.' },
    ],
    keywords: ['self-hosted onedrive', 'onedrive alternative open source', 'microsoft onedrive replacement', 'self-hosted OneDrive alternative', 'best open source OneDrive alternative', 'free OneDrive replacement'],
  },

  // === Note-Taking ===
  {
    slug: 'notion',
    saasName: 'Notion',
    category: 'Note-Taking',
    icon: '📝',
    alternatives: [
      { name: 'AppFlowy', description: 'Open-source workspace with rich text editing, databases, and kanban boards.', url: 'https://appflowy.com', github: 'https://github.com/AppFlowy-IO/AppFlowy', license: 'AGPL-3.0', difficulty: 'Easy', docker: false, features: ['Rich text', 'Databases', 'Kanban boards', 'Markdown', 'Offline-first', 'AI features'], scenarioTags: ['solo_dev', 'small_team', 'beginner_friendly', 'collaboration', 'kanban', 'wiki', 'desktop_app', 'mobile_app'] },
      { name: 'Outline', description: 'Fast, collaborative wiki with a clean interface and Slack integration.', url: 'https://getoutline.com', github: 'https://github.com/outline/outline', license: 'BSL-1.1', difficulty: 'Medium', docker: true, dockerCommand: 'docker run -d -p 3000:3000 outlinewiki/outline', features: ['Wiki', 'Real-time collaboration', 'Slack integration', 'Markdown', 'Search'], scenarioTags: ['small_team', 'intermediate', 'docker_ready', 'collaboration', 'wiki', 'sharing', 'api_access', 'sso'] },
      { name: 'Logseq', description: 'Privacy-first knowledge management with outliner and graph-based linking.', url: 'https://logseq.com', github: 'https://github.com/logseq/logseq', license: 'AGPL-3.0', difficulty: 'Easy', docker: false, features: ['Outliner', 'Graph view', 'Markdown/Org-mode', 'Local-first', 'Flashcards', 'PDF annotations'], scenarioTags: ['solo_dev', 'beginner_friendly', 'lightweight', 'wiki', 'desktop_app'] },
    ],
    title: 'Self-Hosted Notion Alternative - Open Source Knowledge Management',
    h1: 'Self-Hosted Notion Alternatives',
    description: 'Replace Notion with open source self-hosted alternatives. Compare AppFlowy, Outline, and Logseq — databases, wikis, knowledge graphs, no subscription fees.',
    explanation: 'Notion stores all your notes on their servers and requires internet access for most features. Self-hosted alternatives offer local-first data storage (your files on your disk), offline access, and no subscription fees. AppFlowy is the closest Notion clone, Outline is best for team wikis, and Logseq excels at personal knowledge graphs.',
    faq: [
      { q: 'Which is the closest open source alternative to Notion?', a: 'AppFlowy is the most similar to Notion with databases, kanban boards, and rich text editing. It even supports importing from Notion.' },
      { q: 'Can I import my Notion data?', a: 'Yes. AppFlowy and Outline both support importing from Notion export files. Logseq can import markdown files.' },
    ],
    keywords: ['self-hosted notion', 'notion alternative open source', 'appflowy vs notion', 'logseq vs notion', 'self-hosted Notion alternative', 'best open source Notion alternative', 'free Notion replacement'],
  },
  {
    slug: 'evernote',
    saasName: 'Evernote',
    category: 'Note-Taking',
    icon: '🐘',
    alternatives: [
      { name: 'Joplin', description: 'Full-featured note-taking app with Markdown support and end-to-end encryption.', url: 'https://joplinapp.org', github: 'https://github.com/laurent22/joplin', license: 'MIT', difficulty: 'Easy', docker: true, features: ['Markdown', 'Web clipper', 'E2E encryption', 'Tags', 'Notebooks', 'Sync via WebDAV/S3/Dropbox'], scenarioTags: ['solo_dev', 'beginner_friendly', 'docker_ready', 'lightweight', 'e2e_encryption', 'mobile_app', 'desktop_app', 'api_access'] },
      { name: 'Trilium Notes', description: 'Hierarchical note-taking with scripting, relation maps, and tree structure.', url: 'https://github.com/zadam/trilium', github: 'https://github.com/zadam/trilium', license: 'AGPL-3.0', difficulty: 'Easy', docker: true, dockerCommand: 'docker run -d -p 8080:8080 zadam/trilium', features: ['Tree structure', 'Scripting', 'Relation maps', 'Book notes', 'Image compression'], scenarioTags: ['solo_dev', 'beginner_friendly', 'docker_ready', 'lightweight', 'wiki', 'desktop_app', 'web_only', 'raspberry_pi'] },
      { name: 'Memos', description: 'Lightweight, self-hosted memo hub for quick thoughts and notes.', url: 'https://usememos.com', github: 'https://github.com/usememos/memos', license: 'MIT', difficulty: 'Easy', docker: true, dockerCommand: 'docker run -d -p 5230:5230 neosmemo/memos', features: ['Quick notes', 'Tags', 'Markdown', 'API', 'Mobile friendly'], scenarioTags: ['solo_dev', 'beginner_friendly', 'docker_ready', 'lightweight', 'api_access', 'mobile_app', 'raspberry_pi'] },
    ],
    title: 'Self-Hosted Evernote Alternative - Open Source Notes',
    h1: 'Self-Hosted Evernote Alternatives',
    description: 'Replace Evernote with open source note-taking apps. Compare Joplin, Trilium Notes, and Memos — no subscription, local-first, full data ownership.',
    explanation: 'Evernote has repeatedly raised prices and limited free tier features. Self-hosted alternatives give you unlimited notes, no subscription, and full control over your data. Joplin is the most direct replacement with a web clipper and mobile apps.',
    faq: [
      { q: 'Can I import Evernote notes into Joplin?', a: 'Yes. Joplin has a built-in Evernote importer that preserves notebooks, tags, and attachments.' },
    ],
    keywords: ['self-hosted evernote', 'evernote alternative open source', 'joplin vs evernote', 'self-hosted notes', 'self-hosted Evernote alternative', 'best open source Evernote alternative', 'free Evernote replacement'],
  },

  {
    slug: 'logseq',
    saasName: 'Logseq',
    category: 'Note-Taking',
    icon: '🔗',
    alternatives: [
      { name: 'Joplin', description: 'Full-featured Markdown note-taking with WebDAV/S3 sync, E2E encryption, and web clipper.', url: 'https://joplinapp.org', github: 'https://github.com/laurent22/joplin', license: 'MIT', difficulty: 'Easy', docker: true, dockerCommand: 'docker run -d -p 22300:22300 joplin/server', features: ['Markdown', 'Web clipper', 'E2E encryption', 'Tags', 'Notebooks', 'Mobile apps'], scenarioTags: ['solo_dev', 'small_team', 'beginner_friendly', 'docker_ready', 'lightweight', 'e2e_encryption', 'mobile_app', 'desktop_app', 'api_access'] },
      { name: 'SiYuan', description: 'Block-level referencing knowledge base with graph view, SQL query, and self-hosted sync.', url: 'https://b3log.org/siyuan/', github: 'https://github.com/siyuan-note/siyuan', license: 'AGPL-3.0', difficulty: 'Easy', docker: true, dockerCommand: 'docker run -d -p 6806:6806 b3log/siyuan', features: ['Block reference', 'Graph view', 'SQL query', 'Template', 'PDF annotation', 'S3/WebDAV sync'], scenarioTags: ['solo_dev', 'small_team', 'beginner_friendly', 'docker_ready', 'wiki', 'desktop_app', 'mobile_app', 'api_access'] },
      { name: 'Trilium Notes', description: 'Hierarchical note-taking with scripting, relation maps, and cloned subtrees.', url: 'https://github.com/zadam/trilium', github: 'https://github.com/zadam/trilium', license: 'AGPL-3.0', difficulty: 'Easy', docker: true, dockerCommand: 'docker run -d -p 8080:8080 zadam/trilium', features: ['Tree structure', 'Scripting', 'Relation maps', 'Book notes', 'Image compression'], scenarioTags: ['solo_dev', 'beginner_friendly', 'docker_ready', 'lightweight', 'wiki', 'desktop_app', 'raspberry_pi'] },
      { name: 'Standard Notes', description: 'Privacy-focused notes with E2E encryption, self-hosted server, and extensions.', url: 'https://standardnotes.com', github: 'https://github.com/standardnotes/app', license: 'GPL-3.0', difficulty: 'Medium', docker: true, dockerCommand: 'docker run -d -p 3000:3000 standardnotes/server', features: ['E2E encryption', 'Passcode lock', 'Extensions', 'Tagging', 'Offline access', 'Self-hosted sync'], scenarioTags: ['solo_dev', 'intermediate', 'docker_ready', 'e2e_encryption', 'mobile_app', 'desktop_app'] },
    ],
    title: 'Best Self-Hosted Logseq Alternatives (2026) — Open Source Note-Taking & Knowledge Base Tools',
    h1: 'Self-Hosted Logseq Alternatives — Open Source Note-Taking & Knowledge Base',
    description: 'Compare the best self-hosted Logseq alternatives in 2026: Joplin, SiYuan, Trilium Notes, and Standard Notes. Block references, graph view, Docker deploy, E2E encryption, local-first sync. Free open source — no subscription.',
    explanation: 'Logseq is a powerful outliner and knowledge graph tool, but it lacks a self-hosted web version and its sync server is not yet available. If you need web-based access, self-hosted sync, or E2E encryption, alternatives offer these features today. Joplin is the most mature with full sync server support. SiYuan is the closest Logseq alternative with block references and graph view. Trilium excels at hierarchical organization. Standard Notes prioritizes privacy with E2E encryption.',
    faq: [
      { q: 'What is the closest alternative to Logseq?', a: 'SiYuan is the closest match with block-level referencing, graph view, and Markdown support. It also has a self-hosted sync server, which Logseq lacks.' },
      { q: 'Can I import Logseq data into alternatives?', a: 'Yes. Since Logseq stores notes as plain Markdown files, most alternatives (Joplin, SiYuan, Trilium) can import them directly. SiYuan also supports Org-mode files.' },
      { q: 'Which alternative is best for a self-hosted web app?', a: 'Trilium Notes and Joplin Server both provide web-based access. SiYuan also has a Docker-based server mode for browser access.' },
      { q: 'Is there a self-hosted web version of Logseq?', a: 'Logseq does not yet offer an official self-hosted web server. The closest self-hosted web alternatives with similar features are SiYuan (block references + graph view) and Trilium Notes (hierarchical notes with web UI).' },
      { q: 'Logseq vs Joplin vs SiYuan — which is best for self-hosting?', a: 'SiYuan is the closest to Logseq with block references and graph view, plus built-in self-hosted sync. Joplin is more mature with better mobile apps and E2E encryption. Trilium offers a unique tree structure with built-in web access.' },
    ],
    keywords: ['logseq alternative', 'self-hosted logseq', 'logseq self hosted alternative', 'logseq alternative open source', 'joplin vs logseq', 'siyuan vs logseq', 'open source knowledge base', 'self-hosted note-taking', 'logseq web self hosted', 'logseq replacement open source', 'best logseq alternative 2026', 'logseq docker self hosted', 'self-hosted knowledge base tools', 'open source note-taking app self-hosted'],
    quickDecision: [
      { choose: 'SiYuan', reason: 'you want block references and graph view like Logseq with self-hosted sync' },
      { choose: 'Joplin', reason: 'you need mobile apps, web clipper, and E2E encryption' },
      { choose: 'Trilium Notes', reason: 'you prefer hierarchical tree structure over outliner' },
      { choose: 'Standard Notes', reason: 'privacy is your top priority and you need guaranteed E2E encryption' },
    ],
  },

  // === Communication ===
  {
    slug: 'slack',
    saasName: 'Slack',
    category: 'Communication',
    icon: '💬',
    alternatives: [
      { name: 'Mattermost', description: 'Enterprise-grade messaging platform with channels, threads, and integrations.', url: 'https://mattermost.com', github: 'https://github.com/mattermost/mattermost', license: 'AGPL-3.0', difficulty: 'Medium', docker: true, dockerCommand: 'docker run -d -p 8065:8065 mattermost/mattermost-preview', features: ['Channels', 'Threads', 'File sharing', 'Integrations', 'Screen sharing', 'Compliance'], scenarioTags: ['small_team', 'enterprise', 'intermediate', 'docker_ready', 'collaboration', 'ldap', 'sso', 'api_access', 'webhook', 'mobile_app', 'desktop_app', 'scalable', 'audit_log'] },
      { name: 'Rocket.Chat', description: 'Feature-rich team chat with video calls, bots, and LDAP/AD integration.', url: 'https://rocket.chat', github: 'https://github.com/RocketChat/Rocket.Chat', license: 'MIT', difficulty: 'Medium', docker: true, dockerCommand: 'docker run -d -p 3000:3000 rocket.chat', features: ['Channels', 'Video calls', 'Bots', 'LDAP/AD', 'Omnichannel', 'Livechat'], scenarioTags: ['small_team', 'enterprise', 'intermediate', 'docker_ready', 'collaboration', 'ldap', 'api_access', 'webhook', 'livechat', 'mobile_app', 'desktop_app', 'scalable'] },
      { name: 'Element (Matrix)', description: 'Decentralized messaging built on the Matrix protocol with E2E encryption.', url: 'https://element.io', github: 'https://github.com/element-hq/element-web', license: 'Apache-2.0', difficulty: 'Hard', docker: true, features: ['E2E encryption', 'Federation', 'Bridges to other apps', 'Voice/video', 'Decentralized'], scenarioTags: ['small_team', 'advanced_setup', 'docker_ready', 'e2e_encryption', 'federation', 'collaboration', 'mobile_app', 'desktop_app'] },
    ],
    title: '5 Best Self-Hosted Slack Alternatives (2026) — Open Source Team Chat Without Per-User Fees',
    h1: 'Self-Hosted Slack Alternatives',
    description: 'Replace Slack with self-hosted team messaging in 2026. Compare Mattermost, Rocket.Chat, and Element (Matrix) — unlimited message history, zero per-user pricing, full data ownership. Slack charges $7.25-$12.50/user/month; self-hosted saves thousands at scale.',
    explanation: 'Slack charges $7.25-$12.50 per user/month and limits message history to 90 days on free plans. Self-hosted alternatives offer unlimited message history, no per-user costs, and full data ownership. Mattermost is the most Slack-like experience with channels, threads, and integrations. Rocket.Chat adds video calls and omnichannel support. Element uses the decentralized Matrix protocol for maximum privacy.',
    faq: [
      { q: 'Which is the easiest Slack alternative to self-host?', a: 'Mattermost is the most straightforward with a Docker-based setup and Slack-compatible keyboard shortcuts and interface. One command: docker run -d -p 8065:8065 mattermost/mattermost-preview.' },
      { q: 'Can I migrate Slack message history?', a: 'Yes. Mattermost has a built-in Slack import tool that migrates channels, users, and message history. Rocket.Chat also supports importing from Slack exports.' },
      { q: 'How much does self-hosting save vs Slack?', a: 'Slack Pro costs $7.25/user/month ($87/year). For a 50-person team, that is $4,350/year. Self-hosting Mattermost costs only the server (typically $20-$50/month), saving $3,750+/year.' },
    ],
    keywords: ['self-hosted slack', 'self hosted slack alternative', 'slack alternative open source', 'mattermost vs slack', 'rocket.chat self-hosted', 'best self-hosted Slack alternative', 'best open source Slack alternative', 'free Slack replacement', 'slack self hosted alternative 2026', 'slack replacement open source', 'open source team chat self hosted', 'self hosted team chat'],
  },
  {
    slug: 'discord',
    saasName: 'Discord',
    category: 'Communication',
    icon: '🎮',
    alternatives: [
      { name: 'Element (Matrix)', description: 'Decentralized chat with E2E encryption, voice/video, and bridges to Discord.', url: 'https://element.io', github: 'https://github.com/element-hq/element-web', license: 'Apache-2.0', difficulty: 'Hard', docker: true, features: ['E2E encryption', 'Voice channels', 'Bridges to Discord', 'Spaces (like servers)', 'Federation'], scenarioTags: ['small_team', 'advanced_setup', 'docker_ready', 'e2e_encryption', 'federation', 'collaboration', 'mobile_app', 'desktop_app'] },
      { name: 'Revolt', description: 'Modern chat platform with a Discord-like interface and user privacy focus.', url: 'https://revolt.chat', github: 'https://github.com/revoltchat', license: 'AGPL-3.0', difficulty: 'Medium', docker: true, features: ['Servers & channels', 'Voice chat', 'Custom themes', 'Bots', 'No tracking'], scenarioTags: ['solo_dev', 'small_team', 'intermediate', 'docker_ready', 'collaboration', 'desktop_app', 'web_only'] },
      { name: 'Mumble', description: 'Low-latency voice chat designed for gaming with positional audio.', url: 'https://mumble.info', github: 'https://github.com/mumble-voip/mumble', license: 'BSD-3-Clause', difficulty: 'Easy', docker: true, dockerCommand: 'docker run -d -p 64738:64738/udp mumblevoip/mumble-server', features: ['Low-latency voice', 'Positional audio', 'In-game overlay', 'ACL permissions', 'Channels'], scenarioTags: ['solo_dev', 'small_team', 'beginner_friendly', 'docker_ready', 'lightweight', 'raspberry_pi'] },
    ],
    title: 'Self-Hosted Discord Alternative - Open Source Voice & Text Chat',
    h1: 'Self-Hosted Discord Alternatives',
    description: 'Replace Discord with self-hosted chat platforms. Compare Element, Revolt, and Mumble — no data collection, full control.',
    explanation: 'Discord collects user data and uses it for advertising. Self-hosted alternatives give you full privacy control. Element (Matrix) can even bridge to existing Discord servers during migration.',
    faq: [
      { q: 'Can I bridge Discord to a self-hosted alternative?', a: 'Yes. Matrix (Element) has a Discord bridge that syncs messages between platforms, making migration gradual.' },
    ],
    keywords: ['self-hosted discord', 'discord alternative open source', 'revolt chat', 'element matrix discord', 'self-hosted Discord alternative', 'best open source Discord alternative', 'free Discord replacement'],
  },
  {
    slug: 'zoom',
    saasName: 'Zoom',
    category: 'Communication',
    icon: '📹',
    alternatives: [
      { name: 'Jitsi Meet', description: 'Fully-featured video conferencing with no account required for participants.', url: 'https://jitsi.org', github: 'https://github.com/jitsi/jitsi-meet', license: 'Apache-2.0', difficulty: 'Medium', docker: true, dockerCommand: 'docker run -d -p 8443:8443 jitsi/docker-jitsi-meet', features: ['Video calls', 'Screen sharing', 'Recording', 'Breakout rooms', 'No account needed', 'End-to-end encryption'], scenarioTags: ['solo_dev', 'small_team', 'intermediate', 'docker_ready', 'collaboration', 'sharing', 'mobile_app', 'scalable'] },
      { name: 'BigBlueButton', description: 'Educational video conferencing with whiteboard, polling, and breakout rooms.', url: 'https://bigbluebutton.org', github: 'https://github.com/bigbluebutton/bigbluebutton', license: 'LGPL-3.0', difficulty: 'Hard', docker: true, features: ['Whiteboard', 'Polling', 'Breakout rooms', 'Recording', 'Presentation', 'Chat'], scenarioTags: ['small_team', 'enterprise', 'advanced_setup', 'docker_ready', 'collaboration', 'sharing', 'scalable'] },
    ],
    title: 'Self-Hosted Zoom Alternative - Open Source Video Conferencing',
    h1: 'Self-Hosted Zoom Alternatives',
    description: 'Replace Zoom with self-hosted video conferencing. Compare Jitsi Meet and BigBlueButton — no time limits, no meeting restrictions, full privacy control.',
    explanation: 'Zoom limits free meetings to 40 minutes and has faced privacy controversies. Jitsi Meet provides unlimited meeting duration, no account requirements for participants, and can be deployed in minutes with Docker.',
    faq: [
      { q: 'Is Jitsi Meet as good as Zoom?', a: 'For most use cases, yes. Jitsi supports screen sharing, recording, breakout rooms, and up to 100 participants. The interface is simpler than Zoom but covers essential features.' },
    ],
    keywords: ['self-hosted zoom', 'zoom alternative open source', 'jitsi meet self-hosted', 'open source video conferencing', 'self-hosted Zoom alternative', 'best open source Zoom alternative', 'free Zoom replacement'],
  },

  // === Password Management ===
  {
    slug: 'lastpass',
    saasName: 'LastPass',
    category: 'Password Management',
    icon: '🔑',
    alternatives: [
      { name: 'Vaultwarden', description: 'Lightweight Bitwarden-compatible server written in Rust. Full-featured, low resource usage.', url: 'https://github.com/dani-garcia/vaultwarden', github: 'https://github.com/dani-garcia/vaultwarden', license: 'AGPL-3.0', difficulty: 'Easy', docker: true, dockerCommand: 'docker run -d -p 8080:80 vaultwarden/server', features: ['Bitwarden compatible', 'Browser extensions', 'Mobile apps', 'TOTP', 'Organizations', 'Emergency access'], scenarioTags: ['solo_dev', 'small_team', 'beginner_friendly', 'docker_ready', 'lightweight', 'low_resource', 'sharing', 'mobile_app', 'desktop_app', 'raspberry_pi', 'api_access'] },
      { name: 'Passbolt', description: 'Team-oriented password manager with GPG encryption and collaborative features.', url: 'https://www.passbolt.com', github: 'https://github.com/passbolt/passbolt_api', license: 'AGPL-3.0', difficulty: 'Medium', docker: true, dockerCommand: 'docker run -d -p 443:443 passbolt/passbolt', features: ['GPG encryption', 'Team sharing', 'Browser extension', 'API', 'AD/LDAP'], scenarioTags: ['small_team', 'enterprise', 'intermediate', 'docker_ready', 'ldap', 'api_access', 'sharing', 'audit_log', 'rbac'] },
    ],
    title: 'Self-Hosted LastPass Alternative - Open Source Password Manager',
    h1: 'Self-Hosted LastPass Alternatives',
    description: 'Replace LastPass with self-hosted password management. Compare Vaultwarden and Passbolt — no subscription, full data ownership.',
    explanation: 'LastPass has suffered multiple security breaches. Vaultwarden uses the Bitwarden client apps (browser extensions, mobile) but runs on your own server, giving you the same experience with full data control. It uses only ~10MB of RAM.',
    faq: [
      { q: 'Is Vaultwarden safe?', a: 'Vaultwarden uses the same encryption as Bitwarden — AES-256 bit encryption. Your vault data is encrypted client-side before reaching the server. Even if the server is compromised, your passwords remain encrypted.' },
      { q: 'Can I use Bitwarden browser extension with Vaultwarden?', a: 'Yes. Vaultwarden is fully compatible with all official Bitwarden clients (browser extensions, mobile apps, desktop apps, CLI).' },
    ],
    keywords: ['self-hosted lastpass', 'lastpass alternative open source', 'vaultwarden', 'self-hosted password manager', 'self-hosted LastPass alternative', 'best open source LastPass alternative', 'free LastPass replacement'],
  },
  {
    slug: '1password',
    saasName: '1Password',
    category: 'Password Management',
    icon: '🔐',
    alternatives: [
      { name: 'Vaultwarden', description: 'Bitwarden-compatible server with browser extensions and mobile apps.', url: 'https://github.com/dani-garcia/vaultwarden', github: 'https://github.com/dani-garcia/vaultwarden', license: 'AGPL-3.0', difficulty: 'Easy', docker: true, dockerCommand: 'docker run -d -p 8080:80 vaultwarden/server', features: ['Cross-platform', 'Browser extensions', 'Mobile apps', 'TOTP', 'Secure sharing'], scenarioTags: ['solo_dev', 'small_team', 'beginner_friendly', 'docker_ready', 'lightweight', 'low_resource', 'sharing', 'mobile_app', 'desktop_app', 'raspberry_pi'] },
      { name: 'Passbolt', description: 'GPG-based team password manager with granular sharing controls.', url: 'https://www.passbolt.com', github: 'https://github.com/passbolt/passbolt_api', license: 'AGPL-3.0', difficulty: 'Medium', docker: true, features: ['GPG encryption', 'Team sharing', 'Permission matrix', 'API'], scenarioTags: ['small_team', 'enterprise', 'intermediate', 'docker_ready', 'ldap', 'rbac', 'api_access', 'sharing', 'audit_log'] },
    ],
    title: 'Self-Hosted 1Password Alternative - Open Source Password Manager',
    h1: 'Self-Hosted 1Password Alternatives',
    description: 'Replace 1Password with open source self-hosted password managers. Compare Vaultwarden and Passbolt with features and setup guides.',
    explanation: '1Password costs $2.99-$7.99/month and stores your vault on their servers. Vaultwarden provides the same functionality for free on your own hardware, using the official Bitwarden client apps you already know.',
    faq: [
      { q: 'Can I import 1Password data into Vaultwarden?', a: 'Yes. Bitwarden clients (which Vaultwarden is compatible with) support direct import from 1Password export files.' },
    ],
    keywords: ['self-hosted 1password', '1password alternative open source', 'vaultwarden self-hosted', 'self-hosted 1Password alternative', 'best open source 1Password alternative', 'free 1Password replacement'],
  },

  // === Project Management ===
  {
    slug: 'jira',
    saasName: 'Jira',
    category: 'Project Management',
    icon: '📋',
    alternatives: [
      { name: 'Plane', description: 'Modern issue tracking and project management with a beautiful UI.', url: 'https://plane.so', github: 'https://github.com/makeplane/plane', license: 'AGPL-3.0', difficulty: 'Medium', docker: true, dockerCommand: 'docker run -d -p 3000:3000 makeplane/plane', features: ['Issues', 'Cycles', 'Modules', 'Backlog', 'Kanban', 'Gantt charts'], scenarioTags: ['small_team', 'intermediate', 'docker_ready', 'kanban', 'gantt', 'collaboration', 'api_access'] },
      { name: 'Taiga', description: 'Agile project management with Scrum and Kanban boards.', url: 'https://taiga.io', github: 'https://github.com/kaleidos-ventures/taiga', license: 'MPL-2.0', difficulty: 'Medium', docker: true, features: ['Scrum', 'Kanban', 'Epics', 'Wiki', 'Issue tracking', 'Webhooks'], scenarioTags: ['small_team', 'intermediate', 'docker_ready', 'kanban', 'collaboration', 'wiki', 'webhook', 'api_access'] },
      { name: 'Redmine', description: 'Mature and flexible issue tracker with extensive plugin ecosystem.', url: 'https://www.redmine.org', github: 'https://github.com/redmine/redmine', license: 'GPL-2.0', difficulty: 'Easy', docker: true, dockerCommand: 'docker run -d -p 3000:3000 redmine', features: ['Issue tracking', 'Gantt charts', 'Wiki', 'Forums', 'Time tracking', '200+ plugins'], scenarioTags: ['small_team', 'enterprise', 'beginner_friendly', 'docker_ready', 'kanban', 'gantt', 'wiki', 'ldap', 'api_access'] },
      { name: 'OpenProject', description: 'Full-featured project management with Gantt charts, Agile boards, time tracking, and BIM support.', url: 'https://openproject.org', github: 'https://github.com/opf/openproject', license: 'GPL-3.0', difficulty: 'Hard', docker: true, dockerCommand: 'docker run -d -p 8080:80 openproject/community', features: ['Gantt charts', 'Agile boards', 'Time tracking', 'BIM', 'Wiki', 'SSO/SAML', 'LDAP'], scenarioTags: ['enterprise', 'advanced_setup', 'docker_ready', 'gantt', 'kanban', 'collaboration', 'ldap', 'sso', 'api_access'] },
    ],
    title: 'Self-Hosted Jira Alternative - Open Source Project Management',
    h1: 'Self-Hosted Jira Alternatives',
    description: 'Replace Jira with self-hosted project management. Compare Plane, Taiga, Redmine, and OpenProject — no per-user pricing, full control.',
    explanation: 'Jira charges $7.75-$15.25 per user/month and can feel bloated. Plane offers a modern, fast alternative. OpenProject adds Gantt charts and BIM support for enterprise teams. Redmine is battle-tested with 15+ years of development and hundreds of plugins.',
    faq: [
      { q: 'Can I migrate from Jira to Plane?', a: 'Yes. Plane supports importing from Jira via CSV export or direct API import for issues and projects.' },
    ],
    keywords: ['self-hosted jira', 'jira alternative open source', 'plane project management', 'redmine self-hosted', 'self-hosted Jira alternative', 'best open source Jira alternative', 'free Jira replacement'],
  },
  {
    slug: 'trello',
    saasName: 'Trello',
    category: 'Project Management',
    icon: '📌',
    alternatives: [
      { name: 'WeKan', description: 'Open-source kanban board with a Trello-like interface.', url: 'https://wekan.github.io', github: 'https://github.com/wekan/wekan', license: 'MIT', difficulty: 'Easy', docker: true, dockerCommand: 'docker run -d -p 8080:8080 wekanteam/wekan', features: ['Kanban boards', 'Swimlanes', 'Checklists', 'Labels', 'Due dates', 'Import from Trello'], scenarioTags: ['solo_dev', 'small_team', 'beginner_friendly', 'docker_ready', 'kanban', 'collaboration', 'ldap'] },
      { name: 'Focalboard', description: 'Trello + Notion hybrid with boards, tables, gallery, and calendar views.', url: 'https://www.focalboard.com', github: 'https://github.com/mattermost/focalboard', license: 'AGPL-3.0', difficulty: 'Easy', docker: true, features: ['Kanban', 'Tables', 'Gallery', 'Calendar', 'Integrates with Mattermost'], scenarioTags: ['solo_dev', 'small_team', 'beginner_friendly', 'docker_ready', 'kanban', 'collaboration', 'desktop_app'] },
      { name: 'Kanboard', description: 'Minimalist kanban board focused on simplicity and efficiency.', url: 'https://kanboard.org', github: 'https://github.com/kanboard/kanboard', license: 'MIT', difficulty: 'Easy', docker: true, dockerCommand: 'docker run -d -p 8080:80 kanboard/kanboard', features: ['Kanban', 'Swimlanes', 'Analytics', 'Plugins', 'API', 'CLI tools'], scenarioTags: ['solo_dev', 'small_team', 'beginner_friendly', 'docker_ready', 'lightweight', 'kanban', 'api_access', 'cli', 'ldap'] },
    ],
    title: 'Self-Hosted Trello Alternative - Open Source Kanban Board',
    h1: 'Self-Hosted Trello Alternatives',
    description: 'Replace Trello with self-hosted kanban boards. Compare WeKan, Focalboard, and Kanboard — no board limits, no power-up fees.',
    explanation: 'Trello limits free boards to 10 and restricts power-ups. WeKan is the closest Trello clone and even imports your existing boards. Kanboard is lighter with built-in analytics.',
    faq: [
      { q: 'Can I import Trello boards into WeKan?', a: 'Yes. WeKan has a direct Trello import feature that preserves boards, cards, labels, checklists, and attachments.' },
    ],
    keywords: ['self-hosted trello', 'trello alternative open source', 'wekan self-hosted', 'open source kanban', 'self-hosted Trello alternative', 'best open source Trello alternative', 'free Trello replacement'],
  },

  // === Media Streaming ===
  {
    slug: 'spotify',
    saasName: 'Spotify',
    category: 'Media Streaming',
    icon: '🎵',
    alternatives: [
      { name: 'Navidrome', description: 'Modern music server and streamer with Subsonic API compatibility.', url: 'https://www.navidrome.org', github: 'https://github.com/navidrome/navidrome', license: 'GPL-3.0', difficulty: 'Easy', docker: true, dockerCommand: 'docker run -d -p 4533:4533 -v ~/music:/music -v ~/data:/data deluan/navidrome', features: ['Music streaming', 'Smart playlists', 'Last.fm integration', 'Transcoding', 'Subsonic API', 'Mobile apps'], scenarioTags: ['solo_dev', 'beginner_friendly', 'docker_ready', 'lightweight', 'low_resource', 'streaming', 'mobile_app', 'raspberry_pi'] },
      { name: 'Jellyfin', description: 'Full media server for music, movies, and TV shows with no subscriptions.', url: 'https://jellyfin.org', github: 'https://github.com/jellyfin/jellyfin', license: 'GPL-2.0', difficulty: 'Easy', docker: true, dockerCommand: 'docker run -d -p 8096:8096 jellyfin/jellyfin', features: ['Music streaming', 'Movies & TV', 'Live TV', 'Transcoding', 'Mobile apps', 'Chromecast'], scenarioTags: ['solo_dev', 'small_team', 'beginner_friendly', 'docker_ready', 'streaming', 'mobile_app', 'desktop_app', 'sharing'] },
      { name: 'Ampache', description: 'Web-based audio/video streaming with a long history and mature feature set.', url: 'https://ampache.org', github: 'https://github.com/ampache/ampache', license: 'AGPL-3.0', difficulty: 'Medium', docker: true, features: ['Music streaming', 'Video streaming', 'Playlists', 'API', 'Subsonic compatible'], scenarioTags: ['solo_dev', 'intermediate', 'docker_ready', 'streaming', 'api_access'] },
    ],
    title: 'Self-Hosted Spotify Alternative - Open Source Music Server',
    h1: 'Self-Hosted Spotify Alternatives',
    description: 'Replace Spotify with self-hosted music streaming. Compare Navidrome, Jellyfin, and Ampache — stream your own music collection.',
    explanation: 'Spotify pays artists $0.003-$0.005 per stream and tracks your listening habits. Navidrome streams your personal music collection with a Spotify-like interface, smart playlists, and mobile apps. It uses minimal resources (~20MB RAM).',
    faq: [
      { q: 'Can I use Spotify-like features with Navidrome?', a: 'Yes. Navidrome supports smart playlists, favorites, most played, recently added, and has mobile apps via Subsonic-compatible clients (Ultrasonic, DSub, play:Sub).' },
      { q: 'Does Navidrome support podcasts?', a: 'Not natively. Use a dedicated podcast app like gpodder2 or mix Navidrome with a separate podcast solution.' },
    ],
    keywords: ['self-hosted spotify', 'spotify alternative open source', 'navidrome', 'self-hosted music server', 'self-hosted Spotify alternative', 'best open source Spotify alternative', 'free Spotify replacement'],
  },
  {
    slug: 'netflix',
    saasName: 'Netflix',
    category: 'Media Streaming',
    icon: '🎬',
    alternatives: [
      { name: 'Jellyfin', description: 'Full media server for movies, TV shows, and music — the closest Netflix replacement.', url: 'https://jellyfin.org', github: 'https://github.com/jellyfin/jellyfin', license: 'GPL-2.0', difficulty: 'Easy', docker: true, dockerCommand: 'docker run -d -p 8096:8096 jellyfin/jellyfin', features: ['Movies & TV', 'Transcoding', 'Subtitles', 'Live TV', 'Mobile apps', 'Chromecast/Roku'], scenarioTags: ['solo_dev', 'beginner_friendly', 'docker_ready', 'streaming', 'sharing', 'mobile_app', 'desktop_app', 'raspberry_pi'] },
      { name: 'Plex', description: 'Popular media server with a polished UI and broad device support (free tier).', url: 'https://www.plex.tv', github: '', license: 'Proprietary (free)', difficulty: 'Easy', docker: true, dockerCommand: 'docker run -d -p 32400:32400 plexinc/pms-docker', features: ['Movies & TV', 'Music', 'Photos', '4K transcoding', 'Mobile apps', 'Smart TV apps'], scenarioTags: ['solo_dev', 'beginner_friendly', 'docker_ready', 'streaming', 'sharing', 'mobile_app', 'desktop_app'] },
      { name: 'Emby', description: 'Media server with Live TV, DVR, and parental controls.', url: 'https://emby.media', github: '', license: 'Proprietary (free)', difficulty: 'Easy', docker: true, features: ['Movies & TV', 'Live TV/DVR', 'Transcoding', 'Parental controls', 'Mobile apps'], scenarioTags: ['solo_dev', 'beginner_friendly', 'docker_ready', 'streaming', 'mobile_app', 'desktop_app'] },
    ],
    title: 'Self-Hosted Netflix Alternative - Open Source Media Server',
    h1: 'Self-Hosted Netflix Alternatives',
    description: 'Replace Netflix with self-hosted media streaming. Compare Jellyfin, Plex, and Emby — stream your own movies and TV shows.',
    explanation: 'Jellyfin is the only fully open source option with no premium tiers or feature paywalls. Plex has the most polished interface but locks some features behind a subscription. Jellyfin supports hardware transcoding, subtitles, and has apps for virtually every platform.',
    faq: [
      { q: 'Jellyfin vs Plex — which is better?', a: 'Jellyfin is fully free and open source. Plex has a more polished UI and better device support but requires Plex Pass ($4.99/month) for hardware transcoding, Live TV, and mobile streaming.' },
      { q: 'Can Jellyfin handle 4K content?', a: 'Yes. With hardware-accelerated transcoding (Intel QuickSync, NVIDIA NVENC, or AMD AMF), Jellyfin can transcode 4K content in real time.' },
    ],
    keywords: ['self-hosted netflix', 'netflix alternative open source', 'jellyfin vs plex', 'self-hosted media server', 'self-hosted Netflix alternative', 'best open source Netflix alternative', 'free Netflix replacement'],
  },

  // === Code Hosting ===
  {
    slug: 'github',
    saasName: 'GitHub',
    category: 'Code Hosting',
    icon: '🐙',
    alternatives: [
      { name: 'Gitea', description: 'Lightweight, fast Git service with a GitHub-like interface. Runs on a Raspberry Pi.', url: 'https://gitea.io', github: 'https://github.com/go-gitea/gitea', license: 'MIT', difficulty: 'Easy', docker: true, dockerCommand: 'docker run -d -p 3000:3000 gitea/gitea', features: ['Git hosting', 'Pull requests', 'Issues', 'CI/CD', 'Packages', 'Wiki'], scenarioTags: ['solo_dev', 'small_team', 'beginner_friendly', 'docker_ready', 'lightweight', 'low_resource', 'cicd', 'api_access', 'ldap', 'raspberry_pi'] },
      { name: 'GitLab CE', description: 'Full DevOps platform with CI/CD, container registry, and monitoring.', url: 'https://about.gitlab.com', github: 'https://gitlab.com/gitlab-org/gitlab', license: 'MIT', difficulty: 'Hard', docker: true, dockerCommand: 'docker run -d -p 8080:8080 gitlab/gitlab-ce', features: ['Git hosting', 'CI/CD', 'Container registry', 'Monitoring', 'Security scanning', 'Wiki'], scenarioTags: ['small_team', 'enterprise', 'advanced_setup', 'docker_ready', 'cicd', 'collaboration', 'ldap', 'sso', 'api_access', 'monitoring', 'scalable', 'audit_log'] },
      { name: 'Forgejo', description: 'Community-driven Gitea fork focused on sustainability and community governance.', url: 'https://forgejo.org', github: 'https://codeberg.org/forgejo/forgejo', license: 'MIT', difficulty: 'Easy', docker: true, dockerCommand: 'docker run -d -p 3000:3000 codeberg.org/forgejo/forgejo', features: ['Git hosting', 'Pull requests', 'Issues', 'Actions (CI/CD)', 'Packages'], scenarioTags: ['solo_dev', 'small_team', 'beginner_friendly', 'docker_ready', 'lightweight', 'cicd', 'api_access', 'raspberry_pi'] },
    ],
    title: '5 Best Self-Hosted GitHub Alternatives (2026) — Free Open Source Git Servers | No User Limits',
    h1: 'Self-Hosted GitHub Alternatives',
    description: 'Replace GitHub with free self-hosted Git hosting in 2026. Compare Gitea (51K+ GitHub stars, runs on Raspberry Pi), GitLab CE (full DevOps with CI/CD), and Forgejo (community-driven fork). No per-user fees, unlimited private repos, full data ownership. Save $4-$21/user/month vs GitHub Teams.',
    explanation: 'GitHub charges $4-$21/user/month for teams and your code lives on Microsoft servers. Gitea runs on a $5 VPS or Raspberry Pi with full GitHub-like features — 51K+ GitHub stars, MIT licensed, and used by 500K+ self-hosted instances. GitLab CE adds enterprise DevOps (CI/CD, container registry, monitoring) but requires 4GB+ RAM. Forgejo is the community-driven Gitea fork focused on sustainable open governance.',
    faq: [
      { q: 'Gitea vs GitLab vs Forgejo — which should I choose?', a: 'Gitea if you want lightweight and fast (runs on 512MB RAM, perfect for solo devs and small teams). GitLab CE if you need built-in CI/CD, container registry, and enterprise features (needs 4GB+ RAM). Forgejo if you prefer community governance over corporate-controlled open source.' },
      { q: 'Can I migrate GitHub repositories to a self-hosted alternative?', a: 'Yes. All three (Gitea, GitLab CE, Forgejo) support importing from GitHub including issues, pull requests, wiki pages, and releases. Gitea and Forgejo also support mirroring — automatically syncing with upstream GitHub repos.' },
      { q: 'How much can I save by self-hosting Git vs GitHub?', a: 'GitHub Teams costs $4/user/month ($48/user/year) and Enterprise is $21/user/month ($252/user/year). A 10-person team pays $480-$2,520/year. Gitea on a $5/month VPS costs $60/year total — saving 88-98% while gaining full data ownership and unlimited private repos.' },
    ],
    keywords: ['self hosted github alternative', 'github alternative open source', 'gitea vs gitlab', 'self-hosted git server', 'free github replacement', 'best open source github alternative', 'gitea self hosted', 'gitlab ce self hosted', 'forgejo vs gitea', 'self hosted git hosting', 'github alternative no user limit', 'open source code hosting', 'private git server'],
  },

  // === Email ===
  {
    slug: 'gmail',
    saasName: 'Gmail',
    category: 'Email',
    icon: '📧',
    alternatives: [
      { name: 'Mail-in-a-Box', description: 'Turn-key email server solution with webmail, contacts, and calendar.', url: 'https://mailinabox.email', github: 'https://github.com/mail-in-a-box/mailinabox', license: 'CC0-1.0', difficulty: 'Medium', docker: false, features: ['Email', 'Webmail', 'Contacts', 'Calendar', 'Spam filtering', 'DNS management'], scenarioTags: ['solo_dev', 'small_team', 'intermediate', 'collaboration', 'api_access', 'web_only'] },
      { name: 'Mailu', description: 'Docker-based mail server with modern web interfaces.', url: 'https://mailu.io', github: 'https://github.com/Mailu/Mailu', license: 'MIT', difficulty: 'Medium', docker: true, features: ['Email', 'Webmail', 'Admin panel', 'Antivirus', 'Spam filter', 'DKIM/DMARC'], scenarioTags: ['solo_dev', 'small_team', 'intermediate', 'docker_ready', 'collaboration', 'api_access'] },
      { name: 'Poste.io', description: 'Complete email server in a single Docker container with a modern UI.', url: 'https://poste.io', github: '', license: 'Proprietary (free)', difficulty: 'Easy', docker: true, dockerCommand: 'docker run -d -p 80:80 -p 443:443 -p 25:25 -p 110:110 -p 143:143 -p 465:465 -p 587:587 -p 993:993 -p 995:995 analogic/poste.io', features: ['Email', 'Webmail', 'Calendar', 'Antivirus', 'Spam filter', 'Admin panel'], scenarioTags: ['solo_dev', 'beginner_friendly', 'docker_ready', 'lightweight', 'collaboration', 'web_only'] },
    ],
    title: 'Self-Hosted Gmail Alternative - Open Source Email Server',
    h1: 'Self-Hosted Gmail Alternatives',
    description: 'Replace Gmail with self-hosted email. Compare Mail-in-a-Box, Mailu, and Poste.io — no scanning, unlimited addresses.',
    explanation: 'Gmail scans email content for advertising and has no privacy guarantee. Self-hosted email gives you unlimited addresses at your own domain, no scanning, and full control. Mail-in-a-Box is the easiest to set up on a fresh Ubuntu VPS.',
    faq: [
      { q: 'Is self-hosting email difficult?', a: 'It used to be. Mail-in-a-Box makes it straightforward on a fresh Ubuntu VPS. The hardest part is DNS configuration (SPF, DKIM, DMARC) which Mail-in-a-Box guides you through.' },
      { q: 'Will my self-hosted email land in spam?', a: 'Properly configured email (SPF, DKIM, DMARC, rDNS) with a dedicated IP and clean domain reputation will not land in spam. Mail-in-a-Box handles most of this automatically.' },
    ],
    keywords: ['self-hosted gmail', 'gmail alternative open source', 'mail-in-a-box', 'self-hosted email server', 'self-hosted Gmail alternative', 'best open source Gmail alternative', 'free Gmail replacement'],
  },

  // === Wiki ===
  {
    slug: 'confluence',
    saasName: 'Confluence',
    category: 'Wiki',
    icon: '📚',
    alternatives: [
      { name: 'BookStack', description: 'Simple, intuitive wiki with a book/chapter/page structure.', url: 'https://www.bookstackapp.com', github: 'https://github.com/BookStackApp/BookStack', license: 'MIT', difficulty: 'Easy', docker: true, dockerCommand: 'docker run -d -p 8080:80 solidnerd/bookstack', features: ['WYSIWYG editor', 'Book structure', 'Search', 'Shelf organization', 'API', 'SAML/OAuth'], scenarioTags: ['solo_dev', 'small_team', 'beginner_friendly', 'docker_ready', 'wiki', 'collaboration', 'saml', 'api_access'] },
      { name: 'Outline', description: 'Modern knowledge base with real-time collaboration and beautiful interface.', url: 'https://getoutline.com', github: 'https://github.com/outline/outline', license: 'BSL-1.1', difficulty: 'Medium', docker: true, features: ['Real-time collaboration', 'Markdown', 'Search', 'Slack integration', 'Collections'], scenarioTags: ['small_team', 'intermediate', 'docker_ready', 'wiki', 'collaboration', 'search', 'sso', 'api_access'] },
      { name: 'Wiki.js', description: 'Powerful wiki with support for multiple storage backends and editing formats.', url: 'https://js.wiki', github: 'https://github.com/requarks/wiki', license: 'AGPL-3.0', difficulty: 'Medium', docker: true, dockerCommand: 'docker run -d -p 3000:3000 requarks/wiki', features: ['Markdown', 'WYSIWYG', 'Git storage', 'Multiple backends', 'Search', 'Localization'], scenarioTags: ['small_team', 'enterprise', 'intermediate', 'docker_ready', 'wiki', 'collaboration', 'search', 'ldap', 'oauth', 'api_access', 'scalable'] },
    ],
    title: 'Self-Hosted Confluence Alternative - Open Source Wiki',
    h1: 'Self-Hosted Confluence Alternatives',
    description: 'Replace Confluence with self-hosted wiki software. Compare BookStack, Outline, and Wiki.js — no user limits, full content ownership.',
    explanation: 'Confluence costs $5.50-$11/user/month and can be slow. BookStack uses a familiar book/chapter/page metaphor and runs on minimal resources. Wiki.js supports Git-backed storage so your wiki content is version-controlled.',
    faq: [
      { q: 'Can I import Confluence content?', a: 'BookStack has a Confluence import tool. Wiki.js supports importing from Confluence via API. Outline can import HTML and Markdown exports.' },
    ],
    keywords: ['self-hosted confluence', 'confluence alternative open source', 'bookstack', 'wiki.js self-hosted', 'self-hosted Confluence alternative', 'best open source Confluence alternative', 'free Confluence replacement'],
  },

  // === Database / Spreadsheet ===
  {
    slug: 'airtable',
    saasName: 'Airtable',
    category: 'Database',
    icon: '🗃️',
    alternatives: [
      { name: 'NocoDB', description: 'Turns any database into a smart spreadsheet with Airtable-like interface.', url: 'https://nocodb.com', github: 'https://github.com/nocodb/nocodb', license: 'AGPL-3.0', difficulty: 'Easy', docker: true, dockerCommand: 'docker run -d -p 8080:8080 nocodb/nocodb', features: ['Spreadsheet UI', 'Forms', 'Galleries', 'Kanban', 'REST API', 'Connects to existing DB'], scenarioTags: ['solo_dev', 'small_team', 'beginner_friendly', 'docker_ready', 'collaboration', 'forms', 'kanban', 'rest_api', 'scalable'] },
      { name: 'Baserow', description: 'Open source database tool with no-code application building.', url: 'https://baserow.io', github: 'https://github.com/bram2w/baserow', license: 'MIT', difficulty: 'Easy', docker: true, dockerCommand: 'docker run -d -p 8080:80 baserow/baserow', features: ['Spreadsheet UI', 'Templates', 'Plugins', 'API', 'Real-time collaboration'], scenarioTags: ['solo_dev', 'small_team', 'beginner_friendly', 'docker_ready', 'collaboration', 'rest_api', 'webhook'] },
    ],
    title: 'Self-Hosted Airtable Alternative - Open Source Database Spreadsheet',
    h1: 'Self-Hosted Airtable Alternatives',
    description: 'Replace Airtable with self-hosted database tools. Compare NocoDB and Baserow — unlimited rows, no per-seat pricing.',
    explanation: 'Airtable charges $20/seat/month and limits rows on lower plans. NocoDB connects to your existing MySQL/Postgres database and gives it an Airtable-like interface with no row limits.',
    faq: [
      { q: 'Can NocoDB connect to an existing database?', a: 'Yes. NocoDB can connect to MySQL, PostgreSQL, SQL Server, and SQLite databases, instantly giving them a spreadsheet-like interface.' },
    ],
    keywords: ['self-hosted airtable', 'airtable alternative open source', 'nocodb', 'baserow self-hosted', 'self-hosted Airtable alternative', 'best open source Airtable alternative', 'free Airtable replacement'],
  },

  // === Analytics ===
  {
    slug: 'google-analytics',
    saasName: 'Google Analytics',
    category: 'Analytics',
    icon: '📊',
    alternatives: [
      { name: 'Plausible', description: 'Privacy-friendly, lightweight analytics. No cookies, GDPR compliant out of the box.', url: 'https://plausible.io', github: 'https://github.com/plausible/analytics', license: 'AGPL-3.0', difficulty: 'Easy', docker: true, dockerCommand: 'docker run -d -p 8000:8000 plausible/analytics', features: ['Page views', 'Goals', 'Referrers', 'No cookies', '< 1KB script', 'GDPR compliant'], scenarioTags: ['solo_dev', 'small_team', 'beginner_friendly', 'docker_ready', 'lightweight', 'monitoring', 'api_access'] },
      { name: 'Umami', description: 'Simple, fast, privacy-focused analytics with a clean dashboard.', url: 'https://umami.is', github: 'https://github.com/umami-software/umami', license: 'MIT', difficulty: 'Easy', docker: true, dockerCommand: 'docker run -d -p 3000:3000 ghcr.io/umami-software/umami', features: ['Page views', 'Events', 'Real-time', 'UTM tracking', 'No cookies', '< 2KB script'], scenarioTags: ['solo_dev', 'small_team', 'beginner_friendly', 'docker_ready', 'lightweight', 'monitoring', 'api_access', 'raspberry_pi'] },
      { name: 'Matomo', description: 'Full-featured analytics platform with heatmaps and A/B testing.', url: 'https://matomo.org', github: 'https://github.com/matomo-org/matomo', license: 'GPL-3.0', difficulty: 'Medium', docker: true, dockerCommand: 'docker run -d -p 8080:80 matomo', features: ['Full analytics', 'Heatmaps', 'A/B testing', 'E-commerce', 'GDPR tools', 'Google Analytics import'], scenarioTags: ['small_team', 'enterprise', 'intermediate', 'docker_ready', 'monitoring', 'api_access', 'scalable'] },
    ],
    title: 'Self-Hosted Google Analytics Alternative - Open Source Web Analytics',
    h1: 'Self-Hosted Google Analytics Alternatives',
    description: 'Replace Google Analytics with privacy-friendly alternatives. Compare Plausible, Umami, and Matomo — no cookies, GDPR compliant.',
    explanation: 'Google Analytics uses cookies, tracks users across sites, and shares data with Google ad network. Plausible and Umami are cookie-free, GDPR compliant without consent banners, and the tracking script is under 2KB.',
    faq: [
      { q: 'Is Plausible GDPR compliant?', a: 'Yes. Plausible does not use cookies, does not collect personal data, and does not track across sites. No consent banner is needed.' },
      { q: 'Can I import Google Analytics data?', a: 'Matomo has a direct Google Analytics importer. Plausible and Umami start fresh but are fast to set up.' },
    ],
    keywords: ['self-hosted google analytics', 'google analytics alternative open source', 'plausible analytics', 'umami self-hosted', 'self-hosted Google Analytics alternative', 'best open source Google Analytics alternative', 'free Google Analytics replacement'],
  },

  // === CRM ===
  {
    slug: 'salesforce',
    saasName: 'Salesforce',
    category: 'CRM',
    icon: '💼',
    alternatives: [
      { name: 'Twenty', description: 'Modern, open-source CRM with a Notion-like interface and GraphQL API.', url: 'https://twenty.com', github: 'https://github.com/twentyhq/twenty', license: 'AGPL-3.0', difficulty: 'Medium', docker: true, features: ['Contact management', 'Deal pipeline', 'Tasks', 'Custom fields', 'GraphQL API', 'Automation'], scenarioTags: ['small_team', 'intermediate', 'docker_ready', 'crm', 'automation', 'graphql', 'api_access'] },
      { name: 'Monica', description: 'Personal CRM for relationship management with contact notes and reminders.', url: 'https://monicahq.com', github: 'https://github.com/monicahq/monica', license: 'AGPL-3.0', difficulty: 'Easy', docker: true, dockerCommand: 'docker run -d -p 8080:80 monica/monica', features: ['Contact management', 'Reminders', 'Notes', 'Activities', 'Gift ideas', 'Debt tracking'], scenarioTags: ['solo_dev', 'beginner_friendly', 'docker_ready', 'lightweight', 'crm', 'api_access'] },
      { name: 'EspoCRM', description: 'Full-featured CRM with sales, marketing, and service management.', url: 'https://www.espocrm.com', github: 'https://github.com/espocrm/espocrm', license: 'AGPL-3.0', difficulty: 'Medium', docker: true, features: ['Sales pipeline', 'Email marketing', 'Case management', 'Reports', 'Workflow automation', 'BPM'], scenarioTags: ['small_team', 'enterprise', 'intermediate', 'docker_ready', 'crm', 'automation', 'ldap', 'api_access', 'scalable'] },
    ],
    title: 'Self-Hosted Salesforce Alternative - Open Source CRM',
    h1: 'Self-Hosted Salesforce Alternatives',
    description: 'Replace Salesforce with self-hosted CRM. Compare Twenty, Monica, and EspoCRM — no per-user licensing, full data ownership.',
    explanation: 'Salesforce starts at $25/user/month and scales to $500/user/month. Twenty is a modern open-source CRM with a beautiful UI. Monica is perfect for personal relationship management.',
    faq: [
      { q: 'Is there a free self-hosted CRM?', a: 'Yes. Twenty, Monica, and EspoCRM are all free to self-host with no user limits.' },
    ],
    keywords: ['self-hosted salesforce', 'salesforce alternative open source', 'open source CRM', 'twenty CRM', 'self-hosted Salesforce alternative', 'best open source Salesforce alternative', 'free Salesforce replacement'],
  },

  // === Monitoring ===
  {
    slug: 'datadog',
    saasName: 'Datadog',
    category: 'Monitoring',
    icon: '📈',
    alternatives: [
      { name: 'Grafana', description: 'Leading open-source visualization and dashboard platform for metrics.', url: 'https://grafana.com', github: 'https://github.com/grafana/grafana', license: 'AGPL-3.0', difficulty: 'Medium', docker: true, dockerCommand: 'docker run -d -p 3000:3000 grafana/grafana', features: ['Dashboards', 'Alerting', 'Multiple data sources', 'Annotations', 'Plugins', 'LDAP/OAuth'], scenarioTags: ['small_team', 'enterprise', 'intermediate', 'docker_ready', 'monitoring', 'ldap', 'oauth', 'api_access', 'scalable'] },
      { name: 'Uptime Kuma', description: 'Beautiful uptime monitoring with status pages and multi-protocol checks.', url: 'https://github.com/louislam/uptime-kuma', github: 'https://github.com/louislam/uptime-kuma', license: 'MIT', difficulty: 'Easy', docker: true, dockerCommand: 'docker run -d -p 3001:3001 louislam/uptime-kuma', features: ['HTTP monitoring', 'TCP ping', 'DNS', 'Status page', 'Notifications', 'Multi-region'], scenarioTags: ['solo_dev', 'small_team', 'beginner_friendly', 'docker_ready', 'lightweight', 'monitoring', 'webhook', 'raspberry_pi'] },
      { name: 'Prometheus', description: 'Industry-standard metrics collection and alerting with powerful query language.', url: 'https://prometheus.io', github: 'https://github.com/prometheus/prometheus', license: 'Apache-2.0', difficulty: 'Medium', docker: true, dockerCommand: 'docker run -d -p 9090:9090 prom/prometheus', features: ['Metrics collection', 'PromQL', 'Alerting', 'Service discovery', 'Time-series DB'], scenarioTags: ['small_team', 'enterprise', 'intermediate', 'docker_ready', 'monitoring', 'api_access', 'scalable', 'webhook'] },
    ],
    title: 'Self-Hosted Datadog Alternative - Open Source Monitoring',
    h1: 'Self-Hosted Datadog Alternatives',
    description: 'Replace Datadog with self-hosted monitoring. Compare Grafana, Uptime Kuma, and Prometheus — no per-host pricing, unlimited metrics.',
    explanation: 'Datadog charges $15-$23/host/month and costs scale rapidly. Grafana + Prometheus is the industry-standard open-source stack used by companies like Uber and Stripe. Uptime Kuma is perfect for simple uptime monitoring with beautiful status pages.',
    faq: [
      { q: 'What is the Grafana + Prometheus stack?', a: 'Prometheus collects and stores metrics from your applications. Grafana visualizes those metrics in dashboards. Together they replace most Datadog functionality for free.' },
    ],
    keywords: ['self-hosted datadog', 'datadog alternative open source', 'grafana prometheus', 'uptime kuma', 'self-hosted Datadog alternative', 'best open source Datadog alternative', 'free Datadog replacement'],
  },

  // === Customer Support ===
  {
    slug: 'zendesk',
    saasName: 'Zendesk',
    category: 'Customer Support',
    icon: '🎧',
    alternatives: [
      { name: 'Chatwoot', description: 'Omnichannel customer engagement platform with live chat and inbox management.', url: 'https://www.chatwoot.com', github: 'https://github.com/chatwoot/chatwoot', license: 'MIT', difficulty: 'Medium', docker: true, dockerCommand: 'docker run -d -p 3000:3000 chatwoot/chatwoot', features: ['Live chat', 'Email inbox', 'Facebook/Twitter/WhatsApp', 'Canned responses', 'Teams', 'API'], scenarioTags: ['small_team', 'enterprise', 'intermediate', 'docker_ready', 'livechat', 'crm', 'api_access', 'webhook', 'scalable'] },
      { name: 'FreeScout', description: 'Lightweight helpdesk and shared inbox that feels like a normal email client.', url: 'https://freescout.net', github: 'https://github.com/freescout-helpdesk/freescout', license: 'AGPL-3.0', difficulty: 'Easy', docker: true, features: ['Shared inbox', 'Helpdesk', 'Knowledge base', 'SLA', 'Workflows', 'Mobile friendly'], scenarioTags: ['solo_dev', 'small_team', 'beginner_friendly', 'docker_ready', 'lightweight', 'livechat', 'api_access'] },
      { name: 'Zammad', description: 'Web-based helpdesk with ticket management and multi-channel support.', url: 'https://zammad.com', github: 'https://github.com/zammad/zammad', license: 'AGPL-3.0', difficulty: 'Medium', docker: true, features: ['Ticket system', 'Multi-channel', 'Knowledge base', 'SLA', 'Reports', 'LDAP'], scenarioTags: ['small_team', 'enterprise', 'intermediate', 'docker_ready', 'livechat', 'ldap', 'sso', 'api_access', 'scalable'] },
    ],
    title: 'Self-Hosted Zendesk Alternative - Open Source Helpdesk',
    h1: 'Self-Hosted Zendesk Alternatives',
    description: 'Replace Zendesk with self-hosted helpdesk software. Compare Chatwoot, FreeScout, and Zammad — no per-agent pricing.',
    explanation: 'Zendesk charges $19-$115/agent/month. Chatwoot offers omnichannel support (web chat, email, social media) for free. FreeScout is the simplest option that feels like a shared Gmail inbox.',
    faq: [
      { q: 'Can Chatwoot replace Zendesk completely?', a: 'For most small-to-medium teams, yes. Chatwoot covers live chat, email, social media, and WhatsApp. It may lack some enterprise features like advanced SLA management.' },
    ],
    keywords: ['self-hosted zendesk', 'zendesk alternative open source', 'chatwoot', 'freescout self-hosted', 'self-hosted Zendesk alternative', 'best open source Zendesk alternative', 'free Zendesk replacement'],
  },

  // === CMS ===
  {
    slug: 'wordpress-com',
    saasName: 'WordPress.com',
    category: 'CMS',
    icon: '🌐',
    alternatives: [
      { name: 'WordPress.org', description: 'The self-hosted WordPress you control. Same software, your server, your rules.', url: 'https://wordpress.org', github: 'https://github.com/WordPress/WordPress', license: 'GPL-2.0', difficulty: 'Easy', docker: true, dockerCommand: 'docker run -d -p 8080:80 wordpress', features: ['Full control', 'Any theme/plugin', 'Custom code', 'SEO tools', 'eCommerce', 'Multisite'], scenarioTags: ['solo_dev', 'small_team', 'beginner_friendly', 'docker_ready', 'collaboration', 'api_access', 'scalable'] },
      { name: 'Ghost', description: 'Modern publishing platform focused on speed and newsletters.', url: 'https://ghost.org', github: 'https://github.com/TryGhost/Ghost', license: 'MIT', difficulty: 'Easy', docker: true, dockerCommand: 'docker run -d -p 2368:2368 ghost', features: ['Blog/CMS', 'Newsletter', 'Membership', 'Stripe integration', 'Markdown', 'API'], scenarioTags: ['solo_dev', 'beginner_friendly', 'docker_ready', 'lightweight', 'newsletter', 'api_access', 'rest_api'] },
      { name: 'Strapi', description: 'Headless CMS with customizable API and admin panel.', url: 'https://strapi.io', github: 'https://github.com/strapi/strapi', license: 'MIT', difficulty: 'Medium', docker: true, dockerCommand: 'docker run -d -p 1337:1337 strapi/strapi', features: ['Headless CMS', 'REST/GraphQL API', 'Admin panel', 'Plugins', 'RBAC', 'Multi-database'], scenarioTags: ['small_team', 'intermediate', 'docker_ready', 'rbac', 'rest_api', 'graphql', 'api_access', 'scalable'] },
    ],
    title: 'Self-Hosted WordPress.com Alternative - Open Source CMS',
    h1: 'Self-Hosted CMS Alternatives to WordPress.com',
    description: 'Replace WordPress.com with self-hosted CMS. Compare WordPress.org, Ghost, and Strapi — no plan restrictions, full customization.',
    explanation: 'WordPress.com limits plugins/themes on free and lower plans and charges for custom domains. Self-hosted WordPress.org gives you every plugin, theme, and customization option for free. Ghost is a modern alternative focused on newsletters and memberships.',
    faq: [
      { q: 'What is the difference between WordPress.com and WordPress.org?', a: 'WordPress.com hosts your site on their servers with restrictions. WordPress.org is the self-hosted version you install on your own server with full control, all plugins, and all themes.' },
    ],
    keywords: ['self-hosted wordpress', 'wordpress alternative open source', 'ghost cms', 'strapi headless cms', 'self-hosted WordPress.com alternative', 'best open source WordPress.com alternative', 'free WordPress.com replacement'],
  },

  // === Design ===
  {
    slug: 'figma',
    saasName: 'Figma',
    category: 'Design',
    icon: '🎨',
    alternatives: [
      { name: 'Penpot', description: 'Open source design and prototyping platform with SVG-native workflow.', url: 'https://penpot.app', github: 'https://github.com/penpot/penpot', license: 'MPL-2.0', difficulty: 'Hard', docker: true, features: ['Vector design', 'Prototyping', 'Real-time collaboration', 'SVG-native', 'Design systems', 'Components'], scenarioTags: ['small_team', 'advanced_setup', 'docker_ready', 'collaboration', 'sharing', 'web_only'] },
      { name: 'Excalidraw', description: 'Virtual whiteboard for sketching hand-drawn diagrams and wireframes.', url: 'https://excalidraw.com', github: 'https://github.com/excalidraw/excalidraw', license: 'MIT', difficulty: 'Easy', docker: true, dockerCommand: 'docker run -d -p 8080:80 excalidraw/excalidraw', features: ['Whiteboard', 'Hand-drawn style', 'Collaboration', 'Export SVG/PNG', 'Libraries'], scenarioTags: ['solo_dev', 'small_team', 'beginner_friendly', 'docker_ready', 'lightweight', 'collaboration', 'sharing', 'web_only'] },
    ],
    title: 'Self-Hosted Figma Alternative - Open Source Design Tool',
    h1: 'Self-Hosted Figma Alternatives',
    description: 'Replace Figma with self-hosted design tools. Compare Penpot and Excalidraw — no editor limits, full design freedom.',
    explanation: 'Figma limits free plans to 3 files and charges $12-$75/editor/month. Penpot is the most feature-complete open source alternative with real-time collaboration, prototyping, and design systems. It uses SVG as its native format.',
    faq: [
      { q: 'Can Penpot replace Figma for professional work?', a: 'Penpot covers most design and prototyping needs. It may lack some advanced Figma features like auto-layout or certain plugins, but it is actively closing the gap.' },
    ],
    keywords: ['self-hosted figma', 'figma alternative open source', 'penpot', 'open source design tool', 'self-hosted Figma alternative', 'best open source Figma alternative', 'free Figma replacement'],
  },

  // === Task Management ===
  {
    slug: 'todoist',
    saasName: 'Todoist',
    category: 'Task Management',
    icon: '✅',
    alternatives: [
      { name: 'Vikunja', description: 'Open source task management with lists, kanban, Gantt charts, and teams.', url: 'https://vikunja.io', github: 'https://github.com/go-vikunja/vikunja', license: 'AGPL-3.0', difficulty: 'Easy', docker: true, dockerCommand: 'docker run -d -p 3456:3456 vikunja/vikunja', features: ['Tasks', 'Lists', 'Kanban', 'Gantt', 'Teams', 'CalDAV'], scenarioTags: ['solo_dev', 'small_team', 'beginner_friendly', 'docker_ready', 'lightweight', 'kanban', 'gantt', 'collaboration', 'api_access'] },
      { name: 'Plane', description: 'Modern project management with issues, cycles, and backlog management.', url: 'https://plane.so', github: 'https://github.com/makeplane/plane', license: 'AGPL-3.0', difficulty: 'Medium', docker: true, features: ['Tasks', 'Cycles', 'Kanban', 'Backlog', 'Modules', 'Gantt'], scenarioTags: ['small_team', 'intermediate', 'docker_ready', 'kanban', 'gantt', 'collaboration', 'api_access'] },
    ],
    title: 'Self-Hosted Todoist Alternative - Open Source Task Management',
    h1: 'Self-Hosted Todoist Alternatives',
    description: 'Replace Todoist with self-hosted task management. Compare Vikunja and Plane — no project limits, full feature access.',
    explanation: 'Todoist limits free plans to 5 projects and 5 people per project. Vikunja offers unlimited projects, kanban boards, and Gantt charts for free. It also supports CalDAV for syncing with other calendar apps.',
    faq: [
      { q: 'Can I sync Vikunja with my phone?', a: 'Yes. Vikunja supports CalDAV, so you can sync tasks with Apple Reminders, Google Tasks, or any CalDAV-compatible app.' },
    ],
    keywords: ['self-hosted todoist', 'todoist alternative open source', 'vikunja', 'open source task management', 'self-hosted Todoist alternative', 'best open source Todoist alternative', 'free Todoist replacement'],
  },

  // === Forms ===
  {
    slug: 'typeform',
    saasName: 'Typeform',
    category: 'Forms',
    icon: '📝',
    alternatives: [
      { name: 'Tally', description: 'Free form builder with unlimited forms and responses (SaaS but generous free tier).', url: 'https://tally.so', github: '', license: 'Proprietary (free)', difficulty: 'Easy', docker: false, features: ['Unlimited forms', 'File uploads', 'Payments', 'Logic jumps', 'Custom domain'], scenarioTags: ['solo_dev', 'beginner_friendly', 'forms', 'web_only'] },
      { name: 'OhMyForm', description: 'Open source form builder with analytics and submissions management.', url: 'https://ohmyform.com', github: 'https://github.com/ohmyform/ohmyform', license: 'MIT', difficulty: 'Medium', docker: true, features: ['Drag-and-drop builder', 'Analytics', 'Email notifications', 'Embeddable', 'API'], scenarioTags: ['solo_dev', 'small_team', 'intermediate', 'docker_ready', 'forms', 'api_access'] },
      { name: 'Docassemble', description: 'Free, open-source expert system and form builder for guided interviews.', url: 'https://docassemble.org', github: 'https://github.com/jhpyle/docassemble', license: 'MIT', difficulty: 'Hard', docker: true, features: ['Guided interviews', 'Document assembly', 'Logic', 'PDF generation', 'Multi-language'], scenarioTags: ['small_team', 'advanced_setup', 'docker_ready', 'forms', 'automation', 'api_access'] },
    ],
    title: 'Self-Hosted Typeform Alternative - Open Source Form Builder',
    h1: 'Self-Hosted Typeform Alternatives',
    description: 'Replace Typeform with self-hosted form builders. Compare Tally, OhMyForm, and Docassemble — no response limits.',
    explanation: 'Typeform charges $25-$83/month and limits responses on lower plans. OhMyForm offers unlimited forms and responses for free with a drag-and-drop builder.',
    faq: [
      { q: 'Is there a fully self-hosted Typeform alternative?', a: 'OhMyForm is the closest fully open-source alternative with a visual form builder, analytics, and API access. It can be self-hosted with Docker.' },
    ],
    keywords: ['self-hosted typeform', 'typeform alternative open source', 'open source form builder', 'self-hosted Typeform alternative', 'best open source Typeform alternative', 'free Typeform replacement'],
  },

  // === Email Marketing ===
  {
    slug: 'mailchimp',
    saasName: 'Mailchimp',
    category: 'Email Marketing',
    icon: 'chimp',
    alternatives: [
      { name: 'Listmonk', description: 'High-performance newsletter and mailing list manager with a modern dashboard.', url: 'https://listmonk.app', github: 'https://github.com/knadh/listmonk', license: 'AGPL-3.0', difficulty: 'Easy', docker: true, dockerCommand: 'docker run -d -p 9000:9000 listmonk/listmonk', features: ['Newsletters', 'Mailing lists', 'Templates', 'Analytics', 'Bounce handling', 'API'], scenarioTags: ['solo_dev', 'small_team', 'beginner_friendly', 'docker_ready', 'lightweight', 'newsletter', 'api_access', 'raspberry_pi'] },
      { name: 'Mautic', description: 'Enterprise-grade marketing automation with campaigns, forms, and landing pages.', url: 'https://www.mautic.org', github: 'https://github.com/mautic/mautic', license: 'GPL-3.0', difficulty: 'Medium', docker: true, features: ['Campaign automation', 'Lead scoring', 'Forms', 'Landing pages', 'Email builder', 'CRM integration'], scenarioTags: ['small_team', 'enterprise', 'intermediate', 'docker_ready', 'newsletter', 'automation', 'crm', 'forms', 'api_access', 'scalable'] },
    ],
    title: 'Self-Hosted Mailchimp Alternative - Open Source Email Marketing',
    h1: 'Self-Hosted Mailchimp Alternatives',
    description: 'Replace Mailchimp with self-hosted email marketing. Compare Listmonk and Mautic — no subscriber limits, no per-email pricing.',
    explanation: 'Mailchimp charges based on subscriber count and the cost grows quickly. Listmonk handles millions of subscribers on a single server with a modern interface. It sends through your own SMTP provider (Amazon SES, Postmark, etc.) at a fraction of the cost.',
    faq: [
      { q: 'How does Listmonk send emails?', a: 'Listmonk uses your own SMTP server or transactional email provider (Amazon SES, SendGrid, Mailgun, etc.). This gives you full control and much lower sending costs.' },
    ],
    keywords: ['self-hosted mailchimp', 'mailchimp alternative open source', 'listmonk', 'mautic self-hosted', 'self-hosted Mailchimp alternative', 'best open source Mailchimp alternative', 'free Mailchimp replacement'],
  },

  // === Password Manager (additional) ===
  {
    slug: 'bitwarden-cloud',
    saasName: 'Bitwarden (Cloud)',
    category: 'Password Management',
    icon: '🛡️',
    alternatives: [
      { name: 'Vaultwarden', description: 'Lightweight Bitwarden server in Rust — use official Bitwarden clients with your server.', url: 'https://github.com/dani-garcia/vaultwarden', github: 'https://github.com/dani-garcia/vaultwarden', license: 'AGPL-3.0', difficulty: 'Easy', docker: true, dockerCommand: 'docker run -d -p 8080:80 vaultwarden/server', features: ['Bitwarden compatible', 'All official clients', 'TOTP', 'Organizations', 'Emergency access', '~10MB RAM'], scenarioTags: ['solo_dev', 'small_team', 'beginner_friendly', 'docker_ready', 'lightweight', 'low_resource', 'sharing', 'mobile_app', 'desktop_app', 'raspberry_pi'] },
    ],
    title: 'Self-Hosted Bitwarden Server (Vaultwarden) - Lightweight Alternative',
    h1: 'Self-Hosted Bitwarden with Vaultwarden',
    description: 'Replace Bitwarden cloud with Vaultwarden — lightweight self-hosted Bitwarden server in Rust. Same clients, your server.',
    explanation: 'Bitwarden offers a free cloud service, but self-hosting with Vaultwarden gives you the same features on your own hardware. Vaultwarden uses ~10MB of RAM vs 2GB+ for the official Bitwarden self-hosted server, making it perfect for a VPS or home server.',
    faq: [
      { q: 'Vaultwarden vs official Bitwarden self-hosted?', a: 'Vaultwarden is a lightweight reimplementation in Rust that uses ~10MB RAM vs 2GB+ for the official server. It is compatible with all Bitwarden clients. Use the official server only if you need enterprise features like SSO or SCIM.' },
    ],
    keywords: ['vaultwarden', 'self-hosted bitwarden', 'bitwarden vaultwarden', 'lightweight bitwarden server', 'self-hosted Bitwarden (Cloud) alternative', 'best open source Bitwarden (Cloud) alternative', 'free Bitwarden (Cloud) replacement'],
  },

  // === Identity ===
  {
    slug: 'auth0',
    saasName: 'Auth0',
    category: 'Identity',
    icon: '🔑',
    alternatives: [
      { name: 'Logto', description: 'Modern auth platform with OIDC, SAML, and social login. Drop-in Auth0 alternative.', url: 'https://logto.io', github: 'https://github.com/logto-io/logto', license: 'MPL-2.0', difficulty: 'Medium', docker: true, dockerCommand: 'docker run -d -p 3001:3001 svhd/logto', features: ['OIDC/OAuth 2.0', 'SAML', 'Social login', 'MFA', 'Organizations', 'Admin UI'], scenarioTags: ['small_team', 'intermediate', 'docker_ready', 'sso', 'saml', 'oauth', 'mfa', 'api_access', 'scalable'] },
      { name: 'Keycloak', description: 'Enterprise identity and access management with SSO and user federation.', url: 'https://www.keycloak.org', github: 'https://github.com/keycloak/keycloak', license: 'Apache-2.0', difficulty: 'Medium', docker: true, dockerCommand: 'docker run -d -p 8080:8080 quay.io/keycloak/keycloak start-dev', features: ['SSO', 'OIDC/SAML', 'LDAP/AD', 'MFA', 'User federation', 'Identity brokering'], scenarioTags: ['enterprise', 'intermediate', 'docker_ready', 'sso', 'saml', 'ldap', 'mfa', 'oauth', 'rbac', 'api_access', 'scalable', 'audit_log'] },
    ],
    title: 'Self-Hosted Auth0 Alternative - Open Source Identity Management',
    h1: 'Self-Hosted Auth0 Alternatives',
    description: 'Replace Auth0 with self-hosted identity management. Compare Logto and Keycloak — no MAU pricing, unlimited users.',
    explanation: 'Auth0 charges $35-$240/month based on monthly active users. Keycloak is battle-tested at enterprises worldwide and handles SSO, LDAP, MFA, and social login for free. Logto is a more modern alternative with a better developer experience.',
    faq: [
      { q: 'Keycloak vs Logto — which should I choose?', a: 'Keycloak for enterprise use with LDAP/AD integration and complex identity brokering. Logto for modern apps with a better developer experience and lighter resource footprint.' },
    ],
    keywords: ['self-hosted auth0', 'auth0 alternative open source', 'keycloak', 'logto self-hosted', 'self-hosted Auth0 alternative', 'best open source Auth0 alternative', 'free Auth0 replacement'],
  },

  // === Search ===
  {
    slug: 'algolia',
    saasName: 'Algolia',
    category: 'Search',
    icon: '🔍',
    alternatives: [
      { name: 'Meilisearch', description: 'Lightning-fast search engine with typo tolerance and faceted filters.', url: 'https://www.meilisearch.com', github: 'https://github.com/meilisearch/meilisearch', license: 'MIT', difficulty: 'Easy', docker: true, dockerCommand: 'docker run -d -p 7700:7700 getmeili/meilisearch', features: ['Typo tolerance', 'Faceted search', 'Geo search', 'Synonyms', 'REST API', '< 50ms response'], scenarioTags: ['solo_dev', 'small_team', 'beginner_friendly', 'docker_ready', 'search', 'rest_api', 'scalable', 'api_access'] },
      { name: 'Typesense', description: 'Fast, typo-tolerant search engine optimized for instant search experiences.', url: 'https://typesense.org', github: 'https://github.com/typesense/typesense', license: 'GPL-3.0', difficulty: 'Easy', docker: true, dockerCommand: 'docker run -d -p 8108:8108 typesense/typesense', features: ['Typo tolerance', 'Instant search', 'Geo search', 'Vector search', 'REST API', 'C/C++ based'], scenarioTags: ['solo_dev', 'small_team', 'beginner_friendly', 'docker_ready', 'search', 'rest_api', 'scalable', 'api_access'] },
      { name: 'Sonic', description: 'Ultra-lightweight search index with fuzzy matching and auto-complete.', url: 'https://github.com/valeriansaliou/sonic', github: 'https://github.com/valeriansaliou/sonic', license: 'MPL-2.0', difficulty: 'Easy', docker: true, features: ['Fuzzy search', 'Auto-complete', 'Ultra-lightweight', 'Rust-based'], scenarioTags: ['solo_dev', 'beginner_friendly', 'docker_ready', 'lightweight', 'low_resource', 'search', 'raspberry_pi'] },
    ],
    title: 'Self-Hosted Algolia Alternative - Open Source Search Engine',
    h1: 'Self-Hosted Algolia Alternatives',
    description: 'Replace Algolia with self-hosted search. Compare Meilisearch, Typesense, and Sonic — no record limits, no per-request pricing.',
    explanation: 'Algolia charges per request and per record, with costs scaling quickly. Meilisearch provides sub-50ms search with typo tolerance and a simple REST API. It can handle millions of records on a single server.',
    faq: [
      { q: 'Meilisearch vs Typesense?', a: 'Both are excellent. Meilisearch has a more mature ecosystem and built-in dashboard. Typesense offers built-in vector search for semantic/AI-powered search and is written in C++ for maximum performance.' },
    ],
    keywords: ['self-hosted algolia', 'algolia alternative open source', 'meilisearch', 'typesense self-hosted', 'self-hosted Algolia alternative', 'best open source Algolia alternative', 'free Algolia replacement'],
  },

  // === Screenshot/Snippet ===
  {
    slug: 'loom',
    saasName: 'Loom',
    category: 'Screen Recording',
    icon: '🎥',
    alternatives: [
      { name: 'Peek', description: 'Simple screen recorder for Linux that exports GIF, WebM, and MP4.', url: 'https://github.com/phw/peek', github: 'https://github.com/phw/peek', license: 'GPL-3.0', difficulty: 'Easy', docker: false, features: ['Screen recording', 'GIF export', 'MP4/WebM', 'Simple UI'], scenarioTags: ['solo_dev', 'beginner_friendly', 'lightweight', 'sharing', 'desktop_app'] },
      { name: 'ShareX', description: 'Powerful screen capture and sharing tool for Windows (local only).', url: 'https://getsharex.com', github: 'https://github.com/ShareX/ShareX', license: 'GPL-3.0', difficulty: 'Easy', docker: false, features: ['Screen recording', 'Screenshots', 'GIF creation', 'OCR', 'Color picker', 'Custom uploaders'], scenarioTags: ['solo_dev', 'beginner_friendly', 'sharing', 'desktop_app', 'api_access'] },
    ],
    title: 'Self-Hosted Loom Alternative - Open Source Screen Recording',
    h1: 'Self-Hosted Loom Alternatives',
    description: 'Replace Loom with open source screen recording tools. Compare Peek and ShareX — no recording limits, no cloud dependency.',
    explanation: 'Loom stores recordings on their servers and charges for advanced features. Self-hosted alternatives let you record and share without uploading to third-party servers. Pair with a self-hosted file sharing tool for full Loom-like workflows.',
    faq: [
      { q: 'Can I get Loom-like async video messaging self-hosted?', a: 'Not as a single tool yet. Use Peek/ShareX for recording + Nextcloud/FileRun for sharing. This gives you full control over your recordings.' },
    ],
    keywords: ['self-hosted loom', 'loom alternative open source', 'open source screen recording', 'peek screen recorder', 'self-hosted Loom alternative', 'best open source Loom alternative', 'free Loom replacement'],
  },

  // === CI/CD ===
  {
    slug: 'circleci',
    saasName: 'CircleCI',
    category: 'CI/CD',
    icon: '🔄',
    alternatives: [
      { name: 'Gitea Actions', description: 'Built-in CI/CD for Gitea with GitHub Actions-compatible workflow syntax.', url: 'https://gitea.io', github: 'https://github.com/go-gitea/gitea', license: 'MIT', difficulty: 'Easy', docker: true, features: ['GitHub Actions syntax', 'Built into Gitea', 'Runner', 'Matrix builds', 'Artifacts'], scenarioTags: ['solo_dev', 'small_team', 'beginner_friendly', 'docker_ready', 'cicd', 'api_access', 'webhook'] },
      { name: 'Drone', description: 'Container-native CI/CD that runs pipelines inside Docker containers.', url: 'https://drone.io', github: 'https://github.com/harness/drone', license: 'Apache-2.0', difficulty: 'Medium', docker: true, dockerCommand: 'docker run -d -p 8080:80 drone/drone', features: ['Container-native', 'YAML config', 'Multi-pipeline', 'Secrets', 'Plugins', 'Registry support'], scenarioTags: ['small_team', 'intermediate', 'docker_ready', 'cicd', 'api_access', 'webhook', 'sso'] },
      { name: 'Woodpecker', description: 'Community fork of Drone CI with improved features and active development.', url: 'https://woodpecker-ci.org', github: 'https://github.com/woodpecker-ci/woodpecker', license: 'Apache-2.0', difficulty: 'Medium', docker: true, features: ['Container-native', 'YAML config', 'Fork PRs', 'Cron', 'Matrix builds', 'Multi-server'], scenarioTags: ['small_team', 'intermediate', 'docker_ready', 'cicd', 'api_access', 'webhook'] },
    ],
    title: 'Self-Hosted CircleCI Alternative - Open Source CI/CD',
    h1: 'Self-Hosted CircleCI Alternatives',
    description: 'Replace CircleCI with self-hosted CI/CD. Compare Gitea Actions, Drone, and Woodpecker — no credit limits, unlimited builds.',
    explanation: 'CircleCI charges per credit and costs scale with build frequency. Drone/Woodpecker run pipelines as Docker containers on your own infrastructure with no build limits. Gitea Actions provides GitHub Actions-compatible syntax if you use Gitea for code hosting.',
    faq: [
      { q: 'Are Drone and Woodpecker the same?', a: 'Woodpecker is a community fork of Drone after Drone moved to a different license. Woodpecker continues as open source with active development and improvements.' },
    ],
    keywords: ['self-hosted circleci', 'circleci alternative open source', 'drone ci', 'woodpecker ci', 'self-hosted CircleCI alternative', 'best open source CircleCI alternative', 'free CircleCI replacement'],
  },

  // === Photo Management ===
  {
    slug: 'google-photos',
    saasName: 'Google Photos',
    category: 'Photo Management',
    icon: '📷',
    alternatives: [
      { name: 'Immich', description: 'Self-hosted Google Photos clone with ML-powered face recognition and search.', url: 'https://immich.app', github: 'https://github.com/immich-app/immich', license: 'AGPL-3.0', difficulty: 'Medium', docker: true, features: ['Photo/video backup', 'Face recognition', 'Map view', 'Search', 'Sharing', 'Mobile app'], scenarioTags: ['solo_dev', 'small_team', 'intermediate', 'docker_ready', 'backup', 'sharing', 'search', 'mobile_app', 'scalable'] },
      { name: 'PhotoPrism', description: 'AI-powered photo management with automatic categorization and tagging.', url: 'https://photoprism.app', github: 'https://github.com/photoprism/photoprism', license: 'AGPL-3.0', difficulty: 'Easy', docker: true, dockerCommand: 'docker run -d -p 2342:2342 photoprism/photoprism', features: ['AI tagging', 'Face recognition', 'Map view', 'Search', 'Albums', 'WebDAV sync'], scenarioTags: ['solo_dev', 'beginner_friendly', 'docker_ready', 'backup', 'sharing', 'search', 'web_only', 'raspberry_pi'] },
      { name: 'Lychee', description: 'Simple, elegant photo management with albums and sharing.', url: 'https://lycheeorg.github.io', github: 'https://github.com/LycheeOrg/Lychee', license: 'MIT', difficulty: 'Easy', docker: true, dockerCommand: 'docker run -d -p 8080:80 lycheeorg/lychee', features: ['Albums', 'Smart albums', 'Sharing', 'Upload', 'EXIF data', 'Maps'], scenarioTags: ['solo_dev', 'beginner_friendly', 'docker_ready', 'lightweight', 'sharing', 'web_only'] },
      { name: 'Nextcloud Photos', description: 'Photo management built into Nextcloud — best if you already self-host Nextcloud.', url: 'https://github.com/nextcloud/photos', github: 'https://github.com/nextcloud/photos', license: 'AGPL-3.0', difficulty: 'Medium', docker: true, dockerCommand: 'docker run -d -p 8080:80 nextcloud', features: ['Albums', 'Timeline view', 'Face recognition', 'Sharing', 'Tags', 'Map view'], scenarioTags: ['solo_dev', 'small_team', 'intermediate', 'docker_ready', 'sharing', 'search', 'raspberry_pi', 'scalable'] },
    ],
    title: 'Google Photos Alternative Self Hosted - Best Open Source Options 2025',
    h1: 'Google Photos Alternative: Self Hosted Options Compared',
    description: 'Best self hosted Google Photos alternatives. Compare Immich, PhotoPrism, Lychee, and Nextcloud Photos — free, open source, no storage limits, full privacy control.',
    explanation: 'Google Photos ended free unlimited storage and scans photos for facial recognition. Self hosting your photo library gives you unlimited storage, full privacy, and no subscription fees. Immich is the most complete Google Photos clone with mobile apps, face recognition, and map view. PhotoPrism adds AI-powered tagging. Nextcloud Photos works if you already run Nextcloud.',
    faq: [
      { q: 'Immich vs PhotoPrism — which is better?', a: 'Immich is closer to Google Photos with mobile apps for automatic backup. PhotoPrism has better AI tagging and album organization. Many users run both.' },
      { q: 'Can I auto-backup photos from my phone?', a: 'Yes. Immich has official iOS and Android apps that automatically backup photos, just like Google Photos.' },
      { q: 'What is the best self hosted Google Photos alternative?', a: 'Immich is the most feature-complete self hosted Google Photos alternative with mobile apps, face recognition, map view, and sharing. PhotoPrism is easier to set up and has better AI tagging. Lychee is the lightest option for simple album management.' },
      { q: 'Can I run a self hosted photo gallery on Raspberry Pi?', a: 'Yes. PhotoPrism and Lychee both run well on Raspberry Pi 4+. Immich requires more resources but works on Pi 5 or any home server with 4GB+ RAM.' },
    ],
    keywords: ['google photos alternative self hosted', 'self hosted google photos', 'google photos alternative open source', 'immich', 'photoprism', 'self-hosted Google Photos alternative', 'best self hosted photo gallery', 'best open source Google Photos alternative', 'free Google Photos replacement', 'google photos self hosted docker'],
  },

  // === Automation ===
  {
    slug: 'zapier',
    saasName: 'Zapier',
    category: 'Automation',
    icon: '⚡',
    alternatives: [
      { name: 'n8n', description: 'Powerful workflow automation with a visual node-based editor.', url: 'https://n8n.io', github: 'https://github.com/n8n-io/n8n', license: 'Sustainable Use', difficulty: 'Easy', docker: true, dockerCommand: 'docker run -d -p 5678:5678 n8nio/n8n', features: ['Visual editor', '400+ integrations', 'Code nodes', 'Webhooks', 'Cron triggers', 'AI agents'], scenarioTags: ['solo_dev', 'small_team', 'beginner_friendly', 'docker_ready', 'automation', 'webhook', 'api_access', 'scalable'] },
      { name: 'Activepieces', description: 'Open source automation builder with a clean interface and growing integrations.', url: 'https://www.activepieces.com', github: 'https://github.com/activepieces/activepieces', license: 'MIT', difficulty: 'Easy', docker: true, dockerCommand: 'docker run -d -p 8080:80 activepieces/activepieces', features: ['Visual builder', 'Pieces (integrations)', 'Webhooks', 'Schedule', 'Flow control'], scenarioTags: ['solo_dev', 'small_team', 'beginner_friendly', 'docker_ready', 'automation', 'webhook', 'api_access'] },
      { name: 'Huginn', description: 'Agent-based automation system for monitoring and data processing.', url: 'https://github.com/huginn/huginn', github: 'https://github.com/huginn/huginn', license: 'MIT', difficulty: 'Medium', docker: true, features: ['Agents', 'Data processing', 'Website monitoring', 'Twitter tracking', 'Email'], scenarioTags: ['solo_dev', 'intermediate', 'docker_ready', 'automation', 'monitoring', 'webhook', 'api_access'] },
    ],
    title: 'Self-Hosted Zapier Alternative - Open Source Workflow Automation',
    h1: 'Self-Hosted Zapier Alternatives',
    description: 'Replace Zapier with self-hosted automation. Compare n8n, Activepieces, and Huginn — no task limits, unlimited workflows.',
    explanation: 'Zapier charges $19.99-$69/month and limits tasks. n8n offers unlimited workflows and tasks on your own server with 400+ integrations. The visual editor makes building automations as easy as connecting nodes.',
    faq: [
      { q: 'Is n8n really unlimited?', a: 'Yes. Self-hosted n8n has no execution limits, no workflow limits, and no task counting. You are limited only by your server resources.' },
    ],
    keywords: ['self-hosted zapier', 'zapier alternative open source', 'n8n self-hosted', 'open source automation', 'self-hosted Zapier alternative', 'best open source Zapier alternative', 'free Zapier replacement'],
  },

  // === Pastebin ===
  {
    slug: 'pastebin',
    saasName: 'Pastebin',
    category: 'Code Sharing',
    icon: '📋',
    alternatives: [
      { name: 'PrivateBin', description: 'Zero-knowledge pastebin with client-side encryption and expiration.', url: 'https://privatebin.info', github: 'https://github.com/PrivateBin/PrivateBin', license: 'Zlib', difficulty: 'Easy', docker: true, dockerCommand: 'docker run -d -p 8080:8080 privatebin/nginx-fpm-alpine', features: ['Client-side encryption', 'Password protection', 'Expiration', 'Burn after read', 'File upload'], scenarioTags: ['solo_dev', 'beginner_friendly', 'docker_ready', 'lightweight', 'zero_knowledge', 'sharing', 'raspberry_pi'] },
      { name: 'Haste', description: 'Simple, fast pastebin with a clean interface.', url: 'https://github.com/skyra-project/haste-server', github: 'https://github.com/skyra-project/haste-server', license: 'MIT', difficulty: 'Easy', docker: true, features: ['Syntax highlighting', 'CLI tool', 'Keyboard shortcuts', 'Expiration'], scenarioTags: ['solo_dev', 'beginner_friendly', 'docker_ready', 'lightweight', 'sharing', 'cli'] },
    ],
    title: 'Self-Hosted Pastebin Alternative - Open Source Code Sharing',
    h1: 'Self-Hosted Pastebin Alternatives',
    description: 'Replace Pastebin with self-hosted code sharing. Compare PrivateBin and Haste — encrypted, expirable, no ads.',
    explanation: 'Pastebin shows ads, has reading limits for guests, and your pastes are indexed by search engines. PrivateBin encrypts everything client-side so even the server cannot read your pastes. Supports burn-after-read and expiration.',
    faq: [
      { q: 'Is PrivateBin secure?', a: 'Yes. PrivateBin encrypts and decrypts data in the browser using AES-256. The server never sees the unencrypted content. Even if the server is compromised, your pastes remain encrypted.' },
    ],
    keywords: ['self-hosted pastebin', 'pastebin alternative open source', 'privatebin', 'encrypted pastebin', 'self-hosted Pastebin alternative', 'best open source Pastebin alternative', 'free Pastebin replacement'],
  },

  // === URL Shortener ===
  {
    slug: 'bitly',
    saasName: 'Bitly',
    category: 'URL Shortener',
    icon: '🔗',
    alternatives: [
      { name: 'Shlink', description: 'Professional URL shortener with analytics, tags, and multi-domain support.', url: 'https://shlink.io', github: 'https://github.com/shlinkio/shlink', license: 'MIT', difficulty: 'Easy', docker: true, dockerCommand: 'docker run -d -p 8080:8080 shlinkio/shlink', features: ['Short URLs', 'Analytics', 'Tags', 'Custom domains', 'QR codes', 'REST API'], scenarioTags: ['solo_dev', 'small_team', 'beginner_friendly', 'docker_ready', 'lightweight', 'rest_api', 'api_access', 'cli'] },
      { name: 'YOURLS', description: 'Classic URL shortener with a rich plugin ecosystem.', url: 'https://yourls.org', github: 'https://github.com/YOURLS/YOURLS', license: 'MIT', difficulty: 'Easy', docker: true, dockerCommand: 'docker run -d -p 8080:80 yourls', features: ['Short URLs', 'Stats', 'Plugins', 'Bookmarklets', 'API', 'Custom keywords'], scenarioTags: ['solo_dev', 'beginner_friendly', 'docker_ready', 'lightweight', 'api_access'] },
    ],
    title: 'Self-Hosted Bitly Alternative - Open Source URL Shortener',
    h1: 'Self-Hosted Bitly Alternatives',
    description: 'Replace Bitly with self-hosted URL shortening. Compare Shlink and YOURLS — no link limits, full analytics.',
    explanation: 'Bitly charges $8/month for just 50 links/month on the paid plan. Shlink and YOURLS offer unlimited links, full analytics, and custom domains for free.',
    faq: [
      { q: 'Which URL shortener is better — Shlink or YOURLS?', a: 'Shlink is more modern with better analytics and API design. YOURLS is battle-tested with more plugins. Choose Shlink for new projects, YOURLS if you need specific plugins.' },
    ],
    keywords: ['self-hosted bitly', 'bitly alternative open source', 'shlink', 'yourls', 'self-hosted url shortener', 'self-hosted Bitly alternative', 'best open source Bitly alternative', 'free Bitly replacement'],
  },
  // === Trending Self-Hosted Tools ===
  {
    slug: 'navidrome',
    saasName: 'Cloud Music Services',
    category: 'Music Streaming',
    icon: '🎶',
    alternatives: [
      { name: 'Navidrome', description: 'Modern self-hosted music server and streamer. Spotify-like web UI, smart playlists, Last.fm scrobbling, and Subsonic API for mobile apps.', url: 'https://www.navidrome.org', github: 'https://github.com/navidrome/navidrome', license: 'GPL-3.0', difficulty: 'Easy', docker: true, dockerCommand: 'docker run -d -p 4533:4533 -v ~/music:/music -v ~/data:/data deluan/navidrome', features: ['Music streaming', 'Smart playlists', 'Last.fm integration', 'Transcoding', 'Subsonic API', 'Multi-user', 'Low resource (~20MB RAM)'], scenarioTags: ['solo_dev', 'beginner_friendly', 'docker_ready', 'lightweight', 'low_resource', 'streaming', 'mobile_app', 'raspberry_pi'] },
      { name: 'Koel', description: 'Personal music streaming server with a clean Vue.js interface and simple setup.', url: 'https://koel.dev', github: 'https://github.com/koel/koel', license: 'MIT', difficulty: 'Easy', docker: true, dockerCommand: 'docker run -d -p 8000:80 koel/koel', features: ['Music streaming', 'Clean UI', 'Playlist management', 'Last.fm integration', 'Media keys support'], scenarioTags: ['solo_dev', 'beginner_friendly', 'docker_ready', 'lightweight', 'streaming', 'web_only'] },
      { name: 'Gonic', description: 'Lightweight Subsonic-compatible music server written in Go. Minimal resource usage.', url: 'https://github.com/sentriz/gonic', github: 'https://github.com/sentriz/gonic', license: 'GPL-3.0', difficulty: 'Easy', docker: true, features: ['Subsonic API', 'Podcast support', 'Low memory', 'Scrobbling', 'Transcoding'], scenarioTags: ['solo_dev', 'beginner_friendly', 'docker_ready', 'lightweight', 'low_resource', 'streaming', 'raspberry_pi'] },
      { name: 'Funkwhale', description: 'Social music platform with federation support, podcasts, and community features.', url: 'https://funkwhale.audio', github: 'https://dev.funkwhale.audio/funkwhale/funkwhale', license: 'AGPL-3.0', difficulty: 'Medium', docker: true, features: ['Music streaming', 'Federation', 'Podcasts', 'Channels', 'Library sharing', 'ActivityPub'], scenarioTags: ['solo_dev', 'small_team', 'intermediate', 'docker_ready', 'streaming', 'sharing', 'federation'] },
    ],
    title: 'Navidrome Self-Hosted Music Server - Setup Guide & Comparison',
    h1: 'Self-Hosted Music Server: Navidrome & Alternatives',
    description: 'Set up Navidrome self-hosted music server. Compare with Koel, Gonic, and Funkwhale. Stream your music library with Spotify-like features.',
    explanation: 'Navidrome is the most popular self-hosted music server with 12K+ GitHub stars. It streams your personal music collection with a modern web UI, smart playlists, artist biographies, and mobile apps via the Subsonic API. It uses only ~20MB of RAM, making it perfect for a Raspberry Pi or small VPS.',
    faq: [
      { q: 'How do I set up Navidrome?', a: 'The easiest way is Docker: create a docker-compose.yml with the Navidrome image, point it to your music folder, and run docker compose up -d. Your music server will be available at localhost:4533.' },
      { q: 'Can I use Navidrome on my phone?', a: 'Yes. Navidrome is compatible with any Subsonic API client. Popular options include Ultrasonic and DSub on Android, and play:Sub on iOS.' },
      { q: 'Navidrome vs Jellyfin for music?', a: 'Navidrome is music-only and uses ~20MB RAM. Jellyfin is a full media server (movies, TV, music) using 1GB+ RAM. Choose Navidrome if you only need music.' },
    ],
    keywords: ['navidrome', 'self-hosted music server', 'navidrome docker', 'navidrome setup', 'self-hosted spotify', 'music streaming server', 'subsonic server', 'navidrome vs jellyfin'],
  },
  {
    slug: 'syncthing',
    saasName: 'Cloud File Sync',
    category: 'File Sync',
    icon: '🔄',
    alternatives: [
      { name: 'Syncthing', description: 'Open source peer-to-peer continuous file synchronization. No central server, end-to-end encryption, cross-platform.', url: 'https://syncthing.net', github: 'https://github.com/syncthing/syncthing', license: 'MPL-2.0', difficulty: 'Easy', docker: true, dockerCommand: 'docker run -d -p 8384:8384 syncthing/syncthing', features: ['P2P sync', 'No central server', 'End-to-end encryption', 'Cross-platform', 'Conflict resolution', 'Versioning', 'Selective sync'], scenarioTags: ['solo_dev', 'small_team', 'beginner_friendly', 'docker_ready', 'lightweight', 'file_sync', 'e2e_encryption', 'mobile_app', 'desktop_app', 'raspberry_pi'] },
      { name: 'Resilio Sync', description: 'Fast peer-to-peer file sync based on BitTorrent protocol. Free for personal use.', url: 'https://www.resilio.com', github: '', license: 'Proprietary (free)', difficulty: 'Easy', docker: true, features: ['P2P sync', 'Large file optimization', 'Selective sync', 'Mobile apps', 'One-time share links'], scenarioTags: ['solo_dev', 'beginner_friendly', 'docker_ready', 'file_sync', 'mobile_app', 'desktop_app'] },
      { name: 'Git Annex', description: 'Manage large files with Git without tracking their contents. Decentralized and scriptable.', url: 'https://git-annex.branchable.com', github: 'https://git-annex.branchable.com', license: 'AGPL-3.0', difficulty: 'Hard', docker: false, features: ['Git-based', 'Large file management', 'Encryption', ' deduplication', 'Multi-backend'], scenarioTags: ['solo_dev', 'advanced_setup', 'file_sync', 'cli', 'backup'] },
    ],
    title: 'Syncthing Self-Hosted File Sync - Setup Guide & Comparison',
    h1: 'Self-Hosted File Sync: Syncthing & Alternatives',
    description: 'Set up Syncthing for self-hosted peer-to-peer file sync. Compare with Resilio Sync and Git Annex. No cloud, no subscription.',
    explanation: 'Syncthing replaces Dropbox, Google Drive, and OneDrive with direct device-to-device synchronization. Your files never touch a third-party server — they travel encrypted between your own devices. With 68K+ GitHub stars, it is the most trusted open source file sync tool. It runs on Windows, macOS, Linux, Android, and even NAS devices.',
    faq: [
      { q: 'Is Syncthing safe?', a: 'Yes. All data is encrypted in transit with TLS. Syncthing uses certificate-based authentication so only your approved devices can connect. No data passes through any central server.' },
      { q: 'Syncthing vs Nextcloud?', a: 'Syncthing syncs files directly between devices with no server. Nextcloud is a full cloud platform with web access, sharing links, and apps. Use Syncthing for simple device sync, Nextcloud for cloud-like features.' },
      { q: 'Can I sync to my phone?', a: 'Yes. Syncthing has an official Android app. For iOS, use the third-party app Möbius Sync which is compatible with Syncthing.' },
    ],
    keywords: ['syncthing', 'self-hosted file sync', 'syncthing docker', 'syncthing setup', 'peer to peer file sync', 'syncthing vs nextcloud', 'dropbox alternative self-hosted', 'syncthing guide'],
  },
  {
    slug: 'vaultwarden',
    saasName: 'Cloud Password Managers',
    category: 'Password Management',
    icon: '🛡️',
    alternatives: [
      { name: 'Vaultwarden', description: 'Lightweight Bitwarden-compatible password server in Rust. Same Bitwarden clients, ~10MB RAM, full feature parity.', url: 'https://github.com/dani-garcia/vaultwarden', github: 'https://github.com/dani-garcia/vaultwarden', license: 'AGPL-3.0', difficulty: 'Easy', docker: true, dockerCommand: 'docker run -d -p 8080:80 vaultwarden/server', features: ['Bitwarden compatible', 'Browser extensions', 'Mobile apps', 'TOTP', 'Organizations', 'Emergency access', 'Web Vault', '~10MB RAM'], scenarioTags: ['solo_dev', 'small_team', 'beginner_friendly', 'docker_ready', 'lightweight', 'low_resource', 'sharing', 'mobile_app', 'desktop_app', 'raspberry_pi'] },
      { name: 'Padloc', description: 'Modern password manager with end-to-end encryption and a clean, minimal UI.', url: 'https://padloc.app', github: 'https://github.com/padloc/padloc', license: 'GPL-3.0', difficulty: 'Medium', docker: true, features: ['End-to-end encryption', 'Clean UI', 'Teams', 'Biometric unlock', 'Attachments'], scenarioTags: ['solo_dev', 'small_team', 'intermediate', 'docker_ready', 'e2e_encryption', 'sharing', 'mobile_app', 'desktop_app'] },
      { name: 'Psono', description: 'Team password manager with enterprise features, API access, and auditing.', url: 'https://psono.com', github: 'https://github.com/psono/psono-server', license: 'Apache-2.0', difficulty: 'Medium', docker: true, features: ['Team sharing', 'API', 'Auditing', 'MFA', 'LDAP/AD', 'Emergency codes'], scenarioTags: ['small_team', 'enterprise', 'intermediate', 'docker_ready', 'ldap', 'mfa', 'api_access', 'sharing', 'audit_log'] },
    ],
    title: 'Best Self-Hosted Vaultwarden Alternatives (2026) — Password Manager Comparison & Docker Setup',
    h1: 'Self-Hosted Password Manager Alternatives — Vaultwarden, Padloc & Psono',
    description: 'Compare 3 free self-hosted password managers: Vaultwarden (Bitwarden-compatible, ~10MB RAM), Padloc (E2E encryption), Psono (team features). Docker setup, security hardening guide. Updated 2026.',
    explanation: 'Vaultwarden is a lightweight reimplementation of the Bitwarden server in Rust with 43K+ GitHub stars. It works with all official Bitwarden browser extensions, mobile apps, and CLI tools, but uses only ~10MB of RAM instead of the 2GB+ required by the official Bitwarden self-hosted server. This makes it perfect for a Raspberry Pi, home server, or $3/month VPS. Search interest grew 83% year-over-year in 2026 as Bitwarden subscription prices increased and users seek free self-hosted alternatives.',
    faq: [
      { q: 'Is Vaultwarden compatible with Bitwarden apps?', a: 'Yes. Vaultwarden is fully compatible with all official Bitwarden clients: browser extensions (Chrome, Firefox, Safari, Edge), mobile apps (iOS, Android), desktop apps, and the CLI tool. You keep using the same Bitwarden apps — just point them to your self-hosted server.' },
      { q: 'Vaultwarden vs official Bitwarden self-hosted?', a: 'Vaultwarden uses ~10MB RAM vs 2GB+ for the official server. It covers all personal and small team features. Use the official server only for enterprise features like SSO, SCIM, or organizational policies.' },
      { q: 'How do I secure Vaultwarden?', a: 'Always run Vaultwarden behind HTTPS (use a reverse proxy like Caddy or Nginx with Let\'s Encrypt). Enable admin panel with a secure token. Keep the Docker image updated.' },
      { q: 'Can I run Vaultwarden on a Raspberry Pi?', a: 'Yes. Vaultwarden runs great on Raspberry Pi 3+ with just 50MB RAM. Use the Docker image: docker run -d -p 8080:80 vaultwarden/server. Pair with Caddy for automatic HTTPS.' },
      { q: 'Vaultwarden vs Padloc vs Psono — which is best?', a: 'Vaultwarden is best for individuals and small teams who already use Bitwarden apps. Padloc offers the cleanest modern UI with end-to-end encryption. Psono is best for teams needing LDAP/AD integration, API access, and audit logging.' },
    ],
    keywords: ['vaultwarden', 'self-hosted password manager', 'vaultwarden docker', 'vaultwarden setup', 'bitwarden self-hosted', 'vaultwarden vs bitwarden', 'lightweight password manager', 'vaultwarden guide', 'vaultwarden alternatives 2026', 'self-hosted bitwarden alternative', 'free password manager self-hosted', 'vaultwarden raspberry pi', 'best self-hosted password manager'],
  },
  // === Knowledge Management ===
  {
    slug: 'docmost',
    saasName: 'Docmost',
    category: 'Knowledge Management',
    icon: '📄',
    alternatives: [
      { name: 'BookStack', description: 'Simple, self-hosted wiki with a book/chapter/page hierarchy. WYSIWYG editor, LDAP/SAML auth, MIT license, 10+ years of development. Runs on 256MB RAM — lightest option.', url: 'https://www.bookstackapp.com', github: 'https://github.com/BookStackApp/BookStack', license: 'MIT', difficulty: 'Easy', docker: true, dockerCommand: 'docker run -d -p 8080:80 solidnerd/bookstack', features: ['Book hierarchy', 'WYSIWYG editor', 'Markdown', 'LDAP/SAML', 'API', 'Multi-language', 'Permission system'], scenarioTags: ['solo_dev', 'small_team', 'beginner_friendly', 'docker_ready', 'wiki', 'collaboration', 'ldap', 'saml', 'api_access', 'rbac'] },
      { name: 'Wiki.js', description: 'Modern wiki with multiple editors (WYSIWYG, Markdown, HTML), Git-backed storage, and enterprise auth (LDAP, OAuth, SAML). Needs 1GB+ RAM with PostgreSQL.', url: 'https://js.wiki', github: 'https://github.com/requarks/wiki', license: 'AGPL-3.0', difficulty: 'Medium', docker: true, dockerCommand: 'docker run -d -p 3000:3000 requarks/wiki', features: ['Multiple editors', 'Git sync', 'LDAP/OAuth', 'Full-text search', 'Comments', 'Localization'], scenarioTags: ['small_team', 'enterprise', 'intermediate', 'docker_ready', 'wiki', 'collaboration', 'search', 'ldap', 'oauth', 'api_access', 'scalable'] },
      { name: 'Outline', description: 'Fast, polished knowledge base with real-time collaboration, Slack integration, and a clean Notion-like interface. Requires PostgreSQL + Redis (~1GB RAM total).', url: 'https://getoutline.com', github: 'https://github.com/outline/outline', license: 'BSL-1.1', difficulty: 'Medium', docker: true, dockerCommand: 'docker run -d -p 3000:3000 outlinewiki/outline', features: ['Real-time collaboration', 'Markdown', 'Slack integration', 'Collections', 'Full-text search', 'API', 'SSO/OIDC'], scenarioTags: ['small_team', 'intermediate', 'docker_ready', 'wiki', 'collaboration', 'search', 'sso', 'api_access'] },
      { name: 'XWiki', description: 'Enterprise-grade wiki with structured data forms, scripting API, and 20+ years of active development. Used by NASA and SAP. Needs 2GB+ RAM with MySQL.', url: 'https://xwiki.org', github: 'https://github.com/xwiki/xwiki-platform', license: 'LGPL-2.1', difficulty: 'Hard', docker: true, dockerCommand: 'docker run -d -p 8080:8080 xwiki:lts-mysql-tomcat', features: ['Structured data', 'Scripting API', 'Extensions', 'LDAP/SAML', 'WYSIWYG', 'Versioning', 'REST API'], scenarioTags: ['enterprise', 'advanced_setup', 'docker_ready', 'wiki', 'collaboration', 'ldap', 'sso', 'api_access', 'scalable', 'audit_log'] },
      { name: 'Affine', description: 'Open-source Notion+Miro hybrid with block-based docs, whiteboards, and local-first architecture. Works offline, syncs when ready. Self-hosted needs 2GB RAM.', url: 'https://affine.pro', github: 'https://github.com/toeverything/Affine', license: 'MIT', difficulty: 'Medium', docker: true, dockerCommand: 'docker run -d -p 3010:3010 ghcr.io/toeverything/affine-self-hosted:stable', features: ['Block editor', 'Whiteboard', 'Local-first', 'Markdown', 'Real-time collaboration', 'Edgeless mode', 'Self-hosted sync'], scenarioTags: ['solo_dev', 'small_team', 'intermediate', 'docker_ready', 'wiki', 'collaboration', 'desktop_app', 'mobile_app'] },
    ],
    title: 'Docmost Alternatives (2026): BookStack vs Wiki.js vs Outline Comparison',
    h1: 'Docmost Alternatives — Interactive Comparison with Docker & RAM Specs',
    description: 'Compare Docmost alternatives side-by-side: BookStack (256MB RAM), Wiki.js (Git sync), Outline (Slack), XWiki (enterprise), Affine (whiteboard). Docker one-liners, license comparison, and quick decision guide.',
    explanation: 'Docmost is a rising open source wiki with a Notion-like block editor (3K+ GitHub stars, launched 2024). It offers real-time collaboration and a modern interface, but it\'s still a young project with fewer integrations and a smaller plugin ecosystem. Our interactive comparison below shows exactly how each alternative stacks up on RAM usage, Docker setup difficulty, license terms, and team features. BookStack (15K+ GitHub stars, MIT license, 256MB RAM) is the lightest option and easiest to deploy with a single Docker command. Wiki.js adds Git-backed storage and enterprise auth at 1GB RAM. Outline provides the most polished Notion-like experience with Slack integration. XWiki brings enterprise structured data and scripting (20+ years, used by NASA and SAP). Affine combines docs with Miro-style whiteboards in a local-first architecture. Last updated: June 2026.',
    faq: [
      { q: 'What is the best Docmost alternative?', a: 'BookStack is the best Docmost alternative for most users — simpler book/chapter/page structure, MIT license (vs AGPL-3.0), 10+ years of development, and single Docker command deployment. Choose Wiki.js if you need Git-backed storage and enterprise auth. Choose Outline for the most polished Notion-like editing experience. Choose XWiki for enterprise structured data and scripting.' },
      { q: 'Docmost vs BookStack — which should I choose?', a: 'Docmost has a modern block editor like Notion with real-time collaboration. BookStack uses a simpler book/chapter/page hierarchy with a WYSIWYG editor. BookStack advantages: MIT license (Docmost is AGPL-3.0), LDAP/SAML built-in, larger community (15K+ GitHub stars vs 3K+), and 10+ years of maturity. Choose Docmost for Notion-style editing; choose BookStack for simplicity and long-term stability.' },
      { q: 'Can I migrate from Docmost to BookStack or Wiki.js?', a: 'Docmost does not yet have a one-click export tool. You can export pages as Markdown and import them into BookStack or Wiki.js (both support Markdown import). For larger wikis, the process is manual but straightforward — copy sections page by page.' },
      { q: 'Is Docmost free for commercial use?', a: 'Yes, Docmost is free and open source under AGPL-3.0. However, AGPL requires you to release modifications if you offer Docmost as a hosted service. BookStack uses MIT (no such requirement). Wiki.js uses AGPL-3.0 like Docmost. Outline uses BSL-1.1 (free for non-production use).' },
      { q: 'Is Docmost production-ready?', a: 'Docmost launched in 2024 and is actively developed with regular releases. It handles basic wiki needs well — pages, spaces, permissions, and real-time editing. However, it has fewer integrations than mature alternatives like BookStack (10+ years) or XWiki (20+ years). For production use, test your specific workflow first. BookStack and Wiki.js are safer choices for mission-critical documentation.' },
      { q: 'Docmost vs Outline — which is better for team wikis?', a: 'Both offer Notion-like editing with real-time collaboration. Docmost is fully open source (AGPL-3.0) and self-hosted by default. Outline (BSL-1.1) requires PostgreSQL + Redis and has a hosted cloud option. Outline has deeper Slack integration and more polished UX; Docmost is simpler to deploy and fully free for commercial use. Choose Outline if your team lives in Slack; choose Docmost for a standalone self-hosted wiki.' },
      { q: 'Docmost vs Affine — which should I pick?', a: 'Docmost is a dedicated wiki with pages, spaces, and permissions. Affine is a docs + whiteboard hybrid (Notion meets Miro). Pick Docmost if you need a traditional wiki structure with access control. Pick Affine if your team needs visual brainstorming (whiteboards, edgeless canvas) alongside text docs. Affine also has stronger offline support via local-first architecture.' },
      { q: 'Which Docmost alternative is easiest to self-host?', a: 'BookStack is the easiest — one Docker command and you\'re running. It needs minimal resources (256MB RAM, works on a $5/month VPS). Wiki.js and Outline require PostgreSQL. XWiki needs MySQL + Java (2GB+ RAM). Affine needs 2GB+ RAM for its self-hosted sync server.' },
      { q: 'Docmost vs Confluence — which open source wiki is better?', a: 'Docmost is a lightweight, self-hosted Confluence alternative with Notion-style block editing. Confluence (Atlassian) is cloud-only, costs $6-15/user/month, and locks data into Atlassian ecosystem. If you want to replace Confluence with a free, self-hosted option: BookStack is simplest, Wiki.js has the best auth integration, XWiki matches Confluence\'s structured data features. Docmost\'s advantage is its modern UI — closest to what your team already knows from Notion.' },
      { q: 'How much RAM do Docmost alternatives need?', a: 'BookStack: 256MB (lightest). Docmost: ~512MB. Wiki.js: 1GB+ (needs PostgreSQL). Outline: 1GB+ (needs PostgreSQL + Redis). XWiki: 2GB+ (needs MySQL + Java). Affine: 2GB+ (self-hosted sync server). If you\'re running on a $5/month VPS (1GB RAM), BookStack or Docmost are your best options.' },
    ],
    keywords: ['docmost alternative', 'docmost alternatives', 'docmost self hosted', 'docmost vs bookstack', 'docmost vs outline', 'docmost vs affine', 'docmost vs wiki.js', 'docmost vs xwiki', 'best self hosted wiki 2026', 'docmost open source alternative', 'self hosted documentation tool', 'best docmost replacement', 'docmost competitors', 'self hosted wiki comparison', 'docmost production ready', 'docmost migration', 'docmost docker alternative', 'free self hosted wiki', 'docmost license agpl', 'docmost vs confluence', 'docmost ram requirements'],
    quickDecision: [
      { choose: 'BookStack', reason: 'Simplicity and stability. MIT license, 10+ years mature, single Docker command, works on a $5/month VPS.' },
      { choose: 'Wiki.js', reason: 'Git-backed storage and enterprise auth (LDAP, OAuth, SAML). Best when your docs need version control integration.' },
      { choose: 'Outline', reason: 'Notion-like editing experience. Real-time collaboration with Slack integration. Best for teams already using Slack.' },
      { choose: 'XWiki', reason: 'Enterprise structured data and scripting. 20+ years proven at NASA/SAP. Best for complex workflows with custom forms.' },
      { choose: 'Affine', reason: 'Visual thinking + docs in one tool. Notion meets Miro with local-first offline support. Best if you need whiteboards alongside text.' },
    ],
  },
  {
    slug: 'obsidian',
    saasName: 'Obsidian',
    category: 'Knowledge Management',
    icon: '🔮',
    alternatives: [
      { name: 'Trilium Notes', description: 'Hierarchical note-taking with relation maps, scripting, and tree structure. Runs as a web app or desktop app.', url: 'https://github.com/zadam/trilium', github: 'https://github.com/zadam/trilium', license: 'AGPL-3.0', difficulty: 'Easy', docker: true, dockerCommand: 'docker run -d -p 8080:8080 zadam/trilium', features: ['Tree structure', 'Relation maps', 'Scripting', 'Book notes', 'Canvas', 'Image compression'], scenarioTags: ['solo_dev', 'beginner_friendly', 'docker_ready', 'lightweight', 'wiki', 'desktop_app', 'web_only', 'raspberry_pi'] },
      { name: 'Logseq', description: 'Privacy-first outliner and knowledge graph. Local-first Markdown/Org-mode files, bi-directional linking.', url: 'https://logseq.com', github: 'https://github.com/logseq/logseq', license: 'AGPL-3.0', difficulty: 'Easy', docker: false, features: ['Outliner', 'Graph view', 'Bi-directional links', 'Markdown/Org-mode', 'Local-first', 'Flashcards', 'PDF annotations'], scenarioTags: ['solo_dev', 'beginner_friendly', 'lightweight', 'wiki', 'desktop_app'] },
      { name: 'Joplin', description: 'Full-featured note-taking with Markdown, web clipper, and end-to-end encryption. Syncs via WebDAV/S3/Dropbox.', url: 'https://joplinapp.org', github: 'https://github.com/laurent22/joplin', license: 'MIT', difficulty: 'Easy', docker: true, features: ['Markdown', 'Web clipper', 'E2E encryption', 'Tags', 'Notebooks', 'Multi-device sync', 'Plugins'], scenarioTags: ['solo_dev', 'beginner_friendly', 'docker_ready', 'lightweight', 'e2e_encryption', 'mobile_app', 'desktop_app', 'api_access'] },
    ],
    title: 'Self-Hosted Obsidian Alternative - Open Source Knowledge Management',
    h1: 'Self-Hosted Obsidian Alternatives',
    description: 'Compare Trilium Notes, Logseq, and Joplin as self-hosted alternatives to Obsidian. Local-first knowledge management with graph views and Markdown.',
    explanation: 'Obsidian is a popular local-first note app with graph view, but it is not fully open source and its sync service costs $4/month. Self-hosted alternatives like Trilium Notes (web-hosted graph and tree), Logseq (local-first outliner with graph), and Joplin (encrypted notes with sync) give you similar features with full data ownership and zero cost.',
    faq: [
      { q: 'Which is the closest open source alternative to Obsidian?', a: 'Logseq is the closest match — it has a graph view, bi-directional links, and works with local Markdown files. Trilium Notes is best if you want a server-hosted web UI.' },
      { q: 'Can I use my Obsidian vault files?', a: 'Logseq can open folders of Markdown files directly, so it works with Obsidian vaults. Joplin can import Markdown files too.' },
      { q: 'Does Trilium Notes have a graph view like Obsidian?', a: 'Yes. Trilium has a "Relation Map" feature that visualizes note connections similar to Obsidian\'s graph view.' },
    ],
    keywords: ['obsidian self hosted', 'obsidian alternative open source', 'self-hosted obsidian', 'logseq vs obsidian', 'trilium notes', 'obsidian self hosted alternative', 'best self-hosted knowledge management'],
  },

  // === SEO Tools (Free Alternatives) ===
  {
    slug: 'semrush',
    saasName: 'Semrush',
    category: 'SEO Tools',
    icon: '🔍',
    alternatives: [
      { name: 'Google Search Console', description: 'Free official tool for monitoring search performance, indexing status, and Core Web Vitals directly from Google.', url: 'https://search.google.com/search-console', github: '', license: 'Free (Google)', difficulty: 'Easy', docker: false, features: ['Search analytics', 'Index coverage', 'URL inspection', 'Sitemaps', 'Core Web Vitals', 'Mobile usability'], scenarioTags: ['solo_dev', 'small_team', 'beginner_friendly', 'web_only', 'monitoring'] },
      { name: 'Ubersuggest', description: 'Keyword research, competitor analysis, and content ideas with 3 free searches per day.', url: 'https://neilpatel.com/ubersuggest', github: '', license: 'Freemium', difficulty: 'Easy', docker: false, features: ['Keyword research', 'Competitor analysis', 'Content ideas', 'Rank tracking', 'Site audit', 'Backlink data'], scenarioTags: ['solo_dev', 'small_team', 'beginner_friendly', 'web_only', 'search'] },
      { name: 'Screaming Frog', description: 'Desktop website crawler for technical SEO audits. Free for up to 500 URLs per crawl.', url: 'https://www.screamingfrog.co.uk/seo-spider', github: '', license: 'Freemium (500 URLs free)', difficulty: 'Medium', docker: false, features: ['Site crawling', 'Broken links', 'Redirect chains', 'Metadata analysis', 'Page speed', 'Structured data'], scenarioTags: ['solo_dev', 'small_team', 'intermediate', 'desktop_app', 'monitoring'] },
      { name: 'Ahrefs Webmaster Tools', description: 'Free backlink analysis and site health monitoring from the team behind Ahrefs.', url: 'https://ahrefs.com/webmaster-tools', github: '', license: 'Free (limited)', difficulty: 'Easy', docker: false, features: ['Backlink analysis', 'Site health', 'Keyword rankings', 'Organic traffic', 'Content audit'], scenarioTags: ['solo_dev', 'small_team', 'beginner_friendly', 'web_only', 'monitoring', 'search'] },
      { name: 'SE Ranking', description: 'Full SEO suite with keyword tracking, site audit, and competitor analysis. 14-day free trial.', url: 'https://seranking.com', github: '', license: 'Freemium trial', difficulty: 'Easy', docker: false, features: ['Keyword tracking', 'Site audit', 'Competitor analysis', 'Backlink checker', 'On-page SEO', 'Marketing plan'], scenarioTags: ['solo_dev', 'small_team', 'beginner_friendly', 'web_only', 'monitoring', 'search'] },
      { name: 'Serpstat', description: 'All-in-one SEO platform with keyword research, competitor analysis, and site auditing.', url: 'https://serpstat.com', github: '', license: 'Freemium', difficulty: 'Easy', docker: false, features: ['Keyword research', 'Competitor analysis', 'Site audit', 'Backlink analysis', 'Rank tracking', 'Content marketing'], scenarioTags: ['solo_dev', 'small_team', 'beginner_friendly', 'web_only', 'search'] },
      { name: 'Moz Free SEO Tools', description: 'Domain Authority checker, keyword explorer, and link explorer from one of the original SEO companies.', url: 'https://moz.com/free-seo-tools', github: '', license: 'Freemium', difficulty: 'Easy', docker: false, features: ['Domain Authority', 'Keyword Explorer', 'Link Explorer', 'MozBar browser extension', 'Competitor research'], scenarioTags: ['solo_dev', 'small_team', 'beginner_friendly', 'web_only', 'search'] },
      { name: 'Mangools', description: 'User-friendly SEO toolkit with SERP analysis, keyword research, and backlink tracking. 10-day free trial.', url: 'https://mangools.com', github: '', license: 'Freemium trial', difficulty: 'Easy', docker: false, features: ['SERP analysis', 'Keyword research', 'Backlink tracking', 'SEO browser extension', 'Rank tracking'], scenarioTags: ['solo_dev', 'beginner_friendly', 'web_only', 'search'] },
      { name: 'Seobility', description: 'Website audit and continuous SEO monitoring with clear improvement suggestions.', url: 'https://www.seobility.net', github: '', license: 'Freemium', difficulty: 'Easy', docker: false, features: ['Site audit', 'Keyword monitoring', 'Backlink check', 'SEO comparison', 'Content optimization', 'Crawl errors'], scenarioTags: ['solo_dev', 'small_team', 'beginner_friendly', 'web_only', 'monitoring'] },
    ],
    title: 'Free Semrush Alternatives — 9 Free SEO Tools (2026)',
    h1: 'Free Semrush Alternatives for 2026',
    description: 'Compare 9 free alternatives to Semrush ($140/mo). Google Search Console, Ubersuggest, Screaming Frog, Ahrefs Webmaster Tools, and more — zero cost.',
    explanation: 'Semrush starts at $139.95/month — expensive for indie hackers and small teams. These free alternatives cover most of what you need: keyword research, site audits, backlink analysis, and rank tracking. Google Search Console alone handles search analytics and indexing. Combined with Ubersuggest for keywords and Screaming Frog for technical audits, you get 80% of Semrush\'s value at zero cost.',
    faq: [
      { q: 'Is there a completely free alternative to Semrush?', a: 'Yes. Google Search Console is 100% free and covers search analytics, indexing status, and Core Web Vitals. Combine it with Ubersuggest (3 free searches/day) and Screaming Frog (500 URLs free) for a complete SEO toolkit at zero cost.' },
      { q: 'What is the best free keyword research tool?', a: 'Google Search Console shows real keyword data from your site for free. For discovery, Ubersuggest gives 3 free searches per day with keyword volume, difficulty, and related terms.' },
      { q: 'Can I do a site audit without Semrush?', a: 'Yes. Screaming Frog crawls up to 500 URLs for free and finds broken links, redirect chains, missing meta tags, and duplicate content. Seobility also audits up to 1,000 pages on its free plan.' },
      { q: 'Which free tool is best for backlink analysis?', a: 'Ahrefs Webmaster Tools provides free backlink data for your own verified websites. For competitor backlink research, Serpstat and Mangools offer limited free access.' },
    ],
    keywords: ['free semrush alternative', 'semrush free alternative', 'free seo tools 2026', 'semrush replacement free', 'free keyword research tool', 'free site audit tool', 'ahrefs webmaster tools free', 'open source seo tool', 'free backlink checker'],
  },

  // === Photo Management ===
  {
    slug: 'immich',
    saasName: 'Google Photos (Immich)',
    category: 'Photo Management',
    icon: '📸',
    alternatives: [
      { name: 'Immich', description: 'Self-hosted Google Photos alternative with ML-powered face recognition, map view, and mobile apps. Actively developed with frequent releases.', url: 'https://immich.app', github: 'https://github.com/immich-app/immich', license: 'AGPL-3.0', difficulty: 'Medium', docker: true, dockerCommand: 'docker compose up -d', features: ['Face recognition', 'Map view', 'Mobile apps', 'Timeline view', 'Album sharing', 'Search', 'Backup'], scenarioTags: ['solo_dev', 'small_team', 'intermediate', 'docker_ready', 'mobile_app', 'sharing', 'backup', 'scalable', 'e2e_encryption'] },
      { name: 'PhotoPrism', description: 'AI-powered photo management with automatic tagging, face detection, and world map. Works well on Raspberry Pi.', url: 'https://photoprism.app', github: 'https://github.com/photoprism/photoprism', license: 'AGPL-3.0', difficulty: 'Easy', docker: true, dockerCommand: 'docker compose up -d', features: ['AI tagging', 'Face detection', 'World map', 'Albums', 'Full-text search', 'Live Photos'], scenarioTags: ['solo_dev', 'small_team', 'beginner_friendly', 'docker_ready', 'lightweight', 'raspberry_pi', 'search', 'backup'] },
      { name: 'Nextcloud Memories', description: 'Photo management addon for Nextcloud with timeline view, face recognition, and album support. Best if you already use Nextcloud.', url: 'https://apps.nextcloud.com/apps/memories', github: 'https://github.com/pulsejet/memories', license: 'AGPL-3.0', difficulty: 'Medium', docker: false, features: ['Timeline view', 'Face recognition', 'Albums', 'Map view', 'Video support', 'Nextcloud integration'], scenarioTags: ['solo_dev', 'small_team', 'intermediate', 'sharing', 'collaboration', 'mobile_app'] },
      { name: 'Lychee', description: 'Lightweight photo management with a clean UI. Fast setup, great for simple photo sharing.', url: 'https://lycheeorg.github.io', github: 'https://github.com/LycheeOrg/Lychee', license: 'MIT', difficulty: 'Easy', docker: true, dockerCommand: 'docker run -d -p 80:80 lycheeorg/lychee', features: ['Albums', 'Sharing', 'EXIF data', 'Tagging', 'Import from URL'], scenarioTags: ['solo_dev', 'beginner_friendly', 'docker_ready', 'lightweight', 'sharing'] },
      { name: 'Ente Photos', description: 'End-to-end encrypted photo storage with mobile and desktop apps. Open source alternative to Google Photos with zero-knowledge privacy.', url: 'https://ente.io', github: 'https://github.com/ente-io/ente', license: 'AGPL-3.0', difficulty: 'Easy', docker: true, features: ['E2E encryption', 'Mobile apps', 'Desktop app', 'Face recognition', 'Albums', 'Map view'], scenarioTags: ['solo_dev', 'small_team', 'beginner_friendly', 'docker_ready', 'e2e_encryption', 'zero_knowledge', 'mobile_app', 'desktop_app', 'backup'] },
      { name: 'Pigallery2', description: 'Fast directory-first photo gallery. Browses your existing folder structure with map, search, and face recognition.', url: 'https://bpatrik.github.io/pigallery2', github: 'https://github.com/bpatrik/pigallery2', license: 'MIT', difficulty: 'Easy', docker: true, dockerCommand: 'docker run -d -p 80:80 bpatrik/pigallery2', features: ['Directory browsing', 'Map view', 'Face recognition', 'Search', 'Video playback', 'Sharing'], scenarioTags: ['solo_dev', 'beginner_friendly', 'docker_ready', 'lightweight', 'search'] },
    ],
    title: 'Self-Hosted Immich & Google Photos Alternative — 6 Open Source Tools (2026)',
    h1: 'Self-Hosted Immich & Google Photos Alternatives',
    description: 'Compare 6 self-hosted alternatives to Google Photos: Immich, PhotoPrism, Nextcloud Memories, Lychee, Ente Photos, and Pigallery2. Face recognition, map view, mobile apps.',
    explanation: 'Google Photos charges $1.99/month for 100GB and scans your photos for advertising. Immich is the most popular self-hosted alternative with face recognition, map view, and native mobile apps — essentially a privacy-first Google Photos clone. PhotoPrism is lighter and runs on Raspberry Pi. For maximum privacy, Ente Photos offers end-to-end encryption.',
    faq: [
      { q: 'Is Immich a good Google Photos replacement?', a: 'Yes. Immich is the closest self-hosted alternative to Google Photos. It has mobile apps for iOS and Android, automatic backup, face recognition, map view, and album sharing. It is actively developed with frequent releases.' },
      { q: 'Which self-hosted photo app is easiest to set up?', a: 'Lychee is the simplest — single Docker container, no database config. PhotoPrism is also beginner-friendly with its docker-compose setup. Immich requires more containers but offers the most features.' },
      { q: 'Can I run a self-hosted photo app on Raspberry Pi?', a: 'PhotoPrism and Pigallery2 both run well on Raspberry Pi 4+. Immich requires more resources (recommended 4GB RAM minimum).' },
      { q: 'Which option has the best mobile app?', a: 'Immich has the most polished mobile apps with automatic background upload. Ente Photos also has excellent mobile apps with E2E encryption.' },
    ],
    keywords: ['immich alternative self hosted', 'self-hosted google photos', 'immich self hosted', 'photoprism vs immich', 'self-hosted photo gallery', 'open source photo management', 'immich docker', 'google photos alternative open source'],
  },

  // === Monitoring ===
  {
    slug: 'uptime-kuma',
    saasName: 'Uptime Robot / Pingdom',
    category: 'Monitoring',
    icon: '📡',
    alternatives: [
      { name: 'Uptime Kuma', description: 'Beautiful self-hosted uptime monitor with status pages, multi-protocol checks (HTTP, TCP, DNS, MQTT), and 90+ notification services.', url: 'https://uptime.kuma.pet', github: 'https://github.com/louislam/uptime-kuma', license: 'MIT', difficulty: 'Easy', docker: true, dockerCommand: 'docker run -d -p 3001:3001 louislam/uptime-kuma', features: ['HTTP monitoring', 'TCP monitoring', 'DNS monitoring', 'Status pages', '90+ notifications', 'Certificate monitoring', 'Multi-language'], scenarioTags: ['solo_dev', 'small_team', 'beginner_friendly', 'docker_ready', 'lightweight', 'monitoring', 'high_availability', 'web_only'] },
      { name: 'Gatus', description: 'YAML-configured health dashboard with minimal resource usage. Ideal for developers who prefer config files over GUI.', url: 'https://github.com/TwiN/gatus', github: 'https://github.com/TwiN/gatus', license: 'Apache-2.0', difficulty: 'Easy', docker: true, dockerCommand: 'docker run -p 8080:8080 twinproduction/gatus', features: ['YAML config', 'Health dashboard', 'REST/GraphQL/TCP checks', 'Alerting', 'Low resource usage', 'Custom conditions'], scenarioTags: ['solo_dev', 'small_team', 'beginner_friendly', 'docker_ready', 'lightweight', 'monitoring', 'api_access', 'cli'] },
      { name: 'Cabot', description: 'Self-hosted monitoring with Grafana integration, alerting rules, and simple Django-based web UI.', url: 'https://cabotapp.com', github: 'https://github.com/arachnys/cabot', license: 'MIT', difficulty: 'Medium', docker: true, features: ['HTTP monitoring', 'Graphite integration', 'Jenkins integration', 'Alerting', 'Django admin', 'Metrics'], scenarioTags: ['small_team', 'enterprise', 'intermediate', 'docker_ready', 'monitoring', 'cicd'] },
      { name: 'Statping', description: 'Modern status page generator with built-in monitoring. Creates beautiful status pages automatically.', url: 'https://statping.com', github: 'https://github.com/statping/ng-statping', license: 'GPL-3.0', difficulty: 'Easy', docker: true, dockerCommand: 'docker run -d -p 8080:8080 statping-ng/statping-ng', features: ['Status pages', 'HTTP monitoring', 'TCP monitoring', 'Notification services', 'REST API', 'Themes'], scenarioTags: ['solo_dev', 'small_team', 'beginner_friendly', 'docker_ready', 'lightweight', 'monitoring', 'web_only', 'api_access'] },
      { name: 'Checkmate', description: 'Open source self-hosted uptime monitor with real-time dashboards, incident management, and status pages.', url: 'https://github.com/bluewave-labs/checkmate', github: 'https://github.com/bluewave-labs/checkmate', license: 'AGPL-3.0', difficulty: 'Medium', docker: true, features: ['Real-time dashboard', 'Incident management', 'Status pages', 'HTTP/TCP/DNS checks', 'Notifications', 'Team management'], scenarioTags: ['small_team', 'enterprise', 'intermediate', 'docker_ready', 'monitoring', 'high_availability', 'rbac'] },
    ],
    title: 'Self-Hosted Uptime Kuma Alternative — 5 Open Source Uptime Monitors (2026)',
    h1: 'Self-Hosted Uptime Monitor Alternatives',
    description: 'Compare 5 self-hosted alternatives to Uptime Robot and Pingdom: Uptime Kuma, Gatus, Cabot, Statping, and Checkmate. Status pages, alerting, Docker-ready.',
    explanation: 'Uptime Robot charges $7/month for 50 monitors and Pingdom starts at $15/month. Uptime Kuma is the most popular self-hosted alternative with a beautiful UI, 90+ notification integrations (Slack, Discord, Telegram, email, etc.), and built-in status pages. Gatus is lighter and config-driven, perfect for developers who prefer YAML over GUIs.',
    faq: [
      { q: 'Is Uptime Kuma better than Uptime Robot?', a: 'For self-hosting, yes. Uptime Kuma gives you unlimited monitors, beautiful status pages, 90+ notification services, and zero monthly cost. Uptime Robot limits free accounts to 50 monitors with 5-minute intervals.' },
      { q: 'Which self-hosted uptime monitor uses the least resources?', a: 'Gatus is the lightest — it uses YAML config files instead of a database. Uptime Kuma needs SQLite but still runs on 256MB RAM. Both run well on a $5/month VPS.' },
      { q: 'Can I get Slack/Discord alerts from self-hosted monitors?', a: 'Yes. Uptime Kuma supports 90+ notification services including Slack, Discord, Telegram, Email, Pushover, and webhook endpoints. Gatus and Statping also support multiple notification channels.' },
      { q: 'Which has the best status page?', a: 'Uptime Kuma has the most polished built-in status pages with custom domains. Statping is also designed around status pages with theme support.' },
    ],
    keywords: ['uptime kuma alternative self hosted', 'self-hosted uptime monitor', 'uptime robot alternative', 'pingdom alternative open source', 'self-hosted status page', 'open source monitoring tool', 'gatus vs uptime kuma', 'free uptime monitoring'],
  },

  // === Desktop Publishing ===
  {
    slug: 'scribus',
    saasName: 'Adobe InDesign',
    category: 'Desktop Publishing',
    icon: '📄',
    alternatives: [
      { name: 'Scribus', description: 'Professional open source desktop publishing with CMYK color, ICC color management, PDF export, and flexible layout tools.', url: 'https://www.scribus.net', github: 'https://github.com/scribusproject/scribus', license: 'GPL-2.0', difficulty: 'Medium', docker: false, features: ['CMYK color', 'ICC profiles', 'PDF export', 'Templates', 'Typography', 'Vector drawing', 'Scripting'], scenarioTags: ['solo_dev', 'small_team', 'intermediate', 'desktop_app', 'beginner_friendly'] },
      { name: 'Typst', description: 'Modern markup-based typesetting system. Fast, programmable, and web-friendly. The LaTeX alternative for 2026.', url: 'https://typst.app', github: 'https://github.com/typst/typst', license: 'Apache-2.0', difficulty: 'Medium', docker: false, features: ['Markup language', 'PDF export', 'Programmable', 'Fast compilation', 'Web editor', 'Package ecosystem'], scenarioTags: ['solo_dev', 'small_team', 'intermediate', 'web_only', 'api_access', 'cli'] },
      { name: 'LibreOffice Draw', description: 'Free vector graphics editor bundled with LibreOffice. Handles flyers, brochures, and simple page layouts.', url: 'https://www.libreoffice.org', github: 'https://github.com/LibreOffice/core', license: 'MPL-2.0', difficulty: 'Easy', docker: false, features: ['Vector graphics', 'Page layout', 'PDF export', 'Templates', 'SVG import', 'Flowcharts'], scenarioTags: ['solo_dev', 'small_team', 'beginner_friendly', 'desktop_app'] },
      { name: 'LaTeX (Beamer/Tufte)', description: 'Professional typesetting system for academic papers, books, and presentations. Steepest learning curve but highest output quality.', url: 'https://www.latex-project.org', github: 'https://github.com/latex3/latex2e', license: 'LPPL-1.3c', difficulty: 'Hard', docker: false, features: ['Math typesetting', 'Bibliography', 'Cross-references', 'Templates', 'PDF output', 'Presentation slides'], scenarioTags: ['intermediate', 'advanced_setup', 'cli', 'desktop_app'] },
      { name: 'Canva (Free Tier)', description: 'Browser-based design tool with thousands of templates. Not open source but the free tier handles most simple layout needs.', url: 'https://www.canva.com', github: '', license: 'Freemium', difficulty: 'Easy', docker: false, features: ['Templates', 'Drag-and-drop', 'Brand kits', 'Team collaboration', 'Print-ready export', 'Social media sizes'], scenarioTags: ['solo_dev', 'small_team', 'beginner_friendly', 'web_only', 'sharing', 'collaboration', 'mobile_app'] },
    ],
    title: 'Best Free Adobe InDesign Alternatives (2026) — Scribus, Typst & Open Source Desktop Publishing',
    h1: 'Free Alternatives to Adobe InDesign — Scribus, Typst & Open Source DTP',
    description: 'Compare 5 free alternatives to Adobe InDesign ($23/mo): Scribus (CMYK, PDF/X), Typst (modern LaTeX), LibreOffice Draw, LaTeX, Canva. Microsoft Publisher retires Oct 2026 — free migration options included.',
    explanation: 'Adobe InDesign costs $22.99/month and requires Creative Cloud. Scribus is the leading open source desktop publisher with CMYK support, ICC color management, and professional PDF/X export — the go-to free tool for print-ready layouts. Typst is a modern, fast alternative to LaTeX for technical documents. With Microsoft Publisher retiring in October 2026, free alternatives like Scribus and Canva are seeing a surge in adoption. For quick designs, Canva\'s free tier handles most non-professional layout needs at zero cost.',
    faq: [
      { q: 'Is Scribus a good InDesign replacement?', a: 'For most users, yes. Scribus handles CMYK color, ICC profiles, PDF/X export, and professional typography. It lacks some advanced InDesign features like GREP styles and data merge, but covers 80% of desktop publishing needs at zero cost.' },
      { q: 'What is Typst and how does it compare to LaTeX?', a: 'Typst is a modern markup-based typesetting system that compiles in milliseconds instead of seconds. It has a cleaner syntax than LaTeX and a growing package ecosystem. Best for technical documents, papers, and reports.' },
      { q: 'Can I use these for commercial print projects?', a: 'Yes. Scribus produces press-ready PDF/X files accepted by commercial printers. Typst and LaTeX also generate print-quality PDFs. Always verify with your print shop first.' },
      { q: 'Which is easiest for beginners?', a: 'Canva is the easiest — browser-based with thousands of templates. LibreOffice Draw is the easiest desktop app. Scribus has a learning curve but there are many tutorials available.' },
      { q: 'Scribus vs Canva — which should I use?', a: 'Scribus is best for print-ready projects (CMYK, PDF/X, commercial printing). Canva is best for quick digital designs, social media graphics, and collaboration. Use Scribus for brochures, magazines, and booklets; use Canva for social posts, presentations, and simple flyers.' },
      { q: 'What replaces Microsoft Publisher after it retires in 2026?', a: 'Scribus is the closest free, open-source replacement with professional layout tools. For simpler needs, Canva\'s free tier or LibreOffice Draw work well. Typst is ideal for technical documents. All five tools listed above are free and work as Publisher alternatives.' },
    ],
    keywords: ['scribus alternative', 'adobe indesign alternative free', 'open source indesign', 'scribus vs indesign', 'free page layout tool', 'typst vs latex', 'free desktop publishing software', 'microsoft publisher alternative 2026', 'scribus vs canva', 'free desktop publishing open source', 'best free indesign alternative', 'publisher replacement free'],
  },
]

function mergeGitHubStats(pages: AlternativePage[]): AlternativePage[] {
  const stats = (githubStats as { stats?: Record<string, { githubStars?: number; lastCommitDate?: string; maintenanceStatus?: SelfHostedAlt['maintenanceStatus'] }> }).stats ?? {}
  if (!Object.keys(stats).length) return pages
  return pages.map(page => ({
    ...page,
    alternatives: page.alternatives.map(alt => {
      const key = alt.github.replace(/\.git$/, '').replace(/\/$/, '')
      const s = stats[key]
      return s ? { ...alt, ...s } : alt
    }),
  }))
}

export const ALTERNATIVE_PAGES: AlternativePage[] = mergeGitHubStats(_RAW_PAGES)

// Categories for the main page
export const CATEGORIES = [
  { name: 'Cloud Storage', icon: '📁', tools: ['google-drive', 'dropbox', 'onedrive'], applicationCategory: 'UtilitiesApplication' },
  { name: 'Note-Taking', icon: '📝', tools: ['notion', 'evernote'], applicationCategory: 'ProductivityApplication' },
  { name: 'Communication', icon: '💬', tools: ['slack', 'discord', 'zoom'], applicationCategory: 'SocialNetworkingApplication' },
  { name: 'Password Management', icon: '🔑', tools: ['lastpass', '1password', 'bitwarden-cloud', 'vaultwarden'], applicationCategory: 'UtilitiesApplication' },
  { name: 'Project Management', icon: '📋', tools: ['jira', 'trello'], applicationCategory: 'BusinessApplication' },
  { name: 'Media Streaming', icon: '🎵', tools: ['spotify', 'netflix'], applicationCategory: 'MultimediaApplication' },
  { name: 'Code Hosting', icon: '🐙', tools: ['github'], applicationCategory: 'DeveloperApplication' },
  { name: 'Email', icon: '📧', tools: ['gmail'], applicationCategory: 'UtilitiesApplication' },
  { name: 'Wiki', icon: '📚', tools: ['confluence'], applicationCategory: 'ProductivityApplication' },
  { name: 'Database', icon: '🗃️', tools: ['airtable'], applicationCategory: 'BusinessApplication' },
  { name: 'Analytics', icon: '📊', tools: ['google-analytics'], applicationCategory: 'BusinessApplication' },
  { name: 'CRM', icon: '💼', tools: ['salesforce'], applicationCategory: 'BusinessApplication' },
  { name: 'Monitoring', icon: '📈', tools: ['datadog'], applicationCategory: 'DeveloperApplication' },
  { name: 'Customer Support', icon: '🎧', tools: ['zendesk'], applicationCategory: 'BusinessApplication' },
  { name: 'CMS', icon: '🌐', tools: ['wordpress-com'], applicationCategory: 'ProductivityApplication' },
  { name: 'Design', icon: '🎨', tools: ['figma'], applicationCategory: 'DesignApplication' },
  { name: 'Task Management', icon: '✅', tools: ['todoist'], applicationCategory: 'ProductivityApplication' },
  { name: 'Forms', icon: '📋', tools: ['typeform'], applicationCategory: 'ProductivityApplication' },
  { name: 'Email Marketing', icon: '✉️', tools: ['mailchimp'], applicationCategory: 'BusinessApplication' },
  { name: 'Identity', icon: '🔐', tools: ['auth0'], applicationCategory: 'DeveloperApplication' },
  { name: 'Search', icon: '🔍', tools: ['algolia'], applicationCategory: 'DeveloperApplication' },
  { name: 'CI/CD', icon: '🔄', tools: ['circleci'], applicationCategory: 'DeveloperApplication' },
  { name: 'Photo Management', icon: '📷', tools: ['google-photos'], applicationCategory: 'MultimediaApplication' },
  { name: 'Automation', icon: '⚡', tools: ['zapier'], applicationCategory: 'ProductivityApplication' },
  { name: 'Code Sharing', icon: '📋', tools: ['pastebin'], applicationCategory: 'DeveloperApplication' },
  { name: 'URL Shortener', icon: '🔗', tools: ['bitly'], applicationCategory: 'UtilitiesApplication' },
  { name: 'Screen Recording', icon: '🎥', tools: ['loom'], applicationCategory: 'ProductivityApplication' },
  { name: 'Music Streaming', icon: '🎶', tools: ['navidrome'], applicationCategory: 'MultimediaApplication' },
  { name: 'File Sync', icon: '🔄', tools: ['syncthing'], applicationCategory: 'UtilitiesApplication' },
  { name: 'Knowledge Management', icon: '📄', tools: ['docmost', 'obsidian'], applicationCategory: 'ProductivityApplication' },
  { name: 'SEO Tools', icon: '🔍', tools: ['semrush'], applicationCategory: 'DeveloperApplication' },
  { name: 'Photo Management', icon: '📸', tools: ['immich'], applicationCategory: 'MultimediaApplication' },
  { name: 'Uptime Monitoring', icon: '📡', tools: ['uptime-kuma'], applicationCategory: 'DeveloperApplication' },
  { name: 'Desktop Publishing', icon: '📄', tools: ['scribus'], applicationCategory: 'DesignApplication' },
]
