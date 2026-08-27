/**
 * Reviewer group layout — Tab navigator: Dashboard, Profile
 * Spec §4, §7: "Translucent GlassHeader & Floating Glass Tab Bar"
 * case/[id] is hidden from tabs (accessed via dashboard navigation).
 */

import React from 'react';
import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { View, StyleSheet, Platform } from 'react-native';
import { BlurView } from 'expo-blur';
import { useTheme } from '@/hooks/use-theme';
import { GlassHeader } from '@/components/ui/GlassHeader';
import { TypographyScale, Radius, Glass } from '@/constants/theme';

function TabBarIcon({
  focused,
  name,
  activeName,
  color,
}: {
  focused: boolean;
  name: keyof typeof Ionicons.glyphMap;
  activeName: keyof typeof Ionicons.glyphMap;
  color: any;
}) {
  return (
    <Ionicons
      name={focused ? activeName : name}
      size={24}
      color={color}
    />
  );
}

function GlassTabBarBackground() {
  const { colors, isDark, glassIntensity, elevation } = useTheme();

  if (glassIntensity === 'off') {
    return (
      <View
        style={[
          StyleSheet.absoluteFill,
          {
            backgroundColor: colors.surface,
            borderRadius: Radius.xl,
            borderWidth: 1,
            borderColor: colors.border,
            ...elevation.floating,
          },
        ]}
      />
    );
  }

  const rawBlur = isDark ? Glass.blur.header.dark : Glass.blur.header.light;
  const blurAmount = glassIntensity === 'reduced' ? Math.round(rawBlur * 0.5) : rawBlur;

  return (
    <View
      style={[
        StyleSheet.absoluteFill,
        {
          borderRadius: Radius.xl,
          overflow: 'hidden',
          backgroundColor: colors.glassTint,
          borderWidth: 1,
          borderColor: colors.glassBorder,
          ...(Platform.OS === 'web'
            ? {
                backdropFilter: `blur(${blurAmount}px)`,
                WebkitBackdropFilter: `blur(${blurAmount}px)`,
              }
            : {}),
          ...elevation.floating,
        },
      ]}
    >
      <BlurView
        intensity={blurAmount}
        tint={isDark ? 'dark' : 'light'}
        style={StyleSheet.absoluteFill}
      />
      <View
        style={[
          StyleSheet.absoluteFill,
          { backgroundColor: colors.glassTint },
        ]}
      />
      <View
        style={[
          styles.highlightSheen,
          { backgroundColor: colors.glassHighlight },
        ]}
      />
    </View>
  );
}

export default function ReviewerLayout() {
  const { colors } = useTheme();

  return (
    <Tabs
      safeAreaInsets={{ bottom: 0, top: 0, left: 0, right: 0 }}
      screenOptions={{
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textSecondary,
        tabBarLabelStyle: {
          fontFamily: TypographyScale.caption.fontFamily,
          fontSize: 11,
          fontWeight: '600',
        },
        tabBarItemStyle: {
          justifyContent: 'center',
          alignItems: 'center',
        },
        tabBarStyle: {
          position: 'absolute',
          bottom: Platform.OS === 'ios' ? 28 : 20,
          left: 16,
          right: 16,
          height: 64,
          borderRadius: Radius.xl,
          borderTopWidth: 0,
          borderWidth: 0,
          backgroundColor: 'transparent',
          elevation: 0,
          shadowOpacity: 0,
          paddingBottom: 8,
          paddingTop: 8,
          ...(Platform.OS === 'web'
            ? {
                maxWidth: 580,
                marginHorizontal: 'auto',
              }
            : {}),
        },
        tabBarBackground: () => <GlassTabBarBackground />,
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
      <Tabs.Screen
        name="dashboard"
        options={{
          title: 'Dashboard',
          tabBarIcon: ({ focused, color }) => (
            <TabBarIcon
              focused={focused}
              name="grid-outline"
              activeName="grid"
              color={color}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="case/[id]"
        options={{
          href: null,
          headerShown: false,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ focused, color }) => (
            <TabBarIcon
              focused={focused}
              name="person-outline"
              activeName="person"
              color={color}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          href: null,
          title: 'Settings',
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  highlightSheen: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 1,
  },
});
