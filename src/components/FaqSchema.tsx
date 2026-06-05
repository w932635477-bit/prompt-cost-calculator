import { useEffect } from 'react'

interface FaqItem {
  question: string
  answer: string
}

/**
 * Returns true if the document already contains a FAQPage JSON-LD block
 * (e.g. one hardcoded into the static HTML by a generator script).
 * Prevents this component from injecting a second FAQPage, which Google
 * Search Console flags as "Duplicate field FAQPage".
 */
function hasExistingFaqPage(): boolean {
  const scripts = document.querySelectorAll<HTMLScriptElement>(
    'script[type="application/ld+json"]'
  )
  for (const script of scripts) {
    if (script.dataset.faqSchema === 'true') continue // skip our own injected node
    try {
      const json = JSON.parse(script.textContent || '{}')
      const types = Array.isArray(json) ? json.map(n => n?.['@type']) : [json?.['@type']]
      if (types.includes('FAQPage')) return true
    } catch {
      // Malformed JSON-LD: fall back to a substring check so we still
      // defer to a pre-existing static block rather than risk a duplicate.
      if ((script.textContent || '').includes('"FAQPage"')) return true
    }
  }
  return false
}

/**
 * Renders FAQPage JSON-LD structured data for Google rich snippets.
 * Drop at the end of any page component that has FAQ items. Injects into
 * <head> only when the page has no static FAQPage, so Search Console never
 * sees a duplicate.
 */
export function FaqSchema({ items }: { items: FaqItem[] }) {
  useEffect(() => {
    // A static FAQPage (from the page's HTML template / generator) is the
    // single source of truth when present. Only inject when none exists.
    if (hasExistingFaqPage()) return

    const schema = {
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: items.map(item => ({
        '@type': 'Question',
        name: item.question,
        acceptedAnswer: {
          '@type': 'Answer',
          text: item.answer,
        },
      })),
    }

    const script = document.createElement('script')
    script.type = 'application/ld+json'
    script.textContent = JSON.stringify(schema)
    script.dataset.faqSchema = 'true'
    document.head.appendChild(script)

    return () => {
      script.remove()
    }
  }, [items])

  return null
}
