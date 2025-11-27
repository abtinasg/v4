import { Hero } from '@/components/landing/Hero'
import { Features } from '@/components/landing/Features'
import { Pricing } from '@/components/landing/Pricing'
import { Navigation } from '@/components/landing/Navigation'
import { Footer } from '@/components/landing/Footer'

export default function HomePage() {
  return (
    <main className="bg-[#0a0a0a] min-h-screen">
      <Navigation />
      <Hero />
      <Features />
      <Pricing />
      <Footer />
    </main>
  )
}
