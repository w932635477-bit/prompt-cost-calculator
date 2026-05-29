export type CSPDirective =
  | 'default-src' | 'script-src' | 'style-src' | 'img-src' | 'font-src'
  | 'connect-src' | 'media-src' | 'frame-src' | 'object-src'
  | 'base-uri' | 'form-action' | 'frame-ancestors'

export interface DirectiveConfig {
  enabled: boolean
  sources: string[]
  customDomains: string[]
}

export interface CSPPolicy {
  directives: Partial<Record<CSPDirective, DirectiveConfig>>
  reportOnly: boolean
  reportUri: string
  reportTo: string
  upgradeInsecure: boolean
  blockMixed: boolean
}

export const CSP_DIRECTIVES: { key: CSPDirective; label: string; hint: string; group: 'common' | 'advanced' }[] = [
  { key: 'default-src', label: 'default-src', hint: 'Fallback for all resource types', group: 'common' },
  { key: 'script-src', label: 'script-src', hint: 'Where JavaScript can load from', group: 'common' },
  { key: 'style-src', label: 'style-src', hint: 'Where CSS can load from', group: 'common' },
  { key: 'img-src', label: 'img-src', hint: 'Where images can load from', group: 'common' },
  { key: 'font-src', label: 'font-src', hint: 'Where web fonts can load from', group: 'common' },
  { key: 'connect-src', label: 'connect-src', hint: 'Where fetch, XHR, WebSocket can connect', group: 'common' },
  { key: 'media-src', label: 'media-src', hint: 'Where audio and video can load from', group: 'advanced' },
  { key: 'frame-src', label: 'frame-src', hint: 'Where iframes can load from', group: 'advanced' },
  { key: 'object-src', label: 'object-src', hint: 'Where plugins (Flash, Java) can load from', group: 'advanced' },
  { key: 'base-uri', label: 'base-uri', hint: 'Allowed URLs for the <base> element', group: 'advanced' },
  { key: 'form-action', label: 'form-action', hint: 'Where forms can submit to', group: 'advanced' },
  { key: 'frame-ancestors', label: 'frame-ancestors', hint: 'Who can embed this page in an iframe', group: 'advanced' },
]

export const DIRECTIVE_SOURCES: Record<CSPDirective, string[]> = {
  'default-src': ["'self'", "'none'", "'unsafe-inline'", "'unsafe-eval'", 'data:', 'blob:', 'https:', 'http:'],
  'script-src': ["'self'", "'none'", "'unsafe-inline'", "'unsafe-eval'", "'strict-dynamic'", "'unsafe-hashes'", "'wasm-unsafe-eval'", 'data:', 'blob:', 'https:', 'http:'],
  'style-src': ["'self'", "'none'", "'unsafe-inline'", "'unsafe-eval'", 'data:', 'blob:', 'https:', 'http:'],
  'img-src': ["'self'", "'none'", "'unsafe-inline'", 'data:', 'blob:', 'https:', 'http:', 'mediastream:'],
  'font-src': ["'self'", "'none'", 'data:', 'blob:', 'https:', 'http:'],
  'connect-src': ["'self'", "'none'", 'data:', 'blob:', 'https:', 'http:', 'mediastream:', 'filesystem:'],
  'media-src': ["'self'", "'none'", 'data:', 'blob:', 'https:', 'http:', 'mediastream:'],
  'frame-src': ["'self'", "'none'", 'data:', 'blob:', 'https:', 'http:'],
  'object-src': ["'self'", "'none'", 'data:', 'blob:', 'https:', 'http:'],
  'base-uri': ["'self'", "'none'"],
  'form-action': ["'self'", "'none'"],
  'frame-ancestors': ["'self'", "'none'"],
}

export const DIRECTIVE_ALLOWS_HOSTS: Record<CSPDirective, boolean> = {
  'default-src': true,
  'script-src': true,
  'style-src': true,
  'img-src': true,
  'font-src': true,
  'connect-src': true,
  'media-src': true,
  'frame-src': true,
  'object-src': true,
  'base-uri': false,
  'form-action': false,
  'frame-ancestors': false,
}

const DIRECTIVE_ORDER: CSPDirective[] = [
  'default-src', 'script-src', 'style-src', 'img-src', 'font-src', 'connect-src',
  'media-src', 'frame-src', 'object-src', 'base-uri', 'form-action', 'frame-ancestors',
]

const SOURCE_ORDER = [
  "'self'", "'none'", "'unsafe-inline'", "'unsafe-eval'",
  "'strict-dynamic'", "'unsafe-hashes'", "'wasm-unsafe-eval'",
  'data:', 'blob:', 'mediastream:', 'filesystem:', 'https:', 'http:',
]

