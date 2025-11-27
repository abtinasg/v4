import Link from 'next/link';
import { Search, TrendingUp, ArrowLeft } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] px-4">
      <div className="glass-card rounded-2xl p-8 max-w-md w-full text-center space-y-6">
        {/* Icon */}
        <div className="h-16 w-16 rounded-2xl bg-[#5BB9F7]/10 border border-[#5BB9F7]/30 flex items-center justify-center mx-auto">
          <Search className="h-8 w-8 text-[#5BB9F7]" />
        </div>

        {/* Message */}
        <div className="space-y-2">
          <h2 className="text-xl font-semibold text-white">
            Stock Not Found
          </h2>
          <p className="text-gray-400 text-sm">
            We couldn&apos;t find the stock you&apos;re looking for. It may have been delisted,
            or the symbol might be incorrect.
          </p>
        </div>

        {/* Suggestions */}
        <div className="bg-white/5 rounded-xl p-4 text-left space-y-2">
          <p className="text-sm text-gray-400 font-medium">Try searching for:</p>
          <div className="flex flex-wrap gap-2">
            {['AAPL', 'MSFT', 'GOOGL', 'AMZN', 'TSLA', 'NVDA'].map((symbol) => (
              <Link
                key={symbol}
                href={`/stock-analysis/${symbol}`}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-sm text-gray-300 hover:bg-[#5BB9F7]/10 hover:border-[#5BB9F7]/30 hover:text-[#5BB9F7] transition-all"
              >
                <TrendingUp className="h-3.5 w-3.5" />
                {symbol}
              </Link>
            ))}
          </div>
        </div>

        {/* Back Link */}
        <Link
          href="/overview"
          className="inline-flex items-center gap-2 text-[#5BB9F7] hover:text-[#5BB9F7]/80 transition-colors text-sm font-medium"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Overview
        </Link>
      </div>
    </div>
  );
}
