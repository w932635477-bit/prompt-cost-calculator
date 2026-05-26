// api/photos/_adapters.ts
// Adapters: per-source raw API → unified PhotoResult shape

import { UNSPLASH_LICENSE, PEXELS_LICENSE, PIXABAY_LICENSE } from './_license.js'
import type { PhotoLicense } from './_license.js'

export interface PhotoResult {
  id: string
  source: 'unsplash' | 'pexels' | 'pixabay'
  url: { thumb: string; full: string; download: string }
  dimensions: { width: number; height: number }
  author: { name: string; profileUrl: string }
  license: PhotoLicense
  tags: string[]
  fetchedAt: string
  alt: string
}

interface UnsplashPhoto {
  id: string
  width: number
  height: number
  urls: { thumb: string; regular: string; full: string }
  alt_description: string | null
  description: string | null
  user: { name: string; links: { html: string } }
  tags?: { title: string }[]
  links: { download: string }
}

interface PexelsPhoto {
  id: number
  width: number
  height: number
  src: { tiny: string; medium: string; large2x: string; original: string }
  alt: string | null
  photographer: string
  photographer_url: string
}

interface PixabayHit {
  id: number
  imageWidth: number
  imageHeight: number
  webformatURL: string
  largeImageURL: string
  user: string
  pageURL: string
  tags: string
}

export async function searchUnsplash(query: string, page: number, key: string): Promise<PhotoResult[]> {
  if (!key) return []
  const url = `https://api.unsplash.com/search/photos?query=${encodeURIComponent(query)}&page=${page}&per_page=12&orientation=landscape`
  const res = await fetch(url, { headers: { Authorization: `Client-ID ${key}`, 'Accept-Version': 'v1' } })
  if (!res.ok) {
    if (res.status === 403) console.warn('Unsplash rate limit hit')
    return []
  }
  const data = await res.json() as { results: UnsplashPhoto[] }
  // Unsplash compliance: append UTM params to attribution URLs
  const utm = '?utm_source=codehelper&utm_medium=referral'
  return data.results.map(p => ({
    id: `unsplash_${p.id}`,
    source: 'unsplash' as const,
    url: { thumb: p.urls.thumb, full: p.urls.regular, download: p.links.download + utm },
    dimensions: { width: p.width, height: p.height },
    author: { name: p.user.name, profileUrl: p.user.links.html + utm },
    license: UNSPLASH_LICENSE,
    tags: p.tags?.map(t => t.title) || [],
    fetchedAt: new Date().toISOString(),
    alt: p.alt_description || p.description || query,
  }))
}

export async function searchPexels(query: string, page: number, key: string): Promise<PhotoResult[]> {
  if (!key) return []
  const url = `https://api.pexels.com/v1/search?query=${encodeURIComponent(query)}&page=${page}&per_page=12&orientation=landscape`
  const res = await fetch(url, { headers: { Authorization: key } })
  if (!res.ok) return []
  const data = await res.json() as { photos: PexelsPhoto[] }
  return data.photos.map(p => ({
    id: `pexels_${p.id}`,
    source: 'pexels' as const,
    url: { thumb: p.src.tiny, full: p.src.large2x, download: p.src.original },
    dimensions: { width: p.width, height: p.height },
    author: { name: p.photographer, profileUrl: p.photographer_url },
    license: PEXELS_LICENSE,
    tags: [],
    fetchedAt: new Date().toISOString(),
    alt: p.alt || query,
  }))
}

export async function searchPixabay(query: string, page: number, key: string): Promise<PhotoResult[]> {
  if (!key) return []
  const url = `https://pixabay.com/api/?key=${key}&q=${encodeURIComponent(query)}&page=${page}&per_page=12&orientation=horizontal&safesearch=true&image_type=photo`
  const res = await fetch(url)
  if (!res.ok) return []
  const data = await res.json() as { hits: PixabayHit[] }
  return data.hits.map(h => ({
    id: `pixabay_${h.id}`,
    source: 'pixabay' as const,
    url: { thumb: h.webformatURL, full: h.largeImageURL, download: h.largeImageURL },
    dimensions: { width: h.imageWidth, height: h.imageHeight },
    author: { name: h.user, profileUrl: h.pageURL },
    license: PIXABAY_LICENSE,
    tags: h.tags.split(', '),
    fetchedAt: new Date().toISOString(),
    alt: h.tags || query,
  }))
}

// Deduplicate by visual similarity proxy (dimensions + author)
export function dedupe(results: PhotoResult[]): PhotoResult[] {
  const seen = new Set<string>()
  return results.filter(r => {
    const key = `${r.dimensions.width}x${r.dimensions.height}_${r.author.name}`
    if (seen.has(key)) return false
    seen.add(key)
    return true
  })
}
