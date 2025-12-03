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
    <main className="relative min-h-screen bg-[#01030A] text-white antialiased overflow-hidden">
      {/* Global ambient background */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-b from-[#020511] via-[#01030A] to-[#01020B]" />
        <div className="absolute inset-0 opacity-[0.025]" style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.08) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.04) 1px, transparent 1px)",
          backgroundSize: '80px 80px'
        }} />
        <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-[900px] h-[900px] rounded-full bg-[#5B7CFF]/[0.08] blur-[220px]" />
        <div className="absolute bottom-[-40%] right-[-10%] w-[700px] h-[700px] rounded-full bg-[#25E2FF]/[0.05] blur-[220px]" />
      </div>

      <div className="relative z-10">
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
      </div>
    </main>
  )
}
