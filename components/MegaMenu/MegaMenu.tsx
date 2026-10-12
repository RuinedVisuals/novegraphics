'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import gsap from 'gsap';
import VhsCanvas from './VhsCanvas';
import styles from './MegaMenu.module.scss';

type MenuLink = {
  label: string;
  href: string;
  note: string;
  /** opens the sub-menu instead of navigating */
  children?: boolean;
};

const NAV_LINKS: MenuLink[] = [
  { label: 'WORK', href: '/projects', note: 'SELECTED FILES', children: true },
  { label: 'ABOUT', href: '/about', note: 'WHO WE ARE' },
  { label: 'CONTACT', href: '/contact', note: 'SAY HELLO' },
];

// Slugs match the `category` values of the Sanity `project` schema
const WORK_LINKS: MenuLink[] = [
  { label: 'ALL', href: '/projects', note: 'THE WHOLE ARCHIVE' },
  { label: 'POSTERS', href: '/projects?category=poster', note: 'EVENT POSTERS' },
  { label: 'MERCH', href: '/projects?category=merch', note: 'WEAR IT' },
  { label: 'BRANDING', href: '/projects?category=branding', note: 'IDENTITIES' },
  { label: 'ALBUM ART', href: '/projects?category=album-art', note: 'COVERS' },
];

type View = 'main' | 'work';

interface MegaMenuProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function MegaMenu({ isOpen, onClose }: MegaMenuProps) {
  const overlayRef = useRef<HTMLDivElement>(null);
  const mainRef = useRef<HTMLUListElement>(null);
  const workRef = useRef<HTMLDivElement>(null);
  const boostRef = useRef(0);
  const tlRef = useRef<gsap.core.Timeline | null>(null);
  const viewRef = useRef<View>('main');
  const [view, setView] = useState<View>('main');

  // The WebGL context is only created the first time the menu opens
  const [mounted, setMounted] = useState(false);
  if (isOpen && !mounted) setMounted(true);

  const items = (root: HTMLElement | null) =>
    root ? Array.from(root.querySelectorAll<HTMLElement>('[data-item]')) : [];

  useEffect(() => {
    const overlay = overlayRef.current;
    const main = mainRef.current;
    const work = workRef.current;
    if (!overlay || !main || !work) return;

    if (tlRef.current) tlRef.current.kill();

    if (isOpen) {
      gsap.set(overlay, { display: 'flex', scaleY: 0 });
      gsap.set(main, { autoAlpha: 1, x: 0 });
      gsap.set(work, { autoAlpha: 0, x: 0 });
      gsap.set(items(main), { opacity: 0, y: 60 });

      const tl = gsap.timeline();
      tl.to(overlay, { scaleY: 1, duration: 0.6, ease: 'power4.inOut' })
        .to(items(main), { opacity: 1, y: 0, stagger: 0.08, duration: 0.5, ease: 'power3.out' }, '-=0.3');
      tlRef.current = tl;
    } else {
      const visible = viewRef.current === 'work' ? work : main;
      const tl = gsap.timeline({
        onComplete: () => {
          gsap.set(overlay, { display: 'none' });
          // next open always starts on the main list
          viewRef.current = 'main';
          setView('main');
        },
      });
      tl.to(items(visible), { opacity: 0, y: -20, stagger: 0.04, duration: 0.3, ease: 'power2.in' })
        .to(overlay, { scaleY: 0, duration: 0.5, ease: 'power4.inOut', transformOrigin: 'top' }, '-=0.1');
      tlRef.current = tl;
    }
  }, [isOpen]);

  // Slide between the main list and the WORK sub-menu
  const goTo = (next: View) => {
    const main = mainRef.current;
    const work = workRef.current;
    if (!main || !work || viewRef.current === next) return;
    viewRef.current = next;
    setView(next);

    const out = next === 'work' ? main : work;
    const inn = next === 'work' ? work : main;
    const dir = next === 'work' ? 1 : -1; // forward slides left, back slides right

    tlRef.current?.kill();
    gsap.set(inn, { autoAlpha: 1, x: 90 * dir });
    gsap.set(items(inn), { opacity: 0, y: 30 });

    const tl = gsap.timeline();
    tl.to(out, { x: -90 * dir, autoAlpha: 0, duration: 0.4, ease: 'power3.in' })
      .to(inn, { x: 0, duration: 0.6, ease: 'power4.out' }, '-=0.1')
      .to(items(inn), { opacity: 1, y: 0, stagger: 0.07, duration: 0.5, ease: 'power3.out' }, '<');
    tlRef.current = tl;
  };

  // Close on Escape
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape' && isOpen) onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isOpen, onClose]);

  const renderLink = (link: MenuLink, i: number) => (
    <li key={link.href} className={styles.navItem} data-item>
      <Link
        href={link.href}
        onClick={(e) => {
          if (link.children) {
            e.preventDefault();
            goTo('work');
          } else {
            onClose();
          }
        }}
        onPointerEnter={() => { boostRef.current = 1; }}
      >
        <span className={styles.index}>{String(i + 1).padStart(2, '0')}</span>
        <span className={styles.label}>
          <span className={styles.word}>{link.label}</span>
          <span className={styles.note} aria-hidden="true">{link.note}</span>
          <span className={styles.strike} aria-hidden="true" />
        </span>
        {link.children && <span className={styles.plus} aria-hidden="true">+</span>}
      </Link>
    </li>
  );

  return (
    <div
      ref={overlayRef}
      className={styles.overlay}
      style={{ display: 'none' }}
    >
      {mounted && <VhsCanvas active={isOpen} boostRef={boostRef} />}

      <span className={styles.identifier}>NOVE_GRAPHICS.EXE</span>

      <nav className={styles.nav} onPointerLeave={() => { boostRef.current = 0; }}>
        <ul
          ref={mainRef}
          className={styles.navList}
          aria-hidden={view !== 'main'}
        >
          {NAV_LINKS.map(renderLink)}
        </ul>

        <div
          ref={workRef}
          className={styles.subMenu}
          style={{ visibility: 'hidden', opacity: 0 }}
          aria-hidden={view !== 'work'}
        >
          <button
            type="button"
            className={styles.back}
            onClick={() => goTo('main')}
            tabIndex={view === 'work' ? 0 : -1}
          >
            <span aria-hidden="true">←</span> BACK / WORK
          </button>
          <ul className={styles.navList}>{WORK_LINKS.map(renderLink)}</ul>
        </div>
      </nav>

      <p className={styles.bottomInfo}>ATHENS, GR // GRAPHIC DESIGN // EST. 2016</p>
    </div>
  );
}
