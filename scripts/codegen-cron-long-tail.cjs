/**
 * codegen-cron-long-tail.cjs
 * Auto-generates rich explanation + FAQ for cron long-tail pages.
 * Reads long-tail-data.ts, enriches each page, writes back.
 *
 * Usage: node scripts/codegen-cron-long-tail.cjs --write
 */
const fs = require('fs')
const path = require('path')

const DATA_FILE = path.join(__dirname, '..', 'src', 'cron', 'seo', 'long-tail-data.ts')
const DRY_RUN = !process.argv.includes('--write')

// ─── Cron parsing helpers ───

const DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
const MONTH_NAMES = ['', 'January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']

function parseCron(expr) {
  // Handle @ shortcuts
  if (expr.startsWith('@')) {
    const shortcuts = {
      '@yearly': { minutes: [0], hours: [0], doms: [1], months: [1], dows: ['*'] },
      '@annually': { minutes: [0], hours: [0], doms: [1], months: [1], dows: ['*'] },
      '@monthly': { minutes: [0], hours: [0], doms: [1], months: ['*'], dows: ['*'] },
      '@weekly': { minutes: [0], hours: [0], doms: ['*'], months: ['*'], dows: [0] },
      '@daily': { minutes: [0], hours: [0], doms: ['*'], months: ['*'], dows: ['*'] },
      '@midnight': { minutes: [0], hours: [0], doms: ['*'], months: ['*'], dows: ['*'] },
      '@hourly': { minutes: [0], hours: ['*'], doms: ['*'], months: ['*'], dows: ['*'] },
      '@reboot': { special: 'reboot' },
    }
    return shortcuts[expr] || null
  }

  // Strip wrappers like cron(...) or rate(...)
  let clean = expr.replace(/^cron\(/, '').replace(/\)$/, '').replace(/^rate\(/, '').replace(/\)$/, '')

  // Handle non-standard multi-field (AWS 6-field, Quartz 7-field)
  const fields = clean.split(/\s+/)

  // Standard 5-field: minute hour dom month dow
  if (fields.length >= 5) {
    return {
      minute: fields[0],
      hour: fields[1],
      dom: fields[2],
      month: fields[3],
      dow: fields[4],
    }
  }
  return null
}

function expandField(field, max) {
  if (field === '*') return null // means "all"
  const vals = new Set()
  for (const part of field.split(',')) {
    if (part.includes('/')) {
      const [range, step] = part.split('/')
      const stepN = parseInt(step)
      let start = 0, end = max
      if (range !== '*') {
        const [s, e] = range.split('-').map(Number)
        start = s; end = e
      }
      for (let i = start; i <= end; i += stepN) vals.add(i)
    } else if (part.includes('-')) {
      const [s, e] = part.split('-').map(Number)
      for (let i = s; i <= e; i++) vals.add(i)
    } else {
      vals.add(parseInt(part))
    }
  }
  return [...vals].sort((a, b) => a - b)
}

function formatHour(h) {
  if (h === 0) return 'midnight'
  if (h === 12) return 'noon'
  if (h < 12) return `${h} AM`
  return `${h - 12} PM`
}

function formatHourShort(h) {
  if (h === 0) return '00:00'
  if (h < 10) return `0${h}:00`
  return `${h}:00`
}

// ─── Content generation ───

function classifyPage(page) {
  const expr = page.cron
  const slug = page.slug

  if (slug === 'every-minute') return 'every-minute'
  if (expr.startsWith('@')) return 'at-shortcut'

  const parsed = parseCron(expr)
  if (!parsed) return 'generic'

  const { minute, hour, dom, month, dow } = parsed

  // Every N minutes: */N * * * *
  if (/^\*\/\d+$/.test(minute) && hour === '*' && dom === '*' && month === '*' && dow === '*') {
    return 'every-n-minutes'
  }

  // Hourly at specific minute: N * * * *
  if (/^\d+$/.test(minute) && hour === '*' && dom === '*' && month === '*' && dow === '*') {
    return 'hourly-at-minute'
  }

  // Every N hours at specific minute: N */H * * *
  if (/^\d+$/.test(minute) && /^\*\/\d+$/.test(hour) && dom === '*' && month === '*' && dow === '*') {
    return 'every-n-hours'
  }

  // Daily at specific time: N H * * *
  if (/^\d+$/.test(minute) && /^\d+$/.test(hour) && dom === '*' && month === '*' && dow === '*') {
    return 'daily-at-time'
  }

  // Weekday at specific time: N H * * 1-5
  if (/^\d+$/.test(minute) && /^\d+$/.test(hour) && dom === '*' && month === '*' && /^1-5$/.test(dow)) {
    return 'weekday-time'
  }

  // Every hour on weekdays: N * * * 1-5
  if (/^\d+$/.test(minute) && hour === '*' && dom === '*' && month === '*' && /^1-5$/.test(dow)) {
    return 'weekday-hourly'
  }

  // Step minutes on weekdays: */N * * * 1-5
  if (/^\*\/\d+$/.test(minute) && hour === '*' && dom === '*' && month === '*' && /^1-5$/.test(dow)) {
    return 'weekday-step-minutes'
  }

  // Step minutes during range hours: */N H-H * * DOW
  if (/^\*\/\d+$/.test(minute) && /^\d+-\d+$/.test(hour) && dom === '*' && month === '*') {
    return 'step-range'
  }

  // Every N minutes during range hours: */N H-H * * *
  if (/^\*\/\d+$/.test(minute) && /^\d+-\d+$/.test(hour) && dom === '*' && month === '*' && dow === '*') {
    return 'step-range-daily'
  }

  // Specific day(s) at time: N H * * DOW
  if (/^\d+$/.test(minute) && /^\d+$/.test(hour) && dom === '*' && month === '*' && /^\d/.test(dow)) {
    return 'specific-day-time'
  }

  // Range hours: N H-H * * DOW or N H-H * * *
  if (/^\d+$/.test(minute) && /^\d+-\d+$/.test(hour) && dom === '*' && month === '*' && dow === '*') {
    return 'range-hours-daily'
  }

  // Every N days: 0 0 */N * *
  if (/^\d+$/.test(minute) && /^\d+$/.test(hour) && /^\*\/\d+$/.test(dom) && month === '*' && dow === '*') {
    return 'every-n-days'
  }

  // Monthly: 0 0 N * *
  if (/^\d+$/.test(minute) && /^\d+$/.test(hour) && /^\d+/.test(dom) && month === '*' && dow === '*') {
    return 'monthly'
  }

  // Multi-daily: N H,H * * *
  if (/^\d+$/.test(minute) && /^\d+,/.test(hour) && dom === '*' && month === '*' && dow === '*') {
    return 'multi-daily'
  }

  // Multi-daily with dow: N H,H * * DOW
  if (/^\d+$/.test(minute) && /^\d+,/.test(hour) && dom === '*' && month === '*' && dow !== '*') {
    return 'multi-daily-dow'
  }

  // Weekend: N H * * 0,6
  if (dow === '0,6') return 'weekend'

  // Annual: 0 0 N M *
  if (/^\d+$/.test(minute) && /^\d+$/.test(hour) && /^\d+$/.test(dom) && /^\d/.test(month) && dow === '*') {
    return 'annual'
  }

  // Quarter/semi: 0 0 1 M,M,M *
  if (/^\d+$/.test(minute) && /^\d+$/.test(hour) && /^\d+$/.test(dom) && /^\d+,/.test(month) && dow === '*') {
    return 'quarterly'
  }

  // Last day of month: 0 0 28-31 * *
  if (/28-31/.test(dom)) return 'last-day-month'

  // Specific day with range: N H-H * * DOW
  if (/^\d+$/.test(minute) && /^\d+-\d+$/.test(hour) && dom === '*' && /^\d/.test(dow)) {
    return 'range-hours-dow'
  }

  // Syntax pages
  if (['cron-asterisk', 'cron-step-operator', 'cron-range-operator', 'cron-list-operator',
    'cron-field-order', 'cron-special-characters', 'cron-at-shortcuts', 'cron-min-max-values'].includes(slug)) {
    return 'syntax'
  }

  // Platform pages
  if (['aws-eventbridge-cron', 'quartz-cron', 'kubernetes-cronjob', 'github-actions-schedule'].includes(slug)) {
    return 'platform'
  }

  // Use-case pages
  if (['cron-database-backup', 'cron-log-rotation', 'cron-cache-clear', 'cron-health-check',
    'cron-ssl-renewal', 'cron-temp-cleanup', 'cron-report-generation', 'cron-data-sync',
    'cron-email-sending', 'cron-environment-variables', 'cron-troubleshooting', 'cron-timezone',
    'how-to-edit-crontab'].includes(slug)) {
    return 'use-case'
  }

  return 'generic'
}

