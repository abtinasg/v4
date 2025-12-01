/**
 * FMP Data Adapter
 * 
 * Converts FMP API responses to the format expected by MetricsCalculator
 */

import type { YahooFinanceData } from '../../../lib/metrics/types';
import {
  getAllFinancialData,
  type FMPProfile,
  type FMPQuote,
  type FMPIncomeStatement,
  type FMPBalanceSheet,
  type FMPCashFlow,
  type FMPKeyMetrics,
  type FMPRatios,
  type FMPHistoricalPrice,
} from './fmp';

export interface FMPDataResult {
  success: boolean;
  data: YahooFinanceData | null;
  error?: string;
}

/**
 * Fetch and convert FMP data to YahooFinanceData format
 * This allows our existing MetricsCalculator to work with FMP data
 */
export async function fetchFMPData(symbol: string): Promise<FMPDataResult> {
  try {
    const fmpData = await getAllFinancialData(symbol);
    
    if (!fmpData.profile && !fmpData.quote) {
      return {
        success: false,
        data: null,
        error: `No FMP data found for ${symbol}`,
      };
    }

    const profile = fmpData.profile;
    const quote = fmpData.quote;
    const income = fmpData.incomeStatements[0]; // Latest
    const balance = fmpData.balanceSheets[0]; // Latest
    const cashflow = fmpData.cashFlows[0]; // Latest
    const metrics = fmpData.keyMetrics[0]; // Latest
    const ratios = fmpData.ratios[0]; // Latest
    const prices = fmpData.historicalPrices;

    // Debug logging for cash flow data
    console.log(`[FMP Adapter] ${symbol} Cash Flow Data:`, {
      hasCashFlowData: !!cashflow,
      cashFlowsCount: fmpData.cashFlows.length,
      operatingCF: cashflow?.operatingCashFlow,
      investingCF: cashflow?.netCashProvidedByInvestingActivities,
      financingCF: cashflow?.netCashProvidedByFinancingActivities,
      dividendsPaid: cashflow?.commonDividendsPaid || cashflow?.netDividendsPaid,
    });

    // Build historical data arrays (reverse to get oldest first)
    const historicalRevenue = fmpData.incomeStatements
      .slice(0, 5)
      .map(s => s.revenue)
      .reverse();
    
    const historicalNetIncome = fmpData.incomeStatements
      .slice(0, 5)
      .map(s => s.netIncome)
      .reverse();
    
    const historicalEPS = fmpData.incomeStatements
      .slice(0, 5)
      .map(s => s.epsDiluted)
      .reverse();
    
    const historicalDividends = fmpData.cashFlows
      .slice(0, 5)
      .map(s => Math.abs(s.commonDividendsPaid || s.netDividendsPaid || s.dividendsPaid || 0))
      .reverse();
    
    const historicalFCF = fmpData.cashFlows
      .slice(0, 5)
      .map(s => s.freeCashFlow)
      .reverse();

    // Convert price history
    const priceHistory = prices.slice(0, 252).map(p => ({
      date: p.date,
      open: p.open,
      high: p.high,
      low: p.low,
      close: p.close,
      volume: p.volume,
    }));

    // Calculate values not directly available
    const totalDebt = (balance?.shortTermDebt || 0) + (balance?.longTermDebt || 0);
    const workingCapital = (balance?.totalCurrentAssets || 0) - (balance?.totalCurrentLiabilities || 0);

    const data: YahooFinanceData = {
      // Quote Data
      symbol: symbol,
      price: quote?.price || profile?.price || 0,
      previousClose: quote?.previousClose || (profile?.price || 0) - (profile?.change || 0),
      open: quote?.open || profile?.price || 0,
      dayLow: quote?.dayLow || profile?.price || 0,
      dayHigh: quote?.dayHigh || profile?.price || 0,
      volume: quote?.volume || profile?.volume || 0,
      averageVolume: quote?.avgVolume || profile?.averageVolume || 0,
      marketCap: quote?.marketCap || profile?.marketCap || 0,
      beta: profile?.beta || 1,
      pe: quote?.pe || ratios?.priceToEarningsRatio || null,
      eps: quote?.eps || income?.epsDiluted || null,
      forwardPE: ratios?.priceToEarningsRatio || null, // FMP doesn't have forward PE in basic plan
      forwardEPS: null,
      dividendRate: profile?.lastDividend || null,
      dividendYield: ratios?.dividendYield || null,
      fiftyDayAverage: quote?.priceAvg50 || null,
      twoHundredDayAverage: quote?.priceAvg200 || null,

      // Income Statement
      revenue: income?.revenue || 0,
      costOfRevenue: income?.costOfRevenue || 0,
      grossProfit: income?.grossProfit || 0,
      operatingExpenses: income?.operatingExpenses || 0,
      operatingIncome: income?.operatingIncome || 0,
      ebitda: income?.ebitda || 0,
      ebit: income?.ebit || 0,
      interestExpense: income?.interestExpense || 0,
      pretaxIncome: income?.incomeBeforeTax || 0,
      incomeTax: income?.incomeTaxExpense || 0,
      netIncome: income?.netIncome || 0,

      // Balance Sheet
      totalAssets: balance?.totalAssets || 0,
      currentAssets: balance?.totalCurrentAssets || 0,
      cash: balance?.cashAndCashEquivalents || 0,
      shortTermInvestments: balance?.shortTermInvestments || 0,
      netReceivables: balance?.netReceivables || 0,
      inventory: balance?.inventory || 0,
      totalLiabilities: balance?.totalLiabilities || 0,
      currentLiabilities: balance?.totalCurrentLiabilities || 0,
      shortTermDebt: balance?.shortTermDebt || 0,
      accountsPayable: balance?.accountPayables || 0,
      longTermDebt: balance?.longTermDebt || 0,
      totalDebt: totalDebt,
      totalEquity: balance?.totalStockholdersEquity || 0,
      retainedEarnings: balance?.retainedEarnings || 0,
      workingCapital: workingCapital,

      // Cash Flow Statement
      operatingCashFlow: cashflow?.operatingCashFlow || cashflow?.netCashProvidedByOperatingActivities || 0,
      investingCashFlow: cashflow?.netCashProvidedByInvestingActivities || 0,
      financingCashFlow: cashflow?.netCashProvidedByFinancingActivities || 0,
      capitalExpenditures: Math.abs(cashflow?.capitalExpenditure || cashflow?.investmentsInPropertyPlantAndEquipment || 0),
      freeCashFlow: cashflow?.freeCashFlow || 0,
      dividendsPaid: Math.abs(cashflow?.commonDividendsPaid || cashflow?.netDividendsPaid || cashflow?.dividendsPaid || 0),

      // Financial Ratios from FMP
      currentRatio: ratios?.currentRatio || metrics?.currentRatio || null,
      quickRatio: ratios?.quickRatio || null,
      debtToEquity: ratios?.debtToEquityRatio || null,
      returnOnEquity: metrics?.returnOnEquity || null,
      returnOnAssets: metrics?.returnOnAssets || null,
      grossMargin: ratios?.grossProfitMargin || null,
      operatingMargin: ratios?.operatingProfitMargin || null,
      profitMargin: ratios?.netProfitMargin || null,
      revenueGrowth: null, // Would need to calculate from historical
      earningsGrowth: null, // Would need to calculate from historical

      // Company Info
      sector: profile?.sector || 'Unknown',
      industry: profile?.industry || 'Unknown',

      // Share Data
      sharesOutstanding: quote?.sharesOutstanding || 0,
      floatShares: 0, // Not available in FMP basic

      // Historical Data
      historicalRevenue,
      historicalNetIncome,
      historicalEPS,
      historicalDividends,
      historicalFCF,
      priceHistory,
    };

    // Calculate growth rates from historical data
    if (historicalRevenue.length >= 2) {
      const latestRevenue = historicalRevenue[historicalRevenue.length - 1];
      const previousRevenue = historicalRevenue[historicalRevenue.length - 2];
      if (previousRevenue > 0) {
        data.revenueGrowth = (latestRevenue - previousRevenue) / previousRevenue;
      }
    }

    if (historicalNetIncome.length >= 2) {
      const latestIncome = historicalNetIncome[historicalNetIncome.length - 1];
      const previousIncome = historicalNetIncome[historicalNetIncome.length - 2];
      if (previousIncome > 0) {
        data.earningsGrowth = (latestIncome - previousIncome) / previousIncome;
      }
    }

    return {
      success: true,
      data,
    };
  } catch (error) {
    console.error(`FMP data fetch error for ${symbol}:`, error);
    return {
      success: false,
      data: null,
      error: error instanceof Error ? error.message : 'Unknown FMP error',
    };
  }
}

/**
 * Get raw FMP data (without conversion)
 */
export async function getFMPRawData(symbol: string) {
  return getAllFinancialData(symbol);
}
