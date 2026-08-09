/**
 * Step 1b: Symptoms — Spec §6.2
 *
 * Large multiline text field for free-text symptom description
 * (matches /predict-text input). Character counter, placeholder examples.
 * Stored in draft store on "Next."
 */

import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput } from 'react-native';
import { router } from 'expo-router';
import { Colors, Typography, Spacing } from '@/constants/theme';
import ProgressSteps from '@/components/ui/ProgressSteps';
import Button from '@/components/ui/Button';
import { useAssessmentDraftStore } from '@/store/assessmentDraftStore';

const STEPS = ['Patient', 'Symptoms', 'Image', 'Vitals', 'Review'];
const MAX_CHARS = 2000;

export default function SymptomsScreen() {
  const storedText = useAssessmentDraftStore((s) => s.symptoms_text);
  const setSymptoms = useAssessmentDraftStore((s) => s.setSymptoms);

  const [text, setText] = useState(storedText);
  const [error, setError] = useState('');

  function handleNext() {
    if (!text.trim()) {
      setError('Please describe the patient\'s symptoms before proceeding.');
      return;
    }
    setSymptoms(text.trim());
    router.push('/(staff)/new-assessment/image-capture');
  }

  return (
    <ScrollView
      style={styles.scroll}
      contentContainerStyle={styles.container}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
    >
      <ProgressSteps steps={STEPS} currentStep={1} />

      <View style={styles.content}>
        <Text style={styles.title}>Symptom Description</Text>
        <Text style={styles.description}>
          Describe the patient's symptoms in clinical detail. Include onset, duration,
          severity, and any relevant observations.
        </Text>

        <View style={styles.inputContainer}>
          <TextInput
            style={[styles.textArea, error ? styles.textAreaError : null]}
            multiline
            numberOfLines={8}
            placeholder={'e.g. Severe difficulty breathing with onset 6 hours ago.\nConfusion and disorientation noted.\nPatient reports chest tightness and productive cough with yellow-green sputum.\nNo known drug allergies.'}
            placeholderTextColor={Colors.textSecondary}
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
              <Text style={styles.errorText}>{error}</Text>
            ) : (
              <View />
            )}
            <Text style={styles.charCount}>
              {text.length} / {MAX_CHARS}
            </Text>
          </View>
        </View>

        <Button title="Next: Image Capture →" onPress={handleNext} />
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
    lineHeight: 21,
    marginBottom: Spacing.lg,
  },
  inputContainer: {
    marginBottom: Spacing.lg,
  },
  textArea: {
    fontFamily: Typography.regular,
    fontSize: 15,
    color: Colors.textPrimary,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 12,
    padding: Spacing.md,
    minHeight: 180,
    lineHeight: 22,
  },
  textAreaError: {
    borderColor: Colors.riskHigh,
  },
  inputFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: Spacing.xxs,
  },
  charCount: {
    fontFamily: Typography.regular,
    fontSize: 12,
    color: Colors.textSecondary,
    fontVariant: ['tabular-nums'],
  },
  errorText: {
    fontFamily: Typography.medium,
    fontSize: 12,
    color: Colors.riskHigh,
  },
});
