/**
 * Deep Terminal - Metrics Calculator Examples
 *
 * Practical examples showing how to use the metrics calculator
 */

import {
  MetricsCalculator,
  calculateMetricCategory,
  countCalculatedMetrics,
  validateRawData,
  formatPercentage,
  formatNumber,
  formatCurrency,
} from './index';
import type {
  RawFinancialData,
  LiquidityMetrics,
  ProfitabilityMetrics,
  ScoreMetrics,
} from './types';

// ============================================================================
// EXAMPLE 1: Basic Usage - Calculate All Metrics
// ============================================================================

export function example1_basicUsage() {
  console.log('\n📊 Example 1: Basic Usage\n');

  // Sample raw data (in production, fetch from APIs)
  const rawData: RawFinancialData = getMockData();

  // Create calculator
  const calculator = new MetricsCalculator(rawData);

  // Calculate all metrics
  const metrics = calculator.calculateAll();

  // Access specific metrics
  console.log('Company:', metrics.symbol);
  console.log('ROE:', formatPercentage(metrics.profitability.roe));
  console.log('P/E Ratio:', formatNumber(metrics.valuation.peRatio));
  console.log('Total Score:', formatNumber(metrics.scores.totalScore), '/100');

  return metrics;
}

// ============================================================================
// EXAMPLE 2: Custom Calculator Options
// ============================================================================

export function example2_customOptions() {
  console.log('\n⚙️ Example 2: Custom Calculator Options\n');

  const rawData: RawFinancialData = getMockData();

  // Custom options
  const options = {
    marketRiskPremium: 0.06, // 6% instead of default 5%
    terminalGrowthRate: 0.03, // 3% instead of default 2.5%
    taxRate: 0.25, // 25% instead of calculated
    riskFreeRate: 0.045, // 4.5% instead of FRED data
  };

  const calculator = new MetricsCalculator(rawData, options);
  const metrics = calculator.calculateAll();

  console.log('WACC (custom):', formatPercentage(metrics.dcf.wacc));
  console.log('Cost of Equity:', formatPercentage(metrics.dcf.costOfEquity));
  console.log('Intrinsic Value:', formatCurrency(metrics.dcf.intrinsicValue));

  return metrics;
}

// ============================================================================
// EXAMPLE 3: Calculate Single Category
// ============================================================================

export function example3_singleCategory() {
  console.log('\n📈 Example 3: Calculate Single Category\n');

  const rawData: RawFinancialData = getMockData();

  // Calculate only profitability metrics
  const profitability = calculateMetricCategory<ProfitabilityMetrics>(
    rawData,
    'profitability'
  );

  console.log('Gross Margin:', formatPercentage(profitability.grossProfitMargin));
  console.log('Operating Margin:', formatPercentage(profitability.operatingProfitMargin));
  console.log('Net Margin:', formatPercentage(profitability.netProfitMargin));
  console.log('ROE:', formatPercentage(profitability.roe));
  console.log('ROIC:', formatPercentage(profitability.roic));

  return profitability;
}

// ============================================================================
// EXAMPLE 4: Validate Data Before Calculation
// ============================================================================

export function example4_validateData() {
  console.log('\n✅ Example 4: Validate Data\n');

  const rawData: Partial<RawFinancialData> = {
    yahoo: getMockData().yahoo,
    // Missing fred and industry data
  };

  const validation = validateRawData(rawData);

  if (!validation.valid) {
    console.error('❌ Data validation failed!');
    console.error('Missing fields:', validation.missingFields);
    return null;
  }

  console.log('✅ Data validation passed!');
  return rawData;
}

// ============================================================================
// EXAMPLE 5: Compare Multiple Stocks
// ============================================================================

