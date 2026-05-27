// src/finder/chat/finder-engine.ts
// Scoring engine: 4 dimensions × 6 tools → top 3 with per-dimension scores

import { CHAT_TOOLS, SCENARIO_WEIGHTS } from './finder-data'
import type { ChatTool, Tag, WizardOption } from './finder-data'

export type Dimension = 'team' | 'style' | 'priority' | 'deploy'

export interface DimensionScore {
  dimension: Dimension
  score: number
  matchedTags: Tag[]
  reason: string
}

export interface Recommendation {
  tool: ChatTool
  rank: number
  totalScore: number
  dimensions: DimensionScore[]
  whyThis: string
  whyNotOthers: { tool: string; reason: string }[]
}

const DIMENSION_LABELS: Record<Dimension, string> = {
  team: 'Team fit',
  style: 'Communication style',
  priority: 'Priority match',
  deploy: 'Deployment fit',
}

const TAG_DESCRIPTIONS: Partial<Record<Tag, string>> = {
  solo: 'solo-friendly',
  small_team: 'small-team ready',
  large_team: 'scales to 200+',
  enterprise: 'enterprise-grade',
  threaded: 'threaded topics',
  real_time: 'real-time chat',
  voice_calls: 'voice calls',
  video_calls: 'video calls',
  screen_sharing: 'screen sharing',
  e2e_encryption: 'E2E encryption',
  federation: 'federation',
  on_premise: 'on-premise',
  air_gapped: 'air-gapped',
  ldap: 'LDAP',
  sso_saml: 'SSO/SAML',
  rbac: 'role-based access',
  audit_log: 'audit logs',
  slack_compatible: 'Slack-like UX',
  discord_like: 'Discord-like UX',
  api_rich: 'rich API',
  webhooks: 'webhooks',
  bridges: 'protocol bridges',
  omnichannel: 'omnichannel',
  chatbots: 'chatbots',
  live_chat: 'live chat',
  crm_integration: 'CRM integration',
  docker_easy: 'Docker-ready',
  kubernetes: 'K8s support',
  single_binary: 'single binary',
  lightweight: 'lightweight',
  managed_available: 'managed hosting',
  open_source: 'open source',
  source_available: 'source available',
  mobile_ios: 'iOS app',
  mobile_android: 'Android app',
  desktop_app: 'desktop app',
  web_only: 'web-based',
}

function scoreToolForDimension(tool: ChatTool, dim: Dimension, opt: WizardOption): DimensionScore {
  const optionKey = opt[dim]
  const weights = SCENARIO_WEIGHTS[dim][optionKey] || {}
  const matched: Tag[] = []
  let raw = 0

  for (const [tag, weight] of Object.entries(weights) as [Tag, number][]) {
    if (tool.tags.includes(tag)) {
      matched.push(tag)
      raw += weight
    }
  }

  const maxRaw = Object.values(weights).reduce((s, v) => s + v, 0) || 1
  const score = Math.min(10, Math.round((raw / maxRaw) * 10))

  const matchedDescriptions = matched
    .map(t => TAG_DESCRIPTIONS[t])
    .filter((s): s is string => Boolean(s))
  const reason = matchedDescriptions.length > 0
    ? matchedDescriptions.slice(0, 3).join(' + ')
    : 'limited match — consider another option'

  return { dimension: dim, score, matchedTags: matched, reason }
}

export function recommend(opt: WizardOption): Recommendation[] {
  const scored = CHAT_TOOLS.map(tool => {
    const dimensions: DimensionScore[] = (['team', 'style', 'priority', 'deploy'] as const)
      .map(d => scoreToolForDimension(tool, d, opt))
    const totalScore = dimensions.reduce((s, d) => s + d.score, 0)
    return { tool, dimensions, totalScore }
  })

  scored.sort((a, b) => b.totalScore - a.totalScore)
  const top3 = scored.slice(0, 3)
  const others = scored.slice(3)

  return top3.map((entry, i) => {
    const whyThis = buildWhyThis(entry.tool, entry.dimensions, opt)
    const whyNot = others.slice(0, 2).map(o => ({
      tool: o.tool.name,
      reason: buildWhyNot(o.tool, o.dimensions, opt),
    }))

    return {
      tool: entry.tool,
      rank: i + 1,
      totalScore: entry.totalScore,
      dimensions: entry.dimensions,
      whyThis,
      whyNotOthers: whyNot,
    }
  })
}

function buildWhyThis(tool: ChatTool, dims: DimensionScore[], opt: WizardOption): string {
  const top = [...dims].sort((a, b) => b.score - a.score)[0]
  const reasonText = top.reason
  const setting =
    opt.team === 'solo' ? 'a solo setup' :
    opt.team === 'small_team' ? 'a small team' :
    opt.team === 'large_team' ? 'a large team' :
    'enterprise use'
  return `${tool.name} fits ${setting} thanks to ${reasonText}.`
}

function buildWhyNot(_tool: ChatTool, dims: DimensionScore[], opt: WizardOption): string {
  const weakest = [...dims].sort((a, b) => a.score - b.score)[0]
  return `Weak on ${DIMENSION_LABELS[weakest.dimension].toLowerCase()} for your "${opt[weakest.dimension]}" pick`
}

export const DIMENSION_LABEL = DIMENSION_LABELS
