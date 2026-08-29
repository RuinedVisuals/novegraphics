'use client';

import { useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';
import gsap from 'gsap';
import styles from './PageTransition.module.scss';

export default function PageTransition({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const panelRef = useRef<HTMLDivElement>(null);
  const isFirst = useRef(true);

  useEffect(() => {
    const panel = panelRef.current;
    if (!panel) return;

    // Skip animation on first mount
    if (isFirst.current) {
      isFirst.current = false;
      return;
    }

    gsap.set(panel, { scaleX: 0, transformOrigin: 'left center' });

    const tl = gsap.timeline();
    tl.to(panel, { scaleX: 1, duration: 0.4, ease: 'power3.inOut' })
      // Instant origin switch while panel is fully open — no visible jump
      .set(panel, { transformOrigin: 'right center' })
      .to(panel, { scaleX: 0, duration: 0.4, ease: 'power3.inOut', delay: 0.05 });

    return () => { tl.kill(); };
  }, [pathname]);

  return (
    <>
      <div ref={panelRef} className={styles.panel} aria-hidden="true" />
      {children}
    </>
  );
}
