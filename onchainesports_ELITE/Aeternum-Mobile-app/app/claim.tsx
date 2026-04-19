import Colors from '@/constants/Colors';
import { useWallet } from '@/context/WalletContext';
import { formatCurrency } from '@/mocks/data';
import { ApiError } from '@/services/api';
import { runMobileWalletTransaction } from '@/services/mobileWallet';
import {
  confirmClaimPrediction,
  prepareClaimPrediction,
  type PredictionClaimPreview,
} from '@/services/transactions';
import { useWalletStore } from '@/stores/wallet-store';
import { Web3MobileWallet } from '@solana-mobile/mobile-wallet-adapter-protocol-web3js';
import { clusterApiUrl, Connection, VersionedTransaction } from '@solana/web3.js';
import { useQueryClient } from '@tanstack/react-query';
import bs58 from 'bs58';
import { Buffer } from 'buffer';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { ArrowLeft, Calendar, Check, Shield, Wallet, Zap } from 'lucide-react-native';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Animated,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const APP_IDENTITY = {
  name: 'Aeternum',
  uri: 'https://aeturnum.app',
  icon: 'favicon.ico',
};

function isExpectedClaimIneligibleError(error: unknown): boolean {
  if (!(error instanceof ApiError) || error.status !== 400) {
    return false;
  }

  const message = error.message.toLowerCase();
  return message.includes('not yet settled') || message.includes('rewards already claimed');
}

function formatDateLabel(value?: string): string {
  if (!value) return 'N/A';
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return 'N/A';

  return parsed.toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
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
      console.error('[Claim] RPC endpoint failed', { endpoint, error: message });
    }
  }

  throw new Error(`All RPC endpoints failed. ${failures.join(' | ')}`);
}

