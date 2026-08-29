import HeroMask from '@/components/HeroMask/HeroMask';
import FilmGallery from '@/components/FilmGallery/FilmGallery';
import { getFilms } from '@/sanity/getFilms';

export default async function HomePage() {
  const films = await getFilms();

  return (
    <main>
      <HeroMask />
      <FilmGallery films={films} />
    </main>
  );
}
