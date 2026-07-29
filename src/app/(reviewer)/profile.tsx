/**
 * Reviewer Profile — Spec §6.3
 * Same pattern as staff profile.
 * Placeholder for Phase F0. Full implementation in Phase F5.
 */

import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { Colors, Typography, Spacing, Shadows } from '@/constants/theme';
import Button from '@/components/ui/Button';

export default function ReviewerProfileScreen() {
  return (
    <ScrollView
      style={styles.scroll}
      contentContainerStyle={styles.container}
      showsVerticalScrollIndicator={false}
    >
      {/* Avatar */}
      <View style={styles.avatarSection}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>RV</Text>
        </View>
        <Text style={styles.name}>Reviewer User</Text>
        <Text style={styles.role}>Reviewer</Text>
      </View>

      {/* Info card */}
      <View style={[styles.card, Shadows.card]}>
        <ProfileRow label="Email" value="reviewer@clinic.lk" />
        <View style={styles.divider} />
        <ProfileRow label="Facility" value="Negombo Base Hospital" />
        <View style={styles.divider} />
        <ProfileRow label="Cases Reviewed" value="—" />
      </View>

      {/* Actions */}
      <View style={styles.actions}>
        <Button title="View Consent Agreement" onPress={() => {}} variant="outline" />
        <Button title="Log Out" onPress={() => {}} variant="outline" style={styles.logoutButton} />
      </View>

      <Text style={styles.version}>Vyra v1.0.0 • Clinical RSS</Text>
    </ScrollView>
  );
}

function ProfileRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.row}>
      <Text style={styles.rowLabel}>{label}</Text>
      <Text style={styles.rowValue}>{value}</Text>
    </View>
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
  avatarSection: {
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  avatar: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: Colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.sm,
  },
  avatarText: {
    fontFamily: Typography.bold,
    fontSize: 24,
    color: Colors.surface,
  },
  name: {
    fontFamily: Typography.bold,
    fontSize: 22,
    color: Colors.textPrimary,
  },
  role: {
    fontFamily: Typography.medium,
    fontSize: 14,
    color: Colors.textSecondary,
    marginTop: Spacing.xxs,
  },
  card: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: Spacing.md,
    marginBottom: Spacing.lg,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Spacing.sm,
  },
  rowLabel: {
    fontFamily: Typography.medium,
    fontSize: 14,
    color: Colors.textSecondary,
  },
  rowValue: {
    fontFamily: Typography.regular,
    fontSize: 14,
    color: Colors.textPrimary,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.border,
  },
  actions: {
    gap: Spacing.sm,
    marginBottom: Spacing.lg,
  },
  logoutButton: {
    borderColor: Colors.riskHigh,
  },
  version: {
    fontFamily: Typography.regular,
    fontSize: 12,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
});
