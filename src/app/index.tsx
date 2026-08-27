/**
 * Splash / Redirect — app/index.tsx
 *
 * Spec §6.1: Checks expo-secure-store for a saved JWT.
 *   - If valid → GET /auth/me → decode role → redirect to (staff)/home or (reviewer)/dashboard
 *   - If consent_accepted_at is null → redirect to consent first
 *   - If none/expired → redirect to (auth)/login
 *
 * UI: Full-bleed clinical photography background with dark gradient overlay and animated brand.
 */

import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  Platform,
} from 'react-native';
import Animated, { FadeIn, FadeInUp } from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { Image } from 'expo-image';
import { router } from 'expo-router';
import api from '@/services/api';
import { useAuthStore } from '@/store/authStore';
import { useTheme } from '@/hooks/use-theme';
import { TypographyScale, Spacing } from '@/constants/theme';

export default function SplashRedirectScreen() {
  const { colors, isDark } = useTheme();

  useEffect(() => {
    async function initialize() {
      // Health check — connectivity verification
      try {
        const response = await api.get('/health');
        console.log('[Vyra] ✅ Backend health check:', JSON.stringify(response.data));
      } catch (error: any) {
        console.error('[Vyra] ❌ Backend health check failed:', error?.message || error);
      }

      // Try to restore auth from SecureStore
      const user = await useAuthStore.getState().loadToken();

      if (user) {
        // Token valid, user profile loaded
        if (!user.consent_accepted_at) {
          // User hasn't accepted consent yet
          router.replace('/(auth)/consent');
        } else if (user.role === 'reviewer') {
          router.replace('/(reviewer)/dashboard');
        } else {
          router.replace('/(staff)/home');
        }
      } else {
        // No valid token — go to login
        router.replace('/(auth)/login');
      }
    }

    initialize();
  }, []);

  return (
    <View style={styles.root}>
      {/* Full-bleed clinical background image */}
      <Image
        source={require('../../assets/images/clinical-hero.jpg')}
        style={StyleSheet.absoluteFill}
        contentFit="cover"
      />

      {/* Dark moody gradient overlay for cinematic contrast */}
      <LinearGradient
        colors={[
          'rgba(4, 16, 26, 0.70)',
          'rgba(6, 28, 44, 0.85)',
          'rgba(4, 14, 22, 0.95)',
        ]}
        style={StyleSheet.absoluteFill}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
      />

      {/* Decorative subtle ambient luminous glow */}
      <View style={styles.blobLayer} pointerEvents="none">
        <View
          style={[
            styles.blob,
            styles.blobTop,
            {
              backgroundColor: 'rgba(29, 122, 140, 0.25)',
              ...(Platform.OS === 'web' ? { filter: 'blur(80px)' } : {}),
            },
          ]}
        />
      </View>

      {/* Center Brand Container */}
      <View style={styles.centerContainer}>
        {/* Glow halo */}
        <Animated.View entering={FadeIn.duration(800).delay(100)} style={styles.logoGlowWrapper}>
          <Image
            source={require('../../assets/images/logo-glow.png')}
            style={styles.logoGlow}
            contentFit="contain"
          />
        </Animated.View>

        {/* App Icon */}
        <Animated.View entering={FadeIn.duration(600).delay(250)} style={styles.iconWrapper}>
          <Image
            source={require('../../assets/images/icon.png')}
            style={styles.appIcon}
            contentFit="contain"
          />
        </Animated.View>

        {/* Brand Name */}
        <Animated.View entering={FadeInUp.duration(600).delay(450)}>
          <Text style={styles.brandName}>Vyra</Text>
        </Animated.View>

        {/* Tagline */}
        <Animated.View entering={FadeInUp.duration(600).delay(600)}>
          <Text style={styles.tagline}>Clinical Risk Stratification</Text>
        </Animated.View>

        {/* Spinner */}
        <Animated.View entering={FadeIn.duration(500).delay(850)} style={styles.spinnerWrapper}>
          <ActivityIndicator size="large" color="#4FD1E0" />
        </Animated.View>
      </View>

      {/* Footer */}
      <Animated.View entering={FadeIn.duration(500).delay(1000)} style={styles.footer}>
        <Text style={styles.footerText}>
          Multimodal Deep Learning-Based{'\n'}Early Risk Stratification System
        </Text>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#061C2C',
    overflow: 'hidden',
  },
  blobLayer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    overflow: 'hidden',
  },
  blob: {
    position: 'absolute',
    borderRadius: 999,
  },
  blobTop: {
    top: '20%',
    left: '20%',
    width: 300,
    height: 300,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
  },
  logoGlowWrapper: {
    position: 'absolute',
    width: 280,
    height: 280,
    opacity: 0.35,
  },
  logoGlow: {
    width: '100%',
    height: '100%',
  },
  iconWrapper: {
    width: 92,
    height: 92,
    borderRadius: 24,
    overflow: 'hidden',
    marginBottom: Spacing.lg,
    shadowColor: '#4FD1E0',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.6,
    shadowRadius: 28,
    elevation: 14,
  },
  appIcon: {
    width: '100%',
    height: '100%',
  },
  brandName: {
    fontFamily: TypographyScale.display.fontFamily,
    fontSize: 48,
    lineHeight: 56,
    color: '#FFFFFF',
    letterSpacing: 2,
    textAlign: 'center',
  },
  tagline: {
    fontFamily: TypographyScale.bodyLg.fontFamily,
    fontSize: TypographyScale.bodyLg.fontSize,
    lineHeight: TypographyScale.bodyLg.lineHeight,
    color: 'rgba(255, 255, 255, 0.70)',
    textAlign: 'center',
    marginTop: Spacing.xs,
    letterSpacing: 0.5,
  },
  spinnerWrapper: {
    marginTop: Spacing.xxl,
  },
  footer: {
    position: 'absolute',
    bottom: Spacing.xxl,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  footerText: {
    fontFamily: TypographyScale.caption.fontFamily,
    fontSize: TypographyScale.caption.fontSize,
    lineHeight: 18,
    color: 'rgba(255, 255, 255, 0.40)',
    textAlign: 'center',
    letterSpacing: 0.3,
  },
});
