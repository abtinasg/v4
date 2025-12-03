'use client'

import Link from 'next/link'
import { Check, ArrowRight } from 'lucide-react'

const plans = [
  {
    name: 'Starter',
    price: '$0',
    period: '/month',
    description: 'Get started for free',
    features: [
      'Basic market overview',
      '5 watchlist symbols',
      '10 AI queries/day',
      'Core metrics access',
    ],
    cta: 'Start Free',
    href: '/sign-up',
    accent: false,
  },
  {
    name: 'Pro',
    price: '$29',
    period: '/month',
    description: 'For active investors',
    features: [
      'Full terminal access',
      'Unlimited watchlist',
      'Unlimited AI queries',
      'All 150+ metrics',
      'Real-time alerts',
      'Priority support',
    ],
    cta: 'Start Pro Trial',
    href: '/sign-up?plan=pro',
    accent: true,
    popular: true,
  },
  {
    name: 'Business',
    price: '$99',
    period: '/month',
    description: 'For professionals',
    features: [
      'Everything in Pro',
      'API access',
      'Advanced analytics',
      'Custom integrations',
      'Dedicated support',
    ],
    cta: 'Contact Sales',
    href: '/contact',
    accent: false,
  },
]

export function PricingPremium() {
  return (
    <section id="pricing" className="relative py-32 bg-[#030407] overflow-hidden">
      {/* Subtle ambient */}
      <div 
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[900px] h-[500px] opacity-30 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse at center, rgba(99, 102, 241, 0.06) 0%, transparent 60%)',
        }}
      />

      <div className="relative z-10 mx-auto max-w-5xl px-6">
        {/* Section Header */}
        <div className="text-center mb-16 space-y-4">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-semibold tracking-tight text-white">
            Simple, transparent pricing
          </h2>
          <p className="text-lg text-[#64748B] font-light max-w-lg mx-auto">
            Start free. Upgrade when you're ready.
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-3 gap-6">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`
                relative rounded-2xl p-8
                ${plan.accent 
                  ? 'bg-gradient-to-b from-[#6366F1]/[0.08] to-transparent border-[#6366F1]/30' 
                  : 'bg-white/[0.01] border-white/[0.04]'
                }
                border
                transition-all duration-300
                hover:border-white/[0.08]
              `}
            >
              {/* Popular badge */}
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className="
                    text-[11px] font-medium text-white
                    px-3 py-1 rounded-full
                    bg-[#6366F1]
                  ">
                    Most Popular
                  </span>
                </div>
              )}

              {/* Plan Header */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-white mb-1">{plan.name}</h3>
                <p className="text-sm text-[#64748B]">{plan.description}</p>
              </div>

              {/* Price */}
              <div className="mb-8">
                <span className="text-4xl font-semibold text-white">{plan.price}</span>
                <span className="text-[#64748B]">{plan.period}</span>
              </div>

              {/* Features */}
              <ul className="space-y-3 mb-8">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-3">
                    <Check className={`h-4 w-4 mt-0.5 flex-shrink-0 ${plan.accent ? 'text-[#6366F1]' : 'text-[#34D399]'}`} />
                    <span className="text-sm text-[#94A3B8]">{feature}</span>
                  </li>
                ))}
              </ul>

              {/* CTA */}
              <Link
                href={plan.href}
                className={`
                  group flex items-center justify-center gap-2
                  w-full rounded-xl py-3
                  text-sm font-medium
                  transition-all duration-200
                  ${plan.accent 
                    ? 'bg-[#6366F1] text-white hover:bg-[#5457E5] hover:shadow-[0_0_24px_rgba(99,102,241,0.25)]' 
                    : 'bg-white/[0.04] border border-white/[0.06] text-white hover:bg-white/[0.06] hover:border-white/[0.10]'
                  }
                `}
              >
                {plan.cta}
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </Link>
            </div>
          ))}
        </div>

        {/* Bottom Note */}
        <p className="text-center text-sm text-[#475569] mt-10">
          All plans include 14-day free trial. No credit card required.
        </p>
      </div>
    </section>
  )
}
