import { ethers } from 'ethers';

/**
 * Fetch live exchange rates from CoinGecko API
 * @returns {Promise<{hlusdToInr: number, compositeRate: number}>}
 */
export async function fetchLiveRates() {
  const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';
  try {
    // Fetch via backend proxy to avoid CORS / rate-limit issues
    const response = await fetch(`${API_BASE}/api/prices`);
    if (!response.ok) throw new Error('Backend price proxy error');
    const data = await response.json();
    const hlusdToInr = data.hlusdToInr || 83;

    return {
      hlusdToInr,
      compositeRate: hlusdToInr
    };
  } catch (error) {
    console.error('Error fetching rates:', error);
    
    // Fallback rate for development
    return {
      hlusdToInr: 83,
      compositeRate: 83
    };
  }
}

/**
 * Sign exchange rate using oracle private key
 * @param {number} rate - Composite exchange rate (HLUSD → INR)
 * @param {number} timestamp - Unix timestamp in seconds
 * @param {string} oraclePrivateKey - Oracle wallet private key
 * @returns {Promise<{rate: bigint, timestamp: bigint, signature: string}>}
 */
export async function signRate(rate, timestamp, oraclePrivateKey) {
  try {
    // Create oracle wallet from private key
    const oracleWallet = new ethers.Wallet(oraclePrivateKey);

    // Scale rate to 18 decimals for smart contract
    const scaledRate = BigInt(Math.floor(rate * 1e18));
    const timestampBigInt = BigInt(timestamp);

    // Create message hash matching contract's _hashRate function
    const messageHash = ethers.solidityPackedKeccak256(
      ['uint256', 'uint256'],
      [scaledRate, timestampBigInt]
    );

    // Sign the message
    const signature = await oracleWallet.signMessage(
      ethers.getBytes(messageHash)
    );

    return {
      rate: scaledRate,
      timestamp: timestampBigInt,
      signature
    };
  } catch (error) {
    console.error('Error signing rate:', error);
    throw new Error('Failed to sign rate: ' + error.message);
  }
}

/**
 * Get signed rate from the backend oracle endpoint (secure — private key stays server-side).
 * Falls back to local signing only if VITE_ORACLE_PRIVATE_KEY is set (dev mode).
 * @param {string} [oraclePrivateKey] - DEPRECATED: only used as fallback in dev
 * @returns {Promise<{rate: bigint, timestamp: bigint, signature: string, compositeRate: number, hlusdToInr: number}>}
 */
export async function getSignedRate(oraclePrivateKey) {
  // Always prefer the backend endpoint
  const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';
  try {
    const res = await fetch(`${API_BASE}/api/oracle/signed-rate`);
    if (!res.ok) throw new Error('Backend oracle unavailable');
    const data = await res.json();
    if (!data.success) throw new Error(data.error);
    return {
      rate: BigInt(data.rate),
      timestamp: BigInt(data.timestamp),
      signature: data.signature,
      compositeRate: data.compositeRate,
      hlusdToInr: data.hlusdToInr,
    };
  } catch (backendErr) {
    console.warn('Backend oracle failed, trying local fallback:', backendErr.message);
  }

  // Fallback: local signing (dev only — remove in production)
  if (!oraclePrivateKey) {
    throw new Error('Oracle signing unavailable. Ensure the backend is running.');
  }

  const { compositeRate, hlusdToInr } = await fetchLiveRates();
  const timestamp = Math.floor(Date.now() / 1000);
  const signedData = await signRate(compositeRate, timestamp, oraclePrivateKey);

  return {
    ...signedData,
    compositeRate,
    hlusdToInr
  };
}

/**
 * Calculate conversion output
 * @param {string} hlusdAmount - Amount in HLUSD (in ether units)
 * @param {number} rate - Exchange rate (HLUSD → INR)
 * @param {number} feePercent - Fee percentage (default 1%)
 * @returns {{inrAmount: number, feeAmount: string, netAmount: string}}
 */
export function calculateConversion(hlusdAmount, rate, feePercent = 1) {
  const amountWei = ethers.parseEther(hlusdAmount.toString());
  const feeAmount = (amountWei * BigInt(feePercent)) / 100n;
  const netAmount = amountWei - feeAmount;
  
  // Calculate INR output
  const inrAmount = (Number(ethers.formatEther(netAmount)) * rate).toFixed(2);
  
  return {
    inrAmount: parseFloat(inrAmount),
    feeAmount: ethers.formatEther(feeAmount),
    netAmount: ethers.formatEther(netAmount)
  };
}

/**
 * Verify if a rate is still valid (not expired)
 * @param {number} rateTimestamp - Timestamp when rate was signed (Unix seconds)
 * @param {number} validityWindow - Validity window in seconds (default 300 = 5 minutes)
 * @returns {boolean}
 */
export function isRateValid(rateTimestamp, validityWindow = 300) {
  const now = Math.floor(Date.now() / 1000);
  return now <= rateTimestamp + validityWindow;
}

/**
 * Format conversion history for display
 * @param {Array} conversions - Array of conversion objects from contract
 * @returns {Array} Formatted conversions
 */
export function formatConversionHistory(conversions) {
  return conversions.map((conv, index) => ({
    id: index,
    hlusdAmount: ethers.formatEther(conv.hlusdAmount),
    inrAmount: Number(ethers.formatEther(conv.inrAmount)).toFixed(2),
    feeAmount: ethers.formatEther(conv.feeAmount),
    rate: (Number(conv.rateUsed) / 1e18).toFixed(2),
    timestamp: new Date(Number(conv.timestamp) * 1000).toLocaleString(),
    user: conv.user
  }));
}
