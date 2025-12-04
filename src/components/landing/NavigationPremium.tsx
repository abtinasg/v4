'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Menu, X } from 'lucide-react'

const navLinks = [
  { name: 'Features', href: '#features' },
  { name: 'Pricing', href: '#pricing' },
  { name: 'About', href: '/about' },
]

export function NavigationPremium() {
  const [isScrolled, setIsScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <>
      <nav
        className={`
          fixed top-0 left-0 right-0 z-50
          transition-all duration-200
          ${isScrolled
            ? 'bg-[#030407]/90 backdrop-blur-xl border-b border-white/[0.06] shadow-[0_4px_24px_rgba(0,0,0,0.2)]'
            : 'bg-transparent'
          }
        `}
      >
        <div className="mx-auto max-w-6xl px-6">
          <div className="flex h-14 items-center justify-between">
            {/* Logo */}
            <Link 
              href="/" 
              className="flex items-center gap-2 group"
            >
              <img src="/logo.jpeg" alt="Deepin" className="h-7 w-7 rounded-lg object-cover shadow-[0_2px_8px_rgba(99,102,241,0.3)]" />
              <span className="text-sm font-bold text-white tracking-tight">
                DeepIn
              </span>
            </Link>

            {/* Center Nav - Desktop */}
            <div className="hidden md:flex items-center gap-6">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  href={link.href}
                  className="text-xs font-medium text-[#94A3B8] hover:text-white transition-colors duration-200"
                >
                  {link.name}
                </Link>
              ))}
            </div>

            {/* Right Actions */}
            <div className="hidden md:flex items-center gap-2">
              <Link
                href="/sign-in"
                className="text-xs font-medium text-[#94A3B8] hover:text-white transition-colors duration-200 px-3 py-2"
              >
                Sign In
              </Link>
              <Link
                href="/sign-up"
                className="
                  text-xs font-semibold text-white
                  px-4 py-2 rounded-lg
                  bg-gradient-to-r from-[#6366F1] to-[#818CF8]
                  hover:shadow-[0_0_20px_rgba(99,102,241,0.35)]
                  transition-all duration-200
                "
              >
                Get Started
              </Link>
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="md:hidden p-2 text-[#94A3B8] hover:text-white transition-colors"
            >
              {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div className="fixed inset-x-0 top-16 z-40 bg-[#030407]/95 backdrop-blur-2xl border-b border-white/[0.04] md:hidden">
          <div className="px-6 py-8 space-y-6">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className="block text-base text-[#94A3B8] hover:text-white transition-colors"
              >
                {link.name}
              </Link>
            ))}
            <div className="pt-6 border-t border-white/[0.04] space-y-4">
              <Link
                href="/sign-in"
                onClick={() => setMobileOpen(false)}
                className="block text-base text-[#94A3B8] hover:text-white transition-colors"
              >
                Sign In
              </Link>
              <Link
                href="/sign-up"
                onClick={() => setMobileOpen(false)}
                className="
                  block w-full text-center 
                  rounded-lg bg-[#6366F1] 
                  px-4 py-3 
                  text-sm font-medium text-white
                "
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
