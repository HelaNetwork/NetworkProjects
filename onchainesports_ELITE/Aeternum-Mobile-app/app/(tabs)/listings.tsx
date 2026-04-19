import Colors from '@/constants/Colors';
import { formatCurrency } from '@/mocks/data';
import { ApiError } from '@/services/api';
import { fetchListingDrafts, ListingDraftListItem, mintPropertyFromDraft } from '@/services/listingDraft';
import { runMobileWalletTransaction } from '@/services/mobileWallet';
import { fetchUserPortfolio, PortfolioHolding, PortfolioSummary } from '@/services/portfolio';
import { fetchMyListings } from '@/services/property';
import { confirmSellAsset, prepareSellAsset } from '@/services/transactions';
import { useWalletStore } from '@/stores/wallet-store';
import { Listing } from '@/types';
import { Web3MobileWallet } from '@solana-mobile/mobile-wallet-adapter-protocol-web3js';
import { clusterApiUrl, Connection, VersionedTransaction } from '@solana/web3.js';
import { useQueryClient } from '@tanstack/react-query';
import bs58 from 'bs58';
import { Buffer } from 'buffer';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const APP_IDENTITY = {
  name: 'Aeternum',
  uri: 'https://aeturnum.app',
  icon: 'favicon.ico',
};

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
      console.error('[Listings] Sell RPC endpoint failed', { endpoint, error: message });
    }
  }

  throw new Error(`All RPC endpoints failed. ${failures.join(' | ')}`);
}

function getErrorMessage(error: unknown): string {
  if (error instanceof Error && error.message) return error.message;
  if (typeof error === 'string' && error.trim()) return error;
  return 'Unknown transaction error';
}

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  draft: { label: 'Draft', color: Colors.textMuted, bg: Colors.border },
  pending: { label: 'Pending Review', color: Colors.gold, bg: Colors.goldGlow },
  approved: { label: 'Approved', color: Colors.cyan, bg: Colors.cyanGlow },
  rejected: { label: 'Rejected', color: Colors.red, bg: Colors.redGlow },
  live: { label: 'Live', color: Colors.green, bg: Colors.greenGlow },
};

