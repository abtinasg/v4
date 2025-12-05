'use client'

import { BarChart3, Brain, FileText, TrendingUp, Shield, Zap } from 'lucide-react'

const features = [
  {
    icon: BarChart3,
    title: '432 Institutional Metrics',
    description: 'Access the same fundamental metrics used by professional analysts at top investment firms.',
  },
  {
    icon: Brain,
    title: 'AI-Powered Analysis',
    description: 'Multi-model AI orchestration delivers comprehensive insights from multiple perspectives.',
  },
  {
    icon: FileText,
    title: 'Professional Reports',
    description: 'Generate institutional-quality research reports with one click. Export to PDF.',
  },
  {
    icon: TrendingUp,
    title: 'Real-Time Data',
    description: 'Live market data from trusted sources. Never miss a price movement or news event.',
  },
  {
    icon: Shield,
    title: 'Bank-Grade Security',
    description: 'SOC 2 compliant infrastructure. Your data is encrypted and protected.',
  },
  {
    icon: Zap,
    title: 'Instant Alerts',
    description: 'Custom price alerts and AI-detected opportunities delivered to your inbox.',
  },
]

export function Product() {
  return (
    <section id="product" className="relative py-32 bg-[#09090B]">
      {/* Section border */}
      <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />

      <div className="mx-auto max-w-6xl px-6">
        {/* Header */}
        <div className="text-center mb-20">
          <p className="text-[13px] font-medium text-blue-400 uppercase tracking-wider mb-4">
            Product
          </p>
          <h2 className="text-4xl md:text-5xl font-bold text-white tracking-tight mb-6">
            Everything you need to
            <br />
            <span className="text-zinc-500">invest with confidence</span>
          </h2>
          <p className="text-lg text-zinc-400 max-w-xl mx-auto">
            Professional tools, simplified for retail investors.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="group p-8 rounded-2xl bg-white/[0.02] border border-white/[0.06] hover:border-white/[0.12] hover:bg-white/[0.04] transition-all duration-300"
            >
              <div className="h-12 w-12 rounded-xl bg-blue-500/10 flex items-center justify-center mb-6">
                <feature.icon className="h-6 w-6 text-blue-400" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-3">
                {feature.title}
              </h3>
              <p className="text-[15px] text-zinc-400 leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
