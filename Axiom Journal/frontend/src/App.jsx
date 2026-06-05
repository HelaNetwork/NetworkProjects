import { useState } from 'react';
import { ethers } from 'ethers';
import './index.css';

function App() {
  const [wallet, setWallet] = useState(null);
  
  // Dummy Data
  const [papers, setPapers] = useState([
    {
      id: 1,
      title: "Quantum Entanglement in Macroscopic Systems",
      author: "0x7F...2B4",
      ipfs: "ipfs://QmXyZ1...",
      market: { yesShares: 1450, noShares: 320 }
    },
    {
      id: 2,
      title: "CRISPR-Cas9 Off-Target Effects Mitigation via ML",
      author: "0x1A...9C8",
      ipfs: "ipfs://QmABC9...",
      market: { yesShares: 890, noShares: 1200 }
    }
  ]);

  const [newTitle, setNewTitle] = useState("");
  const [newIpfs, setNewIpfs] = useState("");

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

  const publishPaper = () => {
    if (!wallet) return alert("Wallet not connected");
    if (!newTitle || !newIpfs) return alert("Fill out fields");
    
    alert(`Publishing paper and deploying Prediction Market...`);
    setTimeout(() => {
      const newPaper = {
        id: Date.now(),
        title: newTitle,
        author: wallet.substring(0,6) + "..." + wallet.substring(38),
        ipfs: newIpfs,
        market: { yesShares: 0, noShares: 0 }
      };
      setPapers([newPaper, ...papers]);
      setNewTitle("");
      setNewIpfs("");
      alert("Successfully published!");
    }, 1500);
  };

  const buyShares = (paperId, type) => {
    if (!wallet) return alert("Wallet not connected");
    alert(`Buying ${type} shares for Paper #${paperId}...`);
    
    setTimeout(() => {
      setPapers(papers.map(p => {
        if (p.id === paperId) {
          return {
            ...p,
            market: {
              yesShares: type === 'YES' ? p.market.yesShares + 100 : p.market.yesShares,
              noShares: type === 'NO' ? p.market.noShares + 100 : p.market.noShares
            }
          }
        }
        return p;
      }));
    }, 1000);
  };

  return (
    <div className="container">
      <header className="header">
        <div className="logo">Axiom Journal [PROTOCOL_V1]</div>
        {!wallet ? (
          <button className="btn btn-accent" onClick={connectWallet}>[ CONNECT_WALLET ]</button>
        ) : (
          <button className="btn" onClick={() => setWallet(null)}>
            [ {wallet.substring(0,6)}...{wallet.substring(38)} ]
          </button>
        )}
      </header>

      <div className="status-bar">
        <div>STATUS: <span className="status-text">{wallet ? "ONLINE" : "READ_ONLY"}</span></div>
        <div>MARKETS_ACTIVE: <span className="status-text">{papers.length}</span></div>
        <div>SYS_TIME: <span className="status-text">{new Date().toISOString()}</span></div>
      </div>

      <div className="dashboard">
        <div className="panel">
          <div className="panel-title">LATEST_PUBLICATIONS & MARKETS</div>
          
          {papers.map(p => (
            <div className="paper-item" key={p.id}>
              <div className="paper-title">&gt; {p.title}</div>
              <div className="paper-meta">
                AUTHOR: {p.author} | IPFS_HASH: {p.ipfs}
              </div>
              
              <div className="market-stats">
                <div className="stat-box">
                  <span className="stat-label">YES (Valid) Shares</span>
                  <span className="stat-val" style={{ color: 'var(--bp-accent)' }}>{p.market.yesShares}</span>
                </div>
                <div className="stat-box">
                  <span className="stat-label">NO (Flawed) Shares</span>
                  <span className="stat-val">{p.market.noShares}</span>
                </div>
                <div className="stat-box">
                  <span className="stat-label">Probability (Valid)</span>
                  <span className="stat-val">
                    {p.market.yesShares + p.market.noShares === 0 
                      ? "50%" 
                      : Math.round((p.market.yesShares / (p.market.yesShares + p.market.noShares)) * 100) + "%"}
                  </span>
                </div>
              </div>

              <div className="action-row">
                <button className="btn" disabled={!wallet} onClick={() => buyShares(p.id, 'YES')}>
                  [ PREDICT_VALID (+ETH) ]
                </button>
                <button className="btn" disabled={!wallet} onClick={() => buyShares(p.id, 'NO')}>
                  [ PREDICT_FLAWED (+ETH) ]
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="panel" style={{ height: 'fit-content' }}>
          <div className="panel-title">PUBLISH_RESEARCH</div>
          <div style={{ fontSize: '0.85rem', marginBottom: '1.5rem', color: 'rgba(255,255,255,0.8)' }}>
            Publishing automatically deploys a prediction market to crowdsource peer review and validation integrity.
          </div>
          
          <input 
            type="text" 
            className="form-input" 
            placeholder="PAPER_TITLE..." 
            value={newTitle}
            onChange={e => setNewTitle(e.target.value)}
            disabled={!wallet}
          />
          <input 
            type="text" 
            className="form-input" 
            placeholder="IPFS_HASH (CID)..." 
            value={newIpfs}
            onChange={e => setNewIpfs(e.target.value)}
            disabled={!wallet}
          />
          
          <button 
            className="btn btn-accent" 
            style={{ width: '100%' }}
            onClick={publishPaper}
            disabled={!wallet}
          >
            [ EXECUTE_PUBLISH ]
          </button>
          
          {!wallet && (
            <div style={{ marginTop: '1rem', color: 'var(--bp-accent)', fontSize: '0.8rem', textAlign: 'center' }}>
              * CONNECT WALLET TO PUBLISH OR PREDICT *
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;
