'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import {
  Activity,
  ArrowRight,
  CreditCard,
  Fingerprint,
  Globe2,
  LockKeyhole,
  Play,
  ShieldCheck,
  Sparkles,
  TrendingUp,
} from 'lucide-react'
import { AnimatedBackground } from './AnimatedBackground'

const highlights = [
  {
    title: 'Instant global payouts',
    description: 'Move funds across 140+ countries with treasury-grade compliance.',
    icon: Globe2,
  },
  {
    title: 'Adaptive risk engine',
    description: 'AI-powered monitoring that neutralizes fraud before it hits your balance.',
    icon: ShieldCheck,
  },
  {
    title: 'Enterprise encryption',
    description: 'Hardware-backed keys, audited flows, and per-transaction policies.',
    icon: LockKeyhole,
  },
]

const metrics = [
  { label: 'Settlements this quarter', value: '$2.3B', change: '+18.4%' },
  { label: 'Uptime', value: '99.995%', change: 'SLA-backed' },
  { label: 'Enterprise teams', value: '2,100+', change: 'New this year' },
]

export function Hero() {
  return (
    <section className="relative overflow-hidden pt-28 pb-20 lg:pt-32 lg:pb-28">
      <AnimatedBackground />

      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(99,102,241,0.12),transparent_45%),radial-gradient(circle_at_80%_0%,rgba(124,58,237,0.15),transparent_35%),radial-gradient(circle_at_50%_90%,rgba(14,165,233,0.12),transparent_40%)]" />

      <div className="relative z-10 max-w-7xl mx-auto px-6">
        <div className="grid lg:grid-cols-[1.05fr_0.95fr] gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="space-y-8"
          >
            <div className="inline-flex items-center gap-3 px-4 py-2 rounded-full bg-white/5 border border-white/10 backdrop-blur-md text-sm text-gray-200 shadow-lg shadow-indigo-500/10">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400" />
              </span>
              Global-grade security • Real-time treasury
            </div>

            <div className="space-y-4">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight">
                Make your global payments safe, instant, and beautifully orchestrated.
              </h1>
              <p className="text-lg md:text-xl text-gray-300 max-w-2xl">
                Deep Terminal is your premium fintech command center—unifying risk, treasury, and intelligence in one luminous dashboard.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <Link
                href="/sign-up"
                className="group inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl bg-gradient-to-r from-indigo-500 via-purple-500 to-cyan-400 text-white font-semibold shadow-xl shadow-indigo-500/25 transition-all duration-300 hover:shadow-indigo-500/40 hover:scale-[1.02]"
              >
                Start instantly
                <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
              </Link>
              <button className="group inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl border border-white/15 bg-white/5 text-white font-semibold backdrop-blur-md transition-colors hover:bg-white/10">
                <div className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center group-hover:bg-white/20 transition-colors">
                  <Play className="w-4 h-4" />
                </div>
                Watch 90s overview
              </button>
            </div>

            <div className="grid md:grid-cols-3 gap-4">
              {metrics.map((metric) => (
                <div
                  key={metric.label}
                  className="rounded-2xl border border-white/10 bg-white/[0.04] p-4 backdrop-blur-md shadow-inner shadow-black/30"
                >
                  <div className="text-sm text-gray-400">{metric.label}</div>
                  <div className="text-2xl font-semibold text-white mt-1">{metric.value}</div>
                  <div className="text-sm text-emerald-400 mt-1">{metric.change}</div>
                </div>
              ))}
            </div>

            <div className="grid sm:grid-cols-3 gap-4">
              {highlights.map((item, idx) => (
                <div
                  key={item.title}
                  className="group relative rounded-2xl border border-white/10 bg-white/5 px-4 py-5 backdrop-blur-md overflow-hidden"
                >
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-gradient-to-br from-indigo-500/20 via-purple-500/10 to-cyan-400/15" />
                  <div className="relative flex items-start gap-3">
                    <div className="p-2 rounded-xl bg-white/10 text-white shadow-lg shadow-indigo-500/10">
                      <item.icon className="w-5 h-5" />
                    </div>
                    <div className="space-y-1">
                      <div className="text-sm font-semibold text-white">{item.title}</div>
                      <p className="text-xs text-gray-400 leading-relaxed">{item.description}</p>
                    </div>
                  </div>
                  <div className="absolute -right-10 -bottom-10 w-24 h-24 rounded-full bg-gradient-to-tr from-indigo-500/15 to-cyan-400/20 blur-2xl" />
                  <div className="absolute top-2 right-3 text-xs text-gray-500">0{idx + 1}</div>
                </div>
              ))}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="relative"
          >
            <div className="absolute -inset-6 bg-gradient-to-tr from-indigo-600/10 via-purple-600/15 to-cyan-500/10 blur-3xl" />
            <div className="relative rounded-3xl border border-white/10 bg-gradient-to-b from-white/10 via-white/5 to-black/20 backdrop-blur-2xl p-6 shadow-2xl shadow-indigo-900/40">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2 text-sm text-gray-300">
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
                  Live treasury cockpit
                </div>
                <div className="flex items-center gap-2 text-xs text-gray-400">
                  <Fingerprint className="w-4 h-4" /> Secure session
                </div>
              </div>

              <div className="rounded-2xl border border-white/10 bg-black/40 p-4 mb-4">
                <div className="flex items-center justify-between text-sm text-gray-400">
                  <span>Global liquidity</span>
                  <span className="text-emerald-400 font-semibold">+$4.9M today</span>
                </div>
                <div className="mt-3 h-32 rounded-xl bg-gradient-to-b from-indigo-500/20 via-purple-500/10 to-transparent overflow-hidden border border-white/5 relative">
                  <ChartVisualization />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-xl border border-white/10 bg-white/5 p-3">
                  <div className="flex items-center justify-between text-xs text-gray-400">
                    <span>Portfolio yield</span>
                    <Sparkles className="w-4 h-4 text-indigo-300" />
                  </div>
                  <div className="text-2xl font-semibold mt-2">8.62%</div>
                  <div className="text-emerald-400 text-sm">Optimized daily</div>
                </div>

                <div className="rounded-xl border border-white/10 bg-gradient-to-br from-indigo-600/30 to-cyan-500/20 p-3 shadow-lg shadow-indigo-900/20">
                  <div className="flex items-center gap-2 text-xs text-white/80">
                    <CreditCard className="w-4 h-4" /> Instant issuance
                  </div>
                  <div className="mt-3 flex items-center justify-between">
                    <div>
                      <div className="text-sm text-white/80">Spend ready</div>
                      <div className="text-xl font-semibold">$120,400</div>
                    </div>
                    <div className="px-3 py-1 rounded-full bg-white/15 text-xs text-white">Active</div>
                  </div>
                </div>

                <div className="rounded-xl border border-white/10 bg-white/5 p-3 flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-indigo-500/20 text-indigo-200">
                    <TrendingUp className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-sm font-semibold">AI signals</div>
                    <p className="text-xs text-gray-400">Pattern detected: bullish continuation on NVDA, TSLA, MSFT.</p>
                  </div>
                </div>

                <div className="rounded-xl border border-white/10 bg-white/5 p-3 flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-emerald-500/20 text-emerald-200">
                    <Activity className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-sm font-semibold">Risk shield</div>
                    <p className="text-xs text-gray-400">Zero fraud events in the last 180 days across all corridors.</p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}

