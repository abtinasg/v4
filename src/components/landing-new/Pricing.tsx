'use client'

import Link from 'next/link'
import { Check, Sparkles, Zap } from 'lucide-react'

const plans = [
  {
    name: 'Free',
    price: '0',
    description: 'Start exploring the platform',
    credits: '50 credits',
    features: [
      '50 credits on signup',
      'Basic market overview',
      '5 watchlist symbols',
      'Core metrics access',
      'Community resources',
    ],
    cta: 'Get started',
    href: '/sign-up',
    featured: false,
    trial: false,
  },
  {
    name: 'Pro',
    price: '29',
    description: 'For active investors',
    credits: '500 credits/mo',
    features: [
      '500 credits per month',
      'All 432 metrics',
      'Unlimited watchlist',
      'AI-assisted reports',
      'Real-time alerts',
      'Priority support',
      'API access',
    ],
    cta: 'Start 14-day trial',
    href: '/sign-up?plan=pro&trial=true',
    featured: true,
    trial: true,
  },
  {
    name: 'Premium',
    price: '59',
    description: 'For professionals',
    credits: '1,500 credits/mo',
    features: [
      '1,500 credits per month',
      'Everything in Pro',
      'Advanced DCF models',
      'Multi-portfolio support',
      'Custom alerts',
      'Export to Excel/PDF',
      'Dedicated support',
    ],
    cta: 'Start 14-day trial',
    href: '/sign-up?plan=premium&trial=true',
    featured: false,
    trial: true,
  },
  {
    name: 'Enterprise',
    price: 'Custom',
    description: 'For teams and institutions',
    credits: 'Unlimited',
    features: [
      'Unlimited credits',
      'Everything in Premium',
      'Team collaboration',
      'Custom integrations',
      'Account manager',
      'SLA guarantee',
      'On-premise option',
    ],
    cta: 'Contact sales',
    href: '/contact',
    featured: false,
    trial: false,
  },
]

export function Pricing() {
  return (
    <section id="pricing" className="relative py-28 bg-[#111418]">
      {/* Section border */}
      <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-white/8 to-transparent" />

      <div className="mx-auto max-w-7xl px-6">
        {/* Header */}
        <div className="text-center mb-14">
          <p className="text-[12px] font-medium text-[#E67E22] uppercase tracking-wider mb-4">
            Pricing
          </p>
          <h2 className="text-4xl md:text-5xl font-semibold text-white tracking-tight mb-6">
            Transparent pricing.
            <br />
            <span className="text-white/50">No surprises.</span>
          </h2>
          <p className="text-lg text-white/50 max-w-xl mx-auto font-light">
            Start free, scale as needed. All paid plans include a <span className="text-[#E67E22] font-medium">14-day trial</span>.
          </p>
        </div>

        {/* Plans */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-5">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`relative rounded-2xl p-7 ${
                plan.featured
                  ? 'bg-gradient-to-b from-[#E67E22]/10 to-transparent border-2 border-[#E67E22]/30'
                  : 'bg-[#13161A] border border-white/[0.06]'
              }`}
            >
              {plan.featured && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#E67E22] text-white text-[11px] font-medium">
                    <Sparkles className="h-3 w-3" />
                    Most popular
                  </div>
                </div>
              )}

              <div className="mb-5">
                <h3 className="text-lg font-semibold text-white mb-1">{plan.name}</h3>
                <p className="text-sm text-white/40">{plan.description}</p>
              </div>

              <div className="mb-5">
                <div className="flex items-baseline gap-1">
                  {plan.price !== 'Custom' && <span className="text-white/40">$</span>}
                  <span className="text-3xl font-bold text-white">{plan.price}</span>
                  {plan.price !== 'Custom' && plan.price !== '0' && (
                    <span className="text-white/40">/mo</span>
                  )}
                </div>
                <p className="text-sm text-white/40 mt-1">{plan.credits}</p>
              </div>

              <ul className="space-y-2.5 mb-7">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-2.5">
                    <Check className={`h-4 w-4 flex-shrink-0 mt-0.5 ${plan.featured ? 'text-[#E67E22]' : 'text-white/40'}`} />
                    <span className="text-[13px] text-white/50">{feature}</span>
                  </li>
                ))}
              </ul>

              <Link
                href={plan.href}
                className={`block w-full text-center py-3 rounded-full text-[13px] font-medium transition-all ${
                  plan.featured
                    ? 'bg-[#E67E22] hover:bg-[#D35400] text-white'
                    : 'bg-white/5 hover:bg-white/10 text-white border border-white/8'
                }`}
              >
                {plan.cta}
              </Link>

              {plan.trial && (
                <p className="text-[11px] text-center text-white/30 mt-3 flex items-center justify-center gap-1">
                  <Zap className="h-3 w-3" />
                  14 days free, then ${plan.price}/mo
                </p>
              )}
            </div>
          ))}
        </div>

        {/* Payment Notice */}
        <div className="mt-10 text-center">
          <p className="text-sm text-white/35">
            Secure payments with card or crypto (BTC, ETH, USDT, 50+ currencies)
          </p>
        </div>
      </div>
    </section>
  )
}
