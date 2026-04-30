/**
 * Risk Detection Engine
 * Analyzes decoded transactions for potential threats and assigns risk scores
 */

const { lookupContract, checkFlagged, checkSelector } = require('../utils/knownContracts');

// Risk weights for different threat categories
const RISK_WEIGHTS = {
  unlimitedApproval: 35,
  setApprovalForAll: 30,
  unknownContract: 15,
  unverifiedContract: 10,
  highValue: 10,
  suspiciousGas: 8,
  flaggedAddress: 40,
  unknownFunction: 12,
  multipleFlags: 10,
  noContractInfo: 8,
  emptyTo: 25,
  selfDestruct: 45,
  delegateCall: 20
};

/**
 * Analyze a decoded transaction for risks
 * @param {Object} decoded - Decoded transaction from decoder service
 * @returns {Object} Risk assessment { score, level, threats, recommendations }
 */
function assessRisk(decoded) {
  const threats = [];
  let totalScore = 0;

  // 1. Check for unlimited token approvals
  if (decoded.flags?.some(f => f.message?.includes('UNLIMITED'))) {
    threats.push({
      id: 'unlimited_approval',
      severity: 'high',
      title: 'Unlimited Token Approval',
      description: 'This transaction requests unlimited access to your tokens. A malicious or compromised contract could drain ALL tokens of this type from your wallet.',
      weight: RISK_WEIGHTS.unlimitedApproval
    });
    totalScore += RISK_WEIGHTS.unlimitedApproval;
  }

  // 2. Check for setApprovalForAll (NFTs)
  if (decoded.functionName === 'setApprovalForAll') {
    const isApproving = decoded.args?.approved === true || decoded.args?.approved === 'true';
    if (isApproving) {
      threats.push({
        id: 'approval_for_all',
        severity: 'high',
        title: 'Full NFT Collection Access',
        description: 'This grants the operator full control over ALL your NFTs in this collection. They can transfer any of them at any time.',
        weight: RISK_WEIGHTS.setApprovalForAll
      });
      totalScore += RISK_WEIGHTS.setApprovalForAll;
    }
  }

  // 3. Check if contract is unknown
  if (!decoded.contractInfo && decoded.to) {
    threats.push({
      id: 'unknown_contract',
      severity: 'medium',
      title: 'Unknown Contract',
      description: `The contract at ${decoded.to} is not in our verified database. Proceed with caution and verify the contract on a block explorer.`,
      weight: RISK_WEIGHTS.unknownContract
    });
    totalScore += RISK_WEIGHTS.unknownContract;
  }

  // 4. Check flagged addresses
  if (decoded.to) {
    const flagged = checkFlagged(decoded.to);
    if (flagged) {
      threats.push({
        id: 'flagged_address',
        severity: 'high',
        title: 'Flagged Address',
        description: flagged.reason,
        weight: RISK_WEIGHTS.flaggedAddress
      });
      totalScore += RISK_WEIGHTS.flaggedAddress;
    }
  }

  // 5. Check for high-value transaction
  if (decoded.valueEth && parseFloat(decoded.valueEth) > 1.0) {
    threats.push({
      id: 'high_value',
      severity: 'medium',
      title: 'High-Value Transaction',
      description: `This transaction sends ${decoded.valueEth} ETH (significant value). Double-check the recipient address.`,
      weight: RISK_WEIGHTS.highValue
    });
    totalScore += RISK_WEIGHTS.highValue;
  }

  // 6. Check for unknown/undecodable functions
  if (!decoded.decoded && decoded.rawData && decoded.rawData.length > 10) {
    threats.push({
      id: 'unknown_function',
      severity: 'medium',
      title: 'Unrecognized Function Call',
      description: 'The function being called could not be decoded. This might be a custom or obfuscated contract function.',
      weight: RISK_WEIGHTS.unknownFunction
    });
    totalScore += RISK_WEIGHTS.unknownFunction;
  }

  // 7. Check for suspicious gas
  if (decoded.gasLimit) {
    const gasNum = parseInt(decoded.gasLimit);
    if (gasNum > 500000) {
      threats.push({
        id: 'high_gas',
        severity: 'low',
        title: 'High Gas Limit',
        description: `Gas limit of ${gasNum.toLocaleString()} is unusually high. This could indicate complex contract interactions.`,
        weight: RISK_WEIGHTS.suspiciousGas
      });
      totalScore += RISK_WEIGHTS.suspiciousGas;
    }
  }

  // 8. Check for missing recipient
  if (!decoded.to || decoded.to === '0x' || decoded.to === '0x0000000000000000000000000000000000000000') {
    threats.push({
      id: 'no_recipient',
      severity: 'high',
      title: 'Contract Creation or Missing Recipient',
      description: 'This transaction has no recipient address, which means it is deploying a new contract. Be extremely cautious.',
      weight: RISK_WEIGHTS.emptyTo
    });
    totalScore += RISK_WEIGHTS.emptyTo;
  }

  // 9. Check function selector against known suspicious ones
  if (decoded.rawData && decoded.rawData.length >= 10) {
    const selector = decoded.rawData.slice(0, 10);
    const suspicious = checkSelector(selector);
    if (suspicious && !threats.some(t => t.id === 'unlimited_approval' || t.id === 'approval_for_all')) {
      threats.push({
        id: 'suspicious_selector',
        severity: 'medium',
        title: `Sensitive Function: ${suspicious.name}`,
        description: suspicious.risk,
        weight: 5
      });
      totalScore += 5;
    }
  }

  // Cap score at 100
  totalScore = Math.min(totalScore, 100);

  // Determine risk level
  let level;
  if (totalScore >= 67) level = 'high';
  else if (totalScore >= 34) level = 'medium';
  else level = 'low';

  // Generate recommendations
  const recommendations = generateRecommendations(threats, decoded, level);

  return {
    score: totalScore,
    level,
    threats,
    recommendations,
    summary: generateRiskSummary(level, threats)
  };
}

