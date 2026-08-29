'use client';

import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import styles from './CustomCursor.module.scss';

const AMOUNT = 20;
const SINE_DOTS = Math.floor(AMOUNT * 0.3); // 6 dots that sine-wave when idle
const DOT_SIZE = 26;
const IDLE_TIMEOUT = 150;
const ANGLESPEED = 0.05;

export default function CustomCursor() {
  const dotsRef = useRef<(HTMLSpanElement | null)[]>([]);

  useEffect(() => {
    const els = dotsRef.current.filter(Boolean) as HTMLSpanElement[];
    if (els.length < AMOUNT) return;

    // Pre-computed per-dot constants
    const scales = Array.from({ length: AMOUNT }, (_, i) => 1 - 0.05 * i);
    const ranges = Array.from({ length: AMOUNT }, (_, i) =>
      DOT_SIZE / 2 - (DOT_SIZE / 2) * scales[i] + 2
    );

    // Apply initial scale via GSAP (persists alongside later x/y sets)
    scales.forEach((s, i) => gsap.set(els[i], { scale: s }));

    // Mutable chain state — plain objects, not React state
    const pos  = Array.from({ length: AMOUNT }, () => ({ x: 0, y: 0 }));
    const lock = Array.from({ length: AMOUNT }, () => ({
      x: 0, y: 0, angleX: 0, angleY: 0,
    }));

    let mouseX = window.innerWidth / 2 - DOT_SIZE / 2;
    let mouseY = window.innerHeight / 2 - DOT_SIZE / 2;
    let idle = false;
    let timeoutId: ReturnType<typeof setTimeout>;
    let rafId: number;

    function goIdle() {
      idle = true;
      // Lock each dot's current position as the sine-wave origin
      for (let i = 0; i < AMOUNT; i++) {
        lock[i].x = pos[i].x;
        lock[i].y = pos[i].y;
        lock[i].angleX = Math.random() * Math.PI * 2;
        lock[i].angleY = Math.random() * Math.PI * 2;
      }
    }

    function resetIdle() {
      clearTimeout(timeoutId);
      idle = false;
      timeoutId = setTimeout(goIdle, IDLE_TIMEOUT);
    }

    function onMouseMove(e: MouseEvent) {
      mouseX = e.clientX - DOT_SIZE / 2;
      mouseY = e.clientY - DOT_SIZE / 2;
      resetIdle();
    }

    function render() {
      let x = mouseX;
      let y = mouseY;

      for (let i = 0; i < AMOUNT; i++) {
        const next = pos[i + 1] ?? pos[0];

        // Always update chain position (needed for idle lock values)
        pos[i].x = x;
        pos[i].y = y;

        if (!idle || i <= SINE_DOTS) {
          // Active: render at chain position and propagate
          gsap.set(els[i], { x: pos[i].x, y: pos[i].y });
          const dx = (next.x - pos[i].x) * 0.35;
          const dy = (next.y - pos[i].y) * 0.35;
          x += dx;
          y += dy;
        } else {
          // Idle: each dot orbits its lock point via sine wave
          lock[i].angleX += ANGLESPEED;
          lock[i].angleY += ANGLESPEED;
          pos[i].x = lock[i].x + Math.sin(lock[i].angleX) * ranges[i];
          pos[i].y = lock[i].y + Math.sin(lock[i].angleY) * ranges[i];
          gsap.set(els[i], { x: pos[i].x, y: pos[i].y });
          // x/y intentionally NOT advanced — idle dots don't chain
        }
      }

      rafId = requestAnimationFrame(render);
    }

    window.addEventListener('mousemove', onMouseMove);
    resetIdle();
    rafId = requestAnimationFrame(render);

    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      clearTimeout(timeoutId);
      cancelAnimationFrame(rafId);
    };
  }, []);

  return (
    <>
      {/* SVG goo filter — needs to live in DOM, size irrelevant */}
      <svg style={{ display: 'none' }} aria-hidden="true">
        <defs>
          <filter id="cursor-goo">
            <feGaussianBlur in="SourceGraphic" stdDeviation="6" result="blur" />
            <feColorMatrix
              in="blur"
              mode="matrix"
              values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 35 -15"
              result="goo"
            />
            <feComposite in="SourceGraphic" in2="goo" operator="atop" />
          </filter>
        </defs>
      </svg>

      <div className={styles.cursor} aria-hidden="true">
        {Array.from({ length: AMOUNT }, (_, i) => (
          <span key={i} ref={el => { dotsRef.current[i] = el; }} />
        ))}
      </div>
    </>
  );
}
