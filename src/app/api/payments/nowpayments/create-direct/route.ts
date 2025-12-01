/**
 * Create Direct NOWPayments Payment API
 * POST /api/payments/nowpayments/create-direct
 * 
 * Creates a direct crypto payment (returns wallet address, not hosted page)
 * This allows for custom UI on our side
 */

import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { db } from '@/lib/db'
import { users, creditPackages, cryptoPayments } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { nowPayments } from '@/lib/payments/nowpayments'
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
    const { packageId, payCurrency } = body
    
    if (!packageId || !payCurrency) {
      return NextResponse.json(
        { success: false, error: 'Package ID and pay currency are required' },
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
    
    // Find package
    const pkg = await db.query.creditPackages.findFirst({
      where: eq(creditPackages.id, packageId),
    })
    
    if (!pkg || !pkg.isActive) {
      return NextResponse.json(
        { success: false, error: 'Package not found or inactive' },
        { status: 404 }
      )
    }
    
    const totalCredits = parseFloat(pkg.credits) + parseFloat(pkg.bonusCredits)
    const price = parseFloat(pkg.price)
    
    // Generate unique order ID
    const orderId = `order_${nanoid(16)}`
    
    // Get request info for metadata
    const forwardedFor = request.headers.get('x-forwarded-for')
    const ipAddress = forwardedFor ? forwardedFor.split(',')[0] : 'unknown'
    const userAgent = request.headers.get('user-agent') || 'unknown'
    
    // Get the production URL for callbacks
    const appUrl = process.env.VERCEL_URL 
      ? `https://${process.env.VERCEL_URL}`
      : process.env.PRODUCTION_URL || process.env.NEXT_PUBLIC_APP_URL || ''
    
    try {
      // Create direct payment on NOWPayments (returns wallet address)
      const payment = await nowPayments.createPayment({
        priceAmount: price,
        priceCurrency: 'USD',
        payCurrency: payCurrency.toLowerCase(),
        orderId,
        orderDescription: `${pkg.name} - ${totalCredits} Credits`,
        ipnCallbackUrl: `${appUrl}/api/payments/nowpayments/webhook`,
      })
      
      // Save payment record to database
      const [dbPayment] = await db.insert(cryptoPayments).values({
        userId: user.id,
        packageId: pkg.id,
        provider: 'nowpayments',
        externalPaymentId: payment.payment_id,
        externalInvoiceId: null,
        orderId,
        orderDescription: `${pkg.name} - ${totalCredits} Credits`,
        priceAmount: price.toString(),
        priceCurrency: 'USD',
        payCurrency: payment.pay_currency.toUpperCase(),
        payAmount: payment.pay_amount.toString(),
        payAddress: payment.pay_address,
        status: 'waiting',
        creditsAmount: pkg.credits,
        bonusCredits: pkg.bonusCredits,
        metadata: {
          ipAddress,
          userAgent,
          purchaseId: payment.purchase_id,
          network: payment.network,
        },
        expiresAt: new Date(payment.expiration_estimate_date),
      }).returning()
      
      return NextResponse.json({
        success: true,
        data: {
          paymentId: dbPayment.id,
          externalPaymentId: payment.payment_id,
          payAddress: payment.pay_address,
          payAmount: payment.pay_amount,
          payCurrency: payment.pay_currency.toUpperCase(),
          network: payment.network,
          orderId,
          priceAmount: price,
          priceCurrency: 'USD',
          expiresAt: payment.expiration_estimate_date,
          packageName: pkg.name,
          totalCredits,
        },
      })
    } catch (apiError) {
      console.error('NOWPayments API error:', apiError)
      return NextResponse.json(
        { 
          success: false, 
          error: 'Failed to create payment',
          details: apiError instanceof Error ? apiError.message : 'Unknown error'
        },
        { status: 500 }
      )
    }
  } catch (error) {
    console.error('Create direct payment error:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Internal server error' 
      },
      { status: 500 }
    )
  }
}
