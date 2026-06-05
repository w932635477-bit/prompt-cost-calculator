// src/local-llm-privacy/detect.ts
// Local LLM config privacy scanner — 6 categories. Pure regex, no network, no storage.

export type RiskType = 'outbound_endpoint' | 'telemetry' | 'api_key' | 'auto_update' | 'data_leak' | 'insecure_setting'
export type Severity = 'critical' | 'high' | 'medium' | 'low'
export type ConfigFormat = 'ollama' | 'lmstudio' | 'jan' | 'unknown'

export interface PrivacyMatch {
  type: RiskType
  label: string
  value: string
  line: number
  severity: Severity
  description: string
  fix: string
}

export const TYPE_LABELS: Record<RiskType, string> = {
  outbound_endpoint: 'Outbound Endpoint',
  telemetry: 'Telemetry / Analytics',
  api_key: 'Hardcoded API Key',
  auto_update: 'Auto-Update / Callback',
  data_leak: 'Data Leakage Risk',
  insecure_setting: 'Insecure Setting',
}

export const SEVERITY_COLORS: Record<Severity, string> = {
  critical: '#ff3b30',
  high: '#ff9f0a',
  medium: '#ffcc00',
  low: '#34c759',
}

// Detect config format from content
export function detectFormat(text: string): ConfigFormat {
  const trimmed = text.trim()
  if (trimmed.startsWith('FROM ') || /^FROM\s+/m.test(trimmed) || /^PARAMETER\s+/m.test(trimmed)) {
    return 'ollama'
  }
  if (/"modelPath"|"model_id"|"completionParams"|"inferenceParams"/.test(trimmed)) {
    return 'lmstudio'
  }
  if (/"baseUrl"|"data_folder"|"api_version"/.test(trimmed) && /"model"/.test(trimmed)) {
    return 'jan'
  }
  return 'unknown'
}

