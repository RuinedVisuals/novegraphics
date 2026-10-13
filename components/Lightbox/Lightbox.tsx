'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import styles from './Lightbox.module.scss'

export type LightboxImage = { src: string; alt: string; caption?: string }

// Opens when any element carrying `data-lightbox="<index>"` is clicked (event delegation,
// so the gallery itself can stay a server component).
export default function Lightbox({ images }: { images: LightboxImage[] }) {
  const [open, setOpen] = useState<number | null>(null)
  const touchX = useRef<number | null>(null)
  const count = images.length

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      const el = (e.target as HTMLElement).closest<HTMLElement>('[data-lightbox]')
      if (!el) return
      const i = Number(el.dataset.lightbox)
      if (Number.isInteger(i) && i >= 0 && i < count) setOpen(i)
    }
    document.addEventListener('click', onClick)
    return () => document.removeEventListener('click', onClick)
  }, [count])

  const step = useCallback(
    (d: number) => setOpen(i => (i === null ? i : (i + d + count) % count)),
    [count],
  )

  useEffect(() => {
    if (open === null) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(null)
      else if (e.key === 'ArrowRight') step(1)
      else if (e.key === 'ArrowLeft') step(-1)
    }
    window.addEventListener('keydown', onKey)
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      window.removeEventListener('keydown', onKey)
      document.body.style.overflow = prev
    }
  }, [open, step])

  // Warm the neighbours so stepping is instant.
  useEffect(() => {
    if (open === null) return
    for (const d of [1, -1]) new Image().src = images[(open + d + count) % count].src
  }, [open, images, count])

  if (open === null) return null
  const img = images[open]

  return createPortal(
    <div
      className={styles.overlay}
      data-lenis-prevent
      role="dialog"
      aria-modal="true"
      aria-label="Image gallery"
      onClick={() => setOpen(null)}
      onTouchStart={e => { touchX.current = e.touches[0].clientX }}
      onTouchEnd={e => {
        if (touchX.current === null) return
        const dx = e.changedTouches[0].clientX - touchX.current
        touchX.current = null
        if (Math.abs(dx) > 50) step(dx < 0 ? 1 : -1)
      }}
    >
      <div className={styles.top} onClick={e => e.stopPropagation()}>
        <span>{String(open + 1).padStart(2, '0')} / {String(count).padStart(2, '0')}</span>
        <button type="button" onClick={() => setOpen(null)} aria-label="Close">[ CLOSE ✕ ]</button>
      </div>

      {count > 1 && (
        <button type="button" className={`${styles.nav} ${styles.prev}`} aria-label="Previous image" onClick={e => { e.stopPropagation(); step(-1) }}>←</button>
      )}

      <figure className={styles.stage} onClick={e => e.stopPropagation()}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img key={img.src} src={img.src} alt={img.alt} className={styles.img} draggable={false} />
        {img.caption && <figcaption className={styles.caption}>{img.caption}</figcaption>}
      </figure>

      {count > 1 && (
        <button type="button" className={`${styles.nav} ${styles.next}`} aria-label="Next image" onClick={e => { e.stopPropagation(); step(1) }}>→</button>
      )}
    </div>,
    document.body,
  )
}
