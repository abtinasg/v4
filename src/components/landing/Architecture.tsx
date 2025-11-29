'use client'

import { Monitor, List, BrainCircuit, LineChart } from 'lucide-react'

const pillars = [
  {
    icon: Monitor,
    title: 'Pro Terminal',
    description: 'Bloomberg-style interface with real-time charts, news feeds, and multi-panel layouts.',
    color: '#00D4FF',
    gradient: 'from-[#00D4FF]/20 to-[#00D4FF]/5'
  },
  {
    icon: List,
    title: 'Realtime Watchlist',
    description: 'Track unlimited symbols with instant price updates and custom alerts.',
    color: '#3B82F6',
    gradient: 'from-[#3B82F6]/20 to-[#3B82F6]/5'
  },
  {
    icon: BrainCircuit,
    title: 'AI Orchestrator',
    description: 'Multi-model intelligence combining GPT-4, Claude, and custom fine-tuned models.',
    color: '#8B5CF6',
    gradient: 'from-[#8B5CF6]/20 to-[#8B5CF6]/5'
  },
  {
    icon: LineChart,
    title: 'Stock Analyst',
    description: '150+ fundamental and technical metrics with institutional-grade analysis.',
    color: '#2DD4BF',
    gradient: 'from-[#2DD4BF]/20 to-[#2DD4BF]/5'
  }
]

export function Architecture() {
  return (
    <section className="relative py-24 md:py-32 bg-[#05070B] overflow-hidden">
      {/* Background elements */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-px bg-gradient-to-r from-transparent via-white/[0.06] to-transparent" />
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-full h-px bg-gradient-to-r from-transparent via-white/[0.06] to-transparent" />
      </div>

      <div className="relative mx-auto max-w-7xl px-6">
        {/* Header */}
        <div
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 rounded-full border border-[#00D4FF]/20 bg-[#00D4FF]/[0.06] px-4 py-1.5 text-xs font-medium text-[#00D4FF] mb-6">
            <span className="h-1.5 w-1.5 rounded-full bg-[#00D4FF]" />
            System Architecture
          </div>
          <h2 className="text-display text-3xl md:text-4xl lg:text-5xl text-white mb-4">
            Four Pillars of{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00D4FF] via-[#3B82F6] to-[#8B5CF6]">
              Precision
            </span>
          </h2>
          <p className="text-subhead text-gray-400 max-w-2xl mx-auto">
            Each component engineered for speed, accuracy, and seamless integration.
          </p>
        </div>

        {/* Pillars Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {pillars.map((pillar, i) => (
            <div
              key={pillar.title}
              className="group relative"
            >
              {/* Card */}
              <div className="relative h-full rounded-2xl border border-white/[0.05] bg-[#0A0D12]/60 p-6 backdrop-blur-sm overflow-hidden transition-all duration-500 hover:border-white/[0.1]">
                {/* Gradient background on hover */}
                <div 
                  className={`absolute inset-0 bg-gradient-to-br ${pillar.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none`}
                />
                
                {/* Top glow line */}
                <div 
                  className="absolute top-0 left-6 right-6 h-px opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                  style={{ background: `linear-gradient(to right, transparent, ${pillar.color}40, transparent)` }}
                />

                <div className="relative">
                  {/* Icon */}
                  <div 
                    className="h-12 w-12 rounded-xl flex items-center justify-center mb-5 transition-transform duration-300 group-hover:scale-110"
                    style={{ 
                      background: `linear-gradient(135deg, ${pillar.color}25, ${pillar.color}10)`,
                      boxShadow: `0 0 20px ${pillar.color}10`
                    }}
                  >
                    <pillar.icon className="h-6 w-6" style={{ color: pillar.color }} />
                  </div>

                  {/* Content */}
                  <h3 className="text-lg font-semibold text-white mb-2 group-hover:text-white transition-colors">
                    {pillar.title}
                  </h3>
                  <p className="text-sm text-gray-400 leading-relaxed">
                    {pillar.description}
                  </p>

                  {/* Bottom accent */}
                  <div 
                    className="absolute -bottom-6 -right-6 w-24 h-24 rounded-full blur-2xl opacity-0 group-hover:opacity-20 transition-opacity duration-500"
                    style={{ background: pillar.color }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Connection lines (visual flourish) */}
        <div className="hidden lg:block absolute top-[60%] left-1/2 -translate-x-1/2 w-[80%] h-px bg-gradient-to-r from-transparent via-white/[0.03] to-transparent" />
      </div>
    </section>
  )
}