function generateExplanation(page, cls) {
  const expr = page.cron
  const parsed = parseCron(expr)
  const h1 = page.h1

  const generators = {
    'every-minute': () => {
      return `The cron expression * * * * * runs a command every single minute of every hour, every day. All five fields are set to the wildcard asterisk (*), which means "match every possible value" for minutes (0-59), hours (0-23), day of month (1-31), month (1-12), and day of week (0-6). This results in 1,440 executions per day (60 minutes × 24 hours). It is the most frequent standard cron schedule possible. ` +
      `Common use cases include real-time monitoring scripts, polling external APIs for changes, queue processing workers that need immediate responsiveness, and watchdog processes that restart failed services. When using this schedule, ensure each run completes within 60 seconds to prevent overlapping executions. Use a lock file mechanism (for example, flock in Linux) to prevent duplicate runs if a job takes longer than expected. ` +
      `On Quartz Scheduler, the equivalent is 0 * * ? * * (7 fields, starting with seconds). On AWS EventBridge, use rate(1 minute) for simplicity. On Kubernetes CronJob, the standard format works: schedule: "* * * * *", but note that K8s does not guarantee sub-minute precision. ` +
      `Running a job every minute generates significant log volume and system load. Consider whether every-5-minutes (*/5 * * * *) or every-minute-during-business-hours (* 9-17 * * 1-5) would suffice for your use case. For monitoring, tools like Prometheus, Nagios, or Datadog often provide better built-in scheduling than cron.`
    },

    'every-n-minutes': () => {
      const n = parseInt(parsed.minute.replace('*/', ''))
      const minutes = expandField(parsed.minute, 59)
      const timesStr = minutes ? minutes.join(', ') : 'every minute'
      const runsPerHour = Math.ceil(60 / n)
      const runsPerDay = runsPerHour * 24

      return `The cron expression ${expr} uses the step operator (*/${n}) in the minute field to run a command every ${n} minutes. It triggers at minute ${timesStr} of every hour, producing ${runsPerDay} executions per day. ` +
      `This schedule is ideal for tasks that need frequent but not continuous execution: API health checks, data synchronization between systems, queue polling, cache warming, or metrics collection. The step operator */${n} means "every ${n}th value starting from 0," which is why it fires at minute 0 (the top of the hour) as the first trigger. ` +
      `For Quartz Scheduler, use 0 */${n} * ? * * (add seconds field at the start, and ? for day-of-week). For AWS EventBridge, use rate(${n} minutes) or cron(0/${n} * ? * * *). For Kubernetes CronJob, the standard 5-field format works: schedule: "${expr}". On Vercel Cron, add to vercel.json: { "crons": [{ "path": "/api/task", "schedule": "${expr}" }] }. ` +
      `A common mistake is confusing */${n} with 0-59/${n}. They are equivalent — both trigger at the same times. Another pitfall: if your job takes longer than ${n} minutes, executions will overlap. Use a lock file (flock) or a queue system to prevent concurrent runs. ` +
      `If you need this schedule only during business hours, combine it with an hour range: */${n} 9-17 * * 1-5 runs every ${n} minutes from 9 AM to 5 PM on weekdays only.`
    },

    'hourly-at-minute': () => {
      const m = parseInt(parsed.minute)
      return `The cron expression ${expr} runs a command at minute ${m} of every hour, every day. The minute field is set to ${m} while all other fields are wildcards (*), meaning the schedule repeats across all 24 hours, 7 days a week. This produces 24 executions per day. ` +
      `Common use cases include hourly log rotation, periodic data snapshots, heartbeat signals, incremental backup jobs, and hourly API rate limit resets. The advantage of specifying a non-zero minute (like ${m} instead of 0) is avoiding the "top-of-hour stampede" when thousands of cron jobs fire simultaneously at :00. ` +
      `For Quartz Scheduler, the equivalent is ${m} * * ? * * (7 fields with seconds). For AWS EventBridge, use cron(${m} * ? * * *). For Kubernetes CronJob, use schedule: "${expr}" directly. ` +
      `If you want a different minute offset, simply change the first field: 0 * * * * for the top of the hour, 15 * * * * for quarter past, 30 * * * * for half past, 45 * * * * for quarter to. To run hourly only during business hours, use ${m} 9-17 * * 1-5 (9 AM to 5 PM, weekdays). ` +
      `Each run should complete within 60 minutes to avoid overlap with the next trigger. For jobs that may run long, consider using a lock mechanism or idempotent design so duplicate executions cause no harm.`
    },

    'every-n-hours': () => {
      const m = parseInt(parsed.minute)
      const h = parseInt(parsed.hour.replace('*/', ''))
      const hours = expandField(parsed.hour, 23)
      const timesStr = hours ? hours.map(formatHourShort).join(', ') : ''
      const timesFriendly = hours ? hours.map(formatHour).join(', ') : ''
      const runsPerDay = hours ? hours.length : 12

      return `The cron expression ${expr} runs a command every ${h} hours starting at ${formatHour(0)}, producing ${runsPerDay} executions per day. It triggers at ${timesStr} (${timesFriendly}) daily. The minute field (${m}) controls the offset within each hour. ` +
      `Common use cases include periodic data synchronization, database replication checks, system health reports, cache invalidation, and batch processing pipelines that don't require minute-level frequency. Running every ${h} hours balances data freshness with system load. ` +
      `For Quartz Scheduler, use ${m} 0/${h} * ? * * (7 fields, seconds first, ? for day-of-week). For AWS EventBridge, use rate(${h} hours) or cron(${m} 0/${h} ? * * *). For Kubernetes CronJob, use schedule: "${expr}" directly. ` +
      `Note that */${h} in the hour field starts from hour 0 (midnight). If you need a different starting hour, use explicit values: for example, 0 2,8,14,20 * * * runs every 6 hours starting at 2 AM instead of midnight. ` +
      `If you want this schedule only on weekdays, add the day-of-week field: ${m} */${h} * * 1-5. For business-hours-only variations, use an hour range like ${m} 9-17 * * 1-5.`
    },

    'daily-at-time': () => {
      const m = parseInt(parsed.minute)
      const h = parseInt(parsed.hour)
      const time24 = `${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}`
      const timeFriendly = m === 0 ? formatHour(h) : `${formatHour(h).replace('midnight','12 AM')} at :${String(m).padStart(2,'0')}`

      let useCases = ''
      if (h >= 0 && h < 5) useCases = 'database backups, system maintenance, log rotation, data warehouse ETL jobs, and security scans — tasks that benefit from low traffic and minimal user impact'
      else if (h >= 5 && h < 9) useCases = 'morning report generation, daily email digests, cache pre-warming, data synchronization from overnight batches, and dashboard refreshes'
      else if (h >= 9 && h < 12) useCases = 'start-of-day reports, notification dispatches, daily data imports, scheduled content publishing, and morning analytics summaries'
      else if (h === 12) useCases = 'midday report generation, lunch-time notifications, half-day data snapshots, and midday system checks'
      else if (h >= 13 && h < 17) useCases = 'afternoon data exports, scheduled notifications, periodic report generation, and end-of-day preparation tasks'
      else if (h >= 17 && h < 21) useCases = 'end-of-day reports, evening data backups, daily summary emails, user activity logs, and scheduled content delivery'
      else useCases = 'late-night batch processing, off-peak data transfers, overnight maintenance, and security audit scans'

      return `The cron expression ${expr} runs a command at ${time24} (${timeFriendly}) every single day. The minute field is set to ${m} and the hour field to ${h}, with the remaining fields as wildcards (*) meaning every day, every month, every day of week. This produces exactly 1 execution per day, 365 days a year. ` +
      `Common use cases for a ${timeFriendly} daily schedule include ${useCases}. Cron uses 24-hour time format, so hour ${h} corresponds to ${formatHour(h)} in 12-hour notation. ` +
      `For Quartz Scheduler, use ${m} ${h} * ? * * (7 fields starting with seconds, ? for day-of-week). For AWS EventBridge, use cron(${m} ${h} ? * * *). For Kubernetes CronJob, use schedule: "${expr}" directly. On Vercel Cron, add to vercel.json: { "crons": [{ "path": "/api/daily-task", "schedule": "${expr}" }] }. GitHub Actions uses UTC, so adjust the hour for your timezone. ` +
      `A common mistake is forgetting that cron runs in the system's local timezone by default. Use CRON_TZ=UTC at the top of your crontab for consistent UTC scheduling. Another pitfall: jobs scheduled at midnight (0 0 * * *) compete with many other system cron jobs; using ${time24} avoids this contention. ` +
      `If you need this schedule only on weekdays, change to ${m} ${h} * * 1-5. For twice daily, use ${m} ${h},${h < 12 ? h + 12 : h - 12} * * *.`
    },

    'weekday-time': () => {
      const m = parseInt(parsed.minute)
      const h = parseInt(parsed.hour)

      return `The cron expression ${expr} runs at ${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')} (${formatHour(h)}${m > 0 ? ` at minute ${m}` : ''}) Monday through Friday. The 1-5 in the day-of-week field is a range that covers Monday(1) through Friday(5), excluding Saturday(6) and Sunday(0). This produces 5 executions per week (once per weekday). ` +
      `This schedule is ideal for business-oriented tasks: daily standup reminders, automated report generation, data synchronization during work hours, CI/CD pipeline triggers, email summaries, and monitoring dashboards that are only relevant when the team is active. ` +
      `For Quartz Scheduler, use ${m} ${h} ? * MON-FRI (use three-letter day names and ? in the day-of-month field). For AWS EventBridge, use cron(${m} ${h} ? * MON-FRI *). For Kubernetes CronJob, use schedule: "${expr}" — Kubernetes supports the standard 5-field format with numeric day-of-week. ` +
      `Note that cron's day-of-week numbering starts with Sunday=0 (or 7), Monday=1, through Saturday=6. Some systems (like Quartz) use text labels (MON, TUE, etc.) which are more readable. If you need to include Saturday, change 1-5 to 1-6. For weekends only, use 0,6. ` +
      `Public holidays are not handled by cron natively. If your job should skip holidays, add a check in your script against a holiday calendar file or API.`
    },

    'weekday-hourly': () => {
      const m = parseInt(parsed.minute)
      const runsPerWeek = 24 * 5
      return `The cron expression ${expr} runs at minute ${m} of every hour, but only on Monday through Friday (1-5 in the day-of-week field). This produces ${runsPerWeek} executions per week (${m} past each of 24 hours × 5 weekdays). The minute field (${m}) controls the offset within each hour, and the weekday restriction prevents weekend executions. ` +
      `Common use cases include monitoring production systems during work hours (though it runs all 24 hours of each weekday), periodic log checks, intraday reporting, and scheduled data synchronization that should pause on weekends. ` +
      `If you want to limit execution to business hours only (9 AM to 5 PM), combine the weekday field with an hour range: ${m} 9-17 * * 1-5. This runs at minute ${m} of each hour from 9 AM to 5 PM, Monday through Friday — 9 executions per weekday instead of 24. ` +
      `For Quartz Scheduler, use ${m} * ? * MON-FRI (7 fields with seconds). For AWS EventBridge, use cron(${m} * ? * MON-FRI *). For Kubernetes CronJob, use schedule: "${expr}".`
    },

    'weekday-step-minutes': () => {
      const n = parseInt(parsed.minute.replace('*/', ''))
      return `The cron expression ${expr} runs every ${n} minutes, but only on Monday through Friday (weekdays). The */${n} step operator in the minute field combined with 1-5 in the day-of-week field creates a business-day-only schedule with ${Math.ceil(60/n) * 24} executions per weekday. Weekend runs are completely skipped. ` +
      `This schedule is commonly used for production monitoring, intraday report generation, stock market data polling, customer support queue checks, and CI/CD health checks that are only relevant when the team is working. ` +
      `For Quartz Scheduler, use 0 */${n} * ? * MON-FRI. For AWS EventBridge, use cron(0/${n} * ? * MON-FRI *). For Kubernetes CronJob, use schedule: "${expr}" directly. ` +
      `If you also need to restrict to business hours (9 AM to 5 PM), use */${n} 9-17 * * 1-5 instead. This reduces executions to ${Math.ceil(60/n) * 9} per weekday.`
    },

    'specific-day-time': () => {
      const m = parseInt(parsed.minute)
      const h = parseInt(parsed.hour)
      const dowStr = parsed.dow
      const dows = expandField(dowStr, 6)
      const dayNames = dows ? dows.map(d => DAY_NAMES[d]).join(' and ') : dowStr
      const freq = dows ? dows.length : 1

      return `The cron expression ${expr} runs at ${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')} (${formatHour(h)}${m > 0 ? ` at minute ${m}` : ''}) every ${dayNames}. The day-of-week field (${dowStr}) restricts execution to ${dayNames} only, while the minute and hour fields control the exact time. This produces ${freq} execution${freq > 1 ? 's' : ''} per week. ` +
      `Typical use cases include weekly team reports, scheduled maintenance windows, recurring data exports, weekly email newsletters, automated timesheet reminders, and end-of-week summaries. Running on ${dayNames} ensures the task aligns with your team's workflow. ` +
      `For Quartz Scheduler, use ${m} ${h} ? * ${dows ? dows.map(d => DAY_NAMES[d].substring(0,3).toUpperCase()).join(',') : dowStr} (three-letter uppercase day names with ? in day-of-month). For AWS EventBridge, use cron(${m} ${h} ? * ${dows ? dows.map(d => DAY_NAMES[d].substring(0,3).toUpperCase()).join(',') : dowStr} *). For Kubernetes CronJob, use schedule: "${expr}" with numeric day values. ` +
      `Cron day-of-week numbering: Sunday=0, Monday=1, Tuesday=2, Wednesday=3, Thursday=4, Friday=5, Saturday=6. Some implementations also accept 7 for Sunday. To add more days, use comma separation: 1,3,5 for Mon/Wed/Fri.`
    },

    'weekend': () => {
      const m = parseInt(parsed.minute)
      const h = parseInt(parsed.hour)

      return `The cron expression ${expr} runs at ${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')} on Saturday and Sunday only. The day-of-week field 0,6 uses a comma-separated list to match both Sunday(0) and Saturday(6). This produces 2 executions per week. ` +
      `Weekend schedules are useful for tasks that should run when user traffic is lower: full database backups, weekly report generation, system maintenance, log archival, security scans, and batch processing that would be too resource-intensive during weekdays. ` +
      `For Quartz Scheduler, use ${m} ${h} ? * SAT,SUN (three-letter uppercase day names). For AWS EventBridge, use cron(${m} ${h} ? * SAT,SUN *). For Kubernetes CronJob, use schedule: "${expr}" directly. ` +
      `If you need different times on Saturday vs Sunday, create two separate cron entries: one with day 6 (Saturday) and one with day 0 (Sunday), each with its own time. Cron does not support per-day time variations in a single expression.`
    },

    'monthly': () => {
      const m = parseInt(parsed.minute)
      const h = parseInt(parsed.hour)
      const doms = expandField(parsed.dom, 31)
      const domStr = doms ? doms.join(', ') : parsed.dom
      const domOrdinals = doms ? doms.map(d => ordinal(d)).join(' and ') : ''

      return `The cron expression ${expr} runs at ${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')} on the ${domOrdinals || domStr} of every month. The day-of-month field (${parsed.dom}) specifies which calendar days to trigger. This produces ${doms ? doms.length : 1} execution${doms && doms.length > 1 ? 's' : ''} per month. ` +
      `Monthly schedules are commonly used for billing cycle tasks, subscription renewals, monthly report generation, account statement creation, database archiving, compliance audits, payroll processing, and infrastructure cost reporting. ` +
      `For Quartz Scheduler, use ${m} ${h} ${parsed.dom} * ? (swap day-of-month and day-of-week fields, use ? for day-of-week). For AWS EventBridge, use cron(${m} ${h} ${parsed.dom} * ? *) (add year field, use ? for day-of-week). For Kubernetes CronJob, use schedule: "${expr}" directly. ` +
      `Note: months with fewer days than the specified day-of-month will skip that month. For example, day 31 runs only in months with 31 days (7 months out of 12). For the last day of every month, use 0 0 28-31 * * with a script that checks if tomorrow is the 1st. ` +
      `Cron does not natively support "last business day" or "Nth weekday of the month" logic. Implement these rules in your script using date utilities.`
    },

    'every-n-days': () => {
      const n = parseInt(parsed.dom.replace('*/', ''))
      const days = expandField(parsed.dom, 31)
      const daysStr = days ? days.join(', ') : ''

      return `The cron expression ${expr} uses the step operator (*/${n}) in the day-of-month field to run every ${n} days. It triggers at midnight on days ${daysStr} of each month. Note that the count resets at the start of each month, so the schedule is not perfectly uniform across month boundaries. ` +
      `Use cases for every-${n}-day schedules include periodic data exports, bi-weekly report generation, alternating maintenance windows, scheduled content publishing, and recurring health assessments that don't align with weekly or monthly boundaries. ` +
      `For Quartz Scheduler, use 0 0 */${n} * ? (swap day-of-month and day-of-week, use ? for day-of-week). For AWS EventBridge, use cron(0 0 */${n} * ? *) (add year field). For Kubernetes CronJob, use schedule: "${expr}" directly. ` +
      `A limitation: */${n} in the day-of-month field resets at each month boundary. For truly continuous every-${n}-days scheduling (including across month boundaries), store the last run date in a file or database and check it in your script. ` +
      `If you need business-day logic (skip weekends), cron cannot express this natively. Use a daily cron (0 0 * * *) with a script that calculates business-day intervals.`
    },

    'multi-daily': () => {
      const m = parseInt(parsed.minute)
      const hours = expandField(parsed.hour, 23)
      const timesStr = hours ? hours.map(h => `${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}`).join(', ') : ''
      const timesFriendly = hours ? hours.map(h => `${formatHour(h)}`).join(', ') : ''
      const count = hours ? hours.length : 1

      return `The cron expression ${expr} uses a comma-separated list in the hour field (${parsed.hour}) to run ${count} times per day at ${timesStr} (${timesFriendly}). Comma-separated values mean "this hour OR that hour," allowing multiple triggers per day without creating separate cron entries. ` +
      `Running ${count} times daily is common for tasks like sending digest emails, performing data synchronization checkpoints, generating status reports, running incremental backups, and checking external service availability at regular intervals throughout the day. ` +
      `For Quartz Scheduler, use ${m} ${hours ? hours.join(',') : parsed.hour} * ? * * (7 fields with seconds, ? for day-of-week). For AWS EventBridge, use cron(${m} ${hours ? hours.join(',') : parsed.hour} ? * * *). For Kubernetes CronJob, use schedule: "${expr}" directly. ` +
      `Alternative: if the hours are evenly spaced, you can use a step operator instead. For example, 0 0,6,12,18 * * * is equivalent to 0 */6 * * *. The step form is more concise, but explicit comma values are clearer when the spacing is irregular. ` +
      `To add weekday-only restriction, append 1-5 to the day-of-week field: ${m} ${parsed.hour} * * 1-5.`
    },

    'multi-daily-dow': () => {
      const m = parseInt(parsed.minute)
      const hours = expandField(parsed.hour, 23)
      const timesStr = hours ? hours.map(h => `${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}`).join(', ') : ''
      const dows = expandField(parsed.dow, 6)
      const dayNames = dows ? dows.map(d => DAY_NAMES[d]).join(' and ') : parsed.dow

      return `The cron expression ${expr} combines comma-separated hours (${parsed.hour}) with specific days of week (${parsed.dow}) to run at ${timesStr} on ${dayNames} only. This produces ${hours ? hours.length : 1} × ${dows ? dows.length : 1} executions per week. ` +
      `This pattern is useful for tasks that need multiple daily triggers but only on specific days: weekend monitoring at different check-in times, weekday report generation at multiple points during the day, or batched email sends on specific weekdays. ` +
      `For Quartz Scheduler, use ${m} ${hours ? hours.join(',') : parsed.hour} ? * ${dows ? dows.map(d => DAY_NAMES[d].substring(0,3).toUpperCase()).join(',') : parsed.dow} (7 fields, text day names). For AWS EventBridge, use cron(${m} ${hours ? hours.join(',') : parsed.hour} ? * ${dows ? dows.map(d => DAY_NAMES[d].substring(0,3).toUpperCase()).join(',') : parsed.dow} *). ` +
      `To run every N hours instead of specific times, replace the hour list with a step: ${m} */N * * ${parsed.dow}.`
    },

    'annual': () => {
      const m = parseInt(parsed.minute)
      const h = parseInt(parsed.hour)
      const dom = parseInt(parsed.dom)
      const months = expandField(parsed.month, 12)
      const monthNames = months ? months.map(mo => MONTH_NAMES[mo]).join(', ') : ''
      const dateStr = `${monthNames} ${dom}${dom === 1 ? 'st' : dom === 2 ? 'nd' : dom === 3 ? 'rd' : 'th'}`

      return `The cron expression ${expr} runs at ${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')} on ${dateStr} each year. The month field (${parsed.month}) restricts execution to specific months, and the day-of-month field (${dom}) pinpoints the exact date. This produces ${months ? months.length : 1} execution${months && months.length > 1 ? 's' : ''} per year. ` +
      `Annual schedules are used for: yearly compliance reports, subscription renewal processing, annual data archival, fiscal year closing tasks, certificate rotation reminders, and birthday/anniversary notifications. Running once or a few times per year ensures these infrequent but critical tasks are not forgotten. ` +
      `For Quartz Scheduler, use ${m} ${h} ${dom} ${parsed.month} ? (swap dow to ?). For AWS EventBridge, use cron(${m} ${h} ${dom} ${parsed.month} ? *) (add year field). For Kubernetes CronJob, use schedule: "${expr}" directly. ` +
      `Cron does not support "last day of February" or "Nth weekday of March" natively. For complex annual schedules, use a daily cron with date-checking logic in your script. The @yearly shortcut is equivalent to 0 0 1 1 * (midnight on January 1st).`
    },

    'quarterly': () => {
      const months = expandField(parsed.month, 12)
      const monthNames = months ? months.map(m => MONTH_NAMES[m]).join(', ') : ''

      return `The cron expression ${expr} runs quarterly (every 3 months) on ${monthNames}. The comma-separated month field (${parsed.month}) specifies which months to trigger, while the day-of-month and time fields control the exact date and time. This produces ${months ? months.length : 1} executions per year. ` +
      `Quarterly schedules are essential for: quarterly business reviews (QBRs), financial reporting, tax preparation reminders, compliance audits, infrastructure cost reviews, and performance benchmarking. Many organizations align their operational cadence to quarterly cycles. ` +
      `For Quartz Scheduler, use 0 0 1 ${parsed.month} ? (swap dow to ?). For AWS EventBridge, use cron(0 0 1 ${parsed.month} ? *). For Kubernetes CronJob, use schedule: "${expr}" directly. ` +
      `To run on a different day of the quarter (not the 1st), change the day-of-month field. For semi-annual schedules, use two months: 0 0 1 1,7 * for January and July.`
    },

    'last-day-month': () => {
      return `The cron expression ${expr} targets days 28-31 of each month to approximate "last day of month" scheduling. Since months have different lengths (28-31 days), you must add date-checking logic in your script to verify it is actually the last day. Without this check, the job runs on days 28, 29, 30, and 31 every month. ` +
      `In your script, check if tomorrow is the 1st: if [ "$(date +%d -d tomorrow)" = "01" ]; then your_command; fi. On macOS, use: if [ "$(date -v+1d +%d)" = "01" ]; then your_command; fi. This ensures the job runs only once per month on the actual last day. ` +
      `Use cases include: monthly billing cycle closures, end-of-month report generation, account statement creation, monthly data archival, and payroll processing that must occur on the final business day. ` +
      `For Quartz Scheduler, use the L modifier in the day-of-month field: 0 0 L * ? (L means "last day of month"). This is a Quartz-specific extension that handles varying month lengths automatically. Standard Unix cron does not support L. ` +
      `For AWS EventBridge, there is no direct "last day" support either. Use the same 28-31 approach with a Lambda function that checks the date. For Kubernetes, apply the same script-based date checking.`
    },

    'step-range': () => {
      const stepMin = parseInt(parsed.minute.replace('*/', ''))
      const [hStart, hEnd] = parsed.hour.split('-').map(Number)
      const dows = parsed.dow && parsed.dow !== '*' ? expandField(parsed.dow, 6) : null
      const dayLabel = dows ? ` on ${dows.map(d => DAY_NAMES[d]).join(' and ')}` : ' daily'

      return `The cron expression ${expr} combines three cron features: a step operator (*/${stepMin}) in the minute field for every-${stepMin}-minute intervals, a range (${hStart}-${hEnd}) in the hour field for hours ${formatHour(hStart)} through ${formatHour(hEnd)}, and${dows ? ` specific days (${parsed.dow})` : ' wildcards for all days'}. It produces approximately ${Math.ceil(60/stepMin) * (hEnd - hStart + 1)} executions per day${dayLabel}. ` +
      `This composite schedule is useful for: high-frequency monitoring during peak hours, customer-facing dashboard refreshes during business times, API rate limit management during high-traffic periods, and batch processing that should only run when the system is under active use. ` +
      `For Quartz Scheduler, use 0 */${stepMin} ${hStart}-${hEnd} ? * ${dows ? dows.map(d => DAY_NAMES[d].substring(0,3).toUpperCase()).join(',') : '*'}. For AWS EventBridge, use cron(0/${stepMin} ${hStart}-${hEnd} ? * ${dows ? dows.map(d => DAY_NAMES[d].substring(0,3).toUpperCase()).join(',') : '*'} *). ` +
      `You can adjust the step value for different frequencies: */5 for every 5 minutes, */15 for quarter-hourly, */30 for half-hourly. The hour range controls the active window.`
    },

    'step-range-daily': () => {
      const stepMin = parseInt(parsed.minute.replace('*/', ''))
      const [hStart, hEnd] = parsed.hour.split('-').map(Number)

      return `The cron expression ${expr} runs every ${stepMin} minutes, but only during the hours of ${formatHour(hStart)} to ${formatHour(hEnd)}. The step operator (*/${stepMin}) in the minute field combines with the range (${hStart}-${hEnd}) in the hour field to create a time-windowed schedule. Outside these hours, the job does not run. This produces approximately ${Math.ceil(60/stepMin) * (hEnd - hStart + 1)} executions per day. ` +
      `This pattern is ideal for: polling services during active hours, generating intraday reports during business hours, cache warming before user traffic peaks, and monitoring tasks that don't need overnight coverage. ` +
      `For Quartz Scheduler, use 0 */${stepMin} ${hStart}-${hEnd} ? * * (7 fields, ? for day-of-week). For AWS EventBridge, use cron(0/${stepMin} ${hStart}-${hEnd} ? * * *). For Kubernetes CronJob, use schedule: "${expr}" directly. ` +
      `To restrict to weekdays as well, add 1-5 to the day-of-week field: */${stepMin} ${hStart}-${hEnd} * * 1-5.`
    },

    'range-hours-daily': () => {
      const m = parseInt(parsed.minute)
      const [hStart, hEnd] = parsed.hour.split('-').map(Number)

      return `The cron expression ${expr} runs at minute ${m} of every hour from ${formatHour(hStart)} to ${formatHour(hEnd)} (hours ${hStart}-${hEnd}), every day. The range operator (${hStart}-${hEnd}) in the hour field triggers at each hour within the range, producing ${hEnd - hStart + 1} executions per day. ` +
      `This schedule is commonly used for: off-peak maintenance windows (${formatHour(hStart)} to ${formatHour(hEnd)} is typically low-traffic), periodic checks during specific time blocks, intraday reporting at regular intervals, and automated tasks that should not run during peak hours. ` +
      `For Quartz Scheduler, use ${m} ${hStart}-${hEnd} ? * * (7 fields, ? for day-of-week). For AWS EventBridge, use cron(${m} ${hStart}-${hEnd} ? * * *). For Kubernetes CronJob, use schedule: "${expr}" directly. ` +
      `To add weekday restriction: ${m} ${hStart}-${hEnd} * * 1-5 runs during the same hours but only Monday through Friday.`
    },

    'range-hours-dow': () => {
      const m = parseInt(parsed.minute)
      const [hStart, hEnd] = parsed.hour.split('-').map(Number)
      const dows = expandField(parsed.dow, 6)
      const dayNames = dows ? dows.map(d => DAY_NAMES[d]).join(' and ') : parsed.dow

      return `The cron expression ${expr} runs at minute ${m} of every hour from ${formatHour(hStart)} to ${formatHour(hEnd)}, but only on ${dayNames}. The hour range (${hStart}-${hEnd}) combines with specific days of week (${parsed.dow}) to create a targeted schedule. ` +
      `Common use cases include: business-hours monitoring on weekdays, scheduled maintenance during work hours, periodic reporting during active times, and automated checks that only matter when the team is available to respond. ` +
      `For Quartz Scheduler, use ${m} ${hStart}-${hEnd} ? * ${dows ? dows.map(d => DAY_NAMES[d].substring(0,3).toUpperCase()).join('-') : parsed.dow}. For AWS EventBridge, use cron(${m} ${hStart}-${hEnd} ? * ${dows ? dows.map(d => DAY_NAMES[d].substring(0,3).toUpperCase()).join('-') : parsed.dow} *). ` +
      `To increase frequency within the time window, change the minute field to a step: */15 ${hStart}-${hEnd} * * ${parsed.dow} for every 15 minutes during the same hours.`
    },

    'syntax': () => {
      // Enhance existing syntax explanations with additional context
      const base = page.explanation
      return base + ` Cron expressions consist of five fields separated by spaces: minute (0-59), hour (0-23), day of month (1-31), month (1-12), and day of week (0-6, where 0 and 7 both represent Sunday). Each field can contain a single value, a range (1-5), a list (0,6), a step (*/5), or a wildcard (*). Understanding these operators is essential for writing correct cron schedules. The most common mistake is confusing the field order — remember the mnemonic "M H DOM MON DOW" (Minute, Hour, Day of Month, Month, Day of Week). When testing cron expressions, use an online validator like crontab.guru or our built-in cron validator to verify the schedule before deploying to production.`
    },
    'platform': () => {
      const base = page.explanation
      const platformNote = ` When migrating cron schedules between platforms, the most common issues are: (1) Quartz requires 7 fields starting with seconds, (2) AWS EventBridge needs a 6th year field and uses ? instead of * in conflicting day fields, (3) Kubernetes uses the standard 5-field format but adds features like concurrencyPolicy and successfulJobsHistoryLimit, (4) GitHub Actions may delay scheduled workflows during peak load periods. Always test your cron expression on the target platform before relying on it in production.`
      return base + platformNote
    },
    'use-case': () => {
      const base = page.explanation
      const useCaseNote = ` When setting up scheduled tasks, follow these best practices: (1) Always use full paths to commands and scripts in your crontab, since cron runs with a minimal PATH environment. (2) Redirect output to log files: command >> /var/log/myjob.log 2>&1 to prevent email spam and enable debugging. (3) Set a MAILTO variable at the top of your crontab if you want error notifications. (4) Test your scheduled script manually before adding it to cron. (5) Use flock or a similar mechanism to prevent overlapping executions for jobs that may run longer than their interval. (6) Monitor your cron jobs with a health check system so you are alerted when a job silently fails.`
      return base + useCaseNote
    },
    'at-shortcut': () => {
      return `Cron provides several shorthand aliases that replace common 5-field expressions: @yearly (or @annually) runs once a year at midnight on January 1st (equivalent to 0 0 1 1 *). @monthly runs at midnight on the 1st of every month (0 0 1 * *). @weekly runs at midnight every Sunday (0 0 * * 0). @daily (or @midnight) runs at midnight every day (0 0 * * *). @hourly runs at the top of every hour (0 * * * *). @reboot runs once after the system starts up — this is not a recurring schedule but a one-time trigger. ` +
      `These shortcuts are supported by Vixie Cron (the default cron daemon on most Linux distributions including Ubuntu, Debian, and CentOS). They may not work on all cron implementations — for example, BusyBox cron and some minimal containers do not support them. If you need maximum portability, use the equivalent 5-field expression instead. ` +
      `The @reboot shortcut is particularly useful for starting services or running initialization scripts after a system restart. Unlike the time-based shortcuts, @reboot does not repeat — it fires once per boot. Note that on systemd-based systems, @reboot may fire before all network interfaces are fully up, so add a sleep or retry logic if your script requires network access. ` +
      `On Quartz Scheduler, these shortcuts do not exist — you must use the full 7-field expression. AWS EventBridge uses rate() for simple intervals and cron() for complex schedules. Kubernetes CronJob uses the standard 5-field format. Vercel Cron and GitHub Actions support some shortcuts but recommend explicit expressions for clarity.`
    },
    'generic': () => {
      const base = page.explanation
      if (base.length > 200) return base
      return base + ` This cron expression follows the standard 5-field format: minute (0-59), hour (0-23), day of month (1-31), month (1-12), day of week (0-6). Each field can use wildcards (*), ranges (N-M), lists (N,M), or steps (*/N). Add this expression to your crontab by running crontab -e and inserting a new line with the expression followed by the full path to your script.`
    },
  }

  const gen = generators[cls]
  if (!gen) return page.explanation
  const result = gen()
  // If generator returned the original (syntax/platform/use-case), keep the original
  if (result === page.explanation) return page.explanation
  // Only replace if new content is longer
  if (result.length > page.explanation.length) return result
  return page.explanation
}

