'use client'

import { motion } from 'framer-motion'
import { ShieldCheck, Sparkles, Zap, Radar, CreditCard, Globe2, Server, LineChart } from 'lucide-react'

const featureGrid = [
  {
    icon: ShieldCheck,
    title: 'Compliance-first core',
    description: 'SOC2, PCI-DSS, and per-transaction biometrics built directly into workflows.',
    accent: 'from-emerald-400/50 to-cyan-400/20',
  },
  {
    icon: Globe2,
    title: 'Global payout mesh',
    description: 'Wire, SEPA, Faster Payments, ACH, and on-chain rails available in one control plane.',
    accent: 'from-blue-400/40 to-indigo-500/20',
  },
  {
    icon: LineChart,
    title: 'Treasury-grade analytics',
    description: 'Anomaly detection, VaR snapshots, and FX slippage guardrails for finance leads.',
    accent: 'from-purple-400/50 to-pink-400/20',
  },
  {
    icon: CreditCard,
    title: 'Cards and virtual accounts',
    description: 'Spin up programmatic cards with spend policies, approvals, and live controls.',
    accent: 'from-amber-300/60 to-orange-400/20',
  },
  {
    icon: Server,
    title: 'Developer-ready APIs',
    description: 'Idempotent APIs, webhook signing, and observability tuned for modern stacks.',
    accent: 'from-sky-300/60 to-cyan-400/20',
  },
  {
    icon: Radar,
    title: 'Risk intelligence',
    description: 'Real-time sanctions, velocity thresholds, and device fingerprinting baked in.',
    accent: 'from-rose-400/60 to-purple-400/20',
  },
]

const proofPoints = [
  {
    title: '2.3 Million',
    subtitle: 'secure transfers/month',
    tag: 'Scale with confidence',
  },
  {
    title: '12 Regions',
    subtitle: 'active liquidity hubs',
    tag: 'Always-on coverage',
  },
  {
    title: 'N+1',
    subtitle: 'redundant providers',
    tag: 'Zero downtime routing',
  },
]

export function Features() {
  return (
    <section id="features" className="relative overflow-hidden bg-[#05070a] py-24 text-white">
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-blue-500/10 to-transparent" />
      <div className="absolute inset-x-0 top-10 h-40 bg-gradient-to-r from-transparent via-white/5 to-transparent blur-3xl" />

      <div className="relative z-10 mx-auto max-w-7xl px-6">
        <div className="flex flex-col items-center justify-between gap-8 text-center lg:flex-row lg:text-left">
          <div className="space-y-4 max-w-2xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-blue-200">
              Crafted for modern CFOs
            </div>
            <h2 className="text-3xl font-bold md:text-4xl lg:text-5xl">
              Everything you need to orchestrate
              <span className="block bg-gradient-to-r from-blue-300 via-purple-300 to-cyan-200 bg-clip-text text-transparent">
                global money movement.
              </span>
            </h2>
            <p className="text-lg text-gray-300">
              Replace a patchwork of legacy portals with a single command center for payments, cards, and treasury intelligence. Designed to feel premium and built to ship fast.
            </p>
          </div>
          <div className="flex gap-3">
            <div className="h-11 w-11 rounded-2xl border border-white/10 bg-white/5" />
            <div className="h-11 w-11 rounded-2xl border border-white/10 bg-white/5" />
            <div className="h-11 w-11 rounded-2xl border border-white/10 bg-white/5" />
          </div>
        </div>

        <div className="mt-14 grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
          {featureGrid.map((feature) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4 }}
              className="group relative overflow-hidden rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur"
            >
              <div className={`absolute inset-0 opacity-0 blur-3xl transition duration-500 group-hover:opacity-60 bg-gradient-to-br ${feature.accent}`} />
              <div className="relative flex h-12 w-12 items-center justify-center rounded-xl bg-white/10 text-blue-100">
                <feature.icon className="h-5 w-5" />
              </div>
              <h3 className="mt-4 text-xl font-semibold">{feature.title}</h3>
              <p className="mt-2 text-gray-300 leading-relaxed">{feature.description}</p>
              <div className="mt-6 inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs text-blue-100">
                <Zap className="h-3.5 w-3.5" />
                Ready for production teams
              </div>
            </motion.div>
          ))}
        </div>

        <div className="mt-16 grid gap-4 rounded-3xl border border-white/10 bg-gradient-to-br from-white/10 via-[#0b0d12] to-black/70 p-8 shadow-2xl shadow-blue-500/5 backdrop-blur lg:grid-cols-[1.1fr_0.9fr]">
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs text-blue-100">
              <Sparkles className="h-4 w-4" /> Proof you can trust
            </div>
            <h3 className="text-2xl font-semibold md:text-3xl">Numbers that back a premium experience</h3>
            <p className="text-gray-300">
              Our customers rely on Deep Terminal to move capital instantly while maintaining uncompromising governance. Every metric below is monitored in real-time with automated playbooks.
            </p>
            <div className="flex flex-wrap gap-3 text-sm text-gray-300">
              <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1">Dedicated CSM + 24/7 support</span>
              <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1">Segregated funds & multi-sig</span>
              <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1">Tier-1 banking partners</span>
            </div>
          </div>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3 md:gap-3">
            {proofPoints.map((item) => (
              <div key={item.title} className="flex flex-col justify-between rounded-2xl border border-white/10 bg-white/5 p-4">
                <div>
                  <p className="text-xs uppercase tracking-[0.08em] text-blue-200">{item.tag}</p>
                  <h4 className="mt-2 text-3xl font-bold lg:text-4xl">{item.title}</h4>
                </div>
                <p className="mt-6 text-sm text-gray-300">{item.subtitle}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
