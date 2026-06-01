export interface DeployConfig {
  name: string
  image: string
  port: string
  volumes: { host: string; container: string }[]
  env: { key: string; value: string }[]
  dockerCompose: string
  envFile: string
  deployCommand: string
  accessUrl: string
  minRam: string
}

export interface DeployPage {
  slug: string
  saasName: string
  deploys: DeployConfig[]
  title: string
  h1: string
  description: string
  faq: { q: string; a: string }[]
  keywords: string[]
}

function dc(name: string, image: string, port: string, volumes: { host: string; container: string }[], env: { key: string; value: string }[], minRam = '512MB'): DeployConfig {
  const containerName = name.toLowerCase().replace(/[^a-z0-9]/g, '')
  const volBlock = volumes.length > 0
    ? '    volumes:\n' + volumes.map(v => `      - ${v.host}:${v.container}`).join('\n')
    : ''
  const envBlock = env.length > 0
    ? '    environment:\n' + env.map(e => `      ${e.key}: ${e.value}`).join('\n')
    : ''
  const [hostPort] = port.split(':')

  const compose = `services:
  ${containerName}:
    image: ${image}
    container_name: ${containerName}
    ports:
      - "${port}"
    restart: unless-stopped
${volBlock}
${envBlock}`

  const envFileContent = env.length > 0
    ? env.map(e => `${e.key}=${e.value}`).join('\n')
    : ''

  return {
    name,
    image,
    port,
    volumes,
    env,
    dockerCompose: compose,
    envFile: envFileContent,
    deployCommand: `docker compose up -d`,
    accessUrl: `http://localhost:${hostPort}`,
    minRam,
  }
}

