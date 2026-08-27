/**
 * Analyzing — Spec §6.2, UI Upgrade U4
 *
 * State-of-the-art Animated Multimodal Clinical Pipeline:
 * - Concentric expanding radar rings & rotating neural core
 * - Dynamic progress percentage counter
 * - Real-time multimodal stage steps with active glow & checkmark animations
 * - Preserved logic: createAssessment API, notification service, routing to results
 */

import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  withSequence,
  interpolate,
  Easing,
  FadeIn,
  FadeInDown,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '@/hooks/use-theme';
import { TypographyScale, Spacing, Radius } from '@/constants/theme';
import { GlassCard } from '@/components/ui/GlassCard';
import Button from '@/components/ui/Button';
import { createAssessment, type AssessmentOut } from '@/services/assessmentsApi';
import { useAssessmentDraftStore } from '@/store/assessmentDraftStore';
import { NotificationService } from '@/services/notificationService';

const PIPELINE_STAGES = [
  {
    title: 'Visual Modality Extraction',
    desc: 'DenseNet-121 feature map & Grad-CAM activations',
    icon: 'scan-outline' as const,
  },
  {
    title: 'Clinical NLP Processing',
    desc: 'BioClinicalBERT symptom token embeddings',
    icon: 'document-text-outline' as const,
  },
  {
    title: 'Biometric Vital Stratification',
    desc: 'Hemodynamic & physiological normal range analysis',
    icon: 'pulse-outline' as const,
  },
  {
    title: 'Cross-Attention Fusion',
    desc: 'Late-fusion multimodal synthesis & uncertainty calibration',
    icon: 'git-network-outline' as const,
  },
];

