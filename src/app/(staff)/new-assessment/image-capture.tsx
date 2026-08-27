/**
 * Step 2: Image Capture — Spec §6.2, UI Upgrade U4
 *
 * Premium Clinical Imaging Interface:
 * - High-performance hardware-accelerated image rendering via expo-image
 * - Viewfinder-style image capture frame with corner reticles
 * - High-resolution preview with retake and status badge
 * - Clear secondary option for partial-modality assessments
 * - Immediate draft store synchronization
 */

import React, { useState } from 'react';
import { View, Text, StyleSheet, Alert, ScrollView, TouchableOpacity, Platform } from 'react-native';
import { router } from 'expo-router';
import { Image } from 'expo-image';
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

  // Sync state if store updates or restores
  React.useEffect(() => {
    if (storedUri && storedUri !== imageUri) {
      setImageUri(storedUri);
    }
  }, [storedUri]);

  // Handle Android activity recreation recovery
  React.useEffect(() => {
    async function checkPendingCapture() {
      try {
        const pending: any = await ImagePicker.getPendingResultAsync();
        if (pending && !pending.canceled && pending.assets?.[0]?.uri) {
          const recoveredUri = pending.assets[0].uri;
          setImageUri(recoveredUri);
          setImage(recoveredUri);
        }
      } catch {
        // Not supported or no pending result
      }
    }
    checkPendingCapture();
  }, []);

  async function handleTakePhoto() {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert(
        'Camera Permission Required',
        'Please grant camera access in your device settings to capture clinical photos.',
      );
      return;
    }

    try {
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ['images'],
        quality: 0.8,
        allowsEditing: true,
        aspect: [4, 3],
        exif: false,
      });

      if (!result.canceled && result.assets?.[0]?.uri) {
        const selectedUri = result.assets[0].uri;
        setImageUri(selectedUri);
        setImage(selectedUri);
      }
    } catch (err: any) {
      console.log('[ImagePicker Camera with crop failed, trying standard]:', err?.message);
      try {
        const fallback = await ImagePicker.launchCameraAsync({
          mediaTypes: ['images'],
          quality: 0.7,
          allowsEditing: false,
          exif: false,
        });
        if (!fallback.canceled && fallback.assets?.[0]?.uri) {
          const selectedUri = fallback.assets[0].uri;
          setImageUri(selectedUri);
          setImage(selectedUri);
        }
      } catch (fallbackErr: any) {
        Alert.alert('Camera Error', 'Could not open the camera. Please select an image from your library instead.');
      }
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

    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        quality: 0.8,
        allowsEditing: false,
        exif: false,
      });

      if (!result.canceled && result.assets?.[0]?.uri) {
        const selectedUri = result.assets[0].uri;
        setImageUri(selectedUri);
        setImage(selectedUri);
      }
    } catch (err: any) {
      console.log('[ImagePicker Gallery Error]:', err?.message);
    }
  }

  function handleRetake() {
    setImageUri(null);
    setImage(null);
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
                <View style={[styles.imageWrapper, { backgroundColor: isDark ? '#050D14' : '#0B161E' }]}>
                  <Image
                    source={{ uri: imageUri }}
                    style={styles.preview}
                    contentFit="cover"
                    priority="high"
                    transition={250}
                  />

                  {/* Top Status Capsule */}
                  <View style={styles.imageOverlayBadge}>
                    <View style={styles.greenBeaconDot} />
                    <Text style={styles.imageOverlayText}>OPTICAL DATA LOADED</Text>
                  </View>
                </View>

                {/* Retake & Action Buttons */}
                <View style={styles.previewActionsRow}>
                  <TouchableOpacity
                    style={[
                      styles.retakeBtn,
                      {
                        backgroundColor: isDark ? 'rgba(255, 255, 255, 0.08)' : '#F0F5F7',
                        borderColor: isDark ? 'rgba(255, 255, 255, 0.15)' : colors.borderStrong,
                      },
                    ]}
                    onPress={handleChooseGallery}
                    activeOpacity={0.8}
                  >
                    <Ionicons name="images-outline" size={18} color={colors.textPrimary} />
                    <Text style={[styles.retakeBtnText, { color: colors.textPrimary }]}>
                      Change Photo
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[
                      styles.retakeBtn,
                      {
                        backgroundColor: isDark ? 'rgba(255, 255, 255, 0.08)' : '#F0F5F7',
                        borderColor: isDark ? 'rgba(255, 255, 255, 0.15)' : colors.borderStrong,
                      },
                    ]}
                    onPress={handleTakePhoto}
                    activeOpacity={0.8}
                  >
                    <Ionicons name="camera-outline" size={18} color={colors.textPrimary} />
                    <Text style={[styles.retakeBtnText, { color: colors.textPrimary }]}>
                      Retake
                    </Text>
                  </TouchableOpacity>
                </View>
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

  /* ── Preview ── */
  previewCard: {
    marginBottom: Spacing.md,
  },
  previewCardInner: {
    padding: Spacing.md,
  },
  imageWrapper: {
    position: 'relative',
    width: '100%',
    height: 290,
    borderRadius: Radius.md,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
    ...Platform.select({
      ios: {
        shadowColor: '#000000',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.25,
        shadowRadius: 12,
      },
      android: {
        elevation: 6,
      },
    }),
  },
  preview: {
    width: '100%',
    height: '100%',
  },
  imageOverlayBadge: {
    position: 'absolute',
    top: 12,
    left: 12,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(7, 18, 26, 0.85)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: Radius.pill,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.18)',
    gap: 6,
  },
  greenBeaconDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#2E9E5B',
  },
  imageOverlayText: {
    color: '#FFFFFF',
    fontSize: 10.5,
    fontWeight: '700',
    letterSpacing: 0.6,
  },
  previewActionsRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginTop: Spacing.md,
  },
  retakeBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 44,
    borderRadius: Radius.md,
    borderWidth: 1,
    gap: 6,
  },
  retakeBtnText: {
    fontSize: 13.5,
    fontFamily: 'Inter_600SemiBold',
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
