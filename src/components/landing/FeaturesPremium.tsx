'use client'

import { Terminal, TrendingUp, Sparkles, Bell } from 'lucide-react'

const features = [
  {
    icon: Terminal,
    title: 'Terminal Pro',
    description: 'Bloomberg-style command terminal with instant symbol lookup and keyboard shortcuts.',
    gradient: 'from-[#6366F1]/12 to-[#8B5CF6]/6',
    iconBg: 'bg-[#6366F1]/20',
    iconColor: 'text-[#818CF8]',
    glowColor: 'rgba(99, 102, 241, 0.15)',
  },
  {
    icon: TrendingUp,
    title: '150+ Metrics',
    description: 'Comprehensive fundamental and technical analysis—valuation, growth, profitability.',
    gradient: 'from-[#22D3EE]/12 to-[#06B6D4]/6',
    iconBg: 'bg-[#22D3EE]/20',
    iconColor: 'text-[#22D3EE]',
    glowColor: 'rgba(34, 211, 238, 0.12)',
  },
  {
    icon: Sparkles,
    title: 'AI Assistant',
    description: 'Natural language queries. Instant answers backed by real-time data.',
    gradient: 'from-[#34D399]/12 to-[#10B981]/6',
    iconBg: 'bg-[#34D399]/20',
    iconColor: 'text-[#34D399]',
    glowColor: 'rgba(52, 211, 153, 0.12)',
  },
  {
    icon: Bell,
    title: 'Smart Alerts',
    description: 'Price alerts, earnings reminders, and AI-powered portfolio notifications.',
    gradient: 'from-[#F59E0B]/12 to-[#D97706]/6',
    iconBg: 'bg-[#F59E0B]/20',
    iconColor: 'text-[#FBBF24]',
    glowColor: 'rgba(245, 158, 11, 0.12)',
  },
]

export function FeaturesPremium() {
  return (
    <section id="features" className="relative py-20 bg-[#030407] overflow-hidden">
      {/* Subtle ambient glow */}
      <div 
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[500px] opacity-40 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse at center, rgba(99, 102, 241, 0.08) 0%, transparent 60%)',
        }}
      />

      <div className="relative z-10 mx-auto max-w-5xl px-6">
        {/* Section Header - Compact */}
        <div className="text-center mb-12 space-y-3">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/[0.08] bg-white/[0.03] backdrop-blur-sm px-3 py-1">
            <span className="text-[11px] text-[#94A3B8] font-medium tracking-wide uppercase">
              Core Features
            </span>
          </div>
          
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-white">
            Everything you need.
            <span className="text-[#64748B]"> Nothing you don't.</span>
          </h2>
        </div>

        {/* Feature Cards - 2x2 Grid, Tighter */}
        <div className="grid md:grid-cols-2 gap-4">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="
                group relative rounded-xl p-6
                bg-[#0A0D12]/80
                border border-white/[0.06]
                backdrop-blur-[4px]
                transition-all duration-200
                hover:border-white/[0.10]
                hover:bg-[#0C1017]/90
              "
              style={{
                boxShadow: `0 8px 32px rgba(0,0,0,0.3), inset 0 0 0 1px rgba(255,255,255,0.02)`,
              }}
            >
              {/* Subtle glow on hover */}
              <div 
                className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
                style={{
                  background: `radial-gradient(ellipse 80% 60% at 30% 20%, ${feature.glowColor}, transparent 60%)`,
                }}
              />

              <div className="relative flex items-start gap-4">
                {/* Icon */}
                <div className={`
                  h-10 w-10 rounded-lg ${feature.iconBg}
                  flex items-center justify-center
                  flex-shrink-0
                `}>
                  <feature.icon className={`h-5 w-5 ${feature.iconColor}`} />
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <h3 className="text-lg font-bold text-white mb-1">
                    {feature.title}
                  </h3>
                  
                  <p className="text-sm text-[#94A3B8] leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
