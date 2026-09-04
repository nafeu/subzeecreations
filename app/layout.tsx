import { Analytics } from '@vercel/analytics/next'
import { Jost } from 'next/font/google'
import type { Metadata, Viewport } from 'next'
import { CartProvider } from '@/components/shop/cart-context'
import './globals.css'

const jost = Jost({ subsets: ['latin'], weight: ['300', '400', '700'], variable: '--font-jost' })

export const metadata: Metadata = {
  title: 'subzeecreations — Thoughtful stationery for everyday notes',
  description: 'Small-batch stationery for the notes you keep, the letters you send, and the ideas that deserve a little space.',
  icons: {
    icon: '/logo.svg',
    apple: '/logo.svg',
  },
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
