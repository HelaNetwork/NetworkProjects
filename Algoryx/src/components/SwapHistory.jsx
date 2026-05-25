export default function SwapHistory({ history }) {
  if (!history?.length) return null
  return (
    <div style={styles.list}>
      {history.map((h, i) => (
        <div key={i} style={styles.row} className="quote-row">
          <span style={styles.idx}>#{String(i+1).padStart(2,'0')}</span>
          <span style={styles.pair}>{h.amount} {h.from} → {h.to}</span>
          <span style={styles.result}>{h.result} · {h.source}</span>
          <span style={{ ...styles.tag, ...(h.simulated ? styles.simTag : styles.liveTag) }}>
            {h.simulated ? 'SIM' : 'LIVE'}
          </span>
          <span style={styles.time}>{h.time}</span>
        </div>
      ))}
    </div>
  )
}

const styles = {
  list:    { display: 'flex', flexDirection: 'column' },
  row:     { display: 'flex', alignItems: 'center', gap: 10, padding: '8px 0', borderBottom: '1px solid rgba(0,255,136,0.08)', flexWrap: 'wrap' },
  idx:     { fontFamily: 'Orbitron, sans-serif',       fontSize: 9,  color: 'rgba(0,255,136,0.6)',  letterSpacing: 1, flexShrink: 0 },
  pair:    { fontFamily: 'Share Tech Mono, monospace', fontSize: 12, color: 'var(--text)',  flex: 1 },
  result:  { fontFamily: 'Share Tech Mono, monospace', fontSize: 10, color: 'var(--text2)' },
  tag:     { fontFamily: 'Orbitron, sans-serif', fontSize: 8, padding: '2px 7px', borderRadius: 2, letterSpacing: 2, flexShrink: 0 },
  simTag:  { color: 'var(--cyan)',  border: '1px solid rgba(0,212,255,0.45)',  background: 'rgba(0,212,255,0.08)'  },
  liveTag: { color: 'var(--green)', border: '1px solid rgba(0,255,136,0.45)', background: 'rgba(0,255,136,0.08)' },
  time:    { fontFamily: 'Share Tech Mono, monospace', fontSize: 9,  color: 'rgba(0,255,136,0.5)',  flexShrink: 0 },
}