/**
 * lib/encryption.ts
 * ─────────────────
 * Client-side field encryption using the Web Crypto API (AES-CBC).
 * Profile name, bio, and age are encrypted locally before sending
 * the IPFS CID hash on-chain. Only the keccak256 hash of the CID ever
 * appears on-chain; the actual plaintext stays off-chain.
 */

const ALGORITHM = "AES-CBC";
const KEY_BITS = 256;
const IV_BYTES = 16;

/** Derive an AES key from a wallet address string (for demo key derivation) */
export async function deriveKey(walletAddress: string): Promise<CryptoKey> {
  const encoder = new TextEncoder();
  const keyMaterial = await crypto.subtle.importKey(
    "raw",
    encoder.encode(walletAddress.toLowerCase().padEnd(32, "0").slice(0, 32)),
    { name: "AES-CBC" },
    false,
    ["encrypt", "decrypt"]
  );
  return keyMaterial;
}

/** Encrypt a plaintext string, returns base64(iv + ciphertext) */
export async function encryptField(plaintext: string, key: CryptoKey): Promise<string> {
  const encoder = new TextEncoder();
  const iv = crypto.getRandomValues(new Uint8Array(IV_BYTES));
  const encrypted = await crypto.subtle.encrypt(
    { name: ALGORITHM, iv },
    key,
    encoder.encode(plaintext)
  );
  const combined = new Uint8Array(iv.byteLength + encrypted.byteLength);
  combined.set(iv, 0);
  combined.set(new Uint8Array(encrypted), iv.byteLength);
  return btoa(String.fromCharCode(...combined));
}

/** Decrypt a base64(iv + ciphertext) string */
export async function decryptField(base64Cipher: string, key: CryptoKey): Promise<string> {
  const bytes = Uint8Array.from(atob(base64Cipher), c => c.charCodeAt(0));
  const iv = bytes.slice(0, IV_BYTES);
  const data = bytes.slice(IV_BYTES);
  const decrypted = await crypto.subtle.decrypt({ name: ALGORITHM, iv }, key, data);
  return new TextDecoder().decode(decrypted);
}

/** 
 * Hash a profile object for on-chain storage.
 * Uses the Web Crypto SHA-256 (proxies keccak256 for demo — replace with
 * ethers.keccak256 in full integration).
 */
export async function hashProfileForChain(profile: {
  name: string;
  bio: string;
  age: number;
  interests: number[];
}): Promise<`0x${string}`> {
  const json = JSON.stringify(profile);
  const encoded = new TextEncoder().encode(json);
  const hashBuffer = await crypto.subtle.digest("SHA-256", encoded);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hex = hashArray.map(b => b.toString(16).padStart(2, "0")).join("");
  return `0x${hex}` as `0x${string}`;
}

/** Generate a random AES key (for new users without wallet-derived key) */
export async function generateRandomKey(): Promise<CryptoKey> {
  return crypto.subtle.generateKey(
    { name: ALGORITHM, length: KEY_BITS },
    true,
    ["encrypt", "decrypt"]
  );
}

/** Export key to base64 string for storage */
export async function exportKey(key: CryptoKey): Promise<string> {
  const raw = await crypto.subtle.exportKey("raw", key);
  return btoa(String.fromCharCode(...new Uint8Array(raw)));
}
