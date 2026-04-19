import { useState, useEffect } from 'react'
import './DotNav.css'

const sections = [
  { id: 'hero', label: 'Home' },
  { id: 'features', label: 'Features' },
  { id: 'how-it-works', label: 'How It Works' },
  { id: 'architecture', label: 'Architecture' },
  { id: 'stats', label: 'Stats' },
]

export default function DotNav() {
  const [active, setActive] = useState('hero')

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActive(entry.target.id)
          }
        })
      },
      { threshold: 0.3, rootMargin: '-10% 0px -10% 0px' }
    )

    sections.forEach(({ id }) => {
      const el = document.getElementById(id)
      if (el) observer.observe(el)
    })

    return () => observer.disconnect()
  }, [])

  const handleClick = (id) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <nav className="dot-nav" aria-label="Section navigation">
      {sections.map(({ id, label }) => (
        <button
          key={id}
          className={`dot-nav__item ${active === id ? 'dot-nav__item--active' : ''}`}
          onClick={() => handleClick(id)}
          aria-label={`Navigate to ${label}`}
          title={label}
        >
          <span className="dot-nav__dot" />
          <span className="dot-nav__label">{label}</span>
        </button>
      ))}
    </nav>
  )
}
