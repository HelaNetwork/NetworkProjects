/**
 * Recursively converts all BigInt values in an object/array structure to strings.
 * 
 * This prevents React serialization errors when storing contract data in state.
 * BigInt values from ethers v6 cannot be serialized by JSON.stringify or React's
 * internal state management.
 * 
 * @param {*} obj - The object, array, or primitive value to normalize
 * @returns {*} A deep copy with all BigInt values converted to strings
 * 
 * @example
 * const raw = await contract.getStreamDetails(address);
 * const safe = normalizeBigInts(raw);
 * setStream(safe); // ✅ Safe for React state
 * 
 * @example
 * const balances = {
 *   total: 1000000000000000000n,
 *   reserved: 500000000000000000n,
 *   available: 500000000000000000n
 * };
 * const normalized = normalizeBigInts(balances);
 * // {
 * //   total: "1000000000000000000",
 * //   reserved: "500000000000000000",
 * //   available: "500000000000000000"
 * // }
 */
export function normalizeBigInts(obj) {
  // Handle null and undefined
  if (obj === null || obj === undefined) {
    return obj;
  }

  // Handle BigInt - convert to string
  if (typeof obj === 'bigint') {
    return obj.toString();
  }

  // Handle primitives (string, number, boolean)
  if (typeof obj !== 'object') {
    return obj;
  }

  // Handle Arrays
  if (Array.isArray(obj)) {
    return obj.map(item => normalizeBigInts(item));
  }

  // Handle Objects (including ethers.js struct returns)
  // Create a new object to avoid mutation
  const normalized = {};
  
  for (const key in obj) {
    // Only process own properties
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      normalized[key] = normalizeBigInts(obj[key]);
    }
  }

  return normalized;
}

/**
 * Custom JSON.stringify replacer for BigInt values.
 * Use this when you need to stringify objects that may contain BigInt.
 * 
 * @example
 * console.log(JSON.stringify(data, bigIntReplacer, 2));
 */
export function bigIntReplacer(key, value) {
  return typeof value === 'bigint' ? value.toString() : value;
}

/**
 * Safe formatter for ether values that handles both BigInt and string inputs.
 * Always normalizes to string first to prevent BigInt serialization issues.
 * 
 * @param {bigint|string} value - The wei value to format
 * @param {number} decimals - Number of decimal places to show (default: 4)
 * @returns {string} Formatted ether value
 * 
 * @example
 * formatEtherSafe(1500000000000000000n) // "1.5000"
 * formatEtherSafe("1500000000000000000") // "1.5000"
 */
export function formatEtherSafe(value, decimals = 4) {
  // Import ethers dynamically to avoid circular dependencies
  const { ethers } = require('ethers');
  
  // Handle null/undefined
  if (value === null || value === undefined) {
    return '0.0000';
  }

  // Convert BigInt to string if needed
  const stringValue = typeof value === 'bigint' ? value.toString() : value;
  
  // Format using ethers
  const formatted = ethers.formatEther(stringValue);
  
  // Limit decimal places
  const num = parseFloat(formatted);
  return num.toFixed(decimals);
}

/**
 * Extract numeric fields from a contract struct that need normalization.
 * This is useful when you only need specific BigInt fields converted.
 * 
 * @param {Object} struct - Contract return struct
 * @param {string[]} fields - Array of field names to normalize
 * @returns {Object} Object with only specified fields, normalized
 */
export function extractAndNormalize(struct, fields) {
  const result = {};
  fields.forEach(field => {
    if (struct[field] !== undefined) {
      result[field] = normalizeBigInts(struct[field]);
    }
  });
  return result;
}

export default normalizeBigInts;
