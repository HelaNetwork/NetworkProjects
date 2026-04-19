import Colors from '@/constants/Colors';
import { formatCurrency } from '@/mocks/data';
import { fetchAssetMarkets, fetchPredictionMarkets } from '@/services/markets';
import type { Property } from '@/types';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { ChevronRight, MapPin, Search, SlidersHorizontal, TrendingUp, Users } from 'lucide-react-native';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const FILTER_TYPES = ['All', 'Open', 'Scheduled', 'Closed'];
const EXPLORE_SECTIONS = [
  { label: 'Assets', value: 'assets' },
  { label: 'Betting Exchange', value: 'betting' },
] as const;
const SORT_OPTIONS = [
  { label: 'Rewards ↓', value: 'yield' },
  { label: 'Newest', value: 'newest' },
  { label: 'Unit Price ↑', value: 'price_asc' },
  { label: 'Unit Price ↓', value: 'price_desc' },
];

function PropertyCard({
  property,
  cardWidth,
  onPress,
}: {
  property: Property;
  cardWidth: number;
  onPress: () => void;
}) {
  const safeTotalShares = property.totalShares > 0 ? property.totalShares : 0;
  const rawAvailablePct = safeTotalShares > 0
    ? (property.availableShares / safeTotalShares) * 100
    : 0;
  const availablePct = Math.max(0, Math.min(100, Number.isFinite(rawAvailablePct) ? rawAvailablePct : 0));
  const availablePctText = `${Math.round(availablePct)}%`;

  return (
    <TouchableOpacity style={[styles.card, { width: cardWidth }]} onPress={onPress} activeOpacity={0.88}>
      <View style={styles.cardImageWrap}>
        <Image
          source={{ uri: property.image || 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=800&q=80' }}
          style={styles.cardImage}
          resizeMode="cover"
        />
        <LinearGradient
          colors={['transparent', 'rgba(8,9,13,0.85)']}
          style={styles.cardImageOverlay}
        />
        <View style={styles.yieldBadge}>
          <TrendingUp size={11} color={Colors.background} />
          <Text style={styles.yieldBadgeText}>{property.yieldPercent}% APY</Text>
        </View>
        <View style={styles.typeBadge}>
          <Text style={styles.typeBadgeText}>{property.type}</Text>
        </View>
        {property.status === 'sold_out' && (
          <View style={styles.soldOutOverlay}>
            <Text style={styles.soldOutText}>MARKET CLOSED</Text>
          </View>
        )}
      </View>

      <View style={styles.cardBody}>
        <Text style={styles.cardName}>{property.name}</Text>
        <View style={styles.cardLocation}>
          <MapPin size={12} color={Colors.textMuted} />
          <Text style={styles.cardLocationText}>{property.location}</Text>
        </View>

        <View style={styles.cardStats}>
          <View style={styles.cardStat}>
            <Text style={styles.cardStatVal}>{formatCurrency(property.pricePerShare)}</Text>
            <Text style={styles.cardStatLabel}>per unit</Text>
          </View>
          <View style={styles.cardStatDivider} />
          <View style={styles.cardStat}>
            <Text style={styles.cardStatVal}>{formatCurrency(property.totalValuation, true)}</Text>
            <Text style={styles.cardStatLabel}>market cap</Text>
          </View>
          <View style={styles.cardStatDivider} />
          <View style={styles.cardStat}>
            <View style={styles.investorsRow}>
              <Users size={11} color={Colors.textMuted} />
              <Text style={styles.cardStatVal}>{property.totalInvestors.toLocaleString()}</Text>
            </View>
            <Text style={styles.cardStatLabel}>traders</Text>
          </View>
        </View>

        <View style={styles.progressSection}>
          <View style={styles.progressHeader}>
            <Text style={styles.progressLabel}>Liquidity</Text>
            <Text style={styles.progressPct}>{availablePctText}</Text>
          </View>
          <View style={styles.progressBar}>
            <LinearGradient
              colors={[Colors.gold, Colors.goldDark]}
              style={[styles.progressFill, { width: `${availablePct}%` }]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            />
          </View>
        </View>

        <TouchableOpacity style={styles.investBtn} onPress={onPress} activeOpacity={0.85}>
          <LinearGradient
            colors={['#D4AF37', '#A88C28']}
            style={styles.investBtnGrad}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
          >
            <Text style={styles.investBtnText}>View Market</Text>
            <ChevronRight size={16} color={Colors.background} />
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
}

export default function ExploreScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const cardWidth = Math.max(280, width - 40);
  const [search, setSearch] = useState('');
  const [selectedType, setSelectedType] = useState('All');
  const [sortBy, setSortBy] = useState('yield');
  const [activeSection, setActiveSection] = useState<(typeof EXPLORE_SECTIONS)[number]['value']>('assets');
  const [assetMarkets, setAssetMarkets] = useState<Property[]>([]);
  const [bettingMarkets, setBettingMarkets] = useState<Property[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [loadError, setLoadError] = useState('');

  const loadProperties = useCallback(async (mode: 'initial' | 'refresh' = 'initial') => {
    try {
      if (mode === 'initial') {
        setIsLoading(true);
      } else {
        setIsRefreshing(true);
      }
      setLoadError('');
      const [assetsData, bettingData] = await Promise.all([
        fetchAssetMarkets(),
        fetchPredictionMarkets(),
      ]);
      setAssetMarkets(assetsData);
      setBettingMarkets(bettingData);
    } catch (error) {
      setLoadError(error instanceof Error ? error.message : 'Unable to fetch markets');
    } finally {
      if (mode === 'initial') {
        setIsLoading(false);
      } else {
        setIsRefreshing(false);
      }
    }
  }, []);

  useEffect(() => {
    loadProperties('initial');
  }, [loadProperties]);

  const hasActiveFilters = search.length > 0 || selectedType !== 'All' || sortBy !== 'yield';

  const currentMarkets = useMemo(
    () => (activeSection === 'assets' ? assetMarkets : bettingMarkets),
    [activeSection, assetMarkets, bettingMarkets],
  );

  const resetFilters = () => {
    setSearch('');
    setSelectedType('All');
    setSortBy('yield');
  };

  const onRefresh = () => {
    loadProperties('refresh');
  };

  const filtered = useMemo(() => {
    let list = [...currentMarkets];
    const normalizedSearch = search.trim().toLowerCase();

    if (normalizedSearch) {
      list = list.filter(p =>
        p.name.toLowerCase().includes(normalizedSearch)
        || p.city.toLowerCase().includes(normalizedSearch)
        || p.country.toLowerCase().includes(normalizedSearch)
      );
    }

    if (selectedType !== 'All') {
      const statusMap: Record<string, Property['status']> = {
        'Open': 'active',
        'Scheduled': 'pending',
        'Closed': 'sold_out',
      };
      list = list.filter(p => p.status === statusMap[selectedType]);
    }

    switch (sortBy) {
      case 'yield':
        list.sort((a, b) => b.yieldPercent - a.yieldPercent);
        break;
      case 'newest':
        list.sort((a, b) => b.pricePerShare - a.pricePerShare);
        break;
      case 'price_asc':
        list.sort((a, b) => a.pricePerShare - b.pricePerShare);
        break;
      case 'price_desc':
        list.sort((a, b) => b.pricePerShare - a.pricePerShare);
        break;
      default:
        break;
    }

    return list;
  }, [currentMarkets, search, selectedType, sortBy]);

  const sectionCountText = activeSection === 'assets'
    ? `${assetMarkets.length} live asset markets`
    : `${bettingMarkets.length} live betting markets`;

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <LinearGradient colors={['#0D0E1A', '#08090D']} style={StyleSheet.absoluteFill} />

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Explore Markets</Text>
        <Text style={styles.subtitle}>{sectionCountText}</Text>
      </View>

      {/* Explore Section Tabs */}
      <View style={styles.sectionTabsRow}>
        {EXPLORE_SECTIONS.map(section => (
          <TouchableOpacity
            key={section.value}
            style={[
              styles.sectionTab,
              activeSection === section.value && styles.sectionTabActive,
            ]}
            onPress={() => setActiveSection(section.value)}
            activeOpacity={0.85}
          >
            <Text
              style={[
                styles.sectionTabText,
                activeSection === section.value && styles.sectionTabTextActive,
              ]}
            >
              {section.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Search Row */}
      <View style={styles.searchRow}>
        <View style={styles.searchBox}>
          <Search size={16} color={Colors.textMuted} />
          <TextInput
            style={styles.searchInput}
            value={search}
            onChangeText={setSearch}
            placeholder="Search by team, league, or market..."
            placeholderTextColor={Colors.textDisabled}
          />
        </View>
        <TouchableOpacity
          style={[styles.filterBtn, hasActiveFilters && styles.filterBtnActive]}
          onPress={resetFilters}
          activeOpacity={0.85}
        >
          <SlidersHorizontal size={18} color={Colors.gold} />
        </TouchableOpacity>
      </View>

      {/* Type Filter Chips — fixed height scroll */}
      <View style={styles.typeFilterWrapper}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.typeFilterRow}
        >
          {FILTER_TYPES.map(t => (
            <TouchableOpacity
              key={t}
              style={[styles.typeChip, selectedType === t && styles.typeChipActive]}
              onPress={() => setSelectedType(t)}
              activeOpacity={0.8}
            >
              <Text
                numberOfLines={1}
                style={[styles.typeChipText, selectedType === t && styles.typeChipTextActive]}
              >
                {t}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Sort Row */}
      <View style={styles.sortRow}>
        <Text style={styles.resultCount}>{filtered.length} results</Text>
        <ScrollView
          horizontal
          style={styles.sortScroll}
          contentContainerStyle={styles.sortScrollContent}
          showsHorizontalScrollIndicator={false}
        >
          {SORT_OPTIONS.map(s => (
            <TouchableOpacity
              key={s.value}
              style={[styles.sortChip, sortBy === s.value && styles.sortChipActive]}
              onPress={() => setSortBy(s.value)}
            >
              <Text style={[styles.sortChipText, sortBy === s.value && styles.sortChipTextActive]}>
                {s.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Property List */}
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 24 }}
        refreshControl={(
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={onRefresh}
            tintColor={Colors.gold}
          />
        )}
      >
        {isLoading ? (
          <View style={styles.loadingBox}>
            <ActivityIndicator color={Colors.gold} />
            <Text style={styles.loadingText}>Loading markets...</Text>
          </View>
        ) : loadError ? (
          <View style={styles.errorBox}>
            <Text style={styles.errorText}>{loadError}</Text>
          </View>
        ) : (
          filtered.map(p => (
            <PropertyCard
              key={p.id}
              property={p}
              cardWidth={cardWidth}
              onPress={() => {
                if (activeSection === 'assets') {
                  router.push(`/buy/${p.id}` as any);
                  return;
                }

                router.push(`/market/${p.id}` as any);
              }}
            />
          ))
        )}
        {!isLoading && !loadError && filtered.length === 0 && (
          <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>🎮</Text>
            <Text style={styles.emptyTitle}>No {activeSection === 'assets' ? 'asset' : 'betting'} markets found</Text>
            <Text style={styles.emptyText}>Try adjusting your search or filters</Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },

  // Header
  header: { paddingHorizontal: 20, paddingTop: 14, marginBottom: 16 },
  title: { fontSize: 24, fontWeight: '700' as const, color: Colors.text, marginBottom: 4 },
  subtitle: { fontSize: 13, color: Colors.textMuted },

  // Section tabs
  sectionTabsRow: {
    flexDirection: 'row',
    marginHorizontal: 20,
    marginBottom: 12,
    borderRadius: 12,
    padding: 4,
    backgroundColor: Colors.card,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  sectionTab: {
    flex: 1,
    height: 38,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sectionTabActive: {
    backgroundColor: Colors.goldGlow,
    borderWidth: 1,
    borderColor: Colors.gold,
  },
  sectionTabText: {
    fontSize: 13,
    fontWeight: '600' as const,
    color: Colors.textMuted,
  },
  sectionTabTextActive: {
    color: Colors.gold,
    fontWeight: '700' as const,
  },

  // Search
  searchRow: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    gap: 10,
    marginBottom: 14,
  },
  searchBox: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.card,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: 8,
  },
  searchInput: { flex: 1, fontSize: 14, color: Colors.text },
  filterBtn: {
    width: 44,
    height: 44,
    backgroundColor: Colors.card,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.gold,
  },
  filterBtnActive: { backgroundColor: Colors.goldGlow },

  // ── TYPE FILTER FIX ──────────────────────────────────────────
  // Wrap the ScrollView in a fixed-height View so it can NEVER
  // bleed into content below it regardless of render timing.
  typeFilterWrapper: {
    height: 50,          // fixed outer height — chips are 34px + 8px vertical padding
    marginBottom: 12,
    justifyContent: 'center',
  },
  typeFilterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    gap: 8,
  },
  typeChip: {
    height: 34,           // fixed height (not min-height) so chips never grow
    flexShrink: 0,        // never shrink/wrap
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 16,
    borderRadius: 20,
    backgroundColor: Colors.card,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  typeChipActive: {
    backgroundColor: Colors.goldGlow,
    borderColor: Colors.gold,
  },
  typeChipText: {
    fontSize: 13,
    color: Colors.textMuted,
    fontWeight: '500' as const,
    lineHeight: 16,       // explicit line-height prevents text from pushing height
  },
  typeChipTextActive: { color: Colors.gold, fontWeight: '700' as const },
  // ─────────────────────────────────────────────────────────────

  // Sort row
  sortRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    gap: 12,
    marginBottom: 16,
  },
  resultCount: { fontSize: 12, color: Colors.textMuted, flexShrink: 0 },
  sortScroll: { flex: 1 },
  sortScrollContent: { paddingRight: 20 },
  sortChip: {
    flexShrink: 0,
    minWidth: 72,
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: Colors.card,
    marginRight: 6,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  sortChipActive: { backgroundColor: Colors.surface, borderColor: Colors.cyan },
  sortChipText: { fontSize: 12, color: Colors.textMuted },
  sortChipTextActive: { color: Colors.cyan, fontWeight: '600' as const },

  // Property card
  card: {
    marginHorizontal: 20,
    marginBottom: 20,
    backgroundColor: Colors.card,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.border,
    overflow: 'hidden',
  },
  cardImageWrap: { position: 'relative' },
  cardImage: { width: '100%', height: 200 },
  cardImageOverlay: { ...StyleSheet.absoluteFillObject },
  yieldBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: Colors.green,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 10,
  },
  yieldBadgeText: { fontSize: 12, fontWeight: '700' as const, color: Colors.background },
  typeBadge: {
    position: 'absolute',
    top: 12,
    left: 12,
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
  },
  typeBadgeText: { fontSize: 11, color: Colors.textSecondary, fontWeight: '500' as const },
  soldOutOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.6)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  soldOutText: {
    fontSize: 20,
    fontWeight: '800' as const,
    color: Colors.text,
    letterSpacing: 4,
  },
  cardBody: { padding: 16 },
  cardName: { fontSize: 18, fontWeight: '700' as const, color: Colors.text, marginBottom: 6 },
  cardLocation: { flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: 16 },
  cardLocationText: { fontSize: 13, color: Colors.textMuted },
  cardStats: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 12,
  },
  cardStat: { flex: 1, alignItems: 'center' },
  cardStatVal: { fontSize: 14, fontWeight: '700' as const, color: Colors.text, marginBottom: 2 },
  cardStatLabel: { fontSize: 10, color: Colors.textMuted },
  investorsRow: { flexDirection: 'row', alignItems: 'center', gap: 3 },
  cardStatDivider: { width: 1, height: 32, backgroundColor: Colors.border },
  progressSection: { marginBottom: 14 },
  progressHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
  progressLabel: { fontSize: 12, color: Colors.textMuted },
  progressPct: { fontSize: 12, color: Colors.gold, fontWeight: '600' as const },
  progressBar: {
    height: 4,
    backgroundColor: Colors.border,
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: { height: '100%', borderRadius: 2 },
  investBtn: { borderRadius: 12, overflow: 'hidden' },
  investBtnGrad: {
    paddingVertical: 13,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  investBtnText: { fontSize: 15, fontWeight: '700' as const, color: Colors.background },

  // States
  loadingBox: {
    marginHorizontal: 20,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.card,
    paddingVertical: 20,
    alignItems: 'center',
    gap: 8,
  },
  loadingText: { fontSize: 12, color: Colors.textMuted },
  errorBox: {
    marginHorizontal: 20,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Colors.red,
    backgroundColor: Colors.redGlow,
    padding: 12,
  },
  errorText: { fontSize: 12, color: Colors.red },
  emptyState: {
    marginHorizontal: 20,
    marginTop: 8,
    alignItems: 'center',
    backgroundColor: Colors.card,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 14,
    paddingVertical: 22,
    paddingHorizontal: 14,
  },
  emptyIcon: { fontSize: 34, marginBottom: 10 },
  emptyTitle: { fontSize: 16, fontWeight: '700' as const, color: Colors.text, marginBottom: 4 },
  emptyText: { fontSize: 13, color: Colors.textMuted, textAlign: 'center' },
});