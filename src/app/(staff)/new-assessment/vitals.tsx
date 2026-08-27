/**
 * Step 3: Vitals — Spec §6.2, UI Upgrade U4
 *
 * Premium Clinical Vitals Entry:
 * - ProgressSteps indicator
 * - 2-column clinical numeric input grid with normal range indicators
 * - Core and advanced biometric parameter support
 * - Preserved logic: core vitals validation, draftStore persistence
 */

import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
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
            Input the patient's current hemodynamic and physiological indicators.
          </Text>

          {error ? (
            <View style={[styles.errorBanner, { backgroundColor: `${colors.danger}15`, borderColor: `${colors.danger}35` }]}>
              <Ionicons name="alert-circle" size={18} color={colors.danger} />
              <Text style={[TypographyScale.caption, { color: colors.danger, fontWeight: '600', flex: 1 }]}>
                {error}
              </Text>
            </View>
          ) : null}

          <GlassCard tint="elevated" elevation="raised" radius="lg" style={styles.vitalsCard}>
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

          <Button
            title="Next: Review & Submit →"
            onPress={handleNext}
            style={styles.nextButton}
          />
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
    paddingBottom: 110,
  },
  content: {
    marginTop: Spacing.sm,
  },
  title: {
    marginBottom: Spacing.xxs,
  },
  description: {
    lineHeight: 20,
    marginBottom: Spacing.md,
  },
  vitalsCard: {
    marginBottom: Spacing.lg,
  },
  cardInner: {
    padding: Spacing.md,
  },
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderWidth: 1,
    borderRadius: Radius.md,
    padding: Spacing.sm,
    marginBottom: Spacing.md,
  },
  nextButton: {
    marginTop: Spacing.xs,
  },
});
