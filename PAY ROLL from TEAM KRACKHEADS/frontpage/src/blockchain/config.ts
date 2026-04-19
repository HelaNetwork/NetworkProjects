/**
 * CorePayroll contract configuration for HeLa Testnet.
 * Step 3 from Web3Auth integration guide.
 */

const CHAIN_ID = (import.meta as any).env?.VITE_HELA_CHAIN_ID || "0xA2D18";
const RPC_URL = (import.meta as any).env?.VITE_HELA_RPC_URL || "https://testnet-rpc.helachain.com";
const DISPLAY = (import.meta as any).env?.VITE_HELA_DISPLAY || "HeLa Testnet";
const TICKER_NAME = (import.meta as any).env?.VITE_HELA_TICKER_NAME || "HLUSD";
const TICKER = (import.meta as any).env?.VITE_HELA_TICKER || "HLUSD";

export const HELA_CHAIN_CONFIG = {
  chainNamespace: "eip155" as const,
  chainId: CHAIN_ID,
  rpcTarget: RPC_URL,
  displayName: DISPLAY,
  tickerName: TICKER_NAME,
  ticker: TICKER,
};

export const CORE_PAYROLL_ABI = [
  "function getTreasuryBalance() view returns (uint256)",
  "function startStream(address _employee, uint256 _ratePerSecond) external",
  "function stopStream(address _employee) external",
  "function claimableAmount(address _employee) view returns (uint256)",
  "function streams(address _employee) view returns (uint256 ratePerSecond, uint256 lastWithdrawTime, uint256 accruedBalance, bool isActive)",
  "function TAX_RATE() view returns (uint256)",
  "function taxVault() view returns (address)",
  "function setTaxVault(address _vault) external",
  "function withdraw() external",
  "function emergencyWithdraw() external",
  "event StreamStarted(address indexed employee, uint256 rate)",
  "event StreamStopped(address indexed employee)",
  "event Withdrawal(address indexed employee, uint256 netAmount, uint256 taxAmount)",
  "event TreasuryFunded(uint256 amount)",
  "receive() external payable",
];
