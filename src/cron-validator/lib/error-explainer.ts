import type { ValidationError } from './types'

/** Map cron-parser error messages to human-readable explanations with fix suggestions */
const ERROR_PATTERNS: { pattern: RegExp; message: string; fix: string }[] = [
  {
    pattern: /Expected 5 fields/i,
    message: 'Wrong number of fields. Unix cron requires exactly 5 fields separated by spaces.',
    fix: 'Use format: minute hour day-of-month month day-of-week (e.g., */5 * * * *)',
  },
  {
    pattern: /Expected [67] fields/i,
    message: 'Wrong number of fields for this dialect.',
    fix: 'Check the field count matches your target platform.',
  },
  {
    pattern: /invalid cron expression/i,
    message: 'The expression could not be parsed. Check for typos or unsupported characters.',
    fix: 'Each field can contain: numbers, *, ranges (1-5), steps (*/5), or lists (1,3,5).',
  },
]

interface ExplainedError {
  message: string
  fix: string
}

export function explainError(rawError: string, _field?: string): ExplainedError {
  // Field-specific errors
  const fieldMatch = rawError.match(/(?:bad|invalid)\s+(minute|hour|day of month|month|day of week|second)/i)
  if (fieldMatch) {
    const fieldName = fieldMatch[1].toLowerCase()
    const ranges: Record<string, string> = {
      minute: '0-59',
      hour: '0-23',
      'day of month': '1-31',
      month: '1-12',
      'day of week': '0-6 (0=Sunday)',
      second: '0-59',
    }
    const range = ranges[fieldName] || 'check docs'
    return {
      message: `Invalid value in the "${fieldName}" field.`,
      fix: `The "${fieldName}" field accepts values in range ${range}. Check for out-of-range numbers or unsupported characters.`,
    }
  }

  // Pattern matching
  for (const p of ERROR_PATTERNS) {
    if (p.pattern.test(rawError)) {
      return { message: p.message, fix: p.fix }
    }
  }

  // Fallback
  return {
    message: rawError || 'Unable to parse the cron expression.',
    fix: 'Check the syntax matches your selected dialect. Each field should be a valid number, *, range, step, or list.',
  }
}

/** Convert a ValidationErrorCode to a user-friendly summary */
export function summarizeErrors(errors: ValidationError[]): string {
  if (errors.length === 0) return ''
  if (errors.length === 1) return errors[0].message
  return `${errors.length} issues found. First: ${errors[0].message}`
}
