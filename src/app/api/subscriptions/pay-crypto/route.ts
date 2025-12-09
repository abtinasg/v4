/**
 * Create Subscription Payment API (Crypto)
 * POST /api/subscriptions/pay-crypto
 * 
 * Creates a crypto payment for subscription
 */

import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { db } from '@/lib/db'
import { users, cryptoPayments, userSubscriptions } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { nowPayments } from '@/lib/payments/nowpayments'
import { SUBSCRIPTION_PLANS, type PlanId, getActiveSubscription } from '@/lib/subscriptions'
import { nanoid } from 'nanoid'

export async function POST(request: NextRequest) {
  try {
    const { userId: clerkUserId } = await auth()
    
    if (!clerkUserId) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }
    
    const body = await request.json()
    const { planId, payCurrency, billingCycle = 'monthly' } = body as { 
      planId: PlanId
      payCurrency?: string
      billingCycle?: 'monthly' | 'yearly'
    }
    
    if (!planId || !SUBSCRIPTION_PLANS[planId]) {
      return NextResponse.json(
        { success: false, error: 'Invalid plan ID' },
        { status: 400 }
      )
    }
    
    const plan = SUBSCRIPTION_PLANS[planId]
    
    if (plan.price === 0) {
      return NextResponse.json(
        { success: false, error: 'Free plan does not require payment' },
        { status: 400 }
      )
    }
    
    // Find internal user
    const user = await db.query.users.findFirst({
      where: eq(users.clerkId, clerkUserId),
    })
    
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      )
    }
    
    // Calculate price
    const price = billingCycle === 'yearly' ? plan.yearlyPrice : plan.price
    
    // Generate unique order ID
    const orderId = `sub_${planId}_${nanoid(12)}`
    
    // Get the production URL for callbacks
    const appUrl = process.env.VERCEL_URL 
      ? `https://${process.env.VERCEL_URL}`
      : process.env.PRODUCTION_URL || process.env.NEXT_PUBLIC_APP_URL || ''
    
    if (!appUrl || appUrl.includes('localhost')) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Crypto payments require a production deployment.',
        },
        { status: 400 }
      )
    }
    
    // Get request info for metadata
    const forwardedFor = request.headers.get('x-forwarded-for')
    const ipAddress = forwardedFor ? forwardedFor.split(',')[0] : 'unknown'
    const userAgent = request.headers.get('user-agent') || 'unknown'
    
    try {
      // Create invoice on NOWPayments
      const invoice = await nowPayments.createInvoice({
        priceAmount: price,
        priceCurrency: 'USD',
        payCurrency: payCurrency,
        orderId,
        orderDescription: `${plan.name} Subscription - ${billingCycle === 'yearly' ? 'Annual' : 'Monthly'}`,
        ipnCallbackUrl: `${appUrl}/api/payments/nowpayments/webhook`,
        successUrl: `${appUrl}/dashboard?subscription=success&plan=${planId}`,
        cancelUrl: `${appUrl}/pricing?payment=cancelled`,
      })
      
      // Create a placeholder subscription (will be activated on payment)
      const now = new Date()
      const periodDays = billingCycle === 'yearly' ? 365 : 30
      const periodEnd = new Date(now.getTime() + periodDays * 24 * 60 * 60 * 1000)
      
      // Store payment record - use type assertion for extended metadata
      // Note: packageId is null for subscription payments (not a credit package purchase)
      const paymentData = {
        userId: user.id,
        packageId: null, // null for subscription payments
        provider: 'nowpayments' as const,
        externalInvoiceId: invoice.id,
        orderId,
        orderDescription: invoice.order_description,
        priceAmount: String(price),
        priceCurrency: 'USD',
        status: 'pending' as const,
        creditsAmount: String(plan.credits),
        bonusCredits: '0',
        invoiceUrl: invoice.invoice_url,
        successUrl: invoice.success_url,
        cancelUrl: invoice.cancel_url,
        metadata: {
          ipAddress,
          userAgent,
          planId,
          billingCycle,
          isSubscriptionPayment: true,
        },
        expiresAt: new Date(Date.now() + 30 * 60 * 1000), // 30 min expiry
      }
      
      const [payment] = await db.insert(cryptoPayments).values(paymentData as any).returning()
      
      return NextResponse.json({
        success: true,
        data: {
          paymentId: payment.id,
          invoiceUrl: invoice.invoice_url,
          orderId,
          planId,
          price,
          billingCycle,
        }
      })
      
    } catch (paymentError) {
      console.error('NOWPayments error:', paymentError)
      return NextResponse.json(
        { 
          success: false, 
          error: paymentError instanceof Error ? paymentError.message : 'Failed to create payment'
        },
        { status: 500 }
      )
    }
    
  } catch (error) {
    console.error('Subscription payment error:', error)
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Failed to process' },
      { status: 500 }
    )
  }
}
