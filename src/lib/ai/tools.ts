/**
 * AI Tools for Function Calling
 * 
 * These tools allow the AI to fetch real-time data from FMP
 * when context is missing or user asks for specific data
 */

import { getAllFinancialData, getQuoteRealtime } from '@/lib/data/fmp';

// Tool definitions for OpenRouter/OpenAI function calling
export const AI_TOOLS = [
  {
    type: 'function',
    function: {
      name: 'get_stock_quote',
      description: 'Get real-time stock quote including price, change, volume, and market cap for a given symbol',
      parameters: {
        type: 'object',
        properties: {
          symbol: {
            type: 'string',
            description: 'The stock ticker symbol (e.g., AAPL, MSFT, GOOGL)'
          }
        },
        required: ['symbol']
      }
    }
  },
  {
    type: 'function',
    function: {
      name: 'get_stock_financials',
      description: 'Get financial statements and key metrics for a stock including income statement, balance sheet, cash flow, valuation ratios, profitability metrics',
      parameters: {
        type: 'object',
        properties: {
          symbol: {
            type: 'string',
            description: 'The stock ticker symbol'
          }
        },
        required: ['symbol']
      }
    }
  },
  {
    type: 'function',
    function: {
      name: 'get_stock_profile',
      description: 'Get company profile including description, sector, industry, CEO, employees, and other basic information',
      parameters: {
        type: 'object',
        properties: {
          symbol: {
            type: 'string',
            description: 'The stock ticker symbol'
          }
        },
        required: ['symbol']
      }
    }
  },
  {
    type: 'function',
    function: {
      name: 'compare_stocks',
      description: 'Compare key metrics between two or more stocks',
      parameters: {
        type: 'object',
        properties: {
          symbols: {
            type: 'array',
            items: { type: 'string' },
            description: 'Array of stock ticker symbols to compare (e.g., ["AAPL", "MSFT"])'
          }
        },
        required: ['symbols']
      }
    }
  },
  {
    type: 'function',
    function: {
      name: 'get_market_news',
      description: 'Get latest market news and stock-specific news',
      parameters: {
        type: 'object',
        properties: {
          symbol: {
            type: 'string',
            description: 'Optional stock symbol for stock-specific news'
          },
          limit: {
            type: 'number',
            description: 'Number of news items to return (default: 5)'
          }
        },
        required: []
      }
    }
  }
];

// Tool execution functions
export async function executeAITool(
  toolName: string, 
  args: Record<string, any>
): Promise<{ success: boolean; data?: any; error?: string }> {
  try {
    switch (toolName) {
      case 'get_stock_quote':
        return await getStockQuote(args.symbol);
      
      case 'get_stock_financials':
        return await getStockFinancials(args.symbol);
      
      case 'get_stock_profile':
        return await getStockProfile(args.symbol);
      
      case 'compare_stocks':
        return await compareStocks(args.symbols);
      
      case 'get_market_news':
        return await getMarketNews(args.symbol, args.limit);
      
      default:
        return { success: false, error: `Unknown tool: ${toolName}` };
    }
  } catch (error) {
    console.error(`[AI Tools] Error executing ${toolName}:`, error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    };
  }
}

async function getStockQuote(symbol: string) {
  // Use real-time quote (no cache) for AI assistant
  const quote = await getQuoteRealtime(symbol.toUpperCase());
  
  if (!quote) {
    return { success: false, error: `No quote data found for ${symbol}` };
  }

  return {
    success: true,
    data: {
      symbol: quote.symbol,
      name: quote.name,
      price: quote.price,
      change: quote.change,
      changePercent: quote.changesPercentage,
      volume: quote.volume,
      avgVolume: quote.avgVolume,
      marketCap: quote.marketCap,
      pe: quote.pe,
      eps: quote.eps,
      high: quote.dayHigh,
      low: quote.dayLow,
      open: quote.open,
      previousClose: quote.previousClose,
      yearHigh: quote.yearHigh,
      yearLow: quote.yearLow,
      timestamp: new Date().toISOString(), // Add timestamp for clarity
    }
  };
}

