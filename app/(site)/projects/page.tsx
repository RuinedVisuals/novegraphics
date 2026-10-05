import { client } from '@/sanity/client'
import { urlFor } from '@/sanity/image'
import { projectListQuery } from '@/sanity/queries'
import { CATEGORY_LABELS, type Project } from '@/sanity/types'
import WorkArchive, { type WorkItem } from '@/components/WorkArchive/WorkArchive'

export const revalidate = 60

type ListProject = Pick<Project, '_id' | 'title' | 'slug' | 'year' | 'category' | 'client' | 'frontImage'>

export default async function ProjectsPage() {
  const projects: ListProject[] = await client.fetch(projectListQuery)

  const items: WorkItem[] = projects
    .filter(p => p.frontImage)
    .map(p => ({
      id: p._id,
      slug: p.slug.current,
      title: p.title,
      category: p.category ? CATEGORY_LABELS[p.category] : '',
      client: p.client,
      year: p.year,
      thumb: urlFor(p.frontImage).width(640).height(800).url(),
      hero: urlFor(p.frontImage).width(1600).url(),
    }))

  return (
    <main>
      <WorkArchive items={items} categories={Object.values(CATEGORY_LABELS)} />
    </main>
  )
}
