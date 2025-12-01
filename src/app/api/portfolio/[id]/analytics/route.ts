import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { db } from '@/lib/db';
import { portfolios, portfolioHoldings, users } from '@/lib/db/schema';
import { eq, and } from 'drizzle-orm';
import YahooFinance from 'yahoo-finance2';

const yahooFinance = new YahooFinance({ 
  suppressNotices: ['yahooSurvey', 'ripHistorical'] 
});

interface RouteParams {
  params: Promise<{ id: string }>;
}

interface SectorAllocation {
  sector: string;
  value: number;
  percentage: number;
  holdings: string[];
}

interface RiskMetrics {
  beta: number;
  volatility: number;
  sharpeRatio: number;
  maxDrawdown: number;
  diversificationScore: number;
}

// Get portfolio analytics
export async function GET(request: Request, { params }: RouteParams) {
  try {
    const { userId: clerkId } = await auth();
    const { id: portfolioId } = await params;
    
    if (!clerkId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await db.query.users.findFirst({
      where: eq(users.clerkId, clerkId),
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Verify portfolio belongs to user
    const portfolio = await db.query.portfolios.findFirst({
      where: and(eq(portfolios.id, portfolioId), eq(portfolios.userId, user.id)),
      with: {
        holdings: true,
        snapshots: {
          orderBy: (snapshots, { desc }) => [desc(snapshots.snapshotDate)],
          limit: 365,
        },
      },
    });

    if (!portfolio) {
      return NextResponse.json({ error: 'Portfolio not found' }, { status: 404 });
    }

    const holdings = portfolio.holdings || [];

    // Fetch detailed data for all holdings
    const holdingsData = await Promise.all(
      holdings.map(async (holding) => {
        try {
          const [quote, summary] = await Promise.all([
            yahooFinance.quote(holding.symbol),
            yahooFinance.quoteSummary(holding.symbol, { modules: ['summaryProfile', 'defaultKeyStatistics'] }).catch(() => null),
          ]);

          const quantity = parseFloat(holding.quantity);
          const currentPrice = quote?.regularMarketPrice || parseFloat(holding.avgBuyPrice);
          const currentValue = currentPrice * quantity;

          return {
            symbol: holding.symbol,
            quantity,
            currentPrice,
            currentValue,
            avgBuyPrice: parseFloat(holding.avgBuyPrice),
            sector: summary?.summaryProfile?.sector || 'Unknown',
            industry: summary?.summaryProfile?.industry || 'Unknown',
            beta: summary?.defaultKeyStatistics?.beta || 1,
            fiftyTwoWeekHigh: quote?.fiftyTwoWeekHigh || 0,
            fiftyTwoWeekLow: quote?.fiftyTwoWeekLow || 0,
          };
        } catch (error) {
          console.error(`Error fetching data for ${holding.symbol}:`, error);
          const quantity = parseFloat(holding.quantity);
          const avgPrice = parseFloat(holding.avgBuyPrice);
          return {
            symbol: holding.symbol,
            quantity,
            currentPrice: avgPrice,
            currentValue: avgPrice * quantity,
            avgBuyPrice: avgPrice,
            sector: 'Unknown',
            industry: 'Unknown',
            beta: 1,
            fiftyTwoWeekHigh: avgPrice,
            fiftyTwoWeekLow: avgPrice,
          };
        }
      })
    );

    // Calculate total portfolio value
    const totalValue = holdingsData.reduce((sum, h) => sum + h.currentValue, 0);
    const totalCost = holdingsData.reduce((sum, h) => sum + (h.avgBuyPrice * h.quantity), 0);

    // Sector allocation
    const sectorMap = new Map<string, { value: number; holdings: string[] }>();
    holdingsData.forEach((h) => {
      const existing = sectorMap.get(h.sector) || { value: 0, holdings: [] };
      existing.value += h.currentValue;
      existing.holdings.push(h.symbol);
      sectorMap.set(h.sector, existing);
    });

    const sectorAllocation: SectorAllocation[] = Array.from(sectorMap.entries())
      .map(([sector, data]) => ({
        sector,
        value: data.value,
        percentage: totalValue > 0 ? (data.value / totalValue) * 100 : 0,
        holdings: data.holdings,
      }))
      .sort((a, b) => b.value - a.value);

    // Calculate risk metrics
    const portfolioBeta = holdingsData.reduce((sum, h) => {
      const weight = totalValue > 0 ? h.currentValue / totalValue : 0;
      return sum + (h.beta * weight);
    }, 0);

    // Calculate diversification score (based on number of sectors and holdings)
    const uniqueSectors = sectorMap.size;
    const holdingsCount = holdings.length;
    const maxConcentration = totalValue > 0 
      ? Math.max(...holdingsData.map(h => h.currentValue / totalValue)) * 100 
      : 0;
    
    // Diversification score: 0-100
    // Factors: number of holdings, number of sectors, concentration
    const holdingsFactor = Math.min(holdingsCount / 10, 1) * 30; // Max 30 points for 10+ holdings
    const sectorsFactor = Math.min(uniqueSectors / 5, 1) * 30; // Max 30 points for 5+ sectors
    const concentrationFactor = (100 - maxConcentration) * 0.4; // Max 40 points for low concentration
    const diversificationScore = Math.min(100, holdingsFactor + sectorsFactor + concentrationFactor);

    // Top holdings
    const topHoldings = holdingsData
      .map((h) => ({
        symbol: h.symbol,
        value: h.currentValue,
        percentage: totalValue > 0 ? (h.currentValue / totalValue) * 100 : 0,
        gainLoss: h.currentValue - (h.avgBuyPrice * h.quantity),
        gainLossPercent: ((h.currentPrice - h.avgBuyPrice) / h.avgBuyPrice) * 100,
      }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 10);

    // Performance data from snapshots
    const performanceHistory = portfolio.snapshots?.map((s) => ({
      date: s.snapshotDate,
      totalValue: parseFloat(s.totalValue),
      totalGainLoss: parseFloat(s.totalGainLoss),
      totalGainLossPercent: parseFloat(s.totalGainLossPercent),
      dayChange: s.dayChange ? parseFloat(s.dayChange) : 0,
    })).reverse() || [];

    const riskMetrics: RiskMetrics = {
      beta: portfolioBeta,
      volatility: 0, // Would need historical data to calculate
      sharpeRatio: 0, // Would need historical data to calculate
      maxDrawdown: 0, // Would need historical data to calculate
      diversificationScore,
    };

    return NextResponse.json({
      analytics: {
        totalValue,
        totalCost,
        totalGainLoss: totalValue - totalCost,
        totalGainLossPercent: totalCost > 0 ? ((totalValue - totalCost) / totalCost) * 100 : 0,
        holdingsCount,
        sectorAllocation,
        topHoldings,
        riskMetrics,
        performanceHistory,
      },
    });
  } catch (error) {
    console.error('Error fetching portfolio analytics:', error);
    return NextResponse.json({ error: 'Failed to fetch analytics' }, { status: 500 });
  }
}
