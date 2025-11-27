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
      className="metric-row-hover flex items-center justify-between py-3 matte-separator last:after:hidden group"
      style={{ animationDelay: `${index * 30}ms` }}
    >
      <div className="flex items-center gap-2">
        <span className="text-sm text-gray-400 group-hover:text-gray-200 transition-colors duration-200">
          {metric.label}
        </span>
        {metric.tooltip && (
          <div className="relative">
            <button
              onMouseEnter={() => setShowTooltip(true)}
              onMouseLeave={() => setShowTooltip(false)}
              className="text-gray-600 hover:text-cyan-400 transition-colors duration-200"
            >
              <Info className="h-3.5 w-3.5" />
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

      <div className="flex items-center gap-3">
        {/* Change indicator */}
        {metric.change !== undefined && (
          <span
            className={cn(
              'flex items-center gap-1 text-xs font-medium',
              metric.change > 0 ? 'text-[#3FE3C2] drop-shadow-[0_0_4px_rgba(63,227,194,0.4)]' : 
              metric.change < 0 ? 'text-red-400 drop-shadow-[0_0_4px_rgba(248,113,113,0.4)]' : 
              'text-gray-500'
            )}
          >
            {metric.change > 0 ? (
              <TrendingUp className="h-3 w-3" />
            ) : metric.change < 0 ? (
              <TrendingDown className="h-3 w-3" />
            ) : (
              <Minus className="h-3 w-3" />
            )}
            {metric.change > 0 ? '+' : ''}
            {(metric.change * 100).toFixed(1)}%
          </span>
        )}

        {/* Value with dynamic glow */}
        <span
          className={cn(
            'text-sm font-semibold min-w-[80px] text-right transition-all duration-200',
            metric.status ? `${statusClasses.text} ${statusClasses.glow}` : 'text-white'
          )}
        >
          {formatValue(metric.value, metric.format)}
        </span>
      </div>
    </div>
  );
}

