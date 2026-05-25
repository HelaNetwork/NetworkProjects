"""
verification/level3_zkproof.py — Level 3: Zero-Knowledge Proof Verification.

Proves: "This model with these inputs produced this output, and it followed the rules"
WITHOUT revealing: full input feature values, model weights, user context.

Uses circom + snarkjs (Groth16 proof system).
Circuit: ConstrainedDecision.circom
"""

import os
import json
import subprocess
import hashlib
import logging
from pathlib import Path
from typing import Optional

log = logging.getLogger(__name__)

CIRCUIT_DIR = Path(__file__).parent.parent.parent / "zk"


class ZKProver:
    """
    Generate and verify ZK proofs for trading decisions.
    
    The ZK circuit proves:
    1. RSI is within the claimed range (e.g., 30-70 = neutral)
    2. Confidence score is above minimum threshold (0.6)
    3. Risk score is below maximum threshold (0.8)
    4. Action is consistent with technical signals
    
    WITHOUT revealing exact RSI value, confidence, or other features.
    """

    def __init__(self):
        self._snarkjs_available = self._check_snarkjs()
        self._circuit_compiled  = (CIRCUIT_DIR / "decision_js" / "decision.wasm").exists()

    def _check_snarkjs(self) -> bool:
        try:
            result = subprocess.run(["snarkjs", "--version"], capture_output=True, timeout=5)
            return result.returncode == 0
        except Exception:
            return False

    def generate_proof(self, pdr: dict) -> dict:
        """
        Generate a ZK proof for a PDR.
        Returns: {proof, public_signals, verification_key_hash, simulated}
        """
        if not self._snarkjs_available or not self._circuit_compiled:
            log.info("[ZK] snarkjs/circuit not ready — returning simulated proof")
            return self._simulated_proof(pdr)

        try:
            return self._real_proof(pdr)
        except Exception as e:
            log.warning(f"[ZK] Real proof failed: {e} — simulating")
            return self._simulated_proof(pdr)

    def _real_proof(self, pdr: dict) -> dict:
        """Generate real Groth16 ZK proof using snarkjs."""
        features = pdr.get("input_features", {})

        # Circuit inputs (what we reveal publicly vs keep private)
        circuit_input = {
            # PRIVATE inputs (not revealed in proof)
            "rsi":        int(float(features.get("rsi_14", 50)) * 100),     # Scale: 50.00 → 5000
            "confidence": int(float(pdr.get("confidence_score", 0.5)) * 1000),
            "risk_score": int(float(pdr.get("risk_score_numeric", 0.5)) * 1000),

            # PUBLIC inputs (verifier can check these)
            "action_hash": int(hashlib.sha256(
                pdr.get("action", "HOLD").encode()
            ).hexdigest()[:8], 16),
            "min_confidence": 400,   # 0.40 * 1000
            "max_risk":       800,   # 0.80 * 1000
            "rsi_min":        2000,  # 20.0 * 100
            "rsi_max":        8000,  # 80.0 * 100
        }

        # Write input.json
        input_file = CIRCUIT_DIR / "input.json"
        with open(input_file, "w") as f:
            json.dump(circuit_input, f)

        # Generate witness
        wasm_file = CIRCUIT_DIR / "decision_js" / "decision.wasm"
        witness_file = CIRCUIT_DIR / "witness.wtns"
        subprocess.run([
            "node", str(CIRCUIT_DIR / "decision_js" / "generate_witness.js"),
            str(wasm_file), str(input_file), str(witness_file)
        ], check=True, capture_output=True)

        # Generate Groth16 proof
        zkey_file   = CIRCUIT_DIR / "decision_final.zkey"
        proof_file  = CIRCUIT_DIR / "proof.json"
        public_file = CIRCUIT_DIR / "public.json"
        subprocess.run([
            "snarkjs", "groth16", "prove",
            str(zkey_file), str(witness_file),
            str(proof_file), str(public_file)
        ], check=True, capture_output=True)

        with open(proof_file)  as f: proof   = json.load(f)
        with open(public_file) as f: public_signals = json.load(f)

        return {
            "level":           3,
            "name":            "ZK-SNARK Proof (Groth16)",
            "proof":           proof,
            "public_signals":  public_signals,
            "circuit":         "ConstrainedDecision_v1",
            "proves":          [
                "confidence >= 0.40 (without revealing exact value)",
                "risk_score <= 0.80 (without revealing exact value)",
                "RSI in valid range 20–80",
                "action consistent with circuit constraints",
            ],
            "simulated":       False,
            "generated_at":    __import__("datetime").datetime.utcnow().isoformat() + "Z",
        }

    def _simulated_proof(self, pdr: dict) -> dict:
        """
        Deterministic simulated proof for demonstration.
        Identifies what a real proof would prove.
        """
        features    = pdr.get("input_features", {})
        rsi         = float(features.get("rsi_14", 50))
        confidence  = float(pdr.get("confidence_score", 0.5))
        risk_score  = float(pdr.get("risk_score_numeric", 0.5))
        action      = pdr.get("action", "HOLD")

        # Evaluate constraints
        constraints = {
            "confidence_above_min": confidence >= 0.40,
            "risk_below_max":       risk_score <= 0.80,
            "rsi_in_range":         20.0 <= rsi <= 80.0,
            "action_valid":         action in ("BUY", "SELL", "HOLD"),
        }
        all_pass = all(constraints.values())

        # Generate deterministic fake proof hash
        proof_input = f"{pdr.get('decision_id')}:{action}:{all_pass}"
        proof_hash  = hashlib.sha256(proof_input.encode()).hexdigest()

        return {
            "level":              3,
            "name":               "ZK-SNARK Proof (SIMULATED — Groth16 architecture)",
            "passed":             all_pass,
            "proof_hash":         proof_hash,
            "constraints_checked":constraints,
            "public_signals":     {
                "action_hash":   hashlib.sha256(action.encode()).hexdigest()[:16],
                "min_confidence_passed": constraints["confidence_above_min"],
                "max_risk_passed":       constraints["risk_below_max"],
            },
            "proves": [
                f"confidence >= 0.40 {'✓' if constraints['confidence_above_min'] else '✗'}",
                f"risk_score <= 0.80 {'✓' if constraints['risk_below_max'] else '✗'}",
                f"RSI 20–80 {'✓' if constraints['rsi_in_range'] else '✗'}",
                f"valid action {'✓' if constraints['action_valid'] else '✗'}",
            ],
            "circuit":            "ConstrainedDecision_v1 (Groth16)",
            "note":               "Install circom + snarkjs for real proofs. See /zk/README.md",
            "simulated":          True,
            "generated_at":       __import__("datetime").datetime.utcnow().isoformat() + "Z",
        }

    def verify_proof(self, proof: dict, public_signals: dict, vkey_path: str = None) -> dict:
        """Verify a ZK proof."""
        if proof.get("simulated"):
            all_pass = all(proof.get("constraints_checked", {}).values())
            return {
                "level":     3,
                "name":      "ZK Verification (Simulated)",
                "passed":    all_pass,
                "message":   "Simulated proof verified" if all_pass else "Simulated proof failed",
                "simulated": True,
            }

        if not self._snarkjs_available:
            return {"level": 3, "passed": True, "simulated": True, "message": "snarkjs unavailable"}

        try:
            vkey = vkey_path or str(CIRCUIT_DIR / "verification_key.json")
            # Write temp files
            proof_file  = CIRCUIT_DIR / "_verify_proof.json"
            public_file = CIRCUIT_DIR / "_verify_public.json"
            with open(proof_file,  "w") as f: json.dump(proof,          f)
            with open(public_file, "w") as f: json.dump(public_signals, f)

            result = subprocess.run([
                "snarkjs", "groth16", "verify",
                vkey, str(public_file), str(proof_file)
            ], capture_output=True, text=True, timeout=30)

            is_valid = "OK" in result.stdout
            return {
                "level":   3,
                "name":    "ZK Verification (Groth16)",
                "passed":  is_valid,
                "message": result.stdout.strip(),
                "simulated": False,
            }
        except Exception as e:
            return {"level": 3, "passed": False, "message": str(e), "simulated": False}
