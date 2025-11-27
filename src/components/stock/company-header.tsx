'use client';

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { 
  Star, 
  Share2, 
  TrendingUp, 
  TrendingDown, 
  Building2, 
  ExternalLink,
  Bell,
  BellRing,
  Copy,
  Check,
  MoreHorizontal
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { CompanyHeaderProps } from './types';

// Format large numbers (e.g., market cap)
function formatLargeNumber(value: number): string {
  if (value >= 1e12) return `$${(value / 1e12).toFixed(2)}T`;
  if (value >= 1e9) return `$${(value / 1e9).toFixed(2)}B`;
  if (value >= 1e6) return `$${(value / 1e6).toFixed(2)}M`;
  if (value >= 1e3) return `$${(value / 1e3).toFixed(2)}K`;
  return `$${value.toFixed(2)}`;
}

// Format price with animated transition
function formatPrice(value: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

// Format percentage
function formatPercent(value: number): string {
  const sign = value >= 0 ? '+' : '';
  return `${sign}${value.toFixed(2)}%`;
}

// Animated number component
function AnimatedPrice({ value, className }: { value: number; className?: string }) {
  const motionValue = useMotionValue(value);
  const springValue = useSpring(motionValue, { stiffness: 100, damping: 30 });
  const displayValue = useTransform(springValue, (v) => formatPrice(v));
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
        flash === 'up' && 'text-[#3FE3C2]',
        flash === 'down' && 'text-red-400',
        className
      )}
    >
      {formatPrice(value)}
    </motion.span>
  );
}

