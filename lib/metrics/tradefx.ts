/**
 * Deep Terminal - Trade & Foreign Exchange Parity Metrics
 *
 * 35+ Trade and FX metrics organized by category:
 * 
 * Trade Balance Metrics (8):
 * - Terms of Trade (TOT), Trade Balance, Current Account
 * - Capital Account, Net Exports, Saving-Investment Gap
 * - Export Growth Rate, Import Growth Rate
 * 
 * Spot FX Metrics (5):
 * - Spot Rate, Bid, Ask, Spread, Midpoint
 * 
 * Forward FX Metrics (8):
 * - Forward Rates (1M, 3M, 6M, 1Y)
 * - Forward Points (1M, 3M, 6M, 1Y)
 * 
 * Cross Rates (3):
 * - Cross Rate, Triangular Arbitrage, Synthetic Cross Rate
 * 
 * Interest Rate Parity (5):
 * - Covered Interest Parity (CIP), Uncovered Interest Parity (UIP)
 * - Forward Premium/Discount, Carry Trade Return, Interest Rate Differential
 * 
 * Real Exchange Rate (4):
 * - Real Exchange Rate, Purchasing Power Parity (PPP)
 * - PPP Deviation, Real Effective Exchange Rate (REER)
 * 
 * FX Volatility (5):
 * - Implied Vol 1M/3M, Historical Vol
 * - Risk Reversal 25D, Butterfly Spread 25D
 */

import type { TradeFXData, TradeFXMetrics } from './types';
import { safeDivide, safeMultiply, safeSubtract } from './helpers';

// ============================================================================
// TRADE & FX SERIES CONFIGURATION
// ============================================================================

/**
 * FRED Series IDs for Trade & FX data
 */
export const TRADE_FX_SERIES = {
  // Trade Balance
  TRADE_BALANCE: 'BOPGSTB',              // Trade Balance: Goods and Services
  CURRENT_ACCOUNT: 'NETFI',              // Net Financial Investment
  EXPORTS: 'EXPGS',                       // Exports of Goods and Services
  IMPORTS: 'IMPGS',                       // Imports of Goods and Services
  
  // Exchange Rates (from FRED)
  USD_EUR: 'DEXUSEU',                     // US Dollar to Euro
  USD_GBP: 'DEXUSUK',                     // US Dollar to UK Pound
  USD_JPY: 'DEXJPUS',                     // Japanese Yen to US Dollar
  USD_CAD: 'DEXCAUS',                     // Canadian Dollar to US Dollar
  USD_CHF: 'DEXSZUS',                     // Swiss Franc to US Dollar
  USD_INDEX: 'DTWEXBGS',                  // Trade Weighted USD Index
  
  // Interest Rates (for parity calculations)
  US_3M_RATE: 'DTB3',                     // US 3-Month Treasury Bill
  EUR_3M_RATE: 'IR3TIB01EZM156N',         // Euro Area 3-Month Rate
  GBP_3M_RATE: 'IR3TIB01GBM156N',         // UK 3-Month Rate
  JPY_3M_RATE: 'IR3TIB01JPM156N',         // Japan 3-Month Rate
  
  // Price Indices (for PPP)
  US_CPI: 'CPIAUCSL',                     // US CPI
  EUR_CPI: 'CP0000EZ19M086NEST',          // Euro Area CPI
} as const;

// ============================================================================
// TRADE METRICS CALCULATIONS
// ============================================================================

/**
 * Calculate Terms of Trade
 * TOT = (Export Price Index / Import Price Index) × 100
 */
export function calculateTermsOfTrade(
  exportPriceIndex: number | null,
  importPriceIndex: number | null
): number | null {
  if (exportPriceIndex == null || importPriceIndex == null || importPriceIndex === 0) {
    return null;
  }
  return (exportPriceIndex / importPriceIndex) * 100;
}

/**
 * Calculate Opportunity Cost of Good X (in terms of Good Y)
 * Formula: ΔY / ΔX (slope of PPF)
 */
export function calculateOpportunityCost(
  changeInGoodY: number | null,
  changeInGoodX: number | null
): number | null {
  return safeDivide(changeInGoodY, changeInGoodX);
}

/**
 * Calculate Trade Balance
 * Trade Balance = Exports - Imports
 */