export default function ClaimScreen() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const insets = useSafeAreaInsets();
  const { positions, isConnected, publicKeyBase58 } = useWallet();
  const isDevnet = useWalletStore((s) => s.isDevnet);
  const [isClaiming, setIsClaiming] = useState(false);
  const [activeClaimMarketId, setActiveClaimMarketId] = useState<string | null>(null);
  const [claimError, setClaimError] = useState('');
  const [previewLoading, setPreviewLoading] = useState(false);
  const [previewError, setPreviewError] = useState('');
  const [claimPreviews, setClaimPreviews] = useState<Record<string, PredictionClaimPreview>>({});

  const pulseAnim = useRef(new Animated.Value(1)).current;
  const glowAnim = useRef(new Animated.Value(0.4)).current;

  const claimableMarkets = useMemo(() => {
    const unique = new Map<string, { marketId: string; name: string; startTime?: string }>();

    positions.forEach((position) => {
      if (!unique.has(position.market.id)) {
        unique.set(position.market.id, {
          marketId: position.market.id,
          name: `${position.market.match.teamA.name} vs ${position.market.match.teamB.name}`,
          startTime: position.market.match.startTime,
        });
      }
    });

    return Array.from(unique.values());
  }, [positions]);

  const totalClaimable = useMemo(
    () => Object.values(claimPreviews).reduce((sum, preview) => sum + preview.netPayout, 0),
    [claimPreviews],
  );

  const claimableItems = useMemo(
    () => claimableMarkets.filter((market) => !!claimPreviews[market.marketId]),
    [claimPreviews, claimableMarkets],
  );

  const latestDistributionLabel = useMemo(() => {
    let latest: string | undefined;

    claimableItems.forEach((market) => {
      if (!market.startTime) return;
      if (!latest || new Date(market.startTime).getTime() > new Date(latest).getTime()) {
        latest = market.startTime;
      }
    });

    return formatDateLabel(latest);
  }, [claimableItems]);

  const totalProtocolFee = useMemo(
    () => claimableItems.reduce((sum, market) => sum + (claimPreviews[market.marketId]?.feeBreakdown.feeAmount ?? 0), 0),
    [claimPreviews, claimableItems],
  );

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.05, duration: 800, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1, duration: 800, useNativeDriver: true }),
      ])
    ).start();
    Animated.loop(
      Animated.sequence([
        Animated.timing(glowAnim, { toValue: 1, duration: 1200, useNativeDriver: true }),
        Animated.timing(glowAnim, { toValue: 0.4, duration: 1200, useNativeDriver: true }),
      ])
    ).start();
  }, []);

  useEffect(() => {
    let mounted = true;

    const loadClaimPreviews = async () => {
      if (!isConnected || claimableMarkets.length === 0) {
        setClaimPreviews({});
        setPreviewError('');
        return;
      }

      try {
        setPreviewLoading(true);
        setPreviewError('');

        const results = await Promise.allSettled(
          claimableMarkets.map((market) => prepareClaimPrediction({ marketId: market.marketId })),
        );

        if (!mounted) return;

        const nextPreviews: Record<string, PredictionClaimPreview> = {};
        let failedCount = 0;

        results.forEach((result, index) => {
          const marketId = claimableMarkets[index]?.marketId;
          if (!marketId) return;

          if (result.status === 'fulfilled') {
            nextPreviews[marketId] = result.value.preview;
          } else {
            if (!isExpectedClaimIneligibleError(result.reason)) {
              failedCount += 1;
            }
          }
        });

        setClaimPreviews(nextPreviews);

        if (failedCount > 0) {
          setPreviewError(`Unable to load preview for ${failedCount} market(s).`);
        }
      } catch (error) {
        if (!mounted) return;
        setPreviewError(error instanceof Error ? error.message : 'Unable to load claim previews');
      } finally {
        if (mounted) {
          setPreviewLoading(false);
        }
      }
    };

    loadClaimPreviews();

    return () => {
      mounted = false;
    };
  }, [claimableMarkets, isConnected]);

  const signAndSend = async (unsignedTx: string): Promise<string> => {
    return runMobileWalletTransaction(async (wallet: Web3MobileWallet) => {
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

      const unsignedTxBytes = Buffer.from(unsignedTx, 'base64');
      if (unsignedTxBytes.length === 0) {
        throw new Error('Invalid unsigned claim transaction');
      }
      const tx = VersionedTransaction.deserialize(unsignedTxBytes);

      const maybeSignAndSend = (
        wallet as unknown as {
          signAndSendTransactions?: (args: {
            transactions: VersionedTransaction[];
          }) => Promise<{ signatures: Array<string | Uint8Array> }>;
        }
      ).signAndSendTransactions;

      if (typeof maybeSignAndSend === 'function') {
        const walletSendResult = await maybeSignAndSend({ transactions: [tx] });
        const walletSig = Array.isArray(walletSendResult)
          ? walletSendResult[0]
          : walletSendResult?.signatures?.[0];

        if (typeof walletSig === 'string' && walletSig.length > 0) {
          return walletSig;
        }

        if (walletSig instanceof Uint8Array && walletSig.length > 0) {
          return bs58.encode(walletSig);
        }

        const txSignatureBytes = tx.signatures?.[0];
        if (txSignatureBytes instanceof Uint8Array && txSignatureBytes.some((b) => b !== 0)) {
          return bs58.encode(txSignatureBytes);
        }

        throw new Error('Wallet submitted claim but did not return signature');
      }

      const signedTxs = await wallet.signTransactions({ transactions: [tx] });
      if (!signedTxs?.[0]) {
        throw new Error('Wallet returned no signed transaction');
      }

      const result = await sendAndConfirmWithFallback(signedTxs[0].serialize(), walletState.isDevnet);
      return result.signature;
    });
  };

  const handleClaimMarket = async (marketId: string) => {
    try {
      setIsClaiming(true);
      setActiveClaimMarketId(marketId);
      setClaimError('');

      const prepared = await prepareClaimPrediction({ marketId });
      const signature = await signAndSend(prepared.unsignedTx);
      await confirmClaimPrediction({ txSignature: signature, marketId });

      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['investments_me'] }),
        queryClient.invalidateQueries({ queryKey: ['yield_claimable'] }),
        queryClient.invalidateQueries({ queryKey: ['user_profile'] }),
      ]);

      setClaimPreviews((prev) => {
        const next = { ...prev };
        delete next[marketId];
        return next;
      });
    } catch (e) {
      console.log('[Claim] Error:', e);
      if (isExpectedClaimIneligibleError(e)) {
        setClaimError('This market is no longer claimable.');
        setClaimPreviews((prev) => {
          const next = { ...prev };
          delete next[marketId];
          return next;
        });
      } else {
        setClaimError(e instanceof Error ? e.message : 'Claim failed');
      }
    } finally {
      setIsClaiming(false);
      setActiveClaimMarketId(null);
    }
  };

  const handleClaimAll = async () => {
    const marketIds = Object.keys(claimPreviews);
    if (marketIds.length === 0) return;

    for (const marketId of marketIds) {
      // Sequential claims avoid nonce/signature overlap in mobile wallet flow.
      // eslint-disable-next-line no-await-in-loop
      await handleClaimMarket(marketId);
    }

    router.back();
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <LinearGradient colors={['#0A0F0A', '#08090D']} style={StyleSheet.absoluteFill} />

      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <ArrowLeft size={20} color={Colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Claim Rewards</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 120 }}>
        <View style={styles.heroSection}>
          <Animated.View style={[styles.glowBg, { opacity: glowAnim }]} />
          <Animated.View style={[styles.claimBadge, { transform: [{ scale: pulseAnim }] }]}>
            <LinearGradient
              colors={[Colors.green, '#008F5F']}
              style={styles.claimBadgeGrad}
            >
              <Zap size={40} color={Colors.background} />
            </LinearGradient>
          </Animated.View>
          <Text style={styles.claimLabel}>CLAIMABLE REWARDS</Text>
          <Text style={styles.claimAmount}>{formatCurrency(totalClaimable)}</Text>
          <Text style={styles.claimSubtitle}>
            From {claimableItems.length} market position{claimableItems.length === 1 ? '' : 's'}
          </Text>
        </View>

        <View style={styles.infoCards}>
          <View style={styles.infoCard}>
            <Calendar size={18} color={Colors.cyan} />
            <Text style={styles.infoLabel}>Last Distribution</Text>
            <Text style={styles.infoVal}>{latestDistributionLabel}</Text>
          </View>
          <View style={styles.infoCard}>
            <Wallet size={18} color={Colors.gold} />
            <Text style={styles.infoLabel}>Protocol Fee</Text>
            <Text style={styles.infoVal}>{formatCurrency(totalProtocolFee)}</Text>
          </View>
        </View>

        <View style={styles.breakdownSection}>
          <Text style={styles.sectionTitle}>Breakdown by Market</Text>
          {previewLoading && (
            <View style={styles.previewLoadingRow}>
              <ActivityIndicator color={Colors.gold} size='small' />
              <Text style={styles.previewLoadingText}>Loading claim previews...</Text>
            </View>
          )}
          {claimableItems.map((item) => {
            const preview = claimPreviews[item.marketId];
            const isClaimingThis = isClaiming && activeClaimMarketId === item.marketId;

            return (
              <View key={item.marketId} style={styles.invRow}>
                <View style={styles.invDot} />
                <View style={styles.invInfo}>
                  <Text style={styles.invName} numberOfLines={1}>{item.name}</Text>
                  <Text style={styles.invShares}>{preview?.winningAmount ?? 0} winning units</Text>
                </View>
                <View style={styles.claimRowRight}>
                  <Text style={styles.invYield}>{formatCurrency(preview?.netPayout ?? 0)}</Text>
                  <TouchableOpacity
                    style={styles.claimRowBtn}
                    onPress={() => handleClaimMarket(item.marketId)}
                    disabled={isClaiming}
                    activeOpacity={0.8}
                  >
                    {isClaimingThis ? (
                      <ActivityIndicator color={Colors.background} size='small' />
                    ) : (
                      <Text style={styles.claimRowBtnText}>Claim</Text>
                    )}
                  </TouchableOpacity>
                </View>
              </View>
            );
          })}
          {!!previewError && <Text style={styles.previewErrorText}>{previewError}</Text>}
          {!!claimError && <Text style={styles.previewErrorText}>{claimError}</Text>}
          {claimableItems.length === 0 && (
            <View style={styles.emptyYield}>
              <Text style={styles.emptyYieldText}>No claimable rewards right now</Text>
              <Text style={styles.emptyYieldSub}>Rewards are distributed periodically</Text>
            </View>
          )}
        </View>

        <View style={styles.processSection}>
          <Text style={styles.sectionTitle}>Claim Process</Text>
          {[
            { step: '1', text: 'Sign transaction with your wallet', icon: '✍️' },
            { step: '2', text: 'Smart contract verifies your positions', icon: '🔐' },
            { step: '3', text: 'USDC is sent to your wallet', icon: '💸' },
          ].map((s) => (
            <View key={s.step} style={styles.processStep}>
              <Text style={styles.processStepIcon}>{s.icon}</Text>
              <View style={styles.processStepInfo}>
                <Text style={styles.processStepText}>{s.text}</Text>
              </View>
              <View style={styles.processCheck}>
                <Check size={12} color={Colors.green} />
              </View>
            </View>
          ))}
        </View>

        <View style={styles.securityRow}>
          <Shield size={14} color={Colors.green} />
          <Text style={styles.securityText}>
            Non-custodial claim · Your rewards, your control · Instant USDC settlement
          </Text>
        </View>
      </ScrollView>

      <View style={[styles.claimBar, { paddingBottom: insets.bottom + 12 }]}>
        <LinearGradient colors={['transparent', 'rgba(8,9,13,0.98)']} style={StyleSheet.absoluteFill} />
        <TouchableOpacity
          style={[styles.claimBtn, (totalClaimable <= 0 || isClaiming) && styles.claimBtnDisabled]}
          onPress={handleClaimAll}
          disabled={totalClaimable <= 0 || isClaiming}
          activeOpacity={0.85}
        >
          <LinearGradient
            colors={totalClaimable > 0 ? [Colors.green, '#008F5F'] : [Colors.border, Colors.border]}
            style={styles.claimBtnGrad}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
          >
            {isClaiming ? (
              <ActivityIndicator color={Colors.background} size="small" />
            ) : (
              <>
                <Zap size={18} color={totalClaimable > 0 ? Colors.background : Colors.textMuted} />
                <Text style={[styles.claimBtnText, totalClaimable <= 0 && styles.claimBtnTextDisabled]}>
                  {totalClaimable > 0 ? `Claim ${formatCurrency(totalClaimable)}` : 'Nothing to Claim'}
                </Text>
              </>
            )}
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 20, paddingTop: 14, paddingBottom: 14,
  },
  backBtn: {
    width: 40, height: 40, borderRadius: 12, backgroundColor: Colors.card,
    alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: Colors.border,
  },
  headerTitle: { fontSize: 18, fontWeight: '700' as const, color: Colors.text },
  heroSection: { alignItems: 'center', paddingVertical: 40, position: 'relative' },
  glowBg: {
    position: 'absolute',
    width: 260,
    height: 260,
    borderRadius: 130,
    backgroundColor: Colors.greenGlow,
  },
  claimBadge: {
    width: 100,
    height: 100,
    borderRadius: 50,
    overflow: 'hidden',
    marginBottom: 20,
    shadowColor: Colors.green,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 24,
  },
  claimBadgeGrad: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  claimLabel: {
    fontSize: 11, fontWeight: '700' as const, color: Colors.green,
    letterSpacing: 2, marginBottom: 8,
  },
  claimAmount: { fontSize: 44, fontWeight: '800' as const, color: Colors.text, marginBottom: 6, letterSpacing: -1 },
  claimSubtitle: { fontSize: 14, color: Colors.textMuted },
  infoCards: { flexDirection: 'row', paddingHorizontal: 20, gap: 12, marginBottom: 28 },
  infoCard: {
    flex: 1, backgroundColor: Colors.card, borderRadius: 14, padding: 14,
    borderWidth: 1, borderColor: Colors.border, alignItems: 'center', gap: 8,
  },
  infoLabel: { fontSize: 11, color: Colors.textMuted },
  infoVal: { fontSize: 14, fontWeight: '700' as const, color: Colors.text },
  breakdownSection: { paddingHorizontal: 20, marginBottom: 28 },
  sectionTitle: { fontSize: 17, fontWeight: '700' as const, color: Colors.text, marginBottom: 14 },
  invRow: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: Colors.border,
  },
  invDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: Colors.green },
  invInfo: { flex: 1 },
  invName: { fontSize: 14, fontWeight: '600' as const, color: Colors.text, marginBottom: 2 },
  invShares: { fontSize: 12, color: Colors.textMuted },
  claimRowRight: { alignItems: 'flex-end', gap: 8 },
  invYield: { fontSize: 16, fontWeight: '700' as const, color: Colors.green },
  claimRowBtn: {
    backgroundColor: Colors.green,
    borderRadius: 8,
    minWidth: 62,
    height: 28,
    paddingHorizontal: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  claimRowBtnText: { color: Colors.background, fontSize: 12, fontWeight: '700' as const },
  previewLoadingRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 10 },
  previewLoadingText: { color: Colors.textMuted, fontSize: 12 },
  previewErrorText: { color: Colors.red, fontSize: 12, marginTop: 8 },
  emptyYield: { alignItems: 'center', paddingVertical: 24 },
  emptyYieldText: { fontSize: 15, color: Colors.textSecondary, marginBottom: 6 },
  emptyYieldSub: { fontSize: 13, color: Colors.textMuted },
  processSection: { paddingHorizontal: 20, marginBottom: 20 },
  processStep: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    backgroundColor: Colors.card, borderRadius: 12, padding: 14,
    borderWidth: 1, borderColor: Colors.border, marginBottom: 8,
  },
  processStepIcon: { fontSize: 22 },
  processStepInfo: { flex: 1 },
  processStepText: { fontSize: 14, color: Colors.textSecondary },
  processCheck: {
    width: 22, height: 22, borderRadius: 11,
    backgroundColor: Colors.greenGlow, alignItems: 'center', justifyContent: 'center',
    borderWidth: 1, borderColor: Colors.green,
  },
  securityRow: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 6, paddingHorizontal: 20,
  },
  securityText: { fontSize: 12, color: Colors.textMuted, flex: 1 },
  claimBar: { position: 'absolute', bottom: 0, left: 0, right: 0, paddingTop: 20, paddingHorizontal: 20 },
  claimBtn: { borderRadius: 16, overflow: 'hidden', shadowColor: Colors.green, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.5, shadowRadius: 12 },
  claimBtnDisabled: { shadowOpacity: 0 },
  claimBtnGrad: { paddingVertical: 18, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10 },
  claimBtnText: { fontSize: 17, fontWeight: '700' as const, color: Colors.background },
  claimBtnTextDisabled: { color: Colors.textMuted },
});
