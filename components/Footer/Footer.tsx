import NoveLogo from '@/components/Logo/NoveLogo';
import ScrambleText from './ScrambleText';
import styles from './Footer.module.scss';

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={styles.grid}>
        <div className={styles.left} style={{ transform: 'scale(0.7)', transformOrigin: 'left center' }}>
          <NoveLogo />
        </div>

        <ScrambleText text="DIGGING CULTURE" />

        <div className={styles.right}>
          <a
            href="https://instagram.com/nove_graphics"
            target="_blank"
            rel="noopener noreferrer"
            className={styles.iconLink}
            aria-label="Instagram"
          >
            [IG]
          </a>
          <a
            href="mailto:info@novegraphics.com"
            className={styles.iconLink}
            aria-label="Email"
          >
            [✉]
          </a>
        </div>
      </div>

      <div className={styles.copy}>
        NOVE GRAPHICS © 2026&nbsp;&nbsp;//&nbsp;&nbsp;BUILT WITH OBSESSION BY{' '}
        <a
          href="https://weareruined.com/"
          target="_blank"
          rel="noopener noreferrer"
          className={styles.credit}
        >
          RUINEDVISUALS
        </a>
      </div>
    </footer>
  );
}
