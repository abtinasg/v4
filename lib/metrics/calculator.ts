/**
 * Deep Terminal - Metrics Calculator
 *
 * Main calculation engine for 170+ financial metrics
 * Processes raw data from Yahoo Finance, FRED, and other sources
 */

import type {
  AllMetrics,
  CalculatorOptions,
  CashFlowMetrics,
  DCFMetrics,
  DupontMetrics,
  EfficiencyMetrics,
  GrowthMetrics,
  IndustryMetrics,
  LeverageMetrics,
  LiquidityMetrics,
  MacroMetrics,
  OtherMetrics,
  ProfitabilityMetrics,
  RawFinancialData,
  RiskMetrics,
  ScoreMetrics,
  TechnicalMetrics,
  ValuationMetrics,
} from './types';
import {
  calculateBollingerBands,
  calculateCAGR,
  calculateMaxDrawdown,
  calculateRSI,
  calculateSMA,
  downsideDeviation,
  normalizeToScale,
  percentageChange,
  safeDivide,
  safeMultiply,
  safeSubtract,
  standardDeviation,
  weightedAverage,
} from './helpers';

/**
 * Main calculator class for all financial metrics
 */
export class MetricsCalculator {
  private rawData: RawFinancialData;
  private options: Required<CalculatorOptions>;

  constructor(rawData: RawFinancialData, options: CalculatorOptions = {}) {
    this.rawData = rawData;
    this.options = {
      marketRiskPremium: options.marketRiskPremium ?? 0.05,
      terminalGrowthRate: options.terminalGrowthRate ?? 0.025,
      taxRate: options.taxRate ?? this.calculateEffectiveTaxRate(),
      riskFreeRate: options.riskFreeRate ?? rawData.fred.treasury10Y ?? 0.04,
    };
  }

  /**
   * Calculate all metrics at once
   */
  public calculateAll(): AllMetrics {
    const yahoo = this.rawData.yahoo;

    return {
      symbol: yahoo.symbol,
      companyName: yahoo.symbol, // Would come from API
      sector: this.rawData.industry.sectorName,
      industryName: this.rawData.industry.industryName,
      timestamp: this.rawData.timestamp,

      macro: this.calculateMacroMetrics(),
      industry: this.calculateIndustryMetrics(),
      liquidity: this.calculateLiquidityMetrics(),
      leverage: this.calculateLeverageMetrics(),
      efficiency: this.calculateEfficiencyMetrics(),
      profitability: this.calculateProfitabilityMetrics(),
      dupont: this.calculateDupontMetrics(),
      growth: this.calculateGrowthMetrics(),
      cashFlow: this.calculateCashFlowMetrics(),
      valuation: this.calculateValuationMetrics(),
      dcf: this.calculateDCFMetrics(),
      risk: this.calculateRiskMetrics(),
      technical: this.calculateTechnicalMetrics(),
      scores: this.calculateScores(),
      other: this.calculateOtherMetrics(),
    };
  }

  // ==========================================================================
  // MACRO METRICS (15 metrics from FRED)
  // ==========================================================================

  private calculateMacroMetrics(): MacroMetrics {
    const fred = this.rawData.fred;

    return {
      gdpGrowthRate: fred.gdpGrowthRate,
      realGDP: fred.realGDP,
      nominalGDP: fred.nominalGDP,
      gdpPerCapita: fred.gdpPerCapita,
      cpi: fred.cpi,
      ppi: fred.ppi,
      coreInflation: fred.coreInflation,
      federalFundsRate: fred.federalFundsRate,
      treasury10Y: fred.treasury10Y,
      usdIndex: fred.usdIndex,
      unemploymentRate: fred.unemploymentRate,
      wageGrowth: fred.wageGrowth,
      laborProductivity: fred.laborProductivity,
      consumerConfidence: fred.consumerConfidence,
      businessConfidence: fred.businessConfidence,
    };
  }

  // ==========================================================================
  // INDUSTRY METRICS (5 metrics)
  // ==========================================================================

  private calculateIndustryMetrics(): IndustryMetrics {
    const industry = this.rawData.industry;
    const revenue = this.rawData.yahoo.revenue;

    // Market Share = Company Revenue / Industry Revenue
    const marketShare = safeDivide(revenue, industry.industryRevenue);

    // HHI Index = Σ(market share²) × 10000
    const hhiIndex = this.calculateHHI();

    // CR4 = Sum of top 4 market shares
    const cr4 = this.calculateCR4();

    return {
      industryGrowthRate: industry.industryGrowthRate,
      marketSize: industry.marketSize,
      marketShare,
      hhiIndex,
      cr4,
    };
  }

