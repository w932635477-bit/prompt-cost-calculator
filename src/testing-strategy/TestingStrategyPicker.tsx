// src/testing-strategy/TestingStrategyPicker.tsx
// Main page: hero + wizard → strategy results + FAQ

import { useState, useEffect } from 'react'
import { GlobalNav } from '../components/GlobalNav'
import { RelatedTools } from '../components/RelatedTools'
import StrategyWizard from './StrategyWizard'
import { generateStrategy } from './strategy-data'
import type { WizardAnswers, StrategyResult, TestLayer } from './strategy-data'

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
      data-testid={`layer-${layer.id}`}
    >
      <div className="flex items-start gap-3 mb-3">
        <span className="text-2xl">{layer.icon}</span>
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

      {/* Tools */}
      <div className="ml-11 space-y-2">
        {layer.tools.map(tool => (
          <div key={tool.name} className="flex items-center gap-2 text-sm">
            <a
              href={tool.url}
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-[#0071E3] hover:underline"
            >
              {tool.name}
            </a>
            <span className="text-[#86868b]">—</span>
            <span className="text-[#86868b]">{tool.bestFor}</span>
            <span className="text-xs px-1.5 py-0.5 rounded bg-[#f5f5f7] text-[#86868b]">{tool.license}</span>
          </div>
        ))}
      </div>

      {/* Setup time */}
      <div className="ml-11 mt-3 text-xs text-[#86868b]">
        ~{layer.estimatedSetupHours}h setup
      </div>
    </div>
  )
}

const FAQ = [
  {
    q: 'How does this picker work?',
    a: 'It asks 5 questions about your project (type, team size, stage, risk priority, budget), then generates a personalized testing strategy with prioritized test layers and recommended tools.',
  },
  {
    q: 'Are the recommended tools free?',
    a: 'Most are free and open-source (MIT, Apache-2.0). A few like Snyk and Chromatic have freemium models. Select "Zero budget" to filter for completely free tools.',
  },
  {
    q: 'What is a testing pyramid?',
    a: 'A testing strategy organizes tests in layers: unit tests (many, fast) at the base, integration tests in the middle, and E2E tests (fewer, slower) at the top. Additional layers like performance, security, and accessibility tests are added based on your project needs.',
  },
  {
    q: 'Should I implement all layers at once?',
    a: 'No. Start with critical layers for your stage. For an MVP, unit tests are often enough. Add layers as your project grows and your risk profile changes.',
  },
  {
    q: 'How are priorities determined?',
    a: 'Priorities come from three factors: your project stage (MVP needs fewer layers), your risk priority (what scares you most gets boosted), and your project type (APIs need different tests than mobile apps).',
  },
  {
    q: 'Can I use this for a team project?',
    a: 'Yes. Select your team size and the recommendations adjust. Larger teams get more emphasis on integration tests, E2E tests, and CI/CD integration.',
  },
]

const HEADER_FACTS = [
  { label: '5 project types', sub: 'web, API, mobile, desktop, CLI' },
  { label: '7+ test layers', sub: 'unit → security → visual' },
  { label: '20+ tools', sub: 'curated per project type' },
]

