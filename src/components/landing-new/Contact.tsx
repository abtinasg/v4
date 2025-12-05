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
    <section id="contact" className="relative py-32 bg-[#09090B]">
      {/* Section border */}
      <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />

      <div className="mx-auto max-w-6xl px-6">
        <div className="grid lg:grid-cols-2 gap-16 items-start">
          {/* Left side - Info */}
          <div>
            <p className="text-[13px] font-medium text-blue-400 uppercase tracking-wider mb-4">
              Contact Us
            </p>
            <h2 className="text-4xl md:text-5xl font-bold text-white tracking-tight mb-6">
              Get in touch
              <br />
              <span className="text-zinc-500">We'd love to hear from you</span>
            </h2>
            <p className="text-lg text-zinc-400 mb-10 max-w-md">
              Have questions about our platform? Need help with your account? 
              Or just want to say hello? We're here for you.
            </p>

            {/* Contact cards */}
            <div className="space-y-4">
              <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/[0.06]">
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 rounded-xl bg-blue-500/10 flex items-center justify-center">
                    <Mail className="h-5 w-5 text-blue-400" />
                  </div>
                  <div>
                    <h3 className="text-white font-medium">Email Support</h3>
                    <p className="text-zinc-400 text-sm">support@deepin.com</p>
                  </div>
                </div>
              </div>

              <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/[0.06]">
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 rounded-xl bg-emerald-500/10 flex items-center justify-center">
                    <MessageCircle className="h-5 w-5 text-emerald-400" />
                  </div>
                  <div>
                    <h3 className="text-white font-medium">Live Chat</h3>
                    <p className="text-zinc-400 text-sm">Send us a message and we'll reply soon</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right side - Form */}
          <div className="p-8 rounded-2xl bg-white/[0.02] border border-white/[0.06]">
            {status === 'success' ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <div className="h-16 w-16 rounded-full bg-emerald-500/10 flex items-center justify-center mb-6">
                  <CheckCircle className="h-8 w-8 text-emerald-400" />
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">
                  Message Sent!
                </h3>
                <p className="text-zinc-400">
                  Thank you for reaching out. We'll get back to you soon.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-zinc-400 mb-2">
                    Name
                  </label>
                  <Input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Your name"
                    required
                    className="bg-white/[0.02] border-white/[0.08] text-white placeholder:text-zinc-600 focus:border-blue-500/50 focus:ring-blue-500/20"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-zinc-400 mb-2">
                    Email
                  </label>
                  <Input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="you@example.com"
                    required
                    className="bg-white/[0.02] border-white/[0.08] text-white placeholder:text-zinc-600 focus:border-blue-500/50 focus:ring-blue-500/20"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-zinc-400 mb-2">
                    Subject
                  </label>
                  <Input
                    type="text"
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    placeholder="How can we help?"
                    className="bg-white/[0.02] border-white/[0.08] text-white placeholder:text-zinc-600 focus:border-blue-500/50 focus:ring-blue-500/20"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-zinc-400 mb-2">
                    Message
                  </label>
                  <Textarea
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    placeholder="Tell us more about your question..."
                    required
                    rows={5}
                    className="bg-white/[0.02] border-white/[0.08] text-white placeholder:text-zinc-600 focus:border-blue-500/50 focus:ring-blue-500/20 resize-none"
                  />
                </div>

                {status === 'error' && (
                  <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20">
                    <p className="text-sm text-red-400">{errorMessage}</p>
                  </div>
                )}

                <Button
                  type="submit"
                  disabled={status === 'loading'}
                  className="w-full h-12 bg-blue-600 hover:bg-blue-500 text-white font-medium"
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
