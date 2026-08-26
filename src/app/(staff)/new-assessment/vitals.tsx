/**
 * Step 3: Vitals — Spec §6.2, UI Upgrade U4
 *
 * "Clinical Glass" restyle:
 * - Screen wrapper with gradient mesh + blob accents
 * - ProgressSteps indicator
 * - VitalsInputGrid wrapped in elevated GlassCard
 * - Safe area & bottom clearance
 * - Preserved logic: core vitals validation, draftStore persistence
 */

import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { router } from 'expo-router';
import { useTheme } from '@/hooks/use-theme';
import { TypographyScale, Spacing, Radius } from '@/constants/theme';
import { Screen } from '@/components/ui/Screen';
import { GlassCard } from '@/components/ui/GlassCard';
import ProgressSteps from '@/components/ui/ProgressSteps';
import Button from '@/components/ui/Button';
import VitalsInputGrid from '@/components/ui/VitalsInputGrid';
import { useAssessmentDraftStore } from '@/store/assessmentDraftStore';

const STEPS = ['Patient', 'Symptoms', 'Image', 'Vitals', 'Review'];

export default function VitalsScreen() {
  const { colors } = useTheme();
  const storedVitals = useAssessmentDraftStore((s) => s.vitals);
  const setVitalsStore = useAssessmentDraftStore((s) => s.setVitals);

  const [vitals, setVitals] = useState<Record<string, number>>(storedVitals);
  const [error, setError] = useState('');

  function handleNext() {
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
    <Screen safeArea={true}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <ProgressSteps steps={STEPS} currentStep={3} />

        <View style={styles.content}>
          <Text style={[TypographyScale.h1, styles.title, { color: colors.textPrimary }]}>
            Vital Signs
          </Text>
          <Text style={[TypographyScale.body, styles.description, { color: colors.textSecondary }]}>
            Enter the patient's current vital signs measurements.
          </Text>

          {error ? (
            <View style={[styles.errorBanner, { backgroundColor: `${colors.danger}15`, borderColor: `${colors.danger}35` }]}>
              <Text style={[TypographyScale.caption, { color: colors.danger, fontWeight: '600' }]}>
                {error}
              </Text>
            </View>
          ) : null}

          <GlassCard tint="elevated" elevation="raised" radius="md" style={styles.vitalsCard}>
            <View style={styles.cardInner}>
              <VitalsInputGrid
                values={vitals}
                onChange={(v) => {
                  setVitals(v);
                  if (error) setError('');
                }}
              />
            </View>
          </GlassCard>

          <Button title="Next: Review →" onPress={handleNext} style={styles.nextButton} />
        </View>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  scroll: {
    flex: 1,
  },
  container: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.md,
    paddingBottom: 96,
  },
  content: {
    marginTop: Spacing.md,
  },
  title: {
    marginBottom: Spacing.xxs,
  },
  description: {
    lineHeight: 21,
    marginBottom: Spacing.lg,
  },
  vitalsCard: {
    marginBottom: Spacing.lg,
  },
  cardInner: {
    padding: Spacing.md,
  },
  errorBanner: {
    borderWidth: 1,
    borderRadius: Radius.md,
    padding: Spacing.sm,
    marginBottom: Spacing.md,
  },
  nextButton: {
    marginTop: Spacing.xs,
  },
});
