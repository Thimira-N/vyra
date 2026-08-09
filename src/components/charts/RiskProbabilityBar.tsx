/**
 * RiskProbabilityBar — Spec §6.2
 *
 * 3-way stacked horizontal bar showing Low/Medium/High percentage split.
 * Uses the exact risk colors from Spec §5's palette.
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors, Typography, Spacing } from '@/constants/theme';

interface RiskProbabilityBarProps {
  probabilities: { Low: number; Medium: number; High: number };
}

export default function RiskProbabilityBar({ probabilities }: RiskProbabilityBarProps) {
  const { Low, Medium, High } = probabilities;

  return (
    <View style={styles.container}>
      {/* Stacked bar */}
      <View style={styles.bar}>
        {Low > 0 && (
          <View style={[styles.segment, { flex: Low, backgroundColor: Colors.riskLow }]}>
            {Low >= 10 && <Text style={styles.segmentLabel}>{Low.toFixed(1)}%</Text>}
          </View>
        )}
        {Medium > 0 && (
          <View style={[styles.segment, { flex: Medium, backgroundColor: Colors.riskMedium }]}>
            {Medium >= 10 && <Text style={styles.segmentLabel}>{Medium.toFixed(1)}%</Text>}
          </View>
        )}
        {High > 0 && (
          <View style={[styles.segment, { flex: High, backgroundColor: Colors.riskHigh }]}>
            {High >= 10 && <Text style={styles.segmentLabel}>{High.toFixed(1)}%</Text>}
          </View>
        )}
      </View>

      {/* Legend */}
      <View style={styles.legend}>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: Colors.riskLow }]} />
          <Text style={styles.legendText}>Low: {Low.toFixed(1)}%</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: Colors.riskMedium }]} />
          <Text style={styles.legendText}>Med: {Medium.toFixed(1)}%</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: Colors.riskHigh }]} />
          <Text style={styles.legendText}>High: {High.toFixed(1)}%</Text>
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
    borderRadius: 14,
    overflow: 'hidden',
    marginBottom: Spacing.sm,
  },
  segment: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  segmentLabel: {
    fontFamily: Typography.semiBold,
    fontSize: 11,
    color: Colors.surface,
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
  legendText: {
    fontFamily: Typography.medium,
    fontSize: 12,
    color: Colors.textSecondary,
    fontVariant: ['tabular-nums'],
  },
});
