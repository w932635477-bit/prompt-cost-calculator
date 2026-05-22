import type { NaturalLanguagePattern } from './types'

const PATTERNS: NaturalLanguagePattern[] = [
  // Every N minutes
  { patterns: ['every 1 minute', 'every minute', 'every 1 min', '每分钟'], cron: '* * * * *', description: 'Every minute' },
  { patterns: ['every 2 minutes', 'every 2 mins', '每2分钟'], cron: '*/2 * * * *', description: 'Every 2 minutes' },
  { patterns: ['every 5 minutes', 'every 5 mins', '每5分钟'], cron: '*/5 * * * *', description: 'Every 5 minutes' },
  { patterns: ['every 10 minutes', 'every 10 mins', '每10分钟'], cron: '*/10 * * * *', description: 'Every 10 minutes' },
  { patterns: ['every 15 minutes', 'every 15 mins', '每15分钟'], cron: '*/15 * * * *', description: 'Every 15 minutes' },
  { patterns: ['every 20 minutes', 'every 20 mins', '每20分钟'], cron: '*/20 * * * *', description: 'Every 20 minutes' },
  { patterns: ['every 30 minutes', 'every 30 mins', 'half hour', '每30分钟', '每半小时'], cron: '*/30 * * * *', description: 'Every 30 minutes' },

  // Hourly
  { patterns: ['every hour', 'every 1 hour', 'hourly', '每小时'], cron: '0 * * * *', description: 'Every hour' },
  { patterns: ['every 2 hours', '每2小时'], cron: '0 */2 * * *', description: 'Every 2 hours' },
  { patterns: ['every 3 hours', '每3小时'], cron: '0 */3 * * *', description: 'Every 3 hours' },
  { patterns: ['every 4 hours', '每4小时'], cron: '0 */4 * * *', description: 'Every 4 hours' },
  { patterns: ['every 6 hours', '每6小时'], cron: '0 */6 * * *', description: 'Every 6 hours' },
  { patterns: ['every 12 hours', '每12小时'], cron: '0 */12 * * *', description: 'Every 12 hours' },

  // Daily
  { patterns: ['every day', 'daily', '每天', '每日'], cron: '0 0 * * *', description: 'Every day at midnight' },
  { patterns: ['every day at 9am', 'daily at 9am', '每天9点'], cron: '0 9 * * *', description: 'Every day at 9:00 AM' },
  { patterns: ['every day at 9pm', '每天晚上9点'], cron: '0 21 * * *', description: 'Every day at 9:00 PM' },
  { patterns: ['every day at noon', '每天中午'], cron: '0 12 * * *', description: 'Every day at noon' },
  { patterns: ['every day at midnight', '每天午夜'], cron: '0 0 * * *', description: 'Every day at midnight' },

  // Weekdays
  { patterns: ['weekdays', 'weekday', 'every weekday', '工作日', '周一到周五'], cron: '0 9 * * 1-5', description: 'Weekdays at 9:00 AM' },
  { patterns: ['weekdays at 9am', '工作日9点'], cron: '0 9 * * 1-5', description: 'Weekdays at 9:00 AM' },
  { patterns: ['weekdays at 8am', '工作日8点'], cron: '0 8 * * 1-5', description: 'Weekdays at 8:00 AM' },
  { patterns: ['weekdays at 5pm', '工作日5点'], cron: '0 17 * * 1-5', description: 'Weekdays at 5:00 PM' },

  // Weekly
  { patterns: ['every monday', 'weekly', '每周一', '每周'], cron: '0 0 * * 1', description: 'Every Monday at midnight' },
  { patterns: ['every monday at 9am', '每周一9点'], cron: '0 9 * * 1', description: 'Every Monday at 9:00 AM' },
  { patterns: ['every tuesday', '每周二'], cron: '0 0 * * 2', description: 'Every Tuesday at midnight' },
  { patterns: ['every friday', '每周五'], cron: '0 0 * * 5', description: 'Every Friday at midnight' },
  { patterns: ['every sunday', '每周日'], cron: '0 0 * * 0', description: 'Every Sunday at midnight' },

  // Monthly
  { patterns: ['every month', 'monthly', '每月', '每月1号'], cron: '0 0 1 * *', description: 'First day of every month at midnight' },
  { patterns: ['every 1st', 'every 1st of month'], cron: '0 0 1 * *', description: '1st of every month' },
  { patterns: ['every 15th', 'every 15th of month', '每月15号'], cron: '0 0 15 * *', description: '15th of every month' },
  { patterns: ['first day of month', '每月第一天'], cron: '0 0 1 * *', description: 'First day of month' },

  // Yearly
  { patterns: ['every year', 'yearly', '每年', '每年1月1号'], cron: '0 0 1 1 *', description: 'January 1st at midnight' },

  // Specific times
  { patterns: ['every day at 6am', '每天早上6点'], cron: '0 6 * * *', description: 'Every day at 6:00 AM' },
  { patterns: ['every day at 8am', '每天早上8点'], cron: '0 8 * * *', description: 'Every day at 8:00 AM' },
  { patterns: ['every day at 10am', '每天10点'], cron: '0 10 * * *', description: 'Every day at 10:00 AM' },

  // Weekends
  { patterns: ['weekends', 'weekend', 'every weekend', '周末'], cron: '0 0 * * 0,6', description: 'Weekends at midnight' },
  { patterns: ['every saturday', '每周六'], cron: '0 0 * * 6', description: 'Every Saturday at midnight' },
]

export function parseNaturalLanguage(input: string): { cron: string; description: string } | null {
  const normalized = input.toLowerCase().trim()

  // Exact match
  for (const pattern of PATTERNS) {
    if (pattern.patterns.includes(normalized)) {
      return { cron: pattern.cron, description: pattern.description }
    }
  }

  // Partial match (input contains pattern or vice versa)
  for (const pattern of PATTERNS) {
    for (const p of pattern.patterns) {
      if (normalized.includes(p) || p.includes(normalized)) {
        return { cron: pattern.cron, description: pattern.description }
      }
    }
  }

  return null
}

export function getSuggestions(input: string, limit = 3): NaturalLanguagePattern[] {
  if (!input.trim()) {
    return PATTERNS.slice(0, limit)
  }

  const normalized = input.toLowerCase().trim()
  const scored = PATTERNS.map(pattern => {
    const bestScore = Math.max(
      ...pattern.patterns.map(p => {
        if (p.includes(normalized)) return p.length - normalized.length
        if (normalized.includes(p)) return normalized.length - p.length
        return levenshtein(normalized, p)
      })
    )
    return { pattern, score: bestScore }
  })

  scored.sort((a, b) => a.score - b.score)
  return scored.slice(0, limit).map(s => s.pattern)
}

export function getAllPatterns(): NaturalLanguagePattern[] {
  return PATTERNS
}

function levenshtein(a: string, b: string): number {
  const m = a.length
  const n = b.length
  const dp: number[][] = Array.from({ length: m + 1 }, () => Array(n + 1).fill(0))

  for (let i = 0; i <= m; i++) dp[i][0] = i
  for (let j = 0; j <= n; j++) dp[0][j] = j

  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      dp[i][j] = a[i - 1] === b[j - 1]
        ? dp[i - 1][j - 1]
        : 1 + Math.min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1])
    }
  }

  return dp[m][n]
}
