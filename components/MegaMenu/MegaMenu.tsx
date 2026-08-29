'use client';

import { useEffect, useRef } from 'react';
import Link from 'next/link';
import gsap from 'gsap';
import styles from './MegaMenu.module.scss';

const NAV_LINKS = [
  { label: 'WORK', href: '/projects' },
  { label: 'ABOUT', href: '/about' },
  { label: 'CONTACT', href: '/contact' },
];

interface MegaMenuProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function MegaMenu({ isOpen, onClose }: MegaMenuProps) {
  const overlayRef = useRef<HTMLDivElement>(null);
  const itemsRef = useRef<HTMLLIElement[]>([]);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef<number | null>(null);
  const tlRef = useRef<gsap.core.Timeline | null>(null);

  useEffect(() => {
    const overlay = overlayRef.current;
    const items = itemsRef.current;
    if (!overlay) return;

    if (tlRef.current) tlRef.current.kill();

    if (isOpen) {
      // Make visible immediately so GSAP can animate
      gsap.set(overlay, { display: 'flex', scaleY: 0 });
      gsap.set(items, { opacity: 0, y: 60 });

      const tl = gsap.timeline();
      tl.to(overlay, { scaleY: 1, duration: 0.6, ease: 'power4.inOut' })
        .to(items, { opacity: 1, y: 0, stagger: 0.08, duration: 0.5, ease: 'power3.out' }, '-=0.3');
      tlRef.current = tl;

      drawGraffiti();
    } else {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);

      const tl = gsap.timeline({
        onComplete: () => gsap.set(overlay, { display: 'none' }),
      });
      tl.to(items, { opacity: 0, y: -20, stagger: 0.04, duration: 0.3, ease: 'power2.in' })
        .to(overlay, { scaleY: 0, duration: 0.5, ease: 'power4.inOut', transformOrigin: 'top' }, '-=0.1');
      tlRef.current = tl;

      clearCanvas();
    }
  }, [isOpen]);

  function clearCanvas() {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (ctx) ctx.clearRect(0, 0, canvas.width, canvas.height);
  }

  function drawGraffiti() {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Capture as non-nullable locals for the rAF closure
    const c: HTMLCanvasElement = canvas;
    const x: CanvasRenderingContext2D = ctx;

    c.width = window.innerWidth;
    c.height = window.innerHeight;
    x.clearRect(0, 0, c.width, c.height);

    const startTime = performance.now();
    const duration = 800;
    const layers = 40;

    function frame(now: number) {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const layersToDraw = Math.floor(progress * layers);

      x.clearRect(0, 0, c.width, c.height);

      const fontSize = c.width * 0.18;
      x.font = `bold ${fontSize}px 'Bebas Neue', Impact, sans-serif`;
      x.textAlign = 'center';
      x.textBaseline = 'middle';

      const rgb = document.documentElement.dataset.theme === 'red'
        ? '10,10,10'
        : '212,43,30';
      const shadow = document.documentElement.dataset.theme === 'red'
        ? '#0a0a0a'
        : '#d42b1e';

      for (let i = 0; i < layersToDraw; i++) {
        const alpha = 0.01 + Math.random() * 0.03;
        x.fillStyle = `rgba(${rgb}, ${alpha})`;
        x.shadowColor = shadow;
        x.shadowBlur = 20;
        const dx = (Math.random() - 0.5) * 6;
        const dy = (Math.random() - 0.5) * 6;
        x.fillText('DIGGING CULTURE', c.width / 2 + dx, c.height / 2 + dy);
      }

      if (progress < 1) {
        rafRef.current = requestAnimationFrame(frame);
      }
    }

    rafRef.current = requestAnimationFrame(frame);
  }

  // Close on Escape
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape' && isOpen) onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isOpen, onClose]);

  return (
    <div
      ref={overlayRef}
      className={styles.overlay}
      style={{ display: 'none' }}
    >
      <canvas ref={canvasRef} className={styles.graffitiCanvas} />

      <span className={styles.identifier}>NOVE_GRAPHICS.EXE</span>

      <nav>
        <ul className={styles.navList}>
          {NAV_LINKS.map((link, i) => (
            <li
              key={link.href}
              className={styles.navItem}
              ref={(el) => { if (el) itemsRef.current[i] = el; }}
            >
              <Link href={link.href} onClick={onClose}>
                {link.label}
                <span className={styles.arrow}>→</span>
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      <p className={styles.bottomInfo}>ATHENS, GR // GRAPHIC DESIGN // EST. 2016</p>
    </div>
  );
}
