/**
 * Analyzing — Spec §6.2
 * Loading screen shown while backend processes the assessment.
 * Shows a progressive checklist animation.
 * Placeholder for Phase F0. Real API call in Phase F2.
 */

import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { Colors, Typography, Spacing } from '@/constants/theme';

const ANALYSIS_STEPS = [
  { label: 'Analyzing image...', icon: '🔬' },
  { label: 'Analyzing symptoms...', icon: '📝' },
  { label: 'Analyzing vitals...', icon: '💓' },
  { label: 'Combining results...', icon: '🧠' },
];

export default function AnalyzingScreen() {
  const [activeStep, setActiveStep] = useState(0);

  // Simulated progress for F0 placeholder
  useEffect(() => {
    const timer = setInterval(() => {
      setActiveStep((prev) => {
        if (prev >= ANALYSIS_STEPS.length - 1) {
          clearInterval(timer);
          return prev;
        }
        return prev + 1;
      });
    }, 1200);

    return () => clearInterval(timer);
  }, []);

  return (
    <View style={styles.screen}>
      <View style={styles.content}>
        <ActivityIndicator size="large" color={Colors.primary} style={styles.spinner} />

        <Text style={styles.title}>Analyzing Assessment</Text>
        <Text style={styles.subtitle}>
          Processing multi-modal clinical data...
        </Text>

        <View style={styles.steps}>
          {ANALYSIS_STEPS.map((step, index) => {
            const isDone = index < activeStep;
            const isActive = index === activeStep;

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
      </View>

      <Text style={styles.footer}>
        This usually takes a few seconds
      </Text>
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
});
