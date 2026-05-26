// src/photos/PhotoCard.tsx — single photo card with green-light license badge

import { useState } from 'react'
import type { PhotoResult } from './types'

const SOURCE_BADGE: Record<string, string> = {
  unsplash: 'bg-[#1d1d1f] text-white',
  pexels: 'bg-[#05A081] text-white',
  pixabay: 'bg-[#5fa825] text-white',
}

// Trigger Unsplash download endpoint (required by Unsplash API guidelines)
// before navigating to actual image. Pexels/Pixabay don't require this.
async function handleDownload(photo: PhotoResult, e: React.MouseEvent) {
  if (photo.source !== 'unsplash') return  // direct nav for other sources
  e.preventDefault()
  // Photo id is "unsplash_<id>" — strip prefix
  const photoId = photo.id.replace(/^unsplash_/, '')
  try {
    // Fire-and-forget tracking ping via our backend (which holds the key)
    await fetch(`/api/photos/track-download?id=${encodeURIComponent(photoId)}`, { method: 'POST' })
  } catch {
    // Non-blocking: even if tracking fails, let user proceed
  }
  // Now navigate to the actual download URL
  window.open(photo.url.download, '_blank', 'noopener,noreferrer')
}

export default function PhotoCard({ photo }: { photo: PhotoResult }) {
  const [imgLoaded, setImgLoaded] = useState(false)
  const { license } = photo
  const isUnsplash = photo.source === 'unsplash'

  return (
    <article className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow group">
      {/* Image */}
      <div className="relative bg-[#f5f5f7] aspect-[4/3] overflow-hidden">
        {!imgLoaded && (
          <div className="absolute inset-0 flex items-center justify-center text-[#86868b] text-xs">Loading…</div>
        )}
        <img
          src={photo.url.thumb}
          alt={photo.alt}
          loading="lazy"
          onLoad={() => setImgLoaded(true)}
          className={`w-full h-full object-cover transition-opacity duration-300 ${imgLoaded ? 'opacity-100' : 'opacity-0'}`}
        />
        {/* Green light badge — top right */}
        {license.greenLight && (
          <span className="absolute top-2 right-2 bg-[#30d158] text-white text-[10px] px-2 py-0.5 rounded-full font-medium shadow-sm">
            ✓ Safe
          </span>
        )}
        {/* Source badge — top left */}
        <span className={`absolute top-2 left-2 text-[10px] px-2 py-0.5 rounded-full font-medium ${SOURCE_BADGE[photo.source]}`}>
          {photo.source}
        </span>
      </div>

      {/* Body */}
      <div className="p-3">
        {/* License indicators */}
        <div className="flex items-center gap-3 text-xs mb-2">
          <span className="flex items-center gap-1">
            <span className={license.commercialUse ? 'text-[#30d158]' : 'text-red-500'}>
              {license.commercialUse ? '✓' : '✗'}
            </span>
            <span className="text-[#86868b]">Commercial</span>
          </span>
          <span className="flex items-center gap-1">
            <span className={!license.attributionRequired ? 'text-[#30d158]' : 'text-amber-500'}>
              {!license.attributionRequired ? '✓' : '!'}
            </span>
            <span className="text-[#86868b]">{license.attributionRequired ? 'Attrib req' : 'No attrib'}</span>
          </span>
        </div>

        {/* Author + dimensions — Unsplash gets explicit attribution format */}
        <div className="text-xs text-[#86868b] mb-2 truncate">
          {isUnsplash ? (
            <>
              Photo by{' '}
              <a
                href={photo.author.profileUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-[#0071E3] underline-offset-2 hover:underline"
              >
                {photo.author.name}
              </a>
              {' '}on{' '}
              <a
                href="https://unsplash.com/?utm_source=codehelper&utm_medium=referral"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-[#0071E3] underline-offset-2 hover:underline"
              >
                Unsplash
              </a>
              <span className="mx-1.5">·</span>
              <span>{photo.dimensions.width}×{photo.dimensions.height}</span>
            </>
          ) : (
            <>
              <a href={photo.author.profileUrl} target="_blank" rel="noopener noreferrer" className="hover:text-[#0071E3]">
                {photo.author.name}
              </a>
              <span className="mx-1.5">·</span>
              <span>{photo.dimensions.width}×{photo.dimensions.height}</span>
            </>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          <a
            href={photo.url.download}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => handleDownload(photo, e)}
            className="flex-1 text-center text-xs py-1.5 px-2 bg-[#0071E3] text-white rounded-lg hover:bg-[#0077ED] transition-colors font-medium"
          >
            Download
          </a>
          <a
            href={photo.url.full}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs py-1.5 px-2 bg-[#f5f5f7] text-[#1d1d1f] rounded-lg hover:bg-[#e8e8ed] transition-colors"
          >
            View
          </a>
        </div>
      </div>
    </article>
  )
}
