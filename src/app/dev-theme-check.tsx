/**
 * Dev Theme Check — throwaway screen for verifying U0 theming foundation.
 *
 * Renders GlassCard, a themed Button, and text at every Typography token
 * in both Light and Dark modes. Delete before U6 closeout or keep behind
 * a dev flag.
 *
 * Route: /dev-theme-check
 */

import React from 'react';
import {
  ScrollView,
  View,
  Text,
  StyleSheet,
  Pressable,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Screen } from '@/components/ui/Screen';
import { GlassCard } from '@/components/ui/GlassCard';
import { GlassHeader } from '@/components/ui/GlassHeader';
import { useTheme } from '@/hooks/use-theme';
import { TypographyScale, Spacing, Radius } from '@/constants/theme';
import type { ThemeMode } from '@/store/settingsStore';

export default function DevThemeCheck() {
  const { colors, elevation, isDark, mode, setMode, reduceMotion, glassIntensity } = useTheme();
  const router = useRouter();

  const modes: ThemeMode[] = ['system', 'light', 'dark'];

  return (
    <Screen>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Header */}
        <Text style={[TypographyScale.h1, { color: colors.textPrimary, marginBottom: Spacing.xs }]}>
          🎨 Theme Check
        </Text>
        <Text style={[TypographyScale.body, { color: colors.textSecondary, marginBottom: Spacing.lg }]}>
          Mode: {mode} | isDark: {String(isDark)} | Glass: {glassIntensity} | ReduceMotion: {String(reduceMotion)}
        </Text>

        {/* Theme mode switcher */}
        <GlassCard style={styles.section}>
          <View style={styles.sectionPadding}>
            <Text style={[TypographyScale.h3, { color: colors.textPrimary, marginBottom: Spacing.sm }]}>
              Theme Mode
            </Text>
            <View style={styles.modeRow}>
              {modes.map((m) => (
                <Pressable
                  key={m}
                  onPress={() => setMode(m)}
                  style={[
                    styles.modeButton,
                    {
                      backgroundColor: mode === m ? colors.primary : colors.surfaceSunken,
                      borderRadius: Radius.md,
                    },
                  ]}
                >
                  <Text
                    style={[
                      TypographyScale.button,
                      { color: mode === m ? colors.textOnPrimary : colors.textPrimary },
                    ]}
                  >
                    {m.charAt(0).toUpperCase() + m.slice(1)}
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>
        </GlassCard>

        {/* Typography scale */}
        <GlassCard style={styles.section}>
          <View style={styles.sectionPadding}>
            <Text style={[TypographyScale.h3, { color: colors.textPrimary, marginBottom: Spacing.sm }]}>
              Typography Scale
            </Text>
            {Object.entries(TypographyScale).map(([name, token]) => (
              <View key={name} style={styles.typographyRow}>
                <Text style={[TypographyScale.caption, { color: colors.textTertiary, width: 80 }]}>
                  {name}
                </Text>
                <Text style={[token, { color: colors.textPrimary, flex: 1 }]}>
                  The quick brown fox
                </Text>
              </View>
            ))}
          </View>
        </GlassCard>

        {/* Color swatches */}
        <GlassCard style={styles.section}>
          <View style={styles.sectionPadding}>
            <Text style={[TypographyScale.h3, { color: colors.textPrimary, marginBottom: Spacing.sm }]}>
              Color Tokens
            </Text>
            <View style={styles.swatchGrid}>
              {([
                ['primary', colors.primary],
                ['primaryLight', colors.primaryLight],
                ['background', colors.background],
                ['surface', colors.surface],
                ['surfaceRaised', colors.surfaceRaised],
                ['surfaceSunken', colors.surfaceSunken],
                ['riskLow', colors.riskLow],
                ['riskMedium', colors.riskMedium],
                ['riskHigh', colors.riskHigh],
                ['border', colors.border],
                ['borderStrong', colors.borderStrong],
                ['divider', colors.divider],
              ] as const).map(([name, color]) => (
                <View key={name} style={styles.swatchItem}>
                  <View
                    style={[
                      styles.swatch,
                      {
                        backgroundColor: color,
                        borderWidth: 1,
                        borderColor: colors.border,
                      },
                    ]}
                  />
                  <Text style={[TypographyScale.caption, { color: colors.textSecondary }]}>
                    {name}
                  </Text>
                </View>
              ))}
            </View>
          </View>
        </GlassCard>

        {/* Text tokens */}
        <GlassCard style={styles.section}>
          <View style={styles.sectionPadding}>
            <Text style={[TypographyScale.h3, { color: colors.textPrimary, marginBottom: Spacing.sm }]}>
              Text Tokens
            </Text>
            <Text style={[TypographyScale.body, { color: colors.textPrimary, marginBottom: Spacing.xxs }]}>
              textPrimary: Main body text
            </Text>
            <Text style={[TypographyScale.body, { color: colors.textSecondary, marginBottom: Spacing.xxs }]}>
              textSecondary: Labels, helper text
            </Text>
            <Text style={[TypographyScale.body, { color: colors.textTertiary, marginBottom: Spacing.xxs }]}>
              textTertiary: Placeholders, disabled
            </Text>
            <View
              style={[
                styles.onPrimaryBox,
                { backgroundColor: colors.primary, borderRadius: Radius.sm },
              ]}
            >
              <Text style={[TypographyScale.body, { color: colors.textOnPrimary }]}>
                textOnPrimary: On brand fill
              </Text>
            </View>
          </View>
        </GlassCard>

        {/* Glass variants */}
        <Text style={[TypographyScale.h2, { color: colors.textPrimary, marginTop: Spacing.lg, marginBottom: Spacing.sm }]}>
          Glass Variants
        </Text>

        <GlassCard tint="default" elevation="raised" style={styles.section}>
          <View style={styles.sectionPadding}>
            <Text style={[TypographyScale.body, { color: colors.textPrimary }]}>
              Default tint, raised elevation
            </Text>
          </View>
        </GlassCard>

        <GlassCard tint="elevated" elevation="floating" style={styles.section}>
          <View style={styles.sectionPadding}>
            <Text style={[TypographyScale.body, { color: colors.textPrimary }]}>
              Elevated tint, floating elevation
            </Text>
          </View>
        </GlassCard>

        <GlassCard borderStrong elevation="raised" style={styles.section}>
          <View style={styles.sectionPadding}>
            <Text style={[TypographyScale.body, { color: colors.textPrimary }]}>
              Strong border (critical data card)
            </Text>
          </View>
        </GlassCard>

        {/* Elevation comparison */}
        <Text style={[TypographyScale.h2, { color: colors.textPrimary, marginTop: Spacing.lg, marginBottom: Spacing.sm }]}>
          Elevation Levels
        </Text>

        {(['flat', 'raised', 'floating', 'overlay'] as const).map((level) => (
          <GlassCard key={level} elevation={level} style={styles.section}>
            <View style={styles.sectionPadding}>
              <Text style={[TypographyScale.body, { color: colors.textPrimary }]}>
                {level}
              </Text>
            </View>
          </GlassCard>
        ))}

        {/* Themed button demo */}
        <Text style={[TypographyScale.h2, { color: colors.textPrimary, marginTop: Spacing.lg, marginBottom: Spacing.sm }]}>
          Themed Button (inline demo)
        </Text>

        <Pressable
          style={({ pressed }) => [
            styles.primaryButton,
            {
              backgroundColor: colors.primary,
              borderRadius: Radius.md,
              opacity: pressed ? 0.9 : 1,
              transform: [{ scale: pressed ? 0.96 : 1 }],
              ...elevation.raised,
            },
          ]}
        >
          <Text style={[TypographyScale.button, { color: colors.textOnPrimary }]}>
            Primary Button
          </Text>
        </Pressable>

        <Pressable
          onPress={() => router.back()}
          style={({ pressed }) => [
            styles.primaryButton,
            {
              backgroundColor: 'transparent',
              borderRadius: Radius.md,
              borderWidth: 1.5,
              borderColor: colors.primary,
              opacity: pressed ? 0.8 : 1,
              marginTop: Spacing.sm,
            },
          ]}
        >
          <Text style={[TypographyScale.button, { color: colors.primary }]}>
            ← Go Back
          </Text>
        </Pressable>

        {/* Numeric display demo */}
        <GlassCard borderStrong style={[styles.section, { marginTop: Spacing.lg }]}>
          <View style={[styles.sectionPadding, { alignItems: 'center' }]}>
            <Text style={[TypographyScale.caption, { color: colors.textSecondary }]}>
              Risk Score (numericLg token)
            </Text>
            <Text style={[TypographyScale.numericLg, { color: colors.riskMedium }]}>
              72
            </Text>
          </View>
        </GlassCard>

        {/* GlassHeader demo */}
        <Text style={[TypographyScale.h2, { color: colors.textPrimary, marginTop: Spacing.lg, marginBottom: Spacing.sm }]}>
          GlassHeader Demo
        </Text>
        <GlassHeader style={styles.headerDemo}>
          <View style={styles.headerContent}>
            <Text style={[TypographyScale.h3, { color: colors.textPrimary }]}>
              Translucent Header
            </Text>
          </View>
        </GlassHeader>

        <View style={{ height: Spacing.xxl }} />
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  scroll: {
    flex: 1,
  },
  scrollContent: {
    padding: Spacing.md,
  },
  section: {
    marginBottom: Spacing.sm,
  },
  sectionPadding: {
    padding: Spacing.md,
  },
  modeRow: {
    flexDirection: 'row',
    gap: Spacing.xs,
  },
  modeButton: {
    flex: 1,
    paddingVertical: Spacing.sm,
    alignItems: 'center',
  },
  typographyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.xxs,
  },
  swatchGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  swatchItem: {
    alignItems: 'center',
    width: 72,
  },
  swatch: {
    width: 48,
    height: 48,
    borderRadius: 8,
    marginBottom: Spacing.xxs,
  },
  onPrimaryBox: {
    padding: Spacing.sm,
    marginTop: Spacing.xs,
  },
  primaryButton: {
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerDemo: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  headerContent: {
    padding: Spacing.md,
  },
});
