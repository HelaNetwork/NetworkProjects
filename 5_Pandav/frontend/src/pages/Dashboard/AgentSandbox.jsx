import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bot, Zap, Play, Activity, ShieldAlert, CheckCircle2, FlaskConical, ChevronRight } from 'lucide-react';
import { PageHeader } from '../../components/PageHeader';
import { RiskBadge } from '../../components/RiskBadge';
import { useToast } from '../../components/Toast';
import './DashboardPages.css';

const STATUS_CONFIG = {
    auto_executed:    { label: 'Auto-Executed',    class: 'status-executed'   },
    pending_review:   { label: 'Needs Review',     class: 'status-timelocked' },
    execution_failed: { label: 'Failed',           class: 'status-disputed'  },
};

const AgentSandbox = () => {
    const navigate = useNavigate();
    const [profiles, setProfiles] = useState([]);
    const [reputations, setReputations] = useState([]);
    const [isRunning, setIsRunning] = useState(false);
    const [results, setResults] = useState(null);
    const toast = useToast();

    const fetchReputation = () => {
        fetch('http://localhost:8000/reputation')
            .then(r => r.json())
            .then(data => setReputations(data.leaderboard || []))
            .catch(console.error);
    };

    // Load agent profiles on mount
    useEffect(() => {
        fetch('http://localhost:8000/agents/profiles')
            .then(r => r.json())
            .then(data => setProfiles(data.agents || []))
            .catch(err => console.error("Failed to fetch profiles", err));
            
        fetchReputation();
    }, []);

    const handleRunAgents = async () => {
        setIsRunning(true);
        setResults(null);
        toast.info("Simulation Started", "Triggering all autonomous agents...");
        try {
            const res = await fetch('http://localhost:8000/agents/run', { method: 'POST' });
            if (!res.ok) throw new Error(`Server error: ${res.status}`);
            const data = await res.json();
            setResults(data);
            toast.success("Simulation Complete", "Agents have executed their decisions.");
            fetchReputation(); // Refresh reputation after runs
        } catch (err) {
            toast.error("Simulation Failed", err.message);
        } finally {
            setIsRunning(false);
        }
    };

    return (
        <div className="page-container">
            <PageHeader
                eyebrow="Simulation Environment"
                title="Agent Sandbox"
                description="Trigger all autonomous AI agents simultaneously. Low-risk decisions are executed on the HeLa blockchain automatically. High-risk decisions appear in the Command Center for your review."
                actions={
                    <button
                        onClick={handleRunAgents}
                        disabled={isRunning}
                        className="primary-btn hover-lift"
                    >
                        {isRunning ? (
                            <><Activity className="animate-spin" size={16} /> Executing...</>
                        ) : (
                            <><Play size={16} fill="currentColor" /> Run Simulation</>
                        )}
                    </button>
                }
            />

            <div className="dashboard-grid dashboard-grid-3-2 mb-8">
                <div className="sandbox-left">
                    <div className="glass" style={{ padding: '24px', borderRadius: 'var(--radius-lg)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
                            <div style={{ padding: '8px', borderRadius: '8px', background: 'rgba(99, 102, 241, 0.1)' }}>
                                <Zap className="text-accent-light" size={20} />
                            </div>
                            <div>
                                <h3 style={{ fontSize: '16px', fontWeight: 600 }}>Auto-Execution Threshold</h3>
                                <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Network rules for autonomous decisions</p>
                            </div>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px', background: 'rgba(34, 197, 94, 0.05)', border: '1px solid rgba(34, 197, 94, 0.2)', borderRadius: '8px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <CheckCircle2 size={16} className="text-success" />
                                    <span style={{ fontSize: '14px', fontWeight: 500, color: 'var(--success)' }}>Risk Score 1–5</span>
                                </div>
                                <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Auto-Executed on HeLa</span>
                            </div>

                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px', background: 'rgba(245, 158, 11, 0.05)', border: '1px solid rgba(245, 158, 11, 0.2)', borderRadius: '8px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <ShieldAlert size={16} className="text-warning" />
                                    <span style={{ fontSize: '14px', fontWeight: 500, color: 'var(--warning)' }}>Risk Score 6–10</span>
                                </div>
                                <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Queued for Command Center</span>
                            </div>
                        </div>

                    </div>

                    <h3 style={{ fontSize: '16px', fontWeight: 600, margin: '24px 0 16px' }}>Active Agents</h3>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '12px' }}>
                        {profiles.map(agent => (
                            <div key={agent.name} className="glass hover-lift" style={{ padding: '16px', borderRadius: 'var(--radius-md)', display: 'flex', gap: '16px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '40px', height: '40px', borderRadius: '50%', background: 'rgba(255, 255, 255, 0.05)' }}>
                                    <Bot size={20} className="text-accent-light" />
                                </div>
                                <div style={{ flex: 1 }}>
                                    <div style={{ fontWeight: 600, fontSize: '14px', marginBottom: '4px' }}>{agent.name}</div>
                                    <div style={{ fontSize: '13px', color: 'var(--text-muted)', lineHeight: 1.4 }}>{agent.description}</div>
                                    {reputations.find(r => r.name === agent.name) && (
                                        <div style={{ marginTop: '0.75rem', paddingTop: '0.75rem', borderTop: '1px solid rgba(255,255,255,0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <span style={{ color: '#a0a0a0', fontSize: '0.78rem' }}>On-Chain Reputation</span>
                                            <span style={{ 
                                                fontWeight: 'bold', 
                                                color: reputations.find(r => r.name === agent.name).reputation >= 100 ? '#4ade80' : 
                                                       reputations.find(r => r.name === agent.name).reputation >= 50 ? '#f59e0b' : '#ef4444' 
                                            }}>
                                                {reputations.find(r => r.name === agent.name).reputation} pts
                                            </span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="sandbox-right">
                    {isRunning ? (
                        <div className="loading-state-v2 glass h-full" style={{ minHeight: '400px' }}>
                            <div className="pulse-dot-wrapper">
                                <span className="pulse-dot-ping bg-accent-light" />
                                <span className="pulse-dot bg-accent-light" />
                            </div>
                            <div style={{ textAlign: 'center' }}>
                                <div style={{ fontWeight: 600, fontSize: '15px', color: 'var(--text-primary)', marginBottom: '4px' }}>Agents Executing</div>
                                <div style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Synthesizing intents and calling Gemini 2.5 Flash for risk assessment...</div>
                            </div>
                        </div>
                    ) : !results ? (
                        <div className="empty-state-v2 glass h-full" style={{ minHeight: '400px' }}>
                            <FlaskConical size={32} className="text-muted" />
                            <div style={{ textAlign: 'center' }}>
                                <div style={{ fontWeight: 600, fontSize: '15px', color: 'var(--text-primary)', marginBottom: '4px' }}>Awaiting Simulation</div>
                                <div style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Click Run Simulation to trigger the agents.</div>
                            </div>
                        </div>
                    ) : (
                        <div className="sandbox-results" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                            <div className="glass" style={{ padding: '16px', borderRadius: 'var(--radius-lg)', display: 'flex', justifyContent: 'space-around', textAlign: 'center' }}>
                                <div>
                                    <div style={{ fontSize: '11px', textTransform: 'uppercase', color: 'var(--text-muted)', letterSpacing: '0.05em', marginBottom: '4px' }}>Agents Run</div>
                                    <div style={{ fontSize: '24px', fontWeight: 600, fontFamily: 'var(--font-mono)' }}>{results.agents_run}</div>
                                </div>
                                <div>
                                    <div style={{ fontSize: '11px', textTransform: 'uppercase', color: 'var(--success)', letterSpacing: '0.05em', marginBottom: '4px' }}>Executed</div>
                                    <div style={{ fontSize: '24px', fontWeight: 600, color: 'var(--success)', fontFamily: 'var(--font-mono)' }}>{results.auto_executed}</div>
                                </div>
                                <div>
                                    <div style={{ fontSize: '11px', textTransform: 'uppercase', color: 'var(--warning)', letterSpacing: '0.05em', marginBottom: '4px' }}>Queued</div>
                                    <div style={{ fontSize: '24px', fontWeight: 600, color: 'var(--warning)', fontFamily: 'var(--font-mono)' }}>{results.pending_review}</div>
                                </div>
                            </div>

                            {results.results.map((r, idx) => {
                                const statusCfg = STATUS_CONFIG[r.status] || STATUS_CONFIG.execution_failed;
                                return (
                                    <div key={idx} className="glass" style={{ padding: '20px', borderRadius: 'var(--radius-md)' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                <Bot size={16} className="text-accent-light" />
                                                <span style={{ fontWeight: 600, fontSize: '15px' }}>{r.agent}</span>
                                            </div>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                                <RiskBadge score={r.risk_score} size="sm" />
                                                <span className={`status-badge ${statusCfg.class}`}>
                                                    <span className="dot" />
                                                    {statusCfg.label}
                                                </span>
                                            </div>
                                        </div>
                                        
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '13px' }}>
                                            <div style={{ display: 'grid', gridTemplateColumns: '100px 1fr', gap: '8px' }}>
                                                <span style={{ color: 'var(--text-muted)' }}>Action</span>
                                                <span style={{ fontWeight: 500 }}>{r.action}</span>
                                            </div>
                                            <div style={{ display: 'grid', gridTemplateColumns: '100px 1fr', gap: '8px' }}>
                                                <span style={{ color: 'var(--text-muted)' }}>Amount</span>
                                                <span style={{ fontFamily: 'var(--font-mono)' }}>{r.amount}</span>
                                            </div>
                                            <div style={{ display: 'grid', gridTemplateColumns: '100px 1fr', gap: '8px' }}>
                                                <span style={{ color: 'var(--text-muted)' }}>Explanation</span>
                                                <span style={{ color: 'var(--text-secondary)', lineHeight: 1.5, fontStyle: 'italic' }}>"{r.explanation}"</span>
                                            </div>
                                            
                                            {r.status === 'pending_review' && (
                                                <div style={{ marginTop: '8px', paddingTop: '12px', borderTop: '1px solid var(--border-glass)', textAlign: 'right' }}>
                                                    <button 
                                                        className="action-link"
                                                        onClick={() => navigate('/dashboard')}
                                                    >
                                                        Review in Command Center
                                                        <ChevronRight size={14} />
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AgentSandbox;
