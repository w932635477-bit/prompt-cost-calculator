// src/photos/PhotosApp.tsx — main search page

import { useState, useCallback, useEffect } from 'react'
import { GlobalNav } from '../components/GlobalNav'
import { RelatedTools } from '../components/RelatedTools'
import PhotoCard from './PhotoCard'
import type { PhotoResult, SearchResponse } from './types'

const POPULAR_QUERIES = ['laptop', 'office', 'coffee', 'meeting', 'nature', 'technology', 'business', 'workspace', 'startup']

function MockResults(query: string): PhotoResult[] {
  // Used when no API keys configured — for development / preview only.
  // Replaced with real API once UNSPLASH_ACCESS_KEY etc. are set.
  return Array.from({ length: 9 }, (_, i) => ({
    id: `mock_${query}_${i}`,
    source: (['unsplash', 'pexels', 'pixabay'] as const)[i % 3],
    url: {
      thumb: `https://placehold.co/400x300?text=${encodeURIComponent(query)}+${i + 1}`,
      full: `https://placehold.co/1920x1080?text=${encodeURIComponent(query)}+${i + 1}`,
      download: `https://placehold.co/1920x1080?text=${encodeURIComponent(query)}+${i + 1}`,
    },
    dimensions: { width: 1920, height: 1080 },
    author: { name: 'Mock Author', profileUrl: '#' },
    license: {
      type: (['unsplash', 'pexels', 'pixabay'] as const)[i % 3],
      commercialUse: true,
      attributionRequired: false,
      modifications: true,
      greenLight: true,
      shortLabel: 'Mock License',
    },
    tags: [query],
    fetchedAt: new Date().toISOString(),
    alt: `${query} mock photo ${i + 1}`,
  }))
}

