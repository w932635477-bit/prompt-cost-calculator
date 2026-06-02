// src/env-scanner/detect.ts
// .env secret detection — 6 categories. Pure regex, no network, no storage.
// Pattern space is inherently complete (well-known key prefixes), unlike vulnerability DBs.

export type SecretType = 'cloud_api' | 'database_url' | 'auth_token' | 'private_key' | 'jwt' | 'generic_secret'
export type Severity = 'critical' | 'high' | 'medium'

export interface SecretMatch {
  type: SecretType
  label: string
  value: string
  start: number
  end: number
  severity: Severity
  envKey?: string
}

export const TYPE_LABELS: Record<SecretType, string> = {
  cloud_api: 'Cloud API Key',
  database_url: 'Database URL',
  auth_token: 'Auth Token',
  private_key: 'Private Key',
  jwt: 'JWT Token',
  generic_secret: 'Generic Secret',
}

export const SEVERITY_COLORS: Record<Severity, string> = {
  critical: '#ff3b30',
  high: '#ff9f0a',
  medium: '#ffcc00',
}

// Parse .env file into key-value pairs
export function parseEnvFile(text: string): Record<string, string> {
  const result: Record<string, string> = {}
  for (const line of text.split('\n')) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith('#')) continue
    const eqIdx = trimmed.indexOf('=')
    if (eqIdx < 0) continue
    const key = trimmed.slice(0, eqIdx).trim()
    let val = trimmed.slice(eqIdx + 1).trim()
    // Strip surrounding quotes
    if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
      val = val.slice(1, -1)
    }
    if (val) result[key] = val
  }
  return result
}

// Cloud API key patterns — prefixed, low false-positive
const CLOUD_PATTERNS: { name: string; re: RegExp }[] = [
  { name: 'OpenAI', re: /\bsk-(?!ant-)(?:proj-)?[A-Za-z0-9_-]{20,}\b/g },
  { name: 'Anthropic', re: /\bsk-ant-[A-Za-z0-9_-]{20,}\b/g },
  { name: 'AWS Access Key', re: /\b(?:AKIA|ASIA)[A-Z0-9]{16}\b/g },
  { name: 'GCP API Key', re: /\bAIza[A-Za-z0-9_-]{35}\b/g },
]

// Auth token patterns
const AUTH_PATTERNS: { name: string; re: RegExp }[] = [
  { name: 'GitHub PAT', re: /\b(?:ghp|gho|ghs|ghu|ghr)_[A-Za-z0-9]{36,}\b/g },
  { name: 'GitLab PAT', re: /\bglpat-[A-Za-z0-9_-]{20,}\b/g },
  { name: 'Slack Token', re: /\bxox[abposr]-[A-Za-z0-9-]{10,}\b/g },
  { name: 'Stripe Key', re: /\b(?:sk|pk|rk)_(?:test|live)_[A-Za-z0-9_]{24,}\b/g },
]

