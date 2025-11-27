/**
 * Deep Terminal - DCF (Discounted Cash Flow) Valuation Model
 *
 * Implements 10 DCF/Intrinsic Value metrics from data-sources.md (lines 199-211):
 * 1. Risk-Free Rate - 10-Year Treasury (from FRED)
 * 2. Market Risk Premium - E(Rm) - Rf
 * 3. Beta - Covariance(Stock, Market) / Variance(Market)
 * 4. Cost of Equity (Re) - Rf + β(Rm - Rf) [CAPM]
 * 5. Cost of Debt (Rd) - Interest Expense / Total Debt
 * 6. WACC - (E/V)Re + (D/V)Rd(1-t)
 * 7. Terminal Value - FCF(1+g) / (WACC-g)
 * 8. Intrinsic Value - Complete DCF Model
 * 9. Target Price - Analyst consensus
 * 10. Upside/Downside % - (Target - Price) / Price
 *
 * DCF FORMULA:
 * 1. Project Free Cash Flows (5-10 years)
 * 2. Calculate WACC (discount rate)
 * 3. Calculate Terminal Value
 * 4. Discount all cash flows to present value
 * 5. Intrinsic Value = PV(FCFs) + PV(Terminal Value) - Net Debt
 */

import {
  safeDivide,
  safeMultiply,
  safeSubtract,
  safeAdd,
  variance,
  covariance,
  mean,
  calculateCAGR,
} from './helpers';

// ============================================================================
// TYPES
// ============================================================================

/**
 * Input data required for DCF calculations
 */
export interface DCFInput {
  // Current Price & Market Data
  price: number;
  marketCap: number;
  sharesOutstanding: number;

  // Balance Sheet Data
  totalDebt: number;
  cash: number;
  totalEquity: number;

  // Income Statement Data
  interestExpense: number;
  incomeTax: number;
  pretaxIncome: number;
  ebit: number;

  // Cash Flow Data
  freeCashFlow: number;
  operatingCashFlow: number;
  capitalExpenditures: number;

  // Historical FCF for growth projection
  historicalFCF: number[];

  // Beta from Yahoo (or calculate from returns)
  beta: number | null;

  // Risk-Free Rate from FRED (10Y Treasury)
  riskFreeRate: number | null;

  // Analyst target price (optional)
  analystTargetPrice?: number | null;

  // Historical returns for beta calculation (optional)
  stockReturns?: number[];
  marketReturns?: number[];
}

/**
 * Configuration options for DCF model
 */
export interface DCFOptions {
  /** Market Risk Premium (default: 0.055 or 5.5%) */
  marketRiskPremium?: number;
  /** Terminal Growth Rate (default: 0.025 or 2.5%) */
  terminalGrowthRate?: number;
  /** Projection Period in years (default: 5) */
  projectionYears?: number;
  /** Override tax rate (if null, calculated from data) */
  taxRate?: number | null;
  /** FCF growth rate for projections (if null, calculated from historical) */
  fcfGrowthRate?: number | null;
  /** Use analyst target price if available (default: true) */
  useAnalystTarget?: boolean;
}

/**
 * Projected Free Cash Flow for a specific year
 */
export interface ProjectedFCF {
  year: number;
  fcf: number;
  growthRate: number;
  discountFactor: number;
  presentValue: number;
}

/**
 * Complete DCF model output
 */
export interface DCFMetricsResult {
  // Cost of Capital Components
  riskFreeRate: number | null;
  marketRiskPremium: number;
  beta: number | null;
  costOfEquity: number | null;
  costOfDebt: number | null;
  effectiveTaxRate: number | null;
  wacc: number | null;

  // DCF Components
  projectedFCFs: ProjectedFCF[];
  terminalValue: number | null;
  terminalValuePV: number | null;
  sumOfPVFCFs: number | null;

  // Valuation Results
  enterpriseValue: number | null;
  equityValue: number | null;
  intrinsicValue: number | null;

  // Comparison to Market
  targetPrice: number | null;
  upsideDownside: number | null;
  marginOfSafety: number | null;

  // Capital Structure
  debtWeight: number | null;
  equityWeight: number | null;

  // Model Assumptions
  fcfGrowthRate: number | null;
  terminalGrowthRate: number;
  projectionYears: number;
}

// ============================================================================
// DCF CALCULATOR CLASS
// ============================================================================

/**
 * Complete Discounted Cash Flow valuation model
 */
export class DCFCalculator {
  private input: DCFInput;
  private options: Required<DCFOptions>;

