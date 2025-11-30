/**
 * Credits History API
 * GET /api/credits/history
 */

import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { db } from '@/lib/db'
import { users } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { getCreditHistory } from '@/lib/credits'

export async function GET(request: NextRequest) {
  try {
    const { userId: clerkUserId } = await auth()
    
    if (!clerkUserId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }
    
    // Find internal user
    const user = await db.query.users.findFirst({
      where: eq(users.clerkId, clerkUserId),
    })
    
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }
    
    // Pagination parameters
    const searchParams = request.nextUrl.searchParams
    const limit = Math.min(parseInt(searchParams.get('limit') || '50'), 100)
    const offset = parseInt(searchParams.get('offset') || '0')
    const type = searchParams.get('type') as any
    
    // Get history
    const history = await getCreditHistory(user.id, {
      limit,
      offset,
      type: type || undefined,
    })
    
    return NextResponse.json({
      success: true,
      data: {
        transactions: history.map(t => ({
          id: t.id,
          amount: parseFloat(t.amount),
          type: t.type,
          action: t.action,
          description: t.description,
          balanceBefore: parseFloat(t.balanceBefore),
          balanceAfter: parseFloat(t.balanceAfter),
          metadata: t.metadata,
          createdAt: t.createdAt,
        })),
        pagination: {
          limit,
          offset,
          hasMore: history.length === limit,
        },
      },
    })
  } catch (error) {
    console.error('Error fetching credit history:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
