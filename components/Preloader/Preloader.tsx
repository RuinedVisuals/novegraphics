'use client';

import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import styles from './Preloader.module.scss';

const IMAGES = [
    '/posters/poster-1.jpg',
    '/posters/poster-2.jpg',
    '/posters/poster-3.jpg',
    '/posters/poster-4.jpg',
    '/posters/poster-5.jpg',
];

const FAN = [
    { rotation: -10, x: -72, y: 16, scale: 0.88 },
    { rotation: -5, x: -36, y: 6, scale: 0.93 },
    { rotation: 0, x: 0, y: 0, scale: 1 },
    { rotation: 5, x: 36, y: 6, scale: 0.93 },
    { rotation: 10, x: 72, y: 16, scale: 0.88 },
];

const CENTER_INDEX = 1;

export default function Preloader() {
    const wrapRef = useRef<HTMLDivElement>(null);
    const stackRef = useRef<HTMLDivElement>(null);

    const [activeIdx] = useState(CENTER_INDEX);

    useEffect(() => {
        if (!wrapRef.current || !stackRef.current) return;

        document.body.style.overflow = 'hidden';

        const cards = Array.from(stackRef.current.children) as HTMLElement[];

        gsap.set('#page-content', {
            y: 80,
            opacity: 0,
        });

        // Όλες stacked πίσω από τη 2η κάρτα
        cards.forEach((card, i) => {
            gsap.set(card, {
                rotation: 0,
                x: 0,
                y: 0,
                scale: i === CENTER_INDEX ? 1 : 0.96,
                opacity: 1,
                zIndex:
                    i === CENTER_INDEX
                        ? 50
                        : 10 - Math.abs(i - CENTER_INDEX),
                transformOrigin: '50% 88%',
            });
        });

        const tl = gsap.timeline({
            defaults: {
                overwrite: 'auto',
            },

            onComplete() {
                document.body.style.overflow = '';
                // Remove GSAP inline transform from #page-content so position:fixed
                // children (PageTransition panel, etc.) anchor to the viewport again
                gsap.set('#page-content', { clearProps: 'transform,opacity' });

                if (wrapRef.current) {
                    wrapRef.current.style.display = 'none';
                }
            },
        });

        tl

            // μικρή cinematic παύση
            .to({}, { duration:0})

            // smooth fan open
            .to(cards, {
                rotation: (i) => FAN[i].rotation,
                x: (i) => FAN[i].x,
                y: (i) => FAN[i].y,
                scale: (i) => FAN[i].scale,

                duration: 1.35,
                ease: 'expo.inOut',

                stagger: {
                    amount: 0.24,
                    from: 'center',
                },
            })

            // μένει λίγο ανοιχτό
            .to({}, { duration: 1.1 })

            // cinematic close πίσω στη main card
            .to(cards, {
                rotation: 0,
                x: 0,
                y: 0,
                scale: (i) => (i === CENTER_INDEX ? 1 : 0.96),

                duration: 0.95,
                ease: 'expo.inOut',

                stagger: {
                    amount: 0.2,
                    from: 'edges',
                },
            })

            // preloader exits
            .to(
                wrapRef.current,
                {
                    yPercent: -100,
                    duration: 1,
                    ease: 'expo.inOut',
                },
                '-=0.08'
            )

            // content reveal
            .to(
                '#page-content',
                {
                    y: 0,
                    opacity: 1,
                    duration: 1,
                    ease: 'expo.out',
                },
                '-=0.74'
            );

        return () => {
            tl.kill();
            document.body.style.overflow = '';
        };
    }, []);

    return (
        <div
            ref={wrapRef}
            className={styles.preloader}
            aria-hidden="true"
        >
            <div className={styles.noise} />

            <div ref={stackRef} className={styles.stack}>
                {IMAGES.map((src, i) => {
                    const isCenter = i === CENTER_INDEX;

                    return (
                        <div
                            key={i}
                            className={`${styles.card} ${isCenter ? styles.active : ''}`}
                            style={{
                                zIndex: isCenter ? 50 : 10 - Math.abs(i - CENTER_INDEX),
                            }}
                        >
                            <img src={src} alt="" draggable={false} />
                            <div className={styles.cardDim} />
                        </div>
                    );
                })}
            </div>

            <div className={styles.brand}>
                <span className={styles.brandName}>NOVE</span>
                <span className={styles.brandSub}>GRAPHICS</span>
            </div>

            <div className={styles.counter}>
                <span>{String(activeIdx + 1).padStart(2, '0')}</span>
                <span className={styles.slash}> / </span>
                <span>05</span>
            </div>

            <div className={styles.stripe} />
        </div>
    );
}