import type { Translations } from './types'

export const en: Translations = {
  meta: {
    title: 'Cron Expression Generator & Explainer | Free Online Tool',
    description: 'Free cron expression generator, explainer, and converter. Supports Unix, Quartz, and AWS EventBridge. Natural language input, visual builder, next run times.',
  },
  header: {
    title: 'Cron Expression Generator',
    subtitle: 'Build, explain, and convert cron expressions. Supports Unix, Quartz, and AWS EventBridge.',
    homeLink: 'AI Cost Calculator',
  },
  expression: {
    label: 'Expression',
    invalid: 'Invalid cron expression',
  },
  tabs: {
    builder: 'Builder',
    explainer: 'Explainer',
  },
  nl: {
    placeholder: 'Try: "every 5 minutes", "weekdays at 9am", "daily"...',
    button: 'Generate',
    error: 'Pattern not recognized. Try one of the suggestions below, or use the builder.',
  },
  builder: {
    fields: ['minute', 'hour', 'day of month', 'month', 'day of week'],
    presets: {
      minute: [
        { label: 'Every minute', value: '*' },
        { label: 'Every 5', value: '*/5' },
        { label: 'Every 10', value: '*/10' },
        { label: 'Every 15', value: '*/15' },
        { label: 'Every 30', value: '*/30' },
        { label: '0 (top)', value: '0' },
        { label: '30', value: '30' },
      ],
      hour: [
        { label: 'Every hour', value: '*' },
        { label: 'Every 2', value: '*/2' },
        { label: 'Every 3', value: '*/3' },
        { label: 'Every 6', value: '*/6' },
        { label: 'Every 12', value: '*/12' },
        { label: '0 (midnight)', value: '0' },
        { label: '6 AM', value: '6' },
        { label: '9 AM', value: '9' },
        { label: '12 PM', value: '12' },
        { label: '6 PM', value: '18' },
        { label: '9 PM', value: '21' },
      ],
      dayOfMonth: [
        { label: 'Every day', value: '*' },
        { label: '1st', value: '1' },
        { label: '15th', value: '15' },
        { label: 'Last day (28)', value: '28' },
      ],
      month: [
        { label: 'Every month', value: '*' },
        { label: 'Jan', value: '1' },
        { label: 'Jul', value: '7' },
      ],
      dayOfWeek: [
        { label: 'Every day', value: '*' },
        { label: 'Mon-Fri', value: '1-5' },
        { label: 'Sat-Sun', value: '0,6' },
        { label: 'Mon', value: '1' },
        { label: 'Tue', value: '2' },
        { label: 'Wed', value: '3' },
        { label: 'Thu', value: '4' },
        { label: 'Fri', value: '5' },
        { label: 'Sat', value: '6' },
        { label: 'Sun', value: '0' },
      ],
    },
  },
  explainer: {
    placeholder: 'Paste any cron expression (e.g., 0 9 * * 1-5)',
    button: 'Explain',
    error: 'Invalid cron expression. Use 5 fields: minute hour day month weekday',
  },
  dialect: {
    unix: 'Unix',
    quartz: 'Quartz',
    aws: 'AWS',
    unixDesc: '5 fields (crontab)',
    quartzDesc: '6-7 fields (Java)',
    awsDesc: 'EventBridge',
  },
  copy: {
    label: 'Copy',
    copied: 'Copied!',
  },
  nextRuns: {
    title: 'Next 10 executions (UTC)',
  },
  patterns: {
    title: 'Common Cron Patterns',
    items: [
      { description: 'Every minute', cron: '* * * * *' },
      { description: 'Every 5 minutes', cron: '*/5 * * * *' },
      { description: 'Every 10 minutes', cron: '*/10 * * * *' },
      { description: 'Every 30 minutes', cron: '*/30 * * * *' },
      { description: 'Every hour', cron: '0 * * * *' },
      { description: 'Every 2 hours', cron: '0 */2 * * *' },
      { description: 'Every 6 hours', cron: '0 */6 * * *' },
      { description: 'Every day at midnight', cron: '0 0 * * *' },
      { description: 'Every day at 9 AM', cron: '0 9 * * *' },
      { description: 'Every day at noon', cron: '0 12 * * *' },
      { description: 'Weekdays at 9 AM', cron: '0 9 * * 1-5' },
      { description: 'Weekdays at 5 PM', cron: '0 17 * * 1-5' },
      { description: 'Every Monday at 9 AM', cron: '0 9 * * 1' },
      { description: 'Every Friday at 5 PM', cron: '0 17 * * 5' },
      { description: 'First day of month', cron: '0 0 1 * *' },
      { description: '15th of every month', cron: '0 0 15 * *' },
      { description: 'Every Sunday at noon', cron: '0 12 * * 0' },
      { description: 'Weekends at midnight', cron: '0 0 * * 0,6' },
    ],
  },
  faq: {
    title: 'Frequently Asked Questions',
    items: [
      {
        q: 'What is a cron expression?',
        a: 'A cron expression is a string of 5 fields that defines a schedule: minute (0-59), hour (0-23), day of month (1-31), month (1-12), and day of week (0-6, where 0 is Sunday). Special characters: * (any), , (list), - (range), / (step).',
      },
      {
        q: 'What is the difference between Unix, Quartz, and AWS cron?',
        a: 'Unix cron has 5 fields. Quartz (used in Java) adds a seconds field and optional year field (6-7 fields total), and uses ? instead of * for day fields. AWS EventBridge uses cron() or rate() expressions with a year field.',
      },
      {
        q: 'How do I run a cron job every 5 minutes?',
        a: 'Use */5 * * * * (Unix), 0 */5 * ? * * * (Quartz), or rate(5 minutes) (AWS). The */5 means "every 5th value" in the minute field.',
      },
      {
        q: 'How do I run a cron job on weekdays only?',
        a: 'Use 0 9 * * 1-5 to run at 9:00 AM Monday through Friday. The 1-5 in the day-of-week field means Monday(1) to Friday(5).',
      },
      {
        q: 'Is this tool free?',
        a: 'Yes, completely free. No login required. All processing happens in your browser. No data is sent to any server.',
      },
    ],
  },
  footer: {
    text: 'Free cron expression generator. No login, no data collection.',
    link: 'AI Prompt Cost Calculator',
  },
  languageSwitcher: {
    label: 'Language',
  },
}
