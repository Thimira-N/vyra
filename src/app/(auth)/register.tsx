/**
 * Register — Spec §6.1, UI Upgrade U3
 *
 * "Clinical Glass" restyle:
 * - Full Screen wrapper with gradient mesh + blob accents
 * - Form sitting in elevated GlassCard
 * - Sleek segmented role selector
 * - Preserved logic: validation, API call, token/auth persistence, routing to consent
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
import { Link, router } from 'expo-router';
import { useTheme } from '@/hooks/use-theme';
import { TypographyScale, Spacing, Radius } from '@/constants/theme';
import { Screen } from '@/components/ui/Screen';
import { GlassCard } from '@/components/ui/GlassCard';
import Button from '@/components/ui/Button';
import TextField from '@/components/ui/TextField';
import { register } from '@/services/authApi';
import { useAuthStore } from '@/store/authStore';

type Role = 'staff' | 'reviewer';

export default function RegisterScreen() {
  const { colors } = useTheme();
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
          {/* Header */}
          <View style={styles.header}>
            <Text style={[TypographyScale.h1, styles.title, { color: colors.textPrimary }]}>
              Create Account
            </Text>
            <Text style={[TypographyScale.body, styles.subtitle, { color: colors.textSecondary }]}>
              Register as Healthcare Staff or Reviewer
            </Text>
          </View>

          {/* Form in Glass Card */}
          <GlassCard tint="elevated" elevation="raised" radius="lg" style={styles.card}>
            <View style={styles.cardInner}>
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

              {/* Role selector — segmented control */}
              <Text style={[TypographyScale.caption, styles.fieldLabel, { color: colors.textSecondary }]}>
                Role
              </Text>
              <View
                style={[
                  styles.roleSelector,
                  {
                    backgroundColor: colors.surfaceSunken,
                    borderColor: colors.border,
                  },
                ]}
              >
                <TouchableOpacity
                  style={[
                    styles.roleOption,
                    role === 'staff' && {
                      backgroundColor: colors.primary,
                      borderRadius: Radius.md - 2,
                    },
                  ]}
                  onPress={() => setRole('staff')}
                  activeOpacity={0.7}
                >
                  <Text
                    style={[
                      TypographyScale.button,
                      {
                        color: role === 'staff' ? colors.textOnPrimary : colors.textSecondary,
                        fontSize: 13,
                      },
                    ]}
                  >
                    Healthcare Staff
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.roleOption,
                    role === 'reviewer' && {
                      backgroundColor: colors.primary,
                      borderRadius: Radius.md - 2,
                    },
                  ]}
                  onPress={() => setRole('reviewer')}
                  activeOpacity={0.7}
                >
                  <Text
                    style={[
                      TypographyScale.button,
                      {
                        color: role === 'reviewer' ? colors.textOnPrimary : colors.textSecondary,
                        fontSize: 13,
                      },
                    ]}
                  >
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
          </GlassCard>

          {/* Footer Link */}
          <View style={styles.footer}>
            <Text style={[TypographyScale.body, { color: colors.textSecondary }]}>
              Already have an account?{' '}
            </Text>
            <Link href="/(auth)/login" style={[styles.link, { color: colors.primaryLight }]}>
              Sign In
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
  },
  header: {
    marginBottom: Spacing.lg,
    alignItems: 'center',
  },
  title: {
    marginBottom: Spacing.xxs,
  },
  subtitle: {
    textAlign: 'center',
  },
  card: {
    marginBottom: Spacing.lg,
  },
  cardInner: {
    padding: Spacing.lg,
  },
  errorBanner: {
    borderWidth: 1,
    borderRadius: Radius.md,
    padding: Spacing.sm,
    marginBottom: Spacing.md,
  },
  fieldLabel: {
    marginBottom: Spacing.xxs,
    fontWeight: '600',
  },
  roleSelector: {
    flexDirection: 'row',
    borderRadius: Radius.md,
    borderWidth: 1,
    padding: 3,
    marginBottom: Spacing.md,
  },
  roleOption: {
    flex: 1,
    paddingVertical: Spacing.sm,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 44,
  },
  registerButton: {
    marginTop: Spacing.xs,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  link: {
    fontFamily: TypographyScale.button.fontFamily,
    fontSize: 14,
    fontWeight: '600',
  },
});
