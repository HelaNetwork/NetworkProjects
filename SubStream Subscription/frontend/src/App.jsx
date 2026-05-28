import { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import './index.css';

function App() {
  const [wallet, setWallet] = useState(null);
  const [darkMode, setDarkMode] = useState(false);
  
  // Subscription State
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [creatorTokens, setCreatorTokens] = useState(0);
  const [nextPayment, setNextPayment] = useState("-");

  useEffect(() => {
    if (darkMode) document.body.classList.add('dark-mode');
    else document.body.classList.remove('dark-mode');
  }, [darkMode]);

  const connectWallet = async () => {
    if (window.ethereum) {
      try {
        const provider = new ethers.BrowserProvider(window.ethereum);
        const signer = await provider.getSigner();
        const address = await signer.getAddress();
        setWallet(address);
      } catch (err) {
        console.error("Connection failed", err);
      }
    } else {
      alert("Please install MetaMask!");
    }
  };

  const subscribe = () => {
    if (!wallet) return alert("Connect wallet first");
    alert("Processing 0.05 ETH subscription payment...");
    setTimeout(() => {
      setIsSubscribed(true);
      setCreatorTokens(creatorTokens + 100);
      
      const date = new Date();
      date.setDate(date.getDate() + 30);
      setNextPayment(date.toLocaleDateString());
      
      alert("Successfully subscribed! You received an Access NFT and 100 Creator Tokens.");
    }, 1500);
  };

  return (
    <div className="container">
      <nav className="navbar">
        <div className="logo">SubStream</div>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <button className="btn" onClick={() => setDarkMode(!darkMode)} style={{ padding: '0.5rem' }}>
            {darkMode ? 'LIGHT' : 'DARK'}
          </button>
          {!wallet ? (
            <button className="btn btn-primary" onClick={connectWallet}>CONNECT WALLET</button>
          ) : (
            <button className="btn" onClick={() => setWallet(null)}>
              {wallet.substring(0, 6)}...{wallet.substring(38)}
            </button>
          )}
        </div>
      </nav>

      {!wallet ? (
        // Landing Page
        <main>
          <div className="hero-grid">
            <div className="hero-text">
              <h1>The Institutional Standard for Creator Subscriptions.</h1>
              <p>
                Deploy recurring on-chain billing. Issue exclusive ERC20 ecosystem tokens. Gate premium content using automated Access NFTs.
              </p>
              <button className="btn btn-primary" onClick={connectWallet} style={{ fontSize: '1.1rem', padding: '1rem 2.5rem' }}>
                ENTER APP
              </button>
            </div>
            
            <div className="mockup-panel">
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-color)', paddingBottom: '1rem', marginBottom: '1.5rem' }}>
                <span style={{ fontWeight: 600 }}>Creator Dashboard</span>
                <span style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>Simulation</span>
              </div>
              
              <div className="stat-group">
                <div className="stat-label">Subscription Status</div>
                <div className="stat-value" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div style={{ width: '10px', height: '10px', backgroundColor: '#10b981', borderRadius: '50%' }}></div>
                  ACTIVE
                </div>
              </div>

              <div className="stat-group">
                <div className="stat-label">Creator Tokens Balance</div>
                <div className="stat-value" style={{ color: '#8b5cf6' }}>100 CTK</div>
              </div>
              
              <div style={{ marginTop: '2rem', padding: '1rem', backgroundColor: 'var(--bg-secondary)', border: '1px dashed var(--border-color)', borderRadius: '4px' }}>
                <h4 style={{ marginBottom: '0.5rem', fontSize: '0.9rem' }}>🔓 Premium Content Unlocked</h4>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>You hold the Access NFT. You can now view exclusive reports and join the private Discord.</p>
              </div>
            </div>
          </div>

          <div className="stepper">
            <div className="step-item">
              <div className="step-num">01</div>
              <div className="step-title">Connect Wallet</div>
              <div className="step-desc">Sign in with MetaMask or any Web3 provider.</div>
            </div>
            <div className="step-item">
              <div className="step-num">02</div>
              <div className="step-title">Execute Smart Contract</div>
              <div className="step-desc">Approve the recurring monthly ETH payment.</div>
            </div>
            <div className="step-item">
              <div className="step-num">03</div>
              <div className="step-title">Unlock Ecosystem</div>
              <div className="step-desc">Instantly receive your Access NFT and CTK rewards.</div>
            </div>
          </div>

          <section className="stats-bar">
            <div className="stat-box">
              <h3>$1.2M+</h3>
              <p>Volume Processed</p>
            </div>
            <div className="stat-box">
              <h3>15,000+</h3>
              <p>Access NFTs Minted</p>
            </div>
            <div className="stat-box">
              <h3>0%</h3>
              <p>Protocol Fees</p>
            </div>
          </section>

          <section className="features-deep-dive">
            <h2>Why On-Chain Subscriptions?</h2>
            
            <div className="deep-dive-grid">
              <div className="deep-dive-text">
                <h3>Automated Settlement</h3>
                <p>Say goodbye to chargebacks, holding periods, and arbitrary platform bans. Smart contracts automatically process 30-day payment cycles directly from the subscriber's wallet to yours. Total financial sovereignty.</p>
              </div>
              <div style={{ padding: '2rem', backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-color)', textAlign: 'center', fontSize: '3rem' }}>
                ⚡
              </div>
            </div>

            <div className="deep-dive-grid" style={{ direction: 'rtl' }}>
              <div className="deep-dive-text" style={{ direction: 'ltr' }}>
                <h3>Dynamic Access NFTs</h3>
                <p>Instead of manually managing Discord roles or website logins, your subscribers automatically mint an ERC721 Access NFT. If their subscription lapses, the NFT's metadata dynamically updates to revoke access.</p>
              </div>
              <div style={{ padding: '2rem', backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-color)', textAlign: 'center', fontSize: '3rem', direction: 'ltr' }}>
                🔐
              </div>
            </div>
            
            <div className="deep-dive-grid">
              <div className="deep-dive-text">
                <h3>Ecosystem Rewards</h3>
                <p>Web2 platforms take value from creators. We help you create it. Automatically airdrop your own ERC20 Creator Tokens (CTK) to long-term subscribers to incentivize loyalty and bootstrap your personal economy.</p>
              </div>
              <div style={{ padding: '2rem', backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-color)', textAlign: 'center', fontSize: '3rem' }}>
                💎
              </div>
            </div>
          </section>

          <section className="faq-section">
            <h2>Frequently Asked Questions</h2>
            <div className="faq-grid">
              <div className="faq-item">
                <h4>Do my subscribers need to pay gas every month?</h4>
                <p>No. Subscribers sign a one-time gasless approval via EIP-2612 permit. Our protocol relayer handles the monthly execution so they never have to worry about gas spikes.</p>
              </div>
              <div className="faq-item">
                <h4>Can I token-gate a Discord server?</h4>
                <p>Yes. The Access NFT minted to subscribers can be instantly linked to Collab.Land or Guild.xyz to automate Discord role management.</p>
              </div>
              <div className="faq-item">
                <h4>What happens if a payment fails?</h4>
                <p>The protocol grants a 3-day grace period. If the wallet still lacks sufficient funds, the Access NFT is temporarily frozen until payment is settled.</p>
              </div>
              <div className="faq-item">
                <h4>Can I customize my Creator Token?</h4>
                <p>Absolutely. You determine the ticker, initial supply, and the exact drop rate rewarded to subscribers per billing cycle.</p>
              </div>
            </div>
          </section>

          <footer className="site-footer">
            <div className="logo" style={{ fontSize: '1rem' }}>SubProtocol</div>
            <div className="footer-links">
              <a href="#">Documentation</a>
              <a href="#">Security Audit</a>
              <a href="#">Twitter / X</a>
              <a href="#">Terms of Service</a>
            </div>
          </footer>
        </main>
      ) : (
        // Dashboard
        <main className="dashboard-grid">
          <div className="panel" style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            <div>
              <h2 className="panel-header">Exclusive Content</h2>
              {!isSubscribed ? (
                <div className="locked-overlay">
                  <div>Access NFT Required</div>
                  <div style={{ fontSize: '0.8rem', marginTop: '0.5rem' }}>Subscribe to unlock</div>
                </div>
              ) : (
                <div className="content-grid">
                  <div className="content-card">
                    <h4 style={{ marginBottom: '0.5rem' }}>Alpha Report #12</h4>
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Deep dive into zero-knowledge rollups and upcoming airdrops.</p>
                  </div>
                  <div className="content-card">
                    <h4 style={{ marginBottom: '0.5rem' }}>Private Discord Link</h4>
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Click to verify your Access NFT and join the community.</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="panel">
            <h2 className="panel-header">Subscription Status</h2>
            
            <div className="stat-group">
              <div className="stat-label">Status</div>
              <div className="stat-value" style={{ color: isSubscribed ? 'var(--text-primary)' : 'var(--text-secondary)' }}>
                {isSubscribed ? 'ACTIVE' : 'INACTIVE'}
              </div>
            </div>

            <div className="stat-group">
              <div className="stat-label">Creator Tokens Balance</div>
              <div className="stat-value">{creatorTokens} CTK</div>
            </div>

            <div className="stat-group">
              <div className="stat-label">Next Payment Due</div>
              <div className="stat-value" style={{ fontSize: '1.2rem' }}>{nextPayment}</div>
            </div>

            <div style={{ marginTop: '2.5rem', borderTop: '1px solid var(--border-color)', paddingTop: '1.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem', fontSize: '0.9rem' }}>
                <span>Monthly Fee</span>
                <span style={{ fontWeight: 600 }}>0.05 ETH</span>
              </div>
              <button 
                className="btn btn-primary" 
                style={{ width: '100%' }} 
                onClick={subscribe}
                disabled={isSubscribed}
              >
                {isSubscribed ? 'SUBSCRIBED' : 'SUBSCRIBE NOW'}
              </button>
            </div>
          </div>
        </main>
      )}
    </div>
  );
}

export default App;
