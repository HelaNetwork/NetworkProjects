import { useEffect, useRef } from 'react'
import './HowItWorks.css'

const steps = [
  {
    number: '01',
    title: 'Agent Acts',
    description: 'An autonomous agent performs an action or makes a decision in a real-world environment.',
  },
  {
    number: '02',
    title: 'Decision Logged',
    description: 'The decision, context, and reasoning are captured in a structured, immutable format.',
  },
  {
    number: '03',
    title: 'Explanation Generated',
    description: 'A human-readable explanation is auto-generated, making complex logic transparent.',
  },
  {
    number: '04',
    title: 'Verified On-Chain',
    description: 'The record is cryptographically verified and stored in a tamper-proof decentralized ledger.',
  },
  {
    number: '05',
    title: 'Governed by DAO',
    description: 'Stakeholders and DAOs can audit, challenge, or override decisions transparently.',
  },
]

export default function HowItWorks() {
  const sectionRef = useRef(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('how__visible')
          }
        })
      },
      { threshold: 0.1 }
    )

    const items = sectionRef.current?.querySelectorAll('.how__step, .how__header')
    items?.forEach((item) => observer.observe(item))

    return () => observer.disconnect()
  }, [])

  return (
    <section className="how" id="how-it-works" ref={sectionRef}>
      <div className="how__inner container">
        {/* Left column empty for 3D shape */}
        <div className="how__visual-col"></div>

        <div className="how__content-col">
          <div className="how__header">
            <h2 className="how__title">
              Protocol <span className="how__title-serif">In Action</span>
            </h2>
            <p className="how__subtitle">
              From every corner of the network, we enable transparent accountability.
              Each connection represents progress, every verification drives trust
              forward into uncharted territories.
            </p>
          </div>

          <div className="how__steps">
            <div className="how__timeline" />
            {steps.map((step, index) => (
              <div
                key={index}
                className="how__step"
                style={{ transitionDelay: `${index * 0.12}s` }}
              >
                <div className="how__step-number">{step.number}</div>
                <div className="how__step-dot" />
                <div className="how__step-content">
                  <h3 className="how__step-title">{step.title}</h3>
                  <p className="how__step-desc">{step.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
