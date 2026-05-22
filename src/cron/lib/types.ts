export type Dialect = 'unix' | 'quartz' | 'aws'

export interface CronField {
  label: string
  value: string
  options: { label: string; value: string }[]
}

export interface ParsedCron {
  expression: string
  dialect: Dialect
  humanReadable: string
  nextRuns: Date[]
}

export interface NaturalLanguagePattern {
  patterns: string[]
  cron: string
  description: string
}
