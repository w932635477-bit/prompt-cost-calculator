// api/photos/_license.ts
// License rules per source — translates raw API output → unified PhotoLicense

export interface PhotoLicense {
  type: 'cc0' | 'unsplash' | 'pexels' | 'pixabay'
  commercialUse: boolean
  attributionRequired: boolean
  modifications: boolean
  trafficRestrictions?: string
  greenLight: boolean       // = commercial AND no attribution required
  shortLabel: string
}

export const UNSPLASH_LICENSE: PhotoLicense = {
  type: 'unsplash',
  commercialUse: true,
  attributionRequired: false,
  modifications: true,
  trafficRestrictions: 'Cannot be sold without modification',
  greenLight: true,
  shortLabel: 'Unsplash License',
}

export const PEXELS_LICENSE: PhotoLicense = {
  type: 'pexels',
  commercialUse: true,
  attributionRequired: false,
  modifications: true,
  greenLight: true,
  shortLabel: 'Pexels License',
}

export const PIXABAY_LICENSE: PhotoLicense = {
  type: 'pixabay',
  commercialUse: true,
  attributionRequired: false,
  modifications: true,
  trafficRestrictions: 'Cannot identify recognizable people',
  greenLight: true,
  shortLabel: 'Pixabay Content License',
}
