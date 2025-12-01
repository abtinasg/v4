/**
 * Get Payment Status API
 * GET /api/payments/nowpayments/status/[paymentId]
 * 
 * Returns the status of a specific payment
 */

import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { db } from '@/lib/db'
import { users, cryptoPayments } from '@/lib/db/schema'
import { eq, and } from 'drizzle-orm'
import { nowPayments } from '@/lib/payments/nowpayments'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ paymentId: string }> }
) {
  try {
    const { userId: clerkUserId } = await auth()
    
    if (!clerkUserId) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }
    
    const { paymentId } = await params
    
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
    
    // Find payment record
    const payment = await db.query.cryptoPayments.findFirst({
      where: and(
        eq(cryptoPayments.id, paymentId),
        eq(cryptoPayments.userId, user.id)
      ),
    })
    
    if (!payment) {
      return NextResponse.json(
        { success: false, error: 'Payment not found' },
        { status: 404 }
      )
    }
    
    // If we have an external payment ID, fetch latest status from NOWPayments
    let externalStatus = null
    if (payment.externalPaymentId) {
      try {
        externalStatus = await nowPayments.getPaymentStatus(payment.externalPaymentId)
      } catch (error) {
        console.error('Failed to fetch NOWPayments status:', error)
      }
    }
    
    return NextResponse.json({
      success: true,
      data: {
        id: payment.id,
        orderId: payment.orderId,
        status: payment.status,
        priceAmount: payment.priceAmount,
        priceCurrency: payment.priceCurrency,
        payAmount: payment.payAmount,
        payCurrency: payment.payCurrency,
        payAddress: payment.payAddress,
        actuallyPaid: payment.actuallyPaid,
        creditsAmount: payment.creditsAmount,
        bonusCredits: payment.bonusCredits,
        creditsAdded: payment.creditsAdded,
        invoiceUrl: payment.invoiceUrl,
        expiresAt: payment.expiresAt,
        paidAt: payment.paidAt,
        createdAt: payment.createdAt,
        metadata: payment.metadata,
        externalStatus: externalStatus ? {
          status: externalStatus.payment_status,
          actuallyPaid: externalStatus.actually_paid,
          payAmount: externalStatus.pay_amount,
        } : null,
      },
    })
  } catch (error) {
    console.error('Get payment status error:', error)
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
