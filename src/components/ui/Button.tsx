/**
 * Button — Primary, outline, and ghost variants.
 * All interactive targets ≥ 44×44pt (accessibility requirement).
 *
 * U1 restyle per Spec §7:
 *   primary: gradient fill, md radius, button type token, raised shadow,
 *            96%-scale press animation (120ms).
 *   outline: glass button (GlassCard bg + glassBorderStrong), text primary.
 *   ghost:   repointed to new tokens, transparent bg.
 *   disabled: 40% opacity, no shadow.
 */

import React, { useRef, useCallback } from 'react';
import {
  Pressable,
  Text,
  View,
  ActivityIndicator,
  Animated,
  type ViewStyle,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { GlassCard } from '@/components/ui/GlassCard';
import { useTheme } from '@/hooks/use-theme';
import { TypographyScale, Spacing, Radius } from '@/constants/theme';

type ButtonVariant = 'primary' | 'outline' | 'ghost';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: ButtonVariant;
  disabled?: boolean;
  loading?: boolean;
  style?: ViewStyle;
}

export default function Button({
  title,
  onPress,
  variant = 'primary',
  disabled = false,
  loading = false,
  style,
}: ButtonProps) {
  const { colors, elevation, reduceMotion } = useTheme();
  const isDisabled = disabled || loading;

  // 96%-scale press animation (120ms ease-out) per Spec §1.4 / §7
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const onPressIn = useCallback(() => {
    if (reduceMotion) return;
    Animated.timing(scaleAnim, {
      toValue: 0.96,
      duration: 120,
      useNativeDriver: true,
    }).start();
  }, [scaleAnim, reduceMotion]);

  const onPressOut = useCallback(() => {
    if (reduceMotion) return;
    Animated.timing(scaleAnim, {
      toValue: 1,
      duration: 120,
      useNativeDriver: true,
    }).start();
  }, [scaleAnim, reduceMotion]);

  // ── Outline variant: glass button ──
  if (variant === 'outline') {
    return (
      <Animated.View
        style={[
          { transform: [{ scale: scaleAnim }] },
          isDisabled && { opacity: 0.4 },
          style,
        ]}
      >
        <GlassCard
          elevation={isDisabled ? 'flat' : 'raised'}
          radius="md"
          borderStrong
          style={{
            minHeight: 48,
            paddingHorizontal: Spacing.lg,
            paddingVertical: Spacing.sm,
            alignItems: 'center' as const,
            justifyContent: 'center' as const,
          }}
        >
          <Pressable
            onPress={onPress}
            onPressIn={onPressIn}
            onPressOut={onPressOut}
            disabled={isDisabled}
            style={{
              width: '100%',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {loading ? (
              <ActivityIndicator size="small" color={colors.primary} />
            ) : (
              <Text style={[TypographyScale.button, { color: colors.primary }]}>
                {title}
              </Text>
            )}
          </Pressable>
        </GlassCard>
      </Animated.View>
    );
  }

  // ── Ghost variant: text-only, transparent bg ──
  if (variant === 'ghost') {
    return (
      <Animated.View style={[{ transform: [{ scale: scaleAnim }] }, style]}>
        <Pressable
          onPress={onPress}
          onPressIn={onPressIn}
          onPressOut={onPressOut}
          disabled={isDisabled}
          style={[
            {
              minHeight: 48,
              paddingHorizontal: Spacing.md,
              paddingVertical: Spacing.sm,
              borderRadius: Radius.md,
              alignItems: 'center',
              justifyContent: 'center',
            },
            isDisabled && { opacity: 0.4 },
          ]}
        >
          {loading ? (
            <ActivityIndicator size="small" color={colors.primary} />
          ) : (
            <Text style={[TypographyScale.button, { color: colors.primary }]}>
              {title}
            </Text>
          )}
        </Pressable>
      </Animated.View>
    );
  }

  // ── Primary variant: gradient fill ──
  return (
    <Animated.View
      style={[
        { transform: [{ scale: scaleAnim }] },
        isDisabled && { opacity: 0.4 },
        style,
      ]}
    >
      <Pressable
        onPress={onPress}
        onPressIn={onPressIn}
        onPressOut={onPressOut}
        disabled={isDisabled}
        style={{
          borderRadius: Radius.md,
          overflow: 'hidden',
          ...(isDisabled ? {} : elevation.raised),
        }}
      >
        <LinearGradient
          colors={[colors.primaryGradientStart, colors.primaryGradientEnd]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={{
            minHeight: 48,
            paddingHorizontal: Spacing.lg,
            paddingVertical: Spacing.sm,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {loading ? (
            <ActivityIndicator size="small" color={colors.textOnPrimary} />
          ) : (
            <Text
              style={[TypographyScale.button, { color: colors.textOnPrimary }]}
            >
              {title}
            </Text>
          )}
        </LinearGradient>
      </Pressable>
    </Animated.View>
  );
}
