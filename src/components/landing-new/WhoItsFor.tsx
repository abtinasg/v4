'use client'

import { TrendingUp, Briefcase, GraduationCap, Building } from 'lucide-react'

const personas = [
  {
    icon: TrendingUp,
    title: 'Individual Investors',
    description: 'Access institutional metrics for structured decision-making. Clear frameworks for consistent analysis.',
  },
  {
    icon: Briefcase,
    title: 'Financial Advisors',
    description: 'Generate professional reports backed by 432 metrics. Systematic workflows that scale with your practice.',
  },
  {
    icon: GraduationCap,
    title: 'Finance Students',
    description: 'Learn fundamental analysis using real data. Build repeatable research skills for long-term success.',
  },
  {
    icon: Building,
    title: 'Family Offices',
    description: 'Institutional-quality analytics without the institutional cost. Transparent methodology, clear assumptions.',
  },
]

export function WhoItsFor() {
  return (
    <section className="relative py-24 bg-[#0D0F12]">
      {/* Section border - subtle separator */}
      <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-white/8 to-transparent" />

      <div className="mx-auto max-w-6xl px-6">
        {/* Header */}
        <div className="text-center mb-14">
          <p className="text-[12px] font-medium text-[#E67E22] uppercase tracking-wider mb-4">
            Who it's for
          </p>
          <h2 className="text-3xl md:text-4xl font-semibold text-white tracking-tight mb-4">
            Built for long-term thinkers
          </h2>
          <p className="text-lg text-white/50 max-w-xl mx-auto font-light">
            Whether you're managing personal wealth or advising clients.
          </p>
        </div>

        {/* Personas Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {personas.map((persona) => (
            <div
              key={persona.title}
              className="group p-6 rounded-2xl bg-[#13161A] border border-white/[0.06] hover:border-white/[0.12] hover:bg-[#191C21] transition-all duration-300"
            >
              <div className="h-11 w-11 rounded-xl bg-[#E67E22]/10 border border-[#E67E22]/20 flex items-center justify-center mb-5">
                <persona.icon className="h-5 w-5 text-[#E67E22]" />
              </div>
              <h3 className="text-[15px] font-semibold text-white mb-2">
                {persona.title}
              </h3>
              <p className="text-sm text-white/50 leading-relaxed">
                {persona.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
