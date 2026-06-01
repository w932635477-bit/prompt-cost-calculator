import type { ValidatorSubPage } from '../lib/types'

export const VALIDATOR_SUB_PAGES: ValidatorSubPage[] = [
  {
    slug: 'quartz',
    dialect: 'quartz',
    title: 'Quartz Cron Validator — Test Quartz Expressions Online',
    h1: 'Quartz Cron Expression Validator',
    description: 'Validate Quartz cron expressions online. Check 6-7 field Quartz syntax with ? L W # tokens. Get human-readable explanations, next run times, and fix suggestions for Quartz Scheduler.',
    explanation: 'Quartz Scheduler uses 6 or 7 field cron expressions. Unlike Unix cron, Quartz starts with a seconds field and supports special tokens: ? (no specific value), L (last), W (weekday), and # (nth day). Day-of-month and day-of-week fields cannot both be specific — one must be "?".',
    faq: [
      {
        q: 'What is the difference between Unix and Quartz cron?',
        a: 'Unix cron has 5 fields (minute hour day-of-month month day-of-week). Quartz has 6-7 fields, adding seconds as the first field and optionally year as the last. Quartz also requires one of day-of-month or day-of-week to be "?".',
      },
      {
        q: 'What does "?" mean in Quartz cron?',
        a: 'The "?" token means "no specific value". In Quartz, you must use "?" for either day-of-month or day-of-week when the other field has a specific value. You cannot have both fields set to specific values.',
      },
      {
        q: 'What does "L" mean in Quartz cron?',
        a: '"L" stands for "last". In the day-of-month field, "L" means the last day of the month. In the day-of-week field, "L" combined with a day number means "the last [day] of the month" (e.g., "FRIL" = last Friday).',
      },
      {
        q: 'Why does my Quartz cron fail in production but passes the validator?',
        a: 'Some Quartz implementations have version-specific behavior. This validator checks standard Quartz 2.x syntax. Check your Quartz version and verify any custom cron triggers.',
      },
    ],
    keywords: ['quartz cron validator', 'quartz cron expression validator', 'validate quartz cron', 'quartz scheduler cron check', 'quartz cron syntax'],
    exampleExpressions: ['0 */5 * * * ?', '0 0 12 ? * MON-FRI', '0 0 12 LW * ?', '0 30 10 ? * 6#3'],
  },
  {
    slug: 'kubernetes',
    dialect: 'kubernetes',
    title: 'Kubernetes CronJob Validator — Test K8s Schedule Online',
    h1: 'Kubernetes CronJob Validator',
    description: 'Validate Kubernetes CronJob schedule expressions online. Check your K8s cron syntax, get next run times in UTC, and see common errors. Supports standard 5-field cron for Kubernetes CronJobs.',
    explanation: 'Kubernetes CronJobs use standard 5-field Unix cron syntax in the spec.schedule field. By default, all times are in UTC. Kubernetes 1.27+ supports a timeZone field. K8s does not support @shorthand notation (@daily, @hourly) — you must use the full 5-field expression.',
    faq: [
      {
        q: 'Does Kubernetes support @daily or @hourly in CronJobs?',
        a: 'No. Kubernetes CronJobs only support standard 5-field cron expressions. Use 0 0 * * * for daily or 0 * * * * for hourly instead of @daily or @hourly.',
      },
      {
        q: 'What timezone does Kubernetes CronJob use?',
        a: 'By default, Kubernetes CronJobs run in UTC. Starting from Kubernetes 1.27, you can set the timeZone field in the CronJob spec to use a specific timezone (e.g., "America/New_York").',
      },
      {
        q: 'Why does my K8s CronJob not run at the expected time?',
        a: 'The most common cause is UTC vs local time confusion. K8s schedules run in UTC by default. For example, "0 9 * * *" means 9 AM UTC, not 9 AM in your local timezone. Set the timeZone field if you need local time.',
      },
      {
        q: 'How do I prevent overlapping K8s CronJob runs?',
        a: 'Set concurrencyPolicy to "Forbid" in your CronJob spec to prevent concurrent runs. You can also use startingDeadlineSeconds and successfulJobsHistoryLimit to manage job lifecycle.',
      },
    ],
    keywords: ['kubernetes cron validator', 'k8s cronjob validator', 'kubernetes cron expression check', 'k8s schedule validator', 'cronjob cron test'],
    exampleExpressions: ['*/5 * * * *', '0 9 * * 1-5', '0 0 1 * *', '30 6 * * 0'],
  },
  {
    slug: 'aws-eventbridge',
    dialect: 'aws',
    title: 'AWS EventBridge Cron Validator — Test AWS Schedules Online',
    h1: 'AWS EventBridge Cron Validator',
    description: 'Validate AWS EventBridge cron expressions online. Check 6-field AWS cron syntax with year field, get fix suggestions for common errors, and see next run times.',
    explanation: 'AWS EventBridge (formerly CloudWatch Events) uses 6-field cron expressions: minute hour day-of-month month day-of-week year. Unlike Unix cron, AWS requires one of day-of-month or day-of-week to be "?". The year field is required. Expressions are wrapped in cron().',
    faq: [
      {
        q: 'What is the AWS EventBridge cron format?',
        a: 'AWS EventBridge uses cron(minute hour day-of-month month day-of-week year) with 6 fields. One of day-of-month or day-of-week must be "?". The year field is required — use "*" for every year.',
      },
      {
        q: 'Why does AWS require "?" in cron expressions?',
        a: 'AWS EventBridge requires that day-of-month and day-of-week cannot both be specific values. One must be "?" (no specific value). This avoids ambiguity when both fields could match different schedules.',
      },
      {
        q: 'Does AWS EventBridge support rate expressions?',
        a: 'Yes. AWS EventBridge also supports rate(N unit) expressions (e.g., rate(5 minutes), rate(1 hour)) as an alternative to cron. This validator focuses on cron expressions.',
      },
      {
        q: 'What timezone does AWS EventBridge use for cron?',
        a: 'AWS EventBridge evaluates cron expressions in UTC by default. There is no timezone field in the cron expression itself. Use UTC times when specifying your schedule.',
      },
    ],
    keywords: ['aws eventbridge cron validator', 'aws cron expression validator', 'eventbridge cron check', 'aws cloudwatch cron', 'aws schedule validator'],
    exampleExpressions: ['cron(0/5 * * * ? *)', 'cron(0 12 ? * MON-FRI *)', 'cron(0 0 1 * ? *)', 'cron(30 10 * * ? 2026)'],
  },
]
