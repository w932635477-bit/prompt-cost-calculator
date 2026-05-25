import type { ScenarioTag, SelfHostedAlt } from '../seo/alternatives-data'

export interface ScenarioInput {
  teamSize: 'solo' | 'small' | 'large'
  techLevel: 'beginner' | 'intermediate' | 'advanced'
  server: 'vps' | 'dedicated' | 'nas' | 'shared'
  priority: 'ease' | 'features' | 'performance' | 'security'
}

export interface DimensionMatch {
  dimension: string
  status: 'strong' | 'moderate' | 'weak'
  reason: string
  dataSource: string
}

export interface Recommendation {
  alt: SelfHostedAlt
  matchDimensions: DimensionMatch[]
  summary: string
}

type TagWeights = Partial<Record<ScenarioTag, number>>

// Each dimension contributes weights independently.
// Final weight for a tag = sum of contributions from all 4 dimensions.

const TEAM_SIZE_WEIGHTS: Record<ScenarioInput['teamSize'], TagWeights> = {
  solo: { solo_dev: 4, lightweight: 3, low_resource: 3, raspberry_pi: 2 },
  small: { small_team: 4, collaboration: 3, sharing: 2, api_access: 2 },
  large: { enterprise: 4, scalable: 4, ldap: 3, sso: 3, rbac: 3, audit_log: 3, high_availability: 2, mfa: 2 },
}

const TECH_LEVEL_WEIGHTS: Record<ScenarioInput['techLevel'], TagWeights> = {
  beginner: { beginner_friendly: 4, docker_ready: 3, lightweight: 2, web_only: 1 },
  intermediate: { intermediate: 3, docker_ready: 2, api_access: 2 },
  advanced: { advanced_setup: 3, sso: 2, ldap: 2, federation: 2 },
}

const SERVER_WEIGHTS: Record<ScenarioInput['server'], TagWeights> = {
  vps: { docker_ready: 3, lightweight: 2, low_resource: 2, scalable: 1 },
  dedicated: { scalable: 3, high_availability: 3, enterprise: 2 },
  nas: { raspberry_pi: 3, low_resource: 3, lightweight: 3, docker_ready: 2, backup: 2 },
  shared: { beginner_friendly: 3, lightweight: 3, web_only: 2 },
}

const PRIORITY_WEIGHTS: Record<ScenarioInput['priority'], TagWeights> = {
  ease: { beginner_friendly: 4, docker_ready: 4, lightweight: 3, web_only: 2 },
  features: { collaboration: 3, api_access: 3, webhook: 2, automation: 2, search: 2, rest_api: 2, graphql: 2 },
  performance: { scalable: 4, lightweight: 2, low_resource: 2, high_availability: 2 },
  security: { e2e_encryption: 4, mfa: 3, ldap: 3, sso: 3, audit_log: 3, zero_knowledge: 3, rbac: 3, saml: 2 },
}

function computeWeights(input: ScenarioInput): TagWeights {
  const combined: TagWeights = {}
  const sources = [
    TEAM_SIZE_WEIGHTS[input.teamSize],
    TECH_LEVEL_WEIGHTS[input.techLevel],
    SERVER_WEIGHTS[input.server],
    PRIORITY_WEIGHTS[input.priority],
  ]
  for (const weights of sources) {
    for (const [tag, w] of Object.entries(weights)) {
      combined[tag as ScenarioTag] = (combined[tag as ScenarioTag] ?? 0) + w
    }
  }
  return combined
}

function scoreAlternative(alt: SelfHostedAlt, weights: TagWeights): number {
  if (!alt.scenarioTags?.length) return 0
  let score = 0
  for (const tag of alt.scenarioTags) {
    score += weights[tag] ?? 0
  }
  return score
}

