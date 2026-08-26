/**
 * GlassCard — frosted glass panel component.
 *
 * Phase U0: Primary glass primitive per Spec §6.4.
 * Uses `expo-glass-effect` (GlassView / Liquid Glass) on iOS 26+,
 * falls back to `expo-blur` BlurView + tint layer on Android/web.
 *
 * When glassIntensity is 'off', renders as a flat opaque surface card
 * with no blur cost (accessibility/performance escape hatch per Spec §9.1).
 */

import React from 'react';
import { View, StyleSheet, Platform, type ViewStyle, type StyleProp } from 'react-native';
import { BlurView } from 'expo-blur';
import { useTheme } from '@/hooks/use-theme';
import {
  Glass,
  Radius,
  type ElevationStyle,
} from '@/constants/theme';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type GlassTint = 'default' | 'elevated';
export type GlassElevation = 'flat' | 'raised' | 'floating' | 'overlay';

interface GlassCardProps {
  children: React.ReactNode;
  /** Elevation level — maps to the Elevation tokens (shadow depth) */
  elevation?: GlassElevation;
  /** Corner radius — defaults to `lg` (20) per Spec §3 */
  radius?: keyof typeof Radius;
  /** Tint style — 'elevated' for modals/sheets, 'default' for standard cards */
  tint?: GlassTint;
  /** Use stronger border (for cards holding critical data like risk results) */
  borderStrong?: boolean;
  /** Additional styles */
  style?: StyleProp<ViewStyle>;
}

// ---------------------------------------------------------------------------
// Blur amount resolver
// ---------------------------------------------------------------------------

function getBlurAmount(isDark: boolean, elevation: GlassElevation): number {
  switch (elevation) {
    case 'overlay':
      return isDark ? Glass.blur.modal.dark : Glass.blur.modal.light;
    case 'floating':
      return isDark ? Glass.blur.header.dark : Glass.blur.header.light;
    case 'raised':
    case 'flat':
    default:
      return isDark ? Glass.blur.card.dark : Glass.blur.card.light;
  }
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function GlassCard({
  children,
  elevation = 'raised',
  radius = 'lg',
  tint = 'default',
  borderStrong = false,
  style,
}: GlassCardProps) {
  const { colors, elevation: elevationTokens, isDark, glassIntensity } = useTheme();

  const cornerRadius = Radius[radius];
  const shadowStyle: ElevationStyle = elevationTokens[elevation];
  const tintColor = tint === 'elevated' ? colors.glassTintElevated : colors.glassTint;
  const borderColor = borderStrong ? colors.glassBorderStrong : colors.glassBorder;

  // Glass off → opaque surface card (accessibility / performance)
  if (glassIntensity === 'off') {
    return (
      <View
        style={[
          {
            backgroundColor: tint === 'elevated' ? colors.surfaceRaised : colors.surface,
            borderRadius: cornerRadius,
            borderWidth: 1,
            borderColor: colors.border,
            overflow: 'hidden',
            ...shadowStyle,
          },
          style,
        ]}
      >
        {children}
      </View>
    );
  }

  const blurAmount = glassIntensity === 'reduced'
    ? Math.round(getBlurAmount(isDark, elevation) * 0.5)
    : getBlurAmount(isDark, elevation);

  // iOS: use BlurView (expo-blur) — works on all iOS versions
  // Android/web: BlurView + tint overlay
  // Note: expo-glass-effect (Liquid Glass) is iOS 26+ only and is a UI-level
  // API — we use expo-blur for the cross-platform glass fallback here.
  // In a future phase, we can add GlassView from expo-glass-effect as a
  // progressive enhancement on iOS 26+.
  if (Platform.OS === 'ios') {
    return (
      <View
        style={[
          {
            borderRadius: cornerRadius,
            overflow: 'hidden',
            borderWidth: 1,
            borderColor,
            ...shadowStyle,
          },
          style,
        ]}
      >
        <BlurView
          intensity={blurAmount}
          tint={isDark ? 'dark' : 'light'}
          style={StyleSheet.absoluteFill}
        />
        {/* Tint layer for text contrast safety per Spec §1.3 */}
        <View
          style={[
            StyleSheet.absoluteFill,
            { backgroundColor: tintColor },
          ]}
        />
        {/* Top highlight sheen (optional, 1px) */}
        <View
          style={[
            styles.highlight,
            { backgroundColor: colors.glassHighlight },
          ]}
        />
        {children}
      </View>
    );
  }

  // Android / Web fallback — tint-layer over BlurView
  return (
    <View
      style={[
        {
          borderRadius: cornerRadius,
          overflow: 'hidden',
          borderWidth: 1,
          borderColor,
          ...shadowStyle,
        },
        style,
      ]}
    >
      <BlurView
        intensity={blurAmount}
        tint={isDark ? 'dark' : 'light'}
        style={StyleSheet.absoluteFill}
      />
      {/* Semi-opaque tint for contrast — the fallback "glass" on Android/web */}
      <View
        style={[
          StyleSheet.absoluteFill,
          { backgroundColor: tintColor },
        ]}
      />
      {/* Top highlight sheen */}
      <View
        style={[
          styles.highlight,
          { backgroundColor: colors.glassHighlight },
        ]}
      />
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  highlight: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 1,
  },
});
