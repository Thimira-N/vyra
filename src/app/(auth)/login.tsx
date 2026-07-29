/**
 * Login — Spec §6.1
 * Placeholder for Phase F0. Full implementation in Phase F1.
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Link } from 'expo-router';
import { Colors, Typography, Spacing } from '@/constants/theme';
import Button from '@/components/ui/Button';
import TextField from '@/components/ui/TextField';

export default function LoginScreen() {
  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.logo}>Vyra</Text>
          <Text style={styles.subtitle}>Clinical Risk Stratification</Text>
        </View>

        {/* Form placeholder */}
        <View style={styles.form}>
          <Text style={styles.title}>Sign In</Text>
          <TextField label="Email" placeholder="you@clinic.lk" keyboardType="email-address" autoCapitalize="none" />
          <TextField label="Password" placeholder="••••••••" secureTextEntry />
          <Button title="Sign In" onPress={() => {}} />
        </View>

        {/* Links */}
        <View style={styles.links}>
          <Link href="/(auth)/forgot-password" style={styles.link}>
            Forgot Password?
          </Link>
          <Link href="/(auth)/register" style={styles.link}>
            Create an Account
          </Link>
        </View>

        {/* Dev nav — quick access to other route groups for testing */}
        <View style={styles.devNav}>
          <Text style={styles.devLabel}>F0 Navigation Test:</Text>
          <Link href="/(staff)/home" style={styles.devLink}>Staff Home →</Link>
          <Link href="/(reviewer)/dashboard" style={styles.devLink}>Reviewer Dashboard →</Link>
        </View>
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
  header: {
    alignItems: 'center',
    marginBottom: Spacing.xxl,
  },
  logo: {
    fontFamily: Typography.bold,
    fontSize: 36,
    color: Colors.primary,
  },
  subtitle: {
    fontFamily: Typography.regular,
    fontSize: 14,
    color: Colors.textSecondary,
    marginTop: Spacing.xxs,
  },
  form: {
    marginBottom: Spacing.lg,
  },
  title: {
    fontFamily: Typography.bold,
    fontSize: 24,
    color: Colors.textPrimary,
    marginBottom: Spacing.lg,
  },
  links: {
    alignItems: 'center',
    gap: Spacing.sm,
  },
  link: {
    fontFamily: Typography.medium,
    fontSize: 14,
    color: Colors.primaryLight,
  },
  devNav: {
    marginTop: Spacing.xxl,
    padding: Spacing.md,
    backgroundColor: Colors.surface,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: Spacing.xs,
  },
  devLabel: {
    fontFamily: Typography.semiBold,
    fontSize: 12,
    color: Colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  devLink: {
    fontFamily: Typography.medium,
    fontSize: 14,
    color: Colors.primaryLight,
  },
});
