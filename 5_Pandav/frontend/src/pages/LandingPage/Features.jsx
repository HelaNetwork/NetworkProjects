import { useEffect, useRef, useState } from 'react'
import './Features.css'

const features = [
  {
    title: 'Structured Decision Logging',
    description:
      'Every agent decision is logged with full context, reasoning chains, and metadata in an immutable, tamper-proof ledger accessible to all stakeholders.',
    services: ['Immutable Ledger', 'Context Capture', 'Real-time Sync'],
    tools: ['Ethereum', 'IPFS', 'GraphQL', 'PostgreSQL', 'Redis']
  },
  {
    title: 'Human-Readable Explainability',
    description:
      'Transform complex agent reasoning into clear, understandable explanations. Every decision comes with a natural-language rationale that any stakeholder can review.',
    services: ['NLP Translation', 'Logic Trees', 'Stakeholder Dashboards'],
    tools: ['OpenAI', 'LangChain', 'LlamaIndex', 'React', 'D3.js']
  },
  {
    title: 'Decentralized Verification',
    description:
      'Enable trustless auditing and verification of agent behavior across distributed networks. Users and DAOs can challenge or override any decision transparently.',
    services: ['On-Chain Proofs', 'DAO Governance', 'Dispute Resolution'],
    tools: ['Smart Contracts', 'Solidity', 'Zero-Knowledge Proofs', 'Hardhat']
  },
]

export default function Features() {
  const sectionRef = useRef(null)
  const [activeCard, setActiveCard] = useState(0)

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('features__visible')
          }
        })
      },
      { threshold: 0.1 }
    )

    const header = sectionRef.current?.querySelector('.features__header')
    if (header) observer.observe(header)

    return () => observer.disconnect()
  }, [])

  return (
    <section className="features" id="features" ref={sectionRef}>
      <div className="features__inner container">
        {/* Left column empty for 3D shape */}
        <div className="features__visual-col"></div>

        <div className="features__content-col">
          <div className="features__header">
            <h2 className="features__title">
              Our <span className="features__title-serif">Services</span>
            </h2>
            <p className="features__subtitle">
              We empower organizations with AI that turns complex challenges into real-world outcomes.
            </p>
          </div>

          <div className="features__cards">
            {features.map((feature, index) => {
              const isActive = activeCard === index;
              return (
                <div
                  key={index}
                  className={`features__card ${isActive ? 'features__card--active' : ''}`}
                  onMouseEnter={() => setActiveCard(index)}
                >
                  <div className="features__card-top">
                    <span className="features__card-number">
                      {String(index + 1).padStart(2, '0')}
                    </span>
                    <h3 className="features__card-title">{feature.title}</h3>
                  </div>
                  
                  <div className="features__card-body">
                    <p className="features__card-desc">{feature.description}</p>
                    <div className="features__card-tags">
                      {feature.services.map(s => <span key={s} className="features__card-tag">{s}</span>)}
                    </div>
                    <div className="features__card-tools">
                      {feature.tools.map(t => (
                        <div key={t} className="features__card-tool">
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M5 12h14M12 5l7 7-7 7"/>
                          </svg>
                          {t}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </section>
  )
}