export function calculateTradeBalance(
  exports: number | null,
  imports: number | null
): number | null {
  return safeSubtract(exports, imports);
}

/**
 * Calculate Saving-Investment Identity
 * S - I = X - M (CA = S - I)
 * Where: S = Savings, I = Investment, X = Exports, M = Imports
 */
export function calculateSavingInvestmentGap(
  savings: number | null,
  investment: number | null
): number | null {
  return safeSubtract(savings, investment);
}

/**
 * Calculate Net Exports (Same as Trade Balance)
 */
export function calculateNetExports(
  exports: number | null,
  imports: number | null
): number | null {
  return calculateTradeBalance(exports, imports);
}

// ============================================================================
// SPOT FX CALCULATIONS
// ============================================================================

/**
 * Calculate Spot Rate Spread
 */
export function calculateSpotSpread(
  bidRate: number | null,
  askRate: number | null
): number | null {
  return safeSubtract(askRate, bidRate);
}

/**
 * Calculate Spot Rate Midpoint
 */
export function calculateSpotMidpoint(
  bidRate: number | null,
  askRate: number | null
): number | null {
  if (bidRate == null || askRate == null) return null;
  return (bidRate + askRate) / 2;
}

// ============================================================================
// FORWARD FX CALCULATIONS
// ============================================================================

/**
 * Calculate Forward Points
 * Forward Points = Forward Rate - Spot Rate
 * Usually quoted in pips (multiply by 10000 for major pairs)
 */
export function calculateForwardPoints(
  forwardRate: number | null,
  spotRate: number | null
): number | null {
  return safeSubtract(forwardRate, spotRate);
}

/**
 * Calculate Forward Rate from Spot and Interest Rates (CIP)
 * F = S × (1 + rd × t) / (1 + rf × t)
 * Where: S = Spot Rate, rd = Domestic Rate, rf = Foreign Rate, t = Time in years
 */
export function calculateForwardRate(
  spotRate: number | null,
  domesticRate: number | null,
  foreignRate: number | null,
  timeInYears: number
): number | null {
  if (spotRate == null || domesticRate == null || foreignRate == null) {
    return null;
  }
  const domesticFactor = 1 + (domesticRate / 100) * timeInYears;
  const foreignFactor = 1 + (foreignRate / 100) * timeInYears;
  if (foreignFactor === 0) return null;
  return spotRate * (domesticFactor / foreignFactor);
}

// ============================================================================
// CROSS RATE CALCULATIONS
// ============================================================================

/**
 * Calculate Cross Rate
 * Cross Rate (A/C) = (A/B) × (B/C)
 * Or: Cross Rate (A/C) = (A/B) / (C/B)
 */
export function calculateCrossRate(
  rateAB: number | null,
  rateBC: number | null
): number | null {
  return safeMultiply(rateAB, rateBC);
}

/**
 * Calculate Triangular Arbitrage Opportunity
 * If (A/B) × (B/C) × (C/A) ≠ 1, arbitrage exists
 * Returns the profit percentage if arbitrage exists
 */
export function calculateTriangularArbitrage(
  rateAB: number | null,
  rateBC: number | null,
  rateCA: number | null
): number | null {
  if (rateAB == null || rateBC == null || rateCA == null) return null;
  const product = rateAB * rateBC * rateCA;
  // Return deviation from 1 as a percentage
  return (product - 1) * 100;
}

/**
 * Calculate Synthetic Cross Rate
 * Used when direct cross rate is not available
 */
export function calculateSyntheticCrossRate(
  rateAUSD: number | null,
  rateBUSD: number | null
): number | null {
  // A/B = (A/USD) / (B/USD)
  return safeDivide(rateAUSD, rateBUSD);
}

// ============================================================================
// INTEREST RATE PARITY CALCULATIONS
// ============================================================================

/**
 * Calculate Covered Interest Parity (CIP)
 * CIP: F/S = (1 + rd) / (1 + rf)
 * If this equality holds, no arbitrage opportunity exists
 * Returns the CIP deviation (should be close to 0)
 */
