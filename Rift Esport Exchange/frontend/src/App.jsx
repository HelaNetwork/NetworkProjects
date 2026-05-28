import { useState } from 'react';
import './index.css';

function App() {
  const [currentView, setCurrentView] = useState('landing'); // 'landing' or 'dashboard'
  const [wallet, setWallet] = useState(null);
  const [betSlip, setBetSlip] = useState(null);
  const [wager, setWager] = useState('');

  const matches = [
    {
      id: 1,
      league: "IEM KATOWICE 2026 - CS2",
      teamA: "Natus Vincere",
      teamB: "FaZe Clan",
      oddsA: "1.85",
      oddsB: "2.10",
      status: "LIVE"
    },
    {
      id: 2,
      league: "WORLDS 2026 - LEAGUE OF LEGENDS",
      teamA: "T1",
      teamB: "JD Gaming",
      oddsA: "1.45",
      oddsB: "3.20",
      status: "UPCOMING"
    },
    {
      id: 3,
      league: "VALORANT CHAMPIONS TOUR",
      teamA: "Fnatic",
      teamB: "Paper Rex",
      oddsA: "1.90",
      oddsB: "1.90",
      status: "UPCOMING"
    }
  ];

  const handleConnect = async () => {
    if (window.ethereum) {
      try {
        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
        const account = accounts[0];
        setWallet(`${account.slice(0, 6)}...${account.slice(-4)}`);
      } catch (err) {
        console.error("User rejected connection", err);
      }
    } else {
      alert("Please install MetaMask or another Web3 wallet.");
    }
  };

  const handleAddBet = (match, team, odds) => {
    setBetSlip({
      matchId: match.id,
      league: match.league,
      selection: team,
      odds: odds
    });
  };

  const executeBet = () => {
    if (!wallet) return alert("Connect wallet to place bets.");
    if (!wager || isNaN(wager)) return alert("Enter a valid wager amount.");
    
    alert(`Processing on-chain transaction: ${wager} HLUSD on ${betSlip.selection}`);
    setTimeout(() => {
      alert("✅ Bet confirmed on Hela Testnet!");
      setBetSlip(null);
      setWager('');
    }, 1500);
  };

  if (currentView === 'landing') {
    return (
      <div className="landing-container">
        <div className="hero-subtitle">The Onchain Prediction Protocol</div>
        <h1 className="hero-title">
          Rift<br/>Exchange
        </h1>
        <button 
          className="btn-cyber" 
          onClick={() => setCurrentView('dashboard')}
        >
          Enter Arena
        </button>

        <div className="stats-bar">
          <div className="stat-item">
            <span className="stat-value">$14.2M</span>
            <span className="stat-label">Total Volume</span>
          </div>
          <div className="stat-item">
            <span className="stat-value">2,845</span>
            <span className="stat-label">Active Bettors</span>
          </div>
          <div className="stat-item">
            <span className="stat-value">Zero</span>
            <span className="stat-label">House Edge</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <nav className="navbar">
        <div className="nav-brand">RIFT EXCHANGE</div>
        {!wallet ? (
          <button className="nav-wallet" onClick={handleConnect}>
            Connect Wallet
          </button>
        ) : (
          <button className="nav-wallet" style={{borderColor: 'var(--neon-green)', color: 'var(--neon-green)'}}>
            {wallet} | 450 HLUSD
          </button>
        )}
      </nav>

      <div className="dashboard-container">
        <div className="main-feed">
          <div className="section-header">
            <span className="live-badge">LIVE</span> Match Markets
          </div>

          {matches.map((match) => (
            <div className="match-card" key={match.id}>
              <div className="match-header">
                <span>{match.league}</span>
                <span style={{color: match.status === 'LIVE' ? 'var(--neon-pink)' : 'var(--text-muted)'}}>
                  {match.status}
                </span>
              </div>
              <div className="match-teams">
                <div className="team">{match.teamA}</div>
                <div className="vs">VS</div>
                <div className="team">{match.teamB}</div>
              </div>
              <div className="match-odds">
                <button 
                  className="odd-btn"
                  onClick={() => handleAddBet(match, match.teamA, match.oddsA)}
                >
                  <span>{match.teamA}</span>
                  <span className="odd-val">{match.oddsA}</span>
                </button>
                <button 
                  className="odd-btn"
                  onClick={() => handleAddBet(match, match.teamB, match.oddsB)}
                >
                  <span>{match.teamB}</span>
                  <span className="odd-val">{match.oddsB}</span>
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="sidebar">
          <div className="bet-slip">
            <div className="slip-title">Bet Slip</div>
            
            {!betSlip ? (
              <div className="slip-empty">
                Select an outcome to place a bet.
              </div>
            ) : (
              <>
                <div className="slip-item">
                  <div style={{fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.5rem'}}>
                    {betSlip.league}
                  </div>
                  <div className="slip-row">
                    <span style={{fontWeight: 'bold', textTransform: 'uppercase'}}>{betSlip.selection}</span>
                    <span style={{color: 'var(--neon-cyan)'}}>@ {betSlip.odds}</span>
                  </div>
                </div>
                
                <div style={{marginTop: '1.5rem'}}>
                  <label style={{fontSize: '0.85rem', color: 'var(--text-muted)'}}>WAGER (HLUSD)</label>
                  <input 
                    type="number" 
                    className="slip-input" 
                    placeholder="0.00"
                    value={wager}
                    onChange={(e) => setWager(e.target.value)}
                  />
                </div>

                {wager && (
                  <div style={{display: 'flex', justifyContent: 'space-between', marginTop: '1rem', borderTop: '1px solid var(--border-light)', paddingTop: '1rem'}}>
                    <span style={{color: 'var(--text-muted)'}}>TO RETURN:</span>
                    <span style={{color: 'var(--neon-green)', fontWeight: 'bold', fontSize: '1.2rem'}}>
                      {(parseFloat(wager) * parseFloat(betSlip.odds)).toFixed(2)} HLUSD
                    </span>
                  </div>
                )}

                <button className="btn-place-bet" onClick={executeBet}>
                  Confirm Bet
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

export default App;
