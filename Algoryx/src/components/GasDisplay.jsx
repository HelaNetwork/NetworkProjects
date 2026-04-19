import { useState, useEffect } from 'react'
import { getGasPrice } from '../services/gas.js'

export default function GasDisplay() {
  const [gas, setGas] = useState(null)

  useEffect(() => {
    getGasPrice().then(setGas).catch(() => {})
    const id = setInterval(() => getGasPrice().then(setGas).catch(() => {}), 30000)
    return () => clearInterval(id)
  }, [])

  if (!gas) return null

  return (
    <div style={styles.row} data-tooltip="Current Ethereum gas price">
      <div style={styles.dot} />
      <span style={styles.label}>GAS</span>
      <span style={styles.val}>{gas}</span>
      <span style={styles.unit}>GWEI</span>
    </div>
  )
}

const styles = {
  row:   { display: 'flex', alignItems: 'center', gap: 5, cursor: 'default' },
  dot:   { width: 5, height: 5, borderRadius: '50%', background: 'var(--yellow)', boxShadow: '0 0 8px rgba(255,215,0,0.7)', animation: 'glow-pulse 2s ease infinite' },
  label: { fontFamily: 'Orbitron, sans-serif',        fontSize: 8,  color: 'rgba(255,215,0,0.7)',  letterSpacing: 3 },
  val:   { fontFamily: 'Orbitron, monospace',          fontSize: 12, color: 'var(--yellow)', textShadow: '0 0 10px rgba(255,215,0,0.55)' },
  unit:  { fontFamily: 'Share Tech Mono, monospace',   fontSize: 8,  color: 'rgba(255,215,0,0.55)', letterSpacing: 2 },
}