export function calculateCoveredInterestParity(
  forwardRate: number | null,
  spotRate: number | null,
  domesticRate: number | null,
  foreignRate: number | null
): number | null {
  if (forwardRate == null || spotRate == null || domesticRate == null || foreignRate == null) {
    return null;
  }
  if (spotRate === 0) return null;
  
  const forwardSpotRatio = forwardRate / spotRate;
  const interestRatio = (1 + domesticRate / 100) / (1 + foreignRate / 100);
  
  // Return the deviation from parity (should be 0 if CIP holds)
  return (forwardSpotRatio - interestRatio) * 100;
}

/**
 * Calculate Uncovered Interest Parity (UIP)
 * UIP: E(S₁)/S₀ = (1 + rd) / (1 + rf)
 * Returns expected spot rate change
 */
export function calculateUncoveredInterestParity(
  spotRate: number | null,
  domesticRate: number | null,
  foreignRate: number | null
): number | null {
  if (spotRate == null || domesticRate == null || foreignRate == null) return null;
  
  const interestRatio = (1 + domesticRate / 100) / (1 + foreignRate / 100);
  return spotRate * interestRatio;
}

/**
 * Calculate Forward Premium/Discount (Annualized)
 * Premium/Discount = ((F - S) / S) × (360 / days) × 100
 */
export function calculateForwardPremiumDiscount(
  forwardRate: number | null,
  spotRate: number | null,
  daysToMaturity: number
): number | null {
  if (forwardRate == null || spotRate == null || spotRate === 0 || daysToMaturity === 0) {
    return null;
  }
  return ((forwardRate - spotRate) / spotRate) * (360 / daysToMaturity) * 100;
}

/**
 * Calculate Carry Trade Return
 * Return = (F - S) / S + (rd - rf)
 * Where investor borrows in low-yield currency, invests in high-yield
 */
export function calculateCarryTradeReturn(
  forwardRate: number | null,
  spotRate: number | null,
  domesticRate: number | null,
  foreignRate: number | null
): number | null {
  if (forwardRate == null || spotRate == null || domesticRate == null || foreignRate == null) {
    return null;
  }
  if (spotRate === 0) return null;
  
  const fxReturn = (forwardRate - spotRate) / spotRate;
  const interestDiff = (domesticRate - foreignRate) / 100;
  return (fxReturn + interestDiff) * 100;
}

/**
 * Calculate Interest Rate Differential
 */
export function calculateInterestRateDifferential(
  domesticRate: number | null,
  foreignRate: number | null
): number | null {
  return safeSubtract(domesticRate, foreignRate);
}

// ============================================================================
// REAL EXCHANGE RATE CALCULATIONS
// ============================================================================

/**
 * Calculate Real Exchange Rate
 * RER = Nominal Rate × (P* / P)
 * Where P* = Foreign Price Level, P = Domestic Price Level
 */
export function calculateRealExchangeRate(
  nominalRate: number | null,
  foreignPriceLevel: number | null,
  domesticPriceLevel: number | null
): number | null {
  if (nominalRate == null || foreignPriceLevel == null || domesticPriceLevel == null) {
    return null;
  }
  if (domesticPriceLevel === 0) return null;
  return nominalRate * (foreignPriceLevel / domesticPriceLevel);
}

/**
 * Calculate Purchasing Power Parity (PPP) Exchange Rate
 * PPP Rate = P / P*
 * Where P = Domestic Price Level, P* = Foreign Price Level
 */
export function calculatePPPRate(
  domesticPriceLevel: number | null,
  foreignPriceLevel: number | null
): number | null {
  return safeDivide(domesticPriceLevel, foreignPriceLevel);
}

/**
 * Calculate PPP Deviation
 * Deviation = (Actual Rate - PPP Rate) / PPP Rate × 100
 * Positive = Overvalued, Negative = Undervalued
 */
export function calculatePPPDeviation(
  actualRate: number | null,
  pppRate: number | null
): number | null {
  if (actualRate == null || pppRate == null || pppRate === 0) return null;
  return ((actualRate - pppRate) / pppRate) * 100;
}

// ============================================================================
// FX VOLATILITY CALCULATIONS
// ============================================================================

/**
 * Calculate Historical Volatility (Annualized)
 * Based on standard deviation of log returns
 */
