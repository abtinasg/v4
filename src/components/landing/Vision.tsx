'use client'

import { Target, Globe, Sparkles } from 'lucide-react'

const visionCards = [
  {
    icon: Target,
    title: 'Precision Execution',
    description: 'Every trade backed by 150+ institutional-grade metrics.'
  },
  {
    icon: Globe,
    title: 'Global Coverage',
    description: 'Real-time data across equities, indices, and macro indicators.'
  },
  {
    icon: Sparkles,
    title: 'AI-First Design',
    description: 'Multi-model orchestration for deeper market insights.'
  }
]

export function Vision() {
  return (
    <section className="relative py-24 md:py-32 bg-[#05070B] overflow-hidden">
      {/* Ambient glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1000px] h-[600px] bg-[radial-gradient(ellipse_50%_50%_at_50%_50%,rgba(139,92,246,0.06),transparent)] pointer-events-none" />
      
      <div className="relative mx-auto max-w-5xl px-6 text-center">
        {/* Badge */}
        <div
          className="inline-flex items-center gap-2 rounded-full border border-[#8B5CF6]/20 bg-[#8B5CF6]/[0.06] px-4 py-1.5 text-xs font-medium text-[#8B5CF6] mb-8"
        >
          <span className="h-1.5 w-1.5 rounded-full bg-[#8B5CF6]" />
          Our Vision
        </div>

        {/* Headline */}
        <h2
          className="text-display text-4xl md:text-5xl lg:text-6xl text-white mb-6"
        >
          Institutional grade.{' '}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00D4FF] to-[#8B5CF6]">
            Retail accessible.
          </span>
        </h2>

        {/* Subhead */}
        <p
          className="text-subhead text-lg md:text-xl text-gray-400 max-w-2xl mx-auto mb-16"
        >
          We believe every trader deserves the tools that move markets. 
          Deep brings institutional-caliber analytics to those ready to trade with conviction.
        </p>

        {/* Vision Cards */}
        <div className="grid md:grid-cols-3 gap-6">
          {visionCards.map((card, i) => (
            <div
              key={card.title}
              className="group relative rounded-2xl border border-white/[0.05] bg-white/[0.01] p-8 text-left backdrop-blur-sm hover:border-[#8B5CF6]/20 hover:bg-[#8B5CF6]/[0.02] transition-all duration-500"
            >
              {/* Glow on hover */}
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-[#8B5CF6]/0 to-[#00D4FF]/0 group-hover:from-[#8B5CF6]/[0.03] group-hover:to-[#00D4FF]/[0.02] transition-all duration-500 pointer-events-none" />
              
              <div className="relative">
                <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-[#8B5CF6]/20 to-[#00D4FF]/10 flex items-center justify-center mb-5 group-hover:scale-105 transition-transform duration-300">
                  <card.icon className="h-6 w-6 text-[#8B5CF6]" />
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">{card.title}</h3>
                <p className="text-sm text-gray-400 leading-relaxed">{card.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
