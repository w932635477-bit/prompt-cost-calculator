export interface Translations {
  meta: {
    title: string
    description: string
  }
  header: {
    title: string
    subtitle: string
    homeLink: string
  }
  expression: {
    label: string
    invalid: string
  }
  tabs: {
    builder: string
    explainer: string
  }
  nl: {
    placeholder: string
    button: string
    error: string
  }
  builder: {
    fields: [string, string, string, string, string]
    presets: {
      minute: { label: string; value: string }[]
      hour: { label: string; value: string }[]
      dayOfMonth: { label: string; value: string }[]
      month: { label: string; value: string }[]
      dayOfWeek: { label: string; value: string }[]
    }
  }
  explainer: {
    placeholder: string
    button: string
    error: string
  }
  dialect: {
    unix: string
    quartz: string
    aws: string
    unixDesc: string
    quartzDesc: string
    awsDesc: string
  }
  copy: {
    label: string
    copied: string
  }
  nextRuns: {
    title: string
  }
  patterns: {
    title: string
    items: { description: string; cron: string }[]
  }
  faq: {
    title: string
    items: { q: string; a: string }[]
  }
  footer: {
    text: string
    link: string
  }
  languageSwitcher: {
    label: string
  }
}

export type Locale = 'en' | 'zh' | 'ja' | 'es' | 'pt' | 'fr' | 'de' | 'ko'

export const LOCALE_LABELS: Record<Locale, string> = {
  en: 'English',
  zh: '中文',
  ja: '日本語',
  es: 'Español',
  pt: 'Português',
  fr: 'Français',
  de: 'Deutsch',
  ko: '한국어',
}

export const ALL_LOCALES: Locale[] = ['en', 'zh', 'ja', 'es', 'pt', 'fr', 'de', 'ko']
