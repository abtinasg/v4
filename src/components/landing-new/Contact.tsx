'use client'

import { useState } from 'react'
import { Send, Mail, MessageCircle, CheckCircle, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'

export function Contact() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  })
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [errorMessage, setErrorMessage] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setStatus('loading')
    setErrorMessage('')

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'Failed to send message')
      }

      setStatus('success')
      setFormData({ name: '', email: '', subject: '', message: '' })
      
      // Reset success state after 5 seconds
      setTimeout(() => setStatus('idle'), 5000)
    } catch (error) {
      setStatus('error')
      setErrorMessage(error instanceof Error ? error.message : 'Something went wrong')
    }
  }

  return (
    <section id="contact" className="relative py-28 bg-[#0D0F12]">
      {/* Section border */}
      <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-white/8 to-transparent" />

      <div className="mx-auto max-w-6xl px-6">
        <div className="grid lg:grid-cols-2 gap-14 items-start">
          {/* Left side - Info */}
          <div>
            <p className="text-[12px] font-medium text-[#4ECDC4] uppercase tracking-wider mb-4">
              Contact
            </p>
            <h2 className="text-4xl md:text-5xl font-semibold text-white tracking-tight mb-6">
              Get in touch
            </h2>
            <p className="text-lg text-white/50 mb-10 max-w-md font-light">
              Have questions about the platform? Need assistance with your account? 
              We're here to help.
            </p>

            {/* Contact cards */}
            <div className="space-y-4">
              <div className="p-5 rounded-2xl bg-[#13161A] border border-white/[0.06]">
                <div className="flex items-center gap-4">
                  <div className="h-11 w-11 rounded-xl bg-[#4ECDC4]/10 border border-[#4ECDC4]/20 flex items-center justify-center">
                    <Mail className="h-5 w-5 text-[#4ECDC4]" />
                  </div>
                  <div>
                    <h3 className="text-white font-medium text-[15px]">Email Support</h3>
                    <p className="text-white/40 text-sm">support@deepin.com</p>
                  </div>
                </div>
              </div>

              <div className="p-5 rounded-2xl bg-[#13161A] border border-white/[0.06]">
                <div className="flex items-center gap-4">
                  <div className="h-11 w-11 rounded-xl bg-[#27AE60]/10 border border-[#27AE60]/20 flex items-center justify-center">
                    <MessageCircle className="h-5 w-5 text-[#27AE60]" />
                  </div>
                  <div>
                    <h3 className="text-white font-medium text-[15px]">Live Chat</h3>
                    <p className="text-white/40 text-sm">Typical response within 24 hours</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right side - Form */}
          <div className="p-7 rounded-2xl bg-[#13161A] border border-white/[0.06]">
            {status === 'success' ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <div className="h-14 w-14 rounded-full bg-[#27AE60]/10 flex items-center justify-center mb-6">
                  <CheckCircle className="h-7 w-7 text-[#27AE60]" />
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">
                  Message Sent
                </h3>
                <p className="text-white/50">
                  Thank you for reaching out. We'll respond shortly.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-white/50 mb-2">
                    Name
                  </label>
                  <Input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Your name"
                    required
                    className="bg-[#0D0F12] border-white/[0.08] text-white placeholder:text-white/30 focus:border-[#E67E22]/50 focus:ring-[#E67E22]/20"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-white/50 mb-2">
                    Email
                  </label>
                  <Input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="you@example.com"
                    required
                    className="bg-[#0D0F12] border-white/[0.08] text-white placeholder:text-white/30 focus:border-[#E67E22]/50 focus:ring-[#E67E22]/20"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-white/50 mb-2">
                    Subject
                  </label>
                  <Input
                    type="text"
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    placeholder="How can we help?"
                    className="bg-[#0D0F12] border-white/[0.08] text-white placeholder:text-white/30 focus:border-[#E67E22]/50 focus:ring-[#E67E22]/20"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-white/50 mb-2">
                    Message
                  </label>
                  <Textarea
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    placeholder="Tell us more..."
                    required
                    rows={4}
                    className="bg-[#0D0F12] border-white/[0.08] text-white placeholder:text-white/30 focus:border-[#E67E22]/50 focus:ring-[#E67E22]/20 resize-none"
                  />
                </div>

                {status === 'error' && (
                  <div className="p-3 rounded-lg bg-[#E74C3C]/10 border border-[#E74C3C]/20">
                    <p className="text-sm text-[#E74C3C]">{errorMessage}</p>
                  </div>
                )}

                <Button
                  type="submit"
                  disabled={status === 'loading'}
                  className="w-full h-11 bg-[#E67E22] hover:bg-[#D35400] text-white font-medium rounded-full"
                >
                  {status === 'loading' ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    <>
                      <Send className="h-4 w-4 mr-2" />
                      Send Message
                    </>
                  )}
                </Button>
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}
