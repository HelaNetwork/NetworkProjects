import { useState, useEffect, useRef } from 'react';
import { calculateAccrued, ethers } from '../services/contractService';

export default function EarningsDisplay({ stream, onWithdraw, loading }) {
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
        <div className="glass-card earnings-card">
            <div className="earnings-label">
                {stream.active ? '💰 Current Earnings' : '⏸ Stream Paused'}
            </div>
            <div className="earnings-value">{earned}</div>
            <div className="earnings-token">HLUSD</div>
            {stream.active && (
                <div className="earnings-rate">
                    Streaming {rateFormatted} HLUSD/sec · ~{dailyRate} HLUSD/day
                </div>
            )}
            <button
                className="btn-withdraw"
                onClick={onWithdraw}
                disabled={loading || Number(earned) <= 0}
            >
                {loading ? (
                    <>
                        <div className="spinner"></div>
                        Withdrawing...
                    </>
                ) : (
                    <>
                        <span className="withdraw-icon">💸</span>
                        Withdraw to Wallet
                    </>
                )}
            </button>

            <button
                className="btn-withdraw"
                style={{ marginTop: '12px', backgroundColor: '#10b981', width: '100%' }}
                onClick={() => {
                    const amt = prompt("Amount to Cash Out (USD):");
                    if (amt) alert(`✅ Success! $${amt} sent to Bank Account ****1234\n(Mock Ramp Integration)`);
                }}
            >
                🏦 Cash Out to Bank
            </button>
        </div>
    );
}
