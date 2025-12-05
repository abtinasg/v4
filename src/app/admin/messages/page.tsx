'use client'

import { useState, useEffect, useCallback } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { 
  Search, 
  RefreshCcw, 
  ChevronLeft, 
  ChevronRight,
  Eye,
  Mail,
  Archive,
  Trash2,
  MessageSquare,
  Loader2,
  CheckCheck,
  Reply,
  Inbox,
  MailOpen,
  Send
} from 'lucide-react'

interface ContactMessage {
  id: string
  name: string
  email: string
  subject: string | null
  message: string
  status: 'new' | 'read' | 'replied' | 'archived'
  adminReply: string | null
  repliedAt: string | null
  ipAddress: string | null
  createdAt: string
  updatedAt: string
}

interface Pagination {
  total: number
  page: number
  limit: number
  totalPages: number
}

interface Stats {
  new: number
  read: number
  replied: number
  archived: number
}

const statusColors = {
  new: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  read: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  replied: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
  archived: 'bg-slate-500/20 text-slate-400 border-slate-500/30',
}

const statusIcons = {
  new: Inbox,
  read: MailOpen,
  replied: CheckCheck,
  archived: Archive,
}

export default function AdminMessagesPage() {
  const [messages, setMessages] = useState<ContactMessage[]>([])
  const [pagination, setPagination] = useState<Pagination>({ total: 0, page: 1, limit: 20, totalPages: 1 })
  const [stats, setStats] = useState<Stats>({ new: 0, read: 0, replied: 0, archived: 0 })
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('')
  const [sortOrder, setSortOrder] = useState('desc')
  
  // View dialog state
  const [viewMessage, setViewMessage] = useState<ContactMessage | null>(null)
  const [replyText, setReplyText] = useState('')
  const [replying, setReplying] = useState(false)
  
  // Delete dialog state
  const [deleteMessage, setDeleteMessage] = useState<ContactMessage | null>(null)
  const [deleting, setDeleting] = useState(false)

  const fetchMessages = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pagination.limit.toString(),
        sortOrder,
        ...(search && { search }),
        ...(statusFilter && { status: statusFilter }),
      })

      const res = await fetch(`/api/admin/messages?${params}`)
      if (!res.ok) throw new Error('Failed to fetch')
      
      const data = await res.json()
      setMessages(data.messages)
      setPagination(data.pagination)
      setStats(data.stats)
    } catch (error) {
      console.error('Error fetching messages:', error)
    } finally {
      setLoading(false)
    }
  }, [pagination.page, search, statusFilter, sortOrder])

  useEffect(() => {
    fetchMessages()
  }, [fetchMessages])

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      setPagination(p => ({ ...p, page: 1 }))
    }, 300)
    return () => clearTimeout(timer)
  }, [search])

  const handleViewMessage = async (message: ContactMessage) => {
    setViewMessage(message)
    setReplyText(message.adminReply || '')
    
    // Mark as read if new
    if (message.status === 'new') {
      try {
        await fetch('/api/admin/messages', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: message.id, status: 'read' }),
        })
        fetchMessages()
      } catch (error) {
        console.error('Error marking as read:', error)
      }
    }
  }

  const handleReply = async () => {
    if (!viewMessage || !replyText.trim()) return
    setReplying(true)
    try {
      const res = await fetch('/api/admin/messages', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          id: viewMessage.id, 
          adminReply: replyText.trim(),
        }),
      })
      
      if (!res.ok) throw new Error('Failed to save reply')
      
      setViewMessage(null)
      setReplyText('')
      fetchMessages()
    } catch (error) {
      console.error('Error saving reply:', error)
    } finally {
      setReplying(false)
    }
  }

  const handleStatusChange = async (id: string, status: string) => {
    try {
      await fetch('/api/admin/messages', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status }),
      })
      fetchMessages()
    } catch (error) {
      console.error('Error updating status:', error)
    }
  }

  const handleDelete = async () => {
    if (!deleteMessage) return
    setDeleting(true)
    try {
      const res = await fetch(`/api/admin/messages?id=${deleteMessage.id}`, {
        method: 'DELETE',
      })
      
      if (!res.ok) throw new Error('Failed to delete')
      
      setDeleteMessage(null)
      fetchMessages()
    } catch (error) {
      console.error('Error deleting message:', error)
    } finally {
      setDeleting(false)
    }
  }

  const formatDate = (date: string) => {
    return new Date(date).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-3">
            <MessageSquare className="w-7 h-7 text-emerald-400" />
            Contact Messages
          </h1>
          <p className="text-slate-400 mt-1">Manage customer inquiries and support requests</p>
        </div>
        <Button
          onClick={fetchMessages}
          variant="outline"
          className="border-slate-700 hover:bg-slate-800"
        >
          <RefreshCcw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'New', count: stats.new, icon: Inbox, color: 'text-blue-400', bg: 'bg-blue-500/10' },
          { label: 'Read', count: stats.read, icon: MailOpen, color: 'text-yellow-400', bg: 'bg-yellow-500/10' },
          { label: 'Replied', count: stats.replied, icon: CheckCheck, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
          { label: 'Archived', count: stats.archived, icon: Archive, color: 'text-slate-400', bg: 'bg-slate-500/10' },
        ].map((stat) => (
          <Card key={stat.label} className="bg-slate-800/50 border-slate-700/50">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-400 text-sm">{stat.label}</p>
                  <p className={`text-2xl font-bold ${stat.color}`}>{stat.count}</p>
                </div>
                <div className={`p-3 rounded-xl ${stat.bg}`}>
                  <stat.icon className={`w-5 h-5 ${stat.color}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Filters */}
      <Card className="bg-slate-800/50 border-slate-700/50">
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by name, email, or subject..."
                className="pl-10 bg-slate-900/50 border-slate-700"
              />
            </div>
            <Select value={statusFilter} onValueChange={(v) => { setStatusFilter(v); setPagination(p => ({ ...p, page: 1 })) }}>
              <SelectTrigger className="w-full sm:w-40 bg-slate-900/50 border-slate-700">
                <SelectValue placeholder="All Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Status</SelectItem>
                <SelectItem value="new">New</SelectItem>
                <SelectItem value="read">Read</SelectItem>
                <SelectItem value="replied">Replied</SelectItem>
                <SelectItem value="archived">Archived</SelectItem>
              </SelectContent>
            </Select>
            <Select value={sortOrder} onValueChange={setSortOrder}>
              <SelectTrigger className="w-full sm:w-36 bg-slate-900/50 border-slate-700">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="desc">Newest First</SelectItem>
                <SelectItem value="asc">Oldest First</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Messages Table */}
      <Card className="bg-slate-800/50 border-slate-700/50">
        <CardContent className="p-0">
          {loading ? (
            <div className="flex justify-center items-center py-20">
              <Loader2 className="w-8 h-8 animate-spin text-emerald-400" />
            </div>
          ) : messages.length === 0 ? (
            <div className="text-center py-20">
              <MessageSquare className="w-12 h-12 text-slate-600 mx-auto mb-4" />
              <p className="text-slate-400">No messages found</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="border-slate-700/50 hover:bg-transparent">
                  <TableHead className="text-slate-400">Status</TableHead>
                  <TableHead className="text-slate-400">From</TableHead>
                  <TableHead className="text-slate-400">Subject</TableHead>
                  <TableHead className="text-slate-400">Date</TableHead>
                  <TableHead className="text-slate-400 text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {messages.map((message) => {
                  const StatusIcon = statusIcons[message.status]
                  return (
                    <TableRow key={message.id} className="border-slate-700/50">
                      <TableCell>
                        <Badge variant="outline" className={statusColors[message.status]}>
                          <StatusIcon className="w-3 h-3 mr-1.5" />
                          {message.status.charAt(0).toUpperCase() + message.status.slice(1)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="text-white font-medium">{message.name}</p>
                          <p className="text-slate-500 text-sm">{message.email}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <p className="text-slate-300 truncate max-w-[250px]">
                          {message.subject || <span className="text-slate-500 italic">No subject</span>}
                        </p>
                      </TableCell>
                      <TableCell className="text-slate-400 text-sm">
                        {formatDate(message.createdAt)}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-slate-400 hover:text-white"
                            onClick={() => handleViewMessage(message)}
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-slate-400 hover:text-yellow-400"
                            onClick={() => handleStatusChange(message.id, 'archived')}
                          >
                            <Archive className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-slate-400 hover:text-red-400"
                            onClick={() => setDeleteMessage(message)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="flex justify-between items-center">
          <p className="text-sm text-slate-400">
            Showing {((pagination.page - 1) * pagination.limit) + 1} to {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} messages
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPagination(p => ({ ...p, page: p.page - 1 }))}
              disabled={pagination.page === 1}
              className="border-slate-700"
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPagination(p => ({ ...p, page: p.page + 1 }))}
              disabled={pagination.page === pagination.totalPages}
              className="border-slate-700"
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}

      {/* View/Reply Dialog */}
      <Dialog open={!!viewMessage} onOpenChange={(open) => !open && setViewMessage(null)}>
        <DialogContent className="bg-slate-900 border-slate-700 max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-white flex items-center gap-2">
              <Mail className="w-5 h-5 text-emerald-400" />
              Message from {viewMessage?.name}
            </DialogTitle>
            <DialogDescription className="text-slate-400">
              {viewMessage?.email} • {viewMessage && formatDate(viewMessage.createdAt)}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            {viewMessage?.subject && (
              <div>
                <label className="text-xs text-slate-500 uppercase">Subject</label>
                <p className="text-white">{viewMessage.subject}</p>
              </div>
            )}
            
            <div>
              <label className="text-xs text-slate-500 uppercase">Message</label>
              <div className="p-4 rounded-lg bg-slate-800/50 border border-slate-700/50">
                <p className="text-slate-300 whitespace-pre-wrap">{viewMessage?.message}</p>
              </div>
            </div>

            <div className="border-t border-slate-700/50 pt-4">
              <label className="text-xs text-slate-500 uppercase mb-2 block">Admin Reply</label>
              <Textarea
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                placeholder="Write your reply here..."
                rows={4}
                className="bg-slate-800/50 border-slate-700 text-white"
              />
              <p className="text-xs text-slate-500 mt-2">
                This reply will be saved for your reference. You can also send it via email separately.
              </p>
            </div>
          </div>

          <DialogFooter className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => setViewMessage(null)}
              className="border-slate-700"
            >
              Close
            </Button>
            <Button
              onClick={handleReply}
              disabled={replying || !replyText.trim()}
              className="bg-emerald-600 hover:bg-emerald-500"
            >
              {replying ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4 mr-2" />
                  Save Reply
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteMessage} onOpenChange={(open) => !open && setDeleteMessage(null)}>
        <AlertDialogContent className="bg-slate-900 border-slate-700">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-white">Delete Message?</AlertDialogTitle>
            <AlertDialogDescription className="text-slate-400">
              This will permanently delete the message from {deleteMessage?.name}. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="border-slate-700 hover:bg-slate-800">Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={deleting}
              className="bg-red-600 hover:bg-red-500"
            >
              {deleting ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
