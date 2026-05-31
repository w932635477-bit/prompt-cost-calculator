import { CronExpressionParser } from 'cron-parser'
import { toUnix, explainCron } from '../../cron/lib/cron-adapter'
import type { Dialect } from '../../cron/lib/types'
import { validateDialectConstraints } from './dialect-constraints'
import { explainError } from './error-explainer'
import type { ValidatorDialect, ValidationResult, ValidationWarning } from './types'

const UNIX_FIELD_LABELS = ['minute', 'hour', 'day of month', 'month', 'day of week']

export function validateExpression(expression: string, dialect: ValidatorDialect): ValidationResult {
  const trimmed = expression.trim()
  if (!trimmed) {
    return emptyResult(dialect)
  }

  // Step 1: Try cron-parser
  let parserPassed = false
  let parserError = ''
  let nextRuns: Date[] = []
  let humanReadable = ''
  let fieldBreakdown: { value: string; label: string; meaning: string }[] = []

  const cronDialect = dialect === 'kubernetes' ? 'unix' : dialect as Dialect

  try {
    const unixExpr = toUnix(trimmed, cronDialect)
    const interval = CronExpressionParser.parse(unixExpr)
    nextRuns = Array.from({ length: 5 }, () => interval.next().toDate())
    humanReadable = explainCron(unixExpr)
    parserPassed = true

    // Build field breakdown
    const parts = unixExpr.split(/\s+/)
    const labels = UNIX_FIELD_LABELS
    fieldBreakdown = parts.map((p, i) => ({
      value: p,
      label: labels[i] || `field ${i + 1}`,
      meaning: explainField(p, labels[i] || ''),
    }))
  } catch (e: unknown) {
    parserError = e instanceof Error ? e.message : String(e)
  }

  // Step 2: Dialect-specific constraints
  const { errors: dialectErrors, warnings: dialectWarnings } = validateDialectConstraints(trimmed, dialect)

  // Step 3: Combine results
  if (!parserPassed) {
    const explained = explainError(parserError)
    return {
      valid: false,
      expression: trimmed,
      dialect,
      errors: [
        {
          code: 'PARSE_ERROR',
          message: explained.message,
          fix: explained.fix,
        },
        ...dialectErrors,
      ],
      warnings: dialectWarnings,
    }
  }

  // Parser passed — check if dialect constraints failed
  const hasDialectErrors = dialectErrors.length > 0

  // Logical warnings (valid but may never fire)
  const logicalWarnings = checkLogicalIssues(trimmed, cronDialect)

  return {
    valid: !hasDialectErrors,
    expression: trimmed,
    dialect,
    humanReadable,
    nextRuns: hasDialectErrors ? undefined : nextRuns,
    fieldBreakdown: hasDialectErrors ? undefined : fieldBreakdown,
    errors: dialectErrors,
    warnings: [...dialectWarnings, ...logicalWarnings],
  }
}

function explainField(value: string, _label: string): string {
  if (value === '*') return 'every'
  if (value.startsWith('*/')) return `every ${value.slice(2)}`
  if (value.includes(',')) return `specific values: ${value}`
  if (value.includes('-')) return `range ${value}`
  return value
}

function checkLogicalIssues(expression: string, _dialect: Dialect): ValidationWarning[] {
  const warnings: ValidationWarning[] = []
  const parts = expression.trim().split(/\s+/)

  if (parts.length >= 5) {
    const dom = parts[2]
    const mon = parts[3]
    // February 30th / 31st
    if (mon === '2' && parseInt(dom) > 29) {
      warnings.push({
        code: 'IMPOSSIBLE_DATE',
        message: `February never has day ${dom}. This expression will never trigger.`,
      })
    }
    // Day 31 in months with 30 days
    if (dom === '31' && ['4', '6', '9', '11'].includes(mon)) {
      warnings.push({
        code: 'IMPOSSIBLE_DATE',
        message: `Month ${mon} has only 30 days. Day 31 will never match.`,
      })
    }
  }

  // Every minute warning
  if (expression.trim() === '* * * * *') {
    warnings.push({
      code: 'HIGH_FREQUENCY',
      message: 'This runs every minute. Make sure that is intentional.',
    })
  }

  return warnings
}

function emptyResult(dialect: ValidatorDialect): ValidationResult {
  return {
    valid: false,
    expression: '',
    dialect,
    errors: [],
    warnings: [],
  }
}