export function example5_compareStocks() {
  console.log('\n🔄 Example 5: Compare Multiple Stocks\n');

  const symbols = ['AAPL', 'MSFT', 'GOOGL'];
  const results = [];

  for (const symbol of symbols) {
    const rawData = getMockData(); // In production, fetch real data
    rawData.yahoo.symbol = symbol;

    const calculator = new MetricsCalculator(rawData);
    const metrics = calculator.calculateAll();

    results.push({
      symbol,
      totalScore: metrics.scores.totalScore,
      roe: metrics.profitability.roe,
      pe: metrics.valuation.peRatio,
      revenueGrowth: metrics.growth.revenueGrowthYoY,
    });
  }

  // Sort by total score
  results.sort((a, b) => (b.totalScore ?? 0) - (a.totalScore ?? 0));

  console.log('📊 Stock Comparison (sorted by Total Score):');
  results.forEach((r, i) => {
    console.log(`\n${i + 1}. ${r.symbol}`);
    console.log(`   Total Score: ${formatNumber(r.totalScore)}`);
    console.log(`   ROE: ${formatPercentage(r.roe)}`);
    console.log(`   P/E: ${formatNumber(r.pe)}`);
    console.log(`   Revenue Growth: ${formatPercentage(r.revenueGrowth)}`);
  });

  return results;
}

// ============================================================================
// EXAMPLE 6: Focus on Specific Scores
// ============================================================================

export function example6_analyzeScores() {
  console.log('\n🎯 Example 6: Analyze Composite Scores\n');

  const rawData: RawFinancialData = getMockData();
  const scores = calculateMetricCategory<ScoreMetrics>(rawData, 'scores');

  console.log('Composite Scores (0-100):');
  console.log('─'.repeat(40));
  console.log(`Profitability:  ${formatNumber(scores.profitabilityScore)}/100 ⭐`);
  console.log(`Growth:         ${formatNumber(scores.growthScore)}/100 📈`);
  console.log(`Valuation:      ${formatNumber(scores.valuationScore)}/100 💰`);
  console.log(`Risk:           ${formatNumber(scores.riskScore)}/100 🛡️`);
  console.log(`Health:         ${formatNumber(scores.healthScore)}/100 ❤️`);
  console.log('─'.repeat(40));
  console.log(`TOTAL:          ${formatNumber(scores.totalScore)}/100 🏆`);

  // Determine rating
  const total = scores.totalScore ?? 0;
  let rating = '';
  if (total >= 90) rating = 'Excellent (AAA)';
  else if (total >= 80) rating = 'Very Good (AA)';
  else if (total >= 70) rating = 'Good (A)';
  else if (total >= 60) rating = 'Fair (BBB)';
  else if (total >= 50) rating = 'Below Average (BB)';
  else rating = 'Poor (B)';

  console.log(`\nRating: ${rating}`);

  return scores;
}

// ============================================================================
// EXAMPLE 7: Health Check - Liquidity & Leverage
// ============================================================================

export function example7_healthCheck() {
  console.log('\n🏥 Example 7: Financial Health Check\n');

  const rawData: RawFinancialData = getMockData();

  const liquidity = calculateMetricCategory<LiquidityMetrics>(
    rawData,
    'liquidity'
  );
  const leverage = calculateMetricCategory(rawData, 'leverage');

  console.log('Liquidity Analysis:');
  console.log(`  Current Ratio: ${formatNumber(liquidity.currentRatio)}`);
  console.log(
    `  ${liquidity.currentRatio && liquidity.currentRatio >= 2 ? '✅ Strong' : '⚠️ Weak'}`
  );
  console.log(`  Quick Ratio: ${formatNumber(liquidity.quickRatio)}`);
  console.log(
    `  ${liquidity.quickRatio && liquidity.quickRatio >= 1 ? '✅ Strong' : '⚠️ Weak'}`
  );

  console.log('\nLeverage Analysis:');
  console.log(`  Debt/Equity: ${formatNumber(leverage.debtToEquity)}`);
  console.log(
    `  ${leverage.debtToEquity && leverage.debtToEquity <= 1 ? '✅ Conservative' : '⚠️ Aggressive'}`
  );
  console.log(`  Interest Coverage: ${formatNumber(leverage.interestCoverage)}x`);
  console.log(
    `  ${leverage.interestCoverage && leverage.interestCoverage >= 5 ? '✅ Strong' : '⚠️ Weak'}`
  );
}

// ============================================================================
// EXAMPLE 8: Count Calculated Metrics
// ============================================================================

export function example8_countMetrics() {
  console.log('\n🔢 Example 8: Count Calculated Metrics\n');

  const rawData: RawFinancialData = getMockData();
  const calculator = new MetricsCalculator(rawData);
  const metrics = calculator.calculateAll();

  const counts = countCalculatedMetrics(metrics);

  console.log(`Total metrics calculated: ${counts.total}`);
  console.log('\nBreakdown by category:');

  Object.entries(counts.byCategory).forEach(([category, count]) => {
    console.log(`  ${category.padEnd(15)} ${count} metrics`);
  });
}

