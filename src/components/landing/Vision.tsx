'use client'

import { Target, Globe, Sparkles } from 'lucide-react'

const visionCards = [
  {
    icon: Target,
    title: 'Precision Execution',
    description: 'Every analysis backed by 150+ institutional-grade metrics. Make decisions with confidence.',
    color: '#5B7CFF',
    gradient: 'from-[#5B7CFF]/20 to-[#5B7CFF]/5'
  },
  {
    icon: Globe,
    title: 'Global Coverage',
    description: 'Real-time data across equities, indices, and macro indicators from markets worldwide.',
    color: '#00C9E4',
    gradient: 'from-[#00C9E4]/20 to-[#00C9E4]/5'
  },
  {
    icon: Sparkles,
    title: 'AI-First Design',
    description: 'Multi-model AI orchestration for deeper, more accurate market insights than ever before.',
    color: '#8B5CF6',
    gradient: 'from-[#8B5CF6]/20 to-[#8B5CF6]/5'
  }
]

export function Vision() {
  return (
    <section className="relative py-28 md:py-36 bg-[#030508] overflow-hidden">
      {/* Premium ambient background */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1200px] h-[600px] bg-[radial-gradient(ellipse_50%_50%_at_50%_50%,rgba(139,92,246,0.06),transparent)]" />
      </div>

      <div className="relative mx-auto max-w-7xl px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-20">
          <div className="inline-flex items-center gap-2 rounded-full border border-[#8B5CF6]/20 bg-[#8B5CF6]/[0.06] px-5 py-2 text-sm font-medium text-[#8B5CF6] mb-8">
            <span className="h-1.5 w-1.5 rounded-full bg-[#8B5CF6] animate-pulse" />
            Our Vision
          </div>

          <h2 className="text-4xl md:text-5xl lg:text-6xl font-semibold tracking-tight text-white mb-6">
            Institutional Grade.{' '}
            <span className="bg-gradient-to-r from-[#5B7CFF] via-[#00C9E4] to-[#8B5CF6] bg-clip-text text-transparent">
              Retail Accessible.
            </span>
          </h2>

          <p className="text-lg md:text-xl text-gray-400 max-w-2xl mx-auto leading-relaxed font-light">
            We believe every investor deserves access to the tools that move markets.
            Deep Terminal brings institutional-caliber analytics to those ready to trade with conviction.
          </p>
        </div>

        {/* Vision Cards */}
        <div className="grid md:grid-cols-3 gap-8">
          {visionCards.map((card) => (
            <div
              key={card.title}
              className="group relative rounded-2xl border border-white/[0.06] bg-gradient-to-b from-white/[0.03] to-transparent p-8 md:p-10 backdrop-blur-sm transition-all duration-500 hover:border-white/[0.12]"
            >
              {/* Hover gradient */}
              <div
                className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${card.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none`}
              />

              {/* Top glow line */}
              <div
                className="absolute top-0 left-8 right-8 h-px opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                style={{ background: `linear-gradient(to right, transparent, ${card.color}50, transparent)` }}
              />

              <div className="relative">
                <div
                  className="h-14 w-14 rounded-2xl flex items-center justify-center mb-6 transition-transform duration-300 group-hover:scale-110"
                  style={{
                    background: `linear-gradient(135deg, ${card.color}25, ${card.color}10)`,
                    boxShadow: `0 0 30px ${card.color}15`
                  }}
                >
                  <card.icon className="h-7 w-7" style={{ color: card.color }} />
                </div>

                <h3 className="text-xl font-semibold text-white mb-3">{card.title}</h3>
                <p className="text-base text-gray-400 leading-relaxed">{card.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