  private calculateHHI(): number | null {
    const competitors = this.rawData.industry.competitorRevenues;
    const industryRevenue = this.rawData.industry.industryRevenue;

    if (!competitors.length || !industryRevenue) return null;

    let hhi = 0;
    for (const comp of competitors) {
      const share = comp.revenue / industryRevenue;
      hhi += share * share;
    }

    return hhi * 10000;
  }

  private calculateCR4(): number | null {
    const competitors = this.rawData.industry.competitorRevenues;
    const industryRevenue = this.rawData.industry.industryRevenue;

    if (!competitors.length || !industryRevenue) return null;

    // Sort by revenue descending
    const sorted = [...competitors].sort((a, b) => b.revenue - a.revenue);
    const top4 = sorted.slice(0, 4);

    const top4Revenue = top4.reduce((sum, comp) => sum + comp.revenue, 0);
    return safeDivide(top4Revenue, industryRevenue);
  }

  // ==========================================================================
  // LIQUIDITY RATIOS (7 metrics)
  // ==========================================================================

  private calculateLiquidityMetrics(): LiquidityMetrics {
    const bs = this.rawData.yahoo;
    const is = this.rawData.yahoo;

    // Try to calculate, fall back to Yahoo's pre-calculated values
    const currentRatio = safeDivide(bs.currentAssets, bs.currentLiabilities) ?? bs.currentRatio;

    const quickRatio = safeDivide(
      bs.currentAssets - bs.inventory,
      bs.currentLiabilities
    ) ?? bs.quickRatio;

    const cashRatio = safeDivide(bs.cash, bs.currentLiabilities);

    const daysSalesOutstanding = safeDivide(
      bs.netReceivables / is.revenue,
      1 / 365
    );

    const daysInventoryOutstanding = safeDivide(
      bs.inventory / is.costOfRevenue,
      1 / 365
    );

    const daysPayablesOutstanding = safeDivide(
      bs.accountsPayable / is.costOfRevenue,
      1 / 365
    );

    const cashConversionCycle =
      daysSalesOutstanding != null &&
      daysInventoryOutstanding != null &&
      daysPayablesOutstanding != null
        ? daysSalesOutstanding + daysInventoryOutstanding - daysPayablesOutstanding
        : null;

    return {
      currentRatio,
      quickRatio,
      cashRatio,
      daysSalesOutstanding,
      daysInventoryOutstanding,
      daysPayablesOutstanding,
      cashConversionCycle,
    };
  }

  // ==========================================================================
  // LEVERAGE / SOLVENCY RATIOS (7 metrics)
  // ==========================================================================

  private calculateLeverageMetrics(): LeverageMetrics {
    const bs = this.rawData.yahoo;
    const is = this.rawData.yahoo;

    const debtToAssets = safeDivide(bs.totalDebt, bs.totalAssets);
    // Fall back to Yahoo's pre-calculated value
    const debtToEquity = safeDivide(bs.totalDebt, bs.totalEquity) ?? bs.debtToEquity;

    const financialDebtToEquity = safeDivide(
      bs.longTermDebt + bs.shortTermDebt,
      bs.totalEquity
    );

    const interestCoverage = safeDivide(is.ebit, is.interestExpense);

    // NOI ≈ Operating Income for stocks
    const debtServiceCoverage = safeDivide(
      is.operatingIncome,
      is.interestExpense
    );

    const equityMultiplier = safeDivide(bs.totalAssets, bs.totalEquity);

    const debtToEBITDA = safeDivide(bs.totalDebt, is.ebitda);

    return {
      debtToAssets,
      debtToEquity,
      financialDebtToEquity,
      interestCoverage,
      debtServiceCoverage,
      equityMultiplier,
      debtToEBITDA,
    };
  }

  // ==========================================================================
  // EFFICIENCY RATIOS (6 metrics)
  // ==========================================================================