function generateFaq(page, cls) {
  const expr = page.cron
  const parsed = parseCron(expr)
  const h1 = page.h1

  // For syntax, platform, and use-case pages with existing good FAQ, keep them
  if (['syntax', 'platform', 'use-case', 'at-shortcut'].includes(cls) && page.faq.length >= 5) {
    return page.faq
  }

  const faq = []
  // Q1: What does this expression mean / how to set up
  faq.push({
    q: `What does the cron expression ${expr} mean?`,
    a: `The expression ${expr} means: ${explainCronExpr(parsed, expr)}. Each field in the cron expression controls a different time component: minute, hour, day of month, month, and day of week.`
  })

  // Q2: How to add to crontab
  faq.push({
    q: `How do I add ${expr} to my crontab?`,
    a: `Run crontab -e in your terminal to open your crontab editor. Add a new line: ${expr} /path/to/your/script.sh. Save and exit. Verify with crontab -l. Make sure your script is executable (chmod +x script.sh) and uses full paths for all commands.`
  })

  // Q3: Platform equivalent
  faq.push({
    q: `What is the equivalent of ${expr} on Quartz / AWS / Kubernetes?`,
    a: generatePlatformAnswer(parsed, expr)
  })

  // Q4: Category-specific question
  const catQ = generateCategoryQuestion(page, cls, parsed, expr)
  if (catQ) faq.push(catQ)

  // Q5: Common mistake
  faq.push({
    q: `What are common mistakes when using ${expr}?`,
    a: `Common pitfalls: (1) Cron uses a minimal PATH — always use full paths to commands and scripts. (2) Percent signs (%) must be escaped with backslash in crontab. (3) Cron runs in the system timezone — set CRON_TZ=UTC at the top of your crontab for consistent UTC scheduling. (4) Redirect output to prevent email spam: ${expr} /path/command >> /var/log/myjob.log 2>&1. (5) Test your cron expression with crontab.guru or our validator above before deploying.`
  })

  // Q6: Alternative expression
  const altQ = generateAlternativeQuestion(page, cls, parsed, expr)
  if (altQ) faq.push(altQ)

  return faq
}

