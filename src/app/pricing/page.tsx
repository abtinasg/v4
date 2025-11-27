import Link from 'next/link'
import { ArrowLeft, Check } from 'lucide-react'
import { currentUser } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'

const plans = [
  {
    name: 'Free',
    tier: 'free',
    price: '$0',
    description: 'Perfect for getting started',
    features: [
      'Basic stock analysis',
      'Limited watchlists (3 stocks)',
      'Basic charts',
      'Community support',
      'Daily market news',
    ],
    cta: 'Get Started',
    popular: false,
  },
  {
    name: 'Pro',
    tier: 'pro',
    price: '$29',
    description: 'For serious traders',
    features: [
      'Advanced technical analysis',
      'Unlimited watchlists',
      'Real-time data feeds',
      'Advanced charting tools',
      'Priority support',
      'Custom alerts',
      'Portfolio tracking',
      'AI-powered insights',
    ],
    cta: 'Upgrade to Pro',
    popular: true,
  },
  {
    name: 'Enterprise',
    tier: 'enterprise',
    price: '$99',
    description: 'For professional teams',
    features: [
      'Everything in Pro',
      'Multi-user accounts',
      'Team collaboration',
      'Custom integrations',
      'API access',
      'Dedicated account manager',
      'White-label options',
      'SLA guarantees',
      'Advanced security',
    ],
    cta: 'Contact Sales',
    popular: false,
  },
]

export default async function PricingPage() {
  const user = await currentUser()

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      {/* Navigation */}
      <nav className="border-b bg-background/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link 
            href={user ? "/dashboard" : "/"}
            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            {user ? "Back to Dashboard" : "Back to Home"}
          </Link>
          
          <div className="flex items-center gap-4">
            {!user && (
              <>
                <Link 
                  href="/sign-in"
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  Sign In
                </Link>
                <Link 
                  href="/sign-up"
                  className="text-sm px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
                >
                  Get Started
                </Link>
              </>
            )}
            {user && (
              <Link 
                href="/dashboard"
                className="text-sm px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
              >
                Go to Dashboard
              </Link>
            )}
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-6 py-16 text-center">
        <h1 className="text-4xl md:text-5xl font-bold mb-4">
          Choose Your <span className="text-gradient">Trading Edge</span>
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          From individual traders to enterprise teams, we have a plan that fits your needs.
        </p>
      </div>

      {/* Pricing Cards */}
      <div className="max-w-7xl mx-auto px-6 pb-24">
        <div className="grid md:grid-cols-3 gap-8">
          {plans.map((plan) => (
            <div
              key={plan.tier}
              className={`relative rounded-2xl border p-8 ${
                plan.popular
                  ? 'border-primary shadow-lg shadow-primary/20 scale-105'
                  : 'border-border bg-card'
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 bg-primary text-primary-foreground text-sm font-medium rounded-full">
                  Most Popular
                </div>
              )}

              <div className="mb-6">
                <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  {plan.description}
                </p>
                <div className="flex items-baseline gap-2">
                  <span className="text-4xl font-bold">{plan.price}</span>
                  {plan.price !== '$0' && (
                    <span className="text-muted-foreground">/month</span>
                  )}
                </div>
              </div>

              <ul className="space-y-3 mb-8">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                    <span className="text-sm">{feature}</span>
                  </li>
                ))}
              </ul>

              <Link
                href={plan.tier === 'free' ? '/sign-up' : '#'}
                className={`block w-full py-3 text-center rounded-lg font-medium transition-colors ${
                  plan.popular
                    ? 'bg-primary text-primary-foreground hover:bg-primary/90'
                    : 'bg-accent text-foreground hover:bg-accent/80'
                }`}
              >
                {plan.cta}
              </Link>
            </div>
          ))}
        </div>
      </div>

      {/* FAQ Section */}
      <div className="max-w-4xl mx-auto px-6 py-16 border-t">
        <h2 className="text-3xl font-bold text-center mb-12">
          Frequently Asked Questions
        </h2>
        <div className="space-y-8">
          <div>
            <h3 className="text-lg font-semibold mb-2">
              Can I change plans later?
            </h3>
            <p className="text-muted-foreground">
              Yes! You can upgrade or downgrade your plan at any time. Changes take effect immediately.
            </p>
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-2">
              Is there a free trial for Pro?
            </h3>
            <p className="text-muted-foreground">
              Yes, all new users get a 14-day free trial of Pro features when they sign up.
            </p>
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-2">
              What payment methods do you accept?
            </h3>
            <p className="text-muted-foreground">
              We accept all major credit cards, PayPal, and wire transfers for Enterprise plans.
            </p>
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-2">
              Do you offer refunds?
            </h3>
            <p className="text-muted-foreground">
              Yes, we offer a 30-day money-back guarantee for all paid plans.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
