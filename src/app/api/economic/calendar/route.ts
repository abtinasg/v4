import { NextResponse } from 'next/server'

// Force dynamic rendering for this API route
export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

interface EconomicEvent {
  date: string
  time: string
  event: string
  impact: 'high' | 'medium' | 'low'
  actual: string | null
  forecast: string | null
  previous: string | null
  country: string
}

// Simple seeded random for consistent results
function seededRandom(seed: number): () => number {
  return function() {
    seed = (seed * 9301 + 49297) % 233280
    return seed / 233280
  }
}

// Cache for economic calendar (refresh every 6 hours)
let cachedEvents: EconomicEvent[] | null = null
let cacheTimestamp: number = 0
const CACHE_DURATION = 6 * 60 * 60 * 1000 // 6 hours

// Get upcoming and recent economic events
function generateEconomicCalendar(): EconomicEvent[] {
  const now = new Date()
  
  // Check cache - refresh at start of each day or every 6 hours
  const currentDay = now.toDateString()
  const cacheAge = Date.now() - cacheTimestamp
  
  if (cachedEvents && cacheAge < CACHE_DURATION) {
    return cachedEvents
  }
  
  // Use date as seed for consistent random values per day
  const dateSeed = now.getFullYear() * 10000 + (now.getMonth() + 1) * 100 + now.getDate()
  const random = seededRandom(dateSeed)
  
  const events: EconomicEvent[] = []
  
  // Generate events for the past few days and upcoming days
  const eventTemplates = [
    { event: 'Initial Jobless Claims', impact: 'high' as const, typical: '220K', time: '08:30' },
    { event: 'Nonfarm Payrolls', impact: 'high' as const, typical: '180K', time: '08:30' },
    { event: 'GDP Growth Rate QoQ', impact: 'high' as const, typical: '2.5%', time: '08:30' },
    { event: 'Inflation Rate YoY', impact: 'high' as const, typical: '3.2%', time: '08:30' },
    { event: 'Core PCE Price Index MoM', impact: 'high' as const, typical: '0.2%', time: '08:30' },
    { event: 'Fed Interest Rate Decision', impact: 'high' as const, typical: '5.25%', time: '14:00' },
    { event: 'Consumer Confidence', impact: 'medium' as const, typical: '102.5', time: '10:00' },
    { event: 'Retail Sales MoM', impact: 'medium' as const, typical: '0.3%', time: '08:30' },
    { event: 'Industrial Production MoM', impact: 'medium' as const, typical: '0.2%', time: '09:15' },
    { event: 'Housing Starts', impact: 'medium' as const, typical: '1.35M', time: '08:30' },
    { event: 'Durable Goods Orders MoM', impact: 'medium' as const, typical: '0.5%', time: '08:30' },
    { event: 'ISM Manufacturing PMI', impact: 'high' as const, typical: '48.5', time: '10:00' },
    { event: 'ISM Services PMI', impact: 'high' as const, typical: '52.0', time: '10:00' },
    { event: 'ADP Employment Change', impact: 'medium' as const, typical: '150K', time: '08:15' },
    { event: 'Trade Balance', impact: 'medium' as const, typical: '-$65B', time: '08:30' },
    { event: 'Michigan Consumer Sentiment', impact: 'medium' as const, typical: '68.5', time: '10:00' },
    { event: 'Building Permits', impact: 'low' as const, typical: '1.45M', time: '08:30' },
    { event: 'Existing Home Sales', impact: 'low' as const, typical: '4.0M', time: '10:00' },
    { event: 'New Home Sales', impact: 'low' as const, typical: '680K', time: '10:00' },
    { event: 'Crude Oil Inventories', impact: 'low' as const, typical: '-1.5M', time: '10:30' },
  ]

  // Generate events for past 3 days and next 7 days
  for (let i = -3; i <= 7; i++) {
    const date = new Date(now)
    date.setDate(date.getDate() + i)
    
    // Skip weekends
    if (date.getDay() === 0 || date.getDay() === 6) continue
    
    // Add 1-3 events per day (consistent based on seed)
    const numEvents = Math.floor(random() * 3) + 1
    const usedIndices = new Set<number>()
    
    for (let j = 0; j < numEvents; j++) {
      let index: number
      do {
        index = Math.floor(random() * eventTemplates.length)
      } while (usedIndices.has(index))
      usedIndices.add(index)
      
      const template = eventTemplates[index]
      
      // Parse the typical value to generate realistic actual/forecast
      const baseValue = parseFloat(template.typical.replace(/[^0-9.-]/g, ''))
      const variation = baseValue * 0.1 // 10% variation
      const actualValue = baseValue + (random() - 0.5) * variation
      const forecastValue = baseValue + (random() - 0.5) * variation * 0.5
      
      // Format values to match the template format
      const formatValue = (val: number) => {
        if (template.typical.includes('K')) return `${Math.round(val)}K`
        if (template.typical.includes('M')) return `${val.toFixed(2)}M`
        if (template.typical.includes('B')) return `$${Math.abs(val).toFixed(0)}B`
        if (template.typical.includes('%')) return `${val.toFixed(1)}%`
        return val.toFixed(1)
      }
      
      // Past events have actual values, future events don't
      const isPast = i < 0 || (i === 0 && date.getHours() < 12)
      
      events.push({
        date: date.toISOString(),
        time: template.time,
        event: template.event,
        impact: template.impact,
        actual: isPast ? formatValue(actualValue) : null,
        forecast: formatValue(forecastValue),
        previous: formatValue(baseValue),
        country: 'US',
      })
    }
  }
  
  // Sort by date
  events.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
  
  // Update cache
  cachedEvents = events
  cacheTimestamp = Date.now()
  
  return events
}

export async function GET() {
  try {
    const events = generateEconomicCalendar()
    
    return NextResponse.json({
      success: true,
      events,
      lastUpdated: new Date().toISOString(),
    })
  } catch (error) {
    console.error('Error generating economic calendar:', error)
    return NextResponse.json({
      success: false,
      events: [],
      error: 'Failed to generate economic calendar',
    }, { status: 500 })
  }
}
