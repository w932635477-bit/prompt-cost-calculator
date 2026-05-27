// src/finder/chat/finder-data.ts
// Self-Hosted Team Chat Finder — tool data + scenario weights

export type WizardOption = {
  team: 'solo' | 'small_team' | 'large_team' | 'enterprise'
  style: 'threaded' | 'real_time' | 'voice_first' | 'omnichannel'
  priority: 'privacy' | 'features' | 'simplicity' | 'cost'
  deploy: 'docker' | 'kubernetes' | 'single_binary' | 'managed'
}

export type Tag =
  // Team size
  | 'solo' | 'small_team' | 'large_team' | 'enterprise'
  // Communication style
  | 'threaded' | 'real_time' | 'voice_calls' | 'video_calls' | 'screen_sharing'
  // Privacy & security
  | 'e2e_encryption' | 'federation' | 'on_premise' | 'air_gapped'
  // Enterprise auth
  | 'ldap' | 'sso_saml' | 'rbac' | 'audit_log'
  // UX paradigm
  | 'slack_compatible' | 'discord_like' | 'api_rich' | 'webhooks' | 'bridges'
  // Platforms
  | 'mobile_ios' | 'mobile_android' | 'desktop_app' | 'web_only'
  // Deployment
  | 'docker_easy' | 'kubernetes' | 'single_binary' | 'lightweight' | 'managed_available'
  // Business features
  | 'omnichannel' | 'chatbots' | 'live_chat' | 'crm_integration'
  // Licensing
  | 'open_source' | 'source_available'

export interface ChatTool {
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
  githubStars?: number
}

