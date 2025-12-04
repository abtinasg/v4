import type { Metadata } from 'next'

const cookieTypes = [
  {
    title: 'Strictly Necessary',
    description: 'Session cookies that authenticate you, remember credit balances, and keep the platform secure. These cannot be disabled without breaking core functionality.',
  },
  {
    title: 'Performance',
    description: 'Anonymous telemetry that helps us detect outages, latency, and rendering issues across devices. We aggregate this information to improve reliability.',
  },
  {
    title: 'Analytics & Personalization',
    description: 'Cookies that learn which dashboards you visit most often so we can surface relevant metrics and tutorials. Enabled only with your consent.',
  },
  {
    title: 'Marketing',
    description: 'Used occasionally for remarketing campaigns about new features. These are opt-in and disabled by default within the EU/UK.',
  },
]

export const metadata: Metadata = {
  title: 'Cookie Policy | Deep',
  description: 'Understand how Deepin uses cookies and similar technologies and how you can manage your preferences.',
}

export default function CookiePolicyPage() {
  return (
    <div className="bg-[#030508] text-white">
      <section className="mx-auto max-w-3xl px-6 py-16 space-y-10">
        <header>
          <p className="text-xs uppercase tracking-[0.3em] text-amber-400">Cookie Policy</p>
          <h1 className="mt-4 text-4xl font-bold">How and why we use cookies</h1>
          <p className="mt-4 text-base text-white/70">
            Last updated: November 30, 2025. This cookie policy explains what cookies are, which types we use, and how you can control your preferences
            when browsing Deepin across the web and our dashboard.
          </p>
        </header>

        <article className="rounded-2xl border border-white/5 bg-white/5 p-6 text-sm text-white/70">
          <h2 className="text-2xl font-semibold text-white">Your choices</h2>
          <p className="mt-4">
            On first visit, EU/UK visitors will see a consent banner where you can accept, reject, or customize non-essential cookies. You can also change your
            decision at any time by visiting Settings → Privacy inside the dashboard or by clearing cookies in your browser.
          </p>
        </article>

        <div className="space-y-4">
          {cookieTypes.map((cookie) => (
            <article key={cookie.title} className="rounded-2xl border border-white/5 bg-white/5 p-6">
              <h3 className="text-xl font-semibold text-white">{cookie.title}</h3>
              <p className="mt-3 text-sm text-white/70">{cookie.description}</p>
            </article>
          ))}
        </div>

        <article className="rounded-2xl border border-white/10 bg-white/5 p-6 text-sm text-white/80">
          <h2 className="text-xl font-semibold text-white">Managing cookies</h2>
          <ul className="mt-3 list-disc space-y-2 pl-5">
            <li>Browser controls: adjust cookie permissions in Chrome, Safari, Firefox, or Edge.</li>
            <li>Third-party opt-outs: disable analytics via Google Analytics Opt-out Browser Add-on.</li>
            <li>Email privacy@deepinhq.com if you have questions about our use of cookies or similar technologies.</li>
          </ul>
        </article>
      </section>
    </div>
  )
}
