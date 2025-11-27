'use client'

import { motion } from 'framer-motion'
import {
  BrainCircuit,
  ChartCandlestick,
  Layers3,
  LayoutDashboard,
  Radio,
  ScanEye,
  Sparkles,
  Target,
} from 'lucide-react'

const visionStatements = [
  {
    title: 'Give retail investors institutional armor',
    detail: 'Latency-optimized data feeds, explainable AI, and risk guardrails packaged in an elegant UI.',
  },
  {
    title: 'Make discovery, diligence, and execution continuous',
    detail: 'From macro signals to trade journaling, everything stays in sync so conviction compounds.',
  },
  {
    title: 'Blend human instinct with orchestrated AI',
    detail: 'We chain together GPT-4, Claude, internal factor models, and your prompts to co-create decisions.',
  },
]

const productPillars = [
  {
    icon: LayoutDashboard,
    title: 'Pro Terminal',
    description: 'Multi-monitor workspace with depth-of-market, execution routes, and journaling replay.',
    bullets: ['Detachable watch panes', 'Playbook automation', 'Dark & light studio themes'],
  },
  {
    icon: Radio,
    title: 'Realtime Watchlist',
    description: 'Millisecond-level quote diffing, options IV, economic triggers, and sentiment scanners.',
    bullets: ['Smart alerts + SMS', 'Basket risk scoring', 'Chain-aware options surface'],
  },
  {
    icon: BrainCircuit,
    title: 'AI Orchestrator',
    description: 'Chain-of-thought AI that routes prompts across Claude, GPT-4, custom factor bots, and retrieval.',
    bullets: ['Explains outputs', 'Links to data lineage', 'Operates in your bias profile'],
  },
  {
    icon: Layers3,
    title: 'Stock Analyst 150+',
    description: 'DuPont, valuation, quality, growth, efficiency, and technical metrics in one narrative dossier.',
    bullets: ['Auto-grade each metric', 'Highlight anomalies', 'Surface comparable peers'],
  },
]

const aiTimeline = [
  {
    label: 'Signal Graph',
    copy: 'Scrapes macro + micro data, streams market structure, and normalizes fundamentals.',
  },
  {
    label: 'Model Orchestra',
    copy: 'Routes tasks across GPT-4, Claude, Mistral, and proprietary quant stacks to compare reasoning.',
  },
  {
    label: 'Investor Context',
    copy: 'Understands your holdings, risk tolerance, and journaled theses to personalize playbooks.',
  },
  {
    label: 'Action Layer',
    copy: 'Outputs watchlist automations, trade tickets, or long-form research you can audit line-by-line.',
  },
]

const metricHighlights = [
  {
    stat: '150+',
    label: 'Fundamental + technical metrics',
    detail: 'DuPont, efficiency, valuation, growth, liquidity, leverage',
  },
  {
    stat: '18',
    label: 'Curated metric collections',
    detail: 'Income quality, capital discipline, AI momentum, macro exposure',
  },
  {
    stat: '7',
    label: 'DuPont dimensions',
    detail: 'Net profit margin to equity multiplier with live interpretations',
  },
]

