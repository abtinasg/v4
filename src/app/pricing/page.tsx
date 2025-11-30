import Link from 'next/link'
import { Metadata } from 'next'
import { ArrowLeft, Check, Coins, Gift } from 'lucide-react'
import { currentUser } from '@clerk/nextjs/server'
import { db } from '@/lib/db'
import { creditPackages } from '@/lib/db/schema'
import { eq, asc } from 'drizzle-orm'
import { CREDIT_COSTS } from '@/lib/credits/config'
import { generatePageMetadata } from '@/lib/seo'

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
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      {/* Navigation */}
      <nav className="border-b bg-background/50 backdrop-blur-sm sticky top-0 z-50">
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
          Pay only for what you use with our credit-based system.
        </p>
      </div>

      {/* Credit Packages */}
      <div className="max-w-7xl mx-auto px-6 py-16 border-t">
        <h2 className="text-2xl font-bold text-center mb-4">
          <Coins className="w-6 h-6 inline mr-2 text-emerald-500" />
          Credit Packages
        </h2>
        <p className="text-center text-muted-foreground mb-8 max-w-xl mx-auto">
          Need more credits? Buy credit packages anytime. Credits never expire!
        </p>
        
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {packages.map((pkg) => {
            const credits = parseFloat(pkg.credits)
            const bonus = parseFloat(pkg.bonusCredits)
            const price = parseFloat(pkg.price)
            const total = credits + bonus
            const pricePerCredit = price / total
            
            return (
              <div
                key={pkg.id}
                className={`relative rounded-xl border p-4 transition-all hover:shadow-lg hover:scale-105 ${
                  pkg.isPopular
                    ? 'border-emerald-500 bg-emerald-500/5 shadow-emerald-500/10'
                    : 'border-border bg-card'
                }`}
              >
                {pkg.isPopular && (
                  <div className="absolute -top-2 right-2 px-2 py-0.5 bg-emerald-500 text-white text-xs font-medium rounded-full">
                    Best Value
                  </div>
                )}

                <h3 className="font-bold mb-1">{pkg.name}</h3>
                
                <div className="text-2xl font-bold mb-2">
                  ${price}
                </div>
                
                <div className="space-y-1 text-sm mb-3">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Credits</span>
                    <span className="font-medium">{credits.toLocaleString()}</span>
                  </div>
                  {bonus > 0 && (
                    <div className="flex justify-between text-emerald-500">
                      <span className="flex items-center gap-1">
                        <Gift className="w-3 h-3" />
                        Bonus
                      </span>
                      <span className="font-medium">+{bonus.toLocaleString()}</span>
                    </div>
                  )}
                  <div className="flex justify-between border-t pt-1 mt-1">
                    <span className="font-medium">Total</span>
                    <span className="font-bold text-emerald-500">{total.toLocaleString()}</span>
                  </div>
                </div>
                
                <div className="text-xs text-muted-foreground text-center mb-3">
                  ${pricePerCredit.toFixed(4)}/credit
                </div>

                <button
                  className={`w-full py-2 text-sm rounded-lg font-medium transition-colors ${
                    pkg.isPopular
                      ? 'bg-emerald-500 text-white hover:bg-emerald-600'
                      : 'bg-accent text-foreground hover:bg-accent/80'
                  }`}
                >
                  Buy Now
                </button>
              </div>
            )
          })}
        </div>
      </div>

      {/* Credit Costs Table */}
      <div className="max-w-4xl mx-auto px-6 py-16 border-t">
        <h2 className="text-2xl font-bold text-center mb-8">
          Credit Costs per Action
        </h2>
        <div className="grid md:grid-cols-2 gap-4">
          {Object.entries(CREDIT_COSTS).map(([action, cost]) => (
            <div
              key={action}
              className="flex items-center justify-between p-3 rounded-lg bg-card border"
            >
              <span className="text-sm capitalize">
                {action.replace(/_/g, ' ')}
              </span>
              <div className="flex items-center gap-1 text-emerald-500 font-medium">
                <Coins className="w-4 h-4" />
                {cost}
              </div>
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
              How do credits work?
            </h3>
            <p className="text-muted-foreground">
              Credits are used for each action you perform - searching stocks, getting real-time quotes, AI analysis, etc. 
              Each action has a fixed credit cost. You get free credits monthly with your plan, 
              and can buy more anytime.
            </p>
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-2">
              Do credits expire?
            </h3>
            <p className="text-muted-foreground">
              Purchased credits never expire. Monthly free credits reset at the beginning of each billing cycle.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
