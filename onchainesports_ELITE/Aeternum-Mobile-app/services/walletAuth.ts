/**
 * Mobile Wallet Adapter (MWA) – wallet connection service
 *
 * Uses @solana-mobile/mobile-wallet-adapter-protocol-web3js transact() pattern.
 * Reference: https://docs.solanamobile.com/react-native/mwa_quickstart
 *
 * Flow:
 *  1. Call connectWallet()
 *  2. transact() launches the installed MWA-compatible wallet (Phantom, Backpack, Solflare...)
 *  3. wallet.authorize() prompts the user once; subsequent calls use the cached auth_token
 *     for silent re-authorization
 *  4. The base64 account address is decoded into a base58 PublicKey via toByteArray + PublicKey
 */

import {
  transact,
  Web3MobileWallet,
} from '@solana-mobile/mobile-wallet-adapter-protocol-web3js';
import { PublicKey } from '@solana/web3.js';
import { toByteArray } from 'react-native-quick-base64';
import AsyncStorage from '@react-native-async-storage/async-storage';

// ---------------------------------------------------------------------------
// App identity shown to the user inside the wallet approval dialog
// ---------------------------------------------------------------------------
const APP_IDENTITY = {
  name: 'Aeternum',
  uri: 'https://aeternum.app',
  icon: 'favicon.ico', // relative to uri
};

const AUTH_TOKEN_KEY = 'mwa_auth_token';
const CHAIN = 'solana:devnet' as const;

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type WalletAuthSession = {
  /** Base58 public key (the human-readable Solana address) */
  address: string;
  /** Truncated form, e.g. "7xKp...mN3q" */
  shortAddress: string;
  /** Opaque token for silent re-authorization - never parse or modify */
  authToken: string;
  connectedAt: string;
  network: 'devnet' | 'mainnet-beta';
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function formatShortAddress(address: string): string {
  if (address.length <= 10) return address;
  return `${address.slice(0, 4)}...${address.slice(-4)}`;
}

// ---------------------------------------------------------------------------
// Connect
// ---------------------------------------------------------------------------

/**
 * Opens the installed MWA wallet, authorizes the app, and returns a session.
 * On repeat calls the cached auth_token is passed so the wallet can authorize
 * silently without showing the approval dialog again.
 */
export async function connectWallet(): Promise<WalletAuthSession> {
  const cachedToken = await AsyncStorage.getItem(AUTH_TOKEN_KEY);

  return await transact(async (wallet: Web3MobileWallet) => {
    let authResult;

    try {
      authResult = await wallet.authorize({
        identity: APP_IDENTITY,
        chain: CHAIN,
        // Passing a valid cached token lets the wallet skip the approval dialog
        auth_token: cachedToken ?? undefined,
      });
    } catch (error: unknown) {
      const code = (error as { code?: number })?.code;
      // -32000 = token expired/invalid; 4100 = unauthorized
      // Retry with a fresh authorization
      if (cachedToken && (code === -32000 || code === 4100)) {
        await AsyncStorage.removeItem(AUTH_TOKEN_KEY);
        authResult = await wallet.authorize({
          identity: APP_IDENTITY,
          chain: CHAIN,
        });
      } else {
        throw error;
      }
    }

    // Always persist the (potentially refreshed) token
    await AsyncStorage.setItem(AUTH_TOKEN_KEY, authResult.auth_token);

    // MWA returns addresses as base64 – decode to Uint8Array then wrap in PublicKey
    const publicKey = new PublicKey(toByteArray(authResult.accounts[0].address));
    const address = publicKey.toBase58();

    return {
      address,
      shortAddress: formatShortAddress(address),
      authToken: authResult.auth_token,
      connectedAt: new Date().toISOString(),
      network: 'devnet',
    };
  });
}

// ---------------------------------------------------------------------------
// Disconnect
// ---------------------------------------------------------------------------

/**
 * Deauthorizes the app with the wallet (invalidates the token wallet-side)
 * and removes the locally cached token.
 */
export async function disconnectWallet(): Promise<void> {
  const authToken = await AsyncStorage.getItem(AUTH_TOKEN_KEY);
  if (!authToken) return;

  try {
    await transact(async (wallet: Web3MobileWallet) => {
      await wallet.deauthorize({ auth_token: authToken });
    });
  } catch (error) {
    // Swallow – token may already be expired; we still clear local storage
    console.warn('[WalletAuth] deauthorize error (clearing token anyway):', error);
  }

  await AsyncStorage.removeItem(AUTH_TOKEN_KEY);
}
