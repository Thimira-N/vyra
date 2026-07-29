/**
 * Step 1: Patient Info — Spec §6.2
 * Search-or-create pattern: search existing patients or create new.
 * Placeholder for Phase F0. Full implementation in Phase F2.
 */

import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { Link } from 'expo-router';
import { Colors, Typography, Spacing, Shadows } from '@/constants/theme';
import ProgressSteps from '@/components/ui/ProgressSteps';
import TextField from '@/components/ui/TextField';
import Button from '@/components/ui/Button';

const STEPS = ['Patient', 'Symptoms', 'Image', 'Vitals', 'Review'];

export default function PatientInfoScreen() {
  return (
    <ScrollView
      style={styles.scroll}
      contentContainerStyle={styles.container}
      showsVerticalScrollIndicator={false}
    >
      <ProgressSteps steps={STEPS} currentStep={0} />

      <View style={styles.content}>
        <Text style={styles.title}>Patient Information</Text>
        <Text style={styles.description}>
          Search for an existing patient or create a new record.
        </Text>

        {/* Search */}
        <TextField
          label="Search Patient"
          placeholder="Search by name or patient ref..."
          helperText="e.g. PT-2026-0042 or K. Perera"
        />

        {/* New Patient form */}
        <View style={[styles.card, Shadows.card]}>
          <Text style={styles.cardTitle}>+ New Patient</Text>
          <TextField label="Full Name" placeholder="Patient full name" />
          <TextField label="Age" placeholder="Age" keyboardType="numeric" />
          <TextField label="Sex" placeholder="M / F / Other" />
          <TextField label="Phone (Optional)" placeholder="+94771234567" keyboardType="phone-pad" />
        </View>

        <Link href="/(staff)/new-assessment/symptoms" asChild>
          <Button title="Next: Symptoms →" onPress={() => {}} />
        </Link>
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
  content: {
    marginTop: Spacing.md,
  },
  title: {
    fontFamily: Typography.bold,
    fontSize: 22,
    color: Colors.textPrimary,
    marginBottom: Spacing.xxs,
  },
  description: {
    fontFamily: Typography.regular,
    fontSize: 14,
    color: Colors.textSecondary,
    marginBottom: Spacing.lg,
  },
  card: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: Spacing.md,
    marginBottom: Spacing.lg,
  },
  cardTitle: {
    fontFamily: Typography.semiBold,
    fontSize: 16,
    color: Colors.primaryLight,
    marginBottom: Spacing.sm,
  },
});
