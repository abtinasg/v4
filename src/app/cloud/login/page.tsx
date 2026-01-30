'use client'

import { useState } from 'react'
import Link from 'next/link'
import { 
  Cloud, 
  FileText, 
  Users, 
  BookOpen, 
  Sparkles, 
  ArrowRight,
  Mail,
  Lock,
  Eye,
  EyeOff,
  Github,
  ChevronRight,
  Zap,
  Shield,
  FolderSync
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

export default function CloudLoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    // Simulate login
    await new Promise(resolve => setTimeout(resolve, 1500))
    setIsLoading(false)
  }

  const features = [
    {
      icon: FileText,
      title: 'Collaborative Writing',
      description: 'Real-time co-authoring with version control for academic papers'
    },
    {
      icon: Users,
      title: 'Team of 3-4',
      description: 'Perfect workspace designed for small research teams'
    },
    {
      icon: BookOpen,
      title: 'Research Library',
      description: 'Organize references, citations, and literature reviews'
    },
    {
      icon: FolderSync,
      title: 'Cloud Sync',
      description: 'Access your work from anywhere, always up to date'
    }
  ]

  const teamMembers = [
    { name: 'Dr. Sarah Chen', role: 'Lead Researcher', avatar: 'SC' },
    { name: 'James Miller', role: 'PhD Candidate', avatar: 'JM' },
    { name: 'Emma Wilson', role: 'Research Assistant', avatar: 'EW' },
    { name: 'Alex Kumar', role: 'Data Analyst', avatar: 'AK' },
  ]

  return (
    <div className="min-h-screen bg-white flex">
      {/* Left Panel - Branding & Features */}
      <div className="hidden lg:flex lg:w-1/2 xl:w-[55%] bg-gradient-to-br from-slate-50 via-white to-blue-50 relative overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute top-0 left-0 w-full h-full">
          <div className="absolute top-20 left-20 w-72 h-72 bg-blue-100/40 rounded-full blur-3xl" />
          <div className="absolute bottom-20 right-20 w-96 h-96 bg-indigo-100/30 rounded-full blur-3xl" />
          <div className="absolute top-1/2 left-1/3 w-64 h-64 bg-sky-100/30 rounded-full blur-3xl" />
        </div>

        {/* Grid pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#f0f0f0_1px,transparent_1px),linear-gradient(to_bottom,#f0f0f0_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_110%)]" />

        <div className="relative z-10 flex flex-col justify-between p-12 xl:p-16 w-full">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-600/20">
              <Cloud className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-900">ResearchCloud</h1>
              <p className="text-sm text-slate-500">For Academic Teams</p>
            </div>
          </div>

          {/* Main Content */}
          <div className="space-y-10 my-auto">
            <div className="space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-blue-50 border border-blue-100 rounded-full text-blue-700 text-sm font-medium">
                <Sparkles className="w-4 h-4" />
                Built for Research Teams
              </div>
              <h2 className="text-4xl xl:text-5xl font-bold text-slate-900 leading-tight">
                Where Research
                <br />
                <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                  Comes Together
                </span>
              </h2>
              <p className="text-lg text-slate-600 max-w-md">
                A collaborative workspace designed for small research teams writing academic papers, 
                managing citations, and pushing boundaries of knowledge.
              </p>
            </div>

            {/* Features Grid */}
            <div className="grid grid-cols-2 gap-4">
              {features.map((feature, index) => (
                <div
                  key={index}
                  className="group p-5 bg-white/80 backdrop-blur-sm border border-slate-100 rounded-2xl hover:shadow-lg hover:shadow-slate-100/50 transition-all duration-300 hover:-translate-y-0.5"
                >
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl flex items-center justify-center mb-3 group-hover:from-blue-100 group-hover:to-indigo-100 transition-colors">
                    <feature.icon className="w-5 h-5 text-blue-600" />
                  </div>
                  <h3 className="font-semibold text-slate-900 mb-1">{feature.title}</h3>
                  <p className="text-sm text-slate-500">{feature.description}</p>
                </div>
              ))}
            </div>

            {/* Team Preview */}
            <div className="p-6 bg-white/80 backdrop-blur-sm border border-slate-100 rounded-2xl">
              <div className="flex items-center justify-between mb-4">
                <span className="text-sm font-medium text-slate-900">Active Team Members</span>
                <span className="text-xs text-slate-500 bg-green-50 text-green-700 px-2 py-1 rounded-full">
                  4 online
                </span>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex -space-x-3">
                  {teamMembers.map((member, index) => (
                    <div
                      key={index}
                      className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-xs font-semibold border-2 border-white shadow-sm"
                      title={`${member.name} - ${member.role}`}
                    >
                      {member.avatar}
                    </div>
                  ))}
                </div>
                <div className="text-sm text-slate-600">
                  <span className="font-medium text-slate-900">Your team</span> is waiting
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center gap-6 text-sm text-slate-500">
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4" />
              <span>Enterprise Security</span>
            </div>
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4" />
              <span>99.9% Uptime</span>
            </div>
          </div>
        </div>
      </div>

      {/* Right Panel - Login Form */}
      <div className="w-full lg:w-1/2 xl:w-[45%] flex items-center justify-center p-8 lg:p-12">
        <div className="w-full max-w-md space-y-8">
          {/* Mobile Logo */}
          <div className="lg:hidden flex items-center justify-center gap-3 mb-8">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center">
              <Cloud className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-900">ResearchCloud</h1>
              <p className="text-sm text-slate-500">For Academic Teams</p>
            </div>
          </div>

          {/* Header */}
          <div className="text-center lg:text-left">
            <h2 className="text-3xl font-bold text-slate-900">Welcome back</h2>
            <p className="mt-2 text-slate-600">
              Sign in to continue to your research workspace
            </p>
          </div>

          {/* Social Login */}
          <div className="space-y-3">
            <Button
              variant="outline"
              className="w-full h-12 bg-white hover:bg-slate-50 border-slate-200 text-slate-700 font-medium rounded-xl"
            >
              <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24">
                <path
                  fill="currentColor"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              Continue with Google
            </Button>

            <Button
              variant="outline"
              className="w-full h-12 bg-white hover:bg-slate-50 border-slate-200 text-slate-700 font-medium rounded-xl"
            >
              <Github className="w-5 h-5 mr-3" />
              Continue with GitHub
            </Button>
          </div>

          {/* Divider */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-200" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-white text-slate-500">or continue with email</span>
            </div>
          </div>

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <label htmlFor="email" className="block text-sm font-medium text-slate-700">
                Email address
              </label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <Input
                  id="email"
                  type="email"
                  placeholder="you@university.edu"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="h-12 pl-12 bg-white border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-slate-900 placeholder:text-slate-400"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label htmlFor="password" className="block text-sm font-medium text-slate-700">
                  Password
                </label>
                <Link
                  href="/cloud/forgot-password"
                  className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                >
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="h-12 pl-12 pr-12 bg-white border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-slate-900 placeholder:text-slate-400"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full h-12 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold rounded-xl shadow-lg shadow-blue-600/25 transition-all duration-300 hover:shadow-xl hover:shadow-blue-600/30"
            >
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Signing in...
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  Sign in to Workspace
                  <ArrowRight className="w-5 h-5" />
                </div>
              )}
            </Button>
          </form>

          {/* Sign Up Link */}
          <div className="text-center">
            <p className="text-slate-600">
              New to ResearchCloud?{' '}
              <Link
                href="/cloud/signup"
                className="text-blue-600 hover:text-blue-700 font-semibold inline-flex items-center gap-1"
              >
                Create team workspace
                <ChevronRight className="w-4 h-4" />
              </Link>
            </p>
          </div>

          {/* Trust Badges */}
          <div className="pt-6 border-t border-slate-100">
            <p className="text-xs text-center text-slate-500 mb-4">Trusted by research teams at</p>
            <div className="flex items-center justify-center gap-8 opacity-60">
              <div className="text-slate-400 font-semibold text-sm">MIT</div>
              <div className="text-slate-400 font-semibold text-sm">Stanford</div>
              <div className="text-slate-400 font-semibold text-sm">Oxford</div>
              <div className="text-slate-400 font-semibold text-sm">ETH</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
