import { notFound } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { client } from '@/sanity/client'
import { urlFor } from '@/sanity/image'
import { projectListQuery, projectQuery } from '@/sanity/queries'
import { CATEGORY_LABELS, type Project, type SanityImage } from '@/sanity/types'
import Timecode, { RecDot } from '@/components/Timecode/Timecode'
import { RevealImage, RevealLines, ScrollStatement } from '@/components/Reveal/Reveal'
import styles from './ProjectDetail.module.scss'

export const revalidate = 60

type ListProject = Pick<Project, '_id' | 'title' | 'slug' | 'year' | 'category'>

const p2 = (n: number) => String(n).padStart(2, '0')

const ASPECT: Record<string, string> = { wide: '16 / 9', tall: '3 / 4', square: '1 / 1' }

// Fixed editorial slots from the design; a frame's `layout` can override the aspect ratio.
const SLOTS = [
  { cls: 'fr1', aspect: '4 / 5' },
  { cls: 'fr2', aspect: '1 / 1' },
  { cls: 'fr3', aspect: '3 / 2' },
  { cls: 'fr4', aspect: '21 / 9' },
  { cls: 'fr5', aspect: '3 / 4' },
  { cls: 'fr6', aspect: '16 / 9' },
  { cls: 'fr7', aspect: '3 / 2' }, // under fr1, tilted
] as const

// "a / b / c" → tone steps; otherwise split the statement into three even chunks.
function splitStatement(text: string): string[] {
  if (text.includes(' / ')) return text.split(' / ').map(s => s.trim()).filter(Boolean)
  const words = text.trim().split(/\s+/)
  if (words.length < 6) return [text]
  const size = Math.ceil(words.length / 3)
  return [0, 1, 2].map(i => words.slice(i * size, (i + 1) * size).join(' ')).filter(Boolean)
}

