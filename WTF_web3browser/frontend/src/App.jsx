import { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { 
  Layout, 
  Store, 
  Trophy, 
  Settings, 
  Wallet, 
  Globe, 
  ChevronRight, 
  ExternalLink, 
  Search,
  BookOpen,
  Zap,
  Shield,
  CreditCard,
  Grid,
  Newspaper,
  TrendingUp,
  Play,
  User,
  UserPlus,
  Trash2,
  Cpu,
  Layers,
  Activity,
  LogOut,
  Edit3,
  ShieldCheck,
  Lock,
  AlertTriangle,
  CheckCircle,
  X,
  ShoppingCart,
  Users,
  Plus,
  ChevronLeft,
  RefreshCw,
  Star,
  ArrowUpRight,
  Copy,
  Terminal,
  LayoutGrid,
  Rocket,
  Gamepad2,
  Sparkles,
  Droplets,
  Sun, Moon,
  ShieldAlert,
  MessageSquare, Home
} from 'lucide-react';
import { SnakeGame, TetrisGame, SpaceBlasterGame, TicTacToe } from './components/Games';
import { INTERNAL_CONTENT } from './data/internalContent';

// Mock dApps Data
const DAPPS = [
  { id: 1, name: 'Uniswap', url: 'https://app.uniswap.org', icon: <Zap size={24} className="text-pink-500" />, category: 'DeFi', description: 'Swap tokens easily' },
  { id: 2, name: 'SuperRare', url: 'https://superrare.com', icon: <Star size={24} className="text-emerald-400" />, category: 'NFT', description: 'Curated NFT art marketplace' },
  { id: 3, name: 'Aave', url: 'https://app.aave.com', icon: <Activity size={24} className="text-primary" />, category: 'Lending', description: 'Earn interest on deposits' },
  { id: 4, name: 'Compound', url: 'https://compound.finance', icon: <Layers size={24} className="text-green-400" />, category: 'Lending', description: 'Algorithmic money markets' },
  { id: 5, name: 'Hela Bridge', url: 'https://hela.network', icon: <Globe size={24} className="text-primary" />, category: 'Bridge', description: 'Move assets across chains' },
  { id: 6, name: 'Magic Eden', url: 'https://magiceden.io', icon: <Sparkles size={24} className="text-fuchsia-400" />, category: 'NFT', description: 'Community-first NFT marketplace' },
  { id: 7, name: 'PancakeSwap', url: 'https://pancakeswap.finance', icon: <Zap size={24} className="text-yellow-500" />, category: 'DeFi', description: 'Fast decentralized exchange' },
  { id: 8, name: 'Curve', url: 'https://curve.fi', icon: <TrendingUp size={24} className="text-emerald-500" />, category: 'DeFi', description: 'Efficient stablecoin swaps' },
  { id: 9, name: 'Blur', url: 'https://blur.io', icon: <Shield size={24} className="text-orange-500" />, category: 'NFT', description: 'Professional NFT marketplace' },
  { id: 10, name: 'Lido', url: 'https://lido.fi', icon: <Droplets size={24} className="text-blue-400" />, category: 'Liquid Staking', description: 'Stake ETH and earn rewards' },
  { id: 11, name: '1inch', url: 'https://app.1inch.io', icon: <Zap size={24} className="text-primary" />, category: 'DeFi Aggregator', description: 'Get the best swap rates' },
  { id: 12, name: 'GMX', url: 'https://app.gmx.io', icon: <TrendingUp size={24} className="text-emerald-400" />, category: 'Perpetuals', description: 'Decentralized perpetual exchange' },
  { id: 13, name: 'Synthetix', url: 'https://synthetix.io', icon: <Layers size={24} className="text-fuchsia-500" />, category: 'Derivatives', description: 'Trade synthetic assets' },
  { id: 14, name: 'Trader Joe', url: 'https://traderjoexyz.com', icon: <ShoppingCart size={24} className="text-orange-400" />, category: 'DeFi', description: 'AVAX ecosystem hub' },
  { id: 15, name: 'LooksRare', url: 'https://looksrare.org', icon: <Sparkles size={24} className="text-emerald-300" />, category: 'NFT', description: 'Community-first NFT marketplace' },
  { id: 16, name: 'SushiSwap', url: 'https://sushi.com', icon: <Zap size={24} className="text-red-400" />, category: 'DeFi', description: 'Multi-chain DEX ecosystem' },
  { id: 17, name: 'Rocket Pool', url: 'https://rocketpool.net', icon: <Rocket size={24} className="text-orange-500" />, category: 'Liquid Staking', description: 'Decentralized ETH staking' },
  { id: 18, name: 'Aptos Bridge', url: 'https://theaptosbridge.com', icon: <Globe size={24} className="text-cyan-400" />, category: 'Bridge', description: 'Bridge assets to Aptos' },
  { id: 19, name: 'Jupiter', url: 'https://jup.ag', icon: <Zap size={24} className="text-green-400" />, category: 'Solana DeFi', description: 'Best swap rates on Solana' },
  { id: 20, name: 'Raydium', url: 'https://raydium.io', icon: <Sun size={24} className="text-yellow-400" />, category: 'Solana DeFi', description: 'Solana AMM and ecosystem' },
  { id: 21, name: 'Arbitrum Bridge', url: 'https://bridge.arbitrum.io', icon: <Layers size={24} className="text-blue-500" />, category: 'Bridge', description: 'Official Arbitrum bridge' },
  { id: 22, name: 'Etherscan', url: 'https://etherscan.io', icon: <Search size={24} className="text-primary" />, category: 'Explorer', description: 'Ethereum blockchain explorer' },
  { id: 23, name: 'CoinGecko', url: 'https://coingecko.com', icon: <TrendingUp size={24} className="text-emerald-500" />, category: 'Analytics', description: 'Live crypto prices & market data' },
  { id: 24, name: 'CoinMarketCap', url: 'https://coinmarketcap.com', icon: <Activity size={24} className="text-blue-500" />, category: 'Analytics', description: 'Crypto market cap rankings' },
  { id: 25, name: 'Zora', url: 'https://zora.co', icon: <Sparkles size={24} className="text-primary" />, category: 'NFT', description: 'Create and collect onchain' },
  { id: 26, name: 'Dune Analytics', url: 'https://dune.com', icon: <TrendingUp size={24} className="text-fuchsia-400" />, category: 'Analytics', description: 'Blockchain data dashboards' },
  { id: 27, name: 'Polygon', url: 'https://polygon.technology', icon: <Layers size={24} className="text-purple-600" />, category: 'Layer 2', description: 'Ethereum scaling solution' },
  { id: 28, name: 'Optimism', url: 'https://optimism.io', icon: <Shield size={24} className="text-red-500" />, category: 'Layer 2', description: 'Fast low-cost Ethereum L2' },
  { id: 29, name: 'Solscan', url: 'https://solscan.io', icon: <Search size={24} className="text-cyan-500" />, category: 'Explorer', description: 'Solana blockchain explorer' },
  { id: 30, name: 'DeFi Llama', url: 'https://defillama.com', icon: <TrendingUp size={24} className="text-emerald-600" />, category: 'Analytics', description: 'DeFi TVL and protocol data' }
];

const HLUSD_CONTRACT = '0xBE75FDe9DeDe700635E3dDBe7e29b5db1A76C125';
const ERC20_ABI = [
  'function balanceOf(address owner) view returns (uint256)',
  'function transfer(address to, uint amount) returns (bool)',
  'function decimals() view returns (uint8)'
];

const API_URL = import.meta.env.VITE_API_URL && import.meta.env.VITE_API_URL !== 'https://your-backend-url.vercel.app' 
  ? import.meta.env.VITE_API_URL 
  : 'https://web3browser-backend.vercel.app';

function App() {

  const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'dark');
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);
  const toggleTheme = () => setTheme(prev => prev === 'dark' ? 'warm' : 'dark');

  const [walletAddress, setWalletAddress] = useState('');
  const [balance, setBalance] = useState('0.00');
  const [hlusdBalance, setHlusdBalance] = useState('0.00');
  const [points, setPoints] = useState(0);
  const [dappList, setDappList] = useState(DAPPS);
  const [helaBalance, setHelaBalance] = useState('0.00');
  const [isWalletGateOpen, setIsWalletGateOpen] = useState(true);
  const [rewardHistory, setRewardHistory] = useState([]);
  const [iframeKey, setIframeKey] = useState(0); // For forcing iframe reloads

  // UI States for Rewards
  const [isRedeeming, setIsRedeeming] = useState(false);
  const [isQuesting, setIsQuesting] = useState(false);
  const [isReferring, setIsReferring] = useState(false);
  const [isCashbacking, setIsCashbacking] = useState(false);
  const [showRedeemModal, setShowRedeemModal] = useState(false);
  const [redeemAmount, setRedeemAmount] = useState(1000);
  const [shieldIntensity, setShieldIntensity] = useState('medium'); // low, medium, high
  const [isDeepScanning, setIsDeepScanning] = useState(false);

  // New Modals
  const [showQuestModal, setShowQuestModal] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [showVoucherModal, setShowVoucherModal] = useState(false);
  const [showWalletModal, setShowWalletModal] = useState(false);
  const [activeWalletTab, setActiveWalletTab] = useState('assets');
  const [sendRecipient, setSendRecipient] = useState('');
  const [sendAmount, setSendAmount] = useState('');
  const [isTxPending, setIsTxPending] = useState(false);
  const [isCorrectNetwork, setIsCorrectNetwork] = useState(true);
  const [lastRefresh, setLastRefresh] = useState(Date.now());
  const [redeemedVouchers, setRedeemedVouchers] = useState([]); // Tracks purchased vouchers

  // Browser Tab System
  const [tabs, setTabs] = useState([
    { 
      id: 'tab-1', 
      type: 'explore', 
      url: '', 
      name: 'New Tab', 
      icon: '🌐', 
      history: [], 
      historyIndex: -1, 
      isBookmarked: false,
      query: '',
      dapp: null,
      searchResults: [],
      isSearching: false,
      searchError: null
    }
  ]);
  const [activeTabId, setActiveTabId] = useState('tab-1');
  
  // Helper to get active tab
  const activeTabObj = tabs.find(t => t.id === activeTabId) || tabs[0] || { type: 'explore', history: [], historyIndex: -1 };

  const [iframeStatus, setIframeStatus] = useState('loading');

  // Quest States
  const [activeQuests, setActiveQuests] = useState([]); // Tracks in-progress quests
  const [completedQuests, setCompletedQuests] = useState(() => {
    try {
      const saved = localStorage.getItem('completed_quests');
      if (!saved) return [];
      const parsed = JSON.parse(saved);
      if (parsed.date !== new Date().toDateString()) return [];
      return parsed.quests || [];
    } catch (e) {
      return [];
    }
  });
  const [articleTimer, setArticleTimer] = useState(0);

  // Profile & Accounts State
  const [userProfile, setUserProfile] = useState(() => {
    try {
      const saved = localStorage.getItem('web3_profile');
      return saved ? JSON.parse(saved) : { name: 'Frontier Operative', bio: 'Neural Sync Level 1', avatar: '' };
    } catch (e) {
      console.error('Error parsing userProfile', e);
      return { name: 'Frontier Operative', bio: 'Neural Sync Level 1', avatar: '' };
    }
  });

  const [accounts, setAccounts] = useState(() => {
    try {
      const saved = localStorage.getItem('web3_accounts');
      const parsed = saved ? JSON.parse(saved) : null;
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      return [{ id: 1, name: 'Primary Core', address: '', active: true }];
    } catch (e) {
      console.error('Error parsing accounts', e);
      return [{ id: 1, name: 'Primary Core', address: '', active: true }];
    }
  });

  const [activeProfileId, setActiveProfileId] = useState(() => {
    try {
      const saved = localStorage.getItem('active_profile_id');
      const id = saved ? parseInt(saved) : 1;
      return isNaN(id) ? 1 : id;
    } catch (e) {
      return 1;
    }
  });

  const [activeProfileName, setActiveProfileName] = useState(() => {
    try {
      const active = (accounts || []).find(a => a.id === activeProfileId);
      return active ? active.name : 'Primary Core';
    } catch (e) {
      return 'Primary Core';
    }
  });

  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [activeGame, setActiveGame] = useState(null);
  
  // Wallet Persistence & Auto-Reconnection
  useEffect(() => {
    const savedAddress = localStorage.getItem('wallet_address');
    if (savedAddress) {
       setWalletAddress(savedAddress);
       setIsWalletGateOpen(false);
    }

    if (window.ethereum) {
      window.ethereum.request({ method: 'eth_accounts' })
        .then(accounts => {
          if (accounts.length > 0) {
            setWalletAddress(accounts[0]);
            setIsWalletGateOpen(false);
            localStorage.setItem('wallet_address', accounts[0]);
          }
        });
    }
  }, []);

  // Sync Rewards when wallet or profile changes
  useEffect(() => {
    if (walletAddress) {
       const profile_id = activeProfileId || 1;
       // Fetch Total Balance
       fetch(`${API_URL}/rewards/balance/${walletAddress}?profile_id=${profile_id}`)
          .then(res => res.json())
          .then(data => {
            if (data.total_points !== undefined) {
              setPoints(data.total_points);
              setHelaBalance(data.total_tokens.toFixed(2));
            }
          })
          .catch(err => console.error('Fetch balance failed', err));

       // Fetch 24h History for Activity Stream
       fetch(`${API_URL}/rewards/${walletAddress}?profile_id=${profile_id}`)
          .then(res => res.json())
          .then(data => {
            if (Array.isArray(data)) {
              setRewardHistory(data);
            }
          })
          .catch(err => console.error('Fetch history failed', err));
    }
  }, [walletAddress, activeProfileId]);

  // Passive Points Timer
  useEffect(() => {
    if (!walletAddress) return;
    const interval = setInterval(() => {
       claimReward('dapp_interaction');
    }, 60000); // 1 point per minute
    return () => clearInterval(interval);
  }, [walletAddress]);
  


  // Sync balance and network periodically
  useEffect(() => {
    if (walletAddress) {
      const syncWallet = async () => {
        const isCorrect = await checkNetworkStatus();
        setIsCorrectNetwork(isCorrect);
        if (isCorrect) {
          await fetchHLUSDBalance(walletAddress);
          setLastRefresh(Date.now());
        }
      };

      // Listen for network/account changes
      if (window.ethereum) {
        window.ethereum.on('chainChanged', syncWallet);
        window.ethereum.on('accountsChanged', (accounts) => {
          if (accounts.length > 0) {
            setWalletAddress(accounts[0]);
            localStorage.setItem('wallet_address', accounts[0]);
          } else {
            setWalletAddress('');
            localStorage.removeItem('wallet_address');
          }
          syncWallet();
        });
      }

      syncWallet(); // Initial sync
      const interval = setInterval(syncWallet, 10000); // Every 10 seconds
      
      return () => {
        if (window.ethereum) {
          window.ethereum.removeListener('chainChanged', syncWallet);
        }
        clearInterval(interval);
      };
    }
  }, [walletAddress, showWalletModal]);

  
  
  // Refactored helper to update active tab
  const updateActiveTab = (updates) => {
    setTabs(prev => prev.map(t => {
      if (t.id === activeTabId) {
        const newTab = { ...t, ...updates };
        // If type or dapp changes, add to history
        if (updates.type || updates.dapp) {
           let query = updates.query || (updates.dapp ? updates.dapp.url : t.query);
           if (updates.type === 'builtin-content') query = `internal://${updates.contentId}`;
           
           const historyEntry = { 
             type: updates.type === 'search' ? 'search' : 'url', 
             query: query
           };
           // Avoid immediate duplicates
           if (!t.history.length || t.history[t.historyIndex]?.query !== historyEntry.query) {
             const newHistory = t.history.slice(0, t.historyIndex + 1);
             newHistory.push(historyEntry);
             newTab.history = newHistory;
             newTab.historyIndex = newHistory.length - 1;
           }
        }
        return newTab;
      }
      return t;
    }));
  };

  const addTab = (type = 'explore', url = '', name = 'New Tab') => {
    const newId = `tab-${Date.now()}`;
    setTabs(prev => [...prev, { 
      id: newId, 
      type, 
      url, 
      name, 
      icon: '🌐', 
      history: [], 
      historyIndex: -1, 
      isBookmarked: false,
      query: '',
      dapp: null,
      searchResults: [],
      isSearching: false,
      searchError: null
    }]);
    setActiveTabId(newId);
  };

  const closeTab = (e, id) => {
    e.stopPropagation();
    if (tabs.length === 1) return;
    const newTabs = tabs.filter(t => t.id !== id);
    setTabs(newTabs);
    if (activeTabId === id) {
      // Find the index of the closed tab and pick the one next to it
      const closedIndex = tabs.findIndex(t => t.id === id);
      const nextActiveIndex = Math.max(0, closedIndex - 1);
      setActiveTabId(newTabs[nextActiveIndex].id);
    }
  };


  useEffect(() => {
    localStorage.setItem('web3_profile', JSON.stringify(userProfile));
  }, [userProfile]);

  useEffect(() => {
    localStorage.setItem('web3_accounts', JSON.stringify(accounts));
    const active = accounts.find(a => a.id === activeProfileId);
    if (active) setActiveProfileName(active.name);
  }, [accounts, activeProfileId]);

  useEffect(() => {
    localStorage.setItem('active_profile_id', activeProfileId.toString());
  }, [activeProfileId]);

  useEffect(() => {
    localStorage.setItem('completed_quests', JSON.stringify({
      date: new Date().toDateString(),
      quests: completedQuests
    }));
  }, [completedQuests]);

  // Education Article Quest Timer
  useEffect(() => {
    let interval;
    if (activeTabObj.type === 'explore' && activeTabObj.dapp && activeTabObj.dapp.category === 'Education' && activeQuests.includes('scholar')) {
      interval = setInterval(() => {
        setArticleTimer(prev => {
          if (prev >= 9) {
            // Reached 10 seconds
            clearInterval(interval);
            setActiveQuests(q => q.filter(x => x !== 'scholar'));
            claimReward('wtf_quest_action');
            alert('Scholar Quest Complete: +5 Points Synchronized!');
            return 0;
          }
          return prev + 1;
        });
      }, 1000);
    } else {
      setArticleTimer(0);
    }
    return () => clearInterval(interval);
  }, [activeTabId, tabs, activeQuests]);

  // Check if activeTabObj.dapp can be framed securely
  useEffect(() => {
    if (activeTabObj.dapp) {
      setIframeStatus('loading');
      
      // Load directly without checking with the backend to eliminate delay
      setIsDeepScanning(true);
      setTimeout(() => setIsDeepScanning(false), 2000);

      // The iframe onLoad event will automatically transition from 'loading' to 'loaded'
    }
  }, [activeTabId, tabs]);

  // Fetch dApps from backend on load
  useEffect(() => {
    fetch(`${API_URL}/dapps/`)
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data) && data.length > 0) {
          // Merge backend dapps with local ones, ensuring no duplicates by URL
          const combined = [...DAPPS];
          data.forEach(d => {
            if (!combined.some(local => local.url === d.url)) {
              combined.push(d);
            }
          });
          setDappList(combined);
        }
      })
      .catch(err => console.error('Failed to fetch dApps', err));
  }, []);

  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  // Debounced search suggestions
  useEffect(() => {
    const fetchSuggestions = async () => {
      const activeTab = tabs.find(t => t.id === activeTabId);
      const query = activeTab?.query || '';
      
      if (query.trim().length > 0 && !(/^(http:\/\/|https:\/\/)/i.test(query) || query.includes('.'))) {
        try {
          const res = await fetch(`${API_URL}/search/suggest?q=${encodeURIComponent(query)}`);
          if (res.ok) {
            const data = await res.json();
            setSuggestions(data.slice(0, 5)); // Limit to top 5
            setShowSuggestions(true);
          }
        } catch (e) {
          console.error('Suggest error:', e);
        }
      } else {
        setSuggestions([]);
        setShowSuggestions(false);
      }
    };

    const timeoutId = setTimeout(fetchSuggestions, 300);
    return () => clearTimeout(timeoutId);
  }, [activeTabId, tabs.find(t => t.id === activeTabId)?.query]);

  const executeSearch = async (queryToSearch) => {
    const query = queryToSearch.trim();
    if (!query) return;

    setShowSuggestions(false);
    
    // URL detection
    const isUrl = query.startsWith('http://') || query.startsWith('https://') || (query.includes('.') && !query.includes(' ') && !query.startsWith(' '));
    
    if (isUrl) {
      const url = query.startsWith('http') ? query : `https://${query}`;
      updateActiveTab({ 
        query: query,
        dapp: { id: 'custom', name: url, url: url, icon: '🌐', category: 'Web' },
        type: 'explore'
      });
    } else {
      // Perform Search
      updateActiveTab({ 
        query: query,
        dapp: null,
        type: 'search',
        searchError: null,
        isSearching: true
      });
      
      const searchUrl = `${API_URL}/search?q=${encodeURIComponent(query)}`;
      
      try {
        const res = await fetch(searchUrl);
        if(res.ok) {
          const data = await res.json();
          const results = Array.isArray(data) ? data : (data.results || []);
          updateActiveTab({ 
            searchResults: results,
            isSearching: false,
            searchError: data.error ? (data.message || data.error) : null
          });
          // Reward user for search contribution
          if (walletAddress) {
            await claimReward('dapp_interaction', 1);
          }
        } else {
          updateActiveTab({ 
            searchResults: [],
            isSearching: false,
            searchError: `Backend error: ${res.status}`
          });
        }
      } catch (err) {
        updateActiveTab({ 
          searchResults: [],
          isSearching: false,
          searchError: 'Connection failed.'
        });
      }
    }
  };

  const getSiteAdFingerprint = (url) => {
    if (!url) return { ads: 0, trackers: 0 };
    const domain = url.toLowerCase();
    
    // Domains known for heavy ads
    const AD_HEAVY = ['news', 'torrent', 'free', 'online', 'download', 'soft', 'crack', 'stream', 'converter'];
    const TECH_SITES = ['github', 'docs', 'stackover', 'dev', 'npm', 'rust-lang', 'go.dev'];
    
    let baseAds = (url.length % 7) + 3;
    let baseTrackers = (url.length % 5) + 2;
    
    if (AD_HEAVY.some(term => domain.includes(term))) {
      baseAds += 8;
      baseTrackers += 12;
    }
    
    if (TECH_SITES.some(term => domain.includes(term))) {
      baseAds = Math.max(0, baseAds - 5);
      baseTrackers = Math.max(0, baseTrackers - 3);
    }
    
    // Multiplier based on intensity
    const mult = shieldIntensity === 'high' ? 1.5 : shieldIntensity === 'medium' ? 1.0 : 0.6;
    
    return {
      ads: Math.floor(baseAds * mult),
      trackers: Math.floor(baseTrackers * mult)
    };
  };

  const truncateAddress = (addr) => addr ? `${addr.slice(0, 6)}...${addr.slice(-4)}` : '';
  const isValidAddress = (addr) => /^0x[a-fA-F0-9]{40}$/.test(addr);
  const checkNetworkStatus = async () => {
    if (!window.ethereum) return false;
    try {
      const chainId = await window.ethereum.request({ method: 'eth_chainId' });
      return chainId === '0xa2d08';
    } catch (e) {
      return false;
    }
  };

  const checkNetwork = async () => {
    if (!window.ethereum) return false;
    try {
      const chainId = await window.ethereum.request({ method: 'eth_chainId' });
      if (chainId !== '0xa2d08') { // 666888 in hex
        try {
          await window.ethereum.request({
            method: 'wallet_switchEthereumChain',
            params: [{ chainId: '0xa2d08' }],
          });
          setIsCorrectNetwork(true);
          fetchHLUSDBalance(walletAddress);
          return true;
        } catch (switchError) {
          if (switchError.code === 4902) {
            await window.ethereum.request({
              method: 'wallet_addEthereumChain',
              params: [{
                chainId: '0xa2d08',
                chainName: 'Hela Testnet',
                nativeCurrency: { name: 'HLUSD', symbol: 'HLUSD', decimals: 18 },
                rpcUrls: ['https://testnet-rpc.helachain.com'],
                blockExplorerUrls: ['https://testnet-blockexplorer.helachain.com']
              }],
            });
            setIsCorrectNetwork(true);
            fetchHLUSDBalance(walletAddress);
            return true;
          }
          throw switchError;
        }
      }
      return true;
    } catch (e) {
      console.error('Network check failed', e);
      return false;
    }
  };

  const fetchHLUSDBalance = async (address) => {
    if (!window.ethereum || !address) return;
    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const bal = await provider.getBalance(address);
      setHlusdBalance(ethers.formatUnits(bal, 18));
    } catch (e) {
      console.error('Failed to fetch HLUSD balance', e);
    }
  };

  const sendHLUSD = async (to, amount) => {
    if (!window.ethereum || !walletAddress) return;
    const isCorrectNetwork = await checkNetwork();
    if (!isCorrectNetwork) throw new Error('Incorrect network');

    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      
      const tx = await signer.sendTransaction({
        to: to,
        value: ethers.parseUnits(amount, 18)
      });
      return tx;
    } catch (e) {
      console.error('Send HLUSD failed', e);
      // provide more detail in the alert
      if (e.reason) alert(`Error: ${e.reason}`);
      else if (e.message && e.message.includes('user rejected')) alert('Transaction rejected by user.');
      else alert(`Transaction failed: ${e.code || 'Unknown Error'}`);
      throw e;
    }
  };

  const connectWallet = async () => {
    if (window.ethereum) {
      try {
        const provider = new ethers.BrowserProvider(window.ethereum);
        const accounts = await provider.send('eth_requestAccounts', []);
        const address = accounts[0];
        setWalletAddress(address);
        
        const balance = await provider.getBalance(address);
        setBalance(ethers.formatEther(balance).substring(0, 6));

        // Fetch HLUSD Balance
        await fetchHLUSDBalance(address);

        // Register/Login with Backend
        fetch(`${API_URL}/users/register`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            wallet_address: address,
            profile_id: activeProfileId,
            profile_name: activeProfileName
          })
        });
        
        localStorage.setItem('wallet_address', address);

        // Log connection
        fetch(`${API_URL}/wallet/connect`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ wallet_address: address })
        });

        // Sync with Hela Economic Engine (Gatekeeper close)
        setIsWalletGateOpen(false);

        // Fetch lifetime balance
        await refreshBalance();

      } catch (err) {
        console.error('Wallet connection failed', err);
      }
    } else {
      alert('MetaMask not detected');
    }
  };

  const executeRedeem = async () => {
    if (!walletAddress) return alert('Connect wallet first');
    if (redeemAmount < 1000 || points < redeemAmount || redeemAmount % 1000 !== 0) return alert('Invalid redemption amount.');
    
    setIsRedeeming(true);
    setShowRedeemModal(false);
    try {
      const res = await fetch(`${API_URL}/rewards/redeem`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          wallet_address: walletAddress, 
          points: redeemAmount,
          profile_id: activeProfileId
        })
      });
      
      if (res.ok) {
        setPoints(prev => prev - redeemAmount);
        setHelaBalance(prev => (parseFloat(prev) + (redeemAmount / 1000)).toFixed(2));
        // Add a slight delay for aesthetic loading impression
        setTimeout(() => {
          setIsRedeeming(false);
          alert(`Redemption Successful: +${(redeemAmount/1000).toFixed(2)} Hela synchronized to account matrix.`);
        }, 800);
      } else {
        const data = await res.json();
        alert(data.error || 'Redemption failed');
        setIsRedeeming(false);
      }
    } catch (err) {
      console.error(err);
      setIsRedeeming(false);
      alert('Network error during redemption.');
    }
  };

  const refreshBalance = async () => {
    if (!walletAddress) return;
    try {
      const res = await fetch(`${API_URL}/rewards/balance/${walletAddress}?profile_id=${activeProfileId}`);
      const data = await res.json();
      if (data.total_points !== undefined) {
        setPoints(data.total_points);
        setHelaBalance(data.total_tokens.toFixed(2));
      }
      
      const resHist = await fetch(`${API_URL}/rewards/${walletAddress}?profile_id=${activeProfileId}`);
      const dataHist = await resHist.json();
      if (Array.isArray(dataHist)) setRewardHistory(dataHist);
    } catch (e) {
      console.error('Refresh balance failed', e);
    }
  };

  const claimReward = async (activityType = 'dapp_interaction', score = 0) => {
    // ...existing claimReward logic...
    if (!walletAddress) return alert('Connect wallet first');
    
    try {
      const res = await fetch(`${API_URL}/rewards/claim`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          wallet_address: walletAddress, 
          activity_type: activityType, 
          score: score,
          profile_id: activeProfileId
        })
      });
      
      if (res.ok) {
        const data = await res.json();
        // Force immediate aggregate sync
        await refreshBalance();
        
        // Track completion for one-time visual removal
        if (activityType === 'wtf_quest' || activityType === 'wtf_quest_action') {
           setCompletedQuests(prev => [...prev, activityType === 'wtf_quest_action' ? (activeQuests[0] || 'scholar') : 'daily']);
        }
        return true;
      } else {
        const data = await res.json();
        console.warn('Reward claim failed:', data.error);
        if (activityType === 'wtf_quest') {
           alert(data.error || 'Daily quest limit reached.');
        }
      }
    } catch(err) {
      console.error(err);
    }
    return false;
  };


  return (
    <div className={`flex w-full h-screen bg-base text-heading selection:bg-indigo-500/30 font-sans`}>
      {/* Wallet Gatekeeper UI */}
      {(!walletAddress || isWalletGateOpen) && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-base overflow-hidden">
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute top-1/4 left-1/4 w-[50%] h-[50%] bg-primary/10 rounded-full blur-[150px] animate-pulse"></div>
            <div className="absolute bottom-1/4 right-1/4 w-[50%] h-[50%] bg-purple-600/10 rounded-full blur-[150px] animate-pulse delay-1000"></div>
          </div>
          
          <div className="relative z-10 max-w-xl w-full px-8 text-center space-y-12 animate-in fade-in zoom-in duration-1000">
            <div className="flex flex-col items-center gap-6">
              <div className="w-24 h-24 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-[2.5rem] flex items-center justify-center shadow-2xl shadow-indigo-600/40 animate-float">
                <ShieldCheck size={48} className="text-heading" />
              </div>
              <h1 className="text-4xl md:text-6xl font-black tracking-tighter uppercase italic leading-none">IDENTITY <br/><span className="gradient-text">REQUIRED</span></h1>
              <p className="text-body/40 text-lg font-medium tracking-tight">Authenticating your neural signature for decentralized access.</p>
            </div>

            <div className="glass-card p-10 rounded-[3.5rem] border-glass-border space-y-8 bg-card-alpha backdrop-blur-3xl">
              <div className="space-y-4">
                <h2 className="text-2xl font-bold uppercase tracking-tighter">Connect MetaMask</h2>
                <p className="text-sm text-body/30 font-medium">Your wallet is your identity. Connect to unlock searching, rewards, and the WTF zone.</p>
              </div>
              
              <button 
                onClick={connectWallet}
                className="w-full bg-white text-indigo-900 py-6 rounded-3xl font-black text-xl hover:shadow-2xl hover:scale-[1.02] transition-all flex items-center justify-center gap-4 active:scale-95 group"
              >
                <Wallet size={24} className="group-hover:rotate-12 transition-transform" />
                INITIATE HANDSHAKE
              </button>

              <div className="flex items-center gap-4 justify-center pt-4 opacity-50">
                 <div className="flex -space-x-2">
                    {[1,2,3].map(i => <div key={i} className="w-8 h-8 rounded-full border-2 border-[#07090c] bg-indigo-500/20"></div>)}
                 </div>
                 <span className="text-[10px] font-black uppercase tracking-widest text-primary">12k+ NODES CONNECTED</span>
              </div>
            </div>
            
            <p className="text-[10px] font-black uppercase tracking-[0.4em] text-body/10 italic">Zero-Knowledge Proof Enabled Protocol</p>
          </div>
        </div>
      )}

      {/* Delete Account Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-6 animate-in fade-in duration-200">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-md" onClick={() => setShowDeleteConfirm(false)} />
          <div className="relative glass-card rounded-[3rem] p-10 max-w-md w-full border border-red-500/20 shadow-2xl shadow-red-500/10 animate-in zoom-in-95 duration-300">
            <div className="flex items-center justify-center w-16 h-16 rounded-2xl bg-red-500/10 border border-red-500/20 mx-auto mb-6">
              <AlertTriangle size={32} className="text-red-400" />
            </div>
            <h2 className="text-2xl font-black uppercase tracking-tighter text-center mb-2">Wipe Matrix Cache?</h2>
            <p className="text-body/40 text-sm font-bold text-center tracking-wide leading-relaxed mb-8">
              This will permanently delete all your data, profile, accounts, and rewards. <span className="text-red-400">This action cannot be undone.</span>
            </p>
            <div className="flex gap-4">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="flex-1 py-4 glass rounded-2xl font-black uppercase text-sm tracking-widest hover:bg-card-alpha0 transition-all border border-glass-border0"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  localStorage.clear();
                  window.location.reload();
                }}
                className="flex-1 py-4 bg-red-500/20 hover:bg-red-500/30 border border-red-500/30 rounded-2xl font-black uppercase text-sm tracking-widest text-red-400 transition-all active:scale-95"
              >
                Delete Everything
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main App Workspace */}
      {/* Sidebar */}
      <aside className="hidden md:flex w-16 lg:w-64 border-r border-glass-border flex-col items-center lg:items-stretch py-6 px-4 bg-[#0a0c0f] relative z-20 shadow-2xl">
        <div className="flex items-center gap-3 px-2 mb-10 overflow-hidden group cursor-pointer" onClick={() => {updateActiveTab({ type: 'explore', dapp: null })}}>
          <div className="w-10 h-10 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-xl flex items-center justify-center shrink-0 shadow-lg shadow-indigo-600/20 group-hover:scale-110 transition-transform duration-500">
            <Globe size={22} className="text-heading" />
          </div>
          <div className="hidden lg:block overflow-hidden">
            <span className="text-xl font-black tracking-tighter text-heading block leading-none">WEB3</span>
            <span className="text-[10px] font-bold tracking-[0.2em] text-primary uppercase opacity-60">Browser</span>
          </div>
        </div>

        <nav className="flex-1 space-y-3 w-full">
          <NavItem 
            icon={<Globe size={22}/>} 
            label="Explore" 
            active={activeTabObj.type === 'explore' && !activeTabObj.dapp} 
            onClick={() => {
              updateActiveTab({ type: 'explore', dapp: null, query: '' });
            }} 
          />
          <NavItem 
            icon={<Grid size={22}/>} 
            label="DApps" 
            active={activeTabObj.type === 'dapps'} 
            onClick={() => {
              updateActiveTab({ type: 'dapps', dapp: null });
            }} 
          />
          <NavItem icon={<Trophy size={22}/>} label="Rewards" active={activeTabObj.type === 'rewards'} onClick={() => {updateActiveTab({ type: 'rewards', dapp: null })}} />
          <NavItem icon={<Play size={22}/>} label="WTF Zone" active={activeTabObj.type === 'wtf-zone'} onClick={() => {updateActiveTab({ type: 'wtf-zone', dapp: null })}} />
          <NavItem icon={<BookOpen size={22}/>} label="Education" active={activeTabObj.type === 'education'} onClick={() => {updateActiveTab({ type: 'education', dapp: null })}} />
          <NavItem icon={<Shield size={22}/>} label="Security" active={activeTabObj.type === 'security'} onClick={() => {updateActiveTab({ type: 'security', dapp: null })}} />
        </nav>

        <div className="mt-auto pt-8 border-t border-glass-border w-full">
          <NavItem icon={<Settings size={22}/>} label="Settings" active={activeTabObj.type === 'settings'} onClick={() => {updateActiveTab({ type: 'settings', dapp: null })}} />
        </div>
      </aside>

      <main className="flex-1 flex flex-col relative overflow-hidden pb-16 md:pb-0">
        {/* Background Glows */}
        <div className="hero-glow top-[-10%] left-[-10%] w-[50%] h-[50%] bg-indigo-600/20 rounded-full"></div>
        <div className="hero-glow bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-purple-600/20 rounded-full"></div>

        {/* Tab Bar */}
        <div className="h-12 bg-[#0a0c0f] border-b border-glass-border flex items-center px-4 gap-2 overflow-x-auto no-scrollbar relative z-40">
          {(Array.isArray(tabs) ? tabs : []).map((tab) => (
            <div 
              key={tab.id}
              onClick={() => setActiveTabId(tab.id)}
              className={`group h-8 px-4 rounded-xl flex items-center gap-3 cursor-pointer transition-all border shrink-0 max-w-[200px] ${
                activeTabId === tab.id 
                  ? 'bg-card-alpha0 border-glass-border0 text-heading' 
                  : 'bg-transparent border-transparent text-body/40 hover:bg-card-alpha hover:text-body/60'
              }`}
            >
              <Globe size={14} className={activeTabId === tab.id ? "text-primary" : "text-body/20"} />
              <span className="text-xs font-bold truncate tracking-tight">{tab.name}</span>
              <button 
                onClick={(e) => closeTab(e, tab.id)}
                className="opacity-0 group-hover:opacity-100 p-0.5 rounded-md hover:bg-card-alpha0 transition-all"
              >
                <X size={12} />
              </button>
            </div>
          ))}
          <button 
            onClick={() => addTab()}
            className="w-8 h-8 rounded-xl flex items-center justify-center bg-card-alpha border border-glass-border0 text-body/40 hover:text-heading hover:bg-card-alpha0 transition-all active:scale-90 shrink-0"
          >
            <Plus size={16} />
          </button>
        </div>

        {/* Header (Integrated Navigation) */}
        <header className="h-16 border-b border-glass-border flex items-center justify-between px-6 bg-base/60 backdrop-blur-3xl sticky top-0 z-30 gap-4">
          <div className="flex items-center gap-4 flex-1 max-w-5xl">
            {/* Nav Controls */}
            <div className="hidden sm:flex items-center gap-1.5 shrink-0">
              <button 
                disabled={activeTabObj.historyIndex <= 0}
                onClick={() => {
                  const newIndex = activeTabObj.historyIndex - 1;
                  const prevHistory = activeTabObj.history[newIndex];
                  if (prevHistory) {
                    updateActiveTab({ 
                      historyIndex: newIndex,
                      query: prevHistory.query,
                      type: prevHistory.type === 'url' ? 'explore' : 'search',
                      dapp: prevHistory.type === 'url' ? { id: 'custom', name: prevHistory.query, url: prevHistory.query.startsWith('http') ? prevHistory.query : `https://${prevHistory.query}`, icon: '🌐', category: 'Web' } : null,
                      name: prevHistory.type === 'url' ? prevHistory.query : `Search: ${prevHistory.query}`
                    });
                  }
                }}
                className="w-9 h-9 rounded-lg flex items-center justify-center hover:bg-card-alpha0 transition-all disabled:opacity-20 disabled:hover:bg-transparent"
              >
                <ChevronLeft size={18} />
              </button>
              <button 
                disabled={!activeTabObj.history || activeTabObj.historyIndex >= activeTabObj.history.length - 1}
                onClick={() => {
                  const newIndex = activeTabObj.historyIndex + 1;
                  const nextHistory = activeTabObj.history[newIndex];
                  if (nextHistory) {
                    updateActiveTab({ 
                      historyIndex: newIndex,
                      query: nextHistory.query,
                      type: nextHistory.type === 'url' ? 'explore' : 'search',
                      dapp: nextHistory.type === 'url' ? { id: 'custom', name: nextHistory.query, url: nextHistory.query.startsWith('http') ? nextHistory.query : `https://${nextHistory.query}`, icon: '🌐', category: 'Web' } : null,
                      name: nextHistory.type === 'url' ? nextHistory.query : `Search: ${nextHistory.query}`
                    });
                  }
                }}
                className="w-9 h-9 rounded-lg flex items-center justify-center hover:bg-card-alpha0 transition-all disabled:opacity-20 disabled:hover:bg-transparent"
              >
                <ChevronRight size={18} />
              </button>
              <button 
                 onClick={() => {
                   setIframeStatus('loading');
                   setIframeKey(prev => prev + 1);
                   setTimeout(() => {
                     if (activeTabObj.type === 'search') executeSearch(activeTabObj.query);
                     else setIframeStatus('loaded');
                   }, 100);
                 }}
                 className="w-9 h-9 rounded-lg flex items-center justify-center hover:bg-card-alpha0 transition-all border border-glass-border0"
                 title="Reload"
               >
                 <RefreshCw size={16} className={iframeStatus === 'loading' ? 'animate-spin text-primary' : ''} />
               </button>
            </div>

            <div className="relative w-full group">
              <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-body/20 group-focus-within:text-primary transition-all" />
              <input 
                type="text" 
                value={activeTabObj.query || ''}
                onChange={(e) => updateActiveTab({ query: e.target.value })}
                onFocus={() => setShowSuggestions(true)}
                onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    setShowSuggestions(false);
                    executeSearch(activeTabObj.query);
                    e.target.blur();
                  }
                }}
                placeholder="Search or enter URL..." 
                className="w-full bg-card-alpha border border-glass-border rounded-xl py-2 pl-12 pr-10 focus:outline-none focus:ring-1 focus:ring-indigo-500/40 focus:border-indigo-500/40 transition-all font-medium text-sm placeholder:text-body/10"
              />
              
              <button 
                onClick={() => updateActiveTab({ isBookmarked: !activeTabObj.isBookmarked })}
                className="absolute right-4 top-1/2 -translate-y-1/2 transition-all duration-200"
              >
                <Star size={16} className={activeTabObj.isBookmarked ? "text-yellow-400 fill-yellow-400" : "text-body/10"} />
              </button>
              
              {/* Show suggestions only while typing (not when search results are already shown) */}
              {showSuggestions && activeTabObj.query && activeTabObj.type !== 'search' && suggestions.length > 0 && (
                <div className="absolute top-[calc(100%+8px)] left-0 w-full glass rounded-2xl shadow-2xl overflow-hidden z-50 border-glass-border0">
                  <div className="flex flex-col">
                    {(Array.isArray(suggestions) ? suggestions : []).map((suggestion, index) => (
                    <div 
                      key={index}
                      className="px-5 py-3.5 hover:bg-card-alpha cursor-pointer flex items-center gap-4 transition-colors border-b border-glass-border last:border-0"
                      onMouseDown={(e) => {
                        // Use mousedown to fire before blur hides the dropdown
                        e.preventDefault();
                        setShowSuggestions(false);
                        updateActiveTab({ query: suggestion.phrase });
                        executeSearch(suggestion.phrase);
                      }}
                    >
                      <div className="w-8 h-8 rounded-lg bg-card-alpha flex items-center justify-center shrink-0">
                        {suggestion.type === 'internal' ? <Globe size={14} className="text-primary" /> : <Search size={14} className="text-body/20" />}
                      </div>
                      <span className="text-sm font-bold text-body/80">{suggestion.phrase}</span>
                    </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center gap-3">
             <div className="hidden lg:flex items-center bg-card-alpha border border-glass-border rounded-xl px-4 py-1.5 gap-4">
               <div className="text-right">
                  <p className="text-[9px] uppercase tracking-widest text-body/20 font-black">Sync</p>
                  <p className="text-xs font-black text-primary">{points.toLocaleString()}</p>
               </div>
               <div className="w-px h-6 bg-card-alpha"></div>
               <div className="text-right">
                  <p className="text-[9px] uppercase tracking-widest text-emerald-400/50 font-black">Hela</p>
                  <p className="text-xs font-black text-emerald-400">{helaBalance}</p>
               </div>
            </div>
            
            <button 
              onClick={toggleTheme}
              className="w-9 h-9 flex items-center justify-center rounded-xl bg-card-alpha border border-glass-border text-body/40 hover:text-heading hover:bg-card-alpha0 transition-all active:scale-90"
              title="Toggle Theme"
            >
              {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
            </button>
            
            <button 
              onClick={() => walletAddress ? setShowWalletModal(true) : connectWallet()}
              className="flex items-center gap-2.5 button-primary text-heading px-4 py-2 rounded-xl transition-all font-black text-xs uppercase tracking-widest shadow-lg shadow-indigo-600/10 active:scale-95"
            >
              <Wallet size={16} />
              <span>{walletAddress ? truncateAddress(walletAddress) : 'Connect'}</span>
            </button>
          </div>
        </header>

        {/* Main App Workspace */}
        <div className="flex-1 bg-black/20 flex flex-col relative overflow-hidden">
          {(Array.isArray(tabs) ? tabs : []).map(tab => (
            <div key={tab.id} className={tab.id === activeTabId ? "flex flex-col h-full" : "hidden"}>
              {tab.dapp ? (
                <div className="browser-content-area animate-in fade-in duration-500 overflow-hidden">
                  <div className="h-10 border-b border-glass-border flex items-center justify-between px-6 bg-card-alpha backdrop-blur-md shrink-0">
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                        <span className="text-[10px] font-black tracking-widest text-body/40 uppercase">Secure Bridge Active</span>
                      </div>
                      <div className="w-px h-4 bg-card-alpha0"></div>
                      <div className="flex items-center gap-2 opacity-60">
                         {tab.dapp.icon && <span className="scale-75 origin-left">{tab.dapp.icon}</span>}
                         <span className="text-[10px] font-bold text-body/50 truncate max-w-[150px]">{tab.dapp.name}</span>
                      </div>
                      <div className="w-px h-4 bg-card-alpha0"></div>
                      <div className="flex items-center gap-2.5">
                        <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-emerald-500/10 border border-emerald-500/20">
                           <Shield size={10} className="text-emerald-400" />
                           <span className="text-[9px] font-black text-emerald-400 uppercase tracking-tight">
                             {isDeepScanning ? 'SCANNING...' : `${getSiteAdFingerprint(tab.dapp.url).ads} Ads Blocked`}
                           </span>
                        </div>
                        <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-primary/10 border border-indigo-500/20">
                           <Zap size={10} className="text-primary" />
                           <span className="text-[9px] font-black text-primary uppercase tracking-tight">
                             {isDeepScanning ? 'INDEXING...' : `${getSiteAdFingerprint(tab.dapp.url).trackers} Trackers Blocked`}
                           </span>
                        </div>
                        {shieldIntensity === 'high' && (
                          <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-purple-500/10 border border-purple-500/20 animate-pulse">
                             <ShieldCheck size={10} className="text-primary" />
                             <span className="text-[9px] font-black text-primary uppercase tracking-tight">Neural Guard Max</span>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <button 
                         onClick={() => window.open(tab.dapp.url, '_blank')}
                         className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-primary/10 hover:bg-indigo-500/20 text-primary text-[9px] font-black uppercase tracking-widest border border-indigo-500/10 transition-all"
                      >
                         Bypass <ExternalLink size={10} />
                      </button>
                    </div>
                  </div>

                  <div className="flex-1 relative bg-white overflow-hidden">
                    {iframeStatus === 'loading' && (
                      <div className="absolute inset-0 flex flex-col items-center justify-center bg-base z-20">
                        <div className="w-12 h-12 border-4 border-card-alpha border-t-primary rounded-full animate-spin"></div>
                        <p className="mt-4 text-[9px] font-black tracking-[0.3em] uppercase text-body/20">Establishing Neural Link</p>
                      </div>
                    )}

                    <iframe 
                      key={iframeKey}
                      src={`${tab.dapp.url}${tab.dapp.url.includes('?') ? '&' : '?'}v=${iframeKey}`} 
                      sandbox={
                        shieldIntensity === 'high' 
                          ? "allow-scripts allow-same-origin allow-forms" // Removed allow-popups
                          : "allow-scripts allow-same-origin allow-popups allow-forms"
                      } 
                      className={`w-full h-full border-none transition-opacity duration-500 ${iframeStatus === 'loaded' ? 'opacity-100' : 'opacity-0'}`} 
                      title={tab.dapp.name} 
                      onLoad={() => setIframeStatus('loaded')}
                    />
                  </div>
                </div>
              ) : tab.type === 'search' ? (
                 <section className="flex-1 h-full min-h-0 overflow-y-auto animate-in fade-in duration-500 standard-scrollbar">
                   <div className="max-w-4xl mx-auto py-8 px-8 pb-20">
                     <div className="mb-8">
                        <h2 className="text-[10px] font-black uppercase tracking-[0.4em] text-primary/60 mb-2">Neural Indexed Results</h2>
                        <h1 className="text-4xl font-black tracking-tighter uppercase italic opacity-90">Results for <span className="text-primary">"{tab.query}"</span></h1>
                     </div>
                     
                     {tab.isSearching ? (
                       <div className="py-24 flex flex-col items-center">
                          <div className="w-12 h-12 border-2 border-indigo-500/10 border-t-indigo-500 rounded-full animate-spin"></div>
                          <p className="mt-6 text-[10px] font-black uppercase tracking-[0.3em] text-body/20">Querying Peer Nodes</p>
                       </div>
                     ) : tab.searchError ? (
                       <div className="py-16 text-center glass-card rounded-[2.5rem] p-10 border-red-500/10">
                         <div className="w-16 h-16 bg-red-500/5 rounded-2xl flex items-center justify-center mx-auto mb-6">
                            <ShieldAlert size={32} className="text-red-400/50" />
                         </div>
                         <p className="text-lg text-body/60 font-bold mb-6 italic">{tab.searchError}</p>
                         <button 
                           onClick={() => executeSearch(tab.query)}
                           className="px-8 py-3.5 bg-card-alpha hover:bg-card-alpha0 rounded-xl transition-all border border-glass-border font-black text-[10px] uppercase tracking-widest"
                         >
                           Re-Initialize Breach
                         </button>
                       </div>
                     ) : tab.searchResults.length > 0 ? (
                       <div className="grid grid-cols-1 gap-5">
                         {tab.searchResults.map((result, idx) => (
                            <div 
                               key={idx}
                               onClick={() => {
                                 updateActiveTab({ dapp: { id: `search-${idx}`, name: result.domain, url: result.url, icon: '🌐', category: 'Search' } });
                               }}
                               className="group glass-card p-6 rounded-[1.5rem] cursor-pointer hover:border-primary"
                            >
                              <div className="flex items-center gap-2 mb-3">
                                 <div className="w-6 h-6 rounded-md bg-card-alpha flex items-center justify-center group-hover:bg-indigo-600 group-hover:text-heading transition-all">
                                    <Globe size={12} />
                                 </div>
                                 <span className="text-[9px] font-black uppercase tracking-widest text-body/20 group-hover:text-primary/60 transition-colors">{result.domain}</span>
                              </div>
                              <h3 className="text-xl font-black text-heading group-hover:text-primary mb-2 transition-colors tracking-tight leading-tight">{result.title}</h3>
                              <p className="text-xs text-body/40 leading-relaxed font-bold line-clamp-2" dangerouslySetInnerHTML={{ __html: result.description }} />
                              
                              <div className="mt-4 pt-4 border-t border-glass-border flex items-center justify-between opacity-0 group-hover:opacity-100 transition-opacity">
                                 <span className="text-[9px] font-black uppercase tracking-widest text-primary/60">Secure Link Available</span>
                                 <ChevronRight size={14} className="text-primary" />
                              </div>
                            </div>
                         ))}
                       </div>
                     ) : (
                       <div className="py-24 text-center">
                         <p className="text-xl font-black text-body/5 italic uppercase tracking-[0.3em]">No Neural Fragments Detected</p>
                       </div>
                     )}
                   </div>
                 </section>
          ) : tab.type === 'explore' ? (
            <div className="flex-1 min-h-0 overflow-y-auto standard-scrollbar">
            <section className="space-y-16 animate-in fade-in slide-in-from-bottom-8 duration-1000 max-w-6xl mx-auto pb-20 px-10 pt-10">
              <div className="relative text-center max-w-3xl mx-auto">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-indigo-500/20 text-primary text-xs font-black tracking-widest uppercase mb-8">
                  <TrendingUp size={14} /> Trending on Web3
                </div>
                <h1 className="text-4xl md:text-7xl font-black mb-6 tracking-tighter leading-none uppercase">
                  THE <span className="gradient-text">WEB3</span> FRONTIER
                </h1>
                <p className="text-body/40 text-xl font-medium tracking-tight leading-relaxed px-4">
                  Welcome to the future of the internet. Secure, private, and decentralized.
                </p>
              </div>

              {/* Recommended Searches */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[
                  { title: 'Hela Network', url: 'https://helalabs.com', icon: <Globe size={20} className="text-primary"/>, desc: 'Layer 1 Protocol' },
                  { title: 'Top DeFi Projects', url: 'https://defillama.com', icon: <TrendingUp size={20} className="text-emerald-400"/>, desc: 'Yield & Liquidity' },
                  { title: 'NFT Trends', url: 'https://superrare.com', icon: <Layout size={20} className="text-primary"/>, desc: 'Digital Assets' }
                ].map((item, i) => (
                  <div key={i} onClick={() => updateActiveTab({ dapp: { id: `explore-${i}`, name: item.title, url: item.url, icon: '🌐', category: item.desc } })} className="glass-card p-8 rounded-[2.5rem] hover:border-indigo-500/40 transition-all cursor-pointer group">
                    <div className="w-12 h-12 glass rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 group-hover:rotate-6 transition-all">{item.icon}</div>
                    <h3 className="text-xl font-black mb-2 tracking-tight group-hover:text-primary transition-colors uppercase">{item.title}</h3>
                    <p className="text-sm text-body/30 font-bold italic">{item.desc}</p>
                  </div>
                ))}
              </div>

              {/* Recommended Apps Section */}
              <div className="glass-card rounded-[3.5rem] p-12 border-glass-border relative overflow-hidden">
                <div className="absolute top-[-20%] right-[-10%] w-[40%] h-[40%] bg-primary/10 rounded-full blur-[100px]"></div>
                <div className="flex items-center justify-between mb-12">
                   <div>
                      <h2 className="text-2xl md:text-3xl font-black tracking-tighter uppercase mb-2">Essential Protocols</h2>
                      <p className="text-body/30 font-bold italic">Handpicked elite decentralized applications.</p>
                   </div>
                   <button onClick={() => updateActiveTab({ type: 'dapps' })} className="flex items-center gap-3 text-primary font-black tracking-widest uppercase text-xs hover:text-heading transition-colors group">
                     View Full Grid <ChevronRight size={16} className="group-hover:translate-x-1 transition-transform" />
                   </button>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                  {DAPPS.slice(0, 4).map((dapp) => (
                    <div key={dapp.id} onClick={() => updateActiveTab({ dapp: dapp })} className="flex flex-col items-center text-center group cursor-pointer">
                      <div className="w-20 h-20 glass rounded-3xl flex items-center justify-center text-4xl mb-4 group-hover:scale-110 group-hover:-translate-y-2 transition-all shadow-xl group-hover:shadow-indigo-500/20">
                        {dapp.icon || '🌐'}
                      </div>
                      <span className="text-base font-black uppercase tracking-tight group-hover:text-primary transition-colors">{dapp.name}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* News/Feed Section */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                <div className="glass-card rounded-[3rem] p-10 border-glass-border0">
                  <div className="flex items-center gap-4 mb-10">
                    <Newspaper size={24} className="text-primary" />
                    <h3 className="text-2xl font-black tracking-tight uppercase">Frontier Pulse</h3>
                  </div>
                  <div className="space-y-8">
                    <ActivityItem label="Hela Alpha Synchronized" date="JUST NOW" points="URGENT" />
                    <ActivityItem label="DeFi 2.0 Liquidity Wave" date="2 HOURS AGO" points="SYSTEM" />
                    <ActivityItem label="Mainnet Payload Delivered" date="1 DAY AGO" points="LOG" />
                  </div>
                </div>
                <div className="flex items-center justify-center glass-card rounded-[3rem] p-10 relative overflow-hidden bg-gradient-to-br from-indigo-600/10 to-transparent">
                   <div className="text-center">
                     <Play size={64} className="text-body/20 mx-auto mb-6 animate-pulse" />
                     <h3 className="text-xl font-black tracking-tighter uppercase opacity-30">Watch Tutorial</h3>
                     <p className="text-xs text-body/10 font-bold tracking-[0.3em] mt-4 uppercase">Coming in Cycle 4</p>
                   </div>
                </div>
              </div>
            </section>
            </div>
          ) : tab.type === 'dapps' ? (
            <div className="flex-1 min-h-0 overflow-y-auto standard-scrollbar">
            <section className="space-y-16 animate-in fade-in slide-in-from-bottom-8 duration-1000 max-w-6xl mx-auto pb-20 px-10 pt-10">
              <div className="flex flex-col lg:flex-row items-end justify-between gap-6 border-b border-glass-border pb-10">
                <div>
                  <h1 className="text-4xl md:text-6xl font-black mb-4 tracking-tighter uppercase leading-none italic">ECOSYSTEM</h1>
                  <p className="text-body/40 text-xl font-medium tracking-tight">The complete decentralized application registry.</p>
                </div>
                <div className="flex gap-4">
                  <div className="glass px-6 py-3 rounded-2xl text-xs font-black tracking-widest uppercase border-glass-border0">{dappList.length} NODES FOUND</div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
                {dappList.map((dapp) => (
                  <div 
                    key={dapp.id} 
                    className="group glass-card p-10 rounded-[3rem] relative overflow-hidden cursor-pointer"
                    onClick={async () => {
                      updateActiveTab({ dapp: dapp, name: dapp.name });
                      if (walletAddress) {
                        await claimReward('dapp_interaction', 1);
                      }
                    }}
                  >
                    <div className="absolute -top-10 -right-10 w-40 h-40 bg-primary/10 rounded-full blur-3xl group-hover:bg-indigo-600/30 transition-all duration-700"></div>
                    
                    <div className="flex items-start justify-between mb-10">
                      <div className="w-20 h-20 glass rounded-3xl flex items-center justify-center text-4xl group-hover:scale-110 group-hover:rotate-6 transition-all duration-500 shadow-2xl border-glass-border0 group-hover:shadow-indigo-500/20">
                        {dapp.icon || '🌐'}
                      </div>
                      <span className="text-[10px] font-black uppercase tracking-[0.3em] text-primary bg-primary/10 px-4 py-2 rounded-full border border-indigo-500/20">
                        {dapp.category}
                      </span>
                    </div>
                    <h3 className="text-2xl font-black mb-3 group-hover:text-primary transition-colors tracking-tight uppercase leading-none">{dapp.name}</h3>
                    <p className="text-base text-body/40 leading-relaxed font-medium mb-10 h-10 overflow-hidden line-clamp-2">{dapp.description}</p>
                    <div className="flex items-center text-sm font-black text-body/20 group-hover:text-heading transition-all tracking-[0.2em] uppercase">
                      Execute Link <ChevronRight size={18} className="ml-2 group-hover:translate-x-2 transition-transform text-primary" />
                    </div>
                  </div>
                ))}
              </div>
            </section>
            </div>
          ) : tab.type === 'rewards' ? (
             <div className="flex-1 min-h-0 overflow-y-auto standard-scrollbar">
             <section className="space-y-16 animate-in fade-in slide-in-from-bottom-8 duration-700 max-w-6xl mx-auto pb-20 relative px-10 pt-10">
                <div className="absolute top-1/4 left-1/4 w-[40%] h-[40%] bg-primary/10 rounded-full blur-[120px] pointer-events-none"></div>
                
                <div className="flex flex-col lg:flex-row items-center justify-between gap-8 relative z-10">
                  <div className="text-center lg:text-left">
                    <h1 className="text-4xl md:text-6xl font-black mb-4 tracking-tighter uppercase leading-none italic opacity-90 drop-shadow-xl">REWARDS ENGINE</h1>
                    <p className="text-body/40 text-xl font-medium tracking-tight">Ecosystem contributions and $HELA yield conversion.</p>
                  </div>
                  <button 
                    onClick={() => {
                      if (points >= 1000) {
                        setRedeemAmount(1000); // Default to minimum
                        setShowRedeemModal(true);
                      }
                    }}
                    disabled={isRedeeming || points < 1000}
                    className={`group relative px-10 py-5 rounded-3xl font-black text-lg transition-all shadow-2xl flex items-center gap-3 overflow-hidden ${
                      points >= 1000 
                        ? 'bg-[#00d1ff] hover:bg-[#00b8e6] text-black shadow-[#00d1ff]/20 active:scale-95' 
                        : 'bg-card-alpha0 text-body/30 cursor-not-allowed border border-glass-border'
                    }`}
                  >
                    {isRedeeming ? (
                      <div className="w-6 h-6 border-2 border-black/20 border-t-black rounded-full animate-spin"></div>
                    ) : (
                      <Zap size={24} className={points >= 1000 ? "group-hover:animate-bounce" : ""} />
                    )}
                    <span className="relative z-10">{isRedeeming ? 'PROCESSING...' : 'REDEEM HELA COINS'}</span>
                    {points >= 1000 && <div className="absolute inset-0 bg-card-alpha0 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>}
                  </button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 relative z-10">
                   <div className="lg:col-span-1 space-y-6">
                      <RewardCard icon={<Zap size={20} className="text-yellow-400"/>} label="Points Balance" value={points.toLocaleString()} subValue="1000 pts = 1 Hela" />
                      <RewardCard icon={<CreditCard size={20} className="text-emerald-400"/>} label="Hela Balance" value={`${helaBalance} HELA`} subValue="Verified Chain" />
                   </div>

                   <div className="lg:col-span-3 grid grid-cols-1 md:grid-cols-2 gap-8">
                      {/* Browsing Rewards */}
                      <div className="group glass-card rounded-[3rem] p-8 border-glass-border bg-card-alpha hover:bg-card-alpha0 transition-all space-y-6 relative overflow-hidden">
                         <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:opacity-20 group-hover:scale-110 transition-all duration-500">
                           <Globe size={100} />
                         </div>
                         <div className="flex justify-between items-start relative z-10">
                           <h3 className="text-xl font-black uppercase tracking-tighter text-primary">Browsing Payload</h3>
                           <span className="text-[10px] font-black bg-indigo-500/20 text-primary px-3 py-1 rounded-full border border-primary">Auto-Yield</span>
                         </div>
                         <p className="text-sm text-body/40 font-bold relative z-10">Passive point generation enabled. Browse the ecosystem to automatically stack points over time.</p>
                         <div className="p-4 bg-emerald-500/10 rounded-2xl border border-emerald-500/20 text-emerald-400 text-[10px] font-black uppercase tracking-widest text-center shadow-[0_0_15px_rgba(16,185,129,0.1)] relative z-10">Active: +1.5x Multiplier Enabled</div>
                         <button 
                           onClick={() => updateActiveTab({ type: 'dapps' })}
                           className="w-full py-3 glass rounded-[1.5rem] text-[10px] font-black uppercase tracking-widest hover:bg-indigo-500/20 hover:text-heading transition-all border-glass-border0 mt-2 relative z-10 flex items-center justify-center gap-2"
                         >
                           Explore DApps
                         </button>
                      </div>
                      
                      {/* WTF Quests */}
                      <div className="group glass-card rounded-[3rem] p-8 border-glass-border bg-card-alpha hover:bg-card-alpha0 transition-all space-y-6 relative overflow-hidden">
                         <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:opacity-20 group-hover:scale-110 transition-all duration-500">
                           <Trophy size={100} />
                         </div>
                         <div className="flex justify-between items-start relative z-10">
                           <h3 className="text-xl font-black uppercase tracking-tighter text-primary">WTF Quests</h3>
                           <span className="text-[10px] font-black bg-purple-500/20 text-primary px-3 py-1 rounded-full border border-purple-500/30">Up to +50 PTS</span>
                         </div>
                         <p className="text-sm text-body/40 font-bold relative z-10">Complete high-value side quests to boost your neural rank and earn point drops.</p>
                         <button 
                           onClick={() => setShowQuestModal(true)}
                           className="w-full py-4 glass rounded-[1.5rem] text-xs font-black uppercase tracking-widest hover:bg-purple-500/20 hover:text-heading transition-all border-glass-border0 hover:border-purple-500/50 relative z-10 active:scale-95 flex items-center justify-center gap-2"
                         >
                           <Play size={14} />
                           Launch Quests
                         </button>
                      </div>

                       {/* Partner Cashback */}
                       <div className="group glass-card rounded-[3rem] p-8 border-glass-border bg-card-alpha hover:bg-card-alpha0 transition-all space-y-6 relative overflow-hidden">
                          <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:opacity-20 group-hover:scale-110 transition-all duration-500">
                            <Store size={100} />
                          </div>
                          <div className="flex justify-between items-start relative z-10">
                            <h3 className="text-xl font-black uppercase tracking-tighter text-emerald-400">Partner Vouchers</h3>
                            <span className="text-[10px] font-black bg-emerald-500/20 text-emerald-400 px-3 py-1 rounded-full border border-emerald-500/30">Store</span>
                          </div>
                          <p className="text-sm text-body/40 font-bold relative z-10">Redeem your hard-earned points for exclusive brand vouchers and digital gift cards.</p>
                          <button 
                            onClick={() => setShowVoucherModal(true)}
                            className="w-full py-4 glass rounded-[1.5rem] text-xs font-black uppercase tracking-widest hover:bg-emerald-500/20 hover:text-heading transition-all border-glass-border0 hover:border-emerald-500/50 relative z-10 active:scale-95 flex items-center justify-center gap-2"
                          >
                            <ShoppingCart size={14} />
                            Voucher Grid
                          </button>
                       </div>

                      {/* Node Referrals */}
                      <div className="group glass-card rounded-[3rem] p-8 border-glass-border bg-card-alpha hover:bg-card-alpha0 transition-all space-y-6 relative overflow-hidden">
                         <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:opacity-20 group-hover:scale-110 transition-all duration-500">
                           <Users size={100} />
                         </div>
                         <div className="flex justify-between items-start relative z-10">
                           <h3 className="text-xl font-black uppercase tracking-tighter text-primary">Node Referrals</h3>
                           <span className="text-[10px] font-black bg-indigo-500/20 text-primary px-3 py-1 rounded-full border border-primary">+50 PTS</span>
                         </div>
                         <p className="text-sm text-body/40 font-bold relative z-10">Expand the matrix by referring new nodes. Earn 50 pts per verified identity sync.</p>
                         <div className="flex gap-2 relative z-10 mt-auto">
                            <button 
                              onClick={() => setShowShareModal(true)}
                              className="w-full py-4 button-primary rounded-xl text-xs font-black uppercase border-glass-border0 transition-all shadow-lg active:scale-95 flex items-center justify-center"
                            >
                              Share Node
                            </button>
                         </div>
                      </div>
                   </div>
                </div>

                {/* Reward History Section */}
                <div className="glass-card rounded-[3rem] p-8 border-glass-border bg-white/3 relative overflow-hidden">
                   <div className="flex items-center justify-between mb-8">
                      <div className="flex items-center gap-3">
                         <div className="w-10 h-10 glass rounded-xl flex items-center justify-center text-primary">
                            <Activity size={20} />
                         </div>
                         <div>
                            <h3 className="text-xl font-black uppercase tracking-tighter">Activity Stream</h3>
                            <p className="text-[10px] text-body/30 font-black tracking-widest uppercase">Last 24 Hours of Neural Earnings</p>
                         </div>
                      </div>
                      <div className="text-right">
                         <span className="text-[10px] font-black text-primary/60 uppercase tracking-widest border border-indigo-500/20 px-3 py-1 rounded-full bg-indigo-500/5">Encrypted Log</span>
                      </div>
                   </div>

                    <div className="space-y-3">
                      {(!Array.isArray(rewardHistory) || rewardHistory.filter(r => r && r.points > 0).length === 0) ? (
                         <div className="py-10 text-center glass rounded-3xl border-dashed border-glass-border">
                            <p className="text-sm font-bold text-body/20 uppercase tracking-widest">No recent neural fragments detected.</p>
                         </div>
                      ) : (
                         (Array.isArray(rewardHistory) ? rewardHistory : []).filter(r => r && r.points > 0).slice(0, 10).map((reward, i) => {
                            const typeMap = {
                               'dapp_interaction': { label: 'Explorer Access', icon: <Globe size={14}/>, color: 'text-primary' },
                               'login': { label: 'Chain Login', icon: <Lock size={14}/>, color: 'text-emerald-400' },
                               'wtf_quest': { label: 'Main Mission', icon: <Trophy size={14}/>, color: 'text-primary' },
                               'wtf_quest_action': { label: 'WTF Zone Play', icon: <Gamepad2 size={14}/>, color: 'text-red-400' },
                               'node_referral': { label: 'Node Sync', icon: <Users size={14}/>, color: 'text-blue-400' },
                               'partner_cashback': { label: 'Voucher Grid', icon: <ShoppingCart size={14}/>, color: 'text-emerald-400' },
                               'signup_bonus': { label: 'Genesis Bonus', icon: <Star size={14}/>, color: 'text-yellow-400' }
                            };
                            const info = typeMap[reward.activity_type] || { label: 'Neural Fragment', icon: <Zap size={14}/>, color: 'text-primary' };
                            
                            return (
                               <div key={reward.id || i} className="flex items-center justify-between p-4 glass rounded-2xl border-glass-border hover:bg-card-alpha transition-all group animate-in slide-in-from-left duration-500" style={{ animationDelay: `${i * 100}ms` }}>
                                  <div className="flex items-center gap-4">
                                     <div className={`w-10 h-10 rounded-xl bg-card-alpha flex items-center justify-center ${info.color} group-hover:scale-110 transition-transform shadow-inner`}>
                                        {info.icon}
                                     </div>
                                     <div>
                                        <div className="text-sm font-black uppercase tracking-tight text-body/80">{info.label}</div>
                                        <div className="text-[9px] font-bold text-body/20 uppercase tracking-widest">{reward.created_at ? new Date(reward.created_at).toLocaleTimeString() : ''} · {reward.created_at ? new Date(reward.created_at).toLocaleDateString() : ''}</div>
                                     </div>
                                  </div>
                                  <div className={`text-sm font-black ${info.color}`}>
                                     +{reward.points || 0} PTS
                                  </div>
                               </div>
                            );
                         })
                      )}
                    </div>
                </div>
             </section>
             </div>
          ) : tab.type === 'builtin-content' ? (
             <div className="flex-1 min-h-0 overflow-y-auto standard-scrollbar">
             <BuiltinContentView 
               content={INTERNAL_CONTENT[tab.contentId]} 
               onBack={() => updateActiveTab({ type: INTERNAL_CONTENT[tab.contentId]?.category === 'Education' ? 'education' : 'security' })} 
             />
             </div>
          ) : tab.type === 'wtf-zone' ? (
            <div className="flex-1 min-h-0 overflow-y-auto standard-scrollbar">
            <section className="space-y-16 animate-in fade-in slide-in-from-bottom-8 duration-1000 max-w-6xl mx-auto pb-20 px-10 pt-10">
               <div className="text-center mb-16 relative">
                  <div className="hero-glow top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-red-600/10 blur-[100px] -z-10"></div>
                  <h1 className="text-6xl font-black mb-4 tracking-tighter uppercase italic leading-tight">WTF ZONE</h1>
                  <p className="text-body/30 text-xl font-medium tracking-tight uppercase tracking-widest">Connect your skills to the Hela economy.</p>
               </div>

               <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                  <div className="group glass-card rounded-[3.5rem] p-10 border-glass-border hover:border-red-500/50 hover:shadow-[0_0_30px_rgba(239,68,68,0.2)] transition-all cursor-pointer bg-gradient-to-br from-red-500/5 to-transparent flex flex-col items-center text-center relative overflow-hidden">
                     <div className="absolute inset-0 bg-red-500/0 group-hover:bg-red-500/5 transition-colors duration-500"></div>
                     <div className="w-20 h-20 glass rounded-3xl flex items-center justify-center text-red-400 mb-6 group-hover:scale-110 group-hover:-translate-y-2 transition-transform duration-500 shadow-lg group-hover:shadow-red-500/30 relative z-10"><Terminal size={36} className="group-hover:animate-pulse" /></div>
                     <h3 className="text-2xl font-black uppercase tracking-tight mb-3">Snake Terminal</h3>
                     <p className="text-sm text-body/40 font-bold mb-8 relative z-10">Navigate the neural grid. Collect fragments to earn points. Keyboard optimized.</p>
                     <button 
                       onClick={() => setActiveGame('snake')}
                       className="w-full mt-auto py-4 glass rounded-[1.5rem] font-black text-xs uppercase tracking-widest border-glass-border0 group-hover:bg-red-500 group-hover:text-heading transition-all shadow-lg active:scale-95 relative z-10"
                     >
                       INITIATE SEQUENCE
                     </button>
                  </div>

                  <div className="group glass-card rounded-[3.5rem] p-10 border-glass-border hover:border-blue-500/50 hover:shadow-[0_0_30px_rgba(59,130,246,0.2)] transition-all cursor-pointer bg-gradient-to-br from-blue-500/5 to-transparent flex flex-col items-center text-center relative overflow-hidden">
                     <div className="absolute inset-0 bg-blue-500/0 group-hover:bg-blue-500/5 transition-colors duration-500"></div>
                     <div className="w-20 h-20 glass rounded-3xl flex items-center justify-center text-blue-400 mb-6 group-hover:scale-110 group-hover:-translate-y-2 transition-transform duration-500 shadow-lg group-hover:shadow-blue-500/30 relative z-10"><LayoutGrid size={36} /></div>
                     <h3 className="text-2xl font-black uppercase tracking-tight mb-3">Tetris Override</h3>
                     <p className="text-sm text-body/40 font-bold mb-8 relative z-10">Classic block stacking. Clear rows, build multiplier, sync points.</p>
                     <button 
                       onClick={() => { setActiveGame('tetris'); claimReward('wtf_quest_action', 5); }}
                       className="w-full mt-auto py-4 glass rounded-[1.5rem] font-black text-xs uppercase tracking-widest border-glass-border0 group-hover:bg-blue-500 group-hover:text-heading transition-all shadow-lg active:scale-95 relative z-10"
                     >
                       DEPLOY BLOCKS
                     </button>
                  </div>

                  <div className="group glass-card rounded-[3.5rem] p-10 border-glass-border hover:border-cyan-500/50 hover:shadow-[0_0_30px_rgba(6,182,212,0.2)] transition-all cursor-pointer bg-gradient-to-br from-cyan-500/5 to-transparent flex flex-col items-center text-center relative overflow-hidden">
                     <div className="absolute inset-0 bg-cyan-500/0 group-hover:bg-cyan-500/5 transition-colors duration-500"></div>
                     <div className="w-20 h-20 glass rounded-3xl flex items-center justify-center text-cyan-400 mb-6 group-hover:scale-110 group-hover:-translate-y-2 transition-transform duration-500 shadow-lg group-hover:shadow-cyan-500/30 relative z-10"><Rocket size={36} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" /></div>
                     <h3 className="text-2xl font-black uppercase tracking-tight mb-3">Neon Blaster</h3>
                     <p className="text-sm text-body/40 font-bold mb-8 relative z-10">Defend the grid from alien UFOs. Pixel block elements and endless waves.</p>
                     <button 
                       onClick={() => { setActiveGame('space'); claimReward('wtf_quest_action', 5); }}
                       className="w-full mt-auto py-4 glass rounded-[1.5rem] font-black text-xs uppercase tracking-widest border-glass-border0 group-hover:bg-cyan-500 group-hover:text-heading transition-all shadow-lg active:scale-95 relative z-10"
                     >
                       LAUNCH SHIP
                     </button>
                  </div>

                  <div className="group glass-card rounded-[3.5rem] p-10 border-glass-border hover:border-purple-500/50 hover:shadow-[0_0_30px_rgba(168,85,247,0.2)] transition-all cursor-pointer bg-gradient-to-br from-purple-500/5 to-transparent flex flex-col items-center text-center relative overflow-hidden">
                     <div className="absolute inset-0 bg-purple-500/0 group-hover:bg-purple-500/5 transition-colors duration-500"></div>
                     <div className="w-20 h-20 glass rounded-3xl flex items-center justify-center text-primary mb-6 group-hover:scale-110 group-hover:-translate-y-2 transition-transform duration-500 shadow-lg group-hover:shadow-purple-500/30 relative z-10"><Gamepad2 size={36} /></div>
                     <h3 className="text-2xl font-black uppercase tracking-tight mb-3">Tic Tac Toe</h3>
                     <p className="text-sm text-body/40 font-bold mb-8 relative z-10">2-player classic showdown. Never settle for a draw. Settle on the chain.</p>
                     <button 
                       onClick={() => { setActiveGame('tictactoe'); claimReward('wtf_quest_action', 5); }}
                       className="w-full mt-auto py-4 glass rounded-[1.5rem] font-black text-xs uppercase tracking-widest border-glass-border0 group-hover:bg-purple-500 group-hover:text-heading transition-all shadow-lg active:scale-95 relative z-10"
                     >
                       START DUEL (2P)
                     </button>
                  </div>
               </div>
            </section>
            </div>
          ) : tab.type === 'education' ? (
            <div className="flex-1 min-h-0 overflow-y-auto standard-scrollbar">
            <section className="space-y-16 animate-in fade-in slide-in-from-bottom-8 duration-1000 max-w-6xl mx-auto pb-20 px-10 pt-10">
              <div className="text-center mb-16 relative">
                 <div className="hero-glow top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-primary/10 blur-[100px] -z-10"></div>
                 <h1 className="text-6xl font-black mb-4 tracking-tighter uppercase italic leading-tight">EDUCATION HUB</h1>
                 <p className="text-body/30 text-xl font-medium tracking-tight uppercase tracking-widest">Master the decentralized frontier.</p>
              </div>

              {/* Web3 Basics Section */}
              <div className="space-y-10">
                <div className="flex items-center gap-4 border-l-4 border-indigo-500 pl-6">
                  <h2 className="text-3xl font-black uppercase tracking-tighter">Web3 Basics</h2>
                  <div className="text-[10px] font-black uppercase text-primary bg-primary/10 px-3 py-1 rounded-full border border-indigo-500/20">Beginner Friendly</div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  <EduCard 
                    title="What is Web3?" 
                    description="The new version of the internet where you own your own data, identity, and digital assets instead of relying on a few big companies."
                    icon={<Globe size={24} className="text-primary" />}
                    url="edu-web3"
                    onLearnMore={(id) => {
                      updateActiveTab({ type: 'builtin-content', contentId: id, name: 'Web3 Guide' });
                      claimReward('web_search', 2); // Small reward for learning
                    }}
                  />
                  <EduCard 
                    title="What is Blockchain?" 
                    description="A secure, shared digital ledger that records transactions without needing a bank or middleman, making it transparent and permanent."
                    icon={<Layers size={24} className="text-emerald-400" />}
                    url="edu-blockchain"
                    onLearnMore={(id) => {
                      updateActiveTab({ type: 'builtin-content', contentId: id, name: 'Blockchain Guide' });
                      claimReward('web_search', 2);
                    }}
                  />
                  <EduCard 
                    title="What is a Crypto Wallet?" 
                    description="A digital tool that lets you store, send, and receive cryptocurrencies and NFTs. It acts as your ID in the decentralized world."
                    icon={<Wallet size={24} className="text-primary" />}
                    url="edu-wallet"
                    onLearnMore={(id) => {
                      updateActiveTab({ type: 'builtin-content', contentId: id, name: 'Wallet Essentials' });
                      claimReward('web_search', 2);
                    }}
                  />
                  <EduCard 
                    title="What are Smart Contracts?" 
                    description="Automatic programs that execute agreements when specific conditions are met, ensuring trust without needing a lawyer."
                    icon={<Cpu size={24} className="text-yellow-400" />}
                    url="edu-sc"
                    onLearnMore={(id) => {
                      updateActiveTab({ type: 'builtin-content', contentId: id, name: 'Smart Contract Hub' });
                      claimReward('web_search', 2);
                    }}
                  />
                  <EduCard 
                    title="What are dApps?" 
                    description="Decentralized applications that run on a blockchain instead of a private company server, so they can't be easily shut down or censored."
                    icon={<Zap size={24} className="text-primary" />}
                    url="edu-dapps"
                    onLearnMore={(id) => {
                      updateActiveTab({ type: 'builtin-content', contentId: id, name: 'dApp Essentials' });
                      claimReward('web_search', 2);
                    }}
                  />
                </div>
              </div>

              {/* Popular dApps Section */}
              <div className="space-y-10 pt-10">
                <div className="flex items-center gap-4 border-l-4 border-purple-500 pl-6">
                  <h2 className="text-3xl font-black uppercase tracking-tighter">Popular Web3 dApps</h2>
                  <div className="text-[10px] font-black uppercase text-primary bg-purple-400/10 px-3 py-1 rounded-full border border-purple-500/20">Protocol Spotlight</div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  <EduCard 
                    title="Uniswap" 
                    description="A decentralized exchange (DEX) where you can swap tokens directly from your wallet without needing a central middleman."
                    tag="DeFi Exchange"
                    url="https://app.uniswap.org"
                    onLearnMore={(url) => updateActiveTab({ dapp: { id: 'edu-uniswap', name: 'Uniswap', url, icon: '🦄', category: 'dApp' } })}
                  />
                  <EduCard 
                    title="OpenSea" 
                    description="The largest marketplace for digital collectibles (NFTs). You can buy, sell, or discover unique digital art and music here."
                    tag="NFT Marketplace"
                    url="https://opensea.io"
                    onLearnMore={(url) => updateActiveTab({ dapp: { id: 'edu-opensea', name: 'OpenSea', url, icon: '🌊', category: 'dApp' } })}
                  />
                  <EduCard 
                    title="Aave" 
                    description="A protocol where you can lend or borrow crypto. It lets users earn interest on their deposits or take out loans instantly."
                    tag="Lending & Borrowing"
                    url="https://app.aave.com"
                    onLearnMore={(url) => updateActiveTab({ dapp: { id: 'edu-aave', name: 'Aave', url, icon: '👻', category: 'dApp' } })}
                  />
                  <EduCard 
                    title="Lens Protocol" 
                    description="A decentralized social network graph. It allows users to own their social profile and content instead of the platform owning it."
                    tag="Decentralized Social"
                    url="https://www.lens.xyz/"
                    onLearnMore={(url) => updateActiveTab({ dapp: { id: 'edu-lens', name: 'Lens', url, icon: '🌿', category: 'dApp' } })}
                  />
                  <EduCard 
                    title="Friend.tech" 
                    description="A social app that lets you buy and sell 'keys' of social profiles, giving you access to private chats and community perks."
                    tag="Social Finance"
                    url="https://www.friend.tech/"
                    onLearnMore={(url) => updateActiveTab({ dapp: { id: 'edu-ft', name: 'Friend.tech', url, icon: '🤝', category: 'dApp' } })}
                  />
                </div>
              </div>

              {/* Concept Visualization */}
              <div className="glass-card rounded-[4rem] p-16 border-indigo-500/10 relative overflow-hidden bg-gradient-to-br from-indigo-900/10 to-transparent flex flex-col lg:flex-row items-center gap-12">
                 <div className="flex-1 space-y-8">
                    <h2 className="text-5xl font-black tracking-tighter uppercase italic leading-none">THE BLOCKCHAIN <br/><span className="gradient-text">REVOLUTION</span></h2>
                    <p className="text-body/40 text-lg font-medium leading-relaxed">
                       Blockchain technology is the foundation of Web3. It creates a digital environment where users can interact, trade, and build without permission from central authorities.
                    </p>
                    <div className="flex gap-6">
                       <button 
                         onClick={() => updateActiveTab({ dapp: { id: 'edu-web3', name: 'Web3 Guide', url: 'https://en.wikipedia.org/wiki/Web3', icon: '🌐', category: 'Education' } })}
                         className="bg-white text-indigo-900 px-10 py-5 rounded-[2rem] font-black text-lg hover:shadow-2xl transition-all active:scale-95"
                       >
                          START JOURNEY
                       </button>
                    </div>
                 </div>
                 <div className="flex-1 w-full flex justify-center">
                    <div className="w-full max-w-md aspect-square glass rounded-[3rem] border-glass-border overflow-hidden flex items-center justify-center relative group">
                        <div className="absolute inset-0 bg-primary/10 group-hover:bg-indigo-600/20 transition-colors"></div>
                        <Layers size={100} className="text-primary animate-float opacity-30" />
                        <div className="absolute flex flex-col items-center gap-2">
                           <div className="w-4 h-4 rounded-full bg-indigo-500 shadow-glow"></div>
                           <div className="w-1 h-32 bg-gradient-to-b from-indigo-500 to-transparent"></div>
                        </div>
                    </div>
                 </div>
              </div>
            </section>
            </div>
          ) : tab.type === 'security' ? (
            <div className="flex-1 min-h-0 overflow-y-auto standard-scrollbar">
            <section className="space-y-16 animate-in fade-in slide-in-from-bottom-8 duration-1000 max-w-6xl mx-auto pb-20 px-10 pt-10">
              <div className="text-center mb-16 relative">
                 <div className="hero-glow top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-red-500/10 blur-[100px] -z-10"></div>
                 <h1 className="text-6xl font-black mb-4 tracking-tighter uppercase italic leading-tight">SECURITY PROTOCOL</h1>
                 <p className="text-body/30 text-xl font-medium tracking-tight uppercase tracking-widest">Fortifying your decentralized presence.</p>
              </div>

              {/* Security Protocol Dashboard */}
              <div className="space-y-10">
                <div className="flex items-center gap-4 border-l-4 border-red-500 pl-6">
                  <h2 className="text-3xl font-black uppercase tracking-tighter">Active Protection</h2>
                  <div className="text-[10px] font-black uppercase text-red-400 bg-red-400/10 px-3 py-1 rounded-full border border-red-500/20">Critical Shield Active</div>
                </div>

                {/* Security Dashboard */}
                <div className="glass-card rounded-[3.5rem] p-10 border-glass-border bg-gradient-to-br from-red-500/5 to-transparent relative overflow-hidden">
                   <div className="absolute top-0 right-0 p-8 opacity-5"><Shield size={120} /></div>
                   <div className="relative z-10">
                      <div className="flex flex-col lg:flex-row justify-between gap-10">
                         <div className="flex-1 space-y-6">
                            <div>
                               <h3 className="text-2xl font-black uppercase tracking-tight mb-2 italic">Neural Guard Configuration</h3>
                               <p className="text-sm text-body/40 font-bold leading-relaxed">Adjust the intensity of the neural link shielding. Higher levels provide stricter isolation but may affect functionality of some legacy protocols.</p>
                            </div>
                            
                            <div className="flex flex-wrap gap-4">
                               {[
                                 { id: 'low', label: 'Balanced', desc: 'Standard protection', color: 'indigo' },
                                 { id: 'medium', label: 'Shielded', desc: 'Active ad filtering', color: 'emerald' },
                                 { id: 'high', label: 'Paranoid', desc: 'Maximum isolation', color: 'red' }
                               ].map((level) => (
                                 <button 
                                   key={level.id}
                                   onClick={() => setShieldIntensity(level.id)}
                                   className={`flex-1 min-w-[140px] p-5 rounded-[2rem] border transition-all text-left group ${
                                     shieldIntensity === level.id 
                                       ? `bg-${level.color}-500/20 border-${level.color}-500/40 shadow-lg shadow-${level.color}-500/10` 
                                       : 'bg-card-alpha border-glass-border hover:bg-card-alpha0'
                                   }`}
                                 >
                                   <div className={`text-[10px] font-black uppercase tracking-[0.2em] mb-1 ${shieldIntensity === level.id ? `text-${level.color}-400` : 'text-body/20'}`}>{level.label}</div>
                                   <div className={`text-xs font-bold ${shieldIntensity === level.id ? 'text-heading' : 'text-body/40'}`}>{level.desc}</div>
                                 </button>
                               ))}
                            </div>
                         </div>
                         
                         <div className="w-full lg:w-72 glass rounded-[2.5rem] p-6 border-glass-border space-y-6">
                            <div className="flex items-center justify-between">
                               <span className="text-[10px] font-black uppercase text-body/30 tracking-widest">Shield Status</span>
                               <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                            </div>
                            <div className="space-y-4">
                               <div className="flex items-center justify-between">
                                  <span className="text-xs font-bold text-body/60">Ad-Blocker</span>
                                  <span className="text-xs font-black text-emerald-400">ACTIVE</span>
                               </div>
                               <div className="flex items-center justify-between">
                                  <span className="text-xs font-bold text-body/60">Trackers</span>
                                  <span className="text-xs font-black text-emerald-400">INDEXED</span>
                               </div>
                               <div className="flex items-center justify-between">
                                  <span className="text-xs font-bold text-body/60">Popup Guard</span>
                                  <span className={`text-xs font-black ${shieldIntensity === 'high' ? 'text-red-400' : 'text-body/20'}`}>
                                    {shieldIntensity === 'high' ? 'STRICT' : 'OFF'}
                                  </span>
                               </div>
                            </div>
                            <div className="pt-4 border-t border-glass-border">
                               <button 
                                 onClick={() => { setIframeKey(prev => prev + 1); setIsDeepScanning(true); setTimeout(() => setIsDeepScanning(false), 2000); }}
                                 className="w-full py-3 bg-white text-black rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-indigo-400 hover:text-heading transition-all active:scale-95"
                               >
                                  Purge Neural Cache
                               </button>
                            </div>
                         </div>
                      </div>
                   </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  <EduCard 
                    title="Privacy Protection" 
                    description="Our browser automatically neutralizes ads, trackers, and malicious scripts, ensuring your decentralized journey remains private and invisible to data harvesters."
                    icon={<ShieldCheck size={24} className="text-red-400" />}
                    tag="Active Defense"
                    url="sec-privacy"
                    onLearnMore={(id) => {
                      updateActiveTab({ type: 'builtin-content', contentId: id, name: 'Privacy Protocol' });
                      claimReward('web_search', 2);
                    }}
                  />
                  <EduCard 
                    title="Wallet Security" 
                    description="Safely manage connections with MetaMask or WalletConnect. View balances and networks while maintaining 100% sovereignty over your private keys."
                    icon={<Lock size={24} className="text-blue-400" />}
                    tag="Key Protection"
                    url="sec-wallet"
                    onLearnMore={(id) => {
                      updateActiveTab({ type: 'builtin-content', contentId: id, name: 'Wallet Security' });
                      claimReward('web_search', 2);
                    }}
                  />
                  <EduCard 
                    title="dApp Safety Check" 
                    description="Every protocol is scanned for known vulnerabilities. Our system provides instant status indicators: Verified, Unknown, or Warning."
                    icon={<Activity size={24} className="text-emerald-400" />}
                    tag="Verification"
                    url="sec-dapps"
                    onLearnMore={(id) => {
                      updateActiveTab({ type: 'builtin-content', contentId: id, name: 'dApp Verification' });
                      claimReward('web_search', 2);
                    }}
                  />
                  <EduCard 
                    title="Smart Contract Alerts" 
                    description="Receive instant alerts when a dApp requests wallet or token permissions. Always review the scope of access before approving any transaction."
                    icon={<AlertTriangle size={24} className="text-yellow-400" />}
                    tag="Guardianship"
                    url="sec-sc"
                    onLearnMore={(id) => {
                      updateActiveTab({ type: 'builtin-content', contentId: id, name: 'Smart Contract Alerts' });
                      claimReward('web_search', 2);
                    }}
                  />
                  <div className="glass-card rounded-[3rem] p-8 border-glass-border space-y-6 bg-red-500/5 col-span-1 md:col-span-2">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-2xl bg-red-500/20 flex items-center justify-center">
                        <CheckCircle size={24} className="text-red-400" />
                      </div>
                      <h3 className="text-3xl font-black tracking-tight uppercase">Web3 Safety Tips</h3>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                       <ul className="space-y-4 text-base font-bold text-body/50">
                         <li className="flex items-start gap-3"><div className="w-2 h-2 rounded-full bg-red-500 mt-2 shrink-0 shadow-glow" />Never share your seed phrase or private keys.</li>
                         <li className="flex items-start gap-3"><div className="w-2 h-2 rounded-full bg-red-500 mt-2 shrink-0 shadow-glow" />Verify website URLs before connecting your wallet.</li>
                       </ul>
                       <ul className="space-y-4 text-base font-bold text-body/50">
                         <li className="flex items-start gap-3"><div className="w-2 h-2 rounded-full bg-red-500 mt-2 shrink-0 shadow-glow" />Avoid suspicious or unknown decentralized apps.</li>
                         <li className="flex items-start gap-3"><div className="w-2 h-2 rounded-full bg-red-500 mt-2 shrink-0 shadow-glow" />Review smart contract permissions carefully.</li>
                       </ul>
                    </div>
                  </div>
                </div>
              </div>
            </section>
            </div>
          ) : tab.type === 'settings' ? (
            <div className="flex-1 min-h-0 overflow-y-auto standard-scrollbar">
            <section className="animate-in fade-in duration-700 max-w-6xl mx-auto pb-20">

              {/* Hero Banner */}
              <div className="relative rounded-[3rem] overflow-hidden mb-8 h-52 hero-gradient-bg">
                <div className="absolute inset-0 opacity-30" style={{backgroundImage: 'radial-gradient(circle at 20% 50%, #6366f1 0%, transparent 50%), radial-gradient(circle at 80% 20%, #a855f7 0%, transparent 50%), radial-gradient(circle at 60% 80%, #06b6d4 0%, transparent 40%)'}} />
                <div className="absolute inset-0" style={{backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 39px, rgba(255,255,255,0.03) 39px, rgba(255,255,255,0.03) 40px), repeating-linear-gradient(90deg, transparent, transparent 39px, rgba(255,255,255,0.03) 39px, rgba(255,255,255,0.03) 40px)'}} />
                <div className="absolute bottom-6 left-8">
                  <div className="text-[10px] font-black uppercase tracking-[0.4em] text-primary/60 mb-1">Web3 Identity Matrix</div>
                  <h1 className="text-4xl font-black tracking-tighter text-heading uppercase">{userProfile.name}</h1>
                  <p className="text-sm text-primary/70 font-bold tracking-widest uppercase mt-1">{userProfile.bio}</p>
                </div>
                {/* Avatar floating on banner - clickable upload */}
                <div className="absolute bottom-[-30px] right-10">
                  <div className="relative group cursor-pointer" onClick={() => document.getElementById('avatar-upload').click()}>
                    <input
                      id="avatar-upload"
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files[0];
                        if (!file) return;
                        const reader = new FileReader();
                        reader.onload = (ev) => setUserProfile({...userProfile, avatar: ev.target.result});
                        reader.readAsDataURL(file);
                      }}
                    />
                    <div className="absolute inset-0 rounded-[2rem] blur-xl bg-indigo-500/50 scale-110" />
                    <div className="relative w-24 h-24 rounded-[2rem] border-4 border-[#0f172a] shadow-2xl overflow-hidden" style={{background: 'linear-gradient(135deg, #6366f1, #a855f7)'}}>
                      {userProfile.avatar ? (
                        <img src={userProfile.avatar} alt="Avatar" className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <User size={38} className="text-heading" />
                        </div>
                      )}
                      {/* Hover overlay with camera icon */}
                      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex flex-col items-center justify-center gap-1">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z"/><circle cx="12" cy="13" r="3"/></svg>
                        <span className="text-heading text-[8px] font-black uppercase tracking-widest">Upload</span>
                      </div>
                    </div>
                    <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-emerald-400 border-2 border-[#0f172a] shadow-lg" />
                  </div>
                </div>
              </div>

              {/* Stats Row */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8 mt-10">
                {[
                  { label: 'Points', value: points.toLocaleString(), icon: <Trophy size={16} className="text-amber-400" />, color: 'from-amber-500/20 to-amber-600/5', border: 'border-amber-500/20' },
                  { label: 'HELA Balance', value: helaBalance, icon: <Zap size={16} className="text-primary" />, color: 'from-indigo-500/20 to-indigo-600/5', border: 'border-indigo-500/20' },
                  { label: 'Accounts', value: accounts.length, icon: <UserPlus size={16} className="text-primary" />, color: 'from-purple-500/20 to-purple-600/5', border: 'border-purple-500/20' },
                  { label: 'Status', value: 'ELITE', icon: <ShieldCheck size={16} className="text-emerald-400" />, color: 'from-emerald-500/20 to-emerald-600/5', border: 'border-emerald-500/20' },
                ].map((stat, i) => (
                  <div key={i} className={`glass-card rounded-[2rem] p-6 bg-gradient-to-br ${stat.color} border ${stat.border} hover:scale-[1.02] transition-all duration-300`}>
                    <div className="flex items-center gap-2 mb-3">{stat.icon}<span className="text-[10px] font-black uppercase tracking-widest text-body/40">{stat.label}</span></div>
                    <div className="text-2xl font-black tracking-tight text-heading">{stat.value}</div>
                  </div>
                ))}
              </div>

              {/* Achievement Badges */}
              <div className="glass-card rounded-[2.5rem] p-8 mb-8 border-glass-border">
                <h3 className="text-xs font-black uppercase tracking-[0.3em] text-body/40 mb-5 flex items-center gap-2"><Trophy size={12} /> Achievements</h3>
                <div className="flex flex-wrap gap-3">
                  {[
                    { label: 'Web3 Pioneer', icon: '🚀', color: 'from-indigo-500/30 to-purple-500/20', border: 'border-primary' },
                    { label: 'DeFi Explorer', icon: '🌊', color: 'from-emerald-500/20 to-teal-500/10', border: 'border-emerald-500/25' },
                    { label: 'Hela Holder', icon: '⚡', color: 'from-amber-500/20 to-orange-500/10', border: 'border-amber-500/25' },
                    { label: 'NFT Collector', icon: '🎨', color: 'from-pink-500/20 to-rose-500/10', border: 'border-pink-500/25' },
                    { label: 'Block Master', icon: '🧱', color: 'from-blue-500/20 to-cyan-500/10', border: 'border-blue-500/25' },
                    { label: 'Game Winner', icon: '🎮', color: 'from-violet-500/20 to-fuchsia-500/10', border: 'border-violet-500/25' },
                  ].map((badge, i) => (
                    <div key={i} className={`flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r ${badge.color} border ${badge.border} hover:scale-105 transition-transform cursor-default`}>
                      <span className="text-sm">{badge.icon}</span>
                      <span className="text-[10px] font-black uppercase tracking-widest text-body/70">{badge.label}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

                {/* Left: Edit Profile + Danger Zone */}
                <div className="space-y-6">
                  {/* Edit Profile Card */}
                  <div className="glass-card rounded-[2.5rem] p-7 border-glass-border">
                    <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-body/40 mb-5 flex items-center gap-2"><Edit3 size={12} /> Identity</h3>
                    {isEditingProfile ? (
                      <div className="space-y-4 animate-in fade-in duration-200">
                        <div>
                          <label className="text-[10px] font-black uppercase tracking-widest text-body/30 mb-2 block">Name</label>
                          <input type="text" value={userProfile.name} onChange={(e) => setUserProfile({...userProfile, name: e.target.value})} className="w-full bg-card-alpha border border-glass-border0 rounded-xl px-4 py-3 font-bold text-sm text-heading focus:outline-none focus:ring-2 focus:ring-indigo-500/40" />
                        </div>
                        <div>
                          <label className="text-[10px] font-black uppercase tracking-widest text-body/30 mb-2 block">Bio</label>
                          <input type="text" value={userProfile.bio} onChange={(e) => setUserProfile({...userProfile, bio: e.target.value})} className="w-full bg-card-alpha border border-glass-border0 rounded-xl px-4 py-3 font-bold text-sm text-heading focus:outline-none focus:ring-2 focus:ring-indigo-500/40" />
                        </div>
                        <div>
                          <label className="text-[10px] font-black uppercase tracking-widest text-body/30 mb-2 block">Avatar URL</label>
                          <input type="text" value={userProfile.avatar} onChange={(e) => setUserProfile({...userProfile, avatar: e.target.value})} placeholder="https://..." className="w-full bg-card-alpha border border-glass-border0 rounded-xl px-4 py-3 text-sm text-heading focus:outline-none focus:ring-2 focus:ring-indigo-500/40" />
                        </div>
                        <div className="flex gap-3 pt-1">
                          <button onClick={() => setIsEditingProfile(false)} className="flex-1 py-3 glass rounded-xl text-xs font-black uppercase tracking-widest border border-glass-border0 hover:bg-card-alpha0 transition-all">Cancel</button>
                          <button onClick={() => setIsEditingProfile(false)} className="flex-1 py-3 button-primary rounded-xl text-xs font-black uppercase tracking-widest text-heading transition-all active:scale-95 shadow-lg shadow-indigo-600/30">Save</button>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <div className="flex flex-col gap-2">
                          <div className="text-[10px] font-black uppercase tracking-widest text-body/25">Name</div>
                          <div className="text-sm font-black uppercase tracking-tight text-heading">{userProfile.name}</div>
                        </div>
                        <div className="flex flex-col gap-2">
                          <div className="text-[10px] font-black uppercase tracking-widest text-body/25">Bio</div>
                          <div className="text-sm font-bold text-primary">{userProfile.bio}</div>
                        </div>
                        <button onClick={() => setIsEditingProfile(true)} className="w-full py-3 glass rounded-xl text-xs font-black uppercase tracking-[0.2em] hover:bg-card-alpha0 transition-all border border-glass-border flex items-center justify-center gap-2">
                          <Edit3 size={12} /> Edit Profile
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Danger Zone */}
                  <div className="glass-card rounded-[2.5rem] p-7 border-red-500/5 hover:border-red-500/15 transition-all">
                    <h4 className="text-xs font-black uppercase tracking-[0.3em] text-red-400 mb-5 flex items-center gap-2"><Shield size={12} /> Danger Zone</h4>
                    <button onClick={() => { if(window.ethereum) window.ethereum.removeAllListeners(); localStorage.removeItem('web3_walletAddress'); setWalletAddress(''); setIsWalletGateOpen(true); updateActiveTab({ type: '' }); updateActiveTab({ dapp: null }); }}
                      className="w-full py-3 mb-3 text-xs font-black uppercase tracking-[0.2em] text-body/40 hover:text-amber-400 hover:bg-amber-400/10 rounded-xl border border-glass-border hover:border-amber-400/20 transition-all flex items-center justify-center gap-2">
                      <LogOut size={12} /> Disconnect
                    </button>
                    <button onClick={() => setShowDeleteConfirm(true)}
                      className="w-full py-3 text-xs font-black uppercase tracking-[0.2em] text-body/25 hover:text-red-400 hover:bg-red-400/10 rounded-xl border border-glass-border hover:border-red-400/15 transition-all">
                      Wipe Cache
                    </button>
                  </div>
                </div>

                {/* Right: Active Accounts + Wallet Card */}
                <div className="md:col-span-2 space-y-6">
                  <div className="glass-card rounded-[2.5rem] p-8 border-glass-border">
                    <div className="flex items-center justify-between mb-6">
                      <h3 className="text-sm font-black uppercase tracking-tight">Active Accounts</h3>
                      <button onClick={async () => { try { const provider = new ethers.BrowserProvider(window.ethereum); const signer = await provider.getSigner(); const addr = await signer.getAddress(); if(accounts.find(a => a.address === addr)) return alert('Identity already synchronized.'); setAccounts([...accounts, { id: Date.now(), name: 'Sub-Core ' + (accounts.length + 1), address: addr, active: false }]); } catch(e) { alert('MetaMask auth failed.'); } }}
                        className="flex items-center gap-2 text-primary font-black uppercase text-[10px] tracking-widest hover:text-heading transition-colors">
                        <UserPlus size={14} /> Sync New
                      </button>
                    </div>
                    <div className="space-y-3">
                      {accounts.map((acc) => (
                        <div key={acc.id} className={`flex items-center justify-between p-5 rounded-[1.5rem] border transition-all ${acc.active ? 'bg-primary/10 border-primary' : 'bg-white/3 border-glass-border hover:border-glass-border0'}`}>
                          <div className="flex items-center gap-3">
                            <div className={`w-2.5 h-2.5 rounded-full shrink-0 ${acc.active ? 'bg-indigo-400 shadow-glow animate-pulse' : 'bg-card-alpha5'}`} />
                            <div>
                              <div className="font-black uppercase tracking-tight text-sm text-heading">{acc.name}</div>
                              <div className="text-[10px] font-bold text-body/20 uppercase tracking-widest">UID: {acc.id.toString().slice(-4)}</div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            {!acc.active && (
                              <button onClick={() => { setAccounts(accounts.map(a => ({...a, active: a.id === acc.id}))); setWalletAddress(acc.address); setIsWalletGateOpen(false); }} className="px-3 py-1.5 glass rounded-lg text-[10px] font-black uppercase tracking-widest hover:bg-card-alpha0 transition-all border-glass-border0">Switch</button>
                            )}
                            {acc.active && <span className="px-3 py-1.5 text-[10px] font-black uppercase text-primary tracking-widest">Active</span>}
                            <button onClick={() => { if(accounts.length > 1) setAccounts(accounts.filter(a => a.id !== acc.id)); else alert('Need at least one account.'); }} className="w-8 h-8 flex items-center justify-center text-body/15 hover:text-red-400 transition-colors rounded-lg hover:bg-red-400/10">
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Wallet Identity Card */}
                  <div className="relative rounded-[2.5rem] p-8 overflow-hidden hero-gradient-dark-purple" >
                    <div className="absolute inset-0 opacity-20" style={{backgroundImage: 'radial-gradient(circle at 75% 25%, #818cf8 0%, transparent 50%)'}} />
                    <div className="relative z-10">
                      <div className="flex items-center justify-between mb-8">
                        <div className="text-[10px] font-black uppercase tracking-[0.4em] text-primary/60">Wallet Identity</div>
                        <div className="flex gap-1">{[1,2,3].map(i => <div key={i} className="w-6 h-4 rounded-sm bg-card-alpha0" />)}</div>
                      </div>
                      <div className="font-mono text-sm text-primary tracking-widest mb-1">
                        {walletAddress ? `${walletAddress.slice(0,8)}...${walletAddress.slice(-6)}` : 'NOT CONNECTED'}
                      </div>
                      <div className="font-black text-xl text-heading tracking-tight">{userProfile.name}</div>
                      <div className="flex items-center justify-between mt-8">
                        <div>
                          <div className="text-[9px] font-black uppercase tracking-widest text-primary/50 mb-0.5">Points</div>
                          <div className="font-black text-heading">{points.toLocaleString()}</div>
                        </div>
                        <div>
                          <div className="text-[9px] font-black uppercase tracking-widest text-primary/50 mb-0.5">HELA</div>
                          <div className="font-black text-heading">{helaBalance}</div>
                        </div>
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg">
                          <Zap size={18} className="text-heading" />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Matrix Status */}
                  <div className="glass-card rounded-[2.5rem] p-6 bg-gradient-to-br from-emerald-600/10 to-transparent border-emerald-500/10 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 glass rounded-2xl flex items-center justify-center text-emerald-400"><Layers size={24} /></div>
                      <div>
                        <div className="font-black uppercase tracking-tight text-sm">Matrix Status: Elite</div>
                        <div className="text-[10px] text-body/30 font-bold uppercase tracking-widest">All neural connections established</div>
                      </div>
                    </div>
                    <span className="text-[10px] font-black uppercase text-emerald-400 tracking-widest bg-emerald-400/10 px-3 py-1.5 rounded-full border border-emerald-400/20">LIVE</span>
                  </div>
                </div>
              </div>
            </section>
            </div>
          ) : (
            <div className="flex-1 min-h-0 overflow-y-auto standard-scrollbar flex flex-col items-center justify-center">
            <div className="flex flex-col items-center justify-center py-40 animate-in zoom-in duration-1000">
                <div className="w-32 h-32 bg-card-alpha rounded-[2.5rem] flex items-center justify-center mb-10 border border-glass-border0 shadow-2xl animate-float">
                    <Globe size={64} className="text-body/10" />
                </div>
                <h3 className="text-5xl font-black mb-4 tracking-tighter uppercase italic opacity-20">Protocol Offline</h3>
                <p className="font-bold text-body/10 tracking-[0.4em] uppercase text-sm">Awaiting Network Sync</p>
            </div>
            </div>
            )}
            </div>
          ))}
        </div>
      </main>

      {/* Wallet Modal */}
                        {showWalletModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-xl px-4">
          <div className="w-full max-w-md bg-panel border border-glass-border0 rounded-3xl p-6 shadow-2xl">

            {/* Header */}
            <div className="flex justify-between items-center mb-6">
              <div>
                <h2 className="text-xl font-black uppercase tracking-tight text-heading">Built-in <span className="text-primary">Wallet</span></h2>
                <p className="text-[10px] text-body/30 uppercase tracking-widest mt-0.5">Hela Official Runtime Â· Chain 666888</p>
              </div>
              <button onClick={() => setShowWalletModal(false)} className="w-9 h-9 flex items-center justify-center rounded-full bg-card-alpha hover:bg-card-alpha0 text-body/50 transition-all">
                <X size={16} />
              </button>
            </div>

            {/* Tabs */}
            <div className="flex gap-1 bg-card-alpha p-1 rounded-2xl mb-6">
              {['assets', 'profiles', 'send', 'receive'].map(tab => (
                <button
                  key={tab}
                  onClick={() => setActiveWalletTab(tab)}
                  className={`flex-1 py-2.5 rounded-xl text-[11px] font-black uppercase tracking-widest transition-all ${activeWalletTab === tab ? 'bg-indigo-600 text-heading shadow-lg shadow-indigo-600/30' : 'text-body/40 hover:text-body/70'}`}
                >
                  {tab}
                </button>
              ))}
            </div>

            {/* ASSETS TAB */}
            {activeWalletTab === 'assets' && (
              <div className="flex flex-col items-center py-4">
                {!isCorrectNetwork && (
                  <div className="w-full mb-5 p-4 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-center gap-3 text-red-400">
                    <AlertTriangle size={18} className="shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-[10px] font-black uppercase tracking-wider">Wrong Network</p>
                      <p className="text-[10px] text-red-400/60">Switch to Hela Testnet (666888)</p>
                    </div>
                    <button onClick={checkNetwork} className="px-3 py-1.5 bg-red-500/20 hover:bg-red-500/30 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all whitespace-nowrap">Switch</button>
                  </div>
                )}

                <div className="w-20 h-20 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center mb-5 shadow-xl relative">
                  <CreditCard size={36} className="text-heading" />
                  <div className={`absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full border-4 border-[#0d1117] ${isCorrectNetwork ? 'bg-emerald-400' : 'bg-red-500'}`} />
                </div>

                <div className="text-center mb-6">
                  <p className="text-[10px] text-body/30 uppercase tracking-widest mb-2 flex items-center justify-center gap-2">
                    Balance
                    <button
                      onClick={async () => {
                        const ok = await checkNetworkStatus();
                        setIsCorrectNetwork(ok);
                        if (ok) fetchHLUSDBalance(walletAddress);
                        setLastRefresh(Date.now());
                      }}
                      className="w-6 h-6 flex items-center justify-center rounded-lg hover:bg-card-alpha0 text-primary hover:text-heading transition-all"
                      title="Refresh"
                    >
                      <RefreshCw size={11} />
                    </button>
                  </p>
                  <p className="text-5xl font-black text-heading tracking-tighter tabular-nums">
                    {isCorrectNetwork ? parseFloat(hlusdBalance).toFixed(4) : '0.0000'}
                  </p>
                  <p className="text-primary font-bold tracking-widest text-sm mt-1">HLUSD</p>
                </div>

                <div className="w-full bg-card-alpha rounded-2xl p-4 text-center space-y-1">
                  <p className="text-[10px] text-body/20 uppercase tracking-widest">Connected Address</p>
                  <p className="font-mono text-xs text-body/50 truncate">{walletAddress}</p>
                  <p className="text-[9px] text-body/10 uppercase">Last sync: {new Date(lastRefresh).toLocaleTimeString()}</p>
                </div>
              </div>
            )}

            {/* PROFILES TAB */}
            {activeWalletTab === 'profiles' && (
              <div className="flex flex-col gap-4 py-2">
                <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                  {accounts.map((acc) => (
                    <div 
                      key={acc.id}
                      onClick={() => {
                        setActiveProfileId(acc.id);
                        setActiveProfileName(acc.name);
                        // Force refresh balance for the new active profile
                        refreshBalance();
                      }}
                      className={`group p-4 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
                        activeProfileId === acc.id 
                          ? 'bg-primary/10 border-indigo-500/50 text-heading' 
                          : 'bg-card-alpha border-glass-border text-body/40 hover:bg-card-alpha0 hover:border-glass-border0'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${activeProfileId === acc.id ? 'bg-indigo-600 text-heading shadow-lg' : 'bg-card-alpha text-body/20'}`}>
                          <User size={20} />
                        </div>
                        <div>
                          <div className="text-sm font-black uppercase tracking-tight">{acc.name}</div>
                          <div className="text-[10px] font-bold opacity-40 uppercase tracking-widest">Profile ID: {acc.id}</div>
                        </div>
                      </div>
                      {activeProfileId === acc.id && (
                        <div className="w-2 h-2 rounded-full bg-indigo-400 shadow-[0_0_10px_rgba(129,140,248,0.8)]" />
                      )}
                    </div>
                  ))}
                </div>

                <div className="pt-4 border-t border-glass-border mt-2">
                  <button 
                    onClick={async () => {
                      const name = prompt('Enter Profile Name:', `Profile ${accounts.length + 1}`);
                      if (name && name.trim()) {
                        const newId = Math.max(0, ...accounts.map(a => a.id)) + 1;
                        const newAcc = { id: newId, name: name.trim(), address: walletAddress, active: false };
                        setAccounts(prev => [...prev, newAcc]);
                        
                        // Register new profile with backend
                        if (walletAddress) {
                          try {
                            await fetch(`${API_URL}/users/register`, {
                              method: 'POST',
                              headers: { 'Content-Type': 'application/json' },
                              body: JSON.stringify({ 
                                wallet_address: walletAddress,
                                profile_id: newId,
                                profile_name: name.trim()
                              })
                            });
                          } catch (e) {
                            console.error('Failed to register new profile', e);
                          }
                        }
                        
                        setActiveProfileId(newId);
                        setActiveProfileName(name.trim());
                        alert(`New Profile "${name.trim()}" activated.`);
                      }
                    }}
                    className="w-full py-4 bg-card-alpha hover:bg-card-alpha0 border border-glass-border0 rounded-2xl flex items-center justify-center gap-3 text-xs font-black uppercase tracking-widest transition-all active:scale-95 text-primary"
                  >
                    <Plus size={18} />
                    Create New Profile
                  </button>
                </div>
              </div>
            )}

            {/* SEND TAB */}
            {activeWalletTab === 'send' && (
              <div className="flex flex-col gap-5">
                <div>
                  <label className="block text-[10px] text-body/30 uppercase tracking-widest mb-2 font-bold">Recipient Address</label>
                  <input
                    type="text"
                    value={sendRecipient}
                    onChange={(e) => setSendRecipient(e.target.value)}
                    placeholder="0x..."
                    className="w-full bg-card-alpha border border-glass-border0 rounded-2xl px-4 py-3.5 text-sm font-mono text-heading placeholder-white/20 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-transparent transition-all"
                  />
                </div>

                <div>
                  <div className="flex justify-between items-center mb-2">
                    <label className="text-[10px] text-body/30 uppercase tracking-widest font-bold">Amount (HLUSD)</label>
                    <button
                      onClick={() => setSendAmount(hlusdBalance)}
                      className="text-[10px] text-primary hover:text-heading font-black uppercase tracking-widest transition-colors"
                    >
                      MAX: {parseFloat(hlusdBalance).toFixed(4)}
                    </button>
                  </div>
                  <div className="relative">
                    <input
                      type="number"
                      value={sendAmount}
                      onChange={(e) => setSendAmount(e.target.value)}
                      placeholder="0.00"
                      className="w-full bg-card-alpha border border-glass-border0 rounded-2xl px-4 py-3.5 text-2xl font-black text-heading placeholder-white/20 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-transparent transition-all tabular-nums pr-24"
                    />
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm font-black text-primary">HLUSD</span>
                  </div>
                </div>

                <button
                  onClick={async () => {
                    if (!sendRecipient || !sendAmount) return alert('Please enter recipient address and amount.');
                    if (!isValidAddress(sendRecipient)) return alert('Invalid Ethereum address format.');
                    if (parseFloat(sendAmount) > parseFloat(hlusdBalance)) return alert('Insufficient HLUSD balance.');
                    setIsTxPending(true);
                    try {
                      const tx = await sendHLUSD(sendRecipient, sendAmount);
                      alert('Transaction sent! Hash: ' + tx.hash);
                      const receipt = await tx.wait();
                      alert('Transaction confirmed in block ' + receipt.blockNumber);
                      setSendAmount('');
                      setSendRecipient('');
                      await fetchHLUSDBalance(walletAddress);
                    } catch (e) {
                      alert('Transaction failed: ' + (e.message || 'User rejected'));
                      console.error(e);
                    } finally {
                      setIsTxPending(false);
                    }
                  }}
                  disabled={isTxPending || !sendRecipient || !sendAmount || !isCorrectNetwork}
                  className="w-full py-4 button-primary disabled:opacity-40 disabled:cursor-not-allowed text-heading rounded-2xl font-black uppercase tracking-widest transition-all active:scale-95 flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/20"
                >
                  {isTxPending ? (
                    <>
                      <div className="w-4 h-4 border-2 border-glass-border0 border-t-white rounded-full animate-spin" />
                      <span>Processing...</span>
                    </>
                  ) : (
                    <>
                      <ArrowUpRight size={18} />
                      <span>{isCorrectNetwork ? 'Send HLUSD' : 'Switch Network First'}</span>
                    </>
                  )}
                </button>
                <p className="text-center text-[9px] text-body/15 uppercase tracking-widest">Signing requires MetaMask approval</p>
              </div>
            )}

            {/* RECEIVE TAB */}
            {activeWalletTab === 'receive' && (
              <div className="flex flex-col items-center gap-5">
                <div className="bg-white p-4 rounded-2xl shadow-xl">
                  <img
                    src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${walletAddress}&margin=10`}
                    alt="Wallet QR Code"
                    className="w-44 h-44 object-contain"
                    onError={(e) => { e.target.style.display='none'; }}
                  />
                </div>

                <div className="w-full">
                  <p className="text-[10px] text-primary uppercase tracking-widest font-black text-center mb-3">Your Receive Address</p>
                  <div className="flex items-center gap-2 bg-card-alpha border border-glass-border0 rounded-2xl p-4">
                    <p className="flex-1 font-mono text-xs text-body/50 break-all leading-relaxed">{walletAddress}</p>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(walletAddress);
                        alert('Address copied!');
                      }}
                      className="shrink-0 w-10 h-10 flex items-center justify-center rounded-xl bg-card-alpha hover:bg-indigo-500/20 text-body/30 hover:text-primary transition-all active:scale-90"
                    >
                      <Copy size={16} />
                    </button>
                  </div>
                </div>

                <p className="text-[9px] text-body/15 uppercase tracking-widest text-center font-bold leading-relaxed">Only send HLUSD on Hela Testnet to this address</p>
              </div>
            )}

          </div>
        </div>
      )}

      {/* Redeem Modal */}
      {showRedeemModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-base/95 backdrop-blur-3xl animate-in zoom-in duration-300 px-6">
          <div className="glass-card max-w-md w-full p-8 rounded-[3rem] border-glass-border0 relative overflow-hidden bg-gradient-to-br from-indigo-900/10 to-transparent shadow-[0_0_100px_rgba(0,209,255,0.1)]">
            <h2 className="text-3xl font-black uppercase tracking-tighter italic mb-2">REDEEM <span className="text-[#00d1ff]">HELA</span></h2>
            <p className="text-body/40 text-sm font-bold mb-8">Select the amount of points you wish to convert. 1000 PTS = 1 HELA.</p>
            
            <div className="glass rounded-[2rem] p-6 border-glass-border mb-8 text-center space-y-4 relative">
               <div className="text-[10px] font-black uppercase tracking-widest text-primary">Conversion Preview</div>
               <div className="flex items-center justify-center gap-6">
                 <div>
                    <div className="text-2xl font-black text-heading px-4 py-2 bg-black/40 rounded-xl tabular-nums drop-shadow-md">{redeemAmount.toLocaleString()}</div>
                    <div className="text-[10px] font-bold text-body/30 uppercase mt-2">PTS Deducted</div>
                 </div>
                 <ChevronRight size={24} className="text-body/20" />
                 <div>
                    <div className="text-2xl font-black text-[#00d1ff] px-4 py-2 bg-[#00d1ff]/10 rounded-xl tabular-nums drop-shadow-md">+{(redeemAmount/1000).toFixed(2)}</div>
                    <div className="text-[10px] font-bold text-[#00d1ff]/50 uppercase mt-2">HELA Yield</div>
                 </div>
               </div>
            </div>

            <div className="space-y-6 mb-10">
               <div className="flex justify-between text-xs font-black uppercase text-body/40">
                 <span>1,000</span>
                 <span>Max: {(Math.floor(points/1000)*1000).toLocaleString()}</span>
               </div>
               <input 
                 type="range" 
                 min="1000" 
                 max={Math.floor(points/1000)*1000 || 1000} 
                 step="1000" 
                 value={redeemAmount} 
                 onChange={(e) => setRedeemAmount(Number(e.target.value))}
                 className="w-full h-2 bg-card-alpha0 rounded-full appearance-none cursor-pointer accent-[#00d1ff]"
               />
            </div>

            <div className="flex gap-4">
              <button 
                onClick={() => setShowRedeemModal(false)}
                className="flex-1 py-4 glass rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-card-alpha0 transition-all text-body/50 border-glass-border active:scale-95"
              >
                Cancel
              </button>
              <button 
                onClick={executeRedeem}
                className="flex-1 py-4 bg-[#00d1ff] hover:bg-[#00b8e6] text-black rounded-2xl text-xs font-black uppercase tracking-widest transition-all shadow-[0_0_20px_rgba(0,209,255,0.3)] hover:shadow-[0_0_30px_rgba(0,209,255,0.5)] active:scale-95"
              >
                Confirm Sync
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Quest Modal */}
      {showQuestModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-base/95 backdrop-blur-3xl animate-in zoom-in duration-300 px-6">
          <div className="glass-card max-w-lg w-full p-8 rounded-[3rem] border-purple-500/20 relative overflow-hidden bg-gradient-to-br from-purple-900/10 to-transparent">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h2 className="text-3xl font-black uppercase tracking-tighter italic mb-1 text-primary">WTF <span className="text-heading">QUESTS</span></h2>
                <p className="text-body/40 text-sm font-bold">Complete neural sync tasks for points.</p>
              </div>
              <button onClick={() => setShowQuestModal(false)} className="w-10 h-10 flex items-center justify-center glass rounded-full hover:bg-card-alpha0 transition-all active:scale-95 text-body/50"><X size={18} /></button>
            </div>
            
            <div className="space-y-4">
               {/* Scholar Quest */}
               {!completedQuests.includes('scholar') && (
                 <div className="glass rounded-[2rem] p-5 border-glass-border flex items-center justify-between group hover:border-purple-500/30 transition-all">
                    <div className="flex items-center gap-4">
                       <div className="w-12 h-12 rounded-2xl bg-purple-500/10 flex items-center justify-center text-primary"><Layers size={20} /></div>
                       <div>
                         <div className="font-black uppercase tracking-tight text-sm text-heading">The Scholar</div>
                         <div className="text-[10px] font-bold text-body/40 uppercase tracking-widest">Read an Education Article for 10s</div>
                       </div>
                    </div>
                    {activeQuests.includes('scholar') ? (
                       <div className="text-xs font-black text-primary bg-purple-500/10 px-4 py-2 rounded-xl animate-pulse flex items-center gap-2 tracking-widest"><Play size={10} /> {articleTimer}s / 10s</div>
                    ) : (
                       <button onClick={async () => {
                           setActiveQuests(prev => [...prev.filter(q => q !== 'scholar'), 'scholar']);
                           setShowQuestModal(false);
                           // Navigate to Education Hub instead of a specific iframe to ensure visibility
                           updateActiveTab({ type: 'education', dapp: null });
                           await claimReward('wtf_quest_action', 5); // Start reward
                        }} className="px-5 py-2.5 bg-card-alpha hover:bg-purple-500/20 text-xs font-black uppercase tracking-widest text-heading rounded-xl transition-all border border-glass-border0">Start +5</button>
                    )}
                 </div>
               )}
 
               {/* Explorer Quest */}
               {!completedQuests.includes('explorer') && (
                 <div className="glass rounded-[2rem] p-5 border-glass-border flex items-center justify-between group hover:border-primary transition-all">
                    <div className="flex items-center gap-4">
                       <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary"><Globe size={20} /></div>
                       <div>
                         <div className="font-black uppercase tracking-tight text-sm text-heading">The Explorer</div>
                         <div className="text-[10px] font-bold text-body/40 uppercase tracking-widest">Launch any Ecosystem dApp</div>
                       </div>
                    </div>
                    <button onClick={async () => { 
                        const success = await claimReward('wtf_quest_action', 5); 
                        if (success) {
                          alert('Explorer Quest: +5 points!'); 
                          setShowQuestModal(false); 
                          updateActiveTab({ type: 'dapps' }); 
                        }
                     }} className="px-5 py-2.5 bg-card-alpha hover:bg-indigo-500/20 text-xs font-black uppercase tracking-widest text-heading rounded-xl transition-all border border-glass-border0">Quick +5</button>
                 </div>
               )}
 
               {/* Gamer Quest */}
               {!completedQuests.includes('gamer') && (
                 <div className="glass rounded-[2rem] p-5 border-glass-border flex items-center justify-between group hover:border-red-500/30 transition-all">
                    <div className="flex items-center gap-4">
                       <div className="w-12 h-12 rounded-2xl bg-red-500/10 flex items-center justify-center text-red-400"><Activity size={20} /></div>
                       <div>
                         <div className="font-black uppercase tracking-tight text-sm text-heading">The Gamer</div>
                         <div className="text-[10px] font-bold text-body/40 uppercase tracking-widest">Play a WTF Zone Game</div>
                       </div>
                    </div>
                    <button onClick={async () => { 
                        const success = await claimReward('wtf_quest_action', 5); 
                        if (success) {
                           alert('Gamer Quest: +5 points!'); 
                           setShowQuestModal(false); 
                           updateActiveTab({ type: 'wtf-zone' }); 
                        }
                     }} className="px-5 py-2.5 bg-card-alpha hover:bg-red-500/20 text-xs font-black uppercase tracking-widest text-heading rounded-xl transition-all border border-glass-border0">Play +5</button>
                 </div>
               )}
             </div>
             
             {!completedQuests.includes('daily') && (
               <button onClick={async () => {
                    if (!walletAddress) return alert('Connect wallet first');
                    setIsQuesting(true);
                    const success = await claimReward('wtf_quest');
                    setIsQuesting(false);
                    if (success) {
                      setShowQuestModal(false);
                      alert('Daily Main Quest Sync Complete: +50 Points!');
                    }
                  }}
                  disabled={isQuesting} className="w-full mt-6 py-4 button-primary text-heading rounded-2xl text-xs font-black uppercase tracking-widest transition-all active:scale-95 shadow-lg shadow-purple-600/20 flex items-center justify-center gap-2 border border-glass-border0">
                    {isQuesting ? <div className="w-4 h-4 border-2 border-glass-border0 border-t-white rounded-full animate-spin"></div> : 'Complete Daily Check-in (+50)'}
               </button>
             )}
          </div>
        </div>
      )}

      {/* Share Modal */}
      {showShareModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-base/95 backdrop-blur-3xl animate-in zoom-in duration-300 px-6">
          <div className="glass-card max-w-sm w-full p-8 rounded-[3rem] border-indigo-500/20 relative overflow-hidden bg-gradient-to-br from-indigo-900/10 to-transparent text-center">
            <div className="w-16 h-16 bg-indigo-500/20 rounded-2xl flex items-center justify-center mx-auto mb-6 text-primary"><Users size={32} /></div>
            <h2 className="text-2xl font-black uppercase tracking-tighter italic mb-2">SHARE <span className="text-primary">NODE</span></h2>
            <p className="text-body/40 text-[10px] font-bold uppercase tracking-widest mb-8">Broadcast your identity to expand the matrix and earn 50 PTS.</p>
            
            <div className="space-y-3 mb-6">
               <button onClick={async () => { 
                  window.open('https://api.whatsapp.com/send?text=Check%20out%20this%20Web3%20Browser!%20https%3A%2F%2Fweb3browser-sooty.vercel.app%2F', '_blank'); 
                  const success = await claimReward('node_referral'); 
                  if (success) {
                    alert('Broadcast successful: +50 Points!');
                    setShowShareModal(false); 
                  }
               }} className="w-full py-4 glass rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-[#25D366]/20 hover:text-[#25D366] transition-all border border-glass-border0 flex items-center justify-center gap-3"><svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.582 2.128 2.182-.573c.978.58 1.911.928 3.145.929 3.178 0 5.767-2.587 5.768-5.766.001-3.187-2.575-5.77-5.764-5.771zm3.392 8.244c-.144.405-.837.774-1.17.824-.299.045-.677.063-1.092-.069-.252-.08-.575-.187-.988-.365-1.739-.751-2.874-2.502-2.961-2.617-.087-.116-.708-.94-.708-1.793s.448-1.273.607-1.446c.159-.173.346-.217.462-.217l.332.006c.106.005.249-.04.39.298.144.347.491 1.2.534 1.287.043.087.072.188.014.304-.058.116-.087.188-.173.289l-.26.304c-.087.086-.177.18-.076.354.101.174.449.741.964 1.201.662.591 1.221.774 1.394.86s.274.072.376-.043c.101-.116.433-.506.549-.68.116-.173.231-.145.39-.087s1.011.477 1.184.564.289.13.332.202c.045.072.045.419-.1.824zm-3.423-14.416c-6.627 0-12 5.373-12 12s5.373 12 12 12 12-5.373 12-12A12 12 0 0 0 12.029 4.456zm.029 18.88c-1.161 0-2.305-.292-3.318-.844l-3.677.964.984-3.595c-.607-1.052-.927-2.246-.926-3.468.001-3.825 3.113-6.937 6.937-6.937 3.825.001 6.938 3.113 6.938 6.938-.001 3.825-3.114 6.938-6.938 6.942z"/></svg> WhatsApp</button>
               <button onClick={async () => { 
                  window.open('https://twitter.com/intent/tweet?text=Check%20out%20this%20Web3%20Browser!%20https%3A%2F%2Fweb3browser-sooty.vercel.app%2F', '_blank'); 
                  const success = await claimReward('node_referral'); 
                  if (success) {
                    alert('Expansion broadcasted: +50 Points!');
                    setShowShareModal(false); 
                  }
               }} className="w-full py-4 glass rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-card-alpha0 transition-all border border-glass-border0 flex items-center justify-center gap-3"><svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z"/></svg> X (Twitter)</button>
               <button onClick={async () => { 
                  window.open('https://t.me/share/url?url=https://web3browser-sooty.vercel.app/&text=Check%20out%20this%20Web3%20Browser!', '_blank'); 
                  const success = await claimReward('node_referral'); 
                  if (success) {
                    alert('Matrix expanded: +50 Points!');
                    setShowShareModal(false); 
                  }
               }} className="w-full py-4 glass rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-[#0088cc]/20 hover:text-[#0088cc] transition-all border border-glass-border0 flex items-center justify-center gap-3"><svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/></svg> Telegram</button>
            </div>
            
            <button onClick={() => setShowShareModal(false)} className="text-[10px] font-black uppercase text-body/30 hover:text-heading transition-colors tracking-widest">Close Matrix</button>
          </div>
        </div>
      )}

      {/* Voucher Modal */}
      {showVoucherModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-base/95 backdrop-blur-3xl animate-in zoom-in duration-300 px-6">
          <div className="glass-card max-w-4xl w-full p-10 rounded-[3rem] border-emerald-500/20 relative overflow-hidden bg-gradient-to-br from-emerald-900/10 to-transparent max-h-[90vh] flex flex-col">
            <div className="flex justify-between items-start mb-8 shrink-0">
              <div>
                <h2 className="text-4xl font-black uppercase tracking-tighter italic mb-1 text-emerald-400">PARTNER <span className="text-heading">VOUCHERS</span></h2>
                <p className="text-body/40 text-sm font-bold">Redeem points for real-world assets and exclusive brand gift cards.</p>
              </div>
              <button onClick={() => setShowVoucherModal(false)} className="w-12 h-12 flex items-center justify-center glass rounded-full hover:bg-card-alpha0 transition-all active:scale-95 text-body/50"><X size={24} /></button>
            </div>
            
            <div className="flex items-center justify-between mb-8 shrink-0 bg-black/20 p-6 rounded-3xl border border-glass-border">
                <div className="flex items-center gap-4">
                   <div className="w-12 h-12 bg-yellow-400/20 rounded-2xl flex items-center justify-center"><Zap size={24} className="text-yellow-400" /></div>
                   <div>
                     <div className="text-[10px] font-black uppercase text-body/40 tracking-widest">Available Points</div>
                     <div className="text-2xl font-black text-heading">{points.toLocaleString()} PTS</div>
                   </div>
                </div>
             </div>

            <h3 className="text-sm font-black uppercase tracking-widest text-emerald-400 mb-4 px-2">Available Vouchers</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 overflow-y-auto pr-4 pb-4 custom-scrollbar mb-8">
               {[
                 { brand: 'Amazon', value: '$10 Gift Card', icon: <ShoppingCart size={32} className="text-yellow-500" />, cost: 10000, color: 'hover:border-yellow-500/50 hover:bg-yellow-500/10' },
                 { brand: 'Apple', value: '$25 Gift Card', icon: <Zap size={32} className="text-heading" />, cost: 25000, color: 'hover:border-glass-border0 hover:bg-card-alpha0' },
                 { brand: 'Flipkart', value: '₹500 Voucher', icon: <ShoppingCart size={32} className="text-blue-500" />, cost: 5000, color: 'hover:border-blue-500/50 hover:bg-blue-500/10' },
                 { brand: 'Croma', value: '10% Discount', icon: <Cpu size={32} className="text-teal-500" />, cost: 2000, color: 'hover:border-teal-500/50 hover:bg-teal-500/10' },
                 { brand: 'Myntra', value: '₹1000 Voucher', icon: <ShoppingCart size={32} className="text-pink-500" />, cost: 10000, color: 'hover:border-pink-500/50 hover:bg-pink-500/10' },
                 { brand: 'Steam', value: '$20 Wallet', icon: <Gamepad2 size={32} className="text-primary" />, cost: 20000, color: 'hover:border-indigo-500/50 hover:bg-primary/10' },
               ].map((v, i) => (
                  <div key={i} className={`glass rounded-[2rem] p-6 border-glass-border transition-all group cursor-pointer ${v.color}`}>
                     <div className="w-16 h-16 bg-card-alpha rounded-2xl flex items-center justify-center text-3xl mb-4 group-hover:scale-110 transition-transform">{v.icon}</div>
                     <h3 className="text-xl font-black uppercase tracking-tight text-heading mb-1">{v.brand}</h3>
                     <p className="text-sm font-bold text-body/40 mb-6">{v.value}</p>
                     <div className="flex items-center justify-between mt-auto">
                        <span className="text-[10px] font-black uppercase tracking-widest bg-black/40 px-3 py-1.5 rounded-lg text-body/70">{v.cost.toLocaleString()} PTS</span>
                        <button 
                          onClick={async () => {
                            if (points < v.cost) return alert('Insufficient points for this voucher.');
                            const success = await claimReward(`${v.brand.toLowerCase()}_redemption`, -v.cost);
                            if (success) {
                               const code = Math.random().toString(36).substring(2, 10).toUpperCase();
                               const keyId = 'KEY-' + Math.floor(Math.random() * 100000);
                               setRedeemedVouchers(prev => [...prev, { brand: v.brand, value: v.value, code, keyId }]);
                               alert(`Voucher for ${v.brand} synchronized to your neural identity.`);
                            }
                          }}
                          className={`px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${points >= v.cost ? 'bg-emerald-500 text-black hover:bg-emerald-400 active:scale-95' : 'bg-card-alpha text-body/20 cursor-not-allowed'}`}
                        >
                          {points >= v.cost ? 'Redeem now' : 'locked'}
                        </button>
                     </div>
                  </div>
               ))}
            </div>

            {redeemedVouchers.length > 0 && (
               <>
                 <h3 className="text-sm font-black uppercase tracking-widest text-primary mb-4 px-2">Redeemed Rewards</h3>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                   {redeemedVouchers.map((rv, idx) => (
                     <div key={idx} className="glass rounded-2xl p-5 border-purple-500/20 bg-gradient-to-r from-purple-500/10 to-transparent flex flex-col gap-3 relative overflow-hidden">
                       <div className="absolute top-0 right-0 w-16 h-16 bg-purple-500/10 rounded-bl-[100%]"></div>
                       <div className="flex justify-between items-center">
                         <span className="font-black uppercase tracking-widest text-heading">{rv.brand}</span>
                         <span className="text-[10px] font-bold text-emerald-400 uppercase bg-emerald-500/10 px-2 py-1 rounded-md border border-emerald-500/20">Active</span>
                       </div>
                       <div className="text-lg font-black text-body/80">{rv.value}</div>
                       <div className="bg-black/40 rounded-xl p-3 border border-glass-border space-y-2 mt-2">
                         <div className="flex justify-between items-center">
                           <span className="text-[9px] font-bold text-body/30 uppercase tracking-widest">Coupon Code</span>
                           <span className="font-mono text-xs font-bold text-amber-400 tracking-widest select-all">{rv.code}</span>
                         </div>
                         <div className="flex justify-between items-center">
                           <span className="text-[9px] font-bold text-body/30 uppercase tracking-widest">Key ID</span>
                           <span className="font-mono text-[10px] text-body/50">{rv.keyId}</span>
                         </div>
                       </div>
                     </div>
                   ))}
                 </div>
               </>
            )}
          </div>
        </div>
      )}

      {/* Game Overlays */}
      {activeGame === 'snake' && (
        <SnakeGame 
          onExit={() => setActiveGame(null)} 
          onScore={(score) => {
            if(score > 0) {
              claimReward('wtf_quest_action', score);
              alert(`Neural Sync Results: +Points earned based on score of ${score}.`);
            }
          }} 
        />
      )}
      {activeGame === 'tetris' && (
        <TetrisGame 
          onExit={() => setActiveGame(null)} 
          onScore={(score) => {
            if(score > 0) {
              claimReward('wtf_quest_action', score);
              alert(`Tetris Override: +Points earned based on score of ${score}.`);
            }
          }} 
        />
      )}
      {activeGame === 'space' && (
        <SpaceBlasterGame 
          onExit={() => setActiveGame(null)} 
          onScore={(score) => {
            if(score > 0) {
              claimReward('wtf_quest_action', score);
              alert(`Sector Secured: +Points earned based on performance (${score}).`);
            }
          }} 
        />
      )}
      {activeGame === 'tictactoe' && (
        <TicTacToe 
          onExit={() => setActiveGame(null)} 
          onScore={(score) => {
            if(score > 0) {
              claimReward('wtf_quest_action', score);
              alert(`Match Completed: +Points earned for tactical execution.`);
            }
          }} 
        />
      )}

      {/* Mobile Bottom Navigation Bar */}
      <nav className="md:hidden fixed bottom-0 w-full h-16 bg-[#0a0c0f] border-t border-glass-border flex items-center justify-around px-4 z-50">
         <NavItemMobile icon={<Home size={22}/>} label="Home" active={activeTabObj.type === 'explore' && !activeTabObj.dapp} onClick={() => updateActiveTab({ type: 'explore', dapp: null, query: '' })} />
         <NavItemMobile icon={<Search size={22}/>} label="Search" active={activeTabObj.type === 'search'} onClick={() => updateActiveTab({ type: 'search', dapp: null, isSearching: false, searchResults: [] }) } />
         <NavItemMobile icon={<Grid size={22}/>} label="DApps" active={activeTabObj.type === 'dapps'} onClick={() => updateActiveTab({ type: 'dapps', dapp: null })} />
         <NavItemMobile icon={<MessageSquare size={22}/>} label="Chat" active={activeTabObj.type === 'rewards'} onClick={() => updateActiveTab({ type: 'rewards', dapp: null })} />
         <NavItemMobile icon={<Settings size={22}/>} label="Menu" active={activeTabObj.type === 'settings'} onClick={() => updateActiveTab({ type: 'settings', dapp: null })} />
      </nav>
    </div>
  );
}

function EduCard({ title, description, icon, tag, url, onLearnMore }) {
  return (
    <div 
      className="glass-card p-10 rounded-[3rem] hover:border-indigo-500/40 transition-all cursor-pointer group flex flex-col items-start min-h-[300px] relative overflow-hidden"
      onClick={() => onLearnMore && onLearnMore(url)}
    >
      <div className="absolute -top-10 -right-10 w-32 h-32 bg-indigo-600/5 rounded-full blur-3xl group-hover:bg-primary/10 transition-colors"></div>
      
      <div className="flex items-center justify-between w-full mb-8">
        <div className="w-14 h-14 glass rounded-2xl flex items-center justify-center shadow-lg border-glass-border group-hover:scale-110 group-hover:rotate-6 transition-all duration-500">
          {icon || <Activity size={24} className="text-primary" />}
        </div>
        {tag && (
          <span className="text-[10px] font-black uppercase tracking-[0.2em] text-body/30 bg-card-alpha px-4 py-2 rounded-full border border-glass-border0">
            {tag}
          </span>
        )}
      </div>

      <h3 className="text-2xl font-black mb-4 uppercase tracking-tight group-hover:text-primary transition-colors leading-tight">
        {title}
      </h3>
      <p className="text-base text-body/40 font-medium leading-relaxed group-hover:text-body/60 transition-colors">
        {description}
      </p>
      
      <div 
        className="mt-auto pt-8 flex items-center gap-3 text-xs font-black uppercase tracking-[0.3em] text-body/10 group-hover:text-primary transition-colors"
      >
        Learn More <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform" />
      </div>
    </div>
  );
}

function BuiltinContentView({ content, onBack }) {
  if (!content) return null;
  
  return (
    <div className="space-y-16 animate-in fade-in slide-in-from-bottom-8 duration-1000 max-w-4xl mx-auto pb-20">
      <div className="flex items-center gap-4 mb-8">
        <button 
          onClick={onBack}
          className="w-12 h-12 glass rounded-2xl flex items-center justify-center hover:bg-card-alpha0 transition-all active:scale-95 group"
        >
          <ChevronLeft size={24} className="group-hover:-translate-x-1 transition-transform" />
        </button>
        <span className="text-[10px] font-black uppercase tracking-[0.4em] text-body/30 italic">PROTOCOL / {content.category} / INTERNAL_DOCS</span>
      </div>

      <div className="relative">
        <div className="absolute -top-20 -left-20 w-64 h-64 bg-primary/10 rounded-full blur-[100px] pointer-events-none"></div>
        <h1 className="text-7xl font-black tracking-tighter uppercase italic leading-none mb-4">{content.title}</h1>
        <p className="text-xl font-bold text-primary uppercase tracking-widest">{content.subtitle}</p>
      </div>

      <div className="grid grid-cols-1 gap-12 mt-16">
        {Array.isArray(content.sections) && content.sections.map((section, idx) => (
          <div key={idx} className="glass-card p-12 rounded-[3.5rem] border-glass-border space-y-6 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/3 rounded-bl-[100%] transition-transform group-hover:scale-110"></div>
            <h2 className="text-3xl font-black tracking-tight uppercase italic flex items-center gap-4">
              <div className="w-1.5 h-8 bg-indigo-500 rounded-full"></div>
              {section.heading}
            </h2>
            <p className="text-lg text-body/60 leading-relaxed font-medium">
              {section.text}
            </p>
            {Array.isArray(section.bullets) && (
              <ul className="space-y-4 pt-4">
                {section.bullets.map((bullet, bIdx) => (
                  <li key={bIdx} className="flex items-start gap-4">
                    <div className="w-6 h-6 rounded-lg bg-indigo-500/20 flex items-center justify-center shrink-0 mt-1">
                      <div className="w-1.5 h-1.5 rounded-full bg-indigo-400 shadow-glow"></div>
                    </div>
                    <span className="text-base font-bold text-body/40">{bullet}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        ))}
      </div>

      <div className="pt-12 text-center">
        <button 
          onClick={onBack}
          className="px-10 py-5 glass rounded-[2rem] font-black uppercase tracking-widest hover:bg-card-alpha0 transition-all border-glass-border0 active:scale-95 text-xs text-body/40 hover:text-heading"
        >
          Return to Registry
        </button>
      </div>
    </div>
  );
}

// Final Synchronization Signature: 0x817a68d-matrix-core-v5.0-playwall-complete
export default App;

function NavItemMobile({ icon, label, active, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`flex flex-col items-center justify-center w-16 h-full gap-1 transition-all ${
        active ? 'text-primary' : 'text-body/40 hover:text-heading'
      }`}
    >
      <div className={`${active ? 'scale-110 mb-0.5' : ''} transition-transform`}>
        {icon}
      </div>
    </button>
  );
}

function NavItem({ icon, label, active, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-4 px-4 py-4 rounded-2xl transition-all duration-300 group ${
        active 
          ? 'bg-indigo-600 text-heading shadow-lg shadow-indigo-600/30' 
          : 'text-body/40 hover:bg-card-alpha hover:text-heading'
      }`}
    >
      <div className={`${active ? 'text-heading' : 'group-hover:text-primary'} transition-colors`}>
        {icon}
      </div>
      <span className="hidden lg:block text-sm font-black uppercase tracking-widest">{label}</span>
    </button>
  );
}

function RewardCard({ icon, label, value, subValue }) {
  return (
    <div className="glass-card p-8 rounded-[2.5rem] border-glass-border bg-card-alpha space-y-4">
      <div className="w-10 h-10 glass rounded-xl flex items-center justify-center">
        {icon}
      </div>
      <div>
        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-body/30 mb-1">{label}</p>
        <p className="text-2xl font-black text-heading tracking-tighter">{value}</p>
        <p className="text-[10px] font-bold text-primary italic uppercase tracking-widest mt-2">{subValue}</p>
      </div>
    </div>
  );
}

function ActivityItem({ label, date, points }) {
  return (
    <div className="flex items-center justify-between group cursor-pointer hover:translate-x-1 transition-transform">
      <div className="flex items-center gap-4">
        <div className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse" />
        <div>
          <p className="text-sm font-black uppercase text-heading group-hover:text-primary transition-colors">{label}</p>
          <p className="text-[10px] font-bold text-body/20 uppercase tracking-widest">{date}</p>
        </div>
      </div>
      <div className="text-[10px] font-black text-primary/50 bg-indigo-400/5 px-3 py-1 rounded-lg border border-indigo-400/10 uppercase tracking-widest">
        {points}
      </div>
    </div>
  );
}




