/**
 * ProgressSteps — Step indicator for the new-assessment wizard flow.
 * Shows completed, current, and upcoming steps.
 *
 * Used in the staff new-assessment flow (Spec §6.2):
 *   1. Patient Info → 2. Symptoms → 3. Image → 4. Vitals → 5. Review
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors, Typography, Spacing } from '@/constants/theme';

interface ProgressStepsProps {
  /** Labels for each step */
  steps: string[];
  /** Zero-based index of the currently active step */
  currentStep: number;
}

export default function ProgressSteps({ steps, currentStep }: ProgressStepsProps) {
  return (
    <View style={styles.container}>
      {steps.map((label, index) => {
        const isCompleted = index < currentStep;
        const isCurrent = index === currentStep;
        const isUpcoming = index > currentStep;

        return (
          <View key={label} style={styles.stepWrapper}>
            {/* Connector line (before all steps except the first) */}
            {index > 0 && (
              <View
                style={[
                  styles.connector,
                  isCompleted || isCurrent
                    ? styles.connectorActive
                    : styles.connectorInactive,
                ]}
              />
            )}

            {/* Step circle */}
            <View
              style={[
                styles.circle,
                isCompleted && styles.circleCompleted,
                isCurrent && styles.circleCurrent,
                isUpcoming && styles.circleUpcoming,
              ]}
            >
              {isCompleted ? (
                <Text style={styles.checkmark}>✓</Text>
              ) : (
                <Text
                  style={[
                    styles.stepNumber,
                    isCurrent && styles.stepNumberCurrent,
                    isUpcoming && styles.stepNumberUpcoming,
                  ]}
                >
                  {index + 1}
                </Text>
              )}
            </View>

            {/* Step label */}
            <Text
              style={[
                styles.label,
                isCurrent && styles.labelCurrent,
                isUpcoming && styles.labelUpcoming,
              ]}
              numberOfLines={1}
            >
              {label}
            </Text>
          </View>
        );
      })}
    </View>
  );
}

// ---------------------------------------------------------------------------
// Styles
// ---------------------------------------------------------------------------
const CIRCLE_SIZE = 28;

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.xxs,
    paddingVertical: Spacing.xs,
  },
  stepWrapper: {
    flex: 1,
    alignItems: 'center',
  },

  // Connector line
  connector: {
    position: 'absolute',
    top: CIRCLE_SIZE / 2,
    right: '50%',
    width: '100%',
    height: 2,
    zIndex: -1,
  },
  connectorActive: {
    backgroundColor: Colors.primary,
  },
  connectorInactive: {
    backgroundColor: Colors.border,
  },

  // Step circle
  circle: {
    width: CIRCLE_SIZE,
    height: CIRCLE_SIZE,
    borderRadius: CIRCLE_SIZE / 2,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.xxs,
  },
  circleCompleted: {
    backgroundColor: Colors.primary,
  },
  circleCurrent: {
    backgroundColor: Colors.primary,
    borderWidth: 2,
    borderColor: Colors.primaryLight,
  },
  circleUpcoming: {
    backgroundColor: Colors.background,
    borderWidth: 1.5,
    borderColor: Colors.border,
  },

  // Number / checkmark inside circle
  checkmark: {
    fontFamily: Typography.bold,
    fontSize: 14,
    color: Colors.surface,
  },
  stepNumber: {
    fontFamily: Typography.semiBold,
    fontSize: 12,
  },
  stepNumberCurrent: {
    color: Colors.surface,
  },
  stepNumberUpcoming: {
    color: Colors.textSecondary,
  },

  // Label below circle
  label: {
    fontFamily: Typography.medium,
    fontSize: 11,
    color: Colors.textPrimary,
    textAlign: 'center',
  },
  labelCurrent: {
    fontFamily: Typography.semiBold,
    color: Colors.primary,
  },
  labelUpcoming: {
    color: Colors.textSecondary,
  },
});
