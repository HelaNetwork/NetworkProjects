import {
    transact,
    type Web3MobileWallet,
} from "@solana-mobile/mobile-wallet-adapter-protocol-web3js";
import { AppState, InteractionManager, Platform } from "react-native";

const CURRENT_ACTIVITY_ERROR_PATTERNS = [
  "could not find a current activity",
  "launch a local association",
];

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function waitForInteractions(): Promise<void> {
  await new Promise<void>((resolve) => {
    InteractionManager.runAfterInteractions(() => resolve());
  });
}

async function waitForAppToBeActive(timeoutMs = 3000): Promise<void> {
  if (Platform.OS !== "android") {
    await waitForInteractions();
    return;
  }

  if (AppState.currentState !== "active") {
    await new Promise<void>((resolve) => {
      let resolved = false;
      const sub = AppState.addEventListener("change", (state) => {
        if (state === "active" && !resolved) {
          resolved = true;
          clearTimeout(timeoutId);
          sub.remove();
          resolve();
        }
      });

      const timeoutId = setTimeout(() => {
        if (!resolved) {
          resolved = true;
          sub.remove();
          resolve();
        }
      }, timeoutMs);
    });
  }

  await waitForInteractions();
  await delay(150);
}

export function isWalletCurrentActivityError(error: unknown): boolean {
  const message =
    error instanceof Error
      ? error.message.toLowerCase()
      : String(error).toLowerCase();
  return CURRENT_ACTIVITY_ERROR_PATTERNS.some((pattern) =>
    message.includes(pattern),
  );
}

export async function runMobileWalletTransaction<T>(
  operation: (wallet: Web3MobileWallet) => Promise<T>,
  options?: {
    maxAttempts?: number;
    retryDelayMs?: number;
  },
): Promise<T> {
  const maxAttempts = options?.maxAttempts ?? 2;
  const retryDelayMs = options?.retryDelayMs ?? 250;
  let lastError: unknown;

  for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
    await waitForAppToBeActive();

    try {
      return await transact(operation);
    } catch (error) {
      lastError = error;
      if (!isWalletCurrentActivityError(error) || attempt === maxAttempts) {
        throw error;
      }
      await delay(retryDelayMs * attempt);
    }
  }

  throw lastError;
}
