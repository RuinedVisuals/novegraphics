'use client';

import { useEffect, useState } from 'react';
import styles from './Timecode.module.scss';

const p2 = (n: number) => String(n).padStart(2, '0');

// 00:MM:SS:FF at 25fps, ticking every 200ms (5 frames)
export function formatTimecode(frames: number) {
  return `00:${p2(Math.floor(frames / 1500) % 60)}:${p2(Math.floor(frames / 25) % 60)}:${p2(frames % 25)}`;
}

export function useTimecode() {
  const [frames, setFrames] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setFrames(f => f + 5), 200);
    return () => clearInterval(id);
  }, []);
  return formatTimecode(frames);
}

export default function Timecode({ prefix }: { prefix?: string }) {
  const tc = useTimecode();
  return <span>{prefix ? `${prefix} ` : ''}{tc}</span>;
}

export function RecDot() {
  return <span className={styles.rec} aria-hidden="true" />;
}
