/**
 * History Detail — Spec §6.2
 * Same layout as Result screen, read-only, plus reviewer notes if reviewed.
 * Placeholder for Phase F0. Full implementation in Phase F3.
 */

import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { Stack, useLocalSearchParams } from 'expo-router';
import { Colors, Typography, Spacing, Shadows } from '@/constants/theme';
import RiskBadge from '@/components/ui/RiskBadge';

export default function HistoryDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();

  return (
    <>
      <Stack.Screen options={{ title: 'Assessment Detail', headerStyle: { backgroundColor: Colors.primary }, headerTintColor: Colors.surface, headerTitleStyle: { fontFamily: Typography.semiBold } }} />
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
      >
        {/* Assessment ID */}
        <Text style={styles.assessmentRef}>Assessment: {id}</Text>

        {/* Risk header */}
        <View style={styles.riskHeader}>
          <RiskBadge level="High" size="large" />
          <Text style={styles.date}>29 Jul 2026 at 14:32</Text>
        </View>

        {/* Patient info */}
        <View style={[styles.card, Shadows.card]}>
          <Text style={styles.cardTitle}>Patient</Text>
          <Text style={styles.cardText}>Patient details will load from API</Text>
        </View>

        {/* Result summary */}
        <View style={[styles.card, Shadows.card]}>
          <Text style={styles.cardTitle}>Risk Assessment</Text>
          <Text style={styles.cardText}>Full assessment result will appear here</Text>
        </View>

        {/* Reviewer notes (shown if reviewed) */}
        <View style={[styles.reviewCard, Shadows.card]}>
          <Text style={styles.reviewTitle}>Reviewer Notes</Text>
          <Text style={styles.reviewNote}>
            Reviewer notes will appear here if status is "reviewed".
            Hidden if assessment is still pending review.
          </Text>
        </View>

        {/* Actions */}
        <View style={styles.actions}>
          <Text style={styles.actionLink}>View PDF Report</Text>
        </View>
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
  assessmentRef: {
    fontFamily: Typography.medium,
    fontSize: 13,
    color: Colors.textSecondary,
    marginBottom: Spacing.xs,
  },
  riskHeader: {
    alignItems: 'center',
    paddingVertical: Spacing.md,
    marginBottom: Spacing.md,
  },
  date: {
    fontFamily: Typography.regular,
    fontSize: 13,
    color: Colors.textSecondary,
    marginTop: Spacing.xs,
  },
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
    color: Colors.textSecondary,
    fontStyle: 'italic',
  },
  reviewCard: {
    backgroundColor: Colors.primaryLight + '10',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.primaryLight + '30',
    padding: Spacing.md,
    marginBottom: Spacing.lg,
  },
  reviewTitle: {
    fontFamily: Typography.semiBold,
    fontSize: 15,
    color: Colors.primary,
    marginBottom: Spacing.xs,
  },
  reviewNote: {
    fontFamily: Typography.regular,
    fontSize: 14,
    color: Colors.textPrimary,
    fontStyle: 'italic',
    lineHeight: 21,
  },
  actions: {
    alignItems: 'center',
  },
  actionLink: {
    fontFamily: Typography.medium,
    fontSize: 14,
    color: Colors.primaryLight,
  },
});