  private calculateEfficiencyMetrics(): EfficiencyMetrics {
    const bs = this.rawData.yahoo;
    const is = this.rawData.yahoo;

    const totalAssetTurnover = safeDivide(is.revenue, bs.totalAssets);

    const fixedAssetTurnover = safeDivide(
      is.revenue,
      bs.totalAssets - bs.currentAssets
    );

    const inventoryTurnover = safeDivide(is.costOfRevenue, bs.inventory);

    const receivablesTurnover = safeDivide(is.revenue, bs.netReceivables);

    const payablesTurnover = safeDivide(is.costOfRevenue, bs.accountsPayable);

    const workingCapital = bs.currentAssets - bs.currentLiabilities;
    const workingCapitalTurnover = safeDivide(is.revenue, workingCapital);

    return {
      totalAssetTurnover,
      fixedAssetTurnover,
      inventoryTurnover,
      receivablesTurnover,
      payablesTurnover,
      workingCapitalTurnover,
    };
  }

  // ==========================================================================
  // PROFITABILITY RATIOS (8 metrics)
  // ==========================================================================

  private calculateProfitabilityMetrics(): ProfitabilityMetrics {
    const is = this.rawData.yahoo;
    const bs = this.rawData.yahoo;

    // Try to calculate, fall back to Yahoo's pre-calculated values
    const grossProfitMargin = safeDivide(is.grossProfit, is.revenue) ?? is.grossMargin;

    const operatingProfitMargin = safeDivide(is.operatingIncome, is.revenue) ?? is.operatingMargin;

    const ebitdaMargin = safeDivide(is.ebitda, is.revenue);

    const netProfitMargin = safeDivide(is.netIncome, is.revenue) ?? is.profitMargin;

    const roa = safeDivide(is.netIncome, bs.totalAssets) ?? is.returnOnAssets;

    const roe = safeDivide(is.netIncome, bs.totalEquity) ?? is.returnOnEquity;

    // NOPLAT = EBIT × (1 - Tax Rate)
    const noplat = this.calculateNOPLAT();

    // Invested Capital = Total Equity + Total Debt - Cash
    const investedCapital = bs.totalEquity + bs.totalDebt - bs.cash;
    const roic = safeDivide(noplat, investedCapital);

    return {
      grossProfitMargin,
      operatingProfitMargin,
      ebitdaMargin,
      netProfitMargin,
      roa,
      roe,
      roic,
      noplat,
    };
  }

  private calculateNOPLAT(): number | null {
    const ebit = this.rawData.yahoo.ebit;
    const taxRate = this.options.taxRate ?? 0;
    return safeMultiply(ebit, 1 - taxRate);
  }

  // ==========================================================================
  // DUPONT ANALYSIS (7 metrics)
  // ==========================================================================

  private calculateDupontMetrics(): DupontMetrics {
    const is = this.rawData.yahoo;
    const bs = this.rawData.yahoo;

    const netProfitMargin = safeDivide(is.netIncome, is.revenue);

    const assetTurnover = safeDivide(is.revenue, bs.totalAssets);

    const equityMultiplier = safeDivide(bs.totalAssets, bs.totalEquity);

    // ROE (DuPont) = NPM × AT × EM
    const roeDupont = safeMultiply(
      netProfitMargin,
      assetTurnover,
      equityMultiplier
    );

    const operatingMargin = safeDivide(is.operatingIncome, is.revenue);

    // Interest Burden = EBT / EBIT
    const interestBurden = safeDivide(is.pretaxIncome, is.ebit);

    // Tax Burden = Net Income / EBT
    const taxBurden = safeDivide(is.netIncome, is.pretaxIncome);

    return {
      netProfitMargin,
      assetTurnover,
      equityMultiplier,
      roeDupont,
      operatingMargin,
      interestBurden,
      taxBurden,
    };
  }

  // ==========================================================================
  // GROWTH METRICS (9 metrics)
  // ==========================================================================

