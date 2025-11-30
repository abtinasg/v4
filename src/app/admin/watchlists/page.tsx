'use client'

import { useState, useEffect, useCallback } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { 
  List, 
  RefreshCcw, 
  ChevronLeft, 
  ChevronRight,
  Loader2,
  Eye
} from 'lucide-react'

interface Watchlist {
  id: string
  name: string
  isDefault: boolean
  createdAt: string
  updatedAt: string
  user: {
    id: string
    email: string
  }
  items: Array<{
    id: string
    symbol: string
    notes: string | null
    addedAt: string
  }>
  itemCount: number
}

interface Pagination {
  total: number
  page: number
  limit: number
  totalPages: number
}

export default function AdminWatchlistsPage() {
  const [watchlists, setWatchlists] = useState<Watchlist[]>([])
  const [pagination, setPagination] = useState<Pagination>({ total: 0, page: 1, limit: 20, totalPages: 1 })
  const [loading, setLoading] = useState(true)
  const [expandedId, setExpandedId] = useState<string | null>(null)

  const fetchWatchlists = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pagination.limit.toString(),
      })

      const res = await fetch(`/api/admin/watchlists?${params}`)
      if (!res.ok) throw new Error('Failed to fetch')
      
      const data = await res.json()
      setWatchlists(data.watchlists)
      setPagination(data.pagination)
    } catch (error) {
      console.error('Error fetching watchlists:', error)
    } finally {
      setLoading(false)
    }
  }, [pagination.page])

  useEffect(() => {
    fetchWatchlists()
  }, [fetchWatchlists])

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white">Watchlists</h1>
          <p className="text-slate-400 mt-1">All user watchlists</p>
        </div>
        <Button onClick={fetchWatchlists} variant="outline" className="gap-2">
          <RefreshCcw className="w-4 h-4" />
          Refresh
        </Button>
      </div>

      {/* Watchlists Table */}
      <Card className="bg-slate-800/50 border-slate-700/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-white">
            <List className="w-5 h-5" />
            Watchlists ({pagination.total})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-emerald-500" />
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="border-slate-700">
                      <TableHead className="text-slate-400">Name</TableHead>
                      <TableHead className="text-slate-400">Owner</TableHead>
                      <TableHead className="text-slate-400">Items</TableHead>
                      <TableHead className="text-slate-400 hidden md:table-cell">Created</TableHead>
                      <TableHead className="text-slate-400">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {watchlists.map((watchlist) => (
                      <>
                        <TableRow key={watchlist.id} className="border-slate-700/50 hover:bg-slate-700/30">
                          <TableCell className="font-medium text-white">
                            <div className="flex items-center gap-2">
                              {watchlist.name}
                              {watchlist.isDefault && (
                                <Badge variant="outline" className="text-xs">Default</Badge>
                              )}
                            </div>
                          </TableCell>
                          <TableCell className="text-slate-300">
                            <span className="truncate max-w-[200px] block">{watchlist.user?.email || 'Unknown'}</span>
                          </TableCell>
                          <TableCell className="text-slate-300">{watchlist.itemCount}</TableCell>
                          <TableCell className="hidden md:table-cell text-slate-400">
                            {new Date(watchlist.createdAt).toLocaleDateString()}
                          </TableCell>
                          <TableCell>
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-8 w-8 p-0 text-slate-400 hover:text-emerald-400"
                              onClick={() => setExpandedId(expandedId === watchlist.id ? null : watchlist.id)}
                            >
                              <Eye className="w-4 h-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                        {expandedId === watchlist.id && watchlist.items.length > 0 && (
                          <TableRow className="border-slate-700/50 bg-slate-700/20">
                            <TableCell colSpan={5} className="p-4">
                              <div className="flex flex-wrap gap-2">
                                {watchlist.items.map((item) => (
                                  <Badge key={item.id} className="bg-slate-600/50 text-slate-200">
                                    {item.symbol}
                                  </Badge>
                                ))}
                              </div>
                            </TableCell>
                          </TableRow>
                        )}
                      </>
                    ))}
                    
                    {watchlists.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center py-12 text-slate-400">
                          No watchlists found
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>

              {/* Pagination */}
              {pagination.totalPages > 1 && (
                <div className="flex items-center justify-between mt-6 pt-4 border-t border-slate-700">
                  <p className="text-sm text-slate-400">
                    Showing {((pagination.page - 1) * pagination.limit) + 1} - {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total}
                  </p>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={pagination.page === 1}
                      onClick={() => setPagination(p => ({ ...p, page: p.page - 1 }))}
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </Button>
                    <span className="text-sm text-slate-400 px-3">
                      Page {pagination.page} of {pagination.totalPages}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={pagination.page === pagination.totalPages}
                      onClick={() => setPagination(p => ({ ...p, page: p.page + 1 }))}
                    >
                      <ChevronRight className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
