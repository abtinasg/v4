/**
 * AI Market Report API - Simplified Edition
 * 
 * Returns a simple AI-generated market overview
 */

import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'  // Explicitly use Node.js runtime
export const maxDuration = 30

// Simple static responses for now (can be made dynamic later)
const generateSimpleReport = () => {
  const marketMoods = ['bullish', 'bearish', 'neutral', 'mixed'] as const
  const randomMood = marketMoods[Math.floor(Math.random() * marketMoods.length)]
  
  const summaries: Record<typeof marketMoods[number], string> = {
    bullish: "Markets are showing positive momentum with strong buyer interest. Major indices are trending upward with healthy volume. Risk appetite remains elevated as investors rotate into growth sectors.",
    bearish: "Markets are experiencing downward pressure as sellers dominate. Defensive sectors are outperforming while growth stocks face headwinds. Caution is advised as volatility increases.",
    neutral: "Markets are trading in a tight range with mixed signals. Neither bulls nor bears have clear control. Investors are waiting for clearer direction before making significant moves.",
    mixed: "Markets are showing divergent trends across sectors. While some areas demonstrate strength, others face challenges. Selective positioning is recommended in this environment."
  }

  const highlights: Record<typeof marketMoods[number], string[]> = {
    bullish: [
      "Strong technical momentum across major indices",
      "Positive earnings surprises driving sentiment",
      "Improving economic indicators support growth"
    ],
    bearish: [
      "Increased volatility and risk-off sentiment",
      "Profit-taking after recent rallies",
      "Concerns about economic headwinds"
    ],
    neutral: [
      "Consolidation phase after recent moves",
      "Awaiting key economic data releases",
      "Balanced risk-reward setup"
    ],
    mixed: [
      "Sector rotation creating opportunities",
      "Stock-specific performance varies widely",
      "Mixed signals from technical indicators"
    ]
  }

  return {
    success: true,
    report: {
      marketMood: randomMood,
      summary: summaries[randomMood],
      keyHighlights: highlights[randomMood]
    },
    generatedAt: new Date().toISOString()
  }
}

export async function GET() {
  try {
    const report = generateSimpleReport()
    
    return NextResponse.json(report, {
      headers: {
        'Cache-Control': 'no-store, max-age=0',
      },
    })
  } catch (error) {
    console.error('AI Report error:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to generate market report' 
      },
      { status: 500 }
    )
  }
}
