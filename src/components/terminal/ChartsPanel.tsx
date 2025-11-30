'use client'

import { useState, useEffect, useRef } from 'react'
import { LineChart, CandlestickChart, TrendingUp, TrendingDown, Maximize2, ZoomIn, ZoomOut, Settings } from 'lucide-react'

interface ChartData {
  date: string
  open: number
  high: number
  low: number
  close: number
  volume: number
}

export function ChartsPanel() {
  const [symbol, setSymbol] = useState('AAPL')
  const [chartType, setChartType] = useState<'line' | 'candle'>('candle')
  const [timeframe, setTimeframe] = useState('1D')
  const [data, setData] = useState<ChartData[]>([])
  const [loading, setLoading] = useState(true)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const fetchChartData = async () => {
      try {
        setLoading(true)
        const res = await fetch(`/api/market/chart-data?symbol=${symbol}&timeframe=${timeframe}`)
        if (res.ok) {
          const result = await res.json()
          if (result.success && result.data?.length > 0) {
            setData(result.data)
          } else {
            // Generate sample data as fallback
            const points: ChartData[] = []
            let price = 180
            const now = new Date()
            
            for (let i = 100; i >= 0; i--) {
              const date = new Date(now)
              date.setMinutes(date.getMinutes() - i * 5)
              
              const change = (Math.random() - 0.48) * 2
              const open = price
              const close = price + change
              const high = Math.max(open, close) + Math.random() * 0.5
              const low = Math.min(open, close) - Math.random() * 0.5
              const volume = Math.floor(Math.random() * 1000000) + 500000
              
              points.push({ date: date.toISOString(), open, high, low, close, volume })
              price = close
            }
            setData(points)
          }
        }
      } catch (error) {
        console.error('Failed to fetch chart data:', error)
        // Generate sample data on error
        const points: ChartData[] = []
        let price = 180
        const now = new Date()
        
        for (let i = 100; i >= 0; i--) {
          const date = new Date(now)
          date.setMinutes(date.getMinutes() - i * 5)
          
          const change = (Math.random() - 0.48) * 2
          points.push({
            date: date.toISOString(),
            open: price,
            high: price + Math.random() * 0.5,
            low: price - Math.random() * 0.5,
            close: price + change,
            volume: Math.floor(Math.random() * 1000000) + 500000
          })
          price = price + change
        }
        setData(points)
      } finally {
        setLoading(false)
      }
    }

    fetchChartData()
  }, [symbol, timeframe])

  useEffect(() => {
    if (!canvasRef.current || data.length === 0) return
    
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    
    // Set canvas size
    const rect = canvas.getBoundingClientRect()
    canvas.width = rect.width * 2
    canvas.height = rect.height * 2
    ctx.scale(2, 2)
    
    const width = rect.width
    const height = rect.height
    
    // Clear canvas
    ctx.fillStyle = '#0a0a0a'
    ctx.fillRect(0, 0, width, height)
    
    // Calculate price range
    const prices = data.flatMap(d => [d.high, d.low])
    const minPrice = Math.min(...prices) * 0.999
    const maxPrice = Math.max(...prices) * 1.001
    const priceRange = maxPrice - minPrice
    
    // Draw grid
    ctx.strokeStyle = '#1a1a1a'
    ctx.lineWidth = 1
    for (let i = 0; i <= 5; i++) {
      const y = (height * 0.8) * (i / 5) + 20
      ctx.beginPath()
      ctx.moveTo(40, y)
      ctx.lineTo(width - 10, y)
      ctx.stroke()
      
      // Price labels
      const price = maxPrice - (priceRange * i / 5)
      ctx.fillStyle = '#666'
      ctx.font = '10px monospace'
      ctx.fillText(`$${price.toFixed(2)}`, 2, y + 3)
    }
    
    // Draw chart
    const chartWidth = width - 50
    const chartHeight = height * 0.8
    const barWidth = chartWidth / data.length
    
    if (chartType === 'candle') {
      data.forEach((d, i) => {
        const x = 45 + i * barWidth
        const openY = 20 + chartHeight * (1 - (d.open - minPrice) / priceRange)
        const closeY = 20 + chartHeight * (1 - (d.close - minPrice) / priceRange)
        const highY = 20 + chartHeight * (1 - (d.high - minPrice) / priceRange)
        const lowY = 20 + chartHeight * (1 - (d.low - minPrice) / priceRange)
        
        const isGreen = d.close >= d.open
        ctx.strokeStyle = isGreen ? '#22c55e' : '#ef4444'
        ctx.fillStyle = isGreen ? '#22c55e' : '#ef4444'
        
        // Wick
        ctx.beginPath()
        ctx.moveTo(x + barWidth / 2, highY)
        ctx.lineTo(x + barWidth / 2, lowY)
        ctx.stroke()
        
        // Body
        const bodyTop = Math.min(openY, closeY)
        const bodyHeight = Math.abs(closeY - openY) || 1
        ctx.fillRect(x + 1, bodyTop, barWidth - 2, bodyHeight)
      })
    } else {
      // Line chart
      ctx.strokeStyle = '#00D4FF'
      ctx.lineWidth = 2
      ctx.beginPath()
      data.forEach((d, i) => {
        const x = 45 + i * barWidth + barWidth / 2
        const y = 20 + chartHeight * (1 - (d.close - minPrice) / priceRange)
        if (i === 0) {
          ctx.moveTo(x, y)
        } else {
          ctx.lineTo(x, y)
        }
      })
      ctx.stroke()
      
      // Area fill
      const gradient = ctx.createLinearGradient(0, 20, 0, chartHeight + 20)
      gradient.addColorStop(0, 'rgba(0, 212, 255, 0.3)')
      gradient.addColorStop(1, 'rgba(0, 212, 255, 0)')
      ctx.fillStyle = gradient
      ctx.lineTo(45 + (data.length - 1) * barWidth + barWidth / 2, chartHeight + 20)
      ctx.lineTo(45 + barWidth / 2, chartHeight + 20)
      ctx.closePath()
      ctx.fill()
    }
    
    // Volume bars
    const maxVolume = Math.max(...data.map(d => d.volume))
    const volumeHeight = height * 0.15
    data.forEach((d, i) => {
      const x = 45 + i * barWidth
      const h = (d.volume / maxVolume) * volumeHeight
      const isGreen = d.close >= d.open
      ctx.fillStyle = isGreen ? 'rgba(34, 197, 94, 0.5)' : 'rgba(239, 68, 68, 0.5)'
      ctx.fillRect(x + 1, height - h - 5, barWidth - 2, h)
    })
    
  }, [data, chartType])

  const latestPrice = data.length > 0 ? data[data.length - 1] : null
  const prevPrice = data.length > 1 ? data[data.length - 2] : null
  const priceChange = latestPrice && prevPrice ? latestPrice.close - prevPrice.close : 0
  const priceChangePercent = prevPrice ? (priceChange / prevPrice.close) * 100 : 0

  return (
    <div className="h-full flex flex-col bg-[#0a0a0a]">
      {/* Header */}
      <div className="flex items-center justify-between p-3 border-b border-gray-800">
        <div className="flex items-center gap-3">
          <CandlestickChart className="w-4 h-4 text-cyan-500" />
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={symbol}
              onChange={(e) => setSymbol(e.target.value.toUpperCase())}
              className="w-20 bg-gray-900 border border-gray-700 rounded px-2 py-1 text-sm text-white font-mono"
              placeholder="SYMBOL"
            />
            {latestPrice && (
              <div className="flex items-center gap-2">
                <span className="text-white font-mono text-lg">${latestPrice.close.toFixed(2)}</span>
                <span className={`flex items-center text-sm font-mono ${priceChange >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                  {priceChange >= 0 ? <TrendingUp className="w-3 h-3 mr-1" /> : <TrendingDown className="w-3 h-3 mr-1" />}
                  {priceChange >= 0 ? '+' : ''}{priceChange.toFixed(2)} ({priceChangePercent.toFixed(2)}%)
                </span>
              </div>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          {/* Timeframe */}
          <div className="flex gap-1">
            {['1D', '1W', '1M', '3M', '1Y'].map((tf) => (
              <button
                key={tf}
                onClick={() => setTimeframe(tf)}
                className={`px-2 py-1 text-xs rounded ${
                  timeframe === tf 
                    ? 'bg-cyan-600 text-white' 
                    : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                }`}
              >
                {tf}
              </button>
            ))}
          </div>
          {/* Chart type */}
          <div className="flex gap-1 ml-2 border-l border-gray-700 pl-2">
            <button
              onClick={() => setChartType('candle')}
              className={`p-1.5 rounded ${chartType === 'candle' ? 'bg-cyan-600' : 'bg-gray-800'}`}
            >
              <CandlestickChart className="w-4 h-4 text-white" />
            </button>
            <button
              onClick={() => setChartType('line')}
              className={`p-1.5 rounded ${chartType === 'line' ? 'bg-cyan-600' : 'bg-gray-800'}`}
            >
              <LineChart className="w-4 h-4 text-white" />
            </button>
          </div>
          {/* Controls */}
          <div className="flex gap-1 ml-2 border-l border-gray-700 pl-2">
            <button className="p-1.5 rounded bg-gray-800 hover:bg-gray-700">
              <ZoomIn className="w-4 h-4 text-gray-400" />
            </button>
            <button className="p-1.5 rounded bg-gray-800 hover:bg-gray-700">
              <ZoomOut className="w-4 h-4 text-gray-400" />
            </button>
            <button className="p-1.5 rounded bg-gray-800 hover:bg-gray-700">
              <Maximize2 className="w-4 h-4 text-gray-400" />
            </button>
          </div>
        </div>
      </div>

      {/* Chart Canvas */}
      <div className="flex-1 p-2">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-gray-500">Loading chart...</div>
          </div>
        ) : (
          <canvas 
            ref={canvasRef} 
            className="w-full h-full"
            style={{ imageRendering: 'crisp-edges' }}
          />
        )}
      </div>

      {/* Footer */}
      <div className="p-2 border-t border-gray-800 flex justify-between text-xs text-gray-500">
        <div className="flex gap-4">
          <span>O: ${latestPrice?.open.toFixed(2) || '-'}</span>
          <span>H: ${latestPrice?.high.toFixed(2) || '-'}</span>
          <span>L: ${latestPrice?.low.toFixed(2) || '-'}</span>
          <span>C: ${latestPrice?.close.toFixed(2) || '-'}</span>
        </div>
        <div>
          Vol: {latestPrice ? (latestPrice.volume / 1000000).toFixed(2) + 'M' : '-'}
        </div>
      </div>
    </div>
  )
}
