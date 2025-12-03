'use client'

/**
 * Push Notification Manager Component
 * 
 * This component handles requesting notification permission
 * and subscribing/unsubscribing from push notifications.
 */

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Bell, BellOff } from 'lucide-react'

// Convert base64 VAPID key to Uint8Array
function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4)
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/')

  const rawData = window.atob(base64)
  const outputArray = new Uint8Array(rawData.length)

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i)
  }
  return outputArray
}

export function PushNotificationManager() {
  const [isSupported, setIsSupported] = useState(false)
  const [subscription, setSubscription] = useState<PushSubscription | null>(null)
  const [loading, setLoading] = useState(false)
  const [permission, setPermission] = useState<NotificationPermission>('default')

  useEffect(() => {
    // Check if push notifications are supported
    if ('serviceWorker' in navigator && 'PushManager' in window) {
      setIsSupported(true)
      setPermission(Notification.permission)
      
      // Check for existing subscription
      navigator.serviceWorker.ready.then((registration) => {
        registration.pushManager.getSubscription().then((sub) => {
          setSubscription(sub)
        })
      })
    }
  }, [])

  const subscribeToPush = async () => {
    try {
      setLoading(true)

      // Request notification permission
      const permission = await Notification.requestPermission()
      setPermission(permission)

      if (permission !== 'granted') {
        alert('You need to grant notification permission to receive alerts.')
        return
      }

      // Get service worker registration
      const registration = await navigator.serviceWorker.ready

      // Get VAPID public key from environment
      const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY
      if (!vapidPublicKey) {
        console.error('VAPID public key not found')
        alert('Push notifications are not configured on this server.')
        return
      }

      // Subscribe to push notifications
      const sub = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(vapidPublicKey),
      })

      // Send subscription to server
      const response = await fetch('/api/notifications/subscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          subscription: sub.toJSON(),
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to save subscription')
      }

      setSubscription(sub)
      alert('Successfully subscribed to push notifications!')
    } catch (error) {
      console.error('Subscribe to push error:', error)
      alert('Failed to subscribe to push notifications. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const unsubscribeFromPush = async () => {
    try {
      setLoading(true)

      if (!subscription) {
        return
      }

      // Unsubscribe from push service
      await subscription.unsubscribe()

      // Remove subscription from server
      await fetch('/api/notifications/subscribe', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          endpoint: subscription.endpoint,
        }),
      })

      setSubscription(null)
      alert('Successfully unsubscribed from push notifications.')
    } catch (error) {
      console.error('Unsubscribe from push error:', error)
      alert('Failed to unsubscribe. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  if (!isSupported) {
    return (
      <div className="rounded-lg border border-yellow-500/20 bg-yellow-500/10 p-4">
        <p className="text-sm text-yellow-200">
          Push notifications are not supported in your browser.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Push Notifications</h3>
          <p className="text-sm text-muted-foreground">
            Get instant alerts for your portfolio and watchlist
          </p>
        </div>
        <div className="flex items-center gap-2">
          {subscription ? (
            <Button
              onClick={unsubscribeFromPush}
              disabled={loading}
              variant="outline"
              size="sm"
            >
              <BellOff className="mr-2 h-4 w-4" />
              Disable Notifications
            </Button>
          ) : (
            <Button
              onClick={subscribeToPush}
              disabled={loading || permission === 'denied'}
              size="sm"
            >
              <Bell className="mr-2 h-4 w-4" />
              Enable Notifications
            </Button>
          )}
        </div>
      </div>

      {permission === 'denied' && (
        <div className="rounded-lg border border-red-500/20 bg-red-500/10 p-4">
          <p className="text-sm text-red-200">
            You have blocked notifications. Please enable them in your browser
            settings.
          </p>
        </div>
      )}

      {subscription && (
        <div className="rounded-lg border border-green-500/20 bg-green-500/10 p-4">
          <p className="text-sm text-green-200">
            ✓ Push notifications are enabled. You'll receive alerts instantly.
          </p>
        </div>
      )}
    </div>
  )
}
