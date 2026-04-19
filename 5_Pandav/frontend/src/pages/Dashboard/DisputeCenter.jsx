import React, { useState, useEffect, useCallback } from 'react';
import { Search, Flame, ShieldAlert, Clock, ExternalLink, RefreshCw, CheckCircle2, BrainCircuit, XCircle, AlertTriangle } from 'lucide-react';
import { PageHeader } from '../../components/PageHeader';
import { useToast } from '../../components/Toast';
import { useWeb3Context } from '../../context/Web3Context';
import './DashboardPages.css';

// ── Countdown timer component ──────────────────────────────────────────────
const Countdown = ({ timestamp, windowSeconds }) => {
    const [remaining, setRemaining] = useState(0);

    useEffect(() => {
        const calc = () => {
            const expiry = timestamp + windowSeconds;
            const left = expiry - Math.floor(Date.now() / 1000);
            setRemaining(Math.max(0, left));
        };
        calc();
        const t = setInterval(calc, 1000);
        return () => clearInterval(t);
    }, [timestamp, windowSeconds]);

    if (remaining <= 0) return <span style={{ color: 'var(--text-muted)', fontSize: '11px' }}>Expired</span>;

    const h = Math.floor(remaining / 3600);
    const m = Math.floor((remaining % 3600) / 60);
    const s = remaining % 60;
    const fmt = (n) => String(n).padStart(2, '0');
    const color = remaining < 300 ? '#ef4444' : remaining < 1800 ? '#f59e0b' : '#4ade80';

    return (
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color, fontWeight: 600 }}>
            <Clock size={10} style={{ display: 'inline', marginRight: 3 }} />
            {h}:{fmt(m)}:{fmt(s)}
        </span>
    );
};

// ── Risk score display (reads from parent state, no individual API calls) ────
const RiskBadge = ({ score }) => {
    const getColor = (s) => {
        if (s == null) return '#a0a0a0';
        if (parseInt(s) >= 7) return '#ef4444';
        if (parseInt(s) >= 4) return '#f59e0b';
        return '#4ade80';
    };
    if (score == null) return <span style={{ color: '#a0a0a0', fontSize: '0.8rem' }}>…</span>;
    return (
        <span style={{
            fontWeight: 'bold', color: getColor(score),
            padding: '0.2rem 0.6rem', background: 'rgba(255,255,255,0.05)', borderRadius: '4px'
        }}>
            {score}/10
        </span>
    );
};