export default function AnalyzingScreen() {
  const { colors, isDark } = useTheme();
  const [activeStep, setActiveStep] = useState(0);
  const [progressPct, setProgressPct] = useState(12);
  const [error, setError] = useState('');
  const [assessmentResult, setAssessmentResult] = useState<AssessmentOut | null>(null);
  const isSubmitting = useRef(false);

  const patient_id = useAssessmentDraftStore((s) => s.patient_id);
  const symptoms_text = useAssessmentDraftStore((s) => s.symptoms_text);
  const imageUri = useAssessmentDraftStore((s) => s.imageUri);
  const vitals = useAssessmentDraftStore((s) => s.vitals);
  const setAssessmentId = useAssessmentDraftStore((s) => s.setAssessmentId);

  // Reanimated Shared Values for Pulse & Core
  const pulse1 = useSharedValue(0);
  const pulse2 = useSharedValue(0);
  const coreRotate = useSharedValue(0);
  const coreScale = useSharedValue(1);

  useEffect(() => {
    // Pulse ring 1
    pulse1.value = withRepeat(
      withTiming(1, { duration: 2400, easing: Easing.out(Easing.ease) }),
      -1,
      false
    );

    // Pulse ring 2 (offset)
    setTimeout(() => {
      pulse2.value = withRepeat(
        withTiming(1, { duration: 2400, easing: Easing.out(Easing.ease) }),
        -1,
        false
      );
    }, 1200);

    // Core breathing scale
    coreScale.value = withRepeat(
      withSequence(
        withTiming(1.08, { duration: 1200, easing: Easing.inOut(Easing.ease) }),
        withTiming(0.96, { duration: 1200, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      true
    );

    // Core rotation
    coreRotate.value = withRepeat(
      withTiming(360, { duration: 10000, easing: Easing.linear }),
      -1,
      false
    );
  }, []);

  // Step progression simulator
  useEffect(() => {
    const timer = setInterval(() => {
      setActiveStep((prev) => {
        if (prev >= PIPELINE_STAGES.length - 1) {
          clearInterval(timer);
          return prev;
        }
        return prev + 1;
      });
    }, 1600);

    return () => clearInterval(timer);
  }, []);

  // Progress percentage smooth counter
  useEffect(() => {
    const progressInterval = setInterval(() => {
      setProgressPct((prev) => {
        if (assessmentResult) return 100;
        if (prev >= 95) return 95;
        const target = Math.min(95, (activeStep + 1) * 24);
        return prev < target ? prev + 2 : prev;
      });
    }, 120);

    return () => clearInterval(progressInterval);
  }, [activeStep, assessmentResult]);

  // Submission trigger
  useEffect(() => {
    if (isSubmitting.current) return;
    isSubmitting.current = true;
    submitAssessment();
  }, []);

  async function submitAssessment() {
    setError('');

    if (!patient_id || !symptoms_text) {
      setError('Missing required data. Please go back and complete all steps.');
      return;
    }

    try {
      const result = await createAssessment({
        patient_id,
        symptoms_text,
        vitals,
        imageUri,
      });

      setAssessmentResult(result);
      setAssessmentId(result._id);
      setProgressPct(100);

      NotificationService.scheduleLocalNotification(
        'Assessment Ready',
        'Risk analysis completed for the patient.',
      );

      NotificationService.notify('success', 'Analysis Complete', 'Risk report generated successfully.', true);

      setTimeout(() => {
        router.replace({
          pathname: '/(staff)/new-assessment/result',
          params: { assessmentData: JSON.stringify(result) },
        });
      }, 1200);
    } catch (err: any) {
      isSubmitting.current = false;
      const detail = err?.response?.data?.detail;
      if (err?.message?.includes('Network')) {
        setError('Unable to connect to the server. Check your internet connection.');
      } else {
        setError(
          typeof detail === 'string' ? detail : 'Assessment submission failed. Please try again.',
        );
      }
      NotificationService.notify('error', 'Analysis Failed', 'There was a problem generating the risk report.', true);
    }
  }

  function handleRetry() {
    setError('');
    setActiveStep(0);
    setProgressPct(10);
    isSubmitting.current = false;

    const timer = setInterval(() => {
      setActiveStep((prev) => {
        if (prev >= PIPELINE_STAGES.length - 1) {
          clearInterval(timer);
          return prev;
        }
        return prev + 1;
      });
    }, 1600);

    submitAssessment();
  }

  // Animated styles for rings
  const ring1Style = useAnimatedStyle(() => {
    return {
      transform: [{ scale: interpolate(pulse1.value, [0, 1], [0.8, 2.2]) }],
      opacity: interpolate(pulse1.value, [0, 0.4, 1], [0.8, 0.4, 0]),
    };
  });

  const ring2Style = useAnimatedStyle(() => {
    return {
      transform: [{ scale: interpolate(pulse2.value, [0, 1], [0.8, 2.2]) }],
      opacity: interpolate(pulse2.value, [0, 0.4, 1], [0.8, 0.4, 0]),
    };
  });

  const coreAnimatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { scale: coreScale.value },
        { rotate: `${coreRotate.value}deg` },
      ],
    };
  });

  return (
    <View style={styles.root}>
      {/* Dark Clinical Gradient Background */}
      <LinearGradient
        colors={
          isDark
            ? ['#040F19', '#081C2B', '#061622']
            : ['#062038', '#0B3A5C', '#08283D']
        }
        style={StyleSheet.absoluteFill}
        start={{ x: 0.1, y: 0 }}
        end={{ x: 0.9, y: 1 }}
      />

      <View style={styles.container}>
        {error ? (
          /* Error State */
          <Animated.View entering={FadeInDown.duration(400)} style={styles.errorContainer}>
            <View style={styles.errorIconCircle}>
              <Ionicons name="alert" size={36} color="#FFFFFF" />
            </View>
            <Text style={styles.errorTitle}>Analysis Interrupted</Text>
            <Text style={styles.errorSubtitle}>
              {error}
            </Text>
            <Button
              title="Retry Analysis ↻"
              onPress={handleRetry}
              style={{ width: '100%', marginBottom: Spacing.sm }}
            />
            <Button
              title="Return to Review"
              onPress={() => router.back()}
              variant="outline"
              style={{ width: '100%' }}
            />
          </Animated.View>
        ) : (
          /* Main Animated Analysis Pipeline */
          <>
            {/* Top Header */}
            <Animated.View entering={FadeInDown.duration(500)} style={styles.header}>
              <View style={styles.aiPill}>
                <Ionicons name="hardware-chip" size={14} color="#4FD1E0" />
                <Text style={styles.aiPillText}>MULTIMODAL AI PIPELINE</Text>
              </View>
              <Text style={styles.mainTitle}>Stratifying Patient Risk</Text>
              <Text style={styles.mainSubtitle}>
                Synthesizing optical features, symptom NLP, and physiological vitals
              </Text>
            </Animated.View>

            {/* Central Animated Pulse Sonar Orb */}
            <View style={styles.sonarContainer}>
              {/* Expanding Ring 1 */}
              <Animated.View style={[styles.sonarRing, ring1Style]} />
              {/* Expanding Ring 2 */}
              <Animated.View style={[styles.sonarRing, ring2Style]} />

              {/* Rotating Outer Ring */}
              <Animated.View style={[styles.rotatingRing, coreAnimatedStyle]} />

              {/* Glowing Core Orb */}
              <LinearGradient
                colors={['#1D7A8C', '#0F4C5C']}
                style={styles.coreOrb}
              >
                <Ionicons name="pulse" size={38} color="#FFFFFF" />
                <Text style={styles.progressCounter}>{progressPct}%</Text>
              </LinearGradient>
            </View>

            {/* Pipeline Stage Cards */}
            <View style={styles.stagesWrapper}>
              {PIPELINE_STAGES.map((stage, idx) => {
                const isDone = idx < activeStep || assessmentResult !== null;
                const isCurrent = idx === activeStep && !assessmentResult;

                return (
                  <View
                    key={stage.title}
                    style={[
                      styles.stageCard,
                      {
                        backgroundColor: isCurrent
                          ? 'rgba(79, 209, 224, 0.12)'
                          : isDone
                            ? 'rgba(255, 255, 255, 0.08)'
                            : 'rgba(255, 255, 255, 0.03)',
                        borderColor: isCurrent
                          ? '#4FD1E0'
                          : isDone
                            ? 'rgba(79, 209, 224, 0.35)'
                            : 'rgba(255, 255, 255, 0.08)',
                      },
                    ]}
                  >
                    {/* Stage Status Icon */}
                    <View
                      style={[
                        styles.stageIconBox,
                        {
                          backgroundColor: isDone
                            ? '#2A9D8F'
                            : isCurrent
                              ? '#0F4C5C'
                              : 'rgba(255, 255, 255, 0.06)',
                        },
                      ]}
                    >
                      {isDone ? (
                        <Ionicons name="checkmark" size={16} color="#FFFFFF" />
                      ) : isCurrent ? (
                        <ActivityIndicator size="small" color="#4FD1E0" />
                      ) : (
                        <Ionicons name={stage.icon} size={16} color="rgba(255, 255, 255, 0.40)" />
                      )}
                    </View>

                    {/* Stage Details */}
                    <View style={styles.stageDetails}>
                      <Text
                        style={[
                          styles.stageTitle,
                          {
                            color: isDone || isCurrent ? '#FFFFFF' : 'rgba(255, 255, 255, 0.50)',
                            fontWeight: isCurrent ? '700' : '600',
                          },
                        ]}
                      >
                        {stage.title}
                      </Text>
                      <Text style={styles.stageDesc} numberOfLines={1}>
                        {stage.desc}
                      </Text>
                    </View>

                    {/* Stage Status Pill */}
                    {isDone ? (
                      <View style={styles.donePill}>
                        <Text style={styles.doneText}>Done</Text>
                      </View>
                    ) : isCurrent ? (
                      <View style={styles.activePill}>
                        <Text style={styles.activeText}>Active</Text>
                      </View>
                    ) : null}
                  </View>
                );
              })}
            </View>

            {/* Bottom Reassurance */}
            <Text style={styles.footerNote}>
              Calibrated for clinical decision support • Confidential analysis
            </Text>
          </>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#040F19',
  },
  container: {
    flex: 1,
    paddingHorizontal: Spacing.lg,
    paddingTop: Platform.OS === 'ios' ? 64 : 48,
    paddingBottom: Spacing.xl,
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  /* ── Header ── */
  header: {
    alignItems: 'center',
    width: '100%',
  },
  aiPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(79, 209, 224, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(79, 209, 224, 0.35)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: Radius.pill,
    gap: 5,
    marginBottom: Spacing.xs,
  },
  aiPillText: {
    color: '#4FD1E0',
    fontFamily: TypographyScale.caption.fontFamily,
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.8,
  },
  mainTitle: {
    fontFamily: TypographyScale.display.fontFamily,
    fontSize: 24,
    lineHeight: 30,
    color: '#FFFFFF',
    fontWeight: '800',
    textAlign: 'center',
  },
  mainSubtitle: {
    fontFamily: TypographyScale.caption.fontFamily,
    fontSize: 12,
    lineHeight: 17,
    color: 'rgba(255, 255, 255, 0.65)',
    textAlign: 'center',
    marginTop: 3,
    maxWidth: '90%',
  },

  /* ── Sonar Pulse Center ── */
  sonarContainer: {
    width: 180,
    height: 180,
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: Spacing.sm,
    position: 'relative',
  },
  sonarRing: {
    position: 'absolute',
    width: 140,
    height: 140,
    borderRadius: 70,
    borderWidth: 2,
    borderColor: '#4FD1E0',
  },
  rotatingRing: {
    position: 'absolute',
    width: 130,
    height: 130,
    borderRadius: 65,
    borderWidth: 1.5,
    borderColor: 'rgba(79, 209, 224, 0.35)',
    borderStyle: 'dashed',
  },
  coreOrb: {
    width: 96,
    height: 96,
    borderRadius: 48,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#4FD1E0',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.65,
    shadowRadius: 20,
    elevation: 12,
  },
  progressCounter: {
    color: '#FFFFFF',
    fontFamily: TypographyScale.h3.fontFamily,
    fontSize: 14,
    fontWeight: '800',
    marginTop: 2,
    fontVariant: ['tabular-nums'],
  },

  /* ── Pipeline Stages ── */
  stagesWrapper: {
    width: '100%',
    gap: 8,
  },
  stageCard: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: Radius.md,
    borderWidth: 1.5,
  },
  stageIconBox: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  stageDetails: {
    flex: 1,
  },
  stageTitle: {
    fontFamily: TypographyScale.body.fontFamily,
    fontSize: 13,
    lineHeight: 17,
  },
  stageDesc: {
    fontFamily: TypographyScale.caption.fontFamily,
    fontSize: 10,
    color: 'rgba(255, 255, 255, 0.50)',
    marginTop: 1,
  },
  donePill: {
    backgroundColor: 'rgba(42, 157, 143, 0.25)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: Radius.pill,
  },
  doneText: {
    color: '#2A9D8F',
    fontSize: 10,
    fontWeight: '700',
  },
  activePill: {
    backgroundColor: 'rgba(79, 209, 224, 0.20)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: Radius.pill,
  },
  activeText: {
    color: '#4FD1E0',
    fontSize: 10,
    fontWeight: '700',
  },

  footerNote: {
    fontFamily: TypographyScale.caption.fontFamily,
    fontSize: 11,
    color: 'rgba(255, 255, 255, 0.40)',
    textAlign: 'center',
  },

  /* ── Error ── */
  errorContainer: {
    width: '100%',
    alignItems: 'center',
    paddingVertical: Spacing.xl,
  },
  errorIconCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#E76F51',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.md,
  },
  errorTitle: {
    fontFamily: TypographyScale.h1.fontFamily,
    fontSize: 22,
    color: '#FFFFFF',
    marginBottom: Spacing.xs,
  },
  errorSubtitle: {
    fontFamily: TypographyScale.body.fontFamily,
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.70)',
    textAlign: 'center',
    marginBottom: Spacing.xl,
    paddingHorizontal: Spacing.md,
  },
});
