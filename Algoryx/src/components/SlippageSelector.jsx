export default function SlippageSelector({ value, onChange }) {
  return (
    <div style={styles.row}>
      <span style={styles.label}>// SLIPPAGE_TOL</span>
      {['0.5', '1', '2'].map(v => (
        <button key={v} onClick={() => onChange(v)}
          style={{ ...styles.btn, ...(value === v ? styles.active : {}) }}>
          {v}%
        </button>
      ))}
    </div>
  )
}

const styles = {
  row:    { display: 'flex', alignItems: 'center', gap: 8 },
  label:  { fontFamily: 'Share Tech Mono, monospace', fontSize: 9, color: 'rgba(0,255,136,0.65)', letterSpacing: 2, marginRight: 4 },
  btn:    { padding: '5px 12px', borderRadius: 2, border: '1px solid rgba(0,255,136,0.2)', background: 'transparent', color: 'rgba(0,255,136,0.7)', fontFamily: 'Share Tech Mono, monospace', fontSize: 12, cursor: 'pointer', transition: 'all 0.2s ease' },
  active: { background: 'rgba(0,255,136,0.12)', border: '1px solid rgba(0,255,136,0.65)', color: 'var(--green)', boxShadow: '0 0 12px rgba(0,255,136,0.18)' },
}