import { useState, useEffect, useCallback } from 'react';
import { ethers } from 'ethers';
import { useDecimal } from '../context/DecimalContext';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';

let cachedPrices = { usd: 1, inr: 83.5 }; // HLUSD defaults ~1 USD
let lastFetch = 0;
const CACHE_MS = 60_000; // refresh every 60s

export async function fetchPrices() {
  if (Date.now() - lastFetch < CACHE_MS) return cachedPrices;
  try {
    const res = await fetch(`${API_BASE}/api/prices`);
    const data = await res.json();
    if (data?.success) {
      cachedPrices = { usd: data.usd ?? 1, inr: data.inr ?? 83.5 };
    }
    lastFetch = Date.now();
  } catch {
    // use defaults
  }
  return cachedPrices;
}

export function useHLUSDPrices() {
  const [prices, setPrices] = useState(cachedPrices);
  useEffect(() => {
    fetchPrices().then(setPrices);
    const iv = setInterval(() => fetchPrices().then(setPrices), CACHE_MS);
    return () => clearInterval(iv);
  }, []);
  return prices;
}

/**
 * Format a BigInt wei value to display string with HLUSD / USD / INR (full precision)
 */
export function formatMultiPrice(weiValue, prices, formatValue = null, decimals = 18) {
  if (!weiValue) return { hlusd: '0', usd: '0', inr: '0' };
  const val = formatValue ? formatValue(weiValue) : ethers.formatEther(weiValue);
  return {
    hlusd: val,
    usd: String(parseFloat(val) * prices.usd),
    inr: String(parseFloat(val) * prices.inr),
  };
}

/**
 * React component that shows price in HLUSD / USD / INR
 */
export function PriceDisplay({ wei, label, size = 'normal' }) {
  const prices = useHLUSDPrices();
  const { formatValue } = useDecimal();
  const fmt = formatMultiPrice(wei, prices, formatValue);
  const cls = size === 'large' ? 'price-display-lg' : 'price-display';
  return (
    <div className={cls}>
      {label && <span className="price-label">{label}</span>}
      <span className="price-hlusd">{fmt.hlusd} HLUSD</span>
      <span className="price-usd">${fmt.usd}</span>
      <span className="price-inr">₹{fmt.inr}</span>
    </div>
  );
}

export const ROLE_NAMES = { 0: 'None', 1: 'HR', 2: 'CEO' };

export function shortAddr(addr) {
  if (!addr) return '';
  return addr.slice(0, 6) + '...' + addr.slice(-4);
}
