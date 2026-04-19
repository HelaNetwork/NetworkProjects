/**
 * Transaction Simulator Service
 * Simulates the effects of a transaction before signing
 */

const { ethers } = require('ethers');
const { decodeTransaction } = require('./decoder');

// Maximum uint256 for unlimited detection
const MAX_UINT256_STR = '115792089237316195423570985008687907853269984665640564039457584007913129639935';

/**
 * Simulate a transaction and return predicted outcomes
 * @param {Object} txData - Raw transaction data
 * @returns {Object} Simulation results
 */
function simulateTransaction(txData) {
  const decoded = decodeTransaction(txData);
  const simulation = {
    decoded,
    effects: [],
    warnings: [],
    balanceChanges: [],
    approvalChanges: [],
    nftTransfers: [],
    summary: ''
  };

  // Analyze based on decoded category
  switch (decoded.category) {
    case 'transfer':
      simulateTransfer(decoded, simulation, txData);
      break;
    case 'approval':
      simulateApproval(decoded, simulation);
      break;
    case 'swap':
      simulateSwap(decoded, simulation);
      break;
    case 'staking':
      simulateStaking(decoded, simulation);
      break;
    case 'liquidity':
      simulateLiquidity(decoded, simulation);
      break;
    default:
      simulateGeneric(decoded, simulation);
  }

  // Add gas cost estimation
  const gasLimit = parseInt(decoded.gasLimit) || 21000;
  const gasPrice = decoded.gasPrice ? parseInt(decoded.gasPrice) : 20000000000; // 20 gwei default
  const gasCostWei = BigInt(gasLimit) * BigInt(gasPrice);
  const gasCostEth = ethers.formatEther(gasCostWei);

  simulation.gasCost = {
    gasLimit,
    gasPriceGwei: (gasPrice / 1e9).toFixed(2),
    estimatedCostEth: gasCostEth,
    estimatedCostUsd: null // Placeholder for price feed integration
  };

  simulation.balanceChanges.push({
    token: 'ETH (Gas)',
    change: `-${gasCostEth}`,
    direction: 'out',
    type: 'gas'
  });

  // Generate summary
  simulation.summary = generateSimulationSummary(simulation);

  return simulation;
}

function simulateTransfer(decoded, simulation, txData) {
  if (decoded.functionName === 'ETH Transfer') {
    simulation.effects.push({
      type: 'eth_transfer',
      description: `Send ${decoded.valueEth} ETH`,
      icon: '💸'
    });
    simulation.balanceChanges.push({
      token: 'ETH',
      change: `-${decoded.valueEth}`,
      direction: 'out',
      type: 'transfer'
    });
  } else if (decoded.functionName === 'transfer' || decoded.functionName === 'transferFrom') {
    const amount = decoded.args.amount || decoded.args.value || '?';
    simulation.effects.push({
      type: 'token_transfer',
      description: `Transfer ${amount} tokens to ${shortenAddr(decoded.args.to || decoded.to)}`,
      icon: '📤'
    });
    simulation.balanceChanges.push({
      token: decoded.contractInfo?.name || 'Unknown Token',
      change: `-${amount}`,
      direction: 'out',
      type: 'transfer'
    });
  } else if (decoded.functionName?.includes('safeTransferFrom')) {
    // NFT transfer
    const tokenId = decoded.args.tokenId || decoded.args.id || '?';
    simulation.effects.push({
      type: 'nft_transfer',
      description: `Transfer NFT #${tokenId}`,
      icon: '🖼️'
    });
    simulation.nftTransfers.push({
      collection: decoded.contractInfo?.name || decoded.to,
      tokenId,
      direction: 'out'
    });
  }

  // Add ETH value if present with token transfer
  if (parseFloat(decoded.valueEth) > 0 && decoded.functionName !== 'ETH Transfer') {
    simulation.balanceChanges.push({
      token: 'ETH',
      change: `-${decoded.valueEth}`,
      direction: 'out',
      type: 'value'
    });
  }
}

function simulateApproval(decoded, simulation) {
  const spender = decoded.args.spender || decoded.args.operator || decoded.args.to;
  const amount = decoded.args.amount;

  if (decoded.functionName === 'setApprovalForAll') {
    const approving = decoded.args.approved !== false;
    simulation.effects.push({
      type: 'nft_approval',
      description: approving
        ? `Grant FULL access to all NFTs in this collection to ${shortenAddr(spender)}`
        : `Revoke NFT access from ${shortenAddr(spender)}`,
      icon: approving ? '⚠️' : '✅'
    });
    simulation.approvalChanges.push({
      type: 'NFT Collection',
      spender,
      scope: 'all',
      action: approving ? 'approve' : 'revoke'
    });
    if (approving) {
      simulation.warnings.push({
        type: 'danger',
        message: 'This gives the operator the ability to transfer ANY of your NFTs from this collection at any time.'
      });
    }
  } else {
    // Token approval
    const isUnlimited = amount === MAX_UINT256_STR ||
      (typeof amount === 'bigint' && amount.toString() === MAX_UINT256_STR);

    simulation.effects.push({
      type: 'token_approval',
      description: isUnlimited
        ? `Grant UNLIMITED token spending to ${shortenAddr(spender)}`
        : `Approve ${amount} tokens for ${shortenAddr(spender)}`,
      icon: isUnlimited ? '⚠️' : '🔓'
    });
    simulation.approvalChanges.push({
      type: 'Token',
      token: decoded.contractInfo?.name || 'Unknown Token',
      spender,
      amount: isUnlimited ? 'UNLIMITED' : amount,
      action: 'approve'
    });
    if (isUnlimited) {
      simulation.warnings.push({
        type: 'danger',
        message: 'UNLIMITED APPROVAL: The spender can access ALL your tokens of this type, now and in the future.'
      });
    }
  }
}

