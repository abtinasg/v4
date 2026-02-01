import Link from "next/link";
import { Nav, Hero, WhoItsFor, Features, Product, Workflows, MetricsLibrary, Pricing, Contact, Footer, ProductPreview } from '@/components/landing-new'

export default function Page() {
  return (
    <main className="min-h-screen bg-[#0D0F12] text-white antialiased">
      <Nav />
      <Hero />
      <WhoItsFor />
      <Features />
      <ProductPreview />
      <Product />
      <Workflows />
      <MetricsLibrary />
      <Pricing />
      <Contact />
      <Footer />
    </main>
  )
}