"""
Blockchain config API - provides contract address and ABI to frontends.
"""
from fastapi import APIRouter, Depends

from config import settings
from security import SecurityService
from models import User

router = APIRouter()

# CorePayroll ABI subset for frontend use
CORE_PAYROLL_ABI = [
    "function getTreasuryBalance() view returns (uint256)",
    "function startStream(address _employee, uint256 _ratePerSecond) external",
    "function stopStream(address _employee) external",
    "function claimableAmount(address _employee) view returns (uint256)",
    "function setTaxVault(address _vault) external",
    "function withdraw() external",
    "function emergencyWithdraw() external",
    "receive() external payable",
]


@router.get("/blockchain/config")
def get_blockchain_config(
    current_user: User = Depends(SecurityService.get_current_user),
):
    """Returns contract address and ABI for frontend Web3Auth + ethers integration."""
    return {
        "contract_address": settings.CONTRACT_ADDRESS or "",
        "abi": CORE_PAYROLL_ABI,
        "hela_rpc_url": settings.HELA_RPC_URL or "https://testnet-rpc.helachain.com",
    }
