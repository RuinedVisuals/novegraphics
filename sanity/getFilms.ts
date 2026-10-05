import { groq } from 'next-sanity'
import { client } from './client'
import { urlFor } from './image'
import { PROJECT_ORDER } from './queries'
import { CATEGORY_LABELS, type ProjectCategory } from './types'
import { SPINE_W, SPINE_H, type Film } from '@/components/FilmGallery/data'

const ACCENTS = ['#ff2a1f', '#3a0618']

const query = groq`
  *[_type == "project"] | ${PROJECT_ORDER} {
    _id,
    title,
    slug { current },
    year,
    category,
    description,
    frontImage,
    backImage,
    spineImage,
  }
`

export async function getFilms(): Promise<Film[]> {
  const projects = await client.fetch(query, {}, { next: { revalidate: 60 } })

  return projects
    .filter((p: any) => p.frontImage)
    .map((p: any, i: number): Film => ({
      id: p._id,
      slug: p.slug?.current ?? '',
      title: p.title ?? '',
      subTitle: CATEGORY_LABELS[p.category as ProjectCategory] ?? p.category?.toUpperCase() ?? '',
      year: String(p.year ?? ''),
      category: p.category ?? '',
      // max-w / max-h: never cropped (width+height would add a rect crop); the 3D card sizes itself to the image
      image: urlFor(p.frontImage).maxWidth(800).maxHeight(1168).url(),
      back:  p.backImage  ? urlFor(p.backImage).maxWidth(800).maxHeight(1168).url()  : undefined,
      spine: p.spineImage ? urlFor(p.spineImage).width(SPINE_W).height(SPINE_H).url() : undefined,
      accent: ACCENTS[i % ACCENTS.length],
      description: p.description ?? '',
    }))
}
