import { Metadata } from 'next';
import { CompareView } from '@/components/stock/CompareView';
import { FullDataButton } from '@/components/mobile';

export const metadata: Metadata = {
  title: 'Compare Stocks | Deep Terminal',
  description: 'Compare up to 5 stocks side-by-side with 190+ institutional-grade metrics, visual charts, and exportable reports.',
  openGraph: {
    title: 'Compare Stocks | Deep Terminal',
    description: 'Compare up to 5 stocks side-by-side with 190+ institutional-grade metrics.',
  },
};

interface PageProps {
  searchParams: Promise<{
    symbols?: string;
  }>;
}

export default async function ComparePage({ searchParams }: PageProps) {
  const { symbols } = await searchParams;
  
  // Parse initial symbols from URL if provided (e.g., ?symbols=AAPL,MSFT,GOOGL)
  const initialSymbols = symbols
    ? symbols.split(',').map(s => s.trim().toUpperCase()).filter(Boolean).slice(0, 5)
    : [];

  return (
    <div className="p-6">
      <CompareView initialSymbols={initialSymbols} />
      <FullDataButton />
    </div>
  );
}
