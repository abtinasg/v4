/**
 * Promo Codes API
 * Validate and redeem promotional codes
 */

import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { db } from '@/lib/db'
import { users } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { validatePromoCode, redeemPromoCode } from '@/lib/credits/promo'

export async function POST(request: NextRequest) {
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
    
    const body = await request.json()
    const { action, code, packageId, purchaseAmount } = body
    
    if (!code) {
      return NextResponse.json({ error: 'Promo code is required' }, { status: 400 })
    }
    
    // Validate promo code
    if (action === 'validate') {
      const result = await validatePromoCode(code, user.id, { packageId, purchaseAmount })
      return NextResponse.json(result)
    }
    
    // Redeem promo code (for credit-type codes)
    if (action === 'redeem') {
      const ipAddress = request.headers.get('x-forwarded-for')?.split(',')[0] || 
                       request.headers.get('x-real-ip') || 'unknown'
      const userAgent = request.headers.get('user-agent') || undefined
      
      const result = await redeemPromoCode(code, user.id, { ipAddress, userAgent })
      return NextResponse.json(result)
    }
    
    return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
    
  } catch (error) {
    console.error('Promo code error:', error)
    return NextResponse.json(
      { error: 'Failed to process promo code' },
      { status: 500 }
    )
  }
}