export function calculateHistoricalVolatility(
  priceHistory: number[]
): number | null {
  if (priceHistory.length < 2) return null;
  
  // Calculate log returns
  const logReturns: number[] = [];
  for (let i = 1; i < priceHistory.length; i++) {
    if (priceHistory[i - 1] > 0 && priceHistory[i] > 0) {
      logReturns.push(Math.log(priceHistory[i] / priceHistory[i - 1]));
    }
  }
  
  if (logReturns.length === 0) return null;
  
  // Calculate mean
  const mean = logReturns.reduce((a, b) => a + b, 0) / logReturns.length;
  
  // Calculate variance
  const variance = logReturns.reduce((sum, ret) => sum + Math.pow(ret - mean, 2), 0) / logReturns.length;
  
  // Standard deviation
  const stdDev = Math.sqrt(variance);
  
  // Annualize (assuming daily data, 252 trading days)
  return stdDev * Math.sqrt(252) * 100;
}

// ============================================================================
// MAIN CALCULATION FUNCTION
// ============================================================================

/**
 * Calculate all Trade & FX metrics
 */
export function calculateTradeFX(data: TradeFXData): TradeFXMetrics {
  // Trade Balance Metrics
  const tradeBalance = calculateTradeBalance(data.netExports, null) ?? data.tradeBalance;
  const netExports = data.netExports;
  
  // Spot FX Metrics
  const spotRateSpread = calculateSpotSpread(data.spotRateBid, data.spotRateAsk);
  const spotRateMidpoint = calculateSpotMidpoint(data.spotRateBid, data.spotRateAsk);
  
  // Forward FX Metrics
  const forwardPoints1M = calculateForwardPoints(data.forwardRate1M, data.spotRate);
  const forwardPoints3M = calculateForwardPoints(data.forwardRate3M, data.spotRate);
  const forwardPoints6M = calculateForwardPoints(data.forwardRate6M, data.spotRate);
  const forwardPoints1Y = calculateForwardPoints(data.forwardRate1Y, data.spotRate);
  
  // Cross Rates
  const triangularArbitrage = data.triangularArbitrage;
  const syntheticCrossRate = data.crossRate;
  
  // Interest Rate Parity
  const coveredInterestParity = data.coveredInterestParity;
  const uncoveredInterestParity = data.uncoveredInterestParity;
  const forwardPremiumDiscount = data.forwardPremiumDiscount;
  const carryTradeReturn = data.carryTradeReturn;
  const interestRateDifferential = null; // Would need rate data
  
  // Real Exchange Rate
  const realExchangeRate = data.realExchangeRate;
  const purchasingPowerParity = data.purchasingPowerParity;
  const pppDeviation = data.pppDeviation;
  const realEffectiveExchangeRate = data.realEffectiveExchangeRate;
  
  // FX Volatility
  const impliedVolatility1M = data.impliedVolatility1M;
  const impliedVolatility3M = data.impliedVolatility3M;
  const historicalVolatility = data.historicalVolatility;
  const riskReversal25D = data.riskReversal25D;
  const butterflySpread25D = data.butterflySpread25D;
  
  return {
    // Trade Balance (8 metrics)
    termsOfTrade: data.termsOfTrade,
    tradeBalance,
    currentAccount: data.currentAccount,
    capitalAccount: data.capitalAccount,
    netExports,
    savingInvestmentGap: data.savingInvestmentGap,
    exportGrowthRate: null, // Would need historical data
    importGrowthRate: null, // Would need historical data
    
    // Spot FX (5 metrics)
    spotRate: data.spotRate,
    spotRateBid: data.spotRateBid,
    spotRateAsk: data.spotRateAsk,
    spotRateSpread,
    spotRateMidpoint,
    
    // Forward FX (8 metrics)
    forwardRate1M: data.forwardRate1M,
    forwardRate3M: data.forwardRate3M,
    forwardRate6M: data.forwardRate6M,
    forwardRate1Y: data.forwardRate1Y,
    forwardPoints1M,
    forwardPoints3M,
    forwardPoints6M,
    forwardPoints1Y,
    
    // Cross Rates (3 metrics)
    crossRate: data.crossRate,
    triangularArbitrage,
    syntheticCrossRate,
    
    // Interest Rate Parity (5 metrics)
    coveredInterestParity,
    uncoveredInterestParity,
    forwardPremiumDiscount,
    carryTradeReturn,
    interestRateDifferential,
    
    // Real Exchange Rate (4 metrics)
    realExchangeRate,
    purchasingPowerParity,
    pppDeviation,
    realEffectiveExchangeRate,
    
    // FX Volatility (5 metrics)
    impliedVolatility1M,
    impliedVolatility3M,
    historicalVolatility,
    riskReversal25D,
    butterflySpread25D,
  };
}

