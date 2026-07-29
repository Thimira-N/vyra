/**
 * Forgot Password — Spec §6.1
 * v1 scope: simple "reset link sent" stub per Spec.
 * Placeholder for Phase F0.
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Link } from 'expo-router';
import { Colors, Typography, Spacing } from '@/constants/theme';
import Button from '@/components/ui/Button';
import TextField from '@/components/ui/TextField';

export default function ForgotPasswordScreen() {
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
          />
          <Button title="Send Reset Link" onPress={() => {}} />
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
});
