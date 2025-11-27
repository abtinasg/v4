'use client';

import { cn } from '@/lib/utils';

// ============================================================================
// SKELETON BASE
// ============================================================================

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
}

function Skeleton({ className, style, ...props }: SkeletonProps) {
  return (
    <div
      className={cn(
        'animate-pulse rounded-lg bg-white/5',
        className
      )}
      style={style}
      {...props}
    />
  );
}

// ============================================================================
// COMPANY HEADER SKELETON
// ============================================================================

export function CompanyHeaderSkeleton() {
  return (
    <div className="sticky top-0 z-40 glass-card-heavy rounded-2xl p-6">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
        {/* Left Section */}
        <div className="flex items-center gap-5">
          {/* Logo */}
          <Skeleton className="h-16 w-16 rounded-2xl" />
          
          {/* Company Info */}
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <Skeleton className="h-8 w-48" />
              <Skeleton className="h-6 w-20 rounded-full" />
            </div>
            <div className="flex items-center gap-2">
              <Skeleton className="h-5 w-24" />
              <Skeleton className="h-5 w-32" />
            </div>
          </div>
        </div>

        {/* Center Section - Price */}
        <div className="flex flex-col items-start lg:items-center gap-1">
          <Skeleton className="h-12 w-36" />
          <Skeleton className="h-6 w-28" />
        </div>

        {/* Right Section - Key Stats */}
        <div className="flex items-center gap-6">
          <div className="space-y-1">
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-6 w-24" />
          </div>
          <div className="space-y-1">
            <Skeleton className="h-4 w-12" />
            <Skeleton className="h-6 w-16" />
          </div>
          <div className="space-y-1">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-6 w-14" />
          </div>
          <div className="flex gap-2">
            <Skeleton className="h-10 w-10 rounded-lg" />
            <Skeleton className="h-10 w-10 rounded-lg" />
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// CHART SKELETON
// ============================================================================

export function ChartSkeleton() {
  return (
    <div className="glass-card rounded-2xl overflow-hidden">
      {/* Chart Header */}
      <div className="p-4 border-b border-white/5 flex items-center justify-between">
        <div className="flex items-center gap-2">
          {['1D', '1W', '1M', '3M', '6M', '1Y', '5Y'].map((tf) => (
            <Skeleton key={tf} className="h-8 w-10 rounded-lg" />
          ))}
        </div>
        <div className="flex items-center gap-2">
          <Skeleton className="h-8 w-24 rounded-lg" />
          <Skeleton className="h-8 w-8 rounded-lg" />
        </div>
      </div>

      {/* Chart Area */}
      <div className="p-6 h-[400px] relative">
        {/* Y-Axis Labels */}
        <div className="absolute left-0 top-0 bottom-0 w-16 flex flex-col justify-between py-4">
          {[...Array(6)].map((_, i) => (
            <Skeleton key={i} className="h-4 w-12" />
          ))}
        </div>

        {/* Chart Grid */}
        <div className="ml-16 h-full flex items-end gap-1">
          {[...Array(40)].map((_, i) => (
            <Skeleton
              key={i}
              className="flex-1 rounded-t"
              style={{ height: `${((i * 17 + 13) % 60) + 20}%` }}
            />
          ))}
        </div>

        {/* X-Axis Labels */}
        <div className="absolute bottom-0 left-16 right-0 flex justify-between px-4">
          {[...Array(7)].map((_, i) => (
            <Skeleton key={i} className="h-4 w-12" />
          ))}
        </div>
      </div>

      {/* Volume Section */}
      <div className="px-6 pb-4 h-24">
        <Skeleton className="h-4 w-16 mb-2" />
        <div className="flex items-end gap-1 h-full">
          {[...Array(40)].map((_, i) => (
            <Skeleton
              key={i}
              className="flex-1 rounded-t"
              style={{ height: `${((i * 23 + 7) % 80) + 10}%` }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// METRICS SKELETON
// ============================================================================

export function MetricsSkeleton() {
  return (
    <div className="space-y-6">
      {/* Tabs */}
      <div className="flex gap-2">
        {['Overview', 'Financials', 'Valuation', 'Technical', 'AI Analysis'].map((tab) => (
          <Skeleton key={tab} className="h-10 w-24 rounded-lg" />
        ))}
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[...Array(9)].map((_, i) => (
          <MetricCardSkeleton key={i} />
        ))}
      </div>
    </div>
  );
}

// ============================================================================
// METRIC CARD SKELETON
// ============================================================================

export function MetricCardSkeleton() {
  return (
    <div className="glass-card rounded-xl p-5 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Skeleton className="h-10 w-10 rounded-lg" />
          <div className="space-y-1">
            <Skeleton className="h-5 w-32" />
            <Skeleton className="h-3 w-24" />
          </div>
        </div>
        <Skeleton className="h-6 w-16 rounded-full" />
      </div>

      {/* Metrics */}
      <div className="space-y-3">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="flex items-center justify-between">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-5 w-16" />
          </div>
        ))}
      </div>
    </div>
  );
}

// ============================================================================
// FULL PAGE SKELETON
// ============================================================================

export function StockAnalysisSkeleton() {
  return (
    <div className="space-y-6 pb-8 animate-in fade-in duration-500">
      <CompanyHeaderSkeleton />
      <ChartSkeleton />
      <MetricsSkeleton />
    </div>
  );
}
