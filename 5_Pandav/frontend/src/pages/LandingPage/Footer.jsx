import './Footer.css'

export default function Footer() {
  return (
    <footer className="footer" id="footer">
      <div className="footer__cta container">
        <h2 className="footer__cta-title">
          Let's build <span className="footer__cta-serif">trust</span> together.
        </h2>
        <a href="#hero" className="footer__cta-btn">
          Get Started
        </a>
      </div>

      <div className="footer__inner container">
        <div className="footer__brand">
          <div className="footer__logo">
            <svg width="24" height="24" viewBox="0 0 28 28" fill="none">
              <rect x="2" y="2" width="24" height="24" rx="4" stroke="#6366f1" strokeWidth="2" fill="none" opacity="0.6"/>
              <rect x="6" y="6" width="16" height="16" rx="2" stroke="#818cf8" strokeWidth="1.5" fill="none" opacity="0.4"/>
              <circle cx="14" cy="14" r="3" fill="#6366f1"/>
            </svg>
            <span>TAAP</span>
          </div>
          <p className="footer__tagline">
            Transparent Agent Accountability Protocol.<br />
            Enabling trust in autonomous systems.
          </p>
          {/* Decorative status indicator — not live data */}
          <div className="footer__clock" aria-hidden="true">
            <span className="footer__clock-dot"></span>
            Network Status
          </div>
        </div>

        <div className="footer__links">
          <div className="footer__col">
            <h4 className="footer__col-title">Protocol</h4>
            <a href="#features">Smart Contracts</a>
            <a href="#how-it-works">Decision Ledgers</a>
            <a href="#architecture">Governance</a>
            <span style={{cursor:'default', color:'inherit'}}>Verification</span>
          </div>
          <div className="footer__col">
            <h4 className="footer__col-title">Developers</h4>
            <span style={{cursor:'default', color:'inherit'}}>Documentation</span>
            <span style={{cursor:'default', color:'inherit'}}>GitHub Repo</span>
            <span style={{cursor:'default', color:'inherit'}}>SDK Reference</span>
            <span style={{cursor:'default', color:'inherit'}}>API Endpoints</span>
          </div>
          <div className="footer__col">
            <h4 className="footer__col-title">Resources</h4>
            <span style={{cursor:'default', color:'inherit'}}>Whitepaper</span>
            <span style={{cursor:'default', color:'inherit'}}>Case Studies</span>
            <span style={{cursor:'default', color:'inherit'}}>Blog</span>
            <span style={{cursor:'default', color:'inherit'}}>Audits</span>
          </div>
          <div className="footer__col">
            <h4 className="footer__col-title">Connect</h4>
            <span style={{cursor:'default', color:'inherit'}}>Twitter / X</span>
            <span style={{cursor:'default', color:'inherit'}}>Discord</span>
            <span style={{cursor:'default', color:'inherit'}}>Telegram</span>
            <span style={{cursor:'default', color:'inherit'}}>Contact Us</span>
          </div>
        </div>
      </div>
      <div className="footer__bottom container">
        <p>&copy; 2026 TAAP Protocol. Built by Team 5 Pandav.</p>
      </div>
    </footer>
  )
}
