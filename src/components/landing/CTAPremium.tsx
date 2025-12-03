'use client'

import Link from 'next/link'
import { ArrowRight } from 'lucide-react'

export function CTAPremium() {
  return (
    <section className="relative py-32 bg-[#030407] overflow-hidden">
      {/* Ambient glow */}
      <div 
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[400px] opacity-50 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse at center, rgba(99, 102, 241, 0.1) 0%, transparent 60%)',
        }}
      />

      <div className="relative z-10 mx-auto max-w-3xl px-6 text-center">
        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-semibold tracking-tight text-white mb-6">
          Ready to elevate your
          <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#6366F1] to-[#22D3EE]">
            investment research?
          </span>
        </h2>
        
        <p className="text-lg text-[#64748B] font-light mb-10 max-w-xl mx-auto">
          Join thousands of investors who've upgraded to institutional-grade intelligence.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            href="/sign-up"
            className="
              group inline-flex items-center gap-2.5
              px-8 py-4 rounded-xl
              bg-[#6366F1] text-white
              text-[15px] font-medium
              transition-all duration-300
              hover:bg-[#5457E5]
              hover:shadow-[0_0_32px_rgba(99,102,241,0.3)]
              hover:scale-[1.02]
            "
          >
            Get Started Free
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
          </Link>
        </div>

        <p className="text-sm text-[#475569] mt-8">
          No credit card required • 14-day free trial
        </p>
      </div>
    </section>
  )
}
