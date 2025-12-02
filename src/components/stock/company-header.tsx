'use client';

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { 
  Star, 
  Share2, 
  TrendingUp, 
  TrendingDown, 
  Building2,
  Bell
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { CompanyHeaderProps } from './types';

function formatLargeNumber(value: number): string {
  if (value >= 1e12) return `$${(value / 1e12).toFixed(2)}T`;
  if (value >= 1e9) return `$${(value / 1e9).toFixed(2)}B`;
  if (value >= 1e6) return `$${(value / 1e6).toFixed(2)}M`;
  return `$${value.toFixed(2)}`;
}

function formatPrice(value: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

function formatPercent(value: number): string {
  const sign = value >= 0 ? '+' : '';
  return `${sign}${value.toFixed(2)}%`;
}

function AnimatedPrice({ value, className }: { value: number; className?: string }) {
  const motionValue = useMotionValue(value);
  const springValue = useSpring(motionValue, { stiffness: 100, damping: 30 });
  const prevValue = useRef(value);
  const [flash, setFlash] = useState<'up' | 'down' | null>(null);

  useEffect(() => {
    if (value !== prevValue.current) {
      setFlash(value > prevValue.current ? 'up' : 'down');
      prevValue.current = value;
      motionValue.set(value);
      const timer = setTimeout(() => setFlash(null), 500);
      return () => clearTimeout(timer);
    }
  }, [value, motionValue]);

  return (
    <motion.span
      className={cn(
        'transition-colors duration-300',
        flash === 'up' && 'text-emerald-400',
        flash === 'down' && 'text-rose-400',
        className
      )}
    >
      {formatPrice(value)}
    </motion.span>
  );
}

function LiveIndicator() {
  return (
    <div className="flex items-center gap-1.5">
      <span className="relative flex h-1.5 w-1.5">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
        <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-400"></span>
      </span>
      <span className="text-[10px] text-white/40 font-medium tracking-wide">LIVE</span>
    </div>
  );
}

export function CompanyHeader({
  symbol,
  companyName,
  price,
  change,
  changePercent,
  marketCap,
  peRatio,
  dividendYield,
  logo,
  sector,
  industry,
}: CompanyHeaderProps) {
  const [isWatched, setIsWatched] = useState(false);
  const [logoError, setLogoError] = useState(false);
  const isPositive = change >= 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: -16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
    >
      {/* Premium Glass Card */}
      <div className={cn(
        'relative overflow-hidden rounded-2xl',
        'bg-white/[0.02] backdrop-blur-xl',
        'border border-white/[0.06]'
      )}>
        {/* Subtle top accent line */}
        <div className={cn(
          'absolute top-0 left-0 right-0 h-px',
          isPositive 
            ? 'bg-gradient-to-r from-transparent via-emerald-500/50 to-transparent'
            : 'bg-gradient-to-r from-transparent via-rose-500/50 to-transparent'
        )} />

        <div className="p-6 sm:p-8 lg:p-10">
          {/* Main Content Grid */}
          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-8">
            
            {/* Left: Company Info */}
            <div className="flex items-start gap-5">
              {/* Logo */}
              <div className={cn(
                'relative h-14 w-14 sm:h-16 sm:w-16 rounded-xl overflow-hidden',
                'bg-white/[0.04] border border-white/[0.06]',
                'flex items-center justify-center flex-shrink-0'
              )}>
                {logo && !logoError ? (
                  <Image
                    src={logo}
                    alt={companyName}
                    fill
                    className="object-contain p-2"
                    onError={() => setLogoError(true)}
                  />
                ) : (
                  <Building2 className="h-7 w-7 text-white/30" />
                )}
              </div>

              {/* Company Details */}
              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <h1 className="text-xl sm:text-2xl font-semibold text-white tracking-tight">
                    {companyName}
                  </h1>
                  <span className="px-2.5 py-1 rounded-lg bg-[#00C9E4]/10 border border-[#00C9E4]/20 text-[#00C9E4] text-xs font-medium">
                    {symbol}
                  </span>
                </div>
                {(sector || industry) && (
                  <p className="text-sm text-white/40 font-light">
                    {sector}{sector && industry && ' · '}{industry}
                  </p>
                )}
              </div>
            </div>

            {/* Center: Price Display */}
            <div className="flex flex-col items-start lg:items-center gap-2">
              <div className="flex items-center gap-3">
                <AnimatedPrice 
                  value={price} 
                  className="text-4xl sm:text-5xl font-light text-white tracking-tight"
                />
                <LiveIndicator />
              </div>
              
              <div className={cn(
                'flex items-center gap-2 px-3 py-1.5 rounded-full',
                isPositive
                  ? 'bg-emerald-500/10 text-emerald-400'
                  : 'bg-rose-500/10 text-rose-400'
              )}>
                {isPositive ? (
                  <TrendingUp className="h-4 w-4" />
                ) : (
                  <TrendingDown className="h-4 w-4" />
                )}
                <span className="text-sm font-medium">
                  {isPositive ? '+' : ''}{formatPrice(change)} ({formatPercent(changePercent)})
                </span>
              </div>
            </div>

            {/* Right: Stats & Actions */}
            <div className="flex flex-col sm:flex-row lg:flex-col gap-6">
              {/* Key Stats */}
              <div className="flex items-center gap-8">
                <div>
                  <span className="text-[10px] uppercase tracking-widest text-white/30 block mb-1">Market Cap</span>
                  <span className="text-lg font-medium text-white">{formatLargeNumber(marketCap)}</span>
                </div>
                {peRatio !== null && (
                  <div>
                    <span className="text-[10px] uppercase tracking-widest text-white/30 block mb-1">P/E Ratio</span>
                    <span className="text-lg font-medium text-white">{peRatio.toFixed(2)}</span>
                  </div>
                )}
                {dividendYield !== null && dividendYield > 0 && (
                  <div>
                    <span className="text-[10px] uppercase tracking-widest text-white/30 block mb-1">Div Yield</span>
                    <span className="text-lg font-medium text-emerald-400">{(dividendYield * 100).toFixed(2)}%</span>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsWatched(!isWatched)}
                  className={cn(
                    'h-10 w-10 rounded-xl flex items-center justify-center transition-all duration-200',
                    isWatched
                      ? 'bg-[#00C9E4] text-[#04060A]'
                      : 'bg-white/[0.04] border border-white/[0.06] text-white/50 hover:bg-white/[0.08] hover:text-white'
                  )}
                >
                  <Star className={cn('h-4 w-4', isWatched && 'fill-current')} />
                </button>
                <button className="h-10 w-10 rounded-xl bg-white/[0.04] border border-white/[0.06] flex items-center justify-center text-white/50 hover:bg-white/[0.08] hover:text-white transition-all duration-200">
                  <Bell className="h-4 w-4" />
                </button>
                <button className="h-10 w-10 rounded-xl bg-white/[0.04] border border-white/[0.06] flex items-center justify-center text-white/50 hover:bg-white/[0.08] hover:text-white transition-all duration-200">
                  <Share2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
