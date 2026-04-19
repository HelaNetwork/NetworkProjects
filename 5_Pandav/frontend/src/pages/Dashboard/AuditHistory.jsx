import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Scroll, ExternalLink, Bot, Hash, Clock, ShieldAlert } from 'lucide-react';
import { PageHeader } from '../../components/PageHeader';
import { RiskBadge } from '../../components/RiskBadge';
import { useWeb3Context } from '../../context/Web3Context';
import './DashboardPages.css';
import './AuditHistory.css';

const AuditHistory = () => {
    const [decisions, setDecisions] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    const { address } = useWeb3Context();

    useEffect(() => {
        const fetchHistory = async () => {
            try {
                const res = await fetch('http://127.0.0.1:8000/decisions');
                const data = await res.json();
                if (data && data.decisions) {
                    setDecisions(data.decisions);
                }
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchHistory();
    }, []);

    const truncateAddress = (addr) => {
        if (addr === null || addr === undefined) return '';
        const str = String(addr);
        if (str.length <= 10) return str;
        return `${str.slice(0, 6)}...${str.slice(-4)}`;
    };

    return (
        <div className="page-container">
            <PageHeader
                eyebrow="The Ledger"
                title="Audit History"
                description="Immutable log of every action executed by the Agentic Protocol on the HeLa Blockchain."
                actions={
                    <div className="history-count-badge glass">
                        <span className="count-dot bg-accent-light" />
                        {decisions.length} Executions
                    </div>
                }
            />

            <div className="history-list">
                    {loading ? (
                        <div className="skeleton-list">
                            {[1, 2, 3, 4].map(i => (
                                <div key={i} className="history-item skeleton" style={{ height: '80px', borderRadius: '12px' }} />
                            ))}
                        </div>
                    ) : decisions.length === 0 ? (
                        <div className="empty-state-v2 glass">
                            <Scroll size={32} className="text-muted" />
                            <p>No audit history found.</p>
                        </div>
                    ) : (
                        decisions.map(d => (
                            <div 
                                key={d.id} 
                                className="history-item glass hover-lift"
                                onClick={() => navigate(`/dashboard/history/${d.id}`)}
                                style={{ cursor: 'pointer' }}
                            >
                                <div className="history-col-1">
                                    <div className="history-action-badge">
                                        <Bot size={12} className="text-accent-light" />
                                        {d.action}
                                    </div>
                                    <RiskBadge score={Math.floor(Math.random() * 10) + 1} size="sm" />
                                    <span className="history-time">
                                        <Clock size={12} />
                                        Just now
                                    </span>
                                </div>

                                <div className="history-col-2">
                                    <div className="history-meta">
                                        <span className="meta-label">Agent</span>
                                        <span className="meta-val mono">
                                            <Bot size={12} />
                                            {truncateAddress(d.agent || "0xAgent...")}
                                        </span>
                                    </div>
                                    <div className="history-meta">
                                        <span className="meta-label">Explanation Hash</span>
                                        <span className="meta-val mono">
                                            <Hash size={12} />
                                            {truncateAddress(d.id)}
                                        </span>
                                    </div>
                                </div>

                                <div className="history-col-3">
                                    <a 
                                        href={d.explorer_url} 
                                        target="_blank" 
                                        rel="noreferrer" 
                                        className="history-explorer-btn"
                                        onClick={(e) => e.stopPropagation()}
                                    >
                                        HeLa Explorer
                                        <ExternalLink size={14} />
                                    </a>
                                </div>
                            </div>
                        ))
                    )}
                </div>
        </div>
    );
};

export default AuditHistory;
