import { MOCK_USER } from '@/mocks/data';
import { BACKEND_TOKEN_KEY } from '@/services/api';
import { fetchMyInvestments, MarketPosition, PortfolioHolding } from '@/services/investments';
import { runMobileWalletTransaction } from '@/services/mobileWallet';
import type { UserTransaction } from '@/services/transactions';
import { fetchUserProfile } from '@/services/userProfile';
import {
  confirmYieldClaim,
  fetchClaimableYield,
  initiateYieldClaim,
  type YieldClaimRequestItem,
} from '@/services/yield';
import { useWalletStore, WalletType } from '@/stores/wallet-store';
import type { Investment, Listing, UserProfile } from '@/types';
import createContextHook from '@nkzw/create-context-hook';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Web3MobileWallet } from '@solana-mobile/mobile-wallet-adapter-protocol-web3js';
import {
  clusterApiUrl,
  Connection,
  PublicKey,
  VersionedTransaction,
} from '@solana/web3.js';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import bs58 from 'bs58';
import { Buffer } from 'buffer';
import { useEffect, useState } from 'react';

const APP_IDENTITY = {
  name: 'Aeternum',
  uri: 'https://aeturnum.app',
  icon: 'favicon.ico',
};

const STORAGE_KEYS = {
  WALLET: 'aeturnum_wallet',
  PROFILE: 'aeturnum_profile',
};

async function sendAndConfirmWithFallback(
  serializedTx: Uint8Array,
  isDevnet: boolean,
): Promise<string> {
  const devnetFallbacks = (process.env.EXPO_PUBLIC_SOLANA_DEVNET_RPC_FALLBACKS ?? '')
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);

  const mainnetFallbacks = (process.env.EXPO_PUBLIC_SOLANA_MAINNET_RPC_FALLBACKS ?? '')
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);

  const endpoints = isDevnet
    ? [
      process.env.EXPO_PUBLIC_SOLANA_DEVNET_RPC_URL?.trim(),
      ...devnetFallbacks,
      clusterApiUrl('devnet'),
      'https://api.devnet.solana.com',
    ]
    : [
      process.env.EXPO_PUBLIC_SOLANA_MAINNET_RPC_URL?.trim(),
      ...mainnetFallbacks,
      clusterApiUrl('mainnet-beta'),
      'https://api.mainnet-beta.solana.com',
    ];

  const uniqueEndpoints = Array.from(new Set(endpoints.filter((endpoint): endpoint is string => !!endpoint)));

  for (const endpoint of uniqueEndpoints) {
    try {
      const connection = new Connection(endpoint, 'confirmed');
      const signature = await connection.sendRawTransaction(serializedTx, {
        skipPreflight: false,
        maxRetries: 3,
      });

      await connection.confirmTransaction(signature, 'confirmed');
      return signature;
    } catch {
      // Continue trying fallback RPC endpoints.
    }
  }

  throw new Error('Unable to broadcast claim transaction to Solana RPC endpoints.');
}

