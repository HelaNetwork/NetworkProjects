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
    pauseStream,
} from '../../services/contractService';
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


    const loadData = useCallback(async (address, isBackground = false) => {
        try {
            if (!isBackground) setLoading(true);
            const [myStreams, tokenBalance, myRequests] = await Promise.all([
                getEmployeeStreams(address),
                getTokenBalance(address),
                getMyPendingRequests(address),
            ]);
            setStreams(myStreams);
            setBalance(tokenBalance);
            setPendingRequests(myRequests);

            // Sort streams: Active/Paused first, then by ID desc
            const sortedStreams = [...myStreams].sort((a, b) => {
                const aAlive = a.active || a.isPaused;
                const bAlive = b.active || b.isPaused;
                if (aAlive === bAlive) return b.id - a.id;
                return bAlive ? 1 : -1;
            });
            setStreams(sortedStreams);

            // Auto-select first active stream for earnings display
            const active = sortedStreams.find((s) => s.active);
            if (active && !selectedStream) {
                setSelectedStream(active);
            }
        } catch (err) {
            console.error('Failed to load employee data:', err);
        } finally {
            if (!isBackground) setLoading(false);
        }
    }, [selectedStream]);

    useEffect(() => {
        if (account) {
            loadData(account);
            const interval = setInterval(() => {
                // Pass true for background refresh
                loadData(account, true);
            }, 10000); // reduced to 10s for better responsiveness
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

    const handlePause = async (streamId) => {
        if (!confirm("Pause this stream? You will stop receiving funds until HR resumes it.")) return;
        setWithdrawLoading((p) => ({ ...p, [streamId]: true })); // reuse loading state
        try {
            await pauseStream(streamId);
            if (account) await loadData(account);
            alert("Stream Paused for security.");
        } catch (err) {
            console.error('Pause failed:', err);
            alert(err.reason || err.message || 'Pause failed');
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
                    <div className="not-connected-icon">Locked</div>
                    <h2>Connect Your Wallet</h2>
                    <p>Connect MetaMask to view your salary streams and withdraw earnings.</p>
                    <button className="btn-connect" onClick={handleConnect}>
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
                        <p className="header-subtitle">Employee Portal</p>
                    </div>
                </div>
                <button className="btn-connect connected" onClick={() => setAccount(null)}>
                    <span className="wallet-dot"></span>
                    {formatAddress(account)}
                </button>
            </header>

            {/* Wallet Balance */}
            <div className="glass-card" style={{ textAlign: 'center', paddingTop: '1rem', paddingBottom: '1rem', marginBottom: '2rem' }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 600 }}>
                    Wallet Balance
                </span>
                <div style={{ fontSize: '2.5rem', fontWeight: 800, color: 'var(--text-primary)', marginTop: '0.25rem' }}>
                    {Number(balance).toLocaleString(undefined, { maximumFractionDigits: 4 })}
                    <span style={{ fontSize: '1rem', color: 'var(--text-muted)', marginLeft: '0.5rem' }}>HLUSD</span>
                </div>
            </div>

            {/* Middle Section: My Salary Streams */}
            <div className="glass-card" style={{ marginBottom: '2rem' }}>
                <div className="card-header">
                    <h2 className="card-title">
                        My Salary Streams
                    </h2>
                </div>

                {loading && streams.length === 0 ? (
                    <div className="empty-state">
                        <div className="spinner" style={{ width: 32, height: 32 }}></div>
                        <p className="empty-state-text" style={{ marginTop: '1rem' }}>Loading your streams…</p>
                    </div>
                ) : streams.length === 0 ? (
                    <div className="empty-state">
                        <div className="empty-state-icon">Streams</div>
                        <p className="empty-state-text">No streams found</p>
                        <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                            Ask your employer to create a salary stream for your address.
                        </p>
                    </div>
                ) : (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1rem' }}>
                        {streams.map((stream) => (
                            <div
                                key={stream.id}
                                className="stream-card"
                                onClick={() => stream.active && setSelectedStream(stream)}
                                style={{
                                    padding: '1.25rem',
                                    background: (stream.active || stream.isPaused) ? 'rgba(99, 102, 241, 0.05)' : 'transparent',
                                    border: (stream.active || stream.isPaused) ? '1px solid var(--border)' : '1px solid transparent', // Changed to var(--border) for better visibility
                                    borderRadius: 'var(--radius-lg)',
                                    cursor: stream.active ? 'pointer' : 'default',
                                    transition: 'all 0.2s ease',
                                    boxShadow: stream.id === selectedStream?.id ? '0 0 0 2px var(--primary)' : 'none'
                                }}
                            >
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                                    <span style={{ fontWeight: 700, fontSize: '0.9rem' }}>Stream #{stream.id}</span>
                                    {stream.active ? (
                                        <span className="badge badge-active">Active</span>
                                    ) : stream.isPaused ? (
                                        <span className="badge" style={{ background: 'var(--warning)', color: '#1a1a2e' }}>Paused</span>
                                    ) : (
                                        <span className="badge badge-cancelled">Ended</span>
                                    )}
                                </div>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                                    <div>
                                        <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Rate</div>
                                        <div style={{ fontWeight: 600 }}>{formatRate(stream.ratePerSecond)}/s</div>
                                    </div>
                                    <div>
                                        <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Daily</div>
                                        <div style={{ fontWeight: 600 }}>{(Number(formatRate(stream.ratePerSecond)) * 86400).toFixed(2)}</div>
                                    </div>
                                </div>
                                {stream.active && (
                                    <div style={{ fontSize: '0.75rem', color: 'var(--primary)', fontWeight: 600 }}>
                                        Click to view earnings
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Current Earnings Detail View */}
            {selectedStream && (
                <div style={{ marginBottom: '2rem' }}>
                    <EarningsDisplay
                        stream={selectedStream}
                        onWithdraw={() => handleWithdraw(selectedStream.id)}
                        onPause={() => handlePause(selectedStream.id)}
                        loading={withdrawLoading[selectedStream.id]}
                    />
                </div>
            )}

            {/* Bottom Actions Grid */}
            <div className="content-grid">
                {/* Request Stream Section */}
                <div className="glass-card">
                    <div className="card-header">
                        <h2 className="card-title">
                            Request New Stream
                        </h2>
                    </div>
                    {!showRequestForm ? (
                        <div style={{ textAlign: 'center', padding: '1rem 0' }}>
                            <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem', fontSize: '0.9rem' }}>
                                Need a new salary stream? Submit a request to HR.
                            </p>
                            <button
                                className="btn btn-primary"
                                style={{ width: '100%' }}
                                onClick={() => setShowRequestForm(true)}
                            >
                                Request Stream Start
                            </button>
                        </div>
                    ) : (
                        <div>
                            <div className="form-group">
                                <label className="form-label" htmlFor="request-rate">
                                    Desired Rate (HLUSD/second)
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
                                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>
                                    Daily: <strong>{requestRate ? (Number(requestRate) * 86400).toFixed(2) : '0.00'}</strong> HLUSD
                                </p>
                            </div>
                            <div style={{ display: 'flex', gap: '0.75rem' }}>
                                <button
                                    className="btn btn-success"
                                    style={{ flex: 1 }}
                                    onClick={handleRequestStream}
                                    disabled={requestLoading || !requestRate}
                                >
                                    {requestLoading ? <span className="spinner"></span> : 'Submit'}
                                </button>
                                <button
                                    className="btn btn-ghost"
                                    style={{ flex: 1 }}
                                    onClick={() => {
                                        setShowRequestForm(false);
                                        setRequestRate('');
                                    }}
                                    disabled={requestLoading}
                                >
                                    Cancel
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                {/* Pending Requests */}
                <div className="glass-card">
                    <div className="card-header">
                        <h2 className="card-title">
                            Pending Requests
                        </h2>
                    </div>
                    {pendingRequests.length === 0 ? (
                        <div className="empty-state">
                            <div className="empty-state-icon">Done</div>
                            <p className="empty-state-text">No pending requests</p>
                        </div>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            {pendingRequests.map((req) => (
                                <div key={req.id} style={{ padding: '1rem', background: 'rgba(255,255,255,0.02)', borderRadius: 'var(--radius-md)' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                                        <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>Request #{req.id}</span>
                                        <span className="badge" style={{ background: 'var(--warning)', color: '#1a1a2e' }}>Pending</span>
                                    </div>
                                    <div style={{ fontSize: '0.9rem' }}>
                                        {formatRate(req.ratePerSecond)} HLUSD/sec
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