export default function ListingsScreen() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const insets = useSafeAreaInsets();
  const isDevnet = useWalletStore((s) => s.isDevnet);
  const [myListings, setMyListings] = useState<Listing[]>([]);
  const [isLoadingMyListings, setIsLoadingMyListings] = useState(true);
  const [myListingsError, setMyListingsError] = useState('');
  const [portfolioSummary, setPortfolioSummary] = useState<PortfolioSummary | null>(null);
  const [holdings, setHoldings] = useState<PortfolioHolding[]>([]);
  const [isLoadingHoldings, setIsLoadingHoldings] = useState(true);
  const [holdingsError, setHoldingsError] = useState('');
  const [sellingHoldingId, setSellingHoldingId] = useState<string | null>(null);
  const [sellActionMessage, setSellActionMessage] = useState('');
  const [drafts, setDrafts] = useState<ListingDraftListItem[]>([]);
  const [isLoadingDrafts, setIsLoadingDrafts] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [draftError, setDraftError] = useState('');
  const [mintingDraftId, setMintingDraftId] = useState<string | null>(null);

  const activeListings = useMemo(
    () => myListings.filter((listing) => listing.status !== 'draft'),
    [myListings],
  );

  const loadMyListings = useCallback(async () => {
    try {
      setIsLoadingMyListings(true);
      setMyListingsError('');
      const data = await fetchMyListings(1, 100);
      setMyListings(data);
    } catch (error) {
      setMyListingsError(error instanceof Error ? error.message : 'Unable to fetch my listings');
      setMyListings([]);
    } finally {
      setIsLoadingMyListings(false);
    }
  }, []);

  const loadDrafts = useCallback(async () => {
    try {
      setIsLoadingDrafts(true);
      setDraftError('');
      const data = await fetchListingDrafts();
      setDrafts(data);
    } catch (error) {
      setDraftError(error instanceof Error ? error.message : 'Unable to fetch drafts');
    } finally {
      setIsLoadingDrafts(false);
    }
  }, []);

  const loadHoldings = useCallback(async () => {
    try {
      setIsLoadingHoldings(true);
      setHoldingsError('');
      const data = await fetchUserPortfolio();
      setPortfolioSummary(data.summary);
      setHoldings(data.holdings);
    } catch (error) {
      setHoldingsError(error instanceof Error ? error.message : 'Unable to fetch holdings');
      setPortfolioSummary(null);
      setHoldings([]);
    } finally {
      setIsLoadingHoldings(false);
    }
  }, []);

  useEffect(() => {
    loadDrafts();
    loadMyListings();
    loadHoldings();
  }, [loadDrafts, loadHoldings, loadMyListings]);

  const onRefresh = useCallback(async () => {
    try {
      setIsRefreshing(true);
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['investments_me'] }),
        queryClient.invalidateQueries({ queryKey: ['yield_claimable'] }),
        queryClient.invalidateQueries({ queryKey: ['user_profile'] }),
      ]);
      await Promise.all([loadDrafts(), loadMyListings(), loadHoldings()]);
    } finally {
      setIsRefreshing(false);
    }
  }, [loadDrafts, loadHoldings, loadMyListings, queryClient]);

  const handleMintProperty = async (draftId: string) => {
    if (mintingDraftId) return;

    try {
      setMintingDraftId(draftId);
      console.log('[Listings] mint request:', { draftId });
      const response = await mintPropertyFromDraft(draftId);
      console.log('[Listings] mint response:', response);
      await loadDrafts();
      await loadMyListings();
    } catch (error) {
      if (error instanceof ApiError) {
        console.log('[Listings] mint error status:', error.status);
        console.log('[Listings] mint error response:', error.data);
      } else {
        console.log('[Listings] mint error:', error);
      }
    } finally {
      setMintingDraftId(null);
    }
  };

  const handleSellAllHolding = async (holding: PortfolioHolding) => {
    if (sellingHoldingId || holding.quantity <= 0) return;

    const quantityNum = Math.floor(holding.quantity);
    if (quantityNum <= 0) {
      Alert.alert('Sell failed', 'No units available to sell for this asset.');
      return;
    }

    let stage = 'init';

    try {
      setSellActionMessage('');
      setSellingHoldingId(holding.holdingId);

      stage = 'prepare-sell';
      const prepared = await prepareSellAsset({
        assetId: holding.asset.id,
        quantity: quantityNum,
      });

      if (!prepared.unsignedTx) {
        throw new Error('No unsigned transaction returned from sell prepare');
      }

      stage = 'wallet-sign-and-send';
      const txSignature = await runMobileWalletTransaction(async (wallet: Web3MobileWallet) => {
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

        const unsignedTxBytes = Buffer.from(prepared.unsignedTx, 'base64');
        if (unsignedTxBytes.length === 0) {
          throw new Error('Invalid unsigned transaction: empty bytes');
        }

        const unsignedTx = VersionedTransaction.deserialize(unsignedTxBytes);

        const maybeSignAndSend = (
          wallet as unknown as {
            signAndSendTransactions?: (args: {
              transactions: VersionedTransaction[];
            }) => Promise<{ signatures: Array<string | Uint8Array> }>;
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

          throw new Error('Wallet submitted transaction but did not return a signature');
        }

        const signedTxs = await wallet.signTransactions({ transactions: [unsignedTx] });
        if (!signedTxs?.[0]) {
          throw new Error('Wallet returned no signed transaction');
        }

        const result = await sendAndConfirmWithFallback(
          signedTxs[0].serialize(),
          walletState.isDevnet,
        );

        return result.signature;
      });

      stage = 'confirm-sell';
      const confirmed = await confirmSellAsset({
        txSignature,
        assetId: holding.asset.id,
        quantity: quantityNum,
      });

      const payout =
        confirmed.totalPayout ?? confirmed.feeBreakdown?.netPayout ?? prepared.preview.netPayout;
      const successText = `Sold ${quantityNum} ${holding.asset.name} for ${formatCurrency(payout)} USDC`;

      setSellActionMessage(successText);
      Alert.alert('Sell successful', successText);

      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['investments_me'] }),
        queryClient.invalidateQueries({ queryKey: ['yield_claimable'] }),
        queryClient.invalidateQueries({ queryKey: ['user_profile'] }),
      ]);

      await Promise.all([loadHoldings(), loadMyListings()]);
    } catch (error) {
      const message = `[${stage}] ${getErrorMessage(error)}`;
      setSellActionMessage(message);
      Alert.alert('Sell failed', message);
    } finally {
      setSellingHoldingId(null);
    }
  };

  const totalRaised = activeListings.reduce((s, l) => s + l.amountRaised, 0);
  const totalTarget = activeListings.reduce((s, l) => s + l.totalTarget, 0);
  const liveCount = activeListings.filter((l) => l.status === 'live').length;

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <LinearGradient colors={['#0D0E1A', '#08090D']} style={StyleSheet.absoluteFill} />

      <View style={styles.header}>
        <View>
          <Text style={styles.title}>My Holdings</Text>
          <Text style={styles.subtitle}>{activeListings.length} active markets created</Text>
        </View>
        {/* <TouchableOpacity
          style={styles.addBtn}
          onPress={() => router.push('/list/step1' as any)}
          activeOpacity={0.85}
        >
          <LinearGradient colors={['#D4AF37', '#A88C28']} style={styles.addBtnGrad}>
            <Plus size={18} color={Colors.background} />
            <Text style={styles.addBtnText}>Create New</Text>
          </LinearGradient>
        </TouchableOpacity> */}
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 32 }}
        refreshControl={(
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={onRefresh}
            tintColor={Colors.gold}
            colors={[Colors.gold]}
          />
        )}
      >
        <View style={styles.statsRow}>
          {[
            { label: 'Total Raised', value: formatCurrency(totalRaised, true), color: Colors.green },
            { label: 'Liquidity Target', value: formatCurrency(totalTarget, true), color: Colors.cyan },
            { label: 'Live', value: `${liveCount}`, color: Colors.gold },
          ].map((s) => (
            <View key={s.label} style={styles.statCard}>
              <Text style={[styles.statVal, { color: s.color }]}>{s.value}</Text>
              <Text style={styles.statLabel}>{s.label}</Text>
            </View>
          ))}
        </View>

        <Text style={styles.sectionTitle}>My Holdings</Text>
        {isLoadingHoldings ? (
          <View style={styles.draftLoader}>
            <ActivityIndicator color={Colors.gold} />
            <Text style={styles.draftLoaderText}>Loading holdings...</Text>
          </View>
        ) : holdingsError ? (
          <View style={styles.draftErrorBox}>
            <Text style={styles.draftErrorText}>{holdingsError}</Text>
          </View>
        ) : holdings.length === 0 ? (
          <View style={styles.draftEmptyBox}>
            <Text style={styles.draftEmptyText}>No holdings yet</Text>
          </View>
        ) : (
          <>
            {portfolioSummary && (
              <View style={styles.holdingsSummaryRow}>
                <View style={styles.holdingsSummaryCard}>
                  <Text style={[styles.holdingsSummaryValue, { color: Colors.cyan }]}>
                    {formatCurrency(portfolioSummary.totalValue)}
                  </Text>
                  <Text style={styles.holdingsSummaryLabel}>Portfolio Value</Text>
                </View>
                <View style={styles.holdingsSummaryCard}>
                  <Text style={[styles.holdingsSummaryValue, { color: Colors.textSecondary }]}>
                    {formatCurrency(portfolioSummary.totalCost)}
                  </Text>
                  <Text style={styles.holdingsSummaryLabel}>Cost Basis</Text>
                </View>
                <View style={styles.holdingsSummaryCard}>
                  <Text
                    style={[
                      styles.holdingsSummaryValue,
                      {
                        color:
                          portfolioSummary.totalUnrealizedPnl >= 0 ? Colors.green : Colors.red,
                      },
                    ]}
                  >
                    {portfolioSummary.totalUnrealizedPnl >= 0 ? '+' : ''}
                    {formatCurrency(portfolioSummary.totalUnrealizedPnl)}
                  </Text>
                  <Text style={styles.holdingsSummaryLabel}>Unrealized P&L</Text>
                </View>
              </View>
            )}

            {sellActionMessage ? (
              <View style={styles.holdingsInfoBox}>
                <Text style={styles.holdingsInfoText}>{sellActionMessage}</Text>
              </View>
            ) : null}

            {holdings.map((holding) => {
              const isPnlPositive = holding.unrealizedPnl >= 0;
              const isSellingThis = sellingHoldingId === holding.holdingId;
              return (
                <View key={holding.holdingId} style={styles.holdingCard}>
                  <View style={styles.holdingHeader}>
                    <View style={styles.holdingMainInfo}>
                      <Text style={styles.holdingName} numberOfLines={2}>{holding.asset.name}</Text>
                      <Text style={styles.holdingMeta}>
                        {holding.asset.team?.name || holding.asset.collection?.name || holding.asset.assetType}
                      </Text>
                    </View>
                    <View style={styles.holdingUnitsPill}>
                      <Text style={styles.holdingUnitsText}>{holding.quantity} units</Text>
                    </View>
                  </View>

                  <View style={styles.holdingStatsRow}>
                    <View style={styles.holdingStatCell}>
                      <Text style={styles.holdingStatLabel}>Current Value</Text>
                      <Text style={styles.holdingStatValue}>{formatCurrency(holding.currentValue)}</Text>
                    </View>
                    <View style={styles.holdingStatCell}>
                      <Text style={styles.holdingStatLabel}>Current Price</Text>
                      <Text style={styles.holdingStatValue}>{formatCurrency(holding.currentPrice)}</Text>
                    </View>
                    <View style={styles.holdingStatCell}>
                      <Text style={styles.holdingStatLabel}>Avg Buy</Text>
                      <Text style={styles.holdingStatValue}>{formatCurrency(holding.avgBuyPrice)}</Text>
                    </View>
                  </View>

                  <View style={styles.holdingPnlRow}>
                    <Text style={styles.holdingPnlLabel}>Unrealized P&L</Text>
                    <Text style={[styles.holdingPnlValue, { color: isPnlPositive ? Colors.green : Colors.red }]}>
                      {isPnlPositive ? '+' : ''}
                      {formatCurrency(holding.unrealizedPnl)} ({holding.unrealizedPnlPct.toFixed(2)}%)
                    </Text>
                  </View>

                  <TouchableOpacity
                    style={[styles.sellAllBtn, (!isDevnet || isSellingThis) && styles.sellAllBtnDisabled]}
                    activeOpacity={0.85}
                    onPress={() => handleSellAllHolding(holding)}
                    disabled={isSellingThis || !isDevnet}
                  >
                    {isSellingThis ? (
                      <ActivityIndicator size="small" color={Colors.background} />
                    ) : (
                      <Text style={styles.sellAllBtnText}>Sell All Holdings</Text>
                    )}
                  </TouchableOpacity>
                </View>
              );
            })}
          </>
        )}
        {/*  */}



        <View style={styles.infoBox}>
          <Text style={styles.infoTitle}>How market creation works</Text>
          <View style={styles.infoSteps}>
            {[
              { step: '1', text: 'Submit market details and proof assets' },
              { step: '2', text: 'Our team reviews and verifies (1-3 days)' },
              { step: '3', text: 'Market goes live on the exchange' },
              { step: '4', text: 'Receive USDC as traders fill positions' },
            ].map((s) => (
              <View key={s.step} style={styles.infoStep}>
                <View style={styles.infoStepNum}>
                  <Text style={styles.infoStepNumText}>{s.step}</Text>
                </View>
                <Text style={styles.infoStepText}>{s.text}</Text>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 14,
    marginBottom: 20,
  },
  title: { fontSize: 24, fontWeight: '700' as const, color: Colors.text, marginBottom: 2 },
  subtitle: { fontSize: 13, color: Colors.textMuted },
  addBtn: { borderRadius: 12, overflow: 'hidden', shadowColor: Colors.gold, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.4, shadowRadius: 8 },
  addBtnGrad: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 14, paddingVertical: 10 },
  addBtnText: { fontSize: 14, fontWeight: '700' as const, color: Colors.background },
  statsRow: {
    flexDirection: 'row',
    gap: 10,
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  statCard: {
    flex: 1,
    backgroundColor: Colors.card,
    borderRadius: 14,
    padding: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  statVal: { fontSize: 17, fontWeight: '700' as const, marginBottom: 3 },
  statLabel: { fontSize: 10, color: Colors.textMuted },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '700' as const,
    color: Colors.text,
    paddingHorizontal: 20,
    marginBottom: 14,
  },
  listingCard: {
    marginHorizontal: 20,
    backgroundColor: Colors.card,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: 16,
    marginBottom: 14,
  },
  listingHeader: { flexDirection: 'row', gap: 12, marginBottom: 12 },
  listingImage: { width: 64, height: 64, borderRadius: 12 },
  listingImagePlaceholder: {
    width: 64,
    height: 64,
    borderRadius: 12,
    backgroundColor: Colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  listingInfo: { flex: 1 },
  listingName: { fontSize: 15, fontWeight: '700' as const, color: Colors.text, marginBottom: 4 },
  locationRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: 8 },
  locationText: { fontSize: 12, color: Colors.textMuted },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    alignSelf: 'flex-start',
  },
  statusDot: { width: 5, height: 5, borderRadius: 3 },
  statusText: { fontSize: 11, fontWeight: '600' as const },
  raisedRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  raisedText: { fontSize: 12, color: Colors.textSecondary },
  raisedPct: { fontSize: 12, color: Colors.green, fontWeight: '600' as const },
  progressBar: { height: 4, backgroundColor: Colors.border, borderRadius: 2, overflow: 'hidden', marginBottom: 10 },
  progressFill: { height: '100%', borderRadius: 2 },
  investorsRow: { flexDirection: 'row', alignItems: 'center', gap: 5, marginBottom: 12 },
  investorsText: { fontSize: 12, color: Colors.textMuted, flex: 1 },
  yieldText: { fontSize: 12, color: Colors.gold, fontWeight: '600' as const },
  listingActions: {
    flexDirection: 'row',
    gap: 8,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    paddingTop: 12,
  },
  editBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: Colors.cyanGlow,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.cyan,
  },
  editBtnText: { fontSize: 12, fontWeight: '600' as const, color: Colors.cyan },
  viewBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  viewBtnText: { fontSize: 12, color: Colors.textSecondary },
  emptyState: { alignItems: 'center', paddingTop: 40, paddingHorizontal: 40 },
  emptyIcon: { fontSize: 48, marginBottom: 16 },
  emptyTitle: { fontSize: 20, fontWeight: '700' as const, color: Colors.text, marginBottom: 8, textAlign: 'center' },
  emptyText: { fontSize: 14, color: Colors.textMuted, textAlign: 'center', lineHeight: 21, marginBottom: 24 },
  emptyBtn: { borderRadius: 12, overflow: 'hidden' },
  emptyBtnGrad: { paddingVertical: 14, paddingHorizontal: 28, alignItems: 'center' },
  emptyBtnText: { fontSize: 15, fontWeight: '700' as const, color: Colors.background },
  infoBox: {
    margin: 20,
    backgroundColor: Colors.card,
    borderRadius: 16,
    padding: 18,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  infoTitle: { fontSize: 15, fontWeight: '700' as const, color: Colors.text, marginBottom: 14 },
  infoSteps: { gap: 12 },
  infoStep: { flexDirection: 'row', alignItems: 'flex-start', gap: 12 },
  infoStepNum: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: Colors.goldGlow,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.goldDark,
    flexShrink: 0,
  },
  infoStepNumText: { fontSize: 12, fontWeight: '700' as const, color: Colors.gold },
  infoStepText: { fontSize: 13, color: Colors.textSecondary, lineHeight: 20, flex: 1 },
  draftLoader: {
    marginHorizontal: 20,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.card,
    paddingVertical: 18,
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
  },
  draftLoaderText: { color: Colors.textMuted, fontSize: 12 },
  draftErrorBox: {
    marginHorizontal: 20,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.red,
    backgroundColor: Colors.redGlow,
    padding: 12,
    marginBottom: 16,
  },
  draftErrorText: { color: Colors.red, fontSize: 12 },
  draftEmptyBox: {
    marginHorizontal: 20,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.card,
    padding: 12,
    marginBottom: 16,
  },
  draftEmptyText: { color: Colors.textMuted, fontSize: 12 },
  draftCard: {
    marginHorizontal: 20,
    marginBottom: 12,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.card,
    padding: 14,
  },
  draftHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  draftName: { color: Colors.text, fontSize: 14, fontWeight: '700' as const, flex: 1, marginRight: 8 },
  draftStatusBadge: { backgroundColor: Colors.goldGlow, borderRadius: 6, paddingHorizontal: 8, paddingVertical: 3, borderWidth: 1, borderColor: Colors.goldDark },
  draftStatusText: { color: Colors.gold, fontSize: 11, fontWeight: '600' as const },
  draftMeta: { color: Colors.textMuted, fontSize: 12, marginTop: 6 },
  draftProgressRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 8, marginBottom: 10 },
  draftProgressText: { color: Colors.textSecondary, fontSize: 12 },
  holdingsSummaryRow: {
    flexDirection: 'row',
    gap: 10,
    paddingHorizontal: 20,
    marginBottom: 12,
  },
  holdingsSummaryCard: {
    flex: 1,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.card,
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 8,
    alignItems: 'center',
  },
  holdingsSummaryValue: {
    fontSize: 14,
    fontWeight: '700' as const,
    marginBottom: 2,
  },
  holdingsSummaryLabel: {
    fontSize: 10,
    color: Colors.textMuted,
  },
  holdingsInfoBox: {
    marginHorizontal: 20,
    marginBottom: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: Colors.cyan,
    backgroundColor: Colors.cyanGlow,
    padding: 10,
  },
  holdingsInfoText: {
    color: Colors.cyan,
    fontSize: 12,
  },
  holdingCard: {
    marginHorizontal: 20,
    marginBottom: 12,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.card,
    padding: 14,
  },
  holdingHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 10,
    gap: 10,
  },
  holdingMainInfo: {
    flex: 1,
  },
  holdingName: {
    color: Colors.text,
    fontSize: 14,
    fontWeight: '700' as const,
    marginBottom: 4,
  },
  holdingMeta: {
    color: Colors.textMuted,
    fontSize: 12,
  },
  holdingUnitsPill: {
    backgroundColor: Colors.goldGlow,
    borderWidth: 1,
    borderColor: Colors.goldDark,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  holdingUnitsText: {
    color: Colors.gold,
    fontSize: 11,
    fontWeight: '700' as const,
  },
  holdingStatsRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 10,
  },
  holdingStatCell: {
    flex: 1,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 10,
    backgroundColor: Colors.surface,
    padding: 8,
  },
  holdingStatLabel: {
    color: Colors.textMuted,
    fontSize: 10,
    marginBottom: 4,
  },
  holdingStatValue: {
    color: Colors.text,
    fontSize: 12,
    fontWeight: '600' as const,
  },
  holdingPnlRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  holdingPnlLabel: {
    color: Colors.textSecondary,
    fontSize: 12,
  },
  holdingPnlValue: {
    fontSize: 12,
    fontWeight: '700' as const,
  },
  sellAllBtn: {
    borderRadius: 8,
    backgroundColor: Colors.red,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
  },
  sellAllBtnDisabled: {
    opacity: 0.6,
  },
  sellAllBtnText: {
    color: Colors.background,
    fontSize: 12,
    fontWeight: '700' as const,
  },
  mintBtn: {
    marginTop: 2,
    borderRadius: 8,
    backgroundColor: Colors.gold,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
  },
  mintBtnText: {
    color: Colors.background,
    fontSize: 12,
    fontWeight: '700' as const,
  },
});
