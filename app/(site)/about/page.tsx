import Image from 'next/image'
import Link from 'next/link'
import { groq } from 'next-sanity'
import { client } from '@/sanity/client'
import Marquee from '@/components/Marquee/Marquee'
import Timecode from '@/components/Timecode/Timecode'
import { RevealLines, ScrollStatement } from '@/components/Reveal/Reveal'
import styles from './About.module.scss'

export const revalidate = 60

const DISCIPLINES = [
  { title: 'POSTERS', detail: 'GIGS · CLUB NIGHTS · FESTIVALS' },
  { title: 'COVER ART', detail: 'VINYL · TAPE · SINGLES' },
  { title: 'TYPOGRAPHY', detail: 'CUSTOM LETTERING · LOGOTYPES' },
  { title: 'MERCH', detail: 'TEES · DROPS · PACKAGING' },
]

const PROCESS = [
  { n: '01', title: 'DIG', img: '/posters/poster-5.jpg', copy: "Records, street photos, the scene's own slang. Research before pixels." },
  { n: '02', title: 'CUT', img: '/posters/poster-3.jpg', copy: 'Photocopy, tear, scan, distort. Type drawn by hand, then broken on purpose.' },
  { n: '03', title: 'PRINT LOUD', img: '/posters/poster-1.jpg', copy: 'Riso, screen, digital — then out onto walls, sleeves and shirts.' },
]

const MARQUEE = ['DIGGING CULTURE', '黒明澤', 'POSTERS', 'COVER ART', 'ATHENS / GR', 'TYPE', 'XEROX']

// Selected clients come from the project archive: one row per client, newest year first.
const clientsQuery = groq`*[_type == "project"] | order(year desc) { client, title, year }`

type ClientRow = { name: string; year: number }

