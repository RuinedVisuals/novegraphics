export type SanityImage = {
  _type: 'image'
  asset: { _ref: string; _type: 'reference' }
  hotspot?: { x: number; y: number; height: number; width: number }
}

export type ProjectCategory = 'album-art' | 'poster' | 'merch' | 'branding'

export const CATEGORY_LABELS: Record<ProjectCategory, string> = {
  'poster':    'EVENT POSTER',
  'album-art': 'ALBUM ART',
  'merch':     'MERCH',
  'branding':  'BRANDING',
}

export type GalleryItem = {
  _key: string
  image: SanityImage
  caption?: string
  layout?: 'wide' | 'tall' | 'square'
}

export type Credit = { _key: string; label?: string; value?: string }

export type Project = {
  _id: string
  title: string
  slug: { current: string }
  year: number
  category?: ProjectCategory
  description?: string
  frontImage: SanityImage
  backImage?: SanityImage
  spineImage?: SanityImage
  order?: number
  client?: string
  role?: string
  heroImage?: SanityImage
  heroVideoUrl?: string
  brief?: string
  body?: string[]
  accent?: string
  gallery?: GalleryItem[]
  process?: (SanityImage & { _key: string })[]
  credits?: Credit[]
}
