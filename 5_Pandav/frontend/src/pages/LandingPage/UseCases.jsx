import { useEffect, useRef, useState } from 'react'
import './UseCases.css'

const usecases = [
  {
    title: 'Autonomous Trading Agents',
    description:
      'DeFi trading bots execute millions of transactions per second. TAAP logs every strategy decision, allowing DAOs to audit risk parameters.',
    tags: ['DeFi', 'Finance', 'Risk'],
    services: ['Strategy Logging', 'Risk Auditing', 'DAO Compliance', 'Real-time Monitoring']
  },
  {
    title: 'Healthcare Decision Systems',
    description:
      'AI systems diagnosing patients require perfect transparency. TAAP translates neural network decisions into human-readable medical rationale.',
    tags: ['MedTech', 'Compliance', 'FDA'],
    services: ['Diagnosis Logging', 'NLP Rationale', 'FDA Compliance', 'Audit Trails']
  },
  {
    title: 'Supply Chain Automation',
    description:
      'Logistics agents re-routing shipments in real-time. TAAP provides an immutable ledger of why a shipment was delayed or rerouted.',
    tags: ['Logistics', 'IoT', 'Verification'],
    services: ['Route Logging', 'Dispute Prevention', 'IoT Integration', 'Multi-Party Audit']
  },
]

export default function UseCases() {
  const sectionRef = useRef(null)
  const [activeCase, setActiveCase] = useState(0)

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('usecases__visible')
          }
        })
      },
      { threshold: 0.1 }
    )

    const section = sectionRef.current
    if (section) observer.observe(section)

    return () => observer.disconnect()
  }, [])

  return (
    <section className="usecases" id="use-cases" ref={sectionRef}>
      <div className="usecases__top container">
        <h2 className="usecases__title">
          Real-World <span className="usecases__title-serif">Applications</span>
        </h2>
        <p className="usecases__subtitle">
          Where autonomous agents meet critical infrastructure, TAAP provides the necessary layer of trust.
        </p>
      </div>

      <div className="usecases__accordion container">
        {usecases.map((uc, index) => {
          const isActive = activeCase === index;
          const panelId = `usecase-panel-${index}`;
          return (
            <div
              key={index}
              className={`usecases__card ${isActive ? 'usecases__card--active' : ''}`}
              onMouseEnter={() => setActiveCase(index)}
              tabIndex={0}
              role="button"
              aria-expanded={isActive}
              aria-controls={panelId}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault()
                  setActiveCase(index)
                }
              }}
            >
              {/* Collapsed view: big number + title at bottom */}
              <div className="usecases__card-collapsed">
                <div className="usecases__card-head">
                  <span className="usecases__card-number">
                    {String(index + 1).padStart(2, '0')}
                  </span>
                  <svg className="usecases__card-arrow" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="7" y1="17" x2="17" y2="7" />
                    <polyline points="7 7 17 7 17 17" />
                  </svg>
                </div>
                <h3 className="usecases__card-collapsed-title">{uc.title}</h3>
                {/* Dot matrix decoration */}
                <div className="usecases__card-dots" />
              </div>

              {/* Expanded view: full content */}
              <div
                className="usecases__card-expanded"
                id={panelId}
                role="region"
                aria-label={uc.title}
              >
                <div className="usecases__card-head">
                  <h3 className="usecases__card-title">{uc.title}</h3>
                  <svg className="usecases__card-arrow" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="7" y1="17" x2="17" y2="7" />
                    <polyline points="7 7 17 7 17 17" />
                  </svg>
                </div>

                <p className="usecases__card-desc">{uc.description}</p>

                <div className="usecases__card-footer">
                  <div className="usecases__card-services">
                    <span className="usecases__card-services-label">Capabilities</span>
                    {uc.services.map(s => (
                      <span key={s} className="usecases__card-service">{s}</span>
                    ))}
                  </div>
                  <div className="usecases__card-tags-col">
                    <span className="usecases__card-tags-label">Domain</span>
                    <div className="usecases__card-tags">
                      {uc.tags.map(tag => <span key={tag} className="usecases__card-tag">{tag}</span>)}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </section>
  )
}
