'use client'

import Link from 'next/link'
import { Check, Sparkles, Zap, Crown, Building2, Gift } from 'lucide-react'

const plans = [
  {
    name: 'Free',
    price: '0',
    credits: '70',
    creditsLabel: 'credits on signup',
    description: 'Perfect for exploring the platform',
    icon: Gift,
    color: '#5B7CFF',
    features: [
      '70 credits on signup',
      'Monthly credit recharge',
      'Basic market overview',
      '5 watchlist symbols',
      'Core metrics access',
      'Community support'
    ],
    cta: 'Start Free',
    href: '/sign-up',
    popular: false
  },
  {
    name: 'Pro',
    credits: '500',
    creditsLabel: 'credits/month',
    price: '29',
    description: 'For serious retail investors',
    icon: Crown,
    color: '#8B5CF6',
    features: [
      '500 credits/month',
      'Full terminal access',
      'Unlimited watchlist symbols',
      'All 150+ metrics',
      'Real-time alerts',
      'Priority support',
      'Custom dashboards'
    ],
    cta: 'Start Pro',
    href: '/sign-up?plan=pro',
    popular: true
  },
  {
    name: 'Terminal+',
    credits: '2000',
    creditsLabel: 'credits/month',
    price: '99',
    description: 'Institutional-grade power',
    icon: Building2,
    color: '#22C55E',
    features: [
      '2000 credits/month',
      'Everything in Pro',
      'Multi-model AI orchestration',
      'Advanced technical analysis',
      'API access',
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
    <section id="pricing" className="relative py-28 md:py-36 bg-[#030508] overflow-hidden">
      {/* Premium ambient background */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-px bg-gradient-to-r from-transparent via-white/[0.06] to-transparent" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1200px] h-[600px] bg-[radial-gradient(ellipse_50%_50%_at_50%_50%,rgba(139,92,246,0.06),transparent)]" />
      </div>

      <div className="relative mx-auto max-w-7xl px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-20">
          <div className="inline-flex items-center gap-2 rounded-full border border-[#8B5CF6]/20 bg-[#8B5CF6]/[0.06] px-5 py-2 text-sm font-medium text-[#8B5CF6] mb-8">
            <Sparkles className="h-4 w-4" />
            Credit-Based Pricing
          </div>

          <h2 className="text-4xl md:text-5xl lg:text-6xl font-semibold tracking-tight text-white mb-6">
            Choose Your{' '}
            <span className="bg-gradient-to-r from-[#5B7CFF] via-[#00C9E4] to-[#8B5CF6] bg-clip-text text-transparent">
              Plan
            </span>
          </h2>

          <p className="text-lg md:text-xl text-gray-400 max-w-xl mx-auto leading-relaxed font-light">
            Start free with 70 credits. Upgrade anytime for more power and features.
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-3 gap-6 lg:gap-8">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`relative rounded-2xl border ${
                plan.popular ? 'border-[#8B5CF6]/40' : 'border-white/[0.06]'
              } bg-gradient-to-b from-white/[0.04] to-white/[0.01] backdrop-blur-xl overflow-hidden transition-all duration-300 hover:border-white/[0.12]`}
            >
              {/* Popular badge line */}
              {plan.popular && (
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#8B5CF6] via-[#00C9E4] to-[#8B5CF6]" />
              )}

              {/* Glow for popular */}
              {plan.popular && (
                <div className="absolute inset-0 bg-gradient-to-br from-[#8B5CF6]/[0.08] via-transparent to-[#00C9E4]/[0.05] pointer-events-none" />
              )}

              <div className="relative p-8">
                {/* Header */}
                <div className="flex items-start justify-between mb-6">
                  <div>
                    <div
                      className="h-12 w-12 rounded-xl flex items-center justify-center mb-4"
                      style={{ background: `linear-gradient(135deg, ${plan.color}25, ${plan.color}10)` }}
                    >
                      <plan.icon className="h-6 w-6" style={{ color: plan.color }} />
                    </div>
                    <h3 className="text-xl font-semibold text-white">{plan.name}</h3>
                    <p className="text-sm text-gray-500 mt-1">{plan.description}</p>
                  </div>
                  {plan.popular && (
                    <span className="text-xs font-medium text-[#8B5CF6] bg-[#8B5CF6]/10 px-3 py-1.5 rounded-full">
                      Most Popular
                    </span>
                  )}
                </div>

                {/* Credits */}
                <div className="mb-2">
                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl font-bold" style={{ color: plan.color }}>
                      {plan.credits}
                    </span>
                    <span className="text-gray-400 text-sm ml-1">{plan.creditsLabel}</span>
                  </div>
                </div>

                {/* Price */}
                <div className="mb-8 pb-6 border-b border-white/[0.06]">
                  <span className="text-2xl font-semibold text-white">${plan.price}</span>
                  {plan.price !== '0' && <span className="text-gray-500">/month</span>}
                </div>

                {/* Features */}
                <ul className="space-y-4 mb-8">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-3">
                      <Check className="h-5 w-5 mt-0.5 flex-shrink-0" style={{ color: plan.color }} />
                      <span className="text-sm text-gray-400">{feature}</span>
                    </li>
                  ))}
                </ul>

                {/* CTA */}
                <Link
                  href={plan.href}
                  className={`block w-full text-center rounded-xl py-4 text-sm font-semibold transition-all duration-300 ${
                    plan.popular
                      ? 'bg-gradient-to-r from-[#8B5CF6] to-[#00C9E4] text-white hover:shadow-[0_0_30px_rgba(139,92,246,0.3)] hover:scale-[1.02]'
                      : 'border border-white/[0.08] bg-white/[0.02] text-white hover:border-white/[0.15] hover:bg-white/[0.05]'
                  }`}
                >
                  {plan.cta}
                </Link>
              </div>
            </div>
          ))}
        </div>

        {/* Bottom note */}
        <div className="text-center mt-12">
          <div className="inline-flex items-center gap-3 rounded-full border border-white/[0.06] bg-white/[0.02] px-6 py-3">
            <Zap className="h-4 w-4 text-[#5B7CFF]" />
            <span className="text-sm text-gray-400">
              All users receive <span className="text-white font-medium">70 free credits</span> on signup + monthly recharge
            </span>
          </div>
        </div>
      </div>
    </section>
  )
}
