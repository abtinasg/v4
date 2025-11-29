import { NextRequest, NextResponse } from 'next/server';
import YahooFinance from 'yahoo-finance2';
import { STOCK_UNIVERSE } from '@/lib/data/stock-universe';

// Force Node.js runtime
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const yahooFinance = new YahooFinance();

// Cache for screener data (refresh every 15 minutes)
interface CacheEntry {
  data: ScreenerStock[];
  timestamp: number;
}

let screenerCache: CacheEntry | null = null;
const CACHE_TTL = 15 * 60 * 1000; // 15 minutes

export interface ScreenerStock {
  symbol: string;
  companyName: string;
  sector: string;
  industry: string;
  price: number;
  change: number;
  changePercent: number;
  marketCap: number;
  peRatio: number | null;
  forwardPE: number | null;
  pbRatio: number | null;
  psRatio: number | null;
  dividendYield: number | null;
  roe: number | null;
  roa: number | null;
  profitMargin: number | null;
  operatingMargin: number | null;
  revenueGrowth: number | null;
  earningsGrowth: number | null;
  debtToEquity: number | null;
  currentRatio: number | null;
  quickRatio: number | null;
  beta: number | null;
  fiftyTwoWeekHigh: number | null;
  fiftyTwoWeekLow: number | null;
  averageVolume: number | null;
  fiftyDayMA: number | null;
  twoHundredDayMA: number | null;
}

// Batch fetch quotes in chunks
async function fetchQuotesInBatches(symbols: string[], batchSize: number = 50): Promise<Map<string, unknown>> {
  const results = new Map<string, unknown>();
  
  for (let i = 0; i < symbols.length; i += batchSize) {
    const batch = symbols.slice(i, i + batchSize);
    try {
      const quotes = await yahooFinance.quote(batch);
      const quotesArray = Array.isArray(quotes) ? quotes : [quotes];
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      quotesArray.forEach((q: any) => {
        if (q && q.symbol) {
          results.set(q.symbol, q);
        }
      });
    } catch (error) {
      console.error(`Error fetching batch starting at ${i}:`, error);
      // Continue with next batch
    }
    
    // Small delay between batches to avoid rate limiting
    if (i + batchSize < symbols.length) {
      await new Promise(resolve => setTimeout(resolve, 100));
    }
  }
  
  return results;
}

