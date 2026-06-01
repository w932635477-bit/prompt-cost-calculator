// src/finder/productivity/ScenarioWizard.tsx
// 4-step wizard for the Self-Hosted Productivity Tool Finder

import { useState } from 'react'
import type { WizardOption } from './finder-data'

type Question = {
  key: keyof WizardOption
  title: string
  hint: string
  options: { value: string; label: string; sub: string }[]
}

const QUESTIONS: Question[] = [
  {
    key: 'need',
    title: 'What do you need?',
    hint: 'Pick the type of tool you are looking for.',
    options: [
      { value: 'wiki', label: 'Wiki & Docs', sub: 'Knowledge base, documentation, team wiki' },
      { value: 'project_management', label: 'Project Management', sub: 'Tasks, sprints, boards, roadmaps' },
      { value: 'notes', label: 'Notes & Knowledge', sub: 'Personal notes, outliner, PKM' },
      { value: 'chat', label: 'Team Chat', sub: 'Messaging, channels, threaded conversations' },
      { value: 'automation', label: 'Automation', sub: 'Workflows, integrations, Zapier-like' },
    ],
  },
  {
    key: 'team',
    title: 'How big is your team?',
    hint: 'Team size drives auth, collaboration, and scalability needs.',
    options: [
      { value: 'solo', label: 'Just me', sub: 'Personal use, single user' },
      { value: 'small_team', label: 'Small team (2-20)', sub: 'Shared workspace, basic permissions' },
      { value: 'enterprise', label: 'Enterprise (20+)', sub: 'SSO, audit logs, role-based access' },
    ],
  },
  {
    key: 'tech',
    title: 'How technical are you?',
    hint: 'We recommend tools matching your comfort level.',
    options: [
      { value: 'beginner', label: 'Beginner', sub: 'Prefer one-click installs and simple defaults' },
      { value: 'intermediate', label: 'Intermediate', sub: 'Comfortable with Docker and basic config' },
      { value: 'advanced', label: 'Advanced', sub: 'Happy customizing and writing config files' },
    ],
  },
  {
    key: 'host',
    title: 'Deployment preference?',
    hint: 'Where and how do you want to run it.',
    options: [
      { value: 'docker', label: 'Docker', sub: 'VPS, home server, or container platform' },
      { value: 'lightweight', label: 'Low-resource', sub: 'Raspberry Pi, NAS, or small VPS' },
      { value: 'managed', label: 'Managed hosting', sub: 'Someone else handles infrastructure' },
      { value: 'full_control', label: 'Full control', sub: 'Bare metal, custom setup, root access' },
    ],
  },
]

interface Props {
  onComplete: (answers: WizardOption) => void
}

export default function ScenarioWizard({ onComplete }: Props) {
  const [step, setStep] = useState(0)
  const [answers, setAnswers] = useState<Partial<WizardOption>>({})

  const q = QUESTIONS[step]
  const progress = ((step + 1) / QUESTIONS.length) * 100

  const select = (value: string) => {
    const next = { ...answers, [q.key]: value }
    setAnswers(next)
    if (step < QUESTIONS.length - 1) {
      setTimeout(() => setStep(step + 1), 150)
    } else {
      setTimeout(() => onComplete(next as WizardOption), 200)
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
          <span>Question {step + 1} of {QUESTIONS.length}</span>
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
        {q.title}
      </h2>
      <p className="text-[#86868b] mb-6">{q.hint}</p>

      {/* Options */}
      <div className="space-y-3" data-testid="wizard-options">
        {q.options.map(opt => {
          const isSelected = answers[q.key] === opt.value
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
              <div className="font-medium text-[#1d1d1f]">{opt.label}</div>
              <div className="text-sm text-[#86868b] mt-1 leading-relaxed">{opt.sub}</div>
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
