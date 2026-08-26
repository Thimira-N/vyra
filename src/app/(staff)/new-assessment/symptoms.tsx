/**
 * Step 1b: Symptoms — Spec §6.2, UI Upgrade U4
 *
 * "Clinical Glass" restyle:
 * - Screen wrapper with gradient mesh + blob accents
 * - ProgressSteps indicator
 * - Multiline input with surfaceSunken background and clear character counter
 * - Safe area & bottom clearance
 * - Preserved logic: validation, assessmentDraftStore integration
 */

import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput } from 'react-native';
import { router } from 'expo-router';
import { useTheme } from '@/hooks/use-theme';
import { TypographyScale, Spacing, Radius } from '@/constants/theme';
import { Screen } from '@/components/ui/Screen';
import { GlassCard } from '@/components/ui/GlassCard';
import ProgressSteps from '@/components/ui/ProgressSteps';
import Button from '@/components/ui/Button';
import { useAssessmentDraftStore } from '@/store/assessmentDraftStore';

const STEPS = ['Patient', 'Symptoms', 'Image', 'Vitals', 'Review'];
const MAX_CHARS = 2000;

export default function SymptomsScreen() {
  const { colors } = useTheme();
  const storedText = useAssessmentDraftStore((s) => s.symptoms_text);
  const setSymptoms = useAssessmentDraftStore((s) => s.setSymptoms);

  const [text, setText] = useState(storedText);
  const [error, setError] = useState('');

  function handleNext() {
    if (!text.trim()) {
      setError("Please describe the patient's symptoms before proceeding.");
      return;
    }
    setSymptoms(text.trim());
    router.push('/(staff)/new-assessment/image-capture');
  }

  return (
    <Screen safeArea={true}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <ProgressSteps steps={STEPS} currentStep={1} />

        <View style={styles.content}>
          <Text style={[TypographyScale.h1, styles.title, { color: colors.textPrimary }]}>
            Symptom Description
          </Text>
          <Text style={[TypographyScale.body, styles.description, { color: colors.textSecondary }]}>
            Describe the patient's symptoms in clinical detail. Include onset, duration,
            severity, and any relevant observations.
          </Text>

          <GlassCard tint="elevated" elevation="raised" radius="md" style={styles.inputCard}>
            <View style={styles.cardInner}>
              <TextInput
                style={[
                  styles.textArea,
                  {
                    color: colors.textPrimary,
                    backgroundColor: colors.surfaceSunken,
                    borderColor: error ? colors.danger : colors.border,
                    borderRadius: Radius.md,
                    fontFamily: TypographyScale.body.fontFamily,
                  },
                ]}
                multiline
                numberOfLines={8}
                placeholder={'e.g. Severe difficulty breathing with onset 6 hours ago.\nConfusion and disorientation noted.\nPatient reports chest tightness and productive cough with yellow-green sputum.\nNo known drug allergies.'}
                placeholderTextColor={colors.textTertiary}
                value={text}
                onChangeText={(t) => {
                  setText(t);
                  if (error) setError('');
                }}
                maxLength={MAX_CHARS}
                textAlignVertical="top"
              />
              <View style={styles.inputFooter}>
                {error ? (
                  <Text style={[TypographyScale.caption, { color: colors.danger }]}>
                    {error}
                  </Text>
                ) : (
                  <View />
                )}
                <Text style={[TypographyScale.caption, { color: colors.textTertiary, fontVariant: ['tabular-nums'] }]}>
                  {text.length} / {MAX_CHARS}
                </Text>
              </View>
            </View>
          </GlassCard>

          <Button title="Next: Image Capture →" onPress={handleNext} style={styles.nextButton} />
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
  inputCard: {
    marginBottom: Spacing.lg,
  },
  cardInner: {
    padding: Spacing.md,
  },
  textArea: {
    fontSize: 15,
    borderWidth: 1.5,
    padding: Spacing.md,
    minHeight: 180,
    lineHeight: 22,
  },
  inputFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: Spacing.xs,
  },
  nextButton: {
    marginTop: Spacing.xs,
  },
});