// Premium Glassmorphic Metric Card
export function MetricCard({ title, description, metrics, icon, className }: MetricCardProps) {
  const scoreMetric = metrics.find((m) => m.format === 'score');
  const regularMetrics = metrics.filter((m) => m.format !== 'score');

  return (
    <div
      className={cn(
        'relative overflow-hidden rounded-2xl p-6 animate-fade-up',
        'glass-premium corner-gradient',
        'hover:border-white/15 hover:shadow-[0_8px_32px_rgba(0,0,0,0.4)]',
        'transition-all duration-300 group',
        className
      )}
    >
      {/* Subtle gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/[0.02] to-transparent pointer-events-none" />
      
      {/* Header */}
      <div className="relative flex items-start justify-between mb-5">
        <div className="flex items-center gap-3">
          {icon && (
            <div className="h-11 w-11 rounded-xl bg-gradient-to-br from-white/10 to-white/5 border border-white/10 flex items-center justify-center text-cyan-400 group-hover:text-cyan-300 group-hover:border-cyan-500/30 transition-all duration-300 shadow-lg">
              {icon}
            </div>
          )}
          <div>
            <h3 className="text-base font-semibold text-white neon-underline pb-1">{title}</h3>
            {description && (
              <p className="text-xs text-gray-500 mt-1.5">{description}</p>
            )}
          </div>
        </div>
      </div>

      {/* Metrics List */}
      <div className="relative space-y-0">
        {regularMetrics.map((metric, index) => (
          <MetricRow key={`${metric.label}-${index}`} metric={metric} index={index} />
        ))}
      </div>

      {/* Score Bar (if applicable) */}
      {scoreMetric && (
        <div className="relative mt-4 pt-4 border-t border-white/5">
          <div className="flex justify-between items-center mb-2">
            <span className="text-xs text-gray-500 uppercase tracking-wider">Score</span>
            <span className="text-sm font-bold text-white">{Math.round(scoreMetric.value as number)}/100</span>
          </div>
          <div className="h-2 bg-white/5 rounded-full overflow-hidden">
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
// PREMIUM 3D NEON SCORE GAUGE
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
      // Animate score number
      const duration = 1500;
      const steps = 60;
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
  
  // Color based on score
  const getScoreColors = () => {
    if (percentage >= 70) {
      return {
        stroke: 'url(#gradient-high)',
        glow: 'rgba(63, 227, 194, 0.6)',
        text: 'text-[#3FE3C2]',
        ring: '#3FE3C2',
        class: 'score-high'
      };
    }
    if (percentage >= 40) {
      return {
        stroke: 'url(#gradient-medium)',
        glow: 'rgba(245, 158, 11, 0.6)',
        text: 'text-amber-400',
        ring: '#F59E0B',
        class: 'score-medium'
      };
    }
    return {
      stroke: 'url(#gradient-low)',
      glow: 'rgba(239, 68, 68, 0.6)',
      text: 'text-red-400',
      ring: '#EF4444',
      class: 'score-low'
    };
  };

  const colors = getScoreColors();
  const radius = 42;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <div
      ref={cardRef}
      className={cn(
        'relative overflow-hidden rounded-2xl p-5 flex flex-col items-center text-center',
        'glass-premium animate-fade-up',
        'hover:scale-[1.02] hover:shadow-[0_12px_40px_rgba(0,0,0,0.5)]',
        'transition-all duration-300 group cursor-pointer',
        colors.class,
        className
      )}
    >
      {/* Radial gradient background glow */}
      <div 
        className="absolute inset-0 opacity-30 transition-opacity duration-300 group-hover:opacity-50"
        style={{
          background: `radial-gradient(circle at 50% 40%, ${colors.glow}, transparent 70%)`
        }}
      />

      {/* 3D Neon Gauge */}
      <div className="relative w-28 h-28 mb-4">
        {/* Outer glow ring */}
        <div 
          className="absolute inset-0 rounded-full animate-gauge-glow-pulse"
          style={{ 
            '--glow-color': colors.glow,
            filter: `drop-shadow(0 0 12px ${colors.glow})`
          } as React.CSSProperties}
        />
        
        <svg 
          className="w-28 h-28 transform -rotate-90"
          viewBox="0 0 100 100"
        >
          {/* Gradient definitions */}
          <defs>
            <linearGradient id="gradient-high" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#3FE3C2" />
              <stop offset="100%" stopColor="#00D4FF" />
            </linearGradient>
            <linearGradient id="gradient-medium" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#F59E0B" />
              <stop offset="100%" stopColor="#FB923C" />
            </linearGradient>
            <linearGradient id="gradient-low" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#EF4444" />
              <stop offset="100%" stopColor="#F472B6" />
            </linearGradient>
            <filter id="glow">
              <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
              <feMerge>
                <feMergeNode in="coloredBlur"/>
                <feMergeNode in="SourceGraphic"/>
              </feMerge>
            </filter>
          </defs>

          {/* Background track */}
          <circle
            cx="50"
            cy="50"
            r={radius}
            stroke="rgba(255, 255, 255, 0.05)"
            strokeWidth="6"
            fill="none"
          />
          
          {/* Inner shadow for depth */}
          <circle
            cx="50"
            cy="50"
            r={radius - 4}
            stroke="rgba(0, 0, 0, 0.3)"
            strokeWidth="1"
            fill="none"
          />

          {/* Animated progress arc */}
          <circle
            cx="50"
            cy="50"
            r={radius}
            stroke={colors.stroke}
            strokeWidth="6"
            fill="none"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={isVisible ? strokeDashoffset : circumference}
            filter="url(#glow)"
            className="transition-all duration-[1500ms] ease-out"
            style={{
              filter: `drop-shadow(0 0 6px ${colors.ring})`
            }}
          />
        </svg>

        {/* Center score display - floating card effect */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <div className="glass-premium rounded-xl px-3 py-2 shadow-xl">
            <span className={cn('text-2xl font-bold', colors.text)}>
              {Math.round(animatedScore)}
            </span>
            <span className="text-xs text-gray-500 block">/ {maxScore}</span>
          </div>
        </div>
      </div>

      {/* Title & Description */}
      <div className="relative flex items-center gap-2 mb-1">
        {icon && (
          <span className={cn('transition-colors duration-300', colors.text)}>
            {icon}
          </span>
        )}
        <h3 className="text-sm font-semibold text-white">{title}</h3>
      </div>
      {description && (
        <p className="text-xs text-gray-500">{description}</p>
      )}
    </div>
  );
}
