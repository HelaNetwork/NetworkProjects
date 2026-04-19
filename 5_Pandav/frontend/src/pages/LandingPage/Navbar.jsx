import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { auth } from '../../../firebase'
import { onAuthStateChanged } from 'firebase/auth'
import './Navbar.css'

const navLinks = [
  { label: 'Features', href: '#features' },
  { label: 'How It Works', href: '#how-it-works' },
  { label: 'Architecture', href: '#architecture' },
]

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [user, setUser] = useState(null)
  
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, setUser)
    return () => unsubscribe()
  }, [])

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50)
    }
    window.addEventListener('scroll', handleScroll, { passive: true })
    handleScroll() // Set initial state based on current scroll position
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <nav className={`navbar ${scrolled ? 'navbar--scrolled' : ''}`} id="navbar">
      <div className="navbar__inner container">
        <a href="#" className="navbar__logo">
          <div className="navbar__logo-icon">
            <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
              <rect x="2" y="2" width="24" height="24" rx="4" stroke="#6366f1" strokeWidth="2" fill="none" opacity="0.6" />
              <rect x="6" y="6" width="16" height="16" rx="2" stroke="#818cf8" strokeWidth="1.5" fill="none" opacity="0.4" />
              <circle cx="14" cy="14" r="3" fill="#6366f1" />
            </svg>
          </div>
          <span className="navbar__logo-text">TAAP</span>
        </a>

        <div className={`navbar__links ${mobileOpen ? 'navbar__links--open' : ''}`}>
          {navLinks.map((link) => (
            <a
              key={link.label}
              href={link.href}
              className="navbar__link"
              onClick={() => setMobileOpen(false)}
            >
              {link.label}
            </a>
          ))}
          
          {user && (
            <Link
              to="/dashboard"
              className="navbar__link"
              onClick={() => setMobileOpen(false)}
              style={{ color: '#818cf8', fontWeight: 'bold' }}
            >
              Dashboard
            </Link>
          )}

        </div>

        {/* Extreme Right CTA */}
        {!user ? (
          <Link to="/login" className="navbar__cta">
            Login
          </Link>
        ) : (
          <Link to="/dashboard" className="navbar__cta" style={{ background: '#6366f1', color: 'white', border: 'none' }}>
            Go to Dashboard ⚡
          </Link>
        )}

        <button
          className={`navbar__hamburger ${mobileOpen ? 'navbar__hamburger--open' : ''}`}
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label="Toggle navigation menu"
          aria-expanded={mobileOpen}
          id="nav-toggle"
        >
          <span />
          <span />
          <span />
        </button>
      </div>
    </nav>
  )
}