async function getScreenerData(): Promise<ScreenerStock[]> {
  // Check cache
  if (screenerCache && Date.now() - screenerCache.timestamp < CACHE_TTL) {
    return screenerCache.data;
  }

  const symbols = STOCK_UNIVERSE.map(s => s.symbol);
  const stockInfoMap = new Map(STOCK_UNIVERSE.map(s => [s.symbol, s]));
  
  // Fetch quotes
  const quotesMap = await fetchQuotesInBatches(symbols);
  
  const stocks: ScreenerStock[] = [];
  
  for (const [symbol, rawQuote] of quotesMap) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const quote = rawQuote as any;
    const info = stockInfoMap.get(symbol);
    
    if (!quote || !info) continue;
    
    const price = quote.regularMarketPrice || 0;
    const prevClose = quote.regularMarketPreviousClose || price;
    const change = price - prevClose;
    const changePercent = prevClose ? (change / prevClose) * 100 : 0;
    
    stocks.push({
      symbol: quote.symbol,
      companyName: quote.longName || quote.shortName || info.name,
      sector: info.sector,
      industry: info.industry,
      price,
      change,
      changePercent,
      marketCap: quote.marketCap ? quote.marketCap / 1e9 : 0, // Convert to billions
      peRatio: quote.trailingPE ?? null,
      forwardPE: quote.forwardPE ?? null,
      pbRatio: quote.priceToBook ?? null,
      psRatio: quote.priceToSalesTrailing12Months ?? null,
      dividendYield: quote.dividendYield ? quote.dividendYield * 100 : null,
      roe: null, // Need separate quoteSummary call for this
      roa: null,
      profitMargin: quote.profitMargins ? quote.profitMargins * 100 : null,
      operatingMargin: null,
      revenueGrowth: quote.revenueGrowth ? quote.revenueGrowth * 100 : null,
      earningsGrowth: quote.earningsGrowth ? quote.earningsGrowth * 100 : null,
      debtToEquity: null,
      currentRatio: null,
      quickRatio: null,
      beta: quote.beta ?? null,
      fiftyTwoWeekHigh: quote.fiftyTwoWeekHigh ?? null,
      fiftyTwoWeekLow: quote.fiftyTwoWeekLow ?? null,
      averageVolume: quote.averageVolume ?? null,
      fiftyDayMA: quote.fiftyDayAverage ?? null,
      twoHundredDayMA: quote.twoHundredDayAverage ?? null,
    });
  }
  
  // Update cache
  screenerCache = {
    data: stocks,
    timestamp: Date.now(),
  };
  
  return stocks;
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    
    // Filters
    const sector = searchParams.get('sector');
    const industry = searchParams.get('industry');
    const minMarketCap = searchParams.get('minMarketCap');
    const maxMarketCap = searchParams.get('maxMarketCap');
    const minPE = searchParams.get('minPE');
    const maxPE = searchParams.get('maxPE');
    const minDividend = searchParams.get('minDividend');
    const maxDividend = searchParams.get('maxDividend');
    const minBeta = searchParams.get('minBeta');
    const maxBeta = searchParams.get('maxBeta');
    
    // Sorting
    const sortBy = searchParams.get('sortBy') || 'marketCap';
    const sortOrder = searchParams.get('sortOrder') || 'desc';
    
    // Pagination
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');
    
    // Get all stocks
    let stocks = await getScreenerData();
    
    // Apply filters
    if (sector) {
      const sectors = sector.split(',');
      stocks = stocks.filter(s => sectors.includes(s.sector));
    }
    
    if (industry) {
      const industries = industry.split(',');
      stocks = stocks.filter(s => industries.includes(s.industry));
    }
    
    if (minMarketCap) {
      const min = parseFloat(minMarketCap);
      stocks = stocks.filter(s => s.marketCap >= min);
    }
    
    if (maxMarketCap) {
      const max = parseFloat(maxMarketCap);
      stocks = stocks.filter(s => s.marketCap <= max);
    }
    
    if (minPE) {
      const min = parseFloat(minPE);
      stocks = stocks.filter(s => s.peRatio !== null && s.peRatio >= min);
    }
    
    if (maxPE) {
      const max = parseFloat(maxPE);
      stocks = stocks.filter(s => s.peRatio !== null && s.peRatio <= max);
    }
    
    if (minDividend) {
      const min = parseFloat(minDividend);
      stocks = stocks.filter(s => s.dividendYield !== null && s.dividendYield >= min);
    }
    
    if (maxDividend) {
      const max = parseFloat(maxDividend);
      stocks = stocks.filter(s => s.dividendYield !== null && s.dividendYield <= max);
    }
    
    if (minBeta) {
      const min = parseFloat(minBeta);
      stocks = stocks.filter(s => s.beta !== null && s.beta >= min);
    }
    
    if (maxBeta) {
      const max = parseFloat(maxBeta);
      stocks = stocks.filter(s => s.beta !== null && s.beta <= max);
    }
    
    // Sort
    const sortKey = sortBy as keyof ScreenerStock;
    stocks.sort((a, b) => {
      const aVal = a[sortKey];
      const bVal = b[sortKey];
      
      if (aVal === null || aVal === undefined) return 1;
      if (bVal === null || bVal === undefined) return -1;
      
      const comparison = aVal < bVal ? -1 : aVal > bVal ? 1 : 0;
      return sortOrder === 'asc' ? comparison : -comparison;
    });
    
    // Pagination
    const total = stocks.length;
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedStocks = stocks.slice(startIndex, endIndex);
    
    return NextResponse.json({
      success: true,
      data: paginatedStocks,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasMore: endIndex < total,
      },
      meta: {
        sectors: [...new Set(stocks.map(s => s.sector))].sort(),
        industries: [...new Set(stocks.map(s => s.industry))].sort(),
        lastUpdated: screenerCache?.timestamp || Date.now(),
      },
      timestamp: Date.now(),
    });
  } catch (error) {
    console.error('Screener API error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch screener data',
        timestamp: Date.now(),
      },
      { status: 500 }
    );
  }
}
