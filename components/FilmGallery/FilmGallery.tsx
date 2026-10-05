"use client";

import { useEffect, useState, Suspense } from "react";
import Link from "next/link";
import { Canvas } from "@react-three/fiber";
import type { Film } from "./data";
import { Scene } from "./Scene";
import styles from "./FilmGallery.module.scss";

const getFilmIndex = (index: number, length: number) =>
  ((index % length) + length) % length;

export default function FilmGallery({ films }: { films: Film[] }) {
  const [activeIndex, setActiveIndex] = useState(2);
  const [isMobile, setIsMobile] = useState(false);

  const activeFilm = films.length > 0 ? films[getFilmIndex(activeIndex, films.length)] : null;
  const p2 = (n: number) => String(n).padStart(2, "0");

  const handleNext = () => setActiveIndex((prev) => prev + 1);
  const handlePrev = () => setActiveIndex((prev) => prev - 1);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") handleNext();
      if (e.key === "ArrowLeft") handlePrev();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  if (films.length === 0) return null;

  return (
    <section className={styles.galleryContainer} id="film-gallery">
      <div className={styles.canvasWrapper}>
        <Canvas shadows dpr={[1, 2]} camera={{ position: [0, 0, 6.2], fov: 34 }} style={{ touchAction: "none" }}>
          <Suspense fallback={null}>
            <Scene
              films={films}
              activeIndex={activeIndex}
              setActiveIndex={setActiveIndex}
              isMobile={isMobile}
            />
          </Suspense>
        </Canvas>
      </div>

      <div className={styles.scanlines} />

      <div className={styles.uiOverlay}>
        <header className={styles.header}>
          <span className={styles.sideLabel}>SELECTED FILES</span>

          <div className={styles.kurosawaLogo}>
            <span className={styles.kanji}>黒明澤</span>
            <div className={styles.names}>
              <span>NOVE</span>
              <span>GRAPHICS</span>
            </div>
          </div>

          <span className={`${styles.sideLabel} ${styles.right}`}>SYSTEM: NTSC // SP</span>
        </header>

        <div className={styles.content}>
          <div className={styles.metadataBottom}>
            <button className={`${styles.navArrow} ${styles.prev}`} onClick={handlePrev} aria-label="Previous" type="button">←</button>

            <div className={styles.filmDetails}>
              {activeFilm && (
                <>
                  <h2>{activeFilm.title}</h2>
                  <div className={styles.category}>{activeFilm.subTitle}</div>
                  <div className={styles.fileRow}>
                    <span>{activeFilm.year}</span>
                    <span className={styles.dash}>—</span>
                    {activeFilm.slug && <Link href={`/projects/${activeFilm.slug}`}>[ VIEW FILE → ]</Link>}
                  </div>
                  <div className={styles.counter}>
                    {p2(getFilmIndex(activeIndex, films.length) + 1)} <span className={styles.slash}>/</span>{" "}
                    <span className={styles.total}>{p2(films.length)}</span>
                  </div>
                </>
              )}
            </div>

            <button className={`${styles.navArrow} ${styles.next}`} onClick={handleNext} aria-label="Next" type="button">→</button>
          </div>
        </div>

        <footer className={styles.footer}>
          <span>© ALL RIGHTS RESERVED.</span>
          <span className={styles.social}>
            <a href="https://instagram.com/nove_graphics" target="_blank" rel="noopener noreferrer">IG</a>
            {" / "}
            <span>BE</span>
          </span>
        </footer>
      </div>
    </section>
  );
}
