/**
 * Forgot Password — Spec §6.1, UI Upgrade U3
 *
 * "Clinical Glass" restyle:
 * - Screen wrapper with gradient mesh + blob accents
 * - Form & Success states in elevated GlassCard
 * - Preserved logic: email validation, local state transition for v1 scope
 */

import React, { useState } from 'react';
import { View, Text, StyleSheet, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { Link } from 'expo-router';
import { useTheme } from '@/hooks/use-theme';
import { TypographyScale, Spacing, Radius } from '@/constants/theme';
import { Screen } from '@/components/ui/Screen';
import { GlassCard } from '@/components/ui/GlassCard';
import Button from '@/components/ui/Button';
import TextField from '@/components/ui/TextField';

export default function ForgotPasswordScreen() {
  const { colors } = useTheme();
  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState('');
  const [submitted, setSubmitted] = useState(false);

  function handleSend() {
    setEmailError('');

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email.trim()) {
      setEmailError('Email is required');
      return;
    }
    if (!emailRegex.test(email.trim())) {
      setEmailError('Enter a valid email address');
      return;
    }

    // v1: No real backend call — just show confirmation
    setSubmitted(true);
  }

  if (submitted) {
    return (
      <Screen safeArea={false}>
        <View style={styles.container}>
          <GlassCard tint="elevated" elevation="raised" radius="lg" style={styles.card}>
            <View style={styles.cardInner}>
              <Text style={styles.successIcon}>✉️</Text>
              <Text style={[TypographyScale.h2, styles.successTitle, { color: colors.textPrimary }]}>
                Check Your Email
              </Text>
              <Text style={[TypographyScale.body, styles.successText, { color: colors.textSecondary }]}>
                If an account exists for{' '}
                <Text style={[TypographyScale.body, { color: colors.textPrimary, fontWeight: '600' }]}>
                  {email.trim()}
                </Text>
                , you will receive a password reset link shortly.
              </Text>
            </View>
          </GlassCard>

          <Text style={[TypographyScale.caption, styles.note, { color: colors.textSecondary }]}>
            Note: Email delivery is a known v1 limitation. This feature will be
            fully implemented in a future release.
          </Text>

          <Link href="/(auth)/login" style={[styles.backLink, { color: colors.primaryLight }]}>
            ← Back to Sign In
          </Link>
        </View>
      </Screen>
    );
  }

  return (
    <Screen safeArea={false}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          contentContainerStyle={styles.container}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.header}>
            <Text style={[TypographyScale.h1, styles.title, { color: colors.textPrimary }]}>
              Reset Password
            </Text>
            <Text style={[TypographyScale.body, styles.description, { color: colors.textSecondary }]}>
              Enter your email address and we'll send you a password reset link.
            </Text>
          </View>

          <GlassCard tint="elevated" elevation="raised" radius="lg" style={styles.card}>
            <View style={styles.cardInner}>
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
                }}
                error={emailError}
              />
              <Button title="Send Reset Link" onPress={handleSend} style={styles.sendButton} />
            </View>
          </GlassCard>

          <Text style={[TypographyScale.caption, styles.note, { color: colors.textSecondary }]}>
            Note: Email delivery is a known v1 limitation. This feature will be
            fully implemented in a future release.
          </Text>

          <Link href="/(auth)/login" style={[styles.backLink, { color: colors.primaryLight }]}>
            ← Back to Sign In
          </Link>
        </ScrollView>
      </KeyboardAvoidingView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  container: {
    flexGrow: 1,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.xxl,
    justifyContent: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: Spacing.xl,
  },
  title: {
    marginBottom: Spacing.xs,
  },
  description: {
    textAlign: 'center',
    lineHeight: 22,
  },
  card: {
    marginBottom: Spacing.lg,
  },
  cardInner: {
    padding: Spacing.lg,
  },
  sendButton: {
    marginTop: Spacing.xs,
  },
  note: {
    textAlign: 'center',
    fontStyle: 'italic',
    lineHeight: 18,
    marginBottom: Spacing.lg,
  },
  backLink: {
    fontFamily: TypographyScale.button.fontFamily,
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
  successIcon: {
    fontSize: 40,
    marginBottom: Spacing.sm,
    textAlign: 'center',
  },
  successTitle: {
    marginBottom: Spacing.xs,
    textAlign: 'center',
  },
  successText: {
    lineHeight: 22,
    textAlign: 'center',
  },
});
