import Colors from '@/constants/Colors';
import { useWallet } from '@/context/WalletContext';
import { WALLET_OPTIONS } from '@/mocks/data';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { Check, ChevronRight, Shield, Wifi } from 'lucide-react-native';
import React, { useRef, useState } from 'react';
import {
  ActivityIndicator,
  Animated,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function ConnectScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { connect, isConnecting } = useWallet();
  const [selectedWallet, setSelectedWallet] = useState<string | null>(null);
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [acceptedRisk, setAcceptedRisk] = useState(false);

  const scaleAnims = useRef(WALLET_OPTIONS.map(() => new Animated.Value(1))).current;

  const canConnect = selectedWallet !== null && acceptedTerms && acceptedRisk;

  const handleWalletPress = (id: string, index: number) => {
    setSelectedWallet(id);
    Animated.sequence([
      Animated.timing(scaleAnims[index], { toValue: 0.96, duration: 80, useNativeDriver: true }),
      Animated.timing(scaleAnims[index], { toValue: 1, duration: 80, useNativeDriver: true }),
    ]).start();
  };

  const handleConnect = async () => {
    if (!canConnect || !selectedWallet) return;
    try {
      await connect(selectedWallet);
      router.replace('/setup' as any);
    } catch (e) {
      console.log('[Connect] Error:', e);
    }
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <LinearGradient
        colors={['#0C0D18', '#08090D']}
        style={StyleSheet.absoluteFill}
      />

      <ScrollView
        contentContainerStyle={[styles.scroll, { paddingBottom: insets.bottom + 24 }]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <View style={styles.iconBadge}>
            <LinearGradient colors={['#D4AF37', '#8B6914']} style={styles.iconGrad}>
              <Text style={styles.iconText}>Æ</Text>
            </LinearGradient>
          </View>
          <Text style={styles.title}>Connect Wallet</Text>
          <Text style={styles.subtitle}>
            Connect your Solana wallet to start trading tokenized esports markets
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionLabel}>SELECT WALLET</Text>
          {WALLET_OPTIONS.map((wallet, i) => {
            const isSelected = selectedWallet === wallet.id;
            return (
              <Animated.View key={wallet.id} style={{ transform: [{ scale: scaleAnims[i] }] }}>
                <TouchableOpacity
                  style={[styles.walletCard, isSelected && styles.walletCardSelected]}
                  onPress={() => handleWalletPress(wallet.id, i)}
                  activeOpacity={0.9}
                >
                  {isSelected && (
                    <LinearGradient
                      colors={[Colors.goldGlow, 'transparent']}
                      style={StyleSheet.absoluteFill}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                    />
                  )}
                  <View style={styles.walletLeft}>
                    <View style={[styles.walletIcon, isSelected && styles.walletIconSelected]}>
                      <Text style={styles.walletEmoji}>{wallet.icon}</Text>
                    </View>
                    <View>
                      <Text style={styles.walletName}>{wallet.name}</Text>
                      <Text style={styles.walletDesc}>{wallet.description}</Text>
                    </View>
                  </View>
                  <View style={[styles.radioOuter, isSelected && styles.radioOuterSelected]}>
                    {isSelected && <View style={styles.radioInner} />}
                  </View>
                </TouchableOpacity>
              </Animated.View>
            );
          })}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionLabel}>AGREEMENTS</Text>

          <TouchableOpacity
            style={styles.checkRow}
            onPress={() => setAcceptedTerms(!acceptedTerms)}
            activeOpacity={0.8}
          >
            <View style={[styles.checkbox, acceptedTerms && styles.checkboxChecked]}>
              {acceptedTerms && <Check size={12} color={Colors.background} strokeWidth={3} />}
            </View>
            <Text style={styles.checkText}>
              I agree to the{' '}
              <Text style={styles.checkLink}>Terms of Service</Text>
              {' '}and{' '}
              <Text style={styles.checkLink}>Privacy Policy</Text>
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.checkRow}
            onPress={() => setAcceptedRisk(!acceptedRisk)}
            activeOpacity={0.8}
          >
            <View style={[styles.checkbox, acceptedRisk && styles.checkboxChecked]}>
              {acceptedRisk && <Check size={12} color={Colors.background} strokeWidth={3} />}
            </View>
            <Text style={styles.checkText}>
              I understand that esports market trading is risky and I may lose capital
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.securityRow}>
          <Shield size={14} color={Colors.green} />
          <Text style={styles.securityText}>
            Non-custodial · Your keys, your assets · 256-bit encrypted
          </Text>
        </View>

        <TouchableOpacity
          style={[styles.connectBtn, !canConnect && styles.connectBtnDisabled]}
          onPress={handleConnect}
          disabled={!canConnect || isConnecting}
          activeOpacity={0.85}
        >
          <LinearGradient
            colors={canConnect ? ['#D4AF37', '#A88C28'] : [Colors.border, Colors.border]}
            style={styles.connectGrad}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
          >
            {isConnecting ? (
              <ActivityIndicator color={canConnect ? Colors.background : Colors.textMuted} size="small" />
            ) : (
              <>
                <Wifi size={18} color={canConnect ? Colors.background : Colors.textMuted} />
                <Text style={[styles.connectText, !canConnect && styles.connectTextDisabled]}>
                  Connect Wallet
                </Text>
                <ChevronRight size={18} color={canConnect ? Colors.background : Colors.textMuted} />
              </>
            )}
          </LinearGradient>
        </TouchableOpacity>

        <View style={styles.disclaimer}>
          <Text style={styles.disclaimerText}>
            AETURNUM never stores your private keys or seed phrases. All transactions are signed locally on your device.
          </Text>
        </View>
      </ScrollView>
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
    alignItems: 'center',
    marginBottom: 36,
    marginTop: 8,
  },
  iconBadge: {
    width: 64,
    height: 64,
    borderRadius: 18,
    overflow: 'hidden',
    marginBottom: 16,
    shadowColor: Colors.gold,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 16,
  },
  iconGrad: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconText: {
    fontSize: 32,
    color: Colors.background,
    fontWeight: '700' as const,
  },
  title: {
    fontSize: 28,
    fontWeight: '700' as const,
    color: Colors.text,
    marginBottom: 10,
    letterSpacing: 0.5,
  },
  subtitle: {
    fontSize: 15,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
    paddingHorizontal: 16,
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
  walletCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.card,
    borderRadius: 16,
    padding: 16,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: Colors.border,
    overflow: 'hidden',
  },
  walletCardSelected: {
    borderColor: Colors.gold,
  },
  walletLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    flex: 1,
  },
  walletIcon: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: Colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  walletIconSelected: {
    borderColor: Colors.goldDark,
    backgroundColor: Colors.goldGlow,
  },
  walletEmoji: {
    fontSize: 24,
  },
  walletName: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: Colors.text,
    marginBottom: 2,
  },
  walletDesc: {
    fontSize: 13,
    color: Colors.textMuted,
  },
  radioOuter: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioOuterSelected: {
    borderColor: Colors.gold,
  },
  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: Colors.gold,
  },
  checkRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    marginBottom: 14,
    backgroundColor: Colors.card,
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    marginTop: 1,
  },
  checkboxChecked: {
    backgroundColor: Colors.gold,
    borderColor: Colors.gold,
  },
  checkText: {
    fontSize: 14,
    color: Colors.textSecondary,
    lineHeight: 21,
    flex: 1,
  },
  checkLink: {
    color: Colors.gold,
    fontWeight: '500' as const,
  },
  securityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginBottom: 24,
  },
  securityText: {
    fontSize: 12,
    color: Colors.textMuted,
  },
  connectBtn: {
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 20,
    shadowColor: Colors.gold,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
  },
  connectBtnDisabled: {
    shadowOpacity: 0,
    elevation: 0,
  },
  connectGrad: {
    paddingVertical: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  connectText: {
    fontSize: 17,
    fontWeight: '700' as const,
    color: Colors.background,
    letterSpacing: 0.5,
  },
  connectTextDisabled: {
    color: Colors.textMuted,
  },
  disclaimer: {
    backgroundColor: Colors.card,
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  disclaimerText: {
    fontSize: 12,
    color: Colors.textMuted,
    lineHeight: 18,
    textAlign: 'center',
  },
});
