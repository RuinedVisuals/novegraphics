import { groq } from 'next-sanity'
import { client } from '@/sanity/client'
import { urlFor } from '@/sanity/image'
import type { Project } from '@/sanity/types'
import ProjectsCanvas from '@/components/ProjectsCanvas/ProjectsCanvas'
import ProjectGrid from '@/components/ProjectGrid/ProjectGrid'
import FilmGallery from '@/components/FilmGallery/FilmGallery'
import { getFilms } from '@/sanity/getFilms'

export const revalidate = 60

const query = groq`
  *[_type == "project"] | order(year desc) {
    _id,
    title,
    slug { current },
    year,
    category,
    description,
    frontImage,
    backImage,
  }
`

export default async function ProjectsPage() {
  const [projects, films]: [Project[], Awaited<ReturnType<typeof getFilms>>] = await Promise.all([
    client.fetch(query),
    getFilms(),
  ])

  const canvasUrls = projects
    .filter(p => p.frontImage)
    .map(p => urlFor(p.frontImage).width(1920).height(1080).url())

  const gridUrls = projects.map(p => ({
    front: p.frontImage ? urlFor(p.frontImage).width(900).height(900).url() : '',
    back:  p.backImage  ? urlFor(p.backImage).width(900).height(900).url()  : undefined,
  }))

  return (
    <main>
      <ProjectsCanvas imageUrls={canvasUrls} />
      <ProjectGrid projects={projects} urls={gridUrls} />
      <FilmGallery films={films} />
    </main>
  )
}
