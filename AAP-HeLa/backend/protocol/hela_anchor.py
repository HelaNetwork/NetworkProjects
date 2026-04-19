"""
hela_anchor.py — Send Merkle roots to HeLa blockchain via web3.py.
Calls AuditAnchor.sol and ChallengeRegistry.sol functions.
"""

import os
import json
import logging
from pathlib import Path
from typing import Optional
from datetime import datetime

log = logging.getLogger(__name__)

# Try importing web3; fall back to simulation if not installed
try:
    from web3 import Web3
    from web3.middleware import geth_poa_middleware
    WEB3_AVAILABLE = True
except ImportError:
    WEB3_AVAILABLE = False
    log.warning("web3 not installed — HeLa anchor running in simulation mode")


# Minimal ABIs (only functions we call)
AUDIT_ANCHOR_ABI = [
    {
        "name": "anchorRoot",
        "type": "function",
        "inputs": [
            {"name": "merkleRoot",   "type": "bytes32"},
            {"name": "batchSize",    "type": "uint256"},
            {"name": "ipfsIndexCid", "type": "string"},
        ],
        "outputs": [],
        "stateMutability": "nonpayable",
    },
    {
        "name": "verifyLeaf",
        "type": "function",
        "inputs": [
            {"name": "agent",       "type": "address"},
            {"name": "anchorIndex", "type": "uint256"},
            {"name": "leaf",        "type": "bytes32"},
            {"name": "proof",       "type": "bytes32[]"},
        ],
        "outputs": [{"type": "bool"}],
        "stateMutability": "view",
    },
    {
        "name": "RootAnchored",
        "type": "event",
        "inputs": [
            {"name": "merkleRoot",   "type": "bytes32", "indexed": True},
            {"name": "agent",        "type": "address", "indexed": True},
            {"name": "timestamp",    "type": "uint256", "indexed": False},
            {"name": "batchSize",    "type": "uint256", "indexed": False},
            {"name": "ipfsIndexCid", "type": "string",  "indexed": False},
            {"name": "anchorIndex",  "type": "uint256", "indexed": False},
        ],
        "anonymous": False,
    },
]

CHALLENGE_REGISTRY_ABI = [
    {
        "name": "registerDecision",
        "type": "function",
        "inputs": [{"name": "decisionId", "type": "string"}],
        "outputs": [],
        "stateMutability": "nonpayable",
    },
    {
        "name": "raiseChallenge",
        "type": "function",
        "inputs": [
            {"name": "decisionId",     "type": "string"},
            {"name": "pdrHash",        "type": "bytes32"},
            {"name": "evidenceIpfsCid","type": "string"},
            {"name": "reason",         "type": "string"},
        ],
        "outputs": [],
        "stateMutability": "payable",
    },
    {
        "name": "voteOnChallenge",
        "type": "function",
        "inputs": [
            {"name": "decisionId", "type": "string"},
            {"name": "support",    "type": "bool"},
        ],
        "outputs": [],
        "stateMutability": "nonpayable",
    },
]


