import { useState } from 'react'

const EXAMPLES = [
  'Convert 1 ETH to USDC',
  'Swap 0.5 ETH to DAI',
  'Get WBTC with 2 ETH',
  'Exchange 100 USDC to ETH',
]

export default function SwapInput({ onSubmit, disabled }) {
  const [text, setText] = useState('')

  function handleSubmit(e) {
    e.preventDefault()
    if (!text.trim()) return
    onSubmit(text.trim())
  }

  return (
    <div style={styles.wrap}>
      <form onSubmit={handleSubmit} style={styles.form}>
        <span style={styles.prompt}>&gt;_</span>
        <input
          value={text}
          onChange={e => setText(e.target.value)}
          placeholder="enter swap intent..."
          disabled={disabled}
          style={styles.input}
          className="swap-input"
          autoFocus
        />
        <button type="submit" disabled={disabled || !text.trim()} style={styles.btn} className="btn-glow">
          EXECUTE
        </button>
      </form>
      <div style={styles.chips}>
        {EXAMPLES.map(ex => (
          <button key={ex} onClick={() => { setText(ex); onSubmit(ex) }} style={styles.chip} className="btn-glow">
            ▸ {ex}
          </button>
        ))}
      </div>
    </div>
  )
}

const styles = {
  wrap:   { width: '100%' },
  form:   { display: 'flex', alignItems: 'center', gap: 8, width: '100%' },
  prompt: { fontFamily: 'Share Tech Mono, monospace', fontSize: 16, color: 'var(--green)', textShadow: '0 0 8px rgba(0,255,136,0.7)', flexShrink: 0 },
  input:  {
    flex: 1, padding: '11px 14px', borderRadius: 3,
    border: '1px solid rgba(0,255,136,0.25)',
    background: 'rgba(0,255,136,0.035)',
    color: 'var(--text)', fontSize: 13,
    outline: 'none', letterSpacing: 0.5,
    transition: 'all 0.2s ease',
    boxShadow: 'inset 0 0 20px rgba(0,255,136,0.025)',
  },
  btn:    { padding: '11px 18px', borderRadius: 3, border: '1px solid rgba(0,255,136,0.45)', background: 'rgba(0,255,136,0.09)', color: 'var(--green)', fontFamily: 'Orbitron, sans-serif', fontSize: 9, letterSpacing: 3, cursor: 'pointer', whiteSpace: 'nowrap', boxShadow: '0 0 12px rgba(0,255,136,0.12)', textShadow: '0 0 8px rgba(0,255,136,0.6)' },
  chips:  { display: 'flex', gap: 6, marginTop: 10, flexWrap: 'wrap' },
  chip:   { padding: '4px 12px', borderRadius: 2, border: '1px solid rgba(0,255,136,0.18)', background: 'transparent', color: 'rgba(0,255,136,0.7)', fontFamily: 'Share Tech Mono, monospace', fontSize: 10, cursor: 'pointer', letterSpacing: 0.5, transition: 'all 0.2s ease' },
}