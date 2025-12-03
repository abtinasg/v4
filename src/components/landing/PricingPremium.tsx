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
    <section id="pricing" className="relative py-20 bg-[#030407] overflow-hidden">
      {/* Subtle ambient */}
      <div 
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[500px] opacity-40 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse at center, rgba(99, 102, 241, 0.08) 0%, transparent 60%)',
        }}
      />

      <div className="relative z-10 mx-auto max-w-5xl px-6">
        {/* Section Header - Compact */}
        <div className="text-center mb-12 space-y-3">
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-white">
            Simple, transparent pricing
          </h2>
          <p className="text-base text-[#64748B] max-w-md mx-auto">
            Start free. Upgrade when you're ready.
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-3 gap-4">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className="relative rounded-xl overflow-hidden"
              style={{
                boxShadow: plan.accent 
                  ? '0 16px 48px rgba(99,102,241,0.15), 0 0 0 1px rgba(99,102,241,0.2)' 
                  : '0 8px 32px rgba(0,0,0,0.3)',
              }}
            >
              {/* Gradient border ring for Pro */}
              {plan.accent && (
                <div 
                  className="absolute -inset-[1px] rounded-xl pointer-events-none"
                  style={{
                    background: 'linear-gradient(135deg, rgba(99,102,241,0.5) 0%, rgba(139,92,246,0.3) 50%, rgba(34,211,238,0.3) 100%)',
                  }}
                />
              )}
              
              <div className={`
                relative h-full p-6
                ${plan.accent 
                  ? 'bg-[#0C1017]' 
                  : 'bg-[#0A0D12]/90 border border-white/[0.06]'
                }
                backdrop-blur-[4px]
              `}>
                {/* Popular badge - Darker */}
                {plan.popular && (
                  <div className="absolute -top-0 right-4">
                    <span className="
                      text-[10px] font-bold text-white uppercase tracking-wider
                      px-3 py-1.5 rounded-b-lg
                      bg-gradient-to-r from-[#6366F1] to-[#818CF8]
                      shadow-[0_4px_12px_rgba(99,102,241,0.3)]
                    ">
                      Popular
                    </span>
                  </div>
                )}

                {/* Plan Header */}
                <div className="mb-5">
                  <h3 className="text-lg font-bold text-white mb-0.5">{plan.name}</h3>
                  <p className="text-xs text-[#64748B]">{plan.description}</p>
                </div>

                {/* Price */}
                <div className="mb-6">
                  <span className="text-4xl font-bold text-white">{plan.price}</span>
                  <span className="text-sm text-[#64748B]">{plan.period}</span>
                </div>

                {/* Features */}
                <ul className="space-y-2.5 mb-6">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-2.5">
                      <Check className={`h-4 w-4 mt-0.5 flex-shrink-0 ${plan.accent ? 'text-[#818CF8]' : 'text-[#34D399]'}`} />
                      <span className="text-sm text-[#94A3B8]">{feature}</span>
                    </li>
                  ))}
                </ul>

                {/* CTA */}
                <Link
                  href={plan.href}
                  className={`
                    group flex items-center justify-center gap-2
                    w-full rounded-lg py-2.5
                    text-sm font-semibold
                    transition-all duration-200
                    ${plan.accent 
                      ? 'bg-gradient-to-r from-[#6366F1] to-[#818CF8] text-white hover:shadow-[0_0_24px_rgba(99,102,241,0.35)]' 
                      : 'bg-white/[0.05] border border-white/[0.08] text-white hover:bg-white/[0.08] hover:border-white/[0.12]'
                    }
                  `}
                >
                  {plan.cta}
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                </Link>
              </div>
            </div>
          ))}
        </div>

        {/* Bottom Note */}
        <p className="text-center text-xs text-[#475569] mt-8">
          All plans include 14-day free trial. No credit card required.
        </p>
      </div>
    </section>
  )
}
