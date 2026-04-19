import Colors from '@/constants/Colors';
import { COUNTRIES, PROPERTY_TYPES } from '@/mocks/data';
import { createListingDraftStep1, uploadListingImage } from '@/services/listingDraft';
import { useListingDraftStore } from '@/stores/listing-draft-store';
import * as ImagePicker from 'expo-image-picker';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { ArrowLeft, ArrowRight, Building2, Check, ChevronDown, DollarSign, Image as ImageIcon, MapPin, X } from 'lucide-react-native';
import React, { useState } from 'react';
import {
  Alert,
  FlatList,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput, TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function ListStep1Screen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [propertyName, setPropertyName] = useState('');
  const [propertyType, setPropertyType] = useState('');
  const [country, setCountry] = useState('');
  const [city, setCity] = useState('');
  const [address, setAddress] = useState('');
  const [totalValue, setTotalValue] = useState('');
  const [description, setDescription] = useState('');
  const [yearBuilt, setYearBuilt] = useState('');
  const [areaSize, setAreaSize] = useState('');

  const [typeModal, setTypeModal] = useState(false);
  const [countryModal, setCountryModal] = useState(false);
  const [countrySearch, setCountrySearch] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [isUploadingPhotos, setIsUploadingPhotos] = useState(false);
  const [isUploadingProof, setIsUploadingProof] = useState(false);

  const setDraftId = useListingDraftStore(s => s.setDraftId);
  const setBasicInfo = useListingDraftStore(s => s.setBasicInfo);
  const mediaUploads = useListingDraftStore(s => s.mediaUploads);
  const legalDocs = useListingDraftStore(s => s.legalDocs);
  const setMediaUploads = useListingDraftStore(s => s.setMediaUploads);
  const setLegalDocs = useListingDraftStore(s => s.setLegalDocs);

  const filteredCountries = COUNTRIES.filter(c =>
    c.toLowerCase().includes(countrySearch.toLowerCase())
  );

  const canContinue = propertyName.length > 0 && propertyType !== '' && country !== ''
    && city.length > 0 && totalValue !== '' && description.length > 10;

  const handleUploadPhotos = async () => {
    if (isUploadingPhotos) return;

    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert('Permission required', 'Allow photo access to upload market images.');
      return;
    }

    try {
      setIsUploadingPhotos(true);
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsMultipleSelection: true,
        selectionLimit: 10,
        quality: 0.8,
      });

      if (result.canceled || !result.assets.length) return;

      const uploadedUrls = await Promise.all(
        result.assets.map(async (asset) => {
          return uploadListingImage({
            uri: asset.uri,
            name: asset.fileName ?? `market-${Date.now()}.jpg`,
            type: asset.mimeType ?? 'image/jpeg',
          });
        }),
      );

      const validUrls = uploadedUrls.filter(Boolean);
      if (!validUrls.length) {
        Alert.alert('Upload failed', 'No valid image URL was returned by server.');
        return;
      }

      const existingImages = mediaUploads?.images ?? [];
      const mergedImages = Array.from(new Set([...existingImages, ...validUrls]));
      setMediaUploads({
        coverImageUrl: mediaUploads?.coverImageUrl ?? mergedImages[0],
        images: mergedImages,
        videoUrl: mediaUploads?.videoUrl,
      });

      Alert.alert('Upload complete', `${validUrls.length} image(s) uploaded.`);
    } catch (error) {
      Alert.alert(
        'Photo upload failed',
        error instanceof Error ? error.message : 'Something went wrong while uploading photos.',
      );
    } finally {
      setIsUploadingPhotos(false);
    }
  };

  const handleUploadOwnershipProof = async () => {
    if (isUploadingProof) return;

    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert('Permission required', 'Allow photo access to upload ownership proof.');
      return;
    }

    try {
      setIsUploadingProof(true);
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsMultipleSelection: false,
        quality: 0.9,
      });

      if (result.canceled || !result.assets.length) return;

      const asset = result.assets[0];
      const uploadedUrl = await uploadListingImage({
        uri: asset.uri,
        name: asset.fileName ?? `ownership-${Date.now()}.jpg`,
        type: asset.mimeType ?? 'image/jpeg',
      });

      if (!uploadedUrl) {
        Alert.alert('Upload failed', 'No valid URL was returned by server.');
        return;
      }

      setLegalDocs({
        titleDeedUrl: legalDocs?.titleDeedUrl,
        ownershipProofUrl: uploadedUrl,
        complianceCertificateUrl: legalDocs?.complianceCertificateUrl,
      });

      Alert.alert('Uploaded', 'Ownership proof uploaded successfully.');
    } catch (error) {
      Alert.alert(
        'Document upload failed',
        error instanceof Error ? error.message : 'Something went wrong while uploading the document.',
      );
    } finally {
      setIsUploadingProof(false);
    }
  };

  const handleNext = async () => {
    if (!canContinue || isSaving) return;

    try {
      setIsSaving(true);

      const payload = {
        step: 1 as const,
        basicInfo: {
          name: propertyName.trim(),
          type: propertyType.trim().toLowerCase(),
          country: country.trim(),
          city: city.trim(),
          addressFull: address.trim() || undefined,
          description: description.trim(),
          yearBuilt: yearBuilt ? Number(yearBuilt) : undefined,
          areaSqft: areaSize ? Number(areaSize) : undefined,
        },
      };

      const draft = await createListingDraftStep1(payload);
      setDraftId(draft.id);
      setBasicInfo(payload.basicInfo);

      router.push('/list/step2' as any);
    } catch (error) {
      Alert.alert(
        'Unable to save step 1',
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
            <View key={s} style={[styles.stepDot, s === 1 && styles.stepDotActive, s < 1 && styles.stepDotDone]} />
          ))}
        </View>
        <Text style={styles.stepLabel}>1 / 4</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ padding: 20, paddingBottom: 100 }} keyboardShouldPersistTaps="handled">
        <Text style={styles.title}>Basic Information</Text>
        <Text style={styles.subtitle}>Tell us about the esports market you want to launch</Text>

        <View style={styles.section}>
          <Text style={styles.sectionLabel}>MARKET DETAILS</Text>

          <View style={styles.inputGroup}>
            <View style={styles.inputIcon}><Building2 size={16} color={Colors.gold} /></View>
            <View style={styles.inputFlex}>
              <Text style={styles.inputLabel}>Property Name *</Text>
              <TextInput
                style={styles.input}
                value={propertyName}
                onChangeText={setPropertyName}
                placeholder="e.g. Valorant Masters Grand Final"
                placeholderTextColor={Colors.textDisabled}
              />
            </View>
          </View>

          <TouchableOpacity style={[styles.inputGroup, { marginTop: 10 }]} onPress={() => setTypeModal(true)} activeOpacity={0.8}>
            <View style={styles.inputIcon}><Building2 size={16} color={Colors.cyan} /></View>
            <View style={[styles.inputFlex, { justifyContent: 'center' }]}>
              <Text style={styles.inputLabel}>Market Type *</Text>
              <Text style={[styles.input, !propertyType && { color: Colors.textDisabled }]}>
                {propertyType || 'Select type'}
              </Text>
            </View>
            <ChevronDown size={16} color={Colors.textMuted} />
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionLabel}>EVENT REGION</Text>

          <TouchableOpacity style={styles.inputGroup} onPress={() => setCountryModal(true)} activeOpacity={0.8}>
            <View style={styles.inputIcon}><MapPin size={16} color={Colors.green} /></View>
            <View style={[styles.inputFlex, { justifyContent: 'center' }]}>
              <Text style={styles.inputLabel}>Country *</Text>
              <Text style={[styles.input, !country && { color: Colors.textDisabled }]}>
                {country || 'Select country'}
              </Text>
            </View>
            <ChevronDown size={16} color={Colors.textMuted} />
          </TouchableOpacity>

          <View style={[styles.inputGroup, { marginTop: 10 }]}>
            <View style={styles.inputIcon}><MapPin size={16} color={Colors.cyan} /></View>
            <View style={styles.inputFlex}>
              <Text style={styles.inputLabel}>City *</Text>
              <TextInput
                style={styles.input}
                value={city}
                onChangeText={setCity}
                placeholder="e.g. Berlin"
                placeholderTextColor={Colors.textDisabled}
              />
            </View>
          </View>

          <View style={[styles.inputGroup, { marginTop: 10 }]}>
            <View style={styles.inputIcon}><MapPin size={16} color={Colors.textMuted} /></View>
            <View style={styles.inputFlex}>
              <Text style={styles.inputLabel}>Venue / Event Notes</Text>
              <TextInput
                style={styles.input}
                value={address}
                onChangeText={setAddress}
                placeholder="Optional context for this market"
                placeholderTextColor={Colors.textDisabled}
              />
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionLabel}>MARKET SIZE</Text>

          <View style={styles.inputGroup}>
            <View style={styles.inputIcon}><DollarSign size={16} color={Colors.gold} /></View>
            <View style={styles.inputFlex}>
              <Text style={styles.inputLabel}>Total Market Value (USD) *</Text>
              <TextInput
                style={styles.input}
                value={totalValue}
                onChangeText={setTotalValue}
                placeholder="e.g. 250000"
                placeholderTextColor={Colors.textDisabled}
                keyboardType="numeric"
              />
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionLabel}>DESCRIPTION</Text>
          <View style={styles.textAreaGroup}>
            <Text style={styles.textAreaLabel}>Market Description * (min 10 chars)</Text>
            <TextInput
              style={styles.textArea}
              value={description}
              onChangeText={setDescription}
              placeholder="Describe the matchup, settlement logic, and why this market matters..."
              placeholderTextColor={Colors.textDisabled}
              multiline
              numberOfLines={4}
            />
            <Text style={styles.charCount}>{description.length} / 500</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionLabel}>OPTIONAL</Text>
          <View style={styles.rowInputs}>
            <View style={[styles.inputGroup, { flex: 1 }]}>
              <View style={styles.inputFlex}>
                <Text style={styles.inputLabel}>Year Built</Text>
                <TextInput
                  style={styles.input}
                  value={yearBuilt}
                  onChangeText={setYearBuilt}
                  placeholder="e.g. 2020"
                  placeholderTextColor={Colors.textDisabled}
                  keyboardType="numeric"
                />
              </View>
            </View>
            <View style={[styles.inputGroup, { flex: 1, marginLeft: 10 }]}>
              <View style={styles.inputFlex}>
                <Text style={styles.inputLabel}>Area (sq ft)</Text>
                <TextInput
                  style={styles.input}
                  value={areaSize}
                  onChangeText={setAreaSize}
                  placeholder="e.g. 5000"
                  placeholderTextColor={Colors.textDisabled}
                  keyboardType="numeric"
                />
              </View>
            </View>
          </View>
        </View>

        <View style={styles.uploadSection}>
          <Text style={styles.sectionLabel}>DOCUMENTS</Text>
          <TouchableOpacity style={styles.uploadCard} activeOpacity={0.8} onPress={handleUploadPhotos}>
            <ImageIcon size={24} color={Colors.textMuted} />
            <Text style={styles.uploadTitle}>Market Images</Text>
            <Text style={styles.uploadSub}>
              {mediaUploads?.images?.length
                ? `${mediaUploads.images.length} photo(s) uploaded   `
                : 'Upload at least 1 image   '}
            </Text>
            <View style={styles.uploadBtn}>
              <Text style={styles.uploadBtnText}>{isUploadingPhotos ? 'Uploading...' : '+ Add Photos'}</Text>
            </View>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.uploadCard, { marginTop: 10 }]}
            activeOpacity={0.8}
            onPress={handleUploadOwnershipProof}
          >
            <Text style={styles.uploadDocIcon}>📋</Text>
            <Text style={styles.uploadTitle}>Ownership Proof</Text>
            <Text style={styles.uploadSub}>
              {legalDocs?.ownershipProofUrl ? 'Document uploaded       ' : 'Image upload supported   '}
            </Text>
            <View style={styles.uploadBtn}>
              <Text style={styles.uploadBtnText}>{isUploadingProof ? 'Uploading...' : '+ Upload Proof'}</Text>
            </View>
          </TouchableOpacity>
        </View>
      </ScrollView>

      <View style={[styles.bottomBar, { paddingBottom: insets.bottom + 12 }]}>
        <LinearGradient colors={['transparent', 'rgba(8,9,13,0.98)']} style={StyleSheet.absoluteFill} />
        <TouchableOpacity
          style={[styles.nextBtn, !canContinue && styles.nextBtnDisabled]}
          onPress={handleNext}
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
              {isSaving ? 'Saving Step 1...' : 'Continue to Market Tokenization'}
            </Text>
            <ArrowRight size={18} color={canContinue ? Colors.background : Colors.textMuted} />
          </LinearGradient>
        </TouchableOpacity>
      </View>

      <Modal visible={typeModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContainer, { paddingBottom: insets.bottom + 16 }]}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Market Type</Text>
              <TouchableOpacity onPress={() => setTypeModal(false)}><X size={20} color={Colors.textSecondary} /></TouchableOpacity>
            </View>
            {PROPERTY_TYPES.map(t => (
              <TouchableOpacity key={t} style={[styles.modalItem, propertyType === t && styles.modalItemSelected]}
                onPress={() => { setPropertyType(t); setTypeModal(false); }}>
                <Text style={[styles.modalItemText, propertyType === t && styles.modalItemTextSelected]}>{t}</Text>
                {propertyType === t && <Check size={16} color={Colors.gold} />}
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </Modal>

      <Modal visible={countryModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContainer, { paddingBottom: insets.bottom + 16 }]}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Country</Text>
              <TouchableOpacity onPress={() => { setCountryModal(false); setCountrySearch(''); }}><X size={20} color={Colors.textSecondary} /></TouchableOpacity>
            </View>
            <View style={styles.searchBox}>
              <TextInput
                style={styles.searchInput}
                value={countrySearch}
                onChangeText={setCountrySearch}
                placeholder="Search..."
                placeholderTextColor={Colors.textDisabled}
              />
            </View>
            <FlatList
              data={filteredCountries}
              keyExtractor={item => item}
              renderItem={({ item }) => (
                <TouchableOpacity style={[styles.modalItem, country === item && styles.modalItemSelected]}
                  onPress={() => { setCountry(item); setCountryModal(false); setCountrySearch(''); }}>
                  <Text style={[styles.modalItemText, country === item && styles.modalItemTextSelected]}>{item}</Text>
                  {country === item && <Check size={16} color={Colors.gold} />}
                </TouchableOpacity>
              )}
              showsVerticalScrollIndicator={false}
            />
          </View>
        </View>
      </Modal>
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
  rowInputs: { flexDirection: 'row' },
  textAreaGroup: {
    backgroundColor: Colors.card, borderRadius: 14, padding: 14,
    borderWidth: 1, borderColor: Colors.border,
  },
  textAreaLabel: { fontSize: 11, color: Colors.textMuted, marginBottom: 8, fontWeight: '500' as const },
  textArea: { fontSize: 14, color: Colors.text, minHeight: 100, textAlignVertical: 'top' },
  charCount: { fontSize: 11, color: Colors.textDisabled, textAlign: 'right', marginTop: 6 },
  uploadSection: { marginBottom: 20 },
  uploadCard: {
    backgroundColor: Colors.card, borderRadius: 14, padding: 18,
    borderWidth: 1, borderColor: Colors.border, alignItems: 'center',
    borderStyle: 'dashed',
  },
  uploadDocIcon: { fontSize: 28, marginBottom: 4 },
  uploadTitle: { fontSize: 15, fontWeight: '600' as const, color: Colors.text, marginVertical: 4 },
  uploadSub: { fontSize: 12, color: Colors.textMuted, marginBottom: 12 },
  uploadBtn: {
    backgroundColor: Colors.goldGlow, borderRadius: 8, paddingHorizontal: 16, paddingVertical: 8,
    borderWidth: 1, borderColor: Colors.goldDark,
  },
  uploadBtnText: { fontSize: 13, color: Colors.gold, fontWeight: '600' as const },
  bottomBar: { position: 'absolute', bottom: 0, left: 0, right: 0, paddingTop: 20, paddingHorizontal: 20 },
  nextBtn: { borderRadius: 16, overflow: 'hidden', shadowColor: Colors.gold, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.4, shadowRadius: 12 },
  nextBtnDisabled: { shadowOpacity: 0 },
  nextBtnGrad: { paddingVertical: 18, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10 },
  nextBtnText: { fontSize: 16, fontWeight: '700' as const, color: Colors.background },
  nextBtnTextDisabled: { color: Colors.textMuted },
  modalOverlay: { flex: 1, backgroundColor: Colors.overlay, justifyContent: 'flex-end' },
  modalContainer: {
    backgroundColor: Colors.surface, borderTopLeftRadius: 24, borderTopRightRadius: 24,
    padding: 20, maxHeight: '70%', borderTopWidth: 1, borderColor: Colors.border,
  },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  modalTitle: { fontSize: 18, fontWeight: '700' as const, color: Colors.text },
  searchBox: { backgroundColor: Colors.card, borderRadius: 10, marginBottom: 12, borderWidth: 1, borderColor: Colors.border },
  searchInput: { padding: 12, fontSize: 15, color: Colors.text },
  modalItem: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingVertical: 14, paddingHorizontal: 4, borderBottomWidth: 1, borderBottomColor: Colors.border,
  },
  modalItemSelected: { backgroundColor: Colors.goldGlow },
  modalItemText: { fontSize: 15, color: Colors.textSecondary },
  modalItemTextSelected: { color: Colors.gold, fontWeight: '600' as const },
});
