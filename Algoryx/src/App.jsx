import { useState, useEffect, useRef } from 'react'
import { useSwap } from './hooks/useSwap.js'
import WalletButton from './components/WalletButton.jsx'
import GasDisplay from './components/GasDisplay.jsx'
import SlippageSelector from './components/SlippageSelector.jsx'
import SwapInput from './components/SwapInput.jsx'
import PriceChart from './components/PriceChart.jsx'
import QuotePanel from './components/QuotePanel.jsx'
import SwapHistory from './components/SwapHistory.jsx'

const MATRIX_CHARS = '01アイウエオカキクケコサシスセソタチツテトナニヌネノ∑∆∏Ω∇'

export default function App() {
  const {
    status, parsed, quotes, txHash, error,
    slippage, setSlippage,
    prices, history,
    simLogs, execLogs,
    handleInput, simulateSwap, executeSwap, reset,
  } = useSwap()

  const [time, setTime]         = useState('')
  const [blockNum, setBlockNum] = useState(Math.floor(Math.random() * 1000000) + 19000000)
  const canvasRef               = useRef(null)

  const isLoading    = status === 'parsing' || status === 'fetching'
  const etherscanUrl = txHash && !txHash.startsWith('SIMULATED')
    ? 'https://etherscan.io/tx/' + txHash : null

  useEffect(() => {
    const id = setInterval(() => {
      setTime(new Date().toLocaleTimeString('en-US', { hour12: false }))
      setBlockNum(b => b + Math.floor(Math.random() * 3))
    }, 1000)
    return () => clearInterval(id)
  }, [])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx   = canvas.getContext('2d')
    canvas.width  = canvas.offsetWidth
    canvas.height = canvas.offsetHeight
    const cols  = Math.floor(canvas.width / 16)
    const drops = Array(cols).fill(1)
    const draw  = () => {
      ctx.fillStyle = 'rgba(3,5,8,0.05)'
      ctx.fillRect(0, 0, canvas.width, canvas.height)
      ctx.fillStyle = 'rgba(0,255,136,0.35)'
      ctx.font = '13px Share Tech Mono'
      drops.forEach((y, i) => {
        const char = MATRIX_CHARS[Math.floor(Math.random() * MATRIX_CHARS.length)]
        ctx.fillText(char, i * 16, y * 16)
        if (y * 16 > canvas.height && Math.random() > 0.975) drops[i] = 0
        drops[i]++
      })
    }
    const interval = setInterval(draw, 60)
    return () => clearInterval(interval)
  }, [])

  return (
    <div style={styles.root}>

      <canvas ref={canvasRef} style={styles.matrixCanvas} />
      <div style={styles.gridOverlay} />
      <div style={styles.orb1} />
      <div style={styles.orb2} />

      {/* TOP BAR */}
      <header style={styles.topBar}>
        <div style={styles.topBarScanline} />

        <div style={styles.logoGroup}>
          <div style={styles.logoDiamond}>
            <div style={styles.logoDiamondCore} />
            <div style={styles.logoDiamondRing} />
          </div>
          <div style={styles.logoTexts}>
            <span style={styles.logoMain}>
              SWAP<span className="shimmer-text">WAVE</span>
            </span>
            <span style={styles.logoSub}>// INTENT-BASED DEX AGGREGATOR v2.0</span>
          </div>
        </div>

        <div style={styles.headerCenter}>
          <div style={styles.systemStatus}>
            <div style={styles.statusLed} />
            <span style={styles.statusText}>SYSTEM_ONLINE</span>
            <span style={styles.statusSep}>|</span>
            <span style={styles.blockText}>BLOCK #{blockNum.toLocaleString()}</span>
            <span style={styles.statusSep}>|</span>
            <span style={styles.netText}>ETH_MAINNET</span>
          </div>
        </div>

        <div style={styles.headerRight}>
          <div style={styles.clockWrap}>
            <span style={styles.clockLabel}>SYS_TIME</span>
            <span style={styles.clockVal} className="neon-green">{time}</span>
          </div>
          <div style={styles.hDivider} />
          <GasDisplay />
          <div style={styles.hDivider} />
          <WalletButton />
        </div>
      </header>

      <div style={styles.neonDivider} />
      {isLoading && <div className="progress-bar" />}

      <main style={styles.mainGrid}>

        {/* LEFT */}
        <div style={styles.leftCol}>
          <div style={styles.bracketTL} />
          <div style={styles.bracketTR} />

          <section style={styles.panel} className="panel-glow animate-in">
            <PanelHeader color="var(--green)" label="[ SWAP_INTENT ]" />
            <SwapInput onSubmit={(t) => handleInput(t, null, null)} disabled={isLoading} />
            <div style={styles.controlsRow}>
              <SlippageSelector value={slippage} onChange={setSlippage} />
            </div>
          </section>

          {isLoading && (
            <section style={{ ...styles.panel, borderLeft: '2px solid var(--cyan)', background: 'rgba(0,200,255,0.03)' }} className="animate-in">
              <PanelHeader color="var(--cyan)" label="[ PROCESSING ]" />
              <div style={styles.loadingRow}>
                <div style={styles.dualRing}>
                  <div style={styles.dualRingOuter} />
                  <div style={styles.dualRingInner} />
                  <div style={styles.dualRingCore} />
                </div>
                <div style={styles.loadingTexts}>
                  <span style={{ ...styles.loadingMain, animation: 'flicker 1.5s infinite' }}>
                    {status === 'parsing' ? '> PARSING_NATURAL_LANGUAGE...' : '> QUERYING_DEX_AGGREGATORS...'}
                  </span>
                  <div style={styles.loadingDots}>
                    {[0,1,2,3,4].map(i => (
                      <div key={i} style={{ ...styles.loadingDot, animationDelay: `${i*0.12}s` }} />
                    ))}
                  </div>
                </div>
              </div>
              {status === 'fetching' && (
                <div style={styles.sourceGrid}>
                  {['0x_PROTOCOL','PARASWAP','KYBERSWAP','OPENOCEAN'].map((s, i) => (
                    <div key={s} style={{ ...styles.sourceRow, animationDelay: `${i*0.08}s` }} className="animate-in">
                      <div style={styles.sourcePingWrap}>
                        <div style={styles.sourcePing} />
                        <div style={styles.sourceDot} />
                      </div>
                      <span style={styles.sourceName}>{s}</span>
                      <span style={styles.sourceStatus}>ONLINE</span>
                    </div>
                  ))}
                </div>
              )}
            </section>
          )}

          {parsed && !isLoading && (
            <section style={{ ...styles.panel, borderLeft: '2px solid var(--green)', background: 'rgba(0,255,136,0.02)' }} className="animate-in">
              <PanelHeader color="var(--green)" label="[ INTENT_DECODED ]" />
              <div style={styles.parsedGrid}>
                <div style={styles.parsedBlock}>
                  <span style={styles.parsedTag}>SELL</span>
                  <span style={styles.parsedBig}>{parsed.amount}</span>
                  <span style={styles.parsedSym} className="neon-green">{parsed.fromToken}</span>
                </div>
                <div style={styles.parsedCenter}>
                  <div style={styles.parsedArrowTrail}>
                    {[...Array(5)].map((_,i) => (
                      <div key={i} style={{ ...styles.parsedTrailDot, opacity: (i+1)/5, animationDelay: `${i*0.1}s` }} />
                    ))}
                  </div>
                  <span style={styles.parsedArrow} className="neon-cyan">▶</span>
                  <span style={styles.parsedSlip}>SLIP:{slippage}%</span>
                </div>
                <div style={{ ...styles.parsedBlock, alignItems: 'flex-end' }}>
                  <span style={styles.parsedTag}>BUY</span>
                  <span style={styles.parsedSym} className="neon-cyan">{parsed.toToken}</span>
                </div>
              </div>
              {parsed.usedAI && (
                <div style={styles.aiTag}>
                  <span style={styles.aiDot} />
                  <span style={styles.aiLabel}>GROQ_AI · llama3-8b · PARSED</span>
                </div>
              )}
            </section>
          )}

          {parsed && (
            <section style={styles.panel} className="animate-in panel-glow delay-1">
              <PanelHeader color="var(--yellow)" label={`[ PRICE_FEED · ${parsed.fromToken}/USD ]`} />
              <PriceChart token={parsed.fromToken} />
            </section>
          )}

          {error && (
            <section style={{ ...styles.panel, borderLeft: '2px solid var(--red)', background: 'rgba(255,34,68,0.04)' }} className="animate-in">
              <PanelHeader color="var(--red)" label="[ ERROR ]" />
              <div style={styles.errorRow}>
                <div style={styles.errorIcon}>
                  <span style={styles.errorX}>✕</span>
                  <div style={styles.errorRing} />
                </div>
                <div style={styles.errorTexts}>
                  <span style={styles.errorCode}>ERR_DEX_QUERY_FAILED</span>
                  <span style={styles.errorMsg}>{error}</span>
                </div>
                <button onClick={reset} style={styles.retryBtn} className="btn-glow">[ RETRY ]</button>
              </div>
            </section>
          )}

          {txHash && (
            <section style={{ ...styles.panel, borderLeft: '2px solid var(--green)', background: 'rgba(0,255,136,0.03)' }} className="animate-in">
              <PanelHeader color="var(--green)" label="[ TX_CONFIRMED ]" />
              <div style={styles.txRow}>
                <div style={styles.txCheck}>
                  <span style={styles.txCheckMark} className="neon-green">✓</span>
                  <div style={styles.txCheckRing} />
                </div>
                <div style={styles.txTexts}>
                  <span style={styles.txTitle} className="neon-green">
                    {txHash.startsWith('SIMULATED') ? 'SIMULATION_SUCCESS' : 'TX_BROADCAST'}
                  </span>
                  <span style={styles.txSub}>
                    {txHash.startsWith('SIMULATED')
                      ? '// Swap validated. Route confirmed with current liquidity.'
                      : '// Transaction submitted to Ethereum network.'}
                  </span>
                  {etherscanUrl && (
                    <a href={etherscanUrl} target="_blank" rel="noreferrer" style={styles.explorerLink} className="btn-glow">
                      {'> VIEW_ON_ETHERSCAN [↗]'}
                    </a>
                  )}
                </div>
              </div>
            </section>
          )}

          {history && history.length > 0 && (
            <section style={styles.panel} className="animate-in panel-glow">
              <PanelHeader color="var(--purple)" label={`[ SESSION_LOG · ${history.length}_RECORDS ]`} />
              <SwapHistory history={history} />
            </section>
          )}

          <div style={styles.footer}>
            <span style={styles.footerL}>// SWAPWAVE · EVM · ETHEREUM_MAINNET · HELA_TESTNET</span>
            <span style={styles.footerR}>BUILD_2026</span>
          </div>
        </div>

        {/* RIGHT */}
        <div style={styles.rightCol}>

          {!quotes && !isLoading && (
            <section style={{ ...styles.panel, ...styles.emptyPanel }} className="animate-fade">
              <div style={styles.emptyHexWrap}>
                <div style={styles.emptyHex} />
                <div style={styles.emptyHexInner} />
              </div>
              <div style={styles.emptyTitle} className="cursor">AWAITING_INPUT</div>
              <div style={styles.emptySub}>// type a swap intent to initialize</div>
              <div style={styles.emptyExList}>
                {[
                  '"Convert 1 ETH to USDC"',
                  '"Swap half an ethereum to DAI"',
                  '"Get WBTC with 2 ETH"',
                  '"Exchange 500 USDC for ETH"',
                ].map((ex, i) => (
                  <div key={i} style={{ ...styles.emptyEx, animationDelay: `${i*0.08}s` }} className="animate-in card-hover">
                    <span style={styles.exArrow}>▸</span>
                    <span style={styles.exText}>{ex}</span>
                  </div>
                ))}
              </div>
              <div style={styles.emptyStats}>
                {[['4','DEX_SOURCES'],['5','TOKENS'],['1','NETWORK']].map(([v,l]) => (
                  <div key={l} style={styles.emptyStat} className="animate-in">
                    <span style={styles.emptyStatN} className="neon-green">{v}</span>
                    <span style={styles.emptyStatL}>{l}</span>
                  </div>
                ))}
              </div>
            </section>
          )}

          {isLoading && (
            <section style={{ ...styles.panel, ...styles.emptyPanel }}>
              <div style={styles.loadingRingWrap}>
                <div style={styles.loadingRing1} />
                <div style={styles.loadingRing2} />
                <div style={styles.loadingRing3} />
                <div style={styles.loadingCore} />
              </div>
              <span style={styles.loadingBig} className="neon-green">AGGREGATING</span>
              <span style={styles.loadingSmall}>// querying all DEX sources in parallel</span>
              <div style={styles.loadingCards}>
                {['0x','PARASWAP','KYBERSWAP','OPENOCEAN'].map((s,i) => (
                  <div key={s} style={{ ...styles.loadingCard, animationDelay: `${i*0.1}s` }} className="animate-in">
                    <div style={styles.loadingCardDot} />
                    <span style={styles.loadingCardName}>{s}</span>
                  </div>
                ))}
              </div>
            </section>
          )}

          {quotes && (
            <div className="animate-in" style={{ height: '100%' }}>
              <QuotePanel
                quotes={quotes}
                parsed={parsed}
                prices={prices}
                status={status}
                simLogs={simLogs}
                execLogs={execLogs}
                onSimulate={simulateSwap}
                onExecute={executeSwap}
                onReset={reset}
              />
            </div>
          )}
        </div>
      </main>
    </div>
  )
}