export default async function ProjectPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const [project, all]: [Project | null, ListProject[]] = await Promise.all([
    client.fetch(projectQuery, { slug }),
    client.fetch(projectListQuery),
  ])

  if (!project) notFound()

  const index = Math.max(0, all.findIndex(p => p._id === project._id))
  const total = all.length
  const next = total > 1 ? all[(index + 1) % total] : null
  const typeLabel = project.category ? CATEGORY_LABELS[project.category] : '—'

  const heroSrc = project.heroImage ?? project.frontImage
  const heroUrl = urlFor(heroSrc).width(2400).url()

  const frames = project.gallery?.length
    ? project.gallery.map(g => ({ image: g.image, caption: g.caption, layout: g.layout }))
    : [project.frontImage, project.backImage]
        .filter((img): img is SanityImage => Boolean(img))
        .map(image => ({ image, caption: undefined, layout: undefined }))

  // fr7 sits under fr1: the 7th gallery frame, else the first process image not already shown.
  if (!frames[6] && frames.length < 7) {
    const shown = new Set(frames.map(f => f.image.asset._ref))
    const extra = project.process?.find(img => !shown.has(img.asset._ref))
    if (extra) frames[6] = { image: extra, caption: undefined, layout: undefined }
  }
  const frameCount = frames.filter(Boolean).length

  const process: SanityImage[] = project.process?.length ? project.process : frames.filter(Boolean).map(f => f.image)
  // Fill the contact sheet so the loop never shows a gap
  const sheet = process.length ? Array.from({ length: Math.max(6, process.length) }, (_, i) => process[i % process.length]) : []

  const statement = project.brief ?? project.description
  const body = project.body ?? []

  const credits = project.credits?.length
    ? project.credits
    : [
        { _key: 'ad', label: 'ART DIRECTION', value: 'Nove Graphics' },
        ...(project.client ? [{ _key: 'cl', label: 'CLIENT', value: project.client }] : []),
      ]

  const frame = (i: number) => {
    const f = frames[i]
    if (!f) return null
    const slot = SLOTS[i]
    const caption = `FR ${p2(i + 1)}${f.caption ? ` — ${f.caption}` : ''}`
    return (
      <figure className={`${styles.figure} ${styles[slot.cls]}`} key={i}>
        <RevealImage>
          <div className={styles.frame} style={{ aspectRatio: (f.layout && ASPECT[f.layout]) || slot.aspect }}>
            <Image
              src={urlFor(f.image).width(i === 3 ? 2400 : 1400).url()}
              alt={f.caption ?? `${project.title} — frame ${i + 1}`}
              fill
              sizes={i === 3 ? '100vw' : '(max-width: 768px) 100vw, 60vw'}
              className={styles.img}
            />
          </div>
        </RevealImage>
        {i === 3 ? (
          <figcaption className={`${styles.caption} ${styles.split}`}>
            <span>{caption}</span><span>37.9867° N, 23.7348° E</span>
          </figcaption>
        ) : (
          <figcaption className={styles.caption}>{caption}</figcaption>
        )}
      </figure>
    )
  }

  return (
    <main>
      {/* ── Hero ── */}
      <section className={styles.hero}>
        <div className={styles.heroMedia}>
          {project.heroVideoUrl ? (
            <video src={project.heroVideoUrl} poster={heroUrl} autoPlay muted loop playsInline />
          ) : (
            <Image src={heroUrl} alt={project.title} fill priority sizes="100vw" className={styles.heroImg} />
          )}
        </div>
        <div className={styles.scrim} />
        <div className={styles.tracking} aria-hidden="true" />

        <div className={styles.heroTop}>
          <span>PLAY ▶&nbsp;&nbsp;SP</span>
          <span className={styles.rec}><RecDot /><Timecode prefix="TC" /></span>
        </div>

        <div className={styles.heroBottom}>
          <div className={styles.chip}>
            <span>PROJECT {p2(index + 1)} / {p2(total)}</span>
            <span className={styles.chipDash}>—</span>
            <span>{typeLabel}</span>
          </div>
          <RevealLines lines={[{ text: project.title }]} className={styles.title} />
          <div className={styles.metaRow}>
            <div><div className={styles.metaLabel}>CLIENT</div><div>{project.client ?? '—'}</div></div>
            <div><div className={styles.metaLabel}>TYPE</div><div>{typeLabel}</div></div>
            <div><div className={styles.metaLabel}>ROLE</div><div>{project.role ?? '—'}</div></div>
            <div><div className={styles.metaLabel}>YEAR</div><div className={styles.red}>{project.year}</div></div>
          </div>
        </div>
      </section>

      {/* ── Brief ── */}
      {statement && (
        <section className={styles.split13}>
          <div className={styles.kickerRed}>[ BRIEF ]</div>
          <div>
            <ScrollStatement parts={splitStatement(statement)} className={styles.statement} />
            {body.length > 0 && (
              <div className={styles.bodyCols}>
                {body.map((para, i) => (
                  <p key={i}>
                    {para}
                    {i === body.length - 1 && project.accent && <> <em className={styles.accent}>{project.accent}</em></>}
                  </p>
                ))}
              </div>
            )}
          </div>
        </section>
      )}

      {/* ── Gallery ── */}
      {frames.length > 0 && (
        <section className={styles.gallery}>
          <div className={styles.galleryHead}>
            <span className={styles.red}>[ GALLERY ]</span>
            <span>{p2(frameCount)} FRAMES</span>
          </div>
          <div className={styles.grid}>
            <div className={styles.leftCol}>
              {frame(0)}
              {frame(6)}
            </div>
            {(frames[1] || frames[2]) && (
              <div className={styles.rightCol}>
                {frame(1)}
                {frame(2)}
              </div>
            )}
            {frame(3)}
            {frame(4)}
            {frame(5)}
          </div>
        </section>
      )}

      {/* ── Contact sheet ── */}
      {sheet.length > 0 && (
        <section className={styles.sheet}>
          <div className={styles.sheetHead}>[ CONTACT SHEET — PROCESS ]</div>
          <div className={styles.strip}>
            {[...sheet, ...sheet].map((img, k) => (
              <div className={styles.sheetFrame} key={k} aria-hidden={k >= sheet.length}>
                <div className={styles.sprockets} />
                <div className={styles.sheetImg}>
                  <Image src={urlFor(img).width(440).height(330).url()} alt="" fill sizes="220px" className={styles.img} />
                </div>
                <div className={styles.sheetLabel}>
                  <span>{(k % sheet.length) + 1}A</span>
                  <span>KODAK 400</span>
                </div>
                <div className={styles.sprockets} />
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ── Credits ── */}
      <section className={styles.split13}>
        <div className={styles.kickerRed}>[ CREDITS ]</div>
        <div className={styles.credits}>
          {credits.map(c => (
            <div className={styles.creditRow} key={c._key}>
              <span>{c.label}</span>
              <span>{c.value}</span>
            </div>
          ))}
        </div>
      </section>

      {/* ── Next project ── */}
      {next && (
        <Link href={`/projects/${next.slug.current}`} className={styles.next}>
          <div className={styles.nextHead}>
            <span>NEXT PROJECT — {p2(((index + 1) % total) + 1)} / {p2(total)}</span>
            <span>{next.category ? CATEGORY_LABELS[next.category] : ''}{next.year ? ` · ${next.year}` : ''}</span>
          </div>
          <div className={styles.nextRow}>
            <span className={styles.nextTitle}>{next.title}</span>
            <span className={styles.nextArrow}>→</span>
          </div>
        </Link>
      )}
    </main>
  )
}
