/**
 * Login — Spec §6.1
 *
 * Fields: email, password. Validation: valid email format, password non-empty.
 * Calls POST /auth/login. On success: store JWT in SecureStore, store user in
 * authStore, check consent_accepted_at — if null, route to consent.tsx first;
 * else route by role. Link to Register and Forgot Password.
 *
 * Three states: loading (button spinner), error (inline message + retry),
 * and default form.
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Link, router } from 'expo-router';
import { Colors, Typography, Spacing } from '@/constants/theme';
import Button from '@/components/ui/Button';
import TextField from '@/components/ui/TextField';
import { login } from '@/services/authApi';
import { useAuthStore } from '@/store/authStore';

export default function LoginScreen() {
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
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.logo}>Vyra</Text>
            <Text style={styles.subtitle}>Clinical Risk Stratification</Text>
          </View>

          {/* Form */}
          <View style={styles.form}>
            <Text style={styles.title}>Sign In</Text>

            {apiError ? (
              <View style={styles.errorBanner}>
                <Text style={styles.errorBannerText}>{apiError}</Text>
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
            />
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
    flexGrow: 1,
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
  links: {
    alignItems: 'center',
    gap: Spacing.sm,
  },
  link: {
    fontFamily: Typography.medium,
    fontSize: 14,
    color: Colors.primaryLight,
  },
});