// Match analysis per dimension
function analyzeDimensions(
  alt: SelfHostedAlt,
  input: ScenarioInput,
): DimensionMatch[] {
  const tags = new Set(alt.scenarioTags ?? [])
  const dims: DimensionMatch[] = []

  // Deployment ease
  const easeTags = ['docker_ready', 'beginner_friendly', 'lightweight'] as const
  const easeHits = easeTags.filter(t => tags.has(t)).length
  if (input.priority === 'ease' || input.techLevel === 'beginner') {
    dims.push({
      dimension: 'Deployment Ease',
      status: easeHits >= 2 ? 'strong' : easeHits >= 1 ? 'moderate' : 'weak',
      reason: easeHits >= 2
        ? `${alt.name} is ${alt.docker ? 'Docker-ready' : 'easy to install'} and beginner-friendly`
        : easeHits >= 1
          ? `${alt.name} supports ${alt.docker ? 'Docker' : 'simple setup'} but may need some configuration`
          : `${alt.name} requires more setup effort`,
      dataSource: 'Project documentation',
    })
  }

  // Team fit
  const teamTag = input.teamSize === 'solo' ? 'solo_dev' : input.teamSize === 'small' ? 'small_team' : 'enterprise'
  const teamHit = tags.has(teamTag as ScenarioTag)
  if (teamHit) {
    dims.push({
      dimension: 'Team Fit',
      status: 'strong',
      reason: `Designed for ${input.teamSize === 'solo' ? 'individual use' : input.teamSize === 'small' ? 'small teams' : 'enterprise'}`,
      dataSource: 'Feature analysis',
    })
  }

  // Security
  if (input.priority === 'security') {
    const secTags = ['e2e_encryption', 'mfa', 'ldap', 'sso', 'audit_log', 'rbac'] as const
    const secHits = secTags.filter(t => tags.has(t)).length
    dims.push({
      dimension: 'Security',
      status: secHits >= 3 ? 'strong' : secHits >= 1 ? 'moderate' : 'weak',
      reason: secHits >= 3
        ? `Strong security: supports ${secTags.filter(t => tags.has(t)).join(', ')}`
        : secHits >= 1
          ? `Basic security features available`
          : `Limited built-in security features`,
      dataSource: 'Feature analysis',
    })
  }

  // Scalability
  if (input.teamSize === 'large' || input.priority === 'performance') {
    const scaleHit = tags.has('scalable') || tags.has('high_availability')
    dims.push({
      dimension: 'Scalability',
      status: scaleHit ? 'strong' : 'moderate',
      reason: scaleHit ? 'Supports scaling and high availability' : 'May have limits under heavy load',
      dataSource: 'Project documentation',
    })
  }

  // Collaboration (for teams)
  if (input.teamSize !== 'solo') {
    const collabTags = ['collaboration', 'sharing', 'api_access'] as const
    const collabHits = collabTags.filter(t => tags.has(t)).length
    if (collabHits > 0) {
      dims.push({
        dimension: 'Collaboration',
        status: collabHits >= 2 ? 'strong' : 'moderate',
        reason: `Supports ${collabTags.filter(t => tags.has(t)).join(' and ')}`,
        dataSource: 'Feature analysis',
      })
    }
  }

  // Maintenance activity (only when GitHub data is available)
  if (alt.maintenanceStatus) {
    const stars = alt.githubStars
    const lastCommit = alt.lastCommitDate
    const status: DimensionMatch['status'] =
      alt.maintenanceStatus === 'active' ? 'strong' :
      alt.maintenanceStatus === 'maintenance' ? 'moderate' : 'weak'
    const starsText = typeof stars === 'number'
      ? stars >= 1000 ? `${(stars / 1000).toFixed(1)}k stars` : `${stars} stars`
      : 'unknown stars'
    const commitText = lastCommit ? `last commit ${lastCommit}` : 'no recent activity'
    dims.push({
      dimension: 'Maintenance Activity',
      status,
      reason: `${starsText}, ${commitText} (${alt.maintenanceStatus})`,
      dataSource: `GitHub API (${new Date().toISOString().slice(0, 10)})`,
    })
  }

  return dims
}

function generateSummary(alt: SelfHostedAlt, dims: DimensionMatch[], input: ScenarioInput): string {
  const strongDims = dims.filter(d => d.status === 'strong')
  const parts: string[] = []

  if (strongDims.length > 0) {
    parts.push(strongDims.map(d => d.dimension.toLowerCase()).join(' and '))
  }

  if (input.priority === 'ease') {
    parts.push(alt.docker ? 'Docker one-command deploy' : 'straightforward setup')
  }

  if (parts.length > 0) {
    return `Good fit for your scenario: strong in ${parts.join(', ')}.`
  }
  return `A viable option that covers your basic needs.`
}

export function findMatches(
  alternatives: SelfHostedAlt[],
  input: ScenarioInput,
  maxResults = 3,
): Recommendation[] {
  const weights = computeWeights(input)

  const scored = alternatives
    .map(alt => ({
      alt,
      score: scoreAlternative(alt, weights),
    }))
    .filter(({ score }) => score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, maxResults)

  return scored.map(({ alt }) => {
    const matchDimensions = analyzeDimensions(alt, input)
    return {
      alt,
      matchDimensions,
      summary: generateSummary(alt, matchDimensions, input),
    }
  })
}

export { computeWeights, scoreAlternative }
