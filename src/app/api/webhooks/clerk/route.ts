import { Webhook } from 'svix'
import { headers } from 'next/headers'
import { WebhookEvent } from '@clerk/nextjs/server'
import { db } from '@/lib/db'
import { users, userPreferences } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'

export async function POST(req: Request) {
  const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET

  if (!WEBHOOK_SECRET) {
    throw new Error('Please add CLERK_WEBHOOK_SECRET to .env')
  }

  const headerPayload = await headers()
  const svix_id = headerPayload.get('svix-id')
  const svix_timestamp = headerPayload.get('svix-timestamp')
  const svix_signature = headerPayload.get('svix-signature')

  if (!svix_id || !svix_timestamp || !svix_signature) {
    return new Response('Error occurred -- no svix headers', {
      status: 400,
    })
  }

  const payload = await req.json()
  const body = JSON.stringify(payload)

  const wh = new Webhook(WEBHOOK_SECRET)

  let evt: WebhookEvent

  try {
    evt = wh.verify(body, {
      'svix-id': svix_id,
      'svix-timestamp': svix_timestamp,
      'svix-signature': svix_signature,
    }) as WebhookEvent
  } catch (err) {
    console.error('Error verifying webhook:', err)
    return new Response('Error occurred', {
      status: 400,
    })
  }

  const eventType = evt.type

  if (eventType === 'user.created') {
    const { id, email_addresses } = evt.data

    try {
      // Create user
      const [newUser] = await db.insert(users).values({
        clerkId: id,
        email: email_addresses[0].email_address,
        subscriptionTier: 'free',
      }).returning()

      // Create default preferences
      await db.insert(userPreferences).values({
        userId: newUser.id,
        theme: 'dark',
        defaultChartType: 'line',
        favoriteMetrics: [],
        settings: {
          notifications: true,
          emailAlerts: true,
          autoRefresh: true,
          refreshInterval: 30000,
          displayCurrency: 'USD',
        },
      })

      console.log('User created:', newUser.id)
    } catch (error) {
      console.error('Error creating user:', error)
      return new Response('Error creating user', { status: 500 })
    }
  }

  if (eventType === 'user.updated') {
    const { id, email_addresses } = evt.data

    try {
      await db
        .update(users)
        .set({
          email: email_addresses[0].email_address,
          updatedAt: new Date(),
        })
        .where(eq(users.clerkId, id))

      console.log('User updated:', id)
    } catch (error) {
      console.error('Error updating user:', error)
      return new Response('Error updating user', { status: 500 })
    }
  }

  if (eventType === 'user.deleted') {
    const { id } = evt.data

    try {
      // Cascade delete will handle related records
      await db.delete(users).where(eq(users.clerkId, id!))

      console.log('User deleted:', id)
    } catch (error) {
      console.error('Error deleting user:', error)
      return new Response('Error deleting user', { status: 500 })
    }
  }

  return new Response('', { status: 200 })
}
