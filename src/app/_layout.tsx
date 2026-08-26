/**
 * Root Layout — loads Inter font, wraps app in TanStack QueryClientProvider,
 * applies clinical theme, and handles splash screen.
 *
 * Phase U0/U2: Added ThemeProvider wrapper, dynamic StatusBar, Inter_800ExtraBold,
 * and theme-aware root Stack defaults with GlassHeader presentation options.
 * Spec §4: "Root layout — loads fonts, auth check, splash"
 */

import React, { useEffect } from 'react';
import { Stack, ThemeProvider as ExpoRouterThemeProvider, DefaultTheme, DarkTheme } from 'expo-router';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useFonts } from 'expo-font';
import {
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
  Inter_800ExtraBold,
} from '@expo-google-fonts/inter';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet } from 'react-native';
import Toast from 'react-native-toast-message';
import { ThemeProvider, useTheme } from '@/components/ThemeProvider';
import { GlassHeader } from '@/components/ui/GlassHeader';
import { TypographyScale } from '@/constants/theme';
import { NotificationService } from '@/services/notificationService';

// Prevent splash screen from auto-hiding while we load fonts
SplashScreen.preventAutoHideAsync();

// TanStack Query client — single instance for the app lifecycle
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2,
      staleTime: 1000 * 60 * 5, // 5 minutes
    },
  },
});

/**
 * Inner layout that consumes ThemeProvider context.
 * Separated so useTheme() has access to the provider above it.
 */
function RootLayoutInner() {
  const { colors, isDark } = useTheme();

  // React Navigation theme wired to our token system
  const navTheme = isDark
    ? {
        ...DarkTheme,
        colors: {
          ...DarkTheme.colors,
          primary: colors.primary,
          background: colors.background,
          card: colors.surface,
          text: colors.textPrimary,
          border: colors.border,
          notification: colors.riskHigh,
        },
      }
    : {
        ...DefaultTheme,
        colors: {
          ...DefaultTheme.colors,
          primary: colors.primary,
          background: colors.background,
          card: colors.surface,
          text: colors.textPrimary,
          border: colors.border,
          notification: colors.riskHigh,
        },
      };

  return (
    <ExpoRouterThemeProvider value={navTheme}>
      <StatusBar style={isDark ? 'light' : 'dark'} />
      <Stack
        screenOptions={{
          headerShown: false,
          animation: 'fade',
          headerTransparent: true,
          headerBackground: () => <GlassHeader style={StyleSheet.absoluteFill} />,
          headerTintColor: colors.textPrimary,
          headerTitleStyle: {
            fontFamily: TypographyScale.h3.fontFamily,
            fontSize: TypographyScale.h3.fontSize,
            color: colors.textPrimary,
          },
          contentStyle: {
            backgroundColor: colors.background,
          },
        }}
      >
        <Stack.Screen name="index" />
        <Stack.Screen name="(auth)" />
        <Stack.Screen name="(staff)" />
        <Stack.Screen name="(reviewer)" />
        <Stack.Screen
          name="pdf-viewer"
          options={{
            presentation: 'modal',
            animation: 'slide_from_bottom',
            headerShown: false,
          }}
        />
        <Stack.Screen name="dev-theme-check" options={{ headerShown: false }} />
        <Stack.Screen
          name="+not-found"
          options={{
            headerShown: true,
            title: 'Not Found',
            headerTransparent: true,
            headerBackground: () => <GlassHeader style={StyleSheet.absoluteFill} />,
          }}
        />
      </Stack>
      <Toast />
    </ExpoRouterThemeProvider>
  );
}

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
    Inter_800ExtraBold,
  });

  useEffect(() => {
    if (fontsLoaded || fontError) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontError]);

  useEffect(() => {
    // Register for push notifications when the app starts
    NotificationService.registerForPushNotificationsAsync();
  }, []);

  if (!fontsLoaded && !fontError) {
    return null;
  }

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <RootLayoutInner />
      </ThemeProvider>
    </QueryClientProvider>
  );
}
