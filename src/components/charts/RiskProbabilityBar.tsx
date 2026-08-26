/**
 * RiskProbabilityBar — Spec §6.2
 *
 * 3-way stacked horizontal bar showing Low/Medium/High percentage split.
 *
 * U1 restyle: repoint colors/spacing to new tokens. Layout logic unchanged.
 * Risk colors resolved through useTheme() so they work in both modes.
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '@/hooks/use-theme';
import { TypographyScale, Spacing, Radius } from '@/constants/theme';

interface RiskProbabilityBarProps {
  probabilities: { Low: number; Medium: number; High: number };
}

export default function RiskProbabilityBar({ probabilities }: RiskProbabilityBarProps) {
  const { colors } = useTheme();
  const { Low, Medium, High } = probabilities;

  return (
    <View style={styles.container}>
      {/* Stacked bar */}
      <View style={styles.bar}>
        {Low > 0 && (
          <View style={[styles.segment, { flex: Low, backgroundColor: colors.riskLow }]}>
            {Low >= 10 && (
              <Text style={[styles.segmentLabel, { color: colors.textOnPrimary }]}>
                {Low.toFixed(1)}%
              </Text>
            )}
          </View>
        )}
        {Medium > 0 && (
          <View style={[styles.segment, { flex: Medium, backgroundColor: colors.riskMedium }]}>
            {Medium >= 10 && (
              <Text style={[styles.segmentLabel, { color: colors.textOnPrimary }]}>
                {Medium.toFixed(1)}%
              </Text>
            )}
          </View>
        )}
        {High > 0 && (
          <View style={[styles.segment, { flex: High, backgroundColor: colors.riskHigh }]}>
            {High >= 10 && (
              <Text style={[styles.segmentLabel, { color: colors.textOnPrimary }]}>
                {High.toFixed(1)}%
              </Text>
            )}
          </View>
        )}
      </View>

      {/* Legend */}
      <View style={styles.legend}>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: colors.riskLow }]} />
          <Text style={[TypographyScale.caption, { color: colors.textSecondary, fontVariant: ['tabular-nums'] }]}>
            Low: {Low.toFixed(1)}%
          </Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: colors.riskMedium }]} />
          <Text style={[TypographyScale.caption, { color: colors.textSecondary, fontVariant: ['tabular-nums'] }]}>
            Med: {Medium.toFixed(1)}%
          </Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: colors.riskHigh }]} />
          <Text style={[TypographyScale.caption, { color: colors.textSecondary, fontVariant: ['tabular-nums'] }]}>
            High: {High.toFixed(1)}%
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: Spacing.xs,
  },
  bar: {
    flexDirection: 'row',
    height: 28,
    borderRadius: Radius.md,
    overflow: 'hidden',
    marginBottom: Spacing.sm,
  },
  segment: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  segmentLabel: {
    fontFamily: TypographyScale.caption.fontFamily,
    fontSize: 11,
    fontVariant: ['tabular-nums'],
  },
  legend: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xxs,
  },
  legendDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
});
