'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Menu, X, ChevronRight } from 'lucide-react'

const navLinks = [
  { name: 'Features', href: '#features' },
  { name: 'Pricing', href: '#pricing' },
  { name: 'Terminal', href: '/dashboard/terminal-pro' },
  { name: 'About', href: '/about' },
]

export function Navigation() {
  const [isScrolled, setIsScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <>
      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
          isScrolled
            ? 'bg-[#030508]/85 backdrop-blur-2xl border-b border-white/[0.04] shadow-[0_4px_30px_rgba(0,0,0,0.3)]'
            : 'bg-transparent'
        }`}
      >
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="relative flex h-20 items-center justify-between">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-3 group">
              <div className="relative">
                <img
                  src="/logo.jpeg"
                  alt="Deep Terminal"
                  className="h-9 w-9 rounded-xl object-cover transition-transform duration-300 group-hover:scale-105"
                />
                <div className="absolute inset-0 rounded-xl ring-1 ring-white/10" />
              </div>
              <span className="text-lg font-semibold tracking-tight">
                <span className="text-white">Deep</span>
                <span className="bg-gradient-to-r from-[#5B7CFF] to-[#00C9E4] bg-clip-text text-transparent">in</span>
              </span>
            </Link>

            {/* Desktop Nav */}
            <div className="hidden md:flex items-center gap-1">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  href={link.href}
                  className="px-4 py-2 text-[13px] text-gray-400 hover:text-white transition-colors duration-200 rounded-lg hover:bg-white/[0.03]"
                >
                  {link.name}
                </Link>
              ))}
            </div>

            {/* Auth Buttons */}
            <div className="hidden md:flex items-center gap-3">
              <Link
                href="/sign-in"
                className="px-4 py-2.5 text-[13px] text-gray-300 hover:text-white transition-all duration-200 rounded-lg hover:bg-white/[0.03]"
              >
                Sign In
              </Link>
              <Link
                href="/sign-up"
                className="group relative inline-flex items-center gap-2 overflow-hidden rounded-xl bg-gradient-to-r from-[#5B7CFF] to-[#00C9E4] px-5 py-2.5 text-sm font-semibold text-white transition-all duration-300 hover:shadow-[0_0_30px_rgba(91,124,255,0.4)] hover:scale-[1.02]"
              >
                <span className="relative z-10">Start Free</span>
                <ChevronRight className="relative z-10 h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                <div className="absolute inset-0 bg-gradient-to-r from-[#00C9E4] to-[#5B7CFF] opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
              </Link>
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="md:hidden p-2.5 text-gray-400 hover:text-white transition-colors rounded-lg hover:bg-white/[0.05]"
            >
              {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Menu */}
      <div
        className={`fixed inset-0 z-40 md:hidden transition-all duration-300 ${
          mobileOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
      >
        {/* Backdrop */}
        <div
          className="absolute inset-0 bg-[#030508]/90 backdrop-blur-xl"
          onClick={() => setMobileOpen(false)}
        />

        {/* Menu Content */}
        <div className={`absolute inset-x-0 top-20 p-6 transition-transform duration-300 ${
          mobileOpen ? 'translate-y-0' : '-translate-y-4'
        }`}>
          <div className="rounded-2xl border border-white/[0.06] bg-[#0A0F18]/95 backdrop-blur-xl p-6 shadow-[0_20px_60px_rgba(0,0,0,0.5)]">
            <div className="space-y-1">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  className="block px-4 py-3 text-base text-gray-300 hover:text-white transition-colors rounded-xl hover:bg-white/[0.03]"
                >
                  {link.name}
                </Link>
              ))}
            </div>

            <div className="mt-6 pt-6 border-t border-white/[0.06] space-y-3">
              <Link
                href="/sign-in"
                onClick={() => setMobileOpen(false)}
                className="block text-center px-4 py-3 text-base text-gray-400 hover:text-white transition-colors rounded-xl hover:bg-white/[0.03]"
              >
                Sign In
              </Link>
              <Link
                href="/sign-up"
                onClick={() => setMobileOpen(false)}
                className="block w-full text-center rounded-xl bg-gradient-to-r from-[#5B7CFF] to-[#00C9E4] px-4 py-3.5 text-sm font-semibold text-white"
              >
                Start Free — Get 70 Credits
              </Link>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
