/**
 * Allocation Chart Component
 * 
 * Displays portfolio allocation as a pie/donut chart
 * - Interactive hover states
 * - Legend with percentages
 * - Responsive design
 */

'use client'

import React, { memo, useState } from 'react'
import { motion } from 'framer-motion'
import { PieChart } from 'lucide-react'
import { cn } from '@/lib/utils'
import { usePortfolioStore, useAllocationData } from '@/lib/stores/portfolio-store'

// ============================================================
// TYPES
// ============================================================

interface AllocationItem {
  symbol: string
  name: string
  value: number
  percentage: number
  color: string
}

// ============================================================
// DONUT CHART
// ============================================================

interface DonutChartProps {
  data: AllocationItem[]
  hoveredIndex: number | null
  onHover: (index: number | null) => void
}

const DonutChart = memo(function DonutChart({ data, hoveredIndex, onHover }: DonutChartProps) {
  const size = 200
  const strokeWidth = 35
  const radius = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius
  const center = size / 2

  // Calculate stroke dash offsets
  let currentOffset = 0
  const segments = data.map((item, index) => {
    const segmentLength = (item.percentage / 100) * circumference
    const segment = {
      ...item,
      index,
      strokeDasharray: `${segmentLength} ${circumference - segmentLength}`,
      strokeDashoffset: -currentOffset,
      isHovered: hoveredIndex === index,
    }
    currentOffset += segmentLength
    return segment
  })

  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      className="transform -rotate-90"
    >
      {/* Background circle */}
      <circle
        cx={center}
        cy={center}
        r={radius}
        fill="none"
        stroke="rgba(255,255,255,0.05)"
        strokeWidth={strokeWidth}
      />

      {/* Segments */}
      {segments.map((segment) => (
        <motion.circle
          key={segment.symbol}
          cx={center}
          cy={center}
          r={radius}
          fill="none"
          stroke={segment.color}
          strokeWidth={segment.isHovered ? strokeWidth + 8 : strokeWidth}
          strokeDasharray={segment.strokeDasharray}
          strokeDashoffset={segment.strokeDashoffset}
          strokeLinecap="round"
          className="cursor-pointer transition-all duration-200"
          style={{
            filter: segment.isHovered ? 'brightness(1.2)' : 'none',
            opacity: hoveredIndex !== null && !segment.isHovered ? 0.4 : 1,
          }}
          onMouseEnter={() => onHover(segment.index)}
          onMouseLeave={() => onHover(null)}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: segment.strokeDashoffset }}
          transition={{ duration: 0.8, ease: 'easeOut', delay: segment.index * 0.1 }}
        />
      ))}

      {/* Center text */}
      <g className="transform rotate-90" style={{ transformOrigin: 'center' }}>
        <text
          x={center}
          y={center - 8}
          textAnchor="middle"
          className="fill-white/50 text-xs"
        >
          {hoveredIndex !== null ? data[hoveredIndex]?.symbol : 'Total'}
        </text>
        <text
          x={center}
          y={center + 12}
          textAnchor="middle"
          className="fill-white font-semibold text-lg"
        >
          {hoveredIndex !== null
            ? `${data[hoveredIndex]?.percentage.toFixed(1)}%`
            : `${data.length}`}
        </text>
        {hoveredIndex === null && (
          <text
            x={center}
            y={center + 28}
            textAnchor="middle"
            className="fill-white/40 text-xs"
          >
            holdings
          </text>
        )}
      </g>
    </svg>
  )
})

// ============================================================
// LEGEND
// ============================================================

interface LegendProps {
  data: AllocationItem[]
  hoveredIndex: number | null
  onHover: (index: number | null) => void
}

const Legend = memo(function Legend({ data, hoveredIndex, onHover }: LegendProps) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value)
  }

  return (
    <div className="space-y-2">
      {data.map((item, index) => (
        <motion.div
          key={item.symbol}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: index * 0.05 }}
          className={cn(
            'flex items-center gap-3 p-2 rounded-lg cursor-pointer transition-all',
            hoveredIndex === index ? 'bg-white/10' : 'hover:bg-white/5',
            hoveredIndex !== null && hoveredIndex !== index && 'opacity-40'
          )}
          onMouseEnter={() => onHover(index)}
          onMouseLeave={() => onHover(null)}
        >
          <div
            className="w-3 h-3 rounded-full shrink-0"
            style={{ backgroundColor: item.color }}
          />
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between">
              <span className="font-medium text-white text-sm">{item.symbol}</span>
              <span className="text-white/70 text-sm font-mono">
                {item.percentage.toFixed(1)}%
              </span>
            </div>
            <div className="flex items-center justify-between text-xs text-white/40">
              <span className="truncate mr-2">{item.name}</span>
              <span className="font-mono shrink-0">{formatCurrency(item.value)}</span>
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  )
})

// ============================================================
// ALLOCATION CHART COMPONENT
// ============================================================

export const AllocationChart = memo(function AllocationChart() {
  const allocationData = useAllocationData()
  const isLoading = usePortfolioStore((state) => state.isLoading)
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null)

  if (isLoading) {
    return (
      <div className="h-64 flex items-center justify-center">
        <div className="w-32 h-32 rounded-full bg-white/5 animate-pulse" />
      </div>
    )
  }

  if (allocationData.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center mb-3">
          <PieChart className="w-6 h-6 text-white/20" />
        </div>
        <p className="text-sm text-white/50">
          Add holdings to see allocation
        </p>
      </div>
    )
  }

  // Sort by percentage descending
  const sortedData = [...allocationData].sort((a, b) => b.percentage - a.percentage)

  return (
    <div className="flex flex-col lg:flex-row items-center gap-6 lg:gap-8">
      {/* Chart */}
      <div className="shrink-0">
        <DonutChart
          data={sortedData}
          hoveredIndex={hoveredIndex}
          onHover={setHoveredIndex}
        />
      </div>

      {/* Legend */}
      <div className="flex-1 w-full max-w-sm">
        <Legend
          data={sortedData}
          hoveredIndex={hoveredIndex}
          onHover={setHoveredIndex}
        />
      </div>
    </div>
  )
})

export default AllocationChart
