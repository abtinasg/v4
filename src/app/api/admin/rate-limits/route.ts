import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { rateLimitConfig } from '@/lib/db/schema'
import { eq, and } from 'drizzle-orm'
import { cookies } from 'next/headers'
import * as jose from 'jose'

// Verify admin authentication
async function verifyAdmin() {
  const cookieStore = await cookies()
  const token = cookieStore.get('admin_token')?.value
  
  if (!token) return false
  
  try {
    const secret = new TextEncoder().encode(process.env.ADMIN_JWT_SECRET || 'fallback-secret-key-min-32-chars!!')
    await jose.jwtVerify(token, secret)
    return true
  } catch {
    return false
  }
}

// Default rate limits
const DEFAULT_RATE_LIMITS = [
  { endpoint: '/api/chat', tier: null, rpm: 20, rph: 200, rpd: 1000, burst: 5, desc: 'AI Chat API' },
  { endpoint: '/api/stocks/quote', tier: null, rpm: 60, rph: 1000, rpd: 10000, burst: 10, desc: 'Stock Quotes' },
  { endpoint: '/api/stocks/search', tier: null, rpm: 30, rph: 500, rpd: 5000, burst: 5, desc: 'Stock Search' },
  { endpoint: '/api/market/*', tier: null, rpm: 60, rph: 1000, rpd: 10000, burst: 10, desc: 'Market Data' },
  { endpoint: '/api/stocks/historical/*', tier: null, rpm: 30, rph: 300, rpd: 3000, burst: 5, desc: 'Historical Data' },
  // Free tier
  { endpoint: '/api/chat', tier: 'free', rpm: 10, rph: 50, rpd: 200, burst: 3, desc: 'AI Chat - Free' },
  { endpoint: '/api/stocks/quote', tier: 'free', rpm: 30, rph: 300, rpd: 3000, burst: 5, desc: 'Quotes - Free' },
  // Premium tier
  { endpoint: '/api/chat', tier: 'premium', rpm: 30, rph: 300, rpd: 2000, burst: 10, desc: 'AI Chat - Premium' },
  { endpoint: '/api/stocks/quote', tier: 'premium', rpm: 100, rph: 2000, rpd: 20000, burst: 20, desc: 'Quotes - Premium' },
  // Professional tier
  { endpoint: '/api/chat', tier: 'professional', rpm: 60, rph: 600, rpd: 5000, burst: 20, desc: 'AI Chat - Pro' },
  { endpoint: '/api/stocks/quote', tier: 'professional', rpm: 200, rph: 5000, rpd: 50000, burst: 50, desc: 'Quotes - Pro' },
]

// GET - Get rate limit configurations
export async function GET(request: NextRequest) {
  if (!await verifyAdmin()) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const configs = await db.select().from(rateLimitConfig)
    
    // If no configs exist, return defaults
    if (configs.length === 0) {
      return NextResponse.json({
        configs: DEFAULT_RATE_LIMITS.map((d, i) => ({
          id: `default-${i}`,
          endpoint: d.endpoint,
          subscriptionTier: d.tier,
          requestsPerMinute: d.rpm,
          requestsPerHour: d.rph,
          requestsPerDay: d.rpd,
          burstLimit: d.burst,
          description: d.desc,
          isEnabled: true,
          isDefault: true,
        })),
        isUsingDefaults: true,
      })
    }

    return NextResponse.json({ configs, isUsingDefaults: false })
  } catch (error) {
    console.error('Rate limits API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST - Create or update rate limit config
export async function POST(request: NextRequest) {
  if (!await verifyAdmin()) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await request.json()
    const { action } = body

    if (action === 'initialize_defaults') {
      // Initialize default rate limits in database
      for (const def of DEFAULT_RATE_LIMITS) {
        await db.insert(rateLimitConfig).values({
          endpoint: def.endpoint,
          subscriptionTier: def.tier as any,
          requestsPerMinute: String(def.rpm),
          requestsPerHour: String(def.rph),
          requestsPerDay: String(def.rpd),
          burstLimit: String(def.burst),
          description: def.desc,
          isEnabled: true,
        }).onConflictDoNothing()
      }
      
      return NextResponse.json({ success: true, message: 'Defaults initialized' })
    }

    if (action === 'create' || action === 'update') {
      const { 
        id,
        endpoint, 
        subscriptionTier, 
        requestsPerMinute, 
        requestsPerHour, 
        requestsPerDay,
        burstLimit,
        description,
        isEnabled 
      } = body

      if (!endpoint) {
        return NextResponse.json({ error: 'Endpoint is required' }, { status: 400 })
      }

      if (action === 'update' && id) {
        await db
          .update(rateLimitConfig)
          .set({
            endpoint,
            subscriptionTier: subscriptionTier || null,
            requestsPerMinute: String(requestsPerMinute || 60),
            requestsPerHour: String(requestsPerHour || 1000),
            requestsPerDay: String(requestsPerDay || 10000),
            burstLimit: String(burstLimit || 10),
            description,
            isEnabled: isEnabled ?? true,
            updatedAt: new Date(),
          })
          .where(eq(rateLimitConfig.id, id))

        return NextResponse.json({ success: true, message: 'Rate limit updated' })
      }

      // Create new
      const newConfig = await db.insert(rateLimitConfig).values({
        endpoint,
        subscriptionTier: subscriptionTier || null,
        requestsPerMinute: String(requestsPerMinute || 60),
        requestsPerHour: String(requestsPerHour || 1000),
        requestsPerDay: String(requestsPerDay || 10000),
        burstLimit: String(burstLimit || 10),
        description,
        isEnabled: isEnabled ?? true,
      }).returning()

      return NextResponse.json({ success: true, config: newConfig[0] })
    }

    if (action === 'toggle') {
      const { id, isEnabled } = body
      
      if (!id) {
        return NextResponse.json({ error: 'ID required' }, { status: 400 })
      }

      await db
        .update(rateLimitConfig)
        .set({ isEnabled, updatedAt: new Date() })
        .where(eq(rateLimitConfig.id, id))

      return NextResponse.json({ success: true })
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
  } catch (error) {
    console.error('Rate limits API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// DELETE - Delete a rate limit config
export async function DELETE(request: NextRequest) {
  if (!await verifyAdmin()) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ error: 'ID required' }, { status: 400 })
    }

    await db.delete(rateLimitConfig).where(eq(rateLimitConfig.id, id))

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Delete rate limit error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
