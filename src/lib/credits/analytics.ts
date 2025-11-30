/**
 * Credit Analytics Service
 * Usage analytics and insights for users
 */

import { db } from '@/lib/db'
import { creditTransactions, userCredits, users } from '@/lib/db/schema'
import { eq, and, sql, gte, lte, desc, asc } from 'drizzle-orm'
import { CREDIT_COSTS, type CreditAction } from './config'

export interface UsageByAction {
  action: CreditAction | string
  count: number
  totalCredits: number
  percentage: number
}

export interface DailyUsage {
  date: string
  credits: number
  transactions: number
}

export interface UsageAnalytics {
  // Overview
  totalCreditsUsed: number
  totalTransactions: number
  currentBalance: number
  lifetimeCredits: number
  
  // Time-based
  last7DaysUsage: number
  last30DaysUsage: number
  thisMonthUsage: number
  
  // Daily breakdown
  dailyUsage: DailyUsage[]
  
  // By action
  usageByAction: UsageByAction[]
  
  // Top actions
  topAction: string
  averagePerDay: number
  
  // Predictions
  estimatedMonthlyUsage: number
  daysUntilEmpty: number | null
  recommendedPackage: string | null
}

export interface AdminAnalytics {
  // System-wide
  totalCreditsInSystem: number
  totalCreditsUsedToday: number
  totalCreditsUsedThisMonth: number
  activeUsersToday: number
  
  // Top users
  topUsersByUsage: Array<{
    userId: string
    email: string
    totalUsed: number
  }>
  
  // Revenue potential
  usersWithLowCredits: number
  averageBalancePerUser: number
  
  // Action breakdown
  systemUsageByAction: UsageByAction[]
}

/**
 * Get usage analytics for a specific user
 */
