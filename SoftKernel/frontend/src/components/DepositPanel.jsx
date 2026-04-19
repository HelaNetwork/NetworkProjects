import { useState } from 'react';
import { ethers } from 'ethers';
import { useWallet } from '../context/WalletContext';

export default function DepositPanel({ onSuccess }) {
  const { contracts, account } = useWallet();
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);

  const handleDeposit = async () => {
    if (!amount || parseFloat(amount) <= 0) return;
    setLoading(true);
    
    console.log('💸 Initiating deposit...');
    console.log('  Account:', account);
    console.log('  Amount:', amount, 'HLUSD');
    console.log('  Treasury contract:', await contracts.treasury.getAddress());
    
    try {
      const tx = await contracts.treasury.deposit({
        value: ethers.parseEther(amount),
      });
      console.log('📝 Transaction sent:', tx.hash);
      console.log('  From:', tx.from);
      console.log('  To:', tx.to);
      console.log('  Value:', ethers.formatEther(tx.value), 'HLUSD');
      
      onSuccess?.(`Depositing... TX: ${tx.hash}`, 'info');
      await tx.wait();
      
      console.log('✅ Deposit confirmed!');
      onSuccess?.(`Successfully deposited ${amount} HLUSD`, 'success', tx.hash);
      setAmount('');
    } catch (err) {
      console.error('❌ Deposit error:', err);
      onSuccess?.(err.reason || err.message || 'Deposit failed', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="glass-card">
      <div className="card-header">
        <span className="card-title">Deposit Funds</span>
      </div>
      
      {/* Important Notice */}
      <div style={{ 
        background: 'var(--amber-dim)', 
        border: '1px solid rgba(245, 158, 11, 0.2)',
        borderRadius: 'var(--radius-sm)',
        padding: '12px',
        marginBottom: '1rem',
        fontSize: '0.85rem'
      }}>
        <div style={{ fontWeight: 600, marginBottom: '4px', color: 'var(--amber)' }}>
          Important: Account-Based Deposits
        </div>
        <div style={{ opacity: 0.9, fontSize: '0.8rem' }}>
          Deposits are credited to the connected wallet: <strong>{account?.slice(0, 6)}...{account?.slice(-4)}</strong>
          <br />
          To view this balance, make sure you're connected to the same account.
        </div>
      </div>

      <div className="form-group">
        <label className="form-label">Amount (HLUSD)</label>
        <input
          className="form-input"
          type="number"
          placeholder="0.0"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          disabled={loading}
          min="0"
          step="0.01"
        />
        <div className="form-hint">Deposits native HLUSD into the Treasury</div>
      </div>
      <button
        className="btn btn-cyan"
        onClick={handleDeposit}
        disabled={loading || !amount || parseFloat(amount) <= 0}
      >
        {loading ? (
          <>
            <span className="spinner" />
            Processing...
          </>
        ) : (
          <>Deposit Funds</>
        )}
      </button>
    </div>
  );
}
