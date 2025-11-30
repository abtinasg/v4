'use client';

import { useState } from 'react';
import { Metadata } from 'next';
import Link from 'next/link';
import { 
  Mail, 
  MessageSquare, 
  Send,
  MapPin,
  Clock,
  CheckCircle,
  Loader2
} from 'lucide-react';
import { Button } from '@/components/ui/button';

const contactMethods = [
  {
    icon: Mail,
    title: 'Email',
    description: 'Send us an email anytime',
    value: 'support@deepterm.co',
    href: 'mailto:support@deepterm.co',
  },
  {
    icon: MessageSquare,
    title: 'Live Chat',
    description: 'Chat with our team',
    value: 'Available 9am-5pm EST',
    href: '#chat',
  },
  {
    icon: Clock,
    title: 'Response Time',
    description: 'We typically respond within',
    value: '24 hours',
    href: null,
  },
];

const faqs = [
  {
    question: 'How do I get started?',
    answer: 'Sign up for a free account with 100 credits. No credit card required. Start analyzing any stock immediately.',
  },
  {
    question: 'What payment methods do you accept?',
    answer: 'We accept all major credit cards (Visa, Mastercard, American Express) and PayPal.',
  },
  {
    question: 'Can I cancel anytime?',
    answer: 'Yes, you can cancel your subscription at any time. Your credits remain valid until they expire.',
  },
  {
    question: 'Do you offer refunds?',
    answer: 'We offer a 7-day money-back guarantee for first-time purchases. Contact support for assistance.',
  },
];