// Live indicator pulse
function LiveIndicator() {
  return (
    <div className="flex items-center gap-1.5">
      <span className="relative flex h-2 w-2">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#3FE3C2] opacity-75"></span>
        <span className="relative inline-flex rounded-full h-2 w-2 bg-[#3FE3C2]"></span>
      </span>
      <span className="text-xs text-gray-500 font-medium">LIVE</span>
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
  const [hasAlert, setHasAlert] = useState(false);
  const [logoError, setLogoError] = useState(false);
  const [copied, setCopied] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const isPositive = change >= 0;

  // Track scroll for compact mode
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 100);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleWatchlistToggle = () => {
    setIsWatched(!isWatched);
    // Haptic feedback
    if (navigator.vibrate) {
      navigator.vibrate(!isWatched ? [10, 50, 10] : 10);
    }
    // TODO: Implement watchlist API integration
  };

  const handleAlertToggle = () => {
    setHasAlert(!hasAlert);
    // Haptic feedback
    if (navigator.vibrate) {
      navigator.vibrate(!hasAlert ? [10, 50, 10] : 10);
    }
    // TODO: Implement price alerts
  };

  const handleCopySymbol = async () => {
    await navigator.clipboard.writeText(symbol);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShare = async () => {
    try {
      await navigator.share({
        title: `${symbol} - ${companyName}`,
        text: `Check out ${companyName} (${symbol}) on Deep Terminal`,
        url: window.location.href,
      });
    } catch {
      // Fallback: copy to clipboard
      await navigator.clipboard.writeText(window.location.href);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.23, 1, 0.32, 1] }}
      className={cn(
        'sticky top-0 z-40 transition-all duration-500',
        isScrolled ? 'py-3' : 'py-0'
      )}
    >
      {/* Premium Glassmorphism container */}
      <div className={cn(
        'relative overflow-hidden rounded-2xl transition-all duration-500 glass-premium corner-gradient',
        isScrolled 
          ? 'shadow-2xl shadow-black/40' 
          : 'shadow-lg shadow-black/20'
      )}>
        {/* Cinematic gradient overlay */}
        <div className="absolute inset-0 pointer-events-none">
          <div className={cn(
            'absolute inset-0 opacity-50 transition-opacity duration-500',
            isPositive 
              ? 'bg-gradient-to-r from-[#3FE3C2]/8 via-cyan-500/5 to-transparent'
              : 'bg-gradient-to-r from-red-500/8 via-pink-500/5 to-transparent'
          )} />
          {/* Additional radial glow */}
          <div className={cn(
            'absolute top-0 left-1/4 w-64 h-64 rounded-full blur-3xl opacity-20',
            isPositive ? 'bg-[#3FE3C2]' : 'bg-red-500'
          )} />
        </div>

        {/* Glowing neon border effect on top */}
        <div className={cn(
          'absolute top-0 left-0 right-0 h-[2px]',
          isPositive 
            ? 'bg-gradient-to-r from-transparent via-[#3FE3C2] to-transparent shadow-[0_0_8px_rgba(63,227,194,0.5)]'
            : 'bg-gradient-to-r from-transparent via-red-500 to-transparent shadow-[0_0_8px_rgba(239,68,68,0.5)]'
        )} />

        <div className={cn(
          'relative p-3 sm:p-4 md:p-5 lg:p-6 transition-all duration-300',
          isScrolled && 'py-2 sm:py-3 md:py-4'
        )}>
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3 sm:gap-4 md:gap-5 lg:gap-6">
            {/* Left Section - Company Info */}
            <motion.div 
              className="flex items-center gap-2.5 sm:gap-3 md:gap-4 lg:gap-5"
              layout
            >
              {/* Logo with glow effect */}
              <motion.div 
                className={cn(
                  'relative rounded-xl sm:rounded-2xl overflow-hidden flex items-center justify-center',
                  'bg-gradient-to-br from-white/10 to-white/5 border border-white/10',
                  'transition-all duration-300',
                  isScrolled ? 'h-10 w-10 sm:h-12 sm:w-12' : 'h-12 w-12 sm:h-14 sm:w-14 md:h-16 md:w-16'
                )}
                whileHover={{ scale: 1.05 }}
                transition={{ type: 'spring', stiffness: 400, damping: 25 }}
              >
                {logo && !logoError ? (
                  <Image
                    src={logo}
                    alt={`${companyName} logo`}
                    fill
                    className="object-contain p-1.5 sm:p-2"
                    onError={() => setLogoError(true)}
                  />
                ) : (
                  <Building2 className={cn(
                    'text-gray-500 transition-all',
                    isScrolled ? 'h-5 w-5 sm:h-6 sm:w-6' : 'h-6 w-6 sm:h-7 sm:w-7 md:h-8 md:w-8'
                  )} />
                )}
              </motion.div>

              {/* Company Details */}
              <div className="space-y-0.5 sm:space-y-1">
                <div className="flex items-center gap-1.5 sm:gap-2 md:gap-3">
                  <motion.h1 
                    className={cn(
                      'font-semibold text-white transition-all duration-300',
                      isScrolled ? 'text-base sm:text-lg md:text-xl' : 'text-lg sm:text-xl md:text-2xl'
                    )}
                    layout
                  >
                    {companyName}
                  </motion.h1>
                  <motion.button
                    onClick={handleCopySymbol}
                    className="group flex items-center gap-1 sm:gap-1.5 px-2 sm:px-2.5 md:px-3 py-0.5 sm:py-1 rounded-full bg-[#5BB9F7]/10 border border-[#5BB9F7]/30 hover:bg-[#5BB9F7]/20 transition-all duration-200"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <span className="text-[#5BB9F7] text-xs sm:text-sm font-medium">{symbol}</span>
                    <AnimatePresence mode="wait">
                      {copied ? (
                        <motion.div
                          key="check"
                          initial={{ opacity: 0, scale: 0.5 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.5 }}
                        >
                          <Check className="h-3 w-3 text-[#3FE3C2]" />
                        </motion.div>
                      ) : (
                        <motion.div
                          key="copy"
                          initial={{ opacity: 0, scale: 0.5 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.5 }}
                          className="opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <Copy className="h-2.5 w-2.5 sm:h-3 sm:w-3 text-[#5BB9F7]" />
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.button>
                </div>
                
                <AnimatePresence>
                  {!isScrolled && (sector || industry) && (
                    <motion.div 
                      className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm text-gray-400"
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                    >
                      {sector && <span>{sector}</span>}
                      {sector && industry && <span className="text-gray-600">•</span>}
                      {industry && <span>{industry}</span>}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>

            {/* Center Section - Price Display */}
            <motion.div 
              className="flex flex-col items-start lg:items-center gap-0.5 sm:gap-1"
              layout
            >
              <div className="flex items-center gap-2 sm:gap-3">
                <AnimatedPrice 
                  value={price} 
                  className={cn(
                    'font-light tracking-tight text-white metric-thin transition-all duration-300',
                    isScrolled ? 'text-2xl sm:text-3xl lg:text-4xl' : 'text-3xl sm:text-4xl lg:text-5xl'
                  )}
                />
                <LiveIndicator />
              </div>
              
              <motion.div
                className={cn(
                  'flex items-center gap-1.5 sm:gap-2 px-2 sm:px-2.5 md:px-3 py-1 sm:py-1.5 rounded-full text-xs sm:text-sm font-medium',
                  isPositive
                    ? 'bg-[#3FE3C2]/10 text-[#3FE3C2] border border-[#3FE3C2]/20'
                    : 'bg-red-500/10 text-red-400 border border-red-500/20'
                )}
                initial={{ scale: 1 }}
                animate={{ scale: [1, 1.02, 1] }}
                transition={{ duration: 0.3 }}
                key={`${change}-${changePercent}`}
              >
                <motion.div
                  animate={{ y: isPositive ? -1 : 1 }}
                  transition={{ repeat: Infinity, repeatType: 'reverse', duration: 1.5 }}
                >
                  {isPositive ? (
                    <TrendingUp className="h-3 w-3 sm:h-4 sm:w-4" />
                  ) : (
                    <TrendingDown className="h-3 w-3 sm:h-4 sm:w-4" />
                  )}
                </motion.div>
                <span>{isPositive ? '+' : ''}{formatPrice(change)}</span>
                <span className="opacity-70">({formatPercent(changePercent)})</span>
              </motion.div>
            </motion.div>

            {/* Right Section - Key Stats & Actions */}
            <motion.div 
              className="flex flex-wrap items-center gap-2 sm:gap-3 md:gap-4 lg:gap-6"
              layout
            >
              {/* Stats - hide on compact mode */}
              <AnimatePresence>
                {!isScrolled && (
                  <>
                    {/* Market Cap */}
                    <motion.div 
                      className="flex flex-col"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                    >
                      <span className="text-[9px] sm:text-[10px] uppercase tracking-wider text-gray-500 mb-0.5 sm:mb-1">Market Cap</span>
                      <span className="text-sm sm:text-base md:text-lg font-medium text-white">
                        {formatLargeNumber(marketCap)}
                      </span>
                    </motion.div>

                    {/* P/E Ratio */}
                    {peRatio !== null && (
                      <motion.div 
                        className="flex flex-col"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                        transition={{ delay: 0.1 }}
                      >
                        <span className="text-[9px] sm:text-[10px] uppercase tracking-wider text-gray-500 mb-0.5 sm:mb-1">P/E</span>
                        <span className="text-sm sm:text-base md:text-lg font-medium text-white">
                          {peRatio.toFixed(2)}
                        </span>
                      </motion.div>
                    )}

                    {/* Dividend Yield */}
                    {dividendYield !== null && dividendYield > 0 && (
                      <motion.div 
                        className="flex flex-col"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                        transition={{ delay: 0.2 }}
                      >
                        <span className="text-[9px] sm:text-[10px] uppercase tracking-wider text-gray-500 mb-0.5 sm:mb-1">Div Yield</span>
                        <span className="text-sm sm:text-base md:text-lg font-medium text-[#3FE3C2]">
                          {(dividendYield * 100).toFixed(2)}%
                        </span>
                      </motion.div>
                    )}
                  </>
                )}
              </AnimatePresence>

              {/* Action Buttons */}
              <div className="flex items-center gap-1.5 sm:gap-2">
                {/* Alert Button */}
                <motion.button
                  onClick={handleAlertToggle}
                  className={cn(
                    'h-8 w-8 sm:h-9 sm:w-9 md:h-10 md:w-10 rounded-lg sm:rounded-xl flex items-center justify-center transition-all duration-200',
                    hasAlert
                      ? 'bg-[#F59E0B] text-white shadow-lg shadow-[#F59E0B]/25'
                      : 'bg-white/5 border border-white/10 text-gray-400 hover:bg-white/10 hover:text-white'
                  )}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  title={hasAlert ? 'Remove alert' : 'Set price alert'}
                >
                  {hasAlert ? (
                    <BellRing className="h-4 w-4 sm:h-4.5 sm:w-4.5 md:h-5 md:w-5" />
                  ) : (
                    <Bell className="h-4 w-4 sm:h-4.5 sm:w-4.5 md:h-5 md:w-5" />
                  )}
                </motion.button>

                {/* Watchlist Button */}
                <motion.button
                  onClick={handleWatchlistToggle}
                  className={cn(
                    'h-8 w-8 sm:h-9 sm:w-9 md:h-10 md:w-10 rounded-lg sm:rounded-xl flex items-center justify-center transition-all duration-200',
                    isWatched
                      ? 'bg-[#5BB9F7] text-white shadow-lg shadow-[#5BB9F7]/25'
                      : 'bg-white/5 border border-white/10 text-gray-400 hover:bg-white/10 hover:text-white'
                  )}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  title={isWatched ? 'Remove from watchlist' : 'Add to watchlist'}
                >
                  <Star className={cn('h-4 w-4 sm:h-4.5 sm:w-4.5 md:h-5 md:w-5', isWatched && 'fill-current')} />
                </motion.button>

                {/* Share Button */}
                <motion.button
                  onClick={handleShare}
                  className="h-8 w-8 sm:h-9 sm:w-9 md:h-10 md:w-10 rounded-lg sm:rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-gray-400 hover:bg-white/10 hover:text-white transition-all duration-200"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  title="Share"
                >
                  <Share2 className="h-4 w-4 sm:h-4.5 sm:w-4.5 md:h-5 md:w-5" />
                </motion.button>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
