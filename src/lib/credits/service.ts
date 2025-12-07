/**
 * Credit Service
 * User credit management service
 */

import { db } from '@/lib/db'
import { 
  userCredits, 
  creditTransactions, 
  users,
  type NewCreditTransaction 
} from '@/lib/db/schema'
import { eq, desc, and, sql, gte } from 'drizzle-orm'
import { 
  CREDIT_COSTS, 
  CREDIT_CONFIG,
  type CreditAction,
} from './config'

export interface CreditCheckResult {
  success: boolean
  currentBalance: number
  requiredCredits: number
  remainingBalance: number
  message?: string
}

export interface CreditDeductResult {
  success: boolean
  newBalance: number
  transactionId?: string
  message?: string
}

export interface CreditAddResult {
  success: boolean
  newBalance: number
  transactionId?: string
  message?: string
}

/**
 * Get user credit balance
 */
export async function getUserCreditBalance(userId: string): Promise<number> {
  const result = await db.query.userCredits.findFirst({
    where: eq(userCredits.userId, userId),
  })
  
  return result ? parseFloat(result.balance) : 0
}

/**
 * Get full user credit information
 */
export async function getUserCredits(userId: string) {
  const result = await db.query.userCredits.findFirst({
    where: eq(userCredits.userId, userId),
  })
  
  if (!result) {
    // Create credit record for new user
    const newCredits = await initializeUserCredits(userId)
    return newCredits
  }
  
  return result
}

/**
 * Initialize credits for new user
 */
export async function initializeUserCredits(userId: string) {
  // Check if user exists
  const user = await db.query.users.findFirst({
    where: eq(users.id, userId),
  })
  
  if (!user) {
    throw new Error('User not found')
  }
  
  // Credit-based system: same initial credits for all users
  const monthlyCredits = CREDIT_CONFIG.monthlyFreeCredits
  const initialCredits = CREDIT_CONFIG.initialFreeCredits + monthlyCredits
  
  // Create credit record
  const [newCredits] = await db.insert(userCredits).values({
    userId,
    balance: String(initialCredits),
    lifetimeCredits: String(initialCredits),
    freeCreditsUsed: '0',
    lastFreeCreditsReset: new Date(),
  }).returning()
  
  // Record transaction
  await db.insert(creditTransactions).values({
    userId,
    amount: String(initialCredits),
    type: 'bonus',
    description: 'Welcome bonus + Monthly free credits',
    balanceBefore: '0',
    balanceAfter: String(initialCredits),
  })
  
  return newCredits
}

/**
 * Check if user has enough credits for an action
 */
export async function checkCredits(
  userId: string, 
  action: CreditAction
): Promise<CreditCheckResult> {
  const requiredCredits = CREDIT_COSTS[action]
  
  // Get or initialize user credits
  const userCreditRecord = await getUserCredits(userId)
  const currentBalance = parseFloat(userCreditRecord?.balance || '0')
  
  if (currentBalance >= requiredCredits) {
    return {
      success: true,
      currentBalance,
      requiredCredits,
      remainingBalance: currentBalance - requiredCredits,
    }
  }
  
  return {
    success: false,
    currentBalance,
    requiredCredits,
    remainingBalance: currentBalance - requiredCredits,
    message: `Insufficient credits. Required: ${requiredCredits}, Available: ${currentBalance}`,
  }
}

/**
 * Deduct credits from user account
 * Uses atomic UPDATE to prevent race conditions
 */
export async function deductCredits(
  userId: string,
  action: CreditAction,
  metadata?: {
    symbol?: string
    apiEndpoint?: string
    ipAddress?: string
    endpoint?: string
    model?: string
  }
): Promise<CreditDeductResult> {
  const requiredCredits = CREDIT_COSTS[action]

  // Ensure user credit record exists
  await getUserCredits(userId)

  // Get current balance for transaction record
  const currentBalanceNum = await getUserCreditBalance(userId)

  if (currentBalanceNum < requiredCredits) {
    return {
      success: false,
      newBalance: currentBalanceNum,
      message: `Insufficient credits. Required: ${requiredCredits}, Available: ${currentBalanceNum}`,
    }
  }

  // Atomic update: only deduct if balance is still sufficient
  // This prevents race conditions where two requests could both pass the check
  const result = await db.update(userCredits)
    .set({
      balance: sql`${userCredits.balance} - ${requiredCredits}`,
      updatedAt: new Date(),
    })
    .where(
      and(
        eq(userCredits.userId, userId),
        sql`${userCredits.balance} >= ${requiredCredits}`
      )
    )
    .returning()

  // If no rows were updated, another request consumed the credits
  if (result.length === 0) {
    const newBalanceCheck = await getUserCreditBalance(userId)
    return {
      success: false,
      newBalance: newBalanceCheck,
      message: `Insufficient credits. Required: ${requiredCredits}, Available: ${newBalanceCheck}`,
    }
  }

  const newBalance = parseFloat(result[0].balance)

  // Record transaction
  const [transaction] = await db.insert(creditTransactions).values({
    userId,
    amount: String(-requiredCredits),
    type: 'usage',
    action,
    description: `Credit used for ${action}`,
    balanceBefore: String(currentBalanceNum),
    balanceAfter: String(newBalance),
    metadata,
  }).returning()

  return {
    success: true,
    newBalance,
    transactionId: transaction.id,
  }
}

/**
 * Add credits to user account
 * Uses atomic UPDATE to ensure correct balance even with concurrent requests
 */
