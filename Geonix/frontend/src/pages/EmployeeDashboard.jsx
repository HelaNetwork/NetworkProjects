import React, { useState, useEffect, useRef } from 'react';
import { ArrowLeft, TrendingUp, Clock, ArrowDownToLine, LogOut, RefreshCw, Wallet } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { ethers } from 'ethers';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';

// Contract ABI for withdraw function
const PAYSTREAM_ABI = [
  "function withdraw(uint256 streamId)",
  "function availableBalance(uint256) view returns (uint256)",
  "function getStream(uint256) view returns (address employer, address employee, address token, uint256 ratePerSecond, uint256 startTime, uint256 endTime, uint256 withdrawnAmount, bool active, bool paused, uint256 pausedTime, uint256 totalPausedDuration)"
];

export default function EmployeeDashboard() {
  const [streams, setStreams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [claiming, setClaiming] = useState(null);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [walletConnected, setWalletConnected] = useState(false);
  const [walletAddress, setWalletAddress] = useState(null);
  const [provider, setProvider] = useState(null);
  const [signer, setSigner] = useState(null);
  
  const navigate = useNavigate();
  const userName = localStorage.getItem('userName') || 'Employee';
  const token = localStorage.getItem('token');
  const refreshIntervalRef = useRef(null);

  useEffect(() => {
    if (!token) {
      navigate('/login');
      return;
    }
    fetchStreams();
    checkWalletConnection();

    // Set up auto-refresh every 10 seconds when enabled
    if (autoRefresh) {
      refreshIntervalRef.current = setInterval(() => {
        fetchStreams();
      }, 10000);
    }

    // Cleanup interval on unmount
    return () => {
      if (refreshIntervalRef.current) {
        clearInterval(refreshIntervalRef.current);
      }
    };
  }, [autoRefresh]);

  const checkWalletConnection = async () => {
    if (typeof window.ethereum !== 'undefined') {
      try {
        const accounts = await window.ethereum.request({ method: 'eth_accounts' });
        if (accounts.length > 0) {
          await connectWallet();
        }
      } catch (error) {
        console.error('Error checking wallet:', error);
      }
    }
  };

  const connectWallet = async () => {
    if (typeof window.ethereum === 'undefined') {
      alert('Please install MetaMask or another Web3 wallet to withdraw funds!');
      return;
    }

    try {
      const web3Provider = new ethers.BrowserProvider(window.ethereum);
      const accounts = await web3Provider.send("eth_requestAccounts", []);
      const web3Signer = await web3Provider.getSigner();
      
      setProvider(web3Provider);
      setSigner(web3Signer);
      setWalletAddress(accounts[0]);
      setWalletConnected(true);

      console.log('✅ Wallet connected:', accounts[0]);
    } catch (error) {
      console.error('Error connecting wallet:', error);
      alert('Failed to connect wallet: ' + error.message);
    }
  };

  const disconnectWallet = () => {
    setProvider(null);
    setSigner(null);
    setWalletAddress(null);
    setWalletConnected(false);
  };

  const fetchStreams = async () => {
    try {
      const response = await fetch(`${API_URL}/api/streams/my-streams`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) throw new Error('Failed to fetch streams');
      const data = await response.json();
      setStreams(data.streams || []);
    } catch (error) {
      console.error('Error fetching streams:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleClaim = async (streamId, employeeWallet) => {
    if (!walletConnected) {
      alert('Please connect your wallet first!');
      return;
    }

    // Verify connected wallet matches employee wallet
    if (walletAddress.toLowerCase() !== employeeWallet.toLowerCase()) {
      alert(`Wrong wallet connected!\n\nConnected: ${walletAddress}\nRequired: ${employeeWallet}\n\nPlease switch to the correct wallet in MetaMask.`);
      return;
    }

    setClaiming(streamId);
    try {
      // Get contract address from environment or API
      const contractAddress = import.meta.env.VITE_PAYSTREAM_CONTRACT || await getContractAddress();
      
      if (!contractAddress) {
        throw new Error('PayStream contract address not configured');
      }

      // Create contract instance with signer
      const contract = new ethers.Contract(contractAddress, PAYSTREAM_ABI, signer);

      console.log(`💰 Claiming from stream ${streamId}...`);
      
      // Call withdraw function - this requires employee's signature
      const tx = await contract.withdraw(streamId);
      console.log('📤 Transaction sent:', tx.hash);
      
      alert(`Transaction sent! Hash: ${tx.hash}\n\nWaiting for confirmation...`);
      
      // Wait for confirmation
      const receipt = await tx.wait();
      console.log('✅ Transaction confirmed:', receipt);
      
      alert('Salary withdrawn successfully! Check your wallet.');
      
      // Refresh streams to show updated balance
      fetchStreams();
      
    } catch (error) {
      console.error('Error withdrawing:', error);
      
      let errorMessage = 'Failed to withdraw';
      if (error.code === 'ACTION_REJECTED') {
        errorMessage = 'Transaction was rejected in wallet';
      } else if (error.message.includes('insufficient funds')) {
        errorMessage = 'Insufficient HeLa tokens for gas fees';
      } else if (error.reason) {
        errorMessage = error.reason;
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      alert('Error: ' + errorMessage);
    } finally {
      setClaiming(null);
    }
  };

  const getContractAddress = async () => {
    // Fallback: fetch from backend if not in env
    try {
      const response = await fetch(`${API_URL}/api/config/contract-address`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        return data.contractAddress;
      }
    } catch (error) {
      console.error('Error fetching contract address:', error);
    }
    return null;
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate('/login');
  };

  const toggleAutoRefresh = () => {
    setAutoRefresh(!autoRefresh);
  };

  const totalAvailable = streams.reduce((sum, s) => sum + parseFloat(s.availableBalance || 0), 0);
  const activeStreams = streams.filter(s => s.active).length;
  const totalWithdrawn = streams.reduce((sum, s) => sum + parseFloat(s.withdrawnAmount || 0), 0);

  // Get employee wallet from first stream
  const employeeWallet = streams.length > 0 ? streams[0].employeeWallet : null;

  return (
    <div className="min-h-screen bg-[#050508] pt-24 pb-16 px-6">
      <div className="max-w-5xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <Link 
            to="/" 
            className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
          >
            <ArrowLeft size={20} />
            Back to Home
          </Link>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-colors"
          >
            <LogOut size={18} />
            Logout
          </button>
        </div>

        {/* Wallet Connection Banner */}
        {!walletConnected ? (
          <div className="mb-6 p-6 rounded-xl bg-yellow-500/10 border border-yellow-500/30">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <Wallet className="text-yellow-400" size={24} />
                <div>
                  <div className="text-yellow-400 font-semibold">Connect Your Wallet</div>
                  <div className="text-sm text-gray-400">Connect your wallet to withdraw your salary</div>
                </div>
              </div>
              <button
                onClick={connectWallet}
                className="px-6 py-2 rounded-xl bg-yellow-500 text-black font-semibold hover:bg-yellow-400 transition-colors"
              >
                Connect Wallet
              </button>
            </div>
          </div>
        ) : (
          <div className="mb-6 p-4 rounded-xl bg-green-500/10 border border-green-500/30">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <Wallet className="text-green-400" size={20} />
                <div>
                  <div className="text-green-400 font-semibold text-sm">Wallet Connected</div>
                  <div className="text-xs text-gray-400 font-mono">{walletAddress?.slice(0, 6)}...{walletAddress?.slice(-4)}</div>
                </div>
              </div>
              <button
                onClick={disconnectWallet}
                className="text-sm px-3 py-1 rounded-lg bg-white/5 text-gray-400 hover:text-white transition-colors"
              >
                Disconnect
              </button>
            </div>
          </div>
        )}

        <div className="mb-12">
          <h1 
            className="text-5xl font-bold mb-4"
            style={{
              background: 'linear-gradient(135deg, #A855F7 0%, #C084FC 50%, #F97316 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            Welcome, {userName}
          </h1>
          <p className="text-gray-400 text-lg">
            Your streams are earning in real-time. Withdraw anytime.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {[
            { icon: <TrendingUp size={28} />, label: 'Total Available', value: totalAvailable.toFixed(6), color: '#A855F7' },
            { icon: <Clock size={28} />, label: 'Active Streams', value: activeStreams.toString(), color: '#F97316' },
            { icon: <ArrowDownToLine size={28} />, label: 'Total Withdrawn', value: totalWithdrawn.toFixed(2), color: '#4ade80' },
          ].map((card, i) => (
            <div
              key={i}
              className="p-6 rounded-2xl transition-all hover:scale-105"
              style={{
                background: `linear-gradient(135deg, ${card.color}15, ${card.color}05)`,
                border: `1px solid ${card.color}30`,
              }}
            >
              <div className="text-white mb-3" style={{ color: card.color }}>{card.icon}</div>
              <div className="text-sm text-gray-400">{card.label}</div>
              <div className="text-3xl font-bold mt-1 font-mono" style={{ color: card.color }}>
                {card.value}
                {(card.label.includes('Available') || card.label.includes('Withdrawn')) && (
                  <span className="text-lg ml-1 text-gray-500">HLUSD</span>
                )}
              </div>
            </div>
          ))}
        </div>

        <div className="flex justify-between items-center mb-6">
          <button
            onClick={toggleAutoRefresh}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-colors ${
              autoRefresh 
                ? 'bg-green-500/20 text-green-400 border border-green-500/30' 
                : 'bg-white/5 text-gray-400 border border-white/10'
            }`}
          >
            <div className={`w-2 h-2 rounded-full ${autoRefresh ? 'bg-green-400 animate-pulse' : 'bg-gray-400'}`}></div>
            {autoRefresh ? 'Auto-refresh ON' : 'Auto-refresh OFF'}
          </button>
          
          <button
            onClick={fetchStreams}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-colors disabled:opacity-50"
          >
            <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
            Refresh Now
          </button>
        </div>

        <div>
          <h3 className="text-xl font-semibold text-white mb-6">My Salary Streams</h3>
          
          {loading ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500"></div>
              <p className="text-gray-400 mt-4">Loading streams...</p>
            </div>
          ) : streams.length === 0 ? (
            <div 
              className="p-12 rounded-3xl text-center"
              style={{
                background: 'rgba(255, 255, 255, 0.03)',
                border: '1px solid rgba(255, 255, 255, 0.06)',
              }}
            >
              <p className="text-gray-400 text-lg">No salary streams yet.</p>
              <p className="text-gray-500 text-sm mt-2">Your HR will set up your salary stream.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {streams.map((stream) => (
                <div 
                  key={stream.streamId}
                  className="p-8 rounded-3xl"
                  style={{
                    background: 'rgba(255, 255, 255, 0.03)',
                    border: '1px solid rgba(255, 255, 255, 0.06)',
                  }}
                >
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-4">
                        <span className="text-sm font-mono text-gray-500">Stream #{stream.streamId}</span>
                        <span 
                          className={`px-2 py-0.5 rounded-full text-xs border ${
                            stream.active 
                              ? 'bg-green-500/10 text-green-400 border-green-500/30' 
                              : 'bg-gray-500/10 text-gray-400 border-gray-500/30'
                          }`}
                        >
                          {stream.active ? 'Active' : 'Ended'}
                        </span>
                        {stream.paused && (
                          <span className="px-2 py-0.5 rounded-full text-xs border bg-yellow-500/10 text-yellow-400 border-yellow-500/30">
                            Paused
                          </span>
                        )}
                      </div>

                      <div className="mb-4">
                        <div className="text-sm text-gray-500 mb-1">Available to Withdraw</div>
                        <div className="text-4xl font-bold font-mono">
                          <span className="text-purple-400">{parseFloat(stream.availableBalance || 0).toFixed(8)}</span>
                          <span className="text-lg text-gray-500 ml-2">HLUSD</span>
                        </div>
                        <div className="text-sm text-gray-500 mt-1">
                          Already withdrawn:{' '}
                          <span className="text-green-400 font-mono">{parseFloat(stream.withdrawnAmount || 0).toFixed(6)} HLUSD</span>
                        </div>
                      </div>

                      <div className="flex gap-6 text-sm text-gray-500">
                        <span>From: <span className="font-mono text-gray-400">{stream.employerName || 'HR'}</span></span>
                        <span>Rate: <span className="font-mono text-orange-400">{parseFloat(stream.ratePerSecond || 0).toFixed(8)}/sec</span></span>
                      </div>
                    </div>

                    <div className="shrink-0">
                      <button
                        onClick={() => handleClaim(stream.streamId, stream.employeeWallet)}
                        disabled={
                          !walletConnected ||
                          !stream.active || 
                          stream.paused || 
                          parseFloat(stream.availableBalance || 0) === 0 || 
                          claiming === stream.streamId
                        }
                        className="px-8 py-4 rounded-2xl font-bold text-lg flex items-center gap-2 transition-transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                        style={{
                          background: 'linear-gradient(to right, #A855F7, #7C3AED)',
                          color: 'white',
                        }}
                      >
                        <ArrowDownToLine size={20} />
                        {!walletConnected ? 'Connect Wallet' :
                         claiming === stream.streamId ? 'Processing...' : 
                         stream.paused ? 'Stream Paused' : 
                         'Claim Salary'}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
