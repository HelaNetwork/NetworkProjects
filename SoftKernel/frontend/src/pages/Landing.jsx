import { useMemo, useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useWallet } from '../context/WalletContext';
import { useDecimal } from '../context/DecimalContext';
import { ethers } from 'ethers';

function Starfield() {
  const stars = useMemo(() => {
    return Array.from({ length: 80 }, (_, i) => ({
      id: i,
      left: Math.random() * 100,
      top: Math.random() * 100,
      size: Math.random() * 2 + 0.5,
      duration: Math.random() * 4 + 2,
      delay: Math.random() * 4,
    }));
  }, []);

  return (
    <div className="starfield">
      {stars.map((s) => (
        <div
          key={s.id}
          className="star"
          style={{
            left: `${s.left}%`,
            top: `${s.top}%`,
            width: `${s.size}px`,
            height: `${s.size}px`,
            animationDuration: `${s.duration}s`,
            animationDelay: `${s.delay}s`,
          }}
        />
      ))}
    </div>
  );
}

export default function Landing() {
  const { contracts } = useWallet();
  const { formatValue } = useDecimal();
  const [globalStats, setGlobalStats] = useState(null);

  useEffect(() => {
    const loadGlobalStats = async () => {
      if (!contracts.salaryStream) return;
      try {
        const stats = await contracts.salaryStream.getGlobalStats();
        setGlobalStats({
          totalStreams: Number(stats[0]),
          activeStreams: Number(stats[1]),
          totalReserved: formatValue(stats[2]),
          totalPaid: formatValue(stats[3]),
          totalBonuses: Number(stats[4]),
          bonusesPaid: Number(stats[5]),
        });
      } catch (err) {
        console.error('Failed to load global stats:', err);
      }
    };
    loadGlobalStats();
    const interval = setInterval(loadGlobalStats, 15000);
    return () => clearInterval(interval);
  }, [contracts.salaryStream]);

  return (
    <div className="page">
      <Starfield />
      <div className="landing">
        <div className="landing-hero">
          <div className="landing-badge" style={{ borderColor: 'var(--accent)', color: 'var(--accent)' }}>Temporal Finance Engine</div>
          <h1 className="landing-title">
            PayStream: Streaming Salary Through Time
          </h1>
          <p className="landing-subtitle">
            Real-time payroll powered by blockchain. Watch earnings flow every second,
            withdraw anytime, all on HeLa Testnet.
          </p>
          <div className="landing-buttons">
            <Link to="/admin" className="landing-btn landing-btn-primary">
              Enter Admin Console
            </Link>
            <Link to="/employee" className="landing-btn landing-btn-secondary">
              Enter Employee Portal
            </Link>
          </div>

          <div className="landing-features">
            <div className="landing-feature">
              <div className="landing-feature-icon" style={{ color: 'var(--accent)', borderColor: 'var(--accent)' }}>01</div>
              <div className="landing-feature-title" style={{ color: 'var(--accent)' }}>Per-Second Streaming</div>
              <div className="landing-feature-text">
                Salary flows every second, not monthly
              </div>
            </div>
            <div className="landing-feature">
              <div className="landing-feature-icon" style={{ color: 'var(--accent)', borderColor: 'var(--accent)' }}>02</div>
              <div className="landing-feature-title" style={{ color: 'var(--accent)' }}>Treasury Custody</div>
              <div className="landing-feature-text">
                Funds secured in on-chain treasury
              </div>
            </div>
            <div className="landing-feature">
              <div className="landing-feature-icon" style={{ color: 'var(--accent)', borderColor: 'var(--accent)' }}>03</div>
              <div className="landing-feature-title" style={{ color: 'var(--accent)' }}>Auto Tax Redirect</div>
              <div className="landing-feature-text">
                Tax deducted and redirected automatically
              </div>
            </div>
          </div>

          {/* Live Platform Statistics */}
          {globalStats && (
            <div style={{
              marginTop: '3rem',
              padding: '2rem',
              background: 'var(--bg-card)',
              border: '1px solid var(--accent)',
              borderRadius: 'var(--radius)',
              boxShadow: '0 0 20px rgba(0, 255, 163, 0.1)',
            }}>
              <div style={{ 
                textAlign: 'center', 
                marginBottom: '1.5rem',
                fontSize: '0.6875rem',
                fontWeight: 600,
                color: 'var(--accent)',
                textTransform: 'uppercase',
                letterSpacing: '0.1em'
              }}>
                Live Platform Statistics
              </div>
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
                gap: '1.5rem',
              }}>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--accent)', marginBottom: '0.25rem' }}>
                    {globalStats.activeStreams}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>
                    Active Streams
                  </div>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--green)', marginBottom: '0.25rem' }}>
                    {parseFloat(globalStats.totalPaid).toFixed(2)}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>
                    HLUSD Paid
                  </div>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '2rem', fontWeight: 700, color: '#00d4ff', marginBottom: '0.25rem' }}>
                    {parseFloat(globalStats.totalReserved).toFixed(2)}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>
                    HLUSD Reserved
                  </div>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '2rem', fontWeight: 700, color: '#a78bfa', marginBottom: '0.25rem' }}>
                    {globalStats.totalBonuses}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>
                    Bonuses Scheduled
                  </div>
                </div>
              </div>
              <div style={{ 
                marginTop: '1rem', 
                textAlign: 'center', 
                fontSize: '0.6875rem', 
                color: 'var(--text-dim)',
              }}>
                Real-time on-chain data -- Updates every 15s
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
