import React, { useState, useEffect, useMemo } from 'react';
import Swal from 'sweetalert2';
import { useAuth } from '../context/AuthContext';
import { streamAPI } from '../api/api';
import { withdraw } from '../utils/web3Service';
import { useNavigate } from 'react-router-dom';
import Button from '../components/Button';
import Card, { CardHeader, CardBody } from '../components/Card';
import {
    Wallet, LogOut, DollarSign, TrendingUp, Download, Clock,
    Activity, Eye, EyeOff, Copy, Check, ArrowDownToLine, Receipt,
    ArrowLeftRight, FileDown
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import './EmployeeDashboard.css';

// Precision scaling (1e18)
const PRECISION = 10n ** 18n;

// Formatting helper
const formatWei = (weiBigInt) => {
    if (!weiBigInt || weiBigInt === 0n) return "0.00000000";
    const value = Number(weiBigInt) / 1e18;
    return value.toFixed(8);
};

const EmployeeDashboard = () => {
    const { user, logout, walletAddress, connectWallet } = useAuth();
    const navigate = useNavigate();
    const [showBalance, setShowBalance] = useState(true);
    const [copied, setCopied] = useState(false);
    const [connectingWallet, setConnectingWallet] = useState(false);
    const [activeTab, setActiveTab] = useState('overview');

    // Data States
    const [streams, setStreams] = useState([]);
    const [loading, setLoading] = useState(true);
    const [liveClaimable, setLiveClaimable] = useState({}); // streamId -> amount (BigInt)

    const [transactions, setTransactions] = useState([]);
    const [isWithdrawingAll, setIsWithdrawingAll] = useState(false);
    const [withdrawingStreamId, setWithdrawingStreamId] = useState(null);

    // Filter states
    const [filterMonth, setFilterMonth] = useState('all');
    const [filterYear, setFilterYear] = useState(new Date().getFullYear().toString());
    const [filterType, setFilterType] = useState('all');

    const fetchUserStreams = async () => {
        if (!walletAddress) return;
        try {
            const [streamsData, txData] = await Promise.all([
                streamAPI.getUserStreams(walletAddress),
                streamAPI.getUserTransactions(walletAddress)
            ]);
            setStreams(streamsData);
            setTransactions(txData);
        } catch (error) {
            console.error("Failed to fetch user streams", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUserStreams();
    }, [walletAddress]);

    // Live counter logic
    useEffect(() => {
        if (streams.length === 0) return;

        const timer = setInterval(() => {
            try {
                const newClaimable = {};
                const now = BigInt(Math.floor(Date.now() / 1000));
                const SECONDS_IN_PRECISION = 10n ** 18n;

                streams.forEach(stream => {
                    if (!stream.startTime || !stream.ratePerSecond) {
                        newClaimable[stream.streamId] = 0n;
                        return;
                    }

                    try {
                        const startTime = BigInt(stream.startTime);
                        const endTime = BigInt(stream.endTime || startTime);
                        const ratePerSecond = BigInt(stream.ratePerSecond);
                        const deposit = BigInt(stream.deposit || 0);
                        const withdrawn = BigInt(stream.withdrawn || 0);
                        const totalPaused = BigInt(stream.totalPausedDuration || 0);

                        // Vesting logic: Calculate effective time based on state
                        let effectiveTime = now;

                        if (stream.state === 'Paused' || stream.state === 'Active') {
                            // While active or paused, we calculate up to now
                            // The contract handles the precise pause duration subtraction
                            effectiveTime = now;
                        } else {
                            // For Completed/Cancelled, we stop at endTime
                            effectiveTime = endTime;
                        }

                        const adjustedEnd = endTime + totalPaused;
                        const actualEffective = effectiveTime > adjustedEnd ? adjustedEnd : effectiveTime;

                        const actualElapsed = actualEffective - startTime - totalPaused;

                        if (actualElapsed <= 0n) {
                            newClaimable[stream.streamId] = 0n;
                        } else {
                            let totalVested;

                            if (stream.streamType === 'OneTime') {
                                // Cliff logic: 0 until the very end, then 100%
                                // We check if current time reached the adjusted end time
                                if (actualEffective >= adjustedEnd) {
                                    totalVested = deposit;
                                } else {
                                    totalVested = 0n;
                                }
                            } else {
                                // Continuous logic: linear streaming
                                // Note: ratePerSecond from DB is already scaled to Wei per second
                                totalVested = actualElapsed * ratePerSecond;
                            }

                            const cappedVested = totalVested > deposit ? deposit : totalVested;
                            const claimable = cappedVested > withdrawn ? cappedVested - withdrawn : 0n;
                            newClaimable[stream.streamId] = claimable;
                        }
                    } catch (e) {
                        console.error(`Error calculating for stream ${stream.streamId}:`, e);
                        newClaimable[stream.streamId] = 0n;
                    }
                });
                setLiveClaimable(newClaimable);
            } catch (globalErr) {
                console.error("Live counter calculation error:", globalErr);
            }
        }, 1000);

        return () => clearInterval(timer);
    }, [streams]);

    useEffect(() => {
        if (!user || user.role !== 'employee') {
            navigate('/');
        }
    }, [user, navigate]);

    // Mock data for visualizations - restore these
    const earningsHistory = useMemo(() => {
        if (!transactions.length) return [
            { date: 'Initial', amount: 0 }
        ];

        // Group withdrawals by date
        const withdrawalMap = {};
        transactions
            .filter(tx => tx.type === 'Withdrawal')
            .forEach(tx => {
                const date = new Date(tx.timestamp || tx.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
                const amt = Number(BigInt(tx.amount || 0)) / 1e18;
                withdrawalMap[date] = (withdrawalMap[date] || 0) + amt;
            });

        const sortedEntries = Object.entries(withdrawalMap)
            .sort((a, b) => new Date(a[0]) - new Date(b[0]))
            .map(([date, amount]) => ({ date, amount }));

        return sortedEntries.length > 0 ? sortedEntries : [
            { date: 'Initial', amount: 0 }
        ];
    }, [transactions]);

    const filteredTransactions = useMemo(() => {
        return transactions.filter(tx => {
            const date = new Date(tx.timestamp || tx.date);
            const matchesMonth = filterMonth === 'all' || (date.getMonth() + 1).toString() === filterMonth;
            const matchesYear = filterYear === 'all' || date.getFullYear().toString() === filterYear;
            const matchesType = filterType === 'all' || tx.type === filterType;
            return matchesMonth && matchesYear && matchesType;
        }).sort((a, b) => new Date(b.timestamp || b.date) - new Date(a.timestamp || a.date));
    }, [transactions, filterMonth, filterYear, filterType]);

    const handleExportTransactions = () => {
        if (filteredTransactions.length === 0) {
            Swal.fire({ icon: 'info', title: 'No Data', text: 'No transactions found for the current filters', background: '#1a1a1a', color: '#fff' });
            return;
        }

        const headers = ["Date", "Type", "Amount (HLUSD)", "Status"];
        const csvRows = filteredTransactions.map(tx => [
            new Date(tx.timestamp || tx.date).toLocaleString(),
            tx.type,
            tx.amount ? formatWei(BigInt(tx.amount)) : '0',
            tx.status || 'Completed'
        ]);

        const csvContent = [headers, ...csvRows].map(row => row.join(',')).join('\n');
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement("a");
        const url = URL.createObjectURL(blob);
        link.setAttribute("href", url);
        link.setAttribute("download", `my_transactions_${filterMonth}_${filterYear}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    const handleConnectWallet = async () => {
        setConnectingWallet(true);
        const result = await connectWallet();
        if (!result.success) {
            Swal.fire({
                icon: 'error',
                title: 'Connection Failed',
                text: result.error,
                background: '#1a1a1a',
                color: '#fff'
            });
        }
        setConnectingWallet(false);
    };

    const handleCopyAddress = () => {
        if (walletAddress) {
            navigator.clipboard.writeText(walletAddress);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };

    const handleWithdraw = async (streamId) => {
        if (!walletAddress) {
            Swal.fire({ icon: 'warning', title: 'Wallet Disconnected', text: 'Please connect your wallet first', background: '#1a1a1a', color: '#fff' });
            return;
        }

        setWithdrawingStreamId(streamId);
        try {
            await Swal.fire({
                title: 'Confirm Withdrawal',
                text: "Are you sure you want to withdraw your claimable funds from this stream?",
                icon: 'question',
                showCancelButton: true,
                confirmButtonColor: '#10b981',
                cancelButtonColor: '#ef4444',
                confirmButtonText: 'Yes, withdraw!',
                background: '#1a1a1a',
                color: '#fff'
            }).then(async (result) => {
                if (result.isConfirmed) {
                    Swal.fire({
                        title: 'Processing...',
                        text: 'Please confirm the transaction in your wallet',
                        allowOutsideClick: false,
                        didOpen: () => Swal.showLoading(),
                        background: '#1a1a1a',
                        color: '#fff'
                    });

                    const tx = await withdraw(streamId);

                    Swal.fire({
                        icon: 'success',
                        title: 'Success!',
                        text: `Withdrawal successful! Hash: ${tx.hash.slice(0, 10)}...`,
                        background: '#1a1a1a',
                        color: '#fff',
                        timer: 3000
                    });

                    setTimeout(fetchUserStreams, 3000);
                }
            });
        } catch (error) {
            console.error('Withdrawal failed:', error);
            Swal.fire({
                icon: 'error',
                title: 'Withdrawal Failed',
                text: error.reason || error.message || "Unknown error",
                background: '#1a1a1a',
                color: '#fff'
            });
        } finally {
            setWithdrawingStreamId(null);
        }
    };

    const handleWithdrawAll = async () => {
        const streamsWithFunds = streams.filter(s => (liveClaimable[s.streamId] || 0n) > 0n);

        if (streamsWithFunds.length === 0) {
            Swal.fire({ icon: 'info', title: 'No Funds', text: 'You have no claimable funds in any stream.', background: '#1a1a1a', color: '#fff' });
            return;
        }

        const confirm = await Swal.fire({
            title: `Withdraw from ${streamsWithFunds.length} Streams?`,
            text: "This will initiate multiple transactions to claim all your available funds.",
            icon: 'question',
            showCancelButton: true,
            confirmButtonText: 'Yes, withdraw all',
            background: '#1a1a1a',
            color: '#fff'
        });

        if (confirm.isConfirmed) {
            setIsWithdrawingAll(true);
            try {
                for (const stream of streamsWithFunds) {
                    try {
                        Swal.fire({
                            title: `Withdrawing Stream #${stream.streamId}`,
                            text: 'Confirming in wallet...',
                            allowOutsideClick: false,
                            didOpen: () => Swal.showLoading(),
                            background: '#1a1a1a',
                            color: '#fff'
                        });
                        const tx = await withdraw(stream.streamId);
                        console.log(`Withdrawn stream ${stream.streamId}, hash: ${tx.hash}`);
                    } catch (err) {
                        console.error(`Failed to withdraw stream ${stream.streamId}`, err);
                        // Continue to next or stop? Let's show error and allow moving on
                        const res = await Swal.fire({
                            title: 'Withdrawal Failed',
                            text: `Stream #${stream.streamId} failed: ${err.message}. Continue with others?`,
                            icon: 'error',
                            showCancelButton: true,
                            confirmButtonText: 'Continue',
                            background: '#1a1a1a',
                            color: '#fff'
                        });
                        if (!res.isConfirmed) break;
                    }
                }
                Swal.fire({ icon: 'success', title: 'Batch Completed', text: 'All requests processed.', background: '#1a1a1a', color: '#fff' });
                setTimeout(fetchUserStreams, 2000);
            } finally {
                setIsWithdrawingAll(false);
            }
        }
    };

    const [exchangeAmount, setExchangeAmount] = useState('');
    const EXCHANGE_RATE = 1.0; // 1 USD = 1.0 HLUSD (Stablecoin)

    const handleExchange = () => {
        if (!walletAddress) {
            Swal.fire({ icon: 'warning', title: 'Wallet Disconnected', text: 'Please connect your wallet first', background: '#1a1a1a', color: '#fff' });
            return;
        }
        if (!exchangeAmount || parseFloat(exchangeAmount) <= 0) {
            Swal.fire({ icon: 'info', text: 'Please enter a valid amount', background: '#1a1a1a', color: '#fff' });
            return;
        }
        const amount = parseFloat(exchangeAmount);
        const totalClaimable = Object.values(liveClaimable).reduce((acc, v) => acc + v, 0n);
        if (BigInt(Math.floor(amount * 1e18)) > totalClaimable) {
            Swal.fire({ icon: 'error', title: 'Insufficient Balance', text: 'You do not have enough claimable balance.', background: '#1a1a1a', color: '#fff' });
            return;
        }
        const hlusdAmount = (amount * EXCHANGE_RATE).toFixed(2);
        Swal.fire({
            title: 'Bank Transfer Initiated!',
            text: `Sent $${(amount * 2).toLocaleString()} to your bank account!`,
            icon: 'success',
            background: '#1a1a1a',
            color: '#fff'
        });
        setExchangeAmount('');
    };

    return (
        <div className="employee-dashboard-container">
            {/* Header */}
            <header className="employee-header">
                <div className="header-content">
                    <div className="header-left">
                        <div className="logo-section">
                            <div className="logo-icon-small">
                                <Wallet size={20} />
                            </div>
                            <span className="logo-text-small">StreamPay</span>
                        </div>
                    </div>

                    <div className="header-right">
                        {walletAddress ? (
                            <div className="wallet-badge">
                                <div className="wallet-info">
                                    <span className="wallet-label">Wallet</span>
                                    <span className="wallet-address-display">
                                        {walletAddress.slice(0, 6)}...{walletAddress.slice(-4)}
                                    </span>
                                </div>
                                <button className="copy-btn" onClick={handleCopyAddress}>
                                    {copied ? <Check size={14} /> : <Copy size={14} />}
                                </button>
                            </div>
                        ) : (
                            <Button
                                variant="success"
                                onClick={handleConnectWallet}
                                loading={connectingWallet}
                                icon={<Wallet size={16} />}
                                size="sm"
                            >
                                Connect Wallet
                            </Button>
                        )}
                        <Button variant="ghost" size="sm" onClick={handleLogout} icon={<LogOut size={16} />}>
                            Logout
                        </Button>
                    </div>
                </div>
            </header>

            <div className="employee-layout">
                {/* Sidebar */}
                <aside className="employee-sidebar">
                    <div className="sidebar-section">
                        <h4 className="sidebar-title">Navigation</h4>
                        <nav className="sidebar-nav">
                            <button
                                className={`nav-item ${activeTab === 'overview' ? 'active' : ''}`}
                                onClick={() => setActiveTab('overview')}
                            >
                                <TrendingUp size={18} />
                                <span>Overview</span>
                            </button>
                            <button
                                className={`nav-item ${activeTab === 'streams' ? 'active' : ''}`}
                                onClick={() => setActiveTab('streams')}
                            >
                                <Activity size={18} />
                                <span>Active Streams</span>
                            </button>
                            <button
                                className={`nav-item ${activeTab === 'transactions' ? 'active' : ''}`}
                                onClick={() => setActiveTab('transactions')}
                            >
                                <Receipt size={18} />
                                <span>Transactions</span>
                            </button>
                            <button
                                className={`nav-item ${activeTab === 'exchange' ? 'active' : ''}`}
                                onClick={() => setActiveTab('exchange')}
                            >
                                <ArrowLeftRight size={18} />
                                <span>Exchange</span>
                            </button>
                        </nav>
                    </div>

                    <div className="sidebar-section">
                        <h4 className="sidebar-title">Quick Actions</h4>
                        <div className="sidebar-actions">
                            <Button
                                variant="success"
                                size="sm"
                                fullWidth
                                onClick={handleWithdrawAll}
                                loading={isWithdrawingAll}
                                disabled={!walletAddress}
                                icon={<Download size={16} />}
                            >
                                Withdraw All
                            </Button>
                        </div>
                    </div>

                    <div className="sidebar-section">
                        <h4 className="sidebar-title">Account Info</h4>
                        <div className="account-info">
                            <div className="info-row">
                                <span className="info-label">Wallet</span>
                                <span className="info-value mono-text text-xs">
                                    {walletAddress ? `${walletAddress.slice(0, 6)}...${walletAddress.slice(-4)}` : 'Disconnected'}
                                </span>
                            </div>
                            <div className="info-row">
                                <span className="info-label">Current Rate</span>
                                <span className="info-value">
                                    {formatWei(streams.filter(s => s.state === 'Active').reduce((acc, s) => acc + BigInt(s.ratePerSecond), 0n) * 3600n)} HLUSD/hr
                                </span>
                            </div>
                        </div>
                    </div>
                </aside>

                {/* Main Content */}
                <main className="employee-main">
                    {activeTab === 'overview' && (
                        <div className="overview-section animate-fade-in">
                            <div className="welcome-section">
                                <h1>Welcome back, {user?.name}!</h1>
                                <p>Track your real-time earnings and manage your payments</p>
                            </div>

                            {/* Balance Cards */}
                            <div className="balance-cards-grid">
                                <Card className="balance-card" hover>
                                    <div className="balance-card-header">
                                        <div className="balance-icon success">
                                            <DollarSign size={24} />
                                        </div>
                                        <button
                                            className="visibility-toggle"
                                            onClick={() => setShowBalance(!showBalance)}
                                        >
                                            {showBalance ? <Eye size={16} /> : <EyeOff size={16} />}
                                        </button>
                                    </div>
                                    <div className="balance-info">
                                        <p className="balance-label">Total Withdrawn</p>
                                        <h2 className="balance-amount">
                                            {showBalance ? `${formatWei(streams.reduce((acc, s) => acc + BigInt(s.withdrawn), 0n))} HLUSD` : '••••••'}
                                        </h2>
                                        <span className="balance-subtext">Lifetime earnings from all streams</span>
                                    </div>
                                </Card>

                                <Card className="balance-card" hover>
                                    <div className="balance-card-header">
                                        <div className="balance-icon primary">
                                            <ArrowDownToLine size={24} />
                                        </div>
                                    </div>
                                    <div className="balance-info">
                                        <p className="balance-label">Available to Withdraw</p>
                                        <h2 className="balance-amount">
                                            {showBalance ? `${formatWei(Object.values(liveClaimable).reduce((acc, v) => acc + v, 0n))} HLUSD` : '••••••'}
                                        </h2>
                                        <span className="balance-subtext">
                                            {streams.some(s => s.state === 'Active') && <span className="pulse-dot"></span>}
                                            Vested funds ready for withdrawal
                                        </span>
                                    </div>
                                </Card>

                                <Card className="balance-card" hover>
                                    <div className="balance-card-header">
                                        <div className="balance-icon warning">
                                            <Clock size={24} />
                                        </div>
                                    </div>
                                    <div className="balance-info">
                                        <p className="balance-label">Streaming Rate</p>
                                        <h2 className="balance-amount">
                                            {formatWei(streams.filter(s => s.state === 'Active').reduce((acc, s) => acc + BigInt(s.ratePerSecond), 0n) * 3600n)} HLUSD/hr
                                        </h2>
                                        <span className="balance-subtext">
                                            Estimated monthly: {formatWei(streams.filter(s => s.state === 'Active').reduce((acc, s) => acc + BigInt(s.ratePerSecond), 0n) * 3600n * 24n * 30n)} HLUSD
                                        </span>
                                    </div>
                                </Card>
                            </div>

                            {/* Earnings Chart */}
                            <Card className="earnings-chart-card">
                                <CardHeader>
                                    <h3>Earnings History</h3>
                                    <p>Last 7 weeks overview</p>
                                </CardHeader>
                                <CardBody>
                                    <ResponsiveContainer width="100%" height={280}>
                                        <LineChart data={earningsHistory}>
                                            <CartesianGrid strokeDasharray="3 3" stroke="var(--gray-200)" />
                                            <XAxis dataKey="date" stroke="var(--gray-400)" style={{ fontSize: '12px' }} />
                                            <YAxis stroke="var(--gray-400)" style={{ fontSize: '12px' }} />
                                            <Tooltip
                                                contentStyle={{
                                                    background: 'var(--white)',
                                                    border: '1px solid var(--gray-200)',
                                                    borderRadius: '8px',
                                                    fontSize: '12px',
                                                }}
                                            />
                                            <Line
                                                type="monotone"
                                                dataKey="amount"
                                                stroke="var(--success)"
                                                strokeWidth={2}
                                                dot={{ fill: 'var(--success)', r: 4 }}
                                            />
                                        </LineChart>
                                    </ResponsiveContainer>
                                </CardBody>
                            </Card>

                            {/* Latest 3 Transactions Summary */}
                            <Card className="latest-transactions-card mt-6">
                                <CardHeader>
                                    <div className="flex justify-between items-center w-full">
                                        <h3>Recent Transactions</h3>
                                        <Button variant="ghost" size="sm" onClick={() => setActiveTab('transactions')}>View All</Button>
                                    </div>
                                </CardHeader>
                                <CardBody>
                                    <div className="transactions-list-compact">
                                        {transactions.slice(0, 3).map((tx) => (
                                            <div key={tx._id || tx.id} className="tx-item-compact">
                                                <div className="tx-icon">
                                                    <Receipt size={18} />
                                                </div>
                                                <div className="tx-details">
                                                    <span className="tx-type">{tx.type}</span>
                                                    <span className="tx-date">{new Date(tx.timestamp || tx.date).toLocaleDateString()}</span>
                                                </div>
                                                <div className="tx-amount success">
                                                    {tx.amount ? `+${formatWei(BigInt(tx.amount))}` : '0'}
                                                </div>
                                            </div>
                                        ))}
                                        {transactions.length === 0 && (
                                            <p className="empty-msg">No transactions found yet.</p>
                                        )}
                                    </div>
                                </CardBody>
                            </Card>
                        </div>
                    )}

                    {activeTab === 'streams' && (
                        <div className="streams-section animate-fade-in">
                            <h2 className="section-title">All Payment Streams</h2>
                            <p className="section-subtitle">Monitor and manage all your historical and incoming streams</p>

                            <div className="streams-list">
                                {streams.length === 0 ? (
                                    <div className="empty-state">
                                        <Activity size={48} />
                                        <p>No payment streams found for your wallet.</p>
                                    </div>
                                ) : (
                                    streams.map(stream => (
                                        <Card key={stream.streamId} className="stream-card">
                                            <div className="stream-header">
                                                <div className="stream-info">
                                                    <h4>Payroll Stream #{stream.streamId}</h4>
                                                    <span className={`status-badge status-${stream.state.toLowerCase()}`}>
                                                        {stream.state === 'Active' && <span className="pulse-dot"></span>}
                                                        {stream.state}
                                                    </span>
                                                </div>
                                                <div className="stream-amount">
                                                    <span className="amount-label">Total Deposit</span>
                                                    <span className="amount-value">{formatWei(BigInt(stream.deposit))} HLUSD</span>
                                                </div>
                                            </div>
                                            <div className="stream-details">
                                                <div className="detail-item">
                                                    <span className="detail-label">Started</span>
                                                    <span className="detail-value">{new Date(stream.startTime * 1000).toLocaleDateString()}</span>
                                                </div>
                                                <div className="detail-item highlighted">
                                                    <span className="detail-label">Claimable Now</span>
                                                    <span className="detail-value mono-text live-counter">
                                                        {formatWei(liveClaimable[stream.streamId] || 0n)} HLUSD
                                                    </span>
                                                </div>
                                                <div className="detail-item">
                                                    <span className="detail-label">Withdrawn</span>
                                                    <span className="detail-value">{formatWei(BigInt(stream.withdrawn))} HLUSD</span>
                                                </div>
                                            </div>
                                            <div className="stream-actions">
                                                <Button
                                                    variant="success"
                                                    size="sm"
                                                    onClick={() => handleWithdraw(stream.streamId)}
                                                    loading={withdrawingStreamId === stream.streamId}
                                                    disabled={!walletAddress}
                                                    icon={<Download size={14} />}
                                                >
                                                    Withdraw Claimable
                                                </Button>
                                            </div>
                                        </Card>
                                    ))
                                )}
                            </div>
                        </div>
                    )}

                    {activeTab === 'transactions' && (
                        <div className="transactions-section animate-fade-in">
                            <div className="flex justify-between items-center mb-6">
                                <div>
                                    <h2 className="section-title">Transaction History</h2>
                                    <p className="section-subtitle">All your payment transactions</p>
                                </div>
                                <div className="flex gap-2">
                                    <select className="filter-select" value={filterYear} onChange={(e) => setFilterYear(e.target.value)}>
                                        <option value="all">All Years</option>
                                        <option value="2024">2024</option>
                                        <option value="2025">2025</option>
                                        <option value="2026">2026</option>
                                    </select>
                                    <select className="filter-select" value={filterMonth} onChange={(e) => setFilterMonth(e.target.value)}>
                                        <option value="all">All Months</option>
                                        {['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'].map((m, i) => (
                                            <option key={m} value={(i + 1).toString()}>{m}</option>
                                        ))}
                                    </select>
                                    <select className="filter-select" value={filterType} onChange={(e) => setFilterType(e.target.value)}>
                                        <option value="all">All Types</option>
                                        <option value="Withdrawal">Withdrawal</option>
                                        <option value="StreamCreated">Stream Created</option>
                                    </select>
                                    <Button variant="secondary" size="sm" onClick={handleExportTransactions} icon={<FileDown size={16} />}>
                                        Export CSV
                                    </Button>
                                </div>
                            </div>

                            <Card>
                                <div className="table-container">
                                    <table className="data-table">
                                        <thead>
                                            <tr>
                                                <th>Date</th>
                                                <th>Type</th>
                                                <th>Amount</th>
                                                <th>Status</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {filteredTransactions.length === 0 ? (
                                                <tr>
                                                    <td colSpan="4" className="text-center py-8 opacity-50">No transactions found matching filters</td>
                                                </tr>
                                            ) : (
                                                filteredTransactions.map(tx => (
                                                    <tr key={tx._id || tx.id}>
                                                        <td>{new Date(tx.timestamp || tx.date).toLocaleDateString()}</td>
                                                        <td>{tx.type}</td>
                                                        <td className="amount-cell">
                                                            {tx.amount ? `${formatWei(BigInt(tx.amount))} HLUSD` : '-'}
                                                        </td>
                                                        <td>
                                                            <span className="status-badge status-completed">
                                                                {tx.status || 'Completed'}
                                                            </span>
                                                        </td>
                                                    </tr>
                                                ))
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </Card>
                        </div>
                    )}
                    {activeTab === 'exchange' && (
                        <div className="exchange-section animate-fade-in">
                            <h2 className="section-title">Token Exchange</h2>
                            <p className="section-subtitle">Seamlessly convert your streaming earnings to fiat currency</p>

                            <div className="exchange-container">
                                <Card className="exchange-card">
                                    <div className="exchange-header-v2">
                                        <div className="exchange-title-group">
                                            <h3>Convert HLUSD</h3>
                                            <span className="exchange-status-online">
                                                <span className="pulse-dot"></span>
                                                Bank Gateway Live
                                            </span>
                                        </div>
                                        <div className="exchange-rate-v2">
                                            <span>Exchange Rate</span>
                                            <strong>1 HLUSD = $2.00 USD</strong>
                                        </div>
                                    </div>

                                    <div className="swap-interface">
                                        <div className="swap-box">
                                            <div className="swap-box-header">
                                                <span className="swap-label">You Sell</span>
                                                <button
                                                    className="max-btn"
                                                    onClick={() => {
                                                        const total = formatWei(Object.values(liveClaimable).reduce((acc, v) => acc + v, 0n));
                                                        setExchangeAmount(total);
                                                    }}
                                                >
                                                    MAX
                                                </button>
                                            </div>
                                            <div className="swap-input-row">
                                                <input
                                                    type="number"
                                                    value={exchangeAmount}
                                                    onChange={(e) => setExchangeAmount(e.target.value)}
                                                    placeholder="0.00"
                                                    className="swap-input"
                                                />
                                                <div className="token-selector">
                                                    <div className="token-icon-mini hl-logo">H</div>
                                                    <span className="token-name">HLUSD</span>
                                                </div>
                                            </div>
                                            <div className="swap-balance">
                                                Balance: {formatWei(Object.values(liveClaimable).reduce((acc, v) => acc + v, 0n))} HLUSD
                                            </div>
                                        </div>

                                        <div className="swap-arrow-container">
                                            <div className="swap-arrow-pill">
                                                <ArrowDownToLine size={20} />
                                            </div>
                                        </div>

                                        <div className="swap-box second">
                                            <div className="swap-box-header">
                                                <span className="swap-label">You Receive (Estimate)</span>
                                            </div>
                                            <div className="swap-input-row">
                                                <input
                                                    type="text"
                                                    value={exchangeAmount ? (parseFloat(exchangeAmount) * 2).toFixed(2) : '0.00'}
                                                    readOnly
                                                    className="swap-input"
                                                />
                                                <div className="token-selector">
                                                    <div className="token-icon-mini usd-logo">$</div>
                                                    <span className="token-name">USD</span>
                                                </div>
                                            </div>
                                            <div className="swap-balance">
                                                Target: Linked Bank Account
                                            </div>
                                        </div>

                                        <div className="exchange-details-v2">
                                            <div className="detail-row-v2">
                                                <span>Exchange Fee (0%)</span>
                                                <span className="fee-free">Free</span>
                                            </div>
                                            <div className="detail-row-v2">
                                                <span>Estimated Arrival</span>
                                                <span>Instant / ~1-2 mins</span>
                                            </div>
                                            <div className="detail-row-v2 total">
                                                <span>Total to Bank</span>
                                                <strong>${exchangeAmount ? (parseFloat(exchangeAmount) * 2).toFixed(2) : '0.00'} USD</strong>
                                            </div>
                                        </div>

                                        <Button
                                            variant="success"
                                            size="lg"
                                            fullWidth
                                            onClick={handleExchange}
                                            disabled={!walletAddress || !exchangeAmount || parseFloat(exchangeAmount) <= 0}
                                            icon={<ArrowLeftRight size={20} />}
                                            className="swap-submit-btn"
                                        >
                                            Withdraw to Bank
                                        </Button>
                                    </div>
                                </Card>
                            </div>
                        </div>
                    )}
                </main>
            </div>
        </div>
    );
};

export default EmployeeDashboard;