function explainCronExpr(parsed, expr) {
  if (!parsed) return `${expr} triggers on the schedule defined by the expression`
  const parts = []
  if (parsed.minute) parts.push(`at minute ${parsed.minute}`)
  if (parsed.hour) parts.push(`hour ${parsed.hour}`)
  if (parsed.dom) parts.push(`day-of-month ${parsed.dom}`)
  if (parsed.month) parts.push(`month ${parsed.month}`)
  if (parsed.dow) parts.push(`day-of-week ${parsed.dow}`)
  return parts.join(', ')
}

function generatePlatformAnswer(parsed, expr) {
  let quartz = 'not directly applicable'
  let aws = 'not directly applicable'
  let k8s = expr

  if (parsed && parsed.minute !== undefined) {
    const m = parsed.minute
    const h = parsed.hour
    const dom = parsed.dom
    const mon = parsed.month
    const dow = parsed.dow

    // Quartz: 7 fields, seconds first, ? for conflicting day fields
    let quartzDow = dow === '*' ? '*' : dow
    let quartzDom = dom
    if (dom !== '*' && dow !== '*') {
      quartzDow = '?'
    } else if (dom === '*' && dow === '*') {
      quartzDow = '?'
    }

    quartz = `${m === '*' ? '0' : m} ${h === '*' ? '*' : h} ${dom} ${mon} ${quartzDow}`

    // AWS: 6 fields, ? for day fields when other day field is specified
    let awsDom = dom
    let awsDow = dow
    if (dom !== '*' && dow !== '*') {
      awsDow = '?'
    } else if (dom === '*' && dow === '*') {
      awsDom = '?'
      awsDow = '*'
    } else if (dow !== '*') {
      awsDom = '?'
    } else {
      awsDow = '?'
    }
    aws = `cron(${m} ${h} ${awsDom} ${mon} ${awsDow} *)`
  }

  if (expr.startsWith('@')) {
    return `Cron @ shortcuts like ${expr} are a convenience feature in Vixie Cron (the default on most Linux systems). Quartz uses 7-field expressions instead. AWS EventBridge uses rate() or cron() syntax. Kubernetes supports some @ shortcuts depending on the implementation.`
  }

  return `Quartz Scheduler: ${quartz}. AWS EventBridge: ${aws}. Kubernetes CronJob: schedule: "${k8s}" (standard 5-field format). Each platform has slight syntax differences — use our dialect switcher above to get the exact expression.`
}

