/**
 * Get Payment History API
 * GET /api/payments/history
 * 
 * Returns user's payment history
 */

import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { db } from '@/lib/db'
import { users, cryptoPayments, creditPackages } from '@/lib/db/schema'
import { eq, desc } from 'drizzle-orm'

export async function GET(request: NextRequest) {
  try {
    const { userId: clerkUserId } = await auth()
    
    if (!clerkUserId) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }
    
    // Get pagination params
    const searchParams = request.nextUrl.searchParams
    const limit = parseInt(searchParams.get('limit') || '20')
    const offset = parseInt(searchParams.get('offset') || '0')
    
    // Find internal user
    const user = await db.query.users.findFirst({
      where: eq(users.clerkId, clerkUserId),
    })
    
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      )
    }
    
    // Get payments with package info
    const payments = await db.query.cryptoPayments.findMany({
      where: eq(cryptoPayments.userId, user.id),
      orderBy: [desc(cryptoPayments.createdAt)],
      limit,
      offset,
      with: {
        package: true,
      },
    })
    
    return NextResponse.json({
      success: true,
      data: payments.map(p => ({
        id: p.id,
        orderId: p.orderId,
        status: p.status,
        package: p.package ? {
          name: p.package.name,
          credits: p.package.credits,
          bonusCredits: p.package.bonusCredits,
        } : null,
        priceAmount: p.priceAmount,
        priceCurrency: p.priceCurrency,
        payCurrency: p.payCurrency,
        actuallyPaid: p.actuallyPaid,
        creditsAmount: p.creditsAmount,
        bonusCredits: p.bonusCredits,
        creditsAdded: p.creditsAdded,
        invoiceUrl: p.invoiceUrl,
        paidAt: p.paidAt,
        createdAt: p.createdAt,
      })),
      pagination: {
        limit,
        offset,
        hasMore: payments.length === limit,
      },
    })
  } catch (error) {
    console.error('Get payment history error:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
