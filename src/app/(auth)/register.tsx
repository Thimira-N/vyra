/**
 * Register — Spec §6.1, UI Upgrade U3
 *
 * Premium "Hero Image + Docked Bottom Sheet" design:
 * - Full-screen clinical photographic background with dark cinematic gradient
 * - Top hero section with brand icon and "Create Account" header
 * - Crisp white card anchored firmly at the very bottom edge of the screen
 * - Pill-shaped segmented role selector
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
import Animated, { FadeIn, FadeInUp } from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { Image } from 'expo-image';
import { Link, router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '@/hooks/use-theme';
import { TypographyScale, Spacing, Radius } from '@/constants/theme';
import Button from '@/components/ui/Button';
import TextField from '@/components/ui/TextField';
import { register } from '@/services/authApi';
import { useAuthStore } from '@/store/authStore';

type Role = 'staff' | 'reviewer';

export default function RegisterScreen() {
  const { colors, isDark } = useTheme();
  const insets = useSafeAreaInsets();
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

  const cardBg = isDark ? colors.surface : '#FFFFFF';

  return (
    <View style={styles.root}>
      {/* Full-bleed clinical background image */}
      <Image
        source={require('../../../assets/images/clinical-hero.jpg')}
        style={StyleSheet.absoluteFill}
        contentFit="cover"
      />

      {/* Dark moody gradient overlay for cinematic contrast */}
      <LinearGradient
        colors={[
          'rgba(4, 16, 26, 0.45)',
          'rgba(6, 28, 44, 0.70)',
          'rgba(4, 14, 22, 0.90)',
        ]}
        style={StyleSheet.absoluteFill}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
      />

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          bounces={false}
        >
          {/* ─── Hero Area (Top) ─── */}
          <View style={[styles.heroArea, { paddingTop: insets.top + Spacing.md }]}>
            {/* Logo glow halo */}
            <Animated.View entering={FadeIn.duration(700).delay(100)} style={styles.logoGlowWrapper}>
              <Image
                source={require('../../../assets/images/logo-glow.png')}
                style={styles.logoGlow}
                contentFit="contain"
              />
            </Animated.View>

            {/* App Icon */}
            <Animated.View entering={FadeIn.duration(500).delay(150)} style={styles.iconWrapper}>
              <Image
                source={require('../../../assets/images/icon.png')}
                style={styles.appIcon}
                contentFit="contain"
              />
            </Animated.View>

            {/* Hero Title */}
            <Animated.View entering={FadeInUp.duration(500).delay(250)}>
              <Text style={styles.heroTitle}>Create Account</Text>
            </Animated.View>
            <Animated.View entering={FadeInUp.duration(500).delay(350)}>
              <Text style={styles.heroSubtitle}>
                Join as Healthcare Staff or Reviewer
              </Text>
            </Animated.View>
          </View>

          {/* ─── White Bottom Sheet Card (Anchored at very bottom) ─── */}
          <Animated.View
            entering={FadeInUp.duration(600).delay(250)}
            style={[
              styles.bottomSheetCard,
              {
                backgroundColor: cardBg,
                paddingBottom: Math.max(insets.bottom + Spacing.md, Spacing.xl),
              },
            ]}
          >
            {/* Card pull-handle */}
            <View style={styles.handleRow}>
              <View style={[styles.handle, { backgroundColor: isDark ? colors.border : '#E2E8F0' }]} />
            </View>

            {/* Error Banner */}
            {apiError ? (
              <View
                style={[
                  styles.errorBanner,
                  {
                    backgroundColor: `${colors.danger}12`,
                    borderColor: `${colors.danger}30`,
                  },
                ]}
              >
                <Text style={[TypographyScale.caption, { color: colors.danger, fontWeight: '600' }]}>
                  {apiError}
                </Text>
              </View>
            ) : null}

            {/* Form Fields */}
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

            {/* Role selector — pill style */}
            <Text style={[styles.fieldLabel, { color: colors.textSecondary }]}>
              Role
            </Text>
            <View
              style={[
                styles.roleSelector,
                {
                  backgroundColor: isDark ? colors.surfaceSunken : '#F0F4F7',
                },
              ]}
            >
              <TouchableOpacity
                style={[
                  styles.roleOption,
                  role === 'staff' && [
                    styles.roleOptionActive,
                    {
                      backgroundColor: colors.primary,
                    },
                  ],
                ]}
                onPress={() => setRole('staff')}
                activeOpacity={0.7}
              >
                <Text
                  style={[
                    styles.roleOptionText,
                    {
                      color: role === 'staff' ? '#FFFFFF' : colors.textSecondary,
                      fontWeight: role === 'staff' ? '700' : '500',
                    },
                  ]}
                >
                  Healthcare Staff
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.roleOption,
                  role === 'reviewer' && [
                    styles.roleOptionActive,
                    {
                      backgroundColor: colors.primary,
                    },
                  ],
                ]}
                onPress={() => setRole('reviewer')}
                activeOpacity={0.7}
              >
                <Text
                  style={[
                    styles.roleOptionText,
                    {
                      color: role === 'reviewer' ? '#FFFFFF' : colors.textSecondary,
                      fontWeight: role === 'reviewer' ? '700' : '500',
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

            {/* Submit Button */}
            <Button
              title="Create Account"
              onPress={handleRegister}
              loading={isLoading}
              disabled={isLoading}
              style={styles.registerButton}
            />

            {/* Divider */}
            <View style={styles.dividerRow}>
              <View style={[styles.dividerLine, { backgroundColor: colors.divider }]} />
              <Text style={[styles.dividerText, { color: colors.textTertiary }]}>or</Text>
              <View style={[styles.dividerLine, { backgroundColor: colors.divider }]} />
            </View>

            {/* Sign In Footer Link */}
            <View style={styles.footerRow}>
              <Text style={[TypographyScale.body, { color: colors.textSecondary }]}>
                Already have an account?{' '}
              </Text>
              <Link href="/(auth)/login" style={[styles.footerLink, { color: colors.primary }]}>
                Sign In
              </Link>
            </View>
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#061C2C',
  },
  flex: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'space-between',
  },

  /* ── Hero Area ── */
  heroArea: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingBottom: Spacing.md,
    minHeight: 160,
  },
  logoGlowWrapper: {
    position: 'absolute',
    width: 180,
    height: 180,
  },
  logoGlow: {
    width: '100%',
    height: '100%',
    opacity: 0.25,
  },
  iconWrapper: {
    width: 56,
    height: 56,
    borderRadius: 14,
    overflow: 'hidden',
    marginBottom: Spacing.xs,
    shadowColor: '#4FD1E0',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.6,
    shadowRadius: 18,
    elevation: 10,
  },
  appIcon: {
    width: '100%',
    height: '100%',
  },
  heroTitle: {
    fontFamily: TypographyScale.h1.fontFamily,
    fontSize: 26,
    lineHeight: 32,
    color: '#FFFFFF',
    letterSpacing: 0.5,
    textAlign: 'center',
  },
  heroSubtitle: {
    fontFamily: TypographyScale.body.fontFamily,
    fontSize: 13,
    lineHeight: 18,
    color: 'rgba(255, 255, 255, 0.70)',
    marginTop: 2,
    textAlign: 'center',
    letterSpacing: 0.3,
  },

  /* ── Bottom Sheet Card ── */
  bottomSheetCard: {
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.md,
    width: '100%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -6 },
    shadowOpacity: 0.18,
    shadowRadius: 20,
    elevation: 16,
  },
  handleRow: {
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  handle: {
    width: 44,
    height: 4,
    borderRadius: 2,
  },
  errorBanner: {
    borderWidth: 1,
    borderRadius: Radius.md,
    padding: Spacing.sm,
    marginBottom: Spacing.md,
  },
  fieldLabel: {
    fontFamily: TypographyScale.caption.fontFamily,
    fontSize: TypographyScale.caption.fontSize,
    lineHeight: TypographyScale.caption.lineHeight,
    fontWeight: '600',
    marginBottom: Spacing.xs,
  },
  roleSelector: {
    flexDirection: 'row',
    borderRadius: Radius.pill,
    padding: 4,
    marginBottom: Spacing.md,
  },
  roleOption: {
    flex: 1,
    paddingVertical: Spacing.sm,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 44,
    borderRadius: Radius.pill,
  },
  roleOptionActive: {
    shadowColor: 'rgba(15, 76, 92, 0.35)',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 8,
    elevation: 4,
  },
  roleOptionText: {
    fontFamily: TypographyScale.button.fontFamily,
    fontSize: 13,
    lineHeight: 18,
  },
  registerButton: {
    marginTop: Spacing.xs,
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: Spacing.md,
    gap: Spacing.sm,
  },
  dividerLine: {
    flex: 1,
    height: 1,
  },
  dividerText: {
    fontFamily: TypographyScale.caption.fontFamily,
    fontSize: 12,
    textTransform: 'lowercase',
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  footerLink: {
    fontFamily: TypographyScale.button.fontFamily,
    fontSize: 14,
    fontWeight: '700',
  },
});
