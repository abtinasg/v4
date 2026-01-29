'use client'

import Link from 'next/link'
import { useState } from 'react'

export function CloudNav() {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <nav className="fixed top-0 w-full bg-[#09090B]/80 backdrop-blur-xl border-b border-white/10 z-50">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <Link href="/cloud" className="flex items-center space-x-2">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z" />
              </svg>
            </div>
            <span className="text-xl font-bold">Cloud Platform</span>
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-8">
            <Link href="#features" className="text-gray-300 hover:text-white transition-colors">
              امکانات
            </Link>
            <Link href="#pricing" className="text-gray-300 hover:text-white transition-colors">
              قیمت‌گذاری
            </Link>
            <Link href="#docs" className="text-gray-300 hover:text-white transition-colors">
              مستندات
            </Link>
            <Link href="/dashboard" className="text-gray-300 hover:text-white transition-colors">
              داشبورد
            </Link>
            <Link 
              href="#get-started" 
              className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-6 py-2 rounded-lg hover:opacity-90 transition-opacity"
            >
              شروع کنید
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button 
            className="md:hidden"
            onClick={() => setIsOpen(!isOpen)}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>

        {/* Mobile Menu */}
        {isOpen && (
          <div className="md:hidden mt-4 pb-4 space-y-4">
            <Link href="#features" className="block text-gray-300 hover:text-white transition-colors">
              امکانات
            </Link>
            <Link href="#pricing" className="block text-gray-300 hover:text-white transition-colors">
              قیمت‌گذاری
            </Link>
            <Link href="#docs" className="block text-gray-300 hover:text-white transition-colors">
              مستندات
            </Link>
            <Link href="/dashboard" className="block text-gray-300 hover:text-white transition-colors">
              داشبورد
            </Link>
            <Link 
              href="#get-started" 
              className="block bg-gradient-to-r from-blue-500 to-purple-600 text-white px-6 py-2 rounded-lg hover:opacity-90 transition-opacity text-center"
            >
              شروع کنید
            </Link>
          </div>
        )}
      </div>
    </nav>
  )
}
