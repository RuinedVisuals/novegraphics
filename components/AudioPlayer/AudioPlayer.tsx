'use client';

import { useEffect, useRef, useState } from 'react';
import { Howl, Howler } from 'howler';
import { TRACKS } from './tracks';
import styles from './AudioPlayer.module.scss';

const CANVAS_W = 300;
const CANVAS_H = 56;
const BARS = 40;
const PAD = 20;

export default function AudioPlayer() {
  const [idx, setIdx] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0);

  const howlRef = useRef<Howl | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const ctxRef = useRef<CanvasRenderingContext2D | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const vizRaf = useRef(0);
  const seekRaf = useRef(0);
  const idxRef = useRef(0);

  // Retina-aware canvas setup
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dpr = window.devicePixelRatio || 1;
    canvas.width = CANVAS_W * dpr;
    canvas.height = CANVAS_H * dpr;
    canvas.style.width = `${CANVAS_W}px`;
    canvas.style.height = `${CANVAS_H}px`;
    const ctx = canvas.getContext('2d')!;
    ctx.scale(dpr, dpr);
    ctxRef.current = ctx;
    drawBars(ctx, null);
  }, []);

  function drawBars(ctx: CanvasRenderingContext2D, data: Uint8Array | null) {
    ctx.clearRect(0, 0, CANVAS_W, CANVAS_H);

    const drawable = CANVAS_W - PAD * 2;
    const step = drawable / BARS;
    const barW = Math.max(2, step * 0.58);

    const rgb = document.documentElement.dataset.theme === 'red'
      ? '10,10,10'
      : '212,43,30';

    const grad = ctx.createLinearGradient(0, CANVAS_H, 0, 0);
    grad.addColorStop(0, `rgba(${rgb},0.95)`);
    grad.addColorStop(0.5, `rgba(${rgb},0.38)`);
    grad.addColorStop(1, `rgba(${rgb},0.04)`);
    ctx.fillStyle = grad;

    for (let i = 0; i < BARS; i++) {
      const v = data ? data[i] / 255 : 0;
      const h = v > 0 ? Math.max(2, v * CANVAS_H * 0.88) : 2;
      const x = PAD + i * step + (step - barW) / 2;
      ctx.fillRect(x, CANVAS_H - h, barW, h);
    }
  }

  function setupAnalyser() {
    if (analyserRef.current || !Howler.ctx) return;
    const a = Howler.ctx.createAnalyser();
    a.fftSize = 256;
    a.smoothingTimeConstant = 0.82;
    Howler.masterGain.connect(a);
    analyserRef.current = a;
  }

  function startViz() {
    const maybeAnalyser = analyserRef.current;
    const maybeCtx = ctxRef.current;
    if (!maybeAnalyser || !maybeCtx) return;

    // Re-assign with non-null types so TypeScript preserves them in the closure
    const analyser: AnalyserNode = maybeAnalyser;
    const ctx: CanvasRenderingContext2D = maybeCtx;

    const full = new Uint8Array(analyser.frequencyBinCount);
    const slice = new Uint8Array(BARS);

    function frame() {
      analyser.getByteFrequencyData(full);
      for (let i = 0; i < BARS; i++) slice[i] = full[i];
      drawBars(ctx, slice);
      vizRaf.current = requestAnimationFrame(frame);
    }
    frame();
  }

  function stopAll() {
    cancelAnimationFrame(vizRaf.current);
    cancelAnimationFrame(seekRaf.current);
  }

  function loadTrack(trackIdx: number, autoplay = false) {
    howlRef.current?.unload();
    stopAll();
    setProgress(0);

    const howl = new Howl({
      src: [TRACKS[trackIdx].src],
      html5: false,
      onplay() {
        setPlaying(true);
        setupAnalyser();
        startViz();
        const tick = () => {
          const s = howl.seek() as number;
          setProgress(s / (howl.duration() || 1));
          seekRaf.current = requestAnimationFrame(tick);
        };
        tick();
      },
      onpause() {
        setPlaying(false);
        stopAll();
        const ctx = ctxRef.current;
        if (ctx) drawBars(ctx, null);
      },
      onstop() {
        setPlaying(false);
        stopAll();
        const ctx = ctxRef.current;
        if (ctx) drawBars(ctx, null);
      },
      onend() {
        const next = (idxRef.current + 1) % TRACKS.length;
        idxRef.current = next;
        setIdx(next);
        loadTrack(next, true);
      },
    });

    howlRef.current = howl;
    if (autoplay) howl.play();
  }

  useEffect(() => {
    loadTrack(0);

    const autoPlay = () => {
      const howl = howlRef.current;
      if (!howl || howl.playing()) return;
      if (Howler.ctx?.state === 'suspended') Howler.ctx.resume();
      howl.play();
    };
    document.addEventListener('click', autoPlay, { once: true });

    return () => {
      document.removeEventListener('click', autoPlay);
      stopAll();
      howlRef.current?.unload();
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handlePlayPause = () => {
    const howl = howlRef.current;
    if (!howl) return;
    if (playing) {
      howl.pause();
    } else {
      if (Howler.ctx?.state === 'suspended') Howler.ctx.resume();
      howl.play();
    }
  };

  const handlePrev = () => {
    const p = (idx - 1 + TRACKS.length) % TRACKS.length;
    idxRef.current = p;
    setIdx(p);
    loadTrack(p, playing);
  };

  const handleNext = () => {
    const n = (idx + 1) % TRACKS.length;
    idxRef.current = n;
    setIdx(n);
    loadTrack(n, playing);
  };

  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    const howl = howlRef.current;
    if (!howl) return;
    const { left, width } = e.currentTarget.getBoundingClientRect();
    const r = Math.max(0, Math.min(1, (e.clientX - left) / width));
    howl.seek(r * howl.duration());
    setProgress(r);
  };

  const track = TRACKS[idx];

  return (
    <div className={styles.player}>
      <div className={styles.topLine} />

      <canvas ref={canvasRef} className={styles.waveform} />

      <div className={styles.body}>
        <div className={styles.info}>
          <div className={styles.infoRow}>
            <span className={styles.artist}>{track.artist}</span>
            <span className={styles.counter}>
              {String(idx + 1).padStart(2, '0')} / {String(TRACKS.length).padStart(2, '0')}
            </span>
          </div>
          <span className={styles.title}>{track.title}</span>
        </div>

        <div
          className={styles.progress}
          onClick={handleSeek}
          role="slider"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={Math.round(progress * 100)}
        >
          <div className={styles.fill} style={{ width: `${progress * 100}%` }} />
          <div className={styles.thumb} style={{ left: `${progress * 100}%` }} />
        </div>

        <div className={styles.controls}>
          <button className={styles.btn} onClick={handlePrev} aria-label="Previous track">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
              <path d="M6 6h2v12H6V6zm3.5 6 8.5 6V6l-8.5 6z" />
            </svg>
          </button>

          <button
            className={`${styles.btn} ${styles.playBtn}`}
            onClick={handlePlayPause}
            aria-label={playing ? 'Pause' : 'Play'}
          >
            {playing ? (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
              </svg>
            ) : (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                <path d="M8 5v14l11-7L8 5z" />
              </svg>
            )}
          </button>

          <button className={styles.btn} onClick={handleNext} aria-label="Next track">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
              <path d="M6 18l8.5-6L6 6v12zm10-12v12h2V6h-2z" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
