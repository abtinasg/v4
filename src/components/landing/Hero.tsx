'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import {
  Activity,
  ArrowRight,
  BarChart3,
  Globe2,
  Lock,
  Play,
  ShieldCheck,
  Sparkles,
  Zap,
} from 'lucide-react'

const statPills = [
  {
    label: 'Processed in 2024',
    value: '$18.4B',
    change: '+142%',
  },
  {
    label: 'Avg. settlement',
    value: '2.3s',
    change: 'real-time rails',
  },
  {
    label: 'Global coverage',
    value: '120+',
    change: 'markets live',
  },
]

const assurance = [
  {
    icon: ShieldCheck,
    title: 'Bank-grade security',
    description: '256-bit encryption, SOC2, and biometric approvals on every release.',
  },
  {
    icon: Globe2,
    title: 'Borderless liquidity',
    description: 'Instant corridors for USD, EUR, GBP, SGD, and 30+ local rails.',
  },
  {
    icon: BarChart3,
    title: 'Command dashboard',
    description: 'Curated KPIs, anomaly alerts, and streaming FX to keep your treasury calm.',
  },
]

export function Hero() {
  return (
    <section className="relative overflow-hidden bg-[#05070a] text-white">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(88,108,255,0.15),_transparent_40%),_radial-gradient(circle_at_70%_20%,_rgba(120,80,255,0.18),_transparent_35%)]" />
      <div className="absolute inset-0" style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)', backgroundSize: '140px 140px', maskImage: 'radial-gradient(circle at center, black 40%, transparent 70%)' }} />

      <div className="relative max-w-7xl mx-auto px-6 pt-28 pb-20 lg:pb-28">
        <div className="flex flex-col gap-12 lg:grid lg:grid-cols-[1.1fr_1fr] lg:items-center">
          {/* Left */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            className="space-y-8"
          >
            <div className="inline-flex items-center gap-3 rounded-full border border-white/10 bg-white/5 px-4 py-2 backdrop-blur">
              <Sparkles className="h-4 w-4 text-blue-400" />
              <span className="text-sm text-gray-200">Premium fintech OS for global money movement</span>
            </div>

            <div className="space-y-4">
              <h1 className="text-4xl leading-tight font-bold md:text-5xl lg:text-[56px] lg:leading-[1.05]">
                Make your global payments feel
                <span className="block bg-gradient-to-r from-blue-400 via-purple-400 to-cyan-300 bg-clip-text text-transparent">
                  effortless, safe, and instant.
                </span>
              </h1>
              <p className="text-lg text-gray-300 max-w-2xl">
                Deep Terminal weaves treasury controls, FX, and analytics into a single dashboard so you can clear funds, track exposure, and impress auditors—all in one view.
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <Link
                href="/sign-up"
                className="group inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-blue-500 to-purple-500 px-7 py-3 text-base font-semibold shadow-lg shadow-blue-500/30 transition-all hover:scale-[1.02]"
              >
                Start free trial
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>
              <button className="group inline-flex items-center gap-2 rounded-2xl border border-white/15 bg-white/5 px-6 py-3 text-base font-semibold text-white transition hover:border-white/30 hover:bg-white/10">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 group-hover:bg-white/20">
                  <Play className="h-4 w-4" />
                </div>
                Watch product tour
              </button>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              {statPills.map((stat) => (
                <div
                  key={stat.label}
                  className="rounded-2xl border border-white/10 bg-white/5 p-4 shadow-inner shadow-blue-500/10 backdrop-blur"
                >
                  <div className="text-sm text-gray-400">{stat.label}</div>
                  <div className="mt-2 text-2xl font-semibold">{stat.value}</div>
                  <div className="text-xs uppercase tracking-wide text-blue-300">{stat.change}</div>
                </div>
              ))}
            </div>

            <div className="flex flex-wrap items-center gap-4 text-sm text-gray-400">
              <div className="flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1">
                <Lock className="h-4 w-4 text-green-400" /> SOC2 Type II
              </div>
              <div className="flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1">
                <ShieldCheck className="h-4 w-4 text-blue-300" /> PCI-DSS ready
              </div>
              <div className="flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1">
                <Activity className="h-4 w-4 text-purple-300" /> Live risk scoring
              </div>
            </div>
          </motion.div>

          {/* Right */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.1 }}
            className="relative"
          >
            <div className="absolute -left-10 -top-16 h-40 w-40 rounded-full bg-blue-500/20 blur-3xl" />
            <div className="absolute -right-16 bottom-10 h-36 w-36 rounded-full bg-purple-500/25 blur-3xl" />

            <div className="relative overflow-hidden rounded-[28px] border border-white/10 bg-gradient-to-b from-white/10 via-white/5 to-black/60 p-6 shadow-2xl shadow-blue-500/10 backdrop-blur">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-500" />
                <div className="text-sm text-gray-300">Deep Terminal Control Center</div>
                <div className="ml-auto flex gap-2">
                  <span className="h-2.5 w-2.5 rounded-full bg-emerald-400" />
                  <span className="h-2.5 w-2.5 rounded-full bg-amber-400" />
                  <span className="h-2.5 w-2.5 rounded-full bg-rose-400" />
                </div>
              </div>

              <div className="mt-6 grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
                <div className="rounded-2xl border border-white/10 bg-black/40 p-4">
                  <div className="flex items-center justify-between text-sm text-gray-400">
                    <span>Liquidity health</span>
                    <span className="flex items-center gap-1 text-green-400">
                      <Zap className="h-3.5 w-3.5" /> Live
                    </span>
                  </div>
                  <div className="mt-3 h-36 rounded-xl bg-gradient-to-b from-blue-500/20 to-transparent" />
                  <div className="mt-4 grid grid-cols-3 gap-3 text-xs text-gray-300">
                    <div className="rounded-xl border border-white/10 bg-white/5 p-3">
                      <div className="text-gray-400">FX desk</div>
                      <div className="text-lg font-semibold">$12.7M</div>
                      <div className="text-emerald-400">+4.2%</div>
                    </div>
                    <div className="rounded-xl border border-white/10 bg-white/5 p-3">
                      <div className="text-gray-400">Escrow</div>
                      <div className="text-lg font-semibold">$4.9M</div>
                      <div className="text-amber-300">Stable</div>
                    </div>
                    <div className="rounded-xl border border-white/10 bg-white/5 p-3">
                      <div className="text-gray-400">On-chain</div>
                      <div className="text-lg font-semibold">$2.1M</div>
                      <div className="text-blue-300">Synced</div>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  {assurance.map((item) => (
                    <div
                      key={item.title}
                      className="flex gap-3 rounded-2xl border border-white/10 bg-white/5 p-4"
                    >
                      <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-white/10 to-transparent">
                        <item.icon className="h-5 w-5 text-blue-200" />
                      </div>
                      <div className="space-y-1">
                        <div className="font-semibold text-white">{item.title}</div>
                        <p className="text-sm text-gray-400 leading-relaxed">{item.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-5 flex flex-wrap items-center gap-4 text-sm text-gray-300">
                <div className="flex items-center gap-2 rounded-full bg-white/5 px-3 py-1">
                  <ShieldCheck className="h-4 w-4 text-emerald-300" />
                  Continuous monitoring
                </div>
                <div className="flex items-center gap-2 rounded-full bg-white/5 px-3 py-1">
                  <Globe2 className="h-4 w-4 text-cyan-300" />
                  38 corridors live
                </div>
                <div className="flex items-center gap-2 rounded-full bg-white/5 px-3 py-1">
                  <BarChart3 className="h-4 w-4 text-purple-300" />
                  Treasury-ready exports
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
