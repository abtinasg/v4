'use client'

import { TrendingUp, Briefcase, GraduationCap, Building } from 'lucide-react'

const personas = [
  {
    icon: TrendingUp,
    title: 'Retail Investors',
    description: 'Individual investors who want professional-grade tools. Make smarter decisions with AI-powered insights.',
  },
  {
    icon: Briefcase,
    title: 'Financial Advisors',
    description: 'Generate institutional-quality reports for clients in minutes. Impress with data-driven recommendations backed by 432 metrics.',
  },
  {
    icon: GraduationCap,
    title: 'Finance Students',
    description: 'Learn fundamental analysis the way professionals do it. Build real skills with real data and AI-assisted learning.',
  },
  {
    icon: Building,
    title: 'Small Funds & Family Offices',
    description: 'Enterprise-level analytics without enterprise costs. Scale your research capabilities without scaling your team.',
  },
]

export function WhoItsFor() {
  return (
    <section className="relative py-24 bg-[#09090B]">
      {/* Section border */}
      <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />

      <div className="mx-auto max-w-6xl px-6">
        {/* Header */}
        <div className="text-center mb-14">
          <p className="text-[13px] font-medium text-blue-400 uppercase tracking-wider mb-4">
            Who it's for
          </p>
          <h2 className="text-3xl md:text-4xl font-bold text-white tracking-tight mb-4">
            Built for serious investors
          </h2>
          <p className="text-lg text-zinc-400 max-w-xl mx-auto">
            Whether you're managing your own portfolio or advising others.
          </p>
        </div>

        {/* Personas Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {personas.map((persona) => (
            <div
              key={persona.title}
              className="p-6 rounded-2xl bg-white/[0.02] border border-white/[0.06] hover:border-white/[0.12] hover:bg-white/[0.04] transition-all duration-300"
            >
              <div className="h-11 w-11 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center mb-5">
                <persona.icon className="h-5 w-5 text-blue-400" />
              </div>
              <h3 className="text-base font-semibold text-white mb-2">
                {persona.title}
              </h3>
              <p className="text-sm text-zinc-400 leading-relaxed">
                {persona.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
