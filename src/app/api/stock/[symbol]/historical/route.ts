/**
 * Deep - Historical Price Data API Endpoint
 *
 * GET /api/stock/[symbol]/historical
 *
 * Fetches historical OHLCV data from Yahoo Finance
 * Supports different timeframes (1D, 1W, 1M, 3M, 6M, 1Y, 5Y, ALL)
 */

import { NextRequest, NextResponse } from 'next/server';
import YahooFinance from 'yahoo-finance2';

// Initialize Yahoo Finance
const yahooFinance = new YahooFinance();

// Force Node.js runtime for yahoo-finance2 compatibility
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// In-memory cache for historical data
interface CacheEntry {
  data: HistoricalDataPoint[];
  timestamp: number;
  expiresAt: number;
}

const historicalCache = new Map<string, CacheEntry>();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes cache

interface HistoricalDataPoint {
  date: string;
  timestamp: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

type Timeframe = '1D' | '1W' | '1M' | '3M' | '6M' | '1Y' | '5Y' | 'ALL';

// Get period and interval based on timeframe
function getYahooParams(timeframe: Timeframe): { period1: Date; interval: '1m' | '5m' | '15m' | '1h' | '1d' | '1wk' | '1mo' } {
  const now = new Date();
  let period1: Date;
  let interval: '1m' | '5m' | '15m' | '1h' | '1d' | '1wk' | '1mo';

  switch (timeframe) {
    case '1D':
      period1 = new Date(now);
      period1.setDate(period1.getDate() - 1);
      interval = '5m';
      break;
    case '1W':
      period1 = new Date(now);
      period1.setDate(period1.getDate() - 7);
      interval = '15m';
      break;
    case '1M':
      period1 = new Date(now);
      period1.setMonth(period1.getMonth() - 1);
      interval = '1h';
      break;
    case '3M':
      period1 = new Date(now);
      period1.setMonth(period1.getMonth() - 3);
      interval = '1d';
      break;
    case '6M':
      period1 = new Date(now);
      period1.setMonth(period1.getMonth() - 6);
      interval = '1d';
      break;
    case '1Y':
      period1 = new Date(now);
      period1.setFullYear(period1.getFullYear() - 1);
      interval = '1d';
      break;
    case '5Y':
      period1 = new Date(now);
      period1.setFullYear(period1.getFullYear() - 5);
      interval = '1wk';
      break;
    case 'ALL':
      period1 = new Date('1980-01-01');
      interval = '1mo';
      break;
    default:
      period1 = new Date(now);
      period1.setMonth(period1.getMonth() - 1);
      interval = '1d';
  }

  return { period1, interval };
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ symbol: string }> }
) {
  try {
    const { symbol } = await params;
    const upperSymbol = symbol.toUpperCase();

    // Get timeframe from query params
    const searchParams = request.nextUrl.searchParams;
    const timeframe = (searchParams.get('timeframe') || '1M') as Timeframe;

    // Check cache first
    const cacheKey = `${upperSymbol}-${timeframe}`;
    const cached = historicalCache.get(cacheKey);
    if (cached && Date.now() < cached.expiresAt) {
      return NextResponse.json({
        symbol: upperSymbol,
        timeframe,
        data: cached.data,
        cached: true,
      });
    }

    // Get Yahoo Finance params
    const { period1, interval } = getYahooParams(timeframe);

    // Fetch historical data from Yahoo Finance
    const result = await yahooFinance.chart(upperSymbol, {
      period1,
      interval,
    });

    if (!result || !result.quotes || result.quotes.length === 0) {
      return NextResponse.json(
        { error: 'No historical data found for this symbol' },
        { status: 404 }
      );
    }

    // Transform data to our format
    const historicalData: HistoricalDataPoint[] = result.quotes
      .filter((quote) => quote.open !== null && quote.close !== null)
      .map((quote) => ({
        date: new Date(quote.date).toISOString().split('T')[0],
        timestamp: new Date(quote.date).getTime(),
        open: quote.open ?? 0,
        high: quote.high ?? 0,
        low: quote.low ?? 0,
        close: quote.close ?? 0,
        volume: quote.volume ?? 0,
      }));

    // Store in cache
    historicalCache.set(cacheKey, {
      data: historicalData,
      timestamp: Date.now(),
      expiresAt: Date.now() + CACHE_TTL,
    });

    return NextResponse.json({
      symbol: upperSymbol,
      timeframe,
      data: historicalData,
      cached: false,
    });
  } catch (error) {
    console.error('Error fetching historical data:', error);

    // Return a more specific error message
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    
    return NextResponse.json(
      { error: `Failed to fetch historical data: ${errorMessage}` },
      { status: 500 }
    );
  }
}
