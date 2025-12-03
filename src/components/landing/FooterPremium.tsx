'use client'

import Link from 'next/link'
import { Twitter, Github, Linkedin } from 'lucide-react'

const footerLinks = {
  Product: [
    { name: 'Features', href: '#features' },
    { name: 'Pricing', href: '#pricing' },
    { name: 'Terminal', href: '/dashboard/terminal-pro' },
  ],
  Resources: [
    { name: 'Documentation', href: '/docs' },
    { name: 'Blog', href: '/blog' },
  ],
  Company: [
    { name: 'About', href: '/about' },
    { name: 'Contact', href: '/contact' },
  ],
  Legal: [
    { name: 'Privacy', href: '/privacy' },
    { name: 'Terms', href: '/terms' },
  ],
}

const socialLinks = [
  { name: 'Twitter', icon: Twitter, href: 'https://twitter.com' },
  { name: 'GitHub', icon: Github, href: 'https://github.com' },
  { name: 'LinkedIn', icon: Linkedin, href: 'https://linkedin.com' },
]

export function FooterPremium() {
  return (
    <footer className="relative bg-[#030407]">
      {/* Top border */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/[0.06] to-transparent" />
      
      <div className="mx-auto max-w-5xl px-6 py-12">
        <div className="grid grid-cols-2 md:grid-cols-6 gap-8 lg:gap-10">
          {/* Brand */}
          <div className="col-span-2">
            <Link href="/" className="flex items-center gap-2 mb-4">
              <div className="h-7 w-7 rounded-lg bg-gradient-to-br from-[#6366F1] to-[#818CF8] flex items-center justify-center shadow-[0_2px_8px_rgba(99,102,241,0.3)]">
                <svg 
                  className="h-3.5 w-3.5 text-white" 
                  viewBox="0 0 24 24" 
                  fill="none" 
                  stroke="currentColor" 
                  strokeWidth="2.5"
                >
                  <path d="M4 17l6-6-6-6M12 19h8" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <span className="text-sm font-bold text-white tracking-tight">
                DeepIn
              </span>
            </Link>
            <p className="text-xs text-[#475569] max-w-[180px] mb-5 leading-relaxed">
              AI-powered financial intelligence for modern investors.
            </p>
            
            {/* Social links */}
            <div className="flex items-center gap-2">
              {socialLinks.map((social) => (
                <a
                  key={social.name}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="
                    h-7 w-7 rounded-lg
                    bg-white/[0.03] border border-white/[0.06]
                    flex items-center justify-center
                    text-[#475569] hover:text-white hover:border-white/[0.10]
                    transition-all duration-200
                  "
                >
                  <social.icon className="h-3 w-3" />
                </a>
              ))}
            </div>
          </div>

          {/* Links */}
          {Object.entries(footerLinks).map(([category, links]) => (
            <div key={category}>
              <h4 className="text-[10px] font-bold text-[#94A3B8] uppercase tracking-wider mb-3">
                {category}
              </h4>
              <ul className="space-y-2">
                {links.map((link) => (
                  <li key={link.name}>
                    <Link
                      href={link.href}
                      className="text-xs text-[#475569] hover:text-[#94A3B8] transition-colors duration-200"
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-white/[0.04]">
        <div className="mx-auto max-w-5xl px-6 py-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-3">
            <p className="text-[10px] text-[#334155]">
              © {new Date().getFullYear()} DeepIn. All rights reserved.
            </p>
            <p className="text-[10px] text-[#334155]">
              Built for investors who demand more.
            </p>
          </div>
        </div>
      </div>
    </footer>
  )
}
