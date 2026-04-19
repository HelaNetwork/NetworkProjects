import Colors from '@/constants/Colors';
import { useWallet } from '@/context/WalletContext';
import { formatCurrency } from '@/mocks/data';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { Award, Building2, Copy, Edit2, Settings, TrendingUp, Zap } from 'lucide-react-native';
import React from 'react';
import {
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function ProfileScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { profile, walletAddress, totalPortfolioValue, totalInvested, totalYieldEarned, investments, listings } = useWallet();
  const displayWalletAddress = profile.walletAddress || walletAddress || '—';
  const displayReferralCode = profile.referralCode || 'N/A';

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <LinearGradient colors={['#0D0E1A', '#08090D']} style={StyleSheet.absoluteFill} />

      <View style={styles.topBar}>
        <Text style={styles.topBarTitle}>Profile</Text>
        <TouchableOpacity
          style={styles.settingsBtn}
          onPress={() => router.push('/settings' as any)}
          activeOpacity={0.8}
        >
          <Settings size={20} color={Colors.textSecondary} />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 32 }}>
        <View style={styles.profileCard}>
          <LinearGradient
            colors={['#141208', '#1C1910', '#141208']}
            style={StyleSheet.absoluteFill}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          />
          <View style={styles.profileGlow} />

          <View style={styles.avatarRow}>
            {profile.avatar ? (
              <Image source={{ uri: profile.avatar }} style={styles.avatar} />
            ) : (
              <View style={styles.avatarPlaceholder}>
                <Text style={styles.avatarLetter}>{profile.username?.[0]?.toUpperCase() ?? '?'}</Text>
              </View>
            )}
            <TouchableOpacity style={styles.editAvatarBtn}>
              <Edit2 size={12} color={Colors.gold} />
            </TouchableOpacity>
          </View>

          <Text style={styles.username}>@{profile.username}</Text>
          {profile.country && (
            <Text style={styles.country}>🌍 {profile.country}</Text>
          )}

          <View style={styles.walletChip}>
            <View style={styles.walletDot} />
            <Text style={styles.walletText}>{displayWalletAddress}</Text>
            <TouchableOpacity>
              <Copy size={12} color={Colors.textMuted} />
            </TouchableOpacity>
          </View>

          <Text style={styles.joinDate}>Member since {profile.joinDate}       </Text>
        </View>

        <View style={styles.statsGrid}>
          {[
            { label: 'Portfolio Value', value: formatCurrency(totalPortfolioValue, true), icon: TrendingUp, color: Colors.gold },
            { label: 'Capital Deployed', value: formatCurrency(totalInvested, true), icon: Zap, color: Colors.cyan },
            { label: 'Rewards Earned', value: formatCurrency(totalYieldEarned, true), icon: Award, color: Colors.green },
            { label: 'Markets', value: `${listings.length}`, icon: Building2, color: Colors.purple },
          ].map((s) => (
            <View key={s.label} style={styles.statCard}>
              <View style={[styles.statIcon, { backgroundColor: `${s.color}22` }]}>
                <s.icon size={18} color={s.color} />
              </View>
              <Text style={[styles.statValue, { color: s.color }]}>{s.value}</Text>
              <Text style={styles.statLabel}>{s.label}</Text>
            </View>
          ))}
        </View>

        {profile.badges.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Badges</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.badgesRow}>
              {profile.badges.map((badge) => (
                <View key={badge.id} style={[styles.badgeCard, { borderColor: badge.color }]}>
                  <Text style={styles.badgeIcon}>{badge.icon}</Text>
                  <Text style={[styles.badgeLabel, { color: badge.color }]}>{badge.label}</Text>
                </View>
              ))}
            </ScrollView>
          </View>
        )}

        {/* <View style={styles.section}>
          <Text style={styles.sectionTitle}>Referral Program</Text>
          <View style={styles.referralCard}>
            <LinearGradient
              colors={[Colors.purpleGlow, 'transparent']}
              style={StyleSheet.absoluteFill}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            />
            <Text style={styles.referralLabel}>Your Referral Code</Text>
            <Text style={styles.referralCode}>{displayReferralCode}</Text>
            <Text style={styles.referralDesc}>
              Earn 0.5% of every investment made by users you refer
            </Text>
            <TouchableOpacity style={styles.shareBtn} activeOpacity={0.85}>
              <Share2 size={14} color={Colors.background} />
              <Text style={styles.shareBtnText}>Share Code</Text>
            </TouchableOpacity>
          </View>
        </View> */}

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Account</Text>
          {[
            // { label: 'Edit Profile', icon: Edit2, onPress: () => { } },
            { label: 'Settings', icon: Settings, onPress: () => router.push('/settings' as any) },
          ].map((item) => (
            <TouchableOpacity
              key={item.label}
              style={styles.menuItem}
              onPress={item.onPress}
              activeOpacity={0.8}
            >
              <View style={styles.menuIcon}>
                <item.icon size={16} color={Colors.gold} />
              </View>
              <Text style={styles.menuLabel}>{item.label}</Text>
              <View style={styles.menuChevron}>
                <Text style={styles.menuChevronText}>›</Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 14,
    marginBottom: 20,
  },
  topBarTitle: { fontSize: 24, fontWeight: '700' as const, color: Colors.text },
  settingsBtn: {
    width: 42,
    height: 42,
    borderRadius: 12,
    backgroundColor: Colors.card,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  profileCard: {
    marginHorizontal: 20,
    borderRadius: 22,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.goldDark,
    overflow: 'hidden',
    marginBottom: 20,
  },
  profileGlow: {
    position: 'absolute',
    top: -50,
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: Colors.goldGlow,
  },
  avatarRow: { position: 'relative', marginBottom: 14 },
  avatar: { width: 90, height: 90, borderRadius: 45, borderWidth: 3, borderColor: Colors.gold },
  avatarPlaceholder: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: Colors.goldGlow,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: Colors.gold,
  },
  avatarLetter: { fontSize: 36, fontWeight: '800' as const, color: Colors.gold },
  editAvatarBtn: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: Colors.card,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: Colors.gold,
  },
  username: { fontSize: 22, fontWeight: '700' as const, color: Colors.text, marginBottom: 4 },
  country: { fontSize: 14, color: Colors.textSecondary, marginBottom: 12 },
  walletChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: Colors.surface,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: 10,
  },
  walletDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: Colors.green },
  walletText: { fontSize: 12, color: Colors.textMuted, fontFamily: 'monospace' },
  joinDate: { fontSize: 12, color: Colors.textDisabled },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 20,
    gap: 10,
    marginBottom: 24,
  },
  statCard: {
    width: '47.5%',
    backgroundColor: Colors.card,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: 'flex-start',
  },
  statIcon: {
    width: 38,
    height: 38,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  statValue: { fontSize: 18, fontWeight: '700' as const, marginBottom: 3 },
  statLabel: { fontSize: 11, color: Colors.textMuted },
  section: { paddingHorizontal: 20, marginBottom: 24 },
  sectionTitle: { fontSize: 17, fontWeight: '700' as const, color: Colors.text, marginBottom: 14 },
  badgesRow: { gap: 10 },
  badgeCard: {
    backgroundColor: Colors.card,
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
    borderWidth: 1,
    minWidth: 90,
    gap: 6,
  },
  badgeIcon: { fontSize: 24 },
  badgeLabel: { fontSize: 11, fontWeight: '600' as const, textAlign: 'center' },
  referralCard: {
    backgroundColor: Colors.card,
    borderRadius: 16,
    padding: 18,
    borderWidth: 1,
    borderColor: Colors.purple,
    overflow: 'hidden',
    alignItems: 'center',
  },
  referralLabel: { fontSize: 12, color: Colors.textMuted, marginBottom: 6 },
  referralCode: {
    fontSize: 22,
    fontWeight: '800' as const,
    color: Colors.text,
    letterSpacing: 3,
    marginBottom: 10,
  },
  referralDesc: {
    fontSize: 13,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginBottom: 14,
    lineHeight: 19,
  },
  shareBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: Colors.purple,
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 10,
  },
  shareBtnText: { fontSize: 14, fontWeight: '700' as const, color: Colors.background },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: Colors.card,
    borderRadius: 14,
    padding: 14,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  menuIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: Colors.goldGlow,
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuLabel: { flex: 1, fontSize: 15, fontWeight: '500' as const, color: Colors.text },
  menuChevron: {
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuChevronText: { fontSize: 20, color: Colors.textMuted },
});
