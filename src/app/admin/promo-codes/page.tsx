'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { 
  Gift,
  Plus,
  Trash2,
  Copy,
  Check,
  Calendar,
  Users,
  Coins,
  Percent,
  Clock,
  BarChart3,
  Search,
  RefreshCw,
  Eye,
  X,
  AlertTriangle
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface PromoCode {
  id: string
  code: string
  type: 'credits' | 'discount' | 'trial'
  credits: string | null
  discountPercent: string | null
  discountAmount: string | null
  trialDays: string | null
  maxUses: string | null
  usedCount: string
  maxUsesPerUser: string
  minPurchaseAmount: string | null
  applicablePackages: string[] | null
  applicableTiers: string[] | null
  startsAt: string | null
  expiresAt: string | null
  isActive: boolean
  description: string | null
  createdAt: string
}

interface PromoOverview {
  totalCodes: number
  activeCodes: number
  totalRedemptions: number
  totalCreditsAwarded: number
}

export default function PromoCodesPage() {
  const [promoCodes, setPromoCodes] = useState<PromoCode[]>([])
  const [overview, setOverview] = useState<PromoOverview | null>(null)
  const [loading, setLoading] = useState(true)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [copiedCode, setCopiedCode] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  
  // Create form state
  const [newCode, setNewCode] = useState({
    code: '',
    type: 'credits' as 'credits' | 'discount' | 'trial',
    credits: '',
    discountPercent: '',
    discountAmount: '',
    trialDays: '',
    maxUses: '',
    maxUsesPerUser: '1',
    minPurchaseAmount: '',
    expiresAt: '',
    description: '',
  })

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    setLoading(true)
    try {
      // Fetch overview
      const overviewRes = await fetch('/api/admin/promo-codes?action=overview')
      if (overviewRes.ok) {
        const data = await overviewRes.json()
        setOverview(data)
      }
      
      // Fetch all codes
      const codesRes = await fetch('/api/admin/promo-codes?action=list')
      if (codesRes.ok) {
        const data = await codesRes.json()
        setPromoCodes(data.promoCodes || [])
      }
    } catch (error) {
      console.error('Failed to fetch promo codes:', error)
    }
    setLoading(false)
  }

  const handleCreate = async () => {
    try {
      const res = await fetch('/api/admin/promo-codes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'create',
          code: newCode.code.toUpperCase(),
          type: newCode.type,
          credits: newCode.credits ? Number(newCode.credits) : undefined,
          discountPercent: newCode.discountPercent ? Number(newCode.discountPercent) : undefined,
          discountAmount: newCode.discountAmount ? Number(newCode.discountAmount) : undefined,
          trialDays: newCode.trialDays ? Number(newCode.trialDays) : undefined,
          maxUses: newCode.maxUses ? Number(newCode.maxUses) : undefined,
          maxUsesPerUser: Number(newCode.maxUsesPerUser) || 1,
          minPurchaseAmount: newCode.minPurchaseAmount ? Number(newCode.minPurchaseAmount) : undefined,
          expiresAt: newCode.expiresAt || undefined,
          description: newCode.description || undefined,
        }),
      })
      
      if (res.ok) {
        setShowCreateModal(false)
        setNewCode({
          code: '',
          type: 'credits',
          credits: '',
          discountPercent: '',
          discountAmount: '',
          trialDays: '',
          maxUses: '',
          maxUsesPerUser: '1',
          minPurchaseAmount: '',
          expiresAt: '',
          description: '',
        })
        fetchData()
      } else {
        const error = await res.json()
        alert(error.error || 'Failed to create promo code')
      }
    } catch (error) {
      console.error('Failed to create promo code:', error)
    }
  }

  const handleToggleActive = async (id: string, isActive: boolean) => {
    try {
      const res = await fetch('/api/admin/promo-codes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'update', id, isActive: !isActive }),
      })
      if (res.ok) fetchData()
    } catch (error) {
      console.error('Failed to toggle promo code:', error)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('آیا از حذف این کد اطمینان دارید؟')) return
    try {
      const res = await fetch('/api/admin/promo-codes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'delete', id }),
      })
      if (res.ok) fetchData()
    } catch (error) {
      console.error('Failed to delete promo code:', error)
    }
  }

  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code)
    setCopiedCode(code)
    setTimeout(() => setCopiedCode(null), 2000)
  }

  const filteredCodes = promoCodes.filter(code => 
    code.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
    code.description?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'credits': return 'bg-green-500/20 text-green-400'
      case 'discount': return 'bg-amber-500/20 text-amber-400'
      case 'trial': return 'bg-blue-500/20 text-blue-400'
      default: return 'bg-gray-500/20 text-gray-400'
    }
  }

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'credits': return 'کردیت'
      case 'discount': return 'تخفیف'
      case 'trial': return 'آزمایشی'
      default: return type
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white flex items-center gap-2">
            <Gift className="w-8 h-8 text-pink-400" />
            Promo Codes
          </h1>
          <p className="text-slate-400 mt-1">مدیریت کدهای تخفیف و پروموشن</p>
        </div>
        <Button onClick={() => setShowCreateModal(true)} className="gap-2">
          <Plus className="w-4 h-4" />
          کد جدید
        </Button>
      </div>

      {/* Overview Cards */}
      {overview && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <Card className="bg-slate-800/50 border-slate-700/50">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-violet-500/20 flex items-center justify-center">
                  <Gift className="w-5 h-5 text-violet-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-white">{overview.totalCodes}</p>
                  <p className="text-xs text-slate-400">کل کدها</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-slate-800/50 border-slate-700/50">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-emerald-500/20 flex items-center justify-center">
                  <Check className="w-5 h-5 text-emerald-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-white">{overview.activeCodes}</p>
                  <p className="text-xs text-slate-400">فعال</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-slate-800/50 border-slate-700/50">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-cyan-500/20 flex items-center justify-center">
                  <Users className="w-5 h-5 text-cyan-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-white">{overview.totalRedemptions}</p>
                  <p className="text-xs text-slate-400">استفاده شده</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-slate-800/50 border-slate-700/50">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-amber-500/20 flex items-center justify-center">
                  <Coins className="w-5 h-5 text-amber-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-white">{overview.totalCreditsAwarded.toLocaleString()}</p>
                  <p className="text-xs text-slate-400">کردیت اهدا شده</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Search & Actions */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <Input
            placeholder="جستجوی کد..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 bg-slate-800/50 border-slate-700"
          />
        </div>
        <Button variant="outline" size="icon" onClick={fetchData}>
          <RefreshCw className={cn("w-4 h-4", loading && "animate-spin")} />
        </Button>
      </div>

      {/* Promo Codes Table */}
      <Card className="bg-slate-800/50 border-slate-700/50">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-700">
                  <th className="text-left py-3 px-4 text-slate-400 font-medium">کد</th>
                  <th className="text-left py-3 px-4 text-slate-400 font-medium">نوع</th>
                  <th className="text-left py-3 px-4 text-slate-400 font-medium">مقدار</th>
                  <th className="text-center py-3 px-4 text-slate-400 font-medium">استفاده</th>
                  <th className="text-left py-3 px-4 text-slate-400 font-medium">انقضا</th>
                  <th className="text-center py-3 px-4 text-slate-400 font-medium">وضعیت</th>
                  <th className="text-center py-3 px-4 text-slate-400 font-medium">عملیات</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={7} className="text-center py-8 text-slate-400">
                      در حال بارگذاری...
                    </td>
                  </tr>
                ) : filteredCodes.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="text-center py-8 text-slate-400">
                      کدی یافت نشد
                    </td>
                  </tr>
                ) : (
                  filteredCodes.map((code) => (
                    <tr key={code.id} className="border-b border-slate-700/50 hover:bg-slate-700/20">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <code className="font-mono text-cyan-400 bg-cyan-500/10 px-2 py-1 rounded">
                            {code.code}
                          </code>
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-6 w-6"
                            onClick={() => copyCode(code.code)}
                          >
                            {copiedCode === code.code ? (
                              <Check className="w-3 h-3 text-green-400" />
                            ) : (
                              <Copy className="w-3 h-3" />
                            )}
                          </Button>
                        </div>
                        {code.description && (
                          <p className="text-xs text-slate-500 mt-1">{code.description}</p>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        <Badge className={getTypeColor(code.type)}>
                          {getTypeLabel(code.type)}
                        </Badge>
                      </td>
                      <td className="py-3 px-4 text-white">
                        {code.type === 'credits' && code.credits && (
                          <span className="flex items-center gap-1">
                            <Coins className="w-4 h-4 text-yellow-400" />
                            {Number(code.credits).toLocaleString()}
                          </span>
                        )}
                        {code.type === 'discount' && (
                          <>
                            {code.discountPercent && (
                              <span className="flex items-center gap-1">
                                <Percent className="w-4 h-4 text-amber-400" />
                                {code.discountPercent}%
                              </span>
                            )}
                            {code.discountAmount && (
                              <span>${code.discountAmount}</span>
                            )}
                          </>
                        )}
                        {code.type === 'trial' && code.trialDays && (
                          <span className="flex items-center gap-1">
                            <Clock className="w-4 h-4 text-blue-400" />
                            {code.trialDays} روز
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span className="text-white">{code.usedCount}</span>
                        <span className="text-slate-500">
                          /{code.maxUses || '∞'}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        {code.expiresAt ? (
                          <span className={cn(
                            "text-sm",
                            new Date(code.expiresAt) < new Date() 
                              ? "text-red-400" 
                              : "text-slate-300"
                          )}>
                            {new Date(code.expiresAt).toLocaleDateString('fa-IR')}
                          </span>
                        ) : (
                          <span className="text-slate-500">-</span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <Badge className={code.isActive ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'}>
                          {code.isActive ? 'فعال' : 'غیرفعال'}
                        </Badge>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center justify-center gap-1">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleToggleActive(code.id, code.isActive)}
                            className="h-8 px-2"
                          >
                            {code.isActive ? 'غیرفعال' : 'فعال'}
                          </Button>
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => handleDelete(code.id)}
                            className="h-8 w-8 text-red-400 hover:text-red-300 hover:bg-red-500/10"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Create Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg rounded-xl bg-[#0a0d12] border border-white/10 p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-white">کد تخفیف جدید</h3>
              <Button size="icon" variant="ghost" onClick={() => setShowCreateModal(false)}>
                <X className="w-4 h-4" />
              </Button>
            </div>

            <div className="space-y-4">
              <div>
                <Label className="text-slate-300">کد</Label>
                <Input
                  placeholder="مثال: WELCOME2024"
                  value={newCode.code}
                  onChange={(e) => setNewCode({...newCode, code: e.target.value.toUpperCase()})}
                  className="bg-slate-800/50 border-slate-700 mt-1 font-mono"
                />
              </div>

              <div>
                <Label className="text-slate-300">نوع</Label>
                <div className="flex gap-2 mt-1">
                  {(['credits', 'discount', 'trial'] as const).map((type) => (
                    <Button
                      key={type}
                      type="button"
                      variant={newCode.type === type ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setNewCode({...newCode, type})}
                    >
                      {getTypeLabel(type)}
                    </Button>
                  ))}
                </div>
              </div>

              {newCode.type === 'credits' && (
                <div>
                  <Label className="text-slate-300">تعداد کردیت</Label>
                  <Input
                    type="number"
                    placeholder="50"
                    value={newCode.credits}
                    onChange={(e) => setNewCode({...newCode, credits: e.target.value})}
                    className="bg-slate-800/50 border-slate-700 mt-1"
                  />
                </div>
              )}

              {newCode.type === 'discount' && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-slate-300">درصد تخفیف</Label>
                    <Input
                      type="number"
                      placeholder="10"
                      value={newCode.discountPercent}
                      onChange={(e) => setNewCode({...newCode, discountPercent: e.target.value})}
                      className="bg-slate-800/50 border-slate-700 mt-1"
                    />
                  </div>
                  <div>
                    <Label className="text-slate-300">مبلغ تخفیف ($)</Label>
                    <Input
                      type="number"
                      placeholder="5"
                      value={newCode.discountAmount}
                      onChange={(e) => setNewCode({...newCode, discountAmount: e.target.value})}
                      className="bg-slate-800/50 border-slate-700 mt-1"
                    />
                  </div>
                </div>
              )}

              {newCode.type === 'trial' && (
                <div>
                  <Label className="text-slate-300">روزهای آزمایشی</Label>
                  <Input
                    type="number"
                    placeholder="7"
                    value={newCode.trialDays}
                    onChange={(e) => setNewCode({...newCode, trialDays: e.target.value})}
                    className="bg-slate-800/50 border-slate-700 mt-1"
                  />
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-slate-300">حداکثر استفاده</Label>
                  <Input
                    type="number"
                    placeholder="بدون محدودیت"
                    value={newCode.maxUses}
                    onChange={(e) => setNewCode({...newCode, maxUses: e.target.value})}
                    className="bg-slate-800/50 border-slate-700 mt-1"
                  />
                </div>
                <div>
                  <Label className="text-slate-300">استفاده هر کاربر</Label>
                  <Input
                    type="number"
                    placeholder="1"
                    value={newCode.maxUsesPerUser}
                    onChange={(e) => setNewCode({...newCode, maxUsesPerUser: e.target.value})}
                    className="bg-slate-800/50 border-slate-700 mt-1"
                  />
                </div>
              </div>

              <div>
                <Label className="text-slate-300">تاریخ انقضا</Label>
                <Input
                  type="datetime-local"
                  value={newCode.expiresAt}
                  onChange={(e) => setNewCode({...newCode, expiresAt: e.target.value})}
                  className="bg-slate-800/50 border-slate-700 mt-1"
                />
              </div>

              <div>
                <Label className="text-slate-300">توضیحات</Label>
                <Input
                  placeholder="توضیح کوتاه..."
                  value={newCode.description}
                  onChange={(e) => setNewCode({...newCode, description: e.target.value})}
                  className="bg-slate-800/50 border-slate-700 mt-1"
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <Button variant="outline" className="flex-1" onClick={() => setShowCreateModal(false)}>
                انصراف
              </Button>
              <Button 
                className="flex-1" 
                onClick={handleCreate}
                disabled={!newCode.code || (newCode.type === 'credits' && !newCode.credits)}
              >
                ایجاد کد
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
