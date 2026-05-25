"""
merkle_batcher.py — Batch PDR hashes into a Merkle tree.
One on-chain transaction covers up to BATCH_SIZE decisions.
"""

import hashlib
import json
import logging
from typing import Optional
from datetime import datetime

log = logging.getLogger(__name__)

BATCH_SIZE = int(__import__("os").getenv("BATCH_SIZE", "10"))


def sha256_hex(data: str) -> str:
    return hashlib.sha256(data.encode("utf-8")).hexdigest()


def build_merkle_tree(leaves: list[str]) -> tuple[str, list[list[str]]]:
    """
    Build a Merkle tree from a list of hex leaf hashes.
    Returns: (root_hex, levels)  — levels[0] = leaves, levels[-1] = [root]
    """
    if not leaves:
        raise ValueError("Cannot build Merkle tree from empty list")

    # Pad to even count
    layer = list(leaves)
    if len(layer) % 2 == 1:
        layer.append(layer[-1])  # Duplicate last leaf if odd

    levels  = [layer[:]]
    while len(layer) > 1:
        next_layer = []
        for i in range(0, len(layer), 2):
            combined = layer[i] + layer[i + 1]
            next_layer.append(sha256_hex(combined))
        if len(next_layer) % 2 == 1 and len(next_layer) > 1:
            next_layer.append(next_layer[-1])
        layer = next_layer
        levels.append(layer[:])

    root = levels[-1][0]
    return root, levels


def get_merkle_proof(leaf_index: int, levels: list[list[str]]) -> list[str]:
    """
    Generate a Merkle proof for a leaf at index.
    Returns list of sibling hashes from leaf to root.
    """
    proof = []
    idx   = leaf_index

    for level in levels[:-1]:  # Exclude root level
        if idx % 2 == 0:  # Left node — sibling is to the right
            sibling_idx = idx + 1
        else:              # Right node — sibling is to the left
            sibling_idx = idx - 1

        if sibling_idx < len(level):
            proof.append(level[sibling_idx])
        idx //= 2

    return proof


class MerkleBatcher:
    """
    Accumulates PDR hashes. When BATCH_SIZE is reached,
    builds a Merkle tree and returns the root for on-chain anchoring.
    """

    def __init__(self, batch_size: int = BATCH_SIZE):
        self.batch_size = batch_size
        self._pending: list[dict] = []  # [{decision_id, pdr_hash, ipfs_cid}]

    def add(self, decision_id: str, pdr_hash: str, ipfs_cid: str) -> Optional[dict]:
        """
        Add a PDR to the pending batch.
        Returns batch result if batch is full, else None.
        """
        self._pending.append({
            "decision_id": decision_id,
            "pdr_hash":    pdr_hash,
            "ipfs_cid":    ipfs_cid,
            "added_at":    datetime.utcnow().isoformat() + "Z",
        })
        log.info(f"Batch queue: {len(self._pending)}/{self.batch_size}")

        if len(self._pending) >= self.batch_size:
            return self.flush()
        return None

    def flush(self) -> Optional[dict]:
        """Force-flush the current batch (even if not full). Returns batch result."""
        if not self._pending:
            return None

        batch      = list(self._pending)
        self._pending.clear()

        # Build Merkle tree from PDR hashes
        leaves = [item["pdr_hash"] for item in batch]
        root, levels = build_merkle_tree(leaves)

        # Add Merkle proof to each item  
        for i, item in enumerate(batch):
            item["merkle_proof"] = get_merkle_proof(i, levels)
            item["merkle_index"] = i

        result = {
            "merkle_root":    root,
            "merkle_root_hex":"0x" + root,
            "batch_size":     len(batch),
            "items":          batch,
            "levels":         levels,
            "built_at":       datetime.utcnow().isoformat() + "Z",
        }

        log.info(f"✓ Merkle batch built: {len(batch)} decisions, root={root[:16]}...")
        return result

    def pending_count(self) -> int:
        return len(self._pending)


def verify_proof(leaf_hash: str, proof: list[str], root: str, leaf_index: int) -> bool:
    """
    Verify a Merkle proof.
    Returns True if the leaf is in the tree with the given root.
    """
    current = leaf_hash
    idx     = leaf_index

    for sibling in proof:
        if idx % 2 == 0:
            combined = current + sibling
        else:
            combined = sibling + current
        current = sha256_hex(combined)
        idx //= 2

    return current == root
