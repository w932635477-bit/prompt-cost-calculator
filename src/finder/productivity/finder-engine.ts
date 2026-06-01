// src/finder/productivity/finder-engine.ts
// Scoring engine: 4 dimensions × 15 tools → top 3 with per-dimension scores

import { PRODUCTIVITY_TOOLS, SCENARIO_WEIGHTS } from './finder-data'
import type { ProductivityTool, Tag, WizardOption, ToolCategory } from './finder-data'

export type Dimension = 'need' | 'team' | 'tech' | 'host'

export interface DimensionScore {
  dimension: Dimension
  score: number          // 0-10
  matchedTags: Tag[]
  reason: string
}

export interface Recommendation {
  tool: ProductivityTool
  rank: number
  totalScore: number
  dimensions: DimensionScore[]
  whyThis: string
  whyNotOthers: { tool: string; reason: string }[]
}

const DIMENSION_LABELS: Record<Dimension, string> = {
  need: 'Feature fit',
  team: 'Team fit',
  tech: 'Technical fit',
  host: 'Hosting fit',
}

const TAG_DESCRIPTIONS: Partial<Record<Tag, string>> = {
  // Category
  wiki: 'wiki/docs', project_management: 'project management', notes: 'notes',
  chat: 'team chat', automation: 'automation',
  // Team
  solo: 'solo-friendly', small_team: 'team-ready', enterprise: 'enterprise-grade',
  // Tech
  beginner: 'easy setup', intermediate: 'moderate setup', advanced: 'advanced config',
  // Host
  docker: 'Docker-ready', lightweight: 'lightweight', managed: 'managed hosting',
  full_control: 'full control', raspberry_pi: 'runs on Pi',
  // Features
  collaboration: 'real-time collab', kanban: 'kanban boards', gantt: 'Gantt charts',
  realtime_edit: 'live editing', e2e_encryption: 'E2E encryption',
  sso: 'SSO support', ldap: 'LDAP', rbac: 'role-based access',
  audit_log: 'audit logs', webhook: 'webhooks', api_access: 'API access',
  search: 'full-text search', markdown_native: 'native Markdown',
  mobile: 'mobile apps', desktop: 'desktop apps', web_only: 'web-based',
  scalable: 'scales well', plugin_ecosystem: 'rich plugins',
}

function scoreToolForDimension(tool: ProductivityTool, dim: Dimension, opt: WizardOption): DimensionScore {
  const optionKey = opt[dim] as string
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

const NEED_MULTIPLIER = 5

export function recommend(opt: WizardOption): Recommendation[] {
  const scored = PRODUCTIVITY_TOOLS.map(tool => {
    const dimensions: DimensionScore[] = (['need', 'team', 'tech', 'host'] as const)
      .map(d => scoreToolForDimension(tool, d, opt))
    const totalScore = dimensions.reduce((s, d) =>
      s + (d.dimension === 'need' ? d.score * NEED_MULTIPLIER : d.score), 0)
    return { tool, dimensions, totalScore }
  })

  scored.sort((a, b) => b.totalScore - a.totalScore)
  const top3 = scored.slice(0, 3)
  const others = scored.slice(3)

  return top3.map((entry, i) => {
    const whyThis = buildWhyThis(entry.tool, entry.dimensions, opt)
    const whyNot = others.slice(0, 2).map(o => ({
      tool: o.tool.name,
      reason: buildWhyNot(o.dimensions, opt),
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

/** Get the best tool from each OTHER category for "Pair It With" cross-recommendations */
export function crossCategoryRecommendations(opt: WizardOption, primaryCategory: ToolCategory): { category: ToolCategory; tool: ProductivityTool; score: number }[] {
  const otherCategories: ToolCategory[] = (['wiki', 'project_management', 'notes', 'chat', 'automation'] as const)
    .filter(c => c !== primaryCategory)

  return otherCategories.map(cat => {
    const tools = PRODUCTIVITY_TOOLS.filter(t => t.category === cat)
    let bestTool = tools[0]
    let bestScore = 0
    for (const tool of tools) {
      const dims = (['need', 'team', 'tech', 'host'] as const)
        .map(d => scoreToolForDimension(tool, d, opt))
      const total = dims.reduce((s, d) => s + d.score, 0)
      if (total > bestScore) {
        bestScore = total
        bestTool = tool
      }
    }
    return { category: cat, tool: bestTool, score: bestScore }
  }).sort((a, b) => b.score - a.score)
}

function buildWhyThis(tool: ProductivityTool, dims: DimensionScore[], opt: WizardOption): string {
  const top = [...dims].sort((a, b) => b.score - a.score)[0]
  const setting =
    opt.team === 'solo' ? 'a solo workflow' :
    opt.team === 'small_team' ? 'a small team' :
    'enterprise use'
  return `${tool.name} fits ${setting} thanks to ${top.reason}.`
}

function buildWhyNot(dims: DimensionScore[], opt: WizardOption): string {
  const weakest = [...dims].sort((a, b) => a.score - b.score)[0]
  return `Weak on ${DIMENSION_LABELS[weakest.dimension].toLowerCase()} for your "${opt[weakest.dimension]}" pick`
}

export const DIMENSION_LABEL = DIMENSION_LABELS
