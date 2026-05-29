import { useState } from 'react';
import './index.css';

function App() {
  const [wallet, setWallet] = useState(null);
  const [showLoginModal, setShowLoginModal] = useState(false);
  
  const [feed, setFeed] = useState([
    {
      id: 1,
      user: "0xAlice...1A2",
      avatarStr: "A",
      avatarColor: "#E1306C", // Solid brand colors
      actionType: "NFT MINT",
      mediaColor: "#833AB4",
      icon: "🖼️",
      details: "Minted 'Bored Ape #9822' for 0.05 ETH on the Hela Network.",
      time: "2m",
      likes: 12,
      isLiked: false
    },
    {
      id: 2,
      user: "0xBob...4B3",
      avatarStr: "B",
      avatarColor: "#405DE6",
      actionType: "TOKEN SWAP",
      mediaColor: "#1DA1F2",
      icon: "💱",
      details: "Swapped 10 ETH for 32,500 USDC via Uniswap V3.",
      time: "15m",
      likes: 45,
      isLiked: false
    },
    {
      id: 3,
      user: "0xCharlie...9C1",
      avatarStr: "C",
      avatarColor: "#F56040",
      actionType: "STAKING",
      mediaColor: "#00C66B", // Sharp green
      icon: "🔒",
      details: "Staked 5,000 LDO into the Lido Finance protocol.",
      time: "1h",
      likes: 108,
      isLiked: true
    }
  ]);

  const connectWallet = async () => {
    if (window.ethereum) {
      try {
        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
        const account = accounts[0];
        setWallet(account);
        setShowLoginModal(false);
      } catch (err) {
        console.error("Connection failed", err);
      }
    } else {
      alert("Please install MetaMask!");
    }
  };

  const requireAuth = (callback) => {
    if (!wallet) {
      setShowLoginModal(true);
    } else {
      callback();
    }
  };

  const handleLike = (id) => {
    requireAuth(() => {
      setFeed(feed.map(item => {
        if (item.id === id) {
          const newStatus = !item.isLiked;
          return { ...item, isLiked: newStatus, likes: newStatus ? item.likes + 1 : item.likes - 1 };
        }
        return item;
      }));
    });
  };

  const handleFollow = (user) => {
    requireAuth(() => {
      alert(`You are now following ${user} on-chain!`);
    });
  };

  const handleCopyTrade = (id) => {
    requireAuth(() => {
      alert(`Executing on-chain copy trade for activity #${id}...`);
    });
  };

  // SVG Icons
  const HeartIcon = ({ filled }) => (
    <svg aria-label="Like" fill={filled ? "var(--like-color)" : "currentColor"} height="24" role="img" viewBox="0 0 24 24" width="24">
      {filled ? (
        <path d="M16.792 3.904A4.989 4.989 0 0 1 21.5 9.122c0 3.072-2.652 4.959-5.197 7.222-2.512 2.243-3.865 3.469-4.303 3.752-.477-.309-2.143-1.823-4.303-3.752C5.141 14.072 2.5 12.167 2.5 9.122a4.989 4.989 0 0 1 4.708-5.218 4.21 4.21 0 0 1 3.675 1.941c.84 1.175.98 1.543 1.117 1.543s.277-.368 1.117-1.543a4.21 4.21 0 0 1 3.675-1.941z"></path>
      ) : (
        <path d="M16.792 3.904A4.989 4.989 0 0 1 21.5 9.122c0 3.072-2.652 4.959-5.197 7.222-2.512 2.243-3.865 3.469-4.303 3.752-.477-.309-2.143-1.823-4.303-3.752C5.141 14.072 2.5 12.167 2.5 9.122a4.989 4.989 0 0 1 4.708-5.218 4.21 4.21 0 0 1 3.675 1.941c.84 1.175.98 1.543 1.117 1.543s.277-.368 1.117-1.543a4.21 4.21 0 0 1 3.675-1.941z" fill="none" stroke="currentColor" strokeLinejoin="round" strokeWidth="2"></path>
      )}
    </svg>
  );

  const CommentIcon = () => (
    <svg aria-label="Comment" fill="currentColor" height="24" role="img" viewBox="0 0 24 24" width="24">
      <path d="M20.656 17.008a9.993 9.993 0 1 0-3.59 3.615L22 22Z" fill="none" stroke="currentColor" strokeLinejoin="round" strokeWidth="2"></path>
    </svg>
  );

  return (
    <>
      <nav className="navbar">
        <div className="nav-container">
          <div className="logo">Aura Wallet</div>
          {!wallet ? (
            <button className="btn-connect" onClick={() => setShowLoginModal(true)}>Log In</button>
          ) : (
            <div className="connected-wallet">
              {wallet.substring(0,6)}...{wallet.substring(38)}
            </div>
          )}
        </div>
      </nav>

      <div className="feed-container">
        {feed.map(item => (
          <div className="post-card" key={item.id}>
            
            {/* POST HEADER */}
            <div className="post-header">
              <div className="avatar" style={{ backgroundColor: item.avatarColor }}>
                {item.avatarStr}
              </div>
              <div className="header-text">
                <span className="username">{item.user}</span>
                <span className="timestamp">• {item.time}</span>
              </div>
              <button className="btn-follow" onClick={() => handleFollow(item.user)}>Follow</button>
            </div>
            
            {/* MEDIA BOX */}
            <div className="post-media" style={{ backgroundColor: item.mediaColor }}>
              <div className="media-icon">{item.icon}</div>
              <div className="media-title">{item.actionType}</div>
            </div>
            
            {/* ACTION BAR */}
            <div className="post-actions">
              <button className={`icon-btn ${item.isLiked ? 'liked' : ''}`} onClick={() => handleLike(item.id)}>
                <HeartIcon filled={item.isLiked} />
              </button>
              <button className="icon-btn" onClick={() => requireAuth(() => alert("Comment feature coming soon!"))}>
                <CommentIcon />
              </button>
              
              <button className="btn-copy-trade" onClick={() => handleCopyTrade(item.id)}>
                Copy Trade
              </button>
            </div>

            {/* LIKES & CAPTION */}
            <div className="likes-count">
              {item.likes.toLocaleString()} likes
            </div>
            <div className="post-caption">
              <span className="username">{item.user}</span> {item.details}
            </div>
          </div>
        ))}
      </div>

      {/* AUTH WALL MODAL */}
      {showLoginModal && (
        <div className="modal-overlay" onClick={() => setShowLoginModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div style={{ marginBottom: '1.5rem', fontSize: '3rem' }}>🔒</div>
            <h2 className="modal-title">Connect Wallet</h2>
            <p className="modal-desc">
              You must log in to follow users, like activities, and execute on-chain copy trades.
            </p>
            <button className="btn-connect" style={{ width: '100%', padding: '12px', fontSize: '1rem' }} onClick={connectWallet}>
              Connect with Web3
            </button>
          </div>
        </div>
      )}
    </>
  );
}

export default App;
