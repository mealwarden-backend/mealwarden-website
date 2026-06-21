import Navbar from '@/components/Navbar'
import Hero from '@/components/sections/Hero'
import MarqueeBar from '@/components/sections/Marquee'
import Features from '@/components/sections/Features'
import HowItWorks from '@/components/sections/HowItWorks'
import AIGuardians from '@/components/sections/AIGuardians'
import Pricing from '@/components/sections/Pricing'
import FAQ from '@/components/sections/FAQ'
import FinalCTA from '@/components/sections/FinalCTA'
import Footer from '@/components/sections/Footer'

export default function Home() {
  return (
    <main>
      <Navbar />
      <Hero />
      <MarqueeBar />
      <Features />
      <HowItWorks />
      <AIGuardians />
      <Pricing />
      <FAQ />
      <FinalCTA />
      <Footer />
    </main>
  )
}