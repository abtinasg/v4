'use client'

import Link from 'next/link'
import { ArrowRight, Terminal, ShieldCheck, Sparkles, Zap, Gift } from 'lucide-react'

const ctaHighlights = [
  { icon: Gift, label: '70 free credits on signup' },
  { icon: ShieldCheck, label: 'SOC 2 compliant' },
  { icon: Sparkles, label: 'AI-powered analysis' },
  { icon: Zap, label: 'Real-time data' },
]

export function FinalCTA() {
  return (
    <section className="relative py-28 md:py-36 bg-[#030508] overflow-hidden">
      {/* Premium ambient background */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-px bg-gradient-to-r from-transparent via-white/[0.06] to-transparent" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[900px] h-[500px] bg-[radial-gradient(ellipse_60%_50%_at_50%_50%,rgba(91,124,255,0.1),transparent)]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[400px] bg-[radial-gradient(ellipse_50%_40%_at_50%_50%,rgba(139,92,246,0.08),transparent)]" />

        {/* Subtle grid */}
        <div
          className="absolute inset-0 opacity-[0.015]"
          style={{
            backgroundImage: `linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)`,
            backgroundSize: '60px 60px'
          }}
        />
      </div>

      <div className="relative mx-auto max-w-4xl px-6 lg:px-8">
        <div className="relative overflow-hidden rounded-3xl border border-white/[0.08] bg-gradient-to-b from-white/[0.04] to-white/[0.01] px-8 py-16 md:px-16 md:py-20 text-center backdrop-blur-xl shadow-[0_30px_100px_rgba(0,0,0,0.5)]">
          {/* Glass effects */}
          <div className="pointer-events-none absolute inset-0">
            <div className="absolute inset-0 bg-gradient-to-br from-white/[0.05] via-transparent to-transparent" />
            <div className="absolute inset-x-16 top-0 h-px bg-gradient-to-r from-transparent via-white/[0.2] to-transparent" />
            <div className="absolute inset-x-24 bottom-0 h-px bg-gradient-to-r from-transparent via-white/[0.08] to-transparent" />
          </div>

          {/* Icon */}
          <div className="inline-flex items-center justify-center h-16 w-16 rounded-2xl bg-gradient-to-br from-[#5B7CFF]/25 to-[#8B5CF6]/20 mb-8">
            <Terminal className="h-8 w-8 text-[#5B7CFF]" />
          </div>

          {/* Headline */}
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-semibold tracking-tight text-white mb-6">
            Ready to{' '}
            <span className="bg-gradient-to-r from-[#5B7CFF] via-[#00C9E4] to-[#8B5CF6] bg-clip-text text-transparent">
              Start?
            </span>
          </h2>

          {/* Subhead */}
          <p className="text-lg md:text-xl text-gray-400 max-w-2xl mx-auto mb-10 leading-relaxed font-light">
            Join thousands of investors who've upgraded to institutional-grade intelligence.
            Start free with 70 credits — no credit card required.
          </p>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12">
            <Link
              href="/sign-up"
              className="group relative inline-flex items-center gap-3 overflow-hidden rounded-xl bg-gradient-to-r from-[#5B7CFF] to-[#00C9E4] px-8 py-4 text-base font-semibold text-white transition-all duration-300 hover:shadow-[0_0_40px_rgba(91,124,255,0.4)] hover:scale-[1.02]"
            >
              <span className="relative z-10">Start Free — Get 70 Credits</span>
              <ArrowRight className="relative z-10 h-5 w-5 transition-transform group-hover:translate-x-0.5" />
              <div className="absolute inset-0 bg-gradient-to-r from-[#00C9E4] to-[#5B7CFF] opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
            </Link>
            <Link
              href="#pricing"
              className="inline-flex items-center gap-2.5 rounded-xl border border-white/[0.08] bg-white/[0.02] px-8 py-4 text-base font-semibold text-white backdrop-blur-sm transition-all duration-300 hover:border-white/[0.15] hover:bg-white/[0.05]"
            >
              View Pricing
            </Link>
          </div>

          {/* Highlights */}
          <div className="flex flex-wrap items-center justify-center gap-4">
            {ctaHighlights.map((highlight) => (
              <div
                key={highlight.label}
                className="inline-flex items-center gap-2 rounded-full border border-white/[0.06] bg-white/[0.02] px-4 py-2 text-sm text-gray-400"
              >
                <highlight.icon className="h-4 w-4 text-[#5B7CFF]" />
                {highlight.label}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
