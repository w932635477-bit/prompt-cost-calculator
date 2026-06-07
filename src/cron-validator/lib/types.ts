import type { Dialect } from '../../cron/lib/types'

/** Extended dialect for validator — adds kubernetes */
export type ValidatorDialect = Dialect | 'kubernetes'

export const VALIDATOR_DIALECTS: { value: ValidatorDialect; label: string }[] = [
  { value: 'unix', label: 'Unix (5-field)' },
  { value: 'quartz', label: 'Quartz (6-7 field)' },
  { value: 'aws', label: 'AWS EventBridge' },
  { value: 'kubernetes', label: 'Kubernetes CronJob' },
]

export interface ValidationWarning {
  code: string
  message: string
  fix?: string
}

export interface ValidationError {
  code: string
  message: string
  fix?: string
}

export interface ValidationResult {
  valid: boolean
  expression: string
  dialect: ValidatorDialect
  /** Human-readable explanation of the expression */
  humanReadable?: string
  /** Next N run times */
  nextRuns?: Date[]
  /** Field-by-field breakdown */
  fieldBreakdown?: { value: string; label: string; meaning: string }[]
  /** Hard errors — expression is invalid */
  errors: ValidationError[]
  /** Warnings — expression is valid but may have issues */
  warnings: ValidationWarning[]
  /** Suggested fix for the expression */
  suggestedFix?: string
}

export interface ValidatorSubPage {
  slug: string
  dialect: ValidatorDialect
  title: string
  h1: string
  description: string
  twitterDescription?: string
  explanation: string
  faq: { q: string; a: string }[]
  keywords: string[]
  exampleExpressions: string[]
}
