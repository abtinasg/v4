'use client';

import { useState, useEffect, useRef } from 'react';
import { Info, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { MetricCardProps, MetricItem, MetricStatus } from './types';

// Format metric value based on format type
function formatValue(value: number | string | null, format?: MetricItem['format']): string {
  if (value === null || value === undefined) return '—';
  if (typeof value === 'string') return value;

  switch (format) {
    case 'percent':
      // FRED API returns percentages as values (e.g., 3.8 = 3.8%, not 0.038)
      // So we don't multiply by 100 for values that are already in percentage form
      // Check if value is likely already a percentage (between -100 and 100)
      if (Math.abs(value) <= 100) {
        return `${value.toFixed(2)}%`;
      }
      // For decimal percentages (0.038 = 3.8%), multiply by 100
      return `${(value * 100).toFixed(2)}%`;
    case 'currency':
      if (value >= 1e12) return `$${(value / 1e12).toFixed(2)}T`;
      if (value >= 1e9) return `$${(value / 1e9).toFixed(2)}B`;
      if (value >= 1e6) return `$${(value / 1e6).toFixed(2)}M`;
      return `$${value.toLocaleString('en-US', { maximumFractionDigits: 2 })}`;
    case 'ratio':
      return value.toFixed(2) + 'x';
    case 'score':
      return Math.round(value).toString();
    case 'number':
    default:
      return typeof value === 'number' ? value.toFixed(2) : String(value);
  }
}

// Get status color classes with neon glow
function getStatusClasses(status?: MetricStatus): { bg: string; text: string; glow: string } {
  switch (status) {
    case 'positive':
      return {
        bg: 'bg-[#3FE3C2]/10',
        text: 'text-[#3FE3C2]',
        glow: 'drop-shadow-[0_0_8px_rgba(63,227,194,0.5)]',
      };
    case 'negative':
      return {
        bg: 'bg-red-500/10',
        text: 'text-red-400',
        glow: 'drop-shadow-[0_0_8px_rgba(248,113,113,0.5)]',
      };
    case 'neutral':
    default:
      return {
        bg: 'bg-white/5',
        text: 'text-gray-400',
        glow: '',
      };
  }
}

// Metric Row Component with hover effects
function MetricRow({ metric, index }: { metric: MetricItem; index: number }) {
  const [showTooltip, setShowTooltip] = useState(false);
  const statusClasses = getStatusClasses(metric.status);

  return (
    <div 
      className="metric-row-hover flex items-center justify-between py-2 sm:py-2.5 md:py-3 matte-separator last:after:hidden group"
      style={{ animationDelay: `${index * 30}ms` }}
    >
      <div className="flex items-center gap-1.5 sm:gap-2">
        <span className="text-xs sm:text-sm text-gray-400 group-hover:text-gray-200 transition-colors duration-200">
          {metric.label}
        </span>
        {metric.tooltip && (
          <div className="relative">
            <button
              onMouseEnter={() => setShowTooltip(true)}
              onMouseLeave={() => setShowTooltip(false)}
              className="text-gray-600 hover:text-cyan-400 transition-colors duration-200"
            >
              <Info className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
            </button>
            {showTooltip && (
              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 glass-premium rounded-lg text-xs text-gray-300 w-52 z-50 shadow-2xl">
                {metric.tooltip}
                <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-white/10" />
              </div>
            )}
          </div>
        )}
      </div>

      <div className="flex items-center gap-2 sm:gap-3">
        {/* Change indicator */}
        {metric.change !== undefined && (
          <span
            className={cn(
              'flex items-center gap-0.5 sm:gap-1 text-[10px] sm:text-xs font-medium',
              metric.change > 0 ? 'text-[#3FE3C2] drop-shadow-[0_0_4px_rgba(63,227,194,0.4)]' : 
              metric.change < 0 ? 'text-red-400 drop-shadow-[0_0_4px_rgba(248,113,113,0.4)]' : 
              'text-gray-500'
            )}
          >
            {metric.change > 0 ? (
              <TrendingUp className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
            ) : metric.change < 0 ? (
              <TrendingDown className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
            ) : (
              <Minus className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
            )}
            {metric.change > 0 ? '+' : ''}
            {(metric.change * 100).toFixed(1)}%
          </span>
        )}

        {/* Value with dynamic glow */}
        <span
          className={cn(
            'text-xs sm:text-sm font-semibold min-w-[70px] sm:min-w-[80px] text-right transition-all duration-200',
            metric.status ? `${statusClasses.text} ${statusClasses.glow}` : 'text-white'
          )}
        >
          {formatValue(metric.value, metric.format)}
        </span>
      </div>
    </div>
  );
}

// Premium Glassmorphic Metric Card with Progressive Disclosure
export function MetricCard({ title, description, metrics, icon, className }: MetricCardProps) {
  const [isExpanded, setIsExpanded] = useState(true);
  const scoreMetric = metrics.find((m) => m.format === 'score');
  const regularMetrics = metrics.filter((m) => m.format !== 'score');

  const toggleExpand = () => {
    setIsExpanded(!isExpanded);
    // Haptic feedback
    if (navigator.vibrate) {
      navigator.vibrate(10);
    }
  };

  return (
    <div
      className={cn(
        'relative overflow-hidden rounded-xl sm:rounded-2xl p-3 sm:p-4 md:p-5 lg:p-6 animate-fade-up',
        'glass-premium corner-gradient',
        'hover:border-white/15 hover:shadow-[0_8px_32px_rgba(0,0,0,0.4)]',
        'transition-all duration-300 group',
        className
      )}
    >
      {/* Subtle gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/[0.02] to-transparent pointer-events-none" />
      
      {/* Header */}
      <div className="relative flex items-start justify-between mb-3 sm:mb-4 md:mb-5">
        <div className="flex items-center gap-2 sm:gap-2.5 md:gap-3 flex-1">
          {icon && (
            <div className="h-9 w-9 sm:h-10 sm:w-10 md:h-11 md:w-11 rounded-lg sm:rounded-xl bg-gradient-to-br from-white/10 to-white/5 border border-white/10 flex items-center justify-center text-cyan-400 group-hover:text-cyan-300 group-hover:border-cyan-500/30 transition-all duration-300 shadow-lg shrink-0">
              {icon}
            </div>
          )}
          <div className="flex-1 min-w-0">
            <h3 className="text-sm sm:text-base font-semibold text-white neon-underline pb-0.5 sm:pb-1">{title}</h3>
            {description && (
              <p className="text-[10px] sm:text-xs text-gray-500 mt-1 sm:mt-1.5">{description}</p>
            )}
          </div>
        </div>
        
        {/* Collapse/Expand Button - Mobile Only */}
        <button
          onClick={toggleExpand}
          className="sm:hidden ml-2 p-1.5 rounded-lg hover:bg-white/5 text-gray-400 hover:text-white transition-colors touch-manipulation"
          aria-label={isExpanded ? 'Collapse' : 'Expand'}
        >
          <svg 
            className={cn('w-4 h-4 transition-transform duration-300', !isExpanded && 'rotate-180')}
            fill="none" 
            viewBox="0 0 24 24" 
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
          </svg>
        </button>
      </div>

      {/* Metrics List with Collapse Animation */}
      <div 
        className={cn(
          'relative overflow-hidden transition-all duration-300',
          !isExpanded && 'max-h-0 opacity-0 sm:max-h-full sm:opacity-100',
          isExpanded && 'max-h-[2000px] opacity-100'
        )}
      >
        <div className="space-y-0">
          {regularMetrics.map((metric, index) => (
            <MetricRow key={`${metric.label}-${index}`} metric={metric} index={index} />
          ))}
        </div>
      </div>

      {/* Score Bar (if applicable) */}
      {scoreMetric && (
        <div className="relative mt-3 sm:mt-4 pt-3 sm:pt-4 border-t border-white/5">
          <div className="flex justify-between items-center mb-1.5 sm:mb-2">
            <span className="text-[10px] sm:text-xs text-gray-500 uppercase tracking-wider">Score</span>
            <span className="text-xs sm:text-sm font-bold text-white">{Math.round(scoreMetric.value as number)}/100</span>
          </div>
          <div className="h-1.5 sm:h-2 bg-white/5 rounded-full overflow-hidden">
            <div
              className={cn(
                'h-full rounded-full transition-all duration-1000 ease-out',
                (scoreMetric.value as number) >= 70 ? 'bg-gradient-to-r from-[#3FE3C2] to-[#00D4FF] shadow-[0_0_12px_rgba(63,227,194,0.5)]' :
                (scoreMetric.value as number) >= 40 ? 'bg-gradient-to-r from-amber-400 to-orange-400 shadow-[0_0_12px_rgba(251,191,36,0.5)]' :
                'bg-gradient-to-r from-red-400 to-pink-400 shadow-[0_0_12px_rgba(248,113,113,0.5)]'
              )}
              style={{ width: `${Math.min((scoreMetric.value as number), 100)}%` }}
            />
          </div>
        </div>
      )}
    </div>
  );
}

// ============================================================================
// PREMIUM SCORE GAUGE - Fintech Design System
// Inspired by: Robinhood, Public.com, Finary, Koyfin
// ============================================================================

export function ScoreCard({
  title,
  score,
  maxScore = 100,
  description,
  icon,
  className,
}: {
  title: string;
  score: number | null;
  maxScore?: number;
  description?: string;
  icon?: React.ReactNode;
  className?: string;
}) {
  const [isVisible, setIsVisible] = useState(false);
  const [animatedScore, setAnimatedScore] = useState(0);
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.2 }
    );

    if (cardRef.current) {
      observer.observe(cardRef.current);
    }

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (isVisible && score !== null) {
      const duration = 1200;
      const steps = 50;
      const increment = score / steps;
      let current = 0;
      const timer = setInterval(() => {
        current += increment;
        if (current >= score) {
          setAnimatedScore(score);
          clearInterval(timer);
        } else {
          setAnimatedScore(current);
        }
      }, duration / steps);

      return () => clearInterval(timer);
    }
  }, [isVisible, score]);

  if (score === null) return null;

  const percentage = Math.min((score / maxScore) * 100, 100);
  
  // Refined color palette - softer, more premium
  const getScoreColors = () => {
    if (percentage >= 70) {
      return {
        stroke: 'url(#scoreGradientHigh)',
        glow: 'rgba(16, 185, 129, 0.15)',
        text: 'text-emerald-400',
        ring: '#10B981',
      };
    }
    if (percentage >= 40) {
      return {
        stroke: 'url(#scoreGradientMid)',
        glow: 'rgba(245, 158, 11, 0.15)',
        text: 'text-amber-400',
        ring: '#F59E0B',
      };
    }
    return {
      stroke: 'url(#scoreGradientLow)',
      glow: 'rgba(239, 68, 68, 0.15)',
      text: 'text-rose-400',
      ring: '#EF4444',
    };
  };

  const colors = getScoreColors();
  const radius = 38;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <div
      ref={cardRef}
      className={cn(
        // Premium glass card with generous padding
        'relative overflow-hidden rounded-2xl',
        'p-6 sm:p-7 lg:p-8',
        'flex flex-col items-center text-center',
        // Glass background with soft blur
        'bg-white/[0.02] backdrop-blur-[8px]',
        'border border-white/[0.06]',
        // Subtle shadow for depth
        'shadow-[0_4px_24px_rgba(0,0,0,0.12)]',
        // Smooth hover transition
        'hover:bg-white/[0.03] hover:border-white/[0.10]',
        'hover:shadow-[0_8px_32px_rgba(0,0,0,0.16)]',
        'transition-all duration-300 ease-out',
        className
      )}
    >
      {/* Subtle radial glow - reduced intensity */}
      <div 
        className="absolute inset-0 opacity-40 pointer-events-none"
        style={{
          background: `radial-gradient(circle at 50% 30%, ${colors.glow}, transparent 60%)`
        }}
      />

      {/* Circular Gauge - Robinhood-inspired thin stroke */}
      <div className="relative w-24 h-24 sm:w-28 sm:h-28 lg:w-32 lg:h-32 mb-5 sm:mb-6">
        <svg 
          className="w-full h-full transform -rotate-90"
          viewBox="0 0 100 100"
        >
          {/* Gradient definitions */}
          <defs>
            <linearGradient id="scoreGradientHigh" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#10B981" />
              <stop offset="100%" stopColor="#34D399" />
            </linearGradient>
            <linearGradient id="scoreGradientMid" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#F59E0B" />
              <stop offset="100%" stopColor="#FBBF24" />
            </linearGradient>
            <linearGradient id="scoreGradientLow" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#EF4444" />
              <stop offset="100%" stopColor="#F87171" />
            </linearGradient>
          </defs>

          {/* Background track - very subtle */}
          <circle
            cx="50"
            cy="50"
            r={radius}
            stroke="rgba(255, 255, 255, 0.04)"
            strokeWidth="3"
            fill="none"
          />

          {/* Progress arc - thinner, elegant stroke */}
          <circle
            cx="50"
            cy="50"
            r={radius}
            stroke={colors.stroke}
            strokeWidth="3"
            fill="none"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={isVisible ? strokeDashoffset : circumference}
            className="transition-all duration-[1200ms] ease-out"
            style={{
              filter: `drop-shadow(0 0 4px ${colors.ring}40)`
            }}
          />
        </svg>

        {/* Center score display - clean typography */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className={cn(
            'text-[28px] sm:text-[32px] lg:text-[36px] font-medium tracking-tight leading-none',
            colors.text
          )}>
            {Math.round(animatedScore)}
          </span>
          <span className="text-[11px] sm:text-[12px] text-white/30 font-normal mt-1">
            /{maxScore}
          </span>
        </div>
      </div>

      {/* Category label - clean hierarchy */}
      <div className="flex flex-col items-center gap-1.5">
        <div className="flex items-center gap-2">
          {icon && (
            <span className="text-white/40">
              {icon}
            </span>
          )}
          <h3 className="text-[14px] sm:text-[15px] font-medium text-white/90 tracking-[-0.01em] leading-[1.4]">
            {title}
          </h3>
        </div>
        {description && (
          <p className="text-[11px] sm:text-[12px] text-white/35 font-normal leading-[1.4]">
            {description}
          </p>
        )}
      </div>
    </div>
  );
}