function generateCategoryQuestion(page, cls, parsed, expr) {
  if (!parsed) return null

  const generators = {
    'every-n-minutes': () => ({
      q: `Is running a cron every ${parseInt(parsed.minute.replace('*/',''))} minutes too frequent?`,
      a: `It depends on your task. For monitoring and health checks, every ${parseInt(parsed.minute.replace('*/',''))} minutes is standard. For data processing, consider whether the data changes fast enough to warrant this frequency. Key rule: each execution must complete within ${parseInt(parsed.minute.replace('*/',''))} minutes to avoid overlap. Use flock or a similar lock mechanism for safety.`
    }),
    'hourly-at-minute': () => ({
      q: `Why use minute ${parsed.minute} instead of minute 0?`,
      a: `Minute 0 (the top of the hour) is when thousands of cron jobs fire simultaneously on shared systems, causing resource spikes. Using minute ${parsed.minute} staggers your job away from the crowd. This is called "cron jitter" and it helps distribute system load more evenly.`
    }),
    'every-n-hours': () => ({
      q: `Can I start the every-${parseInt(parsed.hour.replace('*/',''))}-hours schedule at a different hour?`,
      a: `Yes. */${parseInt(parsed.hour.replace('*/',''))} starts from hour 0 (midnight). To start from a different hour, use explicit comma-separated values. For example, to run every ${parseInt(parsed.hour.replace('*/',''))} hours starting at 3 AM: 0 3,${3+parseInt(parsed.hour.replace('*/',''))},${3+2*parseInt(parsed.hour.replace('*/',''))} * * *.`
    }),
    'daily-at-time': () => ({
      q: `What timezone does ${expr} use?`,
      a: `By default, cron uses the system's local timezone. Check with timedatectl on systemd systems. To force UTC, add CRON_TZ=UTC at the top of your crontab. For per-job timezone: CRON_TZ=America/New_York before the cron line. GitHub Actions always uses UTC.`
    }),
    'weekday-time': () => ({
      q: `Does ${expr} run on holidays?`,
      a: `Yes. Cron does not recognize public holidays — 1-5 means Monday through Friday regardless of holidays. To skip holidays, add logic in your script that checks against a holiday calendar file or API. Some teams maintain a /etc/holidays.d/ directory with date files.`
    }),
    'specific-day-time': () => ({
      q: `How do cron day-of-week numbers work?`,
      a: `Standard Unix cron uses 0-6: Sunday=0, Monday=1, Tuesday=2, Wednesday=3, Thursday=4, Friday=5, Saturday=6. Some implementations also accept 7 for Sunday. Quartz uses text labels: SUN, MON, TUE, WED, THU, FRI, SAT.`
    }),
    'monthly': () => ({
      q: `What happens when the specified day doesn't exist in a month?`,
      a: `Cron simply skips that month. For example, day 31 only triggers in months with 31 days (January, March, May, July, August, October, December). February never triggers for days 30-31. Use 0 0 28-31 * * with a script-side check for "last day of month" if you need monthly execution regardless of month length.`
    }),
    'every-n-days': () => ({
      q: `Does every-${parseInt(parsed.dom.replace('*/',''))}-days reset at month boundaries?`,
      a: `Yes. The */${parseInt(parsed.dom.replace('*/',''))} step in the day-of-month field resets on the 1st of each month. For continuous every-${parseInt(parsed.dom.replace('*/',''))}-days scheduling across month boundaries, use a daily cron (0 0 * * *) and track the last-run date in a file or database.`
    }),
    'multi-daily': () => ({
      q: `Can I use */N instead of comma-separated hours?`,
      a: `If the hours are evenly spaced, yes. For example, 0 0,6,12,18 * * * is the same as 0 */6 * * *. The step form is more concise. But for irregular spacing (like 0 8,12,17 * * *), you must use comma-separated values.`
    }),
    'weekend': () => ({
      q: `Can I use different times for Saturday and Sunday?`,
      a: `Not in a single cron expression. Create two separate entries: one for Saturday (day 6) with its time, and one for Sunday (day 0) with a different time. For example: 0 9 * * 6 for Saturday at 9 AM, and 0 10 * * 0 for Sunday at 10 AM.`
    }),
    'annual': () => ({
      q: `How do I run on a specific date that isn't the 1st?`,
      a: `Change the day-of-month field. For example, ${parsed.minute} ${parsed.hour} 15 ${parsed.month} * runs on the 15th instead of the ${parsed.dom}. For "last Friday of March," you need script-side date logic — cron cannot express this natively.`
    }),
    'last-day-month': () => ({
      q: `How do I detect the last day of the month in a shell script?`,
      a: `On Linux: if [ "$(date +%d -d tomorrow)" = "01" ]; then echo "Last day of month"; fi. On macOS: if [ "$(date -v+1d +%d)" = "01" ]; then echo "Last day"; fi. This checks if tomorrow is the 1st.`
    }),
    'step-range': () => ({
      q: `Can I combine step and range in the same field?`,
      a: `Not directly in standard cron. */N applies to the full range (0-59 for minutes, 0-23 for hours). For "every 10 minutes from 9:15 to 5:45," use 15-45/10 9-17 * * * — this combines a starting range with a step. Standard cron supports this in some implementations but not all.`
    }),
  }

  const gen = generators[cls]
  return gen ? gen() : null
}

