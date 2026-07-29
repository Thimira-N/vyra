/**
 * Step 1b: Symptoms — Spec §6.2
 * Large multiline text field for free-text symptom description.
 * Placeholder for Phase F0. Full implementation in Phase F2.
 */

import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput } from 'react-native';
import { Link } from 'expo-router';
import { Colors, Typography, Spacing } from '@/constants/theme';
import ProgressSteps from '@/components/ui/ProgressSteps';
import Button from '@/components/ui/Button';

const STEPS = ['Patient', 'Symptoms', 'Image', 'Vitals', 'Review'];
const MAX_CHARS = 2000;

export default function SymptomsScreen() {
  const [text, setText] = useState('');

  return (
    <ScrollView
      style={styles.scroll}
      contentContainerStyle={styles.container}
      showsVerticalScrollIndicator={false}
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
            style={styles.textArea}
            multiline
            numberOfLines={8}
            placeholder={'e.g. Severe difficulty breathing with onset 6 hours ago.\nConfusion and disorientation noted.\nPatient reports chest tightness and productive cough with yellow-green sputum.\nNo known drug allergies.'}
            placeholderTextColor={Colors.textSecondary}
            value={text}
            onChangeText={setText}
            maxLength={MAX_CHARS}
            textAlignVertical="top"
          />
          <Text style={styles.charCount}>
            {text.length} / {MAX_CHARS}
          </Text>
        </View>

        <Link href="/(staff)/new-assessment/image-capture" asChild>
          <Button title="Next: Image Capture →" onPress={() => {}} />
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
  charCount: {
    fontFamily: Typography.regular,
    fontSize: 12,
    color: Colors.textSecondary,
    textAlign: 'right',
    marginTop: Spacing.xxs,
    fontVariant: ['tabular-nums'],
  },
});
