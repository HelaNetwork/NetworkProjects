import Colors from '@/constants/Colors';
import { useWallet } from '@/context/WalletContext';
import { COUNTRIES } from '@/mocks/data';
import { runMobileWalletTransaction } from '@/services/mobileWallet';
import { useWalletStore } from '@/stores/wallet-store';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Web3MobileWallet } from '@solana-mobile/mobile-wallet-adapter-protocol-web3js';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { ArrowRight, Bell, Check, ChevronDown, Fingerprint, Gift, MapPin, User, X } from 'lucide-react-native';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput, TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const APP_IDENTITY = {
  name: 'Aeternum',
  uri: 'https://aeturnum.app',
  icon: 'favicon.ico',
};

const BACKEND_TOKEN_KEY = 'aeturnum_backend_token';
const DEFAULT_BACKEND_BASE_URL = 'https://hackjlu.vercel.app';
const BACKEND_BASE_URL = (process.env.EXPO_PUBLIC_BACKEND_BASE_URL ?? DEFAULT_BACKEND_BASE_URL).trim();

type JsonRecord = Record<string, unknown>;

async function requestJson(
  path: string,
  options: {
    method: 'POST' | 'PUT';
    body: JsonRecord;
    token?: string;
  },
): Promise<{ status: number; data: JsonRecord }> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 15000);

  try {
    const response = await fetch(`${BACKEND_BASE_URL}${path}`, {
      method: options.method,
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        ...(options.token ? { Authorization: `Bearer ${options.token}` } : {}),
      },
      body: JSON.stringify(options.body),
      signal: controller.signal,
    });

    const raw = await response.text();
    const data = raw ? safeParseJson(raw) : {};

    if (!response.ok) {
      const message = typeof data?.message === 'string'
        ? data.message
        : `Request failed (${response.status})`;
      throw new Error(message);
    }

    return { status: response.status, data };
  } finally {
    clearTimeout(timeout);
  }
}

function safeParseJson(raw: string): JsonRecord {
  try {
    return JSON.parse(raw) as JsonRecord;
  } catch {
    return { raw };
  }
}

