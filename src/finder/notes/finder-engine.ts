// src/finder/notes/finder-engine.ts
// Scoring engine: 4 dimensions × 7 tools → top 3 with per-dimension scores

import { NOTE_TOOLS, SCENARIO_WEIGHTS } from './finder-data'
import type { NoteTool, Tag, WizardOption } from './finder-data'

export type Dimension = 'team' | 'tech' | 'host' | 'need'

export interface DimensionScore {
  dimension: Dimension
  score: number          // 0-10
  matchedTags: Tag[]
  reason: string         // human-readable, e.g. "E2E encryption + local files"
}

export interface Recommendation {
  tool: NoteTool
  rank: number           // 1, 2, 3
  totalScore: number     // 0-40 sum (used internally for sorting; not shown)
  dimensions: DimensionScore[]
  whyThis: string        // 60-char fitting headline
  whyNotOthers: { tool: string; reason: string }[]  // 2 items
}

const DIMENSION_LABELS: Record<Dimension, string> = {
  team: 'Team fit',
  tech: 'Technical fit',
  host: 'Hosting fit',
  need: 'Feature fit',
}

const TAG_DESCRIPTIONS: Partial<Record<Tag, string>> = {
  solo: 'solo-friendly',
  small_team: 'team-ready',
  enterprise: 'enterprise-ready',
  beginner: 'easy setup',
  intermediate: 'moderate setup',
  advanced: 'advanced config',
  docker: 'Docker-ready',
  lightweight: 'low resource use',
  native_app: 'native apps',
  raspberry_pi: 'runs on Pi',
  collaboration: 'real-time collab',
  sharing: 'sharing built-in',
  wiki: 'wiki structure',
  database: 'databases',
  kanban: 'kanban boards',
  graph: 'graph view',
  e2e_encryption: 'E2E encryption',
  local_first: 'local-first',
  offline: 'works offline',
  rbac: 'role-based access',
  sso: 'SSO support',
  ldap: 'LDAP integration',
  audit_log: 'audit logs',
  mobile: 'mobile apps',
  desktop: 'desktop apps',
  plugin_ecosystem: 'rich plugins',
  markdown_native: 'native Markdown',
}

function scoreToolForDimension(tool: NoteTool, dim: Dimension, opt: WizardOption): DimensionScore {
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

  // Normalize: max raw is sum of weights = ~9, scale to 0-10
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
  const scored = NOTE_TOOLS.map(tool => {
    const dimensions: DimensionScore[] = (['team', 'tech', 'host', 'need'] as const)
      .map(d => scoreToolForDimension(tool, d, opt))
    const totalScore = dimensions.reduce((s, d) => s + d.score, 0)
    return { tool, dimensions, totalScore }
  })

  // Sort by totalScore desc, take top 3
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

function buildWhyThis(tool: NoteTool, dims: DimensionScore[], opt: WizardOption): string {
  // Pick the highest-scoring dimension as the headline reason
  const top = [...dims].sort((a, b) => b.score - a.score)[0]
  const reasonText = top.reason
  const setting =
    opt.team === 'solo' ? 'a solo workflow' :
    opt.team === 'small_team' ? 'a small team' :
    'enterprise use'
  return `${tool.name} fits ${setting} thanks to ${reasonText}.`
}

function buildWhyNot(_tool: NoteTool, dims: DimensionScore[], opt: WizardOption): string {
  // Pick the lowest-scoring dimension as the gap
  const weakest = [...dims].sort((a, b) => a.score - b.score)[0]
  return `Weak on ${DIMENSION_LABELS[weakest.dimension].toLowerCase()} for your "${opt[weakest.dimension]}" pick`
}

export const DIMENSION_LABEL = DIMENSION_LABELS
