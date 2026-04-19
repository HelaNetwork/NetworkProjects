import Colors from '@/constants/Colors';
import { useWallet } from '@/context/WalletContext';
import { formatCurrency } from '@/mocks/data';
import { ApiError } from '@/services/api';
import { fetchPredictionMarketById, type PredictionMarket } from '@/services/markets';
import { runMobileWalletTransaction } from '@/services/mobileWallet';
import {
  confirmBuyPrediction,
  confirmSellPrediction,
  fetchUserTransactions,
  prepareBuyPrediction,
  prepareSellPrediction,
  type PredictionBuyPreview,
  type PredictionSellPreview,
  type PredictionSide,
} from '@/services/transactions';
import { useWalletStore } from '@/stores/wallet-store';
import { Web3MobileWallet } from '@solana-mobile/mobile-wallet-adapter-protocol-web3js';
import { clusterApiUrl, Connection, VersionedTransaction } from '@solana/web3.js';
import { useQueryClient } from '@tanstack/react-query';
import bs58 from 'bs58';
import { Buffer } from 'buffer';
import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ArrowLeft, Minus, Plus, TrendingDown, TrendingUp } from 'lucide-react-native';
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

type TradeMode = 'buy' | 'sell';

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function verifyPredictionRecordedBySignature(params: {
  txSignature: string;
  marketId: string;
  mode: TradeMode;
}): Promise<boolean> {
  try {
    const expectedType = params.mode === 'buy' ? 'BUY_PREDICTION' : 'SELL_PREDICTION';
    const { transactions } = await fetchUserTransactions(80, 0);
    return transactions.some(
      (tx) => tx.txSignature === params.txSignature
        && tx.marketId === params.marketId
        && tx.txType === expectedType,
    );
  } catch {
    return false;
  }
}

async function verifyRecentPredictionRecorded(params: {
  marketId: string;
  quantity: number;
  mode: TradeMode;
  submittedAtMs: number;
}): Promise<boolean> {
  try {
    const expectedType = params.mode === 'buy' ? 'BUY_PREDICTION' : 'SELL_PREDICTION';
    const { transactions } = await fetchUserTransactions(120, 0);
    return transactions.some((tx) => {
      if (tx.txType !== expectedType) return false;
      if (tx.marketId !== params.marketId) return false;
      if (Number(tx.quantity) !== params.quantity) return false;

      const txMs = new Date(tx.createdAt).getTime();
      return Number.isFinite(txMs) && txMs >= params.submittedAtMs - 2 * 60 * 1000;
    });
  } catch {
    return false;
  }
}

async function reconcilePredictionAfterConfirmNetworkFailure(params: {
  txSignature: string;
  marketId: string;
  side: PredictionSide;
  quantity: number;
  mode: TradeMode;
  submittedAtMs: number;
}): Promise<boolean> {
  const maxAttempts = 6;

  for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
    await sleep(1200 * attempt);

    try {
      if (params.mode === 'buy') {
        await confirmBuyPrediction({
          txSignature: params.txSignature,
          marketId: params.marketId,
          side: params.side,
          quantity: params.quantity,
        });
      } else {
        await confirmSellPrediction({
          txSignature: params.txSignature,
          marketId: params.marketId,
          side: params.side,
          quantity: params.quantity,
        });
      }

      return true;
    } catch (error) {
      if (!(error instanceof ApiError && error.status === 0)) {
        throw error;
      }
    }

    const bySignature = await verifyPredictionRecordedBySignature({
      txSignature: params.txSignature,
      marketId: params.marketId,
      mode: params.mode,
    });
    if (bySignature) {
      return true;
    }

    const byRecentMatch = await verifyRecentPredictionRecorded({
      marketId: params.marketId,
      quantity: params.quantity,
      mode: params.mode,
      submittedAtMs: params.submittedAtMs,
    });
    if (byRecentMatch) {
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
      console.error('[Prediction] RPC endpoint failed', { endpoint, error: message });
    }
  }

  throw new Error(`All RPC endpoints failed. ${failures.join(' | ')}`);
}

