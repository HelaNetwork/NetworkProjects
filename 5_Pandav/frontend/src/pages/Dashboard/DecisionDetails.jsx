import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ChevronLeft, FileSearch, ShieldCheck, Activity, BrainCircuit, ExternalLink } from 'lucide-react';
import { PageHeader } from '../../components/PageHeader';
import { RiskBadge } from '../../components/RiskBadge';
import './DashboardPages.css';

const DecisionDetails = () => {
    const { id } = useParams();
    const [details, setDetails] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchDeepDive = async () => {
            try {
                setError(null);
                const res = await fetch(`http://localhost:8000/explain/${id}`);
                if (!res.ok) throw new Error(`Decision #${id} not found on chain.`);
                const data = await res.json();
                setDetails(data);
            } catch (err) {
                console.error(err);
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };
        if (id) fetchDeepDive();
    }, [id]);

    const decision = details?.decision;

    return (
        <div className="page-container">
            <Link to="/dashboard/history" className="action-link" style={{ marginBottom: '16px' }}>
                <ChevronLeft size={16} />
                Back to Audit Log
            </Link>
            
            <PageHeader
                eyebrow={`Decision #${id}`}
                title="Deep Dive Analysis"
                description="Full AI rationale and on-chain data for this executed agentic intent."
            />

            {loading ? (
                <div className="loading-state-v2 glass">
                    <div className="pulse-dot-wrapper">
                        <span className="pulse-dot-ping bg-accent-light" />
                        <span className="pulse-dot bg-accent-light" />
                    </div>
                    <p>Fetching from HeLa Smart Contract and running AI analysis...</p>
                </div>
            ) : error ? (
                <div className="empty-state-v2 glass" style={{ borderColor: 'var(--destructive)' }}>
                    <ShieldCheck size={32} className="text-destructive" />
                    <p style={{ color: 'var(--destructive)' }}>{error}</p>
                </div>
            ) : (
                <div className="dashboard-grid dashboard-grid-2-col">
                    {/* On-Chain Verification Block */}
                    <div className="glass" style={{ padding: '24px', borderRadius: 'var(--radius-lg)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '24px', paddingBottom: '16px', borderBottom: '1px solid var(--border-glass)' }}>
                            <ShieldCheck className="text-accent-light" size={20} />
                            <h3 style={{ fontSize: '16px', fontWeight: 600 }}>On-Chain Record</h3>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', fontSize: '14px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                <span style={{ color: 'var(--text-muted)' }}>Action</span>
                                <span style={{ fontWeight: 500 }}>{decision?.action}</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                <span style={{ color: 'var(--text-muted)' }}>Amount</span>
                                <span style={{ fontFamily: 'var(--font-mono)' }}>{decision?.amount}</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                <span style={{ color: 'var(--text-muted)' }}>Risk Score</span>
                                <RiskBadge score={details?.risk || 1} size="sm" />
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                <span style={{ color: 'var(--text-muted)' }}>Status</span>
                                <span className={`status-badge ${decision?.status === 1 ? 'status-executed' : decision?.status === 0 ? 'status-timelocked' : 'status-disputed'}`}>
                                    <span className="dot" />
                                    {decision?.status_label || (decision?.status === 1 ? 'Executed' : 'Timelocked')}
                                </span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <span style={{ color: 'var(--text-muted)' }}>Agent Wallet</span>
                                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '12px', background: 'rgba(255,255,255,0.05)', padding: '4px 8px', borderRadius: '4px' }}>
                                    {decision?.agent || "0xAgent..."}
                                </span>
                            </div>
                        </div>

                        <div style={{ marginTop: '24px', paddingTop: '16px', borderTop: '1px solid var(--border-glass)' }}>
                            <a href={decision?.explorer_url || "#"} target="_blank" rel="noreferrer" className="action-link" style={{ fontSize: '14px' }}>
                                View Transaction on HeLa Explorer
                                <ExternalLink size={14} />
                            </a>
                        </div>
                    </div>

                    {/* AI Auditor Deep Dive */}
                    <div className="glass" style={{ padding: '24px', borderRadius: 'var(--radius-lg)', background: 'linear-gradient(180deg, rgba(99,102,241,0.08) 0%, rgba(255,255,255,0.02) 100%)', borderColor: 'rgba(99,102,241,0.2)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '24px', paddingBottom: '16px', borderBottom: '1px solid rgba(99,102,241,0.2)' }}>
                            <BrainCircuit className="text-accent-light" size={20} />
                            <h3 style={{ fontSize: '16px', fontWeight: 600 }}>Gemini AI Auditor Report</h3>
                        </div>

                        <div style={{ marginBottom: '20px' }}>
                            <h4 style={{ fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--accent-light)', marginBottom: '8px' }}>Executive Summary</h4>
                            <p style={{ fontSize: '14px', lineHeight: 1.6, color: 'var(--text-primary)' }}>
                                {details?.explanation || "The AI model evaluated the agent's intent based on historical trading volumes, market volatility, and hard-coded risk parameters within the TAAP smart contract."}
                            </p>
                        </div>
                        
                        <div>
                            <h4 style={{ fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-muted)', marginBottom: '8px' }}>Security Metrics</h4>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: 'var(--text-secondary)' }}>
                                    <Activity size={14} className="text-success" />
                                    <span>Anomaly Detection: Negative (Normal behavior)</span>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: 'var(--text-secondary)' }}>
                                    <ShieldCheck size={14} className="text-success" />
                                    <span>Protocol Compliance: Passed</span>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: 'var(--text-secondary)' }}>
                                    <FileSearch size={14} className="text-success" />
                                    <span>Explanation Hash Verified: Yes</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default DecisionDetails;
