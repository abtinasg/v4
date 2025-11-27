'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Check, X, Sparkles, ArrowRight } from 'lucide-react'
import Link from 'next/link'

const plans = [
  {
    name: 'Free Trial',
    description: 'Perfect for getting started',
    monthlyPrice: 0,
    yearlyPrice: 0,
    period: '14 days',
    features: [
      { name: 'Access to 50 metrics', included: true },
      { name: '5 watchlist items', included: true },
      { name: 'Basic charts', included: true },
      { name: 'AI chat (limited)', included: true },
      { name: 'Real-time data', included: false },
      { name: 'Price alerts', included: false },
      { name: 'Advanced charts', included: false },
    ],
    cta: 'Start Free Trial',
    href: '/sign-up',
    popular: false,
    gradient: 'from-gray-500 to-gray-600',
  },
  {
    name: 'Professional',
    description: 'For serious traders',
    monthlyPrice: 29,
    yearlyPrice: 290,
    period: 'month',
    features: [
      { name: '150+ financial metrics', included: true },
      { name: 'Unlimited watchlists', included: true },
      { name: 'Advanced charts', included: true },
      { name: 'Unlimited AI chat', included: true },
      { name: 'Real-time data', included: true },
      { name: 'Price alerts', included: true },
      { name: 'Priority support', included: true },
    ],
    cta: 'Get Started',
    href: '/sign-up',
    popular: true,
    gradient: 'from-blue-500 to-cyan-500',
  },
  {
    name: 'Bloomberg Terminal',
    description: 'The traditional choice',
    monthlyPrice: 2000,
    yearlyPrice: 24000,
    period: 'year',
    features: [
      { name: 'Professional metrics', included: true },
      { name: 'Watchlists', included: true },
      { name: 'Advanced charts', included: true },
      { name: 'Real-time data', included: true },
      { name: 'Dedicated hardware required', included: false, negative: true },
      { name: '2-year minimum contract', included: false, negative: true },
      { name: 'Complex interface', included: false, negative: true },
    ],
    cta: 'Not Recommended',
    href: '#',
    popular: false,
    notRecommended: true,
    gradient: 'from-red-500 to-orange-500',
  },
]

