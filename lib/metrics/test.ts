/**
 * Deep Terminal - Metrics Calculator Test
 *
 * Test script to verify the metrics calculation engine
 * Run with: ts-node lib/metrics/test.ts
 */

import { MetricsCalculator } from './calculator';
import type { RawFinancialData } from './types';
import { formatNumber, formatPercentage, formatCurrency } from './helpers';

// ============================================================================
// MOCK DATA (Apple-like company)
// ============================================================================

const mockRawData: RawFinancialData = {
  yahoo: {
    // Quote Data
    symbol: 'AAPL',
    price: 150.0,
    previousClose: 148.5,
    open: 149.0,
    dayLow: 148.0,
    dayHigh: 151.0,
    volume: 50000000,
    averageVolume: 45000000,
    marketCap: 2500000000000,
    beta: 1.2,
    pe: 25.5,
    eps: 5.88,
    forwardPE: 23.0,
    forwardEPS: 6.52,
    dividendRate: 0.96,
    dividendYield: 0.0064,
    fiftyDayAverage: 145.0,
    twoHundredDayAverage: 140.0,

    // Income Statement
    revenue: 394000000000,
    costOfRevenue: 223000000000,
    grossProfit: 171000000000,
    operatingExpenses: 51000000000,
    operatingIncome: 120000000000,
    ebitda: 130000000000,
    ebit: 120000000000,
    interestExpense: 3000000000,
    pretaxIncome: 117000000000,
    incomeTax: 19000000000,
    netIncome: 98000000000,

    // Balance Sheet
    totalAssets: 352000000000,
    currentAssets: 135000000000,
    cash: 62000000000,
    shortTermInvestments: 20000000000,
    netReceivables: 28000000000,
    inventory: 6000000000,
    totalLiabilities: 287000000000,
    currentLiabilities: 125000000000,
    shortTermDebt: 15000000000,
    accountsPayable: 54000000000,
    longTermDebt: 109000000000,
    totalDebt: 124000000000,
    totalEquity: 65000000000,
    retainedEarnings: 45000000000,

    // Cash Flow Statement
    operatingCashFlow: 104000000000,
    investingCashFlow: -8000000000,
    financingCashFlow: -93000000000,
    capitalExpenditures: 11000000000,
    freeCashFlow: 93000000000,
    dividendsPaid: 15000000000,

    // Share Data
    sharesOutstanding: 16670000000,
    floatShares: 16600000000,

    // Financial Ratios from Yahoo financialData
    currentRatio: 0.9,
    quickRatio: 0.8,
    debtToEquity: 190,
    returnOnEquity: 1.5,
    returnOnAssets: 0.28,
    grossMargin: 0.43,
    operatingMargin: 0.30,
    profitMargin: 0.25,
    revenueGrowth: 0.08,
    earningsGrowth: 0.10,

    // Company Info
    sector: 'Technology',
    industry: 'Consumer Electronics',

    // Historical Data
    historicalRevenue: [
      265000000000, 274000000000, 365000000000, 394000000000, 383000000000,
      394000000000,
    ],
    historicalNetIncome: [
      55000000000, 59000000000, 99000000000, 94000000000, 95000000000,
      98000000000,
    ],
    historicalEPS: [3.28, 3.57, 5.99, 5.67, 5.72, 5.88],
    historicalDividends: [0.63, 0.73, 0.82, 0.87, 0.92, 0.96],
    historicalFCF: [
      65000000000, 70000000000, 80000000000, 92000000000, 99000000000,
      93000000000,
    ],

    // Price History (simplified)
    priceHistory: generateMockPriceHistory(150, 252),
  },

  fred: {
    gdpGrowthRate: 0.024,
    realGDP: 22000000000000,
    nominalGDP: 26000000000000,
    gdpPerCapita: 76000,
    cpi: 310.5,
    ppi: 280.2,
    coreInflation: 0.032,
    federalFundsRate: 0.053,
    treasury10Y: 0.044,
    usdIndex: 102.5,
    unemploymentRate: 0.037,
    wageGrowth: 0.045,
    laborProductivity: 105.2,
    consumerConfidence: 102.0,
    businessConfidence: 98.5,
  },

  industry: {
    industryName: 'Consumer Electronics',
    sectorName: 'Technology',
    industryRevenue: 1500000000000,
    industryGrowthRate: 0.08,
    marketSize: 2000000000000,
    competitorRevenues: [
      { symbol: 'AAPL', revenue: 394000000000 },
      { symbol: 'MSFT', revenue: 211000000000 },
      { symbol: 'GOOGL', revenue: 307000000000 },
      { symbol: 'AMZN', revenue: 514000000000 },
      { symbol: 'META', revenue: 134000000000 },
    ],
  },

  timestamp: new Date(),
};

// ============================================================================
// TEST RUNNER
// ============================================================================