function simulateSwap(decoded, simulation) {
  simulation.effects.push({
    type: 'token_swap',
    description: `Swap tokens via ${decoded.contractInfo?.name || 'DEX'}`,
    icon: '🔄'
  });

  if (decoded.args.amountIn) {
    simulation.balanceChanges.push({
      token: 'Input Token',
      change: `-${decoded.args.amountIn}`,
      direction: 'out',
      type: 'swap'
    });
  }

  if (decoded.args.amountOutMin) {
    simulation.balanceChanges.push({
      token: 'Output Token',
      change: `+${decoded.args.amountOutMin} (minimum)`,
      direction: 'in',
      type: 'swap'
    });
  }

  if (decoded.args.deadline) {
    const deadline = parseInt(decoded.args.deadline);
    const now = Math.floor(Date.now() / 1000);
    if (deadline < now) {
      simulation.warnings.push({
        type: 'warning',
        message: 'Transaction deadline has already passed. This transaction will likely fail.'
      });
    }
  }

  if (parseFloat(decoded.valueEth) > 0) {
    simulation.balanceChanges.push({
      token: 'ETH',
      change: `-${decoded.valueEth}`,
      direction: 'out',
      type: 'swap_input'
    });
  }
}

function simulateStaking(decoded, simulation) {
  const amount = decoded.args.amount || decoded.valueEth;
  const action = decoded.functionName;

  if (['stake', 'deposit'].includes(action)) {
    simulation.effects.push({
      type: 'staking',
      description: `Stake/deposit ${amount || 'tokens'} into the protocol`,
      icon: '🏦'
    });
    if (amount) {
      simulation.balanceChanges.push({
        token: decoded.contractInfo?.name || 'Token',
        change: `-${amount}`,
        direction: 'out',
        type: 'stake'
      });
    }
  } else if (['unstake', 'withdraw', 'exit'].includes(action)) {
    simulation.effects.push({
      type: 'unstaking',
      description: `Withdraw/unstake ${amount || 'tokens'} from the protocol`,
      icon: '📦'
    });
    if (amount) {
      simulation.balanceChanges.push({
        token: decoded.contractInfo?.name || 'Token',
        change: `+${amount}`,
        direction: 'in',
        type: 'unstake'
      });
    }
  } else if (['claim', 'claimRewards', 'getReward'].includes(action)) {
    simulation.effects.push({
      type: 'claim',
      description: 'Claim staking rewards',
      icon: '🎁'
    });
    simulation.balanceChanges.push({
      token: 'Reward Token',
      change: '+? (variable)',
      direction: 'in',
      type: 'reward'
    });
  }
}

function simulateLiquidity(decoded, simulation) {
  if (decoded.functionName?.includes('add')) {
    simulation.effects.push({
      type: 'add_liquidity',
      description: `Add liquidity to ${decoded.contractInfo?.name || 'pool'}`,
      icon: '💧'
    });
    simulation.balanceChanges.push(
      { token: 'Token A', change: `-${decoded.args.amountADesired || '?'}`, direction: 'out', type: 'liquidity' },
      { token: 'Token B', change: `-${decoded.args.amountBDesired || '?'}`, direction: 'out', type: 'liquidity' },
      { token: 'LP Token', change: '+? (variable)', direction: 'in', type: 'liquidity' }
    );
  } else {
    simulation.effects.push({
      type: 'remove_liquidity',
      description: `Remove liquidity from ${decoded.contractInfo?.name || 'pool'}`,
      icon: '🔥'
    });
    simulation.balanceChanges.push(
      { token: 'LP Token', change: `-${decoded.args.liquidity || '?'}`, direction: 'out', type: 'liquidity' },
      { token: 'Token A', change: '+? (variable)', direction: 'in', type: 'liquidity' },
      { token: 'Token B', change: '+? (variable)', direction: 'in', type: 'liquidity' }
    );
  }
}

function simulateGeneric(decoded, simulation) {
  simulation.effects.push({
    type: 'unknown',
    description: `Call ${decoded.functionName || 'unknown function'} on ${decoded.contractInfo?.name || shortenAddr(decoded.to)}`,
    icon: '📋'
  });

  if (parseFloat(decoded.valueEth) > 0) {
    simulation.balanceChanges.push({
      token: 'ETH',
      change: `-${decoded.valueEth}`,
      direction: 'out',
      type: 'value'
    });
  }

  if (!decoded.decoded) {
    simulation.warnings.push({
      type: 'warning',
      message: 'Transaction data could not be fully decoded. The exact effects are uncertain.'
    });
  }
}

function generateSimulationSummary(simulation) {
  const parts = [];

  if (simulation.effects.length > 0) {
    parts.push(`${simulation.effects.length} action(s) will be performed:`);
    simulation.effects.forEach(e => parts.push(`  ${e.icon} ${e.description}`));
  }

  if (simulation.warnings.length > 0) {
    parts.push(`\n⚠️ ${simulation.warnings.length} warning(s):`);
    simulation.warnings.forEach(w => parts.push(`  • ${w.message}`));
  }

  const outflows = simulation.balanceChanges.filter(b => b.direction === 'out' && b.type !== 'gas');
  const inflows = simulation.balanceChanges.filter(b => b.direction === 'in');

  if (outflows.length > 0) {
    parts.push('\n📤 You will send:');
    outflows.forEach(b => parts.push(`  ${b.token}: ${b.change}`));
  }

  if (inflows.length > 0) {
    parts.push('\n📥 You will receive:');
    inflows.forEach(b => parts.push(`  ${b.token}: ${b.change}`));
  }

  return parts.join('\n');
}

function shortenAddr(addr) {
  if (!addr) return 'unknown';
  return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
}

module.exports = { simulateTransaction };
