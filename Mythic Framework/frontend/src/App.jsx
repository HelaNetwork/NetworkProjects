import { useState, useRef, useEffect } from 'react';
import './index.css';

function App() {
  const [wallet, setWallet] = useState(null);
  const [activeTab, setActiveTab] = useState('store');
  
  // Game State
  const [myCards, setMyCards] = useState([
    { id: 1, name: "Goblin Grunt", rarity: "Common", power: 2 },
    { id: 2, name: "Elven Archer", rarity: "Rare", power: 4 },
  ]);
  
  // Arena State
  const [isMyTurn, setIsMyTurn] = useState(true);
  const [myHP, setMyHP] = useState(30);
  const [oppHP, setOppHP] = useState(30);
  const [myActiveCard] = useState({ name: "Dragon Rider", power: 8 });
  const [oppActiveCard] = useState({ name: "Orc Warlord", power: 5 });
  const [battleLog, setBattleLog] = useState([
    { id: 1, type: "system", text: "Match found. Player goes first." }
  ]);
  
  const logEndRef = useRef(null);

  useEffect(() => {
    if (logEndRef.current) {
      logEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [battleLog]);

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

  const buyBoosterPack = () => {
    if (!wallet) return alert("Connect wallet first");
    alert("Minting 3 cards via onchain rarity curve...");
    setTimeout(() => {
      const newCard = { 
        id: Date.now(), 
        name: "Dragon Rider", 
        rarity: "Legendary", 
        power: 8 
      };
      setMyCards([...myCards, newCard]);
      alert("Pack opened! You found a Legendary Dragon Rider!");
    }, 1500);
  };

  const addLog = (type, text) => {
    const time = new Date().toLocaleTimeString([], { hour12: false, hour: '2-digit', minute:'2-digit', second:'2-digit' });
    setBattleLog(prev => [...prev, { id: Date.now(), type, text: `[${time}] ${text}` }]);
  };

  const attackOpponent = () => {
    if (!isMyTurn) return;
    
    addLog("my-action", `${myActiveCard.name} attacked for ${myActiveCard.power} damage!`);
    setOppHP(prev => Math.max(0, prev - myActiveCard.power));
    
    setIsMyTurn(false);
    
    // Simulate opponent turn
    setTimeout(() => {
      addLog("opp-action", `Opponent's ${oppActiveCard.name} attacked for ${oppActiveCard.power} damage!`);
      setMyHP(prev => Math.max(0, prev - oppActiveCard.power));
      setIsMyTurn(true);
      addLog("system", "It is your turn.");
    }, 2500);
  };

  return (
    <>
      <nav className="navbar">
        <div className="container" style={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
          <div className="logo">
            <span className="logo-accent">MYTHIC</span> CARDS
          </div>
          {!wallet ? (
            <button className="btn btn-primary" onClick={connectWallet}>Connect Wallet</button>
          ) : (
            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
              <div style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', fontWeight: 600, textTransform: 'uppercase' }}>
                Season 1
              </div>
              <button className="btn" onClick={() => setWallet(null)}>
                {wallet.length === 42 ? `${wallet.substring(0, 6)}...${wallet.substring(38)}` : "DUMMY ARENA"}
              </button>
            </div>
          )}
        </div>
      </nav>

      <div className="container">
        {!wallet ? (
          <main>
            <div className="hero-grid">
              <div className="hero-text">
                <h1>The Arena Awaits.</h1>
                <p>
                  True ownership of every asset. Fully onchain battle mechanics, verifiably fair rarity curves, and seasonal leaderboards. Play the most hardcore Web3 TCG.
                </p>
                <div className="hero-buttons">
                  <button className="btn btn-success" onClick={connectWallet} style={{ fontSize: '1.2rem', padding: '1rem 2.5rem' }}>
                    PLAY NOW
                  </button>
                  <button className="btn" onClick={() => {
                    setWallet("0xDUMMY...ARENA");
                    setActiveTab('arena');
                  }} style={{ fontSize: '1.1rem', padding: '1rem 2rem' }}>
                    Dummy Arena
                  </button>
                </div>
              </div>

              <div className="mockup-card">
                <div className="mockup-card-image">🐉</div>
                <div className="mockup-card-title">
                  <span>Dragon Rider</span>
                  <span style={{ color: '#ffb018', fontSize: '1rem', display: 'flex', alignItems: 'center' }}>LEGENDARY</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-secondary)', marginTop: '1rem' }}>
                  <span>Power Rating</span>
                  <span style={{ fontWeight: 800, fontSize: '1.2rem', color: 'var(--text-primary)' }}>8</span>
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
                <div className="step-title">Mint Pack</div>
                <div className="step-desc">Generate 3 cards via onchain VRF rarity curves.</div>
              </div>
              <div className="step-item">
                <div className="step-num">03</div>
                <div className="step-title">Battle</div>
                <div className="step-desc">Fight opponents using immutable smart contract logic.</div>
              </div>
            </div>

            <section className="stats-bar">
              <div className="stat-item">
                <h4>24,500+</h4>
                <p>Cards Minted</p>
              </div>
              <div className="stat-item">
                <h4>500 ETH</h4>
                <p>Tournament Pool</p>
              </div>
              <div className="stat-item">
                <h4>0%</h4>
                <p>Marketplace Fees</p>
              </div>
            </section>

            <section className="features-deep-dive">
              <h2>Why Onchain TCG?</h2>
              
              <div className="deep-dive-grid">
                <div className="deep-dive-text">
                  <h3>True Asset Ownership</h3>
                  <p>In Web2 games, your cards are just database entries that can be banned or nerfed at any time. Here, every card is an ERC721 token in your wallet. You own it. You can trade it. You can burn it.</p>
                </div>
                <div className="rigid-icon-box">🛡️</div>
              </div>

              <div className="deep-dive-grid" style={{ direction: 'rtl' }}>
                <div className="deep-dive-text" style={{ direction: 'ltr' }}>
                  <h3>Verifiable Onchain RNG</h3>
                  <p>Never question pack odds again. Booster packs are generated using Chainlink VRF directly on the blockchain, ensuring the rarity curve is mathematically fair and public.</p>
                </div>
                <div className="rigid-icon-box" style={{ direction: 'ltr' }}>🎲</div>
              </div>
              
              <div className="deep-dive-grid">
                <div className="deep-dive-text">
                  <h3>Immutable Battle Logic</h3>
                  <p>The entire game engine lives in smart contracts. Card interactions, damage calculations, and turn logic execute transparently onchain, preventing any form of server-side manipulation or cheating.</p>
                </div>
                <div className="rigid-icon-box">⚔️</div>
              </div>
            </section>

            <section className="faq-section">
              <h2>Frequently Asked Questions</h2>
              <div className="faq-grid">
                <div className="faq-item">
                  <h4>Do I need crypto to play?</h4>
                  <p>Yes. You will need a Web3 wallet (like MetaMask) and testnet tokens to mint your initial booster packs and execute moves in the Arena.</p>
                </div>
                <div className="faq-item">
                  <h4>Can the developers nerf my cards?</h4>
                  <p>No. Once a season's smart contracts are deployed, they are immutable. We cannot alter the stats or abilities of a card you already own.</p>
                </div>
                <div className="faq-item">
                  <h4>How do tournament payouts work?</h4>
                  <p>The 500 ETH prize pool is locked in a smart contract. The contract automatically reads the seasonal leaderboard and disburses payouts to the top 100 players when the epoch ends.</p>
                </div>
                <div className="faq-item">
                  <h4>Is trading allowed outside the game?</h4>
                  <p>Absolutely. Because your cards are standard NFTs, you can list them on OpenSea, Blur, or any external marketplace. We take 0% creator royalties.</p>
                </div>
              </div>
            </section>

          </main>
        ) : (
          <main>
            <div className="dashboard-nav">
              <button className={`tab ${activeTab === 'store' ? 'active' : ''}`} onClick={() => setActiveTab('store')}>Store & Packs</button>
              <button className={`tab ${activeTab === 'collection' ? 'active' : ''}`} onClick={() => setActiveTab('collection')}>My Collection</button>
              <button className={`tab ${activeTab === 'arena' ? 'active' : ''}`} onClick={() => setActiveTab('arena')}>Battle Arena</button>
            </div>

            {activeTab === 'store' && (
              <div className="grid">
                <div className="card-panel">
                  <div className="card-panel-header">
                    <h3>Base Set Booster Pack</h3>
                  </div>
                  <div style={{ margin: '1rem 0', color: 'var(--text-secondary)' }}>
                    Contains 3 pseudo-random cards generated via onchain rarity curve.
                  </div>
                  <div style={{ fontSize: '1.5rem', fontWeight: 800, margin: '1rem 0' }}>
                    0.05 ETH
                  </div>
                  <button className="btn btn-success" style={{ width: '100%' }} onClick={buyBoosterPack}>
                    Buy & Open Pack
                  </button>
                </div>
              </div>
            )}

            {activeTab === 'collection' && (
              <div className="grid">
                {myCards.map(card => (
                  <div className="card-panel" key={card.id}>
                    <div className="card-panel-header">
                      <h3>{card.name}</h3>
                      <span className={`rarity-tag rarity-${card.rarity}`}>{card.rarity}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '1rem' }}>
                      <span style={{ color: 'var(--text-secondary)' }}>Power:</span>
                      <span style={{ fontWeight: 800, fontSize: '1.2rem', color: 'var(--accent-blue)' }}>{card.power}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {activeTab === 'arena' && (
              <div className="arena-grid">
                
                {/* 1. ARENA BOARD */}
                <div className="arena-board">
                  
                  {/* Opponent Zone */}
                  <div className="player-zone">
                    <div className="player-stats">
                      <div style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', textTransform: 'uppercase', fontWeight: 700 }}>Opponent</div>
                      <div style={{ fontWeight: 800, fontSize: '1.1rem' }}>0x4B2...9F1</div>
                      <div className="hp-badge" style={{ backgroundColor: 'var(--accent-red)' }}>{oppHP} HP</div>
                    </div>
                    <div className="board-slot enemy-card">
                       <span style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>👹</span>
                       <span style={{ fontWeight: 800 }}>{oppActiveCard.name}</span>
                       <span style={{ color: 'var(--accent-red)', marginTop: '0.5rem' }}>Power: {oppActiveCard.power}</span>
                    </div>
                  </div>

                  {/* Center Indicator */}
                  <div className="turn-indicator" style={{ 
                    color: isMyTurn ? 'var(--accent-green)' : 'var(--accent-red)',
                    borderColor: isMyTurn ? 'var(--accent-green)' : 'var(--accent-red)'
                  }}>
                    {isMyTurn ? 'YOUR TURN' : 'OPPONENT TURN'}
                  </div>

                  {/* My Zone */}
                  <div className="player-zone">
                    <div 
                      className="board-slot active-card" 
                      onClick={attackOpponent}
                      style={{ cursor: isMyTurn ? 'pointer' : 'not-allowed', opacity: isMyTurn ? 1 : 0.6 }}
                      title={isMyTurn ? "Click to Attack!" : "Wait for your turn"}
                    >
                       <span style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>🐉</span>
                       <span style={{ fontWeight: 800 }}>{myActiveCard.name}</span>
                       <span style={{ color: 'var(--accent-blue)', marginTop: '0.5rem' }}>Power: {myActiveCard.power}</span>
                       {isMyTurn && <div style={{ marginTop: '0.5rem', fontSize: '0.75rem', color: 'var(--accent-green)' }}>CLICK TO ATTACK</div>}
                    </div>
                    
                    <div className="player-stats" style={{ textAlign: 'right' }}>
                      <div style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', textTransform: 'uppercase', fontWeight: 700 }}>You</div>
                      <div style={{ fontWeight: 800, fontSize: '1.1rem' }}>{wallet.substring(0,6)}...</div>
                      <div className="hp-badge" style={{ backgroundColor: 'var(--accent-green)' }}>{myHP} HP</div>
                    </div>
                  </div>

                </div>

                {/* 2. ACTION LOG */}
                <div className="arena-log">
                  <div className="log-header">Battle Log</div>
                  <div className="log-content">
                    {battleLog.map(log => (
                      <div key={log.id} className={`log-entry ${log.type}`}>
                        {log.text}
                      </div>
                    ))}
                    <div ref={logEndRef} />
                  </div>
                </div>

              </div>
            )}
          </main>
        )}
      </div>
      
      {/* Footer inside router/body so it shows on all tabs */}
      <footer className="site-footer">
        <div className="container" style={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center' }}>
          <div className="logo" style={{ fontSize: '1rem' }}><span className="logo-accent">ONCHAIN</span> TCG</div>
          <div className="footer-links">
            <a href="#">Whitepaper</a>
            <a href="#">Smart Contracts</a>
            <a href="#">Discord</a>
          </div>
        </div>
      </footer>
    </>
  );
}

export default App;
