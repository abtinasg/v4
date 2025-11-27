'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { ArrowRight, Check, Crown, Sparkles, ShieldCheck } from 'lucide-react'
import Link from 'next/link'

const plans = [
  {
    name: 'Growth',
    description: 'Everything teams need to launch premium payment experiences.',
    monthlyPrice: 49,
    yearlyPrice: 490,
    perks: ['All payment rails', 'AI anomaly guard', 'Dedicated CSM', 'Treasury dashboards'],
    accent: 'from-blue-500 to-purple-500',
    highlight: 'Most loved',
  },
  {
    name: 'Enterprise',
    description: 'Security, compliance, and custom throughput for global fintechs.',
    monthlyPrice: 0,
    yearlyPrice: 0,
    perks: ['Custom corridors', 'Premium SLAs', 'On-site onboarding', 'Security reviews'],
    accent: 'from-emerald-500 to-cyan-500',
    highlight: 'White-glove',
    custom: true,
  },
]

export function Pricing() {
  const [isYearly, setIsYearly] = useState(true)

  return (
    <section className="relative overflow-hidden bg-[#05070a] py-24 text-white">
      <div className="absolute inset-0 bg-gradient-to-t from-purple-500/10 via-transparent to-transparent" />
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-blue-500/40 to-transparent" />

      <div className="relative z-10 mx-auto flex max-w-6xl flex-col gap-12 px-6 text-center">
        <div className="space-y-4">
          <div className="mx-auto inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-blue-200">
            <Crown className="h-4 w-4" /> Transparent, premium pricing
          </div>
          <h2 className="text-3xl font-bold md:text-4xl lg:text-5xl">
            Choose a plan built for
            <span className="block bg-gradient-to-r from-blue-300 via-purple-300 to-cyan-200 bg-clip-text text-transparent">
              world-class money teams.
            </span>
          </h2>
          <p className="text-lg text-gray-300">
            Start with Growth to launch in days, or partner with us for enterprise-grade corridors and controls.
          </p>
          <div className="mx-auto flex items-center justify-center gap-4 rounded-full border border-white/10 bg-white/5 p-1.5 text-sm text-gray-200 w-fit">
            <button
              onClick={() => setIsYearly(false)}
              className={`rounded-full px-6 py-2 transition ${!isYearly ? 'bg-white text-black shadow' : 'hover:text-white/80'}`}
            >
              Monthly
            </button>
            <button
              onClick={() => setIsYearly(true)}
              className={`rounded-full px-6 py-2 transition ${isYearly ? 'bg-white text-black shadow' : 'hover:text-white/80'}`}
            >
              Yearly <span className="ml-2 rounded-full bg-emerald-500/20 px-2 py-0.5 text-xs text-emerald-300">Save 2 months</span>
            </button>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {plans.map((plan, index) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-b from-white/10 via-black/40 to-black/80 p-8 text-left shadow-2xl backdrop-blur"
            >
              <div className={`absolute inset-0 opacity-60 bg-gradient-to-br ${plan.accent} blur-3xl`} />
              <div className="relative flex items-start justify-between">
                <div className="space-y-2">
                  <p className="text-xs uppercase tracking-[0.16em] text-blue-100">{plan.highlight}</p>
                  <h3 className="text-2xl font-semibold">{plan.name}</h3>
                  <p className="text-gray-300">{plan.description}</p>
                </div>
                <div className="rounded-full border border-white/15 bg-white/5 px-3 py-1 text-xs text-white">Premium</div>
              </div>

              <div className="relative mt-6 flex items-baseline gap-2 text-4xl font-bold">
                {plan.custom ? (
                  <span className="text-3xl text-gray-100">Custom</span>
                ) : (
                  <>
                    <span>${isYearly ? plan.yearlyPrice : plan.monthlyPrice}</span>
                    <span className="text-sm font-medium text-gray-400">/{isYearly ? 'year' : 'month'}</span>
                  </>
                )}
              </div>

              <div className="relative mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
                {plan.perks.map((perk) => (
                  <div key={perk} className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 p-3 text-sm text-gray-100">
                    <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-white/10">
                      <Check className="h-4 w-4 text-emerald-300" />
                    </span>
                    <span>{perk}</span>
                  </div>
                ))}
              </div>

              <div className="relative mt-6 flex flex-wrap gap-2 text-xs text-blue-100">
                <span className="rounded-full bg-white/10 px-3 py-1">SOC2 + PCI-DSS</span>
                <span className="rounded-full bg-white/10 px-3 py-1">Settlement SLAs</span>
                <span className="rounded-full bg-white/10 px-3 py-1">Audit-ready exports</span>
              </div>

              <div className="relative mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
                {plan.custom ? (
                  <Link
                    href="/contact"
                    className="group inline-flex items-center justify-center gap-2 rounded-2xl border border-white/20 bg-white/10 px-6 py-3 text-sm font-semibold text-white transition hover:border-white/30 hover:bg-white/15"
                  >
                    Talk to sales
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </Link>
                ) : (
                  <Link
                    href="/sign-up"
                    className="group inline-flex items-center justify-center gap-2 rounded-2xl bg-white px-6 py-3 text-sm font-semibold text-black transition hover:scale-[1.01]"
                  >
                    Start now
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </Link>
                )}
                <div className="flex items-center gap-2 text-sm text-gray-300">
                  <ShieldCheck className="h-4 w-4 text-emerald-300" />
                  14-day risk-free onboarding
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