  constructor(input: DCFInput, options: DCFOptions = {}) {
    this.input = input;
    this.options = {
      marketRiskPremium: options.marketRiskPremium ?? 0.055,
      terminalGrowthRate: options.terminalGrowthRate ?? 0.025,
      projectionYears: options.projectionYears ?? 5,
      taxRate: options.taxRate ?? null,
      fcfGrowthRate: options.fcfGrowthRate ?? null,
      useAnalystTarget: options.useAnalystTarget ?? true,
    };
  }

  /**
   * Calculate complete DCF valuation
   */
  public calculate(): DCFMetricsResult {
    // Calculate intermediate values
    const beta = this.calculateBeta();
    const costOfEquity = this.calculateCostOfEquity(beta);
    const costOfDebt = this.calculateCostOfDebt();
    const effectiveTaxRate = this.calculateEffectiveTaxRate();
    const { debtWeight, equityWeight } = this.calculateCapitalWeights();
    const wacc = this.calculateWACC(costOfEquity, costOfDebt, effectiveTaxRate, debtWeight, equityWeight);
    const fcfGrowthRate = this.calculateFCFGrowthRate();

    // Project future cash flows
    const projectedFCFs = this.projectFCFs(wacc, fcfGrowthRate);
    const sumOfPVFCFs = this.sumPresentValues(projectedFCFs);

    // Calculate terminal value
    const terminalValue = this.calculateTerminalValue(projectedFCFs, wacc);
    const terminalValuePV = this.calculateTerminalValuePV(terminalValue, wacc, projectedFCFs.length);

    // Calculate intrinsic value
    const { enterpriseValue, equityValue, intrinsicValue } = this.calculateIntrinsicValue(
      sumOfPVFCFs,
      terminalValuePV
    );

    // Get target price and calculate upside/downside
    const targetPrice = this.getTargetPrice(intrinsicValue);
    const upsideDownside = this.calculateUpsideDownside(targetPrice);
    const marginOfSafety = this.calculateMarginOfSafety(intrinsicValue);

    return {
      // Cost of Capital
      riskFreeRate: this.input.riskFreeRate,
      marketRiskPremium: this.options.marketRiskPremium,
      beta,
      costOfEquity,
      costOfDebt,
      effectiveTaxRate,
      wacc,

      // DCF Components
      projectedFCFs,
      terminalValue,
      terminalValuePV,
      sumOfPVFCFs,

      // Valuation
      enterpriseValue,
      equityValue,
      intrinsicValue,

      // Comparison
      targetPrice,
      upsideDownside,
      marginOfSafety,

      // Capital Structure
      debtWeight,
      equityWeight,

      // Assumptions
      fcfGrowthRate,
      terminalGrowthRate: this.options.terminalGrowthRate,
      projectionYears: this.options.projectionYears,
    };
  }

  // ==========================================================================
  // COST OF CAPITAL CALCULATIONS
  // ==========================================================================

  /**
   * Calculate Beta
   * Formula: Covariance(Stock Returns, Market Returns) / Variance(Market Returns)
   *
   * If stock/market returns provided, calculate. Otherwise use Yahoo Finance beta.
   */
  public calculateBeta(): number | null {
    // Use provided returns if available
    if (this.input.stockReturns && this.input.marketReturns) {
      const cov = covariance(this.input.stockReturns, this.input.marketReturns);
      const marketVar = variance(this.input.marketReturns);
      const calculatedBeta = safeDivide(cov, marketVar);
      if (calculatedBeta != null) return calculatedBeta;
    }

    // Fall back to Yahoo Finance beta
    return this.input.beta;
  }

  /**
   * Calculate Cost of Equity using CAPM
   * Formula: Re = Rf + β(Rm - Rf)
   *
   * Where:
   * - Rf = Risk-free rate (10-Year Treasury)
   * - β = Beta (systematic risk)
   * - (Rm - Rf) = Market Risk Premium
   */
  public calculateCostOfEquity(beta?: number | null): number | null {
    const rf = this.input.riskFreeRate;
    const b = beta ?? this.calculateBeta();
    const mrp = this.options.marketRiskPremium;

    if (rf == null || b == null) return null;

    return rf + b * mrp;
  }

  /**
   * Calculate Cost of Debt
   * Formula: Rd = Interest Expense / Total Debt
   *
   * This represents the effective yield on the company's debt
   */
  public calculateCostOfDebt(): number | null {
    return safeDivide(this.input.interestExpense, this.input.totalDebt);
  }

