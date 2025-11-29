'use client'

import { Users, BrainCircuit, Shield, Zap } from 'lucide-react'

const trustItems = [
  { icon: Users, label: 'Trusted by active traders' },
  { icon: BrainCircuit, label: 'Powered by multi-model AI' },
  { icon: Shield, label: 'Bank-grade security' },
  { icon: Zap, label: 'Sub-second data streaming' },
]

export function TrustBar() {
  return (
    <section className="relative py-8 bg-[#05070B] border-y border-white/[0.03]">
      {/* Subtle glow */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[#00D4FF]/[0.02] to-transparent pointer-events-none" />
      
      <div className="relative mx-auto max-w-7xl px-6">
        <div
          className="flex flex-wrap items-center justify-center gap-8 md:gap-16"
        >
          {trustItems.map((item, i) => (
            <div
              key={item.label}
              className="flex items-center gap-2.5 text-gray-500 hover:text-gray-400 transition-colors duration-300"
            >
              <item.icon className="h-4 w-4 text-[#00D4FF]/60" />
              <span className="text-sm font-medium whitespace-nowrap">{item.label}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