export async function addCredits(
  userId: string,
  amount: number,
  type: 'purchase' | 'refund' | 'bonus' | 'monthly_reset' | 'admin_adjust' | 'promo',
  description: string,
  metadata?: {
    packageId?: string
    stripePaymentId?: string
    orderId?: string
    paymentId?: string
    payCurrency?: string
    actuallyPaid?: number
    promoCode?: string
  }
): Promise<CreditAddResult> {
  // Ensure credit record exists
  await getUserCredits(userId)

  // Get current balance for transaction record
  const currentBalance = await getUserCreditBalance(userId)

  // Atomic update: add credits and cap at max balance
  const result = await db.update(userCredits)
    .set({
      balance: sql`LEAST((${userCredits.balance}::numeric + ${amount}), ${CREDIT_CONFIG.maxCreditBalance})::text`,
      lifetimeCredits: sql`(${userCredits.lifetimeCredits}::numeric + ${amount})::text`,
      updatedAt: new Date(),
    })
    .where(eq(userCredits.userId, userId))
    .returning()

  if (result.length === 0) {
    throw new Error('Failed to add credits - user record not found')
  }

  const newBalance = parseFloat(result[0].balance)

  // Record transaction
  const [transaction] = await db.insert(creditTransactions).values({
    userId,
    amount: String(amount),
    type,
    description,
    balanceBefore: String(currentBalance),
    balanceAfter: String(newBalance),
    metadata,
  }).returning()

  return {
    success: true,
    newBalance,
    transactionId: transaction.id,
  }
}

/**
 * Refund credits (in case of error or cancellation)
 */
export async function refundCredits(
  userId: string,
  amount: number,
  reason: string
): Promise<CreditAddResult> {
  return addCredits(userId, amount, 'refund', `Refund: ${reason}`)
}

/**
 * Reset monthly free credits
 */
export async function resetMonthlyCredits(userId: string): Promise<CreditAddResult> {
  const user = await db.query.users.findFirst({
    where: eq(users.id, userId),
  })
  
  if (!user) {
    throw new Error('User not found')
  }
  
  // Credit-based system: same monthly credits for all users
  const monthlyCredits = CREDIT_CONFIG.monthlyFreeCredits
  
  // Update reset date
  await db.update(userCredits)
    .set({ 
      freeCreditsUsed: '0',
      lastFreeCreditsReset: new Date(),
    })
    .where(eq(userCredits.userId, userId))
  
  return addCredits(
    userId, 
    monthlyCredits, 
    'monthly_reset', 
    'Monthly free credits reset'
  )
}

/**
 * Get user transaction history
 */
export async function getCreditHistory(
  userId: string,
  options?: {
    limit?: number
    offset?: number
    type?: NewCreditTransaction['type']
    startDate?: Date
    endDate?: Date
  }
) {
  const { limit = 50, offset = 0, type, startDate, endDate } = options || {}
  
  let query = db.select()
    .from(creditTransactions)
    .where(eq(creditTransactions.userId, userId))
    .orderBy(desc(creditTransactions.createdAt))
    .limit(limit)
    .offset(offset)
  
  const results = await query
  return results
}

/**
 * Get credit usage statistics
 */
export async function getCreditStats(userId: string) {
  const credits = await getUserCredits(userId)
  
  // Today's usage
  const todayStart = new Date()
  todayStart.setHours(0, 0, 0, 0)
  
  const todayUsage = await db.select({
    total: sql<number>`COALESCE(SUM(ABS(${creditTransactions.amount}::numeric)), 0)`,
  })
    .from(creditTransactions)
    .where(
      and(
        eq(creditTransactions.userId, userId),
        eq(creditTransactions.type, 'usage'),
        gte(creditTransactions.createdAt, todayStart)
      )
    )
  
  // This month's usage
  const monthStart = new Date()
  monthStart.setDate(1)
  monthStart.setHours(0, 0, 0, 0)
  
  const monthUsage = await db.select({
    total: sql<number>`COALESCE(SUM(ABS(${creditTransactions.amount}::numeric)), 0)`,
  })
    .from(creditTransactions)
    .where(
      and(
        eq(creditTransactions.userId, userId),
        eq(creditTransactions.type, 'usage'),
        gte(creditTransactions.createdAt, monthStart)
      )
    )
  
  return {
    currentBalance: parseFloat(credits?.balance || '0'),
    lifetimeCredits: parseFloat(credits?.lifetimeCredits || '0'),
    todayUsage: todayUsage[0]?.total || 0,
    monthUsage: monthUsage[0]?.total || 0,
    lastReset: credits?.lastFreeCreditsReset,
  }
}

/**
 * Check and reset monthly credits if needed
 * Uses atomic UPDATE to prevent duplicate monthly resets
 */
export async function checkAndResetMonthlyCredits(userId: string): Promise<boolean> {
  const credits = await getUserCredits(userId)

  if (!credits) return false

  const lastReset = new Date(credits.lastFreeCreditsReset)
  const now = new Date()

  // Check if new month started
  if (
    lastReset.getMonth() === now.getMonth() &&
    lastReset.getFullYear() === now.getFullYear()
  ) {
    return false
  }

  // Calculate the start of current month for atomic comparison
  const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1)

  // Atomic update: only update lastFreeCreditsReset if it's before current month
  // This prevents duplicate resets if multiple requests hit at the same time
  const result = await db.update(userCredits)
    .set({
      freeCreditsUsed: '0',
      lastFreeCreditsReset: now,
      updatedAt: now,
    })
    .where(
      and(
        eq(userCredits.userId, userId),
        sql`${userCredits.lastFreeCreditsReset} < ${currentMonthStart}`
      )
    )
    .returning()

  // If update succeeded (wasn't already reset this month), add credits
  if (result.length > 0) {
    await addCredits(
      userId,
      CREDIT_CONFIG.monthlyFreeCredits,
      'monthly_reset',
      'Monthly free credits reset'
    )
    return true
  }

  return false
}
