import { useState, useEffect, useCallback } from 'react';
import {
    connectWallet,
    getTreasuryBalance,
    getTaxRate,
    getTaxVaultBalance,
    getAllStreams,
    fundContract,
    formatAddress,
} from '../../services/contractService';
import CreateStreamForm from './CreateStreamForm';
import StreamTable from './StreamTable';
import PendingRequests from './PendingRequests';

export default function Dashboard() {
    const [account, setAccount] = useState(null);
    const [stats, setStats] = useState({
        treasury: '0',
        taxRate: 0,
        taxVault: '0',
        streamCount: 0,
    });
    const [streams, setStreams] = useState([]);
    const [refreshTrigger, setRefreshTrigger] = useState(0);
    const [fundAmount, setFundAmount] = useState('');
    const [fundLoading, setFundLoading] = useState(false);

    const loadStats = useCallback(async (isBackground = false) => {
        try {
            const [treasury, taxRate, taxVault, allStreams] = await Promise.all([
                getTreasuryBalance(),
                getTaxRate(),
                getTaxVaultBalance(),
                getAllStreams(),
            ]);

            setStreams(allStreams);

            // Calculate active streams
            const activeCount = allStreams.filter(s => s.active).length;

            setStats({
                treasury,
                taxRate,
                taxVault,
                streamCount: activeCount // Use calculated active count
            });
        } catch (err) {
            console.error('Failed to load stats:', err);
        }
    }, []);

    useEffect(() => {
        if (account) {
            loadStats();
            // Poll every 5 seconds for real-time updates
            const interval = setInterval(() => {
                loadStats(true); // Background refresh
                setRefreshTrigger(prev => prev + 1);
            }, 5000);
            return () => clearInterval(interval);
        }
    }, [account, loadStats]); // Removed refreshTrigger from dependency to avoid loop (though setRefreshTrigger is stable)

    const handleConnect = async () => {
        try {
            const addr = await connectWallet();
            setAccount(addr);
        } catch (err) {
            alert(err.message);
        }
    };

    const handleFund = async () => {
        if (!fundAmount || Number(fundAmount) <= 0) return;
        try {
            setFundLoading(true);
            await fundContract(fundAmount);
            setFundAmount('');
            loadStats();
        } catch (err) {
            console.error('Fund failed:', err);
            alert(err.reason || err.message);
        } finally {
            setFundLoading(false);
        }
    };

    const handleStreamCreated = () => {
        setRefreshTrigger((t) => t + 1);
        loadStats();
    };

    const handleRequestProcessed = () => {
        setRefreshTrigger((t) => t + 1);
        loadStats();
    };

    if (!account) {
        return (
            <div className="app-container">
                <header className="header">
                    <div className="header-brand">
                        <div className="header-logo">P</div>
                        <div>
                            <h1 className="header-title">PayStream</h1>
                            <p className="header-subtitle">HR Dashboard</p>
                        </div>
                    </div>
                </header>
                <div className="not-connected">
                    <div className="not-connected-icon">Locked</div>
                    <h2>Connect Your Wallet</h2>
                    <p>Connect MetaMask to manage payroll streams and fund the treasury.</p>
                    <button className="btn btn-primary" onClick={handleConnect}>
                        Connect MetaMask
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="app-container">
            {/* Header */}
            <header className="header">
                <div className="header-brand">
                    <div className="header-logo">P</div>
                    <div>
                        <h1 className="header-title">PayStream</h1>
                        <p className="header-subtitle">HR Dashboard</p>
                    </div>
                </div>
                <button className="btn-connect connected" onClick={() => setAccount(null)}>
                    <span className="wallet-dot"></span>
                    {formatAddress(account)}
                </button>
            </header>

            {/* Stats */}
            <div className="stats-row">
                <div className="stat-card">
                    <div className="stat-label">Treasury Balance</div>
                    <div className="stat-value">{Number(stats.treasury).toLocaleString(undefined, { maximumFractionDigits: 2 })}</div>
                    <div className="stat-sub">HLUSD Tokens</div>
                </div>
                <div className="stat-card">
                    <div className="stat-label">Active Streams</div>
                    <div className="stat-value">{stats.streamCount}</div>
                    <div className="stat-sub">Total created</div>
                </div>
                <div className="stat-card">
                    <div className="stat-label">Tax Rate</div>
                    <div className="stat-value">{(stats.taxRate / 100).toFixed(1)}%</div>
                    <div className="stat-sub">{stats.taxRate} basis points</div>
                </div>
                <div className="stat-card">
                    <div className="stat-label">Tax Vault</div>
                    <div className="stat-value">{Number(stats.taxVault).toLocaleString(undefined, { maximumFractionDigits: 2 })}</div>
                    <div className="stat-sub">HLUSD Collected</div>
                </div>
            </div>

            {/* Content Grid */}
            <div className="content-grid">
                {/* Left — Create + Fund */}
                <div>
                    <CreateStreamForm onStreamCreated={handleStreamCreated} />

                    {/* Fund Treasury */}
                    <div className="glass-card">
                        <div className="card-header">
                            <h2 className="card-title">
                                Fund Treasury
                            </h2>
                        </div>
                        <div className="form-group">
                            <label className="form-label" htmlFor="fund-amount">Amount (HLUSD)</label>
                            <input
                                id="fund-amount"
                                className="form-input"
                                type="number"
                                min="0"
                                step="any"
                                placeholder="e.g. 10000"
                                value={fundAmount}
                                onChange={(e) => setFundAmount(e.target.value)}
                                disabled={fundLoading}
                            />
                        </div>
                        <button
                            className="btn btn-success"
                            style={{ width: '100%' }}
                            onClick={handleFund}
                            disabled={fundLoading || !fundAmount}
                        >
                            {fundLoading ? (
                                <>
                                    <span className="spinner"></span>
                                    Funding…
                                </>
                            ) : (
                                'Deposit Tokens'
                            )}
                        </button>
                    </div>
                </div>

                {/* Right — Pending Requests + Stream Table */}
                <div>
                    <PendingRequests
                        refreshTrigger={refreshTrigger}
                        onRequestProcessed={handleRequestProcessed}
                    />
                    <StreamTable
                        refreshTrigger={refreshTrigger}
                        streams={streams}
                        onRefresh={() => loadStats(true)}
                    />
                </div>
            </div>
        </div>
    );
}
