/**
 * Auth group layout — Stack navigator for auth screens.
 * Spec §4, §7: "Auth stack layout with translucent navigation chrome"
 */

import React from 'react';
import { Stack } from 'expo-router';
import { StyleSheet } from 'react-native';
import { useTheme } from '@/hooks/use-theme';
import { GlassHeader } from '@/components/ui/GlassHeader';
import { TypographyScale } from '@/constants/theme';

export default function AuthLayout() {
  const { colors } = useTheme();

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
        headerTransparent: true,
        headerBackground: () => <GlassHeader style={StyleSheet.absoluteFill} />,
        headerTintColor: colors.textPrimary,
        headerTitleStyle: {
          fontFamily: TypographyScale.h3.fontFamily,
          fontSize: TypographyScale.h3.fontSize,
          color: colors.textPrimary,
        },
      }}
    >
      <Stack.Screen name="get-started" />
      <Stack.Screen name="login" />
      <Stack.Screen name="register" />
      <Stack.Screen name="forgot-password" />
      <Stack.Screen name="consent" />
    </Stack>
  );
}
