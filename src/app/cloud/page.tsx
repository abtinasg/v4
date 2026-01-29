import { CloudNav, CloudHero, CloudFeatures, CloudPricing, CloudFooter } from '@/components/cloud'

export default function CloudPage() {
  return (
    <main className="min-h-screen bg-[#09090B] text-white antialiased">
      <CloudNav />
      <CloudHero />
      <CloudFeatures />
      <CloudPricing />
      <CloudFooter />
    </main>
  );
}
