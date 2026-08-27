/**
 * Get Started / Onboarding Screen — app/(auth)/get-started.tsx
 *
 * Ultra-Premium Clinical Onboarding & Brand Introduction:
 * - Appears on fresh installation or cleared app data
 * - Deep cinematic backdrop with atmospheric clinical glow
 * - Hero icon presentation with live pulsing beacon
 * - 3 Core Clinical Feature Value Cards
 * - Seamless transition to Login or Registration
 */

import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Platform,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay,
  withRepeat,
  withSequence,
  Easing,
  FadeInUp,
  FadeInDown,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '@/hooks/use-theme';
import { Spacing, Radius } from '@/constants/theme';

const HAS_SEEN_ONBOARDING_KEY = 'vyra_has_seen_onboarding';

interface FeatureHighlight {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  description: string;
  color: string;
  badge: string;
}

const FEATURE_HIGHLIGHTS: FeatureHighlight[] = [
  {
    icon: 'git-network-outline',
    title: 'Multimodal Fusion Engine',
    description:
      'Seamlessly fuses dermatological imaging, BioClinicalBERT NLP, and physiological vitals in sub-second inference.',
    color: '#4FD1E0',
    badge: '3 MODALITIES',
  },
  {
    icon: 'pulse-outline',
    title: 'Precision Risk Stratification',
    description:
      'Evidence-based risk scoring with calibrated confidence intervals & clinical safety thresholds for acute triage.',
    color: '#2E9E5B',
    badge: 'REAL-TIME',
  },
  {
    icon: 'shield-checkmark-outline',
    title: 'Enterprise Clinical Security',
    description:
      'Zero-trust cryptographic audit trails, role-based segregation, and HIPAA & GDPR compliant data pipelines.',
    color: '#60A5FA',
    badge: 'ENCRYPTED',
  },
];