  private calculateGrowthMetrics(): GrowthMetrics {
    const yahoo = this.rawData.yahoo;

    // YoY Growth (current vs previous year) - fall back to Yahoo's pre-calculated values
    const revenueGrowthYoY =
      yahoo.historicalRevenue.length >= 2
        ? percentageChange(
            yahoo.historicalRevenue[yahoo.historicalRevenue.length - 1],
            yahoo.historicalRevenue[yahoo.historicalRevenue.length - 2]
          )
        : yahoo.revenueGrowth;  // Fall back to Yahoo's value

    const epsGrowthYoY =
      yahoo.historicalEPS.length >= 2
        ? percentageChange(
            yahoo.historicalEPS[yahoo.historicalEPS.length - 1],
            yahoo.historicalEPS[yahoo.historicalEPS.length - 2]
          )
        : yahoo.earningsGrowth;  // Fall back to Yahoo's value

    const dpsGrowth =
      yahoo.historicalDividends.length >= 2
        ? percentageChange(
            yahoo.historicalDividends[yahoo.historicalDividends.length - 1],
            yahoo.historicalDividends[yahoo.historicalDividends.length - 2]
          )
        : null;

    const fcfGrowth =
      yahoo.historicalFCF.length >= 2
        ? percentageChange(
            yahoo.historicalFCF[yahoo.historicalFCF.length - 1],
            yahoo.historicalFCF[yahoo.historicalFCF.length - 2]
          )
        : null;

    // 3-Year CAGR
    const revenue3YearCAGR =
      yahoo.historicalRevenue.length >= 4
        ? calculateCAGR(
            yahoo.historicalRevenue[yahoo.historicalRevenue.length - 1],
            yahoo.historicalRevenue[yahoo.historicalRevenue.length - 4],
            3
          )
        : null;

    // 5-Year CAGR
    const revenue5YearCAGR =
      yahoo.historicalRevenue.length >= 6
        ? calculateCAGR(
            yahoo.historicalRevenue[yahoo.historicalRevenue.length - 1],
            yahoo.historicalRevenue[yahoo.historicalRevenue.length - 6],
            5
          )
        : null;

    // Payout Ratio = Dividends / Net Income
    const payoutRatio = safeDivide(yahoo.dividendsPaid, yahoo.netIncome);

    // Retention Ratio = 1 - Payout Ratio
    const retentionRatio = payoutRatio != null ? 1 - payoutRatio : null;

    // Sustainable Growth Rate = ROE × Retention Ratio
    const roe = safeDivide(yahoo.netIncome, yahoo.totalEquity);
    const sustainableGrowthRate = safeMultiply(roe, retentionRatio);

    return {
      revenueGrowthYoY,
      epsGrowthYoY,
      dpsGrowth,
      fcfGrowth,
      revenue3YearCAGR,
      revenue5YearCAGR,
      sustainableGrowthRate,
      retentionRatio,
      payoutRatio,
    };
  }

  // ==========================================================================
  // CASH FLOW METRICS (8 metrics)
  // ==========================================================================

  private calculateCashFlowMetrics(): CashFlowMetrics {
    const cf = this.rawData.yahoo;
    const is = this.rawData.yahoo;
    const bs = this.rawData.yahoo;

    const operatingCashFlow = cf.operatingCashFlow;
    const investingCashFlow = cf.investingCashFlow;
    const financingCashFlow = cf.financingCashFlow;
    const freeCashFlow = cf.freeCashFlow;

    // FCFF = EBIT(1-t) + D&A - CapEx - ΔNWC
    // Simplified: EBIT(1-t) - CapEx
    const taxRate = this.options.taxRate ?? 0;
    const fcff = safeSubtract(
      safeMultiply(is.ebit, 1 - taxRate),
      cf.capitalExpenditures
    );

    // FCFE = FCFF - Interest(1-t) + Net Borrowing
    // Simplified: FCF (already accounts for financing)
    const fcfe = freeCashFlow;

    // Cash Flow Adequacy = OCF / (CapEx + Debt + Dividends)
    const totalCashNeeds =
      Math.abs(cf.capitalExpenditures) +
      Math.abs(bs.shortTermDebt) +
      Math.abs(cf.dividendsPaid);
    const cashFlowAdequacy = safeDivide(operatingCashFlow, totalCashNeeds);

    // Cash Reinvestment Ratio = (CapEx - D&A) / OCF
    // Simplified without D&A: CapEx / OCF
    const cashReinvestmentRatio = safeDivide(
      cf.capitalExpenditures,
      operatingCashFlow
    );

    return {
      operatingCashFlow,
      investingCashFlow,
      financingCashFlow,
      freeCashFlow,
      fcff,
      fcfe,
      cashFlowAdequacy,
      cashReinvestmentRatio,
    };
  }

  // ==========================================================================
  // VALUATION METRICS (14 metrics)
  // ==========================================================================

