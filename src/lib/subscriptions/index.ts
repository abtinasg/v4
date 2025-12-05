/**
 * Subscription System
 * Manages subscription plans, trials, and recurring payments
 */

export {
  SUBSCRIPTION_PLANS,
  getSubscriptionPlan,
  type SubscriptionPlan,
  type PlanId,
} from './plans'

export {
  createSubscription,
  cancelSubscription,
  getActiveSubscription,
  checkTrialEligibility,
  startFreeTrial,
  isTrialExpired,
  getSubscriptionCredits,
  processMonthlySubscription,
  type UserSubscription,
  type CreateSubscriptionParams,
} from './service'
