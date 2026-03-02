import { useState, useEffect, useCallback } from 'react';
import {
    connectWallet,
    getEmployeeStreams,
    withdraw,
    getTokenBalance,
    formatAddress,
    formatRate,
    ethers,
    requestStreamStart,
    getMyPendingRequests,
} from '../services/contractService';
import EarningsDisplay from './EarningsDisplay';

export default function EmployeeDashboard() {
    const [account, setAccount] = useState(null);
    const [streams, setStreams] = useState([]);
    const [selectedStream, setSelectedStream] = useState(null);
    const [balance, setBalance] = useState('0');
    const [loading, setLoading] = useState(false);
    const [withdrawLoading, setWithdrawLoading] = useState({});
    const [pendingRequests, setPendingRequests] = useState([]);
    const [showRequestForm, setShowRequestForm] = useState(false);
    const [requestRate, setRequestRate] = useState('');
    const [requestLoading, setRequestLoading] = useState(false);


    const loadData = useCallback(async (address) => {
        try {
            setLoading(true);
            const [myStreams, tokenBalance, myRequests] = await Promise.all([
                getEmployeeStreams(address),
                getTokenBalance(address),
                getMyPendingRequests(address),
            ]);
            setStreams(myStreams);
            setBalance(tokenBalance);
            setPendingRequests(myRequests);
            // Auto-select first active stream for earnings display
            const active = myStreams.find((s) => s.active);
            if (active && !selectedStream) {
                setSelectedStream(active);
            }
        } catch (err) {
            console.error('Failed to load employee data:', err);
        } finally {
            setLoading(false);
        }
    }, [selectedStream]);

    useEffect(() => {
        if (account) {
            loadData(account);
            const interval = setInterval(() => loadData(account), 15000);
            return () => clearInterval(interval);
        }
    }, [account, loadData]);

    const handleConnect = async () => {
        try {
            const addr = await connectWallet();
            setAccount(addr);
        } catch (err) {
            alert(err.message);
        }
    };

    const handleWithdraw = async (streamId) => {
        setWithdrawLoading((p) => ({ ...p, [streamId]: true }));
        try {
            await withdraw(streamId);
            if (account) await loadData(account);
        } catch (err) {
            console.error('Withdraw failed:', err);
            alert(err.reason || err.message || 'Withdrawal failed');
        } finally {
            setWithdrawLoading((p) => ({ ...p, [streamId]: false }));
        }
    };

    const handleRequestStream = async () => {
        if (!requestRate || Number(requestRate) <= 0) {
            alert('Please enter a valid rate');
            return;
        }
        setRequestLoading(true);
        try {
            await requestStreamStart(requestRate);
            setRequestRate('');
            setShowRequestForm(false);
            if (account) await loadData(account);
            alert('Stream request submitted! Wait for HR approval.');
        } catch (err) {
            console.error('Request failed:', err);
            alert(err.reason || err.message || 'Request failed');
        } finally {
            setRequestLoading(false);
        }
    };


    if (!account) {
        return (
            <div className="app-container">
                <header className="header">
                    <div className="header-brand">
                        <div className="header-logo">P</div>
                        <div>
                            <h1 className="header-title">PayStream</h1>
                            <p className="header-subtitle">Employee Portal</p>
                        </div>
                    </div>
                </header>
                <div className="not-connected">
                    <div className="not-connected-icon">👛</div>
                    <h2>Connect Your Wallet</h2>
                    <p>Connect MetaMask to view your salary streams and withdraw earnings.</p>
                    <button className="btn-connect" onClick={handleConnect}>
                        🦊 Connect MetaMask
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
                        <p className="header-subtitle">Employee Portal</p>
                    </div>
                </div>
                <button className="btn-connect connected" onClick={() => setAccount(null)}>
                    <span className="wallet-dot"></span>
                    {formatAddress(account)}
                </button>
            </header>

            {/* Wallet Balance */}
            <div className="glass-card" style={{ textAlign: 'center', paddingTop: '1rem', paddingBottom: '1rem' }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 600 }}>
                    Wallet Balance
                </span>
                <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-primary)', marginTop: '0.25rem' }}>
                    {Number(balance).toLocaleString(undefined, { maximumFractionDigits: 4 })} PST
                </div>
            </div>

            {/* Selected Stream Earnings */}
            {selectedStream && (
                <EarningsDisplay
                    stream={selectedStream}
                    onWithdraw={() => handleWithdraw(selectedStream.id)}
                    loading={withdrawLoading[selectedStream.id]}
                />
            )}

            {/* Request Stream Section */}
            <div className="glass-card">
                <div className="card-header">
                    <h2 className="card-title">🚀 Request New Stream</h2>
                </div>
                {!showRequestForm ? (
                    <button
                        className="btn btn-primary"
                        style={{ width: '100%' }}
                        onClick={() => setShowRequestForm(true)}
                    >
                        ➕ Request Stream Start
                    </button>
                ) : (
                    <div>
                        <div className="form-group">
                            <label className="form-label" htmlFor="request-rate">
                                Desired Rate (PST/second)
                            </label>
                            <input
                                id="request-rate"
                                className="form-input"
                                type="number"
                                min="0"
                                step="any"
                                placeholder="e.g. 0.001"
                                value={requestRate}
                                onChange={(e) => setRequestRate(e.target.value)}
                                disabled={requestLoading}
                            />
                            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                                Daily equivalent: ~{(Number(requestRate || 0) * 86400).toFixed(2)} PST
                            </p>
                        </div>
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                            <button
                                className="btn btn-success"
                                style={{ flex: 1 }}
                                onClick={handleRequestStream}
                                disabled={requestLoading || !requestRate}
                            >
                                {requestLoading ? (
                                    <>
                                        <span className="spinner"></span>
                                        Submitting…
                                    </>
                                ) : (
                                    '✅ Submit Request'
                                )}
                            </button>
                            <button
                                className="btn"
                                style={{ flex: 1 }}
                                onClick={() => {
                                    setShowRequestForm(false);
                                    setRequestRate('');
                                }}
                                disabled={requestLoading}
                            >
                                ❌ Cancel
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Pending Requests */}
            {pendingRequests.length > 0 && (
                <div className="glass-card">
                    <div className="card-header">
                        <h2 className="card-title">⏳ Pending Requests</h2>
                    </div>
                    {pendingRequests.map((req) => (
                        <div key={req.id} className="stream-card" style={{ cursor: 'default' }}>
                            <div className="stream-card-header">
                                <span className="stream-id">Request #{req.id}</span>
                                <span className="badge" style={{ background: 'var(--warning)', color: '#000' }}>
                                    Pending Approval
                                </span>
                            </div>
                            <div className="stream-details">
                                <div>
                                    <div className="stream-detail-label">Requested Rate</div>
                                    <div className="stream-detail-value">
                                        {formatRate(req.ratePerSecond)} HLUSD/sec
                                    </div>
                                </div>
                                <div>
                                    <div className="stream-detail-label">Daily</div>
                                    <div className="stream-detail-value">
                                        ~{(Number(formatRate(req.ratePerSecond)) * 86400).toFixed(2)} HLUSD
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* My Streams */}
            <div className="glass-card">
                <div className="card-header">
                    <h2 className="card-title">📋 My Salary Streams</h2>
                </div>

                {loading && streams.length === 0 ? (
                    <div className="empty-state">
                        <div className="spinner" style={{ width: 32, height: 32 }}></div>
                        <p className="empty-state-text" style={{ marginTop: '1rem' }}>Loading your streams…</p>
                    </div>
                ) : streams.length === 0 ? (
                    <div className="empty-state">
                        <div className="empty-state-icon">🔍</div>
                        <p className="empty-state-text">No streams found</p>
                        <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                            Ask your employer to create a salary stream for your address.
                        </p>
                    </div>
                ) : (
                    streams.map((stream) => (
                        <div
                            key={stream.id}
                            className="stream-card"
                            onClick={() => stream.active && setSelectedStream(stream)}
                            style={{ cursor: stream.active ? 'pointer' : 'default' }}
                        >
                            <div className="stream-card-header">
                                <span className="stream-id">Stream #{stream.id}</span>
                                {stream.active ? (
                                    <span className="badge badge-active">Active</span>
                                ) : (
                                    <span className="badge badge-inactive">Inactive</span>
                                )}
                            </div>
                            <div className="stream-details">
                                <div>
                                    <div className="stream-detail-label">Rate</div>
                                    <div className="stream-detail-value">
                                        {formatRate(stream.ratePerSecond)} PST/sec
                                    </div>
                                </div>
                                <div>
                                    <div className="stream-detail-label">Daily</div>
                                    <div className="stream-detail-value">
                                        ~{(Number(formatRate(stream.ratePerSecond)) * 86400).toFixed(2)} PST
                                    </div>
                                </div>
                            </div>
                            {stream.active && (
                                <button
                                    className="btn-withdraw"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handleWithdraw(stream.id);
                                    }}
                                    disabled={withdrawLoading[stream.id]}
                                >
                                    {withdrawLoading[stream.id] ? (
                                        <>
                                            <span className="spinner" style={{ marginRight: '0.5rem' }}></span>
                                            Withdrawing…
                                        </>
                                    ) : (
                                        '💸 Withdraw Earnings'
                                    )}
                                </button>
                            )}
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
