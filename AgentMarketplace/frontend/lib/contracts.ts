/**
 * lib/contracts.ts
 * ─────────────────
 * Contract ABIs and address configuration for Sangam dApp.
 * After running `npx hardhat run scripts/deploy.ts`, the deployed addresses
 * are written to deployedAddresses.json automatically.
 */
import { ethers } from "ethers";

// ── Deployed addresses (populated by deploy script) ───────────────────────────
export const DEPLOYED_ADDRESSES = {
  DatingCore: process.env.NEXT_PUBLIC_DATING_CORE || "0x0000000000000000000000000000000000000001",
  EscrowContent: process.env.NEXT_PUBLIC_ESCROW_CONTENT || "0x0000000000000000000000000000000000000001",
  MockZKVerifier: process.env.NEXT_PUBLIC_ZK_VERIFIER || "0x0000000000000000000000000000000000000001",
};



export const HELA_TESTNET = {
  chainId: "0xa2d08", // 666888 hex
  chainName: "Hela Official Runtime Testnet",
  nativeCurrency: { name: "HLUSD", symbol: "HLUSD", decimals: 18 },
  rpcUrls: ["https://testnet-rpc.helachain.com"],
  blockExplorerUrls: ["https://testnet-blockexplorer.helachain.com"],
};

// ── ABIs ──────────────────────────────────────────────────────────────────────
export const DATING_CORE_ABI = [
  "function registerProfile(bytes32 encryptedHash, uint8[] calldata interests) external",
  "function deactivateProfile() external",
  "function swipe(address target, bool liked, bytes calldata proof, uint256[] calldata publicSignals) external payable",
  "function sendMessage(address recipient) external payable",
  "function storeChatKey(address partner, bytes calldata encKey) external",
  "function isMatched(address a, address b) external view returns (bool)",
  "function getInterests(address user) external view returns (uint8[])",
  "function profiles(address user) external view returns (bytes32 encryptedHash, bool active, uint256 registeredAt)",
  "function SWIPE_FEE() external view returns (uint256)",
  "function MSG_FEE() external view returns (uint256)",
  "event ProfileRegistered(address indexed user, bytes32 encryptedHash)",
  "event SwipeRecorded(address indexed swiper, address indexed target, bool liked)",
  "event MatchFound(address indexed userA, address indexed userB, bytes32 pairHash)",
  "event MessageSent(address indexed sender, address indexed recipient, uint256 feePaid)",
] as const;

export const ESCROW_ABI = [
  "function listContent(bytes32 contentHash, uint256 price) external returns (uint256 listingId)",
  "function unlockContent(uint256 listingId) external payable",
  "function cancelListing(uint256 listingId) external",
  "function hasUnlocked(uint256 listingId, address buyer) external view returns (bool)",
  "function getListing(uint256 listingId) external view returns (tuple(address creator, bytes32 contentHash, uint256 price, bool active, uint256 lockedAt))",
  "event ContentListed(uint256 indexed listingId, address indexed creator, uint256 price, bytes32 contentHash)",
  "event ContentUnlocked(uint256 indexed listingId, address indexed buyer, address indexed creator, uint256 amount)",
] as const;

// ── Contract factory helpers ──────────────────────────────────────────────────
export function getDatingCoreContract(signerOrProvider: ethers.Signer | ethers.Provider) {
  return new ethers.Contract(DEPLOYED_ADDRESSES.DatingCore, DATING_CORE_ABI, signerOrProvider);
}

export function getEscrowContract(signerOrProvider: ethers.Signer | ethers.Provider) {
  return new ethers.Contract(DEPLOYED_ADDRESSES.EscrowContent, ESCROW_ABI, signerOrProvider);
}

/** Switch MetaMask to Hela Testnet */
export async function switchToHelaNetwork() {
  const eth = (window as any).ethereum;
  if (!eth) throw new Error("No wallet found");
  try {
    await eth.request({
      method: "wallet_switchEthereumChain",
      params: [{ chainId: HELA_TESTNET.chainId }],
    });
  } catch (err: any) {
    if (err.code === 4902) {
      await eth.request({
        method: "wallet_addEthereumChain",
        params: [HELA_TESTNET],
      });
    } else throw err;
  }
}

