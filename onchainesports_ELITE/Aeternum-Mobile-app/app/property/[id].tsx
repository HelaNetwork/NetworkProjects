import Colors from '@/constants/Colors';
import { formatCurrency } from '@/mocks/data';
import { fetchPropertyById } from '@/services/property';
import type { Property } from '@/types';
import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams, useRouter } from 'expo-router';
import {
  ArrowLeft,
  ChevronLeft, ChevronRight,
  MapPin,
  TrendingUp
} from 'lucide-react-native';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Dimensions,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');

const TABS = ['Overview', 'Financials'];

export default function PropertyDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [imageIndex, setImageIndex] = useState(0);
  const [activeTab, setActiveTab] = useState('Overview');

  const [property, setProperty] = useState<Property | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState('');

  useEffect(() => {
    let mounted = true;

    const loadProperty = async () => {
      if (!id) {
        if (mounted) {
          setLoadError('Market id is missing');
          setIsLoading(false);
        }
        return;
      }

      try {
        setIsLoading(true);
        setLoadError('');
        const data = await fetchPropertyById(id);
        if (mounted) {
          setProperty(data);
        }
      } catch (error) {
        if (mounted) {
          setLoadError(error instanceof Error ? error.message : 'Unable to fetch market');
        }
      } finally {
        if (mounted) {
          setIsLoading(false);
        }
      }
    };

    loadProperty();

    return () => {
      mounted = false;
    };
  }, [id]);

  useEffect(() => {
    setImageIndex(0);
  }, [property?.id]);

  if (isLoading) {
    return (
      <View style={[styles.container, styles.center, { paddingTop: insets.top }]}>
        <ActivityIndicator color={Colors.gold} />
        <Text style={styles.loadingText}>Loading market...</Text>
      </View>
    );
  }

  if (loadError) {
    return (
      <View style={[styles.container, styles.center, { paddingTop: insets.top }]}>
        <Text style={styles.errorText}>{loadError}</Text>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.backLink}>Go back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (!property) {
    return (
      <View style={[styles.container, styles.center, { paddingTop: insets.top }]}>
        <Text style={styles.notFound}>Market not found</Text>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.backLink}>Go back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const netYield = property.monthlyRental - property.operatingCosts
    - (property.monthlyRental * property.managementFeePercent / 100)
    - property.insuranceCost;

  const availPct = property.totalShares > 0
    ? ((property.availableShares / property.totalShares) * 100).toFixed(1)
    : '0.0';

  const imageList = property.images.length > 0
    ? property.images
    : [property.image].filter(Boolean);

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <LinearGradient colors={['#0D0E1A', '#08090D']} style={StyleSheet.absoluteFill} />

      <View style={styles.imgContainer}>
        <Image source={{ uri: imageList[imageIndex] }} style={styles.heroImg} resizeMode="cover" />
        <LinearGradient
          colors={['rgba(8,9,13,0.5)', 'transparent', 'rgba(8,9,13,0.9)']}
          style={StyleSheet.absoluteFill}
        />
        <TouchableOpacity style={[styles.backBtn, { top: 12 }]} onPress={() => router.back()}>
          <ArrowLeft size={20} color={Colors.text} />
        </TouchableOpacity>

        <View style={styles.imgDots}>
          {imageList.map((_, i) => (
            <TouchableOpacity
              key={i}
              onPress={() => setImageIndex(i)}
              style={[styles.dot, i === imageIndex && styles.dotActive]}
            />
          ))}
        </View>

        {imageIndex > 0 && (
          <TouchableOpacity style={[styles.imgArrow, { left: 12 }]} onPress={() => setImageIndex(i => i - 1)}>
            <ChevronLeft size={18} color={Colors.text} />
          </TouchableOpacity>
        )}
        {imageIndex < imageList.length - 1 && (
          <TouchableOpacity style={[styles.imgArrow, { right: 12 }]} onPress={() => setImageIndex(i => i + 1)}>
            <ChevronRight size={18} color={Colors.text} />
          </TouchableOpacity>
        )}

        <View style={styles.yieldBadgeImg}>
          <TrendingUp size={13} color={Colors.background} />
          <Text style={styles.yieldBadgeText}>{property.yieldPercent}% APY</Text>
        </View>
      </View>

      <View style={styles.titleRow}>
        <View style={styles.titleLeft}>
          <Text style={styles.propName}>{property.name}</Text>
          <View style={styles.locationRow}>
            <MapPin size={13} color={Colors.textMuted} />
            <Text style={styles.locationText}>{property.location}</Text>
          </View>
        </View>
        <View style={styles.typePill}>
          <Text style={styles.typeText}>{property.type}</Text>
        </View>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.tabsScroll}
        contentContainerStyle={styles.tabs}
      >
        {TABS.map(tab => (
          <TouchableOpacity
            key={tab}
            style={[styles.tab, activeTab === tab && styles.tabActive]}
            onPress={() => setActiveTab(tab)}
          >
            <Text style={[styles.tabText, activeTab === tab && styles.tabTextActive]}>{tab}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 120 }}>
        {activeTab === 'Overview' && (
          <View style={styles.tabContent}>
            <View style={styles.overviewStats}>
              {[
                { label: 'Total Valuation', value: formatCurrency(property.totalValuation, true) },
                { label: 'Tokenized', value: formatCurrency(property.tokenizedAmount, true) },
                { label: 'Price/Unit', value: formatCurrency(property.pricePerShare) },
                { label: 'Available Units', value: property.availableShares.toLocaleString() },
                { label: 'Total Traders', value: property.totalInvestors.toLocaleString() },
                { label: 'Occupancy', value: `${property.occupancy}%` },
              ].map((s) => (
                <View key={s.label} style={styles.overviewStat}>
                  <Text style={styles.overviewVal}>{s.value}</Text>
                  <Text style={styles.overviewLabel}>{s.label}</Text>
                </View>
              ))}
            </View>

            <View style={styles.progressSection}>
              <View style={styles.progressHeader}>
                <Text style={styles.progressLabel}>Liquidity Available</Text>
                <Text style={styles.progressPct}>{availPct}%</Text>
              </View>
              <View style={styles.progressBarOuter}>
                <LinearGradient
                  colors={[Colors.gold, Colors.goldDark]}
                  style={[styles.progressBarFill, { width: `${availPct}%` as any }]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                />
              </View>
              <View style={styles.progressFooter}>
                <View style={styles.progressDot} />
                <Text style={styles.progressInfo}>
                  {(property.totalShares - property.availableShares).toLocaleString()} units already filled
                </Text>
              </View>
            </View>

            <View style={styles.descSection}>
              <Text style={styles.descTitle}>About this Market</Text>
              <Text style={styles.descText}>{property.description}</Text>
              {property.yearBuilt && (
                <View style={styles.propMetaRow}>
                  <Text style={styles.propMeta}>Year Built: <Text style={styles.propMetaVal}>{property.yearBuilt}</Text></Text>
                  {property.areaSize && (
                    <Text style={styles.propMeta}>Area: <Text style={styles.propMetaVal}>{property.areaSize?.toLocaleString()} sq ft</Text></Text>
                  )}
                </View>
              )}
            </View>
          </View>
        )}

        {activeTab === 'Financials' && (
          <View style={styles.tabContent}>
            <View style={styles.financeCard}>
              <Text style={styles.financeTitle}>Rewards Breakdown</Text>
              {[
                { label: 'Gross Reward Pool', value: formatCurrency(property.monthlyRental), color: Colors.green },
                { label: 'Operating Costs', value: `-${formatCurrency(property.operatingCosts)}`, color: Colors.red },
                { label: `Management Fee (${property.managementFeePercent}%)`, value: `-${formatCurrency(property.monthlyRental * property.managementFeePercent / 100)}`, color: Colors.red },
                { label: 'Risk Reserve', value: `-${formatCurrency(property.insuranceCost)}`, color: Colors.red },
              ].map((row) => (
                <View key={row.label} style={styles.financeRow}>
                  <Text style={styles.financeLabel}>{row.label}</Text>
                  <Text style={[styles.financeVal, { color: row.color }]}>{row.value}</Text>
                </View>
              ))}
              <View style={styles.financeDivider} />
              <View style={styles.financeRow}>
                <Text style={styles.financeNetLabel}>Net Distributable Rewards</Text>
                <Text style={styles.financeNetVal}>{formatCurrency(netYield)}/mo</Text>
              </View>
            </View>

            <View style={styles.financeCard}>
              <Text style={styles.financeTitle}>Key Metrics</Text>
              {[
                { label: 'Annual Rewards', value: `${property.yieldPercent}%`, color: Colors.gold },
                { label: 'Cap Rate', value: `${property.capRate}%`, color: Colors.cyan },
                { label: 'Participation Rate', value: `${property.occupancy}%`, color: Colors.green },
                { label: 'Annual Pool Payout', value: formatCurrency(netYield * 12, true), color: Colors.text },
              ].map((row) => (
                <View key={row.label} style={styles.financeRow}>
                  <Text style={styles.financeLabel}>{row.label}</Text>
                  <Text style={[styles.financeVal, { color: row.color }]}>{row.value}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

      </ScrollView>

      <View style={[styles.buyBar, { paddingBottom: insets.bottom + 12 }]}>
        <LinearGradient
          colors={['transparent', 'rgba(8,9,13,0.98)']}
          style={StyleSheet.absoluteFill}
        />
        <View style={styles.buyBarContent}>
          <View>
            <Text style={styles.buyBarPrice}>{formatCurrency(property.pricePerShare)}</Text>
            <Text style={styles.buyBarLabel}>per unit</Text>
          </View>
          <TouchableOpacity
            style={styles.buyBtn}
            onPress={() => router.push(`/buy/${property.id}` as any)}
            activeOpacity={0.85}
          >
            <LinearGradient colors={['#D4AF37', '#A88C28']} style={styles.buyBtnGrad}>
              <Text style={styles.buyBtnText}>Open Position</Text>
              <TrendingUp size={16} color={Colors.background} />
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  center: { alignItems: 'center', justifyContent: 'center' },
  notFound: { fontSize: 18, color: Colors.text, marginBottom: 12 },
  loadingText: { fontSize: 13, color: Colors.textMuted, marginTop: 10 },
  errorText: { fontSize: 13, color: Colors.red, marginBottom: 12, textAlign: 'center', paddingHorizontal: 20 },
  backLink: { fontSize: 14, color: Colors.gold },
  imgContainer: { width, height: 260, position: 'relative' },
  heroImg: { width: '100%', height: '100%' },
  backBtn: {
    position: 'absolute',
    left: 16,
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: 'rgba(8,9,13,0.7)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  imgDots: {
    position: 'absolute',
    bottom: 12,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 6,
  },
  dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: 'rgba(255,255,255,0.4)' },
  dotActive: { backgroundColor: Colors.gold, width: 16 },
  imgArrow: {
    position: 'absolute',
    top: '50%',
    marginTop: -18,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(8,9,13,0.6)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  yieldBadgeImg: {
    position: 'absolute',
    top: 12,
    right: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: Colors.green,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 10,
  },
  yieldBadgeText: { fontSize: 12, fontWeight: '700' as const, color: Colors.background },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 6,
  },
  titleLeft: { flex: 1, marginRight: 10 },
  propName: { fontSize: 20, fontWeight: '700' as const, color: Colors.text, marginBottom: 4 },
  locationRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  locationText: { fontSize: 13, color: Colors.textMuted },
  typePill: {
    backgroundColor: Colors.goldGlow,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: Colors.goldDark,
  },
  typeText: { fontSize: 11, color: Colors.gold, fontWeight: '600' as const },
  tabsScroll: { marginBottom: 4 },
  tabs: { paddingHorizontal: 20, gap: 6, paddingVertical: 10 },
  tab: {
    paddingHorizontal: 16,
    paddingVertical: 7,
    borderRadius: 20,
    backgroundColor: Colors.card,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  tabActive: { backgroundColor: Colors.goldGlow, borderColor: Colors.gold },
  tabText: { fontSize: 13, color: Colors.textMuted, fontWeight: '500' as const },
  tabTextActive: { color: Colors.gold, fontWeight: '700' as const },
  tabContent: { padding: 20 },
  overviewStats: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    backgroundColor: Colors.card,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    overflow: 'hidden',
    marginBottom: 16,
  },
  overviewStat: {
    width: '33.33%',
    padding: 14,
    alignItems: 'center',
    borderRightWidth: 1,
    borderBottomWidth: 1,
    borderColor: Colors.border,
  },
  overviewVal: { fontSize: 14, fontWeight: '700' as const, color: Colors.text, marginBottom: 3 },
  overviewLabel: { fontSize: 10, color: Colors.textMuted, textAlign: 'center' },
  progressSection: {
    backgroundColor: Colors.card,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: 16,
  },
  progressHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  progressLabel: { fontSize: 13, color: Colors.textSecondary, fontWeight: '500' as const },
  progressPct: { fontSize: 13, color: Colors.gold, fontWeight: '700' as const },
  progressBarOuter: { height: 6, backgroundColor: Colors.border, borderRadius: 3, overflow: 'hidden', marginBottom: 8 },
  progressBarFill: { height: '100%', borderRadius: 3 },
  progressFooter: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  progressDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: Colors.cyan },
  progressInfo: { fontSize: 12, color: Colors.textMuted },
  descSection: {
    backgroundColor: Colors.card,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  descTitle: { fontSize: 15, fontWeight: '700' as const, color: Colors.text, marginBottom: 10 },
  descText: { fontSize: 14, color: Colors.textSecondary, lineHeight: 22 },
  propMetaRow: { flexDirection: 'row', gap: 16, marginTop: 12 },
  propMeta: { fontSize: 12, color: Colors.textMuted },
  propMetaVal: { color: Colors.textSecondary, fontWeight: '600' as const },
  financeCard: {
    backgroundColor: Colors.card,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: 14,
  },
  financeTitle: { fontSize: 15, fontWeight: '700' as const, color: Colors.text, marginBottom: 14 },
  financeRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  financeLabel: { fontSize: 13, color: Colors.textMuted },
  financeVal: { fontSize: 13, fontWeight: '600' as const },
  financeDivider: { height: 1, backgroundColor: Colors.border, marginVertical: 8 },
  financeNetLabel: { fontSize: 14, fontWeight: '700' as const, color: Colors.text },
  financeNetVal: { fontSize: 16, fontWeight: '800' as const, color: Colors.green },
  buyBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingTop: 20,
  },
  buyBarContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  buyBarPrice: { fontSize: 22, fontWeight: '800' as const, color: Colors.text },
  buyBarLabel: { fontSize: 12, color: Colors.textMuted },
  buyBtn: { borderRadius: 14, overflow: 'hidden', shadowColor: Colors.gold, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.5, shadowRadius: 10 },
  buyBtnGrad: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 24, paddingVertical: 16 },
  buyBtnText: { fontSize: 16, fontWeight: '700' as const, color: Colors.background },
});
