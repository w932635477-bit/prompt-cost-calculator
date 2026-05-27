// src/finder/chat/ScenarioWizard.tsx
// 4-step wizard for the Self-Hosted Team Chat Finder

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
    title: 'How big is your team?',
    hint: 'Team size determines which features matter most.',
    options: [
      { value: 'solo', label: 'Solo or duo (1-3)', sub: 'Personal workspace or tiny team' },
      { value: 'small_team', label: 'Small team (4-20)', sub: 'Department or startup, basic permissions' },
      { value: 'large_team', label: 'Large team (20-200)', sub: 'Multiple departments, need moderation' },
      { value: 'enterprise', label: 'Enterprise (200+)', sub: 'SSO, audit logs, compliance requirements' },
    ],
  },
  {
    key: 'style',
    title: 'How does your team communicate?',
    hint: 'The dominant communication style shapes the right platform.',
    options: [
      { value: 'threaded', label: 'Organized by topics', sub: 'Threaded discussions, searchable history' },
      { value: 'real_time', label: 'Instant messaging', sub: 'Channels and DMs, fast-paced conversation' },
      { value: 'voice_first', label: 'Voice and video calls', sub: 'Meetings, screen sharing, always-on voice' },
      { value: 'omnichannel', label: 'Customer conversations', sub: 'Email, chat, social, WhatsApp in one inbox' },
    ],
  },
  {
    key: 'priority',
    title: 'What matters most?',
    hint: 'Pick the single most important factor.',
    options: [
      { value: 'privacy', label: 'Privacy and security', sub: 'E2E encryption, data sovereignty, self-hosted' },
      { value: 'features', label: 'Integrations and bots', sub: 'API, webhooks, automation, third-party tools' },
      { value: 'simplicity', label: 'Easy setup and use', sub: 'Docker one-liner, familiar interface, low maintenance' },
      { value: 'cost', label: 'Free or low cost', sub: 'Fully open source, no per-user fees' },
    ],
  },
  {
    key: 'deploy',
    title: 'How do you want to deploy?',
    hint: 'Deployment preference narrows the options significantly.',
    options: [
      { value: 'docker', label: 'Docker Compose', sub: 'One command, standard containers, easy updates' },
      { value: 'kubernetes', label: 'Kubernetes cluster', sub: 'Scalable, Helm charts, production orchestration' },
      { value: 'single_binary', label: 'Single binary', sub: 'Download and run, minimal dependencies' },
      { value: 'managed', label: 'Managed hosting', sub: 'Let someone else run it, focus on your team' },
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
    <div className="bg-white rounded-2xl shadow-sm p-6 md:p-8">
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

      <h2 className="text-2xl md:text-3xl font-semibold text-[#1d1d1f] tracking-tight mb-2">
        {q.title}
      </h2>
      <p className="text-[#86868b] mb-6">{q.hint}</p>

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
