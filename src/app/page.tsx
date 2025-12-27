import Link from "next/link";
import { Nav, Hero, WhoItsFor, Features, Product, Workflows, MetricsLibrary, Pricing, Contact, Footer } from '@/components/landing-new'

export default function Page() {
  return (
    <main className="min-h-screen bg-[#09090B] text-white antialiased">
      <Nav />
      <Hero />
      <WhoItsFor />
      <Features />
      <Product />
      <Workflows />
      <MetricsLibrary />
      <Pricing />
      <Contact />
      <Footer />
      <Link href="/journals" className="btn">Go to Journal Filter Tool</Link>
    </main>
  )
}
