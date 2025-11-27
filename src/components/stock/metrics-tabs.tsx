'use client';

import { useState, useEffect, useRef } from 'react';
import {
  LayoutGrid,
  DollarSign,
  TrendingUp,
  Activity,
  Brain,
  Droplets,
  Scale,
  Zap,
  PiggyBank,
  GitBranch,
  Sprout,
  Wallet,
  Calculator,
  Shield,
  BarChart3,
  Target,
  Sparkles,
  Globe,
} from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';
import { MetricCard, ScoreCard } from './metric-card';
import type { MetricsTabsProps, MetricsTabValue, MetricItem } from './types';
import type { AllMetrics } from '../../../lib/metrics/types';

// Tab configuration
const TABS: { value: MetricsTabValue; label: string; icon: typeof LayoutGrid }[] = [
  { value: 'overview', label: 'Overview', icon: LayoutGrid },
  { value: 'financials', label: 'Financials', icon: DollarSign },
  { value: 'valuation', label: 'Valuation', icon: TrendingUp },
  { value: 'economy', label: 'Economy', icon: Globe },
  { value: 'technical', label: 'Technical', icon: Activity },
  { value: 'ai', label: 'AI Analysis', icon: Brain },
];

// Helper to determine metric status
function getMetricStatus(value: number | null, thresholds: { good: number; bad: number }, inverse = false): 'positive' | 'negative' | 'neutral' {
  if (value === null) return 'neutral';
  if (inverse) {
    if (value <= thresholds.good) return 'positive';
    if (value >= thresholds.bad) return 'negative';
  } else {
    if (value >= thresholds.good) return 'positive';
    if (value <= thresholds.bad) return 'negative';
  }
  return 'neutral';
}

// ============================================================================
// OVERVIEW TAB
// ============================================================================

