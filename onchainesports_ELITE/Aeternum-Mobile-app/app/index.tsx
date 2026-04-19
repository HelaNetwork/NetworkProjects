import Colors from '@/constants/Colors';
import { useWallet } from '@/context/WalletContext';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useEffect, useRef } from 'react';
import {
  Animated, Dimensions,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const { width, height } = Dimensions.get('window');

export default function SplashScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { isConnected, isSetupComplete, isLoading } = useWallet();

  const logoOpacity = useRef(new Animated.Value(0)).current;
  const logoScale = useRef(new Animated.Value(0.85)).current;
  const taglineOpacity = useRef(new Animated.Value(0)).current;
  const dot1 = useRef(new Animated.Value(0.3)).current;
  const dot2 = useRef(new Animated.Value(0.3)).current;
  const dot3 = useRef(new Animated.Value(0.3)).current;
  const glowOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.parallel([
        Animated.timing(logoOpacity, { toValue: 1, duration: 900, useNativeDriver: true }),
        Animated.spring(logoScale, { toValue: 1, friction: 6, useNativeDriver: true }),
        Animated.timing(glowOpacity, { toValue: 1, duration: 1200, useNativeDriver: true }),
      ]),
      Animated.timing(taglineOpacity, { toValue: 1, duration: 600, useNativeDriver: true }),
    ]).start();

    const dotAnim = Animated.loop(
      Animated.sequence([
        Animated.parallel([
          Animated.timing(dot1, { toValue: 1, duration: 400, useNativeDriver: true }),
          Animated.timing(dot2, { toValue: 0.3, duration: 400, useNativeDriver: true }),
          Animated.timing(dot3, { toValue: 0.3, duration: 400, useNativeDriver: true }),
        ]),
        Animated.parallel([
          Animated.timing(dot1, { toValue: 0.3, duration: 400, useNativeDriver: true }),
          Animated.timing(dot2, { toValue: 1, duration: 400, useNativeDriver: true }),
          Animated.timing(dot3, { toValue: 0.3, duration: 400, useNativeDriver: true }),
        ]),
        Animated.parallel([
          Animated.timing(dot1, { toValue: 0.3, duration: 400, useNativeDriver: true }),
          Animated.timing(dot2, { toValue: 0.3, duration: 400, useNativeDriver: true }),
          Animated.timing(dot3, { toValue: 1, duration: 400, useNativeDriver: true }),
        ]),
      ])
    );
    dotAnim.start();

    return () => dotAnim.stop();
  }, []);

  useEffect(() => {
    if (isLoading) return;
    const timer = setTimeout(() => {
      console.log('[Splash] Navigating. Connected:', isConnected, 'Setup:', isSetupComplete);
      if (isConnected && isSetupComplete) {
        router.replace('/(tabs)/home' as any);
      } else if (isConnected && !isSetupComplete) {
        router.replace('/setup' as any);
      } else {
        router.replace('/connect' as any);
      }
    }, 2800);
    return () => clearTimeout(timer);
  }, [isLoading, isConnected, isSetupComplete]);

  return (
    <View style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
      <LinearGradient
        colors={['#08090D', '#0E0F1A', '#08090D']}
        style={StyleSheet.absoluteFill}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      />

      <Animated.View style={[styles.glowContainer, { opacity: glowOpacity }]}>
        <View style={styles.glow} />
      </Animated.View>

      <View style={styles.centerContent}>
        <Animated.View style={[styles.logoContainer, { opacity: logoOpacity, transform: [{ scale: logoScale }] }]}>
          <View style={styles.hexBadge}>
            <LinearGradient
              colors={['#D4AF37', '#8B6914', '#D4AF37']}
              style={styles.hexGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <Text style={styles.hexSymbol}>Æ</Text>
            </LinearGradient>
          </View>

          <Text style={styles.logoText}>AETURNUM</Text>
          <View style={styles.logoUnderline}>
            <LinearGradient
              colors={['transparent', '#D4AF37', 'transparent']}
              style={styles.underlineGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            />
          </View>
        </Animated.View>

        <Animated.Text style={[styles.tagline, { opacity: taglineOpacity }]}>
          Trade Tokenized Esports Markets
        </Animated.Text>

        <Animated.Text style={[styles.subTagline, { opacity: taglineOpacity }]}>
          Bonding Curves on Solana
        </Animated.Text>
      </View>

      <View style={styles.loadingContainer}>
        <View style={styles.dotsRow}>
          {[dot1, dot2, dot3].map((dot, i) => (
            <Animated.View key={i} style={[styles.dot, { opacity: dot }]} />
          ))}
        </View>
        <Text style={styles.loadingText}>Initializing secure session...</Text>
      </View>

      <View style={styles.footer}>
        <View style={styles.networkBadge}>
          <View style={styles.networkDot} />
          <Text style={styles.networkText}>Solana Network</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  glowContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  glow: {
    width: 300,
    height: 300,
    borderRadius: 150,
    backgroundColor: Colors.goldGlow,
    shadowColor: Colors.gold,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 80,
  },
  centerContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  hexBadge: {
    width: 90,
    height: 90,
    borderRadius: 24,
    overflow: 'hidden',
    marginBottom: 20,
    shadowColor: Colors.gold,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 20,
    elevation: 20,
  },
  hexGradient: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  hexSymbol: {
    fontSize: 48,
    color: '#08090D',
    fontWeight: '700' as const,
  },
  logoText: {
    fontSize: 34,
    fontWeight: '800' as const,
    color: Colors.text,
    letterSpacing: 10,
  },
  logoUnderline: {
    width: 200,
    height: 1,
    marginTop: 8,
    overflow: 'hidden',
  },
  underlineGradient: {
    flex: 1,
  },
  tagline: {
    fontSize: 17,
    color: Colors.textSecondary,
    letterSpacing: 1,
    marginTop: 16,
    fontWeight: '400' as const,
  },
  subTagline: {
    fontSize: 13,
    color: Colors.gold,
    letterSpacing: 2,
    marginTop: 8,
    fontWeight: '500' as const,
    textTransform: 'uppercase' as const,
  },
  loadingContainer: {
    alignItems: 'center',
    paddingBottom: 40,
  },
  dotsRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.gold,
  },
  loadingText: {
    fontSize: 12,
    color: Colors.textMuted,
    letterSpacing: 0.5,
  },
  footer: {
    paddingBottom: 24,
    alignItems: 'center',
  },
  networkBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.card,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: 6,
  },
  networkDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.green,
  },
  networkText: {
    fontSize: 12,
    color: Colors.textSecondary,
    fontWeight: '500' as const,
  },
});