  /**
   * Calculate Effective Tax Rate
   * Formula: Income Tax / Pretax Income
   */
  public calculateEffectiveTaxRate(): number | null {
    if (this.options.taxRate != null) {
      return this.options.taxRate;
    }
    const taxRate = safeDivide(this.input.incomeTax, this.input.pretaxIncome);
    // Tax rate should be between 0 and 1
    if (taxRate != null && (taxRate < 0 || taxRate > 1)) {
      return 0.21; // Default to US corporate rate
    }
    return taxRate;
  }

  /**
   * Calculate capital structure weights
   */
  public calculateCapitalWeights(): { debtWeight: number | null; equityWeight: number | null } {
    const e = this.input.marketCap;
    const d = this.input.totalDebt;
    const v = e + d;

    if (v === 0) {
      return { debtWeight: null, equityWeight: null };
    }

    return {
      debtWeight: d / v,
      equityWeight: e / v,
    };
  }

  /**
   * Calculate WACC (Weighted Average Cost of Capital)
   * Formula: WACC = (E/V) × Re + (D/V) × Rd × (1 - T)
   *
   * Where:
   * - E = Market Cap (equity value)
   * - D = Total Debt
   * - V = E + D (total value)
   * - Re = Cost of Equity
   * - Rd = Cost of Debt
   * - T = Tax Rate
   */
  public calculateWACC(
    costOfEquity?: number | null,
    costOfDebt?: number | null,
    taxRate?: number | null,
    debtWeight?: number | null,
    equityWeight?: number | null
  ): number | null {
    const re = costOfEquity ?? this.calculateCostOfEquity();
    const rd = costOfDebt ?? this.calculateCostOfDebt();
    const t = taxRate ?? this.calculateEffectiveTaxRate() ?? 0.21;

    const { debtWeight: dw, equityWeight: ew } = this.calculateCapitalWeights();
    const dWeight = debtWeight ?? dw;
    const eWeight = equityWeight ?? ew;

    if (re == null || rd == null || dWeight == null || eWeight == null) {
      return null;
    }

    // WACC = (E/V) × Re + (D/V) × Rd × (1 - T)
    const equityComponent = eWeight * re;
    const debtComponent = dWeight * rd * (1 - t);

    return equityComponent + debtComponent;
  }

  // ==========================================================================
  // FREE CASH FLOW PROJECTIONS
  // ==========================================================================

  /**
   * Calculate FCF growth rate from historical data
   */
  public calculateFCFGrowthRate(): number | null {
    if (this.options.fcfGrowthRate != null) {
      return this.options.fcfGrowthRate;
    }

    const fcfs = this.input.historicalFCF;
    if (fcfs.length < 2) return null;

    // Calculate CAGR if we have enough data
    if (fcfs.length >= 3) {
      const cagr = calculateCAGR(fcfs[fcfs.length - 1], fcfs[0], fcfs.length - 1);
      if (cagr != null) return cagr;
    }

    // Fall back to simple YoY growth
    const current = fcfs[fcfs.length - 1];
    const previous = fcfs[fcfs.length - 2];
    return safeDivide(current - previous, Math.abs(previous));
  }

  /**
   * Project Free Cash Flows for the projection period
   */
  public projectFCFs(wacc?: number | null, growthRate?: number | null): ProjectedFCF[] {
    const projections: ProjectedFCF[] = [];
    const w = wacc ?? this.calculateWACC();
    const g = growthRate ?? this.calculateFCFGrowthRate();

    if (w == null || g == null) return projections;

    let currentFCF = this.input.freeCashFlow;
    const years = this.options.projectionYears;

    // Apply declining growth rate (fade to terminal growth)
    const startGrowth = g;
    const endGrowth = this.options.terminalGrowthRate;
    const growthDecline = (startGrowth - endGrowth) / years;

    for (let year = 1; year <= years; year++) {
      // Declining growth rate toward terminal growth
      const yearGrowth = startGrowth - growthDecline * (year - 1);
      currentFCF = currentFCF * (1 + yearGrowth);

      // Discount factor = 1 / (1 + WACC)^n
      const discountFactor = 1 / Math.pow(1 + w, year);
      const presentValue = currentFCF * discountFactor;

      projections.push({
        year,
        fcf: currentFCF,
        growthRate: yearGrowth,
        discountFactor,
        presentValue,
      });
    }

    return projections;
  }