// ============================================================================
// INTERPRETATION FUNCTIONS
// ============================================================================

export interface TradeFXInterpretation {
  value: number | null;
  level: 'positive' | 'neutral' | 'negative';
  description: string;
}

/**
 * Interpret Terms of Trade
 */
export function interpretTermsOfTrade(tot: number | null): TradeFXInterpretation {
  if (tot == null) {
    return { value: null, level: 'neutral', description: 'Terms of Trade data unavailable' };
  }
  
  if (tot > 100) {
    return {
      value: tot,
      level: 'positive',
      description: `Favorable Terms of Trade at ${tot.toFixed(1)} - Export prices exceed import prices`,
    };
  } else if (tot === 100) {
    return {
      value: tot,
      level: 'neutral',
      description: `Balanced Terms of Trade at ${tot.toFixed(1)}`,
    };
  } else {
    return {
      value: tot,
      level: 'negative',
      description: `Unfavorable Terms of Trade at ${tot.toFixed(1)} - Import prices exceed export prices`,
    };
  }
}

/**
 * Interpret CIP Deviation
 */
export function interpretCIPDeviation(cipDev: number | null): TradeFXInterpretation {
  if (cipDev == null) {
    return { value: null, level: 'neutral', description: 'CIP data unavailable' };
  }
  
  const absDev = Math.abs(cipDev);
  if (absDev < 0.1) {
    return {
      value: cipDev,
      level: 'positive',
      description: `CIP holds with ${cipDev.toFixed(3)}% deviation - No arbitrage opportunity`,
    };
  } else if (absDev < 0.5) {
    return {
      value: cipDev,
      level: 'neutral',
      description: `Minor CIP deviation of ${cipDev.toFixed(3)}% - Small arbitrage may exist`,
    };
  } else {
    return {
      value: cipDev,
      level: 'negative',
      description: `Significant CIP violation of ${cipDev.toFixed(3)}% - Potential arbitrage opportunity`,
    };
  }
}

/**
 * Interpret PPP Deviation
 */
export function interpretPPPDeviation(pppDev: number | null): TradeFXInterpretation {
  if (pppDev == null) {
    return { value: null, level: 'neutral', description: 'PPP data unavailable' };
  }
  
  if (pppDev > 20) {
    return {
      value: pppDev,
      level: 'negative',
      description: `Currency significantly overvalued by ${pppDev.toFixed(1)}% vs PPP`,
    };
  } else if (pppDev > 10) {
    return {
      value: pppDev,
      level: 'neutral',
      description: `Currency moderately overvalued by ${pppDev.toFixed(1)}% vs PPP`,
    };
  } else if (pppDev < -20) {
    return {
      value: pppDev,
      level: 'positive',
      description: `Currency significantly undervalued by ${Math.abs(pppDev).toFixed(1)}% vs PPP`,
    };
  } else if (pppDev < -10) {
    return {
      value: pppDev,
      level: 'neutral',
      description: `Currency moderately undervalued by ${Math.abs(pppDev).toFixed(1)}% vs PPP`,
    };
  } else {
    return {
      value: pppDev,
      level: 'positive',
      description: `Currency fairly valued with ${pppDev.toFixed(1)}% deviation from PPP`,
    };
  }
}

/**
 * Interpret Trade Balance
 */
export function interpretTradeBalance(balance: number | null): TradeFXInterpretation {
  if (balance == null) {
    return { value: null, level: 'neutral', description: 'Trade Balance data unavailable' };
  }
  
  if (balance > 0) {
    return {
      value: balance,
      level: 'positive',
      description: `Trade surplus of $${(balance / 1e9).toFixed(1)}B`,
    };
  } else if (balance < 0) {
    return {
      value: balance,
      level: 'negative',
      description: `Trade deficit of $${(Math.abs(balance) / 1e9).toFixed(1)}B`,
    };
  } else {
    return {
      value: balance,
      level: 'neutral',
      description: 'Balanced trade',
    };
  }
}
