import {
  Navigation,
  Hero,
  TrustBar,
  Features,
  AIOrchestrator,
  MetricsLibrary,
  Pricing,
  Testimonials,
  FAQ,
  FinalCTA,
  Footer
} from '@/components/landing'

export default function Home() {
  return (
    <main className="relative min-h-screen bg-[#030508] text-white antialiased overflow-x-hidden">
      {/* Global ambient background */}
      <div className="pointer-events-none fixed inset-0">
        {/* Base gradient */}
        <div className="absolute inset-0 bg-[#030508]" />

        {/* Subtle grid overlay */}
        <div
          className="absolute inset-0 opacity-[0.02]"
          style={{
            backgroundImage: "linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px)",
            backgroundSize: '80px 80px'
          }}
        />
      </div>

      <div className="relative z-10">
        {/* Navigation */}
        <Navigation />

        {/* Hero Section - Main value proposition */}
        <Hero />

        {/* Trust Bar - Social proof and metrics */}
        <TrustBar />

        {/* Features Section - Core product features */}
        <Features />

        {/* AI Orchestrator - Multi-model AI explanation */}
        <AIOrchestrator />

        {/* Metrics Library - 150+ metrics breakdown */}
        <MetricsLibrary />

        {/* Pricing Section - Credit-based plans */}
        <Pricing />

        {/* Testimonials - User reviews and stats */}
        <Testimonials />

        {/* FAQ Section - Common questions */}
        <FAQ />

        {/* Final CTA - Last conversion point */}
        <FinalCTA />

        {/* Footer */}
        <Footer />
      </div>
    </main>
  )
}