export const DEPLOY_PAGES: DeployPage[] = [
  {
    slug: 'slack',
    saasName: 'Slack',
    title: 'Deploy Self-Hosted Slack Alternatives with Docker Compose',
    h1: 'Deploy Self-Hosted Slack Alternatives',
    description: 'Deploy Mattermost, Rocket.Chat, and Element (Matrix) with Docker Compose. Production-ready configs with .env templates, volume mounts, and one-command deployment.',
    keywords: ['deploy mattermost docker', 'deploy rocket.chat docker', 'deploy element matrix docker', 'self-hosted slack docker compose', 'mattermost docker compose'],
    faq: [
      { q: 'Which self-hosted Slack alternative is easiest to deploy?', a: 'Mattermost has the simplest Docker setup with a single container. Rocket.Chat requires MongoDB alongside it. Element (Matrix) requires Synapse and is the most complex.' },
      { q: 'How much RAM do I need to self-host a Slack alternative?', a: 'Mattermost and Rocket.Chat need 2GB+ RAM. Element/Synapse needs 4GB+ for production use. All three run fine on a $5-10/month VPS.' },
      { q: 'Can I migrate from Slack to a self-hosted alternative?', a: 'Mattermost and Rocket.Chat both offer Slack import tools. Channels, messages, and users can be migrated with built-in tools.' },
    ],
    deploys: [
      dc('Mattermost', 'mattermost/mattermost-preview:latest', '8065:8065', [
        { host: './mattermost-data', container: '/mattermost/data' },
        { host: './mattermost-config', container: '/mattermost/config' },
        { host: './mattermost-plugins', container: '/mattermost/plugins' },
      ], [
        { key: 'MM_SQLSETTINGS_DRIVERNAME', value: 'postgres' },
        { key: 'MM_SERVICESETTINGS_SITEURL', value: 'http://localhost:8065' },
      ], '2GB'),
      dc('Rocket.Chat', 'rocket.chat:latest', '3000:3000', [
        { host: './rocket-uploads', container: '/app/uploads' },
      ], [
        { key: 'MONGO_URL', value: 'mongodb://mongo:27017/rocketchat' },
        { key: 'ROOT_URL', value: 'http://localhost:3000' },
      ], '2GB'),
      dc('Element', 'vectorim/element-web:latest', '8080:80', [], [], '1GB'),
    ],
  },
  {
    slug: 'notion',
    saasName: 'Notion',
    title: 'Deploy Self-Hosted Notion Alternatives with Docker Compose',
    h1: 'Deploy Self-Hosted Notion Alternatives',
    description: 'Deploy Outline wiki with Docker Compose. Production-ready config with PostgreSQL, Redis, .env template, and one-command deployment.',
    keywords: ['deploy outline wiki docker', 'self-hosted notion docker compose', 'outline docker compose', 'notion alternative docker deploy'],
    faq: [
      { q: 'Which Notion alternative is best for self-hosting?', a: 'Outline is the most popular self-hosted Notion alternative with Docker support. It includes real-time collaboration, Markdown support, and Slack integration.' },
      { q: 'Does Outline require external services?', a: 'Outline needs PostgreSQL and Redis. The docker-compose template below includes all three services.' },
    ],
    deploys: [
      dc('Outline', 'outlinewiki/outline:latest', '3000:3000', [
        { host: './outline-data', container: '/var/lib/outline/data' },
      ], [
        { key: 'SECRET_KEY', value: 'change-me-to-a-random-string' },
        { key: 'DATABASE_URL', value: 'postgres://outline:outline@postgres:5432/outline' },
        { key: 'REDIS_URL', value: 'redis://redis:6379' },
        { key: 'URL', value: 'http://localhost:3000' },
        { key: 'PORT', value: '3000' },
      ], '1GB'),
    ],
  },
  {
    slug: 'google-drive',
    saasName: 'Google Drive',
    title: 'Deploy Self-Hosted Google Drive Alternatives with Docker Compose',
    h1: 'Deploy Self-Hosted Google Drive Alternatives',
    description: 'Deploy Nextcloud, ownCloud, and Seafile with Docker Compose. Production-ready configs with .env templates and one-command deployment.',
    keywords: ['deploy nextcloud docker', 'deploy owncloud docker', 'deploy seafile docker', 'self-hosted cloud storage docker compose', 'nextcloud docker compose'],
    faq: [
      { q: 'Which self-hosted cloud storage is easiest to deploy?', a: 'Seafile is the simplest with a single container. Nextcloud is the most feature-rich but needs more resources. ownCloud is enterprise-focused.' },
      { q: 'How much storage do I need?', a: 'The software itself needs minimal space. Your data drives storage needs. Nextcloud and ownCloud work well with external storage mounts (S3, NFS).' },
    ],
    deploys: [
      dc('Nextcloud', 'nextcloud:latest', '8080:80', [
        { host: './nextcloud-html', container: '/var/www/html' },
        { host: './nextcloud-data', container: '/var/www/html/data' },
      ], [
        { key: 'MYSQL_HOST', value: 'db' },
        { key: 'MYSQL_DATABASE', value: 'nextcloud' },
        { key: 'MYSQL_USER', value: 'nextcloud' },
        { key: 'MYSQL_PASSWORD', value: 'change-me' },
      ], '2GB'),
      dc('ownCloud', 'owncloud/server:latest', '8081:8080', [
        { host: './owncloud-data', container: '/mnt/data' },
      ], [], '2GB'),
      dc('Seafile', 'seafileltd/seafile-mc:latest', '8082:80', [
        { host: './seafile-data', container: '/shared' },
      ], [
        { key: 'DB_HOST', value: 'db' },
        { key: 'DB_ROOT_PASSWD', value: 'change-me' },
      ], '1GB'),
    ],
  },
  {
    slug: 'github',
    saasName: 'GitHub',
    title: 'Deploy Self-Hosted GitHub Alternatives with Docker Compose',
    h1: 'Deploy Self-Hosted GitHub Alternatives',
    description: 'Deploy Gitea and GitLab CE with Docker Compose. Lightweight Git hosting with pull requests, CI/CD, and package registries.',
    keywords: ['deploy gitea docker', 'deploy gitlab docker', 'self-hosted git docker compose', 'gitea docker compose', 'gitlab ce docker'],
    faq: [
      { q: 'Gitea or GitLab CE for self-hosting?', a: 'Gitea is lightweight (runs on 512MB RAM) and perfect for small teams. GitLab CE has more features (CI/CD, monitoring) but needs 4GB+ RAM.' },
      { q: 'Can I migrate repositories from GitHub?', a: 'Both Gitea and GitLab CE support importing repositories from GitHub via URL or API.' },
    ],
    deploys: [
      dc('Gitea', 'gitea/gitea:latest', '3000:3000', [
        { host: './gitea-data', container: '/data' },
        { host: '/etc/timezone', container: '/etc/timezone:ro' },
      ], [
        { key: 'USER_UID', value: '1000' },
        { key: 'USER_GID', value: '1000' },
        { key: 'GITEA__database__DB_TYPE', value: 'sqlite3' },
      ], '512MB'),
      dc('GitLab CE', 'gitlab/gitlab-ce:latest', '8080:8080', [
        { host: './gitlab-config', container: '/etc/gitlab' },
        { host: './gitlab-data', container: '/var/opt/gitlab' },
        { host: './gitlab-logs', container: '/var/log/gitlab' },
      ], [
        { key: 'GITLAB_OMNIBUS_CONFIG', value: 'external_url \'http://localhost:8080\'' },
      ], '4GB'),
      dc('Forgejo', 'codeberg.org/forgejo/forgejo:latest', '3001:3000', [
        { host: './forgejo-data', container: '/data' },
      ], [
        { key: 'USER_UID', value: '1000' },
        { key: 'USER_GID', value: '1000' },
      ], '512MB'),
    ],
  },
  {
    slug: 'spotify',
    saasName: 'Spotify',
    title: 'Deploy Self-Hosted Spotify Alternatives with Docker Compose',
    h1: 'Deploy Self-Hosted Spotify Alternatives',
    description: 'Deploy Navidrome music server with Docker Compose. Stream your music library anywhere with a modern web UI and mobile apps.',
    keywords: ['deploy navidrome docker', 'deploy jellyfin docker', 'self-hosted music server docker', 'navidrome docker compose', 'music streaming docker'],
    faq: [
      { q: 'Which music server is easiest to self-host?', a: 'Navidrome is the lightest and fastest to set up with a single container. Jellyfin is more full-featured (also handles video) but needs more resources.' },
      { q: 'Can I stream to my phone?', a: 'Yes. Navidrome supports Subsonic/Airsonic API, compatible with Ultrasonic, DSub, and playSub apps on iOS and Android.' },
    ],
    deploys: [
      dc('Navidrome', 'deluan/navidrome:latest', '4533:4533', [
        { host: './music', container: '/music' },
        { host: './navidrome-data', container: '/data' },
      ], [
        { key: 'ND_SCANSCHEDULE', value: '1h' },
        { key: 'ND_LOGLEVEL', value: 'info' },
        { key: 'ND_SESSIONTIMEOUT', value: '24h' },
      ], '256MB'),
      dc('Jellyfin', 'jellyfin/jellyfin:latest', '8096:8096', [
        { host: './jellyfin-config', container: '/config' },
        { host: './jellyfin-cache', container: '/cache' },
        { host: './music', container: '/media' },
      ], [], '1GB'),
    ],
  },
  {
    slug: 'netflix',
    saasName: 'Netflix',
    title: 'Deploy Self-Hosted Netflix Alternatives with Docker Compose',
    h1: 'Deploy Self-Hosted Netflix Alternatives',
    description: 'Deploy Jellyfin media server with Docker Compose. Stream movies and TV shows with transcoding, subtitles, and mobile app support.',
    keywords: ['deploy jellyfin docker', 'deploy plex docker', 'self-hosted media server docker', 'jellyfin docker compose', 'netflix alternative docker'],
    faq: [
      { q: 'Jellyfin or Plex for self-hosting?', a: 'Jellyfin is fully open source with no feature gates. Plex has a polished UI but locks features behind Plex Pass. Both support transcoding and mobile apps.' },
      { q: 'Do I need a GPU for transcoding?', a: 'Not required. Software transcoding works on any CPU. Hardware transcoding (Intel QuickSync, NVIDIA) improves quality and reduces CPU load.' },
    ],
    deploys: [
      dc('Jellyfin', 'jellyfin/jellyfin:latest', '8096:8096', [
        { host: './jellyfin-config', container: '/config' },
        { host: './jellyfin-cache', container: '/cache' },
        { host: './media', container: '/media' },
      ], [], '2GB'),
      dc('Plex', 'plexinc/pms-docker:latest', '32400:32400', [
        { host: './plex-config', container: '/config' },
        { host: './plex-transcode', container: '/transcode' },
        { host: './media', container: '/data' },
      ], [
        { key: 'PLEX_CLAIM', value: '' },
      ], '2GB'),
    ],
  },
  {
    slug: 'lastpass',
    saasName: 'LastPass',
    title: 'Deploy Self-Hosted LastPass Alternatives with Docker Compose',
    h1: 'Deploy Self-Hosted LastPass Alternatives',
    description: 'Deploy Vaultwarden (Bitwarden-compatible) with Docker Compose. Lightweight password manager with browser extensions and mobile apps.',
    keywords: ['deploy vaultwarden docker', 'deploy passbolt docker', 'self-hosted password manager docker', 'vaultwarden docker compose', 'bitwarden docker'],
    faq: [
      { q: 'Is Vaultwarden compatible with Bitwarden apps?', a: 'Yes. Vaultwarden is fully compatible with all official Bitwarden browser extensions, mobile apps, and CLI tools.' },
      { q: 'How secure is Vaultwarden?', a: 'Vaultwarden uses the same encryption as Bitwarden. Data is encrypted client-side before being sent to the server. The server never sees unencrypted vault data.' },
    ],
    deploys: [
      dc('Vaultwarden', 'vaultwarden/server:latest', '8080:80', [
        { host: './vaultwarden-data', container: '/data' },
      ], [], '128MB'),
      dc('Passbolt', 'passbolt/passbolt:latest', '443:443', [
        { host: './passbolt-gpg', container: '/var/lib/passbolt/gpg' },
        { host: './passbolt-images', container: '/usr/share/php/passbolt/webroot/img/public' },
      ], [
        { key: 'PASSBOLT_SSL_FORCE', value: 'true' },
      ], '512MB'),
    ],
  },
  {
    slug: '1password',
    saasName: '1Password',
    title: 'Deploy Self-Hosted 1Password Alternatives with Docker Compose',
    h1: 'Deploy Self-Hosted 1Password Alternatives',
    description: 'Deploy Vaultwarden as a 1Password alternative. Bitwarden-compatible password manager with browser extensions, mobile apps, and TOTP.',
    keywords: ['deploy vaultwarden docker', '1password alternative docker', 'self-hosted password manager docker compose'],
    faq: [
      { q: 'Can I import passwords from 1Password?', a: 'Yes. Bitwarden (and Vaultwarden) supports direct import from 1Password .1pif and .1pux export files.' },
    ],
    deploys: [
      dc('Vaultwarden', 'vaultwarden/server:latest', '8080:80', [
        { host: './vaultwarden-data', container: '/data' },
      ], [], '128MB'),
    ],
  },
  {
    slug: 'jira',
    saasName: 'Jira',
    title: 'Deploy Self-Hosted Jira Alternatives with Docker Compose',
    h1: 'Deploy Self-Hosted Jira Alternatives',
    description: 'Deploy Plane and Redmine with Docker Compose. Open source project management with issues, sprints, and kanban boards.',
    keywords: ['deploy plane docker', 'deploy redmine docker', 'self-hosted jira docker compose', 'plane docker compose', 'redmine docker'],
    faq: [
      { q: 'Which Jira alternative is easiest to self-host?', a: 'Redmine is the simplest with a single container. Plane has a modern UI but requires more services (Redis, minio).' },
    ],
    deploys: [
      dc('Plane', 'makeplane/plane:latest', '3000:3000', [
        { host: './plane-data', container: '/app/data' },
      ], [
        { key: 'WEB_URL', value: 'http://localhost:3000' },
        { key: 'CORS_ALLOWED_ORIGINS', value: 'http://localhost:3000' },
      ], '2GB'),
      dc('Redmine', 'redmine:latest', '3001:3000', [
        { host: './redmine-files', container: '/usr/src/redmine/files' },
        { host: './redmine-plugins', container: '/usr/src/redmine/plugins' },
      ], [
        { key: 'REDMINE_DB_MYSQL', value: 'db' },
        { key: 'REDMINE_DB_PASSWORD', value: 'change-me' },
      ], '512MB'),
    ],
  },
  {
    slug: 'google-analytics',
    saasName: 'Google Analytics',
    title: 'Self-Hosted Google Analytics Alternatives — Docker Deploy',
    h1: 'Deploy Self-Hosted Google Analytics Alternatives',
    description: 'Deploy Plausible Analytics and Matomo with Docker Compose. Privacy-friendly, cookie-compliant web analytics you fully control.',
    keywords: ['deploy plausible docker', 'deploy matomo docker', 'self-hosted analytics docker compose', 'plausible docker compose', 'matomo docker'],
    faq: [
      { q: 'Plausible or Matomo for self-hosting?', a: 'Plausible is lightweight, cookie-free, and GDPR-compliant by default. Matomo is more feature-rich (heatmaps, session recordings) but heavier.' },
    ],
    deploys: [
      dc('Plausible', 'plausible/analytics:latest', '8000:8000', [
        { host: './plausible-data', container: '/var/lib/plausible' },
      ], [
        { key: 'ADMIN_USER_EMAIL', value: 'admin@example.com' },
        { key: 'ADMIN_USER_NAME', value: 'Admin' },
        { key: 'ADMIN_USER_PWD', value: 'change-me' },
        { key: 'BASE_URL', value: 'http://localhost:8000' },
        { key: 'SECRET_KEY_BASE', value: 'change-me-to-random-string' },
      ], '1GB'),
    ],
  },
  {
    slug: 'zoom',
    saasName: 'Zoom',
    title: 'Deploy Self-Hosted Zoom Alternatives with Docker Compose',
    h1: 'Deploy Self-Hosted Zoom Alternatives',
    description: 'Deploy Jitsi Meet video conferencing with Docker Compose. Free video calls with screen sharing, recording, and no account required.',
    keywords: ['deploy jitsi meet docker', 'self-hosted video conferencing docker', 'jitsi docker compose', 'zoom alternative docker'],
    faq: [
      { q: 'How many users can Jitsi Meet handle?', a: 'A single server handles 10-20 concurrent video participants. For larger meetings, use Jitsi\'s experimental SFU mode or add more JVB (video bridge) containers.' },
    ],
    deploys: [
      dc('Jitsi Meet', 'jitsi/docker-jitsi-meet:latest', '8443:8443', [
        { host: './jitsi-config', container: '/config' },
      ], [
        { key: 'ENABLE_AUTH', value: '1' },
        { key: 'ENABLE_GUESTS', value: '1' },
        { key: 'ENABLE_LOBBY', value: '1' },
        { key: 'PUBLIC_URL', value: 'https://localhost:8443' },
      ], '2GB'),
    ],
  },
  {
    slug: 'zapier',
    saasName: 'Zapier',
    title: 'Deploy Self-Hosted Zapier Alternatives with Docker Compose',
    h1: 'Deploy Self-Hosted Zapier Alternatives',
    description: 'Deploy n8n workflow automation with Docker Compose. Connect 400+ services with visual workflows, no code required.',
    keywords: ['deploy n8n docker', 'self-hosted automation docker', 'n8n docker compose', 'zapier alternative docker'],
    faq: [
      { q: 'How does n8n compare to Zapier?', a: 'n8n is free for unlimited workflows and executions. Zapier charges per task. n8n has a visual node editor similar to Zapier but with more flexibility for technical users.' },
    ],
    deploys: [
      dc('n8n', 'n8nio/n8n:latest', '5678:5678', [
        { host: './n8n-data', container: '/home/node/.n8n' },
      ], [
        { key: 'N8N_HOST', value: 'localhost' },
        { key: 'N8N_PORT', value: '5678' },
        { key: 'N8N_PROTOCOL', value: 'http' },
        { key: 'GENERIC_TIMEZONE', value: 'UTC' },
      ], '512MB'),
    ],
  },
  {
    slug: 'trello',
    saasName: 'Trello',
    title: 'Deploy Self-Hosted Trello Alternatives with Docker Compose',
    h1: 'Deploy Self-Hosted Trello Alternatives',
    description: 'Deploy WeKan and Kanboard with Docker Compose. Open source kanban boards with swimlanes, checklists, and Trello import.',
    keywords: ['deploy wekan docker', 'deploy kanboard docker', 'self-hosted kanban docker', 'wekan docker compose', 'trello alternative docker'],
    faq: [
      { q: 'Can I import my Trello boards?', a: 'WeKan has built-in Trello import. Export your Trello boards as JSON and import directly into WeKan.' },
    ],
    deploys: [
      dc('WeKan', 'wekanteam/wekan:latest', '8080:8080', [
        { host: './wekan-data', container: '/data' },
      ], [
        { key: 'ROOT_URL', value: 'http://localhost:8080' },
        { key: 'MONGO_URL', value: 'mongodb://mongo:27017/wekan' },
      ], '1GB'),
      dc('Kanboard', 'kanboard/kanboard:latest', '8081:80', [
        { host: './kanboard-data', container: '/var/www/app/data' },
        { host: './kanboard-plugins', container: '/var/www/app/plugins' },
      ], [], '256MB'),
    ],
  },
  {
    slug: 'discord',
    saasName: 'Discord',
    title: 'Deploy Self-Hosted Discord Alternatives with Docker Compose',
    h1: 'Deploy Self-Hosted Discord Alternatives',
    description: 'Deploy Element (Matrix) and Revolt with Docker Compose. Decentralized chat with E2E encryption, voice channels, and bridges.',
    keywords: ['deploy element matrix docker', 'deploy revolt docker', 'self-hosted discord docker', 'matrix synapse docker compose'],
    faq: [
      { q: 'Can Element bridge to Discord?', a: 'Yes. Matrix (Element\'s backend) supports bridges to Discord, Slack, Telegram, IRC, and more. Install the Discord bridge to sync messages between platforms.' },
    ],
    deploys: [
      dc('Element', 'vectorim/element-web:latest', '8080:80', [], [], '256MB'),
      dc('Revolt', 'revolt/server:latest', '3000:3000', [
        { host: './revolt-data', container: '/data' },
      ], [], '1GB'),
    ],
  },
  {
    slug: 'dropbox',
    saasName: 'Dropbox',
    title: 'Deploy Self-Hosted Dropbox Alternatives with Docker Compose',
    h1: 'Deploy Self-Hosted Dropbox Alternatives',
    description: 'Deploy Nextcloud and Syncthing with Docker Compose. Self-hosted file sync with no storage limits and no subscription fees.',
    keywords: ['deploy syncthing docker', 'deploy nextcloud docker', 'self-hosted file sync docker', 'syncthing docker compose'],
    faq: [
      { q: 'Syncthing or Nextcloud for file sync?', a: 'Syncthing is peer-to-peer with no central server needed. Nextcloud is a full cloud platform with web access, sharing, and collaboration features.' },
    ],
    deploys: [
      dc('Syncthing', 'syncthing/syncthing:latest', '8384:8384', [
        { host: './syncthing-config', container: '/var/syncthing' },
      ], [], '256MB'),
      dc('Nextcloud', 'nextcloud:latest', '8080:80', [
        { host: './nextcloud-html', container: '/var/www/html' },
        { host: './nextcloud-data', container: '/var/www/html/data' },
      ], [], '2GB'),
    ],
  },
  {
    slug: 'evernote',
    saasName: 'Evernote',
    title: 'Deploy Self-Hosted Evernote Alternatives with Docker Compose',
    h1: 'Deploy Self-Hosted Evernote Alternatives',
    description: 'Deploy Trilium Notes and Memos with Docker Compose. Self-hosted note-taking with Markdown, hierarchical notebooks, and web clippers.',
    keywords: ['deploy trilium docker', 'deploy memos docker', 'self-hosted notes docker', 'trilium docker compose'],
    faq: [
      { q: 'Can I import from Evernote?', a: 'Trilium Notes supports ENEX import from Evernote. Joplin also has an Evernote import tool built in.' },
    ],
    deploys: [
      dc('Trilium Notes', 'zadam/trilium:latest', '8080:8080', [
        { host: './trilium-data', container: '/data' },
      ], [], '256MB'),
      dc('Memos', 'neosmemo/memos:latest', '5230:5230', [
        { host: './memos-data', container: '/var/opt/memos' },
      ], [], '128MB'),
    ],
  },
  {
    slug: 'wordpress-com',
    saasName: 'WordPress.com',
    title: 'Deploy Self-Hosted WordPress Alternatives with Docker Compose',
    h1: 'Deploy Self-Hosted WordPress Alternatives',
    description: 'Deploy Ghost and WordPress self-hosted with Docker Compose. Professional blogging and CMS with themes, plugins, and SEO tools.',
    keywords: ['deploy ghost docker', 'deploy wordpress docker', 'self-hosted blog docker', 'ghost docker compose'],
    faq: [
      { q: 'Ghost or WordPress for blogging?', a: 'Ghost is modern, fast, and built for publishing with native newsletter support. WordPress has more plugins and themes but is heavier.' },
    ],
    deploys: [
      dc('Ghost', 'ghost:latest', '2368:2368', [
        { host: './ghost-content', container: '/var/lib/ghost/content' },
      ], [
        { key: 'url', value: 'http://localhost:2368' },
        { key: 'database__client', value: 'mysql' },
        { key: 'database__connection__host', value: 'db' },
        { key: 'database__connection__user', value: 'root' },
        { key: 'database__connection__password', value: 'change-me' },
        { key: 'database__connection__database', value: 'ghost' },
      ], '512MB'),
    ],
  },
  {
    slug: 'figma',
    saasName: 'Figma',
    title: 'Deploy Self-Hosted Figma Alternatives with Docker Compose',
    h1: 'Deploy Self-Hosted Figma Alternatives',
    description: 'Deploy Penpot design platform with Docker Compose. Open source design and prototyping tool with SVG-native workflows.',
    keywords: ['deploy penpot docker', 'self-hosted design tool docker', 'penpot docker compose', 'figma alternative docker'],
    faq: [
      { q: 'Is Penpot a real Figma replacement?', a: 'Penpot covers most design use cases with SVG-native approach. It supports components, flex layout, prototyping, and real-time collaboration. Missing some Figma plugins ecosystem.' },
    ],
    deploys: [
      dc('Penpot', 'penpotapp/frontend:latest', '9001:80', [
        { host: './penpot-assets', container: '/opt/data/assets' },
      ], [
        { key: 'PENPOT_PUBLIC_URI', value: 'http://localhost:9001' },
        { key: 'PENPOT_DATABASE_URI', value: 'postgresql://penpot:penpot@postgres/penpot' },
        { key: 'PENPOT_REDIS_URI', value: 'redis://redis/0' },
      ], '2GB'),
    ],
  },
  {
    slug: 'salesforce',
    saasName: 'Salesforce',
    title: 'Deploy Self-Hosted Salesforce Alternatives with Docker Compose',
    h1: 'Deploy Self-Hosted Salesforce Alternatives',
    description: 'Deploy Twenty CRM and ERPNext with Docker Compose. Open source CRM with contacts, deals, and pipeline management.',
    keywords: ['deploy twenty crm docker', 'deploy erpnext docker', 'self-hosted crm docker', 'twenty crm docker compose'],
    faq: [
      { q: 'Can I migrate from Salesforce?', a: 'Twenty CRM supports CSV import of contacts and deals. For complex migrations, use the REST API to sync data programmatically.' },
    ],
    deploys: [
      dc('Twenty CRM', 'twentycrm/twenty:latest', '3000:3000', [
        { host: './twenty-data', container: '/app/data' },
      ], [
        { key: 'PG_HOST', value: 'postgres' },
        { key: 'PG_DATABASE', value: 'default' },
        { key: 'PG_USERNAME', value: 'twenty' },
        { key: 'PG_PASSWORD', value: 'twenty' },
        { key: 'SERVER_URL', value: 'http://localhost:3000' },
      ], '2GB'),
    ],
  },
  {
    slug: 'zendesk',
    saasName: 'Zendesk',
    title: 'Deploy Self-Hosted Zendesk Alternatives with Docker Compose',
    h1: 'Deploy Self-Hosted Zendesk Alternatives',
    description: 'Deploy Chatwoot and Zammad with Docker Compose. Open source customer support with omnichannel inbox, live chat, and ticketing.',
    keywords: ['deploy chatwoot docker', 'deploy zammad docker', 'self-hosted helpdesk docker', 'chatwoot docker compose'],
    faq: [
      { q: 'Chatwoot or Zammad for customer support?', a: 'Chatwoot excels at omnichannel (WhatsApp, Facebook, Instagram, web chat). Zammad is stronger for traditional email ticketing with SLA management.' },
    ],
    deploys: [
      dc('Chatwoot', 'chatwoot/chatwoot:latest', '3000:3000', [
        { host: './chatwoot-data', container: '/app/storage' },
      ], [
        { key: 'FRONTEND_URL', value: 'http://localhost:3000' },
        { key: 'POSTGRES_HOST', value: 'postgres' },
        { key: 'POSTGRES_USERNAME', value: 'chatwoot' },
        { key: 'POSTGRES_PASSWORD', value: 'change-me' },
        { key: 'REDIS_URL', value: 'redis://redis:6379' },
      ], '2GB'),
    ],
  },
  {
    slug: 'gmail',
    saasName: 'Gmail',
    title: 'Deploy Self-Hosted Gmail Alternatives with Docker Compose',
    h1: 'Deploy Self-Hosted Gmail Alternatives',
    description: 'Deploy Mailu and Roundcube with Docker Compose. Self-hosted email with webmail, spam filtering, and full control over your data.',
    keywords: ['deploy mailu docker', 'self-hosted email docker', 'mailu docker compose', 'roundcube docker'],
    faq: [
      { q: 'Is self-hosting email hard?', a: 'Email requires DNS records (MX, SPF, DKIM, DMARC) and a static IP with good reputation. Mailu simplifies the software side but DNS setup is still required.' },
    ],
    deploys: [
      dc('Mailu', 'mailu/admin:latest', '8080:80', [
        { host: './mailu-data', container: '/data' },
        { host: './mailu-mail', container: '/mail' },
      ], [
        { key: 'DOMAIN', value: 'example.com' },
        { key: 'HOSTNAMES', value: 'mail.example.com' },
        { key: 'POSTMASTER', value: 'admin' },
        { key: 'SECRET_KEY', value: 'change-me-to-random-string' },
      ], '1GB'),
    ],
  },
  {
    slug: 'airtable',
    saasName: 'Airtable',
    title: 'Deploy Self-Hosted Airtable Alternatives with Docker Compose',
    h1: 'Deploy Self-Hosted Airtable Alternatives',
    description: 'Deploy NocoDB with Docker Compose. Turn any database into a smart spreadsheet with Airtable-like interface.',
    keywords: ['deploy nocodb docker', 'self-hosted airtable docker', 'nocodb docker compose', 'airtable alternative docker'],
    faq: [
      { q: 'Can NocoDB connect to existing databases?', a: 'Yes. NocoDB supports MySQL, PostgreSQL, SQL Server, and SQLite. Connect to your existing database and get an Airtable-like interface instantly.' },
    ],
    deploys: [
      dc('NocoDB', 'nocodb/nocodb:latest', '8080:8080', [
        { host: './nocodb-data', container: '/usr/app/data' },
      ], [], '256MB'),
    ],
  },
  {
    slug: 'datadog',
    saasName: 'Datadog',
    title: 'Deploy Self-Hosted Datadog Alternatives with Docker Compose',
    h1: 'Deploy Self-Hosted Datadog Alternatives',
    description: 'Deploy Grafana + Prometheus + Loki with Docker Compose. Full observability stack with dashboards, alerts, and log management.',
    keywords: ['deploy grafana docker', 'deploy prometheus docker', 'self-hosted monitoring docker', 'grafana docker compose', 'datadog alternative docker'],
    faq: [
      { q: 'Is Grafana a good Datadog replacement?', a: 'Grafana + Prometheus covers metrics and dashboards. Add Loki for logs and Tempo for traces. The full stack replaces most Datadog features for free.' },
    ],
    deploys: [
      dc('Grafana', 'grafana/grafana:latest', '3000:3000', [
        { host: './grafana-data', container: '/var/lib/grafana' },
      ], [
        { key: 'GF_SECURITY_ADMIN_USER', value: 'admin' },
        { key: 'GF_SECURITY_ADMIN_PASSWORD', value: 'admin' },
      ], '512MB'),
    ],
  },
  {
    slug: 'todoist',
    saasName: 'Todoist',
    title: 'Deploy Self-Hosted Todoist Alternatives with Docker Compose',
    h1: 'Deploy Self-Hosted Todoist Alternatives',
    description: 'Deploy Vikunja with Docker Compose. Self-hosted task management with lists, kanban, and calendar views.',
    keywords: ['deploy vikunja docker', 'self-hosted todo docker', 'vikunja docker compose', 'todoist alternative docker'],
    faq: [
      { q: 'Can I import from Todoist?', a: 'Vikunja supports Todoist CSV import. Export your tasks from Todoist and import them into Vikunja.' },
    ],
    deploys: [
      dc('Vikunja', 'vikunja/vikunja:latest', '3456:3456', [
        { host: './vikunja-files', container: '/app/vikunja/files' },
      ], [
        { key: 'VIKUNJA_SERVICE_ROOTURL', value: 'http://localhost:3456/' },
      ], '256MB'),
    ],
  },
  {
    slug: 'confluence',
    saasName: 'Confluence',
    title: 'Deploy Self-Hosted Confluence Alternatives with Docker Compose',
    h1: 'Deploy Self-Hosted Confluence Alternatives',
    description: 'Deploy BookStack and Wiki.js with Docker Compose. Self-hosted knowledge base and documentation platform.',
    keywords: ['deploy bookstack docker', 'deploy wikijs docker', 'self-hosted wiki docker', 'bookstack docker compose'],
    faq: [
      { q: 'BookStack or Wiki.js for documentation?', a: 'BookStack has a book/chapter/page structure similar to Confluence. Wiki.js has a more modern UI with support for multiple storage backends and git integration.' },
    ],
    deploys: [
      dc('BookStack', 'solidnerd/bookstack:latest', '8080:8080', [
        { host: './bookstack-uploads', container: '/var/www/bookstack/public/uploads' },
        { host: './bookstack-storage', container: '/var/www/bookstack/storage' },
      ], [
        { key: 'DB_HOST', value: 'mysql' },
        { key: 'DB_DATABASE', value: 'bookstack' },
        { key: 'DB_USERNAME', value: 'bookstack' },
        { key: 'DB_PASSWORD', value: 'change-me' },
        { key: 'APP_URL', value: 'http://localhost:8080' },
      ], '512MB'),
    ],
  },
  {
    slug: 'google-photos',
    saasName: 'Google Photos',
    title: 'Deploy Self-Hosted Google Photos Alternatives with Docker Compose',
    h1: 'Deploy Self-Hosted Google Photos Alternatives',
    description: 'Deploy Immich and PhotoPrism with Docker Compose. Self-hosted photo management with face recognition, maps, and album sharing.',
    keywords: ['deploy immich docker', 'deploy photoprism docker', 'self-hosted photos docker', 'immich docker compose'],
    faq: [
      { q: 'Immich or PhotoPrism?', a: 'Immich is designed as a Google Photos clone with mobile apps. PhotoPrism is more focused on browsing and organizing large photo collections with AI-powered search.' },
    ],
    deploys: [
      dc('Immich', 'ghcr.io/immich-app/immich:latest', '2283:2283', [
        { host: './immich-upload', container: '/usr/src/app/upload' },
      ], [
        { key: 'DB_HOSTNAME', value: 'database' },
        { key: 'DB_USERNAME', value: 'postgres' },
        { key: 'DB_PASSWORD', value: 'postgres' },
        { key: 'DB_DATABASE_NAME', value: 'immich' },
        { key: 'REDIS_HOSTNAME', value: 'redis' },
      ], '2GB'),
      dc('PhotoPrism', 'photoprism/photoprism:latest', '2342:2342', [
        { host: './photoprism-storage', container: '/photoprism/storage' },
        { host: './photos', container: '/photoprism/originals' },
      ], [
        { key: 'PHOTOPRISM_ADMIN_PASSWORD', value: 'change-me' },
        { key: 'PHOTOPRISM_SITE_URL', value: 'http://localhost:2342' },
      ], '2GB'),
    ],
  },
  {
    slug: 'circleci',
    saasName: 'CircleCI',
    title: 'Deploy Self-Hosted CI/CD with Docker Compose',
    h1: 'Deploy Self-Hosted CI/CD Alternatives',
    description: 'Deploy Gitea Actions and Woodpecker CI with Docker Compose. Self-hosted continuous integration with Docker-in-Docker support.',
    keywords: ['deploy woodpecker docker', 'self-hosted ci cd docker', 'woodpecker docker compose', 'gitea actions docker'],
    faq: [
      { q: 'Which CI/CD is easiest to self-host?', a: 'Woodpecker CI is a simple CI that integrates with Gitea and GitHub. Gitea Actions is built into Gitea and uses GitHub Actions syntax.' },
    ],
    deploys: [
      dc('Woodpecker CI', 'woodpeckerci/woodpecker-server:latest', '8000:8000', [
        { host: './woodpecker-data', container: '/var/lib/woodpecker' },
      ], [
        { key: 'WOODPECKER_OPEN', value: 'true' },
        { key: 'WOODPECKER_HOST', value: 'http://localhost:8000' },
        { key: 'WOODPECKER_GITEA', value: 'true' },
        { key: 'WOODPECKER_GITEA_URL', value: 'http://gitea:3000' },
      ], '512MB'),
    ],
  },
  {
    slug: 'mailchimp',
    saasName: 'Mailchimp',
    title: 'Deploy Self-Hosted Mailchimp Alternatives with Docker Compose',
    h1: 'Deploy Self-Hosted Mailchimp Alternatives',
    description: 'Deploy Listmonk with Docker Compose. Self-hosted newsletter and mailing list manager with a modern UI.',
    keywords: ['deploy listmonk docker', 'self-hosted newsletter docker', 'listmonk docker compose', 'mailchimp alternative docker'],
    faq: [
      { q: 'Can Listmonk handle large mailing lists?', a: 'Yes. Listmonk uses PostgreSQL and can handle millions of subscribers. It supports templating, bounce processing, and click tracking.' },
    ],
    deploys: [
      dc('Listmonk', 'listmonk/listmonk:latest', '9000:9000', [
        { host: './listmonk-data', container: '/listmonk/data' },
      ], [
        { key: 'LISTMONK_app__address', value: '0.0.0.0:9000' },
        { key: 'LISTMONK_db__host', value: 'postgres' },
        { key: 'LISTMONK_db__port', value: '5432' },
        { key: 'LISTMONK_db__user', value: 'listmonk' },
        { key: 'LISTMONK_db__password', value: 'listmonk' },
      ], '256MB'),
    ],
  },
  {
    slug: 'asana',
    saasName: 'Asana',
    title: 'Deploy Self-Hosted Asana Alternatives with Docker Compose',
    h1: 'Deploy Self-Hosted Asana Alternatives',
    description: 'Deploy Plane and Taiga with Docker Compose. Open source project management with issues, sprints, and kanban boards.',
    keywords: ['deploy plane docker', 'deploy taiga docker', 'self-hosted project management docker', 'plane docker compose'],
    faq: [
      { q: 'Can I import from Asana?', a: 'Plane supports CSV import of tasks and projects. Export your Asana data and import into Plane.' },
    ],
    deploys: [
      dc('Plane', 'makeplane/plane:latest', '3000:3000', [
        { host: './plane-data', container: '/app/data' },
      ], [
        { key: 'WEB_URL', value: 'http://localhost:3000' },
      ], '2GB'),
    ],
  },
  {
    slug: 'onedrive',
    saasName: 'OneDrive',
    title: 'Deploy Self-Hosted OneDrive Alternatives with Docker Compose',
    h1: 'Deploy Self-Hosted OneDrive Alternatives',
    description: 'Deploy Nextcloud and Seafile with Docker Compose. Self-hosted cloud storage to replace OneDrive and Office 365.',
    keywords: ['deploy nextcloud docker', 'deploy seafile docker', 'self-hosted onedrive docker', 'nextcloud docker compose'],
    faq: [
      { q: 'Can I replace Office 365 along with OneDrive?', a: 'Yes. Nextcloud includes Collabora or OnlyOffice for document editing, replacing both OneDrive and Word/Excel/PowerPoint online.' },
    ],
    deploys: [
      dc('Nextcloud', 'nextcloud:latest', '8080:80', [
        { host: './nextcloud-html', container: '/var/www/html' },
        { host: './nextcloud-data', container: '/var/www/html/data' },
      ], [], '2GB'),
      dc('Seafile', 'seafileltd/seafile-mc:latest', '8082:80', [
        { host: './seafile-data', container: '/shared' },
      ], [], '1GB'),
    ],
  },
  // === Trending Self-Hosted Tools ===
  {
    slug: 'navidrome',
    saasName: 'Navidrome',
    title: 'Deploy Navidrome Music Server with Docker Compose',
    h1: 'Deploy Navidrome Self-Hosted Music Server',
    description: 'Deploy Navidrome with Docker Compose. Self-hosted music streaming server with Spotify-like UI, smart playlists, and mobile apps.',
    keywords: ['deploy navidrome docker', 'navidrome docker compose', 'navidrome setup', 'self-hosted music server docker', 'navidrome deployment guide'],
    faq: [
      { q: 'How much music can Navidrome handle?', a: 'Navidrome handles libraries of 100K+ tracks easily. It uses very little RAM (~20MB) regardless of library size since it streams files directly.' },
      { q: 'Can I use Navidrome behind a reverse proxy?', a: 'Yes. Use Caddy, Nginx, or Traefik with HTTPS. Navidrome runs on port 4533 by default.' },
    ],
    deploys: [
      dc('Navidrome', 'deluan/navidrome:latest', '4533:4533', [
        { host: './music', container: '/music' },
        { host: './navidrome-data', container: '/data' },
      ], [
        { key: 'ND_SCANSCHEDULE', value: '1h' },
        { key: 'ND_LOGLEVEL', value: 'info' },
        { key: 'ND_SESSIONTIMEOUT', value: '24h' },
        { key: 'ND_ENABLECOVERANIMATION', value: 'true' },
      ], '256MB'),
    ],
  },
  {
    slug: 'syncthing',
    saasName: 'Syncthing',
    title: 'Deploy Syncthing File Sync with Docker Compose',
    h1: 'Deploy Syncthing Self-Hosted File Sync',
    description: 'Deploy Syncthing with Docker Compose. Peer-to-peer encrypted file sync across devices with no central server.',
    keywords: ['deploy syncthing docker', 'syncthing docker compose', 'syncthing setup', 'self-hosted file sync docker', 'syncthing deployment guide'],
    faq: [
      { q: 'Does Syncthing work through NAT?', a: 'Yes. Syncthing uses a global discovery server and relay network to connect through NAT and firewalls. Local sync works directly on LAN.' },
      { q: 'How do I add a sync folder?', a: 'Open the Syncthing web UI at localhost:8384, click "Add Folder", set the local path, and share it with connected devices.' },
    ],
    deploys: [
      dc('Syncthing', 'syncthing/syncthing:latest', '8384:8384', [
        { host: './syncthing-config', container: '/var/syncthing' },
        { host: './syncthing-data', container: '/var/syncthing/data' },
      ], [], '256MB'),
    ],
  },
  {
    slug: 'vaultwarden',
    saasName: 'Vaultwarden',
    title: 'Deploy Vaultwarden Password Manager with Docker Compose',
    h1: 'Deploy Vaultwarden Self-Hosted Password Manager',
    description: 'Deploy Vaultwarden with Docker Compose. Lightweight Bitwarden-compatible password manager with browser extensions and mobile apps.',
    keywords: ['deploy vaultwarden docker', 'vaultwarden docker compose', 'vaultwarden setup', 'self-hosted password manager docker', 'bitwarden docker'],
    faq: [
      { q: 'How do I connect Bitwarden apps to Vaultwarden?', a: 'In the Bitwarden app settings, change the server URL to your Vaultwarden instance (e.g. https://vault.example.com). All official Bitwarden clients are supported.' },
      { q: 'Does Vaultwarden need HTTPS?', a: 'Yes. Browser extensions and mobile apps require HTTPS. Use a reverse proxy like Caddy with automatic HTTPS, or Nginx with Let\'s Encrypt.' },
    ],
    deploys: [
      dc('Vaultwarden', 'vaultwarden/server:latest', '8080:80', [
        { host: './vaultwarden-data', container: '/data' },
      ], [
        { key: 'WEBSOCKET_ENABLED', value: 'true' },
        { key: 'SIGNUPS_ALLOWED', value: 'true' },
        { key: 'INVITATIONS_ALLOWED', value: 'true' },
      ], '128MB'),
    ],
  },
  // === Trending Knowledge Management ===
  {
    slug: 'docmost',
    saasName: 'Docmost',
    title: 'Deploy Docmost Wiki with Docker Compose',
    h1: 'Deploy Docmost Self-Hosted Wiki',
    description: 'Deploy Docmost with Docker Compose. Open source collaborative wiki with real-time editing, page tree, and Notion-like blocks editor.',
    keywords: ['deploy docmost docker', 'docmost docker compose', 'docmost setup', 'self-hosted wiki docker', 'docmost deployment guide', 'docmost install'],
    faq: [
      { q: 'Does Docmost need a database?', a: 'Yes. Docmost needs PostgreSQL and Redis. The docker-compose template below includes all three services.' },
      { q: 'How much RAM does Docmost need?', a: 'Docmost itself uses ~256MB. With PostgreSQL and Redis, budget 1GB total. A $5/month VPS works fine.' },
    ],
    deploys: [
      dc('Docmost', 'docmost/docmost:latest', '3000:3000', [
        { host: './docmost-data', container: '/app/data' },
      ], [
        { key: 'APP_URL', value: 'http://localhost:3000' },
        { key: 'APP_SECRET', value: 'change-me-to-a-random-string' },
        { key: 'DATABASE_URL', value: 'postgresql://docmost:docmost@postgres:5432/docmost' },
        { key: 'REDIS_URL', value: 'redis://redis:6379' },
      ], '1GB'),
    ],
  },
  {
    slug: 'obsidian',
    saasName: 'Obsidian (Self-Hosted Alternatives)',
    title: 'Deploy Self-Hosted Obsidian Alternatives with Docker Compose',
    h1: 'Deploy Self-Hosted Obsidian Alternatives',
    description: 'Deploy Trilium Notes and Joplin Server with Docker Compose. Self-hosted knowledge management with graph views and Markdown.',
    keywords: ['deploy trilium docker', 'deploy joplin server docker', 'self-hosted obsidian docker', 'trilium notes docker compose', 'joplin server docker compose'],
    faq: [
      { q: 'Can I self-host Obsidian itself?', a: 'No. Obsidian is a desktop/mobile app that stores files locally. For server-hosted alternatives with similar features, use Trilium Notes (web UI with graph view) or Joplin Server (sync server for Joplin clients).' },
      { q: 'Which is easiest to deploy?', a: 'Trilium Notes is a single container with no dependencies. Joplin Server needs PostgreSQL.' },
    ],
    deploys: [
      dc('Trilium Notes', 'zadam/trilium:latest', '8080:8080', [
        { host: './trilium-data', container: '/home/node/trilium-data' },
      ], [], '512MB'),
      dc('Joplin Server', 'joplin/server:latest', '22300:22300', [
        { host: './joplin-data', container: '/home/joplin/data' },
      ], [
        { key: 'APP_BASE_URL', value: 'http://localhost:22300' },
        { key: 'APP_PORT', value: '22300' },
        { key: 'DB_CLIENT', value: 'pg' },
        { key: 'POSTGRES_HOST', value: 'postgres' },
        { key: 'POSTGRES_DATABASE', value: 'joplin' },
        { key: 'POSTGRES_USER', value: 'joplin' },
        { key: 'POSTGRES_PASSWORD', value: 'joplin' },
      ], '1GB'),
    ],
  },
]
