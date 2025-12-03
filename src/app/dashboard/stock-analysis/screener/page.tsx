import { Metadata } from 'next';
import { Screener } from '@/components/stock/Screener';
import { FullDataButton } from '@/components/mobile';

export const metadata: Metadata = {
  title: 'Stock Screener | Deep Terminal',
  description: 'Screen stocks by market cap, sector, valuation metrics, technical indicators, and quality scores.',
  openGraph: {
    title: 'Stock Screener | Deep Terminal',
    description: 'Find stocks matching your criteria with our advanced screener.',
  },
};

interface PageProps {
  searchParams: Promise<{
    preset?: string;
    sector?: string;
    minPe?: string;
    maxPe?: string;
    minDividend?: string;
    minRoe?: string;
    minGrowth?: string;
    minPiotroski?: string;
  }>;
}

export default async function ScreenerPage({ searchParams }: PageProps) {
  const params = await searchParams;
  
  // Parse initial filters from URL params
  const initialFilters: Record<string, unknown> = {};
  
  if (params.sector) {
    initialFilters.sector = params.sector.split(',');
  }
  
  if (params.minPe || params.maxPe) {
    initialFilters.peRatio = {
      min: params.minPe ? parseFloat(params.minPe) : null,
      max: params.maxPe ? parseFloat(params.maxPe) : null,
    };
  }
  
  if (params.minDividend) {
    initialFilters.dividendYield = {
      min: parseFloat(params.minDividend),
      max: null,
    };
  }
  
  if (params.minRoe) {
    initialFilters.roe = {
      min: parseFloat(params.minRoe),
      max: null,
    };
  }
  
  if (params.minGrowth) {
    initialFilters.revenueGrowth = {
      min: parseFloat(params.minGrowth),
      max: null,
    };
  }
  
  if (params.minPiotroski) {
    initialFilters.piotroskiScore = {
      min: parseFloat(params.minPiotroski),
      max: null,
    };
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
      <Screener initialFilters={initialFilters} />
      <FullDataButton />
    </div>
  );
}
