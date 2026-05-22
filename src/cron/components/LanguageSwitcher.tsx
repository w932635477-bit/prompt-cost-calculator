import { useState, useRef, useEffect } from 'react'
import { ALL_LOCALES, LOCALE_LABELS } from '../i18n/types'
import type { Locale } from '../i18n/types'

const BASE_PATH = '/cron-generator'

export function LanguageSwitcher({ currentLocale }: { currentLocale: Locale }) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const switchLocale = (locale: Locale) => {
    const url = locale === 'en' ? `${BASE_PATH}/` : `${BASE_PATH}/${locale}/`
    window.location.href = url
  }

  return (
    <div ref={ref} className="relative inline-block">
      <button
        onClick={() => setOpen(!open)}
        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-[12px] font-medium text-slate-500 bg-white border border-slate-200 rounded-lg hover:border-slate-300 hover:text-slate-700 transition-all"
      >
        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
        </svg>
        {LOCALE_LABELS[currentLocale]}
        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      {open && (
        <div className="absolute right-0 top-full mt-1 py-1 bg-white border border-slate-200 rounded-lg shadow-lg z-50 min-w-[140px]">
          {ALL_LOCALES.map(locale => (
            <button
              key={locale}
              onClick={() => switchLocale(locale)}
              className={`w-full text-left px-3 py-1.5 text-[13px] transition-colors ${
                locale === currentLocale
                  ? 'text-blue-600 font-medium bg-blue-50'
                  : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              {LOCALE_LABELS[locale]}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