export async function getUserUsageAnalytics(userId: string): Promise<UsageAnalytics> {
  const now = new Date()
  const last7Days = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
  const last30Days = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
  
  // Get user credits
  const userCredit = await db.query.userCredits.findFirst({
    where: eq(userCredits.userId, userId),
  })
  
  const currentBalance = userCredit ? Number(userCredit.balance) : 0
  const lifetimeCredits = userCredit ? Number(userCredit.lifetimeCredits) : 0
  
  // Get all usage transactions
  const allUsageTransactions = await db
    .select({
      totalCredits: sql<number>`ABS(SUM(${creditTransactions.amount}))`,
      totalCount: sql<number>`COUNT(*)`,
    })
    .from(creditTransactions)
    .where(and(
      eq(creditTransactions.userId, userId),
      eq(creditTransactions.type, 'usage')
    ))
  
  const totalCreditsUsed = Number(allUsageTransactions[0]?.totalCredits || 0)
  const totalTransactions = Number(allUsageTransactions[0]?.totalCount || 0)
  
  // Last 7 days usage
  const last7DaysUsageResult = await db
    .select({
      total: sql<number>`ABS(SUM(${creditTransactions.amount}))`,
    })
    .from(creditTransactions)
    .where(and(
      eq(creditTransactions.userId, userId),
      eq(creditTransactions.type, 'usage'),
      gte(creditTransactions.createdAt, last7Days)
    ))
  
  const last7DaysUsage = Number(last7DaysUsageResult[0]?.total || 0)
  
  // Last 30 days usage
  const last30DaysUsageResult = await db
    .select({
      total: sql<number>`ABS(SUM(${creditTransactions.amount}))`,
    })
    .from(creditTransactions)
    .where(and(
      eq(creditTransactions.userId, userId),
      eq(creditTransactions.type, 'usage'),
      gte(creditTransactions.createdAt, last30Days)
    ))
  
  const last30DaysUsage = Number(last30DaysUsageResult[0]?.total || 0)
  
  // This month usage
  const thisMonthUsageResult = await db
    .select({
      total: sql<number>`ABS(SUM(${creditTransactions.amount}))`,
    })
    .from(creditTransactions)
    .where(and(
      eq(creditTransactions.userId, userId),
      eq(creditTransactions.type, 'usage'),
      gte(creditTransactions.createdAt, startOfMonth)
    ))
  
  const thisMonthUsage = Number(thisMonthUsageResult[0]?.total || 0)
  
  // Daily usage for last 30 days
  const dailyUsageResult = await db
    .select({
      date: sql<string>`DATE(${creditTransactions.createdAt})`,
      credits: sql<number>`ABS(SUM(${creditTransactions.amount}))`,
      transactions: sql<number>`COUNT(*)`,
    })
    .from(creditTransactions)
    .where(and(
      eq(creditTransactions.userId, userId),
      eq(creditTransactions.type, 'usage'),
      gte(creditTransactions.createdAt, last30Days)
    ))
    .groupBy(sql`DATE(${creditTransactions.createdAt})`)
    .orderBy(asc(sql`DATE(${creditTransactions.createdAt})`))
  
  const dailyUsage: DailyUsage[] = dailyUsageResult.map(row => ({
    date: row.date,
    credits: Number(row.credits),
    transactions: Number(row.transactions),
  }))
  
  // Usage by action
  const usageByActionResult = await db
    .select({
      action: creditTransactions.action,
      count: sql<number>`COUNT(*)`,
      totalCredits: sql<number>`ABS(SUM(${creditTransactions.amount}))`,
    })
    .from(creditTransactions)
    .where(and(
      eq(creditTransactions.userId, userId),
      eq(creditTransactions.type, 'usage')
    ))
    .groupBy(creditTransactions.action)
    .orderBy(desc(sql`ABS(SUM(${creditTransactions.amount}))`))
  
  const usageByAction: UsageByAction[] = usageByActionResult.map(row => ({
    action: row.action || 'unknown',
    count: Number(row.count),
    totalCredits: Number(row.totalCredits),
    percentage: totalCreditsUsed > 0 
      ? Math.round((Number(row.totalCredits) / totalCreditsUsed) * 100) 
      : 0,
  }))
  
  // Top action
  const topAction = usageByAction[0]?.action || 'none'
  
  // Average per day
  const daysWithUsage = dailyUsage.length || 1
  const averagePerDay = Math.round(last30DaysUsage / 30)
  
  // Predictions
  const estimatedMonthlyUsage = averagePerDay * 30
  const daysUntilEmpty = averagePerDay > 0 
    ? Math.floor(currentBalance / averagePerDay) 
    : null
  
  // Recommend package based on usage
  let recommendedPackage: string | null = null
  if (estimatedMonthlyUsage > 0) {
    if (estimatedMonthlyUsage < 100) {
      recommendedPackage = 'Starter'
    } else if (estimatedMonthlyUsage < 300) {
      recommendedPackage = 'Basic'
    } else if (estimatedMonthlyUsage < 700) {
      recommendedPackage = 'Pro'
    } else if (estimatedMonthlyUsage < 1800) {
      recommendedPackage = 'Business'
    } else {
      recommendedPackage = 'Enterprise'
    }
  }
  
  return {
    totalCreditsUsed,
    totalTransactions,
    currentBalance,
    lifetimeCredits,
    last7DaysUsage,
    last30DaysUsage,
    thisMonthUsage,
    dailyUsage,
    usageByAction,
    topAction,
    averagePerDay,
    estimatedMonthlyUsage,
    daysUntilEmpty,
    recommendedPackage,
  }
}

/**
 * Get system-wide analytics (admin function)
 */
