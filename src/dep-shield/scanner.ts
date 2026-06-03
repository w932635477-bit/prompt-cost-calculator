// src/dep-shield/scanner.ts
// npm dependency vulnerability scanner — parse package.json, query OSV API, generate fix commands

export type Severity = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW' | 'UNKNOWN'

export interface ParsedDep {
  name: string
  version: string
  isDev: boolean
}

export interface VulnResult {
  id: string
  summary: string
  severity: Severity
  packageName: string
  installedVersion: string
  fixedIn: string[]
  aliases: string[]
  url: string
}

export interface ScanResult {
  deps: ParsedDep[]
  vulns: VulnResult[]
  stats: {
    total: number
    critical: number
    high: number
    medium: number
    low: number
    unknown: number
    fixable: number
  }
}

export interface ApiCallLog {
  url: string
  status: number
  depsCount: number
  timestamp: number
}

const OSV_QUERY = 'https://api.osv.dev/v1/query'

// Parse semver range to a concrete version for OSV query
function extractVersion(version: string): string {
  const cleaned = version.replace(/^[\^~>=<]*\s*/, '').trim()
  if (!cleaned || cleaned === '*' || cleaned === 'latest') return ''
  const parts = cleaned.split(/\s+/)
  return parts[0].replace(/^>=?/, '')
}

export function parsePackageJson(text: string): ParsedDep[] {
  let pkg: Record<string, unknown>
  try {
    pkg = JSON.parse(text)
  } catch {
    return []
  }

  const deps: ParsedDep[] = []
  const dependencies = pkg.dependencies as Record<string, string> | undefined
  const devDependencies = pkg.devDependencies as Record<string, string> | undefined

  if (dependencies) {
    for (const [name, version] of Object.entries(dependencies)) {
      deps.push({ name, version, isDev: false })
    }
  }
  if (devDependencies) {
    for (const [name, version] of Object.entries(devDependencies)) {
      deps.push({ name, version, isDev: true })
    }
  }

  return deps
}

interface OsvVuln {
  id: string
  summary?: string
  severity?: Array<{ score: string; type: string }>
  database_specific?: Record<string, unknown>
  affected?: Array<{
    package?: { name: string; ecosystem: string }
    ranges?: Array<{ type: string; events: Array<Record<string, string>> }>
  }>
  aliases?: string[]
  references?: Array<{ type: string; url: string }>
}

// Query OSV per package in parallel — returns full vuln details including severity
export async function scanVulnerabilities(
  deps: ParsedDep[],
  onLog?: (log: ApiCallLog) => void,
): Promise<VulnResult[]> {
  if (deps.length === 0) return []

  // Fire all queries in parallel (OSV handles concurrency well)
  const results = await Promise.all(
    deps.map(async (dep) => {
      const version = extractVersion(dep.version)
      const body = { package: { name: dep.name, ecosystem: 'npm' }, version: version || undefined }

      const timestamp = Date.now()
      const resp = await fetch(OSV_QUERY, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })

      onLog?.({ url: OSV_QUERY, status: resp.status, depsCount: 1, timestamp })

      if (!resp.ok) return []
      const data = await resp.json() as { vulns?: OsvVuln[] }

      return (data.vulns || []).map(vuln => mapVuln(vuln, dep))
    })
  )

  const allVulns = results.flat()

  // Deduplicate by vuln ID + package
  const seen = new Set<string>()
  return allVulns.filter(v => {
    const key = `${v.id}:${v.packageName}`
    if (seen.has(key)) return false
    seen.add(key)
    return true
  })
}

function mapVuln(vuln: OsvVuln, dep: ParsedDep): VulnResult {
  const severity = resolveSeverity(vuln)
  const fixedIn = extractFixedVersions(vuln, dep.name)
  const url = vuln.references?.find(r => r.type === 'ADVISORY')?.url
    || vuln.references?.find(r => r.type === 'WEB')?.url
    || `https://osv.dev/vulnerability/${vuln.id}`

  return {
    id: vuln.id,
    summary: vuln.summary || vuln.id,
    severity,
    packageName: dep.name,
    installedVersion: dep.version,
    fixedIn,
    aliases: vuln.aliases || [],
    url,
  }
}

// Try database_specific.severity first (reliable string), then CVSS vector
function resolveSeverity(vuln: OsvVuln): Severity {
  // Method 1: database_specific.severity — "HIGH", "CRITICAL", etc.
  const dbSev = vuln.database_specific?.severity
  if (typeof dbSev === 'string') {
    const upper = dbSev.toUpperCase()
    if (upper in SEVERITY_MAP) return SEVERITY_MAP[upper as keyof typeof SEVERITY_MAP]
  }

  // Method 2: CVSS vector string — parse base score from the vector
  if (vuln.severity && vuln.severity.length > 0) {
    const cvss = vuln.severity.find(s => s.type === 'CVSS_V3')
    if (cvss) {
      const score = parseCvssBaseScore(cvss.score)
      if (score >= 9.0) return 'CRITICAL'
      if (score >= 7.0) return 'HIGH'
      if (score >= 4.0) return 'MEDIUM'
      return 'LOW'
    }
  }

  return 'UNKNOWN'
}

