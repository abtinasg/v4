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
    span: 'lg:col-span-2'
  },
  {
    icon: List,
    title: 'Smart Watchlist',
    description: 'Track your favorite stocks with real-time prices, customizable alerts, and personal notes.',
    bullets: ['Price alerts', 'Custom notes', 'Quick actions'],
    color: '#00C9E4',
    span: ''
  },
  {
    icon: BrainCircuit,
    title: 'AI Assistant',
    description: 'Ask questions in plain English. Get intelligent, data-backed answers powered by 3 specialized AI models.',
    bullets: ['Natural language', '3 AI models', 'Instant insights'],
    color: '#8B5CF6',
    span: ''
  },
  {
    icon: BarChart3,
    title: '150+ Metrics',
    description: 'Institutional-grade metrics covering valuation, profitability, growth, technical indicators, and more.',
    bullets: ['Valuation ratios', 'Technical signals', 'Quality scores'],
    color: '#22C55E',
    span: ''
  },
  {
    icon: Briefcase,
    title: 'Portfolio Management',
    description: 'Track your investments with P&L calculations, target prices, and stop-loss levels.',
    bullets: ['P&L tracking', 'Price targets', 'Position sizing'],
    color: '#F59E0B',
    span: ''
  },
  {
    icon: Bell,
    title: 'Smart Alerts',
    description: 'Never miss an opportunity. Get notified via email and push when your conditions are met.',
    bullets: ['Email alerts', 'Push notifications', 'Custom conditions'],
    color: '#EF4444',
    span: 'lg:col-span-2'
  },
]

export function Features() {
  return (
    <section id="features" className="relative py-32 md:py-48 bg-[#030508] overflow-hidden">
      {/* 1. Ambient Background - Calm & Premium */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-white/[0.08] to-transparent" />
        {/* Soft, large blurs for atmosphere */}
        <div className="absolute top-[10%] left-[20%] w-[800px] h-[800px] rounded-full bg-[#5B7CFF]/[0.02] blur-[180px]" />
        <div className="absolute bottom-[10%] right-[20%] w-[800px] h-[800px] rounded-full bg-[#8B5CF6]/[0.02] blur-[180px]" />
      </div>

      <div className="relative mx-auto max-w-7xl px-6 lg:px-8">
        
        {/* 2. Information Hierarchy - Header */}
        <div className="max-w-3xl mx-auto text-center mb-24">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/[0.03] border border-white/[0.08] backdrop-blur-md mb-8">
            <span className="w-1.5 h-1.5 rounded-full bg-[#5B7CFF]" />
            <span className="text-xs font-medium tracking-widest text-gray-400 uppercase">Platform Capabilities</span>
          </div>

          {/* Headline */}
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-medium tracking-tight text-white mb-8 leading-[1.1]">
            Everything You Need for <br className="hidden md:block" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#5B7CFF] via-[#00C9E4] to-[#8B5CF6]">
              Professional Analysis
            </span>
          </h2>

          {/* Subheadline */}
          <p className="text-xl text-gray-400 font-light leading-relaxed">
            From real-time market data to AI-powered insights, Deep Terminal gives you the tools that institutional investors use — at a fraction of the cost.
          </p>
        </div>

        {/* 3. Premium Card Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
          {features.map((feature, i) => (
            <div
              key={feature.title}
              className={`group relative p-8 lg:p-10 rounded-3xl border border-white/[0.08] bg-[#0A0F18]/60 backdrop-blur-xl transition-all duration-500 hover:-translate-y-1 hover:shadow-[0_20px_40px_-15px_rgba(0,0,0,0.5)] hover:border-white/[0.15] ${feature.span}`}
            >
              {/* Soft Gradient Glow on Hover */}
              <div 
                className="absolute inset-0 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none"
                style={{ background: `radial-gradient(800px circle at top right, ${feature.color}08, transparent 40%)` }}
              />

              <div className="relative flex flex-col h-full">
                {/* Icon */}
                <div 
                  className="h-14 w-14 rounded-2xl flex items-center justify-center mb-8 border border-white/[0.08] bg-white/[0.02] group-hover:scale-110 transition-transform duration-500"
                >
                  <feature.icon className="h-6 w-6" style={{ color: feature.color }} />
                </div>

                {/* Content */}
                <div className="mb-auto">
                  <h3 className="text-2xl font-medium text-white mb-3 tracking-tight">{feature.title}</h3>
                  <p className="text-base text-gray-400 font-light leading-relaxed mb-8">
                    {feature.description}
                  </p>
                </div>

                {/* Bullets - Minimal & Clean */}
                <div className="space-y-3 pt-6 border-t border-white/[0.04]">
                  {feature.bullets.map((bullet) => (
                    <div key={bullet} className="flex items-center gap-3 text-sm text-gray-400 font-light group-hover:text-gray-300 transition-colors">
                      <div className="w-1 h-1 rounded-full bg-gray-600 group-hover:bg-white transition-colors" />
                      {bullet}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* 5. CTA */}
        <div className="text-center mt-24">
          <Link
            href="/sign-up"
            className="inline-flex items-center gap-2 px-8 py-4 rounded-full bg-white text-black font-medium transition-all hover:bg-gray-200 hover:scale-[1.02] shadow-[0_0_20px_-5px_rgba(255,255,255,0.3)]"
          >
            <span>Explore All Features</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </section>
  )
}
