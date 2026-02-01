'use client'

import Link from 'next/link'
import { Twitter, Github, Linkedin } from 'lucide-react'

const links = {
  Product: [
    { name: 'Features', href: '#product' },
    { name: 'Metrics', href: '#metrics' },
    { name: 'Pricing', href: '#pricing' },
    { name: 'API', href: '/api-docs' },
  ],
  Company: [
    { name: 'About', href: '/about' },
    { name: 'Blog', href: '/blog' },
    { name: 'Careers', href: '/careers' },
    { name: 'Contact', href: '#contact' },
  ],
  Legal: [
    { name: 'Privacy', href: '/privacy' },
    { name: 'Terms', href: '/terms' },
    { name: 'Disclaimer', href: '/disclaimer' },
  ],
}

const socials = [
  { name: 'Twitter', icon: Twitter, href: 'https://twitter.com' },
  { name: 'GitHub', icon: Github, href: 'https://github.com' },
  { name: 'LinkedIn', icon: Linkedin, href: 'https://linkedin.com' },
]

export function Footer() {
  return (
    <footer className="relative bg-[#0D0F12] border-t border-white/[0.06]">
      <div className="mx-auto max-w-6xl px-6 py-14">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8">
          {/* Brand */}
          <div className="col-span-2">
            <Link href="/" className="flex items-center gap-2.5 mb-4">
              <img
                src="/logo.jpeg"
                alt="Deepin"
                className="h-8 w-8 rounded-lg object-cover"
              />
              <span className="text-[17px] font-semibold text-white">
                Deepin<span className="text-white/50 font-normal ml-0.5">Finance</span>
              </span>
            </Link>
            <p className="text-sm text-white/40 max-w-xs mb-6">
              Institutional-grade analysis for individual investors. Structured workflows, clear assumptions.
            </p>
            <div className="flex items-center gap-2">
              {socials.map((social) => (
                <a
                  key={social.name}
                  href={social.href}
                  className="h-9 w-9 rounded-lg bg-white/5 flex items-center justify-center text-white/40 hover:text-white hover:bg-white/10 transition-all"
                >
                  <social.icon className="h-4 w-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Links */}
          {Object.entries(links).map(([category, items]) => (
            <div key={category}>
              <h4 className="text-[11px] font-medium uppercase tracking-wider text-white/40 mb-4">
                {category}
              </h4>
              <ul className="space-y-2.5">
                {items.map((item) => (
                  <li key={item.name}>
                    <Link
                      href={item.href}
                      className="text-sm text-white/50 hover:text-white transition-colors"
                    >
                      {item.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom */}
        <div className="mt-14 pt-6 border-t border-white/[0.06] flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-sm text-white/30">
            © {new Date().getFullYear()} Deepin Finance. All rights reserved.
          </p>
          <p className="text-xs text-white/25">
            Market data from trusted sources. Not financial advice.
          </p>
        </div>
      </div>
    </footer>
  )
}
