// src/testing-strategy/StrategySeoPage.tsx
// Long-tail SEO landing page for a specific project type

import { useState, useEffect } from 'react'
import { GlobalNav } from '../components/GlobalNav'
import { RelatedTools } from '../components/RelatedTools'
import { generateStrategy } from './strategy-data'
import type { StrategyResult, TestLayer } from './strategy-data'
import type { StrategySeoPage } from './seo-data'

const PRIORITY_BADGE = {
  critical: { bg: 'bg-red-50', text: 'text-red-600', label: 'Critical' },
  recommended: { bg: 'bg-amber-50', text: 'text-amber-600', label: 'Recommended' },
  optional: { bg: 'bg-gray-50', text: 'text-gray-500', label: 'Optional' },
}

function TestLayerCard({ layer, rank }: { layer: TestLayer; rank: number }) {
  const badge = PRIORITY_BADGE[layer.priority]
  return (
    <div
      className="bg-white rounded-2xl p-5"
      style={{ boxShadow: '0 2px 12px rgba(0,0,0,0.06), 0 0 1px rgba(0,0,0,0.08)' }}
    >
      <div className="flex items-start gap-3 mb-3">
        <span className="text-2xl shrink-0">{layer.icon}</span>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-sm font-semibold text-[#86868b]">#{rank}</span>
            <h3 className="text-lg font-semibold text-[#1d1d1f]">{layer.name}</h3>
            <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${badge.bg} ${badge.text}`}>
              {badge.label}
            </span>
          </div>
          <p className="text-sm text-[#86868b]">{layer.description}</p>
        </div>
      </div>
      <div className="ml-11 space-y-2">
        {layer.tools.map(tool => (
          <div key={tool.name} className="flex items-center gap-2 text-sm">
            <a href={tool.url} target="_blank" rel="noopener noreferrer" className="font-medium text-[#0071E3] hover:underline">{tool.name}</a>
            <span className="text-[#86868b]">—</span>
            <span className="text-[#86868b]">{tool.bestFor}</span>
          </div>
        ))}
      </div>
      <div className="ml-11 mt-3 text-xs text-[#86868b]">~{layer.estimatedSetupHours}h setup</div>
    </div>
  )
}

export default function StrategySeoPage({ page }: { page: StrategySeoPage }) {
  const [result, setResult] = useState<StrategyResult | null>(null)

  useEffect(() => {
    setResult(generateStrategy({
      projectType: page.projectType,
      teamSize: page.teamSize,
      stage: page.stage,
      riskPriority: page.riskPriority,
      budget: page.budget,
    }))
  }, [page])

  return (
    <div className="min-h-screen bg-[#f5f5f7]">
      <GlobalNav current={`/testing-strategy-picker/${page.slug}/`} />

      <main className="max-w-[820px] mx-auto px-6 py-10">
        {/* Hero */}
        <section className="mb-8">
          <div className="text-xs font-medium text-[#0071E3] uppercase tracking-wide mb-2">
            <a href="/testing-strategy-picker/" className="hover:underline">Testing Strategy Picker</a>
          </div>
          <h1 className="text-3xl md:text-4xl font-semibold text-[#1d1d1f] tracking-tight mb-3">
            {page.h1}
          </h1>
          <p className="text-[#86868b] text-lg leading-relaxed mb-5">
            {page.intro}
          </p>
        </section>

        {/* Pre-generated strategy */}
        {result && (
          <section className="mb-10">
            <div className="bg-white rounded-2xl p-5 mb-5" style={{ boxShadow: '0 2px 12px rgba(0,0,0,0.06), 0 0 1px rgba(0,0,0,0.08)' }}>
              <div className="text-xs text-[#86868b] mb-1">Sample strategy for {result.projectName}</div>
              <p className="text-sm text-[#1d1d1f]">{result.summary}</p>
            </div>
            <div className="space-y-4 mb-6">
              {result.pyramid.map((layer, i) => (
                <TestLayerCard key={layer.id} layer={layer} rank={i + 1} />
              ))}
            </div>
            <div className="bg-[#0071E3]/5 rounded-2xl p-5 mb-6 flex items-center gap-3">
              <span className="text-2xl">⏱️</span>
              <div>
                <div className="text-sm font-medium text-[#1d1d1f]">Total estimated setup: ~{result.totalSetupHours} hours</div>
                <div className="text-xs text-[#86868b]">This is a sample. Get your personalized strategy below.</div>
              </div>
            </div>
            <a
              href="/testing-strategy-picker/"
              className="inline-flex items-center gap-2 bg-[#0071E3] text-white px-6 py-3 rounded-xl text-sm font-medium hover:bg-[#0077ED] transition-colors"
            >
              Customize this strategy →
            </a>
          </section>
        )}

        {/* SEO content */}
        <section className="mb-10">
          <h2 className="text-2xl font-semibold text-[#1d1d1f] tracking-tight mb-4">
            {page.contentH2}
          </h2>
          <div className="space-y-4">
            {page.contentParagraphs.map((p, i) => (
              <p key={i} className="text-[#424245] leading-relaxed">{p}</p>
            ))}
          </div>
        </section>

        {/* Footer */}
        <footer className="border-t border-[#e8e8ed] pt-6 pb-8 text-center text-sm text-[#86868b]">
          <p>
            <a href="/testing-strategy-picker/" className="text-[#0071E3] hover:underline">Testing Strategy Picker</a>
            <span className="mx-2">·</span>
            <a href="/" className="text-[#0071E3] hover:underline">AI Cost Calculator</a>
            <span className="mx-2">·</span>
            <a href="/dep-shield/" className="text-[#0071E3] hover:underline">Dep Shield</a>
          </p>
        </footer>
        <RelatedTools currentPath="/testing-strategy-picker/" />
      </main>
    </div>
  )
}
