import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { 
  Wallet, DollarSign, Users, TrendingUp, Moon, Sun, 
  Plus, Sparkles, CheckCircle, Clock, Zap, Shield, Award, Activity, Heart,
  BarChart3, PieChart, Calendar, Target, FileText, Download, History, Terminal,
  Cpu, Database, Radio, Layers
} from 'lucide-react';
import { CONTRACT_ADDRESS, CONTRACT_ABI } from './contractInfo';
import { getBackendHealth, getBackendStats, getBackendCompliance } from './api/backend';

const HELA_NETWORK = {
  chainId: '0xa2d08',
  chainName: 'HeLa Testnet',
  nativeCurrency: { name: 'HLUSD', symbol: 'HLUSD', decimals: 18 },
  rpcUrls: ['https://testnet-rpc.helachain.com'],
  blockExplorerUrls: ['https://testnet-explorer.helachain.com']
};

const PayStreamDashboard = () => {
  const [darkMode, setDarkMode] = useState(true);
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState(null);
  const [isDemoMode, setIsDemoMode] = useState(false);
  const [currentView, setCurrentView] = useState('dashboard');
  const [account, setAccount] = useState(null);
  const [provider, setProvider] = useState(null);
  const [contract, setContract] = useState(null);
  const [treasuryBalance, setTreasuryBalance] = useState('0');
  const [taxVaultBalance, setTaxVaultBalance] = useState('0');
  const [activeStreams, setActiveStreams] = useState([]);
  const [transactionHistory, setTransactionHistory] = useState([]);
  const [formData, setFormData] = useState({
    employeeAddress: '',
    totalSalary: '',
    duration: ''
  });

  const showNotification = (message, type) => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 5000);
  };

  const loadBackendData = async () => {
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
        const tax = String(complianceResponse.taxRate).replace('%', '');
        setTaxVaultBalance(tax);
      }
    } catch (error) {
      console.warn('Backend not reachable:', error);
    }
  };

  // 🔗 LOAD REAL TRANSACTION HISTORY FROM BLOCKCHAIN
  const loadTransactionHistory = async (contractInstance, providerInstance) => {
    try {
      console.log('📜 Loading transaction history from blockchain...');
      const transactions = [];

      try {
        const onboardFilter = contractInstance.filters.EmployeeOnboarded();
        const onboardEvents = await contractInstance.queryFilter(onboardFilter);
        console.log(`✅ Found ${onboardEvents.length} onboard events`);
        
        for (const event of onboardEvents) {
          const block = await providerInstance.getBlock(event.blockNumber);
          transactions.push({
            id: `onboard-${event.transactionHash}`,
            employee: event.args.employee,
            type: "Onboarded",
            amount: ethers.utils.formatUnits(event.args.yearlySalary, 18),
            timestamp: new Date(block.timestamp * 1000),
            txHash: event.transactionHash
          });
        }
      } catch (error) {
        console.log('⚠️ No onboard events:', error.message);
      }

      try {
        const claimFilter = contractInstance.filters.SalaryClaimed();
        const claimEvents = await contractInstance.queryFilter(claimFilter);
        console.log(`✅ Found ${claimEvents.length} claim events`);
        
        for (const event of claimEvents) {
          const block = await providerInstance.getBlock(event.blockNumber);
          transactions.push({
            id: `claim-${event.transactionHash}`,
            employee: event.args.employee,
            type: "Claimed",
            amount: ethers.utils.formatUnits(event.args.amount, 18),
            timestamp: new Date(block.timestamp * 1000),
            txHash: event.transactionHash
          });
        }
      } catch (error) {
        console.log('⚠️ No claim events:', error.message);
      }

      transactions.sort((a, b) => b.timestamp - a.timestamp);
      console.log(`✅ Total ${transactions.length} transactions loaded`);
      setTransactionHistory(transactions);
      
    } catch (error) {
      console.error('❌ Error loading transaction history:', error);
    }
  };

  // 🔗 LOAD ALL DATA FROM BLOCKCHAIN
  const loadDashboardData = async (contractInstance, userAddress, providerInstance) => {
    if (isDemoMode) {
      setTreasuryBalance("1250.00");
      setTaxVaultBalance("10");
      setActiveStreams([
        {
          id: "demo-1",
          recipient: "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb",
          totalAmount: "12000",
          startTime: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000),
          duration: 365 * 24 * 60 * 60,
          withdrawn: "500.00",
          isPaused: false,
          isCancelled: false
        },
        {
          id: "demo-2",
          recipient: "0x8f3a7d2F891e4c53B6E92C8a5D0f4e92c",
          totalAmount: "9000",
          startTime: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
          duration: 365 * 24 * 60 * 60,
          withdrawn: "250.00",
          isPaused: false,
          isCancelled: false
        },
        {
          id: "demo-3",
          recipient: "0x1bc7A4d8E9f2C3b5D6a7E8f9A0B1C2D4dE",
          totalAmount: "6000",
          startTime: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
          duration: 365 * 24 * 60 * 60,
          withdrawn: "83.33",
          isPaused: true,
          isCancelled: false
        }
      ]);
      setTransactionHistory([
        {
          id: "tx-1",
          employee: "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb",
          type: "Onboarded",
          amount: "12000.00",
          timestamp: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000),
          txHash: "0xabc123def456ghi789jkl012mno345pqr678stu901"
        },
        {
          id: "tx-2",
          employee: "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb",
          type: "Claimed",
          amount: "250.00",
          timestamp: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
          txHash: "0xdef456ghi789jkl012mno345pqr678stu901vwx234"
        },
        {
          id: "tx-3",
          employee: "0x8f3a7d2F891e4c53B6E92C8a5D0f4e92c",
          type: "Onboarded",
          amount: "9000.00",
          timestamp: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
          txHash: "0xghi789jkl012mno345pqr678stu901vwx234yz567"
        }
      ]);
      return;
    }

    try {
      const targetAccount = userAddress || account;
      if (!targetAccount || !contractInstance || !providerInstance) {
        console.log('⚠️ Missing required data');
        return;
      }

      console.log('🔄 Loading real data from HeLa Network...');

      const taxPercent = await contractInstance.TAX_PERCENT();
      setTaxVaultBalance(taxPercent.toString());

      const stream = await contractInstance.employeeStreams(targetAccount);
      const streams = [];
      if (stream.isActive) {
        streams.push({
          id: "1",
          recipient: targetAccount,
          totalAmount: ethers.utils.formatUnits(stream.yearlySalary, 18),
          startTime: new Date(stream.lastClaimTime.toNumber() * 1000),
          duration: 365 * 24 * 60 * 60,
          withdrawn: "0.00",
          isPaused: false,
          isCancelled: false
        });
      }
      
      setActiveStreams(streams);
      await loadTransactionHistory(contractInstance, providerInstance);
      showNotification('✅ Data loaded from blockchain', 'success');

    } catch (error) {
      console.error('❌ Error loading blockchain data:', error);
      showNotification('Error loading data: ' + error.message, 'error');
    }
  };

  // 🔗 CONNECT TO HELA NETWORK
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
          if (switchError.code === 4902) {
            await window.ethereum.request({
              method: 'wallet_addEthereumChain',
              params: [HELA_NETWORK],
            });
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

      setProvider(web3Provider);
      setAccount(accounts[0]);
      setContract(contractInstance);
      
      showNotification('✨ Connected to HeLa Network!', 'success');
      await loadDashboardData(contractInstance, accounts[0], web3Provider);
      
    } catch (error) {
      console.error('❌ Connection error:', error);
      showNotification('Failed to connect: ' + error.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  // 🔗 CREATE STREAM
  const createStream = async (e) => {
    e.preventDefault();
    
    if (isDemoMode) {
      showNotification("🎉 Employee Onboarded (Demo Mode)", "success");
      return;
    }

    if (!contract) {
      showNotification('Please connect wallet first', 'error');
      return;
    }

    try {
      setLoading(true);
      const yearlySalary = ethers.utils.parseUnits(formData.totalSalary, 18);
      const tx = await contract.onboardEmployee(formData.employeeAddress, yearlySalary);
      
      showNotification('⏳ Transaction sent! Waiting for confirmation...', 'info');
      await tx.wait();
      showNotification('🎉 Employee successfully onboarded!', 'success');
      
      setFormData({ employeeAddress: '', totalSalary: '', duration: '' });
      await loadDashboardData(contract, account, provider);
      
    } catch (error) {
      console.error('❌ Transaction error:', error);
      
      if (error.code === 4001) {
        showNotification('Transaction rejected by user', 'error');
      } else if (error.message.includes('owner')) {
        showNotification('Only contract owner can onboard employees', 'error');
      } else {
        showNotification('Transaction failed: ' + error.message, 'error');
      }
    } finally {
      setLoading(false);
    }
  };

  const exportTransactions = () => {
    const csv = [
      ['Date', 'Employee', 'Type', 'Amount (HLUSD)', 'Transaction Hash'],
      ...transactionHistory.map(tx => [
        tx.timestamp.toLocaleDateString(),
        tx.employee,
        tx.type,
        tx.amount,
        tx.txHash
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `paystream-transactions-${Date.now()}.csv`;
    a.click();
    showNotification('📥 Transactions exported!', 'success');
  };

  useEffect(() => {
    loadBackendData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (contract || isDemoMode) {
      loadDashboardData(contract, account, provider);
    }
  }, [isDemoMode, contract, account, provider]);

  const getStreamProgress = (stream) => {
    const now = Date.now();
    const elapsed = now - stream.startTime.getTime();
    return Math.min((elapsed / (stream.duration * 1000)) * 100, 100);
  };

  const getStreamStatus = (stream) => {
    if (stream.isCancelled) return { text: 'TERMINATED', color: 'from-red-500 via-red-600 to-pink-600', textColor: 'text-red-100', glow: 'shadow-red-500/50' };
    if (stream.isPaused) return { text: 'SUSPENDED', color: 'from-yellow-500 via-amber-500 to-orange-500', textColor: 'text-yellow-100', glow: 'shadow-yellow-500/50' };
    return { text: 'ACTIVE', color: 'from-cyan-500 via-blue-500 to-purple-500', textColor: 'text-cyan-100', glow: 'shadow-cyan-500/50' };
  };

  const getTransactionTypeColor = (type) => {
    switch(type) {
      case 'Onboarded': return 'bg-blue-500/20 text-cyan-300 border border-cyan-500/50';
      case 'Claimed': return 'bg-green-500/20 text-emerald-300 border border-emerald-500/50';
      case 'Paused': return 'bg-yellow-500/20 text-yellow-300 border border-yellow-500/50';
      case 'Cancelled': return 'bg-red-500/20 text-red-300 border border-red-500/50';
      default: return 'bg-purple-500/20 text-purple-300 border border-purple-500/50';
    }
  };

  const getAnalyticsData = () => {
    const totalEmployees = activeStreams.length;
    const totalSalaryBudget = activeStreams.reduce((sum, s) => sum + parseFloat(s.totalAmount), 0);
    const totalWithdrawn = activeStreams.reduce((sum, s) => sum + parseFloat(s.withdrawn), 0);
    const averageSalary = totalEmployees > 0 ? totalSalaryBudget / totalEmployees : 0;
    const activeCount = activeStreams.filter(s => !s.isPaused && !s.isCancelled).length;
    const pausedCount = activeStreams.filter(s => s.isPaused).length;
    
    const monthlyProjection = Array.from({ length: 6 }, (_, i) => {
      const month = new Date();
      month.setMonth(month.getMonth() + i);
      return {
        month: month.toLocaleDateString('en-US', { month: 'short' }),
        amount: (totalSalaryBudget / 12) * (i + 1)
      };
    });

    return {
      totalEmployees,
      totalSalaryBudget: totalSalaryBudget.toFixed(2),
      totalWithdrawn: totalWithdrawn.toFixed(2),
      averageSalary: averageSalary.toFixed(2),
      activeCount,
      pausedCount,
      monthlyProjection
    };
  };

  const analytics = getAnalyticsData();

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
            <div className="absolute top-1/2 left-1/2 w-96 h-96 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-pulse"></div>
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
      <div className={`fixed left-0 top-0 h-full w-80 ${darkMode ? 'bg-black/40' : 'bg-white/70'} backdrop-blur-2xl ${darkMode ? 'border-cyan-500/30' : 'border-purple-200'} border-r p-8 z-40 ${darkMode ? 'shadow-2xl shadow-cyan-500/10' : 'shadow-xl'}`}>
        {/* Logo */}
        <div className="mb-10 group cursor-pointer relative">
          {darkMode && <div className="absolute inset-0 bg-gradient-to-r from-cyan-500 via-purple-500 to-pink-500 rounded-2xl blur-xl opacity-50 group-hover:opacity-75 transition-opacity"></div>}
          <div className={`relative flex items-center gap-4 ${darkMode ? 'bg-black/80' : 'bg-white'} backdrop-blur-xl border ${darkMode ? 'border-cyan-500/50' : 'border-purple-300'} rounded-2xl p-4 ${darkMode ? 'group-hover:border-cyan-400' : 'group-hover:border-purple-400'} transition-all`}>
            <div className="relative">
              {darkMode && <div className="absolute inset-0 bg-gradient-to-br from-cyan-400 to-purple-600 rounded-xl blur-md"></div>}
              <div className={`relative w-14 h-14 bg-gradient-to-br ${darkMode ? 'from-cyan-500 to-purple-600' : 'from-purple-400 to-pink-400'} rounded-xl flex items-center justify-center shadow-lg`}>
                <Terminal className="text-white" size={32} />
              </div>
            </div>
            <div>
              <h1 className={`text-2xl font-black ${darkMode ? 'bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400' : 'bg-gradient-to-r from-purple-500 to-pink-500'} bg-clip-text text-transparent tracking-tighter`}>
                PAYSTREAM
              </h1>
              <p className={`text-[10px] ${darkMode ? 'text-cyan-500' : 'text-purple-600'} font-bold tracking-[0.3em] uppercase`}>HeLa Network</p>
            </div>
          </div>
        </div>

        {/* Demo Mode */}
        <div className={`mb-8 p-5 ${darkMode ? 'bg-yellow-500/5' : 'bg-yellow-100'} backdrop-blur-xl border ${darkMode ? 'border-yellow-500/30' : 'border-yellow-300'} rounded-2xl ${darkMode ? 'shadow-lg shadow-yellow-500/10' : 'shadow'}`}>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <Sparkles className="text-yellow-400" size={20} />
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
          <button 
            onClick={() => setCurrentView('dashboard')}
            className={`w-full px-6 py-4 rounded-xl flex items-center gap-4 transition-all duration-300 font-bold text-lg group relative overflow-hidden ${
              currentView === 'dashboard'
                ? darkMode 
                  ? 'bg-gradient-to-r from-cyan-500/20 to-purple-500/20 border-2 border-cyan-500 shadow-lg shadow-cyan-500/30'
                  : 'bg-gradient-to-r from-purple-100 to-pink-100 border-2 border-purple-400 shadow-lg'
                : darkMode
                  ? 'bg-white/5 backdrop-blur-xl border border-cyan-500/20 hover:border-cyan-500/50 hover:bg-white/10'
                  : 'bg-white border border-purple-200 hover:border-purple-300 hover:bg-purple-50'
            }`}
          >
            <div className={`absolute inset-0 ${darkMode ? 'bg-gradient-to-r from-cyan-500 to-purple-500' : 'bg-gradient-to-r from-purple-400 to-pink-400'} opacity-0 group-hover:opacity-10 transition-opacity`}></div>
            <Database size={24} className={currentView === 'dashboard' ? (darkMode ? 'text-cyan-400' : 'text-purple-600') : (darkMode ? 'text-cyan-500/50' : 'text-gray-400')} />
            <span className={currentView === 'dashboard' ? (darkMode ? 'text-cyan-300' : 'text-purple-700') : 'text-gray-400'}>DASHBOARD</span>
            {currentView === 'dashboard' && <div className={`ml-auto w-2 h-2 ${darkMode ? 'bg-cyan-400' : 'bg-purple-500'} rounded-full animate-pulse`}></div>}
          </button>
          
          <button 
            onClick={() => setCurrentView('analytics')}
            className={`w-full px-6 py-4 rounded-xl flex items-center gap-4 transition-all duration-300 font-bold text-lg group relative overflow-hidden ${
              currentView === 'analytics'
                ? darkMode
                  ? 'bg-gradient-to-r from-purple-500/20 to-pink-500/20 border-2 border-purple-500 shadow-lg shadow-purple-500/30'
                  : 'bg-gradient-to-r from-pink-100 to-purple-100 border-2 border-pink-400 shadow-lg'
                : darkMode
                  ? 'bg-white/5 backdrop-blur-xl border border-cyan-500/20 hover:border-cyan-500/50 hover:bg-white/10'
                  : 'bg-white border border-purple-200 hover:border-purple-300 hover:bg-purple-50'
            }`}
          >
            <div className={`absolute inset-0 ${darkMode ? 'bg-gradient-to-r from-purple-500 to-pink-500' : 'bg-gradient-to-r from-pink-400 to-purple-400'} opacity-0 group-hover:opacity-10 transition-opacity`}></div>
            <BarChart3 size={24} className={currentView === 'analytics' ? (darkMode ? 'text-purple-400' : 'text-pink-600') : (darkMode ? 'text-cyan-500/50' : 'text-gray-400')} />
            <span className={currentView === 'analytics' ? (darkMode ? 'text-purple-300' : 'text-pink-700') : 'text-gray-400'}>ANALYTICS</span>
            {currentView === 'analytics' && <div className={`ml-auto w-2 h-2 ${darkMode ? 'bg-purple-400' : 'bg-pink-500'} rounded-full animate-pulse`}></div>}
          </button>
        </nav>

        {/* Theme Toggle */}
        <div className="absolute bottom-8 left-8 right-8">
          <button
            onClick={() => setDarkMode(!darkMode)}
            className={`w-full px-6 py-4 ${darkMode ? 'bg-white/5' : 'bg-white'} backdrop-blur-xl border ${darkMode ? 'border-cyan-500/30' : 'border-purple-200'} rounded-xl flex items-center justify-center gap-3 ${darkMode ? 'hover:border-cyan-400' : 'hover:border-purple-400'} hover:bg-white/10 transition-all font-bold group`}
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
            <h2 className={`text-6xl font-black mb-3 ${darkMode ? 'bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400' : 'bg-gradient-to-r from-purple-500 via-pink-500 to-blue-500'} bg-clip-text text-transparent tracking-tighter`}>
              {currentView === 'dashboard' ? 'HR // OPERATIONS' : 'ANALYTICS // CORE'}
            </h2>
            <p className={`text-xl ${darkMode ? 'text-cyan-400/60' : 'text-purple-600/70'} font-mono tracking-wide flex items-center gap-3`}>
              {darkMode && <Radio size={16} className="animate-pulse" />}
              {currentView === 'dashboard' ? 'Blockchain Payroll Infrastructure' : 'System Performance Metrics'}
            </p>
          </div>
          
          {!account ? (
            <button
              onClick={connectWallet}
              disabled={loading}
              className={`relative px-10 py-5 bg-gradient-to-r ${darkMode ? 'from-cyan-500 to-purple-600' : 'from-purple-500 to-pink-500'} rounded-xl flex items-center gap-4 hover:scale-105 active:scale-95 transition-all ${darkMode ? 'shadow-2xl shadow-cyan-500/50' : 'shadow-xl'} font-black text-xl disabled:opacity-50 overflow-hidden group`}
            >
              <div className={`absolute inset-0 bg-gradient-to-r ${darkMode ? 'from-purple-600 to-pink-600' : 'from-pink-500 to-purple-500'} opacity-0 group-hover:opacity-100 transition-opacity`}></div>
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

        {account || isDemoMode ? (
          currentView === 'analytics' ? (
            /* ANALYTICS VIEW */
            <div className="space-y-10">
              {/* Stats Grid */}
              <div className="grid grid-cols-4 gap-6">
                {[
                  { icon: Users, label: 'EMPLOYEES', value: analytics.totalEmployees, color: 'from-cyan-500 to-blue-500', glow: 'cyan' },
                  { icon: DollarSign, label: 'TOTAL BUDGET', value: analytics.totalSalaryBudget, color: 'from-purple-500 to-pink-500', glow: 'purple' },
                  { icon: TrendingUp, label: 'WITHDRAWN', value: analytics.totalWithdrawn, color: 'from-emerald-500 to-teal-500', glow: 'emerald' },
                  { icon: Target, label: 'AVG SALARY', value: analytics.averageSalary, color: 'from-orange-500 to-red-500', glow: 'orange' }
                ].map((stat, idx) => (
                  <div key={idx} className="relative group">
                    {darkMode && <div className={`absolute inset-0 bg-gradient-to-br ${stat.color} rounded-2xl blur-xl opacity-20 group-hover:opacity-40 transition-opacity`}></div>}
                    <div className={`relative ${darkMode ? 'bg-black/60' : 'bg-white'} backdrop-blur-2xl border ${darkMode ? 'border-cyan-500/30' : 'border-purple-200'} rounded-2xl p-8 shadow-xl ${darkMode ? 'group-hover:border-cyan-400' : 'group-hover:border-purple-400'} transition-all`}>
                      <div className="flex items-center gap-4 mb-5">
                        <div className={`p-3 bg-gradient-to-br ${stat.color} rounded-xl shadow-lg ${darkMode ? `shadow-${stat.glow}-500/50` : ''}`}>
                          <stat.icon className="text-white" size={24} />
                        </div>
                        <span className={`text-xs font-black uppercase tracking-[0.3em] ${darkMode ? 'text-cyan-400' : 'text-purple-600'}`}>{stat.label}</span>
                      </div>
                      <h3 className={`text-5xl font-black bg-gradient-to-r ${stat.color} bg-clip-text text-transparent font-mono`}>
                        {stat.value}
                      </h3>
                    </div>
                  </div>
                ))}
              </div>

              {/* Charts */}
              <div className="grid grid-cols-2 gap-10">
                {/* Projection Chart */}
                <div className="relative group">
                  {darkMode && <div className="absolute inset-0 bg-gradient-to-br from-purple-500 to-pink-500 rounded-3xl blur-2xl opacity-20 group-hover:opacity-30 transition-opacity"></div>}
                  <div className={`relative ${darkMode ? 'bg-black/60' : 'bg-white'} backdrop-blur-2xl border ${darkMode ? 'border-cyan-500/30' : 'border-purple-200'} rounded-3xl p-10 shadow-2xl ${darkMode ? 'group-hover:border-purple-400' : 'group-hover:border-purple-300'} transition-all`}>
                    <div className="flex items-center gap-4 mb-8">
                      <Calendar className={darkMode ? 'text-purple-400' : 'text-purple-600'} size={28} />
                      <h3 className={`text-2xl font-black ${darkMode ? 'text-purple-300' : 'text-purple-700'} tracking-tight`}>6-MONTH PROJECTION</h3>
                    </div>
                    <div className="space-y-5">
                      {analytics.monthlyProjection.map((item, idx) => (
                        <div key={idx} className="space-y-3">
                          <div className="flex justify-between text-sm">
                            <span className={`font-bold ${darkMode ? 'text-purple-400' : 'text-purple-600'} tracking-wider`}>{item.month.toUpperCase()}</span>
                            <span className={`font-mono ${darkMode ? 'text-cyan-300' : 'text-purple-700'} font-black`}>{item.amount.toFixed(2)} HLUSD</span>
                          </div>
                          <div className={`h-4 ${darkMode ? 'bg-purple-950/50' : 'bg-purple-100'} rounded-full overflow-hidden border ${darkMode ? 'border-purple-500/30' : 'border-purple-300'} shadow-inner`}>
                            <div 
                              className={`h-full bg-gradient-to-r from-cyan-500 via-purple-500 to-pink-500 rounded-full transition-all duration-1000 ${darkMode ? 'shadow-lg shadow-purple-500/50' : ''}`}
                              style={{ width: `${(item.amount / analytics.monthlyProjection[5].amount) * 100}%` }}
                            ></div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Status Chart */}
                <div className="relative group">
                  {darkMode && <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-3xl blur-2xl opacity-20 group-hover:opacity-30 transition-opacity"></div>}
                  <div className={`relative ${darkMode ? 'bg-black/60' : 'bg-white'} backdrop-blur-2xl border ${darkMode ? 'border-cyan-500/30' : 'border-blue-200'} rounded-3xl p-10 shadow-2xl ${darkMode ? 'group-hover:border-cyan-400' : 'group-hover:border-blue-300'} transition-all`}>
                    <div className="flex items-center gap-4 mb-8">
                      <PieChart className={darkMode ? 'text-cyan-400' : 'text-blue-600'} size={28} />
                      <h3 className={`text-2xl font-black ${darkMode ? 'text-cyan-300' : 'text-blue-700'} tracking-tight`}>STREAM STATUS</h3>
                    </div>
                    <div className="space-y-6">
                      {[
                        { label: 'ACTIVE', count: analytics.activeCount, color: 'emerald', gradient: 'from-emerald-500 to-teal-500' },
                        { label: 'PAUSED', count: analytics.pausedCount, color: 'yellow', gradient: 'from-yellow-500 to-orange-500' },
                        { label: 'TOTAL', count: analytics.totalEmployees, color: 'cyan', gradient: 'from-cyan-500 to-blue-500' }
                      ].map((status, idx) => (
                        <div key={idx} className={`relative overflow-hidden rounded-2xl border ${darkMode ? `border-${status.color}-500/30` : `border-${status.color}-300`} ${darkMode ? `shadow-lg shadow-${status.color}-500/20` : 'shadow'} ${darkMode ? `hover:shadow-${status.color}-500/40` : ''} transition-all group/item`}>
                          <div className={`absolute inset-0 bg-gradient-to-r ${status.gradient} ${darkMode ? 'opacity-10' : 'opacity-5'} group-hover/item:opacity-20 transition-opacity`}></div>
                          <div className="relative flex items-center justify-between p-6">
                            <div className="flex items-center gap-4">
                              <div className={`w-4 h-4 bg-${status.color}-400 rounded-full ${darkMode ? `shadow-lg shadow-${status.color}-500/50` : ''} animate-pulse`}></div>
                              <span className={`font-black ${darkMode ? `text-${status.color}-300` : `text-${status.color}-700`} tracking-wider text-lg`}>{status.label}</span>
                            </div>
                            <span className={`text-4xl font-black font-mono bg-gradient-to-r ${status.gradient} bg-clip-text text-transparent`}>
                              {status.count}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Tax Analytics */}
              <div className="relative group">
                {darkMode && <div className="absolute inset-0 bg-gradient-to-br from-purple-500 via-pink-500 to-orange-500 rounded-3xl blur-2xl opacity-20 group-hover:opacity-30 transition-opacity"></div>}
                <div className={`relative ${darkMode ? 'bg-black/60' : 'bg-white'} backdrop-blur-2xl border ${darkMode ? 'border-cyan-500/30' : 'border-purple-200'} rounded-3xl p-10 shadow-2xl ${darkMode ? 'group-hover:border-purple-400' : 'group-hover:border-purple-300'} transition-all`}>
                  <div className="flex items-center gap-4 mb-10">
                    <div className={`p-4 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl shadow-lg ${darkMode ? 'shadow-purple-500/50' : ''}`}>
                      <Shield className="text-white" size={32} />
                    </div>
                    <h3 className={`text-3xl font-black bg-gradient-to-r ${darkMode ? 'from-purple-400 to-pink-400' : 'from-purple-600 to-pink-600'} bg-clip-text text-transparent tracking-tight`}>
                      TAX VAULT ANALYTICS
                    </h3>
                  </div>
                  <div className="grid grid-cols-3 gap-8">
                    {[
                      { label: 'TAX RATE', value: `${taxVaultBalance}%`, color: 'from-purple-500 to-pink-500' },
                      { label: 'COLLECTED', value: (parseFloat(analytics.totalWithdrawn) * 0.1).toFixed(2), color: 'from-pink-500 to-red-500' },
                      { label: 'PROJECTED (6M)', value: (parseFloat(analytics.totalSalaryBudget) * 0.1 / 2).toFixed(2), color: 'from-orange-500 to-yellow-500' }
                    ].map((item, idx) => (
                      <div key={idx} className="relative group/card">
                        {darkMode && <div className={`absolute inset-0 bg-gradient-to-br ${item.color} rounded-2xl blur-xl opacity-30 group-hover/card:opacity-50 transition-opacity`}></div>}
                        <div className={`relative text-center p-8 ${darkMode ? 'bg-black/80' : 'bg-gradient-to-br from-purple-50 to-pink-50'} backdrop-blur-xl border ${darkMode ? 'border-cyan-500/20' : 'border-purple-200'} rounded-2xl ${darkMode ? 'group-hover/card:border-cyan-400' : 'group-hover/card:border-purple-400'} transition-all`}>
                          <p className={`text-xs font-black ${darkMode ? 'text-cyan-400' : 'text-purple-600'} mb-4 tracking-[0.3em] uppercase`}>{item.label}</p>
                          <h4 className={`text-5xl font-black font-mono bg-gradient-to-r ${item.color} bg-clip-text text-transparent`}>
                            {item.value}
                          </h4>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            /* DASHBOARD VIEW */
            <>
              {/* Stats Cards */}
              <div className="grid grid-cols-2 gap-8 mb-12">
                <div className="relative group">
                  {darkMode && <div className="absolute inset-0 bg-gradient-to-br from-cyan-500 to-blue-500 rounded-3xl blur-2xl opacity-30 group-hover:opacity-50 transition-opacity"></div>}
                  <div className={`relative ${darkMode ? 'bg-black/60' : 'bg-white'} backdrop-blur-2xl border ${darkMode ? 'border-cyan-500/30' : 'border-blue-200'} rounded-3xl p-10 shadow-2xl ${darkMode ? 'group-hover:border-cyan-400 group-hover:scale-105' : 'group-hover:border-blue-400 group-hover:scale-105'} transition-all`}>
                    <div className="flex items-center justify-between mb-8">
                      <span className={`text-sm font-black uppercase tracking-[0.3em] ${darkMode ? 'text-cyan-400' : 'text-blue-600'}`}>TREASURY</span>
                      <div className={`p-4 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-2xl shadow-lg ${darkMode ? 'shadow-cyan-500/50' : ''}`}>
                        <DollarSign size={32} className="text-white" />
                      </div>
                    </div>
                    <h3 className={`text-6xl font-black mb-4 bg-gradient-to-r ${darkMode ? 'from-cyan-400 to-blue-400' : 'from-cyan-600 to-blue-600'} bg-clip-text text-transparent font-mono`}>
                      {treasuryBalance}
                    </h3>
                    <div className="flex items-center gap-3 text-lg">
                      <div className={`w-3 h-3 bg-emerald-400 rounded-full animate-pulse ${darkMode ? 'shadow-lg shadow-emerald-500/50' : ''}`}></div>
                      <span className={`${darkMode ? 'text-emerald-400' : 'text-emerald-600'} font-bold tracking-wide`}>ONLINE</span>
                      <span className={`${darkMode ? 'text-cyan-500/50' : 'text-blue-400'} ml-auto font-mono`}>HLUSD</span>
                    </div>
                  </div>
                </div>

                <div className="relative group">
                  {darkMode && <div className="absolute inset-0 bg-gradient-to-br from-purple-500 to-pink-500 rounded-3xl blur-2xl opacity-30 group-hover:opacity-50 transition-opacity"></div>}
                  <div className={`relative ${darkMode ? 'bg-black/60' : 'bg-white'} backdrop-blur-2xl border ${darkMode ? 'border-purple-500/30' : 'border-purple-200'} rounded-3xl p-10 shadow-2xl ${darkMode ? 'group-hover:border-purple-400 group-hover:scale-105' : 'group-hover:border-purple-400 group-hover:scale-105'} transition-all`}>
                    <div className="flex items-center justify-between mb-8">
                      <span className={`text-sm font-black uppercase tracking-[0.3em] ${darkMode ? 'text-purple-400' : 'text-purple-600'}`}>TAX VAULT</span>
                      <div className={`p-4 bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl shadow-lg ${darkMode ? 'shadow-purple-500/50' : ''}`}>
                        <Shield size={32} className="text-white" />
                      </div>
                    </div>
                    <h3 className={`text-6xl font-black mb-4 bg-gradient-to-r ${darkMode ? 'from-purple-400 to-pink-400' : 'from-purple-600 to-pink-600'} bg-clip-text text-transparent font-mono`}>
                      {taxVaultBalance}%
                    </h3>
                    <p className={`text-lg ${darkMode ? 'text-purple-400/80' : 'text-purple-600'} font-bold tracking-wide`}>AUTO-DEDUCTION</p>
                  </div>
                </div>
              </div>

              {/* Onboarding Form */}
              <div className="relative group mb-12">
                {darkMode && <div className="absolute inset-0 bg-gradient-to-br from-cyan-500 via-purple-500 to-pink-500 rounded-3xl blur-2xl opacity-20 group-hover:opacity-30 transition-opacity"></div>}
                <div className={`relative ${darkMode ? 'bg-black/60' : 'bg-white'} backdrop-blur-2xl border ${darkMode ? 'border-cyan-500/30' : 'border-purple-200'} rounded-3xl p-12 shadow-2xl ${darkMode ? 'group-hover:border-cyan-400' : 'group-hover:border-purple-300'} transition-all`}>
                  <div className="flex items-center gap-5 mb-10">
                    <div className="relative">
                      {darkMode && <div className="absolute inset-0 bg-gradient-to-br from-cyan-500 to-purple-600 rounded-2xl blur-lg"></div>}
                      <div className={`relative p-4 bg-gradient-to-br ${darkMode ? 'from-cyan-500 to-purple-600' : 'from-purple-500 to-pink-500'} rounded-2xl shadow-xl`}>
                        <Plus className="text-white" size={32} />
                      </div>
                    </div>
                    <h3 className={`text-3xl font-black bg-gradient-to-r ${darkMode ? 'from-cyan-400 to-purple-400' : 'from-purple-600 to-pink-600'} bg-clip-text text-transparent tracking-tight`}>
                      ONBOARD NEW EMPLOYEE
                    </h3>
                  </div>
                  
                  <form onSubmit={createStream} className="grid grid-cols-3 gap-8">
                    <div className="space-y-4">
                      <label className={`text-xs font-black uppercase tracking-[0.3em] ${darkMode ? 'text-cyan-400' : 'text-purple-600'} ml-2 flex items-center gap-2`}>
                        <div className={`w-1 h-1 ${darkMode ? 'bg-cyan-400' : 'bg-purple-500'} rounded-full`}></div>
                        WALLET ADDRESS
                      </label>
                      <input
                        type="text"
                        placeholder="0x..."
                        value={formData.employeeAddress}
                        onChange={(e) => setFormData({ ...formData, employeeAddress: e.target.value })}
                        className={`w-full px-6 py-5 ${darkMode ? 'bg-black/80' : 'bg-white'} backdrop-blur-xl border-2 ${darkMode ? 'border-cyan-500/30 focus:border-cyan-400 focus:ring-cyan-500/20' : 'border-purple-200 focus:border-purple-400 focus:ring-purple-200'} rounded-2xl focus:ring-4 outline-none transition-all font-mono text-xl ${darkMode ? 'text-cyan-300 placeholder-cyan-700' : 'text-purple-700 placeholder-purple-300'}`}
                        required
                      />
                    </div>
                    
                    <div className="space-y-4">
                      <label className={`text-xs font-black uppercase tracking-[0.3em] ${darkMode ? 'text-purple-400' : 'text-pink-600'} ml-2 flex items-center gap-2`}>
                        <div className={`w-1 h-1 ${darkMode ? 'bg-purple-400' : 'bg-pink-500'} rounded-full`}></div>
                        YEARLY SALARY (HLUSD)
                      </label>
                      <input
                        type="number"
                        placeholder="12000"
                        value={formData.totalSalary}
                        onChange={(e) => setFormData({ ...formData, totalSalary: e.target.value })}
                        className={`w-full px-6 py-5 ${darkMode ? 'bg-black/80' : 'bg-white'} backdrop-blur-xl border-2 ${darkMode ? 'border-purple-500/30 focus:border-purple-400 focus:ring-purple-500/20' : 'border-pink-200 focus:border-pink-400 focus:ring-pink-200'} rounded-2xl focus:ring-4 outline-none transition-all text-xl font-bold ${darkMode ? 'text-purple-300 placeholder-purple-700' : 'text-pink-700 placeholder-pink-300'}`}
                        required
                      />
                    </div>
                    
                    <div className="space-y-4 flex flex-col justify-end">
                      <button
                        type="submit"
                        disabled={loading}
                        className={`relative w-full py-5 bg-gradient-to-r ${darkMode ? 'from-cyan-500 via-purple-500 to-pink-500' : 'from-purple-500 to-pink-500'} rounded-2xl font-black text-xl text-white transition-all shadow-2xl active:scale-95 disabled:opacity-50 overflow-hidden group/btn`}
                      >
                        <div className={`absolute inset-0 bg-gradient-to-r ${darkMode ? 'from-pink-500 via-purple-500 to-cyan-500' : 'from-pink-500 to-purple-500'} opacity-0 group-hover/btn:opacity-100 transition-opacity`}></div>
                        <span className="relative z-10 tracking-wide">
                          {loading ? '⏳ PROCESSING' : '🚀 INITIALIZE STREAM'}
                        </span>
                      </button>
                    </div>
                  </form>
                </div>
              </div>

              {/* Active Streams */}
              <div className="relative group mb-12">
                {darkMode && <div className="absolute inset-0 bg-gradient-to-br from-purple-500 to-pink-500 rounded-3xl blur-2xl opacity-20 group-hover:opacity-30 transition-opacity"></div>}
                <div className={`relative ${darkMode ? 'bg-black/60' : 'bg-white'} backdrop-blur-2xl border ${darkMode ? 'border-cyan-500/30' : 'border-purple-200'} rounded-3xl p-12 shadow-2xl overflow-hidden ${darkMode ? 'group-hover:border-purple-400' : 'group-hover:border-purple-300'} transition-all`}>
                  <h3 className={`text-3xl font-black mb-10 bg-gradient-to-r ${darkMode ? 'from-cyan-400 via-purple-400 to-pink-400' : 'from-purple-600 via-pink-600 to-blue-600'} bg-clip-text text-transparent tracking-tight`}>
                    ACTIVE SALARY STREAMS
                  </h3>
                  
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className={`border-b-2 ${darkMode ? 'border-cyan-500/30' : 'border-purple-200'}`}>
                          <th className={`pb-6 px-8 text-left text-xs uppercase font-black tracking-[0.3em] ${darkMode ? 'text-cyan-400' : 'text-purple-600'}`}>EMPLOYEE</th>
                          <th className={`pb-6 px-8 text-left text-xs uppercase font-black tracking-[0.3em] ${darkMode ? 'text-cyan-400' : 'text-purple-600'}`}>RATE</th>
                          <th className={`pb-6 px-8 text-left text-xs uppercase font-black tracking-[0.3em] ${darkMode ? 'text-cyan-400' : 'text-purple-600'}`}>WITHDRAWN</th>
                          <th className={`pb-6 px-8 text-left text-xs uppercase font-black tracking-[0.3em] ${darkMode ? 'text-cyan-400' : 'text-purple-600'}`}>PROGRESS</th>
                          <th className={`pb-6 px-8 text-left text-xs uppercase font-black tracking-[0.3em] ${darkMode ? 'text-cyan-400' : 'text-purple-600'}`}>STATUS</th>
                        </tr>
                      </thead>
                      <tbody>
                        {activeStreams.length === 0 ? (
                          <tr>
                            <td colSpan="5" className="py-20 text-center">
                              <Users className={`mx-auto mb-6 ${darkMode ? 'text-cyan-500/30' : 'text-purple-300'}`} size={80} />
                              <p className={`text-2xl ${darkMode ? 'text-cyan-400/60' : 'text-purple-500'} font-bold mb-3`}>NO ACTIVE STREAMS</p>
                              <p className={`text-sm ${darkMode ? 'text-cyan-500/40' : 'text-purple-400'} font-mono tracking-wider`}>INITIALIZE EMPLOYEE ONBOARDING</p>
                            </td>
                          </tr>
                        ) : (
                          activeStreams.map((stream) => {
                            const status = getStreamStatus(stream);
                            const progress = getStreamProgress(stream);
                            return (
                              <tr key={stream.id} className={`border-b ${darkMode ? 'border-cyan-500/10 hover:bg-cyan-500/5' : 'border-purple-100 hover:bg-purple-50'} transition-all group/row`}>
                                <td className="py-10 px-8">
                                  <span className={`font-mono font-black text-xl bg-gradient-to-r ${darkMode ? 'from-cyan-400 to-purple-400' : 'from-purple-600 to-pink-600'} bg-clip-text text-transparent`}>
                                    {stream.recipient.slice(0, 10)}...{stream.recipient.slice(-8)}
                                  </span>
                                </td>
                                <td className="py-10 px-8">
                                  <span className={`font-black text-2xl ${darkMode ? 'text-purple-300' : 'text-purple-700'}`}>{stream.totalAmount}</span>
                                  <span className={`${darkMode ? 'text-cyan-500/50' : 'text-purple-400'} ml-2 text-sm font-mono`}>HLUSD</span>
                                </td>
                                <td className="py-10 px-8">
                                  <span className={`font-mono font-black text-2xl ${darkMode ? 'text-emerald-400' : 'text-emerald-600'}`}>{stream.withdrawn}</span>
                                </td>
                                <td className="py-10 px-8">
                                  <div className="flex items-center gap-5">
                                    <div className={`flex-1 h-4 ${darkMode ? 'bg-cyan-950/50' : 'bg-purple-100'} rounded-full overflow-hidden border ${darkMode ? 'border-cyan-500/30' : 'border-purple-300'} shadow-inner`}>
                                      <div 
                                        className={`h-full bg-gradient-to-r from-cyan-500 via-purple-500 to-pink-500 rounded-full transition-all duration-1000 ${darkMode ? 'shadow-lg shadow-cyan-500/50' : ''}`}
                                        style={{ width: `${progress}%` }}
                                      ></div>
                                    </div>
                                    <span className={`text-lg font-black ${darkMode ? 'text-cyan-400' : 'text-purple-600'} w-20 text-right font-mono`}>{progress.toFixed(1)}%</span>
                                  </div>
                                </td>
                                <td className="py-10 px-8">
                                  <div className="relative inline-block">
                                    {darkMode && <div className={`absolute inset-0 bg-gradient-to-r ${status.color} rounded-full blur-lg ${status.glow} shadow-xl`}></div>}
                                    <span className={`relative px-6 py-3 bg-gradient-to-r ${status.color} rounded-full text-xs font-black uppercase ${status.textColor} tracking-wider shadow-lg border border-white/20`}>
                                      {status.text}
                                    </span>
                                  </div>
                                </td>
                              </tr>
                            );
                          })
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>

              {/* Transaction History */}
              <div className="relative group">
                {darkMode && <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-3xl blur-2xl opacity-20 group-hover:opacity-30 transition-opacity"></div>}
                <div className={`relative ${darkMode ? 'bg-black/60' : 'bg-white'} backdrop-blur-2xl border ${darkMode ? 'border-cyan-500/30' : 'border-blue-200'} rounded-3xl p-12 shadow-2xl overflow-hidden ${darkMode ? 'group-hover:border-cyan-400' : 'group-hover:border-blue-300'} transition-all`}>
                  <div className="flex items-center justify-between mb-10">
                    <div className="flex items-center gap-5">
                      <div className="relative">
                        {darkMode && <div className="absolute inset-0 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-2xl blur-lg"></div>}
                        <div className={`relative p-4 bg-gradient-to-br ${darkMode ? 'from-cyan-500 to-blue-600' : 'from-blue-500 to-cyan-500'} rounded-2xl shadow-xl`}>
                          <History className="text-white" size={32} />
                        </div>
                      </div>
                      <h3 className={`text-3xl font-black bg-gradient-to-r ${darkMode ? 'from-cyan-400 to-blue-400' : 'from-blue-600 to-cyan-600'} bg-clip-text text-transparent tracking-tight`}>
                        TRANSACTION HISTORY
                      </h3>
                    </div>
                    
                    <button
                      onClick={exportTransactions}
                      disabled={transactionHistory.length === 0}
                      className={`relative px-8 py-4 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-xl font-black flex items-center gap-3 hover:scale-105 transition-all ${darkMode ? 'shadow-xl shadow-emerald-500/30' : 'shadow-lg'} disabled:opacity-30 disabled:cursor-not-allowed overflow-hidden group/btn`}
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-teal-500 to-cyan-500 opacity-0 group-hover/btn:opacity-100 transition-opacity"></div>
                      <Download size={24} className="relative z-10 text-white" />
                      <span className="relative z-10 tracking-wide text-white">EXPORT CSV</span>
                    </button>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className={`border-b-2 ${darkMode ? 'border-cyan-500/30' : 'border-blue-200'}`}>
                          <th className={`pb-6 px-8 text-left text-xs uppercase font-black tracking-[0.3em] ${darkMode ? 'text-cyan-400' : 'text-blue-600'}`}>DATE</th>
                          <th className={`pb-6 px-8 text-left text-xs uppercase font-black tracking-[0.3em] ${darkMode ? 'text-cyan-400' : 'text-blue-600'}`}>EMPLOYEE</th>
                          <th className={`pb-6 px-8 text-left text-xs uppercase font-black tracking-[0.3em] ${darkMode ? 'text-cyan-400' : 'text-blue-600'}`}>TYPE</th>
                          <th className={`pb-6 px-8 text-left text-xs uppercase font-black tracking-[0.3em] ${darkMode ? 'text-cyan-400' : 'text-blue-600'}`}>AMOUNT</th>
                          <th className={`pb-6 px-8 text-left text-xs uppercase font-black tracking-[0.3em] ${darkMode ? 'text-cyan-400' : 'text-blue-600'}`}>HASH</th>
                        </tr>
                      </thead>
                      <tbody>
                        {transactionHistory.length === 0 ? (
                          <tr>
                            <td colSpan="5" className="py-20 text-center">
                              <FileText className={`mx-auto mb-6 ${darkMode ? 'text-cyan-500/30' : 'text-blue-300'}`} size={80} />
                              <p className={`text-2xl ${darkMode ? 'text-cyan-400/60' : 'text-blue-500'} font-bold mb-3`}>NO TRANSACTIONS</p>
                              <p className={`text-sm ${darkMode ? 'text-cyan-500/40' : 'text-blue-400'} font-mono tracking-wider`}>
                                {isDemoMode ? '> DISABLE DEMO MODE FOR LIVE DATA' : '> WAITING FOR BLOCKCHAIN EVENTS'}
                              </p>
                            </td>
                          </tr>
                        ) : (
                          transactionHistory.map((tx) => (
                            <tr key={tx.id} className={`border-b ${darkMode ? 'border-cyan-500/10 hover:bg-cyan-500/5' : 'border-blue-100 hover:bg-blue-50'} transition-all`}>
                              <td className="py-8 px-8">
                                <span className={`font-bold ${darkMode ? 'text-cyan-300' : 'text-blue-700'} text-lg`}>
                                  {tx.timestamp.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                </span>
                                <br />
                                <span className={`text-xs ${darkMode ? 'text-cyan-500/50' : 'text-blue-400'} font-mono`}>
                                  {tx.timestamp.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                                </span>
                              </td>
                              <td className="py-8 px-8">
                                <span className={`font-mono text-lg font-bold ${darkMode ? 'text-purple-400' : 'text-purple-600'}`}>
                                  {tx.employee.slice(0, 10)}...{tx.employee.slice(-8)}
                                </span>
                              </td>
                              <td className="py-8 px-8">
                                <span className={`px-4 py-2 ${getTransactionTypeColor(tx.type)} rounded-lg text-xs font-black uppercase tracking-wider`}>
                                  {tx.type}
                                </span>
                              </td>
                              <td className="py-8 px-8">
                                <span className={`font-mono font-black text-2xl ${darkMode ? 'text-emerald-400' : 'text-emerald-600'}`}>
                                  {tx.amount}
                                </span>
                                <span className={`${darkMode ? 'text-cyan-500/50' : 'text-blue-400'} ml-2 text-sm`}>HLUSD</span>
                              </td>
                              <td className="py-8 px-8">
                                <a 
                                  href={`https://testnet-explorer.helachain.com/tx/${tx.txHash}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className={`font-mono text-sm ${darkMode ? 'text-cyan-400 hover:text-cyan-300' : 'text-blue-600 hover:text-blue-700'} underline underline-offset-4 transition-colors`}
                                >
                                  {tx.txHash.slice(0, 12)}...{tx.txHash.slice(-8)}
                                </a>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </>
          )
        ) : (
          /* CONNECT WALLET SCREEN */
          <div className="relative">
            {darkMode && <div className="absolute inset-0 bg-gradient-to-br from-cyan-500 via-purple-500 to-pink-500 rounded-3xl blur-3xl opacity-20 animate-pulse"></div>}
            <div className={`relative ${darkMode ? 'bg-black/60' : 'bg-white'} backdrop-blur-2xl border-2 ${darkMode ? 'border-cyan-500/30' : 'border-purple-200'} rounded-3xl p-32 text-center shadow-2xl`}>
              <div className="relative mb-12 inline-block">
                {darkMode && <div className="absolute inset-0 bg-gradient-to-r from-cyan-500 via-purple-500 to-pink-500 rounded-full blur-3xl opacity-50 animate-pulse"></div>}
                <div className={`relative w-40 h-40 bg-gradient-to-br ${darkMode ? 'from-cyan-500 via-purple-500 to-pink-500' : 'from-purple-500 via-pink-500 to-blue-500'} rounded-full flex items-center justify-center ${darkMode ? 'shadow-2xl shadow-cyan-500/50' : 'shadow-xl'} animate-float`}>
                  <Wallet className="text-white" size={80} />
                </div>
              </div>
              
              <h3 className={`text-6xl font-black mb-6 bg-gradient-to-r ${darkMode ? 'from-cyan-400 via-purple-400 to-pink-400' : 'from-purple-600 via-pink-600 to-blue-600'} bg-clip-text text-transparent tracking-tighter`}>
                SYSTEM LOCKED
              </h3>
              <p className={`text-2xl ${darkMode ? 'text-cyan-400/70' : 'text-purple-600/70'} max-w-2xl mx-auto mb-14 font-mono tracking-wide`}>
                INITIALIZE WEB3 CONNECTION TO ACCESS PAYROLL NETWORK
              </p>
              
              <button
                onClick={connectWallet}
                className={`relative px-16 py-8 bg-gradient-to-r ${darkMode ? 'from-cyan-500 via-purple-500 to-pink-500' : 'from-purple-500 via-pink-500 to-blue-500'} rounded-2xl font-black text-3xl text-white hover:scale-105 active:scale-95 transition-all shadow-2xl inline-flex items-center gap-6 overflow-hidden group`}
              >
                <div className={`absolute inset-0 bg-gradient-to-r ${darkMode ? 'from-pink-500 via-purple-500 to-cyan-500' : 'from-blue-500 via-pink-500 to-purple-500'} opacity-0 group-hover:opacity-100 transition-opacity`}></div>
                <Zap size={36} className="relative z-10" />
                <span className="relative z-10 tracking-wide">ESTABLISH CONNECTION</span>
              </button>
            </div>
          </div>
        )}
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
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-20px); }
        }
        .animate-float {
          animation: float 3s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
};

export default PayStreamDashboard;