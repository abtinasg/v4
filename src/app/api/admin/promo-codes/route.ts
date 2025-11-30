/**
 * Admin Promo Codes API
 * Manage promotional codes
 */

import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { verifyAdminSession } from '@/lib/admin/auth'
import { db } from '@/lib/db'
import { promoCodes, promoCodeUsage } from '@/lib/db/schema'
import { eq, desc, sql, and } from 'drizzle-orm'
import { createPromoCode, getPromoCodeStats } from '@/lib/credits/promo'

export async function GET(request: NextRequest) {
  try {
    // Verify admin authentication
    const cookieStore = await cookies()
    const token = cookieStore.get('admin_session')?.value
    
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    const session = await verifyAdminSession(token)
    if (!session) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
    }
    
    const { searchParams } = new URL(request.url)
    const action = searchParams.get('action') || 'list'
    
    // List all promo codes
    if (action === 'list') {
      const allCodes = await db
        .select()
        .from(promoCodes)
        .orderBy(desc(promoCodes.createdAt))
      
      return NextResponse.json({ promoCodes: allCodes })
    }
    
    // Get stats for a specific code
    if (action === 'stats') {
      const codeId = searchParams.get('codeId')
      if (!codeId) {
        return NextResponse.json({ error: 'Code ID required' }, { status: 400 })
      }
      
      const stats = await getPromoCodeStats(codeId)
      
      // Get usage details
      const usages = await db
        .select()
        .from(promoCodeUsage)
        .where(eq(promoCodeUsage.promoCodeId, codeId))
        .orderBy(desc(promoCodeUsage.usedAt))
        .limit(50)
      
      return NextResponse.json({ stats, usages })
    }
    
    // Get overview stats
    if (action === 'overview') {
      const totalCodes = await db
        .select({ count: sql<number>`COUNT(*)` })
        .from(promoCodes)
      
      const activeCodes = await db
        .select({ count: sql<number>`COUNT(*)` })
        .from(promoCodes)
        .where(eq(promoCodes.isActive, true))
      
      const totalRedemptions = await db
        .select({ count: sql<number>`COUNT(*)` })
        .from(promoCodeUsage)
      
      const totalCreditsAwarded = await db
        .select({ 
          total: sql<number>`COALESCE(SUM(${promoCodeUsage.creditsAwarded}), 0)` 
        })
        .from(promoCodeUsage)
      
      return NextResponse.json({
        totalCodes: Number(totalCodes[0]?.count || 0),
        activeCodes: Number(activeCodes[0]?.count || 0),
        totalRedemptions: Number(totalRedemptions[0]?.count || 0),
        totalCreditsAwarded: Number(totalCreditsAwarded[0]?.total || 0),
      })
    }
    
    return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
    
  } catch (error) {
    console.error('Admin promo codes error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch promo codes' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    // Verify admin authentication
    const cookieStore = await cookies()
    const token = cookieStore.get('admin_session')?.value
    
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    const session = await verifyAdminSession(token)
    if (!session) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
    }
    
    const body = await request.json()
    const { action } = body
    
    // Create new promo code
    if (action === 'create') {
      const {
        code,
        type,
        credits,
        discountPercent,
        discountAmount,
        trialDays,
        maxUses,
        maxUsesPerUser,
        minPurchaseAmount,
        applicablePackages,
        applicableTiers,
        startsAt,
        expiresAt,
        description,
      } = body
      
      if (!code || !type) {
        return NextResponse.json(
          { error: 'Code and type are required' },
          { status: 400 }
        )
      }
      
      // Check if code already exists
      const existing = await db.query.promoCodes.findFirst({
        where: eq(promoCodes.code, code.toUpperCase()),
      })
      
      if (existing) {
        return NextResponse.json(
          { error: 'This promo code already exists' },
          { status: 400 }
        )
      }
      
      const newCode = await createPromoCode({
        code,
        type,
        credits,
        discountPercent,
        discountAmount,
        trialDays,
        maxUses,
        maxUsesPerUser,
        minPurchaseAmount,
        applicablePackages,
        applicableTiers,
        startsAt: startsAt ? new Date(startsAt) : undefined,
        expiresAt: expiresAt ? new Date(expiresAt) : undefined,
        description,
        createdBy: 'admin',
      })
      
      return NextResponse.json({ success: true, promoCode: newCode })
    }
    
    // Update promo code
    if (action === 'update') {
      const { id, ...updates } = body
      
      if (!id) {
        return NextResponse.json({ error: 'ID required' }, { status: 400 })
      }
      
      // Build update object
      const updateData: Record<string, any> = { updatedAt: new Date() }
      
      if (updates.isActive !== undefined) updateData.isActive = updates.isActive
      if (updates.maxUses !== undefined) updateData.maxUses = String(updates.maxUses)
      if (updates.expiresAt !== undefined) updateData.expiresAt = updates.expiresAt ? new Date(updates.expiresAt) : null
      if (updates.description !== undefined) updateData.description = updates.description
      
      await db.update(promoCodes)
        .set(updateData)
        .where(eq(promoCodes.id, id))
      
      return NextResponse.json({ success: true })
    }
    
    // Delete promo code
    if (action === 'delete') {
      const { id } = body
      
      if (!id) {
        return NextResponse.json({ error: 'ID required' }, { status: 400 })
      }
      
      await db.delete(promoCodes).where(eq(promoCodes.id, id))
      
      return NextResponse.json({ success: true })
    }
    
    return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
    
  } catch (error) {
    console.error('Admin promo codes error:', error)
    return NextResponse.json(
      { error: 'Failed to process request' },
      { status: 500 }
    )
  }
}
