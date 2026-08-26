/**
 * RiskBadge — Renders Low/Medium/High risk level.
 *
 * U1 restyle per Spec §7:
 *   - Pill shape (radius: pill / 999)
 *   - Tinted-glass background: risk color @ 15% opacity
 *   - Text/icon in full-saturation risk color
 *   - Keeps the same three-state color mapping
 *   - Dot + label for colorblind-safety (§8.5)
 */

import React from 'react';
import { View, Text, StyleSheet, type ViewStyle } from 'react-native';
import { useTheme } from '@/hooks/use-theme';
import { TypographyScale, Spacing, Radius, type RiskLevel } from '@/constants/theme';

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
  const { colors } = useTheme();

  // Resolve risk color from theme tokens (respects light/dark mode)
  const riskColorMap: Record<RiskLevel, string> = {
    Low: colors.riskLow,
    Medium: colors.riskMedium,
    High: colors.riskHigh,
  };
  const color = riskColorMap[level];

  const sizeConfig = sizes[size];

  return (
    <View
      style={[
        styles.badge,
        {
          backgroundColor: `${color}26`, // 15% opacity (hex 26 ≈ 15%)
          borderColor: `${color}40`,
          borderRadius: Radius.pill,
          paddingHorizontal: sizeConfig.paddingH,
          paddingVertical: sizeConfig.paddingV,
        },
        style,
      ]}
    >
      <View
        style={[
          styles.dot,
          {
            backgroundColor: color,
            width: sizeConfig.dotSize,
            height: sizeConfig.dotSize,
          },
        ]}
      />
      <Text
        style={[
          TypographyScale.caption,
          {
            color,
            fontSize: sizeConfig.fontSize,
            fontFamily: TypographyScale.caption.fontFamily,
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

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    alignSelf: 'flex-start',
  },
  dot: {
    borderRadius: Radius.pill,
    marginRight: Spacing.xxs + 2,
  },
});
