'use client'

import { useState, useEffect } from 'react'
import { 
  CreditCard, 
  Users, 
  TrendingUp, 
  TrendingDown,
  Plus,
  Minus,
  RefreshCw,
  Search,
  Package,
  DollarSign,
  Activity,
  Edit,
  Trash2,
  Check,
  X
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface CreditOverview {
  totalCreditsInSystem: number
  lifetimeCreditsIssued: number
  usersWithCredits: number
  todayUsage: number
}

interface UserCredit {
  userId: string
  email: string
  balance: string
  lifetimeCredits: string
  subscriptionTier: string
}

interface CreditPackage {
  id: string
  name: string
  credits: string
  bonusCredits: string
  price: string
  isActive: boolean
  isPopular: boolean
}

export default function CreditsPage() {
  const [overview, setOverview] = useState<CreditOverview | null>(null)
  const [users, setUsers] = useState<UserCredit[]>([])
  const [packages, setPackages] = useState<CreditPackage[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedUser, setSelectedUser] = useState<UserCredit | null>(null)
  const [adjustAmount, setAdjustAmount] = useState('')
  const [adjustReason, setAdjustReason] = useState('')
  const [showAdjustModal, setShowAdjustModal] = useState(false)
  const [showPackageModal, setShowPackageModal] = useState(false)
  const [editingPackage, setEditingPackage] = useState<CreditPackage | null>(null)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    setLoading(true)
    try {
      // Fetch overview
      const overviewRes = await fetch('/api/admin/credits?action=overview')
      const overviewData = await overviewRes.json()
      setOverview(overviewData.overview)
      setPackages(overviewData.packages || [])

      // Fetch users
      const usersRes = await fetch('/api/admin/credits?action=users')
      const usersData = await usersRes.json()
      setUsers(usersData.users || [])
    } catch (error) {
      console.error('Failed to fetch credits data:', error)
    }
    setLoading(false)
  }

  const handleAdjustCredits = async () => {
    if (!selectedUser || !adjustAmount) return

    try {
      const res = await fetch('/api/admin/credits', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'adjust_credits',
          userId: selectedUser.userId,
          amount: Number(adjustAmount),
          description: adjustReason,
        }),
      })

      if (res.ok) {
        fetchData()
        setShowAdjustModal(false)
        setSelectedUser(null)
        setAdjustAmount('')
        setAdjustReason('')
      }
    } catch (error) {
      console.error('Failed to adjust credits:', error)
    }
  }

  const handleSavePackage = async () => {
    if (!editingPackage) return

    try {
      const res = await fetch('/api/admin/credits', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: editingPackage.id ? 'update_package' : 'create_package',
          ...editingPackage,
        }),
      })

      if (res.ok) {
        fetchData()
        setShowPackageModal(false)
        setEditingPackage(null)
      }
    } catch (error) {
      console.error('Failed to save package:', error)
    }
  }

  const handleDeletePackage = async (id: string) => {
    if (!confirm('Delete this package?')) return

    try {
      await fetch(`/api/admin/credits?packageId=${id}`, { method: 'DELETE' })
      fetchData()
    } catch (error) {
      console.error('Failed to delete package:', error)
    }
  }

  const filteredUsers = users.filter(u => 
    u.email?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="w-6 h-6 animate-spin text-cyan-400" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Credit Management</h1>
          <p className="text-gray-400 text-sm mt-1">Manage user credits and packages</p>
        </div>
        <Button onClick={fetchData} variant="outline" size="sm">
          <RefreshCw className="w-4 h-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-gradient-to-br from-cyan-500/10 to-blue-500/10 border border-cyan-500/20">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-cyan-500/20">
              <CreditCard className="w-5 h-5 text-cyan-400" />
            </div>
            <div>
              <p className="text-xs text-gray-400">Total Credits</p>
              <p className="text-xl font-bold text-white">
                {overview?.totalCreditsInSystem.toLocaleString() || 0}
              </p>
            </div>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-gradient-to-br from-green-500/10 to-emerald-500/10 border border-green-500/20">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-green-500/20">
              <TrendingUp className="w-5 h-5 text-green-400" />
            </div>
            <div>
              <p className="text-xs text-gray-400">Lifetime Issued</p>
              <p className="text-xl font-bold text-white">
                {overview?.lifetimeCreditsIssued.toLocaleString() || 0}
              </p>
            </div>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-gradient-to-br from-violet-500/10 to-purple-500/10 border border-violet-500/20">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-violet-500/20">
              <Users className="w-5 h-5 text-violet-400" />
            </div>
            <div>
              <p className="text-xs text-gray-400">Users with Credits</p>
              <p className="text-xl font-bold text-white">
                {overview?.usersWithCredits || 0}
              </p>
            </div>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-gradient-to-br from-orange-500/10 to-red-500/10 border border-orange-500/20">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-orange-500/20">
              <Activity className="w-5 h-5 text-orange-400" />
            </div>
            <div>
              <p className="text-xs text-gray-400">Today's Usage</p>
              <p className="text-xl font-bold text-white">
                {overview?.todayUsage.toLocaleString() || 0}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Credit Packages */}
      <div className="rounded-xl border border-white/10 bg-white/[0.02] overflow-hidden">
        <div className="p-4 border-b border-white/10 flex items-center justify-between">
          <h2 className="font-semibold text-white flex items-center gap-2">
            <Package className="w-5 h-5 text-cyan-400" />
            Credit Packages
          </h2>
          <Button 
            size="sm" 
            onClick={() => {
              setEditingPackage({
                id: '',
                name: '',
                credits: '100',
                bonusCredits: '0',
                price: '9.99',
                isActive: true,
                isPopular: false,
              })
              setShowPackageModal(true)
            }}
          >
            <Plus className="w-4 h-4 mr-1" />
            Add Package
          </Button>
        </div>
        <div className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {packages.map((pkg) => (
              <div 
                key={pkg.id} 
                className={cn(
                  "p-4 rounded-lg border transition-all",
                  pkg.isPopular 
                    ? "border-cyan-500/50 bg-cyan-500/5" 
                    : "border-white/10 bg-white/[0.02]",
                  !pkg.isActive && "opacity-50"
                )}
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="font-medium text-white">{pkg.name}</h3>
                    {pkg.isPopular && (
                      <span className="text-xs text-cyan-400">Popular</span>
                    )}
                  </div>
                  <div className="flex gap-1">
                    <button 
                      onClick={() => {
                        setEditingPackage(pkg)
                        setShowPackageModal(true)
                      }}
                      className="p-1 hover:bg-white/10 rounded"
                    >
                      <Edit className="w-4 h-4 text-gray-400" />
                    </button>
                    <button 
                      onClick={() => handleDeletePackage(pkg.id)}
                      className="p-1 hover:bg-red-500/20 rounded"
                    >
                      <Trash2 className="w-4 h-4 text-red-400" />
                    </button>
                  </div>
                </div>
                <div className="space-y-1 text-sm">
                  <p className="text-gray-400">
                    Credits: <span className="text-white">{Number(pkg.credits).toLocaleString()}</span>
                    {Number(pkg.bonusCredits) > 0 && (
                      <span className="text-green-400"> +{pkg.bonusCredits} bonus</span>
                    )}
                  </p>
                  <p className="text-gray-400">
                    Price: <span className="text-white font-medium">${pkg.price}</span>
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* User Credits */}
      <div className="rounded-xl border border-white/10 bg-white/[0.02] overflow-hidden">
        <div className="p-4 border-b border-white/10">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-white flex items-center gap-2">
              <Users className="w-5 h-5 text-cyan-400" />
              User Credits
            </h2>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
              <input
                type="text"
                placeholder="Search by email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 pr-4 py-2 rounded-lg bg-white/5 border border-white/10 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500/50"
              />
            </div>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/10">
                <th className="text-left p-4 text-xs font-medium text-gray-500 uppercase">User</th>
                <th className="text-left p-4 text-xs font-medium text-gray-500 uppercase">Tier</th>
                <th className="text-right p-4 text-xs font-medium text-gray-500 uppercase">Balance</th>
                <th className="text-right p-4 text-xs font-medium text-gray-500 uppercase">Lifetime</th>
                <th className="text-center p-4 text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((user) => (
                <tr key={user.userId} className="border-b border-white/5 hover:bg-white/[0.02]">
                  <td className="p-4">
                    <p className="text-sm text-white truncate max-w-[200px]">{user.email}</p>
                    <p className="text-xs text-gray-500">{user.userId.slice(0, 8)}...</p>
                  </td>
                  <td className="p-4">
                    <span className={cn(
                      "px-2 py-1 rounded text-xs font-medium",
                      user.subscriptionTier === 'professional' && "bg-violet-500/20 text-violet-400",
                      user.subscriptionTier === 'premium' && "bg-cyan-500/20 text-cyan-400",
                      user.subscriptionTier === 'free' && "bg-gray-500/20 text-gray-400",
                    )}>
                      {user.subscriptionTier}
                    </span>
                  </td>
                  <td className="p-4 text-right">
                    <span className="text-white font-medium">
                      {Number(user.balance).toLocaleString()}
                    </span>
                  </td>
                  <td className="p-4 text-right">
                    <span className="text-gray-400">
                      {Number(user.lifetimeCredits).toLocaleString()}
                    </span>
                  </td>
                  <td className="p-4 text-center">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setSelectedUser(user)
                        setShowAdjustModal(true)
                      }}
                    >
                      <DollarSign className="w-4 h-4 mr-1" />
                      Adjust
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Adjust Credits Modal */}
      {showAdjustModal && selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-xl bg-[#0a0d12] border border-white/10 p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Adjust Credits</h3>
            <p className="text-sm text-gray-400 mb-4">
              User: {selectedUser.email}<br />
              Current Balance: {Number(selectedUser.balance).toLocaleString()}
            </p>
            
            <div className="space-y-4">
              <div>
                <label className="text-sm text-gray-400 block mb-1">Amount</label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    value={adjustAmount}
                    onChange={(e) => setAdjustAmount(e.target.value)}
                    placeholder="Enter amount (positive or negative)"
                    className="flex-1 px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white focus:outline-none focus:border-cyan-500/50"
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">Use negative value to deduct credits</p>
              </div>
              
              <div>
                <label className="text-sm text-gray-400 block mb-1">Reason (optional)</label>
                <input
                  type="text"
                  value={adjustReason}
                  onChange={(e) => setAdjustReason(e.target.value)}
                  placeholder="e.g., Bonus, Refund, Correction"
                  className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white focus:outline-none focus:border-cyan-500/50"
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <Button 
                variant="outline" 
                className="flex-1"
                onClick={() => {
                  setShowAdjustModal(false)
                  setSelectedUser(null)
                  setAdjustAmount('')
                  setAdjustReason('')
                }}
              >
                Cancel
              </Button>
              <Button 
                className="flex-1"
                onClick={handleAdjustCredits}
                disabled={!adjustAmount}
              >
                Adjust
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Package Modal */}
      {showPackageModal && editingPackage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-xl bg-[#0a0d12] border border-white/10 p-6">
            <h3 className="text-lg font-semibold text-white mb-4">
              {editingPackage.id ? 'Edit Package' : 'Create Package'}
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="text-sm text-gray-400 block mb-1">Name</label>
                <input
                  type="text"
                  value={editingPackage.name}
                  onChange={(e) => setEditingPackage({...editingPackage, name: e.target.value})}
                  className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white focus:outline-none focus:border-cyan-500/50"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-gray-400 block mb-1">Credits</label>
                  <input
                    type="number"
                    value={editingPackage.credits}
                    onChange={(e) => setEditingPackage({...editingPackage, credits: e.target.value})}
                    className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white focus:outline-none focus:border-cyan-500/50"
                  />
                </div>
                <div>
                  <label className="text-sm text-gray-400 block mb-1">Bonus</label>
                  <input
                    type="number"
                    value={editingPackage.bonusCredits}
                    onChange={(e) => setEditingPackage({...editingPackage, bonusCredits: e.target.value})}
                    className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white focus:outline-none focus:border-cyan-500/50"
                  />
                </div>
              </div>
              
              <div>
                <label className="text-sm text-gray-400 block mb-1">Price ($)</label>
                <input
                  type="number"
                  step="0.01"
                  value={editingPackage.price}
                  onChange={(e) => setEditingPackage({...editingPackage, price: e.target.value})}
                  className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white focus:outline-none focus:border-cyan-500/50"
                />
              </div>
              
              <div className="flex items-center gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={editingPackage.isActive}
                    onChange={(e) => setEditingPackage({...editingPackage, isActive: e.target.checked})}
                    className="rounded border-white/20"
                  />
                  <span className="text-sm text-gray-400">Active</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={editingPackage.isPopular}
                    onChange={(e) => setEditingPackage({...editingPackage, isPopular: e.target.checked})}
                    className="rounded border-white/20"
                  />
                  <span className="text-sm text-gray-400">Popular</span>
                </label>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <Button 
                variant="outline" 
                className="flex-1"
                onClick={() => {
                  setShowPackageModal(false)
                  setEditingPackage(null)
                }}
              >
                Cancel
              </Button>
              <Button 
                className="flex-1"
                onClick={handleSavePackage}
                disabled={!editingPackage.name}
              >
                Save
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
