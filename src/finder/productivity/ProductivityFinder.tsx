// src/finder/productivity/ProductivityFinder.tsx
// Main page: hero + wizard → recommendations + cross-category pairings + FAQ

import { useState, useEffect } from 'react'
import { GlobalNav } from '../../components/GlobalNav'
import { RelatedTools } from '../../components/RelatedTools'
import ScenarioWizard from './ScenarioWizard'
import RecommendationCard from './RecommendationCard'
import { recommend, crossCategoryRecommendations } from './finder-engine'
import type { Recommendation } from './finder-engine'
import type { WizardOption, ToolCategory } from './finder-data'

const CATEGORY_LABEL: Record<ToolCategory, string> = {
  wiki: 'Wiki & Docs',
  project_management: 'Project Management',
  notes: 'Notes & Knowledge',
  chat: 'Team Chat',
  automation: 'Automation',
}

const FAQ = [
  {
    q: 'How does this finder work?',
    a: 'It asks 4 questions about your situation (tool type, team size, technical comfort, deployment preference), then scores 15 open-source tools across 4 dimensions and ranks the top 3 for your context.',
  },
  {
    q: 'Are these tools really free?',
    a: 'All 15 tools are free to self-host. Most are open-source (AGPL/MIT/Apache). Some offer optional paid cloud hosting or enterprise features. You pay nothing to run them on your own server.',
  },
  {
    q: 'What is "Pair It With"?',
    a: 'After showing the top 3 tools for your chosen category, the finder suggests the best tool from each other category. For example, if you picked a project management tool, we recommend the best wiki, chat, notes, and automation tool to pair with it.',
  },
  {
    q: 'Can I use this on a Raspberry Pi?',
    a: 'Several tools are lightweight enough for Pi or NAS devices. Answer "Low-resource" to the deployment question, and the finder will prioritize tools tagged as lightweight.',
  },
  {
    q: 'How are scores calculated?',
    a: 'Each tool has tags (e.g. "docker", "sso", "lightweight"). Your answers assign weights to relevant tags. A tool earns points for every matching tag. Scores are normalized per-dimension to 0-10.',
  },
]

const HEADER_FACTS = [
  { label: '15 tools evaluated', sub: 'across 5 categories' },
  { label: '4 dimensions', sub: 'need / team / tech / host' },
  { label: 'Top 3 ranked', sub: 'with per-axis scores' },
]

