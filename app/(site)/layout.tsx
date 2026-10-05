import Header from '@/components/Header/Header'
import Footer from '@/components/Footer/Footer'
import PageTransition from '@/components/PageTransition/PageTransition'
import LenisProvider from '@/components/LenisProvider/LenisProvider'
import Preloader from '@/components/Preloader/Preloader'
import AudioPlayer from '@/components/AudioPlayer/AudioPlayer'

export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ paddingTop: 'var(--nav-height)' }}>
      <Preloader />
      <Header />
      <div id="page-content">
        <LenisProvider>
          <PageTransition>
            {children}
          </PageTransition>
          <Footer />
        </LenisProvider>
      </div>
      <AudioPlayer />
    </div>
  )
}
