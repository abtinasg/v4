import {
  Navigation,
  Hero,
  TrustBar,
  Vision,
  LiveData,
  UIPreview,
  Architecture,
  AIOrchestrator,
  MetricsLibrary,
  Pricing,
  Testimonials,
  FinalCTA,
  Footer
} from '@/components/landing'

export default function Home() {
  return (
    <main className="bg-[#05070B] min-h-screen">
      <Navigation />
      <Hero />
      <TrustBar />
      <Vision />
      <LiveData />
      <UIPreview />
      <Architecture />
      <AIOrchestrator />
      <MetricsLibrary />
      <Pricing />
      <Testimonials />
      <FinalCTA />
      <Footer />
    </main>
  )
}
