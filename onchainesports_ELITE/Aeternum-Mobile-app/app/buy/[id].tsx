import Colors from '@/constants/Colors';
import { useWallet } from '@/context/WalletContext';
import { formatCurrency } from '@/mocks/data';
import { ApiError } from '@/services/api';
import { fetchAssetById, type Asset } from '@/services/assets';
import { runMobileWalletTransaction } from '@/services/mobileWallet';
import {
  confirmBuyAsset,
  fetchUserTransactions,
  prepareBuyAsset,
  type BuyPreview,
} from '@/services/transactions';
import { useWalletStore } from '@/stores/wallet-store';
import { Web3MobileWallet } from '@solana-mobile/mobile-wallet-adapter-protocol-web3js';
import { clusterApiUrl, Connection, VersionedTransaction } from '@solana/web3.js';
import { useQueryClient } from '@tanstack/react-query';
import bs58 from 'bs58';
import { Buffer } from 'buffer';
import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ArrowLeft, Check, Minus, Plus, Shield, Wallet } from 'lucide-react-native';
import React, { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const APP_IDENTITY = {
  name: 'Aeternum',
  uri: 'https://aeturnum.app',
  icon: 'favicon.ico',
};

function getErrorMessage(error: unknown): string {
  if (error instanceof Error && error.message) return error.message;
  if (typeof error === 'string' && error.trim()) return error;

  try {
    const json = JSON.stringify(error);
    if (json && json !== '{}') return json;
  } catch {
    // fall through
  }

  const fallback = String(error ?? 'Unknown wallet error');
  return fallback && fallback !== '[object Object]' ? fallback : 'Unknown wallet error';
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function verifyBuyRecordedBySignature(
  txSignature: string,
  assetId: string,
): Promise<boolean> {
  try {
    const { transactions } = await fetchUserTransactions(50, 0);
    return transactions.some(
      (tx) => tx.txSignature === txSignature && tx.assetId === assetId,
    );
  } catch {
    return false;
  }
}

async function verifyRecentBuyRecorded(params: {
  assetId: string;
  quantity: number;
  submittedAtMs: number;
}): Promise<boolean> {
  try {
    const { transactions } = await fetchUserTransactions(100, 0);
    return transactions.some((tx) => {
      if (tx.txType !== 'BUY_ASSET') return false;
      if (tx.assetId !== params.assetId) return false;
      if (Number(tx.quantity) !== params.quantity) return false;

      const txMs = new Date(tx.createdAt).getTime();
      return Number.isFinite(txMs) && txMs >= params.submittedAtMs - 2 * 60 * 1000;
    });
  } catch {
    return false;
  }
}

async function reconcileBuyAfterConfirmNetworkFailure(params: {
  txSignature: string;
  assetId: string;
  quantity: number;
  submittedAtMs: number;
}): Promise<boolean> {
  const maxAttempts = 6;

  for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
    await sleep(1200 * attempt);

    try {
      await confirmBuyAsset({
        txSignature: params.txSignature,
        assetId: params.assetId,
        quantity: params.quantity,
      });
      console.log('[Buy] confirm eventually succeeded', { attempt });
      return true;
    } catch (error) {
      if (!(error instanceof ApiError && error.status === 0)) {
        throw error;
      }
    }

    const bySignature = await verifyBuyRecordedBySignature(
      params.txSignature,
      params.assetId,
    );
    if (bySignature) {
      console.log('[Buy] transaction found in history by signature', {
        txSignature: params.txSignature,
        attempt,
      });
      return true;
    }

    const byRecentMatch = await verifyRecentBuyRecorded({
      assetId: params.assetId,
      quantity: params.quantity,
      submittedAtMs: params.submittedAtMs,
    });
    if (byRecentMatch) {
      console.log('[Buy] transaction found in history by recent asset/quantity match', {
        assetId: params.assetId,
        quantity: params.quantity,
        attempt,
      });
      return true;
    }
  }

  return false;
}

async function sendAndConfirmWithFallback(
  serializedTx: Uint8Array,
  isDevnet: boolean,
): Promise<{ signature: string; endpoint: string }> {
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

  const uniqueEndpoints = Array.from(
    new Set(endpoints.filter((endpoint): endpoint is string => !!endpoint)),
  );
  const failures: string[] = [];

  for (const endpoint of uniqueEndpoints) {
    try {
      const connection = new Connection(endpoint, 'confirmed');
      const signature = await connection.sendRawTransaction(serializedTx, {
        skipPreflight: false,
        maxRetries: 3,
      });

      await connection.confirmTransaction(signature, 'confirmed');
      return { signature, endpoint };
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      failures.push(`${endpoint}: ${message}`);
      console.error('[Buy] RPC endpoint failed', { endpoint, error: message });
    }
  }

  throw new Error(`All RPC endpoints failed. ${failures.join(' | ')}`);
}

export default function BuySharesScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const queryClient = useQueryClient();
  const insets = useSafeAreaInsets();
  const { publicKeyBase58, isConnected } = useWallet();
  const isDevnet = useWalletStore((s) => s.isDevnet);

  const [quantity, setQuantity] = useState('1');
  const [asset, setAsset] = useState<Asset | null>(null);
  const [isLoadingAsset, setIsLoadingAsset] = useState(true);
  const [assetError, setAssetError] = useState('');
  const [preview, setPreview] = useState<BuyPreview | null>(null);
  const [unsignedTxStr, setUnsignedTxStr] = useState<string | null>(null);
  const [isLoadingPreview, setIsLoadingPreview] = useState(false);
  const [previewError, setPreviewError] = useState('');
  const [isConfirming, setIsConfirming] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [transactionError, setTransactionError] = useState('');

  // const quantityNum = Math.max(0, parseInt(quantity) || 0);

  // Load asset data
  useEffect(() => {
    let mounted = true;

    const loadAsset = async () => {
      if (!id) {
        setAssetError('No asset ID');
        return;
      }

      try {
        setIsLoadingAsset(true);
        setAssetError('');
        const data = await fetchAssetById(id);
        if (mounted) {
          if (data) {
            setAsset(data);
          } else {
            setAssetError('Asset not found');
          }
        }
      } catch (error) {
        if (mounted) {
          setAssetError(error instanceof Error ? error.message : 'Unable to load asset');
        }
      } finally {
        if (mounted) {
          setIsLoadingAsset(false);
        }
      }
    };

    loadAsset();

    return () => {
      mounted = false;
    };
  }, [id]);

  const quantityNum = Math.max(0, parseInt(quantity) || 0);

  // Fetch cost preview on every quantity change.
  // prepareBuyAsset returns both the estimate (preview) and the unsigned Solana tx.
  useEffect(() => {
    let mounted = true;
    if (!id || quantityNum <= 0) {
      setPreview(null);
      setUnsignedTxStr(null);
      setPreviewError('');
      return;
    }

    const load = async () => {
      setIsLoadingPreview(true);
      setPreviewError('');
      try {
        const resp = await prepareBuyAsset({ assetId: id, quantity: quantityNum });
        if (mounted) {
          setPreview(resp.preview);
          setUnsignedTxStr(resp.unsignedTx);
        }
      } catch (err) {
        if (mounted) {
          setPreviewError(err instanceof Error ? err.message : 'Unable to load preview');
          setPreview(null);
          setUnsignedTxStr(null);
        }
      } finally {
        if (mounted) setIsLoadingPreview(false);
      }
    };

    load();
    return () => {
      mounted = false;
    };
  }, [id, quantityNum]);

  const totalCost = preview?.totalCost ?? 0;
  const baseCost = preview?.baseCost ?? 0;
  const platformFee = preview?.feeBreakdown.feeAmount ?? 0;
  const feePct = preview ? (preview.feeBreakdown.feeBps / 100).toFixed(2) : '0.00';
  const currentPrice = preview?.currentPrice ?? 0;

  const canBuy = useMemo(() => {
    if (!id || !publicKeyBase58 || !isConnected) return false;
    if (!isDevnet) return false;
    if (quantityNum <= 0) return false;
    if (isLoadingPreview || !!previewError || !preview) return false;
    return true;
  }, [id, publicKeyBase58, isConnected, isDevnet, quantityNum, isLoadingPreview, previewError, preview]);

  const adjust = (delta: number) => {
    setQuantity(String(Math.max(1, (parseInt(quantity) || 0) + delta)));
  };

  const handleConfirm = async () => {
    if (!canBuy || !id || !publicKeyBase58) return;

    let stage = 'init';
    let walletStep = 'not-started';
    let submittedSignature: string | null = null;
    const submittedAtMs = Date.now();

    try {
      setIsConfirming(true);
      setTransactionError('');

      // Use the already-previewed unsigned tx first to avoid format drift between preview and confirm.
      stage = 'prepare-buy';
      let unsignedTxToUse = unsignedTxStr;

      if (!unsignedTxToUse) {
        const prepared = await prepareBuyAsset({ assetId: id, quantity: quantityNum });
        unsignedTxToUse = prepared.unsignedTx;
      }

      console.log('[Buy] prepare response', {
        assetId: id,
        quantity: quantityNum,
        totalCost,
        unsignedTxLength: unsignedTxToUse?.length ?? 0,
        source: unsignedTxStr ? 'preview-cache' : 'fresh-prepare',
      });

      if (!unsignedTxToUse) {
        throw new Error('No unsigned transaction returned from server');
      }

      stage = 'wallet-sign-and-send';
      const signature = await runMobileWalletTransaction(async (wallet: Web3MobileWallet) => {
        const walletState = useWalletStore.getState();
        const chain = walletState.isDevnet ? 'solana:devnet' : 'solana:mainnet-beta';

        walletStep = 'authorize';
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

        // Validate and deserialize the unsigned transaction
        let unsignedTx: VersionedTransaction;
        try {
          walletStep = 'deserialize-unsigned-tx';
          const unsignedTxBytes = Buffer.from(unsignedTxToUse, 'base64');
          if (unsignedTxBytes.length === 0) {
            throw new Error('Invalid unsigned transaction: empty bytes');
          }
          console.log('[Buy] Deserializing unsigned tx', {
            base64Length: unsignedTxToUse.length,
            bytesLength: unsignedTxBytes.length,
          });
          unsignedTx = VersionedTransaction.deserialize(unsignedTxBytes);
          console.log('[Buy] Successfully deserialized unsigned tx');
        } catch (decodeError) {
          console.error('[Buy] Failed to deserialize unsigned transaction', {
            error: decodeError instanceof Error ? decodeError.message : String(decodeError),
            unsignedTxLength: unsignedTxToUse?.length,
          });
          throw new Error(
            `Transaction decode failed: ${decodeError instanceof Error ? decodeError.message : 'Unknown error'}`,
          );
        }

        // Prefer wallet-native submit path to avoid device RPC reachability issues.
        const maybeSignAndSend = (
          wallet as unknown as {
            signAndSendTransactions?: (args: {
              transactions: VersionedTransaction[];
            }) => Promise<{ signatures: Array<string | Uint8Array> }>;
          }
        ).signAndSendTransactions;

        if (typeof maybeSignAndSend === 'function') {
          walletStep = 'wallet-native-sign-and-send';
          const walletSendResult = await maybeSignAndSend({ transactions: [unsignedTx] });
          const walletSig = Array.isArray(walletSendResult)
            ? walletSendResult[0]
            : walletSendResult?.signatures?.[0];

          if (typeof walletSig === 'string' && walletSig.length > 0) {
            console.log('[Buy] tx sent via wallet-native submit', { txSignature: walletSig });
            return walletSig;
          }

          if (walletSig instanceof Uint8Array && walletSig.length > 0) {
            const derivedSig = bs58.encode(walletSig);
            console.log('[Buy] tx sent via wallet-native submit (Uint8Array signature)', {
              txSignature: derivedSig,
            });
            return derivedSig;
          }

          // Some wallets submit successfully but don't return signatures in the adapter response.
          const txSignatureBytes = unsignedTx.signatures?.[0];
          if (txSignatureBytes instanceof Uint8Array && txSignatureBytes.some((b) => b !== 0)) {
            const derivedSig = bs58.encode(txSignatureBytes);
            console.log(
              '[Buy] tx sent via wallet-native submit (derived from tx signature bytes)',
              { txSignature: derivedSig },
            );
            return derivedSig;
          }

          console.log(
            '[Buy] wallet-native submit result missing signature; not falling back to app RPC to avoid duplicate send',
            { signatureType: typeof walletSig, rawResult: walletSendResult },
          );

          throw new Error(
            'Wallet submitted transaction but did not return a signature. Check wallet history for the tx signature and confirm manually.',
          );
        }

        walletStep = 'wallet-sign-transactions';
        const signedTxs = await wallet.signTransactions({ transactions: [unsignedTx] });

        if (!signedTxs?.[0]) {
          throw new Error('Wallet returned no signed transaction');
        }

        walletStep = 'rpc-send-and-confirm';
        const result = await sendAndConfirmWithFallback(
          signedTxs[0].serialize(),
          walletState.isDevnet,
        );

        console.log('[Buy] tx sent+confirmed via app RPC', {
          txSignature: result.signature,
          endpoint: result.endpoint,
        });
        return result.signature;
      });

      stage = 'confirm-buy';
      submittedSignature = signature;
      const confirmPayload = { txSignature: signature, assetId: id, quantity: quantityNum };
      console.log('[Buy] confirm request', confirmPayload);
      await confirmBuyAsset(confirmPayload);
      console.log('[Buy] confirm success', { txSignature: signature });

      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['investments_me'] }),
        queryClient.invalidateQueries({ queryKey: ['yield_claimable'] }),
        queryClient.invalidateQueries({ queryKey: ['user_profile'] }),
      ]);

      setIsSuccess(true);
      setTimeout(() => router.replace('/(tabs)/investments' as any), 2000);
    } catch (error) {
      const confirmNetworkFailure =
        stage === 'confirm-buy' && error instanceof ApiError && error.status === 0;

      if (confirmNetworkFailure && submittedSignature) {
        const alreadyRecorded = await reconcileBuyAfterConfirmNetworkFailure({
          txSignature: submittedSignature,
          assetId: id,
          quantity: quantityNum,
          submittedAtMs,
        });

        if (alreadyRecorded) {
          console.warn('[Buy] Confirm call failed initially but transaction is now reconciled', {
            txSignature: submittedSignature,
            assetId: id,
          });
          await Promise.all([
            queryClient.invalidateQueries({ queryKey: ['investments_me'] }),
            queryClient.invalidateQueries({ queryKey: ['yield_claimable'] }),
            queryClient.invalidateQueries({ queryKey: ['user_profile'] }),
          ]);
          setTransactionError('');
          setIsSuccess(true);
          setTimeout(() => router.replace('/(tabs)/investments' as any), 2000);
          return;
        }
      }

      const message = getErrorMessage(error);
      const rpcBlocked =
        stage === 'wallet-sign-and-send' && message.includes('All RPC endpoints failed');
      const confirmNetworkBlocked =
        stage === 'confirm-buy' && error instanceof ApiError && error.status === 0;
      const finalMessage = rpcBlocked
        ? `${message}\n\nYour device cannot reach Solana RPC. Set EXPO_PUBLIC_SOLANA_DEVNET_RPC_URL (or EXPO_PUBLIC_SOLANA_DEVNET_RPC_FALLBACKS) to a reachable endpoint, or disable VPN/Private DNS.`
        : confirmNetworkBlocked
          ? `${message}\n\nBuy confirmation is delayed by network. If this was just signed in wallet, wait ~30 seconds and check portfolio/transactions before retrying to avoid duplicate buys.`
          : message;

      console.error('[Buy] transaction error', {
        stage,
        assetId: id,
        quantity: quantityNum,
        walletAddress: publicKeyBase58,
        walletStep,
        error: finalMessage,
        stack: error instanceof Error ? error.stack : undefined,
        rawError: error,
      });
      const stagedMessage = `[${stage}] ${finalMessage}`;
      setTransactionError(stagedMessage);
    } finally {
      setIsConfirming(false);
    }
  };

  if (isSuccess) {
    return (
      <View
        style={[styles.successScreen, { paddingTop: insets.top, paddingBottom: insets.bottom }]}
      >
        <LinearGradient colors={['#0D0E1A', '#08090D']} style={StyleSheet.absoluteFill} />
        <View style={styles.successIcon}>
          <LinearGradient colors={['#D4AF37', '#A88C28']} style={styles.successIconGrad}>
            <Check size={36} color={Colors.background} strokeWidth={3} />
          </LinearGradient>
        </View>
        <Text style={styles.successTitle}>Position Opened!</Text>
        <Text style={styles.successSub}>
          You now hold {quantityNum} units of{'\n'}{preview?.assetName ?? 'this asset'}
        </Text>
        <View style={styles.successStats}>
          <View style={styles.successStat}>
            <Text style={styles.successStatVal}>{formatCurrency(totalCost)}</Text>
            <Text style={styles.successStatLabel}>Deployed</Text>
          </View>
        </View>
        <Text style={styles.successRedirect}>Redirecting to portfolio...</Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <LinearGradient colors={['#0D0E1A', '#08090D']} style={StyleSheet.absoluteFill} />

      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <ArrowLeft size={20} color={Colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Open Position</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ padding: 20, paddingBottom: 120 }}
      >
        <View style={styles.propInfo}>
          <Text style={styles.propName}>{asset?.name ?? (isLoadingAsset ? 'Loading...' : id)}</Text>
          <Text style={styles.propLocation}>
            {asset?.team?.name ?? asset?.collection?.name ?? 'Asset'}
          </Text>
        </View>

        <View style={styles.walletCard}>
          <View style={styles.walletLeft}>
            <View style={styles.walletIcon}>
              <Wallet size={18} color={Colors.gold} />
            </View>
            <View>
              <Text style={styles.walletLabel}>Connected Wallet</Text>
              <Text style={styles.walletBalance}>
                {publicKeyBase58
                  ? `${publicKeyBase58.slice(0, 4)}...${publicKeyBase58.slice(-4)}`
                  : 'Not connected'}
              </Text>
            </View>
          </View>
          <View style={[styles.networkBadge, { backgroundColor: Colors.greenGlow }]}>
            <View style={styles.greenDot} />
            <Text style={styles.networkText}>{isDevnet ? 'Devnet' : 'Mainnet'}</Text>
          </View>
        </View>

        <View style={styles.sharesSection}>
          <Text style={styles.sharesLabel}>Number of Units</Text>
          <View style={styles.sharesControl}>
            <TouchableOpacity
              style={[styles.adjBtn, quantityNum <= 1 && styles.adjBtnDisabled]}
              onPress={() => adjust(-1)}
              disabled={quantityNum <= 1}
            >
              <Minus size={18} color={quantityNum <= 1 ? Colors.textDisabled : Colors.text} />
            </TouchableOpacity>
            <TextInput
              style={styles.sharesInput}
              value={quantity}
              onChangeText={(v) => setQuantity(v.replace(/[^0-9]/g, ''))}
              keyboardType="numeric"
              textAlign="center"
            />
            <TouchableOpacity style={styles.adjBtn} onPress={() => adjust(1)}>
              <Plus size={18} color={Colors.text} />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.calcCard}>
          <Text style={styles.calcTitle}>Order Summary</Text>
          {[
            { label: 'Units', value: quantityNum.toLocaleString() },
            { label: 'Price per Unit', value: formatCurrency(currentPrice) },
            { label: 'Subtotal', value: formatCurrency(baseCost) },
            { label: `Platform Fee (${feePct}%)`, value: formatCurrency(platformFee) },
          ].map((row) => (
            <View key={row.label} style={styles.calcRow}>
              <Text style={styles.calcLabel}>{row.label}</Text>
              <Text style={styles.calcVal}>{row.value}</Text>
            </View>
          ))}
          <View style={styles.calcDivider} />
          <View style={styles.calcRow}>
            <Text style={styles.calcTotalLabel}>Total Cost</Text>
            <Text style={styles.calcTotalVal}>{formatCurrency(totalCost)}</Text>
          </View>
        </View>

        <View style={styles.projCard}>
          {(previewError || transactionError || !isConnected || !isDevnet) && (
            <View style={styles.errorBanner}>
              <Text style={styles.errorText}>
                {previewError ||
                  transactionError ||
                  (!isConnected
                    ? 'Connect wallet first to open a position.'
                    : 'Switch to devnet mode to execute this flow.')}
              </Text>
            </View>
          )}

          {isLoadingPreview && (
            <View style={styles.loadingInline}>
              <ActivityIndicator color={Colors.gold} size="small" />
              <Text style={styles.loadingInlineText}>Refreshing preview...</Text>
            </View>
          )}

          <View style={styles.securityRow}>
            <Shield size={14} color={Colors.green} />
            <Text style={styles.securityText}>
              Transaction signed locally · Non-custodial · Transparent settlement
            </Text>
          </View>
        </View>
      </ScrollView>

      <View style={[styles.buyBar, { paddingBottom: insets.bottom + 12 }]}>
        <LinearGradient
          colors={['transparent', 'rgba(8,9,13,0.98)']}
          style={StyleSheet.absoluteFill}
        />
        <TouchableOpacity
          style={[styles.confirmBtn, !canBuy && styles.confirmBtnDisabled]}
          onPress={handleConfirm}
          disabled={!canBuy || isConfirming}
          activeOpacity={0.85}
        >
          <LinearGradient
            colors={canBuy ? ['#D4AF37', '#A88C28'] : [Colors.border, Colors.border]}
            style={styles.confirmBtnGrad}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
          >
            {isConfirming ? (
              <ActivityIndicator color={Colors.background} size="small" />
            ) : (
              <Text style={[styles.confirmBtnText, !canBuy && styles.confirmBtnTextDisabled]}>
                {canBuy
                  ? `Confirm · ${formatCurrency(totalCost)}`
                  : quantityNum === 0
                    ? 'Enter units amount'
                    : !isConnected
                      ? 'Connect Wallet'
                      : !isDevnet
                        ? 'Switch to Devnet'
                        : 'Invalid amount'}
              </Text>
            )}
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  center: { alignItems: 'center', justifyContent: 'center' },
  notFound: { fontSize: 18, color: Colors.text, marginBottom: 12 },
  backLink: { fontSize: 14, color: Colors.gold },
  successScreen: {
    flex: 1,
    backgroundColor: Colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
  },
  successIcon: {
    width: 90,
    height: 90,
    borderRadius: 45,
    overflow: 'hidden',
    marginBottom: 24,
    shadowColor: Colors.gold,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 20,
  },
  successIconGrad: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  successTitle: { fontSize: 28, fontWeight: '800', color: Colors.text, marginBottom: 10 },
  successSub: {
    fontSize: 15,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 28,
  },
  successStats: { flexDirection: 'row', gap: 24, marginBottom: 24 },
  successStat: { alignItems: 'center' },
  successStatVal: { fontSize: 20, fontWeight: '700', color: Colors.gold, marginBottom: 4 },
  successStatLabel: { fontSize: 12, color: Colors.textMuted },
  successRedirect: { fontSize: 13, color: Colors.textDisabled },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 14,
    paddingBottom: 14,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: Colors.card,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  headerTitle: { fontSize: 18, fontWeight: '700', color: Colors.text },
  propInfo: {
    backgroundColor: Colors.card,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: 14,
  },
  propName: { fontSize: 17, fontWeight: '700', color: Colors.text, marginBottom: 4 },
  propLocation: { fontSize: 13, color: Colors.textMuted, marginBottom: 10 },
  yieldChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: Colors.greenGlow,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderColor: Colors.green,
  },
  yieldChipText: { fontSize: 12, color: Colors.green, fontWeight: '600' },
  walletCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.card,
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: 20,
  },
  walletLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  walletIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: Colors.goldGlow,
    alignItems: 'center',
    justifyContent: 'center',
  },
  walletLabel: { fontSize: 11, color: Colors.textMuted, marginBottom: 2 },
  walletBalance: { fontSize: 16, fontWeight: '700', color: Colors.text },
  networkBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.green,
  },
  greenDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: Colors.green },
  networkText: { fontSize: 12, color: Colors.green, fontWeight: '600' },
  sharesSection: {
    backgroundColor: Colors.card,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: 14,
    alignItems: 'center',
  },
  sharesLabel: { fontSize: 13, color: Colors.textMuted, marginBottom: 14 },
  sharesControl: { flexDirection: 'row', alignItems: 'center', gap: 16, marginBottom: 10 },
  adjBtn: {
    width: 46,
    height: 46,
    borderRadius: 14,
    backgroundColor: Colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.borderLight,
  },
  adjBtnDisabled: { opacity: 0.4 },
  sharesInput: {
    width: 100,
    height: 56,
    backgroundColor: Colors.surface,
    borderRadius: 14,
    fontSize: 28,
    fontWeight: '800',
    color: Colors.text,
    borderWidth: 1,
    borderColor: Colors.gold,
    textAlign: 'center',
  },
  sharesAvail: { fontSize: 12, color: Colors.textMuted },
  calcCard: {
    backgroundColor: Colors.card,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: 14,
  },
  calcTitle: { fontSize: 15, fontWeight: '700', color: Colors.text, marginBottom: 14 },
  calcRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
  calcLabel: { fontSize: 13, color: Colors.textMuted },
  calcVal: { fontSize: 13, color: Colors.textSecondary, fontWeight: '500' },
  calcDivider: { height: 1, backgroundColor: Colors.border, marginVertical: 10 },
  calcTotalLabel: { fontSize: 15, fontWeight: '700', color: Colors.text },
  calcTotalVal: { fontSize: 17, fontWeight: '800', color: Colors.gold },
  projCard: {
    backgroundColor: Colors.card,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: 14,
  },
  projTitle: { fontSize: 15, fontWeight: '700', color: Colors.text, marginBottom: 14 },
  projGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 0 },
  projCell: { width: '50%', alignItems: 'flex-start', paddingBottom: 12 },
  projVal: { fontSize: 16, fontWeight: '700', marginBottom: 3 },
  projLabel: { fontSize: 11, color: Colors.textMuted },
  errorBanner: {
    backgroundColor: Colors.redGlow,
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: Colors.red,
    marginBottom: 14,
  },
  errorText: { fontSize: 13, color: Colors.red, textAlign: 'center' },
  loadingInline: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 14,
  },
  loadingInlineText: { fontSize: 12, color: Colors.textMuted },
  securityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  securityText: { fontSize: 12, color: Colors.textMuted, textAlign: 'center', flex: 1 },
  buyBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingTop: 20,
    paddingHorizontal: 20,
  },
  confirmBtn: {
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: Colors.gold,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 12,
  },
  confirmBtnDisabled: { shadowOpacity: 0 },
  confirmBtnGrad: { paddingVertical: 18, alignItems: 'center', justifyContent: 'center' },
  confirmBtnText: { fontSize: 17, fontWeight: '700', color: Colors.background },
  confirmBtnTextDisabled: { color: Colors.textMuted },
});