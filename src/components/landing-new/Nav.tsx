'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Menu, X, ChevronDown } from 'lucide-react'

const navLinks = [
  { name: 'Product', href: '#product' },
  { name: 'Workflows', href: '#workflows' },
  { name: 'Pricing', href: '#pricing' },
  { name: 'Contact', href: '#contact' },
]

export function Nav() {
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled
            ? 'bg-[#09090B]/80 backdrop-blur-xl border-b border-white/[0.06]'
            : 'bg-transparent'
        }`}
      >
        <nav className="mx-auto max-w-6xl px-6">
          <div className="flex h-16 items-center justify-between">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2.5">
              <img
                src="/logo.jpeg"
                alt="Deepin"
                className="h-8 w-8 rounded-lg object-cover"
              />
              <span className="text-[17px] font-semibold text-white tracking-tight">
                Deepin
              </span>
            </Link>

            {/* Desktop Nav */}
            <div className="hidden md:flex items-center gap-1">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  href={link.href}
                  className="px-4 py-2 text-[14px] text-zinc-400 hover:text-white transition-colors rounded-lg"
                >
                  {link.name}
                </Link>
              ))}
            </div>

            {/* Right Actions */}
            <div className="hidden md:flex items-center gap-3">
              <Link
                href="/sign-in"
                className="px-4 py-2 text-[14px] text-zinc-400 hover:text-white transition-colors"
              >
                Sign in
              </Link>
              <Link
                href="/sign-up"
                className="px-5 py-2.5 text-[14px] font-medium text-white bg-white/10 hover:bg-white/15 border border-white/10 rounded-full transition-all"
              >
                Get started
              </Link>
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="md:hidden p-2 text-zinc-400 hover:text-white"
            >
              {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </nav>
      </header>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div className="fixed inset-0 z-40 md:hidden">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setMobileOpen(false)} />
          <div className="absolute top-16 inset-x-4 bg-[#18181B] border border-white/10 rounded-2xl p-4 shadow-2xl">
            <div className="space-y-1">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  className="block px-4 py-3 text-[15px] text-zinc-300 hover:text-white rounded-xl hover:bg-white/5"
                >
                  {link.name}
                </Link>
              ))}
            </div>
            <div className="mt-4 pt-4 border-t border-white/10 space-y-2">
              <Link
                href="/sign-in"
                className="block text-center px-4 py-3 text-[15px] text-zinc-400"
              >
                Sign in
              </Link>
              <Link
                href="/sign-up"
                className="block text-center px-4 py-3 text-[15px] font-medium text-white bg-white/10 rounded-xl"
              >
                Get started
              </Link>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