// Outbound endpoint patterns
const OUTBOUND_ENDPOINT_RE = /https?:\/\/[^\s"'<>,;)\]]+/g

// Telemetry/analytics keywords in keys or values
const TELEMETRY_KEY_RE = /(?:telemetry|analytics|tracking|metrics|sentry|amplitude|mixpanel|segment|posthog|datadog|newrelic|bugsnag|rollbar)/i
const TELEMETRY_VALUE_TRUE_RE = /(?:true|1|yes|enabled|on)/i

// API key patterns (same cloud providers as env-scanner)
const API_KEY_PATTERNS: { name: string; re: RegExp }[] = [
  { name: 'OpenAI API Key', re: /\bsk-(?!ant-)(?:proj-)?[A-Za-z0-9_-]{20,}\b/g },
  { name: 'Anthropic API Key', re: /\bsk-ant-[A-Za-z0-9_-]{20,}\b/g },
  { name: 'AWS Access Key', re: /\b(?:AKIA|ASIA)[A-Z0-9]{16}\b/g },
  { name: 'GCP API Key', re: /\bAIza[A-Za-z0-9_-]{35}\b/g },
  { name: 'HuggingFace Token', re: /\bhf_[A-Za-z0-9]{34}\b/g },
  { name: 'Generic Bearer Token', re: /\b(?:Bearer\s+)?[A-Za-z0-9_-]{40,}\b/g },
]

// Auto-update / callback URL patterns
const AUTO_UPDATE_KEY_RE = /(?:update|upgrade|callback|webhook|notify|ping|report)/i
const CALLBACK_URL_RE = /(?:webhook|callback|notify|ping)[_-]?(?:url|endpoint|uri)/i

// Insecure settings
const INSECURE_SETTINGS: { key: RegExp; value: RegExp; desc: string; fix: string }[] = [
  { key: /(?:cors|allow_origin)/i, value: /\*/, desc: 'CORS allows all origins (*)', fix: 'Restrict CORS to specific domains' },
  { key: /(?:ssl|tls|verify_ssl|verify_tls|verify)/i, value: /(?:false|disabled|0|no)/i, desc: 'SSL/TLS verification disabled', fix: 'Enable SSL certificate verification' },
  { key: /(?:auth|authentication|require_auth)/i, value: /(?:false|disabled|0|no)/i, desc: 'Authentication disabled', fix: 'Enable authentication for API access' },
  { key: /(?:debug|verbose)/i, value: /(?:true|1|yes|enabled)/i, desc: 'Debug/verbose mode enabled', fix: 'Disable debug mode in production' },
  { key: /(?:host|bind|listen)/i, value: /0\.0\.0\.0/, desc: 'Listening on all interfaces (0.0.0.0)', fix: 'Bind to localhost (127.0.0.1) only' },
  { key: /(?:allow|enable)_?ip/i, value: /\*/, desc: 'IP allowlist set to wildcard (*)', fix: 'Restrict to specific IP addresses' },
]

// Extract key-value pairs from any format:
//   Ollama: "PARAMETER telemetry true", "ENV KEY val", "HOST 0.0.0.0"
//   JSON/YAML: "telemetry": true, telemetry=true
function extractKV(line: string): { key: string; value: string } | null {
  // JSON/YAML: key: value or key=value
  const jsonMatch = line.match(/["']?(\w+)["']?\s*[:=]\s*["']?([^"',}\s]+)["']?/)
  if (jsonMatch) return { key: jsonMatch[1], value: jsonMatch[2] }

  // Ollama: PARAMETER <key> <value>
  const paramMatch = line.match(/^PARAMETER\s+(\S+)\s+(.+)$/i)
  if (paramMatch) return { key: paramMatch[1], value: paramMatch[2].trim() }

  // Ollama: ENV <key> <value>
  const envMatch = line.match(/^ENV\s+(\S+)\s+(.+)$/i)
  if (envMatch) return { key: envMatch[1], value: envMatch[2].trim() }

  // Ollama: HOST <value> (key is "host")
  const hostMatch = line.match(/^HOST\s+(.+)$/i)
  if (hostMatch) return { key: 'host', value: hostMatch[1].trim() }

  return null
}

export function scanConfig(text: string): PrivacyMatch[] {
  const matches: PrivacyMatch[] = []
  const lines = text.split('\n')

  // 1. Outbound endpoints — scan for URLs that phone home
  const urlSet = new Set<string>()
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]
    OUTBOUND_ENDPOINT_RE.lastIndex = 0
    for (const m of line.matchAll(OUTBOUND_ENDPOINT_RE)) {
      const url = m[0]
      // Skip common local/innocent URLs
      if (/^(?:https?:\/\/)?(?:localhost|127\.0\.0\.1|0\.0\.0\.0|::1|\[::1\])/.test(url)) continue
      // Skip huggingface model download URLs (expected behavior)
      if (/huggingface\.co\/(?:api\/)?models\//.test(url)) continue
      // Skip obvious model repos
      if (/\/models\//.test(url) && /\.(gguf|bin|safetensors|onnx)/.test(url)) continue

      if (!urlSet.has(url)) {
        urlSet.add(url)
        const isTelemetry = TELEMETRY_KEY_RE.test(lines[Math.max(0, i - 1)] + line) ||
          TELEMETRY_KEY_RE.test(lines[Math.min(lines.length - 1, i + 1)] + line)

        if (isTelemetry) {
          matches.push({
            type: 'telemetry', label: 'Telemetry Endpoint', value: url,
            line: i + 1, severity: 'high',
            description: `Config contains a telemetry/analytics endpoint: ${url}`,
            fix: 'Set telemetry to false/off, or block the endpoint via firewall',
          })
        } else {
          matches.push({
            type: 'outbound_endpoint', label: 'Outbound Network URL', value: url,
            line: i + 1, severity: 'medium',
            description: `Config references an external endpoint: ${url}`,
            fix: 'Verify this URL is necessary. Block if unused.',
          })
        }
      }
    }
  }

  // 2. Telemetry flags in key-value pairs
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]
    const kv = extractKV(line)
    if (!kv) continue
    const { key, value } = kv
    if (TELEMETRY_KEY_RE.test(key) && TELEMETRY_VALUE_TRUE_RE.test(value)) {
      // Check not already flagged as telemetry endpoint
      const alreadyTelemetry = matches.some(m => m.line === i + 1 && m.type === 'telemetry')
      if (!alreadyTelemetry) {
        matches.push({
          type: 'telemetry', label: 'Telemetry Enabled', value: `${key}: ${value}`,
          line: i + 1, severity: 'high',
          description: `Telemetry/analytics is enabled: "${key}" = "${value}"`,
          fix: `Set "${key}" to false/off to disable telemetry`,
        })
      }
    }
  }

  // 3. API keys hardcoded in config
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]
    for (const { name, re } of API_KEY_PATTERNS) {
      re.lastIndex = 0
      for (const m of line.matchAll(re)) {
        // Skip Generic Bearer if a more specific key already matched this exact span
        if (name === 'Generic Bearer Token') {
          const alreadyMatched = matches.some(
            existing => existing.type === 'api_key' && existing.line === i + 1
              && existing.label !== 'Generic Bearer Token'
          )
          if (alreadyMatched) continue
        }
        matches.push({
          type: 'api_key', label: name, value: m[0].slice(0, 12) + '***',
          line: i + 1, severity: 'critical',
          description: `Hardcoded ${name} found in config file`,
          fix: 'Move API keys to environment variables. Never commit them in config files.',
        })
      }
    }
  }

  // 4. Auto-update / callback URLs
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]
    if (CALLBACK_URL_RE.test(line) || AUTO_UPDATE_KEY_RE.test(line)) {
      const urlMatch = line.match(OUTBOUND_ENDPOINT_RE)
      if (urlMatch) {
        const alreadyFound = matches.some(m => m.line === i + 1 && m.value === urlMatch[0])
        if (!alreadyFound) {
          matches.push({
            type: 'auto_update', label: 'Auto-Update / Callback', value: urlMatch[0],
            line: i + 1, severity: 'medium',
            description: `Config contains an auto-update or callback URL: ${urlMatch[0]}`,
            fix: 'Disable auto-updates or review the callback URL for data exposure.',
          })
        }
      }
    }
  }

  // 5. Data leakage risks — local paths, log files
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]
    // Home directory paths
    const homeMatch = line.match(/["']?(\/(?:home|Users)\/[^"'\s,;)\]]+)/)
    if (homeMatch) {
      matches.push({
        type: 'data_leak', label: 'Local Path Exposure', value: homeMatch[1],
        line: i + 1, severity: 'low',
        description: `Config contains a local filesystem path: ${homeMatch[1]}`,
        fix: 'Avoid exposing local paths in shared configs.',
      })
    }
    // Log files
    if (/["']?.*\.log["']?/.test(line) && !/^\s*#/.test(line)) {
      matches.push({
        type: 'data_leak', label: 'Log File Reference', value: line.trim(),
        line: i + 1, severity: 'low',
        description: 'Config references a log file — may contain sensitive request data',
        fix: 'Ensure logs are rotated and not publicly accessible.',
      })
    }
  }

  // 6. Insecure settings
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]
    const kv = extractKV(line)
    if (!kv) continue
    const { key, value } = kv
    for (const rule of INSECURE_SETTINGS) {
      if (rule.key.test(key) && rule.value.test(value)) {
        matches.push({
          type: 'insecure_setting', label: 'Insecure Setting', value: `${key}: ${value}`,
          line: i + 1, severity: 'high',
          description: rule.desc,
          fix: rule.fix,
        })
      }
    }
  }

  // Sort by severity then line number
  const severityOrder: Record<Severity, number> = { critical: 4, high: 3, medium: 2, low: 1 }
  matches.sort((a, b) => {
    const sevDiff = severityOrder[b.severity] - severityOrder[a.severity]
    if (sevDiff !== 0) return sevDiff
    return a.line - b.line
  })

  return matches
}
