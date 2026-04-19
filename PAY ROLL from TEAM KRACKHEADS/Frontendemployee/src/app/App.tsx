import { useState, useEffect, useMemo } from 'react';
import { Sidebar } from './components/Sidebar';
import { StatCard } from './components/StatCard';
import { TransactionGraph } from './components/TransactionGraph';
import { TransactionHistory } from './components/TransactionHistory';
import { PersonalSetup } from './components/PersonalSetup';
import { YieldFeatures } from './components/YieldFeatures';
import { getMyProfile, getMyTransactions, getBlockchainConfig, updateMyWallet } from './api';
import { loginAndConnectContract, isConnected, getConnectedAddress, ensureHeLaNetwork } from '../blockchain/web3Auth';
import { ethers } from 'ethers';
import {
  Wallet,
  TrendingUp,
  Calendar,
  Activity,
  ArrowUpRight,
  ArrowDownLeft,
  Clock,
  CreditCard
} from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState('overview');
  const [profile, setProfile] = useState<any>(null);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [contractAddress, setContractAddress] = useState<string | null>(null);
  const [claimableWei, setClaimableWei] = useState<string | null>(null);
  const [withdrawLoading, setWithdrawLoading] = useState(false);
  const [streamRateWei, setStreamRateWei] = useState<string | null>(null);
  const [streamActive, setStreamActive] = useState<boolean | null>(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      window.location.href = '/employee-login';
      return;
    }
    Promise.all([getMyProfile(), getMyTransactions(), getBlockchainConfig()])
      .then(([p, t, cfg]: [any, any, any]) => {
        setProfile(p);
        setTransactions(t || []);
        if (cfg?.contract_address) setContractAddress(cfg.contract_address);
      })
      .catch(() => { })
      .finally(() => setLoading(false));

    if (isConnected()) {
      getConnectedAddress().then((addr) => setWalletAddress(addr));
    }
  }, []);

  async function loadClaimable(addr?: string) {
    const targetAddress = addr ?? walletAddress;
    if (!contractAddress || !targetAddress) return;
    try {
      const { contract } = await loginAndConnectContract(contractAddress);
      const [amount, stream] = await Promise.all([
        contract.claimableAmount(targetAddress),
        contract.streams(targetAddress),
      ]);
      setClaimableWei(amount.toString());
      if (stream) {
        const rate =
          (stream.ratePerSecond && stream.ratePerSecond.toString?.()) ||
          (stream[0] && stream[0].toString?.()) ||
          null;
        const active =
          typeof stream.isActive === 'boolean'
            ? stream.isActive
            : typeof stream[3] === 'boolean'
            ? stream[3]
            : null;
        setStreamRateWei(rate);
        setStreamActive(active);
      }
    } catch {
      setClaimableWei(null);
      setStreamRateWei(null);
      setStreamActive(null);
    }
  }

  useEffect(() => {
    if (walletAddress && contractAddress) {
      loadClaimable();
    }
  }, [walletAddress, contractAddress]);

  async function handleConnectWallet() {
    if (!contractAddress) return;
    try {
      const { address } = await loginAndConnectContract(contractAddress);
      setWalletAddress(address);
      try { await updateMyWallet(address); } catch { }
      await loadClaimable(address);
    } catch (err: any) {
      alert(err?.message || 'Failed to connect wallet');
    }
  }

  async function handleWithdraw() {
    if (!contractAddress || !walletAddress) return;
    setWithdrawLoading(true);
    try {
      const { contract } = await loginAndConnectContract(contractAddress);
      const tx = await contract.withdraw();
      await tx.wait();
      await loadClaimable();
    } catch (err: any) {
      alert(err?.message || 'Withdraw failed');
    } finally {
      setWithdrawLoading(false);
    }
  }

  const totalEarned = profile?.total_earned ?? 0;
  const stats = useMemo(() => {
    const now = new Date();
    const monthlyIncome = transactions
      .filter((t) => {
        const d = new Date(t.timestamp);
        return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
      })
      .reduce((s, t) => s + Number(t.amount), 0);
    const conversionAmount = (totalEarned / 83).toFixed(2);
    return {
      totalBalance: totalEarned,
      monthlyIncome,
      monthlyExpenses: 0,
      nextPayrollDate: '30 March 2026',
      conversionAmount,
      availableBalance: totalEarned,
    };
  }, [transactions, totalEarned]);

  const streamRateInfo = useMemo(() => {
    if (!streamRateWei) return null;
    let perSecond = 0;
    try {
      perSecond = Number(ethers.formatEther(streamRateWei));
    } catch {
      perSecond = 0;
    }
    if (!perSecond) return null;
    const perMonth = perSecond * 30 * 24 * 3600;
    return { perSecond, perMonth };
  }, [streamRateWei]);

  const recentActivities = useMemo(
    () =>
      transactions.slice(0, 5).map((t) => ({
        type: 'income' as const,
        title: t.description || 'Payment',
        amount: Number(t.amount),
        time: formatTimeAgo(t.timestamp),
      })),
    [transactions]
  );

  function formatTimeAgo(ts: string) {
    const d = new Date(ts);
    const now = new Date();
    const diff = now.getTime() - d.getTime();
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);
    if (hours < 1) return 'Just now';
    if (hours < 24) return `${hours} hours ago`;
    if (days < 7) return `${days} days ago`;
    return d.toLocaleDateString();
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'overview':
        return (
          <div className="space-y-6">
            <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 shadow-lg">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-purple-600 text-white flex items-center justify-center text-lg font-bold">
                    {profile?.name ? profile.name.charAt(0).toUpperCase() : 'U'}
                  </div>
                  <div>
                    <p className="text-lg font-semibold text-gray-900">{profile?.name || 'User'}</p>
                    <p className="text-sm text-gray-600">{profile?.email || '—'}</p>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  {!walletAddress ? (
                    <button
                      onClick={handleConnectWallet}
                      className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
                    >
                      Link Wallet
                    </button>
                  ) : (
                    <span className={`px-3 py-2 rounded-lg text-sm ${streamActive ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                      {streamActive ? 'Stream Active' : 'Stream Paused'}
                    </span>
                  )}
                {!walletAddress && (typeof (window as any).ethereum !== 'undefined') && (
                  <button
                    onClick={() => ensureHeLaNetwork((window as any).ethereum)}
                    className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                  >
                    Add HeLa Network (MetaMask)
                  </button>
                )}
                </div>
              </div>
            </div>
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <StatCard
                icon={<Wallet className="w-6 h-6" />}
                title="Total Available Balance"
                value={`₹${stats.availableBalance.toLocaleString()}`}
                subtitle="Current balance"
                iconBg="bg-purple-500"
              />
              <StatCard
                icon={<TrendingUp className="w-6 h-6" />}
                title="Monthly Income"
                value={`₹${stats.monthlyIncome.toLocaleString()}`}
                subtitle="+15% from last month"
                iconBg="bg-green-500"
              />
              <StatCard
                icon={<CreditCard className="w-6 h-6" />}
                title="Monthly Expenses"
                value={`₹${stats.monthlyExpenses.toLocaleString()}`}
                subtitle="-8% from last month"
                iconBg="bg-pink-500"
              />
              <StatCard
                icon={<Calendar className="w-6 h-6" />}
                title="Next Payroll Date"
                value={stats.nextPayrollDate}
                iconBg="bg-cyan-500"
              />
            </div>

            {/* On-Chain Withdraw (Web3Auth + HeLa) */}
            {contractAddress && (
              <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-indigo-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">On-Chain Earnings (HeLa Testnet)</h3>
                {!walletAddress ? (
                  <button
                    onClick={handleConnectWallet}
                    className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                  >
                    Connect Wallet (Web3Auth)
                  </button>
                ) : (
                  <div className="space-y-3">
                    <p className="text-sm text-gray-600">
                      Wallet: {walletAddress.slice(0, 8)}...{walletAddress.slice(-6)}
                    </p>
                    <p className="text-lg font-semibold text-indigo-600">
                      Claimable: {claimableWei ? `${ethers.formatEther(claimableWei)} HLUSD` : '0 HLUSD'}
                    </p>
                    <button
                      onClick={handleWithdraw}
                      disabled={withdrawLoading || !claimableWei || claimableWei === '0'}
                      className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {withdrawLoading ? 'Withdrawing...' : 'Withdraw'}
                    </button>
                  </div>
                )}
                {walletAddress && (
                  <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-3">
                    <button
                      onClick={() => loadClaimable()}
                      className="px-4 py-2 bg-gray-100 text-gray-800 rounded-lg hover:bg-gray-200"
                    >
                      Refresh Stream
                    </button>
                    <a
                      href={
                        (import.meta as any).env?.VITE_HELA_EXPLORER_ADDRESS
                          ? `${(import.meta as any).env.VITE_HELA_EXPLORER_ADDRESS}${walletAddress}`
                          : '#'
                      }
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`px-4 py-2 rounded-lg text-center ${
                        (import.meta as any).env?.VITE_HELA_EXPLORER_ADDRESS
                          ? 'bg-indigo-600 text-white hover:bg-indigo-700'
                          : 'bg-gray-100 text-gray-500 cursor-not-allowed'
                      }`}
                    >
                      View Wallet on HeLa
                    </a>
                    <a
                      href={
                        (import.meta as any).env?.VITE_HELA_EXPLORER_ADDRESS && contractAddress
                          ? `${(import.meta as any).env.VITE_HELA_EXPLORER_ADDRESS}${contractAddress}`
                          : '#'
                      }
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`px-4 py-2 rounded-lg text-center ${
                        (import.meta as any).env?.VITE_HELA_EXPLORER_ADDRESS
                          ? 'bg-purple-600 text-white hover:bg-purple-700'
                          : 'bg-gray-100 text-gray-500 cursor-not-allowed'
                      }`}
                    >
                      View Contract
                    </a>
                  </div>
                )}
                {walletAddress && streamRateInfo && (
                  <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-4">
                      <p className="text-xs text-indigo-700 mb-1">Live Stream Rate</p>
                      <p className="text-sm text-indigo-900 font-semibold">
                        {streamRateInfo.perSecond.toFixed(6)} HLUSD/sec
                      </p>
                      <p className="text-xs text-indigo-600 mt-1">
                        ≈ {streamRateInfo.perMonth.toFixed(2)} HLUSD per 30 days
                      </p>
                      {streamActive === false && (
                        <p className="text-xs text-rose-500 mt-1">Stream is currently paused</p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Conversion Amount Card */}
            <div className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl p-6 text-white shadow-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white/80 text-sm mb-2">Conversion Amount (USD)</p>
                  <p className="text-4xl font-bold mb-1">${stats.conversionAmount.toLocaleString()}</p>
                  <p className="text-white/80 text-sm">≈ ₹{stats.totalBalance.toLocaleString()} INR</p>
                </div>
                <div className="bg-white/20 p-4 rounded-xl backdrop-blur-sm">
                  <Activity className="w-8 h-8" />
                </div>
              </div>
            </div>

            {/* Transaction Graph */}
            <TransactionGraph />

            <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 shadow-lg">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Earnings Timeline</h3>
              <div className="space-y-3">
                {transactions.slice(0, 10).map((t, i) => {
                  const amt = Number(t.amount) || 0;
                  const maxAmt = Math.max(1, ...transactions.slice(0, 10).map((x: any) => Number(x.amount) || 0));
                  const pct = Math.min(100, Math.round((amt / maxAmt) * 100));
                  return (
                    <div key={i} className="flex items-center gap-3">
                      <div className="w-20 text-sm text-gray-600">{new Date(t.timestamp).toLocaleDateString()}</div>
                      <div className="flex-1 h-3 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className="h-3 bg-gradient-to-r from-indigo-500 to-pink-500 rounded-full transition-all duration-700"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                      <div className="w-24 text-right text-sm font-medium">₹{amt.toLocaleString()}</div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 shadow-lg">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-gray-900">Recent Activity</h3>
                <button className="text-purple-600 hover:text-purple-700 text-sm font-medium">
                  View All
                </button>
              </div>
              <div className="space-y-4">
                {recentActivities.map((activity, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div className={`p-3 rounded-lg ${activity.type === 'income'
                          ? 'bg-green-100 text-green-600'
                          : 'bg-red-100 text-red-600'
                        }`}>
                        {activity.type === 'income' ? (
                          <ArrowDownLeft className="w-5 h-5" />
                        ) : (
                          <ArrowUpRight className="w-5 h-5" />
                        )}
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900">{activity.title}</p>
                        <div className="flex items-center gap-2 text-sm text-gray-500">
                          <Clock className="w-3 h-3" />
                          <span>{activity.time}</span>
                        </div>
                      </div>
                    </div>
                    <p className={`font-semibold ${activity.type === 'income' ? 'text-green-600' : 'text-red-600'
                      }`}>
                      {activity.type === 'income' ? '+' : '-'}₹{activity.amount.toLocaleString()}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );

      case 'personal':
        return <PersonalSetup />;

      case 'transactions':
        return (
          <div className="space-y-6">
            <TransactionGraph transactions={transactions} />
            <TransactionHistory transactions={transactions} />
          </div>
        );

      case 'history':
        return <TransactionHistory transactions={transactions} />;

      case 'yield':
        return <YieldFeatures />;

      case 'settings':
        return (
          <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 shadow-lg">
            <h3 className="text-xl font-semibold text-gray-900 mb-6">Settings</h3>
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email Notifications
                </label>
                <div className="flex items-center gap-3">
                  <input type="checkbox" defaultChecked className="w-4 h-4 text-purple-600" />
                  <span className="text-gray-600">Receive transaction alerts</span>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Two-Factor Authentication
                </label>
                <button className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors">
                  Enable 2FA
                </button>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Change Password
                </label>
                <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
                  Update Password
                </button>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-500 via-pink-500 to-purple-600 flex">
      <Sidebar activeTab={activeTab} onTabChange={setActiveTab} />

      <main className="flex-1 p-8 overflow-y-auto">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-white mb-2">
              {activeTab === 'overview' && 'Dashboard Overview'}
              {activeTab === 'personal' && 'Personal Setup'}
              {activeTab === 'transactions' && 'Transactions'}
              {activeTab === 'history' && 'Transaction History'}
              {activeTab === 'yield' && 'Yield & Investments'}
              {activeTab === 'settings' && 'Settings'}
            </h1>
            <p className="text-white/80">
              {activeTab === 'overview' && 'Welcome back! Here\'s your financial overview.'}
              {activeTab === 'personal' && 'Manage your personal information and preferences.'}
              {activeTab === 'transactions' && 'View and analyze your transactions.'}
              {activeTab === 'history' && 'Complete history of all your transactions.'}
              {activeTab === 'yield' && 'Manage your yield accounts and investments.'}
              {activeTab === 'settings' && 'Configure your account settings.'}
            </p>
          </div>

          {loading ? (
            <div className="text-white/80">Loading...</div>
          ) : (
            renderContent()
          )}
        </div>
      </main>
    </div>
  );
}
