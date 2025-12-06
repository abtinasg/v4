/**
 * Subscription Service
 * Manages user subscriptions, trials, and recurring payments
 */

import { db } from '@/lib/db'
import { 
  users,
  userCredits,
  creditTransactions,
  userSubscriptions,
} from '@/lib/db/schema'
import { eq, and, gte, lte, desc, or, ne } from 'drizzle-orm'
import { SUBSCRIPTION_PLANS, type PlanId } from './plans'
import { addCredits } from '@/lib/credits'

export interface UserSubscription {
  id: string
  userId: string
  planId: PlanId
  status: 'active' | 'trial' | 'cancelled' | 'expired'
  trialEndsAt: Date | null
  currentPeriodStart: Date
  currentPeriodEnd: Date
  cancelledAt: Date | null
  createdAt: Date
  updatedAt: Date
}

export interface CreateSubscriptionParams {
  userId: string
  planId: PlanId
  paymentId?: string
  startTrial?: boolean
}

/**
 * Check if user is eligible for a free trial
 */
export async function checkTrialEligibility(userId: string): Promise<boolean> {
  // Check if user has ever had a trial or paid subscription
  const existingSub = await db.query.userSubscriptions.findFirst({
    where: eq(userSubscriptions.userId, userId),
    orderBy: [desc(userSubscriptions.createdAt)],
  })

  // No previous subscription = eligible for trial
  if (!existingSub) {
    return true
  }

  // Already had a trial = not eligible
  return false
}

/**
 * Start a free trial for a subscription plan
 * Only Pro plan ($29) supports free trial
 */
export async function startFreeTrial(
  userId: string,
  planId: PlanId
): Promise<UserSubscription | null> {
  const plan = SUBSCRIPTION_PLANS[planId]
  
  // Check eligibility
  const isEligible = await checkTrialEligibility(userId)
  if (!isEligible) {
    throw new Error('User is not eligible for a free trial')
  }

  // Only Pro plan has free trial (14 days)
  if (planId !== 'pro' || plan.trialDays === 0) {
    throw new Error('Only Pro plan has a free trial option')
  }

  const now = new Date()
  const trialEndsAt = new Date(now.getTime() + plan.trialDays * 24 * 60 * 60 * 1000)

  // Create trial subscription
  const [subscription] = await db.insert(userSubscriptions).values({
    userId,
    planId,
    status: 'trial',
    trialEndsAt,
    currentPeriodStart: now,
    currentPeriodEnd: trialEndsAt,
  }).returning()

  // Add trial credits
  await addCredits(
    userId,
    plan.credits,
    'bonus',
    `${plan.name} trial credits (${plan.trialDays} days)`
  )

  return subscription as unknown as UserSubscription
}

/**
 * Create a new subscription (after payment)
 */
export async function createSubscription(
  params: CreateSubscriptionParams
): Promise<UserSubscription> {
  const { userId, planId, paymentId, startTrial } = params
  const plan = SUBSCRIPTION_PLANS[planId]

  const now = new Date()
  const periodEnd = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000) // 30 days

  // Check for existing active subscription
  const existing = await getActiveSubscription(userId)
  if (existing) {
    // Update existing subscription
    const [updated] = await db.update(userSubscriptions)
      .set({
        planId,
        status: startTrial ? 'trial' : 'active',
        currentPeriodStart: now,
        currentPeriodEnd: startTrial 
          ? new Date(now.getTime() + plan.trialDays * 24 * 60 * 60 * 1000)
          : periodEnd,
        trialEndsAt: startTrial 
          ? new Date(now.getTime() + plan.trialDays * 24 * 60 * 60 * 1000)
          : null,
        updatedAt: now,
      })
      .where(eq(userSubscriptions.id, existing.id))
      .returning()
    
    return updated as unknown as UserSubscription
  }

  // Create new subscription
  const [subscription] = await db.insert(userSubscriptions).values({
    userId,
    planId,
    status: startTrial ? 'trial' : 'active',
    trialEndsAt: startTrial 
      ? new Date(now.getTime() + plan.trialDays * 24 * 60 * 60 * 1000)
      : null,
    currentPeriodStart: now,
    currentPeriodEnd: startTrial 
      ? new Date(now.getTime() + plan.trialDays * 24 * 60 * 60 * 1000)
      : periodEnd,
  }).returning()

  // Add subscription credits
  if (!startTrial) {
    await addCredits(
      userId,
      plan.credits,
      'purchase',
      `${plan.name} subscription credits`,
      { orderId: paymentId }
    )
  }

  return subscription as unknown as UserSubscription
}

/**
 * Get user's active subscription
 */
