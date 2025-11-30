import { NextResponse } from 'next/server';
import { getAllEconomicIndicators } from '@/lib/api/fred';

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'
export const maxDuration = 30

// Fallback data when FRED API fails
const FALLBACK_INDICATORS = {
  gdp: { value: 3.1, change: 0.2, unit: '%', description: 'GDP Growth Rate' },
  unemployment: { value: 4.1, change: -0.1, unit: '%', description: 'Unemployment Rate' },
  inflation: { value: 2.7, change: -0.2, unit: '%', description: 'Inflation Rate (CPI)' },
  federalFundsRate: { value: 4.5, change: 0, unit: '%', description: 'Federal Funds Rate' },
  consumerConfidence: { value: 102.5, change: 1.2, unit: '', description: 'Consumer Confidence Index' },
  manufacturingPmi: { value: 49.2, change: 0.5, unit: '', description: 'Manufacturing PMI' },
  servicesPmi: { value: 52.1, change: 0.3, unit: '', description: 'Services PMI' },
}

export async function GET() {
  try {
    const indicators = await getAllEconomicIndicators();

    return NextResponse.json({
      success: true,
      data: indicators,
      cached: false,
    });
  } catch (error) {
    console.error('Error fetching economic indicators:', error);

    const errorMessage =
      error instanceof Error ? error.message : 'Unknown error occurred';

    // Check for specific error types
    if (errorMessage.includes('FRED_API_KEY')) {
      // Return fallback data instead of error
      return NextResponse.json({
        success: true,
        data: FALLBACK_INDICATORS,
        cached: true,
        warning: 'Using cached data - FRED API key not configured',
      });
    }

    // Return fallback data on any error
    return NextResponse.json({
      success: true,
      data: FALLBACK_INDICATORS,
      cached: true,
      warning: 'Using cached data due to API error',
    });
  }
}
