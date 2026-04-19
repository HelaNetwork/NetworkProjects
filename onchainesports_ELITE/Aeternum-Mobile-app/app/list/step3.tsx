import Colors from '@/constants/Colors';
import { updateListingDraft, uploadListingImage } from '@/services/listingDraft';
import { useListingDraftStore } from '@/stores/listing-draft-store';
import * as ImagePicker from 'expo-image-picker';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { ArrowLeft, ArrowRight, DollarSign, Percent, TrendingUp } from 'lucide-react-native';
import React, { useState } from 'react';
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TextInput, TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function ListStep3Screen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [monthlyRental, setMonthlyRental] = useState('');
  const [operatingCosts, setOperatingCosts] = useState('');
  const [managementFee, setManagementFee] = useState('');
  const [insuranceCost, setInsuranceCost] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [isUploadingCover, setIsUploadingCover] = useState(false);
  const [isUploadingGallery, setIsUploadingGallery] = useState(false);

  const draftId = useListingDraftStore(s => s.draftId);
  const mediaUploads = useListingDraftStore(s => s.mediaUploads);
  const setMediaUploads = useListingDraftStore(s => s.setMediaUploads);
  const [videoUrl, setVideoUrl] = useState(mediaUploads?.videoUrl ?? '');

  const monthly = parseFloat(monthlyRental) || 0;
  const opCosts = parseFloat(operatingCosts) || 0;
  const mgmtFee = parseFloat(managementFee) || 0;
  const insurance = parseFloat(insuranceCost) || 0;
  const mgmtAmount = monthly * (mgmtFee / 100);
  const netMonthly = monthly - opCosts - mgmtAmount - insurance;
  const netAnnual = netMonthly * 12;

  const canContinue = monthlyRental !== '' && operatingCosts !== '' && managementFee !== '';

  const uploadImages = async (multiple: boolean): Promise<string[]> => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert('Permission required', 'Allow photo access to upload market media.');
      return [];
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsMultipleSelection: multiple,
      selectionLimit: multiple ? 10 : 1,
      quality: 0.8,
    });

    if (result.canceled || !result.assets.length) return [];

    const urls = await Promise.all(
      result.assets.map((asset) => uploadListingImage({
        uri: asset.uri,
        name: asset.fileName ?? `listing-${Date.now()}.jpg`,
        type: asset.mimeType ?? 'image/jpeg',
      })),
    );

    return urls.filter(Boolean);
  };

  const handleUploadCover = async () => {
    if (isUploadingCover) return;

    try {
      setIsUploadingCover(true);
      const urls = await uploadImages(false);
      if (!urls.length) return;

      setMediaUploads({
        coverImageUrl: urls[0],
        images: mediaUploads?.images ?? [],
        videoUrl,
      });
    } catch (error) {
      Alert.alert(
        'Cover upload failed',
        error instanceof Error ? error.message : 'Something went wrong while uploading cover image.',
      );
    } finally {
      setIsUploadingCover(false);
    }
  };

  const handleUploadGallery = async () => {
    if (isUploadingGallery) return;

    try {
      setIsUploadingGallery(true);
      const urls = await uploadImages(true);
      if (!urls.length) return;

      const mergedGallery = Array.from(new Set([...(mediaUploads?.images ?? []), ...urls]));
      setMediaUploads({
        coverImageUrl: mediaUploads?.coverImageUrl ?? mergedGallery[0],
        images: mergedGallery,
        videoUrl,
      });
      Alert.alert('Upload complete', `${urls.length} image(s) uploaded.`);
    } catch (error) {
      Alert.alert(
        'Gallery upload failed',
        error instanceof Error ? error.message : 'Something went wrong while uploading gallery images.',
      );
    } finally {
      setIsUploadingGallery(false);
    }
  };

  const handleContinue = async () => {
    if (!canContinue || isSaving) return;

    if (!draftId) {
      Alert.alert('Missing draft', 'Please complete Step 1 first.');
      router.replace('/list/step1' as any);
      return;
    }

    const payload = {
      coverImageUrl: mediaUploads?.coverImageUrl,
      images: mediaUploads?.images ?? [],
      videoUrl: videoUrl.trim() || undefined,
    };

    try {
      setIsSaving(true);
      await updateListingDraft(draftId, {
        step: 3,
        mediaUploads: payload,
      });
      setMediaUploads(payload);
      router.push('/list/review' as any);
    } catch (error) {
      Alert.alert(
        'Unable to save step 3',
        error instanceof Error ? error.message : 'Something went wrong. Please try again.',
      );
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <LinearGradient colors={['#0D0E1A', '#08090D']} style={StyleSheet.absoluteFill} />

      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <ArrowLeft size={20} color={Colors.text} />
        </TouchableOpacity>
        <View style={styles.stepIndicator}>
          {[1, 2, 3, 4].map(s => (
            <View key={s} style={[styles.stepDot, s === 3 && styles.stepDotActive, s < 3 && styles.stepDotDone]} />
          ))}
        </View>
        <Text style={styles.stepLabel}>3 / 4</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ padding: 20, paddingBottom: 100 }} keyboardShouldPersistTaps="handled">
        <Text style={styles.title}>Reward Model</Text>
        <Text style={styles.subtitle}>Define reward pool and cost structure for traders</Text>

        <View style={styles.section}>
          <Text style={styles.sectionLabel}>REWARD POOL</Text>

          <View style={styles.inputGroup}>
            <View style={styles.inputIcon}><DollarSign size={16} color={Colors.green} /></View>
            <View style={styles.inputFlex}>
              <Text style={styles.inputLabel}>Monthly Reward Pool (USD) *</Text>
              <TextInput
                style={styles.input}
                value={monthlyRental}
                onChangeText={setMonthlyRental}
                placeholder="e.g. 50000"
                placeholderTextColor={Colors.textDisabled}
                keyboardType="numeric"
              />
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionLabel}>COSTS</Text>

          <View style={styles.inputGroup}>
            <View style={styles.inputIcon}><DollarSign size={16} color={Colors.red} /></View>
            <View style={styles.inputFlex}>
              <Text style={styles.inputLabel}>Monthly Operating Costs (USD) *</Text>
              <TextInput
                style={styles.input}
                value={operatingCosts}
                onChangeText={setOperatingCosts}
                placeholder="e.g. 5000"
                placeholderTextColor={Colors.textDisabled}
                keyboardType="numeric"
              />
            </View>
          </View>

          <View style={[styles.inputGroup, { marginTop: 10 }]}>
            <View style={styles.inputIcon}><Percent size={16} color={Colors.gold} /></View>
            <View style={styles.inputFlex}>
              <Text style={styles.inputLabel}>Management Fee (%) *</Text>
              <TextInput
                style={styles.input}
                value={managementFee}
                onChangeText={setManagementFee}
                placeholder="e.g. 8"
                placeholderTextColor={Colors.textDisabled}
                keyboardType="numeric"
              />
            </View>
          </View>

          <View style={[styles.inputGroup, { marginTop: 10 }]}>
            <View style={styles.inputIcon}><DollarSign size={16} color={Colors.cyan} /></View>
            <View style={styles.inputFlex}>
              <Text style={styles.inputLabel}>Monthly Risk Reserve (USD)</Text>
              <TextInput
                style={styles.input}
                value={insuranceCost}
                onChangeText={setInsuranceCost}
                placeholder="e.g. 2000"
                placeholderTextColor={Colors.textDisabled}
                keyboardType="numeric"
              />
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionLabel}>MEDIA UPLOADS</Text>

          <TouchableOpacity style={styles.mediaCard} onPress={handleUploadCover} activeOpacity={0.85}>
            <Text style={styles.mediaTitle}>Cover Image</Text>
            <Text style={styles.mediaSub}>
              {mediaUploads?.coverImageUrl ? 'Uploaded' : 'Upload 1 cover image'}
            </Text>
            <Text style={styles.mediaBtn}>{isUploadingCover ? 'Uploading...' : '+ Upload Cover'}</Text>
          </TouchableOpacity>

          <TouchableOpacity style={[styles.mediaCard, { marginTop: 10 }]} onPress={handleUploadGallery} activeOpacity={0.85}>
            <Text style={styles.mediaTitle}>Gallery Images</Text>
            <Text style={styles.mediaSub}>{(mediaUploads?.images?.length ?? 0)} image(s) uploaded</Text>
            <Text style={styles.mediaBtn}>{isUploadingGallery ? 'Uploading...' : '+ Add Gallery Images'}</Text>
          </TouchableOpacity>

          <View style={[styles.inputGroup, { marginTop: 10 }]}>
            <View style={styles.inputFlex}>
              <Text style={styles.inputLabel}>Video URL (optional)</Text>
              <TextInput
                style={styles.input}
                value={videoUrl}
                onChangeText={(value) => {
                  setVideoUrl(value);
                  setMediaUploads({
                    coverImageUrl: mediaUploads?.coverImageUrl,
                    images: mediaUploads?.images ?? [],
                    videoUrl: value,
                  });
                }}
                placeholder="https://..."
                placeholderTextColor={Colors.textDisabled}
                autoCapitalize="none"
              />
            </View>
          </View>
        </View>

        {canContinue && monthly > 0 && (
          <View style={styles.calcCard}>
            <View style={styles.calcHeader}>
              <TrendingUp size={18} color={Colors.green} />
              <Text style={styles.calcTitle}>Auto-Calculated Rewards</Text>
            </View>

            {[
              { label: 'Gross Monthly Reward Pool', value: `$${monthly.toLocaleString()}`, color: Colors.green },
              { label: 'Operating Costs', value: `-$${opCosts.toLocaleString()}`, color: Colors.red },
              { label: `Management Fee (${mgmtFee}%)`, value: `-$${mgmtAmount.toFixed(0)}`, color: Colors.red },
              { label: 'Risk Reserve', value: `-$${insurance.toLocaleString()}`, color: Colors.red },
            ].map(row => (
              <View key={row.label} style={styles.calcRow}>
                <Text style={styles.calcLabel}>{row.label}</Text>
                <Text style={[styles.calcVal, { color: row.color }]}>{row.value}</Text>
              </View>
            ))}

            <View style={styles.calcDivider} />

            <View style={styles.calcRow}>
              <Text style={styles.calcNetLabel}>Net Monthly Rewards</Text>
              <Text style={[styles.calcNetVal, { color: netMonthly >= 0 ? Colors.green : Colors.red }]}>
                ${netMonthly.toFixed(0)}
              </Text>
            </View>
            <View style={styles.calcRow}>
              <Text style={styles.calcNetLabel}>Net Annual Rewards</Text>
              <Text style={[styles.calcNetVal, { color: netAnnual >= 0 ? Colors.green : Colors.red }]}>
                ${netAnnual.toFixed(0)}
              </Text>
            </View>

            <View style={styles.yieldEstimate}>
              <Text style={styles.yieldEstimateLabel}>Estimated Net Rewards</Text>
              <View style={styles.yieldEstimateBadge}>
                <Text style={styles.yieldEstimateVal}>
                  ~{netMonthly > 0 ? ((netAnnual / (monthly * 12)) * 100).toFixed(1) : '0.0'}%
                </Text>
                <Text style={styles.yieldEstimateUnit}>APY</Text>
              </View>
            </View>
          </View>
        )}

        <View style={styles.infoCard}>
          <Text style={styles.infoTitle}>💡 How rewards are calculated</Text>
          <Text style={styles.infoText}>
            Traders receive a proportional share of the net distributable reward pool based on their unit ownership. Distributions follow the frequency selected in Step 2.
          </Text>
        </View>
      </ScrollView>

      <View style={[styles.bottomBar, { paddingBottom: insets.bottom + 12 }]}>
        <LinearGradient colors={['transparent', 'rgba(8,9,13,0.98)']} style={StyleSheet.absoluteFill} />
        <TouchableOpacity
          style={[styles.nextBtn, !canContinue && styles.nextBtnDisabled]}
          onPress={handleContinue}
          disabled={!canContinue || isSaving}
          activeOpacity={0.85}
        >
          <LinearGradient
            colors={canContinue ? ['#D4AF37', '#A88C28'] : [Colors.border, Colors.border]}
            style={styles.nextBtnGrad}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
          >
            <Text style={[styles.nextBtnText, !canContinue && styles.nextBtnTextDisabled]}>
              {isSaving ? 'Saving Step 3...' : 'Review & Submit'}
            </Text>
            <ArrowRight size={18} color={canContinue ? Colors.background : Colors.textMuted} />
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
  stepIndicator: { flexDirection: 'row', gap: 6 },
  stepDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: Colors.border },
  stepDotActive: { backgroundColor: Colors.gold, width: 24 },
  stepDotDone: { backgroundColor: Colors.green },
  stepLabel: { fontSize: 13, color: Colors.textMuted, fontWeight: '600' as const },
  title: { fontSize: 26, fontWeight: '700' as const, color: Colors.text, marginBottom: 6 },
  subtitle: { fontSize: 14, color: Colors.textMuted, marginBottom: 24 },
  section: { marginBottom: 22 },
  sectionLabel: { fontSize: 11, fontWeight: '700' as const, color: Colors.textMuted, letterSpacing: 1.5, marginBottom: 10 },
  inputGroup: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.card,
    borderRadius: 14, padding: 14, borderWidth: 1, borderColor: Colors.border, gap: 12,
  },
  inputIcon: {
    width: 36, height: 36, borderRadius: 10, backgroundColor: Colors.surface,
    alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: Colors.border,
  },
  inputFlex: { flex: 1 },
  inputLabel: { fontSize: 11, color: Colors.textMuted, marginBottom: 2, fontWeight: '500' as const },
  input: { fontSize: 15, color: Colors.text, padding: 0 },
  calcCard: {
    backgroundColor: Colors.card, borderRadius: 16, padding: 16,
    borderWidth: 1, borderColor: Colors.green, marginBottom: 16,
  },
  calcHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 14 },
  calcTitle: { fontSize: 15, fontWeight: '700' as const, color: Colors.text },
  calcRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  calcLabel: { fontSize: 13, color: Colors.textMuted },
  calcVal: { fontSize: 13, fontWeight: '600' as const },
  calcDivider: { height: 1, backgroundColor: Colors.border, marginVertical: 10 },
  calcNetLabel: { fontSize: 14, fontWeight: '700' as const, color: Colors.text },
  calcNetVal: { fontSize: 16, fontWeight: '800' as const },
  yieldEstimate: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    backgroundColor: Colors.greenGlow, borderRadius: 10, padding: 12, marginTop: 10,
    borderWidth: 1, borderColor: Colors.green,
  },
  yieldEstimateLabel: { fontSize: 14, fontWeight: '700' as const, color: Colors.text },
  yieldEstimateBadge: { flexDirection: 'row', alignItems: 'baseline', gap: 4 },
  yieldEstimateVal: { fontSize: 28, fontWeight: '800' as const, color: Colors.green },
  yieldEstimateUnit: { fontSize: 14, color: Colors.green, fontWeight: '600' as const },
  infoCard: {
    backgroundColor: Colors.card, borderRadius: 14, padding: 14,
    borderWidth: 1, borderColor: Colors.border, marginBottom: 20,
  },
  infoTitle: { fontSize: 14, fontWeight: '700' as const, color: Colors.text, marginBottom: 8 },
  infoText: { fontSize: 13, color: Colors.textSecondary, lineHeight: 20 },
  mediaCard: {
    backgroundColor: Colors.card,
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  mediaTitle: { fontSize: 14, fontWeight: '700' as const, color: Colors.text },
  mediaSub: { fontSize: 12, color: Colors.textMuted, marginTop: 3 },
  mediaBtn: { fontSize: 13, color: Colors.gold, fontWeight: '600' as const, marginTop: 10 },
  bottomBar: { position: 'absolute', bottom: 0, left: 0, right: 0, paddingTop: 20, paddingHorizontal: 20 },
  nextBtn: { borderRadius: 16, overflow: 'hidden', shadowColor: Colors.gold, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.4, shadowRadius: 12 },
  nextBtnDisabled: { shadowOpacity: 0 },
  nextBtnGrad: { paddingVertical: 18, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10 },
  nextBtnText: { fontSize: 16, fontWeight: '700' as const, color: Colors.background },
  nextBtnTextDisabled: { color: Colors.textMuted },
});
