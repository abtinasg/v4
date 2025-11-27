'use client'

import { useId } from 'react'
import { Area, AreaChart, ResponsiveContainer } from 'recharts'

interface SparklineProps {
  data: number[]
  positive: boolean
  height?: number
}

export function Sparkline({ data, positive, height = 40 }: SparklineProps) {
  const id = useId()
  
  // Transform data for Recharts
  const chartData = data.map((value, index) => ({
    index,
    value,
  }))

  const color = positive ? '#22c55e' : '#ef4444'
  const gradientId = `sparkline-gradient-${positive ? 'green' : 'red'}-${id}`

  return (
    <ResponsiveContainer width="100%" height={height}>
      <AreaChart data={chartData} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity={0.3} />
            <stop offset="100%" stopColor={color} stopOpacity={0} />
          </linearGradient>
        </defs>
        <Area
          type="monotone"
          dataKey="value"
          stroke={color}
          strokeWidth={1.5}
          fill={`url(#${gradientId})`}
          isAnimationActive={true}
          animationDuration={500}
        />
      </AreaChart>
    </ResponsiveContainer>
  )
}
