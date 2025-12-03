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
          transition-all duration-300
          ${isScrolled
            ? 'bg-[#030407]/80 backdrop-blur-2xl border-b border-white/[0.04]'
            : 'bg-transparent'
          }
        `}
      >
        <div className="mx-auto max-w-6xl px-6">
          <div className="flex h-16 items-center justify-between">
            {/* Logo */}
            <Link 
              href="/" 
              className="flex items-center gap-2 group"
            >
              <div className="relative">
                <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-[#6366F1] to-[#8B5CF6] flex items-center justify-center">
                  <svg 
                    className="h-4 w-4 text-white" 
                    viewBox="0 0 24 24" 
                    fill="none" 
                    stroke="currentColor" 
                    strokeWidth="2.5"
                  >
                    <path d="M4 17l6-6-6-6M12 19h8" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
              </div>
              <span className="text-[15px] font-semibold text-white tracking-tight">
                DeepIn
              </span>
            </Link>

            {/* Center Nav - Desktop */}
            <div className="hidden md:flex items-center gap-8">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  href={link.href}
                  className="text-[13px] text-[#94A3B8] hover:text-white transition-colors duration-200"
                >
                  {link.name}
                </Link>
              ))}
            </div>

            {/* Right Actions */}
            <div className="hidden md:flex items-center gap-3">
              <Link
                href="/sign-in"
                className="text-[13px] text-[#94A3B8] hover:text-white transition-colors duration-200 px-4 py-2"
              >
                Sign In
              </Link>
              <Link
                href="/sign-up"
                className="
                  text-[13px] font-medium text-white
                  px-4 py-2 rounded-lg
                  bg-[#6366F1]
                  hover:bg-[#5457E5]
                  transition-all duration-200
                  hover:shadow-[0_0_20px_rgba(99,102,241,0.25)]
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