export default function GetStartedScreen() {
  const { colors, isDark } = useTheme();
  const insets = useSafeAreaInsets();

  // Animation values
  const pulseOpacity = useSharedValue(0.4);
  const iconScale = useSharedValue(0.92);
  const iconOpacity = useSharedValue(0);

  useEffect(() => {
    iconOpacity.value = withTiming(1, { duration: 600, easing: Easing.out(Easing.cubic) });
    iconScale.value = withTiming(1, { duration: 600, easing: Easing.out(Easing.cubic) });

    pulseOpacity.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 800 }),
        withTiming(0.4, { duration: 800 })
      ),
      -1,
      true
    );
  }, []);

  async function completeOnboarding(targetRoute: '/(auth)/login' | '/(auth)/register') {
    try {
      await SecureStore.setItemAsync(HAS_SEEN_ONBOARDING_KEY, 'true');
    } catch {
      // SecureStore fallback (e.g. web)
    }
    router.replace(targetRoute);
  }

  const animatedIconStyle = useAnimatedStyle(() => ({
    opacity: iconOpacity.value,
    transform: [{ scale: iconScale.value }],
  }));

  const animatedPulseStyle = useAnimatedStyle(() => ({
    opacity: pulseOpacity.value,
  }));

  return (
    <View style={styles.root}>
      {/* ─── Cinematic Dark Backdrop ─── */}
      <LinearGradient
        colors={
          isDark
            ? ['#050A10', '#091522', '#03060B']
            : ['#F4F8FA', '#E8F2F5', '#F7FAFC']
        }
        style={StyleSheet.absoluteFill}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
      />

      {/* ─── Ambient Top Glow Orbs ─── */}
      <View style={styles.glowOrbContainer} pointerEvents="none">
        <View
          style={[
            styles.glowOrb,
            {
              backgroundColor: isDark
                ? 'rgba(79, 209, 224, 0.12)'
                : 'rgba(15, 76, 92, 0.08)',
            },
          ]}
        />
      </View>

      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          {
            paddingTop: Math.max(insets.top, 24) + 16,
            paddingBottom: Math.max(insets.bottom, 24) + 16,
          },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* ─── Hero Brand Header ─── */}
        <View style={styles.heroSection}>
          {/* Brand Icon with Specular Sheen */}
          <Animated.View style={[styles.brandIconWrapper, animatedIconStyle]}>
            <Image
              source={require('../../../assets/images/icon.png')}
              style={styles.brandIcon}
              contentFit="cover"
            />
            <View style={styles.iconSpecularSheen} />
          </Animated.View>

          {/* Category Capsule */}
          <Animated.View
            entering={FadeInUp.duration(600).delay(200)}
            style={[
              styles.categoryPill,
              {
                backgroundColor: isDark
                  ? 'rgba(255, 255, 255, 0.06)'
                  : 'rgba(15, 76, 92, 0.08)',
                borderColor: isDark
                  ? 'rgba(255, 255, 255, 0.12)'
                  : 'rgba(15, 76, 92, 0.15)',
              },
            ]}
          >
            <Animated.View style={[styles.beaconDot, animatedPulseStyle]} />
            <Text
              style={[
                styles.categoryText,
                { color: isDark ? '#E2E8F0' : '#0F4C5C' },
              ]}
            >
              AI MULTIMODAL DIAGNOSTICS
            </Text>
          </Animated.View>

          {/* Main Display Headline */}
          <Animated.View entering={FadeInUp.duration(600).delay(300)}>
            <Text
              style={[
                styles.displayHeadline,
                { color: isDark ? '#FFFFFF' : '#0F2630' },
              ]}
            >
              Next-Gen Clinical{'\n'}Risk Stratification
            </Text>
          </Animated.View>

          {/* Subtitle */}
          <Animated.View entering={FadeInUp.duration(600).delay(400)}>
            <Text
              style={[
                styles.headlineSubtitle,
                {
                  color: isDark
                    ? 'rgba(255, 255, 255, 0.65)'
                    : 'rgba(19, 34, 41, 0.70)',
                },
              ]}
            >
              Empowering triage clinicians with sub-second AI diagnostic fusion
              across medical imaging, deep clinical notes, and multi-parameter vitals.
            </Text>
          </Animated.View>
        </View>

        {/* ─── Clinical Feature Cards ─── */}
        <View style={styles.featuresList}>
          {FEATURE_HIGHLIGHTS.map((item, index) => (
            <Animated.View
              key={item.title}
              entering={FadeInUp.duration(500).delay(450 + index * 100)}
              style={[
                styles.featureCard,
                {
                  backgroundColor: isDark
                    ? 'rgba(14, 25, 34, 0.70)'
                    : 'rgba(255, 255, 255, 0.85)',
                  borderColor: isDark
                    ? 'rgba(255, 255, 255, 0.08)'
                    : 'rgba(15, 76, 92, 0.10)',
                },
              ]}
            >
              <View
                style={[
                  styles.featureIconContainer,
                  {
                    backgroundColor: isDark
                      ? 'rgba(255, 255, 255, 0.06)'
                      : 'rgba(15, 76, 92, 0.06)',
                  },
                ]}
              >
                <Ionicons name={item.icon} size={22} color={item.color} />
              </View>

              <View style={styles.featureTextContent}>
                <View style={styles.featureHeaderRow}>
                  <Text
                    style={[
                      styles.featureTitle,
                      { color: isDark ? '#FFFFFF' : '#132229' },
                    ]}
                  >
                    {item.title}
                  </Text>
                  <View
                    style={[
                      styles.featureBadge,
                      {
                        backgroundColor: `${item.color}18`,
                        borderColor: `${item.color}35`,
                      },
                    ]}
                  >
                    <Text style={[styles.featureBadgeText, { color: item.color }]}>
                      {item.badge}
                    </Text>
                  </View>
                </View>
                <Text
                  style={[
                    styles.featureDescription,
                    {
                      color: isDark
                        ? 'rgba(255, 255, 255, 0.60)'
                        : 'rgba(19, 34, 41, 0.65)',
                    },
                  ]}
                >
                  {item.description}
                </Text>
              </View>
            </Animated.View>
          ))}
        </View>

        {/* ─── Action Section ─── */}
        <Animated.View
          entering={FadeInDown.duration(600).delay(750)}
          style={styles.actionSection}
        >
          {/* Primary "Get Started" CTA */}
          <TouchableOpacity
            onPress={() => completeOnboarding('/(auth)/register')}
            activeOpacity={0.85}
            style={styles.primaryButtonWrapper}
          >
            <LinearGradient
              colors={
                isDark
                  ? ['#4FD1E0', '#1D7A8C', '#0F4C5C']
                  : ['#0F4C5C', '#176579', '#1D7A8C']
              }
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.primaryButtonGradient}
            >
              <Text
                style={[
                  styles.primaryButtonText,
                  { color: isDark ? '#050A10' : '#FFFFFF' },
                ]}
              >
                Get Started
              </Text>
              <Ionicons
                name="arrow-forward"
                size={20}
                color={isDark ? '#050A10' : '#FFFFFF'}
                style={{ marginLeft: 8 }}
              />
            </LinearGradient>
          </TouchableOpacity>

          {/* Secondary "Sign In" Option */}
          <TouchableOpacity
            onPress={() => completeOnboarding('/(auth)/login')}
            activeOpacity={0.7}
            style={[
              styles.secondaryButton,
              {
                borderColor: isDark
                  ? 'rgba(255, 255, 255, 0.14)'
                  : 'rgba(15, 76, 92, 0.18)',
                backgroundColor: isDark
                  ? 'rgba(255, 255, 255, 0.04)'
                  : 'rgba(255, 255, 255, 0.60)',
              },
            ]}
          >
            <Text
              style={[
                styles.secondaryButtonText,
                { color: isDark ? '#E2E8F0' : '#0F4C5C' },
              ]}
            >
              I already have an account
            </Text>
          </TouchableOpacity>

          {/* Compliance & Security Tag */}
          <View style={styles.complianceRow}>
            <Ionicons name="shield-checkmark" size={13} color="#2E9E5B" />
            <Text
              style={[
                styles.complianceText,
                {
                  color: isDark
                    ? 'rgba(255, 255, 255, 0.40)'
                    : 'rgba(19, 34, 41, 0.45)',
                },
              ]}
            >
              HIPAA & GDPR Compliant Clinical Architecture • v1.0.0
            </Text>
          </View>
        </Animated.View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#050A10',
  },
  scrollContent: {
    paddingHorizontal: Spacing.xl,
    alignItems: 'center',
  },
  glowOrbContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  glowOrb: {
    width: 320,
    height: 320,
    borderRadius: 160,
    marginTop: -100,
  },

  /* ── Hero Section ── */
  heroSection: {
    alignItems: 'center',
    marginBottom: Spacing.xl,
    width: '100%',
  },
  brandIconWrapper: {
    width: 82,
    height: 82,
    borderRadius: 22,
    overflow: 'hidden',
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.16)',
    marginBottom: Spacing.md,
    ...Platform.select({
      ios: {
        shadowColor: '#000000',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.35,
        shadowRadius: 18,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  brandIcon: {
    width: '100%',
    height: '100%',
  },
  iconSpecularSheen: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 1.5,
    backgroundColor: 'rgba(255, 255, 255, 0.40)',
  },
  categoryPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 4.5,
    borderRadius: Radius.pill,
    borderWidth: 1,
    marginBottom: Spacing.md,
  },
  beaconDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#2E9E5B',
    marginRight: 7,
  },
  categoryText: {
    fontFamily: 'Inter_700Bold',
    fontSize: 10.5,
    letterSpacing: 1,
  },
  displayHeadline: {
    fontFamily: 'Inter_800ExtraBold',
    fontSize: 32,
    lineHeight: 38,
    textAlign: 'center',
    letterSpacing: -0.6,
    marginBottom: Spacing.sm,
  },
  headlineSubtitle: {
    fontFamily: 'Inter_400Regular',
    fontSize: 14,
    lineHeight: 21,
    textAlign: 'center',
    paddingHorizontal: Spacing.sm,
    letterSpacing: 0.1,
  },

  /* ── Feature Cards ── */
  featuresList: {
    width: '100%',
    gap: 12,
    marginBottom: Spacing.xl + 4,
  },
  featureCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: Spacing.md + 2,
    borderRadius: Radius.lg,
    borderWidth: 1,
    ...Platform.select({
      ios: {
        shadowColor: '#000000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.08,
        shadowRadius: 12,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  featureIconContainer: {
    width: 44,
    height: 44,
    borderRadius: Radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
    marginTop: 2,
  },
  featureTextContent: {
    flex: 1,
  },
  featureHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  featureTitle: {
    fontFamily: 'Inter_700Bold',
    fontSize: 14.5,
    lineHeight: 19,
    letterSpacing: -0.2,
  },
  featureBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: Radius.pill,
    borderWidth: 1,
  },
  featureBadgeText: {
    fontFamily: 'Inter_700Bold',
    fontSize: 8.5,
    letterSpacing: 0.5,
  },
  featureDescription: {
    fontFamily: 'Inter_400Regular',
    fontSize: 12.5,
    lineHeight: 18,
    letterSpacing: 0.1,
  },

  /* ── Action Section ── */
  actionSection: {
    width: '100%',
    alignItems: 'center',
    gap: 10,
  },
  primaryButtonWrapper: {
    width: '100%',
    height: 54,
    borderRadius: Radius.pill,
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: '#0F4C5C',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.35,
        shadowRadius: 12,
      },
      android: {
        elevation: 6,
      },
    }),
  },
  primaryButtonGradient: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryButtonText: {
    fontFamily: 'Inter_700Bold',
    fontSize: 16,
    letterSpacing: 0.2,
  },
  secondaryButton: {
    width: '100%',
    height: 50,
    borderRadius: Radius.pill,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondaryButtonText: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 14.5,
    letterSpacing: 0.1,
  },
  complianceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 8,
  },
  complianceText: {
    fontFamily: 'Inter_400Regular',
    fontSize: 10.5,
    letterSpacing: 0.2,
  },
});
