import { useState, useEffect, useRef, useCallback } from 'react';
import { ethers } from 'ethers';
import { useWallet } from '../context/WalletContext';
import { useDecimal } from '../context/DecimalContext';
import normalizeBigInts from '../utils/normalizeBigInts';

/**
 * ⏱️ LOCAL STREAMING SIMULATION ENGINE
 * 
 * Architecture:
 * - Fetches stream data ONCE on mount
 * - Simulates earnings locally using: ratePerSecond × (currentTime - startTime)
 * - No polling (eliminates RPC spam)
 * - Contract remains authoritative (withdraw always calls contract)
 * - Drift correction on tab focus
 * 
 * Streaming Principle:
 * Contract calculates: earned = ratePerSecond × (block.timestamp - startTime)
 * Frontend mirrors this calculation using local clock
 * 
 * Security: Frontend simulation is DISPLAY ONLY
 * Actual withdraw() always uses contract-calculated values
 */
export default function EarningsTicker({ employeeAddress }) {
  const { contracts } = useWallet();
  const { formatValue } = useDecimal();
  const [grossValue, setGrossValue] = useState('0.000000');
  const [netValue, setNetValue] = useState('0.000000');
  
  // Stream parameters (fetched once)
  const [streamData, setStreamData] = useState({
    ratePerSecond: '0',
    startTime: '0',
    endTime: '0',
    withdrawn: '0',
    taxPercent: '0',
    paused: false,
  });
  
  const [initialized, setInitialized] = useState(false);
  const lastFetchTimestamp = useRef(Date.now());

  /**
   * Fetch stream details from contract (called once on mount + drift correction)
   */
  const fetchStreamData = useCallback(async () => {
    if (!contracts.salaryStream || !employeeAddress) return;
    try {
      console.log('🔄 Fetching stream data from contract (no polling)...');
      
      // Fetch complete stream details
      const details = await contracts.salaryStream.getStreamDetails(employeeAddress);
      const normalized = normalizeBigInts(details);
      
      // Store stream parameters for local simulation
      setStreamData({
        ratePerSecond: normalized[2],  // BigInt as string
        startTime: normalized[3],       // BigInt as string
        endTime: normalized[4],         // BigInt as string
        withdrawn: normalized[5],       // BigInt as string
        taxPercent: normalized[7],      // BigInt as string
        paused: normalized[8],          // boolean
      });
      
      setInitialized(true);
      lastFetchTimestamp.current = Date.now();
      
      console.log('✅ Stream data loaded:', {
        ratePerSecond: normalized[2],
        startTime: new Date(Number(normalized[3]) * 1000).toLocaleString(),
        endTime: new Date(Number(normalized[4]) * 1000).toLocaleString(),
        withdrawn: ethers.formatEther(normalized[5]),
        taxPercent: normalized[7] + '%',
        paused: normalized[8],
      });
    } catch (e) {
      console.error('❌ EarningsTicker fetch error:', e);
    }
  }, [contracts.salaryStream, employeeAddress]);

  /**
   * Fetch stream data ONCE on mount
   * NO polling intervals - pure local simulation
   */
  useEffect(() => {
    fetchStreamData();
  }, [fetchStreamData]);

  /**
   * DRIFT CORRECTION: Re-fetch on tab focus
   * Prevents clock drift when user switches tabs
   */
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && initialized) {
        console.log('👀 Tab focused - refreshing stream data for drift correction');
        fetchStreamData();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [initialized, fetchStreamData]);

  /**
   * LOCAL STREAMING SIMULATION
   * Updates every 1 second (smooth animation)
   * 
   * Formula (mirrors contract):
   * elapsed = currentTime - startTime
   * grossEarned = ratePerSecond × elapsed
   * withdrawable = grossEarned - withdrawn
   * netAmount = withdrawable - (withdrawable × taxPercent / 100)
   */
  useEffect(() => {
    if (!initialized) return;

    const simulateEarnings = () => {
      // Parse stream parameters
      const ratePerSecBigInt = BigInt(streamData.ratePerSecond || '0');
      const startTimeBigInt = BigInt(streamData.startTime || '0');
      const endTimeBigInt = BigInt(streamData.endTime || '0');
      const withdrawnBigInt = BigInt(streamData.withdrawn || '0');
      const taxPercentBigInt = BigInt(streamData.taxPercent || '0');

      if (ratePerSecBigInt === 0n) return;

      // If stream is paused, freeze simulation
      if (streamData.paused) {
        return;
      }

      // Get current time (Unix timestamp in seconds)
      const currentTime = BigInt(Math.floor(Date.now() / 1000));

      // Cap at endTime to prevent overearning
      const effectiveTime = currentTime < endTimeBigInt ? currentTime : endTimeBigInt;

      // Calculate elapsed time since stream start
      const elapsedSeconds = effectiveTime - startTimeBigInt;

      // Calculate gross earned: ratePerSecond × elapsed
      // This mirrors the contract's _earned() function
      const grossEarned = ratePerSecBigInt * elapsedSeconds;

      // Calculate withdrawable: earned - already withdrawn
      const grossWithdrawable = grossEarned > withdrawnBigInt 
        ? grossEarned - withdrawnBigInt 
        : 0n;

      // Apply tax calculation (display only - contract recalculates on withdraw)
      const taxAmount = (grossWithdrawable * taxPercentBigInt) / 100n;
      const netWithdrawable = grossWithdrawable - taxAmount;

      // Format for display using decimal context
      const grossFormatted = formatValue(grossWithdrawable);
      console.log(grossFormatted)
      const netFormatted = formatValue(netWithdrawable);

      setGrossValue(grossFormatted);
      setNetValue(netFormatted);
    };

    // Run simulation immediately
    simulateEarnings();

    // Update every 1 second for smooth animation
    const interval = setInterval(simulateEarnings, 1000);
    
    return () => clearInterval(interval);
  }, [initialized, streamData]);

  /**
   * DRIFT CORRECTION: Expose refresh function to parent
   * Parent calls this after successful withdraw
   */
  useEffect(() => {
    // Store refresh function globally so parent can trigger it
    if (typeof window !== 'undefined') {
      window.refreshEarningsTicker = fetchStreamData;
    }
  }, [fetchStreamData]);

  return (
    <div className="earnings-ticker">
      <div className="earnings-label">
        You Will Receive (After {streamData.taxPercent}% Tax)
        {streamData.paused && <span style={{ color: 'var(--red)', marginLeft: '0.5rem' }}>PAUSED</span>}
      </div>
      <div className="earnings-value">
        {netValue}
        <span className="earnings-unit">HLUSD</span>
      </div>
      <div className="form-hint" style={{ marginTop: '0.5rem', textAlign: 'center' }}>
        Gross: {grossValue} HLUSD · Tax: {streamData.taxPercent}%
      </div>
      
      {/* Countdown to stream end */}
      <StreamCountdown endTime={streamData.endTime} />
    </div>
  );
}

/**
 * Live countdown to stream end
 */
function StreamCountdown({ endTime }) {
  const [timeLeft, setTimeLeft] = useState('');

  useEffect(() => {
    const updateCountdown = () => {
      const endTimestamp = Number(endTime);
      if (!endTimestamp) return;

      const now = Math.floor(Date.now() / 1000);
      const remaining = endTimestamp - now;

      if (remaining <= 0) {
        setTimeLeft('Stream Ended');
        return;
      }

      const days = Math.floor(remaining / 86400);
      const hours = Math.floor((remaining % 86400) / 3600);
      const minutes = Math.floor((remaining % 3600) / 60);
      const seconds = remaining % 60;

      if (days > 0) {
        setTimeLeft(`${days}d ${hours}h ${minutes}m ${seconds}s remaining`);
      } else if (hours > 0) {
        setTimeLeft(`${hours}h ${minutes}m ${seconds}s remaining`);
      } else {
        setTimeLeft(`${minutes}m ${seconds}s remaining`);
      }
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, [endTime]);

  if (!timeLeft) return null;

  return (
    <div className="form-hint" style={{ marginTop: '0.75rem', textAlign: 'center', color: 'var(--text-dim)' }}>
      {timeLeft} remaining
    </div>
  );
}