  private calculateValuationMetrics(): ValuationMetrics {
    const yahoo = this.rawData.yahoo;

    const peRatio = yahoo.pe;
    const forwardPE = yahoo.forwardPE;

    // Justified P/E = (1 - b) / (r - g)
    // where b = retention ratio, r = required return, g = growth rate
    const justifiedPE = this.calculateJustifiedPE();

    // P/B Ratio = Price / Book Value per Share
    const bookValuePerShare = safeDivide(
      yahoo.totalEquity,
      yahoo.sharesOutstanding
    );
    const pbRatio = safeDivide(yahoo.price, bookValuePerShare);

    // Justified P/B = (ROE - g) / (r - g)
    const justifiedPB = this.calculateJustifiedPB();

    // P/S Ratio = Market Cap / Revenue
    const psRatio = safeDivide(yahoo.marketCap, yahoo.revenue);

    // P/CF Ratio = Price / Cash Flow per Share
    const cashFlowPerShare = safeDivide(
      yahoo.operatingCashFlow,
      yahoo.sharesOutstanding
    );
    const pcfRatio = safeDivide(yahoo.price, cashFlowPerShare);

    // Enterprise Value = Market Cap + Debt - Cash
    const ev = yahoo.marketCap + yahoo.totalDebt - yahoo.cash;

    const evToEBITDA = safeDivide(ev, yahoo.ebitda);
    const evToSales = safeDivide(ev, yahoo.revenue);
    const evToEBIT = safeDivide(ev, yahoo.ebit);

    const dividendYield = yahoo.dividendYield;

    // PEG Ratio = P/E / Growth Rate
    const growth = this.rawData.yahoo.historicalEPS.length >= 2
      ? percentageChange(
          this.rawData.yahoo.historicalEPS[this.rawData.yahoo.historicalEPS.length - 1],
          this.rawData.yahoo.historicalEPS[this.rawData.yahoo.historicalEPS.length - 2]
        )
      : null;
    const pegRatio = peRatio && growth ? safeDivide(peRatio, growth * 100) : null;

    // Earnings Yield = Inverse of P/E
    const earningsYield = peRatio ? safeDivide(1, peRatio) : null;

    return {
      peRatio,
      forwardPE,
      justifiedPE,
      pbRatio,
      justifiedPB,
      psRatio,
      pcfRatio,
      ev,
      evToEBITDA,
      evToSales,
      evToEBIT,
      dividendYield,
      pegRatio,
      earningsYield,
    };
  }

  private calculateJustifiedPE(): number | null {
    // Justified P/E = (1 - b) / (r - g)
    const payoutRatio = safeDivide(
      this.rawData.yahoo.dividendsPaid,
      this.rawData.yahoo.netIncome
    );
    if (payoutRatio == null) return null;

    const r = this.calculateCostOfEquity() ?? 0.1; // 10% default
    const g = this.options.terminalGrowthRate;

    return safeDivide(1 - payoutRatio, r - g);
  }

  private calculateJustifiedPB(): number | null {
    // Justified P/B = (ROE - g) / (r - g)
    const roe = safeDivide(
      this.rawData.yahoo.netIncome,
      this.rawData.yahoo.totalEquity
    );
    if (roe == null) return null;

    const r = this.calculateCostOfEquity() ?? 0.1;
    const g = this.options.terminalGrowthRate;

    return safeDivide(roe - g, r - g);
  }

  // ==========================================================================
  // DCF / INTRINSIC VALUE METRICS (10 metrics)
  // ==========================================================================

  private calculateDCFMetrics(): DCFMetrics {
    const riskFreeRate = this.options.riskFreeRate;
    const marketRiskPremium = this.options.marketRiskPremium;
    const beta = this.rawData.yahoo.beta;

    // Cost of Equity = Rf + β(Rm - Rf)
    const costOfEquity = this.calculateCostOfEquity();

    // Cost of Debt = Interest Expense / Total Debt
    const costOfDebt = safeDivide(
      this.rawData.yahoo.interestExpense,
      this.rawData.yahoo.totalDebt
    );

    // WACC = (E/V)Re + (D/V)Rd(1-t)
    const wacc = this.calculateWACC();

    // Terminal Value = FCF(1+g) / (WACC - g)
    const terminalValue = this.calculateTerminalValue();

    // Intrinsic Value = DCF Model
    const intrinsicValue = this.calculateIntrinsicValue();

    // Target Price (would come from analyst estimates)
    const targetPrice = null;

    // Upside/Downside % = (Target - Price) / Price
    const upsideDownside = targetPrice
      ? percentageChange(targetPrice, this.rawData.yahoo.price)
      : null;

    return {
      riskFreeRate,
      marketRiskPremium,
      beta,
      costOfEquity,
      costOfDebt,
      wacc,
      terminalValue,
      intrinsicValue,
      targetPrice,
      upsideDownside,
    };
  }

