'use client';

import { useEffect, useRef, useState } from 'react';
import { Howl, Howler } from 'howler';
import { TRACKS } from './tracks';
import styles from './AudioPlayer.module.scss';

const CANVAS_W = 26;
const CANVAS_H = 22;
const BARS = 5;

export default function AudioPlayer() {
  const [idx, setIdx] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [minimized, setMinimized] = useState(false);

  const howlRef = useRef<Howl | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const ctxRef = useRef<CanvasRenderingContext2D | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const vizRaf = useRef(0);
  const interacted = useRef(false);
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

    const barW = 2.6;
    const step = CANVAS_W / BARS;

    // the player is a dark ball in both themes
    ctx.fillStyle = 'rgba(212,43,30,0.95)';

    for (let i = 0; i < BARS; i++) {
      const v = data ? data[i] / 255 : 0;
      const h = v > 0 ? Math.max(2.6, v * CANVAS_H) : 2.6;
      const x = i * step + (step - barW) / 2;
      ctx.beginPath();
      ctx.roundRect(x, (CANVAS_H - h) / 2, barW, h, barW / 2);
      ctx.fill();
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
      for (let i = 0; i < BARS; i++) slice[i] = full[2 + i * 3];
      drawBars(ctx, slice);
      vizRaf.current = requestAnimationFrame(frame);
    }
    frame();
  }

  function stopAll() {
    cancelAnimationFrame(vizRaf.current);
  }

  function loadTrack(trackIdx: number, autoplay = false) {
    howlRef.current?.unload();
    stopAll();

    const howl = new Howl({
      src: [TRACKS[trackIdx].src],
      html5: false,
      onplay() {
        setPlaying(true);
        setupAnalyser();
        startViz();
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
      if (!howl || howl.playing() || interacted.current) return;
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
    interacted.current = true;
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

  const track = TRACKS[idx];

  const PlayIcon = (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
      <path d="M8 5v14l11-7L8 5z" />
    </svg>
  );
  const PauseIcon = (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
      <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
    </svg>
  );

  return (
    <div className={`${styles.player} ${minimized ? styles.minimized : ''}`}>
      <div className={styles.extra} aria-hidden={minimized}>
        <button
          className={styles.skip}
          onClick={() => setMinimized(true)}
          aria-label="Minimize player"
          tabIndex={minimized ? -1 : 0}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
            <path d="M5 11h14v2H5z" />
          </svg>
        </button>

        <button className={styles.skip} onClick={handlePrev} aria-label="Previous track" tabIndex={minimized ? -1 : 0}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
            <path d="M6 6h2v12H6V6zm3.5 6 8.5 6V6l-8.5 6z" />
          </svg>
        </button>

        <div className={styles.info}>
          <span className={styles.title}>{track.title}</span>
          <span className={styles.artist}>{track.artist}</span>
        </div>

        <button className={styles.skip} onClick={handleNext} aria-label="Next track" tabIndex={minimized ? -1 : 0}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
            <path d="M6 18l8.5-6L6 6v12zm10-12v12h2V6h-2z" />
          </svg>
        </button>
      </div>

      <button
        className={styles.ball}
        onClick={minimized ? () => setMinimized(false) : handlePlayPause}
        aria-label={minimized ? 'Expand player' : playing ? 'Pause music' : 'Play music'}
      >
        <canvas ref={canvasRef} className={styles.waveform} />
        {!minimized && <span className={styles.icon}>{playing ? PauseIcon : PlayIcon}</span>}
      </button>
    </div>
  );
}
