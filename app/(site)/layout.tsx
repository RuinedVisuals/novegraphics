import { groq } from 'next-sanity'
import { client } from '@/sanity/client'
import { urlFor } from '@/sanity/image'
import Header from '@/components/Header/Header'
import Footer from '@/components/Footer/Footer'
import PageTransition from '@/components/PageTransition/PageTransition'
import FilmGallery from '@/components/FilmGallery/FilmGallery'
import LenisProvider from '@/components/LenisProvider/LenisProvider'
import Preloader from '@/components/Preloader/Preloader'
import AudioPlayer from '@/components/AudioPlayer/AudioPlayer'
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

export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  const projects = await client.fetch(query, {}, { next: { revalidate: 60 } })

  const films: Film[] = projects
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

  return (
    <div style={{ paddingTop: 'var(--nav-height)' }}>
      <Preloader />
      <Header />
      <div id="page-content">
        <LenisProvider>
          <PageTransition>
            {children}
          </PageTransition>
          <FilmGallery films={films} />
          <Footer />
        </LenisProvider>
      </div>
      <AudioPlayer />
    </div>
  )
}