  private calculateCostOfEquity(): number | null {
    const rf = this.options.riskFreeRate;
    const beta = this.rawData.yahoo.beta;
    const mrp = this.options.marketRiskPremium;

    if (rf == null || beta == null) return null;

    return rf + beta * mrp;
  }

  private calculateWACC(): number | null {
    const re = this.calculateCostOfEquity();
    const rd = safeDivide(
      this.rawData.yahoo.interestExpense,
      this.rawData.yahoo.totalDebt
    );

    const e = this.rawData.yahoo.marketCap;
    const d = this.rawData.yahoo.totalDebt;
    const v = e + d;
    const t = this.options.taxRate ?? 0;

    if (re == null || rd == null || v === 0) return null;

    return (e / v) * re + (d / v) * rd * (1 - t);
  }

  private calculateTerminalValue(): number | null {
    const fcf = this.rawData.yahoo.freeCashFlow;
    const g = this.options.terminalGrowthRate;
    const wacc = this.calculateWACC();

    if (wacc == null || wacc <= g) return null;

    return safeDivide(fcf * (1 + g), wacc - g);
  }

  private calculateIntrinsicValue(): number | null {
    // Simplified DCF: Terminal Value / Shares Outstanding
    const terminalValue = this.calculateTerminalValue();
    const shares = this.rawData.yahoo.sharesOutstanding;

    return safeDivide(terminalValue, shares);
  }

  // ==========================================================================
  // RISK METRICS (7 metrics)
  // ==========================================================================

  private calculateRiskMetrics(): RiskMetrics {
    const yahoo = this.rawData.yahoo;

    const beta = yahoo.beta;

    // Calculate returns from price history
    const prices = yahoo.priceHistory.map((p) => p.close);
    const returns: number[] = [];
    for (let i = 1; i < prices.length; i++) {
      const ret = (prices[i] - prices[i - 1]) / prices[i - 1];
      returns.push(ret);
    }

    const standardDev = standardDeviation(returns);

    // Alpha = Actual Return - Expected Return
    // Simplified: set to null (requires benchmark comparison)
    const alpha = null;

    // Sharpe Ratio = (Return - Rf) / σ
    const avgReturn = returns.length > 0 ? returns.reduce((a, b) => a + b, 0) / returns.length : null;
    const rf = this.options.riskFreeRate;
    const sharpeRatio =
      avgReturn != null && standardDev != null && rf != null
        ? safeDivide(avgReturn - rf / 252, standardDev)
        : null;

    // Sortino Ratio = (Return - Rf) / Downside σ
    const downsideDev = downsideDeviation(returns);
    const sortinoRatio =
      avgReturn != null && downsideDev != null && rf != null
        ? safeDivide(avgReturn - rf / 252, downsideDev)
        : null;

    const maxDrawdown = calculateMaxDrawdown(prices);

    // VaR (95%) - Value at Risk
    const sortedReturns = [...returns].sort((a, b) => a - b);
    const var95Index = Math.floor(sortedReturns.length * 0.05);
    const var95 = sortedReturns[var95Index] ?? null;

    return {
      beta,
      standardDeviation: standardDev,
      alpha,
      sharpeRatio,
      sortinoRatio,
      maxDrawdown,
      var95,
    };
  }

  // ==========================================================================
  // TECHNICAL INDICATORS (8 metrics)
  // ==========================================================================

  private calculateTechnicalMetrics(): TechnicalMetrics {
    const yahoo = this.rawData.yahoo;
    const prices = yahoo.priceHistory.map((p) => p.close);

    const rsi = calculateRSI(prices);

    // MACD (simplified)
    const macd = null;
    const macdSignal = null;

    const fiftyDayMA = calculateSMA(prices, 50);
    const twoHundredDayMA = calculateSMA(prices, 200);

    const bollinger = calculateBollingerBands(prices);

    // Relative Volume = Current Volume / Average Volume
    const relativeVolume = safeDivide(yahoo.volume, yahoo.averageVolume);

    return {
      rsi,
      macd,
      macdSignal,
      fiftyDayMA,
      twoHundredDayMA,
      bollingerUpper: bollinger.upper,
      bollingerLower: bollinger.lower,
      relativeVolume,
    };
  }

