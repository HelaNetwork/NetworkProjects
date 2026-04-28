const TOKENS = ['ETH', 'USDC', 'USDT', 'DAI', 'WBTC', 'LINK', 'UNI', 'AAVE', 'MATIC', 'SHIB']

const TOKEN_COLORS = {
  ETH: '#00f5ff', USDC: '#2775ca', USDT: '#26a17b', DAI: '#ffe600',
  WBTC: '#ff9900', LINK: '#2a5ada', UNI: '#ff2d78', AAVE: '#b6509e',
  MATIC: '#8247e5', SHIB: '#ff6900',
}

export default function TokenSelector({ from, to, onFromChange, onToChange }) {
  return (
    <div style={styles.row}>
      <TokenDrop label="FROM" value={from} onChange={onFromChange} exclude={to} />
      <button
        onClick={() => { onFromChange(to); onToChange(from) }}
        style={styles.swapBtn}
        title="Swap tokens"
      >
        ⇄
      </button>
      <TokenDrop label="TO" value={to} onChange={onToChange} exclude={from} />
    </div>
  )
}

function TokenDrop({ label, value, onChange, exclude }) {
  const color = TOKEN_COLORS[value] || '#00f5ff'
  return (
    <div style={styles.group}>
      <label style={styles.label}>{label}</label>
      <div style={{ ...styles.selectWrapper, borderColor: color + '44', boxShadow: '0 0 8px ' + color + '22' }}>
        <span style={{ ...styles.dot, background: color, boxShadow: '0 0 6px ' + color }} />
        <select
          value={value}
          onChange={e => onChange(e.target.value)}
          style={styles.select}
        >
          {TOKENS.filter(t => t !== exclude).map(t => (
            <option key={t} value={t}>{t}</option>
          ))}
        </select>
      </div>
    </div>
  )
}

const styles = {
  row: { display: 'flex', alignItems: 'flex-end', gap: 10, flexWrap: 'wrap' },
  group: { display: 'flex', flexDirection: 'column', gap: 5 },
  label: {
    fontFamily: "'Orbitron', sans-serif",
    fontSize: 9, color: '#3d2560', letterSpacing: 3,
  },
  selectWrapper: {
    display: 'flex', alignItems: 'center', gap: 8,
    padding: '7px 12px',
    borderRadius: 8,
    border: '1px solid',
    background: 'rgba(10,0,20,0.8)',
    backdropFilter: 'blur(5px)',
  },
  dot: { width: 7, height: 7, borderRadius: '50%', flexShrink: 0 },
  select: {
    background: 'transparent', border: 'none', outline: 'none',
    color: '#e8d5ff', fontSize: 14, fontWeight: 600,
    fontFamily: "'Share Tech Mono', monospace",
    cursor: 'pointer', letterSpacing: 1,
  },
  swapBtn: {
    marginBottom: 2,
    padding: '7px 10px', borderRadius: 8,
    border: '1px solid #2a0050',
    background: 'rgba(191,0,255,0.1)',
    color: '#bf00ff', fontSize: 16, cursor: 'pointer',
    transition: 'all 0.2s',
    boxShadow: '0 0 8px rgba(191,0,255,0.15)',
  },
}