// ── Main component ──────────────────────────────────────────────────────────
const DisputeCenter = () => {
    const [decisions, setDecisions]       = useState([]);
    const [loading, setLoading]           = useState(true);
    const [filter, setFilter]             = useState('All');
    const [search, setSearch]             = useState('');
    const [challenging, setChallenging]   = useState({});   // { [id]: true/false }
    const [windowSecs, setWindowSecs]     = useState(3600);
    const [governanceRole, setGovRole]    = useState(null);
    const [tribunalReviews, setTribunal]  = useState({});   // { [id]: review result }
    const [riskScores, setRiskScores]     = useState({});   // { [id]: score } loaded in one shot
    const [pollingIds, setPollingIds]     = useState(new Set());

    const toast = useToast();
    const { address } = useWeb3Context();

    const isGovernance = address && governanceRole &&
        address.toLowerCase() === governanceRole.toLowerCase();

    // Fetch decisions + governance role
    const fetchDecisions = useCallback(async (silent = false) => {
        if (!silent) setLoading(true);
        try {
            const [govRes, decRes] = await Promise.all([
                fetch('http://127.0.0.1:8000/governance'),
                fetch('http://127.0.0.1:8000/decisions'),
            ]);
            if (govRes.ok) {
                const g = await govRes.json();
                setGovRole(g.governanceRole);
            }
            if (decRes.ok) {
                const d = await decRes.json();
                setDecisions(d.decisions || []);
            }
        } catch (err) {
            toast.error('Failed to load decisions', err.message);
        } finally {
            setLoading(false);
        }
    }, [toast]);

    // Load risk scores from cache in one call (no LLM bursting)
    const fetchRiskScores = useCallback(async () => {
        try {
            const res = await fetch('http://127.0.0.1:8000/explain/all');
            if (!res.ok) return;
            const data = await res.json();
            const map = {};
            for (const item of (data.results || [])) {
                if (item.risk != null) map[item.decision_id] = item.risk;
            }
            setRiskScores(map);
        } catch (_) {}
    }, []);

    useEffect(() => { fetchDecisions(); }, [fetchDecisions]);
    // Fetch cached risk scores after decisions load (single API call, no LLM burst)
    useEffect(() => { fetchRiskScores(); }, [fetchRiskScores]);

    // Poll tribunal results every 2.5s for any pending review IDs
    useEffect(() => {
        if (pollingIds.size === 0) return;
        const interval = setInterval(async () => {
            for (const pid of pollingIds) {
                try {
                    const res = await fetch(`http://127.0.0.1:8000/review/${pid}`);
                    if (res.ok) {
                        const data = await res.json();
                        setTribunal(prev => ({ ...prev, [pid]: data }));
                        if (data.status === 'complete' || data.status === 'error') {
                            setPollingIds(prev => { const n = new Set(prev); n.delete(pid); return n; });
                            fetchDecisions(true);
                            if (data.status === 'complete') {
                                const delta = data.reputation_delta;
                                const sign = delta > 0 ? '+' : '';
                                toast.info(
                                    `Tribunal: ${data.verdict}`,
                                    `${data.agent_name} reputation ${sign}${delta} pts.`
                                );
                            }
                        }
                    }
                } catch (_) {}
            }
        }, 2500);
        return () => clearInterval(interval);
    }, [pollingIds, fetchDecisions, toast]);

    // ── Challenge handler ────────────────────────────────────────────────
    const handleChallenge = async (id) => {
        if (!address) {
            toast.warning('Wallet Required', 'Connect your wallet to identify yourself.');
            return;
        }

        setChallenging(prev => ({ ...prev, [id]: true }));
        toast.info('Submitting Challenge', `Sending on-chain challenge for Decision #${id}…`);

        try {
            const res = await fetch(`http://127.0.0.1:8000/challenge/${id}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ challenger_address: address }),
            });

            const data = await res.json();

            if (!res.ok) {
                const errMsg = data?.detail?.error || data?.detail || 'Challenge failed';
                throw new Error(errMsg);
            }

            toast.success(
                'Challenge Recorded!',
                `Decision #${id} is now disputed on HeLa. AI Tribunal review started…`
            );

            // Start polling for the tribunal verdict
            setTribunal(prev => ({ ...prev, [id]: { status: 'reviewing' } }));
            setPollingIds(prev => new Set([...prev, id]));

            setTimeout(() => fetchDecisions(true), 3000);

        } catch (e) {
            console.error('Challenge error:', e);
            toast.error('Challenge Failed', e.message || 'Transaction rejected by network');
        } finally {
            setChallenging(prev => ({ ...prev, [id]: false }));
        }
    };

    // ── Helpers ──────────────────────────────────────────────────────────
    const truncate = (addr) => {
        if (!addr) return '—';
        const s = String(addr);
        return s.length <= 10 ? s : `${s.slice(0, 6)}…${s.slice(-4)}`;
    };

    const getStatusInfo = (status) => {
        if (status === 1) return { cls: 'status-executed',   label: 'Challenged' };
        if (status === 2) return { cls: 'status-executed',   label: 'Resolved' };
        return               { cls: 'status-timelocked', label: 'Pending' };
    };

    const filtered = decisions.filter(d => {
        const { label } = getStatusInfo(d.status);
        const matchFilter = filter === 'All' || label === filter;
        const matchSearch = !search ||
            d.action?.toLowerCase().includes(search.toLowerCase()) ||
            String(d.id).includes(search) ||
            d.agent?.toLowerCase().includes(search.toLowerCase());
        return matchFilter && matchSearch;
    });

    return (
        <div className="page-container">
            <PageHeader
                eyebrow="DAO Challenge Hub"
                title="Dispute Center"
                description="Review on-chain decisions and challenge suspicious AI activity within the timelock window."
                actions={
                    <button className="action-btn-ghost hover-lift" onClick={() => fetchDecisions()} disabled={loading}>
                        <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
                        Refresh
                    </button>
                }
            />

            {/* Governance status banner */}
            {address && (
                <div style={{
                    display: 'flex', alignItems: 'center', gap: '8px',
                    padding: '10px 16px', borderRadius: 'var(--radius-md)',
                    background: isGovernance ? 'rgba(74,222,128,0.08)' : 'rgba(255,255,255,0.04)',
                    border: `1px solid ${isGovernance ? 'rgba(74,222,128,0.25)' : 'rgba(255,255,255,0.08)'}`,
                    marginBottom: '20px', fontSize: '13px'
                }}>
                    {isGovernance
                        ? <><CheckCircle2 size={14} color="#4ade80" /> <span style={{ color: '#4ade80', fontWeight: 600 }}>Governance wallet connected</span> — you can challenge decisions.</>
                        : <><ShieldAlert size={14} color="#f59e0b" /> <span style={{ color: '#f59e0b', fontWeight: 600 }}>Read-only mode</span> — connect governance wallet to challenge decisions.</>
                    }
                </div>
            )}

            {/* Filter bar */}
            <div className="filter-bar glass">
                <div className="filter-pills">
                    {['All', 'Pending', 'Challenged', 'Resolved'].map(f => (
                        <button key={f} className={`filter-pill ${filter === f ? 'active' : ''}`}
                            onClick={() => setFilter(f)}>{f}</button>
                    ))}
                </div>
                <div className="search-input-wrapper">
                    <Search className="search-icon" size={16} />
                    <input
                        type="text"
                        placeholder="Search by ID, action, or agent…"
                        className="search-input"
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                    />
                </div>
            </div>

            {/* Decision table */}
            <div className="glass" style={{ borderRadius: 'var(--radius-lg)', overflow: 'hidden' }}>
                <div style={{ overflowX: 'auto' }}>
                    <table className="data-table-v2">
                        <thead>
                            <tr>
                                <th>#</th>
                                <th>Action</th>
                                <th>Agent</th>
                                <th>Value</th>
                                <th>Risk</th>
                                <th>Status</th>
                                <th>Time Left</th>
                                <th style={{ textAlign: 'right' }}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr><td colSpan="8" style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
                                    Loading decisions from HeLa…
                                </td></tr>
                            ) : filtered.length === 0 ? (
                                <tr><td colSpan="8" style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
                                    No decisions match your filter.
                                </td></tr>
                            ) : filtered.map(d => {
                                const { cls, label } = getStatusInfo(d.status);
                                const isPending = d.status === 0;
                                const isChallengeable = d.is_challengeable;
                                const isSubmitting = challenging[d.id];

                                return (
                                    <tr key={d.id}>
                                        <td style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>
                                            #{d.id}
                                        </td>
                                        <td>
                                            <span style={{
                                                display: 'inline-block', padding: '4px 8px', borderRadius: '4px',
                                                background: 'rgba(255,255,255,0.05)', fontSize: '12px', maxWidth: '180px',
                                                overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap'
                                            }} title={d.action}>
                                                {d.action}
                                            </span>
                                        </td>
                                        <td style={{ fontFamily: 'var(--font-mono)', fontSize: '12px' }}>
                                            {truncate(d.agent)}
                                        </td>
                                        <td style={{ fontWeight: 500 }}>{d.amount}</td>
                                        <td><RiskBadge score={riskScores[d.id] ?? null} /></td>
                                        <td>
                                            <span className={`status-badge ${cls}`}>
                                                <span className="dot" />{label}
                                            </span>
                                        </td>
                                        <td>
                                            {isPending && d.timestamp
                                                ? <Countdown timestamp={d.timestamp} windowSeconds={windowSecs} />
                                                : <span style={{ color: 'var(--text-muted)', fontSize: '11px' }}>—</span>
                                            }
                                        </td>
                                        <td style={{ textAlign: 'right' }}>
                                            {isPending && (
                                                <div style={{ display: 'flex', gap: '6px', justifyContent: 'flex-end', alignItems: 'center' }}>
                                                    {/* Explorer link */}
                                                    {d.explorer_url && (
                                                        <a
                                                            href={d.explorer_url}
                                                            target="_blank"
                                                            rel="noreferrer"
                                                            className="action-link"
                                                            style={{ fontSize: '12px' }}
                                                            title="View on HeLa Explorer"
                                                        >
                                                            <ExternalLink size={12} />
                                                        </a>
                                                    )}

                                                    {/* Challenge button */}
                                                    <button
                                                        className="destructive-btn"
                                                        onClick={() => handleChallenge(d.id)}
                                                        disabled={isSubmitting || !isChallengeable}
                                                        title={
                                                            !isChallengeable
                                                                ? 'Challenge window has expired'
                                                                : !isGovernance
                                                                    ? 'Governance wallet required to execute challenge'
                                                                    : `Challenge Decision #${d.id}`
                                                        }
                                                        style={{
                                                            opacity: (!isChallengeable) ? 0.4 : 1,
                                                            cursor: (!isChallengeable) ? 'not-allowed' : 'pointer',
                                                            position: 'relative'
                                                        }}
                                                    >
                                                        {isSubmitting ? (
                                                            <><RefreshCw size={13} className="animate-spin" /> Submitting…</>
                                                        ) : (
                                                            <><Flame size={13} /> Challenge</>
                                                        )}
                                                    </button>
                                                </div>
                                            )}
                                            {d.status === 1 && (
                                                <span style={{ fontSize: '11px', color: '#f59e0b', fontWeight: 600 }}>
                                                    ⚠ Under Review
                                                </span>
                                            )}
                                            {d.status === 2 && (
                                                <span style={{ fontSize: '11px', color: '#4ade80', fontWeight: 600 }}>
                                                    ✓ Resolved
                                                </span>
                                        )}
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Tribunal Review Panels */}
            {Object.entries(tribunalReviews).length > 0 && (
                <div style={{ marginTop: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    <h3 style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                        <BrainCircuit size={14} style={{ display: 'inline', marginRight: 6 }} />
                        Gemini AI Tribunal Reviews
                    </h3>
                    {Object.entries(tribunalReviews).map(([id, review]) => (
                        <div key={id} className="glass" style={{
                            padding: '20px 24px',
                            borderRadius: 'var(--radius-lg)',
                            borderColor: review.status === 'complete'
                                ? (review.upheld ? 'rgba(239,68,68,0.3)' : 'rgba(74,222,128,0.3)')
                                : 'rgba(99,102,241,0.2)',
                            background: review.status === 'complete'
                                ? (review.upheld ? 'rgba(239,68,68,0.05)' : 'rgba(74,222,128,0.05)')
                                : 'rgba(99,102,241,0.05)',
                        }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
                                {review.status === 'reviewing' || review.status === 'pending' ? (
                                    <><RefreshCw size={16} className="animate-spin" style={{ color: '#818cf8' }} />
                                    <span style={{ fontWeight: 600, color: '#818cf8' }}>Decision #{id} — AI Tribunal Reviewing…</span></>
                                ) : review.status === 'complete' ? (
                                    review.upheld
                                        ? <><XCircle size={16} color="#ef4444" /><span style={{ fontWeight: 700, color: '#ef4444' }}>Decision #{id} — CHALLENGE UPHELD</span></>
                                        : <><CheckCircle2 size={16} color="#4ade80" /><span style={{ fontWeight: 700, color: '#4ade80' }}>Decision #{id} — CHALLENGE REJECTED</span></>
                                ) : (
                                    <><AlertTriangle size={16} color="#f59e0b" /><span style={{ fontWeight: 600, color: '#f59e0b' }}>Decision #{id} — Review Error</span></>
                                )}
                                {review.confidence && (
                                    <span style={{ marginLeft: 'auto', fontSize: '11px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                                        Confidence: {review.confidence}
                                    </span>
                                )}
                            </div>

                            {review.status === 'complete' && (
                                <>
                                    <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: '12px' }}>
                                        {review.reasoning}
                                    </p>
                                    <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', fontSize: '12px' }}>
                                        <span style={{
                                            padding: '4px 10px', borderRadius: '20px', fontWeight: 600,
                                            background: review.upheld ? 'rgba(239,68,68,0.15)' : 'rgba(74,222,128,0.15)',
                                            color: review.upheld ? '#ef4444' : '#4ade80'
                                        }}>
                                            Reputation: {review.reputation_delta > 0 ? '+' : ''}{review.reputation_delta} pts
                                        </span>
                                        {review.new_reputation != null && (
                                            <span style={{ padding: '4px 10px', borderRadius: '20px', background: 'rgba(255,255,255,0.06)', color: 'var(--text-muted)', fontWeight: 500 }}>
                                                {review.agent_name} new score: {review.new_reputation}
                                            </span>
                                        )}
                                        {review.resolve_tx_hash && (
                                            <a
                                                href={review.resolve_explorer_url}
                                                target="_blank" rel="noreferrer"
                                                className="action-link"
                                                style={{ fontSize: '12px' }}
                                            >
                                                View resolveDispute tx <ExternalLink size={11} />
                                            </a>
                                        )}
                                    </div>
                                </>
                            )}
                            {review.status === 'error' && (
                                <p style={{ fontSize: '13px', color: '#f59e0b' }}>{review.error}</p>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default DisputeCenter;
