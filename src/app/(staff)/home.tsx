/**
 * Staff Home — Spec §6.2
 * Dashboard summary with greeting, quick stats, new assessment CTA,
 * and recent assessments list.
 *
 * Placeholder for Phase F0. Includes RiskBadge demo for DoD #3.
 */

import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { Link } from 'expo-router';
import { Colors, Typography, Spacing, Shadows } from '@/constants/theme';
import Button from '@/components/ui/Button';
import RiskBadge from '@/components/ui/RiskBadge';

export default function StaffHomeScreen() {
  return (
    <ScrollView
      style={styles.scroll}
      contentContainerStyle={styles.container}
      showsVerticalScrollIndicator={false}
    >
      {/* Greeting */}
      <View style={styles.greetingSection}>
        <Text style={styles.greeting}>Good evening,</Text>
        <Text style={styles.userName}>Dr. Staff User</Text>
      </View>

      {/* Quick Stats */}
      <View style={styles.statsRow}>
        <View style={[styles.statCard, Shadows.card]}>
          <Text style={styles.statNumber}>—</Text>
          <Text style={styles.statLabel}>This Week</Text>
        </View>
        <View style={[styles.statCard, Shadows.card]}>
          <Text style={styles.statNumber}>—</Text>
          <Text style={styles.statLabel}>Pending Review</Text>
        </View>
      </View>

      {/* New Assessment CTA */}
      <Link href="/(staff)/new-assessment/patient-info" asChild>
        <Button title="＋  New Assessment" onPress={() => {}} style={styles.ctaButton} />
      </Link>

      {/* Risk Badge Demo (DoD #3 verification) */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Risk Level Badges</Text>
        <View style={styles.badgeRow}>
          <RiskBadge level="Low" />
          <RiskBadge level="Medium" />
          <RiskBadge level="High" />
        </View>
        <View style={styles.badgeRow}>
          <RiskBadge level="Low" size="small" />
          <RiskBadge level="Medium" size="small" />
          <RiskBadge level="High" size="small" />
        </View>
        <View style={styles.badgeRow}>
          <RiskBadge level="Low" size="large" />
          <RiskBadge level="Medium" size="large" />
          <RiskBadge level="High" size="large" />
        </View>
      </View>

      {/* Recent Assessments placeholder */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Recent Assessments</Text>
        <View style={[styles.emptyCard, Shadows.card]}>
          <Text style={styles.emptyIcon}>📋</Text>
          <Text style={styles.emptyText}>No assessments yet</Text>
          <Text style={styles.emptySubtext}>
            Start a new assessment to see results here
          </Text>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  container: {
    padding: Spacing.lg,
    paddingBottom: Spacing.xxl,
  },

  // Greeting
  greetingSection: {
    marginBottom: Spacing.lg,
  },
  greeting: {
    fontFamily: Typography.regular,
    fontSize: 16,
    color: Colors.textSecondary,
  },
  userName: {
    fontFamily: Typography.bold,
    fontSize: 26,
    color: Colors.textPrimary,
    marginTop: Spacing.xxs,
  },

  // Stats
  statsRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginBottom: Spacing.lg,
  },
  statCard: {
    flex: 1,
    backgroundColor: Colors.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: Spacing.md,
    alignItems: 'center',
  },
  statNumber: {
    fontFamily: Typography.bold,
    fontSize: 28,
    color: Colors.primary,
    fontVariant: ['tabular-nums'],
  },
  statLabel: {
    fontFamily: Typography.medium,
    fontSize: 13,
    color: Colors.textSecondary,
    marginTop: Spacing.xxs,
  },

  // CTA
  ctaButton: {
    marginBottom: Spacing.lg,
  },

  // Sections
  section: {
    marginBottom: Spacing.lg,
  },
  sectionTitle: {
    fontFamily: Typography.semiBold,
    fontSize: 18,
    color: Colors.textPrimary,
    marginBottom: Spacing.sm,
  },
  badgeRow: {
    flexDirection: 'row',
    gap: Spacing.xs,
    marginBottom: Spacing.xs,
  },

  // Empty state
  emptyCard: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: Spacing.xl,
    alignItems: 'center',
  },
  emptyIcon: {
    fontSize: 32,
    marginBottom: Spacing.xs,
  },
  emptyText: {
    fontFamily: Typography.semiBold,
    fontSize: 16,
    color: Colors.textPrimary,
  },
  emptySubtext: {
    fontFamily: Typography.regular,
    fontSize: 14,
    color: Colors.textSecondary,
    marginTop: Spacing.xxs,
    textAlign: 'center',
  },
});
