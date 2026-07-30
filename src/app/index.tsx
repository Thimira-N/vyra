/**
 * Splash / Redirect — app/index.tsx
 *
 * Spec §6.1: Checks expo-secure-store for a saved JWT.
 *   - If valid → GET /auth/me → decode role → redirect to (staff)/home or (reviewer)/dashboard
 *   - If consent_accepted_at is null → redirect to consent first
 *   - If none/expired → redirect to (auth)/login
 *
 * Also calls GET /health for connectivity verification (retained from F0).
 */

import React, { useEffect } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { router } from 'expo-router';
import api from '@/services/api';
import { useAuthStore } from '@/store/authStore';
import { Colors, Typography, Spacing } from '@/constants/theme';

export default function SplashRedirectScreen() {
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
    <View style={styles.screen}>
      <View style={styles.content}>
        <Text style={styles.logo}>Vyra</Text>
        <Text style={styles.subtitle}>Clinical Risk Stratification</Text>
        <ActivityIndicator
          size="large"
          color={Colors.primaryLight}
          style={styles.spinner}
        />
      </View>
      <Text style={styles.footer}>
        Multimodal Deep Learning-Based{'\n'}Early Risk Stratification System
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.lg,
  },
  content: {
    alignItems: 'center',
  },
  logo: {
    fontFamily: Typography.bold,
    fontSize: 48,
    color: Colors.surface,
    letterSpacing: 2,
  },
  subtitle: {
    fontFamily: Typography.regular,
    fontSize: 15,
    color: Colors.surface + 'CC',
    marginTop: Spacing.xs,
  },
  spinner: {
    marginTop: Spacing.xl,
  },
  footer: {
    position: 'absolute',
    bottom: Spacing.xxl + Spacing.md,
    fontFamily: Typography.regular,
    fontSize: 12,
    color: Colors.surface + '80',
    textAlign: 'center',
    lineHeight: 18,
  },
});