export default function MarketTradeScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const queryClient = useQueryClient();
  const insets = useSafeAreaInsets();
  const { publicKeyBase58, isConnected, positions } = useWallet();
  const isDevnet = useWalletStore((s) => s.isDevnet);

  const [market, setMarket] = useState<PredictionMarket | null>(null);
  const [mode, setMode] = useState<TradeMode>('buy');
  const [side, setSide] = useState<PredictionSide>('TEAM_A');
  const [quantity, setQuantity] = useState('1');

  const [isLoadingMarket, setIsLoadingMarket] = useState(true);
  const [marketError, setMarketError] = useState('');

  const [buyPreview, setBuyPreview] = useState<PredictionBuyPreview | null>(null);
  const [sellPreview, setSellPreview] = useState<PredictionSellPreview | null>(null);
  const [unsignedTxStr, setUnsignedTxStr] = useState<string | null>(null);
  const [isLoadingPreview, setIsLoadingPreview] = useState(false);
  const [previewError, setPreviewError] = useState('');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);

  const quantityNum = Math.max(0, parseInt(quantity, 10) || 0);

  const ownedAmountForSelectedSide = useMemo(() => {
    if (!id) return 0;
    return positions
      .filter((position) => position.market.id === id && position.side === side)
      .reduce((sum, position) => sum + position.amount, 0);
  }, [id, positions, side]);

  useEffect(() => {
    let mounted = true;

    const loadMarket = async () => {
      if (!id) {
        setMarketError('Market id is missing');
        setIsLoadingMarket(false);
        return;
      }

      try {
        setIsLoadingMarket(true);
        setMarketError('');
        const data = await fetchPredictionMarketById(id);
        if (!mounted) return;

        if (!data) {
          setMarketError('Prediction market not found');
          setMarket(null);
          return;
        }

        setMarket(data);
      } catch (error) {
        if (!mounted) return;
        setMarketError(error instanceof Error ? error.message : 'Unable to fetch market');
      } finally {
        if (mounted) {
          setIsLoadingMarket(false);
        }
      }
    };

    loadMarket();

    return () => {
      mounted = false;
    };
  }, [id]);

  useEffect(() => {
    let mounted = true;

    const loadPreview = async () => {
      if (!id || quantityNum <= 0 || !market) {
        setPreviewError('');
        setBuyPreview(null);
        setSellPreview(null);
        setUnsignedTxStr(null);
        return;
      }

      if (mode === 'sell' && quantityNum > ownedAmountForSelectedSide) {
        setPreviewError(`You only hold ${ownedAmountForSelectedSide} position(s) on this side.`);
        setBuyPreview(null);
        setSellPreview(null);
        setUnsignedTxStr(null);
        return;
      }

      try {
        setIsLoadingPreview(true);
        setPreviewError('');

        if (mode === 'buy') {
          const response = await prepareBuyPrediction({
            marketId: id,
            side,
            quantity: quantityNum,
          });
          if (!mounted) return;
          setBuyPreview(response.preview);
          setSellPreview(null);
          setUnsignedTxStr(response.unsignedTx);
        } else {
          const response = await prepareSellPrediction({
            marketId: id,
            side,
            quantity: quantityNum,
          });
          if (!mounted) return;
          setSellPreview(response.preview);
          setBuyPreview(null);
          setUnsignedTxStr(response.unsignedTx);
        }
      } catch (error) {
        if (!mounted) return;
        setPreviewError(error instanceof Error ? error.message : 'Unable to load preview');
        setBuyPreview(null);
        setSellPreview(null);
        setUnsignedTxStr(null);
      } finally {
        if (mounted) {
          setIsLoadingPreview(false);
        }
      }
    };

    loadPreview();

    return () => {
      mounted = false;
    };
  }, [id, market, mode, side, quantityNum, ownedAmountForSelectedSide]);

  const canSubmit = useMemo(() => {
    if (!id || !market || !publicKeyBase58 || !isConnected) return false;
    if (!isDevnet) return false;
    if (quantityNum <= 0) return false;
    if (isLoadingPreview || !!previewError || !unsignedTxStr) return false;
    if (mode === 'buy' && !buyPreview) return false;
    if (mode === 'sell' && !sellPreview) return false;
    if (mode === 'sell' && quantityNum > ownedAmountForSelectedSide) return false;
    return true;
  }, [
    id,
    market,
    publicKeyBase58,
    isConnected,
    isDevnet,
    quantityNum,
    isLoadingPreview,
    previewError,
    unsignedTxStr,
    mode,
    buyPreview,
    sellPreview,
    ownedAmountForSelectedSide,
  ]);

  const adjust = (delta: number) => {
    const maxForMode = mode === 'sell' ? Math.max(ownedAmountForSelectedSide, 1) : 999999;
    const next = Math.min(maxForMode, Math.max(1, (parseInt(quantity, 10) || 0) + delta));
    setQuantity(String(next));
  };

  const handleConfirm = async () => {
    if (!canSubmit || !id || !unsignedTxStr) return;

    let stage = 'init';
    let submittedSignature = '';
    const submittedAtMs = Date.now();

    try {
      setIsSubmitting(true);
      setSubmitError('');

      stage = 'wallet-sign-and-send';
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

        let unsignedTx: VersionedTransaction;
        try {
          const unsignedTxBytes = Buffer.from(unsignedTxStr, 'base64');
          if (unsignedTxBytes.length === 0) {
            throw new Error('Invalid unsigned transaction: empty bytes');
          }
          unsignedTx = VersionedTransaction.deserialize(unsignedTxBytes);
        } catch (decodeError) {
          throw new Error(
            `Transaction decode failed: ${decodeError instanceof Error ? decodeError.message : 'Unknown error'}`,
          );
        }

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

          throw new Error('Wallet submitted transaction but did not return signature.');
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
      submittedSignature = signature;

      stage = mode === 'buy' ? 'confirm-buy-prediction' : 'confirm-sell-prediction';
      try {
        if (mode === 'buy') {
          await confirmBuyPrediction({
            txSignature: signature,
            marketId: id,
            side,
            quantity: quantityNum,
          });
        } else {
          await confirmSellPrediction({
            txSignature: signature,
            marketId: id,
            side,
            quantity: quantityNum,
          });
        }
      } catch (error) {
        const shouldReconcile = error instanceof ApiError && error.status === 0;
        if (!shouldReconcile) {
          throw error;
        }

        const reconciled = await reconcilePredictionAfterConfirmNetworkFailure({
          txSignature: signature,
          marketId: id,
          side,
          quantity: quantityNum,
          mode,
          submittedAtMs,
        });

        if (!reconciled) {
          throw error;
        }
      }

      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['investments_me'] }),
        queryClient.invalidateQueries({ queryKey: ['yield_claimable'] }),
        queryClient.invalidateQueries({ queryKey: ['user_profile'] }),
      ]);

      setIsSuccess(true);
      setTimeout(() => router.replace('/(tabs)/investments' as any), 1600);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Prediction trade failed';
      const confirmNetworkBlocked =
        (stage === 'confirm-buy-prediction' || stage === 'confirm-sell-prediction')
        && error instanceof ApiError
        && error.status === 0;

      const stagedMessage = confirmNetworkBlocked
        ? `[${stage}] ${message}\n\nYour transaction may already be on-chain. We retried and reconciled automatically, but backend confirm is still unreachable from this network. Please wait a few seconds and refresh Investments before retrying another trade. (${submittedSignature || 'no-signature'})`
        : `[${stage}] ${message}`;
      setSubmitError(stagedMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoadingMarket) {
    return (
      <View style={[styles.container, styles.center, { paddingTop: insets.top }]}>
        <ActivityIndicator color={Colors.gold} />
        <Text style={styles.loadingText}>Loading market...</Text>
      </View>
    );
  }

  if (marketError || !market) {
    return (
      <View style={[styles.container, styles.center, { paddingTop: insets.top }]}>
        <Text style={styles.errorText}>{marketError || 'Prediction market not found'}</Text>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.backLink}>Go back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (isSuccess) {
    return (
      <View style={[styles.successScreen, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
        <LinearGradient colors={['#0D0E1A', '#08090D']} style={StyleSheet.absoluteFill} />
        <View style={styles.successIconWrap}>
          <Text style={styles.successIcon}>✓</Text>
        </View>
        <Text style={styles.successTitle}>
          {mode === 'buy' ? 'Prediction Buy Confirmed' : 'Prediction Sell Confirmed'}
        </Text>
        <Text style={styles.successSubtitle}>Redirecting to your positions...</Text>
      </View>
    );
  }

  const teamAName = market.match.teamA.name;
  const teamBName = market.match.teamB.name;
  const teamAPrice = market.teamAPrice;
  const teamBPrice = market.teamBPrice;

  const previewFee = mode === 'buy'
    ? (buyPreview?.feeBreakdown.feeAmount ?? 0)
    : (sellPreview?.feeBreakdown.feeAmount ?? 0);

  const primaryAmount = mode === 'buy'
    ? (buyPreview?.totalCost ?? 0)
    : (sellPreview?.netPayout ?? 0);

  const primaryLabel = mode === 'buy' ? 'Total Cost' : 'Net Payout';

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <LinearGradient colors={['#0D0E1A', '#08090D']} style={StyleSheet.absoluteFill} />

      <View style={styles.topBar}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()} activeOpacity={0.85}>
          <ArrowLeft size={18} color={Colors.text} />
        </TouchableOpacity>
        <Text style={styles.topTitle}>Betting Exchange</Text>
        <View style={styles.topSpacer} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        <View style={styles.marketCard}>
          <Text style={styles.matchTitle}>{teamAName} vs {teamBName}</Text>
          <Text style={styles.tournamentText}>{market.match.tournament}</Text>

          <View style={styles.priceRow}>
            <View style={styles.pricePill}>
              <Text style={styles.priceLabel}>{teamAName}</Text>
              <Text style={styles.priceValue}>{formatCurrency(teamAPrice)}</Text>
            </View>
            <View style={styles.pricePill}>
              <Text style={styles.priceLabel}>{teamBName}</Text>
              <Text style={styles.priceValue}>{formatCurrency(teamBPrice)}</Text>
            </View>
          </View>

          <Text style={styles.marketMeta}>Liquidity Pool: {formatCurrency(market.liquidityPool, true)}</Text>
          <Text style={styles.marketMeta}>Status: {market.status}</Text>
        </View>

        <View style={styles.toggleRow}>
          <TouchableOpacity
            style={[styles.toggleBtn, mode === 'buy' && styles.toggleBtnActive]}
            onPress={() => setMode('buy')}
            activeOpacity={0.85}
          >
            <TrendingUp size={14} color={mode === 'buy' ? Colors.background : Colors.textMuted} />
            <Text style={[styles.toggleText, mode === 'buy' && styles.toggleTextActive]}>Buy</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.toggleBtn, mode === 'sell' && styles.toggleBtnDanger]}
            onPress={() => setMode('sell')}
            activeOpacity={0.85}
          >
            <TrendingDown size={14} color={mode === 'sell' ? Colors.background : Colors.textMuted} />
            <Text style={[styles.toggleText, mode === 'sell' && styles.toggleTextActive]}>Sell</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.sideRow}>
          <TouchableOpacity
            style={[styles.sideBtn, side === 'TEAM_A' && styles.sideBtnActive]}
            onPress={() => setSide('TEAM_A')}
            activeOpacity={0.85}
          >
            <Text style={[styles.sideBtnText, side === 'TEAM_A' && styles.sideBtnTextActive]}>
              {teamAName}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.sideBtn, side === 'TEAM_B' && styles.sideBtnActive]}
            onPress={() => setSide('TEAM_B')}
            activeOpacity={0.85}
          >
            <Text style={[styles.sideBtnText, side === 'TEAM_B' && styles.sideBtnTextActive]}>
              {teamBName}
            </Text>
          </TouchableOpacity>
        </View>

        {mode === 'sell' && (
          <Text style={styles.ownedText}>
            You own {ownedAmountForSelectedSide} {side === 'TEAM_A' ? teamAName : teamBName} position(s)
          </Text>
        )}

        <View style={styles.qtyRow}>
          <TouchableOpacity style={styles.qtyBtn} onPress={() => adjust(-1)} activeOpacity={0.8}>
            <Minus size={14} color={Colors.gold} />
          </TouchableOpacity>
          <TextInput
            style={styles.qtyInput}
            keyboardType='number-pad'
            value={quantity}
            onChangeText={(v) => setQuantity(v.replace(/[^0-9]/g, '') || '0')}
          />
          <TouchableOpacity style={styles.qtyBtn} onPress={() => adjust(1)} activeOpacity={0.8}>
            <Plus size={14} color={Colors.gold} />
          </TouchableOpacity>
        </View>

        <View style={styles.previewCard}>
          <Text style={styles.previewTitle}>Trade Preview</Text>
          {isLoadingPreview ? (
            <View style={styles.previewLoading}>
              <ActivityIndicator color={Colors.gold} />
              <Text style={styles.loadingText}>Calculating preview...</Text>
            </View>
          ) : (
            <>
              <View style={styles.previewRow}>
                <Text style={styles.previewLabel}>{primaryLabel}</Text>
                <Text style={styles.previewValue}>{formatCurrency(primaryAmount)}</Text>
              </View>
              <View style={styles.previewRow}>
                <Text style={styles.previewLabel}>Platform Fee</Text>
                <Text style={styles.previewValue}>{formatCurrency(previewFee)}</Text>
              </View>
              <View style={styles.previewRow}>
                <Text style={styles.previewLabel}>Quantity</Text>
                <Text style={styles.previewValue}>{quantityNum}</Text>
              </View>
            </>
          )}
        </View>

        {!!previewError && <Text style={styles.errorTextInline}>{previewError}</Text>}
        {!!submitError && <Text style={styles.errorTextInline}>{submitError}</Text>}

        <TouchableOpacity
          style={[styles.submitBtn, !canSubmit && styles.submitBtnDisabled]}
          onPress={handleConfirm}
          disabled={!canSubmit || isSubmitting}
          activeOpacity={0.88}
        >
          <LinearGradient
            colors={mode === 'buy' ? ['#D4AF37', '#A88C28'] : ['#FF6B6B', '#D64545']}
            style={styles.submitBtnGrad}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
          >
            {isSubmitting ? (
              <ActivityIndicator color={Colors.background} />
            ) : (
              <Text style={styles.submitText}>
                {mode === 'buy' ? 'Confirm Prediction Buy' : 'Confirm Prediction Sell'}
              </Text>
            )}
          </LinearGradient>
        </TouchableOpacity>

        {!isConnected && (
          <Text style={styles.hintText}>Connect your wallet first to place prediction trades.</Text>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  center: { justifyContent: 'center', alignItems: 'center', paddingHorizontal: 22 },

  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 10,
    marginBottom: 8,
  },
  backButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.card,
  },
  topTitle: { color: Colors.text, fontSize: 18, fontWeight: '700' as const },
  topSpacer: { width: 36, height: 36 },

  content: { paddingHorizontal: 20, paddingBottom: 30 },

  marketCard: {
    backgroundColor: Colors.card,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 16,
    padding: 14,
    marginBottom: 14,
  },
  matchTitle: { color: Colors.text, fontSize: 18, fontWeight: '700' as const, marginBottom: 4 },
  tournamentText: { color: Colors.textMuted, fontSize: 12, marginBottom: 10 },
  priceRow: { flexDirection: 'row', gap: 10, marginBottom: 10 },
  pricePill: {
    flex: 1,
    backgroundColor: Colors.surface,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: 10,
  },
  priceLabel: { color: Colors.textMuted, fontSize: 11, marginBottom: 4 },
  priceValue: { color: Colors.gold, fontSize: 14, fontWeight: '700' as const },
  marketMeta: { color: Colors.textSecondary, fontSize: 12, marginBottom: 2 },

  toggleRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 10,
  },
  toggleBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    height: 42,
    borderRadius: 12,
    backgroundColor: Colors.card,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  toggleBtnActive: { backgroundColor: Colors.gold, borderColor: Colors.gold },
  toggleBtnDanger: { backgroundColor: '#E85D5D', borderColor: '#E85D5D' },
  toggleText: { color: Colors.textMuted, fontWeight: '600' as const, fontSize: 13 },
  toggleTextActive: { color: Colors.background },

  sideRow: { flexDirection: 'row', gap: 10, marginBottom: 8 },
  sideBtn: {
    flex: 1,
    height: 42,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.card,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  sideBtnActive: { borderColor: Colors.cyan, backgroundColor: Colors.surface },
  sideBtnText: { color: Colors.textMuted, fontSize: 13, fontWeight: '600' as const },
  sideBtnTextActive: { color: Colors.cyan },

  ownedText: { color: Colors.textMuted, fontSize: 12, marginBottom: 10 },

  qtyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 12,
  },
  qtyBtn: {
    width: 42,
    height: 42,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.card,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  qtyInput: {
    flex: 1,
    height: 44,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.card,
    color: Colors.text,
    textAlign: 'center',
    fontSize: 16,
    fontWeight: '700' as const,
  },

  previewCard: {
    backgroundColor: Colors.card,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 14,
    padding: 12,
    marginBottom: 12,
  },
  previewTitle: { color: Colors.text, fontWeight: '700' as const, fontSize: 14, marginBottom: 10 },
  previewLoading: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingVertical: 8 },
  previewRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  previewLabel: { color: Colors.textMuted, fontSize: 12 },
  previewValue: { color: Colors.text, fontWeight: '700' as const, fontSize: 13 },

  submitBtn: { borderRadius: 12, overflow: 'hidden', marginBottom: 10 },
  submitBtnDisabled: { opacity: 0.55 },
  submitBtnGrad: { height: 48, alignItems: 'center', justifyContent: 'center' },
  submitText: { color: Colors.background, fontSize: 14, fontWeight: '700' as const },

  hintText: { color: Colors.textMuted, fontSize: 12, textAlign: 'center' },
  loadingText: { color: Colors.textMuted, fontSize: 12, marginTop: 8 },
  errorText: { color: Colors.red, fontSize: 13, textAlign: 'center' },
  errorTextInline: { color: Colors.red, fontSize: 12, marginBottom: 10 },
  backLink: { color: Colors.gold, marginTop: 10, fontWeight: '700' as const },

  successScreen: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 20 },
  successIconWrap: {
    width: 74,
    height: 74,
    borderRadius: 37,
    backgroundColor: Colors.green,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },
  successIcon: { color: Colors.background, fontSize: 32, fontWeight: '800' as const },
  successTitle: { color: Colors.text, fontSize: 20, fontWeight: '800' as const, marginBottom: 6 },
  successSubtitle: { color: Colors.textMuted, fontSize: 13 },
});
