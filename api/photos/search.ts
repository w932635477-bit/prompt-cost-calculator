// api/photos/search.ts
// Vercel Serverless Function — multi-source photo search proxy
//
// Query: GET /api/photos/search?q=laptop&page=1
// Returns: { results: PhotoResult[], cached: boolean, sources: { unsplash, pexels, pixabay } }
//
// Caching: in-memory LRU (24h TTL) — survives within a serverless instance

import { searchUnsplash, searchPexels, searchPixabay, dedupe } from './_adapters.js'
import type { PhotoResult } from './_adapters.js'

const CACHE = new Map<string, { ts: number; data: PhotoResult[] }>()
const TTL_MS = 24 * 60 * 60 * 1000 // 24h

const RATE = new Map<string, number[]>() // ip → [timestamps]
const RATE_WINDOW_MS = 60 * 1000
const RATE_MAX = 30

function getIp(req: { headers: Record<string, string | string[] | undefined> }): string {
  const fwd = req.headers['x-forwarded-for']
  return Array.isArray(fwd) ? fwd[0] : (fwd?.toString().split(',')[0] || 'unknown')
}

function rateLimited(ip: string): boolean {
  const now = Date.now()
  const arr = (RATE.get(ip) || []).filter(t => now - t < RATE_WINDOW_MS)
  if (arr.length >= RATE_MAX) return true
  arr.push(now)
  RATE.set(ip, arr)
  return false
}

interface VercelRequest {
  query: { [k: string]: string | string[] | undefined }
  headers: Record<string, string | string[] | undefined>
}
interface VercelResponse {
  status: (code: number) => VercelResponse
  json: (data: unknown) => void
  setHeader: (name: string, value: string) => void
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const ip = getIp(req)
  if (rateLimited(ip)) {
    return res.status(429).json({ error: 'Too many requests, slow down' })
  }

  const q = (req.query.q || '').toString().trim().toLowerCase().slice(0, 60)
  const page = Math.max(1, Math.min(10, parseInt((req.query.page || '1').toString(), 10) || 1))

  if (!q) return res.status(400).json({ error: 'Missing query param "q"' })
  if (!/^[a-z0-9 \-]+$/i.test(q)) {
    return res.status(400).json({ error: 'Invalid characters in query' })
  }

  const cacheKey = `${q}_p${page}`
  const cached = CACHE.get(cacheKey)
  if (cached && Date.now() - cached.ts < TTL_MS) {
    res.setHeader('Cache-Control', 's-maxage=3600, stale-while-revalidate=86400')
    return res.status(200).json({ results: cached.data, cached: true, sources: countBySource(cached.data) })
  }

  const unsplashKey = process.env.UNSPLASH_ACCESS_KEY || ''
  const pexelsKey = process.env.PEXELS_API_KEY || ''
  const pixabayKey = process.env.PIXABAY_API_KEY || ''

  const [u, p, b] = await Promise.allSettled([
    searchUnsplash(q, page, unsplashKey),
    searchPexels(q, page, pexelsKey),
    searchPixabay(q, page, pixabayKey),
  ])

  const merged = [
    ...(u.status === 'fulfilled' ? u.value : []),
    ...(p.status === 'fulfilled' ? p.value : []),
    ...(b.status === 'fulfilled' ? b.value : []),
  ]
  const deduped = dedupe(merged)
  // Interleave by source for variety in first results
  const interleaved = interleaveBySource(deduped)

  CACHE.set(cacheKey, { ts: Date.now(), data: interleaved })

  res.setHeader('Cache-Control', 's-maxage=3600, stale-while-revalidate=86400')
  res.status(200).json({
    results: interleaved,
    cached: false,
    sources: countBySource(interleaved),
  })
}

function countBySource(results: PhotoResult[]) {
  return results.reduce((acc, r) => ({ ...acc, [r.source]: (acc[r.source] || 0) + 1 }), {} as Record<string, number>)
}

function interleaveBySource(results: PhotoResult[]): PhotoResult[] {
  const groups: Record<string, PhotoResult[]> = { unsplash: [], pexels: [], pixabay: [] }
  results.forEach(r => groups[r.source].push(r))
  const out: PhotoResult[] = []
  const max = Math.max(groups.unsplash.length, groups.pexels.length, groups.pixabay.length)
  for (let i = 0; i < max; i++) {
    if (groups.unsplash[i]) out.push(groups.unsplash[i])
    if (groups.pexels[i]) out.push(groups.pexels[i])
    if (groups.pixabay[i]) out.push(groups.pixabay[i])
  }
  return out
}
