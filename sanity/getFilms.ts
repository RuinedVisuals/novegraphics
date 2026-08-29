import { groq } from 'next-sanity'
import { client } from './client'
import { urlFor } from './image'
import type { Film } from '@/components/FilmGallery/data'

const ACCENTS = ['#ff2a1f', '#3a0618']

const query = groq`
  *[_type == "project"] | order(year desc) {
    _id,
    title,
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
      title: p.title ?? '',
      subTitle: p.category?.toUpperCase().replace('-', ' ') ?? '',
      year: String(p.year ?? ''),
      category: p.category ?? '',
      image: urlFor(p.frontImage).width(800).height(1168).url(),
      back:  p.backImage  ? urlFor(p.backImage).width(800).height(1168).url()  : undefined,
      spine: p.spineImage ? urlFor(p.spineImage).width(200).height(1168).url() : undefined,
      accent: ACCENTS[i % ACCENTS.length],
      description: p.description ?? '',
    }))
}
