import { useAccount, useConnect, useDisconnect } from 'wagmi'

export default function WalletButton() {
  const { address, isConnected } = useAccount()
  const { connect, connectors }  = useConnect()
  const { disconnect }           = useDisconnect()

  if (isConnected) return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
      <div style={styles.addrBox}>
        <div style={styles.addrDot} />
        <span style={styles.addr}>{address.slice(0,6)}...{address.slice(-4)}</span>
      </div>
      <button onClick={() => disconnect()} style={styles.disconnBtn} className="btn-glow">
        [ DISCONNECT ]
      </button>
    </div>
  )

  return (
    <button onClick={() => connect({ connector: connectors[0] })} style={styles.connectBtn} className="btn-glow">
      <span style={styles.connectIcon}>⬡</span> CONNECT_WALLET
    </button>
  )
}

const styles = {
  addrBox:     { display: 'flex', alignItems: 'center', gap: 6, padding: '5px 12px', border: '1px solid rgba(0,255,136,0.25)', borderRadius: 3, background: 'rgba(0,255,136,0.05)' },
  addrDot:     { width: 5, height: 5, borderRadius: '50%', background: 'var(--green)', boxShadow: '0 0 6px rgba(0,255,136,0.7)', animation: 'glow-pulse 2s ease infinite' },
  addr:        { fontFamily: 'Share Tech Mono, monospace', fontSize: 12, color: 'var(--green)', letterSpacing: 1 },
  connectBtn:  { padding: '8px 16px', borderRadius: 3, border: '1px solid rgba(0,255,136,0.4)', background: 'rgba(0,255,136,0.08)', color: 'var(--green)', fontFamily: 'Orbitron, sans-serif', fontSize: 9, letterSpacing: 3, cursor: 'pointer', boxShadow: '0 0 12px rgba(0,255,136,0.12)', display: 'flex', alignItems: 'center', gap: 8, textShadow: '0 0 8px rgba(0,255,136,0.6)' },
  connectIcon: { fontSize: 14, color: 'var(--green)' },
  disconnBtn:  { padding: '6px 12px', borderRadius: 3, border: '1px solid rgba(255,51,85,0.35)', background: 'rgba(255,51,85,0.07)', color: 'rgba(255,100,130,0.9)', fontFamily: 'Orbitron, sans-serif', fontSize: 9, letterSpacing: 3, cursor: 'pointer' },
}