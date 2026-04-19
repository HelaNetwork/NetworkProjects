import { useEffect, useRef } from 'react'

const LOG_STYLES = {
  system:  { color: 'rgba(0,212,255,0.85)',  prefix: '⟫  ' },
  info:    { color: 'rgba(0,255,136,0.85)',  prefix: '·  ' },
  success: { color: '#00ff88',               prefix: '✓  ' },
  error:   { color: '#ff3355',               prefix: '✕  ' },
  hash:    { color: 'rgba(187,68,255,0.9)',  prefix: '#  ' },
  divider: { color: 'rgba(0,255,136,0.2)',   prefix: '   ' },
  final:   { color: '#00ff88',               prefix: '★  ' },
}

export default function SimulationPanel({ logs = [], title = 'SIM_LOG', color = 'var(--green)' }) {
  const bottomRef = useRef(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [logs])

  if (logs.length === 0) return null

  return (
    <div style={styles.wrapper}>
      {/* Header */}
      <div style={styles.header}>
        <div style={{ ...styles.headerDot, background: color, boxShadow: `0 0 8px ${color}` }} />
        <span style={{ ...styles.headerLabel, color }}>[ {title} ]</span>
        <div style={styles.headerCount}>{logs.length} ENTRIES</div>
        <div style={{ flex: 1, height: 1, background: `linear-gradient(90deg, ${color}40, transparent)`, marginLeft: 8 }} />
      </div>

      {/* Terminal body */}
      <div style={styles.terminal}>
        <div style={styles.terminalInner}>
          {logs.map((log, i) => {
            const s = LOG_STYLES[log.type] || LOG_STYLES.info
            return (
              <div key={i} style={{ ...styles.logLine, animationDelay: `${i * 0.05}s` }} className="animate-in">
                <span style={styles.logTs}>{log.ts}</span>
                <span style={{ ...styles.logPrefix, color: s.color }}>{s.prefix}</span>
                <span style={{ ...styles.logMsg, color: s.color, fontWeight: log.type === 'final' ? 700 : 400 }}>
                  {log.msg}
                </span>
              </div>
            )
          })}
          <div ref={bottomRef} />
        </div>

        {/* Scrollbar glow line */}
        <div style={styles.terminalGlow} />
      </div>
    </div>
  )
}

const styles = {
  wrapper: { marginTop: 14, border: '1px solid rgba(0,255,136,0.12)', borderRadius: 4, overflow: 'hidden', background: 'rgba(0,8,3,0.8)' },

  header: { display: 'flex', alignItems: 'center', gap: 8, padding: '8px 14px', background: 'rgba(0,255,136,0.04)', borderBottom: '1px solid rgba(0,255,136,0.1)' },
  headerDot:   { width: 6, height: 6, borderRadius: '50%', flexShrink: 0 },
  headerLabel: { fontFamily: 'Orbitron, sans-serif', fontSize: 9, letterSpacing: 4 },
  headerCount: { fontFamily: 'Share Tech Mono, monospace', fontSize: 9, color: 'rgba(0,255,136,0.45)', letterSpacing: 2, marginLeft: 'auto' },

  terminal: { position: 'relative', maxHeight: 220, overflowY: 'auto' },
  terminalInner: { padding: '10px 14px', display: 'flex', flexDirection: 'column', gap: 4 },
  terminalGlow: { position: 'absolute', top: 0, left: 0, width: 2, height: '100%', background: 'linear-gradient(180deg, transparent, rgba(0,255,136,0.3), transparent)', pointerEvents: 'none' },

  logLine:   { display: 'flex', alignItems: 'flex-start', gap: 8, lineHeight: 1.5 },
  logTs:     { fontFamily: 'Share Tech Mono, monospace', fontSize: 9, color: 'rgba(0,255,136,0.3)', flexShrink: 0, marginTop: 1 },
  logPrefix: { fontFamily: 'Share Tech Mono, monospace', fontSize: 11, flexShrink: 0, marginTop: 1 },
  logMsg:    { fontFamily: 'Share Tech Mono, monospace', fontSize: 11, letterSpacing: 0.3, wordBreak: 'break-all' },
}