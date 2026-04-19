"""
protocol/pipeline.py — Main AAP pipeline orchestrator.

Wires everything together:
Agent Decision → Pre-Validate → IPFS Upload → Merkle Batch → HeLa Anchor
→ ZK Proof → Level 1+2+3 Verification → Backend Store
"""

import os
import sys
import json
import logging
from pathlib import Path
from datetime import datetime
from typing import Optional

log = logging.getLogger(__name__)
logging.basicConfig(level=logging.INFO, format="%(asctime)s  %(levelname)-8s %(message)s")

# Ensure paths are set
sys.path.insert(0, str(Path(__file__).parent.parent / "agent"))
sys.path.insert(0, str(Path(__file__).parent))
sys.path.insert(0, str(Path(__file__).parent / "verification"))

from ipfs_uploader  import IPFSUploader
from merkle_batcher import MerkleBatcher
from hela_anchor    import HeLaAnchor
from pre_validator  import PreValidator, PostAuditor
from verification.level1_hash  import verify_pdr_integrity, verify_merkle_proof
from verification.level2_replay import replay_decision
from verification.level3_zkproof import ZKProver


class AAPPipeline:
    """
    Main Agent Audit Protocol pipeline.
    Call process(pdr) after the financial agent generates a PDR.
    """

    def __init__(self):
        log.info("Initializing AAP Pipeline...")
        self.ipfs      = IPFSUploader()
        self.batcher   = MerkleBatcher(batch_size=int(os.getenv("BATCH_SIZE", "10")))
        self.hela      = HeLaAnchor()
        self.validator = PreValidator()
        self.auditor   = PostAuditor()
        self.zk        = ZKProver()

        # In-memory store for demo (replace with PostgreSQL in production)
        self._store: list[dict] = []
        self._prev_pdr_hash: Optional[str] = None

        log.info("✓ AAP Pipeline ready")

    def process(self, pdr: dict) -> dict:
        """
        Full pipeline for one PDR.
        Returns enriched PDR with all proof fields populated.
        """
        decision_id = pdr.get("decision_id", "unknown")
        log.info(f"\n{'='*60}")
        log.info(f"PROCESSING: {decision_id}")
        log.info(f"{'='*60}")

        # ── Step 1: Link to previous PDR (tamper-proof chain) ─────────────
        if self._prev_pdr_hash:
            pdr["prev_pdr_hash"] = self._prev_pdr_hash

        # ── Step 2: Pre-validation ────────────────────────────────────────
        log.info("Step 2: Pre-validation...")
        validation = self.validator.validate(pdr)
        pdr["pre_validation"] = {
            "passed":        validation.passed,
            "violations":    validation.violations,
            "warnings":      validation.warnings,
            "rules_checked": validation.rules_checked,
            "override_type": validation.override_type,
        }

        if not validation.passed:
            pdr["execution_status"] = "BLOCKED"
            pdr["approval_type"]    = "BLOCKED"
            log.warning(f"PDR BLOCKED by pre-validation: {[v['rule'] for v in validation.violations]}")
        else:
            pdr["approval_type"] = validation.override_type

        # ── Step 3: ZK Proof ─────────────────────────────────────────────
        log.info("Step 3: Generating ZK proof...")
        zk_result = self.zk.generate_proof(pdr)
        pdr["zk_proof"] = zk_result

        # ── Step 4: Upload to IPFS ────────────────────────────────────────
        log.info("Step 4: Uploading to IPFS...")
        ipfs_result = self.ipfs.upload_pdr(pdr)
        pdr["ipfs_cid"]       = ipfs_result["cid"]
        pdr["ipfs_url"]       = ipfs_result["url"]
        pdr["ipfs_simulated"] = ipfs_result.get("simulated", True)

        # ── Step 5: Merkle batch ──────────────────────────────────────────
        log.info(f"Step 5: Adding to Merkle batch ({self.batcher.pending_count()+1}/{self.batcher.batch_size})...")
        batch_result = self.batcher.add(
            decision_id=decision_id,
            pdr_hash=   pdr["pdr_hash"],
            ipfs_cid=   pdr["ipfs_cid"],
        )

        pdr["merkle_info"] = {"pending": True}

        if batch_result:
            log.info("Step 5b: Batch full — anchoring to HeLa...")
            batch_index_result = self.ipfs.upload_batch_index(batch_result["items"])
            anchor_result = self.hela.anchor_root(
                merkle_root_hex=batch_result["merkle_root_hex"],
                batch_size=      batch_result["batch_size"],
                ipfs_index_cid=  batch_index_result["cid"],
            )
            # Store Merkle info in this PDR
            my_item = next((i for i in batch_result["items"] if i["decision_id"] == decision_id), None)
            if my_item:
                pdr["merkle_info"] = {
                    "pending":       False,
                    "merkle_root":   batch_result["merkle_root"],
                    "merkle_index":  my_item["merkle_index"],
                    "merkle_proof":  my_item["merkle_proof"],
                    "anchor_tx":     anchor_result,
                    "batch_size":    batch_result["batch_size"],
                }
                pdr["hela_anchor_tx"] = anchor_result.get("tx_hash")

        # ── Step 6: Register decision for challenge window ─────────────────
        if not pdr.get("ipfs_simulated"):
            self.hela.register_decision(decision_id)

        # ── Step 7: Level 1 Verification ──────────────────────────────────
        log.info("Step 7: Level 1 verification...")
        l1 = verify_pdr_integrity(pdr)
        pdr["verification"] = {"level1": l1}

        # ── Step 8: Store in memory ────────────────────────────────────────
        self._prev_pdr_hash = pdr["pdr_hash"]
        self._store.append(pdr)

        log.info(f"✓ Pipeline complete: {decision_id}")
        log.info(f"  Status: {pdr.get('execution_status')}")
        log.info(f"  IPFS:   {pdr.get('ipfs_cid', 'N/A')[:20]}...")
        log.info(f"  L1:     {'PASS' if l1['passed'] else 'FAIL'}")
        log.info(f"  ZK:     {'PASS' if zk_result.get('passed', True) else 'FAIL'} (simulated={zk_result.get('simulated')})")

        return pdr

    def get_all_pdrs(self) -> list[dict]:
        return list(self._store)

    def get_pdr(self, decision_id: str) -> Optional[dict]:
        for pdr in self._store:
            if pdr.get("decision_id") == decision_id:
                return pdr
        return None

    def verify_full(self, decision_id: str) -> dict:
        """Run all 3 verification levels on a stored PDR."""
        pdr = self.get_pdr(decision_id)
        if not pdr:
            return {"error": f"PDR {decision_id} not found"}

        l1 = verify_pdr_integrity(pdr)
        l2 = replay_decision(pdr)
        l3 = self.zk.verify_proof(
            pdr.get("zk_proof", {}),
            pdr.get("zk_proof", {}).get("public_signals", {}),
        )

        return {
            "decision_id": decision_id,
            "level1":      l1,
            "level2":      l2,
            "level3":      l3,
            "overall":     l1["passed"] and l2["passed"] and l3.get("passed", True),
            "verified_at": datetime.utcnow().isoformat() + "Z",
        }

    def flush_batch(self) -> Optional[dict]:
        """Force-flush pending Merkle batch (e.g., on shutdown)."""
        batch = self.batcher.flush()
        if not batch:
            return None
        index = self.ipfs.upload_batch_index(batch["items"])
        anchor = self.hela.anchor_root(
            batch["merkle_root_hex"], batch["batch_size"], index["cid"]
        )
        log.info(f"✓ Forced flush: {batch['batch_size']} decisions anchored")
        return {"batch": batch, "anchor": anchor}
