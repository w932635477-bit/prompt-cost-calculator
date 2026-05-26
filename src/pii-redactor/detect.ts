// src/pii-redactor/detect.ts
// PII detection — 4 high-confidence categories. Pure regex, no network, no storage.
//
// Per Codex review: kept tight — only categories with low false-positive rate.
// Each match has a confidence tier: 'high' | 'possible' | 'review'.

export type PIIType = 'email' | 'phone' | 'api_key' | 'credit_card'
export type Confidence = 'high' | 'possible' | 'review'

export interface PIIMatch {
  type: PIIType
  value: string
  start: number
  end: number
  confidence: Confidence
  reason?: string
}

export const PII_LABELS: Record<PIIType, string> = {
  email: 'Email',
  phone: 'Phone',
  api_key: 'API Key',
  credit_card: 'Credit Card',
}

const EMAIL_RE = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b/g

// Phone: North American + simple international with country code
// Matches: (415) 555-0123, 415-555-0123, +1-415-555-0123, +44 20 7946 0958
const PHONE_RE = /(?<![\w./-])(?:\+\d{1,3}[ -]?)?(?:\(?\d{2,4}\)?[ -]?)?\d{3,4}[ -]?\d{4}(?![\w-])/g

// API keys — match well-known prefixed formats only (low false positive)
const API_KEY_PATTERNS: { name: string; re: RegExp }[] = [
  { name: 'OpenAI', re: /\bsk-[A-Za-z0-9_-]{20,}\b/g },
  { name: 'Anthropic', re: /\bsk-ant-[A-Za-z0-9_-]{20,}\b/g },
  { name: 'AWS Access Key', re: /\b(AKIA|ASIA)[A-Z0-9]{16}\b/g },
  { name: 'GitHub PAT', re: /\b(ghp|gho|ghs|ghu|ghr)_[A-Za-z0-9]{36,}\b/g },
  { name: 'Google API', re: /\bAIza[A-Za-z0-9_-]{35}\b/g },
  { name: 'Stripe', re: /\b(sk|pk|rk)_(test|live)_[A-Za-z0-9]{24,}\b/g },
  { name: 'Slack Bot', re: /\bxox[abposr]-[A-Za-z0-9-]{10,}\b/g },
]

// Credit card: 13-19 digits separated by spaces or dashes, then Luhn-validated
const CARD_RE = /(?<![\d-])(?:\d[ -]?){12,18}\d(?![\d-])/g

function luhn(num: string): boolean {
  const digits = num.replace(/\D/g, '')
  if (digits.length < 13 || digits.length > 19) return false
  let sum = 0
  let alt = false
  for (let i = digits.length - 1; i >= 0; i--) {
    let n = parseInt(digits[i], 10)
    if (alt) {
      n *= 2
      if (n > 9) n -= 9
    }
    sum += n
    alt = !alt
  }
  return sum % 10 === 0
}

function brandFromBin(num: string): string | null {
  const d = num.replace(/\D/g, '')
  if (/^4/.test(d)) return 'Visa'
  if (/^5[1-5]/.test(d) || /^2[2-7]/.test(d)) return 'Mastercard'
  if (/^3[47]/.test(d)) return 'Amex'
  if (/^6(?:011|5)/.test(d)) return 'Discover'
  return null
}

export function detectPII(text: string): PIIMatch[] {
  const matches: PIIMatch[] = []

  // Email — high confidence
  for (const m of text.matchAll(EMAIL_RE)) {
    matches.push({
      type: 'email',
      value: m[0],
      start: m.index!,
      end: m.index! + m[0].length,
      confidence: 'high',
    })
  }

  // API keys — high confidence (prefixed, low FP)
  for (const { name, re } of API_KEY_PATTERNS) {
    for (const m of text.matchAll(re)) {
      matches.push({
        type: 'api_key',
        value: m[0],
        start: m.index!,
        end: m.index! + m[0].length,
        confidence: 'high',
        reason: name,
      })
    }
  }

  // Credit card — Luhn-validated only
  for (const m of text.matchAll(CARD_RE)) {
    const digits = m[0].replace(/\D/g, '')
    if (digits.length < 13 || digits.length > 19) continue
    if (!luhn(m[0])) continue
    const brand = brandFromBin(m[0])
    matches.push({
      type: 'credit_card',
      value: m[0],
      start: m.index!,
      end: m.index! + m[0].length,
      confidence: brand ? 'high' : 'possible',
      reason: brand || undefined,
    })
  }

  // Phone — possible (mid false-positive rate; needs review)
  for (const m of text.matchAll(PHONE_RE)) {
    const digits = m[0].replace(/\D/g, '')
    if (digits.length < 10 || digits.length > 15) continue
    matches.push({
      type: 'phone',
      value: m[0],
      start: m.index!,
      end: m.index! + m[0].length,
      confidence: 'possible',
      reason: 'Verify it is actually a phone number',
    })
  }

  // Sort by position, dedupe overlaps (keep higher confidence)
  matches.sort((a, b) => a.start - b.start)
  const filtered: PIIMatch[] = []
  for (const m of matches) {
    const last = filtered[filtered.length - 1]
    if (last && m.start < last.end) {
      // overlap — keep the one with higher confidence
      const order = { high: 3, possible: 2, review: 1 }
      if (order[m.confidence] > order[last.confidence]) {
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
  matches: (PIIMatch & { placeholder: string })[]
}

export function redact(text: string, matches: PIIMatch[]): RedactionResult {
  const counters: Record<PIIType, number> = {
    email: 0,
    phone: 0,
    api_key: 0,
    credit_card: 0,
  }

  // Build placeholder for each match in order
  const labeled = matches.map(m => {
    counters[m.type] += 1
    const placeholder = `[${m.type.toUpperCase()}_${counters[m.type]}]`
    return { ...m, placeholder }
  })

  // Apply replacements right-to-left to keep indices valid
  let redacted = text
  for (let i = labeled.length - 1; i >= 0; i--) {
    const m = labeled[i]
    redacted = redacted.slice(0, m.start) + m.placeholder + redacted.slice(m.end)
  }

  return { redacted, matches: labeled }
}
