/**
 * Step 3: Vitals — Spec §6.2
 *
 * Uses VitalsInputGrid component for HR, O2Sat, Temp, SBP, DBP, Resp
 * with normal ranges as helper text. Expandable advanced section for
 * MAP, Age, etc. Values stored in draft store on "Next".
 */

import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { router } from 'expo-router';
import { Colors, Typography, Spacing, Shadows } from '@/constants/theme';
import ProgressSteps from '@/components/ui/ProgressSteps';
import Button from '@/components/ui/Button';
import VitalsInputGrid from '@/components/ui/VitalsInputGrid';
import { useAssessmentDraftStore } from '@/store/assessmentDraftStore';

const STEPS = ['Patient', 'Symptoms', 'Image', 'Vitals', 'Review'];

export default function VitalsScreen() {
  const storedVitals = useAssessmentDraftStore((s) => s.vitals);
  const setVitalsStore = useAssessmentDraftStore((s) => s.setVitals);

  const [vitals, setVitals] = useState<Record<string, number>>(storedVitals);
  const [error, setError] = useState('');

  function handleNext() {
    // At least one core vital should be entered
    const coreKeys = ['HR', 'O2Sat', 'Temp', 'SBP', 'DBP', 'Resp'];
    const hasAnyCoreVital = coreKeys.some((k) => vitals[k] !== undefined);

    if (!hasAnyCoreVital) {
      setError('Please enter at least one vital sign measurement.');
      return;
    }

    setVitalsStore(vitals);
    router.push('/(staff)/new-assessment/review-submit');
  }

  return (
    <ScrollView
      style={styles.scroll}
      contentContainerStyle={styles.container}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
    >
      <ProgressSteps steps={STEPS} currentStep={3} />

      <View style={styles.content}>
        <Text style={styles.title}>Vital Signs</Text>
        <Text style={styles.description}>
          Enter the patient's current vital signs measurements.
        </Text>

        {error ? (
          <View style={styles.errorBanner}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        ) : null}

        <View style={[styles.card, Shadows.card]}>
          <VitalsInputGrid
            values={vitals}
            onChange={(v) => {
              setVitals(v);
              if (error) setError('');
            }}
          />
        </View>

        <Button title="Next: Review →" onPress={handleNext} />
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
  errorBanner: {
    backgroundColor: Colors.riskHigh + '12',
    borderWidth: 1,
    borderColor: Colors.riskHigh + '30',
    borderRadius: 10,
    padding: Spacing.sm,
    marginBottom: Spacing.md,
  },
  errorText: {
    fontFamily: Typography.medium,
    fontSize: 13,
    color: Colors.riskHigh,
    lineHeight: 19,
  },
});
