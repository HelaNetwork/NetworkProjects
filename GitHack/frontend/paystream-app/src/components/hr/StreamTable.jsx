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
} from '../../services/contractService';

export default function StreamTable({ streams = [], onRefresh }) {
    const [accrued, setAccrued] = useState({});
    const [actionLoading, setActionLoading] = useState({});

    // Separate active and inactive streams
    // Separate active/paused and inactive streams
    const activeStreams = streams.filter(s => s.active || s.isPaused);
    const inactiveStreams = streams.filter(s => !s.active && !s.isPaused);

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
                    newAccrued[s.id] = '0'; // Or keep last known? Contract doesn't store "final accrued" easily active false usually means 0 pending
                }
            }
            setAccrued(newAccrued);
        };

        updateAccrued();
        const interval = setInterval(updateAccrued, 2000);
        return () => clearInterval(interval);
    }, [streams]);

    const handleAction = async (id, actionName, actionFn) => {
        setActionLoading((prev) => ({ ...prev, [id]: actionName }));
        try {
            await actionFn(id);
            if (onRefresh) await onRefresh();
            alert(`Stream ${actionName} successful!`);
        } catch (err) {
            console.error(`${actionName} failed:`, err);
            alert(`Failed to ${actionName} stream:\n${err.reason || err.message || 'Unknown error'}`);
        } finally {
            setActionLoading((prev) => ({ ...prev, [id]: null }));
        }
    };

    const handleAudit = (id) => {
        // Placeholder for future history details if needed
        alert(`Audit History for Stream #${id} coming soon.`);
    };

    const renderTable = (data, isHistory = false) => (
        <div style={{ overflowX: 'auto' }}>
            <table className="stream-table">
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Employee</th>
                        <th>Rate (HLUSD/s)</th>
                        {!isHistory && <th>Accrued</th>}
                        <th>Status</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {data.map((stream) => (
                        <tr key={stream.id} style={{ opacity: isHistory ? 0.7 : 1 }}>
                            <td style={{ fontWeight: 600 }}>#{stream.id}</td>
                            <td className="address-cell">{formatAddress(stream.employee)}</td>
                            <td className="rate-cell">{formatRate(stream.ratePerSecond)}</td>
                            {!isHistory && (
                                <td className="accrued-cell">
                                    {accrued[stream.id] ? Number(accrued[stream.id]).toFixed(4) : '0.000'}
                                </td>
                            )}
                            <td>
                                {stream.active ? (
                                    <span className="badge badge-active">Active</span>
                                ) : stream.isPaused ? (
                                    <span className="badge" style={{ background: 'var(--warning)', color: '#1a1a2e' }}>Paused</span>
                                ) : (
                                    <span className="badge badge-cancelled">Ended</span>
                                )}
                            </td>
                            <td>
                                <div className="actions-group">
                                    {stream.active ? (
                                        <>
                                            <button
                                                className="btn btn-sm"
                                                style={{ background: 'var(--success)', color: 'white', border: 'none', marginRight: '0.5rem' }}
                                                onClick={() => {
                                                    const amt = prompt(`Award Bonus to ${formatAddress(stream.employee)} (HLUSD):`);
                                                    if (amt) handleAction(stream.id, 'bonus', () => import('../../services/contractService').then(m => m.awardBonus(stream.employee, amt)));
                                                }}
                                                disabled={!!actionLoading[stream.id]}
                                            >
                                                {actionLoading[stream.id] === 'bonus' ? <span className="spinner"></span> : 'Bonus'}
                                            </button>
                                            <button
                                                className="btn btn-sm"
                                                style={{ background: 'var(--warning)', color: '#1a1a2e', border: 'none', marginRight: '0.5rem' }}
                                                onClick={() => handleAction(stream.id, 'pause', pauseStream)}
                                                disabled={!!actionLoading[stream.id]}
                                            >
                                                {actionLoading[stream.id] === 'pause' ? <span className="spinner"></span> : 'Pause'}
                                            </button>
                                            <button
                                                className="btn btn-danger btn-sm"
                                                onClick={() => {
                                                    if (confirm('End this stream? It will move to history.'))
                                                        handleAction(stream.id, 'cancel', cancelStream);
                                                }}
                                                disabled={!!actionLoading[stream.id]}
                                            >
                                                {actionLoading[stream.id] === 'cancel' ? <span className="spinner"></span> : 'End'}
                                            </button>
                                        </>
                                    ) : stream.isPaused ? (
                                        <>
                                            <button
                                                className="btn btn-success btn-sm"
                                                style={{ marginRight: '0.5rem' }}
                                                onClick={() => handleAction(stream.id, 'resume', resumeStream)}
                                                disabled={!!actionLoading[stream.id]}
                                            >
                                                {actionLoading[stream.id] === 'resume' ? <span className="spinner"></span> : 'Resume'}
                                            </button>
                                            <button
                                                className="btn btn-danger btn-sm"
                                                onClick={() => {
                                                    if (confirm('End this stream permanently?'))
                                                        handleAction(stream.id, 'cancel', cancelStream);
                                                }}
                                                disabled={!!actionLoading[stream.id]}
                                            >
                                                {actionLoading[stream.id] === 'cancel' ? <span className="spinner"></span> : 'End'}
                                            </button>
                                        </>
                                    ) : (
                                        // History actions
                                        <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>-</span>
                                    )}
                                </div>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );

    return (
        <div className="content-grid" style={{ gridTemplateColumns: '1fr', gap: '2rem' }}>
            {/* Active Streams */}
            <div className="glass-card">
                <div className="card-header">
                    <h2 className="card-title">
                        Active Streams ({activeStreams.length})
                    </h2>
                    <button className="btn btn-ghost btn-sm" onClick={onRefresh}>
                        Refresh
                    </button>
                </div>

                {activeStreams.length === 0 ? (
                    <div className="empty-state">
                        <div className="empty-state-icon">Stream</div>
                        <p className="empty-state-text">No active streams</p>
                        <p className="empty-state-sub">Create a new stream to get started.</p>
                    </div>
                ) : renderTable(activeStreams)}
            </div>

            {/* History Panel */}
            {inactiveStreams.length > 0 && (
                <div className="glass-card" style={{ border: '1px solid rgba(255,255,255,0.05)', background: 'var(--bg-secondary)' }}>
                    <div className="card-header">
                        <h2 className="card-title" style={{ color: 'var(--text-muted)' }}>
                            Stream History
                        </h2>
                    </div>
                    {renderTable(inactiveStreams, true)}
                </div>
            )}
        </div>
    );
}
