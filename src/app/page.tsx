import { Nav, Hero, WhoItsFor, Features, Product, Workflows, MetricsLibrary, Pricing, Contact, Footer } from '@/components/landing-new'

export default function Home() {
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
    </main>
  )
}
