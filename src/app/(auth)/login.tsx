/**
 * Login — Spec §6.1, UI Upgrade U3
 *
 * "Clinical Glass" restyle:
 * - Full Screen wrapper with gradient mesh + blob accents
 * - Hero typography (display/h1) in high contrast
 * - Form sitting in elevated GlassCard
 * - Preserved logic: validation, API call, token/auth persistence, routing
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { Link, router } from 'expo-router';
import { useTheme } from '@/hooks/use-theme';
import { TypographyScale, Spacing, Radius } from '@/constants/theme';
import { Screen } from '@/components/ui/Screen';
import { GlassCard } from '@/components/ui/GlassCard';
import Button from '@/components/ui/Button';
import TextField from '@/components/ui/TextField';
import { login } from '@/services/authApi';
import { useAuthStore } from '@/store/authStore';

export default function LoginScreen() {
  const { colors } = useTheme();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [apiError, setApiError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const setAuth = useAuthStore((s) => s.setAuth);

  function validate(): boolean {
    let valid = true;
    setEmailError('');
    setPasswordError('');

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email.trim()) {
      setEmailError('Email is required');
      valid = false;
    } else if (!emailRegex.test(email.trim())) {
      setEmailError('Enter a valid email address');
      valid = false;
    }

    if (!password) {
      setPasswordError('Password is required');
      valid = false;
    }

    return valid;
  }

  async function handleLogin() {
    if (!validate()) return;

    setApiError('');
    setIsLoading(true);

    try {
      const result = await login({
        email: email.trim().toLowerCase(),
        password,
      });

      await setAuth(result.user, result.access_token);

      // Route based on consent and role
      if (!result.user.consent_accepted_at) {
        router.replace('/(auth)/consent');
      } else if (result.user.role === 'reviewer') {
        router.replace('/(reviewer)/dashboard');
      } else {
        router.replace('/(staff)/home');
      }
    } catch (error: any) {
      const status = error?.response?.status;
      if (status === 401) {
        setApiError('Invalid email or password. Please try again.');
      } else if (status === 422) {
        setApiError('Please check your input and try again.');
      } else if (error?.message?.includes('Network')) {
        setApiError('Unable to connect to the server. Check your internet connection.');
      } else {
        setApiError(
          error?.response?.data?.detail || 'Something went wrong. Please try again.',
        );
      }
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Screen safeArea={false}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Hero Branding Header */}
          <View style={styles.header}>
            <Text style={[TypographyScale.display, styles.brandName, { color: colors.primary }]}>
              Vyra
            </Text>
            <Text style={[TypographyScale.bodyLg, styles.tagline, { color: colors.textSecondary }]}>
              Clinical Risk Stratification
            </Text>
          </View>

          {/* Form in Elevated Glass Card */}
          <GlassCard tint="elevated" elevation="raised" radius="lg" style={styles.card}>
            <View style={styles.cardInner}>
              <Text style={[TypographyScale.h2, styles.formTitle, { color: colors.textPrimary }]}>
                Sign In
              </Text>

              {apiError ? (
                <View
                  style={[
                    styles.errorBanner,
                    {
                      backgroundColor: `${colors.danger}15`,
                      borderColor: `${colors.danger}35`,
                    },
                  ]}
                >
                  <Text style={[TypographyScale.caption, { color: colors.danger, fontWeight: '600' }]}>
                    {apiError}
                  </Text>
                </View>
              ) : null}

              <TextField
                label="Email"
                placeholder="you@clinic.lk"
                keyboardType="email-address"
                autoCapitalize="none"
                autoComplete="email"
                value={email}
                onChangeText={(text) => {
                  setEmail(text);
                  if (emailError) setEmailError('');
                  if (apiError) setApiError('');
                }}
                error={emailError}
              />

              <TextField
                label="Password"
                placeholder="••••••••"
                secureTextEntry
                autoComplete="password"
                value={password}
                onChangeText={(text) => {
                  setPassword(text);
                  if (passwordError) setPasswordError('');
                  if (apiError) setApiError('');
                }}
                error={passwordError}
              />

              <Button
                title="Sign In"
                onPress={handleLogin}
                loading={isLoading}
                disabled={isLoading}
                style={styles.submitButton}
              />
            </View>
          </GlassCard>

          {/* Navigation Links */}
          <View style={styles.links}>
            <Link href="/(auth)/forgot-password" style={[styles.link, { color: colors.primaryLight }]}>
              Forgot Password?
            </Link>
            <Link href="/(auth)/register" style={[styles.link, { color: colors.primaryLight }]}>
              Create an Account
            </Link>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.xxl,
    justifyContent: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: Spacing.xl,
  },
  brandName: {
    letterSpacing: -0.5,
  },
  tagline: {
    marginTop: Spacing.xxs,
    textAlign: 'center',
  },
  card: {
    marginBottom: Spacing.xl,
  },
  cardInner: {
    padding: Spacing.lg,
  },
  formTitle: {
    marginBottom: Spacing.md,
  },
  errorBanner: {
    borderWidth: 1,
    borderRadius: Radius.md,
    padding: Spacing.sm,
    marginBottom: Spacing.md,
  },
  submitButton: {
    marginTop: Spacing.xs,
  },
  links: {
    alignItems: 'center',
    gap: Spacing.md,
  },
  link: {
    fontFamily: TypographyScale.button.fontFamily,
    fontSize: 14,
    fontWeight: '600',
  },
});