export default function SetupScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { setup, isSettingUp, walletAddress, isConnected, isSetupComplete } = useWallet();

  useEffect(() => {
    if (isConnected && isSetupComplete) {
      router.replace('/(tabs)/home' as any);
    }
  }, [isConnected, isSetupComplete]);

  const [username, setUsername] = useState('');
  const [country, setCountry] = useState('');
  const [referralCode, setReferralCode] = useState('');
  const [notifications, setNotifications] = useState(true);
  const [biometrics, setBiometrics] = useState(false);
  const [countryModal, setCountryModal] = useState(false);
  const [countrySearch, setCountrySearch] = useState('');
  const [usernameError, setUsernameError] = useState('');

  const filteredCountries = COUNTRIES.filter(c =>
    c.toLowerCase().includes(countrySearch.toLowerCase())
  );

  const validateUsername = (val: string) => {
    if (val.length === 0) return '';
    if (val.length < 3) return 'Minimum 3 characters';
    if (val.length > 20) return 'Maximum 20 characters';
    if (!/^[a-zA-Z0-9_]+$/.test(val)) return 'Only letters, numbers, underscores';
    return '';
  };

  const handleUsernameChange = (val: string) => {
    setUsername(val.toLowerCase());
    setUsernameError(validateUsername(val));
  };

  const canSubmit = username.length >= 3 && usernameError === '';

  const handleSubmit = async () => {
    if (!canSubmit) return;

    try {
      const { authToken, isDevnet, setWalletData, walletType, publicKeyBase58 } = useWalletStore.getState();
      const chain = isDevnet ? 'solana:devnet' : 'solana:mainnet-beta';

      const signResult = await runMobileWalletTransaction(async (wallet: Web3MobileWallet) => {
        const authResult = await wallet.authorize({
          chain,
          identity: APP_IDENTITY,
          auth_token: authToken ?? undefined,
        });

        const message = 'Sign into mechanical turks';
        const payload = new TextEncoder().encode(message);
        const signatures = await wallet.signMessages({
          addresses: [authResult.accounts[0].address],
          payloads: [payload],
        });

        return {
          authToken: authResult.auth_token ?? authToken ?? '',
          message,
          signatureBase64: Buffer.from(signatures[0]).toString('base64'),
        };
      });

      if (walletType && publicKeyBase58) {
        setWalletData({
          walletType,
          publicKeyBase58,
          authToken: signResult.authToken,
        });
      }

      const signinPayload = {
        signature: signResult.signatureBase64,
        publicKey: publicKeyBase58 ?? walletAddress ?? '',
      };
      console.log('[Setup] /signin payload:', signinPayload);

      let signinData: JsonRecord | null = null;
      try {
        const signinResponse = await requestJson('/user/signin', {
          method: 'POST',
          body: signinPayload,
        });
        signinData = signinResponse.data;
        console.log('[Setup] /signin status:', signinResponse.status);
        console.log('[Setup] /signin response:', signinData);
      } catch (firstError) {
        // One retry helps with flaky mobile network transitions.
        const signinRetry = await requestJson('/user/signin', {
          method: 'POST',
          body: signinPayload,
        });
        signinData = signinRetry.data;
        console.log('[Setup] /signin retry status:', signinRetry.status);
        console.log('[Setup] /signin retry response:', signinData);
        console.log('[Setup] /signin first error:', firstError);
      }

      const token = signinData?.token ? String(signinData.token) : '';
      if (!token) {
        throw new Error('Signin succeeded but token was missing in response');
      }

      await AsyncStorage.setItem(BACKEND_TOKEN_KEY, token);

      const profilePayload = {
        username,
        country: country || undefined,
      };
      console.log('[Setup] /user/profile payload:', profilePayload);

      const profileResponse = await requestJson('/user/profile', {
        method: 'PUT',
        body: profilePayload,
        token,
      });
      console.log('[Setup] /user/profile status:', profileResponse.status);
      console.log('[Setup] /user/profile response:', profileResponse.data);

      await setup({
        username,
        country: country || undefined,
        walletAddress: walletAddress ?? '',
        joinDate: new Date().toISOString().split('T')[0],
      } as any);
      router.replace('/(tabs)/home' as any);
    } catch (e) {
      console.log('[Setup] Error:', e);
      Alert.alert(
        'Setup failed',
        `Could not reach backend at ${BACKEND_BASE_URL}. Check device internet, VPN/Private DNS, and backend availability.\n\n${e instanceof Error ? e.message : 'Unknown error'}`,
      );
    }
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <LinearGradient colors={['#0C0D18', '#08090D']} style={StyleSheet.absoluteFill} />

      <ScrollView
        contentContainerStyle={[styles.scroll, { paddingBottom: insets.bottom + 40 }]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.header}>
          <View style={styles.stepBadge}>
            <Text style={styles.stepText}>PROFILE SETUP</Text>
          </View>
          <Text style={styles.title}>Create Your Identity</Text>
          <Text style={styles.subtitle}>
            Set up your profile to begin trading tokenized esports markets
          </Text>
        </View>

        <View style={styles.walletCard}>
          <Text style={styles.walletLabel}>Connected Wallet</Text>
          <Text style={styles.walletAddress}>{walletAddress ?? 'Not connected'}</Text>
          <View style={styles.connectedDot} />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionLabel}>REQUIRED</Text>

          <View style={styles.inputGroup}>
            <View style={styles.inputIcon}>
              <User size={16} color={Colors.gold} />
            </View>
            <View style={styles.inputFlex}>
              <Text style={styles.inputLabel}>Username *</Text>
              <TextInput
                style={styles.input}
                value={username}
                onChangeText={handleUsernameChange}
                placeholder="e.g. cryptobuilder"
                placeholderTextColor={Colors.textDisabled}
                autoCapitalize="none"
                autoCorrect={false}
                maxLength={20}
              />
            </View>
          </View>
          {usernameError !== '' && (
            <Text style={styles.errorText}>{usernameError}</Text>
          )}
          {username.length > 0 && usernameError === '' && (
            <Text style={styles.successText}>@{username} is available ✓</Text>
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionLabel}>OPTIONAL</Text>

          <TouchableOpacity
            style={styles.inputGroup}
            onPress={() => setCountryModal(true)}
            activeOpacity={0.8}
          >
            <View style={styles.inputIcon}>
              <MapPin size={16} color={Colors.cyan} />
            </View>
            <View style={[styles.inputFlex, { justifyContent: 'center' }]}>
              <Text style={styles.inputLabel}>Country</Text>
              <Text style={[styles.input, !country && { color: Colors.textDisabled }]}>
                {country || 'Select your country'}
              </Text>
            </View>
            <ChevronDown size={16} color={Colors.textMuted} />
          </TouchableOpacity>

          <View style={[styles.inputGroup, { marginTop: 10 }]}>
            <View style={styles.inputIcon}>
              <Gift size={16} color={Colors.purple} />
            </View>
            <View style={styles.inputFlex}>
              <Text style={styles.inputLabel}>Referral Code</Text>
              <TextInput
                style={styles.input}
                value={referralCode}
                onChangeText={setReferralCode}
                placeholder="Enter code (optional)"
                placeholderTextColor={Colors.textDisabled}
                autoCapitalize="characters"
                maxLength={12}
              />
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionLabel}>PREFERENCES</Text>

          <View style={styles.toggleRow}>
            <View style={styles.toggleLeft}>
              <View style={[styles.toggleIcon, { backgroundColor: `${Colors.cyan}22` }]}>
                <Bell size={16} color={Colors.cyan} />
              </View>
              <View>
                <Text style={styles.toggleTitle}>Push Notifications</Text>
                <Text style={styles.toggleSub}>Odds shifts, fills, and rewards</Text>
              </View>
            </View>
            <Switch
              value={notifications}
              onValueChange={setNotifications}
              trackColor={{ false: Colors.border, true: Colors.cyan }}
              thumbColor={Colors.white}
            />
          </View>

          {Platform.OS !== 'web' && (
            <View style={[styles.toggleRow, { marginTop: 10 }]}>
              <View style={styles.toggleLeft}>
                <View style={[styles.toggleIcon, { backgroundColor: `${Colors.green}22` }]}>
                  <Fingerprint size={16} color={Colors.green} />
                </View>
                <View>
                  <Text style={styles.toggleTitle}>Biometric Login</Text>
                  <Text style={styles.toggleSub}>Face ID / Fingerprint</Text>
                </View>
              </View>
              <Switch
                value={biometrics}
                onValueChange={setBiometrics}
                trackColor={{ false: Colors.border, true: Colors.green }}
                thumbColor={Colors.white}
              />
            </View>
          )}
        </View>

        <TouchableOpacity
          style={[styles.submitBtn, !canSubmit && styles.submitBtnDisabled]}
          onPress={handleSubmit}
          disabled={!canSubmit || isSettingUp}
          activeOpacity={0.85}
        >
          <LinearGradient
            colors={canSubmit ? ['#D4AF37', '#A88C28'] : [Colors.border, Colors.border]}
            style={styles.submitGrad}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
          >
            {isSettingUp ? (
              <ActivityIndicator color={canSubmit ? Colors.background : Colors.textMuted} size="small" />
            ) : (
              <>
                <Text style={[styles.submitText, !canSubmit && styles.submitTextDisabled]}>
                  Enter AETURNUM
                </Text>
                <ArrowRight size={18} color={canSubmit ? Colors.background : Colors.textMuted} />
              </>
            )}
          </LinearGradient>
        </TouchableOpacity>
      </ScrollView>

      <Modal visible={countryModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContainer, { paddingBottom: insets.bottom + 16 }]}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Country</Text>
              <TouchableOpacity onPress={() => setCountryModal(false)}>
                <X size={20} color={Colors.textSecondary} />
              </TouchableOpacity>
            </View>
            <View style={styles.searchBox}>
              <TextInput
                style={styles.searchInput}
                value={countrySearch}
                onChangeText={setCountrySearch}
                placeholder="Search countries..."
                placeholderTextColor={Colors.textDisabled}
              />
            </View>
            <FlatList
              data={filteredCountries}
              keyExtractor={(item) => item}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[styles.countryItem, country === item && styles.countryItemSelected]}
                  onPress={() => {
                    setCountry(item);
                    setCountryModal(false);
                    setCountrySearch('');
                  }}
                >
                  <Text style={[styles.countryText, country === item && styles.countryTextSelected]}>
                    {item}
                  </Text>
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
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scroll: {
    padding: 24,
  },
  header: {
    marginBottom: 28,
    marginTop: 8,
  },
  stepBadge: {
    backgroundColor: Colors.goldGlow,
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 4,
    alignSelf: 'flex-start',
    marginBottom: 12,
    borderWidth: 1,
    borderColor: Colors.goldDark,
  },
  stepText: {
    fontSize: 10,
    fontWeight: '700' as const,
    color: Colors.gold,
    letterSpacing: 2,
  },
  title: {
    fontSize: 28,
    fontWeight: '700' as const,
    color: Colors.text,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 15,
    color: Colors.textSecondary,
    lineHeight: 22,
  },
  walletCard: {
    backgroundColor: Colors.card,
    borderRadius: 14,
    padding: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: Colors.border,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  walletLabel: {
    fontSize: 12,
    color: Colors.textMuted,
    fontWeight: '500' as const,
  },
  walletAddress: {
    fontSize: 13,
    color: Colors.cyan,
    fontWeight: '600' as const,
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
  },
  connectedDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.green,
  },
  section: {
    marginBottom: 24,
  },
  sectionLabel: {
    fontSize: 11,
    fontWeight: '700' as const,
    color: Colors.textMuted,
    letterSpacing: 1.5,
    marginBottom: 12,
  },
  inputGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.card,
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: 12,
  },
  inputIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: Colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  inputFlex: {
    flex: 1,
  },
  inputLabel: {
    fontSize: 11,
    color: Colors.textMuted,
    marginBottom: 2,
    fontWeight: '500' as const,
  },
  input: {
    fontSize: 15,
    color: Colors.text,
    padding: 0,
  },
  errorText: {
    fontSize: 12,
    color: Colors.red,
    marginTop: 6,
    marginLeft: 4,
  },
  successText: {
    fontSize: 12,
    color: Colors.green,
    marginTop: 6,
    marginLeft: 4,
  },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.card,
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  toggleLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  toggleIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  toggleTitle: {
    fontSize: 15,
    fontWeight: '600' as const,
    color: Colors.text,
    marginBottom: 2,
  },
  toggleSub: {
    fontSize: 12,
    color: Colors.textMuted,
  },
  submitBtn: {
    borderRadius: 16,
    overflow: 'hidden',
    marginTop: 8,
    shadowColor: Colors.gold,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
  },
  submitBtnDisabled: {
    shadowOpacity: 0,
    elevation: 0,
  },
  submitGrad: {
    paddingVertical: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  submitText: {
    fontSize: 17,
    fontWeight: '700' as const,
    color: Colors.background,
    letterSpacing: 0.5,
  },
  submitTextDisabled: {
    color: Colors.textMuted,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: Colors.overlay,
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: Colors.surface,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    maxHeight: '70%',
    borderTopWidth: 1,
    borderColor: Colors.border,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: Colors.text,
  },
  searchBox: {
    backgroundColor: Colors.card,
    borderRadius: 10,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  searchInput: {
    padding: 12,
    fontSize: 15,
    color: Colors.text,
  },
  countryItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 4,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  countryItemSelected: {
    backgroundColor: Colors.goldGlow,
  },
  countryText: {
    fontSize: 15,
    color: Colors.textSecondary,
  },
  countryTextSelected: {
    color: Colors.gold,
    fontWeight: '600' as const,
  },
});
