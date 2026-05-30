import { useState } from 'react'
import { track } from '@vercel/analytics'

interface Props {
  source: string
}

type State = 'idle' | 'loading' | 'done' | 'error'

export function EmailCapture({ source }: Props) {
  const [email, setEmail] = useState('')
  const [state, setState] = useState<State>('idle')
  const [errorMsg, setErrorMsg] = useState('')

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setState('loading')
    setErrorMsg('')
    try {
      const r = await fetch('/api/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, source }),
      })
      if (r.ok) {
        setState('done')
        track('email_subscribe', { source })
      } else {
        const data = (await r.json().catch(() => ({}))) as { error?: string }
        setErrorMsg(data.error || 'Subscription failed, please try again.')
        setState('error')
      }
    } catch {
      setErrorMsg('Network error, please try again.')
      setState('error')
    }
  }

  return (
    <section className="border-t border-[#e8e8ed] bg-[#f5f5f7] mt-16">
      <div className="max-w-[680px] mx-auto px-4 py-10 text-center">
        <h2 className="text-lg font-semibold text-[#1d1d1f]">
          Get one new dev tool every Friday.
        </h2>
        <p className="text-sm text-[#86868b] mt-1">
          Hand-picked free tools, source code included. No spam. Unsubscribe anytime.
        </p>

        {state === 'done' ? (
          <p className="mt-5 text-[#0071E3] text-sm font-medium">
            Check your inbox to confirm your subscription.
          </p>
        ) : (
          <form onSubmit={submit} className="mt-5 flex gap-2 max-w-md mx-auto">
            <input
              type="email"
              required
              placeholder="your@email.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
              disabled={state === 'loading'}
              aria-label="Email address"
              className="flex-1 px-4 py-2.5 rounded-lg border border-[#d2d2d7] text-sm focus:outline-none focus:border-[#0071E3] disabled:opacity-60"
            />
            <button
              type="submit"
              disabled={state === 'loading'}
              className="px-5 py-2.5 rounded-lg bg-[#0071E3] text-white text-sm font-medium hover:bg-[#0077ED] disabled:opacity-50 transition-colors"
            >
              {state === 'loading' ? '...' : 'Subscribe'}
            </button>
          </form>
        )}

        {state === 'error' && (
          <p className="mt-3 text-sm text-red-600" role="alert">{errorMsg}</p>
        )}

        <p className="mt-4 text-xs text-[#86868b]">
          By subscribing, you agree to receive emails from aicalc.cloud. Unsubscribe anytime.
        </p>
      </div>
    </section>
  )
}
