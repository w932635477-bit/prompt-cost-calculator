// src/finder/chat/ChatFinder.tsx
// Main page: hero + wizard → recommendations + FAQ + cross-links

import { useState, useEffect } from 'react'
import { GlobalNav } from '../../components/GlobalNav'
import ScenarioWizard from './ScenarioWizard'
import RecommendationCard from './RecommendationCard'
import { recommend } from './finder-engine'
import type { Recommendation } from './finder-engine'
import type { WizardOption } from './finder-data'

const FAQ = [
  {
    q: 'How does this finder differ from a "best team chat app" list?',
    a: 'Articles give you a static ranking. This finder asks 4 questions about your team size, communication style, priorities, and deployment preference, then ranks 6 platforms based on your context. Mattermost might rank first for an enterprise needing Slack compatibility and third for a privacy-focused solo user.',
  },
  {
    q: 'Which is the most Slack-like self-hosted chat?',
    a: 'Mattermost has the closest UI to Slack with channels, threads, and keyboard shortcuts. It even has a Slack import tool for migrating message history. Rocket.Chat is the second most similar.',
  },
  {
    q: 'Which has the best end-to-end encryption?',
    a: 'Element (Matrix) has the strongest E2E encryption, enabled by default in private rooms with cross-signed device verification. No other platform on this list matches its encryption maturity.',
  },
  {
    q: 'Can these handle hundreds of users?',
    a: 'Mattermost and Rocket.Chat both scale to thousands of users. Mattermost Enterprise has been deployed at organizations with 50,000+ users. Zulip is used at companies like Dropbox and Rust with thousands of active users.',
  },
  {
    q: 'How are the dimension scores calculated?',
    a: 'Each platform has a tag set (for example "e2e_encryption", "threaded", "docker_easy"). Each quiz answer assigns weights to relevant tags. A platform earns the weight for every matching tag. We normalize per-dimension so each axis is 0-10. The top 3 by total score are shown.',
  },
  {
    q: 'What about bridging to Slack or Discord?',
    a: 'Element (Matrix) has the strongest bridging story with mature bridges to Slack, Discord, IRC, Telegram, and WhatsApp. This lets you migrate gradually instead of cutting over all at once.',
  },
]

const TOOLS_HEADER_FACTS = [
  { label: '6 platforms', sub: 'self-hosted open source' },
  { label: '4 dimensions', sub: 'team / style / priority / deploy' },
  { label: 'Top 3 ranked', sub: 'with per-axis scores' },
]

export default function ChatFinder() {
  const [recommendations, setRecommendations] = useState<Recommendation[] | null>(null)
  const [chosenOption, setChosenOption] = useState<WizardOption | null>(null)

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const team = params.get('team')
    const style = params.get('style')
    const priority = params.get('priority')
    const deploy = params.get('deploy')
    if (team && style && priority && deploy) {
      const opt = { team, style, priority, deploy } as WizardOption
      setChosenOption(opt)
      setRecommendations(recommend(opt))
    }
  }, [])

  const handleComplete = (opt: WizardOption) => {
    const recs = recommend(opt)
    setChosenOption(opt)
    setRecommendations(recs)

    const params = new URLSearchParams(opt as unknown as Record<string, string>)
    window.history.replaceState({}, '', `?${params.toString()}`)

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
      <GlobalNav current="/finder/chat/" />

      <main className="max-w-[820px] mx-auto px-6 py-10">
        {/* Hero */}
        <section className="mb-8">
          <div className="text-xs font-medium text-[#0071E3] uppercase tracking-wide mb-2">
            Self-Hosted Tool Finder
          </div>
          <h1 className="text-3xl md:text-4xl font-semibold text-[#1d1d1f] tracking-tight mb-3">
            Find Your Self-Hosted Team Chat Platform
          </h1>
          <p className="text-[#86868b] text-lg leading-relaxed mb-5">
            Answer 4 questions about your team size, communication style, priorities, and
            deployment. Get 3 tailored self-hosted chat recommendations with Docker setup — in 60 seconds.
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
            <div className="bg-white rounded-2xl shadow-sm p-5 mb-5 flex items-center justify-between gap-4">
              <div className="min-w-0 flex-1">
                <div className="text-xs text-[#86868b] mb-1">Your scenario</div>
                <div className="text-sm text-[#1d1d1f] flex flex-wrap gap-x-3 gap-y-1">
                  <span><span className="text-[#86868b]">Team:</span> {chosenOption?.team?.replace('_', ' ')}</span>
                  <span><span className="text-[#86868b]">Style:</span> {chosenOption?.style?.replace('_', ' ')}</span>
                  <span><span className="text-[#86868b]">Priority:</span> {chosenOption?.priority}</span>
                  <span><span className="text-[#86868b]">Deploy:</span> {chosenOption?.deploy}</span>
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

        {/* Cross-links */}
        <section className="bg-white rounded-2xl shadow-sm p-5 mb-8">
          <h2 className="text-base font-semibold text-[#1d1d1f] tracking-tight mb-3">
            Explore Further
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
            <a
              href="/alternatives/slack/"
              className="flex items-center justify-between p-3 rounded-xl bg-[#f5f5f7]/50 hover:bg-[#f5f5f7] transition-colors"
            >
              <span className="text-[#1d1d1f]">Self-Hosted Slack Alternatives</span>
              <span className="text-[#86868b]">→</span>
            </a>
            <a
              href="/alternatives/discord/"
              className="flex items-center justify-between p-3 rounded-xl bg-[#f5f5f7]/50 hover:bg-[#f5f5f7] transition-colors"
            >
              <span className="text-[#1d1d1f]">Self-Hosted Discord Alternatives</span>
              <span className="text-[#86868b]">→</span>
            </a>
            <a
              href="/compare/zulip-vs-mattermost/"
              className="flex items-center justify-between p-3 rounded-xl bg-[#f5f5f7]/50 hover:bg-[#f5f5f7] transition-colors"
            >
              <span className="text-[#1d1d1f]">Zulip vs Mattermost (full comparison)</span>
              <span className="text-[#86868b]">→</span>
            </a>
            <a
              href="/compare/mattermost-vs-rocketchat/"
              className="flex items-center justify-between p-3 rounded-xl bg-[#f5f5f7]/50 hover:bg-[#f5f5f7] transition-colors"
            >
              <span className="text-[#1d1d1f]">Mattermost vs Rocket.Chat (full comparison)</span>
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
      </main>
    </div>
  )
}
