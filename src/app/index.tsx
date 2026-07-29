/**
 * Splash / Redirect — app/index.tsx
 *
 * Spec §6.1: Checks for saved JWT → redirect by role.
 * For Phase F0: always redirects to (auth)/login.
 * Calls GET /health to verify backend connectivity (DoD #4).
 */

import React, { useEffect } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { router } from 'expo-router';
import api from '@/services/api';
import { Colors, Typography, Spacing } from '@/constants/theme';

export default function SplashRedirectScreen() {
  useEffect(() => {
    async function initialize() {
      // DoD #4: Call GET /health on the real deployed backend and log the response
      try {
        const response = await api.get('/health');
        console.log('[Vyra] ✅ Backend health check successful:', JSON.stringify(response.data));
      } catch (error: any) {
        console.error('[Vyra] ❌ Backend health check failed:', error?.message || error);
      }

      // F0: Always redirect to login (no real auth check yet — that's F1)
      // Small delay so the splash is visible and health check can complete
      setTimeout(() => {
        router.replace('/(auth)/login');
      }, 800);
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
