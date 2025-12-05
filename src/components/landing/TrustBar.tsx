'use client'

import { Users, BrainCircuit, Shield, Zap, Star, CheckCircle2 } from 'lucide-react'

const trustMetrics = [
  { label: '4.9/5', detail: 'App Store Rating', icon: Star, color: '#F59E0B' },
  { label: 'SOC 2', detail: 'Security Certified', icon: Shield, color: '#22C55E' },
  { label: '99.9%', detail: 'Platform Uptime', icon: Zap, color: '#00C9E4' },
  { label: '10K+', detail: 'Active Users', icon: Users, color: '#8B5CF6' },
]

const dataPartners = [
  'Alpha Vantage',
  'Polygon.io',
  'Finnhub',
  'Yahoo Finance',
]

export function TrustBar() {
  return (
    <section className="relative py-16 md:py-20 bg-[#030508] overflow-hidden">
      {/* Subtle gradient dividers */}
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/[0.06] to-transparent" />
      <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-white/[0.06] to-transparent" />

      {/* Ambient glow */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[#5B7CFF]/[0.02] to-transparent pointer-events-none" />

      <div className="relative mx-auto max-w-7xl px-6 lg:px-8">
        {/* Premium Trust Card */}
        <div className="rounded-3xl border border-white/[0.06] bg-gradient-to-b from-white/[0.03] to-white/[0.01] backdrop-blur-xl p-8 md:p-10 shadow-[0_20px_60px_rgba(0,0,0,0.35)]">
          {/* Top Row: Metrics */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 pb-8 border-b border-white/[0.04]">
            {trustMetrics.map((metric) => (
              <div key={metric.detail} className="text-center md:text-left">
                <div className="inline-flex items-center justify-center md:justify-start gap-2 mb-2">
                  <metric.icon className="h-4 w-4" style={{ color: metric.color }} />
                  <span className="text-2xl font-semibold text-white">{metric.label}</span>
                </div>
                <div className="text-sm text-gray-500">{metric.detail}</div>
              </div>
            ))}
          </div>

          {/* Bottom Row: Data Partners */}
          <div className="pt-8 flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-3 text-sm text-gray-400">
              <CheckCircle2 className="h-4 w-4 text-[#22C55E]" />
              <span>Real-time data from trusted sources</span>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-6 md:gap-10">
              {dataPartners.map((partner) => (
                <div key={partner} className="text-sm font-medium text-gray-500 hover:text-gray-400 transition-colors">
                  {partner}
                </div>
              ))}
            </div>

            <div className="flex items-center gap-3 text-sm text-gray-400">
              <BrainCircuit className="h-4 w-4 text-[#8B5CF6]" />
              <span>AI-powered analysis</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
