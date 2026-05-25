import { useEffect, useState } from 'react'
import './Hero.css'

function AnimatedCounter({ value, prefix = '', suffix = '', decimals = 0 }) {
  const [count, setCount] = useState(0)

  useEffect(() => {
    let start = 0
    const duration = 2000
    const startTime = performance.now()
    let rafId

    const animate = (currentTime) => {
      const elapsed = currentTime - startTime
      const progress = Math.min(elapsed / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 3)
      start = eased * value

      setCount(start)

      if (progress < 1) {
        rafId = requestAnimationFrame(animate)
      }
    }
    rafId = requestAnimationFrame(animate)

    return () => cancelAnimationFrame(rafId)
  }, [value])

  return (
    <span className="hero__stat-number">
      {prefix}{count.toFixed(decimals)}{suffix}
    </span>
  )
}

export default function Hero() {
  return (
    <section className="hero" id="hero">
      <div className="hero__watermark">TRANSPARENT</div>
      <div className="hero__bg-grid" />
      <div className="hero__inner container">
        
        {/* Main centered title */}
        <div className="hero__title-container">
          <h1 className="hero__title animate-fade-in-up">
            <span className="hero__title-sans">Transparent</span>{' '}
            <span className="hero__title-serif">Agent</span><br/>
            <span className="hero__title-light">Accountability</span>
          </h1>
        </div>

        {/* Bottom left content */}
        <div className="hero__bottom-left">
          <div className="hero__badge animate-fade-in-up delay-1">
            <span className="hero__badge-dot" />
            Decentralized Protocol
          </div>

          <p className="hero__description animate-fade-in-up delay-2">
            We empower organizations with AI that turns complex challenges into real-world outcomes. 
            A robust protocol enabling transparent logging and explainability.
          </p>

          <div className="hero__actions animate-fade-in-up delay-3">
            <a href="#features" className="hero__btn hero__btn--primary" id="explore-protocol-btn">
              Explore Protocol
            </a>
          </div>
        </div>

        {/* Bottom right stats */}
        <div className="hero__bottom-right animate-fade-in-up delay-4">
          <div className="hero__stat">
            <AnimatedCounter value={99.9} suffix="%" decimals={1} />
            <span className="hero__stat-label">Uptime</span>
          </div>
          <div className="hero__stat">
            <AnimatedCounter value={100} suffix="%" decimals={0} />
            <span className="hero__stat-label">Tamper-Proof</span>
          </div>
          <div className="hero__stat">
            <AnimatedCounter value={50} prefix="<" suffix="ms" decimals={0} />
            <span className="hero__stat-label">Latency</span>
          </div>
        </div>
      </div>

      <div className="hero__scroll-indicator animate-fade-in delay-6">
        <div className="hero__scroll-line" />
        <span>Scroll to explore</span>
      </div>
    </section>
  )
}
