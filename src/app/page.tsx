import { Nav, Hero, Product, Workflows, Pricing, Footer } from '@/components/landing-new'

export default function Home() {
  return (
    <main className="min-h-screen bg-[#09090B] text-white antialiased">
      <Nav />
      <Hero />
      <Product />
      <Workflows />
      <Pricing />
      <Footer />
    </main>
  )
}
