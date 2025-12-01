/**
 * Create NOWPayments Invoice API
 * POST /api/payments/nowpayments/create
 * 
 * Creates a crypto payment invoice for credit package purchase
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
    
    if (!packageId) {
      return NextResponse.json(
        { success: false, error: 'Package ID is required' },
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
    
    // Check if we have a valid URL for NOWPayments
    if (!appUrl || appUrl.includes('localhost')) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Crypto payments require a production deployment. Please set PRODUCTION_URL in environment variables.',
          hint: 'NOWPayments requires a valid public URL for callbacks.'
        },
        { status: 400 }
      )
    }
    
    try {
      // Create invoice on NOWPayments
      const invoice = await nowPayments.createInvoice({
        priceAmount: price,
        priceCurrency: 'USD',
        payCurrency: payCurrency, // Optional: let user choose or null for any
        orderId,
        orderDescription: `${pkg.name} - ${totalCredits} Credits`,
        ipnCallbackUrl: `${appUrl}/api/payments/nowpayments/webhook`,
        successUrl: `${appUrl}/dashboard?payment=success&order=${orderId}`,
        cancelUrl: `${appUrl}/pricing?payment=cancelled`,
      })
      
      // Save payment record to database
      const [payment] = await db.insert(cryptoPayments).values({
        userId: user.id,
        packageId: pkg.id,
        provider: 'nowpayments',
        externalInvoiceId: invoice.id,
        orderId,
        orderDescription: `${pkg.name} - ${totalCredits} Credits`,
        priceAmount: price.toString(),
        priceCurrency: 'USD',
        payCurrency: payCurrency || null,
        status: 'pending',
        creditsAmount: pkg.credits,
        bonusCredits: pkg.bonusCredits,
        invoiceUrl: invoice.invoice_url,
        successUrl: invoice.success_url,
        cancelUrl: invoice.cancel_url,
        metadata: {
          ipAddress,
          userAgent,
        },
        expiresAt: new Date(Date.now() + 60 * 60 * 1000), // 1 hour expiry
      }).returning()
      
      return NextResponse.json({
        success: true,
        data: {
          paymentId: payment.id,
          invoiceUrl: invoice.invoice_url,
          orderId,
          expiresAt: payment.expiresAt,
        },
      })
    } catch (apiError) {
      console.error('NOWPayments API error:', apiError)
      return NextResponse.json(
        { 
          success: false, 
          error: 'Failed to create payment invoice',
          details: apiError instanceof Error ? apiError.message : 'Unknown error'
        },
        { status: 500 }
      )
    }
  } catch (error) {
    console.error('Create payment error:', error)
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
