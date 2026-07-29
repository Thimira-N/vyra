/**
 * Step 2: Image Capture — Spec §6.2
 * Take photo or choose from gallery. Step is SKIPPABLE.
 * Placeholder for Phase F0. Full expo-camera/image-picker in Phase F2.
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Link } from 'expo-router';
import { Colors, Typography, Spacing, Shadows } from '@/constants/theme';
import ProgressSteps from '@/components/ui/ProgressSteps';
import Button from '@/components/ui/Button';

const STEPS = ['Patient', 'Symptoms', 'Image', 'Vitals', 'Review'];

export default function ImageCaptureScreen() {
  return (
    <View style={styles.screen}>
      <View style={styles.container}>
        <ProgressSteps steps={STEPS} currentStep={2} />

        <View style={styles.content}>
          <Text style={styles.title}>Clinical Image</Text>
          <Text style={styles.description}>
            Capture or upload a clinical image for visual analysis.
            This step is optional — the system supports partial-modality assessment.
          </Text>

          {/* Image capture area placeholder */}
          <View style={[styles.captureArea, Shadows.card]}>
            <Text style={styles.captureIcon}>📷</Text>
            <Text style={styles.captureTitle}>No image selected</Text>

            <View style={styles.captureButtons}>
              <Button title="Take Photo" onPress={() => {}} variant="primary" />
              <Button title="Choose from Gallery" onPress={() => {}} variant="outline" />
            </View>
          </View>
        </View>
      </View>

      {/* Bottom navigation */}
      <View style={styles.footer}>
        <Link href="/(staff)/new-assessment/vitals" asChild>
          <Button title="Next: Vitals →" onPress={() => {}} />
        </Link>

        <Link href="/(staff)/new-assessment/vitals" style={styles.skipLink}>
          Continue without image →
        </Link>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  container: {
    flex: 1,
    padding: Spacing.lg,
  },
  content: {
    flex: 1,
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
  captureArea: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    borderStyle: 'dashed',
    padding: Spacing.xl,
    alignItems: 'center',
  },
  captureIcon: {
    fontSize: 48,
    marginBottom: Spacing.sm,
  },
  captureTitle: {
    fontFamily: Typography.medium,
    fontSize: 16,
    color: Colors.textSecondary,
    marginBottom: Spacing.lg,
  },
  captureButtons: {
    width: '100%',
    gap: Spacing.sm,
  },
  footer: {
    padding: Spacing.lg,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    backgroundColor: Colors.surface,
  },
  skipLink: {
    fontFamily: Typography.medium,
    fontSize: 14,
    color: Colors.primaryLight,
    textAlign: 'center',
    marginTop: Spacing.sm,
  },
});
