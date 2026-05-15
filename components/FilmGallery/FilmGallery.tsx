"use client";

import { useEffect, useState, Suspense } from "react";
import { Canvas } from "@react-three/fiber";
import { films } from "./data";
import { Scene } from "./Scene";
import styles from "./FilmGallery.module.scss";

const getFilmIndex = (index: number) => {
    return ((index % films.length) + films.length) % films.length;
};

export default function FilmGallery() {
    const [activeIndex, setActiveIndex] = useState(2);
    const [isMobile, setIsMobile] = useState(false);

    const activeFilm = films[getFilmIndex(activeIndex)];

    const handleNext = () => {
        setActiveIndex((prev) => prev + 1);
    };

    const handlePrev = () => {
        setActiveIndex((prev) => prev - 1);
    };

    useEffect(() => {
        const checkMobile = () => {
            setIsMobile(window.innerWidth < 768);
        };

        checkMobile();

        window.addEventListener("resize", checkMobile);

        return () => {
            window.removeEventListener("resize", checkMobile);
        };
    }, []);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === "ArrowRight") handleNext();
            if (e.key === "ArrowLeft") handlePrev();
        };

        window.addEventListener("keydown", handleKeyDown);

        return () => {
            window.removeEventListener("keydown", handleKeyDown);
        };
    }, []);

    return (
        <section className={styles.galleryContainer} id="film-gallery">
            <div className={styles.canvasWrapper}>
                <Canvas
                    shadows
                    dpr={[1, 2]}
                    camera={{
                        position: [0, 0, 6.2],
                        fov: 34,
                    }}
                >
                    <Suspense fallback={null}>
                        <Scene
                            activeIndex={activeIndex}
                            setActiveIndex={setActiveIndex}
                            isMobile={isMobile}
                        />
                    </Suspense>
                </Canvas>
            </div>

            <div className={styles.vhsOverlay} />
            <div className={styles.scanlines} />

            <div className={styles.uiOverlay}>
                <header className={styles.header}>
                    <div className={styles.left}>
                        <button className={styles.backBtn}>BACK / 背面</button>
                    </div>

                    <div className={styles.center}>
                        <div className={styles.kurosawaLogo}>
                            <span className={styles.kanji}>黒明澤</span>

                            <div className={styles.names}>
                                <span>NOVE</span>
                                <span>GRAPHICS</span>
                            </div>
                        </div>

                        {/*<nav className={styles.topNav}>*/}
                        {/*    <span className={styles.activeFilter}>ALL / すべて</span>*/}
                        {/*    <span>1940s</span>*/}
                        {/*    <span>1950s</span>*/}
                        {/*    <span>1960s</span>*/}
                        {/*    <span>1970s</span>*/}
                        {/*    <span>1980s</span>*/}
                        {/*    <span>1990 - 93</span>*/}
                        {/*</nav>*/}
                    </div>

                    <div className={styles.right}>
                        <div className={styles.career}>CAREER 1943年~1993年</div>
                    </div>
                </header>

                <main className={styles.content}>
                    <div className={styles.metadataBottom}>
                        <button
                            className={styles.navArrow}
                            onClick={handlePrev}
                            aria-label="Previous film"
                            type="button"
                        >
                            ←
                        </button>

                        <div className={styles.filmDetails}>
                            <h2>{activeFilm.title}</h2>
                            <div className={styles.japaneseTitle}>{activeFilm.subTitle}</div>
                            <div className={styles.year}>{activeFilm.year}</div>
                        </div>

                        <button
                            className={styles.navArrow}
                            onClick={handleNext}
                            aria-label="Next film"
                            type="button"
                        >
                            →
                        </button>
                    </div>
                </main>

                <footer className={styles.footer}>
                    <div className={styles.copyright}>© ALL RIGHTS RESERVED.</div>
                    <div className={styles.social}>FB / TW</div>
                </footer>
            </div>
        </section>
    );
}