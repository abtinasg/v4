/**
 * API Route: Subscribe to Push Notifications
 * 
 * This endpoint saves a user's push notification subscription
 * to the database so we can send them push notifications.
 */

import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { db } from '@/lib/db'
import { pushSubscriptions, users } from '@/lib/db/schema'
import { eq, and } from 'drizzle-orm'

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth()
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { subscription } = body

    if (!subscription || !subscription.endpoint || !subscription.keys) {
      return NextResponse.json(
        { error: 'Invalid subscription data' },
        { status: 400 }
      )
    }

    // Get user from database
    const user = await db
      .select()
      .from(users)
      .where(eq(users.clerkId, userId))
      .limit(1)

    if (!user || user.length === 0) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    const dbUser = user[0]

    // Check if subscription already exists
    const existing = await db
      .select()
      .from(pushSubscriptions)
      .where(eq(pushSubscriptions.endpoint, subscription.endpoint))
      .limit(1)

    if (existing && existing.length > 0) {
      // Update existing subscription
      await db
        .update(pushSubscriptions)
        .set({
          userId: dbUser.id,
          p256dh: subscription.keys.p256dh,
          auth: subscription.keys.auth,
          userAgent: request.headers.get('user-agent') || undefined,
          isActive: true,
          updatedAt: new Date(),
        })
        .where(eq(pushSubscriptions.endpoint, subscription.endpoint))

      return NextResponse.json({
        success: true,
        message: 'Push subscription updated',
      })
    }

    // Create new subscription
    await db.insert(pushSubscriptions).values({
      userId: dbUser.id,
      endpoint: subscription.endpoint,
      p256dh: subscription.keys.p256dh,
      auth: subscription.keys.auth,
      userAgent: request.headers.get('user-agent') || undefined,
      isActive: true,
    })

    return NextResponse.json({
      success: true,
      message: 'Push subscription saved',
    })

  } catch (error) {
    console.error('Subscribe to push error:', error)
    return NextResponse.json(
      { 
        error: 'Failed to subscribe',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

// Unsubscribe from push notifications
export async function DELETE(request: NextRequest) {
  try {
    const { userId } = await auth()
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { endpoint } = body

    if (!endpoint) {
      return NextResponse.json(
        { error: 'Endpoint is required' },
        { status: 400 }
      )
    }

    // Get user from database
    const user = await db
      .select()
      .from(users)
      .where(eq(users.clerkId, userId))
      .limit(1)

    if (!user || user.length === 0) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    const dbUser = user[0]

    // Deactivate subscription
    await db
      .update(pushSubscriptions)
      .set({
        isActive: false,
        updatedAt: new Date(),
      })
      .where(
        and(
          eq(pushSubscriptions.userId, dbUser.id),
          eq(pushSubscriptions.endpoint, endpoint)
        )
      )

    return NextResponse.json({
      success: true,
      message: 'Push subscription removed',
    })

  } catch (error) {
    console.error('Unsubscribe from push error:', error)
    return NextResponse.json(
      { 
        error: 'Failed to unsubscribe',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
