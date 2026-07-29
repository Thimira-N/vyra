/**
 * Not Found — +not-found.tsx
 * Displayed when navigating to an unknown route.
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Link } from 'expo-router';
import { Colors, Typography, Spacing } from '@/constants/theme';

export default function NotFoundScreen() {
  return (
    <View style={styles.screen}>
      <Text style={styles.code}>404</Text>
      <Text style={styles.title}>Page Not Found</Text>
      <Text style={styles.description}>
        The screen you're looking for doesn't exist.
      </Text>
      <Link href="/" style={styles.link}>
        Return to Home
      </Link>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: Colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.lg,
  },
  code: {
    fontFamily: Typography.bold,
    fontSize: 64,
    color: Colors.border,
  },
  title: {
    fontFamily: Typography.bold,
    fontSize: 22,
    color: Colors.textPrimary,
    marginTop: Spacing.xs,
  },
  description: {
    fontFamily: Typography.regular,
    fontSize: 15,
    color: Colors.textSecondary,
    marginTop: Spacing.xs,
    textAlign: 'center',
  },
  link: {
    fontFamily: Typography.semiBold,
    fontSize: 16,
    color: Colors.primaryLight,
    marginTop: Spacing.lg,
  },
});
