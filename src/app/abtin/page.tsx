'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Lock, Brain } from 'lucide-react'
import DashboardSidebar from '@/components/abtin/DashboardSidebar'
import OverviewDashboard from '@/components/abtin/OverviewDashboard'

interface User {
  id: string
  username: string
  email?: string
  fullName?: string
}

export default function AbtinPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [user, setUser] = useState<User | null>(null)
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [authError, setAuthError] = useState('')
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    verifySession()
  }, [])

  const verifySession = async () => {
    try {
      const response = await fetch('/api/abtin/auth/verify')
      if (response.ok) {
        const data = await response.json()
        setUser(data.user)
        setIsAuthenticated(true)
      }
    } catch (error) {
      console.error('Session verification failed:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setAuthError('')
    
    try {
      const response = await fetch('/api/abtin/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      })
      
      if (response.status === 401) {
        const data = await response.json()
        setAuthError(data.error || 'Invalid username or password')
      } else if (response.ok) {
        const data = await response.json()
        setUser(data.user)
        setIsAuthenticated(true)
      } else {
        setAuthError('Authentication failed. Please try again.')
      }
    } catch (error) {
      console.error('Login error:', error)
      setAuthError('Authentication failed. Please try again.')
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0c0e14] flex items-center justify-center">
        <div className="animate-pulse flex items-center gap-3">
          <div className="w-3 h-3 bg-cyan-500 rounded-full animate-bounce" />
          <div className="w-3 h-3 bg-purple-500 rounded-full animate-bounce [animation-delay:0.1s]" />
          <div className="w-3 h-3 bg-pink-500 rounded-full animate-bounce [animation-delay:0.2s]" />
        </div>
      </div>
    )
  }

  // Login form
  if (!isAuthenticated || !user) {
    return (
      <div className="min-h-screen bg-[#0c0e14] flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md"
        >
          <div className="bg-white/[0.02] backdrop-blur-sm border border-white/[0.05] rounded-2xl p-8 shadow-[0_8px_32px_rgba(0,0,0,0.12)]">
            <div className="flex items-center justify-center mb-6">
              <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-violet-500/20 to-cyan-500/20 flex items-center justify-center">
                <Brain className="w-8 h-8 text-white/70" />
              </div>
            </div>
            
            <h1 className="text-2xl font-semibold text-white text-center mb-2">
              Abtin Personal Dashboard
            </h1>
            <p className="text-white/40 text-sm text-center mb-6">
              Enter your credentials to access your personal dashboard
            </p>

            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-sm text-white/60 mb-2">Username</label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full px-4 py-2.5 bg-white/[0.03] border border-white/[0.08] rounded-xl text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-violet-500/50"
                  placeholder="Enter username"
                  required
                  autoComplete="username"
                />
              </div>
              
              <div>
                <label className="block text-sm text-white/60 mb-2">Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-2.5 bg-white/[0.03] border border-white/[0.08] rounded-xl text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-violet-500/50"
                  placeholder="Enter password"
                  required
                  autoComplete="current-password"
                />
              </div>

              {authError && (
                <div className="text-red-400 text-sm bg-red-500/10 border border-red-500/20 rounded-lg p-3">
                  {authError}
                </div>
              )}

              <button
                type="submit"
                className="w-full py-2.5 bg-gradient-to-r from-violet-500 to-cyan-500 text-white rounded-xl font-medium hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
              >
                <Lock className="w-4 h-4" />
                Login
              </button>
            </form>
          </div>
        </motion.div>
      </div>
    )
  }

  // Main dashboard
  return (
    <div className="min-h-screen bg-[#0c0e14] flex">
      <DashboardSidebar user={user} />
      
      <main className="flex-1 overflow-y-auto">
        <div className="max-w-7xl mx-auto p-6 md:p-8">
          <OverviewDashboard />
        </div>
      </main>
    </div>
  )
}
