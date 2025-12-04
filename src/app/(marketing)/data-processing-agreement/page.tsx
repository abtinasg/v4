import type { Metadata } from 'next'

const obligations = [
  {
    title: '1. Subject Matter & Duration',
    bullets: [
      'Processor: Deep Ltd., registered in the United Kingdom.',
      'Controller: The customer identified in the applicable subscription or credit purchase.',
      'Purpose: Deliver analytics, credits, alerts, and AI services on behalf of the controller for the duration of the customer account plus legally required retention periods.',
    ],
  },
  {
    title: '2. Processing Instructions',
    bullets: [
      'We will process personal data only on documented instructions from the controller as set out in the Terms of Service, Privacy Policy, and this DPA.',
      'We will promptly inform the controller if an instruction appears to violate GDPR or other applicable laws unless disclosure is prohibited.',
    ],
  },
  {
    title: '3. Confidentiality & Security',
    bullets: [
      'All personnel with access to personal data are bound by confidentiality agreements and receive regular security training.',
      'Deep maintains technical and organizational measures including encryption, access controls, monitoring, and incident response playbooks audited at least annually.',
    ],
  },
  {
    title: '4. Sub-processors',
    bullets: [
      'We rely on vetted infrastructure and tooling providers (e.g., cloud hosting, email delivery, log management). A current list is available upon request.',
      'We will notify controllers before onboarding new sub-processors, giving you an opportunity to object. Continued use after notice constitutes consent.',
    ],
  },
  {
    title: '5. Data Subject Rights & Assistance',
    bullets: [
      'We will assist the controller in responding to data subject requests by providing tooling or reasonably requested information.',
      'If we receive a request directly, we will forward it to the controller without undue delay unless legally restricted.',
    ],
  },
  {
    title: '6. Security Incidents',
    bullets: [
      'In the event of a personal data breach we will notify the controller without undue delay and share relevant information to support any required notifications to regulators or individuals.',
    ],
  },
  {
    title: '7. Audits & Documentation',
    bullets: [
      'We maintain records of processing activities and can provide summaries of penetration tests or compliance reports under NDA.',
      'Controllers may request reasonable audits once per year. Remote document reviews are preferred; onsite visits require 30 days’ notice.',
    ],
  },
  {
    title: '8. Return or Deletion',
    bullets: [
      'Upon termination of the services, we will delete or return personal data within 60 days unless retention is required by law.',
      'Backups are cryptographically destroyed during scheduled rotation cycles.',
    ],
  },
]

export const metadata: Metadata = {
  title: 'Data Processing Agreement | Deep',
  description: 'Standard contractual commitments describing how Deep processes personal data as a processor under GDPR.',
}

export default function DataProcessingAgreementPage() {
  return (
    <div className="bg-[#030508] text-white">
      <section className="mx-auto max-w-4xl px-6 py-16 space-y-8">
        <header>
          <p className="text-xs uppercase tracking-[0.3em] text-emerald-400">Data Processing Agreement</p>
          <h1 className="mt-4 text-4xl font-bold">Controller–Processor commitments</h1>
          <p className="mt-4 text-base text-white/70">
            Last updated: November 30, 2025. This DPA supplements the Terms of Service and applies whenever Deep processes personal data on behalf
            of a customer subject to GDPR, UK GDPR, or similar laws.
          </p>
        </header>

        <div className="space-y-6">
          {obligations.map((obligation) => (
            <article key={obligation.title} className="rounded-2xl border border-white/5 bg-white/5 p-6">
              <h2 className="text-xl font-semibold text-white">{obligation.title}</h2>
              <ul className="mt-4 list-disc space-y-2 pl-5 text-sm text-white/70">
                {obligation.bullets.map((bullet) => (
                  <li key={bullet} className="leading-relaxed">
                    {bullet}
                  </li>
                ))}
              </ul>
            </article>
          ))}
        </div>

        <article className="rounded-2xl border border-white/10 bg-white/5 p-6 text-sm text-white/70">
          <p>
            To execute a countersigned copy or request the current sub-processor list, email dpa@deepinhq.com. Include your company name, registered
            address, and account email so we can authenticate the request.
          </p>
        </article>
      </section>
    </div>
  )
}
