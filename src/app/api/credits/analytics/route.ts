/**
 * Credit Analytics API
 * Get usage analytics for users
 */

import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { db } from '@/lib/db'
import { users } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { getUserUsageAnalytics, getUserTransactionHistory } from '@/lib/credits/analytics'

export async function GET(request: NextRequest) {
  try {
    const { userId: clerkUserId } = await auth()
    
    if (!clerkUserId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    // Get internal user ID
    const user = await db.query.users.findFirst({
      where: eq(users.clerkId, clerkUserId),
    })
    
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }
    
    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type') || 'analytics'
    
    // Get analytics
    if (type === 'analytics') {
      const analytics = await getUserUsageAnalytics(user.id)
      return NextResponse.json(analytics)
    }
    
    // Get transaction history
    if (type === 'history') {
      const limit = parseInt(searchParams.get('limit') || '50')
      const offset = parseInt(searchParams.get('offset') || '0')
      const transactionType = searchParams.get('transactionType') || undefined
      const startDate = searchParams.get('startDate') 
        ? new Date(searchParams.get('startDate')!) 
        : undefined
      const endDate = searchParams.get('endDate') 
        ? new Date(searchParams.get('endDate')!) 
        : undefined
      
      const history = await getUserTransactionHistory(user.id, {
        limit,
        offset,
        type: transactionType,
        startDate,
        endDate,
      })
      
      return NextResponse.json(history)
    }
    
    return NextResponse.json({ error: 'Invalid type' }, { status: 400 })
    
  } catch (error) {
    console.error('Analytics error:', error)
    return NextResponse.json(
      { error: 'Failed to get analytics' },
      { status: 500 }
    )
  }
}
