'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import styles from './Footer.module.scss';

const GLYPHS = '▓▒░/\|<>[]#%&*+=0123456789';

// Text that "decodes" letter by letter: on first view, on hover, and every few seconds.
export default function ScrambleText({ text }: { text: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const raf = useRef(0);
  const [out, setOut] = useState(text);

  const run = useCallback(() => {
    cancelAnimationFrame(raf.current);
    const start = performance.now();
    const duration = 900;

    const tick = (now: number) => {
      const p = Math.min(1, (now - start) / duration);
      const resolved = Math.floor(p * text.length);
      setOut(
        text
          .split('')
          .map((ch, i) =>
            ch === ' ' || i < resolved ? ch : GLYPHS[Math.floor(Math.random() * GLYPHS.length)]
          )
          .join('')
      );
      if (p < 1) raf.current = requestAnimationFrame(tick);
    };
    raf.current = requestAnimationFrame(tick);
  }, [text]);

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const el = ref.current;
    if (!el) return;

    let interval: ReturnType<typeof setInterval> | undefined;
    const io = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        run();
        interval = setInterval(run, 6000);
      } else {
        clearInterval(interval);
      }
    });
    io.observe(el);

    return () => {
      io.disconnect();
      clearInterval(interval);
      cancelAnimationFrame(raf.current);
    };
  }, [run]);

  return (
    <div ref={ref} className={styles.center} onMouseEnter={run} aria-label={text}>
      <span aria-hidden="true" className={styles.shimmer}>{out}</span>
    </div>
  );
}
