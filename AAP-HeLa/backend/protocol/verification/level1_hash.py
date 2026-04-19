"""
verification/level1_hash.py — Level 1 Verification: Hash Integrity Check.

Verify any PDR is untampered by recomputing its hash and checking
against the Merkle root anchored on HeLa Chain.
"""

import hashlib
import json
import logging
from typing import Optional

log = logging.getLogger(__name__)


def compute_pdr_hash(pdr: dict) -> str:
    """Recompute the sha256 hash of a PDR. Excludes mutable post-submission fields."""
    hashable = {
        k: v for k, v in pdr.items()
        if k not in ("pdr_hash", "ipfs_cid", "hela_anchor_tx", "agent_signature", "post_audit")
    }
    return hashlib.sha256(
        json.dumps(hashable, sort_keys=True, default=str).encode("utf-8")
    ).hexdigest()


def verify_pdr_integrity(pdr: dict) -> dict:
    """
    Level 1: Verify the PDR hash matches the stored hash.
    Returns verification result with details.
    """
    stored_hash    = pdr.get("pdr_hash", "")
    recomputed     = compute_pdr_hash(pdr)
    hash_matches   = stored_hash == recomputed

    result = {
        "level":         1,
        "name":          "Hash Integrity Check",
        "passed":        hash_matches,
        "stored_hash":   stored_hash,
        "recomputed":    recomputed,
        "message":       "PDR hash verified — record is untampered" if hash_matches
                         else "PDR HASH MISMATCH — record may be tampered!",
        "decision_id":   pdr.get("decision_id", ""),
    }

    if not hash_matches:
        log.error(f"TAMPER DETECTED: {pdr.get('decision_id')} hash mismatch!")
        log.error(f"  Stored:     {stored_hash}")
        log.error(f"  Recomputed: {recomputed}")
    else:
        log.info(f"✓ L1 verified: {pdr.get('decision_id')} — {recomputed[:16]}...")

    return result


def verify_merkle_proof(
    pdr_hash:    str,
    proof:       list[str],
    merkle_root: str,
    leaf_index:  int,
) -> dict:
    """Verify the Merkle proof that links this PDR to an on-chain anchor."""
    from protocol.merkle_batcher import verify_proof

    is_valid = verify_proof(pdr_hash, proof, merkle_root, leaf_index)

    return {
        "level":        1,
        "name":         "Merkle Proof Verification",
        "passed":       is_valid,
        "pdr_hash":     pdr_hash,
        "merkle_root":  merkle_root,
        "leaf_index":   leaf_index,
        "proof_steps":  len(proof),
        "message":      "Decision is cryptographically anchored on HeLa Chain" if is_valid
                        else "Merkle proof verification FAILED",
    }
