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
  Layers,
  CreditCard,
  Banknote,
  LineChart,
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
  { value: 'risk', label: 'Risk', icon: Shield },
  { value: 'tradefx', label: 'Trade & FX', icon: Globe },
  { value: 'fixedincome', label: 'Fixed Income', icon: Banknote },
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
    <div className="space-y-8">
      {/* Score Cards Row - Premium grid with generous spacing */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 sm:gap-5 lg:gap-6">
        <div style={{ animationDelay: '0ms' }} className="animate-fade-up">
          <ScoreCard
            title="Overall"
            score={scores.totalScore}
            icon={<Target className="h-3.5 w-3.5" />}
            description="Composite score"
          />
        </div>
        <div style={{ animationDelay: '50ms' }} className="animate-fade-up">
          <ScoreCard
            title="Profitability"
            score={scores.profitabilityScore}
            icon={<PiggyBank className="h-3.5 w-3.5" />}
          />
        </div>
        <div style={{ animationDelay: '100ms' }} className="animate-fade-up">
          <ScoreCard
            title="Growth"
            score={scores.growthScore}
            icon={<Sprout className="h-3.5 w-3.5" />}
          />
        </div>
        <div style={{ animationDelay: '150ms' }} className="animate-fade-up">
          <ScoreCard
            title="Valuation"
            score={scores.valuationScore}
            icon={<Calculator className="h-3.5 w-3.5" />}
          />
        </div>
        <div style={{ animationDelay: '200ms' }} className="animate-fade-up">
          <ScoreCard
            title="Risk"
            score={scores.riskScore}
            icon={<Shield className="h-3.5 w-3.5" />}
          />
        </div>
        <div style={{ animationDelay: '250ms' }} className="animate-fade-up">
          <ScoreCard
            title="Health"
            score={scores.healthScore}
            icon={<Activity className="h-3.5 w-3.5" />}
          />
        </div>
      </div>

      {/* Key Metrics Grid - with stagger animation */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 md:gap-5">
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
  const { profitability, efficiency, cashFlow, dupont, other, growth, leverage, liquidity } = metrics;

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

        {/* Extended Profitability */}
        <MetricCard
          title="Advanced Profitability"
          description="Extended return metrics"
          icon={<PiggyBank className="h-5 w-5" />}
          metrics={[
            { label: 'ROCE', value: profitability.roce, format: 'percent', tooltip: 'Return on Capital Employed' },
            { label: 'RONA', value: profitability.rona, format: 'percent', tooltip: 'Return on Net Assets' },
            { label: 'Cash ROA', value: profitability.cashRoa, format: 'percent' },
            { label: 'Cash ROE', value: profitability.cashRoe, format: 'percent' },
            { label: 'Pretax Margin', value: profitability.pretaxMargin, format: 'percent' },
            { label: 'EBIT Margin', value: profitability.ebitMargin, format: 'percent' },
            { label: 'Operating ROA', value: profitability.operatingRoa, format: 'percent' },
            { label: 'Economic Profit', value: profitability.economicProfit, format: 'currency', tooltip: 'EVA' },
            { label: 'Residual Income', value: profitability.residualIncome, format: 'currency' },
            { label: 'Spread Above WACC', value: profitability.spreadAboveWacc, format: 'percent', tooltip: 'ROIC - WACC' },
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
            { label: 'Equity Turnover', value: efficiency.equityTurnover, format: 'ratio' },
            { label: 'Capital Employed Turnover', value: efficiency.capitalEmployedTurnover, format: 'ratio' },
            { label: 'Cash Turnover', value: efficiency.cashTurnover, format: 'ratio' },
            { label: 'Operating Cycle', value: efficiency.operatingCycle, format: 'number', tooltip: 'Days from inventory to cash' },
            { label: 'Net Trade Cycle', value: efficiency.netTradeCycle, format: 'number' },
            { label: 'Asset Utilization', value: efficiency.assetUtilization, format: 'ratio' },
          ]}
        />

        {/* Cash Flow */}
        <MetricCard
          title="Cash Flow"
          description="Cash generation"
          icon={<Wallet className="h-5 w-5" />}
          metrics={[
            { label: 'Operating Cash Flow', value: cashFlow.operatingCashFlow, format: 'currency' },
            { label: 'Investing Cash Flow', value: cashFlow.investingCashFlow, format: 'currency' },
            { label: 'Financing Cash Flow', value: cashFlow.financingCashFlow, format: 'currency' },
            { label: 'Free Cash Flow', value: cashFlow.freeCashFlow, format: 'currency' },
            { label: 'FCFF', value: cashFlow.fcff, format: 'currency', tooltip: 'Free Cash Flow to Firm' },
            { label: 'FCFE', value: cashFlow.fcfe, format: 'currency', tooltip: 'Free Cash Flow to Equity' },
            { label: 'Cash Flow Adequacy', value: cashFlow.cashFlowAdequacy, format: 'ratio' },
            { label: 'Reinvestment Ratio', value: cashFlow.cashReinvestmentRatio, format: 'percent' },
            { label: 'Levered FCF', value: cashFlow.leveredFreeCashFlow, format: 'currency' },
            { label: 'Unlevered FCF', value: cashFlow.unleveredFreeCashFlow, format: 'currency' },
            { label: 'FCF Margin', value: cashFlow.fcfMargin, format: 'percent' },
            { label: 'FCF Yield', value: cashFlow.fcfYield, format: 'percent' },
            { label: 'FCF to Debt', value: cashFlow.fcfToDebt, format: 'ratio' },
            { label: 'FCF to Equity', value: cashFlow.fcfToEquity, format: 'ratio' },
            { label: 'OCF Margin', value: cashFlow.operatingCashFlowMargin, format: 'percent' },
            { label: 'CapEx to Revenue', value: cashFlow.capexToRevenue, format: 'percent' },
            { label: 'CapEx to Depreciation', value: cashFlow.capexToDepreciation, format: 'ratio' },
            { label: 'Cash Generation', value: cashFlow.cashGenerationEfficiency, format: 'ratio' },
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
            { label: 'ROE (DuPont)', value: dupont.roeDupont, format: 'percent', tooltip: 'NPM × AT × EM' },
            { label: 'Operating Margin', value: dupont.operatingMargin, format: 'percent' },
            { label: 'Interest Burden', value: dupont.interestBurden, format: 'ratio', tooltip: 'EBT / EBIT' },
            { label: 'Tax Burden', value: dupont.taxBurden, format: 'ratio', tooltip: 'Net Income / EBT' },
            { label: 'Tax Efficiency', value: dupont.taxEfficiency, format: 'percent' },
            { label: 'Interest Burden Ratio', value: dupont.interestBurdenRatio, format: 'ratio' },
            { label: 'Operating Profit Margin', value: dupont.operatingProfitMargin, format: 'percent' },
            { label: 'Asset Turnover Ratio', value: dupont.assetTurnoverRatio, format: 'ratio' },
            { label: 'Financial Leverage', value: dupont.financialLeverageRatio, format: 'ratio' },
          ]}
        />

        {/* Growth Metrics Full */}
        <MetricCard
          title="Growth Metrics"
          description="Historical performance"
          icon={<Sprout className="h-5 w-5" />}
          metrics={[
            { label: 'Revenue YoY', value: growth.revenueGrowthYoY, format: 'percent', status: getMetricStatus(growth.revenueGrowthYoY, { good: 0.1, bad: -0.05 }) },
            { label: 'EPS YoY', value: growth.epsGrowthYoY, format: 'percent', status: getMetricStatus(growth.epsGrowthYoY, { good: 0.1, bad: -0.1 }) },
            { label: 'Net Income YoY', value: growth.netIncomeGrowthYoY, format: 'percent' },
            { label: 'EBITDA YoY', value: growth.ebitdaGrowthYoY, format: 'percent' },
            { label: 'Operating Income YoY', value: growth.operatingIncomeGrowth, format: 'percent' },
            { label: 'Gross Profit YoY', value: growth.grossProfitGrowth, format: 'percent' },
            { label: 'Dividend Growth', value: growth.dpsGrowth, format: 'percent' },
            { label: 'FCF Growth', value: growth.fcfGrowth, format: 'percent' },
            { label: 'Revenue 3Y CAGR', value: growth.revenue3YearCAGR, format: 'percent' },
            { label: 'Revenue 5Y CAGR', value: growth.revenue5YearCAGR, format: 'percent' },
            { label: 'EPS 3Y CAGR', value: growth.eps3YearCAGR, format: 'percent' },
            { label: 'EPS 5Y CAGR', value: growth.eps5YearCAGR, format: 'percent' },
            { label: 'Asset Growth', value: growth.assetGrowthRate, format: 'percent' },
            { label: 'Equity Growth', value: growth.equityGrowthRate, format: 'percent' },
            { label: 'Book Value Growth', value: growth.bookValueGrowthRate, format: 'percent' },
            { label: 'Sustainable Growth', value: growth.sustainableGrowthRate, format: 'percent', tooltip: 'ROE × Retention' },
            { label: 'Internal Growth', value: growth.internalGrowthRate, format: 'percent', tooltip: 'ROA × Retention' },
            { label: 'Retention Ratio', value: growth.retentionRatio, format: 'percent' },
            { label: 'Payout Ratio', value: growth.payoutRatio, format: 'percent' },
            { label: 'Plowback Ratio', value: growth.plowbackRatio, format: 'percent' },
          ]}
        />

        {/* Leverage Ratios */}
        <MetricCard
          title="Leverage Ratios"
          description="Debt structure"
          icon={<Scale className="h-5 w-5" />}
          metrics={[
            { label: 'Debt to Assets', value: leverage.debtToAssets, format: 'percent' },
            { label: 'Debt to Equity', value: leverage.debtToEquity, format: 'ratio' },
            { label: 'Financial D/E', value: leverage.financialDebtToEquity, format: 'ratio' },
            { label: 'Interest Coverage', value: leverage.interestCoverage, format: 'ratio' },
            { label: 'Debt Service Coverage', value: leverage.debtServiceCoverage, format: 'ratio' },
            { label: 'Equity Multiplier', value: leverage.equityMultiplier, format: 'ratio' },
            { label: 'Debt/EBITDA', value: leverage.debtToEBITDA, format: 'ratio' },
            { label: 'Net Debt/EBITDA', value: leverage.netDebtToEBITDA, format: 'ratio' },
            { label: 'Debt to Capital', value: leverage.debtToCapital, format: 'percent' },
            { label: 'Long Term Debt Ratio', value: leverage.longTermDebtRatio, format: 'percent' },
            { label: 'Fixed Charge Coverage', value: leverage.fixedChargeCoverage, format: 'ratio' },
            { label: 'Cash Flow Coverage', value: leverage.cashFlowCoverage, format: 'ratio' },
            { label: 'Times Interest Earned', value: leverage.timesInterestEarned, format: 'ratio' },
            { label: 'Capital Gearing', value: leverage.capitalGearing, format: 'ratio' },
            { label: 'Debt Capacity Util.', value: leverage.debtCapacityUtilization, format: 'percent' },
          ]}
        />

        {/* Liquidity Ratios */}
        <MetricCard
          title="Liquidity Ratios"
          description="Short-term health"
          icon={<Droplets className="h-5 w-5" />}
          metrics={[
            { label: 'Current Ratio', value: liquidity.currentRatio, format: 'ratio' },
            { label: 'Quick Ratio', value: liquidity.quickRatio, format: 'ratio' },
            { label: 'Cash Ratio', value: liquidity.cashRatio, format: 'ratio' },
            { label: 'Days Sales Outstanding', value: liquidity.daysSalesOutstanding, format: 'number' },
            { label: 'Days Inventory', value: liquidity.daysInventoryOutstanding, format: 'number' },
            { label: 'Days Payables', value: liquidity.daysPayablesOutstanding, format: 'number' },
            { label: 'Cash Conversion Cycle', value: liquidity.cashConversionCycle, format: 'number' },
            { label: 'Absolute Liquidity', value: liquidity.absoluteLiquidityRatio, format: 'ratio' },
            { label: 'Defensive Interval', value: liquidity.defensiveInterval, format: 'number', tooltip: 'Days cash can cover expenses' },
            { label: 'NWC Ratio', value: liquidity.netWorkingCapitalRatio, format: 'ratio' },
            { label: 'OCF Ratio', value: liquidity.operatingCashFlowRatio, format: 'ratio' },
            { label: 'Cash Burn Rate', value: liquidity.cashBurnRate, format: 'number', tooltip: 'Months of cash remaining' },
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
            { label: 'Altman Z-Score', value: other.altmanZScore, format: 'number', status: getMetricStatus(other.altmanZScore, { good: 3, bad: 1.8 }), tooltip: '>3 = Safe, <1.8 = Distress' },
            { label: 'Piotroski F-Score', value: other.piotroskiFScore, format: 'score', tooltip: '0-9 scale' },
            { label: 'Beneish M-Score', value: other.beneishMScore, format: 'number', tooltip: '< -2.22 = Normal' },
            { label: 'Operating Leverage', value: other.operatingLeverage, format: 'ratio', tooltip: 'DOL' },
            { label: 'Financial Leverage', value: other.financialLeverage, format: 'ratio', tooltip: 'DFL' },
            { label: 'Total Leverage', value: other.totalLeverage, format: 'ratio', tooltip: 'DOL × DFL' },
            { label: 'Tangible BV/Share', value: other.tangibleBookValuePerShare, format: 'currency' },
            { label: 'Revenue/Employee', value: other.revenuePerEmployee, format: 'currency' },
            { label: 'Profit/Employee', value: other.profitPerEmployee, format: 'currency' },
            { label: 'Market Cap/Employee', value: other.marketCapPerEmployee, format: 'currency' },
            { label: 'EV/Employee', value: other.enterpriseValuePerEmployee, format: 'currency' },
            { label: 'Tax Burden Ratio', value: other.taxBurdenRatio, format: 'percent' },
            { label: 'Operating ROI', value: other.operatingRoi, format: 'percent' },
            { label: 'Invested Capital Turnover', value: other.investedCapitalTurnover, format: 'ratio' },
            { label: 'Excess ROIC', value: other.excessROIC, format: 'percent', tooltip: 'vs Industry' },
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
  const { valuation, dcf, industry, scores } = metrics;

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

        {/* Extended Valuation */}
        <MetricCard
          title="Advanced Valuation"
          description="Extended value metrics"
          icon={<Calculator className="h-5 w-5" />}
          metrics={[
            { label: 'Price to FCF', value: valuation.priceToFcf, format: 'ratio' },
            { label: 'EV to FCF', value: valuation.evToFcf, format: 'ratio' },
            { label: 'EV to OCF', value: valuation.evToOcf, format: 'ratio' },
            { label: 'EV/Invested Capital', value: valuation.evToInvestedCapital, format: 'ratio' },
            { label: 'Price/Tangible Book', value: valuation.priceToTangibleBook, format: 'ratio' },
            { label: 'EV Per Share', value: valuation.enterpriseValuePerShare, format: 'currency' },
            { label: "Tobin's Q", value: valuation.tobin_Q, format: 'ratio', tooltip: 'Market Value / Replacement Cost' },
            { label: 'Graham Number', value: valuation.grahamNumber, format: 'currency', tooltip: '√(22.5 × EPS × BVPS)' },
            { label: 'NCAV', value: valuation.netCurrentAssetValue, format: 'currency', tooltip: 'Net Current Asset Value' },
            { label: 'Liquidation Value', value: valuation.liquidationValue, format: 'currency' },
            { label: 'Market Cap/GDP', value: valuation.marketCapToGdp, format: 'percent', tooltip: 'Buffett Indicator' },
          ]}
        />

        {/* DCF Valuation */}
        <MetricCard
          title="DCF Valuation"
          description="Cost of capital"
          icon={<Target className="h-5 w-5" />}
          metrics={[
            { label: 'Risk-Free Rate', value: dcf.riskFreeRate, format: 'percent' },
            { label: 'Market Risk Premium', value: dcf.marketRiskPremium, format: 'percent' },
            { label: 'Beta', value: dcf.beta, format: 'number' },
            { label: 'Cost of Equity', value: dcf.costOfEquity, format: 'percent', tooltip: 'Re = Rf + β(Rm - Rf)' },
            { label: 'Cost of Debt', value: dcf.costOfDebt, format: 'percent' },
            { label: 'WACC', value: dcf.wacc, format: 'percent', tooltip: 'Weighted Average Cost of Capital' },
            { label: 'Terminal Value', value: dcf.terminalValue, format: 'currency' },
            { label: 'Intrinsic Value', value: dcf.intrinsicValue, format: 'currency' },
            { label: 'Target Price', value: dcf.targetPrice, format: 'currency' },
            { label: 'Upside/Downside', value: dcf.upsideDownside, format: 'percent', status: getMetricStatus(dcf.upsideDownside, { good: 0.1, bad: -0.1 }) },
          ]}
        />

        {/* Extended DCF */}
        <MetricCard
          title="DCF Analysis"
          description="Intrinsic value details"
          icon={<Target className="h-5 w-5" />}
          metrics={[
            { label: 'PV of FCF', value: dcf.pvOfFcf, format: 'currency' },
            { label: 'PV of Terminal Value', value: dcf.pvOfTerminalValue, format: 'currency' },
            { label: 'Equity Value/Share', value: dcf.equityValuePerShare, format: 'currency' },
            { label: 'Margin of Safety', value: dcf.marginOfSafety, format: 'percent', status: getMetricStatus(dcf.marginOfSafety, { good: 0.2, bad: -0.1 }) },
            { label: 'Implied Growth', value: dcf.impliedGrowthRate, format: 'percent', tooltip: 'Growth implied by current price' },
            { label: 'Reverse DCF Growth', value: dcf.reverseDcfGrowth, format: 'percent' },
            { label: 'Exit Multiple', value: dcf.exitMultiple, format: 'ratio' },
            { label: 'Perpetuity Growth', value: dcf.perpetuityGrowthRate, format: 'percent' },
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
            { label: 'CR8', value: industry.cr8, format: 'percent', tooltip: 'Top 8 firms concentration' },
            { label: 'Industry PE', value: industry.industryPE, format: 'ratio' },
            { label: 'Industry PB', value: industry.industryPB, format: 'ratio' },
            { label: 'Industry ROE', value: industry.industryROE, format: 'percent' },
            { label: 'Industry ROIC', value: industry.industryROIC, format: 'percent' },
            { label: 'Industry Gross Margin', value: industry.industryGrossMargin, format: 'percent' },
            { label: 'Industry Beta', value: industry.industryBeta, format: 'number' },
            { label: 'Relative Valuation', value: industry.relativeValuation, format: 'ratio', tooltip: 'vs Industry avg' },
            { label: 'Sector Rotation', value: industry.sectorRotationScore, format: 'score' },
            { label: 'Competitive Position', value: industry.competitivePosition, format: 'score' },
          ]}
        />

        {/* Scores */}
        <MetricCard
          title="Composite Scores"
          description="Quality ratings (0-100)"
          icon={<Sparkles className="h-5 w-5" />}
          metrics={[
            { label: 'Total Score', value: scores.totalScore, format: 'score' },
            { label: 'Profitability', value: scores.profitabilityScore, format: 'score' },
            { label: 'Growth', value: scores.growthScore, format: 'score' },
            { label: 'Valuation', value: scores.valuationScore, format: 'score' },
            { label: 'Risk', value: scores.riskScore, format: 'score' },
            { label: 'Health', value: scores.healthScore, format: 'score' },
            { label: 'Momentum', value: scores.momentumScore, format: 'score' },
            { label: 'Quality', value: scores.qualityScore, format: 'score' },
            { label: 'Stability', value: scores.stabilityScore, format: 'score' },
            { label: 'Efficiency', value: scores.efficiencyScore, format: 'score' },
            { label: 'Solvency', value: scores.solvencyScore, format: 'score' },
            { label: 'Technical', value: scores.technicalScore, format: 'score' },
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
            { label: 'Real GDP Growth', value: macro.realGDPGrowthRate, format: 'percent' },
            { label: 'Potential GDP', value: macro.potentialGDP ? macro.potentialGDP * 1e9 : null, format: 'currency' },
            { label: 'Output Gap', value: macro.outputGap, format: 'percent', tooltip: '(Real - Potential) / Potential' },
            { label: 'GDP Deflator', value: macro.gdpDeflator, format: 'number' },
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
            { label: 'Inflation Rate', value: macro.inflationRate, format: 'percent' },
            { label: 'PCE Inflation', value: macro.pceInflation, format: 'number' },
            { label: 'Core Inflation Rate', value: macro.coreInflationRate, format: 'percent' },
            { label: 'Breakeven 5Y', value: macro.breakEvenInflation5Y, format: 'percent', tooltip: '5-Year Breakeven Inflation' },
            { label: 'Breakeven 10Y', value: macro.breakEvenInflation10Y, format: 'percent', tooltip: '10-Year Breakeven Inflation' },
            { label: 'Inflation Expectations', value: macro.inflationExpectations, format: 'percent' },
          ]}
        />

        {/* Interest Rates Full */}
        <MetricCard
          title="Interest Rates"
          description="Monetary policy"
          icon={<DollarSign className="h-5 w-5" />}
          metrics={[
            { label: 'Fed Funds Rate', value: macro.federalFundsRate, format: 'percent', status: getMetricStatus(macro.federalFundsRate, { good: 2, bad: 5 }, true) },
            { label: '3M Treasury', value: macro.treasury3M, format: 'percent' },
            { label: '2Y Treasury', value: macro.treasury2Y, format: 'percent' },
            { label: '10Y Treasury', value: macro.treasury10Y, format: 'percent' },
            { label: '30Y Treasury', value: macro.treasury30Y, format: 'percent' },
            { label: 'Prime Rate', value: macro.primeRate, format: 'percent' },
            { label: 'Interbank Rate', value: macro.interbankRate, format: 'percent' },
            { label: 'Real Interest Rate', value: macro.realInterestRate, format: 'percent', tooltip: 'Nominal - Inflation' },
            { label: 'Neutral Rate', value: macro.neutralRate, format: 'percent' },
            { label: 'Yield Curve Spread', value: macro.yieldCurveSpread, format: 'percent', tooltip: '10Y - 2Y Spread' },
            { label: 'Yield Curve Slope', value: macro.yieldCurveSlope, format: 'percent' },
            { label: 'Term Premium', value: macro.termPremium, format: 'percent' },
            { label: 'Fisher Equation', value: macro.fisherEquation, format: 'percent' },
            { label: 'Risk-Free Rate', value: macro.nominalRiskFreeRate, format: 'percent' },
          ]}
        />

        {/* Monetary */}
        <MetricCard
          title="Monetary Metrics"
          description="Money supply"
          icon={<Banknote className="h-5 w-5" />}
          metrics={[
            { label: 'M1 Money Supply', value: macro.m1MoneySupply ? macro.m1MoneySupply * 1e9 : null, format: 'currency' },
            { label: 'M2 Money Supply', value: macro.m2MoneySupply ? macro.m2MoneySupply * 1e9 : null, format: 'currency' },
            { label: 'M2 Velocity', value: macro.m2Velocity, format: 'number', tooltip: 'GDP / M2' },
            { label: 'Money Multiplier', value: macro.moneyMultiplier, format: 'ratio' },
            { label: 'Monetary Base', value: macro.monetaryBase ? macro.monetaryBase * 1e9 : null, format: 'currency' },
            { label: 'Excess Reserves', value: macro.excessReserves ? macro.excessReserves * 1e9 : null, format: 'currency' },
            { label: 'QTM', value: macro.quantityTheoryOfMoney, format: 'number', tooltip: 'M × V = P × Y' },
            { label: 'Money Growth', value: macro.moneyGrowthRate, format: 'percent' },
          ]}
        />

        {/* FX Rates */}
        <MetricCard
          title="Exchange Rates"
          description="Currency markets"
          icon={<Globe className="h-5 w-5" />}
          metrics={[
            { label: 'USD Index', value: macro.usdIndex, format: 'number', tooltip: 'Trade-weighted dollar index' },
            { label: 'EUR/USD', value: macro.eurUsd, format: 'number' },
            { label: 'USD/JPY', value: macro.usdJpy, format: 'number' },
            { label: 'GBP/USD', value: macro.gbpUsd, format: 'number' },
          ]}
        />

        {/* Labor Market Full */}
        <MetricCard
          title="Labor Market"
          description="Employment indicators"
          icon={<Activity className="h-5 w-5" />}
          metrics={[
            { label: 'Unemployment Rate', value: macro.unemploymentRate, format: 'percent', status: getMetricStatus(macro.unemploymentRate, { good: 4, bad: 7 }, true) },
            { label: 'Labor Force Part.', value: macro.laborForceParticipation, format: 'percent' },
            { label: 'Employment-Pop Ratio', value: macro.employmentPopulationRatio, format: 'percent' },
            { label: 'Initial Claims', value: macro.initialClaims, format: 'number', tooltip: 'Weekly jobless claims' },
            { label: 'Continuing Claims', value: macro.continuingClaims, format: 'number' },
            { label: 'Nonfarm Payrolls', value: macro.nonFarmPayrolls, format: 'number' },
            { label: 'Underemployment', value: macro.underemploymentRate, format: 'percent' },
            { label: 'Natural Unemployment', value: macro.naturalUnemploymentRate, format: 'percent' },
          ]}
        />

        {/* Wages & Productivity */}
        <MetricCard
          title="Wages & Productivity"
          description="Labor efficiency"
          icon={<Zap className="h-5 w-5" />}
          metrics={[
            { label: 'Wage Growth', value: macro.wageGrowth, format: 'currency', tooltip: 'Average hourly earnings' },
            { label: 'Labor Productivity', value: macro.laborProductivity, format: 'number' },
            { label: 'Unit Labor Costs', value: macro.unitLaborCosts, format: 'number' },
            { label: 'Real Wage Growth', value: macro.realWageGrowth, format: 'percent' },
            { label: 'Productivity Growth', value: macro.productivityGrowthRate, format: 'percent' },
          ]}
        />

        {/* Sentiment Full */}
        <MetricCard
          title="Economic Sentiment"
          description="Confidence indicators"
          icon={<Sparkles className="h-5 w-5" />}
          metrics={[
            { label: 'Consumer Confidence', value: macro.consumerConfidence, format: 'number', status: getMetricStatus(macro.consumerConfidence, { good: 80, bad: 60 }) },
            { label: 'Business Confidence', value: macro.businessConfidence, format: 'number', status: getMetricStatus(macro.businessConfidence, { good: 100, bad: 95 }) },
            { label: 'NFIB Optimism', value: macro.nfibOptimism, format: 'number' },
            { label: 'CEO Confidence', value: macro.ceoConfidence, format: 'number' },
          ]}
        />

        {/* Housing */}
        <MetricCard
          title="Housing Market"
          description="Real estate indicators"
          icon={<LayoutGrid className="h-5 w-5" />}
          metrics={[
            { label: 'Housing Starts', value: macro.housingStarts, format: 'number', tooltip: 'Thousands of units' },
            { label: 'Building Permits', value: macro.buildingPermits, format: 'number' },
            { label: 'Existing Home Sales', value: macro.existingHomeSales, format: 'number' },
            { label: 'Case-Shiller Index', value: macro.caseShillerIndex, format: 'number', tooltip: 'Home price index' },
          ]}
        />

        {/* Manufacturing & Trade */}
        <MetricCard
          title="Manufacturing & Trade"
          description="Business activity"
          icon={<BarChart3 className="h-5 w-5" />}
          metrics={[
            { label: 'ISM PMI', value: macro.ism_pmi, format: 'number', status: getMetricStatus(macro.ism_pmi, { good: 55, bad: 45 }), tooltip: '>50 = Expansion' },
            { label: 'ISM Services', value: macro.ism_services, format: 'number' },
            { label: 'Industrial Production', value: macro.industrialProduction, format: 'number' },
            { label: 'Capacity Utilization', value: macro.capacityUtilization, format: 'percent' },
            { label: 'Retail Sales', value: macro.retailSales ? macro.retailSales * 1e6 : null, format: 'currency' },
            { label: 'Trade Balance', value: macro.tradeBalance ? macro.tradeBalance * 1e9 : null, format: 'currency' },
          ]}
        />

        {/* Financial Conditions */}
        <MetricCard
          title="Financial Conditions"
          description="Market stress"
          icon={<Shield className="h-5 w-5" />}
          metrics={[
            { label: 'Credit Spread', value: macro.creditSpread, format: 'percent', tooltip: 'Baa-Treasury spread' },
            { label: 'TED Spread', value: macro.tedSpread, format: 'percent' },
            { label: 'VIX', value: macro.vix, format: 'number', status: getMetricStatus(macro.vix, { good: 15, bad: 30 }, true) },
            { label: 'Financial Stress', value: macro.financialStressIndex, format: 'number', tooltip: 'St. Louis Fed FSI' },
            { label: 'Chicago Fed Index', value: macro.chicagoFedIndex, format: 'number', tooltip: 'NFCI' },
            { label: 'Fin. Conditions Index', value: macro.financialConditionsIndex, format: 'number' },
          ]}
        />

        {/* Fiscal */}
        <MetricCard
          title="Fiscal Indicators"
          description="Government finances"
          icon={<Scale className="h-5 w-5" />}
          metrics={[
            { label: 'Federal Debt', value: macro.federalDebt ? macro.federalDebt * 1e9 : null, format: 'currency' },
            { label: 'Debt to GDP', value: macro.debtToGDP, format: 'percent' },
            { label: 'Budget Deficit', value: macro.budgetDeficit ? macro.budgetDeficit * 1e9 : null, format: 'currency' },
            { label: 'Fiscal Impulse', value: macro.fiscalImpulse, format: 'percent' },
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
  const { technical } = metrics;

  return (
    <div className="space-y-7">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {/* Technical Indicators */}
        <MetricCard
          title="Momentum Indicators"
          description="Price momentum"
          icon={<Activity className="h-5 w-5" />}
          metrics={[
            { label: 'RSI (14)', value: technical.rsi, format: 'number', status: technical.rsi ? (technical.rsi > 70 ? 'negative' : technical.rsi < 30 ? 'positive' : 'neutral') : 'neutral', tooltip: '>70 = Overbought, <30 = Oversold' },
            { label: 'MACD', value: technical.macd, format: 'number' },
            { label: 'MACD Signal', value: technical.macdSignal, format: 'number' },
            { label: 'MACD Histogram', value: technical.macdHistogram, format: 'number' },
            { label: 'Stochastic %K', value: technical.stochastic_K, format: 'number' },
            { label: 'Stochastic %D', value: technical.stochastic_D, format: 'number' },
            { label: 'Williams %R', value: technical.williamsR, format: 'number' },
            { label: 'CCI', value: technical.cci, format: 'number', tooltip: 'Commodity Channel Index' },
            { label: 'MFI', value: technical.mfi, format: 'number', tooltip: 'Money Flow Index' },
            { label: 'Relative Volume', value: technical.relativeVolume, format: 'ratio' },
          ]}
        />

        {/* Moving Averages */}
        <MetricCard
          title="Moving Averages"
          description="Price trends"
          icon={<TrendingUp className="h-5 w-5" />}
          metrics={[
            { label: 'SMA 10', value: technical.sma10, format: 'currency' },
            { label: 'SMA 20', value: technical.sma20, format: 'currency' },
            { label: '50 Day MA', value: technical.fiftyDayMA, format: 'currency' },
            { label: 'SMA 100', value: technical.sma100, format: 'currency' },
            { label: '200 Day MA', value: technical.twoHundredDayMA, format: 'currency' },
            { label: 'EMA 12', value: technical.ema12, format: 'currency' },
            { label: 'EMA 26', value: technical.ema26, format: 'currency' },
            { label: 'Price/SMA50', value: technical.priceToSMA50, format: 'percent' },
            { label: 'Price/SMA200', value: technical.priceToSMA200, format: 'percent' },
          ]}
        />

        {/* Bollinger Bands */}
        <MetricCard
          title="Bollinger Bands"
          description="Volatility bands"
          icon={<BarChart3 className="h-5 w-5" />}
          metrics={[
            { label: 'Upper Band', value: technical.bollingerUpper, format: 'currency' },
            { label: 'Middle Band', value: technical.bollingerMiddle, format: 'currency' },
            { label: 'Lower Band', value: technical.bollingerLower, format: 'currency' },
            { label: 'Band Width', value: technical.bollingerWidth, format: 'percent' },
          ]}
        />

        {/* Volatility */}
        <MetricCard
          title="Volatility"
          description="Price volatility"
          icon={<Activity className="h-5 w-5" />}
          metrics={[
            { label: 'ATR', value: technical.atr, format: 'currency', tooltip: 'Average True Range' },
            { label: 'ATR %', value: technical.atrPercent, format: 'percent' },
          ]}
        />

        {/* Trend */}
        <MetricCard
          title="Trend Analysis"
          description="Directional indicators"
          icon={<TrendingUp className="h-5 w-5" />}
          metrics={[
            { label: 'ADX', value: technical.adx, format: 'number', tooltip: 'Average Directional Index' },
            { label: '+DI', value: technical.plusDI, format: 'number' },
            { label: '-DI', value: technical.minusDI, format: 'number' },
            { label: 'Trend Strength', value: technical.trendStrength, format: 'number' },
            { label: 'Support Level', value: technical.supportLevel, format: 'currency' },
            { label: 'Resistance Level', value: technical.resistanceLevel, format: 'currency' },
          ]}
        />

        {/* Volume */}
        <MetricCard
          title="Volume Analysis"
          description="Volume indicators"
          icon={<BarChart3 className="h-5 w-5" />}
          metrics={[
            { label: 'OBV', value: technical.obv, format: 'number', tooltip: 'On-Balance Volume' },
            { label: 'OBV Trend', value: technical.obvTrend, format: 'number' },
            { label: 'VWAP', value: technical.vwap, format: 'currency', tooltip: 'Volume Weighted Average Price' },
          ]}
        />
      </div>
    </div>
  );
}

// ============================================================================
// RISK TAB
// ============================================================================

function RiskTab({ metrics }: { metrics: AllMetrics }) {
  const { risk, leverage, liquidity, credit, scores } = metrics;

  return (
    <div className="space-y-7">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {/* Core Risk Metrics */}
        <MetricCard
          title="Risk Metrics"
          description="Market risk measures"
          icon={<Shield className="h-5 w-5" />}
          metrics={[
            { label: 'Beta', value: risk.beta, format: 'number' },
            { label: 'Alpha', value: risk.alpha, format: 'percent' },
            { label: 'Sharpe Ratio', value: risk.sharpeRatio, format: 'ratio' },
            { label: 'Sortino Ratio', value: risk.sortinoRatio, format: 'ratio' },
            { label: 'Std Deviation', value: risk.standardDeviation, format: 'percent' },
            { label: 'Max Drawdown', value: risk.maxDrawdown, format: 'percent' },
            { label: 'VaR 95%', value: risk.var95, format: 'percent', tooltip: 'Value at Risk (95% confidence)' },
            { label: 'VaR 99%', value: risk.var99, format: 'percent', tooltip: 'Value at Risk (99% confidence)' },
          ]}
        />

        {/* Advanced Risk */}
        <MetricCard
          title="Advanced Risk"
          description="Extended risk measures"
          icon={<Shield className="h-5 w-5" />}
          metrics={[
            { label: 'CVaR 95%', value: risk.cvar95, format: 'percent', tooltip: 'Conditional VaR (Expected Shortfall)' },
            { label: 'CVaR 99%', value: risk.cvar99, format: 'percent' },
            { label: 'Treynor Ratio', value: risk.treynorRatio, format: 'ratio' },
            { label: "Jensen's Alpha", value: risk.jensensAlpha, format: 'percent' },
            { label: 'Modigliani M²', value: risk.modigliani_M2, format: 'percent' },
            { label: 'Omega Ratio', value: risk.omegaRatio, format: 'ratio' },
            { label: 'Calmar Ratio', value: risk.calmarRatio, format: 'ratio' },
            { label: 'Ulcer Index', value: risk.ulcerIndex, format: 'number' },
            { label: 'Tail Ratio', value: risk.tailRatio, format: 'ratio' },
            { label: 'Pain Index', value: risk.painIndex, format: 'percent' },
          ]}
        />

        {/* Capture Ratios */}
        <MetricCard
          title="Capture Ratios"
          description="Market performance"
          icon={<TrendingUp className="h-5 w-5" />}
          metrics={[
            { label: 'Tracking Error', value: risk.trackingError, format: 'percent' },
            { label: 'Info Ratio', value: risk.informationRatio, format: 'ratio' },
            { label: 'Upside Capture', value: risk.upsideCapture, format: 'percent', tooltip: 'Performance in up markets' },
            { label: 'Downside Capture', value: risk.downsideCapture, format: 'percent', tooltip: 'Performance in down markets' },
          ]}
        />

        {/* Leverage Risk */}
        <MetricCard
          title="Leverage Risk"
          description="Debt structure"
          icon={<Scale className="h-5 w-5" />}
          metrics={[
            { label: 'Net Debt/EBITDA', value: leverage.netDebtToEBITDA, format: 'ratio', status: getMetricStatus(leverage.netDebtToEBITDA, { good: 2, bad: 4 }, true) },
            { label: 'Debt to Capital', value: leverage.debtToCapital, format: 'percent' },
            { label: 'Long Term Debt Ratio', value: leverage.longTermDebtRatio, format: 'percent' },
            { label: 'Fixed Charge Coverage', value: leverage.fixedChargeCoverage, format: 'ratio', status: getMetricStatus(leverage.fixedChargeCoverage, { good: 2.5, bad: 1 }) },
            { label: 'Cash Flow Coverage', value: leverage.cashFlowCoverage, format: 'ratio' },
            { label: 'Times Interest Earned', value: leverage.timesInterestEarned, format: 'ratio' },
            { label: 'Capital Gearing', value: leverage.capitalGearing, format: 'ratio' },
            { label: 'Debt Capacity Util.', value: leverage.debtCapacityUtilization, format: 'percent' },
          ]}
        />

        {/* Liquidity Risk */}
        <MetricCard
          title="Liquidity Risk"
          description="Short-term solvency"
          icon={<Droplets className="h-5 w-5" />}
          metrics={[
            { label: 'Absolute Liquidity', value: liquidity.absoluteLiquidityRatio, format: 'ratio', tooltip: 'Cash / Current Liabilities' },
            { label: 'Defensive Interval', value: liquidity.defensiveInterval, format: 'number', tooltip: 'Days to cover expenses' },
            { label: 'NWC Ratio', value: liquidity.netWorkingCapitalRatio, format: 'ratio' },
            { label: 'OCF Ratio', value: liquidity.operatingCashFlowRatio, format: 'ratio' },
            { label: 'Cash Burn Rate', value: liquidity.cashBurnRate, format: 'number', tooltip: 'Months of cash remaining' },
          ]}
        />

        {/* Credit Risk */}
        {credit && (
          <MetricCard
            title="Credit Risk"
            description="Default probability"
            icon={<CreditCard className="h-5 w-5" />}
            metrics={[
              { label: 'Prob. of Default', value: credit.probabilityOfDefault, format: 'percent', tooltip: 'Expected default probability' },
              { label: 'Loss Given Default', value: credit.lossGivenDefault, format: 'percent' },
              { label: 'Expected Loss', value: credit.expectedLoss, format: 'percent' },
              { label: 'Distance to Default', value: credit.distanceToDefault, format: 'number', tooltip: 'Merton model metric' },
              { label: 'Recovery Rate', value: credit.recoveryRate, format: 'percent' },
            ]}
          />
        )}

        {/* Risk Scores */}
        <MetricCard
          title="Risk Scores"
          description="Composite ratings"
          icon={<Sparkles className="h-5 w-5" />}
          metrics={[
            { label: 'Risk Score', value: scores.riskScore, format: 'score' },
            { label: 'Stability Score', value: scores.stabilityScore, format: 'score' },
            { label: 'Solvency Score', value: scores.solvencyScore, format: 'score' },
          ]}
        />
      </div>
    </div>
  );
}

// ============================================================================
// TRADE & FX TAB
// ============================================================================

function TradeFXTab({ metrics }: { metrics: AllMetrics }) {
  const { tradeFx } = metrics;

  if (!tradeFx) {
    return (
      <div className="text-center py-10 text-gray-500">
        Trade & FX data not available
      </div>
    );
  }

  return (
    <div className="space-y-7">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {/* Trade & FX Core */}
        <MetricCard
          title="Trade & FX"
          description="Currency & trade"
          icon={<Globe className="h-5 w-5" />}
          metrics={[
            { label: 'Terms of Trade', value: tradeFx.termsOfTrade, format: 'ratio' },
            { label: 'Trade Balance', value: tradeFx.tradeBalance, format: 'currency' },
            { label: 'Current Account', value: tradeFx.currentAccount, format: 'currency' },
            { label: 'Spot FX Rate', value: tradeFx.spotRate, format: 'number' },
            { label: 'Forward Rate 1M', value: tradeFx.forwardRate1M, format: 'number' },
            { label: 'Forward Rate 3M', value: tradeFx.forwardRate3M, format: 'number' },
            { label: 'CIP', value: tradeFx.coveredInterestParity, format: 'ratio', tooltip: 'Covered Interest Parity' },
            { label: 'UIP', value: tradeFx.uncoveredInterestParity, format: 'ratio', tooltip: 'Uncovered Interest Parity' },
            { label: 'Real Exchange Rate', value: tradeFx.realExchangeRate, format: 'number' },
            { label: 'PPP Deviation', value: tradeFx.pppDeviation, format: 'percent', tooltip: 'Purchasing Power Parity Deviation' },
          ]}
        />

        {/* Trade & FX Extended */}
        <MetricCard
          title="Trade & FX Extended"
          description="Advanced FX metrics"
          icon={<Globe className="h-5 w-5" />}
          metrics={[
            { label: 'Capital Account', value: tradeFx.capitalAccount, format: 'currency' },
            { label: 'Net Exports', value: tradeFx.netExports, format: 'currency' },
            { label: 'S-I Gap', value: tradeFx.savingInvestmentGap, format: 'currency', tooltip: 'Saving-Investment Gap' },
            { label: 'Export Growth', value: tradeFx.exportGrowthRate, format: 'percent' },
            { label: 'Import Growth', value: tradeFx.importGrowthRate, format: 'percent' },
            { label: 'Spot Bid', value: tradeFx.spotRateBid, format: 'number' },
            { label: 'Spot Ask', value: tradeFx.spotRateAsk, format: 'number' },
            { label: 'Spot Spread', value: tradeFx.spotRateSpread, format: 'number' },
            { label: 'Spot Midpoint', value: tradeFx.spotRateMidpoint, format: 'number' },
            { label: 'Forward 6M', value: tradeFx.forwardRate6M, format: 'number' },
          ]}
        />

        {/* FX Volatility & Arb */}
        <MetricCard
          title="FX Volatility & Arb"
          description="Trading opportunities"
          icon={<TrendingUp className="h-5 w-5" />}
          metrics={[
            { label: 'Forward 1Y', value: tradeFx.forwardRate1Y, format: 'number' },
            { label: 'Fwd Points 1M', value: tradeFx.forwardPoints1M, format: 'number' },
            { label: 'Fwd Points 3M', value: tradeFx.forwardPoints3M, format: 'number' },
            { label: 'Cross Rate', value: tradeFx.crossRate, format: 'number' },
            { label: 'Triangular Arb', value: tradeFx.triangularArbitrage, format: 'number', tooltip: 'Arbitrage Opportunity' },
            { label: 'Fwd Premium/Disc', value: tradeFx.forwardPremiumDiscount, format: 'percent' },
            { label: 'Carry Trade Return', value: tradeFx.carryTradeReturn, format: 'percent' },
            { label: 'Interest Diff', value: tradeFx.interestRateDifferential, format: 'percent' },
            { label: 'PPP Rate', value: tradeFx.purchasingPowerParity, format: 'number' },
            { label: 'REER', value: tradeFx.realEffectiveExchangeRate, format: 'number', tooltip: 'Real Effective Exchange Rate' },
          ]}
        />

        {/* FX Options & Vol */}
        <MetricCard
          title="FX Options & Vol"
          description="Volatility metrics"
          icon={<Activity className="h-5 w-5" />}
          metrics={[
            { label: 'Implied Vol 1M', value: tradeFx.impliedVolatility1M, format: 'percent' },
            { label: 'Implied Vol 3M', value: tradeFx.impliedVolatility3M, format: 'percent' },
            { label: 'Historical Vol', value: tradeFx.historicalVolatility, format: 'percent' },
            { label: 'Risk Reversal 25D', value: tradeFx.riskReversal25D, format: 'percent' },
            { label: 'Butterfly 25D', value: tradeFx.butterflySpread25D, format: 'percent' },
          ]}
        />
      </div>
    </div>
  );
}

// ============================================================================
// FIXED INCOME TAB
// ============================================================================

function FixedIncomeTab({ metrics }: { metrics: AllMetrics }) {
  const { bonds, credit } = metrics;

  if (!bonds && !credit) {
    return (
      <div className="text-center py-10 text-gray-500">
        Fixed Income data not available
      </div>
    );
  }

  return (
    <div className="space-y-7">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {/* Bond Yields */}
        {bonds && (
          <>
            <MetricCard
              title="Bond Yields"
              description="Yield metrics"
              icon={<Banknote className="h-5 w-5" />}
              metrics={[
                { label: 'Coupon Rate', value: bonds.couponRate, format: 'percent' },
                { label: 'Current Yield', value: bonds.currentYield, format: 'percent' },
                { label: 'YTM', value: bonds.yieldToMaturity, format: 'percent', tooltip: 'Yield to Maturity' },
                { label: 'YTC', value: bonds.yieldToCall, format: 'percent', tooltip: 'Yield to Call' },
                { label: 'YTW', value: bonds.yieldToWorst, format: 'percent', tooltip: 'Yield to Worst' },
                { label: 'Nominal Yield', value: bonds.nominalYield, format: 'percent' },
                { label: 'Real Yield', value: bonds.realYield, format: 'percent' },
              ]}
            />

            {/* Duration & Convexity */}
            <MetricCard
              title="Duration & Convexity"
              description="Interest rate risk"
              icon={<Activity className="h-5 w-5" />}
              metrics={[
                { label: 'Macaulay Duration', value: bonds.macaulayDuration, format: 'number' },
                { label: 'Modified Duration', value: bonds.modifiedDuration, format: 'number' },
                { label: 'Effective Duration', value: bonds.effectiveDuration, format: 'number' },
                { label: 'Convexity', value: bonds.convexity, format: 'number' },
                { label: 'PV01', value: bonds.priceValue01, format: 'currency', tooltip: 'Price Value of 1bp' },
              ]}
            />

            {/* Bond Pricing */}
            <MetricCard
              title="Bond Pricing"
              description="Price metrics"
              icon={<DollarSign className="h-5 w-5" />}
              metrics={[
                { label: 'Clean Price', value: bonds.cleanPrice, format: 'currency' },
                { label: 'Dirty Price', value: bonds.dirtyPrice, format: 'currency' },
                { label: 'Accrued Interest', value: bonds.accruedInterest, format: 'currency' },
              ]}
            />

            {/* Credit Spreads */}
            <MetricCard
              title="Credit Spreads"
              description="Spread analysis"
              icon={<TrendingUp className="h-5 w-5" />}
              metrics={[
                { label: 'G-Spread', value: bonds.gSpread, format: 'percent', tooltip: 'Spread vs Government' },
                { label: 'I-Spread', value: bonds.iSpread, format: 'percent', tooltip: 'Spread vs Swap' },
                { label: 'Z-Spread', value: bonds.zSpread, format: 'percent', tooltip: 'Zero-volatility spread' },
                { label: 'OAS', value: bonds.oas, format: 'percent', tooltip: 'Option-Adjusted Spread' },
                { label: 'Credit Spread', value: bonds.creditSpread, format: 'percent' },
              ]}
            />
          </>
        )}

        {/* Credit Analysis */}
        {credit && (
          <>
            <MetricCard
              title="Credit Analysis"
              description="Debt quality"
              icon={<CreditCard className="h-5 w-5" />}
              metrics={[
                { label: 'FCF to Debt', value: credit.fcfToTotalDebt, format: 'ratio' },
                { label: 'Ret. Cash Flow/Debt', value: credit.retainedCashFlowToDebt, format: 'ratio' },
                { label: 'EBITDA/Interest', value: credit.ebitdaToInterest, format: 'ratio' },
                { label: 'Net Leverage', value: credit.netLeverage, format: 'ratio' },
                { label: 'Gross Leverage', value: credit.grossLeverage, format: 'ratio' },
                { label: 'Liquidity Coverage', value: credit.liquidityCoverage, format: 'ratio' },
                { label: 'Cash/ST Debt', value: credit.cashToShortTermDebt, format: 'ratio' },
                { label: 'Debt Capacity Ratio', value: credit.debtCapacityRatio, format: 'ratio' },
              ]}
            />

            <MetricCard
              title="Credit Risk"
              description="Default & recovery"
              icon={<Shield className="h-5 w-5" />}
              metrics={[
                { label: 'Prob. of Default', value: credit.probabilityOfDefault, format: 'percent', tooltip: 'Expected default probability' },
                { label: 'Loss Given Default', value: credit.lossGivenDefault, format: 'percent' },
                { label: 'Expected Loss', value: credit.expectedLoss, format: 'percent' },
                { label: 'Secured Leverage', value: credit.securedLeverage, format: 'ratio' },
                { label: 'Distance to Default', value: credit.distanceToDefault, format: 'number', tooltip: 'Merton model metric' },
                { label: 'Credit Spread Dur.', value: credit.creditSpreadDuration, format: 'number' },
                { label: 'Recovery Rate', value: credit.recoveryRate, format: 'percent' },
                { label: "Merton's Model", value: credit.mertonsModel, format: 'number', tooltip: 'Structural credit model' },
              ]}
            />
          </>
        )}
      </div>
    </div>
  );
}

// ============================================================================
// EXTENDED METRICS TAB (New categories: TradeFX, Credit, Options, ESG, Portfolio, etc.)
// ============================================================================

function ExtendedTab({ metrics }: { metrics: AllMetrics }) {
  const { profitability, efficiency, leverage, liquidity, growth, cashFlow, valuation, dcf, risk, technical, other, scores, dupont, industry, macro, tradeFx, credit, bonds, options, portfolio, esg } = metrics;

  return (
    <div className="space-y-7">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {/* Extended Profitability */}
        <MetricCard
          title="Extended Profitability"
          description="Advanced return metrics"
          icon={<PiggyBank className="h-5 w-5" />}
          metrics={[
            { label: 'ROCE', value: profitability.roce, format: 'percent', tooltip: 'Return on Capital Employed' },
            { label: 'RONA', value: profitability.rona, format: 'percent', tooltip: 'Return on Net Assets' },
            { label: 'Cash ROA', value: profitability.cashRoa, format: 'percent', tooltip: 'Cash Return on Assets' },
            { label: 'Cash ROE', value: profitability.cashRoe, format: 'percent', tooltip: 'Cash Return on Equity' },
            { label: 'Pretax Margin', value: profitability.pretaxMargin, format: 'percent' },
            { label: 'EBIT Margin', value: profitability.ebitMargin, format: 'percent' },
            { label: 'Operating ROA', value: profitability.operatingRoa, format: 'percent' },
            { label: 'Economic Profit', value: profitability.economicProfit, format: 'currency', tooltip: 'EVA - Economic Value Added' },
            { label: 'Residual Income', value: profitability.residualIncome, format: 'currency' },
            { label: 'Spread Above WACC', value: profitability.spreadAboveWacc, format: 'percent', tooltip: 'ROIC - WACC', status: getMetricStatus(profitability.spreadAboveWacc, { good: 0.05, bad: -0.02 }) },
          ]}
        />

        {/* DuPont Analysis Extended */}
        <MetricCard
          title="DuPont Analysis"
          description="ROE decomposition"
          icon={<GitBranch className="h-5 w-5" />}
          metrics={[
            { label: 'Net Profit Margin', value: dupont.netProfitMargin, format: 'percent' },
            { label: 'Asset Turnover', value: dupont.assetTurnover, format: 'ratio' },
            { label: 'Equity Multiplier', value: dupont.equityMultiplier, format: 'ratio' },
            { label: 'ROE (DuPont)', value: dupont.roeDupont, format: 'percent', tooltip: 'NPM × AT × EM' },
            { label: 'Operating Margin', value: dupont.operatingMargin, format: 'percent' },
            { label: 'Interest Burden', value: dupont.interestBurden, format: 'ratio', tooltip: 'EBT / EBIT' },
            { label: 'Tax Burden', value: dupont.taxBurden, format: 'ratio', tooltip: 'Net Income / EBT' },
            { label: 'Tax Efficiency', value: dupont.taxEfficiency, format: 'percent' },
            { label: 'Interest Burden Ratio', value: dupont.interestBurdenRatio, format: 'ratio' },
            { label: 'Financial Leverage Ratio', value: dupont.financialLeverageRatio, format: 'ratio' },
          ]}
        />

        {/* Extended Leverage */}
        <MetricCard
          title="Extended Leverage"
          description="Debt structure"
          icon={<Scale className="h-5 w-5" />}
          metrics={[
            { label: 'Net Debt/EBITDA', value: leverage.netDebtToEBITDA, format: 'ratio', status: getMetricStatus(leverage.netDebtToEBITDA, { good: 2, bad: 4 }, true) },
            { label: 'Debt to Capital', value: leverage.debtToCapital, format: 'percent' },
            { label: 'Long Term Debt Ratio', value: leverage.longTermDebtRatio, format: 'percent' },
            { label: 'Fixed Charge Coverage', value: leverage.fixedChargeCoverage, format: 'ratio', status: getMetricStatus(leverage.fixedChargeCoverage, { good: 2.5, bad: 1 }) },
            { label: 'Cash Flow Coverage', value: leverage.cashFlowCoverage, format: 'ratio' },
            { label: 'Times Interest Earned', value: leverage.timesInterestEarned, format: 'ratio' },
            { label: 'Capital Gearing', value: leverage.capitalGearing, format: 'ratio' },
            { label: 'Debt Capacity Util.', value: leverage.debtCapacityUtilization, format: 'percent' },
          ]}
        />

        {/* Extended Liquidity */}
        <MetricCard
          title="Extended Liquidity"
          description="Short-term health"
          icon={<Droplets className="h-5 w-5" />}
          metrics={[
            { label: 'Absolute Liquidity', value: liquidity.absoluteLiquidityRatio, format: 'ratio', tooltip: 'Cash / Current Liabilities' },
            { label: 'Defensive Interval', value: liquidity.defensiveInterval, format: 'number', tooltip: 'Days to cover expenses with cash' },
            { label: 'NWC Ratio', value: liquidity.netWorkingCapitalRatio, format: 'ratio', tooltip: 'Net Working Capital / Total Assets' },
            { label: 'OCF Ratio', value: liquidity.operatingCashFlowRatio, format: 'ratio', tooltip: 'Operating Cash Flow / Current Liabilities' },
            { label: 'Cash Burn Rate', value: liquidity.cashBurnRate, format: 'number', tooltip: 'Months of cash remaining' },
          ]}
        />

        {/* Extended Efficiency */}
        <MetricCard
          title="Extended Efficiency"
          description="Operating cycles"
          icon={<Zap className="h-5 w-5" />}
          metrics={[
            { label: 'Equity Turnover', value: efficiency.equityTurnover, format: 'ratio' },
            { label: 'Capital Employed Turnover', value: efficiency.capitalEmployedTurnover, format: 'ratio' },
            { label: 'Cash Turnover', value: efficiency.cashTurnover, format: 'ratio' },
            { label: 'Operating Cycle', value: efficiency.operatingCycle, format: 'number', tooltip: 'Days from inventory to cash' },
            { label: 'Net Trade Cycle', value: efficiency.netTradeCycle, format: 'number', tooltip: 'Operating cycle - Payables days' },
            { label: 'Asset Utilization', value: efficiency.assetUtilization, format: 'ratio' },
          ]}
        />

        {/* Extended Growth */}
        <MetricCard
          title="Extended Growth"
          description="Comprehensive growth"
          icon={<Sprout className="h-5 w-5" />}
          metrics={[
            { label: 'Net Income Growth', value: growth.netIncomeGrowthYoY, format: 'percent' },
            { label: 'EBITDA Growth', value: growth.ebitdaGrowthYoY, format: 'percent' },
            { label: 'Operating Income Growth', value: growth.operatingIncomeGrowth, format: 'percent' },
            { label: 'Gross Profit Growth', value: growth.grossProfitGrowth, format: 'percent' },
            { label: 'Asset Growth', value: growth.assetGrowthRate, format: 'percent' },
            { label: 'Equity Growth', value: growth.equityGrowthRate, format: 'percent' },
            { label: 'Book Value Growth', value: growth.bookValueGrowthRate, format: 'percent' },
            { label: 'EPS 3Y CAGR', value: growth.eps3YearCAGR, format: 'percent' },
            { label: 'EPS 5Y CAGR', value: growth.eps5YearCAGR, format: 'percent' },
            { label: 'Internal Growth Rate', value: growth.internalGrowthRate, format: 'percent', tooltip: 'ROA × Retention Ratio' },
          ]}
        />

        {/* Extended Cash Flow */}
        <MetricCard
          title="Extended Cash Flow"
          description="Cash efficiency"
          icon={<Wallet className="h-5 w-5" />}
          metrics={[
            { label: 'Levered FCF', value: cashFlow.leveredFreeCashFlow, format: 'currency' },
            { label: 'Unlevered FCF', value: cashFlow.unleveredFreeCashFlow, format: 'currency' },
            { label: 'FCF Margin', value: cashFlow.fcfMargin, format: 'percent' },
            { label: 'FCF Yield', value: cashFlow.fcfYield, format: 'percent', status: getMetricStatus(cashFlow.fcfYield, { good: 0.05, bad: 0.01 }) },
            { label: 'FCF to Debt', value: cashFlow.fcfToDebt, format: 'ratio' },
            { label: 'FCF to Equity', value: cashFlow.fcfToEquity, format: 'ratio' },
            { label: 'OCF Margin', value: cashFlow.operatingCashFlowMargin, format: 'percent' },
            { label: 'CapEx to Revenue', value: cashFlow.capexToRevenue, format: 'percent' },
            { label: 'CapEx to Depreciation', value: cashFlow.capexToDepreciation, format: 'ratio' },
            { label: 'Cash Generation', value: cashFlow.cashGenerationEfficiency, format: 'ratio', tooltip: 'OCF / Net Income' },
          ]}
        />

        {/* Extended Valuation */}
        <MetricCard
          title="Extended Valuation"
          description="Value metrics"
          icon={<Calculator className="h-5 w-5" />}
          metrics={[
            { label: 'Price to FCF', value: valuation.priceToFcf, format: 'ratio' },
            { label: 'EV to FCF', value: valuation.evToFcf, format: 'ratio' },
            { label: 'EV to OCF', value: valuation.evToOcf, format: 'ratio' },
            { label: 'EV/Invested Capital', value: valuation.evToInvestedCapital, format: 'ratio' },
            { label: 'Price/Tangible Book', value: valuation.priceToTangibleBook, format: 'ratio' },
            { label: 'EV Per Share', value: valuation.enterpriseValuePerShare, format: 'currency' },
            { label: "Tobin's Q", value: valuation.tobin_Q, format: 'ratio', tooltip: 'Market Value / Replacement Cost' },
            { label: 'Graham Number', value: valuation.grahamNumber, format: 'currency', tooltip: '√(22.5 × EPS × BVPS)' },
            { label: 'NCAV', value: valuation.netCurrentAssetValue, format: 'currency', tooltip: 'Net Current Asset Value' },
            { label: 'Liquidation Value', value: valuation.liquidationValue, format: 'currency' },
          ]}
        />

        {/* Extended DCF */}
        <MetricCard
          title="Extended DCF"
          description="Intrinsic value analysis"
          icon={<Target className="h-5 w-5" />}
          metrics={[
            { label: 'PV of FCF', value: dcf.pvOfFcf, format: 'currency' },
            { label: 'PV of Terminal Value', value: dcf.pvOfTerminalValue, format: 'currency' },
            { label: 'Equity Value/Share', value: dcf.equityValuePerShare, format: 'currency' },
            { label: 'Margin of Safety', value: dcf.marginOfSafety, format: 'percent', status: getMetricStatus(dcf.marginOfSafety, { good: 0.2, bad: -0.1 }) },
            { label: 'Implied Growth', value: dcf.impliedGrowthRate, format: 'percent', tooltip: 'Growth implied by current price' },
            { label: 'Reverse DCF Growth', value: dcf.reverseDcfGrowth, format: 'percent' },
            { label: 'Exit Multiple', value: dcf.exitMultiple, format: 'ratio' },
            { label: 'Perpetuity Growth', value: dcf.perpetuityGrowthRate, format: 'percent' },
          ]}
        />

        {/* Extended Risk */}
        <MetricCard
          title="Extended Risk"
          description="Risk analytics"
          icon={<Shield className="h-5 w-5" />}
          metrics={[
            { label: 'VaR 99%', value: risk.var99, format: 'percent', tooltip: 'Value at Risk (99% confidence)' },
            { label: 'CVaR 95%', value: risk.cvar95, format: 'percent', tooltip: 'Conditional VaR (Expected Shortfall)' },
            { label: 'CVaR 99%', value: risk.cvar99, format: 'percent' },
            { label: 'Treynor Ratio', value: risk.treynorRatio, format: 'ratio' },
            { label: "Jensen's Alpha", value: risk.jensensAlpha, format: 'percent' },
            { label: 'Modigliani M²', value: risk.modigliani_M2, format: 'percent' },
            { label: 'Omega Ratio', value: risk.omegaRatio, format: 'ratio' },
            { label: 'Calmar Ratio', value: risk.calmarRatio, format: 'ratio' },
            { label: 'Ulcer Index', value: risk.ulcerIndex, format: 'number' },
            { label: 'Tail Ratio', value: risk.tailRatio, format: 'ratio' },
          ]}
        />

        {/* Extended Technical */}
        <MetricCard
          title="Extended Technical"
          description="Advanced indicators"
          icon={<Activity className="h-5 w-5" />}
          metrics={[
            { label: 'MACD Histogram', value: technical.macdHistogram, format: 'number' },
            { label: 'Stochastic %K', value: technical.stochastic_K, format: 'number' },
            { label: 'Stochastic %D', value: technical.stochastic_D, format: 'number' },
            { label: 'Williams %R', value: technical.williamsR, format: 'number' },
            { label: 'CCI', value: technical.cci, format: 'number', tooltip: 'Commodity Channel Index' },
            { label: 'ATR', value: technical.atr, format: 'currency', tooltip: 'Average True Range' },
            { label: 'ATR %', value: technical.atrPercent, format: 'percent' },
            { label: 'ADX', value: technical.adx, format: 'number', tooltip: 'Average Directional Index' },
            { label: '+DI', value: technical.plusDI, format: 'number' },
            { label: '-DI', value: technical.minusDI, format: 'number' },
            { label: 'OBV', value: technical.obv, format: 'number', tooltip: 'On-Balance Volume' },
            { label: 'MFI', value: technical.mfi, format: 'number', tooltip: 'Money Flow Index' },
          ]}
        />

        {/* Extended Scores */}
        <MetricCard
          title="Extended Scores"
          description="Composite ratings"
          icon={<Sparkles className="h-5 w-5" />}
          metrics={[
            { label: 'Momentum Score', value: scores.momentumScore, format: 'score' },
            { label: 'Quality Score', value: scores.qualityScore, format: 'score' },
            { label: 'Stability Score', value: scores.stabilityScore, format: 'score' },
            { label: 'Efficiency Score', value: scores.efficiencyScore, format: 'score' },
            { label: 'Solvency Score', value: scores.solvencyScore, format: 'score' },
            { label: 'Technical Score', value: scores.technicalScore, format: 'score' },
          ]}
        />

        {/* Extended Other Metrics */}
        <MetricCard
          title="Extended Analysis"
          description="Additional metrics"
          icon={<BarChart3 className="h-5 w-5" />}
          metrics={[
            { label: 'Beneish M-Score', value: other.beneishMScore, format: 'number', tooltip: 'Earnings manipulation detector (< -2.22 = Normal)' },
            { label: 'Tangible BV/Share', value: other.tangibleBookValuePerShare, format: 'currency' },
            { label: 'Revenue/Employee', value: other.revenuePerEmployee, format: 'currency' },
            { label: 'Profit/Employee', value: other.profitPerEmployee, format: 'currency' },
            { label: 'Operating Leverage', value: other.operatingLeverage, format: 'ratio', tooltip: 'DOL - Degree of Operating Leverage' },
            { label: 'Financial Leverage', value: other.financialLeverage, format: 'ratio', tooltip: 'DFL - Degree of Financial Leverage' },
            { label: 'Total Leverage', value: other.totalLeverage, format: 'ratio', tooltip: 'DOL × DFL' },
            { label: 'Invested Capital Turnover', value: other.investedCapitalTurnover, format: 'ratio' },
            { label: 'Tax Burden Ratio', value: other.taxBurdenRatio, format: 'percent' },
            { label: 'Operating ROI', value: other.operatingRoi, format: 'percent' },
          ]}
        />

        {/* Trade & FX Metrics */}
        {tradeFx && (
          <MetricCard
            title="Trade & FX"
            description="Currency & trade"
            icon={<Globe className="h-5 w-5" />}
            metrics={[
              { label: 'Terms of Trade', value: tradeFx.termsOfTrade, format: 'ratio' },
              { label: 'Trade Balance', value: tradeFx.tradeBalance, format: 'currency' },
              { label: 'Current Account', value: tradeFx.currentAccount, format: 'currency' },
              { label: 'Spot FX Rate', value: tradeFx.spotRate, format: 'number' },
              { label: 'Forward Rate 1M', value: tradeFx.forwardRate1M, format: 'number' },
              { label: 'Forward Rate 3M', value: tradeFx.forwardRate3M, format: 'number' },
              { label: 'CIP', value: tradeFx.coveredInterestParity, format: 'ratio', tooltip: 'Covered Interest Parity' },
              { label: 'UIP', value: tradeFx.uncoveredInterestParity, format: 'ratio', tooltip: 'Uncovered Interest Parity' },
              { label: 'Real Exchange Rate', value: tradeFx.realExchangeRate, format: 'number' },
              { label: 'PPP Deviation', value: tradeFx.pppDeviation, format: 'percent', tooltip: 'Purchasing Power Parity Deviation' },
            ]}
          />
        )}

        {/* Credit Metrics */}
        {credit && (
          <MetricCard
            title="Credit Analysis"
            description="Debt quality"
            icon={<CreditCard className="h-5 w-5" />}
            metrics={[
              { label: 'FCF to Debt', value: credit.fcfToTotalDebt, format: 'ratio' },
              { label: 'Ret. Cash Flow/Debt', value: credit.retainedCashFlowToDebt, format: 'ratio' },
              { label: 'EBITDA/Interest', value: credit.ebitdaToInterest, format: 'ratio' },
              { label: 'Net Leverage', value: credit.netLeverage, format: 'ratio' },
              { label: 'Gross Leverage', value: credit.grossLeverage, format: 'ratio' },
              { label: 'Liquidity Coverage', value: credit.liquidityCoverage, format: 'ratio' },
              { label: 'Cash/ST Debt', value: credit.cashToShortTermDebt, format: 'ratio' },
              { label: 'Debt Capacity Ratio', value: credit.debtCapacityRatio, format: 'ratio' },
            ]}
          />
        )}

        {/* Bond Metrics (if available) */}
        {bonds && (
          <MetricCard
            title="Bond Metrics"
            description="Fixed income"
            icon={<Banknote className="h-5 w-5" />}
            metrics={[
              { label: 'Coupon Rate', value: bonds.couponRate, format: 'percent' },
              { label: 'Current Yield', value: bonds.currentYield, format: 'percent' },
              { label: 'YTM', value: bonds.yieldToMaturity, format: 'percent', tooltip: 'Yield to Maturity' },
              { label: 'YTC', value: bonds.yieldToCall, format: 'percent', tooltip: 'Yield to Call' },
              { label: 'YTW', value: bonds.yieldToWorst, format: 'percent', tooltip: 'Yield to Worst' },
              { label: 'Nominal Yield', value: bonds.nominalYield, format: 'percent' },
              { label: 'Real Yield', value: bonds.realYield, format: 'percent' },
              { label: 'Macaulay Duration', value: bonds.macaulayDuration, format: 'number' },
              { label: 'Modified Duration', value: bonds.modifiedDuration, format: 'number' },
              { label: 'Effective Duration', value: bonds.effectiveDuration, format: 'number' },
              { label: 'Convexity', value: bonds.convexity, format: 'number' },
              { label: 'Clean Price', value: bonds.cleanPrice, format: 'currency' },
              { label: 'Dirty Price', value: bonds.dirtyPrice, format: 'currency' },
              { label: 'Accrued Interest', value: bonds.accruedInterest, format: 'currency' },
              { label: 'PV01', value: bonds.priceValue01, format: 'currency', tooltip: 'Price Value of 1bp' },
              { label: 'G-Spread', value: bonds.gSpread, format: 'percent', tooltip: 'Spread vs Government' },
              { label: 'I-Spread', value: bonds.iSpread, format: 'percent', tooltip: 'Spread vs Swap' },
              { label: 'Z-Spread', value: bonds.zSpread, format: 'percent', tooltip: 'Zero-volatility spread' },
              { label: 'OAS', value: bonds.oas, format: 'percent', tooltip: 'Option-Adjusted Spread' },
              { label: 'Credit Spread', value: bonds.creditSpread, format: 'percent' },
            ]}
          />
        )}

        {/* Options Metrics (if available) */}
        {options && (
          <MetricCard
            title="Options Greeks"
            description="Sensitivity analysis"
            icon={<LineChart className="h-5 w-5" />}
            metrics={[
              { label: 'Delta', value: options.delta, format: 'number', tooltip: 'Price sensitivity to underlying' },
              { label: 'Gamma', value: options.gamma, format: 'number', tooltip: 'Delta sensitivity' },
              { label: 'Theta', value: options.theta, format: 'currency', tooltip: 'Time decay per day' },
              { label: 'Vega', value: options.vega, format: 'currency', tooltip: 'Volatility sensitivity' },
              { label: 'Rho', value: options.rho, format: 'currency', tooltip: 'Interest rate sensitivity' },
              { label: 'Vanna', value: options.vanna, format: 'number', tooltip: 'Delta sensitivity to vol' },
              { label: 'Volga', value: options.volga, format: 'number', tooltip: 'Vega sensitivity to vol' },
              { label: 'Charm', value: options.charm, format: 'number', tooltip: 'Delta decay' },
              { label: 'Implied Vol', value: options.impliedVolatility, format: 'percent' },
              { label: 'Historical Vol', value: options.historicalVolatility, format: 'percent' },
              { label: 'Vol Skew', value: options.volatilitySkew, format: 'number' },
              { label: 'IV Rank', value: options.ivRank, format: 'percent' },
              { label: 'IV Percentile', value: options.ivPercentile, format: 'percent' },
              { label: 'Intrinsic Value', value: options.intrinsicValue, format: 'currency' },
              { label: 'Time Value', value: options.timeValue, format: 'currency' },
              { label: 'Moneyness', value: options.moneyness, format: 'percent' },
              { label: 'P(ITM)', value: options.probabilityITM, format: 'percent', tooltip: 'Probability In-The-Money' },
              { label: 'P(OTM)', value: options.probabilityOTM, format: 'percent', tooltip: 'Probability Out-of-Money' },
              { label: 'Expected Move', value: options.expectedMove, format: 'currency', tooltip: '1 std dev expected price move' },
            ]}
          />
        )}

        {/* ESG Metrics */}
        {esg && (
          <MetricCard
            title="ESG Metrics"
            description="Environmental, Social, Governance"
            icon={<Sprout className="h-5 w-5" />}
            metrics={[
              { label: 'ESG Score', value: esg.esgScore, format: 'score' },
              { label: 'Environmental', value: esg.environmentalScore, format: 'score' },
              { label: 'Social', value: esg.socialScore, format: 'score' },
              { label: 'Governance', value: esg.governanceScore, format: 'score' },
              { label: 'Carbon Intensity', value: esg.carbonIntensity, format: 'number', tooltip: 'CO2 tons per $M revenue' },
              { label: 'Carbon Footprint', value: esg.carbonFootprint, format: 'number', tooltip: 'Total CO2 emissions' },
              { label: 'Energy Intensity', value: esg.energyIntensity, format: 'number' },
              { label: 'Water Usage', value: esg.waterUsage, format: 'number' },
              { label: 'Waste Generation', value: esg.wasteGeneration, format: 'number' },
              { label: 'Employee Satisfaction', value: esg.employeeSatisfaction, format: 'percent' },
              { label: 'Diversity Ratio', value: esg.diversityRatio, format: 'percent' },
              { label: 'Safety Incidents', value: esg.safetyIncidents, format: 'number' },
              { label: 'Board Independence', value: esg.boardIndependence, format: 'percent' },
              { label: 'Exec Comp Ratio', value: esg.executiveCompRatio, format: 'ratio', tooltip: 'CEO pay vs median worker' },
            ]}
          />
        )}

        {/* Portfolio Metrics - Enhanced Professional Design */}
        {portfolio && (
          <div className="col-span-full space-y-4">
            {/* Portfolio Header */}
            <div className="flex items-center gap-3 mb-2">
              <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-indigo-500/20 to-purple-500/10 border border-indigo-500/20 flex items-center justify-center">
                <Layers className="h-5 w-5 text-indigo-400" />
              </div>
              <div>
                <h3 className="text-base font-semibold text-white">Portfolio Analytics</h3>
                <p className="text-xs text-gray-500">Comprehensive risk-adjusted performance metrics</p>
              </div>
            </div>

            {/* Performance & Returns Section */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
              {/* Portfolio Return Card */}
              <div className="glass-premium rounded-xl p-4 border border-white/[0.06] hover:border-emerald-500/20 transition-colors">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-medium text-gray-400 uppercase tracking-wider">Total Return</span>
                  <TrendingUp className="h-4 w-4 text-emerald-400" />
                </div>
                <div className="text-2xl font-bold text-white mb-1">
                  {portfolio.portfolioReturn !== null ? `${(portfolio.portfolioReturn * 100).toFixed(2)}%` : '—'}
                </div>
                <div className="text-xs text-gray-500">Portfolio performance</div>
              </div>

              {/* Alpha Card */}
              <div className="glass-premium rounded-xl p-4 border border-white/[0.06] hover:border-purple-500/20 transition-colors">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-medium text-gray-400 uppercase tracking-wider">Alpha</span>
                  <Activity className="h-4 w-4 text-purple-400" />
                </div>
                <div className={cn(
                  'text-2xl font-bold mb-1',
                  portfolio.portfolioAlpha && portfolio.portfolioAlpha > 0 ? 'text-emerald-400' : 
                  portfolio.portfolioAlpha && portfolio.portfolioAlpha < 0 ? 'text-red-400' : 'text-white'
                )}>
                  {portfolio.portfolioAlpha !== null ? `${(portfolio.portfolioAlpha * 100).toFixed(2)}%` : '—'}
                </div>
                <div className="text-xs text-gray-500">Excess return vs benchmark</div>
              </div>

              {/* Beta Card */}
              <div className="glass-premium rounded-xl p-4 border border-white/[0.06] hover:border-blue-500/20 transition-colors">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-medium text-gray-400 uppercase tracking-wider">Beta</span>
                  <BarChart3 className="h-4 w-4 text-blue-400" />
                </div>
                <div className="text-2xl font-bold text-white mb-1">
                  {portfolio.portfolioBeta !== null ? portfolio.portfolioBeta.toFixed(2) : '—'}
                </div>
                <div className="text-xs text-gray-500">Market sensitivity</div>
              </div>

              {/* Sharpe Ratio Card */}
              <div className="glass-premium rounded-xl p-4 border border-white/[0.06] hover:border-cyan-500/20 transition-colors">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-medium text-gray-400 uppercase tracking-wider">Sharpe Ratio</span>
                  <Target className="h-4 w-4 text-cyan-400" />
                </div>
                <div className={cn(
                  'text-2xl font-bold mb-1',
                  portfolio.portfolioSharpe && portfolio.portfolioSharpe >= 1 ? 'text-emerald-400' : 
                  portfolio.portfolioSharpe && portfolio.portfolioSharpe >= 0.5 ? 'text-amber-400' : 'text-white'
                )}>
                  {portfolio.portfolioSharpe !== null ? portfolio.portfolioSharpe.toFixed(2) : '—'}
                </div>
                <div className="text-xs text-gray-500">Risk-adjusted return</div>
              </div>
            </div>

            {/* Detailed Metrics Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Returns Analysis */}
              <div className="glass-premium rounded-xl p-4 border border-white/[0.06]">
                <h4 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
                  <div className="w-1 h-4 bg-emerald-500 rounded-full" />
                  Returns Analysis
                </h4>
                <div className="space-y-3">
                  {[
                    { label: 'Excess Return', value: portfolio.excessReturn, format: 'percent' },
                    { label: 'Active Return', value: portfolio.activeReturn, format: 'percent' },
                    { label: 'Sector Allocation', value: portfolio.sectorAllocation, format: 'percent' },
                    { label: 'Security Selection', value: portfolio.securitySelection, format: 'percent' },
                    { label: 'Interaction Effect', value: portfolio.interactionEffect, format: 'percent' },
                  ].map((item) => (
                    <div key={item.label} className="flex items-center justify-between py-1.5 border-b border-white/[0.04] last:border-0">
                      <span className="text-xs text-gray-400">{item.label}</span>
                      <span className={cn(
                        'text-sm font-medium',
                        item.value && item.value > 0 ? 'text-emerald-400' : 
                        item.value && item.value < 0 ? 'text-red-400' : 'text-white'
                      )}>
                        {item.value !== null ? `${(item.value * 100).toFixed(2)}%` : '—'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Risk Metrics */}
              <div className="glass-premium rounded-xl p-4 border border-white/[0.06]">
                <h4 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
                  <div className="w-1 h-4 bg-red-500 rounded-full" />
                  Risk Metrics
                </h4>
                <div className="space-y-3">
                  {[
                    { label: 'Volatility', value: portfolio.portfolioVolatility, format: 'percent' },
                    { label: 'Systematic Risk', value: portfolio.systematicRisk, format: 'percent' },
                    { label: 'Unsystematic Risk', value: portfolio.unsystematicRisk, format: 'percent' },
                    { label: 'Correlation w/ Benchmark', value: portfolio.correlationWithBenchmark, format: 'ratio' },
                    { label: 'R-Squared', value: portfolio.rSquared, format: 'percent' },
                  ].map((item) => (
                    <div key={item.label} className="flex items-center justify-between py-1.5 border-b border-white/[0.04] last:border-0">
                      <span className="text-xs text-gray-400">{item.label}</span>
                      <span className="text-sm font-medium text-white">
                        {item.value !== null 
                          ? item.format === 'percent' 
                            ? `${(item.value * 100).toFixed(2)}%` 
                            : item.value.toFixed(2)
                          : '—'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Performance Ratios */}
              <div className="glass-premium rounded-xl p-4 border border-white/[0.06]">
                <h4 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
                  <div className="w-1 h-4 bg-cyan-500 rounded-full" />
                  Performance Ratios
                </h4>
                <div className="space-y-3">
                  {[
                    { label: 'Sortino Ratio', value: portfolio.portfolioSortino },
                    { label: 'Treynor Ratio', value: portfolio.portfolioTreynor },
                    { label: 'Information Ratio', value: portfolio.portfolioInformationRatio },
                    { label: 'Diversification Ratio', value: portfolio.diversificationRatio },
                    { label: 'Effective Bets', value: portfolio.effectiveNumberOfBets },
                  ].map((item) => (
                    <div key={item.label} className="flex items-center justify-between py-1.5 border-b border-white/[0.04] last:border-0">
                      <span className="text-xs text-gray-400">{item.label}</span>
                      <span className={cn(
                        'text-sm font-medium',
                        item.value && item.value >= 1 ? 'text-emerald-400' : 
                        item.value && item.value >= 0.5 ? 'text-amber-400' : 'text-white'
                      )}>
                        {item.value !== null ? item.value.toFixed(2) : '—'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Concentration Metrics */}
            <div className="glass-premium rounded-xl p-4 border border-white/[0.06]">
              <h4 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
                <div className="w-1 h-4 bg-amber-500 rounded-full" />
                Portfolio Concentration
              </h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-3 rounded-lg bg-white/[0.02]">
                  <div className="text-xs text-gray-500 mb-1">HHI Index</div>
                  <div className="text-lg font-bold text-white">
                    {portfolio.herfindahlIndex !== null ? portfolio.herfindahlIndex.toFixed(0) : '—'}
                  </div>
                  <div className="text-[10px] text-gray-600 mt-1">Concentration measure</div>
                </div>
                <div className="text-center p-3 rounded-lg bg-white/[0.02]">
                  <div className="text-xs text-gray-500 mb-1">Effective Bets</div>
                  <div className="text-lg font-bold text-white">
                    {portfolio.effectiveNumberOfBets !== null ? portfolio.effectiveNumberOfBets.toFixed(1) : '—'}
                  </div>
                  <div className="text-[10px] text-gray-600 mt-1">Independent positions</div>
                </div>
                <div className="text-center p-3 rounded-lg bg-white/[0.02]">
                  <div className="text-xs text-gray-500 mb-1">Diversification</div>
                  <div className="text-lg font-bold text-white">
                    {portfolio.diversificationRatio !== null ? portfolio.diversificationRatio.toFixed(2) : '—'}
                  </div>
                  <div className="text-[10px] text-gray-600 mt-1">Risk reduction</div>
                </div>
                <div className="text-center p-3 rounded-lg bg-white/[0.02]">
                  <div className="text-xs text-gray-500 mb-1">R-Squared</div>
                  <div className="text-lg font-bold text-white">
                    {portfolio.rSquared !== null ? `${(portfolio.rSquared * 100).toFixed(1)}%` : '—'}
                  </div>
                  <div className="text-[10px] text-gray-600 mt-1">Benchmark fit</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Trade & FX Extended */}
        {tradeFx && (
          <MetricCard
            title="Trade & FX Extended"
            description="Advanced FX metrics"
            icon={<Globe className="h-5 w-5" />}
            metrics={[
              { label: 'Capital Account', value: tradeFx.capitalAccount, format: 'currency' },
              { label: 'Net Exports', value: tradeFx.netExports, format: 'currency' },
              { label: 'S-I Gap', value: tradeFx.savingInvestmentGap, format: 'currency', tooltip: 'Saving-Investment Gap' },
              { label: 'Export Growth', value: tradeFx.exportGrowthRate, format: 'percent' },
              { label: 'Import Growth', value: tradeFx.importGrowthRate, format: 'percent' },
              { label: 'Spot Bid', value: tradeFx.spotRateBid, format: 'number' },
              { label: 'Spot Ask', value: tradeFx.spotRateAsk, format: 'number' },
              { label: 'Spot Spread', value: tradeFx.spotRateSpread, format: 'number' },
              { label: 'Spot Midpoint', value: tradeFx.spotRateMidpoint, format: 'number' },
              { label: 'Forward 6M', value: tradeFx.forwardRate6M, format: 'number' },
              { label: 'Forward 1Y', value: tradeFx.forwardRate1Y, format: 'number' },
              { label: 'Fwd Points 1M', value: tradeFx.forwardPoints1M, format: 'number' },
              { label: 'Fwd Points 3M', value: tradeFx.forwardPoints3M, format: 'number' },
              { label: 'Cross Rate', value: tradeFx.crossRate, format: 'number' },
              { label: 'Triangular Arb', value: tradeFx.triangularArbitrage, format: 'number', tooltip: 'Arbitrage Opportunity' },
              { label: 'Fwd Premium/Disc', value: tradeFx.forwardPremiumDiscount, format: 'percent' },
              { label: 'Carry Trade Return', value: tradeFx.carryTradeReturn, format: 'percent' },
              { label: 'Interest Diff', value: tradeFx.interestRateDifferential, format: 'percent' },
              { label: 'PPP Rate', value: tradeFx.purchasingPowerParity, format: 'number' },
              { label: 'REER', value: tradeFx.realEffectiveExchangeRate, format: 'number', tooltip: 'Real Effective Exchange Rate' },
              { label: 'Implied Vol 1M', value: tradeFx.impliedVolatility1M, format: 'percent' },
              { label: 'Implied Vol 3M', value: tradeFx.impliedVolatility3M, format: 'percent' },
              { label: 'Historical Vol', value: tradeFx.historicalVolatility, format: 'percent' },
              { label: 'Risk Reversal 25D', value: tradeFx.riskReversal25D, format: 'percent' },
              { label: 'Butterfly 25D', value: tradeFx.butterflySpread25D, format: 'percent' },
            ]}
          />
        )}

        {/* Credit Extended */}
        {credit && (
          <MetricCard
            title="Credit Extended"
            description="Credit risk analysis"
            icon={<CreditCard className="h-5 w-5" />}
            metrics={[
              { label: 'Prob. of Default', value: credit.probabilityOfDefault, format: 'percent', tooltip: 'Expected default probability' },
              { label: 'Loss Given Default', value: credit.lossGivenDefault, format: 'percent' },
              { label: 'Expected Loss', value: credit.expectedLoss, format: 'percent' },
              { label: 'Secured Leverage', value: credit.securedLeverage, format: 'ratio' },
              { label: 'Distance to Default', value: credit.distanceToDefault, format: 'number', tooltip: 'Merton model metric' },
              { label: 'Credit Spread Dur.', value: credit.creditSpreadDuration, format: 'number' },
              { label: 'Recovery Rate', value: credit.recoveryRate, format: 'percent' },
              { label: "Merton's Model", value: credit.mertonsModel, format: 'number', tooltip: 'Structural credit model' },
            ]}
          />
        )}

        {/* Industry Extended */}
        <MetricCard
          title="Industry Extended"
          description="Sector analysis"
          icon={<BarChart3 className="h-5 w-5" />}
          metrics={[
            { label: 'Industry PE', value: industry.industryPE, format: 'ratio' },
            { label: 'Industry PB', value: industry.industryPB, format: 'ratio' },
            { label: 'Industry ROE', value: industry.industryROE, format: 'percent' },
            { label: 'Industry ROIC', value: industry.industryROIC, format: 'percent' },
            { label: 'Industry Gross Margin', value: industry.industryGrossMargin, format: 'percent' },
            { label: 'Industry Beta', value: industry.industryBeta, format: 'number' },
            { label: 'CR8', value: industry.cr8, format: 'percent', tooltip: 'Top 8 firms concentration' },
            { label: 'Relative Valuation', value: industry.relativeValuation, format: 'ratio', tooltip: 'vs Industry avg' },
            { label: 'Sector Rotation', value: industry.sectorRotationScore, format: 'score' },
            { label: 'Competitive Position', value: industry.competitivePosition, format: 'score' },
          ]}
        />

        {/* Moving Averages */}
        <MetricCard
          title="Moving Averages"
          description="Price trends"
          icon={<TrendingUp className="h-5 w-5" />}
          metrics={[
            { label: 'EMA 12', value: technical.ema12, format: 'currency' },
            { label: 'EMA 26', value: technical.ema26, format: 'currency' },
            { label: 'SMA 10', value: technical.sma10, format: 'currency' },
            { label: 'SMA 20', value: technical.sma20, format: 'currency' },
            { label: 'SMA 100', value: technical.sma100, format: 'currency' },
            { label: 'Price/SMA50', value: technical.priceToSMA50, format: 'percent' },
            { label: 'Price/SMA200', value: technical.priceToSMA200, format: 'percent' },
            { label: 'Trend Strength', value: technical.trendStrength, format: 'number' },
            { label: 'Support Level', value: technical.supportLevel, format: 'currency' },
            { label: 'Resistance Level', value: technical.resistanceLevel, format: 'currency' },
          ]}
        />

        {/* Risk Extended */}
        <MetricCard
          title="Risk Extended"
          description="Capture ratios"
          icon={<Shield className="h-5 w-5" />}
          metrics={[
            { label: 'Tracking Error', value: risk.trackingError, format: 'percent' },
            { label: 'Info Ratio', value: risk.informationRatio, format: 'ratio' },
            { label: 'Pain Index', value: risk.painIndex, format: 'percent' },
            { label: 'Upside Capture', value: risk.upsideCapture, format: 'percent', tooltip: 'Performance in up markets' },
            { label: 'Downside Capture', value: risk.downsideCapture, format: 'percent', tooltip: 'Performance in down markets' },
          ]}
        />

        {/* Growth Extended */}
        <MetricCard
          title="Growth Extended"
          description="Additional growth"
          icon={<Sprout className="h-5 w-5" />}
          metrics={[
            { label: 'Plowback Ratio', value: growth.plowbackRatio, format: 'percent', tooltip: 'Reinvestment rate' },
            { label: 'Sustainable Growth', value: growth.sustainableGrowthRate, format: 'percent', tooltip: 'ROE × Retention' },
            { label: 'Retention Ratio', value: growth.retentionRatio, format: 'percent' },
            { label: 'Payout Ratio', value: growth.payoutRatio, format: 'percent' },
            { label: 'DPS Growth', value: growth.dpsGrowth, format: 'percent', tooltip: 'Dividend Per Share Growth' },
            { label: 'FCF Growth', value: growth.fcfGrowth, format: 'percent' },
            { label: 'Revenue 5Y CAGR', value: growth.revenue5YearCAGR, format: 'percent' },
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
  const { scores, profitability, growth, valuation, leverage, liquidity, dcf, risk } = metrics;

  // Generate AI insights based on metrics
  const insights = generateInsights(metrics);

  // Helper to format percentage
  const formatPct = (val: number | null | undefined) => {
    if (val == null) return 'N/A';
    return `${(val * 100).toFixed(1)}%`;
  };

  // Helper to format number
  const formatNum = (val: number | null | undefined, decimals = 2) => {
    if (val == null) return 'N/A';
    return val.toFixed(decimals);
  };

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
            <p className="text-sm text-gray-500">Powered by Deepin AI</p>
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

      {/* Score Calculation Breakdown Section */}
      <div className="relative overflow-hidden rounded-2xl p-7 glass-premium animate-fade-up" style={{ animationDelay: '150ms' }}>
        {/* Premium gradient accent */}
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-500 via-cyan-500 to-violet-500" />
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-bl from-emerald-500/5 via-cyan-500/5 to-transparent pointer-events-none" />
        
        <div className="relative flex items-center gap-4 mb-6">
          <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-emerald-500/30 to-cyan-600/20 border border-emerald-500/30 flex items-center justify-center shadow-lg shadow-emerald-500/10">
            <Calculator className="h-6 w-6 text-emerald-400" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white flex items-center gap-2">
              Score Calculation Breakdown
              <span className="px-2 py-0.5 text-[10px] font-bold bg-gradient-to-r from-emerald-500 to-cyan-500 text-white rounded-full">
                AI Powered
              </span>
            </h3>
            <p className="text-sm text-gray-500">How each score is calculated with your actual metrics</p>
          </div>
        </div>

        <div className="relative space-y-6">
          {/* Overall Score */}
          <div className="p-5 rounded-xl bg-gradient-to-r from-orange-500/5 to-amber-500/5 border border-orange-500/20">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <Target className="h-5 w-5 text-orange-400" />
                <h4 className="font-semibold text-orange-400">Overall Score</h4>
              </div>
              <span className="text-2xl font-bold text-orange-400">{scores.totalScore ?? 'N/A'}/100</span>
            </div>
            <p className="text-sm text-gray-400 mb-3">Weighted average of all category scores:</p>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-xs">
              <div className="p-2 rounded-lg bg-black/20 text-center">
                <div className="text-gray-500">Profitability</div>
                <div className="text-white font-medium">25%</div>
              </div>
              <div className="p-2 rounded-lg bg-black/20 text-center">
                <div className="text-gray-500">Growth</div>
                <div className="text-white font-medium">20%</div>
              </div>
              <div className="p-2 rounded-lg bg-black/20 text-center">
                <div className="text-gray-500">Valuation</div>
                <div className="text-white font-medium">20%</div>
              </div>
              <div className="p-2 rounded-lg bg-black/20 text-center">
                <div className="text-gray-500">Risk</div>
                <div className="text-white font-medium">15%</div>
              </div>
              <div className="p-2 rounded-lg bg-black/20 text-center">
                <div className="text-gray-500">Health</div>
                <div className="text-white font-medium">20%</div>
              </div>
            </div>
          </div>

          {/* Profitability Score */}
          <div className="p-5 rounded-xl bg-gradient-to-r from-cyan-500/5 to-teal-500/5 border border-cyan-500/20">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <PiggyBank className="h-5 w-5 text-cyan-400" />
                <h4 className="font-semibold text-cyan-400">Profitability Score</h4>
              </div>
              <span className="text-2xl font-bold text-cyan-400">{scores.profitabilityScore ?? 'N/A'}/100</span>
            </div>
            <p className="text-sm text-gray-400 mb-3">Based on margin and return metrics (each 20% weight):</p>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-xs">
              <div className="p-2 rounded-lg bg-black/20">
                <div className="text-gray-500">Gross Margin</div>
                <div className="text-cyan-400 font-medium">{formatPct(profitability.grossProfitMargin)}</div>
              </div>
              <div className="p-2 rounded-lg bg-black/20">
                <div className="text-gray-500">Operating Margin</div>
                <div className="text-cyan-400 font-medium">{formatPct(profitability.operatingProfitMargin)}</div>
              </div>
              <div className="p-2 rounded-lg bg-black/20">
                <div className="text-gray-500">Net Margin</div>
                <div className="text-cyan-400 font-medium">{formatPct(profitability.netProfitMargin)}</div>
              </div>
              <div className="p-2 rounded-lg bg-black/20">
                <div className="text-gray-500">ROE</div>
                <div className="text-cyan-400 font-medium">{formatPct(profitability.roe)}</div>
              </div>
              <div className="p-2 rounded-lg bg-black/20">
                <div className="text-gray-500">ROIC</div>
                <div className="text-cyan-400 font-medium">{formatPct(profitability.roic)}</div>
              </div>
            </div>
          </div>

          {/* Growth Score */}
          <div className="p-5 rounded-xl bg-gradient-to-r from-pink-500/5 to-rose-500/5 border border-pink-500/20">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <Sprout className="h-5 w-5 text-pink-400" />
                <h4 className="font-semibold text-pink-400">Growth Score</h4>
              </div>
              <span className="text-2xl font-bold text-pink-400">{scores.growthScore ?? 'N/A'}/100</span>
            </div>
            <p className="text-sm text-gray-400 mb-3">Based on growth rates:</p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
              <div className="p-2 rounded-lg bg-black/20">
                <div className="text-gray-500">Revenue YoY (30%)</div>
                <div className="text-pink-400 font-medium">{formatPct(growth.revenueGrowthYoY)}</div>
              </div>
              <div className="p-2 rounded-lg bg-black/20">
                <div className="text-gray-500">EPS YoY (30%)</div>
                <div className="text-pink-400 font-medium">{formatPct(growth.epsGrowthYoY)}</div>
              </div>
              <div className="p-2 rounded-lg bg-black/20">
                <div className="text-gray-500">FCF Growth (20%)</div>
                <div className="text-pink-400 font-medium">{formatPct(growth.fcfGrowth)}</div>
              </div>
              <div className="p-2 rounded-lg bg-black/20">
                <div className="text-gray-500">3Y CAGR (20%)</div>
                <div className="text-pink-400 font-medium">{formatPct(growth.revenue3YearCAGR)}</div>
              </div>
            </div>
          </div>

          {/* Valuation Score */}
          <div className="p-5 rounded-xl bg-gradient-to-r from-red-500/5 to-orange-500/5 border border-red-500/20">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <Calculator className="h-5 w-5 text-red-400" />
                <h4 className="font-semibold text-red-400">Valuation Score</h4>
              </div>
              <span className="text-2xl font-bold text-red-400">{scores.valuationScore ?? 'N/A'}/100</span>
            </div>
            <p className="text-sm text-gray-400 mb-3">
              <span className="text-red-400">Inverse scoring</span> - Lower valuations = Higher score:
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
              <div className="p-2 rounded-lg bg-black/20">
                <div className="text-gray-500">P/E Ratio (30%)</div>
                <div className="text-red-400 font-medium">{formatNum(valuation.peRatio, 1)}x</div>
              </div>
              <div className="p-2 rounded-lg bg-black/20">
                <div className="text-gray-500">P/B Ratio (25%)</div>
                <div className="text-red-400 font-medium">{formatNum(valuation.pbRatio)}x</div>
              </div>
              <div className="p-2 rounded-lg bg-black/20">
                <div className="text-gray-500">PEG Ratio (25%)</div>
                <div className="text-red-400 font-medium">{formatNum(valuation.pegRatio)}x</div>
              </div>
              <div className="p-2 rounded-lg bg-black/20">
                <div className="text-gray-500">EV/EBITDA (20%)</div>
                <div className="text-red-400 font-medium">{formatNum(valuation.evToEBITDA, 1)}x</div>
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              * Benchmarks: P/E 5-50, P/B 0.5-10, PEG 0.5-3, EV/EBITDA 3-25
            </p>
          </div>

          {/* Risk Score */}
          <div className="p-5 rounded-xl bg-gradient-to-r from-purple-500/5 to-violet-500/5 border border-purple-500/20">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <Shield className="h-5 w-5 text-purple-400" />
                <h4 className="font-semibold text-purple-400">Risk Score</h4>
              </div>
              <span className="text-2xl font-bold text-purple-400">{scores.riskScore ?? 'N/A'}/100</span>
            </div>
            <p className="text-sm text-gray-400 mb-3">
              <span className="text-purple-400">Inverse scoring</span> - Lower risk = Higher score:
            </p>
            <div className="grid grid-cols-3 gap-2 text-xs">
              <div className="p-2 rounded-lg bg-black/20">
                <div className="text-gray-500">Beta (35%)</div>
                <div className="text-purple-400 font-medium">{formatNum(dcf.beta)}</div>
              </div>
              <div className="p-2 rounded-lg bg-black/20">
                <div className="text-gray-500">Volatility (35%)</div>
                <div className="text-purple-400 font-medium">{formatPct(risk.standardDeviation)}</div>
              </div>
              <div className="p-2 rounded-lg bg-black/20">
                <div className="text-gray-500">Sharpe Ratio (30%)</div>
                <div className="text-purple-400 font-medium">{formatNum(risk.sharpeRatio)}</div>
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              * Benchmarks: Beta 0.5-2.0, Volatility 10%-60%
            </p>
          </div>

          {/* Health Score */}
          <div className="p-5 rounded-xl bg-gradient-to-r from-amber-500/5 to-yellow-500/5 border border-amber-500/20">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <Activity className="h-5 w-5 text-amber-400" />
                <h4 className="font-semibold text-amber-400">Health Score</h4>
              </div>
              <span className="text-2xl font-bold text-amber-400">{scores.healthScore ?? 'N/A'}/100</span>
            </div>
            <p className="text-sm text-gray-400 mb-3">Based on liquidity and solvency (each 25% weight):</p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
              <div className="p-2 rounded-lg bg-black/20">
                <div className="text-gray-500">Current Ratio</div>
                <div className="text-amber-400 font-medium">{formatNum(liquidity.currentRatio)}x</div>
              </div>
              <div className="p-2 rounded-lg bg-black/20">
                <div className="text-gray-500">Quick Ratio</div>
                <div className="text-amber-400 font-medium">{formatNum(liquidity.quickRatio)}x</div>
              </div>
              <div className="p-2 rounded-lg bg-black/20">
                <div className="text-gray-500">Debt/Equity ↓</div>
                <div className="text-amber-400 font-medium">{formatNum(leverage.debtToEquity)}x</div>
              </div>
              <div className="p-2 rounded-lg bg-black/20">
                <div className="text-gray-500">Interest Coverage</div>
                <div className="text-amber-400 font-medium">{formatNum(leverage.interestCoverage, 1)}x</div>
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              * Benchmarks: Current 0.5-3.0, Quick 0.3-2.5, D/E 0-3.0, Interest 0-20x
            </p>
          </div>
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
  const [isSticky, setIsSticky] = useState(false);
  const tabsRef = useRef<HTMLDivElement>(null);

  // Detect when tabs should become sticky
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsSticky(!entry.isIntersecting);
      },
      { threshold: [1], rootMargin: '-1px 0px 0px 0px' }
    );

    if (tabsRef.current) {
      observer.observe(tabsRef.current);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <div className="space-y-7">
      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as MetricsTabValue)} className="w-full">
        {/* Sticky Tabs Wrapper */}
        <div 
          ref={tabsRef}
          className={cn(
            'sticky top-[100px] sm:top-[110px] md:top-[120px] z-30 transition-all duration-300',
            isSticky && 'shadow-lg shadow-black/20 backdrop-blur-xl'
          )}
          style={{
            backgroundColor: isSticky ? 'rgba(10, 13, 18, 0.95)' : 'transparent',
          }}
        >
          {/* Premium Tab List */}
          <TabsList className={cn(
            'w-full justify-start glass-premium rounded-xl sm:rounded-2xl p-1 sm:p-1.5 h-auto flex-wrap gap-0.5 sm:gap-1',
            'overflow-x-auto scrollbar-hide',
            isSticky && 'rounded-none border-b border-white/10'
          )}>
          {TABS.map((tab, index) => (
            <TabsTrigger
              key={tab.value}
              value={tab.value}
              className={cn(
                'flex items-center gap-1.5 sm:gap-2.5 px-3 sm:px-5 py-2 sm:py-3 rounded-lg sm:rounded-xl text-xs sm:text-sm font-medium transition-all duration-300',
                'whitespace-nowrap',
                'data-[state=active]:bg-gradient-to-r data-[state=active]:from-cyan-500 data-[state=active]:to-blue-500',
                'data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:shadow-cyan-500/20',
                'data-[state=inactive]:text-gray-400 data-[state=inactive]:hover:text-white',
                'data-[state=inactive]:hover:bg-white/5'
              )}
              style={{ animationDelay: `${index * 30}ms` }}
            >
              <tab.icon className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              <span className="hidden sm:inline">{tab.label}</span>
            </TabsTrigger>
          ))}
        </TabsList>
        </div>

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

        <TabsContent value="risk" className="mt-7 animate-fade-up">
          <RiskTab metrics={metrics} />
        </TabsContent>

        <TabsContent value="tradefx" className="mt-7 animate-fade-up">
          <TradeFXTab metrics={metrics} />
        </TabsContent>

        <TabsContent value="fixedincome" className="mt-7 animate-fade-up">
          <FixedIncomeTab metrics={metrics} />
        </TabsContent>

        <TabsContent value="ai" className="mt-7 animate-fade-up">
          <AIAnalysisTab metrics={metrics} symbol={symbol} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
