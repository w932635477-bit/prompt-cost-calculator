import { useEffect } from 'react'

interface FaqItem {
  question: string
  answer: string
}

/**
 * Renders FAQPage JSON-LD structured data for Google rich snippets.
 * Drop at the end of any page component that has FAQ items.
 * The schema is injected into <head> so Google picks it up from static HTML.
 */
export function FaqSchema({ items }: { items: FaqItem[] }) {
  useEffect(() => {
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
