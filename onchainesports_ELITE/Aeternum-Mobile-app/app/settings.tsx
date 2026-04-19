import Colors from '@/constants/Colors';
import { useWallet } from '@/context/WalletContext';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import {
  ArrowLeft, Bell,
  ChevronRight,
  FileText,
  Fingerprint,
  Globe,
  HelpCircle,
  LogOut,
  Moon,
  Shield
} from 'lucide-react-native';
import React from 'react';
import {
  Alert, Platform,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function SettingsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const {
    notifications, setNotifications,
    biometrics, setBiometrics,
    darkMode, setDarkMode,
    network, setNetwork,
    walletAddress,
    disconnect, isDisconnecting,
  } = useWallet();

  const handleDisconnect = () => {
    Alert.alert(
      'Disconnect Wallet',
      'Are you sure you want to disconnect? You will need to reconnect to access your positions.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Disconnect',
          style: 'destructive',
          onPress: async () => {
            await disconnect();
            router.replace('/connect' as any);
          },
        },
      ]
    );
  };

  const networkOptions = [
    { value: 'devnet', label: 'Devnet', desc: 'For testing' },
    { value: 'mainnet', label: 'Mainnet', desc: 'Live network' },
  ] as const;

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <LinearGradient colors={['#0D0E1A', '#08090D']} style={StyleSheet.absoluteFill} />

      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <ArrowLeft size={20} color={Colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Settings</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ padding: 20, paddingBottom: insets.bottom + 40 }}>
        <View style={styles.walletCard}>
          <View style={styles.walletLeft}>
            <View style={styles.walletDotWrap}>
              <View style={styles.walletDot} />
            </View>
            <View>
              <Text style={styles.walletLabel}>Connected Wallet</Text>
              <Text style={styles.walletAddress}>{walletAddress ?? '—'}</Text>
            </View>
          </View>
          <View style={styles.connectedBadge}>
            <Text style={styles.connectedText}>Connected</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionLabel}>PREFERENCES</Text>

          <View style={styles.settingRow}>
            <View style={styles.settingLeft}>
              <View style={[styles.settingIcon, { backgroundColor: `${Colors.gold}22` }]}>
                <Bell size={16} color={Colors.gold} />
              </View>
              <View>
                <Text style={styles.settingTitle}>Push Notifications</Text>
                <Text style={styles.settingSub}>Odds alerts, order fills, reward updates</Text>
              </View>
            </View>
            <Switch
              value={notifications}
              onValueChange={setNotifications}
              trackColor={{ false: Colors.border, true: Colors.gold }}
              thumbColor={Colors.white}
            />
          </View>

          {Platform.OS !== 'web' && (
            <View style={[styles.settingRow, { marginTop: 8 }]}>
              <View style={styles.settingLeft}>
                <View style={[styles.settingIcon, { backgroundColor: `${Colors.green}22` }]}>
                  <Fingerprint size={16} color={Colors.green} />
                </View>
                <View>
                  <Text style={styles.settingTitle}>Biometric Login</Text>
                  <Text style={styles.settingSub}>Face ID / Touch ID</Text>
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

          <View style={[styles.settingRow, { marginTop: 8 }]}>
            <View style={styles.settingLeft}>
              <View style={[styles.settingIcon, { backgroundColor: `${Colors.cyan}22` }]}>
                <Moon size={16} color={Colors.cyan} />
              </View>
              <View>
                <Text style={styles.settingTitle}>Dark Mode</Text>
                <Text style={styles.settingSub}>Always on for best experience</Text>
              </View>
            </View>
            <Switch
              value={darkMode}
              onValueChange={setDarkMode}
              trackColor={{ false: Colors.border, true: Colors.cyan }}
              thumbColor={Colors.white}
            />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionLabel}>NETWORK</Text>
          <View style={styles.networkCard}>
            <View style={styles.networkHeader}>
              <View style={[styles.settingIcon, { backgroundColor: `${Colors.purple}22` }]}>
                <Globe size={16} color={Colors.purple} />
              </View>
              <Text style={styles.networkTitle}>Solana Network</Text>
            </View>
            <View style={styles.networkOptions}>
              {networkOptions.map((opt) => (
                <TouchableOpacity
                  key={opt.value}
                  style={[styles.networkOpt, network === opt.value && styles.networkOptActive]}
                  onPress={() => setNetwork(opt.value)}
                  activeOpacity={0.8}
                >
                  <View style={[styles.networkOptDot, { backgroundColor: opt.value === 'mainnet' ? Colors.green : Colors.gold }]} />
                  <View>
                    <Text style={[styles.networkOptLabel, network === opt.value && styles.networkOptLabelActive]}>
                      {opt.label}
                    </Text>
                    <Text style={styles.networkOptDesc}>{opt.desc}</Text>
                  </View>
                  {network === opt.value && (
                    <View style={styles.networkCheck}>
                      <View style={styles.networkCheckDot} />
                    </View>
                  )}
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionLabel}>SUPPORT</Text>
          {[
            { label: 'Security & Privacy', icon: Shield, color: Colors.green },
            { label: 'Help Center', icon: HelpCircle, color: Colors.cyan },
            { label: 'Terms of Service', icon: FileText, color: Colors.textMuted },
          ].map((item) => (
            <TouchableOpacity key={item.label} style={styles.menuItem} activeOpacity={0.8}>
              <View style={[styles.menuIcon, { backgroundColor: `${item.color}22` }]}>
                <item.icon size={16} color={item.color} />
              </View>
              <Text style={styles.menuLabel}>{item.label}</Text>
              <ChevronRight size={16} color={Colors.textMuted} />
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionLabel}>APP</Text>
          <View style={styles.appInfo}>
            <Text style={styles.appName}>AETURNUM</Text>
            <Text style={styles.appVersion}>Version 1.0.0 · Build 42</Text>
            <Text style={styles.appChain}>Solana · SPL Token Standard</Text>
          </View>
        </View>

        <TouchableOpacity
          style={styles.disconnectBtn}
          onPress={handleDisconnect}
          disabled={isDisconnecting}
          activeOpacity={0.85}
        >
          <LinearGradient
            colors={[Colors.redGlow, Colors.redGlow]}
            style={styles.disconnectGrad}
          >
            <LogOut size={18} color={Colors.red} />
            <Text style={styles.disconnectText}>
              {isDisconnecting ? 'Disconnecting...' : 'Disconnect Wallet'}
            </Text>
          </LinearGradient>
        </TouchableOpacity>
      </ScrollView>
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
  headerTitle: { fontSize: 18, fontWeight: '700' as const, color: Colors.text },
  walletCard: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    backgroundColor: Colors.card, borderRadius: 16, padding: 16,
    borderWidth: 1, borderColor: Colors.border, marginBottom: 28,
  },
  walletLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  walletDotWrap: {
    width: 36, height: 36, borderRadius: 18, backgroundColor: Colors.greenGlow,
    alignItems: 'center', justifyContent: 'center',
  },
  walletDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: Colors.green },
  walletLabel: { fontSize: 11, color: Colors.textMuted, marginBottom: 2 },
  walletAddress: { fontSize: 13, color: Colors.text, fontFamily: 'monospace', fontWeight: '600' as const },
  connectedBadge: {
    backgroundColor: Colors.greenGlow, borderRadius: 8, paddingHorizontal: 10, paddingVertical: 5,
    borderWidth: 1, borderColor: Colors.green,
  },
  connectedText: { fontSize: 12, color: Colors.green, fontWeight: '600' as const },
  section: { marginBottom: 24 },
  sectionLabel: { fontSize: 11, fontWeight: '700' as const, color: Colors.textMuted, letterSpacing: 1.5, marginBottom: 10 },
  settingRow: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    backgroundColor: Colors.card, borderRadius: 14, padding: 14,
    borderWidth: 1, borderColor: Colors.border,
  },
  settingLeft: { flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1, marginRight: 10 },
  settingIcon: {
    width: 38, height: 38, borderRadius: 11, alignItems: 'center', justifyContent: 'center',
  },
  settingTitle: { fontSize: 15, fontWeight: '600' as const, color: Colors.text, marginBottom: 2 },
  settingSub: { fontSize: 12, color: Colors.textMuted },
  networkCard: {
    backgroundColor: Colors.card, borderRadius: 16, padding: 16,
    borderWidth: 1, borderColor: Colors.border,
  },
  networkHeader: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 14 },
  networkTitle: { fontSize: 15, fontWeight: '600' as const, color: Colors.text },
  networkOptions: { flexDirection: 'row', gap: 10 },
  networkOpt: {
    flex: 1, backgroundColor: Colors.surface, borderRadius: 12, padding: 14,
    borderWidth: 1, borderColor: Colors.border, flexDirection: 'row', alignItems: 'center', gap: 10,
  },
  networkOptActive: { borderColor: Colors.gold, backgroundColor: Colors.goldGlow },
  networkOptDot: { width: 8, height: 8, borderRadius: 4 },
  networkOptLabel: { fontSize: 14, fontWeight: '600' as const, color: Colors.textMuted, marginBottom: 2 },
  networkOptLabelActive: { color: Colors.text },
  networkOptDesc: { fontSize: 11, color: Colors.textDisabled },
  networkCheck: {
    marginLeft: 'auto' as any,
    width: 18, height: 18, borderRadius: 9, borderWidth: 2, borderColor: Colors.gold,
    alignItems: 'center', justifyContent: 'center',
  },
  networkCheckDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: Colors.gold },
  menuItem: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    backgroundColor: Colors.card, borderRadius: 14, padding: 14,
    borderWidth: 1, borderColor: Colors.border, marginBottom: 8,
  },
  menuIcon: { width: 36, height: 36, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  menuLabel: { flex: 1, fontSize: 15, fontWeight: '500' as const, color: Colors.text },
  appInfo: {
    backgroundColor: Colors.card, borderRadius: 14, padding: 16,
    borderWidth: 1, borderColor: Colors.border, alignItems: 'center',
  },
  appName: { fontSize: 18, fontWeight: '800' as const, color: Colors.gold, letterSpacing: 4, marginBottom: 4 },
  appVersion: { fontSize: 13, color: Colors.textMuted, marginBottom: 4 },
  appChain: { fontSize: 12, color: Colors.textDisabled },
  disconnectBtn: {
    borderRadius: 16, overflow: 'hidden', borderWidth: 1, borderColor: Colors.red,
  },
  disconnectGrad: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 10, paddingVertical: 16,
  },
  disconnectText: { fontSize: 16, fontWeight: '700' as const, color: Colors.red },
});
