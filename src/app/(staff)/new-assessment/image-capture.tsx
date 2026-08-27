/**
 * Step 2: Image Capture — Spec §6.2, UI Upgrade U4
 *
 * Premium Clinical Imaging Interface:
 * - ProgressSteps indicator at top
 * - Viewfinder-style image capture frame with corner reticles
 * - High-resolution preview with retake and zoom capabilities
 * - Clear secondary option for partial-modality assessments
 * - Preserved logic: camera/gallery permissions, draftStore persistence, skippable option
 */

import React, { useState } from 'react';
import { View, Text, StyleSheet, Image, Alert, ScrollView, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
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
  const { colors, isDark } = useTheme();
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
      quality: 0.85,
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
      quality: 0.85,
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
            Capture or upload a medical photograph, skin lesion, or radiographic image for CNN feature extraction.
          </Text>

          {imageUri ? (
            <GlassCard tint="elevated" elevation="raised" radius="lg" style={styles.previewCard}>
              <View style={styles.previewCardInner}>
                <View style={styles.imageWrapper}>
                  <Image
                    source={{ uri: imageUri }}
                    style={[styles.preview, { backgroundColor: colors.surfaceSunken }]}
                    resizeMode="cover"
                  />
                  <View style={styles.imageOverlayBadge}>
                    <Ionicons name="checkmark-circle" size={16} color="#FFFFFF" />
                    <Text style={styles.imageOverlayText}>Optical Data Loaded</Text>
                  </View>
                </View>

                <Button
                  title="Retake / Choose Different"
                  onPress={handleRetake}
                  variant="outline"
                  style={{ marginTop: Spacing.sm }}
                />
              </View>
            </GlassCard>
          ) : (
            <GlassCard tint="elevated" elevation="raised" radius="lg" style={styles.captureCard}>
              <View style={styles.captureInner}>
                {/* Viewfinder Reticle */}
                <View
                  style={[
                    styles.viewfinderBox,
                    {
                      backgroundColor: isDark ? colors.surfaceSunken : '#F8FAFC',
                      borderColor: isDark ? colors.border : '#CBD5E1',
                    },
                  ]}
                >
                  <View style={[styles.cornerTL, { borderColor: colors.primary }]} />
                  <View style={[styles.cornerTR, { borderColor: colors.primary }]} />
                  <View style={[styles.cornerBL, { borderColor: colors.primary }]} />
                  <View style={[styles.cornerBR, { borderColor: colors.primary }]} />

                  <View style={[styles.iconCircle, { backgroundColor: `${colors.primary}15` }]}>
                    <Ionicons name="camera-outline" size={36} color={colors.primary} />
                  </View>

                  <Text style={[TypographyScale.h3, styles.captureTitle, { color: colors.textPrimary }]}>
                    Visual Modality Frame
                  </Text>
                  <Text style={[TypographyScale.caption, styles.captureSub, { color: colors.textSecondary }]}>
                    Ensure good clinical illumination and focused framing
                  </Text>
                </View>

                {/* Capture Action Buttons */}
                <View style={styles.captureButtons}>
                  <TouchableOpacity
                    style={[styles.actionBtn, { backgroundColor: colors.primary }]}
                    onPress={handleTakePhoto}
                    activeOpacity={0.8}
                  >
                    <Ionicons name="camera" size={20} color="#FFFFFF" />
                    <Text style={styles.actionBtnText}>Take Camera Photo</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[
                      styles.actionBtnOutline,
                      {
                        backgroundColor: isDark ? colors.surfaceSunken : '#FFFFFF',
                        borderColor: colors.borderStrong,
                      },
                    ]}
                    onPress={handleChooseGallery}
                    activeOpacity={0.8}
                  >
                    <Ionicons name="images-outline" size={20} color={colors.textPrimary} />
                    <Text style={[styles.actionBtnOutlineText, { color: colors.textPrimary }]}>
                      Upload from Library
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            </GlassCard>
          )}

          {/* Action Row */}
          <View style={styles.actions}>
            {imageUri ? (
              <Button
                title="Next: Vital Signs →"
                onPress={handleNext}
              />
            ) : (
              <Button
                title="Skip Image (Partial Modality) →"
                onPress={handleSkip}
                variant="outline"
              />
            )}
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

  /* ── Preview ── */
  previewCard: {
    marginBottom: Spacing.md,
  },
  previewCardInner: {
    padding: Spacing.md,
  },
  imageWrapper: {
    position: 'relative',
    borderRadius: Radius.md,
    overflow: 'hidden',
  },
  preview: {
    width: '100%',
    height: 280,
    borderRadius: Radius.md,
  },
  imageOverlayBadge: {
    position: 'absolute',
    bottom: 12,
    left: 12,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(15, 76, 92, 0.85)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: Radius.pill,
    gap: 4,
  },
  imageOverlayText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
  },

  /* ── Capture Viewfinder ── */
  captureCard: {
    marginBottom: Spacing.md,
  },
  captureInner: {
    padding: Spacing.md,
  },
  viewfinderBox: {
    width: '100%',
    height: 220,
    borderRadius: Radius.md,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.lg,
    position: 'relative',
    marginBottom: Spacing.md,
  },
  cornerTL: {
    position: 'absolute',
    top: 12,
    left: 12,
    width: 20,
    height: 20,
    borderTopWidth: 3,
    borderLeftWidth: 3,
  },
  cornerTR: {
    position: 'absolute',
    top: 12,
    right: 12,
    width: 20,
    height: 20,
    borderTopWidth: 3,
    borderRightWidth: 3,
  },
  cornerBL: {
    position: 'absolute',
    bottom: 12,
    left: 12,
    width: 20,
    height: 20,
    borderBottomWidth: 3,
    borderLeftWidth: 3,
  },
  cornerBR: {
    position: 'absolute',
    bottom: 12,
    right: 12,
    width: 20,
    height: 20,
    borderBottomWidth: 3,
    borderRightWidth: 3,
  },
  iconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.xs,
  },
  captureTitle: {
    marginBottom: 2,
  },
  captureSub: {
    textAlign: 'center',
  },
  captureButtons: {
    width: '100%',
    gap: Spacing.xs + 2,
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.xs,
    paddingVertical: Spacing.sm + 2,
    borderRadius: Radius.md,
    minHeight: 48,
  },
  actionBtnText: {
    color: '#FFFFFF',
    fontFamily: TypographyScale.button.fontFamily,
    fontSize: 14,
    fontWeight: '700',
  },
  actionBtnOutline: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.xs,
    paddingVertical: Spacing.sm + 2,
    borderRadius: Radius.md,
    borderWidth: 1.5,
    minHeight: 48,
  },
  actionBtnOutlineText: {
    fontFamily: TypographyScale.button.fontFamily,
    fontSize: 14,
    fontWeight: '700',
  },
  actions: {
    marginTop: Spacing.xs,
  },
});
