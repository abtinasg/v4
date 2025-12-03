import Link from 'next/link'
import { Metadata } from 'next'
import { ArrowLeft, Check, Coins, Gift, Bitcoin } from 'lucide-react'
import { currentUser } from '@clerk/nextjs/server'
import { db } from '@/lib/db'
import { creditPackages } from '@/lib/db/schema'
import { eq, asc } from 'drizzle-orm'
import { CREDIT_COSTS } from '@/lib/credits/config'
import { generatePageMetadata } from '@/lib/seo'
import { BuyButton } from '@/components/payments'

export const metadata: Metadata = generatePageMetadata({
  title: 'Pricing - Affordable Stock Analysis Credits',
  description: 'Get professional stock analysis at a fraction of the cost. Pay only for what you use with our credit-based pricing. Start free with 100 credits.',
  path: '/pricing',
});

export default async function PricingPage() {
  const user = await currentUser()

  // Get credit packages from database
  const packages = await db.select()
    .from(creditPackages)
    .where(eq(creditPackages.isActive, true))
    .orderBy(asc(creditPackages.sortOrder))

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-background">
      {/* Navigation */}
      <nav className="border-b border-white/[0.06] bg-background/80 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-8 py-5 flex items-center justify-between">
          <Link 
            href={user ? "/dashboard" : "/"}
            className="flex items-center gap-2.5 text-sm text-white/50 hover:text-white/80 transition-all duration-300 font-light"
          >
            <ArrowLeft className="w-4 h-4" />
            {user ? "Back to Dashboard" : "Back to Home"}
          </Link>
          
          <div className="flex items-center gap-4">
            {!user && (
              <>
                <Link 
                  href="/sign-in"
                  className="text-sm text-white/50 hover:text-white/80 transition-all duration-300 font-light"
                >
                  Sign In
                </Link>
                <Link 
                  href="/sign-up"
                  className="text-sm px-6 py-2.5 bg-white/[0.08] hover:bg-white/[0.12] text-white rounded-xl border border-white/[0.1] hover:border-white/[0.15] transition-all duration-300 font-light"
                >
                  Get Started
                </Link>
              </>
            )}
            {user && (
              <Link 
                href="/dashboard"
                className="text-sm px-6 py-2.5 bg-white/[0.08] hover:bg-white/[0.12] text-white rounded-xl border border-white/[0.1] hover:border-white/[0.15] transition-all duration-300 font-light"
              >
                Go to Dashboard
              </Link>
            )}
          </div>
        </div>
      </nav>

      {/* Hero Section - Primary */}
      <div className="max-w-5xl mx-auto px-8 pt-24 pb-20 text-center">
        <h1 className="text-5xl md:text-6xl font-semibold mb-6 tracking-tight text-white">
          Choose Your Trading Edge
        </h1>
        <p className="text-lg text-white/40 max-w-2xl mx-auto font-light leading-relaxed">
          Professional-grade analysis powered by credits. Pay only for what you use.
        </p>
      </div>

      {/* Credit Packages - Secondary */}
      <div className="max-w-7xl mx-auto px-8 pb-24">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-semibold text-white mb-4 tracking-tight">
            Credit Packages
          </h2>
          <p className="text-white/40 max-w-xl mx-auto font-light">
            Flexible pricing that scales with your needs. Credits never expire.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
          {packages.map((pkg) => {
            const credits = parseFloat(pkg.credits)
            const bonus = parseFloat(pkg.bonusCredits)
            const price = parseFloat(pkg.price)
            const total = credits + bonus
            const pricePerCredit = price / total
            
            return (
              <div
                key={pkg.id}
                className={`relative rounded-2xl border backdrop-blur-xl p-8 transition-all duration-300 hover:scale-[1.02] ${
                  pkg.isPopular
                    ? 'border-white/[0.12] bg-white/[0.04] shadow-2xl shadow-white/5'
                    : 'border-white/[0.06] bg-white/[0.02] hover:border-white/[0.1] hover:bg-white/[0.03]'
                }`}
              >
                {pkg.isPopular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1.5 bg-white/[0.1] text-white text-xs font-light rounded-full border border-white/[0.15] backdrop-blur-xl">
                    Best Value
                  </div>
                )}

                <div className="mb-6">
                  <h3 className="text-lg font-medium text-white mb-2">{pkg.name}</h3>
                  <div className="text-4xl font-light text-white tracking-tight">
                    ${price}
                  </div>
                </div>
                
                <div className="space-y-3 mb-8">
                  <div className="flex justify-between items-center py-2">
                    <span className="text-sm text-white/40 font-light">Credits</span>
                    <span className="text-sm font-medium text-white">{credits.toLocaleString()}</span>
                  </div>
                  {bonus > 0 && (
                    <div className="flex justify-between items-center py-2 border-t border-white/[0.06]">
                      <span className="text-sm text-emerald-400/80 font-light flex items-center gap-1.5">
                        <Gift className="w-3.5 h-3.5" />
                        Bonus
                      </span>
                      <span className="text-sm font-medium text-emerald-400">+{bonus.toLocaleString()}</span>
                    </div>
                  )}
                  <div className="flex justify-between items-center py-2 border-t border-white/[0.06]">
                    <span className="text-sm font-medium text-white/70">Total Credits</span>
                    <span className="text-base font-semibold text-white">{total.toLocaleString()}</span>
                  </div>
                </div>
                
                <div className="text-xs text-white/30 text-center mb-6 font-light">
                  ${pricePerCredit.toFixed(4)} per credit
                </div>

                <BuyButton 
                  packageId={pkg.id}
                  packageName={pkg.name}
                  price={price}
                  isPopular={pkg.isPopular}
                />
              </div>
            )
          })}
        </div>
      </div>

      {/* Divider */}
      <div className="max-w-7xl mx-auto px-8 py-12">
        <div className="h-px bg-gradient-to-r from-transparent via-white/[0.08] to-transparent" />
      </div>

      {/* Credit Costs - Tertiary */}
      <div className="max-w-5xl mx-auto px-8 pb-24">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-semibold text-white mb-4 tracking-tight">
            Credit Cost per Action
          </h2>
          <p className="text-white/40 max-w-xl mx-auto font-light">
            Transparent pricing for every feature
          </p>
        </div>
        
        <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] backdrop-blur-xl overflow-hidden">
          <div className="divide-y divide-white/[0.04]">
            {Object.entries(CREDIT_COSTS).map(([action, cost], index) => (
              <div
                key={action}
                className="flex items-center justify-between px-8 py-5 hover:bg-white/[0.02] transition-colors duration-300"
              >
                <span className="text-sm text-white/60 font-light capitalize">
                  {action.replace(/_/g, ' ')}
                </span>
                <div className="flex items-center gap-2 text-white font-light">
                  <Coins className="w-4 h-4 text-white/40" />
                  <span className="text-base font-mono">{cost}</span>
                  <span className="text-xs text-white/30 ml-1">credits</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Divider */}
      <div className="max-w-7xl mx-auto px-8 py-12">
        <div className="h-px bg-gradient-to-r from-transparent via-white/[0.08] to-transparent" />
      </div>

      {/* FAQ Section */}
      <div className="max-w-4xl mx-auto px-8 pb-32">
        <h2 className="text-3xl font-semibold text-center mb-16 text-white tracking-tight">
          Frequently Asked Questions
        </h2>
        <div className="space-y-8">
          <div className="p-8 rounded-2xl border border-white/[0.06] bg-white/[0.02] backdrop-blur-xl hover:bg-white/[0.03] transition-all duration-300">
            <h3 className="text-lg font-medium mb-4 text-white">
              How do credits work?
            </h3>
            <p className="text-white/50 font-light leading-relaxed">
              Credits are used for each action you perform - searching stocks, getting real-time quotes, AI analysis, etc. 
              Each action has a fixed credit cost. You get free credits monthly with your plan, 
              and can buy more anytime.
            </p>
          </div>
          <div className="p-8 rounded-2xl border border-white/[0.06] bg-white/[0.02] backdrop-blur-xl hover:bg-white/[0.03] transition-all duration-300">
            <h3 className="text-lg font-medium mb-4 text-white">
              Do credits expire?
            </h3>
            <p className="text-white/50 font-light leading-relaxed">
              Purchased credits never expire. Monthly free credits reset at the beginning of each billing cycle.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
