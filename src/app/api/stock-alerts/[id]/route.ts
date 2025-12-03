/**
 * Stock Alert by ID API
 * 
 * PATCH: Update alert
 * DELETE: Delete alert
 */

import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { db } from '@/lib/db'
import { stockAlerts, users } from '@/lib/db/schema'
import { eq, and } from 'drizzle-orm'

interface RouteParams {
  params: Promise<{ id: string }>
}

// Update alert
export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const { userId: clerkId } = await auth()
    const { id } = await params
    
    if (!clerkId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    // Get user
    const user = await db.query.users.findFirst({
      where: eq(users.clerkId, clerkId),
    })
    
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }
    
    // Check if alert exists and belongs to user
    const existingAlert = await db.query.stockAlerts.findFirst({
      where: and(
        eq(stockAlerts.id, id),
        eq(stockAlerts.userId, user.id)
      ),
    })
    
    if (!existingAlert) {
      return NextResponse.json({ error: 'Alert not found' }, { status: 404 })
    }
    
    const body = await request.json()
    const { isActive, condition, targetPrice } = body
    
    // Build update object
    const updateData: Record<string, unknown> = {
      updatedAt: new Date(),
    }
    
    if (isActive !== undefined) {
      updateData.isActive = isActive
    }
    
    if (condition && ['above', 'below', 'crosses_above', 'crosses_below'].includes(condition)) {
      updateData.condition = condition
    }
    
    if (targetPrice !== undefined && !isNaN(parseFloat(targetPrice))) {
      updateData.targetPrice = targetPrice.toString()
    }
    
    // Update alert
    const [updated] = await db
      .update(stockAlerts)
      .set(updateData)
      .where(eq(stockAlerts.id, id))
      .returning()
    
    return NextResponse.json({ 
      success: true,
      alert: updated 
    })
    
  } catch (error) {
    console.error('Update alert error:', error)
    return NextResponse.json(
      { error: 'Failed to update alert' },
      { status: 500 }
    )
  }
}

// Delete alert
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const { userId: clerkId } = await auth()
    const { id } = await params
    
    if (!clerkId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    // Get user
    const user = await db.query.users.findFirst({
      where: eq(users.clerkId, clerkId),
    })
    
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }
    
    // Check if alert exists and belongs to user
    const existingAlert = await db.query.stockAlerts.findFirst({
      where: and(
        eq(stockAlerts.id, id),
        eq(stockAlerts.userId, user.id)
      ),
    })
    
    if (!existingAlert) {
      return NextResponse.json({ error: 'Alert not found' }, { status: 404 })
    }
    
    // Delete alert
    await db
      .delete(stockAlerts)
      .where(eq(stockAlerts.id, id))
    
    return NextResponse.json({ 
      success: true,
      message: 'Alert deleted successfully'
    })
    
  } catch (error) {
    console.error('Delete alert error:', error)
    return NextResponse.json(
      { error: 'Failed to delete alert' },
      { status: 500 }
    )
  }
}
