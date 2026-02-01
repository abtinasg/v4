'use client'

import { Newspaper, Terminal, LineChart, Eye, Briefcase, ArrowRight } from 'lucide-react'
import Link from 'next/link'

const features = [
  {
    icon: Newspaper,
    title: 'News Terminal',
    description: 'Aggregated market news from 50+ sources. AI-summarized insights with sentiment context.',
    href: '/dashboard/news',
    badge: 'Live',
  },
  {
    icon: Terminal,
    title: 'Terminal Pro',
    description: 'Professional charting, customizable layouts, keyboard shortcuts for efficient workflows.',
    href: '/dashboard/terminal-pro',
    badge: 'Pro',
  },
  {
    icon: LineChart,
    title: 'Fundamental Analysis',
    description: '432 institutional metrics. DCF models, valuation comparisons, and structured reports.',
    href: '/dashboard/stock-analysis',
    badge: 'Core',
  },
  {
    icon: Eye,
    title: 'Watchlist',
    description: 'Track symbols with real-time prices and customizable alerts. Organized workspace.',
    href: '/dashboard/watchlist',
    badge: null,
  },
  {
    icon: Briefcase,
    title: 'Portfolio Analytics',
    description: 'Performance tracking, risk assessment, and allocation insights across holdings.',
    href: '/dashboard/portfolio',
    badge: 'New',
  },
]

export function Features() {
  return (
    <section id="features" className="relative py-28 bg-[#0D0F12]">
      {/* Section border */}
      <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-white/8 to-transparent" />

      <div className="mx-auto max-w-6xl px-6">
        {/* Header */}
        <div className="text-center mb-16">
          <p className="text-[12px] font-medium text-[#E67E22] uppercase tracking-wider mb-4">
            Capabilities
          </p>
          <h2 className="text-4xl md:text-5xl font-semibold text-white tracking-tight mb-6">
            Comprehensive toolkit
          </h2>
          <p className="text-lg text-white/50 max-w-xl mx-auto font-light">
            Institutional-grade tools designed for clarity and consistency.
          </p>
        </div>

        {/* Features Grid - First row: 3 items */}
        <div className="grid md:grid-cols-3 gap-5 mb-5">
          {features.slice(0, 3).map((feature) => (
            <Link
              key={feature.title}
              href={feature.href}
              className="group relative p-6 rounded-2xl bg-[#13161A] border border-white/[0.06] hover:border-[#E67E22]/30 hover:bg-[#191C21] transition-all duration-300"
            >
              {/* Badge */}
              {feature.badge && (
                <div className="absolute top-4 right-4">
                  <span className="px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider rounded-full bg-[#E67E22]/10 text-[#E67E22] border border-[#E67E22]/20">
                    {feature.badge}
                  </span>
                </div>
              )}

              {/* Icon */}
              <div className="h-12 w-12 rounded-xl bg-[#E67E22]/10 border border-[#E67E22]/20 flex items-center justify-center mb-5">
                <feature.icon className="h-5 w-5 text-[#E67E22]" />
              </div>

              {/* Content */}
              <h3 className="text-lg font-semibold text-white mb-2 group-hover:text-white transition-colors">
                {feature.title}
              </h3>
              <p className="text-sm text-white/50 leading-relaxed mb-4">
                {feature.description}
              </p>

              {/* Link */}
              <div className="flex items-center gap-1.5 text-sm font-medium text-[#E67E22] opacity-0 group-hover:opacity-100 transition-opacity">
                <span>Explore</span>
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </div>
            </Link>
          ))}
        </div>

        {/* Second row: 2 items centered */}
        <div className="grid md:grid-cols-2 gap-5 max-w-4xl mx-auto">
          {features.slice(3).map((feature) => (
            <Link
              key={feature.title}
              href={feature.href}
              className="group relative p-6 rounded-2xl bg-[#13161A] border border-white/[0.06] hover:border-[#E67E22]/30 hover:bg-[#191C21] transition-all duration-300"
            >
              {/* Badge */}
              {feature.badge && (
                <div className="absolute top-4 right-4">
                  <span className="px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider rounded-full bg-[#E67E22]/10 text-[#E67E22] border border-[#E67E22]/20">
                    {feature.badge}
                  </span>
                </div>
              )}

              {/* Icon */}
              <div className="h-12 w-12 rounded-xl bg-[#E67E22]/10 border border-[#E67E22]/20 flex items-center justify-center mb-5">
                <feature.icon className="h-5 w-5 text-[#E67E22]" />
              </div>

              {/* Content */}
              <h3 className="text-lg font-semibold text-white mb-2 group-hover:text-white transition-colors">
                {feature.title}
              </h3>
              <p className="text-sm text-white/50 leading-relaxed mb-4">
                {feature.description}
              </p>

              {/* Link */}
              <div className="flex items-center gap-1.5 text-sm font-medium text-[#E67E22] opacity-0 group-hover:opacity-100 transition-opacity">
                <span>Explore</span>
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
