/**
 * Cron Job: Check Price Alerts
 * 
 * This endpoint checks all active price alerts and triggers notifications
 * when conditions are met. It sends email notifications to users.
 * 
 * Can be called by:
 * 1. Vercel Cron (with x-vercel-cron header)
 * 2. External cron service like cron-job.org (with Authorization header)
 * 
 * Recommended schedule: Every 5 minutes
 * URL: https://your-domain.com/api/cron/check-alerts
 */

import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { stockAlerts, users } from '@/lib/db/schema'
import { eq, and } from 'drizzle-orm'
import { sendEmail } from '@/lib/email'
import { alertNotificationEmail } from '@/lib/email/templates'

// Verify cron authorization
function verifyCronAuth(request: NextRequest): boolean {
  // Allow in development mode
  if (process.env.NODE_ENV === 'development') {
    return true
  }
  
  // Vercel Cron
  if (request.headers.get('x-vercel-cron') === '1') {
    return true
  }
  
  // External cron service with Bearer token
  const authHeader = request.headers.get('authorization')
  if (authHeader?.startsWith('Bearer ')) {
    const token = authHeader.slice(7)
    return token === process.env.CRON_SECRET
  }
  
  return false
}

// Fetch current price for a symbol
async function fetchCurrentPrice(symbol: string): Promise<number | null> {
  try {
    // Try FMP API first
    const fmpKey = process.env.FMP_API_KEY
    if (fmpKey) {
      const response = await fetch(
        `https://financialmodelingprep.com/api/v3/quote-short/${symbol}?apikey=${fmpKey}`,
        { next: { revalidate: 60 } }
      )
      
      if (response.ok) {
        const data = await response.json()
        if (data?.[0]?.price) {
          return data[0].price
        }
      }
    }
    
    // Fallback to Yahoo Finance
    const yahooResponse = await fetch(
      `https://query1.finance.yahoo.com/v8/finance/chart/${symbol}?interval=1m&range=1d`,
      { next: { revalidate: 60 } }
    )
    
    if (yahooResponse.ok) {
      const data = await yahooResponse.json()
      const price = data?.chart?.result?.[0]?.meta?.regularMarketPrice
      if (price) return price
    }
    
    return null
  } catch (error) {
    console.error(`Error fetching price for ${symbol}:`, error)
    return null
  }
}

// Check if alert condition is met
function checkAlertCondition(
  condition: string,
  targetPrice: number,
  currentPrice: number,
  previousPrice?: number
): boolean {
  switch (condition) {
    case 'above':
      return currentPrice >= targetPrice
    case 'below':
      return currentPrice <= targetPrice
    case 'crosses_above':
      return previousPrice !== undefined && 
             previousPrice < targetPrice && 
             currentPrice >= targetPrice
    case 'crosses_below':
      return previousPrice !== undefined && 
             previousPrice > targetPrice && 
             currentPrice <= targetPrice
    default:
      return false
  }
}

// Format condition for email
function formatCondition(condition: string, targetPrice: number): string {
  switch (condition) {
    case 'above':
      return `Price reached above $${targetPrice.toFixed(2)}`
    case 'below':
      return `Price dropped below $${targetPrice.toFixed(2)}`
    case 'crosses_above':
      return `Price crossed above $${targetPrice.toFixed(2)}`
    case 'crosses_below':
      return `Price crossed below $${targetPrice.toFixed(2)}`
    default:
      return `Target: $${targetPrice.toFixed(2)}`
  }
}

export async function GET(request: NextRequest) {
  // Verify authorization
  if (!verifyCronAuth(request)) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    )
  }
  
  const startTime = Date.now()
  const results = {
    checked: 0,
    triggered: 0,
    emailsSent: 0,
    errors: [] as string[],
  }
  
  try {
    // Get all active alerts with user info
    const activeAlerts = await db
      .select({
        alert: stockAlerts,
        user: users,
      })
      .from(stockAlerts)
      .innerJoin(users, eq(stockAlerts.userId, users.id))
      .where(eq(stockAlerts.isActive, true))
    
    if (activeAlerts.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'No active alerts to check',
        duration: Date.now() - startTime,
      })
    }
    
    // Group alerts by symbol to minimize API calls
    const alertsBySymbol = new Map<string, typeof activeAlerts>()
    for (const item of activeAlerts) {
      const symbol = item.alert.symbol
      if (!alertsBySymbol.has(symbol)) {
        alertsBySymbol.set(symbol, [])
      }
      alertsBySymbol.get(symbol)!.push(item)
    }
    
    // Process each symbol
    for (const [symbol, symbolAlerts] of alertsBySymbol) {
      const currentPrice = await fetchCurrentPrice(symbol)
      
      if (currentPrice === null) {
        results.errors.push(`Failed to fetch price for ${symbol}`)
        continue
      }
      
      // Check each alert for this symbol
      for (const { alert, user } of symbolAlerts) {
        results.checked++
        
        const targetPrice = parseFloat(alert.targetPrice)
        const isTriggered = checkAlertCondition(
          alert.condition,
          targetPrice,
          currentPrice
        )
        
        if (isTriggered) {
          results.triggered++
          
          // Mark alert as triggered
          await db
            .update(stockAlerts)
            .set({
              isActive: false,
              triggeredAt: new Date(),
              updatedAt: new Date(),
            })
            .where(eq(stockAlerts.id, alert.id))
          
          // Send email notification
          if (user.email) {
            try {
              const conditionText = formatCondition(alert.condition, targetPrice)
              const emailHtml = alertNotificationEmail(
                user.email.split('@')[0],
                alert.condition,
                symbol,
                conditionText,
                `$${currentPrice.toFixed(2)}`
              )
              
              await sendEmail({
                to: user.email,
                subject: `🔔 Price Alert: ${symbol} - ${conditionText}`,
                html: emailHtml,
              })
              
              results.emailsSent++
            } catch (emailError) {
              results.errors.push(`Failed to send email for alert ${alert.id}: ${emailError}`)
            }
          }
        }
      }
      
      // Small delay between symbols to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 100))
    }
    
    return NextResponse.json({
      success: true,
      results,
      duration: Date.now() - startTime,
    })
    
  } catch (error) {
    console.error('Check alerts error:', error)
    return NextResponse.json(
      { 
        error: 'Failed to check alerts',
        details: error instanceof Error ? error.message : 'Unknown error',
        results,
        duration: Date.now() - startTime,
      },
      { status: 500 }
    )
  }
}

// Also support POST for some cron services
export async function POST(request: NextRequest) {
  return GET(request)
}
