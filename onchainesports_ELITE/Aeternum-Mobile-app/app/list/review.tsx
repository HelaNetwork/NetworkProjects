import Colors from '@/constants/Colors';
import { submitListingDraft, updateListingDraft } from '@/services/listingDraft';
import { useListingDraftStore } from '@/stores/listing-draft-store';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { ArrowLeft, Building2, Check, FileText, Layers, Send, TrendingUp } from 'lucide-react-native';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function ReviewScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [confirmedInfo, setConfirmedInfo] = useState(false);
  const [confirmedTerms, setConfirmedTerms] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const draftId = useListingDraftStore(s => s.draftId);
  const basicInfo = useListingDraftStore(s => s.basicInfo);
  const tokenomics = useListingDraftStore(s => s.tokenomics);
  const mediaUploads = useListingDraftStore(s => s.mediaUploads);
  const legalDocs = useListingDraftStore(s => s.legalDocs);
  const resetDraftStore = useListingDraftStore(s => s.reset);

  const canSubmit = confirmedInfo && confirmedTerms;

  const handleSubmit = async () => {
    if (!canSubmit) return;

    if (!draftId) {
      Alert.alert('Missing draft', 'Please complete previous steps before submitting.');
      router.replace('/list/step1' as any);
      return;
    }

    try {
      setIsSubmitting(true);

      await updateListingDraft(draftId, {
        step: 4,
        legalDocs: {
          titleDeedUrl: legalDocs?.titleDeedUrl,
          ownershipProofUrl: legalDocs?.ownershipProofUrl,
          complianceCertificateUrl: legalDocs?.complianceCertificateUrl,
        },
      });

      await submitListingDraft(draftId);
      resetDraftStore();

      setIsSuccess(true);
      setTimeout(() => router.replace('/(tabs)/listings' as any), 2500);
    } catch (error) {
      Alert.alert(
        'Unable to submit market',
        error instanceof Error ? error.message : 'Something went wrong. Please try again.',
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSuccess) {
    return (
      <View style={[styles.successScreen, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
        <LinearGradient colors={['#0D0E1A', '#08090D']} style={StyleSheet.absoluteFill} />
        <View style={styles.successIcon}>
          <LinearGradient colors={['#D4AF37', '#A88C28']} style={styles.successIconGrad}>
            <Send size={36} color={Colors.background} />
          </LinearGradient>
        </View>
        <Text style={styles.successTitle}>Market Submitted!</Text>
        <Text style={styles.successSub}>
          Your market is now under review.{'\n'}We'll notify you within 1-3 business days.
        </Text>
        <View style={styles.successSteps}>
          {[
            { icon: '📋', text: 'Documents under review' },
            { icon: '✅', text: 'Verification in progress' },
            { icon: '🚀', text: 'Market goes live' },
          ].map((s, i) => (
            <View key={i} style={styles.successStep}>
              <Text style={styles.successStepIcon}>{s.icon}</Text>
              <Text style={styles.successStepText}>{s.text}</Text>
            </View>
          ))}
        </View>
        <Text style={styles.successRedirect}>Redirecting to My Markets...</Text>
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
        <View style={styles.stepIndicator}>
          {[1, 2, 3, 4].map(s => (
            <View key={s} style={[styles.stepDot, s === 4 && styles.stepDotActive, s < 4 && styles.stepDotDone]} />
          ))}
        </View>
        <Text style={styles.stepLabel}>4 / 4</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ padding: 20, paddingBottom: 120 }}>
        <Text style={styles.title}>Review & Submit</Text>
        <Text style={styles.subtitle}>Review your market before submitting for approval</Text>

        {[
          {
            icon: Building2,
            color: Colors.gold,
            title: 'Market Information',
            items: [
              { label: 'Name', value: basicInfo?.name || '—' },
              { label: 'Type', value: basicInfo?.type || '—' },
              { label: 'Location', value: [basicInfo?.city, basicInfo?.country].filter(Boolean).join(', ') || '—' },
              { label: 'Address', value: basicInfo?.addressFull || '—' },
            ],
          },
          {
            icon: Layers,
            color: Colors.cyan,
            title: 'Token Structure',
            items: [
              { label: 'Tokenized Amount', value: tokenomics?.totalValuation ? `$${tokenomics.totalValuation.toLocaleString()}` : '—' },
              { label: 'Total Shares', value: tokenomics?.totalShares ? tokenomics.totalShares.toLocaleString() : '—' },
              { label: 'Price per Share', value: tokenomics?.pricePerShare ? `$${tokenomics.pricePerShare.toLocaleString()}` : '—' },
              { label: 'Available Shares', value: tokenomics?.availableShares ? tokenomics.availableShares.toLocaleString() : '—' },
            ],
          },
          {
            icon: TrendingUp,
            color: Colors.green,
            title: 'Rewards Model',
            items: [
              { label: 'Projected Yield', value: tokenomics?.yieldPercent ? `${tokenomics.yieldPercent}% APY` : '—' },
              { label: 'Token Model', value: tokenomics?.tokenModel || '—' },
              { label: 'Draft Step', value: '3 / 4' },
              { label: 'Status', value: 'Draft' },
            ],
          },
          {
            icon: FileText,
            color: Colors.purple,
            title: 'Documents',
            items: [
              { label: 'Ownership Proof', value: legalDocs?.ownershipProofUrl ? '✓ Uploaded' : 'Not uploaded' },
              { label: 'Title Deed', value: legalDocs?.titleDeedUrl ? '✓ Uploaded' : 'Not uploaded' },
              { label: 'Property Photos', value: mediaUploads?.images?.length ? `✓ ${mediaUploads.images.length} photo(s)` : 'No photos uploaded' },
            ],
          },
        ].map((section) => (
          <View key={section.title} style={styles.reviewCard}>
            <View style={styles.reviewCardHeader}>
              <View style={[styles.reviewIcon, { backgroundColor: `${section.color}22` }]}>
                <section.icon size={16} color={section.color} />
              </View>
              <Text style={styles.reviewCardTitle}>{section.title}</Text>
              <TouchableOpacity style={styles.editLink}>
                <Text style={styles.editLinkText}>Edit</Text>
              </TouchableOpacity>
            </View>
            {section.items.map((item) => (
              <View key={item.label} style={styles.reviewRow}>
                <Text style={styles.reviewLabel}>{item.label}</Text>
                <Text style={styles.reviewVal}>{item.value}</Text>
              </View>
            ))}
          </View>
        ))}

        <View style={styles.section}>
          <Text style={styles.sectionLabel}>CONFIRMATIONS REQUIRED</Text>

          <TouchableOpacity
            style={styles.checkRow}
            onPress={() => setConfirmedInfo(!confirmedInfo)}
            activeOpacity={0.8}
          >
            <View style={[styles.checkbox, confirmedInfo && styles.checkboxChecked]}>
              {confirmedInfo && <Check size={12} color={Colors.background} strokeWidth={3} />}
            </View>
            <Text style={styles.checkText}>
              I confirm that all information provided is accurate and legally valid
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.checkRow, { marginTop: 8 }]}
            onPress={() => setConfirmedTerms(!confirmedTerms)}
            activeOpacity={0.8}
          >
            <View style={[styles.checkbox, confirmedTerms && styles.checkboxChecked]}>
              {confirmedTerms && <Check size={12} color={Colors.background} strokeWidth={3} />}
            </View>
            <Text style={styles.checkText}>
              I agree to the AETURNUM tokenization terms and understand the legal obligations of creating this market
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.reviewNote}>
          <Text style={styles.reviewNoteTitle}>📋 What happens next?</Text>
          <Text style={styles.reviewNoteText}>
            Our compliance team will review your market submission within 1-3 business days. You'll receive notifications about status updates. Once approved, your market goes live on the exchange.
          </Text>
        </View>
      </ScrollView>

      <View style={[styles.bottomBar, { paddingBottom: insets.bottom + 12 }]}>
        <LinearGradient colors={['transparent', 'rgba(8,9,13,0.98)']} style={StyleSheet.absoluteFill} />
        <TouchableOpacity
          style={[styles.submitBtn, !canSubmit && styles.submitBtnDisabled]}
          onPress={handleSubmit}
          disabled={!canSubmit || isSubmitting}
          activeOpacity={0.85}
        >
          <LinearGradient
            colors={canSubmit ? ['#D4AF37', '#A88C28'] : [Colors.border, Colors.border]}
            style={styles.submitBtnGrad}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
          >
            {isSubmitting ? (
              <ActivityIndicator color={Colors.background} size="small" />
            ) : (
              <>
                <Send size={18} color={canSubmit ? Colors.background : Colors.textMuted} />
                <Text style={[styles.submitBtnText, !canSubmit && styles.submitBtnTextDisabled]}>
                  Submit for Review
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
  successScreen: { flex: 1, backgroundColor: Colors.background, alignItems: 'center', justifyContent: 'center', padding: 40 },
  successIcon: { width: 90, height: 90, borderRadius: 45, overflow: 'hidden', marginBottom: 24, shadowColor: Colors.gold, shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.6, shadowRadius: 20 },
  successIconGrad: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  successTitle: { fontSize: 28, fontWeight: '800' as const, color: Colors.text, marginBottom: 10 },
  successSub: { fontSize: 15, color: Colors.textSecondary, textAlign: 'center', lineHeight: 22, marginBottom: 28 },
  successSteps: { width: '100%', gap: 10, marginBottom: 24 },
  successStep: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: Colors.card, borderRadius: 12, padding: 14, borderWidth: 1, borderColor: Colors.border },
  successStepIcon: { fontSize: 22 },
  successStepText: { fontSize: 14, color: Colors.textSecondary },
  successRedirect: { fontSize: 13, color: Colors.textDisabled },
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
  reviewCard: {
    backgroundColor: Colors.card, borderRadius: 16, padding: 16,
    borderWidth: 1, borderColor: Colors.border, marginBottom: 14,
  },
  reviewCardHeader: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 14 },
  reviewIcon: {
    width: 32, height: 32, borderRadius: 8, alignItems: 'center', justifyContent: 'center',
  },
  reviewCardTitle: { fontSize: 15, fontWeight: '700' as const, color: Colors.text, flex: 1 },
  editLink: {
    backgroundColor: Colors.surface, borderRadius: 6, paddingHorizontal: 10, paddingVertical: 4,
    borderWidth: 1, borderColor: Colors.border,
  },
  editLinkText: { fontSize: 12, color: Colors.textMuted },
  reviewRow: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: Colors.border,
  },
  reviewLabel: { fontSize: 13, color: Colors.textMuted },
  reviewVal: { fontSize: 13, fontWeight: '600' as const, color: Colors.text },
  section: { marginBottom: 22 },
  sectionLabel: { fontSize: 11, fontWeight: '700' as const, color: Colors.textMuted, letterSpacing: 1.5, marginBottom: 10 },
  checkRow: {
    flexDirection: 'row', alignItems: 'flex-start', gap: 12,
    backgroundColor: Colors.card, padding: 14, borderRadius: 12,
    borderWidth: 1, borderColor: Colors.border,
  },
  checkbox: {
    width: 22, height: 22, borderRadius: 6, borderWidth: 2, borderColor: Colors.border,
    alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 1,
  },
  checkboxChecked: { backgroundColor: Colors.gold, borderColor: Colors.gold },
  checkText: { fontSize: 14, color: Colors.textSecondary, lineHeight: 21, flex: 1 },
  reviewNote: {
    backgroundColor: Colors.card, borderRadius: 14, padding: 16,
    borderWidth: 1, borderColor: Colors.border, marginBottom: 20,
  },
  reviewNoteTitle: { fontSize: 14, fontWeight: '700' as const, color: Colors.text, marginBottom: 8 },
  reviewNoteText: { fontSize: 13, color: Colors.textSecondary, lineHeight: 20 },
  bottomBar: { position: 'absolute', bottom: 0, left: 0, right: 0, paddingTop: 20, paddingHorizontal: 20 },
  submitBtn: { borderRadius: 16, overflow: 'hidden', shadowColor: Colors.gold, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.4, shadowRadius: 12 },
  submitBtnDisabled: { shadowOpacity: 0 },
  submitBtnGrad: { paddingVertical: 18, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10 },
  submitBtnText: { fontSize: 16, fontWeight: '700' as const, color: Colors.background },
  submitBtnTextDisabled: { color: Colors.textMuted },
});
