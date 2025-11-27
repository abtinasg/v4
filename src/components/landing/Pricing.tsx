'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { Check, Zap, Crown, Building2 } from 'lucide-react'

const plans = [
  {
    name: 'Free',
    price: '$0',
    description: 'Perfect for exploring the platform',
    icon: Zap,
    color: '#00D4FF',
    features: [
      'Basic market overview',
      '5 watchlist symbols',
      'Limited AI queries (10/day)',
      'Core metrics access',
      'Community support'
    ],
    cta: 'Get Started',
    href: '/sign-up',
    popular: false
  },
  {
    name: 'Pro',
    price: '$29',
    period: '/month',
    description: 'For serious retail traders',
    icon: Crown,
    color: '#8B5CF6',
    features: [
      'Full terminal access',
      'Unlimited watchlist symbols',
      'Unlimited AI queries',
      'All 150+ metrics',
      'Real-time alerts',
      'Priority support',
      'Custom dashboards'
    ],
    cta: 'Start Pro Trial',
    href: '/sign-up?plan=pro',
    popular: true
  },
  {
    name: 'Terminal+',
    price: '$99',
    period: '/month',
    description: 'Institutional-grade power',
    icon: Building2,
    color: '#2DD4BF',
    features: [
      'Everything in Pro',
      'Multi-model AI orchestration',
      'Advanced technical analysis',
      'API access',
      'Custom model training',
      'Dedicated account manager',
      'SLA guarantee'
    ],
    cta: 'Contact Sales',
    href: '/contact',
    popular: false
  }
]

export function Pricing() {
  return (
    <section className="relative py-24 md:py-32 bg-[#05070B] overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1200px] h-[600px] bg-[radial-gradient(ellipse_50%_50%_at_50%_50%,rgba(139,92,246,0.05),transparent)]" />
      </div>

      <div className="relative mx-auto max-w-7xl px-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 rounded-full border border-[#8B5CF6]/20 bg-[#8B5CF6]/[0.06] px-4 py-1.5 text-xs font-medium text-[#8B5CF6] mb-6">
            <Crown className="h-3.5 w-3.5" />
            Pricing
          </div>

          <h2 className="text-display text-3xl md:text-4xl lg:text-5xl text-white mb-4">
            Choose Your{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00D4FF] via-[#3B82F6] to-[#8B5CF6]">
              Edge
            </span>
          </h2>

          <p className="text-subhead text-gray-400 max-w-xl mx-auto">
            From casual exploration to institutional power—pick the plan that matches your ambition.
          </p>
        </motion.div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-3 gap-6 lg:gap-8">
          {plans.map((plan, i) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-50px' }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className={`relative rounded-2xl border ${plan.popular ? 'border-[#8B5CF6]/40' : 'border-white/[0.05]'} bg-[#0A0D12]/80 backdrop-blur-xl overflow-hidden`}
            >
              {/* Popular badge */}
              {plan.popular && (
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#8B5CF6] via-[#00D4FF] to-[#8B5CF6]" />
              )}

              {/* Glow for popular */}
              {plan.popular && (
                <div className="absolute inset-0 bg-gradient-to-br from-[#8B5CF6]/[0.08] via-transparent to-[#00D4FF]/[0.05] pointer-events-none" />
              )}

              <div className="relative p-8">
                {/* Header */}
                <div className="flex items-start justify-between mb-6">
                  <div>
                    <div 
                      className="h-11 w-11 rounded-xl flex items-center justify-center mb-4"
                      style={{ background: `linear-gradient(135deg, ${plan.color}20, ${plan.color}08)` }}
                    >
                      <plan.icon className="h-5 w-5" style={{ color: plan.color }} />
                    </div>
                    <h3 className="text-xl font-semibold text-white">{plan.name}</h3>
                    <p className="text-sm text-gray-500 mt-1">{plan.description}</p>
                  </div>
                  {plan.popular && (
                    <span className="text-xs font-medium text-[#8B5CF6] bg-[#8B5CF6]/10 px-2.5 py-1 rounded-full">
                      Popular
                    </span>
                  )}
                </div>

                {/* Price */}
                <div className="mb-6">
                  <span className="text-4xl font-semibold text-white">{plan.price}</span>
                  {plan.period && <span className="text-gray-500">{plan.period}</span>}
                </div>

                {/* Features */}
                <ul className="space-y-3 mb-8">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-3">
                      <Check className="h-4 w-4 mt-0.5 flex-shrink-0" style={{ color: plan.color }} />
                      <span className="text-sm text-gray-400">{feature}</span>
                    </li>
                  ))}
                </ul>

                {/* CTA */}
                <Link
                  href={plan.href}
                  className={`block w-full text-center rounded-xl py-3.5 text-sm font-semibold transition-all duration-300 ${
                    plan.popular
                      ? 'bg-gradient-to-r from-[#8B5CF6] to-[#00D4FF] text-white hover:shadow-[0_0_30px_rgba(139,92,246,0.3)] hover:scale-[1.02]'
                      : 'border border-white/[0.08] bg-white/[0.02] text-white hover:border-white/[0.15] hover:bg-white/[0.05]'
                  }`}
                >
                  {plan.cta}
                </Link>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Bottom note */}
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.5 }}
          className="text-center text-sm text-gray-600 mt-10"
        >
          All plans include 14-day free trial. No credit card required.
        </motion.p>
      </div>
    </section>
  )
}
