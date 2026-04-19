import { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { useDecimal } from '../context/DecimalContext';
import {
  fetchLiveRates,
  getSignedRate,
  calculateConversion,
  isRateValid,
  formatConversionHistory
} from '../services/offRampService';

const OffRampPanel = ({ offRampContract, userAddress }) => {
  const { formatValue } = useDecimal();
  const [amount, setAmount] = useState('');
  const [liveRate, setLiveRate] = useState(null);
  const [loading, setLoading] = useState(false);
  const [converting, setConverting] = useState(false);
  const [estimatedINR, setEstimatedINR] = useState(null);
  const [conversionHistory, setConversionHistory] = useState([]);
  const [stats, setStats] = useState({ volume: 0n, fees: 0n, count: 0 });
  const [error, setError] = useState('');
  const [rateTimestamp, setRateTimestamp] = useState(null);

  // Oracle key is only used as a dev fallback — backend signs in production
  const ORACLE_PRIVATE_KEY = import.meta.env.VITE_ORACLE_PRIVATE_KEY || null;

  // Fetch live rate on component mount and every 30 seconds
  useEffect(() => {
    fetchRate();
    const interval = setInterval(fetchRate, 30000); // Update every 30s
    return () => clearInterval(interval);
  }, []);

  // Update conversion history when contract or user changes
  useEffect(() => {
    if (offRampContract && userAddress) {
      loadConversionHistory();
      loadStats();
    }
  }, [offRampContract, userAddress]);

  // Calculate estimated INR when amount or rate changes
  useEffect(() => {
    if (amount && liveRate) {
      try {
        const result = calculateConversion(amount, liveRate.compositeRate, 1);
        setEstimatedINR(result);
      } catch (err) {
        setEstimatedINR(null);
      }
    } else {
      setEstimatedINR(null);
    }
  }, [amount, liveRate]);

  const fetchRate = async () => {
    try {
      const rates = await fetchLiveRates();
      const timestamp = Math.floor(Date.now() / 1000);
      setLiveRate(rates);
      setRateTimestamp(timestamp);
    } catch (err) {
      console.error('Error fetching rate:', err);
    }
  };

  const loadConversionHistory = async () => {
    try {
      console.log('Loading conversion history for:', userAddress);
      const conversionIds = await offRampContract.getUserConversions(userAddress);
      console.log('Conversion IDs:', conversionIds);
      
      if (!conversionIds || conversionIds.length === 0) {
        console.log('No conversions found');
        setConversionHistory([]);
        return;
      }
      
      const conversions = await Promise.all(
        conversionIds.map(id => offRampContract.getConversion(id))
      );
      console.log('Loaded conversions:', conversions);
      
      const formattedHistory = formatConversionHistory(conversions);
      console.log('Formatted history:', formattedHistory);
      setConversionHistory(formattedHistory);
    } catch (err) {
      console.error('Error loading conversion history:', err);
      console.error('Error details:', err.message, err.stack);
      setConversionHistory([]);
    }
  };

  const loadStats = async () => {
    try {
      console.log('Loading OffRamp stats...');
      const [volume, fees, count] = await offRampContract.getStats();
      const statsData = {
        volume: volume,
        fees: fees,
        count: Number(count)
      };
      console.log('Stats loaded:', statsData);
      setStats(statsData);
    } catch (err) {
      console.error('Error loading stats:', err);
      console.error('Error details:', err.message);
    }
  };

  const handleConvert = async () => {
    if (!amount || parseFloat(amount) <= 0) {
      setError('Please enter a valid amount');
      return;
    }

    setConverting(true);
    setError('');

    try {
      // Get signed rate data (from backend; falls back to local in dev)
      const signedData = await getSignedRate(ORACLE_PRIVATE_KEY);

      // Verify rate is still valid
      if (!isRateValid(Number(signedData.timestamp))) {
        throw new Error('Rate expired, please try again');
      }

      // Call contract
      const tx = await offRampContract.convertToFiat(
        signedData.rate,
        signedData.timestamp,
        signedData.signature,
        {
          value: ethers.parseEther(amount)
        }
      );

      console.log('Transaction sent:', tx.hash);
      await tx.wait();

      console.log('Conversion successful!');
      setAmount('');
      setEstimatedINR(null);

      // Reload data
      await loadConversionHistory();
      await loadStats();
    } catch (err) {
      console.error('Conversion error:', err);
      setError(err.message || 'Conversion failed');
    } finally {
      setConverting(false);
    }
  };

  const isRateFresh = rateTimestamp && isRateValid(rateTimestamp);

  // Calculate average conversion size
  const avgConversion = stats.count > 0 
    ? parseFloat(ethers.formatEther(stats.volume)) / stats.count 
    : 0;

  // Calculate fee percentage efficiency
  const feePercentage = stats.volume > 0n 
    ? (parseFloat(ethers.formatEther(stats.fees)) / parseFloat(ethers.formatEther(stats.volume))) * 100 
    : 1.0;

  return (
    <div className="offramp-panel">
      <h2>HLUSD to INR OffRamp</h2>

      {/* Live Rate & Conversion Form - Side by Side */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '30px' }}>
        {/* Live Rate Display */}
        <div className="rate-display">
          <div className="rate-card">
          <div className="rate-header">
            <h3>Live Exchange Rate</h3>
            {isRateFresh && (
              <span className="verified-badge">Verified On-Chain</span>
            )}
          </div>
          {liveRate ? (
            <div className="rate-details">
              <div className="main-rate">
                1 HLUSD = ₹{liveRate.compositeRate.toFixed(2)}
              </div>
              <div className="rate-breakdown">
                <span>Direct conversion: HLUSD → INR</span>
              </div>
              <div className="rate-source">
                <small>Source: CoinGecko • Updated every 30s</small>
              </div>
            </div>
          ) : (
            <div className="loading">Fetching rates...</div>
          )}
          </div>
        </div>

        {/* Conversion Form */}
        <div className="conversion-form">
        <h3>Convert HLUSD to INR</h3>
        
        <div className="input-group">
          <label>Amount (HLUSD)</label>
          <input
            type="number"
            placeholder="0.0"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            step="0.01"
            min="0"
          />
        </div>

        {estimatedINR && (
          <div className="estimation">
            <div className="est-row">
              <span>Amount:</span>
              <span>{amount} HLUSD</span>
            </div>
            <div className="est-row">
              <span>Transaction Fee (1%):</span>
              <span>{estimatedINR.feeAmount} HLUSD</span>
            </div>
            <div className="est-row">
              <span>Net Amount:</span>
              <span>{estimatedINR.netAmount} HLUSD</span>
            </div>
            <div className="est-row total">
              <span>You Receive:</span>
              <span>₹{estimatedINR.inrAmount}</span>
            </div>
          </div>
        )}

        {error && <div className="error-message">{error}</div>}

        <button
          onClick={handleConvert}
          disabled={converting || !amount || !liveRate}
          className="btn btn-cyan"
          style={{ width: '100%', marginTop: '1rem' }}
        >
          {converting ? (
            <>
              <span className="spinner" style={{ width: '16px', height: '16px', borderWidth: '2px' }} />
              Converting...
            </>
          ) : (
            'Convert to INR'
          )}
        </button>
        </div>
      </div>

      {/* Platform Stats */}
      <div className="platform-stats">
        <h3>OffRamp Platform Analytics</h3>
        <div className="stats-grid">
          <div className="stat-item">
            <div className="stat-label">Total Volume</div>
            <div className="stat-value">{formatValue(stats.volume)} HLUSD</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', marginTop: '4px' }}>
              ≈ ₹{(parseFloat(ethers.formatEther(stats.volume)) * (liveRate?.compositeRate || 83)).toFixed(2)}
            </div>
          </div>
          <div className="stat-item">
            <div className="stat-label">Fees Collected</div>
            <div className="stat-value">{formatValue(stats.fees)} HLUSD</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', marginTop: '4px' }}>
              1% platform fee
            </div>
          </div>
          <div className="stat-item">
            <div className="stat-label">Total Conversions</div>
            <div className="stat-value">{stats.count}</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', marginTop: '4px' }}>
              Lifetime transactions
            </div>
          </div>
          <div className="stat-item">
            <div className="stat-label">Exchange Rate</div>
            <div className="stat-value" style={{ color: 'var(--accent)' }}>
              {liveRate ? `₹${liveRate.compositeRate.toFixed(2)}` : 'Loading...'}
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', marginTop: '4px' }}>
              Per 1 HLUSD
            </div>
          </div>
        </div>

        {/* Additional Analytics Row */}
        <div className="stats-grid" style={{ marginTop: '1rem' }}>
          <div className="stat-item">
            <div className="stat-label">Avg Conversion</div>
            <div className="stat-value" style={{ color: 'var(--green)' }}>
              {avgConversion.toFixed(4)} HLUSD
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', marginTop: '4px' }}>
              ≈ ₹{(avgConversion * (liveRate?.compositeRate || 83)).toFixed(2)} per tx
            </div>
          </div>
          <div className="stat-item">
            <div className="stat-label">Fee Efficiency</div>
            <div className="stat-value" style={{ color: 'var(--amber)' }}>
              {feePercentage.toFixed(2)}%
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', marginTop: '4px' }}>
              Platform fee rate
            </div>
          </div>
          <div className="stat-item">
            <div className="stat-label">Net Conversion</div>
            <div className="stat-value" style={{ color: 'var(--text-secondary)' }}>
              {(parseFloat(ethers.formatEther(stats.volume)) - parseFloat(ethers.formatEther(stats.fees))).toFixed(4)} HLUSD
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', marginTop: '4px' }}>
              After fees deducted
            </div>
          </div>
          <div className="stat-item">
            <div className="stat-label">Conversion Status</div>
            <div className="stat-value" style={{ color: stats.count > 0 ? 'var(--green)' : 'var(--text-dim)' }}>
              {stats.count > 0 ? 'ACTIVE' : 'IDLE'}
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', marginTop: '4px' }}>
              Platform activity
            </div>
          </div>
        </div>
      </div>

      {/* Conversion History */}
      <div className="conversion-history">
        <h3>Your Conversion History</h3>
        {conversionHistory.length > 0 ? (
          <div className="history-table">
            <table>
              <thead>
                <tr>
                  <th>Date</th>
                  <th>HLUSD</th>
                  <th>INR Received</th>
                  <th>Fee</th>
                  <th>Rate</th>
                </tr>
              </thead>
              <tbody>
                {conversionHistory.map((conv) => (
                  <tr key={conv.id}>
                    <td>{conv.timestamp}</td>
                    <td>{conv.hlusdAmount}</td>
                    <td>₹{conv.inrAmount}</td>
                    <td>{conv.feeAmount}</td>
                    <td>₹{conv.rate}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="no-history">
            <p>No conversion history yet. Make your first conversion to see it here!</p>
            <small>Note: Conversion history is fetched from the blockchain. Check the browser console for any errors.</small>
          </div>
        )}
      </div>

      <style>{`
        .offramp-panel {
          max-width: 1200px;
          margin: 0 auto;
          padding: 20px;
        }

        .offramp-panel h2 {
          color: var(--text-primary);
          font-size: 1.5rem;
          margin-bottom: 1.5rem;
        }

        .rate-display {
          height: 100%;
        }

        .rate-card {
          background: var(--bg-card);
          color: var(--text-primary);
          padding: 25px;
          border-radius: 12px;
          border: 1px solid var(--border);
          height: 100%;
          display: flex;
          flex-direction: column;
        }

        .rate-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 15px;
        }

        .rate-header h3 {
          margin: 0;
          font-size: 1.2rem;
          color: var(--text-primary);
        }

        .verified-badge {
          background: rgba(255, 255, 255, 0.08);
          padding: 5px 12px;
          border-radius: 20px;
          font-size: 0.85rem;
          border: 1px solid var(--border);
          color: var(--green);
        }

        .main-rate {
          font-size: 2.5rem;
          font-weight: bold;
          margin-bottom: 10px;
          color: var(--text-primary);
          font-family: 'JetBrains Mono', monospace;
        }

        .rate-breakdown {
          font-size: 1rem;
          color: var(--text-secondary);
          margin-bottom: 10px;
        }

        .rate-source {
          color: var(--text-dim);
          font-size: 0.85rem;
        }

        .conversion-form {
          background: var(--bg-card);
          padding: 25px;
          border-radius: 12px;
          border: 1px solid var(--border);
          height: 100%;
          display: flex;
          flex-direction: column;
        }

        .conversion-form h3 {
          margin-top: 0;
          margin-bottom: 20px;
          color: var(--text-primary);
        }

        .input-group {
          margin-bottom: 20px;
        }

        .input-group label {
          display: block;
          margin-bottom: 8px;
          font-weight: 600;
          color: var(--text-secondary);
        }

        .input-group input {
          width: 100%;
          padding: 12px;
          font-size: 1rem;
          border: 1px solid var(--border);
          border-radius: 8px;
          background: var(--bg-secondary);
          color: var(--text-primary);
          transition: border-color 0.3s;
          box-sizing: border-box;
        }

        .input-group input:focus {
          outline: none;
          border-color: var(--accent);
        }

        .estimation {
          background: var(--bg-secondary);
          padding: 15px;
          border-radius: 8px;
          margin-bottom: 20px;
          border: 1px solid var(--border);
        }

        .est-row {
          color: var(--text-secondary);
          display: flex;
          justify-content: space-between;
          padding: 8px 0;
          font-size: 0.95rem;
        }

        .est-row.total {
          border-top: 1px solid var(--border);
          margin-top: 10px;
          padding-top: 12px;
          font-weight: bold;
          font-size: 1.1rem;
          color: var(--text-primary);
        }

        .convert-btn {
          width: 100%;
          padding: 15px;
          font-size: 1.1rem;
          font-weight: bold;
          background: var(--accent);
          color: #000;
          border: none;
          border-radius: 8px;
          cursor: pointer;
          transition: opacity 0.2s;
        }

        .convert-btn:hover:not(:disabled) {
          opacity: 0.85;
        }

        .convert-btn:disabled {
          opacity: 0.4;
          cursor: not-allowed;
        }

        .offramp-panel .error-message {
          background: rgba(255, 68, 68, 0.1);
          color: var(--red);
          padding: 12px;
          border-radius: 6px;
          margin-bottom: 15px;
          border: 1px solid rgba(255, 68, 68, 0.3);
        }

        .platform-stats {
          background: var(--bg-card);
          padding: 25px;
          border-radius: 12px;
          border: 1px solid var(--border);
          margin-bottom: 30px;
        }

        .platform-stats h3 {
          margin-top: 0;
          margin-bottom: 20px;
          color: var(--text-primary);
        }

        .stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 16px;
        }

        .stat-item {
          text-align: center;
          padding: 15px;
          background: var(--bg-secondary);
          border-radius: 8px;
          border: 1px solid var(--border);
        }

        .stat-label {
          font-size: 0.9rem;
          color: var(--text-dim);
          margin-bottom: 8px;
        }

        .stat-value {
          font-size: 1.5rem;
          font-weight: bold;
          color: var(--text-primary);
          font-family: 'JetBrains Mono', monospace;
        }

        .conversion-history {
          background: var(--bg-card);
          padding: 25px;
          border-radius: 12px;
          border: 1px solid var(--border);
        }

        .conversion-history h3 {
          margin-top: 0;
          margin-bottom: 20px;
          color: var(--text-primary);
        }

        .history-table {
          overflow-x: auto;
        }

        .offramp-panel table {
          width: 100%;
          border-collapse: collapse;
        }

        .offramp-panel th {
          background: var(--bg-secondary);
          padding: 12px;
          text-align: left;
          font-weight: 600;
          color: var(--text-secondary);
          border-bottom: 1px solid var(--border);
        }

        .offramp-panel td {
          padding: 12px;
          border-bottom: 1px solid var(--border);
          color: var(--text-secondary);
        }

        .offramp-panel tbody tr:hover {
          background: var(--bg-secondary);
        }

        .no-history {
          text-align: center;
          padding: 2rem;
          color: var(--text-dim);
        }

        .no-history small {
          color: var(--text-dim);
        }

        .loading {
          text-align: center;
          padding: 20px;
          font-style: italic;
          color: var(--text-dim);
        }

        @media (max-width: 768px) {
          .offramp-panel > div[style*="grid-template-columns"] {
            grid-template-columns: 1fr !important;
          }

          .main-rate {
            font-size: 2rem;
          }

          .stats-grid {
            grid-template-columns: 1fr;
          }

          .offramp-panel table {
            font-size: 0.85rem;
          }

          .offramp-panel th,
          .offramp-panel td {
            padding: 8px;
          }
        }
      `}</style>
    </div>
  );
};

export default OffRampPanel;
