'use client';

import { useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import styles from './Reveal.module.scss';

gsap.registerPlugin(ScrollTrigger, useGSAP);

const reduced = () =>
  typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// H1 whose lines rise from yPercent 110 inside overflow-hidden wrappers.
type Line = { text: string; red?: boolean };

export function RevealLines({ lines, className, as: Tag = 'h1' }: { lines: Line[]; className?: string; as?: 'h1' | 'h2' | 'div' }) {
  const ref = useRef<HTMLHeadingElement>(null);

  useGSAP(() => {
    if (reduced()) return;
    gsap.from(ref.current!.querySelectorAll(`.${styles.lineInner}`), {
      yPercent: 110,
      duration: 0.9,
      ease: 'power4.out',
      stagger: 0.08,
      delay: 0.15,
    });
  }, { scope: ref });

  return (
    <Tag ref={ref} className={className}>
      {lines.map((l, i) => (
        <span key={i} className={styles.line}>
          <span className={`${styles.lineInner} ${l.red ? styles.red : ''}`}>{l.text}</span>
        </span>
      ))}
    </Tag>
  );
}

// Statement split into tones (ink → ink-mid → faint …) that scrub to full ink while scrolling.
export function ScrollStatement({ parts, className }: { parts: string[]; className?: string }) {
  const ref = useRef<HTMLParagraphElement>(null);

  useGSAP(() => {
    const words = ref.current!.querySelectorAll<HTMLElement>(`.${styles.word}`);
    if (reduced()) {
      gsap.set(words, { '--p': 1 });
      return;
    }
    gsap.to(words, {
      '--p': 1,
      ease: 'none',
      stagger: 0.05,
      scrollTrigger: {
        trigger: ref.current,
        start: 'top 80%',
        end: 'bottom 45%',
        scrub: true,
      },
    });
  }, { scope: ref });

  return (
    <p ref={ref} className={`${styles.statement} ${className ?? ''}`}>
      {parts.map((part, i) => (
        <span key={i} className={styles[`tone${Math.min(i, 3)}`]}>
          {i > 0 ? ' ' : ''}
          {part.split(/\s+/).filter(Boolean).map((w, j) => (
            <span key={j} className={styles.word}>{w} </span>
          ))}
        </span>
      ))}
    </p>
  );
}

// clip-path wipe from the bottom when the element enters the viewport.
export function RevealImage({ children, className, style }: { children: React.ReactNode; className?: string; style?: React.CSSProperties }) {
  const ref = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    if (reduced()) return;
    gsap.fromTo(ref.current, { clipPath: 'inset(100% 0 0 0)' }, {
      clipPath: 'inset(0% 0 0 0)',
      duration: 1.1,
      ease: 'power4.out',
      // drop the clip once revealed so rotated children aren't cropped
      clearProps: 'clipPath',
      scrollTrigger: { trigger: ref.current, start: 'top 88%', once: true },
    });
  }, { scope: ref });

  return <div ref={ref} className={className} style={style}>{children}</div>;
}
