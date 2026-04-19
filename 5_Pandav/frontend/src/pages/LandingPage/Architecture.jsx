import { useEffect, useRef } from 'react'
import './Architecture.css'

const layers = [
  {
    title: 'Agent Layer',
    description: 'Autonomous agents performing critical tasks and decisions',
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <rect x="4" y="4" width="16" height="16" rx="2" />
        <circle cx="12" cy="12" r="4" />
        <line x1="12" y1="2" x2="12" y2="4" />
        <line x1="12" y1="20" x2="12" y2="22" />
        <line x1="2" y1="12" x2="4" y2="12" />
        <line x1="20" y1="12" x2="22" y2="12" />
      </svg>
    ),
  },
  {
    title: 'Decision Logger',
    description: 'Structured, immutable capture of every action and context',
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
        <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
        <line x1="8" y1="7" x2="16" y2="7" />
        <line x1="8" y1="11" x2="14" y2="11" />
      </svg>
    ),
  },
  {
    title: 'Explainability Engine',
    description: 'Transforms reasoning into human-readable explanations',
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <polygon points="12 2 2 7 12 12 22 7 12 2" />
        <polyline points="2 17 12 22 22 17" />
        <polyline points="2 12 12 17 22 12" />
      </svg>
    ),
  },
  {
    title: 'Verification Module',
    description: 'Cryptographic proof and on-chain verification of records',
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="20 6 9 17 4 12" />
        <circle cx="12" cy="12" r="10" />
      </svg>
    ),
  },
  {
    title: 'DAO Governance',
    description: 'Community-driven oversight, challenge, and override mechanisms',
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>
    ),
  },
]

export default function Architecture() {
  const sectionRef = useRef(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('arch__visible')
          }
        })
      },
      { threshold: 0.1 }
    )

    const items = sectionRef.current?.querySelectorAll('.arch__layer, .arch__header, .arch__metrics')
    items?.forEach((item) => observer.observe(item))

    return () => observer.disconnect()
  }, [])

  return (
    <section className="arch" id="architecture" ref={sectionRef}>
      <div className="arch__inner container">
        {/* Left column empty for 3D shape */}
        <div className="arch__visual-col"></div>

        <div className="arch__content-col">
          <div className="arch__header">
            <h2 className="arch__title">
              Architecture <span className="arch__title-serif">Overview</span>
            </h2>
            <p className="arch__subtitle">
              A modular, layered protocol stack designed for scalability,
              security, and seamless integration with any autonomous agent framework.
            </p>
          </div>

          <div className="arch__stack">
            {layers.map((layer, index) => (
              <div key={index} className="arch__layer-wrapper">
                <div
                  className="arch__layer"
                  style={{ transitionDelay: `${index * 0.1}s` }}
                >
                  <div className="arch__layer-icon">{layer.icon}</div>
                  <div className="arch__layer-content">
                    <h3 className="arch__layer-title">{layer.title}</h3>
                    <p className="arch__layer-desc">{layer.description}</p>
                  </div>
                  <div className="arch__layer-index">
                    {String(index + 1).padStart(2, '0')}
                  </div>
                </div>
                {index < layers.length - 1 && (
                  <div className="arch__connector">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                      <path d="M12 5v14M5 12l7 7 7-7" stroke="var(--accent)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" opacity="0.4" />
                    </svg>
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="arch__metrics">
            <h3 className="arch__metrics-title">Core Protocol Metrics</h3>
            <div className="arch__metrics-grid">
              <div className="arch__metric-card">
                <div className="arch__metric-val">150K+</div>
                <div className="arch__metric-label">Lines of Code</div>
              </div>
              <div className="arch__metric-card">
                <div className="arch__metric-val">98%</div>
                <div className="arch__metric-label">Test Coverage</div>
              </div>
              <div className="arch__metric-card">
                <div className="arch__metric-val">Passed</div>
                <div className="arch__metric-label">CertiK Audit</div>
              </div>
              <div className="arch__metric-card">
                <div className="arch__metric-val">100%</div>
                <div className="arch__metric-label">Open Source</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
