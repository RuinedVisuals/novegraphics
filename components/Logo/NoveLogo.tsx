'use client';

import Link from 'next/link';
import styles from './NoveLogo.module.scss';

export default function NoveLogo() {
  return (
    <Link href="/" className={styles.logoWrap}>
      <div className={styles.outer}>
        <div className={styles.inner}>
          <span className={styles.gothic}>.NOVE.</span>
          <span className={styles.sub}>GRAPHICS</span>
        </div>
      </div>
    </Link>
  );
}
