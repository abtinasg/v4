'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Menu, X, Terminal, ChevronDown } from 'lucide-react'

const navLinks = [
  { name: 'Features', href: '#features' },
  { name: 'Pricing', href: '/pricing' },
  { name: 'Terminal', href: '/dashboard/terminal-pro' },
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
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          isScrolled
            ? 'bg-[#05070B]/90 backdrop-blur-2xl border-b border-white/[0.05] shadow-[0_8px_32px_rgba(0,0,0,0.4)]'
            : 'bg-transparent'
        }`}
      >
        <div className="mx-auto max-w-7xl px-6">
          <div className="relative flex h-16 items-center justify-between">
            <div className="pointer-events-none absolute inset-0 rounded-full bg-white/[0.01] blur-3xl" />
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2.5 group">
              <img src="/logo.jpeg" alt="Deep" className="h-8 w-8 rounded-lg object-cover transition-transform duration-300 group-hover:scale-105" />
              <span className="text-lg font-semibold text-white">
                Deep<span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00D4FF] to-[#3B82F6]">Terminal</span>
              </span>
            </Link>

            {/* Desktop Nav */}
            <div className="hidden md:flex items-center gap-8">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  href={link.href}
                  className="text-[13px] text-gray-400 hover:text-white transition-colors duration-200 tracking-wide"
                >
                  {link.name}
                </Link>
              ))}
            </div>

            {/* Auth Buttons */}
            <div className="hidden md:flex items-center gap-3">
              <Link
                href="/sign-in"
                className="text-[13px] text-gray-300 hover:text-white transition-colors duration-200 px-3 py-2 rounded-lg border border-white/[0.05] bg-white/[0.01] backdrop-blur-xl"
              >
                Sign In
              </Link>
              <Link
                href="/sign-up"
                className="inline-flex items-center rounded-xl bg-gradient-to-r from-[#00D4FF] via-[#4C7DFF] to-[#7C4DFF] px-5 py-2.5 text-sm font-semibold text-white transition-all duration-300 hover:shadow-[0_0_30px_rgba(0,212,255,0.4)] hover:scale-[1.02]"
              >
                Get Started
              </Link>
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="md:hidden p-2 text-gray-400 hover:text-white transition-colors"
            >
              {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Menu */}
      {mobileOpen && (
          <div
            className="fixed inset-x-0 top-16 z-40 bg-[#05070B]/95 backdrop-blur-xl border-b border-white/[0.05] md:hidden"
          >
            <div className="px-6 py-6 space-y-4">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  className="block text-base text-gray-300 hover:text-white transition-colors py-2"
                >
                  {link.name}
                </Link>
              ))}
              <div className="pt-4 border-t border-white/[0.05] space-y-3">
                <Link
                  href="/sign-in"
                  onClick={() => setMobileOpen(false)}
                  className="block text-base text-gray-400 hover:text-white transition-colors py-2"
                >
                  Sign In
                </Link>
                <Link
                  href="/sign-up"
                  onClick={() => setMobileOpen(false)}
                  className="block w-full text-center rounded-lg bg-gradient-to-r from-[#00D4FF] to-[#3B82F6] px-4 py-3 text-sm font-medium text-[#05070B]"
                >
                  Get Started
                </Link>
              </div>
            </div>
          </div>
        )}
    </>
  )
}