export default function ProductivityFinder() {
  const [recommendations, setRecommendations] = useState<Recommendation[] | null>(null)
  const [chosenOption, setChosenOption] = useState<WizardOption | null>(null)
  const [crossRecs, setCrossRecs] = useState<ReturnType<typeof crossCategoryRecommendations>>([])

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const need = params.get('need') as ToolCategory | null
    const team = params.get('team')
    const tech = params.get('tech')
    const host = params.get('host')
    if (need && team && tech && host) {
      const opt = { need, team, tech, host } as WizardOption
      setChosenOption(opt)
      setRecommendations(recommend(opt))
      setCrossRecs(crossCategoryRecommendations(opt, need))
    }
  }, [])

  const handleComplete = (opt: WizardOption) => {
    const recs = recommend(opt)
    setChosenOption(opt)
    setRecommendations(recs)
    setCrossRecs(crossCategoryRecommendations(opt, opt.need))

    const params = new URLSearchParams(opt as unknown as Record<string, string>)
    window.history.replaceState({}, '', `?${params.toString()}`)

    setTimeout(() => {
      document.getElementById('results')?.scrollIntoView({ behavior: 'smooth' })
    }, 100)
  }

  const reset = () => {
    setRecommendations(null)
    setChosenOption(null)
    setCrossRecs([])
    window.history.replaceState({}, '', window.location.pathname)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <div className="min-h-screen bg-[#f5f5f7]">
      <GlobalNav current="/finder/productivity/" />

      <main className="max-w-[820px] mx-auto px-6 py-10">
        {/* Hero */}
        <section className="mb-8">
          <div className="text-xs font-medium text-[#0071E3] uppercase tracking-wide mb-2">
            Self-Hosted Tool Finder
          </div>
          <h1 className="text-3xl md:text-4xl font-semibold text-[#1d1d1f] tracking-tight mb-3">
            Find Your Self-Hosted Productivity Tool
          </h1>
          <p className="text-[#86868b] text-lg leading-relaxed mb-5">
            Answer 4 questions about your team and needs. Get 3 tailored
            open-source recommendations with Docker setup — in 60 seconds.
            Covers wiki, project management, notes, chat, and automation tools.
          </p>
          <div className="grid grid-cols-3 gap-3">
            {HEADER_FACTS.map((f, i) => (
              <div key={i} className="bg-white rounded-2xl p-3.5" style={{ boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
                <div className="text-sm font-medium text-[#1d1d1f]">{f.label}</div>
                <div className="text-xs text-[#86868b] mt-0.5">{f.sub}</div>
              </div>
            ))}
          </div>
        </section>

        {/* Wizard or Results */}
        {!recommendations ? (
          <ScenarioWizard onComplete={handleComplete} />
        ) : (
          <section id="results">
            {/* Summary of choices */}
            <div className="bg-white rounded-2xl p-5 mb-5 flex items-center justify-between gap-4" style={{ boxShadow: '0 2px 12px rgba(0,0,0,0.06), 0 0 1px rgba(0,0,0,0.08)' }}>
              <div className="min-w-0 flex-1">
                <div className="text-xs text-[#86868b] mb-1">Your scenario</div>
                <div className="text-sm text-[#1d1d1f] flex flex-wrap gap-x-3 gap-y-1">
                  <span><span className="text-[#86868b]">Need:</span> {CATEGORY_LABEL[chosenOption?.need as ToolCategory]}</span>
                  <span><span className="text-[#86868b]">Team:</span> {chosenOption?.team?.replace('_', ' ')}</span>
                  <span><span className="text-[#86868b]">Tech:</span> {chosenOption?.tech}</span>
                  <span><span className="text-[#86868b]">Host:</span> {chosenOption?.host?.replace('_', ' ')}</span>
                </div>
              </div>
              <button
                onClick={reset}
                className="shrink-0 text-sm text-[#0071E3] hover:underline"
                data-testid="reset-button"
              >
                Start over
              </button>
            </div>

            <div className="space-y-5 mb-10">
              <h2 className="text-2xl font-semibold text-[#1d1d1f] tracking-tight">
                Top 3 recommendations
              </h2>
              {recommendations.map(r => (
                <RecommendationCard key={r.tool.name} rec={r} />
              ))}
            </div>

            {/* Cross-category "Pair It With" */}
            {crossRecs.length > 0 && (
              <div className="mb-10">
                <h2 className="text-2xl font-semibold text-[#1d1d1f] tracking-tight mb-4">
                  Pair it with
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {crossRecs.map(cr => (
                    <a
                      key={cr.category}
                      href={cr.tool.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-3 bg-white rounded-2xl p-4 hover:shadow-md transition-shadow duration-200"
                      style={{ boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}
                    >
                      <span className="text-2xl">{cr.tool.logo}</span>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium text-[#1d1d1f]">{cr.tool.name}</div>
                        <div className="text-xs text-[#86868b]">{CATEGORY_LABEL[cr.category]}</div>
                      </div>
                      <span className="text-xs text-[#86868b]">→</span>
                    </a>
                  ))}
                </div>
              </div>
            )}
          </section>
        )}

        {/* Cross-links */}
        <section className="bg-white rounded-2xl p-5 mb-8" style={{ boxShadow: '0 2px 12px rgba(0,0,0,0.06), 0 0 1px rgba(0,0,0,0.08)' }}>
          <h2 className="text-base font-semibold text-[#1d1d1f] tracking-tight mb-3">
            Explore Further
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
            <a
              href="/alternatives/"
              className="flex items-center justify-between p-3 rounded-xl bg-[#f5f5f7]/50 hover:bg-[#f5f5f7] transition-colors"
            >
              <span className="text-[#1d1d1f]">All Self-Hosted Alternatives</span>
              <span className="text-[#86868b]">→</span>
            </a>
            <a
              href="/compare/"
              className="flex items-center justify-between p-3 rounded-xl bg-[#f5f5f7]/50 hover:bg-[#f5f5f7] transition-colors"
            >
              <span className="text-[#1d1d1f]">All Tool Comparisons</span>
              <span className="text-[#86868b]">→</span>
            </a>
            <a
              href="/finder/notes/"
              className="flex items-center justify-between p-3 rounded-xl bg-[#f5f5f7]/50 hover:bg-[#f5f5f7] transition-colors"
            >
              <span className="text-[#1d1d1f]">Notes Finder</span>
              <span className="text-[#86868b]">→</span>
            </a>
            <a
              href="/finder/chat/"
              className="flex items-center justify-between p-3 rounded-xl bg-[#f5f5f7]/50 hover:bg-[#f5f5f7] transition-colors"
            >
              <span className="text-[#1d1d1f]">Chat Finder</span>
              <span className="text-[#86868b]">→</span>
            </a>
          </div>
        </section>

        {/* FAQ */}
        <section className="mb-10">
          <h2 className="text-2xl font-semibold text-[#1d1d1f] tracking-tight mb-5">
            Frequently asked questions
          </h2>
          <div className="space-y-3">
            {FAQ.map((item, i) => (
              <details key={i} className="group bg-white rounded-2xl overflow-hidden" style={{ boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
                <summary className="cursor-pointer p-5 text-base font-medium text-[#1d1d1f] group-open:text-[#0071E3] transition-colors duration-200 hover:bg-[#f5f5f7]/30">
                  {item.q}
                </summary>
                <div className="px-5 pb-5 text-sm text-[#86868b] leading-relaxed">
                  {item.a}
                </div>
              </details>
            ))}
          </div>
        </section>

        {/* Footer */}
        <footer className="border-t border-[#e8e8ed] pt-6 pb-8 text-center text-sm text-[#86868b]">
          <p>Free scenario-based finder. No login, no tracking.</p>
          <p className="mt-2">
            <a href="/" className="text-[#0071E3] hover:underline">AI Cost Calculator</a>
            <span className="mx-2">·</span>
            <a href="/alternatives/" className="text-[#0071E3] hover:underline">All Alternatives</a>
            <span className="mx-2">·</span>
            <a href="/compare/" className="text-[#0071E3] hover:underline">Compare Tools</a>
          </p>
        </footer>
        <RelatedTools currentPath="/finder/productivity/" />
      </main>
    </div>
  )
}
