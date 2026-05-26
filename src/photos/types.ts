// src/photos/types.ts
// Mirror of backend PhotoResult shape (kept in sync with api/photos/_adapters.ts)

export interface PhotoLicense {
  type: 'cc0' | 'unsplash' | 'pexels' | 'pixabay'
  commercialUse: boolean
  attributionRequired: boolean
  modifications: boolean
  trafficRestrictions?: string
  greenLight: boolean
  shortLabel: string
}

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

export interface SearchResponse {
  results: PhotoResult[]
  cached: boolean
  sources: Record<string, number>
  error?: string
}
