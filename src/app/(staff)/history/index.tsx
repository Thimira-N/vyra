/**
 * Staff History List — Spec §6.2
 * List of the staff user's own past assessments.
 * Each row: patient name, date, risk badge, review status.
 * Placeholder for Phase F0. Full implementation in Phase F3.
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Stack, Link } from 'expo-router';
import { Colors, Typography, Spacing, Shadows } from '@/constants/theme';
import RiskBadge from '@/components/ui/RiskBadge';

export default function HistoryListScreen() {
  return (
    <>
      <Stack.Screen options={{ title: 'Assessment History', headerStyle: { backgroundColor: Colors.primary }, headerTintColor: Colors.surface, headerTitleStyle: { fontFamily: Typography.semiBold } }} />
      <View style={styles.screen}>
        {/* Example rows — placeholder data */}
        <Link href={{ pathname: '/(staff)/history/[id]', params: { id: 'example-1' } }} style={styles.rowLink}>
          <View style={[styles.row, Shadows.card]}>
            <View style={styles.rowLeft}>
              <Text style={styles.patientName}>K. Perera</Text>
              <Text style={styles.date}>29 Jul 2026</Text>
            </View>
            <View style={styles.rowRight}>
              <RiskBadge level="High" size="small" />
              <Text style={styles.status}>Pending Review</Text>
            </View>
          </View>
        </Link>

        <Link href={{ pathname: '/(staff)/history/[id]', params: { id: 'example-2' } }} style={styles.rowLink}>
          <View style={[styles.row, Shadows.card]}>
            <View style={styles.rowLeft}>
              <Text style={styles.patientName}>A. Fernando</Text>
              <Text style={styles.date}>28 Jul 2026</Text>
            </View>
            <View style={styles.rowRight}>
              <RiskBadge level="Low" size="small" />
              <Text style={[styles.status, styles.statusReviewed]}>Reviewed</Text>
            </View>
          </View>
        </Link>

        {/* Empty state hint */}
        <View style={styles.emptyHint}>
          <Text style={styles.emptyText}>
            Assessment history will populate from real API data in Phase F3.
          </Text>
        </View>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: Colors.background,
    padding: Spacing.lg,
  },
  rowLink: {
    marginBottom: Spacing.sm,
  },
  row: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: Spacing.md,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  rowLeft: {
    flex: 1,
  },
  patientName: {
    fontFamily: Typography.semiBold,
    fontSize: 15,
    color: Colors.textPrimary,
  },
  date: {
    fontFamily: Typography.regular,
    fontSize: 13,
    color: Colors.textSecondary,
    marginTop: Spacing.xxs,
  },
  rowRight: {
    alignItems: 'flex-end',
    gap: Spacing.xxs,
  },
  status: {
    fontFamily: Typography.medium,
    fontSize: 12,
    color: Colors.riskMedium,
  },
  statusReviewed: {
    color: Colors.riskLow,
  },
  emptyHint: {
    marginTop: Spacing.xl,
    alignItems: 'center',
  },
  emptyText: {
    fontFamily: Typography.regular,
    fontSize: 13,
    color: Colors.textSecondary,
    textAlign: 'center',
    fontStyle: 'italic',
  },
});
