/**
 * lib/zk.ts
 * ─────────
 * Mock ZK proof generator for Sangam demo.
 * Interface mirrors what real SnarkJS fullProve() returns so the integration
 * can be swapped to real proofs by replacing this file only.
 *
 * Real production usage:
 *   import { groth16 } from "snarkjs";
 *   const { proof, publicSignals } = await groth16.fullProve(
 *     { age, userInterests, targetInterests },
 *     "matchVerifier.wasm",
 *     "matchVerifier_final.zkey"
 *   );
 */

export interface ZKProofResult {
  proofBytes: Uint8Array;           // encoded proof for on-chain verification
  publicSignals: bigint[];          // [ageValid, interestOverlap]
  rawProof: Record<string, string>; // pi_a, pi_b, pi_c (for logging)
}

export interface ZKPrivateInputs {
  age: number;
  userInterests: number[];    // up to 10 interest IDs
  targetInterests: number[];  // up to 10 interest IDs
}

/**
 * Generate a mock ZK proof locally.
 * Returns deterministic proof bytes and computed public signals.
 */
export async function generateMockProof(inputs: ZKPrivateInputs): Promise<ZKProofResult> {
  const { age, userInterests, targetInterests } = inputs;

  // Compute public signals locally (mirrors circuit logic)
  const ageValid = age >= 18 ? 1n : 0n;
  const overlap = userInterests.filter(i => targetInterests.includes(i)).length;
  const interestOverlap = BigInt(overlap);

  // Encode proof bytes: [ageValid_byte, overlap_byte, ...padding]
  const proofData = new Uint8Array(64);
  proofData[0] = Number(ageValid);
  proofData[1] = Number(interestOverlap);
  // Fill with deterministic pseudo-random data based on inputs
  for (let i = 2; i < 64; i++) {
    proofData[i] = (age + i + overlap) % 256;
  }

  return {
    proofBytes: proofData,
    publicSignals: [ageValid, interestOverlap],
    rawProof: {
      pi_a: `mock_${age}_${overlap}_a`,
      pi_b: `mock_${age}_${overlap}_b`,
      pi_c: `mock_${age}_${overlap}_c`,
    },
  };
}

/**
 * Validate proof locally before submitting on-chain (saves gas on invalid proofs).
 */
export function validateProofLocally(result: ZKProofResult): {
  valid: boolean;
  reason?: string;
} {
  if (result.publicSignals[0] !== 1n) {
    return { valid: false, reason: "Age verification failed (must be 18+)" };
  }
  if (result.publicSignals[1] < 1n) {
    return { valid: false, reason: "No shared interests with this user" };
  }
  if (result.proofBytes.length === 0) {
    return { valid: false, reason: "Empty proof" };
  }
  return { valid: true };
}

/**
 * Encode proof to ABI-compatible bytes for Solidity calldata.
 */
export function encodeProofForContract(proof: ZKProofResult): {
  proofCalldata: `0x${string}`;
  signalsCalldata: bigint[];
} {
  const hex = Array.from(proof.proofBytes)
    .map(b => b.toString(16).padStart(2, "0"))
    .join("");
  return {
    proofCalldata: `0x${hex}` as `0x${string}`,
    signalsCalldata: proof.publicSignals,
  };
}

