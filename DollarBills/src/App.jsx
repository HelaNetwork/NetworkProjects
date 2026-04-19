import React, { useState, useEffect, useCallback } from 'react';
import { ethers } from 'ethers';
import { 
  Wallet, DollarSign, Users, TrendingUp, Moon, Sun, 
  Plus, Pause, X, Play, AlertCircle, CheckCircle, Clock, Layout, Terminal,
  Zap, Radio, Layers, Activity, ArrowUpRight
} from 'lucide-react';
import { CONTRACT_ADDRESS, CONTRACT_ABI } from './contractInfo';
import { getBackendHealth, getBackendStats, getBackendCompliance } from './api/backend';

const HELA_NETWORK = {
  chainId: '0xa2d08', // 666888 in hex
  chainName: 'HeLa Testnet',
  nativeCurrency: { name: 'HLUSD', symbol: 'HLUSD', decimals: 18 },
  rpcUrls: ['https://testnet-rpc.helachain.com'],
  blockExplorerUrls: ['https://testnet-explorer.helachain.com']
};

const PayStreamDashboard = () => {
  // --- UI State ---
  const [darkMode, setDarkMode] = useState(true);
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState(null);
  const [isDemoMode, setIsDemoMode] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState('');

  // --- Web3 State ---
  const [account, setAccount] = useState(null);
  const [provider, setProvider] = useState(null);
  const [contract, setContract] = useState(null);

  // --- Business Logic State ---
  const [_treasuryBalance, setTreasuryBalance] = useState('0');
  const [_taxVaultBalance, setTaxVaultBalance] = useState('0');
  const [streamStartTime, setStreamStartTime] = useState(null);
  const [yearlySalary, setYearlySalary] = useState('0');
  const [transactions, setTransactions] = useState([]);
  const [currentAccrued, setCurrentAccrued] = useState('0.000');
  const [totalWithdrawn, setTotalWithdrawn] = useState('0');

  // --- Notification Helper ---
  const showNotification = (message, type) => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 5000);
  };

  const loadBackendData = useCallback(async () => {
    try {
      await getBackendHealth();
      const [statsResponse, complianceResponse] = await Promise.all([
        getBackendStats(),
        getBackendCompliance(),
      ]);

      if (statsResponse?.data?.treasuryBalance != null) {
        setTreasuryBalance(String(statsResponse.data.treasuryBalance));
      }
      if (complianceResponse?.taxRate != null) {
        setTaxVaultBalance(String(complianceResponse.taxRate));
      }

      showNotification('Backend connected', 'success');
    } catch (error) {
      console.warn('Backend not reachable:', error);
      showNotification('Backend not reachable (optional)', 'info');
    }
  }, []);

  // --- Calculate Real-Time Accrued Salary ---
  const calculateAccruedSalary = useCallback(() => {
    if (!streamStartTime || !yearlySalary || parseFloat(yearlySalary) === 0) {
      return '0.000';
    }
    
    const now = Date.now();
    const startTime = streamStartTime.getTime();
    const elapsedSeconds = (now - startTime) / 1000;
    
    const yearlyAmount = parseFloat(yearlySalary);
    const secondsInYear = 365.25 * 24 * 60 * 60;
    const perSecondRate = yearlyAmount / secondsInYear;
    
    const totalAccrued = perSecondRate * elapsedSeconds;
    const availableToWithdraw = Math.max(0, totalAccrued - parseFloat(totalWithdrawn));
    
    return availableToWithdraw.toFixed(3);
  }, [streamStartTime, yearlySalary, totalWithdrawn]);

  // --- Data Loader ---
  const loadDashboardData = useCallback(async (contractInstance, userAddress, providerInstance) => {
    if (isDemoMode) {
      setTreasuryBalance("1250.00");
      setTaxVaultBalance("10%");
      setYearlySalary("50000");
      
      if (!streamStartTime) {
        setStreamStartTime(new Date(Date.now() - 86400000));
      }
      
      setTransactions([
        { id: 'tx1', type: 'Claim', amount: '137.000', date: '2 hours ago', hash: '0xabc...123' },
        { id: 'tx2', type: 'Claim', amount: '68.500', date: 'Yesterday', hash: '0xdef...456' },
        { id: 'tx3', type: 'Claim', amount: '45.200', date: '2 days ago', hash: '0xghi...789' }
      ]);
      return;
    }

    try {
      const targetAccount = userAddress || account;
      if (!targetAccount || !contractInstance) return;

      const stream = await contractInstance.employeeStreams(targetAccount);
      const taxPercent = await contractInstance.TAX_PERCENT();
      setTaxVaultBalance(taxPercent.toString() + "%");

      if (stream.isActive) {
        const salary = ethers.utils.formatUnits(stream.yearlySalary, 18);
        setYearlySalary(salary);
        setStreamStartTime(new Date(stream.lastClaimTime.toNumber() * 1000));
        // ABI used by this app doesn't expose totalWithdrawn; keep safe default.
        if (stream && stream.totalWithdrawn != null) {
          setTotalWithdrawn(ethers.utils.formatUnits(stream.totalWithdrawn, 18));
        } else {
          setTotalWithdrawn('0');
        }
      } else {
        setYearlySalary('0');
        setStreamStartTime(null);
        setTotalWithdrawn('0');
      }

      const balanceProvider = providerInstance || provider;
      if (balanceProvider) {
        const balance = await balanceProvider.getBalance(CONTRACT_ADDRESS);
        setTreasuryBalance(ethers.utils.formatEther(balance));
      }
    } catch (error) {
      console.error('Error loading real chain data:', error);
    }
  }, [isDemoMode, streamStartTime, account, provider]);

  // --- Connection Logic ---
  const connectWallet = async () => {
    try {
      if (!window.ethereum) {
        showNotification('Please install MetaMask!', 'error');
        return;
      }
      setLoading(true);

      let web3Provider = new ethers.providers.Web3Provider(window.ethereum);
      const network = await web3Provider.getNetwork();

      if (network.chainId !== 666888) {
        try {
          await window.ethereum.request({
            method: 'wallet_switchEthereumChain',
            params: [{ chainId: HELA_NETWORK.chainId }],
          });
        } catch (switchError) {
          if (switchError && switchError.code === 4902) {
            try {
              await window.ethereum.request({
                method: 'wallet_addEthereumChain',
                params: [HELA_NETWORK],
              });
            } catch (addError) {
              // MetaMask can refuse `wallet_addEthereumChain` if the chain already exists
              // (e.g. same chainId/RPC already configured). In that case, just try switching again.
              const addMsg = String(addError?.message || '');
              const looksLikeAlreadyExists =
                addError?.code === -32603 ||
                addMsg.toLowerCase().includes('already exists') ||
                addMsg.toLowerCase().includes('same rpc endpoint') ||
                addMsg.toLowerCase().includes('same rpc') ||
                addMsg.toLowerCase().includes('existing network');

              if (!looksLikeAlreadyExists) {
                throw addError;
              }
            }

            // After add (or if it already existed), attempt switching again.
            try {
              await window.ethereum.request({
                method: 'wallet_switchEthereumChain',
                params: [{ chainId: HELA_NETWORK.chainId }],
              });
            } catch (retrySwitchError) {
              console.error('Failed to switch to HeLa after add/exists:', retrySwitchError);
              throw new Error(
                "HeLa Testnet already exists in MetaMask. Please open MetaMask → Networks and switch to 'HeLa Testnet' (chainId 666888), then try again."
              );
            }
          } else {
            throw switchError;
          }
        }

        // Ensure the provider is bound to the newly selected chain.
        web3Provider = new ethers.providers.Web3Provider(window.ethereum);
      }

      const accounts = await web3Provider.send("eth_requestAccounts", []);
      const signer = web3Provider.getSigner();
      const contractInstance = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);
      
      setContract(contractInstance);
      setProvider(web3Provider);
      setAccount(accounts[0]);
      
      showNotification('Wallet connected successfully!', 'success');
      // Optional: backend status + analytics
      loadBackendData();
      await loadDashboardData(contractInstance, accounts[0], web3Provider);
    } catch (error) {
      console.error('Failed to connect wallet:', error);

      if (error?.code === 4001) {
        showNotification('Connection request rejected in MetaMask', 'error');
      } else if (typeof error?.message === 'string' && error.message.trim()) {
        showNotification(error.message, 'error');
      } else {
        showNotification('Failed to connect wallet', 'error');
      }
    } finally {
      setLoading(false);
    }
  };

  // --- Smart Contract Actions ---
  const claimSalary = async (customAmount = null) => {
    const amountToClaim = customAmount || currentAccrued;
    const claimValue = parseFloat(amountToClaim);
    
    if (claimValue <= 0) {
      showNotification('No amount available to claim', 'error');
      return;
    }
    
    if (isDemoMode) { 
      showNotification(`Claimed ${claimValue.toFixed(3)} HLUSD (Demo Mode)`, "success");
      
      setTransactions(prev => [
        { 
          id: Date.now().toString(), 
          type: 'Claim', 
          amount: claimValue.toFixed(3),
          date: 'Just now', 
          hash: '0x' + Math.random().toString(36).substr(2, 9) 
        },
        ...prev
      ]);
      
      setTotalWithdrawn(prev => (parseFloat(prev) + claimValue).toString());
      setWithdrawAmount('');
      
      return; 
    }
    
    if (!contract) return;
    try {
      setLoading(true);
      const tx = await contract.claimSalary();
      showNotification('Transaction sent...', 'info');
      await tx.wait();
      showNotification('Salary claimed!', 'success');
      
      setTransactions(prev => [
        { 
          id: tx.hash, 
          type: 'Claim', 
          amount: claimValue.toFixed(3),
          date: 'Just now', 
          hash: tx.hash.slice(0, 10) + '...' 
        }, 
        ...prev
      ]);
      
      setWithdrawAmount('');
      loadDashboardData(contract, account, provider);
    } catch (error) {
      showNotification('Failed to claim salary', 'error');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleClaimSpecificAmount = () => {
    if (!isDemoMode) {
      showNotification('Custom withdrawals are only available in Demo Mode', 'info');
      return;
    }
    const amount = parseFloat(withdrawAmount);
    
    if (isNaN(amount) || amount <= 0) {
      showNotification('Please enter a valid amount', 'error');
      return;
    }
    
    const available = parseFloat(currentAccrued);
    if (amount > available) {
      showNotification(`Amount exceeds available balance (${available.toFixed(3)} HLUSD)`, 'error');
      return;
    }
    
    claimSalary(withdrawAmount);
  };

  const handleMaxClick = () => {
    setWithdrawAmount(currentAccrued);
  };

  // --- Effects ---
  useEffect(() => {
    // Optional: load backend metrics even without wallet
    loadBackendData();
  }, [loadBackendData]);

  useEffect(() => {
    if (contract || isDemoMode) {
      loadDashboardData(contract, account, provider);
    }
  }, [isDemoMode, contract, account, provider, loadDashboardData]);

  useEffect(() => {
    const updateAccrued = () => {
      const accrued = calculateAccruedSalary();
      setCurrentAccrued(accrued);
    };
    
    updateAccrued();
    const interval = setInterval(updateAccrued, 1000);
    
    return () => clearInterval(interval);
  }, [calculateAccruedSalary]);

  const bgClass = darkMode ? 'bg-black' : 'bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50';
  const textClass = darkMode ? 'text-cyan-50' : 'text-slate-800';

  return (
    <div className={`min-h-screen ${bgClass} ${textClass} relative overflow-hidden transition-colors duration-500`}>
      {/* Cyberpunk Grid Background - ONLY IN DARK MODE */}
      {darkMode && (
        <>
          <div className="fixed inset-0 opacity-30" style={{
            backgroundImage: 'linear-gradient(rgba(6, 182, 212, 0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(6, 182, 212, 0.3) 1px, transparent 1px)',
            backgroundSize: '50px 50px'
          }}></div>
          
          {/* Animated Neon Orbs */}
          <div className="fixed inset-0 overflow-hidden pointer-events-none">
            <div className="absolute -top-40 -left-40 w-80 h-80 bg-cyan-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
            <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
            <div className="absolute -bottom-40 left-20 w-80 h-80 bg-pink-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>
            <div className="absolute top-1/2 left-1/2 w-96 h-96 bg-emerald-500 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-pulse"></div>
          </div>

          {/* Scanline Effect */}
          <div className="fixed inset-0 pointer-events-none z-50 bg-[linear-gradient(to_bottom,transparent_50%,rgba(0,255,255,0.03)_50%)] bg-[length:100%_4px] animate-scan"></div>
        </>
      )}

      {/* Notification */}
      {notification && (
        <div className={`fixed top-6 right-6 z-[100] px-8 py-5 rounded-2xl backdrop-blur-xl border-2 flex items-center gap-4 animate-slide-in-right shadow-2xl ${
          notification.type === 'success' ? 'bg-emerald-500/10 border-emerald-500 shadow-emerald-500/50' : 
          notification.type === 'error' ? 'bg-red-500/10 border-red-500 shadow-red-500/50' : 
          'bg-cyan-500/10 border-cyan-500 shadow-cyan-500/50'
        }`}>
          {notification.type === 'success' && <CheckCircle size={28} className="text-emerald-400" />}
          {notification.type === 'error' && <Activity size={28} className="text-red-400" />}
          {notification.type === 'info' && <Clock size={28} className="text-cyan-400 animate-pulse" />}
          <span className="font-bold text-xl tracking-tight">{notification.message}</span>
        </div>
      )}

      {/* Sidebar */}
      <div className={`fixed left-0 top-0 h-full w-80 ${darkMode ? 'bg-black/40' : 'bg-white/70'} backdrop-blur-2xl ${darkMode ? 'border-cyan-500/30' : 'border-emerald-200'} border-r p-8 z-40 ${darkMode ? 'shadow-2xl shadow-cyan-500/10' : 'shadow-xl'}`}>
        {/* Logo */}
        <div className="mb-10 group cursor-pointer relative">
          {darkMode && <div className="absolute inset-0 bg-gradient-to-r from-emerald-500 via-cyan-500 to-blue-500 rounded-2xl blur-xl opacity-50 group-hover:opacity-75 transition-opacity"></div>}
          <div className={`relative flex items-center gap-4 ${darkMode ? 'bg-black/80' : 'bg-white'} backdrop-blur-xl border ${darkMode ? 'border-emerald-500/50' : 'border-emerald-300'} rounded-2xl p-4 ${darkMode ? 'group-hover:border-emerald-400' : 'group-hover:border-emerald-400'} transition-all`}>
            <div className="relative">
              {darkMode && <div className="absolute inset-0 bg-gradient-to-br from-emerald-400 to-cyan-600 rounded-xl blur-md"></div>}
              <div className={`relative w-14 h-14 bg-gradient-to-br ${darkMode ? 'from-emerald-500 to-cyan-600' : 'from-emerald-400 to-cyan-400'} rounded-xl flex items-center justify-center shadow-lg`}>
                <Wallet className="text-white" size={32} />
              </div>
            </div>
            <div>
              <h1 className={`text-2xl font-black ${darkMode ? 'bg-gradient-to-r from-emerald-400 via-cyan-400 to-blue-400' : 'bg-gradient-to-r from-emerald-500 to-cyan-500'} bg-clip-text text-transparent tracking-tighter`}>
                PAYSTREAM
              </h1>
              <p className={`text-[10px] ${darkMode ? 'text-emerald-500' : 'text-emerald-600'} font-bold tracking-[0.3em] uppercase`}>Employee Portal</p>
            </div>
          </div>
        </div>

        {/* Demo Mode */}
        <div className={`mb-8 p-5 ${darkMode ? 'bg-yellow-500/5' : 'bg-yellow-100'} backdrop-blur-xl border ${darkMode ? 'border-yellow-500/30' : 'border-yellow-300'} rounded-2xl ${darkMode ? 'shadow-lg shadow-yellow-500/10' : 'shadow'}`}>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <Zap className="text-yellow-400" size={20} />
              <span className={`text-sm font-black ${darkMode ? 'text-yellow-400' : 'text-yellow-700'} tracking-wider`}>DEMO MODE</span>
            </div>
            <button 
              onClick={() => setIsDemoMode(!isDemoMode)}
              className={`w-14 h-7 rounded-full transition-all duration-300 relative ${
                isDemoMode ? 'bg-gradient-to-r from-yellow-500 to-orange-500 shadow-lg shadow-yellow-500/50' : 'bg-gray-700 border border-gray-600'
              }`}
            >
              <div className={`absolute top-1 w-5 h-5 bg-white rounded-full transition-all duration-300 shadow-lg ${
                isDemoMode ? 'left-8' : 'left-1'
              }`} />
            </button>
          </div>
          <p className={`text-xs ${darkMode ? 'text-yellow-400/70' : 'text-yellow-700'} font-mono`}>
            {isDemoMode ? '> SIMULATION ACTIVE' : '> BLOCKCHAIN CONNECTED'}
          </p>
        </div>

        {/* Navigation */}
        <nav className="space-y-4 mb-10">
          <button className={`w-full px-6 py-4 rounded-xl flex items-center gap-4 transition-all duration-300 font-bold text-lg group relative overflow-hidden ${
            darkMode 
              ? 'bg-gradient-to-r from-emerald-500/20 to-cyan-500/20 border-2 border-emerald-500 shadow-lg shadow-emerald-500/30'
              : 'bg-gradient-to-r from-emerald-100 to-cyan-100 border-2 border-emerald-400 shadow-lg'
          }`}>
            <div className={`absolute inset-0 ${darkMode ? 'bg-gradient-to-r from-emerald-500 to-cyan-500' : 'bg-gradient-to-r from-emerald-400 to-cyan-400'} opacity-0 group-hover:opacity-10 transition-opacity`}></div>
            <Layout size={24} className={darkMode ? 'text-emerald-400' : 'text-emerald-600'} />
            <span className={darkMode ? 'text-emerald-300' : 'text-emerald-700'}>DASHBOARD</span>
            <div className={`ml-auto w-2 h-2 ${darkMode ? 'bg-emerald-400' : 'bg-emerald-500'} rounded-full animate-pulse`}></div>
          </button>
        </nav>

        {/* Theme Toggle */}
        <div className="absolute bottom-8 left-8 right-8">
          <button
            onClick={() => setDarkMode(!darkMode)}
            className={`w-full px-6 py-4 ${darkMode ? 'bg-white/5' : 'bg-white'} backdrop-blur-xl border ${darkMode ? 'border-emerald-500/30' : 'border-emerald-200'} rounded-xl flex items-center justify-center gap-3 ${darkMode ? 'hover:border-emerald-400' : 'hover:border-emerald-400'} hover:bg-white/10 transition-all font-bold group`}
          >
            {darkMode ? (
              <>
                <Sun size={24} className="text-amber-400 group-hover:rotate-180 transition-transform duration-500" />
                <span className="bg-gradient-to-r from-amber-400 to-orange-400 bg-clip-text text-transparent">LIGHT MODE</span>
              </>
            ) : (
              <>
                <Moon size={24} className="text-indigo-600 group-hover:-rotate-12 transition-transform duration-500" />
                <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">DARK MODE</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="ml-80 p-12 relative z-10">
        {/* Header */}
        <div className="flex justify-between items-center mb-14">
          <div>
            <h2 className={`text-6xl font-black mb-3 ${darkMode ? 'bg-gradient-to-r from-emerald-400 via-cyan-400 to-blue-400' : 'bg-gradient-to-r from-emerald-500 via-cyan-500 to-blue-500'} bg-clip-text text-transparent tracking-tighter`}>
              EMPLOYEE // PORTAL
            </h2>
            <p className={`text-xl ${darkMode ? 'text-emerald-400/60' : 'text-emerald-600/70'} font-mono tracking-wide flex items-center gap-3`}>
              {darkMode && <Radio size={16} className="animate-pulse" />}
              Real-time Salary Streaming System
            </p>
          </div>
          
          {!account ? (
            <button
              onClick={connectWallet}
              disabled={loading}
              className={`relative px-10 py-5 bg-gradient-to-r ${darkMode ? 'from-emerald-500 to-cyan-600' : 'from-emerald-500 to-cyan-500'} rounded-xl flex items-center gap-4 hover:scale-105 active:scale-95 transition-all ${darkMode ? 'shadow-2xl shadow-emerald-500/50' : 'shadow-xl'} font-black text-xl disabled:opacity-50 overflow-hidden group`}
            >
              <div className={`absolute inset-0 bg-gradient-to-r ${darkMode ? 'from-cyan-600 to-blue-600' : 'from-cyan-500 to-emerald-500'} opacity-0 group-hover:opacity-100 transition-opacity`}></div>
              <Wallet size={28} className="relative z-10 text-white" />
              <span className="relative z-10 text-white">{loading ? 'CONNECTING...' : 'CONNECT WALLET'}</span>
            </button>
          ) : (
            <div className="relative">
              {darkMode && <div className="absolute inset-0 bg-gradient-to-r from-emerald-500 to-cyan-500 rounded-xl blur-xl opacity-50"></div>}
              <div className={`relative px-8 py-4 ${darkMode ? 'bg-black/80' : 'bg-white'} backdrop-blur-2xl border-2 ${darkMode ? 'border-emerald-500' : 'border-emerald-400'} rounded-xl flex items-center gap-4 ${darkMode ? 'shadow-2xl shadow-emerald-500/30' : 'shadow-xl'}`}>
                <div className="relative">
                  <div className="w-4 h-4 bg-emerald-400 rounded-full animate-pulse"></div>
                  <div className="absolute inset-0 w-4 h-4 bg-emerald-400 rounded-full animate-ping"></div>
                </div>
                <span className={`font-mono font-bold text-xl ${darkMode ? 'text-emerald-300' : 'text-emerald-600'}`}>{account.slice(0, 6)}...{account.slice(-4)}</span>
                <Layers size={20} className="text-emerald-400 ml-2" />
              </div>
            </div>
          )}
        </div>

        {/* Top Stats */}
        <div className="grid grid-cols-3 gap-8 mb-12">
          {[
            { label: 'YEARLY SALARY', value: parseFloat(yearlySalary).toLocaleString(undefined, {minimumFractionDigits: 3, maximumFractionDigits: 3}), color: 'from-cyan-500 to-blue-500', icon: DollarSign },
            { label: 'AVAILABLE NOW', value: currentAccrued, color: 'from-emerald-500 to-teal-500', icon: TrendingUp, highlight: true },
            { label: 'TOTAL CLAIMED', value: parseFloat(totalWithdrawn).toFixed(3), color: 'from-purple-500 to-pink-500', icon: CheckCircle }
          ].map((stat, idx) => (
            <div key={idx} className="relative group">
              {darkMode && <div className={`absolute inset-0 bg-gradient-to-br ${stat.color} rounded-3xl blur-xl opacity-20 group-hover:opacity-40 transition-opacity`}></div>}
              <div className={`relative ${darkMode ? 'bg-black/60' : 'bg-white'} backdrop-blur-2xl border ${darkMode ? 'border-cyan-500/30' : 'border-emerald-200'} rounded-3xl p-8 shadow-xl ${darkMode ? 'group-hover:border-emerald-400 group-hover:scale-105' : 'group-hover:border-emerald-400 group-hover:scale-105'} transition-all`}>
                <div className="flex items-center justify-between mb-6">
                  <span className={`text-xs font-black uppercase tracking-[0.3em] ${darkMode ? 'text-emerald-400' : 'text-emerald-600'}`}>{stat.label}</span>
                  <div className={`p-3 bg-gradient-to-br ${stat.color} rounded-xl shadow-lg ${darkMode ? `shadow-emerald-500/50` : ''}`}>
                    <stat.icon className="text-white" size={24} />
                  </div>
                </div>
                <h3 className={`text-5xl font-black font-mono ${stat.highlight ? (darkMode ? 'text-emerald-400' : 'text-emerald-600') : ''}`}>
                  {stat.value}
                </h3>
                <span className={`text-lg ${darkMode ? 'text-cyan-500/50' : 'text-emerald-400'} font-mono`}>HLUSD</span>
              </div>
            </div>
          ))}
        </div>

        {/* Main Claim Section */}
        <div className="relative group mb-12">
          {darkMode && <div className="absolute inset-0 bg-gradient-to-br from-emerald-500 via-cyan-500 to-blue-500 rounded-[40px] blur-3xl opacity-20 group-hover:opacity-30 transition-opacity"></div>}
          <div className={`relative ${darkMode ? 'bg-black/60' : 'bg-white'} backdrop-blur-2xl border-2 ${darkMode ? 'border-emerald-500/30' : 'border-emerald-200'} rounded-[40px] p-20 text-center shadow-2xl overflow-hidden ${darkMode ? 'group-hover:border-emerald-400' : 'group-hover:border-emerald-300'} transition-all`}>
            {darkMode && <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-emerald-500 to-transparent"></div>}
            
            <span className={`px-6 py-3 ${darkMode ? 'bg-emerald-500/10 text-emerald-400' : 'bg-emerald-100 text-emerald-700'} rounded-full text-sm font-black uppercase tracking-[0.25em] mb-12 inline-block border ${darkMode ? 'border-emerald-500/30' : 'border-emerald-300'}`}>
              {streamStartTime ? '🟢 STREAM ACTIVE' : '⚪ STREAM INACTIVE'}
            </span>
            
            {/* Real-time Counter */}
            <div className="mb-10">
              <div className={`text-xs font-black uppercase tracking-[0.3em] mb-4 ${darkMode ? 'text-emerald-400/60' : 'text-emerald-600/70'}`}>
                AVAILABLE TO WITHDRAW
              </div>
              <h4 className={`text-9xl font-black mb-3 italic tracking-tighter font-mono ${darkMode ? 'text-emerald-400' : 'text-emerald-600'} relative`}>
                {currentAccrued}
                {darkMode && <div className="absolute inset-0 bg-emerald-400 blur-3xl opacity-20"></div>}
              </h4>
              <div className={`text-2xl uppercase tracking-[0.3em] font-bold ${darkMode ? 'text-cyan-500/60' : 'text-cyan-600'}`}>HLUSD</div>
            </div>

            <div className={`h-px ${darkMode ? 'bg-gradient-to-r from-transparent via-emerald-700 to-transparent' : 'bg-gradient-to-r from-transparent via-emerald-300 to-transparent'} my-10`}></div>

            {/* Salary Info */}
            <div className="mb-14">
              <div className={`text-xs font-black uppercase tracking-[0.3em] mb-3 ${darkMode ? 'text-cyan-400/60' : 'text-cyan-600/70'}`}>
                ANNUAL SALARY
              </div>
              <div className={`text-4xl font-black ${darkMode ? 'text-cyan-400/80' : 'text-cyan-600'}`}>
                {parseFloat(yearlySalary).toLocaleString(undefined, {minimumFractionDigits: 3, maximumFractionDigits: 3})} HLUSD/year
              </div>
              <div className={`text-sm ${darkMode ? 'text-cyan-500/40' : 'text-cyan-500'} mt-3 font-mono`}>
                ≈ {(parseFloat(yearlySalary) / 365.25 / 24 / 60 / 60).toFixed(3)} HLUSD per second
              </div>
            </div>
            
            <p className={`text-xl ${darkMode ? 'text-emerald-400/60' : 'text-emerald-600/70'} mb-14 max-w-2xl mx-auto leading-relaxed font-mono`}>
              Your earnings stream continuously. Claim all currently available funds.
            </p>
            
            {/* Demo-only: Withdrawal Input (contract only supports claim-all on chain) */}
            {isDemoMode && (
              <>
                <div className="max-w-3xl mx-auto mb-10">
                  <label className={`text-xs font-black uppercase tracking-[0.3em] mb-4 block ${darkMode ? 'text-emerald-400/60' : 'text-emerald-600'}`}>
                    ENTER WITHDRAWAL AMOUNT
                  </label>
                  <div className="flex gap-6 items-center">
                    <div className="flex-1 relative">
                      <input
                        type="number"
                        step="0.001"
                        placeholder="0.000"
                        value={withdrawAmount}
                        onChange={(e) => setWithdrawAmount(e.target.value)}
                        className={`w-full px-8 py-6 ${darkMode ? 'bg-black/80' : 'bg-white'} backdrop-blur-xl border-2 ${darkMode ? 'border-emerald-500/30 focus:border-emerald-400 focus:ring-emerald-500/20' : 'border-emerald-200 focus:border-emerald-400 focus:ring-emerald-200'} rounded-2xl outline-none focus:ring-4 transition-all text-4xl font-black text-center font-mono ${darkMode ? 'text-emerald-300 placeholder-emerald-700' : 'text-emerald-700 placeholder-emerald-300'}`}
                      />
                      <button
                        onClick={handleMaxClick}
                        className={`absolute right-5 top-1/2 -translate-y-1/2 px-5 py-3 bg-gradient-to-r from-emerald-600 to-cyan-600 hover:from-emerald-500 hover:to-cyan-500 text-white rounded-xl text-sm font-black shadow-lg ${darkMode ? 'shadow-emerald-500/50' : ''} transition-all`}
                      >
                        MAX
                      </button>
                    </div>
                    <button
                      onClick={handleClaimSpecificAmount}
                      disabled={loading || !withdrawAmount || parseFloat(withdrawAmount) <= 0}
                      className={`px-12 py-6 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded-2xl font-black text-2xl transition-all whitespace-nowrap shadow-xl ${darkMode ? 'shadow-cyan-500/30' : ''} flex items-center gap-3`}
                    >
                      {loading ? '⏳ PROCESSING' : (
                        <>
                          <ArrowUpRight size={28} />
                          WITHDRAW
                        </>
                      )}
                    </button>
                  </div>
                  <div className={`text-sm ${darkMode ? 'text-emerald-400/50' : 'text-emerald-600'} mt-3 text-left font-mono`}>
                    Available: {currentAccrued} HLUSD
                  </div>
                </div>

                <div className="flex items-center gap-6 max-w-3xl mx-auto mb-10">
                  <div className={`flex-1 h-px ${darkMode ? 'bg-emerald-700' : 'bg-emerald-200'}`}></div>
                  <span className={`text-sm ${darkMode ? 'text-emerald-500/50' : 'text-emerald-500'} uppercase tracking-[0.3em] font-black`}>OR</span>
                  <div className={`flex-1 h-px ${darkMode ? 'bg-emerald-700' : 'bg-emerald-200'}`}></div>
                </div>
              </>
            )}
            
            {/* Claim All Button */}
            <button 
              onClick={() => claimSalary()} 
              disabled={loading || parseFloat(currentAccrued) === 0} 
              className={`relative px-20 py-10 bg-gradient-to-r from-emerald-500 via-cyan-500 to-blue-500 rounded-[32px] font-black text-4xl text-white transition-all shadow-2xl ${darkMode ? 'shadow-emerald-500/50' : ''} active:scale-95 flex items-center gap-8 mx-auto disabled:opacity-30 disabled:cursor-not-allowed overflow-hidden group/btn`}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500 via-cyan-500 to-emerald-500 opacity-0 group-hover/btn:opacity-100 transition-opacity"></div>
              <DollarSign size={48} className={`relative z-10 ${loading ? '' : 'animate-bounce'}`} />
              <span className="relative z-10 tracking-wide">{loading ? 'SYNCING...' : 'CLAIM ALL AVAILABLE'}</span>
            </button>
          </div>
        </div>

        {/* Transaction History */}
        <div className="relative group">
          {darkMode && <div className="absolute inset-0 bg-gradient-to-br from-purple-500 to-pink-500 rounded-3xl blur-2xl opacity-20 group-hover:opacity-30 transition-opacity"></div>}
          <div className={`relative ${darkMode ? 'bg-black/60' : 'bg-white'} backdrop-blur-2xl border ${darkMode ? 'border-cyan-500/30' : 'border-purple-200'} rounded-3xl p-12 shadow-2xl overflow-hidden ${darkMode ? 'group-hover:border-purple-400' : 'group-hover:border-purple-300'} transition-all`}>
            <div className="flex items-center gap-5 mb-10">
              <div className="relative">
                {darkMode && <div className="absolute inset-0 bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl blur-lg"></div>}
                <div className={`relative p-4 bg-gradient-to-br ${darkMode ? 'from-purple-500 to-pink-600' : 'from-purple-500 to-pink-500'} rounded-2xl shadow-xl`}>
                  <Clock className="text-white" size={32} />
                </div>
              </div>
              <h3 className={`text-3xl font-black bg-gradient-to-r ${darkMode ? 'from-purple-400 to-pink-400' : 'from-purple-600 to-pink-600'} bg-clip-text text-transparent tracking-tight`}>
                TRANSACTION HISTORY
              </h3>
            </div>

            <div className="space-y-5">
              {transactions.length === 0 ? (
                <div className="text-center py-20">
                  <Activity className={`mx-auto mb-6 ${darkMode ? 'text-purple-500/30' : 'text-purple-300'}`} size={80} />
                  <p className={`text-2xl ${darkMode ? 'text-purple-400/60' : 'text-purple-500'} font-bold mb-3`}>NO TRANSACTIONS YET</p>
                  <p className={`text-sm ${darkMode ? 'text-purple-500/40' : 'text-purple-400'} font-mono tracking-wider`}>YOUR FIRST WITHDRAWAL WILL APPEAR HERE</p>
                </div>
              ) : (
                transactions.map(tx => (
                  <div key={tx.id} className={`relative overflow-hidden rounded-2xl border ${darkMode ? 'border-purple-500/30 hover:bg-purple-500/5' : 'border-purple-200 hover:bg-purple-50'} transition-all group/tx`}>
                    {darkMode && <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 to-pink-500/10 opacity-0 group-hover/tx:opacity-100 transition-opacity"></div>}
                    <div className="relative flex items-center justify-between p-8">
                      <div className="flex items-center gap-6">
                        <div className={`p-4 ${darkMode ? 'bg-emerald-500/10' : 'bg-emerald-100'} rounded-xl`}>
                          <TrendingUp size={28} className={darkMode ? 'text-emerald-400' : 'text-emerald-600'} />
                        </div>
                        <div>
                          <p className={`font-black text-xl mb-1 ${darkMode ? 'text-purple-300' : 'text-purple-700'}`}>{tx.type} Withdrawal</p>
                          <p className={`font-mono text-sm ${darkMode ? 'text-purple-500/50' : 'text-purple-400'}`}>{tx.hash}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className={`font-black text-3xl font-mono bg-gradient-to-r ${darkMode ? 'from-emerald-400 to-cyan-400' : 'from-emerald-600 to-cyan-600'} bg-clip-text text-transparent`}>
                          +{tx.amount} HLUSD
                        </p>
                        <p className={`text-xs font-black ${darkMode ? 'text-purple-500/50' : 'text-purple-400'} uppercase tracking-widest mt-2`}>{tx.date}</p>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Add custom animations */}
      <style jsx>{`
        @keyframes blob {
          0% { transform: translate(0px, 0px) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
          100% { transform: translate(0px, 0px) scale(1); }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
        @keyframes scan {
          0% { transform: translateY(-100%); }
          100% { transform: translateY(100vh); }
        }
        .animate-scan {
          animation: scan 8s linear infinite;
        }
        @keyframes slide-in-right {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
        .animate-slide-in-right {
          animation: slide-in-right 0.3s ease-out;
        }
      `}</style>
    </div>
  );
};

export default PayStreamDashboard;