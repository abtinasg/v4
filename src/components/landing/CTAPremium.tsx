'use client'

import Link from 'next/link'
import { ArrowRight } from 'lucide-react'

export function CTAPremium() {
  return (
    <section className="relative py-20 bg-[#030407] overflow-hidden">
      {/* Ambient glow - stronger */}
      <div 
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[500px] opacity-60 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse at center, rgba(99, 102, 241, 0.12) 0%, transparent 60%)',
        }}
      />

      <div className="relative z-10 mx-auto max-w-3xl px-6 text-center">
        <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-white mb-4">
          Ready to elevate your
          <span 
            className="text-transparent bg-clip-text ml-2"
            style={{
              backgroundImage: 'linear-gradient(135deg, #818CF8 0%, #6366F1 50%, #22D3EE 100%)',
            }}
          >
            investment research?
          </span>
        </h2>
        
        <p className="text-base text-[#64748B] mb-8 max-w-lg mx-auto">
          Join thousands of investors using institutional-grade intelligence.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            href="/sign-up"
            className="
              group inline-flex items-center gap-2
              px-7 py-3 rounded-lg
              bg-gradient-to-r from-[#6366F1] to-[#818CF8]
              text-white text-sm font-semibold
              transition-all duration-200
              hover:shadow-[0_0_32px_rgba(99,102,241,0.4)]
              hover:scale-[1.02]
              active:scale-[0.98]
            "
          >
            Get Started Free
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
          </Link>
        </div>

        <p className="text-xs text-[#475569] mt-6">
          No credit card required • 14-day free trial
        </p>
      </div>
    </section>
  )
}
