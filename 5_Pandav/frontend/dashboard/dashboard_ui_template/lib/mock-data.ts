export type Intent = {
  id: string
  action: string
  amount: string
  asset: string
  agentAddress: string
  agentReason: string
  auditorAssessment: string
  riskScore: number
  timestamp: string
}

export type AuditEntry = {
  id: string
  action: string
  amount: string
  asset: string
  agentAddress: string
  finalRiskScore: number
  explanationHash: string
  executedAt: string
  txHash: string
}

export type Dispute = {
  id: string
  action: string
  agentAddress: string
  amount: string
  asset: string
  status: "Executed" | "Disputed" | "Timelocked"
  executedAt: string
}

export const pendingIntents: Intent[] = [
  {
    id: "0xa41f9c8b3e7d2f1b9c8a7d6e5f4c3b2a1d9e8f7c6b5a4938",
    action: "SWAP_ETH",
    amount: "42.5",
    asset: "ETH",
    agentAddress: "0x8f5a9b4c7d2e1f3a6b8c9d0e1f2a3b4c5d6e7f58",
    agentReason:
      "Rebalancing portfolio toward stablecoin allocation based on detected volatility spike in BTC correlation matrix.",
    auditorAssessment:
      "Slippage tolerance set to 3.5% — unusually high for this pair. Destination router not on approved registry. Recommend manual verification of target contract before release.",
    riskScore: 9,
    timestamp: "2m ago",
  },
  {
    id: "0xb52ea8d4f9c1b2e3a4d5c6b7e8f9a0b1c2d3e4f5a6b7c8d9",
    action: "TRANSFER_USDC",
    amount: "125,000",
    asset: "USDC",
    agentAddress: "0x2c4e6f8a1b3d5e7f9a0c2e4b6d8f0a2c4e6f8a10",
    agentReason:
      "Scheduled quarterly payroll distribution to verified vendor multisig per treasury policy §4.2.",
    auditorAssessment:
      "Destination address matches approved vendor registry. Amount within 8% of trailing average. Transfer aligns with quarterly cadence. No anomalies detected — low reputational risk.",
    riskScore: 3,
    timestamp: "8m ago",
  },
  {
    id: "0xc63fb9e5a0d2c3f4b5e6d7c8f9a0b1c2d3e4f5a6b7c8d9e0",
    action: "APPROVE_CONTRACT",
    amount: "Unlimited",
    asset: "DAI",
    agentAddress: "0x3d5f7a9c1e2b4d6f8a0c2e4b6d8f0a2c4e6f8a11",
    agentReason:
      "Granting unlimited token allowance to yield aggregator for automated farming strategy deployment.",
    auditorAssessment:
      "Unlimited approval pattern flagged. Target contract deployed 11 days ago with no audit trail. Similar approval patterns preceded 3 known exploits in past 90 days. Strong recommendation to reject.",
    riskScore: 10,
    timestamp: "14m ago",
  },
  {
    id: "0xd74ecab6f1e3d4a5b6c7d8e9f0a1b2c3d4e5f6a7b8c9d0e1",
    action: "STAKE_TOKENS",
    amount: "500",
    asset: "LINK",
    agentAddress: "0x4e6f8a0c2e4b6d8f0a2c4e6f8a0c2e4b6d8f0a12",
    agentReason:
      "Moving idle LINK to validator staking pool to capture 4.2% APR yield per treasury mandate.",
    auditorAssessment:
      "Target staking pool verified. Lock-up period (14 days) exceeds typical tolerance. Exit liquidity appears healthy. Moderate caution advised on timing.",
    riskScore: 6,
    timestamp: "21m ago",
  },
  {
    id: "0xe85fdbc7a2f4e5b6c7d8e9f0a1b2c3d4e5f6a7b8c9d0e1f2",
    action: "BRIDGE_ASSETS",
    amount: "80",
    asset: "WBTC",
    agentAddress: "0x5f7a9c1e3b5d7f9a1c3e5b7d9f1a3c5e7b9d1f13",
    agentReason:
      "Cross-chain rebalancing to Arbitrum to capture lower gas overhead for weekly settlement batch.",
    auditorAssessment:
      "Bridge contract is Tier-1 verified. Amount represents 12% of agent's managed WBTC. Gas pricing appears optimized. Passes heuristic checks for bridging policy.",
    riskScore: 4,
    timestamp: "34m ago",
  },
  {
    id: "0xf96ecd8b3a5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d",
    action: "WITHDRAW_VAULT",
    amount: "1,200,000",
    asset: "USDT",
    agentAddress: "0x6a8c0e2f4b6d8a0c2e4b6d8f0a2c4e6f8a0c2e14",
    agentReason:
      "Emergency withdrawal from yield vault ahead of suspected smart contract vulnerability disclosure.",
    auditorAssessment:
      "Large withdrawal magnitude detected. No corroborating public disclosure or CVE identified. Pattern resembles rug-pull precursor behavior. Urgent human review required.",
    riskScore: 8,
    timestamp: "47m ago",
  },
]

