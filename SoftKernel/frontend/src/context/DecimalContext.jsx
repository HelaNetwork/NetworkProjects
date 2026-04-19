import { createContext, useContext, useState, useCallback } from 'react';
import { ethers } from 'ethers';

const DecimalContext = createContext(null);

const PRECISION_OPTIONS = [
  { label: '4', value: 4 },
  { label: '6', value: 6 },
  { label: '8', value: 8 },
  { label: '10', value: 10 },
];

export function DecimalProvider({ children }) {
  const [precision, setPrecision] = useState(4);

  const formatValue = useCallback((weiOrString, forceDecimals) => {
    const dec = forceDecimals ?? precision;
    try {
      let raw;
      if (typeof weiOrString === 'bigint') {
        raw = ethers.formatEther(weiOrString);
      } else if (typeof weiOrString === 'string' && weiOrString.length > 0) {
        // Check if it looks like a wei value (pure digits)
        if (/^\d+$/.test(weiOrString)) {
          raw = ethers.formatEther(weiOrString);
        } else {
          raw = weiOrString;
        }
      } else if (typeof weiOrString === 'number') {
        raw = String(weiOrString);
      } else {
        return '0.' + '0'.repeat(dec);
      }
      const num = parseFloat(raw);
      if (isNaN(num)) return '0.' + '0'.repeat(dec);
      return num.toFixed(dec);
    } catch {
      return '0.' + '0'.repeat(dec);
    }
  }, [precision]);

  return (
    <DecimalContext.Provider value={{ precision, setPrecision, formatValue, PRECISION_OPTIONS }}>
      {children}
    </DecimalContext.Provider>
  );
}

export function useDecimal() {
  const ctx = useContext(DecimalContext);
  if (!ctx) throw new Error('useDecimal must be used within DecimalProvider');
  return ctx;
}

export function PrecisionToggle() {
  const { precision, setPrecision, PRECISION_OPTIONS } = useDecimal();
  return (
    <div className="precision-toggle">
      <span className="precision-label">Decimals</span>
      <div className="precision-options">
        {PRECISION_OPTIONS.map(opt => (
          <button
            key={opt.value}
            className={`precision-btn ${precision === opt.value ? 'active' : ''}`}
            onClick={() => setPrecision(opt.value)}
          >
            {opt.label}
          </button>
        ))}
      </div>
    </div>
  );
}
