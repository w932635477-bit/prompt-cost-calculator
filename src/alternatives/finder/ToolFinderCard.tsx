import { useState, useCallback } from 'react'
import { ALTERNATIVE_PAGES } from '../seo/alternatives-data'
import type { ScenarioInput, Recommendation } from './types'
import { findMatches } from './types'

type Option<T extends string> = { value: T; label: string }

const TEAM_OPTIONS: Option<ScenarioInput['teamSize']>[] = [
  { value: 'solo', label: 'Solo' },
  { value: 'small', label: 'Small Team' },
  { value: 'large', label: 'Enterprise' },
]

const TECH_OPTIONS: Option<ScenarioInput['techLevel']>[] = [
  { value: 'beginner', label: 'Beginner' },
  { value: 'intermediate', label: 'Intermediate' },
  { value: 'advanced', label: 'Advanced' },
]

const SERVER_OPTIONS: Option<ScenarioInput['server']>[] = [
  { value: 'vps', label: 'VPS' },
  { value: 'dedicated', label: 'Dedicated' },
  { value: 'nas', label: 'NAS / Pi' },
  { value: 'shared', label: 'Shared Hosting' },
]

const PRIORITY_OPTIONS: Option<ScenarioInput['priority']>[] = [
  { value: 'ease', label: 'Easy Setup' },
  { value: 'features', label: 'Features' },
  { value: 'performance', label: 'Performance' },
  { value: 'security', label: 'Security' },
]

function PillGroup<T extends string>({
  options,
  value,
  onChange,
}: {
  options: Option<T>[]
  value: T
  onChange: (v: T) => void
}) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {options.map(o => (
        <button
          key={o.value}
          onClick={() => onChange(o.value)}
          className={`px-3 py-1.5 rounded-full text-sm font-medium transition-[background-color,color] focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-1 active:scale-[0.97] ${
            value === o.value
              ? 'bg-blue-600 text-white'
              : 'bg-white text-gray-600 border border-gray-300 hover:border-gray-400 hover:bg-gray-50'
          }`}
        >
          {o.label}
        </button>
      ))}
    </div>
  )
}

function StrengthMeter({ status }: { status: 'strong' | 'moderate' | 'weak' }) {
  const filled = status === 'strong' ? 5 : status === 'moderate' ? 3 : 1
  const color = status === 'strong' ? 'bg-green-500' : status === 'moderate' ? 'bg-yellow-400' : 'bg-gray-300'
  const label = status === 'strong' ? 'Strong' : status === 'moderate' ? 'Moderate' : 'Weak'
  return (
    <span className="inline-flex items-center gap-1.5 shrink-0" aria-label={`${label} match`}>
      <span className="flex gap-0.5">
        {Array.from({ length: 5 }).map((_, i) => (
          <span
            key={i}
            className={`w-1.5 h-1.5 rounded-full ${i < filled ? color : 'bg-gray-200'}`}
          />
        ))}
      </span>
      <span className="text-xs font-medium text-gray-500">{label}</span>
    </span>
  )
}

function RecommendationCard({ rec, rank }: { rec: Recommendation; rank: number }) {
  const isBest = rank === 0
  const headerLabel = isBest ? '✅ Best Match' : '👍 Also Consider'
  const headerColor = isBest ? 'text-green-700' : 'text-blue-700'

  return (
    <div className={`bg-white rounded-xl border p-5 ${isBest ? 'border-green-300 ring-1 ring-green-100' : 'border-gray-200'}`}>
      <div className={`text-xs font-semibold uppercase tracking-wider mb-2 ${headerColor}`}>
        {headerLabel}
      </div>
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">{rec.alt.name}</h3>
          <p className="text-sm text-gray-600 mt-1 leading-relaxed">{rec.summary}</p>
        </div>
        {rec.alt.docker && (
          <span className="shrink-0 text-xs bg-blue-50 text-blue-700 border border-blue-200 px-2 py-0.5 rounded-full">
            Docker
          </span>
        )}
      </div>

      <div className="mt-4 space-y-3">
        {rec.matchDimensions.map(dim => (
          <div key={dim.dimension} className="border-l-2 border-gray-100 pl-3">
            <div className="flex items-center justify-between gap-2">
              <span className="text-sm font-medium text-gray-800">{dim.dimension}</span>
              <StrengthMeter status={dim.status} />
            </div>
            <p className="text-xs text-gray-500 mt-1">{dim.reason}</p>
            <p className="text-[10px] text-gray-400 mt-0.5 italic">Source: {dim.dataSource}</p>
          </div>
        ))}
      </div>

      {rec.alt.dockerCommand && (
        <div className="mt-3 bg-gray-50 rounded-lg p-3">
          <code className="text-xs text-gray-700 break-all">{rec.alt.dockerCommand}</code>
        </div>
      )}
    </div>
  )
}

