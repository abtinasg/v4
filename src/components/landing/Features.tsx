'use client'

import { Monitor, List, BrainCircuit, BarChart3, Briefcase, Bell, ArrowRight } from 'lucide-react'
import Link from 'next/link'

const features = [
  {
    icon: Monitor,
    title: 'Terminal Pro',
    description: 'Bloomberg-style command interface. Type any stock symbol and get instant comprehensive analysis with real-time data.',
    bullets: ['Real-time market data', 'Keyboard shortcuts', 'Multi-panel layouts'],
    color: '#5B7CFF',
    gradient: 'from-[#5B7CFF]/20 to-[#5B7CFF]/5',
    span: 'lg:col-span-2'
  },
  {
    icon: List,
    title: 'Smart Watchlist',
    description: 'Track your favorite stocks with real-time prices, customizable alerts, and personal notes.',
    bullets: ['Price alerts', 'Custom notes', 'Quick actions'],
    color: '#00C9E4',
    gradient: 'from-[#00C9E4]/20 to-[#00C9E4]/5',
    span: ''
  },
  {
    icon: BrainCircuit,
    title: 'AI Assistant',
    description: 'Ask questions in plain English. Get intelligent, data-backed answers powered by 3 specialized AI models.',
    bullets: ['Natural language', '3 AI models', 'Instant insights'],
    color: '#8B5CF6',
    gradient: 'from-[#8B5CF6]/20 to-[#8B5CF6]/5',
    span: ''
  },
  {
    icon: BarChart3,
    title: '150+ Metrics',
    description: 'Institutional-grade metrics covering valuation, profitability, growth, technical indicators, and more.',
    bullets: ['Valuation ratios', 'Technical signals', 'Quality scores'],
    color: '#22C55E',
    gradient: 'from-[#22C55E]/20 to-[#22C55E]/5',
    span: ''
  },
  {
    icon: Briefcase,
    title: 'Portfolio Management',
    description: 'Track your investments with P&L calculations, target prices, and stop-loss levels.',
    bullets: ['P&L tracking', 'Price targets', 'Position sizing'],
    color: '#F59E0B',
    gradient: 'from-[#F59E0B]/20 to-[#F59E0B]/5',
    span: ''
  },
  {
    icon: Bell,
    title: 'Smart Alerts',
    description: 'Never miss an opportunity. Get notified via email and push when your conditions are met.',
    bullets: ['Email alerts', 'Push notifications', 'Custom conditions'],
    color: '#EF4444',
    gradient: 'from-[#EF4444]/20 to-[#EF4444]/5',
    span: 'lg:col-span-2'
  },
]

export function Features() {
  return (
    <section id="features" className="relative py-28 md:py-36 bg-[#030508] overflow-hidden">
      {/* Premium ambient background */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-px bg-gradient-to-r from-transparent via-white/[0.06] to-transparent" />
        <div className="absolute top-[20%] left-[-10%] w-[600px] h-[600px] rounded-full bg-[#5B7CFF]/[0.04] blur-[150px]" />
        <div className="absolute bottom-[20%] right-[-10%] w-[500px] h-[500px] rounded-full bg-[#00C9E4]/[0.03] blur-[120px]" />
      </div>

      <div className="relative mx-auto max-w-7xl px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-20">
          <div className="inline-flex items-center gap-2 rounded-full border border-[#5B7CFF]/20 bg-[#5B7CFF]/[0.06] px-5 py-2 text-sm font-medium text-[#5B7CFF] mb-8">
            <span className="h-1.5 w-1.5 rounded-full bg-[#5B7CFF] animate-pulse" />
            Core Features
          </div>

          <h2 className="text-4xl md:text-5xl lg:text-6xl font-semibold tracking-tight text-white mb-6">
            Everything You Need for{' '}
            <span className="bg-gradient-to-r from-[#5B7CFF] via-[#00C9E4] to-[#8B5CF6] bg-clip-text text-transparent">
              Professional Analysis
            </span>
          </h2>

          <p className="text-lg md:text-xl text-gray-400 max-w-3xl mx-auto leading-relaxed font-light">
            From real-time market data to AI-powered insights, Deep Terminal gives you the tools that institutional investors use — at a fraction of the cost.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature) => (
            <div
              key={feature.title}
              className={`group relative rounded-2xl border border-white/[0.06] bg-gradient-to-b from-white/[0.03] to-transparent backdrop-blur-sm overflow-hidden transition-all duration-500 hover:border-white/[0.12] ${feature.span}`}
            >
              {/* Hover gradient */}
              <div
                className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${feature.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none`}
              />

              {/* Top glow line */}
              <div
                className="absolute top-0 left-8 right-8 h-px opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                style={{ background: `linear-gradient(to right, transparent, ${feature.color}50, transparent)` }}
              />

              <div className="relative p-8">
                {/* Icon */}
                <div
                  className="h-14 w-14 rounded-2xl flex items-center justify-center mb-6 transition-transform duration-300 group-hover:scale-110"
                  style={{
                    background: `linear-gradient(135deg, ${feature.color}25, ${feature.color}10)`,
                    boxShadow: `0 0 30px ${feature.color}15`
                  }}
                >
                  <feature.icon className="h-7 w-7" style={{ color: feature.color }} />
                </div>

                {/* Content */}
                <h3 className="text-xl font-semibold text-white mb-3">{feature.title}</h3>
                <p className="text-base text-gray-400 leading-relaxed mb-6">{feature.description}</p>

                {/* Bullets */}
                <div className="space-y-2.5">
                  {feature.bullets.map((bullet) => (
                    <div key={bullet} className="flex items-center gap-3 text-sm text-gray-300">
                      <div
                        className="h-1.5 w-1.5 rounded-full"
                        style={{ backgroundColor: feature.color, boxShadow: `0 0 8px ${feature.color}` }}
                      />
                      {bullet}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="text-center mt-16">
          <Link
            href="/sign-up"
            className="group inline-flex items-center gap-3 rounded-xl border border-white/[0.08] bg-white/[0.02] px-8 py-4 text-base font-semibold text-white backdrop-blur-sm transition-all duration-300 hover:border-[#5B7CFF]/30 hover:bg-[#5B7CFF]/[0.05]"
          >
            Explore All Features
            <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-0.5" />
          </Link>
        </div>
      </div>
    </section>
  )
}
