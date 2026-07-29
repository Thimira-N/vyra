/**
 * Reviewer Dashboard — Spec §6.3
 * List of ALL submitted assessments across all staff.
 * Filter chips: All / Pending Review / Reviewed, and by risk level.
 * Placeholder for Phase F0. Full implementation in Phase F4.
 */

import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Link } from 'expo-router';
import { Colors, Typography, Spacing, Shadows } from '@/constants/theme';
import RiskBadge from '@/components/ui/RiskBadge';

const FILTER_CHIPS = ['All', 'Pending', 'Reviewed'];
const RISK_CHIPS = ['Low', 'Medium', 'High'];

export default function ReviewerDashboardScreen() {
  return (
    <ScrollView
      style={styles.scroll}
      contentContainerStyle={styles.container}
      showsVerticalScrollIndicator={false}
    >
      {/* Filter chips */}
      <View style={styles.filtersSection}>
        <View style={styles.chipRow}>
          {FILTER_CHIPS.map((chip, index) => (
            <TouchableOpacity
              key={chip}
              style={[styles.chip, index === 0 && styles.chipActive]}
            >
              <Text style={[styles.chipText, index === 0 && styles.chipTextActive]}>
                {chip}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
        <View style={styles.chipRow}>
          {RISK_CHIPS.map((chip) => (
            <TouchableOpacity key={chip} style={styles.chip}>
              <Text style={styles.chipText}>{chip} Risk</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Assessment rows */}
      <Link href={{ pathname: '/(reviewer)/case/[id]', params: { id: 'example-case-1' } }} style={styles.rowLink}>
        <View style={[styles.row, Shadows.card]}>
          <View style={styles.rowTop}>
            <Text style={styles.patientRef}>PT-2026-0042</Text>
            <RiskBadge level="High" size="small" />
          </View>
          <Text style={styles.staffName}>Submitted by: Nurse Silva</Text>
          <View style={styles.rowBottom}>
            <Text style={styles.date}>29 Jul 2026</Text>
            <Text style={styles.statusPending}>Pending Review</Text>
          </View>
        </View>
      </Link>

      <Link href={{ pathname: '/(reviewer)/case/[id]', params: { id: 'example-case-2' } }} style={styles.rowLink}>
        <View style={[styles.row, Shadows.card]}>
          <View style={styles.rowTop}>
            <Text style={styles.patientRef}>PT-2026-0038</Text>
            <RiskBadge level="Medium" size="small" />
          </View>
          <Text style={styles.staffName}>Submitted by: Dr. Perera</Text>
          <View style={styles.rowBottom}>
            <Text style={styles.date}>28 Jul 2026</Text>
            <Text style={styles.statusPending}>Pending Review</Text>
          </View>
        </View>
      </Link>

      <Link href={{ pathname: '/(reviewer)/case/[id]', params: { id: 'example-case-3' } }} style={styles.rowLink}>
        <View style={[styles.row, Shadows.card]}>
          <View style={styles.rowTop}>
            <Text style={styles.patientRef}>PT-2026-0031</Text>
            <RiskBadge level="Low" size="small" />
          </View>
          <Text style={styles.staffName}>Submitted by: Nurse Fernando</Text>
          <View style={styles.rowBottom}>
            <Text style={styles.date}>27 Jul 2026</Text>
            <Text style={styles.statusReviewed}>Reviewed ✓</Text>
          </View>
        </View>
      </Link>

      <View style={styles.emptyHint}>
        <Text style={styles.emptyText}>
          Dashboard will load real data from the reviewer API in Phase F4.
        </Text>
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

  // Filters
  filtersSection: {
    marginBottom: Spacing.md,
    gap: Spacing.xs,
  },
  chipRow: {
    flexDirection: 'row',
    gap: Spacing.xs,
  },
  chip: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xxs + 2,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.surface,
  },
  chipActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  chipText: {
    fontFamily: Typography.medium,
    fontSize: 13,
    color: Colors.textSecondary,
  },
  chipTextActive: {
    color: Colors.surface,
  },

  // Rows
  rowLink: {
    marginBottom: Spacing.sm,
  },
  row: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: Spacing.md,
  },
  rowTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.xxs,
  },
  patientRef: {
    fontFamily: Typography.semiBold,
    fontSize: 15,
    color: Colors.textPrimary,
    fontVariant: ['tabular-nums'],
  },
  staffName: {
    fontFamily: Typography.regular,
    fontSize: 13,
    color: Colors.textSecondary,
    marginBottom: Spacing.xs,
  },
  rowBottom: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  date: {
    fontFamily: Typography.regular,
    fontSize: 12,
    color: Colors.textSecondary,
  },
  statusPending: {
    fontFamily: Typography.medium,
    fontSize: 12,
    color: Colors.riskMedium,
  },
  statusReviewed: {
    fontFamily: Typography.medium,
    fontSize: 12,
    color: Colors.riskLow,
  },

  emptyHint: {
    marginTop: Spacing.lg,
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
