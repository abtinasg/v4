import { NextRequest, NextResponse } from 'next/server';
import YahooFinance from 'yahoo-finance2';

const yahooFinance = new YahooFinance();

// Force Node.js runtime for yahoo-finance2 compatibility
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// Cache for 24 hours
export const revalidate = 86400;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type YahooResult = any;

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ symbol: string }> }
) {
  try {
    const { symbol } = await params;
    const searchParams = request.nextUrl.searchParams;
    
    const type = searchParams.get('type') || 'profile';

    if (!symbol) {
      return NextResponse.json(
        { error: 'Symbol is required' },
        { status: 400 }
      );
    }

    const upperSymbol = symbol.toUpperCase();
    let data: Record<string, unknown> = {};

    switch (type) {
      case 'income': {
        const incomeResult: YahooResult = await yahooFinance.quoteSummary(upperSymbol, {
          modules: ['incomeStatementHistory', 'incomeStatementHistoryQuarterly'],
        });
        data = {
          annual: incomeResult.incomeStatementHistory?.incomeStatementHistory || [],
          quarterly: incomeResult.incomeStatementHistoryQuarterly?.incomeStatementHistory || [],
        };
        break;
      }
      
      case 'balance': {
        const balanceResult: YahooResult = await yahooFinance.quoteSummary(upperSymbol, {
          modules: ['balanceSheetHistory', 'balanceSheetHistoryQuarterly'],
        });
        data = {
          annual: balanceResult.balanceSheetHistory?.balanceSheetStatements || [],
          quarterly: balanceResult.balanceSheetHistoryQuarterly?.balanceSheetStatements || [],
        };
        break;
      }
      
      case 'cashflow': {
        const cashflowResult: YahooResult = await yahooFinance.quoteSummary(upperSymbol, {
          modules: ['cashflowStatementHistory', 'cashflowStatementHistoryQuarterly'],
        });
        data = {
          annual: cashflowResult.cashflowStatementHistory?.cashflowStatements || [],
          quarterly: cashflowResult.cashflowStatementHistoryQuarterly?.cashflowStatements || [],
        };
        break;
      }
      
      case 'metrics':
      case 'ratios': {
        const metricsResult: YahooResult = await yahooFinance.quoteSummary(upperSymbol, {
          modules: ['defaultKeyStatistics', 'financialData', 'summaryDetail'],
        });
        data = {
          keyStatistics: metricsResult.defaultKeyStatistics || {},
          financialData: metricsResult.financialData || {},
          summaryDetail: metricsResult.summaryDetail || {},
        };
        break;
      }
      
      case 'profile': {
        const profileResult: YahooResult = await yahooFinance.quoteSummary(upperSymbol, {
          modules: ['assetProfile', 'summaryProfile', 'price'],
        });
        data = {
          profile: profileResult.assetProfile || {},
          price: profileResult.price || {},
        };
        break;
      }
      
      case 'earnings': {
        const earningsResult: YahooResult = await yahooFinance.quoteSummary(upperSymbol, {
          modules: ['earnings', 'earningsHistory', 'earningsTrend'],
        });
        data = {
          earnings: earningsResult.earnings || {},
          earningsHistory: earningsResult.earningsHistory || {},
          earningsTrend: earningsResult.earningsTrend || {},
        };
        break;
      }

      case 'all':
      default: {
        const allResult: YahooResult = await yahooFinance.quoteSummary(upperSymbol, {
          modules: [
            'assetProfile',
            'summaryProfile', 
            'price',
            'defaultKeyStatistics',
            'financialData',
            'summaryDetail',
            'earnings',
            'incomeStatementHistory',
            'balanceSheetHistory',
            'cashflowStatementHistory',
          ],
        });
        data = {
          profile: allResult.assetProfile || {},
          price: allResult.price || {},
          keyStatistics: allResult.defaultKeyStatistics || {},
          financialData: allResult.financialData || {},
          summaryDetail: allResult.summaryDetail || {},
          earnings: allResult.earnings || {},
          incomeStatement: allResult.incomeStatementHistory?.incomeStatementHistory || [],
          balanceSheet: allResult.balanceSheetHistory?.balanceSheetStatements || [],
          cashFlow: allResult.cashflowStatementHistory?.cashflowStatements || [],
        };
      }
    }

    return NextResponse.json({
      success: true,
      symbol: upperSymbol,
      type,
      data,
      timestamp: Date.now(),
    }, {
      headers: {
        'Cache-Control': 'public, s-maxage=86400, stale-while-revalidate=43200',
      },
    });
  } catch (error) {
    console.error('Error fetching financials:', error);
    
    return NextResponse.json(
      { 
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch financial data',
        timestamp: Date.now(),
      },
      { status: 500 }
    );
  }
}