export default function PhotosApp({ initialQuery = '' }: { initialQuery?: string }) {
  const [query, setQuery] = useState(initialQuery)
  const [submitted, setSubmitted] = useState(initialQuery)
  const [results, setResults] = useState<PhotoResult[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [filterGreen, setFilterGreen] = useState(false)
  const [usingMock, setUsingMock] = useState(false)

  const search = useCallback(async (q: string) => {
    if (!q.trim()) return
    setLoading(true)
    setError(null)
    setSubmitted(q)
    try {
      const res = await fetch(`/api/photos/search?q=${encodeURIComponent(q)}`)
      if (!res.ok) {
        if (res.status === 429) throw new Error('Too many requests — wait a moment')
        if (res.status === 404) {
          // /api endpoint not available (vite preview, missing keys, etc.) — show preview mode
          setResults(MockResults(q))
          setUsingMock(true)
          return
        }
        if (res.status >= 500) throw new Error('Backend error — using local preview')
        throw new Error(`Search failed (${res.status})`)
      }
      const text = await res.text()
      let data: SearchResponse
      try {
        data = JSON.parse(text) as SearchResponse
      } catch {
        // Backend returned HTML (e.g., vite preview without /api route) — fall back to mock silently
        setResults(MockResults(q))
        setUsingMock(true)
        return
      }
      if (data.results.length === 0) {
        setResults(MockResults(q))
        setUsingMock(true)
      } else {
        setResults(data.results)
        setUsingMock(false)
      }
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Unknown error'
      setError(msg)
      setResults(MockResults(q))
      setUsingMock(true)
    } finally {
      setLoading(false)
    }
  }, [])

  // Run initial search if query in URL
  useEffect(() => {
    if (initialQuery) search(initialQuery)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Sync URL with query param
  useEffect(() => {
    if (submitted) {
      const params = new URLSearchParams({ q: submitted })
      const newUrl = `${window.location.pathname}?${params.toString()}`
      window.history.replaceState({}, '', newUrl)
    }
  }, [submitted])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (query.trim()) search(query)
  }

  const visibleResults = filterGreen ? results.filter(r => r.license.greenLight) : results

  return (
    <div className="min-h-screen bg-[#f5f5f7]">
      <GlobalNav current="/photos/" />

      <main className="max-w-[1100px] mx-auto px-6 py-10">
        {/* Hero */}
        <section className="mb-7">
          <div className="text-xs font-medium text-[#0071E3] uppercase tracking-wide mb-2">Stock Photos</div>
          <h1 className="text-3xl md:text-4xl font-semibold text-[#1d1d1f] tracking-tight mb-3">
            Free Stock Photos — No Attribution Required
          </h1>
          <p className="text-[#86868b] text-lg leading-relaxed mb-5">
            Search Unsplash, Pexels, and Pixabay in one place. Each photo clearly labeled
            for commercial use and attribution requirements. Safe to use, free to download.
          </p>
        </section>

        {/* Search bar */}
        <form onSubmit={handleSubmit} className="mb-5">
          <div className="bg-white rounded-2xl shadow-sm p-2 flex items-center gap-2">
            <svg className="w-5 h-5 text-[#86868b] ml-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Search free stock photos…"
              data-testid="search-input"
              className="flex-1 px-2 py-2.5 bg-transparent outline-none text-[#1d1d1f] placeholder:text-[#86868b]"
            />
            <button
              type="submit"
              disabled={!query.trim() || loading}
              data-testid="search-button"
              className="px-5 py-2.5 bg-[#0071E3] text-white rounded-full font-medium text-sm hover:bg-[#0077ED] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? 'Searching…' : 'Search'}
            </button>
          </div>
        </form>

        {/* Filters */}
        {results.length > 0 && (
          <div className="flex items-center gap-3 mb-5 flex-wrap">
            <label className="flex items-center gap-2 cursor-pointer text-sm">
              <input
                type="checkbox"
                checked={filterGreen}
                onChange={e => setFilterGreen(e.target.checked)}
                className="rounded text-[#0071E3] focus:ring-[#0071E3]/30"
              />
              <span className="text-[#1d1d1f]">Green-light only (commercial + no attribution)</span>
            </label>
            <span className="text-sm text-[#86868b]">·</span>
            <span className="text-sm text-[#86868b]">{visibleResults.length} of {results.length} photos</span>
          </div>
        )}

        {/* Popular queries — only when no search yet */}
        {!submitted && (
          <div className="mb-8">
            <div className="text-sm font-medium text-[#1d1d1f] mb-3">Popular searches</div>
            <div className="flex flex-wrap gap-2">
              {POPULAR_QUERIES.map(q => (
                <button
                  key={q}
                  onClick={() => { setQuery(q); search(q) }}
                  className="text-sm px-3 py-1.5 bg-white rounded-lg shadow-sm hover:bg-[#f5f5f7] text-[#1d1d1f] transition-colors"
                >
                  {q}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 mb-5 text-sm text-amber-800">
            {error}
          </div>
        )}

        {/* Mock notice */}
        {usingMock && results.length > 0 && (
          <div className="bg-[#0071E3]/5 border border-[#0071E3]/20 rounded-xl p-3 mb-5 text-sm text-[#1d1d1f]">
            Preview mode: showing placeholder results. Real photos appear once API keys are configured.
          </div>
        )}

        {/* Results grid */}
        {loading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {Array.from({ length: 9 }).map((_, i) => (
              <div key={i} className="bg-white rounded-2xl overflow-hidden shadow-sm">
                <div className="aspect-[4/3] bg-[#f5f5f7] animate-pulse" />
                <div className="p-3 space-y-2">
                  <div className="h-3 bg-[#f5f5f7] rounded animate-pulse" />
                  <div className="h-3 bg-[#f5f5f7] rounded w-2/3 animate-pulse" />
                </div>
              </div>
            ))}
          </div>
        )}

        {!loading && visibleResults.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mb-8">
            {visibleResults.map(p => (
              <PhotoCard key={p.id} photo={p} />
            ))}
          </div>
        )}

        {!loading && submitted && results.length === 0 && !error && (
          <div className="text-center py-10 text-[#86868b]">
            No results for "{submitted}" — try a different query.
          </div>
        )}

        {/* License Guide link */}
        <div className="bg-white rounded-2xl shadow-sm p-5 mb-8 flex items-center justify-between">
          <div>
            <h2 className="text-base font-semibold text-[#1d1d1f]">Not sure about licenses?</h2>
            <p className="text-sm text-[#86868b] mt-1">Read our plain-English guide to commercial use, attribution, and what you can do.</p>
          </div>
          <a
            href="/photos/license-guide/"
            className="text-sm text-[#0071E3] hover:underline whitespace-nowrap"
          >
            License guide →
          </a>
        </div>

        {/* FAQ */}
        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-[#1d1d1f] tracking-tight mb-4">FAQ</h2>
          <div className="space-y-3">
            {[
              { q: 'Are these photos really free?', a: 'Yes. All sources (Unsplash, Pexels, Pixabay) offer free photos under their respective free licenses. No subscription, no purchase, no signup required.' },
              { q: 'Can I use them commercially without attribution?', a: 'Yes for all 3 sources. The "✓ Safe" green badge confirms commercial use is permitted with no attribution required. Some have minor restrictions like "cannot be sold without modification" — check the license badge.' },
              { q: 'What\'s the catch?', a: 'No catch. Photographers contribute under these licenses voluntarily. The platforms make money via paid plans for advanced features (Unsplash+ etc.) but the core search is free.' },
              { q: 'Why do some photos still require attribution?', a: 'Older photos on some platforms predate the no-attribution rule. The badge "Attrib req" flags these — when in doubt, attribute the photographer.' },
            ].map((item, i) => (
              <details key={i} className="group bg-white rounded-2xl shadow-sm overflow-hidden">
                <summary className="cursor-pointer p-5 text-base font-medium text-[#1d1d1f] group-open:text-[#0071E3]">
                  {item.q}
                </summary>
                <div className="px-5 pb-5 text-sm text-[#86868b] leading-relaxed">{item.a}</div>
              </details>
            ))}
          </div>
        </section>

        <footer className="border-t border-[#e8e8ed] pt-5 text-center text-sm text-[#86868b]">
          <p>Free stock photos from Unsplash, Pexels, and Pixabay. No login, no tracking.</p>
        </footer>
        <RelatedTools currentPath="/photos/" />
      </main>
    </div>
  )
}
