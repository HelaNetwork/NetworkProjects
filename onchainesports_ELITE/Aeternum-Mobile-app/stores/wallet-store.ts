/**
 * Zustand wallet store – persisted to AsyncStorage so wallet state
 * survives app restarts.
 *
 * Fields:
 *  isDevnet       – which RPC cluster to use
 *  walletType     – 'phantom' | 'solflare' | null
 *  publicKeyBase58 – full base-58 public key                    (null when disconnected)
 *  authToken      – the MWA auth_token returned by wallet.authorize()  (null when disconnected)
 */

import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

export type WalletType = "phantom" | "solflare" | null;

interface WalletStoreState {
  // -- Network --
  isDevnet: boolean;

  // -- Wallet identity --
  walletType: WalletType;
  publicKeyBase58: string | null;
  authToken: string | null;

  // -- Profile setup flag --
  setupComplete: boolean;

  // -- Setters --
  setIsDevnet: (val: boolean) => void;
  setWalletData: (data: {
    walletType: WalletType;
    publicKeyBase58: string;
    authToken: string;
  }) => void;
  setSetupComplete: (val: boolean) => void;
  clearWallet: () => void;
}

export const useWalletStore = create<WalletStoreState>()(
  persist(
    (set) => ({
      isDevnet: true,
      walletType: null,
      publicKeyBase58: null,
      authToken: null,
      setupComplete: false,

      setIsDevnet: (val) => set({ isDevnet: val }),

      setWalletData: ({ walletType, publicKeyBase58, authToken }) =>
        set({ walletType, publicKeyBase58, authToken }),

      setSetupComplete: (val) => set({ setupComplete: val }),

      clearWallet: () =>
        set({
          walletType: null,
          publicKeyBase58: null,
          authToken: null,
          setupComplete: false,
        }),
    }),
    {
      name: "aeturnum_wallet_store",
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);