/**
 * Generate safety recommendations based on detected threats
 */
function generateRecommendations(threats, decoded, level) {
  const recs = [];

  if (level === 'high') {
    recs.push({
      icon: '🛑',
      action: 'Consider Rejecting',
      detail: 'This transaction has significant risk indicators. Unless you fully trust the contract, consider rejecting it.'
    });
  }

  // Specific recommendations based on threats
  const threatIds = threats.map(t => t.id);

  if (threatIds.includes('unlimited_approval')) {
    recs.push({
      icon: '🔒',
      action: 'Reduce Approval Amount',
      detail: 'Instead of unlimited approval, set a specific amount that you intend to use. Most dApps allow custom approval amounts.'
    });
  }

  if (threatIds.includes('approval_for_all')) {
    recs.push({
      icon: '🖼️',
      action: 'Use a Burner Wallet for NFTs',
      detail: 'Consider using a separate "hot" wallet for NFT interactions to protect your main collection.'
    });
  }

  if (threatIds.includes('unknown_contract')) {
    recs.push({
      icon: '🔍',
      action: 'Verify on Block Explorer',
      detail: 'Check the contract on Etherscan or similar explorer. Look for verified source code, audit reports, and community feedback.'
    });
  }

  if (threatIds.includes('high_value')) {
    recs.push({
      icon: '💰',
      action: 'Double-Check Recipient',
      detail: 'For high-value transactions, always verify the recipient address character by character. Consider sending a small test amount first.'
    });
  }

  if (threatIds.includes('flagged_address')) {
    recs.push({
      icon: '⛔',
      action: 'Reject Transaction',
      detail: 'This address has been flagged. Do NOT proceed with this transaction.'
    });
  }

  // General safety tips
  if (recs.length === 0) {
    recs.push({
      icon: '✅',
      action: 'Transaction Looks Safe',
      detail: 'No significant risks detected. Always stay vigilant and verify contract addresses from official sources.'
    });
  }

  recs.push({
    icon: '🔐',
    action: 'Use Hardware Wallet',
    detail: 'For maximum security, always confirm transactions on a hardware wallet.'
  });

  return recs;
}

/**
 * Generate a human-readable risk summary
 */
function generateRiskSummary(level, threats) {
  if (threats.length === 0) {
    return 'No significant risks detected for this transaction.';
  }

  const highThreats = threats.filter(t => t.severity === 'high');
  const medThreats = threats.filter(t => t.severity === 'medium');

  let summary = '';
  if (highThreats.length > 0) {
    summary += `⚠️ ${highThreats.length} high-risk issue(s) detected. `;
  }
  if (medThreats.length > 0) {
    summary += `${medThreats.length} medium-risk issue(s) found. `;
  }
  summary += `Review the details below before proceeding.`;

  return summary;
}

module.exports = { assessRisk };
