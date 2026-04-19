import { useAccount } from 'wagmi'
import SimulationPanel from './SimulationPanel.jsx'

export default function QuotePanel({ quotes, parsed, prices, status, simLogs, execLogs, onSimulate, onExecute, onReset }) {
  const { isConnected } = useAccount()
  if (!quotes) return null

  const { best, all, reason, savingVsSecond } = quotes
  const fromUSD     = prices?.[parsed.fromToken] ? (parseFloat(parsed.amount) * prices[parsed.fromToken]).toFixed(2) : null
  const toUSD       = prices?.[parsed.toToken]   ? (parseFloat(best.toAmountHuman) * prices[parsed.toToken]).toFixed(2) : null
  const priceImpact = best.estimatedPriceImpact || best.raw?.estimatedPriceImpact || best.raw?.priceRoute?.percentChange || null
  const impactHigh  = priceImpact && Math.abs(parseFloat(priceImpact)) > 1
  const route       = best.raw?.priceRoute?.bestRoute?.[0]?.swaps?.map(s => s.swapExchanges?.[0]?.exchange).filter(Boolean) || []

  const isSimulating = status === 'simulating'
  const isExecuting  = status === 'executing'
  const isDone       = status === 'done'

  return (
    <div style={styles.wrapper}>
      <div style={styles.topStrip} />

      {/* SWAP SUMMARY */}
      <div style={styles.section} className="animate-in">
        <PH color="var(--green)" label="[ SWAP_SUMMARY ]" />
        <div style={styles.summaryGrid}>
          <div style={styles.summaryBox}>
            <span style={styles.summaryMeta}>// SELL</span>
            <span style={styles.summaryBig}>{parsed.amount}</span>
            <span style={styles.summaryToken} className="neon-green">{parsed.fromToken}</span>
            {fromUSD && <span style={styles.summaryUsd}>${fromUSD} USD</span>}
          </div>
          <div style={styles.summaryMid}>
            <div style={styles.arrowDots}>
              {[...Array(4)].map((_,i) => (
                <div key={i} style={{ ...styles.arrowDot, animationDelay: `${i*0.15}s` }} />
              ))}
            </div>
            <span style={styles.arrowIcon} className="neon-cyan">▶▶</span>
            <span style={styles.viaText}>VIA_{best.source.toUpperCase()}</span>
          </div>
          <div style={{ ...styles.summaryBox, alignItems: 'flex-end' }}>
            <span style={styles.summaryMeta}>// BUY</span>
            <span style={{ ...styles.summaryBig, color: 'var(--cyan)', textShadow: '0 0 16px var(--glow-c)' }}>{best.toAmountHuman}</span>
            <span style={{ ...styles.summaryToken, color: 'var(--cyan)' }}>{parsed.toToken}</span>
            {toUSD && <span style={styles.summaryUsd}>${toUSD} USD</span>}
          </div>
        </div>
        <div style={styles.badgeRow}>
          {savingVsSecond && parseFloat(savingVsSecond) > 0 && (
            <div style={styles.saveBadge} className="animate-in delay-1">
              ↑ SAVES_{savingVsSecond}_{parsed.toToken}_VS_NEXT
            </div>
          )}
          {priceImpact && (
            <div style={{ ...styles.impactBadge, color: impactHigh ? 'var(--red)' : 'var(--green)', borderColor: impactHigh ? 'rgba(255,51,85,0.4)' : 'rgba(0,255,136,0.4)' }} className="animate-in delay-2">
              {impactHigh ? '⚠ HIGH_IMPACT' : '✓ LOW_IMPACT'} {parseFloat(priceImpact).toFixed(2)}%
            </div>
          )}
        </div>
      </div>

      {/* ROUTE ANALYSIS */}
      {reason && (
        <div style={{ ...styles.section, borderLeft: '2px solid rgba(187,68,255,0.6)', background: 'rgba(187,68,255,0.025)' }} className="animate-in delay-1">
          <PH color="var(--purple)" label="[ ROUTE_ANALYSIS ]" />
          <p style={styles.routeText}>{reason}</p>
          {route.length > 0 && (
            <div style={styles.routePath}>
              <span style={styles.routePathLabel}>// EXECUTION_PATH</span>
              <div style={styles.routeRow}>
                <span style={styles.routeToken} className="neon-green">{parsed.fromToken}</span>
                {route.map((r, i) => (
                  <span key={i} style={styles.routeHop}>
                    <span style={styles.hopArrow}>──▶</span>
                    <span style={styles.hopDex}>{r}</span>
                  </span>
                ))}
                <span style={styles.hopArrow}>──▶</span>
                <span style={{ ...styles.routeToken, color: 'var(--cyan)', textShadow: '0 0 8px var(--glow-c)' }}>{parsed.toToken}</span>
              </div>
            </div>
          )}
          <div style={styles.gasRow}>
            <span style={styles.gasLabel}>EST_GAS</span>
            <span style={styles.gasVal} data-tooltip="Gas units required">{Number(best.gas||0).toLocaleString()}_UNITS</span>
          </div>
        </div>
      )}

      {/* DEX COMPARISON */}
      <div style={styles.section} className="animate-in delay-2">
        <PH color="var(--cyan)" label="[ DEX_COMPARISON ]" />
        <table style={styles.table}>
          <thead>
            <tr>
              {[['RNK','left'],['SOURCE','left'],['OUTPUT','right'],['GAS','right'],['STATUS','center']].map(([h,a]) => (
                <th key={h} style={{ ...styles.th, textAlign: a }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {all.map((q, i) => (
              <tr key={q.source} style={{ ...styles.tr, ...(i===0 ? styles.trBest : {}) }} className="quote-row">
                <td style={styles.td}>
                  <span style={{ ...styles.rank, color: i===0 ? 'var(--green)' : 'rgba(0,255,136,0.4)' }}>
                    #{String(i+1).padStart(2,'0')}
                  </span>
                </td>
                <td style={styles.td}>
                  <span style={{ fontFamily:'Share Tech Mono',fontSize:12, color:i===0?'var(--text)':'var(--text2)', letterSpacing:1 }}>{q.source}</span>
                </td>
                <td style={{ ...styles.td, textAlign:'right' }}>
                  <span style={{ fontFamily:'Orbitron',fontSize:13,fontWeight:700, color:i===0?'var(--green)':'var(--text2)', textShadow:i===0?'0 0 8px var(--glow-g)':'none' }}>{q.toAmountHuman}</span>
                  {' '}
                  <span style={{ fontFamily:'Share Tech Mono',fontSize:9,color:'rgba(0,255,136,0.5)' }}>{parsed.toToken}</span>
                </td>
                <td style={{ ...styles.td, textAlign:'right' }}>
                  <span style={{ fontFamily:'Share Tech Mono',fontSize:10,color:'rgba(255,215,0,0.7)' }}>{q.gas?Number(q.gas).toLocaleString():'—'}</span>
                </td>
                <td style={{ ...styles.td, textAlign:'center' }}>
                  {i===0
                    ? <span style={styles.bestTag}>OPTIMAL</span>
                    : <span style={styles.otherTag}>{['#02','#03','#04'][i-1]||`#0${i+1}`}</span>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* SIMULATION LOGS */}
      {(simLogs.length > 0 || isSimulating) && (
        <div style={{ ...styles.section, borderLeft: '2px solid rgba(0,212,255,0.4)', background: 'rgba(0,212,255,0.02)' }} className="animate-in">
          <SimulationPanel
            logs={simLogs}
            title="SIMULATION_LOG"
            color="var(--cyan)"
          />
          {isSimulating && (
            <div style={styles.runningRow}>
              <div style={styles.runningRing}><div style={styles.runningRingInner}/></div>
              <span style={styles.runningText}>RUNNING SIMULATION...</span>
              <div style={styles.runningDots}>
                {[0,1,2].map(i=><div key={i} style={{...styles.runningDot, animationDelay:`${i*0.2}s`}}/>)}
              </div>
            </div>
          )}
        </div>
      )}

      {/* EXECUTION LOGS */}
      {(execLogs.length > 0 || isExecuting) && (
        <div style={{ ...styles.section, borderLeft: '2px solid rgba(0,255,136,0.5)', background: 'rgba(0,255,136,0.02)' }} className="animate-in">
          <SimulationPanel
            logs={execLogs}
            title="EXECUTION_LOG"
            color="var(--green)"
          />
          {isExecuting && (
            <div style={styles.runningRow}>
              <div style={{ ...styles.runningRing, borderTopColor: 'var(--green)', boxShadow: '0 0 8px var(--glow-g)' }}>
                <div style={{ ...styles.runningRingInner, borderBottomColor: 'var(--green)' }}/>
              </div>
              <span style={{ ...styles.runningText, color: 'var(--green)' }}>BROADCASTING TX...</span>
              <div style={styles.runningDots}>
                {[0,1,2].map(i=><div key={i} style={{...styles.runningDot, background:'var(--green)', animationDelay:`${i*0.2}s`}}/>)}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ACTIONS */}
      <div style={{ ...styles.section, borderBottom:'none', position:'sticky', bottom:0, zIndex:5, background:'rgba(3,5,8,0.97)', backdropFilter:'blur(16px)', borderTop:'1px solid rgba(0,255,136,0.12)' }} className="animate-in delay-3">
        {isDone ? (
          <div style={styles.doneRow}>
            <span style={styles.doneCheck} className="neon-green">[ ✓ COMPLETE ]</span>
            <button onClick={onReset} style={styles.newBtn} className="btn-glow">[ NEW_SWAP ]</button>
          </div>
        ) : (
          <div style={styles.actionRow}>
            <button
              onClick={onSimulate}
              disabled={isSimulating || isExecuting}
              style={{ ...styles.simBtn, opacity: (isSimulating||isExecuting) ? 0.5 : 1 }}
              className="btn-glow"
              data-tooltip="Dry-run without spending gas"
            >
              {isSimulating ? '⟳ SIMULATING...' : '[ SIMULATE ]'}
            </button>
            {isConnected
              ? <button
                  onClick={onExecute}
                  disabled={isSimulating || isExecuting}
                  style={{ ...styles.execBtn, opacity: (isSimulating||isExecuting) ? 0.5 : 1 }}
                  className="btn-glow"
                  data-tooltip="Execute live on Ethereum"
                >
                  <span style={styles.execIcon}>⚡</span>
                  {isExecuting ? 'EXECUTING...' : 'EXECUTE_SWAP'}
                </button>
              : <span style={styles.noWallet}>// connect wallet to execute</span>}
          </div>
        )}
      </div>
    </div>
  )
}

function PH({ color, label }) {
  return (
    <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:14 }}>
      <div style={{ width:6,height:6,borderRadius:'50%',background:color,boxShadow:`0 0 8px ${color}`,flexShrink:0,animation:'glow-pulse 2s ease infinite' }}/>
      <span style={{ fontFamily:'Orbitron,sans-serif',fontSize:9,color,letterSpacing:4,textShadow:`0 0 10px ${color}` }}>{label}</span>
      <div style={{ flex:1,height:1,background:`linear-gradient(90deg, ${color}60, transparent)` }}/>
    </div>
  )
}

const styles = {
  wrapper:  { display:'flex', flexDirection:'column', minHeight:'100%' },
  topStrip: { height:2, background:'linear-gradient(90deg, var(--green), var(--cyan), var(--blue), var(--green))', backgroundSize:'200% 100%', animation:'shimmer 2s linear infinite', boxShadow:'0 0 8px rgba(0,255,136,0.35)' },
  section:  { padding:'18px 22px', borderBottom:'1px solid rgba(0,255,136,0.08)', background:'var(--panel)', backdropFilter:'blur(10px)' },

  summaryGrid:  { display:'grid', gridTemplateColumns:'1fr auto 1fr', gap:10, alignItems:'center', marginBottom:12 },
  summaryBox:   { display:'flex', flexDirection:'column', gap:4 },
  summaryMeta:  { fontFamily:'Share Tech Mono,monospace', fontSize:8,  color:'rgba(0,255,136,0.65)', letterSpacing:3 },
  summaryBig:   { fontFamily:'Orbitron,sans-serif',       fontSize:28, fontWeight:800, color:'var(--text)', lineHeight:1 },
  summaryToken: { fontFamily:'Share Tech Mono,monospace', fontSize:15, letterSpacing:3 },
  summaryUsd:   { fontFamily:'Share Tech Mono,monospace', fontSize:10, color:'rgba(0,255,136,0.65)' },
  summaryMid:   { display:'flex', flexDirection:'column', alignItems:'center', gap:4 },
  arrowDots:    { display:'flex', gap:2 },
  arrowDot:     { width:3, height:3, borderRadius:'50%', background:'var(--cyan)', boxShadow:'0 0 4px var(--glow-c)', animation:'glow-pulse 0.8s ease infinite' },
  arrowIcon:    { fontFamily:'Share Tech Mono,monospace', fontSize:16, animation:'cyan-pulse 2s ease infinite' },
  viaText:      { fontFamily:'Share Tech Mono,monospace', fontSize:8,  color:'rgba(0,212,255,0.7)', letterSpacing:1 },

  badgeRow:    { display:'flex', gap:8, flexWrap:'wrap' },
  saveBadge:   { fontFamily:'Share Tech Mono,monospace', fontSize:9, color:'var(--green)', border:'1px solid rgba(0,255,136,0.4)', padding:'3px 10px', borderRadius:2, letterSpacing:1, background:'rgba(0,255,136,0.06)' },
  impactBadge: { fontFamily:'Share Tech Mono,monospace', fontSize:9, border:'1px solid', padding:'3px 10px', borderRadius:2, letterSpacing:1 },

  routeText:      { fontFamily:'Share Tech Mono,monospace', fontSize:12, color:'var(--text2)', lineHeight:1.8, marginBottom:12 },
  routePath:      { background:'rgba(187,68,255,0.06)', border:'1px solid rgba(187,68,255,0.2)', borderRadius:3, padding:'12px 14px', marginBottom:10 },
  routePathLabel: { fontFamily:'Share Tech Mono,monospace', fontSize:8, color:'rgba(187,68,255,0.8)', letterSpacing:3, display:'block', marginBottom:10 },
  routeRow:       { display:'flex', alignItems:'center', gap:6, flexWrap:'wrap' },
  routeToken:     { fontFamily:'Orbitron,sans-serif', fontSize:13, fontWeight:700, letterSpacing:1 },
  routeHop:       { display:'flex', alignItems:'center', gap:6 },
  hopArrow:       { fontFamily:'Share Tech Mono,monospace', fontSize:10, color:'rgba(0,255,136,0.6)', letterSpacing:-2 },
  hopDex:         { fontFamily:'Share Tech Mono,monospace', fontSize:10, color:'var(--purple)', border:'1px solid rgba(187,68,255,0.35)', padding:'2px 8px', borderRadius:2, background:'rgba(187,68,255,0.07)' },

  gasRow:   { display:'flex', alignItems:'center', gap:8 },
  gasLabel: { fontFamily:'Orbitron,sans-serif',       fontSize:8,  color:'rgba(255,215,0,0.7)', letterSpacing:3 },
  gasVal:   { fontFamily:'Share Tech Mono,monospace', fontSize:11, color:'var(--yellow)', textShadow:'0 0 6px rgba(255,215,0,0.45)', cursor:'default', letterSpacing:1 },

  table:   { width:'100%', borderCollapse:'collapse' },
  th:      { fontFamily:'Orbitron,sans-serif', fontSize:8, color:'rgba(0,255,136,0.65)', letterSpacing:3, padding:'8px 8px', borderBottom:'1px solid rgba(0,255,136,0.15)' },
  tr:      { borderBottom:'1px solid rgba(0,255,136,0.06)', transition:'all 0.15s ease' },
  trBest:  { background:'rgba(0,255,136,0.04)', boxShadow:'inset 2px 0 0 rgba(0,255,136,0.4)' },
  td:      { padding:'11px 8px', verticalAlign:'middle' },
  rank:    { fontFamily:'Orbitron,sans-serif', fontSize:10, fontWeight:700, letterSpacing:2 },
  bestTag: { fontFamily:'Orbitron,sans-serif', fontSize:8, color:'var(--green)', border:'1px solid rgba(0,255,136,0.4)', padding:'2px 8px', borderRadius:2, letterSpacing:2, textShadow:'0 0 6px var(--glow-g)', background:'rgba(0,255,136,0.06)' },
  otherTag:{ fontFamily:'Orbitron,sans-serif', fontSize:8, color:'rgba(0,255,136,0.55)', border:'1px solid rgba(0,255,136,0.2)', padding:'2px 8px', borderRadius:2, letterSpacing:1 },

  runningRow:      { display:'flex', alignItems:'center', gap:10, marginTop:10, padding:'8px 0' },
  runningRing:     { width:20,height:20,position:'relative',flexShrink:0,border:'1px solid rgba(0,212,255,0.2)',borderTop:'1px solid var(--cyan)',borderRadius:'50%',animation:'spin 0.9s linear infinite',boxShadow:'0 0 8px var(--glow-c)' },
  runningRingInner:{ position:'absolute',inset:4,border:'1px solid rgba(0,255,136,0.2)',borderBottom:'1px solid var(--green)',borderRadius:'50%',animation:'spin-reverse 0.7s linear infinite' },
  runningText:     { fontFamily:'Share Tech Mono,monospace',fontSize:11,color:'var(--cyan)',letterSpacing:2,animation:'flicker 1.5s infinite' },
  runningDots:     { display:'flex',gap:3 },
  runningDot:      { width:4,height:4,borderRadius:'50%',background:'var(--cyan)',boxShadow:'0 0 4px var(--glow-c)',animation:'glow-pulse 0.6s ease infinite' },

  actionRow: { display:'flex', gap:10, alignItems:'center', flexWrap:'wrap' },
  simBtn:    { padding:'11px 20px', borderRadius:3, border:'1px solid rgba(0,212,255,0.4)', background:'rgba(0,212,255,0.07)', color:'var(--cyan)', fontFamily:'Orbitron,sans-serif', fontSize:9, letterSpacing:3, cursor:'pointer', transition:'all 0.2s ease', textShadow:'0 0 6px var(--glow-c)' },
  execBtn:   { flex:1, padding:'11px 20px', borderRadius:3, border:'1px solid rgba(0,255,136,0.5)', background:'rgba(0,255,136,0.09)', color:'var(--green)', fontFamily:'Orbitron,sans-serif', fontSize:10, fontWeight:700, letterSpacing:3, cursor:'pointer', boxShadow:'0 0 16px rgba(0,255,136,0.12)', textShadow:'0 0 8px var(--glow-g)', display:'flex', alignItems:'center', justifyContent:'center', gap:8, transition:'all 0.2s ease' },
  execIcon:  { fontSize:14 },
  noWallet:  { fontFamily:'Share Tech Mono,monospace', fontSize:10, color:'rgba(0,255,136,0.55)', letterSpacing:2 },

  doneRow:   { display:'flex', alignItems:'center', gap:14, justifyContent:'space-between' },
  doneCheck: { fontFamily:'Orbitron,sans-serif', fontSize:13, letterSpacing:3 },
  newBtn:    { padding:'8px 16px', borderRadius:3, border:'1px solid rgba(0,255,136,0.4)', background:'rgba(0,255,136,0.07)', color:'var(--green)', fontFamily:'Orbitron,sans-serif', fontSize:9, letterSpacing:3, cursor:'pointer' },
}   