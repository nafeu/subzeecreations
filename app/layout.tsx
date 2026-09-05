import { Analytics } from '@vercel/analytics/next'
import { Jost } from 'next/font/google'
import type { Metadata, Viewport } from 'next'
import { CartProvider } from '@/components/shop/cart-context'
import { getSiteContent } from '@/lib/content'
import './globals.css'

const jost = Jost({ subsets: ['latin'], weight: ['300', '400', '700'], variable: '--font-jost' })

export function generateMetadata(): Metadata {
  const site = getSiteContent()

  return {
    title: site.meta.title,
    description: site.meta.description,
    icons: {
      icon: '/logo.svg',
      apple: '/logo.svg',
    },
  }
}

export const viewport: Viewport = {
  colorScheme: 'light dark',
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: 'white' },
    { media: '(prefers-color-scheme: dark)', color: 'black' },
  ],
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className={`${jost.variable} bg-background`}>
      <body className={`${jost.variable} antialiased`}>
        <CartProvider>{children}</CartProvider>
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}
