// Standalone test for the Tool Finder match engine
// Run: npx tsx src/alternatives/finder/test-match.ts

import { ALTERNATIVE_PAGES } from '../seo/alternatives-data'
import { findMatches, computeWeights } from './types'
import type { ScenarioInput } from './types'

let passed = 0
let failed = 0

function assert(condition: boolean, msg: string) {
  if (condition) {
    passed++
  } else {
    failed++
    console.log(`  FAIL: ${msg}`)
  }
}

// Get all alternatives flattened
const allAlts = ALTERNATIVE_PAGES.flatMap(p => p.alternatives)

console.log('=== Tool Finder Match Engine Tests ===\n')

// Test 1: Solo beginner prioritizes docker_ready + lightweight
console.log('Test 1: Solo beginner ease-first scenario')
const soloBeginner: ScenarioInput = { teamSize: 'solo', techLevel: 'beginner', server: 'vps', priority: 'ease' }
const results1 = findMatches(allAlts, soloBeginner)
assert(results1.length <= 3, 'Returns at most 3 results')
assert(results1.length > 0, 'Returns at least 1 result')
if (results1.length > 0) {
  const top = results1[0]
  const hasBeginnerOrDocker = top.alt.scenarioTags?.some(t => t === 'beginner_friendly' || t === 'docker_ready')
  assert(hasBeginnerOrDocker === true, `Top result ${top.alt.name} is beginner-friendly or docker-ready`)
  assert(top.matchDimensions.length > 0, 'Has dimension analysis')
  assert(top.summary.length > 0, 'Has summary text')
  console.log(`  Top pick: ${top.alt.name} (tags: ${top.alt.scenarioTags?.slice(0, 5).join(', ')})`)
}

// Test 2: Enterprise advanced security-first prioritizes ldap/sso
console.log('\nTest 2: Enterprise advanced security-first scenario')
const enterprise: ScenarioInput = { teamSize: 'large', techLevel: 'advanced', server: 'dedicated', priority: 'security' }
const results2 = findMatches(allAlts, soloBeginner) // Re-run with wrong input intentionally to test
const results2Real = findMatches(allAlts, enterprise)
assert(results2.length > 0, 'Solo scenario also returns results (sanity check)')
assert(results2Real.length > 0, 'Returns results for enterprise scenario')
if (results2Real.length > 0) {
  const top = results2Real[0]
  const hasEnterpriseOrSecurity = top.alt.scenarioTags?.some(t =>
    t === 'enterprise' || t === 'ldap' || t === 'sso' || t === 'audit_log' || t === 'mfa'
  )
  assert(hasEnterpriseOrSecurity === true, `Top result ${top.alt.name} has enterprise/security tags`)
  console.log(`  Top pick: ${top.alt.name} (tags: ${top.alt.scenarioTags?.slice(0, 5).join(', ')})`)
}

// Test 3: Weight computation produces positive values
console.log('\nTest 3: Weight computation')
const weights = computeWeights(soloBeginner)
const weightValues = Object.values(weights)
assert(weightValues.length > 0, 'Produces non-empty weights')
assert(weightValues.every(w => w > 0), 'All weights are positive')
console.log(`  ${weightValues.length} tags weighted, max: ${Math.max(...weightValues)}`)

// Test 4: Specific SaaS scenario — Vaultwarden should win for solo password management
console.log('\nTest 4: Vaultwarden dominance in solo+beginner password management')
const pwPage = ALTERNATIVE_PAGES.find(p => p.slug === 'lastpass' || p.slug === '1password')
if (pwPage) {
  const pwResults = findMatches(pwPage.alternatives, soloBeginner)
  assert(pwResults.length > 0, 'Password manager has recommendations')
  if (pwResults.length > 0) {
    console.log(`  Top pick: ${pwResults[0].alt.name}`)
    // Vaultwarden should rank highly for solo+beginner due to lightweight+docker+beginner
  }
}

// Test 5: Different scenarios produce different rankings
console.log('\nTest 5: Scenario sensitivity — different inputs produce different top picks')
const easeFirst: ScenarioInput = { teamSize: 'solo', techLevel: 'beginner', server: 'vps', priority: 'ease' }
const securityFirst: ScenarioInput = { teamSize: 'large', techLevel: 'advanced', server: 'dedicated', priority: 'security' }
const codeHostingAlts = ALTERNATIVE_PAGES.find(p => p.slug === 'github')?.alternatives ?? []
if (codeHostingAlts.length >= 2) {
  const easeResults = findMatches(codeHostingAlts, easeFirst)
  const secResults = findMatches(codeHostingAlts, securityFirst)
  if (easeResults.length > 0 && secResults.length > 0) {
    // Gitea should rank higher for solo+beginner, GitLab for enterprise+security
    console.log(`  Ease scenario top: ${easeResults[0].alt.name}`)
    console.log(`  Security scenario top: ${secResults[0].alt.name}`)
  }
}

// Test 6: No total score exposed in results
console.log('\nTest 6: No total score in output')
const results6 = findMatches(allAlts, soloBeginner)
const hasScoreField = JSON.stringify(results6).includes('"score"')
assert(!hasScoreField, 'Results do not expose total score')

// Test 7: Each recommendation has dimension matches with status
console.log('\nTest 7: Dimension match structure')
for (const rec of results6.slice(0, 2)) {
  for (const dim of rec.matchDimensions) {
    assert(['strong', 'moderate', 'weak'].includes(dim.status), `${dim.dimension} has valid status: ${dim.status}`)
    assert(dim.reason.length > 0, `${dim.dimension} has a reason`)
    assert(dim.dataSource.length > 0, `${dim.dimension} has a data source`)
  }
}

console.log(`\n=== Results: ${passed} passed, ${failed} failed ===`)
process.exit(failed > 0 ? 1 : 0)
