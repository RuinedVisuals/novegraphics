'use client';

import { useState, useEffect } from 'react';
import styles from './HeroMask.module.scss';

const IMAGES = [
    '/hero/poster-1.jpg',
    '/hero/poster-2.jpg',
    '/hero/poster-3.jpg',
    '/hero/poster-4.jpg',
    '/hero/poster-5.jpg',
];

const HOLD_MS = 200;
const FADE_MS = 100;

export default function HeroMask() {
    const [active, setActive] = useState(0);
    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        const id = setInterval(
            () => setActive(prev => (prev + 1) % IMAGES.length),
            HOLD_MS
        );

        return () => clearInterval(id);
    }, []);

    useEffect(() => {
        const checkMobile = () => setIsMobile(window.innerWidth < 768);
        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    return (
        <section className={styles.hero}>
            <svg
                className={styles.svg}
                viewBox="0 0 1920 1080"
                preserveAspectRatio={isMobile ? 'xMidYMid meet' : 'xMidYMid slice'}
                role="img"
                aria-label="NOVE"
            >
                <defs>
                    <mask id="nove-mask" maskUnits="userSpaceOnUse">
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
                            NOVE
                        </text>
                    </mask>

                    <mask id="ghost-mask" maskUnits="userSpaceOnUse">
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
                            NOVE
                        </text>
                    </mask>
                </defs>

                {IMAGES.map((src, i) => (
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

                <rect
                    x="0"
                    y="0"
                    width="1920"
                    height="1080"
                    fill="#e6e0d2"
                    opacity="0.16"
                    mask="url(#ghost-mask)"
                />

                <rect
                    x="0"
                    y="0"
                    width="1920"
                    height="1080"
                    fill="#000"
                    mask="url(#nove-mask)"
                />
            </svg>

            <div className={styles.overlayContent}>
                <div className={styles.topLabel}>
                    <p>DIGGING CULTURE</p>
                </div>

                <div className={styles.bottomLeft}>
                    <h4>ATHENS / GREECE</h4>
                    <p>
                        Motion, typography and fragmented urban imagery merged into an
                        interactive visual composition.
                    </p>
                </div>

                <div className={styles.bottomRight}>
                    <p className={styles.largeText}>
                        A monochromatic exploration of identity, memory and distortion
                        through oversized typography, cinematic texture and moving image.
                    </p>

                    <div className={styles.meta}>
                        <span>GRAPHIC DESIGN</span>
                        <span>TYPOGRAPHY</span>
                    </div>
                </div>
            </div>

            <div className={styles.grain} aria-hidden="true" />
        </section>
    );
}