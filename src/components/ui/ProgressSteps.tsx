/**
 * ProgressSteps — Ultra-premium Clinical Glass Stepper Card for the wizard flow.
 * Steps: 1. Patient → 2. Symptoms → 3. Image → 4. Vitals → 5. Review
 */

import React from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/hooks/use-theme';
import { Spacing, Radius } from '@/constants/theme';

interface ProgressStepsProps {
  /** Labels for each step */
  steps: string[];
  /** Zero-based index of the currently active step */
  currentStep: number;
}

const STEP_ICONS: Array<keyof typeof Ionicons.glyphMap> = [
  'person',
  'pulse',
  'scan',
  'heart',
  'shield-checkmark',
];

export default function ProgressSteps({ steps, currentStep }: ProgressStepsProps) {
  const { colors, isDark } = useTheme();
  const progressPercent = Math.round(((currentStep + 1) / steps.length) * 100);

  return (
    <View
      style={[
        styles.cardContainer,
        {
          backgroundColor: isDark ? 'rgba(18, 28, 34, 0.75)' : 'rgba(255, 255, 255, 0.85)',
          borderColor: isDark ? 'rgba(79, 209, 224, 0.20)' : 'rgba(15, 76, 92, 0.10)',
        },
      ]}
    >
      {/* Top Meta: Step Count & Percentage */}
      <View style={styles.headerRow}>
        <View style={styles.leftMeta}>
          <View
            style={[
              styles.stepBadge,
              {
                backgroundColor: isDark ? 'rgba(79, 209, 224, 0.15)' : 'rgba(15, 76, 92, 0.10)',
                borderColor: isDark ? 'rgba(79, 209, 224, 0.30)' : 'rgba(15, 76, 92, 0.18)',
              },
            ]}
          >
            <View style={[styles.pulseDot, { backgroundColor: colors.primary }]} />
            <Text style={[styles.stepBadgeText, { color: colors.primary }]}>
              STEP {currentStep + 1} OF {steps.length}
            </Text>
          </View>
          <Text style={[styles.currentStepTitle, { color: colors.textPrimary }]}>
            {steps[currentStep]}
          </Text>
        </View>

        <Text style={[styles.percentText, { color: colors.textSecondary }]}>
          {progressPercent}% Complete
        </Text>
      </View>

      {/* Segmented Progress Track */}
      <View style={styles.segmentTrack}>
        {steps.map((_, index) => {
          const isCompleted = index < currentStep;
          const isCurrent = index === currentStep;

          return (
            <View
              key={index}
              style={[
                styles.segmentBar,
                {
                  backgroundColor: isCompleted || isCurrent
                    ? colors.primary
                    : isDark
                      ? 'rgba(255, 255, 255, 0.08)'
                      : '#E8ECEE',
                  opacity: isCompleted ? 1 : isCurrent ? 1 : 0.6,
                },
                isCurrent && {
                  shadowColor: colors.primary,
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.4,
                  shadowRadius: 4,
                  elevation: 2,
                },
              ]}
            />
          );
        })}
      </View>

      {/* Steps Icon Row */}
      <View style={styles.iconsRow}>
        {steps.map((label, index) => {
          const isCompleted = index < currentStep;
          const isCurrent = index === currentStep;
          const iconName = STEP_ICONS[index] || 'ellipse';

          return (
            <View key={label} style={styles.stepItem}>
              <View
                style={[
                  styles.iconBubble,
                  isCurrent && {
                    backgroundColor: colors.primary,
                    borderColor: isDark ? '#4FD1E0' : colors.primaryLight,
                  },
                  isCompleted && {
                    backgroundColor: isDark ? 'rgba(79, 209, 224, 0.15)' : 'rgba(15, 76, 92, 0.08)',
                    borderColor: colors.primary,
                  },
                  !isCurrent && !isCompleted && {
                    backgroundColor: 'transparent',
                    borderColor: 'transparent',
                  },
                ]}
              >
                <Ionicons
                  name={isCompleted ? 'checkmark' : iconName}
                  size={13}
                  color={
                    isCurrent
                      ? '#FFFFFF'
                      : isCompleted
                        ? colors.primary
                        : colors.textTertiary
                  }
                />
              </View>
              <Text
                style={[
                  styles.stepLabelText,
                  {
                    color: isCurrent
                      ? colors.primary
                      : isCompleted
                        ? colors.textPrimary
                        : colors.textTertiary,
                    fontFamily: isCurrent
                      ? 'Inter_700Bold'
                      : isCompleted
                        ? 'Inter_600SemiBold'
                        : 'Inter_400Regular',
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
    </View>
  );
}

const styles = StyleSheet.create({
  cardContainer: {
    borderRadius: 18,
    borderWidth: 1,
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.sm + 2,
    paddingBottom: Spacing.sm,
    marginBottom: Spacing.md,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.05,
        shadowRadius: 10,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.xs + 2,
  },
  leftMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  stepBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: Radius.pill,
    borderWidth: 1,
  },
  pulseDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    marginRight: 5,
  },
  stepBadgeText: {
    fontFamily: 'Inter_700Bold',
    fontSize: 9.5,
    letterSpacing: 0.5,
  },
  currentStepTitle: {
    fontFamily: 'Inter_700Bold',
    fontSize: 14,
  },
  percentText: {
    fontFamily: 'Inter_500Medium',
    fontSize: 11,
  },
  segmentTrack: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginBottom: Spacing.xs + 4,
  },
  segmentBar: {
    flex: 1,
    height: 4.5,
    borderRadius: 3,
  },
  iconsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  stepItem: {
    flex: 1,
    alignItems: 'center',
  },
  iconBubble: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 2,
  },
  stepLabelText: {
    fontSize: 10,
    letterSpacing: 0.1,
    textAlign: 'center',
  },
});
