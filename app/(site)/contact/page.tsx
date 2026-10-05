import Marquee from '@/components/Marquee/Marquee'
import ContactForm from '@/components/ContactForm/ContactForm'
import AthensClock from '@/components/ContactForm/AthensClock'
import { RevealLines } from '@/components/Reveal/Reveal'
import styles from './Contact.module.scss'

const MARQUEE = ['OPEN FOR COMMISSIONS', '黒明澤', 'POSTERS', 'ALBUM ART', 'MERCH', 'BRANDING', 'ATHENS / GR']

const INFO = [
  { label: 'INSTAGRAM', value: '@NOVE_GRAPHICS ↗', href: 'https://instagram.com/nove_graphics' },
  { label: 'BASED', value: 'ATHENS / GREECE' },
  { label: 'REPLY', value: 'WITHIN 48H' },
  { label: 'STATUS', value: 'BOOKING Q1 2027', red: true },
]

export default function ContactPage() {
  return (
    <main>
      <section className={styles.hero}>
        <div className={styles.kickerRow}>
          <span>FILE 04 — CONTACT.EXE</span>
          <AthensClock />
        </div>
        <div className={styles.backdrop} aria-hidden="true">PRINT</div>
        <RevealLines
          className={styles.h1}
          lines={[{ text: "LET'S MAKE" }, { text: 'SOMETHING', red: true }, { text: 'LOUD.' }]}
        />
      </section>

      <section className={styles.body}>
        <aside className={styles.aside}>
          <div>
            <div className={styles.kickerRed}>[ DIRECT LINE ]</div>
            <a href="mailto:info@novegraphics.com" className={styles.email}>INFO@NOVEGRAPHICS.COM</a>
          </div>
          <div className={styles.info}>
            {INFO.map(row => (
              <div className={styles.infoRow} key={row.label}>
                <span className={styles.infoLabel}>{row.label}</span>
                {row.href ? (
                  <a href={row.href} target="_blank" rel="noopener noreferrer">{row.value}</a>
                ) : (
                  <span className={row.red ? styles.red : undefined}>{row.value}</span>
                )}
              </div>
            ))}
          </div>
          <p className={styles.serif}>Posters, sleeves, merch — or something nobody&apos;s named yet.</p>
        </aside>

        <ContactForm />
      </section>

      <Marquee words={MARQUEE} />
    </main>
  )
}
