// src/finder/notes/NotesFinder.tsx
// Main page: hero + wizard → recommendations + FAQ + cross-links

import { useState, useEffect } from 'react'
import { GlobalNav } from '../../components/GlobalNav'
import { RelatedTools } from '../../components/RelatedTools'
import ScenarioWizard from './ScenarioWizard'
import RecommendationCard from './RecommendationCard'
import { recommend } from './finder-engine'
import type { Recommendation } from './finder-engine'
import type { WizardOption } from './finder-data'

const FAQ = [
  {
    q: 'How does this finder differ from a "best note-taking app" article?',
    a: 'Articles give you a static ranked list. This finder asks 4 questions about your actual situation (team size, technical comfort, hosting environment, key need), then ranks the same 7 tools based on your context. The same tool can rank #1 for a solo privacy-focused user and #5 for a small team needing collaboration.',
  },
  {
    q: 'Are these tools really 100% free?',
    a: 'All 7 candidates are free to self-host on your own server. Five are fully open-source (AGPL/MIT). Outline is BSL-1.1 (source-available). Obsidian is proprietary but free for personal use. Optional paid features exist for hosted versions and sync.',
  },
  {
    q: 'Can I migrate from Notion to any of these?',
    a: 'AppFlowy supports direct Notion import. Obsidian + the official Notion importer plugin handles markdown export. Logseq imports markdown. Outline imports Markdown/Confluence/Trello. Joplin imports Evernote ENEX, OneNote, Markdown.',
  },
  {
    q: 'What if none of these fit my use case?',
    a: 'Browse the full Self-Hosted Notion Alternatives page or the Notion vs Obsidian comparison for deeper analysis. The finder picks the best 3 from this list — the wider catalogue may have edge-case fits.',
  },
  {
    q: 'How are the dimension scores calculated?',
    a: 'Each tool has a tag set (e.g. "docker", "e2e_encryption", "raspberry_pi"). Each wizard answer assigns weights to relevant tags. A tool earns the weight for every tag it has matching your answer. We normalize per-dimension so each axis is 0-10. The total score (hidden) sorts the top 3.',
  },
  {
    q: 'Why don\'t you show a total score?',
    a: 'Total scores hide tradeoffs. A tool with 7 + 7 + 7 + 7 looks identical to one with 10 + 10 + 5 + 3, but they\'re very different fits. Per-dimension scores let you see where each tool wins and where it falls short.',
  },
]

const TOOLS_HEADER_FACTS = [
  { label: '7 tools evaluated', sub: 'open-source self-hosted' },
  { label: '4 dimensions', sub: 'team / tech / host / need' },
  { label: 'Top 3 ranked', sub: 'with per-axis scores' },
]

export default function NotesFinder() {
  const [recommendations, setRecommendations] = useState<Recommendation[] | null>(null)
  const [chosenOption, setChosenOption] = useState<WizardOption | null>(null)

  // Read URL params for shareable links
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const team = params.get('team')
    const tech = params.get('tech')
    const host = params.get('host')
    const need = params.get('need')
    if (team && tech && host && need) {
      const opt = { team, tech, host, need } as WizardOption
      setChosenOption(opt)
      setRecommendations(recommend(opt))
    }
  }, [])

  const handleComplete = (opt: WizardOption) => {
    const recs = recommend(opt)
    setChosenOption(opt)
    setRecommendations(recs)

    // Update URL for sharing
    const params = new URLSearchParams(opt as unknown as Record<string, string>)
    window.history.replaceState({}, '', `?${params.toString()}`)

    // Smooth scroll to results
    setTimeout(() => {
      document.getElementById('results')?.scrollIntoView({ behavior: 'smooth' })
    }, 100)
  }

  const reset = () => {
    setRecommendations(null)
    setChosenOption(null)
    window.history.replaceState({}, '', window.location.pathname)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <div className="min-h-screen bg-[#f5f5f7]">
      <GlobalNav current="/finder/notes/" />

      <main className="max-w-[820px] mx-auto px-6 py-10">
        {/* Hero */}
        <section className="mb-8">
          <div className="text-xs font-medium text-[#0071E3] uppercase tracking-wide mb-2">
            Self-Hosted Tool Finder
          </div>
          <h1 className="text-3xl md:text-4xl font-semibold text-[#1d1d1f] tracking-tight mb-3">
            Find Your Self-Hosted Note-Taking App
          </h1>
          <p className="text-[#86868b] text-lg leading-relaxed mb-5">
            Answer 4 questions about your team, tech level, and needs. Get 3 tailored
            open-source recommendations with Docker setup — in 60 seconds.
          </p>
          <div className="grid grid-cols-3 gap-3">
            {TOOLS_HEADER_FACTS.map((f, i) => (
              <div key={i} className="bg-white rounded-xl shadow-sm p-3">
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
            <div className="bg-white rounded-2xl shadow-sm p-5 mb-5 flex items-center justify-between gap-4">
              <div className="min-w-0 flex-1">
                <div className="text-xs text-[#86868b] mb-1">Your scenario</div>
                <div className="text-sm text-[#1d1d1f] flex flex-wrap gap-x-3 gap-y-1">
                  <span><span className="text-[#86868b]">Team:</span> {chosenOption?.team}</span>
                  <span><span className="text-[#86868b]">Tech:</span> {chosenOption?.tech}</span>
                  <span><span className="text-[#86868b]">Host:</span> {chosenOption?.host}</span>
                  <span><span className="text-[#86868b]">Need:</span> {chosenOption?.need}</span>
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
          </section>
        )}

        {/* Cross-links to alternatives & compare */}
        <section className="bg-white rounded-2xl shadow-sm p-5 mb-8">
          <h2 className="text-base font-semibold text-[#1d1d1f] tracking-tight mb-3">
            Explore Further
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
            <a
              href="/alternatives/notion/"
              className="flex items-center justify-between p-3 rounded-xl bg-[#f5f5f7]/50 hover:bg-[#f5f5f7] transition-colors"
            >
              <span className="text-[#1d1d1f]">Self-Hosted Notion alternatives</span>
              <span className="text-[#86868b]">→</span>
            </a>
            <a
              href="/alternatives/evernote/"
              className="flex items-center justify-between p-3 rounded-xl bg-[#f5f5f7]/50 hover:bg-[#f5f5f7] transition-colors"
            >
              <span className="text-[#1d1d1f]">Self-Hosted Evernote alternatives</span>
              <span className="text-[#86868b]">→</span>
            </a>
            <a
              href="/compare/notion-vs-obsidian/"
              className="flex items-center justify-between p-3 rounded-xl bg-[#f5f5f7]/50 hover:bg-[#f5f5f7] transition-colors"
            >
              <span className="text-[#1d1d1f]">Notion vs Obsidian (full comparison)</span>
              <span className="text-[#86868b]">→</span>
            </a>
            <a
              href="/compare/joplin-vs-obsidian/"
              className="flex items-center justify-between p-3 rounded-xl bg-[#f5f5f7]/50 hover:bg-[#f5f5f7] transition-colors"
            >
              <span className="text-[#1d1d1f]">Joplin vs Obsidian (full comparison)</span>
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
              <details key={i} className="group bg-white rounded-2xl shadow-sm overflow-hidden">
                <summary className="cursor-pointer p-5 text-base font-medium text-[#1d1d1f] group-open:text-[#0071E3] transition-colors">
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
        <RelatedTools currentPath="/finder/notes/" />
      </main>
    </div>
  )
}
