/**
 * Analyzing — Spec §6.2, UI Upgrade U4
 *
 * "Clinical Glass" restyle:
 * - Screen wrapper with gradient mesh + blob accents
 * - Analysis progress steps in elevated GlassCard
 * - Serene "quiet motion" loading indicator
 * - Safe area & bottom clearance
 * - Preserved logic: createAssessment API call, local notifications, error handling & retry
 */

import React, { useEffect, useState, useRef } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/hooks/use-theme';
import { TypographyScale, Spacing, Radius } from '@/constants/theme';
import { Screen } from '@/components/ui/Screen';
import { GlassCard } from '@/components/ui/GlassCard';
import Button from '@/components/ui/Button';
import { createAssessment, type AssessmentOut } from '@/services/assessmentsApi';
import { useAssessmentDraftStore } from '@/store/assessmentDraftStore';
import { NotificationService } from '@/services/notificationService';

const ANALYSIS_STEPS = [
  { label: 'Analyzing image...', icon: 'image-outline' as const },
  { label: 'Analyzing symptoms...', icon: 'document-text-outline' as const },
  { label: 'Analyzing vitals...', icon: 'pulse-outline' as const },
  { label: 'Combining results...', icon: 'git-merge-outline' as const },
];

export default function AnalyzingScreen() {
  const { colors } = useTheme();
  const [activeStep, setActiveStep] = useState(0);
  const [error, setError] = useState('');
  const [assessmentResult, setAssessmentResult] = useState<AssessmentOut | null>(null);
  const isSubmitting = useRef(false);

  const patient_id = useAssessmentDraftStore((s) => s.patient_id);
  const symptoms_text = useAssessmentDraftStore((s) => s.symptoms_text);
  const imageUri = useAssessmentDraftStore((s) => s.imageUri);
  const vitals = useAssessmentDraftStore((s) => s.vitals);
  const setAssessmentId = useAssessmentDraftStore((s) => s.setAssessmentId);

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveStep((prev) => {
        if (prev >= ANALYSIS_STEPS.length - 1) {
          clearInterval(timer);
          return prev;
        }
        return prev + 1;
      });
    }, 1500);

    return () => clearInterval(timer);
  }, []);

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
      }, 1000);
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
    isSubmitting.current = false;

    const timer = setInterval(() => {
      setActiveStep((prev) => {
        if (prev >= ANALYSIS_STEPS.length - 1) {
          clearInterval(timer);
          return prev;
        }
        return prev + 1;
      });
    }, 1500);

    submitAssessment();
  }

  return (
    <Screen safeArea={true}>
      <View style={styles.container}>
        <View style={styles.content}>
          {!error && (
            <View style={styles.indicatorContainer}>
              <ActivityIndicator size="large" color={colors.primary} />
            </View>
          )}

          <Text style={[TypographyScale.h1, styles.title, { color: colors.textPrimary }]}>
            {error ? 'Submission Failed' : 'Analyzing Assessment'}
          </Text>
          <Text style={[TypographyScale.body, styles.subtitle, { color: colors.textSecondary }]}>
            {error
              ? 'There was an issue submitting the assessment.'
              : 'Processing multi-modal clinical data...'}
          </Text>

          {error ? (
            <GlassCard tint="elevated" elevation="raised" radius="md" style={styles.errorCard}>
              <View style={styles.errorInner}>
                <View style={[styles.errorBanner, { backgroundColor: `${colors.danger}15`, borderColor: `${colors.danger}35` }]}>
                  <Text style={[TypographyScale.caption, { color: colors.danger, textAlign: 'center' }]}>
                    {error}
                  </Text>
                </View>
                <Button title="Retry" onPress={handleRetry} variant="primary" style={{ marginBottom: Spacing.sm, width: '100%' }} />
                <Button
                  title="Go Back"
                  onPress={() => router.back()}
                  variant="outline"
                  style={{ width: '100%' }}
                />
              </View>
            </GlassCard>
          ) : (
            <GlassCard tint="elevated" elevation="raised" radius="md" style={styles.stepsCard}>
              <View style={styles.stepsInner}>
                {ANALYSIS_STEPS.map((step, index) => {
                  const isDone = index < activeStep || assessmentResult !== null;
                  const isActive = index === activeStep && !assessmentResult;

                  return (
                    <View key={step.label} style={styles.stepRow}>
                      <View
                        style={[
                          styles.stepIconBox,
                          {
                            backgroundColor: isDone
                              ? `${colors.riskLow}18`
                              : isActive
                                ? `${colors.primary}18`
                                : colors.surfaceSunken,
                          },
                        ]}
                      >
                        {isDone ? (
                          <Ionicons name="checkmark" size={16} color={colors.riskLow} />
                        ) : (
                          <Ionicons
                            name={step.icon}
                            size={16}
                            color={isActive ? colors.primary : colors.textTertiary}
                          />
                        )}
                      </View>
                      <Text
                        style={[
                          TypographyScale.body,
                          {
                            color: isDone
                              ? colors.riskLow
                              : isActive
                                ? colors.textPrimary
                                : colors.textTertiary,
                            fontWeight: isActive ? '600' : '400',
                            flex: 1,
                          },
                        ]}
                      >
                        {step.label}
                      </Text>
                      {isActive && (
                        <ActivityIndicator size="small" color={colors.primaryLight} />
                      )}
                    </View>
                  );
                })}
              </View>
            </GlassCard>
          )}
        </View>

        {!error && (
          <Text style={[TypographyScale.caption, styles.footerText, { color: colors.textSecondary }]}>
            This usually takes 10–30 seconds
          </Text>
        )}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: Spacing.lg,
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: 96,
  },
  content: {
    alignItems: 'center',
    width: '100%',
  },
  indicatorContainer: {
    marginBottom: Spacing.lg,
  },
  title: {
    textAlign: 'center',
    marginBottom: Spacing.xxs,
  },
  subtitle: {
    textAlign: 'center',
    marginBottom: Spacing.xl,
  },
  stepsCard: {
    width: '100%',
  },
  stepsInner: {
    padding: Spacing.lg,
    gap: Spacing.md,
  },
  stepRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  stepIconBox: {
    width: 32,
    height: 32,
    borderRadius: Radius.sm,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorCard: {
    width: '100%',
  },
  errorInner: {
    padding: Spacing.lg,
    alignItems: 'center',
  },
  errorBanner: {
    borderWidth: 1,
    borderRadius: Radius.md,
    padding: Spacing.md,
    marginBottom: Spacing.md,
    width: '100%',
  },
  footerText: {
    position: 'absolute',
    bottom: 40,
    textAlign: 'center',
  },
});
