'use client'

import { Search, FileSearch, BarChart2, FileText, ArrowRight, ClipboardCheck } from 'lucide-react'

const steps = [
  {
    number: '01',
    icon: Search,
    title: 'Search any security',
    description: 'Enter a ticker symbol. Access comprehensive data instantly.',
  },
  {
    number: '02',
    icon: ClipboardCheck,
    title: 'Define your criteria',
    description: 'Set your investment parameters and risk tolerance.',
  },
  {
    number: '03',
    icon: FileSearch,
    title: 'Review institutional metrics',
    description: 'Analyze 432 metrics across valuation, growth, and risk.',
  },
  {
    number: '04',
    icon: BarChart2,
    title: 'Get structured insights',
    description: 'AI-assisted analysis with transparent methodology.',
  },
  {
    number: '05',
    icon: FileText,
    title: 'Generate your report',
    description: 'Exportable analysis with clear assumptions documented.',
  },
]

export function Workflows() {
  return (
    <section id="workflows" className="relative py-28 bg-[#111418]">
      {/* Section border */}
      <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-white/8 to-transparent" />

      <div className="mx-auto max-w-6xl px-6">
        {/* Header */}
        <div className="text-center mb-16">
          <p className="text-[12px] font-medium text-[#4ECDC4] uppercase tracking-wider mb-4">
            Workflows
          </p>
          <h2 className="text-4xl md:text-5xl font-semibold text-white tracking-tight mb-6">
            Repeatable process.
            <br />
            <span className="text-white/50">Consistent results.</span>
          </h2>
          <p className="text-lg text-white/50 max-w-xl mx-auto font-light">
            A structured research workflow designed for disciplined investors.
          </p>
        </div>

        {/* Steps - First row: 3 items */}
        <div className="grid md:grid-cols-3 gap-6 mb-6">
          {steps.slice(0, 3).map((step, index) => (
            <div key={step.number} className="relative">
              {/* Connector line */}
              {index < 2 && (
                <div className="hidden md:block absolute top-10 left-full w-full h-px bg-gradient-to-r from-white/10 to-transparent z-0" />
              )}
              
              <div className="relative z-10 p-6 rounded-2xl bg-[#0D0F12] border border-white/[0.06] hover:border-white/[0.12] transition-all duration-300">
                <div className="flex items-center gap-4 mb-5">
                  <div className="h-12 w-12 rounded-xl bg-[#4ECDC4]/10 border border-[#4ECDC4]/20 flex items-center justify-center">
                    <step.icon className="h-5 w-5 text-[#4ECDC4]" />
                  </div>
                  <span className="text-[12px] font-mono text-white/30">{step.number}</span>
                </div>
                <h3 className="text-[16px] font-semibold text-white mb-2">
                  {step.title}
                </h3>
                <p className="text-[14px] text-white/50 leading-relaxed">
                  {step.description}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Steps - Second row: 2 items centered */}
        <div className="grid md:grid-cols-2 gap-6 max-w-3xl mx-auto">
          {steps.slice(3).map((step, index) => (
            <div key={step.number} className="relative">
              {/* Connector line */}
              {index < 1 && (
                <div className="hidden md:block absolute top-10 left-full w-full h-px bg-gradient-to-r from-white/10 to-transparent z-0" />
              )}
              
              <div className="relative z-10 p-6 rounded-2xl bg-[#0D0F12] border border-white/[0.06] hover:border-white/[0.12] transition-all duration-300">
                <div className="flex items-center gap-4 mb-5">
                  <div className="h-12 w-12 rounded-xl bg-[#4ECDC4]/10 border border-[#4ECDC4]/20 flex items-center justify-center">
                    <step.icon className="h-5 w-5 text-[#4ECDC4]" />
                  </div>
                  <span className="text-[12px] font-mono text-white/30">{step.number}</span>
                </div>
                <h3 className="text-[16px] font-semibold text-white mb-2">
                  {step.title}
                </h3>
                <p className="text-[14px] text-white/50 leading-relaxed">
                  {step.description}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="mt-12 text-center">
          <a
            href="/sign-up"
            className="inline-flex items-center gap-2 text-[15px] font-medium text-[#4ECDC4] hover:text-[#6FDDD5] transition-colors"
          >
            Start your first analysis
            <ArrowRight className="h-4 w-4" />
          </a>
        </div>
      </div>
    </section>
  )
}