export const auditHistory: AuditEntry[] = [
  {
    id: "0x1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f",
    action: "TRANSFER_USDC",
    amount: "45,000",
    asset: "USDC",
    agentAddress: "0x2c4e6f8a1b3d5e7f9a0c2e4b6d8f0a2c4e6f8a10",
    finalRiskScore: 2,
    explanationHash: "Qm1f2a9b4c7d8e0f3b6a9c2d5e8f1a4b7c0d3e6f9a2b5c8d",
    executedAt: "1h ago",
    txHash: "0xf1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0",
  },
  {
    id: "0x2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a",
    action: "STAKE_TOKENS",
    amount: "2,500",
    asset: "LINK",
    agentAddress: "0x4e6f8a0c2e4b6d8f0a2c4e6f8a0c2e4b6d8f0a12",
    finalRiskScore: 3,
    explanationHash: "Qm2e3f4a5b6c7d8e9f0a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5",
    executedAt: "3h ago",
    txHash: "0xe2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1",
  },
  {
    id: "0x3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b",
    action: "SWAP_ETH",
    amount: "12.8",
    asset: "ETH",
    agentAddress: "0x8f5a9b4c7d2e1f3a6b8c9d0e1f2a3b4c5d6e7f58",
    finalRiskScore: 4,
    explanationHash: "Qm3f4a5b6c7d8e9f0a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6",
    executedAt: "5h ago",
    txHash: "0xd3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2",
  },
  {
    id: "0x4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c",
    action: "BRIDGE_ASSETS",
    amount: "50",
    asset: "WBTC",
    agentAddress: "0x5f7a9c1e3b5d7f9a1c3e5b7d9f1a3c5e7b9d1f13",
    finalRiskScore: 3,
    explanationHash: "Qm4a5b6c7d8e9f0a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7",
    executedAt: "8h ago",
    txHash: "0xc4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3",
  },
  {
    id: "0x5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d",
    action: "TRANSFER_USDC",
    amount: "8,200",
    asset: "USDC",
    agentAddress: "0x2c4e6f8a1b3d5e7f9a0c2e4b6d8f0a2c4e6f8a10",
    finalRiskScore: 1,
    explanationHash: "Qm5b6c7d8e9f0a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8",
    executedAt: "11h ago",
    txHash: "0xb5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4",
  },
  {
    id: "0x6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e",
    action: "APPROVE_CONTRACT",
    amount: "10,000",
    asset: "DAI",
    agentAddress: "0x3d5f7a9c1e2b4d6f8a0c2e4b6d8f0a2c4e6f8a11",
    finalRiskScore: 5,
    explanationHash: "Qm6c7d8e9f0a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9",
    executedAt: "14h ago",
    txHash: "0xa6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5",
  },
]

export const disputes: Dispute[] = [
  {
    id: "0xaa11bb22cc33dd44ee55ff66aa77bb88cc99dd00ee11ff22",
    action: "WITHDRAW_VAULT",
    agentAddress: "0x6a8c0e2f4b6d8a0c2e4b6d8f0a2c4e6f8a0c2e14",
    amount: "1,200,000",
    asset: "USDT",
    status: "Timelocked",
    executedAt: "4h 12m remaining",
  },
  {
    id: "0xbb22cc33dd44ee55ff66aa77bb88cc99dd00ee11ff22aa33",
    action: "APPROVE_CONTRACT",
    agentAddress: "0x3d5f7a9c1e2b4d6f8a0c2e4b6d8f0a2c4e6f8a11",
    amount: "Unlimited",
    asset: "DAI",
    status: "Disputed",
    executedAt: "2h ago",
  },
  {
    id: "0xcc33dd44ee55ff66aa77bb88cc99dd00ee11ff22aa33bb44",
    action: "SWAP_ETH",
    agentAddress: "0x8f5a9b4c7d2e1f3a6b8c9d0e1f2a3b4c5d6e7f58",
    amount: "42.5",
    asset: "ETH",
    status: "Executed",
    executedAt: "6h ago",
  },
  {
    id: "0xdd44ee55ff66aa77bb88cc99dd00ee11ff22aa33bb44cc55",
    action: "BRIDGE_ASSETS",
    agentAddress: "0x5f7a9c1e3b5d7f9a1c3e5b7d9f1a3c5e7b9d1f13",
    amount: "80",
    asset: "WBTC",
    status: "Executed",
    executedAt: "9h ago",
  },
  {
    id: "0xee55ff66aa77bb88cc99dd00ee11ff22aa33bb44cc55dd66",
    action: "TRANSFER_USDC",
    agentAddress: "0x2c4e6f8a1b3d5e7f9a0c2e4b6d8f0a2c4e6f8a10",
    amount: "125,000",
    asset: "USDC",
    status: "Timelocked",
    executedAt: "12h 45m remaining",
  },
  {
    id: "0xff66aa77bb88cc99dd00ee11ff22aa33bb44cc55dd66ee77",
    action: "STAKE_TOKENS",
    agentAddress: "0x4e6f8a0c2e4b6d8f0a2c4e6f8a0c2e4b6d8f0a12",
    amount: "500",
    asset: "LINK",
    status: "Executed",
    executedAt: "1d ago",
  },
]

export const sandboxTemplates = [
  { label: "Swap 10 ETH", action: "SWAP_ETH", amount: "10", reason: "Rebalancing portfolio toward stablecoin exposure." },
  { label: "Stake Tokens", action: "STAKE_TOKENS", amount: "1000", reason: "Capture staking yield on idle reserves." },
  { label: "Transfer USDC", action: "TRANSFER_USDC", amount: "50000", reason: "Scheduled vendor payment per treasury policy." },
  { label: "Unlimited Approval", action: "APPROVE_CONTRACT", amount: "Unlimited", reason: "Deploy yield aggregator strategy." },
  { label: "Bridge WBTC", action: "BRIDGE_ASSETS", amount: "25", reason: "Cross-chain rebalance to reduce gas overhead." },
  { label: "Emergency Withdraw", action: "WITHDRAW_VAULT", amount: "500000", reason: "Suspected protocol vulnerability — exit position." },
]

export function truncateAddress(address: string, start = 6, end = 4) {
  if (address.length <= start + end) return address
  return `${address.slice(0, start)}...${address.slice(-end)}`
}