const SEVERITY_MAP: Record<string, Severity> = {
  CRITICAL: 'CRITICAL',
  HIGH: 'HIGH',
  MEDIUM: 'MEDIUM',
  MODERATE: 'MEDIUM',
  LOW: 'LOW',
}

// Parse CVSS vector like "CVSS:3.1/AV:N/AC:H/PR:N/UI:N/S:U/C:H/I:L/A:L"
// Base score formula simplified: extract impact metrics and compute approximate score
function parseCvssBaseScore(vector: string): number {
  // If the score is a plain number (unusual but possible)
  const asNum = parseFloat(vector)
  if (!isNaN(asNum) && asNum >= 0 && asNum <= 10) return asNum

  // Parse vector metrics
  const parts = vector.split('/')
  const metrics: Record<string, string> = {}
  for (const p of parts) {
    const eq = p.indexOf(':')
    if (eq >= 0) {
      metrics[p.slice(0, eq)] = p.slice(eq + 1)
    }
  }

  // Simplified CVSS 3.1 base score approximation
  // Impact: C (Confidentiality), I (Integrity), A (Availability)
  const impactValues: Record<string, number> = { H: 0.56, L: 0.22, N: 0 }
  const c = impactValues[metrics.C] || 0
  const i = impactValues[metrics.I] || 0
  const a = impactValues[metrics.A] || 0
  const iss = 1 - ((1 - c) * (1 - i) * (1 - a))

  if (iss <= 0) return 0

  const exploitability = 0.85 * 0.77 * 0.55 // AV:N, AC:H (average), PR:N (average)
  const impact = 6.42 * iss
  const score = Math.min(10, impact + exploitability)

  return Math.round(score * 10) / 10
}

function extractFixedVersions(vuln: OsvVuln, packageName: string): string[] {
  const fixed: string[] = []
  for (const aff of vuln.affected || []) {
    if (aff.package?.name !== packageName) continue
    for (const range of aff.ranges || []) {
      for (const event of range.events) {
        if (event.fixed) fixed.push(event.fixed)
      }
    }
  }
  return fixed
}

export function computeStats(vulns: VulnResult[]): ScanResult['stats'] {
  const stats = { total: vulns.length, critical: 0, high: 0, medium: 0, low: 0, unknown: 0, fixable: 0 }
  for (const v of vulns) {
    const key = v.severity.toLowerCase() as keyof Omit<typeof stats, 'total' | 'fixable'>
    if (key in stats) stats[key]++
    if (v.fixedIn.length > 0) stats.fixable++
  }
  return stats
}

export function generateFixCommands(vulns: VulnResult[]): string[] {
  // Group vulns by package, collect ALL fix versions
  const byPackage = new Map<string, VulnResult[]>()
  for (const v of vulns) {
    if (v.fixedIn.length === 0) continue
    const list = byPackage.get(v.packageName) || []
    list.push(v)
    byPackage.set(v.packageName, list)
  }

  const commands: string[] = []
  for (const [name, vulnList] of byPackage) {
    // For each vuln, find the smallest fix version (first fix for the range covering installed version)
    const minFixes = vulnList.map(v => v.fixedIn[0]).filter(Boolean)
    // The command needs to fix ALL vulns, so use the max of the minimums
    // e.g. vuln A fixes in 4.19.2, vuln B fixes in 4.20.0 → need 4.20.0
    const targetVer = minFixes.sort(semverCompare).pop() || vulnList[0].fixedIn[0]
    commands.push(`npm install ${name}@${targetVer}`)
  }
  return commands.sort()
}

// Simple semver comparison: returns -1, 0, or 1
function semverCompare(a: string, b: string): number {
  const pa = a.replace(/^v/, '').split('.').map(Number)
  const pb = b.replace(/^v/, '').split('.').map(Number)
  for (let i = 0; i < 3; i++) {
    const na = pa[i] || 0
    const nb = pb[i] || 0
    if (na < nb) return -1
    if (na > nb) return 1
  }
  return 0
}

// Severity rank lookup
const _SEVERITY_RANK: Record<Severity, number> = {
  CRITICAL: 4, HIGH: 3, MEDIUM: 2, LOW: 1, UNKNOWN: 0,
}
void _SEVERITY_RANK

export const SEVERITY_COLORS: Record<Severity, string> = {
  CRITICAL: '#ff3b30',
  HIGH: '#ff9f0a',
  MEDIUM: '#ffcc00',
  LOW: '#30d158',
  UNKNOWN: '#86868b',
}

export const SEVERITY_BG: Record<Severity, string> = {
  CRITICAL: 'bg-[#ff3b30]',
  HIGH: 'bg-[#ff9f0a]',
  MEDIUM: 'bg-[#ffcc00]',
  LOW: 'bg-[#30d158]',
  UNKNOWN: 'bg-[#86868b]',
}

export function isValidPackageJson(text: string): boolean {
  try {
    const obj = JSON.parse(text)
    return typeof obj === 'object' && obj !== null && ('dependencies' in obj || 'devDependencies' in obj || 'name' in obj)
  } catch {
    return false
  }
}