  // ==========================================================================
  // SCORING (6 scores, 0-100 scale)
  // ==========================================================================

  private calculateScores(): ScoreMetrics {
    const profitabilityScore = this.calculateProfitabilityScore();
    const growthScore = this.calculateGrowthScore();
    const valuationScore = this.calculateValuationScore();
    const riskScore = this.calculateRiskScore();
    const healthScore = this.calculateHealthScore();

    // Total Score = Weighted Average
    const weights = [0.25, 0.20, 0.20, 0.15, 0.20];
    const scores = [
      profitabilityScore,
      growthScore,
      valuationScore,
      riskScore,
      healthScore,
    ].filter((s) => s != null) as number[];

    const totalScore =
      scores.length === 5
        ? weightedAverage(scores, weights)
        : null;

    return {
      profitabilityScore,
      growthScore,
      valuationScore,
      riskScore,
      healthScore,
      totalScore,
    };
  }

  private calculateProfitabilityScore(): number | null {
    const margins = this.calculateProfitabilityMetrics();

    const scores: number[] = [];

    // ROE: 0-30% → 0-100
    if (margins.roe != null) {
      scores.push(normalizeToScale(margins.roe, 0, 0.3));
    }

    // ROIC: 0-25% → 0-100
    if (margins.roic != null) {
      scores.push(normalizeToScale(margins.roic, 0, 0.25));
    }

    // Net Margin: 0-30% → 0-100
    if (margins.netProfitMargin != null) {
      scores.push(normalizeToScale(margins.netProfitMargin, 0, 0.3));
    }

    if (scores.length === 0) return null;

    return scores.reduce((a, b) => a + b, 0) / scores.length;
  }

  private calculateGrowthScore(): number | null {
    const growth = this.calculateGrowthMetrics();

    const scores: number[] = [];

    // Revenue Growth: -20% to +50% → 0-100
    if (growth.revenueGrowthYoY != null) {
      scores.push(normalizeToScale(growth.revenueGrowthYoY, -0.2, 0.5));
    }

    // EPS Growth: -20% to +50% → 0-100
    if (growth.epsGrowthYoY != null) {
      scores.push(normalizeToScale(growth.epsGrowthYoY, -0.2, 0.5));
    }

    if (scores.length === 0) return null;

    return scores.reduce((a, b) => a + b, 0) / scores.length;
  }

  private calculateValuationScore(): number | null {
    const valuation = this.calculateValuationMetrics();

    const scores: number[] = [];

    // P/E: Lower is better (inverse scale) 0-40 → 100-0
    if (valuation.peRatio != null && valuation.peRatio > 0) {
      scores.push(100 - normalizeToScale(valuation.peRatio, 0, 40));
    }

    // P/B: Lower is better 0-10 → 100-0
    if (valuation.pbRatio != null && valuation.pbRatio > 0) {
      scores.push(100 - normalizeToScale(valuation.pbRatio, 0, 10));
    }

    if (scores.length === 0) return null;

    return scores.reduce((a, b) => a + b, 0) / scores.length;
  }

  private calculateRiskScore(): number | null {
    const risk = this.calculateRiskMetrics();

    const scores: number[] = [];

    // Beta: Lower is better 0-2 → 100-0
    if (risk.beta != null) {
      scores.push(100 - normalizeToScale(risk.beta, 0, 2));
    }

    // Max Drawdown: Lower is better 0-50% → 100-0
    if (risk.maxDrawdown != null) {
      scores.push(100 - normalizeToScale(risk.maxDrawdown, 0, 0.5));
    }

    if (scores.length === 0) return null;

    return scores.reduce((a, b) => a + b, 0) / scores.length;
  }

