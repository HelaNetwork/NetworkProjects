import Navbar from './Navbar'
import Hero from './Hero'
import Marquee from './Marquee'
import Features from './Features'
import TrustBar from './TrustBar'
import HowItWorks from './HowItWorks'
import UseCases from './UseCases'
import Architecture from './Architecture'
import Footer from './Footer'
import DotNav from './DotNav'
import ParticleField from './ParticleField'
import './LandingPage.css'

export default function LandingPage() {
  return (
    <div className="landing-page">
      <ParticleField />
      
      <div className="content-layer">
        <Navbar />
        <Hero />
        <Marquee />
        <Features />
        <TrustBar />
        <HowItWorks />
        <UseCases />
        <Architecture />
        <Footer />
        <DotNav />
      </div>
    </div>
  )
}
