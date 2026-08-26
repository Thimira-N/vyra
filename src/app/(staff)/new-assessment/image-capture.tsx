/**
 * Step 2: Image Capture — Spec §6.2, UI Upgrade U4
 *
 * "Clinical Glass" restyle:
 * - Screen wrapper with gradient mesh + blob accents
 * - ProgressSteps indicator
 * - Capture card & image preview inside elevated GlassCards
 * - Safe area & bottom clearance
 * - Preserved logic: camera/gallery permissions, draftStore persistence, skippable option
 */

import React, { useState } from 'react';
import { View, Text, StyleSheet, Image, Alert, ScrollView } from 'react-native';
import { router } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { useTheme } from '@/hooks/use-theme';
import { TypographyScale, Spacing, Radius } from '@/constants/theme';
import { Screen } from '@/components/ui/Screen';
import { GlassCard } from '@/components/ui/GlassCard';
import ProgressSteps from '@/components/ui/ProgressSteps';
import Button from '@/components/ui/Button';
import { useAssessmentDraftStore } from '@/store/assessmentDraftStore';

const STEPS = ['Patient', 'Symptoms', 'Image', 'Vitals', 'Review'];

export default function ImageCaptureScreen() {
  const { colors } = useTheme();
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
    <Screen safeArea={true}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
      >
        <ProgressSteps steps={STEPS} currentStep={2} />

        <View style={styles.content}>
          <Text style={[TypographyScale.h1, styles.title, { color: colors.textPrimary }]}>
            Clinical Image
          </Text>
          <Text style={[TypographyScale.body, styles.description, { color: colors.textSecondary }]}>
            Capture or upload a clinical image for visual analysis.
            This step is optional — the system supports partial-modality assessment.
          </Text>

          {imageUri ? (
            <GlassCard tint="elevated" elevation="raised" radius="md" style={styles.previewCard}>
              <View style={styles.cardInner}>
                <Image source={{ uri: imageUri }} style={[styles.preview, { backgroundColor: colors.surfaceSunken }]} resizeMode="cover" />
                <Button title="Retake / Change Image" onPress={handleRetake} variant="outline" />
              </View>
            </GlassCard>
          ) : (
            <GlassCard tint="elevated" elevation="raised" radius="md" style={styles.captureCard}>
              <View style={styles.captureInner}>
                <Text style={styles.captureIcon}>📷</Text>
                <Text style={[TypographyScale.h3, styles.captureTitle, { color: colors.textPrimary }]}>
                  No image selected
                </Text>
                <Text style={[TypographyScale.bodySm, { color: colors.textSecondary, textAlign: 'center', marginBottom: Spacing.lg }]}>
                  Take a photo or choose an existing clinical photograph from your gallery.
                </Text>
                <View style={styles.captureButtons}>
                  <Button title="Take Photo" onPress={handleTakePhoto} variant="primary" />
                  <Button title="Choose from Gallery" onPress={handleChooseGallery} variant="outline" />
                </View>
              </View>
            </GlassCard>
          )}

          <View style={styles.actions}>
            <Button
              title={imageUri ? 'Next: Vitals →' : 'Continue with Image →'}
              onPress={handleNext}
              disabled={!imageUri}
            />
            <Text
              onPress={handleSkip}
              style={[
                TypographyScale.button,
                styles.skipLink,
                { color: colors.primaryLight },
              ]}
            >
              Continue without image →
            </Text>
          </View>
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
  previewCard: {
    marginBottom: Spacing.lg,
  },
  cardInner: {
    padding: Spacing.md,
  },
  preview: {
    width: '100%',
    height: 280,
    borderRadius: Radius.md,
    marginBottom: Spacing.md,
  },
  captureCard: {
    marginBottom: Spacing.lg,
  },
  captureInner: {
    padding: Spacing.xl,
    alignItems: 'center',
  },
  captureIcon: {
    fontSize: 48,
    marginBottom: Spacing.xs,
  },
  captureTitle: {
    marginBottom: Spacing.xxs,
  },
  captureButtons: {
    width: '100%',
    gap: Spacing.sm,
  },
  actions: {
    marginTop: Spacing.sm,
    gap: Spacing.md,
  },
  skipLink: {
    textAlign: 'center',
    paddingVertical: Spacing.xs,
    fontSize: 14,
  },
});
