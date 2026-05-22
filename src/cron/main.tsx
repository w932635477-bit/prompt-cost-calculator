import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { Analytics } from '@vercel/analytics/react'
import '../index.css'
import CronGeneratorApp from './CronGeneratorApp'
import { I18nProvider, loadLocale } from './i18n'
import type { Locale } from './i18n/types'

const LOCALE = (document.documentElement.lang || 'en').split('-')[0] as Locale

async function boot() {
  const translations = await loadLocale(LOCALE)
  document.title = translations.meta.title
  createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <I18nProvider value={{ locale: LOCALE, t: translations }}>
        <CronGeneratorApp />
      </I18nProvider>
      <Analytics />
    </StrictMode>,
  )
}

boot()
