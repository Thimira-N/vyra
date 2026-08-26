/**
 * GlassHeader — sticky translucent header/navbar component.
 *
 * Phase U0/U2: Replaces solid `headerStyle` backgrounds in _layout.tsx files.
 * Uses higher blur amounts (header tier per Spec §2.3) so content
 * scrolling behind stays visually distinct but doesn't compete with
 * header text.
 *
 * Gracefully degrades:
 *   - glassIntensity='off' → opaque surface header
 *   - Android/web → expo-blur BlurView + tint layer
 */

import React from 'react';
import { View, StyleSheet, Platform, type ViewStyle, type StyleProp } from 'react-native';
import { BlurView } from 'expo-blur';
import { useTheme } from '@/hooks/use-theme';
import { Glass } from '@/constants/theme';

interface GlassHeaderProps {
  children?: React.ReactNode;
  /** Additional styles applied to the outer wrapper */
  style?: StyleProp<ViewStyle>;
}

export function GlassHeader({ children, style }: GlassHeaderProps) {
  const { colors, isDark, glassIntensity } = useTheme();

  // Opaque fallback when glass is off
  if (glassIntensity === 'off') {
    return (
      <View
        style={[
          styles.container,
          {
            backgroundColor: colors.surface,
            borderBottomWidth: 1,
            borderBottomColor: colors.border,
          },
          style,
        ]}
      >
        {children}
      </View>
    );
  }

  const rawBlur = isDark ? Glass.blur.header.dark : Glass.blur.header.light;
  const blurAmount = glassIntensity === 'reduced' ? Math.round(rawBlur * 0.5) : rawBlur;

  return (
    <View
      style={[
        styles.container,
        {
          borderBottomWidth: 1,
          borderBottomColor: colors.glassBorder,
          backgroundColor: colors.glassTint,
          ...(Platform.OS === 'web'
            ? {
                backdropFilter: `blur(${blurAmount}px)`,
                WebkitBackdropFilter: `blur(${blurAmount}px)`,
              }
            : {}),
        },
        style,
      ]}
    >
      <BlurView
        intensity={blurAmount}
        tint={isDark ? 'dark' : 'light'}
        style={StyleSheet.absoluteFill}
      />
      {/* Tint layer for text contrast safety */}
      <View
        style={[
          StyleSheet.absoluteFill,
          { backgroundColor: colors.glassTint },
        ]}
      />
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    overflow: 'hidden',
  },
});