  /**
   * Sum present values of projected FCFs
   */
  public sumPresentValues(projectedFCFs: ProjectedFCF[]): number | null {
    if (projectedFCFs.length === 0) return null;
    return projectedFCFs.reduce((sum, p) => sum + p.presentValue, 0);
  }

  // ==========================================================================
  // TERMINAL VALUE
  // ==========================================================================

  /**
   * Calculate Terminal Value using Gordon Growth Model
   * Formula: TV = FCF_n × (1 + g) / (WACC - g)
   *
   * Where:
   * - FCF_n = Free Cash Flow in final projection year
   * - g = Terminal growth rate (typically GDP growth, ~2-3%)
   * - WACC = Weighted Average Cost of Capital
   */
  public calculateTerminalValue(
    projectedFCFs?: ProjectedFCF[],
    wacc?: number | null
  ): number | null {
    const fcfs = projectedFCFs ?? this.projectFCFs();
    const w = wacc ?? this.calculateWACC();
    const g = this.options.terminalGrowthRate;

    if (fcfs.length === 0 || w == null) return null;

    // Terminal Value requires WACC > terminal growth rate
    if (w <= g) return null;

    const finalYearFCF = fcfs[fcfs.length - 1].fcf;
    return safeDivide(finalYearFCF * (1 + g), w - g);
  }

  /**
   * Calculate Present Value of Terminal Value
   * Formula: TV_PV = TV / (1 + WACC)^n
   */
  public calculateTerminalValuePV(
    terminalValue?: number | null,
    wacc?: number | null,
    years?: number
  ): number | null {
    const tv = terminalValue ?? this.calculateTerminalValue();
    const w = wacc ?? this.calculateWACC();
    const n = years ?? this.options.projectionYears;

    if (tv == null || w == null) return null;

    const discountFactor = 1 / Math.pow(1 + w, n);
    return tv * discountFactor;
  }

  // ==========================================================================
  // INTRINSIC VALUE CALCULATION
  // ==========================================================================

  /**
   * Calculate Intrinsic Value
   *
   * Intrinsic Value = PV(FCFs) + PV(Terminal Value) - Net Debt
   *
   * Returns:
   * - Enterprise Value = Sum of PV(FCFs) + PV(TV)
   * - Equity Value = Enterprise Value - Net Debt
   * - Intrinsic Value per Share = Equity Value / Shares Outstanding
   */
  public calculateIntrinsicValue(
    sumOfPVFCFs?: number | null,
    terminalValuePV?: number | null
  ): { enterpriseValue: number | null; equityValue: number | null; intrinsicValue: number | null } {
    const pvFCFs = sumOfPVFCFs ?? this.sumPresentValues(this.projectFCFs());
    const tvPV = terminalValuePV ?? this.calculateTerminalValuePV();

    if (pvFCFs == null || tvPV == null) {
      return { enterpriseValue: null, equityValue: null, intrinsicValue: null };
    }

    // Enterprise Value = PV of FCFs + PV of Terminal Value
    const enterpriseValue = pvFCFs + tvPV;

    // Net Debt = Total Debt - Cash
    const netDebt = this.input.totalDebt - this.input.cash;

    // Equity Value = Enterprise Value - Net Debt
    const equityValue = enterpriseValue - netDebt;

    // Intrinsic Value per Share
    const intrinsicValue = safeDivide(equityValue, this.input.sharesOutstanding);

    return { enterpriseValue, equityValue, intrinsicValue };
  }

  // ==========================================================================
  // COMPARISON METRICS
  // ==========================================================================

  /**
   * Get target price (analyst target or intrinsic value)
   */
  public getTargetPrice(intrinsicValue?: number | null): number | null {
    if (this.options.useAnalystTarget && this.input.analystTargetPrice != null) {
      return this.input.analystTargetPrice;
    }
    return intrinsicValue ?? null;
  }

  /**
   * Calculate Upside/Downside Percentage
   * Formula: (Target Price - Current Price) / Current Price
   */
  public calculateUpsideDownside(targetPrice?: number | null): number | null {
    const target = targetPrice ?? this.getTargetPrice();
    if (target == null) return null;

    return safeDivide(target - this.input.price, this.input.price);
  }

  /**
   * Calculate Margin of Safety
   * Formula: (Intrinsic Value - Current Price) / Intrinsic Value
   *
   * Positive margin = price below intrinsic value (potential buy)
   * Negative margin = price above intrinsic value (potential overvalued)
   */
  public calculateMarginOfSafety(intrinsicValue?: number | null): number | null {
    const iv = intrinsicValue ?? this.calculateIntrinsicValue().intrinsicValue;
    if (iv == null || iv === 0) return null;

    return safeDivide(iv - this.input.price, iv);
  }
}

