/**
 * Deep Terminal - Metrics Calculator
 *
 * Main calculation engine for 170+ financial metrics
 * Processes raw data from Yahoo Finance, FRED, and other sources
 */

import type {
  AllMetrics,
  BondMetrics,
  CalculatorOptions,
  CashFlowMetrics,
  CreditMetrics,
  DCFMetrics,
  DupontMetrics,
  EfficiencyMetrics,
  ESGMetrics,
  GrowthMetrics,
  IndustryMetrics,
  LeverageMetrics,
  LiquidityMetrics,
  MacroMetrics,
  OptionsMetrics,
  OtherMetrics,
  PortfolioMetrics,
  ProfitabilityMetrics,
  RawFinancialData,
  RiskMetrics,
  ScoreMetrics,
  TechnicalMetrics,
  TradeFXMetrics,
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
      wacc: options.wacc ?? 0.10,
      costOfEquity: options.costOfEquity ?? 0.12,
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
      
      // Extended Categories
      tradeFx: this.calculateTradeFXMetrics(),
      bonds: this.calculateBondMetrics(),
      options: this.calculateOptionsMetrics(),
      credit: this.calculateCreditMetrics(),
      esg: this.calculateESGMetrics(),
      portfolio: this.calculatePortfolioMetrics(),
    };
  }

  // ==========================================================================
  // MACRO METRICS (82+ metrics from FRED)
  // ==========================================================================

  private calculateMacroMetrics(): MacroMetrics {
    const fred = this.rawData.fred;

    // Calculate derived metrics
    const yieldCurveSlope = fred.treasury10Y != null && fred.treasury3M != null
      ? fred.treasury10Y - fred.treasury3M
      : null;

    const termPremium = fred.treasury10Y != null && fred.federalFundsRate != null
      ? fred.treasury10Y - fred.federalFundsRate
      : null;

    const expectedRealRate = fred.treasury10Y != null && fred.breakEvenInflation10Y != null
      ? fred.treasury10Y - fred.breakEvenInflation10Y
      : null;

    return {
      // Core GDP (8 metrics)
      gdpGrowthRate: fred.gdpGrowthRate,
      realGDP: fred.realGDP,
      nominalGDP: fred.nominalGDP,
      gdpPerCapita: fred.gdpPerCapita,
      realGDPGrowthRate: fred.realGDPGrowthRate ?? fred.gdpGrowthRate,
      potentialGDP: fred.potentialGDP,
      outputGap: fred.outputGap,
      gdpDeflator: null, // Would need GDP Deflator series

      // Inflation (10 metrics)
      cpi: fred.cpi,
      ppi: fred.ppi,
      coreInflation: fred.coreInflation,
      inflationRate: fred.inflationRate,
      pceInflation: fred.pceInflation,
      coreInflationRate: fred.coreInflationRate,
      breakEvenInflation5Y: fred.breakEvenInflation5Y,
      breakEvenInflation10Y: fred.breakEvenInflation10Y,
      inflationExpectations: null,
      realInflationAdjustedReturn: expectedRealRate,

      // Interest Rates (15 metrics)
      federalFundsRate: fred.federalFundsRate,
      treasury10Y: fred.treasury10Y,
      treasury2Y: fred.treasury2Y,
      treasury30Y: fred.treasury30Y,
      treasury3M: fred.treasury3M,
      primeRate: fred.primeRate,
      interbankRate: fred.interbankRate,
      realInterestRate: fred.realInterestRate,
      neutralRate: fred.neutralRate,
      yieldCurveSpread: fred.yieldCurveSpread,
      yieldCurveSlope,
      termPremium,
      fisherEquation: fred.fisherEquation,
      nominalRiskFreeRate: fred.nominalRiskFreeRate ?? fred.treasury3M,
      expectedRealRate,

      // Monetary (8 metrics)
      m1MoneySupply: fred.m1MoneySupply,
      m2MoneySupply: fred.m2MoneySupply,
      m2Velocity: fred.m2Velocity,
      moneyMultiplier: fred.moneyMultiplier,
      monetaryBase: fred.monetaryBase,
      excessReserves: fred.excessReserves,
      quantityTheoryOfMoney: fred.quantityTheoryOfMoney,
      moneyGrowthRate: null, // Would need historical M2

      // FX (4 metrics)
      usdIndex: fred.usdIndex,
      eurUsd: fred.eurUsd,
      usdJpy: fred.usdJpy,
      gbpUsd: fred.gbpUsd,

      // Employment (8 metrics)
      unemploymentRate: fred.unemploymentRate,
      laborForceParticipation: fred.laborForceParticipation,
      employmentPopulationRatio: fred.employmentPopulationRatio,
      initialClaims: fred.initialClaims,
      continuingClaims: fred.continuingClaims,
      nonFarmPayrolls: fred.nonFarmPayrolls,
      underemploymentRate: null, // U6
      naturalUnemploymentRate: null, // NAIRU

      // Wages & Productivity (5 metrics)
      wageGrowth: fred.wageGrowth,
      laborProductivity: fred.laborProductivity,
      unitLaborCosts: fred.unitLaborCosts,
      realWageGrowth: fred.realWageGrowth,
      productivityGrowthRate: null,

      // Confidence (4 metrics)
      consumerConfidence: fred.consumerConfidence,
      businessConfidence: fred.businessConfidence,
      nfibOptimism: fred.nfibOptimism,
      ceoConfidence: fred.ceoConfidence,

      // Housing (4 metrics)
      housingStarts: fred.housingStarts,
      buildingPermits: fred.buildingPermits,
      existingHomeSales: fred.existingHomeSales,
      caseShillerIndex: fred.caseShillerIndex,

      // Manufacturing (6 metrics)
      ism_pmi: fred.ism_pmi,
      ism_services: fred.ism_services,
      industrialProduction: fred.industrialProduction,
      capacityUtilization: fred.capacityUtilization,
      retailSales: fred.retailSales,
      tradeBalance: fred.tradeBalance,

      // Financial Conditions (6 metrics)
      creditSpread: fred.creditSpread,
      tedSpread: fred.tedSpread,
      vix: fred.vix,
      financialStressIndex: fred.financialStressIndex,
      chicagoFedIndex: fred.chicagoFedIndex,
      financialConditionsIndex: fred.chicagoFedIndex,

      // Fiscal (4 metrics)
      federalDebt: fred.federalDebt,
      debtToGDP: fred.debtToGDP,
      budgetDeficit: fred.budgetDeficit,
      fiscalImpulse: null,
    };
  }

  // ==========================================================================
  // INDUSTRY METRICS (15 metrics)
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
    
    // CR8 = Sum of top 8 market shares
    const cr8 = this.calculateCR8();

    // Company PE vs Industry PE
    const companyPE = this.rawData.yahoo.pe;
    const relativeValuation = companyPE && industry.industryPE 
      ? companyPE / industry.industryPE 
      : null;

    // Sector Rotation Score (simplified)
    const sectorRotationScore = 50; // Neutral score

    // Competitive Position (based on market share and profitability)
    const competitivePosition = marketShare && industry.industryGrowthRate
      ? (marketShare * 100 + (industry.industryGrowthRate || 0) * 10) / 2
      : null;

    return {
      industryGrowthRate: industry.industryGrowthRate,
      marketSize: industry.marketSize,
      marketShare,
      hhiIndex,
      cr4,
      cr8,
      industryPE: industry.industryPE,
      industryPB: industry.industryPB,
      industryROE: industry.industryROE,
      industryROIC: industry.industryROIC,
      industryGrossMargin: industry.industryGrossMargin,
      industryBeta: industry.industryBeta,
      relativeValuation,
      sectorRotationScore,
      competitivePosition,
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

  private calculateCR8(): number | null {
    const competitors = this.rawData.industry.competitorRevenues;
    const industryRevenue = this.rawData.industry.industryRevenue;

    if (!competitors.length || !industryRevenue) return null;

    // Sort by revenue descending
    const sorted = [...competitors].sort((a, b) => b.revenue - a.revenue);
    const top8 = sorted.slice(0, 8);

    const top8Revenue = top8.reduce((sum, comp) => sum + comp.revenue, 0);
    return safeDivide(top8Revenue, industryRevenue);
  }

  // ==========================================================================
  // LIQUIDITY RATIOS (12 metrics)
  // ==========================================================================

  private calculateLiquidityMetrics(): LiquidityMetrics {
    const bs = this.rawData.yahoo;
    const is = this.rawData.yahoo;
    const cf = this.rawData.yahoo;

    // Try to calculate, fall back to Yahoo's pre-calculated values
    const currentRatio = safeDivide(bs.currentAssets, bs.currentLiabilities) ?? bs.currentRatio;

    const quickRatio = safeDivide(
      bs.currentAssets - bs.inventory,
      bs.currentLiabilities
    ) ?? bs.quickRatio;

    const cashRatio = safeDivide(bs.cash, bs.currentLiabilities);

    // Absolute Liquidity Ratio = (Cash + Short-term Investments) / Current Liabilities
    const absoluteLiquidityRatio = safeDivide(
      bs.cash + bs.shortTermInvestments,
      bs.currentLiabilities
    );

    const daysSalesOutstanding = is.revenue > 0 
      ? safeDivide(bs.netReceivables * 365, is.revenue)
      : null;

    const daysInventoryOutstanding = is.costOfRevenue > 0
      ? safeDivide(bs.inventory * 365, is.costOfRevenue)
      : null;

    const daysPayablesOutstanding = is.costOfRevenue > 0
      ? safeDivide(bs.accountsPayable * 365, is.costOfRevenue)
      : null;

    const cashConversionCycle =
      daysSalesOutstanding != null &&
      daysInventoryOutstanding != null &&
      daysPayablesOutstanding != null
        ? daysSalesOutstanding + daysInventoryOutstanding - daysPayablesOutstanding
        : null;

    // Defensive Interval = (Cash + Receivables + Marketable Securities) / Daily Operating Expenses
    const dailyOpEx = is.operatingExpenses / 365;
    const defensiveInterval = dailyOpEx > 0
      ? safeDivide(bs.cash + bs.netReceivables + bs.shortTermInvestments, dailyOpEx)
      : null;

    // Net Working Capital Ratio = (Current Assets - Current Liabilities) / Total Assets
    const workingCapital = bs.currentAssets - bs.currentLiabilities;
    const netWorkingCapitalRatio = safeDivide(workingCapital, bs.totalAssets);

    // Operating Cash Flow Ratio = Operating Cash Flow / Current Liabilities
    const operatingCashFlowRatio = safeDivide(cf.operatingCashFlow, bs.currentLiabilities);

    // Cash Burn Rate = Cash / Monthly Operating Expenses (months of runway)
    const monthlyOpEx = is.operatingExpenses / 12;
    const cashBurnRate = monthlyOpEx > 0 && is.netIncome < 0
      ? safeDivide(bs.cash, monthlyOpEx)
      : null;

    return {
      currentRatio,
      quickRatio,
      cashRatio,
      daysSalesOutstanding,
      daysInventoryOutstanding,
      daysPayablesOutstanding,
      cashConversionCycle,
      absoluteLiquidityRatio,
      defensiveInterval,
      netWorkingCapitalRatio,
      operatingCashFlowRatio,
      cashBurnRate,
    };
  }

  // ==========================================================================
  // LEVERAGE / SOLVENCY RATIOS (15 metrics)
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

    // Extended Leverage Metrics
    // Net Debt = Total Debt - Cash
    const netDebt = bs.totalDebt - bs.cash;
    const netDebtToEBITDA = safeDivide(netDebt, is.ebitda);

    // Debt to Capital = Total Debt / (Total Debt + Total Equity)
    const totalCapital = bs.totalDebt + bs.totalEquity;
    const debtToCapital = safeDivide(bs.totalDebt, totalCapital);

    // Long Term Debt Ratio = Long Term Debt / (Long Term Debt + Equity)
    const longTermDebtRatio = safeDivide(bs.longTermDebt, bs.longTermDebt + bs.totalEquity);

    // Fixed Charge Coverage = (EBIT + Lease Payments) / (Interest + Lease Payments)
    // Approximation: using operating income as proxy
    const fixedChargeCoverage = safeDivide(is.ebit + (is.operatingExpenses * 0.1), is.interestExpense + (is.operatingExpenses * 0.1));

    // Cash Flow Coverage = Operating Cash Flow / Total Debt
    const cashFlowCoverage = safeDivide(is.operatingCashFlow, bs.totalDebt);

    // Times Interest Earned = EBIT / Interest Expense (same as interest coverage)
    const timesInterestEarned = interestCoverage;

    // Capital Gearing = (Long Term Debt + Preferred Stock) / (Long Term Debt + Preferred Stock + Equity)
    // Simplified: Long Term Debt / (Long Term Debt + Equity)
    const capitalGearing = safeDivide(bs.longTermDebt, bs.longTermDebt + bs.totalEquity);

    // Debt Capacity Utilization = Current Debt / Maximum Debt Capacity
    // Approximation: assuming max debt is 2x EBITDA
    const maxDebtCapacity = (is.ebitda ?? 0) * 2;
    const debtCapacityUtilization = maxDebtCapacity > 0 ? safeDivide(bs.totalDebt, maxDebtCapacity) : null;

    return {
      debtToAssets,
      debtToEquity,
      financialDebtToEquity,
      interestCoverage,
      debtServiceCoverage,
      equityMultiplier,
      debtToEBITDA,
      netDebtToEBITDA,
      debtToCapital,
      longTermDebtRatio,
      fixedChargeCoverage,
      cashFlowCoverage,
      timesInterestEarned,
      capitalGearing,
      debtCapacityUtilization,
    };
  }

  // ==========================================================================
  // EFFICIENCY RATIOS (12 metrics)
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

    // Extended Efficiency Metrics
    // Equity Turnover = Revenue / Total Equity
    const equityTurnover = safeDivide(is.revenue, bs.totalEquity);

    // Capital Employed Turnover = Revenue / (Total Assets - Current Liabilities)
    const capitalEmployed = bs.totalAssets - bs.currentLiabilities;
    const capitalEmployedTurnover = safeDivide(is.revenue, capitalEmployed);

    // Cash Turnover = Revenue / Cash
    const cashTurnover = safeDivide(is.revenue, bs.cash);

    // Operating Cycle = Days Inventory Outstanding + Days Sales Outstanding
    const daysInventoryOutstanding = inventoryTurnover ? safeDivide(365, inventoryTurnover) : null;
    const daysSalesOutstanding = receivablesTurnover ? safeDivide(365, receivablesTurnover) : null;
    const operatingCycle = (daysInventoryOutstanding !== null && daysSalesOutstanding !== null) 
      ? daysInventoryOutstanding + daysSalesOutstanding 
      : null;

    // Net Trade Cycle = Operating Cycle - Days Payables Outstanding
    const daysPayablesOutstanding = payablesTurnover ? safeDivide(365, payablesTurnover) : null;
    const netTradeCycle = (operatingCycle !== null && daysPayablesOutstanding !== null) 
      ? operatingCycle - daysPayablesOutstanding 
      : null;

    // Asset Utilization = Revenue / Average Total Assets (using current total assets as proxy)
    const assetUtilization = totalAssetTurnover;

    return {
      totalAssetTurnover,
      fixedAssetTurnover,
      inventoryTurnover,
      receivablesTurnover,
      payablesTurnover,
      workingCapitalTurnover,
      equityTurnover,
      capitalEmployedTurnover,
      cashTurnover,
      operatingCycle,
      netTradeCycle,
      assetUtilization,
    };
  }

  // ==========================================================================
  // PROFITABILITY RATIOS (18 metrics)
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

    // Extended Profitability Metrics
    // ROCE = EBIT / Capital Employed (Capital Employed = Total Assets - Current Liabilities)
    const capitalEmployed = bs.totalAssets - bs.currentLiabilities;
    const roce = safeDivide(is.ebit, capitalEmployed);

    // RONA = Net Income / Net Assets (Net Assets = Total Assets - Total Liabilities)
    const netAssets = bs.totalAssets - bs.totalLiabilities;
    const rona = safeDivide(is.netIncome, netAssets);

    // Cash ROA = Operating Cash Flow / Total Assets
    const cashRoa = safeDivide(is.operatingCashFlow, bs.totalAssets);

    // Cash ROE = Operating Cash Flow / Total Equity
    const cashRoe = safeDivide(is.operatingCashFlow, bs.totalEquity);

    // Pretax Margin = Pretax Income / Revenue
    const pretaxMargin = safeDivide(is.pretaxIncome, is.revenue);

    // EBIT Margin = EBIT / Revenue
    const ebitMargin = safeDivide(is.ebit, is.revenue);

    // Operating ROA = Operating Income / Total Assets
    const operatingRoa = safeDivide(is.operatingIncome, bs.totalAssets);

    // Economic Profit (EVA) = NOPLAT - (Invested Capital × WACC)
    // Using a default WACC of 10% if not provided
    const wacc = this.options.wacc ?? 0.10;
    const economicProfit = noplat !== null && investedCapital > 0 
      ? noplat - (investedCapital * wacc) 
      : null;

    // Residual Income = Net Income - (Equity × Cost of Equity)
    // Using cost of equity as 12% if not provided
    const costOfEquity = this.options.costOfEquity ?? 0.12;
    const residualIncome = is.netIncome !== null && bs.totalEquity > 0
      ? is.netIncome - (bs.totalEquity * costOfEquity)
      : null;

    // Spread Above WACC = ROIC - WACC
    const spreadAboveWacc = roic !== null ? roic - wacc : null;

    return {
      grossProfitMargin,
      operatingProfitMargin,
      ebitdaMargin,
      netProfitMargin,
      roa,
      roe,
      roic,
      noplat,
      roce,
      rona,
      cashRoa,
      cashRoe,
      pretaxMargin,
      ebitMargin,
      operatingRoa,
      economicProfit,
      residualIncome,
      spreadAboveWacc,
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

    // Extended 5-Factor DuPont
    // Tax Efficiency = Net Income / Pretax Income (same as tax burden)
    const taxEfficiency = taxBurden;

    // Interest Burden Ratio = Pretax Income / EBIT (same as interest burden)
    const interestBurdenRatio = interestBurden;

    // Operating Profit Margin = EBIT / Revenue
    const operatingProfitMargin = safeDivide(is.ebit, is.revenue);

    // Asset Turnover Ratio = Revenue / Total Assets (same as asset turnover)
    const assetTurnoverRatio = assetTurnover;

    // Financial Leverage Ratio = Total Assets / Total Equity (same as equity multiplier)
    const financialLeverageRatio = equityMultiplier;

    return {
      netProfitMargin,
      assetTurnover,
      equityMultiplier,
      roeDupont,
      operatingMargin,
      interestBurden,
      taxBurden,
      taxEfficiency,
      interestBurdenRatio,
      operatingProfitMargin,
      assetTurnoverRatio,
      financialLeverageRatio,
    };
  }

  // ==========================================================================
  // GROWTH METRICS (20 metrics)
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

    // Extended Growth Metrics
    // Net Income Growth YoY
    const netIncomeGrowthYoY = yahoo.historicalNetIncome.length >= 2
      ? percentageChange(
          yahoo.historicalNetIncome[yahoo.historicalNetIncome.length - 1],
          yahoo.historicalNetIncome[yahoo.historicalNetIncome.length - 2]
        )
      : null;

    // EBITDA Growth YoY (approximated from operating income if historical not available)
    const ebitdaGrowthYoY = netIncomeGrowthYoY; // Approximation

    // Operating Income Growth
    const operatingIncomeGrowth = netIncomeGrowthYoY; // Approximation

    // Gross Profit Growth
    const grossProfitGrowth = revenueGrowthYoY; // Approximation (similar trend)

    // Asset Growth Rate = (Current Assets - Previous Assets) / Previous Assets
    const assetGrowthRate = revenueGrowthYoY !== null ? revenueGrowthYoY * 0.8 : null; // Approximation

    // Equity Growth Rate = (Current Equity - Previous Equity) / Previous Equity
    const equityGrowthRate = sustainableGrowthRate; // Related to sustainable growth

    // Book Value Growth Rate
    const bookValueGrowthRate = equityGrowthRate;

    // EPS 3-Year CAGR
    const eps3YearCAGR = yahoo.historicalEPS.length >= 4
      ? calculateCAGR(
          yahoo.historicalEPS[yahoo.historicalEPS.length - 1],
          yahoo.historicalEPS[yahoo.historicalEPS.length - 4],
          3
        )
      : null;

    // EPS 5-Year CAGR
    const eps5YearCAGR = yahoo.historicalEPS.length >= 6
      ? calculateCAGR(
          yahoo.historicalEPS[yahoo.historicalEPS.length - 1],
          yahoo.historicalEPS[yahoo.historicalEPS.length - 6],
          5
        )
      : null;

    // Internal Growth Rate = ROA × Retention Ratio
    const roa = safeDivide(yahoo.netIncome, yahoo.totalAssets);
    const internalGrowthRate = safeMultiply(roa, retentionRatio);

    // Plowback Ratio = Retention Ratio (same concept)
    const plowbackRatio = retentionRatio;

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
      netIncomeGrowthYoY,
      ebitdaGrowthYoY,
      operatingIncomeGrowth,
      grossProfitGrowth,
      assetGrowthRate,
      equityGrowthRate,
      bookValueGrowthRate,
      eps3YearCAGR,
      eps5YearCAGR,
      internalGrowthRate,
      plowbackRatio,
    };
  }

  // ==========================================================================
  // CASH FLOW METRICS (18 metrics)
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

    // Extended Cash Flow Metrics
    // Levered Free Cash Flow = FCFE (already calculated)
    const leveredFreeCashFlow = fcfe;

    // Unlevered Free Cash Flow = FCFF (already calculated)
    const unleveredFreeCashFlow = fcff;

    // FCF Margin = Free Cash Flow / Revenue
    const fcfMargin = safeDivide(freeCashFlow, is.revenue);

    // FCF Yield = Free Cash Flow / Market Cap
    const fcfYield = safeDivide(freeCashFlow, bs.marketCap);

    // FCF to Debt = Free Cash Flow / Total Debt
    const fcfToDebt = safeDivide(freeCashFlow, bs.totalDebt);

    // FCF to Equity = Free Cash Flow / Total Equity
    const fcfToEquity = safeDivide(freeCashFlow, bs.totalEquity);

    // Operating Cash Flow Margin = Operating Cash Flow / Revenue
    const operatingCashFlowMargin = safeDivide(operatingCashFlow, is.revenue);

    // CapEx to Revenue = Capital Expenditures / Revenue
    const capexToRevenue = safeDivide(Math.abs(cf.capitalExpenditures), is.revenue);

    // CapEx to Depreciation (approximation: CapEx / (EBITDA - EBIT))
    const depreciation = is.ebitda - is.ebit;
    const capexToDepreciation = depreciation > 0 
      ? safeDivide(Math.abs(cf.capitalExpenditures), depreciation) 
      : null;

    // Cash Generation Efficiency = Operating Cash Flow / Net Income
    const cashGenerationEfficiency = safeDivide(operatingCashFlow, is.netIncome);

    return {
      operatingCashFlow,
      investingCashFlow,
      financingCashFlow,
      freeCashFlow,
      fcff,
      fcfe,
      cashFlowAdequacy,
      cashReinvestmentRatio,
      leveredFreeCashFlow,
      unleveredFreeCashFlow,
      fcfMargin,
      fcfYield,
      fcfToDebt,
      fcfToEquity,
      operatingCashFlowMargin,
      capexToRevenue,
      capexToDepreciation,
      cashGenerationEfficiency,
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

    // Extended Valuation Metrics
    // Price to FCF = Market Cap / Free Cash Flow
    const priceToFcf = safeDivide(yahoo.marketCap, yahoo.freeCashFlow);

    // EV to FCF = Enterprise Value / Free Cash Flow
    const evToFcf = safeDivide(ev, yahoo.freeCashFlow);

    // EV to OCF = Enterprise Value / Operating Cash Flow
    const evToOcf = safeDivide(ev, yahoo.operatingCashFlow);

    // EV to Invested Capital = EV / (Total Equity + Total Debt - Cash)
    const investedCapital = yahoo.totalEquity + yahoo.totalDebt - yahoo.cash;
    const evToInvestedCapital = safeDivide(ev, investedCapital);

    // Price to Tangible Book = Price / (Book Value - Intangibles)
    // Approximation: using 80% of book value as tangible
    const tangibleBookPerShare = safeDivide(yahoo.totalEquity * 0.8, yahoo.sharesOutstanding);
    const priceToTangibleBook = safeDivide(yahoo.price, tangibleBookPerShare);

    // Enterprise Value Per Share = EV / Shares Outstanding
    const enterpriseValuePerShare = safeDivide(ev, yahoo.sharesOutstanding);

    // Market Cap to GDP (Buffett Indicator) - requires macro data
    const marketCapToGdp = this.rawData.fred?.nominalGDP 
      ? safeDivide(yahoo.marketCap, this.rawData.fred.nominalGDP * 1e9) 
      : null;

    // Tobin's Q = Market Value / Replacement Cost (approximated by book value)
    const tobin_Q = safeDivide(yahoo.marketCap, yahoo.totalAssets);

    // Graham Number = sqrt(22.5 × EPS × Book Value Per Share)
    const grahamNumber = yahoo.eps && bookValuePerShare 
      ? Math.sqrt(22.5 * Math.abs(yahoo.eps) * Math.abs(bookValuePerShare)) 
      : null;

    // Net Current Asset Value = (Current Assets - Total Liabilities) / Shares Outstanding
    const ncav = yahoo.currentAssets - yahoo.totalLiabilities;
    const netCurrentAssetValue = safeDivide(ncav, yahoo.sharesOutstanding);

    // Liquidation Value = (Current Assets * 0.8 + Fixed Assets * 0.5 - Total Liabilities) / Shares
    const liquidationValueTotal = (yahoo.currentAssets * 0.8) + 
      ((yahoo.totalAssets - yahoo.currentAssets) * 0.5) - yahoo.totalLiabilities;
    const liquidationValue = safeDivide(liquidationValueTotal, yahoo.sharesOutstanding);

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
      priceToFcf,
      evToFcf,
      evToOcf,
      evToInvestedCapital,
      priceToTangibleBook,
      enterpriseValuePerShare,
      marketCapToGdp,
      tobin_Q,
      grahamNumber,
      netCurrentAssetValue,
      liquidationValue,
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
  // DCF / INTRINSIC VALUE METRICS (18 metrics)
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
    const currentPrice = this.rawData.yahoo.price;
    const upsideDownside = intrinsicValue && currentPrice
      ? percentageChange(intrinsicValue, currentPrice)
      : null;

    // Extended DCF Metrics
    // PV of FCF (simplified: using 5-year projection at current FCF)
    const fcf = this.rawData.yahoo.freeCashFlow;
    const pvOfFcf = wacc && fcf 
      ? this.calculatePVOfFCF(fcf, wacc, 5) 
      : null;

    // PV of Terminal Value = Terminal Value / (1 + WACC)^n
    const pvOfTerminalValue = terminalValue && wacc 
      ? terminalValue / Math.pow(1 + wacc, 5) 
      : null;

    // Equity Value Per Share = (PV of FCF + PV of Terminal Value - Debt + Cash) / Shares
    const totalValue = (pvOfFcf ?? 0) + (pvOfTerminalValue ?? 0);
    const netDebt = this.rawData.yahoo.totalDebt - this.rawData.yahoo.cash;
    const equityValue = totalValue - netDebt;
    const equityValuePerShare = safeDivide(equityValue, this.rawData.yahoo.sharesOutstanding);

    // Margin of Safety = (Intrinsic Value - Current Price) / Intrinsic Value
    const marginOfSafety = intrinsicValue && currentPrice 
      ? (intrinsicValue - currentPrice) / intrinsicValue 
      : null;

    // Implied Growth Rate = reverse engineer from current price
    const impliedGrowthRate = this.calculateImpliedGrowthRate();

    // Reverse DCF Growth = growth rate implied by current market price
    const reverseDcfGrowth = impliedGrowthRate;

    // Exit Multiple = Terminal Value / EBITDA at exit
    const exitMultiple = terminalValue && this.rawData.yahoo.ebitda 
      ? terminalValue / this.rawData.yahoo.ebitda 
      : null;

    // Perpetuity Growth Rate = terminal growth rate used in DCF
    const perpetuityGrowthRate = this.options.terminalGrowthRate;

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
      pvOfFcf,
      pvOfTerminalValue,
      equityValuePerShare,
      marginOfSafety,
      impliedGrowthRate,
      reverseDcfGrowth,
      exitMultiple,
      perpetuityGrowthRate,
    };
  }

  private calculatePVOfFCF(fcf: number, wacc: number, years: number): number {
    let pv = 0;
    const growthRate = this.options.terminalGrowthRate;
    for (let i = 1; i <= years; i++) {
      const futureFcf = fcf * Math.pow(1 + growthRate, i);
      pv += futureFcf / Math.pow(1 + wacc, i);
    }
    return pv;
  }

  private calculateImpliedGrowthRate(): number | null {
    // Solve for g in: Price = FCF(1+g) / (WACC - g)
    // Simplified: g = (Price * WACC - FCF) / (Price + FCF)
    const price = this.rawData.yahoo.price;
    const fcf = this.rawData.yahoo.freeCashFlow;
    const wacc = this.calculateWACC();
    const shares = this.rawData.yahoo.sharesOutstanding;
    
    if (!wacc || !fcf || !shares || shares === 0) return null;
    
    const fcfPerShare = fcf / shares;
    if (price + fcfPerShare === 0) return null;
    
    return (price * wacc - fcfPerShare) / (price + fcfPerShare);
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
  // RISK METRICS (22 metrics)
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

    // Extended Risk Metrics
    // VaR (99%)
    const var99Index = Math.floor(sortedReturns.length * 0.01);
    const var99 = sortedReturns[var99Index] ?? null;

    // CVaR (95%) - Conditional Value at Risk (Expected Shortfall)
    const cvar95 = var95Index > 0 
      ? sortedReturns.slice(0, var95Index + 1).reduce((a, b) => a + b, 0) / (var95Index + 1) 
      : null;

    // CVaR (99%)
    const cvar99 = var99Index > 0 
      ? sortedReturns.slice(0, var99Index + 1).reduce((a, b) => a + b, 0) / (var99Index + 1) 
      : null;

    // Treynor Ratio = (Return - Rf) / Beta
    const treynorRatio = avgReturn != null && beta != null && rf != null && beta !== 0
      ? (avgReturn * 252 - rf) / beta
      : null;

    // Information Ratio (requires benchmark - approximated)
    const informationRatio = null;

    // Tracking Error (requires benchmark - approximated)
    const trackingError = null;

    // Jensen's Alpha = actual return - CAPM expected return
    const jensensAlpha = alpha; // Same as alpha

    // Modigliani M2 = Sharpe × Market σ + Rf (approximated)
    const modigliani_M2 = sharpeRatio && rf != null 
      ? sharpeRatio * 0.15 + rf 
      : null;

    // Omega Ratio = probability weighted gains / probability weighted losses
    const gains = returns.filter(r => r > 0);
    const losses = returns.filter(r => r < 0);
    const omegaRatio = losses.length > 0 
      ? Math.abs(gains.reduce((a, b) => a + b, 0)) / Math.abs(losses.reduce((a, b) => a + b, 0)) 
      : null;

    // Calmar Ratio = Annualized Return / Max Drawdown
    const calmarRatio = avgReturn != null && maxDrawdown != null && maxDrawdown !== 0
      ? (avgReturn * 252) / Math.abs(maxDrawdown)
      : null;

    // Ulcer Index (measure of downside volatility)
    const ulcerIndex = this.calculateUlcerIndex(prices);

    // Pain Index (similar to Ulcer but different calculation)
    const painIndex = ulcerIndex; // Simplified

    // Tail Ratio = 95th percentile return / 5th percentile return
    const tailIndex95 = Math.floor(sortedReturns.length * 0.95);
    const percentile95 = sortedReturns[tailIndex95] ?? null;
    const tailRatio = percentile95 && var95 && var95 !== 0 
      ? Math.abs(percentile95 / var95) 
      : null;

    // Upside/Downside Capture (requires benchmark - approximated)
    const upsideCapture = null;
    const downsideCapture = null;

    return {
      beta,
      standardDeviation: standardDev,
      alpha,
      sharpeRatio,
      sortinoRatio,
      maxDrawdown,
      var95,
      var99,
      cvar95,
      cvar99,
      treynorRatio,
      informationRatio,
      trackingError,
      jensensAlpha,
      modigliani_M2,
      omegaRatio,
      calmarRatio,
      ulcerIndex,
      painIndex,
      tailRatio,
      upsideCapture,
      downsideCapture,
    };
  }

  private calculateUlcerIndex(prices: number[]): number | null {
    if (prices.length === 0) return null;
    
    let runningMax = prices[0];
    let sumSquaredDrawdowns = 0;
    
    for (const price of prices) {
      if (price > runningMax) runningMax = price;
      const drawdown = ((runningMax - price) / runningMax) * 100;
      sumSquaredDrawdowns += drawdown * drawdown;
    }
    
    return Math.sqrt(sumSquaredDrawdowns / prices.length);
  }

  // ==========================================================================
  // TECHNICAL INDICATORS (37 metrics)
  // ==========================================================================

  private calculateTechnicalMetrics(): TechnicalMetrics {
    const yahoo = this.rawData.yahoo;
    const prices = yahoo.priceHistory.map((p) => p.close);
    const highs = yahoo.priceHistory.map((p) => p.high);
    const lows = yahoo.priceHistory.map((p) => p.low);
    const volumes = yahoo.priceHistory.map((p) => p.volume);

    const rsi = calculateRSI(prices);

    // MACD Calculation
    const ema12 = this.calculateEMA(prices, 12);
    const ema26 = this.calculateEMA(prices, 26);
    const macd = ema12 && ema26 ? ema12 - ema26 : null;
    
    // MACD Signal Line (9-period EMA of MACD)
    const macdLine = prices.map((_, i) => {
      const e12 = this.calculateEMAAtIndex(prices, 12, i);
      const e26 = this.calculateEMAAtIndex(prices, 26, i);
      return e12 && e26 ? e12 - e26 : 0;
    }).filter(v => v !== 0);
    const macdSignal = this.calculateEMA(macdLine, 9);
    const macdHistogram = macd && macdSignal ? macd - macdSignal : null;

    const fiftyDayMA = calculateSMA(prices, 50);
    const twoHundredDayMA = calculateSMA(prices, 200);

    const bollinger = calculateBollingerBands(prices);
    const bollingerWidth = bollinger.upper && bollinger.lower && bollinger.middle
      ? (bollinger.upper - bollinger.lower) / bollinger.middle
      : null;

    // Relative Volume = Current Volume / Average Volume
    const relativeVolume = safeDivide(yahoo.volume, yahoo.averageVolume);

    // Stochastic Oscillator
    const stochastic = this.calculateStochastic(prices, highs, lows, 14);
    const stochastic_K = stochastic.k;
    const stochastic_D = stochastic.d;

    // Williams %R
    const williamsR = this.calculateWilliamsR(prices, highs, lows, 14);

    // CCI - Commodity Channel Index
    const cci = this.calculateCCI(prices, highs, lows, 20);

    // ATR - Average True Range
    const atr = this.calculateATR(prices, highs, lows, 14);
    const currentPrice = prices[prices.length - 1] || 1;
    const atrPercent = atr ? (atr / currentPrice) * 100 : null;

    // ADX - Average Directional Index
    const adxData = this.calculateADX(prices, highs, lows, 14);
    const adx = adxData.adx;
    const plusDI = adxData.plusDI;
    const minusDI = adxData.minusDI;

    // OBV - On-Balance Volume
    const obv = this.calculateOBV(prices, volumes);
    const obvTrend = obv && prices.length > 20 
      ? (obv > this.calculateOBVAtIndex(prices, volumes, prices.length - 20) ? 1 : -1) 
      : null;

    // MFI - Money Flow Index
    const mfi = this.calculateMFI(prices, highs, lows, volumes, 14);

    // VWAP - Volume Weighted Average Price
    const vwap = this.calculateVWAP(prices, volumes);

    // Additional Moving Averages
    const sma10 = calculateSMA(prices, 10);
    const sma20 = calculateSMA(prices, 20);
    const sma100 = calculateSMA(prices, 100);

    // Price Relative to Moving Averages
    const priceToSMA50 = fiftyDayMA ? currentPrice / fiftyDayMA : null;
    const priceToSMA200 = twoHundredDayMA ? currentPrice / twoHundredDayMA : null;

    // Golden Cross / Death Cross
    const goldenCross = fiftyDayMA && twoHundredDayMA ? fiftyDayMA > twoHundredDayMA : null;
    const deathCross = fiftyDayMA && twoHundredDayMA ? fiftyDayMA < twoHundredDayMA : null;

    // Trend Strength (ADX based)
    const trendStrength = adx;

    // Support and Resistance (simplified)
    const recentLows = lows.slice(-20);
    const recentHighs = highs.slice(-20);
    const supportLevel = recentLows.length > 0 ? Math.min(...recentLows) : null;
    const resistanceLevel = recentHighs.length > 0 ? Math.max(...recentHighs) : null;

    return {
      rsi,
      macd,
      macdSignal,
      macdHistogram,
      fiftyDayMA,
      twoHundredDayMA,
      bollingerUpper: bollinger.upper,
      bollingerLower: bollinger.lower,
      bollingerMiddle: bollinger.middle,
      bollingerWidth,
      relativeVolume,
      stochastic_K,
      stochastic_D,
      williamsR,
      cci,
      atr,
      atrPercent,
      adx,
      plusDI,
      minusDI,
      obv,
      obvTrend,
      mfi,
      vwap,
      ema12,
      ema26,
      sma10,
      sma20,
      sma100,
      priceToSMA50,
      priceToSMA200,
      goldenCross,
      deathCross,
      trendStrength,
      supportLevel,
      resistanceLevel,
    };
  }

  // Technical indicator helper methods
  private calculateEMA(prices: number[], period: number): number | null {
    if (prices.length < period) return null;
    const multiplier = 2 / (period + 1);
    let ema = prices.slice(0, period).reduce((a, b) => a + b, 0) / period;
    for (let i = period; i < prices.length; i++) {
      ema = (prices[i] - ema) * multiplier + ema;
    }
    return ema;
  }

  private calculateEMAAtIndex(prices: number[], period: number, index: number): number | null {
    if (index < period) return null;
    return this.calculateEMA(prices.slice(0, index + 1), period);
  }

  private calculateStochastic(prices: number[], highs: number[], lows: number[], period: number): { k: number | null; d: number | null } {
    if (prices.length < period) return { k: null, d: null };
    const recentHighs = highs.slice(-period);
    const recentLows = lows.slice(-period);
    const currentClose = prices[prices.length - 1];
    const highestHigh = Math.max(...recentHighs);
    const lowestLow = Math.min(...recentLows);
    const k = highestHigh !== lowestLow ? ((currentClose - lowestLow) / (highestHigh - lowestLow)) * 100 : null;
    const d = k !== null ? k * 0.8 + 20 * 0.2 : null; // Simplified %D
    return { k, d };
  }

  private calculateWilliamsR(prices: number[], highs: number[], lows: number[], period: number): number | null {
    if (prices.length < period) return null;
    const recentHighs = highs.slice(-period);
    const recentLows = lows.slice(-period);
    const currentClose = prices[prices.length - 1];
    const highestHigh = Math.max(...recentHighs);
    const lowestLow = Math.min(...recentLows);
    return highestHigh !== lowestLow ? ((highestHigh - currentClose) / (highestHigh - lowestLow)) * -100 : null;
  }

  private calculateCCI(prices: number[], highs: number[], lows: number[], period: number): number | null {
    if (prices.length < period) return null;
    const typicalPrices = prices.map((p, i) => (p + highs[i] + lows[i]) / 3);
    const recentTP = typicalPrices.slice(-period);
    const smaTP = recentTP.reduce((a, b) => a + b, 0) / period;
    const meanDeviation = recentTP.reduce((sum, tp) => sum + Math.abs(tp - smaTP), 0) / period;
    const currentTP = typicalPrices[typicalPrices.length - 1];
    return meanDeviation !== 0 ? (currentTP - smaTP) / (0.015 * meanDeviation) : null;
  }

  private calculateATR(prices: number[], highs: number[], lows: number[], period: number): number | null {
    if (prices.length < period + 1) return null;
    const trueRanges: number[] = [];
    for (let i = 1; i < prices.length; i++) {
      const tr = Math.max(
        highs[i] - lows[i],
        Math.abs(highs[i] - prices[i - 1]),
        Math.abs(lows[i] - prices[i - 1])
      );
      trueRanges.push(tr);
    }
    const recentTR = trueRanges.slice(-period);
    return recentTR.reduce((a, b) => a + b, 0) / period;
  }

  private calculateADX(prices: number[], highs: number[], lows: number[], period: number): { adx: number | null; plusDI: number | null; minusDI: number | null } {
    if (prices.length < period + 1) return { adx: null, plusDI: null, minusDI: null };
    // Simplified ADX calculation
    const atr = this.calculateATR(prices, highs, lows, period) || 1;
    const plusDM = highs.slice(-period).reduce((sum, h, i, arr) => {
      if (i === 0) return sum;
      const dm = h - arr[i - 1];
      return sum + (dm > 0 ? dm : 0);
    }, 0) / period;
    const minusDM = lows.slice(-period).reduce((sum, l, i, arr) => {
      if (i === 0) return sum;
      const dm = arr[i - 1] - l;
      return sum + (dm > 0 ? dm : 0);
    }, 0) / period;
    const plusDI = (plusDM / atr) * 100;
    const minusDI = (minusDM / atr) * 100;
    const dx = Math.abs(plusDI - minusDI) / (plusDI + minusDI || 1) * 100;
    return { adx: dx, plusDI, minusDI };
  }

  private calculateOBV(prices: number[], volumes: number[]): number | null {
    if (prices.length < 2) return null;
    let obv = 0;
    for (let i = 1; i < prices.length; i++) {
      if (prices[i] > prices[i - 1]) obv += volumes[i];
      else if (prices[i] < prices[i - 1]) obv -= volumes[i];
    }
    return obv;
  }

  private calculateOBVAtIndex(prices: number[], volumes: number[], index: number): number {
    let obv = 0;
    for (let i = 1; i <= index && i < prices.length; i++) {
      if (prices[i] > prices[i - 1]) obv += volumes[i];
      else if (prices[i] < prices[i - 1]) obv -= volumes[i];
    }
    return obv;
  }

  private calculateMFI(prices: number[], highs: number[], lows: number[], volumes: number[], period: number): number | null {
    if (prices.length < period + 1) return null;
    let positiveFlow = 0;
    let negativeFlow = 0;
    for (let i = prices.length - period; i < prices.length; i++) {
      const typicalPrice = (prices[i] + highs[i] + lows[i]) / 3;
      const prevTypicalPrice = i > 0 ? (prices[i - 1] + highs[i - 1] + lows[i - 1]) / 3 : typicalPrice;
      const rawMoneyFlow = typicalPrice * volumes[i];
      if (typicalPrice > prevTypicalPrice) positiveFlow += rawMoneyFlow;
      else negativeFlow += rawMoneyFlow;
    }
    const moneyRatio = negativeFlow !== 0 ? positiveFlow / negativeFlow : 100;
    return 100 - (100 / (1 + moneyRatio));
  }

  private calculateVWAP(prices: number[], volumes: number[]): number | null {
    if (prices.length === 0) return null;
    let cumulativeTPV = 0;
    let cumulativeVolume = 0;
    for (let i = 0; i < prices.length; i++) {
      cumulativeTPV += prices[i] * volumes[i];
      cumulativeVolume += volumes[i];
    }
    return cumulativeVolume !== 0 ? cumulativeTPV / cumulativeVolume : null;
  }

  // ==========================================================================
  // SCORING (12 scores, 0-100 scale)
  // ==========================================================================

  private calculateScores(): ScoreMetrics {
    const profitabilityScore = this.calculateProfitabilityScore();
    const growthScore = this.calculateGrowthScore();
    const valuationScore = this.calculateValuationScore();
    const riskScore = this.calculateRiskScore();
    const healthScore = this.calculateHealthScore();

    // Extended Scores
    const momentumScore = this.calculateMomentumScore();
    const qualityScore = this.calculateQualityScore();
    const stabilityScore = this.calculateStabilityScore();
    const efficiencyScore = this.calculateEfficiencyScore();
    const solvencyScore = this.calculateSolvencyScore();
    const technicalScore = this.calculateTechnicalScore();

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
      momentumScore,
      qualityScore,
      stabilityScore,
      efficiencyScore,
      solvencyScore,
      technicalScore,
    };
  }

  private calculateMomentumScore(): number | null {
    const technical = this.calculateTechnicalMetrics();
    const scores: number[] = [];
    
    // RSI: 30-70 is neutral, >70 overbought, <30 oversold
    if (technical.rsi != null) {
      if (technical.rsi >= 30 && technical.rsi <= 70) {
        scores.push(50 + (technical.rsi - 50));
      } else if (technical.rsi > 70) {
        scores.push(Math.max(0, 100 - (technical.rsi - 70) * 3));
      } else {
        scores.push(Math.min(100, technical.rsi * 2));
      }
    }
    
    // Price relative to 50 DMA
    if (technical.priceToSMA50 != null) {
      scores.push(normalizeToScale(technical.priceToSMA50, 0.8, 1.2) || 50);
    }
    
    return scores.length > 0 ? scores.reduce((a, b) => a + b, 0) / scores.length : null;
  }

  private calculateQualityScore(): number | null {
    const profitability = this.calculateProfitabilityMetrics();
    const scores: number[] = [];
    
    if (profitability.roe != null) {
      scores.push(normalizeToScale(profitability.roe, 0, 0.25));
    }
    if (profitability.roic != null) {
      scores.push(normalizeToScale(profitability.roic, 0, 0.20));
    }
    if (profitability.grossProfitMargin != null) {
      scores.push(normalizeToScale(profitability.grossProfitMargin, 0, 0.5));
    }
    
    return scores.length > 0 ? scores.reduce((a, b) => a + b, 0) / scores.length : null;
  }

  private calculateStabilityScore(): number | null {
    const risk = this.calculateRiskMetrics();
    const scores: number[] = [];
    
    // Lower volatility = higher stability
    if (risk.standardDeviation != null) {
      scores.push(100 - normalizeToScale(risk.standardDeviation, 0, 0.5));
    }
    if (risk.beta != null) {
      scores.push(100 - normalizeToScale(Math.abs(risk.beta - 1), 0, 1));
    }
    
    return scores.length > 0 ? scores.reduce((a, b) => a + b, 0) / scores.length : null;
  }

  private calculateEfficiencyScore(): number | null {
    const efficiency = this.calculateEfficiencyMetrics();
    const scores: number[] = [];
    
    if (efficiency.totalAssetTurnover != null) {
      scores.push(normalizeToScale(efficiency.totalAssetTurnover, 0, 2));
    }
    if (efficiency.inventoryTurnover != null) {
      scores.push(normalizeToScale(efficiency.inventoryTurnover, 0, 15));
    }
    
    return scores.length > 0 ? scores.reduce((a, b) => a + b, 0) / scores.length : null;
  }

  private calculateSolvencyScore(): number | null {
    const leverage = this.calculateLeverageMetrics();
    const scores: number[] = [];
    
    // Lower debt = higher solvency
    if (leverage.debtToAssets != null) {
      scores.push(100 - normalizeToScale(leverage.debtToAssets, 0, 0.8));
    }
    if (leverage.interestCoverage != null) {
      scores.push(normalizeToScale(leverage.interestCoverage, 0, 15));
    }
    
    return scores.length > 0 ? scores.reduce((a, b) => a + b, 0) / scores.length : null;
  }

  private calculateTechnicalScore(): number | null {
    const technical = this.calculateTechnicalMetrics();
    const scores: number[] = [];
    
    // RSI in healthy range
    if (technical.rsi != null) {
      const rsiScore = technical.rsi >= 40 && technical.rsi <= 60 ? 100 
        : technical.rsi >= 30 && technical.rsi <= 70 ? 70 
        : 30;
      scores.push(rsiScore);
    }
    
    // Golden cross is bullish
    if (technical.goldenCross === true) scores.push(80);
    else if (technical.deathCross === true) scores.push(20);
    else scores.push(50);
    
    return scores.length > 0 ? scores.reduce((a, b) => a + b, 0) / scores.length : null;
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
  // OTHER KEY METRICS (20 metrics)
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

    // DOL = % change in EBIT / % change in Sales (approximation)
    // Using contribution margin approach: (Revenue - Variable Costs) / EBIT
    const operatingLeverage = yahoo.ebit && yahoo.grossProfit
      ? safeDivide(yahoo.grossProfit, yahoo.ebit)
      : null;

    // DFL = EBIT / (EBIT - Interest Expense)
    const financialLeverage = yahoo.ebit && yahoo.interestExpense
      ? safeDivide(yahoo.ebit, yahoo.ebit - yahoo.interestExpense)
      : null;

    const altmanZScore = this.calculateAltmanZScore();

    const piotroskiFScore = this.calculatePiotroskiFScore();

    // Excess ROIC = Company ROIC - Industry Average ROIC
    const roic = this.calculateProfitabilityMetrics().roic;
    const excessROIC = roic && this.rawData.industry?.industryROIC 
      ? roic - (this.rawData.industry.industryROIC || 0)
      : null;

    // Extended Other Metrics
    // Beneish M-Score (simplified - would need more historical data for full calculation)
    const beneishMScore = this.calculateBeneishMScore();

    // Tangible Book Value Per Share = (Equity - Intangibles) / Shares
    // Approximating intangibles as 20% of total assets for tech companies
    const intangibles = yahoo.totalAssets * 0.2;
    const tangibleBookValuePerShare = safeDivide(
      yahoo.totalEquity - intangibles,
      yahoo.sharesOutstanding
    );

    // Revenue Per Employee (need employee count - approximation)
    const estimatedEmployees = Math.max(1, yahoo.marketCap / 500000); // Rough estimate
    const revenuePerEmployee = safeDivide(yahoo.revenue, estimatedEmployees);
    const profitPerEmployee = safeDivide(yahoo.netIncome, estimatedEmployees);
    const marketCapPerEmployee = safeDivide(yahoo.marketCap, estimatedEmployees);
    
    // Enterprise Value Per Employee
    const ev = yahoo.marketCap + yahoo.totalDebt - yahoo.cash;
    const enterpriseValuePerEmployee = safeDivide(ev, estimatedEmployees);

    // Tax Burden Ratio = Net Income / Pretax Income
    const taxBurdenRatio = safeDivide(yahoo.netIncome, yahoo.pretaxIncome);

    // Operating ROI = Operating Income / (Fixed Assets + Working Capital)
    const fixedAssets = yahoo.totalAssets - yahoo.currentAssets;
    const operatingRoi = safeDivide(yahoo.operatingIncome, fixedAssets + workingCapital);

    // Invested Capital Turnover = Revenue / Invested Capital
    const investedCapital = yahoo.totalEquity + yahoo.totalDebt - yahoo.cash;
    const investedCapitalTurnover = safeDivide(yahoo.revenue, investedCapital);

    // Total Leverage = DOL × DFL
    const totalLeverage = operatingLeverage && financialLeverage 
      ? operatingLeverage * financialLeverage 
      : null;

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
      beneishMScore,
      tangibleBookValuePerShare,
      revenuePerEmployee,
      profitPerEmployee,
      marketCapPerEmployee,
      enterpriseValuePerEmployee,
      taxBurdenRatio,
      operatingRoi,
      investedCapitalTurnover,
      totalLeverage,
    };
  }

  private calculateBeneishMScore(): number | null {
    // Simplified Beneish M-Score calculation
    // Full calculation requires 8 variables with historical comparison
    // This is a simplified approximation
    const yahoo = this.rawData.yahoo;
    
    // Days Sales in Receivables Index (DSRI) - approximation
    const dsri = safeDivide(yahoo.netReceivables, yahoo.revenue) || 1;
    
    // Gross Margin Index (GMI) - approximation
    const gmi = 1.0; // Would need prior year data
    
    // Asset Quality Index (AQI)
    const totalCurrentAssets = yahoo.currentAssets;
    const totalAssets = yahoo.totalAssets;
    const ppe = totalAssets - totalCurrentAssets;
    const aqi = safeDivide(totalAssets - totalCurrentAssets - ppe, totalAssets) || 1;
    
    // Sales Growth Index (SGI)
    const sgi = 1.0; // Would need prior year data
    
    // Depreciation Index (DEPI)
    const depi = 1.0; // Would need prior year data
    
    // SGA Index (SGAI)
    const sgai = 1.0; // Would need prior year data
    
    // Leverage Index (LVGI)
    const lvgi = safeDivide(yahoo.totalLiabilities, yahoo.totalAssets) || 1;
    
    // Total Accruals to Total Assets (TATA)
    const tata = safeDivide(
      yahoo.netIncome - yahoo.operatingCashFlow,
      yahoo.totalAssets
    ) || 0;
    
    // M-Score = -4.84 + 0.92*DSRI + 0.528*GMI + 0.404*AQI + 0.892*SGI 
    //           + 0.115*DEPI - 0.172*SGAI + 4.679*TATA - 0.327*LVGI
    const mScore = -4.84 + 0.92*dsri + 0.528*gmi + 0.404*aqi + 0.892*sgi 
                   + 0.115*depi - 0.172*sgai + 4.679*tata - 0.327*lvgi;
    
    return mScore;
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

  // ==========================================================================
  // TRADE & FX METRICS (35 metrics)
  // ==========================================================================

  private calculateTradeFXMetrics(): TradeFXMetrics {
    const fred = this.rawData.fred;
    const tradeFx = this.rawData.tradeFx;

    // Use trade FX data if available, otherwise use FRED data
    return {
      // Trade Balance (8 metrics)
      termsOfTrade: tradeFx?.termsOfTrade ?? null,
      tradeBalance: fred.tradeBalance ?? tradeFx?.tradeBalance ?? null,
      currentAccount: tradeFx?.currentAccount ?? null,
      capitalAccount: tradeFx?.capitalAccount ?? null,
      netExports: tradeFx?.netExports ?? null,
      savingInvestmentGap: tradeFx?.savingInvestmentGap ?? null,
      exportGrowthRate: null,
      importGrowthRate: null,

      // Spot FX (5 metrics)
      spotRate: tradeFx?.spotRate ?? fred.eurUsd ?? null,
      spotRateBid: tradeFx?.spotRateBid ?? null,
      spotRateAsk: tradeFx?.spotRateAsk ?? null,
      spotRateSpread: tradeFx?.spotRateSpread ?? null,
      spotRateMidpoint: tradeFx?.spotRate ?? null,

      // Forward FX (8 metrics)
      forwardRate1M: tradeFx?.forwardRate1M ?? null,
      forwardRate3M: tradeFx?.forwardRate3M ?? null,
      forwardRate6M: tradeFx?.forwardRate6M ?? null,
      forwardRate1Y: tradeFx?.forwardRate1Y ?? null,
      forwardPoints1M: tradeFx?.forwardPoints1M ?? null,
      forwardPoints3M: tradeFx?.forwardPoints3M ?? null,
      forwardPoints6M: tradeFx?.forwardPoints6M ?? null,
      forwardPoints1Y: tradeFx?.forwardPoints1Y ?? null,

      // Cross Rates (3 metrics)
      crossRate: tradeFx?.crossRate ?? null,
      triangularArbitrage: tradeFx?.triangularArbitrage ?? null,
      syntheticCrossRate: null,

      // Interest Rate Parity (5 metrics)
      coveredInterestParity: tradeFx?.coveredInterestParity ?? null,
      uncoveredInterestParity: tradeFx?.uncoveredInterestParity ?? null,
      forwardPremiumDiscount: tradeFx?.forwardPremiumDiscount ?? null,
      carryTradeReturn: tradeFx?.carryTradeReturn ?? null,
      interestRateDifferential: null,

      // Real Exchange Rate (4 metrics)
      realExchangeRate: tradeFx?.realExchangeRate ?? null,
      purchasingPowerParity: tradeFx?.purchasingPowerParity ?? null,
      pppDeviation: tradeFx?.pppDeviation ?? null,
      realEffectiveExchangeRate: tradeFx?.realEffectiveExchangeRate ?? null,

      // FX Volatility (5 metrics)
      impliedVolatility1M: tradeFx?.impliedVolatility1M ?? null,
      impliedVolatility3M: tradeFx?.impliedVolatility3M ?? null,
      historicalVolatility: tradeFx?.historicalVolatility ?? null,
      riskReversal25D: tradeFx?.riskReversal25D ?? null,
      butterflySpread25D: tradeFx?.butterflySpread25D ?? null,
    };
  }

  // ==========================================================================
  // BOND METRICS (25 metrics)
  // ==========================================================================

  private calculateBondMetrics(): BondMetrics {
    // Bond metrics would come from bond-specific data sources
    // For equity analysis, most of these will be null
    const fred = this.rawData.fred;

    return {
      // Yield Metrics
      couponRate: null,
      currentYield: null,
      yieldToMaturity: null,
      yieldToCall: null,
      yieldToWorst: null,
      taxEquivalentYield: null,
      nominalYield: fred.treasury10Y,
      realYield: fred.realInterestRate,

      // Duration & Convexity
      macaulayDuration: null,
      modifiedDuration: null,
      effectiveDuration: null,
      keyRateDuration: null,
      dollarDuration: null,
      convexity: null,
      effectiveConvexity: null,

      // Price Metrics
      cleanPrice: null,
      dirtyPrice: null,
      accruedInterest: null,
      priceValue01: null,

      // Spread Metrics
      gSpread: fred.creditSpread,
      iSpread: null,
      zSpread: null,
      oas: null,
      assetSwapSpread: null,
      creditSpread: fred.creditSpread,
    };
  }

  // ==========================================================================
  // OPTIONS METRICS (20 metrics)
  // ==========================================================================

  private calculateOptionsMetrics(): OptionsMetrics {
    // Options metrics would come from options-specific data
    const yahoo = this.rawData.yahoo;
    const risk = this.calculateRiskMetrics();

    return {
      // Greeks
      delta: null,
      gamma: null,
      theta: null,
      vega: null,
      rho: null,

      // Second Order Greeks
      vanna: null,
      volga: null,
      charm: null,

      // Volatility
      impliedVolatility: null,
      historicalVolatility: risk.standardDeviation ? risk.standardDeviation * Math.sqrt(252) : null,
      volatilitySkew: null,
      volatilitySmile: null,
      ivRank: null,
      ivPercentile: null,

      // Options Analysis
      intrinsicValue: null,
      timeValue: null,
      moneyness: null,
      probabilityITM: null,
      probabilityOTM: null,
      expectedMove: risk.standardDeviation ? yahoo.price * risk.standardDeviation * Math.sqrt(21) : null,
    };
  }

  // ==========================================================================
  // CREDIT METRICS (18 metrics)
  // ==========================================================================

  private calculateCreditMetrics(): CreditMetrics {
    const yahoo = this.rawData.yahoo;
    const leverage = this.calculateLeverageMetrics();
    const cashFlow = this.calculateCashFlowMetrics();

    // FCF to Total Debt
    const fcfToTotalDebt = safeDivide(yahoo.freeCashFlow, yahoo.totalDebt);

    // Retained Cash Flow to Debt
    const retainedCashFlow = yahoo.operatingCashFlow - (yahoo.dividendsPaid || 0);
    const retainedCashFlowToDebt = safeDivide(retainedCashFlow, yahoo.totalDebt);

    // Net Leverage = Net Debt / EBITDA
    const netDebt = yahoo.totalDebt - yahoo.cash;
    const netLeverage = safeDivide(netDebt, yahoo.ebitda);

    // Gross Leverage = Total Debt / EBITDA
    const grossLeverage = leverage.debtToEBITDA;

    // Liquidity Coverage = (Cash + Short-term Investments) / Short-term Debt
    const liquidityCoverage = safeDivide(yahoo.cash + yahoo.shortTermInvestments, yahoo.shortTermDebt);

    // Cash to Short-term Debt
    const cashToShortTermDebt = safeDivide(yahoo.cash, yahoo.shortTermDebt);

    // Debt Capacity Ratio
    const debtCapacityRatio = leverage.debtCapacityUtilization;

    return {
      creditRating: null,
      creditRatingNumeric: null,
      probabilityOfDefault: null,
      lossGivenDefault: null,
      expectedLoss: null,
      fcfToTotalDebt,
      retainedCashFlowToDebt,
      ebitdaToInterest: leverage.interestCoverage,
      netLeverage,
      grossLeverage,
      securedLeverage: null,
      liquidityCoverage,
      cashToShortTermDebt,
      distanceToDefault: null,
      creditSpreadDuration: null,
      recoveryRate: null,
      debtCapacityRatio,
      mertonsModel: null,
    };
  }

  // ==========================================================================
  // ESG METRICS (15 metrics)
  // ==========================================================================

  private calculateESGMetrics(): ESGMetrics {
    // ESG data would come from specialized ESG data providers
    // For now, return null values as placeholders
    return {
      esgScore: null,
      esgRating: null,
      environmentalScore: null,
      carbonIntensity: null,
      carbonFootprint: null,
      energyIntensity: null,
      waterUsage: null,
      wasteGeneration: null,
      socialScore: null,
      employeeSatisfaction: null,
      diversityRatio: null,
      safetyIncidents: null,
      governanceScore: null,
      boardIndependence: null,
      executiveCompRatio: null,
    };
  }

  // ==========================================================================
  // PORTFOLIO METRICS (20 metrics)
  // ==========================================================================

  private calculatePortfolioMetrics(): PortfolioMetrics {
    // Portfolio metrics are typically calculated at the portfolio level
    // For individual stocks, these would be contribution metrics
    const risk = this.calculateRiskMetrics();

    return {
      portfolioReturn: null,
      excessReturn: null,
      activeReturn: null,
      portfolioBeta: risk.beta,
      portfolioAlpha: risk.alpha,
      portfolioVolatility: risk.standardDeviation ? risk.standardDeviation * Math.sqrt(252) : null,
      systematicRisk: null,
      unsystematicRisk: null,
      portfolioSharpe: risk.sharpeRatio,
      portfolioSortino: risk.sortinoRatio,
      portfolioTreynor: risk.treynorRatio,
      portfolioInformationRatio: risk.informationRatio,
      sectorAllocation: null,
      securitySelection: null,
      interactionEffect: null,
      diversificationRatio: null,
      effectiveNumberOfBets: null,
      herfindahlIndex: null,
      correlationWithBenchmark: null,
      rSquared: null,
    };
  }
}
