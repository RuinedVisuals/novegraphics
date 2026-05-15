import type { Metadata } from 'next';
import '@/styles/globals.scss';
import Header from '@/components/Header/Header';
import Footer from '@/components/Footer/Footer';
import PageTransition from '@/components/PageTransition/PageTransition';
import FilmGallery from '@/components/FilmGallery/FilmGallery';
import CustomCursor from '@/components/CustomCursor/CustomCursor';
import LenisProvider from '@/components/LenisProvider/LenisProvider';
import Preloader from '@/components/Preloader/Preloader';
import AudioPlayer from '@/components/AudioPlayer/AudioPlayer';

export const metadata: Metadata = {
  title: 'Nove Graphics',
  description: 'Graphic design for the underground. Athens, GR.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body style={{ paddingTop: 'var(--nav-height)' }} suppressHydrationWarning>
        <Preloader />
        <Header />
        <div id="page-content">
          <LenisProvider>
            <PageTransition>
              {children}
            </PageTransition>
            <FilmGallery />
            <Footer />
          </LenisProvider>
        </div>
        <AudioPlayer />
        <CustomCursor />
      </body>
    </html>
  );
}
