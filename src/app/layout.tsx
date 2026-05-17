import type { Metadata } from 'next'
import './globals.css'
import Providers from './Providers'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import AdManager from '../components/AdManager'
import AdPopup from '../components/AdPopup'
import GoogleAnalytics from '../components/GoogleAnalytics'

export const metadata: Metadata = {
  title: 'TOMITO — مشاهدة وتحميل أفلام ومسلسلات وأنمي',
  description: 'موقع توميتو هو أفضل موقع لمشاهدة وتحميل الأفلام والمسلسلات والأنمي أون لاين بجودة عالية HD مترجم حصرياً بدون إعلانات مزعجة.',
  icons: {
    icon: '/favicon.ico',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ar" dir="rtl" className="dark">
      <body>
        <Providers>
          <GoogleAnalytics />
          <Navbar />
          <main className="min-h-screen pt-[60px] pb-16 lg:pb-0">
            {children}
          </main>
          <Footer />
        </Providers>
      </body>
    </html>
  )
}
