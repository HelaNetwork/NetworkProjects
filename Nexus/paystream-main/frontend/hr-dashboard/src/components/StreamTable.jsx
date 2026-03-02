import { useState, useEffect, useCallback } from 'react';
import {
    getAllStreams,
    calculateAccrued,
    pauseStream,
    resumeStream,
    cancelStream,
    formatAddress,
    formatRate,
    ethers,
} from '../services/contractService';

export default function StreamTable({ refreshTrigger }) {
    const [streams, setStreams] = useState([]);
    const [accrued, setAccrued] = useState({});
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState({});

    const loadStreams = useCallback(async () => {
        try {
            setLoading(true);
            const data = await getAllStreams();
            setStreams(data);
        } catch (err) {
            console.error('Failed to load streams:', err);
        } finally {
            setLoading(false);
        }
    }, []);

    // Load streams on mount and when refreshTrigger changes
    useEffect(() => {
        loadStreams();
    }, [loadStreams, refreshTrigger]);

    // Update accrued values every 2 seconds
    useEffect(() => {
        if (streams.length === 0) return;

        const updateAccrued = async () => {
            const newAccrued = {};
            for (const s of streams) {
                if (s.active) {
                    try {
                        const val = await calculateAccrued(s.id);
                        newAccrued[s.id] = ethers.formatEther(val);
                    } catch {
                        newAccrued[s.id] = '0';
                    }
                } else {
                    newAccrued[s.id] = '0';
                }
            }
            setAccrued(newAccrued);
        };

        updateAccrued();
        const interval = setInterval(updateAccrued, 2000);
        return () => clearInterval(interval);
    }, [streams]);

    const handlePause = async (id) => {
        setActionLoading((prev) => ({ ...prev, [id]: 'pause' }));
        try {
            await pauseStream(id);
            await loadStreams();
            alert('✅ Stream paused successfully!');
        } catch (err) {
            console.error('Pause failed:', err);
            alert(`❌ Failed to pause stream:\n${err.reason || err.message || 'Unknown error'}`);
        } finally {
            setActionLoading((prev) => ({ ...prev, [id]: null }));
        }
    };

    const handleResume = async (id) => {
        setActionLoading((prev) => ({ ...prev, [id]: 'resume' }));
        try {
            await resumeStream(id);
            await loadStreams();
            alert('✅ Stream resumed successfully!');
        } catch (err) {
            console.error('Resume failed:', err);
            alert(`❌ Failed to resume stream:\n${err.reason || err.message || 'Unknown error'}`);
        } finally {
            setActionLoading((prev) => ({ ...prev, [id]: null }));
        }
    };

    const handleCancel = async (id) => {
        if (!confirm('Cancel this stream? Pending accrued will be auto-claimed.')) return;
        setActionLoading((prev) => ({ ...prev, [id]: 'cancel' }));
        try {
            await cancelStream(id);
            await loadStreams();
            alert('✅ Stream cancelled successfully!');
        } catch (err) {
            console.error('Cancel failed:', err);
            alert(`❌ Failed to cancel stream:\n${err.reason || err.message || 'Unknown error'}`);
        } finally {
            setActionLoading((prev) => ({ ...prev, [id]: null }));
        }
    };

    const getStatus = (stream) => {
        if (!stream.active) {
            return <span className="badge badge-cancelled">Inactive</span>;
        }
        return <span className="badge badge-active">Active</span>;
    };

    if (loading) {
        return (
            <div className="glass-card">
                <div className="card-header">
                    <h2 className="card-title">
                        <span className="card-title-icon">📊</span>
                        Salary Streams
                    </h2>
                </div>
                <div className="empty-state">
                    <div className="spinner" style={{ width: 32, height: 32 }}></div>
                    <p className="empty-state-text" style={{ marginTop: '1rem' }}>Loading streams…</p>
                </div>
            </div>
        );
    }

    return (
        <div className="glass-card">
            <div className="card-header">
                <h2 className="card-title">
                    <span className="card-title-icon">📊</span>
                    Salary Streams
                </h2>
                <button className="btn btn-ghost btn-sm" onClick={loadStreams}>
                    🔄 Refresh
                </button>
            </div>

            {streams.length === 0 ? (
                <div className="empty-state">
                    <div className="empty-state-icon">💸</div>
                    <p className="empty-state-text">No streams yet</p>
                    <p className="empty-state-sub">Create your first salary stream using the form.</p>
                </div>
            ) : (
                <div style={{ overflowX: 'auto' }}>
                    <table className="stream-table">
                        <thead>
                            <tr>
                                <th>Stream ID</th>
                                <th>Employee</th>
                                <th>Rate (HLUSD/s)</th>
                                <th>Accrued (HLUSD)</th>
                                <th>Status.</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {streams.map((stream) => (
                                <tr key={stream.id}>
                                    <td style={{ fontWeight: 600 }}>#{stream.id}</td>
                                    <td className="address-cell">{formatAddress(stream.employee)}</td>
                                    <td className="rate-cell">{formatRate(stream.ratePerSecond)} HLUSD</td>
                                    <td className="accrued-cell">
                                        {accrued[stream.id]
                                            ? Number(accrued[stream.id]).toFixed(4)
                                            : '0.0000'}{' '}
                                        PST
                                    </td>
                                    <td>{getStatus(stream)}</td>
                                    <td>
                                        <div className="actions-group">
                                            {stream.active ? (
                                                <>
                                                    <button
                                                        className="btn btn-warning btn-sm"
                                                        onClick={() => handlePause(stream.id)}
                                                        disabled={!!actionLoading[stream.id]}
                                                    >
                                                        {actionLoading[stream.id] === 'pause' ? (
                                                            <span className="spinner"></span>
                                                        ) : (
                                                            '⏸ Pause'
                                                        )}
                                                    </button>
                                                    <button
                                                        className="btn btn-danger btn-sm"
                                                        onClick={() => handleCancel(stream.id)}
                                                        disabled={!!actionLoading[stream.id]}
                                                    >
                                                        {actionLoading[stream.id] === 'cancel' ? (
                                                            <span className="spinner"></span>
                                                        ) : (
                                                            '✕ Cancel'
                                                        )}
                                                    </button>
                                                </>
                                            ) : (
                                                <button
                                                    className="btn btn-success btn-sm"
                                                    onClick={() => handleResume(stream.id)}
                                                    disabled={!!actionLoading[stream.id]}
                                                >
                                                    {actionLoading[stream.id] === 'resume' ? (
                                                        <span className="spinner"></span>
                                                    ) : (
                                                        '▶ Resume'
                                                    )}
                                                </button>
                                            )}
                                            <button
                                                className="btn btn-info btn-sm"
                                                style={{ marginLeft: '8px' }}
                                                onClick={() => handleBonus(stream.employee)}
                                            >
                                                🎁 Bonus
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}