export const [WalletProvider, useWallet] = createContextHook(() => {
  const queryClient = useQueryClient();
  const [isConnected, setIsConnected] = useState(false);
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [isSetupComplete, setIsSetupComplete] = useState(false);
  const [darkMode, setDarkMode] = useState(true);
  const [biometrics, setBiometrics] = useState(false);
  const [notifications, setNotifications] = useState(true);
  const [network, setNetwork] = useState<'devnet' | 'mainnet'>('devnet');

  // Zustand persisted store
  const walletType = useWalletStore((s) => s.walletType);
  const publicKeyBase58 = useWalletStore((s) => s.publicKeyBase58);

  const sessionQuery = useQuery({
    queryKey: ['wallet_session'],
    queryFn: async () => {
      const stored = await AsyncStorage.getItem(STORAGE_KEYS.WALLET);
      if (stored) {
        const data = JSON.parse(stored);
        return data as {
          address: string;
          publicKey?: string;
          walletType?: string;
          setupComplete: boolean;
        };
      }
      return null;
    },
  });

  useEffect(() => {
    if (sessionQuery.data) {
      setIsConnected(true);
      setWalletAddress(sessionQuery.data.address);
      setIsSetupComplete(sessionQuery.data.setupComplete);
      // Also sync into zustand if it was cleared (e.g. after an app reinstall
      // where AsyncStorage persisted but Zustand storage did not)
      const store = useWalletStore.getState();
      if (sessionQuery.data.publicKey && !store.publicKeyBase58) {
        store.setWalletData({
          walletType: (sessionQuery.data.walletType ?? null) as WalletType,
          publicKeyBase58: sessionQuery.data.publicKey,
          authToken: store.authToken ?? '',
        });
      }
      console.log('[WalletContext] Session restored:', sessionQuery.data.address);
    }
  }, [sessionQuery.data]);

  const setSessionSetupComplete = async (setupComplete: boolean) => {
    const stored = await AsyncStorage.getItem(STORAGE_KEYS.WALLET);
    if (!stored) {
      setIsSetupComplete(setupComplete);
      useWalletStore.getState().setSetupComplete(setupComplete);
      return;
    }

    const data = JSON.parse(stored) as {
      address: string;
      publicKey?: string;
      walletType?: string;
      setupComplete: boolean;
    };

    await AsyncStorage.setItem(
      STORAGE_KEYS.WALLET,
      JSON.stringify({
        ...data,
        setupComplete,
      }),
    );

    setIsSetupComplete(setupComplete);
    useWalletStore.getState().setSetupComplete(setupComplete);
    queryClient.invalidateQueries({ queryKey: ['wallet_session'] });
  };

  const profileQuery = useQuery({
    queryKey: ['user_profile', walletAddress],
    queryFn: async () => {
      try {
        const profile = await fetchUserProfile();
        await AsyncStorage.setItem(STORAGE_KEYS.PROFILE, JSON.stringify(profile));
        return profile;
      } catch (error) {
        const stored = await AsyncStorage.getItem(STORAGE_KEYS.PROFILE);
        if (stored) return JSON.parse(stored) as UserProfile;
        throw error;
      }
    },
    enabled: isConnected,
    retry: 1,
  });

  useEffect(() => {
    if (!isConnected || isSetupComplete) {
      return;
    }

    const tryPromoteSessionFromToken = async () => {
      const token = await AsyncStorage.getItem(BACKEND_TOKEN_KEY);
      if (token) {
        await setSessionSetupComplete(true);
      }
    };

    tryPromoteSessionFromToken().catch(() => {
      // Keep setup state unchanged when token check fails.
    });
  }, [isConnected, isSetupComplete]);

  const connectMutation = useMutation({
    mutationFn: async (selectedWalletType: string) => {
      console.log('[WalletContext] Connecting wallet:', selectedWalletType);
      const { isDevnet } = useWalletStore.getState();
      const cluster = isDevnet ? 'devnet' : 'mainnet-beta';

      const authResult = await runMobileWalletTransaction(async (wallet: Web3MobileWallet) => {
        return wallet.authorize({
          chain: `solana:${cluster}`,
          identity: APP_IDENTITY,
        });
      });

      // Decode the base64 address into a proper base-58 public key
      const pubkey = new PublicKey(
        Buffer.from(authResult.accounts[0].address, 'base64')
      );
      const pubkeyBase58 = pubkey.toBase58();
      const shortAddress = `${pubkeyBase58.slice(0, 4)}...${pubkeyBase58.slice(-4)}`;

      // Persist full wallet data in Zustand (AsyncStorage-backed)
      useWalletStore.getState().setWalletData({
        walletType: selectedWalletType as WalletType,
        publicKeyBase58: pubkeyBase58,
        authToken: authResult.auth_token ?? '',
      });

      // Also keep a lightweight session key for the session query
      await AsyncStorage.setItem(
        STORAGE_KEYS.WALLET,
        JSON.stringify({
          address: shortAddress,
          publicKey: pubkeyBase58,
          walletType: selectedWalletType,
          setupComplete: false,
        }),
      );

      return shortAddress;
    },
    onSuccess: (address) => {
      setIsConnected(true);
      setWalletAddress(address);
      setIsSetupComplete(false);
      queryClient.invalidateQueries({ queryKey: ['wallet_session'] });
      queryClient.invalidateQueries({ queryKey: ['investments_me'] });
      console.log('[WalletContext] Connected:', address);
    },
  });

  const setupMutation = useMutation({
    mutationFn: async (data: Partial<UserProfile>) => {
      console.log('[WalletContext] Setup profile:', data);
      const profile: UserProfile = {
        ...MOCK_USER,
        ...data,
        walletAddress: walletAddress ?? '',
      };
      const { publicKeyBase58: pk, walletType: wt } = useWalletStore.getState();
      await AsyncStorage.setItem(STORAGE_KEYS.PROFILE, JSON.stringify(profile));
      await AsyncStorage.setItem(
        STORAGE_KEYS.WALLET,
        JSON.stringify({
          address: walletAddress,
          publicKey: pk,
          walletType: wt,
          setupComplete: true,
        }),
      );
      useWalletStore.getState().setSetupComplete(true);
      return profile;
    },
    onSuccess: () => {
      setIsSetupComplete(true);
      queryClient.invalidateQueries({ queryKey: ['user_profile'] });
      console.log('[WalletContext] Setup complete');
    },
  });

  const disconnectMutation = useMutation({
    mutationFn: async () => {
      console.log('[WalletContext] Disconnecting wallet');
      await AsyncStorage.removeItem(STORAGE_KEYS.WALLET);
      await AsyncStorage.removeItem(STORAGE_KEYS.PROFILE);
      useWalletStore.getState().clearWallet();
    },
    onSuccess: () => {
      setIsConnected(false);
      setWalletAddress(null);
      setIsSetupComplete(false);
      queryClient.invalidateQueries({ queryKey: ['wallet_session'] });
      queryClient.invalidateQueries({ queryKey: ['user_profile'] });
      queryClient.invalidateQueries({ queryKey: ['investments_me'] });
      queryClient.invalidateQueries({ queryKey: ['yield_claimable'] });
    },
  });

  const claimableYieldQuery = useQuery({
    queryKey: ['yield_claimable', publicKeyBase58],
    queryFn: async () => fetchClaimableYield(publicKeyBase58 ?? ''),
    enabled: isConnected && !!publicKeyBase58,
    retry: 1,
  });

  const claimYieldMutation = useMutation({
    mutationFn: async (_amount: number) => {
      if (!publicKeyBase58) {
        throw new Error('Wallet not connected');
      }

      const latestClaimable = await fetchClaimableYield(publicKeyBase58);
      if (latestClaimable.claims.length === 0 || latestClaimable.totalClaimable <= 0) {
        return 0;
      }

      const initiated = await initiateYieldClaim({
        walletAddress: publicKeyBase58,
        claims: latestClaimable.claims,
      });

      const signature = await runMobileWalletTransaction(async (wallet: Web3MobileWallet) => {
        const walletState = useWalletStore.getState();
        const chain = walletState.isDevnet ? 'solana:devnet' : 'solana:mainnet-beta';

        const authResult = await wallet.authorize({
          chain,
          identity: APP_IDENTITY,
          auth_token: walletState.authToken ?? undefined,
        });

        if (walletState.walletType && walletState.publicKeyBase58) {
          walletState.setWalletData({
            walletType: walletState.walletType,
            publicKeyBase58: walletState.publicKeyBase58,
            authToken: authResult.auth_token ?? walletState.authToken ?? '',
          });
        }

        const unsignedTxBytes = Buffer.from(initiated.unsignedTx, 'base64');
        const unsignedTx = VersionedTransaction.deserialize(unsignedTxBytes);

        const maybeSignAndSend = (
          wallet as unknown as {
            signAndSendTransactions?: (args: { transactions: VersionedTransaction[] }) => Promise<{ signatures: Array<string | Uint8Array> }>;
          }
        ).signAndSendTransactions;

        if (typeof maybeSignAndSend === 'function') {
          const walletSendResult = await maybeSignAndSend({ transactions: [unsignedTx] });
          const walletSig = Array.isArray(walletSendResult)
            ? walletSendResult[0]
            : walletSendResult?.signatures?.[0];

          if (typeof walletSig === 'string' && walletSig.length > 0) {
            return walletSig;
          }

          if (walletSig instanceof Uint8Array && walletSig.length > 0) {
            return bs58.encode(walletSig);
          }

          const txSignatureBytes = unsignedTx.signatures?.[0];
          if (txSignatureBytes instanceof Uint8Array && txSignatureBytes.some((b) => b !== 0)) {
            return bs58.encode(txSignatureBytes);
          }

          throw new Error('Wallet submitted claim transaction but did not return signature.');
        }

        const signedTxs = await wallet.signTransactions({ transactions: [unsignedTx] });
        if (!signedTxs?.[0]) {
          throw new Error('Wallet returned no signed transaction for claim');
        }

        return sendAndConfirmWithFallback(signedTxs[0].serialize(), walletState.isDevnet);
      });

      const confirmPayload: { txSignature: string; claims: YieldClaimRequestItem[] } = {
        txSignature: signature,
        claims: latestClaimable.claims,
      };

      const confirmResponse = await confirmYieldClaim(confirmPayload);
      return confirmResponse.totalClaimed;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user_profile'] });
      queryClient.invalidateQueries({ queryKey: ['investments_me'] });
      queryClient.invalidateQueries({ queryKey: ['yield_claimable'] });
    },
  });

  const investmentsSummaryQuery = useQuery({
    queryKey: ['investments_me'],
    queryFn: fetchMyInvestments,
    enabled: isConnected,
    retry: 1,
  });

  const investments: Investment[] = investmentsSummaryQuery.data?.investments ?? [];
  const listings: Listing[] = investmentsSummaryQuery.data?.listings ?? [];
  const holdings: PortfolioHolding[] = investmentsSummaryQuery.data?.holdings ?? [];
  const positions: MarketPosition[] = investmentsSummaryQuery.data?.positions ?? [];
  const transactions: UserTransaction[] = investmentsSummaryQuery.data?.transactions ?? [];
  const profile = profileQuery.data ?? {
    ...MOCK_USER,
    walletAddress: publicKeyBase58 ?? walletAddress ?? MOCK_USER.walletAddress,
  };

  const totalPortfolioValue = investmentsSummaryQuery.data?.totals.totalCurrentValue
    ?? investments.reduce((sum, inv) => sum + inv.currentValue, 0);
  const totalInvested = investmentsSummaryQuery.data?.totals.totalPurchasePrice
    ?? investments.reduce((sum, inv) => sum + inv.purchasePrice, 0);
  const totalYieldEarned = investmentsSummaryQuery.data?.totals.totalYieldEarned
    ?? investments.reduce((sum, inv) => sum + inv.yieldEarned, 0);
  const totalClaimable = claimableYieldQuery.data?.totalClaimable
    ?? investmentsSummaryQuery.data?.totals.totalClaimableYield
    ?? investments.reduce((sum, inv) => sum + inv.claimableYield, 0);
  const overallROI = totalInvested > 0
    ? ((totalPortfolioValue + totalYieldEarned - totalInvested) / totalInvested) * 100
    : 0;

  return {
    isConnected,
    isLoading: sessionQuery.isLoading,
    walletAddress,
    publicKeyBase58,
    walletType,
    isSetupComplete,
    profile,
    investments,
    holdings,
    positions,
    transactions,
    listings,
    totalPortfolioValue,
    totalInvested,
    totalYieldEarned,
    totalClaimable,
    overallROI,
    darkMode,
    biometrics,
    notifications,
    network,
    setDarkMode,
    setBiometrics,
    setNotifications,
    setNetwork,
    setSessionSetupComplete,
    connect: connectMutation.mutateAsync,
    isConnecting: connectMutation.isPending,
    setup: setupMutation.mutateAsync,
    isSettingUp: setupMutation.isPending,
    disconnect: disconnectMutation.mutateAsync,
    isDisconnecting: disconnectMutation.isPending,
    claimYield: claimYieldMutation.mutateAsync,
    isClaiming: claimYieldMutation.isPending,
  };
});
