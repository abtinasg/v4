import type { Metadata } from 'next'

const sections = [
  {
    title: 'Information We Collect',
    body: [
      'Account data such as your name, email address, authentication identifiers, and billing details that you share when creating or updating your profile.',
      'Usage data including feature interactions, credit consumption, device information, approximate geolocation, and diagnostic logs that help us keep the platform reliable and secure.',
      'Market and portfolio inputs that you optionally supply to build watchlists, models, or AI prompts. These are encrypted at rest and used only to provide the requested functionality.',
    ],
  },
  {
    title: 'How We Use Your Data',
    body: [
      'Deliver, maintain, and improve Deep, including credit tracking, portfolio analytics, alerting, and AI assistance.',
      'Detect, prevent, and investigate fraud, abuse, or violations of our Terms of Service.',
      'Communicate product updates, critical security notices, and support responses. You can opt out of non-essential emails at any time.',
    ],
  },
  {
    title: 'Lawful Bases for Processing (GDPR)',
    body: [
      'Performance of a contract when we provide requested services such as credit purchases or AI analysis.',
      'Legitimate interests in securing the platform, preventing misuse, and improving user experience.',
      'Compliance with legal obligations related to taxation, financial reporting, or regulatory requests.',
      'Consent for optional analytics, marketing communications, and cookies where required. You may withdraw consent without affecting the legality of prior processing.',
    ],
  },
  {
    title: 'Data Retention & Security',
    body: [
      'We retain personal data only for as long as necessary to deliver the service, meet legal obligations, or resolve disputes.',
      'Infrastructure is hosted on SOC 2–compliant providers with encryption in transit (TLS 1.2+) and at rest (AES-256). Access to production systems is restricted via least-privilege policies and audited regularly.',
    ],
  },
  {
    title: 'International Transfers',
    body: [
      'Deep may process data in the United States and European Union. When transferring personal data outside your jurisdiction we rely on Standard Contractual Clauses and equivalent safeguards.',
    ],
  },
  {
    title: 'Your Rights',
    body: [
      'Access, correct, or delete your personal data.',
      'Restrict or object to processing, and request data portability.',
      'Lodge a complaint with your local supervisory authority if you believe we have violated data protection laws.',
      'Exercise these rights by emailing privacy@deepinhq.com. We will respond within 30 days (or sooner, where required).',
    ],
  },
]

export const metadata: Metadata = {
  title: 'Privacy Policy | Deep',
  description: 'Learn how Deep collects, processes, and safeguards your data in compliance with GDPR and global privacy laws.',
}

const lastUpdated = 'November 30, 2025'

export default function PrivacyPolicyPage() {
  return (
    <div className="bg-[#030508] text-white">
      <section className="mx-auto max-w-4xl px-6 py-16">
        <p className="text-xs uppercase tracking-[0.3em] text-cyan-400">Privacy Policy</p>
        <h1 className="mt-4 text-4xl font-bold">Protecting your data and privacy</h1>
        <p className="mt-4 text-base text-white/70">
          Last updated: {lastUpdated}. Deep processes
          personal data as a controller under the EU General Data Protection Regulation (GDPR), the UK GDPR, and applicable U.S. privacy statutes.
        </p>

        <div className="mt-12 space-y-10">
          {sections.map((section) => (
            <article key={section.title} className="rounded-2xl border border-white/5 bg-white/5 p-6">
              <h2 className="text-2xl font-semibold text-white">{section.title}</h2>
              <ul className="mt-4 space-y-3 text-sm text-white/70">
                {section.body.map((item) => (
                  <li key={item} className="leading-relaxed">
                    {item}
                  </li>
                ))}
              </ul>
            </article>
          ))}
        </div>

        <div className="mt-12 rounded-2xl border border-cyan-500/30 bg-cyan-500/5 p-6 text-sm text-white/80">
          <p className="font-semibold">Questions or complaints?</p>
          <p className="mt-2">
            Email privacy@deepinhq.com or write to Deep Privacy Office, 123 Market Street, London EC2V 5AE, United Kingdom.
          </p>
        </div>
      </section>
    </div>
  )
}