export function Pricing() {
  const [isYearly, setIsYearly] = useState(false)

  return (
    <section className="relative py-24 overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-[#0a0a0a]" />
      <div className="absolute inset-0 bg-gradient-to-t from-blue-500/5 via-transparent to-transparent" />
      
      {/* Radial gradient */}
      <div 
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full"
        style={{
          background: 'radial-gradient(circle, rgba(59, 130, 246, 0.08) 0%, transparent 70%)',
        }}
      />

      <div className="relative z-10 max-w-7xl mx-auto px-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 backdrop-blur-sm mb-6"
          >
            <Sparkles className="w-4 h-4 text-blue-400" />
            <span className="text-sm text-gray-300">Simple Pricing</span>
          </motion.div>

          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4">
            <span className="text-white">Save </span>
            <span className="bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent">
              99.9%
            </span>
            <span className="text-white"> vs Bloomberg</span>
          </h2>

          <p className="text-lg text-gray-400 max-w-2xl mx-auto mb-8">
            Get the same professional tools Wall Street uses, without the Wall Street price tag.
          </p>

          {/* Billing Toggle */}
          <div className="inline-flex items-center gap-4 p-1.5 rounded-full bg-white/5 border border-white/10">
            <button
              onClick={() => setIsYearly(false)}
              className={`px-6 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
                !isYearly
                  ? 'bg-white text-black'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setIsYearly(true)}
              className={`px-6 py-2 rounded-full text-sm font-medium transition-all duration-300 flex items-center gap-2 ${
                isYearly
                  ? 'bg-white text-black'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              Yearly
              <span className={`text-xs px-2 py-0.5 rounded-full ${
                isYearly ? 'bg-green-500 text-white' : 'bg-green-500/20 text-green-400'
              }`}>
                Save 17%
              </span>
            </button>
          </div>
        </motion.div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-4 items-start">
          {plans.map((plan, index) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className={`relative ${plan.popular ? 'lg:-mt-4 lg:mb-4' : ''}`}
            >
              {/* Popular Badge */}
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 z-20">
                  <div className="px-4 py-1.5 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full text-sm font-semibold text-white shadow-lg shadow-blue-500/25">
                    Most Popular
                  </div>
                </div>
              )}

              {/* Not Recommended Badge */}
              {plan.notRecommended && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 z-20">
                  <div className="px-4 py-1.5 bg-gradient-to-r from-red-500 to-orange-500 rounded-full text-sm font-semibold text-white shadow-lg shadow-red-500/25">
                    Not Recommended
                  </div>
                </div>
              )}

              {/* Card */}
              <div
                className={`relative h-full p-6 lg:p-8 rounded-2xl border backdrop-blur-sm transition-all duration-300 ${
                  plan.popular
                    ? 'bg-white/[0.08] border-blue-500/30 shadow-2xl shadow-blue-500/10'
                    : plan.notRecommended
                    ? 'bg-white/[0.03] border-red-500/20 opacity-75'
                    : 'bg-white/[0.03] border-white/[0.08] hover:bg-white/[0.05] hover:border-white/[0.15]'
                }`}
              >
                {/* Plan Name */}
                <div className="mb-6">
                  <h3 className={`text-xl font-semibold mb-2 ${
                    plan.notRecommended ? 'text-gray-400' : 'text-white'
                  }`}>
                    {plan.name}
                  </h3>
                  <p className="text-sm text-gray-500">{plan.description}</p>
                </div>

                {/* Price */}
                <div className="mb-6">
                  {plan.notRecommended ? (
                    <div className="flex items-baseline gap-2">
                      <span className="text-4xl font-bold text-gray-500 line-through">
                        ${plan.yearlyPrice.toLocaleString()}
                      </span>
                      <span className="text-gray-600">/year</span>
                    </div>
                  ) : (
                    <div className="flex items-baseline gap-2">
                      <span className="text-4xl font-bold text-white">
                        ${isYearly && plan.yearlyPrice > 0 ? plan.yearlyPrice : plan.monthlyPrice}
                      </span>
                      <span className="text-gray-400">
                        /{plan.monthlyPrice === 0 ? plan.period : isYearly ? 'year' : 'month'}
                      </span>
                    </div>
                  )}

                  {/* Savings badge for Professional */}
                  {plan.popular && (
                    <div className="mt-2 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-green-500/10 border border-green-500/20">
                      <span className="text-xs font-medium text-green-400">
                        Save $23,710/year vs Bloomberg
                      </span>
                    </div>
                  )}
                </div>

                {/* Features */}
                <ul className="space-y-3 mb-8">
                  {plan.features.map((feature) => (
                    <li key={feature.name} className="flex items-start gap-3">
                      {feature.included ? (
                        <div className={`mt-0.5 w-5 h-5 rounded-full flex items-center justify-center ${
                          plan.popular ? 'bg-blue-500/20' : 'bg-white/10'
                        }`}>
                          <Check className={`w-3 h-3 ${
                            plan.popular ? 'text-blue-400' : 'text-gray-400'
                          }`} />
                        </div>
                      ) : (
                        <div className="mt-0.5 w-5 h-5 rounded-full bg-red-500/10 flex items-center justify-center">
                          <X className="w-3 h-3 text-red-400" />
                        </div>
                      )}
                      <span className={`text-sm ${
                        feature.included 
                          ? plan.notRecommended ? 'text-gray-500' : 'text-gray-300'
                          : 'text-gray-500'
                      } ${feature.negative ? 'line-through' : ''}`}>
                        {feature.name}
                      </span>
                    </li>
                  ))}
                </ul>

                {/* CTA Button */}
                {plan.notRecommended ? (
                  <button
                    disabled
                    className="w-full py-3 rounded-xl bg-white/5 border border-white/10 text-gray-500 font-medium cursor-not-allowed"
                  >
                    {plan.cta}
                  </button>
                ) : (
                  <Link
                    href={plan.href}
                    className={`group w-full py-3 rounded-xl font-medium transition-all duration-300 flex items-center justify-center gap-2 ${
                      plan.popular
                        ? 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white hover:shadow-lg hover:shadow-blue-500/25 hover:scale-[1.02]'
                        : 'bg-white/10 text-white hover:bg-white/15 border border-white/10'
                    }`}
                  >
                    {plan.cta}
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </Link>
                )}
              </div>
            </motion.div>
          ))}
        </div>

        {/* Bottom Note */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="text-center mt-12"
        >
          <p className="text-gray-500 text-sm">
            All plans include a 14-day money-back guarantee. No questions asked.
          </p>
          <div className="flex items-center justify-center gap-6 mt-4 text-xs text-gray-600">
            <span className="flex items-center gap-1">
              <Check className="w-3 h-3 text-green-500" />
              No credit card required
            </span>
            <span className="flex items-center gap-1">
              <Check className="w-3 h-3 text-green-500" />
              Cancel anytime
            </span>
            <span className="flex items-center gap-1">
              <Check className="w-3 h-3 text-green-500" />
              Instant access
            </span>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
