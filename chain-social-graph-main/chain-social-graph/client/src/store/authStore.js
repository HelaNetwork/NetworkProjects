import { create } from "zustand";
import { persist } from "zustand/middleware";
import api from "../utils/api";

const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      walletAddress: null,
      isConnecting: false,
      isLoading: false,

      connectWallet: async () => {
        if (!window.ethereum) {
          throw new Error("MetaMask not installed. Please install MetaMask to continue.");
        }
        set({ isConnecting: true });
        try {
          const accounts = await window.ethereum.request({ method: "eth_requestAccounts" });
          const address = accounts[0].toLowerCase();
          set({ walletAddress: address });

          const { data } = await api.post("/users/auth", { walletAddress: address });
          set({ user: data.user, isConnecting: false });
          return { user: data.user, isNew: data.isNew };
        } catch (err) {
          set({ isConnecting: false });
          throw err;
        }
      },

      disconnect: () => {
        set({ user: null, walletAddress: null });
      },

      updateUser: (updatedUser) => {
        set({ user: updatedUser });
      },

      refreshUser: async () => {
        const { walletAddress } = get();
        if (!walletAddress) return;
        const { data } = await api.get(`/users/${walletAddress}`);
        set({ user: data });
      },
    }),
    {
      name: "chain-social-auth",
      partialize: (state) => ({ user: state.user, walletAddress: state.walletAddress }),
    }
  )
);

export default useAuthStore;
