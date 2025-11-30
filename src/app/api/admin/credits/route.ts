import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { userCredits, creditTransactions, creditPackages, users } from '@/lib/db/schema'
import { eq, desc, sql, and, gte, lte } from 'drizzle-orm'
import { cookies } from 'next/headers'
import * as jose from 'jose'
import {
  CREDIT_COSTS,
  RATE_LIMITS,
  CREDIT_CONFIG,
  DEFAULT_CREDIT_PACKAGES,
} from '@/lib/credits/config'

// Verify admin authentication
async function verifyAdmin() {
  const cookieStore = await cookies()
  const token = cookieStore.get('admin_token')?.value
  
  if (!token) return false
  
  try {
    const secret = new TextEncoder().encode(process.env.ADMIN_JWT_SECRET || 'fallback-secret-key-min-32-chars!!')
    await jose.jwtVerify(token, secret)
    return true
  } catch {
    return false
  }
}

// GET - Get credits overview and user credits
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const action = searchParams.get('action') || 'overview'

  // Config action doesn't require authentication (read-only public config)
  if (action === 'config') {
    return NextResponse.json({
      creditCosts: CREDIT_COSTS,
      rateLimits: RATE_LIMITS,
      creditConfig: CREDIT_CONFIG,
      defaultPackages: DEFAULT_CREDIT_PACKAGES,
    })
  }

  // All other actions require admin authentication
  if (!await verifyAdmin()) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const userId = searchParams.get('userId')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const offset = (page - 1) * limit

    if (action === 'overview') {
      // Get total credits in system
      const totalCredits = await db
        .select({ total: sql<number>`COALESCE(SUM(${userCredits.balance}), 0)` })
        .from(userCredits)

      // Get total lifetime credits
      const lifetimeCredits = await db
        .select({ total: sql<number>`COALESCE(SUM(${userCredits.lifetimeCredits}), 0)` })
        .from(userCredits)

      // Get users with credits
      const usersWithCredits = await db
        .select({ count: sql<number>`COUNT(*)` })
        .from(userCredits)
        .where(sql`${userCredits.balance} > 0`)

      // Get recent transactions
      const recentTransactions = await db
        .select({
          id: creditTransactions.id,
          userId: creditTransactions.userId,
          amount: creditTransactions.amount,
          type: creditTransactions.type,
          action: creditTransactions.action,
          description: creditTransactions.description,
          createdAt: creditTransactions.createdAt,
        })
        .from(creditTransactions)
        .orderBy(desc(creditTransactions.createdAt))
        .limit(10)

      // Get credit packages
      const packages = await db
        .select()
        .from(creditPackages)
        .orderBy(creditPackages.sortOrder)

      // Get today's usage
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      
      const todayUsage = await db
        .select({ total: sql<number>`COALESCE(SUM(ABS(${creditTransactions.amount})), 0)` })
        .from(creditTransactions)
        .where(and(
          eq(creditTransactions.type, 'usage'),
          gte(creditTransactions.createdAt, today)
        ))

      return NextResponse.json({
        overview: {
          totalCreditsInSystem: Number(totalCredits[0]?.total || 0),
          lifetimeCreditsIssued: Number(lifetimeCredits[0]?.total || 0),
          usersWithCredits: Number(usersWithCredits[0]?.count || 0),
          todayUsage: Number(todayUsage[0]?.total || 0),
        },
        recentTransactions,
        packages,
      })
    }

    if (action === 'users') {
      // Get all users with their credit balances (LEFT JOIN to show all users)
      const allUsers = await db
        .select({
          userId: users.id,
          clerkId: users.clerkId,
          email: users.email,
          balance: sql<string>`COALESCE(${userCredits.balance}, '0')`,
          lifetimeCredits: sql<string>`COALESCE(${userCredits.lifetimeCredits}, '0')`,
          freeCreditsUsed: sql<string>`COALESCE(${userCredits.freeCreditsUsed}, '0')`,
          lastReset: userCredits.lastFreeCreditsReset,
          updatedAt: userCredits.updatedAt,
          userCreatedAt: users.createdAt,
        })
        .from(users)
        .leftJoin(userCredits, eq(users.id, userCredits.userId))
        .orderBy(desc(users.createdAt))
        .limit(limit)
        .offset(offset)

      const total = await db
        .select({ count: sql<number>`COUNT(*)` })
        .from(users)

      return NextResponse.json({
        users: allUsers,
        pagination: {
          page,
          limit,
          total: Number(total[0]?.count || 0),
          totalPages: Math.ceil(Number(total[0]?.count || 0) / limit),
        },
      })
    }

    if (action === 'transactions' && userId) {
      // Get transactions for specific user
      const transactions = await db
        .select()
        .from(creditTransactions)
        .where(eq(creditTransactions.userId, userId))
        .orderBy(desc(creditTransactions.createdAt))
        .limit(limit)
        .offset(offset)

      return NextResponse.json({ transactions })
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
  } catch (error) {
    console.error('Credits API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST - Adjust user credits or manage packages
export async function POST(request: NextRequest) {
  if (!await verifyAdmin()) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await request.json()
    const { action } = body

    if (action === 'adjust_credits') {
      const { userId, amount, description } = body
      
      if (!userId || amount === undefined) {
        return NextResponse.json({ error: 'userId and amount required' }, { status: 400 })
      }

      // Get current balance
      const currentCredit = await db
        .select()
        .from(userCredits)
        .where(eq(userCredits.userId, userId))
        .limit(1)

      const currentBalance = Number(currentCredit[0]?.balance || 0)
      const newBalance = currentBalance + Number(amount)

      if (currentCredit.length === 0) {
        // Create new credit record
        await db.insert(userCredits).values({
          userId,
          balance: String(newBalance),
          lifetimeCredits: amount > 0 ? String(amount) : '0',
        })
      } else {
        // Update existing
        await db
          .update(userCredits)
          .set({
            balance: String(newBalance),
            lifetimeCredits: amount > 0 
              ? String(Number(currentCredit[0].lifetimeCredits) + Number(amount))
              : currentCredit[0].lifetimeCredits,
            updatedAt: new Date(),
          })
          .where(eq(userCredits.userId, userId))
      }

      // Record transaction
      await db.insert(creditTransactions).values({
        userId,
        amount: String(amount),
        type: 'admin_adjust',
        description: description || `Admin adjustment: ${amount > 0 ? '+' : ''}${amount} credits`,
        balanceBefore: String(currentBalance),
        balanceAfter: String(newBalance),
      })

      return NextResponse.json({
        success: true,
        newBalance,
        message: `Credits adjusted by ${amount}`,
      })
    }

    if (action === 'create_package') {
      const { name, description, credits, bonusCredits, price, isPopular } = body
      
      const newPackage = await db.insert(creditPackages).values({
        name,
        description,
        credits: String(credits),
        bonusCredits: String(bonusCredits || 0),
        price: String(price),
        isPopular: isPopular || false,
      }).returning()

      return NextResponse.json({ success: true, package: newPackage[0] })
    }

    if (action === 'update_package') {
      const { id, ...updates } = body
      
      if (!id) {
        return NextResponse.json({ error: 'Package ID required' }, { status: 400 })
      }

      await db
        .update(creditPackages)
        .set({
          ...updates,
          credits: updates.credits ? String(updates.credits) : undefined,
          bonusCredits: updates.bonusCredits ? String(updates.bonusCredits) : undefined,
          price: updates.price ? String(updates.price) : undefined,
          updatedAt: new Date(),
        })
        .where(eq(creditPackages.id, id))

      return NextResponse.json({ success: true })
    }

    if (action === 'bulk_credits') {
      const { userIds, amount, description } = body
      
      if (!userIds?.length || amount === undefined) {
        return NextResponse.json({ error: 'userIds array and amount required' }, { status: 400 })
      }

      let adjusted = 0
      for (const userId of userIds) {
        try {
          const currentCredit = await db
            .select()
            .from(userCredits)
            .where(eq(userCredits.userId, userId))
            .limit(1)

          const currentBalance = Number(currentCredit[0]?.balance || 0)
          const newBalance = currentBalance + Number(amount)

          if (currentCredit.length === 0) {
            await db.insert(userCredits).values({
              userId,
              balance: String(newBalance),
              lifetimeCredits: amount > 0 ? String(amount) : '0',
            })
          } else {
            await db
              .update(userCredits)
              .set({
                balance: String(newBalance),
                updatedAt: new Date(),
              })
              .where(eq(userCredits.userId, userId))
          }

          await db.insert(creditTransactions).values({
            userId,
            amount: String(amount),
            type: 'admin_adjust',
            description: description || `Bulk adjustment: ${amount} credits`,
            balanceBefore: String(currentBalance),
            balanceAfter: String(newBalance),
          })

          adjusted++
        } catch (e) {
          console.error(`Failed to adjust credits for user ${userId}:`, e)
        }
      }

      return NextResponse.json({
        success: true,
        adjusted,
        message: `Adjusted credits for ${adjusted} users`,
      })
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
  } catch (error) {
    console.error('Credits API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// DELETE - Delete a credit package
export async function DELETE(request: NextRequest) {
  if (!await verifyAdmin()) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { searchParams } = new URL(request.url)
    const packageId = searchParams.get('packageId')

    if (!packageId) {
      return NextResponse.json({ error: 'Package ID required' }, { status: 400 })
    }

    await db.delete(creditPackages).where(eq(creditPackages.id, packageId))

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Delete package error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
