import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Deepin - Professional Stock Analysis | Get 50 Free Credits',
  description: 'Access 432 institutional-grade metrics and AI-powered analysis. Join 10,000+ smart investors. Start your free trial today.',
  openGraph: {
    title: 'Deepin - Professional Stock Analysis | 50 Free Credits',
    description: 'Get the same fundamental analysis tools used by professional analysts at top investment firms. Powered by AI.',
    type: 'website',
    url: 'https://deepin.com/promo',
    siteName: 'Deepin',
    images: [
      {
        url: '/og-promo.png',
        width: 1200,
        height: 630,
        alt: 'Deepin - Professional Stock Analysis',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Deepin - Professional Stock Analysis | 50 Free Credits',
    description: 'Access 432 institutional-grade metrics and AI-powered analysis. Join 10,000+ smart investors.',
    images: ['/og-promo.png'],
  },
  robots: {
    index: true,
    follow: true,
  },
}

export default function PromoLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
