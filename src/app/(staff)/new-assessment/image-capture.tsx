/**
 * Step 2: Image Capture — Spec §6.2
 *
 * Two options: "Take Photo" (expo-camera via image-picker) or
 * "Choose from Gallery" (expo-image-picker).
 * Preview thumbnail with retake option.
 * Step is SKIPPABLE — "Continue without image" link.
 */

import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Image, Alert } from 'react-native';
import { router } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { Colors, Typography, Spacing, Shadows } from '@/constants/theme';
import ProgressSteps from '@/components/ui/ProgressSteps';
import Button from '@/components/ui/Button';
import { useAssessmentDraftStore } from '@/store/assessmentDraftStore';

const STEPS = ['Patient', 'Symptoms', 'Image', 'Vitals', 'Review'];

export default function ImageCaptureScreen() {
  const storedUri = useAssessmentDraftStore((s) => s.imageUri);
  const setImage = useAssessmentDraftStore((s) => s.setImage);

  const [imageUri, setImageUri] = useState<string | null>(storedUri);

  async function handleTakePhoto() {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert(
        'Camera Permission Required',
        'Please grant camera access to take clinical photos.',
      );
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ['images'],
      quality: 0.8,
      allowsEditing: false,
    });

    if (!result.canceled && result.assets?.[0]?.uri) {
      setImageUri(result.assets[0].uri);
    }
  }

  async function handleChooseGallery() {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert(
        'Gallery Permission Required',
        'Please grant gallery access to select clinical images.',
      );
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      quality: 0.8,
      allowsEditing: false,
    });

    if (!result.canceled && result.assets?.[0]?.uri) {
      setImageUri(result.assets[0].uri);
    }
  }

  function handleRetake() {
    setImageUri(null);
  }

  function handleNext() {
    setImage(imageUri);
    router.push('/(staff)/new-assessment/vitals');
  }

  function handleSkip() {
    setImage(null);
    router.push('/(staff)/new-assessment/vitals');
  }

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

          {imageUri ? (
            // Preview
            <View style={styles.previewContainer}>
              <Image source={{ uri: imageUri }} style={styles.preview} resizeMode="cover" />
              <View style={styles.previewActions}>
                <Button title="Retake / Change" onPress={handleRetake} variant="outline" />
              </View>
            </View>
          ) : (
            // Capture area
            <View style={[styles.captureArea, Shadows.card]}>
              <Text style={styles.captureIcon}>📷</Text>
              <Text style={styles.captureTitle}>No image selected</Text>
              <View style={styles.captureButtons}>
                <Button title="Take Photo" onPress={handleTakePhoto} variant="primary" />
                <Button title="Choose from Gallery" onPress={handleChooseGallery} variant="outline" />
              </View>
            </View>
          )}
        </View>
      </View>

      {/* Bottom navigation */}
      <View style={styles.footer}>
        <Button title={imageUri ? 'Next: Vitals →' : 'Continue with Image →'} onPress={handleNext} disabled={!imageUri} />
        <Text onPress={handleSkip} style={styles.skipLink}>
          Continue without image →
        </Text>
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

  // Preview
  previewContainer: {
    alignItems: 'center',
  },
  preview: {
    width: '100%',
    height: 280,
    borderRadius: 12,
    backgroundColor: Colors.border,
    marginBottom: Spacing.md,
  },
  previewActions: {
    width: '100%',
  },

  // Capture area
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

  // Footer
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
    paddingVertical: Spacing.xxs,
  },
});
