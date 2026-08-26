/**
 * ProgressSteps — Step indicator for the new-assessment wizard flow.
 * Shows completed, current, and upcoming steps.
 *
 * U1 restyle per Spec §7:
 *   - Active step: filled primary circle + connecting line in primary
 *   - Completed: primary outline + checkmark
 *   - Upcoming: border-colored outline
 *   - No glass — small UI, glass adds noise not depth
 *
 * Used in the staff new-assessment flow (Spec §6.2):
 *   1. Patient Info → 2. Symptoms → 3. Image → 4. Vitals → 5. Review
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '@/hooks/use-theme';
import { TypographyScale, Spacing } from '@/constants/theme';

interface ProgressStepsProps {
  /** Labels for each step */
  steps: string[];
  /** Zero-based index of the currently active step */
  currentStep: number;
}

export default function ProgressSteps({ steps, currentStep }: ProgressStepsProps) {
  const { colors } = useTheme();

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
                  {
                    backgroundColor:
                      isCompleted || isCurrent ? colors.primary : colors.border,
                  },
                ]}
              />
            )}

            {/* Step circle */}
            <View
              style={[
                styles.circle,
                isCompleted && {
                  backgroundColor: 'transparent',
                  borderWidth: 2,
                  borderColor: colors.primary,
                },
                isCurrent && {
                  backgroundColor: colors.primary,
                },
                isUpcoming && {
                  backgroundColor: 'transparent',
                  borderWidth: 1.5,
                  borderColor: colors.border,
                },
              ]}
            >
              {isCompleted ? (
                <Text
                  style={[
                    styles.checkmark,
                    { color: colors.primary },
                  ]}
                >
                  ✓
                </Text>
              ) : (
                <Text
                  style={[
                    styles.stepNumber,
                    isCurrent && { color: colors.textOnPrimary },
                    isUpcoming && { color: colors.textSecondary },
                  ]}
                >
                  {index + 1}
                </Text>
              )}
            </View>

            {/* Step label */}
            <Text
              style={[
                TypographyScale.caption,
                styles.label,
                { color: colors.textPrimary },
                isCurrent && {
                  fontFamily: TypographyScale.button.fontFamily,
                  color: colors.primary,
                },
                isUpcoming && { color: colors.textSecondary },
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

  // Step circle
  circle: {
    width: CIRCLE_SIZE,
    height: CIRCLE_SIZE,
    borderRadius: CIRCLE_SIZE / 2,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.xxs,
  },

  // Number / checkmark inside circle
  checkmark: {
    fontFamily: TypographyScale.button.fontFamily,
    fontSize: 14,
  },
  stepNumber: {
    fontFamily: TypographyScale.caption.fontFamily,
    fontSize: 12,
  },

  // Label below circle
  label: {
    textAlign: 'center',
    fontSize: 11,
  },
});