function ChartVisualization() {
  return (
    <svg className="absolute inset-0 w-full h-full" preserveAspectRatio="none">
      <defs>
        <linearGradient id="chartGradient" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="rgba(99, 102, 241, 0.3)" />
          <stop offset="100%" stopColor="rgba(99, 102, 241, 0)" />
        </linearGradient>
        <linearGradient id="lineGradient" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#818cf8" />
          <stop offset="50%" stopColor="#a855f7" />
          <stop offset="100%" stopColor="#22d3ee" />
        </linearGradient>
      </defs>

      <motion.path
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1 }}
        d="M 0 170 Q 80 140, 160 120 T 320 100 T 480 70 T 640 90 L 640 240 L 0 240 Z"
        fill="url(#chartGradient)"
      />

      <motion.path
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 2, ease: 'easeInOut' }}
        d="M 0 170 Q 80 140, 160 120 T 320 100 T 480 70 T 640 90"
        fill="none"
        stroke="url(#lineGradient)"
        strokeWidth="2.5"
        strokeLinecap="round"
      />

      {[100, 220, 360, 480, 600].map((cx, i) => (
        <motion.circle
          key={cx}
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3, delay: 0.4 + i * 0.1 }}
          cx={cx}
          cy={i % 2 === 0 ? 120 : 90}
          r="4"
          fill="#c4b5fd"
        />
      ))}
    </svg>
  )
}