export default function ToolFinderCard() {
  const [selectedSlug, setSelectedSlug] = useState<string | null>(null)
  const [scenario, setScenario] = useState<ScenarioInput>({
    teamSize: 'solo',
    techLevel: 'beginner',
    server: 'vps',
    priority: 'ease',
  })
  const [results, setResults] = useState<Recommendation[]>([])
  const [searched, setSearched] = useState(false)

  const handleFind = useCallback(() => {
    if (!selectedSlug) return
    const page = ALTERNATIVE_PAGES.find(p => p.slug === selectedSlug)
    if (!page) return
    const recs = findMatches(page.alternatives, scenario)
    setResults(recs)
    setSearched(true)
  }, [selectedSlug, scenario])

  const selectedPage = ALTERNATIVE_PAGES.find(p => p.slug === selectedSlug)

  return (
    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl border border-blue-200 p-6">
      <h2 className="text-lg font-bold text-gray-900">
        Find the Right Self-Hosted Tool for You
      </h2>
      <p className="text-sm text-gray-600 mt-1">
        Tell us your scenario. We'll recommend what fits — and explain why.
      </p>

      {/* SaaS Selector */}
      <div className="mt-4">
        <label className="text-sm font-medium text-gray-700 block mb-1.5">
          Which tool are you replacing?
        </label>
        <select
          value={selectedSlug ?? ''}
          onChange={e => { setSelectedSlug(e.target.value || null); setResults([]); setSearched(false) }}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
          aria-label="Select a SaaS tool to replace"
        >
          <option value="">Choose a SaaS tool...</option>
          {ALTERNATIVE_PAGES.map(p => (
            <option key={p.slug} value={p.slug}>{p.icon} {p.saasName}</option>
          ))}
        </select>
      </div>

      {/* Scenario Dimensions */}
      <div className="mt-4 space-y-3">
        <div>
          <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">Team Size</span>
          <div className="mt-1">
            <PillGroup options={TEAM_OPTIONS} value={scenario.teamSize} onChange={v => setScenario(s => ({ ...s, teamSize: v }))} />
          </div>
        </div>
        <div>
          <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">Tech Level</span>
          <div className="mt-1">
            <PillGroup options={TECH_OPTIONS} value={scenario.techLevel} onChange={v => setScenario(s => ({ ...s, techLevel: v }))} />
          </div>
        </div>
        <div>
          <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">Server</span>
          <div className="mt-1">
            <PillGroup options={SERVER_OPTIONS} value={scenario.server} onChange={v => setScenario(s => ({ ...s, server: v }))} />
          </div>
        </div>
        <div>
          <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">Priority</span>
          <div className="mt-1">
            <PillGroup options={PRIORITY_OPTIONS} value={scenario.priority} onChange={v => setScenario(s => ({ ...s, priority: v }))} />
          </div>
        </div>
      </div>

      {/* Find Button */}
      <button
        onClick={handleFind}
        disabled={!selectedSlug}
        className={`mt-5 w-full py-2.5 rounded-lg text-sm font-semibold transition-[background-color,opacity] focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 ${
          selectedSlug
            ? 'bg-blue-600 text-white hover:bg-blue-700 active:scale-[0.99]'
            : 'bg-gray-200 text-gray-400 cursor-not-allowed'
        }`}
      >
        Find My Match
      </button>

      {/* Results */}
      {searched && results.length === 0 && (
        <p className="mt-4 text-sm text-gray-500 text-center">
          No strong matches found. Try adjusting your scenario.
        </p>
      )}
      {results.length > 0 && (
        <div className="mt-5 space-y-3">
          <h3 className="text-sm font-semibold text-gray-700">
            Recommendations for {selectedPage?.saasName}
          </h3>
          {results.map((rec, idx) => (
            <a
              key={rec.alt.name}
              href={`/alternatives/${selectedSlug}/`}
              className="block hover:shadow-md transition-shadow"
            >
              <RecommendationCard rec={rec} rank={idx} />
            </a>
          ))}
        </div>
      )}
    </div>
  )
}
