// Get ETH balance for any address
export async function getEthBalance(address) {
  const provider = new ethers.BrowserProvider(window.ethereum);
  const bal = await provider.getBalance(address);
  return ethers.formatEther(bal);
}
import { ethers } from "ethers";

export const PAYSTREAM_ADDRESS = "0xc241a3C39abde2d5b071E952af85d64561D17D52";

export const ABI = [
  "function owner() view returns(address)",
  "function treasuryBalance() view returns(uint256)",
  "function depositFunds() payable",
  "function startStream(address,uint256) payable",
  "function pauseStream(address)",
  "function cancelStream(address)",
  "function availableToClaim(address) view returns(uint256)",
  "function claim()",
  "function taxPercent() view returns(uint256)"
];

export async function getContract() {
  const provider = new ethers.BrowserProvider(window.ethereum);
  const signer = await provider.getSigner();
  return new ethers.Contract(PAYSTREAM_ADDRESS, ABI, signer);
}
