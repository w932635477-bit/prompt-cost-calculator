import { GlobalNav } from '../components/GlobalNav'

interface GuideSection {
  heading: string
  body: React.ReactNode
}

interface GuideData {
  title: string
  subtitle: string
  canonicalUrl: string
  sections: GuideSection[]
}

export function GuidePage({ guide }: { guide: GuideData }) {
  return (
    <div className="min-h-screen bg-[#f5f5f7] text-[#1d1d1f]">
      <GlobalNav current="/ai-code-review/" />

      <header className="max-w-[780px] mx-auto px-4 pt-12 pb-4">
        <nav className="text-xs text-[#86868b] mb-4">
          <a href="/ai-code-review/" className="hover:text-[#0071E3]">AI Code Review</a>
          <span className="mx-1.5">/</span>
          <span className="text-[#1d1d1f]">{guide.title}</span>
        </nav>
        <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight mb-3">{guide.title}</h1>
        <p className="text-lg text-[#86868b]">{guide.subtitle}</p>
      </header>

      <main className="max-w-[780px] mx-auto px-4 pb-16">
        {guide.sections.map((section, i) => (
          <section key={i} className="mt-6 bg-white rounded-2xl p-5 shadow-sm">
            <h2 className="text-base font-semibold mb-3">{section.heading}</h2>
            <div className="text-sm text-[#424245] leading-relaxed">{section.body}</div>
          </section>
        ))}

        {/* CTA to main checklist */}
        <section className="mt-6 bg-[#0071E3]/5 rounded-2xl p-6 text-center border border-[#0071E3]/20">
          <h2 className="text-lg font-semibold mb-2">Try the interactive checklist</h2>
          <p className="text-sm text-[#86868b] mb-4">
            25 checks across 7 categories. Check items, get a score, copy the report into your PR.
          </p>
          <a
            href="/ai-code-review/"
            className="inline-block px-6 py-2.5 bg-[#0071E3] text-white rounded-full text-sm font-medium hover:bg-[#0077ED] transition-colors"
          >
            Open AI Code Review Checklist
          </a>
        </section>

        {/* Cross-links */}
        <section className="mt-4 bg-white rounded-2xl p-5 shadow-sm">
          <h2 className="text-base font-semibold mb-3">Related tools</h2>
          <div className="grid sm:grid-cols-2 gap-3">
            <a
              href="/pii-redactor/"
              className="block p-4 rounded-xl border border-[#e8e8ed] hover:border-[#0071E3] hover:bg-[#0071E3]/5 transition-colors"
            >
              <div className="font-medium mb-0.5 text-sm">PII Redactor →</div>
              <div className="text-xs text-[#86868b]">Strip secrets from prompts before sending to LLMs</div>
            </a>
            <a
              href="/prompt-cache-calculator/"
              className="block p-4 rounded-xl border border-[#e8e8ed] hover:border-[#0071E3] hover:bg-[#0071E3]/5 transition-colors"
            >
              <div className="font-medium mb-0.5 text-sm">Cache Calculator →</div>
              <div className="text-xs text-[#86868b]">Compare prompt caching cost across vendors</div>
            </a>
          </div>
        </section>
      </main>

      <footer className="border-t border-[#e8e8ed] py-8 mt-8">
        <div className="max-w-[780px] mx-auto px-4 text-center text-xs text-[#86868b]">
          <p>Free, browser-only, no tracking.</p>
        </div>
      </footer>
    </div>
  )
}
