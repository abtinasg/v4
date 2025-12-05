'use client'

import { Newspaper, Terminal, LineChart, Eye, Briefcase, ArrowRight } from 'lucide-react'
import Link from 'next/link'

const features = [
  {
    icon: Newspaper,
    title: 'News Terminal',
    description: 'Real-time market news aggregated from 50+ sources. AI-powered summaries and sentiment analysis for every headline.',
    href: '/dashboard/news',
    color: 'blue',
    badge: 'Live',
  },
  {
    icon: Terminal,
    title: 'Terminal Pro',
    description: 'Professional-grade trading terminal with advanced charting, hotkeys, and customizable layouts.',
    href: '/dashboard/terminal-pro',
    color: 'purple',
    badge: 'Pro',
  },
  {
    icon: LineChart,
    title: 'Stock Analysis',
    description: 'Deep fundamental analysis with 432 metrics. AI-generated reports and valuation models.',
    href: '/dashboard/stock-analysis',
    color: 'emerald',
    badge: 'AI',
  },
  {
    icon: Eye,
    title: 'Watchlist',
    description: 'Track unlimited symbols with real-time prices, alerts, and personalized insights.',
    href: '/dashboard/watchlist',
    color: 'orange',
    badge: null,
  },
  {
    icon: Briefcase,
    title: 'Portfolio',
    description: 'Connect your brokerage or manually track holdings. Performance analytics and risk assessment.',
    href: '/dashboard/portfolio',
    color: 'cyan',
    badge: 'New',
  },
]

const colorMap: Record<string, { bg: string; text: string; border: string; glow: string }> = {
  blue: { bg: 'bg-blue-500/10', text: 'text-blue-400', border: 'border-blue-500/20', glow: 'group-hover:shadow-blue-500/20' },
  purple: { bg: 'bg-purple-500/10', text: 'text-purple-400', border: 'border-purple-500/20', glow: 'group-hover:shadow-purple-500/20' },
  emerald: { bg: 'bg-emerald-500/10', text: 'text-emerald-400', border: 'border-emerald-500/20', glow: 'group-hover:shadow-emerald-500/20' },
  orange: { bg: 'bg-orange-500/10', text: 'text-orange-400', border: 'border-orange-500/20', glow: 'group-hover:shadow-orange-500/20' },
  cyan: { bg: 'bg-cyan-500/10', text: 'text-cyan-400', border: 'border-cyan-500/20', glow: 'group-hover:shadow-cyan-500/20' },
}

export function Features() {
  return (
    <section id="features" className="relative py-32 bg-[#09090B]">
      {/* Section border */}
      <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />

      <div className="mx-auto max-w-6xl px-6">
        {/* Header */}
        <div className="text-center mb-16">
          <p className="text-[13px] font-medium text-purple-400 uppercase tracking-wider mb-4">
            Features
          </p>
          <h2 className="text-4xl md:text-5xl font-bold text-white tracking-tight mb-6">
            One platform,
            <br />
            <span className="text-zinc-500">everything you need</span>
          </h2>
          <p className="text-lg text-zinc-400 max-w-xl mx-auto">
            All the tools professional investors use, designed for simplicity.
          </p>
        </div>

        {/* Features Grid - First row: 3 items */}
        <div className="grid md:grid-cols-3 gap-5 mb-5">
          {features.slice(0, 3).map((feature) => {
            const colors = colorMap[feature.color]
            return (
              <Link
                key={feature.title}
                href={feature.href}
                className={`group relative p-6 rounded-2xl bg-white/[0.02] border border-white/[0.06] hover:border-white/[0.12] hover:bg-white/[0.04] transition-all duration-300 hover:shadow-lg ${colors.glow}`}
              >
                {/* Badge */}
                {feature.badge && (
                  <div className="absolute top-4 right-4">
                    <span className={`px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider rounded-full ${colors.bg} ${colors.text} ${colors.border} border`}>
                      {feature.badge}
                    </span>
                  </div>
                )}

                {/* Icon */}
                <div className={`h-12 w-12 rounded-xl ${colors.bg} ${colors.border} border flex items-center justify-center mb-5`}>
                  <feature.icon className={`h-6 w-6 ${colors.text}`} />
                </div>

                {/* Content */}
                <h3 className="text-lg font-semibold text-white mb-2 group-hover:text-white transition-colors">
                  {feature.title}
                </h3>
                <p className="text-sm text-zinc-400 leading-relaxed mb-4">
                  {feature.description}
                </p>

                {/* Link */}
                <div className={`flex items-center gap-1.5 text-sm font-medium ${colors.text} opacity-0 group-hover:opacity-100 transition-opacity`}>
                  <span>Explore</span>
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                </div>
              </Link>
            )
          })}
        </div>

        {/* Second row: 2 items centered */}
        <div className="grid md:grid-cols-2 gap-5 max-w-4xl mx-auto">
          {features.slice(3).map((feature) => {
            const colors = colorMap[feature.color]
            return (
              <Link
                key={feature.title}
                href={feature.href}
                className={`group relative p-6 rounded-2xl bg-white/[0.02] border border-white/[0.06] hover:border-white/[0.12] hover:bg-white/[0.04] transition-all duration-300 hover:shadow-lg ${colors.glow}`}
              >
                {/* Badge */}
                {feature.badge && (
                  <div className="absolute top-4 right-4">
                    <span className={`px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider rounded-full ${colors.bg} ${colors.text} ${colors.border} border`}>
                      {feature.badge}
                    </span>
                  </div>
                )}

                {/* Icon */}
                <div className={`h-12 w-12 rounded-xl ${colors.bg} ${colors.border} border flex items-center justify-center mb-5`}>
                  <feature.icon className={`h-6 w-6 ${colors.text}`} />
                </div>

                {/* Content */}
                <h3 className="text-lg font-semibold text-white mb-2 group-hover:text-white transition-colors">
                  {feature.title}
                </h3>
                <p className="text-sm text-zinc-400 leading-relaxed mb-4">
                  {feature.description}
                </p>

                {/* Link */}
                <div className={`flex items-center gap-1.5 text-sm font-medium ${colors.text} opacity-0 group-hover:opacity-100 transition-opacity`}>
                  <span>Explore</span>
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                </div>
              </Link>
            )
          })}
        </div>
      </div>
    </section>
  )
}
