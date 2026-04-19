import Colors from '@/constants/Colors';
import { formatCurrency } from '@/mocks/data';
import { fetchListingDraftById, ListingDraftDetail } from '@/services/listingDraft';
import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ArrowLeft, ExternalLink, MapPin } from 'lucide-react-native';
import React, { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  Linking,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

function formatDateTime(value?: string | null): string {
  if (!value) return 'Not submitted';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString();
}

function emptyText(value?: string | number | null): string {
  if (value === null || value === undefined || value === '') return '-';
  return String(value);
}

function toNumberOrNull(value?: string | number | null): number | null {
  if (value === null || value === undefined || value === '') return null;
  if (typeof value === 'number') return Number.isFinite(value) ? value : null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

export default function DraftDetailScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id: string }>();

  const [draft, setDraft] = useState<ListingDraftDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let mounted = true;

    const loadDraft = async () => {
      if (!id) {
        setError('Draft id is missing');
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        setError('');
        const response = await fetchListingDraftById(id);
        if (mounted) {
          setDraft(response);
        }
      } catch (fetchError) {
        if (mounted) {
          setError(fetchError instanceof Error ? fetchError.message : 'Unable to load draft');
        }
      } finally {
        if (mounted) {
          setIsLoading(false);
        }
      }
    };

    loadDraft();

    return () => {
      mounted = false;
    };
  }, [id]);

  const imageUrls = useMemo(() => {
    if (!draft?.step3Data) return [];
    const fromGallery = draft.step3Data.images ?? [];
    const cover = draft.step3Data.coverImageUrl;
    return Array.from(new Set([cover, ...fromGallery].filter(Boolean))) as string[];
  }, [draft]);

  const tokenomics = useMemo(() => {
    if (!draft?.step2Data) return null;
    return {
      totalValuation: toNumberOrNull(draft.step2Data.totalValuation ?? null),
      pricePerShare: toNumberOrNull(draft.step2Data.pricePerShare ?? null),
      totalShares: toNumberOrNull(draft.step2Data.totalShares ?? null),
      availableShares: toNumberOrNull(draft.step2Data.availableShares ?? null),
      yieldPercent: toNumberOrNull(draft.step2Data.yieldPercent ?? null),
    };
  }, [draft]);

  const openExternal = async (url?: string) => {
    if (!url) return;
    const canOpen = await Linking.canOpenURL(url);
    if (canOpen) {
      await Linking.openURL(url);
    }
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <LinearGradient colors={['#0D0E1A', '#08090D']} style={StyleSheet.absoluteFill} />

      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <ArrowLeft size={20} color={Colors.text} />
        </TouchableOpacity>
        <View style={styles.headerTextWrap}>
          <Text style={styles.title}>Draft Details</Text>
          <Text style={styles.subtitle}>{emptyText(id)}</Text>
        </View>
      </View>

      {isLoading ? (
        <View style={styles.centerState}>
          <ActivityIndicator color={Colors.gold} />
          <Text style={styles.centerText}>Loading market draft details...</Text>
        </View>
      ) : error ? (
        <View style={styles.centerState}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      ) : !draft ? (
        <View style={styles.centerState}>
          <Text style={styles.centerText}>Draft not found</Text>
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          {imageUrls.length > 0 && (
            <View style={styles.heroBox}>
              <Image source={{ uri: imageUrls[0] }} style={styles.heroImage} resizeMode="cover" />
            </View>
          )}

          <View style={styles.card}>
            <Text style={styles.cardTitle}>Summary</Text>
            <View style={styles.rowBetween}>
              <Text style={styles.rowLabel}>Status</Text>
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{draft.workflowStatus}</Text>
              </View>
            </View>
            <View style={styles.rowBetween}>
              <Text style={styles.rowLabel}>Step Completed</Text>
              <Text style={styles.rowValue}>{draft.stepCompleted} / 4</Text>
            </View>
            <View style={styles.rowBetween}>
              <Text style={styles.rowLabel}>Submitted At</Text>
              <Text style={styles.rowValue}>{formatDateTime(draft.submittedAt)}</Text>
            </View>
          </View>

          <View style={styles.card}>
            <Text style={styles.cardTitle}>Step 1: Market Info</Text>
            <Text style={styles.propertyName}>{emptyText(draft.step1Data?.name)}</Text>
            <View style={styles.locationRow}>
              <MapPin size={12} color={Colors.textMuted} />
              <Text style={styles.locationText}>
                {[draft.step1Data?.city, draft.step1Data?.country].filter(Boolean).join(', ') || '-'}
              </Text>
            </View>
            <View style={styles.grid}>
              <View style={styles.gridItem}>
                <Text style={styles.gridLabel}>Type</Text>
                <Text style={styles.gridValue}>{emptyText(draft.step1Data?.type)}</Text>
              </View>
              <View style={styles.gridItem}>
                <Text style={styles.gridLabel}>Year Built</Text>
                <Text style={styles.gridValue}>{emptyText(draft.step1Data?.yearBuilt)}</Text>
              </View>
              <View style={styles.gridItem}>
                <Text style={styles.gridLabel}>Area (sqft)</Text>
                <Text style={styles.gridValue}>{emptyText(draft.step1Data?.areaSqft)}</Text>
              </View>
              <View style={styles.gridItem}>
                <Text style={styles.gridLabel}>Address</Text>
                <Text style={styles.gridValue}>{emptyText(draft.step1Data?.addressFull)}</Text>
              </View>
            </View>
            <Text style={styles.descLabel}>Description</Text>
            <Text style={styles.descText}>{emptyText(draft.step1Data?.description)}</Text>
          </View>

          <View style={styles.card}>
            <Text style={styles.cardTitle}>Step 2: Tokenomics</Text>
            <View style={styles.rowBetween}>
              <Text style={styles.rowLabel}>Token Model</Text>
              <Text style={styles.rowValue}>{emptyText(draft.step2Data?.tokenModel)}</Text>
            </View>
            <View style={styles.rowBetween}>
              <Text style={styles.rowLabel}>Total Valuation</Text>
              <Text style={styles.rowValue}>
                {tokenomics && tokenomics.totalValuation !== null ? formatCurrency(tokenomics.totalValuation, true) : '-'}
              </Text>
            </View>
            <View style={styles.rowBetween}>
              <Text style={styles.rowLabel}>Price Per Share</Text>
              <Text style={styles.rowValue}>
                {tokenomics && tokenomics.pricePerShare !== null ? formatCurrency(tokenomics.pricePerShare) : '-'}
              </Text>
            </View>
            <View style={styles.rowBetween}>
              <Text style={styles.rowLabel}>Total Shares</Text>
              <Text style={styles.rowValue}>{tokenomics && tokenomics.totalShares !== null ? tokenomics.totalShares.toLocaleString() : '-'}</Text>
            </View>
            <View style={styles.rowBetween}>
              <Text style={styles.rowLabel}>Available Shares</Text>
              <Text style={styles.rowValue}>{tokenomics && tokenomics.availableShares !== null ? tokenomics.availableShares.toLocaleString() : '-'}</Text>
            </View>
            <View style={styles.rowBetween}>
              <Text style={styles.rowLabel}>Yield</Text>
              <Text style={styles.rowValue}>
                {tokenomics && tokenomics.yieldPercent !== null ? `${tokenomics.yieldPercent}% APY` : '-'}
              </Text>
            </View>
          </View>

          <View style={styles.card}>
            <Text style={styles.cardTitle}>Step 3: Market Media</Text>
            {imageUrls.length > 0 ? (
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.mediaRow}>
                {imageUrls.map((uri) => (
                  <Image key={uri} source={{ uri }} style={styles.mediaImage} />
                ))}
              </ScrollView>
            ) : (
              <Text style={styles.centerText}>No images uploaded</Text>
            )}
          </View>

          <View style={styles.card}>
            <Text style={styles.cardTitle}>Step 4: Documents</Text>
            <TouchableOpacity
              style={styles.docRow}
              activeOpacity={0.8}
              onPress={() => openExternal(draft.step4Data?.ownershipProofUrl)}
              disabled={!draft.step4Data?.ownershipProofUrl}
            >
              <Text style={styles.rowLabel}>Ownership Proof</Text>
              <View style={styles.docRight}>
                <Text style={styles.docLinkText}>{draft.step4Data?.ownershipProofUrl ? 'Open' : 'Not uploaded'}</Text>
                {draft.step4Data?.ownershipProofUrl && <ExternalLink size={14} color={Colors.cyan} />}
              </View>
            </TouchableOpacity>
          </View>
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 14,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: Colors.card,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTextWrap: { flex: 1 },
  title: { color: Colors.text, fontSize: 19, fontWeight: '700' as const },
  subtitle: { color: Colors.textMuted, fontSize: 11, marginTop: 2 },
  content: { paddingHorizontal: 20, paddingBottom: 30 },
  centerState: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 28, gap: 10 },
  centerText: { color: Colors.textMuted, fontSize: 13, textAlign: 'center' },
  errorText: { color: Colors.red, fontSize: 13, textAlign: 'center' },
  heroBox: {
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: 14,
  },
  heroImage: { width: '100%', height: 190, backgroundColor: Colors.surface },
  card: {
    backgroundColor: Colors.card,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: 14,
    marginBottom: 12,
  },
  cardTitle: { color: Colors.text, fontSize: 14, fontWeight: '700' as const, marginBottom: 10 },
  rowBetween: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8, gap: 10 },
  rowLabel: { color: Colors.textMuted, fontSize: 12, flex: 1 },
  rowValue: { color: Colors.text, fontSize: 12, fontWeight: '600' as const, flexShrink: 1, textAlign: 'right' },
  badge: {
    backgroundColor: Colors.goldGlow,
    borderColor: Colors.goldDark,
    borderWidth: 1,
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  badgeText: { color: Colors.gold, fontSize: 11, fontWeight: '700' as const },
  propertyName: { color: Colors.text, fontSize: 16, fontWeight: '700' as const, marginBottom: 5 },
  locationRow: { flexDirection: 'row', alignItems: 'center', gap: 5, marginBottom: 10 },
  locationText: { color: Colors.textMuted, fontSize: 12 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', marginHorizontal: -4 },
  gridItem: { width: '50%', paddingHorizontal: 4, marginBottom: 8 },
  gridLabel: { color: Colors.textMuted, fontSize: 11, marginBottom: 2 },
  gridValue: { color: Colors.text, fontSize: 12, fontWeight: '600' as const },
  descLabel: { color: Colors.textMuted, fontSize: 11, marginTop: 2, marginBottom: 4 },
  descText: { color: Colors.textSecondary, fontSize: 12, lineHeight: 18 },
  mediaRow: { gap: 8 },
  mediaImage: {
    width: 120,
    height: 86,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.surface,
  },
  docRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.surface,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  docRight: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  docLinkText: { color: Colors.cyan, fontSize: 12, fontWeight: '600' as const },
});
