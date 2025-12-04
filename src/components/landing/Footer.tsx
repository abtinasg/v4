'use client'

import Link from 'next/link'
import { Terminal, Twitter, Github, Linkedin } from 'lucide-react'

const footerLinks = {
  Product: [
    { name: 'Features', href: '#features' },
    { name: 'Pricing', href: '/pricing' },
    { name: 'Terminal Pro', href: '/dashboard/terminal-pro' },
    { name: 'AI Assistant', href: '/dashboard/ai-assistant' },
  ],
  Resources: [
    { name: 'Documentation', href: '/docs' },
    { name: 'API Reference', href: '/api' },
    { name: 'Blog', href: '/blog' },
    { name: 'Changelog', href: '/changelog' },
  ],
  Company: [
    { name: 'About', href: '/about' },
    { name: 'Careers', href: '/careers' },
    { name: 'Contact', href: '/contact' },
    { name: 'Press', href: '/press' },
  ],
  Legal: [
    { name: 'Privacy Policy', href: '/privacy' },
    { name: 'Terms of Service', href: '/terms' },
    { name: 'Cookie Policy', href: '/cookie-policy' },
    { name: 'Disclaimer', href: '/disclaimer' },
    { name: 'Data Processing Agreement', href: '/data-processing-agreement' },
  ],
}

const socialLinks = [
  { name: 'Twitter', icon: Twitter, href: 'https://twitter.com' },
  { name: 'GitHub', icon: Github, href: 'https://github.com' },
  { name: 'LinkedIn', icon: Linkedin, href: 'https://linkedin.com' },
]

export function Footer() {
  return (
    <footer className="relative bg-[#05070B] border-t border-white/[0.05]">
      {/* Main footer */}
      <div className="mx-auto max-w-7xl px-6 py-16">
        <div className="grid grid-cols-2 md:grid-cols-6 gap-8 lg:gap-12">
          {/* Brand */}
          <div className="col-span-2">
            <Link href="/" className="flex items-center gap-2.5 mb-6">
              <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-[#00D4FF] to-[#3B82F6] flex items-center justify-center">
                <Terminal className="h-4 w-4 text-[#05070B]" />
              </div>
              <span className="text-lg font-semibold text-white">
                Deep<span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00D4FF] to-[#3B82F6]">Terminal</span>
              </span>
            </Link>
            <p className="text-sm text-gray-500 max-w-xs mb-6">
              Institutional-grade trading intelligence for the modern era. 
              AI-powered analysis, 150+ metrics, real-time data.
            </p>
            {/* Social links */}
            <div className="flex items-center gap-4">
              {socialLinks.map((social) => (
                <a
                  key={social.name}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="h-9 w-9 rounded-lg border border-white/[0.05] bg-white/[0.02] flex items-center justify-center text-gray-500 hover:text-white hover:border-white/[0.1] transition-all duration-200"
                >
                  <social.icon className="h-4 w-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Links */}
          {Object.entries(footerLinks).map(([category, links]) => (
            <div key={category}>
              <h4 className="text-sm font-semibold text-white mb-4">{category}</h4>
              <ul className="space-y-3">
                {links.map((link) => (
                  <li key={link.name}>
                    <Link
                      href={link.href}
                      className="text-sm text-gray-500 hover:text-gray-300 transition-colors duration-200"
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
      <div className="border-t border-white/[0.03]">
        <div className="mx-auto max-w-7xl px-6 py-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-xs text-gray-600">
              © {new Date().getFullYear()} Deepin. All rights reserved.
            </p>
            <div className="flex items-center gap-6">
              <span className="text-xs text-gray-600">
                Built with conviction for traders who demand more.
              </span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
