/**
 * Promo Code Service
 * Manage promotional codes and discounts
 */

import { db } from '@/lib/db'
import { 
  promoCodes, 
  promoCodeUsage, 
  userCredits,
  creditTransactions,
  users,
  type PromoCode 
} from '@/lib/db/schema'
import { eq, and, sql, gte, lte } from 'drizzle-orm'

export interface PromoCodeValidationResult {
  valid: boolean
  code?: PromoCode
  error?: string
  benefits?: {
    credits?: number
    discountPercent?: number
    discountAmount?: number
    trialDays?: number
  }
}

export interface PromoCodeRedeemResult {
  success: boolean
  message: string
  creditsAwarded?: number
  discountApplied?: number
  newBalance?: number
}

/**
 * Validate a promo code
 */
export async function validatePromoCode(
  code: string,
  userId: string,
  context?: {
    packageId?: string
    purchaseAmount?: number
  }
): Promise<PromoCodeValidationResult> {
  const now = new Date()
  
  // Find the promo code
  const promoCode = await db.query.promoCodes.findFirst({
    where: eq(promoCodes.code, code.toUpperCase()),
  })
  
  if (!promoCode) {
    return { valid: false, error: 'کد تخفیف معتبر نیست' }
  }
  
  // Check if active
  if (!promoCode.isActive) {
    return { valid: false, error: 'این کد تخفیف غیرفعال است' }
  }
  
  // Check expiry
  if (promoCode.expiresAt && promoCode.expiresAt < now) {
    return { valid: false, error: 'این کد تخفیف منقضی شده است' }
  }
  
  // Check start date
  if (promoCode.startsAt && promoCode.startsAt > now) {
    return { valid: false, error: 'این کد تخفیف هنوز فعال نشده است' }
  }
  
  // Check max uses
  if (promoCode.maxUses && Number(promoCode.usedCount) >= Number(promoCode.maxUses)) {
    return { valid: false, error: 'ظرفیت استفاده از این کد تمام شده است' }
  }
  
  // Check user usage limit
  const userUsageCount = await db
    .select({ count: sql<number>`COUNT(*)` })
    .from(promoCodeUsage)
    .where(and(
      eq(promoCodeUsage.promoCodeId, promoCode.id),
      eq(promoCodeUsage.userId, userId)
    ))
  
  if (Number(userUsageCount[0]?.count || 0) >= Number(promoCode.maxUsesPerUser)) {
    return { valid: false, error: 'شما قبلاً از این کد استفاده کرده‌اید' }
  }
  
  // Check minimum purchase amount
  if (promoCode.minPurchaseAmount && context?.purchaseAmount) {
    if (context.purchaseAmount < Number(promoCode.minPurchaseAmount)) {
      return { 
        valid: false, 
        error: `حداقل مبلغ خرید برای استفاده از این کد $${promoCode.minPurchaseAmount} است` 
      }
    }
  }
  
  // Check applicable packages
  if (promoCode.applicablePackages && context?.packageId) {
    const packages = promoCode.applicablePackages as string[]
    if (packages.length > 0 && !packages.includes(context.packageId)) {
      return { valid: false, error: 'این کد تخفیف برای این پکیج قابل استفاده نیست' }
    }
  }
  
  // Note: applicableTiers check removed - credit-based system with no tiers
  
  return {
    valid: true,
    code: promoCode,
    benefits: {
      credits: promoCode.credits ? Number(promoCode.credits) : undefined,
      discountPercent: promoCode.discountPercent ? Number(promoCode.discountPercent) : undefined,
      discountAmount: promoCode.discountAmount ? Number(promoCode.discountAmount) : undefined,
      trialDays: promoCode.trialDays ? Number(promoCode.trialDays) : undefined,
    },
  }
}

/**
 * Redeem a promo code (for credit-type codes)
 */
export async function redeemPromoCode(
  code: string,
  userId: string,
  metadata?: {
    ipAddress?: string
    userAgent?: string
  }
): Promise<PromoCodeRedeemResult> {
  // Validate first
  const validation = await validatePromoCode(code, userId)
  
  if (!validation.valid || !validation.code) {
    return { success: false, message: validation.error || 'کد نامعتبر است' }
  }
  
  const promoCode = validation.code
  
  // Only credit-type codes can be redeemed directly
  if (promoCode.type !== 'credits' || !promoCode.credits) {
    return { 
      success: false, 
      message: 'این کد فقط برای خرید قابل استفاده است' 
    }
  }
  
  const creditsToAward = Number(promoCode.credits)
  
  // Get or create user credits
  let userCredit = await db.query.userCredits.findFirst({
    where: eq(userCredits.userId, userId),
  })
  
  const currentBalance = userCredit ? Number(userCredit.balance) : 0
  const newBalance = currentBalance + creditsToAward
  
  // Update user credits
  if (userCredit) {
    await db.update(userCredits)
      .set({
        balance: newBalance.toString(),
        lifetimeCredits: (Number(userCredit.lifetimeCredits) + creditsToAward).toString(),
        updatedAt: new Date(),
      })
      .where(eq(userCredits.userId, userId))
  } else {
    await db.insert(userCredits).values({
      userId,
      balance: creditsToAward.toString(),
      lifetimeCredits: creditsToAward.toString(),
    })
  }
  
  // Record transaction
  await db.insert(creditTransactions).values({
    userId,
    amount: String(creditsToAward),
    type: 'promo',
    description: `Promo code: ${promoCode.code}`,
    balanceBefore: String(currentBalance),
    balanceAfter: String(newBalance),
  })
  
  // Record promo code usage
  await db.insert(promoCodeUsage).values({
    promoCodeId: promoCode.id,
    userId,
    creditsAwarded: String(creditsToAward),
    metadata,
  })
  
  // Increment usage count
  await db.update(promoCodes)
    .set({
      usedCount: String(Number(promoCode.usedCount) + 1),
      updatedAt: new Date(),
    })
    .where(eq(promoCodes.id, promoCode.id))
  
  return {
    success: true,
    message: `🎉 ${creditsToAward} کردیت به حساب شما اضافه شد!`,
    creditsAwarded: creditsToAward,
    newBalance,
  }
}