// Database URL with embedded password
const DB_URL_RE = /(?:postgres(?:ql)?|mysql|mongodb|redis|mssql|amqp):\/\/[^\s"']+/g

// Private key header
const PRIVATE_KEY_RE = /-----BEGIN\s+(?:RSA\s+)?(?:EC\s+)?(?:OPENSSH\s+)?(?:DSA\s+)?PRIVATE\s+KEY-----[\s\S]*?-----END\s+(?:RSA\s+)?(?:EC\s+)?(?:OPENSSH\s+)?(?:DSA\s+)?PRIVATE\s+KEY-----/g

// JWT pattern (three base64url segments separated by dots)
const JWT_RE = /\beyJ[A-Za-z0-9_-]+\.eyJ[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\b/g

// Generic secret: env var names containing password/secret/token/key with non-trivial values
const GENERIC_SECRET_NAMES = /^(?:.*(?:PASSWORD|SECRET|TOKEN|KEY|PRIVATE|AUTH).*)$/i

export function detectSecrets(text: string): SecretMatch[] {
  const matches: SecretMatch[] = []
  const envVars = parseEnvFile(text)

  // Build a lookup from value position back to env key name
  const valuePositions: { key: string; start: number; end: number }[] = []
  let pos = 0
  for (const line of text.split('\n')) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith('#')) { pos += line.length + 1; continue }
    const eqIdx = trimmed.indexOf('=')
    if (eqIdx < 0) { pos += line.length + 1; continue }
    const key = trimmed.slice(0, eqIdx).trim()
    let val = trimmed.slice(eqIdx + 1).trim()
    if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
      val = val.slice(1, -1)
    }
    const valStartInLine = line.indexOf(val, eqIdx)
    if (valStartInLine >= 0) {
      valuePositions.push({ key, start: pos + valStartInLine, end: pos + valStartInLine + val.length })
    }
    pos += line.length + 1
  }

  const findEnvKey = (start: number, end: number): string | undefined => {
    for (const vp of valuePositions) {
      if (start >= vp.start && end <= vp.end) return vp.key
    }
    return undefined
  }

  // 1. Cloud API keys (critical)
  for (const { name, re } of CLOUD_PATTERNS) {
    re.lastIndex = 0
    for (const m of text.matchAll(re)) {
      matches.push({
        type: 'cloud_api', label: name, value: m[0],
        start: m.index!, end: m.index! + m[0].length,
        severity: 'critical', envKey: findEnvKey(m.index!, m.index! + m[0].length),
      })
    }
  }

  // 2. Auth tokens (critical)
  for (const { name, re } of AUTH_PATTERNS) {
    re.lastIndex = 0
    for (const m of text.matchAll(re)) {
      matches.push({
        type: 'auth_token', label: name, value: m[0],
        start: m.index!, end: m.index! + m[0].length,
        severity: 'critical', envKey: findEnvKey(m.index!, m.index! + m[0].length),
      })
    }
  }

  // 3. Database URLs with passwords (high)
  for (const m of text.matchAll(DB_URL_RE)) {
    const url = m[0]
    // Check if URL contains a password (user:pass@host pattern)
    if (/\/\/[^:]+:[^@]+@/.test(url)) {
      matches.push({
        type: 'database_url', label: 'DB Connection String', value: url,
        start: m.index!, end: m.index! + url.length,
        severity: 'high', envKey: findEnvKey(m.index!, m.index! + url.length),
      })
    }
  }

  // 4. Private keys (critical)
  for (const m of text.matchAll(PRIVATE_KEY_RE)) {
    matches.push({
      type: 'private_key', label: 'Private Key', value: m[0].slice(0, 60) + '...',
      start: m.index!, end: m.index! + m[0].length,
      severity: 'critical', envKey: findEnvKey(m.index!, m.index! + m[0].length),
    })
  }

  // 5. JWT tokens (high)
  for (const m of text.matchAll(JWT_RE)) {
    matches.push({
      type: 'jwt', label: 'JWT Token', value: m[0],
      start: m.index!, end: m.index! + m[0].length,
      severity: 'high', envKey: findEnvKey(m.index!, m.index! + m[0].length),
    })
  }

  // 6. Generic secrets — env vars with sensitive names (medium)
  for (const [key, val] of Object.entries(envVars)) {
    if (GENERIC_SECRET_NAMES.test(key) && val.length > 4 && !val.includes('***')) {
      // Skip if already detected by a more specific pattern
      const alreadyFound = matches.some(m => m.envKey === key)
      if (!alreadyFound) {
        // Find the position of this value in the text
        const lineStart = text.indexOf(key)
        if (lineStart >= 0) {
          const valStart = text.indexOf(val, lineStart)
          if (valStart >= 0) {
            matches.push({
              type: 'generic_secret', label: `Sensitive Variable`, value: val,
              start: valStart, end: valStart + val.length,
              severity: 'medium', envKey: key,
            })
          }
        }
      }
    }
  }

  // Dedupe overlaps — keep higher severity
  matches.sort((a, b) => a.start - b.start)
  const severityOrder: Record<Severity, number> = { critical: 3, high: 2, medium: 1 }
  const filtered: SecretMatch[] = []
  for (const m of matches) {
    const last = filtered[filtered.length - 1]
    if (last && m.start < last.end) {
      if (severityOrder[m.severity] > severityOrder[last.severity]) {
        filtered[filtered.length - 1] = m
      }
      continue
    }
    filtered.push(m)
  }

  return filtered
}

export interface RedactionResult {
  redacted: string
  matches: (SecretMatch & { masked: string })[]
}

export function redactSecrets(text: string, matches: SecretMatch[]): RedactionResult {
  const counters: Record<SecretType, number> = {
    cloud_api: 0, database_url: 0, auth_token: 0,
    private_key: 0, jwt: 0, generic_secret: 0,
  }

  const labeled = matches.map(m => {
    counters[m.type] += 1
    // Mask: show first 4 chars, rest as dots
    const visible = Math.min(4, m.value.length)
    const masked = m.value.slice(0, visible) + '***'
    return { ...m, masked }
  })

  // Apply right-to-left to keep indices valid
  let redacted = text
  for (let i = labeled.length - 1; i >= 0; i--) {
    const m = labeled[i]
    redacted = redacted.slice(0, m.start) + m.masked + redacted.slice(m.end)
  }

  return { redacted, matches: labeled }
}
