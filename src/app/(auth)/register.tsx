/**
 * Register — Spec §6.1
 * Placeholder for Phase F0. Full implementation in Phase F1.
 *
 * Fields: full name, email, password, confirm password,
 *   role (segmented: "Healthcare Staff" / "Reviewer"), facility name.
 */

import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Link } from 'expo-router';
import { Colors, Typography, Spacing } from '@/constants/theme';
import Button from '@/components/ui/Button';
import TextField from '@/components/ui/TextField';

export default function RegisterScreen() {
  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>Create Account</Text>
        <Text style={styles.subtitle}>
          Register as Healthcare Staff or Reviewer
        </Text>

        <View style={styles.form}>
          <TextField label="Full Name" placeholder="Dr. Amara Silva" />
          <TextField label="Email" placeholder="amara@clinic.lk" keyboardType="email-address" autoCapitalize="none" />
          <TextField label="Password" placeholder="Minimum 8 characters" secureTextEntry />
          <TextField label="Confirm Password" placeholder="Re-enter password" secureTextEntry />

          {/* Role selector placeholder */}
          <Text style={styles.fieldLabel}>Role</Text>
          <View style={styles.roleSelector}>
            <View style={[styles.roleOption, styles.roleOptionActive]}>
              <Text style={[styles.roleText, styles.roleTextActive]}>Healthcare Staff</Text>
            </View>
            <View style={styles.roleOption}>
              <Text style={styles.roleText}>Reviewer</Text>
            </View>
          </View>

          <TextField label="Facility Name" placeholder="Negombo Base Hospital" />

          <Button title="Register" onPress={() => {}} style={styles.registerButton} />
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>Already have an account? </Text>
          <Link href="/(auth)/login" style={styles.link}>Sign In</Link>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  container: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.xxl,
    paddingBottom: Spacing.xl,
  },
  title: {
    fontFamily: Typography.bold,
    fontSize: 28,
    color: Colors.textPrimary,
  },
  subtitle: {
    fontFamily: Typography.regular,
    fontSize: 15,
    color: Colors.textSecondary,
    marginTop: Spacing.xxs,
    marginBottom: Spacing.lg,
  },
  form: {
    gap: Spacing.xxs,
  },
  fieldLabel: {
    fontFamily: Typography.medium,
    fontSize: 14,
    color: Colors.textPrimary,
    marginBottom: Spacing.xxs,
  },
  roleSelector: {
    flexDirection: 'row',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: Colors.border,
    overflow: 'hidden',
    marginBottom: Spacing.md,
  },
  roleOption: {
    flex: 1,
    paddingVertical: Spacing.sm,
    alignItems: 'center',
    backgroundColor: Colors.surface,
  },
  roleOptionActive: {
    backgroundColor: Colors.primary,
  },
  roleText: {
    fontFamily: Typography.medium,
    fontSize: 14,
    color: Colors.textSecondary,
  },
  roleTextActive: {
    color: Colors.surface,
  },
  registerButton: {
    marginTop: Spacing.xs,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: Spacing.lg,
  },
  footerText: {
    fontFamily: Typography.regular,
    fontSize: 14,
    color: Colors.textSecondary,
  },
  link: {
    fontFamily: Typography.medium,
    fontSize: 14,
    color: Colors.primaryLight,
  },
});
