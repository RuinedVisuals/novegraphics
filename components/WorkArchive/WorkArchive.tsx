'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import gsap from 'gsap';
import { useTimecode } from '@/components/Timecode/Timecode';
import styles from './WorkArchive.module.scss';

export type WorkItem = {
  id: string;
  slug: string;
  title: string;
  category: string; // display label
  client?: string;
  year: number;
  thumb: string;
  hero: string;
};

type Props = { items: WorkItem[]; categories: string[] };

const p2 = (n: number) => String(n).padStart(2, '0');
const CARD_ROT = [-2, 1.5, -1, 2, -1.5];
const PREVIEW_ROT = [-4, 3, -2, 4, -3];
const COL_OFFSET = ['0px', '80px', '30px'];

export default function WorkArchive({ items, categories }: Props) {
  const [filter, setFilter] = useState('ALL');
  const [view, setView] = useState<'index' | 'archive'>('index');
  const [hover, setHover] = useState(-1);
  const [flick, setFlick] = useState(0);
  const tc = useTimecode();
  const previewRef = useRef<HTMLDivElement>(null);

  const list = items
    .map((p, idx) => ({ ...p, idx }))
    .filter(p => filter === 'ALL' || p.category === filter);

  // Flicker the WORK mask through the posters
  useEffect(() => {
    if (items.length < 2 || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    items.forEach(p => { const img = new Image(); img.src = p.hero; });
    const id = setInterval(() => setFlick(f => f + 1), 200);
    return () => clearInterval(id);
  }, [items]);

  // Cursor-follow preview
  useEffect(() => {
    const el = previewRef.current;
    if (!el) return;
    const xTo = gsap.quickTo(el, 'x', { duration: 0.35, ease: 'power3.out' });
    const yTo = gsap.quickTo(el, 'y', { duration: 0.35, ease: 'power3.out' });
    const onMove = (e: MouseEvent) => { xTo(e.clientX); yTo(e.clientY); };
    window.addEventListener('mousemove', onMove);
    return () => window.removeEventListener('mousemove', onMove);
  }, [view]);

  const flickImg = items.length ? items[flick % items.length].hero : undefined;
  const hovered = hover >= 0 ? items[hover] : undefined;

  return (
    <>
      <section className={styles.hero}>
        <div className={styles.kickerRow}>
          <span>FILE 01 — WORK.EXE</span>
          <span>ARCHIVE 2016 — 2026</span>
        </div>
        <div className={styles.wordWrap}>
          <h1
            className={styles.word}
            style={flickImg ? { backgroundImage: `url(${flickImg})` } : undefined}
          >
            WORK
          </h1>
          <span className={styles.count}>({p2(list.length)})</span>
        </div>
        <div className={styles.subRow}>
          <p className={styles.selected}>SELECTED WORK</p>
          <p className={styles.lede}>Posters, sleeves and merch for the underground. Dug out of Athens, pasted on walls.</p>
        </div>
      </section>

      <div className={styles.controls}>
        <div className={styles.filters}>
          {['ALL', ...categories].map(c => {
            const n = c === 'ALL' ? items.length : items.filter(p => p.category === c).length;
            return (
              <button
                key={c}
                type="button"
                className={filter === c ? styles.active : undefined}
                onClick={() => { setFilter(c); setHover(-1); }}
              >
                {c}<sup>{p2(n)}</sup>
              </button>
            );
          })}
        </div>
        <div className={styles.views}>
          <button type="button" className={view === 'index' ? styles.on : undefined} onClick={() => setView('index')}>[ INDEX ]</button>
          <button type="button" className={view === 'archive' ? styles.on : undefined} onClick={() => { setView('archive'); setHover(-1); }}>[ ARCHIVE ]</button>
        </div>
      </div>

      {view === 'index' ? (
        <section className={styles.index} onMouseLeave={() => setHover(-1)}>
          <div className={`${styles.row} ${styles.headRow}`}>
            <span>NO.</span><span>TITLE</span><span className={styles.hideMobile}>TYPE</span><span className={styles.hideMobile}>CLIENT</span><span className={styles.year}>YEAR</span>
          </div>
          {list.map(p => {
            const on = hover === p.idx;
            const cls = [styles.row, styles.item, on ? styles.hovered : '', hover >= 0 && !on ? styles.dimmed : ''].join(' ');
            return (
              <Link key={p.id} href={`/projects/${p.slug}`} className={cls} onMouseEnter={() => setHover(p.idx)}>
                <span className={styles.num}>{p2(p.idx + 1)}</span>
                <span className={styles.title}>{p.title}</span>
                <span className={`${styles.meta} ${styles.hideMobile}`}>{p.category}</span>
                <span className={`${styles.meta} ${styles.client} ${styles.hideMobile}`}>{p.client ?? '—'}</span>
                <span className={styles.year}>{p.year}</span>
              </Link>
            );
          })}
          <div className={styles.rowEnd} />

          <div ref={previewRef} className={styles.previewAnchor} aria-hidden="true">
            <div
              className={`${styles.preview} ${hovered ? styles.visible : ''}`}
              style={{ '--rot': `${hovered ? PREVIEW_ROT[hover % 5] : 0}deg` } as React.CSSProperties}
            >
              {hovered && <div className={styles.previewImg} style={{ backgroundImage: `url(${hovered.thumb})` }} />}
              <div className={styles.previewCap}><span>● PLAY</span><span>{tc}</span></div>
            </div>
          </div>
        </section>
      ) : (
        <section className={styles.archive}>
          {list.map((p, j) => (
            <Link key={p.id} href={`/projects/${p.slug}`} className={styles.card} style={{ marginTop: COL_OFFSET[j % 3] }}>
              <div className={styles.cardFrame} style={{ '--rot': `${CARD_ROT[p.idx % 5]}deg` } as React.CSSProperties}>
                <div role="img" aria-label={p.title} className={styles.cardImg} style={{ backgroundImage: `url(${p.thumb})` }} />
                <span className={styles.badge}>FILE {p2(p.idx + 1)}</span>
              </div>
              <div className={styles.cardTitleRow}>
                <span className={styles.cardTitle}>{p.title}</span>
                <span className={styles.cardYear}>{p.year}</span>
              </div>
              <span className={styles.cardCat}>{p.category}</span>
            </Link>
          ))}
        </section>
      )}

      <Link href="/contact" className={styles.cta}>
        <div>
          <div className={styles.ctaKicker}>FILE 04 — CONTACT</div>
          <div className={styles.ctaTitle}>GOT A WALL <span>TO FILL?</span></div>
        </div>
        <span className={styles.ctaArrow}>→</span>
      </Link>
    </>
  );
}