// ============================================================================
// EXAMPLE 9: Error Handling
// ============================================================================

export function example9_errorHandling() {
  console.log('\n⚠️ Example 9: Error Handling\n');

  try {
    const rawData = getMockData();

    // Simulate missing critical data
    rawData.yahoo.revenue = 0; // This will cause division issues
    rawData.yahoo.totalAssets = 0;

    const calculator = new MetricsCalculator(rawData);
    const metrics = calculator.calculateAll();

    // All calculations handle null gracefully
    console.log('ROA:', metrics.profitability.roa ?? 'N/A (null)');
    console.log('Asset Turnover:', metrics.efficiency.totalAssetTurnover ?? 'N/A (null)');

    console.log('\n✅ No errors thrown - null values returned gracefully');
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

// ============================================================================
// EXAMPLE 10: API Integration
// ============================================================================

export async function example10_apiIntegration() {
  console.log('\n🌐 Example 10: API Integration\n');

  // Simulate API call
  const symbol = 'AAPL';

  try {
    // In production: const response = await fetch(`/api/stock/${symbol}/metrics`);
    // For demo, calculate directly
    const rawData = getMockData();
    const calculator = new MetricsCalculator(rawData);
    const metrics = calculator.calculateAll();

    const apiResponse = {
      success: true,
      data: metrics,
      cached: false,
      timestamp: new Date(),
    };

    console.log('API Response:');
    console.log(`  Success: ${apiResponse.success}`);
    console.log(`  Symbol: ${apiResponse.data?.symbol}`);
    console.log(`  Total Score: ${apiResponse.data?.scores.totalScore}`);
    console.log(`  Cached: ${apiResponse.cached}`);
    console.log(`  Timestamp: ${apiResponse.timestamp.toISOString()}`);

    return apiResponse;
  } catch (error) {
    console.error('API Error:', error);
    return {
      success: false,
      error: 'Failed to fetch metrics',
      cached: false,
      timestamp: new Date(),
    };
  }
}

// ============================================================================
// HELPER: Get Mock Data
// ============================================================================

function getMockData(): RawFinancialData {
  return {
    yahoo: {
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
      operatingCashFlow: 104000000000,
      investingCashFlow: -8000000000,
      financingCashFlow: -93000000000,
      capitalExpenditures: 11000000000,
      freeCashFlow: 93000000000,
      dividendsPaid: 15000000000,
      sharesOutstanding: 16670000000,
      floatShares: 16600000000,
      historicalRevenue: [265000000000, 274000000000, 365000000000, 394000000000, 383000000000, 394000000000],
      historicalNetIncome: [55000000000, 59000000000, 99000000000, 94000000000, 95000000000, 98000000000],
      historicalEPS: [3.28, 3.57, 5.99, 5.67, 5.72, 5.88],
      historicalDividends: [0.63, 0.73, 0.82, 0.87, 0.92, 0.96],
      historicalFCF: [65000000000, 70000000000, 80000000000, 92000000000, 99000000000, 93000000000],
      priceHistory: Array(252)
        .fill(null)
        .map((_, i) => ({
          date: new Date(Date.now() - i * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          open: 150 + Math.random() * 10 - 5,
          high: 155 + Math.random() * 5,
          low: 145 - Math.random() * 5,
          close: 150 + Math.random() * 10 - 5,
          volume: 50000000 + Math.random() * 10000000,
        })),
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
}

// ============================================================================
// RUN ALL EXAMPLES
// ============================================================================

export function runAllExamples() {
  console.log('═'.repeat(80));
  console.log('Deep Terminal - Metrics Calculator Examples');
  console.log('═'.repeat(80));

  example1_basicUsage();
  example2_customOptions();
  example3_singleCategory();
  example4_validateData();
  example5_compareStocks();
  example6_analyzeScores();
  example7_healthCheck();
  example8_countMetrics();
  example9_errorHandling();

  console.log('\n═'.repeat(80));
  console.log('✅ All examples completed successfully!');
  console.log('═'.repeat(80));
}

// Run if executed directly
if (require.main === module) {
  runAllExamples();
}
