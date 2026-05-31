import type { ValidatorDialect, ValidationWarning, ValidationError } from './types'

interface DialectRule {
  /** Allowed field counts */
  fieldCounts: number[]
  /** Tokens forbidden in this dialect */
  forbiddenTokens: string[]
  /** Platform-specific checks beyond basic parsing */
  extraChecks: (fields: string[]) => (ValidationWarning | ValidationError)[]
}

const DIALECT_RULES: Record<string, DialectRule> = {
  unix: {
    fieldCounts: [5],
    forbiddenTokens: ['?', 'L', 'W', '#'],
    extraChecks: () => [],
  },
  quartz: {
    fieldCounts: [6, 7],
    forbiddenTokens: [],
    extraChecks: (fields) => {
      const results: (ValidationWarning | ValidationError)[] = []
      const dom = fields[3]
      const dow = fields[5]
      // Quartz requires exactly one of DOM/DOW to be '?'
      if (dom !== '?' && dow !== '?') {
        results.push({
          code: 'QUARTZ_BOTH_SPECIFIED',
          message: 'Quartz requires day-of-month OR day-of-week to be "?", not both specified.',
          fix: dom === '*' ? `Change day-of-month to "?" → ${fields.slice(0, 3).join(' ')} ? ${fields[4]} ${dow}` : `Change day-of-week to "?" → ${fields.slice(0, 5).join(' ')} ?${fields.length > 6 ? ' ' + fields[6] : ''}`,
        })
      }
      return results
    },
  },
  aws: {
    fieldCounts: [6],
    forbiddenTokens: ['#'],
    extraChecks: (fields) => {
      const results: (ValidationWarning | ValidationError)[] = []
      const dom = fields[2]
      const dow = fields[4]
      // AWS EventBridge: day-of-month and day-of-week cannot both be * (one must be ?)
      if (dom !== '?' && dow !== '?') {
        results.push({
          code: 'AWS_BOTH_SPECIFIED',
          message: 'AWS EventBridge requires one of day-of-month or day-of-week to be "?".',
          fix: dom === '*' ? `Change day-of-month to "?" → ${fields[0]} ${fields[1]} ? ${fields[3]} ${dow} ${fields[5]}` : `Change day-of-week to "?" → ${fields[0]} ${fields[1]} ${dom} ${fields[3]} ? ${fields[5]}`,
        })
      }
      // AWS year field: must be * or a valid year — no range/step
      return results
    },
  },
  kubernetes: {
    fieldCounts: [5],
    forbiddenTokens: ['?', 'L', 'W', '#'],
    extraChecks: (fields) => {
      const results: (ValidationWarning | ValidationError)[] = []
      // K8s does not support @shorthand — that's caught by field count
      // K8s schedule field uses UTC by default
      results.push({
        code: 'K8S_UTC_DEFAULT',
        message: 'Kubernetes CronJobs use UTC by default. Set timeZone in spec if you need local time (K8s 1.27+).',
      })
      // Warn on very short intervals
      const minute = fields[0]
      if (minute === '*') {
        results.push({
          code: 'K8S_EVERY_MINUTE',
          message: 'Running every minute in Kubernetes can cause resource contention. Consider a longer interval.',
        })
      }
      return results
    },
  },
}

export function validateDialectConstraints(
  expression: string,
  dialect: ValidatorDialect,
): { errors: ValidationError[]; warnings: ValidationWarning[] } {
  const rule = DIALECT_RULES[dialect]
  if (!rule) return { errors: [], warnings: [] }

  const errors: ValidationError[] = []
  const warnings: ValidationWarning[] = []
  const parts = expression.trim().split(/\s+/)

  // Strip cron() wrapper for AWS
  let fields = parts
  if (dialect === 'aws' && expression.includes('cron(')) {
    const match = expression.match(/cron\((.+)\)/)
    if (match) fields = match[1].trim().split(/\s+/)
  }

  // Check field count
  if (!rule.fieldCounts.includes(fields.length)) {
    errors.push({
      code: 'FIELD_COUNT',
      message: `${dialectLabel(dialect)} expects ${rule.fieldCounts.join(' or ')} fields, got ${fields.length}.`,
      fix: dialect === 'unix' || dialect === 'kubernetes'
        ? 'Standard cron has 5 fields: minute hour day-of-month month day-of-week'
        : dialect === 'quartz'
          ? 'Quartz has 6-7 fields: seconds minute hour day-of-month month day-of-week [year]'
          : 'AWS EventBridge has 6 fields: minute hour day-of-month month day-of-week year',
    })
  }

  // Check forbidden tokens
  for (const token of rule.forbiddenTokens) {
    if (expression.includes(token)) {
      errors.push({
        code: 'FORBIDDEN_TOKEN',
        message: `"${token}" is not supported in ${dialectLabel(dialect)} cron expressions.`,
      })
    }
  }

  // Run dialect-specific checks
  if (errors.length === 0) {
    const extra = rule.extraChecks(fields)
    for (const item of extra) {
      if ('fix' in item && item.fix) {
        errors.push(item as ValidationError)
      } else {
        warnings.push(item as ValidationWarning)
      }
    }
  }

  return { errors, warnings }
}

function dialectLabel(d: ValidatorDialect): string {
  switch (d) {
    case 'unix': return 'Unix'
    case 'quartz': return 'Quartz'
    case 'aws': return 'AWS EventBridge'
    case 'kubernetes': return 'Kubernetes'
  }
}