export const CHAT_TOOLS: ChatTool[] = [
  {
    name: 'Zulip',
    tagline: 'Threaded messaging for organized team communication',
    logo: '🧵',
    url: 'https://zulip.com',
    github: 'https://github.com/zulip/zulip',
    license: 'Apache-2.0',
    pricing: 'Free (self-hosted) / Cloud $6.67/user/mo',
    difficulty: 'Medium',
    tags: ['solo', 'small_team', 'large_team', 'enterprise',
           'threaded', 'real_time',
           'e2e_encryption', 'on_premise',
           'ldap', 'sso_saml', 'rbac', 'audit_log',
           'api_rich', 'webhooks',
           'mobile_ios', 'mobile_android', 'desktop_app',
           'docker_easy', 'kubernetes',
           'open_source'],
    pros: [
      'Threaded conversations keep discussions organized by topic',
      'Excellent for asynchronous communication across time zones',
      'Keyboard shortcuts and LaTeX/math rendering built-in',
      'Integrates with 100+ tools via native integrations and webhooks',
    ],
    cons: [
      'UI takes time to learn if you are used to Slack',
      'Voice/video requires third-party integration (Jitsi)',
      'Smaller third-party app marketplace than Slack',
    ],
    dockerCompose: `services:
  zulip:
    image: zulip/docker-zulip:latest
    ports: ["80:80", "443:443"]
    environment:
      ZULIP_AUTH_BACKENDS: EmailAuthBackend
      SETTING_LOAD_BALANCER_IPS: 127.0.0.1
    volumes:
      - zulip_data:/data
volumes:
  zulip_data:`,
  },
  {
    name: 'Mattermost',
    tagline: 'Slack-like messaging for enterprises with compliance features',
    logo: '💼',
    url: 'https://mattermost.com',
    github: 'https://github.com/mattermost/mattermost',
    license: 'AGPL-3.0 / Enterprise BSL',
    pricing: 'Free (self-hosted) / Enterprise $10/user/mo',
    difficulty: 'Medium',
    tags: ['small_team', 'large_team', 'enterprise',
           'real_time', 'voice_calls', 'video_calls', 'screen_sharing',
           'on_premise', 'air_gapped',
           'ldap', 'sso_saml', 'rbac', 'audit_log',
           'slack_compatible', 'api_rich', 'webhooks',
           'mobile_ios', 'mobile_android', 'desktop_app',
           'docker_easy', 'kubernetes', 'managed_available',
           'open_source', 'source_available'],
    pros: [
      'Most Slack-like experience with channels and threads',
      'HIPAA and FedRAMP compliance on Enterprise plan',
      'Air-gapped deployment for sensitive environments',
      'LDAP/AD/SAML and advanced RBAC built in',
    ],
    cons: [
      'Enterprise features require paid license',
      'Resource-heavy compared to lighter alternatives',
      'Mobile app performance can be inconsistent',
    ],
    dockerCompose: `services:
  mattermost:
    image: mattermost/mattermost-preview:latest
    ports: ["8065:8065"]
    volumes:
      - mm_data:/mattermost/data
volumes:
  mm_data:`,
  },
  {
    name: 'Rocket.Chat',
    tagline: 'Feature-rich open source chat with omnichannel support',
    logo: '🚀',
    url: 'https://rocket.chat',
    github: 'https://github.com/RocketChat/Rocket.Chat',
    license: 'MIT',
    pricing: 'Free (self-hosted) / Enterprise $4/user/mo',
    difficulty: 'Medium',
    tags: ['small_team', 'large_team', 'enterprise',
           'real_time', 'voice_calls', 'video_calls', 'screen_sharing',
           'on_premise',
           'ldap', 'sso_saml', 'rbac', 'audit_log',
           'api_rich', 'webhooks',
           'omnichannel', 'chatbots', 'live_chat',
           'mobile_ios', 'mobile_android', 'desktop_app',
           'docker_easy', 'kubernetes',
           'open_source'],
    pros: [
      'Omnichannel support (WhatsApp, SMS, email, live chat)',
      'Built-in video conferencing and screen sharing',
      'Most feature-rich open source chat platform',
      'MIT license — most permissive of any candidate',
    ],
    cons: [
      'Can be resource-heavy with many features enabled',
      'Upgrades between major versions can be tricky',
      'UI can feel cluttered with all features visible',
    ],
    dockerCompose: `services:
  rocketchat:
    image: rocket.chat:latest
    ports: ["3000:3000"]
    environment:
      MONGO_URL: mongodb://mongo:27017/rocketchat
      ROOT_URL: http://localhost:3000
    depends_on: [mongo]
  mongo:
    image: mongo:6
    volumes:
      - mongo_data:/data/db
volumes:
  mongo_data:`,
  },
  {
    name: 'Element',
    tagline: 'Decentralized E2E-encrypted messaging on the Matrix protocol',
    logo: '🔒',
    url: 'https://element.io',
    github: 'https://github.com/element-hq/element-web',
    license: 'Apache-2.0 (client) / AGPL (Synapse)',
    pricing: 'Free (self-hosted) / Cloud $5/user/mo',
    difficulty: 'Hard',
    tags: ['solo', 'small_team', 'large_team',
           'real_time', 'voice_calls', 'video_calls',
           'e2e_encryption', 'federation', 'on_premise',
           'ldap', 'sso_saml', 'rbac', 'audit_log',
           'bridges',
           'mobile_ios', 'mobile_android', 'desktop_app',
           'docker_easy',
           'open_source'],
    pros: [
      'True end-to-end encryption by default in private rooms',
      'Federation lets different organizations interconnect',
      'Bridges to Slack, Discord, IRC, Telegram, WhatsApp, and more',
      'Decentralized architecture with no single point of failure',
    ],
    cons: [
      'Synapse server is resource-heavy (Python)',
      'Complex setup compared to single-binary alternatives',
      'Encryption key management can confuse non-technical users',
    ],
    dockerCompose: `services:
  synapse:
    image: matrixdotorg/synapse:latest
    ports: ["8008:8008"]
    volumes:
      - synapse_data:/data
    environment:
      SYNAPSE_SERVER_NAME: localhost
      SYNAPSE_REPORT_STATS: "no"
  element:
    image: vectorim/element-web:latest
    ports: ["8080:80"]
    volumes:
      - ./element-config.json:/app/config.json
volumes:
  synapse_data:`,
  },
  {
    name: 'Revolt',
    tagline: 'Discord-like chat with privacy-first design',
    logo: '⚡',
    url: 'https://revolt.chat',
    github: 'https://github.com/revoltchat/self-hosted',
    license: 'AGPL-3.0',
    pricing: 'Free (self-hosted)',
    difficulty: 'Medium',
    tags: ['solo', 'small_team',
           'real_time', 'voice_calls',
           'discord_like', 'api_rich', 'webhooks',
           'mobile_android', 'desktop_app', 'web_only',
           'docker_easy', 'lightweight',
           'open_source'],
    pros: [
      'Discord-like interface that communities understand immediately',
      'Privacy-first with no telemetry or tracking',
      'Lightweight Rust backend with good performance',
      'Custom themes and bots via API',
    ],
    cons: [
      'No E2E encryption yet',
      'No federation support',
      'Missing enterprise features (no LDAP, SAML, RBAC)',
      'No iOS app available yet',
    ],
    dockerCompose: `services:
  revolt:
    image: revoltchat/server:latest
    ports: ["8000:8000"]
    environment:
      REVOLT_MONGODB: mongodb://mongo:27017
      REVOLT_REDIS: redis://redis:6379
    depends_on: [mongo, redis]
  mongo:
    image: mongo:6
  redis:
    image: redis:7-alpine`,
  },
  {
    name: 'Nextcloud Talk',
    tagline: 'Built-in chat and video calls inside your Nextcloud instance',
    logo: '☁️',
    url: 'https://nextcloud.com/talk/',
    github: 'https://github.com/nextcloud/spreed',
    license: 'AGPL-3.0',
    pricing: 'Free (self-hosted) / Enterprise from €36/user/yr',
    difficulty: 'Easy',
    tags: ['solo', 'small_team', 'large_team', 'enterprise',
           'real_time', 'voice_calls', 'video_calls', 'screen_sharing',
           'e2e_encryption', 'on_premise',
           'ldap', 'sso_saml', 'rbac',
           'mobile_ios', 'mobile_android', 'desktop_app', 'web_only',
           'docker_easy', 'managed_available',
           'open_source'],
    pros: [
      'Built into Nextcloud — no separate service to maintain',
      'Video calls with SIP bridge and phone dial-in support',
      'File sharing, calendar, and chat in one platform',
      'Easy deployment if you already run Nextcloud',
    ],
    cons: [
      'Requires Nextcloud — not a standalone chat server',
      'Chat features less polished than dedicated platforms',
      'Heavy resource usage if running full Nextcloud suite',
      'Threaded conversations limited compared to Zulip',
    ],
    dockerCompose: `services:
  nextcloud:
    image: nextcloud:latest
    ports: ["80:80"]
    volumes:
      - nc_data:/var/www/html
    environment:
      NEXTCLOUD_TRUSTED_DOMAINS: localhost
volumes:
  nc_data:`,
  },
]