export async function getActiveSubscription(
  userId: string
): Promise<UserSubscription | null> {
  const subscription = await db.query.userSubscriptions.findFirst({
    where: and(
      eq(userSubscriptions.userId, userId),
      or(
        eq(userSubscriptions.status, 'active'),
        eq(userSubscriptions.status, 'trial')
      )
    ),
    orderBy: [desc(userSubscriptions.createdAt)],
  })

  if (!subscription) return null

  // Check if subscription is still valid
  if (
    subscription.status === 'cancelled' ||
    subscription.status === 'expired'
  ) {
    return null
  }

  // Check if trial has expired
  if (
    subscription.status === 'trial' &&
    subscription.trialEndsAt &&
    new Date(subscription.trialEndsAt) < new Date()
  ) {
    // Mark as expired
    await db.update(userSubscriptions)
      .set({ status: 'expired', updatedAt: new Date() })
      .where(eq(userSubscriptions.id, subscription.id))
    return null
  }

  // Check if period has ended
  if (new Date(subscription.currentPeriodEnd) < new Date()) {
    await db.update(userSubscriptions)
      .set({ status: 'expired', updatedAt: new Date() })
      .where(eq(userSubscriptions.id, subscription.id))
    return null
  }

  return subscription as unknown as UserSubscription
}

/**
 * Cancel subscription
 */
export async function cancelSubscription(
  userId: string
): Promise<UserSubscription | null> {
  const subscription = await getActiveSubscription(userId)
  if (!subscription) return null

  const [updated] = await db.update(userSubscriptions)
    .set({
      status: 'cancelled',
      cancelledAt: new Date(),
      updatedAt: new Date(),
    })
    .where(eq(userSubscriptions.id, subscription.id))
    .returning()

  return updated as unknown as UserSubscription
}

/**
 * Check if trial has expired
 */
export function isTrialExpired(subscription: UserSubscription): boolean {
  if (subscription.status !== 'trial') return false
  if (!subscription.trialEndsAt) return false
  return new Date(subscription.trialEndsAt) < new Date()
}

/**
 * Get subscription monthly credits
 */
export function getSubscriptionCredits(planId: PlanId): number {
  return SUBSCRIPTION_PLANS[planId]?.credits || 0
}

/**
 * Process monthly subscription renewal
 * Called by cron job to add monthly credits
 */
export async function processMonthlySubscription(
  userId: string
): Promise<boolean> {
  const subscription = await getActiveSubscription(userId)
  if (!subscription || subscription.status !== 'active') return false

  const plan = SUBSCRIPTION_PLANS[subscription.planId]
  if (!plan) return false

  // Add monthly credits
  await addCredits(
    userId,
    plan.credits,
    'monthly_reset',
    `Monthly ${plan.name} subscription credits`
  )

  // Update period
  const now = new Date()
  const newPeriodEnd = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000)

  await db.update(userSubscriptions)
    .set({
      currentPeriodStart: now,
      currentPeriodEnd: newPeriodEnd,
      updatedAt: now,
    })
    .where(eq(userSubscriptions.id, subscription.id))

  return true
}

/**
 * Get user's effective plan ID (considering trial)
 */
export async function getUserPlanId(userId: string): Promise<PlanId> {
  const subscription = await getActiveSubscription(userId)
  
  if (!subscription) {
    return 'free'
  }
  
  // Trial users get the trial plan benefits
  return subscription.planId
}

/**
 * Check if user has a specific feature based on their plan
 */
export async function checkPlanFeature(
  userId: string,
  feature: 'export' | 'apiAccess' | 'prioritySupport' | 'customIntegrations'
): Promise<boolean> {
  const { PLAN_LIMITS } = await import('@/lib/credits/config')
  const planId = await getUserPlanId(userId)
  const limits = PLAN_LIMITS[planId]
  
  switch (feature) {
    case 'export':
      return limits.exportEnabled
    case 'apiAccess':
      return limits.apiAccessEnabled
    case 'prioritySupport':
      return limits.prioritySupport
    case 'customIntegrations':
      return limits.customIntegrations
    default:
      return false
  }
}

/**
 * Check if user can add more items based on plan limit
 */
export async function checkPlanLimit(
  userId: string,
  limitType: 'watchlistSymbols' | 'portfolios' | 'alerts' | 'aiReportsPerMonth',
  currentCount: number
): Promise<{ allowed: boolean; limit: number; remaining: number }> {
  const { PLAN_LIMITS, isUnlimited } = await import('@/lib/credits/config')
  const planId = await getUserPlanId(userId)
  const limits = PLAN_LIMITS[planId]
  const limit = limits[limitType]
  
  if (isUnlimited(limit)) {
    return { allowed: true, limit: -1, remaining: -1 }
  }
  
  const remaining = Math.max(0, limit - currentCount)
  return { 
    allowed: currentCount < limit, 
    limit, 
    remaining 
  }
}
