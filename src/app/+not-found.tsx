/**
 * Not Found — +not-found.tsx
 * Displayed when navigating to an unknown route.
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Link } from 'expo-router';
import { useTheme } from '@/hooks/use-theme';
import { TypographyScale, Spacing } from '@/constants/theme';
import { Screen } from '@/components/ui/Screen';

export default function NotFoundScreen() {
  const { colors } = useTheme();

  return (
    <Screen safeArea={true}>
      <View style={styles.screen}>
        <Text style={[styles.code, { color: colors.borderStrong }]}>404</Text>
        <Text style={[TypographyScale.h2, { color: colors.textPrimary, marginTop: Spacing.xs }]}>
          Page Not Found
        </Text>
        <Text style={[TypographyScale.body, { color: colors.textSecondary, marginTop: Spacing.xs, textAlign: 'center' }]}>
          The screen you're looking for doesn't exist.
        </Text>
        <Link href="/" style={[TypographyScale.button, styles.link, { color: colors.primaryLight }]}>
          Return to Home
        </Link>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.lg,
  },
  code: {
    fontFamily: TypographyScale.numericLg.fontFamily,
    fontSize: 64,
    fontWeight: '800',
  },
  link: {
    marginTop: Spacing.lg,
    fontSize: 16,
  },
});
