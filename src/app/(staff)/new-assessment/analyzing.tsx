/**
 * Analyzing — Spec §6.2
 *
 * Loading screen shown while the backend call is in flight.
 * Calls POST /assessments/ with the draft store data.
 * Shows progressive checklist animation (timed/simulated since
 * the backend returns one combined response).
 *
 * On success → stores result → navigates to result screen.
 * On error → shows error with retry.
 */

import React, { useEffect, useState, useRef } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { router } from 'expo-router';
import { Colors, Typography, Spacing } from '@/constants/theme';
import Button from '@/components/ui/Button';
import { createAssessment, type AssessmentOut } from '@/services/assessmentsApi';
import { useAssessmentDraftStore } from '@/store/assessmentDraftStore';
import { NotificationService } from '@/services/notificationService';

const ANALYSIS_STEPS = [
  { label: 'Analyzing image...', icon: '🔬' },
  { label: 'Analyzing symptoms...', icon: '📝' },
  { label: 'Analyzing vitals...', icon: '💓' },
  { label: 'Combining results...', icon: '🧠' },
];

export default function AnalyzingScreen() {
  const [activeStep, setActiveStep] = useState(0);
  const [error, setError] = useState('');
  const [assessmentResult, setAssessmentResult] = useState<AssessmentOut | null>(null);
  const isSubmitting = useRef(false);

  const patient_id = useAssessmentDraftStore((s) => s.patient_id);
  const symptoms_text = useAssessmentDraftStore((s) => s.symptoms_text);
  const imageUri = useAssessmentDraftStore((s) => s.imageUri);
  const vitals = useAssessmentDraftStore((s) => s.vitals);
  const setAssessmentId = useAssessmentDraftStore((s) => s.setAssessmentId);

  // Simulated progress animation (timed, since backend returns one combined response)
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

  // Actual API call
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

      // Trigger a local notification simulating a backend push when the report is ready
      NotificationService.scheduleLocalNotification(
        'Assessment Ready',
        `Risk analysis completed for the patient.`,
      );
      
      // Also show a toast
      NotificationService.notify('success', 'Analysis Complete', 'Risk report generated successfully.', true);

      // Small delay to let animation finish, then navigate
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

    // Restart animation
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
    <View style={styles.screen}>
      <View style={styles.content}>
        {!error && <ActivityIndicator size="large" color={Colors.primary} style={styles.spinner} />}

        <Text style={styles.title}>
          {error ? 'Submission Failed' : 'Analyzing Assessment'}
        </Text>
        <Text style={styles.subtitle}>
          {error
            ? 'There was an issue submitting the assessment.'
            : 'Processing multi-modal clinical data...'}
        </Text>

        {error ? (
          <View style={styles.errorContainer}>
            <View style={styles.errorBanner}>
              <Text style={styles.errorText}>{error}</Text>
            </View>
            <Button title="Retry" onPress={handleRetry} variant="primary" />
            <Button
              title="Go Back"
              onPress={() => router.back()}
              variant="outline"
              style={styles.backButton}
            />
          </View>
        ) : (
          <View style={styles.steps}>
            {ANALYSIS_STEPS.map((step, index) => {
              const isDone = index < activeStep || assessmentResult !== null;
              const isActive = index === activeStep && !assessmentResult;

              return (
                <View key={step.label} style={styles.stepRow}>
                  <Text style={styles.stepIcon}>
                    {isDone ? '✓' : step.icon}
                  </Text>
                  <Text
                    style={[
                      styles.stepLabel,
                      isDone && styles.stepDone,
                      isActive && styles.stepActive,
                    ]}
                  >
                    {step.label}
                  </Text>
                  {isActive && (
                    <ActivityIndicator size="small" color={Colors.primaryLight} style={styles.stepSpinner} />
                  )}
                </View>
              );
            })}
          </View>
        )}
      </View>

      {!error && (
        <Text style={styles.footer}>
          This usually takes 10–30 seconds
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: Colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.lg,
  },
  content: {
    alignItems: 'center',
    width: '100%',
  },
  spinner: {
    marginBottom: Spacing.lg,
  },
  title: {
    fontFamily: Typography.bold,
    fontSize: 22,
    color: Colors.textPrimary,
    textAlign: 'center',
  },
  subtitle: {
    fontFamily: Typography.regular,
    fontSize: 14,
    color: Colors.textSecondary,
    marginTop: Spacing.xxs,
    marginBottom: Spacing.xl,
    textAlign: 'center',
  },
  steps: {
    alignSelf: 'stretch',
    gap: Spacing.md,
  },
  stepRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  stepIcon: {
    fontSize: 20,
    width: 28,
    textAlign: 'center',
  },
  stepLabel: {
    fontFamily: Typography.medium,
    fontSize: 15,
    color: Colors.textSecondary,
    flex: 1,
  },
  stepDone: {
    color: Colors.riskLow,
    textDecorationLine: 'line-through',
  },
  stepActive: {
    fontFamily: Typography.semiBold,
    color: Colors.textPrimary,
  },
  stepSpinner: {
    marginLeft: Spacing.xs,
  },
  footer: {
    position: 'absolute',
    bottom: Spacing.xxl,
    fontFamily: Typography.regular,
    fontSize: 13,
    color: Colors.textSecondary,
  },

  // Error state
  errorContainer: {
    width: '100%',
    gap: Spacing.sm,
  },
  errorBanner: {
    backgroundColor: Colors.riskHigh + '12',
    borderWidth: 1,
    borderColor: Colors.riskHigh + '30',
    borderRadius: 10,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
  },
  errorText: {
    fontFamily: Typography.medium,
    fontSize: 14,
    color: Colors.riskHigh,
    lineHeight: 20,
    textAlign: 'center',
  },
  backButton: {
    marginTop: Spacing.xxs,
  },
});
