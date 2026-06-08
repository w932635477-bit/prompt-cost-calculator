// src/testing-strategy/StrategyWizard.tsx
// 5-step wizard: project type → team size → stage → risk → budget

import { useState } from 'react'
import type { WizardAnswers } from './strategy-data'

type Step = {
  key: keyof WizardAnswers
  title: string
  hint: string
  options: { value: string; label: string; sub: string; icon: string }[]
}

const STEPS: Step[] = [
  {
    key: 'projectType',
    title: 'What are you building?',
    hint: 'This determines which testing types matter most.',
    options: [
      { value: 'web_app', label: 'Web Application', sub: 'React, Vue, Next.js, Svelte, etc.', icon: '🌐' },
      { value: 'api', label: 'API / Backend', sub: 'REST, GraphQL, microservices', icon: '⚙️' },
      { value: 'mobile', label: 'Mobile App', sub: 'iOS, Android, React Native, Flutter', icon: '📱' },
      { value: 'desktop', label: 'Desktop App', sub: 'Electron, Tauri, native', icon: '🖥️' },
      { value: 'cli', label: 'CLI Tool', sub: 'Command-line application', icon: '⌨️' },
    ],
  },
  {
    key: 'teamSize',
    title: 'How big is your team?',
    hint: 'Team size affects which test layers are worth investing in.',
    options: [
      { value: 'solo', label: 'Solo developer', sub: 'Just me, maybe a contractor', icon: '👤' },
      { value: 'small', label: 'Small team (2-10)', sub: 'Shared codebase, PR reviews', icon: '👥' },
      { value: 'large', label: 'Large team (10+)', sub: 'Multiple squads, CI/CD pipeline', icon: '🏢' },
    ],
  },
  {
    key: 'stage',
    title: 'What stage is your project?',
    hint: 'Earlier stages need fewer test layers. We adjust recommendations.',
    options: [
      { value: 'mvp', label: 'MVP / Prototype', sub: 'Validating the idea, shipping fast', icon: '🚀' },
      { value: 'growth', label: 'Growing product', sub: 'Users depend on it, adding features', icon: '📈' },
      { value: 'mature', label: 'Mature / Production', sub: 'Revenue at risk on downtime', icon: '🏛️' },
    ],
  },
  {
    key: 'riskPriority',
    title: 'What scares you most?',
    hint: 'We boost the priority of test layers that match your top concern.',
    options: [
      { value: 'bugs', label: 'Functional bugs', sub: 'Features break, wrong outputs', icon: '🐛' },
      { value: 'performance', label: 'Performance & speed', sub: 'Slow pages, timeouts, crashes under load', icon: '⚡' },
      { value: 'security', label: 'Security & data safety', sub: 'Data leaks, injections, unauthorized access', icon: '🔒' },
      { value: 'ux', label: 'User experience', sub: 'Broken flows, accessibility, visual bugs', icon: '✨' },
    ],
  },
  {
    key: 'budget',
    title: 'Budget for testing tools?',
    hint: 'We filter tool recommendations to match your budget.',
    options: [
      { value: 'free', label: 'Zero budget', sub: 'Free and built-in tools only', icon: '🆓' },
      { value: 'open_source', label: 'Open source preferred', sub: 'Free to self-host, community-supported', icon: '📖' },
      { value: 'paid', label: 'Paid tools OK', sub: 'Budget for SaaS testing tools', icon: '💳' },
    ],
  },
]

interface Props {
  onComplete: (answers: WizardAnswers) => void
}

export default function StrategyWizard({ onComplete }: Props) {
  const [step, setStep] = useState(0)
  const [answers, setAnswers] = useState<Partial<WizardAnswers>>({})

  const s = STEPS[step]
  const progress = ((step + 1) / STEPS.length) * 100

  const select = (value: string) => {
    const next = { ...answers, [s.key]: value }
    setAnswers(next)
    if (step < STEPS.length - 1) {
      setTimeout(() => setStep(step + 1), 150)
    } else {
      setTimeout(() => onComplete(next as WizardAnswers), 200)
    }
  }

  const back = () => {
    if (step > 0) setStep(step - 1)
  }

  return (
    <div className="bg-white rounded-2xl p-6 md:p-8" style={{ boxShadow: '0 2px 12px rgba(0,0,0,0.06), 0 0 1px rgba(0,0,0,0.08)' }}>
      {/* Progress bar */}
      <div className="mb-8">
        <div className="flex items-center justify-between text-xs text-[#86868b] mb-2.5">
          <span>Question {step + 1} of {STEPS.length}</span>
          <span>{Math.round(progress)}%</span>
        </div>
        <div className="w-full bg-[#e8e8ed] rounded-full h-2 overflow-hidden">
          <div
            className="h-full bg-[#0071E3] rounded-full transition-all duration-500 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Question */}
      <h2 className="text-2xl md:text-3xl font-semibold text-[#1d1d1f] tracking-tight mb-2">
        {s.title}
      </h2>
      <p className="text-[#86868b] mb-6">{s.hint}</p>

      {/* Options */}
      <div className="space-y-3" data-testid="wizard-options">
        {s.options.map(opt => {
          const isSelected = answers[s.key] === opt.value
          return (
            <button
              key={opt.value}
              onClick={() => select(opt.value)}
              className={`w-full text-left p-4 rounded-2xl border-2 transition-all duration-200 min-h-[44px]
                ${isSelected
                  ? 'border-[#0071E3] bg-[#0071E3]/5 shadow-sm'
                  : 'border-[#e8e8ed] bg-white hover:border-[#0071E3]/40 hover:shadow-sm active:scale-[0.99]'}`}
              data-value={opt.value}
            >
              <div className="flex items-center gap-3">
                <span className="text-2xl">{opt.icon}</span>
                <div className="flex-1">
                  <div className="font-medium text-[#1d1d1f]">{opt.label}</div>
                  <div className="text-sm text-[#86868b] mt-0.5">{opt.sub}</div>
                </div>
              </div>
            </button>
          )
        })}
      </div>

      {/* Back button */}
      {step > 0 && (
        <div className="mt-6 flex">
          <button
            onClick={back}
            className="text-sm text-[#86868b] hover:text-[#1d1d1f] transition-colors"
          >
            ← Previous question
          </button>
        </div>
      )}
    </div>
  )
}