export default function TestingStrategyPicker() {
  const [result, setResult] = useState<StrategyResult | null>(null)

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const projectType = params.get('projectType') as WizardAnswers['projectType'] | null
    const teamSize = params.get('teamSize') as WizardAnswers['teamSize'] | null
    const stage = params.get('stage') as WizardAnswers['stage'] | null
    const riskPriority = params.get('riskPriority') as WizardAnswers['riskPriority'] | null
    const budget = params.get('budget') as WizardAnswers['budget'] | null
    if (projectType && teamSize && stage && riskPriority && budget) {
      setResult(generateStrategy({ projectType, teamSize, stage, riskPriority, budget }))
    }
  }, [])

  const handleComplete = (a: WizardAnswers) => {
    setResult(generateStrategy(a))
    const params = new URLSearchParams(a as unknown as Record<string, string>)
    window.history.replaceState({}, '', `?${params.toString()}`)
    setTimeout(() => {
      document.getElementById('results')?.scrollIntoView({ behavior: 'smooth' })
    }, 100)
  }

  const reset = () => {
    setResult(null)
    window.history.replaceState({}, '', window.location.pathname)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <div className="min-h-screen bg-[#f5f5f7]">
      <GlobalNav current="/testing-strategy-picker/" />

      <main className="max-w-[820px] mx-auto px-6 py-10">
        {/* Hero */}
        <section className="mb-8">
          <div className="text-xs font-medium text-[#0071E3] uppercase tracking-wide mb-2">
            Testing Strategy Picker
          </div>
          <h1 className="text-3xl md:text-4xl font-semibold text-[#1d1d1f] tracking-tight mb-3">
            Find the Right Testing Strategy for Your Project
          </h1>
          <p className="text-[#86868b] text-lg leading-relaxed mb-5">
            Answer 5 questions about your project. Get a personalized test pyramid
            with prioritized layers and tool recommendations — in 30 seconds.
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
        {!result ? (
          <StrategyWizard onComplete={handleComplete} />
        ) : (
          <section id="results" data-testid="results-section">
            {/* Summary */}
            <div className="bg-white rounded-2xl p-5 mb-5" style={{ boxShadow: '0 2px 12px rgba(0,0,0,0.06), 0 0 1px rgba(0,0,0,0.08)' }}>
              <div className="flex items-center justify-between gap-4">
                <div className="min-w-0 flex-1">
                  <div className="text-xs text-[#86868b] mb-1">Your strategy for</div>
                  <div className="text-lg font-semibold text-[#1d1d1f] mb-2">{result.projectName}</div>
                  <p className="text-sm text-[#86868b]">{result.summary}</p>
                </div>
                <button
                  onClick={reset}
                  className="shrink-0 text-sm text-[#0071E3] hover:underline"
                  data-testid="reset-button"
                >
                  Start over
                </button>
              </div>
            </div>

            {/* Test Pyramid */}
            <div className="space-y-4 mb-8">
              <h2 className="text-2xl font-semibold text-[#1d1d1f] tracking-tight">
                Your Testing Pyramid
              </h2>
              {result.pyramid.map((layer, i) => (
                <TestLayerCard key={layer.id} layer={layer} rank={i + 1} />
              ))}
            </div>

            {/* Total estimate */}
            <div className="bg-[#0071E3]/5 rounded-2xl p-5 mb-8 flex items-center gap-3">
              <span className="text-2xl">⏱️</span>
              <div>
                <div className="text-sm font-medium text-[#1d1d1f]">
                  Total estimated setup: ~{result.totalSetupHours} hours
                </div>
                <div className="text-xs text-[#86868b]">
                  Spread across {result.pyramid.length} test layers. Start with critical layers first.
                </div>
              </div>
            </div>

            {/* Skipped layers warning */}
            {result.skippedLayers.length > 0 && (
              <div className="mb-8">
                <h3 className="text-base font-semibold text-[#1d1d1f] mb-3">
                  Skipped for now
                </h3>
                <div className="space-y-2">
                  {result.skippedLayers.map((s, i) => (
                    <div key={i} className="flex items-start gap-2 text-sm bg-white rounded-xl p-3" style={{ boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
                      <span className="text-amber-500">⚠️</span>
                      <div>
                        <span className="font-medium text-[#1d1d1f]">{s.name}: </span>
                        <span className="text-[#86868b]">{s.risk}</span>
                      </div>
                    </div>
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
              href="/dep-shield/"
              className="flex items-center justify-between p-3 rounded-xl bg-[#f5f5f7]/50 hover:bg-[#f5f5f7] transition-colors"
            >
              <span className="text-[#1d1d1f]">Dep Shield — NPM Vulnerability Scanner</span>
              <span className="text-[#86868b]">→</span>
            </a>
            <a
              href="/ai-code-review/"
              className="flex items-center justify-between p-3 rounded-xl bg-[#f5f5f7]/50 hover:bg-[#f5f5f7] transition-colors"
            >
              <span className="text-[#1d1d1f]">AI Code Review Checklist</span>
              <span className="text-[#86868b]">→</span>
            </a>
            <a
              href="/ai-agent-security/"
              className="flex items-center justify-between p-3 rounded-xl bg-[#f5f5f7]/50 hover:bg-[#f5f5f7] transition-colors"
            >
              <span className="text-[#1d1d1f]">AI Agent Security Checker</span>
              <span className="text-[#86868b]">→</span>
            </a>
            <a
              href="/csp-generator/"
              className="flex items-center justify-between p-3 rounded-xl bg-[#f5f5f7]/50 hover:bg-[#f5f5f7] transition-colors"
            >
              <span className="text-[#1d1d1f]">CSP Header Generator</span>
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
          <p>Free testing strategy recommender. No login, no tracking.</p>
          <p className="mt-2">
            <a href="/" className="text-[#0071E3] hover:underline">AI Cost Calculator</a>
            <span className="mx-2">·</span>
            <a href="/dep-shield/" className="text-[#0071E3] hover:underline">Dep Shield</a>
            <span className="mx-2">·</span>
            <a href="/ai-code-review/" className="text-[#0071E3] hover:underline">AI Code Review</a>
          </p>
        </footer>
        <RelatedTools currentPath="/testing-strategy-picker/" />
      </main>
    </div>
  )
}
