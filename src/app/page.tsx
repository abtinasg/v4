import {
  Navigation,
  Hero,
  TrustBar,
  Vision,
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
    <main className="relative min-h-screen bg-[#030508] text-white antialiased overflow-hidden">
      {/* Global ambient background */}
      <div className="pointer-events-none absolute inset-0">
        {/* Base gradient */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#030508] via-[#030508] to-[#030508]" />

        {/* Subtle grid overlay */}
        <div
          className="absolute inset-0 opacity-[0.015]"
          style={{
            backgroundImage: "linear-gradient(rgba(255,255,255,0.08) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.04) 1px, transparent 1px)",
            backgroundSize: '80px 80px'
          }}
        />

        {/* Top ambient glow */}
        <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-[900px] h-[900px] rounded-full bg-[#5B7CFF]/[0.06] blur-[220px]" />

        {/* Bottom accent glow */}
        <div className="absolute bottom-[-40%] right-[-10%] w-[700px] h-[700px] rounded-full bg-[#00C9E4]/[0.04] blur-[220px]" />
      </div>

      <div className="relative z-10">
        {/* Navigation */}
        <Navigation />

        {/* Hero Section - Main value proposition */}
        <Hero />

        {/* Trust Bar - Social proof and metrics */}
        <TrustBar />

        {/* Vision Section - Company values */}
        <Vision />

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