function generateAlternativeQuestion(page, cls, parsed, expr) {
  if (!parsed) return null

  // Generate a question about alternative expressions
  const alternatives = []

  if (cls === 'every-n-minutes') {
    const n = parseInt(parsed.minute.replace('*/', ''))
    if (n <= 5) alternatives.push(`For less frequent checks, try */10 * * * * (every 10 minutes) or */15 * * * * (every 15 minutes)`)
    if (n >= 15) alternatives.push(`For more frequent checks, try */5 * * * * (every 5 minutes)`)
    alternatives.push(`To restrict to business hours: */${n} 9-17 * * 1-5`)
  } else if (cls === 'daily-at-time') {
    const h = parseInt(parsed.hour)
    alternatives.push(`For twice daily at the same time AM and PM: 0 ${h},${h < 12 ? h + 12 : h - 12} * * *`)
    alternatives.push(`For weekdays only: ${parsed.minute} ${h} * * 1-5`)
  } else if (cls === 'weekday-time') {
    alternatives.push(`For weekends instead, use ${parsed.minute} ${parsed.hour} * * 0,6`)
    alternatives.push(`For every hour on weekdays, use ${parsed.minute} * * * 1-5`)
  } else if (cls === 'every-n-hours') {
    const n = parseInt(parsed.hour.replace('*/', ''))
    if (n <= 4) alternatives.push(`For less frequent runs, try 0 */${n * 2} * * * (every ${n * 2} hours)`)
    alternatives.push(`For a specific hour instead of interval: use comma-separated values like 0 0,8,16 * * *`)
  }

  if (alternatives.length === 0) return null

  return {
    q: `Are there alternative cron expressions for this schedule?`,
    a: alternatives.join('. ') + '.'
  }
}

