import {
  NavigationPremium,
  HeroPremium,
  FeaturesPremium,
  MarketPreview,
  AIPreview,
  PricingPremium,
  CTAPremium,
  FooterPremium
} from '@/components/landing'

export default function Home() {
  return (
    <main className="bg-[#030508] min-h-screen antialiased">
      <NavigationPremium />
      <HeroPremium />
      <FeaturesPremium />
      <MarketPreview />
      <AIPreview />
      <PricingPremium />
      <CTAPremium />
      <FooterPremium />
    </main>
  )
}
