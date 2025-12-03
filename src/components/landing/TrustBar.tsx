'use client'

import { Users, BrainCircuit, Shield, Zap, Crown, CheckCircle } from 'lucide-react'

const trustItems = [
  { icon: Users, label: 'Trusted by active traders' },
  { icon: BrainCircuit, label: 'Powered by multi-model AI' },
  { icon: Shield, label: 'Bank-grade security' },
  { icon: Zap, label: 'Sub-second data streaming' },
]

const trustMetrics = [
  { label: '4.9/5', detail: 'App Store rating', accent: '#00D4FF' },
  { label: 'SOC 2', detail: 'Security compliant', accent: '#8B5CF6' },
  { label: '99.9%', detail: 'Platform uptime', accent: '#22C55E' },
]

export function TrustBar() {
  return (
    <section className="relative py-12 bg-[#05070B] border-y border-white/[0.02] overflow-hidden">
      {/* Subtle glow */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[#00D4FF]/[0.04] to-transparent pointer-events-none" />
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/[0.08] to-transparent" />
      <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-white/[0.05] to-transparent" />
      
      <div className="relative mx-auto max-w-6xl px-6">
        <div className="rounded-3xl border border-white/[0.05] bg-white/[0.02] backdrop-blur-xl p-6 md:p-8 shadow-[0_20px_80px_rgba(0,0,0,0.35)]">
          {/* Top row: certification */}
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 pb-6 border-b border-white/[0.04]">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/[0.08] bg-white/[0.02] px-3.5 py-1.5 text-xs text-gray-300">
              <Crown className="h-3.5 w-3.5 text-[#FACC15]" />
              DeepTerminal Elite Network
            </div>
            <div className="flex flex-wrap gap-3">
              {trustMetrics.map((metric) => (
                <div key={metric.detail} className="rounded-2xl border border-white/[0.05] bg-white/[0.02] px-4 py-2">
                  <div className="text-sm font-semibold" style={{ color: metric.accent }}>{metric.label}</div>
                  <div className="text-[11px] text-gray-500">{metric.detail}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Bottom row: trust items */}
          <div className="flex flex-wrap items-center justify-center gap-6 md:gap-12 pt-6">
            {trustItems.map((item) => (
              <div
                key={item.label}
                className="group flex items-center gap-3 text-gray-500"
              >
                <div className="h-9 w-9 rounded-2xl border border-white/[0.06] bg-white/[0.02] flex items-center justify-center group-hover:border-[#00D4FF]/30 group-hover:bg-[#00D4FF]/[0.05] transition-colors">
                  <item.icon className="h-4 w-4 text-[#00D4FF]/80" />
                </div>
                <div className="text-sm font-medium whitespace-nowrap">
                  {item.label}
                </div>
              </div>
            ))}
            <div className="flex items-center gap-2 rounded-full border border-white/[0.08] bg-white/[0.02] px-3 py-1.5 text-xs text-gray-400">
              <CheckCircle className="h-3.5 w-3.5 text-[#22C55E]" />
              Audited infrastructure & encrypted data streams
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
