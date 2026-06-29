import type { Metadata } from 'next'
import { Sora, Inter } from 'next/font/google'
import './globals.css'
import { AuthProvider } from '@/context/AuthContext'

// Display / headings — Sora: confident, modern, premium.
// Mapped to the existing --font-syne variable so all headings update site-wide.
const display = Sora({
  subsets: ['latin'],
  weight: ['600', '700', '800'],
  variable: '--font-syne',
  display: 'swap',
})

// Body / UI — Inter: the gold standard for product typography.
// Mapped to --font-jakarta so all body text updates site-wide.
const sans = Inter({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
  variable: '--font-jakarta',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'MealWarden — Your Meal Has a Guardian Now',
  description: 'MealWarden is one of the world\'s first diet plan readers. Upload any diet plan — photo, PDF or handwriting — and your AI guardian reads it, schedules your week, and keeps you on track.',
  icons: {
    icon: [{ url: '/logo-mark.png', type: 'image/png' }],
    shortcut: '/logo-mark.png',
    apple: '/logo-mark.png',
  },
  viewport: {
    width: 'device-width',
    initialScale: 1,
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html
      lang="en"
      className={`${display.variable} ${sans.variable}`}
      suppressHydrationWarning
    >
      <body>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  )
}