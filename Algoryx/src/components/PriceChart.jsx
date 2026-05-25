import { useEffect, useState } from 'react'

export default function PriceChart({ token }) {
  const [price, setPrice] = useState(null)
  const [history, setHistory] = useState([])

  const PRICES = { ETH: 2354, USDC: 1, USDT: 1, DAI: 1, WBTC: 67000 }

  useEffect(() => {
    const base = PRICES[token] ?? 100
    setPrice(base)
    // Generate fake sparkline data
    const pts = Array.from({ length: 24 }, (_, i) => ({
      t: i,
      v: base * (0.97 + Math.random() * 0.06),
    }))
    setHistory(pts)
  }, [token])

  if (!price) return null

  const min = Math.min(...history.map(p => p.v))
  const max = Math.max(...history.map(p => p.v))
  const range = max - min || 1
  const W = 320, H = 80

  const points = history.map((p, i) => {
    const x = (i / (history.length - 1)) * W
    const y = H - ((p.v - min) / range) * H
    return `${x},${y}`
  }).join(' ')

  return (
    <div style={styles.wrap}>
      <div style={styles.priceRow}>
        <span style={styles.price}>${price.toLocaleString()}</span>
        <span style={styles.token}>{token}/USD</span>
      </div>
      <svg width="100%" height={H} viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" style={styles.svg}>
        <defs>
          <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%"   stopColor="rgba(0,255,136,0.3)" />
            <stop offset="100%" stopColor="rgba(0,255,136,0)"   />
          </linearGradient>
        </defs>
        <polyline
          points={points}
          fill="none"
          stroke="var(--green)"
          strokeWidth="1.5"
          style={{ filter: 'drop-shadow(0 0 4px rgba(0,255,136,0.6))' }}
        />
      </svg>
      <div style={styles.rangeRow}>
        <span style={styles.rangeLabel}>24H LOW <span style={styles.rangeVal}>${min.toFixed(0)}</span></span>
        <span style={styles.rangeLabel}>24H HIGH <span style={styles.rangeVal}>${max.toFixed(0)}</span></span>
      </div>
    </div>
  )
}

const styles = {
  wrap:       { width: '100%' },
  priceRow:   { display: 'flex', alignItems: 'baseline', gap: 8, marginBottom: 10 },
  price:      { fontFamily: 'Orbitron, sans-serif', fontSize: 22, fontWeight: 700, color: 'var(--green)', textShadow: '0 0 10px var(--glow-g)' },
  token:      { fontFamily: 'Share Tech Mono, monospace', fontSize: 11, color: 'rgba(0,255,136,0.55)', letterSpacing: 2 },
  svg:        { display: 'block', borderBottom: '1px solid rgba(0,255,136,0.1)' },
  rangeRow:   { display: 'flex', justifyContent: 'space-between', marginTop: 8 },
  rangeLabel: { fontFamily: 'Share Tech Mono, monospace', fontSize: 9, color: 'rgba(0,255,136,0.45)', letterSpacing: 2 },
  rangeVal:   { color: 'var(--green)', marginLeft: 4 },
}