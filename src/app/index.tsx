/**
 * Splash & Launch Screen — app/index.tsx
 *
 * Minimal, Ultra-Premium Clinical Brand Reveal:
 * - Pure deep OLED slate backdrop with subtle atmospheric vignette
 * - Clean floating brand icon (zero blue shade, no clutter)
 * - Restrained typography with precision tracking
 * - Delicate, whisper-quiet pulsing indicator
 * - Seamless auth check and role-based transition
 */

import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
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
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { Image } from 'expo-image';
import { router } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import api from '@/services/api';
import { useAuthStore } from '@/store/authStore';
import { Spacing } from '@/constants/theme';

export default function SplashRedirectScreen() {
  // Shared Animation Values
  const iconOpacity = useSharedValue(0);
  const iconScale = useSharedValue(0.92);
  const textOpacity = useSharedValue(0);
  const textTranslateY = useSharedValue(8);
  const indicatorOpacity = useSharedValue(0);
  const pulseScale = useSharedValue(1);

  useEffect(() => {
    // 1. Icon entrance: silky smooth fade + subtle scale
    iconOpacity.value = withTiming(1, {
      duration: 700,
      easing: Easing.out(Easing.cubic),
    });
    iconScale.value = withTiming(1, {
      duration: 700,
      easing: Easing.out(Easing.cubic),
    });

    // 2. Text entrance: staggered fade + slight upward drift
    textOpacity.value = withDelay(
      220,
      withTiming(1, { duration: 600, easing: Easing.out(Easing.cubic) })
    );
    textTranslateY.value = withDelay(
      220,
      withTiming(0, { duration: 600, easing: Easing.out(Easing.cubic) })
    );

    // 3. Subtle bottom indicator pulse
    indicatorOpacity.value = withDelay(
      450,
      withTiming(1, { duration: 500 })
    );
    pulseScale.value = withDelay(
      450,
      withRepeat(
        withSequence(
          withTiming(1.08, { duration: 1000, easing: Easing.inOut(Easing.ease) }),
          withTiming(0.94, { duration: 1000, easing: Easing.inOut(Easing.ease) })
        ),
        -1,
        true
      )
    );
  }, []);

  // Auth restoration & navigation
  useEffect(() => {
    let isMounted = true;

    async function initialize() {
      const minDisplayPromise = new Promise((res) => setTimeout(res, 1600));

      // Health ping (silent fallback)
      const healthPromise = api.get('/health').catch(() => null);

      // Restore user token
      const authPromise = useAuthStore.getState().loadToken();

      // Check if user has completed first-time onboarding
      const onboardingPromise = SecureStore.getItemAsync('vyra_has_seen_onboarding').catch(() => null);

      const [, , user, hasSeenOnboarding] = await Promise.all([
        minDisplayPromise,
        healthPromise,
        authPromise,
        onboardingPromise,
      ]);

      if (!isMounted) return;

      if (user) {
        if (!user.consent_accepted_at) {
          router.replace('/(auth)/consent');
        } else if (user.role === 'reviewer') {
          router.replace('/(reviewer)/dashboard');
        } else {
          router.replace('/(staff)/home');
        }
      } else if (!hasSeenOnboarding) {
        router.replace('/(auth)/get-started');
      } else {
        router.replace('/(auth)/login');
      }
    }

    initialize();

    return () => {
      isMounted = false;
    };
  }, []);

  // Animated Styles
  const animatedIconStyle = useAnimatedStyle(() => ({
    opacity: iconOpacity.value,
    transform: [{ scale: iconScale.value }],
  }));

  const animatedTextStyle = useAnimatedStyle(() => ({
    opacity: textOpacity.value,
    transform: [{ translateY: textTranslateY.value }],
  }));

  const animatedIndicatorStyle = useAnimatedStyle(() => ({
    opacity: indicatorOpacity.value,
    transform: [{ scale: pulseScale.value }],
  }));

  return (
    <View style={styles.root}>
      {/* ─── Ultra-Subtle Deep Vignette ─── */}
      <LinearGradient
        colors={['#080E18', '#050910', '#03060B']}
        style={StyleSheet.absoluteFill}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
      />

      {/* ─── Minimal Center Brand Group ─── */}
      <View style={styles.centerContainer}>
        {/* Crisp App Icon (Zero Blue Glow) */}
        <Animated.View style={[styles.iconWrapper, animatedIconStyle]}>
          <Image
            source={require('../../assets/images/icon.png')}
            style={styles.brandIcon}
            contentFit="cover"
          />
        </Animated.View>

        {/* Brand Typography */}
        <Animated.View style={[styles.textGroup, animatedTextStyle]}>
          <Text style={styles.brandTitle}>Vyra</Text>
          <Text style={styles.brandSubtitle}>Clinical Risk Stratification</Text>
        </Animated.View>
      </View>

      {/* ─── Minimal Ambient Bottom Pulse Dot ─── */}
      <View style={styles.footerContainer}>
        <Animated.View style={[styles.pulseTrack, animatedIndicatorStyle]}>
          <View style={styles.pulseDot} />
        </Animated.View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#050910',
    alignItems: 'center',
    justifyContent: 'center',
  },
  centerContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconWrapper: {
    width: 86,
    height: 86,
    borderRadius: 22,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
    marginBottom: Spacing.lg,
    ...Platform.select({
      ios: {
        shadowColor: '#000000',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.45,
        shadowRadius: 16,
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
  textGroup: {
    alignItems: 'center',
  },
  brandTitle: {
    fontFamily: 'Inter_700Bold',
    fontSize: 34,
    lineHeight: 40,
    color: '#FFFFFF',
    letterSpacing: -0.6,
  },
  brandSubtitle: {
    fontFamily: 'Inter_400Regular',
    fontSize: 13.5,
    lineHeight: 18,
    color: 'rgba(255, 255, 255, 0.50)',
    marginTop: 4,
    letterSpacing: 0.3,
  },
  footerContainer: {
    position: 'absolute',
    bottom: Platform.OS === 'ios' ? 44 : 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pulseTrack: {
    width: 24,
    height: 4,
    borderRadius: 2,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  pulseDot: {
    width: 8,
    height: 4,
    borderRadius: 2,
    backgroundColor: 'rgba(255, 255, 255, 0.40)',
  },
});


