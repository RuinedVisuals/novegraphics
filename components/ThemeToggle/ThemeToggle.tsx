'use client';

import { useEffect, useState } from 'react';
import styles from './ThemeToggle.module.scss';

type Theme = 'dark' | 'red';

export default function ThemeToggle() {
  const [theme, setTheme] = useState<Theme>('dark');

  useEffect(() => {
    const saved = (localStorage.getItem('nove-theme') as Theme) || 'dark';
    setTheme(saved);
  }, []);

  function toggle() {
    const next: Theme = theme === 'dark' ? 'red' : 'dark';
    setTheme(next);
    document.documentElement.setAttribute('data-theme', next);
    localStorage.setItem('nove-theme', next);
  }

  return (
    <button
      className={styles.btn}
      onClick={toggle}
      aria-label={`Switch to ${theme === 'dark' ? 'red' : 'dark'} mode`}
    >
      <span className={styles.dot} />
      {theme === 'dark' ? '[ RED ]' : '[ DARK ]'}
    </button>
  );
}