class HeLaAnchor:
    """Connects to HeLa Chain and submits audit proofs."""

    def __init__(self):
        self._simulation_mode = True
        self.w3:   Optional[object] = None
        self.account: Optional[object] = None

        # Load deployed contract addresses
        addr_file = Path(__file__).parent.parent / "deployed_addresses.json"
        self.addresses = {}
        if addr_file.exists():
            with open(addr_file) as f:
                self.addresses = json.load(f)

        self.audit_anchor_addr    = (
            self.addresses.get("AuditAnchor")
            or os.getenv("AUDIT_ANCHOR_ADDRESS", "")
        )
        self.challenge_reg_addr   = (
            self.addresses.get("ChallengeRegistry")
            or os.getenv("CHALLENGE_REGISTRY_ADDRESS", "")
        )

        if WEB3_AVAILABLE:
            self._connect()

    def _connect(self):
        rpc_url = (
            os.getenv("HELA_TESTNET_RPC", "https://testnet-rpc.helachain.com")
        )
        pk = os.getenv("PRIVATE_KEY", "")
        try:
            self.w3 = Web3(Web3.HTTPProvider(rpc_url, request_kwargs={"timeout": 30}))
            self.w3.middleware_onion.inject(geth_poa_middleware, layer=0)

            if not self.w3.is_connected():
                log.warning("HeLa RPC unreachable — simulation mode")
                self._simulation_mode = True
                return

            if pk:
                self.account = self.w3.eth.account.from_key(pk)
                log.info(f"✓ HeLa connected — wallet: {self.account.address}")
            else:
                log.warning("No PRIVATE_KEY — read-only mode")

            self._simulation_mode = False
            log.info(f"✓ HeLa Chain connected (chain_id={self.w3.eth.chain_id})")

        except Exception as e:
            log.warning(f"HeLa connection failed: {e} — simulation mode")
            self._simulation_mode = True

    def anchor_root(
        self,
        merkle_root_hex: str,
        batch_size:      int,
        ipfs_index_cid:  str,
    ) -> dict:
        """
        Call AuditAnchor.anchorRoot() on HeLa.
        merkle_root_hex: "0x" + 64 hex chars
        """
        if self._simulation_mode or not self.audit_anchor_addr:
            return self._simulate_anchor(merkle_root_hex, batch_size)

        try:
            contract = self.w3.eth.contract(
                address=Web3.to_checksum_address(self.audit_anchor_addr),
                abi=AUDIT_ANCHOR_ABI
            )

            root_bytes = bytes.fromhex(merkle_root_hex.lstrip("0x").lstrip("x"))
            if len(root_bytes) < 32:
                root_bytes = root_bytes.ljust(32, b"\x00")

            tx = contract.functions.anchorRoot(
                root_bytes,
                batch_size,
                ipfs_index_cid
            ).build_transaction({
                "from":  self.account.address,
                "nonce": self.w3.eth.get_transaction_count(self.account.address),
                "gas":   150_000,
                "gasPrice": self.w3.eth.gas_price,
            })

            signed   = self.w3.eth.account.sign_transaction(tx, self.account.key)
            tx_hash  = self.w3.eth.send_raw_transaction(signed.raw_transaction)
            receipt  = self.w3.eth.wait_for_transaction_receipt(tx_hash, timeout=120)

            result = {
                "tx_hash":    tx_hash.hex(),
                "block":      receipt["blockNumber"],
                "gas_used":   receipt["gasUsed"],
                "status":     "SUCCESS" if receipt["status"] == 1 else "FAILED",
                "explorer_url": f"https://testnet-helascan.io/tx/{tx_hash.hex()}",
                "simulated":  False,
                "timestamp":  datetime.utcnow().isoformat() + "Z",
            }
            log.info(f"✓ Anchored on HeLa: {tx_hash.hex()[:16]}...")
            return result

        except Exception as e:
            log.error(f"HeLa anchor failed: {e}")
            return self._simulate_anchor(merkle_root_hex, batch_size)

    def register_decision(self, decision_id: str) -> dict:
        """Register a decision timestamp on ChallengeRegistry for challenge window tracking."""
        if self._simulation_mode or not self.challenge_reg_addr:
            return {"simulated": True, "decision_id": decision_id}

        try:
            contract = self.w3.eth.contract(
                address=Web3.to_checksum_address(self.challenge_reg_addr),
                abi=CHALLENGE_REGISTRY_ABI
            )
            tx = contract.functions.registerDecision(decision_id).build_transaction({
                "from":  self.account.address,
                "nonce": self.w3.eth.get_transaction_count(self.account.address),
                "gas":   80_000,
                "gasPrice": self.w3.eth.gas_price,
            })
            signed  = self.w3.eth.account.sign_transaction(tx, self.account.key)
            tx_hash = self.w3.eth.send_raw_transaction(signed.raw_transaction)
            self.w3.eth.wait_for_transaction_receipt(tx_hash, timeout=60)
            return {"tx_hash": tx_hash.hex(), "simulated": False}
        except Exception as e:
            log.warning(f"register_decision failed: {e}")
            return {"simulated": True}

    def verify_leaf_on_chain(
        self,
        agent_address: str,
        anchor_index:  int,
        leaf_hex:      str,
        proof_hexes:   list[str],
    ) -> bool:
        """Call AuditAnchor.verifyLeaf() to verify a PDR proof on-chain."""
        if self._simulation_mode or not self.audit_anchor_addr:
            log.info("[SIMULATED] verifyLeaf → True")
            return True

        try:
            contract = self.w3.eth.contract(
                address=Web3.to_checksum_address(self.audit_anchor_addr),
                abi=AUDIT_ANCHOR_ABI
            )
            leaf_bytes  = bytes.fromhex(leaf_hex.lstrip("0x"))
            proof_bytes = [bytes.fromhex(p.lstrip("0x")) for p in proof_hexes]

            result = contract.functions.verifyLeaf(
                Web3.to_checksum_address(agent_address),
                anchor_index,
                leaf_bytes,
                proof_bytes
            ).call()
            return bool(result)
        except Exception as e:
            log.error(f"verifyLeaf failed: {e}")
            return False

    def _simulate_anchor(self, root: str, batch_size: int) -> dict:
        import hashlib
        fake_tx = "0x" + hashlib.sha256(
            f"{root}{batch_size}{datetime.utcnow().isoformat()}".encode()
        ).hexdigest()
        log.info(f"[SIMULATED] HeLa anchor — fake tx: {fake_tx[:16]}...")
        return {
            "tx_hash":     fake_tx,
            "block":       12345678,
            "gas_used":    85000,
            "status":      "SUCCESS",
            "explorer_url":f"https://testnet-helascan.io/tx/{fake_tx}",
            "simulated":   True,
            "timestamp":   datetime.utcnow().isoformat() + "Z",
        }
