import { Suspense } from 'react';
import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import { headers } from 'next/headers';
import { CompanyHeader } from '@/components/stock/company-header';
import { PriceChart } from '@/components/stock/price-chart';
import { MetricsTabs } from '@/components/stock/metrics-tabs';
import { StockReportGenerator } from '@/components/stock/stock-report-generator';
import { StockNewsTabs } from '@/components/stock/stock-news-tabs';
import {
  CompanyHeaderSkeleton,
  ChartSkeleton,
  MetricsSkeleton,
} from '@/components/stock/skeletons';
import { StockContextUpdater } from '@/components/ai';
import { FullDataButton } from '@/components/mobile';
import type { AllMetrics } from '../../../../../lib/metrics/types';

// Force dynamic rendering to allow API calls during request time
export const dynamic = 'force-dynamic';
export const revalidate = 3600; // Revalidate every hour

interface PageProps {
  params: Promise<{
    symbol: string;
  }>;
}

// Metadata generation
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { symbol } = await params;
  const upperSymbol = symbol.toUpperCase();

  return {
    title: `${upperSymbol} Stock Analysis | Deep Terminal`,
    description: `Comprehensive analysis of ${upperSymbol} with 190+ institutional-grade metrics, AI insights, and real-time data.`,
    openGraph: {
      title: `${upperSymbol} Stock Analysis | Deep Terminal`,
      description: `Comprehensive analysis of ${upperSymbol} with 190+ institutional-grade metrics.`,
    },
  };
}

// Get company domain for logo
function getCompanyDomain(companyName: string): string {
  // Common company domain mappings
  const domainMap: Record<string, string> = {
    apple: 'apple.com',
    microsoft: 'microsoft.com',
    google: 'google.com',
    alphabet: 'google.com',
    amazon: 'amazon.com',
    meta: 'meta.com',
    facebook: 'meta.com',
    tesla: 'tesla.com',
    nvidia: 'nvidia.com',
    netflix: 'netflix.com',
    adobe: 'adobe.com',
    salesforce: 'salesforce.com',
    oracle: 'oracle.com',
    intel: 'intel.com',
    amd: 'amd.com',
    cisco: 'cisco.com',
    ibm: 'ibm.com',
    paypal: 'paypal.com',
    visa: 'visa.com',
    mastercard: 'mastercard.com',
    jpmorgan: 'jpmorganchase.com',
    'bank of america': 'bankofamerica.com',
    'wells fargo': 'wellsfargo.com',
    goldman: 'goldmansachs.com',
    morgan: 'morganstanley.com',
    disney: 'disney.com',
    nike: 'nike.com',
    starbucks: 'starbucks.com',
    walmart: 'walmart.com',
    'home depot': 'homedepot.com',
    costco: 'costco.com',
    target: 'target.com',
    'coca-cola': 'coca-cola.com',
    pepsi: 'pepsico.com',
    'procter': 'pg.com',
    johnson: 'jnj.com',
    pfizer: 'pfizer.com',
    moderna: 'modernatx.com',
    merck: 'merck.com',
    abbvie: 'abbvie.com',
    unitedhealth: 'uhc.com',
    boeing: 'boeing.com',
    lockheed: 'lockheedmartin.com',
    caterpillar: 'cat.com',
    '3m': '3m.com',
    general: 'ge.com',
    honeywell: 'honeywell.com',
    exxon: 'exxonmobil.com',
    chevron: 'chevron.com',
  };

  const lowerName = companyName.toLowerCase();

  for (const [key, domain] of Object.entries(domainMap)) {
    if (lowerName.includes(key)) {
      return domain;
    }
  }

  // Fallback: try to create domain from company name
  const cleanName = lowerName
    .replace(/[^a-z0-9\s]/g, '')
    .split(' ')[0];

  return `${cleanName}.com`;
}

// Stock data result type
interface StockDataResult {
  symbol: string;
  companyName: string;
  sector: string;
  industry: string;
  currentPrice: number;
  previousClose: number;
  change: number;
  changePercent: number;
  marketCap: number;
  metrics: AllMetrics;
}

