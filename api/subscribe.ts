// api/subscribe.ts
// Vercel Serverless Function — Buttondown subscriber signup proxy
//
// POST /api/subscribe { email, source } → { ok: true } | { error: string }
// Rate-limited per-IP (10/min) to deter abuse.

const BUTTONDOWN_API = 'https://api.buttondown.com/v1/subscribers'
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

const RATE = new Map<string, number[]>()
const RATE_WINDOW_MS = 60 * 1000
const RATE_MAX = 10

function getIp(req: { headers: Record<string, string | string[] | undefined> }): string {
  const fwd = req.headers['x-forwarded-for']
  if (Array.isArray(fwd)) return fwd[0] || 'unknown'
  return fwd?.toString().split(',')[0]?.trim() || 'unknown'
}

function rateLimited(ip: string): boolean {
  const now = Date.now()
  const stamps = (RATE.get(ip) || []).filter(t => now - t < RATE_WINDOW_MS)
  if (stamps.length >= RATE_MAX) {
    RATE.set(ip, stamps)
    return true
  }
  stamps.push(now)
  RATE.set(ip, stamps)
  return false
}

interface SubscribeBody {
  email?: unknown
  source?: unknown
}

interface VercelLikeRequest {
  method?: string
  headers: Record<string, string | string[] | undefined>
  body?: SubscribeBody | string
}

interface VercelLikeResponse {
  status: (code: number) => VercelLikeResponse
  json: (body: unknown) => VercelLikeResponse
  setHeader: (name: string, value: string) => void
}

export default async function handler(req: VercelLikeRequest, res: VercelLikeResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST')
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const ip = getIp(req)
  if (rateLimited(ip)) {
    return res.status(429).json({ error: 'Too many requests, please try again in a minute.' })
  }

  let body: SubscribeBody = {}
  if (typeof req.body === 'string') {
    try { body = JSON.parse(req.body) as SubscribeBody } catch { body = {} }
  } else if (req.body && typeof req.body === 'object') {
    body = req.body
  }

  const email = typeof body.email === 'string' ? body.email.trim().toLowerCase() : ''
  const source = typeof body.source === 'string' ? body.source.slice(0, 64) : ''

  if (!email || !EMAIL_RE.test(email) || email.length > 254) {
    return res.status(400).json({ error: 'Please enter a valid email address.' })
  }

  const apiKey = process.env.BUTTONDOWN_API_KEY
  if (!apiKey) {
    console.error('BUTTONDOWN_API_KEY is not set')
    return res.status(500).json({ error: 'Subscription service is not configured. Please try again later.' })
  }

  try {
    const r = await fetch(BUTTONDOWN_API, {
      method: 'POST',
      headers: {
        'Authorization': `Token ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email_address: email,
        tags: source ? [`tool:${source}`] : [],
        referrer_url: source ? `https://aicalc.cloud/${source}` : undefined,
      }),
    })

    if (r.ok) {
      return res.status(200).json({ ok: true })
    }

    // Buttondown returns 400 with a code field for known cases.
    // Treat "already subscribed" as success so the user sees a friendly confirmation.
    // Surface "blocked by firewall" as 400 with a clean message rather than 502.
    if (r.status === 400) {
      const data = (await r.json().catch(() => ({}))) as { code?: string; detail?: string }
      if (data.code === 'email_already_exists' || data.code === 'subscriber_already_exists') {
        return res.status(200).json({ ok: true, alreadySubscribed: true })
      }
      if (data.code === 'subscriber_blocked') {
        return res.status(400).json({ error: 'This email could not be accepted. Please try a different address.' })
      }
      return res.status(400).json({ error: data.detail || 'Subscription failed, please check the email and try again.' })
    }

    const errBody = await r.text()
    console.error('Buttondown error', r.status, errBody.slice(0, 500))
    return res.status(502).json({ error: 'Could not reach subscription service. Please try again.' })
  } catch (err) {
    console.error('subscribe handler error', err)
    return res.status(500).json({ error: 'Subscription failed, please try again.' })
  }
}
