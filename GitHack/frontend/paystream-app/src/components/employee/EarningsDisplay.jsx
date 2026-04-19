import { useState, useEffect, useRef } from 'react';
import { calculateAccrued, ethers } from '../../services/contractService';

export default function EarningsDisplay({ stream, onWithdraw, onPause, loading }) {
    const [earned, setEarned] = useState('0.0000');
    const intervalRef = useRef(null);

    useEffect(() => {
        if (!stream || !stream.active) {
            setEarned('0.0000');
            return;
        }

        const updateEarnings = async () => {
            try {
                const accrued = await calculateAccrued(stream.id);
                const formatted = Number(ethers.formatEther(accrued)).toFixed(6);
                setEarned(formatted);
            } catch (err) {
                // Fallback
                const now = Math.floor(Date.now() / 1000);
                const elapsed = now - Number(stream.lastClaimTime);
                const rate = Number(ethers.formatEther(stream.ratePerSecond));
                const calculated = (rate * elapsed).toFixed(6);
                setEarned(calculated);
            }
        };

        updateEarnings();
        intervalRef.current = setInterval(updateEarnings, 1000);
        return () => clearInterval(intervalRef.current);
    }, [stream]);

    if (!stream) return null;

    const rateFormatted = Number(ethers.formatEther(stream.ratePerSecond));
    const dailyRate = (rateFormatted * 86400).toFixed(2);

    return (
        <div className="glass-card earnings-card" style={{ background: 'var(--surface-card)', border: '1px solid var(--glass-border)' }}>
            <div className="card-header" style={{ marginBottom: '1.5rem', justifyContent: 'center' }}>
                <h2 className="card-title text-center">
                    {stream.active ? 'Real-time Earnings' : 'Stream Paused'}
                </h2>
            </div>

            <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                <div style={{
                    fontSize: '3.5rem',
                    fontWeight: 800,
                    background: 'var(--gradient-primary)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    lineHeight: 1
                }}>
                    {earned}
                </div>
                <div style={{
                    fontSize: '1rem',
                    color: 'var(--text-muted)',
                    marginTop: '0.5rem',
                    fontWeight: 600,
                    letterSpacing: '0.05em'
                }}>
                    HLUSD ACCRUED
                </div>
            </div>

            {stream.active && (
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr',
                    gap: '1rem',
                    marginBottom: '2rem',
                    padding: '1rem',
                    background: 'rgba(255,255,255,0.03)',
                    borderRadius: 'var(--radius-md)'
                }}>
                    <div style={{ textAlign: 'center' }}>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Current Rate</div>
                        <div style={{ fontWeight: 600, fontSize: '1.1rem' }}>{rateFormatted}/s</div>
                    </div>
                    <div style={{ textAlign: 'center' }}>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Daily Income</div>
                        <div style={{ fontWeight: 600, fontSize: '1.1rem' }}>{dailyRate}</div>
                    </div>
                </div>
            )}

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <button
                    className="btn btn-primary"
                    style={{ width: '100%', padding: '1rem', fontSize: '1.1rem' }}
                    onClick={onWithdraw}
                    disabled={loading || Number(earned) <= 0}
                >
                    {loading ? (
                        <>
                            <span className="spinner"></span>
                            Processing Withdrawal...
                        </>
                    ) : (
                        <>
                            Withdraw to Wallet
                        </>
                    )}
                </button>

                <button
                    className="btn"
                    style={{ width: '100%', background: '#10b981', color: 'white', border: 'none', padding: '1rem', fontSize: '1.1rem' }}
                    onClick={() => {
                        const amt = prompt("Amount to Cash Out (USD):");
                        if (amt) alert(`Success! $${amt} sent to Bank Account ****1234\n(Mock Ramp Integration)`);
                    }}
                >
                    Cash Out to Bank
                </button>

                {stream.active && (
                    <button
                        className="btn"
                        style={{ width: '100%', background: 'transparent', border: '1px solid var(--warning)', color: 'var(--warning)', padding: '0.75rem' }}
                        onClick={onPause}
                        disabled={loading}
                    >
                        Pause Stream (Emergency)
                    </button>
                )}
            </div>
        </div>
    );
}