function sanitizeDomain(input: string): string | null {
  const trimmed = input.trim()
  if (!trimmed) return null
  if (trimmed.includes('\n') || trimmed.includes('\r') || trimmed.includes(';')) return null
  const cleaned = trimmed.replace(/^https?:\/\//, '').replace(/\/$/, '')
  if (!cleaned) return null
  if (/[;\n\r]/.test(cleaned)) return null
  return cleaned
}

export function cleanDomains(domains: string[]): string[] {
  const seen = new Set<string>()
  const result: string[] = []
  for (const d of domains) {
    const cleaned = sanitizeDomain(d)
    if (cleaned && !seen.has(cleaned.toLowerCase())) {
      seen.add(cleaned.toLowerCase())
      result.push(cleaned)
    }
  }
  return result
}

function sortSources(sources: string[]): string[] {
  return [...sources].sort((a, b) => {
    const ai = SOURCE_ORDER.indexOf(a)
    const bi = SOURCE_ORDER.indexOf(b)
    if (ai !== -1 && bi !== -1) return ai - bi
    if (ai !== -1) return -1
    if (bi !== -1) return 1
    return a.localeCompare(b)
  })
}

export function buildCSPValue(policy: CSPPolicy): string {
  const parts: string[] = []

  for (const dir of DIRECTIVE_ORDER) {
    const config = policy.directives[dir]
    if (!config || !config.enabled) continue

    let sources = [...config.sources]
    const domains = cleanDomains(config.customDomains)

    if (sources.includes("'none'")) {
      sources = ["'none'"]
    } else {
      sources = sortSources(sources.filter(s => s !== "'none'"))
    }

    const allSources = DIRECTIVE_ALLOWS_HOSTS[dir]
      ? [...sources, ...domains]
      : sources

    if (allSources.length === 0) continue
    parts.push(`${dir} ${allSources.join(' ')}`)
  }

  if (policy.upgradeInsecure) {
    parts.push('upgrade-insecure-requests')
  }
  if (policy.blockMixed) {
    parts.push('block-all-mixed-content')
  }

  if (policy.reportUri) {
    parts.push(`report-uri ${policy.reportUri}`)
  }

  return parts.join('; ')
}

export function buildCSPHeader(policy: CSPPolicy): string {
  const value = buildCSPValue(policy)
  const name = policy.reportOnly
    ? 'Content-Security-Policy-Report-Only'
    : 'Content-Security-Policy'
  return `${name}: ${value}`
}

export function createDefaultPolicy(): CSPPolicy {
  return {
    directives: {
      'default-src': { enabled: true, sources: ["'self'"], customDomains: [] },
    },
    reportOnly: false,
    reportUri: '',
    reportTo: '',
    upgradeInsecure: false,
    blockMixed: false,
  }
}

export interface CSPPreset {
  name: string
  description: string
  policy: CSPPolicy
}

export const PRESETS: CSPPreset[] = [
  {
    name: 'Strict',
    description: "Maximum security — only same-origin resources",
    policy: {
      directives: {
        'default-src': { enabled: true, sources: ["'none'"], customDomains: [] },
        'script-src': { enabled: true, sources: ["'self'"], customDomains: [] },
        'style-src': { enabled: true, sources: ["'self'"], customDomains: [] },
        'img-src': { enabled: true, sources: ["'self'"], customDomains: [] },
        'font-src': { enabled: true, sources: ["'self'"], customDomains: [] },
        'connect-src': { enabled: true, sources: ["'self'"], customDomains: [] },
        'base-uri': { enabled: true, sources: ["'self'"], customDomains: [] },
        'form-action': { enabled: true, sources: ["'self'"], customDomains: [] },
      },
      reportOnly: false, reportUri: '', reportTo: '',
      upgradeInsecure: true, blockMixed: true,
    },
  },
  {
    name: 'Moderate',
    description: "Allows inline styles and scripts from same origin",
    policy: {
      directives: {
        'default-src': { enabled: true, sources: ["'self'"], customDomains: [] },
        'script-src': { enabled: true, sources: ["'self'", "'unsafe-inline'"], customDomains: [] },
        'style-src': { enabled: true, sources: ["'self'", "'unsafe-inline'"], customDomains: [] },
        'img-src': { enabled: true, sources: ["'self'", 'data:'], customDomains: [] },
        'font-src': { enabled: true, sources: ["'self'"], customDomains: [] },
        'connect-src': { enabled: true, sources: ["'self'"], customDomains: [] },
      },
      reportOnly: false, reportUri: '', reportTo: '',
      upgradeInsecure: false, blockMixed: false,
    },
  },
  {
    name: 'Basic',
    description: "Same-origin default — minimal restrictions",
    policy: {
      directives: {
        'default-src': { enabled: true, sources: ["'self'"], customDomains: [] },
      },
      reportOnly: false, reportUri: '', reportTo: '',
      upgradeInsecure: true, blockMixed: false,
    },
  },
]
