/**
 * Get Available Cryptocurrencies API
 * GET /api/payments/nowpayments/currencies
 * 
 * Returns list of supported cryptocurrencies for payment
 */

import { NextResponse } from 'next/server'
import { nowPayments } from '@/lib/payments/nowpayments'

// Cache currencies for 1 hour
let cachedCurrencies: { currencies: string[]; timestamp: number } | null = null
const CACHE_DURATION = 60 * 60 * 1000 // 1 hour

export async function GET() {
  try {
    // Check cache
    if (cachedCurrencies && Date.now() - cachedCurrencies.timestamp < CACHE_DURATION) {
      return NextResponse.json({
        success: true,
        data: cachedCurrencies.currencies,
        cached: true,
      })
    }
    
    // Fetch from NOWPayments
    const result = await nowPayments.getAvailableCurrencies()
    
    // Popular currencies to highlight
    const popularCurrencies = ['btc', 'eth', 'usdt', 'ltc', 'xrp', 'doge', 'bnb', 'sol', 'trx', 'matic']
    
    // Sort currencies: popular ones first, then alphabetically
    const sortedCurrencies = result.currencies.sort((a, b) => {
      const aPopular = popularCurrencies.indexOf(a.toLowerCase())
      const bPopular = popularCurrencies.indexOf(b.toLowerCase())
      
      if (aPopular !== -1 && bPopular !== -1) {
        return aPopular - bPopular
      }
      if (aPopular !== -1) return -1
      if (bPopular !== -1) return 1
      return a.localeCompare(b)
    })
    
    // Update cache
    cachedCurrencies = {
      currencies: sortedCurrencies,
      timestamp: Date.now(),
    }
    
    return NextResponse.json({
      success: true,
      data: sortedCurrencies,
      popular: popularCurrencies,
      cached: false,
    })
  } catch (error) {
    console.error('Get currencies error:', error)
    
    // Return fallback list if API fails
    return NextResponse.json({
      success: true,
      data: ['btc', 'eth', 'usdt', 'ltc', 'xrp', 'doge', 'bnb', 'sol'],
      fallback: true,
    })
  }
}
