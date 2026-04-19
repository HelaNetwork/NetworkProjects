/**
 * Transaction Decoder Service
 * Decodes raw transaction data into human-readable format using ethers.js
 */
const { ethers } = require('ethers');
const { getAllAbis, categorizeFunction } = require('../utils/abiRegistry');
const { lookupContract, checkFlagged } = require('../utils/knownContracts');

// Maximum uint256 value (used for unlimited approvals)
const MAX_UINT256 = ethers.MaxUint256;
// Threshold: if approval is > 10^30, consider it "unlimited"
const UNLIMITED_THRESHOLD = ethers.parseUnits('1', 30);

/**
 * Decode a transaction's calldata
 * @param {Object} txData - Transaction object { to, data, value, from, gasLimit, gasPrice }
 * @returns {Object} Decoded transaction details
 */
function decodeTransaction(txData) {
  const result = {
    to: txData.to,
    from: txData.from || null,
    value: '0',
    valueEth: '0',
    gasLimit: txData.gasLimit || txData.gas || null,
    gasPrice: txData.gasPrice || null,
    functionName: null,
    functionSignature: null,
    category: 'unknown',
    args: {},
    decoded: false,
    contractInfo: null,
    flags: [],
    rawData: txData.data || '0x'
  };

  // Parse ETH value
  if (txData.value) {
    try {
      const valueBn = ethers.getBigInt(txData.value);
      result.value = valueBn.toString();
      result.valueEth = ethers.formatEther(valueBn);
    } catch (e) {
      result.value = txData.value;
    }
  }

  // Check if recipient is a known contract
  if (txData.to) {
    result.contractInfo = lookupContract(txData.to);
    const flagged = checkFlagged(txData.to);
    if (flagged) {
      result.flags.push({
        type: flagged.severity,
        message: flagged.reason
      });
    }
  }

  // If no data or just '0x', this is a simple ETH transfer
  if (!txData.data || txData.data === '0x' || txData.data.length < 10) {
    result.functionName = 'ETH Transfer';
    result.category = 'transfer';
    result.decoded = true;
    if (parseFloat(result.valueEth) > 0) {
      result.args = {
        to: txData.to,
        amount: `${result.valueEth} ETH`
      };
    }
    return result;
  }

  // Try to decode the calldata against known ABIs
  try {
    const iface = new ethers.Interface(getAllAbis());
    const parsed = iface.parseTransaction({ data: txData.data, value: txData.value || '0' });

    if (parsed) {
      result.functionName = parsed.name;
      result.functionSignature = parsed.signature;
      result.category = categorizeFunction(parsed.name);
      result.decoded = true;

      // Extract named arguments
      const fragment = parsed.fragment;
      if (fragment && fragment.inputs) {
        fragment.inputs.forEach((input, i) => {
          let value = parsed.args[i];
          // Format BigInt values
          if (typeof value === 'bigint') {
            value = value.toString();
          }
          // Format arrays
          if (Array.isArray(value)) {
            value = value.map(v => typeof v === 'bigint' ? v.toString() : v);
          }
          result.args[input.name || `arg${i}`] = value;
        });
      }

      // Check for unlimited approvals
      if (parsed.name === 'approve' || parsed.name === 'increaseAllowance') {
        const amount = parsed.args[1];
        if (typeof amount === 'bigint' && amount >= UNLIMITED_THRESHOLD) {
          result.flags.push({
            type: 'danger',
            message: 'UNLIMITED TOKEN APPROVAL detected! This gives the spender access to ALL your tokens of this type.'
          });
        }
      }

      // Check for setApprovalForAll
      if (parsed.name === 'setApprovalForAll') {
        const approved = parsed.args[1];
        if (approved === true) {
          result.flags.push({
            type: 'danger',
            message: 'This grants FULL access to ALL your NFTs in this collection. The operator can transfer any of them.'
          });
        }
      }
    }
  } catch (err) {
    // Decoding failed - extract function selector
    const selector = txData.data.slice(0, 10);
    result.functionName = `Unknown Function (${selector})`;
    result.flags.push({
      type: 'warning',
      message: 'Unable to decode transaction data. The contract function is not in our known ABI registry.'
    });
  }

  return result;
}

/**
 * Format decoded transaction into a human-readable summary
 */
function formatSummary(decoded) {
  const parts = [];

  switch (decoded.category) {
    case 'transfer':
      if (decoded.functionName === 'ETH Transfer') {
        parts.push(`Send ${decoded.valueEth} ETH to ${shortenAddress(decoded.to)}`);
      } else {
        const amount = decoded.args.amount || decoded.args.value || 'unknown amount';
        const to = decoded.args.to || decoded.to;
        parts.push(`Transfer ${amount} tokens to ${shortenAddress(to)}`);
      }
      break;

    case 'approval':
      const spender = decoded.args.spender || decoded.args.operator || decoded.args.to;
      const isUnlimited = decoded.flags.some(f => f.message.includes('UNLIMITED'));
      if (isUnlimited) {
        parts.push(`⚠️ Grant UNLIMITED token approval to ${shortenAddress(spender)}`);
      } else {
        parts.push(`Approve ${decoded.args.amount || 'tokens'} for ${shortenAddress(spender)}`);
      }
      break;

    case 'swap':
      parts.push(`Swap tokens via ${decoded.contractInfo?.name || shortenAddress(decoded.to)}`);
      if (decoded.args.amountIn) parts.push(`Input: ${decoded.args.amountIn}`);
      if (decoded.args.amountOutMin) parts.push(`Min output: ${decoded.args.amountOutMin}`);
      break;

    case 'staking':
      parts.push(`${capitalize(decoded.functionName)} via ${decoded.contractInfo?.name || shortenAddress(decoded.to)}`);
      if (decoded.args.amount) parts.push(`Amount: ${decoded.args.amount}`);
      break;

    case 'liquidity':
      parts.push(`${decoded.functionName} on ${decoded.contractInfo?.name || shortenAddress(decoded.to)}`);
      break;

    default:
      parts.push(`Call ${decoded.functionName} on ${decoded.contractInfo?.name || shortenAddress(decoded.to)}`);
      if (parseFloat(decoded.valueEth) > 0) {
        parts.push(`Sending ${decoded.valueEth} ETH with this call`);
      }
  }

  if (decoded.contractInfo) {
    parts.push(`Contract: ${decoded.contractInfo.name} (${decoded.contractInfo.trust} trust)`);
  }

  return parts.join('\n');
}

function shortenAddress(addr) {
  if (!addr) return 'unknown';
  return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
}

function capitalize(str) {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1);
}

module.exports = { decodeTransaction, formatSummary };
