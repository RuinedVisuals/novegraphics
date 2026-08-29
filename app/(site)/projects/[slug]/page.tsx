import { groq } from 'next-sanity'
import { notFound } from 'next/navigation'
import Image from 'next/image'
import { client } from '@/sanity/client'
import { urlFor } from '@/sanity/image'
import type { Project } from '@/sanity/types'
import FilmGallery from '@/components/FilmGallery/FilmGallery'
import { getFilms } from '@/sanity/getFilms'
import styles from './ProjectDetail.module.scss'

export const revalidate = 60

const CATEGORY_LABELS: Record<string, string> = {
  'album-art': 'ALBUM ART',
  'poster':    'EVENT POSTER',
  'merch':     'MERCH',
  'branding':  'BRANDING',
}

const query = groq`
  *[_type == "project" && slug.current == $slug][0] {
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

export default async function ProjectPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const [project, films]: [Project | null, Awaited<ReturnType<typeof getFilms>>] = await Promise.all([
    client.fetch(query, { slug }),
    getFilms(),
  ])

  if (!project) notFound()

  const frontUrl = urlFor(project.frontImage).width(1600).height(1600).url()
  const backUrl = project.backImage ? urlFor(project.backImage).width(1600).height(1600).url() : undefined

  return (
    <main>
      <article className={styles.project}>
        <div className={styles.images}>
          <div className={styles.imageFrame}>
            <Image src={frontUrl} alt={project.title} fill sizes="(max-width: 768px) 100vw, 50vw" className={styles.img} priority />
          </div>
          {backUrl && (
            <div className={styles.imageFrame}>
              <Image src={backUrl} alt={`${project.title} — back`} fill sizes="(max-width: 768px) 100vw, 50vw" className={styles.img} />
            </div>
          )}
        </div>

        <div className={styles.meta}>
          {project.category && (
            <span className={styles.category}>{CATEGORY_LABELS[project.category] ?? project.category}</span>
          )}
          <h1 className={styles.title}>{project.title}</h1>
          <div className={styles.year}>{project.year}</div>
          {project.description && <p className={styles.desc}>{project.description}</p>}
        </div>
      </article>

      <FilmGallery films={films} />
    </main>
  )
}
