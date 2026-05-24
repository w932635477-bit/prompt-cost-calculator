export interface CompareFeature {
  name: string
  a: string | boolean
  b: string | boolean
}

export interface CompareProduct {
  name: string
  tagline: string
  logo: string
  url: string
  github: string
  license: string
  selfHosted: boolean
  docker: boolean
  dockerCompose?: string
  pricing: string
  difficulty: 'Easy' | 'Medium' | 'Hard'
}

export interface ComparePage {
  slug: string
  productA: CompareProduct
  productB: CompareProduct
  title: string
  h1: string
  description: string
  summary: string
  features: CompareFeature[]
  prosA: string[]
  consA: string[]
  prosB: string[]
  consB: string[]
  winner: 'a' | 'b' | 'tie'
  winnerReason: string
  faq: { q: string; a: string }[]
  keywords: string[]
}

export const COMPARE_PAGES: ComparePage[] = [
  {
    slug: 'obsidian-vs-notion',
    productA: {
      name: 'Obsidian', tagline: 'Local-first markdown knowledge base', logo: '💎',
      url: 'https://obsidian.md', github: 'https://github.com/obsidianmd/obsidian-api',
      license: 'Proprietary (free for personal)', selfHosted: false, docker: false,
      pricing: 'Free / Sync $4/mo / Publish $8/mo', difficulty: 'Easy',
    },
    productB: {
      name: 'Notion', tagline: 'All-in-one workspace with databases', logo: '📝',
      url: 'https://notion.so', github: '',
      license: 'Proprietary', selfHosted: false, docker: false,
      pricing: 'Free / Plus $8/mo / Business $15/mo', difficulty: 'Easy',
    },
    title: 'Obsidian vs Notion — Which Note-Taking App Is Better in 2026?',
    h1: 'Obsidian vs Notion: Complete Comparison',
    description: 'Obsidian vs Notion head-to-head comparison. Features, pricing, offline support, self-hosting options, and which tool wins for different use cases.',
    summary: 'Obsidian wins for privacy-focused power users who want local files and markdown. Notion wins for teams who need databases, collaboration, and an all-in-one workspace.',
    features: [
      { name: 'Offline Access', a: true, b: 'Limited' },
      { name: 'Markdown Native', a: true, b: 'Partial' },
      { name: 'Database/Tables', a: 'Via plugins', b: true },
      { name: 'Real-time Collaboration', a: 'Via sync', b: true },
      { name: 'Self-Hosting Option', a: true, b: false },
      { name: 'Plugin Ecosystem', a: '1,000+', b: 'Limited' },
      { name: 'Mobile App', a: true, b: true },
      { name: 'API Access', a: 'Local files', b: 'REST API' },
      { name: 'Data Export', a: 'Plain markdown', b: 'CSV/HTML/Markdown' },
      { name: 'Free Plan', a: true, b: true },
    ],
    prosA: ['Your data lives on your device as markdown files', 'Incredible plugin ecosystem with 1,000+ community plugins', 'Graph view for visualizing note connections', 'Works completely offline', 'No vendor lock-in — files are standard markdown'],
    consA: ['Sync requires paid plan ($4/month)', 'No built-in database/table features', 'Collaboration is limited compared to Notion', 'Learning curve for plugins and settings'],
    prosB: ['Powerful databases with filters, sorts, and relations', 'Excellent real-time collaboration for teams', 'Beautiful templates and page designs', 'Web clipper and API integrations', 'Free for small teams (up to 10 members)'],
    consB: ['Requires internet for most features', 'Not truly offline capable', 'Your data lives on Notion servers', 'Export is limited — vendor lock-in risk', 'Can feel slow with large databases'],
    winner: 'a',
    winnerReason: 'For self-hosting and data sovereignty, Obsidian wins hands down. Your notes are local markdown files you control. Pair it with Syncthing or a Git repo for free sync.',
    faq: [
      { q: 'Is Obsidian better than Notion?', a: 'It depends. Obsidian is better for personal knowledge management with local files and markdown. Notion is better for team collaboration with databases and project management.' },
      { q: 'Can I self-host Obsidian?', a: 'Obsidian runs locally on your device — no server needed. For sync, you can use Syncthing (free), Git, or Obsidian Sync ($4/month). Your files are always on your machine.' },
      { q: 'Is Notion data encrypted?', a: 'Notion encrypts data in transit and at rest, but does not offer end-to-end encryption. Notion employees could theoretically access your data.' },
      { q: 'Can I migrate from Notion to Obsidian?', a: 'Yes. Obsidian has an official Notion importer that converts your Notion pages to markdown files.' },
    ],
    keywords: ['obsidian vs notion', 'notion vs obsidian', 'obsidian compared to notion', 'best note taking app 2026', 'obsidian review', 'notion alternative'],
  },
  {
    slug: 'notion-vs-obsidian',
    productA: {
      name: 'Notion', tagline: 'All-in-one workspace with databases', logo: '📝',
      url: 'https://notion.so', github: '',
      license: 'Proprietary', selfHosted: false, docker: false,
      pricing: 'Free / Plus $8/mo / Business $15/mo', difficulty: 'Easy',
    },
    productB: {
      name: 'Obsidian', tagline: 'Local-first markdown knowledge base', logo: '💎',
      url: 'https://obsidian.md', github: 'https://github.com/obsidianmd/obsidian-api',
      license: 'Proprietary (free for personal)', selfHosted: false, docker: false,
      pricing: 'Free / Sync $4/mo / Publish $8/mo', difficulty: 'Easy',
    },
    title: 'Notion vs Obsidian — Which Should You Choose in 2026?',
    h1: 'Notion vs Obsidian: Team vs Personal Knowledge Management',
    description: 'Notion vs Obsidian comparison focused on team collaboration, databases, and project management. Find out which tool fits your workflow better.',
    summary: 'Notion is the better choice for teams and project management with its powerful databases and real-time collaboration. Obsidian excels for personal knowledge management with local-first markdown.',
    features: [
      { name: 'Team Collaboration', a: true, b: 'Limited' },
      { name: 'Databases & Views', a: true, b: 'Via plugins' },
      { name: 'Project Management', a: true, b: 'Via plugins' },
      { name: 'Page Templates', a: true, b: 'Via community' },
      { name: 'API & Integrations', a: 'REST API', b: 'Local files + plugins' },
      { name: 'Data Portability', a: 'Limited export', b: 'Plain markdown' },
      { name: 'Learning Curve', a: 'Moderate', b: 'Moderate' },
      { name: 'Free Tier', a: 'Generous', b: 'Full features' },
    ],
    prosA: ['Built for teams with real-time co-editing', 'Powerful database system with multiple views (table, board, calendar, timeline)', 'Hundreds of templates for every use case', 'Integrates with Slack, GitHub, Figma, and more', 'Works in any browser — no install needed'],
    consA: ['Requires internet connection', 'No true offline mode', 'Data lives on Notion servers — no self-hosting', 'Can become expensive for larger teams', 'Export options are limited'],
    prosB: ['Data is yours — plain markdown files on your device', 'Works completely offline', 'Massive plugin ecosystem for customization', 'Fast and lightweight', 'Graph view for knowledge exploration'],
    consB: ['Not designed for team collaboration', 'Sync costs extra ($4/month)', 'No built-in databases or project views', 'Mobile experience is less polished'],
    winner: 'b',
    winnerReason: 'If data ownership is your priority, Obsidian is the clear winner. But for teams needing real-time collaboration and databases, Notion is the better tool. Consider using both: Notion for team projects, Obsidian for personal knowledge.',
    faq: [
      { q: 'Can I use Notion and Obsidian together?', a: 'Yes. Many users keep team projects in Notion and personal notes in Obsidian. You can export from Notion to Obsidian when projects conclude.' },
      { q: 'Is Notion good for personal use?', a: 'Yes, Notion works well for personal use with databases, journals, and trackers. The free plan is generous enough for individual use.' },
      { q: 'Which is better for students?', a: 'Obsidian for note-taking and studying (flashcard plugins, PDF annotation). Notion for group projects and assignment tracking.' },
      { q: 'Can I self-host either tool?', a: 'Neither is open source. Obsidian stores data locally as markdown files you fully control. For a self-hosted alternative to both, try Outline or AppFlowy.' },
    ],
    keywords: ['notion vs obsidian', 'obsidian vs notion', 'notion comparison', 'best note app for teams', 'notion for teams', 'obsidian for personal use'],
  },
  {
    slug: 'nextcloud-vs-owncloud',
    productA: {
      name: 'Nextcloud', tagline: 'Self-hosted collaboration platform', logo: '☁️',
      url: 'https://nextcloud.com', github: 'https://github.com/nextcloud/server',
      license: 'AGPL-3.0', selfHosted: true, docker: true,
      dockerCompose: `version: '3'
services:
  nextcloud:
    image: nextcloud:latest
    ports:
      - "8080:80"
    volumes:
      - nextcloud_data:/var/www/html
    environment:
      - MYSQL_HOST=db
      - MYSQL_DATABASE=nextcloud
      - MYSQL_USER=nextcloud
      - MYSQL_PASSWORD=changeme
    depends_on:
      - db
  db:
    image: mariadb:10
    environment:
      - MYSQL_ROOT_PASSWORD=changeme
      - MYSQL_DATABASE=nextcloud
      - MYSQL_USER=nextcloud
      - MYSQL_PASSWORD=changeme
    volumes:
      - db_data:/var/lib/mysql
volumes:
  nextcloud_data:
  db_data:`,
      pricing: 'Free (self-hosted) / Enterprise from €36/user', difficulty: 'Medium',
    },
    productB: {
      name: 'ownCloud', tagline: 'Enterprise file sync and share', logo: '📁',
      url: 'https://owncloud.com', github: 'https://github.com/owncloud/core',
      license: 'AGPL-3.0', selfHosted: true, docker: true,
      dockerCompose: `version: '3'
services:
  owncloud:
    image: owncloud/server:latest
    ports:
      - "8080:8080"
    volumes:
      - owncloud_data:/mnt/data
    environment:
      - OWNCLOUD_ADMIN_PASSWORD=admin
      - OWNCLOUD_DB_TYPE=mysql
      - OWNCLOUD_DB_HOST=db
      - OWNCLOUD_DB_PASSWORD=changeme
    depends_on:
      - db
  db:
    image: mariadb:10
    environment:
      - MYSQL_ROOT_PASSWORD=changeme
      - MYSQL_DATABASE=owncloud
      - MYSQL_PASSWORD=changeme
    volumes:
      - db_data:/var/lib/mysql
volumes:
  owncloud_data:
  db_data:`,
      pricing: 'Free (self-hosted) / Enterprise from €72/user', difficulty: 'Medium',
    },
    title: 'Nextcloud vs ownCloud — Best Self-Hosted Cloud Storage in 2026',
    h1: 'Nextcloud vs ownCloud: Self-Hosted Cloud Comparison',
    description: 'Nextcloud vs ownCloud head-to-head. Features, performance, security, docker deployment, and which self-hosted cloud solution is right for you.',
    summary: 'Nextcloud has become the dominant self-hosted cloud platform with more features, active development, and a larger community. ownCloud focuses on enterprise with a more stable, conservative release cycle.',
    features: [
      { name: 'File Sync', a: true, b: true },
      { name: 'Calendar & Contacts', a: true, b: true },
      { name: 'Office Suite', a: 'Collabora/OnlyOffice', b: 'Collabora' },
      { name: 'End-to-End Encryption', a: true, b: true },
      { name: 'Activity Feed', a: true, b: 'Limited' },
      { name: 'App Store', a: '200+ apps', b: '100+ apps' },
      { name: 'Talk/Video Calls', a: true, b: false },
      { name: 'Mail Integration', a: true, b: false },
      { name: 'Docker Support', a: true, b: true },
      { name: 'Community Size', a: 'Larger', b: 'Smaller' },
    ],
    prosA: ['More features including Talk (video calls), Mail, and Maps', 'Larger and more active community with 200+ apps', 'Better mobile apps', 'Stronger focus on privacy and GDPR compliance', 'Regular security audits and bug bounty program'],
    consA: ['Can be resource-heavy on smaller servers', 'Frequent updates can break third-party apps', 'More complex setup with all features enabled', 'UI can feel cluttered with many apps installed'],
    prosB: ['Cleaner, more focused interface', 'Better enterprise support options', 'More conservative release cycle means more stability', 'Good file sync performance', 'Easier to set up for basic file sharing'],
    consB: ['Fewer features and integrations', 'Smaller community and fewer third-party apps', 'Enterprise pricing is higher', 'Less frequent updates and innovation'],
    winner: 'a',
    winnerReason: 'Nextcloud is the better choice for most users. It has more features, a larger community, and is free with all capabilities. ownCloud is worth considering only if you need enterprise support contracts.',
    faq: [
      { q: 'Why did Nextcloud fork from ownCloud?', a: 'In 2016, the original ownCloud founder left and created Nextcloud with a community-focused approach. The split was over governance and the direction of the project.' },
      { q: 'Is Nextcloud harder to set up than ownCloud?', a: 'For basic file sharing, they are similar. Nextcloud has more options which add complexity, but Docker makes both straightforward to deploy.' },
      { q: 'Can I migrate from ownCloud to Nextcloud?', a: 'Yes. Since they share the same heritage, migration is well-documented. Nextcloud provides migration tools.' },
      { q: 'Which uses less resources?', a: 'ownCloud generally uses less RAM and CPU for basic file sharing. Nextcloud uses more resources but provides more features in return.' },
    ],
    keywords: ['nextcloud vs owncloud', 'owncloud vs nextcloud', 'self hosted cloud comparison', 'best self hosted cloud storage', 'nextcloud alternative'],
  },
  {
    slug: 'joplin-vs-obsidian',
    productA: {
      name: 'Joplin', tagline: 'Open source note-taking with encryption', logo: '📋',
      url: 'https://joplinapp.org', github: 'https://github.com/laurent22/joplin',
      license: 'MIT', selfHosted: true, docker: false,
      pricing: 'Free / Cloud sync $2.49/mo', difficulty: 'Easy',
    },
    productB: {
      name: 'Obsidian', tagline: 'Local-first markdown knowledge base', logo: '💎',
      url: 'https://obsidian.md', github: 'https://github.com/obsidianmd/obsidian-api',
      license: 'Proprietary (free for personal)', selfHosted: false, docker: false,
      pricing: 'Free / Sync $4/mo / Publish $8/mo', difficulty: 'Easy',
    },
    title: 'Joplin vs Obsidian — Open Source vs Freemium Note Apps',
    h1: 'Joplin vs Obsidian: Open Source vs Markdown Powerhouse',
    description: 'Joplin vs Obsidian comparison. Open source with encryption vs local-first markdown with plugins. Which note app is right for you?',
    summary: 'Joplin is the best open source option with built-in encryption and WebDAV sync. Obsidian offers more power and a massive plugin ecosystem but is not open source.',
    features: [
      { name: 'Open Source', a: true, b: false },
      { name: 'End-to-End Encryption', a: true, b: 'Via plugins' },
      { name: 'Markdown Support', a: true, b: true },
      { name: 'Plugin System', a: 'Limited', b: '1,000+' },
      { name: 'WebDAV Sync', a: true, b: 'Via plugins' },
      { name: 'Self-Hosted Sync', a: true, b: 'Via plugins/Git' },
      { name: 'Notebook Organization', a: 'Folders + tags', b: 'Folders + tags + links' },
      { name: 'Backlinks', a: false, b: true },
      { name: 'Graph View', a: false, b: true },
      { name: 'Mobile App', a: true, b: true },
    ],
    prosA: ['Fully open source (MIT license)', 'Built-in end-to-end encryption', 'Sync via WebDAV, Dropbox, OneDrive, or Joplin Cloud', 'Evernote import tool included', 'No vendor lock-in — standard markdown files'],
    consA: ['Plugin ecosystem is much smaller', 'No backlinks or graph view', 'UI feels less polished', 'Limited customization options'],
    prosB: ['Incredible plugin ecosystem with 1,000+ plugins', 'Graph view for visualizing connections', 'Local-first — files are always on your device', 'Highly customizable with themes and CSS', 'Active and large community'],
    consB: ['Not open source', 'Sync costs $4/month (or use Git/Syncthing)', 'Can be overwhelming with too many plugins', 'Mobile app is less feature-rich'],
    winner: 'a',
    winnerReason: 'For self-hosting enthusiasts, Joplin wins with open source code, built-in E2E encryption, and WebDAV sync to your own server. For power users who want plugins and graph views, Obsidian is better.',
    faq: [
      { q: 'Is Joplin completely free?', a: 'Yes. Joplin is MIT licensed and fully free. Joplin Cloud sync is optional at $2.49/month, but you can sync via WebDAV to your own server for free.' },
      { q: 'Can Joplin sync with Nextcloud?', a: 'Yes. Joplin supports WebDAV sync which works with Nextcloud, ownCloud, or any WebDAV server.' },
      { q: 'Which is more secure?', a: 'Joplin has built-in end-to-end encryption for synced notes. Obsidian files are local and unencrypted by default, but you can use filesystem encryption.' },
      { q: 'Can I switch from Joplin to Obsidian?', a: 'Yes. Both use markdown files. You can copy Joplin notes to an Obsidian vault, though you may need to adjust some formatting.' },
    ],
    keywords: ['joplin vs obsidian', 'obsidian vs joplin', 'open source note taking', 'joplin review', 'joplin self hosted', 'best open source notes app'],
  },
  {
    slug: 'vaultwarden-vs-bitwarden',
    productA: {
      name: 'Vaultwarden', tagline: 'Lightweight Bitwarden-compatible server', logo: '🔐',
      url: 'https://github.com/dani-garcia/vaultwarden', github: 'https://github.com/dani-garcia/vaultwarden',
      license: 'AGPL-3.0', selfHosted: true, docker: true,
      dockerCompose: `version: '3'
services:
  vaultwarden:
    image: vaultwarden/server:latest
    ports:
      - "8080:80"
    volumes:
      - vw_data:/data
    environment:
      - ADMIN_TOKEN=changeme_to_a_secure_token
      - SIGNUPS_ALLOWED=false
volumes:
  vw_data:`,
      pricing: 'Free (self-hosted)', difficulty: 'Easy',
    },
    productB: {
      name: 'Bitwarden', tagline: 'Official open source password manager', logo: '🛡️',
      url: 'https://bitwarden.com', github: 'https://github.com/bitwarden/server',
      license: 'AGPL-3.0', selfHosted: true, docker: true,
      dockerCompose: `version: '3'
services:
  bitwarden:
    image: bitwarden/self-host:latest
    ports:
      - "8080:8080"
    volumes:
      - bw_data:/etc/bitwarden
volumes:
  bw_data:`,
      pricing: 'Free / Premium $10/yr / Families $40/yr', difficulty: 'Hard',
    },
    title: 'Vaultwarden vs Bitwarden — Best Self-Hosted Password Manager',
    h1: 'Vaultwarden vs Bitwarden: Self-Hosted Password Manager',
    description: 'Vaultwarden vs Bitwarden comparison. Lightweight vs official server. Docker resources, features, security, and which self-hosted password manager to choose.',
    summary: 'Vaultwarden is the best choice for self-hosting: uses 10x less RAM, fully compatible with Bitwarden clients, and easier to maintain. Use official Bitwarden only if you need enterprise features.',
    features: [
      { name: 'Official Client Support', a: true, b: true },
      { name: 'Browser Extensions', a: true, b: true },
      { name: 'Mobile Apps', a: true, b: true },
      { name: 'Organizations/Teams', a: true, b: true },
      { name: 'Emergency Access', a: true, b: true },
      { name: 'RAM Usage', a: '~50MB', b: '~500MB+' },
      { name: 'Docker Compose', a: '1 container', b: '8+ containers' },
      { name: 'Setup Complexity', a: 'Easy', b: 'Complex' },
      { name: 'Enterprise SSO', a: false, b: true },
      { name: 'License', a: 'AGPL-3.0', b: 'AGPL-3.0' },
    ],
    prosA: ['Extremely lightweight — runs on a $5 VPS or Raspberry Pi', 'Fully compatible with all Bitwarden clients and extensions', 'Simple single-container Docker deployment', 'Active community and frequent updates', 'Low resource usage makes it perfect for home servers'],
    consA: ['Unofficial project — not affiliated with Bitwarden Inc.', 'Some enterprise features missing', 'Support is community-only', 'Must keep up with Bitwarden client updates'],
    prosB: ['Official implementation from Bitwarden Inc.', 'Full enterprise feature set including SSO and policies', 'Professional support available', 'All features guaranteed to work with clients'],
    consB: ['Very resource intensive (8+ Docker containers)', 'Complex setup with MSSQL, Caddy, etc.', 'Overkill for personal or family use', 'Requires significant server resources'],
    winner: 'a',
    winnerReason: 'For self-hosting, Vaultwarden is the clear winner. It runs in a single Docker container with ~50MB RAM and works with all official Bitwarden apps. Official Bitwarden server is only needed for enterprise deployments.',
    faq: [
      { q: 'Is Vaultwarden safe to use?', a: 'Yes. Vaultwarden implements the Bitwarden API and is written in Rust. It is audited by the community and has 40,000+ GitHub stars. Your passwords are encrypted client-side before reaching the server.' },
      { q: 'Can I use Bitwarden mobile app with Vaultwarden?', a: 'Yes. All official Bitwarden clients (mobile, browser, desktop) work with Vaultwarden. Just change the server URL in settings.' },
      { q: 'Can I migrate from Bitwarden to Vaultwarden?', a: 'Yes. Export from Bitwarden and import into Vaultwarden, or point your clients to the new Vaultwarden server URL.' },
      { q: 'Does Vaultwarden support organizations?', a: 'Yes. Vaultwarden supports organizations for sharing vaults between users, matching most Bitwarden organization features.' },
    ],
    keywords: ['vaultwarden vs bitwarden', 'bitwarden vs vaultwarden', 'self hosted password manager', 'vaultwarden review', 'bitwarden self hosted', 'best self hosted password manager'],
  },
  {
    slug: 'immich-vs-google-photos',
    productA: {
      name: 'Immich', tagline: 'Self-hosted photo and video management', logo: '📸',
      url: 'https://immich.app', github: 'https://github.com/immich-app/immich',
      license: 'AGPL-3.0', selfHosted: true, docker: true,
      dockerCompose: `version: '3'
services:
  immich-server:
    image: ghcr.io/immich-app/immich:release
    ports:
      - "2283:2283"
    volumes:
      - immich_upload:/usr/src/app/upload
      - /etc/localtime:/etc/localtime:ro
    environment:
      - DB_HOSTNAME=database
      - DB_USERNAME=postgres
      - DB_PASSWORD=changeme
      - DB_DATABASE_NAME=immich
      - REDIS_HOSTNAME=redis
    depends_on:
      - database
      - redis
  database:
    image: tensorchord/pgvecto-rs:pg14
    environment:
      - POSTGRES_PASSWORD=changeme
      - POSTGRES_DB=immich
    volumes:
      - pg_data:/var/lib/postgresql/data
  redis:
    image: redis:alpine
volumes:
  immich_upload:
  pg_data:`,
      pricing: 'Free (self-hosted)', difficulty: 'Medium',
    },
    productB: {
      name: 'Google Photos', tagline: 'Cloud photo storage with AI organization', logo: '🖼️',
      url: 'https://photos.google.com', github: '',
      license: 'Proprietary', selfHosted: false, docker: false,
      pricing: 'Free 15GB / 100GB $1.99/mo / 2TB $9.99/mo', difficulty: 'Easy',
    },
    title: 'Immich vs Google Photos — Self-Hosted Photo Management',
    h1: 'Immich vs Google Photos: Self-Hosted Photo Storage',
    description: 'Immich vs Google Photos comparison. Self-hosted AI photo management vs cloud storage. Features, cost, privacy, and migration guide.',
    summary: 'Immich is the best self-hosted Google Photos replacement with AI-powered face recognition, map view, and mobile app. Google Photos is easier but costs monthly and gives Google access to your photos.',
    features: [
      { name: 'Face Recognition', a: true, b: true },
      { name: 'Map View', a: true, b: true },
      { name: 'Albums & Sharing', a: true, b: true },
      { name: 'Mobile Auto-Upload', a: true, b: true },
      { name: 'AI Search', a: 'CLIP model', b: 'Google AI' },
      { name: 'Free Storage', a: 'Unlimited*', b: '15GB' },
      { name: 'End-to-End Encryption', a: false, b: false },
      { name: 'Data Privacy', a: true, b: false },
      { name: 'Video Transcoding', a: true, b: true },
      { name: 'Raw Photo Support', a: true, b: 'Limited' },
    ],
    prosA: ['Your photos stay on your server — no one else can access them', 'No storage limits (limited by your hardware)', 'No monthly subscription fees', 'Raw photo support for photographers', 'Active development with frequent updates'],
    consA: ['Requires server setup and maintenance', 'Uses significant RAM and disk space', 'No web sharing links like Google Photos', 'Backup is your responsibility'],
    prosB: ['Zero setup — works immediately', 'Excellent AI search and organization', 'Easy sharing with family and friends', 'Reliable with Google infrastructure', 'Works on all devices seamlessly'],
    consB: ['Google scans your photos for advertising', 'Only 15GB free storage shared with Drive/Gmail', 'Costs add up: $9.99/month for 2TB', 'No self-hosting option', 'Deleting your Google account loses all photos'],
    winner: 'a',
    winnerReason: 'For privacy-conscious users, Immich is the clear winner. It replicates most Google Photos features while keeping your photos on your own server. The cost savings are significant over time.',
    faq: [
      { q: 'Can Immich really replace Google Photos?', a: 'Almost. Immich has face recognition, map view, search, and mobile auto-upload. It lacks some Google Photos features like animations and shared albums, but the core experience is very similar.' },
      { q: 'How much storage do I need for Immich?', a: 'Depends on your photo library. A typical family generates 20-50GB/year. A 1TB drive covers most families for several years.' },
      { q: 'Can I migrate from Google Photos to Immich?', a: 'Yes. Use Google Takeout to export your photos, then upload to Immich. Immich preserves timestamps and metadata.' },
      { q: 'Does Immich work on mobile?', a: 'Yes. Immich has official iOS and Android apps with auto-upload, just like Google Photos.' },
    ],
    keywords: ['immich vs google photos', 'google photos alternative', 'self hosted photo management', 'immich review', 'best self hosted photo gallery'],
  },
  {
    slug: 'gitea-vs-github',
    productA: {
      name: 'Gitea', tagline: 'Lightweight self-hosted Git service', logo: '🍵',
      url: 'https://gitea.io', github: 'https://github.com/go-gitea/gitea',
      license: 'MIT', selfHosted: true, docker: true,
      dockerCompose: `version: '3'
services:
  gitea:
    image: gitea/gitea:latest
    ports:
      - "3000:3000"
      - "2222:22"
    volumes:
      - gitea_data:/data
    environment:
      - GITEA__database__DB_TYPE=sqlite3
volumes:
  gitea_data:`,
      pricing: 'Free (self-hosted)', difficulty: 'Easy',
    },
    productB: {
      name: 'GitHub', tagline: 'World\'s largest code hosting platform', logo: '🐙',
      url: 'https://github.com', github: '',
      license: 'Proprietary', selfHosted: false, docker: false,
      pricing: 'Free / Team $4/user/mo / Enterprise $21/user/mo', difficulty: 'Easy',
    },
    title: 'Gitea vs GitHub — Self-Hosted vs Cloud Git Hosting',
    h1: 'Gitea vs GitHub: Self-Hosted Git vs Cloud Platform',
    description: 'Gitea vs GitHub comparison. Self-hosted lightweight Git service vs cloud platform. Features, pricing, CI/CD, and which is better for your project.',
    summary: 'Gitea is the best self-hosted Git service: lightweight, fast, and free. GitHub offers more features (Actions, Packages, marketplace) but at a cost and with less privacy.',
    features: [
      { name: 'Git Hosting', a: true, b: true },
      { name: 'Pull Requests', a: true, b: true },
      { name: 'Issue Tracker', a: true, b: true },
      { name: 'CI/CD Pipeline', a: 'Via Gitea Actions', b: 'GitHub Actions' },
      { name: 'Package Registry', a: true, b: true },
      { name: 'Wiki', a: true, b: true },
      { name: 'Private Repos (Free)', a: 'Unlimited', b: 'Unlimited' },
      { name: 'Code Review', a: true, b: true },
      { name: 'RAM Usage', a: '~100MB', b: 'N/A (cloud)' },
      { name: 'API', a: 'REST + Swagger', b: 'REST + GraphQL' },
    ],
    prosA: ['Full control over your code — no third-party access', 'Runs on a $5 VPS or Raspberry Pi', 'Unlimited private repositories for free', 'Fast and lightweight — written in Go', 'Compatible with Git hooks and CI/CD integrations'],
    consA: ['Smaller community than GitHub', 'Fewer integrations and marketplace apps', 'Gitea Actions is newer than GitHub Actions', 'Less polished UI compared to GitHub'],
    prosB: ['Largest developer community in the world', 'GitHub Actions is the most popular CI/CD', 'Massive marketplace of apps and integrations', 'Excellent code search and navigation', 'Free for open source with unlimited collaborators'],
    consB: ['Your code lives on Microsoft servers', 'Private repos on free plan have limited CI minutes', 'Enterprise pricing is expensive ($21/user/month)', 'No self-hosting option', 'Dependent on GitHub availability'],
    winner: 'a',
    winnerReason: 'For self-hosting and code privacy, Gitea wins. It runs on minimal hardware, supports Actions CI/CD, and gives you full control. GitHub is better if you need the social/community aspects or massive integration ecosystem.',
    faq: [
      { q: 'Can I migrate from GitHub to Gitea?', a: 'Yes. Gitea has a built-in GitHub migration tool that imports repos, issues, labels, milestones, and pull requests.' },
      { q: 'Does Gitea support GitHub Actions?', a: 'Gitea has its own Actions system that is compatible with GitHub Actions YAML syntax. Most workflows can be migrated with minimal changes.' },
      { q: 'Is Gitea production-ready?', a: 'Yes. Gitea is used in production by many organizations. It handles thousands of repositories reliably with minimal resources.' },
      { q: 'Can I use Gitea for a team?', a: 'Yes. Gitea supports organizations, teams, permissions, and code review. It works well for small to medium teams.' },
    ],
    keywords: ['gitea vs github', 'github vs gitea', 'self hosted git', 'gitea review', 'self hosted github alternative', 'best self hosted git server'],
  },
]
