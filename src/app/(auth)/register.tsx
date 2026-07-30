/**
 * Register — Spec §6.1
 *
 * Fields: full name, email, password, confirm password,
 *   role (segmented: "Healthcare Staff" / "Reviewer"), facility name.
 * Validation: email format, password ≥ 8 chars, passwords match.
 * Calls POST /auth/register → auto-login → routes to consent.tsx.
 *
 * Three states: loading (button spinner), error (inline banner), default form.
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Link, router } from 'expo-router';
import { Colors, Typography, Spacing } from '@/constants/theme';
import Button from '@/components/ui/Button';
import TextField from '@/components/ui/TextField';
import { register } from '@/services/authApi';
import { useAuthStore } from '@/store/authStore';

type Role = 'staff' | 'reviewer';

export default function RegisterScreen() {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState<Role>('staff');
  const [facilityName, setFacilityName] = useState('');

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [apiError, setApiError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const setAuth = useAuthStore((s) => s.setAuth);

  function clearFieldError(field: string) {
    setErrors((prev) => {
      const next = { ...prev };
      delete next[field];
      return next;
    });
    if (apiError) setApiError('');
  }

  function validate(): boolean {
    const newErrors: Record<string, string> = {};

    if (!fullName.trim()) {
      newErrors.fullName = 'Full name is required';
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!emailRegex.test(email.trim())) {
      newErrors.email = 'Enter a valid email address';
    }

    if (!password) {
      newErrors.password = 'Password is required';
    } else if (password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    }

    if (!confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (password !== confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    if (!facilityName.trim()) {
      newErrors.facilityName = 'Facility name is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  async function handleRegister() {
    if (!validate()) return;

    setApiError('');
    setIsLoading(true);

    try {
      const result = await register({
        full_name: fullName.trim(),
        email: email.trim().toLowerCase(),
        password,
        role,
        facility_name: facilityName.trim(),
      });

      // Auto-login: store JWT + user
      await setAuth(result.user, result.access_token);

      // Always route to consent after registration
      router.replace('/(auth)/consent');
    } catch (error: any) {
      const status = error?.response?.status;
      const detail = error?.response?.data?.detail;

      if (status === 409 || (typeof detail === 'string' && detail.toLowerCase().includes('already'))) {
        setApiError('An account with this email already exists. Try signing in.');
      } else if (status === 422) {
        setApiError('Please check your input and try again.');
      } else if (error?.message?.includes('Network')) {
        setApiError('Unable to connect to the server. Check your internet connection.');
      } else {
        setApiError(
          typeof detail === 'string' ? detail : 'Registration failed. Please try again.',
        );
      }
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          contentContainerStyle={styles.container}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <Text style={styles.title}>Create Account</Text>
          <Text style={styles.subtitle}>
            Register as Healthcare Staff or Reviewer
          </Text>

          {apiError ? (
            <View style={styles.errorBanner}>
              <Text style={styles.errorBannerText}>{apiError}</Text>
            </View>
          ) : null}

          <View style={styles.form}>
            <TextField
              label="Full Name"
              placeholder="Dr. Amara Silva"
              autoCapitalize="words"
              autoComplete="name"
              value={fullName}
              onChangeText={(text) => {
                setFullName(text);
                clearFieldError('fullName');
              }}
              error={errors.fullName}
            />

            <TextField
              label="Email"
              placeholder="amara@clinic.lk"
              keyboardType="email-address"
              autoCapitalize="none"
              autoComplete="email"
              value={email}
              onChangeText={(text) => {
                setEmail(text);
                clearFieldError('email');
              }}
              error={errors.email}
            />

            <TextField
              label="Password"
              placeholder="Minimum 8 characters"
              secureTextEntry
              autoComplete="new-password"
              value={password}
              onChangeText={(text) => {
                setPassword(text);
                clearFieldError('password');
              }}
              error={errors.password}
            />

            <TextField
              label="Confirm Password"
              placeholder="Re-enter password"
              secureTextEntry
              autoComplete="new-password"
              value={confirmPassword}
              onChangeText={(text) => {
                setConfirmPassword(text);
                clearFieldError('confirmPassword');
              }}
              error={errors.confirmPassword}
            />

            {/* Role selector — segmented control (Spec §6.1) */}
            <Text style={styles.fieldLabel}>Role</Text>
            <View style={styles.roleSelector}>
              <TouchableOpacity
                style={[styles.roleOption, role === 'staff' && styles.roleOptionActive]}
                onPress={() => setRole('staff')}
                activeOpacity={0.7}
              >
                <Text style={[styles.roleText, role === 'staff' && styles.roleTextActive]}>
                  Healthcare Staff
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.roleOption, role === 'reviewer' && styles.roleOptionActive]}
                onPress={() => setRole('reviewer')}
                activeOpacity={0.7}
              >
                <Text style={[styles.roleText, role === 'reviewer' && styles.roleTextActive]}>
                  Reviewer
                </Text>
              </TouchableOpacity>
            </View>

            <TextField
              label="Facility Name"
              placeholder="Negombo Base Hospital"
              autoCapitalize="words"
              value={facilityName}
              onChangeText={(text) => {
                setFacilityName(text);
                clearFieldError('facilityName');
              }}
              error={errors.facilityName}
            />

            <Button
              title="Register"
              onPress={handleRegister}
              loading={isLoading}
              disabled={isLoading}
              style={styles.registerButton}
            />
          </View>

          <View style={styles.footer}>
            <Text style={styles.footerText}>Already have an account? </Text>
            <Link href="/(auth)/login" style={styles.link}>Sign In</Link>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  flex: {
    flex: 1,
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
  errorBanner: {
    backgroundColor: Colors.riskHigh + '12',
    borderWidth: 1,
    borderColor: Colors.riskHigh + '30',
    borderRadius: 10,
    padding: Spacing.sm,
    marginBottom: Spacing.md,
  },
  errorBannerText: {
    fontFamily: Typography.medium,
    fontSize: 13,
    color: Colors.riskHigh,
    lineHeight: 19,
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
    justifyContent: 'center',
    backgroundColor: Colors.surface,
    minHeight: 48,
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
