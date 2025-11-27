import { NextResponse } from 'next/server';
import { getAllEconomicIndicators } from '@/lib/api/fred';

export async function GET() {
  try {
    const indicators = await getAllEconomicIndicators();

    return NextResponse.json({
      success: true,
      data: indicators,
    });
  } catch (error) {
    console.error('Error fetching economic indicators:', error);

    const errorMessage =
      error instanceof Error ? error.message : 'Unknown error occurred';

    // Check for specific error types
    if (errorMessage.includes('FRED_API_KEY')) {
      return NextResponse.json(
        {
          success: false,
          error: 'FRED API key not configured',
          message: 'Please set the FRED_API_KEY environment variable',
        },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch economic indicators',
        message: errorMessage,
      },
      { status: 500 }
    );
  }
}

// Revalidate every hour (3600 seconds)
// This works alongside the in-memory cache for additional optimization
export const revalidate = 3600;
