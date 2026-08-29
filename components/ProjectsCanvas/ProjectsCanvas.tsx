'use client';

import { useState, useEffect } from 'react';
import styles from './ProjectsCanvas.module.scss';

const HOLD_MS = 200;
const FADE_MS = 100;

export default function ProjectsCanvas({ imageUrls }: { imageUrls: string[] }) {
  const [active, setActive] = useState(0);

  useEffect(() => {
    if (imageUrls.length <= 1) return;
    const id = setInterval(
      () => setActive(prev => (prev + 1) % imageUrls.length),
      HOLD_MS
    );
    return () => clearInterval(id);
  }, [imageUrls.length]);

  return (
    <section className={styles.canvas}>
      <svg
        className={styles.svg}
        viewBox="0 0 1920 1080"
        preserveAspectRatio="xMidYMid slice"
        aria-hidden="true"
      >
        <defs>
          <mask id="work-mask" maskUnits="userSpaceOnUse">
            <rect width="1920" height="1080" fill="white" />
            <text
              x="960"
              y="800"
              textAnchor="middle"
              fontFamily="'IMPACT', serif"
              fontSize="720"
              textLength="1920"
              lengthAdjust="spacingAndGlyphs"
              fill="black"
              transform="rotate(-1.5, 960, 540)"
            >
              WORK
            </text>
          </mask>

          <mask id="work-ghost-mask" maskUnits="userSpaceOnUse">
            <rect width="1920" height="1080" fill="white" />
            <text
              x="965"
              y="803"
              textAnchor="middle"
              fontFamily="'IMPACT', serif"
              fontSize="720"
              textLength="1920"
              lengthAdjust="spacingAndGlyphs"
              fill="black"
              transform="rotate(-1.5, 960, 540)"
            >
              WORK
            </text>
          </mask>
        </defs>

        {imageUrls.map((src, i) => (
          <image
            key={src}
            href={src}
            x="0"
            y="0"
            width="1920"
            height="1080"
            preserveAspectRatio="xMidYMid slice"
            className={styles.photo}
            style={{
              opacity: i === active ? 1 : 0,
              transition: `opacity ${FADE_MS}ms ease`,
            }}
          />
        ))}

        <rect x="0" y="0" width="1920" height="1080" fill="#e6e0d2" opacity="0.16" mask="url(#work-ghost-mask)" />
        <rect x="0" y="0" width="1920" height="1080" fill="#080808" mask="url(#work-mask)" />
      </svg>

      <div className={styles.overlayContent}>
        <div className={styles.topLabel}>
          <p>SELECTED WORK</p>
        </div>
        <div className={styles.bottomLeft}>
          <h4>NOVE GRAPHICS</h4>
          <p>Underground visual design from Athens, GR.</p>
        </div>
      </div>

      <div className={styles.grain} aria-hidden="true" />
    </section>
  );
}
