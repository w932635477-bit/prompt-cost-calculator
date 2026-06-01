// src/finder/productivity/RecommendationCard.tsx

import { useState, useCallback } from 'react'
import type { Recommendation } from './finder-engine'
import { DIMENSION_LABEL } from './finder-engine'

const RANK_BADGE: Record<number, string> = {
  1: 'bg-[#0071E3] text-white',
  2: 'bg-[#86868b] text-white',
  3: 'bg-[#86868b]/70 text-white',
}

const DIFFICULTY_STYLE: Record<string, string> = {
  Easy: 'bg-[#30d158]/10 text-[#30d158]',
  Medium: 'bg-amber-500/10 text-amber-600',
  Hard: 'bg-red-500/10 text-red-600',
}

const CATEGORY_LABEL: Record<string, string> = {
  wiki: 'Wiki', project_management: 'PM', notes: 'Notes',
  chat: 'Chat', automation: 'Automation',
}

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false)
  const copy = useCallback(() => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 1800)
    })
  }, [text])
  return (
    <button
      onClick={copy}
      className="text-xs px-2.5 py-1 rounded-lg text-[#86868b] hover:text-[#1d1d1f] hover:bg-[#f5f5f7] transition-colors"
    >
      {copied ? 'Copied' : 'Copy'}
    </button>
  )
}

function DimensionBar({ score, label, reason }: { score: number; label: string; reason: string }) {
  const pct = (score / 10) * 100
  const color =
    score >= 8 ? '#30d158' :
    score >= 5 ? '#0071E3' :
    score >= 3 ? '#f59e0b' :
    '#ef4444'
  return (
    <div>
      <div className="flex items-center justify-between text-xs mb-1">
        <span className="font-medium text-[#1d1d1f]">{label}</span>
        <span className="text-[#86868b] tabular-nums">{score}/10</span>
      </div>
      <div className="w-full bg-[#e8e8ed] rounded-full h-2 overflow-hidden mb-1">
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{ width: `${pct}%`, backgroundColor: color }}
        />
      </div>
      <div className="text-xs text-[#86868b]">{reason}</div>
    </div>
  )
}

