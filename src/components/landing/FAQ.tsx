'use client'

import { useState } from 'react'
import { HelpCircle, ChevronDown, Plus, Minus } from 'lucide-react'

const faqs = [
  {
    question: 'What are credits and how do they work?',
    answer: 'Credits are the currency used for AI queries and advanced features on Deep Terminal. You receive 70 free credits when you sign up, plus a monthly recharge. Each AI query or analysis typically uses 1-5 credits depending on complexity. Pro and Terminal+ plans include larger monthly credit allocations.'
  },
  {
    question: 'How is Deep Terminal different from Bloomberg?',
    answer: 'Deep Terminal offers institutional-grade analytics at a fraction of the cost. While Bloomberg Terminal costs $20,000+/year, Deep Terminal starts free and offers similar capabilities including 150+ metrics, real-time data, and AI-powered insights — designed specifically for retail investors.'
  },
  {
    question: 'What markets and data sources do you support?',
    answer: 'We provide real-time data for US equities, major indices, and macro indicators. Our data comes from trusted sources including Alpha Vantage, Polygon.io, Finnhub, and Yahoo Finance, ensuring accuracy and reliability for your analysis.'
  },
  {
    question: 'How does the AI Orchestrator work?',
    answer: 'Our AI Orchestrator routes your natural language queries to 3 specialized models: a Reasoning Model for logical analysis, an Analysis Model for data processing, and a Markets Model for market insights. The results are synthesized with confidence scoring to give you comprehensive, accurate answers.'
  },
  {
    question: 'Can I cancel my subscription anytime?',
    answer: 'Yes, you can cancel your Pro or Terminal+ subscription at any time. Your credits will remain active until the end of your billing period, and you can continue using the free tier with 70 credits on signup and monthly recharge.'
  },
  {
    question: 'Is my data secure?',
    answer: 'Absolutely. We are SOC 2 compliant with bank-grade security. All data is encrypted in transit and at rest. We never share your personal information or trading data with third parties.'
  },
]

export function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(0)

  return (
    <section className="relative py-28 md:py-36 bg-[#030508] overflow-hidden">
      {/* Premium ambient background */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-px bg-gradient-to-r from-transparent via-white/[0.06] to-transparent" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[500px] bg-[radial-gradient(ellipse_50%_50%_at_50%_50%,rgba(91,124,255,0.04),transparent)]" />
      </div>

      <div className="relative mx-auto max-w-4xl px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 rounded-full border border-[#5B7CFF]/20 bg-[#5B7CFF]/[0.06] px-5 py-2 text-sm font-medium text-[#5B7CFF] mb-8">
            <HelpCircle className="h-4 w-4" />
            FAQ
          </div>

          <h2 className="text-4xl md:text-5xl font-semibold tracking-tight text-white mb-6">
            Frequently Asked{' '}
            <span className="bg-gradient-to-r from-[#5B7CFF] to-[#00C9E4] bg-clip-text text-transparent">
              Questions
            </span>
          </h2>

          <p className="text-lg text-gray-400 max-w-xl mx-auto leading-relaxed font-light">
            Everything you need to know about Deep Terminal.
          </p>
        </div>

        {/* FAQ Items */}
        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <div
              key={index}
              className={`rounded-2xl border transition-all duration-300 ${
                openIndex === index
                  ? 'border-[#5B7CFF]/30 bg-[#5B7CFF]/[0.03]'
                  : 'border-white/[0.06] bg-white/[0.02] hover:border-white/[0.1]'
              }`}
            >
              <button
                onClick={() => setOpenIndex(openIndex === index ? null : index)}
                className="w-full flex items-center justify-between p-6 text-left"
              >
                <span className="text-base font-medium text-white pr-4">{faq.question}</span>
                <div
                  className={`flex-shrink-0 h-8 w-8 rounded-lg flex items-center justify-center transition-all duration-300 ${
                    openIndex === index
                      ? 'bg-[#5B7CFF]/20 text-[#5B7CFF]'
                      : 'bg-white/[0.05] text-gray-400'
                  }`}
                >
                  {openIndex === index ? (
                    <Minus className="h-4 w-4" />
                  ) : (
                    <Plus className="h-4 w-4" />
                  )}
                </div>
              </button>
              <div
                className={`overflow-hidden transition-all duration-300 ${
                  openIndex === index ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
                }`}
              >
                <div className="px-6 pb-6">
                  <p className="text-sm text-gray-400 leading-relaxed">{faq.answer}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
