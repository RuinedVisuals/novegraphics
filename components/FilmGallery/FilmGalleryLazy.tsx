'use client';

import dynamic from 'next/dynamic';
import type { Film } from './data';

// three.js / r3f / drei stay out of the main bundle: hydration (and so the
// preloader / page transition) isn't blocked by parsing them.
const FilmGallery = dynamic(() => import('./FilmGallery'), { ssr: false });

export default function FilmGalleryLazy({ films }: { films: Film[] }) {
  return <FilmGallery films={films} />;
}
