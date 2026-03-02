import { useState, useEffect } from 'react';
import {
    getPendingRequests,
    approveStreamRequest,
    rejectStreamRequest,
    formatAddress,
    formatRate,
} from '../services/contractService';

export default function PendingRequests({ refreshTrigger, onRequestProcessed }) {
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(false);
    const [actionLoading, setActionLoading] = useState({});

    useEffect(() => {
        loadRequests();
    }, [refreshTrigger]);

    const loadRequests = async () => {
        try {
            setLoading(true);
            const pending = await getPendingRequests();
            setRequests(pending);
        } catch (err) {
            console.error('Failed to load pending requests:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleApprove = async (requestId) => {
        setActionLoading((p) => ({ ...p, [requestId]: 'approve' }));
        try {
            await approveStreamRequest(requestId);
            await loadRequests();
            if (onRequestProcessed) onRequestProcessed();
        } catch (err) {
            console.error('Approve failed:', err);
            alert(err.reason || err.message || 'Approval failed');
        } finally {
            setActionLoading((p) => ({ ...p, [requestId]: null }));
        }
    };

    const handleReject = async (requestId) => {
        if (!confirm('Are you sure you want to reject this request?')) return;

        setActionLoading((p) => ({ ...p, [requestId]: 'reject' }));
        try {
            await rejectStreamRequest(requestId);
            await loadRequests();
            if (onRequestProcessed) onRequestProcessed();
        } catch (err) {
            console.error('Reject failed:', err);
            alert(err.reason || err.message || 'Rejection failed');
        } finally {
            setActionLoading((p) => ({ ...p, [requestId]: null }));
        }
    };

    if (loading && requests.length === 0) {
        return (
            <div className="glass-card">
                <div className="card-header">
                    <h2 className="card-title">
                        <span className="card-title-icon">⏳</span>
                        Pending Stream Requests
                    </h2>
                </div>
                <div className="empty-state">
                    <div className="spinner" style={{ width: 32, height: 32 }}></div>
                    <p className="empty-state-text" style={{ marginTop: '1rem' }}>Loading requests…</p>
                </div>
            </div>
        );
    }

    if (requests.length === 0) {
        return (
            <div className="glass-card">
                <div className="card-header">
                    <h2 className="card-title">
                        <span className="card-title-icon">⏳</span>
                        Pending Stream Requests
                    </h2>
                </div>
                <div className="empty-state">
                    <div className="empty-state-icon">✅</div>
                    <p className="empty-state-text">No pending requests</p>
                </div>
            </div>
        );
    }

    return (
        <div className="glass-card">
            <div className="card-header">
                <h2 className="card-title">
                    <span className="card-title-icon">⏳</span>
                    Pending Stream Requests ({requests.length})
                </h2>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {requests.map((req) => (
                    <div key={req.id} className="stream-card" style={{ cursor: 'default' }}>
                        <div className="stream-card-header">
                            <span className="stream-id">Request #{req.id}</span>
                            <span className="badge" style={{ background: 'var(--warning)', color: '#000' }}>
                                Pending
                            </span>
                        </div>
                        <div className="stream-details">
                            <div>
                                <div className="stream-detail-label">Employee</div>
                                <div className="stream-detail-value">{formatAddress(req.employee)}</div>
                            </div>
                            <div>
                                <div className="stream-detail-label">Requested Rate</div>
                                <div className="stream-detail-value">
                                    {formatRate(req.ratePerSecond)} HLUSD/sec
                                </div>
                            </div>
                            <div>
                                <div className="stream-detail-label">Daily</div>
                                <div className="stream-detail-value">
                                    ~{(Number(formatRate(req.ratePerSecond)) * 86400).toFixed(2)} PST
                                </div>
                            </div>
                        </div>
                        <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.75rem' }}>
                            <button
                                className="btn btn-success"
                                style={{ flex: 1 }}
                                onClick={() => handleApprove(req.id)}
                                disabled={actionLoading[req.id]}
                            >
                                {actionLoading[req.id] === 'approve' ? (
                                    <>
                                        <span className="spinner"></span>
                                        Approving…
                                    </>
                                ) : (
                                    '✅ Approve'
                                )}
                            </button>
                            <button
                                className="btn btn-danger"
                                style={{ flex: 1 }}
                                onClick={() => handleReject(req.id)}
                                disabled={actionLoading[req.id]}
                            >
                                {actionLoading[req.id] === 'reject' ? (
                                    <>
                                        <span className="spinner"></span>
                                        Rejecting…
                                    </>
                                ) : (
                                    '❌ Reject'
                                )}
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
