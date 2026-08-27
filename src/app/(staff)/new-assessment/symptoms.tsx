/**
 * Step 1b: Symptoms — Spec §6.2, UI Upgrade U4
 *
 * Premium Clinical Symptoms Entry:
 * - Clean progress indicator at top
 * - Quick-insert clinical symptom chips for rapid triage documentation
 * - Elevated textarea with live character counter & focus states
 * - Preserved logic: validation, assessmentDraftStore integration
 */

import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/hooks/use-theme';
import { TypographyScale, Spacing, Radius } from '@/constants/theme';
import { Screen } from '@/components/ui/Screen';
import { GlassCard } from '@/components/ui/GlassCard';
import ProgressSteps from '@/components/ui/ProgressSteps';
import Button from '@/components/ui/Button';
import { useAssessmentDraftStore } from '@/store/assessmentDraftStore';

const STEPS = ['Patient', 'Symptoms', 'Image', 'Vitals', 'Review'];
const MAX_CHARS = 2000;

const QUICK_SYMPTOMS = [
  'Dyspnea / Shortness of breath',
  'Chest pain / Tightness',
  'High grade fever & chills',
  'Productive cough',
  'Altered mental status',
  'Cyanosis / Low perfusion',
  'Dizziness / Presyncope',
  'Diaphoresis (Profuse sweating)',
];

export default function SymptomsScreen() {
  const { colors, isDark } = useTheme();
  const storedText = useAssessmentDraftStore((s) => s.symptoms_text);
  const setSymptoms = useAssessmentDraftStore((s) => s.setSymptoms);

  const [text, setText] = useState(storedText);
  const [error, setError] = useState('');
  const [isFocused, setIsFocused] = useState(false);

  function handleAddSymptom(symptom: string) {
    if (text.includes(symptom)) return;
    const newText = text.trim() ? `${text.trim()}\n• ${symptom}` : `• ${symptom}`;
    setText(newText);
    if (error) setError('');
  }

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
            Detail the patient's chief complaints, onset timeline, severity, and clinical observations.
          </Text>

          {/* Quick-insert Symptom Chips */}
          <View style={styles.quickSection}>
            <Text style={[styles.quickHeading, { color: colors.textSecondary }]}>
              Quick Clinical Markers
            </Text>
            <View style={styles.chipWrap}>
              {QUICK_SYMPTOMS.map((sym) => {
                const isAdded = text.includes(sym);
                return (
                  <TouchableOpacity
                    key={sym}
                    style={[
                      styles.chip,
                      {
                        backgroundColor: isAdded
                          ? `${colors.primary}20`
                          : isDark
                            ? colors.surfaceSunken
                            : '#F1F5F9',
                        borderColor: isAdded ? colors.primary : colors.border,
                      },
                    ]}
                    onPress={() => handleAddSymptom(sym)}
                    activeOpacity={0.7}
                  >
                    <Ionicons
                      name={isAdded ? 'checkmark' : 'add'}
                      size={12}
                      color={isAdded ? colors.primary : colors.textSecondary}
                      style={{ marginRight: 4 }}
                    />
                    <Text
                      style={[
                        styles.chipText,
                        { color: isAdded ? colors.primary : colors.textPrimary, fontWeight: isAdded ? '700' : '500' },
                      ]}
                    >
                      {sym}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          {/* Main Text Input Card */}
          <GlassCard tint="elevated" elevation="raised" radius="lg" style={styles.inputCard}>
            <View style={styles.cardInner}>
              <TextInput
                style={[
                  styles.textArea,
                  {
                    color: colors.textPrimary,
                    backgroundColor: colors.surfaceSunken,
                    borderColor: error
                      ? colors.danger
                      : isFocused
                        ? colors.primary
                        : colors.border,
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
                onFocus={() => setIsFocused(true)}
                onBlur={() => setIsFocused(false)}
                maxLength={MAX_CHARS}
                textAlignVertical="top"
              />
              <View style={styles.inputFooter}>
                {error ? (
                  <Text style={[TypographyScale.caption, { color: colors.danger, fontWeight: '600' }]}>
                    {error}
                  </Text>
                ) : (
                  <Text style={[TypographyScale.caption, { color: colors.textTertiary }]}>
                    Supports natural language medical notes
                  </Text>
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
    paddingTop: Spacing.sm,
    paddingBottom: 96,
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
  quickSection: {
    marginBottom: Spacing.md,
  },
  quickHeading: {
    fontFamily: TypographyScale.caption.fontFamily,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.3,
    marginBottom: Spacing.xs,
  },
  chipWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: Radius.pill,
    borderWidth: 1,
  },
  chipText: {
    fontSize: 11,
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
