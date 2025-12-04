import type { Metadata } from 'next'

const statements = [
  'Deep is an analytics and educational platform. We do not execute trades, custody assets, or act as an investment advisor registered under U.S. SEC, FCA, or any other financial authority.',
  'Charts, AI commentary, scenario models, or credit-powered insights are generated from historical data and public filings. Past performance is not a reliable indicator of future results.',
  'You remain solely responsible for performing your own due diligence before making investment, tax, accounting, or legal decisions.',
  'By using the platform you acknowledge that any loss arising from market activity is your own and you will not hold Deep, its affiliates, or its employees liable.',
]

export const metadata: Metadata = {
  title: 'Disclaimer | Deep',
  description: 'Important limitations and disclosures about Deep and its financial research tools.',
}

export default function DisclaimerPage() {
  return (
    <div className="bg-[#030508] text-white">
      <section className="mx-auto max-w-3xl px-6 py-16 space-y-8">
        <header>
          <p className="text-xs uppercase tracking-[0.3em] text-red-400">Disclaimer</p>
          <h1 className="mt-4 text-4xl font-bold">Not financial, tax, or legal advice</h1>
          <p className="mt-4 text-base text-white/70">
            Last updated: November 30, 2025. Deep delivers quantitative tools and automation designed for research support only.
            Nothing on the platform constitutes personalized recommendations or a solicitation to buy or sell securities.
          </p>
        </header>

        <div className="space-y-4">
          {statements.map((statement) => (
            <article key={statement} className="rounded-2xl border border-white/5 bg-white/5 p-6 text-sm text-white/80">
              {statement}
            </article>
          ))}
        </div>

        <article className="rounded-2xl border border-white/10 bg-white/5 p-6 text-sm text-white/80">
          <h2 className="text-xl font-semibold text-white">Consult qualified professionals</h2>
          <p className="mt-3 text-white/70">
            Always consult with a licensed investment advisor, tax professional, or attorney who understands your circumstances before acting on any
            information presented in Deep.
          </p>
        </article>
      </section>
    </div>
  )
}