// ============================================================================
// STANDALONE FUNCTIONS
// ============================================================================

/**
 * Calculate Beta from returns
 * Formula: Cov(Stock, Market) / Var(Market)
 */
export function calculateBeta(
  stockReturns: number[],
  marketReturns: number[]
): number | null {
  const cov = covariance(stockReturns, marketReturns);
  const marketVar = variance(marketReturns);
  return safeDivide(cov, marketVar);
}

/**
 * Calculate Cost of Equity using CAPM
 * Formula: Re = Rf + β(Rm - Rf)
 */
export function calculateCostOfEquity(
  riskFreeRate: number,
  beta: number,
  marketRiskPremium: number
): number {
  return riskFreeRate + beta * marketRiskPremium;
}

/**
 * Calculate Cost of Debt
 * Formula: Rd = Interest Expense / Total Debt
 */
export function calculateCostOfDebt(
  interestExpense: number,
  totalDebt: number
): number | null {
  return safeDivide(interestExpense, totalDebt);
}

/**
 * Calculate WACC
 * Formula: WACC = (E/V) × Re + (D/V) × Rd × (1 - T)
 */
export function calculateWACC(
  marketCap: number,
  totalDebt: number,
  costOfEquity: number,
  costOfDebt: number,
  taxRate: number
): number | null {
  const v = marketCap + totalDebt;
  if (v === 0) return null;

  const equityWeight = marketCap / v;
  const debtWeight = totalDebt / v;

  return equityWeight * costOfEquity + debtWeight * costOfDebt * (1 - taxRate);
}

/**
 * Calculate Terminal Value
 * Formula: TV = FCF × (1 + g) / (WACC - g)
 */
export function calculateTerminalValue(
  fcf: number,
  wacc: number,
  terminalGrowthRate: number
): number | null {
  if (wacc <= terminalGrowthRate) return null;
  return safeDivide(fcf * (1 + terminalGrowthRate), wacc - terminalGrowthRate);
}

/**
 * Calculate Present Value
 * Formula: PV = FV / (1 + r)^n
 */
export function calculatePresentValue(
  futureValue: number,
  discountRate: number,
  periods: number
): number {
  return futureValue / Math.pow(1 + discountRate, periods);
}

/**
 * Calculate simple DCF intrinsic value
 */
export function calculateSimpleDCF(params: {
  freeCashFlow: number;
  growthRate: number;
  terminalGrowthRate: number;
  wacc: number;
  projectionYears: number;
  netDebt: number;
  sharesOutstanding: number;
}): number | null {
  const {
    freeCashFlow,
    growthRate,
    terminalGrowthRate,
    wacc,
    projectionYears,
    netDebt,
    sharesOutstanding,
  } = params;

  if (wacc <= terminalGrowthRate) return null;

  // Project FCFs
  let totalPVFCF = 0;
  let currentFCF = freeCashFlow;
  const growthDecline = (growthRate - terminalGrowthRate) / projectionYears;

  for (let year = 1; year <= projectionYears; year++) {
    const yearGrowth = growthRate - growthDecline * (year - 1);
    currentFCF = currentFCF * (1 + yearGrowth);
    totalPVFCF += calculatePresentValue(currentFCF, wacc, year);
  }

  // Terminal Value
  const terminalValue = calculateTerminalValue(currentFCF, wacc, terminalGrowthRate);
  if (terminalValue == null) return null;

  const tvPV = calculatePresentValue(terminalValue, wacc, projectionYears);

  // Enterprise Value
  const enterpriseValue = totalPVFCF + tvPV;

  // Equity Value
  const equityValue = enterpriseValue - netDebt;

  // Intrinsic Value per Share
  return safeDivide(equityValue, sharesOutstanding);
}

// ============================================================================
// SENSITIVITY ANALYSIS
// ============================================================================

/**
 * DCF Sensitivity Analysis Result
 */
export interface DCFSensitivityResult {
  waccValues: number[];
  terminalGrowthValues: number[];
  intrinsicValueMatrix: (number | null)[][];
}

/**
 * Perform sensitivity analysis on DCF model
 * Varies WACC and terminal growth rate to show range of intrinsic values
 */
