/**
 * Purchase Credits API
 * POST /api/credits/purchase
 * 
 * این endpoint برای شروع فرآیند خرید کردیت است
 * در production باید با Stripe یکپارچه شود
 */

import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { db } from '@/lib/db'
import { users, creditPackages } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { addCredits } from '@/lib/credits'

export async function POST(request: NextRequest) {
  try {
    const { userId: clerkUserId } = await auth()
    
    if (!clerkUserId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }
    
    const body = await request.json()
    const { packageId } = body
    
    if (!packageId) {
      return NextResponse.json(
        { error: 'Package ID is required' },
        { status: 400 }
      )
    }
    
    // پیدا کردن کاربر داخلی
    const user = await db.query.users.findFirst({
      where: eq(users.clerkId, clerkUserId),
    })
    
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }
    
    // پیدا کردن پکیج
    const pkg = await db.query.creditPackages.findFirst({
      where: eq(creditPackages.id, packageId),
    })
    
    if (!pkg || !pkg.isActive) {
      return NextResponse.json(
        { error: 'Package not found or inactive' },
        { status: 404 }
      )
    }
    
    const totalCredits = parseFloat(pkg.credits) + parseFloat(pkg.bonusCredits)
    
    // TODO: در production باید Stripe Checkout Session ساخته شود
    // فعلاً به صورت مستقیم کردیت اضافه می‌کنیم (برای تست)
    
    /*
    // Stripe Integration Example:
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)
    
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [{
        price: pkg.stripePriceId,
        quantity: 1,
      }],
      mode: 'payment',
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?credit_purchase=success`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/pricing?credit_purchase=cancelled`,
      metadata: {
        userId: user.id,
        packageId: pkg.id,
        credits: totalCredits.toString(),
      },
    })
    
    return NextResponse.json({
      success: true,
      data: {
        checkoutUrl: session.url,
        sessionId: session.id,
      },
    })
    */
    
    // Development mode: مستقیم کردیت اضافه کن
    if (process.env.NODE_ENV === 'development') {
      const result = await addCredits(
        user.id,
        totalCredits,
        'purchase',
        `Purchased ${pkg.name} package`,
        { packageId: pkg.id }
      )
      
      return NextResponse.json({
        success: true,
        data: {
          message: 'Credits added successfully (development mode)',
          creditsAdded: totalCredits,
          newBalance: result.newBalance,
          transactionId: result.transactionId,
        },
      })
    }
    
    // Production: باید Stripe راه‌اندازی شود
    return NextResponse.json(
      { error: 'Payment processing not configured' },
      { status: 501 }
    )
    
  } catch (error) {
    console.error('Error purchasing credits:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
