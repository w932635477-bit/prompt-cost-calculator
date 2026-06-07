import { GlobalNav } from '../components/GlobalNav'

interface ContentPageData {
  title: string
  h1: string
  description: string
  content: string
  faq?: { q: string; a: string }[]
  keywords: string[]
  canonical: string
  ogType: string
}

function getData(): ContentPageData | null {
  const el = document.getElementById('seo-data')
  if (!el) return null
  try { return JSON.parse(el.textContent || '{}') } catch { return null }
}

export default function ContentPageComponent() {
  const data = getData()
  if (!data) return <div className="p-8 text-center text-[#86868b]">Loading...</div>

  return (
    <div className="min-h-screen bg-[#f5f5f7]">
      <GlobalNav current={data.canonical} />

      <main className="max-w-[780px] mx-auto px-6 py-10">
        {/* Breadcrumb */}
        <nav className="text-sm text-[#86868b] mb-4" aria-label="Breadcrumb">
          <a href="/" className="hover:text-[#0071E3] transition-colors">Home</a>
          <span className="mx-1.5">/</span>
          <span className="text-[#1d1d1f]">{data.h1}</span>
        </nav>

        {/* Hero */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-semibold text-[#1d1d1f] tracking-tight mb-3">{data.h1}</h1>
          <p className="text-[#86868b] text-lg leading-relaxed">{data.description}</p>
        </div>

        {/* Content */}
        <article className="prose prose-lg max-w-none">
          <div className="bg-white rounded-2xl p-6 md:p-8 shadow-sm mb-8" dangerouslySetInnerHTML={{ __html: data.content }} />
        </article>

        {/* FAQ */}
        {data.faq && data.faq.length > 0 && (
          <div className="mb-10">
            <h2 className="text-2xl font-semibold text-[#1d1d1f] tracking-tight mb-6">Frequently Asked Questions</h2>
            <div className="space-y-3">
              {data.faq.map((item, i) => (
                <details key={i} className="group bg-white rounded-2xl shadow-sm overflow-hidden">
                  <summary className="cursor-pointer p-5 text-base font-medium text-[#1d1d1f] group-open:text-[#0071E3] transition-colors">
                    {item.q}
                  </summary>
                  <div className="px-5 pb-5 text-base text-[#86868b] leading-relaxed" dangerouslySetInnerHTML={{ __html: item.a }} />
                </details>
              ))}
            </div>
          </div>
        )}

        {/* Footer */}
        <footer className="border-t border-[#e8e8ed] pt-6 text-center text-sm text-[#86868b]">
          <p>Free developer tools. No login required.</p>
          <p className="mt-2">
            <a href="/" className="text-[#0071E3] hover:underline">AI Cost Calculator</a>
            <span className="mx-1.5">·</span>
            <a href="/cron-generator/" className="text-[#0071E3] hover:underline">Cron Generator</a>
            <span className="mx-1.5">·</span>
            <a href="/compare/" className="text-[#0071E3] hover:underline">Tool Comparisons</a>
            <span className="mx-1.5">·</span>
            <a href="/mcp-servers/" className="text-[#0071E3] hover:underline">MCP Servers</a>
          </p>
        </footer>
      </main>
    </div>
  )
}