/**
 * Apply promo code to a purchase (for discount-type codes)
 */
export async function applyPromoCodeToPurchase(
  code: string,
  userId: string,
  purchaseAmount: number,
  packageId?: string
): Promise<{
  success: boolean
  originalAmount: number
  discountedAmount: number
  discountApplied: number
  promoCodeId?: string
  error?: string
}> {
  const validation = await validatePromoCode(code, userId, { packageId, purchaseAmount })
  
  if (!validation.valid || !validation.code) {
    return { 
      success: false, 
      originalAmount: purchaseAmount,
      discountedAmount: purchaseAmount,
      discountApplied: 0,
      error: validation.error 
    }
  }
  
  const promoCode = validation.code
  let discount = 0
  
  if (promoCode.discountPercent) {
    discount = purchaseAmount * (Number(promoCode.discountPercent) / 100)
  } else if (promoCode.discountAmount) {
    discount = Math.min(Number(promoCode.discountAmount), purchaseAmount)
  }
  
  const discountedAmount = Math.max(0, purchaseAmount - discount)
  
  return {
    success: true,
    originalAmount: purchaseAmount,
    discountedAmount,
    discountApplied: discount,
    promoCodeId: promoCode.id,
  }
}

/**
 * Record promo code usage after successful purchase
 */
export async function recordPromoCodePurchaseUsage(
  promoCodeId: string,
  userId: string,
  discountApplied: number,
  purchaseId?: string,
  metadata?: object
): Promise<void> {
  // Record usage
  await db.insert(promoCodeUsage).values({
    promoCodeId,
    userId,
    discountApplied: String(discountApplied),
    purchaseId,
    metadata,
  })
  
  // Increment usage count
  await db.update(promoCodes)
    .set({
      usedCount: sql`${promoCodes.usedCount} + 1`,
      updatedAt: new Date(),
    })
    .where(eq(promoCodes.id, promoCodeId))
}

/**
 * Create a new promo code (admin function)
 */
export async function createPromoCode(data: {
  code: string
  type: 'credits' | 'discount' | 'trial'
  credits?: number
  discountPercent?: number
  discountAmount?: number
  trialDays?: number
  maxUses?: number
  maxUsesPerUser?: number
  minPurchaseAmount?: number
  applicablePackages?: string[]
  applicableTiers?: string[]
  startsAt?: Date
  expiresAt?: Date
  description?: string
  createdBy?: string
}): Promise<PromoCode> {
  const [newPromoCode] = await db.insert(promoCodes).values({
    code: data.code.toUpperCase(),
    type: data.type,
    credits: data.credits ? String(data.credits) : null,
    discountPercent: data.discountPercent ? String(data.discountPercent) : null,
    discountAmount: data.discountAmount ? String(data.discountAmount) : null,
    trialDays: data.trialDays ? String(data.trialDays) : null,
    maxUses: data.maxUses ? String(data.maxUses) : null,
    maxUsesPerUser: String(data.maxUsesPerUser || 1),
    minPurchaseAmount: data.minPurchaseAmount ? String(data.minPurchaseAmount) : null,
    applicablePackages: data.applicablePackages,
    applicableTiers: data.applicableTiers,
    startsAt: data.startsAt,
    expiresAt: data.expiresAt,
    description: data.description,
    createdBy: data.createdBy,
  }).returning()
  
  return newPromoCode
}

/**
 * Get all active promo codes (admin function)
 */
export async function getActivePromoCodes(): Promise<PromoCode[]> {
  const now = new Date()
  
  return db.query.promoCodes.findMany({
    where: and(
      eq(promoCodes.isActive, true),
      // Either no expiry or not expired yet
    ),
    orderBy: (promoCodes, { desc }) => [desc(promoCodes.createdAt)],
  })
}

/**
 * Get promo code statistics
 */
export async function getPromoCodeStats(promoCodeId: string) {
  const usages = await db
    .select({
      totalUses: sql<number>`COUNT(*)`,
      totalCreditsAwarded: sql<number>`COALESCE(SUM(${promoCodeUsage.creditsAwarded}), 0)`,
      totalDiscountApplied: sql<number>`COALESCE(SUM(${promoCodeUsage.discountApplied}), 0)`,
      uniqueUsers: sql<number>`COUNT(DISTINCT ${promoCodeUsage.userId})`,
    })
    .from(promoCodeUsage)
    .where(eq(promoCodeUsage.promoCodeId, promoCodeId))
  
  return usages[0]
}
