'use client'

import { motion } from 'framer-motion'
import { useInView } from 'framer-motion'
import { useRef } from 'react'
import { BarChart3, CircuitBoard, Globe2, Lock, Radar, Sparkles, Workflow } from 'lucide-react'

const features = [
  {
    icon: BarChart3,
    title: 'Executive dashboards',
    description: 'Precision reporting for liquidity, risk, and performance across every corridor.',
    gradient: 'from-indigo-500 to-cyan-400',
  },
  {
    icon: Sparkles,
    title: 'Cognitive copilots',
    description: 'Contextual AI that writes memos, stress tests scenarios, and drafts board-ready summaries.',
    gradient: 'from-purple-500 to-pink-500',
  },
  {
    icon: Radar,
    title: 'Live market sensing',
    description: 'Latency-optimized feeds with anomaly detection and automated watch conditions.',
    gradient: 'from-emerald-500 to-teal-400',
  },
  {
    icon: Workflow,
    title: 'Programmable treasury',
    description: 'Compose approvals, reconciliations, and payouts through policy-driven workflows.',
    gradient: 'from-blue-500 to-indigo-400',
  },
  {
    icon: Globe2,
    title: 'Global coverage',
    description: 'Multi-currency rails, instant card issuing, and FX with transparent spreads.',
    gradient: 'from-cyan-500 to-sky-400',
  },
  {
    icon: Lock,
    title: 'Zero-trust security',
    description: 'Per-transaction encryption, audit trails, and SOC2/ISO27001 baked in by default.',
    gradient: 'from-amber-500 to-orange-500',
  },
  {
    icon: CircuitBoard,
    title: 'Developer-first',
    description: 'Typed SDKs, webhooks, and observability so engineers can ship revenue faster.',
    gradient: 'from-pink-500 to-rose-400',
  },
]

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: 'easeOut',
    },
  },
}

export function Features() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: '-100px' })

  return (
    <section id="features" className="relative py-28 overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_10%_10%,rgba(129,140,248,0.06),transparent_40%),radial-gradient(circle_at_80%_30%,rgba(14,165,233,0.08),transparent_45%),linear-gradient(to_bottom,rgba(255,255,255,0.02),transparent)]" />

      <div className="relative z-10 max-w-7xl mx-auto px-6 space-y-14">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="grid lg:grid-cols-[1.1fr_0.9fr] gap-8 items-center"
        >
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-sm text-gray-200 backdrop-blur-sm">
              <Sparkles className="w-4 h-4 text-indigo-300" />
              Fintech OS for leaders
            </div>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold leading-tight">
              The premium stack for modern treasury teams.
            </h2>
            <p className="text-lg text-gray-300 max-w-2xl">
              Orchestrate funding, compliance, and intelligence in one place. Every interaction is tuned for clarity, speed, and delight.
            </p>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {['Realtime ledgers', 'SOC2 / ISO27001', 'AI-investor briefs', 'Programmable approvals', 'Instant FX', 'Audit-grade exports'].map((item) => (
                <div key={item} className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs text-gray-200">
                  {item}
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl shadow-2xl shadow-indigo-900/30">
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm text-gray-300">Experience the console</p>
              <span className="text-xs px-3 py-1 rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-400/30">Live</span>
            </div>
            <div className="space-y-4">
              <div className="rounded-xl border border-white/10 bg-gradient-to-r from-indigo-600/20 via-purple-600/10 to-cyan-500/20 p-4">
                <div className="flex items-center justify-between text-sm text-white/80 mb-2">
                  <span>Asset allocation</span>
                  <span className="text-emerald-300">+$1.4M</span>
                </div>
                <div className="h-3 w-full rounded-full bg-white/10 overflow-hidden">
                  <div className="h-full w-[72%] rounded-full bg-gradient-to-r from-indigo-500 to-cyan-400" />
                </div>
                <p className="mt-2 text-xs text-gray-300">AI suggests rebalancing APAC growth by 4.2%.</p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-xl border border-white/10 bg-white/5 p-3">
                  <div className="text-xs text-gray-400 mb-1">Compliance pulse</div>
                  <div className="text-xl font-semibold">99.3%</div>
                  <div className="text-xs text-emerald-400">No incidents in 180 days</div>
                </div>
                <div className="rounded-xl border border-white/10 bg-white/5 p-3">
                  <div className="text-xs text-gray-400 mb-1">Latency</div>
                  <div className="text-xl font-semibold">38 ms</div>
                  <div className="text-xs text-gray-400">Edge routed in 18 regions</div>
                </div>
              </div>

              <div className="rounded-xl border border-white/10 bg-white/5 p-3 flex items-center justify-between">
                <div>
                  <div className="text-sm font-semibold">Global treasury mesh</div>
                  <p className="text-xs text-gray-400">Coverage across 140+ markets with dynamic hedging.</p>
                </div>
                <div className="px-3 py-1 rounded-full bg-white/10 text-xs text-gray-200">See routing</div>
              </div>
            </div>
          </div>
        </motion.div>

        <motion.div
          ref={ref}
          variants={containerVariants}
          initial="hidden"
          animate={isInView ? 'visible' : 'hidden'}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {features.map((feature) => (
            <motion.div key={feature.title} variants={itemVariants} className="group relative">
              <div className="relative h-full p-6 rounded-2xl bg-white/[0.04] border border-white/[0.08] backdrop-blur-sm transition-all duration-300 hover:bg-white/[0.06] hover:border-white/[0.15] hover:shadow-2xl hover:shadow-indigo-500/10">
                <div className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${feature.gradient} opacity-0 group-hover:opacity-10 transition-opacity duration-300 blur-xl`} />

                <div className="relative z-10 space-y-3">
                  <div className={`inline-flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br ${feature.gradient} shadow-lg shadow-indigo-900/30`}>
                    <feature.icon className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold text-white">{feature.title}</h3>
                  <p className="text-gray-300 text-sm leading-relaxed">{feature.description}</p>
                </div>

                <div className="absolute top-3 right-3 text-[10px] uppercase tracking-wide text-white/40">Premier</div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}
