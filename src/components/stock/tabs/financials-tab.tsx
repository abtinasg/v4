'use client';

import { MetricCard } from '../metric-card';
import type { AllMetrics } from '../../../../lib/metrics/types';
import type { MetricItem } from '../types';
import {
  DollarSign,
  Droplets,
  Building2,
  Settings,
  Banknote,
  TrendingUp,
  Layers,
} from 'lucide-react';

interface FinancialsTabProps {
  metrics: AllMetrics;
}

// Helper to determine status based on value thresholds
function getMetricStatus(value: number | null, thresholds: { good: number; bad: number; higherIsBetter?: boolean }): MetricItem['status'] {
  if (value === null) return 'neutral';
  const { good, bad, higherIsBetter = true } = thresholds;
  
  if (higherIsBetter) {
    if (value >= good) return 'positive';
    if (value <= bad) return 'negative';
  } else {
    if (value <= good) return 'positive';
    if (value >= bad) return 'negative';
  }
  return 'neutral';
}

export function FinancialsTab({ metrics }: FinancialsTabProps) {
  // =========================================================================
  // PROFITABILITY METRICS (8 metrics)
  // =========================================================================
  const profitabilityMetrics: MetricItem[] = [
    {
      label: 'Gross Profit Margin',
      value: metrics.profitability.grossProfitMargin,
      format: 'percent',
      status: getMetricStatus(metrics.profitability.grossProfitMargin, { good: 0.4, bad: 0.2 }),
      tooltip: 'Revenue minus cost of goods sold, divided by revenue. Higher is better.',
    },
    {
      label: 'Operating Margin',
      value: metrics.profitability.operatingProfitMargin,
      format: 'percent',
      status: getMetricStatus(metrics.profitability.operatingProfitMargin, { good: 0.2, bad: 0.05 }),
      tooltip: 'Operating income divided by revenue. Shows efficiency of operations.',
    },
    {
      label: 'EBITDA Margin',
      value: metrics.profitability.ebitdaMargin,
      format: 'percent',
      status: getMetricStatus(metrics.profitability.ebitdaMargin, { good: 0.25, bad: 0.1 }),
      tooltip: 'EBITDA divided by revenue. Measures operating profitability before non-cash items.',
    },
    {
      label: 'Net Profit Margin',
      value: metrics.profitability.netProfitMargin,
      format: 'percent',
      status: getMetricStatus(metrics.profitability.netProfitMargin, { good: 0.15, bad: 0.02 }),
      tooltip: 'Net income divided by revenue. Shows bottom-line profitability.',
    },
    {
      label: 'Return on Equity (ROE)',
      value: metrics.profitability.roe,
      format: 'percent',
      status: getMetricStatus(metrics.profitability.roe, { good: 0.15, bad: 0.05 }),
      tooltip: 'Net income divided by shareholders equity. Measures return to shareholders.',
    },
    {
      label: 'Return on Assets (ROA)',
      value: metrics.profitability.roa,
      format: 'percent',
      status: getMetricStatus(metrics.profitability.roa, { good: 0.1, bad: 0.02 }),
      tooltip: 'Net income divided by total assets. Shows how efficiently assets generate profit.',
    },
    {
      label: 'Return on Invested Capital (ROIC)',
      value: metrics.profitability.roic,
      format: 'percent',
      status: getMetricStatus(metrics.profitability.roic, { good: 0.12, bad: 0.05 }),
      tooltip: 'NOPLAT divided by invested capital. Key measure of value creation.',
    },
    {
      label: 'NOPLAT',
      value: metrics.profitability.noplat,
      format: 'currency',
      tooltip: 'Net Operating Profit Less Adjusted Taxes. Operating profit after taxes.',
    },
  ];

  // =========================================================================
  // LIQUIDITY METRICS (7 metrics)
  // =========================================================================
  const liquidityMetrics: MetricItem[] = [
    {
      label: 'Current Ratio',
      value: metrics.liquidity.currentRatio,
      format: 'ratio',
      status: getMetricStatus(metrics.liquidity.currentRatio, { good: 1.5, bad: 1.0 }),
      tooltip: 'Current assets / Current liabilities. Above 1.5 is healthy.',
    },
    {
      label: 'Quick Ratio',
      value: metrics.liquidity.quickRatio,
      format: 'ratio',
      status: getMetricStatus(metrics.liquidity.quickRatio, { good: 1.0, bad: 0.5 }),
      tooltip: 'Liquid assets / Current liabilities. Above 1 is healthy.',
    },
    {
      label: 'Cash Ratio',
      value: metrics.liquidity.cashRatio,
      format: 'ratio',
      status: getMetricStatus(metrics.liquidity.cashRatio, { good: 0.5, bad: 0.1 }),
      tooltip: 'Cash / Current liabilities. Most conservative liquidity measure.',
    },
    {
      label: 'Days Sales Outstanding',
      value: metrics.liquidity.daysSalesOutstanding,
      format: 'number',
      status: getMetricStatus(metrics.liquidity.daysSalesOutstanding, { good: 30, bad: 60, higherIsBetter: false }),
      tooltip: 'Average days to collect receivables. Lower is better.',
    },
    {
      label: 'Days Inventory Outstanding',
      value: metrics.liquidity.daysInventoryOutstanding,
      format: 'number',
      status: getMetricStatus(metrics.liquidity.daysInventoryOutstanding, { good: 45, bad: 90, higherIsBetter: false }),
      tooltip: 'Average days inventory is held. Lower indicates faster turnover.',
    },
    {
      label: 'Days Payables Outstanding',
      value: metrics.liquidity.daysPayablesOutstanding,
      format: 'number',
      tooltip: 'Average days to pay suppliers. Higher means better cash management.',
    },
    {
      label: 'Cash Conversion Cycle',
      value: metrics.liquidity.cashConversionCycle,
      format: 'number',
      status: getMetricStatus(metrics.liquidity.cashConversionCycle, { good: 30, bad: 90, higherIsBetter: false }),
      tooltip: 'Days to convert investments into cash. Lower is more efficient.',
    },
  ];

  // =========================================================================
  // LEVERAGE METRICS (7 metrics)
  // =========================================================================
  const leverageMetrics: MetricItem[] = [
    {
      label: 'Debt to Assets',
      value: metrics.leverage.debtToAssets,
      format: 'ratio',
      status: getMetricStatus(metrics.leverage.debtToAssets, { good: 0.3, bad: 0.6, higherIsBetter: false }),
      tooltip: 'Total debt / Total assets. Lower indicates less leverage.',
    },
    {
      label: 'Debt to Equity',
      value: metrics.leverage.debtToEquity,
      format: 'ratio',
      status: getMetricStatus(metrics.leverage.debtToEquity, { good: 1.0, bad: 2.0, higherIsBetter: false }),
      tooltip: 'Total debt / Shareholders equity. Below 1 is conservative.',
    },
    {
      label: 'Financial Debt to Equity',
      value: metrics.leverage.financialDebtToEquity,
      format: 'ratio',
      status: getMetricStatus(metrics.leverage.financialDebtToEquity, { good: 0.5, bad: 1.5, higherIsBetter: false }),
      tooltip: 'Interest-bearing debt / Equity. More precise than total D/E.',
    },
    {
      label: 'Interest Coverage',
      value: metrics.leverage.interestCoverage,
      format: 'ratio',
      status: getMetricStatus(metrics.leverage.interestCoverage, { good: 5, bad: 2 }),
      tooltip: 'EBIT / Interest expense. Above 3x is considered safe.',
    },
    {
      label: 'Debt Service Coverage',
      value: metrics.leverage.debtServiceCoverage,
      format: 'ratio',
      status: getMetricStatus(metrics.leverage.debtServiceCoverage, { good: 1.5, bad: 1.0 }),
      tooltip: 'Operating income / Debt service. Above 1.25x is healthy.',
    },
    {
      label: 'Equity Multiplier',
      value: metrics.leverage.equityMultiplier,
      format: 'ratio',
      tooltip: 'Total assets / Shareholders equity. DuPont component.',
    },
    {
      label: 'Debt to EBITDA',
      value: metrics.leverage.debtToEBITDA,
      format: 'ratio',
      status: getMetricStatus(metrics.leverage.debtToEBITDA, { good: 2, bad: 4, higherIsBetter: false }),
      tooltip: 'Total debt / EBITDA. Below 3x is manageable debt load.',
    },
  ];

  // =========================================================================
  // EFFICIENCY METRICS (6 metrics)
  // =========================================================================
  const efficiencyMetrics: MetricItem[] = [
    {
      label: 'Total Asset Turnover',
      value: metrics.efficiency.totalAssetTurnover,
      format: 'ratio',
      status: getMetricStatus(metrics.efficiency.totalAssetTurnover, { good: 1.0, bad: 0.5 }),
      tooltip: 'Revenue / Total assets. Higher means more efficient use of assets.',
    },
    {
      label: 'Fixed Asset Turnover',
      value: metrics.efficiency.fixedAssetTurnover,
      format: 'ratio',
      status: getMetricStatus(metrics.efficiency.fixedAssetTurnover, { good: 3.0, bad: 1.0 }),
      tooltip: 'Revenue / Fixed assets. Measures efficiency of PP&E.',
    },
    {
      label: 'Inventory Turnover',
      value: metrics.efficiency.inventoryTurnover,
      format: 'ratio',
      status: getMetricStatus(metrics.efficiency.inventoryTurnover, { good: 8, bad: 4 }),
      tooltip: 'COGS / Average inventory. Higher indicates faster inventory movement.',
    },
    {
      label: 'Receivables Turnover',
      value: metrics.efficiency.receivablesTurnover,
      format: 'ratio',
      status: getMetricStatus(metrics.efficiency.receivablesTurnover, { good: 12, bad: 6 }),
      tooltip: 'Revenue / Receivables. Higher means faster collections.',
    },
    {
      label: 'Payables Turnover',
      value: metrics.efficiency.payablesTurnover,
      format: 'ratio',
      tooltip: 'COGS / Payables. Lower indicates favorable payment terms.',
    },
    {
      label: 'Working Capital Turnover',
      value: metrics.efficiency.workingCapitalTurnover,
      format: 'ratio',
      status: getMetricStatus(metrics.efficiency.workingCapitalTurnover, { good: 5, bad: 2 }),
      tooltip: 'Revenue / Working capital. Efficiency of short-term capital.',
    },
  ];

  // =========================================================================
  // CASH FLOW METRICS (8 metrics)
  // =========================================================================
  const cashFlowMetrics: MetricItem[] = [
    {
      label: 'Operating Cash Flow',
      value: metrics.cashFlow.operatingCashFlow,
      format: 'currency',
      status: metrics.cashFlow.operatingCashFlow && metrics.cashFlow.operatingCashFlow > 0 ? 'positive' : 'negative',
      tooltip: 'Cash generated from core business operations.',
    },
    {
      label: 'Investing Cash Flow',
      value: metrics.cashFlow.investingCashFlow,
      format: 'currency',
      tooltip: 'Cash used for investments in assets. Negative usually indicates growth.',
    },
    {
      label: 'Financing Cash Flow',
      value: metrics.cashFlow.financingCashFlow,
      format: 'currency',
      tooltip: 'Cash from debt, equity, and dividends.',
    },
    {
      label: 'Free Cash Flow',
      value: metrics.cashFlow.freeCashFlow,
      format: 'currency',
      status: metrics.cashFlow.freeCashFlow && metrics.cashFlow.freeCashFlow > 0 ? 'positive' : 'negative',
      tooltip: 'Operating cash flow minus CapEx. Cash available for distribution.',
    },
    {
      label: 'FCFF',
      value: metrics.cashFlow.fcff,
      format: 'currency',
      status: metrics.cashFlow.fcff && metrics.cashFlow.fcff > 0 ? 'positive' : 'negative',
      tooltip: 'Free Cash Flow to Firm. Available to all capital providers.',
    },
    {
      label: 'FCFE',
      value: metrics.cashFlow.fcfe,
      format: 'currency',
      status: metrics.cashFlow.fcfe && metrics.cashFlow.fcfe > 0 ? 'positive' : 'negative',
      tooltip: 'Free Cash Flow to Equity. Available to shareholders.',
    },
    {
      label: 'Cash Flow Adequacy',
      value: metrics.cashFlow.cashFlowAdequacy,
      format: 'ratio',
      status: getMetricStatus(metrics.cashFlow.cashFlowAdequacy, { good: 1.0, bad: 0.5 }),
      tooltip: 'OCF / (CapEx + Debt payments + Dividends). Above 1 is self-sufficient.',
    },
    {
      label: 'Cash Reinvestment Ratio',
      value: metrics.cashFlow.cashReinvestmentRatio,
      format: 'percent',
      tooltip: 'Capital reinvested / Operating cash flow. Growth investment rate.',
    },
  ];

  // =========================================================================
  // GROWTH METRICS (9 metrics)
  // =========================================================================
  const growthMetrics: MetricItem[] = [
    {
      label: 'Revenue Growth YoY',
      value: metrics.growth.revenueGrowthYoY,
      format: 'percent',
      status: getMetricStatus(metrics.growth.revenueGrowthYoY, { good: 0.1, bad: 0 }),
      tooltip: 'Year-over-year revenue growth rate.',
    },
    {
      label: 'EPS Growth YoY',
      value: metrics.growth.epsGrowthYoY,
      format: 'percent',
      status: getMetricStatus(metrics.growth.epsGrowthYoY, { good: 0.1, bad: 0 }),
      tooltip: 'Year-over-year earnings per share growth.',
    },
    {
      label: 'Dividend Growth',
      value: metrics.growth.dpsGrowth,
      format: 'percent',
      status: getMetricStatus(metrics.growth.dpsGrowth, { good: 0.05, bad: 0 }),
      tooltip: 'Year-over-year dividend per share growth.',
    },
    {
      label: 'Free Cash Flow Growth',
      value: metrics.growth.fcfGrowth,
      format: 'percent',
      status: getMetricStatus(metrics.growth.fcfGrowth, { good: 0.1, bad: 0 }),
      tooltip: 'Year-over-year free cash flow growth.',
    },
    {
      label: 'Revenue 3Y CAGR',
      value: metrics.growth.revenue3YearCAGR,
      format: 'percent',
      status: getMetricStatus(metrics.growth.revenue3YearCAGR, { good: 0.08, bad: 0.02 }),
      tooltip: 'Compound annual revenue growth over 3 years.',
    },
    {
      label: 'Revenue 5Y CAGR',
      value: metrics.growth.revenue5YearCAGR,
      format: 'percent',
      status: getMetricStatus(metrics.growth.revenue5YearCAGR, { good: 0.08, bad: 0.02 }),
      tooltip: 'Compound annual revenue growth over 5 years.',
    },
    {
      label: 'Sustainable Growth Rate',
      value: metrics.growth.sustainableGrowthRate,
      format: 'percent',
      tooltip: 'ROE × Retention Ratio. Max growth without external financing.',
    },
    {
      label: 'Retention Ratio',
      value: metrics.growth.retentionRatio,
      format: 'percent',
      tooltip: '1 - Payout ratio. Percentage of earnings retained for growth.',
    },
    {
      label: 'Payout Ratio',
      value: metrics.growth.payoutRatio,
      format: 'percent',
      status: getMetricStatus(metrics.growth.payoutRatio, { good: 0.5, bad: 0.8, higherIsBetter: false }),
      tooltip: 'Dividends / Net income. Lower allows more reinvestment.',
    },
  ];

  // =========================================================================
  // DUPONT ANALYSIS (7 metrics)
  // =========================================================================
  const dupontMetrics: MetricItem[] = [
    {
      label: 'Net Profit Margin',
      value: metrics.dupont.netProfitMargin,
      format: 'percent',
      status: getMetricStatus(metrics.dupont.netProfitMargin, { good: 0.15, bad: 0.05 }),
      tooltip: 'Net income / Revenue. Profitability component of DuPont.',
    },
    {
      label: 'Asset Turnover',
      value: metrics.dupont.assetTurnover,
      format: 'ratio',
      status: getMetricStatus(metrics.dupont.assetTurnover, { good: 1.0, bad: 0.5 }),
      tooltip: 'Revenue / Assets. Efficiency component of DuPont.',
    },
    {
      label: 'Equity Multiplier',
      value: metrics.dupont.equityMultiplier,
      format: 'ratio',
      tooltip: 'Assets / Equity. Leverage component of DuPont.',
    },
    {
      label: 'ROE (DuPont)',
      value: metrics.dupont.roeDupont,
      format: 'percent',
      status: getMetricStatus(metrics.dupont.roeDupont, { good: 0.15, bad: 0.05 }),
      tooltip: 'NPM × Asset Turnover × Equity Multiplier.',
    },
    {
      label: 'Operating Margin',
      value: metrics.dupont.operatingMargin,
      format: 'percent',
      status: getMetricStatus(metrics.dupont.operatingMargin, { good: 0.2, bad: 0.05 }),
      tooltip: 'Operating income / Revenue. Extended 5-way DuPont.',
    },
    {
      label: 'Interest Burden',
      value: metrics.dupont.interestBurden,
      format: 'ratio',
      tooltip: 'EBT / EBIT. Impact of interest expenses on profitability.',
    },
    {
      label: 'Tax Burden',
      value: metrics.dupont.taxBurden,
      format: 'ratio',
      tooltip: 'Net Income / EBT. Impact of taxes on profitability.',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Grid Layout for All Categories */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Profitability */}
        <MetricCard
          title="Profitability"
          description="How efficiently the company generates profit"
          icon={<DollarSign className="h-5 w-5" />}
          metrics={profitabilityMetrics}
        />

        {/* Liquidity */}
        <MetricCard
          title="Liquidity"
          description="Ability to meet short-term obligations"
          icon={<Droplets className="h-5 w-5" />}
          metrics={liquidityMetrics}
        />

        {/* Leverage */}
        <MetricCard
          title="Leverage / Solvency"
          description="Financial stability and debt management"
          icon={<Building2 className="h-5 w-5" />}
          metrics={leverageMetrics}
        />

        {/* Efficiency */}
        <MetricCard
          title="Efficiency"
          description="How well the company uses its assets"
          icon={<Settings className="h-5 w-5" />}
          metrics={efficiencyMetrics}
        />

        {/* Cash Flow */}
        <MetricCard
          title="Cash Flow"
          description="Cash generation and deployment"
          icon={<Banknote className="h-5 w-5" />}
          metrics={cashFlowMetrics}
        />

        {/* Growth */}
        <MetricCard
          title="Growth"
          description="Historical and sustainable growth rates"
          icon={<TrendingUp className="h-5 w-5" />}
          metrics={growthMetrics}
        />

        {/* DuPont Analysis - Full Width */}
        <div className="lg:col-span-2">
          <MetricCard
            title="DuPont Analysis"
            description="ROE decomposition: NPM × Asset Turnover × Equity Multiplier"
            icon={<Layers className="h-5 w-5" />}
            metrics={dupontMetrics}
          />
        </div>
      </div>
    </div>
  );
}