function PanelHeader({ color, label }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
      <div style={{ width: 6, height: 6, borderRadius: '50%', background: color, boxShadow: `0 0 8px ${color}`, flexShrink: 0, animation: 'glow-pulse 2s ease infinite' }} />
      <span style={{ fontFamily: 'Orbitron, sans-serif', fontSize: 9, color, letterSpacing: 4, textShadow: `0 0 10px ${color}` }}>{label}</span>
      <div style={{ flex: 1, height: 1, background: `linear-gradient(90deg, ${color}60, transparent)`, animation: 'expand-h 0.5s ease both' }} />
    </div>
  )
}

const styles = {
  root: { minHeight: '100vh', display: 'flex', flexDirection: 'column', position: 'relative', overflow: 'hidden', background: 'var(--bg)' },

  matrixCanvas: { position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', opacity: 0.04, zIndex: 0, pointerEvents: 'none' },

  gridOverlay: {
    position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none',
    backgroundImage: `
      linear-gradient(rgba(0,255,136,0.04) 1px, transparent 1px),
      linear-gradient(90deg, rgba(0,255,136,0.04) 1px, transparent 1px)
    `,
    backgroundSize: '50px 50px',
  },

  orb1: { position: 'fixed', width: 500, height: 500, top: -200, left: -150, borderRadius: '50%', background: 'radial-gradient(circle, rgba(0,255,136,0.05) 0%, transparent 70%)', pointerEvents: 'none', zIndex: 0 },
  orb2: { position: 'fixed', width: 400, height: 400, bottom: -100, right: -100, borderRadius: '50%', background: 'radial-gradient(circle, rgba(0,200,255,0.05) 0%, transparent 70%)', pointerEvents: 'none', zIndex: 0 },

  topBar: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    padding: '12px 24px', position: 'relative', zIndex: 10,
    background: 'rgba(3,5,8,0.97)', backdropFilter: 'blur(20px)',
    borderBottom: '1px solid rgba(0,255,136,0.15)',
  },
  topBarScanline: {
    position: 'absolute', top: 0, left: 0, right: 0, height: 1,
    background: 'linear-gradient(90deg, transparent, var(--green) 20%, var(--cyan) 50%, var(--green) 80%, transparent)',
    backgroundSize: '200% 100%', animation: 'shimmer 2s linear infinite',
    boxShadow: '0 0 8px var(--glow-g)',
  },

  logoGroup:       { display: 'flex', alignItems: 'center', gap: 14 },
  logoDiamond:     { width: 24, height: 24, position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  logoDiamondCore: { width: 10, height: 10, background: 'var(--green)', transform: 'rotate(45deg)', boxShadow: '0 0 12px var(--glow-g), 0 0 28px var(--glow-g)', zIndex: 1, animation: 'float 3s ease infinite' },
  logoDiamondRing: { position: 'absolute', width: 20, height: 20, border: '1px solid rgba(0,255,136,0.35)', transform: 'rotate(45deg)', animation: 'spin 8s linear infinite' },
  logoTexts:       { display: 'flex', flexDirection: 'column', gap: 2 },
  logoMain:        { fontFamily: 'Orbitron, sans-serif', fontSize: 22, fontWeight: 900, color: 'var(--text)', letterSpacing: 6, lineHeight: 1 },
  logoSub:         { fontFamily: 'Share Tech Mono, monospace', fontSize: 9, color: 'rgba(0,255,136,0.65)', letterSpacing: 2 },

  headerCenter:  { flex: 1, display: 'flex', justifyContent: 'center' },
  systemStatus:  { display: 'flex', alignItems: 'center', gap: 10 },
  statusLed:     { width: 7, height: 7, borderRadius: '50%', background: 'var(--green)', boxShadow: '0 0 8px var(--glow-g)', animation: 'glow-pulse 2s ease infinite' },
  statusText:    { fontFamily: 'Share Tech Mono, monospace', fontSize: 10, color: 'var(--green)', letterSpacing: 2 },
  statusSep:     { color: 'rgba(0,255,136,0.4)', fontSize: 12 },
  blockText:     { fontFamily: 'Share Tech Mono, monospace', fontSize: 10, color: 'var(--cyan)', letterSpacing: 1 },
  netText:       { fontFamily: 'Share Tech Mono, monospace', fontSize: 10, color: 'rgba(0,255,136,0.7)', letterSpacing: 2 },

  headerRight: { display: 'flex', alignItems: 'center', gap: 14 },
  clockWrap:   { display: 'flex', flexDirection: 'column', gap: 1, alignItems: 'flex-end' },
  clockLabel:  { fontFamily: 'Share Tech Mono, monospace', fontSize: 8, color: 'rgba(0,255,136,0.6)', letterSpacing: 3 },
  clockVal:    { fontFamily: 'Orbitron, monospace', fontSize: 13, letterSpacing: 3, animation: 'flicker 6s infinite' },
  hDivider:    { width: 1, height: 24, background: 'linear-gradient(180deg, transparent, rgba(0,255,136,0.25), transparent)' },

  neonDivider: { height: 1, background: 'linear-gradient(90deg, transparent, var(--green) 20%, var(--cyan) 50%, var(--green) 80%, transparent)', backgroundSize: '200% 100%', animation: 'shimmer 2s linear infinite', boxShadow: '0 0 10px rgba(0,255,136,0.2)', position: 'relative', zIndex: 9 },

  mainGrid: { flex: 1, display: 'grid', gridTemplateColumns: '1fr 1fr', position: 'relative', zIndex: 1 },
  leftCol:  { display: 'flex', flexDirection: 'column', borderRight: '1px solid rgba(0,255,136,0.12)', overflowY: 'auto', height: 'calc(100vh - 68px)', position: 'relative' },
  rightCol: { display: 'flex', flexDirection: 'column', overflowY: 'auto', height: 'calc(100vh - 68px)' },

  bracketTL: { position: 'absolute', top: 8, left: 8, width: 16, height: 16, borderTop: '1px solid var(--green)', borderLeft: '1px solid var(--green)', pointerEvents: 'none', zIndex: 5, boxShadow: '-2px -2px 6px rgba(0,255,136,0.25)' },
  bracketTR: { position: 'absolute', top: 8, right: 8, width: 16, height: 16, borderTop: '1px solid var(--green)', borderRight: '1px solid var(--green)', pointerEvents: 'none', zIndex: 5, boxShadow: '2px -2px 6px rgba(0,255,136,0.25)' },

  panel:       { padding: '18px 22px', borderBottom: '1px solid rgba(0,255,136,0.08)', background: 'var(--panel)', backdropFilter: 'blur(10px)', position: 'relative', transition: 'background 0.3s ease' },
  controlsRow: { marginTop: 14, paddingTop: 12, borderTop: '1px solid rgba(0,255,136,0.1)' },

  loadingRow:    { display: 'flex', alignItems: 'center', gap: 16, marginBottom: 14 },
  dualRing:      { width: 40, height: 40, position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  dualRingOuter: { position: 'absolute', inset: 0, border: '1px solid rgba(0,200,255,0.25)', borderTop: '1px solid var(--cyan)', borderRadius: '50%', animation: 'spin 1.4s linear infinite', boxShadow: '0 0 8px var(--glow-c)' },
  dualRingInner: { position: 'absolute', inset: 8, border: '1px solid rgba(0,255,136,0.25)', borderBottom: '1px solid var(--green)', borderRadius: '50%', animation: 'spin-reverse 0.9s linear infinite' },
  dualRingCore:  { width: 6, height: 6, borderRadius: '50%', background: 'var(--green)', boxShadow: '0 0 10px var(--glow-g)' },
  loadingTexts:  { display: 'flex', flexDirection: 'column', gap: 8 },
  loadingMain:   { fontFamily: 'Share Tech Mono, monospace', fontSize: 11, color: 'var(--cyan)', letterSpacing: 1 },
  loadingDots:   { display: 'flex', gap: 4 },
  loadingDot:    { width: 4, height: 4, borderRadius: '50%', background: 'var(--green)', boxShadow: '0 0 4px var(--glow-g)', animation: 'glow-pulse 0.8s ease infinite' },

  sourceGrid:     { display: 'flex', flexDirection: 'column', gap: 6, marginTop: 4 },
  sourceRow:      { display: 'flex', alignItems: 'center', gap: 10, padding: '6px 10px', border: '1px solid rgba(0,255,136,0.1)', background: 'rgba(0,255,136,0.025)', borderRadius: 3 },
  sourcePingWrap: { position: 'relative', width: 10, height: 10, flexShrink: 0 },
  sourcePing:     { position: 'absolute', inset: 0, borderRadius: '50%', background: 'var(--green)', opacity: 0.25, animation: 'ping 1.2s ease infinite' },
  sourceDot:      { position: 'absolute', inset: 2, borderRadius: '50%', background: 'var(--green)', boxShadow: '0 0 5px var(--glow-g)' },
  sourceName:     { fontFamily: 'Share Tech Mono, monospace', fontSize: 11, color: 'var(--text2)', flex: 1, letterSpacing: 1 },
  sourceStatus:   { fontFamily: 'Share Tech Mono, monospace', fontSize: 9, color: 'var(--green)', letterSpacing: 2 },

  parsedGrid:      { display: 'grid', gridTemplateColumns: '1fr auto 1fr', gap: 10, alignItems: 'center', marginBottom: 10 },
  parsedBlock:     { display: 'flex', flexDirection: 'column', gap: 4 },
  parsedTag:       { fontFamily: 'Orbitron, sans-serif', fontSize: 8, color: 'rgba(0,255,136,0.7)', letterSpacing: 4 },
  parsedBig:       { fontFamily: 'Orbitron, sans-serif', fontSize: 28, fontWeight: 800, color: 'var(--text)', lineHeight: 1 },
  parsedSym:       { fontFamily: 'Share Tech Mono, monospace', fontSize: 16, letterSpacing: 3, cursor: 'default' },
  parsedCenter:    { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 },
  parsedArrowTrail:{ display: 'flex', gap: 2 },
  parsedTrailDot:  { width: 3, height: 3, borderRadius: '50%', background: 'var(--cyan)', boxShadow: '0 0 4px var(--glow-c)', animation: 'glow-pulse 1s ease infinite' },
  parsedArrow:     { fontFamily: 'Share Tech Mono, monospace', fontSize: 20, animation: 'cyan-pulse 2s ease infinite' },
  parsedSlip:      { fontFamily: 'Share Tech Mono, monospace', fontSize: 9, color: 'rgba(0,212,255,0.8)', border: '1px solid rgba(0,212,255,0.35)', padding: '2px 7px', borderRadius: 2, letterSpacing: 1 },
  aiTag:           { display: 'flex', alignItems: 'center', gap: 6, marginTop: 8, paddingTop: 8, borderTop: '1px solid rgba(0,255,136,0.1)' },
  aiDot:           { width: 4, height: 4, borderRadius: '50%', background: 'var(--green)', boxShadow: '0 0 6px var(--glow-g)' },
  aiLabel:         { fontFamily: 'Share Tech Mono, monospace', fontSize: 9, color: 'rgba(0,255,136,0.65)', letterSpacing: 2 },

  errorRow:    { display: 'flex', alignItems: 'center', gap: 12 },
  errorIcon:   { position: 'relative', width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  errorX:      { fontFamily: 'Orbitron, sans-serif', fontSize: 14, color: 'var(--red)', fontWeight: 700, position: 'relative', zIndex: 1, textShadow: '0 0 10px var(--glow-r)' },
  errorRing:   { position: 'absolute', inset: 0, border: '1px solid rgba(255,51,85,0.5)', borderRadius: '50%', animation: 'red-pulse 1.5s ease infinite' },
  errorTexts:  { flex: 1, display: 'flex', flexDirection: 'column', gap: 4 },
  errorCode:   { fontFamily: 'Orbitron, sans-serif', fontSize: 9, color: 'var(--red)', letterSpacing: 3, textShadow: '0 0 8px var(--glow-r)' },
  errorMsg:    { fontFamily: 'Share Tech Mono, monospace', fontSize: 11, color: 'rgba(255,100,130,0.95)', letterSpacing: 0.5 },
  retryBtn:    { padding: '7px 14px', borderRadius: 3, border: '1px solid rgba(255,51,85,0.45)', background: 'rgba(255,51,85,0.08)', color: 'var(--red)', fontFamily: 'Orbitron, sans-serif', fontSize: 9, letterSpacing: 3, cursor: 'pointer', textShadow: '0 0 8px var(--glow-r)' },

  txRow:       { display: 'flex', alignItems: 'flex-start', gap: 12 },
  txCheck:     { position: 'relative', width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  txCheckMark: { fontFamily: 'Share Tech Mono, monospace', fontSize: 16, position: 'relative', zIndex: 1 },
  txCheckRing: { position: 'absolute', inset: 0, border: '1px solid rgba(0,255,136,0.45)', borderRadius: '50%', animation: 'glow-pulse 2s ease infinite' },
  txTexts:     { display: 'flex', flexDirection: 'column', gap: 4 },
  txTitle:     { fontFamily: 'Orbitron, sans-serif', fontSize: 11, letterSpacing: 3 },
  txSub:       { fontFamily: 'Share Tech Mono, monospace', fontSize: 11, color: 'var(--text2)' },
  explorerLink:{ fontFamily: 'Share Tech Mono, monospace', fontSize: 10, color: 'var(--cyan)', textDecoration: 'none', letterSpacing: 1, marginTop: 3, display: 'inline-block', padding: '3px 8px', border: '1px solid rgba(0,212,255,0.3)', borderRadius: 2 },

  footer:  { padding: '12px 22px', marginTop: 'auto', display: 'flex', justifyContent: 'space-between', borderTop: '1px solid rgba(0,255,136,0.08)' },
  footerL: { fontFamily: 'Share Tech Mono, monospace', fontSize: 8, color: 'rgba(0,255,136,0.5)', letterSpacing: 2 },
  footerR: { fontFamily: 'Orbitron, sans-serif', fontSize: 8, color: 'rgba(0,255,136,0.5)', letterSpacing: 3 },

  emptyPanel:   { display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: 'calc(100vh - 80px)', gap: 18, padding: '40px 28px', textAlign: 'center' },
  emptyHexWrap: { position: 'relative', width: 80, height: 80, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 4 },
  emptyHex:     { width: 60, height: 60, border: '1px solid rgba(0,255,136,0.25)', transform: 'rotate(45deg)', animation: 'spin 12s linear infinite', boxShadow: '0 0 20px rgba(0,255,136,0.06)' },
  emptyHexInner:{ position: 'absolute', width: 30, height: 30, border: '1px solid rgba(0,200,255,0.35)', transform: 'rotate(45deg)', animation: 'spin-reverse 6s linear infinite', boxShadow: '0 0 10px rgba(0,200,255,0.12)' },
  emptyTitle:   { fontFamily: 'Orbitron, sans-serif', fontSize: 16, color: 'var(--green)', letterSpacing: 5, textShadow: '0 0 14px var(--glow-g)' },
  emptySub:     { fontFamily: 'Share Tech Mono, monospace', fontSize: 11, color: 'rgba(0,255,136,0.6)', letterSpacing: 2 },
  emptyExList:  { display: 'flex', flexDirection: 'column', gap: 7, width: '100%', maxWidth: 300 },
  emptyEx:      { display: 'flex', alignItems: 'center', gap: 10, padding: '8px 14px', border: '1px solid rgba(0,255,136,0.12)', borderRadius: 3, background: 'rgba(0,255,136,0.025)', cursor: 'default' },
  exArrow:      { fontFamily: 'Share Tech Mono, monospace', fontSize: 10, color: 'var(--green)', flexShrink: 0 },
  exText:       { fontFamily: 'Share Tech Mono, monospace', fontSize: 11, color: 'var(--text2)', textAlign: 'left' },
  emptyStats:   { display: 'flex', gap: 28, marginTop: 6 },
  emptyStat:    { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3 },
  emptyStatN:   { fontFamily: 'Orbitron, sans-serif', fontSize: 24, fontWeight: 800, animation: 'count-in 0.5s ease both' },
  emptyStatL:   { fontFamily: 'Share Tech Mono, monospace', fontSize: 8, color: 'rgba(0,255,136,0.6)', letterSpacing: 3 },

  loadingRingWrap: { position: 'relative', width: 90, height: 90, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 8 },
  loadingRing1:    { position: 'absolute', inset: 0, border: '1px solid rgba(0,255,136,0.18)', borderTop: '1px solid var(--green)', borderRadius: '50%', animation: 'spin 2s linear infinite', boxShadow: '0 0 12px rgba(0,255,136,0.12)' },
  loadingRing2:    { position: 'absolute', inset: 14, border: '1px solid rgba(0,200,255,0.18)', borderRight: '1px solid var(--cyan)', borderRadius: '50%', animation: 'spin-reverse 1.4s linear infinite' },
  loadingRing3:    { position: 'absolute', inset: 28, border: '1px solid rgba(187,68,255,0.22)', borderBottom: '1px solid var(--purple)', borderRadius: '50%', animation: 'spin 1s linear infinite' },
  loadingCore:     { width: 14, height: 14, borderRadius: '50%', background: 'var(--green)', boxShadow: '0 0 20px var(--glow-g), 0 0 40px var(--glow-g)' },
  loadingBig:      { fontFamily: 'Orbitron, sans-serif', fontSize: 14, letterSpacing: 5, animation: 'flicker 2s infinite' },
  loadingSmall:    { fontFamily: 'Share Tech Mono, monospace', fontSize: 10, color: 'rgba(0,255,136,0.6)', letterSpacing: 2 },
  loadingCards:    { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, width: '100%', maxWidth: 280, marginTop: 8 },
  loadingCard:     { display: 'flex', alignItems: 'center', gap: 8, padding: '10px 14px', border: '1px solid rgba(0,255,136,0.12)', borderRadius: 3, background: 'rgba(0,255,136,0.025)' },
  loadingCardDot:  { width: 6, height: 6, borderRadius: '50%', background: 'var(--green)', boxShadow: '0 0 8px var(--glow-g)', animation: 'glow-pulse 1s ease infinite' },
  loadingCardName: { fontFamily: 'Orbitron, sans-serif', fontSize: 9, color: 'var(--text2)', letterSpacing: 2 },
}