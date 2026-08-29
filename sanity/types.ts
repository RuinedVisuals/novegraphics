export type SanityImage = {
  _type: 'image'
  asset: { _ref: string; _type: 'reference' }
  hotspot?: { x: number; y: number; height: number; width: number }
}

export type Project = {
  _id: string
  title: string
  slug: { current: string }
  year: number
  category?: 'album-art' | 'poster' | 'merch' | 'branding'
  description?: string
  frontImage: SanityImage
  backImage?: SanityImage
  spineImage?: SanityImage
}