export default function ContactPage() {
  const [formState, setFormState] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1500));
    
    setIsSubmitting(false);
    setIsSubmitted(true);
    setFormState({ name: '', email: '', subject: '', message: '' });
  };

  return (
    <>
      {/* Hero Section */}
      <section className="relative overflow-hidden py-20 sm:py-28">
        <div className="absolute inset-0 -z-10">
          <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 via-transparent to-violet-500/5" />
        </div>

        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <h1 className="text-4xl font-bold tracking-tight text-white sm:text-5xl">
              Get in Touch
            </h1>
            <p className="mt-6 text-lg text-white/60">
              Have questions? We'd love to hear from you. Send us a message and we'll 
              respond as soon as possible.
            </p>
          </div>
        </div>
      </section>

      {/* Contact Methods */}
      <section className="py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-6 sm:grid-cols-3">
            {contactMethods.map((method) => (
              <div
                key={method.title}
                className="rounded-xl border border-white/5 bg-white/[0.02] p-6 text-center"
              >
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-to-br from-cyan-500/20 to-violet-500/20">
                  <method.icon className="h-6 w-6 text-cyan-400" />
                </div>
                <h3 className="mt-4 font-semibold text-white">{method.title}</h3>
                <p className="mt-1 text-sm text-white/40">{method.description}</p>
                {method.href ? (
                  <a
                    href={method.href}
                    className="mt-2 inline-block text-cyan-400 hover:text-cyan-300 transition-colors"
                  >
                    {method.value}
                  </a>
                ) : (
                  <p className="mt-2 text-white/60">{method.value}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Form & FAQ */}
      <section className="py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-16 lg:grid-cols-2">
            {/* Contact Form */}
            <div>
              <h2 className="text-2xl font-bold text-white">Send a Message</h2>
              <p className="mt-2 text-white/60">
                Fill out the form below and we'll get back to you shortly.
              </p>

              {isSubmitted ? (
                <div className="mt-8 rounded-xl border border-green-500/20 bg-green-500/10 p-8 text-center">
                  <CheckCircle className="mx-auto h-12 w-12 text-green-400" />
                  <h3 className="mt-4 text-xl font-semibold text-white">Message Sent!</h3>
                  <p className="mt-2 text-white/60">
                    Thank you for reaching out. We'll respond within 24 hours.
                  </p>
                  <Button
                    onClick={() => setIsSubmitted(false)}
                    variant="outline"
                    className="mt-6 border-white/10"
                  >
                    Send Another Message
                  </Button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="mt-8 space-y-6">
                  <div className="grid gap-6 sm:grid-cols-2">
                    <div>
                      <label htmlFor="name" className="block text-sm font-medium text-white/60">
                        Name
                      </label>
                      <input
                        type="text"
                        id="name"
                        required
                        value={formState.name}
                        onChange={(e) => setFormState({ ...formState, name: e.target.value })}
                        className="mt-2 w-full rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-white placeholder-white/30 focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500"
                        placeholder="Your name"
                      />
                    </div>
                    <div>
                      <label htmlFor="email" className="block text-sm font-medium text-white/60">
                        Email
                      </label>
                      <input
                        type="email"
                        id="email"
                        required
                        value={formState.email}
                        onChange={(e) => setFormState({ ...formState, email: e.target.value })}
                        className="mt-2 w-full rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-white placeholder-white/30 focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500"
                        placeholder="you@example.com"
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="subject" className="block text-sm font-medium text-white/60">
                      Subject
                    </label>
                    <select
                      id="subject"
                      required
                      value={formState.subject}
                      onChange={(e) => setFormState({ ...formState, subject: e.target.value })}
                      className="mt-2 w-full rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-white focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500"
                    >
                      <option value="" className="bg-[#0a0d12]">Select a subject</option>
                      <option value="general" className="bg-[#0a0d12]">General Inquiry</option>
                      <option value="support" className="bg-[#0a0d12]">Technical Support</option>
                      <option value="billing" className="bg-[#0a0d12]">Billing Question</option>
                      <option value="feature" className="bg-[#0a0d12]">Feature Request</option>
                      <option value="partnership" className="bg-[#0a0d12]">Partnership</option>
                    </select>
                  </div>

                  <div>
                    <label htmlFor="message" className="block text-sm font-medium text-white/60">
                      Message
                    </label>
                    <textarea
                      id="message"
                      required
                      rows={5}
                      value={formState.message}
                      onChange={(e) => setFormState({ ...formState, message: e.target.value })}
                      className="mt-2 w-full rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-white placeholder-white/30 focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500 resize-none"
                      placeholder="How can we help you?"
                    />
                  </div>

                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full bg-gradient-to-r from-cyan-500 to-violet-600 hover:opacity-90"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Sending...
                      </>
                    ) : (
                      <>
                        <Send className="mr-2 h-4 w-4" />
                        Send Message
                      </>
                    )}
                  </Button>
                </form>
              )}
            </div>

            {/* FAQ */}
            <div>
              <h2 className="text-2xl font-bold text-white">Frequently Asked Questions</h2>
              <p className="mt-2 text-white/60">
                Quick answers to common questions.
              </p>

              <div className="mt-8 space-y-4">
                {faqs.map((faq, index) => (
                  <div
                    key={index}
                    className="rounded-lg border border-white/5 bg-white/[0.02] p-4"
                  >
                    <h3 className="font-medium text-white">{faq.question}</h3>
                    <p className="mt-2 text-sm text-white/40">{faq.answer}</p>
                  </div>
                ))}
              </div>

              <div className="mt-8 rounded-lg border border-white/5 bg-white/[0.02] p-6">
                <h3 className="font-semibold text-white">Still have questions?</h3>
                <p className="mt-2 text-sm text-white/40">
                  Check out our documentation or reach out to support.
                </p>
                <div className="mt-4 flex gap-4">
                  <Link
                    href="/docs"
                    className="text-sm text-cyan-400 hover:text-cyan-300 transition-colors"
                  >
                    View Docs →
                  </Link>
                  <a
                    href="mailto:support@deepterm.co"
                    className="text-sm text-cyan-400 hover:text-cyan-300 transition-colors"
                  >
                    Email Support →
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