export function Features() {
  return (
    <section id="vision" className="relative overflow-hidden bg-[#05070a] py-24 text-white">
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-blue-500/10 to-transparent" />
      <div className="absolute inset-x-0 top-10 h-40 bg-gradient-to-r from-transparent via-white/5 to-transparent blur-3xl" />

      <div className="relative z-10 mx-auto max-w-7xl px-6 space-y-20">
        <div className="space-y-6 text-center lg:text-left" id="vision-manifesto">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-blue-200">
            <Sparkles className="h-4 w-4" /> Our vision
          </div>
          <div className="grid gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
            <div className="space-y-5">
              <h2 className="text-3xl font-bold md:text-4xl lg:text-5xl">
                Designed to feel premium,
                <span className="block bg-gradient-to-r from-blue-300 via-purple-300 to-cyan-200 bg-clip-text text-transparent">
                  built to close the edge gap for retail investors.
                </span>
              </h2>
              <p className="text-lg text-gray-300">
                Everything inside Deep Terminal is engineered so individuals can think like multi-monitor desk traders without the overhead.
              </p>
            </div>
            <div className="grid gap-4">
              {visionStatements.map((item) => (
                <motion.div
                  key={item.title}
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4 }}
                  className="rounded-2xl border border-white/10 bg-white/5 p-5 text-left"
                >
                  <p className="text-sm uppercase tracking-[0.2em] text-blue-200">Manifesto</p>
                  <h3 className="mt-2 text-xl font-semibold">{item.title}</h3>
                  <p className="mt-2 text-sm text-gray-300 leading-relaxed">{item.detail}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-10" id="terminal">
          <div className="flex flex-col gap-4 text-center lg:flex-row lg:items-end lg:justify-between lg:text-left">
            <div>
              <p className="text-sm uppercase tracking-[0.3em] text-blue-200">Platform pillars</p>
              <h3 className="text-3xl font-semibold md:text-4xl">Everything retail investors need to run a desk.</h3>
            </div>
            <p className="text-gray-300 max-w-xl">
              Four product pillars sync together: the pro terminal, realtime watchlist, AI orchestrator, and Stock Analyst 150+ library.
            </p>
          </div>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {productPillars.map((pillar) => (
              <motion.div
                key={pillar.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4 }}
                className="flex h-full flex-col gap-4 rounded-3xl border border-white/10 bg-gradient-to-b from-white/10 via-[#0a0d14] to-black/60 p-5"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10 text-blue-100">
                  <pillar.icon className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="text-xl font-semibold">{pillar.title}</h4>
                  <p className="mt-2 text-sm text-gray-300 leading-relaxed">{pillar.description}</p>
                </div>
                <ul className="mt-auto space-y-2 text-xs text-gray-300">
                  {pillar.bullets.map((bullet) => (
                    <li key={bullet} className="flex items-center gap-2">
                      <span className="h-1 w-1 rounded-full bg-blue-300" />
                      {bullet}
                    </li>
                  ))}
                </ul>
              </motion.div>
            ))}
          </div>
        </div>

        <div className="grid gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:items-center" id="ai">
          <div className="space-y-5">
            <p className="text-sm uppercase tracking-[0.3em] text-purple-200">AI Orchestrator</p>
            <h3 className="text-3xl font-semibold md:text-4xl">
              A conductor that blends multiple AI models with your investor DNA.
            </h3>
            <p className="text-gray-300">
              No single LLM understands the entire market. We run prompts through a signal graph, evaluate multiple models, and reason over the results with your personal guardrails before surfacing an answer.
            </p>
            <div className="grid gap-3 text-sm text-blue-100 md:grid-cols-2">
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <ChartCandlestick className="h-5 w-5 text-blue-200" />
                <p className="mt-2 font-semibold text-white">Quant + narrative fusion</p>
                <p className="text-gray-300 text-xs">Factor models explain what the LLM recommends.</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <ScanEye className="h-5 w-5 text-blue-200" />
                <p className="mt-2 font-semibold text-white">Audit every recommendation</p>
                <p className="text-gray-300 text-xs">Line-by-line citations link back to data lineage.</p>
              </div>
            </div>
          </div>
          <div className="rounded-3xl border border-white/10 bg-gradient-to-br from-white/10 via-[#0b0f16] to-black/60 p-6 shadow-2xl shadow-blue-500/10">
            <div className="text-sm uppercase tracking-[0.2em] text-blue-200">How the orchestra flows</div>
            <div className="mt-6 space-y-5">
              {aiTimeline.map((stage, index) => (
                <div key={stage.label} className="relative rounded-2xl border border-white/10 bg-white/5 p-5">
                  <div className="text-xs text-blue-100">Stage {index + 1}</div>
                  <h4 className="text-lg font-semibold">{stage.label}</h4>
                  <p className="text-sm text-gray-300 leading-relaxed">{stage.copy}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-10" id="metrics">
          <div className="flex flex-col gap-4 text-center lg:flex-row lg:items-center lg:justify-between lg:text-left">
            <div>
              <p className="text-sm uppercase tracking-[0.3em] text-cyan-200">Stock Analyst 150+</p>
              <h3 className="text-3xl font-semibold md:text-4xl">A complete library of metrics with context.</h3>
            </div>
            <p className="text-gray-300 max-w-2xl">
              Our DuPont analysis, factor grades, macro overlays, and efficiency metrics interpret themselves with natural language so you can focus on the trade, not the spreadsheets.
            </p>
          </div>
          <div className="grid gap-6 md:grid-cols-3">
            {metricHighlights.map((metric) => (
              <motion.div
                key={metric.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4 }}
                className="rounded-3xl border border-white/10 bg-white/5 p-6"
              >
                <div className="text-4xl font-bold text-white">{metric.stat}</div>
                <p className="mt-2 text-sm uppercase tracking-[0.2em] text-blue-200">{metric.label}</p>
                <p className="mt-3 text-sm text-gray-300">{metric.detail}</p>
              </motion.div>
            ))}
          </div>
          <div className="rounded-3xl border border-white/10 bg-gradient-to-r from-white/10 via-[#0a0d16] to-black/70 p-6 text-center lg:text-left">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div className="space-y-2">
                <p className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs text-blue-100">
                  <Target className="h-4 w-4" /> Set your own playbooks
                </p>
                <h4 className="text-2xl font-semibold">Align the metrics with your investing style.</h4>
                <p className="text-gray-300">
                  Pin any metric, assign custom weightings, and let the orchestrator coach you when signals drift.
                </p>
              </div>
              <div className="flex flex-wrap gap-3 text-sm text-blue-100">
                <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1">Momentum blends</span>
                <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1">Income stability</span>
                <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1">Capital efficiency</span>
                <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1">AI exposure</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
