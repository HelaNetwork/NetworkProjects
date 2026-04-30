import { keccak256, encodePacked, toHex } from "viem";

export interface LikeCommitment {
  commitmentHash: `0x${string}`;
  fromHash: `0x${string}`;
  toHash: `0x${string}`;
  nonce: `0x${string}`;
  timestamp: number;
}

// Deterministic identity hash from wallet address.
// In production, replace with Poseidon hash from circom.
export function generateIdentityHash(address: string): `0x${string}` {
  return keccak256(
    encodePacked(
      ["address", "string"],
      [address as `0x${string}`, "hela-match-v1"]
    )
  );
}

// Generate a cryptographic commitment for a like action.
// commitment = keccak256(fromHash, toHash, nonce)
// The nonce is derived from the sender's address + timestamp to be deterministic
// but unpredictable to third parties.
export function generateLikeCommitment(
  fromAddress: string,
  toAddress: string
): LikeCommitment {
  const fromHash = generateIdentityHash(fromAddress);
  const toHash = generateIdentityHash(toAddress);
  const timestamp = Date.now();

  // Nonce is a hash of (address + timestamp) for uniqueness.
  const nonce = keccak256(
    encodePacked(
      ["address", "uint256"],
      [fromAddress as `0x${string}`, BigInt(timestamp)]
    )
  );

  // The commitment hash is what goes on-chain.
  const commitmentHash = keccak256(
    encodePacked(
      ["bytes32", "bytes32", "bytes32"],
      [fromHash, toHash, nonce]
    )
  );

  return {
    commitmentHash,
    fromHash,
    toHash,
    nonce,
    timestamp,
  };
}

// Generate a message proof hash for on-chain storage.
// This proves a message was sent at a specific time for a specific match
// without revealing the message content.
export function generateMessageProofHash(
  matchId: string,
  messageContent: string,
  senderAddress: string
): `0x${string}` {
  const contentHash = keccak256(toHex(messageContent));
  return keccak256(
    encodePacked(
      ["string", "bytes32", "address", "uint256"],
      [
        matchId,
        contentHash,
        senderAddress as `0x${string}`,
        BigInt(Date.now()),
      ]
    )
  );
}

// Verify a commitment locally (client-side check before sending tx).
export function verifyCommitment(commitment: LikeCommitment): boolean {
  const recomputed = keccak256(
    encodePacked(
      ["bytes32", "bytes32", "bytes32"],
      [commitment.fromHash, commitment.toHash, commitment.nonce]
    )
  );
  return recomputed === commitment.commitmentHash;
}