// Get the base URL for API calls
async function getBaseUrl(): Promise<string> {
  // Try to get host from headers (works in server components)
  try {
    const headersList = await headers();
    const host = headersList.get('host');
    const protocol = headersList.get('x-forwarded-proto') || 'https';
    if (host) {
      return `${protocol}://${host}`;
    }
  } catch {
    // Headers not available during build time
  }
  
  // In production on Vercel
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`;
  }
  // Custom domain or explicitly set URL
  if (process.env.NEXT_PUBLIC_APP_URL) {
    return process.env.NEXT_PUBLIC_APP_URL;
  }
  // Local development
  return 'http://localhost:3000';
}

// Fetch stock metrics from API
async function fetchStockMetrics(symbol: string): Promise<{
  data: StockDataResult | null;
  error: string | null;
}> {
  try {
    const baseUrl = await getBaseUrl();
    
    // Get cookies from the incoming request to forward authentication
    const headersList = await headers();
    const cookie = headersList.get('cookie') || '';
    
    const response = await fetch(`${baseUrl}/api/stock/${symbol}/metrics`, {
      next: { revalidate: 3600 }, // Cache for 1 hour
      cache: 'force-cache',
      headers: {
        'Cookie': cookie,
      },
    });

    if (!response.ok) {
      if (response.status === 404) return { data: null, error: 'Stock not found' };
      if (response.status === 401) return { data: null, error: 'Please sign in to view stock data' };
      if (response.status === 402) {
        const errorData = await response.json().catch(() => ({}));
        return { data: null, error: errorData.message || 'Insufficient credits' };
      }
      return { data: null, error: `API error: ${response.status}` };
    }

    const data = await response.json();
    return { data, error: null };
  } catch (error) {
    console.error('Error fetching stock metrics:', error);
    return { data: null, error: 'Failed to fetch stock data' };
  }
}

// Error State Component
function ErrorState({ symbol, message }: { symbol: string; message: string }) {
  return (
    <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-8 text-center">
      <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10">
        <svg
          className="h-6 w-6 text-destructive"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
          />
        </svg>
      </div>
      <h3 className="text-lg font-semibold text-foreground mb-2">
        Unable to load data for {symbol}
      </h3>
      <p className="text-muted-foreground mb-4">
        {message}
      </p>
      <p className="text-sm text-muted-foreground">
        This may be due to API rate limits or the stock symbol not being found.
        Please try again later.
      </p>
    </div>
  );
}

// Server Component for Company Header
async function CompanyHeaderServer({ symbol }: { symbol: string }) {
  const { data, error } = await fetchStockMetrics(symbol);

  if (!data || error) {
    return <ErrorState symbol={symbol} message={error || 'Data unavailable'} />;
  }

  const logo = `https://logo.clearbit.com/${getCompanyDomain(data.companyName)}`;

  return (
    <CompanyHeader
      symbol={data.symbol}
      companyName={data.companyName}
      price={data.currentPrice}
      change={data.change}
      changePercent={data.changePercent}
      marketCap={data.marketCap}
      peRatio={data.metrics.valuation?.peRatio ?? null}
      dividendYield={data.metrics.valuation?.dividendYield ?? null}
      logo={logo}
      sector={data.sector}
      industry={data.industry}
    />
  );
}

// Server Component for Price Chart
async function PriceChartServer({ symbol }: { symbol: string }) {
  // Chart will load its own data client-side
  return <PriceChart symbol={symbol} />;
}

// Server Component for Metrics Tabs
async function MetricsTabsServer({ symbol }: { symbol: string }) {
  const { data, error } = await fetchStockMetrics(symbol);

  if (!data || error) {
    return null; // Error already shown by CompanyHeaderServer
  }

  return (
    <MetricsTabs
      symbol={data.symbol}
      metrics={data.metrics}
      sector={data.sector}
      industry={data.industry}
    />
  );
}

// Main Page Component
export default async function StockAnalysisPage({ params }: PageProps) {
  const { symbol } = await params;
  const upperSymbol = symbol.toUpperCase();

  return (
    <div className="relative min-h-screen bg-[#04060A]">
      {/* AI Context Updater */}
      <StockContextUpdater symbol={upperSymbol} />
      
      {/* Subtle Ambient Background */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10">
        <div className="absolute top-[-10%] left-1/3 w-[600px] h-[400px] bg-[#00C9E4]/[0.02] rounded-full blur-[120px]" />
        <div className="absolute top-1/2 right-0 w-[400px] h-[400px] bg-[#9B87F5]/[0.02] rounded-full blur-[100px]" />
      </div>

      {/* Content - Premium Spacing */}
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12 space-y-8 lg:space-y-12">
        
        {/* Company Header */}
        <Suspense fallback={<CompanyHeaderSkeleton />}>
          <CompanyHeaderServer symbol={upperSymbol} />
        </Suspense>

        {/* Price Chart */}
        <Suspense fallback={<ChartSkeleton />}>
          <PriceChartServer symbol={upperSymbol} />
        </Suspense>

        {/* AI Research Report */}
        <StockReportGenerator 
          symbol={upperSymbol} 
          companyName={upperSymbol} 
        />

        {/* Metrics Tabs */}
        <Suspense fallback={<MetricsSkeleton />}>
          <MetricsTabsServer symbol={upperSymbol} />
        </Suspense>

        {/* News & Filings */}
        <StockNewsTabs symbol={upperSymbol} />
        
        {/* Bottom Spacing */}
        <div className="h-8 lg:h-12" />
      </div>

      {/* Full Data Button for Mobile */}
      <FullDataButton />
    </div>
  );
}