export default function RecommendationCard({ rec }: { rec: Recommendation }) {
  const [showWhyNot, setShowWhyNot] = useState(false)
  const t = rec.tool

  return (
    <article className="bg-white rounded-2xl overflow-hidden" style={{ boxShadow: '0 2px 12px rgba(0,0,0,0.06), 0 0 1px rgba(0,0,0,0.08)' }} data-testid={`rec-card-${rec.rank}`}>
      {/* Header */}
      <div className="p-5 md:p-6 border-b border-[#e8e8ed]">
        <div className="flex items-start gap-4">
          <span
            className={`shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${RANK_BADGE[rec.rank]}`}
            aria-label={`Rank ${rec.rank}`}
          >
            {rec.rank}
          </span>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 mb-1">
              <span className="text-3xl" aria-hidden="true">{t.logo}</span>
              <h3 className="text-xl font-semibold text-[#1d1d1f] tracking-tight">{t.name}</h3>
            </div>
            <p className="text-sm text-[#86868b] leading-relaxed">{t.tagline}</p>
          </div>
        </div>

        {/* Quick facts */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-4 text-sm">
          <div className="bg-[#f5f5f7] rounded-xl p-2.5">
            <div className="text-[10px] text-[#86868b] mb-0.5 uppercase tracking-wide">License</div>
            <div className="font-medium text-[#1d1d1f] truncate" title={t.license}>{t.license.split(' ')[0]}</div>
          </div>
          <div className="bg-[#f5f5f7] rounded-xl p-2.5">
            <div className="text-[10px] text-[#86868b] mb-0.5 uppercase tracking-wide">Difficulty</div>
            <span className={`inline-block text-xs px-2 py-0.5 rounded-full font-medium ${DIFFICULTY_STYLE[t.difficulty] || ''}`}>
              {t.difficulty}
            </span>
          </div>
          <div className="bg-[#f5f5f7] rounded-xl p-2.5">
            <div className="text-[10px] text-[#86868b] mb-0.5 uppercase tracking-wide">Pricing</div>
            <div className="font-medium text-[#1d1d1f] truncate" title={t.pricing}>{t.pricing.split('/')[0].trim()}</div>
          </div>
          <div className="bg-[#f5f5f7] rounded-xl p-2.5">
            <div className="text-[10px] text-[#86868b] mb-0.5 uppercase tracking-wide">Category</div>
            <div className="font-medium text-[#1d1d1f]">{CATEGORY_LABEL[t.category] || t.category}</div>
          </div>
        </div>
      </div>

      {/* Why this */}
      <div className="px-5 md:px-6 py-4 bg-[#0071E3]/5 border-b border-[#e8e8ed]">
        <div className="flex items-start gap-2">
          <span className="text-xs font-medium text-[#0071E3] uppercase tracking-wide shrink-0 mt-0.5">Why</span>
          <p className="text-sm text-[#1d1d1f]">{rec.whyThis}</p>
        </div>
      </div>

      {/* 4-dimension scores */}
      <div className="px-5 md:px-6 py-5 grid grid-cols-1 md:grid-cols-2 gap-4 border-b border-[#e8e8ed]">
        {rec.dimensions.map(d => (
          <DimensionBar
            key={d.dimension}
            score={d.score}
            label={DIMENSION_LABEL[d.dimension]}
            reason={d.reason}
          />
        ))}
      </div>

      {/* Pros & Cons */}
      <div className="px-5 md:px-6 py-5 grid grid-cols-1 md:grid-cols-2 gap-5 border-b border-[#e8e8ed]">
        <div>
          <h4 className="text-xs font-medium text-[#30d158] uppercase tracking-wide mb-2">Strengths</h4>
          <ul className="space-y-1.5">
            {t.pros.slice(0, 4).map((p, i) => (
              <li key={i} className="flex gap-2 text-sm text-[#1d1d1f]">
                <span className="text-[#30d158] shrink-0 mt-0.5">+</span>
                <span>{p}</span>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h4 className="text-xs font-medium text-red-500 uppercase tracking-wide mb-2">Tradeoffs</h4>
          <ul className="space-y-1.5">
            {t.cons.slice(0, 3).map((c, i) => (
              <li key={i} className="flex gap-2 text-sm text-[#86868b]">
                <span className="text-red-500 shrink-0 mt-0.5">−</span>
                <span>{c}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Docker Compose */}
      {t.dockerCompose && (
        <div className="px-5 md:px-6 py-5 border-b border-[#e8e8ed]">
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-sm font-medium text-[#1d1d1f]">Quick start with Docker</h4>
            <CopyButton text={t.dockerCompose} />
          </div>
          <pre className="bg-[#1d1d1f] text-[#30d158] rounded-xl p-4 text-xs font-mono overflow-x-auto leading-relaxed whitespace-pre">{t.dockerCompose}</pre>
        </div>
      )}

      {/* Why not the others */}
      {rec.whyNotOthers.length > 0 && (
        <div className="px-5 md:px-6 py-4 bg-[#f5f5f7]/50">
          <button
            onClick={() => setShowWhyNot(s => !s)}
            className="text-xs text-[#86868b] hover:text-[#1d1d1f] flex items-center gap-1.5"
          >
            <span>{showWhyNot ? '▾' : '▸'}</span>
            <span>Why not the runners-up?</span>
          </button>
          {showWhyNot && (
            <div className="mt-3 space-y-2">
              {rec.whyNotOthers.map((wn, i) => (
                <div key={i} className="text-xs text-[#86868b]">
                  <span className="font-medium text-[#1d1d1f]">{wn.tool}: </span>
                  {wn.reason}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Footer actions */}
      <div className="px-5 md:px-6 py-4 flex items-center justify-between gap-3 text-sm">
        <div className="flex gap-3">
          <a
            href={t.url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-[#0071E3] hover:underline font-medium"
          >
            Visit website →
          </a>
          {t.github && (
            <a
              href={t.github}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#86868b] hover:text-[#1d1d1f]"
            >
              GitHub
            </a>
          )}
        </div>
        {t.existingAltSlug && (
          <a
            href={`/alternatives/${t.existingAltSlug}/`}
            className="text-xs text-[#86868b] hover:text-[#0071E3] transition-colors"
          >
            See alternatives →
          </a>
        )}
        {t.existingCompareSlug && (
          <a
            href={`/compare/${t.existingCompareSlug}/`}
            className="text-xs text-[#86868b] hover:text-[#0071E3] transition-colors"
          >
            Compare →
          </a>
        )}
      </div>
    </article>
  )
}
