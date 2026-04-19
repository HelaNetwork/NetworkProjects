/**
 * CorePayroll contract configuration for HeLa Testnet.
 */

export const HELA_CHAIN_CONFIG = {
  chainNamespace: "eip155" as const,
  chainId: "0xA2D18", // 666888 in hex (HeLa Testnet ID)
  rpcTarget: "https://testnet-rpc.helachain.com",
  displayName: "HeLa Testnet",
  tickerName: "HLUSD",
  ticker: "HLUSD",
};

export const CORE_PAYROLL_ABI = [
  "function getTreasuryBalance() view returns (uint256)",
  "function claimableAmount(address _employee) view returns (uint256)",
  "function streams(address _employee) view returns (uint256 ratePerSecond, uint256 lastWithdrawTime, uint256 accruedBalance, bool isActive)",
  "function withdraw() external",
  "event Withdrawal(address indexed employee, uint256 netAmount, uint256 taxAmount)",
];
