/**
 * ProgressSteps — Step indicator for the new-assessment wizard flow.
 * Shows completed, current, and upcoming steps with clinical aesthetic.
 *
 * Steps:
 *   1. Patient → 2. Symptoms → 3. Image → 4. Vitals → 5. Review
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/hooks/use-theme';
import { TypographyScale, Spacing, Radius } from '@/constants/theme';

interface ProgressStepsProps {
  /** Labels for each step */
  steps: string[];
  /** Zero-based index of the currently active step */
  currentStep: number;
}

export default function ProgressSteps({ steps, currentStep }: ProgressStepsProps) {
  const { colors, isDark } = useTheme();

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
                      isCompleted || isCurrent
                        ? colors.primary
                        : isDark
                          ? colors.border
                          : '#E2E8F0',
                  },
                ]}
              />
            )}

            {/* Step circle */}
            <View
              style={[
                styles.circle,
                isCompleted && {
                  backgroundColor: `${colors.primary}18`,
                  borderWidth: 2,
                  borderColor: colors.primary,
                },
                isCurrent && {
                  backgroundColor: colors.primary,
                  borderWidth: 2,
                  borderColor: isDark ? '#4FD1E0' : colors.primaryLight,
                  shadowColor: colors.primary,
                  shadowOffset: { width: 0, height: 3 },
                  shadowOpacity: 0.35,
                  shadowRadius: 8,
                  elevation: 4,
                },
                isUpcoming && {
                  backgroundColor: isDark ? colors.surfaceSunken : '#F1F5F9',
                  borderWidth: 1.5,
                  borderColor: colors.border,
                },
              ]}
            >
              {isCompleted ? (
                <Ionicons name="checkmark" size={14} color={colors.primary} />
              ) : (
                <Text
                  style={[
                    styles.stepNumber,
                    {
                      color: isCurrent
                        ? (isDark ? '#0B1418' : '#FFFFFF')
                        : colors.textSecondary,
                      fontWeight: isCurrent ? '800' : '600',
                    },
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
                {
                  color: isCurrent
                    ? colors.primary
                    : isCompleted
                      ? colors.textPrimary
                      : colors.textTertiary,
                  fontWeight: isCurrent ? '700' : '500',
                },
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

const CIRCLE_SIZE = 30;

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.xs,
    paddingVertical: Spacing.xs,
    marginBottom: Spacing.xs,
  },
  stepWrapper: {
    flex: 1,
    alignItems: 'center',
    position: 'relative',
  },
  connector: {
    position: 'absolute',
    top: CIRCLE_SIZE / 2,
    right: '50%',
    width: '100%',
    height: 2.5,
    zIndex: -1,
  },
  circle: {
    width: CIRCLE_SIZE,
    height: CIRCLE_SIZE,
    borderRadius: CIRCLE_SIZE / 2,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  stepNumber: {
    fontFamily: TypographyScale.caption.fontFamily,
    fontSize: 12,
  },
  label: {
    fontFamily: TypographyScale.caption.fontFamily,
    textAlign: 'center',
    fontSize: 11,
    letterSpacing: 0.2,
  },
});
