import { CronExpressionParser } from 'cron-parser'
import type { Dialect } from './types'

const FIELD_NAMES = ['minute', 'hour', 'day of month', 'month', 'day of week'] as const

export function parseCron(expression: string, dialect: Dialect = 'unix') {
  const unixExpr = toUnix(expression, dialect)
  const interval = CronExpressionParser.parse(unixExpr)
  const nextRuns = Array.from({ length: 10 }, () => interval.next().toDate())
  const humanReadable = explainCron(unixExpr)

  return {
    expression: unixExpr,
    dialect,
    humanReadable,
    nextRuns,
  }
}

export function getNextRuns(expression: string, count = 10): Date[] {
  try {
    const interval = CronExpressionParser.parse(expression)
    return Array.from({ length: count }, () => interval.next().toDate())
  } catch {
    return []
  }
}

export function explainCron(expression: string): string {
  const parts = expression.trim().split(/\s+/)
  if (parts.length < 5) return 'Invalid cron expression'

  const [minute, hour, dayOfMonth, month, dayOfWeek] = parts

  const segments: string[] = []

  // Frequency
  if (minute === '*' && hour === '*' && dayOfMonth === '*' && month === '*' && dayOfWeek === '*') {
    return 'Every minute'
  }
  if (minute.startsWith('*/') && hour === '*' && dayOfMonth === '*' && month === '*') {
    const n = minute.slice(2)
    return `Every ${n} minutes`
  }
  if (hour.startsWith('*/') && dayOfMonth === '*' && month === '*') {
    const n = hour.slice(2)
    return minute === '0' ? `Every ${n} hours` : `Every ${n} hours at minute ${minute}`
  }

  // Time
  if (hour.startsWith('*/')) {
    const n = hour.slice(2)
    segments.push(minute === '0' ? `every ${n} hours` : `every ${n} hours at minute ${minute}`)
  } else if (minute !== '*' && hour !== '*') {
    const m = minute.padStart(2, '0')
    if (hour.includes(',') || hour.includes('-')) {
      const hours = expandField(hour, Array.from({ length: 24 }, (_, i) => {
        const ampm = i >= 12 ? 'PM' : 'AM'
        const h12 = i === 0 ? 12 : i > 12 ? i - 12 : i
        return `${h12} ${ampm}`
      }))
      segments.push(`at ${m} past ${hours.join(', ')}`)
    } else {
      const h = parseInt(hour, 10)
      const ampm = h >= 12 ? 'PM' : 'AM'
      const h12 = h === 0 ? 12 : h > 12 ? h - 12 : h
      segments.push(`at ${h12}:${m} ${ampm}`)
    }
  } else if (hour !== '*') {
    segments.push(`at hour ${hour}`)
  }

  // Day of week
  if (dayOfWeek !== '*') {
    const days = expandField(dayOfWeek, ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'])
    segments.push(`on ${days.join(', ')}`)
  }

  // Day of month
  if (dayOfMonth !== '*' && dayOfWeek === '*') {
    if (dayOfMonth.includes(',')) {
      segments.push(`on day ${dayOfMonth} of the month`)
    } else {
      segments.push(`on day ${dayOfMonth} of the month`)
    }
  }

  // Month
  if (month !== '*') {
    const months = expandField(month, ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'])
    segments.push(`in ${months.join(', ')}`)
  }

  if (segments.length === 0) return expression

  const prefix = dayOfMonth === '*' && month === '*' && dayOfWeek === '*' ? 'Runs' : 'Runs'
  return `${prefix} ${segments.join(', ')}`
}

function expandField(field: string, labels: string[]): string[] {
  if (field.includes(',')) {
    return field.split(',').map(v => {
      const n = parseInt(v, 10)
      return labels[n] ?? v
    })
  }
  if (field.includes('-')) {
    const [start, end] = field.split('-').map(Number)
    const result: string[] = []
    for (let i = start; i <= end; i++) {
      result.push(labels[i] ?? String(i))
    }
    return result
  }
  if (field.startsWith('*/')) {
    return [`every ${field.slice(2)}`]
  }
  const n = parseInt(field, 10)
  return [labels[n] ?? field]
}

// Convert any dialect to Unix 5-field cron
export function toUnix(expression: string, dialect: Dialect): string {
  if (dialect === 'unix') return expression

  const parts = expression.trim().split(/\s+/)

  if (dialect === 'quartz') {
    // Quartz: seconds min hour day month dow [year]
    // Drop seconds field (parts[0]), convert ? to *
    const unixParts = parts.slice(1, 6).map(p => p === '?' ? '*' : p)
    return unixParts.join(' ')
  }

  if (dialect === 'aws') {
    // AWS EventBridge: cron(min hour day-of-month month day-of-week year)
    // Strip cron() wrapper if present
    let cleaned = expression.trim()
    if (cleaned.startsWith('cron(') && cleaned.endsWith(')')) {
      cleaned = cleaned.slice(5, -1)
    }
    const awsParts = cleaned.split(/\s+/)
    // AWS has 6 fields: min hour day-of-month month day-of-week year
    // Drop year
    return awsParts.slice(0, 5).map(p => p === '?' ? '*' : p).join(' ')
  }

  return expression
}

export function fromUnix(expression: string, targetDialect: Dialect): string {
  if (targetDialect === 'unix') return expression

  const parts = expression.trim().split(/\s+/)

  if (targetDialect === 'quartz') {
    // Add seconds=0, convert day-of-week * to ?
    const dow = parts[4] === '*' ? '?' : parts[4]
    const dom = parts[2] === '*' ? '?' : parts[2]
    return ['0', parts[0], parts[1], dom, parts[3], dow].join(' ')
  }

  if (targetDialect === 'aws') {
    // AWS: cron(min hour day-of-month month day-of-week year)
    const dow = parts[4] === '*' ? '?' : parts[4]
    const dom = parts[2] === '*' ? '?' : parts[2]
    return `cron(${parts[0]} ${parts[1]} ${dom} ${parts[3]} ${dow} *)`
  }

  return expression
}

export function isValidCron(expression: string): boolean {
  try {
    CronExpressionParser.parse(expression)
    return true
  } catch {
    return false
  }
}

export { FIELD_NAMES }
