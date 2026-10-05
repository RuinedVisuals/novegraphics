import HeroMask from '@/components/HeroMask/HeroMask';
import Marquee from '@/components/Marquee/Marquee';
import FilmGallery from '@/components/FilmGallery/FilmGallery';
import { getFilms } from '@/sanity/getFilms';

export default async function HomePage() {
  const films = await getFilms();

  return (
    <main>
      <HeroMask />
      <Marquee font="anton" size={30} duration={30} />
      <FilmGallery films={films} />
    </main>
  );
}