export function dcfSensitivityAnalysis(
  calculator: DCFCalculator,
  waccRange: { min: number; max: number; steps: number },
  terminalGrowthRange: { min: number; max: number; steps: number }
): DCFSensitivityResult {
  const waccValues: number[] = [];
  const terminalGrowthValues: number[] = [];
  const intrinsicValueMatrix: (number | null)[][] = [];

  const waccStep = (waccRange.max - waccRange.min) / (waccRange.steps - 1);
  const tgStep = (terminalGrowthRange.max - terminalGrowthRange.min) / (terminalGrowthRange.steps - 1);

  // Generate WACC values
  for (let i = 0; i < waccRange.steps; i++) {
    waccValues.push(waccRange.min + i * waccStep);
  }

  // Generate terminal growth values
  for (let i = 0; i < terminalGrowthRange.steps; i++) {
    terminalGrowthValues.push(terminalGrowthRange.min + i * tgStep);
  }

  // Calculate intrinsic values for each combination
  for (let w = 0; w < waccValues.length; w++) {
    const row: (number | null)[] = [];
    for (let g = 0; g < terminalGrowthValues.length; g++) {
      const wacc = waccValues[w];
      const tg = terminalGrowthValues[g];

      if (wacc <= tg) {
        row.push(null);
      } else {
        const projectedFCFs = calculator.projectFCFs(wacc);
        const sumOfPVFCFs = calculator.sumPresentValues(projectedFCFs);

        // Calculate TV with specific terminal growth
        const finalFCF = projectedFCFs.length > 0 ? projectedFCFs[projectedFCFs.length - 1].fcf : 0;
        const tv = calculateTerminalValue(finalFCF, wacc, tg);
        const tvPV = tv ? calculatePresentValue(tv, wacc, projectedFCFs.length) : null;

        if (sumOfPVFCFs && tvPV) {
          const ev = sumOfPVFCFs + tvPV;
          row.push(ev);
        } else {
          row.push(null);
        }
      }
    }
    intrinsicValueMatrix.push(row);
  }

  return {
    waccValues,
    terminalGrowthValues,
    intrinsicValueMatrix,
  };
}

// ============================================================================
// VALUATION INTERPRETATION
// ============================================================================

/**
 * Interpret DCF valuation results
 */
export interface DCFInterpretation {
  valuation: 'undervalued' | 'fairly valued' | 'overvalued';
  confidence: 'high' | 'medium' | 'low';
  upsidePercentage: number | null;
  recommendation: string;
}

/**
 * Interpret DCF results and provide recommendation
 */
export function interpretDCFResults(
  intrinsicValue: number | null,
  currentPrice: number,
  marginOfSafety: number | null
): DCFInterpretation {
  if (intrinsicValue == null || marginOfSafety == null) {
    return {
      valuation: 'fairly valued',
      confidence: 'low',
      upsidePercentage: null,
      recommendation: 'Insufficient data for DCF valuation',
    };
  }

  const upside = (intrinsicValue - currentPrice) / currentPrice;
  let valuation: 'undervalued' | 'fairly valued' | 'overvalued';
  let confidence: 'high' | 'medium' | 'low';
  let recommendation: string;

  if (marginOfSafety > 0.30) {
    valuation = 'undervalued';
    confidence = marginOfSafety > 0.50 ? 'high' : 'medium';
    recommendation = `Stock appears significantly undervalued with ${(marginOfSafety * 100).toFixed(1)}% margin of safety. Consider buying.`;
  } else if (marginOfSafety > 0.10) {
    valuation = 'undervalued';
    confidence = 'medium';
    recommendation = `Stock appears moderately undervalued with ${(marginOfSafety * 100).toFixed(1)}% margin of safety.`;
  } else if (marginOfSafety > -0.10) {
    valuation = 'fairly valued';
    confidence = 'medium';
    recommendation = `Stock appears fairly valued. Current price is close to intrinsic value.`;
  } else if (marginOfSafety > -0.30) {
    valuation = 'overvalued';
    confidence = 'medium';
    recommendation = `Stock appears moderately overvalued. Current price is ${Math.abs(marginOfSafety * 100).toFixed(1)}% above intrinsic value.`;
  } else {
    valuation = 'overvalued';
    confidence = 'high';
    recommendation = `Stock appears significantly overvalued. Current price is ${Math.abs(marginOfSafety * 100).toFixed(1)}% above intrinsic value. Consider avoiding.`;
  }

  return {
    valuation,
    confidence,
    upsidePercentage: upside * 100,
    recommendation,
  };
}
