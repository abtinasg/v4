'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import {
  Activity,
  ArrowRight,
  BrainCircuit,
  GaugeCircle,
  Layers3,
  LineChart,
  Radio,
  Sparkles,
} from 'lucide-react'

const heroStats = [
  {
    label: 'Signals orchestrated / day',
    value: '1.8M+',
    detail: 'AI + quant models blended in real-time',
  },
  {
    label: 'Fundamental metrics tracked',
    value: '150+',
    detail: 'Across valuation, quality, growth & risk',
  },
  {
    label: 'Retail investors served',
    value: '42k',
    detail: 'From first trade to full-time pro',
  },
]

const heroHighlights = [
  {
    icon: GaugeCircle,
    title: 'Pro Terminal',
    copy: 'Depth-of-market, execution-ready watchlists, and session-level journaling in one canvas.',
  },
  {
    icon: Radio,
    title: 'Realtime Watchlists',
    copy: 'Stream live quotes, options IV, and macro triggers with millisecond diffing.',
  },
  {
    icon: BrainCircuit,
    title: 'AI Orchestrator',
    copy: 'Layer GPT-4, Claude, and internal alpha models into a single co-pilot that reasons about context.',
  },
  {
    icon: Layers3,
    title: 'Stock Analyst',
    copy: '150+ DuPont, factor, and technical metrics composed into explainable dossiers.',
  },
]

export function Hero() {
  return (
    <section className="relative isolate overflow-hidden bg-[#010308] pt-28 pb-20 text-white">
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(56,189,248,0.18),_transparent_45%)]" />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-blue-500/10 to-transparent" />
      </div>

      <div className="relative z-10 mx-auto max-w-6xl px-6">
        <div className="grid items-center gap-12 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="space-y-8">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-blue-200">
              <Sparkles className="h-4 w-4" /> Premium intelligence for retail investors
            </div>
            <div className="space-y-6">
              <h1 className="text-4xl font-bold leading-tight md:text-5xl lg:text-6xl">
                A cinematic <span className="text-blue-200">AI terminal</span> designed to make
                <span className="bg-gradient-to-r from-blue-300 via-purple-300 to-cyan-200 bg-clip-text text-transparent"> everyday investors feel institutional.</span>
              </h1>
              <p className="text-lg text-gray-300 md:text-xl">
                Deep Terminal blends our pro execution workspace, real-time watchlists, and AI orchestrator so retail investors can scout, validate, and act with conviction.
              </p>
              <div className="flex flex-wrap gap-3 text-sm text-blue-100">
                <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1">
                  <Activity className="h-3.5 w-3.5" /> Streaming market data
                </span>
                <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1">
                  <LineChart className="h-3.5 w-3.5" /> Factor-aware scoring
                </span>
                <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1">
                  <BrainCircuit className="h-3.5 w-3.5" /> Multi-model AI co-pilot
                </span>
              </div>
            </div>
            <div className="flex flex-wrap gap-4">
              <Link
                href="/sign-up"
                className="inline-flex items-center justify-center gap-2 rounded-2xl bg-white px-6 py-3 text-sm font-semibold text-black transition hover:scale-[1.01]"
              >
                Launch the pro terminal
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/demo"
                className="inline-flex items-center justify-center gap-2 rounded-2xl border border-white/20 px-6 py-3 text-sm font-semibold text-white hover:bg-white/10"
              >
                Watch orchestrator tour
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>

          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/30 via-transparent to-purple-500/40 blur-3xl" />
            <div className="relative space-y-4 rounded-3xl border border-white/10 bg-white/5 p-6 shadow-2xl shadow-blue-500/20 backdrop-blur">
              {heroStats.map((stat) => (
                <div key={stat.label} className="rounded-2xl border border-white/10 bg-gradient-to-r from-white/10 to-transparent px-5 py-4">
                  <p className="text-xs uppercase tracking-[0.25em] text-blue-200">{stat.label}</p>
                  <p className="mt-2 text-3xl font-semibold">{stat.value}</p>
                  <p className="mt-1 text-sm text-gray-300">{stat.detail}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-16 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {heroHighlights.map((item) => (
            <motion.div
              key={item.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4 }}
              className="group relative flex flex-col gap-3 rounded-2xl border border-white/10 bg-white/5 p-5"
            >
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/10 text-blue-100">
                <item.icon className="h-5 w-5" />
              </div>
              <h3 className="text-lg font-semibold">{item.title}</h3>
              <p className="text-sm text-gray-300 leading-relaxed">{item.copy}</p>
              <div className="text-xs text-blue-200 opacity-0 transition group-hover:opacity-100">Designed for deep focus</div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
