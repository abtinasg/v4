/**
 * Cron Job: Check Price Alerts
 * 
 * This endpoint checks all active price alerts (both stock alerts and portfolio alerts)
 * and triggers notifications when conditions are met. It sends email notifications to users.
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
import { stockAlerts, portfolioAlerts, users } from '@/lib/db/schema'
import { eq, and } from 'drizzle-orm'
import { sendEmail } from '@/lib/email'
import { alertNotificationEmail } from '@/lib/email/templates'
import { sendPushNotification } from '@/lib/notifications/push'

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

// Check if stock alert condition is met
function checkStockAlertCondition(
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

// Check if portfolio alert condition is met
function checkPortfolioAlertCondition(
  alertType: string,
  conditionValue: string | null,
  conditionPercent: string | null,
  currentPrice: number
): boolean {
  switch (alertType) {
    case 'price_above':
      if (!conditionValue) return false
      return currentPrice >= parseFloat(conditionValue)
    case 'price_below':
      if (!conditionValue) return false
      return currentPrice <= parseFloat(conditionValue)
    case 'percent_change':
      // This would need previous price to calculate, for now just check if configured
      return conditionPercent !== null
    default:
      return false
  }
}

// Format condition for email (stock alerts)
function formatStockCondition(condition: string, targetPrice: number): string {
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

// Format condition for email (portfolio alerts)
function formatPortfolioCondition(alertType: string, conditionValue: string | null, conditionPercent: string | null): string {
  switch (alertType) {
    case 'price_above':
      return `Price reached above $${conditionValue ? parseFloat(conditionValue).toFixed(2) : '0.00'}`
    case 'price_below':
      return `Price dropped below $${conditionValue ? parseFloat(conditionValue).toFixed(2) : '0.00'}`
    case 'percent_change':
      return `Percent change alert: ${conditionPercent}%`
    case 'portfolio_value':
      return `Portfolio value alert`
    case 'daily_gain_loss':
      return `Daily gain/loss alert`
    case 'news':
      return `News alert`
    default:
      return `Portfolio alert triggered`
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
    stockAlerts: { checked: 0, triggered: 0, emailsSent: 0 },
    portfolioAlerts: { checked: 0, triggered: 0, emailsSent: 0 },
    errors: [] as string[],
  }
  
  try {
    // ========== PROCESS STOCK ALERTS ==========
    const activeStockAlerts = await db
      .select({
        alert: stockAlerts,
        user: users,
      })
      .from(stockAlerts)
      .innerJoin(users, eq(stockAlerts.userId, users.id))
      .where(eq(stockAlerts.isActive, true))
    
    if (activeStockAlerts.length > 0) {
      // Group alerts by symbol to minimize API calls
      const stockAlertsBySymbol = new Map<string, typeof activeStockAlerts>()
      for (const item of activeStockAlerts) {
        const symbol = item.alert.symbol
        if (!stockAlertsBySymbol.has(symbol)) {
          stockAlertsBySymbol.set(symbol, [])
        }
        stockAlertsBySymbol.get(symbol)!.push(item)
      }
      
      // Process each symbol
      for (const [symbol, symbolAlerts] of stockAlertsBySymbol) {
        const currentPrice = await fetchCurrentPrice(symbol)
        
        if (currentPrice === null) {
          results.errors.push(`Failed to fetch price for ${symbol}`)
          continue
        }
        
        // Check each alert for this symbol
        for (const { alert, user } of symbolAlerts) {
          results.stockAlerts.checked++
          
          const targetPrice = parseFloat(alert.targetPrice)
          const isTriggered = checkStockAlertCondition(
            alert.condition,
            targetPrice,
            currentPrice
          )
          
          if (isTriggered) {
            results.stockAlerts.triggered++
            
            // Mark alert as triggered
            await db
              .update(stockAlerts)
              .set({
                isActive: false,
                triggeredAt: new Date(),
                updatedAt: new Date(),
              })
              .where(eq(stockAlerts.id, alert.id))
            
            // Send notifications
            const conditionText = formatStockCondition(alert.condition, targetPrice)
            
            // Send email notification
            if (user.email) {
              try {
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
                
                results.stockAlerts.emailsSent++
              } catch (emailError) {
                results.errors.push(`Failed to send email for stock alert ${alert.id}: ${emailError}`)
              }
            }
            
            // Send push notification
            try {
              await sendPushNotification(user.id, {
                title: `🔔 ${symbol} Alert`,
                body: `${conditionText} - Current price: $${currentPrice.toFixed(2)}`,
                tag: `stock-alert-${alert.id}`,
                data: {
                  type: 'stock_alert',
                  symbol,
                  price: currentPrice,
                  alertId: alert.id,
                },
              })
            } catch (pushError) {
              console.error(`Failed to send push for stock alert ${alert.id}:`, pushError)
            }
          }
        }
        
        // Small delay between symbols to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 100))
      }
    }
    
    // ========== PROCESS PORTFOLIO ALERTS ==========
    const activePortfolioAlerts = await db
      .select({
        alert: portfolioAlerts,
        user: users,
      })
      .from(portfolioAlerts)
      .innerJoin(users, eq(portfolioAlerts.userId, users.id))
      .where(eq(portfolioAlerts.isActive, true))
    
    if (activePortfolioAlerts.length > 0) {
      // Group alerts by symbol (only for price-based alerts)
      const portfolioAlertsBySymbol = new Map<string, typeof activePortfolioAlerts>()
      for (const item of activePortfolioAlerts) {
        if (item.alert.symbol) {
          const symbol = item.alert.symbol
          if (!portfolioAlertsBySymbol.has(symbol)) {
            portfolioAlertsBySymbol.set(symbol, [])
          }
          portfolioAlertsBySymbol.get(symbol)!.push(item)
        }
      }
      
      // Process each symbol
      for (const [symbol, symbolAlerts] of portfolioAlertsBySymbol) {
        const currentPrice = await fetchCurrentPrice(symbol)
        
        if (currentPrice === null) {
          results.errors.push(`Failed to fetch price for portfolio alert symbol ${symbol}`)
          continue
        }
        
        // Check each alert for this symbol
        for (const { alert, user } of symbolAlerts) {
          results.portfolioAlerts.checked++
          
          const isTriggered = checkPortfolioAlertCondition(
            alert.alertType,
            alert.conditionValue,
            alert.conditionPercent,
            currentPrice
          )
          
          if (isTriggered && alert.isEmailEnabled) {
            results.portfolioAlerts.triggered++
            
            // Update alert trigger info (keep it active for recurring alerts)
            await db
              .update(portfolioAlerts)
              .set({
                lastTriggeredAt: new Date(),
                triggerCount: (alert.triggerCount || 0) + 1,
                updatedAt: new Date(),
              })
              .where(eq(portfolioAlerts.id, alert.id))
            
            // Send notifications
            const conditionText = formatPortfolioCondition(
              alert.alertType,
              alert.conditionValue,
              alert.conditionPercent
            )
            
            // Send email notification
            if (user.email && alert.isEmailEnabled) {
              try {
                const emailHtml = alertNotificationEmail(
                  user.email.split('@')[0],
                  alert.alertType,
                  symbol,
                  conditionText,
                  `$${currentPrice.toFixed(2)}`
                )
                
                await sendEmail({
                  to: user.email,
                  subject: `📊 Portfolio Alert: ${symbol} - ${conditionText}`,
                  html: emailHtml,
                })
                
                results.portfolioAlerts.emailsSent++
              } catch (emailError) {
                results.errors.push(`Failed to send email for portfolio alert ${alert.id}: ${emailError}`)
              }
            }
            
            // Send push notification
            if (alert.isPushEnabled) {
              try {
                await sendPushNotification(user.id, {
                  title: `📊 ${symbol} Portfolio Alert`,
                  body: `${conditionText} - Current price: $${currentPrice.toFixed(2)}`,
                  tag: `portfolio-alert-${alert.id}`,
                  data: {
                    type: 'portfolio_alert',
                    symbol,
                    price: currentPrice,
                    alertId: alert.id,
                    portfolioId: alert.portfolioId,
                  },
                })
              } catch (pushError) {
                console.error(`Failed to send push for portfolio alert ${alert.id}:`, pushError)
              }
            }
          }
        }
        
        // Small delay between symbols to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 100))
      }
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
