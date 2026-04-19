import Colors from '@/constants/Colors';
import { useWallet } from '@/context/WalletContext';
import { formatCurrency } from '@/mocks/data';
import { useQueryClient } from '@tanstack/react-query';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { ArrowDownRight, ArrowUpRight, Bell, ChevronRight, Copy, Layers, TrendingUp, Zap } from 'lucide-react-native';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  Animated, Dimensions,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Defs, Path, Stop, LinearGradient as SvgGrad } from 'react-native-svg';

const { width } = Dimensions.get('window');
const CHART_W = width - 48;
const CHART_H = 80;

function MiniChart({ data, color }: { data: number[]; color: string }) {
  const safeData = data.length > 0 ? data : [0, 0];
  const max = Math.max(...safeData);
  const min = Math.min(...safeData);
  const range = max - min || 1;
  const pts = safeData.map((v, i) => {
    const denominator = safeData.length > 1 ? safeData.length - 1 : 1;
    const x = (i / denominator) * CHART_W;
    const y = CHART_H - ((v - min) / range) * (CHART_H - 10);
    return `${x},${y}`;
  });
  const d = `M ${pts[0]} ${pts.slice(1).map((point) => `L ${point}`).join(' ')}`;
  const fillD = `M 0,${CHART_H} L ${pts[0]} ${pts.slice(1).map((point) => `L ${point}`).join(' ')} L ${CHART_W},${CHART_H} Z`;

  return (
    <Svg width={CHART_W} height={CHART_H}>
      <Defs>
        <SvgGrad id="chartFill" x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0" stopColor={color} stopOpacity="0.3" />
          <Stop offset="1" stopColor={color} stopOpacity="0" />
        </SvgGrad>
      </Defs>
      <Path d={fillD} fill="url(#chartFill)" />
      <Path d={d} stroke={color} strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

export default function HomeScreen() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const insets = useSafeAreaInsets();
  const {
    walletAddress, profile, totalPortfolioValue,
    totalInvested, totalYieldEarned, totalClaimable, overallROI,
    holdings, positions, transactions,
  } = useWallet();

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(20)).current;
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 600, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 0, duration: 600, useNativeDriver: true }),
    ]).start();
  }, []);

  const portfolioData = profile.portfolioHistory.map(p => p.value);
  const yieldData = profile.yieldHistory.map(p => p.value);
  const roiPositive = overallROI >= 0;

  const onRefresh = useCallback(async () => {
    try {
      setIsRefreshing(true);
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['investments_me'] }),
        queryClient.invalidateQueries({ queryKey: ['yield_claimable'] }),
        queryClient.invalidateQueries({ queryKey: ['user_profile'] }),
      ]);
    } finally {
      setIsRefreshing(false);
    }
  }, [queryClient]);

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <LinearGradient colors={['#0D0E1A', '#08090D']} style={StyleSheet.absoluteFill} />

      <View style={styles.topBar}>
        <View>
          <Text style={styles.greeting}>Hi 👋</Text>
          <View style={styles.addressRow}>
            <View style={styles.networkDot} />
            <Text style={styles.address}>{walletAddress ?? '—'}</Text>
            <TouchableOpacity>
              <Copy size={12} color={Colors.textMuted} />
            </TouchableOpacity>
          </View>
        </View>
        <TouchableOpacity style={styles.bellBtn}>
          <Bell size={20} color={Colors.textSecondary} />
          <View style={styles.bellBadge} />
        </TouchableOpacity>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 24 }}
        refreshControl={(
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={onRefresh}
            tintColor={Colors.gold}
            colors={[Colors.gold]}
          />
        )}
      >
        <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>
          <View style={styles.heroCard}>
            <LinearGradient
              colors={['#1C1A08', '#241F0A', '#1A1808']}
              style={StyleSheet.absoluteFill}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            />
            <View style={styles.heroGlow} />
            <Text style={styles.heroLabel}>TOTAL PORTFOLIO VALUE</Text>
            <Text style={styles.heroValue}>{formatCurrency(totalPortfolioValue)}</Text>
            <View style={styles.roiRow}>
              {roiPositive
                ? <ArrowUpRight size={14} color={Colors.green} />
                : <ArrowDownRight size={14} color={Colors.red} />
              }
              <Text style={[styles.roiText, { color: roiPositive ? Colors.green : Colors.red }]}>
                {overallROI.toFixed(2)}% overall ROI
              </Text>
            </View>
            <View style={styles.heroChart}>
              <MiniChart data={portfolioData} color={Colors.gold} />
            </View>
            <View style={styles.heroStats}>
              {[
                { label: 'Invested', value: formatCurrency(totalInvested, true) },
                { label: 'Rewards Earned', value: formatCurrency(totalYieldEarned, true) },
                { label: 'Claimable', value: formatCurrency(totalClaimable, true) },
                { label: 'Holdings', value: `${holdings.length}` },
              ].map((s) => (
                <View key={s.label} style={styles.heroStat}>
                  <Text style={styles.heroStatVal}>{s.value}</Text>
                  <Text style={styles.heroStatLabel}>{s.label}</Text>
                </View>
              ))}
            </View>
          </View>

          <View style={styles.portfolioBreakdownCard}>
            <Text style={styles.sectionTitle}>Portfolio Breakdown</Text>
            <View style={styles.breakdownGrid}>
              <View style={styles.breakdownCell}>
                <Text style={styles.breakdownValue}>{holdings.length}</Text>
                <Text style={styles.breakdownLabel}>Asset Holdings</Text>
              </View>
              <View style={styles.breakdownCell}>
                <Text style={styles.breakdownValue}>{positions.length}</Text>
                <Text style={styles.breakdownLabel}>Prediction Positions</Text>
              </View>
              <View style={styles.breakdownCell}>
                <Text style={styles.breakdownValue}>{transactions.length}</Text>
                <Text style={styles.breakdownLabel}>Transactions</Text>
              </View>
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
                  <Text style={styles.claimTitle}>Rewards Available to Claim</Text>
                  <Text style={styles.claimAmount}>{formatCurrency(totalClaimable)}</Text>
                </View>
              </View>
              <ChevronRight size={18} color={Colors.green} />
            </TouchableOpacity>
          )}

          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.actionsGrid}>
            {[
              { label: 'Explore', sub: 'Markets', icon: Layers, color: Colors.cyan, route: '/(tabs)/explore' as any },
              { label: 'Claim', sub: 'Rewards', icon: Zap, color: Colors.green, route: '/claim' as any },
              // { label: 'Create', sub: 'Market', icon: Building2, color: Colors.gold, route: '/list/step1' as any },
              { label: 'Positions', sub: 'My Trades  ', icon: TrendingUp, color: Colors.purple, route: '/(tabs)/investments' as any },
            ].map((a) => (
              <TouchableOpacity
                key={a.label}
                style={styles.actionCard}
                onPress={() => router.push(a.route as any)}
                activeOpacity={0.8}
              >
                <View style={[styles.actionIcon, { backgroundColor: `${a.color}22` }]}>
                  <a.icon size={22} color={a.color} />
                </View>
                <Text style={styles.actionLabel}>{a.label}</Text>
                <Text style={styles.actionSub}>{a.sub}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <View style={styles.yieldSection}>
            <Text style={styles.sectionTitle}>Rewards Trend</Text>
            <View style={styles.yieldChart}>
              <MiniChart data={yieldData} color={Colors.green} />
            </View>
            <View style={styles.yieldMonths}>
              {profile.yieldHistory.map(p => (
                <Text key={p.month} style={styles.yieldMonth}>{p.month}</Text>
              ))}
            </View>
          </View>

          <View style={styles.activitySection}>
            <Text style={styles.sectionTitle}>Recent Transactions</Text>
            {transactions.slice(0, 5).map((tx) => (
              <View key={tx.id} style={styles.activityItem}>
                <View style={styles.activityInfo}>
                  <Text style={styles.activityUser}>{tx.txType.replace(/_/g, ' ')}</Text>
                  <Text style={styles.activityType}>Qty {tx.quantity}</Text>
                </View>
                <View style={styles.activityRight}>
                  <Text style={styles.activityAmount}>{formatCurrency(tx.amountUsdc, true)}</Text>
                  <Text style={styles.activityDate}>{new Date(tx.createdAt).toLocaleDateString()}</Text>
                </View>
              </View>
            ))}
            {transactions.length === 0 && (
              <View style={styles.emptyTxBox}>
                <Text style={styles.emptyTxText}>No transactions yet</Text>
              </View>
            )}
          </View>


        </Animated.View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 14,
  },
  greeting: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: Colors.text,
    marginBottom: 4,
  },
  addressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  networkDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.green,
  },
  address: {
    fontSize: 12,
    color: Colors.textMuted,
    fontFamily: 'monospace',
  },
  bellBtn: {
    position: 'relative',
    width: 42,
    height: 42,
    borderRadius: 12,
    backgroundColor: Colors.card,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  bellBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.gold,
    borderWidth: 2,
    borderColor: Colors.surface,
  },
  heroCard: {
    marginHorizontal: 20,
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: Colors.goldDark,
    overflow: 'hidden',
    marginBottom: 12,
  },
  heroGlow: {
    position: 'absolute',
    top: -40,
    right: -40,
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: Colors.goldGlow,
  },
  heroLabel: {
    fontSize: 10,
    fontWeight: '700' as const,
    color: Colors.gold,
    letterSpacing: 2,
    marginBottom: 8,
  },
  heroValue: {
    fontSize: 36,
    fontWeight: '800' as const,
    color: Colors.text,
    marginBottom: 6,
    letterSpacing: -0.5,
  },
  roiRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 16,
  },
  roiText: {
    fontSize: 13,
    fontWeight: '600' as const,
  },
  heroChart: {
    marginBottom: 20,
  },
  heroStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: 8,
    borderTopWidth: 1,
    borderTopColor: 'rgba(212, 175, 55, 0.2)',
    paddingTop: 16,
  },
  heroStat: {
    alignItems: 'center',
    minWidth: '22%',
  },
  heroStatVal: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: Colors.text,
    marginBottom: 2,
  },
  heroStatLabel: {
    fontSize: 11,
    color: Colors.textMuted,
  },
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
  claimLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  claimTitle: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginBottom: 2,
  },
  claimAmount: {
    fontSize: 17,
    fontWeight: '700' as const,
    color: Colors.green,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '700' as const,
    color: Colors.text,
    paddingHorizontal: 20,
    marginBottom: 14,
  },
  actionsGrid: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    gap: 10,
    marginBottom: 28,
  },
  actionCard: {
    flex: 1,
    backgroundColor: Colors.card,
    borderRadius: 16,
    padding: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  actionIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  actionLabel: {
    fontSize: 13,
    fontWeight: '700' as const,
    color: Colors.text,
    marginBottom: 2,
  },
  actionSub: {
    fontSize: 10,
    color: Colors.textMuted,
  },
  yieldSection: {
    marginHorizontal: 20,
    backgroundColor: Colors.card,
    borderRadius: 16,
    padding: 16,
    marginBottom: 28,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  yieldChart: {
    marginBottom: 8,
  },
  yieldMonths: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  yieldMonth: {
    fontSize: 10,
    color: Colors.textMuted,
  },
  portfolioBreakdownCard: {
    marginHorizontal: 20,
    backgroundColor: Colors.card,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: 20,
  },
  breakdownGrid: {
    flexDirection: 'row',
    gap: 10,
    paddingHorizontal: 4,
  },
  breakdownCell: {
    flex: 1,
    backgroundColor: Colors.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: 12,
    alignItems: 'center',
  },
  breakdownValue: { fontSize: 18, fontWeight: '800' as const, color: Colors.gold, marginBottom: 4 },
  breakdownLabel: { fontSize: 10, color: Colors.textMuted, textAlign: 'center' },
  activitySection: {
    paddingHorizontal: 20,
  },
  sectionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 14,
  },
  liveBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: `${Colors.red}22`,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  liveDot: {
    width: 5,
    height: 5,
    borderRadius: 3,
    backgroundColor: Colors.red,
  },
  liveText: {
    fontSize: 11,
    color: Colors.red,
    fontWeight: '600' as const,
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  activityIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  activityInfo: {
    flex: 1,
  },
  activityUser: {
    fontSize: 13,
    fontWeight: '600' as const,
    color: Colors.text,
    fontFamily: 'monospace',
    marginBottom: 2,
  },
  activityType: {
    fontSize: 12,
    color: Colors.textMuted,
  },
  activityRight: {
    alignItems: 'flex-end',
  },
  activityAmount: {
    fontSize: 13,
    fontWeight: '700' as const,
    color: Colors.green,
    marginBottom: 2,
  },
  activityDate: {
    fontSize: 11,
    color: Colors.textMuted,
  },
  emptyTxBox: {
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.card,
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
  },
  emptyTxText: { fontSize: 12, color: Colors.textMuted },
});
