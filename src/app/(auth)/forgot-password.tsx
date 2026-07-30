/**
 * Forgot Password — Spec §6.1
 *
 * v1 scope: simple "reset link sent" stub per Spec.
 * "For v1 scope, this can be a simple 'reset link sent' stub
 *  (email delivery is infrastructure beyond coursework scope) —
 *  note this explicitly as a known v1 limitation."
 *
 * No backend call — purely local state transition.
 */

import React, { useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Link } from 'expo-router';
import { Colors, Typography, Spacing } from '@/constants/theme';
import Button from '@/components/ui/Button';
import TextField from '@/components/ui/TextField';

export default function ForgotPasswordScreen() {
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
      <SafeAreaView style={styles.safe}>
        <View style={styles.container}>
          <View style={styles.successCard}>
            <Text style={styles.successIcon}>✉️</Text>
            <Text style={styles.successTitle}>Check Your Email</Text>
            <Text style={styles.successText}>
              If an account exists for{' '}
              <Text style={styles.emailHighlight}>{email.trim()}</Text>
              , you will receive a password reset link shortly.
            </Text>
          </View>

          <Text style={styles.note}>
            Note: Email delivery is a known v1 limitation. This feature will be
            fully implemented in a future release.
          </Text>

          <Link href="/(auth)/login" style={styles.backLink}>
            ← Back to Sign In
          </Link>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        <Text style={styles.title}>Reset Password</Text>
        <Text style={styles.description}>
          Enter your email address and we'll send you a password reset link.
        </Text>

        <View style={styles.form}>
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
          <Button title="Send Reset Link" onPress={handleSend} />
        </View>

        <Text style={styles.note}>
          Note: Email delivery is a known v1 limitation. This feature will be
          fully implemented in a future release.
        </Text>

        <Link href="/(auth)/login" style={styles.backLink}>
          ← Back to Sign In
        </Link>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  container: {
    flex: 1,
    paddingHorizontal: Spacing.lg,
    justifyContent: 'center',
  },
  title: {
    fontFamily: Typography.bold,
    fontSize: 28,
    color: Colors.textPrimary,
    marginBottom: Spacing.xs,
  },
  description: {
    fontFamily: Typography.regular,
    fontSize: 15,
    color: Colors.textSecondary,
    lineHeight: 22,
    marginBottom: Spacing.lg,
  },
  form: {
    marginBottom: Spacing.lg,
  },
  note: {
    fontFamily: Typography.regular,
    fontSize: 13,
    color: Colors.textSecondary,
    fontStyle: 'italic',
    lineHeight: 18,
    marginBottom: Spacing.lg,
  },
  backLink: {
    fontFamily: Typography.medium,
    fontSize: 14,
    color: Colors.primaryLight,
  },

  // Success state
  successCard: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.riskLow + '30',
    padding: Spacing.lg,
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  successIcon: {
    fontSize: 40,
    marginBottom: Spacing.sm,
  },
  successTitle: {
    fontFamily: Typography.bold,
    fontSize: 20,
    color: Colors.textPrimary,
    marginBottom: Spacing.xs,
  },
  successText: {
    fontFamily: Typography.regular,
    fontSize: 14,
    color: Colors.textSecondary,
    lineHeight: 21,
    textAlign: 'center',
  },
  emailHighlight: {
    fontFamily: Typography.semiBold,
    color: Colors.textPrimary,
  },
});
