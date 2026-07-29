/**
 * Step 3: Vitals — Spec §6.2
 * Numeric input grid for HR, O2Sat, Temp, SBP, DBP, Resp
 * with normal ranges as helper text.
 * Placeholder for Phase F0. Full VitalsInputGrid component in Phase F2.
 */

import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { Link } from 'expo-router';
import { Colors, Typography, Spacing, Shadows } from '@/constants/theme';
import ProgressSteps from '@/components/ui/ProgressSteps';
import TextField from '@/components/ui/TextField';
import Button from '@/components/ui/Button';

const STEPS = ['Patient', 'Symptoms', 'Image', 'Vitals', 'Review'];

/** Core vital signs with their normal ranges */
const VITALS = [
  { key: 'HR', label: 'Heart Rate', unit: 'bpm', range: '60–100' },
  { key: 'O2Sat', label: 'SpO₂', unit: '%', range: '95–100' },
  { key: 'Temp', label: 'Temperature', unit: '°C', range: '36.1–37.2' },
  { key: 'SBP', label: 'Systolic BP', unit: 'mmHg', range: '90–120' },
  { key: 'DBP', label: 'Diastolic BP', unit: 'mmHg', range: '60–80' },
  { key: 'Resp', label: 'Resp Rate', unit: '/min', range: '12–20' },
];

export default function VitalsScreen() {
  return (
    <ScrollView
      style={styles.scroll}
      contentContainerStyle={styles.container}
      showsVerticalScrollIndicator={false}
    >
      <ProgressSteps steps={STEPS} currentStep={3} />

      <View style={styles.content}>
        <Text style={styles.title}>Vital Signs</Text>
        <Text style={styles.description}>
          Enter the patient's current vital signs measurements.
        </Text>

        <View style={[styles.card, Shadows.card]}>
          <View style={styles.grid}>
            {VITALS.map((vital) => (
              <View key={vital.key} style={styles.gridItem}>
                <TextField
                  label={`${vital.label} (${vital.unit})`}
                  placeholder={vital.key}
                  keyboardType="numeric"
                  helperText={`Normal: ${vital.range} ${vital.unit}`}
                />
              </View>
            ))}
          </View>
        </View>

        {/* Advanced vitals (collapsed) */}
        <View style={[styles.advancedSection, Shadows.card]}>
          <Text style={styles.advancedTitle}>▸ Advanced (MAP, Age, etc.)</Text>
          <Text style={styles.advancedHint}>
            Tap to expand additional vital sign fields
          </Text>
        </View>

        <Link href="/(staff)/new-assessment/review-submit" asChild>
          <Button title="Next: Review →" onPress={() => {}} />
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
    marginBottom: Spacing.md,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.xs,
  },
  gridItem: {
    width: '48%',
  },
  advancedSection: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: Spacing.md,
    marginBottom: Spacing.lg,
  },
  advancedTitle: {
    fontFamily: Typography.semiBold,
    fontSize: 14,
    color: Colors.textPrimary,
  },
  advancedHint: {
    fontFamily: Typography.regular,
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: Spacing.xxs,
  },
});
