/**
 * API Route: Test Push Notification
 * 
 * Send a test push notification to the authenticated user.
 * This is useful for testing the push notification system.
 */

import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { db } from '@/lib/db'
import { users } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { sendPushNotification } from '@/lib/notifications/push'

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth()
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
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

    // Send test notification
    const result = await sendPushNotification(dbUser.id, {
      title: '🔔 Test Notification',
      body: 'This is a test push notification from Deep Terminal!',
      icon: '/icons/icon-192x192.png',
      badge: '/icons/icon-72x72.png',
      tag: 'test-notification',
      data: {
        type: 'test',
        timestamp: new Date().toISOString(),
      },
    })

    if (result.sent === 0) {
      return NextResponse.json({
        success: false,
        message: 'No active push subscriptions found. Please subscribe to push notifications first.',
      })
    }

    return NextResponse.json({
      success: true,
      message: `Test notification sent successfully!`,
      sent: result.sent,
      failed: result.failed,
    })

  } catch (error) {
    console.error('Test push notification error:', error)
    return NextResponse.json(
      { 
        error: 'Failed to send test notification',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
