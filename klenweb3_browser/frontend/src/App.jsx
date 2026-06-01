import { useState, useEffect } from 'react';
import './index.css';
import './mobile.css';

function App() {
  const [wallet, setWallet] = useState(null);
  const [adsBlocked, setAdsBlocked] = useState(1420);
  const [zenTokens, setZenTokens] = useState(15.5);
  
  // Browser State
  const [activePopover, setActivePopover] = useState(null); // 'wallet', 'shield', 'settings', null
  const [currentTime, setCurrentTime] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [currentUrl, setCurrentUrl] = useState("zen://newtab");
  const [wallpaperIndex, setWallpaperIndex] = useState(0);
  
  const wallpapers = [
    'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=2564&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1506744626753-edaeb5d8c252?q=80&w=2564&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=2564&auto=format&fit=crop'
  ];

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const connectWallet = () => {
    setWallet("0x7F2...9A4");
  };

  const simulateSearch = (e) => {
    if (e.key === 'Enter' && searchQuery.trim() !== '') {
      setAdsBlocked(prev => prev + 3);
      setZenTokens(prev => prev + 0.05);
      setCurrentUrl(`https://search.klen.org/?q=${encodeURIComponent(searchQuery)}`);
    }
  };

  const claimRewards = () => {
    if (!wallet) return alert("Connect built-in wallet first.");
    if (zenTokens <= 0) return alert("No rewards to claim.");
    alert(`Claimed ${zenTokens.toFixed(2)} ZENT to your wallet!`);
    setZenTokens(0);
  };

  const togglePopover = (popoverName) => {
    setActivePopover(prev => prev === popoverName ? null : popoverName);
  };

  return (
    <div className="browser-window">
      {/* BROWSER CHROME */}
      <div className="browser-header">
        
        {/* TABS BAR */}
        <div className="tabs-bar">
          <div className="browser-tab active">
            <span>🌐</span> New Tab
            <div className="tab-close">×</div>
          </div>
          <div className="browser-tab">
            <span>🦄</span> Uniswap Interface
            <div className="tab-close">×</div>
          </div>
          <div className="new-tab-btn">+</div>
        </div>

        {/* TOOLBAR */}
        <div className="toolbar">
          <div className="nav-buttons">
            <button className="nav-btn">←</button>
            <button className="nav-btn">→</button>
            <button className="nav-btn">↻</button>
          </div>
          
          <div className="address-bar-container">
            <span style={{color: 'var(--text-secondary)', marginRight: '0.5rem', fontSize: '0.9rem'}}>🔒</span>
            <input 
              type="text" 
              className="address-bar-input" 
              value={currentUrl} 
              readOnly 
            />
            <span style={{color: 'var(--text-secondary)', cursor: 'pointer'}}>⭐</span>
          </div>
          
          <div className="extensions-bar">
            {/* Shield / Rewards Extension */}
            <button className="ext-btn" onClick={() => togglePopover('shield')} title="Shield & Rewards">
              🛡️
              <span className="ext-badge">{adsBlocked}</span>
            </button>
            
            {/* Native Wallet Extension */}
            <button className="ext-btn" onClick={() => togglePopover('wallet')} title="Web3 Wallet">
              👛
            </button>
            
            {/* Browser Settings Menu */}
            <button className="ext-btn" onClick={() => togglePopover('settings')} title="Browser Settings">
              ⋮
            </button>

            {/* Shield Popover */}
            <div className={`popover ${activePopover === 'shield' ? 'active' : ''}`}>
              <div className="popover-header">
                <span>Ad & Tracker Shield</span>
                <span style={{color: 'var(--shield-color)'}}>ACTIVE</span>
              </div>
              <div style={{marginBottom: '1rem'}}>
                <div style={{fontSize: '0.85rem', color: 'var(--text-secondary)'}}>Requests Blocked This Week</div>
                <div style={{fontSize: '2rem', fontWeight: 800, color: 'var(--shield-color)'}}>{adsBlocked.toLocaleString()}</div>
              </div>
              <div style={{borderTop: '1px solid var(--border-color)', paddingTop: '1rem'}}>
                <div style={{fontSize: '0.85rem', color: 'var(--text-secondary)'}}>Pending ZENT Rewards</div>
                <div style={{fontSize: '1.5rem', fontWeight: 800, color: 'var(--accent-color)', marginBottom: '1rem'}}>{zenTokens.toFixed(2)} ZENT</div>
                <button className="btn-primary" onClick={claimRewards}>Claim to Wallet</button>
              </div>
            </div>

            {/* Wallet Popover */}
            <div className={`popover ${activePopover === 'wallet' ? 'active' : ''}`} style={{right: '40px'}}>
              <div className="popover-header">
                <span>Native Web3 Wallet</span>
                {wallet && <span style={{fontSize: '0.8rem', color: 'var(--shield-color)', fontWeight: 'normal'}}>Connected</span>}
              </div>
              {!wallet ? (
                <div style={{textAlign: 'center', padding: '1rem 0'}}>
                  <div style={{fontSize: '3rem', marginBottom: '1rem'}}>🔒</div>
                  <p style={{fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '1.5rem'}}>
                    Interact with any dApp seamlessly without third-party extensions.
                  </p>
                  <button className="btn-primary" onClick={connectWallet}>Create / Import Wallet</button>
                </div>
              ) : (
                <>
                  <div style={{fontSize: '0.85rem', color: 'var(--text-secondary)'}}>Main Account</div>
                  <div style={{fontWeight: 'bold', fontSize: '1.1rem', margin: '0.5rem 0'}}>{wallet}</div>
                  <div style={{display: 'flex', gap: '0.5rem', marginTop: '1rem', marginBottom: '1.5rem'}}>
                    <button className="btn-primary" style={{backgroundColor: 'var(--bg-dark)'}}>Send</button>
                    <button className="btn-primary" style={{backgroundColor: 'var(--bg-dark)'}}>Receive</button>
                  </div>
                  <div style={{borderTop: '1px solid var(--border-color)', paddingTop: '1rem'}}>
                    <div style={{display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem'}}>
                      <span>ETH</span>
                      <strong>0.45</strong>
                    </div>
                    <div style={{display: 'flex', justifyContent: 'space-between'}}>
                      <span>ZENT</span>
                      <strong style={{color: 'var(--accent-color)'}}>150.00</strong>
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Settings Popover */}
            <div className={`popover ${activePopover === 'settings' ? 'active' : ''}`} style={{right: '0', width: '250px'}}>
              <div className="popover-header">Browser Settings</div>
              <div style={{display: 'flex', flexDirection: 'column', gap: '0.75rem'}}>
                <button className="btn-primary" style={{background: 'var(--bg-dark)', textAlign: 'left'}} onClick={() => setCurrentUrl("klen://newtab")}>🏠 Home (New Tab)</button>
                <button className="btn-primary" style={{background: 'var(--bg-dark)', textAlign: 'left'}} onClick={() => alert("History Page Opened!")}>🕒 Search History</button>
                <button className="btn-primary" style={{background: 'var(--bg-dark)', textAlign: 'left'}} onClick={() => alert("Bookmarks Manager!")}>⭐ Bookmarks</button>
                <button className="btn-primary" style={{background: 'var(--bg-dark)', textAlign: 'left'}} onClick={() => {
                  setWallpaperIndex((prev) => (prev + 1) % wallpapers.length);
                  setActivePopover(null);
                }}>🖼️ Change Wallpaper</button>
                <button className="btn-primary" style={{background: 'var(--bg-dark)', textAlign: 'left', color: '#f87171'}} onClick={() => alert("Cache cleared.")}>🗑️ Clear Data</button>
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* MAIN VIEWPORT */}
      <div className="viewport" onClick={() => activePopover && setActivePopover(null)}>
        {currentUrl === "klen://newtab" || currentUrl === "zen://newtab" ? (
          <div className="new-tab-page" style={{backgroundImage: `url('${wallpapers[wallpaperIndex]}')`}}>
            <div className="nt-content">
              <div className="nt-time">{currentTime}</div>
              
              <div className="nt-search">
                <span style={{marginRight: '1rem', fontSize: '1.2rem', color: 'var(--text-secondary)'}}>🔍</span>
                <input 
                  type="text" 
                  className="nt-search-input" 
                  placeholder="Search the web securely or enter a URL..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={simulateSearch}
                />
              </div>
              
              <div className="nt-stats">
                <div className="nt-stat-card">
                  <div className="nt-stat-val">{adsBlocked.toLocaleString()}</div>
                  <div className="nt-stat-label">Trackers Blocked</div>
                </div>
                <div className="nt-stat-card">
                  <div className="nt-stat-val" style={{color: 'var(--accent-color)'}}>{zenTokens.toFixed(2)}</div>
                  <div className="nt-stat-label">Zent Earned</div>
                </div>
              </div>

              <div className="nt-quick-links">
                <div className="nt-ql-item" onClick={() => alert("Opening Uniswap...")}>
                  <div className="nt-ql-icon">🦄</div>
                  <div className="nt-ql-label">Uniswap</div>
                </div>
                <div className="nt-ql-item" onClick={() => alert("Opening OpenSea...")}>
                  <div className="nt-ql-icon">⛵</div>
                  <div className="nt-ql-label">OpenSea</div>
                </div>
                <div className="nt-ql-item" onClick={() => alert("Opening Aave...")}>
                  <div className="nt-ql-icon">👻</div>
                  <div className="nt-ql-label">Aave</div>
                </div>
                <div className="nt-ql-item" onClick={() => alert("Opening GitHub...")}>
                  <div className="nt-ql-icon">🐙</div>
                  <div className="nt-ql-label">GitHub</div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div style={{ padding: '3rem', backgroundColor: '#ffffff', minHeight: '100%', color: '#1a1a1a' }}>
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '2rem', borderBottom: '1px solid #e5e7eb', paddingBottom: '1rem' }}>
              <span style={{ fontSize: '2rem', marginRight: '1rem' }}>🌐</span>
              <h1 style={{ fontSize: '1.5rem', fontWeight: 'normal' }}>Klen Search Results</h1>
            </div>
            
            <div style={{ color: '#666', fontSize: '0.9rem', marginBottom: '2rem' }}>
              Showing results for: <strong style={{ color: '#1a1a1a' }}>{searchQuery}</strong>
              <div style={{ marginTop: '0.5rem', color: '#10b981', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                🛡️ Klen Shield blocked 3 invasive trackers on this page.
              </div>
            </div>

            <div style={{ maxWidth: '800px' }}>
              <div style={{ marginBottom: '2.5rem' }}>
                <a href="#" style={{ color: '#1a0dab', fontSize: '1.25rem', textDecoration: 'none', fontWeight: 500 }}>
                  {searchQuery} - Official Website
                </a>
                <div style={{ color: '#006621', fontSize: '0.85rem', marginTop: '0.25rem' }}>
                  https://www.{searchQuery.replace(/\s+/g, '').toLowerCase()}.com/
                </div>
                <p style={{ marginTop: '0.5rem', color: '#4d5156', lineHeight: 1.5 }}>
                  The official homepage for {searchQuery}. Discover the latest updates, news, and official documentation directly from the source.
                </p>
              </div>

              <div style={{ marginBottom: '2.5rem' }}>
                <a href="#" style={{ color: '#1a0dab', fontSize: '1.25rem', textDecoration: 'none', fontWeight: 500 }}>
                  {searchQuery} - Wikipedia
                </a>
                <div style={{ color: '#006621', fontSize: '0.85rem', marginTop: '0.25rem' }}>
                  https://en.wikipedia.org/wiki/{searchQuery.replace(/\s+/g, '_')}
                </div>
                <p style={{ marginTop: '0.5rem', color: '#4d5156', lineHeight: 1.5 }}>
                  Information about {searchQuery} from the free encyclopedia. History, origins, and comprehensive overview of the topic.
                </p>
              </div>

              <div style={{ marginBottom: '2.5rem' }}>
                <a href="#" style={{ color: '#1a0dab', fontSize: '1.25rem', textDecoration: 'none', fontWeight: 500 }}>
                  Latest news about {searchQuery}
                </a>
                <div style={{ color: '#006621', fontSize: '0.85rem', marginTop: '0.25rem' }}>
                  https://news.klen.org/search?q={encodeURIComponent(searchQuery)}
                </div>
                <p style={{ marginTop: '0.5rem', color: '#4d5156', lineHeight: 1.5 }}>
                  Breaking news and real-time updates regarding {searchQuery}. Articles published within the last 24 hours.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