type WeightMap = Partial<Record<Tag, number>>

export const SCENARIO_WEIGHTS: Record<keyof WizardOption, Record<string, WeightMap>> = {
  team: {
    solo:           { solo: 3, lightweight: 2, single_binary: 1 },
    small_team:     { small_team: 3, real_time: 2, api_rich: 1, webhooks: 1 },
    large_team:     { large_team: 3, threaded: 2, rbac: 2, audit_log: 1, ldap: 1, sso_saml: 1 },
    enterprise:     { enterprise: 3, rbac: 3, audit_log: 3, sso_saml: 2, ldap: 2, air_gapped: 2 },
  },
  style: {
    threaded:       { threaded: 3, api_rich: 1 },
    real_time:      { real_time: 3, slack_compatible: 2, discord_like: 2 },
    voice_first:    { voice_calls: 3, video_calls: 2, screen_sharing: 2 },
    omnichannel:    { omnichannel: 3, live_chat: 2, chatbots: 2, crm_integration: 2 },
  },
  priority: {
    privacy:        { e2e_encryption: 3, federation: 2, on_premise: 2, air_gapped: 1 },
    features:       { api_rich: 3, webhooks: 2, chatbots: 2, bridges: 2, crm_integration: 1 },
    simplicity:     { docker_easy: 3, lightweight: 2, single_binary: 2, slack_compatible: 1 },
    cost:           { open_source: 3, lightweight: 2, single_binary: 1 },
  },
  deploy: {
    docker:         { docker_easy: 3 },
    kubernetes:     { kubernetes: 3, docker_easy: 1 },
    single_binary:  { single_binary: 3, lightweight: 2 },
    managed:        { managed_available: 3, docker_easy: 1 },
  },
}
