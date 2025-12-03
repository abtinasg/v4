'use client'

import { BarChart3, Bot, LineChart, Bell } from 'lucide-react'

const features = [
  {
    icon: BarChart3,
    title: 'Terminal Pro',
    description: 'Bloomberg-style command terminal with real-time market data, instant symbol lookup, and keyboard shortcuts.',
    gradient: 'from-[#6366F1]/10 to-[#8B5CF6]/5',
    iconBg: 'bg-[#6366F1]/15',
    iconColor: 'text-[#6366F1]',
  },
  {
    icon: LineChart,
    title: '150+ Metrics',
    description: 'Comprehensive fundamental and technical analysis—valuation, growth, profitability, risk, and more.',
    gradient: 'from-[#22D3EE]/10 to-[#06B6D4]/5',
    iconBg: 'bg-[#22D3EE]/15',
    iconColor: 'text-[#22D3EE]',
  },
  {
    icon: Bot,
    title: 'AI Assistant',
    description: 'Ask questions in natural language. Get instant, intelligent answers backed by real-time data.',
    gradient: 'from-[#34D399]/10 to-[#10B981]/5',
    iconBg: 'bg-[#34D399]/15',
    iconColor: 'text-[#34D399]',
  },
  {
    icon: Bell,
    title: 'Smart Alerts',
    description: 'Set price alerts, earnings reminders, and AI-powered notifications for portfolio changes.',
    gradient: 'from-[#F59E0B]/10 to-[#D97706]/5',
    iconBg: 'bg-[#F59E0B]/15',
    iconColor: 'text-[#F59E0B]',
  },
]

export function FeaturesPremium() {
  return (
    <section id="features" className="relative py-32 bg-[#030407] overflow-hidden">
      {/* Subtle ambient glow */}
      <div 
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1000px] h-[600px] opacity-30 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse at center, rgba(99, 102, 241, 0.06) 0%, transparent 60%)',
        }}
      />

      <div className="relative z-10 mx-auto max-w-5xl px-6">
        {/* Section Header */}
        <div className="text-center mb-20 space-y-4">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/[0.06] bg-white/[0.02] px-4 py-1.5">
            <span className="text-xs text-[#94A3B8] font-medium tracking-wide">
              Core Features
            </span>
          </div>
          
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-semibold tracking-tight text-white">
            Everything you need.
            <br />
            <span className="text-[#64748B]">Nothing you don't.</span>
          </h2>
          
          <p className="text-lg text-[#64748B] font-light max-w-xl mx-auto">
            Professional-grade tools designed for clarity, speed, and insight.
          </p>
        </div>

        {/* Feature Cards - 2x2 Grid */}
        <div className="grid md:grid-cols-2 gap-6">
          {features.map((feature, index) => (
            <div
              key={feature.title}
              className={`
                group relative rounded-2xl p-8
                bg-gradient-to-br ${feature.gradient}
                border border-white/[0.04]
                backdrop-blur-xl
                transition-all duration-300
                hover:border-white/[0.08]
                hover:shadow-[0_8px_32px_rgba(0,0,0,0.2)]
              `}
            >
              {/* Icon */}
              <div className={`
                h-12 w-12 rounded-xl ${feature.iconBg}
                flex items-center justify-center
                mb-6
              `}>
                <feature.icon className={`h-6 w-6 ${feature.iconColor}`} />
              </div>

              {/* Content */}
              <h3 className="text-xl font-semibold text-white mb-3">
                {feature.title}
              </h3>
              
              <p className="text-[15px] text-[#94A3B8] leading-relaxed">
                {feature.description}
              </p>

              {/* Subtle hover effect */}
              <div className="
                absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100
                transition-opacity duration-300
                bg-gradient-to-br from-white/[0.02] to-transparent
                pointer-events-none
              " />
            </div>
          ))}
        </div>

        {/* Bottom Visual Accent */}
        <div className="mt-20 text-center">
          <p className="text-sm text-[#475569]">
            Trusted by retail investors and professionals alike
          </p>
        </div>
      </div>
    </section>
  )
}
