/**
 * NOWPayments IPN Webhook Handler
 * POST /api/payments/nowpayments/webhook
 * 
 * Handles payment status updates from NOWPayments
 * Supports both credit package purchases and subscription payments
 */

import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { cryptoPayments, userSubscriptions } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { nowPayments, type PaymentStatus } from '@/lib/payments/nowpayments'
import { addCredits } from '@/lib/credits'

interface IPNPayload {
  payment_id: number
  payment_status: PaymentStatus
  pay_address: string
  price_amount: number
  price_currency: string
  pay_amount: number
  actually_paid: number
  pay_currency: string
  order_id: string
  order_description: string
  purchase_id: string
  created_at: string
  updated_at: string
  outcome_amount?: number
  outcome_currency?: string
  network?: string
}

export async function POST(request: NextRequest) {
  try {
    // Get raw body for signature verification
    const rawBody = await request.text()
    
    // Get signature from headers
    const signature = request.headers.get('x-nowpayments-sig')
    
    // Verify signature if IPN secret is configured
    if (process.env.NOWPAYMENTS_IPN_SECRET && signature) {
      const isValid = nowPayments.verifyIPNSignature(rawBody, signature)
      if (!isValid) {
        console.error('Invalid IPN signature')
        return NextResponse.json(
          { success: false, error: 'Invalid signature' },
          { status: 401 }
        )
      }
    }
    
    // Parse payload
    const payload: IPNPayload = JSON.parse(rawBody)
    
    console.log('NOWPayments IPN received:', {
      paymentId: payload.payment_id,
      status: payload.payment_status,
      orderId: payload.order_id,
      actuallyPaid: payload.actually_paid,
    })
    
    // Find payment record by order_id
    const payment = await db.query.cryptoPayments.findFirst({
      where: eq(cryptoPayments.orderId, payload.order_id),
    })
    
    if (!payment) {
      console.error('Payment not found for order:', payload.order_id)
      return NextResponse.json(
        { success: false, error: 'Payment not found' },
        { status: 404 }
      )
    }
    
    // Map NOWPayments status to our schema
    const statusMap: Record<PaymentStatus, typeof cryptoPayments.$inferSelect.status> = {
      'waiting': 'waiting',
      'confirming': 'confirming',
      'confirmed': 'confirmed',
      'sending': 'sending',
      'partially_paid': 'partially_paid',
      'finished': 'finished',
      'failed': 'failed',
      'refunded': 'refunded',
      'expired': 'expired',
    }
    
    const newStatus = statusMap[payload.payment_status] || 'pending'
    
    // Update payment record
    const updateData: Partial<typeof cryptoPayments.$inferInsert> = {
      status: newStatus,
      externalPaymentId: payload.payment_id.toString(),
      payAmount: payload.pay_amount?.toString(),
      payCurrency: payload.pay_currency,
      payAddress: payload.pay_address,
      actuallyPaid: payload.actually_paid?.toString(),
      updatedAt: new Date(),
      metadata: {
        ...(payment.metadata as object || {}),
        network: payload.network,
        purchaseId: payload.purchase_id,
        outcomeAmount: payload.outcome_amount,
        outcomeCurrency: payload.outcome_currency,
      },
    }
    
    // If payment is finished, add credits
    if (payload.payment_status === 'finished' && !payment.creditsAdded) {
      updateData.creditsAdded = true
      updateData.paidAt = new Date()
      
      // Check if this is a subscription payment
      const metadata = payment.metadata as { isSubscriptionPayment?: boolean; planId?: string; billingCycle?: string } | null
      const isSubscriptionPayment = metadata?.isSubscriptionPayment === true
      
      if (isSubscriptionPayment && metadata?.planId) {
        // Handle subscription payment
        try {
          const now = new Date()
          const billingCycle = metadata.billingCycle || 'monthly'
          const periodDays = billingCycle === 'yearly' ? 365 : 30
          const periodEnd = new Date(now.getTime() + periodDays * 24 * 60 * 60 * 1000)
          
          // Create or update subscription
          const existingSub = await db.query.userSubscriptions.findFirst({
            where: eq(userSubscriptions.userId, payment.userId),
          })
          
          if (existingSub) {
            // Update existing subscription
            await db.update(userSubscriptions)
              .set({
                planId: metadata.planId as 'free' | 'pro' | 'premium' | 'enterprise',
                status: 'active',
                currentPeriodStart: now,
                currentPeriodEnd: periodEnd,
                trialEndsAt: null,
                paymentMethod: 'crypto',
                lastPaymentId: payment.id,
                updatedAt: now,
              })
              .where(eq(userSubscriptions.id, existingSub.id))
          } else {
            // Create new subscription
            await db.insert(userSubscriptions).values({
              userId: payment.userId,
              planId: metadata.planId as 'free' | 'pro' | 'premium' | 'enterprise',
              status: 'active',
              currentPeriodStart: now,
              currentPeriodEnd: periodEnd,
              paymentMethod: 'crypto',
              lastPaymentId: payment.id,
            })
          }
          
          // Add subscription credits
          const totalCredits = parseFloat(payment.creditsAmount)
          await addCredits(
            payment.userId,
            totalCredits,
            'purchase',
            `${metadata.planId} subscription - ${billingCycle}`,
            {
              orderId: payload.order_id,
              paymentId: payload.payment_id.toString(),
              payCurrency: payload.pay_currency,
              actuallyPaid: payload.actually_paid,
            }
          )
          
          console.log(`Subscription activated for user ${payment.userId}: ${metadata.planId}`)
        } catch (subError) {
          console.error('Failed to activate subscription:', subError)
          updateData.creditsAdded = false
        }
      } else {
        // Regular credit package purchase
        // Calculate total credits
        const totalCredits = parseFloat(payment.creditsAmount) + parseFloat(payment.bonusCredits)
        
        // Add credits to user
        try {
          await addCredits(
            payment.userId,
            totalCredits,
            'purchase',
            `Crypto payment - Order: ${payload.order_id}`,
            {
              packageId: payment.packageId,
              orderId: payload.order_id,
              paymentId: payload.payment_id.toString(),
              payCurrency: payload.pay_currency,
              actuallyPaid: payload.actually_paid,
            }
          )
          
          console.log(`Credits added for user ${payment.userId}: ${totalCredits}`)
        } catch (creditError) {
          console.error('Failed to add credits:', creditError)
          // Don't fail the webhook, but don't mark as credits added
          updateData.creditsAdded = false
        }
      }
    }
    
    // Update payment in database
    await db.update(cryptoPayments)
      .set(updateData)
      .where(eq(cryptoPayments.id, payment.id))
    
    console.log(`Payment ${payment.id} updated to status: ${newStatus}`)
    
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Webhook error:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

// Allow GET for webhook verification
export async function GET() {
  return NextResponse.json({ status: 'Webhook endpoint active' })
}
