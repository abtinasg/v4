/**
 * Stock Analysis Component Types
 */

import type { AllMetrics } from '../../../lib/metrics/types';

// ============================================================================
// COMPANY HEADER TYPES
// ============================================================================

export interface CompanyHeaderProps {
  symbol: string;
  companyName: string;
  price: number;
  change: number;
  changePercent: number;
  marketCap: number;
  peRatio: number | null;
  dividendYield: number | null;
  logo?: string;
  sector?: string;
  industry?: string;
}

// ============================================================================
// PRICE CHART TYPES
// ============================================================================

export type ChartTimeframe = '1D' | '1W' | '1M' | '3M' | '6M' | '1Y' | '5Y' | 'ALL';
export type ChartType = 'line' | 'candlestick' | 'area';

export interface ChartDataPoint {
  date: string;
  timestamp: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export interface PriceChartProps {
  symbol: string;
  initialData?: ChartDataPoint[];
}

// ============================================================================
// METRICS TABS TYPES
// ============================================================================

export type MetricsTabValue = 'overview' | 'financials' | 'valuation' | 'economy' | 'technical' | 'risk' | 'tradefx' | 'fixedincome' | 'ai';

export interface MetricsTabsProps {
  symbol: string;
  metrics: AllMetrics;
  sector?: string;
  industry?: string;
}

// ============================================================================
// METRIC CARD TYPES
// ============================================================================

export type MetricStatus = 'positive' | 'neutral' | 'negative';

export interface MetricItem {
  label: string;
  value: number | string | null;
  format?: 'number' | 'percent' | 'currency' | 'ratio' | 'score';
  status?: MetricStatus;
  tooltip?: string;
  change?: number;
  previousValue?: number | null;
}

export interface MetricCardProps {
  title: string;
  description?: string;
  metrics: MetricItem[];
  icon?: React.ReactNode;
  className?: string;
}

// ============================================================================
// STOCK DATA TYPES
// ============================================================================

export interface StockAnalysisData {
  symbol: string;
  companyName: string;
  sector: string;
  industry: string;
  timestamp: string;
  currentPrice: number;
  marketCap: number;
  metrics: AllMetrics;
  metadata: {
    dataSources: string[];
    lastUpdated: string;
    cacheHit: boolean;
    calculationTimeMs: number;
  };
}

// ============================================================================
// WATCHLIST TYPES
// ============================================================================

export interface WatchlistButtonProps {
  symbol: string;
  companyName: string;
  isWatched?: boolean;
  onToggle?: (isWatched: boolean) => void;
}

// ============================================================================
// HISTORICAL DATA TYPES
// ============================================================================

export interface HistoricalDataParams {
  symbol: string;
  range: ChartTimeframe;
  interval?: '1m' | '5m' | '15m' | '30m' | '1h' | '1d' | '1wk' | '1mo';
}

export interface HistoricalDataResponse {
  symbol: string;
  data: ChartDataPoint[];
  range: string;
  interval: string;
}