async function getStockFinancials(symbol: string) {
  const data = await getAllFinancialData(symbol.toUpperCase());
  
  const income = data.incomeStatements[0];
  const balance = data.balanceSheets[0];
  const cashflow = data.cashFlows[0];
  const metrics = data.keyMetrics[0];
  const ratios = data.ratios[0];

  return {
    success: true,
    data: {
      symbol,
      // Valuation
      valuation: {
        pe: data.quote?.pe,
        pb: ratios?.priceToBookRatio,
        ps: ratios?.priceToSalesRatio,
        evToEbitda: metrics?.evToEBITDA,
        evToRevenue: metrics?.evToSales,
        marketCap: data.quote?.marketCap,
      },
      // Profitability
      profitability: {
        grossMargin: ratios?.grossProfitMargin,
        operatingMargin: ratios?.operatingProfitMargin,
        netMargin: ratios?.netProfitMargin,
        roe: metrics?.returnOnEquity,
        roa: metrics?.returnOnAssets,
        roic: metrics?.returnOnInvestedCapital,
      },
      // Growth (from income statements comparison)
      growth: {
        // These would need to be calculated from historical data
        revenueGrowth: null,
        netIncomeGrowth: null,
        epsGrowth: null,
      },
      // Financial Health
      financialHealth: {
        currentRatio: ratios?.currentRatio,
        quickRatio: ratios?.quickRatio,
        debtToEquity: ratios?.debtToEquityRatio,
        debtToAssets: ratios?.debtToAssetsRatio,
        interestCoverage: ratios?.interestCoverageRatio,
      },
      // Cash Flow
      cashFlow: {
        operatingCashFlow: cashflow?.operatingCashFlow,
        freeCashFlow: cashflow?.freeCashFlow,
        capex: cashflow?.capitalExpenditure,
        fcfMargin: cashflow?.freeCashFlow && income?.revenue 
          ? cashflow.freeCashFlow / income.revenue 
          : null,
      },
      // Dividend
      dividend: {
        yield: ratios?.dividendYield,
        payoutRatio: ratios?.dividendPayoutRatio,
      },
      // Per Share
      perShare: {
        eps: income?.epsDiluted,
        bookValue: ratios?.bookValuePerShare,
        revenue: ratios?.revenuePerShare,
      }
    }
  };
}

async function getStockProfile(symbol: string) {
  const data = await getAllFinancialData(symbol.toUpperCase());
  
  if (!data.profile) {
    return { success: false, error: `No profile data found for ${symbol}` };
  }

  const profile = data.profile;
  return {
    success: true,
    data: {
      symbol: profile.symbol,
      companyName: profile.companyName,
      description: profile.description,
      sector: profile.sector,
      industry: profile.industry,
      ceo: profile.ceo,
      employees: profile.fullTimeEmployees,
      country: profile.country,
      website: profile.website,
      exchange: profile.exchangeFullName,
      ipoDate: profile.ipoDate,
      isActivelyTrading: profile.isActivelyTrading,
    }
  };
}

async function compareStocks(symbols: string[]) {
  const results = await Promise.all(
    symbols.map(async (symbol) => {
      const data = await getAllFinancialData(symbol.toUpperCase());
      const quote = data.quote;
      const metrics = data.keyMetrics[0];
      const ratios = data.ratios[0];
      
      return {
        symbol: symbol.toUpperCase(),
        name: quote?.name || data.profile?.companyName,
        price: quote?.price,
        marketCap: quote?.marketCap,
        pe: quote?.pe,
        pb: ratios?.priceToBookRatio,
        roe: metrics?.returnOnEquity,
        netMargin: ratios?.netProfitMargin,
        debtToEquity: ratios?.debtToEquityRatio,
        dividendYield: ratios?.dividendYield,
        revenueGrowth: null, // Would need historical data
      };
    })
  );

  return {
    success: true,
    data: {
      comparison: results,
      metrics: ['price', 'marketCap', 'pe', 'pb', 'roe', 'netMargin', 'debtToEquity', 'dividendYield', 'revenueGrowth']
    }
  };
}

async function getMarketNews(symbol?: string, limit: number = 5) {
  // Use FMP news API
  const FMP_API_KEY = process.env.FMP_API_KEY;
  const baseUrl = symbol 
    ? `https://financialmodelingprep.com/api/v3/stock_news?tickers=${symbol}&limit=${limit}&apikey=${FMP_API_KEY}`
    : `https://financialmodelingprep.com/api/v3/stock_news?limit=${limit}&apikey=${FMP_API_KEY}`;
  
  try {
    const response = await fetch(baseUrl);
    const news = await response.json();
    
    return {
      success: true,
      data: {
        news: news.slice(0, limit).map((item: any) => ({
          title: item.title,
          text: item.text?.substring(0, 200) + '...',
          symbol: item.symbol,
          publishedDate: item.publishedDate,
          site: item.site,
          url: item.url,
        }))
      }
    };
  } catch (error) {
    return { success: false, error: 'Failed to fetch news' };
  }
}

// Helper to format tool results for AI context
export function formatToolResult(toolName: string, result: any): string {
  if (!result.success) {
    return `[Tool Error: ${result.error}]`;
  }

  return `\n--- Data from ${toolName} ---\n${JSON.stringify(result.data, null, 2)}\n---\n`;
}
