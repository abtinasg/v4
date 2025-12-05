'use client'

import { Search, FileSearch, BarChart2, FileText, ArrowRight } from 'lucide-react'

const steps = [
  {
    number: '01',
    icon: Search,
    title: 'Search any stock',
    description: 'Enter a ticker symbol and get instant access to comprehensive data.',
  },
  {
    number: '02',
    icon: FileSearch,
    title: 'Analyze metrics',
    description: 'Review 432 institutional metrics across valuation, growth, and risk.',
  },
  {
    number: '03',
    icon: BarChart2,
    title: 'Get AI insights',
    description: 'Our AI models analyze the data and provide actionable recommendations.',
  },
  {
    number: '04',
    icon: FileText,
    title: 'Export reports',
    description: 'Generate professional PDF reports to share or keep for your records.',
  },
]

export function Workflows() {
  return (
    <section id="workflows" className="relative py-32 bg-[#0C0C0F]">
      {/* Section border */}
      <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />

      <div className="mx-auto max-w-6xl px-6">
        {/* Header */}
        <div className="text-center mb-20">
          <p className="text-[13px] font-medium text-emerald-400 uppercase tracking-wider mb-4">
            Workflows
          </p>
          <h2 className="text-4xl md:text-5xl font-bold text-white tracking-tight mb-6">
            From search to decision
            <br />
            <span className="text-zinc-500">in minutes, not hours</span>
          </h2>
          <p className="text-lg text-zinc-400 max-w-xl mx-auto">
            A streamlined research process designed for modern investors.
          </p>
        </div>

        {/* Steps */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((step, index) => (
            <div key={step.number} className="relative">
              {/* Connector line */}
              {index < steps.length - 1 && (
                <div className="hidden lg:block absolute top-10 left-full w-full h-px bg-gradient-to-r from-white/10 to-transparent z-0" />
              )}
              
              <div className="relative z-10">
                <div className="flex items-center gap-4 mb-6">
                  <div className="h-14 w-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                    <step.icon className="h-6 w-6 text-emerald-400" />
                  </div>
                  <span className="text-[13px] font-mono text-zinc-500">{step.number}</span>
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">
                  {step.title}
                </h3>
                <p className="text-[15px] text-zinc-400 leading-relaxed">
                  {step.description}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="mt-16 text-center">
          <a
            href="/sign-up"
            className="inline-flex items-center gap-2 text-[15px] font-medium text-emerald-400 hover:text-emerald-300 transition-colors"
          >
            Start your first analysis
            <ArrowRight className="h-4 w-4" />
          </a>
        </div>
      </div>
    </section>
  )
}
