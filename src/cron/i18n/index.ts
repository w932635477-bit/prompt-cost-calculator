import { createContext, useContext } from 'react'
import type { Translations, Locale } from './types'
import { en } from './en'

const translations: Record<Locale, Translations> = {
  en,
  // These will be populated by locale files
  zh: en, ja: en, es: en, pt: en, fr: en, de: en, ko: en,
}

// Lazy-load non-English translations to avoid bloating the bundle
const loaders: Record<string, () => Promise<Translations>> = {
  zh: () => import('./zh').then(m => m.zh),
  ja: () => import('./ja').then(m => m.ja),
  es: () => import('./es').then(m => m.es),
  pt: () => import('./pt').then(m => m.pt),
  fr: () => import('./fr').then(m => m.fr),
  de: () => import('./de').then(m => m.de),
  ko: () => import('./ko').then(m => m.ko),
}

export async function loadLocale(locale: Locale): Promise<Translations> {
  if (locale === 'en') return en
  const loader = loaders[locale]
  if (loader) {
    const t = await loader()
    translations[locale] = t
    return t
  }
  return en
}

interface I18nContextValue {
  locale: Locale
  t: Translations
}

const I18nContext = createContext<I18nContextValue>({
  locale: 'en',
  t: en,
})

export const I18nProvider = I18nContext.Provider

export function useT(): Translations {
  return useContext(I18nContext).t
}

export function useLocale(): Locale {
  return useContext(I18nContext).locale
}
