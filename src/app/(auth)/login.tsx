/**
 * Login — Spec §6.1, UI Upgrade U3
 *
 * Premium "Hero Image + Docked Bottom Sheet" design:
 * - Full-screen clinical photographic background with dark cinematic gradient
 * - Top hero section showcasing brand logo and tagline
 * - Crisp white card anchored firmly at the very bottom edge of the screen
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
import Animated, { FadeIn, FadeInUp } from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { Image } from 'expo-image';
import { Link, router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '@/hooks/use-theme';
import { TypographyScale, Spacing, Radius } from '@/constants/theme';
import Button from '@/components/ui/Button';
import TextField from '@/components/ui/TextField';
import { login } from '@/services/authApi';
import { useAuthStore } from '@/store/authStore';

export default function LoginScreen() {
  const { colors, isDark } = useTheme();
  const insets = useSafeAreaInsets();
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
          <View style={[styles.heroArea, { paddingTop: insets.top + Spacing.lg }]}>
            {/* Logo glow halo */}
            <Animated.View entering={FadeIn.duration(800).delay(100)} style={styles.logoGlowWrapper}>
              <Image
                source={require('../../../assets/images/logo-glow.png')}
                style={styles.logoGlow}
                contentFit="contain"
              />
            </Animated.View>

            {/* App Icon */}
            <Animated.View entering={FadeIn.duration(600).delay(200)} style={styles.iconWrapper}>
              <Image
                source={require('../../../assets/images/icon.png')}
                style={styles.appIcon}
                contentFit="contain"
              />
            </Animated.View>

            {/* Brand Logo & Tagline */}
            <Animated.View entering={FadeInUp.duration(500).delay(350)}>
              <Text style={styles.heroBrand}>Vyra</Text>
            </Animated.View>
            <Animated.View entering={FadeInUp.duration(500).delay(450)}>
              <Text style={styles.heroTagline}>Clinical Risk Stratification</Text>
            </Animated.View>
          </View>

          {/* ─── White Bottom Sheet Card (Anchored at very bottom) ─── */}
          <Animated.View
            entering={FadeInUp.duration(600).delay(300)}
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

            {/* Title & Subtitle */}
            <Text style={[styles.cardTitle, { color: colors.textPrimary }]}>
              Welcome Back
            </Text>
            <Text style={[styles.cardSubtitle, { color: colors.textSecondary }]}>
              Sign in to your account to continue
            </Text>

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

            {/* Form Inputs */}
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

            {/* Forgot Password */}
            <View style={styles.forgotRow}>
              <Link
                href="/(auth)/forgot-password"
                style={[styles.forgotLink, { color: colors.primary }]}
              >
                Forgot Password?
              </Link>
            </View>

            {/* Sign In Button */}
            <Button
              title="Sign In"
              onPress={handleLogin}
              loading={isLoading}
              disabled={isLoading}
              style={styles.submitButton}
            />

            {/* Divider */}
            <View style={styles.dividerRow}>
              <View style={[styles.dividerLine, { backgroundColor: colors.divider }]} />
              <Text style={[styles.dividerText, { color: colors.textTertiary }]}>or</Text>
              <View style={[styles.dividerLine, { backgroundColor: colors.divider }]} />
            </View>

            {/* Sign Up Link */}
            <View style={styles.signUpRow}>
              <Text style={[TypographyScale.body, { color: colors.textSecondary }]}>
                Don't have an account?{' '}
              </Text>
              <Link
                href="/(auth)/register"
                style={[styles.signUpLink, { color: colors.primary }]}
              >
                Sign Up
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
    paddingBottom: Spacing.lg,
    minHeight: 200,
  },
  logoGlowWrapper: {
    position: 'absolute',
    width: 220,
    height: 220,
    opacity: 0.30,
  },
  logoGlow: {
    width: '100%',
    height: '100%',
  },
  iconWrapper: {
    width: 68,
    height: 68,
    borderRadius: 18,
    overflow: 'hidden',
    marginBottom: Spacing.sm,
    shadowColor: '#4FD1E0',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.6,
    shadowRadius: 20,
    elevation: 10,
  },
  appIcon: {
    width: '100%',
    height: '100%',
  },
  heroBrand: {
    fontFamily: TypographyScale.display.fontFamily,
    fontSize: 34,
    lineHeight: 40,
    color: '#FFFFFF',
    letterSpacing: 2,
    textAlign: 'center',
  },
  heroTagline: {
    fontFamily: TypographyScale.body.fontFamily,
    fontSize: 14,
    lineHeight: 20,
    color: 'rgba(255, 255, 255, 0.70)',
    marginTop: 2,
    textAlign: 'center',
    letterSpacing: 0.5,
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
  cardTitle: {
    fontFamily: TypographyScale.h1.fontFamily,
    fontSize: TypographyScale.h1.fontSize,
    lineHeight: TypographyScale.h1.lineHeight,
    marginBottom: 4,
  },
  cardSubtitle: {
    fontFamily: TypographyScale.body.fontFamily,
    fontSize: TypographyScale.body.fontSize,
    lineHeight: TypographyScale.body.lineHeight,
    marginBottom: Spacing.lg,
  },
  errorBanner: {
    borderWidth: 1,
    borderRadius: Radius.md,
    padding: Spacing.sm,
    marginBottom: Spacing.md,
  },
  forgotRow: {
    alignItems: 'flex-end',
    marginBottom: Spacing.sm,
    marginTop: -Spacing.xs,
  },
  forgotLink: {
    fontFamily: TypographyScale.caption.fontFamily,
    fontSize: 13,
    fontWeight: '600',
  },
  submitButton: {
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
  signUpRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  signUpLink: {
    fontFamily: TypographyScale.button.fontFamily,
    fontSize: 14,
    fontWeight: '700',
  },
});