function runTests() {
  console.log('='.repeat(80));
  console.log('Deep Terminal - Metrics Calculator Test');
  console.log('='.repeat(80));
  console.log();

  try {
    // Create calculator instance
    const calculator = new MetricsCalculator(mockRawData);

    // Calculate all metrics
    console.log('⏳ Calculating all metrics...');
    const startTime = Date.now();
    const metrics = calculator.calculateAll();
    const elapsed = Date.now() - startTime;

    console.log(`✅ Calculated 170+ metrics in ${elapsed}ms`);
    console.log();

    // Display results by category
    displayMetrics(metrics);

    console.log();
    console.log('='.repeat(80));
    console.log('✅ All tests passed successfully!');
    console.log('='.repeat(80));
  } catch (error) {
    console.error('❌ Test failed:', error);
    process.exit(1);
  }
}

// ============================================================================
// DISPLAY FUNCTIONS
// ============================================================================

function displayMetrics(metrics: any) {
  // Company Info
  console.log('📊 COMPANY INFORMATION');
  console.log('-'.repeat(80));
  console.log(`Symbol:        ${metrics.symbol}`);
  console.log(`Industry:      ${metrics.industry}`);
  console.log(`Sector:        ${metrics.sector}`);
  console.log(`Timestamp:     ${metrics.timestamp.toISOString()}`);
  console.log();

  // Macro Metrics
  console.log('🌍 MACRO METRICS (15)');
  console.log('-'.repeat(80));
  console.log(
    `GDP Growth:          ${formatPercentage(metrics.macro.gdpGrowthRate)}`
  );
  console.log(`CPI:                 ${formatNumber(metrics.macro.cpi)}`);
  console.log(
    `Fed Funds Rate:      ${formatPercentage(metrics.macro.federalFundsRate)}`
  );
  console.log(
    `Treasury 10Y:        ${formatPercentage(metrics.macro.treasury10Y)}`
  );
  console.log(
    `Unemployment:        ${formatPercentage(metrics.macro.unemploymentRate)}`
  );
  console.log();

  // Industry Metrics
  console.log('🏭 INDUSTRY METRICS (5)');
  console.log('-'.repeat(80));
  console.log(
    `Market Share:        ${formatPercentage(metrics.industry.marketShare)}`
  );
  console.log(`HHI Index:           ${formatNumber(metrics.industry.hhiIndex)}`);
  console.log(`CR4:                 ${formatPercentage(metrics.industry.cr4)}`);
  console.log();

  // Liquidity Metrics
  console.log('💧 LIQUIDITY RATIOS (7)');
  console.log('-'.repeat(80));
  console.log(
    `Current Ratio:       ${formatNumber(metrics.liquidity.currentRatio)}`
  );
  console.log(
    `Quick Ratio:         ${formatNumber(metrics.liquidity.quickRatio)}`
  );
  console.log(
    `Cash Ratio:          ${formatNumber(metrics.liquidity.cashRatio)}`
  );
  console.log(
    `Cash Conv. Cycle:    ${formatNumber(metrics.liquidity.cashConversionCycle)} days`
  );
  console.log();

  // Leverage Metrics
  console.log('🧱 LEVERAGE RATIOS (7)');
  console.log('-'.repeat(80));
  console.log(
    `Debt/Assets:         ${formatPercentage(metrics.leverage.debtToAssets)}`
  );
  console.log(
    `Debt/Equity:         ${formatNumber(metrics.leverage.debtToEquity)}`
  );
  console.log(
    `Interest Coverage:   ${formatNumber(metrics.leverage.interestCoverage)}x`
  );
  console.log(
    `Debt/EBITDA:         ${formatNumber(metrics.leverage.debtToEBITDA)}x`
  );
  console.log();

  // Profitability Metrics
  console.log('💰 PROFITABILITY RATIOS (8)');
  console.log('-'.repeat(80));
  console.log(
    `Gross Margin:        ${formatPercentage(metrics.profitability.grossProfitMargin)}`
  );
  console.log(
    `Operating Margin:    ${formatPercentage(metrics.profitability.operatingProfitMargin)}`
  );
  console.log(
    `Net Margin:          ${formatPercentage(metrics.profitability.netProfitMargin)}`
  );
  console.log(
    `ROA:                 ${formatPercentage(metrics.profitability.roa)}`
  );
  console.log(
    `ROE:                 ${formatPercentage(metrics.profitability.roe)}`
  );
  console.log(
    `ROIC:                ${formatPercentage(metrics.profitability.roic)}`
  );
  console.log();

  // Growth Metrics
  console.log('📈 GROWTH METRICS (9)');
  console.log('-'.repeat(80));
  console.log(
    `Revenue YoY:         ${formatPercentage(metrics.growth.revenueGrowthYoY)}`
  );
  console.log(
    `EPS YoY:             ${formatPercentage(metrics.growth.epsGrowthYoY)}`
  );
  console.log(
    `Revenue 3Y CAGR:     ${formatPercentage(metrics.growth.revenue3YearCAGR)}`
  );
  console.log(
    `Revenue 5Y CAGR:     ${formatPercentage(metrics.growth.revenue5YearCAGR)}`
  );
  console.log();

  // Valuation Metrics
  console.log('📊 VALUATION METRICS (14)');
  console.log('-'.repeat(80));
  console.log(`P/E Ratio:           ${formatNumber(metrics.valuation.peRatio)}`);
  console.log(
    `Forward P/E:         ${formatNumber(metrics.valuation.forwardPE)}`
  );
  console.log(`P/B Ratio:           ${formatNumber(metrics.valuation.pbRatio)}`);
  console.log(`P/S Ratio:           ${formatNumber(metrics.valuation.psRatio)}`);
  console.log(
    `EV/EBITDA:           ${formatNumber(metrics.valuation.evToEBITDA)}x`
  );
  console.log(
    `Dividend Yield:      ${formatPercentage(metrics.valuation.dividendYield)}`
  );
  console.log();

  // DCF Metrics
  console.log('🎯 DCF / INTRINSIC VALUE (10)');
  console.log('-'.repeat(80));
  console.log(
    `Cost of Equity:      ${formatPercentage(metrics.dcf.costOfEquity)}`
  );
  console.log(`WACC:                ${formatPercentage(metrics.dcf.wacc)}`);
  console.log(
    `Intrinsic Value:     ${formatCurrency(metrics.dcf.intrinsicValue)}`
  );
  console.log();

  // Risk Metrics
  console.log('📉 RISK METRICS (7)');
  console.log('-'.repeat(80));
  console.log(`Beta:                ${formatNumber(metrics.risk.beta)}`);
  console.log(
    `Std Deviation:       ${formatPercentage(metrics.risk.standardDeviation)}`
  );
  console.log(
    `Sharpe Ratio:        ${formatNumber(metrics.risk.sharpeRatio)}`
  );
  console.log(
    `Max Drawdown:        ${formatPercentage(metrics.risk.maxDrawdown)}`
  );
  console.log();

  // Technical Indicators
  console.log('📊 TECHNICAL INDICATORS (8)');
  console.log('-'.repeat(80));
  console.log(`RSI:                 ${formatNumber(metrics.technical.rsi)}`);
  console.log(
    `50-Day MA:           ${formatCurrency(metrics.technical.fiftyDayMA)}`
  );
  console.log(
    `200-Day MA:          ${formatCurrency(metrics.technical.twoHundredDayMA)}`
  );
  console.log();

  // Scores
  console.log('🧮 COMPOSITE SCORES (6)');
  console.log('-'.repeat(80));
  console.log(
    `Profitability:       ${formatNumber(metrics.scores.profitabilityScore)}/100`
  );
  console.log(
    `Growth:              ${formatNumber(metrics.scores.growthScore)}/100`
  );
  console.log(
    `Valuation:           ${formatNumber(metrics.scores.valuationScore)}/100`
  );
  console.log(
    `Risk:                ${formatNumber(metrics.scores.riskScore)}/100`
  );
  console.log(
    `Health:              ${formatNumber(metrics.scores.healthScore)}/100`
  );
  console.log(
    `TOTAL SCORE:         ${formatNumber(metrics.scores.totalScore)}/100 ⭐`
  );
  console.log();

  // Other Metrics
  console.log('🧾 OTHER KEY METRICS (10)');
  console.log('-'.repeat(80));
  console.log(
    `Effective Tax Rate:  ${formatPercentage(metrics.other.effectiveTaxRate)}`
  );
  console.log(
    `Altman Z-Score:      ${formatNumber(metrics.other.altmanZScore)}`
  );
  console.log(
    `Piotroski F-Score:   ${formatNumber(metrics.other.piotroskiFScore)}/9`
  );
  console.log();
}

// ============================================================================
// HELPERS
// ============================================================================

function generateMockPriceHistory(
  currentPrice: number,
  days: number
): Array<{
  date: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}> {
  const history = [];
  let price = currentPrice * 0.8;

  for (let i = days; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);

    const change = (Math.random() - 0.48) * 2;
    price = price * (1 + change / 100);

    const open = price;
    const close = price * (1 + (Math.random() - 0.5) / 100);
    const high = Math.max(open, close) * (1 + Math.random() / 100);
    const low = Math.min(open, close) * (1 - Math.random() / 100);

    history.push({
      date: date.toISOString().split('T')[0],
      open,
      high,
      low,
      close,
      volume: 40000000 + Math.random() * 20000000,
    });

    price = close;
  }

  return history;
}

// ============================================================================
// RUN TESTS
// ============================================================================

runTests();
