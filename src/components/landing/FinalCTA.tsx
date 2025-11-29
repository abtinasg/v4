'use client'

import Link from 'next/link'
import { ArrowRight, Terminal } from 'lucide-react'

export function FinalCTA() {
  return (
    <section className="relative py-24 md:py-32 bg-[#05070B] overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Central gradient */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[900px] h-[500px] bg-[radial-gradient(ellipse_60%_50%_at_50%_50%,rgba(0,212,255,0.1),transparent)]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[400px] bg-[radial-gradient(ellipse_50%_40%_at_50%_50%,rgba(139,92,246,0.08),transparent)]" />
        
        {/* Grid overlay */}
        <div 
          className="absolute inset-0 opacity-[0.015]"
          style={{
            backgroundImage: `linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)`,
            backgroundSize: '60px 60px'
          }}
        />
      </div>

      <div className="relative mx-auto max-w-4xl px-6 text-center">
        {/* Icon */}
        <div
          className="inline-flex items-center justify-center h-16 w-16 rounded-2xl bg-gradient-to-br from-[#00D4FF]/20 to-[#8B5CF6]/20 mb-8"
        >
          <Terminal className="h-8 w-8 text-[#00D4FF]" />
        </div>

        {/* Headline */}
        <h2
          className="text-display text-4xl md:text-5xl lg:text-6xl text-white mb-6"
        >
          Trade with{' '}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00D4FF] via-[#3B82F6] to-[#8B5CF6]">
            Conviction.
          </span>
        </h2>

        {/* Subhead */}
        <p
          className="text-subhead text-lg md:text-xl text-gray-400 max-w-2xl mx-auto mb-10"
        >
          Join thousands of traders who've upgraded to institutional-grade intelligence. 
          Your edge is waiting.
        </p>

        {/* CTAs */}
        <div
          className="flex flex-col sm:flex-row items-center justify-center gap-4"
        >
          <Link
            href="/sign-up"
            className="group inline-flex items-center gap-2.5 rounded-xl bg-gradient-to-r from-[#00D4FF] to-[#3B82F6] px-8 py-4 text-base font-semibold text-[#05070B] transition-all duration-300 hover:shadow-[0_0_40px_rgba(0,212,255,0.4)] hover:scale-[1.02]"
          >
            Get Started Free
            <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-0.5" />
          </Link>
          <Link
            href="/pricing"
            className="inline-flex items-center gap-2.5 rounded-xl border border-white/[0.08] bg-white/[0.02] px-8 py-4 text-base font-semibold text-white backdrop-blur-sm transition-all duration-300 hover:border-white/[0.15] hover:bg-white/[0.05]"
          >
            View Pricing
          </Link>
        </div>

        {/* Trust line */}
        <p
          className="text-sm text-gray-600 mt-8"
        >
          No credit card required • 14-day free trial • Cancel anytime
        </p>
      </div>
    </section>
  )
}