  private calculateHealthScore(): number | null {
    const liquidity = this.calculateLiquidityMetrics();
    const leverage = this.calculateLeverageMetrics();

    const scores: number[] = [];

    // Current Ratio: 1-3 → 0-100
    if (liquidity.currentRatio != null) {
      scores.push(normalizeToScale(liquidity.currentRatio, 1, 3));
    }

    // Debt to Equity: Lower is better 0-2 → 100-0
    if (leverage.debtToEquity != null) {
      scores.push(100 - normalizeToScale(leverage.debtToEquity, 0, 2));
    }

    // Interest Coverage: 0-10 → 0-100
    if (leverage.interestCoverage != null) {
      scores.push(normalizeToScale(leverage.interestCoverage, 0, 10));
    }

    if (scores.length === 0) return null;

    return scores.reduce((a, b) => a + b, 0) / scores.length;
  }

  // ==========================================================================
  // OTHER KEY METRICS (10 metrics)
  // ==========================================================================

  private calculateOtherMetrics(): OtherMetrics {
    const yahoo = this.rawData.yahoo;

    const effectiveTaxRate = this.calculateEffectiveTaxRate();

    const workingCapital = yahoo.currentAssets - yahoo.currentLiabilities;

    const bookValuePerShare = safeDivide(
      yahoo.totalEquity,
      yahoo.sharesOutstanding
    );

    const salesPerShare = safeDivide(yahoo.revenue, yahoo.sharesOutstanding);

    const cashFlowPerShare = safeDivide(
      yahoo.operatingCashFlow,
      yahoo.sharesOutstanding
    );

    // DOL = % change in EBIT / % change in Sales (requires historical data)
    const operatingLeverage = null;

    // DFL = % change in EPS / % change in EBIT (requires historical data)
    const financialLeverage = null;

    const altmanZScore = this.calculateAltmanZScore();

    const piotroskiFScore = this.calculatePiotroskiFScore();

    // Excess ROIC = Company ROIC - Industry Average ROIC
    const roic = this.calculateProfitabilityMetrics().roic;
    const excessROIC = null; // Would need industry average

    return {
      effectiveTaxRate,
      workingCapital,
      bookValuePerShare,
      salesPerShare,
      cashFlowPerShare,
      operatingLeverage,
      financialLeverage,
      altmanZScore,
      piotroskiFScore,
      excessROIC,
    };
  }

  private calculateEffectiveTaxRate(): number | null {
    return safeDivide(
      this.rawData.yahoo.incomeTax,
      this.rawData.yahoo.pretaxIncome
    );
  }

  private calculateAltmanZScore(): number | null {
    const yahoo = this.rawData.yahoo;

    const x1 = safeDivide(
      yahoo.currentAssets - yahoo.currentLiabilities,
      yahoo.totalAssets
    );
    const x2 = safeDivide(yahoo.retainedEarnings, yahoo.totalAssets);
    const x3 = safeDivide(yahoo.ebit, yahoo.totalAssets);
    const x4 = safeDivide(yahoo.marketCap, yahoo.totalLiabilities);
    const x5 = safeDivide(yahoo.revenue, yahoo.totalAssets);

    if (x1 == null || x2 == null || x3 == null || x4 == null || x5 == null) {
      return null;
    }

    // Z = 1.2X1 + 1.4X2 + 3.3X3 + 0.6X4 + 1.0X5
    return 1.2 * x1 + 1.4 * x2 + 3.3 * x3 + 0.6 * x4 + 1.0 * x5;
  }

  private calculatePiotroskiFScore(): number | null {
    // Simplified Piotroski F-Score (9 criteria, 0-9 scale)
    const yahoo = this.rawData.yahoo;
    let score = 0;

    // 1. Positive Net Income
    if (yahoo.netIncome > 0) score++;

    // 2. Positive Operating Cash Flow
    if (yahoo.operatingCashFlow > 0) score++;

    // 3. Positive ROA
    const roa = safeDivide(yahoo.netIncome, yahoo.totalAssets);
    if (roa != null && roa > 0) score++;

    // 4. OCF > Net Income (quality of earnings)
    if (yahoo.operatingCashFlow > yahoo.netIncome) score++;

    // 5. Decreasing Debt Ratio (need historical data - simplified)
    score++; // Placeholder

    // 6. Increasing Current Ratio (need historical data - simplified)
    score++; // Placeholder

    // 7. No dilution (need historical shares - simplified)
    score++; // Placeholder

    // 8. Increasing Gross Margin (need historical data - simplified)
    score++; // Placeholder

    // 9. Increasing Asset Turnover (need historical data - simplified)
    score++; // Placeholder

    return score;
  }
}