export async function getSystemAnalytics(): Promise<AdminAnalytics> {
  const now = new Date()
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
  
  // Total credits in system
  const totalCreditsResult = await db
    .select({
      total: sql<number>`SUM(${userCredits.balance})`,
    })
    .from(userCredits)
  
  const totalCreditsInSystem = Number(totalCreditsResult[0]?.total || 0)
  
  // Today's usage
  const todayUsageResult = await db
    .select({
      total: sql<number>`ABS(SUM(${creditTransactions.amount}))`,
    })
    .from(creditTransactions)
    .where(and(
      eq(creditTransactions.type, 'usage'),
      gte(creditTransactions.createdAt, today)
    ))
  
  const totalCreditsUsedToday = Number(todayUsageResult[0]?.total || 0)
  
  // This month's usage
  const monthUsageResult = await db
    .select({
      total: sql<number>`ABS(SUM(${creditTransactions.amount}))`,
    })
    .from(creditTransactions)
    .where(and(
      eq(creditTransactions.type, 'usage'),
      gte(creditTransactions.createdAt, startOfMonth)
    ))
  
  const totalCreditsUsedThisMonth = Number(monthUsageResult[0]?.total || 0)
  
  // Active users today
  const activeUsersResult = await db
    .select({
      count: sql<number>`COUNT(DISTINCT ${creditTransactions.userId})`,
    })
    .from(creditTransactions)
    .where(gte(creditTransactions.createdAt, today))
  
  const activeUsersToday = Number(activeUsersResult[0]?.count || 0)
  
  // Top users by usage
  const topUsersResult = await db
    .select({
      userId: creditTransactions.userId,
      totalUsed: sql<number>`ABS(SUM(${creditTransactions.amount}))`,
    })
    .from(creditTransactions)
    .where(eq(creditTransactions.type, 'usage'))
    .groupBy(creditTransactions.userId)
    .orderBy(desc(sql`ABS(SUM(${creditTransactions.amount}))`))
    .limit(10)
  
  // Get user emails
  const topUserIds = topUsersResult.map(u => u.userId)
  const userEmails = await db
    .select({ id: users.id, email: users.email })
    .from(users)
    .where(sql`${users.id} IN ${topUserIds.length > 0 ? topUserIds : ['none']}`)
  
  const emailMap = new Map(userEmails.map(u => [u.id, u.email]))
  
  const topUsersByUsage = topUsersResult.map(u => ({
    userId: u.userId,
    email: emailMap.get(u.userId) || 'Unknown',
    totalUsed: Number(u.totalUsed),
  }))
  
  // Users with low credits
  const lowCreditResult = await db
    .select({
      count: sql<number>`COUNT(*)`,
    })
    .from(userCredits)
    .where(lte(userCredits.balance, '20'))
  
  const usersWithLowCredits = Number(lowCreditResult[0]?.count || 0)
  
  // Average balance
  const avgBalanceResult = await db
    .select({
      avg: sql<number>`AVG(${userCredits.balance})`,
    })
    .from(userCredits)
  
  const averageBalancePerUser = Math.round(Number(avgBalanceResult[0]?.avg || 0))
  
  // System-wide action breakdown
  const systemActionResult = await db
    .select({
      action: creditTransactions.action,
      count: sql<number>`COUNT(*)`,
      totalCredits: sql<number>`ABS(SUM(${creditTransactions.amount}))`,
    })
    .from(creditTransactions)
    .where(eq(creditTransactions.type, 'usage'))
    .groupBy(creditTransactions.action)
    .orderBy(desc(sql`ABS(SUM(${creditTransactions.amount}))`))
  
  const totalSystemCreditsUsed = systemActionResult.reduce(
    (sum, row) => sum + Number(row.totalCredits), 
    0
  )
  
  const systemUsageByAction: UsageByAction[] = systemActionResult.map(row => ({
    action: row.action || 'unknown',
    count: Number(row.count),
    totalCredits: Number(row.totalCredits),
    percentage: totalSystemCreditsUsed > 0 
      ? Math.round((Number(row.totalCredits) / totalSystemCreditsUsed) * 100) 
      : 0,
  }))
  
  return {
    totalCreditsInSystem,
    totalCreditsUsedToday,
    totalCreditsUsedThisMonth,
    activeUsersToday,
    topUsersByUsage,
    usersWithLowCredits,
    averageBalancePerUser,
    systemUsageByAction,
  }
}

/**
 * Get credit transaction history for a user
 */
export async function getUserTransactionHistory(
  userId: string,
  options?: {
    limit?: number
    offset?: number
    type?: string
    startDate?: Date
    endDate?: Date
  }
) {
  const { limit = 50, offset = 0, type, startDate, endDate } = options || {}
  
  const conditions = [eq(creditTransactions.userId, userId)]
  
  if (type) {
    conditions.push(eq(creditTransactions.type, type as any))
  }
  if (startDate) {
    conditions.push(gte(creditTransactions.createdAt, startDate))
  }
  if (endDate) {
    conditions.push(lte(creditTransactions.createdAt, endDate))
  }
  
  const transactions = await db
    .select()
    .from(creditTransactions)
    .where(and(...conditions))
    .orderBy(desc(creditTransactions.createdAt))
    .limit(limit)
    .offset(offset)
  
  const totalResult = await db
    .select({ count: sql<number>`COUNT(*)` })
    .from(creditTransactions)
    .where(and(...conditions))
  
  return {
    transactions,
    total: Number(totalResult[0]?.count || 0),
    limit,
    offset,
  }
}
