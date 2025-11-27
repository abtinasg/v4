'use client'

import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { TrendingUp, TrendingDown } from 'lucide-react'
import { cn } from '@/lib/utils'
import { TableCell, TableRow } from '@/components/ui/table'

export interface StockData {
  symbol: string
  name: string
  price: number
  change: number
  changePercent: number
  volume: number
  marketCap: number
  logo?: string
}

interface StockRowProps {
  stock: StockData
  index: number
}

// Format market cap to readable format
function formatMarketCap(value: number): string {
  if (value >= 1e12) {
    return `$${(value / 1e12).toFixed(2)}T`
  }
  if (value >= 1e9) {
    return `$${(value / 1e9).toFixed(2)}B`
  }
  if (value >= 1e6) {
    return `$${(value / 1e6).toFixed(2)}M`
  }
  return `$${value.toLocaleString()}`
}

// Format volume to readable format
function formatVolume(value: number): string {
  if (value >= 1e9) {
    return `${(value / 1e9).toFixed(2)}B`
  }
  if (value >= 1e6) {
    return `${(value / 1e6).toFixed(2)}M`
  }
  if (value >= 1e3) {
    return `${(value / 1e3).toFixed(2)}K`
  }
  return value.toLocaleString()
}

// Generate a logo URL based on symbol (using a placeholder service)
function getLogoUrl(symbol: string): string {
  // Using a placeholder - in production use a real logo service
  return `https://logo.clearbit.com/${symbol.toLowerCase()}.com`
}

export function StockRow({ stock, index }: StockRowProps) {
  const router = useRouter()
  const isPositive = stock.change >= 0

  const handleClick = () => {
    router.push(`/dashboard/stock-analysis?symbol=${stock.symbol}`)
  }

  return (
    <motion.tr
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
      onClick={handleClick}
      className="group border-b border-white/5 hover:bg-white/[0.02] cursor-pointer transition-colors"
    >
      {/* Symbol & Logo */}
      <TableCell className="py-4">
        <div className="flex items-center gap-3">
          <div className="relative w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center overflow-hidden">
            {/* Placeholder with symbol initial */}
            <span className="text-sm font-bold text-white">{stock.symbol.charAt(0)}</span>
            {/* Optional: Real logo with fallback */}
            {/* <img 
              src={getLogoUrl(stock.symbol)} 
              alt={stock.symbol}
              className="w-full h-full object-contain"
              onError={(e) => {
                e.currentTarget.style.display = 'none'
              }}
            /> */}
          </div>
          <div>
            <p className="font-semibold text-white group-hover:text-blue-400 transition-colors">
              {stock.symbol}
            </p>
            <p className="text-xs text-gray-500 truncate max-w-[120px]">{stock.name}</p>
          </div>
        </div>
      </TableCell>

      {/* Price */}
      <TableCell className="py-4">
        <span className="font-mono font-medium text-white">
          ${stock.price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </span>
      </TableCell>

      {/* Change ($) */}
      <TableCell className="py-4">
        <span
          className={cn(
            'font-mono font-medium',
            isPositive ? 'text-green-400' : 'text-red-400'
          )}
        >
          {isPositive ? '+' : ''}
          ${Math.abs(stock.change).toFixed(2)}
        </span>
      </TableCell>

      {/* Change (%) */}
      <TableCell className="py-4">
        <div
          className={cn(
            'inline-flex items-center gap-1 px-2 py-1 rounded-md text-sm font-medium',
            isPositive ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'
          )}
        >
          {isPositive ? (
            <TrendingUp className="w-3.5 h-3.5" />
          ) : (
            <TrendingDown className="w-3.5 h-3.5" />
          )}
          {isPositive ? '+' : ''}
          {stock.changePercent.toFixed(2)}%
        </div>
      </TableCell>

      {/* Volume */}
      <TableCell className="py-4">
        <span className="font-mono text-gray-400">{formatVolume(stock.volume)}</span>
      </TableCell>

      {/* Market Cap */}
      <TableCell className="py-4">
        <span className="font-mono text-gray-400">{formatMarketCap(stock.marketCap)}</span>
      </TableCell>
    </motion.tr>
  )
}
