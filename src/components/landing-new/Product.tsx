'use client'

import { BarChart3, Brain, FileText, TrendingUp, Shield, Zap } from 'lucide-react'

const features = [
  {
    icon: BarChart3,
    title: '432 Institutional Metrics',
    description: 'The same fundamental metrics used by professional analysts. Consistent methodology across all securities.',
  },
  {
    icon: Brain,
    title: 'AI-Assisted Analysis',
    description: 'Multi-model insights that surface relevant patterns. Transparent reasoning, not black-box predictions.',
  },
  {
    icon: FileText,
    title: 'Structured Reports',
    description: 'Institutional-quality research output. Clear assumptions, exportable formats, repeatable process.',
  },
  {
    icon: TrendingUp,
    title: 'Real-Time Data',
    description: 'Live market data from trusted sources. Accurate pricing, timely updates, reliable infrastructure.',
  },
  {
    icon: Shield,
    title: 'Enterprise Security',
    description: 'SOC 2 compliant infrastructure. Your data encrypted at rest and in transit. No compromises.',
  },
  {
    icon: Zap,
    title: 'Custom Alerts',
    description: 'Configurable notifications for price targets, metric thresholds, and portfolio changes.',
  },
]

export function Product() {
  return (
    <section id="product" className="relative py-28 bg-[#0D0F12]">
      {/* Section border */}
      <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-white/8 to-transparent" />

      <div className="mx-auto max-w-6xl px-6">
        {/* Header */}
        <div className="text-center mb-16">
          <p className="text-[12px] font-medium text-[#E67E22] uppercase tracking-wider mb-4">
            Product
          </p>
          <h2 className="text-4xl md:text-5xl font-semibold text-white tracking-tight mb-6">
            Professional infrastructure,
            <br />
            <span className="text-white/50">accessible approach</span>
          </h2>
          <p className="text-lg text-white/50 max-w-xl mx-auto font-light">
            Institutional-grade tools designed for individual investors.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="group p-7 rounded-2xl bg-[#13161A] border border-white/[0.06] hover:border-white/[0.12] hover:bg-[#191C21] transition-all duration-300"
            >
              <div className="h-12 w-12 rounded-xl bg-[#E67E22]/10 border border-[#E67E22]/20 flex items-center justify-center mb-5">
                <feature.icon className="h-5 w-5 text-[#E67E22]" />
              </div>
              <h3 className="text-[17px] font-semibold text-white mb-3">
                {feature.title}
              </h3>
              <p className="text-[14px] text-white/50 leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
