/**
 * Credit Packages API
 * GET /api/credits/packages
 */

import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { creditPackages } from '@/lib/db/schema'
import { eq, asc } from 'drizzle-orm'

export async function GET(request: NextRequest) {
  try {
    // دریافت پکیج‌های فعال
    const packages = await db.select()
      .from(creditPackages)
      .where(eq(creditPackages.isActive, true))
      .orderBy(asc(creditPackages.sortOrder))
    
    return NextResponse.json({
      success: true,
      data: {
        packages: packages.map(p => ({
          id: p.id,
          name: p.name,
          description: p.description,
          credits: parseFloat(p.credits),
          bonusCredits: parseFloat(p.bonusCredits),
          totalCredits: parseFloat(p.credits) + parseFloat(p.bonusCredits),
          price: parseFloat(p.price),
          currency: p.currency,
          isPopular: p.isPopular,
          pricePerCredit: parseFloat(p.price) / (parseFloat(p.credits) + parseFloat(p.bonusCredits)),
        })),
      },
    })
  } catch (error) {
    console.error('Error fetching credit packages:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
