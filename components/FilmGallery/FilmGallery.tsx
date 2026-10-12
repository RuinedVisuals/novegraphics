"use client";

import { useEffect, useState, Suspense } from "react";
import Link from "next/link";
import { Canvas } from "@react-three/fiber";
import type { Film } from "./data";
import { Scene } from "./Scene";
import styles from "./FilmGallery.module.scss";

// Rendered inside <Suspense>, so it only mounts once every texture has resolved.
function GalleryReady() {
  useEffect(() => {
    let raf2 = 0;
    const raf1 = requestAnimationFrame(() => {
      raf2 = requestAnimationFrame(() => {
        (window as any).__galleryReady = true;
        window.dispatchEvent(new Event('gallery-ready'));
      });
    });
    return () => {
      cancelAnimationFrame(raf1);
      cancelAnimationFrame(raf2);
    };
  }, []);
  return null;
}

const getFilmIndex = (index: number, length: number) =>
  ((index % length) + length) % length;

export default function FilmGallery({ films }: { films: Film[] }) {
  const [activeIndex, setActiveIndex] = useState(2);
  const [isMobile, setIsMobile] = useState(false);
  // Mount the WebGL canvas (texture uploads, context creation) only after the
  // page transition / preloader has covered the screen, so it doesn't jank them.
  const [canvasReady, setCanvasReady] = useState(false);

  useEffect(() => {
    // First load: mount right away; the preloader waits for 'gallery-ready'
    // so the WebGL setup freezes the static preloader, not its animation.
    // Client navigation: short delay so the page transition isn't janked.
    const delay = (window as any).__preloaderDone ? 500 : 0;
    const id = setTimeout(() => setCanvasReady(true), delay);
    return () => clearTimeout(id);
  }, []);

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
        {canvasReady && <Canvas dpr={[1, 1.5]} camera={{ position: [0, 0, 6.2], fov: 34 }} style={{ touchAction: "none" }}>
          <Suspense fallback={null}>
            <Scene
              films={films}
              activeIndex={activeIndex}
              setActiveIndex={setActiveIndex}
              isMobile={isMobile}
            />
            <GalleryReady />
          </Suspense>
        </Canvas>}
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
                  <h2>
                    {activeFilm.slug
                      ? <Link href={`/projects/${activeFilm.slug}`} className={styles.titleLink}>{activeFilm.title}</Link>
                      : activeFilm.title}
                  </h2>
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
