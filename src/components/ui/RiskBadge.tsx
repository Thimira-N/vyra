/**
 * RiskBadge — Renders Low/Medium/High in the corresponding risk color.
 *
 * Spec §5: "Risk badges are the one place color carries real semantic weight —
 * Low/Medium/High always render in the same three colors everywhere in the app."
 *
 * Colors:
 *   Low    → #2E9E5B (riskLow)
 *   Medium → #E0A100 (riskMedium)
 *   High   → #D14343 (riskHigh)
 */

import React from 'react';
import { View, Text, StyleSheet, type ViewStyle } from 'react-native';
import { Colors, Typography, Spacing, getRiskColor, type RiskLevel } from '@/constants/theme';

interface RiskBadgeProps {
  level: RiskLevel;
  /** Optional size variant */
  size?: 'small' | 'default' | 'large';
  style?: ViewStyle;
}

export default function RiskBadge({
  level,
  size = 'default',
  style,
}: RiskBadgeProps) {
  const color = getRiskColor(level);
  const sizeConfig = sizes[size];

  return (
    <View
      style={[
        styles.badge,
        {
          backgroundColor: `${color}18`,
          borderColor: `${color}40`,
          paddingHorizontal: sizeConfig.paddingH,
          paddingVertical: sizeConfig.paddingV,
        },
        style,
      ]}
    >
      <View style={[styles.dot, { backgroundColor: color, width: sizeConfig.dotSize, height: sizeConfig.dotSize }]} />
      <Text
        style={[
          styles.label,
          {
            color,
            fontSize: sizeConfig.fontSize,
          },
        ]}
      >
        {level}
      </Text>
    </View>
  );
}

// ---------------------------------------------------------------------------
// Size variants
// ---------------------------------------------------------------------------
const sizes = {
  small: { fontSize: 12, paddingH: Spacing.xs, paddingV: Spacing.xxs, dotSize: 6 },
  default: { fontSize: 14, paddingH: Spacing.sm, paddingV: Spacing.xxs + 2, dotSize: 8 },
  large: { fontSize: 16, paddingH: Spacing.md, paddingV: Spacing.xs, dotSize: 10 },
} as const;

// ---------------------------------------------------------------------------
// Styles
// ---------------------------------------------------------------------------
const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 20,
    borderWidth: 1,
    alignSelf: 'flex-start',
  },
  dot: {
    borderRadius: 999,
    marginRight: Spacing.xxs + 2,
  },
  label: {
    fontFamily: Typography.semiBold,
  },
});
