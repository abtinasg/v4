'use client'

import Link from 'next/link'
import { Check, Sparkles } from 'lucide-react'

const plans = [
  {
    name: 'Free',
    price: '0',
    description: 'Perfect for getting started',
    credits: '50 credits',
    features: [
      '50 credits on signup',
      'Basic market overview',
      '5 watchlist symbols',
      'Core metrics access',
      'Community support',
    ],
    cta: 'Get started',
    href: '/sign-up',
    featured: false,
  },
  {
    name: 'Pro',
    price: '29',
    description: 'For serious investors',
    credits: '500 credits/mo',
    features: [
      '500 credits per month',
      'All 432 metrics',
      'Unlimited watchlist',
      'AI-powered reports',
      'Real-time alerts',
      'Priority support',
      'API access',
    ],
    cta: 'Start Pro trial',
    href: '/sign-up?plan=pro',
    featured: true,
  },
  {
    name: 'Enterprise',
    price: 'Custom',
    description: 'For teams and institutions',
    credits: 'Unlimited',
    features: [
      'Unlimited credits',
      'Everything in Pro',
      'Team collaboration',
      'Custom integrations',
      'Dedicated account manager',
      'SLA guarantee',
      'On-premise option',
    ],
    cta: 'Contact sales',
    href: '/contact',
    featured: false,
  },
]

export function Pricing() {
  return (
    <section id="pricing" className="relative py-32 bg-[#09090B]">
      {/* Section border */}
      <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />

      <div className="mx-auto max-w-6xl px-6">
        {/* Header */}
        <div className="text-center mb-16">
          <p className="text-[13px] font-medium text-blue-400 uppercase tracking-wider mb-4">
            Pricing
          </p>
          <h2 className="text-4xl md:text-5xl font-bold text-white tracking-tight mb-6">
            Simple, credit-based
            <br />
            <span className="text-zinc-500">pricing</span>
          </h2>
          <p className="text-lg text-zinc-400 max-w-xl mx-auto">
            Start free, upgrade when you need more power.
          </p>
        </div>

        {/* Plans */}
        <div className="grid md:grid-cols-3 gap-6 lg:gap-8">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`relative rounded-2xl p-8 ${
                plan.featured
                  ? 'bg-gradient-to-b from-blue-500/10 to-transparent border-2 border-blue-500/30'
                  : 'bg-white/[0.02] border border-white/[0.06]'
              }`}
            >
              {plan.featured && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500 text-white text-xs font-medium">
                    <Sparkles className="h-3 w-3" />
                    Most popular
                  </div>
                </div>
              )}

              <div className="mb-6">
                <h3 className="text-lg font-semibold text-white mb-1">{plan.name}</h3>
                <p className="text-sm text-zinc-500">{plan.description}</p>
              </div>

              <div className="mb-6">
                <div className="flex items-baseline gap-1">
                  {plan.price !== 'Custom' && <span className="text-zinc-500">$</span>}
                  <span className="text-4xl font-bold text-white">{plan.price}</span>
                  {plan.price !== 'Custom' && plan.price !== '0' && (
                    <span className="text-zinc-500">/mo</span>
                  )}
                </div>
                <p className="text-sm text-zinc-400 mt-1">{plan.credits}</p>
              </div>

              <ul className="space-y-3 mb-8">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-3">
                    <Check className={`h-5 w-5 flex-shrink-0 ${plan.featured ? 'text-blue-400' : 'text-zinc-500'}`} />
                    <span className="text-sm text-zinc-400">{feature}</span>
                  </li>
                ))}
              </ul>

              <Link
                href={plan.href}
                className={`block w-full text-center py-3 rounded-xl text-[14px] font-medium transition-all ${
                  plan.featured
                    ? 'bg-blue-500 hover:bg-blue-400 text-white'
                    : 'bg-white/5 hover:bg-white/10 text-white border border-white/10'
                }`}
              >
                {plan.cta}
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
