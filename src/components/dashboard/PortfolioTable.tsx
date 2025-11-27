import { useEffect, useState } from 'react'
import { useUser } from '@clerk/nextjs'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { portfolioHoldingsQueries } from '@/lib/db/queries'
import { PortfolioHolding, HoldingWithMetrics } from '@/types'
import { formatCurrency, formatNumber } from '@/lib/utils'

export function PortfolioTable() {
  const { user } = useUser()
  const [holdings, setHoldings] = useState<HoldingWithMetrics[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchHoldings = async () => {
      if (!user?.id) return

      try {
        const portfolioData = await portfolioHoldingsQueries.getByUserId(user.id)

        // For now, we'll use mock current prices. In a real app, you'd fetch from an API
        const holdingsWithMetrics: HoldingWithMetrics[] = portfolioData.map((holding: PortfolioHolding) => {
          const mockCurrentPrice = parseFloat(holding.avgBuyPrice) * (0.8 + Math.random() * 0.4) // Mock price variation
          const quantity = parseFloat(holding.quantity)
          const avgBuyPrice = parseFloat(holding.avgBuyPrice)
          const totalCost = quantity * avgBuyPrice
          const totalValue = quantity * mockCurrentPrice
          const gainLoss = totalValue - totalCost
          const gainLossPercent = (gainLoss / totalCost) * 100

          return {
            ...holding,
            currentPrice: mockCurrentPrice,
            totalValue,
            totalCost,
            gainLoss,
            gainLossPercent,
          }
        })

        setHoldings(holdingsWithMetrics)
      } catch (error) {
        console.error('Error fetching portfolio holdings:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchHoldings()
  }, [user?.id])

  if (loading) {
    return (
      <Card className="glass-premium">
        <CardHeader>
          <CardTitle className="text-white">Portfolio Holdings</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-32">
            <div className="text-gray-400">Loading portfolio...</div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (holdings.length === 0) {
    return (
      <Card className="glass-premium">
        <CardHeader>
          <CardTitle className="text-white">Portfolio Holdings</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-32">
            <div className="text-gray-400">No holdings found. Start building your portfolio!</div>
          </div>
        </CardContent>
      </Card>
    )
  }

  const totalValue = holdings.reduce((sum, holding) => sum + holding.totalValue, 0)
  const totalCost = holdings.reduce((sum, holding) => sum + holding.totalCost, 0)
  const totalGainLoss = totalValue - totalCost
  const totalGainLossPercent = (totalGainLoss / totalCost) * 100

  return (
    <Card className="glass-premium">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-white">Portfolio Holdings</CardTitle>
          <div className="text-right">
            <div className="text-sm text-gray-400">Total Value</div>
            <div className="text-lg font-semibold text-white">{formatCurrency(totalValue)}</div>
            <div className={`text-sm ${totalGainLoss >= 0 ? 'text-green-400' : 'text-red-400'}`}>
              {totalGainLoss >= 0 ? '+' : ''}{formatCurrency(totalGainLoss)} ({totalGainLossPercent >= 0 ? '+' : ''}{totalGainLossPercent.toFixed(2)}%)
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow className="border-b border-white/5 hover:bg-transparent">
              <TableHead className="text-gray-400">Symbol</TableHead>
              <TableHead className="text-gray-400 text-right">Shares</TableHead>
              <TableHead className="text-gray-400 text-right">Avg Cost</TableHead>
              <TableHead className="text-gray-400 text-right">Current</TableHead>
              <TableHead className="text-gray-400 text-right">Total Value</TableHead>
              <TableHead className="text-gray-400 text-right">P&L</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {holdings.map((holding) => (
              <TableRow key={holding.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                <TableCell className="font-medium text-white">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold">{holding.symbol}</span>
                  </div>
                </TableCell>
                <TableCell className="text-right text-gray-300">
                  {formatNumber(parseFloat(holding.quantity))}
                </TableCell>
                <TableCell className="text-right text-gray-300">
                  {formatCurrency(parseFloat(holding.avgBuyPrice))}
                </TableCell>
                <TableCell className="text-right text-gray-300">
                  {formatCurrency(holding.currentPrice)}
                </TableCell>
                <TableCell className="text-right text-white font-medium">
                  {formatCurrency(holding.totalValue)}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex flex-col items-end">
                    <span className={`font-medium ${holding.gainLoss >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                      {holding.gainLoss >= 0 ? '+' : ''}{formatCurrency(holding.gainLoss)}
                    </span>
                    <span className={`text-sm ${holding.gainLossPercent >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                      ({holding.gainLossPercent >= 0 ? '+' : ''}{holding.gainLossPercent.toFixed(2)}%)
                    </span>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}