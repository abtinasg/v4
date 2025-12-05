/**
 * Subscription Plans Configuration
 */

export type PlanId = 'free' | 'pro' | 'premium' | 'enterprise'

export interface SubscriptionPlan {
  id: PlanId
  name: string
  description: string
  price: number // Monthly price in USD
  yearlyPrice: number // Annual price (discounted)
  credits: number // Monthly credits
  features: string[]
  isPopular?: boolean
  trialDays: number // Free trial days (0 for free plan)
}

export const SUBSCRIPTION_PLANS: Record<PlanId, SubscriptionPlan> = {
  free: {
    id: 'free',
    name: 'Free',
    description: 'Perfect for getting started',
    price: 0,
    yearlyPrice: 0,
    credits: 50,
    features: [
      '50 credits on signup',
      'Basic market overview',
      '5 watchlist symbols',
      'Core metrics access',
      'Community support',
    ],
    trialDays: 0,
  },
  pro: {
    id: 'pro',
    name: 'Pro',
    description: 'For serious investors',
    price: 29,
    yearlyPrice: 290, // ~17% discount
    credits: 500,
    features: [
      '500 credits per month',
      'All 432 metrics',
      'Unlimited watchlist',
      'AI-powered reports',
      'Real-time alerts',
      'Priority support',
      'API access',
    ],
    isPopular: true,
    trialDays: 14,
  },
  premium: {
    id: 'premium',
    name: 'Premium',
    description: 'Advanced tools for professionals',
    price: 59,
    yearlyPrice: 590, // ~17% discount
    credits: 1500,
    features: [
      '1,500 credits per month',
      'Everything in Pro',
      'Advanced DCF models',
      'Multi-portfolio support',
      'Custom alerts',
      'Export to Excel/PDF',
      'Dedicated support',
    ],
    trialDays: 14,
  },
  enterprise: {
    id: 'enterprise',
    name: 'Enterprise',
    description: 'For teams and institutions',
    price: 199,
    yearlyPrice: 1990,
    credits: 10000,
    features: [
      'Unlimited credits',
      'Everything in Premium',
      'Team collaboration',
      'Custom integrations',
      'Dedicated account manager',
      'SLA guarantee',
      'On-premise option',
    ],
    trialDays: 14,
  },
}

export function getSubscriptionPlan(planId: PlanId): SubscriptionPlan {
  return SUBSCRIPTION_PLANS[planId]
}

export function getAllPlans(): SubscriptionPlan[] {
  return Object.values(SUBSCRIPTION_PLANS)
}

export function getMonthlyPlans(): SubscriptionPlan[] {
  return Object.values(SUBSCRIPTION_PLANS).filter(plan => plan.id !== 'free')
}
