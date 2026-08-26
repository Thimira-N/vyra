/**
 * New Assessment — Stack layout enforcing step order.
 * Spec §4, §7: "Stack with translucent GlassHeader and theme tokens"
 *
 * Steps: Patient Info → Symptoms → Image → Vitals → Review → Analyzing → Result
 */

import React from 'react';
import { Stack } from 'expo-router';
import { StyleSheet } from 'react-native';
import { useTheme } from '@/hooks/use-theme';
import { GlassHeader } from '@/components/ui/GlassHeader';
import { TypographyScale } from '@/constants/theme';

export default function NewAssessmentLayout() {
  const { colors } = useTheme();

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        headerTransparent: true,
        headerBackground: () => <GlassHeader style={StyleSheet.absoluteFill} />,
        headerTintColor: colors.textPrimary,
        headerTitleStyle: {
          fontFamily: TypographyScale.h3.fontFamily,
          fontSize: TypographyScale.h3.fontSize,
          color: colors.textPrimary,
        },
        headerShadowVisible: false,
        contentStyle: { backgroundColor: colors.background },
      }}
    >
      <Stack.Screen name="patient-info" options={{ title: 'Patient Info' }} />
      <Stack.Screen name="symptoms" options={{ title: 'Symptoms' }} />
      <Stack.Screen name="image-capture" options={{ title: 'Image Capture' }} />
      <Stack.Screen name="vitals" options={{ title: 'Vitals' }} />
      <Stack.Screen name="review-submit" options={{ title: 'Review & Submit' }} />
      <Stack.Screen
        name="analyzing"
        options={{
          title: 'Analyzing',
          headerShown: false,
          gestureEnabled: false,
        }}
      />
      <Stack.Screen
        name="result"
        options={{
          title: 'Assessment Result',
          headerBackVisible: false,
          gestureEnabled: false,
        }}
      />
    </Stack>
  );
}