export default async function AboutPage() {
  const rows: { client?: string; title: string; year: number }[] = await client.fetch(clientsQuery)

  const seen = new Set<string>()
  const clients: ClientRow[] = []
  for (const r of rows) {
    const name = (r.client ?? r.title)?.trim()
    if (!name || seen.has(name.toLowerCase())) continue
    seen.add(name.toLowerCase())
    clients.push({ name, year: r.year })
  }
  const half = Math.ceil(Math.min(clients.length, 10) / 2)
  const sideA = clients.slice(0, half)
  const sideB = clients.slice(half, 10)

  return (
    <main>
      {/* ── Hero ── */}
      <section className={styles.hero}>
        <div className={styles.kickerRow}>
          <span>FILE 02 — ABOUT.EXE</span>
          <Timecode prefix="TC" />
        </div>
        <div className={styles.backdrop} aria-hidden="true">CRATES</div>
        <div className={styles.heroGrid}>
          <RevealLines
            className={styles.h1}
            lines={[{ text: 'STILL' }, { text: 'DIGGING', red: true }, { text: 'CULTURE' }]}
          />
          <figure className={styles.portrait}>
            <div className={styles.portraitFrame}>
              {/* TODO: swap for the real portrait (B/W, shot on dark) */}
              <Image src="/posters/poster-2.jpg" alt="Nove Graphics — portrait" fill sizes="(max-width: 768px) 100vw, 40vw" className={styles.portraitImg} />
              <div className={styles.vhs}>
                <div><span>PLAY ▶</span><span>SP</span></div>
                <div><Timecode /><span className={styles.red}>● REC</span></div>
              </div>
            </div>
            <figcaption className={styles.figcap}>FIG.01 — THE DIGGER, EXARCHIA 2026</figcaption>
          </figure>
        </div>
        <div className={styles.facts}>
          <div><div className={styles.factLabel}>BASED</div><div>ATHENS / GR</div></div>
          <div><div className={styles.factLabel}>ACTIVE SINCE</div><div>2016</div></div>
          <div><div className={styles.factLabel}>MEDIUM</div><div>PRINT · TYPE · MERCH</div></div>
          <div><div className={styles.factLabel}>STATUS</div><div className={styles.red}>BOOKING Q1 2027</div></div>
        </div>
      </section>

      {/* ── Manifesto ── */}
      <section className={styles.split13}>
        <div className={styles.kickerRed}>[ MANIFESTO ]</div>
        <div>
          <ScrollStatement
            className={styles.statement}
            parts={[
              'Street culture is an archive nobody filed.',
              'I pull from flyers, tags, worn-out tapes and',
              'photocopies — then cut them into posters, covers',
              'and type that hits like a bassline.',
            ]}
          />
          <div className={styles.bodyCols}>
            <p>NOVE is the one-person graphics practice of an Athens-based designer working between hip-hop, nightlife and the underground. Every piece starts analogue — xerox, scissors, spray — and ends up on the wall.</p>
            <p>The work lives on walls, sleeves and shirts: event posters, record artwork, merch drops, identities for crews who&apos;d rather be heard than seen. <em className={styles.accent}>Dig deep, print loud.</em></p>
          </div>
        </div>
      </section>

      <Marquee words={MARQUEE} />

      {/* ── Disciplines ── */}
      <section className={styles.disciplines}>
        <div className={styles.sectionHead}>
          <span className={styles.red}>[ DISCIPLINES ]</span>
          <span>{String(DISCIPLINES.length).padStart(2, '0')} CUTS</span>
        </div>
        <div className={styles.discList}>
          {DISCIPLINES.map((d, i) => (
            <Link href="/projects" className={styles.discRow} key={d.title}>
              <span className={styles.discNum}>{String(i + 1).padStart(2, '0')}</span>
              <span className={styles.discTitle}>{d.title}</span>
              <span className={styles.discDetail}>{d.detail}</span>
              <span className={styles.discArrow}>↗</span>
            </Link>
          ))}
        </div>
      </section>

      {/* ── Clients ── */}
      {clients.length > 0 && (
        <section className={styles.clients}>
          <div>
            <div className={styles.kickerRed}>[ CRATE — SELECTED CLIENTS ]</div>
            <p className={styles.clientsLine}>Side A is the headliners. Side B is where the good stuff hides.</p>
            <div className={styles.record} aria-hidden="true"><div className={styles.grooves} /></div>
          </div>
          <div className={styles.sides}>
            {[{ label: 'A', list: sideA }, { label: 'B', list: sideB }].filter(s => s.list.length).map(side => (
              <div key={side.label} className={side.label === 'B' ? styles.sideB : undefined}>
                <div className={styles.sideHead}>SIDE {side.label}</div>
                <div>
                  {side.list.map((c, i) => (
                    <div className={styles.clientRow} key={c.name}>
                      <span className={styles.clientNo}>{side.label}{i + 1}</span>
                      <span>{c.name}</span>
                      <span className={styles.clientYear}>{c.year}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ── Process ── */}
      <section className={styles.process}>
        <div className={styles.kickerRed}>[ PROCESS ]</div>
        <div className={styles.procGrid}>
          {PROCESS.map(p => (
            <div className={styles.procCard} key={p.n}>
              <div className={styles.procFrame}>
                <Image src={p.img} alt="" fill sizes="(max-width: 768px) 100vw, 33vw" className={styles.procImg} />
              </div>
              <div className={styles.procTitle}><span>{p.n}</span><span>{p.title}</span></div>
              <p>{p.copy}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Contact CTA ── */}
      <section className={styles.cta}>
        <div className={styles.ctaKicker}>[ CONTACT ] — OPEN FOR COMMISSIONS</div>
        <a href="mailto:info@novegraphics.com" className={styles.ctaLink}>
          <span className={styles.jitter}>LET&apos;S DIG</span><span className={styles.red}> ↗</span>
        </a>
        <div className={styles.ctaRow}>
          <a href="mailto:info@novegraphics.com">INFO@NOVEGRAPHICS.COM</a>
          <a href="https://instagram.com/nove_graphics" target="_blank" rel="noopener noreferrer">INSTAGRAM</a>
        </div>
      </section>
    </main>
  )
}
