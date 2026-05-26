// src/finder/notes/ScenarioWizard.tsx
// 4-step wizard for the Self-Hosted Note Finder

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
    key: 'team',
    title: 'Who is using this?',
    hint: 'Different team sizes need different features.',
    options: [
      { value: 'solo', label: 'Just me', sub: 'Personal knowledge base or notes' },
      { value: 'small_team', label: 'Small team (2-20 people)', sub: 'Shared workspace, basic permissions' },
      { value: 'enterprise', label: 'Enterprise (20+)', sub: 'SSO, audit logs, role-based access' },
    ],
  },
  {
    key: 'tech',
    title: 'How comfortable are you with self-hosting?',
    hint: 'We recommend tools matching your comfort level.',
    options: [
      { value: 'beginner', label: 'Beginner', sub: 'Prefer one-click installs and simple defaults' },
      { value: 'intermediate', label: 'Intermediate', sub: 'Comfortable with Docker and basic config' },
      { value: 'advanced', label: 'Advanced', sub: 'Happy customizing and writing config files' },
    ],
  },
  {
    key: 'host',
    title: 'Where will you run it?',
    hint: 'Hosting environment shapes the right choice.',
    options: [
      { value: 'docker', label: 'Docker server', sub: 'VPS, home server, or container platform' },
      { value: 'lightweight', label: 'Low-resource device', sub: 'Raspberry Pi, NAS, or small VPS' },
      { value: 'native_app', label: 'Just my computer', sub: 'Desktop and mobile apps, no server' },
    ],
  },
  {
    key: 'need',
    title: 'What matters most?',
    hint: 'Pick the single most important feature.',
    options: [
      { value: 'collaboration', label: 'Real-time collaboration', sub: 'Multiple people editing together' },
      { value: 'privacy', label: 'Maximum privacy', sub: 'End-to-end encryption, local-first storage' },
      { value: 'offline_first', label: 'Works offline', sub: 'No internet required, sync when available' },
      { value: 'database', label: 'Databases & structure', sub: 'Notion-style tables, kanban, relations' },
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
      // last question — fire onComplete
      setTimeout(() => onComplete(next as WizardOption), 200)
    }
  }

  const back = () => {
    if (step > 0) setStep(step - 1)
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm p-6 md:p-8">
      {/* Progress bar */}
      <div className="mb-6">
        <div className="flex items-center justify-between text-xs text-[#86868b] mb-2">
          <span>Question {step + 1} of {QUESTIONS.length}</span>
          <span>{Math.round(progress)}%</span>
        </div>
        <div className="w-full bg-[#f5f5f7] rounded-full h-1.5 overflow-hidden">
          <div
            className="h-full bg-[#0071E3] rounded-full transition-all duration-300"
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
              className={`w-full text-left p-4 rounded-xl border-2 transition-all
                ${isSelected
                  ? 'border-[#0071E3] bg-[#0071E3]/5'
                  : 'border-[#e8e8ed] hover:border-[#86868b] bg-white'}`}
              data-value={opt.value}
            >
              <div className="font-medium text-[#1d1d1f]">{opt.label}</div>
              <div className="text-sm text-[#86868b] mt-0.5">{opt.sub}</div>
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
