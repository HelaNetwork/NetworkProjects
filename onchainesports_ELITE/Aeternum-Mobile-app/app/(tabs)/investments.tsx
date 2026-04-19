import Colors from '@/constants/Colors';
import { useWallet } from '@/context/WalletContext';
import { formatCurrency } from '@/mocks/data';
import { useQueryClient } from '@tanstack/react-query';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { ChevronRight, PlusCircle, TrendingDown, TrendingUp, Zap } from 'lucide-react-native';
import React, { useCallback, useState } from 'react';
import {
  Image,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function InvestmentsScreen() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const insets = useSafeAreaInsets();
  const [refreshing, setRefreshing] = useState(false);
  const {
    investments,
    holdings,
    positions,
    transactions,
    totalPortfolioValue,
    totalInvested,
    totalYieldEarned,
    totalClaimable,
    overallROI,
  } = useWallet();

  const roiPositive = overallROI >= 0;

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['investments_me'] }),
        queryClient.invalidateQueries({ queryKey: ['yield_claimable'] }),
        queryClient.invalidateQueries({ queryKey: ['user_profile'] }),
      ]);
    } finally {
      setRefreshing(false);
    }
  }, [queryClient]);

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <LinearGradient colors={['#0D0E1A', '#08090D']} style={StyleSheet.absoluteFill} />

      <View style={styles.header}>
        <Text style={styles.title}>My Positions</Text>
        <TouchableOpacity
          style={styles.exploreBtn}
          onPress={() => router.push('/(tabs)/explore' as any)}
          activeOpacity={0.8}
        >
          <PlusCircle size={16} color={Colors.gold} />
          <Text style={styles.exploreBtnText}>Trade</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 32 }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={Colors.gold}
            colors={[Colors.gold]}
            progressBackgroundColor={Colors.card}
          />
        }
      >
        <View style={styles.summaryCard}>
          <LinearGradient
            colors={['#1C1A08', '#241F0A']}
            style={StyleSheet.absoluteFill}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          />
          <View style={styles.summaryGlow} />
          <Text style={styles.summaryLabel}>TOTAL PORTFOLIO VALUE</Text>
          <Text style={styles.summaryValue}>{formatCurrency(totalPortfolioValue)}</Text>
          <View style={styles.roiRow}>
            {roiPositive
              ? <TrendingUp size={14} color={Colors.green} />
              : <TrendingDown size={14} color={Colors.red} />
            }
            <Text style={[styles.roiText, { color: roiPositive ? Colors.green : Colors.red }]}>
              {overallROI.toFixed(2)}% overall ROI
            </Text>
          </View>
          <View style={styles.summaryGrid}>
            {[
              { label: 'Capital Deployed', value: formatCurrency(totalInvested), color: Colors.cyan },
              { label: 'Rewards Earned', value: formatCurrency(totalYieldEarned), color: Colors.green },
              { label: 'Claimable', value: formatCurrency(totalClaimable), color: Colors.gold },
              { label: 'Positions', value: `${investments.length}`, color: Colors.purple },
            ].map((s) => (
              <View key={s.label} style={styles.summaryCell}>
                <Text style={[styles.summaryCellVal, { color: s.color }]}>{s.value}</Text>
                <Text style={styles.summaryCellLabel}>{s.label}</Text>
              </View>
            ))}
          </View>
        </View>

        {totalClaimable > 0 && (
          <TouchableOpacity
            style={styles.claimBanner}
            onPress={() => router.push('/claim' as any)}
            activeOpacity={0.85}
          >
            <LinearGradient
              colors={[Colors.greenGlow, 'transparent']}
              style={StyleSheet.absoluteFill}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            />
            <View style={styles.claimLeft}>
              <Zap size={18} color={Colors.green} />
              <View>
                <Text style={styles.claimTitle}>Claimable Rewards Ready</Text>
                <Text style={styles.claimAmount}>{formatCurrency(totalClaimable)}</Text>
              </View>
            </View>
            <ChevronRight size={18} color={Colors.green} />
          </TouchableOpacity>
        )}

        <Text style={styles.sectionTitle}>Asset Holdings ({holdings.length})</Text>

        {holdings.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>📈</Text>
            <Text style={styles.emptyTitle}>No holdings yet</Text>
            <Text style={styles.emptyText}>Start trading tokenized assets to build your portfolio</Text>
            <TouchableOpacity
              style={styles.emptyBtn}
              onPress={() => router.push('/(tabs)/explore' as any)}
              activeOpacity={0.85}
            >
              <LinearGradient colors={['#D4AF37', '#A88C28']} style={styles.emptyBtnGrad}>
                <Text style={styles.emptyBtnText}>Explore Markets</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        ) : (
          holdings.map((holding) => {
            const pnlPositive = holding.unrealizedPnl >= 0;
            return (
              <View key={holding.holdingId} style={styles.invCard}>
                <View style={styles.invHeader}>
                  <Image
                    source={{ uri: holding.asset.metadataUri || 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=800&q=80' }}
                    style={styles.invImage}
                  />
                  <View style={styles.invInfo}>
                    <Text style={styles.invName} numberOfLines={2}>{holding.asset.name}</Text>
                    <Text style={styles.invLocation}>
                      {holding.asset.collection?.name || holding.asset.team?.name || holding.asset.assetType}
                    </Text>
                    <Text style={styles.invDate}>
                      {holding.quantity} units · Acquired {new Date(holding.acquiredAt).toLocaleDateString()}
                    </Text>
                  </View>
                </View>

                <View style={styles.invStats}>
                  <View style={styles.invStat}>
                    <Text style={styles.invStatVal}>{formatCurrency(holding.currentValue)}</Text>
                    <Text style={styles.invStatLabel}>Current Value</Text>
                  </View>
                  <View style={styles.invStat}>
                    <Text style={[styles.invStatVal, { color: pnlPositive ? Colors.green : Colors.red }]}>
                      {pnlPositive ? '+' : ''}{formatCurrency(holding.unrealizedPnl)}
                    </Text>
                    <Text style={styles.invStatLabel}>P&L</Text>
                  </View>
                  <View style={styles.invStat}>
                    <Text style={[styles.invStatVal, { color: Colors.gold }]}>
                      {holding.unrealizedPnlPct.toFixed(1)}%
                    </Text>
                    <Text style={styles.invStatLabel}>ROI</Text>
                  </View>
                </View>

                <View style={styles.yieldRow}>
                  <View>
                    <Text style={styles.yieldEarned}>Avg Buy: {formatCurrency(holding.avgBuyPrice)}</Text>
                    <Text style={styles.yieldClaimable}>Current: {formatCurrency(holding.currentPrice)}</Text>
                  </View>
                  <View style={styles.invActions}>
                    <TouchableOpacity
                      style={styles.sellBtn}
                      onPress={() => router.push(`/sell/${holding.asset.id}` as any)}
                      activeOpacity={0.85}
                    >
                      <Text style={styles.sellBtnText}>Sell</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            );
          })
        )}

        <Text style={styles.sectionTitle}>Open Prediction Positions ({positions.length})</Text>
        {positions.length === 0 ? (
          <View style={styles.emptyInline}>
            <Text style={styles.emptyInlineText}>No open prediction positions</Text>
          </View>
        ) : (
          positions.map((position) => {
            const pnlPositive = position.unrealizedPnl >= 0;
            return (
              <View key={position.positionId} style={styles.invCard}>
                <View style={styles.positionHeader}>
                  <Text style={styles.invName} numberOfLines={2}>
                    {position.market.match.teamA.name} vs {position.market.match.teamB.name}
                  </Text>
                  <View style={styles.positionSidePill}>
                    <Text style={styles.positionSideText}>{position.side === 'TEAM_A' ? 'Team A' : 'Team B'}</Text>
                  </View>
                </View>
                <Text style={styles.invLocation}>Market Status: {position.market.status}</Text>
                <Text style={styles.invDate}>
                  Qty {position.amount} · Opened {new Date(position.openedAt).toLocaleDateString()}
                </Text>

                <View style={styles.invStats}>
                  <View style={styles.invStat}>
                    <Text style={styles.invStatVal}>{formatCurrency(position.currentValue)}</Text>
                    <Text style={styles.invStatLabel}>Current Value</Text>
                  </View>
                  <View style={styles.invStat}>
                    <Text style={[styles.invStatVal, { color: pnlPositive ? Colors.green : Colors.red }]}>
                      {pnlPositive ? '+' : ''}{formatCurrency(position.unrealizedPnl)}
                    </Text>
                    <Text style={styles.invStatLabel}>P&L</Text>
                  </View>
                  <View style={styles.invStat}>
                    <Text style={[styles.invStatVal, { color: Colors.gold }]}>{position.unrealizedPnlPct.toFixed(1)}%</Text>
                    <Text style={styles.invStatLabel}>ROI</Text>
                  </View>
                </View>
              </View>
            );
          })
        )}

        <Text style={styles.sectionTitle}>Recent Transactions ({transactions.length})</Text>
        {transactions.length === 0 ? (
          <View style={styles.emptyInline}>
            <Text style={styles.emptyInlineText}>No transactions yet</Text>
          </View>
        ) : (
          transactions.map((tx) => (
            <View key={tx.id} style={styles.txCard}>
              <View style={styles.txTopRow}>
                <Text style={styles.txType}>{tx.txType.replace(/_/g, ' ')}</Text>
                <Text style={styles.txAmount}>{formatCurrency(tx.amountUsdc)}</Text>
              </View>
              <Text style={styles.txMeta}>
                Qty {tx.quantity} · {new Date(tx.createdAt).toLocaleString()}
              </Text>
              <Text style={styles.txSignature} numberOfLines={1}>{tx.txSignature}</Text>
            </View>
          ))
        )}
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
    marginBottom: 16,
  },
  title: { fontSize: 24, fontWeight: '700' as const, color: Colors.text },
  exploreBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: Colors.goldGlow,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: Colors.goldDark,
  },
  exploreBtnText: { fontSize: 13, fontWeight: '600' as const, color: Colors.gold },
  summaryCard: {
    marginHorizontal: 20,
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: Colors.goldDark,
    overflow: 'hidden',
    marginBottom: 12,
  },
  summaryGlow: {
    position: 'absolute',
    top: -30,
    right: -30,
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: Colors.goldGlow,
  },
  summaryLabel: {
    fontSize: 10,
    fontWeight: '700' as const,
    color: Colors.gold,
    letterSpacing: 2,
    marginBottom: 6,
  },
  summaryValue: {
    fontSize: 34,
    fontWeight: '800' as const,
    color: Colors.text,
    marginBottom: 6,
    letterSpacing: -0.5,
  },
  roiRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 18,
  },
  roiText: { fontSize: 13, fontWeight: '600' as const },
  summaryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 0,
    borderTopWidth: 1,
    borderTopColor: 'rgba(212,175,55,0.2)',
    paddingTop: 16,
  },
  summaryCell: { width: '50%', paddingBottom: 12 },
  summaryCellVal: { fontSize: 16, fontWeight: '700' as const, marginBottom: 2 },
  summaryCellLabel: { fontSize: 11, color: Colors.textMuted },
  claimBanner: {
    marginHorizontal: 20,
    borderRadius: 14,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: Colors.green,
    marginBottom: 24,
    overflow: 'hidden',
  },
  claimLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  claimTitle: { fontSize: 13, color: Colors.textSecondary, marginBottom: 2 },
  claimAmount: { fontSize: 17, fontWeight: '700' as const, color: Colors.green },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '700' as const,
    color: Colors.text,
    paddingHorizontal: 20,
    marginBottom: 14,
  },
  emptyState: { alignItems: 'center', paddingTop: 40, paddingHorizontal: 40 },
  emptyIcon: { fontSize: 48, marginBottom: 16 },
  emptyTitle: { fontSize: 20, fontWeight: '700' as const, color: Colors.text, marginBottom: 8, textAlign: 'center' },
  emptyText: { fontSize: 14, color: Colors.textMuted, textAlign: 'center', lineHeight: 21, marginBottom: 24 },
  emptyBtn: { borderRadius: 12, overflow: 'hidden', width: 200 },
  emptyBtnGrad: { paddingVertical: 14, alignItems: 'center' },
  emptyBtnText: { fontSize: 15, fontWeight: '700' as const, color: Colors.background },
  invCard: {
    marginHorizontal: 20,
    backgroundColor: Colors.card,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: 16,
    marginBottom: 14,
  },
  invHeader: { flexDirection: 'row', gap: 12, marginBottom: 14 },
  invImage: { width: 70, height: 70, borderRadius: 12 },
  invInfo: { flex: 1 },
  invName: { fontSize: 15, fontWeight: '700' as const, color: Colors.text, marginBottom: 3 },
  invLocation: { fontSize: 12, color: Colors.textMuted, marginBottom: 3 },
  invDate: { fontSize: 11, color: Colors.textDisabled },
  invStats: {
    flexDirection: 'row',
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
  },
  invStat: { flex: 1, alignItems: 'center' },
  invStatVal: { fontSize: 14, fontWeight: '700' as const, color: Colors.text, marginBottom: 2 },
  invStatLabel: { fontSize: 10, color: Colors.textMuted },
  yieldRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  yieldEarned: { fontSize: 12, color: Colors.textSecondary, marginBottom: 2 },
  yieldClaimable: { fontSize: 12, color: Colors.green, fontWeight: '600' as const },
  invActions: { flexDirection: 'row', gap: 8 },
  claimBtn: {
    backgroundColor: `${Colors.green}22`,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderWidth: 1,
    borderColor: Colors.green,
  },
  claimBtnText: { fontSize: 12, fontWeight: '700' as const, color: Colors.green },
  sellBtn: {
    backgroundColor: `${Colors.red}22`,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderWidth: 1,
    borderColor: Colors.red,
  },
  sellBtnText: { fontSize: 12, fontWeight: '700' as const, color: Colors.red },
  emptyInline: {
    marginHorizontal: 20,
    marginBottom: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.card,
    padding: 12,
  },
  emptyInlineText: { fontSize: 12, color: Colors.textMuted, textAlign: 'center' },
  positionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
    gap: 10,
  },
  positionSidePill: {
    backgroundColor: Colors.cyanGlow,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: Colors.cyan,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  positionSideText: { fontSize: 10, fontWeight: '700' as const, color: Colors.cyan },
  txCard: {
    marginHorizontal: 20,
    backgroundColor: Colors.card,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: 12,
    marginBottom: 10,
  },
  txTopRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
  txType: { fontSize: 12, color: Colors.text, fontWeight: '700' as const },
  txAmount: { fontSize: 12, color: Colors.gold, fontWeight: '700' as const },
  txMeta: { fontSize: 11, color: Colors.textSecondary, marginBottom: 4 },
  txSignature: { fontSize: 10, color: Colors.textMuted },
});
