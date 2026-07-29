/**
 * New Assessment — Stack layout enforcing step order.
 * Spec §4: "Stack — enforces step order"
 *
 * Steps: Patient Info → Symptoms → Image → Vitals → Review → Analyzing → Result
 */

import { Stack } from 'expo-router';
import { Colors, Typography } from '@/constants/theme';

export default function NewAssessmentLayout() {
  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: Colors.surface },
        headerTintColor: Colors.textPrimary,
        headerTitleStyle: {
          fontFamily: Typography.semiBold,
          fontSize: 17,
        },
        headerShadowVisible: false,
        contentStyle: { backgroundColor: Colors.background },
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
