// FRED API Response Types
export interface FredObservation {
  date: string;
  value: string;
}

export interface FredSeriesResponse {
  realtime_start: string;
  realtime_end: string;
  observation_start: string;
  observation_end: string;
  units: string;
  output_type: number;
  file_type: string;
  order_by: string;
  sort_order: string;
  count: number;
  offset: number;
  limit: number;
  observations: FredObservation[];
}

// Processed Economic Indicator Types
export interface EconomicIndicator {
  seriesId: string;
  name: string;
  value: number | null;
  previousValue: number | null;
  change: number | null;
  changePercent: number | null;
  date: string;
  unit: string;
  frequency: string;
}

export interface EconomicIndicators {
  gdp: EconomicIndicator;
  unemployment: EconomicIndicator;
  inflation: EconomicIndicator;
  federalFundsRate: EconomicIndicator;
  treasuryYield10Y: EconomicIndicator;
  consumerConfidence: EconomicIndicator;
  lastUpdated: string;
}

// FRED Series IDs for key economic indicators
export const FRED_SERIES = {
  GDP_GROWTH: 'A191RL1Q225SBEA', // Real GDP Growth Rate (Quarterly)
  UNEMPLOYMENT: 'UNRATE', // Unemployment Rate (Monthly)
  CPI_INFLATION: 'CPIAUCSL', // Consumer Price Index (Monthly)
  FEDERAL_FUNDS_RATE: 'FEDFUNDS', // Federal Funds Effective Rate (Monthly)
  TREASURY_10Y: 'DGS10', // 10-Year Treasury Constant Maturity Rate (Daily)
  CONSUMER_CONFIDENCE: 'UMCSENT', // University of Michigan Consumer Sentiment (Monthly)
} as const;

export type FredSeriesId = (typeof FRED_SERIES)[keyof typeof FRED_SERIES];

// Indicator metadata
export const INDICATOR_METADATA: Record<
  keyof typeof FRED_SERIES,
  { name: string; unit: string; frequency: string }
> = {
  GDP_GROWTH: {
    name: 'GDP Growth Rate',
    unit: '%',
    frequency: 'Quarterly',
  },
  UNEMPLOYMENT: {
    name: 'Unemployment Rate',
    unit: '%',
    frequency: 'Monthly',
  },
  CPI_INFLATION: {
    name: 'Inflation Rate (CPI)',
    unit: 'Index',
    frequency: 'Monthly',
  },
  FEDERAL_FUNDS_RATE: {
    name: 'Federal Funds Rate',
    unit: '%',
    frequency: 'Monthly',
  },
  TREASURY_10Y: {
    name: '10-Year Treasury Yield',
    unit: '%',
    frequency: 'Daily',
  },
  CONSUMER_CONFIDENCE: {
    name: 'Consumer Confidence Index',
    unit: 'Index',
    frequency: 'Monthly',
  },
};
