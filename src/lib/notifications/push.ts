/**
 * Push Notification Helper
 * 
 * Utility functions for sending web push notifications using the Web Push protocol.
 */

import webpush from 'web-push'
import { db } from '@/lib/db'
import { pushSubscriptions } from '@/lib/db/schema'
import { eq, and } from 'drizzle-orm'

// Initialize web-push with VAPID keys
// Generate VAPID keys with: npx web-push generate-vapid-keys
const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || ''
const vapidPrivateKey = process.env.VAPID_PRIVATE_KEY || ''
const vapidEmail = process.env.VAPID_EMAIL || 'admin@deepterm.com'

if (vapidPublicKey && vapidPrivateKey) {
  webpush.setVapidDetails(
    `mailto:${vapidEmail}`,
    vapidPublicKey,
    vapidPrivateKey
  )
}

interface PushNotificationPayload {
  title: string
  body: string
  icon?: string
  badge?: string
  data?: any
  tag?: string
  requireInteraction?: boolean
}

/**
 * Send push notification to a specific user
 */
export async function sendPushNotification(
  userId: string,
  payload: PushNotificationPayload
): Promise<{ success: boolean; sent: number; failed: number }> {
  try {
    // Get all active subscriptions for this user
    const subscriptions = await db
      .select()
      .from(pushSubscriptions)
      .where(
        and(
          eq(pushSubscriptions.userId, userId),
          eq(pushSubscriptions.isActive, true)
        )
      )

    if (subscriptions.length === 0) {
      return { success: true, sent: 0, failed: 0 }
    }

    const results = await Promise.allSettled(
      subscriptions.map(async (sub) => {
        try {
          const pushSubscription = {
            endpoint: sub.endpoint,
            keys: {
              p256dh: sub.p256dh,
              auth: sub.auth,
            },
          }

          const notificationPayload = JSON.stringify({
            title: payload.title,
            body: payload.body,
            icon: payload.icon || '/icons/icon-192x192.png',
            badge: payload.badge || '/icons/icon-72x72.png',
            data: payload.data || {},
            tag: payload.tag,
            requireInteraction: payload.requireInteraction || false,
          })

          await webpush.sendNotification(pushSubscription, notificationPayload)
          return { success: true }
        } catch (error: any) {
          // If subscription is no longer valid, deactivate it
          if (error.statusCode === 410 || error.statusCode === 404) {
            await db
              .update(pushSubscriptions)
              .set({ isActive: false, updatedAt: new Date() })
              .where(eq(pushSubscriptions.id, sub.id))
          }
          throw error
        }
      })
    )

    const sent = results.filter((r) => r.status === 'fulfilled').length
    const failed = results.filter((r) => r.status === 'rejected').length

    return { success: true, sent, failed }
  } catch (error) {
    console.error('Send push notification error:', error)
    return { success: false, sent: 0, failed: 0 }
  }
}

/**
 * Send push notification to multiple users
 */
export async function sendPushNotificationToUsers(
  userIds: string[],
  payload: PushNotificationPayload
): Promise<{ success: boolean; totalSent: number; totalFailed: number }> {
  const results = await Promise.allSettled(
    userIds.map((userId) => sendPushNotification(userId, payload))
  )

  const totalSent = results
    .filter((r) => r.status === 'fulfilled')
    .reduce((sum, r) => sum + (r.value?.sent || 0), 0)

  const totalFailed = results
    .filter((r) => r.status === 'fulfilled')
    .reduce((sum, r) => sum + (r.value?.failed || 0), 0)

  return {
    success: true,
    totalSent,
    totalFailed,
  }
}

/**
 * Get VAPID public key for client-side subscription
 */
export function getVapidPublicKey(): string {
  return vapidPublicKey
}
