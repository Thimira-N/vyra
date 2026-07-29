/**
 * Case Detail — Spec §6.3
 * Full assessment detail (same layout as Staff Result screen) plus
 * Clinical Notes text field and "Mark as Reviewed" button.
 * Placeholder for Phase F0. Full implementation in Phase F4.
 */

import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { Stack, useLocalSearchParams } from 'expo-router';
import { Colors, Typography, Spacing, Shadows } from '@/constants/theme';
import RiskBadge from '@/components/ui/RiskBadge';
import TextField from '@/components/ui/TextField';
import Button from '@/components/ui/Button';

export default function CaseDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();

  return (
    <>
      <Stack.Screen options={{ title: 'Case Detail', headerStyle: { backgroundColor: Colors.primary }, headerTintColor: Colors.surface, headerTitleStyle: { fontFamily: Typography.semiBold } }} />
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
      >
        {/* Case ID */}
        <Text style={styles.caseRef}>Case: {id}</Text>

        {/* Risk header */}
        <View style={styles.riskHeader}>
          <RiskBadge level="High" size="large" />
          <Text style={styles.triageTier}>IMMEDIATE</Text>
          <Text style={styles.submittedBy}>Submitted by: Nurse Silva • 29 Jul 2026</Text>
        </View>

        {/* Patient info */}
        <View style={[styles.card, Shadows.card]}>
          <Text style={styles.cardTitle}>Patient</Text>
          <Text style={styles.cardText}>PT-2026-0042 • K. Perera • 54M</Text>
        </View>

        {/* AI Assessment summary */}
        <View style={[styles.card, Shadows.card]}>
          <Text style={styles.cardTitle}>AI Risk Assessment</Text>
          <View style={styles.modalityRow}>
            <Text style={styles.modalityLabel}>Image:</Text>
            <RiskBadge level="High" size="small" />
          </View>
          <View style={styles.modalityRow}>
            <Text style={styles.modalityLabel}>Symptoms:</Text>
            <RiskBadge level="Medium" size="small" />
          </View>
          <View style={styles.modalityRow}>
            <Text style={styles.modalityLabel}>Vitals:</Text>
            <RiskBadge level="High" size="small" />
          </View>
        </View>

        {/* Reviewer risk override */}
        <View style={[styles.overrideCard, Shadows.card]}>
          <Text style={styles.overrideTitle}>Reviewer Risk Override</Text>
          <Text style={styles.overrideHint}>
            Override the AI risk level only if you clinically disagree.
            This is logged as a reviewer override, separate from the AI assessment.
          </Text>
          <View style={styles.overrideOptions}>
            <Text style={[styles.overrideOption, { color: Colors.riskLow }]}>Low</Text>
            <Text style={[styles.overrideOption, { color: Colors.riskMedium }]}>Medium</Text>
            <Text style={[styles.overrideOption, styles.overrideOptionActive, { color: Colors.riskHigh }]}>High ← AI</Text>
          </View>
        </View>

        {/* Clinical Notes */}
        <View style={[styles.notesCard, Shadows.card]}>
          <Text style={styles.notesTitle}>Clinical Notes</Text>
          <TextField
            placeholder="Add your clinical assessment notes..."
            multiline
            numberOfLines={4}
            containerStyle={styles.notesInput}
          />
        </View>

        {/* Action */}
        <Button title="Mark as Reviewed" onPress={() => {}} />
        <Button title="Export Report" onPress={() => {}} variant="outline" style={styles.exportButton} />
      </ScrollView>
    </>
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
  caseRef: {
    fontFamily: Typography.medium,
    fontSize: 13,
    color: Colors.textSecondary,
    marginBottom: Spacing.xs,
  },

  // Risk header
  riskHeader: {
    alignItems: 'center',
    paddingVertical: Spacing.md,
    marginBottom: Spacing.md,
  },
  triageTier: {
    fontFamily: Typography.semiBold,
    fontSize: 14,
    color: Colors.riskHigh,
    letterSpacing: 1,
    marginTop: Spacing.xs,
  },
  submittedBy: {
    fontFamily: Typography.regular,
    fontSize: 13,
    color: Colors.textSecondary,
    marginTop: Spacing.xxs,
  },

  // Cards
  card: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
  },
  cardTitle: {
    fontFamily: Typography.semiBold,
    fontSize: 15,
    color: Colors.textPrimary,
    marginBottom: Spacing.xs,
  },
  cardText: {
    fontFamily: Typography.regular,
    fontSize: 14,
    color: Colors.textPrimary,
    fontVariant: ['tabular-nums'],
  },

  // Modality rows
  modalityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing.xxs,
  },
  modalityLabel: {
    fontFamily: Typography.medium,
    fontSize: 13,
    color: Colors.textSecondary,
    width: 80,
  },

  // Override
  overrideCard: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.riskMedium + '40',
    padding: Spacing.md,
    marginBottom: Spacing.sm,
  },
  overrideTitle: {
    fontFamily: Typography.semiBold,
    fontSize: 15,
    color: Colors.textPrimary,
    marginBottom: Spacing.xxs,
  },
  overrideHint: {
    fontFamily: Typography.regular,
    fontSize: 12,
    color: Colors.textSecondary,
    lineHeight: 17,
    marginBottom: Spacing.sm,
  },
  overrideOptions: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  overrideOption: {
    fontFamily: Typography.medium,
    fontSize: 14,
    paddingVertical: Spacing.xxs,
    paddingHorizontal: Spacing.sm,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.border,
    overflow: 'hidden',
  },
  overrideOptionActive: {
    fontFamily: Typography.semiBold,
    borderWidth: 2,
  },

  // Notes
  notesCard: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: Spacing.md,
    marginBottom: Spacing.lg,
  },
  notesTitle: {
    fontFamily: Typography.semiBold,
    fontSize: 15,
    color: Colors.textPrimary,
    marginBottom: Spacing.xs,
  },
  notesInput: {
    marginBottom: 0,
  },

  exportButton: {
    marginTop: Spacing.sm,
  },
});