function ordinal(n) {
  const s = ['th', 'st', 'nd', 'rd']
  const v = n % 100
  return n + (s[(v - 20) % 10] || s[v] || s[0])
}

// ─── Main ───

const content = fs.readFileSync(DATA_FILE, 'utf-8')

// Extract the array portion using a simple regex
// We'll parse the TS file and rebuild it
const { execSync } = require('child_process')

// Use tsx to import and process
const tmpScript = path.join(__dirname, '_tmp_cron_codegen.mjs')
fs.writeFileSync(tmpScript, `
import { LONG_TAIL_PAGES } from '${DATA_FILE.replace(/\\/g, '/')}';
import { writeFileSync } from 'fs';
const json = JSON.stringify(LONG_TAIL_PAGES, null, 2);
process.stdout.write(json);
`)
let pagesJson
try {
  pagesJson = execSync(`npx tsx "${tmpScript}"`, {
    cwd: path.join(__dirname, '..'),
    encoding: 'utf-8',
    stdio: ['pipe', 'pipe', 'pipe'],
  })
} finally {
  if (fs.existsSync(tmpScript)) fs.unlinkSync(tmpScript)
}

const pages = JSON.parse(pagesJson)
console.log(`Loaded ${pages.length} cron long-tail pages`)

let enriched = 0
let kept = 0

