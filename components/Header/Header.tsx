'use client';

import { useEffect, useState } from 'react';
import NoveLogo from '@/components/Logo/NoveLogo';
import MegaMenu from '@/components/MegaMenu/MegaMenu';
import ThemeToggle from '@/components/ThemeToggle/ThemeToggle';
import styles from './Header.module.scss';

export default function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <>
      <header className={`${styles.header} ${scrolled ? styles.scrolled : ''}`}>
        <NoveLogo />
        <div className={styles.headerRight}>
          <ThemeToggle />
          <button
            className={`${styles.menuBtn} ${menuOpen ? styles.active : ''}`}
            onClick={() => setMenuOpen((v) => !v)}
            aria-label={menuOpen ? 'Close menu' : 'Open menu'}
          >
            {menuOpen ? '[ CLOSE ]' : '[ MENU ]'}
          </button>
        </div>
      </header>
      <MegaMenu isOpen={menuOpen} onClose={() => setMenuOpen(false)} />
    </>
  );
}
