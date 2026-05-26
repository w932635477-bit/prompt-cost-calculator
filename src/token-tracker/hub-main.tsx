import { createRoot } from 'react-dom/client'
import '../index.css'
import { SCENE_PAGES } from './seo/scene-data'
import { GlobalNav } from '../components/GlobalNav'
import { EmailCapture } from '../components/EmailCapture'

function TokenTrackerHub() {
  return (
    <div className="min-h-screen bg-[#f5f5f7]">
      <GlobalNav current="/token-tracker/" />

      <main className="max-w-[780px] mx-auto px-6 py-10">
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-semibold text-[#1d1d1f] tracking-tight mb-3">
            AI Token Cost Tracker
          </h1>
          <p className="text-[#86868b] text-lg leading-relaxed">
            Estimate monthly AI costs for common use cases. Pre-built calculators for chatbots, RAG pipelines, AI agents, and coding assistants.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-10">
          {SCENE_PAGES.map(page => (
            <a
              key={page.slug}
              href={`/token-tracker/${page.slug}/`}
              className="bg-white rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow group"
            >
              <h2 className="text-base font-semibold text-[#1d1d1f] group-hover:text-[#0071E3] transition-colors mb-1.5">
                {page.h1}
              </h2>
              <p className="text-sm text-[#86868b] leading-relaxed line-clamp-2 mb-3">{page.description}</p>
              <span className="text-xs bg-[#0071E3]/10 text-[#0071E3] px-2.5 py-0.5 rounded-full font-medium">
                {page.defaultCallsPerMonth.toLocaleString()} calls/mo
              </span>
            </a>
          ))}
        </div>

        <div className="mb-10 bg-white rounded-2xl p-5 shadow-sm">
          <div className="flex items-start gap-3">
            <span className="text-lg">🧮</span>
            <div>
              <a href="/?ref=token-tracker" className="font-medium text-[#1d1d1f] hover:text-[#0071E3] transition-colors">
                Custom Prompt Calculator
              </a>
              <p className="text-sm text-[#86868b] mt-1">Enter your own prompt and usage to calculate costs across all models.</p>
            </div>
          </div>
        </div>

        <footer className="border-t border-[#e8e8ed] pt-6 text-center text-sm text-[#86868b]">
          <p>Free AI cost tracking tools. No login required.</p>
          <p className="mt-2">
            <a href="/" className="text-[#0071E3] hover:underline">AI Cost Calculator</a>
            <span className="mx-1.5">&middot;</span>
            <a href="/compare/" className="text-[#0071E3] hover:underline">Compare</a>
            <span className="mx-1.5">&middot;</span>
            <a href="/alternatives/" className="text-[#0071E3] hover:underline">Self-Hosted Alternatives</a>
          </p>
        </footer>
      </main>
    </div>
  )
}

createRoot(document.getElementById('root')!).render(
  <>
    <TokenTrackerHub />
    <EmailCapture source="token-tracker" />
  </>,
)