for (const page of pages) {
  const cls = classifyPage(page)
  const newExplanation = generateExplanation(page, cls)
  const newFaq = generateFaq(page, cls)

  const explanationChanged = newExplanation !== page.explanation
  const faqChanged = JSON.stringify(newFaq) !== JSON.stringify(page.faq)

  if (explanationChanged || faqChanged) {
    page.explanation = newExplanation
    page.faq = newFaq
    enriched++
  } else {
    kept++
  }
}

console.log(`Enriched: ${enriched}, Kept (already rich): ${kept}`)

// Rebuild the TS file
const tsContent = rebuildTsFile(pages)

if (DRY_RUN) {
  console.log('\n[DRY RUN] Would write to ' + DATA_FILE)
  // Show a sample
  const sample = pages.find(p => p.slug === 'every-10-minutes')
  if (sample) {
    console.log(`\n--- Sample: ${sample.slug} ---`)
    console.log(`Explanation (${sample.explanation.split(' ').length} words):`)
    console.log(sample.explanation.substring(0, 200) + '...')
    console.log(`FAQ: ${sample.faq.length} items`)
  }
} else {
  fs.writeFileSync(DATA_FILE, tsContent)
  console.log(`\nWrote enriched data to ${DATA_FILE}`)
}

// JSON.stringify uses double quotes, but vite.config.ts reads slugs
// with regex: slug: '([^']+)'. Use single-quote format for slug fields.
function sq(s) {
  // Single-quote a string, escaping internal single quotes and backslashes
  return "'" + String(s).replace(/\\/g, '\\\\').replace(/'/g, "\\'") + "'"
}

function rebuildTsFile(pages) {
  let out = `// src/cron/seo/long-tail-data.ts\n`
  out += `// Auto-enriched by scripts/codegen-cron-long-tail.cjs\n`
  out += `// Do not edit explanation/faq manually — they are auto-generated.\n`
  out += `// Edit title, h1, description, keywords, cron, slug as needed.\n\n`

  out += `export interface LongTailPage {\n`
  out += `  slug: string\n`
  out += `  cron: string\n`
  out += `  title: string\n`
  out += `  h1: string\n`
  out += `  description: string\n`
  out += `  explanation: string\n`
  out += `  faq: { q: string; a: string }[]\n`
  out += `  keywords: string[]\n`
  out += `}\n\n`

  out += `export const LONG_TAIL_PAGES: LongTailPage[] = [\n`

  for (const page of pages) {
    out += `  {\n`
    // Use single quotes for slug (vite.config.ts regex needs this)
    out += `    slug: ${sq(page.slug)},\n`
    out += `    cron: ${sq(page.cron)},\n`
    out += `    title: ${JSON.stringify(page.title)},\n`
    out += `    h1: ${JSON.stringify(page.h1)},\n`
    out += `    description: ${JSON.stringify(page.description)},\n`

    // Multi-line explanation for readability
    out += `    explanation: ${JSON.stringify(page.explanation)},\n`

    out += `    faq: [\n`
    for (const f of page.faq) {
      out += `      { q: ${JSON.stringify(f.q)}, a: ${JSON.stringify(f.a)} },\n`
    }
    out += `    ],\n`

    out += `    keywords: ${JSON.stringify(page.keywords)},\n`
    out += `  },\n`
  }

  out += `]\n`

  return out
}
