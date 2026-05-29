import { useState } from 'react';
import './index.css';

function App() {
  const [wallet, setWallet] = useState(null);
  const [intentText, setIntentText] = useState("");
  const [parsedRoute, setParsedRoute] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const connectWallet = async () => {
    if (window.ethereum) {
      try {
        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
        const account = accounts[0];
        setWallet(account);
      } catch (err) {
        console.error("Connection failed", err);
      }
    } else {
      alert("Please install MetaMask!");
    }
  };

  // Very basic NLP simulation
  const handleAnalyzeIntent = () => {
    if (!intentText.trim()) return;
    
    setIsProcessing(true);
    setParsedRoute(null);

    setTimeout(() => {
      const match = intentText.match(/(\d+(?:\.\d+)?)\s*([a-zA-Z]+).*(?:to|for)\s*([a-zA-Z]+)/i);
      
      let amountIn = "1.0";
      let tokenIn = "ETH";
      let tokenOut = "USDC";

      if (match) {
        amountIn = match[1];
        tokenIn = match[2].toUpperCase();
        tokenOut = match[3].toUpperCase();
      }

      const rateMultiplier = Math.random() * (3500 - 3400) + 3400;
      let amountOut = (parseFloat(amountIn) * rateMultiplier).toFixed(2);
      
      if (tokenIn !== "ETH") {
        amountOut = (parseFloat(amountIn) * 1.05).toFixed(2); 
      }

      setParsedRoute({
        amountIn,
        tokenIn,
        amountOut,
        tokenOut,
        routePath: `1inch -> Uniswap V3 -> ${tokenOut}`,
        fee: "0.01%"
      });
      setIsProcessing(false);
    }, 1200);
  };

  const handleExecute = () => {
    if (!wallet) return alert("Please connect wallet first");
    alert(`Executing Swap: ${parsedRoute.amountIn} ${parsedRoute.tokenIn} -> ${parsedRoute.amountOut} ${parsedRoute.tokenOut}`);
    setTimeout(() => {
        alert("✅ Transaction confirmed on Hela Testnet!");
        setParsedRoute(null);
        setIntentText("");
    }, 1000);
  };

  return (
    <>
      <nav className="navbar">
        <div className="logo">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" color="var(--brand-yellow)">
            <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon>
          </svg>
          VORTEX FINANCE
        </div>
        
        <div className="nav-links">
          <span className="nav-link">Markets</span>
          <span className="nav-link">Trade</span>
          <span className="nav-link">Earn</span>
          <span className="nav-link">Square</span>
        </div>

        {!wallet ? (
          <button className="btn btn-primary" onClick={connectWallet}>Connect Wallet</button>
        ) : (
          <button className="btn" onClick={() => setWallet(null)}>
            {wallet.substring(0,6)}...{wallet.substring(38)}
          </button>
        )}
      </nav>

      <div className="hero-container">
        
        {/* LEFT COLUMN: HERO COPY */}
        <div className="hero-left">
          <h1 className="hero-title">
            Trade Crypto with <span>AI Intents</span>
          </h1>
          <p className="hero-subtitle">
            Skip the slippage settings, routing protocols, and multi-step approvals. Simply type what you want to do, and our AI-powered solver will execute the optimal path on the Hela Testnet.
          </p>
          
          <div className="stats-grid">
            <div className="stat-item">
              <span className="stat-value">$12B+</span>
              <span className="stat-label">24h Volume</span>
            </div>
            <div className="stat-item">
              <span className="stat-value">250+</span>
              <span className="stat-label">Assets Supported</span>
            </div>
            <div className="stat-item">
              <span className="stat-value">0.01%</span>
              <span className="stat-label">Maker/Taker Fees</span>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: SWAP TERMINAL */}
        <div className="hero-right">
          <div className="swap-panel">
            <div className="panel-header">Agent Swap</div>
            <div className="panel-subheader">Type your intent in natural language.</div>
            
            <div className="intent-input-wrapper">
              <textarea 
                className="intent-input"
                placeholder="e.g. Convert 1.5 ETH to best possible USDC rate..."
                value={intentText}
                onChange={(e) => setIntentText(e.target.value)}
              />
            </div>

            {!parsedRoute ? (
              <button 
                className="btn btn-primary" 
                style={{ width: '100%', padding: '1rem', fontSize: '1.1rem' }}
                onClick={handleAnalyzeIntent}
                disabled={isProcessing || !intentText.trim()}
              >
                {isProcessing ? 'Agent is finding best route...' : 'Analyze Intent'}
              </button>
            ) : (
              <>
                <div className="route-panel">
                  <div className="route-header">Optimal Route Found</div>
                  <div className="route-details">
                    <div className="route-row">
                      <span className="route-label">Pay</span>
                      <span className="route-val">{parsedRoute.amountIn} {parsedRoute.tokenIn}</span>
                    </div>
                    <div className="route-row">
                      <span className="route-label">Receive (Est)</span>
                      <span className="route-val highlight">{parsedRoute.amountOut} {parsedRoute.tokenOut}</span>
                    </div>
                    <div className="route-row">
                      <span className="route-label">Best Path</span>
                      <span className="route-val" style={{ color: 'var(--text-secondary)' }}>{parsedRoute.routePath}</span>
                    </div>
                    <div className="route-row">
                      <span className="route-label">Network Fee</span>
                      <span className="route-val">{parsedRoute.fee}</span>
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '1rem' }}>
                  <button className="btn" style={{ flex: 1 }} onClick={() => setParsedRoute(null)}>
                    Cancel
                  </button>
                  <button className="btn btn-primary" style={{ flex: 2, fontSize: '1.1rem' }} onClick={handleExecute}>
                    Execute Swap
                  </button>
                </div>
              </>
            )}
          </div>
        </div>

      </div>
    </>
  );
}

export default App;