function OverviewTab({ metrics }: { metrics: AllMetrics }) {
  const { scores, valuation, profitability, growth, leverage, liquidity } = metrics;

  return (
    <div className="space-y-7">
      {/* Score Cards Row - with stagger animation */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-5">
        <div style={{ animationDelay: '0ms' }} className="animate-fade-up">
          <ScoreCard
            title="Overall"
            score={scores.totalScore}
            icon={<Target className="h-4 w-4" />}
            description="Composite score"
          />
        </div>
        <div style={{ animationDelay: '50ms' }} className="animate-fade-up">
          <ScoreCard
            title="Profitability"
            score={scores.profitabilityScore}
            icon={<PiggyBank className="h-4 w-4" />}
          />
        </div>
        <div style={{ animationDelay: '100ms' }} className="animate-fade-up">
          <ScoreCard
            title="Growth"
            score={scores.growthScore}
            icon={<Sprout className="h-4 w-4" />}
          />
        </div>
        <div style={{ animationDelay: '150ms' }} className="animate-fade-up">
          <ScoreCard
            title="Valuation"
            score={scores.valuationScore}
            icon={<Calculator className="h-4 w-4" />}
          />
        </div>
        <div style={{ animationDelay: '200ms' }} className="animate-fade-up">
          <ScoreCard
            title="Risk"
            score={scores.riskScore}
            icon={<Shield className="h-4 w-4" />}
          />
        </div>
        <div style={{ animationDelay: '250ms' }} className="animate-fade-up">
          <ScoreCard
            title="Health"
            score={scores.healthScore}
            icon={<Activity className="h-4 w-4" />}
          />
        </div>
      </div>

      {/* Key Metrics Grid - with stagger animation */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {/* Valuation Snapshot */}
        <MetricCard
          title="Valuation"
          description="Price multiples"
          icon={<TrendingUp className="h-5 w-5" />}
          metrics={[
            {
              label: 'P/E Ratio',
              value: valuation.peRatio,
              format: 'ratio',
              status: getMetricStatus(valuation.peRatio, { good: 15, bad: 30 }, true),
              tooltip: 'Price to Earnings ratio - lower is generally better',
            },
            {
              label: 'Forward P/E',
              value: valuation.forwardPE,
              format: 'ratio',
              status: getMetricStatus(valuation.forwardPE, { good: 12, bad: 25 }, true),
            },
            {
              label: 'P/B Ratio',
              value: valuation.pbRatio,
              format: 'ratio',
              status: getMetricStatus(valuation.pbRatio, { good: 3, bad: 10 }, true),
            },
            {
              label: 'EV/EBITDA',
              value: valuation.evToEBITDA,
              format: 'ratio',
              status: getMetricStatus(valuation.evToEBITDA, { good: 10, bad: 20 }, true),
            },
          ]}
        />

        {/* Profitability Snapshot */}
        <MetricCard
          title="Profitability"
          description="Margin analysis"
          icon={<PiggyBank className="h-5 w-5" />}
          metrics={[
            {
              label: 'Gross Margin',
              value: profitability.grossProfitMargin,
              format: 'percent',
              status: getMetricStatus(profitability.grossProfitMargin, { good: 0.4, bad: 0.2 }),
            },
            {
              label: 'Operating Margin',
              value: profitability.operatingProfitMargin,
              format: 'percent',
              status: getMetricStatus(profitability.operatingProfitMargin, { good: 0.2, bad: 0.05 }),
            },
            {
              label: 'Net Margin',
              value: profitability.netProfitMargin,
              format: 'percent',
              status: getMetricStatus(profitability.netProfitMargin, { good: 0.15, bad: 0.03 }),
            },
            {
              label: 'ROE',
              value: profitability.roe,
              format: 'percent',
              status: getMetricStatus(profitability.roe, { good: 0.15, bad: 0.05 }),
              tooltip: 'Return on Equity - measures profitability relative to shareholders equity',
            },
          ]}
        />

        {/* Growth Snapshot */}
        <MetricCard
          title="Growth"
          description="YoY performance"
          icon={<Sprout className="h-5 w-5" />}
          metrics={[
            {
              label: 'Revenue Growth',
              value: growth.revenueGrowthYoY,
              format: 'percent',
              status: getMetricStatus(growth.revenueGrowthYoY, { good: 0.1, bad: -0.05 }),
            },
            {
              label: 'EPS Growth',
              value: growth.epsGrowthYoY,
              format: 'percent',
              status: getMetricStatus(growth.epsGrowthYoY, { good: 0.1, bad: -0.1 }),
            },
            {
              label: 'Revenue 3Y CAGR',
              value: growth.revenue3YearCAGR,
              format: 'percent',
              status: getMetricStatus(growth.revenue3YearCAGR, { good: 0.08, bad: 0 }),
            },
            {
              label: 'Revenue 5Y CAGR',
              value: growth.revenue5YearCAGR,
              format: 'percent',
              status: getMetricStatus(growth.revenue5YearCAGR, { good: 0.08, bad: 0 }),
            },
          ]}
        />

        {/* Leverage */}
        <MetricCard
          title="Leverage"
          description="Debt analysis"
          icon={<Scale className="h-5 w-5" />}
          metrics={[
            {
              label: 'Debt to Equity',
              value: leverage.debtToEquity,
              format: 'ratio',
              status: getMetricStatus(leverage.debtToEquity, { good: 0.5, bad: 2 }, true),
            },
            {
              label: 'Debt to Assets',
              value: leverage.debtToAssets,
              format: 'percent',
              status: getMetricStatus(leverage.debtToAssets, { good: 0.3, bad: 0.6 }, true),
            },
            {
              label: 'Interest Coverage',
              value: leverage.interestCoverage,
              format: 'ratio',
              status: getMetricStatus(leverage.interestCoverage, { good: 5, bad: 1.5 }),
              tooltip: 'Higher is better - shows ability to pay interest on debt',
            },
            {
              label: 'Debt/EBITDA',
              value: leverage.debtToEBITDA,
              format: 'ratio',
              status: getMetricStatus(leverage.debtToEBITDA, { good: 2, bad: 5 }, true),
            },
          ]}
        />

        {/* Liquidity */}
        <MetricCard
          title="Liquidity"
          description="Short-term health"
          icon={<Droplets className="h-5 w-5" />}
          metrics={[
            {
              label: 'Current Ratio',
              value: liquidity.currentRatio,
              format: 'ratio',
              status: getMetricStatus(liquidity.currentRatio, { good: 2, bad: 1 }),
            },
            {
              label: 'Quick Ratio',
              value: liquidity.quickRatio,
              format: 'ratio',
              status: getMetricStatus(liquidity.quickRatio, { good: 1, bad: 0.5 }),
            },
            {
              label: 'Cash Ratio',
              value: liquidity.cashRatio,
              format: 'ratio',
              status: getMetricStatus(liquidity.cashRatio, { good: 0.5, bad: 0.2 }),
            },
            {
              label: 'Cash Conversion',
              value: liquidity.cashConversionCycle,
              format: 'number',
              status: getMetricStatus(liquidity.cashConversionCycle, { good: 30, bad: 90 }, true),
              tooltip: 'Days to convert investments to cash - lower is better',
            },
          ]}
        />

        {/* Returns */}
        <MetricCard
          title="Returns"
          description="Capital efficiency"
          icon={<Zap className="h-5 w-5" />}
          metrics={[
            {
              label: 'ROA',
              value: profitability.roa,
              format: 'percent',
              status: getMetricStatus(profitability.roa, { good: 0.1, bad: 0.02 }),
            },
            {
              label: 'ROE',
              value: profitability.roe,
              format: 'percent',
              status: getMetricStatus(profitability.roe, { good: 0.15, bad: 0.05 }),
            },
            {
              label: 'ROIC',
              value: profitability.roic,
              format: 'percent',
              status: getMetricStatus(profitability.roic, { good: 0.12, bad: 0.05 }),
              tooltip: 'Return on Invested Capital - key metric for value creation',
            },
            {
              label: 'NOPLAT',
              value: profitability.noplat,
              format: 'currency',
            },
          ]}
        />
      </div>
    </div>
  );
}

// ============================================================================
// FINANCIALS TAB
// ============================================================================

function FinancialsTab({ metrics }: { metrics: AllMetrics }) {
  const { profitability, efficiency, cashFlow, dupont, other } = metrics;

  return (
    <div className="space-y-7">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {/* Profitability */}
        <MetricCard
          title="Profitability Ratios"
          description="Margin analysis"
          icon={<PiggyBank className="h-5 w-5" />}
          metrics={[
            { label: 'Gross Margin', value: profitability.grossProfitMargin, format: 'percent', status: getMetricStatus(profitability.grossProfitMargin, { good: 0.4, bad: 0.2 }) },
            { label: 'Operating Margin', value: profitability.operatingProfitMargin, format: 'percent', status: getMetricStatus(profitability.operatingProfitMargin, { good: 0.2, bad: 0.05 }) },
            { label: 'EBITDA Margin', value: profitability.ebitdaMargin, format: 'percent', status: getMetricStatus(profitability.ebitdaMargin, { good: 0.25, bad: 0.1 }) },
            { label: 'Net Profit Margin', value: profitability.netProfitMargin, format: 'percent', status: getMetricStatus(profitability.netProfitMargin, { good: 0.15, bad: 0.03 }) },
            { label: 'ROA', value: profitability.roa, format: 'percent', status: getMetricStatus(profitability.roa, { good: 0.1, bad: 0.02 }) },
            { label: 'ROE', value: profitability.roe, format: 'percent', status: getMetricStatus(profitability.roe, { good: 0.15, bad: 0.05 }) },
            { label: 'ROIC', value: profitability.roic, format: 'percent', status: getMetricStatus(profitability.roic, { good: 0.12, bad: 0.05 }) },
            { label: 'NOPLAT', value: profitability.noplat, format: 'currency' },
          ]}
        />

        {/* Efficiency */}
        <MetricCard
          title="Efficiency Ratios"
          description="Asset utilization"
          icon={<Zap className="h-5 w-5" />}
          metrics={[
            { label: 'Asset Turnover', value: efficiency.totalAssetTurnover, format: 'ratio', status: getMetricStatus(efficiency.totalAssetTurnover, { good: 1, bad: 0.3 }) },
            { label: 'Fixed Asset Turnover', value: efficiency.fixedAssetTurnover, format: 'ratio' },
            { label: 'Inventory Turnover', value: efficiency.inventoryTurnover, format: 'ratio', status: getMetricStatus(efficiency.inventoryTurnover, { good: 8, bad: 3 }) },
            { label: 'Receivables Turnover', value: efficiency.receivablesTurnover, format: 'ratio' },
            { label: 'Payables Turnover', value: efficiency.payablesTurnover, format: 'ratio' },
            { label: 'Working Capital Turnover', value: efficiency.workingCapitalTurnover, format: 'ratio' },
          ]}
        />

        {/* Cash Flow */}
        <MetricCard
          title="Cash Flow"
          description="Cash generation"
          icon={<Wallet className="h-5 w-5" />}
          metrics={[
            { label: 'Operating Cash Flow', value: cashFlow.operatingCashFlow, format: 'currency' },
            { label: 'Free Cash Flow', value: cashFlow.freeCashFlow, format: 'currency', status: getMetricStatus(cashFlow.freeCashFlow, { good: 0, bad: -1000000 }) },
            { label: 'FCFF', value: cashFlow.fcff, format: 'currency', tooltip: 'Free Cash Flow to Firm' },
            { label: 'FCFE', value: cashFlow.fcfe, format: 'currency', tooltip: 'Free Cash Flow to Equity' },
            { label: 'Cash Flow Adequacy', value: cashFlow.cashFlowAdequacy, format: 'ratio' },
            { label: 'Reinvestment Ratio', value: cashFlow.cashReinvestmentRatio, format: 'percent' },
          ]}
        />

        {/* DuPont Analysis */}
        <MetricCard
          title="DuPont Analysis"
          description="ROE breakdown"
          icon={<GitBranch className="h-5 w-5" />}
          metrics={[
            { label: 'Net Profit Margin', value: dupont.netProfitMargin, format: 'percent' },
            { label: 'Asset Turnover', value: dupont.assetTurnover, format: 'ratio' },
            { label: 'Equity Multiplier', value: dupont.equityMultiplier, format: 'ratio' },
            { label: 'ROE (DuPont)', value: dupont.roeDupont, format: 'percent', tooltip: 'NPM × Asset Turnover × Equity Multiplier' },
            { label: 'Interest Burden', value: dupont.interestBurden, format: 'percent', tooltip: 'EBT / EBIT' },
            { label: 'Tax Burden', value: dupont.taxBurden, format: 'percent', tooltip: 'Net Income / EBT' },
          ]}
        />

        {/* Other Metrics */}
        <MetricCard
          title="Other Metrics"
          description="Additional analysis"
          icon={<BarChart3 className="h-5 w-5" />}
          metrics={[
            { label: 'Effective Tax Rate', value: other.effectiveTaxRate, format: 'percent' },
            { label: 'Working Capital', value: other.workingCapital, format: 'currency' },
            { label: 'Book Value/Share', value: other.bookValuePerShare, format: 'currency' },
            { label: 'Sales/Share', value: other.salesPerShare, format: 'currency' },
            { label: 'Cash Flow/Share', value: other.cashFlowPerShare, format: 'currency' },
            { label: 'Altman Z-Score', value: other.altmanZScore, format: 'number', status: getMetricStatus(other.altmanZScore, { good: 3, bad: 1.8 }), tooltip: '>3 = Safe, 1.8-3 = Grey, <1.8 = Distress' },
            { label: 'Piotroski F-Score', value: other.piotroskiFScore, format: 'score', status: getMetricStatus(other.piotroskiFScore, { good: 7, bad: 3 }), tooltip: '0-9 scale, higher is better' },
          ]}
        />

        {/* Growth Metrics Full */}
        <MetricCard
          title="Growth Metrics"
          description="Historical performance"
          icon={<Sprout className="h-5 w-5" />}
          metrics={[
            { label: 'Revenue YoY', value: metrics.growth.revenueGrowthYoY, format: 'percent', status: getMetricStatus(metrics.growth.revenueGrowthYoY, { good: 0.1, bad: -0.05 }) },
            { label: 'EPS YoY', value: metrics.growth.epsGrowthYoY, format: 'percent', status: getMetricStatus(metrics.growth.epsGrowthYoY, { good: 0.1, bad: -0.1 }) },
            { label: 'Dividend Growth', value: metrics.growth.dpsGrowth, format: 'percent' },
            { label: 'FCF Growth', value: metrics.growth.fcfGrowth, format: 'percent' },
            { label: 'Revenue 3Y CAGR', value: metrics.growth.revenue3YearCAGR, format: 'percent' },
            { label: 'Revenue 5Y CAGR', value: metrics.growth.revenue5YearCAGR, format: 'percent' },
            { label: 'Sustainable Growth', value: metrics.growth.sustainableGrowthRate, format: 'percent', tooltip: 'ROE × Retention Ratio' },
            { label: 'Payout Ratio', value: metrics.growth.payoutRatio, format: 'percent' },
          ]}
        />
      </div>
    </div>
  );
}

// ============================================================================
// VALUATION TAB
// ============================================================================

function ValuationTab({ metrics }: { metrics: AllMetrics }) {
  const { valuation, dcf, leverage, liquidity } = metrics;

  return (
    <div className="space-y-7">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {/* Price Multiples */}
        <MetricCard
          title="Price Multiples"
          description="Relative valuation"
          icon={<Calculator className="h-5 w-5" />}
          metrics={[
            { label: 'P/E Ratio', value: valuation.peRatio, format: 'ratio', status: getMetricStatus(valuation.peRatio, { good: 15, bad: 30 }, true) },
            { label: 'Forward P/E', value: valuation.forwardPE, format: 'ratio', status: getMetricStatus(valuation.forwardPE, { good: 12, bad: 25 }, true) },
            { label: 'Justified P/E', value: valuation.justifiedPE, format: 'ratio', tooltip: 'Fair P/E based on fundamentals' },
            { label: 'P/B Ratio', value: valuation.pbRatio, format: 'ratio', status: getMetricStatus(valuation.pbRatio, { good: 3, bad: 10 }, true) },
            { label: 'Justified P/B', value: valuation.justifiedPB, format: 'ratio' },
            { label: 'P/S Ratio', value: valuation.psRatio, format: 'ratio', status: getMetricStatus(valuation.psRatio, { good: 2, bad: 8 }, true) },
            { label: 'P/CF Ratio', value: valuation.pcfRatio, format: 'ratio' },
            { label: 'PEG Ratio', value: valuation.pegRatio, format: 'ratio', status: getMetricStatus(valuation.pegRatio, { good: 1, bad: 2 }, true), tooltip: 'P/E divided by growth rate' },
          ]}
        />

        {/* Enterprise Value */}
        <MetricCard
          title="Enterprise Value"
          description="EV multiples"
          icon={<TrendingUp className="h-5 w-5" />}
          metrics={[
            { label: 'Enterprise Value', value: valuation.ev, format: 'currency' },
            { label: 'EV/EBITDA', value: valuation.evToEBITDA, format: 'ratio', status: getMetricStatus(valuation.evToEBITDA, { good: 10, bad: 20 }, true) },
            { label: 'EV/Sales', value: valuation.evToSales, format: 'ratio' },
            { label: 'EV/EBIT', value: valuation.evToEBIT, format: 'ratio' },
            { label: 'Dividend Yield', value: valuation.dividendYield, format: 'percent', status: getMetricStatus(valuation.dividendYield, { good: 0.03, bad: 0 }) },
            { label: 'Earnings Yield', value: valuation.earningsYield, format: 'percent', tooltip: 'Inverse of P/E ratio' },
          ]}
        />

        {/* DCF Valuation */}
        <MetricCard
          title="DCF Valuation"
          description="Intrinsic value"
          icon={<Target className="h-5 w-5" />}
          metrics={[
            { label: 'Risk-Free Rate', value: dcf.riskFreeRate, format: 'percent' },
            { label: 'Market Risk Premium', value: dcf.marketRiskPremium, format: 'percent' },
            { label: 'Beta', value: dcf.beta, format: 'number' },
            { label: 'Cost of Equity', value: dcf.costOfEquity, format: 'percent', tooltip: 'Re = Rf + β(Rm - Rf)' },
            { label: 'Cost of Debt', value: dcf.costOfDebt, format: 'percent' },
            { label: 'WACC', value: dcf.wacc, format: 'percent', tooltip: 'Weighted Average Cost of Capital' },
            { label: 'Terminal Value', value: dcf.terminalValue, format: 'currency' },
            { label: 'Intrinsic Value', value: dcf.intrinsicValue, format: 'currency', status: getMetricStatus(dcf.upsideDownside, { good: 0.1, bad: -0.1 }) },
            { label: 'Target Price', value: dcf.targetPrice, format: 'currency' },
            { label: 'Upside/Downside', value: dcf.upsideDownside, format: 'percent', status: getMetricStatus(dcf.upsideDownside, { good: 0.1, bad: -0.1 }) },
          ]}
        />

        {/* Leverage Full */}
        <MetricCard
          title="Leverage Ratios"
          description="Debt analysis"
          icon={<Scale className="h-5 w-5" />}
          metrics={[
            { label: 'Debt to Assets', value: leverage.debtToAssets, format: 'percent', status: getMetricStatus(leverage.debtToAssets, { good: 0.3, bad: 0.6 }, true) },
            { label: 'Debt to Equity', value: leverage.debtToEquity, format: 'ratio', status: getMetricStatus(leverage.debtToEquity, { good: 0.5, bad: 2 }, true) },
            { label: 'Financial D/E', value: leverage.financialDebtToEquity, format: 'ratio' },
            { label: 'Interest Coverage', value: leverage.interestCoverage, format: 'ratio', status: getMetricStatus(leverage.interestCoverage, { good: 5, bad: 1.5 }) },
            { label: 'Debt Service Coverage', value: leverage.debtServiceCoverage, format: 'ratio' },
            { label: 'Equity Multiplier', value: leverage.equityMultiplier, format: 'ratio' },
            { label: 'Debt/EBITDA', value: leverage.debtToEBITDA, format: 'ratio', status: getMetricStatus(leverage.debtToEBITDA, { good: 2, bad: 5 }, true) },
          ]}
        />

        {/* Liquidity Full */}
        <MetricCard
          title="Liquidity Ratios"
          description="Short-term health"
          icon={<Droplets className="h-5 w-5" />}
          metrics={[
            { label: 'Current Ratio', value: liquidity.currentRatio, format: 'ratio', status: getMetricStatus(liquidity.currentRatio, { good: 2, bad: 1 }) },
            { label: 'Quick Ratio', value: liquidity.quickRatio, format: 'ratio', status: getMetricStatus(liquidity.quickRatio, { good: 1, bad: 0.5 }) },
            { label: 'Cash Ratio', value: liquidity.cashRatio, format: 'ratio', status: getMetricStatus(liquidity.cashRatio, { good: 0.5, bad: 0.2 }) },
            { label: 'Days Sales Outstanding', value: liquidity.daysSalesOutstanding, format: 'number' },
            { label: 'Days Inventory', value: liquidity.daysInventoryOutstanding, format: 'number' },
            { label: 'Days Payables', value: liquidity.daysPayablesOutstanding, format: 'number' },
            { label: 'Cash Conversion Cycle', value: liquidity.cashConversionCycle, format: 'number', status: getMetricStatus(liquidity.cashConversionCycle, { good: 30, bad: 90 }, true) },
          ]}
        />
      </div>
    </div>
  );
}

// ============================================================================
// ECONOMY TAB
// ============================================================================

function EconomyTab({ metrics }: { metrics: AllMetrics }) {
  const { macro, industry } = metrics;

  return (
    <div className="space-y-7">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {/* GDP & Growth */}
        <MetricCard
          title="GDP & Economic Growth"
          description="National output"
          icon={<Globe className="h-5 w-5" />}
          metrics={[
            { label: 'GDP Growth Rate', value: macro.gdpGrowthRate, format: 'percent', status: getMetricStatus(macro.gdpGrowthRate, { good: 3, bad: 0 }) },
            { label: 'Real GDP', value: macro.realGDP ? macro.realGDP * 1e9 : null, format: 'currency', tooltip: 'Inflation-adjusted GDP' },
            { label: 'Nominal GDP', value: macro.nominalGDP ? macro.nominalGDP * 1e9 : null, format: 'currency' },
            { label: 'GDP Per Capita', value: macro.gdpPerCapita, format: 'currency' },
          ]}
        />

        {/* Inflation */}
        <MetricCard
          title="Inflation & Prices"
          description="Price stability"
          icon={<TrendingUp className="h-5 w-5" />}
          metrics={[
            { label: 'CPI', value: macro.cpi, format: 'number', tooltip: 'Consumer Price Index' },
            { label: 'PPI', value: macro.ppi, format: 'number', tooltip: 'Producer Price Index' },
            { label: 'Core Inflation', value: macro.coreInflation, format: 'number', tooltip: 'Excluding food & energy' },
          ]}
        />

        {/* Interest Rates */}
        <MetricCard
          title="Interest Rates"
          description="Monetary policy"
          icon={<DollarSign className="h-5 w-5" />}
          metrics={[
            { label: 'Fed Funds Rate', value: macro.federalFundsRate, format: 'percent', status: getMetricStatus(macro.federalFundsRate, { good: 2, bad: 5 }, true) },
            { label: '10Y Treasury', value: macro.treasury10Y, format: 'percent' },
            { label: 'USD Index', value: macro.usdIndex, format: 'number', tooltip: 'Trade-weighted dollar index' },
          ]}
        />

        {/* Labor Market */}
        <MetricCard
          title="Labor Market"
          description="Employment indicators"
          icon={<Activity className="h-5 w-5" />}
          metrics={[
            { label: 'Unemployment Rate', value: macro.unemploymentRate, format: 'percent', status: getMetricStatus(macro.unemploymentRate, { good: 4, bad: 7 }, true) },
            { label: 'Wage Growth', value: macro.wageGrowth, format: 'currency', tooltip: 'Average hourly earnings' },
            { label: 'Labor Productivity', value: macro.laborProductivity, format: 'number' },
          ]}
        />

        {/* Sentiment */}
        <MetricCard
          title="Economic Sentiment"
          description="Confidence indicators"
          icon={<Sparkles className="h-5 w-5" />}
          metrics={[
            { label: 'Consumer Confidence', value: macro.consumerConfidence, format: 'number', status: getMetricStatus(macro.consumerConfidence, { good: 80, bad: 60 }) },
            { label: 'Business Confidence', value: macro.businessConfidence, format: 'number', status: getMetricStatus(macro.businessConfidence, { good: 100, bad: 95 }) },
          ]}
        />

        {/* Industry Metrics */}
        <MetricCard
          title="Industry Analysis"
          description="Sector positioning"
          icon={<BarChart3 className="h-5 w-5" />}
          metrics={[
            { label: 'Industry Growth', value: industry.industryGrowthRate, format: 'percent' },
            { label: 'Market Size', value: industry.marketSize, format: 'currency' },
            { label: 'Market Share', value: industry.marketShare, format: 'percent' },
            { label: 'HHI Index', value: industry.hhiIndex, format: 'number', tooltip: 'Market concentration (0-10000)' },
            { label: 'CR4', value: industry.cr4, format: 'percent', tooltip: 'Top 4 firms concentration' },
          ]}
        />
      </div>
    </div>
  );
}

// ============================================================================
// TECHNICAL TAB
// ============================================================================

function TechnicalTab({ metrics }: { metrics: AllMetrics }) {
  const { technical, risk } = metrics;

  return (
    <div className="space-y-7">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {/* Technical Indicators */}
        <MetricCard
          title="Technical Indicators"
          description="Price momentum"
          icon={<Activity className="h-5 w-5" />}
          metrics={[
            { label: 'RSI (14)', value: technical.rsi, format: 'number', status: technical.rsi ? (technical.rsi > 70 ? 'negative' : technical.rsi < 30 ? 'positive' : 'neutral') : 'neutral', tooltip: '>70 = Overbought, <30 = Oversold' },
            { label: 'MACD', value: technical.macd, format: 'number' },
            { label: 'MACD Signal', value: technical.macdSignal, format: 'number' },
            { label: '50 Day MA', value: technical.fiftyDayMA, format: 'currency' },
            { label: '200 Day MA', value: technical.twoHundredDayMA, format: 'currency' },
            { label: 'Relative Volume', value: technical.relativeVolume, format: 'ratio', tooltip: 'Current volume vs average' },
          ]}
        />

        {/* Bollinger Bands */}
        <MetricCard
          title="Bollinger Bands"
          description="Volatility bands"
          icon={<BarChart3 className="h-5 w-5" />}
          metrics={[
            { label: 'Upper Band', value: technical.bollingerUpper, format: 'currency' },
            { label: 'Lower Band', value: technical.bollingerLower, format: 'currency' },
            { label: 'Band Width', value: technical.bollingerUpper && technical.bollingerLower ? technical.bollingerUpper - technical.bollingerLower : null, format: 'currency' },
          ]}
        />

        {/* Risk Metrics */}
        <MetricCard
          title="Risk Metrics"
          description="Volatility analysis"
          icon={<Shield className="h-5 w-5" />}
          metrics={[
            { label: 'Beta', value: risk.beta, format: 'number', status: risk.beta ? (Math.abs(risk.beta) > 1.5 ? 'negative' : 'positive') : 'neutral', tooltip: '>1 = More volatile than market' },
            { label: 'Std Deviation', value: risk.standardDeviation, format: 'percent' },
            { label: 'Alpha', value: risk.alpha, format: 'percent', status: getMetricStatus(risk.alpha, { good: 0.05, bad: -0.05 }), tooltip: 'Excess return vs benchmark' },
            { label: 'Sharpe Ratio', value: risk.sharpeRatio, format: 'number', status: getMetricStatus(risk.sharpeRatio, { good: 1, bad: 0 }), tooltip: 'Risk-adjusted return' },
            { label: 'Sortino Ratio', value: risk.sortinoRatio, format: 'number', status: getMetricStatus(risk.sortinoRatio, { good: 1.5, bad: 0 }) },
            { label: 'Max Drawdown', value: risk.maxDrawdown, format: 'percent', status: getMetricStatus(risk.maxDrawdown, { good: -0.1, bad: -0.3 }) },
            { label: 'VaR (95%)', value: risk.var95, format: 'percent', tooltip: 'Maximum expected loss at 95% confidence' },
          ]}
        />
      </div>
    </div>
  );
}

// ============================================================================
// AI ANALYSIS TAB
// ============================================================================

function AIAnalysisTab({ metrics, symbol }: { metrics: AllMetrics; symbol: string }) {
  const { scores } = metrics;

  // Generate AI insights based on metrics
  const insights = generateInsights(metrics);

  return (
    <div className="space-y-7">
      {/* AI Summary - Premium Glass Card */}
      <div className="relative overflow-hidden rounded-2xl p-7 glass-premium animate-fade-up">
        {/* Gradient accent */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-violet-500/10 to-transparent pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-gradient-to-tr from-cyan-500/5 to-transparent pointer-events-none" />
        
        <div className="relative flex items-center gap-4 mb-6">
          <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-violet-500/30 to-purple-600/20 border border-violet-500/30 flex items-center justify-center shadow-lg shadow-violet-500/10">
            <Brain className="h-6 w-6 text-violet-400" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white neon-underline pb-1">AI Analysis</h3>
            <p className="text-sm text-gray-500">Powered by Deep Terminal AI</p>
          </div>
        </div>

        <div className="relative space-y-4">
          {insights.map((insight, index) => (
            <div
              key={index}
              className={cn(
                'relative overflow-hidden p-5 rounded-xl border transition-all duration-300 animate-fade-up',
                'hover:scale-[1.01] hover:shadow-lg',
                insight.type === 'positive' && 'bg-[#3FE3C2]/5 border-[#3FE3C2]/20 hover:border-[#3FE3C2]/40',
                insight.type === 'negative' && 'bg-red-500/5 border-red-500/20 hover:border-red-500/40',
                insight.type === 'neutral' && 'bg-cyan-500/5 border-cyan-500/20 hover:border-cyan-500/40'
              )}
              style={{ animationDelay: `${index * 80}ms` }}
            >
              {/* Subtle corner glow */}
              <div className={cn(
                'absolute top-0 right-0 w-20 h-20 rounded-full blur-2xl opacity-30',
                insight.type === 'positive' && 'bg-[#3FE3C2]',
                insight.type === 'negative' && 'bg-red-500',
                insight.type === 'neutral' && 'bg-cyan-500'
              )} />
              
              <div className="relative flex items-start gap-4">
                <div className={cn(
                  'flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center',
                  insight.type === 'positive' && 'bg-[#3FE3C2]/20',
                  insight.type === 'negative' && 'bg-red-500/20',
                  insight.type === 'neutral' && 'bg-cyan-500/20'
                )}>
                  <Sparkles
                    className={cn(
                      'h-4 w-4',
                      insight.type === 'positive' && 'text-[#3FE3C2]',
                      insight.type === 'negative' && 'text-red-400',
                      insight.type === 'neutral' && 'text-cyan-400'
                    )}
                  />
                </div>
                <div>
                  <h4 className={cn(
                    'font-semibold mb-1.5',
                    insight.type === 'positive' && 'text-[#3FE3C2]',
                    insight.type === 'negative' && 'text-red-400',
                    insight.type === 'neutral' && 'text-cyan-400'
                  )}>
                    {insight.title}
                  </h4>
                  <p className="text-sm text-gray-400 leading-relaxed">{insight.description}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Score Summary - with stagger animation */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-5">
        <div style={{ animationDelay: '0ms' }} className="animate-fade-up">
          <ScoreCard title="Overall" score={scores.totalScore} icon={<Target className="h-4 w-4" />} />
        </div>
        <div style={{ animationDelay: '50ms' }} className="animate-fade-up">
          <ScoreCard title="Profitability" score={scores.profitabilityScore} icon={<PiggyBank className="h-4 w-4" />} />
        </div>
        <div style={{ animationDelay: '100ms' }} className="animate-fade-up">
          <ScoreCard title="Growth" score={scores.growthScore} icon={<Sprout className="h-4 w-4" />} />
        </div>
        <div style={{ animationDelay: '150ms' }} className="animate-fade-up">
          <ScoreCard title="Valuation" score={scores.valuationScore} icon={<Calculator className="h-4 w-4" />} />
        </div>
        <div style={{ animationDelay: '200ms' }} className="animate-fade-up">
          <ScoreCard title="Risk" score={scores.riskScore} icon={<Shield className="h-4 w-4" />} />
        </div>
        <div style={{ animationDelay: '250ms' }} className="animate-fade-up">
          <ScoreCard title="Health" score={scores.healthScore} icon={<Activity className="h-4 w-4" />} />
        </div>
      </div>
    </div>
  );
}

// Generate AI insights based on metrics
function generateInsights(metrics: AllMetrics): Array<{ title: string; description: string; type: 'positive' | 'negative' | 'neutral' }> {
  const insights: Array<{ title: string; description: string; type: 'positive' | 'negative' | 'neutral' }> = [];
  const { valuation, profitability, growth, leverage, liquidity, dcf, scores } = metrics;

  // Valuation insight
  if (dcf.upsideDownside !== null) {
    if (dcf.upsideDownside > 0.15) {
      insights.push({
        title: 'Potentially Undervalued',
        description: `Based on DCF analysis, the stock appears to be trading ${(dcf.upsideDownside * 100).toFixed(1)}% below its intrinsic value. This may present a buying opportunity for value investors.`,
        type: 'positive',
      });
    } else if (dcf.upsideDownside < -0.15) {
      insights.push({
        title: 'Potentially Overvalued',
        description: `DCF analysis suggests the stock may be trading ${(Math.abs(dcf.upsideDownside) * 100).toFixed(1)}% above its intrinsic value. Consider waiting for a better entry point.`,
        type: 'negative',
      });
    }
  }

  // Profitability insight
  if (profitability.roe !== null && profitability.roe > 0.2) {
    insights.push({
      title: 'Strong Return on Equity',
      description: `ROE of ${(profitability.roe * 100).toFixed(1)}% indicates exceptional management efficiency in generating returns for shareholders.`,
      type: 'positive',
    });
  } else if (profitability.roe !== null && profitability.roe < 0.05) {
    insights.push({
      title: 'Low Return on Equity',
      description: `ROE of ${(profitability.roe * 100).toFixed(1)}% is below industry average. The company may be struggling to generate adequate returns on shareholder capital.`,
      type: 'negative',
    });
  }

  // Growth insight
  if (growth.revenue3YearCAGR !== null) {
    if (growth.revenue3YearCAGR > 0.15) {
      insights.push({
        title: 'High Growth Trajectory',
        description: `3-year revenue CAGR of ${(growth.revenue3YearCAGR * 100).toFixed(1)}% demonstrates strong and consistent revenue growth.`,
        type: 'positive',
      });
    } else if (growth.revenue3YearCAGR < 0) {
      insights.push({
        title: 'Declining Revenue',
        description: `3-year revenue CAGR of ${(growth.revenue3YearCAGR * 100).toFixed(1)}% indicates revenue contraction. Investigate underlying causes.`,
        type: 'negative',
      });
    }
  }

  // Leverage insight
  if (leverage.debtToEquity !== null && leverage.debtToEquity > 2) {
    insights.push({
      title: 'High Debt Levels',
      description: `Debt-to-equity ratio of ${leverage.debtToEquity.toFixed(2)}x is elevated. This increases financial risk, especially in rising rate environments.`,
      type: 'negative',
    });
  } else if (leverage.debtToEquity !== null && leverage.debtToEquity < 0.3) {
    insights.push({
      title: 'Conservative Capital Structure',
      description: `Low debt-to-equity of ${leverage.debtToEquity.toFixed(2)}x provides financial flexibility and lower risk.`,
      type: 'positive',
    });
  }

  // Liquidity insight
  if (liquidity.currentRatio !== null && liquidity.currentRatio < 1) {
    insights.push({
      title: 'Liquidity Concern',
      description: `Current ratio below 1 (${liquidity.currentRatio.toFixed(2)}x) may indicate difficulty meeting short-term obligations.`,
      type: 'negative',
    });
  }

  // Overall score insight
  if (scores.totalScore !== null) {
    if (scores.totalScore >= 75) {
      insights.push({
        title: 'Strong Overall Profile',
        description: `Composite score of ${scores.totalScore}/100 indicates a fundamentally strong company across multiple dimensions.`,
        type: 'positive',
      });
    } else if (scores.totalScore < 40) {
      insights.push({
        title: 'Weak Fundamentals',
        description: `Composite score of ${scores.totalScore}/100 suggests significant weaknesses that warrant careful analysis before investing.`,
        type: 'negative',
      });
    } else {
      insights.push({
        title: 'Mixed Fundamentals',
        description: `Composite score of ${scores.totalScore}/100 indicates a company with both strengths and areas for improvement.`,
        type: 'neutral',
      });
    }
  }

  return insights;
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export function MetricsTabs({ symbol, metrics, sector, industry }: MetricsTabsProps) {
  const [activeTab, setActiveTab] = useState<MetricsTabValue>('overview');

  return (
    <div className="space-y-7">
      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as MetricsTabValue)} className="w-full">
        {/* Premium Tab List */}
        <TabsList className="w-full justify-start glass-premium rounded-2xl p-1.5 h-auto flex-wrap gap-1">
          {TABS.map((tab, index) => (
            <TabsTrigger
              key={tab.value}
              value={tab.value}
              className={cn(
                'flex items-center gap-2.5 px-5 py-3 rounded-xl text-sm font-medium transition-all duration-300',
                'data-[state=active]:bg-gradient-to-r data-[state=active]:from-cyan-500 data-[state=active]:to-blue-500',
                'data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:shadow-cyan-500/20',
                'data-[state=inactive]:text-gray-400 data-[state=inactive]:hover:text-white',
                'data-[state=inactive]:hover:bg-white/5'
              )}
              style={{ animationDelay: `${index * 30}ms` }}
            >
              <tab.icon className="h-4 w-4" />
              {tab.label}
            </TabsTrigger>
          ))}
        </TabsList>

        {/* Tab Content with fade animation */}
        <TabsContent value="overview" className="mt-7 animate-fade-up">
          <OverviewTab metrics={metrics} />
        </TabsContent>

        <TabsContent value="financials" className="mt-7 animate-fade-up">
          <FinancialsTab metrics={metrics} />
        </TabsContent>

        <TabsContent value="valuation" className="mt-7 animate-fade-up">
          <ValuationTab metrics={metrics} />
        </TabsContent>

        <TabsContent value="economy" className="mt-7 animate-fade-up">
          <EconomyTab metrics={metrics} />
        </TabsContent>

        <TabsContent value="technical" className="mt-7 animate-fade-up">
          <TechnicalTab metrics={metrics} />
        </TabsContent>

        <TabsContent value="ai" className="mt-7 animate-fade-up">
          <AIAnalysisTab metrics={metrics} symbol={symbol} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
